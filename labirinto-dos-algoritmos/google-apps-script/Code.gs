/**
 * LABIRINTO DOS ALGORITMOS — servidor das turmas (Google Apps Script)
 *
 * Guarda, numa planilha do SEU Google Drive, os grupos de cada turma e o progresso de cada grupo,
 * para que os estudantes continuem de onde pararam em qualquer tablet ou computador.
 *  - Os próprios estudantes criam o grupo no jogo: escolhem a turma, escrevem os nomes e escolhem
 *    uma "senha de figuras" (3 figuras). A senha aparece na planilha para o professor ajudar quem esquecer.
 *  - O progresso, as moedas e o avatar ficam salvos aqui.
 *
 * Como instalar: veja o arquivo LEIA-ME.md desta pasta.
 */

/* ======================= CONFIGURAÇÃO ======================= */

var TURMAS = ['5A', '5B', '5C'];            // turmas que aparecem no jogo
var NOME_PLANILHA = 'Labirinto dos Algoritmos - Turmas';
var APP_ID = 'labirinto-dos-algoritmos';
var FUSO = 'America/Sao_Paulo';
var MAX_GRUPOS_POR_TURMA = 60;
var MAX_TENTATIVAS = 8;          // erros seguidos de senha antes de bloquear o grupo
var BLOQUEIO_SEGUNDOS = 600;     // 10 minutos
var MAX_TEXTO = 45000;           // limite seguro de uma célula da planilha

var FIGURAS = ['cachorro', 'gato', 'leao', 'sapo', 'macaco', 'unicornio', 'maca', 'pizza', 'bola', 'foguete', 'estrela', 'arco-iris'];

var COLUNAS = [
  'Código', 'Turma', 'Integrantes', 'Senha (figuras)', 'Avatar', 'Criado em', 'Último acesso',
  'Pontos', 'Estrelas', 'Fases concluídas', 'Fase atual', 'Moedas', 'Conquistas',
  'Progresso (não editar)', 'Programas (não editar)', 'Hash da sessão', 'Atualizado em (ms)',
];

/* ======================= INSTALAÇÃO ======================= */

/** Rode esta função uma vez no editor para autorizar e criar a planilha. */
function configurar() {
  var sheet = aba_();
  Logger.log('Planilha das turmas: ' + sheet.getParent().getUrl());
  Logger.log('Tudo pronto! Agora faça a implantação como App da Web (veja o LEIA-ME).');
}

/** Abrir o endereço do app no navegador mostra se o servidor está funcionando. */
function doGet() {
  return json_({ ok: true, app: APP_ID, turmas: TURMAS, mensagem: 'Servidor do Labirinto dos Algoritmos funcionando.' });
}

function doPost(e) {
  var p;
  try {
    p = JSON.parse(e && e.postData ? e.postData.contents : '{}');
  } catch (err) {
    return json_({ ok: false, erro: 'Pedido inválido.' });
  }
  if (!p || p.app !== APP_ID) return json_({ ok: false, erro: 'Pedido inválido.' });

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, erro: 'O servidor está ocupado. Tente de novo em alguns segundos.' });
  }
  try {
    return json_(executar_(p));
  } catch (err) {
    return json_({ ok: false, erro: err && err.message ? err.message : 'Erro inesperado no servidor.' });
  } finally {
    lock.releaseLock();
  }
}

/* ======================= AÇÕES ======================= */

function executar_(p) {
  switch (p.acao) {
    case 'info': return { ok: true, turmas: TURMAS };
    case 'turma': return turma_(p);
    case 'criar': return criar_(p);
    case 'entrar': return entrar_(p);
    case 'salvar': return salvar_(p);
  }
  throw new Error('Ação desconhecida.');
}

/** Lista os grupos de uma turma (para escolher o grupo e para o ranking da turma). */
function turma_(p) {
  var turma = turmaValida_(p.turma);
  var grupos = linhas_(aba_()).filter(function (reg) { return reg.dados['Turma'] === turma; }).map(function (reg) {
    var d = reg.dados;
    var prog = lerJson_(d['Progresso (não editar)']) || {};
    return {
      codigo: String(d['Código']),
      turma: turma,
      integrantes: separarNomes_(d['Integrantes']),
      avatar: prog.avatar || null,
      levels: prog.levels || {},
      achievements: prog.achievements || {},
      pontos: Number(d['Pontos']) || 0,
      estrelas: Number(d['Estrelas']) || 0,
      fases: Number(d['Fases concluídas']) || 0,
      ultimoAcesso: textoData_(d['Último acesso']),
    };
  });
  return { ok: true, turma: turma, grupos: grupos };
}

