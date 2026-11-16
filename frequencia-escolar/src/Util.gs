/**
 * Util.gs — Funções utilitárias compartilhadas (datas, textos, validação, IDs e erros).
 *
 * Convenção do projeto: funções terminadas em "_" são PRIVADAS. O Apps Script
 * não permite que o navegador (google.script.run) chame funções privadas.
 */

var TZ = 'America/Sao_Paulo';

/** Situações possíveis de um estudante numa chamada. */
var SITUACAO = {
  PRESENTE: 'PRESENTE',
  AUSENTE: 'AUSENTE',
  ATRASADO: 'ATRASADO',
  JUSTIFICADA: 'JUSTIFICADA',
  NAO_REGISTRADO: 'NAO_REGISTRADO'
};
var SITUACOES_VALIDAS = ['PRESENTE', 'AUSENTE', 'ATRASADO', 'JUSTIFICADA', 'NAO_REGISTRADO'];
var ROTULO_SITUACAO = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  ATRASADO: 'Atrasado',
  JUSTIFICADA: 'Falta justificada',
  NAO_REGISTRADO: 'Não registrado'
};

// ------------------------------------------------------------------ Erros

/**
 * Cria um erro "amigável": a mensagem será exibida ao usuário.
 * Erros não amigáveis são registrados no log e substituídos por mensagem genérica.
 */
function appError_(codigo, mensagem, dados) {
  var e = new Error(mensagem);
  e.codigo = codigo;
  e.amigavel = true;
  if (dados !== undefined) e.dados = dados;
  return e;
}

// ------------------------------------------------------------------ Datas

/** Data e hora atuais em America/Sao_Paulo, no formato yyyy-MM-dd HH:mm:ss. */
function agora_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
}

/** Data atual em America/Sao_Paulo, no formato yyyy-MM-dd. */
function hoje_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}

/** Converte um valor lido da planilha (Date ou texto) em yyyy-MM-dd. */
function paraDataIso_(v) {
  if (v === null || v === undefined || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  }
  var s = String(v).trim();
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return m[3] + '-' + m[2] + '-' + m[1];
  return s;
}

/** Converte um valor lido da planilha (Date ou texto) em yyyy-MM-dd HH:mm:ss. */
function paraDataHora_(v) {
  if (v === null || v === undefined || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, TZ, 'yyyy-MM-dd HH:mm:ss');
  }
  return String(v);
}

/** Valida uma data no formato yyyy-MM-dd (inclusive se o dia existe). */
function validarData_(s, campo) {
  s = s === null || s === undefined ? '' : String(s).trim();
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw appError_('DADOS_INVALIDOS', 'Data inválida' + (campo ? ' em "' + campo + '"' : '') + '.');
  var a = Number(m[1]), me = Number(m[2]), d = Number(m[3]);
  var dt = new Date(Date.UTC(a, me - 1, d));
  if (dt.getUTCFullYear() !== a || dt.getUTCMonth() !== me - 1 || dt.getUTCDate() !== d || a < 2000 || a > 2100) {
    throw appError_('DADOS_INVALIDOS', 'Data inexistente' + (campo ? ' em "' + campo + '"' : '') + '.');
  }
  return s;
}

/** Soma (ou subtrai) dias de uma data yyyy-MM-dd, sem depender de fuso horário. */
function adicionarDias_(iso, n) {
  var p = iso.split('-');
  var dt = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + n));
  return dt.getUTCFullYear() + '-' + pad2_(dt.getUTCMonth() + 1) + '-' + pad2_(dt.getUTCDate());
}

/** Dia da semana (0 = domingo ... 6 = sábado) de uma data yyyy-MM-dd. */
function diaDaSemana_(iso) {
  var p = iso.split('-');
  return new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]))).getUTCDay();
}

/** Segunda-feira da semana a que a data pertence. */
function inicioSemana_(iso) {
  var dow = diaDaSemana_(iso);
  return adicionarDias_(iso, dow === 0 ? -6 : 1 - dow);
}

function pad2_(n) {
  return (n < 10 ? '0' : '') + n;
}

/** yyyy-MM-dd -> dd/MM/yyyy */
function dataBr_(iso) {
  if (!iso) return '';
  var p = String(iso).split(' ')[0].split('-');
  if (p.length !== 3) return String(iso);
  return p[2] + '/' + p[1] + '/' + p[0];
}

/** yyyy-MM-dd HH:mm:ss -> dd/MM/yyyy HH:mm */
function dataHoraBr_(s) {
  if (!s) return '';
  var partes = String(s).split(' ');
  return dataBr_(partes[0]) + (partes[1] ? ' ' + partes[1].slice(0, 5) : '');
}

var MESES_ = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
  'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** yyyy-MM -> "novembro/2026" */
function nomeMes_(anoMes) {
  var p = anoMes.split('-');
  return MESES_[Number(p[1]) - 1] + '/' + p[0];
}

// ------------------------------------------------------------------ Textos

/**
 * Limpa um texto livre: remove caracteres de controle, espaços repetidos e
 * sinais iniciais que a planilha poderia interpretar como fórmula (=, +, @).
 */
function texto_(v, max) {
  var s = v === null || v === undefined ? '' : String(v);
  s = s.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/^[=+@]+/, '').trim();
  if (max && s.length > max) s = s.slice(0, max).trim();
  return s;
}

/** Nome em maiúsculas, sem acentos e com espaços normalizados (para comparação). */
function normalizarNome_(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim();
}

/** Valida nome de pessoa (estudante/professor). Mantém a grafia informada. */
function validarNomePessoa_(nome, campo) {
  var s = texto_(nome, 150);
  if (s.length < 3) throw appError_('DADOS_INVALIDOS', 'Informe o ' + (campo || 'nome') + ' completo (mínimo de 3 caracteres).');
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' .\-]+$/.test(s)) {
    throw appError_('DADOS_INVALIDOS', 'O ' + (campo || 'nome') + ' contém caracteres não permitidos. Use apenas letras, espaços, apóstrofo, ponto e hífen.');
  }
  return s;
}

function validarEmail_(email) {
  var s = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || s.length > 200) {
    throw appError_('DADOS_INVALIDOS', 'E-mail inválido.');
  }
  return s;
}

function inteiro_(v, min, max, campo) {
  var n = Number(v);
  if (!isFinite(n) || Math.floor(n) !== n || n < min || n > max) {
    throw appError_('DADOS_INVALIDOS', 'Valor inválido em "' + campo + '" (use um número inteiro de ' + min + ' a ' + max + ').');
  }
  return n;
}

function ehSim_(v) {
  return String(v).toUpperCase() === 'SIM' || v === true;
}

function simNao_(v) {
  return ehSim_(v) ? 'SIM' : 'NAO';
}

// ------------------------------------------------------------------ IDs

/** Gera identificador único com prefixo, ex.: EST-3F9A1C02B7DE. */
function gerarId_(prefixo) {
  return prefixo + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
}

/** Indexa uma lista de objetos por uma propriedade. */
function indexarPor_(lista, chave) {
  var m = {};
  for (var i = 0; i < lista.length; i++) m[lista[i][chave]] = lista[i];
  return m;
}

/** Ordena estudantes por número de chamada e, em empate, por nome. */
function ordenarPorNumero_(a, b) {
  return (Number(a.numero) || 0) - (Number(b.numero) || 0) || String(a.nome).localeCompare(String(b.nome));
}
