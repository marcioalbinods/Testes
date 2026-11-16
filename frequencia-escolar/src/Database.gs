/**
 * Database.gs — Camada de acesso ao Google Sheets (banco de dados).
 *
 * Princípios:
 *  - Leitura em lote (getValues) e escrita em lote (setValues), nunca célula a célula em loops.
 *  - Colunas localizadas pelo NOME do cabeçalho (robusto se novas colunas forem adicionadas).
 *  - Datas/IDs gravados como TEXTO (formato "@"), evitando conversões automáticas de fuso.
 *  - Tabelas pequenas (configurações, professores, turmas, estudantes) em CacheService.
 *  - Toda gravação ocorre dentro de comLock_() (LockService).
 */

var PROP_PLANILHA = 'SPREADSHEET_ID';
var PROP_INSTALADOR = 'INSTALADOR_EMAIL';
var NOME_PLANILHA = 'FREQUÊNCIA ESCOLAR — Banco de Dados';
var CACHE_TTL_SEG = 300;

/** Estrutura das abas. "numericas" são gravadas como número; as demais como texto. */
var TABELAS = {
  CONFIGURACOES: {
    colunas: ['CHAVE', 'VALOR', 'DESCRICAO', 'ATUALIZADO_EM', 'ATUALIZADO_POR'],
    numericas: [], cache: true, chave: 'CHAVE'
  },
  PROFESSORES: {
    colunas: ['ID', 'NOME', 'EMAIL', 'PERFIL', 'TURMAS', 'ATIVO', 'CRIADO_EM', 'CRIADO_POR', 'ATUALIZADO_EM', 'ATUALIZADO_POR'],
    numericas: [], cache: true, chave: 'ID'
  },
  TURMAS: {
    colunas: ['ID', 'NOME', 'ANO_SERIE', 'TURNO', 'ANO_LETIVO', 'DATA_INICIO', 'ATIVA', 'CRIADO_EM', 'CRIADO_POR', 'ATUALIZADO_EM', 'ATUALIZADO_POR'],
    numericas: [], cache: true, chave: 'ID'
  },
  ESTUDANTES: {
    colunas: ['ID', 'TURMA_ID', 'NUMERO', 'NOME', 'SITUACAO', 'DATA_ENTRADA', 'DATA_SAIDA', 'TURMA_ANTERIOR_ID',
      'NUMERO_ANTERIOR', 'DATA_TRANSFERENCIA', 'OBSERVACAO', 'CRIADO_EM', 'CRIADO_POR', 'ATUALIZADO_EM', 'ATUALIZADO_POR'],
    numericas: ['NUMERO', 'NUMERO_ANTERIOR'], cache: true, chave: 'ID'
  },
  CHAMADAS: {
    colunas: ['ID', 'TURMA_ID', 'DATA', 'PERIODO', 'STATUS', 'VERSAO', 'PROFESSOR_EMAIL', 'PROFESSOR_NOME',
      'TOTAL', 'PRESENTES', 'AUSENTES', 'ATRASADOS', 'JUSTIFICADOS', 'NAO_REGISTRADOS',
      'CRIADO_EM', 'CRIADO_POR', 'ATUALIZADO_EM', 'ATUALIZADO_POR', 'FINALIZADO_EM', 'FINALIZADO_POR', 'ULTIMA_OPERACAO'],
    numericas: ['VERSAO', 'TOTAL', 'PRESENTES', 'AUSENTES', 'ATRASADOS', 'JUSTIFICADOS', 'NAO_REGISTRADOS'],
    cache: false, chave: 'ID'
  },
  FREQUENCIAS: {
    colunas: ['ID', 'CHAMADA_ID', 'TURMA_ID', 'DATA', 'PERIODO', 'ESTUDANTE_ID', 'NUMERO', 'NOME_ESTUDANTE',
      'SITUACAO', 'OBSERVACAO', 'ATUALIZADO_EM', 'ATUALIZADO_POR'],
    numericas: ['NUMERO'], cache: false, chave: 'ID'
  },
  AUDITORIA: {
    colunas: ['ID', 'DATA_HORA', 'USUARIO', 'ACAO', 'ENTIDADE', 'REGISTRO_ID', 'ESTUDANTE', 'TURMA',
      'VALOR_ANTERIOR', 'VALOR_NOVO', 'MOTIVO', 'DETALHES'],
    numericas: [], cache: false, chave: 'ID'
  }
};
var ORDEM_TABELAS = ['CONFIGURACOES', 'PROFESSORES', 'TURMAS', 'ESTUDANTES', 'CHAMADAS', 'FREQUENCIAS', 'AUDITORIA'];

