/* O QUE VEM PRIMEIRO? — Telas: início, mapa, como jogar, conquistas, professor e encerramento. */
(function (root) {
  'use strict';
  const { h, ICON, overlay, medalSVG, confetti } = root.OQVP.ui;
  const L = root.OQVP.logic;
  const D = root.OQVP.data;
  const audio = root.OQVP.audio;
  const store = root.OQVP.store;
  const robotLib = root.OQVP.robot;
  const art = root.OQVP.art;
  const TEACHER_PIN = '3030';

  const soundToggle = () => {
    const b = h('button.icon-btn.sound-toggle', { type: 'button' });
    const paint = () => { b.innerHTML = audio.isOn() ? ICON.soundOn : ICON.soundOff; b.setAttribute('aria-label', audio.isOn() ? 'Desligar o som' : 'Ligar o som'); b.title = b.getAttribute('aria-label'); };
    b.addEventListener('click', () => { audio.unlock(); audio.setOn(!audio.isOn()); store.update((p) => { p.sound = audio.isOn(); }); paint(); audio.play('tap'); });
    paint();
    return b;
  };

  /* ---------------- TELA INICIAL ---------------- */
  function home(app) {
    const p = store.load();
    const t = L.totals(p);
    const pipoBox = h('div.home-robot');
    const pipo = robotLib.mount(pipoBox, 'happy');
    pipoBox.addEventListener('click', () => { pipo.set(['excited', 'happy', 'surprised', 'thinking'][Math.floor(Math.random() * 4)], 'jump'); audio.play('pick'); });
    const cards = ['m1_pasta', 'm1_escovar', 'm1_enxaguar'];
    const s = h('section.screen.home-screen', null,
      h('div.home-deco', { 'aria-hidden': 'true' },
        h('div.deco-card.d1', { html: art.svg(cards[1]) }, h('span', null, '2')),
        h('div.deco-card.d2', { html: art.svg(cards[0]) }, h('span', null, '1')),
        h('div.deco-card.d3', { html: art.svg(cards[2]) }, h('span', null, '3'))),
      h('div.home-top', null,
        h('button.icon-btn.teacher-home', { type: 'button', 'aria-label': 'Área do professor', title: 'Área do professor', html: ICON.teacher, onclick: () => { audio.unlock(); teacherGate(app); } }),
        soundToggle()),
      h('div.home-main', null,
        h('div.logo', null,
          h('span.logo-q', null, 'O que vem'),
          h('span.logo-big', null, 'PRIMEIRO?'),
          h('span.logo-sub', null, 'Missão Passo a Passo')),
        h('div.home-hero', null, pipoBox,
          h('div.home-bubble', null, t.done ? `Que bom te ver de novo! Já fizemos ${t.done} de 15 missões.` : 'Oi! Eu sou o Pipo. Minhas instruções ficaram todas embaralhadas. Você me ajuda?')),
        h('nav.home-menu', { 'aria-label': 'Menu principal' },
          h('button.btn.primary.big.go#btn-jogar', { type: 'button', html: `${ICON.play}<span>JOGAR</span>`, onclick: () => { audio.unlock(); audio.play('tap'); app.go('map'); } }),
          h('button.btn.big#btn-como', { type: 'button', html: `${ICON.help}<span>COMO JOGAR</span>`, onclick: () => { audio.unlock(); audio.play('tap'); app.go('howto'); } }),
          h('button.btn.big#btn-conquistas', { type: 'button', html: `${ICON.trophy}<span>MINHAS CONQUISTAS</span>`, onclick: () => { audio.unlock(); audio.play('tap'); app.go('achievements'); } }))),
      h('p.home-foot', null, '3º ano · Educação Digital · Habilidade EF03TPA03'));
    app.show(s);
  }

  /* ---------------- MAPA ---------------- */
  function map(app) {
    const p = store.load();
    const teacher = !!p.teacher;
    const t = L.totals(p);
    const medals = L.earnedMedals(p);
    const next = [...Array(15).keys()].map((i) => i + 1).find((n) => !L.isDone(p, n) && L.isUnlocked(p, n, false));
    const levels = h('div.levels');
    D.LEVELS.forEach((lv) => {
      const unlocked = L.isUnlocked(p, lv.missions[0], teacher);
      const doneCount = lv.missions.filter((n) => L.isDone(p, n)).length;
      const medalId = ['aprendiz', 'organizador', 'mestre'][lv.n - 1];
      const path = h('ol.mission-path');
      lv.missions.forEach((n, i) => {
        const m = D.mission(n);
        const ok = L.isUnlocked(p, n, teacher);
        const done = L.isDone(p, n);
        const st = done ? p.missions[n].stars : 0;
        const starRow = h('span.node-stars', { 'aria-hidden': 'true' });
        for (let k = 0; k < 3; k++) starRow.appendChild(h('span' + (k < st ? '.on' : ''), { html: ICON.star }));
        const btn = h('button.node' + (done ? '.done' : '') + (!ok ? '.locked' : '') + (n === next ? '.current' : ''), {
          type: 'button', 'data-mission': n,
          'aria-label': `Missão ${n}: ${m.title}. ${!ok ? 'Bloqueada: conclua a missão anterior.' : done ? `Concluída com ${st} estrelas.` : 'Liberada.'}`
        },
        h('span.node-circle', null,
          ok ? h('span.node-art', { html: art.svg(m.icon) }) : h('span.node-lock', { html: ICON.lock }),
          h('span.node-num', null, String(n))),
        h('span.node-title', null, m.title),
        done ? starRow : h('span.node-state', null, ok ? (n === next ? 'Jogar agora!' : 'Liberada') : 'Bloqueada'));
        btn.addEventListener('click', () => {
          audio.unlock();
          if (!ok) {
            audio.play('oops');
            btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
            toast(app, `Conclua a Missão ${n - 1} para liberar esta missão!`);
            return;
          }
          audio.play('tap');
          app.go('mission', n);
        });
        path.appendChild(h('li', { style: { '--i': i } }, btn));
      });
      levels.appendChild(h('section.level-panel' + (unlocked ? '' : '.locked'), {
        style: { '--lv': lv.color, '--lv-dark': lv.dark, '--lv-soft': lv.soft }, 'aria-label': `Nível ${lv.n}: ${lv.name}`
      },
      h('header.level-head', null,
        h('div', null,
          h('span.level-tag', null, `Nível ${lv.n} · ${lv.short}`),
          h('h2', null, lv.name),
          h('p', null, unlocked ? lv.desc : 'Bloqueado: conclua o nível anterior para liberar.')),
        h('div.level-medal' + (medals.includes(medalId) ? '.got' : ''), { html: medalSVG(medalId, !medals.includes(medalId)), title: L.MEDALS.find((x) => x.id === medalId).name })),
      h('div.level-progress', { 'aria-label': `${doneCount} de 5 missões concluídas` },
        h('div.bar', null, h('i', { style: { width: (doneCount / 5) * 100 + '%' } })), h('span', null, `${doneCount}/5`)),
      path));
    });
    const s = h('section.screen.map-screen', null,
      h('header.topbar.map-top', null,
        h('button.icon-btn', { type: 'button', 'aria-label': 'Tela inicial', title: 'Tela inicial', html: ICON.home, onclick: () => { audio.play('tap'); app.go('home'); } }),
        h('div.title-block', null, h('h1', null, 'Mapa das Missões'), h('span.sub', null, `${t.done} de 15 missões concluídas`)),
        teacher ? h('button.teacher-badge', { type: 'button', title: 'Abrir a Área do professor', onclick: () => teacherGate(app) }, h('span', { html: ICON.teacher }), 'Mapa liberado (professor)') : null,
        h('div.score-pill', { title: 'Pontos acumulados' }, h('span', { html: ICON.star }), h('b', null, String(t.points))),
        h('button.icon-btn', { type: 'button', 'aria-label': 'Minhas conquistas', title: 'Minhas conquistas', html: ICON.trophy, onclick: () => { audio.play('tap'); app.go('achievements'); } }),
        soundToggle()),
      h('main.map-body', null, levels));
    app.show(s);
    const cur = s.querySelector('.node.current');
    if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }), 120);
  }

  function toast(app, text) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = h('div.toast', { role: 'status' }, text);
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
  }

  /* ---------------- COMO JOGAR ---------------- */
  function howto(app) {
    store.update((p) => { p.seenHowTo = true; });
    const tip = (icon, title, text, visual) => h('article.tip', null, h('div.tip-visual', { html: visual || '' }), h('div', null, h('h3', null, h('span', { html: icon }), title), h('p', null, text)));
    const mini = (id, n) => `<div class="mini-demo-card"><span>${n}</span>${art.svg(id)}</div>`;
    const s = h('section.screen.howto-screen', null,
      h('header.topbar', null,
        h('button.icon-btn', { type: 'button', 'aria-label': 'Voltar', title: 'Voltar', html: ICON.home, onclick: () => { audio.play('tap'); app.go('home'); } }),
        h('div.title-block', null, h('h1', null, 'Como jogar'))),
      h('main.howto-body', null,
        h('div.howto-intro', null, h('div.howto-robot', { html: robotLib.svg('happy') }),
          h('p', null, 'Em cada missão, as instruções do Pipo estão embaralhadas. Você vai descobrir ', h('b', null, 'o que vem primeiro'), ', o que vem depois e como terminar cada tarefa!')),
        h('div.tips', null,
          tip(ICON.hand, 'Arraste os cartões', 'Segure um cartão e arraste até o lugar certo. Funciona com o dedo no tablet ou com o mouse.',
            `<div class="mini-demo">${mini('m1_escovar', 2)}<span class="demo-arrow">${ICON.swap}</span>${mini('m1_pasta', 1)}</div>`),
          tip(ICON.swap, 'Ou toque em dois cartões', 'Toque em um cartão e depois em outro: eles trocam de lugar. Também dá para usar as setas embaixo de cada cartão.',
            `<div class="mini-demo arrows-demo"><span>${ICON.left}</span><span>${ICON.right}</span></div>`),
          tip(ICON.play, 'Teste com o Pipo', 'Toque em TESTAR. O Pipo executa a sua sequência. Se algo estiver fora de ordem, ele mostra o que aconteceu!',
            `<div class="mini-demo">${robotLib.svg('surprised')}</div>`),
          tip(ICON.bulb, 'Use dicas', 'Ficou em dúvida? Toque em DICA. O Pipo faz uma pergunta para ajudar você a pensar. Você pode tentar quantas vezes quiser!',
            `<div class="mini-demo bulb">${ICON.bulb}</div>`),
          tip(ICON.star, 'Pontos e estrelas', '100 pontos por missão. Ganhe bônus por não usar dicas, por pensar antes de agir e por descobrir erros. Até 3 estrelas por missão!',
            `<div class="mini-demo stars">${ICON.star}${ICON.star}${ICON.star}</div>`),
          tip(ICON.trophy, 'Medalhas', 'Complete os níveis para ganhar a Estrela de Aprendiz, a Medalha de Organizador, o Troféu de Investigador e a Medalha de Mestre da Lógica!',
            `<div class="mini-demo">${medalSVG('mestre')}</div>`)),
        h('p.keyboard-tip', null, h('b', null, 'No computador: '), 'use Tab para escolher um cartão, Enter para selecionar e as setas do teclado para mover.'),
        h('div.howto-actions', null,
          h('button.btn.primary.big.go', { type: 'button', html: `${ICON.play}<span>VAMOS JOGAR!</span>`, onclick: () => { audio.unlock(); audio.play('tap'); app.go('map'); } }),
          h('button.btn.ghost.teacher-btn', { type: 'button', html: `${ICON.teacher}<span>Área do professor</span>`, onclick: () => teacherGate(app) }))));
    app.show(s);
  }

  /* ---------------- CONQUISTAS / PROGRESSO ---------------- */
  function achievements(app) {
    const p = store.load();
    const t = L.totals(p);
    const got = L.earnedMedals(p);
    const levelsOpen = D.LEVELS.filter((lv) => L.isUnlocked(p, lv.missions[0], p.teacher)).length;
    const stat = (n, label, extra) => h('div.stat', null, h('b', null, n), h('span', null, label), extra || null);
    const medalsEl = h('div.medals');
    L.MEDALS.forEach((md) => medalsEl.appendChild(h('article.medal-card' + (got.includes(md.id) ? '.got' : ''), null,
      h('div.medal-img', { html: medalSVG(md.id, !got.includes(md.id)) }),
      h('h3', null, md.name),
      h('p', null, got.includes(md.id) ? md.desc : 'Ainda não conquistada. ' + md.desc.replace('Concluiu', 'Conclua').replace('Descobriu', 'Descubra').replace('Venceu', 'Vença')))));
    const list = h('div.ach-levels');
    D.LEVELS.forEach((lv) => {
      const ul = h('ul.ach-missions');
      lv.missions.forEach((n) => {
        const m = D.mission(n); const r = p.missions[n];
        const stars = h('span.mini-stars');
        for (let k = 0; k < 3; k++) stars.appendChild(h('span' + (r && k < r.stars ? '.on' : ''), { html: ICON.star }));
        ul.appendChild(h('li' + (r && r.done ? '.done' : ''), null, h('span.anum', null, String(n)), h('span.atitle', null, m.title), r && r.done ? stars : h('span.apend', null, L.isUnlocked(p, n, p.teacher) ? 'liberada' : 'bloqueada'), h('b', null, r && r.done ? r.best + ' pts' : '')));
      });
      list.appendChild(h('section.ach-level', { style: { '--lv': lv.color, '--lv-soft': lv.soft } }, h('h3', null, `Nível ${lv.n}: ${lv.name}`), ul));
    });
    const s = h('section.screen.ach-screen', null,
      h('header.topbar', null,
        h('button.icon-btn', { type: 'button', 'aria-label': 'Tela inicial', title: 'Tela inicial', html: ICON.home, onclick: () => { audio.play('tap'); app.go('home'); } }),
        h('div.title-block', null, h('h1', null, 'Minhas conquistas')),
        h('button.btn.small', { type: 'button', html: `${ICON.map}<span>MAPA</span>`, onclick: () => { audio.play('tap'); app.go('map'); } })),
      h('main.ach-body', null,
        h('div.stats', null,
          stat(`${t.done}/15`, 'missões concluídas'),
          stat(String(t.points), 'pontos'),
          stat(`${t.stars}/45`, 'estrelas'),
          stat(`${levelsOpen}/3`, 'níveis liberados')),
        h('h2.sec-title', null, 'Medalhas'), medalsEl,
        h('h2.sec-title', null, 'Missões'), list,
        h('p.privacy', null, 'Seu progresso fica salvo somente neste aparelho. Não pedimos nome nem nenhum dado pessoal.')));
    app.show(s);
  }

  /* ---------------- ÁREA DO PROFESSOR ---------------- */
  function teacherGate(app) {
    let typed = '';
    const dotsEl = h('div.pin-dots', { 'aria-live': 'polite' });
    const msg = h('p.pin-msg');
    const paint = () => { dotsEl.innerHTML = ''; for (let i = 0; i < 4; i++) dotsEl.appendChild(h('span' + (i < typed.length ? '.on' : ''))); };
    const pad = h('div.pin-pad');
    const press = (d) => {
      if (d === 'C') typed = ''; else if (typed.length < 4) typed += d;
      paint();
      if (typed.length === 4) {
        if (typed === TEACHER_PIN) { box.close(); teacherPanel(app); } else { msg.textContent = 'Código incorreto. Tente de novo.'; typed = ''; setTimeout(paint, 300); }
      }
    };
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'].forEach((d) => pad.appendChild(h('button.pin-key', { type: 'button', onclick: () => press(d), 'aria-label': d === 'C' ? 'Apagar' : d }, d === 'C' ? 'Apagar' : d)));
    paint();
    const box = overlay(h('div.teacher-gate', null,
      h('h2', null, h('span', { html: ICON.teacher }), ' Área do professor'),
      h('p', null, 'Digite o código do professor (está no arquivo LEIA-ME do jogo).'),
      dotsEl, msg, pad,
      h('div.overlay-actions', null, h('button.btn.ghost', { type: 'button', html: `${ICON.close}<span>FECHAR</span>`, onclick: () => box.close() }))
    ), { label: 'Código do professor', cls: 'teacher-ov' });
    box.addEventListener('keydown', (e) => { if (/^\d$/.test(e.key)) press(e.key); if (e.key === 'Backspace') press('C'); if (e.key === 'Escape') box.close(); });
  }

  function teacherPanel(app) {
    const TYPE = { order: 'organizar', next: 'o que vem depois', missing: 'etapa que falta', fix: 'descobrir o erro', odd: 'ação desnecessária', choose: 'escolher o plano' };
    const p = store.load();
    const t = L.totals(p);

    // 1) Novo aluno: apaga tudo e volta para a tela inicial.
    const reset = h('button.btn.danger.big-reset', { type: 'button', 'data-act': 'reset', html: `${ICON.trash}<span>NOVO ALUNO: APAGAR PROGRESSO</span>` });
    reset.addEventListener('click', () => confirmReset(app, () => box.close()));

    // 2) Abrir qualquer missão (sem precisar desbloquear e sem salvar o resultado).
    const grid = h('div.teacher-levels');
    D.LEVELS.forEach((lv) => {
      const list = h('div.teacher-grid');
      lv.missions.forEach((n) => {
        const m = D.mission(n);
        const done = L.isDone(p, n);
        list.appendChild(h('button.tmission' + (done ? '.done' : ''), {
          type: 'button', 'data-preview': n,
          title: Array.from(new Set(m.stages.map((x) => TYPE[x.type]))).join(', '),
          'aria-label': `Abrir a missão ${n}: ${m.title}`,
          onclick: () => { box.close(); app.go('mission', n, { preview: true }); }
        }, h('span.tm-num', null, String(n)), h('span.tm-title', null, m.title), done ? h('span.tm-done', { html: ICON.check, 'aria-label': 'concluída' }) : null));
      });
      grid.appendChild(h('section.teacher-level', { style: { '--lv': lv.color, '--lv-soft': lv.soft } },
        h('h4', null, `Nível ${lv.n} · ${lv.name}`), list));
    });

    // 3) Liberar todas as missões no mapa.
    const toggle = h('button.btn', { type: 'button', 'data-act': 'unlock' });
    const paint = () => {
      const on = store.load().teacher;
      toggle.innerHTML = `${on ? ICON.check : ICON.lock}<span>${on ? 'Mapa liberado: toque para bloquear de novo' : 'Liberar todas as missões no mapa'}</span>`;
      toggle.classList.toggle('primary', on);
    };
    toggle.addEventListener('click', () => { store.update((q) => { q.teacher = !q.teacher; }); paint(); });
    paint();

    const box = overlay(h('div.teacher-panel', null,
      h('h2', null, h('span', { html: ICON.teacher }), ' Área do professor'),
      h('div.teacher-status', null,
        h('span', null, h('b', null, `${t.done}/15`), ' missões'),
        h('span', null, h('b', null, String(t.points)), ' pontos'),
        h('span', null, h('b', null, `${t.stars}/45`), ' estrelas')),

      h('section.teacher-box', null,
        h('h3', null, '1. Novo aluno'),
        h('p.small-note', null, 'Apaga missões, pontos, estrelas e medalhas deste aparelho para outro aluno começar do zero. A Missão 1 volta a ser a única liberada.'),
        reset),

      h('section.teacher-box', null,
        h('h3', null, '2. Abrir qualquer missão'),
        h('p.small-note', null, 'Toque em uma missão para jogá-la agora, mesmo bloqueada. No modo professor o resultado não é salvo, então o progresso do aluno não muda.'),
        grid),

      h('section.teacher-box', null,
        h('h3', null, '3. Mapa liberado'),
        h('p.small-note', null, 'Deixa todas as missões abertas no mapa (também sem salvar resultados). Bloqueie de novo antes de entregar o aparelho a um aluno.'),
        toggle),

      h('p.small-note', null, h('b', null, 'Habilidade EF03TPA03: '), 'Desenvolver a capacidade lógica por meio da identificação e estruturação passo a passo das ações para a resolução de tarefas propostas.'),
      h('div.overlay-actions', null,
        h('button.btn.primary', { type: 'button', html: `${ICON.map}<span>IR PARA O MAPA</span>`, onclick: () => { box.close(); app.go('map'); } }),
        h('button.btn.ghost', { type: 'button', html: `${ICON.close}<span>FECHAR</span>`, onclick: () => box.close() }))
    ), { label: 'Área do professor', cls: 'teacher-ov wide' });
  }

  function confirmReset(app, closePanel) {
    const t = L.totals(store.load());
    const box = overlay(h('div.confirm.reset-confirm', null,
      h('div.pause-robot', { html: robotLib.svg('surprised') }),
      h('h2', null, 'Apagar todo o progresso?'),
      h('p', null, `Serão apagados: ${t.done} missões concluídas, ${t.points} pontos, ${t.stars} estrelas e as medalhas. Isso não pode ser desfeito.`),
      h('div.overlay-actions', null,
        h('button.btn.danger', { type: 'button', 'data-act': 'confirm-reset', html: `${ICON.trash}<span>SIM, APAGAR TUDO</span>`, onclick: () => {
          store.reset();
          box.close(); if (closePanel) closePanel();
          app.go('home');
          toast(app, 'Progresso apagado! Pronto para um novo aluno.');
        } }),
        h('button.btn.ghost', { type: 'button', 'data-focus': '', html: `${ICON.close}<span>CANCELAR</span>`, onclick: () => box.close() }))
    ), { label: 'Confirmar apagar progresso', cls: 'confirm-ov' });
  }

  /* ---------------- ENCERRAMENTO (depois da Missão 15) ---------------- */
  function ending(app) {
    const p = store.load();
    const t = L.totals(p);
    const pipoBox = h('div.end-robot');
    robotLib.mount(pipoBox, 'excited').set('excited', 'dance');
    const s = h('section.screen.end-screen', null,
      h('div.end-rays', { 'aria-hidden': 'true' }),
      h('main.end-body', null,
        h('p.kicker', null, 'Parabéns! Você completou as 15 missões!'),
        h('div.end-medal', { html: medalSVG('mestre') }),
        h('h1', null, 'Mestre da Lógica'),
        h('p.end-text', null, 'Você ajudou o Pipo a organizar tarefas, descobrir etapas que faltavam, corrigir erros e planejar uma expedição inteira. Isso é pensar passo a passo!'),
        h('div.end-stats', null,
          h('div', null, h('b', null, String(t.points)), h('span', null, 'pontos')),
          h('div', null, h('b', null, `${t.stars}/45`), h('span', null, 'estrelas')),
          h('div', null, h('b', null, `${L.earnedMedals(p).length}/4`), h('span', null, 'medalhas'))),
        pipoBox,
        h('div.overlay-actions', null,
          h('button.btn.primary.go', { type: 'button', html: `${ICON.trophy}<span>MINHAS CONQUISTAS</span>`, onclick: () => app.go('achievements') }),
          h('button.btn', { type: 'button', html: `${ICON.map}<span>MAPA</span>`, onclick: () => app.go('map') }),
          h('button.btn.ghost', { type: 'button', html: `${ICON.home}<span>INÍCIO</span>`, onclick: () => app.go('home') }))));
    app.show(s);
    audio.play('medal');
    confetti(140);
    setTimeout(() => confetti(80), 1600);
  }

  root.OQVP = root.OQVP || {};
  root.OQVP.screens = { home, map, howto, achievements, ending, teacherGate, teacherPanel, toast };
})(window);
