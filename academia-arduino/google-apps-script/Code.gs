/**
 * ACADEMIA DE ARDUINO — servidor da turma (Google Apps Script)
 *
 * Guarda, numa planilha do SEU Google Drive, os estudantes da turma Robótica e o progresso de cada um.
 *  - O professor cadastra os estudantes pelo site (Espaço do professor → Turma Robótica).
 *  - Cada estudante recebe um NÚMERO de acesso e uma SENHA para continuar de qualquer computador.
 *  - As senhas NÃO ficam escritas na planilha: só um "resumo" (hash) que não pode ser revertido.
 *
 * Como instalar: veja o arquivo LEIA-ME.md desta pasta.
 */

/* ======================= CONFIGURAÇÃO ======================= */

/**
 * TROQUE pela senha que você vai usar no Espaço do professor.
 * Use pelo menos 8 caracteres e não conte aos estudantes.
 */
var SENHA_DO_PROFESSOR = 'troque-esta-senha';

var TURMA = 'Robótica';
var NOME_PLANILHA = 'Academia de Arduino - Turma Robótica';
var APP_ID = 'academia-arduino';
var FUSO = 'America/Sao_Paulo';
var MAX_TENTATIVAS = 8;          // erros seguidos antes de bloquear
var BLOQUEIO_SEGUNDOS = 600;     // 10 minutos
var MAX_TEXTO = 45000;           // limite seguro de uma célula da planilha
var TOTAL_MISSOES = 20;

var COLUNAS = [
  'Número', 'Nome', 'Turma', 'Cadastrado em', 'Último acesso', 'XP', 'Missões concluídas', 'Missão atual', 'Conquistas',
  'Hash da senha', 'Sal', 'Hash da sessão', 'Progresso (não editar)', 'Trabalhos (não editar)', 'Atualizado em (ms)',
];

var PALAVRAS = [
  'gato', 'pato', 'sapo', 'lobo', 'urso', 'leao', 'tigre', 'peixe', 'bola', 'dado', 'lua', 'sol', 'mar', 'rio', 'flor',
  'robo', 'chip', 'led', 'fio', 'pilha', 'raio', 'onda', 'nuvem', 'vento', 'pipa', 'trem', 'barco', 'foguete', 'pinho',
  'caju', 'manga', 'uva', 'kiwi', 'coco', 'mel', 'neve', 'gelo', 'azul', 'verde', 'roxo',
];

/* ======================= INSTALAÇÃO ======================= */

/** Rode esta função uma vez no editor para autorizar e criar a planilha da turma. */
function configurar() {
  verificarSenhaConfigurada_();
  var sheet = aba_();
  Logger.log('Planilha da turma: ' + sheet.getParent().getUrl());
  Logger.log('Tudo pronto! Agora faça a implantação como App da Web (veja o LEIA-ME).');
}

/** Abrir o endereço do app no navegador mostra se o servidor está funcionando. */
function doGet() {
  return json_({ ok: true, app: APP_ID, mensagem: 'Servidor da Academia de Arduino funcionando (turma ' + TURMA + ').' });
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
    case 'entrar': return entrar_(p);
    case 'salvar': return salvar_(p);
    case 'carregar': return carregar_(p);
    case 'sair': return sair_(p);
    case 'prof-entrar': exigirProfessor_(p); return { ok: true, turma: TURMA };
    case 'prof-listar': exigirProfessor_(p); return listar_();
    case 'prof-cadastrar': exigirProfessor_(p); return cadastrar_(p.nomes);
    case 'prof-nova-senha': exigirProfessor_(p); return novaSenha_(p.numero);
    case 'prof-remover': exigirProfessor_(p); return remover_(p.numero);
    case 'prof-renomear': exigirProfessor_(p); return renomear_(p.numero, p.nome);
  }
  throw new Error('Ação desconhecida.');
}

/** Estudante: número + senha → devolve o progresso guardado e uma chave de sessão. */
function entrar_(p) {
  var numero = String(p.numero || '').trim();
  var chave = 'falhas:' + numero;
  verificarBloqueio_(chave);
  var reg = buscar_(numero);
  if (!reg || hash_(reg.dados['Sal'] + String(p.senha || '').trim().toLowerCase()) !== reg.dados['Hash da senha']) {
    registrarFalha_(chave);
    throw new Error('Número ou senha incorretos. Confira e tente de novo.');
  }
  limparFalhas_(chave);
  var token = Utilities.getUuid();
  reg.dados['Hash da sessão'] = hash_(token);
  reg.dados['Último acesso'] = agora_();
  gravar_(reg);
  return {
    ok: true,
    numero: numero,
    nome: reg.dados['Nome'],
    turma: reg.dados['Turma'],
    token: token,
    progresso: lerJson_(reg.dados['Progresso (não editar)']),
    trabalhos: lerJson_(reg.dados['Trabalhos (não editar)']),
    atualizadoEm: Number(reg.dados['Atualizado em (ms)']) || 0,
  };
}

