/**
 * TREINANDO UMA IA SEM PRECONCEITOS — servidor das duplas (Google Apps Script)
 *
 * Guarda, numa planilha do SEU Google Drive, as duplas de cada turma e o progresso de cada uma,
 * para que os estudantes continuem de onde pararam em outra aula, em qualquer computador ou tablet.
 *  - A dupla escolhe a turma, escreve o nome (apelido) da dupla e cria uma senha de 4 números.
 *  - A senha aparece na planilha para o professor ajudar quem esquecer.
 *
 * Como instalar: veja o arquivo LEIA-ME.md desta pasta.
 */

/* ======================= CONFIGURAÇÃO ======================= */

var TURMAS = ['8A', '8B', '8C', '9A', '9B', '9C', '9D'];   // turmas que aparecem no jogo
var NOME_PLANILHA = 'IA sem preconceitos - Duplas';
var APP_ID = 'nexuslab-ia-justa';
var FUSO = 'America/Sao_Paulo';
var MAX_DUPLAS_POR_TURMA = 40;
var MAX_TENTATIVAS = 8;          // erros seguidos de senha antes de bloquear a dupla
var BLOQUEIO_SEGUNDOS = 600;     // 10 minutos
var MAX_TEXTO = 45000;           // limite seguro de uma célula da planilha

var COLUNAS = [
  'Código', 'Turma', 'Dupla', 'Senha', 'Criado em', 'Último acesso',
  'XP', 'Nível', 'Progresso (%)', 'Missões concluídas', 'Missão atual', 'Medalhas',
  'Erros corrigidos', 'Dicas usadas', 'Tempo de jogo (min)', 'Conceito final', 'Justificativa final',
  'Estado (não editar)', 'Hash da sessão', 'Atualizado em (ms)',
];

/* ======================= INSTALAÇÃO ======================= */

/** Rode esta função uma vez no editor para autorizar e criar a planilha. */
function configurar() {
  var sheet = aba_();
  Logger.log('Planilha das duplas: ' + sheet.getParent().getUrl());
  Logger.log('Tudo pronto! Agora faça a implantação como App da Web (veja o LEIA-ME).');
}

