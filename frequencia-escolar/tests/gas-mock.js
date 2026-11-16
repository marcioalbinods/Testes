/**
 * Simulador mínimo dos serviços do Google Apps Script usados pelo projeto,
 * para executar os arquivos .gs no Node.js e testar a lógica real.
 *
 * Fidelidade importante:
 *  - Planilha com limite de linhas (getRange fora do limite gera erro, como no Sheets).
 *  - Conversão automática de texto "yyyy-MM-dd" em Date quando a célula NÃO está em formato texto ("@"),
 *    como o Google Sheets faz — valida que o sistema grava datas como texto.
 *  - Apenas métodos reais da API são implementados (chamar método inexistente gera erro).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

function criarAmbiente(opcoes) {
  opcoes = opcoes || {};
  const estado = {
    agora: opcoes.agora ? new Date(opcoes.agora) : new Date(),
    usuario: opcoes.dono || 'dono@escola.edu.br',
    dono: opcoes.dono || 'dono@escola.edu.br',
    planilhas: {}, arquivos: {}, pastas: {}, propriedades: {}, cache: {}, gatilhos: [], logs: [],
    contadorId: 0, chamadasApi: { getValues: 0, setValues: 0 }
  };
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(estado.agora.getTime()); else super(...a); }
    static now() { return estado.agora.getTime(); }
  }

  function novoId(prefixo) { estado.contadorId++; return (prefixo || 'ID') + estado.contadorId + crypto.randomBytes(6).toString('hex'); }

  // ------------------------------------------------------------ Spreadsheet
  class Range {
    constructor(sheet, r, c, nr, nc) {
      if (r < 1 || c < 1 || nr < 1 || nc < 1) throw new Error('Intervalo inválido: ' + [r, c, nr, nc]);
      if (r + nr - 1 > sheet._maxRows || c + nc - 1 > sheet._maxCols) {
        throw new Error('As coordenadas do intervalo estão fora das dimensões da página. (' + [r, c, nr, nc] + ' max ' + sheet._maxRows + 'x' + sheet._maxCols + ')');
      }
      Object.assign(this, { sheet, r, c, nr, nc });
    }
    getRow() { return this.r; }
    getColumn() { return this.c; }
    getValues() {
      estado.chamadasApi.getValues++;
      const out = [];
      for (let i = 0; i < this.nr; i++) {
        const linha = [];
        for (let j = 0; j < this.nc; j++) {
          const v = this.sheet._cel(this.r + i, this.c + j).v;
          linha.push(v instanceof RealDate ? new FakeDate(v.getTime()) : v);
        }
        out.push(linha);
      }
      return out;
    }
    setValues(vals) {
      estado.chamadasApi.setValues++;
      if (vals.length !== this.nr || vals.some(l => l.length !== this.nc)) throw new Error('Dimensões incompatíveis em setValues: esperado ' + this.nr + 'x' + this.nc);
      for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) {
        const cel = this.sheet._cel(this.r + i, this.c + j, true);
        let v = vals[i][j];
        if (v === null || v === undefined) v = '';
        if (typeof v === 'object' && !(v instanceof RealDate)) throw new Error('Valor inválido para célula: ' + JSON.stringify(v));
        if (typeof v === 'string' && cel.f !== '@') {
          // Comportamento do Sheets: texto com cara de data/número vira Date/número.
          if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(v)) v = new RealDate(v.replace(' ', 'T') + '-03:00');
          else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
        }
        cel.v = v;
      }
      return this;
    }
    setValue(v) { return this.setValues([[v]]); }
    getValue() { return this.getValues()[0][0]; }
    setNumberFormats(f) {
      if (f.length !== this.nr || f.some(l => l.length !== this.nc)) throw new Error('Dimensões incompatíveis em setNumberFormats');
      for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sheet._cel(this.r + i, this.c + j, true).f = f[i][j];
      return this;
    }
    setNumberFormat(f) {
      for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sheet._cel(this.r + i, this.c + j, true).f = f;
      return this;
    }
    getNumberFormats() {
      const out = [];
      for (let i = 0; i < this.nr; i++) { const l = []; for (let j = 0; j < this.nc; j++) l.push(this.sheet._cel(this.r + i, this.c + j).f || 'General'); out.push(l); }
      return out;
    }
    setFontWeight() { return this; } setBackground() { return this; } setFontColor() { return this; } setFontSize() { return this; }
    setBorder() { return this; }
    createTextFinder(texto) {
      const range = this;
      let inteira = false, caso = false;
      const tf = {
        matchEntireCell(b) { inteira = b; return tf; },
        matchCase(b) { caso = b; return tf; },
        findAll() {
          const res = [];
          for (let i = 0; i < range.nr; i++) for (let j = 0; j < range.nc; j++) {
            let v = range.sheet._cel(range.r + i, range.c + j).v;
            v = v === undefined || v === null ? '' : String(v);
            let t = String(texto);
            if (!caso) { v = v.toLowerCase(); t = t.toLowerCase(); }
            if (inteira ? v === t : v.indexOf(t) >= 0) res.push(new Range(range.sheet, range.r + i, range.c + j, 1, 1));
          }
          return res;
        }
      };
      return tf;
    }
  }
  class Sheet {
    constructor(ss, nome) { this._ss = ss; this._nome = nome; this._dados = {}; this._maxRows = 1000; this._maxCols = 26; this._protecoes = []; this._congeladas = 0; }
    _cel(r, c, criar) {
      const k = r + ':' + c;
      if (!this._dados[k]) { if (!criar) return { v: '' }; this._dados[k] = { v: '' }; }
      return this._dados[k];
    }
    getName() { return this._nome; }
    setName(n) { this._nome = n; return this; }
    getLastRow() { let m = 0; for (const k in this._dados) { if (this._dados[k].v !== '' && this._dados[k].v !== undefined) m = Math.max(m, Number(k.split(':')[0])); } return m; }
    getLastColumn() { let m = 0; for (const k in this._dados) { if (this._dados[k].v !== '' && this._dados[k].v !== undefined) m = Math.max(m, Number(k.split(':')[1])); } return m; }
    getMaxRows() { return this._maxRows; }
    getMaxColumns() { return this._maxCols; }
    insertRowsAfter(apos, n) {
      // Linhas inseridas herdam o formato da linha anterior (como no Sheets).
      if (apos !== this._maxRows) throw new Error('mock: inserção somente no final');
      for (let c = 1; c <= this._maxCols; c++) {
        const f = this._cel(apos, c).f;
        for (let r = apos + 1; r <= apos + n; r++) if (f) this._cel(r, c, true).f = f;
      }
      this._maxRows += n; return this;
    }
    deleteColumns(ini, n) { this._maxCols -= n; return this; }
    getRange(r, c, nr, nc) { return new Range(this, r, c, nr || 1, nc || 1); }
    getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
    setFrozenRows(n) { this._congeladas = n; return this; }
    autoResizeColumns() { return this; }
    protect() {
      const p = { _desc: '', _aviso: false, setDescription(d) { this._desc = d; return p; }, setWarningOnly(b) { this._aviso = b; return p; } };
      this._protecoes.push(p); return p;
    }
    getProtections() { return this._protecoes; }
  }
  class Spreadsheet {
    constructor(nome) { this._id = novoId('SS'); this._nome = nome; this._abas = [new Sheet(this, 'Página1')]; estado.planilhas[this._id] = this; estado.arquivos[this._id] = arquivo(this._id, nome, 'sheet'); }
    getId() { return this._id; }
    getName() { return this._nome; }
    getUrl() { return 'https://docs.google.com/spreadsheets/d/' + this._id; }
    getSheetByName(n) { return this._abas.find(a => a._nome === n) || null; }
    getSheets() { return this._abas.slice(); }
    insertSheet(nome, idx) {
      if (this.getSheetByName(nome)) throw new Error('Já existe uma página com o nome ' + nome);
      const s = new Sheet(this, nome);
      if (idx === undefined || idx > this._abas.length) this._abas.push(s); else this._abas.splice(idx, 0, s);
      return s;
    }
    deleteSheet(s) { if (this._abas.length === 1) throw new Error('Não é possível remover todas as páginas'); this._abas = this._abas.filter(a => a !== s); }
    setSpreadsheetTimeZone() { return this; }
  }
  function arquivo(id, nome, tipo) {
    return {
      _id: id, _nome: nome, _tipo: tipo, _lixeira: false, _criado: new FakeDate(),
      getId() { return this._id; }, getName() { return this._nome; }, getUrl() { return 'https://drive.google.com/file/d/' + this._id; },
      isTrashed() { return this._lixeira; }, setTrashed(b) { this._lixeira = b; return this; },
      getDateCreated() { return this._criado; },
      makeCopy(nome, pasta) { const novo = arquivo(novoId('CP'), nome, tipo); estado.arquivos[novo._id] = novo; pasta._arquivos.push(novo); return novo; },
      getAs(mime) { return blob(Buffer.from('%PDF-1.4 simulado ' + this._nome), mime); }
    };
  }
  function blob(buf, mime) { return { getBytes() { return Array.from(buf); }, getContentType() { return mime; }, setName() { return this; } }; }

  const SpreadsheetApp = {
    create(nome) { return new Spreadsheet(nome); },
    openById(id) { const s = estado.planilhas[id]; if (!s) throw new Error('Documento ausente: ' + id); return s; },
    flush() {},
    ProtectionType: { SHEET: 'SHEET', RANGE: 'RANGE' },
    BorderStyle: { SOLID: 'SOLID' }
  };

  // ------------------------------------------------------------ Documento (PDF) — somente métodos reais da API
  function textoEl() {
    const t = { setFontSize() { return t; }, setBold() { return t; }, setForegroundColor() { return t; }, setItalic() { return t; } };
    return t;
  }
  function paragrafo() {
    const p = { setText() { return p; }, editAsText() { return textoEl(); }, setSpacingAfter() { return p; }, setSpacingBefore() { return p; }, setAttributes() { return p; } };
    return p;
  }
  function tabela(celulas) {
    celulas.forEach(l => l.forEach(v => { if (typeof v !== 'string') throw new Error('appendTable exige texto, recebeu ' + typeof v); }));
    const cel = () => { const c = { setBackgroundColor() { return c; }, setWidth() { return c; }, editAsText() { return textoEl(); } }; return c; };
    return { setBorderColor() { return this; }, getCell(r, c) { if (!celulas[r] || celulas[r][c] === undefined) throw new Error('Célula inexistente ' + r + ',' + c); return cel(); } };
  }
  const DocumentApp = {
    Attribute: { FONT_FAMILY: 'FONT_FAMILY', FONT_SIZE: 'FONT_SIZE', FOREGROUND_COLOR: 'FOREGROUND_COLOR' },
    create(nome) {
      const id = novoId('DOC');
      estado.arquivos[id] = arquivo(id, nome, 'doc');
      const corpo = {
        setPageWidth() { return corpo; }, setPageHeight() { return corpo; }, setMarginTop() { return corpo; }, setMarginBottom() { return corpo; },
        setMarginLeft() { return corpo; }, setMarginRight() { return corpo; }, setAttributes() { return corpo; },
        getParagraphs() { return [paragrafo()]; }, appendParagraph() { return paragrafo(); }, appendTable(c) { return tabela(c); }
      };
      return { getId() { return id; }, getBody() { return corpo; }, saveAndClose() {} };
    }
  };

  const DriveApp = {
    getFileById(id) { const a = estado.arquivos[id]; if (!a) throw new Error('Arquivo não encontrado ' + id); return a; },
    createFolder(nome) {
      const id = novoId('PASTA');
      const p = { _id: id, _nome: nome, _arquivos: [], getId() { return id; }, getUrl() { return 'https://drive.google.com/drive/folders/' + id; }, isTrashed() { return false; },
        setDescription() { return p; },
        getFiles() { let i = 0; const l = p._arquivos; return { hasNext: () => i < l.length, next: () => l[i++] }; } };
      estado.pastas[id] = p; return p;
    },
    getFolderById(id) { const p = estado.pastas[id]; if (!p) throw new Error('Pasta não encontrada'); return p; }
  };

  const UrlFetchApp = {
    fetch(url, o) {
      if (!o || !o.headers || !/^Bearer /.test(o.headers.Authorization)) throw new Error('sem token');
      return { getResponseCode() { return 200; }, getContent() { return Array.from(Buffer.from('PK simulado xlsx')); }, getBlob() { return blob(Buffer.from('PK'), 'x'); } };
    }
  };

  // ------------------------------------------------------------ Outros serviços
  const PropertiesService = {
    getScriptProperties() {
      return {
        getProperty: k => (k in estado.propriedades ? estado.propriedades[k] : null),
        setProperty(k, v) { estado.propriedades[k] = String(v); return this; },
        deleteProperty(k) { delete estado.propriedades[k]; return this; }
      };
    }
  };
  const CacheService = {
    getScriptCache() {
      return {
        get: k => (k in estado.cache ? estado.cache[k] : null),
        put(k, v) { if (String(v).length > 100000) throw new Error('Argumento muito grande'); estado.cache[k] = v; },
        remove(k) { delete estado.cache[k]; }
      };
    }
  };
  let travado = false;
  const LockService = {
    getScriptLock() {
      return { tryLock() { if (estado.forcarLockOcupado) return false; travado = true; return true; }, waitLock() { travado = true; }, releaseLock() { travado = false; }, hasLock: () => travado };
    }
  };
  const Session = {
    getActiveUser() { return { getEmail: () => estado.usuario || '' }; },
    getEffectiveUser() { return { getEmail: () => estado.dono }; }
  };
  function formatarData(d, tz, fmt) {
    const partes = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      .formatToParts(d).forEach(p => { partes[p.type] = p.value; });
    if (partes.hour === '24') partes.hour = '00';
    return fmt.replace('yyyy', partes.year).replace('MM', partes.month).replace('dd', partes.day)
      .replace('HH', partes.hour).replace('mm', partes.minute).replace('ss', partes.second);
  }
  const Utilities = {
    formatDate: formatarData,
    getUuid: () => crypto.randomUUID(),
    Charset: { UTF_8: 'UTF-8' },
    base64Encode(v) { return Array.isArray(v) ? Buffer.from(v).toString('base64') : Buffer.from(String(v), 'utf8').toString('base64'); },
    newBlob(c, mime) { return blob(Buffer.from(String(c)), mime); }
  };
  const ScriptApp = {
    getProjectTriggers: () => estado.gatilhos.slice(),
    getOAuthToken: () => 'token-simulado',
    newTrigger(fn) {
      const b = { timeBased() { return b; }, everyDays() { return b; }, atHour() { return b; }, inTimezone() { return b; },
        create() { const t = { getHandlerFunction: () => fn, getUniqueId: () => 'TRG1' }; estado.gatilhos.push(t); return t; } };
      return b;
    }
  };
  // FE_PACOTE=1 testa o pacote de instalação (instalacao/) em vez dos arquivos de src/.
  const raizSrc = path.join(__dirname, '..', process.env.FE_PACOTE ? 'instalacao' : 'src');
  function processarTemplate(conteudo, vars, ctx) {
    let codigo = 'var __s="";with(__v){';
    const partes = conteudo.split(/(<\?!?=?[\s\S]*?\?>)/);
    for (const p of partes) {
      if (p.startsWith('<?!=')) codigo += '__s+=String(' + p.slice(4, -2).replace(/;\s*$/, '') + ');';
      else if (p.startsWith('<?=')) codigo += '__s+=__esc(String(' + p.slice(3, -2).replace(/;\s*$/, '') + '));';
      else if (p.startsWith('<?')) codigo += p.slice(2, -2);
      else codigo += '__s+=' + JSON.stringify(p) + ';';
    }
    codigo += '}__s;';
    ctx.__v = vars; ctx.__esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    return vm.runInContext(codigo, ctx);
  }
  function saidaHtml(conteudo) {
    const o = { _c: conteudo, _titulo: '', _meta: {}, getContent() { return o._c; }, setTitle(t) { o._titulo = t; return o; },
      addMetaTag(n, v) {
        // Somente as metatags permitidas pelo Apps Script (HtmlOutput.addMetaTag).
        if (n !== 'viewport') { // o sistema só usa a metatag viewport (a única garantida em qualquer conta)
          throw new Error('A metatag especificada não é permitida neste contexto: ' + n);
        }
        o._meta[n] = v; return o;
      }, setXFrameOptionsMode() { return o; }, setFaviconUrl(u) { o._favicon = u; return o; } };
    return o;
  }
  const HtmlService = {
    XFrameOptionsMode: { DEFAULT: 'DEFAULT', ALLOWALL: 'ALLOWALL' },
    createHtmlOutput(c) { return saidaHtml(String(c)); },
    createHtmlOutputFromFile(n) { return saidaHtml(fs.readFileSync(path.join(raizSrc, n + '.html'), 'utf8')); },
    createTemplate(conteudo) {
      const t = { evaluate() { return saidaHtml(processarTemplate(conteudo, Object.assign({}, t), ctx)); } };
      return t;
    },
    createTemplateFromFile(n) {
      const t = { _n: n, evaluate() { return saidaHtml(processarTemplate(fs.readFileSync(path.join(raizSrc, n + '.html'), 'utf8'), Object.assign({}, t), ctx)); } };
      return t;
    }
  };
  const Logger = { log: m => { estado.logs.push(String(m)); } };
  const consoleSilencioso = { log() {}, warn() {}, error: (...a) => { estado.logs.push('ERRO: ' + a.join(' ')); }, info() {} };

  const ctx = vm.createContext({
    Date: FakeDate, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, isFinite, isNaN, parseInt, parseFloat, Intl,
    SpreadsheetApp, DocumentApp, DriveApp, UrlFetchApp, PropertiesService, CacheService, LockService, Session, Utilities, ScriptApp, HtmlService, Logger,
    console: consoleSilencioso
  });
  const arquivos = fs.readdirSync(raizSrc).filter(f => f.endsWith('.gs')).sort();
  for (const f of arquivos) vm.runInContext(fs.readFileSync(path.join(raizSrc, f), 'utf8'), ctx, { filename: f });

  /** Simula uma NOVA execução (cada chamada do navegador é uma execução separada no Apps Script). */
  function novaExecucao(usuario) {
    estado.usuario = usuario === undefined ? estado.usuario : usuario;
    vm.runInContext('_memo = { ss: null, abas: {}, cabecalhos: {}, tabelas: {} }; _usuarioMemo = { carregado: false, valor: null };', ctx);
  }
  function api(usuario, nome, ...args) {
    novaExecucao(usuario);
    const r = ctx[nome](...args);
    return JSON.parse(JSON.stringify(r)); // google.script.run serializa o retorno
  }
  return { ctx, estado, api, novaExecucao, Spreadsheet, RealDate };
}

module.exports = { criarAmbiente };