/** Estudante: devolve o progresso salvo (para continuar em outro aparelho sem digitar a senha de novo). */
function carregar_(p) {
  var reg = sessao_(p);
  return {
    ok: true,
    nome: reg.dados['Nome'],
    progresso: lerJson_(reg.dados['Progresso (não editar)']),
    trabalhos: lerJson_(reg.dados['Trabalhos (não editar)']),
    atualizadoEm: Number(reg.dados['Atualizado em (ms)']) || 0,
  };
}

/** Estudante: grava o progresso (precisa da chave de sessão recebida ao entrar). */
function salvar_(p) {
  var reg = sessao_(p);
  var progresso = p.progresso || {};
  var textoProgresso = JSON.stringify(progresso);
  if (textoProgresso.length > MAX_TEXTO) throw new Error('O progresso ficou grande demais para salvar.');
  var trabalhos = p.trabalhos || {};
  var textoTrabalhos = JSON.stringify(trabalhos);
  var trabalhosCortados = false;
  if (textoTrabalhos.length > MAX_TEXTO) {
    // guarda só o que couber, começando pelos itens menores
    var chaves = Object.keys(trabalhos).sort(function (a, b) { return String(trabalhos[a]).length - String(trabalhos[b]).length; });
    var parcial = {};
    for (var i = 0; i < chaves.length; i++) {
      parcial[chaves[i]] = trabalhos[chaves[i]];
      if (JSON.stringify(parcial).length > MAX_TEXTO) { delete parcial[chaves[i]]; trabalhosCortados = true; }
    }
    textoTrabalhos = JSON.stringify(parcial);
  }
  var resumo = resumir_(progresso);
  reg.dados['Progresso (não editar)'] = textoProgresso;
  reg.dados['Trabalhos (não editar)'] = textoTrabalhos;
  reg.dados['XP'] = resumo.xp;
  reg.dados['Missões concluídas'] = resumo.concluidas;
  reg.dados['Missão atual'] = resumo.atual;
  reg.dados['Conquistas'] = resumo.conquistas;
  reg.dados['Último acesso'] = agora_();
  reg.dados['Atualizado em (ms)'] = Number(p.atualizadoEm) || new Date().getTime();
  gravar_(reg);
  return { ok: true, trabalhosCortados: trabalhosCortados };
}

function sair_(p) {
  var reg = sessao_(p);
  reg.dados['Hash da sessão'] = '';
  gravar_(reg);
  return { ok: true };
}

function listar_() {
  var sheet = aba_();
  var lista = linhas_(sheet).map(function (reg) {
    var d = reg.dados;
    return {
      numero: String(d['Número']),
      nome: d['Nome'],
      turma: d['Turma'],
      cadastradoEm: textoData_(d['Cadastrado em']),
      ultimoAcesso: textoData_(d['Último acesso']),
      xp: Number(d['XP']) || 0,
      concluidas: Number(d['Missões concluídas']) || 0,
      atual: d['Missão atual'] || '',
      conquistas: Number(d['Conquistas']) || 0,
      progresso: lerJson_(d['Progresso (não editar)']),
    };
  });
  return { ok: true, turma: TURMA, planilha: sheet.getParent().getUrl(), estudantes: lista };
}

function cadastrar_(nomes) {
  if (!nomes || !nomes.length) throw new Error('Escreva pelo menos um nome.');
  if (nomes.length > 60) throw new Error('Cadastre no máximo 60 estudantes de cada vez.');
  var sheet = aba_();
  var existentes = linhas_(sheet);
  var proximo = 1001;
  existentes.forEach(function (r) { proximo = Math.max(proximo, (Number(r.dados['Número']) || 0) + 1); });
  var criados = [];
  nomes.forEach(function (bruto) {
    var nome = limparNome_(bruto);
    if (!nome) return;
    var senha = gerarSenha_();
    var sal = Utilities.getUuid();
    var dados = {};
    COLUNAS.forEach(function (c) { dados[c] = ''; });
    dados['Número'] = String(proximo);
    dados['Nome'] = nome;
    dados['Turma'] = TURMA;
    dados['Cadastrado em'] = agora_();
    dados['XP'] = 0;
    dados['Missões concluídas'] = 0;
    dados['Conquistas'] = 0;
    dados['Missão atual'] = 'Missão 01';
    dados['Hash da senha'] = hash_(sal + senha);
    dados['Sal'] = sal;
    sheet.appendRow(COLUNAS.map(function (c) { return dados[c]; }));
    criados.push({ numero: String(proximo), nome: nome, senha: senha });
    proximo++;
  });
  if (!criados.length) throw new Error('Nenhum nome válido.');
  return { ok: true, criados: criados };
}

