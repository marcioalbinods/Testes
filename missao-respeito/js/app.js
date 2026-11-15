/* =========================================================
   MISSÃO RESPEITO — Telas, navegação e progresso
   ========================================================= */
(function () {
  'use strict';
  const { Store, SFX, $, $$, el, esc, stars, confetti, toast, modal } = window.CORE;
  const { portrait, figure, icon } = window.ART;
  const { CHARACTERS, WORLDS } = window.GAME;
  const ACT = window.ACT;

  let state = Store.load();
  SFX.enabled = state.sound !== false;
  const save = () => Store.save(state);

  const app = document.getElementById('app');
  const topbar = document.getElementById('topbar');

  const ALL = [];
  WORLDS.forEach(w => w.missions.forEach((m, i) => ALL.push({ m, w, idx: ALL.length, local: i })));
  const findM = (id) => ALL.find(x => x.m.id === id);
  const TYPE_NAMES = {
    classify: 'Arrastar e classificar', scene: 'Investigação visual', traffic: 'Semáforo', fixit: 'Conserte a cena',
    memory: 'Jogo da memória', match: 'Associação', puzzle: 'Quebra-cabeça', order: 'Linha do tempo', story: 'História com decisões',
    bios: 'Galeria + associação', whoami: 'Pistas', fillblank: 'Completar lacunas', sentences: 'Criar frases', mural: 'Mural coletivo',
    poster: 'Criação de cartaz', campaign: 'Campanha final'
  };
  const LEVELS = ['Fácil', 'Intermediária', 'Intermediária/avançada', 'Avançada', 'Desafio final'];

  /* ---------- Progresso ---------- */
  const mDone = (id) => !!(state.missions[id] && state.missions[id].done);
  const unlocked = (id) => {
    if (state.unlockAll) return true;
    const x = findM(id);
    return x.idx === 0 || mDone(ALL[x.idx - 1].m.id);
  };
  const worldDone = (w) => w.missions.every(m => mDone(m.id));
  const worldUnlocked = (w) => state.unlockAll || w.num === 1 || worldDone(WORLDS[w.num - 2]);
  const worldStars = (w) => w.missions.reduce((s, m) => s + ((state.missions[m.id] && state.missions[m.id].stars) || 0), 0);
  const totalStars = () => WORLDS.reduce((s, w) => s + worldStars(w), 0);
  const totalPoints = () => ALL.reduce((s, x) => s + ((state.missions[x.m.id] && state.missions[x.m.id].points) || 0), 0);
  const doneCount = () => ALL.filter(x => mDone(x.m.id)).length;
  const nextMission = () => { const x = ALL.find(a => !mDone(a.m.id)); return x ? x.m : null; };

  /* ---------- Barra superior ---------- */
  function setTop({ back, title, sub, wc }) {
    topbar.innerHTML = '';
    if (back) {
      const b = el(`<button class="btn icon-btn" aria-label="Voltar" title="Voltar">⬅</button>`);
      b.addEventListener('click', () => { SFX.play('click'); location.hash = back; });
      topbar.appendChild(b);
    }
    const home = el(`<button class="btn icon-btn" aria-label="Tela inicial" title="Tela inicial">🏠</button>`);
    home.addEventListener('click', () => { SFX.play('click'); location.hash = '#/'; });
    topbar.appendChild(home);
    topbar.appendChild(el(`<div class="title">${esc(title || 'Missão Respeito')}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`));
    topbar.appendChild(el(`<span class="pill" title="Estrelas conquistadas">${icon('star')} ${totalStars()}/75</span>`));
    const snd = el(`<button class="btn icon-btn" aria-pressed="${SFX.enabled}" aria-label="Som ${SFX.enabled ? 'ligado' : 'desligado'}" title="Ligar/desligar som">${SFX.enabled ? '🔊' : '🔇'}</button>`);
    snd.addEventListener('click', () => {
      SFX.enabled = !SFX.enabled; state.sound = SFX.enabled; save();
      snd.textContent = SFX.enabled ? '🔊' : '🔇';
      snd.setAttribute('aria-label', `Som ${SFX.enabled ? 'ligado' : 'desligado'}`); snd.setAttribute('aria-pressed', SFX.enabled);
      SFX.play('click');
    });
    topbar.appendChild(snd);
    document.documentElement.style.setProperty('--wc', wc ? wc.color : '#14A098');
    document.documentElement.style.setProperty('--wd', wc ? wc.dark : '#0c6f69');
  }

  function screen(html) {
    app.innerHTML = '';
    const s = el(`<div class="screen">${html}</div>`);
    app.appendChild(s);
    window.scrollTo(0, 0);
    return s;
  }

  function dialog(who, mood, html) {
    const c = CHARACTERS[who];
    return `<div class="dialog"><div class="who">${portrait(who, mood || 'smile', { bg: c.color + '55' })}<span class="name">${esc(c.name)}</span></div><div class="bubble">${html}</div></div>`;
  }

  /* ---------- Tela inicial ---------- */
  function renderHome() {
    topbar.hidden = true;
    const started = doneCount() > 0;
    const s = screen(`<div class="home">
      <div class="logo"><h1>MISSÃO RESPEITO</h1><div class="sub">Uma escola sem racismo</div></div>
      <div class="crew">${['kiara', 'ayo', 'luna', 'theo', 'kaua', 'mei'].map((k, i) => figure(k, 'happy', i % 2 ? 'wave' : 'up')).join('')}</div>
      <p class="lead">Junte-se à nossa turma! Em <b>5 mundos</b> e <b>25 missões</b>, você vai investigar, descobrir histórias, tomar decisões e criar uma campanha para uma escola onde <b>todo mundo é respeitado</b>.</p>
      ${started ? `<div class="card" style="max-width:520px;width:100%"><b>Seu progresso:</b> ${doneCount()} de 25 missões · ${totalStars()} ⭐<div class="progress" style="margin-top:8px"><i style="width:${doneCount() / 25 * 100}%"></i></div></div>` : ''}
      <div class="actions">
        <button class="btn primary big play">▶ ${started ? 'Continuar' : 'Jogar'}</button>
        <button class="btn big crewb">👫 Conheça a turma</button>
        ${state.finished ? '<button class="btn big cert">🏅 Certificado</button>' : ''}
      </div>
      <p class="note">Funciona com mouse e toque. O som é opcional. Nenhum dado pessoal é pedido.</p>
    </div>`);
    $('.play', s).addEventListener('click', () => { SFX.play('click'); location.hash = '#/mapa'; });
    $('.crewb', s).addEventListener('click', () => { SFX.play('click'); location.hash = '#/turma'; });
    const c = $('.cert', s); if (c) c.addEventListener('click', () => { location.hash = '#/certificado'; });
  }

  /* ---------- Conheça a turma ---------- */
  function renderCrew() {
    topbar.hidden = false;
    setTop({ back: '#/', title: 'Conheça a turma' });
    const s = screen(`<h2>👫 A turma da Missão Respeito</h2>
      <p>Estas crianças vão acompanhar você em toda a aventura. Cada uma é de um jeito — e todas merecem respeito!</p>
      <div class="crew-cards">${Object.keys(CHARACTERS).map(k => {
        const c = CHARACTERS[k];
        return `<div class="crew-card">${portrait(k, 'happy', { bg: c.color + '55' })}<b>${esc(c.name)}</b><span class="role" style="background:${c.color};color:${k === 'ayo' ? '#2B2140' : '#fff'}">${esc(c.role)}</span><small>${esc(c.about)}</small><p style="margin:8px 0 0;font-style:italic">“${esc(c.hello)}”</p></div>`;
      }).join('')}</div>
      <div class="row center" style="margin-top:20px"><button class="btn primary big">▶ Ir para o mapa</button></div>`);
    $('.btn.primary', s).addEventListener('click', () => { location.hash = '#/mapa'; });
  }

  /* ---------- Mapa ---------- */
  const NODE_POS = [[14, 70], [33, 32], [52, 68], [70, 30], [87, 64]];
  function mapBG() {
    return `<svg class="map-bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="900" fill="#8fd6ff"/>
      <path d="M0 520 Q200 380 420 470 Q640 560 820 420 Q1020 270 1220 420 Q1420 560 1600 430 L1600 900 L0 900Z" fill="#7FD17A"/>
      <path d="M0 700 Q300 620 600 700 Q900 780 1200 690 Q1420 630 1600 690 L1600 900 L0 900Z" fill="#62C25E"/>
      <g fill="#fff" opacity=".9"><ellipse cx="260" cy="110" rx="90" ry="32"/><ellipse cx="320" cy="92" rx="60" ry="36"/><ellipse cx="1180" cy="120" rx="100" ry="30"/><ellipse cx="1240" cy="100" rx="56" ry="34"/></g>
      <circle cx="1480" cy="110" r="60" fill="#FFD54A"/>
      <path d="M1100 900 Q1180 760 1320 760 Q1460 760 1600 820 L1600 900Z" fill="#4fb6e8" opacity=".8"/>
      <path d="M224 630 C 400 600, 420 300, 528 288 S 760 620, 832 612 S 1000 260, 1120 270 S 1300 580, 1392 576" stroke="#fff" stroke-width="18" fill="none" stroke-dasharray="2 36" stroke-linecap="round"/>
      ${[[120, 360], [640, 480], [980, 560], [1500, 420], [380, 780], [1240, 300]].map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-8" y="10" width="16" height="50" fill="#8B5A3C"/><circle cx="0" cy="0" r="44" fill="#3FAE4A"/><circle cx="-26" cy="18" r="28" fill="#4CBB57"/><circle cx="24" cy="16" r="30" fill="#4CBB57"/></g>`).join('')}
    </svg>`;
  }
  function renderMap() {
    topbar.hidden = false;
    setTop({ back: '#/', title: 'Mapa da aventura', sub: `${doneCount()} de 25 missões concluídas` });
    const nm = nextMission();
    const curW = nm ? WORLDS.find(w => w.missions.includes(nm)) : null;
    const s = screen(`<div class="map-head compact">
        <div class="grow">${dialog('ayo', 'happy', `<p>${doneCount() === 0 ? 'Bem-vindo à aventura! Comece pelo <b>Mundo 1</b>. Cada mundo libera o próximo.' : nm ? `Muito bem! Sua próxima missão é <b>${esc(nm.title)}</b>.` : 'Você completou todos os mundos! Que orgulho!'}</p>`)}</div>
      </div>
      <div class="map">${mapBG()}</div>
      <div class="card" style="margin-top:18px"><b>Progresso geral:</b> ${doneCount()}/25 missões · ${totalStars()} ⭐ · ${totalPoints()} pontos
        <div class="progress" style="margin-top:8px" role="progressbar" aria-valuemin="0" aria-valuemax="25" aria-valuenow="${doneCount()}"><i style="width:${doneCount() / 25 * 100}%"></i></div></div>
      <h3 class="center" style="margin-top:22px">🏅 Medalhas</h3>
      <div class="medals">${WORLDS.map(w => `<div class="medal ${worldDone(w) ? '' : 'off'}" style="--c:${w.color}"><div class="m">${icon(w.medal.icon)}</div>${esc(w.medal.name)}</div>`).join('')}</div>
      ${state.finished ? '<div class="row center" style="margin-top:16px"><button class="btn primary cert">🏅 Ver certificado</button></div>' : ''}`);
    const map = $('.map', s);
    WORLDS.forEach((w, i) => {
      const lock = !worldUnlocked(w), done = worldDone(w);
      const nd = el(`<button class="world-node ${lock ? 'locked' : ''} ${done ? 'done' : ''} ${curW === w && !lock ? 'current' : ''}" style="left:${NODE_POS[i][0]}%;top:${NODE_POS[i][1]}%;--c:${w.color}" aria-label="Mundo ${w.num}: ${esc(w.title)}${lock ? ' (bloqueado)' : ''}">
        <span class="disc"><span class="num">${w.num}</span>${icon(w.icon)}</span>
        <span class="label">${esc(w.title)}</span>
        <span class="stars-mini">⭐ ${worldStars(w)}/15</span></button>`);
      nd.addEventListener('click', () => {
        if (lock) { SFX.play('bad'); toast(`Conclua o Mundo ${w.num - 1} para abrir este mundo.`); return; }
        SFX.play('click'); location.hash = `#/mundo/${w.num}`;
      });
      map.appendChild(nd);
    });
    const c = $('.cert', s); if (c) c.addEventListener('click', () => { location.hash = '#/certificado'; });
  }

  /* ---------- Mundo ---------- */
  function renderWorld(n) {
    const w = WORLDS[n - 1];
    if (!w || !worldUnlocked(w)) { location.hash = '#/mapa'; return; }
    topbar.hidden = false;
    setTop({ back: '#/mapa', title: `Mundo ${w.num}: ${w.title}`, sub: `${w.missions.filter(m => mDone(m.id)).length} de 5 missões`, wc: w });
    const nm = nextMission();
    const s = screen(`<div class="world-banner"><span class="wi">${icon(w.icon)}</span><div><h2>Mundo ${w.num} · ${esc(w.title)}</h2><p>🎯 ${esc(w.goal)}</p></div></div>
      ${dialog(w.guide, 'happy', `<p>${esc(w.intro)}</p>`)}
      <h3 style="margin-top:20px">Missões <small style="font-weight:500">· Nível: ${LEVELS[w.num - 1]}</small></h3>
      <div class="missions"></div>`);
    const grid = $('.missions', s);
    w.missions.forEach((m) => {
      const x = findM(m.id);
      const lock = !unlocked(m.id), rec = state.missions[m.id];
      const c = el(`<button class="mission-card ${lock ? 'locked' : ''} ${nm === m && !lock ? 'next' : ''}" aria-label="Missão ${x.idx + 1}: ${esc(m.title)}${lock ? ' (bloqueada)' : ''}">
        <span class="mnum">${x.idx + 1}</span><span class="memo" aria-hidden="true">${lock ? '🔒' : m.icon}</span>
        <b>${esc(m.title)}</b><span class="kind">${TYPE_NAMES[m.type]}</span>
        ${stars(rec ? rec.stars : 0)}
        ${rec && rec.done ? `<span class="kind">✅ ${rec.points} pontos</span>` : lock ? '<span class="kind">Conclua a missão anterior</span>' : '<span class="kind">▶ Jogar</span>'}</button>`);
      c.addEventListener('click', () => {
        if (lock) { SFX.play('bad'); toast('Conclua a missão anterior para abrir esta.'); return; }
        SFX.play('click'); location.hash = `#/missao/${m.id}`;
      });
      grid.appendChild(c);
    });
    if (worldDone(w)) {
      const r = el(`<div class="row center" style="margin-top:20px"><button class="btn primary">🏅 Ver medalha do mundo</button></div>`);
      $('button', r).addEventListener('click', () => { location.hash = `#/celebrar/${w.num}`; });
      s.appendChild(r);
    }
  }

  /* ---------- Missão: introdução ---------- */
  function renderMission(id) {
    const x = findM(id);
    if (!x || !unlocked(id)) { location.hash = '#/mapa'; return; }
    const { m, w } = x;
    topbar.hidden = false;
    setTop({ back: `#/mundo/${w.num}`, title: `Missão ${x.idx + 1}: ${m.title}`, sub: `Mundo ${w.num} · ${w.title}`, wc: w });
    const rec = state.missions[id];
    const s = screen(`<div class="mission-head"><span class="tag">Missão ${x.idx + 1} de 25</span><h2>${m.icon} ${esc(m.title)}</h2>${rec ? stars(rec.stars) : ''}</div>
      ${dialog(m.guide, m.mood, m.intro.map(p => `<p>${p}</p>`).join(''))}
      <div class="howto">${m.howto.map(h => `<div class="step"><span class="i" aria-hidden="true">${h.i}</span><span>${esc(h.t)}</span></div>`).join('')}</div>
      <div class="intro-actions"><button class="btn go big start">▶ Começar a missão</button></div>`);
    $('.start', s).addEventListener('click', () => { SFX.play('click'); play(x); });
  }

  /* ---------- Missão: atividade ---------- */
  function play(x) {
    const { m, w } = x;
    let mistakes = 0;
    const s = screen(`<div class="mission-head"><span class="tag">Missão ${x.idx + 1}</span><h2>${m.icon} ${esc(m.title)}</h2>
      <button class="btn small restart no-print">🔄 Recomeçar</button></div>
      <div class="activity"></div><div class="feedback" role="status" aria-live="polite"></div>`);
    const root = $('.activity', s), fb = $('.feedback', s);
    $('.restart', s).addEventListener('click', async () => {
      const ok = await modal('<h3>🔄 Recomeçar esta missão?</h3><p>Você vai começar a atividade do início.</p>', [{ label: 'Sim, recomeçar', cls: 'primary', value: true }, { label: 'Não', value: false }]);
      if (ok) play(x);
    });
    let finished = false;
    const ctx = {
      root, m, w, state, save,
      mistake(n = 1) { mistakes += n; },
      feedback(kind, html, opts = {}) {
        if (!kind) { fb.className = 'feedback'; fb.innerHTML = ''; return; }
        fb.className = 'feedback ' + kind;
        const ic = kind === 'ok' ? '✅' : kind === 'bad' ? '🤔' : '💡';
        fb.innerHTML = `<span class="fi" aria-hidden="true">${ic}</span><div style="flex:1">${html}</div>`;
        if (opts.button) {
          const b = el(`<button class="btn go">${opts.button}</button>`);
          b.addEventListener('click', () => { SFX.play('click'); opts.onButton(); });
          fb.appendChild(b);
          setTimeout(() => { try { b.focus({ preventScroll: true }); } catch (e) { /* ok */ } }, 50);
        }
        fb.classList.remove('pop'); void fb.offsetWidth; fb.classList.add('pop');
        const r = fb.getBoundingClientRect();
        if (r.bottom > window.innerHeight || r.top < 70) fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      },
      done(opts = {}) {
        if (finished) return;
        finished = true;
        const th = opts.thresholds || [1, 3];
        const st = mistakes <= th[0] ? 3 : mistakes <= th[1] ? 2 : 1;
        const pts = Math.max(30, Math.round(100 - mistakes * 8));
        const prev = state.missions[m.id] || { stars: 0, points: 0, plays: 0 };
        const firstTime = !prev.done;
        state.missions[m.id] = { done: true, stars: Math.max(prev.stars || 0, st), points: Math.max(prev.points || 0, pts), plays: (prev.plays || 0) + 1, last: { stars: st, points: pts, mistakes } };
        save();
        showDone(x, st, pts, firstTime);
      }
    };
    try {
      ACT[m.type](ctx);
    } catch (e) {
      console.error(e);
      root.innerHTML = '<div class="card"><p>Ops! Algo deu errado ao abrir esta atividade. Toque em "Recomeçar".</p></div>';
    }
  }

  /* ---------- Missão: conclusão ---------- */
  function showDone(x, st, pts, firstTime) {
    const { m, w } = x;
    SFX.play('win'); confetti(st === 3 ? 110 : 60);
    setTop({ back: `#/mundo/${w.num}`, title: `Missão ${x.idx + 1}: ${m.title}`, sub: 'Missão concluída!', wc: w });
    const wDone = worldDone(w);
    const celebrate = wDone && !state.celebrated[w.id];
    const nextX = ALL[x.idx + 1];
    const msgs = ['Continue praticando! Você pode repetir para ganhar mais estrelas.', 'Muito bem! Você está aprendendo muito.', 'Incrível! Você foi excelente nesta missão!'];
    const s = screen(`<div class="done-screen">
      <h2>🎉 Missão concluída!</h2>
      <div class="big-stars">${[0, 1, 2].map(i => `<span class="s ${i < st ? 'on' : ''}">★</span>`).join('')}</div>
      <div class="score-line">${pts} pontos ${firstTime ? '' : '· melhor resultado salvo'}</div>
      <div style="max-width:780px;width:100%">${dialog(m.guide, 'happy', `<p>${msgs[st - 1]}</p>`)}</div>
      <div class="lesson"><b>💡 O que aprendemos:</b> ${esc(m.lesson)}</div>
      <div class="row center">
        <button class="btn again">🔄 Repetir</button>
        <button class="btn world">🗺️ Voltar ao mundo</button>
        ${celebrate ? '<button class="btn primary big cel">🏅 Continuar ➜</button>' : nextX && nextX.w === w ? '<button class="btn go big next">Próxima missão ➜</button>' : ''}
      </div></div>`);
    $('.again', s).addEventListener('click', () => { SFX.play('click'); play(x); });
    $('.world', s).addEventListener('click', () => { location.hash = `#/mundo/${w.num}`; });
    const c = $('.cel', s); if (c) c.addEventListener('click', () => { location.hash = `#/celebrar/${w.num}`; });
    const n = $('.next', s); if (n) n.addEventListener('click', () => { location.hash = `#/missao/${nextX.m.id}`; });
    setTimeout(() => SFX.play('star'), 300);
  }

  /* ---------- Celebração de mundo ---------- */
  function renderCelebrate(n) {
    const w = WORLDS[n - 1];
    if (!w || !worldDone(w)) { location.hash = '#/mapa'; return; }
    state.celebrated[w.id] = true;
    const isLast = w.num === 5;
    if (isLast) state.finished = true;
    save();
    topbar.hidden = false;
    setTop({ back: '#/mapa', title: `Mundo ${w.num} concluído!`, wc: w });
    SFX.play('win'); confetti(140);
    const nextW = WORLDS[w.num];
    const s = screen(`<div class="celebrate">
      <h2>🎊 Parabéns! Mundo ${w.num} concluído!</h2>
      <div class="big-medal">${icon(w.medal.icon)}</div>
      <h3>${esc(w.medal.name)}</h3>
      <p>⭐ ${worldStars(w)} de 15 estrelas neste mundo</p>
      <div style="max-width:780px;width:100%">${dialog(w.guide, 'happy', `<p>${esc(w.celebration)}</p>`)}</div>
      <div class="crew" style="display:flex;justify-content:center;flex-wrap:wrap">${['ayo', 'kiara', 'luna', 'kaua', 'mei', 'theo'].map(k => `<span style="width:90px">${figure(k, 'happy', 'up')}</span>`).join('')}</div>
      <div class="row center">
        ${isLast ? '<button class="btn primary big fin">🌟 Ver a mensagem final ➜</button>' : `<button class="btn go big nw">Ir para o Mundo ${nextW.num} ➜</button>`}
        <button class="btn tomap">🗺️ Mapa</button>
      </div></div>`);
    const f = $('.fin', s); if (f) f.addEventListener('click', () => { location.hash = '#/final'; });
    const nw = $('.nw', s); if (nw) nw.addEventListener('click', () => { location.hash = `#/mundo/${nextW.num}`; });
    $('.tomap', s).addEventListener('click', () => { location.hash = '#/mapa'; });
  }

  /* ---------- Tela final ---------- */
  function renderFinal() {
    if (!WORLDS.every(worldDone)) { location.hash = '#/mapa'; return; }
    topbar.hidden = false;
    setTop({ back: '#/mapa', title: 'Missão Respeito concluída!' });
    SFX.play('win'); confetti(200);
    setTimeout(() => confetti(120), 1500);
    const s = screen(`<div class="celebrate">
      <div class="logo"><h1>MISSÃO CUMPRIDA!</h1></div>
      <div class="crew" style="display:flex;justify-content:center;flex-wrap:wrap;align-items:flex-end">${['kiara', 'ayo', 'luna', 'lucia', 'theo', 'kaua', 'mei'].map((k, i) => `<span style="width:${k === 'lucia' ? 120 : 100}px">${figure(k, 'happy', i % 2 ? 'wave' : 'up')}</span>`).join('')}</div>
      <div class="card" style="max-width:800px"><p style="font-size:1.45rem;font-weight:700;margin:0">"Parabéns! Você concluiu a Missão Respeito! Lembre-se: uma escola antirracista é construída todos os dias, com nossas palavras, escolhas e atitudes."</p></div>
      <p class="score-line">⭐ ${totalStars()} de 75 estrelas · ${totalPoints()} pontos · 5 medalhas</p>
      <div class="medals">${WORLDS.map(w => `<div class="medal" style="--c:${w.color}"><div class="m">${icon(w.medal.icon)}</div>${esc(w.medal.name)}</div>`).join('')}</div>
      <div class="row center"><button class="btn primary big cert">🏅 Ver meu certificado</button><button class="btn tomap">🗺️ Mapa</button></div>
    </div>`);
    $('.cert', s).addEventListener('click', () => { location.hash = '#/certificado'; });
    $('.tomap', s).addEventListener('click', () => { location.hash = '#/mapa'; });
  }

  /* ---------- Certificado ---------- */
  function renderCert() {
    if (!state.finished) { location.hash = '#/mapa'; return; }
    topbar.hidden = false;
    setTop({ back: '#/mapa', title: 'Certificado' });
    const d = new Date();
    const date = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const s = screen(`<div class="cert">
      <div class="seal">${icon('star')}</div>
      <h2>Certificado de Participação</h2>
      <p style="font-size:1.2rem">Certificamos que</p>
      <div class="line" aria-label="Espaço para escrever o nome à mão"></div>
      <p class="note">(escreva seu nome à mão depois de imprimir)</p>
      <p style="font-size:1.2rem">concluiu as <b>25 missões</b> do jogo <b>MISSÃO RESPEITO — UMA ESCOLA SEM RACISMO</b>, tornando-se um(a) <b>Agente do Respeito</b>.</p>
      <p class="final-msg">Uma escola antirracista é construída todos os dias, com nossas palavras, escolhas e atitudes.</p>
      <p>⭐ ${totalStars()} estrelas · 🏅 5 medalhas</p>
      <div class="crew">${['ayo', 'kiara', 'luna', 'kaua', 'mei', 'theo', 'lucia'].map(k => portrait(k, 'happy')).join('')}</div>
      <p class="note">${esc(date)}</p>
    </div>
    <div class="row center no-print" style="margin-top:18px"><button class="btn primary big pr">🖨️ Imprimir certificado</button><button class="btn tomap">🗺️ Mapa</button></div>`);
    $('.pr', s).addEventListener('click', () => window.print());
    $('.tomap', s).addEventListener('click', () => { location.hash = '#/mapa'; });
  }

  /* ---------- Área do professor ---------- */
  let teacherOK = false;
  async function renderTeacher() {
    topbar.hidden = false;
    setTop({ back: '#/', title: 'Área do professor' });
    if (!teacherOK) {
      const a = 6 + Math.floor(Math.random() * 6), b = 5 + Math.floor(Math.random() * 5);
      const s = screen(`<div class="card" style="max-width:520px;margin:30px auto;text-align:center">
        <div style="width:90px;margin:0 auto">${icon('teacher')}</div>
        <h2>Área do professor</h2>
        <p>Esta área é para professoras e professores. Para entrar, responda:</p>
        <label style="font-size:1.4rem;font-weight:700">Quanto é ${a} × ${b}?<br><input type="number" inputmode="numeric" style="max-width:160px;text-align:center;margin-top:8px" aria-label="Resposta"></label>
        <div class="row center" style="margin-top:14px"><button class="btn primary">Entrar</button></div>
        <p class="err" style="color:var(--bad);font-weight:600" role="alert"></p></div>`);
      const inp = $('input', s);
      const go = () => { if (+inp.value === a * b) { teacherOK = true; renderTeacher(); } else { $('.err', s).textContent = 'Resposta incorreta. Tente de novo.'; inp.value = ''; inp.focus(); } };
      $('.btn', s).addEventListener('click', go);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      inp.focus();
      return;
    }
    const s = screen(`<div class="teacher">
      <h2>📋 Área do professor</h2>
      <section class="card"><h3>Progresso neste dispositivo</h3>
        <p><b>${doneCount()}</b> de 25 missões concluídas · <b>${totalStars()}</b> de 75 estrelas · <b>${totalPoints()}</b> pontos ${state.finished ? '· 🏅 jogo concluído' : ''}</p>
        <div class="progress"><i style="width:${doneCount() / 25 * 100}%"></i></div>
        <h3 style="margin-top:16px">Mundos</h3>
        <div class="world-status">${WORLDS.map(w => `<div class="${worldDone(w) ? 'done' : ''}"><b>Mundo ${w.num}</b><br>${esc(w.title)}<br>${worldDone(w) ? '<span class="ok-tag">✅ Concluído</span>' : `<span class="no-tag">${w.missions.filter(m => mDone(m.id)).length}/5 missões</span>`}</div>`).join('')}</div>
      </section>
      <section class="card"><h3>Missões</h3><div style="overflow-x:auto"><table>
        <thead><tr><th>#</th><th>Missão</th><th>Tipo</th><th>Situação</th><th>Estrelas</th><th>Pontos</th><th>Vezes jogada</th></tr></thead>
        <tbody>${ALL.map(x => { const r = state.missions[x.m.id]; return `<tr><td>${x.idx + 1}</td><td>${esc(x.m.title)}<br><small>Mundo ${x.w.num}</small></td><td>${TYPE_NAMES[x.m.type]}</td><td>${r && r.done ? '<span class="ok-tag">Concluída</span>' : unlocked(x.m.id) ? '<span class="no-tag">Disponível</span>' : '<span class="no-tag">Bloqueada</span>'}</td><td>${r ? r.stars : 0}/3</td><td>${r ? r.points : 0}</td><td>${r ? r.plays : 0}</td></tr>`; }).join('')}</tbody>
      </table></div></section>
      <section class="card"><h3>Ações</h3>
        <label class="row" style="font-weight:600;margin-bottom:12px"><input type="checkbox" class="unl" ${state.unlockAll ? 'checked' : ''} style="width:28px;height:28px"> Liberar todas as missões (modo demonstração para a turma)</label>
        <div class="row">
          <button class="btn primary wipe">🧹 Apagar progresso (nova turma)</button>
          <button class="btn danger reset">♻️ Reiniciar completamente o jogo</button>
        </div>
        <p class="note" style="margin-top:10px"><b>Apagar progresso:</b> remove missões, estrelas, frases e cartazes, mantendo a preferência de som. <b>Reiniciar completamente:</b> apaga tudo o que o jogo salvou neste navegador e volta para a tela inicial.</p>
      </section>
      <section class="card"><h3>🔒 Privacidade</h3>
        <p>O jogo não pede nomes nem dados pessoais e não envia nada pela internet. O progresso fica salvo apenas neste navegador (armazenamento local), para que a turma continue em outra aula no mesmo dispositivo. A frase livre da Missão 21 também fica só neste aparelho.</p></section>
      <section class="card"><h3>📚 Guia pedagógico</h3>
        <p>Público: 4º ano do Ensino Fundamental (9–10 anos). Apoia a <b>Lei 10.639/2003</b> (ensino de história e cultura africana e afro-brasileira) e pode ser usado em Educação Digital e em projetos de educação antirracista.</p>
        ${GUIDE.map(g => `<details><summary>${esc(g.t)}</summary>${g.h}</details>`).join('')}
        <p class="note">As ilustrações das personalidades são representações artísticas criadas para o jogo, não retratos fiéis. Sugere-se mostrar à turma fotografias reais em fontes confiáveis.</p>
      </section></div>`);
    $('.unl', s).addEventListener('change', (e) => { state.unlockAll = e.target.checked; save(); toast(state.unlockAll ? 'Todas as missões foram liberadas.' : 'Desbloqueio progressivo reativado.'); renderTeacher(); });
    $('.wipe', s).addEventListener('click', async () => {
      const ok = await modal('<h3>⚠️ Apagar o progresso?</h3><p>Todas as missões, estrelas, frases e cartazes salvos <b>neste navegador</b> serão apagados. Esta ação não pode ser desfeita.</p>', [{ label: 'Sim, apagar', cls: 'danger', value: true }, { label: 'Cancelar', value: false }]);
      if (!ok) return;
      const sound = state.sound;
      state = Object.assign(Store.load(), { missions: {}, phrases: [], customPhrase: '', posters: {}, campaign: [], celebrated: {}, finished: false, unlockAll: false, sound });
      save(); toast('Progresso apagado. Pronto para uma nova turma!'); renderTeacher();
    });
    $('.reset', s).addEventListener('click', async () => {
      const ok = await modal('<h3>⚠️ Reiniciar completamente?</h3><p>O jogo vai apagar <b>tudo</b> o que salvou neste navegador e voltar para a tela inicial. Esta ação não pode ser desfeita.</p>', [{ label: 'Sim, reiniciar', cls: 'danger', value: true }, { label: 'Cancelar', value: false }]);
      if (!ok) return;
      Store.wipe();
      state = Store.load(); SFX.enabled = true; teacherOK = false;
      toast('O jogo foi reiniciado.');
      location.hash = '#/';
    });
  }

  const GUIDE = [
    { t: 'Mundo 1 — Detetives do Respeito', h: '<p>Objetivo: identificar racismo, preconceito e discriminação, inclusive quando aparecem como "brincadeira". Antes de jogar, construa com a turma uma definição: <i>racismo é tratar alguém de forma pior por causa da cor da pele, do cabelo ou de traços ligados à sua origem; é discriminação e causa danos reais.</i></p><p>Pergunta para conversa: "Como saber se uma brincadeira é respeitosa?"</p>' },
    { t: 'Mundo 2 — Nossa História, Nossa Cultura', h: '<p>Mostra a cultura afro-brasileira como viva, diversa e criadora (música, culinária, palavras, ciência, tradições) e não apenas ligada à escravidão. Amplie com músicas, receitas e palavras de origem africana. A linha do tempo destaca a luta e as conquistas da população negra.</p>' },
    { t: 'Mundo 3 — E Agora, o que Fazer?', h: '<p>Histórias com decisões e consequências. Atitudes ensinadas: não participar da ofensa, apoiar quem foi atingido, intervir com segurança e respeito, procurar um adulto, reconhecer o erro e reparar o dano. O jogo nunca atribui à vítima a responsabilidade de resolver.</p><p>Sugestão: depois de cada história, peça que a turma explique <i>por que</i> a melhor escolha ajuda. Evite pedir que estudantes negros relatem experiências pessoais diante da turma.</p>' },
    { t: 'Mundo 4 — Grandes Personalidades Negras', h: '<p>Zumbi e Dandara dos Palmares, Machado de Assis, Carolina Maria de Jesus, Conceição Evaristo, Milton Santos, Antonieta de Barros e Lélia Gonzalez. As informações foram escritas com linguagem simples, a partir de fatos amplamente documentados. Sobre Dandara há poucos registros escritos, o que é dito explicitamente no jogo.</p>' },
    { t: 'Mundo 5 — Construindo uma Escola Antirracista', h: '<p>Produção: frases, mural, cartazes e a campanha "Na nossa escola, o racismo não tem vez!". Os cartazes podem ser impressos ou salvos como imagem para uma exposição. Revise com a turma as frases livres antes de expô-las.</p>' },
    { t: 'Cuidados importantes', h: '<ul><li>Não reproduza insultos racistas para "exemplificar"; o jogo descreve as situações sem repeti-los.</li><li>Não promova comparações ou competições entre tons de pele ou tipos de cabelo.</li><li>Não exija que estudantes negros expliquem ou representem sua identidade.</li><li>Se surgir um relato real de racismo, acolha, proteja a criança e siga os encaminhamentos da escola.</li></ul>' }
  ];

  /* ---------- Roteador ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [a, b] = h.split('/');
    $$('.modal-back').forEach(m => m.remove());
    $$('.confetti').forEach(c => c.remove());
    document.getElementById('teacherBtn').hidden = a !== '' && a !== undefined;
    switch (a) {
      case '': case undefined: renderHome(); break;
      case 'turma': renderCrew(); break;
      case 'mapa': renderMap(); break;
      case 'mundo': renderWorld(+b); break;
      case 'missao': renderMission(b); break;
      case 'celebrar': renderCelebrate(+b); break;
      case 'final': renderFinal(); break;
      case 'certificado': renderCert(); break;
      case 'professor': renderTeacher(); break;
      default: renderHome();
    }
  }
  window.addEventListener('hashchange', route);
  document.getElementById('teacherBtn').addEventListener('click', () => { location.hash = '#/professor'; });
  route();
  window.__MR = { get state() { return state; }, ALL, WORLDS };
})();