/** Colunas que guardam somente a data (yyyy-MM-dd). As demais datas guardam data e hora. */
var COLUNAS_DATA = { DATA: 1, DATA_INICIO: 1, DATA_ENTRADA: 1, DATA_SAIDA: 1, DATA_TRANSFERENCIA: 1 };

/** Memória da execução atual (evita reler a mesma aba várias vezes na mesma requisição). */
var _memo = { ss: null, abas: {}, cabecalhos: {}, tabelas: {} };

// ------------------------------------------------------------------ Planilha e abas

function idPlanilha_() {
  return PropertiesService.getScriptProperties().getProperty(PROP_PLANILHA) || '';
}

function sistemaInstalado_() {
  return !!idPlanilha_();
}

/** Abre a planilha principal (ID armazenado em Script Properties). */
function db_() {
  if (_memo.ss) return _memo.ss;
  var id = idPlanilha_();
  if (!id) throw appError_('NAO_INSTALADO', 'O sistema ainda não foi instalado. O administrador deve executar a função setupSistema() no editor do Apps Script.');
  try {
    _memo.ss = SpreadsheetApp.openById(id);
  } catch (e) {
    throw appError_('BANCO_INACESSIVEL', 'Não foi possível abrir a planilha do banco de dados. Verifique se ela não foi excluída e se o proprietário do sistema ainda tem acesso.');
  }
  return _memo.ss;
}

function aba_(nome) {
  if (_memo.abas[nome]) return _memo.abas[nome];
  var sh = db_().getSheetByName(nome);
  if (!sh) throw appError_('ESTRUTURA_INVALIDA', 'A aba "' + nome + '" não foi encontrada. O administrador deve executar setupSistema() para reparar a estrutura.');
  _memo.abas[nome] = sh;
  return sh;
}

/** Cabeçalho real da aba: mapa NOME_COLUNA -> índice (0-based). */
function cabecalho_(nome) {
  if (_memo.cabecalhos[nome]) return _memo.cabecalhos[nome];
  var sh = aba_(nome);
  var ultimaCol = Math.max(sh.getLastColumn(), 1);
  var linha = sh.getRange(1, 1, 1, ultimaCol).getValues()[0];
  var mapa = { _lista: [] };
  for (var i = 0; i < linha.length; i++) {
    var c = String(linha[i]).trim();
    if (c) { mapa[c] = i; }
    mapa._lista.push(c);
  }
  var faltando = TABELAS[nome].colunas.filter(function (col) { return mapa[col] === undefined; });
  if (faltando.length) {
    throw appError_('ESTRUTURA_INVALIDA', 'A aba "' + nome + '" está sem as colunas: ' + faltando.join(', ') + '. Execute setupSistema() para reparar.');
  }
  _memo.cabecalhos[nome] = mapa;
  return mapa;
}

// ------------------------------------------------------------------ Leitura

/** Converte o valor bruto de uma célula para o tipo usado no sistema. */
function valorDaPlanilha_(tabela, coluna, v) {
  if (TABELAS[tabela].numericas.indexOf(coluna) >= 0) {
    if (v === '' || v === null || v === undefined) return '';
    var n = Number(v);
    return isFinite(n) ? n : '';
  }
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return COLUNAS_DATA[coluna] ? paraDataIso_(v) : paraDataHora_(v);
  }
  if (v === null || v === undefined) return '';
  return String(v);
}

/**
 * Lê uma tabela inteira em UMA chamada getValues().
 * Retorna lista de objetos; cada objeto tem _linha (número da linha na planilha).
 * opcoes.fresco = true ignora o cache (obrigatório antes de gravar).
 */
function lerTabela_(nome, opcoes) {
  opcoes = opcoes || {};
  if (!opcoes.fresco && _memo.tabelas[nome]) return _memo.tabelas[nome];

  var def = TABELAS[nome];
  var chaveCache = 'tbl_v2_' + nome;
  if (!opcoes.fresco && def.cache) {
    var emCache = lerCache_(chaveCache);
    if (emCache) { _memo.tabelas[nome] = emCache; return emCache; }
  }

  var sh = aba_(nome);
  var cab = cabecalho_(nome);
  var ultimaLinha = sh.getLastRow();
  var lista = [];
  if (ultimaLinha >= 2) {
    var valores = sh.getRange(2, 1, ultimaLinha - 1, cab._lista.length).getValues();
    lista = linhasParaObjetos_(nome, cab, valores, 2);
  }
  _memo.tabelas[nome] = lista;
  if (def.cache) gravarCache_(chaveCache, lista);
  return lista;
}

