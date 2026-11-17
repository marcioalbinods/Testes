/**
 * Consulta.gs — "Consulta sem login": lista de ausentes acessível por LINK + CÓDIGO, sem conta Google.
 *
 * Como funciona:
 *  - Uma SEGUNDA implantação do mesmo projeto, com acesso "Qualquer pessoa", recebe o link
 *    .../exec?consulta=CHAVE. A chave (64 caracteres aleatórios) fica em Script Properties.
 *  - Ao abrir, a pessoa digita um CÓDIGO de 6 dígitos. Só o resumo criptográfico (SHA-256 com sal)
 *    do código é guardado — o código em si é mostrado ao ADMIN uma única vez, ao ser gerado.
 *  - Após 5 códigos errados em 15 minutos, a consulta fica bloqueada por 15 minutos.
 *  - Mostra SOMENTE ausentes e faltas justificadas (período de até 31 dias). Nenhuma gravação.
 *  - Cada consulta bem-sucedida e cada bloqueio são registrados na AUDITORIA.
 *  - O ADMIN pode desativar ou gerar novo link/código a qualquer momento (o anterior deixa de valer).
 *
 * Limitação (informada ao usuário): sem conta Google, o sistema não sabe QUEM consultou —
 * apenas que alguém tinha o link e o código.
 */

var PROP_CONSULTA = 'CONSULTA_PUBLICA';
var CONSULTA_MAX_FALHAS = 5;
var CONSULTA_BLOQUEIO_SEG = 900;

function lerConsultaPublica_() {
  try {
    var s = PropertiesService.getScriptProperties().getProperty(PROP_CONSULTA);
    return s ? JSON.parse(s) : { ativo: false };
  } catch (e) {
    return { ativo: false };
  }
}

function gravarConsultaPublica_(c) {
  PropertiesService.getScriptProperties().setProperty(PROP_CONSULTA, JSON.stringify(c));
}

function resumoCodigo_(sal, codigo) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + '|' + codigo, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}

/** Comparação em tempo constante (evita medir quantos caracteres conferem). */
function iguaisSeguro_(a, b) {
  a = String(a || ''); b = String(b || '');
  var dif = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return dif === 0;
}

function hexAleatorio_(n) {
  var s = '';
  while (s.length < n) s += Utilities.getUuid().replace(/-/g, '');
  return s.slice(0, n);
}

function linkConsulta_(c) {
  return c.url && c.chave ? c.url + '?consulta=' + c.chave : '';
}

/** O link (chave) é válido e está ativo? */
function chaveConsultaValida_(chave) {
  var c = lerConsultaPublica_();
  return !!(c.ativo && c.chave && /^[0-9a-f]{64}$/.test(String(chave || '')) && iguaisSeguro_(c.chave, chave));
}

/**
 * Confere chave + código, com limite de tentativas. Retorna o "usuário" de consulta
 * (somente leitura de todas as turmas) ou lança erro amigável.
 */
function validarAcessoConsulta_(chave, codigo) {
  if (!chaveConsultaValida_(chave)) throw appError_('LINK_INVALIDO', 'Este link de consulta não é válido ou foi desativado. Peça um novo link à coordenação.');
  var cache = CacheService.getScriptCache();
  if (cache.get('cp_bloqueio')) {
    throw appError_('BLOQUEADO', 'Muitas tentativas com código errado. Aguarde 15 minutos e tente novamente.');
  }
  var c = lerConsultaPublica_();
  var cod = String(codigo || '').replace(/\D/g, '');
  if (!/^\d{6}$/.test(cod) || !iguaisSeguro_(resumoCodigo_(c.sal, cod), c.resumo)) {
    var falhas = Number(cache.get('cp_falhas') || 0) + 1;
    cache.put('cp_falhas', String(falhas), CONSULTA_BLOQUEIO_SEG);
    if (falhas >= CONSULTA_MAX_FALHAS) {
      cache.put('cp_bloqueio', '1', CONSULTA_BLOQUEIO_SEG);
      cache.remove('cp_falhas');
      try { comLock_(function () { auditar_('consulta-sem-login', { acao: 'CONSULTA_SEM_LOGIN_BLOQUEADA', entidade: 'CONSULTA', detalhes: falhas + ' códigos errados; bloqueio de 15 minutos.' }); }); } catch (e) { /* ignorar */ }
      throw appError_('BLOQUEADO', 'Muitas tentativas com código errado. Aguarde 15 minutos e tente novamente.');
    }
    throw appError_('CODIGO_INVALIDO', 'Código de acesso incorreto. Restam ' + (CONSULTA_MAX_FALHAS - falhas) + ' tentativa(s).');
  }
  cache.remove('cp_falhas');
  return { id: 'CONSULTA_SEM_LOGIN', nome: 'Consulta sem login', email: 'consulta-sem-login', perfil: PERFIL.CONSULTA, turmas: ['*'] };
}

/** Período da consulta sem login: até 31 dias e nunca no futuro. */
function paramsConsulta_(p) {
  p = p || {};
  var hoje = hoje_();
  var ini = p.inicio ? validarData_(p.inicio, 'Data inicial') : hoje;
  var fim = p.fim ? validarData_(p.fim, 'Data final') : ini;
  if (fim > hoje) fim = hoje;
  if (ini > fim) throw appError_('DADOS_INVALIDOS', 'A data inicial é posterior à data final.');
  if (adicionarDias_(ini, 30) < fim) throw appError_('DADOS_INVALIDOS', 'Escolha um período de até 31 dias.');
  return { inicio: ini, fim: fim, situacoes: p.justificadas === false ? ['AUSENTE'] : ['AUSENTE', 'JUSTIFICADA'] };
}

