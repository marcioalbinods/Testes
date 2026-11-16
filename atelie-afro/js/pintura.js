/* ATELIÊ AFRO — ferramenta de pintura por toque.
 * Cada região do desenho é um <path class="r"> independente: tocar pinta só aquela região.
 * Os contornos pretos são o traço (stroke) da própria região, por isso ficam sempre visíveis.
 */
(function (AA) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const ZMIN = 1, ZMAX = 6;

  const P = {
    desenho: null,
    svg: null,
    regioes: [],
    fills: {},
    desfazer: [],
    refazer: [],
    cor: AA.Salvar.preferencia('cor', '#FF7A00'),
    ferramenta: 'balde',
    z: 1, tx: 0, ty: 0,
    comemorou: false
  };
  AA.Pintura = P;

  /* ---------- abrir um desenho ---------- */
  P.abrir = (d) => {
    P.desenho = d;
    const papel = $('papel');
    papel.innerHTML = AA.svgDe(d);
    P.svg = papel.querySelector('svg');
    P.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    P.regioes = Array.from(P.svg.querySelectorAll('.r'));
    P.regioes.forEach((el, i) => { el.dataset.i = i; });
    const salvo = AA.Salvar.pintura(d.id);
    P.fills = Object.assign({}, salvo.f || {});
    Object.keys(P.fills).forEach((i) => { const el = P.regioes[i]; if (el) el.style.fill = P.fills[i]; });
    P.desfazer = [];
    P.refazer = [];
    P.comemorou = !!salvo.feito;
    P.ajustar();
    P.atualizarBotoes();
    AA.Salvar.guardarUltimo(d.id);
  };

  /* ---------- pintar uma região ---------- */
  const aplicar = (i, cor) => {
    const el = P.regioes[i];
    if (!el) return;
    if (cor) { el.style.fill = cor; P.fills[i] = cor; } else { el.style.fill = ''; delete P.fills[i]; }
  };
  P.pintarRegiao = (el) => {
    const i = +el.dataset.i;
    const de = P.fills[i] || null;
    const para = P.ferramenta === 'borracha' ? null : P.cor;
    if (de === para) return;
    aplicar(i, para);
    P.desfazer.push([{ i, de, para }]);
    if (P.desfazer.length > 300) P.desfazer.shift();
    P.refazer = [];
    if (para) AA.Som.pintar(); else AA.Som.apagar();
    P.salvar();
    P.verificarConclusao();
  };
  P.salvar = () => {
    const d = P.desenho;
    if (!d) return;
    const atual = AA.Salvar.pintura(d.id);
    atual.f = P.fills;
    atual.total = P.regioes.length;
    if (Object.keys(P.fills).length === 0) atual.feito = false;
    AA.Salvar.guardarPintura(d.id, atual);
    P.atualizarBotoes();
  };
  P.progresso = () => (P.regioes.length ? Object.keys(P.fills).length / P.regioes.length : 0);
  P.verificarConclusao = () => {
    // comemora sozinho quando quase todas as regiões já têm cor
    if (!P.comemorou && P.progresso() >= 0.9) { P.comemorou = true; P.concluir(); }
  };
  P.concluir = () => {
    const d = P.desenho;
    const atual = AA.Salvar.pintura(d.id);
    atual.f = P.fills;
    atual.total = P.regioes.length;
    atual.feito = true;
    AA.Salvar.guardarPintura(d.id, atual);
    P.comemorou = true;
    AA.App.festa();
  };

  /* ---------- desfazer / refazer / limpar ---------- */
  P.acaoDesfazer = () => {
    const passo = P.desfazer.pop();
    if (!passo) return;
    passo.slice().reverse().forEach((m) => aplicar(m.i, m.de));
    P.refazer.push(passo);
    AA.Som.desfazer();
    P.salvar();
  };
  P.acaoRefazer = () => {
    const passo = P.refazer.pop();
    if (!passo) return;
    passo.forEach((m) => aplicar(m.i, m.para));
    P.desfazer.push(passo);
    AA.Som.pintar();
    P.salvar();
  };
  P.limpar = () => {
    const passo = Object.keys(P.fills).map((i) => ({ i: +i, de: P.fills[i], para: null }));
    if (!passo.length) return;
    passo.forEach((m) => aplicar(m.i, null));
    P.desfazer.push(passo);
    P.refazer = [];
    P.comemorou = false;
    const atual = AA.Salvar.pintura(P.desenho.id);
    atual.feito = false;
    AA.Salvar.guardarPintura(P.desenho.id, atual);
    AA.Som.apagar();
    P.salvar();
  };
  P.atualizarBotoes = () => {
    $('btn-desfazer').disabled = P.desfazer.length === 0;
    $('btn-refazer').disabled = P.refazer.length === 0;
    $('btn-limpar').disabled = Object.keys(P.fills).length === 0;
  };

  /* ---------- cor e ferramenta ---------- */
  P.escolherCor = (cor, silencioso) => {
    P.cor = cor;
    AA.Salvar.guardarPreferencia('cor', cor);
    if (P.ferramenta !== 'balde') P.escolherFerramenta('balde');
    document.querySelectorAll('.cor').forEach((b) => {
      const sel = b.dataset.cor === cor;
      b.classList.toggle('sel', sel);
      b.setAttribute('aria-checked', sel ? 'true' : 'false');
    });
    $('cor-atual').style.background = cor;
    $('painel').style.setProperty('--cor', cor);
    if (!silencioso) AA.Som.clique();
  };
  P.escolherFerramenta = (f) => {
    P.ferramenta = f;
    document.querySelectorAll('.ferr[data-ferr]').forEach((b) => b.classList.toggle('ativa', b.dataset.ferr === f));
    $('palco').classList.toggle('modo-borracha', f === 'borracha');
    $('cor-atual-ico').innerHTML = AA.icone(f === 'borracha' ? 'borracha' : 'balde');
    $('cor-atual').classList.toggle('apagando', f === 'borracha');
  };

  /* ---------- zoom e movimento ---------- */
  const aplicarTransform = () => {
    const palco = $('palco');
    const w = palco.clientWidth, h = palco.clientHeight;
    const papel = $('papel');
    // o papel é quadrado e ocupa o maior espaço possível
    const lado = Math.max(120, Math.min(w, h) - 16);
    papel.style.setProperty('--lado', lado + 'px');
    // limita o deslocamento para o desenho não sumir da tela
    const pw = papel.offsetWidth * P.z, ph = papel.offsetHeight * P.z;
    const mx = Math.max(0, (pw - w) / 2 + 60), my = Math.max(0, (ph - h) / 2 + 60);
    P.tx = Math.max(-mx, Math.min(mx, P.tx));
    P.ty = Math.max(-my, Math.min(my, P.ty));
    papel.style.transform = `translate(${P.tx}px, ${P.ty}px) scale(${P.z})`;
    $('btn-zoom-menos').disabled = P.z <= ZMIN + 0.001;
    $('btn-zoom-mais').disabled = P.z >= ZMAX - 0.001;
  };
  P.ajustar = () => { P.z = 1; P.tx = 0; P.ty = 0; aplicarTransform(); };
  // zoom mantendo um ponto da tela parado
  P.zoomEm = (fator, cx, cy) => {
    const palco = $('palco');
    const r = palco.getBoundingClientRect();
    const px = (cx == null ? r.left + r.width / 2 : cx) - (r.left + r.width / 2);
    const py = (cy == null ? r.top + r.height / 2 : cy) - (r.top + r.height / 2);
    const nz = Math.max(ZMIN, Math.min(ZMAX, P.z * fator));
    const k = nz / P.z;
    P.tx = px - (px - P.tx) * k;
    P.ty = py - (py - P.ty) * k;
    P.z = nz;
    if (P.z === 1) { P.tx = 0; P.ty = 0; }
    aplicarTransform();
  };

  /* ---------- toque, caneta e mouse ---------- */
  const ptrs = new Map();
  let gesto = null; // {tipo:'toque'|'arrasto'|'pinca', ...}
  const LIMIAR = 12;
  const iniciar = () => {
    const palco = $('palco');
    palco.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button > 0) return;
      try { palco.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ }
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, alvo: e.target });
      if (ptrs.size === 1) gesto = { tipo: 'toque', t0: Date.now(), alvo: e.target, x0: e.clientX, y0: e.clientY, tx0: P.tx, ty0: P.ty };
      else if (ptrs.size === 2) {
        const [a, b] = Array.from(ptrs.values());
        gesto = { tipo: 'pinca', d0: Math.hypot(a.x - b.x, a.y - b.y), z0: P.z, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, tx0: P.tx, ty0: P.ty };
      }
    });
    palco.addEventListener('pointermove', (e) => {
      const p = ptrs.get(e.pointerId);
      if (!p || !gesto) return;
      p.x = e.clientX; p.y = e.clientY;
      if (gesto.tipo === 'pinca' && ptrs.size >= 2) {
        const [a, b] = Array.from(ptrs.values());
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        const alvoZ = Math.max(ZMIN, Math.min(ZMAX, gesto.z0 * (d / (gesto.d0 || 1))));
        P.tx = gesto.tx0 + (cx - gesto.cx);
        P.ty = gesto.ty0 + (cy - gesto.cy);
        const fator = alvoZ / P.z;
        P.zoomEm(fator, cx, cy);
      } else if (gesto.tipo === 'toque' || gesto.tipo === 'arrasto') {
        const dx = e.clientX - gesto.x0, dy = e.clientY - gesto.y0;
        if (gesto.tipo === 'toque' && Math.hypot(dx, dy) > LIMIAR && P.z > 1.001) gesto.tipo = 'arrasto';
        if (gesto.tipo === 'arrasto') { P.tx = gesto.tx0 + dx; P.ty = gesto.ty0 + dy; aplicarTransform(); }
      }
    });
    const fim = (e) => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      ptrs.delete(e.pointerId);
      if (!gesto) return;
      if (gesto.tipo === 'toque' && e.type === 'pointerup' && ptrs.size === 0) {
        const mov = Math.hypot(e.clientX - gesto.x0, e.clientY - gesto.y0);
        if (mov <= LIMIAR * 1.5) {
          // usa o ponto onde o dedo encostou (mais preciso para crianças)
          let alvo = document.elementFromPoint(gesto.x0, gesto.y0);
          if (!alvo || !alvo.closest) alvo = gesto.alvo;
          const reg = alvo && alvo.closest ? alvo.closest('.r') : null;
          if (reg && P.svg && P.svg.contains(reg)) P.pintarRegiao(reg);
        }
      }
      if (ptrs.size === 0) gesto = null;
      else if (ptrs.size === 1) {
        const q = Array.from(ptrs.values())[0];
        gesto = { tipo: 'arrasto', x0: q.x, y0: q.y, tx0: P.tx, ty0: P.ty };
      }
    };
    palco.addEventListener('pointerup', fim);
    palco.addEventListener('pointercancel', fim);
    palco.addEventListener('lostpointercapture', (e) => { if (ptrs.has(e.pointerId)) fim(e); });
    palco.addEventListener('wheel', (e) => { e.preventDefault(); P.zoomEm(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
    palco.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', () => aplicarTransform());
  };

  /* ---------- salvar imagem (PNG) ---------- */
  P.salvarImagem = () => {
    if (!P.svg) return;
    const clone = P.svg.cloneNode(true);
    clone.setAttribute('width', '1200');
    clone.setAttribute('height', '1200');
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 1200; c.height = 1260;
      const g = c.getContext('2d');
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, 1200, 1200);
      g.fillStyle = '#7B2FBE';
      g.font = 'bold 34px sans-serif';
      g.textAlign = 'center';
      g.fillText('Ateliê Afro — 50 desenhos, infinitas cores!', 600, 1240);
      const nome = 'atelie-afro-' + P.desenho.id + '.png';
      const baixar = (href) => {
        const a = document.createElement('a');
        a.href = href; a.download = nome;
        document.body.appendChild(a); a.click(); a.remove();
      };
      if (c.toBlob) c.toBlob((b) => { const u = URL.createObjectURL(b); baixar(u); setTimeout(() => URL.revokeObjectURL(u), 4000); }, 'image/png');
      else baixar(c.toDataURL('image/png'));
      AA.Som.salvar();
      AA.App.aviso('Salvo!', 'salvar');
    };
    img.onerror = () => AA.App.aviso('Não deu para salvar a imagem.', 'x');
    img.src = url;
  };

  /* ---------- montar paleta ---------- */
  P.montarPaleta = () => {
    const el = $('paleta');
    let html = '';
    AA.PALETA.forEach((g) => {
      html += `<div class="paleta-grupo${g.pele ? ' grupo-pele' : ''}" role="presentation">`;
      g.cores.forEach((c) => {
        const claro = ['#FFFFFF', '#FFF4A8', '#E0E0E0', '#BDE3FF', '#E3C8F5', '#FAD9C3', '#FFE45C', '#FF9EC4'].indexOf(c) >= 0;
        html += `<button class="cor${claro ? ' clara' : ''}" role="radio" aria-checked="false" data-cor="${c}" style="--c:${c}" aria-label="cor ${c}"></button>`;
      });
      html += '</div>';
    });
    el.innerHTML = html;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('.cor');
      if (b) P.escolherCor(b.dataset.cor);
    });
  };

  P.iniciar = () => {
    P.montarPaleta();
    iniciar();
    document.querySelectorAll('.ferr[data-ferr]').forEach((b) => b.addEventListener('click', () => { P.escolherFerramenta(b.dataset.ferr); AA.Som.clique(); }));
    $('btn-desfazer').addEventListener('click', P.acaoDesfazer);
    $('btn-refazer').addEventListener('click', P.acaoRefazer);
    $('btn-zoom-mais').addEventListener('click', () => { P.zoomEm(1.4); AA.Som.clique(); });
    $('btn-zoom-menos').addEventListener('click', () => { P.zoomEm(1 / 1.4); AA.Som.clique(); });
    $('btn-zoom-ajustar').addEventListener('click', () => { P.ajustar(); AA.Som.clique(); });
    $('btn-salvar').addEventListener('click', P.salvarImagem);
    $('btn-terminei').addEventListener('click', P.concluir);
    $('btn-limpar').addEventListener('click', () => AA.App.confirmar('Limpar o desenho?', 'lixo', P.limpar));
    const valida = AA.TODAS_CORES.indexOf(P.cor) >= 0 ? P.cor : '#FF7A00';
    P.escolherCor(valida, true);
  };
})(window.AA);
