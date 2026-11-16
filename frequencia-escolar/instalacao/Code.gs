/**
 * FREQUÊNCIA ESCOLAR — PACOTE DE INSTALAÇÃO (arquivo único de servidor)
 * Gerado automaticamente a partir de src/*.gs — não edite aqui; edite src/ e gere de novo.
 */


// ============================================================================
// ARQUIVO ORIGINAL: Code.gs
// ============================================================================

/**
 * ============================================================================
 *  FREQUÊNCIA ESCOLAR — Controle de Frequência e Acompanhamento dos Estudantes
 *  Google Apps Script + Google Sheets
 * ============================================================================
 *
 *  Code.gs — Arquivo principal:
 *   - doGet(): entrada do Web App (com verificação de identidade e autorização).
 *   - setupSistema(): instalação idempotente (cria planilha, abas, turma-piloto e estudantes).
 *   - verificarSistema(): diagnóstico da estrutura e da integridade dos dados.
 *   - executar_(): envelope padrão das funções da API (tratamento de erros).
 *   - Configurações e contexto do usuário.
 *
 *  Para instalar: veja README.md.
 */

/** OPCIONAL: preencha antes de executar setupSistema() (pode ser alterado depois no sistema). */
var NOME_ESCOLA_INICIAL = '';

var VERSAO_SISTEMA = '1.0.0';
var DATA_INICIO_PILOTO = '2026-11-17';
var NOME_TURMA_PILOTO = 'TURMA PILOTO';

/** Estudantes da turma-piloto (número de chamada e nome, preservados integralmente). */
var ESTUDANTES_PILOTO = [
  [1, 'ALICE BRITO DOS SANTOS'],
  [2, 'AMAEL HECTOR DOS SANTOS SILVA'],
  [3, 'ANA HELENA DE OLIVEIRA'],
  [4, 'ANA ISADORA MOTA BIZARRIA'],
  [5, 'ANA LUIZA COSTA VASCONCELOS'],
  [6, 'ANNA CECILIA SILVEIRA DUARTE'],
  [7, 'ANNA CLARA PAIXAO SILVA'],
  [8, 'BRYAN LORENZO SOUZA DE JESUS'],
  [9, 'DANDARA APRIL SANTOS DE OLIVEIRA'],
  [10, 'DANIEL DE ALMEIDA BERNARDO'],
  [11, 'DAVI XAVIER COLETA'],
  [12, 'DAVID PEDROSA DA SILVA'],
  [13, 'ENZO GABRIEL MATOS LEITE'],
  [14, 'GIOVANNA VITORIA ORNELAS SELES'],
  [15, 'ISABELLA DA SILVA DOURADO'],
  [16, 'ISADORA DE OLIVEIRA TOMAZ'],
  [17, 'ISAQUE DOS SANTOS FEITOSA'],
  [18, 'JASMIM DA SILVA SANTOS'],
  [19, 'LAURA ALMEIDA DE LIMA'],
  [20, 'LAURA DE JESUS ROCHA'],
  [21, 'LEVIH CONCEICAO DA SILVA'],
  [22, 'LORENA SILVA DE MATOS'],
  [23, 'MANUELLY OLIVEIRA NASCIMENTO'],
  [24, 'MARIA LUIZA GOMES DA SILVA DE JESUS'],
  [25, 'MURILLO OLIVEIRA SOUSA'],
  [26, 'MURILO SILVA DE JESUS'],
  [27, 'PERICLES RAFAEL SILVA DE SOUZA'],
  [28, 'RICHARD ARAUJO DOS SANTOS'],
  [29, 'SOPHIA DA CRUZ PEREIRA'],
  [30, 'VINNYCIUS AUGUSTO DE OLIVEIRA VENTURA'],
  [31, 'WENDEL ARTHUR DE JESUS SALES'],
  [32, 'MANUELLA BERILO CONCEICAO AQUINO']
];

/** Configurações iniciais: [CHAVE, VALOR PADRÃO, DESCRIÇÃO]. Só são criadas se não existirem. */
var CONFIG_PADRAO = [
  ['NOME_ESCOLA', '', 'Nome da escola exibido no sistema e nos relatórios.'],
  ['LIMITE_FREQUENCIA', '90', 'Percentual mínimo de frequência. Abaixo dele, o estudante aparece em ACOMPANHAMENTO DA FREQUÊNCIA.'],
  ['ATRASO_CONTA_COMPARECIMENTO', 'SIM', 'SIM: atraso conta como comparecimento. NAO: atraso conta como falta.'],
  ['JUSTIFICADA_CONTA_COMPARECIMENTO', 'NAO', 'SIM: falta justificada conta como comparecimento. NAO (padrão): não conta.'],
  ['JUSTIFICADA_EXCLUIR_DO_CALCULO', 'NAO', 'SIM: faltas justificadas ficam fora da base do percentual. NAO (padrão): entram na base.'],
  ['CONTAR_RASCUNHOS', 'NAO', 'SIM: chamadas em rascunho entram nas estatísticas. NAO (padrão): somente finalizadas.'],
  ['PERIODOS', '', 'Aulas/períodos separados por ponto e vírgula (ex.: 1ª aula;2ª aula). Vazio = uma chamada por dia.'],
  ['DIAS_EDICAO_PROFESSOR', '7', 'Quantos dias para trás o PROFESSOR pode registrar ou corrigir chamadas.'],
  ['PROFESSOR_PODE_REABRIR', 'SIM', 'SIM: professor pode reabrir chamadas finalizadas dentro do prazo. NAO: somente gestão.'],
  ['TURMA_PILOTO_ID', '', 'Identificador da turma-piloto (preenchido automaticamente pela instalação).'],
  ['BACKUP_PASTA_ID', '', 'Pasta do Google Drive com os backups (preenchido automaticamente).'],
  ['ULTIMO_BACKUP', '', 'Data/hora e ID do último backup (preenchido automaticamente).'],
  ['ICONE_URL', '', 'Endereço público de imagem PNG (ícone do navegador). Opcional.'],
  ['VERSAO_ESTRUTURA', '1', 'Versão da estrutura do banco de dados.']
];

/** Chaves que o ADMIN pode alterar pela tela de Configurações. */
var CONFIG_EDITAVEIS = ['NOME_ESCOLA', 'LIMITE_FREQUENCIA', 'ATRASO_CONTA_COMPARECIMENTO', 'JUSTIFICADA_CONTA_COMPARECIMENTO',
  'JUSTIFICADA_EXCLUIR_DO_CALCULO', 'CONTAR_RASCUNHOS', 'PERIODOS', 'DIAS_EDICAO_PROFESSOR', 'PROFESSOR_PODE_REABRIR', 'ICONE_URL'];

// ============================================================================ Web App

/** Entrada do Web App. Só entrega a interface para usuários identificados e cadastrados. */
function doGet(e) {
  if (!sistemaInstalado_()) {
    return paginaMensagem_('Sistema não instalado', 'O administrador ainda não executou a instalação (setupSistema).');
  }
  var email = emailAtual_();
  if (!email) {
    return paginaMensagem_('Não foi possível confirmar sua identidade',
      'O Google não informou a conta conectada. Entre com a sua conta institucional do Google e recarregue a página. ' +
      'Se você usa uma conta pessoal (Gmail), peça ao administrador para verificar a configuração de publicação descrita no manual.');
  }
  var u;
  try {
    u = usuarioAtual_();
  } catch (err) {
    console.error('doGet', err && err.stack || err);
    return paginaMensagem_('Sistema temporariamente indisponível', err && err.amigavel ? err.message : 'Tente novamente em alguns minutos.');
  }
  if (!u) {
    return paginaMensagem_('Acesso não autorizado',
      'A conta ' + email + ' não está cadastrada no sistema FREQUÊNCIA ESCOLAR. Solicite o acesso à equipe gestora da escola.');
  }
  var t = HtmlService.createTemplateFromFile('Index');
  t.contextoJson = jsonSeguro_(contextoUsuario_(u));
  var out = t.evaluate()
    .setTitle('Frequência Escolar')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .addMetaTag('apple-mobile-web-app-capable', 'yes')
    .addMetaTag('mobile-web-app-capable', 'yes')
    .addMetaTag('apple-mobile-web-app-title', 'Frequência')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  var icone = '';
  try { icone = config_().ICONE_URL || ''; } catch (x) { icone = ''; }
  if (/^https:\/\//.test(icone)) {
    try { out.setFaviconUrl(icone); } catch (x) { /* URL de ícone inválida: ignorar */ }
  }
  return out;
}

/** Inclui um arquivo HTML dentro de outro (usado em Index.html). */
function include(nome) {
  if (['Styles', 'JavaScript'].indexOf(nome) < 0) throw new Error('Arquivo não permitido.');
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}

function paginaMensagem_(titulo, texto) {
  var t = HtmlService.createTemplateFromFile('Mensagem');
  t.titulo = titulo;
  t.texto = texto;
  return t.evaluate().setTitle('Frequência Escolar').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** JSON seguro para inserir dentro de <script> (evita fechamento de tag). */
function jsonSeguro_(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** Dados iniciais enviados à interface (sem nenhuma credencial). */
function contextoUsuario_(u) {
  var cfg = config_();
  var estudantes = lerTabela_('ESTUDANTES');
  var turmas = turmasDoUsuario_(u, ehGestao_(u)).map(function (t) { return turmaParaCliente_(t, estudantes); });
  return {
    versao: VERSAO_SISTEMA,
    usuario: { nome: u.nome, email: u.email, perfil: u.perfil },
    escola: cfg.NOME_ESCOLA || '',
    hoje: hoje_(),
    turmas: turmas,
    turmaPilotoId: cfg.TURMA_PILOTO_ID || '',
    periodos: periodosConfigurados_(cfg),
    limite: configNum_(cfg, 'LIMITE_FREQUENCIA', 90),
    diasEdicaoProfessor: configNum_(cfg, 'DIAS_EDICAO_PROFESSOR', 7)
  };
}

// ============================================================================ Envelope da API

/**
 * Executa uma função da API e devolve { ok: true, data } ou { ok: false, codigo, erro }.
 * Erros inesperados são registrados no log (Execuções do Apps Script) e o usuário recebe
 * uma mensagem amigável, sem detalhes técnicos internos.
 */
function executar_(nomeOperacao, fn) {
  var inicio = Date.now();
  try {
    var data = fn();
    var ms = Date.now() - inicio;
    if (ms > 20000) console.warn(nomeOperacao + ' demorou ' + ms + ' ms');
    return { ok: true, data: data === undefined ? null : data };
  } catch (e) {
    if (e && e.amigavel) {
      return { ok: false, codigo: e.codigo, erro: e.message, dados: e.dados === undefined ? null : e.dados };
    }
    console.error(nomeOperacao + ' falhou: ' + (e && e.stack || e));
    var msg = String(e && e.message || '');
    if (/Lock|timed out|tempo limite/i.test(msg)) {
      return { ok: false, codigo: 'OCUPADO', erro: 'O sistema está ocupado. Tente novamente em instantes.' };
    }
    return { ok: false, codigo: 'ERRO_INTERNO', erro: 'Ocorreu um erro inesperado ao processar a solicitação. Tente novamente. Se o problema continuar, informe a coordenação.' };
  }
}

/** API: contexto atualizado do usuário (turmas, configurações básicas). */
function apiContexto() {
  return executar_('apiContexto', function () {
    return contextoUsuario_(exigirUsuario_());
  });
}

// ============================================================================ Configurações (ADMIN)

function apiObterConfiguracoes() {
  return executar_('apiObterConfiguracoes', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    var lista = lerTabela_('CONFIGURACOES');
    return {
      editaveis: CONFIG_EDITAVEIS,
      itens: lista.map(function (c) {
        return { chave: c.CHAVE, valor: c.VALOR, descricao: c.DESCRICAO, atualizadoEm: c.ATUALIZADO_EM, atualizadoPor: c.ATUALIZADO_POR };
      }),
      versao: VERSAO_SISTEMA
    };
  });
}

/** Valida e grava configurações alteradas pelo ADMIN (com auditoria de cada mudança). */
function apiSalvarConfiguracoes(valores) {
  return executar_('apiSalvarConfiguracoes', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    valores = valores || {};
    var limpos = {};
    Object.keys(valores).forEach(function (k) {
      if (CONFIG_EDITAVEIS.indexOf(k) < 0) throw appError_('DADOS_INVALIDOS', 'Configuração não editável: ' + k);
      var v = texto_(valores[k], 300);
      if (k === 'LIMITE_FREQUENCIA') {
        var n = Number(v.replace(',', '.'));
        if (!isFinite(n) || n < 1 || n > 100) throw appError_('DADOS_INVALIDOS', 'O limite de frequência deve estar entre 1 e 100.');
        v = String(n);
      } else if (k === 'DIAS_EDICAO_PROFESSOR') {
        v = String(inteiro_(v, 0, 365, 'Dias de edição do professor'));
      } else if (['ATRASO_CONTA_COMPARECIMENTO', 'JUSTIFICADA_CONTA_COMPARECIMENTO', 'JUSTIFICADA_EXCLUIR_DO_CALCULO', 'CONTAR_RASCUNHOS', 'PROFESSOR_PODE_REABRIR'].indexOf(k) >= 0) {
        v = simNao_(v);
      } else if (k === 'PERIODOS') {
        var ps = v.split(';').map(function (s) { return texto_(s, 40); }).filter(String);
        if (ps.length > 12) throw appError_('DADOS_INVALIDOS', 'Máximo de 12 períodos.');
        v = ps.join(';');
      } else if (k === 'ICONE_URL') {
        if (v && !/^https:\/\/[^\s]+$/.test(v)) throw appError_('DADOS_INVALIDOS', 'O endereço do ícone deve começar com https://');
      } else if (k === 'NOME_ESCOLA') {
        if (v.length < 3) throw appError_('DADOS_INVALIDOS', 'Informe o nome da escola.');
      }
      limpos[k] = v;
    });
    return comLock_(function () {
      var atual = config_();
      var aud = [];
      Object.keys(limpos).forEach(function (k) {
        if (String(atual[k]) !== limpos[k]) {
          aud.push(novaAuditoria_(u.email, { acao: 'ALTERACAO_CONFIGURACAO', entidade: 'CONFIGURACOES', registroId: k, anterior: atual[k], novo: limpos[k] }));
        }
      });
      gravarConfiguracoes_(limpos, u.email);
      registrarAuditoria_(aud);
      return { alteradas: aud.length };
    });
  });
}

/** API (ADMIN): diagnóstico do sistema pela interface. */
function apiVerificarSistema() {
  return executar_('apiVerificarSistema', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    limparTodoCache_();
    return diagnostico_();
  });
}

// ============================================================================ Instalação

/**
 * EXECUTAR PELO EDITOR (uma vez). Idempotente: pode ser executada novamente sem duplicar
 * planilha, abas, configurações, administrador, turma-piloto ou estudantes.
 */