/** Abrir o endereço do app no navegador mostra se o servidor está funcionando. */
function doGet() {
  return json_({ ok: true, app: APP_ID, turmas: TURMAS, mensagem: 'Servidor do jogo Treinando uma IA sem preconceitos funcionando.' });
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

/** Lista as duplas de uma turma (para a dupla tocar no próprio nome). */
function turma_(p) {
  var turma = turmaValida_(p.turma);
  var duplas = linhas_(aba_()).filter(function (reg) { return reg.dados['Turma'] === turma; }).map(function (reg) {
    var d = reg.dados;
    return {
      codigo: String(d['Código']),
      nome: String(d['Dupla']),
      xp: Number(d['XP']) || 0,
      progresso: Number(d['Progresso (%)']) || 0,
      missoes: String(d['Missões concluídas'] || ''),
      ultimoAcesso: textoData_(d['Último acesso']),
    };
  });
  duplas.sort(function (a, b) { return a.nome.localeCompare(b.nome); });
  return { ok: true, turma: turma, duplas: duplas };
}

/** Cria uma dupla nova. Devolve o código da dupla e a chave de sessão. */
function criar_(p) {
  var turma = turmaValida_(p.turma);
  var nome = nomeValido_(p.nome);
  var senha = senhaValida_(p.senha);
  var sheet = aba_();
  var todos = linhas_(sheet);
  var daTurma = todos.filter(function (r) { return r.dados['Turma'] === turma; });
  for (var i = 0; i < daTurma.length; i++) {
    if (String(daTurma[i].dados['Dupla']).toLowerCase() === nome.toLowerCase()) {
      // mesma dupla tocando duas vezes (ou reenviando sem internet): entra de novo
      if (senhaTexto_(daTurma[i].dados['Senha']) === senha) return sessaoNova_(daTurma[i], p);
      throw new Error('NOME_EM_USO');
    }
  }
  if (daTurma.length >= MAX_DUPLAS_POR_TURMA) throw new Error('A turma já tem duplas demais. Peça ajuda ao professor.');
  var proximo = 101;
  todos.forEach(function (r) { proximo = Math.max(proximo, (Number(r.dados['Código']) || 0) + 1); });
  var token = Utilities.getUuid();
  var dados = {};
  COLUNAS.forEach(function (c) { dados[c] = ''; });
  dados['Código'] = String(proximo);
  dados['Turma'] = turma;
  dados['Dupla'] = nome;
  dados['Senha'] = "'" + senha; // apóstrofo: a planilha mantém os zeros à esquerda
  dados['Criado em'] = agora_();
  dados['Último acesso'] = agora_();
  dados['Hash da sessão'] = hash_(token);
  aplicar_(dados, p);
  sheet.appendRow(COLUNAS.map(function (c) { return dados[c]; }));
  return { ok: true, codigo: String(proximo), token: token, turma: turma, nome: nome, estado: null, atualizadoEm: 0 };
}

/** Entra numa dupla: código + senha → progresso salvo + chave de sessão. */
function entrar_(p) {
  var codigo = String(p.codigo || '').trim();
  var chave = 'falhas:' + codigo;
  verificarBloqueio_(chave);
  var reg = buscar_(codigo);
  var senha = '';
  try { senha = senhaValida_(p.senha); } catch (err) { senha = ''; }
  if (!reg || !senha || senhaTexto_(reg.dados['Senha']) !== senha) {
    registrarFalha_(chave);
    throw new Error('Senha errada. Confiram os 4 números e tentem de novo.');
  }
  limparFalhas_(chave);
  return sessaoNova_(reg, null);
}

function sessaoNova_(reg, p) {
  var token = Utilities.getUuid();
  reg.dados['Hash da sessão'] = hash_(token);
  reg.dados['Último acesso'] = agora_();
  if (p && p.estado && (Number(p.atualizadoEm) || 0) > (Number(reg.dados['Atualizado em (ms)']) || 0)) aplicar_(reg.dados, p);
  gravar_(reg);
  return {
    ok: true,
    codigo: String(reg.dados['Código']),
    turma: reg.dados['Turma'],
    nome: String(reg.dados['Dupla']),
    token: token,
    estado: lerJson_(reg.dados['Estado (não editar)']),
    atualizadoEm: Number(reg.dados['Atualizado em (ms)']) || 0,
  };
}

/** Grava o progresso da dupla (precisa da chave de sessão recebida ao entrar ou criar). */
function salvar_(p) {
  var reg = buscar_(String(p.codigo || '').trim());
  if (!reg || !p.token || !reg.dados['Hash da sessão'] || hash_(String(p.token)) !== reg.dados['Hash da sessão']) {
    throw new Error('SESSAO_EXPIRADA');
  }
  aplicar_(reg.dados, p);
  reg.dados['Último acesso'] = agora_();
  gravar_(reg);
  return { ok: true };
}

/* Copia o estado do jogo e o resumo (colunas que o professor lê) para a linha. */
function aplicar_(dados, p) {
  if (p.estado && typeof p.estado === 'object') {
    var texto = JSON.stringify(p.estado);
    if (texto.length > MAX_TEXTO) throw new Error('O progresso ficou grande demais para salvar.');
    dados['Estado (não editar)'] = texto;
  }
  var r = p.resumo || {};
  dados['XP'] = numero_(r.xp, 0, 99999);
  dados['Nível'] = texto_(r.nivel, 60);
  dados['Progresso (%)'] = numero_(r.progresso, 0, 100);
  dados['Missões concluídas'] = texto_(r.missoes, 10);
  dados['Missão atual'] = texto_(r.missaoAtual, 80);
  dados['Medalhas'] = texto_(r.medalhas, 120);
  dados['Erros corrigidos'] = numero_(r.erros, 0, 9999);
  dados['Dicas usadas'] = numero_(r.dicas, 0, 9999);
  dados['Tempo de jogo (min)'] = numero_(r.minutos, 0, 99999);
  dados['Conceito final'] = texto_(r.conceito, 40);
  dados['Justificativa final'] = texto_(r.justificativa, 1200);
  dados['Atualizado em (ms)'] = Number(p.atualizadoEm) || new Date().getTime();
}

/* ======================= VALIDAÇÃO ======================= */

function turmaValida_(t) {
  var turma = String(t || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (TURMAS.indexOf(turma) < 0) throw new Error('Turma inválida.');
  return turma;
}

function nomeValido_(n) {
  var nome = String(n || '').replace(/[\r\n\t]+/g, ' ').replace(/[=+@<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  if (nome.length < 2) throw new Error('Escrevam o nome da dupla.');
  return nome;
}

function senhaValida_(s) {
  var senha = String(s || '').replace(/\D/g, '');
  if (senha.length !== 4) throw new Error('A senha precisa ter 4 números.');
  return senha;
}

function senhaTexto_(v) {
  var t = String(v == null ? '' : v).replace(/\D/g, '');
  while (t.length < 4) t = '0' + t; // caso a planilha tenha transformado "0123" em 123
  return t;
}

function texto_(v, max) {
  return v == null ? '' : String(v).replace(/^[=+@\-]+/, '').slice(0, max);
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
  var sheet = ss.getSheetByName('Duplas');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Duplas');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUNAS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
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
  if (/^\d+$/.test(String(reg.dados['Senha']))) reg.dados['Senha'] = "'" + senhaTexto_(reg.dados['Senha']);
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
