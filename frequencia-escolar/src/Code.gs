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

var VERSAO_SISTEMA = '1.0.2';
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
  var t = typeof HTML_EMBUTIDO_ !== 'undefined' ? HtmlService.createTemplate(HTML_EMBUTIDO_.Index) : HtmlService.createTemplateFromFile('Index');
  t.contextoJson = jsonSeguro_(contextoUsuario_(u));
  var out = t.evaluate()
    .setTitle('Frequência Escolar')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  var icone = '';
  try { icone = config_().ICONE_URL || ''; } catch (x) { icone = ''; }
  if (/^https:\/\//.test(icone)) {
    try { out.setFaviconUrl(icone); } catch (x) { /* URL de ícone inválida: ignorar */ }
  }
  return out;
}

/**
 * Inclui um arquivo HTML dentro de outro (usado em Index.html).
 * No pacote de instalação de arquivo único, as telas vêm embutidas em HTML_EMBUTIDO_.
 */
function include(nome) {
  if (['Styles', 'JavaScript'].indexOf(nome) < 0) throw new Error('Arquivo não permitido.');
  if (typeof HTML_EMBUTIDO_ !== 'undefined') return HTML_EMBUTIDO_[nome];
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}

/**
 * Página de aviso (sistema não instalado, acesso não autorizado...). O HTML fica aqui
 * mesmo, no código do servidor, para que a instalação não dependa de um arquivo extra.
 */
function paginaMensagem_(titulo, texto) {
  var html = '<!DOCTYPE html><html lang="pt-BR"><head><base target="_top"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Frequência Escolar</title><style>' +
    'body{margin:0;font-family:"Segoe UI",Roboto,-apple-system,Arial,sans-serif;background:#f5f7fb;color:#0f172a}' +
    '.caixa{max-width:520px;margin:12vh auto 0;background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.08);padding:32px 28px;text-align:center}' +
    '.logo{width:64px;height:64px}.marca{font-weight:800;letter-spacing:.03em;color:#1e3a8a;margin:10px 0 2px}' +
    '.sub{font-size:13px;color:#64748b;margin-bottom:22px}h1{font-size:20px;margin:0 0 10px}p{color:#475569;line-height:1.5;margin:0 0 20px}' +
    'a.btn{display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700}' +
    '@media (max-width:560px){.caixa{margin:0;min-height:100vh;border-radius:0;border:0;padding-top:18vh}}</style></head><body><div class="caixa">' +
    '<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#1d4ed8"/>' +
    '<rect x="15" y="14" width="34" height="38" rx="5" fill="#fff"/><rect x="24" y="10" width="16" height="8" rx="3" fill="#bfdbfe"/>' +
    '<path d="M21 28l4 4 7-8M21 41l4 4 7-8" stroke="#16a34a" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="35" y="27" width="9" height="3.4" rx="1.7" fill="#94a3b8"/><rect x="35" y="40" width="9" height="3.4" rx="1.7" fill="#94a3b8"/></svg>' +
    '<div class="marca">FREQUÊNCIA ESCOLAR</div><div class="sub">Controle de Frequência e Acompanhamento dos Estudantes</div>' +
    '<h1>' + escaparHtml_(titulo) + '</h1><p>' + escaparHtml_(texto) + '</p>' +
    '<a class="btn" href="https://accounts.google.com/AccountChooser" target="_top">Trocar de conta Google</a></div></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Frequência Escolar').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function escaparHtml_(v) {
  return String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
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
