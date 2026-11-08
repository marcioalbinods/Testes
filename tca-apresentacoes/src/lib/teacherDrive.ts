// Envio do trabalho para o Google Drive do professor (via Google Apps Script).
// O endereço do receptor fica no arquivo config.json, ao lado do index.html.
import type { Deck, ProjectForm } from '../types';
import { MEDIA_OPTIONS, mediaName } from '../data/constants';
import { buildReferences } from '../engine/references';
import { workTitle } from '../engine/buildDeck';
import { insideArtifact, slug } from './save';

export type DriveStatus = { kind: 'off'; reason: 'artifact' | 'not-configured' } | { kind: 'on'; url: string };

// Aceita contas pessoais (/macros/s/…) e institucionais (/a/macros/dominio/s/…).
const VALID = /^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;

/** Lê o config.json publicado junto com o site. */
export async function loadDriveStatus(): Promise<DriveStatus> {
  if (insideArtifact() || !/^https?:$/.test(location.protocol)) return { kind: 'off', reason: insideArtifact() ? 'artifact' : 'not-configured' };
  try {
    const r = await fetch('./config.json', { cache: 'no-store' });
    if (!r.ok) return { kind: 'off', reason: 'not-configured' };
    const cfg = (await r.json()) as { envioUrl?: string };
    const url = (cfg.envioUrl ?? '').trim();
    return VALID.test(url) ? { kind: 'on', url } : { kind: 'off', reason: 'not-configured' };
  } catch {
    return { kind: 'off', reason: 'not-configured' };
  }
}

const toBase64 = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(',')[1] ?? '');
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(blob);
  });

const join = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean).join('\n');

/** Colunas da planilha do professor (uma linha por envio). */
export function sheetFields(f: ProjectForm): Record<string, string> {
  return {
    Turma: f.className,
    Período: f.period,
    'Prof. Orientador': f.advisor,
    Grupo: f.groupName,
    Integrantes: join(f.members.map((m) => m.name)),
    Tema: f.theme,
    'Título do trabalho': f.workTitle,
    Problema: f.problem,
    'Por que escolheram': f.whyChosen,
    'Importância para a sociedade': f.whyImportant,
    'Quem é afetado': f.affected,
    'Onde acontece': join([f.whereScope.join(', '), f.whereDetail]),
    Descobertas: join(f.discoveries.map((d, i) => `${i + 1}. ${d.text}`)),
    Causas: f.causes,
    Consequências: f.consequences,
    'Dados e estatísticas': join([f.dataText, ...f.dataPoints.map((d) => `${d.value}${d.unit === '%' ? '%' : d.unit ? ' ' + d.unit : ''} ${d.label}${d.origin ? ' (' + d.origin + ')' : ''}`)]),
    'Mais surpreendente': f.surprising,
    'O que aprenderam': f.learned,
    Conclusão: f.conclusion,
    Fontes: join(buildReferences(f.sources).map((r) => r.text)),
    'O que querem mudar': f.change,
    Intervenção: f.intervention,
    Objetivo: f.objective,
    Público: f.audience,
    'Como vão realizar': f.how,
    Recursos: f.resources,
    'Resultados esperados': f.results,
    Mídias: f.media.map((m) => (m === 'outra' ? mediaName(m, f.otherMedia) : MEDIA_OPTIONS.find((o) => o.id === m)?.name ?? m)).join(', '),
    'Por que essas mídias': f.mediaWhy,
    'Como usarão as mídias': f.mediaHow,
    Mensagem: f.mediaMessage,
    'Resultado esperado com as mídias': f.mediaResult,
  };
}

export interface SendResult {
  folderUrl?: string;
}

/** Monta os arquivos e envia tudo para o receptor do professor. */
export async function sendToTeacher(url: string, form: ProjectForm, deck: Deck, backup: unknown): Promise<SendResult> {
  const [{ exportPptx }, { exportGuidePdf }, { buildGuide }] = await Promise.all([import('../render/exportPptx'), import('../render/exportPdf'), import('../engine/guide')]);
  const title = workTitle(form);
  const base = `TCA-${slug(form.className)}-${slug(form.groupName || form.members.find((m) => m.name.trim())?.name || 'grupo')}`;
  const pptx = await exportPptx(deck, form);
  const guide = exportGuidePdf(buildGuide(form, deck), form, title);
  const json = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const payload = {
    app: 'tca-da-pesquisa-a-intervencao',
    turma: form.className,
    grupo: form.groupName.trim(),
    integrantes: form.members.map((m) => m.name.trim()).filter(Boolean),
    tema: form.theme.trim(),
    campos: sheetFields(form),
    arquivos: [
      { name: `${base}-slides.pptx`, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', data: await toBase64(pptx) },
      { name: `${base}-guia.pdf`, mimeType: 'application/pdf', data: await toBase64(guide) },
      { name: `${base}-copia-do-trabalho.json`, mimeType: 'application/json', data: await toBase64(json) },
    ],
  };
  // text/plain evita a verificação prévia (CORS) que o Google Apps Script não responde.
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
  let data: { ok?: boolean; pasta?: string; erro?: string } = {};
  try {
    data = await r.json();
  } catch {
    throw new Error('O Drive do professor não respondeu como esperado. Tente de novo em instantes.');
  }
  if (!data.ok) throw new Error('Não foi possível salvar no Drive do professor' + (data.erro ? ': ' + data.erro : '.'));
  return { folderUrl: data.pasta };
}
