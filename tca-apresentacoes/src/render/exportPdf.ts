import { jsPDF } from 'jspdf';
import { getFontEmbedCSS, toJpeg } from 'html-to-image';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { Deck, ProjectForm } from '../types';
import type { Guide } from '../engine/guide';
import { layoutDeck } from '../engine/layout';
import { SH, SW } from '../engine/prims';
import { themeById } from '../engine/themes';
import { fixText, joinNames } from '../engine/text';
import { MEDIA_OPTIONS, mediaName } from '../data/constants';
import { buildReferences } from '../engine/references';
import { SlideStatic, SLIDE_PX_H, SLIDE_PX_W } from './SlideView';

// ---------------- PDF dos slides (imagem fiel à prévia + links clicáveis) ----------------

export async function exportSlidesPdf(deck: Deck, form: ProjectForm, onProgress?: (n: number, total: number) => void): Promise<Blob> {
  const th = themeById(deck.themeId);
  const pages = layoutDeck(deck.slides, th, fixText(form.theme) || 'Nosso tema');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [SW, SH], compress: true });
  pdf.setProperties({ title: deck.slides[0]?.title ?? 'TCA', subject: 'Trabalho Colaborativo de Autoria' });

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, { position: 'fixed', left: '-20000px', top: '0', width: SLIDE_PX_W + 'px', height: SLIDE_PX_H + 'px' });
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await document.fonts?.ready;
    let fontEmbedCSS: string | undefined;
    for (let i = 0; i < pages.length; i++) {
      onProgress?.(i + 1, pages.length);
      flushSync(() => root.render(createElement(SlideStatic, { prims: pages[i] })));
      const node = host.firstElementChild as HTMLElement;
      if (fontEmbedCSS === undefined) fontEmbedCSS = await getFontEmbedCSS(node).catch(() => '');
      const img = await toJpeg(node, { quality: 0.93, pixelRatio: 1.6, width: SLIDE_PX_W, height: SLIDE_PX_H, fontEmbedCSS, backgroundColor: '#' + th.bg });
      if (i > 0) pdf.addPage([SW, SH], 'landscape');
      pdf.addImage(img, 'JPEG', 0, 0, SW, SH);
      for (const p of pages[i]) if (p.t === 'text' && p.href) pdf.link(p.x, p.y, p.w, Math.min(p.h, 0.8), { url: p.href });
    }
  } finally {
    root.unmount();
    host.remove();
  }
  return pdf.output('blob');
}

// ---------------- Documentos de texto (guia e resumo) ----------------

// As fontes padrão do PDF não têm alguns símbolos tipográficos.
const safe = (s: string) =>
  s
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/…/g, '...')
    .replace(/[•·]/g, '-')
    .replace(/[^\u0000-ÿ]/g, '');

const C = { ink: [27, 26, 63], muted: [93, 96, 133], brand: [54, 81, 212], violet: [123, 63, 228], coral: [222, 92, 60], line: [221, 225, 242], soft: [240, 243, 253] } as const;

