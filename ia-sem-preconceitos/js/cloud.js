/* =====================================================================
   Salvamento online (opcional) — conversa com o Google Apps Script do
   professor. O endereço fica em config.json:
     { "servidorUrl": "https://script.google.com/macros/s/.../exec", "turmas": [...] }
   Sem endereço (ou sem internet) o jogo continua salvando no aparelho e
   envia o progresso quando a internet voltar.
   ===================================================================== */
(function () {
  'use strict';
  const APP = 'nexuslab-ia-justa';
  const TIMEOUT = 20000;
  const C = { url: '', turmas: ['8A', '8B', '8C', '9A', '9B', '9C', '9D'], online: navigator.onLine !== false, lastError: '', _timer: 0, _busy: false };

  C.enabled = () => !!C.url;
  C.label = (t) => String(t || '').replace(/^(\d+)([A-Z]+)$/, '$1º $2');

  C.init = function () {
    if (C._init) return C._init;
    C._init = new Promise((resolve) => {
      if (!/^https?:$/.test(location.protocol) || typeof fetch !== 'function') return resolve(false);
      const t = setTimeout(() => resolve(C.enabled()), 6000);
      fetch('config.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).then((cfg) => {
        const url = String((cfg && cfg.servidorUrl) || '').trim();
        if (/^https:\/\/\S+$/.test(url)) C.url = url;
        if (cfg && Array.isArray(cfg.turmas) && cfg.turmas.length) C.turmas = cfg.turmas.map((x) => String(x).toUpperCase().replace(/[^0-9A-Z]/g, '')).filter(Boolean).slice(0, 15);
      }).catch(() => { /* modo local */ }).then(() => { clearTimeout(t); resolve(C.enabled()); });
    });
    return C._init;
  };

  C.call = function (acao, body) {
    if (!C.url) return Promise.reject(Object.assign(new Error('Servidor não configurado.'), { offline: true }));
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), TIMEOUT);
    // text/plain evita a "pré-verificação" do navegador, que o Apps Script não aceita
    return fetch(C.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ app: APP, acao }, body || {})), signal: ctrl ? ctrl.signal : undefined, redirect: 'follow' })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }, () => { throw Object.assign(new Error('Sem conexão com a internet.'), { offline: true }); })
      .then((res) => {
        clearTimeout(timer); setOnline(true);
        if (!res || res.ok !== true) throw new Error((res && res.erro) || 'Resposta inválida do servidor.');
        return res;
      }, (e) => {
        clearTimeout(timer);
        if (e.offline || e.name === 'AbortError' || /HTTP|JSON|Unexpected/i.test(e.message)) { setOnline(false); throw Object.assign(new Error(e.offline ? e.message : 'O servidor não respondeu. Confira a internet.'), { offline: true }); }
        throw e;
      });
  };
  function setOnline(v) { if (C.online !== v) { C.online = v; document.dispatchEvent(new CustomEvent('nexus-cloud')); } }

  /* --------- dados enviados --------- */
  function estadoDe(S) {
    const o = JSON.parse(JSON.stringify(S));
    delete o.cloud; delete o.settings;
    return o;
  }
  function resumo(S) {
    const G = window.GAME, E = window.ENGINE;
    const lv = E.level(S.xp), pr = E.progress();
    const done = G.missions.filter((m) => S.missions[m.id] && S.missions[m.id].status === 'done');
    const atual = G.missions.find((m) => S.missions[m.id] && S.missions[m.id].status === 'open');
    let erros = 0, dicas = 0;
    Object.values(S.challenges || {}).forEach((c) => { erros += c.errors || 0; dicas += c.hints || 0; });
    return {
      xp: S.xp, nivel: `${lv.num} - ${lv.title}`, progresso: Math.round(pr.pct * 100), missoes: `${done.length}/6`,
      missaoAtual: atual ? `Missão ${atual.num} - ${atual.title}` : (done.length === 6 ? 'Todas concluídas' : ''),
      medalhas: done.map((m) => `M${m.num}: ${S.missions[m.id].medalTier}`).join(', '),
      erros, dicas, minutos: Math.round((S.playSeconds || 0) / 60),
      conceito: S.finalConcept || '', justificativa: S.finalText || ''
    };
  }

  /* --------- turma, criar, entrar --------- */
  C.turma = (turma) => C.call('turma', { turma }).then((r) => r.duplas || []);

  C.register = function () {
    const S = ENGINE.state, c = S.cloud;
    return C.call('criar', { turma: c.turma, nome: S.player.name, senha: c.senha, estado: estadoDe(S), resumo: resumo(S), atualizadoEm: S.updated }).then((res) => {
      S.cloud = { turma: res.turma, codigo: String(res.codigo), token: res.token, syncedAt: S.updated };
      if (res.estado && res.atualizadoEm > (S.updated || 0)) ENGINE.adopt(res.estado, S.cloud, res.atualizadoEm);
      ENGINE.save(true);
      return res;
    });
  };

  C.login = function (codigo, senha) {
    return C.call('entrar', { codigo: String(codigo), senha: String(senha) }).then((res) => {
      const S = ENGINE.state;
      const cloud = { turma: res.turma, codigo: String(res.codigo), token: res.token, syncedAt: res.atualizadoEm || 0 };
      const mesma = S.cloud && S.cloud.codigo === cloud.codigo && S.player;
      if (mesma && (S.updated || 0) > (res.atualizadoEm || 0)) { S.cloud = cloud; ENGINE.save(true); C.schedule(true); } // este aparelho tem progresso mais novo
      else ENGINE.adopt(res.estado || { player: { name: res.nome, avatar: 's6 n y curly black hoodie c0' } }, cloud, res.atualizadoEm || Date.now());
      return res;
    });
  };

  /* --------- envio com fila --------- */
  C.needsSync = function () {
    const S = ENGINE.state;
    if (!C.enabled() || !S.cloud || !S.player || S.cloud.expired) return false;
    if (!S.cloud.codigo) return true; // criação pendente (estava sem internet)
    return (S.updated || 0) > (S.cloud.syncedAt || 0);
  };
  C.schedule = function (urgent) {
    if (!C.enabled() || !ENGINE.state.cloud) return;
    clearTimeout(C._timer);
    C._timer = setTimeout(C.flush, urgent ? 600 : 3000);
  };
  C.flush = function () {
    if (!C.needsSync() || C._busy) return Promise.resolve(true);
    C._busy = true;
    const S = ENGINE.state;
    let p;
    if (!S.cloud.codigo) p = C.register();
    else {
      const sentAt = S.updated;
      p = C.call('salvar', { codigo: S.cloud.codigo, token: S.cloud.token, estado: estadoDe(S), resumo: resumo(S), atualizadoEm: sentAt })
        .then(() => { S.cloud.syncedAt = sentAt; ENGINE.save(true); });
    }
    return p.then(() => { C.lastError = ''; return true; }, (e) => {
      C.lastError = e.message;
      if (/SESSAO_EXPIRADA/.test(e.message)) { S.cloud.expired = true; ENGINE.save(true); }
      return false;
    }).then((r) => { C._busy = false; document.dispatchEvent(new CustomEvent('nexus-cloud')); if (C.needsSync() && C.online && !/NOME_EM_USO/.test(C.lastError)) C.schedule(false); return r; });
  };
  C.beacon = function () {
    const S = ENGINE.state;
    if (!C.needsSync() || !S.cloud.codigo || !navigator.sendBeacon) return;
    const body = JSON.stringify({ app: APP, acao: 'salvar', codigo: S.cloud.codigo, token: S.cloud.token, estado: estadoDe(S), resumo: resumo(S), atualizadoEm: S.updated });
    try { navigator.sendBeacon(C.url, new Blob([body], { type: 'text/plain;charset=utf-8' })); } catch (e) { /* ok */ }
  };

  C.status = function () {
    const S = ENGINE.state;
    if (!C.enabled() || !S.cloud) return { icon: 'home', text: 'Salvo neste aparelho', cls: 'local' };
    if (S.cloud.expired) return { icon: 'lock', text: 'Entrem de novo para salvar online', cls: 'warn' };
    if (!C.needsSync()) return { icon: 'check', text: 'Salvo online', cls: 'ok' };
    if (!C.online) return { icon: 'clock', text: 'Sem internet: salva quando voltar', cls: 'warn' };
    return { icon: 'refresh', text: 'Salvando online…', cls: 'sync' };
  };

  window.addEventListener('online', () => { setOnline(true); C.schedule(true); });
  window.addEventListener('offline', () => setOnline(false));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') C.beacon(); });
  window.addEventListener('pagehide', () => C.beacon());

  window.CLOUD = C;
})();
