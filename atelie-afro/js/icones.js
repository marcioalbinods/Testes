/* ATELIÊ AFRO — ícones (SVG embutido, sem dependências externas). */
(function (AA) {
  'use strict';
  const S = (inner, extra) => `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"${extra || ''}>${inner}</svg>`;
  AA.ICONES = {
    voltar: S('<path d="M28 10L14 24l14 14"/><path d="M15 24h22"/>'),
    casa: S('<path d="M8 22L24 8l16 14"/><path d="M12 19v20h24V19"/><path d="M20 39V28h8v11"/>'),
    grade: S('<rect x="7" y="7" width="14" height="14" rx="3"/><rect x="27" y="7" width="14" height="14" rx="3"/><rect x="7" y="27" width="14" height="14" rx="3"/><rect x="27" y="27" width="14" height="14" rx="3"/>'),
    pincel: S('<path d="M36 6l6 6-17 17-6-6z" fill="currentColor" fill-opacity=".25"/><path d="M19 23c-6 0-9 4-9 9 0 4-3 6-4 7 9 2 19-1 19-10"/>'),
    balde: S('<path d="M8 22L22 8l16 16-14 14z" fill="currentColor" fill-opacity=".25"/><path d="M14 16l10 10"/><path d="M40 30c0 0 4 5 4 8a4 4 0 0 1-8 0c0-3 4-8 4-8z" fill="currentColor"/>'),
    borracha: S('<path d="M30 8l12 12-18 18H14L6 30z" fill="currentColor" fill-opacity=".2"/><path d="M18 20l12 12"/><path d="M14 38h28"/>'),
    desfazer: S('<path d="M16 12L8 20l8 8"/><path d="M8 20h20a12 12 0 0 1 0 24h-8"/>'),
    refazer: S('<path d="M32 12l8 8-8 8"/><path d="M40 20H20a12 12 0 0 0 0 24h8"/>'),
    zoommais: S('<circle cx="21" cy="21" r="13"/><path d="M31 31l10 10M21 15v12M15 21h12"/>'),
    zoommenos: S('<circle cx="21" cy="21" r="13"/><path d="M31 31l10 10M15 21h12"/>'),
    ajustar: S('<path d="M8 17V8h9M31 8h9v9M40 31v9h-9M17 40H8v-9"/><rect x="16" y="16" width="16" height="16" rx="3"/>'),
    lixo: S('<path d="M8 13h32M19 13V8h10v5M12 13l2 27h20l2-27"/><path d="M20 20v13M28 20v13"/>'),
    salvar: S('<path d="M24 6v24M14 20l10 10 10-10"/><path d="M8 34v6h32v-6"/>'),
    estrela: S('<path d="M24 5l5.6 12.4L43 19l-10 9.3 2.7 13.4L24 35l-11.7 6.7L15 28.3 5 19l13.4-1.6z" fill="currentColor" fill-opacity=".35"/>'),
    telacheia: S('<path d="M8 17V8h9M31 8h9v9M40 31v9h-9M17 40H8v-9"/>'),
    sairtela: S('<path d="M17 8v9H8M40 17h-9V8M31 40v-9h9M8 31h9v9"/>'),
    somon: S('<path d="M8 19h8l10-9v28l-10-9H8z" fill="currentColor" fill-opacity=".25"/><path d="M32 17a9 9 0 0 1 0 14M37 12a16 16 0 0 1 0 24"/>'),
    somoff: S('<path d="M8 19h8l10-9v28l-10-9H8z" fill="currentColor" fill-opacity=".25"/><path d="M33 18l10 12M43 18L33 30"/>'),
    check: S('<path d="M10 25l9 9 19-20"/>', ' stroke-width="6"'),
    x: S('<path d="M12 12l24 24M36 12L12 36"/>', ' stroke-width="6"'),
    engrenagem: S('<circle cx="24" cy="24" r="6"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/><circle cx="24" cy="24" r="13"/>'),
    novo: S('<circle cx="24" cy="24" r="16" stroke-dasharray="5 5"/>'),
    andamento: S('<path d="M36 6l6 6-17 17-6-6z" fill="currentColor" fill-opacity=".3"/><path d="M19 23c-6 0-9 4-9 9 0 4-3 6-4 7 9 2 19-1 19-10"/>')
  };
  AA.icone = (nome) => AA.ICONES[nome] || '';
  AA.preencherIcones = (raiz) => {
    (raiz || document).querySelectorAll('.ico[data-ico]').forEach((el) => { el.innerHTML = AA.icone(el.dataset.ico); });
  };
})(window.AA = window.AA || {});
