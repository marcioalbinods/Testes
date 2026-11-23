/* Tinkercad Master — interface (React 18 + htm, sem etapa de build). */
(function () {
  const TM = window.TM;
  const { useState, useEffect, useRef, useMemo, useCallback } = React;
  const html = htm.bind(React.createElement);
  const PHASES = TM.allPhases();
  const BY_ID = Object.fromEntries(PHASES.map((p) => [p.id, p]));
  const TOTAL = PHASES.length;
  const partsCache = new Map();
  const partsOf = (ph) => { if (!partsCache.has(ph.id)) { let r = []; try { r = ph.model ? ph.model() : []; } catch (e) { console.error(e); } partsCache.set(ph.id, r); } return partsCache.get(ph.id); };
  TM.partsOf = partsOf;
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

  /* ---------------- Ícones ---------------- */
  const I = {
    home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14',
    medal: 'M8 3h8l-2 6h-4zM12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-8.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 18.5l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z',
    history: 'M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-1v5l3 2',
    tools: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
    cert: 'M4 4h16v12H4zM8 20l1-4m7 4l-1-4M8 9h8M8 12h5',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm0 0v16M8 7h7',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z',
    lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
    check: 'M4 12l5 5L20 6',
    play: 'M7 4l13 8-13 8z',
    left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7',
    upload: 'M12 16V4m0 0l-5 5m5-5l5 5M4 16v4h16v-4',
    bulb: 'M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
    copy: 'M8 8h12v12H8zM4 16V4h12',
    redo: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
    send: 'M4 12l16-8-6 16-3-7z',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
    rotate: 'M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4',
    eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    cube: 'M12 2l9 5v10l-9 5-9-5V7zm0 0v10m0 0l9-5m-9 5L3 7',
    explode: 'M12 3v5m0 8v5M3 12h5m8 0h5M6 6l3 3m6 6l3 3M18 6l-3 3M9 15l-3 3',
    x: 'M6 6l12 12M18 6L6 18',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
    menu: 'M4 7h16M4 12h16M4 17h16',
    flag: 'M5 21V4m0 0h11l-2 4 2 4H5'
  };
  const Icon = ({ n, s = 18, cls = '' }) => html`<svg class=${'ic ' + cls} width=${s} height=${s} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${I[n] || I.cube} /></svg>`;

  /* Mini-ícones isométricos das formas básicas */
  const SHAPE_SVG = {
    box: html`<g><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" class="f1"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" class="ln"/></g>`,
    boxh: html`<g><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" class="fh"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" class="ln"/></g>`,
    cyl: html`<g><path d="M4 7v10c0 2.2 3.6 4 8 4s8-1.8 8-4V7" class="f1"/><ellipse cx="12" cy="7" rx="8" ry="4" class="f2"/></g>`,
    cylh: html`<g><path d="M4 7v10c0 2.2 3.6 4 8 4s8-1.8 8-4V7" class="fh"/><ellipse cx="12" cy="7" rx="8" ry="4" class="fh"/></g>`,
    poly: html`<g><path d="M6 6h12l3 4v6l-3 4H6l-3-4v-6z" class="f1"/><path d="M3 10h18" class="ln"/></g>`,
    sphere: html`<g><circle cx="12" cy="12" r="8.5" class="f1"/><ellipse cx="12" cy="12" rx="8.5" ry="3" class="ln"/></g>`,
    hemi: html`<g><path d="M3.5 15a8.5 8.5 0 0 1 17 0z" class="f1"/><ellipse cx="12" cy="15" rx="8.5" ry="3" class="f2"/></g>`,
    cone: html`<g><path d="M12 3l8 14c0 2-3.6 3.5-8 3.5S4 19 4 17z" class="f1"/><path d="M4 17c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5" class="ln"/></g>`,
    pyr: html`<g><path d="M12 3l9 13-9 5-9-5z" class="f1"/><path d="M12 3v18" class="ln"/></g>`,
    torus: html`<g><ellipse cx="12" cy="12" rx="9" ry="6" class="f1"/><ellipse cx="12" cy="11.5" rx="4" ry="2.2" class="bg"/></g>`,
    tube: html`<g><path d="M4 7v10c0 2.2 3.6 4 8 4s8-1.8 8-4V7" class="f1"/><ellipse cx="12" cy="7" rx="8" ry="4" class="f2"/><ellipse cx="12" cy="7" rx="4.5" ry="2.2" class="bg"/></g>`,
    roof: html`<g><path d="M3 17l5-11h10l3 11z" class="f1"/><path d="M8 6l-2 11M18 6l3 11" class="ln"/></g>`,
    rroof: html`<g><path d="M3 18v-3a6 6 0 0 1 12 0v3zM9 9h8a6 6 0 0 1 4 6v3h-6" class="f1"/></g>`,
    wedge: html`<g><path d="M4 5v13h16z" class="f1"/><path d="M4 18l4-3h0" class="ln"/></g>`,
    para: html`<g><path d="M12 3c-3 0-8 9-8 14 0 2 3.6 3.5 8 3.5s8-1.5 8-3.5C20 12 15 3 12 3z" class="f1"/></g>`
  };
  const ShapeIcon = ({ k, s = 22 }) => html`<svg class="shape-ic" width=${s} height=${s} viewBox="0 0 24 24" aria-hidden="true">${SHAPE_SVG[k] || SHAPE_SVG.box}</svg>`;

  /* ---------------- Estado ---------------- */
  function useStore() {
    const [st, setSt] = useState(TM.loadState);
    const update = useCallback((fn) => setSt((prev) => { const next = fn(JSON.parse(JSON.stringify(prev))); TM.saveState(next); return next; }), []);
    return [st, update];
  }
  const isUnlocked = (st, id) => id === 1 || st.desbloqueadas.includes(id) || !!st.concluidas[id - 1];
  const totalPoints = (st) => Object.values(st.concluidas).reduce((s, c) => s + (c.pontos || 0), 0);
  const maxPoints = PHASES.reduce((s, p) => s + TM.basePoints(p), 0);
  const nextPhase = (st) => PHASES.find((p) => !st.concluidas[p.id] && isUnlocked(st, p.id)) || PHASES[TOTAL - 1];
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };

  function moduleStats(st, m) {
    const done = m.phases.filter((p) => st.concluidas[p.id]);
    const pts = done.reduce((s, p) => s + st.concluidas[p.id].pontos, 0);
    const max = m.phases.reduce((s, p) => s + TM.basePoints(p), 0);
    const pct = done.length ? pts / done.reduce((s, p) => s + TM.basePoints(p), 0) : 0;
    let medal = null;
    if (done.length === m.phases.length) medal = pct >= 0.9 ? 'ouro' : pct >= 0.75 ? 'prata' : 'bronze';
    return { done: done.length, total: m.phases.length, pts, max, pct, medal };
  }

  /* Conquistas */
  const ACH = [
    { id: 'primeira', nome: 'Primeiro bloco', desc: 'Conclua a fase 1.', ok: (s) => !!s.concluidas[1] },
    { id: 'semdica5', nome: 'Olhar treinado', desc: 'Conclua 5 fases sem abrir nenhuma dica.', ok: (s) => Object.values(s.concluidas).filter((c) => !c.dicas).length >= 5 },
    { id: 'semdica25', nome: 'Autonomia', desc: 'Conclua 25 fases sem abrir nenhuma dica.', ok: (s) => Object.values(s.concluidas).filter((c) => !c.dicas).length >= 25 },
    { id: 'persist', nome: 'Persistência', desc: 'Conclua uma fase depois de marcar "Vou refazer".', ok: (s) => Object.entries(s.avaliacoes).some(([id, l]) => l.some((a) => a.result === 'R') && s.concluidas[id]) },
    { id: 'perfeito', nome: 'Aperfeiçoamento', desc: 'Refaça uma fase já aprovada e melhore a pontuação.', ok: (s) => s.historico.some((h) => h.tipo === 'melhora') },
    { id: 'pleno10', nome: 'Dez conclusões plenas', desc: 'Conclua 10 fases com todos os requisitos (sem ressalvas).', ok: (s) => Object.values(s.concluidas).filter((c) => c.result === 'A').length >= 10 },
    { id: 'm1', nome: 'Formas dominadas', desc: 'Conclua o Módulo 1.', ok: (s) => [1,2,3,4,5,6,7,8,9,10].every((i) => s.concluidas[i]) },
    { id: 'm2', nome: 'Mestre dos furos', desc: 'Conclua o Módulo 2.', ok: (s) => range(11, 20).every((i) => s.concluidas[i]) },
    { id: 'm4', nome: 'Precisão milimétrica', desc: 'Conclua o Módulo 4.', ok: (s) => range(31, 40).every((i) => s.concluidas[i]) },
    { id: 'm5', nome: 'Designer de produto', desc: 'Conclua o Módulo 5.', ok: (s) => range(41, 50).every((i) => s.concluidas[i]) },
    { id: 'm7', nome: 'Arquiteto', desc: 'Conclua o Módulo 7.', ok: (s) => range(61, 70).every((i) => s.concluidas[i]) },
    { id: 'metade', nome: 'Meio caminho', desc: 'Conclua 50 fases.', ok: (s) => Object.keys(s.concluidas).length >= 50 },
    { id: 'ouro3', nome: 'Três ouros', desc: 'Ganhe medalha de ouro em 3 módulos.', ok: (s) => TM.modules.filter((m) => moduleStats(s, m).medal === 'ouro').length >= 3 },
    { id: 'pontos5k', nome: '5.000 pontos', desc: 'Acumule 5.000 pontos.', ok: (s) => totalPoints(s) >= 5000 },
    { id: 'mestre', nome: 'Tinkercad Master', desc: 'Conclua a fase 100, o projeto final autoral.', ok: (s) => !!s.concluidas[100] },
    { id: 'cem', nome: 'Curso completo', desc: 'Conclua as 100 fases.', ok: (s) => Object.keys(s.concluidas).length >= 100 }
  ];
  function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }

  /* Domínio das ferramentas */
  function toolMastery(st) {
    const out = {};
    Object.keys(TM.TOOLS).forEach((k) => (out[k] = { total: 0, done: 0 }));
    PHASES.forEach((p) => (p.tools || []).forEach((t) => { if (!out[t]) return; out[t].total++; if (st.concluidas[p.id]) out[t].done++; }));
    return out;
  }
  const masteryLevel = (d) => (d >= 12 ? 'Domínio' : d >= 6 ? 'Proficiente' : d >= 2 ? 'Em prática' : d >= 1 ? 'Aprendiz' : 'Não iniciado');

  /* ---------------- Roteamento por hash ---------------- */
  function useRoute() {
    const get = () => (location.hash || '#painel').slice(1);
    const [r, setR] = useState(get);
    useEffect(() => { const f = () => { setR(get()); window.scrollTo(0, 0); const m = document.querySelector('main'); if (m) m.scrollTop = 0; }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
    return r;
  }
  const go = (h) => { location.hash = h; };

  /* ---------------- Componentes de apoio ---------------- */
  function Toast({ msg }) { return msg ? html`<div class="toast" role="status">${msg}</div>` : null; }
  let toastFn = () => {};
  const toast = (m) => toastFn(m);

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('Copiado para a área de transferência.'); return true; }
    catch (e) { toast('Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.'); return false; }
  }

  function Ring({ value, size = 64, stroke = 6, label }) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    return html`<div class="ring" style=${{ width: size + 'px', height: size + 'px' }}>
      <svg width=${size} height=${size}><circle cx=${size / 2} cy=${size / 2} r=${r} class="ring-bg" stroke-width=${stroke} fill="none"/>
      <circle cx=${size / 2} cy=${size / 2} r=${r} class="ring-fg" stroke-width=${stroke} fill="none" stroke-dasharray=${c} stroke-dashoffset=${c * (1 - value)} transform=${`rotate(-90 ${size / 2} ${size / 2})`}/></svg>
      <span>${label != null ? label : Math.round(value * 100) + '%'}</span></div>`;
  }
  const Bar = ({ value, cls = '' }) => html`<div class=${'bar ' + cls}><i style=${{ width: Math.round(Math.min(1, value) * 100) + '%' }}></i></div>`;
  const Diff = ({ n }) => html`<span class="diff" title=${'Dificuldade: ' + TM.DIFF[n]}>${[1, 2, 3, 4, 5].map((i) => html`<i key=${i} class=${i <= n ? 'on' : ''}></i>`)}<b>${TM.DIFF[n]}</b></span>`;
  const Medal = ({ kind, s = 34 }) => html`<span class=${'medal medal-' + (kind || 'none')} style=${{ width: s + 'px', height: s + 'px' }} title=${kind ? 'Medalha de ' + kind : 'Sem medalha'}><${Icon} n="star" s=${s * 0.5} /></span>`;

  function Thumb({ ph, size }) {
    const ref = useRef(null); const [src, setSrc] = useState(null);
    useEffect(() => {
      let alive = true; const el = ref.current; if (!el) return;
      const io = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          TM.thumb && TM.thumb('ph' + ph.id, partsOf(ph)).then((u) => alive && u && setSrc(u));
        }
      }, { rootMargin: '200px' });
      io.observe(el); return () => { alive = false; io.disconnect(); };
    }, [ph.id]);
    return html`<div ref=${ref} class=${'thumb ' + (size ? 'thumb-' + size : '')}>${src ? html`<img src=${src} alt=${'Referência: ' + ph.nome} />` : html`<span class="thumb-ph"><${Icon} n="cube" s=${28} /></span>`}</div>`;
  }

  /* ---------------- Visualizador 3D ---------------- */
  function Viewer3D({ ph }) {
    const host = useRef(null); const vw = useRef(null);
    const [mode, setMode] = useState('result'); const [ex, setEx] = useState(0.7);
    const [auto, setAuto] = useState(true); const [err, setErr] = useState(null); const [busy, setBusy] = useState(true);
    const hasHoles = partsOf(ph).some((q) => q.hole);
    useEffect(() => {
      if (!TM.Viewer) { setErr('O módulo 3D não carregou.'); return; }
      const v = new TM.Viewer(host.current, { onInteract: () => setAuto(false) }); vw.current = v;
      v.ready.catch((e) => setErr('Não foi possível carregar o visualizador 3D (verifique a conexão com a internet). ' + (e && e.message ? '' : '')));
      return () => v.dispose();
    }, []);
    useEffect(() => {
      const v = vw.current; if (!v) return; setBusy(true); setMode('result');
      v.mode = 'result';
      v.setModel('ph' + ph.id, partsOf(ph), 'result').then(() => { setBusy(false); v.autoRotate = true; setAuto(true); }).catch((e) => { console.error(e); setErr('Falha ao montar a referência 3D.'); });
    }, [ph.id]);
    const pick = (m) => { setMode(m); const v = vw.current; if (!v) return; v.setMode(m).then(() => { if (m === 'explode') v.setExplode(ex); }); };
    useEffect(() => { vw.current && mode === 'explode' && vw.current.setExplode(ex); }, [ex, mode]);
    const view = (k) => { vw.current && vw.current.fit(k); setAuto(false); vw.current && (vw.current.autoRotate = false); };
    const toggleAuto = () => { const a = !auto; setAuto(a); if (vw.current) vw.current.autoRotate = a; };
    return html`<div class="viewer-card">
      <div class="viewer-top">
        <div class="seg" role="tablist" aria-label="Modo de visualização">
          <button role="tab" aria-selected=${mode === 'result'} class=${mode === 'result' ? 'on' : ''} onClick=${() => pick('result')}><${Icon} n="cube" s=${15}/> Resultado</button>
          <button role="tab" aria-selected=${mode === 'edit'} class=${mode === 'edit' ? 'on' : ''} onClick=${() => pick('edit')} title="Mostra os furos translúcidos, como no Tinkercad antes de agrupar"><${Icon} n="eye" s=${15}/> Modo edição</button>
          <button role="tab" aria-selected=${mode === 'explode'} class=${mode === 'explode' ? 'on' : ''} onClick=${() => pick('explode')}><${Icon} n="explode" s=${15}/> Vista explodida</button>
        </div>
      </div>
      <div class="viewer" ref=${host}>
        ${busy && !err ? html`<div class="viewer-msg">Montando a referência 3D…</div>` : null}
        ${err ? html`<div class="viewer-msg err">${err}</div>` : null}
        <div class="axis-tag"><b class="ax-x">X</b><b class="ax-y">Y</b><b class="ax-z">Z</b></div>
      </div>
      <div class="viewer-bottom">
        <div class="views">
          ${[['iso', 'Perspectiva'], ['front', 'Frente'], ['top', 'Topo'], ['side', 'Lado']].map(([k, l]) => html`<button key=${k} class="chip-btn" onClick=${() => view(k)}>${l}</button>`)}
          <button class=${'chip-btn ' + (auto ? 'on' : '')} onClick=${toggleAuto} aria-pressed=${auto}><${Icon} n="rotate" s=${14}/> Girar</button>
        </div>
        ${mode === 'explode' ? html`<label class="slider"><span>Separação</span><input id="explode-range" type="range" min="0" max="1.4" step="0.02" value=${ex} onInput=${(e) => setEx(+e.target.value)} /></label>` : html`<span class="viewer-hint">Arraste para girar · roda para zoom${hasHoles ? ' · "Modo edição" mostra os furos' : ''}</span>`}
      </div>
    </div>`;
  }

  function Components({ ph }) {
    const parts = partsOf(ph);
    const groups = {};
    parts.forEach((q) => {
      const shapeKey = q.hole ? (q.t === 'cyl' ? 'cylh' : q.t === 'box' ? 'boxh' : q.t) : q.t;
      const k = (q.n || TM.SHAPES[q.t].nome) + '|' + shapeKey + '|' + (q.hole ? 1 : 0);
      groups[k] = groups[k] || { nome: q.n || TM.SHAPES[q.t].nome, shape: shapeKey, hole: q.hole, c: q.c, n: 0 };
      groups[k].n++;
    });
    const list = Object.values(groups);
    return html`<div class="components">
      <div class="comp-head"><h4>Peças da referência</h4><span>${parts.length} formas · ${parts.filter((q) => q.hole).length} furos</span></div>
      <ul>${list.map((g, i) => html`<li key=${i}><span class="sw" style=${{ background: g.hole ? 'var(--hole)' : g.c }}></span><${ShapeIcon} k=${g.shape} s=${18}/><span class="cn">${g.nome}</span><span class="ct">${g.hole ? 'furo · ' : ''}${(TM.SHAPES[g.shape] || TM.SHAPES.box).nome.replace(' (furo)', '')}</span><b>${g.n}×</b></li>`)}</ul>
      <p class="note">A referência orienta a construção, mas não é gabarito: as medidas exatas e a sequência de montagem são decisões suas (ou estão na Dica 3).</p>
    </div>`;
  }

  /* ---------------- Sidebar ---------------- */
  function Sidebar({ st, route, open, setOpen }) {
    const done = Object.keys(st.concluidas).length;
    const items = [
      ['painel', 'home', 'Painel'], ['mapa', 'map', 'Mapa das fases'], ['conquistas', 'medal', 'Medalhas e conquistas'],
      ['historico', 'history', 'Histórico'], ['dominio', 'tools', 'Domínio das ferramentas'], ['guia', 'book', 'Como se autoavaliar'],
      ['certificado', 'cert', 'Certificado'], ['ajustes', 'gear', 'Progresso e backup']
    ];
    const cur = route.startsWith('fase-') ? 'mapa' : route === 'protocolo' ? 'guia' : route;
    return html`<aside class=${'side ' + (open ? 'open' : '')}>
      <a class="brand" href="#painel" onClick=${() => setOpen(false)}>
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><path d="M17 3l12 7v14l-12 7-12-7V10z" fill="var(--accent)"/><path d="M17 17l12-7M17 17v14M17 17L5 10" stroke="var(--bg)" stroke-width="1.6" fill="none"/><path d="M17 3l12 7-12 7-12-7z" fill="var(--accent-2)" opacity=".9"/></svg>
        <span><b>Tinkercad</b> Master</span>
      </a>
      <div class="side-prog">
        <${Ring} value=${done / TOTAL} size=${58} stroke=${6} label=${done} />
        <div><b>${done} de ${TOTAL} fases</b><span>${totalPoints(st).toLocaleString('pt-BR')} pontos</span></div>
      </div>
      <nav>${items.map(([k, ic, l]) => html`<a key=${k} href=${'#' + k} class=${cur === k ? 'on' : ''} onClick=${() => setOpen(false)}><${Icon} n=${ic} /> <span>${l}</span></a>`)}</nav>
      <a class="side-cta" href=${'#fase-' + nextPhase(st).id} onClick=${() => setOpen(false)}><${Icon} n="play" s=${16}/> Continuar: fase ${nextPhase(st).id}</a>
    </aside>`;
  }

  /* ---------------- Painel ---------------- */
  function Dashboard({ st }) {
    const nx = nextPhase(st); const done = Object.keys(st.concluidas).length;
    const medals = TM.modules.map((m) => moduleStats(st, m).medal).filter(Boolean).length;
    const hintsUsed = Object.values(st.dicas).reduce((s, n) => s + n, 0);
    const attempts = Object.values(st.tentativas).reduce((s, n) => s + n, 0);
    const mod = TM.modules.find((m) => m.n === nx.mod);
    const tm = toolMastery(st);
    const topTools = Object.entries(tm).sort((a, b) => b[1].done - a[1].done).slice(0, 6);
    const recent = st.historico.slice(-5).reverse();
    return html`<div class="page">
      <section class="hero">
        <div class="hero-text">
          <span class="eyebrow">Curso interativo · ${TOTAL} fases · 10 módulos</span>
          <h1>Do cubo ao projeto autoral, só com Formas básicas.</h1>
          <p>Você constrói cada desafio no Tinkercad, compara com a referência e faz a sua autoavaliação. Cada fase concluída libera a próxima.</p>
          <div class="hero-actions">
            <a class="btn primary" href=${'#fase-' + nx.id}><${Icon} n="play" s=${16}/> ${done ? 'Continuar' : 'Começar'} pela fase ${nx.id}</a>
            <a class="btn ghost" href="#mapa"><${Icon} n="map" s=${16}/> Ver o mapa</a>
          </div>
        </div>
        <a class="next-card" href=${'#fase-' + nx.id}>
          <${Thumb} ph=${nx} size="lg" />
          <div class="next-info">
            <span class="eyebrow">Próximo desafio · Módulo ${mod.n}</span>
            <h3>Fase ${nx.id} · ${nx.nome}</h3>
            <${Diff} n=${nx.diff} />
            <p>${nx.obj}</p>
          </div>
        </a>
      </section>

      <section class="stats">
        <div class="stat"><span>Fases concluídas</span><b>${done}<small>/${TOTAL}</small></b><${Bar} value=${done / TOTAL} /></div>
        <div class="stat"><span>Pontuação</span><b>${totalPoints(st).toLocaleString('pt-BR')}</b><small class="muted">de ${maxPoints.toLocaleString('pt-BR')} possíveis</small></div>
        <div class="stat"><span>Medalhas de módulo</span><b>${medals}<small>/10</small></b><small class="muted">${ACH.filter((a) => a.ok(st)).length} conquistas</small></div>
        <div class="stat"><span>Prints enviados</span><b>${attempts}</b><small class="muted">${hintsUsed} dicas abertas</small></div>
      </section>

      <section class="how">
        <h2>Como cada fase funciona</h2>
        <ol class="steps">
          <li><b>Estude a referência</b><span>Gire o modelo 3D, veja a vista explodida e identifique as formas.</span></li>
          <li><b>Construa no Tinkercad</b><span>Só com a aba Formas básicas. Dicas progressivas se precisar.</span></li>
          <li><b>Carregue o print</b><span>Capture a tela do seu modelo para comparar com a referência (opcional).</span></li>
          <li><b>Autoavalie</b><span>Confira os requisitos, compare lado a lado e conclua a fase.</span></li>
        </ol>
      </section>

      <div class="two">
        <section class="panel">
          <div class="panel-head"><h2>Módulos</h2><a href="#mapa">Mapa completo</a></div>
          <ul class="mod-list">${TM.modules.map((m) => { const s = moduleStats(st, m); const unlocked = isUnlocked(st, m.phases[0].id); return html`<li key=${m.n} class=${unlocked ? '' : 'locked'}>
            <a href=${'#mapa-m' + m.n} onClick=${(e) => { e.preventDefault(); go('mapa'); setTimeout(() => { const el = document.getElementById('m' + m.n); el && el.scrollIntoView({ behavior: 'smooth' }); }, 60); }}>
              <span class="mod-n" style=${{ '--mc': m.cor }}>${m.n}</span>
              <span class="mod-t"><b>${m.titulo}</b><${Bar} value=${s.done / s.total} /></span>
              <span class="mod-c">${unlocked ? s.done + '/10' : html`<${Icon} n="lock" s=${15}/>`}</span>
              ${s.medal ? html`<${Medal} kind=${s.medal} s=${24}/>` : null}
            </a></li>`; })}</ul>
        </section>
        <div class="col">
          <section class="panel">
            <div class="panel-head"><h2>Domínio das ferramentas</h2><a href="#dominio">Detalhes</a></div>
            <ul class="mini-tools">${topTools.map(([k, v]) => html`<li key=${k}><span>${TM.TOOLS[k].nome}</span><${Bar} value=${v.total ? v.done / v.total : 0} /><em>${masteryLevel(v.done)}</em></li>`)}</ul>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>Atividade recente</h2><a href="#historico">Histórico</a></div>
            ${recent.length ? html`<ul class="recent">${recent.map((h, i) => html`<li key=${i}><${HistIcon} h=${h} /><span><b>Fase ${h.id}</b> · ${histLabel(h)}</span><time>${fmtDate(h.data)}</time></li>`)}</ul>` : html`<p class="empty">Nenhuma atividade ainda. Sua primeira entrega aparece aqui assim que você enviar o print da fase 1.</p>`}
          </section>
        </div>
      </div>
    </div>`;
  }

  const histLabel = (h) => ({
    print: 'Print enviado (tentativa ' + (h.detalhe || '') + ')',
    pedido: 'Avaliação solicitada (versão antiga)',
    aval: (TM.RESULTS[h.result] || {}).nome + (h.pontos ? ' · +' + h.pontos + ' pts' : ''),
    melhora: 'Pontuação melhorada para ' + h.pontos + ' pts',
    dica: 'Dica ' + h.detalhe + ' aberta',
    refazer: 'Desafio reiniciado para nova tentativa'
  }[h.tipo] || h.tipo);
  const HistIcon = ({ h }) => {
    const map = { print: 'upload', pedido: 'send', aval: h.result === 'R' ? 'redo' : 'check', melhora: 'star', dica: 'bulb', refazer: 'redo' };
    return html`<span class=${'hist-ic t-' + h.tipo + (h.result ? ' r-' + h.result : '')}><${Icon} n=${map[h.tipo] || 'flag'} s=${14}/></span>`;
  };

  /* ---------------- Mapa ---------------- */
  function MapPage({ st }) {
    return html`<div class="page">
      <header class="page-head"><span class="eyebrow">${TOTAL} fases progressivas</span><h1>Mapa das fases</h1><p>Cada fase só abre depois que a anterior é aprovada. Fases concluídas podem ser refeitas para aperfeiçoar a pontuação.</p>
        <div class="legend"><span><i class="lg done"></i>Concluída</span><span><i class="lg obs"></i>Com ressalvas</span><span><i class="lg open"></i>Disponível</span><span><i class="lg lock"></i>Bloqueada</span></div>
      </header>
      ${TM.modules.map((m) => { const s = moduleStats(st, m); return html`<section key=${m.n} class="mod-sec" id=${'m' + m.n} style=${{ '--mc': m.cor }}>
        <div class="mod-head">
          <span class="mod-badge">Módulo ${m.n}</span>
          <div class="mod-title"><h2>${m.titulo}</h2><p>${m.resumo}</p></div>
          <div class="mod-meta"><span>${s.done}/10</span><${Bar} value=${s.done / 10} />${s.medal ? html`<${Medal} kind=${s.medal} s=${30}/>` : null}</div>
        </div>
        <div class="phase-grid">${m.phases.map((p) => { const c = st.concluidas[p.id]; const un = isUnlocked(st, p.id);
          const state = c ? (c.result === 'O' ? 'obs' : 'done') : un ? 'open' : 'lock';
          return html`<a key=${p.id} href=${un ? '#fase-' + p.id : undefined} class=${'phase-card s-' + state} aria-disabled=${!un} onClick=${(e) => { if (!un) { e.preventDefault(); toast('Fase bloqueada: conclua a fase ' + (p.id - 1) + ' para liberar.'); } }}>
            <${Thumb} ph=${p} />
            <div class="pc-body"><span class="pc-n">${String(p.id).padStart(2, '0')}</span><b>${p.nome}</b><${Diff} n=${p.diff} /></div>
            <span class="pc-state">${state === 'lock' ? html`<${Icon} n="lock" s=${14}/>` : state === 'open' ? html`<${Icon} n="play" s=${12}/>` : html`<${Icon} n="check" s=${14}/>`}</span>
            ${c ? html`<span class="pc-pts">${c.pontos} pts</span>` : null}
          </a>`; })}</div>
      </section>`; })}
    </div>`;
  }

  /* ---------------- Tela do desafio ---------------- */
  function PhasePage({ st, update, id }) {
    const ph = BY_ID[id];
    const [confirmRedo, setConfirmRedo] = useState(false);
    useEffect(() => { setConfirmRedo(false); }, [id]);
    if (!ph) return html`<div class="page"><p class="empty">Fase não encontrada. <a href="#mapa">Voltar ao mapa</a></p></div>`;
    if (!isUnlocked(st, id)) return html`<div class="page locked-page"><${Icon} n="lock" s=${40}/><h1>Fase ${id} bloqueada</h1><p>Conclua a fase ${id - 1} (${BY_ID[id - 1].nome}) para liberar este desafio. A progressão garante que cada ferramenta seja aprendida antes de ser exigida.</p><a class="btn primary" href=${'#fase-' + nextPhase(st).id}>Ir para a fase ${nextPhase(st).id}</a></div>`;
    const mod = TM.modules.find((m) => m.n === ph.mod);
    const comp = st.concluidas[id];
    const redo = () => {
      update((s) => { s.checks[id] = {}; s.historico.push({ id, tipo: 'refazer', data: new Date().toISOString() }); return s; });
      TM.deletePrint(id).then(() => window.dispatchEvent(new CustomEvent('tm-print', { detail: id })));
      setConfirmRedo(false); toast('Desafio reiniciado. Sua aprovação anterior continua registrada.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return html`<div class="page phase-page" style=${{ '--mc': mod.cor }}>
      <nav class="crumbs"><a href="#mapa">Mapa</a><span>/</span><a href="#mapa" onClick=${(e) => { e.preventDefault(); go('mapa'); setTimeout(() => { const el = document.getElementById('m' + mod.n); el && el.scrollIntoView(); }, 60); }}>Módulo ${mod.n} · ${mod.titulo}</a><span>/</span><b>Fase ${id}</b></nav>
      <header class="ph-head">
        <div class="ph-num"><small>Fase</small><b>${id}</b><small>de ${TOTAL}</small></div>
        <div class="ph-title">
          <h1>${ph.nome}</h1>
          <div class="ph-meta"><${Diff} n=${ph.diff} /><span class="chip">${TM.basePoints(ph)} pts base</span>
            ${comp ? html`<span class=${'chip res-' + comp.result}><${Icon} n="check" s=${13}/> ${TM.RESULTS[comp.result].nome} · ${comp.pontos} pts</span>` : html`<span class="chip">Tentativas: ${st.tentativas[id] || 0}</span>`}
          </div>
        </div>
        <div class="ph-nav">
          <button class="icon-btn" disabled=${id <= 1} onClick=${() => go('fase-' + (id - 1))} aria-label="Fase anterior"><${Icon} n="left"/></button>
          <button class="icon-btn" disabled=${id >= TOTAL || !isUnlocked(st, id + 1)} onClick=${() => go('fase-' + (id + 1))} aria-label="Próxima fase"><${Icon} n="right"/></button>
        </div>
      </header>

      <div class="ph-grid">
        <div class="ph-left">
          <${Viewer3D} ph=${ph} />
          <${Components} ph=${ph} />
        </div>
        <div class="ph-right">
          <section class="blk objective"><h3><${Icon} n="target" s=${17}/> Objetivo de aprendizagem</h3><p>${ph.obj}</p></section>
          ${ph.novo ? html`<section class="blk novo"><h3><span class="tag-new">Novo</span> ${ph.novo.titulo}</h3><p>${ph.novo.texto}</p>${ph.novo.passos ? html`<ol>${ph.novo.passos.map((t, i) => html`<li key=${i}>${t}</li>`)}</ol>` : null}</section>` : null}
          <section class="blk"><h3>Resultado esperado</h3><p>${ph.desc}</p></section>
          <${Requirements} ph=${ph} st=${st} update=${update} />
          <section class="blk kits">
            <div><h4>Formas básicas</h4><ul class="chips">${ph.formas.map((k) => html`<li key=${k} class="chip shape-chip"><${ShapeIcon} k=${k} s=${18}/>${(TM.SHAPES[k] || {}).nome || k}</li>`)}</ul></div>
            <div><h4>Ferramentas do Tinkercad</h4><ul class="chips">${ph.tools.map((k) => html`<li key=${k} class="chip tool-chip" title=${TM.TOOLS[k].desc}>${TM.TOOLS[k].nome}<kbd>${TM.TOOLS[k].atalho}</kbd></li>`)}</ul></div>
            <div><h4>Habilidades desenvolvidas</h4><ul class="chips">${ph.skills.map((k, i) => html`<li key=${i} class="chip skill-chip">${k}</li>`)}</ul></div>
          </section>
        </div>
      </div>

      <${Hints} ph=${ph} st=${st} update=${update} />

      <div class="deliver-grid">
        <${Delivery} ph=${ph} st=${st} update=${update} />
        <section class="blk criteria">
          <h3>Critérios para se autoavaliar</h3>
          <ul class="crit">${ph.crit.map((c, i) => html`<li key=${i}><span>${i + 1}</span>${c}</li>`)}</ul>
          <div class="results-legend">
            <div class="rl ok"><b>CONCLUÍDA</b><span>Todos os requisitos conferidos. ${TM.basePoints(ph)} pts (menos o desconto das dicas).</span></div>
            <div class="rl obs"><b>CONCLUÍDA COM RESSALVAS</b><span>Pelo menos metade dos requisitos; ainda há detalhes a melhorar. 80% dos pontos.</span></div>
            <div class="rl redo"><b>VOU REFAZER</b><span>O modelo ainda não corresponde à referência. Fica registrado e você tenta de novo.</span></div>
          </div>
        </section>
      </div>

      <${SelfCheck} ph=${ph} st=${st} update=${update} />

      <div class="action-bar">
        <button class="btn primary big" onClick=${() => { const el = document.getElementById('autoavaliacao'); el && el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><${Icon} n="check" s=${17}/> Autoavaliar e concluir</button>
        ${confirmRedo ? html`<span class="confirm"><span>Apagar o print e as marcações para refazer?</span><button class="btn danger" onClick=${redo}>Sim, refazer</button><button class="btn ghost" onClick=${() => setConfirmRedo(false)}>Cancelar</button></span>`
          : html`<button class="btn ghost big" onClick=${() => setConfirmRedo(true)}><${Icon} n="redo" s=${17}/> Refazer desafio</button>`}
        ${comp && id < TOTAL ? html`<a class="btn ghost big" href=${'#fase-' + (id + 1)}>Próxima fase <${Icon} n="right" s=${16}/></a>` : null}
      </div>
    </div>`;
  }

  function Requirements({ ph, st, update }) {
    const ck = st.checks[ph.id] || {};
    const n = ph.req.filter((_, i) => ck[i]).length;
    const toggle = (i) => update((s) => { s.checks[ph.id] = s.checks[ph.id] || {}; s.checks[ph.id][i] = !s.checks[ph.id][i]; return s; });
    return html`<section class="blk reqs"><h3>Requisitos obrigatórios <span class="count">${n}/${ph.req.length} conferidos</span></h3>
      <ul>${ph.req.map((r, i) => html`<li key=${i}><label><input id=${'req-' + ph.id + '-' + i} type="checkbox" checked=${!!ck[i]} onChange=${() => toggle(i)} /><span>${r}</span></label></li>`)}</ul>
      <p class="note">Marque cada item ao conferir no seu modelo. Compare o seu modelo com a referência 3D: esta lista é a base da sua autoavaliação.</p></section>`;
  }

  function Hints({ ph, st, update }) {
    const lv = st.dicas[ph.id] || 0;
    const [ask, setAsk] = useState(0);
    useEffect(() => setAsk(0), [ph.id]);
    const open = (n) => { update((s) => { s.dicas[ph.id] = Math.max(s.dicas[ph.id] || 0, n); s.historico.push({ id: ph.id, tipo: 'dica', detalhe: n, data: new Date().toISOString() }); return s; }); setAsk(0); };
    const names = ['Pista', 'Orientação', 'Passo a passo'];
    const pen = ['−10% dos pontos', '−25% no total', '−50% no total'];
    const comp = st.concluidas[ph.id];
    return html`<section class="hints">
      <div class="hints-head"><h3><${Icon} n="bulb" s=${18}/> Dicas progressivas</h3><p>Abra só o necessário. Cada nível libera o seguinte e reduz os pontos desta fase${comp ? ' (a fase já está concluída: abrir dicas agora não altera a pontuação registrada)' : ''}.</p></div>
      <div class="hint-row">${[1, 2, 3].map((n) => { const shown = lv >= n; const avail = lv >= n - 1; const d = ph.dicas[n - 1];
        return html`<article key=${n} class=${'hint ' + (shown ? 'shown' : avail ? 'avail' : 'locked')}>
          <header><span class="hn">${n}</span><b>${names[n - 1]}</b>${!shown ? html`<em>${pen[n - 1]}</em>` : null}</header>
          ${shown ? (Array.isArray(d) ? html`<ol class="steps-list">${d.map((t, i) => html`<li key=${i}>${t}</li>`)}</ol>` : html`<p>${d}</p>`)
            : avail ? (ask === n ? html`<div class="hint-confirm"><p>Abrir a dica ${n}? A pontuação máxima desta fase cai para ${Math.round((1 - TM.HINT_PENALTY[n]) * 100)}%.</p><div><button class="btn primary sm" onClick=${() => open(n)}>Abrir dica</button><button class="btn ghost sm" onClick=${() => setAsk(0)}>Agora não</button></div></div>`
              : html`<button class="btn ghost sm" onClick=${() => setAsk(n)}><${Icon} n="bulb" s=${15}/> Revelar ${names[n - 1].toLowerCase()}</button>`)
            : html`<p class="muted"><${Icon} n="lock" s=${14}/> Abra a dica ${n - 1} primeiro.</p>`}
        </article>`; })}</div>
    </section>`;
  }

  function Delivery({ ph, st, update }) {
    const [rec, setRec] = useState(null); const [drag, setDrag] = useState(false); const [err, setErr] = useState('');
    const inp = useRef(null); const id = ph.id;
    useEffect(() => { let a = true; setRec(null); setErr(''); TM.getPrint(id).then((r) => a && setRec(r)); const f = (e) => { if (e.detail === id) TM.getPrint(id).then((r) => a && setRec(r)); }; addEventListener('tm-print', f); return () => { a = false; removeEventListener('tm-print', f); }; }, [id]);
    const take = async (file) => {
      setErr('');
      try {
        const img = await TM.readImage(file);
        const n = (st.tentativas[id] || 0) + 1;
        const r = Object.assign(img, { fase: id, tentativa: n, quando: new Date().toISOString() });
        await TM.savePrint(id, r); setRec(r); window.dispatchEvent(new CustomEvent('tm-print', { detail: id }));
        update((s) => { s.tentativas[id] = n; s.historico.push({ id, tipo: 'print', detalhe: n, data: r.quando }); return s; });
        toast('Print registrado como tentativa ' + n + ' da fase ' + id + '.');
      } catch (e) { setErr(e.message || 'Falha ao carregar a imagem.'); }
    };
    useEffect(() => {
      const onPaste = (e) => { const f = [...(e.clipboardData ? e.clipboardData.files : [])].find((x) => /^image\//.test(x.type)); if (f) { e.preventDefault(); take(f); } };
      addEventListener('paste', onPaste); return () => removeEventListener('paste', onPaste);
    });
    return html`<section class="blk deliver">
      <h3><${Icon} n="upload" s=${17}/> Entrega da atividade</h3>
      <p class="muted">Fase ${id} · ${ph.nome} · ${st.tentativas[id] || 0} tentativa(s) registrada(s)</p>
      ${rec ? html`<figure class="print-prev">
          <img src=${rec.data} alt=${'Seu print da fase ' + id} />
          <figcaption><span><b>Tentativa ${rec.tentativa}</b> · ${fmtDate(rec.quando)}</span><span>${rec.nome} · ${rec.w}×${rec.h}px</span></figcaption>
          <div class="print-actions"><button class="btn ghost sm" onClick=${() => inp.current.click()}><${Icon} n="upload" s=${14}/> Substituir imagem</button></div>
        </figure>`
        : html`<div class=${'drop ' + (drag ? 'drag' : '')} onDragOver=${(e) => { e.preventDefault(); setDrag(true); }} onDragLeave=${() => setDrag(false)} onDrop=${(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; f && take(f); }} onClick=${() => inp.current.click()} role="button" tabindex="0" onKeyDown=${(e) => (e.key === 'Enter' || e.key === ' ') && inp.current.click()}>
          <${Icon} n="upload" s=${30}/>
          <b>Arraste o print aqui ou clique para escolher</b>
          <span>PNG ou JPG · também dá para colar com Ctrl+V</span>
          <small>Capture o modelo agrupado, de preferência em perspectiva, com o plano de trabalho visível.</small>
        </div>`}
      <input ref=${inp} id=${'print-input-' + id} type="file" accept="image/*" hidden onChange=${(e) => { const f = e.target.files[0]; f && take(f); e.target.value = ''; }} />
      ${err ? html`<p class="err">${err}</p>` : null}
      <details class="print-tips"><summary>Como tirar um bom print</summary><ul>
        <li>Windows: <kbd>Win</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> · Mac: <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>4</kbd> · Tablet: botões de captura do aparelho.</li>
        <li>Clique fora do modelo para tirar a seleção e use o cubo de vista para uma perspectiva que mostre as faces principais.</li>
        <li>Se a fase pede furos, um segundo print desagrupado (furos visíveis) ajuda você a conferir se os furos estão no lugar certo.</li>
      </ul></details>
    </section>`;
  }

  /* ---------------- Autoavaliação ---------------- */
  function SelfCheck({ ph, st, update }) {
    const id = ph.id;
    const [rec, setRec] = useState(null); const [notas, setNotas] = useState(''); const [done, setDone] = useState(null);
    useEffect(() => { let a = true; setDone(null); setNotas(''); TM.getPrint(id).then((r) => a && setRec(r)); const f = (e) => { if (e.detail === id) TM.getPrint(id).then((r) => a && setRec(r)); }; addEventListener('tm-print', f); return () => { a = false; removeEventListener('tm-print', f); }; }, [id]);
    const ck = st.checks[id] || {};
    const n = ph.req.filter((_, i) => ck[i]).length, N = ph.req.length;
    const canA = n === N, canO = n >= Math.ceil(N / 2);
    const lv = st.dicas[id] || 0;
    const hist = st.avaliacoes[id] || [];
    const register = (result) => {
      const prev = st.concluidas[id];
      const pts = result === 'R' ? 0 : TM.score(ph, result, prev ? Math.min(prev.dicas || 0, lv) : lv);
      update((s) => {
        const now = new Date().toISOString();
        s.avaliacoes[id] = s.avaliacoes[id] || [];
        s.avaliacoes[id].push({ result, data: now, parecer: notas.trim(), pontos: pts });
        s.historico.push({ id, tipo: 'aval', result, pontos: pts, data: now });
        if (result !== 'R') {
          const old = s.concluidas[id];
          if (!old || pts > old.pontos) {
            if (old) s.historico.push({ id, tipo: 'melhora', pontos: pts, data: now });
            s.concluidas[id] = { result: old && old.result === 'A' ? 'A' : result, pontos: pts, data: now, dicas: old ? Math.min(old.dicas || 0, lv) : lv };
          } else if (old && result === 'A' && old.result === 'O') old.result = 'A';
          if (id + 1 <= TOTAL && !s.desbloqueadas.includes(id + 1)) s.desbloqueadas.push(id + 1);
        }
        return s;
      });
      setDone({ result, pts }); setNotas('');
    };
    return html`<section class="blk selfcheck" id="autoavaliacao">
      <h3><${Icon} n="check" s=${18}/> Autoavaliação</h3>
      <p class="muted">Compare o seu print com a referência, confira os requisitos acima e registre o resultado. Você é o avaliador: seja exigente.</p>
      <div class="compare">
        <figure><figcaption>Seu modelo</figcaption>${rec ? html`<img src=${rec.data} alt=${'Seu print da fase ' + id} />` : html`<div class="compare-empty">Sem print. Carregue um na área de entrega para comparar lado a lado (opcional).</div>`}</figure>
        <figure><figcaption>Referência</figcaption><${Thumb} ph=${ph} /></figure>
      </div>
      <ul class="self-q">
        <li>As formas pedidas estão lá, com a mesma função da referência?</li>
        <li>Os furos cortam onde devem (confira desagrupando)?</li>
        <li>As proporções e a posição das peças batem com a referência?</li>
        <li>Nada flutua, nada atravessa sem motivo, tudo está agrupado?</li>
      </ul>
      <p class="self-count"><b>${n} de ${N}</b> requisitos conferidos${canA ? ' — pode concluir.' : canO ? ' — dá para concluir com ressalvas.' : '.'}</p>
      <label for=${'self-notes-' + id}>Anotações (o que ficou bom, o que melhorar)</label>
      <textarea id=${'self-notes-' + id} rows="3" value=${notas} onInput=${(e) => setNotas(e.target.value)} placeholder="Ex.: as alturas ficaram certas; o cone saiu um pouco descentralizado"></textarea>
      <div class="self-actions">
        <button class="btn primary" disabled=${!canA} onClick=${() => register('A')} title=${canA ? '' : 'Marque todos os requisitos para concluir'}><${Icon} n="check" s=${16}/> Concluir fase</button>
        <button class="btn ghost" disabled=${!canO} onClick=${() => register('O')} title=${canO ? '' : 'Marque pelo menos metade dos requisitos'}>Concluir com ressalvas</button>
        <button class="btn ghost" onClick=${() => register('R')}><${Icon} n="redo" s=${16}/> Vou refazer</button>
      </div>
      ${done ? html`<div class=${'fb res-' + done.result}><div class="fb-head"><b>${TM.RESULTS[done.result].nome}</b>${done.pts ? html`<span class="chip">+${done.pts} pts</span>` : null}</div>
        ${done.result === 'R' ? html`<p>Registrado. Ajuste o modelo, troque o print e faça a autoavaliação de novo.</p>` : html`<p>Fase ${id} concluída.${id < TOTAL ? ' A fase ' + (id + 1) + ' foi liberada.' : ' Você terminou o curso!'}</p>${id < TOTAL ? html`<a class="btn primary sm" href=${'#fase-' + (id + 1)}>Ir para a fase ${id + 1}</a>` : html`<a class="btn primary sm" href="#certificado">Ver certificado</a>`}`}</div>` : null}
      ${hist.length ? html`<details class="fb-hist"><summary>Autoavaliações anteriores (${hist.length})</summary><ul>${hist.slice().reverse().map((a, i) => html`<li key=${i}><b class=${'t-' + a.result}>${TM.RESULTS[a.result].nome}</b> · ${fmtDate(a.data)}${a.pontos ? ' · ' + a.pontos + ' pts' : ''}${a.parecer ? html`<p>${a.parecer}</p>` : null}</li>`)}</ul></details>` : null}
    </section>`;
  }

  /* ---------------- Conquistas ---------------- */
  function Achievements({ st }) {
    return html`<div class="page">
      <header class="page-head"><span class="eyebrow">Gamificação</span><h1>Medalhas e conquistas</h1><p>Cada módulo concluído rende uma medalha: <b>ouro</b> com 90% ou mais dos pontos possíveis nas fases, <b>prata</b> com 75% ou mais, <b>bronze</b> abaixo disso. Dicas e observações reduzem o percentual.</p></header>
      <section class="medal-grid">${TM.modules.map((m) => { const s = moduleStats(st, m); return html`<div key=${m.n} class=${'medal-card ' + (s.medal ? 'has' : '')} style=${{ '--mc': m.cor }}>
        <${Medal} kind=${s.medal} s=${52}/><div><span class="eyebrow">Módulo ${m.n}</span><b>${m.titulo}</b><small>${s.done}/10 fases · ${s.done ? Math.round(s.pct * 100) + '% dos pontos' : 'não iniciado'}</small></div></div>`; })}</section>
      <h2 class="sec-title">Conquistas</h2>
      <section class="ach-grid">${ACH.map((a) => { const ok = a.ok(st); return html`<div key=${a.id} class=${'ach ' + (ok ? 'ok' : '')}><span class="ach-ic"><${Icon} n=${ok ? 'star' : 'lock'} s=${20}/></span><div><b>${a.nome}</b><small>${a.desc}</small></div></div>`; })}</section>
    </div>`;
  }

  /* ---------------- Histórico ---------------- */
  function History({ st }) {
    const [f, setF] = useState('todos');
    const evs = st.historico.slice().reverse().filter((h) => f === 'todos' || h.tipo === f || (f === 'aval' && h.tipo === 'melhora'));
    const evals = Object.values(st.avaliacoes).flat();
    const cnt = (r) => evals.filter((a) => a.result === r).length;
    return html`<div class="page">
      <header class="page-head"><span class="eyebrow">Desempenho</span><h1>Histórico</h1><p>Todos os prints, autoavaliações e dicas, com data e pontuação.</p></header>
      <section class="stats">
        <div class="stat"><span>Autoavaliações</span><b>${evals.length}</b></div>
        <div class="stat ok"><span>Concluídas</span><b>${cnt('A')}</b></div>
        <div class="stat obs"><span>Com ressalvas</span><b>${cnt('O')}</b></div>
        <div class="stat redo"><span>Vou refazer</span><b>${cnt('R')}</b></div>
      </section>
      <div class="filters" role="tablist">${[['todos', 'Tudo'], ['aval', 'Autoavaliações'], ['print', 'Prints'], ['dica', 'Dicas'], ['refazer', 'Refazer']].map(([k, l]) => html`<button key=${k} role="tab" aria-selected=${f === k} class=${'chip-btn ' + (f === k ? 'on' : '')} onClick=${() => setF(k)}>${l}</button>`)}</div>
      ${evs.length ? html`<div class="table-wrap"><table class="hist">
        <thead><tr><th>Data</th><th>Fase</th><th>Evento</th><th class="num">Pontos</th></tr></thead>
        <tbody>${evs.map((h, i) => html`<tr key=${i}><td>${fmtDate(h.data)}</td><td><a href=${'#fase-' + h.id}>${h.id} · ${BY_ID[h.id] ? BY_ID[h.id].nome : ''}</a></td><td><span class="ev"><${HistIcon} h=${h}/>${histLabel(h)}</span></td><td class="num">${h.pontos ? '+' + h.pontos : '—'}</td></tr>`)}</tbody>
      </table></div>` : html`<p class="empty">Nada por aqui ainda. O histórico começa quando você envia o primeiro print.</p>`}
    </div>`;
  }

  /* ---------------- Domínio ---------------- */
  function Mastery({ st }) {
    const tm = toolMastery(st);
    const shapes = {};
    PHASES.forEach((p) => p.formas.forEach((k) => { shapes[k] = shapes[k] || { total: 0, done: 0 }; shapes[k].total++; if (st.concluidas[p.id]) shapes[k].done++; }));
    return html`<div class="page">
      <header class="page-head"><span class="eyebrow">Indicador de domínio</span><h1>Domínio das ferramentas</h1><p>O nível sobe a cada fase aprovada que exige a ferramenta: <b>Aprendiz</b> (1 fase), <b>Em prática</b> (2+), <b>Proficiente</b> (6+), <b>Domínio</b> (12+).</p></header>
      <section class="tool-grid">${Object.entries(TM.TOOLS).map(([k, t]) => { const v = tm[k]; return html`<article key=${k} class="tool-card">
        <header><b>${t.nome}</b><kbd>${t.atalho}</kbd></header><p>${t.desc}</p>
        <${Bar} value=${v.total ? v.done / v.total : 0} /><footer><em class=${'lvl l' + Math.min(4, v.done >= 12 ? 4 : v.done >= 6 ? 3 : v.done >= 2 ? 2 : v.done)}>${masteryLevel(v.done)}</em><span>${v.done}/${v.total} fases</span></footer></article>`; })}</section>
      <h2 class="sec-title">Formas básicas</h2>
      <section class="shape-grid">${Object.entries(shapes).sort((a, b) => b[1].total - a[1].total).map(([k, v]) => html`<div key=${k} class="shape-card"><${ShapeIcon} k=${k} s=${34}/><b>${TM.SHAPES[k].nome}</b><${Bar} value=${v.done / v.total}/><small>${v.done}/${v.total} fases</small></div>`)}</section>
    </div>`;
  }

  /* ---------------- Guia de autoavaliação ---------------- */
  function Guide() {
    return html`<div class="page prose">
      <header class="page-head"><span class="eyebrow">Você é o avaliador</span><h1>Como se autoavaliar</h1><p>Cada fase termina com uma autoavaliação: você compara o seu modelo com a referência 3D, confere os requisitos e decide se a fase está concluída.</p></header>
      <section class="blk"><h3>Passo a passo</h3><ol>
        <li>Construa o modelo no Tinkercad e tire um print em perspectiva (opcional, mas ajuda a comparar).</li>
        <li>Carregue o print na área de entrega da fase.</li>
        <li>Gire a referência 3D até a mesma vista do seu print e compare peça por peça. Use "Modo edição" para ver onde ficam os furos e "Vista explodida" para ver cada componente.</li>
        <li>Marque na lista cada requisito que o seu modelo realmente cumpre.</li>
        <li>Na seção Autoavaliação, escreva o que ficou bom e o que melhorar e escolha o resultado.</li>
      </ol></section>
      <section class="blk"><h3>Perguntas para conferir</h3><ol class="proto">
        <li><b>O objeto está completo?</b> Inteiro, sem peças flutuando ou atravessadas sem motivo.</li>
        <li><b>As formas pedidas foram usadas?</b> Cada forma da lista aparece com a função esperada.</li>
        <li><b>Os furos estão certos?</b> Desagrupe e confira: agrupados com o sólido, na profundidade certa, sem películas.</li>
        <li><b>Os agrupamentos estão corretos?</b> Peças de uma mesma unidade agrupadas; Multicor quando pedido.</li>
        <li><b>As proporções estão boas?</b> Compare medidas com a Régua; as relações de tamanho batem com a referência.</li>
        <li><b>Parece com a referência?</b> Olhando de longe, alguém reconheceria o mesmo objeto.</li>
      </ol></section>
      <section class="blk"><h3>Os três resultados</h3>
        <div class="results-legend wide">
          <div class="rl ok"><b>CONCLUÍDA</b><span>Todos os requisitos marcados. Pontuação integral (menos o desconto das dicas abertas).</span></div>
          <div class="rl obs"><b>CONCLUÍDA COM RESSALVAS</b><span>Pelo menos metade dos requisitos. Vale 80% dos pontos e libera a próxima fase.</span></div>
          <div class="rl redo"><b>VOU REFAZER</b><span>O modelo ainda não corresponde. Fica no histórico e você tenta de novo.</span></div>
        </div>
        <p>Seja honesto consigo: o objetivo é aprender a observar e corrigir. Você pode refazer qualquer fase concluída para melhorar a pontuação.</p></section>
      <section class="blk"><h3>Pontuação</h3><ul>
        <li>Pontos base por fase: 80 + 20 × dificuldade (100 a 180).</li>
        <li>Dicas: dica 1 reduz 10%, dica 2 reduz 25% no total, dica 3 reduz 50% no total. Abrir dicas nunca impede a conclusão.</li>
        <li>"Com ressalvas" vale 80%. Refazer uma fase concluída mantém a melhor pontuação.</li>
      </ul></section>
    </div>`;
  }

  /* ---------------- Certificado ---------------- */
  function Certificate({ st, update }) {
    const done = Object.keys(st.concluidas).length; const ok = !!st.concluidas[100];
    const [nome, setNome] = useState(st.nome || '');
    const pts = totalPoints(st);
    const medals = TM.modules.map((m) => moduleStats(st, m).medal);
    const last = ok ? fmtDate(st.concluidas[100].data).slice(0, 8) : '';
    return html`<div class="page">
      <header class="page-head"><span class="eyebrow">Conclusão</span><h1>Certificado simbólico</h1><p>${ok ? 'Parabéns! Você concluiu o projeto final autoral.' : `Liberado ao concluir a fase 100. Progresso atual: ${done} de ${TOTAL} fases.`}</p></header>
      <div class="cert-form"><label for="cert-name">Nome no certificado</label><input id="cert-name" value=${nome} onInput=${(e) => setNome(e.target.value)} onBlur=${() => update((s) => { s.nome = nome.trim(); return s; })} placeholder="Seu nome" /><small>Fica salvo só neste navegador.</small></div>
      <div class=${'cert ' + (ok ? '' : 'preview')}>
        ${!ok ? html`<div class="cert-lock"><${Icon} n="lock" s=${26}/> Prévia · conclua a fase 100</div>` : null}
        <div class="cert-in">
          <span class="eyebrow">Tinkercad Master · Do zero à modelagem 3D avançada</span>
          <h2>Certificado de conclusão</h2>
          <p>Certificamos que</p>
          <b class="cert-name">${nome || 'Seu nome'}</b>
          <p>concluiu as ${TOTAL} fases do curso, construindo objetos, ambientes, personagens e um projeto autoral apenas com as Formas básicas do Tinkercad: sólidos, furos, alinhamento, simetria, duplicação e agrupamento.</p>
          <div class="cert-stats"><span><b>${pts.toLocaleString('pt-BR')}</b>pontos</span><span><b>${done}</b>fases</span><span><b>${medals.filter(Boolean).length}</b>medalhas</span>${ok ? html`<span><b>${last}</b>conclusão</span>` : null}</div>
          <div class="cert-medals">${medals.map((m, i) => html`<${Medal} key=${i} kind=${m} s=${30}/>`)}</div>
        </div>
      </div>
      ${ok && !inFrame ? html`<button class="btn primary" onClick=${() => window.print()}>Imprimir certificado</button>` : null}
    </div>`;
  }

  /* ---------------- Ajustes / backup ---------------- */
  function Settings({ st, update }) {
    const [txt, setTxt] = useState(''); const [ask, setAsk] = useState(false); const [msg, setMsg] = useState('');
    const exportStr = useMemo(() => btoa(unescape(encodeURIComponent(JSON.stringify(st)))), [st]);
    const doImport = () => {
      try { const s = JSON.parse(decodeURIComponent(escape(atob(txt.trim())))); if (!s || s.v !== 1) throw 0; update(() => Object.assign(TM.blankState(), s)); setMsg('Progresso importado.'); setTxt(''); }
      catch (e) { setMsg('O texto não é um backup válido do Tinkercad Master.'); }
    };
    const reset = () => { update(() => TM.blankState()); TM.clearPrints(); setAsk(false); setMsg('Progresso apagado. O curso recomeçou da fase 1.'); };
    return html`<div class="page">
      <header class="page-head"><span class="eyebrow">Armazenamento local</span><h1>Progresso e backup</h1><p>Tudo fica salvo apenas neste navegador: fases, pontos, tentativas, dicas e avaliações no armazenamento local; os prints em um banco interno do navegador. Nada é enviado para servidores.</p></header>
      ${!TM.storageOK ? html`<p class="warn">O armazenamento deste navegador está bloqueado (janela anônima ou cookies desativados). O progresso vale só enquanto a página estiver aberta.</p>` : null}
      <div class="two">
        <section class="panel"><h2>Exportar progresso</h2><p class="muted">Copie este texto e guarde. Serve para levar o progresso para outro navegador (os prints não vão junto).</p>
          <textarea id="export-box" class="mono" rows="5" readonly value=${exportStr} onFocus=${(e) => e.target.select()}></textarea>
          <button class="btn primary" onClick=${() => copyText(exportStr)}><${Icon} n="copy" s=${15}/> Copiar backup</button></section>
        <section class="panel"><h2>Importar progresso</h2><p class="muted">Cole um backup copiado anteriormente. O progresso atual será substituído.</p>
          <textarea id="import-box" class="mono" rows="5" value=${txt} onInput=${(e) => setTxt(e.target.value)} placeholder="Cole o backup aqui"></textarea>
          <button class="btn ghost" disabled=${!txt.trim()} onClick=${doImport}>Importar</button></section>
      </div>
      <section class="panel danger-zone"><h2>Recomeçar o curso</h2><p class="muted">Apaga fases concluídas, pontos, histórico e prints deste navegador.</p>
        ${ask ? html`<div class="confirm"><span>Tem certeza? Isso não pode ser desfeito.</span><button class="btn danger" onClick=${reset}>Apagar tudo</button><button class="btn ghost" onClick=${() => setAsk(false)}>Cancelar</button></div>` : html`<button class="btn danger" onClick=${() => setAsk(true)}><${Icon} n="trash" s=${15}/> Apagar progresso</button>`}</section>
      ${msg ? html`<p class="ok-msg">${msg}</p>` : null}
    </div>`;
  }

  /* ---------------- App ---------------- */
  function App() {
    const [st, update] = useStore(); const route = useRoute(); const [open, setOpen] = useState(false); const [t, setT] = useState('');
    useEffect(() => { let h; toastFn = (m) => { setT(m); clearTimeout(h); h = setTimeout(() => setT(''), 3200); }; }, []);
    let page;
    const m = route.match(/^fase-(\d+)$/);
    if (m) page = html`<${PhasePage} key=${m[1]} st=${st} update=${update} id=${+m[1]} />`;
    else if (route === 'mapa') page = html`<${MapPage} st=${st} />`;
    else if (route === 'conquistas') page = html`<${Achievements} st=${st} />`;
    else if (route === 'historico') page = html`<${History} st=${st} />`;
    else if (route === 'dominio') page = html`<${Mastery} st=${st} />`;
    else if (route === 'guia' || route === 'protocolo') page = html`<${Guide} />`;
    else if (route === 'certificado') page = html`<${Certificate} st=${st} update=${update} />`;
    else if (route === 'ajustes') page = html`<${Settings} st=${st} update=${update} />`;
    else page = html`<${Dashboard} st=${st} />`;
    return html`<div class="app">
      <header class="topbar"><button class="icon-btn" onClick=${() => setOpen(!open)} aria-label="Abrir menu"><${Icon} n="menu"/></button><a href="#painel" class="tb-brand"><b>Tinkercad</b> Master</a><span class="tb-prog">${Object.keys(st.concluidas).length}/${TOTAL}</span></header>
      <${Sidebar} st=${st} route=${route} open=${open} setOpen=${setOpen} />
      ${open ? html`<div class="scrim" onClick=${() => setOpen(false)}></div>` : null}
      <main>${page}</main>
      <${Toast} msg=${t} />
    </div>`;
  }

  TM.mount = () => ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
})();
