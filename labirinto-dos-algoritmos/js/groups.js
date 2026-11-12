/* =========================================================
   LABIRINTO DOS ALGORITMOS — Grupos e turmas
   Tela inicial, escolha da turma e do grupo, criação do grupo
   (integrantes, personagem e senha de figuras) e entrada.
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, esc = UI.esc, Store = LA.Store, Cloud = LA.Cloud, S = LA.Screens;

  function turmas() { return Cloud.turmas; }
  function coinChip(p) { return '<span class="coin-chip">🪙 ' + LA.coins(p) + '</span>'; }
  S.coinChip = coinChip;

  /* ---------- Início ---------- */
  S.home = function () {
    var p = Store.player();
    var box = $('#home-group');
    if (p) {
      box.innerHTML = '<button class="hg-avatar" type="button" id="home-avatar" aria-label="Avatar e loja">' + LA.ART.avatarFull(p, 118, 'idle') + '</button>' +
        '<div class="hg-info"><div class="hg-name">' + esc(Store.name(p)) + '</div>' +
        '<div class="hg-meta">' + (p.turma ? '<span class="turma-tag">' + esc(LA.turmaLabel(p.turma)) + '</span>' : '') + coinChip(p) + '</div>' +
        '<div class="hg-actions"><button class="btn btn-small btn-purple" type="button" id="home-shop">👕 Avatar e loja</button>' +
        '<button class="btn btn-small" type="button" id="home-player">🔁 Trocar grupo</button></div></div>';
      $('#home-avatar').onclick = $('#home-shop').onclick = function () { LA.sfx('click'); UI.show('avatar'); };
    } else {
      box.innerHTML = '<button class="btn btn-blue" type="button" id="home-player">👥 Escolher o grupo</button>';
    }
    $('#home-player').onclick = function () { LA.sfx('click'); UI.show('players', 'home'); };
    var next = p && Store.nextLevel(p);
    var cont = $('#btn-continue');
    cont.disabled = !p || !p.last && !(p && Object.keys(p.levels).length);
    cont.innerHTML = '⏩ CONTINUAR' + (p && next ? ' <small style="font-size:16px">(fase ' + next.id + ')</small>' : '');
    $('#btn-lab').classList.toggle('locked', !Store.labUnlocked());
    $('#btn-lab').innerHTML = '<span>' + (Store.labUnlocked() ? '🧩' : '🔒') + '</span>Laboratório';
    S.syncNote();
    var sc = LA.app.scene;
    if (sc && sc.ok) { sc.attach($('#home-3d')); sc.buildHome(); }
  };
  /* Linha que diz onde o progresso está guardado. */
  S.syncNote = function () {
    var el = $('#home-sync'); if (!el) return;
    var p = Store.player();
    if (!Cloud.enabled()) { el.innerHTML = '🔒 O progresso fica salvo neste aparelho.'; return; }
    var st = Cloud.status(p);
    el.innerHTML = p ? st.icon + ' ' + esc(st.text) : '☁️ Os grupos ficam salvos online: continuem em qualquer aparelho.';
    el.className = 'privacy-note sync-' + (st.cls || '');
  };
  document.addEventListener('la-cloud', function () {
    S.syncNote();
    if (UI.current === 'settings') S.settingsSync && S.settingsSync();
  });

  /* ---------- Escolha da turma e do grupo ---------- */
  S.players = function (afterPick) {
    S._afterPick = afterPick || S._afterPick || 'map';
    var p = Store.player();
    var t = S._turma || (p && p.turma) || Store.lastTurma || '';
    if (turmas().indexOf(t) < 0) t = '';
    S._turma = t;
    var pick = $('#turma-pick');
    pick.innerHTML = '<span class="tp-label">Turma:</span>' + turmas().map(function (x) {
      return '<button type="button" class="turma-btn' + (x === t ? ' on' : '') + '" data-turma="' + esc(x) + '" role="tab" aria-selected="' + (x === t) + '">' + esc(LA.turmaLabel(x)) + '</button>';
    }).join('');
    UI.$$('.turma-btn', pick).forEach(function (b) {
      b.onclick = function () { LA.sfx('click'); S._turma = b.dataset.turma; Store.lastTurma = S._turma; S.players(); };
    });
    renderGroups(t, false);
    if (t && Cloud.enabled()) {
      Cloud.turma(t, true).then(function () { if (UI.current === 'players' && S._turma === t) renderGroups(t, true); }, function (e) {
        if (UI.current === 'players' && S._turma === t) renderGroups(t, true, e);
      });
    }
  };

  function renderGroups(t, loaded, err) {
    var grid = $('#players-grid'), lead = $('#groups-lead'), legacy = $('#legacy-players');
    var cur = Store.player();
    grid.innerHTML = ''; legacy.innerHTML = '';
    if (!t) {
      lead.innerHTML = '👆 Toquem na <b>turma</b> de vocês.';
      grid.innerHTML = '';
      renderLegacy(legacy, cur);
      return;
    }
    if (!Cloud.enabled()) lead.innerHTML = 'Toquem no grupo de vocês ou criem um <b>grupo novo</b>. O progresso fica salvo <b>neste aparelho</b>.';
    else if (err) lead.innerHTML = '⚠️ ' + esc(err.offline ? 'Sem internet agora: aparecem só os grupos deste aparelho. O progresso será enviado quando a internet voltar.' : err.message);
    else if (!loaded) lead.innerHTML = '🔄 Buscando os grupos da turma ' + esc(LA.turmaLabel(t)) + '…';
    else lead.innerHTML = '☁️ Grupos da turma <b>' + esc(LA.turmaLabel(t)) + '</b>. Toquem no grupo de vocês ou criem um <b>grupo novo</b>.';

    var locals = Store.localPlayers().filter(function (p) { return p.turma === t; });
    var seen = {};
    locals.forEach(function (p) {
      if (p.cloud) seen[p.cloud.code] = 1;
      grid.appendChild(groupCard(p, null, cur));
    });
    (Cloud.cached(t) || []).forEach(function (g) {
      if (seen[g.codigo]) return;
      grid.appendChild(groupCard(null, g, cur));
    });
    var nw = document.createElement('button');
    nw.type = 'button'; nw.className = 'player-card new';
    nw.innerHTML = '<span style="font-size:48px">➕</span>Grupo novo';
    nw.onclick = function () { LA.sfx('unlock'); S.newGroup(t); };
    grid.appendChild(nw);
    renderLegacy(legacy, cur);
  }

  function groupCard(p, g, cur) {
    var card = document.createElement('button');
    card.type = 'button';
    var isCur = p && cur && cur.id === p.id;
    card.className = 'player-card group-card' + (isCur ? ' current' : '');
    var pseudo = p || cloudPseudo(g);
    var t = Store.totals(pseudo);
    var badge = p ? (p.cloud ? '☁️' : Cloud.enabled() ? '⏳' : '📍') : '☁️';
    card.innerHTML = LA.ART.avatarFull(pseudo, 112) +
      '<span class="pname">' + esc(Store.name(pseudo)) + '</span>' +
      '<span class="pstats">⭐ ' + t.stars + ' · ' + t.done + ' de 25 fases</span>' +
      '<span class="gbadge" title="' + (p ? 'Neste aparelho' : 'Salvo online') + '">' + badge + (p && p.cloud ? ' nº ' + esc(p.cloud.code) : g ? ' nº ' + esc(g.codigo) : '') + '</span>';
    card.onclick = function () { LA.sfx('click'); S.enterGroup(p, g); };
    if (p) {
      var del = document.createElement('span');
      del.className = 'del'; del.setAttribute('role', 'button'); del.setAttribute('aria-label', 'Tirar ' + Store.name(p) + ' deste aparelho'); del.textContent = '🗑';
      del.style.display = 'flex'; del.style.alignItems = 'center'; del.style.justifyContent = 'center';
      del.onclick = function (e) {
        e.stopPropagation();
        var online = p.cloud && Cloud.enabled();
        UI.confirm('Tirar ' + esc(Store.name(p)) + ' deste aparelho?',
          online ? 'O progresso continua salvo online: o grupo pode entrar de novo com a senha de figuras.' : 'Todo o progresso desse grupo neste aparelho será apagado.',
          'Tirar', 'Cancelar', !online).then(function (ok) {
          if (!ok) return;
          if (online && Cloud.needsSync(p)) Cloud.flush();
          Store.removePlayer(p.id); S.players();
        });
      };
      card.appendChild(del);
    }
    return card;
  }
  /* Um grupo que só existe online vira um "jogador" para os desenhos e totais. */
  function cloudPseudo(g) {
    return {
      id: 'c' + g.codigo, num: Number(g.codigo) || 1, device: '', turma: g.turma, members: g.integrantes || [],
      avatar: g.avatar ? LA.avatarClean(g.avatar) : null, levels: cleanLevels(g.levels), achievements: g.achievements || {}, stats: {}, cloudCode: String(g.codigo)
    };
  }
  S.cloudPseudo = cloudPseudo;
  function cleanLevels(l) {
    var out = {};
    if (l && typeof l === 'object') for (var k in l) {
      var r = l[k];
      if (!LA.levelById(k) || !r) continue;
      out[k] = { best: Math.max(0, Math.min(100, Number(r.best) || 0)), stars: Math.max(0, Math.min(3, Number(r.stars) || 0)), completed: !!r.completed };
    }
    return out;
  }

  /* Jogadores da versão antiga (sem turma): podem virar um grupo. */
  function renderLegacy(box, cur) {
    var old = Store.localPlayers().filter(function (p) { return !p.turma; });
    if (!old.length) return;
    box.innerHTML = '<h3 class="legacy-title">Jogadores antigos deste aparelho</h3><p class="lead" style="font-size:16px">Toquem para continuar e completar o cadastro do grupo (turma e nomes).</p>';
    var grid = document.createElement('div'); grid.className = 'players-grid';
    old.forEach(function (p) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'player-card legacy' + (cur && cur.id === p.id ? ' current' : '');
      var t = Store.totals(p);
      card.innerHTML = LA.ART.avatar(p, 84) + '<span class="pname">' + esc(Store.name(p)) + '</span><span class="pstats">⭐ ' + t.stars + ' · ' + t.done + ' de 25 fases</span>';
      card.onclick = function () {
        LA.sfx('click');
        S.newGroup(S._turma, p);
      };
      grid.appendChild(card);
    });
    box.appendChild(grid);
  }

  /* ---------- Entrar num grupo (senha de figuras) ---------- */
  S.enterGroup = function (p, g) {
    var cur = Store.player();
    if (p && cur && cur.id === p.id) { S.afterPick(); return; }
    if (p && !p.secret && !p.cloud) { Store.setPlayer(p.id); S.afterPick(); return; }
    var who = p || cloudPseudo(g);
    S.askSecret('🔑 Senha do grupo', '<div class="enter-who">' + LA.ART.avatar(who, 64) + '<b>' + esc(Store.name(who)) + '</b></div><p>Toquem nas <b>3 figuras</b> da senha do grupo, na ordem.</p>', 'Entrar', function (secret) {
      var code = p && p.cloud ? p.cloud.code : g ? g.codigo : null;
      if (code && Cloud.enabled()) {
        return Cloud.login(code, secret).then(function (np) { return np; }, function (e) {
          if (e.offline && p && Store.checkSecret(p, secret)) { Store.setPlayer(p.id); return p; }
          throw e;
        });
      }
      if (p && Store.checkSecret(p, secret)) { Store.setPlayer(p.id); return Promise.resolve(p); }
      return Promise.reject(new Error('Senha de figuras errada. Confiram e tentem de novo.'));
    }).then(function (np) {
      if (!np) return;
      LA.sfx('unlock');
      UI.toast('👋', 'Olá, ' + esc(Store.name(np)) + '!', Cloud.enabled() && np.cloud ? 'Progresso carregado. Ele continua salvo online.' : 'Bom jogo!');
      S.afterPick();
    });
  };

  /* Janela com o teclado de figuras. check(secret) devolve uma promessa. */
  S.askSecret = function (title, intro, okLabel, check) {
    var picked = [];
    return UI.modal({
      title: title, cls: 'secret-modal',
      html: intro + secretPickerHtml() + '<p class="secret-msg" id="secret-msg"></p><p class="secret-hint">Esqueceram a senha? O professor consegue ver na planilha da turma.</p>',
      buttons: [{ label: 'Cancelar', value: null }, { label: '✅ ' + okLabel, value: 'ok', cls: 'btn-green', id: 'btn-secret-ok', keep: true }],
      onOpen: function (box, close) {
        var okBtn = box.querySelector('#btn-secret-ok'), msg = box.querySelector('#secret-msg');
        bindPicker(box, picked, function () { okBtn.disabled = picked.length !== 3; msg.textContent = ''; });
        okBtn.disabled = true;
        okBtn.onclick = function () {
          if (picked.length !== 3 || okBtn.dataset.busy) return;
          LA.sfx('click');
          okBtn.dataset.busy = '1'; okBtn.innerHTML = '⏳ Entrando…';
          Promise.resolve(check(picked.join(' '))).then(function (res) { close(res); }, function (e) {
            delete okBtn.dataset.busy; okBtn.innerHTML = '✅ ' + okLabel;
            LA.sfx('bump');
            msg.textContent = '😕 ' + (e && e.message || 'Não deu certo.');
            picked.length = 0; box.querySelector('.secret-slots').innerHTML = slotsHtml(picked); okBtn.disabled = true;
          });
        };
      }
    });
  };
  function slotsHtml(picked) {
    var s = '';
    for (var i = 0; i < 3; i++) s += '<span class="slot' + (picked[i] ? ' full' : '') + '">' + (picked[i] ? LA.figureIcon(picked[i]) : (i + 1)) + '</span>';
    return s;
  }
  function secretPickerHtml() {
    return '<div class="secret-slots" aria-live="polite">' + slotsHtml([]) + '</div>' +
      '<div class="figure-grid">' + LA.FIGURES.map(function (f) {
        return '<button type="button" class="figure" data-fig="' + f.id + '" aria-label="' + f.id + '">' + f.icon + '</button>';
      }).join('') + '<button type="button" class="figure erase" data-fig="" aria-label="Apagar">⌫</button></div>';
  }
  function bindPicker(box, picked, onChange) {
    UI.$$('.figure', box).forEach(function (b) {
      b.onclick = function () {
        if (!b.dataset.fig) picked.pop();
        else if (picked.length < 3) picked.push(b.dataset.fig);
        else return;
        LA.sfx('click');
        box.querySelector('.secret-slots').innerHTML = slotsHtml(picked);
        onChange();
      };
    });
  }

  /* ---------- Grupo novo (3 passos) ---------- */
  S.newGroup = function (turma, legacyPlayer) {
    var st = {
      turma: turma || '',
      members: legacyPlayer && legacyPlayer.name ? [legacyPlayer.name] : [],
      base: 'pessoa', seed: Math.floor(Math.random() * 1000), secret: []
    };
    if (legacyPlayer && legacyPlayer.avatar) st.avatar = legacyPlayer.avatar;
    stepMembers();

    function stepMembers() {
      var n = Math.max(4, st.members.length + 1);
      UI.modal({
        title: legacyPlayer ? '👥 Completar o cadastro do grupo' : '👥 Grupo novo', cls: 'group-modal',
        html: '<p class="step-n">Passo 1 de 3</p><h4>Turma</h4><div class="turma-pick in-modal">' + turmas().map(function (x) {
          return '<button type="button" class="turma-btn' + (x === st.turma ? ' on' : '') + '" data-turma="' + esc(x) + '">' + esc(LA.turmaLabel(x)) + '</button>';
        }).join('') + '</div>' +
          '<h4>Nomes dos integrantes</h4><p style="font-size:15px;margin-top:0">Só o <b>primeiro nome</b> (ou apelido) de cada um.</p><div class="member-list" id="member-list">' +
          memberInputs(n) + '</div><button type="button" class="btn btn-small" id="btn-more-member">➕ Mais um integrante</button>' +
          '<p class="secret-msg" id="members-msg"></p>',
        closable: true,
        buttons: [{ label: 'Cancelar', value: null }, { label: 'Próximo ➜', value: 'next', cls: 'btn-green', id: 'btn-group-next', keep: true }],
        onOpen: function (box, close) {
          var list = box.querySelector('#member-list');
          UI.$$('.turma-btn', box).forEach(function (b) {
            b.onclick = function () { LA.sfx('click'); st.turma = b.dataset.turma; UI.$$('.turma-btn', box).forEach(function (x) { x.classList.toggle('on', x === b); }); };
          });
          box.querySelector('#btn-more-member').onclick = function () {
            var cnt = list.querySelectorAll('input').length;
            if (cnt >= 6) return;
            list.insertAdjacentHTML('beforeend', memberInput(cnt));
            if (cnt + 1 >= 6) this.disabled = true;
            list.querySelectorAll('input')[cnt].focus();
          };
          list.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            var ins = UI.$$('input', list), i = ins.indexOf(e.target);
            if (ins[i + 1]) ins[i + 1].focus(); else box.querySelector('#btn-group-next').click();
          });
          box.querySelector('#btn-group-next').onclick = function () {
            st.members = LA.cleanMembers(UI.$$('input', list).map(function (i) { return i.value; }));
            var msg = box.querySelector('#members-msg');
            if (!st.turma) { msg.textContent = '👆 Escolham a turma.'; LA.sfx('bump'); return; }
            if (!st.members.length) { msg.textContent = '✏️ Escrevam o nome de pelo menos um integrante.'; LA.sfx('bump'); return; }
            LA.sfx('click'); close('next');
          };
        }
      }).then(function (v) { if (v === 'next') stepAvatar(); });
      function memberInputs(k) { var s = ''; for (var i = 0; i < k; i++) s += memberInput(i); return s; }
      function memberInput(i) {
        return '<input class="name-input member-input" type="text" maxlength="20" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="next" placeholder="Integrante ' + (i + 1) + '" aria-label="Integrante ' + (i + 1) + '" value="' + esc(st.members[i] || '') + '">';
      }
    }

    function cfgFor(base) {
      if (st.avatar && st.avatar.base === base) return st.avatar;
      return LA.avatarDefault(base, st.seed + base.length);
    }
    function stepAvatar() {
      UI.modal({
        title: '🎨 Escolham o personagem', cls: 'group-modal', wide: true,
        html: '<p class="step-n">Passo 2 de 3</p><p>Pessoa ou bicho? Depois vocês podem trocar a roupa e comprar acessórios na <b>loja</b> com as moedas das fases.</p>' +
          '<div class="base-grid" id="base-grid"></div>',
        buttons: [{ label: '← Voltar', value: 'back' }, { label: '🎲 Sortear visual', value: 'dice', keep: true, id: 'btn-dice' }, { label: 'Próximo ➜', value: 'next', cls: 'btn-green', id: 'btn-avatar-next' }],
        onOpen: function (box) {
          function draw() {
            box.querySelector('#base-grid').innerHTML = LA.AV_BASES.map(function (b) {
              return '<button type="button" class="base-opt' + (b.id === st.base ? ' on' : '') + '" data-base="' + b.id + '">' +
                LA.avatarSVG(cfgFor(b.id), { noBg: true }) + '<span>' + b.icon + ' ' + esc(b.name) + '</span></button>';
            }).join('');
            UI.$$('.base-opt', box).forEach(function (el) {
              el.onclick = function () { LA.sfx('click'); st.base = el.dataset.base; UI.$$('.base-opt', box).forEach(function (x) { x.classList.toggle('on', x === el); }); };
            });
          }
          draw();
          box.querySelector('#btn-dice').onclick = function () { LA.sfx('click'); st.avatar = null; st.seed = Math.floor(Math.random() * 1000); draw(); };
        }
      }).then(function (v) {
        if (v === 'back') return stepMembers();
        if (v !== 'next') return;
        st.avatar = cfgFor(st.base);
        stepSecret();
      });
    }

    function stepSecret() {
      var picked = st.secret;
      UI.modal({
        title: '🔑 Senha de figuras', cls: 'secret-modal group-modal',
        html: '<p class="step-n">Passo 3 de 3</p><p>Escolham <b>3 figuras</b>. Elas são a senha do grupo para continuar em <b>outro aparelho</b> ou em outra aula. <b>Memorizem ou anotem!</b></p>' + secretPickerHtml(),
        buttons: [{ label: '← Voltar', value: 'back' }, { label: '✅ Criar grupo', value: 'ok', cls: 'btn-green', id: 'btn-group-create' }],
        onOpen: function (box) {
          var okBtn = box.querySelector('#btn-group-create');
          box.querySelector('.secret-slots').innerHTML = slotsHtml(picked);
          bindPicker(box, picked, function () { okBtn.disabled = picked.length !== 3; });
          okBtn.disabled = picked.length !== 3;
        }
      }).then(function (v) {
        if (v === 'back') return stepAvatar();
        if (v !== 'ok') return;
        create();
      });
    }

    function create() {
      var opts = { turma: st.turma, members: st.members, avatar: st.avatar, secret: st.secret.join(' ') };
      var p = legacyPlayer ? Store.completeGroup(legacyPlayer.id, opts) : Store.newGroup(opts);
      Store.setPlayer(p.id);
      Store.lastTurma = p.turma; S._turma = p.turma;
      var finish = function (online, errMsg) {
        LA.sfx('win'); UI.confetti(50);
        return UI.modal({
          cls: 'victory', title: '🎉 Grupo criado!',
          html: '<div class="created-av">' + LA.ART.avatarFull(p, 150, 'idle') + '</div>' +
            '<p style="font-size:22px"><b>' + esc(Store.name(p)) + '</b> · turma ' + esc(LA.turmaLabel(p.turma)) + (p.cloud ? ' · grupo nº ' + esc(p.cloud.code) : '') + '</p>' +
            '<div class="secret-show">Senha: ' + p.secret.split(' ').map(LA.figureIcon).join(' ') + '</div>' +
            '<p>' + (online ? '☁️ O progresso fica salvo online. Em outra aula, escolham a turma, toquem no grupo e usem a senha.' :
              Cloud.enabled() ? '⏳ ' + esc(errMsg || 'Sem internet agora.') + ' O grupo será salvo online assim que a internet voltar.' :
                '📍 O progresso fica salvo neste aparelho.') + '</p>',
          buttons: [{ label: '▶ Começar!', value: true, cls: 'btn-green', id: 'btn-group-start' }]
        }).then(function () {
          UI.toast('👋', 'Olá, ' + esc(Store.name(p)) + '!', 'Bom jogo!');
          S.afterPick();
        });
      };
      if (!Cloud.enabled()) return finish(false);
      var waiting = UI.modal({ title: '☁️ Criando o grupo…', html: '<p>Só um instante.</p>', closable: false });
      Cloud.register(p).then(function () { UI.closeAllModals(); return waiting.then(function () { return finish(true); }); }, function (e) {
        UI.closeAllModals();
        return waiting.then(function () { return finish(false, e.offline ? 'Sem internet agora.' : e.message); });
      });
    }
  };

  /* ---------- Editar integrantes (Configurações) ---------- */
  S.editMembers = function (p) {
    var n = Math.max(p.members.length + 1, 3);
    var html = '<p>Corrijam os nomes ou acrescentem quem entrou no grupo.</p><div class="member-list">';
    for (var i = 0; i < Math.min(6, n); i++) html += '<input class="name-input member-input" type="text" maxlength="20" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Integrante ' + (i + 1) + '" value="' + esc(p.members[i] || '') + '">';
    html += '</div><p class="secret-msg" id="members-msg"></p>';
    return UI.modal({
      title: '✏️ Integrantes do grupo', html: html,
      buttons: [{ label: 'Cancelar', value: null }, { label: '✅ Salvar', value: 'save', cls: 'btn-green', id: 'btn-members-save', keep: true }],
      onOpen: function (box, close) {
        box.querySelector('#btn-members-save').onclick = function () {
          var m = LA.cleanMembers(UI.$$('input', box).map(function (x) { return x.value; }));
          if (!m.length) { box.querySelector('#members-msg').textContent = '✏️ Deixem pelo menos um nome.'; return; }
          Store.setGroupInfo(p.id, p.turma, m);
          close('save');
        };
      }
    });
  };
})(globalThis.LA = globalThis.LA || {});
