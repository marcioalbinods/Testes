/* Tinkercad Master — sincronização do progresso com o Google Drive do aluno.
   Funciona quando o curso está aberto no Claude (conector "Google Drive" da conta).
   Em outros lugares (GitHub Pages, arquivo local) fica indisponível e o progresso continua só no navegador. */
(function () {
  const TM = (window.TM = window.TM || {});
  const SERVER = 'Google Drive';
  const TITLE = 'tinkercad-master-progresso.json';
  const FILE_KEY = 'tinkercad-master.drive';

  const listeners = new Set();
  const D = (TM.drive = {
    status: 'carregando', // carregando | indisponivel | desconectado | sincronizando | ok | erro
    detalhe: '',
    ultima: null,
    on(fn) { listeners.add(fn); fn(D); return () => listeners.delete(fn); }
  });
  const emit = (status, detalhe) => { D.status = status; D.detalhe = detalhe || ''; listeners.forEach((f) => { try { f(D); } catch (e) {} }); };

  let mcp = null, perms = null, getState = null, applyState = null, queue = Promise.resolve(), timer = null, lastPushed = '';
  const mem = (() => { try { return JSON.parse(localStorage.getItem(FILE_KEY) || '{}'); } catch (e) { return {}; } })();
  const remember = () => { try { localStorage.setItem(FILE_KEY, JSON.stringify(mem)); } catch (e) {} };

  /* ---------- mesclagem: nunca perde progresso de nenhum dos lados ---------- */
  const evKey = (h) => [h.id, h.tipo, h.data, h.result || '', h.detalhe || ''].join('|');
  TM.mergeStates = (a, b) => {
    if (!b) return a; if (!a) return b;
    const out = TM.blankState();
    const newer = (a.atualizado || '') >= (b.atualizado || '') ? a : b;
    out.criado = [a.criado, b.criado].filter(Boolean).sort()[0] || out.criado;
    out.atualizado = newer.atualizado || new Date().toISOString();
    out.nome = newer.nome || a.nome || b.nome || '';
    const ids = new Set([...Object.keys(a.concluidas || {}), ...Object.keys(b.concluidas || {})]);
    ids.forEach((id) => {
      const x = (a.concluidas || {})[id], y = (b.concluidas || {})[id];
      if (!x || !y) { out.concluidas[id] = x || y; return; }
      const best = (x.pontos || 0) >= (y.pontos || 0) ? x : y;
      out.concluidas[id] = Object.assign({}, best, { result: x.result === 'A' || y.result === 'A' ? 'A' : best.result, dicas: Math.min(x.dicas || 0, y.dicas || 0) });
    });
    out.desbloqueadas = [...new Set([...(a.desbloqueadas || []), ...(b.desbloqueadas || [])])].sort((m, n) => m - n);
    ['tentativas', 'dicas'].forEach((k) => { const ks = new Set([...Object.keys(a[k] || {}), ...Object.keys(b[k] || {})]); ks.forEach((id) => { out[k][id] = Math.max((a[k] || {})[id] || 0, (b[k] || {})[id] || 0); }); });
    out.checks = Object.assign({}, (newer === a ? b : a).checks, newer.checks);
    const aval = new Set([...Object.keys(a.avaliacoes || {}), ...Object.keys(b.avaliacoes || {})]);
    aval.forEach((id) => { const seen = new Map(); [...((a.avaliacoes || {})[id] || []), ...((b.avaliacoes || {})[id] || [])].forEach((e) => seen.set(e.data + '|' + e.result, e)); out.avaliacoes[id] = [...seen.values()].sort((m, n) => (m.data < n.data ? -1 : 1)); });
    const hs = new Map(); [...(a.historico || []), ...(b.historico || [])].forEach((h) => hs.set(evKey(h), h));
    out.historico = [...hs.values()].sort((m, n) => (m.data < n.data ? -1 : 1));
    return out;
  };
  const sig = (s) => { const c = Object.assign({}, s); delete c.atualizado; return JSON.stringify(c); };

  /* ---------- leitura de respostas do conector ---------- */
  const findId = (p) => { if (!p || typeof p !== 'object') return null; if (typeof p.id === 'string') return p.id; for (const v of Object.values(p)) { const r = findId(v); if (r) return r; } return null; };
  const decode = (b64) => { const bin = atob(b64.replace(/\s/g, '')); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes); };
  const findJson = (p, depth) => {
    if (depth > 6 || p == null) return null;
    if (typeof p === 'string') {
      const t = p.trim();
      const k = t.indexOf('{"v":1');
      if (k > 0) { try { const o = JSON.parse(t.slice(k, t.lastIndexOf('}') + 1)); if (o && o.concluidas) return o; } catch (e) {} }
      if (t.startsWith('{')) { try { const o = JSON.parse(t); if (o && o.v === 1 && o.concluidas) return o; const r = findJson(o, depth + 1); if (r) return r; } catch (e) {} }
      if (/^[A-Za-z0-9+/=\s]{16,}$/.test(t)) { try { const o = JSON.parse(decode(t)); if (o && o.v === 1) return o; } catch (e) {} }
      return null;
    }
    if (typeof p === 'object') { if (p.v === 1 && p.concluidas) return p; for (const v of Object.values(p)) { const r = findJson(v, depth + 1); if (r) return r; } }
    return null;
  };
  const call = (tool, input) => mcp.callTool(SERVER, tool, input, { cache: false });

  async function listFiles() {
    const r = await call('search_files', { query: "title = '" + TITLE + "' and trashed = false", orderBy: 'modifiedTime desc', pageSize: 10, excludeContentSnippets: true });
    const files = (r.payload && r.payload.files) || [];
    return files.filter((f) => f && f.id);
  }
  async function pull() {
    const files = await listFiles();
    mem.ids = files.map((f) => f.id); remember();
    if (!files.length) return null;
    const r = await call('download_file_content', { fileId: files[0].id });
    let st = findJson(r.payload, 0) || findJson(r.content, 0);
    if (!st) { try { const t = await call('read_file_content', { fileId: files[0].id }); st = findJson(t.payload, 0) || findJson(t.content, 0); } catch (e) {} }
    if (!st) throw Object.assign(new Error('O arquivo de progresso no Drive não pôde ser lido.'), { code: 'formato' });
    return st;
  }
  async function push(st) {
    const text = JSON.stringify(st);
    const r = await call('create_file', { title: TITLE, textContent: text, contentMimeType: 'application/json', disableConversionToGoogleType: true });
    const id = findId(r.payload);
    const old = (mem.ids || []).filter((x) => x !== id);
    mem.ids = id ? [id] : []; remember();
    for (const x of old) { try { await call('trash_file', { fileId: x }); } catch (e) { mem.ids.push(x); remember(); } }
    lastPushed = sig(st);
  }

  const msgFor = (e) => {
    const c = e && e.code;
    if (c === 'needs_reauth') return 'Reconecte o Google Drive em claude.ai → Configurações → Conectores.';
    if (c === 'server_not_connected' || c === 'selection_required') return 'Adicione o conector Google Drive em claude.ai → Configurações → Conectores.';
    if (c === 'not_in_manifest' || c === 'approval_required' || c === 'consent_required') return 'O acesso ao Google Drive não foi permitido para esta página.';
    if (c === 'blocked_by_policy') return 'A política da sua organização bloqueia o Google Drive aqui.';
    if (c === 'server_unavailable' || c === 'upstream_error') return 'O Google Drive não respondeu agora. Tentaremos de novo na próxima alteração.';
    return (e && e.message) || 'Falha ao falar com o Google Drive.';
  };

  /* Sincroniza: lê o Drive, mescla com o local, grava onde estiver faltando */
  D.sync = () => (queue = queue.then(async () => {
    if (!mcp) return;
    emit('sincronizando', 'Sincronizando com o Google Drive…');
    try {
      const remote = await pull();
      const local = getState();
      const merged = TM.mergeStates(local, remote);
      if (sig(merged) !== sig(local)) applyState(merged);
      if (!remote || sig(merged) !== sig(remote)) await push(merged); else lastPushed = sig(merged);
      mem.conectado = true; remember();
      D.ultima = new Date(); emit('ok', 'Progresso salvo no seu Google Drive.');
    } catch (e) {
      const negado = e && (e.code === 'not_in_manifest' || e.code === 'approval_required' || e.code === 'consent_required');
      if (negado) { mem.conectado = false; remember(); }
      emit(negado ? 'desconectado' : 'erro', msgFor(e));
    }
  }));

  /* Salva depois de uma alteração (agrupa mudanças seguidas) */
  D.schedule = () => {
    if (!mcp || D.status === 'desconectado' || D.status === 'indisponivel' || !mem.conectado) return;
    clearTimeout(timer);
    timer = setTimeout(() => { if (sig(getState()) !== lastPushed) D.sync(); }, 4000);
  };
  /* Substitui o arquivo do Drive pelo estado local (usado ao recomeçar ou importar) */
  D.replace = () => {
    if (!mcp || !mem.conectado) return Promise.resolve();
    clearTimeout(timer);
    return (queue = queue.then(async () => {
      emit('sincronizando', 'Salvando no Google Drive…');
      try { await listFiles().then((f) => { mem.ids = f.map((x) => x.id); }); await push(getState()); D.ultima = new Date(); emit('ok', 'Progresso salvo no seu Google Drive.'); }
      catch (e) { emit('erro', msgFor(e)); }
    }));
  };

  /* Inicialização: chamada pelo app com funções para ler e substituir o estado */
  D.init = async (get, apply) => {
    getState = get; applyState = apply;
    try { mcp = window.claude && window.claude.use ? await window.claude.use('mcp') : null; } catch (e) { mcp = null; }
    if (!mcp) { emit('indisponivel', 'A sincronização com o Drive funciona quando o curso é aberto pelo Claude.'); return; }
    try { perms = await window.claude.use('permissions'); } catch (e) { perms = null; }
    let st = 'prompt';
    try { st = perms ? await perms.state('mcp:' + SERVER).catch(() => 'prompt') : 'prompt'; } catch (e) {}
    if (st === 'unavailable') { emit('indisponivel', 'O conector Google Drive não está disponível nesta conta.'); mcp = null; return; }
    if (st === 'granted' && mem.conectado) { D.sync(); return; }
    emit('desconectado', 'Conecte o Google Drive para continuar o curso em qualquer aparelho.');
  };
  /* Conectar: sempre a partir de um clique (a primeira chamada pede permissão) */
  D.connect = () => { mem.conectado = true; remember(); return D.sync(); };
  D.disconnect = () => { mem.conectado = false; remember(); clearTimeout(timer); emit('desconectado', 'Sincronização pausada neste aparelho. O arquivo continua no seu Drive.'); };
})();