/** Cria um grupo novo. Devolve o código do grupo e a chave de sessão. */
function criar_(p) {
  var turma = turmaValida_(p.turma);
  var nomes = limparNomes_(p.integrantes);
  if (!nomes.length) throw new Error('Escreva o nome de pelo menos um integrante.');
  var senha = senhaValida_(p.senha);
  var sheet = aba_();
  var todos = linhas_(sheet);
  var daTurma = todos.filter(function (r) { return r.dados['Turma'] === turma; });
  if (daTurma.length >= MAX_GRUPOS_POR_TURMA) throw new Error('A turma ' + turma + ' já tem grupos demais. Peça ajuda ao professor.');
  // evita grupo repetido (mesmos nomes na mesma turma, por exemplo ao tocar duas vezes)
  var chaveNomes = nomes.join(',').toLowerCase();
  for (var i = 0; i < daTurma.length; i++) {
    if (separarNomes_(daTurma[i].dados['Integrantes']).join(',').toLowerCase() === chaveNomes &&
        String(daTurma[i].dados['Senha (figuras)']) === senha) {
      return sessaoNova_(daTurma[i]);
    }
  }
  var proximo = 101;
  todos.forEach(function (r) { proximo = Math.max(proximo, (Number(r.dados['Código']) || 0) + 1); });
  var token = Utilities.getUuid();
  var dados = {};
  COLUNAS.forEach(function (c) { dados[c] = ''; });
  dados['Código'] = String(proximo);
  dados['Turma'] = turma;
  dados['Integrantes'] = nomes.join(', ');
  dados['Senha (figuras)'] = senha;
  dados['Criado em'] = agora_();
  dados['Último acesso'] = agora_();
  dados['Hash da sessão'] = hash_(token);
  aplicarProgresso_(dados, p);
  sheet.appendRow(COLUNAS.map(function (c) { return dados[c]; }));
  return { ok: true, codigo: String(proximo), token: token, turma: turma, integrantes: nomes };
}

/** Entra num grupo: código + senha de figuras → progresso salvo + chave de sessão. */
function entrar_(p) {
  var codigo = String(p.codigo || '').trim();
  var chave = 'falhas:' + codigo;
  verificarBloqueio_(chave);
  var reg = buscar_(codigo);
  var senha = '';
  try { senha = senhaValida_(p.senha); } catch (err) { senha = ''; }
  if (!reg || !senha || String(reg.dados['Senha (figuras)']) !== senha) {
    registrarFalha_(chave);
    throw new Error('Senha de figuras errada. Confiram e tentem de novo.');
  }
  limparFalhas_(chave);
  return sessaoNova_(reg);
}

function sessaoNova_(reg) {
  var token = Utilities.getUuid();
  reg.dados['Hash da sessão'] = hash_(token);
  reg.dados['Último acesso'] = agora_();
  gravar_(reg);
  return {
    ok: true,
    codigo: String(reg.dados['Código']),
    turma: reg.dados['Turma'],
    integrantes: separarNomes_(reg.dados['Integrantes']),
    token: token,
    progresso: lerJson_(reg.dados['Progresso (não editar)']),
    programas: lerJson_(reg.dados['Programas (não editar)']),
    atualizadoEm: Number(reg.dados['Atualizado em (ms)']) || 0,
  };
}

/** Grava o progresso do grupo (precisa da chave de sessão recebida ao entrar ou criar). */
function salvar_(p) {
  var reg = buscar_(String(p.codigo || '').trim());
  if (!reg || !p.token || !reg.dados['Hash da sessão'] || hash_(String(p.token)) !== reg.dados['Hash da sessão']) {
    throw new Error('SESSAO_EXPIRADA');
  }
  if (p.integrantes) {
    var nomes = limparNomes_(p.integrantes);
    if (nomes.length) reg.dados['Integrantes'] = nomes.join(', ');
  }
  aplicarProgresso_(reg.dados, p);
  reg.dados['Último acesso'] = agora_();
  gravar_(reg);
  return { ok: true };
}