function linhasParaObjetos_(nome, cab, valores, primeiraLinha) {
  var cols = TABELAS[nome].colunas;
  var lista = [];
  for (var i = 0; i < valores.length; i++) {
    var linha = valores[i];
    var idx0 = cab[cols[0]];
    if (linha[idx0] === '' || linha[idx0] === null) continue; // linha vazia
    var o = { _linha: primeiraLinha + i };
    for (var c = 0; c < cols.length; c++) {
      o[cols[c]] = valorDaPlanilha_(nome, cols[c], linha[cab[cols[c]]]);
    }
    lista.push(o);
  }
  return lista;
}

/**
 * Lê somente as linhas cuja coluna tem exatamente o valor informado,
 * usando TextFinder (evita carregar a aba inteira quando ela cresce).
 */
function lerLinhasPorValor_(nome, coluna, valor) {
  var sh = aba_(nome);
  var cab = cabecalho_(nome);
  var ultimaLinha = sh.getLastRow();
  if (ultimaLinha < 2 || !valor) return [];
  var col = cab[coluna] + 1;
  var achados = sh.getRange(2, col, ultimaLinha - 1, 1)
    .createTextFinder(String(valor)).matchEntireCell(true).matchCase(true).findAll();
  if (!achados.length) return [];
  var linhas = achados.map(function (r) { return r.getRow(); }).sort(function (a, b) { return a - b; });
  // Agrupa linhas próximas em blocos para ler com poucas chamadas getValues().
  var resultado = [];
  var blocos = agruparEmBlocos_(linhas, 50);
  for (var b = 0; b < blocos.length; b++) {
    var ini = blocos[b][0], fim = blocos[b][1];
    var valores = sh.getRange(ini, 1, fim - ini + 1, cab._lista.length).getValues();
    var objs = linhasParaObjetos_(nome, cab, valores, ini);
    for (var i = 0; i < objs.length; i++) {
      if (String(objs[i][coluna]) === String(valor)) resultado.push(objs[i]);
    }
  }
  return resultado;
}

/** Agrupa números de linha ordenados em intervalos [ini, fim], unindo lacunas até "folga". */
function agruparEmBlocos_(linhas, folga) {
  var blocos = [];
  for (var i = 0; i < linhas.length; i++) {
    var l = linhas[i];
    var ult = blocos[blocos.length - 1];
    if (ult && l - ult[1] <= folga) ult[1] = l;
    else blocos.push([l, l]);
  }
  return blocos;
}

// ------------------------------------------------------------------ Escrita

function valorParaPlanilha_(tabela, coluna, v) {
  if (v === null || v === undefined) return '';
  if (TABELAS[tabela].numericas.indexOf(coluna) >= 0) {
    if (v === '') return '';
    var n = Number(v);
    return isFinite(n) ? n : '';
  }
  return String(v);
}

function linhaDeValores_(nome, cab, obj) {
  var linha = [];
  for (var i = 0; i < cab._lista.length; i++) {
    var col = cab._lista[i];
    linha.push(TABELAS[nome].colunas.indexOf(col) >= 0 ? valorParaPlanilha_(nome, col, obj[col]) : (obj[col] === undefined ? '' : obj[col]));
  }
  return linha;
}

function formatosDaLinha_(nome, cab) {
  return cab._lista.map(function (col) {
    return TABELAS[nome].numericas.indexOf(col) >= 0 ? '0' : '@';
  });
}

function garantirCapacidade_(sh, ultimaLinhaNecessaria) {
  var max = sh.getMaxRows();
  if (ultimaLinhaNecessaria > max) {
    sh.insertRowsAfter(max, ultimaLinhaNecessaria - max + 200);
  }
}

/** Insere vários registros de uma vez (um único setValues). */
function inserirRegistros_(nome, objetos) {
  if (!objetos || !objetos.length) return;
  var sh = aba_(nome);
  var cab = cabecalho_(nome);
  var valores = objetos.map(function (o) { return linhaDeValores_(nome, cab, o); });
  var formatoLinha = formatosDaLinha_(nome, cab);
  var formatos = valores.map(function () { return formatoLinha; });
  var inicio = sh.getLastRow() + 1;
  garantirCapacidade_(sh, inicio + valores.length - 1);
  sh.getRange(inicio, 1, valores.length, cab._lista.length).setNumberFormats(formatos).setValues(valores);
  for (var i = 0; i < objetos.length; i++) objetos[i]._linha = inicio + i;
  invalidarTabela_(nome);
}

/**
 * Atualiza registros existentes (cada objeto precisa de _linha).
 * Linhas consecutivas são gravadas num único setValues.
 * Antes de gravar, confere se o ID na linha ainda é o esperado (proteção contra
 * edições manuais na planilha que tenham deslocado linhas).
 */