function setupSistema() {
  var email = exigirExecucaoAdministrativa_();
  var log = [];
  function info(m) { log.push(m); Logger.log(m); }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Outra instalação/gravação está em andamento. Tente novamente em 1 minuto.');
  try {
    var props = PropertiesService.getScriptProperties();

    // 1. Planilha principal (cria somente se não existir ou se a anterior estiver inacessível).
    var ss = null;
    var id = props.getProperty(PROP_PLANILHA);
    if (id) {
      try {
        ss = SpreadsheetApp.openById(id);
        if (DriveApp.getFileById(id).isTrashed()) throw new Error('Planilha na lixeira. Restaure-a da lixeira do Google Drive ou remova a propriedade SPREADSHEET_ID para criar outra.');
        info('Planilha existente encontrada: ' + ss.getUrl());
      } catch (e) {
        throw new Error('A planilha registrada (' + id + ') não pôde ser aberta: ' + e.message +
          ' — Para evitar perda de dados, nada foi criado. Restaure a planilha ou apague a propriedade SPREADSHEET_ID em Configurações do projeto > Propriedades do script.');
      }
    } else {
      ss = SpreadsheetApp.create(NOME_PLANILHA);
      ss.setSpreadsheetTimeZone(TZ);
      props.setProperty(PROP_PLANILHA, ss.getId());
      info('Planilha criada: ' + ss.getUrl());
    }
    if (!props.getProperty(PROP_INSTALADOR)) props.setProperty(PROP_INSTALADOR, email);
    _memo.ss = ss;

    // 2-4. Abas, cabeçalhos e formatação.
    criarEstrutura_(ss, info);

    // 7. Configurações iniciais (somente chaves ausentes).
    var cfgAtual = indexarPor_(lerTabela_('CONFIGURACOES', { fresco: true }), 'CHAVE');
    var novasCfg = CONFIG_PADRAO.filter(function (c) { return !cfgAtual[c[0]]; }).map(function (c) {
      var valor = c[0] === 'NOME_ESCOLA' ? (texto_(NOME_ESCOLA_INICIAL, 150) || 'NOME DA ESCOLA (configure em Administração)') : c[1];
      return { CHAVE: c[0], VALOR: valor, DESCRICAO: c[2], ATUALIZADO_EM: agora_(), ATUALIZADO_POR: email };
    });
    inserirRegistros_('CONFIGURACOES', novasCfg);
    info(novasCfg.length ? novasCfg.length + ' configuração(ões) criada(s).' : 'Configurações já existentes (mantidas).');

    // Administrador inicial: quem executa a instalação.
    var profs = lerTabela_('PROFESSORES', { fresco: true });
    var jaAdmin = profs.some(function (p) { return String(p.EMAIL).toLowerCase() === email; });
    if (!jaAdmin) {
      var nomeAdmin = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/[^A-Za-zÀ-ÿ ]/g, '').trim().toUpperCase() || 'ADMINISTRADOR';
      if (nomeAdmin.length < 3) nomeAdmin = 'ADMINISTRADOR';
      inserirRegistros_('PROFESSORES', [{ ID: gerarId_('PRO'), NOME: nomeAdmin, EMAIL: email, PERFIL: PERFIL.ADMIN, TURMAS: '*', ATIVO: 'SIM',
        CRIADO_EM: agora_(), CRIADO_POR: email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: email }]);
      info('Administrador cadastrado: ' + email + ' (altere o nome em Administração > Usuários).');
    } else {
      info('Administrador já cadastrado: ' + email);
    }

    // 5. Turma-piloto.
    var cfg = config_();
    var turmas = lerTabela_('TURMAS', { fresco: true });
    var piloto = cfg.TURMA_PILOTO_ID ? indexarPor_(turmas, 'ID')[cfg.TURMA_PILOTO_ID] : null;
    if (!piloto) {
      piloto = turmas.filter(function (t) { return normalizarNome_(t.NOME) === NOME_TURMA_PILOTO && String(t.ANO_LETIVO) === DATA_INICIO_PILOTO.slice(0, 4); })[0] || null;
    }
    if (!piloto) {
      piloto = { ID: gerarId_('TUR'), NOME: NOME_TURMA_PILOTO, ANO_SERIE: '', TURNO: '', ANO_LETIVO: DATA_INICIO_PILOTO.slice(0, 4),
        DATA_INICIO: DATA_INICIO_PILOTO, ATIVA: 'SIM', CRIADO_EM: agora_(), CRIADO_POR: email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: email };
      inserirRegistros_('TURMAS', [piloto]);
      info('Turma-piloto criada: ' + piloto.NOME + ' (' + piloto.ID + '), início em ' + dataBr_(DATA_INICIO_PILOTO) + '.');
    } else {
      info('Turma-piloto já existente: ' + piloto.NOME + ' (' + piloto.ID + ').');
    }
    if (cfg.TURMA_PILOTO_ID !== piloto.ID) gravarConfiguracoes_({ TURMA_PILOTO_ID: piloto.ID }, email);

    // 6. Estudantes (sem duplicar: compara por nome normalizado dentro da turma, inclusive inativos).
    var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
    var existentes = {};
    estudantes.forEach(function (e) {
      if (e.TURMA_ID === piloto.ID || e.TURMA_ANTERIOR_ID === piloto.ID) existentes[normalizarNome_(e.NOME)] = e;
    });
    var novos = [], avisos = [];
    ESTUDANTES_PILOTO.forEach(function (par) {
      if (existentes[normalizarNome_(par[1])]) return;
      var ocupado = numeroOcupado_(estudantes.concat(novos), piloto.ID, par[0], null);
      var numero = ocupado ? proximoNumero_(estudantes.concat(novos), piloto.ID) : par[0];
      if (ocupado) avisos.push('Número ' + par[0] + ' já ocupado por ' + ocupado.NOME + '; ' + par[1] + ' recebeu o número ' + numero + '.');
      novos.push({ ID: gerarId_('EST'), TURMA_ID: piloto.ID, NUMERO: numero, NOME: par[1], SITUACAO: SITUACAO_ESTUDANTE.ATIVO,
        DATA_ENTRADA: piloto.DATA_INICIO || DATA_INICIO_PILOTO, DATA_SAIDA: '', TURMA_ANTERIOR_ID: '', NUMERO_ANTERIOR: '', DATA_TRANSFERENCIA: '',
        OBSERVACAO: '', CRIADO_EM: agora_(), CRIADO_POR: email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: email });
    });
    inserirRegistros_('ESTUDANTES', novos);
    info(novos.length ? novos.length + ' estudante(s) cadastrado(s) na turma-piloto.' : 'Estudantes da turma-piloto já cadastrados (nenhuma duplicação).');
    avisos.forEach(info);

    registrarAuditoria_([novaAuditoria_(email, { acao: 'INSTALACAO', entidade: 'SISTEMA', registroId: ss.getId(), turma: piloto.ID,
      novo: 'Versão ' + VERSAO_SISTEMA, detalhes: log.join(' | ') })]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  // 9. Validação de integridade.
  limparTodoCache_();
  var diag = diagnostico_();
  diag.mensagens.forEach(function (m) { info((m.ok ? '[OK] ' : '[ATENÇÃO] ') + m.texto); });
  // 10. Mensagem final ao administrador.
  info(diag.ok ? '✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO. Próximo passo: Implantar > Nova implantação > App da Web (veja o README).'
    : '⚠️ Instalação concluída com alertas. Revise as mensagens [ATENÇÃO] acima.');
  return log.join('\n');
}

/** Cria/repara abas, cabeçalhos, formatação e proteções. Não apaga nada existente. */
function criarEstrutura_(ss, info) {
  ORDEM_TABELAS.forEach(function (nome, idx) {
    var def = TABELAS[nome];
    var sh = ss.getSheetByName(nome);
    if (!sh) {
      sh = ss.insertSheet(nome, idx);
      info('Aba criada: ' + nome);
    }
    var ultimaCol = sh.getLastColumn();
    var atuais = ultimaCol ? sh.getRange(1, 1, 1, ultimaCol).getValues()[0].map(function (v) { return String(v).trim(); }) : [];
    if (!atuais.filter(String).length) {
      atuais = def.colunas.slice();
      sh.getRange(1, 1, 1, atuais.length).setValues([atuais]);
    } else {
      var faltando = def.colunas.filter(function (c) { return atuais.indexOf(c) < 0; });
      if (faltando.length) {
        sh.getRange(1, atuais.length + 1, 1, faltando.length).setValues([faltando]);
        atuais = atuais.concat(faltando);
        info('Aba ' + nome + ': colunas adicionadas: ' + faltando.join(', '));
      }
    }
    if (sh.getMaxColumns() > atuais.length) sh.deleteColumns(atuais.length + 1, sh.getMaxColumns() - atuais.length);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, atuais.length).setFontWeight('bold').setBackground('#1d4ed8').setFontColor('#ffffff');
    // Formato texto para colunas não numéricas (evita conversão automática de datas e IDs).
    var linhas = Math.max(sh.getMaxRows() - 1, 1);
    var formatos = [atuais.map(function (c) { return def.numericas.indexOf(c) >= 0 ? '0' : '@'; })];
    var fmtTodas = [];
    for (var i = 0; i < linhas; i++) fmtTodas.push(formatos[0]);
    sh.getRange(2, 1, linhas, atuais.length).setNumberFormats(fmtTodas);
    // Proteção com aviso: alerta o administrador antes de qualquer edição manual na planilha.
    var protegida = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).length > 0;
    if (!protegida) {
      sh.protect().setDescription('FREQUÊNCIA ESCOLAR — edite somente pelo aplicativo').setWarningOnly(true);
    }
    _memo.abas[nome] = sh;
    delete _memo.cabecalhos[nome];
  });
  // Remove a aba padrão vazia ("Página1"/"Sheet1") criada junto com a planilha.
  ss.getSheets().forEach(function (sh) {
    if (!TABELAS[sh.getName()] && sh.getLastRow() === 0 && ss.getSheets().length > ORDEM_TABELAS.length) {
      ss.deleteSheet(sh);
    }
  });
}

// ============================================================================ Verificação

/** EXECUTAR PELO EDITOR: testa a estrutura e a integridade e mostra o resultado no log. */
function verificarSistema() {
  exigirExecucaoAdministrativa_();
  limparTodoCache_();
  var d = diagnostico_();
  d.mensagens.forEach(function (m) { Logger.log((m.ok ? '[OK] ' : '[ATENÇÃO] ') + m.texto); });
  Logger.log(d.ok ? '✅ Sistema verificado: nenhuma inconsistência encontrada.' : '⚠️ Foram encontradas inconsistências (veja acima).');
  return d;
}

/** Diagnóstico completo: estrutura, duplicidades, referências e dados da turma-piloto. */
function diagnostico_() {
  var msgs = [];
  function ok(t) { msgs.push({ ok: true, texto: t }); }
  function alerta(t) { msgs.push({ ok: false, texto: t }); }

  if (!sistemaInstalado_()) { alerta('Sistema não instalado (SPREADSHEET_ID ausente).'); return { ok: false, mensagens: msgs }; }
  var ss;
  try { ss = db_(); ok('Planilha acessível: ' + ss.getName()); } catch (e) { alerta(e.message); return { ok: false, mensagens: msgs }; }

  var estruturaOk = true;
  ORDEM_TABELAS.forEach(function (nome) {
    try { cabecalho_(nome); } catch (e) { estruturaOk = false; alerta(e.message); }
  });
  if (!estruturaOk) return { ok: false, mensagens: msgs };
  ok('Todas as 7 abas e cabeçalhos estão corretos.');

  var dados = {};
  ORDEM_TABELAS.forEach(function (n) { dados[n] = lerTabela_(n, { fresco: true }); });

  ORDEM_TABELAS.forEach(function (n) {
    var chave = TABELAS[n].chave, vistos = {}, dup = 0;
    dados[n].forEach(function (r) { if (vistos[r[chave]]) dup++; vistos[r[chave]] = 1; });
    if (dup) alerta(n + ': ' + dup + ' identificador(es) duplicado(s).');
  });

  var turmas = indexarPor_(dados.TURMAS, 'ID');
  var cfg = {};
  dados.CONFIGURACOES.forEach(function (c) { cfg[c.CHAVE] = c.VALOR; });
  CONFIG_PADRAO.forEach(function (c) { if (cfg[c[0]] === undefined) alerta('Configuração ausente: ' + c[0]); });

  var admins = dados.PROFESSORES.filter(function (p) { return p.PERFIL === PERFIL.ADMIN && ehSim_(p.ATIVO); });
  if (admins.length) ok(admins.length + ' administrador(es) ativo(s).'); else alerta('Nenhum administrador ativo cadastrado.');
  var emails = {};
  dados.PROFESSORES.forEach(function (p) {
    var e = String(p.EMAIL).toLowerCase();
    if (emails[e]) alerta('E-mail de usuário duplicado: ' + e);
    emails[e] = 1;
  });

  var numerosPorTurma = {};
  var orfaos = 0;
  dados.ESTUDANTES.forEach(function (e) {
    if (!turmas[e.TURMA_ID]) orfaos++;
    if (e.SITUACAO !== SITUACAO_ESTUDANTE.ATIVO) return;
    var k = e.TURMA_ID + '|' + e.NUMERO;
    if (numerosPorTurma[k]) alerta('Número de chamada ' + e.NUMERO + ' repetido entre ativos: ' + numerosPorTurma[k] + ' e ' + e.NOME);
    numerosPorTurma[k] = e.NOME;
  });
  if (orfaos) alerta(orfaos + ' estudante(s) ligados a turma inexistente.');

  var piloto = turmas[cfg.TURMA_PILOTO_ID];
  if (!piloto) {
    alerta('Turma-piloto não encontrada.');
  } else {
    // Inclui estudantes transferidos para outra turma (continuam no histórico da turma-piloto).
    var doPiloto = dados.ESTUDANTES.filter(function (e) { return e.TURMA_ID === piloto.ID || e.TURMA_ANTERIOR_ID === piloto.ID; });
    var porNome = {};
    doPiloto.forEach(function (e) { porNome[e.NOME] = e; });
    var faltando = ESTUDANTES_PILOTO.filter(function (par) { return !porNome[par[1]]; });
    if (faltando.length) alerta('Estudantes da lista oficial ausentes ou com nome diferente: ' + faltando.map(function (p) { return p[1]; }).join(', '));
    else ok('Os 32 nomes da turma-piloto conferem exatamente com a lista oficial.');
    var numeracaoOk = ESTUDANTES_PILOTO.every(function (par) {
      var e = porNome[par[1]];
      return e && Number(e.TURMA_ID === piloto.ID ? e.NUMERO : e.NUMERO_ANTERIOR) === par[0];
    });
    if (numeracaoOk) ok('Numeração de chamada 1 a 32 conferida.');
    else ok('Numeração da turma-piloto foi alterada em relação à lista inicial (permitido por edição).');
    var dupNomes = doPiloto.length - Object.keys(porNome).length;
    if (dupNomes) alerta(dupNomes + ' estudante(s) com nome repetido na turma-piloto.');
    ok('Turma-piloto: "' + piloto.NOME + '", início ' + dataBr_(piloto.DATA_INICIO) + ', ' +
      doPiloto.filter(function (e) { return e.TURMA_ID === piloto.ID && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO; }).length + ' estudante(s) ativo(s).');
  }

  var chaves = {};
  var chamadasPorId = indexarPor_(dados.CHAMADAS, 'ID');
  dados.CHAMADAS.forEach(function (c) {
    var k = c.TURMA_ID + '|' + c.DATA + '|' + c.PERIODO;
    if (chaves[k]) alerta('Chamada duplicada para ' + k);
    chaves[k] = 1;
  });
  var regOrfaos = 0, regDup = 0, vistosReg = {};
  dados.FREQUENCIAS.forEach(function (r) {
    if (!chamadasPorId[r.CHAMADA_ID]) regOrfaos++;
    var k = r.CHAMADA_ID + '|' + r.ESTUDANTE_ID;
    if (vistosReg[k]) regDup++;
    vistosReg[k] = 1;
    if (SITUACOES_VALIDAS.indexOf(r.SITUACAO) < 0) alerta('Situação inválida no registro ' + r.ID + ': ' + r.SITUACAO);
  });
  if (regOrfaos) alerta(regOrfaos + ' registro(s) de frequência sem chamada correspondente.');
  if (regDup) alerta(regDup + ' registro(s) de frequência duplicados (mesmo estudante na mesma chamada).');
  ok(dados.CHAMADAS.length + ' chamada(s) e ' + dados.FREQUENCIAS.length + ' registro(s) de frequência; ' + dados.AUDITORIA.length + ' evento(s) de auditoria.');

  var temGatilho = false;
  try { temGatilho = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === FUNCAO_GATILHO_BACKUP; }); } catch (e) { temGatilho = false; }
  if (temGatilho) ok('Backup diário automático ativo.');
  else msgs.push({ ok: true, texto: 'Backup diário ainda não instalado (recomendado: executar instalarBackupDiario).', recomendacao: true });

  return { ok: msgs.every(function (m) { return m.ok; }), mensagens: msgs };
}


// ============================================================================
// ARQUIVO ORIGINAL: Util.gs
// ============================================================================

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


// ============================================================================
// ARQUIVO ORIGINAL: Database.gs
// ============================================================================

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


// ============================================================================
// ARQUIVO ORIGINAL: Security.gs
// ============================================================================

/**
 * Security.gs — Autenticação (identidade Google) e autorização (perfis e turmas).
 *
 * Identidade: Session.getActiveUser().getEmail().
 *  - Em Google Workspace (mesmo domínio do proprietário) com "Executar como: eu",
 *    o e-mail do usuário que acessa é retornado corretamente.
 *  - Em contas Gmail pessoais com "Executar como: eu", o Google NÃO informa o e-mail de
 *    terceiros (retorna vazio). Nesse caso o sistema BLOQUEIA o acesso — nunca
 *    presume quem é o usuário. Veja README.md, seção "Contas Gmail pessoais".
 *
 * Perfis:
 *  - ADMIN: tudo (cadastros, configurações, backup, exportação completa).
 *  - GESTOR: todas as turmas; chamadas, correções, reabertura, relatórios, cadastro de estudantes.
 *  - PROFESSOR: somente as turmas atribuídas; chamada e correções dentro do prazo configurado.
 */