class Writer {
  pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  y = 20;
  readonly W = 210;
  readonly H = 297;
  readonly L = 18;
  readonly R = 18;
  constructor(private footerText: string) {}
  get width() {
    return this.W - this.L - this.R;
  }
  color(c: readonly number[]) {
    this.pdf.setTextColor(c[0], c[1], c[2]);
  }
  ensure(h: number) {
    if (this.y + h > this.H - 18) this.newPage();
  }
  newPage() {
    this.pdf.addPage();
    this.y = 20;
  }
  lines(text: string, size: number, w = this.width) {
    this.pdf.setFontSize(size);
    return this.pdf.splitTextToSize(safe(text), w) as string[];
  }
  title(text: string, sub?: string) {
    this.pdf.setFillColor(C.brand[0], C.brand[1], C.brand[2]);
    this.pdf.rect(0, 0, this.W, 6, 'F');
    this.pdf.setFillColor(C.violet[0], C.violet[1], C.violet[2]);
    this.pdf.rect(this.W * 0.62, 0, this.W * 0.38, 6, 'F');
    this.pdf.setFont('helvetica', 'bold');
    const ls = this.lines(text, 22);
    this.color(C.ink);
    this.pdf.text(ls, this.L, this.y + 4);
    this.y += ls.length * 9 + 3;
    if (sub) {
      this.pdf.setFont('helvetica', 'normal');
      const s = this.lines(sub, 11);
      this.color(C.muted);
      this.pdf.text(s, this.L, this.y);
      this.y += s.length * 5 + 4;
    }
  }
  h2(text: string, eyebrow?: string) {
    this.ensure(22);
    this.y += 4;
    if (eyebrow) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8.5);
      this.color(C.brand);
      this.pdf.text(safe(eyebrow.toUpperCase()), this.L, this.y);
      this.y += 5;
    }
    this.pdf.setFont('helvetica', 'bold');
    const ls = this.lines(text, 15);
    this.color(C.ink);
    this.pdf.text(ls, this.L, this.y + 1);
    this.y += ls.length * 6.5 + 1;
    this.pdf.setDrawColor(C.line[0], C.line[1], C.line[2]);
    this.pdf.setLineWidth(0.4);
    this.pdf.line(this.L, this.y, this.W - this.R, this.y);
    this.y += 5;
  }
  label(text: string, color: readonly number[] = C.violet) {
    this.ensure(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9.5);
    this.color(color);
    this.pdf.text(safe(text), this.L, this.y);
    this.y += 5;
  }
  para(text: string, size = 10.5, color: readonly number[] = C.ink, indent = 0) {
    if (!text.trim()) return;
    this.pdf.setFont('helvetica', 'normal');
    const ls = this.lines(text, size, this.width - indent);
    const lh = size * 0.47;
    for (const l of ls) {
      this.ensure(lh);
      this.color(color);
      this.pdf.setFontSize(size);
      this.pdf.text(l, this.L + indent, this.y);
      this.y += lh;
    }
    this.y += 2;
  }
  bullets(items: string[], size = 10.5) {
    for (const it of items.filter(Boolean)) {
      this.pdf.setFont('helvetica', 'normal');
      const ls = this.lines(it, size, this.width - 6);
      const lh = size * 0.47;
      this.ensure(lh * Math.min(ls.length, 2));
      this.pdf.setFillColor(C.brand[0], C.brand[1], C.brand[2]);
      this.pdf.circle(this.L + 1.5, this.y - 1.2, 0.8, 'F');
      for (const l of ls) {
        this.ensure(lh);
        this.color(C.ink);
        this.pdf.setFontSize(size);
        this.pdf.text(l, this.L + 6, this.y);
        this.y += lh;
      }
      this.y += 1.2;
    }
    this.y += 1.5;
  }
  box(lines: string[], color: readonly number[] = C.soft) {
    const all = lines.flatMap((l) => this.lines(l, 10.5, this.width - 10));
    const h = all.length * 5 + 7;
    this.ensure(Math.min(h, 60));
    this.pdf.setFillColor(color[0], color[1], color[2]);
    this.pdf.roundedRect(this.L, this.y - 4, this.width, h, 3, 3, 'F');
    this.pdf.setFont('helvetica', 'normal');
    this.color(C.ink);
    this.pdf.setFontSize(10.5);
    let yy = this.y + 1.5;
    for (const l of all) {
      if (yy > this.H - 18) {
        this.newPage();
        yy = this.y;
      }
      this.pdf.text(l, this.L + 5, yy);
      yy += 5;
    }
    this.y = yy + 4;
  }
  finish() {
    const n = this.pdf.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      this.pdf.setPage(i);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8.5);
      this.color(C.muted);
      this.pdf.text(safe(this.footerText), this.L, this.H - 9);
      this.pdf.text(`${i} / ${n}`, this.W - this.R, this.H - 9, { align: 'right' });
    }
    return this.pdf.output('blob');
  }
}

const groupLine = (f: ProjectForm) =>
  [f.groupName.trim() && 'Grupo ' + f.groupName.trim().replace(/^grupo\s+/i, ''), [f.grade, f.className].filter(Boolean).join(' '), f.period, f.school].filter(Boolean).join(' | ');

