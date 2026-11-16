/* =====================================================================
   TREINANDO UMA IA SEM PRECONCEITOS — Telas, fluxo e interface
   ===================================================================== */
(function () {
  'use strict';
  const G = window.GAME;
  const E = window.ENGINE;
  const { h, esc, fmt, sleep } = E;
  const { icon, person, nexusCore, medal } = ART;
  const $ = (s, r) => (r || document).querySelector(s);
  const sfx = (n) => AUDIO.play(n);
  const S = () => E.state;
  const name = () => (S().player ? S().player.name : 'Especialista');
  const fill = (t) => String(t).replace(/\{nome\}/g, name());

  let screenEl, hudEl, overlayEl, toastEl;

  /* ============================== UI básica ============================== */
  const UI = {
    modal(o) {
      const prevFocus = document.activeElement;
      const box = h('div', { class: 'modal ' + (o.cls || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || 'Janela' });
      const wrap = h('div', { class: 'modal-wrap' }, box);
      let closed = false;
      const close = (btn) => {
        if (closed) return; closed = true;
        wrap.classList.add('out');
        setTimeout(() => wrap.remove(), 180);
        if (o.onClose) o.onClose(btn);
        try { prevFocus && prevFocus.focus && prevFocus.focus({ preventScroll: true }); } catch (e) { /* */ }
      };
      if (o.title) box.appendChild(h('div', { class: 'modal-head' }, o.icon ? h('span', { class: 'mh-ico', html: icon(o.icon) }) : null, h('h3', null, o.title),
        o.dismissable !== false ? h('button', { class: 'icon-btn close', 'aria-label': 'Fechar', onclick: () => close(null) }, h('span', { html: icon('x') })) : null));
      const body = h('div', { class: 'modal-body' });
      if (o.html) body.innerHTML = o.html;
      if (o.el) body.appendChild(o.el);
      box.appendChild(body);
      if (o.buttons && o.buttons.length) {
        box.appendChild(h('div', { class: 'modal-foot' }, o.buttons.map((b) => h('button', {
          class: 'btn ' + (b.primary ? 'btn-primary' : b.danger ? 'btn-danger' : 'btn-ghost'),
          onclick: () => { sfx('click'); if (b.onClick) { const r = b.onClick(); if (r === false) return; } if (!b.keepOpen) close(b); }
        }, b.icon ? h('span', { html: icon(b.icon) }) : null, ' ', b.label))));
      }
      wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape' && o.dismissable !== false) close(null); });
      if (o.dismissable !== false) wrap.addEventListener('click', (e) => { if (e.target === wrap) close(null); });
      overlayEl.appendChild(wrap);
      setTimeout(() => { const f = box.querySelector('.modal-foot .btn-primary') || box.querySelector('button, input, textarea'); try { f && f.focus({ preventScroll: true }); } catch (e) { /* */ } }, 60);
      return { close, box, body };
    },
    confirm(text, okLabel, danger) {
      return new Promise((res) => {
        let v = false;
        UI.modal({ title: 'Confirmação', icon: 'alert', html: `<p>${text}</p>`, onClose: () => res(v),
          buttons: [{ label: 'Cancelar' }, { label: okLabel || 'Confirmar', primary: !danger, danger: !!danger, onClick: () => { v = true; } }] });
      });
    },
    toast(msg, kind, ic) {
      const t = h('div', { class: 'toast ' + (kind || '') }, h('span', { html: icon(ic || (kind === 'ach' ? 'trophy' : 'info')) }), h('div', { html: msg }));
      toastEl.appendChild(t);
      setTimeout(() => t.classList.add('out'), kind === 'ach' ? 4200 : 2800);
      setTimeout(() => t.remove(), kind === 'ach' ? 4700 : 3300);
    }
  };
  window.UI = UI;

  function showAchievements(list) {
    list.forEach((a, i) => setTimeout(() => { sfx('unlock'); UI.toast(`<small>Conquista desbloqueada</small><b>${esc(a.name)}</b>`, 'ach', a.icon); }, 400 + i * 900));
  }

  /* ============================== Fundo animado ============================== */
  function startBackground() {
    const c = $('#bg'); if (!c) return;
    const g = c.getContext('2d');
    let W, H, pts = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      const n = Math.min(70, Math.floor(innerWidth * innerHeight / 22000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr }));
    }
    resize(); addEventListener('resize', resize);
    if (E.reducedMotion()) { draw(); return; }
    function draw() {
      g.clearRect(0, 0, W, H);
      const L = 130 * dpr;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < L) { g.strokeStyle = `rgba(34,211,238,${(1 - d / L) * 0.18})`; g.lineWidth = dpr; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); }
        }
        g.fillStyle = 'rgba(139,92,246,.55)'; g.beginPath(); g.arc(p.x, p.y, 1.6 * dpr, 0, 7); g.fill();
      }
    }
    (function loop() { if (!document.hidden) draw(); requestAnimationFrame(loop); })();
  }

  /* ============================== Navegação ============================== */
  function go(render, ...args) {
    E.clearTap();
    screenEl.classList.remove('enter');
    void screenEl.offsetWidth;
    screenEl.innerHTML = '';
    render(...args);
    screenEl.classList.add('enter');
    window.scrollTo({ top: 0 });
  }
  function setHud(on) { hudEl.classList.toggle('hidden', !on); document.body.classList.toggle('with-hud', !!on); if (on) renderHud(); }

  /* ============================== HUD ============================== */
  let shownXp = null;
  function renderHud() {
    const st = S(); if (!st.player) return;
    const lv = E.level(); const pr = E.progress();
    const medals = G.missions.filter((m) => st.missions[m.id].status === 'done').length;
    hudEl.innerHTML = '';
    hudEl.appendChild(h('div', { class: 'hud-left' },
      h('button', { class: 'hud-avatar', 'aria-label': 'Ver perfil e conquistas', onclick: openTrophies, html: person(st.player.avatar, { round: true }) }),
      h('div', { class: 'hud-id' }, h('div', { class: 'hud-name' }, st.player.name), h('div', { class: 'hud-level' }, `Nível ${lv.num} · ${lv.title}`), cloudChip(),
        h('div', { class: 'xpbar', title: 'Experiência' }, h('div', { class: 'xpfill', style: { width: (lv.pct * 100) + '%' } }), h('span', { class: 'xptext' }, h('b', { class: 'xpnum' }, fmt(shownXp == null ? st.xp : shownXp)), ' XP', lv.max ? '' : ` / ${fmt(lv.to)}`)))));
    hudEl.appendChild(h('div', { class: 'hud-mid' },
      h('div', { class: 'hud-prog', title: 'Progresso geral' }, h('span', { class: 'hp-l' }, 'Progresso'), h('div', { class: 'progbar' }, h('div', { style: { width: (pr.pct * 100) + '%' } })), h('b', null, Math.round(pr.pct * 100) + '%')),
      h('div', { class: 'hud-medals', title: 'Medalhas' }, h('span', { html: icon('medal') }), h('b', null, medals), '/6')));
    const right = h('div', { class: 'hud-right' },
      hbtn('map', 'Mapa de missões', () => { sfx('click'); goHQ(); }),
      hbtn('trophy', 'Medalhas e conquistas', openTrophies),
      hbtn('sparkles', 'Arquivo de inspirações', openInspirations),
      hbtn(st.settings.sfx ? 'sound' : 'mute', st.settings.sfx ? 'Desligar efeitos sonoros' : 'Ligar efeitos sonoros', toggleSfx, st.settings.sfx ? 'on' : ''),
      hbtn('music', st.settings.music ? 'Desligar música' : 'Ligar música', toggleMusic, st.settings.music ? 'on' : ''),
      hbtn('menu', 'Menu', openMenu));
    hudEl.appendChild(right);
    if (shownXp != null && shownXp !== st.xp) animateXp();
  }
  function cloudChip() {
    if (!CLOUD.enabled() || !S().cloud) return null;
    const c = CLOUD.status();
    return h('button', { class: 'hud-cloud ' + c.cls, title: c.text, onclick: () => { if (S().cloud && S().cloud.expired) pinModal({ codigo: S().cloud.codigo, nome: S().player.name }); else UI.toast(esc(c.text) + (S().cloud ? ` · Turma ${CLOUD.label(S().cloud.turma)}` : ''), '', c.icon); } }, h('span', { html: icon(c.icon) }), ' ', c.text);
  }
  document.addEventListener('nexus-cloud', () => { const old = hudEl && hudEl.querySelector('.hud-cloud'); const n = cloudChip(); if (old && n) old.replaceWith(n); });
  function hbtn(ic, label, fn, cls) { return h('button', { class: 'hud-btn ' + (cls || ''), 'aria-label': label, title: label, onclick: fn, html: icon(ic) }); }
  function animateXp() {
    const target = S().xp, from = shownXp;
    const t0 = performance.now(), dur = 1100;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      shownXp = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
      const n = $('.xpnum', hudEl); if (n) n.textContent = fmt(shownXp);
      if (k < 1) requestAnimationFrame(step); else shownXp = null;
    })(t0);
    const f = h('div', { class: 'xp-float' }, `+${fmt(target - from)} XP`);
    hudEl.appendChild(f); setTimeout(() => f.remove(), 1600);
  }
  function toggleSfx() { const st = S(); st.settings.sfx = !st.settings.sfx; AUDIO.setSfx(st.settings.sfx); E.save(); sfx('click'); renderHud(); updTitleSound(); }
  function toggleMusic() { const st = S(); st.settings.music = !st.settings.music; AUDIO.setMusic(st.settings.music); E.save(); sfx('click'); renderHud(); updTitleSound(); }
  function updTitleSound() { const b = $('#title-sound'); if (b) b.innerHTML = icon(S().settings.sfx ? 'sound' : 'mute') + (S().settings.sfx ? ' Som ligado' : ' Som desligado'); }

  function openMenu() {
    sfx('click');
    UI.modal({
      title: 'Menu', icon: 'menu',
      el: h('div', { class: 'menu-list' },
        h('p', { class: 'small muted' }, S().cloud ? `Dupla da turma ${CLOUD.label(S().cloud.turma)}: o progresso é salvo neste aparelho e online.` : 'Seu progresso é salvo automaticamente neste dispositivo.'),
        h('button', { class: 'btn btn-ghost wide', onclick: () => { closeAll(); goHQ(); } }, h('span', { html: icon('map') }), ' Mapa de missões'),
        h('button', { class: 'btn btn-ghost wide', onclick: () => { closeAll(); replayIntro(); } }, h('span', { html: icon('play') }), ' Rever a abertura'),
        h('button', { class: 'btn btn-ghost wide', onclick: () => { closeAll(); go(renderTitle); setHud(false); } }, h('span', { html: icon('exit') }), ' Salvar e voltar à tela inicial'),
        S().cloud ? h('button', { class: 'btn btn-ghost wide', onclick: () => { closeAll(); sairDupla(); } }, h('span', { html: icon('users') }), ' Sair da dupla (trocar de dupla)') : null,
        h('button', { class: 'btn btn-danger wide', onclick: async () => { closeAll(); if (await UI.confirm('Tem certeza? <b>Todo o progresso desta partida será apagado</b> (pontos, medalhas e missões).', 'Sim, reiniciar', true)) { E.reset(true, true); shownXp = null; setHud(false); go(renderTitle); UI.toast('Partida reiniciada.'); } } }, h('span', { html: icon('refresh') }), ' Reiniciar partida'))
    });
  }
  function closeAll() { overlayEl.querySelectorAll('.modal-wrap').forEach((w) => w.remove()); }

  /* ============================== Tela inicial ============================== */
  function renderTitle() {
    setHud(false);
    const st = S();
    const cont = E.hasSave() && st.player;
    const lv = E.level();
    const cloudOn = CLOUD.enabled();
    const logo = h('div', { class: 'title-core', html: nexusCore(st.graduated ? 'fixed' : 'glitch') });
    let press = null;
    logo.addEventListener('pointerdown', () => { press = setTimeout(openTeacher, 2000); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => logo.addEventListener(ev, () => clearTimeout(press)));
    screenEl.appendChild(h('section', { class: 'title-screen' },
      h('div', { class: 'title-org' }, h('span', { class: 'org-dot' }), 'NEXUS LAB · Programa de Especialistas em IA'),
      logo,
      h('h1', { class: 'game-title' }, h('span', { class: 't1' }, 'TREINANDO UMA IA'), h('span', { class: 't2' }, 'SEM PRECONCEITOS')),
      h('p', { class: 'tagline' }, G.tagline),
      h('div', { class: 'title-actions' },
        cont ? h('button', { class: 'btn btn-primary btn-xl', onclick: () => { sfx('whoosh'); AUDIO.unlock(); goHQ(); } }, h('span', { html: icon('play') }), ' Continuar', h('small', null, `${st.player.name}${st.cloud ? ' · ' + CLOUD.label(st.cloud.turma) : ''} · Nível ${lv.num} · ${Math.round(E.progress().pct * 100)}%`)) : null,
        cloudOn && cont && st.cloud ? h('button', { class: 'btn btn-ghost', onclick: sairDupla }, h('span', { html: icon('users') }), ' Outra dupla')
          : cloudOn && !cont ? h('button', { class: 'btn btn-primary btn-xl', onclick: () => { AUDIO.unlock(); sfx('click'); go(renderTurmas); } }, h('span', { html: icon('rocket') }), ' Iniciar missão', h('small', null, 'Escolham a turma e a dupla'))
          : h('button', { class: 'btn ' + (cont ? 'btn-ghost' : 'btn-primary btn-xl'), onclick: newGame }, h('span', { html: icon(cont ? 'refresh' : 'rocket') }), cont ? ' Nova partida' : ' Iniciar missão')),
      h('button', { id: 'title-sound', class: 'link-btn', onclick: toggleSfx }),
      !E.storageOK() ? h('p', { class: 'warn-box' }, 'Atenção: o salvamento automático não está disponível neste navegador (modo privado?). O jogo funciona, mas o progresso não será guardado.') : null,
      h('div', { class: 'title-foot' }, h('span', null, 'Educação Digital · 8º ano'), h('span', null, cloudOn ? 'Sem e-mail · Progresso das duplas salvo online na planilha do professor' : 'Sem cadastro · Funciona offline · Dados salvos só neste dispositivo'),
        h('button', { class: 'teacher-dot', 'aria-label': 'Acesso do professor', title: 'Professor(a)', onclick: openTeacher }, 'π'))));
    updTitleSound();
  }
  async function newGame() {
    AUDIO.unlock(); sfx('click');
    if (E.hasSave() && S().player) {
      const ok = await UI.confirm(`Já existe uma partida salva de <b>${esc(S().player.name)}</b>. Começar uma nova partida apaga esse progresso. Deseja continuar?`, 'Começar nova partida', true);
      if (!ok) return;
      E.archive();
    }
    E.reset(true); shownXp = null;
    go(renderIntro);
  }
  let pendingTurma = null; // turma escolhida para uma dupla nova
  function renderTurmas() {
    setHud(false); pendingTurma = null;
    screenEl.appendChild(h('section', { class: 'pick' },
      h('button', { class: 'btn btn-ghost sm', onclick: () => go(renderTitle) }, h('span', { html: icon('arrowL') }), ' Voltar'),
      h('div', { class: 'kicker' }, 'ACESSO · NEXUS LAB'), h('h2', null, 'Qual é a sua turma?'),
      h('div', { class: 'turma-grid' }, CLOUD.turmas.map((t) => h('button', { class: 'turma-btn', onclick: () => { sfx('click'); go(renderDuplas, t); } }, CLOUD.label(t)))),
      h('p', { class: 'small muted' }, h('span', { html: icon('shield') }), ' O progresso da dupla fica salvo na planilha do professor. Usem só um apelido, sem nomes completos.')));
  }
  function renderDuplas(turma) {
    setHud(false);
    const list = h('div', { class: 'dupla-grid' }, h('p', { class: 'muted' }, h('span', { class: 'spinner' }), ' Buscando as duplas da turma…'));
    const novo = () => { sfx('click'); E.reset(true); shownXp = null; pendingTurma = turma; go(renderIntro); };
    screenEl.appendChild(h('section', { class: 'pick' },
      h('button', { class: 'btn btn-ghost sm', onclick: () => go(renderTurmas) }, h('span', { html: icon('arrowL') }), ' Turmas'),
      h('div', { class: 'kicker' }, 'TURMA ' + CLOUD.label(turma)), h('h2', null, 'Toquem no nome da sua dupla'),
      h('button', { class: 'btn btn-primary', onclick: novo }, h('span', { html: icon('plus') }), ' Dupla nova (primeira vez)'),
      list));
    CLOUD.turma(turma).then((duplas) => {
      list.innerHTML = '';
      if (!duplas.length) list.appendChild(h('p', { class: 'muted' }, 'Ainda não há duplas nesta turma. Toquem em “Dupla nova”.'));
      duplas.forEach((d) => list.appendChild(h('button', { class: 'dupla-card', onclick: () => pinModal(d) },
        h('b', null, d.nome), h('div', { class: 'progbar' }, h('div', { style: { width: d.progresso + '%' } })),
        h('small', { class: 'muted' }, `${d.progresso}% · ${d.xp} XP · missões ${d.missoes || '0/6'}`))));
    }, (e) => {
      list.innerHTML = '';
      list.appendChild(h('div', { class: 'warn-box' }, h('p', null, e.offline ? 'Não foi possível falar com o servidor (sem internet?).' : esc(e.message)),
        h('button', { class: 'btn btn-ghost sm', onclick: () => go(renderDuplas, turma) }, h('span', { html: icon('refresh') }), ' Tentar de novo'), ' ',
        h('button', { class: 'btn btn-ghost sm', onclick: () => { E.reset(true); pendingTurma = null; go(renderIntro); } }, 'Jogar só neste aparelho')));
    });
  }
  /* Senha de 4 números com teclado na tela */
  function pinModal(d) {
    let pin = '';
    const dots = h('div', { class: 'pin-dots' });
    const msg = h('p', { class: 'small bad pin-msg' });
    const draw = () => { dots.innerHTML = [0, 1, 2, 3].map((i) => `<span class="${i < pin.length ? 'on' : ''}"></span>`).join(''); };
    const press = (k) => {
      if (busy) return;
      if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 4) pin += k;
      sfx('click'); msg.textContent = ''; draw();
      if (pin.length === 4) send();
    };
    let busy = false;
    function send() {
      busy = true; msg.innerHTML = '<span class="spinner"></span> Entrando…'; msg.classList.remove('bad');
      CLOUD.login(d.codigo, pin).then(() => {
        mod.close(); shownXp = null; sfx('unlock');
        UI.toast(`Bem-vindos de volta, <b>${esc(S().player ? S().player.name : d.nome)}</b>!`, '', 'users');
        if (S().player) goHQ(); else go(renderCreate);
      }, (e) => { busy = false; pin = ''; draw(); msg.classList.add('bad'); msg.textContent = e.offline ? 'Sem conexão com o servidor. Tentem de novo.' : e.message; sfx('error'); });
    }
    const pad = h('div', { class: 'pin-pad' }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k) => k ? h('button', { class: 'pin-key', onclick: () => press(k), 'aria-label': k === '⌫' ? 'Apagar' : k }, k) : h('span')));
    const mod = UI.modal({ title: d.nome, icon: 'lock', cls: 'narrow', el: h('div', { class: 'pin-box' }, h('p', null, 'Digitem a senha de 4 números da dupla.'), dots, pad, msg), buttons: [{ label: 'Cancelar' }] });
    draw();
    mod.box.addEventListener('keydown', (e) => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('⌫'); });
  }
  async function sairDupla() {
    if (!(await UI.confirm('Sair desta dupla neste aparelho? O progresso continua salvo online: na próxima aula, escolham a turma e toquem no nome da dupla.', 'Sair da dupla'))) return;
    if (CLOUD.needsSync()) { UI.toast('Salvando online…'); await CLOUD.flush(); }
    if (CLOUD.needsSync() && !(await UI.confirm('<b>Atenção:</b> o progresso ainda não foi enviado (sem internet). Se sair agora, o que foi feito desde o último salvamento online será perdido. Sair mesmo assim?', 'Sair mesmo assim', true))) return;
    E.reset(true); shownXp = null; closeAll(); setHud(false); go(renderTitle);
  }
  function replayIntro() { setHud(false); go(renderIntro, true); }

  /* ============================== Abertura cinematográfica ============================== */
  function renderIntro(replay) {
    setHud(false);
    let i = 0, typing = false, skipType = false;
    const stage = h('div', { class: 'intro-stage' });
    const textEl = h('p', { class: 'intro-text' });
    const bigEl = h('h2', { class: 'intro-big' });
    const next = h('button', { class: 'btn btn-primary intro-next' }, 'Continuar ', h('span', { html: icon('arrowR') }));
    const dots = h('div', { class: 'intro-dots' }, G.intro.map(() => h('span')));
    const wrap = h('section', { class: 'intro' }, stage, h('div', { class: 'intro-copy' }, bigEl, textEl), h('div', { class: 'intro-ctrl' }, dots, next),
      h('button', { class: 'link-btn intro-skip', onclick: finish }, 'Pular abertura ', h('span', { html: icon('arrowR') })));
    screenEl.appendChild(wrap);
    async function type(el, t) {
      typing = true; skipType = false; el.textContent = '';
      for (let k = 0; k < t.length; k++) {
        if (skipType) { el.textContent = t; break; }
        el.textContent += t[k]; if (k % 3 === 0) sfx('type');
        await sleep(E.reducedMotion() ? 0 : 22);
      }
      typing = false;
    }
    async function show() {
      const sc = G.intro[i];
      dots.querySelectorAll('span').forEach((d, k) => d.classList.toggle('on', k <= i));
      stage.className = 'intro-stage sc-' + sc.scene;
      stage.innerHTML = '';
      if (sc.scene === 'city') stage.innerHTML = ART.sceneCity();
      else if (sc.scene === 'orbit') stage.innerHTML = ART.sceneOrbit();
      else if (sc.scene === 'glitch') { stage.innerHTML = '<div class="glitch-noise"></div>'; sfx('glitch'); }
      else if (sc.scene === 'core-glitch') { stage.innerHTML = nexusCore('glitch'); sfx('glitch'); }
      else if (sc.scene === 'lab') stage.innerHTML = `<div class="lab-team">${['s8 f a locs glasses labcoat c1', 's3 m y short hoodie c2 headset', 's6 n y curly jacket c4'].map((s) => `<div class="lt">${person(s)}</div>`).join('')}</div>`;
      else if (sc.scene === 'final') stage.innerHTML = nexusCore();
      bigEl.textContent = ''; textEl.textContent = '';
      bigEl.classList.toggle('glitchy', sc.scene === 'glitch');
      next.classList.add('wait');
      next.innerHTML = i === G.intro.length - 1 ? `${icon('check')} ACEITAR A MISSÃO` : `Continuar ${icon('arrowR')}`;
      if (sc.big) await type(bigEl, sc.big);
      if (sc.text) await type(textEl, sc.text);
      next.classList.remove('wait');
    }
    next.addEventListener('click', () => {
      if (typing) { skipType = true; return; }
      sfx('whoosh');
      if (i < G.intro.length - 1) { i++; show(); } else finish();
    });
    stage.addEventListener('click', () => { if (typing) skipType = true; });
    function finish() {
      skipType = true;
      S().introSeen = true; E.save();
      if (replay && S().player) goHQ(); else go(renderCreate);
    }
    show();
  }

  /* ============================== Criação do personagem ============================== */
  function renderCreate() {
    setHud(false);
    const av = { s: 6, h: 'curly', hc: 'black', o: 'hoodie', oc: 0, acc: new Set() };
    const spec = () => `s${av.s} n y ${av.h} ${av.hc} ${av.o} c${av.oc} ${[...av.acc].join(' ')}`;
    const preview = h('div', { class: 'av-preview' });
    const badge = h('div', { class: 'id-card' });
    const nameIn = h('input', { class: 'name-input', maxlength: 24, placeholder: 'Ex.: Dupla Pixel', 'aria-label': 'Apelido do jogador ou da dupla', autocomplete: 'off' });
    function upd() {
      preview.innerHTML = person(spec());
      badge.innerHTML = '';
      badge.appendChild(h('div', { class: 'idc-top' }, h('span', null, 'NEXUS LAB'), h('span', null, 'CREDENCIAL')));
      badge.appendChild(h('div', { class: 'idc-body' }, h('div', { class: 'idc-photo', html: person(spec()) }), h('div', null, h('div', { class: 'idc-name' }, nameIn.value.trim() || 'Seu apelido'), h('div', { class: 'idc-role' }, 'Especialista Júnior em IA'), h('div', { class: 'idc-code' }, 'ACESSO: NÍVEL 1'))));
      startBtn.disabled = nameIn.value.trim().length < 2 || (pendingTurma && (pinIn.value.length !== 4 || pin2In.value !== pinIn.value));
    }
    nameIn.addEventListener('input', upd);
    const pinIn = h('input', { class: 'name-input pin-small', type: 'password', inputmode: 'numeric', maxlength: 4, autocomplete: 'off', 'aria-label': 'Senha de 4 números' });
    const pin2In = h('input', { class: 'name-input pin-small', type: 'password', inputmode: 'numeric', maxlength: 4, autocomplete: 'off', 'aria-label': 'Repitam a senha' });
    [pinIn, pin2In].forEach((x) => x.addEventListener('input', () => { x.value = x.value.replace(/\D/g, '').slice(0, 4); upd(); }));
    const createMsg = h('p', { class: 'small bad' });
    nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !startBtn.disabled) start(); });
    function row(label, items) { return h('div', { class: 'av-row' }, h('div', { class: 'av-label' }, label), h('div', { class: 'av-opts' }, items)); }
    function swatch(color, on, fn, label) { return h('button', { class: 'swatch' + (on ? ' on' : ''), style: { background: color }, 'aria-label': label, title: label, onclick: (e) => { e.currentTarget.parentElement.querySelectorAll('.swatch').forEach((x) => x.classList.remove('on')); e.currentTarget.classList.add('on'); fn(); sfx('click'); upd(); } }); }
    function opt(content, on, fn, label) { return h('button', { class: 'av-opt' + (on ? ' on' : ''), 'aria-label': label, title: label, onclick: (e) => { e.currentTarget.parentElement.querySelectorAll('.av-opt').forEach((x) => x.classList.remove('on')); e.currentTarget.classList.add('on'); fn(); sfx('click'); upd(); } }, content); }
    const HAIRS = [['short', 'Curto'], ['buzz', 'Raspado'], ['bald', 'Careca'], ['afro', 'Black power'], ['curly', 'Cacheado'], ['locs', 'Dreads'], ['braids', 'Tranças'], ['long', 'Longo'], ['bob', 'Chanel'], ['bun', 'Coque'], ['ponytail', 'Rabo de cavalo'], ['hijab', 'Hijab']];
    const OUTF = [['hoodie', 'Moletom'], ['tshirt', 'Camiseta'], ['jacket', 'Jaqueta'], ['labcoat', 'Jaleco'], ['cardigan', 'Cardigã'], ['suit', 'Terno']];
    const ACC = [['glasses', 'Óculos'], ['headset', 'Fone'], ['earrings', 'Brincos'], ['hearing', 'Aparelho auditivo'], ['beard', 'Barba'], ['wheelchair', 'Símbolo de cadeirante']];
    const buildOpts = () => h('div', { class: 'av-controls' },
      row('Tom de pele', ART.SKIN.map((c, k) => swatch(c, av.s === k + 1, () => { av.s = k + 1; }, 'Tom ' + (k + 1)))),
      row('Cabelo', HAIRS.map(([id, lab]) => opt(h('span', { class: 'mini-hair', html: person(`s${av.s} n y ${id} ${av.hc} tshirt c7`) }), av.h === id, () => { av.h = id; }, lab))),
      row('Cor do cabelo / hijab', ['black', 'darkbrown', 'brown', 'blond', 'red', 'gray', 'purple', 'blue', 'pink', 'teal'].map((k) => swatch(ART.HAIR[k], av.hc === k, () => { av.hc = k; }, k))),
      row('Roupa', OUTF.map(([id, lab]) => opt(lab, av.o === id, () => { av.o = id; }, lab))),
      row('Cor da roupa', ART.OUTFIT_COLOR.map((c, k) => swatch(c, av.oc === k, () => { av.oc = k; }, 'Cor ' + (k + 1)))),
      row('Acessórios', ACC.map(([id, lab]) => h('button', { class: 'av-opt', 'aria-pressed': 'false', onclick: (e) => { if (av.acc.has(id)) av.acc.delete(id); else av.acc.add(id); e.currentTarget.classList.toggle('on', av.acc.has(id)); e.currentTarget.setAttribute('aria-pressed', av.acc.has(id)); sfx('click'); upd(); } }, lab))));
    const startBtn = h('button', { class: 'btn btn-primary btn-xl', disabled: true, onclick: start }, h('span', { html: icon('check') }), ' Entrar na NEXUS LAB');
    function randomize() {
      av.s = 1 + Math.floor(Math.random() * 10); av.h = HAIRS[Math.floor(Math.random() * HAIRS.length)][0];
      av.hc = ['black', 'darkbrown', 'brown', 'blond', 'red', 'purple', 'blue', 'pink', 'teal'][Math.floor(Math.random() * 9)];
      av.o = OUTF[Math.floor(Math.random() * OUTF.length)][0]; av.oc = Math.floor(Math.random() * 8); av.acc = new Set(Math.random() < 0.4 ? ['glasses'] : []);
      sfx('select'); screenEl.innerHTML = ''; renderCreateWith();
    }
    function renderCreateWith() {
      screenEl.appendChild(h('section', { class: 'create' },
        h('div', { class: 'create-head' }, h('div', { class: 'kicker' }, 'RECRUTAMENTO · NEXUS LAB'), h('h2', null, 'Crie seu personagem'), h('p', { class: 'muted' }, 'Você vai integrar a equipe de especialistas que investiga e corrige a NEXUS AI.')),
        h('div', { class: 'create-grid' },
          h('div', { class: 'create-left' }, preview, badge,
            pendingTurma ? h('div', { class: 'turma-chip' }, h('span', { html: icon('users') }), ' Turma ', h('b', null, CLOUD.label(pendingTurma))) : null,
            h('label', { class: 'field' }, h('span', null, 'Apelido do jogador ou da dupla'), nameIn),
            pendingTurma ? h('div', { class: 'pin-fields' },
              h('label', { class: 'field' }, h('span', null, 'Senha da dupla (4 números)'), pinIn),
              h('label', { class: 'field' }, h('span', null, 'Repitam a senha'), pin2In)) : null,
            pendingTurma ? h('p', { class: 'small muted' }, 'Guardem a senha! Ela é usada para continuar em outra aula, em qualquer aparelho.') : null,
            createMsg,
            h('p', { class: 'small muted' }, h('span', { html: icon('shield') }), ' Use um apelido. Não escreva seu nome completo nem dados pessoais.'),
            h('div', { class: 'create-actions' }, h('button', { class: 'btn btn-ghost', onclick: randomize }, h('span', { html: icon('refresh') }), ' Aleatório'), startBtn)),
          buildOpts())));
      upd();
    }
    async function start() {
      const n = nameIn.value.trim().replace(/\s+/g, ' ').replace(/[=+@<>]/g, '').slice(0, 24);
      if (n.length < 2 || startBtn.disabled) return;
      const st = S();
      st.player = { name: n, avatar: spec().replace(/\s+/g, ' ').trim() };
      st.startedAt = st.startedAt || new Date().toISOString();
      if (pendingTurma) {
        st.cloud = { turma: pendingTurma, senha: pinIn.value };
        E.save(true);
        startBtn.disabled = true; createMsg.classList.remove('bad'); createMsg.innerHTML = '<span class="spinner"></span> Registrando a dupla…';
        try { await CLOUD.register(); createMsg.textContent = ''; }
        catch (e) {
          if (!e.offline) {
            st.player = null; st.cloud = null; E.save(true); startBtn.disabled = false; createMsg.classList.add('bad');
            createMsg.textContent = /NOME_EM_USO/.test(e.message) ? `Já existe uma dupla chamada “${n}” na turma ${CLOUD.label(pendingTurma)}. Se for a sua, voltem e toquem no nome dela; se não, escolham outro apelido.` : e.message;
            return;
          }
          UI.toast('Sem internet agora: a dupla será salva online quando a conexão voltar.', '', 'clock');
        }
        pendingTurma = null;
      }
      E.save();
      const un = E.award('recruta');
      sfx('levelup');
      go(renderWelcome);
      showAchievements(un);
    }
    renderCreateWith();
  }

  function renderWelcome() {
    setHud(true);
    const lines = [
      { who: 'lia', text: `Credencial confirmada. Bem-vindo(a) à equipe, ${name()}!` },
      { who: 'lia', text: 'Aqui na NEXUS LAB você vai cumprir 6 missões. Cada uma tem desafios diferentes: investigar, organizar dados, analisar gráficos, corrigir regras e tomar decisões.' },
      { who: 'teo', text: 'Errar faz parte! Quando algo não estiver certo, você recebe uma explicação e pode tentar de novo. Corrigir os próprios erros também vale pontos.' },
      { who: 'nexus', text: 'AVISO: as situações dos desafios são simuladas. Pessoas, empresas e números são fictícios — mas os problemas que eles representam existem no mundo real.' }
    ];
    screenEl.appendChild(h('section', { class: 'welcome' }, dialogue(lines, () => goHQ(), 'Abrir o mapa de missões')));
  }

  /* ============================== Diálogo ============================== */
  function portrait(who, cls) {
    const c = G.characters[who];
    return h('div', { class: 'portrait-wrap ' + (cls || '') + (c.core ? ' is-core' : ''), html: c.core ? nexusCore(S().graduated ? 'fixed' : 'glitch') : person(c.spec) });
  }
  function dialogue(lines, onDone, doneLabel) {
    let i = 0, typing = false, skip = false;
    const pWrap = h('div', { class: 'dlg-portrait' });
    const who = h('div', { class: 'dlg-who' });
    const txt = h('p', { class: 'dlg-text' });
    const btn = h('button', { class: 'btn btn-primary dlg-next' });
    const skipB = h('button', { class: 'link-btn dlg-skip', onclick: () => { skip = true; i = lines.length - 1; show(); } }, 'Pular diálogo');
    const box = h('div', { class: 'dialogue' }, pWrap, h('div', { class: 'dlg-body' }, who, txt, h('div', { class: 'dlg-foot' }, skipB, btn)));
    async function show() {
      const l = lines[i], c = G.characters[l.who];
      pWrap.innerHTML = ''; pWrap.appendChild(portrait(l.who));
      who.innerHTML = `<b>${esc(c.name)}</b><span>${esc(c.role)}</span>`;
      box.classList.toggle('ai', !!c.core);
      btn.innerHTML = i === lines.length - 1 ? `${esc(doneLabel || 'Continuar')} ${icon('arrowR')}` : `Próximo ${icon('arrowR')}`;
      skipB.classList.toggle('hidden', i >= lines.length - 1);
      const t = fill(l.text);
      typing = true; skip = false; txt.textContent = '';
      for (let k = 0; k < t.length; k++) { if (skip) { txt.textContent = t; break; } txt.textContent += t[k]; if (k % 4 === 0) sfx('type'); await sleep(E.reducedMotion() ? 0 : 16); }
      typing = false;
    }
    btn.addEventListener('click', () => { if (typing) { skip = true; return; } sfx('click'); if (i < lines.length - 1) { i++; show(); } else onDone(); });
    txt.addEventListener('click', () => { if (typing) skip = true; });
    show();
    return box;
  }

  /* ============================== QG / Mapa de missões ============================== */
  function goHQ() { setHud(true); go(renderHQ); }
  const NODE_POS = [[12, 70], [27, 28], [43, 70], [58, 28], [73, 70], [88, 28]];
  function renderHQ() {
    const st = S();
    const done = G.missions.filter((m) => st.missions[m.id].status === 'done').length;
    const coreState = done === 6 ? 'fixed' : done >= 3 ? '' : 'glitch';
    const map = h('div', { class: 'map' });
    let path = '';
    NODE_POS.forEach(([x, y], i) => { path += (i ? ' L' : 'M') + (x * 10) + ',' + (y * 5.6); });
    map.innerHTML = `<svg class="map-svg" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="mapg" x1="0" x2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs>
      <g class="map-grid">${Array.from({ length: 11 }, (_, k) => `<line x1="${k * 100}" y1="0" x2="${k * 100}" y2="560"/>`).join('')}${Array.from({ length: 7 }, (_, k) => `<line x1="0" y1="${k * 93}" x2="1000" y2="${k * 93}"/>`).join('')}</g>
      <path d="${path}" class="map-path-bg"/><path d="${path}" class="map-path" pathLength="1" style="stroke-dasharray:${Math.min(1, done / 5)} 1"/></svg>`;
    G.missions.forEach((m, i) => {
      const ms = st.missions[m.id];
      const [x, y] = NODE_POS[i];
      const status = ms.status;
      const node = h('button', { class: `map-node st-${status}`, style: { left: x + '%', top: y + '%', '--mc': m.color }, 'aria-label': `Missão ${m.num}: ${m.title} — ${status === 'locked' ? 'bloqueada' : status === 'done' ? 'concluída' : 'disponível'}`, onclick: () => openMission(m) },
        h('div', { class: 'hex' }, h('span', { html: icon(status === 'locked' ? 'lock' : m.icon) }), status === 'open' ? h('span', { class: 'ping' }) : null),
        h('div', { class: 'node-label' }, h('small', null, `MISSÃO ${m.num}`), h('b', null, m.title),
          status === 'done' ? h('span', { class: 'node-medal ' + ms.medalTier }, h('span', { html: icon('medal') }), ' ', ms.medalTier) : status === 'locked' ? h('span', { class: 'node-lock' }, 'Bloqueada') : h('span', { class: 'node-new' }, 'Disponível')));
      map.appendChild(node);
    });
    const next = G.missions.find((m) => st.missions[m.id].status === 'open');
    const cur = st.current && G.missions.find((m) => m.id === st.current.mission);
    const side = h('aside', { class: 'hq-side' },
      h('div', { class: 'hq-core', html: nexusCore(coreState) }),
      h('div', { class: 'hq-status ' + (coreState || 'mid') }, h('small', null, 'STATUS DA NEXUS AI'), h('b', null, done === 6 ? 'Sistema revisado e monitorado' : done >= 3 ? 'Em correção' : 'Vieses detectados')),
      next ? h('div', { class: 'next-card', style: { '--mc': next.color } }, h('small', null, cur && cur.id === next.id ? 'RETOMAR DE ONDE PAROU' : 'PRÓXIMA MISSÃO'), h('b', null, `Missão ${next.num} · ${next.title}`), h('p', { class: 'small muted' }, next.objective),
        h('button', { class: 'btn btn-primary', onclick: () => openMission(next) }, h('span', { html: icon('play') }), cur && cur.id === next.id ? ' Continuar missão' : ' Abrir missão'))
        : h('div', { class: 'next-card done' }, h('small', null, 'TODAS AS MISSÕES CONCLUÍDAS'), h('b', null, 'Você é Especialista em IA Responsável!'),
          h('button', { class: 'btn btn-primary', onclick: () => go(renderGraduation) }, h('span', { html: icon('grad') }), ' Rever a formatura'),
          h('button', { class: 'btn btn-ghost', onclick: printCertificate }, h('span', { html: icon('print') }), ' Imprimir certificado')));
    screenEl.appendChild(h('section', { class: 'hq' },
      h('div', { class: 'hq-head' }, h('div', null, h('div', { class: 'kicker' }, 'QUARTEL-GENERAL · NEXUS LAB'), h('h2', null, 'Mapa de missões')), h('p', { class: 'muted small' }, 'Conclua cada missão para desbloquear a próxima.')),
      h('div', { class: 'hq-grid' }, h('div', { class: 'map-frame' }, map), side)));
  }

  /* ============================== Briefing da missão ============================== */
  function openMission(m) {
    const st = S().missions[m.id];
    if (st.status === 'locked') {
      sfx('error');
      const prev = G.missions[G.missions.indexOf(m) - 1];
      UI.toast(`Missão bloqueada. Conclua primeiro a Missão ${prev.num}: ${esc(prev.title)}.`, '', 'lock');
      return;
    }
    sfx('whoosh'); go(renderBriefing, m);
  }
  function renderBriefing(m, skipStory) {
    setHud(true);
    const st = S();
    const ms = st.missions[m.id];
    const firstTime = !m.challenges.some((c) => st.challenges[c.id] && st.challenges[c.id].done);
    const sec = h('section', { class: 'briefing', style: { '--mc': m.color } });
    sec.appendChild(h('div', { class: 'brief-head' },
      h('button', { class: 'btn btn-ghost sm', onclick: goHQ }, h('span', { html: icon('arrowL') }), ' Mapa'),
      h('div', null, h('div', { class: 'kicker' }, `MISSÃO ${m.num} · ${m.place.toUpperCase()}`), h('h2', null, m.title)),
      h('div', { class: 'brief-ico', html: icon(m.icon) })));
    const body = h('div', { class: 'brief-body' });
    sec.appendChild(body);
    function details() {
      body.innerHTML = '';
      const list = h('ol', { class: 'ch-list' });
      let firstOpen = -1;
      m.challenges.forEach((c, i) => {
        const cs = st.challenges[c.id];
        const done = cs && cs.done;
        const prevDone = i === 0 || (st.challenges[m.challenges[i - 1].id] && st.challenges[m.challenges[i - 1].id].done);
        const avail = done || prevDone;
        if (!done && avail && firstOpen < 0) firstOpen = i;
        list.appendChild(h('li', { class: 'ch-item ' + (done ? 'done' : avail ? 'open' : 'locked') },
          h('span', { class: 'ch-ico', html: icon(done ? 'check' : avail ? c.icon : 'lock') }),
          h('div', { class: 'ch-info' }, h('b', null, `Desafio ${i + 1} · ${c.title}`), h('small', null, c.mech + (done ? ` · ${cs.xp} XP` : ''))),
          avail ? h('button', { class: 'btn ' + (done ? 'btn-ghost sm' : 'btn-primary sm'), onclick: () => startChallenge(m, i) }, done ? 'Jogar de novo' : 'Iniciar') : h('span', { class: 'small muted' }, 'Bloqueado')));
      });
      body.appendChild(h('div', { class: 'brief-grid' },
        h('div', { class: 'brief-info' },
          h('div', { class: 'info-card objective' }, h('div', { class: 'ic-h' }, h('span', { html: icon('flag') }), ' Objetivo'), h('p', null, m.objective)),
          h('div', { class: 'info-card' }, h('div', { class: 'ic-h' }, h('span', { html: icon('bulb') }), ' Para entender'), h('p', null, m.context)),
          h('button', { class: 'link-btn', onclick: () => { body.innerHTML = ''; body.appendChild(dialogue(m.story, details, 'Ver objetivos')); } }, h('span', { html: icon('refresh') }), ' Rever a história')),
        h('div', { class: 'brief-ch' }, h('div', { class: 'pane-title' }, h('span', { html: icon('timeline') }), ` Desafios (${m.challenges.length})`), list,
          ms.status === 'done' ? h('div', { class: 'brief-medal' }, h('div', { class: 'bm-svg', html: medal(G.medals[m.medal].icon, ms.medalTier, G.medals[m.medal].color) }), h('div', null, h('b', null, G.medals[m.medal].name), h('div', { class: 'small muted' }, `Medalha de ${ms.medalTier} · ${ms.score}/${ms.max} XP`)))
            : firstOpen >= 0 ? h('button', { class: 'btn btn-primary btn-xl', onclick: () => startChallenge(m, firstOpen) }, h('span', { html: icon('play') }), firstOpen === 0 ? ' Começar missão' : ` Continuar: desafio ${firstOpen + 1}`) : null)));
    }
    if (firstTime && !skipStory) body.appendChild(dialogue(m.story, details, 'Ver objetivos'));
    else details();
    screenEl.appendChild(sec);
  }

  /* ============================== Execução de desafio ============================== */
  function startChallenge(m, ci) {
    const st = S();
    st.current = { mission: m.id, challenge: ci }; E.save();
    sfx('whoosh'); go(renderChallenge, m, ci);
  }
  function renderChallenge(m, ci) {
    setHud(true);
    const ch = m.challenges[ci];
    const run = { step: 0, errors: 0, stepErrors: 0, hints: 0, hintIdx: 0, bonus: 0, recovered: 0, dossier: [], clues: [] };
    const sec = h('section', { class: 'challenge', style: { '--mc': m.color } });
    const dots = h('div', { class: 'step-dots' }, ch.steps.map((s, i) => h('span', { title: s.title })));
    const dossierBtn = h('button', { class: 'btn btn-ghost sm hidden', onclick: openDossier }, h('span', { html: icon('folder') }), ' Dossiê');
    sec.appendChild(h('div', { class: 'ch-head' },
      h('button', { class: 'btn btn-ghost sm', onclick: async () => { if (await UI.confirm('Sair deste desafio? O progresso <b>deste desafio</b> será perdido, mas os desafios já concluídos continuam salvos.', 'Sair do desafio')) go(renderBriefing, m, true); } }, h('span', { html: icon('arrowL') }), ' Sair'),
      h('div', { class: 'ch-titles' }, h('div', { class: 'kicker' }, `MISSÃO ${m.num} · DESAFIO ${ci + 1}/${m.challenges.length} · ${ch.mech.toUpperCase()}`), h('h2', null, ch.title)),
      h('div', { class: 'ch-tools' }, dossierBtn, dots)));
    if (ch.intro && ch.intro.length) {
      const l = ch.intro[0];
      sec.appendChild(h('div', { class: 'speech' + (G.characters[l.who].core ? ' ai' : '') }, portrait(l.who, 'sm'), h('div', null, h('b', null, G.characters[l.who].name), h('p', null, fill(l.text)))));
    }
    const stepHead = h('div', { class: 'step-head' });
    const stage = h('div', { class: 'step-stage' });
    const hintBtn = h('button', { class: 'btn btn-ghost', onclick: giveHint }, h('span', { html: icon('bulb') }), ' Dica');
    const checkBtn = h('button', { class: 'btn btn-primary btn-check', disabled: true }, h('span', { html: icon('check') }), ' Verificar');
    const foot = h('div', { class: 'ch-foot' }, hintBtn, h('div', { class: 'foot-info small muted' }), checkBtn);
    sec.appendChild(h('div', { class: 'step-card' }, stepHead, stage));
    sec.appendChild(foot);
    screenEl.appendChild(sec);
    let comp = null;

    const ctx = {
      name: name(),
      sfx,
      toast: (t) => UI.toast(esc(t), '', 'check'),
      setCheck(on, label) { checkBtn.disabled = !on; if (label) checkBtn.innerHTML = `${icon('check')} ${esc(label)}`; checkBtn.classList.remove('hidden'); },
      hideCheck() { checkBtn.classList.add('hidden'); },
      errors: () => run.stepErrors,
      countError() { run.errors++; run.stepErrors++; },
      registerDossier(files) { run.dossier = files; if (ch.dossier) dossierBtn.classList.remove('hidden'); },
      addClue(t) { run.clues.push(t); },
      award(id) { showAchievements(E.award(id)); },
      ok(info) { stepOk(info || {}); },
      fail(fb) { stepFail(fb || {}); }
    };
    checkBtn.addEventListener('click', () => { if (comp && comp.check && !checkBtn.disabled) { sfx('click'); comp.check(); } });

    function loadStep() {
      const s = ch.steps[run.step];
      run.stepErrors = 0; run.hintIdx = 0;
      dots.querySelectorAll('span').forEach((d, i) => { d.classList.toggle('done', i < run.step); d.classList.toggle('cur', i === run.step); });
      stepHead.innerHTML = '';
      stepHead.appendChild(h('div', { class: 'sh-n' }, ch.steps.length > 1 ? `Etapa ${run.step + 1} de ${ch.steps.length}` : 'Desafio'));
      stepHead.appendChild(h('h3', null, s.title));
      if (s.text) stepHead.appendChild(h('p', { class: 'muted' }, s.text));
      stage.innerHTML = '';
      checkBtn.innerHTML = `${icon('check')} Verificar`;
      checkBtn.classList.remove('hidden');
      comp = MECH[s.type](s, ctx);
      stage.appendChild(comp.el);
      stage.classList.remove('pop'); void stage.offsetWidth; stage.classList.add('pop');
      $('.foot-info', foot).textContent = s.bonus ? `Etapa com bônus de justificativa (+${s.bonus} XP se acertar de primeira)` : '';
    }
    function stepOk(info) {
      const s = ch.steps[run.step];
      let bonus = 0;
      if (run.stepErrors === 0 && s.bonus) { bonus = s.bonus; run.bonus += bonus; }
      if (run.stepErrors > 0) run.recovered++;
      sfx('success');
      burst(checkBtn);
      const last = run.step === ch.steps.length - 1;
      const text = info.text || s.success || '';
      const html = (info.html || (text ? `<p>${esc(text)}</p>` : '')) +
        (bonus ? `<div class="reward-chip">${icon('book')} +${bonus} XP · justificativa certa de primeira</div>` : '') +
        (run.stepErrors > 0 ? `<div class="reward-chip alt">${icon('refresh')} +10 XP · você corrigiu seu erro!</div>` : '');
      UI.modal({ title: pickPraise(), cls: 'ok-modal', icon: 'check', html: html || '<p>Etapa concluída!</p>', dismissable: false,
        buttons: [{ label: last ? 'Concluir desafio' : 'Próxima etapa', primary: true, icon: 'arrowR' }],
        onClose: () => { if (last) finishChallenge(); else { run.step++; loadStep(); } } });
    }
    function stepFail(fb) {
      run.errors++; run.stepErrors++;
      sfx('error');
      stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
      const s = ch.steps[run.step];
      let hint = '';
      if (run.stepErrors >= 2 && s.hints && s.hints.length) hint = s.hints[Math.min(run.stepErrors - 2, s.hints.length - 1)];
      const html = `<p class="fail-lead">Ainda não está certo — e tudo bem! Leia a explicação e tente de novo.</p>` +
        (fb.msgs && fb.msgs.length ? `<ul class="fail-list">${fb.msgs.map((m) => `<li>${m}</li>`).join('')}</ul>` : '') +
        (hint ? `<div class="hint-box">${icon('bulb')} <b>Dica:</b> ${esc(hint)}</div>` : '');
      UI.modal({ title: fb.title || 'Vamos revisar', cls: 'fail-modal', icon: 'alert', html, buttons: [{ label: 'Tentar de novo', primary: true, icon: 'refresh' }] });
    }
    function giveHint() {
      const s = ch.steps[run.step];
      const hs = s.hints && s.hints.length ? s.hints : [genericHint(s.type)];
      const t = hs[Math.min(run.hintIdx, hs.length - 1)];
      if (run.hintIdx < hs.length) { run.hints++; run.hintIdx++; }
      sfx('click');
      UI.modal({ title: 'Dica da equipe', icon: 'bulb', cls: 'hint-modal', html: `<div class="hint-who">${person(G.characters.teo.spec)}<p>${esc(t)}</p></div><p class="small muted">Cada dica usada desconta 5 XP do desafio (até 20 XP).</p>`, buttons: [{ label: 'Entendi', primary: true }] });
    }
    function openDossier() {
      UI.modal({ title: 'Dossiê do caso', icon: 'folder', cls: 'wide',
        html: `<div class="dossier">${run.dossier.map((f) => `<details><summary>${icon(f.icon)} ${esc(f.title)}</summary><div class="file-body">${f.html}</div></details>`).join('')}</div>` +
          (run.clues.length ? `<h4>Caderno de pistas</h4><ol class="notebook-list">${run.clues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''),
        buttons: [{ label: 'Fechar', primary: true }] });
    }
    function finishChallenge() {
      const res = E.completeChallenge(m, ch, { errors: run.errors, hints: run.hints, bonus: run.bonus, recovered: run.recovered });
      shownXp = S().xp - res.gained;
      renderHud();
      sfx('levelup');
      const sc = res.sc;
        const allDone = m.challenges.every((c) => S().challenges[c.id] && S().challenges[c.id].done);
      const el = h('div', { class: 'ch-done' },
        h('div', { class: 'cd-burst', html: icon('star') }),
        h('div', { class: 'xp-break' },
          xpRow('Desafio concluído', sc.baseXp), sc.bonus ? xpRow('Justificativas certas', sc.bonus) : null, sc.recovery ? xpRow('Aprender com os erros', sc.recovery) : null, sc.hintCost ? xpRow('Dicas usadas', -sc.hintCost) : null,
          h('div', { class: 'xb-total' }, h('span', null, 'Total do desafio'), h('b', null, `${sc.total} XP`)),
          res.gained !== sc.total ? h('p', { class: 'small muted' }, res.gained > 0 ? `Você melhorou sua melhor pontuação: +${res.gained} XP.` : 'Sua melhor pontuação anterior neste desafio foi mantida.') : null),
        h('div', { class: 'learn-box' }, h('div', { class: 'ic-h' }, h('span', { html: icon('bulb') }), ' O que aprendemos'), h('p', null, ch.learn)));
      UI.modal({ title: 'Desafio concluído!', icon: 'trophy', cls: 'done-modal', el, dismissable: false,
        buttons: [{ label: nextUndone(m, ci) >= 0 ? 'Próximo desafio' : allDone ? 'Concluir missão' : 'Voltar à missão', primary: true, icon: 'arrowR' }],
        onClose: () => {
          const proceed = () => {
            const nx = nextUndone(m, ci);
            if (nx >= 0) startChallenge(m, nx);
            else if (allDone) finishMission(m);
            else go(renderBriefing, m, true);
          };
          if (res.levelUp) levelUpModal(res.levelUp, proceed); else proceed();
        } });
      showAchievements(res.unlocked);
    }
    loadStep();
  }
  function nextUndone(m, after) {
    const st = S();
    for (let i = (after == null ? -1 : after) + 1; i < m.challenges.length; i++) if (!(st.challenges[m.challenges[i].id] && st.challenges[m.challenges[i].id].done)) return i;
    for (let i = 0; i < m.challenges.length; i++) if (!(st.challenges[m.challenges[i].id] && st.challenges[m.challenges[i].id].done)) return i;
    return -1;
  }
  function xpRow(l, v) { return h('div', { class: 'xb-row' + (v < 0 ? ' neg' : '') }, h('span', null, l), h('b', null, (v > 0 ? '+' : '') + v + ' XP')); }
  const PRAISE = ['Excelente!', 'Muito bem!', 'Análise certeira!', 'Isso mesmo!', 'Ótimo raciocínio!', 'Correto!'];
  function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }
  function genericHint(t) {
    return {
      choice: 'Leia todas as alternativas antes de escolher. Desconfie das que culpam as pessoas ou tratam estereótipos como verdade.',
      multi: 'Pode haver mais de uma resposta certa. Volte às evidências e confira cada opção.',
      evidence: 'Abra todos os arquivos. Cada um tem uma pista diferente.',
      decision: 'Pense em quem pode ser prejudicado por cada escolha — agora e no futuro.',
      conveyor: 'Pergunte: o resultado trata alguém de forma diferente por gênero, cor/raça, sotaque, idade ou deficiência?',
      twins: 'Compare as duas recomendações de cada teste palavra por palavra.',
      write: 'Use o roteiro: problema, grupos prejudicados, o que corrigir (dados e critérios) e como testar e acompanhar.'
    }[t] || 'Leia as instruções com calma e observe todos os detalhes da tela.';
  }
  function levelUpModal(lv, then) {
    sfx('levelup');
    UI.modal({ title: 'Subiu de nível!', icon: 'bolt', cls: 'levelup', dismissable: false, onClose: then, html: `<div class="lv-big">NÍVEL ${lv.num}</div><div class="lv-title">${esc(lv.title)}</div><p class="muted">Seus conhecimentos sobre IA responsável estão crescendo.</p>`, buttons: [{ label: 'Continuar', primary: true }] });
  }
  function burst(anchor) {
    if (E.reducedMotion()) return;
    const r = anchor.getBoundingClientRect();
    const colors = ['#22d3ee', '#a855f7', '#f472b6', '#facc15', '#34d399'];
    for (let i = 0; i < 26; i++) {
      const p = h('i', { class: 'confetti', style: { left: (r.left + r.width / 2) + 'px', top: (r.top + r.height / 2) + 'px', background: colors[i % 5], '--dx': (Math.random() * 360 - 180) + 'px', '--dy': (-Math.random() * 260 - 40) + 'px', '--r': (Math.random() * 720) + 'deg' } });
      document.body.appendChild(p); setTimeout(() => p.remove(), 1200);
    }
  }

  /* ============================== Missão concluída ============================== */
  function finishMission(m) {
    const res = E.completeMission(m);
    sfx('medal');
    go(renderMissionDone, m, res);
    showAchievements(res.unlocked);
  }
  function renderMissionDone(m, res) {
    setHud(true);
    const ms = S().missions[m.id];
    const md = G.medals[m.medal];
    const sec = h('section', { class: 'mission-done', style: { '--mc': m.color } },
      h('div', { class: 'kicker' }, `MISSÃO ${m.num} CONCLUÍDA`),
      h('h2', null, m.title),
      h('div', { class: 'md-grid' },
        h('div', { class: 'md-medal' }, h('div', { class: 'medal-spin', html: medal(md.icon, res.tier, md.color) }), h('b', null, md.name), h('span', { class: 'tier ' + res.tier }, 'Medalha de ' + res.tier), h('p', { class: 'small muted' }, md.desc),
          h('div', { class: 'md-score' }, h('span', null, 'Pontuação da missão'), h('b', null, `${ms.score} / ${ms.max} XP`), h('div', { class: 'progbar' }, h('div', { style: { width: Math.round(ms.score / ms.max * 100) + '%' } })))),
        h('div', { class: 'md-learn' }, h('div', { class: 'ic-h' }, h('span', { html: icon('book') }), ' Aprendizados da missão'), h('ul', { class: 'learn-list' }, m.conclusion.map((c) => h('li', null, c))),
          res.newInsp.length ? h('div', { class: 'insp-new' }, h('div', { class: 'ic-h' }, h('span', { html: icon('sparkles') }), ' Novos cartões no Arquivo de Inspirações'),
            h('div', { class: 'insp-row' }, res.newInsp.map((id) => inspCard(G.inspirations.find((x) => x.id === id), true)))) : null)),
      h('div', { class: 'md-actions' },
        m.num === 6 ? h('button', { class: 'btn btn-primary btn-xl', onclick: () => go(renderFinalEval) }, h('span', { html: icon('grad') }), ' Ver avaliação final')
          : h('button', { class: 'btn btn-primary btn-xl', onclick: goHQ }, h('span', { html: icon('map') }), res.nextUnlocked ? ` Missão ${res.nextUnlocked.num} desbloqueada! Ir ao mapa` : ' Voltar ao mapa')));
    screenEl.appendChild(sec);
    if (res.nextUnlocked) setTimeout(() => sfx('unlock'), 900);
  }
  function inspCard(p, isNew) {
    return h('div', { class: 'insp-card' + (isNew ? ' new' : '') },
      h('div', { class: 'insp-top' }, h('span', { class: 'insp-ico', html: icon(p.icon) }), h('div', null, h('b', null, p.name), h('small', null, p.field + ' · ' + p.country))),
      h('p', null, p.text));
  }

  /* ============================== Avaliação final e formatura ============================== */
  function finalScores() {
    const st = S();
    const acc = (ids) => { const v = ids.map((id) => st.challenges[id]).filter(Boolean); return v.length ? v.reduce((a, c) => a + c.xp / c.max, 0) / v.length : 0; };
    const ev = st.finalEval ? st.finalEval.res : [];
    const t = (id) => { const r = ev.find((x) => x.id === id); return r ? r.score / 3 : 0; };
    const crit = [
      { label: 'Análise', desc: 'Investigar o problema, interpretar evidências e identificar os grupos prejudicados.', v: acc(['m6c1', 'm6c2', 'm6c3']) * 0.6 + t('analise') * 0.4 },
      { label: 'Coerência', desc: 'Propor correções ligadas ao problema: dados e critérios.', v: acc(['m6c4', 'm6c5']) * 0.6 + t('coerencia') * 0.4 },
      { label: 'Compreensão', desc: 'Entender que a IA precisa ser testada, acompanhada e corrigida continuamente.', v: acc(['m6c6', 'm6c7']) * 0.6 + t('compreensao') * 0.4 }
    ];
    const overall = crit.reduce((a, c) => a + c.v, 0) / crit.length;
    const concept = overall >= 0.85 ? 'Excelente' : overall >= 0.7 ? 'Muito bom' : overall >= 0.55 ? 'Bom' : 'Em desenvolvimento';
    return { crit, overall, concept };
  }
  function renderFinalEval() {
    setHud(true);
    const st = S();
    const f = finalScores();
    if (st.finalConcept !== f.concept) { st.finalConcept = `${f.concept} (${Math.round(f.overall * 100)}%)`; E.save(); }
    screenEl.appendChild(h('section', { class: 'final-eval' },
      h('div', { class: 'kicker' }, 'RELATÓRIO FINAL · CASO RUMO'), h('h2', null, 'Avaliação da especialista'),
      h('div', { class: 'fe-grid' },
        h('div', { class: 'fe-crit' }, f.crit.map((c) => h('div', { class: 'fe-row' }, h('div', { class: 'fe-h' }, h('b', null, c.label), h('span', null, Math.round(c.v * 100) + '%')), h('div', { class: 'progbar big' }, h('div', { style: { width: Math.round(c.v * 100) + '%' } })), h('p', { class: 'small muted' }, c.desc))),
          h('div', { class: 'fe-concept' }, h('small', null, 'CONCEITO GERAL'), h('b', null, f.concept), h('span', null, Math.round(f.overall * 100) + '%'))),
        h('div', { class: 'fe-text' }, h('div', { class: 'ic-h' }, h('span', { html: icon('book') }), ' Sua justificativa'), h('blockquote', null, st.finalText || '—'),
          h('p', { class: 'small muted' }, 'A avaliação considera seu desempenho nas 7 etapas da missão final e os critérios encontrados na sua justificativa.'))),
      h('button', { class: 'btn btn-primary btn-xl', onclick: () => { sfx('medal'); go(renderGraduation); } }, h('span', { html: icon('grad') }), ' Ir para a cerimônia de formatura')));
  }
  function renderGraduation() {
    setHud(true);
    const st = S();
    const lv = E.level();
    const msg = h('p', { class: 'grad-msg' });
    const sec = h('section', { class: 'graduation' },
      h('div', { class: 'spot' }), h('div', { class: 'stage-floor' }),
      h('div', { class: 'grad-kicker' }, 'CERIMÔNIA DE FORMATURA · NEXUS LAB'),
      h('div', { class: 'grad-avatar' }, h('div', { class: 'cap', html: icon('grad') }), h('div', { class: 'ga-img', html: person(st.player.avatar) })),
      h('h2', { class: 'grad-name' }, st.player.name),
      h('h1', { class: 'grad-title' }, 'ESPECIALISTA EM INTELIGÊNCIA ARTIFICIAL RESPONSÁVEL'),
      h('div', { class: 'grad-medals' }, G.missions.map((m) => h('div', { class: 'gm', title: G.medals[m.medal].name, html: medal(G.medals[m.medal].icon, st.missions[m.id].medalTier || 'bronze', G.medals[m.medal].color) }))),
      h('div', { class: 'grad-stats' }, h('span', null, h('b', null, fmt(st.xp)), ' XP'), h('span', null, h('b', null, 'Nível ' + lv.num), ' ' + lv.title), h('span', null, h('b', null, Object.keys(st.achievements).length), ' conquistas')),
      msg,
      h('div', { class: 'grad-actions' },
        h('button', { class: 'btn btn-primary', onclick: printCertificate }, h('span', { html: icon('print') }), ' Imprimir certificado'),
        h('button', { class: 'btn btn-ghost', onclick: openInspirations }, h('span', { html: icon('sparkles') }), ' Arquivo de Inspirações'),
        h('button', { class: 'btn btn-ghost', onclick: goHQ }, h('span', { html: icon('map') }), ' Voltar ao mapa')));
    screenEl.appendChild(sec);
    (async () => {
      await sleep(1600);
      for (const ch of G.finalMessage) { msg.textContent += ch; await sleep(E.reducedMotion() ? 0 : 24); }
    })();
    if (!E.reducedMotion()) {
      const colors = ['#22d3ee', '#a855f7', '#f472b6', '#facc15', '#34d399'];
      for (let i = 0; i < 70; i++) { const p = h('i', { class: 'confetti fall', style: { left: Math.random() * 100 + 'vw', top: '-20px', background: colors[i % 5], animationDelay: (Math.random() * 2.5) + 's', '--r': (Math.random() * 720) + 'deg' } }); document.body.appendChild(p); setTimeout(() => p.remove(), 6000); }
    }
  }
  function printCertificate() {
    const st = S(); const lv = E.level();
    const d = new Date(); const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const cert = $('#certificate');
    cert.innerHTML = `<div class="cert"><div class="cert-in">
      <div class="cert-org">NEXUS LAB · Programa de Especialistas em IA</div>
      <div class="cert-k">CERTIFICADO</div>
      <p>Certificamos que</p><div class="cert-name">${esc(st.player.name)}</div>
      <p>concluiu as seis missões do jogo <b>Treinando uma IA sem preconceitos</b> e recebe o título de</p>
      <div class="cert-title">ESPECIALISTA EM INTELIGÊNCIA ARTIFICIAL RESPONSÁVEL</div>
      <p class="cert-stats">${fmt(st.xp)} XP · Nível ${lv.num} — ${esc(lv.title)} · ${G.missions.filter((m) => st.missions[m.id].status === 'done').length} medalhas</p>
      <p class="cert-msg">“${esc(G.finalMessage)}”</p>
      <div class="cert-foot"><span>${date}</span><span>Educação Digital · 8º ano</span></div></div></div>`;
    document.body.classList.add('printing-cert');
    setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('printing-cert'), 500); }, 100);
  }

  /* ============================== Medalhas, conquistas, inspirações ============================== */
  function openTrophies() {
    sfx('click');
    const st = S(); const lv = E.level();
    const el = h('div', { class: 'trophies' },
      h('div', { class: 'tr-profile' }, h('div', { class: 'tr-av', html: person(st.player.avatar) }), h('div', null, h('b', null, st.player.name), h('div', null, `Nível ${lv.num} · ${lv.title}`), h('div', { class: 'small muted' }, `${fmt(st.xp)} XP${lv.max ? '' : ` · próximo nível em ${fmt(lv.to - st.xp)} XP`}`))),
      h('h4', null, 'Medalhas das missões'),
      h('div', { class: 'medal-grid' }, G.missions.map((m) => { const ms = st.missions[m.id]; const md = G.medals[m.medal]; const has = ms.status === 'done'; return h('div', { class: 'medal-item' + (has ? '' : ' locked') }, h('div', { class: 'mi-svg', html: medal(md.icon, has ? ms.medalTier : 'bloqueada', md.color) }), h('b', null, md.name), h('small', null, has ? `${ms.medalTier} · ${ms.score}/${ms.max} XP` : `Missão ${m.num}`)); })),
      h('p', { class: 'small muted' }, 'Ouro: 90% ou mais dos pontos da missão · Prata: 70% ou mais · Bronze: missão concluída.'),
      h('h4', null, 'Conquistas especiais'),
      h('div', { class: 'ach-grid' }, G.achievements.map((a) => h('div', { class: 'ach' + (st.achievements[a.id] ? ' on' : '') }, h('span', { class: 'ach-ico', html: icon(st.achievements[a.id] ? a.icon : 'lock') }), h('div', null, h('b', null, a.name), h('small', null, a.desc))))),
      h('h4', null, 'Níveis de experiência'),
      h('ol', { class: 'lv-list' }, G.levels.map((l, i) => h('li', { class: i <= lv.idx ? 'on' : '' }, h('b', null, `Nível ${i + 1}`), ` ${l.title} `, h('small', null, `${fmt(l.xp)} XP`)))));
    UI.modal({ title: 'Medalhas e conquistas', icon: 'trophy', cls: 'wide', el, buttons: [{ label: 'Fechar', primary: true }] });
  }
  function openInspirations() {
    sfx('click');
    const st = S();
    const el = h('div', null,
      h('p', { class: 'muted' }, 'Pessoas negras reais que fizeram — e fazem — história na ciência e na tecnologia. Conclua missões para desbloquear novos cartões.'),
      h('div', { class: 'insp-grid' }, G.inspirations.map((p) => {
        if (st.inspirations.includes(p.id)) return inspCard(p);
        const m = G.missions.find((x) => x.inspirations.includes(p.id));
        return h('div', { class: 'insp-card locked' }, h('div', { class: 'insp-top' }, h('span', { class: 'insp-ico', html: icon('lock') }), h('div', null, h('b', null, 'Cartão bloqueado'), h('small', null, `Conclua a Missão ${m.num}`))), h('p', null, '????'));
      })));
    UI.modal({ title: `Arquivo de Inspirações (${st.inspirations.length}/${G.inspirations.length})`, icon: 'sparkles', cls: 'wide', el, buttons: [{ label: 'Fechar', primary: true }] });
  }

  /* ============================== Menu do professor ============================== */
  function openTeacher() {
    sfx('click');
    const pin = h('input', { class: 'pin-input', type: 'password', inputmode: 'numeric', maxlength: 8, 'aria-label': 'Código do professor', autocomplete: 'off' });
    const err = h('p', { class: 'small bad hidden' }, 'Código incorreto.');
    const tryPin = () => { if (pin.value.trim() === G.teacherPin) { mod.close(); teacherPanel(); return true; } err.classList.remove('hidden'); pin.value = ''; sfx('error'); return false; };
    pin.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryPin(); });
    const mod = UI.modal({ title: 'Acesso do professor', icon: 'lock', cls: 'narrow', el: h('div', null, h('p', null, 'Digite o código de acesso do professor (veja o README do projeto).'), pin, err),
      buttons: [{ label: 'Cancelar' }, { label: 'Entrar', primary: true, keepOpen: true, onClick: () => { tryPin(); return false; } }] });
    setTimeout(() => pin.focus(), 100);
  }
  function teacherPanel() {
    const sm = E.summary();
    const hist = E.history();
    const time = (s) => { const m = Math.round((s || 0) / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
    const dt = (iso) => iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    const status = (s) => ({ locked: 'Bloqueada', open: 'Em andamento', done: 'Concluída' }[s]);
    const report = () => [`RELATÓRIO — Treinando uma IA sem preconceitos`, `Jogador/dupla: ${sm.name}`, `Nível: ${sm.level} · XP: ${sm.xp} · Progresso: ${sm.progress}%`, `Início: ${dt(sm.startedAt)} · Última atividade: ${dt(sm.lastPlayed)} · Tempo de jogo: ${time(sm.playSeconds)}`, '',
      ...sm.missions.map((m) => `Missão ${m.num} — ${m.title}: ${status(m.status)} · ${m.score}/${m.max} XP · erros corrigidos: ${m.errors} · dicas: ${m.hints}${m.tier ? ' · medalha: ' + m.tier : ''}`),
      '', `Conquistas: ${sm.achievements}`, sm.finalText ? `\nJustificativa final:\n${sm.finalText}` : ''].join('\n');
    const el = h('div', { class: 'teacher' },
      h('div', { class: 'tc-sum' },
        S().player ? h('div', { class: 'tc-av', html: person(S().player.avatar) }) : null,
        h('div', null, h('b', null, sm.name), h('div', null, `${sm.level} · ${fmt(sm.xp)} XP · ${sm.progress}% concluído`), h('div', { class: 'small muted' }, `Início: ${dt(sm.startedAt)} · Última atividade: ${dt(sm.lastPlayed)} · Tempo: ${time(sm.playSeconds)}`))),
      h('p', { class: 'small' }, h('span', { html: icon('globe') }), CLOUD.enabled() ? (S().cloud ? ` Salvamento online ativo · turma ${CLOUD.label(S().cloud.turma)} · código da dupla ${S().cloud.codigo || '(aguardando internet)'} · ${CLOUD.status().text}` : ' Salvamento online ativo (esta partida ainda não está ligada a uma dupla).') : ' Salvamento online desligado: os dados ficam só neste aparelho (veja config.json).'),
      h('table', { class: 'tbl tc-table' }, h('tr', null, h('th', null, 'Missão'), h('th', null, 'Situação'), h('th', null, 'Pontos'), h('th', null, 'Erros'), h('th', null, 'Dicas'), h('th', null, 'Medalha')),
        sm.missions.map((m) => h('tr', null, h('td', null, `${m.num}. ${m.title}`), h('td', null, status(m.status)), h('td', null, `${m.score}/${m.max}`), h('td', null, m.errors), h('td', null, m.hints), h('td', null, m.tier || '—')))),
      sm.finalText ? h('div', { class: 'tc-text' }, h('b', null, 'Justificativa final da missão 6:'), h('blockquote', null, sm.finalText)) : null,
      h('div', { class: 'tc-actions' },
        h('button', { class: 'btn btn-ghost', onclick: () => { copy(report()); } }, h('span', { html: icon('copy') }), ' Copiar relatório'),
        h('button', { class: 'btn btn-ghost', onclick: unlockAll }, h('span', { html: icon('lock') }), ' Desbloquear todas as missões (demonstração)'),
        h('button', { class: 'btn btn-primary', onclick: newPair }, h('span', { html: icon('users') }), ' Nova partida para outra dupla'),
        h('button', { class: 'btn btn-danger', onclick: restart }, h('span', { html: icon('refresh') }), ' Reiniciar o jogo'),
        h('button', { class: 'btn btn-danger', onclick: wipe }, h('span', { html: icon('trash') }), ' Apagar todos os dados salvos')),
      h('h4', null, `Duplas anteriores neste dispositivo (${hist.length})`),
      hist.length ? h('table', { class: 'tbl tc-table' }, h('tr', null, h('th', null, 'Jogador/dupla'), h('th', null, 'Arquivado em'), h('th', null, 'XP'), h('th', null, 'Progresso'), h('th', null, 'Missões')),
        hist.map((x) => h('tr', null, h('td', null, x.name), h('td', null, dt(x.archivedAt)), h('td', null, x.xp), h('td', null, x.progress + '%'), h('td', null, x.missions.filter((m) => m.status === 'done').length + '/6'))))
        : h('p', { class: 'small muted' }, 'Nenhuma partida arquivada. Ao iniciar uma nova partida para outra dupla, o resumo da atual é guardado aqui.'),
      h('p', { class: 'small muted' }, 'Todos os dados ficam somente neste navegador (localStorage). Nada é enviado para a internet.'));
    const mod = UI.modal({ title: 'Menu do professor', icon: 'gear', cls: 'wide', el, buttons: [{ label: 'Fechar', primary: true }] });
    function copy(t) {
      const done = () => UI.toast('Relatório copiado.');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => fallback());
      else fallback();
      function fallback() { const ta = h('textarea', { style: { position: 'fixed', opacity: 0 } }); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { /* */ } ta.remove(); }
    }
    async function unlockAll() {
      if (!(await UI.confirm('Desbloquear todas as missões nesta partida? (Útil para demonstrações em aula.)', 'Desbloquear'))) return;
      G.missions.forEach((m) => { const ms = S().missions[m.id]; if (ms.status === 'locked') ms.status = 'open'; });
      E.save(); mod.close(); UI.toast('Missões desbloqueadas.'); if (S().player) goHQ();
    }
    async function newPair() {
      if (!(await UI.confirm('Iniciar uma nova partida para outra dupla? O resumo da partida atual será guardado no histórico do professor e o jogo voltará ao início.', 'Nova partida'))) return;
      if (CLOUD.needsSync()) await CLOUD.flush();
      E.archive(); E.reset(true); shownXp = null; mod.close(); setHud(false); go(renderTitle); UI.toast('Pronto para a próxima dupla!');
    }
    async function restart() {
      if (!(await UI.confirm('Reiniciar o jogo? <b>O progresso atual será apagado</b> (o histórico de duplas é mantido).', 'Reiniciar', true))) return;
      E.reset(true, true); shownXp = null; mod.close(); setHud(false); go(renderTitle); UI.toast('Jogo reiniciado.');
    }
    async function wipe() {
      if (!(await UI.confirm('Apagar <b>TODOS</b> os dados salvos neste dispositivo, inclusive o histórico de duplas? Esta ação não pode ser desfeita.', 'Apagar tudo', true))) return;
      E.clearAll(); shownXp = null; mod.close(); setHud(false); go(renderTitle); UI.toast('Todos os dados foram apagados.');
    }
  }

  /* ============================== Inicialização ============================== */
  function init() {
    screenEl = $('#screen'); hudEl = $('#hud'); overlayEl = $('#overlay'); toastEl = $('#toasts');
    E.load();
    const st = S();
    AUDIO.setSfx(st.settings.sfx);
    startBackground();
    document.addEventListener('pointerdown', function once() { AUDIO.unlock(); if (S().settings.music) AUDIO.setMusic(true); document.removeEventListener('pointerdown', once); });
    document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) { e.preventDefault(); openTeacher(); } });
    // contador de tempo de jogo (apenas com a aba visível)
    setInterval(() => { if (!document.hidden && S().player) { S().playSeconds += 15; E.save(true); } }, 15000);
    CLOUD.init().then(() => {
      go(renderTitle);
      $('#boot') && $('#boot').remove();
      if (CLOUD.needsSync()) CLOUD.schedule(true);
    });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { /* offline opcional */ });
  }
  document.addEventListener('DOMContentLoaded', init);

  // ganchos para testes automatizados
  window.__NEXUS__ = { goHQ, openMission, startChallenge: (mi, ci) => startChallenge(G.missions[mi], ci), openTeacher };
})();
