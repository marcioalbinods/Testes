import PptxGenJS from 'pptxgenjs';
import type { Deck, ProjectForm } from '../types';
import { buildGuide, notesFor } from '../engine/guide';
import { layoutDeck } from '../engine/layout';
import { BULLET_INDENT, PPTX_FONT, type Prim } from '../engine/prims';
import { themeById } from '../engine/themes';
import { fixText } from '../engine/text';
import { iconPng } from './icons';

const transparency = (alpha?: number) => Math.round((1 - (alpha ?? 1)) * 100);

export async function exportPptx(deck: Deck, form: ProjectForm): Promise<Blob> {
  const th = themeById(deck.themeId);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck.slides[0]?.title ?? 'TCA';
  pptx.subject = 'Trabalho Colaborativo de Autoria';
  pptx.author = form.groupName.trim() || form.members.map((m) => m.name).filter(Boolean).join(', ') || 'Grupo do TCA';
  pptx.company = form.school.trim();

  const pages = layoutDeck(deck.slides, th, fixText(form.theme) || 'Nosso tema');
  const guide = buildGuide(form, deck);

  for (let i = 0; i < pages.length; i++) {
    const slide = pptx.addSlide();
    slide.background = { color: th.bg };
    for (const p of pages[i]) await addPrim(pptx, slide, p);
    const sec = guide.sections[i];
    if (sec) slide.addNotes(notesFor(sec));
  }
  return (await pptx.write({ outputType: 'blob' })) as Blob;
}

async function addPrim(pptx: PptxGenJS, slide: PptxGenJS.Slide, p: Prim) {
  switch (p.t) {
    case 'rect': {
      slide.addShape(p.r ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
        x: p.x, y: p.y, w: p.w, h: p.h,
        fill: p.fill ? { color: p.fill, transparency: transparency(p.alpha) } : { color: 'FFFFFF', transparency: 100 },
        line: p.line ? { color: p.line, width: p.lineW ?? 1, dashType: p.dash ? 'dash' : 'solid' } : { type: 'none' },
        rectRadius: p.r,
        rotate: p.rot,
      });
      return;
    }
    case 'ellipse': {
      slide.addShape(pptx.ShapeType.ellipse, {
        x: p.x, y: p.y, w: p.w, h: p.h,
        fill: p.fill ? { color: p.fill, transparency: transparency(p.alpha) } : { color: 'FFFFFF', transparency: 100 },
        line: p.line ? { color: p.line, width: p.lineW ?? 1 } : { type: 'none' },
        rotate: p.rot,
      });
      return;
    }
    case 'text': {
      const last = p.paras.length - 1;
      const runs: PptxGenJS.TextProps[] = p.paras.map((q, k) => {
        const size = q.size ?? p.size;
        return {
          text: q.text,
          options: {
            bold: q.bold ?? (p.font === 'display' || p.bold),
            italic: q.italic,
            color: q.color ?? p.color,
            fontSize: size,
            bullet: q.bullet ? { indent: Math.round(BULLET_INDENT * 72) } : false,
            breakLine: k < last,
            hyperlink: q.link ? { url: q.link } : undefined,
            paraSpaceBefore: k ? Math.round((p.gap ?? 0.35) * size) : 0,
          },
        };
      });
      slide.addText(runs, {
        x: p.x, y: p.y, w: p.w, h: p.h,
        fontFace: PPTX_FONT[p.font],
        fontSize: p.size,
        color: p.color,
        align: p.align ?? 'left',
        valign: p.valign ?? 'top',
        margin: 0,
        lineSpacingMultiple: Math.max(0.85, (p.lineH ?? 1.18) / 1.2),
        charSpacing: p.bold && p.size <= 12 ? 1 : undefined,
        fit: 'none',
        wrap: true,
      });
      return;
    }
    case 'icon': {
      try {
        const data = await iconPng(p.name, p.color);
        slide.addImage({ data, x: p.x, y: p.y, w: p.s, h: p.s });
      } catch {
        /* ícone é decorativo: se falhar, o slide continua correto */
      }
      return;
    }
    case 'line': {
      slide.addShape(pptx.ShapeType.line, {
        x: Math.min(p.x1, p.x2), y: Math.min(p.y1, p.y2), w: Math.abs(p.x2 - p.x1), h: Math.abs(p.y2 - p.y1),
        line: { color: p.color, width: p.w, dashType: p.dash ? 'dash' : 'solid', endArrowType: p.arrow ? 'triangle' : undefined },
      });
      return;
    }
    case 'bars': {
      const isPct = p.data.every((d) => d.display.endsWith('%'));
      slide.addChart(pptx.ChartType.bar, [{ name: 'Dados', labels: p.data.map((d) => d.label), values: p.data.map((d) => d.value) }], {
        x: p.x, y: p.y, w: p.w, h: p.h,
        barDir: 'bar',
        chartColors: [p.color],
        showValue: true,
        dataLabelColor: p.ink,
        dataLabelFontSize: 14,
        dataLabelFontBold: true,
        dataLabelFormatCode: isPct ? '0.##"%"' : '#,##0.##',
        catAxisLabelColor: p.ink,
        catAxisLabelFontSize: 12,
        catAxisLabelFontFace: 'Calibri',
        catAxisOrientation: 'maxMin' as 'minMax',
        catAxisLineShow: false,
        valAxisHidden: true,
        valAxisMinVal: 0,
        valGridLine: { style: 'none' },
        barGapWidthPct: 70,
        showLegend: false,
      });
      return;
    }
  }
}