var PERFIL = { ADMIN: 'ADMIN', GESTOR: 'GESTOR', PROFESSOR: 'PROFESSOR' };
var PERFIS_VALIDOS = ['ADMIN', 'GESTOR', 'PROFESSOR'];
var _usuarioMemo = { carregado: false, valor: null };

/** E-mail do usuário conectado (minúsculas) ou '' se o Google não informar. */
function emailAtual_() {
  var e = '';
  try { e = Session.getActiveUser().getEmail() || ''; } catch (x) { e = ''; }
  return String(e).trim().toLowerCase();
}

/** E-mail da conta que executa o script (proprietário, em "Executar como: eu"). */
function emailEfetivo_() {
  var e = '';
  try { e = Session.getEffectiveUser().getEmail() || ''; } catch (x) { e = ''; }
  return String(e).trim().toLowerCase();
}

/** Converte a linha da aba PROFESSORES no objeto de usuário usado pelo sistema. */
function montarUsuario_(p) {
  var turmas = String(p.TURMAS || '').split(/[;,]/).map(function (s) { return s.trim(); }).filter(String);
  return { id: p.ID, nome: p.NOME, email: String(p.EMAIL).toLowerCase(), perfil: p.PERFIL, turmas: turmas };
}

/** Usuário cadastrado e ativo correspondente ao e-mail conectado, ou null. */
function usuarioAtual_() {
  if (_usuarioMemo.carregado) return _usuarioMemo.valor;
  var email = emailAtual_();
  var u = null;
  if (email) {
    var profs = lerTabela_('PROFESSORES');
    for (var i = 0; i < profs.length; i++) {
      if (String(profs[i].EMAIL).trim().toLowerCase() === email && ehSim_(profs[i].ATIVO)) {
        u = montarUsuario_(profs[i]);
        break;
      }
    }
  }
  _usuarioMemo = { carregado: true, valor: u };
  return u;
}

/** Exige usuário identificado e autorizado. Usada no início de TODA função da API. */
function exigirUsuario_() {
  var email = emailAtual_();
  if (!email) {
    throw appError_('SEM_IDENTIDADE', 'Não foi possível confirmar sua identidade Google. Entre com sua conta institucional e recarregue a página. Por segurança, nenhuma operação foi realizada.');
  }
  var u = usuarioAtual_();
  if (!u) {
    throw appError_('NAO_AUTORIZADO', 'A conta ' + email + ' não está autorizada a usar o sistema. Solicite o cadastro à equipe gestora.');
  }
  return u;
}

function exigirPerfil_(u, perfis) {
  if (perfis.indexOf(u.perfil) < 0) {
    throw appError_('SEM_PERMISSAO', 'Seu perfil (' + u.perfil + ') não tem permissão para esta operação.');
  }
}

function ehGestao_(u) {
  return u.perfil === PERFIL.ADMIN || u.perfil === PERFIL.GESTOR;
}

function podeAcessarTurma_(u, turmaId) {
  if (ehGestao_(u)) return true;
  return u.turmas.indexOf('*') >= 0 || u.turmas.indexOf(turmaId) >= 0;
}

/** Garante que a turma existe e que o usuário pode acessá-la. Retorna o registro da turma. */
function exigirTurma_(u, turmaId) {
  var turma = indexarPor_(lerTabela_('TURMAS'), 'ID')[String(turmaId || '')];
  if (!turma) throw appError_('NAO_ENCONTRADO', 'Turma não encontrada.');
  if (!podeAcessarTurma_(u, turma.ID)) throw appError_('SEM_PERMISSAO', 'Você não tem acesso a esta turma.');
  return turma;
}

/** Turmas que o usuário pode ver (somente ativas, salvo incluirInativas para gestão). */
function turmasDoUsuario_(u, incluirInativas) {
  return lerTabela_('TURMAS').filter(function (t) {
    return podeAcessarTurma_(u, t.ID) && (incluirInativas || ehSim_(t.ATIVA));
  });
}

/**
 * Permissões sobre uma chamada numa data.
 * Retorna { editar, reabrir, motivo } — usado tanto para exibir botões quanto
 * para VALIDAR no servidor antes de qualquer gravação.
 */
function permissoesChamada_(u, turma, data, cfg) {
  var hoje = hoje_();
  var r = { editar: true, reabrir: true, motivo: '' };
  if (data > hoje) return { editar: false, reabrir: false, motivo: 'Não é permitido registrar chamada para datas futuras.' };
  if (turma.DATA_INICIO && data < turma.DATA_INICIO) {
    return { editar: false, reabrir: false, motivo: 'A turma inicia em ' + dataBr_(turma.DATA_INICIO) + '. Não há chamadas antes dessa data.' };
  }
  if (!ehSim_(turma.ATIVA)) return { editar: false, reabrir: false, motivo: 'Turma inativa: somente consulta.' };
  if (ehGestao_(u)) return r;
  var dias = configNum_(cfg, 'DIAS_EDICAO_PROFESSOR', 7);
  if (data < adicionarDias_(hoje, -dias)) {
    return { editar: false, reabrir: false, motivo: 'Prazo de edição pelo professor encerrado (' + dias + ' dias). Solicite a correção à equipe gestora.' };
  }
  r.reabrir = ehSim_(cfg.PROFESSOR_PODE_REABRIR);
  return r;
}

/**
 * Proteção das funções executadas pelo editor (setupSistema, verificarSistema, backup...).
 * Como o navegador pode chamar qualquer função pública via google.script.run, estas
 * funções verificam se quem executa é o instalador do sistema ou um ADMIN ativo.
 */
function exigirExecucaoAdministrativa_() {
  var email = emailAtual_();
  if (!email) throw new Error('Operação administrativa bloqueada: identidade do usuário não confirmada.');
  var instalador = PropertiesService.getScriptProperties().getProperty(PROP_INSTALADOR);
  if (!instalador) return email; // primeira instalação (ainda não há dados a proteger)
  if (email === String(instalador).toLowerCase()) return email;
  if (sistemaInstalado_()) {
    var u = null;
    try { u = usuarioAtual_(); } catch (e) { u = null; }
    if (u && u.perfil === PERFIL.ADMIN) return email;
  }
  throw new Error('Operação administrativa não autorizada para ' + email + '.');
}


// ============================================================================
// ARQUIVO ORIGINAL: Audit.gs
// ============================================================================

/**
 * Audit.gs — Registro de auditoria (aba AUDITORIA).
 *
 * A auditoria é somente de inclusão: o sistema não oferece nenhuma função que
 * altere ou apague registros desta aba.
 */

/**
 * Monta um registro de auditoria. Os registros são gravados em lote por registrarAuditoria_.
 * campos: { acao, entidade, registroId, estudante, turma, anterior, novo, motivo, detalhes }
 */
function novaAuditoria_(usuarioEmail, campos) {
  return {
    ID: gerarId_('AUD'),
    DATA_HORA: agora_(),
    USUARIO: usuarioEmail || '(desconhecido)',
    ACAO: campos.acao || '',
    ENTIDADE: campos.entidade || '',
    REGISTRO_ID: campos.registroId || '',
    ESTUDANTE: campos.estudante || '',
    TURMA: campos.turma || '',
    VALOR_ANTERIOR: campos.anterior === undefined ? '' : String(campos.anterior),
    VALOR_NOVO: campos.novo === undefined ? '' : String(campos.novo),
    MOTIVO: texto_(campos.motivo || '', 500),
    DETALHES: texto_(campos.detalhes || '', 1000)
  };
}

/** Grava vários registros de auditoria com um único setValues. Deve rodar dentro de comLock_. */
function registrarAuditoria_(registros) {
  if (registros && registros.length) inserirRegistros_('AUDITORIA', registros);
}

/** Atalho para um único evento (já dentro de comLock_). */
function auditar_(usuarioEmail, campos) {
  registrarAuditoria_([novaAuditoria_(usuarioEmail, campos)]);
}

/**
 * API: consulta a auditoria com filtros e paginação.
 * filtros: { registroId, turmaId, acao, inicio, fim, pagina, porPagina }
 * Professores só veem eventos das próprias turmas.
 */
function apiListarAuditoria(filtros) {
  return executar_('apiListarAuditoria', function () {
    var u = exigirUsuario_();
    filtros = filtros || {};
    var lista = lerTabela_('AUDITORIA');
    var turmasPermitidas = {};
    turmasDoUsuario_(u, true).forEach(function (t) { turmasPermitidas[t.ID] = 1; });
    var ini = filtros.inicio ? validarData_(filtros.inicio, 'Data inicial') : '';
    var fim = filtros.fim ? validarData_(filtros.fim, 'Data final') : '';
    var filtrados = lista.filter(function (a) {
      if (filtros.registroId && a.REGISTRO_ID !== filtros.registroId && String(a.DETALHES).indexOf(filtros.registroId) < 0) return false;
      if (filtros.turmaId && a.TURMA !== filtros.turmaId) return false;
      if (filtros.acao && a.ACAO !== filtros.acao) return false;
      var dia = String(a.DATA_HORA).slice(0, 10);
      if (ini && dia < ini) return false;
      if (fim && dia > fim) return false;
      if (!ehGestao_(u) && !turmasPermitidas[a.TURMA]) return false;
      return true;
    });
    filtrados.reverse(); // mais recentes primeiro
    var porPagina = Math.min(Math.max(Number(filtros.porPagina) || 50, 10), 200);
    var pagina = Math.max(Number(filtros.pagina) || 1, 1);
    var nomesTurma = {};
    lerTabela_('TURMAS').forEach(function (t) { nomesTurma[t.ID] = t.NOME; });
    var itens = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina).map(function (a) {
      var o = semLinha_(a);
      o.TURMA_NOME = nomesTurma[a.TURMA] || '';
      return o;
    });
    return { itens: itens, total: filtrados.length, pagina: pagina, paginas: Math.max(1, Math.ceil(filtrados.length / porPagina)) };
  });
}


// ============================================================================
// ARQUIVO ORIGINAL: Students.gs
// ============================================================================

/**
 * Students.gs — Cadastros: turmas, estudantes e professores.
 *
 * Regras:
 *  - Nada é excluído: estudantes e turmas são INATIVADOS; o histórico é preservado.
 *  - Cada estudante tem ID único (independente do número de chamada).
 *  - O número de chamada é único entre os estudantes ATIVOS da mesma turma.
 *  - Toda alteração gera registro na AUDITORIA.
 */

var SITUACAO_ESTUDANTE = { ATIVO: 'ATIVO', INATIVO: 'INATIVO' };

// ------------------------------------------------------------------ Conversões para o navegador

function turmaParaCliente_(t, estudantes) {
  var ativos = (estudantes || []).filter(function (e) { return e.TURMA_ID === t.ID && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO; }).length;
  return {
    id: t.ID, nome: t.NOME, anoSerie: t.ANO_SERIE, turno: t.TURNO, anoLetivo: t.ANO_LETIVO,
    dataInicio: t.DATA_INICIO, ativa: ehSim_(t.ATIVA), estudantesAtivos: ativos
  };
}

function estudanteParaCliente_(e, turmasPorId) {
  return {
    id: e.ID, turmaId: e.TURMA_ID, turmaNome: turmasPorId && turmasPorId[e.TURMA_ID] ? turmasPorId[e.TURMA_ID].NOME : '',
    numero: e.NUMERO, nome: e.NOME, situacao: e.SITUACAO, dataEntrada: e.DATA_ENTRADA, dataSaida: e.DATA_SAIDA,
    turmaAnteriorId: e.TURMA_ANTERIOR_ID, dataTransferencia: e.DATA_TRANSFERENCIA, observacao: e.OBSERVACAO
  };
}

// ------------------------------------------------------------------ Turmas

function apiListarTurmas(incluirInativas) {
  return executar_('apiListarTurmas', function () {
    var u = exigirUsuario_();
    var estudantes = lerTabela_('ESTUDANTES');
    return turmasDoUsuario_(u, !!incluirInativas && ehGestao_(u)).map(function (t) { return turmaParaCliente_(t, estudantes); });
  });
}

/** Cria (sem id) ou edita (com id) uma turma. Somente ADMIN. */
function apiSalvarTurma(dados) {
  return executar_('apiSalvarTurma', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    dados = dados || {};
    var nome = texto_(dados.nome, 80);
    if (nome.length < 2) throw appError_('DADOS_INVALIDOS', 'Informe o nome da turma.');
    var dataInicio = validarData_(dados.dataInicio, 'Data de início');
    var anoSerie = texto_(dados.anoSerie, 40);
    var turno = texto_(dados.turno, 30);
    var anoLetivo = texto_(dados.anoLetivo || dataInicio.slice(0, 4), 10);
    return comLock_(function () {
      var turmas = lerTabela_('TURMAS', { fresco: true });
      var duplicada = turmas.filter(function (t) {
        return normalizarNome_(t.NOME) === normalizarNome_(nome) && String(t.ANO_LETIVO) === anoLetivo && t.ID !== dados.id;
      });
      if (duplicada.length) throw appError_('DUPLICADO', 'Já existe uma turma com este nome no ano letivo ' + anoLetivo + '.');
      if (dados.id) {
        var t = indexarPor_(turmas, 'ID')[dados.id];
        if (!t) throw appError_('NAO_ENCONTRADO', 'Turma não encontrada.');
        var antes = JSON.stringify({ nome: t.NOME, anoSerie: t.ANO_SERIE, turno: t.TURNO, anoLetivo: t.ANO_LETIVO, dataInicio: t.DATA_INICIO });
        t.NOME = nome; t.ANO_SERIE = anoSerie; t.TURNO = turno; t.ANO_LETIVO = anoLetivo; t.DATA_INICIO = dataInicio;
        t.ATUALIZADO_EM = agora_(); t.ATUALIZADO_POR = u.email;
        atualizarRegistros_('TURMAS', [t]);
        auditar_(u.email, { acao: 'EDICAO_TURMA', entidade: 'TURMAS', registroId: t.ID, turma: t.ID, anterior: antes,
          novo: JSON.stringify({ nome: nome, anoSerie: anoSerie, turno: turno, anoLetivo: anoLetivo, dataInicio: dataInicio }) });
        return turmaParaCliente_(t, lerTabela_('ESTUDANTES'));
      }
      var nova = {
        ID: gerarId_('TUR'), NOME: nome, ANO_SERIE: anoSerie, TURNO: turno, ANO_LETIVO: anoLetivo, DATA_INICIO: dataInicio,
        ATIVA: 'SIM', CRIADO_EM: agora_(), CRIADO_POR: u.email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: u.email
      };
      inserirRegistros_('TURMAS', [nova]);
      auditar_(u.email, { acao: 'CRIACAO_TURMA', entidade: 'TURMAS', registroId: nova.ID, turma: nova.ID, novo: nome });
      return turmaParaCliente_(nova, []);
    });
  });
}

/** Ativa ou inativa uma turma (nunca exclui). Somente ADMIN. */
function apiAlterarStatusTurma(turmaId, ativa, motivo) {
  return executar_('apiAlterarStatusTurma', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    return comLock_(function () {
      var t = indexarPor_(lerTabela_('TURMAS', { fresco: true }), 'ID')[turmaId];
      if (!t) throw appError_('NAO_ENCONTRADO', 'Turma não encontrada.');
      var novo = ativa ? 'SIM' : 'NAO';
      if (t.ATIVA === novo) return turmaParaCliente_(t, lerTabela_('ESTUDANTES'));
      var anterior = t.ATIVA;
      t.ATIVA = novo; t.ATUALIZADO_EM = agora_(); t.ATUALIZADO_POR = u.email;
      atualizarRegistros_('TURMAS', [t]);
      auditar_(u.email, { acao: ativa ? 'REATIVACAO_TURMA' : 'INATIVACAO_TURMA', entidade: 'TURMAS', registroId: t.ID, turma: t.ID,
        anterior: anterior, novo: novo, motivo: motivo });
      return turmaParaCliente_(t, lerTabela_('ESTUDANTES'));
    });
  });
}

// ------------------------------------------------------------------ Estudantes