function novaSenha_(numero) {
  var reg = buscar_(String(numero || ''));
  if (!reg) throw new Error('Estudante não encontrado.');
  var senha = gerarSenha_();
  var sal = Utilities.getUuid();
  reg.dados['Sal'] = sal;
  reg.dados['Hash da senha'] = hash_(sal + senha);
  reg.dados['Hash da sessão'] = '';
  gravar_(reg);
  limparFalhas_('falhas:' + reg.dados['Número']);
  return { ok: true, numero: String(reg.dados['Número']), nome: reg.dados['Nome'], senha: senha };
}

function remover_(numero) {
  var reg = buscar_(String(numero || ''));
  if (!reg) throw new Error('Estudante não encontrado.');
  aba_().deleteRow(reg.linha);
  return { ok: true };
}

function renomear_(numero, nome) {
  var reg = buscar_(String(numero || ''));
  if (!reg) throw new Error('Estudante não encontrado.');
  var limpo = limparNome_(nome);
  if (!limpo) throw new Error('Nome inválido.');
  reg.dados['Nome'] = limpo;
  gravar_(reg);
  return { ok: true };
}

/* ======================= SEGURANÇA ======================= */

function verificarSenhaConfigurada_() {
  if (!SENHA_DO_PROFESSOR || SENHA_DO_PROFESSOR === 'troque-esta-senha' || String(SENHA_DO_PROFESSOR).length < 8) {
    throw new Error('Troque a SENHA_DO_PROFESSOR no início do código (pelo menos 8 caracteres) e salve antes de continuar.');
  }
}

function exigirProfessor_(p) {
  verificarSenhaConfigurada_();
  var chave = 'falhas:professor';
  verificarBloqueio_(chave);
  if (String(p.senhaProfessor || '') !== String(SENHA_DO_PROFESSOR)) {
    registrarFalha_(chave);
    throw new Error('Senha do professor incorreta.');
  }
  limparFalhas_(chave);
}

function sessao_(p) {
  var reg = buscar_(String(p.numero || '').trim());
  if (!reg || !p.token || !reg.dados['Hash da sessão'] || hash_(String(p.token)) !== reg.dados['Hash da sessão']) {
    throw new Error('SESSAO_EXPIRADA');
  }
  return reg;
}

function verificarBloqueio_(chave) {
  var n = Number(CacheService.getScriptCache().get(chave) || 0);
  if (n >= MAX_TENTATIVAS) throw new Error('Muitas tentativas erradas. Espere 10 minutos e tente de novo.');
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

function gerarSenha_() {
  var palavra = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
  var num = String(Math.floor(Math.random() * 900) + 100);
  return palavra + num;
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
  var sheet = ss.getSheetByName('Estudantes');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Estudantes');
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
    if (String(dados['Número']) === '') continue;
    out.push({ linha: i + 1, dados: dados, cab: cab });
  }
  return out;
}

function buscar_(numero) {
  if (!/^\d{3,6}$/.test(numero)) return null;
  var lista = linhas_(aba_());
  for (var i = 0; i < lista.length; i++) if (String(lista[i].dados['Número']) === numero) return lista[i];
  return null;
}

function gravar_(reg) {
  var linha = reg.cab.map(function (c) { return reg.dados[c] === undefined ? '' : reg.dados[c]; });
  aba_().getRange(reg.linha, 1, 1, linha.length).setValues([linha]);
}

/* ======================= AUXILIARES ======================= */

function resumir_(p) {
  var missoes = (p && p.missions) || {};
  var concluidas = 0;
  var atual = '';
  for (var n = 1; n <= TOTAL_MISSOES; n++) {
    if (missoes['m' + n] && missoes['m' + n].done) concluidas++;
    else if (!atual) atual = 'Missão ' + (n < 10 ? '0' + n : n);
  }
  return {
    xp: Number(p && p.xp) || 0,
    concluidas: concluidas,
    atual: atual || 'Todas concluídas',
    conquistas: p && p.badges ? p.badges.length : 0,
  };
}

function limparNome_(nome) {
  return String(nome || '').replace(/[\r\n\t]+/g, ' ').replace(/[=+@]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

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