/* Copia progresso, programas e o resumo (colunas que o professor lê) para a linha. */
function aplicarProgresso_(dados, p) {
  if (p.progresso && typeof p.progresso === 'object') {
    var texto = JSON.stringify(p.progresso);
    if (texto.length > MAX_TEXTO) throw new Error('O progresso ficou grande demais para salvar.');
    dados['Progresso (não editar)'] = texto;
  }
  if (p.programas && typeof p.programas === 'object') {
    var progs = p.programas, txt = JSON.stringify(progs);
    if (txt.length > MAX_TEXTO) {
      // guarda só o que couber, começando pelos menores
      var chaves = Object.keys(progs).sort(function (a, b) { return String(progs[a]).length - String(progs[b]).length; });
      var parcial = {};
      for (var i = 0; i < chaves.length; i++) {
        parcial[chaves[i]] = progs[chaves[i]];
        if (JSON.stringify(parcial).length > MAX_TEXTO) delete parcial[chaves[i]];
      }
      txt = JSON.stringify(parcial);
    }
    dados['Programas (não editar)'] = txt;
  }
  var r = p.resumo || {};
  dados['Pontos'] = numero_(r.pontos, 0, 2500);
  dados['Estrelas'] = numero_(r.estrelas, 0, 75);
  dados['Fases concluídas'] = numero_(r.fases, 0, 25);
  dados['Fase atual'] = r.faseAtual ? String(r.faseAtual).slice(0, 60) : '';
  dados['Moedas'] = numero_(r.moedas, 0, 99999);
  dados['Conquistas'] = numero_(r.conquistas, 0, 99);
  dados['Avatar'] = r.avatar ? String(r.avatar).slice(0, 40) : '';
  dados['Atualizado em (ms)'] = Number(p.atualizadoEm) || new Date().getTime();
}

/* ======================= VALIDAÇÃO ======================= */

function turmaValida_(t) {
  var turma = String(t || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (TURMAS.indexOf(turma) < 0) throw new Error('Turma inválida.');
  return turma;
}

function senhaValida_(s) {
  var lista = Array.isArray(s) ? s : String(s || '').split(/[\s,]+/);
  lista = lista.map(function (x) { return String(x).trim().toLowerCase(); }).filter(function (x) { return x; });
  if (lista.length !== 3 || lista.some(function (x) { return FIGURAS.indexOf(x) < 0; })) throw new Error('Escolham 3 figuras para a senha.');
  return lista.join(' ');
}

function limparNomes_(lista) {
  if (!Array.isArray(lista)) lista = String(lista || '').split(',');
  var out = [];
  lista.forEach(function (n) {
    var nome = String(n || '').replace(/[\r\n\t,]+/g, ' ').replace(/[=+@<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
    if (nome && out.length < 6) out.push(nome);
  });
  return out;
}

function separarNomes_(texto) {
  return String(texto || '').split(',').map(function (n) { return n.trim(); }).filter(function (n) { return n; });
}

function numero_(v, min, max) {
  v = Math.round(Number(v));
  if (!isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

/* ======================= SEGURANÇA ======================= */

function verificarBloqueio_(chave) {
  var n = Number(CacheService.getScriptCache().get(chave) || 0);
  if (n >= MAX_TENTATIVAS) throw new Error('Muitas tentativas erradas. Esperem 10 minutos ou peçam ajuda ao professor.');
}
function registrarFalha_(chave) {
  var cache = CacheService.getScriptCache();
  cache.put(chave, String(Number(cache.get(chave) || 0) + 1), BLOQUEIO_SEGUNDOS);
}
function limparFalhas_(chave) {
  CacheService.getScriptCache().remove(chave);
}

function hash_(texto) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(texto), Utilities.Charset.UTF_8);
  return bytes.map(function (b) { var v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? '0' + v : v; }).join('');
}

/* ======================= PLANILHA ======================= */

function aba_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PLANILHA_ID');
  var ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(NOME_PLANILHA);
    props.setProperty('PLANILHA_ID', ss.getId());
  }
  var sheet = ss.getSheetByName('Grupos');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Grupos');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUNAS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function linhas_(sheet) {
  var valores = sheet.getDataRange().getValues();
  if (valores.length < 2) return [];
  var cab = valores[0];
  var out = [];
  for (var i = 1; i < valores.length; i++) {
    var dados = {};
    for (var j = 0; j < cab.length; j++) dados[cab[j]] = valores[i][j];
    if (String(dados['Código']) === '') continue;
    dados['Turma'] = String(dados['Turma']).toUpperCase().replace(/[^0-9A-Z]/g, '');
    out.push({ linha: i + 1, dados: dados, cab: cab });
  }
  return out;
}

function buscar_(codigo) {
  if (!/^\d{3,6}$/.test(codigo)) return null;
  var lista = linhas_(aba_());
  for (var i = 0; i < lista.length; i++) if (String(lista[i].dados['Código']) === codigo) return lista[i];
  return null;
}

function gravar_(reg) {
  var linha = reg.cab.map(function (c) { return reg.dados[c] === undefined ? '' : reg.dados[c]; });
  aba_().getRange(reg.linha, 1, 1, linha.length).setValues([linha]);
}

/* ======================= AUXILIARES ======================= */

function lerJson_(texto) {
  if (!texto) return null;
  try { return JSON.parse(texto); } catch (err) { return null; }
}

function agora_() {
  return Utilities.formatDate(new Date(), FUSO, 'dd/MM/yyyy HH:mm');
}

function textoData_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, FUSO, 'dd/MM/yyyy HH:mm');
  return v ? String(v) : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