function atualizarRegistros_(nome, objetos) {
  if (!objetos || !objetos.length) return;
  var sh = aba_(nome);
  var cab = cabecalho_(nome);
  var chave = TABELAS[nome].chave;
  var ordenados = objetos.slice().sort(function (a, b) { return a._linha - b._linha; });
  var blocos = [];
  for (var i = 0; i < ordenados.length; i++) {
    var o = ordenados[i];
    if (!o._linha || o._linha < 2) throw new Error('Registro sem linha definida em ' + nome);
    var ult = blocos[blocos.length - 1];
    if (ult && o._linha === ult.fim + 1) { ult.itens.push(o); ult.fim = o._linha; }
    else blocos.push({ ini: o._linha, fim: o._linha, itens: [o] });
  }
  var formatoLinha = formatosDaLinha_(nome, cab);
  var colChave = cab[chave] + 1;
  for (var b = 0; b < blocos.length; b++) {
    var bl = blocos[b];
    var ids = sh.getRange(bl.ini, colChave, bl.itens.length, 1).getValues();
    for (var k = 0; k < bl.itens.length; k++) {
      if (String(ids[k][0]) !== String(bl.itens[k][chave])) {
        throw appError_('CONFLITO', 'A planilha foi alterada durante a operação. Recarregue a página e tente novamente.');
      }
    }
    var valores = bl.itens.map(function (x) { return linhaDeValores_(nome, cab, x); });
    var formatos = valores.map(function () { return formatoLinha; });
    sh.getRange(bl.ini, 1, valores.length, cab._lista.length).setNumberFormats(formatos).setValues(valores);
  }
  invalidarTabela_(nome);
}

// ------------------------------------------------------------------ Cache

function lerCache_(chave) {
  try {
    var s = CacheService.getScriptCache().get(chave);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

function gravarCache_(chave, valor) {
  try {
    var s = JSON.stringify(valor);
    if (s.length < 95000) CacheService.getScriptCache().put(chave, s, CACHE_TTL_SEG);
  } catch (e) {
    // Cache é apenas otimização: falhas são ignoradas.
  }
}

function invalidarTabela_(nome) {
  delete _memo.tabelas[nome];
  if (TABELAS[nome] && TABELAS[nome].cache) {
    try { CacheService.getScriptCache().remove('tbl_v2_' + nome); } catch (e) { /* ignorar */ }
  }
}

function limparTodoCache_() {
  ORDEM_TABELAS.forEach(invalidarTabela_);
  _memo.cabecalhos = {};
}

// ------------------------------------------------------------------ Concorrência

/**
 * Executa fn com bloqueio global do script (LockService), protegendo gravações
 * simultâneas. Aguarda até 25 s; se não conseguir, retorna erro "OCUPADO"
 * (o aplicativo tenta novamente automaticamente).
 */
function comLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) {
    throw appError_('OCUPADO', 'O sistema está processando outra gravação neste momento.');
  }
  try {
    var r = fn();
    SpreadsheetApp.flush();
    return r;
  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------------ Configurações

/** Mapa CHAVE -> VALOR da aba CONFIGURACOES. */
function config_() {
  var lista = lerTabela_('CONFIGURACOES');
  var m = {};
  for (var i = 0; i < lista.length; i++) m[lista[i].CHAVE] = lista[i].VALOR;
  return m;
}

function configNum_(cfg, chave, padrao) {
  var n = Number(String(cfg[chave] === undefined ? '' : cfg[chave]).replace(',', '.'));
  return cfg[chave] === undefined || cfg[chave] === '' || !isFinite(n) ? padrao : n;
}

/** Grava (cria ou atualiza) várias chaves de configuração. Deve ser chamada dentro de comLock_. */
function gravarConfiguracoes_(pares, usuarioEmail, descricoes) {
  var lista = lerTabela_('CONFIGURACOES', { fresco: true });
  var porChave = indexarPor_(lista, 'CHAVE');
  var novos = [], alterados = [];
  Object.keys(pares).forEach(function (k) {
    var v = String(pares[k]);
    if (porChave[k]) {
      if (String(porChave[k].VALOR) !== v) {
        porChave[k].VALOR = v;
        porChave[k].ATUALIZADO_EM = agora_();
        porChave[k].ATUALIZADO_POR = usuarioEmail;
        alterados.push(porChave[k]);
      }
    } else {
      novos.push({ CHAVE: k, VALOR: v, DESCRICAO: (descricoes && descricoes[k]) || '', ATUALIZADO_EM: agora_(), ATUALIZADO_POR: usuarioEmail });
    }
  });
  atualizarRegistros_('CONFIGURACOES', alterados);
  inserirRegistros_('CONFIGURACOES', novos);
}

/** Remove o campo interno _linha antes de enviar dados ao navegador. */
function semLinha_(o) {
  var r = {};
  for (var k in o) if (k !== '_linha') r[k] = o[k];
  return r;
}
