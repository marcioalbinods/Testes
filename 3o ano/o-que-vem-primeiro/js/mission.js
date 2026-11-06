/* O QUE VEM PRIMEIRO? — Tela da missão: conduz as etapas, dicas, simulação e resultado. */
(function (root) {
  'use strict';
  const { h, ICON, overlay, confetti, speak, stopSpeak, canSpeak, medalSVG, pop } = root.OQVP.ui;
  const L = root.OQVP.logic;
  const D = root.OQVP.data;
  const A = root.OQVP.activities;
  const audio = root.OQVP.audio;
  const store = root.OQVP.store;
  const robotLib = root.OQVP.robot;
  const art = root.OQVP.art;

  const TYPE_NAME = {
    order: 'Organize as etapas', next: 'O que acontece depois?', missing: 'Qual etapa está faltando?',
    fix: 'Descubra o erro', odd: 'O que não é necessário?', choose: 'Escolha o plano certo'
  };

  let live = null; // missão em andamento

  function start(app, n, opts) {
    opts = opts || {};
    // Modo professor (missão aberta pelo painel ou mapa liberado): joga normalmente, mas não salva o resultado.
    const teacherRun = !!opts.preview || !!store.load().teacher;
    const again = (k) => start(app, k, opts);
    if (live) live.token.dead = true;
    const m = D.mission(n);
    const lv = D.level(m.level);
    const token = { dead: false, paused: false, skip: false };
    const stats = { errors: 0, hints: 0, fixes: 0, extras: [] };
    let stageIdx = 0, act = null, busy = false, hintN = 0, prevOrder = null, lastWasOrder = false;
    const speed = root.OQVP_SPEED || 1;

    /* ---------- Montagem da tela ---------- */
    const pipoBox = h('div.guide-robot');
    const pipo = robotLib.mount(pipoBox, 'thinking');
    const bubbleText = h('p.bubble-text', { 'aria-live': 'polite' });
    const speakBtn = canSpeak() ? h('button.icon-btn.small.speak', { type: 'button', 'aria-label': 'Ouvir a fala do Pipo', html: ICON.speak }) : null;
    if (speakBtn) speakBtn.addEventListener('click', () => speak(bubbleText.textContent));
    const bubble = h('div.bubble', null, bubbleText, speakBtn);
    const dots = h('div.stage-dots', { 'aria-label': 'Progresso da missão' });
    m.stages.forEach(() => dots.appendChild(h('span.dot')));
    const stageTitle = h('div.stage-title');
    const board = h('div.board');
    const hintBtn = h('button.btn.hint', { type: 'button', html: `${ICON.bulb}<span>DICA</span>` });
    const actionBtn = h('button.btn.primary.action', { type: 'button' });
    const footer = h('footer.actions', null, hintBtn, actionBtn);

    const btnMap = h('button.icon-btn', { type: 'button', 'aria-label': 'Voltar ao mapa', title: 'Voltar ao mapa', html: ICON.map });
    const btnRestart = h('button.icon-btn', { type: 'button', 'aria-label': 'Reiniciar a missão', title: 'Reiniciar a missão', html: ICON.restart });
    const btnPause = h('button.icon-btn', { type: 'button', 'aria-label': 'Pausar', title: 'Pausar', html: ICON.pause });
    const points = h('div.score-pill', { title: 'Pontos acumulados' }, h('span', { html: ICON.star }), h('b', null, String(L.totals(store.load()).points)));

    const screen = h('section.screen.mission-screen', { 'data-level': m.level, style: { '--lv': lv.color, '--lv-dark': lv.dark, '--lv-soft': lv.soft } },
      h('header.topbar', null,
        btnMap,
        h('div.title-block', null,
          h('span.level-chip', null, `Nível ${lv.n} · ${lv.name}`),
          h('h1.mission-title', null, h('span.mnum', null, `Missão ${m.id}`), ' ', m.title)),
        teacherRun ? h('span.teacher-badge.small', { title: 'Modo professor: o resultado não é salvo' }, h('span', { html: ICON.teacher }), 'Professor') : null,
        dots, points, btnRestart, btnPause),
      h('div.guide', null, pipoBox, bubble),
      h('main.board-wrap', null, stageTitle, board),
      footer);
    app.show(screen);

    btnMap.addEventListener('click', () => { audio.play('tap'); leave(); app.go('map'); });
    btnRestart.addEventListener('click', () => { audio.play('tap'); confirmRestart(); });
    btnPause.addEventListener('click', () => { audio.play('tap'); pause(); });
    hintBtn.addEventListener('click', () => useHint());
    actionBtn.addEventListener('click', () => { if (actionBtn._fn) actionBtn._fn(); });

    function say(text, mood, anim) {
      bubbleText.textContent = text;
      pop(bubble);
      if (mood) pipo.set(mood, anim);
    }
    function setAction(cfg) {
      if (!cfg) { actionBtn.hidden = true; actionBtn._fn = null; return; }
      actionBtn.hidden = false;
      actionBtn.innerHTML = `${cfg.icon || ''}<span>${cfg.label}</span>`;
      actionBtn._fn = cfg.fn;
      actionBtn.classList.toggle('go', !!cfg.go);
    }
    function wait(ms, shortOnSkip) {
      return new Promise((res, rej) => {
        let left = ms;
        const iv = setInterval(() => {
          if (token.dead) { clearInterval(iv); rej(new Error('dead')); return; }
          if (token.paused) return;
          left -= token.skip && !shortOnSkip ? ms : 50;
          if (left <= 0) { clearInterval(iv); res(); }
        }, 50);
      });
    }

    const ctx = {
      m, token, speed, say, wait,
      robot: (mood, anim) => pipo.set(mood, anim),
      sound: (s) => audio.play(s),
      busy: () => busy || token.paused,
      mistake: () => { stats.errors++; },
      sim: (seq) => runSim(seq),
      solved: (info) => solved(info)
    };

    async function runSim(seq, title) {
      busy = true;
      const keep = Array.from(board.childNodes);
      const s = A.simulate(ctx, seq, { title });
      board.replaceChildren(s.panel);
      hintBtn.disabled = true; actionBtn.disabled = true;
      say(title ? 'Olhe só como fica a tarefa completa!' : 'Vamos ver... Vou seguir a sua sequência passo a passo!', 'thinking');
      const res = await s.run();
      if (res === 'dead' || token.dead) return 'dead';
      board.replaceChildren(...keep);
      hintBtn.disabled = false; actionBtn.disabled = false;
      busy = false;
      return res;
    }

    /* ---------- Etapas ---------- */
    function runStage(i) {
      stageIdx = i; hintN = 0;
      const st = m.stages[i];
      Array.from(dots.children).forEach((d, k) => { d.classList.toggle('done', k < i); d.classList.toggle('now', k === i); });
      dots.setAttribute('aria-label', `Desafio ${i + 1} de ${m.stages.length}`);
      stageTitle.innerHTML = '';
      stageTitle.append(h('span.stage-type', null, st.title || (m.stages.length > 1 ? `Desafio ${i + 1} de ${m.stages.length}: ` : '') + TYPE_NAME[st.type] + (st.different ? ' — outra maneira' : '')));
      ctx.st = st; ctx.prevOrder = prevOrder;
      act = A[st.type](ctx);
      board.replaceChildren(act.el);
      board.className = 'board board-' + st.type;
      hintBtn.disabled = false; hintBtn.hidden = false;
      setAction(act.action);
      say(st.prompt, 'thinking', 'tilt');
      lastWasOrder = st.type === 'order';
    }

    function useHint() {
      if (!act || busy || token.paused) return;
      const text = act.hint(hintN++);
      if (!text) return;
      stats.hints++;
      audio.play('hint');
      say(text, 'thinking', 'tilt');
    }

    function solved(info) {
      info = info || {};
      if (info.fixes) stats.fixes += info.fixes;
      if (info.bonus) stats.extras.push(info.bonus);
      if (info.order) prevOrder = info.order;
      audio.play('good');
      const praise = ['Excelente! Você organizou tudo direitinho!', 'Muito bem! Seu planejamento funcionou!', 'Você pensou antes de agir. Isso é raciocínio lógico!', 'Muito bem! Você percebeu que uma ação depende da outra!'];
      const last = stageIdx === m.stages.length - 1;
      say((info.msg ? info.msg + ' ' : '') + (info.msg && info.msg.length > 60 ? '' : praise[(m.id + stageIdx) % praise.length]), 'happy', 'jump');
      dots.children[stageIdx].classList.add('done');
      hintBtn.hidden = true;
      setAction({ label: last ? 'CONCLUIR MISSÃO' : 'PRÓXIMO DESAFIO', icon: ICON.go, go: true, fn: () => last ? finish() : runStage(stageIdx + 1) });
      setTimeout(() => { try { actionBtn.focus({ preventScroll: true }); } catch (e) { /* ok */ } }, 50);
    }

    async function finish() {
      setAction(null); hintBtn.hidden = true;
      if (m.simAfter && !lastWasOrder) {
        const r = await runSim(m.simAfter, 'Agora o Pipo faz a tarefa completa:');
        if (r === 'dead') return;
      }
      const before = store.load();
      const result = L.scoreMission(stats);
      let newMedals = [];
      if (!teacherRun) {
        const medalsBefore = L.earnedMedals(before);
        const after = L.recordMission(before, m.id, result);
        store.save(Object.assign(store.load(), { missions: after.missions }));
        newMedals = L.earnedMedals(after).filter((x) => !medalsBefore.includes(x));
        points.querySelector('b').textContent = L.totals(after).points;
      }
      pipo.set('excited', 'dance');
      say(m.win, 'excited', 'dance');
      audio.play('win');
      confetti(m.id === 15 ? 140 : 60);
      showResult(result, newMedals);
    }

    function showResult(result, newMedals) {
      const stars = h('div.result-stars', { 'aria-label': `${result.stars} de 3 estrelas` });
      for (let i = 0; i < 3; i++) stars.appendChild(h('span.rstar' + (i < result.stars ? '.on' : ''), { html: ICON.star, style: { animationDelay: (0.25 + i * 0.25) + 's' } }));
      const list = h('ul.score-list');
      result.items.forEach((it) => list.appendChild(h('li', null, h('span', null, it.label), h('b', null, '+' + it.pts))));
      list.appendChild(h('li.total', null, h('span', null, 'Total da missão'), h('b', null, String(result.total))));
      const nextN = m.id < 15 ? m.id + 1 : null;
      const btns = h('div.overlay-actions');
      const queue = newMedals.slice();
      const afterMedals = (fn) => () => {
        box.close();
        const showNext = () => {
          if (!queue.length) { fn(); return; }
          celebrateMedal(queue.shift(), showNext);
        };
        showNext();
      };
      if (m.id === 15 && !teacherRun) btns.append(h('button.btn.primary.go', { type: 'button', 'data-focus': '', html: `${ICON.trophy}<span>GRANDE FINAL</span>`, onclick: afterMedals(() => { leave(); app.go('ending'); }) }));
      else if (nextN) btns.append(h('button.btn.primary.go', { type: 'button', 'data-focus': '', html: `${ICON.go}<span>PRÓXIMA MISSÃO</span>`, onclick: afterMedals(() => again(nextN)) }));
      btns.append(
        h('button.btn', { type: 'button', html: `${ICON.map}<span>MAPA</span>`, onclick: afterMedals(() => { leave(); app.go('map'); }) }),
        h('button.btn.ghost', { type: 'button', html: `${ICON.restart}<span>JOGAR DE NOVO</span>`, onclick: afterMedals(() => again(m.id)) }));
      const box = overlay(h('div.result', null,
        h('div.result-head', null, h('div.result-robot', { html: robotLib.svg('excited') }),
          h('div', null, h('p.kicker', null, `Missão ${m.id} concluída!`), h('h2', null, 'Missão concluída!'), stars)),
        h('p.result-win', null, m.win),
        h('p.result-learn', null, h('b', null, 'Você aprendeu: '), m.learn),
        teacherRun ? h('p.teacher-note', null, h('span', { html: ICON.teacher }), 'Modo professor: este resultado não foi salvo.') : null,
        list, btns), { label: 'Resultado da missão', cls: 'result-ov' });
    }

    function celebrateMedal(id, then) {
      const md = L.MEDALS.find((x) => x.id === id);
      audio.play('medal'); confetti(90);
      const lvUnlocked = { aprendiz: 2, organizador: 3 }[id];
      const box = overlay(h('div.medal-show', null,
        h('p.kicker', null, 'Nova conquista!'),
        h('div.medal-big', { html: medalSVG(id) }),
        h('h2', null, md.name),
        h('p', null, md.desc),
        lvUnlocked ? h('p.unlock-note', null, h('span', { html: ICON.flag }), ` Nível ${lvUnlocked} liberado: ${D.level(lvUnlocked).name}!`) : null,
        h('div.overlay-actions', null, h('button.btn.primary.go', { type: 'button', 'data-focus': '', html: `${ICON.go}<span>CONTINUAR</span>`, onclick: () => { box.close(); then(); } }))
      ), { label: 'Nova conquista', cls: 'medal-ov' });
    }

    /* ---------- Pausa e reinício ---------- */
    function pause() {
      token.paused = true; stopSpeak();
      const soundBtn = h('button.btn.ghost', { type: 'button' });
      const paintSound = () => { soundBtn.innerHTML = `${audio.isOn() ? ICON.soundOn : ICON.soundOff}<span>SOM: ${audio.isOn() ? 'LIGADO' : 'DESLIGADO'}</span>`; };
      paintSound();
      soundBtn.addEventListener('click', () => { audio.setOn(!audio.isOn()); store.update((p) => { p.sound = audio.isOn(); }); paintSound(); });
      const box = overlay(h('div.pause', null,
        h('div.pause-robot', { html: robotLib.svg('neutral') }),
        h('h2', null, 'Jogo pausado'),
        h('p', null, `Missão ${m.id}: ${m.title}`),
        h('div.overlay-actions.col', null,
          h('button.btn.primary', { type: 'button', 'data-focus': '', html: `${ICON.play}<span>CONTINUAR</span>`, onclick: () => { box.close(); token.paused = false; } }),
          h('button.btn', { type: 'button', html: `${ICON.restart}<span>REINICIAR MISSÃO</span>`, onclick: () => { box.close(); again(m.id); } }),
          h('button.btn', { type: 'button', html: `${ICON.map}<span>VOLTAR AO MAPA</span>`, onclick: () => { box.close(); leave(); app.go('map'); } }),
          soundBtn)
      ), { label: 'Pausa', cls: 'pause-ov' });
    }
    function confirmRestart() {
      token.paused = true;
      const box = overlay(h('div.confirm', null,
        h('h2', null, 'Reiniciar a missão?'),
        h('p', null, 'Os cartões voltam a ficar embaralhados e você começa de novo.'),
        h('div.overlay-actions', null,
          h('button.btn.primary', { type: 'button', 'data-focus': '', html: `${ICON.restart}<span>SIM, REINICIAR</span>`, onclick: () => { box.close(); again(m.id); } }),
          h('button.btn.ghost', { type: 'button', html: `${ICON.close}<span>NÃO</span>`, onclick: () => { box.close(); token.paused = false; } }))
      ), { label: 'Reiniciar', cls: 'confirm-ov' });
    }
    function leave() { token.dead = true; stopSpeak(); if (live && live.token === token) live = null; }

    /* ---------- Introdução da missão ---------- */
    function intro() {
      setAction(null); hintBtn.hidden = true;
      say(m.story, 'thinking');
      const types = Array.from(new Set(m.stages.map((s) => TYPE_NAME[s.type])));
      const box = overlay(h('div.intro', null,
        h('div.intro-art', { html: art.svg(m.icon) }),
        h('div.intro-body', null,
          h('span.level-chip', { style: { background: lv.color } }, `Nível ${lv.n} · ${lv.short}`),
          h('p.kicker', null, `Missão ${m.id} de 15`),
          h('h2', null, m.title),
          h('p.intro-story', null, m.story),
          h('p.intro-goal', null, h('span', { html: ICON.flag }), h('span', null, h('b', null, 'Objetivo: '), m.goal)),
          m.safety ? h('p.intro-safety', null, m.safety) : null,
          h('p.intro-types', null, types.join(' · ')),
          h('div.overlay-actions', null,
            h('button.btn.primary.go', { type: 'button', 'data-focus': '', html: `${ICON.play}<span>COMEÇAR</span>`, onclick: () => { audio.unlock(); audio.play('tap'); stopSpeak(); box.close(); runStage(0); } }),
            canSpeak() ? h('button.btn.ghost', { type: 'button', html: `${ICON.speak}<span>OUVIR</span>`, onclick: () => speak(`${m.title}. ${m.story} Objetivo: ${m.goal}`) }) : null,
            h('button.btn.ghost', { type: 'button', html: `${ICON.map}<span>MAPA</span>`, onclick: () => { box.close(); leave(); app.go('map'); } })))
      ), { label: `Missão ${m.id}: ${m.title}`, cls: 'intro-ov' });
    }

    live = { token, m };
    intro();
  }

  root.OQVP = root.OQVP || {};
  root.OQVP.mission = { start, stopAll: () => { if (live) { live.token.dead = true; live = null; } } };
})(window);