/** API (sem login): lista de ausentes. p = { chave, codigo, inicio, fim, justificadas } */
function apiConsultaPublica(p) {
  return executar_('apiConsultaPublica', function () {
    p = p || {};
    var u = validarAcessoConsulta_(p.chave, p.codigo);
    var d = ausentesPeriodo_(u, paramsConsulta_(p));
    // Dados mínimos: sem identificadores internos.
    d.itens = d.itens.map(function (x) {
      return { turma: x.turma, turmaId: x.turmaId, data: x.data, dataBr: x.dataBr, periodo: x.periodo, numero: x.numero, nome: x.nome,
        situacao: x.situacao, situacaoRotulo: x.situacaoRotulo, observacao: x.observacao, faltas30: x.faltas30, chamadaFinalizada: x.chamadaFinalizada };
    });
    d.escola = config_().NOME_ESCOLA || '';
    comLock_(function () {
      auditar_('consulta-sem-login', { acao: 'CONSULTA_SEM_LOGIN', entidade: 'CONSULTA', novo: d.itens.length + ' registro(s)',
        detalhes: 'Período ' + dataBr_(d.inicio) + (d.inicio === d.fim ? '' : ' a ' + dataBr_(d.fim)) });
    });
    return d;
  });
}

/** API (sem login): PDF da lista de ausentes. */
function apiConsultaPublicaPdf(p) {
  return executar_('apiConsultaPublicaPdf', function () {
    p = p || {};
    var u = validarAcessoConsulta_(p.chave, p.codigo);
    var rel = relatorioAusentes_(u, paramsConsulta_(p));
    rel.meta.emitidoPor = 'Consulta sem login (link + código)';
    var arquivo = gerarPdf_(rel);
    comLock_(function () {
      auditar_('consulta-sem-login', { acao: 'EXPORTACAO_RELATORIO', entidade: 'CONSULTA', registroId: 'AUSENTES', novo: 'PDF', detalhes: rel.titulo + ' (consulta sem login)' });
    });
    return arquivo;
  });
}

// ------------------------------------------------------------------ Administração (ADMIN)

function statusConsultaParaCliente_(c) {
  return { ativo: !!c.ativo, url: c.url || '', link: c.ativo ? linkConsulta_(c) : '', criadoEm: c.criadoEm || '', criadoPor: c.criadoPor || '' };
}

function apiConsultaPublicaStatus() {
  return executar_('apiConsultaPublicaStatus', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    return statusConsultaParaCliente_(lerConsultaPublica_());
  });
}

/**
 * Gera NOVO link e código (o anterior deixa de valer). p = { url } — o endereço /exec
 * da implantação com acesso "Qualquer pessoa". Devolve o código UMA ÚNICA VEZ.
 */
function apiConsultaPublicaGerar(p) {
  return executar_('apiConsultaPublicaGerar', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    p = p || {};
    var url = String(p.url || '').trim().replace(/\?.*$/, '');
    if (!/^https:\/\/script\.google\.com\/(a\/macros\/[^\/\s]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/.test(url)) {
      throw appError_('DADOS_INVALIDOS', 'Cole o endereço completo da implantação de consulta (começa com https://script.google.com/ e termina em /exec).');
    }
    var codigo = String(parseInt(hexAleatorio_(12), 16) % 1000000);
    while (codigo.length < 6) codigo = '0' + codigo;
    var sal = hexAleatorio_(32);
    var c = { ativo: true, url: url, chave: hexAleatorio_(64), sal: sal, resumo: resumoCodigo_(sal, codigo), criadoEm: agora_(), criadoPor: u.email };
    return comLock_(function () {
      gravarConsultaPublica_(c);
      CacheService.getScriptCache().remove('cp_bloqueio');
      auditar_(u.email, { acao: 'CONSULTA_SEM_LOGIN_GERADA', entidade: 'CONSULTA', novo: 'Novo link e código', detalhes: 'Links e códigos anteriores foram invalidados.' });
      var r = statusConsultaParaCliente_(c);
      r.codigo = codigo;
      return r;
    });
  });
}

function apiConsultaPublicaDesativar() {
  return executar_('apiConsultaPublicaDesativar', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    return comLock_(function () {
      var c = lerConsultaPublica_();
      c.ativo = false;
      c.chave = '';
      c.resumo = '';
      gravarConsultaPublica_(c);
      auditar_(u.email, { acao: 'CONSULTA_SEM_LOGIN_DESATIVADA', entidade: 'CONSULTA', novo: 'Desativada' });
      return statusConsultaParaCliente_(c);
    });
  });
}

/** Página da consulta sem login (doGet com ?consulta=CHAVE). */
function paginaConsulta_(chave) {
  if (!chaveConsultaValida_(chave)) {
    return paginaMensagem_('Link de consulta inválido', 'Este link não é válido ou foi desativado. Peça um novo link à coordenação da escola.');
  }
  var t = typeof HTML_EMBUTIDO_ !== 'undefined' ? HtmlService.createTemplate(HTML_EMBUTIDO_.ConsultaPublica) : HtmlService.createTemplateFromFile('ConsultaPublica');
  var escola = '';
  try { escola = config_().NOME_ESCOLA || ''; } catch (e) { escola = ''; }
  t.dadosJson = jsonSeguro_({ chave: chave, escola: escola, hoje: hoje_() });
  return t.evaluate().setTitle('Ausentes do dia — Frequência Escolar')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