function apiListarEstudantes(turmaId, incluirInativos) {
  return executar_('apiListarEstudantes', function () {
    var u = exigirUsuario_();
    exigirTurma_(u, turmaId);
    var turmasPorId = indexarPor_(lerTabela_('TURMAS'), 'ID');
    return lerTabela_('ESTUDANTES')
      .filter(function (e) { return e.TURMA_ID === turmaId && (incluirInativos || e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO); })
      .map(function (e) { return estudanteParaCliente_(e, turmasPorId); })
      .sort(ordenarPorNumero_);
  });
}

/** Verifica se o número de chamada já pertence a outro estudante ATIVO da turma. */
function numeroOcupado_(estudantes, turmaId, numero, exceto) {
  for (var i = 0; i < estudantes.length; i++) {
    var e = estudantes[i];
    if (e.TURMA_ID === turmaId && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO && Number(e.NUMERO) === Number(numero) && e.ID !== exceto) return e;
  }
  return null;
}

function proximoNumero_(estudantes, turmaId) {
  var max = 0;
  estudantes.forEach(function (e) {
    if (e.TURMA_ID === turmaId && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO) max = Math.max(max, Number(e.NUMERO) || 0);
  });
  return max + 1;
}

/** Cria (sem id) ou edita (com id) estudante. ADMIN e GESTOR. */
function apiSalvarEstudante(dados) {
  return executar_('apiSalvarEstudante', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    dados = dados || {};
    var nome = validarNomePessoa_(dados.nome, 'nome do estudante');
    var observacao = texto_(dados.observacao, 300);
    return comLock_(function () {
      var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
      var turmasPorId = indexarPor_(lerTabela_('TURMAS', { fresco: true }), 'ID');
      if (dados.id) {
        var e = indexarPor_(estudantes, 'ID')[dados.id];
        if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
        exigirTurma_(u, e.TURMA_ID);
        var numero = inteiro_(dados.numero, 1, 999, 'Número de chamada');
        if (e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO) {
          var ocupado = numeroOcupado_(estudantes, e.TURMA_ID, numero, e.ID);
          if (ocupado) throw appError_('DUPLICADO', 'O número ' + numero + ' já pertence a ' + ocupado.NOME + '. Altere primeiro o número desse estudante.');
        }
        var aud = [];
        if (e.NOME !== nome) aud.push(novaAuditoria_(u.email, { acao: 'EDICAO_NOME_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: nome, turma: e.TURMA_ID, anterior: e.NOME, novo: nome }));
        if (Number(e.NUMERO) !== numero) aud.push(novaAuditoria_(u.email, { acao: 'EDICAO_NUMERO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: nome, turma: e.TURMA_ID, anterior: e.NUMERO, novo: numero }));
        if (String(e.OBSERVACAO) !== observacao) aud.push(novaAuditoria_(u.email, { acao: 'EDICAO_OBSERVACAO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: nome, turma: e.TURMA_ID, anterior: e.OBSERVACAO, novo: observacao }));
        if (!aud.length) return estudanteParaCliente_(e, turmasPorId);
        e.NOME = nome; e.NUMERO = numero; e.OBSERVACAO = observacao; e.ATUALIZADO_EM = agora_(); e.ATUALIZADO_POR = u.email;
        atualizarRegistros_('ESTUDANTES', [e]);
        registrarAuditoria_(aud);
        return estudanteParaCliente_(e, turmasPorId);
      }
      var turma = exigirTurma_(u, dados.turmaId);
      var dataEntrada = dados.dataEntrada ? validarData_(dados.dataEntrada, 'Data de entrada') : hoje_();
      if (turma.DATA_INICIO && dataEntrada < turma.DATA_INICIO) dataEntrada = turma.DATA_INICIO;
      var duplicado = estudantes.filter(function (x) {
        return x.TURMA_ID === turma.ID && x.SITUACAO === SITUACAO_ESTUDANTE.ATIVO && normalizarNome_(x.NOME) === normalizarNome_(nome);
      });
      if (duplicado.length && !dados.confirmarHomonimo) {
        throw appError_('HOMONIMO', 'Já existe um estudante ativo com este nome nesta turma (nº ' + duplicado[0].NUMERO + '). Confirme se não é um cadastro duplicado.');
      }
      var num = dados.numero ? inteiro_(dados.numero, 1, 999, 'Número de chamada') : proximoNumero_(estudantes, turma.ID);
      var ocup = numeroOcupado_(estudantes, turma.ID, num, null);
      if (ocup) throw appError_('DUPLICADO', 'O número ' + num + ' já pertence a ' + ocup.NOME + '.');
      var novo = {
        ID: gerarId_('EST'), TURMA_ID: turma.ID, NUMERO: num, NOME: nome, SITUACAO: SITUACAO_ESTUDANTE.ATIVO,
        DATA_ENTRADA: dataEntrada, DATA_SAIDA: '', TURMA_ANTERIOR_ID: '', NUMERO_ANTERIOR: '', DATA_TRANSFERENCIA: '',
        OBSERVACAO: observacao, CRIADO_EM: agora_(), CRIADO_POR: u.email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: u.email
      };
      inserirRegistros_('ESTUDANTES', [novo]);
      auditar_(u.email, { acao: 'CADASTRO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: novo.ID, estudante: nome, turma: turma.ID, novo: 'Nº ' + num + ' — ' + nome });
      return estudanteParaCliente_(novo, turmasPorId);
    });
  });
}

/** Inativa (ativo=false, exige motivo) ou reativa um estudante. Histórico preservado. */
function apiAlterarStatusEstudante(estudanteId, ativo, motivo, dataSaida) {
  return executar_('apiAlterarStatusEstudante', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    motivo = texto_(motivo, 300);
    if (!ativo && motivo.length < 3) throw appError_('DADOS_INVALIDOS', 'Informe o motivo da inativação.');
    return comLock_(function () {
      var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
      var e = indexarPor_(estudantes, 'ID')[estudanteId];
      if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
      exigirTurma_(u, e.TURMA_ID);
      var anterior = e.SITUACAO;
      if (ativo) {
        if (e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO) return estudanteParaCliente_(e, null);
        var ocupado = numeroOcupado_(estudantes, e.TURMA_ID, e.NUMERO, e.ID);
        if (ocupado) e.NUMERO = proximoNumero_(estudantes, e.TURMA_ID);
        e.SITUACAO = SITUACAO_ESTUDANTE.ATIVO;
        e.DATA_SAIDA = '';
      } else {
        if (e.SITUACAO !== SITUACAO_ESTUDANTE.ATIVO) return estudanteParaCliente_(e, null);
        var saida = dataSaida ? validarData_(dataSaida, 'Data de saída') : hoje_();
        if (saida < e.DATA_ENTRADA) throw appError_('DADOS_INVALIDOS', 'A data de saída não pode ser anterior à data de entrada.');
        e.SITUACAO = SITUACAO_ESTUDANTE.INATIVO;
        e.DATA_SAIDA = saida;
      }
      e.ATUALIZADO_EM = agora_(); e.ATUALIZADO_POR = u.email;
      atualizarRegistros_('ESTUDANTES', [e]);
      auditar_(u.email, { acao: ativo ? 'REATIVACAO_ESTUDANTE' : 'INATIVACAO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID,
        estudante: e.NOME, turma: e.TURMA_ID, anterior: anterior, novo: e.SITUACAO, motivo: motivo,
        detalhes: ativo ? 'Número de chamada: ' + e.NUMERO : 'Data de saída: ' + e.DATA_SAIDA });
      return estudanteParaCliente_(e, null);
    });
  });
}

/**
 * Transfere estudante para outra turma. Os registros de frequência antigos permanecem
 * vinculados à turma de origem (nada é apagado).
 */
function apiTransferirEstudante(estudanteId, novaTurmaId, dataTransferencia, motivo) {
  return executar_('apiTransferirEstudante', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    var data = validarData_(dataTransferencia || hoje_(), 'Data da transferência');
    motivo = texto_(motivo, 300);
    return comLock_(function () {
      var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
      var e = indexarPor_(estudantes, 'ID')[estudanteId];
      if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
      if (e.SITUACAO !== SITUACAO_ESTUDANTE.ATIVO) throw appError_('DADOS_INVALIDOS', 'Somente estudantes ativos podem ser transferidos.');
      var origem = exigirTurma_(u, e.TURMA_ID);
      var destino = exigirTurma_(u, novaTurmaId);
      if (origem.ID === destino.ID) throw appError_('DADOS_INVALIDOS', 'Escolha uma turma diferente da atual.');
      if (!ehSim_(destino.ATIVA)) throw appError_('DADOS_INVALIDOS', 'A turma de destino está inativa.');
      if (data < e.DATA_ENTRADA) throw appError_('DADOS_INVALIDOS', 'A data da transferência não pode ser anterior à entrada do estudante.');
      var novoNumero = proximoNumero_(estudantes, destino.ID);
      var anteriorTxt = origem.NOME + ' (nº ' + e.NUMERO + ')';
      e.TURMA_ANTERIOR_ID = origem.ID;
      e.NUMERO_ANTERIOR = e.NUMERO;
      e.DATA_TRANSFERENCIA = data;
      e.TURMA_ID = destino.ID;
      e.NUMERO = novoNumero;
      e.DATA_ENTRADA = data;
      e.ATUALIZADO_EM = agora_(); e.ATUALIZADO_POR = u.email;
      atualizarRegistros_('ESTUDANTES', [e]);
      registrarAuditoria_([
        novaAuditoria_(u.email, { acao: 'TRANSFERENCIA_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: e.NOME, turma: origem.ID,
          anterior: anteriorTxt, novo: destino.NOME + ' (nº ' + novoNumero + ')', motivo: motivo, detalhes: 'Data: ' + data }),
        novaAuditoria_(u.email, { acao: 'TRANSFERENCIA_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: e.NOME, turma: destino.ID,
          anterior: anteriorTxt, novo: destino.NOME + ' (nº ' + novoNumero + ')', motivo: motivo, detalhes: 'Data: ' + data })
      ]);
      return estudanteParaCliente_(e, indexarPor_(lerTabela_('TURMAS'), 'ID'));
    });
  });
}

// ------------------------------------------------------------------ Professores / usuários

function professorParaCliente_(p) {
  return { id: p.ID, nome: p.NOME, email: p.EMAIL, perfil: p.PERFIL, turmas: String(p.TURMAS || ''), ativo: ehSim_(p.ATIVO) };
}

function apiListarProfessores() {
  return executar_('apiListarProfessores', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    return lerTabela_('PROFESSORES').map(professorParaCliente_)
      .sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome)); });
  });
}

/** Cria ou edita usuário (professor, gestor ou administrador). Somente ADMIN. */
function apiSalvarProfessor(dados) {
  return executar_('apiSalvarProfessor', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    dados = dados || {};
    var nome = validarNomePessoa_(dados.nome, 'nome');
    var email = validarEmail_(dados.email);
    var perfil = String(dados.perfil || '').toUpperCase();
    if (PERFIS_VALIDOS.indexOf(perfil) < 0) throw appError_('DADOS_INVALIDOS', 'Perfil inválido.');
    var turmasIds = (Array.isArray(dados.turmas) ? dados.turmas : String(dados.turmas || '').split(/[;,]/))
      .map(function (s) { return String(s).trim(); }).filter(String);
    return comLock_(function () {
      var turmasPorId = indexarPor_(lerTabela_('TURMAS', { fresco: true }), 'ID');
      turmasIds.forEach(function (id) {
        if (id !== '*' && !turmasPorId[id]) throw appError_('DADOS_INVALIDOS', 'Turma inexistente: ' + id);
      });
      if (perfil === PERFIL.PROFESSOR && !turmasIds.length) throw appError_('DADOS_INVALIDOS', 'Selecione pelo menos uma turma para o professor.');
      var profs = lerTabela_('PROFESSORES', { fresco: true });
      var mesmoEmail = profs.filter(function (p) { return String(p.EMAIL).toLowerCase() === email && p.ID !== dados.id; });
      if (mesmoEmail.length) throw appError_('DUPLICADO', 'Este e-mail já está cadastrado.');
      var turmasTxt = turmasIds.join(';');
      if (dados.id) {
        var p = indexarPor_(profs, 'ID')[dados.id];
        if (!p) throw appError_('NAO_ENCONTRADO', 'Usuário não encontrado.');
        if (p.EMAIL === u.email && perfil !== PERFIL.ADMIN) throw appError_('SEM_PERMISSAO', 'Você não pode remover o seu próprio perfil de administrador.');
        var antes = JSON.stringify({ nome: p.NOME, email: p.EMAIL, perfil: p.PERFIL, turmas: p.TURMAS });
        p.NOME = nome; p.EMAIL = email; p.PERFIL = perfil; p.TURMAS = turmasTxt; p.ATUALIZADO_EM = agora_(); p.ATUALIZADO_POR = u.email;
        atualizarRegistros_('PROFESSORES', [p]);
        auditar_(u.email, { acao: 'EDICAO_USUARIO', entidade: 'PROFESSORES', registroId: p.ID, anterior: antes,
          novo: JSON.stringify({ nome: nome, email: email, perfil: perfil, turmas: turmasTxt }) });
        return professorParaCliente_(p);
      }
      var novo = { ID: gerarId_('PRO'), NOME: nome, EMAIL: email, PERFIL: perfil, TURMAS: turmasTxt, ATIVO: 'SIM',
        CRIADO_EM: agora_(), CRIADO_POR: u.email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: u.email };
      inserirRegistros_('PROFESSORES', [novo]);
      auditar_(u.email, { acao: 'CADASTRO_USUARIO', entidade: 'PROFESSORES', registroId: novo.ID, novo: nome + ' <' + email + '> ' + perfil });
      return professorParaCliente_(novo);
    });
  });
}

function apiAlterarStatusProfessor(professorId, ativo) {
  return executar_('apiAlterarStatusProfessor', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    return comLock_(function () {
      var profs = lerTabela_('PROFESSORES', { fresco: true });
      var p = indexarPor_(profs, 'ID')[professorId];
      if (!p) throw appError_('NAO_ENCONTRADO', 'Usuário não encontrado.');
      if (String(p.EMAIL).toLowerCase() === u.email && !ativo) throw appError_('SEM_PERMISSAO', 'Você não pode desativar o seu próprio acesso.');
      var novo = ativo ? 'SIM' : 'NAO';
      if (p.ATIVO !== novo) {
        var anterior = p.ATIVO;
        p.ATIVO = novo; p.ATUALIZADO_EM = agora_(); p.ATUALIZADO_POR = u.email;
        atualizarRegistros_('PROFESSORES', [p]);
        auditar_(u.email, { acao: ativo ? 'REATIVACAO_USUARIO' : 'DESATIVACAO_USUARIO', entidade: 'PROFESSORES', registroId: p.ID, anterior: anterior, novo: novo, detalhes: p.EMAIL });
      }
      return professorParaCliente_(p);
    });
  });
}


// ============================================================================
// ARQUIVO ORIGINAL: Attendance.gs
// ============================================================================

/**
 * Attendance.gs — Chamada: carregar, salvar (rascunho), finalizar, reabrir, corrigir e histórico.
 *
 * Garantias de confiabilidade:
 *  - Toda gravação ocorre sob LockService (comLock_).
 *  - Controle de versão (VERSAO): se outra pessoa alterou a chamada depois que ela foi
 *    aberta, a gravação é recusada (CONFLITO) em vez de sobrescrever silenciosamente.
 *  - Idempotência: cada envio tem um requestId; se o mesmo envio chegar duas vezes
 *    (ex.: nova tentativa após queda de conexão), não há duplicação.
 *  - Uma chamada por turma + data + período (chave única).
 *  - Finalização só com todos os estudantes registrados.
 */

var STATUS_CHAMADA = { RASCUNHO: 'RASCUNHO', FINALIZADA: 'FINALIZADA' };
var PERIODO_UNICO = 'DIARIO';

/** Lista de períodos configurados; sem configuração, uma chamada por dia. */
function periodosConfigurados_(cfg) {
  var lista = String(cfg.PERIODOS || '').split(';').map(function (s) { return texto_(s, 40); }).filter(String);
  return lista.length ? lista : [PERIODO_UNICO];
}

function validarPeriodo_(periodo, cfg, permitirExistente) {
  var p = texto_(periodo || PERIODO_UNICO, 40);
  if (periodosConfigurados_(cfg).indexOf(p) < 0 && !permitirExistente) {
    throw appError_('DADOS_INVALIDOS', 'Período/aula inválido: ' + p);
  }
  return p;
}

/**
 * Estudantes que devem constar na chamada de uma turma numa data:
 *  - matriculados na turma na data (entrada <= data e sem saída até a data), ou
 *  - transferidos DEPOIS da data (constam na turma de origem para datas anteriores).
 */
function estudantesElegiveis_(turmaId, data, estudantes) {
  var r = [];
  for (var i = 0; i < estudantes.length; i++) {
    var e = estudantes[i];
    var ativoNaData = (!e.DATA_SAIDA || e.DATA_SAIDA > data) && (e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO || e.DATA_SAIDA);
    if (e.TURMA_ID === turmaId && e.DATA_ENTRADA <= data && ativoNaData) {
      r.push({ id: e.ID, numero: e.NUMERO, nome: e.NOME });
    } else if (e.TURMA_ANTERIOR_ID === turmaId && e.DATA_TRANSFERENCIA > data) {
      r.push({ id: e.ID, numero: e.NUMERO_ANTERIOR, nome: e.NOME });
    }
  }
  return r;
}

function buscarChamada_(chamadas, turmaId, data, periodo) {
  for (var i = 0; i < chamadas.length; i++) {
    var c = chamadas[i];
    if (c.TURMA_ID === turmaId && c.DATA === data && c.PERIODO === periodo) return c;
  }
  return null;
}

function chamadaParaCliente_(c) {
  if (!c) return null;
  return {
    id: c.ID, turmaId: c.TURMA_ID, data: c.DATA, periodo: c.PERIODO, status: c.STATUS, versao: Number(c.VERSAO) || 0,
    professorEmail: c.PROFESSOR_EMAIL, professorNome: c.PROFESSOR_NOME,
    total: c.TOTAL, presentes: c.PRESENTES, ausentes: c.AUSENTES, atrasados: c.ATRASADOS,
    justificados: c.JUSTIFICADOS, naoRegistrados: c.NAO_REGISTRADOS,
    criadoEm: c.CRIADO_EM, atualizadoEm: c.ATUALIZADO_EM, atualizadoPor: c.ATUALIZADO_POR,
    finalizadoEm: c.FINALIZADO_EM, finalizadoPor: c.FINALIZADO_POR
  };
}

/** Monta a lista de estudantes da chamada (elegíveis + quem já tem registro), em ordem numérica. */
function montarListaChamada_(turmaId, data, registros) {
  var estudantes = lerTabela_('ESTUDANTES');
  var porId = indexarPor_(estudantes, 'ID');
  var elegiveis = estudantesElegiveis_(turmaId, data, estudantes);
  var regPorEst = indexarPor_(registros, 'ESTUDANTE_ID');
  var vistos = {};
  var lista = elegiveis.map(function (e) {
    vistos[e.id] = 1;
    var r = regPorEst[e.id];
    return { id: e.id, numero: e.numero, nome: e.nome, situacao: r ? r.SITUACAO : SITUACAO.NAO_REGISTRADO, observacao: r ? r.OBSERVACAO : '', inativo: false };
  });
  registros.forEach(function (r) {
    if (vistos[r.ESTUDANTE_ID]) return;
    var e = porId[r.ESTUDANTE_ID];
    lista.push({ id: r.ESTUDANTE_ID, numero: r.NUMERO, nome: e ? e.NOME : r.NOME_ESTUDANTE, situacao: r.SITUACAO, observacao: r.OBSERVACAO, inativo: true });
  });
  return lista.sort(ordenarPorNumero_);
}

function contarSituacoes_(lista, campo) {
  var c = { TOTAL: lista.length, PRESENTES: 0, AUSENTES: 0, ATRASADOS: 0, JUSTIFICADOS: 0, NAO_REGISTRADOS: 0 };
  lista.forEach(function (x) {
    var s = x[campo];
    if (s === SITUACAO.PRESENTE) c.PRESENTES++;
    else if (s === SITUACAO.AUSENTE) c.AUSENTES++;
    else if (s === SITUACAO.ATRASADO) c.ATRASADOS++;
    else if (s === SITUACAO.JUSTIFICADA) c.JUSTIFICADOS++;
    else c.NAO_REGISTRADOS++;
  });
  return c;
}

/** Estado completo de uma chamada (para a tela de chamada e para o histórico). */
function estadoChamada_(u, turma, data, periodo, cfg, chamada) {
  var registros = chamada ? lerLinhasPorValor_('FREQUENCIAS', 'CHAMADA_ID', chamada.ID) : [];
  var perm = permissoesChamada_(u, turma, data, cfg);
  return {
    turma: { id: turma.ID, nome: turma.NOME },
    data: data,
    periodo: periodo,
    chamada: chamadaParaCliente_(chamada),
    estudantes: montarListaChamada_(turma.ID, data, registros),
    permissoes: perm
  };
}

/** API: abre a chamada de uma turma numa data/período (existente ou nova). */
function apiCarregarChamada(p) {
  return executar_('apiCarregarChamada', function () {
    var u = exigirUsuario_();
    p = p || {};
    var cfg = config_();
    var turma = exigirTurma_(u, p.turmaId);
    var data = validarData_(p.data, 'Data');
    var chamadas = lerTabela_('CHAMADAS');
    var periodo = validarPeriodo_(p.periodo, cfg, !!buscarChamada_(chamadas, turma.ID, data, texto_(p.periodo || PERIODO_UNICO, 40)));
    return estadoChamada_(u, turma, data, periodo, cfg, buscarChamada_(chamadas, turma.ID, data, periodo));
  });
}

/** API: abre uma chamada pelo ID (histórico). */
function apiDetalheChamada(chamadaId) {
  return executar_('apiDetalheChamada', function () {
    var u = exigirUsuario_();
    var c = indexarPor_(lerTabela_('CHAMADAS'), 'ID')[chamadaId];
    if (!c) throw appError_('NAO_ENCONTRADO', 'Chamada não encontrada.');
    var turma = exigirTurma_(u, c.TURMA_ID);
    var estado = estadoChamada_(u, turma, c.DATA, c.PERIODO, config_(), c);
    estado.auditoria = lerLinhasPorValor_('AUDITORIA', 'REGISTRO_ID', c.ID).map(semLinha_).reverse();
    return estado;
  });
}

/**
 * API: salva a chamada (rascunho) e, opcionalmente, finaliza.
 * p = { turmaId, data, periodo, chamadaId, versao, requestId, finalizar,
 *       registros: [{ estudanteId, situacao, observacao }] }
 */
function apiSalvarChamada(p) {
  return executar_('apiSalvarChamada', function () {
    var u = exigirUsuario_();
    p = p || {};
    var data = validarData_(p.data, 'Data');
    var requestId = texto_(p.requestId, 60);
    if (!Array.isArray(p.registros)) throw appError_('DADOS_INVALIDOS', 'Nenhum registro enviado.');
    if (p.registros.length > 500) throw appError_('DADOS_INVALIDOS', 'Quantidade de registros acima do limite.');

    // Validação dos dados recebidos ANTES de bloquear a planilha.
    var recebidos = {};
    p.registros.forEach(function (r) {
      var id = String(r && r.estudanteId || '');
      var s = String(r && r.situacao || '');
      if (!id) throw appError_('DADOS_INVALIDOS', 'Registro sem identificação do estudante.');
      if (SITUACOES_VALIDAS.indexOf(s) < 0) throw appError_('DADOS_INVALIDOS', 'Situação inválida: ' + s);
      recebidos[id] = { situacao: s, observacao: s === SITUACAO.JUSTIFICADA || s === SITUACAO.ATRASADO ? texto_(r.observacao, 200) : '' };
    });

    return comLock_(function () {
      var cfg = config_();
      var turma = exigirTurma_(u, p.turmaId);
      var chamadas = lerTabela_('CHAMADAS', { fresco: true });
      var periodoTxt = texto_(p.periodo || PERIODO_UNICO, 40);
      var existente = buscarChamada_(chamadas, turma.ID, data, periodoTxt);
      var periodo = validarPeriodo_(periodoTxt, cfg, !!existente);
      var perm = permissoesChamada_(u, turma, data, cfg);
      if (!perm.editar) throw appError_('SEM_PERMISSAO', perm.motivo);

      // Envio repetido (nova tentativa automática): devolve o estado atual sem regravar.
      if (existente && requestId && existente.ULTIMA_OPERACAO === requestId) {
        var est = estadoChamada_(u, turma, data, periodo, cfg, existente);
        est.repetido = true;
        return est;
      }
      var versaoCliente = Number(p.versao) || 0;
      if (existente) {
        if ((p.chamadaId && p.chamadaId !== existente.ID) || versaoCliente !== Number(existente.VERSAO)) {
          throw appError_('CONFLITO', 'Esta chamada foi alterada por ' + (existente.ATUALIZADO_POR || 'outro usuário') +
            ' às ' + dataHoraBr_(existente.ATUALIZADO_EM) + ' enquanto você a editava. Recarregue para ver a versão atual.',
            estadoChamada_(u, turma, data, periodo, cfg, existente));
        }
        if (existente.STATUS === STATUS_CHAMADA.FINALIZADA) {
          throw appError_('FINALIZADA', 'Esta chamada já está finalizada. Para alterar, utilize "Reabrir para correção".');
        }
      } else if (p.chamadaId || versaoCliente > 0) {
        throw appError_('CONFLITO', 'A chamada que você editava não foi encontrada no servidor. Recarregue a página.');
      }

      var registrosAtuais = existente ? lerLinhasPorValor_('FREQUENCIAS', 'CHAMADA_ID', existente.ID) : [];
      var lista = montarListaChamada_(turma.ID, data, registrosAtuais);
      var naLista = indexarPor_(lista, 'id');
      Object.keys(recebidos).forEach(function (id) {
        if (!naLista[id]) throw appError_('DADOS_INVALIDOS', 'Um dos estudantes enviados não pertence a esta turma nesta data. Recarregue a chamada.');
      });

      // Situação final de cada estudante (enviado pelo professor ou mantido).
      lista.forEach(function (e) {
        e.anterior = e.situacao;
        e.observacaoAnterior = e.observacao;
        if (recebidos[e.id]) { e.situacao = recebidos[e.id].situacao; e.observacao = recebidos[e.id].observacao; }
      });
      var cont = contarSituacoes_(lista, 'situacao');
      if (p.finalizar && cont.NAO_REGISTRADOS > 0) {
        throw appError_('PENDENTES', 'Não é possível finalizar: ' + cont.NAO_REGISTRADOS + ' estudante(s) sem situação registrada. A chamada pode ser salva como rascunho.');
      }

      var momento = agora_();
      var chamada = existente;
      var auditoria = [];
      if (!chamada) {
        chamada = {
          ID: gerarId_('CHA'), TURMA_ID: turma.ID, DATA: data, PERIODO: periodo, STATUS: STATUS_CHAMADA.RASCUNHO, VERSAO: 0,
          PROFESSOR_EMAIL: u.email, PROFESSOR_NOME: u.nome, CRIADO_EM: momento, CRIADO_POR: u.email,
          FINALIZADO_EM: '', FINALIZADO_POR: ''
        };
        auditoria.push(novaAuditoria_(u.email, { acao: 'CRIACAO_CHAMADA', entidade: 'CHAMADAS', registroId: chamada.ID, turma: turma.ID,
          novo: STATUS_CHAMADA.RASCUNHO, detalhes: 'Data ' + dataBr_(data) + ' — ' + periodo }));
      }

      // Registros de frequência: atualiza os existentes alterados e insere os novos.
      var regPorEst = indexarPor_(registrosAtuais, 'ESTUDANTE_ID');
      var atualizar = [], inserir = [];
      lista.forEach(function (e) {
        var r = regPorEst[e.id];
        if (r) {
          if (r.SITUACAO !== e.situacao || String(r.OBSERVACAO) !== String(e.observacao)) {
            if (r.SITUACAO !== e.situacao && r.SITUACAO !== SITUACAO.NAO_REGISTRADO) {
              auditoria.push(novaAuditoria_(u.email, { acao: 'ALTERACAO_SITUACAO', entidade: 'FREQUENCIAS', registroId: r.ID,
                estudante: e.nome, turma: turma.ID, anterior: r.SITUACAO, novo: e.situacao,
                detalhes: 'Chamada ' + chamada.ID + ' — ' + dataBr_(data) + ' — ' + periodo }));
            }
            r.SITUACAO = e.situacao; r.OBSERVACAO = e.observacao; r.NUMERO = e.numero; r.NOME_ESTUDANTE = e.nome;
            r.ATUALIZADO_EM = momento; r.ATUALIZADO_POR = u.email;
            atualizar.push(r);
          }
        } else {
          inserir.push({
            ID: gerarId_('FRE'), CHAMADA_ID: chamada.ID, TURMA_ID: turma.ID, DATA: data, PERIODO: periodo,
            ESTUDANTE_ID: e.id, NUMERO: e.numero, NOME_ESTUDANTE: e.nome, SITUACAO: e.situacao, OBSERVACAO: e.observacao,
            ATUALIZADO_EM: momento, ATUALIZADO_POR: u.email
          });
        }
      });

      chamada.TOTAL = cont.TOTAL; chamada.PRESENTES = cont.PRESENTES; chamada.AUSENTES = cont.AUSENTES;
      chamada.ATRASADOS = cont.ATRASADOS; chamada.JUSTIFICADOS = cont.JUSTIFICADOS; chamada.NAO_REGISTRADOS = cont.NAO_REGISTRADOS;
      chamada.VERSAO = (Number(chamada.VERSAO) || 0) + 1;
      chamada.ATUALIZADO_EM = momento; chamada.ATUALIZADO_POR = u.email;
      chamada.ULTIMA_OPERACAO = requestId;
      if (p.finalizar) {
        chamada.STATUS = STATUS_CHAMADA.FINALIZADA;
        chamada.FINALIZADO_EM = momento; chamada.FINALIZADO_POR = u.email;
        auditoria.push(novaAuditoria_(u.email, { acao: 'FINALIZACAO_CHAMADA', entidade: 'CHAMADAS', registroId: chamada.ID, turma: turma.ID,
          anterior: STATUS_CHAMADA.RASCUNHO, novo: STATUS_CHAMADA.FINALIZADA,
          detalhes: 'P ' + cont.PRESENTES + ' | A ' + cont.AUSENTES + ' | AT ' + cont.ATRASADOS + ' | J ' + cont.JUSTIFICADOS }));
      }

      // Gravação em lote (ordem: frequências, chamada, auditoria).
      atualizarRegistros_('FREQUENCIAS', atualizar);
      inserirRegistros_('FREQUENCIAS', inserir);
      if (existente) atualizarRegistros_('CHAMADAS', [chamada]);
      else inserirRegistros_('CHAMADAS', [chamada]);
      registrarAuditoria_(auditoria);

      var registrosFinais = registrosAtuais.concat(inserir);
      return {
        turma: { id: turma.ID, nome: turma.NOME }, data: data, periodo: periodo,
        chamada: chamadaParaCliente_(chamada),
        estudantes: montarListaChamada_(turma.ID, data, registrosFinais),
        permissoes: perm
      };
    });
  });
}

/** API: reabre uma chamada finalizada para correção (motivo obrigatório). */
function apiReabrirChamada(p) {
  return executar_('apiReabrirChamada', function () {
    var u = exigirUsuario_();
    p = p || {};
    var motivo = texto_(p.motivo, 500);
    if (motivo.length < 5) throw appError_('DADOS_INVALIDOS', 'Informe o motivo da reabertura (mínimo de 5 caracteres).');
    return comLock_(function () {
      var cfg = config_();
      var chamadas = lerTabela_('CHAMADAS', { fresco: true });
      var c = indexarPor_(chamadas, 'ID')[p.chamadaId];
      if (!c) throw appError_('NAO_ENCONTRADO', 'Chamada não encontrada.');
      var turma = exigirTurma_(u, c.TURMA_ID);
      var perm = permissoesChamada_(u, turma, c.DATA, cfg);
      if (!perm.editar || !perm.reabrir) throw appError_('SEM_PERMISSAO', perm.motivo || 'Você não tem permissão para reabrir chamadas. Solicite à equipe gestora.');
      if (Number(p.versao) !== Number(c.VERSAO)) throw appError_('CONFLITO', 'A chamada foi alterada por outro usuário. Recarregue a página.');
      if (c.STATUS !== STATUS_CHAMADA.FINALIZADA) throw appError_('DADOS_INVALIDOS', 'A chamada já está aberta para edição.');
      c.STATUS = STATUS_CHAMADA.RASCUNHO;
      c.VERSAO = Number(c.VERSAO) + 1;
      c.ATUALIZADO_EM = agora_(); c.ATUALIZADO_POR = u.email;
      c.ULTIMA_OPERACAO = texto_(p.requestId, 60);
      atualizarRegistros_('CHAMADAS', [c]);
      auditar_(u.email, { acao: 'REABERTURA_CHAMADA', entidade: 'CHAMADAS', registroId: c.ID, turma: turma.ID,
        anterior: STATUS_CHAMADA.FINALIZADA, novo: STATUS_CHAMADA.RASCUNHO, motivo: motivo, detalhes: 'Data ' + dataBr_(c.DATA) + ' — ' + c.PERIODO });
      return estadoChamada_(u, turma, c.DATA, c.PERIODO, cfg, c);
    });
  });
}

/**
 * API: corrige a situação de UM estudante numa chamada (inclusive finalizada),
 * registrando situação anterior, nova, usuário e motivo na auditoria.
 */
function apiCorrigirRegistro(p) {
  return executar_('apiCorrigirRegistro', function () {
    var u = exigirUsuario_();
    p = p || {};
    var situacao = String(p.situacao || '');
    if (SITUACOES_VALIDAS.indexOf(situacao) < 0 || situacao === SITUACAO.NAO_REGISTRADO) throw appError_('DADOS_INVALIDOS', 'Situação inválida.');
    var motivo = texto_(p.motivo, 500);
    var observacao = situacao === SITUACAO.JUSTIFICADA || situacao === SITUACAO.ATRASADO ? texto_(p.observacao, 200) : '';
    return comLock_(function () {
      var cfg = config_();
      var c = indexarPor_(lerTabela_('CHAMADAS', { fresco: true }), 'ID')[p.chamadaId];
      if (!c) throw appError_('NAO_ENCONTRADO', 'Chamada não encontrada.');
      var turma = exigirTurma_(u, c.TURMA_ID);
      var perm = permissoesChamada_(u, turma, c.DATA, cfg);
      var finalizada = c.STATUS === STATUS_CHAMADA.FINALIZADA;
      if (!perm.editar || (finalizada && !perm.reabrir)) throw appError_('SEM_PERMISSAO', perm.motivo || 'Você não tem permissão para corrigir chamadas finalizadas.');
      if (Number(p.versao) !== Number(c.VERSAO)) throw appError_('CONFLITO', 'A chamada foi alterada por outro usuário. Recarregue para ver a versão atual.');
      if (finalizada && motivo.length < 5) throw appError_('DADOS_INVALIDOS', 'Informe o motivo da correção (mínimo de 5 caracteres).');

      var registros = lerLinhasPorValor_('FREQUENCIAS', 'CHAMADA_ID', c.ID);
      var r = indexarPor_(registros, 'ESTUDANTE_ID')[p.estudanteId];
      var momento = agora_();
      var anterior = r ? r.SITUACAO : SITUACAO.NAO_REGISTRADO;
      if (r && r.SITUACAO === situacao && String(r.OBSERVACAO) === observacao) return estadoChamada_(u, turma, c.DATA, c.PERIODO, cfg, c);
      var novoRegistro = !r;
      if (novoRegistro) {
        var elegivel = indexarPor_(estudantesElegiveis_(turma.ID, c.DATA, lerTabela_('ESTUDANTES')), 'id')[p.estudanteId];
        if (!elegivel) throw appError_('DADOS_INVALIDOS', 'Estudante não pertence a esta chamada.');
        r = { ID: gerarId_('FRE'), CHAMADA_ID: c.ID, TURMA_ID: turma.ID, DATA: c.DATA, PERIODO: c.PERIODO, ESTUDANTE_ID: elegivel.id,
          NUMERO: elegivel.numero, NOME_ESTUDANTE: elegivel.nome };
        registros.push(r);
      }
      r.SITUACAO = situacao; r.OBSERVACAO = observacao; r.ATUALIZADO_EM = momento; r.ATUALIZADO_POR = u.email;
      // Contagem calculada ANTES de gravar: nada é gravado se a validação falhar.
      var cont = contarSituacoes_(montarListaChamada_(turma.ID, c.DATA, registros), 'situacao');
      if (finalizada && cont.NAO_REGISTRADOS > 0) {
        throw appError_('PENDENTES', 'Há estudantes sem registro nesta chamada finalizada (ex.: estudante cadastrado depois). Use "Reabrir para correção" e registre todos.');
      }
      if (novoRegistro) inserirRegistros_('FREQUENCIAS', [r]);
      else atualizarRegistros_('FREQUENCIAS', [r]);
      var est = r;
      c.TOTAL = cont.TOTAL; c.PRESENTES = cont.PRESENTES; c.AUSENTES = cont.AUSENTES; c.ATRASADOS = cont.ATRASADOS;
      c.JUSTIFICADOS = cont.JUSTIFICADOS; c.NAO_REGISTRADOS = cont.NAO_REGISTRADOS;
      c.VERSAO = Number(c.VERSAO) + 1; c.ATUALIZADO_EM = momento; c.ATUALIZADO_POR = u.email;
      c.ULTIMA_OPERACAO = texto_(p.requestId, 60);
      atualizarRegistros_('CHAMADAS', [c]);
      auditar_(u.email, { acao: 'CORRECAO_REGISTRO', entidade: 'FREQUENCIAS', registroId: est.ID, estudante: est.NOME_ESTUDANTE, turma: turma.ID,
        anterior: anterior, novo: situacao, motivo: motivo, detalhes: 'Chamada ' + c.ID + ' — ' + dataBr_(c.DATA) + ' — ' + c.PERIODO + (finalizada ? ' (finalizada)' : '') });
      return estadoChamada_(u, turma, c.DATA, c.PERIODO, cfg, c);
    });
  });
}

/**
 * API: histórico. Sem estudante/situação: lista de chamadas. Com estudante e/ou situação:
 * lista de registros individuais. Paginado.
 * f = { turmaId, inicio, fim, status, estudanteId, situacao, pagina, porPagina }
 */
function apiListarHistorico(f) {
  return executar_('apiListarHistorico', function () {
    var u = exigirUsuario_();
    f = f || {};
    var turma = exigirTurma_(u, f.turmaId);
    var ini = f.inicio ? validarData_(f.inicio, 'Data inicial') : '';
    var fim = f.fim ? validarData_(f.fim, 'Data final') : '';
    if (ini && fim && ini > fim) throw appError_('DADOS_INVALIDOS', 'A data inicial é posterior à data final.');
    var porPagina = Math.min(Math.max(Number(f.porPagina) || 30, 10), 200);
    var pagina = Math.max(Number(f.pagina) || 1, 1);
    var cfg = config_();
    var regras = regrasCalculo_(cfg);
    var chamadas = lerTabela_('CHAMADAS').filter(function (c) {
      return c.TURMA_ID === turma.ID && (!ini || c.DATA >= ini) && (!fim || c.DATA <= fim) && (!f.status || c.STATUS === f.status);
    });
    var modoRegistros = !!(f.estudanteId || f.situacao);
    var itens;
    if (modoRegistros) {
      var idsChamadas = {};
      chamadas.forEach(function (c) { idsChamadas[c.ID] = c; });
      itens = lerTabela_('FREQUENCIAS').filter(function (r) {
        return idsChamadas[r.CHAMADA_ID] && (!f.estudanteId || r.ESTUDANTE_ID === f.estudanteId) && (!f.situacao || r.SITUACAO === f.situacao);
      }).map(function (r) {
        var c = idsChamadas[r.CHAMADA_ID];
        return { registroId: r.ID, chamadaId: r.CHAMADA_ID, data: r.DATA, periodo: r.PERIODO, estudanteId: r.ESTUDANTE_ID, numero: r.NUMERO,
          nome: r.NOME_ESTUDANTE, situacao: r.SITUACAO, observacao: r.OBSERVACAO, statusChamada: c.STATUS, atualizadoEm: r.ATUALIZADO_EM, atualizadoPor: r.ATUALIZADO_POR };
      });
      itens.sort(function (a, b) { return b.data.localeCompare(a.data) || String(a.periodo).localeCompare(String(b.periodo)) || a.numero - b.numero; });
    } else {
      itens = chamadas.map(function (c) {
        var o = chamadaParaCliente_(c);
        var calc = calcularIndice_({ P: c.PRESENTES, A: c.AUSENTES, T: c.ATRASADOS, J: c.JUSTIFICADOS }, regras);
        o.frequencia = calc.frequencia;
        return o;
      });
      itens.sort(function (a, b) { return b.data.localeCompare(a.data) || String(a.periodo).localeCompare(String(b.periodo)); });
    }
    return {
      modo: modoRegistros ? 'REGISTROS' : 'CHAMADAS',
      itens: itens.slice((pagina - 1) * porPagina, pagina * porPagina),
      total: itens.length, pagina: pagina, paginas: Math.max(1, Math.ceil(itens.length / porPagina))
    };
  });
}


// ============================================================================
// ARQUIVO ORIGINAL: Reports.gs
// ============================================================================

/**
 * Reports.gs — Cálculos de frequência, painel (dashboard), relatórios e ficha individual.
 *
 * Regras de cálculo (configuráveis em CONFIGURACOES):
 *  - PRESENTE: comparecimento.
 *  - ATRASADO: comparecimento se ATRASO_CONTA_COMPARECIMENTO = SIM (padrão); senão, falta.
 *  - AUSENTE: falta.
 *  - JUSTIFICADA: identificada separadamente; NÃO conta como comparecimento
 *    (JUSTIFICADA_CONTA_COMPARECIMENTO = NAO, padrão). Se JUSTIFICADA_EXCLUIR_DO_CALCULO = SIM,
 *    não entra na base do percentual.
 *  - NÃO REGISTRADO e dias sem chamada: NUNCA contam (nem como presença nem como falta).
 *  - Por padrão só chamadas FINALIZADAS entram nas estatísticas (CONTAR_RASCUNHOS = NAO).
 *
 *  Frequência (%) = comparecimentos / registros considerados × 100.
 */

var TIPOS_RELATORIO = {
  DIARIA: 'Frequência diária',
  SEMANAL: 'Frequência semanal',
  MENSAL: 'Frequência mensal',
  INDIVIDUAL: 'Frequência individual',
  GERAL: 'Frequência geral da turma',
  MAIS_FALTAS: 'Estudantes com maior número de faltas',
  ABAIXO_LIMITE: 'Estudantes abaixo do limite de frequência'
};

function regrasCalculo_(cfg) {
  return {
    atrasoConta: ehSim_(cfg.ATRASO_CONTA_COMPARECIMENTO === undefined ? 'SIM' : cfg.ATRASO_CONTA_COMPARECIMENTO),
    justificadaConta: ehSim_(cfg.JUSTIFICADA_CONTA_COMPARECIMENTO),
    justificadaExcluir: ehSim_(cfg.JUSTIFICADA_EXCLUIR_DO_CALCULO),
    contarRascunhos: ehSim_(cfg.CONTAR_RASCUNHOS),
    limite: configNum_(cfg, 'LIMITE_FREQUENCIA', 90)
  };
}

function descricaoRegras_(r) {
  return 'Presença conta como comparecimento; atraso ' + (r.atrasoConta ? 'conta' : 'NÃO conta') + ' como comparecimento; ' +
    'ausência conta como falta; falta justificada ' + (r.justificadaConta ? 'conta' : 'não conta') + ' como comparecimento' +
    (r.justificadaExcluir ? ' e é excluída da base de cálculo' : ' e permanece identificada separadamente') + '. ' +
    'Dias sem chamada não são contabilizados. ' + (r.contarRascunhos ? 'Inclui chamadas em rascunho.' : 'Somente chamadas finalizadas.');
}

/** c = {P, A, T, J} -> índices calculados conforme as regras. frequencia = null quando não há base. */
function calcularIndice_(c, regras) {
  var P = Number(c.P) || 0, A = Number(c.A) || 0, T = Number(c.T) || 0, J = Number(c.J) || 0;
  var comparecimentos = P + (regras.atrasoConta ? T : 0) + (regras.justificadaConta ? J : 0);
  var base = P + A + T + (regras.justificadaExcluir ? 0 : J);
  return {
    P: P, A: A, T: T, J: J, registros: P + A + T + J,
    comparecimentos: comparecimentos, base: base,
    faltas: A + (regras.atrasoConta ? 0 : T),
    frequencia: base > 0 ? Math.round(comparecimentos / base * 1000) / 10 : null
  };
}

function somarSituacao_(acc, s) {
  if (s === SITUACAO.PRESENTE) acc.P++;
  else if (s === SITUACAO.AUSENTE) acc.A++;
  else if (s === SITUACAO.ATRASADO) acc.T++;
  else if (s === SITUACAO.JUSTIFICADA) acc.J++;
  return acc;
}

/**
 * Registros válidos para estatística de uma turma no período:
 * somente chamadas consideradas (finalizadas, ou também rascunhos se configurado)
 * e somente situações registradas.
 */
function dadosEstatisticos_(turmaId, inicio, fim, regras) {
  var chamadas = lerTabela_('CHAMADAS').filter(function (c) {
    return c.TURMA_ID === turmaId && (!inicio || c.DATA >= inicio) && (!fim || c.DATA <= fim) &&
      (c.STATUS === STATUS_CHAMADA.FINALIZADA || regras.contarRascunhos);
  });
  var ids = {};
  chamadas.forEach(function (c) { ids[c.ID] = 1; });
  var registros = chamadas.length ? lerTabela_('FREQUENCIAS').filter(function (r) {
    return ids[r.CHAMADA_ID] && r.SITUACAO !== SITUACAO.NAO_REGISTRADO;
  }) : [];
  return { chamadas: chamadas, registros: registros };
}

/** Estatística por estudante (inclui inativos que tenham registros no período). */
function estatisticaPorEstudante_(turmaId, registros, regras, dataRef) {
  var estudantes = lerTabela_('ESTUDANTES');
  var porId = indexarPor_(estudantes, 'ID');
  var acc = {};
  estudantesElegiveis_(turmaId, dataRef || hoje_(), estudantes).forEach(function (e) {
    acc[e.id] = { id: e.id, numero: e.numero, nome: e.nome, ativo: true, c: { P: 0, A: 0, T: 0, J: 0 } };
  });
  registros.forEach(function (r) {
    if (!acc[r.ESTUDANTE_ID]) {
      var e = porId[r.ESTUDANTE_ID];
      acc[r.ESTUDANTE_ID] = { id: r.ESTUDANTE_ID, numero: r.NUMERO, nome: e ? e.NOME : r.NOME_ESTUDANTE, ativo: false, c: { P: 0, A: 0, T: 0, J: 0 } };
    }
    somarSituacao_(acc[r.ESTUDANTE_ID].c, r.SITUACAO);
  });
  return Object.keys(acc).map(function (id) {
    var x = acc[id];
    var i = calcularIndice_(x.c, regras);
    return { id: x.id, numero: x.numero, nome: x.nome, ativo: x.ativo, registros: i.registros, presencas: i.P, ausencias: i.A,
      atrasos: i.T, justificadas: i.J, faltas: i.faltas, frequencia: i.frequencia };
  }).sort(ordenarPorNumero_);
}

function validarPeriodoRelatorio_(inicio, fim, turma) {
  var ini = inicio ? validarData_(inicio, 'Data inicial') : (turma.DATA_INICIO || '2000-01-01');
  var f = fim ? validarData_(fim, 'Data final') : hoje_();
  if (ini > f) throw appError_('DADOS_INVALIDOS', 'A data inicial é posterior à data final.');
  return { inicio: ini, fim: f };
}

// ------------------------------------------------------------------ Painel

/** API: dados do painel principal de uma turma (desde o início da turma até hoje). */
function apiPainel(turmaId) {
  return executar_('apiPainel', function () {
    var u = exigirUsuario_();
    var turma = exigirTurma_(u, turmaId);
    var cfg = config_();
    var regras = regrasCalculo_(cfg);
    var hoje = hoje_();
    var dados = dadosEstatisticos_(turma.ID, '', hoje, regras);
    var total = { P: 0, A: 0, T: 0, J: 0 };
    dados.registros.forEach(function (r) { somarSituacao_(total, r.SITUACAO); });
    var geral = calcularIndice_(total, regras);

    // Série diária (últimos 20 dias com chamada considerada).
    var porDia = {};
    dados.registros.forEach(function (r) {
      porDia[r.DATA] = porDia[r.DATA] || { P: 0, A: 0, T: 0, J: 0 };
      somarSituacao_(porDia[r.DATA], r.SITUACAO);
    });
    var serie = Object.keys(porDia).sort().slice(-20).map(function (d) {
      var i = calcularIndice_(porDia[d], regras);
      return { data: d, frequencia: i.frequencia, presentes: i.P, ausentes: i.A, atrasados: i.T, justificados: i.J };
    });

    var porEstudante = estatisticaPorEstudante_(turma.ID, dados.registros, regras, hoje);
    var alertas = porEstudante.filter(function (e) { return e.frequencia !== null && e.frequencia < regras.limite; })
      .sort(function (a, b) { return a.frequencia - b.frequencia || b.faltas - a.faltas; });

    var todasChamadas = lerTabela_('CHAMADAS').filter(function (c) { return c.TURMA_ID === turma.ID; });
    var rascunhos = todasChamadas.filter(function (c) { return c.STATUS === STATUS_CHAMADA.RASCUNHO; })
      .map(chamadaParaCliente_).sort(function (a, b) { return b.data.localeCompare(a.data); });
    var chamadaHoje = todasChamadas.filter(function (c) { return c.DATA === hoje; }).map(chamadaParaCliente_);
    var ativos = lerTabela_('ESTUDANTES').filter(function (e) { return e.TURMA_ID === turma.ID && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO; }).length;

    return {
      turma: turmaParaCliente_(turma, lerTabela_('ESTUDANTES')),
      hoje: hoje,
      estudantesAtivos: ativos,
      chamadasRealizadas: todasChamadas.filter(function (c) { return c.STATUS === STATUS_CHAMADA.FINALIZADA; }).length,
      chamadasConsideradas: dados.chamadas.length,
      rascunhos: rascunhos,
      chamadaHoje: chamadaHoje,
      totais: geral,
      serie: serie,
      alertas: alertas,
      limite: regras.limite,
      regras: descricaoRegras_(regras)
    };
  });
}

// ------------------------------------------------------------------ Relatórios

/** Professores vinculados à turma (para o cabeçalho dos relatórios). */
function professoresDaTurma_(turmaId) {
  return lerTabela_('PROFESSORES').filter(function (p) {
    if (!ehSim_(p.ATIVO) || p.PERFIL !== PERFIL.PROFESSOR) return false;
    return String(p.TURMAS).split(/[;,]/).map(function (s) { return s.trim(); }).indexOf(turmaId) >= 0;
  }).map(function (p) { return p.NOME; });
}

function linhaAgregada_(rotulo, acc, regras, extra) {
  var i = calcularIndice_(acc, regras);
  var o = { periodo: rotulo, presentes: i.P, ausentes: i.A, atrasados: i.T, justificados: i.J, registros: i.registros, frequencia: i.frequencia };
  if (extra) for (var k in extra) o[k] = extra[k];
  return o;
}

var COLUNAS_AGREGADAS_ = [
  { chave: 'periodo', rotulo: 'Período' }, { chave: 'chamadas', rotulo: 'Chamadas', tipo: 'num' },
  { chave: 'presentes', rotulo: 'Presenças', tipo: 'num' }, { chave: 'atrasados', rotulo: 'Atrasos', tipo: 'num' },
  { chave: 'ausentes', rotulo: 'Ausências', tipo: 'num' }, { chave: 'justificados', rotulo: 'Justificadas', tipo: 'num' },
  { chave: 'frequencia', rotulo: 'Frequência', tipo: 'pct' }
];
var COLUNAS_ESTUDANTE_ = [
  { chave: 'numero', rotulo: 'Nº', tipo: 'num' }, { chave: 'nome', rotulo: 'Estudante' },
  { chave: 'registros', rotulo: 'Registros', tipo: 'num' }, { chave: 'presencas', rotulo: 'Presenças', tipo: 'num' },
  { chave: 'atrasos', rotulo: 'Atrasos', tipo: 'num' }, { chave: 'ausencias', rotulo: 'Ausências', tipo: 'num' },
  { chave: 'justificadas', rotulo: 'Justificadas', tipo: 'num' }, { chave: 'frequencia', rotulo: 'Frequência', tipo: 'pct' }
];

/** Agrupa registros por chave (dia, semana ou mês) e devolve linhas do relatório. */
function agregarPor_(dados, regras, chaveFn, rotuloFn) {
  var grupos = {}, chamadasPorGrupo = {};
  dados.chamadas.forEach(function (c) {
    var k = chaveFn(c.DATA);
    chamadasPorGrupo[k] = (chamadasPorGrupo[k] || 0) + 1;
    grupos[k] = grupos[k] || { P: 0, A: 0, T: 0, J: 0 };
  });
  dados.registros.forEach(function (r) { somarSituacao_(grupos[chaveFn(r.DATA)], r.SITUACAO); });
  return Object.keys(grupos).sort().map(function (k) {
    return linhaAgregada_(rotuloFn(k), grupos[k], regras, { chamadas: chamadasPorGrupo[k] || 0 });
  });
}

/**
 * Monta um relatório estruturado (usado na tela e nas exportações PDF/Excel/CSV).
 * p = { tipo, turmaId, inicio, fim, estudanteId, limiteLinhas }
 */
function montarRelatorio_(u, p) {
  p = p || {};
  var tipo = String(p.tipo || '');
  if (!TIPOS_RELATORIO[tipo]) throw appError_('DADOS_INVALIDOS', 'Tipo de relatório inválido.');
  var turma = exigirTurma_(u, p.turmaId);
  var cfg = config_();
  var regras = regrasCalculo_(cfg);
  var per = validarPeriodoRelatorio_(p.inicio, p.fim, turma);
  var dados = dadosEstatisticos_(turma.ID, per.inicio, per.fim, regras);
  var total = { P: 0, A: 0, T: 0, J: 0 };
  dados.registros.forEach(function (r) { somarSituacao_(total, r.SITUACAO); });
  var geral = calcularIndice_(total, regras);
  var profs = professoresDaTurma_(turma.ID);

  var rel = {
    tipo: tipo,
    titulo: TIPOS_RELATORIO[tipo],
    meta: {
      escola: cfg.NOME_ESCOLA || '',
      turma: turma.NOME,
      periodo: dataBr_(per.inicio) + ' a ' + dataBr_(per.fim),
      inicio: per.inicio, fim: per.fim,
      professor: profs.length ? profs.join(', ') : u.nome,
      emitidoPor: u.nome + ' (' + u.email + ')',
      emissao: dataHoraBr_(agora_()),
      regras: descricaoRegras_(regras)
    },
    colunas: [], linhas: [], resumo: []
  };
  var resumoGeral = [
    { rotulo: 'Chamadas consideradas', valor: dados.chamadas.length },
    { rotulo: 'Presenças', valor: geral.P }, { rotulo: 'Atrasos', valor: geral.T },
    { rotulo: 'Ausências', valor: geral.A }, { rotulo: 'Faltas justificadas', valor: geral.J },
    { rotulo: 'Frequência geral', valor: geral.frequencia === null ? '—' : geral.frequencia.toFixed(1).replace('.', ',') + '%' }
  ];

  if (tipo === 'DIARIA' || tipo === 'SEMANAL' || tipo === 'MENSAL') {
    rel.colunas = COLUNAS_AGREGADAS_;
    if (tipo === 'DIARIA') {
      rel.linhas = agregarPor_(dados, regras, function (d) { return d; }, function (k) { return dataBr_(k); });
      rel.colunas = [{ chave: 'periodo', rotulo: 'Data' }].concat(COLUNAS_AGREGADAS_.slice(1));
    } else if (tipo === 'SEMANAL') {
      rel.linhas = agregarPor_(dados, regras, inicioSemana_, function (k) { return 'Semana de ' + dataBr_(k) + ' a ' + dataBr_(adicionarDias_(k, 6)); });
      rel.colunas = [{ chave: 'periodo', rotulo: 'Semana' }].concat(COLUNAS_AGREGADAS_.slice(1));
    } else {
      rel.linhas = agregarPor_(dados, regras, function (d) { return d.slice(0, 7); }, nomeMes_);
      rel.colunas = [{ chave: 'periodo', rotulo: 'Mês' }].concat(COLUNAS_AGREGADAS_.slice(1));
    }
    rel.resumo = resumoGeral;
  } else if (tipo === 'INDIVIDUAL') {
    var ficha = fichaEstudante_(u, p.estudanteId, per.inicio, per.fim, turma.ID);
    rel.titulo += ' — ' + ficha.estudante.nome;
    rel.meta.estudante = ficha.estudante.nome + ' (nº ' + ficha.estudante.numero + ')';
    rel.colunas = [{ chave: 'dataBr', rotulo: 'Data' }, { chave: 'periodo', rotulo: 'Período/aula' },
      { chave: 'situacaoRotulo', rotulo: 'Situação' }, { chave: 'observacao', rotulo: 'Observação' }];
    rel.linhas = ficha.historico.slice().reverse();
    rel.resumo = [
      { rotulo: 'Registros', valor: ficha.resumo.registros }, { rotulo: 'Presenças', valor: ficha.resumo.presencas },
      { rotulo: 'Atrasos', valor: ficha.resumo.atrasos }, { rotulo: 'Ausências', valor: ficha.resumo.ausencias },
      { rotulo: 'Faltas justificadas', valor: ficha.resumo.justificadas },
      { rotulo: 'Frequência', valor: ficha.resumo.frequencia === null ? '—' : ficha.resumo.frequencia.toFixed(1).replace('.', ',') + '%' }
    ];
  } else {
    var lista = estatisticaPorEstudante_(turma.ID, dados.registros, regras, per.fim);
    rel.colunas = COLUNAS_ESTUDANTE_;
    if (tipo === 'GERAL') {
      rel.linhas = lista;
      rel.resumo = resumoGeral.concat([{ rotulo: 'Estudantes', valor: lista.length }]);
    } else if (tipo === 'MAIS_FALTAS') {
      var n = Math.min(Math.max(Number(p.limiteLinhas) || 10, 1), 200);
      rel.linhas = lista.filter(function (e) { return e.faltas > 0 || e.justificadas > 0; })
        .sort(function (a, b) { return b.faltas - a.faltas || b.justificadas - a.justificadas || ordenarPorNumero_(a, b); }).slice(0, n);
      rel.colunas = COLUNAS_ESTUDANTE_.slice(0, 2).concat([{ chave: 'faltas', rotulo: 'Faltas (contadas)', tipo: 'num' }], COLUNAS_ESTUDANTE_.slice(2));
      rel.resumo = [{ rotulo: 'Estudantes listados', valor: rel.linhas.length }];
    } else {
      rel.titulo = 'Estudantes abaixo de ' + String(regras.limite).replace('.', ',') + '% de frequência';
      rel.linhas = lista.filter(function (e) { return e.frequencia !== null && e.frequencia < regras.limite; })
        .sort(function (a, b) { return a.frequencia - b.frequencia; });
      rel.resumo = [{ rotulo: 'Estudantes abaixo do limite', valor: rel.linhas.length }, { rotulo: 'Limite', valor: regras.limite + '%' }];
    }
  }
  if (!dados.chamadas.length) rel.aviso = 'Não há chamadas ' + (regras.contarRascunhos ? '' : 'finalizadas ') + 'no período selecionado.';
  return rel;
}

/** API: gera relatório para exibição na tela. */
function apiRelatorio(p) {
  return executar_('apiRelatorio', function () {
    return montarRelatorio_(exigirUsuario_(), p);
  });
}

// ------------------------------------------------------------------ Ficha individual

function fichaEstudante_(u, estudanteId, inicio, fim, turmaIdRelatorio) {
  var e = indexarPor_(lerTabela_('ESTUDANTES'), 'ID')[estudanteId];
  if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
  var acessoAtual = podeAcessarTurma_(u, e.TURMA_ID);
  var acessoAnterior = e.TURMA_ANTERIOR_ID && podeAcessarTurma_(u, e.TURMA_ANTERIOR_ID);
  if (!acessoAtual && !acessoAnterior) throw appError_('SEM_PERMISSAO', 'Você não tem acesso a este estudante.');
  var cfg = config_();
  var regras = regrasCalculo_(cfg);
  var turmasPorId = indexarPor_(lerTabela_('TURMAS'), 'ID');
  var ini = inicio ? validarData_(inicio, 'Data inicial') : '';
  var f = fim ? validarData_(fim, 'Data final') : hoje_();
  var chamadasValidas = {};
  lerTabela_('CHAMADAS').forEach(function (c) {
    if ((c.STATUS === STATUS_CHAMADA.FINALIZADA || regras.contarRascunhos) && podeAcessarTurma_(u, c.TURMA_ID) &&
      (!turmaIdRelatorio || c.TURMA_ID === turmaIdRelatorio)) chamadasValidas[c.ID] = c;
  });
  var acc = { P: 0, A: 0, T: 0, J: 0 };
  var historico = lerLinhasPorValor_('FREQUENCIAS', 'ESTUDANTE_ID', e.ID).filter(function (r) {
    return chamadasValidas[r.CHAMADA_ID] && r.SITUACAO !== SITUACAO.NAO_REGISTRADO && (!ini || r.DATA >= ini) && r.DATA <= f;
  }).map(function (r) {
    somarSituacao_(acc, r.SITUACAO);
    return { data: r.DATA, dataBr: dataBr_(r.DATA), periodo: r.PERIODO === PERIODO_UNICO ? 'Diária' : r.PERIODO, situacao: r.SITUACAO,
      situacaoRotulo: ROTULO_SITUACAO[r.SITUACAO], observacao: r.OBSERVACAO, turma: turmasPorId[r.TURMA_ID] ? turmasPorId[r.TURMA_ID].NOME : '', chamadaId: r.CHAMADA_ID };
  }).sort(function (a, b) { return a.data.localeCompare(b.data) || String(a.periodo).localeCompare(String(b.periodo)); });
  var ind = calcularIndice_(acc, regras);
  var porMes = {};
  historico.forEach(function (h) {
    var k = h.data.slice(0, 7);
    porMes[k] = porMes[k] || { P: 0, A: 0, T: 0, J: 0 };
    somarSituacao_(porMes[k], h.situacao);
  });
  return {
    estudante: estudanteParaCliente_(e, turmasPorId),
    periodo: { inicio: ini, fim: f },
    resumo: { registros: ind.registros, presencas: ind.P, ausencias: ind.A, atrasos: ind.T, justificadas: ind.J, faltas: ind.faltas, frequencia: ind.frequencia },
    porMes: Object.keys(porMes).sort().map(function (k) { var i = calcularIndice_(porMes[k], regras); return { mes: nomeMes_(k), frequencia: i.frequencia, P: i.P, A: i.A, T: i.T, J: i.J }; }),
    historico: historico,
    limite: regras.limite
  };
}

/** API: ficha individual do estudante. p = { estudanteId, inicio, fim } */
function apiFichaEstudante(p) {
  return executar_('apiFichaEstudante', function () {
    p = p || {};
    return fichaEstudante_(exigirUsuario_(), p.estudanteId, p.inicio, p.fim, null);
  });
}


// ============================================================================
// ARQUIVO ORIGINAL: Export.gs
// ============================================================================

/**
 * Export.gs — Exportação de relatórios em PDF (A4), Excel (.xlsx) e CSV.
 *
 * Os arquivos são gerados no servidor e enviados ao navegador em base64 para download.
 * PDF e Excel usam um documento/planilha TEMPORÁRIO no Drive do proprietário, que é
 * enviado para a lixeira logo após a conversão (não guarda dados de estudantes em
 * arquivos soltos). Nenhum dado escolar é apagado.
 */

var A4_LARGURA_PT = 595.28;
var A4_ALTURA_PT = 841.89;
var COR_PRIMARIA = '#1d4ed8';

function formatarValor_(v, tipo) {
  if (tipo === 'pct') return v === null || v === undefined || v === '' ? '—' : Number(v).toFixed(1).replace('.', ',') + '%';
  if (v === null || v === undefined) return '';
  return String(v);
}

function nomeArquivo_(rel, ext) {
  var base = (rel.titulo + ' ' + rel.meta.turma + ' ' + rel.meta.inicio + ' a ' + rel.meta.fim)
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 _-]/g, '').replace(/\s+/g, '_');
  return base.slice(0, 120) + '.' + ext;
}

