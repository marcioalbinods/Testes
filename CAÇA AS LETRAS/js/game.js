/* =========================================================
   CAÇADORES DE LETRAS — Lógica da missão
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const CFG = window.CDL_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const MSG = {
    correct: ['Muito bem!', 'Isso mesmo!', 'Você achou a letra {L}!', 'Excelente!', 'Que olho de explorador!', 'Mandou bem!', 'Perfeito!'],
    wrong: ['Essa não! Continue procurando!', 'Quase! Essa letra não está na palavra.', 'Essa não! Tente outra letra.', 'Hum... essa não faz parte da palavra. Continue!'],
    idle: ['Precisa de ajuda? Toque em PRECISO DE UMA DICA!', 'Olhe com calma cada cantinho do cenário!', 'Você está indo muito bem! Continue procurando!'],
    done: ['VOCÊ CONSEGUIU!', 'MISSÃO CUMPRIDA!', 'VOCÊ É UM EXPLORADOR DE LETRAS!', 'PARABÉNS! MAIS UMA AVENTURA CONCLUÍDA!']
  };

  function regionText(x, y) {
    const h = x < 560 ? 'do lado esquerdo' : x > 1040 ? 'do lado direito' : 'no meio';
    const v = y < 320 ? 'lá em cima' : y > 600 ? 'lá embaixo' : '';
    if (!v && h === 'no meio') return 'bem no meio do cenário';
    if (!v) return h + ' do cenário';
    return v + ', ' + (h === 'no meio' ? 'no meio' : h);
  }

  function decoSVG(kind, s) {
    const k = s * 0.32;
    if (kind === 1) return `<g class="deco" transform="translate(${s * 0.28} ${s * 0.3}) rotate(-30)"><ellipse rx="${k}" ry="${k * 0.48}" fill="#4CAF50" stroke="#2E7D32" stroke-width="3"/><path d="M${-k} 0 H${k}" stroke="#2E7D32" stroke-width="3"/></g>`;
    if (kind === 2) return `<g class="deco" transform="translate(${-s * 0.34} ${-s * 0.36})"><path d="M0 0 L${k * 1.3} 0 M0 0 L0 ${k * 1.3} M0 0 L${k} ${k}" stroke="#fff" stroke-width="2.5" opacity=".9"/><path d="M${k * 0.5} 0 Q${k * 0.42} ${k * 0.42} 0 ${k * 0.5} M${k * 1.0} 0 Q${k * 0.8} ${k * 0.8} 0 ${k}" stroke="#fff" stroke-width="2.5" fill="none" opacity=".9"/></g>`;
    return `<g class="deco" transform="translate(${-s * 0.38} ${s * 0.32})"><circle r="${k * 0.42}" fill="#FFD23F" stroke="#E0A100" stroke-width="3"/><circle cx="${k * 0.6}" cy="${-k * 0.15}" r="${k * 0.32}" fill="#FF6FA5"/></g>`;
  }

  function letterSVG(L, style, world) {
    const s = style.size;
    let halo = '';
    if (world === 1) halo = `<circle class="halo" r="${s * 0.62}" fill="#fff" fill-opacity=".78" stroke="${L.color}" stroke-opacity=".45" stroke-width="6"/>`;
    else if (world === 2) halo = `<circle class="halo" r="${s * 0.56}" fill="#fff" fill-opacity=".3"/>`;
    return `<g class="letter" data-id="${L.id}" data-ch="${L.ch}" data-target="${L.target ? 1 : 0}" transform="translate(${L.x} ${L.y})" role="button" tabindex="0" aria-label="Letra ${L.ch}">
      <g class="letter-inner">
        <circle class="hit" r="${Math.round(s * 0.76)}"/>
        ${halo}
        <text class="glyph" transform="rotate(${L.rot})" font-size="${s}" text-anchor="middle" dy="0.36em" fill="${L.color}" stroke="#fff" stroke-width="${Math.round(s * (world === 3 ? 0.12 : 0.15))}" filter="url(#lshadow)">${L.ch}</text>
        ${L.deco ? decoSVG(L.deco, s) : ''}
        <g class="check" transform="translate(${s * 0.48} ${-s * 0.46})"><circle r="${s * 0.2}" fill="#2DBE60" stroke="#fff" stroke-width="4"/><path d="M${-s * 0.09} 0 L${-s * 0.02} ${s * 0.07} L${s * 0.1} ${-s * 0.07}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>
      </g>
    </g>`;
  }

  const Game = {
    state: null,
    timer: new CDL.Timer(),
    tickHandle: null,
    callbacks: {},

    init(callbacks) {
      this.callbacks = callbacks || {};
      const svg = $('scene');
      const handler = (ev) => {
        const el = ev.target.closest && ev.target.closest('.letter');
        if (el) this.onLetter(el);
      };
      svg.addEventListener('click', handler);
      svg.addEventListener('keydown', (ev) => {
        if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.closest('.letter')) { ev.preventDefault(); handler(ev); }
      });
    },

    /** Monta o cenário e as letras (antes de iniciar o cronômetro). */
    prepare(n, seed) {
      this.cleanup();
      const layout = CDL.layoutLevel(n, seed);
      const { level, scene, letters, style } = layout;
      const word = level.word;
      this.state = {
        n, word, world: level.world, letters, style,
        slots: word.split('').map((ch) => ({ ch, filled: false })),
        hints: 0, errors: 0, inOrder: true,
        hintStage: {}, started: false, finished: false, lastFound: Date.now(), busy: false
      };
      const W = CDL.WORLDS[level.world - 1];
      document.documentElement.style.setProperty('--world', W.color);
      document.documentElement.style.setProperty('--world-d', W.dark);

      const svg = $('scene');
      svg.innerHTML = `<defs><filter id="lshadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="5" stdDeviation="2" flood-color="#000" flood-opacity=".35"/></filter></defs>
        <g class="scene-art">${scene.svg}</g>
        <g id="letters-layer">${letters.map((L) => letterSVG(L, style, level.world)).join('')}</g>
        <g id="hint-layer"></g>`;

      $('hud-mission').textContent = 'MISSÃO ' + String(n).padStart(2, '0');
      $('hud-word').textContent = word;
      this.renderSlots();
      this.updateProgress();
      $('timer-level').textContent = '00:00';
      this.updateTotal();
      this.say('Encontre as letras da palavra ' + word + '!');
      return layout;
    },

    renderSlots() {
      const st = this.state;
      const n = st.slots.length;
      const box = $('slots');
      const avail = Math.min(window.innerWidth - (window.innerWidth > 900 ? 600 : 220), 760);
      const size = Math.max(40, Math.min(72, Math.floor(avail / n) - 8));
      box.innerHTML = st.slots.map((s, i) => `<div class="slot" data-i="${i}" style="--s:${size}px"><span class="ghost">${s.ch}</span></div>`).join('');
      this.markNextSlot();
    },
    firstOpenSlot() { return this.state.slots.findIndex((s) => !s.filled); },
    markNextSlot() {
      const i = this.firstOpenSlot();
      document.querySelectorAll('#slots .slot').forEach((el, k) => el.classList.toggle('next', k === i));
    },
    updateProgress() {
      const st = this.state;
      const done = st.slots.filter((s) => s.filled).length;
      $('progress-fill').style.width = (done / st.slots.length) * 100 + '%';
    },

    start() {
      const st = this.state;
      if (!st || st.started) return;
      st.started = true;
      st.lastFound = Date.now();
      this.timer.start();
      this.startTick();
      const next = st.slots[0].ch;
      this.say('Procure a letra ' + next + ' para começar!', 'talk');
    },

    startTick() {
      clearInterval(this.tickHandle);
      this.tickHandle = setInterval(() => this.tick(), 250);
    },
    tick() {
      const st = this.state;
      if (!st) return;
      $('timer-level').textContent = CDL.formatTime(this.timer.elapsed());
      this.updateTotal();
      if (st.started && !st.finished && this.timer.running && Date.now() - st.lastFound > 25000) {
        st.lastFound = Date.now();
        this.say(pick(MSG.idle));
        $('btn-hint').classList.add('glow');
      }
    },
    updateTotal() {
      const p = CDL.Progress.current();
      const base = p ? p.totalTimeMs || 0 : 0;
      $('timer-total').textContent = CDL.formatTime(base + (this.state && this.state.started && !this.state.finished ? this.timer.elapsed() : 0));
    },

    say(text, mood) {
      const b = $('guide-bubble');
      b.textContent = text;
      b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
      const lupa = document.querySelector('#guide-lupa .lupa');
      if (lupa) {
        lupa.classList.remove('happy', 'talking');
        lupa.classList.add(mood === 'happy' ? 'happy' : 'talking');
        clearTimeout(this._moodT);
        this._moodT = setTimeout(() => lupa.classList.remove('happy', 'talking'), mood === 'happy' ? 1400 : 1800);
      }
    },
    feedback(text, kind) {
      const f = $('feedback');
      f.textContent = text;
      f.className = 'feedback show ' + (kind || '');
      clearTimeout(this._fbT);
      this._fbT = setTimeout(() => (f.className = 'feedback'), 1600);
    },

    onLetter(el) {
      const st = this.state;
      if (!st || !st.started || st.finished || el.classList.contains('collected') || el.dataset.busy) return;
      if (!this.timer.running) return; // pausado
      CDL.audio.unlock();
      const ch = el.dataset.ch;
      // procura a primeira posição ainda vazia com essa letra (conta repetições corretamente)
      const slotIdx = st.slots.findIndex((s) => !s.filled && s.ch === ch);
      if (el.dataset.target === '1' && slotIdx !== -1) {
        this.collect(el, slotIdx);
      } else {
        this.wrong(el);
      }
    },

    collect(el, slotIdx) {
      const st = this.state;
      if (slotIdx !== this.firstOpenSlot()) st.inOrder = false;
      st.slots[slotIdx].filled = true;
      st.lastFound = Date.now();
      $('btn-hint').classList.remove('glow');
      this.clearHints();
      delete st.hintStage[slotIdx];
      el.classList.add('collected', 'pop');
      el.setAttribute('aria-disabled', 'true');
      const L = st.letters.find((x) => x.id === el.dataset.id);
      if (L) L.collected = true;
      CDL.audio.play('correct');
      CDL.audio.speak(el.dataset.ch.toLowerCase(), { rate: 0.8 });
      this.say(pick(MSG.correct).replace('{L}', el.dataset.ch), 'happy');
      this.feedback('✔ ' + el.dataset.ch, 'good');

      const glyph = el.querySelector('.glyph');
      const slotEl = document.querySelector(`#slots .slot[data-i="${slotIdx}"]`);
      const from = glyph.getBoundingClientRect();
      const to = slotEl.getBoundingClientRect();
      CDL.fx.burst(from.left + from.width / 2, from.top + from.height / 2);

      const finish = () => {
        slotEl.classList.remove('next');
        slotEl.classList.add('filled');
        slotEl.style.setProperty('--c', L ? L.color : '#6C4BE0');
        slotEl.innerHTML = el.dataset.ch;
        this.updateProgress();
        this.markNextSlot();
        if (st.slots.every((s) => s.filled)) this.verifyWord();
      };

      const fly = document.createElement('div');
      fly.className = 'fly-letter';
      fly.textContent = el.dataset.ch;
      const size = Math.max(from.height, 30);
      fly.style.cssText = `left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size / 2}px;width:${size}px;height:${size}px;font-size:${size * 0.95}px;color:${L ? L.color : '#fff'}`;
      document.body.appendChild(fly);
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      const scale = (to.height * 0.7) / size;
      const reduced = document.body.classList.contains('reduced-motion');
      if (fly.animate && !reduced) {
        const anim = fly.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(1.3)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.9 }
        ], { duration: 700, easing: 'ease-in-out' });
        anim.onfinish = () => { fly.remove(); finish(); };
      } else {
        fly.remove();
        finish();
      }
    },

    wrong(el) {
      const st = this.state;
      st.errors += 1;
      el.dataset.busy = '1';
      el.classList.remove('shake'); void el.getBoundingClientRect();
      el.classList.add('shake');
      setTimeout(() => { el.classList.remove('shake'); delete el.dataset.busy; }, 600);
      CDL.audio.play('wrong');
      const msg = pick(MSG.wrong);
      this.say(msg);
      this.feedback('Essa não! Continue procurando!', 'soft');
    },

    /* ---------- dicas progressivas ---------- */
    hint() {
      const st = this.state;
      if (!st || !st.started || st.finished || !this.timer.running) return;
      const slotIdx = this.firstOpenSlot();
      if (slotIdx === -1) return;
      const ch = st.slots[slotIdx].ch;
      const L = st.letters.find((l) => l.target && !l.collected && l.ch === ch);
      if (!L) return;
      st.hints += 1;
      st.lastFound = Date.now();
      $('btn-hint').classList.remove('glow');
      const stage = Math.min(3, (st.hintStage[slotIdx] || 0) + 1);
      st.hintStage[slotIdx] = stage;
      this.clearHints();
      CDL.audio.play('hint');
      const layer = $('hint-layer');
      const el = document.querySelector(`.letter[data-id="${L.id}"]`);
      const s = st.style.size;

      if (stage === 1) {
        // Dica 1: região aproximada
        const ang = Math.random() * Math.PI * 2;
        const off = 70 + Math.random() * 60;
        const cx = Math.min(1440, Math.max(160, L.x + Math.cos(ang) * off));
        const cy = Math.min(760, Math.max(140, L.y + Math.sin(ang) * off));
        layer.innerHTML = `<g class="hint-region"><circle cx="${cx}" cy="${cy}" r="250" fill="#FFF59D" fill-opacity=".22" stroke="#FFD23F" stroke-width="10" stroke-dasharray="26 18"/></g>`;
        this.say('Dica: procure a letra ' + ch + ' ' + regionText(L.x, L.y) + '! Olhe dentro do círculo amarelo.', 'talk');
        this._hintT = setTimeout(() => this.clearHints(), 6000);
      } else if (stage === 2) {
        // Dica 2: animação discreta perto da letra
        let sp = '';
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const r = s * 1.05;
          sp += `<path d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4Z" fill="#FFF59D" stroke="#FFB400" stroke-width="2" transform="translate(${Math.cos(a) * r} ${Math.sin(a) * r})" style="animation-delay:${i * 0.15}s"/>`;
        }
        layer.innerHTML = `<g transform="translate(${L.x} ${L.y})"><g class="hint-sparkle">${sp}</g></g>`;
        if (el) el.classList.add('wiggle');
        this.say('Olhe as estrelinhas brilhando! A letra ' + ch + ' está bem ali.', 'talk');
        this._hintT = setTimeout(() => this.clearHints(), 6000);
      } else {
        // Dica 3: destaque da letra por alguns segundos
        layer.innerHTML = `<path class="hint-spot" fill="#120A35" fill-opacity=".55" fill-rule="evenodd" d="M0 0 H1600 V900 H0Z M${L.x - s} ${L.y} a${s} ${s} 0 1 0 ${s * 2} 0 a${s} ${s} 0 1 0 ${-s * 2} 0Z"/>
          <g transform="translate(${L.x} ${L.y})"><circle class="hint-ring" r="${s * 0.95}" fill="none" stroke="#FFD23F" stroke-width="10"/></g>`;
        if (el) el.classList.add('spot');
        this.say('Aqui está a letra ' + ch + '! Toque nela!', 'happy');
        this._hintT = setTimeout(() => this.clearHints(), CFG.hintHighlightMs || 4000);
      }
    },
    clearHints() {
      clearTimeout(this._hintT);
      const layer = $('hint-layer');
      if (layer) layer.innerHTML = '';
      document.querySelectorAll('.letter.wiggle, .letter.spot').forEach((e) => e.classList.remove('wiggle', 'spot'));
    },

    /* ---------- conclusão ---------- */
    verifyWord() {
      const st = this.state;
      st.finished = true;
      const timeMs = this.timer.stop();
      clearInterval(this.tickHandle);
      $('timer-level').textContent = CDL.formatTime(timeMs);
      this.clearHints();
      const formed = st.slots.map((s) => s.ch).join('');
      const ok = formed === st.word;
      const slotEls = document.querySelectorAll('#slots .slot');
      slotEls.forEach((e, i) => setTimeout(() => e.classList.add('verify'), i * 120));
      this.say('Você formou a palavra ' + st.word + '!', 'happy');
      CDL.audio.speak(st.word.toLowerCase(), { rate: 0.8 });

      const len = st.word.length;
      const hintOk = st.hints <= (len >= 7 ? 2 : 1);
      const careOk = st.errors <= (len >= 7 ? 3 : 2) || st.inOrder;
      const stars = 1 + (hintOk ? 1 : 0) + (careOk ? 1 : 0);
      const result = {
        n: st.n, word: st.word, ok, timeMs, hints: st.hints, errors: st.errors, inOrder: st.inOrder, stars,
        criteria: [
          { ok: true, text: 'Missão concluída' },
          { ok: hintOk, text: hintOk ? 'Usou poucas dicas' : 'Na próxima, tente usar menos dicas' },
          { ok: careOk, text: careOk ? (st.inOrder ? 'Encontrou as letras em ordem' : 'Procurou com muita atenção') : 'Na próxima, observe com mais calma' }
        ],
        message: pick(MSG.done)
      };
      setTimeout(() => this.callbacks.onComplete && this.callbacks.onComplete(result), 300 + len * 120 + 600);
    },

    pause() { if (this.state && this.state.started && !this.state.finished) { this.timer.pause(); this.clearHints(); } },
    resume() { if (this.state && this.state.started && !this.state.finished) { this.timer.resume(); this.state.lastFound = Date.now(); } },
    isActive() { return !!(this.state && this.state.started && !this.state.finished); },

    /** Encerra a fase atual sem concluir (registra a tentativa interrompida). */
    abandon() {
      const st = this.state;
      if (st && st.started && !st.finished) {
        const timeMs = this.timer.stop();
        st.finished = true;
        if (timeMs > 1500 || st.hints || st.errors || st.slots.some((s) => s.filled)) {
          CDL.Progress.recordAttempt(CDL.Progress.current(), st.n, { timeMs, hints: st.hints, errors: st.errors, completed: false, inOrder: st.inOrder });
        }
      }
      this.cleanup();
    },
    cleanup() {
      clearInterval(this.tickHandle);
      this.clearHints();
      this.timer.reset();
      document.querySelectorAll('.fly-letter').forEach((e) => e.remove());
      $('btn-hint') && $('btn-hint').classList.remove('glow');
    }
  };

  CDL.Game = Game;
})();
