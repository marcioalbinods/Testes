/* =========================================================
   LABIRINTO DOS ALGORITMOS — Servidor das turmas SIMULADO
   Roda o google-apps-script/Code.gs de verdade dentro do Node,
   com uma planilha de mentira na memória. Usado pelos testes.
   ========================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

function criarServidor() {
  const planilha = { linhas: [] };
  const cache = new Map();
  const props = new Map();

  const sheet = {
    getParent: () => ({ getUrl: () => 'https://planilha.simulada', getId: () => 'id' }),
    setName() {}, setFrozenRows() {},
    getLastRow: () => planilha.linhas.length,
    appendRow: (row) => { planilha.linhas.push(row.slice()); },
    getDataRange: () => ({ getValues: () => planilha.linhas.map((r) => r.slice()) }),
    getRange: (linha, col, n, m) => ({
      setValues: (vals) => { const row = planilha.linhas[linha - 1]; for (let j = 0; j < m; j++) row[col - 1 + j] = vals[0][j]; },
    }),
  };
  const ss = { getSheetByName: () => sheet, getSheets: () => [sheet], getId: () => 'id', getUrl: () => 'https://planilha.simulada' };

  const ctx = {
    SpreadsheetApp: { create: () => ss, openById: () => ss },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props.get(k) || null, setProperty: (k, v) => props.set(k, v) }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k) || null, put: (k, v) => cache.set(k, v), remove: (k) => cache.delete(k) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      computeDigest: (_alg, txt) => Array.from(crypto.createHash('sha256').update(String(txt), 'utf8').digest()).map((b) => (b > 127 ? b - 256 : b)),
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      formatDate: (d) => d.toISOString().slice(0, 16).replace('T', ' '),
    },
    ContentService: { createTextOutput: (t) => ({ texto: t, setMimeType() { return this; } }), MimeType: { JSON: 'json' } },
    Logger: { log() {} },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'google-apps-script', 'Code.gs'), 'utf8'), ctx);

  return {
    planilha,
    chamadas: [],
    fora: false, // true = simula servidor sem internet
    post(texto) {
      this.chamadas.push(JSON.parse(texto).acao);
      return JSON.parse(ctx.doPost({ postData: { contents: texto } }).texto);
    },
    get() { return JSON.parse(ctx.doGet().texto); },
    linhasComoObjetos() {
      const [cab, ...rest] = planilha.linhas;
      return rest.map((r) => Object.fromEntries(cab.map((c, i) => [c, r[i]])));
    },
  };
}

module.exports = { criarServidor };
