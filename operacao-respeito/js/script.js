/* =========================================================
   OPERAÇÃO RESPEITO — Motor do jogo
   Telas, mecânicas, pontuação, progresso (localStorage),
   dossiê, medalhas, certificado e Área do Professor.
   ========================================================= */
(function () {
  'use strict';

  const { OPERATIONS, PHASES, DOSSIER, MEDALS, MECH } = window.GAME_DATA;
  const ART = window.ART;
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');

  /* =================== SALVAMENTO =================== */
  const KEY = 'operacao-respeito:v1';
  const fresh = () => ({ v: 1, started: false, agent: null, code: null, phases: {}, opsDone: {}, medals: {}, read: {}, sound: false, finishedAt: null });
  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && typeof o === 'object') return Object.assign(fresh(), o);
      }
    } catch (e) { /* armazenamento indisponível */ }
    return fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } }

  /* =================== DERIVADOS =================== */
  const pad = (n) => String(n).padStart(2, '0');
  const opPhases = (op) => PHASES.filter((p) => p.op === op);
  const phaseDone = (id) => !!S.phases[id];
  const phaseUnlocked = (id) => id === 1 || phaseDone(id - 1);
  const opProgress = (op) => opPhases(op).filter((p) => phaseDone(p.id)).length;
  const opUnlocked = (op) => phaseUnlocked(opPhases(op)[0].id);
  const opDone = (op) => opProgress(op) === opPhases(op).length;
  const doneCount = () => PHASES.filter((p) => phaseDone(p.id)).length;
  const opsUnlockedCount = () => OPERATIONS.filter((o) => opUnlocked(o.id)).length;
  const medalCount = () => MEDALS.filter((m) => S.medals[m.id]).length;
  const dossierUnlocked = (d) => d.unlock === 0 || opDone(d.unlock);
  function totalPoints() {
    let t = 0;
    Object.values(S.phases).forEach((p) => { t += p.score || 0; });
    t += Object.keys(S.opsDone).length * 100;
    return t;
  }
  const MAX_POINTS = PHASES.reduce((a, p) => a + 100 + (p.bonus ? 20 : 0), 0) + OPERATIONS.length * 100;
  function rank() {
    const d = doneCount();
    if (S.finishedAt) return 'Agente da Transformação';
    if (d >= 24) return 'Líder de Operação';
    if (d >= 12) return 'Especialista';
    if (d >= 6) return 'Analista';
    return 'Recruta';
  }

  /* =================== UTILITÁRIOS =================== */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (s) => esc(s).replace(/(#[0-9A-Za-zÀ-ÿ_]+)/g, '<span class="tag">$1</span>').replace(/(@[0-9A-Za-zÀ-ÿ_.]+)/g, '<span class="mention">$1</span>');
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function shuffledIdx(n, avoidIdentity) {
    const base = [...Array(n).keys()];
    let a = shuffle(base);
    if (avoidIdentity && n > 1) {
      let guard = 0;
      while (a.every((v, i) => v === i) && guard++ < 20) a = shuffle(base);
    }
    return a;
  }
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const LETTERS = 'ABCDEFGH';

  /* =================== SOM (opcional) =================== */
  const Sound = {
    ctx: null,
    tone(f, t0, dur, type = 'sine', vol = 0.12) {
      const c = this.ctx; const o = c.createOscillator(); const g = c.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, c.currentTime + t0);
      g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
      o.connect(g); g.connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
    },
    play(kind) {
      if (!S.sound) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        switch (kind) {
          case 'click': this.tone(700, 0, 0.06, 'sine', 0.05); break;
          case 'ok': [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.08, 0.22, 'triangle', 0.1)); break;
          case 'soft': this.tone(392, 0, 0.18, 'sine', 0.06); this.tone(349, 0.12, 0.24, 'sine', 0.05); break;
          case 'win': [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, i * 0.1, 0.35, 'triangle', 0.1)); break;
          case 'open': this.tone(520, 0, 0.08, 'sine', 0.06); this.tone(780, 0.06, 0.1, 'sine', 0.05); break;
        }
      } catch (e) { /* sem áudio */ }
    }
  };

  /* =================== MODAIS E AVISOS =================== */
  let modalOnClose = null;
  function openModal({ title = '', html = '', buttons = null, wide = false, cls = '', onClose = null, icon = '' }) {
    modalOnClose = onClose;
    const btns = buttons || [{ label: 'Fechar', cls: 'btn-primary', act: 'closeModal' }];
    modalRoot.innerHTML = `<div class="modal-backdrop" data-act="backdrop">
      <div class="modal ${wide ? 'modal-wide' : ''} ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <button class="modal-x" data-act="closeModal" aria-label="Fechar">✕</button>
        ${title ? `<h2 class="modal-title">${icon ? `<span class="modal-icon">${icon}</span>` : ''}${title}</h2>` : ''}
        <div class="modal-body">${html}</div>
        <div class="modal-actions">${btns.map((b) => `<button class="btn ${b.cls || 'btn-ghost'}" data-act="${b.act}" ${b.data || ''}>${b.label}</button>`).join('')}</div>
      </div></div>`;
    modalRoot.classList.add('open');
    const first = modalRoot.querySelector('.modal-actions .btn');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
  }
  function closeModal() {
    modalRoot.classList.remove('open');
    modalRoot.innerHTML = '';
    const cb = modalOnClose; modalOnClose = null;
    if (cb) cb();
  }
  function toast(html, ms = 3200) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = html;
    toastRoot.appendChild(el);
    setTimeout(() => el.classList.add('out'), ms);
    setTimeout(() => el.remove(), ms + 500);
  }
  function confetti(n = 90) {
    const layer = document.createElement('div');
    layer.className = 'confetti';
    const colors = ['#f97316', '#fbbf24', '#a855f7', '#22c55e', '#38bdf8', '#f472b6', '#ffffff'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = pick(colors);
      s.style.animationDelay = Math.random() * 0.8 + 's';
      s.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      if (Math.random() > 0.5) s.style.borderRadius = '50%';
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 4800);
  }

  /* =================== NAVEGAÇÃO =================== */
  let screen = 'home';
  function render(html, name) {
    screen = name;
    app.innerHTML = `<div class="screen screen-${name}">${html}</div>`;
    window.scrollTo(0, 0);
  }

  function soundBtn() {
    return `<button class="icon-btn" data-act="toggleSound" aria-label="${S.sound ? 'Desativar sons' : 'Ativar sons'}" title="${S.sound ? 'Sons ativados' : 'Sons desativados'}">${S.sound ? '🔊' : '🔇'}</button>`;
  }

  function hud() {
    const pct = Math.round((doneCount() / PHASES.length) * 100);
    return `<header class="hud">
      <button class="hud-brand" data-act="goHome" aria-label="Ir para a tela inicial">${ART.logo(38)}<span>OPERAÇÃO<br><b>RESPEITO</b></span></button>
      <div class="hud-stats">
        <div class="chip chip-points" title="Pontuação total"><span>⭐</span><b>${totalPoints()}</b><small>pontos</small></div>
        <div class="chip" title="Fases concluídas"><span>📁</span><b>${doneCount()}/30</b><small>fases</small></div>
        <div class="chip" title="Operações desbloqueadas"><span>🔓</span><b>${opsUnlockedCount()}/5</b><small>operações</small></div>
        <button class="chip chip-btn" data-act="goMedals" title="Conquistas"><span>🏅</span><b>${medalCount()}/${MEDALS.length}</b><small>medalhas</small></button>
      </div>
      <div class="hud-actions">${soundBtn()}<button class="icon-btn" data-act="openMenu" aria-label="Abrir menu">☰</button></div>
      <div class="hud-bar" title="Progresso geral: ${pct}%"><i style="width:${pct}%"></i></div>
    </header>`;
  }

  /* =================== TELA INICIAL =================== */
  function showHome() {
    const started = S.started;
    render(`
      <div class="home">
        <div class="home-bg" aria-hidden="true"><span class="scan"></span></div>
        <div class="home-top">${soundBtn()}</div>
        <div class="home-grid">
          <div class="home-left">
            <div class="home-logo">${ART.logo(132)}</div>
            <p class="kicker">AGÊNCIA DE INVESTIGAÇÃO DIGITAL • CASO CONECTA</p>
            <h1 class="title">OPERAÇÃO <span>RESPEITO</span></h1>
            <p class="subtitle">Investigando o racismo nas redes sociais</p>
            <p class="tagline">Investigue o preconceito. Descubra a verdade. <b>Transforme a internet.</b></p>
            <div class="home-buttons">
              ${started ? `<button class="btn btn-primary btn-xl" data-act="continue">▶ CONTINUAR INVESTIGAÇÃO</button>` : ''}
              <button class="btn ${started ? 'btn-secondary' : 'btn-primary'} btn-xl" data-act="start">🔍 INICIAR INVESTIGAÇÃO</button>
              <div class="home-row">
                <button class="btn btn-ghost btn-lg" data-act="howTo">❔ COMO JOGAR</button>
                <button class="btn btn-ghost btn-lg" data-act="about">✊🏾 SOBRE O NOVEMBRO NEGRO</button>
              </div>
            </div>
          </div>
          <div class="home-right">
            <div class="hero-card">${ART.heroScene()}</div>
            <blockquote class="impact">“Na internet, respeito não é opcional. <b>Investigue, descubra e transforme!</b>”</blockquote>
          </div>
        </div>
        <footer class="home-foot">
          <span>Jogo educativo • 7º ano • Novembro Negro e Dia Nacional de Zumbi e da Consciência Negra (20/11)</span>
          <button class="link-btn" data-act="teacher">🔐 Área do Professor</button>
        </footer>
      </div>`, 'home');
  }

  /* =================== INTRODUÇÃO NARRATIVA =================== */
  function showIntro() {
    const lines = [
      'A rede social <b>CONECTA</b> recebeu diversas denúncias de publicações, comentários e comportamentos discriminatórios.',
      'Nossa equipe precisa investigar cada caso.',
      'Você foi selecionado para integrar a <b>Agência de Investigação Digital</b>.',
      'Sua missão será analisar evidências, identificar manifestações de racismo e descobrir como construir uma internet mais justa e respeitosa.',
      '<b class="hl">Você está preparado, agente?</b>'
    ];
    render(`
      <div class="intro">
        <div class="alert-panel">
          <div class="alert-head"><span class="siren"></span><span class="alert-title">ALERTA DE MISSÃO!</span><span class="siren"></span></div>
          <div class="alert-meta"><span>CANAL SEGURO • AID-CENTRAL</span><span>PRIORIDADE MÁXIMA</span></div>
          <div class="director">
            <div class="director-av">${ART.face('ayana', { expr: 'smile' })}</div>
            <div><strong>Diretora Ayana Silva</strong><small>Agência de Investigação Digital</small></div>
          </div>
          <div class="alert-lines">${lines.map((l, i) => `<p style="animation-delay:${0.4 + i * 0.9}s">${l}</p>`).join('')}</div>
          <div class="alert-actions" style="animation-delay:${0.4 + lines.length * 0.9}s">
            <button class="btn btn-primary btn-xl" data-act="acceptMission">✔ ACEITAR MISSÃO</button>
            <button class="btn btn-ghost" data-act="goHome">Voltar</button>
          </div>
        </div>
      </div>`, 'intro');
  }

  /* =================== CREDENCIAL =================== */
  let tempAgent = 0;
  function showCredential() {
    tempAgent = S.agent ?? 0;
    const code = S.code || ('AID-' + Math.floor(1000 + Math.random() * 9000));
    S.code = code;
    render(`
      <div class="credential">
        <div class="cred-card">
          <p class="kicker">CREDENCIAL DE ACESSO</p>
          <h2>Escolha o visual do seu agente</h2>
          <p class="muted">Não pedimos nome, e-mail nem nenhum dado pessoal. Seu código de agente é <b class="code">${code}</b>.</p>
          <div class="agent-grid">${ART.AGENT_OPTIONS.map((o, i) => `<button class="agent-opt ${i === tempAgent ? 'sel' : ''}" data-act="pickAgent" data-i="${i}" aria-label="Visual ${i + 1}">${ART.avatar(o)}</button>`).join('')}</div>
          <button class="btn btn-primary btn-xl" data-act="confirmAgent">CONFIRMAR CREDENCIAL ➜</button>
        </div>
      </div>`, 'credential');
  }

  /* =================== MAPA DAS OPERAÇÕES =================== */
  function agentAvatar() { return ART.avatar(ART.AGENT_OPTIONS[S.agent ?? 0]); }

  function showMap() {
    const cards = OPERATIONS.map((o) => {
      const unlocked = opUnlocked(o.id), done = opDone(o.id), prog = opProgress(o.id);
      const status = done ? 'concluida' : unlocked ? (prog > 0 ? 'andamento' : 'disponivel') : 'bloqueada';
      const label = { concluida: '✔ CONCLUÍDA', andamento: '▶ EM ANDAMENTO', disponivel: '● DISPONÍVEL', bloqueada: '🔒 BLOQUEADA' }[status];
      return `<button class="op-card st-${status}" data-act="openOp" data-op="${o.id}" style="--opc:${o.color}" aria-label="Operação ${pad(o.id)}: ${o.name}. ${label}">
        <div class="op-node"><span>${pad(o.id)}</span></div>
        <div class="op-content">
          <div class="op-head"><span class="op-num">OPERAÇÃO ${pad(o.id)}</span><span class="status st-${status}">${label}</span></div>
          <div class="op-main">
            <div class="op-icon">${ART.OP_ICONS[o.id]}</div>
            <div><h3>${o.name}</h3><p>${o.desc}</p></div>
          </div>
          <div class="op-meta"><span>📁 6 fases</span><span>📈 ${o.level}</span><span class="op-count">${prog}/6</span></div>
          <div class="bar"><i style="width:${(prog / 6) * 100}%"></i></div>
        </div>
      </button>`;
    }).join('');
    render(`${hud()}
      <main class="wrap">
        <section class="agent-strip">
          <div class="agent-av">${agentAvatar()}</div>
          <div class="agent-info"><small>AGENTE</small><b>${S.code || 'AID'}</b><span>${rank()}</span></div>
          <div class="agent-progress"><small>PROGRESSO DA OPERAÇÃO RESPEITO</small>
            <div class="bar big"><i style="width:${(doneCount() / 30) * 100}%"></i></div>
            <span>${doneCount()} de 30 fases • ${totalPoints()} de ${MAX_POINTS} pontos</span></div>
          <div class="agent-links">
            <button class="btn btn-ghost" data-act="goDossier">📂 Dossiê Antirracista</button>
            <button class="btn btn-ghost" data-act="goMedals">🏅 Medalhas</button>
            ${S.finishedAt ? `<button class="btn btn-success" data-act="goFinal">📜 Certificado</button>` : ''}
          </div>
        </section>
        <h2 class="section-title"><span>MAPA DE OPERAÇÕES</span> Central da Agência</h2>
        <div class="op-path">${cards}</div>
      </main>`, 'map');
  }

  /* =================== TELA DA OPERAÇÃO =================== */
  function showOp(opId) {
    const o = OPERATIONS[opId - 1];
    const list = opPhases(opId).map((p) => {
      const done = phaseDone(p.id), unlocked = phaseUnlocked(p.id);
      const st = done ? 'concluida' : unlocked ? 'disponivel' : 'bloqueada';
      const mechs = p.mech.map((m) => `<span class="mchip">${MECH[m]}</span>`).join('');
      return `<button class="phase-card st-${st}" data-act="openPhase" data-id="${p.id}" aria-label="Fase ${pad(p.id)}: ${p.title}">
        <div class="pc-num">FASE<b>${pad(p.id)}</b></div>
        <div class="pc-body"><h3>${p.title}</h3><div class="mchips">${mechs}${p.bonus ? '<span class="mchip bonus">+20 investigação</span>' : ''}</div></div>
        <div class="pc-status">${done ? `<span class="done-badge">✔</span><small>${S.phases[p.id].score} pts</small>` : unlocked ? '<span class="play-badge">▶</span><small>Jogar</small>' : '<span class="lock-badge">🔒</span><small>Bloqueada</small>'}</div>
      </button>`;
    }).join('');
    render(`${hud()}
      <main class="wrap">
        <button class="back-btn" data-act="goMap">← Mapa de operações</button>
        <section class="op-hero" style="--opc:${o.color}">
          <div class="op-hero-icon">${ART.OP_ICONS[o.id]}</div>
          <div class="op-hero-text"><span class="op-num">OPERAÇÃO ${pad(o.id)} • ${o.level}</span><h1>${o.name}</h1><p>${o.desc}</p></div>
          <div class="op-hero-prog"><b>${opProgress(opId)}/6</b><small>fases concluídas</small><div class="bar"><i style="width:${(opProgress(opId) / 6) * 100}%"></i></div></div>
        </section>
        <div class="phase-list">${list}</div>
      </main>`, 'op');
  }

  /* =================== FASE =================== */
  let cur = null;

  function startPhase(id) {
    const p = PHASES.find((x) => x.id === id);
    cur = { p, stepIdx: 0, scores: [], errors: 0, solved: false, campaign: {} };
    renderStep();
  }

  function stepDots() {
    return `<div class="step-dots" aria-label="Etapa ${cur.stepIdx + 1} de ${cur.p.steps.length}">${cur.p.steps.map((_, i) => `<i class="${i < cur.stepIdx ? 'done' : i === cur.stepIdx ? 'now' : ''}"></i>`).join('')}</div>`;
  }

  function briefHTML() {
    const p = cur.p;
    if (cur.stepIdx === 0) {
      return `<section class="brief">
        <div class="brief-av">${ART.face('ayana')}</div>
        <div class="brief-text"><span class="brief-from">📡 Diretora Ayana • briefing do caso</span><p>${p.brief}</p></div>
      </section>`;
    }
    return `<section class="brief brief-mini"><span class="brief-from">📁 Caso em andamento</span><span>Etapa ${cur.stepIdx + 1} de ${p.steps.length}</span></section>`;
  }

  function renderStep() {
    const p = cur.p, step = p.steps[cur.stepIdx], op = OPERATIONS[p.op - 1];
    cur.solved = false; cur.stepErrors = 0;
    cur.sel = new Set(); cur.cls = {}; cur.review = new Set();
    cur.mLeft = null; cur.pairs = {}; cur.seq = []; cur.viewed = new Set(); cur.wrongOpts = new Set();

    const t = step.type;
    if (t === 'choice') cur.optOrder = shuffledIdx(step.options.length, true);
    if (t === 'multi' && step.layout === 'cards') cur.itemOrder = shuffledIdx(step.items.length);
    if (t === 'match') cur.rightOrder = shuffledIdx(step.right.length, true);
    if (t === 'order') cur.pool = shuffledIdx(step.items.length, true);

    render(`
      <div class="phase" style="--opc:${op.color}">
        <header class="phase-top">
          <button class="back-btn" data-act="leavePhase">← Sair</button>
          <div class="phase-title"><span>OPERAÇÃO ${pad(p.op)} • FASE ${pad(p.id)}</span><h1>${p.title}</h1></div>
          ${stepDots()}
          <div class="phase-tools">${soundBtn()}</div>
        </header>
        ${briefHTML()}
        <div id="stage"></div>
        <div class="actionbar" id="actionbar"></div>
      </div>`, 'phase');
    drawStage();
  }

  /* ---------- Cenas da rede CONECTA ---------- */
  function conectaBar(kind) {
    return `<div class="conecta-bar"><span class="conecta-logo"><i></i>conecta${kind === 'chat' ? '<em>chat</em>' : ''}</span><span class="conecta-icons">🔍 🔔</span></div>`;
  }
  function commentHTML(c, extraCls = '', attrs = '', inner = null) {
    return `<div class="ccomment ${c.hl ? 'hl' : ''} ${extraCls}" ${attrs}>
      <div class="cc-av">${ART.face(c.who || 'anon')}</div>
      <div class="cc-bubble"><strong>${esc(c.name)}</strong><span>${inner != null ? inner : fmt(c.text || c.t)}</span></div>
    </div>`;
  }
  function postHTML(sc, opt = {}) {
    const comments = opt.commentsHTML != null ? opt.commentsHTML : (sc.comments || []).map((c) => commentHTML(c)).join('');
    const nComments = opt.nComments != null ? opt.nComments : (sc.comments || []).length;
    return `<div class="conecta">${conectaBar()}
      <article class="cpost">
        <header class="cpost-h"><div class="cpost-av">${ART.face(sc.who)}</div>
          <div class="cpost-id"><strong>${esc(sc.name)}${sc.verified ? ' <span class="verif" title="Perfil verificado">✔</span>' : ''}</strong><span>${esc(sc.handle)} • ${sc.time}</span></div>
          <span class="cpost-flag">🚩 denunciado</span></header>
        ${sc.text ? `<p class="cpost-text">${fmt(sc.text)}</p>` : ''}
        ${sc.photo ? `<div class="cpost-media">${ART.photo(sc.photo, sc.photoCap)}</div>` : ''}
        ${sc.censored ? `<div class="cpost-media">${ART.censored(sc.censored.desc, sc.censored.caption)}</div>` : ''}
        <div class="cpost-actions"><span>❤️ ${(sc.likes || 0).toLocaleString('pt-BR')}</span><span>💬 ${nComments}</span><span>↗ Compartilhar</span></div>
        ${comments ? `<div class="cpost-comments">${comments}</div>` : ''}
      </article></div>`;
  }
  function chatMsgHTML(m, extraCls = '', attrs = '') {
    if (m.sys) return `<div class="cmsg-sys">${esc(m.t)}</div>`;
    const content = m.hidden ? `<em class="hidden-msg">🔒 ${esc(m.t)}</em>` : fmt(m.t);
    const cens = m.censored ? `<div class="mini-censored">🔒 Imagem ocultada pela Agência<small>${esc(m.censored)}</small></div>` : '';
    return `<div class="cmsg ${extraCls}" ${attrs}><div class="cm-av">${ART.face(m.who || 'anon')}</div>
      <div class="cm-bubble"><strong>${esc(m.name)}</strong>${cens}<span>${content}</span></div></div>`;
  }
  function chatHTML(sc, bodyOverride) {
    return `<div class="conecta chat">${conectaBar('chat')}
      <div class="chat-head">${sc.live ? '<span class="live">AO VIVO</span>' : '<span class="chat-ico">💬</span>'}<div><strong>${esc(sc.title)}</strong><small>${esc(sc.members || '')}</small></div></div>
      <div class="chat-body">${bodyOverride != null ? bodyOverride : sc.messages.map((m) => chatMsgHTML(m)).join('')}</div>
      <div class="chat-input"><span>Mensagem</span><i>➤</i></div></div>`;
  }
  function sceneHTML(sc) {
    if (!sc) return '';
    if (sc.kind === 'post') return postHTML(sc);
    if (sc.kind === 'chat') return chatHTML(sc);
    return '';
  }

  /* ---------- Desenho da etapa ---------- */
  function drawStage() {
    const step = cur.p.steps[cur.stepIdx];
    const stage = document.getElementById('stage');
    const ab = document.getElementById('actionbar');
    let sceneSide = '', task = '', action = '';
    const prompt = `<h2 class="prompt">${step.prompt}</h2>`;

    switch (step.type) {
      case 'choice': {
        sceneSide = sceneHTML(step.scene);
        task = prompt + `<div class="options">${cur.optOrder.map((i, k) => {
          const o = step.options[i];
          const st = cur.wrongOpts.has(i) ? 'wrong' : (cur.solved && o.ok ? 'right' : '');
          return `<button class="option ${st}" data-act="choose" data-i="${i}" ${cur.wrongOpts.has(i) || cur.solved ? 'disabled' : ''}><span class="opt-letter">${LETTERS[k]}</span><span class="opt-text">${esc(o.t)}</span>${st === 'wrong' ? '<span class="opt-mark">✕</span>' : st === 'right' ? '<span class="opt-mark">✔</span>' : ''}</button>`;
        }).join('')}</div>`;
        action = `<div class="ab-hint">${cur.wrongOpts.size ? '💡 Leia a pista e escolha outra alternativa.' : '👆 Toque na alternativa que você considera correta.'}</div>`;
        break;
      }
      case 'multi': {
        const sel = cur.sel.size;
        if (step.layout === 'cards') {
          sceneSide = sceneHTML(step.scene);
          task = prompt + `<div class="sel-grid">${cur.itemOrder.map((i) => {
            const it = step.items[i]; const on = cur.sel.has(i); const rv = cur.review.has(i);
            const cls = cur.solved ? (it.ok ? 'right' : 'neutral') : '';
            return `<button class="sel-card ${on ? 'on' : ''} ${rv ? 'review' : ''} ${cls}" data-act="toggle" data-i="${i}" aria-pressed="${on}" ${cur.solved ? 'disabled' : ''}>
              <span class="check">${on ? '✔' : ''}</span><span class="sel-text">${esc(it.t)}</span>${rv ? `<span class="hint">💡 ${esc(it.fb)}</span>` : ''}</button>`;
          }).join('')}</div>`;
        } else {
          task = prompt + `<p class="task-help">${step.layout === 'segments' ? '👆 Toque nos trechos do comentário para marcá-los. Toque de novo para desmarcar.' : '👆 Toque nos itens para marcá-los. Toque de novo para desmarcar.'}</p>
            <div class="sel-counter">Marcados: <b>${sel}</b></div>`;
          sceneSide = interactiveScene(step);
        }
        action = `<div class="ab-hint">${cur.review.size ? '💡 Revise os itens com pista e verifique de novo.' : 'Selecione e depois toque em VERIFICAR.'}</div>
          <button class="btn btn-primary btn-lg" data-act="verifyMulti" ${sel === 0 ? 'disabled' : ''}>VERIFICAR ✔</button>`;
        break;
      }
      case 'classify': {
        sceneSide = sceneHTML(step.scene);
        const all = step.items.every((_, i) => cur.cls[i]);
        task = prompt + `<div class="cls-list">${step.items.map((it, i) => {
          const rv = cur.review.has(i);
          return `<div class="cls-item ${rv ? 'review' : ''} ${cur.solved ? 'right' : ''}">
            <p class="cls-text">${esc(it.t)}</p>
            <div class="cls-btns" role="group" aria-label="Classificação">${step.cats.map((c) => `<button class="cls-btn ${c.cls} ${cur.cls[i] === c.id ? 'on' : ''}" data-act="classify" data-i="${i}" data-c="${c.id}" aria-pressed="${cur.cls[i] === c.id}" ${cur.solved ? 'disabled' : ''}><span>${c.icon}</span>${c.label}</button>`).join('')}</div>
            ${rv ? `<p class="hint">💡 ${esc(it.fb)}</p>` : ''}
            ${cur.solved ? `<p class="explain">✔ ${esc(it.fb)}</p>` : ''}
          </div>`;
        }).join('')}</div>`;
        action = `<div class="ab-hint">Classificados: <b>${Object.keys(cur.cls).length}/${step.items.length}</b></div>
          <button class="btn btn-primary btn-lg" data-act="verifyClassify" ${all ? '' : 'disabled'}>VERIFICAR ✔</button>`;
        break;
      }
      case 'match': {
        sceneSide = sceneHTML(step.scene);
        const pairedRight = {}; Object.entries(cur.pairs).forEach(([l, r]) => { pairedRight[r] = +l; });
        const leftHTML = step.left.map((t, i) => {
          const pr = cur.pairs[i] != null; const rv = cur.review.has(i);
          return `<button class="m-item m-left ${cur.mLeft === i ? 'active' : ''} ${pr ? 'paired' : ''} ${rv ? 'review' : ''}" data-act="mLeft" data-i="${i}" style="--pc:var(--pair${i})" ${cur.solved ? 'disabled' : ''}>
            <span class="m-badge">${LETTERS[i]}</span><span>${esc(t)}</span>${rv ? `<span class="hint">💡 ${esc(step.fb[i])}</span>` : ''}</button>`;
        }).join('');
        const rightHTML = cur.rightOrder.map((j) => {
          const l = pairedRight[j];
          return `<button class="m-item m-right ${l != null ? 'paired' : ''}" data-act="mRight" data-j="${j}" style="--pc:var(--pair${l != null ? l : 'x'})" ${cur.solved ? 'disabled' : ''}>
            <span class="m-badge">${l != null ? LETTERS[l] : '?'}</span><span>${esc(step.right[j])}</span></button>`;
        }).join('');
        task = prompt + `<p class="task-help">1️⃣ Toque em um item da coluna da esquerda. 2️⃣ Toque no significado correspondente. Para desfazer, toque no item de novo.</p>
          <div class="match-grid"><div class="m-col"><h4>Elementos</h4>${leftHTML}</div><div class="m-col"><h4>Significados</h4>${rightHTML}</div></div>`;
        const n = Object.keys(cur.pairs).length;
        action = `<div class="ab-hint">Associações: <b>${n}/${step.left.length}</b></div>
          <button class="btn btn-primary btn-lg" data-act="verifyMatch" ${n === step.left.length ? '' : 'disabled'}>VERIFICAR ✔</button>`;
        break;
      }
      case 'order': {
        sceneSide = sceneHTML(step.scene);
        const seqHTML = step.items.map((_, k) => {
          const i = cur.seq[k];
          if (i == null) return `<div class="seq-slot empty"><span class="seq-n">${k + 1}</span><span class="muted">Toque em uma ação abaixo</span></div>`;
          const rv = cur.review.has(k);
          return `<button class="seq-slot ${rv ? 'review' : ''} ${cur.solved ? 'right' : ''}" data-act="unorder" data-k="${k}" ${cur.solved ? 'disabled' : ''}><span class="seq-n">${k + 1}</span><span>${esc(step.items[i].t)}</span>${rv ? '<span class="hint">💡 Essa ação não está na posição certa. Toque para removê-la.</span>' : ''}${cur.solved ? `<span class="explain">✔ ${esc(step.items[i].fb)}</span>` : ''}</button>`;
        }).join('');
        const poolHTML = cur.pool.filter((i) => !cur.seq.includes(i)).map((i) => `<button class="pool-item" data-act="pushOrder" data-i="${i}">＋ ${esc(step.items[i].t)}</button>`).join('');
        task = prompt + `<div class="seq">${seqHTML}</div>${poolHTML ? `<h4 class="pool-title">Ações disponíveis</h4><div class="pool">${poolHTML}</div>` : ''}`;
        const full = cur.seq.length === step.items.length;
        action = `<button class="btn btn-ghost" data-act="clearOrder" ${cur.seq.length && !cur.solved ? '' : 'disabled'}>↺ Limpar</button>
          <button class="btn btn-primary btn-lg" data-act="verifyOrder" ${full && !cur.solved ? '' : 'disabled'}>VERIFICAR ✔</button>`;
        break;
      }
      case 'evidence': {
        sceneSide = sceneHTML(step.scene);
        task = prompt + `<div class="files">${step.files.map((f, i) => `<button class="file ${cur.viewed.has(i) ? 'viewed' : ''}" data-act="openFile" data-i="${i}">
          <span class="file-ico">${f.icon}</span><span class="file-title">${esc(f.title)}</span><span class="file-st">${cur.viewed.has(i) ? '✔ analisada' : '🔒 abrir'}</span></button>`).join('')}</div>`;
        const all = cur.viewed.size === step.files.length;
        action = `<div class="ab-hint">Evidências analisadas: <b>${cur.viewed.size}/${step.files.length}</b></div>
          <button class="btn btn-primary btn-lg" data-act="evidenceDone" ${all ? '' : 'disabled'}>CONCLUIR ANÁLISE ➜</button>`;
        break;
      }
      case 'showcase': {
        task = prompt + posterHTML();
        action = `<button class="btn btn-success btn-lg" data-act="nextStep">PUBLICAR CAMPANHA 🚀</button>`;
        break;
      }
    }
    if (cur.solved) {
      const last = cur.stepIdx === cur.p.steps.length - 1;
      action = `<div class="ab-hint ok">✔ Etapa concluída!</div><button class="btn btn-success btn-lg" data-act="nextStep">${last ? 'CONCLUIR CASO ✔' : 'PRÓXIMA ETAPA ➜'}</button>`;
    }
    stage.className = 'stage ' + (sceneSide ? 'has-scene' : 'no-scene');
    stage.innerHTML = (sceneSide ? `<div class="stage-scene">${sceneSide}</div>` : '') + `<div class="stage-task">${task}</div>`;
    ab.innerHTML = action;
  }

  /* ---------- Cenas interativas (seleção dentro da publicação) ---------- */
  function selState(i) {
    const on = cur.sel.has(i), rv = cur.review.has(i);
    const it = cur.p.steps[cur.stepIdx].items[i];
    return { on, rv, cls: `${on ? 'on' : ''} ${rv ? 'review' : ''} ${cur.solved ? (it.ok ? 'right' : 'neutral') : ''}`, hint: rv ? `<span class="hint">💡 ${esc(it.fb)}</span>` : (cur.solved && it.ok ? `<span class="explain">✔ ${esc(it.fb)}</span>` : '') };
  }
  function interactiveScene(step) {
    const dis = cur.solved ? 'disabled' : '';
    if (step.layout === 'comments') {
      const html = step.items.map((it, i) => {
        const s = selState(i);
        return `<button class="pick ${s.cls}" data-act="toggle" data-i="${i}" aria-pressed="${s.on}" ${dis}>${commentHTML({ who: it.who, name: it.name, text: it.t })}<span class="pick-mark">${s.on ? '🚩' : ''}</span>${s.hint}</button>`;
      }).join('');
      return postHTML(step.scene, { commentsHTML: html, nComments: step.items.length });
    }
    if (step.layout === 'segments') {
      const segs = step.items.map((it, i) => {
        const s = selState(i);
        return `<button class="seg ${s.cls}" data-act="toggle" data-i="${i}" aria-pressed="${s.on}" ${dis}>${esc(it.t)}</button>`;
      }).join(' ');
      const hints = step.items.map((it, i) => { const s = selState(i); return s.hint ? `<div class="seg-hint"><b>“${esc(it.t)}”</b> ${s.hint}</div>` : ''; }).join('');
      const comment = `<div class="ccomment hl seg-comment"><div class="cc-av">${ART.face(step.commenter.who)}</div><div class="cc-bubble"><strong>${esc(step.commenter.name)}</strong><span class="seg-wrap">${segs}</span></div></div>${hints}`;
      return postHTML(step.scene, { commentsHTML: comment, nComments: 1 });
    }
    if (step.layout === 'chat') {
      const html = step.items.map((it, i) => {
        const s = selState(i);
        return `<button class="pick pick-chat ${s.cls}" data-act="toggle" data-i="${i}" aria-pressed="${s.on}" ${dis}>${chatMsgHTML({ who: it.who, name: it.name, t: it.t })}<span class="pick-mark">${s.on ? '🚩' : ''}</span>${s.hint}</button>`;
      }).join('');
      return chatHTML({ title: step.chatTitle, members: 'grupo de mensagens' }, html);
    }
    if (step.layout === 'post') {
      const sc = step.scene;
      const part = (i, inner, extra = '') => { const s = selState(i); return `<button class="pick pick-part ${extra} ${s.cls}" data-act="toggle" data-i="${i}" aria-pressed="${s.on}" ${dis}>${inner}<span class="pick-mark">${s.on ? '🚩' : ''}</span>${s.hint}</button>`; };
      let image = '', caption = '', loc = '', tags = '', comments = '';
      step.items.forEach((it, i) => {
        if (it.part === 'image') image = part(i, `<div class="cpost-media">${ART.censored(it.t, '')}</div>`, 'pp-image');
        if (it.part === 'caption') caption = part(i, `<p class="cpost-text">${fmt(it.t)}</p>`, 'pp-caption');
        if (it.part === 'location') loc = part(i, `<span class="pp-loc">${esc(it.t)}</span>`, 'pp-inline');
        if (it.part === 'tags') tags = part(i, `<span class="pp-tags">${fmt(it.t)}</span>`, 'pp-inline');
        if (it.part === 'comment') comments += part(i, commentHTML({ who: it.who, name: it.name, text: it.t }), 'pp-comment');
      });
      return `<div class="conecta">${conectaBar()}<article class="cpost">
        <header class="cpost-h"><div class="cpost-av">${ART.face(sc.who)}</div><div class="cpost-id"><strong>${esc(sc.name)}</strong><span>${esc(sc.handle)} • ${sc.time}</span></div><span class="cpost-flag">🚩 denunciado</span></header>
        <div class="pp-row">${loc}</div>${caption}${image}<div class="pp-row">${tags}</div>
        <div class="cpost-actions"><span>❤️ ${sc.likes}</span><span>💬 3</span><span>↗ Compartilhar</span></div>
        <div class="cpost-comments">${comments}</div></article></div>`;
    }
    return '';
  }

  /* ---------- Cartaz da campanha (Fase 29) ---------- */
  function posterHTML() {
    const ph = cur.p.steps.filter((s) => s.campaign);
    const get = (k) => { const s = ph.find((x) => x.campaign === k); return s.options.find((o) => o.ok).t; };
    const people = [
      { skin: 's1', hair: 'puff', hairColor: 'black', shirt: '#6366f1', glasses: true, expr: 'big' },
      { skin: 's3', hair: 'braids', hairColor: 'black', shirt: '#f97316', earrings: true, expr: 'big' },
      { skin: 's2', hair: 'twists', hairColor: 'black', shirt: '#22c55e', expr: 'big' },
      { skin: 's4', hair: 'curly', hairColor: 'dark', shirt: '#eab308', expr: 'big' },
      { skin: 's2', hair: 'afro', hairColor: 'black', shirt: '#ec4899', earrings: true, expr: 'big' }
    ];
    const roles = ['🔬 cientista', '🎨 artista', '🏀 atleta', '🎮 gamer', '🎤 cantora'];
    return `<div class="poster">
      <div class="poster-top"><span class="conecta-logo"><i></i>conecta</span><span>CAMPANHA • NOVEMBRO NEGRO</span></div>
      <h3 class="poster-slogan">${esc(get('slogan'))}</h3>
      <div class="poster-people">${people.map((o, i) => `<figure>${ART.avatar(o)}<figcaption>${roles[i]}</figcaption></figure>`).join('')}</div>
      <p class="poster-cta">${fmt(get('cta'))}</p>
      <div class="poster-foot">${ART.logo(34)} Agência de Investigação Digital • Operação Respeito</div>
    </div>`;
  }

  /* ---------- Avaliação ---------- */
  const OK_TITLES = ['Excelente, agente!', 'Pista confirmada!', 'Análise precisa!', 'Muito bem, agente!', 'Caso esclarecido!'];
  const RETRY_TITLES = ['Vamos analisar de novo', 'Quase lá, agente!', 'Revise essa pista', 'Toda investigação tem desvios'];

  function sheet({ ok, title, html, btn, act }) {
    openModal({
      title, icon: ok ? '✅' : '🔎', cls: ok ? 'sheet sheet-ok' : 'sheet sheet-retry', html,
      buttons: [{ label: btn, cls: ok ? 'btn-success' : 'btn-primary', act }]
    });
  }

  function stepSolved(fbHTML) {
    cur.solved = true;
    const score = cur.stepErrors === 0 ? 100 : 60;
    cur.scores.push(score);
    cur.errors += cur.stepErrors;
    Sound.play('ok');
    drawStage();
    const last = cur.stepIdx === cur.p.steps.length - 1;
    sheet({
      ok: true, title: pick(OK_TITLES),
      html: `${fbHTML}<div class="sheet-score">${score === 100 ? '🎯 Acerto na primeira tentativa: <b>+100</b>' : '💪 Acerto após revisão: <b>+60</b>'}</div>`,
      btn: last ? 'CONCLUIR CASO ✔' : 'PRÓXIMA ETAPA ➜', act: 'nextStep'
    });
  }
  function stepMiss(fbHTML) {
    cur.stepErrors++;
    Sound.play('soft');
    drawStage();
    sheet({ ok: false, title: pick(RETRY_TITLES), html: fbHTML + '<p class="sheet-note">Errar faz parte da investigação. Nenhum ponto foi perdido — tente de novo!</p>', btn: 'TENTAR NOVAMENTE', act: 'closeModal' });
  }

  function choose(i) {
    const step = cur.p.steps[cur.stepIdx]; const o = step.options[i];
    if (cur.solved || cur.wrongOpts.has(i)) return;
    if (o.ok) {
      if (step.campaign) cur.campaign[step.campaign] = o.t;
      stepSolved(`<p class="fb-main">${esc(o.fb)}</p>`);
    } else {
      cur.wrongOpts.add(i);
      stepMiss(`<p class="fb-main">${esc(o.fb)}</p>`);
    }
  }

  function verifyMulti() {
    const step = cur.p.steps[cur.stepIdx];
    const wrong = [];
    step.items.forEach((it, i) => { if (!!it.ok !== cur.sel.has(i)) wrong.push(i); });
    if (!wrong.length) {
      cur.review.clear();
      const list = step.items.map((it) => `<li class="${it.ok ? 'is-ok' : 'is-no'}"><b>${it.ok ? '🚩' : '✔'}</b> <span><em>${esc(it.t)}</em> — ${esc(it.fb)}</span></li>`).join('');
      stepSolved(`<p class="fb-main">Você identificou corretamente todos os itens!</p><ul class="fb-list">${list}</ul>`);
    } else {
      cur.review = new Set(wrong);
      const missed = wrong.filter((i) => step.items[i].ok).length;
      const extra = wrong.length - missed;
      let msg = '';
      if (missed) msg += `<li>Faltou marcar <b>${missed}</b> item(ns).</li>`;
      if (extra) msg += `<li><b>${extra}</b> item(ns) marcado(s) não deveria(m) estar na seleção.</li>`;
      stepMiss(`<p class="fb-main">Sua análise está no caminho, mas ainda há ajustes:</p><ul class="fb-plain">${msg}</ul><p>Os itens que precisam de revisão estão destacados com uma <b>💡 pista</b>.</p>`);
    }
  }

  function verifyClassify() {
    const step = cur.p.steps[cur.stepIdx];
    const wrong = step.items.map((it, i) => (cur.cls[i] !== it.a ? i : -1)).filter((i) => i >= 0);
    if (!wrong.length) {
      cur.review.clear();
      const list = step.items.map((it) => { const c = step.cats.find((x) => x.id === it.a); return `<li><b>${c.icon} ${c.label}:</b> <span>${esc(it.fb)}</span></li>`; }).join('');
      stepSolved(`<p class="fb-main">Classificação perfeita!</p><ul class="fb-list">${list}</ul>`);
    } else {
      cur.review = new Set(wrong);
      stepMiss(`<p class="fb-main"><b>${wrong.length}</b> classificação(ões) precisa(m) de revisão.</p><p>Leia as <b>💡 pistas</b> nos itens destacados e ajuste sua decisão.</p>`);
    }
  }

  function verifyMatch() {
    const step = cur.p.steps[cur.stepIdx];
    const wrong = step.left.map((_, i) => (cur.pairs[i] !== i ? i : -1)).filter((i) => i >= 0);
    if (!wrong.length) {
      cur.review.clear();
      const list = step.left.map((l, i) => `<li><b>${esc(l)}</b> → <span>${esc(step.right[i])}</span></li>`).join('');
      stepSolved(`<p class="fb-main">Todas as associações estão corretas!</p><ul class="fb-list">${list}</ul>`);
    } else {
      wrong.forEach((i) => delete cur.pairs[i]);
      cur.review = new Set(wrong);
      stepMiss(`<p class="fb-main"><b>${wrong.length}</b> associação(ões) não estava(m) correta(s) e foi(ram) desfeita(s).</p><p>Leia as <b>💡 pistas</b> e associe novamente.</p>`);
    }
  }

  function verifyOrder() {
    const step = cur.p.steps[cur.stepIdx];
    const canon = step.items.map((_, i) => i);
    const accepted = [canon].concat(step.accept || []);
    const okSeq = accepted.some((a) => a.every((v, k) => cur.seq[k] === v));
    if (okSeq) {
      cur.review.clear();
      const list = cur.seq.map((i, k) => `<li><b>${k + 1}.</b> <span>${esc(step.items[i].fb)}</span></li>`).join('');
      stepSolved(`<p class="fb-main">Sequência responsável montada com sucesso!</p><ul class="fb-list">${list}</ul>`);
    } else {
      // escolhe a sequência aceita mais próxima para indicar as posições
      let best = canon, bestHits = -1;
      accepted.forEach((a) => { const h = a.filter((v, k) => cur.seq[k] === v).length; if (h > bestHits) { bestHits = h; best = a; } });
      cur.review = new Set(cur.seq.map((v, k) => (best[k] !== v ? k : -1)).filter((k) => k >= 0));
      stepMiss(`<p class="fb-main"><b>${cur.review.size}</b> ação(ões) está(ão) fora da ordem.</p><p>💡 Pista: ${esc(step.items[best[[...cur.review][0]]].fb)}</p><p>Toque nas ações destacadas para removê-las e reposicione.</p>`);
    }
  }

  /* ---------- Conclusão da fase ---------- */
  function finishPhase() {
    const p = cur.p;
    const scored = cur.scores.length ? cur.scores : [100];
    const base = Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
    const bonus = p.bonus ? 20 : 0;
    const score = base + bonus;
    const prev = S.phases[p.id];
    const firstTime = !prev;
    const perfect = cur.errors === 0;
    if (!prev || score > prev.score) S.phases[p.id] = { score, perfect: perfect || (prev && prev.perfect) || false, at: Date.now() };
    else if (perfect) S.phases[p.id].perfect = true;

    const newMedals = [];
    const award = (id) => { if (!S.medals[id]) { S.medals[id] = Date.now(); newMedals.push(id); } };
    if (p.id === 1) award('first');

    let opJustDone = false;
    if (opDone(p.op) && !S.opsDone[p.op]) {
      S.opsDone[p.op] = Date.now();
      opJustDone = true;
      const o = OPERATIONS[p.op - 1];
      if (o.medal) award(o.medal);
      if (opPhases(p.op).every((x) => S.phases[x.id].perfect)) award('perfect');
      if (p.op === 5) S.finishedAt = Date.now();
    }
    save();
    showResult({ p, base, bonus, score, firstTime, prev, newMedals, opJustDone });
  }

  function medalChip(id) {
    const m = MEDALS.find((x) => x.id === id);
    return `<div class="new-medal">${ART.medal(id)}<div><small>NOVA MEDALHA!</small><b>${m.name}</b><span>${m.desc}</span></div></div>`;
  }

  function showResult({ p, base, bonus, score, firstTime, prev, newMedals, opJustDone }) {
    const next = PHASES.find((x) => x.id === p.id + 1);
    const sameOpNext = next && next.op === p.op;
    Sound.play('win');
    let buttons = '';
    if (opJustDone) buttons = `<button class="btn btn-success btn-xl" data-act="opReport" data-op="${p.op}">📊 RELATÓRIO DA OPERAÇÃO ➜</button>`;
    else if (sameOpNext) buttons = `<button class="btn btn-primary btn-xl" data-act="openPhase" data-id="${next.id}">PRÓXIMA FASE ➜</button>`;
    else if (next) buttons = `<button class="btn btn-primary btn-xl" data-act="openOp" data-op="${next.op}">IR PARA A OPERAÇÃO ${pad(next.op)} ➜</button>`;
    else buttons = `<button class="btn btn-success btn-xl" data-act="goFinal">📜 VER CERTIFICADO</button>`;
    buttons += `<button class="btn btn-ghost btn-lg" data-act="openOp" data-op="${p.op}">Voltar à operação</button>`;
    render(`${hud()}
      <main class="wrap result">
        <div class="result-card">
          <div class="stamp">CASO RESOLVIDO</div>
          <p class="kicker">OPERAÇÃO ${pad(p.op)} • FASE ${pad(p.id)}</p>
          <h1>${p.title}</h1>
          <div class="score-big"><span class="count" data-to="${score}">0</span><small>pontos</small></div>
          <div class="score-break">
            <span>Desempenho nas etapas: <b>${base}</b></span>
            ${bonus ? `<span>Bônus de investigação: <b>+${bonus}</b></span>` : ''}
            ${!firstTime ? `<span class="muted">${score > prev.score ? 'Novo recorde nesta fase!' : `Melhor pontuação mantida: <b>${prev.score}</b>`}</span>` : ''}
          </div>
          <div class="record"><div class="record-av">${ART.face('ayana')}</div><div><span class="brief-from">📁 Registro da Diretora Ayana</span><p>${p.wrap}</p></div></div>
          ${newMedals.map(medalChip).join('')}
          ${opJustDone ? `<div class="unlock-note">🎉 Você concluiu todas as fases da <b>Operação ${pad(p.op)}</b>! <b>+100 pontos</b> de bônus de operação.</div>` : ''}
          <div class="result-actions">${buttons}</div>
        </div>
      </main>`, 'result');
    countUp();
    if (newMedals.length || opJustDone) confetti(60);
  }

  function countUp() {
    document.querySelectorAll('.count').forEach((el) => {
      const to = +el.dataset.to; const t0 = performance.now(); const dur = 900;
      const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  /* =================== OPERAÇÃO CONCLUÍDA =================== */
  function showOpReport(opId) {
    const o = OPERATIONS[opId - 1];
    const pts = opPhases(opId).reduce((a, p) => a + (S.phases[p.id] ? S.phases[p.id].score : 0), 0) + 100;
    const unlockedDocs = DOSSIER.filter((d) => d.unlock === opId);
    const nextOp = OPERATIONS[opId];
    const medalHTML = o.medal ? medalChip(o.medal).replace('NOVA MEDALHA!', 'MEDALHA CONQUISTADA') : '';
    Sound.play('win');
    render(`
      <div class="op-done" style="--opc:${o.color}">
        <div class="burst" aria-hidden="true"></div>
        <div class="op-done-card">
          <div class="op-done-icon">${ART.OP_ICONS[o.id]}</div>
          <p class="kicker">MISSÃO CUMPRIDA</p>
          <h1>OPERAÇÃO ${pad(o.id)} CONCLUÍDA!</h1>
          <h2>${o.name}</h2>
          <div class="score-big"><span class="count" data-to="${pts}">0</span><small>pontos nesta operação (com bônus de +100)</small></div>
          <p class="op-done-msg">${o.done}</p>
          ${medalHTML}
          ${S.medals.perfect && opPhases(opId).every((x) => S.phases[x.id].perfect) ? medalChip('perfect').replace('NOVA MEDALHA!', 'OPERAÇÃO SEM ERROS') : ''}
          ${unlockedDocs.length ? `<div class="docs-unlocked"><b>📂 Novos arquivos no Dossiê Antirracista:</b><ul>${unlockedDocs.map((d) => `<li>${d.icon} ${d.title}</li>`).join('')}</ul></div>` : ''}
          ${nextOp ? `<div class="unlock-note">🔓 <b>Operação ${pad(nextOp.id)} — ${nextOp.name}</b> desbloqueada!</div>` : ''}
          <div class="result-actions">
            ${nextOp ? `<button class="btn btn-primary btn-xl" data-act="openOp" data-op="${nextOp.id}">INICIAR OPERAÇÃO ${pad(nextOp.id)} ➜</button>` : `<button class="btn btn-success btn-xl" data-act="goFinal">📜 VER CERTIFICADO FINAL</button>`}
            <button class="btn btn-ghost btn-lg" data-act="goDossier">📂 Abrir o Dossiê</button>
            <button class="btn btn-ghost btn-lg" data-act="goMap">🗺️ Mapa de operações</button>
          </div>
        </div>
      </div>`, 'opdone');
    countUp();
    confetti(110);
  }

  /* =================== FINAL E CERTIFICADO =================== */
  function showFinal() {
    if (!S.finishedAt) { showMap(); return; }
    const date = new Date(S.finishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    Sound.play('win');
    render(`
      <div class="final">
        <div class="final-glow" aria-hidden="true"></div>
        <section class="final-msg">
          <div class="final-logo">${ART.logo(120)}</div>
          <h1>PARABÉNS, AGENTE!</h1>
          <p class="big">Você concluiu a <b>OPERAÇÃO RESPEITO</b>.</p>
          <p>Agora você sabe que combater o racismo também é uma responsabilidade de quem utiliza a internet.</p>
          <p>A transformação começa com nossas atitudes.</p>
          <p class="final-impact">Na internet, respeito não é opcional!</p>
        </section>
        <section class="certificate" id="certificate">
          <div class="cert-border">
            <div class="cert-head">${ART.logo(64)}<div><small>AGÊNCIA DE INVESTIGAÇÃO DIGITAL</small><b>CERTIFICADO DIGITAL ILUSTRATIVO</b></div></div>
            <h2>Agente da Transformação</h2>
            <p>Certificamos que o(a) agente de código <b>${S.code || 'AID'}</b> concluiu as <b>5 operações</b> e as <b>30 fases</b> da</p>
            <h3>OPERAÇÃO RESPEITO — Investigando o racismo nas redes sociais</h3>
            <p>demonstrando capacidade de identificar o racismo, agir com empatia e responsabilidade digital e promover uma internet antirracista.</p>
            <div class="cert-row">
              <div class="cert-av">${agentAvatar()}</div>
              <div class="cert-data">
                <span>⭐ <b>${totalPoints()}</b> de ${MAX_POINTS} pontos</span>
                <span>🏅 <b>${medalCount()}</b> medalhas</span>
                <span>📅 ${date}</span>
              </div>
              <div class="cert-medals">${MEDALS.filter((m) => !m.extra).map((m) => ART.medal(m.id, !S.medals[m.id])).join('')}</div>
            </div>
            <div class="cert-sign"><span>Agente: ______________________________</span><span>Diretora Ayana Silva<br><small>Agência de Investigação Digital (fictícia)</small></span></div>
            <p class="cert-foot">Novembro Negro • 20 de novembro — Dia Nacional de Zumbi e da Consciência Negra</p>
          </div>
        </section>
        <div class="result-actions">
          <button class="btn btn-primary btn-lg" data-act="print">🖨️ Imprimir certificado</button>
          <button class="btn btn-ghost btn-lg" data-act="goDossier">📂 Dossiê</button>
          <button class="btn btn-ghost btn-lg" data-act="goMap">🗺️ Mapa de operações</button>
        </div>
      </div>`, 'final');
    confetti(140);
  }

  /* =================== DOSSIÊ =================== */
  function showDossier() {
    const cats = ['História', 'Conceitos', 'Cidadania digital'];
    const unlockedN = DOSSIER.filter(dossierUnlocked).length;
    const sections = cats.map((c) => `<h3 class="doc-cat">${c}</h3><div class="doc-grid">${DOSSIER.filter((d) => d.cat === c).map((d) => {
      const un = dossierUnlocked(d);
      return `<button class="doc ${un ? '' : 'locked'} ${S.read[d.id] ? 'read' : ''}" data-act="openDoc" data-id="${d.id}">
        <span class="doc-ico">${un ? d.icon : '🔒'}</span><span class="doc-title">${un ? d.title : 'Arquivo confidencial'}</span>
        <span class="doc-st">${un ? (S.read[d.id] ? '✔ lido' : '● novo') : `Conclua a Operação ${pad(d.unlock)}`}</span></button>`;
    }).join('')}</div>`).join('');
    render(`${hud()}
      <main class="wrap">
        <button class="back-btn" data-act="goMap">← Mapa de operações</button>
        <section class="page-head"><span class="kicker">ARQUIVOS DA AGÊNCIA</span><h1>📂 Dossiê Antirracista</h1>
          <p>Arquivos educativos desbloqueados conforme você conclui as operações. <b>${unlockedN}/${DOSSIER.length}</b> disponíveis • <b>${Object.keys(S.read).length}</b> lidos.</p></section>
        ${sections}
      </main>`, 'dossier');
  }
  function openDoc(id) {
    const d = DOSSIER.find((x) => x.id === id);
    if (!dossierUnlocked(d)) { toast(`🔒 Este arquivo será liberado ao concluir a <b>Operação ${pad(d.unlock)}</b>.`); return; }
    Sound.play('open');
    S.read[d.id] = Date.now();
    let medal = false;
    if (DOSSIER.every((x) => S.read[x.id]) && !S.medals.leitor) { S.medals.leitor = Date.now(); medal = true; }
    save();
    openModal({ title: d.title, icon: d.icon, wide: true, cls: 'doc-modal', html: `<span class="doc-cat-chip">${d.cat}</span><div class="doc-body">${d.body}</div>`,
      onClose: () => { if (screen === 'dossier') showDossier(); if (medal) { confetti(60); toast(`🏅 Nova medalha: <b>Leitor do Dossiê</b>!`); } } });
  }

  /* =================== MEDALHAS =================== */
  function showMedals() {
    render(`${hud()}
      <main class="wrap">
        <button class="back-btn" data-act="goMap">← Mapa de operações</button>
        <section class="page-head"><span class="kicker">CONQUISTAS</span><h1>🏅 Medalhas do agente</h1><p>${medalCount()} de ${MEDALS.length} medalhas conquistadas.</p></section>
        <div class="medal-grid">${MEDALS.map((m) => `<div class="medal-card ${S.medals[m.id] ? 'won' : 'locked'}">${ART.medal(m.id, !S.medals[m.id])}<b>${m.name}</b><span>${m.desc}</span>${m.extra ? '<small class="extra">conquista extra</small>' : ''}</div>`).join('')}</div>
      </main>`, 'medals');
  }

  /* =================== COMO JOGAR / SOBRE =================== */
  function showHowTo() {
    openModal({
      title: 'Como jogar', icon: '❔', wide: true,
      html: `<div class="howto">
        <div class="how-item"><span>🕵🏾</span><div><b>Você é um agente</b><p>Investigue denúncias de racismo na rede social fictícia CONECTA.</p></div></div>
        <div class="how-item"><span>🗺️</span><div><b>5 operações, 30 fases</b><p>Cada operação tem 6 fases. Conclua uma fase para liberar a próxima e uma operação para liberar a seguinte.</p></div></div>
        <div class="how-item"><span>🧩</span><div><b>Desafios variados</b><p>Múltipla escolha, análise de memes, identificação de comentários, classificação, associação, ordenação de atitudes, moderação e resolução de casos. Tudo funciona com toque ou clique.</p></div></div>
        <div class="how-item"><span>⭐</span><div><b>Pontuação</b><p>Acerto na 1ª tentativa: <b>100</b> • Acerto após revisão: <b>60</b> • Desafio investigativo: <b>+20</b> • Operação concluída: <b>+100</b>. <b>Você nunca perde pontos</b> por errar.</p></div></div>
        <div class="how-item"><span>💡</span><div><b>Pistas e explicações</b><p>Toda resposta traz uma explicação. Quando algo não estiver certo, leia a pista e tente de novo.</p></div></div>
        <div class="how-item"><span>📂</span><div><b>Dossiê e medalhas</b><p>Desbloqueie arquivos sobre racismo, cidadania digital e a história de Zumbi e Dandara dos Palmares. Conquiste medalhas!</p></div></div>
        <div class="how-item"><span>💾</span><div><b>Progresso salvo</b><p>O progresso fica salvo neste navegador. Use <b>CONTINUAR INVESTIGAÇÃO</b> para voltar. Nenhum dado pessoal é coletado.</p></div></div>
        <p class="note">⚠️ Todas as situações, pessoas e perfis do jogo são fictícios. Conteúdos ofensivos foram ocultados pela Agência e aparecem apenas como descrição.</p>
      </div>`
    });
  }
  let aboutTab = 0;
  function showAbout(tab = 0) {
    aboutTab = tab;
    const ids = ['novembro', 'dia20', 'zumbi', 'dandara'];
    const labels = ['Novembro Negro', '20 de novembro', 'Zumbi', 'Dandara'];
    const d = DOSSIER.find((x) => x.id === ids[tab]);
    openModal({
      title: 'Sobre o Novembro Negro', icon: '✊🏾', wide: true, cls: 'doc-modal',
      html: `<div class="tabs">${labels.map((l, i) => `<button class="tab ${i === tab ? 'on' : ''}" data-act="aboutTab" data-i="${i}">${l}</button>`).join('')}</div>
        <h3 class="about-h">${d.icon} ${d.title}</h3><div class="doc-body">${d.body}</div>`
    });
  }

  /* =================== MENU =================== */
  function showMenu() {
    openModal({
      title: 'Menu da Agência', icon: '☰',
      html: `<div class="menu-list">
        <button class="btn btn-ghost btn-lg" data-act="goMap">🗺️ Mapa de operações</button>
        <button class="btn btn-ghost btn-lg" data-act="goDossier">📂 Dossiê Antirracista</button>
        <button class="btn btn-ghost btn-lg" data-act="goMedals">🏅 Medalhas</button>
        <button class="btn btn-ghost btn-lg" data-act="howTo">❔ Como jogar</button>
        <button class="btn btn-ghost btn-lg" data-act="about">✊🏾 Sobre o Novembro Negro</button>
        <button class="btn btn-ghost btn-lg" data-act="goHome">🏠 Tela inicial</button>
        <button class="btn btn-danger btn-lg" data-act="askRestart">↺ Reiniciar jogo</button>
      </div>`,
      buttons: [{ label: 'Fechar', cls: 'btn-primary', act: 'closeModal' }]
    });
  }

  /* =================== ÁREA DO PROFESSOR =================== */
  let tTab = 0;
  function showTeacher(tab = 0) {
    tTab = tab;
    const tabs = ['Visão geral', 'Objetivos pedagógicos', 'Progresso salvo', 'Gerenciar dados'];
    let body = '';
    if (tab === 0) {
      body = `<div class="t-stats"><div><b>5</b><span>operações</span></div><div><b>30</b><span>fases</span></div><div><b>${DOSSIER.length}</b><span>arquivos no dossiê</span></div><div><b>${MEDALS.length}</b><span>medalhas</span></div></div>
        <table class="t-table"><thead><tr><th>Operação</th><th>Fases</th><th>Nível</th></tr></thead><tbody>
        ${OPERATIONS.map((o) => `<tr><td><b>${pad(o.id)}</b> — ${o.name}</td><td>${opPhases(o.id).map((p) => pad(p.id)).join(', ')}</td><td>${o.level}</td></tr>`).join('')}</tbody></table>
        <p class="note">Duração sugerida: 2 a 4 aulas de 50 minutos. O jogo funciona off-line, sem login, sem cadastro e sem coleta de dados pessoais. O progresso fica salvo apenas neste navegador (localStorage).</p>`;
    } else if (tab === 1) {
      body = `<div class="t-goals">
        <p><b>Objetivo geral:</b> desenvolver a educação antirracista e a cidadania digital, capacitando os estudantes a reconhecer, analisar e enfrentar o racismo nas redes sociais de forma crítica, empática e segura.</p>
        <ul>
          <li><b>Op. 01 — Identificando o racismo:</b> reconhecer manifestações de racismo (comentários sobre o cabelo, piadas, generalizações, colorismo, racismo religioso) e refletir sobre representatividade.</li>
          <li><b>Op. 02 — Investigando os memes:</b> compreender o racismo recreativo, os estereótipos em imagens, o blackface e a responsabilidade de quem compartilha.</li>
          <li><b>Op. 03 — O que você faria?:</b> desenvolver empatia e capacidade de agir com segurança: intervir, acolher a vítima, denunciar, guardar evidências e buscar adultos de confiança.</li>
          <li><b>Op. 04 — Desmascarando o racismo:</b> pensamento crítico sobre formas sutis de racismo — “não sou racista, mas…”, padrões de beleza, “profissionalismo”, naturalização e vieses algorítmicos.</li>
          <li><b>Op. 05 — Agentes da transformação:</b> transformar conhecimento em atitude: respostas antirracistas, apoio à vítima, moderação justa e campanhas de conscientização.</li>
        </ul>
        <p><b>Relação com a BNCC (Competências Gerais):</b> 5 (cultura digital), 7 (argumentação), 9 (empatia e cooperação) e 10 (responsabilidade e cidadania). Também contribui para a <b>Lei 10.639/2003</b> (ensino de história e cultura afro-brasileira).</p>
        <p><b>Cuidados éticos adotados:</b> situações fictícias; conteúdos ofensivos ocultados e apenas descritos; nenhuma caricatura; protagonismo e diversidade negra valorizados; nenhum estudante precisa compartilhar experiências pessoais.</p>
        <p><b>Sugestão:</b> após cada operação, promova uma roda de conversa a partir do “Registro da Diretora Ayana” e dos arquivos do Dossiê, sem expor estudantes nem pedir relatos pessoais.</p>
      </div>`;
    } else if (tab === 2) {
      const rows = PHASES.map((p) => { const r = S.phases[p.id]; return `<tr class="${r ? 'ok' : ''}"><td>${pad(p.id)}</td><td>${p.title}</td><td>${pad(p.op)}</td><td>${r ? '✔ Concluída' : phaseUnlocked(p.id) ? 'Disponível' : '🔒 Bloqueada'}</td><td>${r ? r.score : '—'}</td></tr>`; }).join('');
      body = `<div class="t-stats"><div><b>${totalPoints()}</b><span>pontos (máx. ${MAX_POINTS})</span></div><div><b>${doneCount()}/30</b><span>fases</span></div><div><b>${Object.keys(S.opsDone).length}/5</b><span>operações concluídas</span></div><div><b>${medalCount()}/${MEDALS.length}</b><span>medalhas</span></div><div><b>${Object.keys(S.read).length}/${DOSSIER.length}</b><span>arquivos lidos</span></div></div>
        <p class="note">Progresso armazenado <b>neste navegador</b>. Medalhas: ${MEDALS.filter((m) => S.medals[m.id]).map((m) => m.name).join(', ') || 'nenhuma ainda'}.</p>
        <div class="t-scroll"><table class="t-table"><thead><tr><th>Fase</th><th>Título</th><th>Op.</th><th>Situação</th><th>Pontos</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    } else {
      body = `<div class="t-manage">
        <div class="t-box"><b>Apagar pontuação, medalhas e fases concluídas</b><p>Mantém o visual do agente e a configuração de som. O jogo volta à Fase 01.</p><button class="btn btn-danger" data-act="tReset" data-mode="progress">Apagar progresso</button></div>
        <div class="t-box"><b>Reiniciar completamente o jogo</b><p>Apaga tudo o que foi salvo neste navegador (progresso, medalhas, dossiê, visual do agente e configurações).</p><button class="btn btn-danger" data-act="tReset" data-mode="all">Reiniciar completamente</button></div>
        <p class="note">Por segurança, essas ações pedem confirmação em duas etapas.</p></div>`;
    }
    openModal({
      title: 'Área do Professor', icon: '🔐', wide: true, cls: 'teacher',
      html: `<div class="tabs">${tabs.map((l, i) => `<button class="tab ${i === tab ? 'on' : ''}" data-act="tTab" data-i="${i}">${l}</button>`).join('')}</div><div class="t-body">${body}</div>`
    });
  }
  function teacherReset(mode, stage) {
    const what = mode === 'all' ? 'reiniciar COMPLETAMENTE o jogo' : 'apagar a pontuação, as medalhas e as fases concluídas';
    if (stage === 1) {
      openModal({
        title: 'Confirmação 1 de 2', icon: '⚠️',
        html: `<p>Você está prestes a <b>${what}</b> neste navegador.</p><p>Deseja continuar?</p>`,
        buttons: [{ label: 'Cancelar', cls: 'btn-ghost', act: 'tTabBack' }, { label: 'Sim, continuar', cls: 'btn-danger', act: 'tReset2', data: `data-mode="${mode}"` }]
      });
    } else {
      openModal({
        title: 'Confirmação 2 de 2', icon: '🛑',
        html: `<p><b>Esta ação não pode ser desfeita.</b></p><p>Todo o progresso salvo será apagado. Confirma definitivamente?</p>`,
        buttons: [{ label: 'Cancelar', cls: 'btn-ghost', act: 'tTabBack' }, { label: 'APAGAR DEFINITIVAMENTE', cls: 'btn-danger', act: 'tResetDo', data: `data-mode="${mode}"` }]
      });
    }
  }
  function doReset(mode) {
    if (mode === 'all') {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
      S = fresh();
    } else {
      const keep = { agent: S.agent, code: S.code, sound: S.sound, started: S.started };
      S = Object.assign(fresh(), keep);
    }
    save();
  }

  /* =================== AÇÕES (delegação de eventos) =================== */
  const ACT = {
    backdrop(el, e) { if (e.target === el) closeModal(); },
    closeModal() { closeModal(); },
    toggleSound() { S.sound = !S.sound; save(); Sound.play('click'); document.querySelectorAll('[data-act="toggleSound"]').forEach((b) => { b.outerHTML = soundBtn(); }); },
    goHome() { closeModal(); if (screen === 'phase') { ACT.leavePhase(null, null, 'home'); return; } showHome(); },
    goMap() { closeModal(); if (screen === 'phase') { ACT.leavePhase(null, null, 'map'); return; } showMap(); },
    goDossier() { closeModal(); if (screen === 'phase') { ACT.leavePhase(null, null, 'dossier'); return; } showDossier(); },
    goMedals() { closeModal(); if (screen === 'phase') { ACT.leavePhase(null, null, 'medals'); return; } showMedals(); },
    goFinal() { closeModal(); showFinal(); },
    continue() { showMap(); },
    start() { showIntro(); },
    acceptMission() { Sound.play('ok'); if (S.agent == null) showCredential(); else { S.started = true; save(); showMap(); } },
    pickAgent(el) { tempAgent = +el.dataset.i; document.querySelectorAll('.agent-opt').forEach((b, i) => b.classList.toggle('sel', i === tempAgent)); Sound.play('click'); },
    confirmAgent() {
      S.agent = tempAgent; S.started = true; save(); Sound.play('ok'); showMap();
      setTimeout(() => toast(`<div class="toast-dir">${ART.face('ayana')}<span><b>Diretora Ayana:</b> Bem-vindo(a) à Agência, agente ${S.code}! Comece pela <b>Operação 01</b>.</span></div>`, 5200), 300);
    },
    howTo() { showHowTo(); },
    about() { showAbout(0); },
    aboutTab(el) { showAbout(+el.dataset.i); },
    teacher() { showTeacher(0); },
    tTab(el) { showTeacher(+el.dataset.i); },
    tTabBack() { showTeacher(3); },
    tReset(el) { teacherReset(el.dataset.mode, 1); },
    tReset2(el) { teacherReset(el.dataset.mode, 2); },
    tResetDo(el) {
      const mode = el.dataset.mode; doReset(mode); closeModal();
      showHome();
      toast(mode === 'all' ? '✔ O jogo foi reiniciado completamente.' : '✔ Pontuação, medalhas e fases foram apagadas.');
    },
    openMenu() { showMenu(); },
    askRestart() {
      openModal({
        title: 'Reiniciar jogo?', icon: '↺',
        html: '<p>Todo o seu progresso (fases, pontuação, medalhas e dossiê) será apagado <b>neste navegador</b>.</p><p>Tem certeza de que deseja reiniciar?</p>',
        buttons: [{ label: 'Cancelar', cls: 'btn-ghost', act: 'closeModal' }, { label: 'Sim, reiniciar', cls: 'btn-danger', act: 'doRestart' }]
      });
    },
    doRestart() { doReset('progress'); closeModal(); showHome(); toast('✔ Jogo reiniciado. Boa investigação!'); },
    openOp(el) {
      closeModal();
      const op = +el.dataset.op;
      if (!opUnlocked(op)) { Sound.play('soft'); toast(`🔒 Conclua a <b>Operação ${pad(op - 1)}</b> para desbloquear esta operação.`); return; }
      Sound.play('click'); showOp(op);
    },
    opReport(el) { showOpReport(+el.dataset.op); },
    openPhase(el) {
      const id = +el.dataset.id;
      if (!phaseUnlocked(id)) { Sound.play('soft'); toast(`🔒 Conclua a <b>Fase ${pad(id - 1)}</b> para liberar esta fase.`); return; }
      Sound.play('click'); startPhase(id);
    },
    leavePhase(el, e, dest) {
      openModal({
        title: 'Sair da investigação?', icon: '🚪',
        html: '<p>O progresso <b>desta fase</b> não será salvo. As fases já concluídas continuam salvas.</p>',
        buttons: [{ label: 'Continuar investigando', cls: 'btn-primary', act: 'closeModal' }, { label: 'Sair da fase', cls: 'btn-ghost', act: 'confirmLeave', data: `data-dest="${dest || 'op'}"` }]
      });
    },
    confirmLeave(el) {
      const dest = el.dataset.dest; const op = cur ? cur.p.op : 1; closeModal(); cur = null;
      if (dest === 'home') showHome(); else if (dest === 'map') showMap(); else if (dest === 'dossier') showDossier(); else if (dest === 'medals') showMedals(); else showOp(op);
    },
    choose(el) { choose(+el.dataset.i); },
    toggle(el) {
      if (cur.solved) return;
      const i = +el.dataset.i;
      if (cur.sel.has(i)) cur.sel.delete(i); else cur.sel.add(i);
      cur.review.delete(i);
      Sound.play('click'); drawStage();
    },
    verifyMulti() { verifyMulti(); },
    classify(el) { const i = +el.dataset.i; cur.cls[i] = el.dataset.c; cur.review.delete(i); Sound.play('click'); drawStage(); },
    verifyClassify() { verifyClassify(); },
    mLeft(el) {
      const i = +el.dataset.i;
      if (cur.pairs[i] != null) { delete cur.pairs[i]; cur.mLeft = i; }
      else cur.mLeft = cur.mLeft === i ? null : i;
      Sound.play('click'); drawStage();
    },
    mRight(el) {
      const j = +el.dataset.j;
      const owner = Object.keys(cur.pairs).find((l) => cur.pairs[l] === j);
      if (cur.mLeft == null) {
        if (owner != null) { delete cur.pairs[owner]; drawStage(); } else toast('👈 Primeiro toque em um elemento da coluna da esquerda.', 2200);
        return;
      }
      if (owner != null) delete cur.pairs[owner];
      cur.pairs[cur.mLeft] = j; cur.review.delete(cur.mLeft); cur.mLeft = null;
      Sound.play('click'); drawStage();
    },
    verifyMatch() { verifyMatch(); },
    pushOrder(el) { const i = +el.dataset.i; if (!cur.seq.includes(i)) cur.seq.push(i); Sound.play('click'); drawStage(); },
    unorder(el) { const k = +el.dataset.k; cur.seq.splice(k, 1); cur.review.clear(); Sound.play('click'); drawStage(); },
    clearOrder() { cur.seq = []; cur.review.clear(); drawStage(); },
    verifyOrder() { verifyOrder(); },
    openFile(el) {
      const i = +el.dataset.i; const f = cur.p.steps[cur.stepIdx].files[i];
      let body = f.body;
      if (body.startsWith('@censored|')) { const [, desc, cap] = body.split('|'); body = ART.censored(desc, cap); }
      Sound.play('open');
      openModal({ title: f.title, icon: f.icon, wide: true, cls: 'file-modal', html: `<div class="file-body">${body}</div>`,
        buttons: [{ label: 'Evidência analisada ✔', cls: 'btn-primary', act: 'closeModal' }],
        onClose: () => { cur.viewed.add(i); drawStage(); } });
    },
    evidenceDone() { Sound.play('ok'); ACT.nextStep(); },
    nextStep() {
      closeModal();
      if (!cur) return;
      if (cur.stepIdx < cur.p.steps.length - 1) { cur.stepIdx++; renderStep(); }
      else finishPhase();
    },
    openDoc(el) { openDoc(el.dataset.id); },
    print() { window.print(); }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = ACT[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalRoot.classList.contains('open')) {
      const isSheet = modalRoot.querySelector('.sheet-ok');
      if (isSheet) ACT.nextStep(); else closeModal();
    }
  });

  // Exposto apenas para testes automatizados
  window.__OR = { get state() { return S; }, PHASES, totalPoints, MAX_POINTS };

  showHome();
})();
