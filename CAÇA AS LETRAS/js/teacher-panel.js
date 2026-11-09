/* =========================================================
   CAÇADORES DE LETRAS — Painel do Professor
   Acesso por PIN (configurado em js/config.js).
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const CFG = window.CDL_CONFIG || {};
  const P = () => CDL.Progress;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const avatarEmoji = (id) => (CDL.AVATARS.find((a) => a.id === id) || CDL.AVATARS[0]).emoji;
  const fmt = (ms) => (ms == null ? '—' : CDL.formatTime(ms));
  const starsTxt = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  function download(name, text) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  const today = () => new Date().toISOString().slice(0, 10);
  const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').toLowerCase();

  function summary(p) {
    const lv = Object.values(p.levels);
    return {
      done: P().completedCount(p),
      stars: P().starsTotal(p),
      time: p.totalTimeMs || 0,
      hints: lv.reduce((a, l) => a + (l.hints || 0), 0),
      errors: lv.reduce((a, l) => a + (l.errors || 0), 0),
      plays: lv.reduce((a, l) => a + (l.plays || 0), 0)
    };
  }

  const Teacher = {
    unlocked: false,
    pin: '',
    view: 'list',
    profileId: null,
    newAvatar: 'raposa',

    open() {
      this.view = this.unlocked ? 'list' : 'pin';
      this.pin = '';
      this.render();
    },
    lock() { this.unlocked = false; },

    render() {
      const body = document.getElementById('teacher-body');
      if (this.view === 'pin') body.innerHTML = this.pinHTML();
      else if (this.view === 'detail') body.innerHTML = this.detailHTML();
      else if (this.view === 'new') body.innerHTML = this.newHTML();
      else body.innerHTML = this.listHTML();
      body.scrollTop = 0;
    },

    /* ---------- PIN ---------- */
    pinHTML() {
      const len = String(CFG.teacherPin || '1234').length;
      const dots = Array.from({ length: len }, (_, i) => `<span class="pin-dot ${i < this.pin.length ? 'on' : ''}"></span>`).join('');
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
      return `<div class="pin-box card">
        <h3>Área do professor</h3>
        <p>Digite o PIN para acessar os resultados.</p>
        <div class="pin-dots" id="pin-dots">${dots}</div>
        <div class="pin-error" id="pin-error"></div>
        <div class="keypad">${keys.map((k) => `<button class="key" data-t="pin-key" data-k="${k}">${k}</button>`).join('')}</div>
        <p class="pin-help">O PIN pode ser alterado no arquivo <code>js/config.js</code>.</p>
      </div>`;
    },
    pressKey(k) {
      const target = String(CFG.teacherPin || '1234');
      if (k === 'C') this.pin = '';
      else if (k === '⌫') this.pin = this.pin.slice(0, -1);
      else if (this.pin.length < target.length) this.pin += k;
      CDL.audio.play('tap');
      if (this.pin.length === target.length) {
        if (this.pin === target) {
          this.unlocked = true;
          this.view = 'list';
          this.render();
          return;
        }
        this.render();
        const e = document.getElementById('pin-error');
        e.textContent = 'PIN incorreto. Tente novamente.';
        document.getElementById('pin-dots').classList.add('err');
        this.pin = '';
        setTimeout(() => { if (this.view === 'pin') this.render(); }, 1200);
        return;
      }
      this.render();
    },

    /* ---------- LISTA DE PERFIS ---------- */
    listHTML() {
      const profiles = P().profiles();
      const cur = P().current();
      const cards = profiles.map((p) => {
        const s = summary(p);
        return `<div class="t-card">
          <div class="t-card-head"><span class="t-av">${avatarEmoji(p.avatar)}</span><div><div class="t-name">${esc(p.name)}${cur && cur.id === p.id ? ' <span class="badge">jogando agora</span>' : ''}</div><div class="t-sub">Criado em ${new Date(p.createdAt).toLocaleDateString('pt-BR')}</div></div></div>
          <div class="t-bar"><i style="width:${(s.done / CDL.LEVELS.length) * 100}%"></i></div>
          <div class="t-grid">
            <div><b>${s.done}/${CDL.LEVELS.length}</b>fases</div><div><b>${s.stars}</b>estrelas</div><div><b>${fmt(s.time)}</b>tempo</div>
            <div><b>${s.hints}</b>dicas</div><div><b>${s.errors}</b>erros</div><div><b>${s.plays}</b>tentativas</div>
          </div>
          <button class="btn btn-blue t-open" data-t="detail" data-id="${p.id}">VER DETALHES</button>
        </div>`;
      }).join('');
      return `<div class="t-toolbar">
          <button class="btn btn-green" data-t="new">+ CRIAR PERFIL</button>
          <button class="btn btn-orange" data-t="csv-all" ${profiles.length ? '' : 'disabled'}>⬇ EXPORTAR RESULTADOS (CSV)</button>
          <button class="btn btn-purple" data-t="csv-history" ${profiles.length ? '' : 'disabled'}>⬇ EXPORTAR HISTÓRICO (CSV)</button>
          <button class="btn btn-gray" data-t="lock">🔒 BLOQUEAR</button>
        </div>
        ${profiles.length ? `<div class="t-cards">${cards}</div>` : '<div class="t-empty card">Nenhum perfil cadastrado ainda. Use <b>+ CRIAR PERFIL</b> para começar.</div>'}
        <p class="t-note">Os dados ficam salvos somente neste navegador (LocalStorage). Exporte o CSV para guardar uma cópia.</p>`;
    },

    /* ---------- NOVO PERFIL ---------- */
    newHTML() {
      return `<div class="card t-new">
        <h3>Criar perfil de estudante</h3>
        <p>Use apenas um apelido ou código (ex.: <b>ESTRELA</b>, <b>ALUNO 07</b>). Não são necessários dados pessoais.</p>
        <input class="input-big" id="t-new-name" maxlength="20" placeholder="APELIDO OU CÓDIGO">
        <div class="avatar-grid t-avatars">${CDL.AVATARS.map((a) => `<button class="avatar-opt ${a.id === this.newAvatar ? 'sel' : ''}" data-t="new-avatar" data-id="${a.id}" aria-label="${a.label}">${a.emoji}</button>`).join('')}</div>
        <div class="form-actions"><button class="btn btn-gray" data-t="list">CANCELAR</button><button class="btn btn-green" data-t="new-save">SALVAR</button></div>
      </div>`;
    },

    /* ---------- DETALHE DO PERFIL ---------- */
    detailHTML() {
      const p = P().get(this.profileId);
      if (!p) { this.view = 'list'; return this.listHTML(); }
      const s = summary(p);
      const cur = P().current();
      const rows = CDL.LEVELS.map((lv) => {
        const l = p.levels[lv.n];
        const timeIn = p.history.filter((h) => h.level === lv.n).reduce((a, h) => a + h.timeMs, 0);
        const status = l && l.completed ? '<span class="ok">✔ Concluída</span>' : l && l.plays ? '<span class="wip">Em andamento</span>' : '<span class="no">Não iniciada</span>';
        return `<tr><td>${lv.n}</td><td>${CDL.WORLDS[lv.world - 1].short}</td><td><b>${lv.word}</b></td><td>${status}</td><td class="st">${l ? starsTxt(l.bestStars || 0) : '☆☆☆'}</td><td>${fmt(l && l.bestTimeMs)}</td><td>${fmt(l && l.lastTimeMs)}</td><td>${timeIn ? fmt(timeIn) : '—'}</td><td>${l ? l.plays : 0}</td><td>${l ? l.hints : 0}</td><td>${l ? l.errors : 0}</td></tr>`;
      }).join('');
      const hist = p.history.slice().reverse().slice(0, 60).map((h) => `<tr><td>${new Date(h.date).toLocaleString('pt-BR')}</td><td>${h.level} — ${h.word}</td><td>${h.completed ? '<span class="ok">Concluída</span>' : '<span class="wip">Interrompida</span>'}</td><td>${fmt(h.timeMs)}</td><td>${h.hints}</td><td>${h.errors}</td><td class="st">${h.completed ? starsTxt(h.stars) : '—'}</td></tr>`).join('');
      const pending = CDL.LEVELS.filter((lv) => !P().isCompleted(p, lv.n)).map((lv) => lv.n);
      return `<div class="t-detail">
        <div class="t-toolbar">
          <button class="btn btn-gray" data-t="list">⬅ TODOS OS PERFIS</button>
        </div>
        <div class="card t-profile">
          <div class="t-card-head big"><span class="t-av">${avatarEmoji(p.avatar)}</span><div><div class="t-name">${esc(p.name)}${cur && cur.id === p.id ? ' <span class="badge">jogando agora</span>' : ''}</div><div class="t-sub">Criado em ${new Date(p.createdAt).toLocaleDateString('pt-BR')}</div></div></div>
          <div class="t-grid wide">
            <div><b>${s.done}</b>fases concluídas</div><div><b>${CDL.LEVELS.length - s.done}</b>não concluídas</div><div><b>${s.stars}/${CDL.LEVELS.length * 3}</b>estrelas</div>
            <div><b>${fmt(s.time)}</b>tempo total</div><div><b>${s.hints}</b>dicas usadas</div><div><b>${s.errors}</b>tentativas incorretas</div>
          </div>
          <p class="t-pending">${pending.length ? 'Fases ainda não concluídas: ' + pending.join(', ') : '🏆 Todas as fases foram concluídas!'}</p>
          <div class="t-actions">
            <button class="btn btn-green" data-t="select" data-id="${p.id}" ${cur && cur.id === p.id ? 'disabled' : ''}>▶ SELECIONAR PARA JOGAR</button>
            <button class="btn btn-blue" data-t="csv-one" data-id="${p.id}">⬇ EXPORTAR CSV</button>
            <button class="btn btn-purple" data-t="unlock" data-id="${p.id}">${p.unlockedAll ? '🔒 BLOQUEAR FASES' : '🔓 LIBERAR TODAS AS FASES'}</button>
          </div>
          <div class="t-rename"><input class="input-big" id="t-rename" maxlength="20" value="${esc(p.name)}" aria-label="Novo apelido"><button class="btn btn-gray" data-t="rename" data-id="${p.id}">RENOMEAR</button></div>
          <div class="t-actions danger">
            <button class="btn btn-orange" data-t="reset" data-id="${p.id}">↻ REINICIAR PROGRESSO</button>
            <button class="btn btn-red" data-t="delete" data-id="${p.id}">🗑 EXCLUIR PERFIL</button>
          </div>
        </div>
        <h3 class="t-h">Desempenho por fase</h3>
        <div class="t-table-wrap card"><table class="t-table"><thead><tr><th>Fase</th><th>Mundo</th><th>Palavra</th><th>Situação</th><th>Estrelas</th><th>Melhor tempo</th><th>Último tempo</th><th>Tempo total</th><th>Tentativas</th><th>Dicas</th><th>Erros</th></tr></thead><tbody>${rows}</tbody></table></div>
        <h3 class="t-h">Histórico de desempenho</h3>
        <div class="t-table-wrap card">${hist ? `<table class="t-table"><thead><tr><th>Data</th><th>Fase</th><th>Situação</th><th>Tempo</th><th>Dicas</th><th>Erros</th><th>Estrelas</th></tr></thead><tbody>${hist}</tbody></table>` : '<p class="t-empty-in">Ainda não há partidas registradas.</p>'}</div>
      </div>`;
    },

    /* ---------- ações ---------- */
    async handle(btn) {
      const t = btn.dataset.t;
      const id = btn.dataset.id;
      if (t === 'pin-key') return this.pressKey(btn.dataset.k);
      CDL.audio.play('tap');
      if (t === 'detail') { this.view = 'detail'; this.profileId = id; return this.render(); }
      if (t === 'list') { this.view = 'list'; return this.render(); }
      if (t === 'lock') { this.unlocked = false; this.view = 'pin'; this.pin = ''; return this.render(); }
      if (t === 'new') { this.view = 'new'; this.newAvatar = 'raposa'; return this.render(); }
      if (t === 'new-avatar') {
        this.newAvatar = id;
        document.querySelectorAll('.t-avatars .avatar-opt').forEach((b) => b.classList.toggle('sel', b.dataset.id === id));
        return;
      }
      if (t === 'new-save') {
        const name = document.getElementById('t-new-name').value;
        const prev = P().current();
        const p = P().create(name, this.newAvatar);
        if (prev) P().select(prev.id); // não troca o jogador atual automaticamente
        CDL.fx.toast('Perfil "' + p.name + '" criado!');
        this.view = 'list';
        return this.render();
      }
      if (t === 'csv-all') return download('cacadores-de-letras-resultados-' + today() + '.csv', P().toCSV(P().profiles()));
      if (t === 'csv-history') return download('cacadores-de-letras-historico-' + today() + '.csv', P().historyCSV(P().profiles()));
      const p = P().get(id);
      if (!p) return;
      if (t === 'csv-one') return download('cacadores-de-letras-' + slug(p.name) + '-' + today() + '.csv', P().toCSV([p]) + '\r\n\r\n' + P().historyCSV([p]).replace('﻿', ''));
      if (t === 'select') { P().select(id); CDL.fx.toast(p.name + ' é o jogador atual.'); if (CDL.App) CDL.App.refreshHome(); return this.render(); }
      if (t === 'unlock') { P().setUnlockAll(id, !p.unlockedAll); CDL.fx.toast(p.unlockedAll ? 'Todas as fases liberadas.' : 'Fases voltaram a ser liberadas em sequência.'); return this.render(); }
      if (t === 'rename') { P().rename(id, document.getElementById('t-rename').value); CDL.fx.toast('Apelido atualizado.'); if (CDL.App) CDL.App.refreshHome(); return this.render(); }
      if (t === 'reset') {
        if (await CDL.App.confirm('Reiniciar todo o progresso de "' + p.name + '"? As estrelas, tempos e histórico serão apagados.', 'REINICIAR')) {
          P().reset(id); CDL.fx.toast('Progresso reiniciado.'); this.render();
        }
        return;
      }
      if (t === 'delete') {
        if (await CDL.App.confirm('Excluir o perfil "' + p.name + '"? Esta ação não pode ser desfeita.', 'EXCLUIR')) {
          P().remove(id); CDL.fx.toast('Perfil excluído.'); this.view = 'list'; if (CDL.App) CDL.App.refreshHome(); this.render();
        }
      }
    },

    bind() {
      const body = document.getElementById('teacher-body');
      body.addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-t]');
        if (b && !b.disabled) this.handle(b);
      });
      document.addEventListener('keydown', (ev) => {
        if (this.view !== 'pin' || !document.getElementById('screen-teacher').classList.contains('active')) return;
        if (/^\d$/.test(ev.key)) this.pressKey(ev.key);
        else if (ev.key === 'Backspace') this.pressKey('⌫');
      });
    }
  };

  CDL.Teacher = Teacher;
})();