/** Linhas de cabeçalho comuns aos formatos (escola, turma, período, professor, emissão). */
function linhasMeta_(rel) {
  var l = [
    ['FREQUÊNCIA ESCOLAR — ' + rel.titulo],
    ['Escola', rel.meta.escola],
    ['Turma', rel.meta.turma],
    ['Período analisado', rel.meta.periodo],
    ['Professor(a)', rel.meta.professor]
  ];
  if (rel.meta.estudante) l.push(['Estudante', rel.meta.estudante]);
  l.push(['Emitido em', rel.meta.emissao], ['Emitido por', rel.meta.emitidoPor], ['Regras de cálculo', rel.meta.regras]);
  return l;
}

// ------------------------------------------------------------------ CSV

function gerarCsv_(rel) {
  function q(v) {
    var s = String(v === null || v === undefined ? '' : v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // evita interpretação como fórmula no Excel
    return '"' + s.replace(/"/g, '""') + '"';
  }
  var out = [];
  linhasMeta_(rel).forEach(function (l) { out.push(l.map(q).join(';')); });
  out.push('');
  out.push(rel.colunas.map(function (c) { return q(c.rotulo); }).join(';'));
  rel.linhas.forEach(function (lin) {
    out.push(rel.colunas.map(function (c) { return q(formatarValor_(lin[c.chave], c.tipo)); }).join(';'));
  });
  if (rel.resumo.length) {
    out.push('');
    out.push(q('RESUMO'));
    rel.resumo.forEach(function (r) { out.push(q(r.rotulo) + ';' + q(r.valor)); });
  }
  var csv = '﻿' + out.join('\r\n');
  return { nome: nomeArquivo_(rel, 'csv'), mime: 'text/csv;charset=utf-8', base64: Utilities.base64Encode(csv, Utilities.Charset.UTF_8) };
}

// ------------------------------------------------------------------ Excel

/** Monta a planilha (temporária) do relatório e exporta como .xlsx. */
function gerarXlsx_(rel) {
  var nome = nomeArquivo_(rel, 'xlsx');
  var ss = SpreadsheetApp.create('TEMP — ' + nome);
  var id = ss.getId();
  try {
    var sh = ss.getSheets()[0];
    sh.setName('Relatório');
    var largura = Math.max(rel.colunas.length, 2);
    var linhas = [];
    function pad(arr) { var a = arr.slice(); while (a.length < largura) a.push(''); return a; }
    linhasMeta_(rel).forEach(function (l) { linhas.push(pad(l)); });
    linhas.push(pad([]));
    var linhaCab = linhas.length + 1;
    linhas.push(pad(rel.colunas.map(function (c) { return c.rotulo; })));
    rel.linhas.forEach(function (lin) {
      linhas.push(pad(rel.colunas.map(function (c) {
        var v = lin[c.chave];
        if (c.tipo === 'pct') return v === null || v === undefined ? '—' : Number(v) / 100;
        if (c.tipo === 'num') return v === '' || v === null || v === undefined ? '' : Number(v);
        return v === null || v === undefined ? '' : String(v);
      })));
    });
    var fimTabela = linhas.length;
    if (rel.resumo.length) {
      linhas.push(pad([]));
      linhas.push(pad(['RESUMO']));
      rel.resumo.forEach(function (r) { linhas.push(pad([r.rotulo, String(r.valor)])); });
    }
    // Uma única escrita em lote; formatos aplicados por intervalo.
    sh.getRange(1, 1, linhas.length, largura).setNumberFormat('@');
    var nCorpo = rel.linhas.length;
    if (nCorpo) {
      rel.colunas.forEach(function (c, i) {
        if (c.tipo === 'pct') sh.getRange(linhaCab + 1, i + 1, nCorpo, 1).setNumberFormat('0.0%');
        if (c.tipo === 'num') sh.getRange(linhaCab + 1, i + 1, nCorpo, 1).setNumberFormat('0');
      });
    }
    sh.getRange(1, 1, linhas.length, largura).setValues(linhas);
    sh.getRange(1, 1).setFontSize(14).setFontWeight('bold').setFontColor(COR_PRIMARIA);
    sh.getRange(2, 1, linhaCab - 3, 1).setFontWeight('bold');
    sh.getRange(linhaCab, 1, 1, largura).setFontWeight('bold').setBackground(COR_PRIMARIA).setFontColor('#ffffff');
    if (nCorpo) sh.getRange(linhaCab, 1, fimTabela - linhaCab + 1, largura).setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
    sh.setFrozenRows(linhaCab);
    sh.autoResizeColumns(1, largura);
    SpreadsheetApp.flush();
    var resp = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + id + '/export?format=xlsx', {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true
    });
    if (resp.getResponseCode() !== 200) throw new Error('Falha ao converter para Excel: HTTP ' + resp.getResponseCode());
    return { nome: nome, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', base64: Utilities.base64Encode(resp.getContent()) };
  } finally {
    try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { console.warn('Não foi possível remover planilha temporária ' + id); }
  }
}

// ------------------------------------------------------------------ PDF (A4)

/** Aplica fonte/negrito/cor ao texto de um parágrafo e devolve o parágrafo. */
function estilizar_(paragrafo, tamanho, negrito, cor) {
  var t = paragrafo.editAsText();
  t.setFontSize(tamanho).setBold(!!negrito);
  if (cor) t.setForegroundColor(cor);
  return paragrafo;
}

/** Gera PDF em papel A4 a partir de um Google Docs temporário. */
function gerarPdf_(rel) {
  var nome = nomeArquivo_(rel, 'pdf');
  var doc = DocumentApp.create('TEMP — ' + nome);
  var id = doc.getId();
  try {
    var body = doc.getBody();
    body.setPageWidth(A4_LARGURA_PT).setPageHeight(A4_ALTURA_PT)
      .setMarginTop(40).setMarginBottom(40).setMarginLeft(40).setMarginRight(40);
    var estiloBase = {};
    estiloBase[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
    estiloBase[DocumentApp.Attribute.FONT_SIZE] = 9;
    estiloBase[DocumentApp.Attribute.FOREGROUND_COLOR] = '#0f172a';
    body.setAttributes(estiloBase);

    var p0 = body.getParagraphs()[0];
    p0.setText('FREQUÊNCIA ESCOLAR');
    estilizar_(p0, 9, true, COR_PRIMARIA);
    estilizar_(body.appendParagraph(rel.titulo), 16, true, '#0f172a').setSpacingAfter(6);

    var meta = linhasMeta_(rel).slice(1, -1).map(function (l) { return [l[0], String(l[1] || '')]; });
    var tMeta = body.appendTable(meta);
    tMeta.setBorderColor('#e2e8f0');
    for (var i = 0; i < meta.length; i++) {
      tMeta.getCell(i, 0).setBackgroundColor('#f1f5f9').setWidth(120).editAsText().setBold(true).setFontSize(9);
      tMeta.getCell(i, 1).editAsText().setBold(false).setFontSize(9);
    }

    if (rel.resumo.length) {
      estilizar_(body.appendParagraph('Resumo'), 11, true).setSpacingBefore(10);
      var res = [rel.resumo.map(function (r) { return r.rotulo; }), rel.resumo.map(function (r) { return String(r.valor); })];
      var tRes = body.appendTable(res);
      tRes.setBorderColor('#e2e8f0');
      for (var c = 0; c < res[0].length; c++) {
        tRes.getCell(0, c).setBackgroundColor('#eff6ff').editAsText().setFontSize(8).setBold(true).setForegroundColor('#1e3a8a');
        tRes.getCell(1, c).editAsText().setFontSize(11).setBold(true);
      }
    }

    estilizar_(body.appendParagraph('Detalhamento'), 11, true).setSpacingBefore(10);
    if (rel.aviso) estilizar_(body.appendParagraph(rel.aviso), 9, false, '#b45309').editAsText().setItalic(true);
    var cab = rel.colunas.map(function (col) { return col.rotulo; });
    var corpo = rel.linhas.map(function (lin) {
      return rel.colunas.map(function (col) { return formatarValor_(lin[col.chave], col.tipo); });
    });
    if (!corpo.length) corpo = [cab.map(function (x, k) { return k === 0 ? 'Sem registros no período.' : ''; })];
    var t = body.appendTable([cab].concat(corpo));
    t.setBorderColor('#cbd5e1');
    for (var h = 0; h < cab.length; h++) {
      t.getCell(0, h).setBackgroundColor(COR_PRIMARIA).editAsText().setBold(true).setForegroundColor('#ffffff').setFontSize(8);
    }
    // Destaque em vermelho para frequência abaixo do limite.
    var idxPct = -1;
    rel.colunas.forEach(function (col, k) { if (col.tipo === 'pct') idxPct = k; });
    var limite = Number(String(rel.meta.limite || 90));
    if (idxPct >= 0) {
      rel.linhas.forEach(function (lin, r) {
        var v = lin[rel.colunas[idxPct].chave];
        if (v !== null && v !== undefined && Number(v) < limite) {
          t.getCell(r + 1, idxPct).editAsText().setBold(true).setForegroundColor('#b91c1c');
        }
      });
    }
    estilizar_(body.appendParagraph('Regras de cálculo: ' + rel.meta.regras), 7, false, '#64748b').setSpacingBefore(10);
    estilizar_(body.appendParagraph('Documento gerado pelo sistema FREQUÊNCIA ESCOLAR em ' + rel.meta.emissao + ' por ' + rel.meta.emitidoPor + '.'), 7, false, '#64748b');
    doc.saveAndClose();
    var pdf = DriveApp.getFileById(id).getAs('application/pdf');
    return { nome: nome, mime: 'application/pdf', base64: Utilities.base64Encode(pdf.getBytes()) };
  } finally {
    try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { console.warn('Não foi possível remover documento temporário ' + id); }
  }
}

/** API: exporta relatório. p = { ...parâmetros do relatório, formato: 'PDF' | 'XLSX' | 'CSV' } */
function apiExportarRelatorio(p) {
  return executar_('apiExportarRelatorio', function () {
    var u = exigirUsuario_();
    p = p || {};
    var rel = montarRelatorio_(u, p);
    rel.meta.limite = regrasCalculo_(config_()).limite;
    var formato = String(p.formato || '').toUpperCase();
    var arquivo;
    if (formato === 'CSV') arquivo = gerarCsv_(rel);
    else if (formato === 'XLSX') arquivo = gerarXlsx_(rel);
    else if (formato === 'PDF') arquivo = gerarPdf_(rel);
    else throw appError_('DADOS_INVALIDOS', 'Formato de exportação inválido.');
    comLock_(function () {
      auditar_(u.email, { acao: 'EXPORTACAO_RELATORIO', entidade: 'RELATORIO', registroId: rel.tipo, turma: p.turmaId,
        novo: formato, detalhes: rel.titulo + ' — ' + rel.meta.periodo });
    });
    return arquivo;
  });
}

/** API (ADMIN): exporta TODO o banco de dados em .xlsx (cópia de segurança manual). */
function apiExportarDados() {
  return executar_('apiExportarDados', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    SpreadsheetApp.flush();
    var resp = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + idPlanilha_() + '/export?format=xlsx', {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true
    });
    if (resp.getResponseCode() !== 200) throw new Error('Falha na exportação: HTTP ' + resp.getResponseCode());
    comLock_(function () {
      auditar_(u.email, { acao: 'EXPORTACAO_DADOS', entidade: 'BANCO', registroId: idPlanilha_(), novo: 'XLSX' });
    });
    return {
      nome: 'Frequencia_Escolar_dados_completos_' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd_HHmm') + '.xlsx',
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      base64: Utilities.base64Encode(resp.getContent())
    };
  });
}


// ============================================================================
// ARQUIVO ORIGINAL: Backup.gs
// ============================================================================

/**
 * Backup.gs — Cópias de segurança da planilha principal.
 *
 *  - Cada backup é uma CÓPIA COMPLETA da planilha numa pasta privada do Drive do proprietário
 *    ("FREQUÊNCIA ESCOLAR — Backups"), com data e hora no nome.
 *  - Backups antigos NUNCA são apagados automaticamente.
 *  - O resultado de cada backup é registrado na AUDITORIA e em CONFIGURACOES (ULTIMO_BACKUP).
 *  - instalarBackupDiario() cria um gatilho diário (executar uma vez pelo editor).
 */

var NOME_PASTA_BACKUP = 'FREQUÊNCIA ESCOLAR — Backups';
var FUNCAO_GATILHO_BACKUP = 'backupAgendado';

function pastaBackup_() {
  var cfg = config_();
  if (cfg.BACKUP_PASTA_ID) {
    try {
      var f = DriveApp.getFolderById(cfg.BACKUP_PASTA_ID);
      if (!f.isTrashed()) return f;
    } catch (e) { /* pasta removida: cria outra */ }
  }
  var pasta = DriveApp.createFolder(NOME_PASTA_BACKUP);
  pasta.setDescription('Backups automáticos do sistema FREQUÊNCIA ESCOLAR. Pasta privada: não compartilhe.');
  comLock_(function () { gravarConfiguracoes_({ BACKUP_PASTA_ID: pasta.getId() }, emailEfetivo_()); });
  return pasta;
}

/** Executa o backup e registra o resultado. origem: 'MANUAL' | 'AGENDADO' | 'EDITOR'. */
function executarBackup_(origem, usuarioEmail) {
  var momento = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd_HH-mm');
  var nome = 'BACKUP Frequência Escolar ' + momento;
  try {
    SpreadsheetApp.flush();
    var pasta = pastaBackup_();
    var copia = DriveApp.getFileById(idPlanilha_()).makeCopy(nome, pasta);
    comLock_(function () {
      gravarConfiguracoes_({ ULTIMO_BACKUP: agora_() + ' | ' + copia.getId() }, usuarioEmail);
      auditar_(usuarioEmail, { acao: 'BACKUP', entidade: 'BANCO', registroId: copia.getId(), novo: 'SUCESSO', detalhes: origem + ' — ' + nome });
    });
    return { ok: true, nome: nome, id: copia.getId(), url: copia.getUrl(), quando: agora_() };
  } catch (e) {
    console.error('Falha no backup', e && e.stack || e);
    try {
      comLock_(function () {
        auditar_(usuarioEmail, { acao: 'BACKUP', entidade: 'BANCO', novo: 'FALHA', detalhes: origem + ' — ' + (e && e.message) });
      });
    } catch (x) { /* sem como registrar */ }
    throw e;
  }
}

/** API (ADMIN): backup imediato. */
function apiExecutarBackup() {
  return executar_('apiExecutarBackup', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    return executarBackup_('MANUAL', u.email);
  });
}