export function exportGuidePdf(guide: Guide, form: ProjectForm, title: string): Blob {
  const w = new Writer(`Guia de apresentação - ${title}`);
  w.title('Guia de apresentação do grupo', `${title}\n${groupLine(form)}`);
  w.box(['Este guia ajuda o grupo a estudar e a explicar o trabalho com as próprias palavras. As respostas sugeridas usam apenas o que vocês escreveram: confiram, completem e conversem sobre elas.']);
  w.label('Dicas gerais', C.brand);
  w.bullets(guide.general);
  for (const s of guide.sections) {
    w.h2(s.title, `Slide ${s.number}${s.presenter ? ' - quem apresenta (sugestão): ' + s.presenter : ''}`);
    w.label('1. O que precisamos explicar?');
    w.para(s.explain);
    if (s.important.length) {
      w.label('2. Informações mais importantes');
      w.bullets(s.important);
    }
    w.label('3. Como explicar com nossas palavras');
    w.bullets(s.ownWords);
    w.label('4. Conceitos que precisamos compreender');
    w.para(s.concepts.length ? s.concepts.join(', ') + '. Pesquisem o significado e saibam dar um exemplo.' : 'Releiam as fontes e anotem as palavras que ainda não entendem bem.');
    w.label('5. Mensagem principal');
    w.box([s.message]);
  }
  w.newPage();
  w.title('Perguntas que os professores podem fazer', 'Usem as sugestões para estudar, não para decorar.');
  guide.questions.forEach((q, i) => {
    w.h2(q.q, `Pergunta ${i + 1}`);
    w.label(q.hasAnswer ? 'Com base no que vocês escreveram' : 'Atenção', q.hasAnswer ? C.violet : C.coral);
    w.para(q.answer, 10.5, q.hasAnswer ? C.ink : C.coral);
    w.label('Para se preparar', C.brand);
    w.para(q.tip, 10, C.muted);
  });
  return w.finish();
}

export function exportSummaryPdf(f: ProjectForm, title: string): Blob {
  const w = new Writer(`Resumo da pesquisa - ${title}`);
  w.title('Resumo da pesquisa do TCA', `${title}\n${groupLine(f)}`);
  const qa = (q: string, a: string) => {
    w.label(q);
    w.para(fixText(a) || '(não preenchido)', 10.5, a.trim() ? C.ink : C.muted);
  };
  w.h2('Identificação do grupo', 'Etapa 1');
  qa('Escola', f.school);
  qa('Ano e turma', [f.grade, f.className].filter(Boolean).join(' '));
  qa('Período', f.period);
  if (f.groupName.trim()) qa('Nome do grupo', f.groupName);
  qa('Integrantes', joinNames(f.members.map((m) => m.name.trim()).filter(Boolean)));
  w.h2('Tema e problema de pesquisa', 'Etapa 2');
  if (f.workTitle.trim()) qa('Título do trabalho', f.workTitle);
  qa('Tema', f.theme);
  qa('Problema investigado', f.problem);
  qa('Por que escolhemos o tema', f.whyChosen);
  qa('Por que é importante para a sociedade', f.whyImportant);
  qa('Quem é afetado', f.affected);
  qa('Onde acontece', [f.whereScope.join(', '), f.whereDetail].filter(Boolean).join('. '));
  w.h2('O que descobrimos', 'Etapa 3');
  w.label('Descobertas');
  if (f.discoveries.length) w.bullets(f.discoveries.map((d) => fixText(d.text)));
  else w.para('(nenhuma descoberta registrada)', 10.5, C.muted);
  qa('Causas', f.causes);
  qa('Consequências', f.consequences);
  qa('Dados e estatísticas', f.dataText);
  if (f.dataPoints.length) w.bullets(f.dataPoints.map((d) => `${d.value}${d.unit === '%' ? '%' : d.unit ? ' ' + d.unit : ''} - ${d.label}${d.origin ? ' (fonte: ' + d.origin + ')' : ''}`));
  qa('O que mais surpreendeu', f.surprising);
  qa('O que aprendemos', f.learned);
  qa('Conclusão do grupo', f.conclusion);
  w.h2('Fontes de informação', 'Etapa 4');
  const refs = buildReferences(f.sources);
  if (refs.length) w.bullets(refs.map((r) => r.text + (r.needsCheck.length ? ` [conferir: falta ${r.needsCheck.join(', ')}]` : '')));
  else w.para('(nenhuma fonte registrada)', 10.5, C.muted);
  f.sources.filter((s) => s.found.trim()).forEach((s) => qa(`O que encontramos em ${s.site || s.title}`, s.found));
  w.h2('Intervenção', 'Etapa 5');
  qa('O que queremos mudar', f.change);
  qa('Intervenção proposta', f.intervention);
  qa('Objetivo', f.objective);
  qa('Público', f.audience);
  qa('Como vamos realizar', f.how);
  qa('Recursos necessários', f.resources);
  qa('Resultados esperados', f.results);
  qa('Mídias escolhidas', f.media.map((m) => (m === 'outra' ? mediaName(m, f.otherMedia) : MEDIA_OPTIONS.find((o) => o.id === m)?.name ?? m)).join(', '));
  qa('Por que essas mídias', f.mediaWhy);
  qa('Como serão usadas', f.mediaHow);
  qa('Mensagem para o público', f.mediaMessage);
  qa('Resultado esperado com as mídias', f.mediaResult);
  return w.finish();
}
