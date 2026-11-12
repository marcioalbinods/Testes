/* =========================================================
   LABIRINTO DOS ALGORITMOS — Salvamento online (opcional)
   Conversa com o servidor das turmas (Google Apps Script do
   professor). O endereço fica em config.json:
     { "servidorUrl": "https://script.google.com/macros/s/.../exec" }
   Sem endereço (ou sem internet) o jogo continua funcionando e
   guarda tudo no aparelho; o envio acontece quando a internet voltar.
   ========================================================= */
(function (LA) {
  'use strict';

  var APP = 'labirinto-dos-algoritmos';
  var TIMEOUT = 20000;
  var MIN_GAP_URGENT = 2500;   // ms entre envios importantes (fase vencida, compra…)
  var MIN_GAP = 45000;         // ms entre envios comuns (tentativas, blocos salvos)
  var TURMA_CACHE_MS = 15000;

  var C = LA.Cloud = {
    url: '',
    turmas: ['5A', '5B', '5C'],
    online: navigator.onLine !== false,
    lastError: '',
    _timer: 0, _busy: false, _lastSent: 0, _cache: {}
  };

  C.enabled = function () { return !!C.url; };

  /* Lê config.json (não existe ao abrir o arquivo direto, sem servidor: tudo bem). */
  C.init = function () {
    if (C._init) return C._init;
    C._init = new Promise(function (resolve) {
      if (!/^https?:$/.test(location.protocol) || typeof fetch !== 'function') { resolve(false); return; }
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; resolve(false); } }, 6000);
      fetch('config.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (cfg) {
        var url = String(cfg && cfg.servidorUrl || '').trim();
        if (/^https:\/\/[^\s]+$/.test(url)) C.url = url;
        if (cfg && Array.isArray(cfg.turmas) && cfg.turmas.length) C.turmas = cfg.turmas.map(function (x) { return String(x).toUpperCase().replace(/[^0-9A-Z]/g, ''); }).filter(Boolean).slice(0, 12);
      }).catch(function () { /* sem config: modo local */ }).then(function () {
        if (!done) { done = true; clearTimeout(t); resolve(C.enabled()); }
      });
    });
    return C._init;
  };

  /* Chamada ao servidor. Erros de rede vêm com e.offline = true. */
  C.call = function (acao, body) {
    if (!C.url) return Promise.reject(Object.assign(new Error('Servidor não configurado.'), { offline: true }));
    var payload = Object.assign({ app: APP, acao: acao }, body || {});
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT);
    // text/plain evita a "pré-verificação" do navegador, que o Apps Script não aceita
    return fetch(C.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined, redirect: 'follow' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }, function () {
        throw Object.assign(new Error('Sem conexão com a internet.'), { offline: true });
      })
      .then(function (res) {
        clearTimeout(timer);
        setOnline(true);
        if (!res || res.ok !== true) throw new Error(res && res.erro || 'Resposta inválida do servidor.');
        return res;
      }, function (e) {
        clearTimeout(timer);
        if (e.offline || e.name === 'AbortError' || /HTTP|JSON|Unexpected/i.test(e.message)) {
          setOnline(false);
          throw Object.assign(new Error(e.offline ? e.message : 'O servidor não respondeu. Confira a internet.'), { offline: true });
        }
        throw e;
      });
  };
  function setOnline(v) {
    if (C.online === v) return;
    C.online = v;
    document.dispatchEvent(new CustomEvent('la-cloud', { detail: { online: v } }));
  }

  /* ---------- Turma: grupos e ranking ---------- */
  C.turma = function (turma, fresh) {
    var c = C._cache[turma];
    if (!fresh && c && Date.now() - c.t < TURMA_CACHE_MS) return Promise.resolve(c.data);
    return C.call('turma', { turma: turma }).then(function (res) {
      C._cache[turma] = { t: Date.now(), data: res.grupos || [] };
      return C._cache[turma].data;
    });
  };
  C.cached = function (turma) { var c = C._cache[turma]; return c ? c.data : null; };

  /* ---------- Dados enviados ---------- */
  function resumo(p) {
    var t = LA.Store.totals(p), next = LA.Store.nextLevel(p);
    var base = p.avatar && LA.AV_BASES.filter(function (b) { return b.id === p.avatar.base; })[0];
    return {
      pontos: t.score, estrelas: t.stars, fases: t.done, conquistas: t.achievements, moedas: LA.coins(p),
      faseAtual: next ? 'Fase ' + next.id + ' - ' + next.title : 'Todas concluídas',
      avatar: base ? base.name : ''
    };
  }
  C.progressOf = function (p) {
    return {
      v: 2, turma: p.turma, members: p.members, avatar: p.avatar, inv: p.inv,
      levels: p.levels, achievements: p.achievements,
      stats: { runs: p.stats.runs, wins: p.stats.wins, items: p.stats.items, attempts: p.stats.attempts },
      last: p.last, updated: p.updated, resetAt: p.resetAt || 0
    };
  };

  /* ---------- Criar grupo / entrar ---------- */
  C.register = function (p) {
    return C.call('criar', {
      turma: p.turma, integrantes: p.members, senha: p.secret,
      progresso: C.progressOf(p), programas: LA.Store.programsOf(p.id), resumo: resumo(p), atualizadoEm: p.updated
    }).then(function (res) {
      p.cloud = { code: String(res.codigo), token: res.token, syncedAt: p.updated };
      delete C._cache[p.turma];
      LA.Store.save();
      return p;
    });
  };
  C.login = function (code, secret) {
    return C.call('entrar', { codigo: String(code), senha: secret }).then(function (res) {
      var p = LA.Store.adoptCloudGroup(res, secret);
      return p;
    });
  };

  /* ---------- Envio do progresso (com fila) ---------- */
  C.needsSync = function (p) {
    if (!p || !C.enabled() || p.imported) return false;
    if (!p.cloud) return !!(p.turma && p.secret && p.members && p.members.length);
    if (p.cloud.expired) return false;
    return (p.updated || 0) > (p.cloud.syncedAt || 0);
  };
  C.schedule = function (urgent) {
    if (!C.enabled()) return;
    var gap = urgent ? MIN_GAP_URGENT : MIN_GAP;
    var wait = Math.max(urgent ? 1200 : 4000, C._lastSent + gap - Date.now());
    if (C._timer && C._timerAt <= Date.now() + wait) return;
    clearTimeout(C._timer);
    C._timerAt = Date.now() + wait;
    C._timer = setTimeout(function () { C._timer = 0; C.flush(); }, wait);
  };
  /* Envia todos os grupos deste aparelho que têm mudanças. */
  C.flush = function () {
    if (!C.enabled() || C._busy) return Promise.resolve(false);
    var list = LA.Store.localPlayers().filter(C.needsSync);
    if (!list.length) return Promise.resolve(true);
    C._busy = true;
    C._lastSent = Date.now();
    var chain = Promise.resolve(true);
    list.forEach(function (p) { chain = chain.then(function (okSoFar) { return pushOne(p).then(function (r) { return okSoFar && r; }); }); });
    return chain.then(function (r) {
      C._busy = false;
      document.dispatchEvent(new CustomEvent('la-cloud', { detail: { synced: r } }));
      if (list.some(C.needsSync) && C.online) C.schedule(false);
      return r;
    });
  };
  function pushOne(p) {
    if (!p.cloud) {
      return C.register(p).then(function () { return true; }, function (e) { C.lastError = e.message; return false; });
    }
    var sentAt = p.updated;
    return C.call('salvar', {
      codigo: p.cloud.code, token: p.cloud.token, integrantes: p.members,
      progresso: C.progressOf(p), programas: LA.Store.programsOf(p.id), resumo: resumo(p), atualizadoEm: sentAt
    }).then(function () {
      p.cloud.syncedAt = sentAt; C.lastError = '';
      delete C._cache[p.turma];
      LA.Store.save();
      return true;
    }, function (e) {
      C.lastError = e.message;
      if (/SESSAO_EXPIRADA/.test(e.message)) { p.cloud.expired = true; LA.Store.save(); }
      return false;
    });
  }
  /* Ao fechar a aba: tenta mandar o que faltou sem esperar resposta. */
  C.beacon = function () {
    if (!C.enabled() || !navigator.sendBeacon) return;
    LA.Store.localPlayers().filter(function (p) { return p.cloud && C.needsSync(p); }).forEach(function (p) {
      var body = JSON.stringify({ app: APP, acao: 'salvar', codigo: p.cloud.code, token: p.cloud.token, integrantes: p.members, progresso: C.progressOf(p), programas: LA.Store.programsOf(p.id), resumo: resumo(p), atualizadoEm: p.updated });
      try { navigator.sendBeacon(C.url, new Blob([body], { type: 'text/plain;charset=utf-8' })); } catch (e) { /* ok */ }
    });
  };

  /* Situação do salvamento para mostrar na tela. */
  C.status = function (p) {
    if (!p) return { icon: '', text: '' };
    if (!C.enabled()) return { icon: '📍', text: 'Salvo neste aparelho', cls: 'local' };
    if (p.imported) return { icon: '📍', text: 'Resultado importado', cls: 'local' };
    if (p.cloud && p.cloud.expired) return { icon: '🔑', text: 'Entrem de novo para salvar online', cls: 'warn' };
    if (!C.needsSync(p)) return { icon: '☁️', text: 'Salvo online', cls: 'ok' };
    if (!C.online) return { icon: '⏳', text: 'Sem internet: será salvo online quando voltar', cls: 'warn' };
    return { icon: '🔄', text: 'Salvando online…', cls: 'sync' };
  };

  window.addEventListener('online', function () { setOnline(true); C.schedule(true); });
  window.addEventListener('offline', function () { setOnline(false); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') C.beacon(); });
  window.addEventListener('pagehide', function () { C.beacon(); });
})(globalThis.LA = globalThis.LA || {});
