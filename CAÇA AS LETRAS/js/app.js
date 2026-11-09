/* =========================================================
   CAÇADORES DE LETRAS — Aplicação (navegação e telas)
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const $ = (id) => document.getElementById(id);
  const Progress = CDL.Progress;
  const Game = CDL.Game;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const avatarEmoji = (id) => (CDL.AVATARS.find((a) => a.id === id) || CDL.AVATARS[0]).emoji;

  const App = {
    screen: null,
    mapWorld: 1,
    currentLevel: null,
    lastResult: null,
    afterProfile: 'worlds',
    newAvatar: 'raposa',

    /* ---------- inicialização ---------- */
    init() {
      document.querySelectorAll('[data-lupa]').forEach((el) => (el.innerHTML = CDL.characterSVG()));
      const home = CDL.buildScene(1, 'h');
      document.querySelector('.home-scene').innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${home.svg}</svg>`;
      this.applySettings();
      Game.init({ onComplete: (r) => this.onLevelComplete(r) });
      CDL.Teacher.bind();

      document.addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-action]');
        if (!b || b.disabled) return;
        CDL.audio.unlock();
        this.action(b.dataset.action, b);
      });
      $('profile-form').addEventListener('submit', (ev) => { ev.preventDefault(); this.saveNewProfile(); });
      $('map-prev').addEventListener('click', () => this.showMap(Math.max(1, this.mapWorld - 1)));
      $('map-next').addEventListener('click', () => this.showMap(Math.min(CDL.WORLDS.length, this.mapWorld + 1)));

      window.addEventListener('pagehide', () => { if (Game.isActive()) Game.abandon(); });
      window.addEventListener('resize', () => { if (this.screen === 'game' && Game.state) Game.renderSlotsKeep && Game.renderSlotsKeep(); });
      document.addEventListener('visibilitychange', () => { if (document.hidden) CDL.audio.stopVoice(); });

      this.go('home');
      if (!Progress.storageOk) CDL.fx.toast('Atenção: este navegador não está salvando o progresso.', 5000);
    },

    applySettings() {
      const s = Progress.settings;
      CDL.audio.configure({ sound: s.sound, voice: s.voice, volume: s.volume });
      document.body.classList.toggle('reduced-motion', !!s.reducedMotion);
      document.querySelectorAll('.btn-sound').forEach((b) => { b.textContent = s.sound ? '🔊' : '🔇'; b.classList.toggle('off', !s.sound); });
    },

    /* ---------- navegação ---------- */
    go(name) {
      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
      $('screen-' + name).classList.add('active');
      this.screen = name;
      if (name === 'home') this.refreshHome();
      if (name === 'profiles') this.renderProfiles();
      if (name === 'worlds') this.renderWorlds();
      if (name === 'settings') this.renderSettings();
      if (name === 'teacher') CDL.Teacher.open();
    },
    openOverlay(id) { $(id).classList.add('open'); },
    closeOverlay(id) { $(id).classList.remove('open'); },
    closeAllOverlays() { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); },

    confirm(text, yes = 'SIM') {
      return new Promise((resolve) => {
        $('confirm-text').textContent = text;
        $('confirm-yes').textContent = yes;
        this._confirm = resolve;
        this.openOverlay('ov-confirm');
      });
    },

    requireProfile(next) {
      if (Progress.current()) return true;
      this.afterProfile = next;
      this.go('profiles');
      if (!Progress.profiles().length) this.showProfileForm();
      return false;
    },

    action(a, el) {
      switch (a) {
        case 'home': CDL.audio.play('tap'); this.go('home'); break;
        case 'play':
          CDL.audio.play('select');
          this.afterProfile = 'worlds';
          this.go('profiles');
          if (!Progress.profiles().length) this.showProfileForm();
          break;
        case 'continue': {
          CDL.audio.play('select');
          if (!this.requireProfile('continue')) return;
          this.continueAdventure();
          break;
        }
        case 'worlds': CDL.audio.play('select'); if (this.requireProfile('worlds')) this.go('worlds'); break;
        case 'settings': CDL.audio.play('select'); this.go('settings'); break;
        case 'teacher': CDL.audio.play('tap'); this.go('teacher'); break;
        case 'teacher-exit': CDL.audio.play('tap'); CDL.Teacher.lock(); this.go('home'); break;
        case 'profiles': CDL.audio.play('tap'); this.afterProfile = 'home'; this.go('profiles'); break;
        case 'cancel-profile': $('profile-form').classList.add('hidden'); $('profiles-grid').classList.remove('hidden'); if (!Progress.profiles().length) this.go('home'); break;

        case 'start-level': this.startLevel(); break;
        case 'speak-word': CDL.audio.speak(Game.state ? Game.state.word.toLowerCase() : '', { rate: 0.75 }); break;
        case 'intro-map': this.closeOverlay('ov-intro'); Game.cleanup(); this.showMap(this.mapWorld); break;

        case 'hint': Game.hint(); break;
        case 'pause': if (!Game.isActive()) return; Game.pause(); CDL.audio.play('tap'); this.openOverlay('ov-pause'); break;
        case 'resume': this.closeOverlay('ov-pause'); Game.resume(); break;
        case 'restart': this.closeOverlay('ov-pause'); Game.abandon(); this.openLevel(this.currentLevel); break;
        case 'pause-map': this.closeOverlay('ov-pause'); Game.abandon(); this.showMap(CDL.LEVELS[this.currentLevel - 1].world); break;
        case 'pause-home': this.closeOverlay('ov-pause'); Game.abandon(); this.go('home'); break;
        case 'toggle-sound': {
          const v = !Progress.settings.sound;
          Progress.setSetting('sound', v);
          this.applySettings();
          if (v) CDL.audio.play('select');
          if (this.screen === 'settings') this.renderSettings();
          break;
        }

        case 'next': this.nextFromComplete(); break;
        case 'replay': this.closeOverlay('ov-complete'); this.openLevel(this.currentLevel); break;
        case 'map': this.closeOverlay('ov-complete'); this.showMap(CDL.LEVELS[this.currentLevel - 1].world); break;
        case 'world-continue': this.afterWorldReward(); break;
        case 'final-close': this.closeOverlay('ov-final'); this.go('worlds'); break;
        case 'print': window.print(); break;

        case 'confirm-yes': this.closeOverlay('ov-confirm'); if (this._confirm) this._confirm(true); this._confirm = null; break;
        case 'confirm-no': this.closeOverlay('ov-confirm'); if (this._confirm) this._confirm(false); this._confirm = null; break;
        case 'rotate-ok': this.closeOverlay('ov-rotate'); this._rotateSeen = true; break;
      }
    },

    /* ---------- tela inicial ---------- */
    refreshHome() {
      const p = Progress.current();
      const chip = document.querySelector('.profile-chip');
      if (p) {
        chip.querySelector('.chip-avatar').textContent = avatarEmoji(p.avatar);
        chip.querySelector('.chip-name').textContent = p.name + ' · ★ ' + Progress.starsTotal(p);
      } else {
        chip.querySelector('.chip-avatar').textContent = '👤';
        chip.querySelector('.chip-name').textContent = 'ESCOLHER EXPLORADOR';
      }
      const cont = document.querySelector('[data-action="continue"]');
      const n = p ? Progress.nextLevel(p) : null;
      cont.innerHTML = '<span class="ico">⏩</span> ' + (p && n ? 'CONTINUAR · MISSÃO ' + String(n).padStart(2, '0') : 'CONTINUAR');
    },

    continueAdventure() {
      const p = Progress.current();
      const n = Progress.nextLevel(p);
      if (!n) { CDL.fx.toast('Você já completou todas as missões! Escolha uma fase para jogar de novo.'); this.go('worlds'); return; }
      this.openLevel(n);
    },

    /* ---------- perfis ---------- */
    renderProfiles() {
      const cur = Progress.current();
      const list = Progress.profiles();
      $('profile-form').classList.add('hidden');
      $('profiles-grid').classList.remove('hidden');
      $('profiles-grid').innerHTML = list.map((p) => `<button class="profile-card ${cur && cur.id === p.id ? 'current' : ''}" data-pid="${p.id}">
          <span class="avatar">${avatarEmoji(p.avatar)}</span><span class="pname">${esc(p.name)}</span><span class="pstats">★ ${Progress.starsTotal(p)} · ${Progress.completedCount(p)}/${CDL.LEVELS.length} fases</span></button>`).join('') +
        `<button class="profile-card new" data-pid="new"><span class="avatar">+</span><span class="pname">NOVO EXPLORADOR</span></button>`;
      $('profiles-grid').querySelectorAll('.profile-card').forEach((b) => b.addEventListener('click', () => {
        CDL.audio.play('select');
        if (b.dataset.pid === 'new') return this.showProfileForm();
        Progress.select(b.dataset.pid);
        this.afterProfileChosen();
      }));
    },
    showProfileForm() {
      $('profiles-grid').classList.add('hidden');
      $('profile-form').classList.remove('hidden');
      $('profile-name').value = '';
      this.newAvatar = CDL.AVATARS[Progress.profiles().length % CDL.AVATARS.length].id;
      $('avatar-grid').innerHTML = CDL.AVATARS.map((a) => `<button type="button" class="avatar-opt ${a.id === this.newAvatar ? 'sel' : ''}" data-av="${a.id}" aria-label="${a.label}">${a.emoji}</button>`).join('');
      $('avatar-grid').querySelectorAll('.avatar-opt').forEach((b) => b.addEventListener('click', () => {
        CDL.audio.play('tap');
        this.newAvatar = b.dataset.av;
        $('avatar-grid').querySelectorAll('.avatar-opt').forEach((x) => x.classList.toggle('sel', x === b));
      }));
    },
    saveNewProfile() {
      const p = Progress.create($('profile-name').value, this.newAvatar);
      CDL.audio.play('correct');
      CDL.fx.toast('Bem-vindo(a), ' + p.name + '!');
      this.afterProfileChosen();
    },
    afterProfileChosen() {
      const next = this.afterProfile;
      if (next === 'continue') return this.continueAdventure();
      if (next === 'home') return this.go('home');
      const p = Progress.current();
      if (Progress.completedCount(p) === 0) return this.openLevel(1); // primeira aventura começa direto na missão 1
      this.go('worlds');
    },

    /* ---------- mundos ---------- */
    renderWorlds() {
      const p = Progress.current();
      $('worlds-stars').textContent = p ? '★ ' + Progress.starsTotal(p) + '/' + CDL.LEVELS.length * 3 : '';
      $('worlds-grid').innerHTML = CDL.WORLDS.map((W) => {
        const unlocked = Progress.isUnlocked(p, W.first);
        let done = 0, stars = 0;
        for (let n = W.first; n <= W.last; n++) { if (Progress.isCompleted(p, n)) done++; const l = Progress.levelInfo(p, n); stars += l ? l.bestStars || 0 : 0; }
        const prev = CDL.buildScene(W.first, 'w');
        const complete = done === 10;
        return `<button class="world-card ${unlocked ? '' : 'locked'}" data-world="${W.id}" style="--wbg:${W.bg};--wd:${W.dark}">
          <div class="wprev"><svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${prev.svg}</svg>
            <span class="wnum">MUNDO ${W.id}</span>${unlocked ? '' : '<span class="wlock">🔒</span>'}${complete ? `<span class="wmedal">${CDL.medalSVG(W.id)}</span>` : ''}</div>
          <div class="winfo"><div class="wname">${W.name}</div><div class="wlevel">Nível ${W.level} · fases ${W.first} a ${W.last}</div>
          <div class="wbar"><i style="width:${done * 10}%"></i></div>
          <div class="wmeta"><span>${done}/10 fases</span><span>★ ${stars}/30</span></div></div></button>`;
      }).join('');
      $('worlds-grid').querySelectorAll('.world-card').forEach((c) => c.addEventListener('click', () => {
        const w = +c.dataset.world;
        if (c.classList.contains('locked')) {
          CDL.audio.play('wrong');
          CDL.fx.toast('Complete o mundo ' + CDL.WORLDS[w - 2].short.toUpperCase() + ' para abrir este mundo!');
          return;
        }
        CDL.audio.play('select');
        this.showMap(w);
      }));
    },

    /* ---------- mapa ---------- */
    showMap(w) {
      if (!this.requireProfile('worlds')) return;
      this.mapWorld = w;
      const W = CDL.WORLDS[w - 1];
      const p = Progress.current();
      document.documentElement.style.setProperty('--world', W.color);
      document.documentElement.style.setProperty('--world-d', W.dark);
      this.go('map');
      $('map-title').textContent = W.name;
      let stars = 0;
      const pos = [[10, 72], [22, 40], [34, 70], [45, 34], [55, 66], [65, 30], [74, 64], [82, 32], [90, 62], [92, 20]].map(([x, y], i) => [x - (i === 9 ? 2 : 0), y]);
      const next = Progress.nextLevel(p);
      const nodes = [];
      for (let i = 0; i < 10; i++) {
        const n = W.first + i;
        const l = Progress.levelInfo(p, n);
        const done = Progress.isCompleted(p, n);
        const unlocked = Progress.isUnlocked(p, n);
        stars += l ? l.bestStars || 0 : 0;
        const st = l ? l.bestStars || 0 : 0;
        nodes.push(`<button class="level-node ${done ? 'done' : ''} ${unlocked ? '' : 'locked'} ${n === next && unlocked ? 'current' : ''}" data-level="${n}" style="left:${pos[i][0]}%;top:${pos[i][1]}%" aria-label="Missão ${n}${unlocked ? '' : ' bloqueada'}">
          ${done ? `<span class="nword">${CDL.LEVELS[n - 1].word}</span>` : ''}${unlocked ? n : '🔒'}${unlocked ? `<span class="nstars">${'⭐'.repeat(st)}${'<span style="opacity:.35">⭐</span>'.repeat(3 - st)}</span>` : ''}</button>`);
      }
      const path = pos.map(([x, y], i) => (i ? 'L' : 'M') + x * 10 + ' ' + y * 6).join(' ');
      const bg = CDL.buildScene(W.first + 4, 'm');
      $('map-board').innerHTML = `<svg class="map-bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${bg.svg}</svg><div class="map-shade"></div>
        <svg class="map-path" viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="${path}" stroke="#fff" stroke-width="10" stroke-dasharray="4 22" stroke-linecap="round" fill="none" opacity=".9" vector-effect="non-scaling-stroke"/></svg>${nodes.join('')}`;
      $('map-stars').textContent = '★ ' + stars + '/30';
      $('map-prev').style.visibility = w > 1 ? 'visible' : 'hidden';
      $('map-next').style.visibility = w < CDL.WORLDS.length ? 'visible' : 'hidden';
      $('map-board').querySelectorAll('.level-node').forEach((b) => b.addEventListener('click', () => {
        if (b.classList.contains('locked')) { CDL.audio.play('wrong'); CDL.fx.toast('Complete a missão anterior para abrir esta!'); return; }
        CDL.audio.play('select');
        this.openLevel(+b.dataset.level);
      }));
    },

    /* ---------- fase ---------- */
    openLevel(n) {
      const p = Progress.current();
      if (!p) return this.requireProfile('worlds');
      if (!Progress.isUnlocked(p, n)) { CDL.fx.toast('Esta missão ainda está bloqueada.'); return; }
      this.closeAllOverlays();
      this.currentLevel = n;
      const lvl = CDL.LEVELS[n - 1];
      this.mapWorld = lvl.world;
      const info = Progress.levelInfo(p, n);
      CDL.fx.transition(() => {
        this.go('game');
        const layout = Game.prepare(n, info ? info.plays : 0);
        this.showIntro(n, layout);
        this.checkRotate();
      });
    },

    showIntro(n, layout) {
      const lvl = CDL.LEVELS[n - 1];
      const W = CDL.WORLDS[lvl.world - 1];
      const p = Progress.current();
      $('intro-world').textContent = 'MUNDO ' + W.id + ' · ' + W.name;
      $('intro-mission').textContent = 'MISSÃO ' + String(n).padStart(2, '0');
      $('intro-scene').textContent = 'Cenário: ' + layout.scene.name;
      const colors = CDL.LETTER_COLORS;
      $('intro-word').innerHTML = lvl.word.split('').map((c, i) => `<span class="tile" style="background:${colors[i % colors.length]};animation-delay:${i * 0.08}s">${c}</span>`).join('');
      let msg;
      if (n === 1 && Progress.completedCount(p) === 0) msg = 'Olá! Eu sou a LUPA, uma raposa exploradora! As letras se perderam pelos cenários. Encontre as letras da palavra e toque nelas para coletar!';
      else if (n === W.first) msg = 'Bem-vindo ao mundo ' + W.name + '! Aqui as letras estão ' + (W.intro || (W.id === 2 ? 'mais escondidas entre os objetos do mar.' : 'muito bem disfarçadas. Observe com atenção!'));
      else msg = 'Procure as letras ' + lvl.word.split('').join(' - ') + ' no cenário. Se precisar, peça uma dica!';
      $('intro-bubble').textContent = msg;
      $('btn-speak').style.display = CDL.audio.voiceAvailable && Progress.settings.voice ? '' : 'none';
      this.openOverlay('ov-intro');
      CDL.audio.speak('Missão ' + n + '. Encontre as letras para formar: ' + lvl.word.toLowerCase());
    },

    startLevel() {
      this.closeOverlay('ov-intro');
      CDL.audio.play('select');
      Game.start();
    },

    checkRotate() {
      const portrait = window.matchMedia('(orientation: portrait)').matches;
      if (portrait && window.innerWidth < 1000 && !this._rotateSeen) this.openOverlay('ov-rotate');
    },

    /* ---------- conclusão ---------- */
    onLevelComplete(r) {
      const p = Progress.current();
      const lvl = CDL.LEVELS[r.n - 1];
      Progress.recordAttempt(p, r.n, { timeMs: r.timeMs, hints: r.hints, errors: r.errors, stars: r.stars, completed: true, inOrder: r.inOrder });
      this.lastResult = r;
      CDL.audio.play('complete');
      CDL.fx.confetti(55);

      $('complete-title').textContent = r.message;
      $('complete-stars').innerHTML = CDL.starSVG() + CDL.starSVG() + CDL.starSVG();
      $('complete-stars').querySelectorAll('.star').forEach((s, i) => {
        if (i < r.stars) setTimeout(() => { s.classList.add('on'); CDL.audio.play('star'); }, 500 + i * 450);
      });
      $('complete-art').innerHTML = CDL.illustration(r.word);
      $('complete-word').textContent = r.word;
      $('complete-msg').textContent = 'Você encontrou a palavra ' + r.word + '!';
      $('complete-stats').innerHTML = r.criteria.map((c) => `<li class="${c.ok ? 'ok' : 'no'}">${c.ok ? '⭐' : '☆'} ${c.text}</li>`).join('') +
        `<li>⏱️ Tempo da missão: <b>${CDL.formatTime(r.timeMs, true)}</b></li><li>💡 Dicas: <b>${r.hints}</b> · 🧭 Aventura: <b>${CDL.formatTime(p.totalTimeMs)}</b></li>`;

      const W = CDL.WORLDS[lvl.world - 1];
      const worldDone = r.n === W.last ? Progress.worldComplete(p, W.id) : false;
      const pendingReward = worldDone && !p.worldsCelebrated.includes(W.id);
      const pendingFinal = Progress.finalPending(p);
      const btn = $('btn-next');
      if (pendingReward) btn.innerHTML = '🏅 VER RECOMPENSA!';
      else if (pendingFinal) btn.innerHTML = '🏆 GRANDE FINAL!';
      else if (r.n < CDL.LEVELS.length) btn.innerHTML = 'PRÓXIMA MISSÃO ▶';
      else btn.innerHTML = '🗺️ VER MUNDOS';
      this.openOverlay('ov-complete');
      setTimeout(() => CDL.audio.speak('Você encontrou a palavra ' + r.word.toLowerCase() + '!', { interrupt: false }), 900);
    },

    nextFromComplete() {
      const p = Progress.current();
      const n = this.currentLevel;
      const W = CDL.WORLDS[CDL.LEVELS[n - 1].world - 1];
      this.closeOverlay('ov-complete');
      if (n === W.last && Progress.worldComplete(p, W.id) && !p.worldsCelebrated.includes(W.id)) return this.showWorldReward(W.id);
      if (Progress.finalPending(p)) return this.showFinal();
      if (n < CDL.LEVELS.length) return this.openLevel(n + 1);
      this.go('worlds');
    },

    showWorldReward(w) {
      const p = Progress.current();
      const W = CDL.WORLDS[w - 1];
      p.worldsCelebrated.push(w);
      Progress.save();
      $('world-medal').innerHTML = CDL.medalSVG(w);
      $('world-reward-name').textContent = W.medal;
      $('world-reward-msg').textContent = W.reward + ' Você ganhou a ' + W.medal.toLowerCase() + '!';
      const nextW = CDL.WORLDS[w];
      $('world-unlock').textContent = nextW ? '🔓 Novo mundo desbloqueado: ' + nextW.name + '!' : '';
      $('btn-world-continue').innerHTML = nextW ? 'IR PARA O ' + nextW.short.toUpperCase() + ' ▶' : '🏆 GRANDE FINAL!';
      this._rewardWorld = w;
      this.openOverlay('ov-world');
      CDL.audio.play('unlock');
      CDL.fx.confetti(80);
      CDL.audio.speak('Parabéns! Você ganhou a ' + W.medal.toLowerCase());
    },
    afterWorldReward() {
      this.closeOverlay('ov-world');
      const p = Progress.current();
      const w = this._rewardWorld;
      if (w === CDL.WORLDS.length || Progress.finalPending(p)) return this.showFinal();
      const nextW = CDL.WORLDS[w];
      this.showMap(nextW.id);
    },

    showFinal() {
      const p = Progress.current();
      p.finalCelebrated = CDL.LEVELS.length;
      Progress.save();
      Game.cleanup();
      this.go('worlds');
      $('final-trophy').innerHTML = CDL.trophySVG();
      $('final-name').textContent = p.name;
      const hints = Object.values(p.levels).reduce((a, l) => a + (l.hints || 0), 0);
      $('final-stats').innerHTML = `<div><b>${CDL.LEVELS.length}/${CDL.LEVELS.length}</b>missões</div><div><b>★ ${Progress.starsTotal(p)}</b>estrelas</div><div><b>${CDL.formatTime(p.totalTimeMs)}</b>tempo de aventura</div><div><b>${hints}</b>dicas</div>`;
      $('final-words').innerHTML = CDL.LEVELS.map((l) => `<span>${l.word}</span>`).join('');
      this.openOverlay('ov-final');
      CDL.audio.play('unlock');
      CDL.fx.confetti(110);
      setTimeout(() => CDL.fx.confetti(70), 1800);
      CDL.audio.speak('Você é um verdadeiro caçador de letras!');
    },

    /* ---------- configurações ---------- */
    renderSettings() {
      const s = Progress.settings;
      const p = Progress.current();
      const voiceRow = CDL.audio.voiceAvailable
        ? `<div class="setting-row"><div class="sl">🗣️ Narração por voz<small>A Lupa fala as letras e as palavras</small></div><button class="toggle ${s.voice ? 'on' : ''}" data-set="voice" aria-label="Narração"></button></div>`
        : `<div class="setting-row"><div class="sl">🗣️ Narração por voz<small>Este aparelho não possui voz disponível no navegador.</small></div></div>`;
      const fsAvail = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
      $('settings-list').innerHTML = `
        <div class="setting-row"><div class="sl">🔊 Efeitos sonoros<small>Sons de acerto, erro e comemoração</small></div><button class="toggle ${s.sound ? 'on' : ''}" data-set="sound" aria-label="Efeitos sonoros"></button></div>
        <div class="setting-row"><div class="sl">🎚️ Volume</div><div class="seg">${[['Baixo', 0.3], ['Médio', 0.6], ['Alto', 0.9]].map(([l, v]) => `<button data-vol="${v}" class="${Math.abs(s.volume - v) < 0.05 ? 'sel' : ''}">${l}</button>`).join('')}</div></div>
        ${voiceRow}
        <div class="setting-row"><div class="sl">🐢 Animações mais calmas<small>Reduz movimentos e efeitos na tela</small></div><button class="toggle ${s.reducedMotion ? 'on' : ''}" data-set="reducedMotion" aria-label="Animações calmas"></button></div>
        ${fsAvail ? '<div class="setting-row"><div class="sl">⛶ Tela cheia<small>Ocupa a tela inteira do tablet ou computador</small></div><button class="btn btn-blue" data-fs="1">TELA CHEIA</button></div>' : ''}
        <div class="setting-row"><div class="sl">🧒 Explorador atual<small>${p ? esc(p.name) : 'Nenhum selecionado'}</small></div><button class="btn btn-purple" data-action="profiles">TROCAR</button></div>`;
      const list = $('settings-list');
      list.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.set;
        Progress.setSetting(k, !Progress.settings[k]);
        this.applySettings();
        CDL.audio.play('tap');
        if (k === 'voice' && Progress.settings.voice) CDL.audio.speak('Olá! Eu sou a Lupa!');
        this.renderSettings();
      }));
      list.querySelectorAll('[data-vol]').forEach((b) => b.addEventListener('click', () => {
        Progress.setSetting('volume', +b.dataset.vol);
        this.applySettings();
        CDL.audio.play('correct');
        this.renderSettings();
      }));
      const fs = list.querySelector('[data-fs]');
      if (fs) fs.addEventListener('click', () => {
        const d = document;
        if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
        else { const el = d.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
      });
    }
  };

  // recalcula o tamanho das caixinhas sem perder o progresso ao girar/redimensionar
  Game.renderSlotsKeep = function () {
    const st = this.state;
    if (!st) return;
    const avail = Math.min(window.innerWidth - (window.innerWidth > 900 ? 600 : 220), 760);
    const size = Math.max(40, Math.min(72, Math.floor(avail / st.slots.length) - 8));
    document.querySelectorAll('#slots .slot').forEach((el) => el.style.setProperty('--s', size + 'px'));
  };

  CDL.App = App;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
  else App.init();

  // modo offline (service worker) — somente quando servido por http(s)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