/** API (ADMIN): lista os backups existentes na pasta. */
function apiListarBackups() {
  return executar_('apiListarBackups', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    var pasta = pastaBackup_();
    var it = pasta.getFiles();
    var lista = [];
    while (it.hasNext() && lista.length < 400) {
      var f = it.next();
      if (f.isTrashed()) continue;
      lista.push({ nome: f.getName(), id: f.getId(), url: f.getUrl(), criadoEm: Utilities.formatDate(f.getDateCreated(), TZ, 'yyyy-MM-dd HH:mm:ss') });
    }
    lista.sort(function (a, b) { return b.criadoEm.localeCompare(a.criadoEm); });
    var agendado = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === FUNCAO_GATILHO_BACKUP; });
    return { pastaUrl: pasta.getUrl(), backups: lista, backupDiarioAtivo: agendado, ultimo: config_().ULTIMO_BACKUP || '' };
  });
}

/**
 * EXECUTAR PELO EDITOR: cria gatilho diário de backup (entre 19h e 20h).
 * Idempotente: não cria gatilho duplicado.
 */
function instalarBackupDiario() {
  exigirExecucaoAdministrativa_();
  var existe = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === FUNCAO_GATILHO_BACKUP; });
  if (existe) {
    Logger.log('O backup diário já está instalado.');
    return 'O backup diário já está instalado.';
  }
  ScriptApp.newTrigger(FUNCAO_GATILHO_BACKUP).timeBased().everyDays(1).atHour(19).inTimezone(TZ).create();
  Logger.log('Backup diário instalado (todos os dias, entre 19h e 20h).');
  return 'Backup diário instalado (todos os dias, entre 19h e 20h).';
}

/** EXECUTAR PELO EDITOR: backup imediato. */
function fazerBackupAgora() {
  var email = exigirExecucaoAdministrativa_();
  var r = executarBackup_('EDITOR', email);
  Logger.log('Backup criado: ' + r.nome + ' — ' + r.url);
  return r;
}

/**
 * Executada pelo gatilho diário. Por ser pública, confere se a chamada veio de um
 * gatilho real deste projeto (o navegador não consegue forjar o triggerUid).
 */
function backupAgendado(e) {
  var uid = e && e.triggerUid ? String(e.triggerUid) : '';
  var valido = uid && ScriptApp.getProjectTriggers().some(function (t) { return t.getUniqueId() === uid; });
  if (!valido) throw new Error('Execução não autorizada.');
  executarBackup_('AGENDADO', emailEfetivo_());
}
