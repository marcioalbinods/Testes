/**
 * FREQUÊNCIA ESCOLAR — PACOTE DE INSTALAÇÃO (sistema completo em um único arquivo)
 * Gerado automaticamente a partir de src/ — não edite aqui; edite src/ e gere de novo.
 * Este arquivo sozinho basta: as telas HTML estão embutidas no final (HTML_EMBUTIDO_).
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
  var t = typeof HTML_EMBUTIDO_ !== 'undefined' ? HtmlService.createTemplate(HTML_EMBUTIDO_.Index) : HtmlService.createTemplateFromFile('Index');
  t.contextoJson = jsonSeguro_(contextoUsuario_(u));
  var out = t.evaluate()
    .setTitle('Frequência Escolar')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .addMetaTag('apple-mobile-web-app-capable', 'yes')
    .addMetaTag('mobile-web-app-capable', 'yes')
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


// ============================================================================
// TELAS HTML EMBUTIDAS (Index.html, Styles.html, JavaScript.html)
// ============================================================================

var HTML_EMBUTIDO_ = {
  Index: "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <base target=\"_top\">\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n  <title>Frequência Escolar</title>\n  <?!= include('Styles'); ?>\n</head>\n<body>\n  <!-- Logotipo reutilizável (símbolo SVG) -->\n  <svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\">\n    <symbol id=\"logo\" viewBox=\"0 0 64 64\">\n      <rect x=\"2\" y=\"2\" width=\"60\" height=\"60\" rx=\"14\" fill=\"#1d4ed8\"/>\n      <rect x=\"15\" y=\"14\" width=\"34\" height=\"38\" rx=\"5\" fill=\"#fff\"/>\n      <rect x=\"24\" y=\"10\" width=\"16\" height=\"8\" rx=\"3\" fill=\"#bfdbfe\"/>\n      <path d=\"M21 28l4 4 7-8\" stroke=\"#16a34a\" stroke-width=\"3.4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n      <rect x=\"35\" y=\"27\" width=\"9\" height=\"3.4\" rx=\"1.7\" fill=\"#94a3b8\"/>\n      <path d=\"M21 41l4 4 7-8\" stroke=\"#16a34a\" stroke-width=\"3.4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n      <rect x=\"35\" y=\"40\" width=\"9\" height=\"3.4\" rx=\"1.7\" fill=\"#94a3b8\"/>\n    </symbol>\n  </svg>\n\n  <div class=\"app\" id=\"app\">\n    <aside class=\"sidebar\" aria-label=\"Menu principal\">\n      <div class=\"marca\">\n        <svg class=\"marca-logo\" aria-hidden=\"true\"><use href=\"#logo\"></use></svg>\n        <div>\n          <div class=\"marca-nome\">FREQUÊNCIA<br>ESCOLAR</div>\n          <div class=\"marca-sub\">Controle de Frequência e Acompanhamento dos Estudantes</div>\n        </div>\n      </div>\n      <nav class=\"nav\" id=\"nav-lateral\"></nav>\n      <div class=\"nav-rodape\" id=\"rodape-lateral\"></div>\n    </aside>\n\n    <div class=\"principal\">\n      <header class=\"topbar\">\n        <svg class=\"marca-logo so-mobile\" aria-hidden=\"true\"><use href=\"#logo\"></use></svg>\n        <div class=\"topbar-titulo\">\n          <div class=\"t1\">FREQUÊNCIA ESCOLAR</div>\n          <div class=\"t2\" id=\"topo-escola\"></div>\n        </div>\n        <div class=\"sel-turma\">\n          <label for=\"sel-turma-global\" class=\"sr-only\">Turma</label>\n          <select id=\"sel-turma-global\" aria-label=\"Turma selecionada\"></select>\n        </div>\n        <div class=\"usuario-chip\" id=\"usuario-chip\" title=\"\"></div>\n      </header>\n      <div class=\"faixa-conexao\" role=\"alert\">Sem conexão com a internet. As marcações ficam guardadas temporariamente neste aparelho e ainda NÃO foram salvas no servidor.</div>\n      <main class=\"conteudo\" id=\"conteudo\" tabindex=\"-1\"></main>\n    </div>\n\n    <nav class=\"bottomnav\" id=\"nav-inferior\" aria-label=\"Navegação\"></nav>\n  </div>\n\n  <div id=\"modais\"></div>\n  <div class=\"toasts\" id=\"toasts\" aria-live=\"polite\"></div>\n\n  <script>\n    // Contexto inicial gerado pelo servidor (usuário autenticado e turmas permitidas). Não contém credenciais.\n    var CONTEXTO = <?!= contextoJson ?>;\n  </script>\n  <?!= include('JavaScript'); ?>\n</body>\n</html>\n",
  Styles: "<style>\n/* ==========================================================================\n   FREQUÊNCIA ESCOLAR — Identidade visual\n   Azul (principal) · Branco (fundo) · Cinza claro (divisões)\n   Verde = presença · Vermelho = ausência · Amarelo = atraso · Azul-claro = justificada\n   ========================================================================== */\n:root {\n  --azul: #1d4ed8;\n  --azul-hover: #1e40af;\n  --azul-escuro: #1e3a8a;\n  --azul-suave: #eff6ff;\n  --azul-borda: #bfdbfe;\n  --fundo: #ffffff;\n  --fundo-app: #f5f7fb;\n  --texto: #0f172a;\n  --texto-2: #475569;\n  --texto-3: #64748b;\n  --divisao: #e2e8f0;\n  --divisao-2: #cbd5e1;\n  --verde: #15803d;   --verde-forte: #16a34a; --verde-bg: #dcfce7;\n  --vermelho: #b91c1c; --vermelho-forte: #dc2626; --vermelho-bg: #fee2e2;\n  --amarelo: #854d0e;  --amarelo-forte: #facc15; --amarelo-bg: #fef9c3;\n  --just: #075985;     --just-forte: #7dd3fc;   --just-bg: #e0f2fe;\n  --neutro-bg: #f1f5f9;\n  --raio: 10px;\n  --raio-sm: 7px;\n  --sombra: 0 1px 2px rgba(15, 23, 42, .06), 0 2px 8px rgba(15, 23, 42, .05);\n  --sombra-alta: 0 10px 30px rgba(15, 23, 42, .18);\n  --sidebar: 248px;\n  --topbar: 64px;\n  --bottomnav: 64px;\n  --fonte: \"Segoe UI\", Roboto, -apple-system, BlinkMacSystemFont, \"Helvetica Neue\", Arial, sans-serif;\n}\n* { box-sizing: border-box; }\nhtml { -webkit-text-size-adjust: 100%; }\nbody {\n  margin: 0; font-family: var(--fonte); font-size: 15px; line-height: 1.45;\n  color: var(--texto); background: var(--fundo-app);\n  -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent;\n}\nbutton, input, select, textarea { font: inherit; color: inherit; }\nbutton { cursor: pointer; }\na { color: var(--azul); }\n.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\nsvg.ic { width: 20px; height: 20px; flex: none; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }\n\n/* ------------------------------------------------------------------ Estrutura */\n.app { min-height: 100vh; }\n.sidebar {\n  position: fixed; inset: 0 auto 0 0; width: var(--sidebar); background: var(--fundo);\n  border-right: 1px solid var(--divisao); display: none; flex-direction: column; z-index: 30;\n}\n.marca { display: flex; gap: 12px; align-items: center; padding: 18px 18px 16px; border-bottom: 1px solid var(--divisao); }\n.marca-logo { width: 40px; height: 40px; flex: none; }\n.marca-nome { font-weight: 800; letter-spacing: .02em; font-size: 15px; color: var(--azul-escuro); line-height: 1.15; }\n.marca-sub { font-size: 11px; color: var(--texto-3); line-height: 1.25; margin-top: 2px; }\n.nav { padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; flex: 1; overflow-y: auto; }\n.nav-item {\n  display: flex; align-items: center; gap: 12px; width: 100%; border: 0; background: none; text-align: left;\n  padding: 11px 12px; border-radius: var(--raio-sm); color: var(--texto-2); font-weight: 600; font-size: 14.5px;\n}\n.nav-item:hover { background: var(--neutro-bg); color: var(--texto); }\n.nav-item.ativo { background: var(--azul-suave); color: var(--azul); }\n.nav-item.destaque { background: var(--azul); color: #fff; margin-bottom: 8px; }\n.nav-item.destaque:hover { background: var(--azul-hover); }\n.nav-rodape { padding: 14px 18px; border-top: 1px solid var(--divisao); font-size: 12px; color: var(--texto-3); }\n\n.principal { min-height: 100vh; padding-bottom: calc(var(--bottomnav) + env(safe-area-inset-bottom)); }\n.topbar {\n  position: sticky; top: 0; z-index: 20; height: var(--topbar); background: rgba(255, 255, 255, .96);\n  backdrop-filter: saturate(1.4) blur(6px); -webkit-backdrop-filter: saturate(1.4) blur(6px);\n  border-bottom: 1px solid var(--divisao); display: flex; align-items: center; gap: 12px; padding: 0 16px;\n}\n.topbar .marca-logo { width: 34px; height: 34px; }\n.topbar-titulo { min-width: 0; flex: 1; }\n.topbar-titulo .t1 { overflow: hidden; text-overflow: ellipsis; font-weight: 800; color: var(--azul-escuro); font-size: 14px; letter-spacing: .02em; white-space: nowrap; }\n.topbar-titulo .t2 { font-size: 12px; color: var(--texto-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.sel-turma { display: flex; align-items: center; gap: 8px; }\n.sel-turma select { max-width: 200px; }\n.usuario-chip {\n  display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border-radius: 999px;\n  background: var(--neutro-bg); font-size: 13px; color: var(--texto-2); max-width: 240px;\n}\n.avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--azul); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 12px; flex: none; }\n.usuario-chip .nome { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n\n.conteudo { padding: 18px 16px 28px; max-width: 1280px; margin: 0 auto; }\n.bottomnav {\n  position: fixed; left: 0; right: 0; bottom: 0; z-index: 25; background: var(--fundo); border-top: 1px solid var(--divisao);\n  display: flex; padding-bottom: env(safe-area-inset-bottom); height: calc(var(--bottomnav) + env(safe-area-inset-bottom));\n}\n.bottomnav button {\n  flex: 1; border: 0; background: none; display: flex; flex-direction: column; align-items: center; justify-content: center;\n  gap: 3px; font-size: 11.5px; font-weight: 600; color: var(--texto-3); padding: 6px 2px;\n}\n.bottomnav button.ativo { color: var(--azul); }\n.bottomnav button svg.ic { width: 23px; height: 23px; }\n\n@media (min-width: 1024px) {\n  .sidebar { display: flex; }\n  .principal { margin-left: var(--sidebar); padding-bottom: 0; }\n  .bottomnav, .topbar .marca-logo.so-mobile { display: none; }\n  .topbar { padding: 0 24px; }\n  .conteudo { padding: 24px 28px 40px; }\n}\n@media (max-width: 640px) {\n  .topbar-titulo .t2 { display: none; }\n  .usuario-chip .nome { display: none; }\n  .usuario-chip { padding: 3px; }\n  .sel-turma select { max-width: 150px; }\n}\n@media (max-width: 480px) {\n  .topbar { gap: 8px; padding: 0 12px; }\n  .topbar-titulo { display: none; }\n  .sel-turma { flex: 1; min-width: 0; }\n  .sel-turma select { max-width: none; }\n}\n\n/* ------------------------------------------------------------------ Componentes */\n.cabecalho-pagina { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 18px; }\n.cabecalho-pagina h1 { margin: 0; font-size: 22px; letter-spacing: -.01em; }\n.cabecalho-pagina .sub { color: var(--texto-3); font-size: 14px; margin-top: 2px; }\nh2.secao { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: var(--texto-2); margin: 26px 0 10px; font-weight: 800; }\n.card { background: var(--fundo); border: 1px solid var(--divisao); border-radius: var(--raio); box-shadow: var(--sombra); }\n.card-corpo { padding: 16px; }\n.card-titulo { font-weight: 700; font-size: 15px; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }\n.grade { display: grid; gap: 14px; }\n.grade-kpi { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }\n.grade-2 { grid-template-columns: 1fr; }\n@media (min-width: 900px) { .grade-2 { grid-template-columns: 1.4fr 1fr; } }\n.kpi { padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; position: relative; overflow: hidden; }\n.kpi .rotulo { font-size: 12.5px; color: var(--texto-3); font-weight: 600; display: flex; align-items: center; gap: 6px; }\n.kpi .valor { font-size: 28px; font-weight: 800; letter-spacing: -.02em; line-height: 1.1; }\n.kpi .det { font-size: 12px; color: var(--texto-3); }\n.kpi::before { content: \"\"; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--kpi-cor, var(--azul)); }\n.kpi.verde { --kpi-cor: var(--verde-forte); } .kpi.vermelho { --kpi-cor: var(--vermelho-forte); }\n.kpi.amarelo { --kpi-cor: #eab308; } .kpi.just { --kpi-cor: #38bdf8; } .kpi.cinza { --kpi-cor: var(--divisao-2); }\n\n.btn {\n  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 0 16px;\n  border-radius: var(--raio-sm); border: 1px solid var(--divisao-2); background: var(--fundo); color: var(--texto);\n  font-weight: 650; font-size: 14.5px; white-space: nowrap; transition: background .12s, border-color .12s, opacity .12s;\n}\n.btn:hover { background: var(--neutro-bg); }\n.btn:disabled { opacity: .5; cursor: not-allowed; }\n.btn-primario { background: var(--azul); border-color: var(--azul); color: #fff; }\n.btn-primario:hover { background: var(--azul-hover); }\n.btn-sucesso { background: var(--verde-forte); border-color: var(--verde-forte); color: #fff; }\n.btn-sucesso:hover { background: var(--verde); }\n.btn-perigo { background: var(--fundo); border-color: #fecaca; color: var(--vermelho); }\n.btn-perigo:hover { background: var(--vermelho-bg); }\n.btn-perigo-cheio { background: var(--vermelho-forte); border-color: var(--vermelho-forte); color: #fff; }\n.btn-grande { min-height: 52px; padding: 0 22px; font-size: 16px; }\n.btn-sm { min-height: 34px; padding: 0 10px; font-size: 13px; }\n.btn-link { border: 0; background: none; color: var(--azul); padding: 0; min-height: 0; font-weight: 600; text-align: left; white-space: normal; }\n.btn-link:hover { text-decoration: underline; background: none; }\n\n.campo { display: flex; flex-direction: column; gap: 5px; min-width: 0; }\n.campo label { font-size: 12.5px; font-weight: 700; color: var(--texto-2); }\n.campo .ajuda { font-size: 12px; color: var(--texto-3); }\ninput[type=text], input[type=email], input[type=date], input[type=number], select, textarea {\n  min-height: 42px; padding: 8px 11px; border: 1px solid var(--divisao-2); border-radius: var(--raio-sm);\n  background: var(--fundo); width: 100%; font-size: 15px;\n}\ninput:focus, select:focus, textarea:focus, button:focus-visible { outline: 3px solid rgba(29, 78, 216, .25); outline-offset: 1px; border-color: var(--azul); }\ntextarea { min-height: 90px; resize: vertical; }\n.filtros { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); align-items: end; }\n.linha-acoes { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }\n\n.etiqueta { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }\n.et-PRESENTE { background: var(--verde-bg); color: var(--verde); }\n.et-AUSENTE { background: var(--vermelho-bg); color: var(--vermelho); }\n.et-ATRASADO { background: var(--amarelo-bg); color: var(--amarelo); }\n.et-JUSTIFICADA { background: var(--just-bg); color: var(--just); }\n.et-NAO_REGISTRADO, .et-INATIVO { background: var(--neutro-bg); color: var(--texto-3); }\n.et-FINALIZADA { background: var(--verde-bg); color: var(--verde); }\n.et-RASCUNHO { background: var(--amarelo-bg); color: var(--amarelo); }\n.et-ATIVO { background: var(--azul-suave); color: var(--azul); }\n.et-alerta { background: var(--vermelho-bg); color: var(--vermelho); }\n\n.aviso { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: var(--raio-sm); font-size: 14px; border: 1px solid; margin-bottom: 14px; }\n.aviso svg.ic { margin-top: 1px; }\n.aviso-info { background: var(--azul-suave); border-color: var(--azul-borda); color: var(--azul-escuro); }\n.aviso-atencao { background: #fffbeb; border-color: #fde68a; color: #78350f; }\n.aviso-erro { background: var(--vermelho-bg); border-color: #fecaca; color: #7f1d1d; }\n.aviso-ok { background: #f0fdf4; border-color: #bbf7d0; color: #14532d; }\n.aviso .acoes { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }\n\n.tabela-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }\ntable.tabela { width: 100%; border-collapse: collapse; font-size: 14px; }\n.tabela th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--texto-3); font-weight: 700; padding: 10px 12px; border-bottom: 1px solid var(--divisao); background: #f8fafc; white-space: nowrap; }\n.tabela td { padding: 10px 12px; border-bottom: 1px solid var(--divisao); vertical-align: middle; }\n.tabela tr:last-child td { border-bottom: 0; }\n.tabela tr.clicavel { cursor: pointer; }\n.tabela tr.clicavel:hover td { background: #f8fafc; }\n.tabela .num { text-align: right; font-variant-numeric: tabular-nums; }\n.tabela .baixo { color: var(--vermelho); font-weight: 800; }\n.vazio { padding: 28px 16px; text-align: center; color: var(--texto-3); }\n.vazio svg.ic { width: 34px; height: 34px; color: var(--divisao-2); margin-bottom: 6px; }\n\n.paginacao { display: flex; gap: 8px; align-items: center; justify-content: flex-end; padding: 12px; font-size: 13px; color: var(--texto-3); }\n.carregando { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 40px; color: var(--texto-3); }\n.spinner { width: 22px; height: 22px; border-radius: 50%; border: 3px solid var(--azul-borda); border-top-color: var(--azul); animation: girar .8s linear infinite; }\n@keyframes girar { to { transform: rotate(360deg); } }\n\n/* ------------------------------------------------------------------ Painel */\n.boas-vindas { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; align-items: center; padding: 18px 20px;\n  background: linear-gradient(120deg, var(--azul-escuro), var(--azul)); color: #fff; border: 0; }\n.boas-vindas .escola { font-size: 12.5px; opacity: .85; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }\n.boas-vindas .ola { font-size: 21px; font-weight: 800; margin: 2px 0; }\n.boas-vindas .info { font-size: 14px; opacity: .92; }\n.boas-vindas .btn { background: #fff; color: var(--azul-escuro); border-color: #fff; }\n.grafico svg { width: 100%; height: auto; display: block; }\n.legenda { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12.5px; color: var(--texto-2); margin-top: 8px; }\n.legenda i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }\n.donut-wrap { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }\n.donut-wrap svg { width: 150px; height: 150px; flex: none; }\n.lista-alerta { list-style: none; margin: 0; padding: 0; }\n.lista-alerta li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--divisao); }\n.lista-alerta li:last-child { border-bottom: 0; }\n.lista-alerta .n { width: 30px; height: 30px; border-radius: 50%; background: var(--neutro-bg); display: grid; place-items: center; font-size: 12px; font-weight: 700; color: var(--texto-2); flex: none; }\n.lista-alerta .nome { flex: 1; min-width: 0; font-weight: 600; }\n.barra-pct { height: 6px; background: var(--neutro-bg); border-radius: 99px; overflow: hidden; margin-top: 5px; }\n.barra-pct span { display: block; height: 100%; background: var(--vermelho-forte); }\n\n/* ------------------------------------------------------------------ Chamada */\n.chamada-topo { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); align-items: end; margin-bottom: 14px; }\n.contadores {\n  position: sticky; top: var(--topbar); z-index: 15; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px;\n  padding: 10px 0; background: var(--fundo-app); margin-bottom: 6px;\n}\n.contador { background: var(--fundo); border: 1px solid var(--divisao); border-radius: var(--raio-sm); padding: 8px 6px; text-align: center; }\n.contador .v { font-size: 22px; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; }\n.contador .r { font-size: 11px; font-weight: 700; color: var(--texto-3); text-transform: uppercase; letter-spacing: .03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.contador.c-P { border-bottom: 3px solid var(--verde-forte); } .contador.c-P .v { color: var(--verde); }\n.contador.c-A { border-bottom: 3px solid var(--vermelho-forte); } .contador.c-A .v { color: var(--vermelho); }\n.contador.c-T { border-bottom: 3px solid var(--amarelo-forte); } .contador.c-T .v { color: var(--amarelo); }\n.contador.c-J { border-bottom: 3px solid var(--just-forte); } .contador.c-J .v { color: var(--just); }\n.contador.c-N { border-bottom: 3px solid var(--divisao-2); }\n.contador.c-N.pendente .v { color: var(--vermelho); }\n.contador .curto { display: none; }\n.acoes-lista { margin-bottom: 4px; }\n@media (max-width: 640px) {\n  .contadores { gap: 4px; padding: 6px 0; }\n  .contador { padding: 5px 2px; }\n  .contador .v { font-size: 18px; }\n  .contador .longo { display: none; }\n  .contador .curto { display: inline; }\n  .acoes-lista { display: grid; grid-template-columns: 1fr 1fr; }\n  .acoes-lista .btn { white-space: normal; line-height: 1.15; padding: 4px 8px; }\n}\n\n.status-salvamento { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 650; padding: 6px 12px; border-radius: 999px; background: var(--neutro-bg); color: var(--texto-2); }\n.status-salvamento .ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--divisao-2); }\n.status-salvamento.salvando .ponto { background: var(--azul); animation: pulsar 1s infinite; }\n.status-salvamento.salvo { background: var(--verde-bg); color: var(--verde); } .status-salvamento.salvo .ponto { background: var(--verde-forte); }\n.status-salvamento.pendente { background: var(--amarelo-bg); color: var(--amarelo); } .status-salvamento.pendente .ponto { background: #eab308; }\n.status-salvamento.erro, .status-salvamento.offline { background: var(--vermelho-bg); color: var(--vermelho); } .status-salvamento.erro .ponto, .status-salvamento.offline .ponto { background: var(--vermelho-forte); }\n@keyframes pulsar { 50% { opacity: .3; } }\n\n.lista-chamada { background: var(--fundo); border: 1px solid var(--divisao); border-radius: var(--raio); box-shadow: var(--sombra); overflow: hidden; }\n.lc-cabecalho, .lc-linha { display: grid; grid-template-columns: 56px minmax(0, 1fr) repeat(4, 118px); gap: 8px; align-items: center; padding: 8px 14px; }\n.lc-cabecalho { background: #f8fafc; border-bottom: 1px solid var(--divisao); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--texto-3); font-weight: 700; }\n.lc-cabecalho span:nth-child(n+3) { text-align: center; }\n.lc-linha { border-bottom: 1px solid var(--divisao); transition: background .15s; }\n.lc-linha:last-child { border-bottom: 0; }\n.lc-linha.s-NAO_REGISTRADO { background: #fff; }\n.lc-linha.s-PRESENTE { background: #f6fef9; } .lc-linha.s-AUSENTE { background: #fff7f7; }\n.lc-linha.s-ATRASADO { background: #fffdf0; } .lc-linha.s-JUSTIFICADA { background: #f5fbff; }\n.lc-num { width: 40px; height: 40px; border-radius: 50%; background: var(--neutro-bg); display: grid; place-items: center; font-weight: 800; font-size: 15px; color: var(--texto-2); font-variant-numeric: tabular-nums; }\n.s-PRESENTE .lc-num { background: var(--verde-forte); color: #fff; } .s-AUSENTE .lc-num { background: var(--vermelho-forte); color: #fff; }\n.s-ATRASADO .lc-num { background: var(--amarelo-forte); color: #422006; } .s-JUSTIFICADA .lc-num { background: var(--just-forte); color: #0c4a6e; }\n.lc-nome { font-weight: 650; font-size: 15.5px; min-width: 0; }\n.lc-nome .btn-link { color: var(--texto); font-weight: 650; }\n.lc-nome .sit-texto { display: block; font-size: 12px; font-weight: 600; color: var(--texto-3); margin-top: 1px; }\n.lc-obs { grid-column: 2 / -1; display: none; }\n.lc-linha.s-JUSTIFICADA .lc-obs, .lc-linha.s-ATRASADO .lc-obs.tem { display: block; }\n.lc-obs input { min-height: 36px; font-size: 14px; }\n.bsit {\n  min-height: 46px; border-radius: var(--raio-sm); border: 1.5px solid var(--divisao-2); background: var(--fundo); font-weight: 750; font-size: 13.5px;\n  display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 6px; color: var(--texto-2); touch-action: manipulation; user-select: none; -webkit-user-select: none;\n}\n.bsit svg.ic { width: 18px; height: 18px; }\n.bsit.b-PRESENTE { color: var(--verde); border-color: #86efac; } .bsit.b-PRESENTE:hover { background: var(--verde-bg); }\n.bsit.b-AUSENTE { color: var(--vermelho); border-color: #fca5a5; } .bsit.b-AUSENTE:hover { background: var(--vermelho-bg); }\n.bsit.b-ATRASADO { color: var(--amarelo); border-color: #fde047; } .bsit.b-ATRASADO:hover { background: var(--amarelo-bg); }\n.bsit.b-JUSTIFICADA { color: var(--just); border-color: #7dd3fc; } .bsit.b-JUSTIFICADA:hover { background: var(--just-bg); }\n.bsit.sel.b-PRESENTE { background: var(--verde-forte); border-color: var(--verde-forte); color: #fff; }\n.bsit.sel.b-AUSENTE { background: var(--vermelho-forte); border-color: var(--vermelho-forte); color: #fff; }\n.bsit.sel.b-ATRASADO { background: var(--amarelo-forte); border-color: #eab308; color: #422006; }\n.bsit.sel.b-JUSTIFICADA { background: var(--just-forte); border-color: #0ea5e9; color: #0c4a6e; }\n.bsit:disabled { cursor: default; opacity: .55; }\n.bsit.sel:disabled { opacity: 1; }\n.lc-linha.inativo .lc-nome { color: var(--texto-3); }\n.lc-botoes { display: contents; }\n\n/* Tablet e celular: linha em cartão, nome em cima e 4 botões grandes embaixo */\n@media (max-width: 1100px), (pointer: coarse) {\n  .lc-cabecalho { display: none; }\n  .lc-linha { grid-template-columns: 48px minmax(0, 1fr); padding: 12px 12px 14px; row-gap: 10px; }\n  .lc-botoes { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }\n  .bsit { min-height: 56px; font-size: 14.5px; flex-direction: column; gap: 3px; }\n  .lc-obs { grid-column: 1 / -1; }\n}\n@media (max-width: 420px) {\n  .bsit { font-size: 12.5px; min-height: 58px; }\n  .lc-nome { font-size: 15px; }\n}\n\n.barra-acoes {\n  position: sticky; bottom: calc(var(--bottomnav) + env(safe-area-inset-bottom)); z-index: 16; margin-top: 14px;\n  background: rgba(255, 255, 255, .97); border: 1px solid var(--divisao); border-radius: var(--raio); box-shadow: var(--sombra-alta);\n  padding: 10px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;\n}\n.barra-acoes .espaco { flex: 1; }\n@media (min-width: 1024px) { .barra-acoes { bottom: 12px; } }\n@media (max-width: 640px) {\n  .barra-acoes { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 8px; }\n  .barra-acoes .btn { width: 100%; padding: 0 8px; min-height: 46px; }\n  .barra-acoes .espaco { display: none; }\n  .barra-acoes .status-salvamento { grid-column: 1 / -1; justify-content: center; padding: 3px 10px; font-size: 12.5px; }\n}\n\n.faixa-status { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }\n\n/* ------------------------------------------------------------------ Modal e toast */\n.modal-fundo { position: fixed; inset: 0; background: rgba(15, 23, 42, .5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; animation: aparecer .15s; }\n.modal { background: var(--fundo); border-radius: 14px; box-shadow: var(--sombra-alta); width: 100%; max-width: 520px; max-height: calc(100vh - 32px); display: flex; flex-direction: column; }\n.modal.largo { max-width: 920px; }\n.modal-cab { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--divisao); }\n.modal-cab h3 { margin: 0; font-size: 17px; }\n.modal-corpo { padding: 16px 18px; overflow-y: auto; -webkit-overflow-scrolling: touch; }\n.modal-rodape { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid var(--divisao); flex-wrap: wrap; }\n.btn-fechar { border: 0; background: var(--neutro-bg); width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: var(--texto-2); }\n@media (max-width: 640px) {\n  .modal-fundo { padding: 0; align-items: flex-end; }\n  .modal, .modal.largo { max-width: none; border-radius: 16px 16px 0 0; max-height: 92vh; }\n  .modal-rodape .btn { flex: 1; }\n}\n@keyframes aparecer { from { opacity: 0; } }\n.toasts { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(var(--bottomnav) + 86px); z-index: 120; display: flex; flex-direction: column; gap: 8px; width: min(440px, calc(100vw - 32px)); pointer-events: none; }\n@media (min-width: 1024px) { .toasts { bottom: 90px; left: calc(50% + var(--sidebar) / 2); } }\n.toast { background: #0f172a; color: #fff; padding: 12px 16px; border-radius: 10px; box-shadow: var(--sombra-alta); font-size: 14px; font-weight: 600; display: flex; gap: 10px; align-items: center; animation: aparecer .2s; pointer-events: auto; }\n.toast.ok { background: #14532d; } .toast.erro { background: #7f1d1d; }\n\n.faixa-conexao { position: sticky; top: var(--topbar); z-index: 19; display: none; background: var(--vermelho-forte); color: #fff; padding: 9px 16px; font-size: 13.5px; font-weight: 650; text-align: center; }\n.offline .faixa-conexao { display: block; }\n\n.abas { display: flex; gap: 4px; border-bottom: 1px solid var(--divisao); margin-bottom: 16px; overflow-x: auto; }\n.aba { border: 0; background: none; padding: 10px 14px; font-weight: 700; color: var(--texto-3); border-bottom: 3px solid transparent; white-space: nowrap; }\n.aba.ativa { color: var(--azul); border-bottom-color: var(--azul); }\n.form-grade { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }\n.checks { display: flex; flex-wrap: wrap; gap: 8px 16px; }\n.checks label { display: inline-flex; gap: 6px; align-items: center; font-size: 14px; font-weight: 500; color: var(--texto); }\n.checks input { width: 18px; height: 18px; }\n.ficha-cab { display: flex; gap: 14px; align-items: center; margin-bottom: 14px; }\n.ficha-cab .lc-num { width: 52px; height: 52px; font-size: 19px; background: var(--azul); color: #fff; }\n.ficha-cab .nome { font-weight: 800; font-size: 18px; }\n.mini-kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; margin-bottom: 14px; }\n.mini-kpis .kpi .valor { font-size: 22px; }\n.diag li { margin-bottom: 4px; }\n.diag .okk { color: var(--verde); } .diag .nok { color: var(--vermelho); font-weight: 700; }\n\n@media print {\n  .sidebar, .topbar, .bottomnav, .barra-acoes, .no-print { display: none !important; }\n  .principal { margin: 0; }\n  body { background: #fff; }\n}\n</style>\n",
  JavaScript: "<script>\n/* ==========================================================================\n   FREQUÊNCIA ESCOLAR — Interface (navegador)\n   Toda leitura/gravação passa pelo servidor (google.script.run). O navegador\n   nunca acessa a planilha diretamente.\n   ========================================================================== */\n(function () {\n  'use strict';\n\n  var C = CONTEXTO;\n  var PERFIL_GESTAO = C.usuario.perfil === 'ADMIN' || C.usuario.perfil === 'GESTOR';\n  var EH_ADMIN = C.usuario.perfil === 'ADMIN';\n  var SIT = ['PRESENTE', 'AUSENTE', 'ATRASADO', 'JUSTIFICADA'];\n  var ROT = { PRESENTE: 'Presente', AUSENTE: 'Ausente', ATRASADO: 'Atrasado', JUSTIFICADA: 'Justificada', NAO_REGISTRADO: 'Não registrado' };\n  var ROT_LONGO = { PRESENTE: 'Presente', AUSENTE: 'Ausente', ATRASADO: 'Atrasado', JUSTIFICADA: 'Falta justificada', NAO_REGISTRADO: 'Não registrado' };\n  var COR = { PRESENTE: '#16a34a', AUSENTE: '#dc2626', ATRASADO: '#facc15', JUSTIFICADA: '#7dd3fc', NAO_REGISTRADO: '#cbd5e1' };\n\n  var S = { view: '', turmaId: '', estudantesCache: {} };\n  var Ch = null; // estado da tela de chamada\n\n  // ------------------------------------------------------------------ Ícones (SVG inline)\n  var ICONES = {\n    painel: '<rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1\"/>',\n    chamada: '<rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"m9 14 2 2 4-4\"/>',\n    historico: '<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"/><path d=\"M3 3v5h5\"/><path d=\"M12 7v5l4 2\"/>',\n    relatorios: '<path d=\"M3 3v18h18\"/><rect x=\"7\" y=\"12\" width=\"3\" height=\"6\"/><rect x=\"12\" y=\"8\" width=\"3\" height=\"10\"/><rect x=\"17\" y=\"5\" width=\"3\" height=\"13\"/>',\n    estudantes: '<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>',\n    admin: '<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/>',\n    mais: '<path d=\"M3 12h18M3 6h18M3 18h18\"/>',\n    PRESENTE: '<path d=\"M20 6 9 17l-5-5\"/>',\n    AUSENTE: '<path d=\"M18 6 6 18M6 6l12 12\"/>',\n    ATRASADO: '<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>',\n    JUSTIFICADA: '<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><path d=\"M14 2v6h6M9 13h6M9 17h6\"/>',\n    alerta: '<path d=\"M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z\"/><path d=\"M12 9v4M12 17h.01\"/>',\n    info: '<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4M12 8h.01\"/>',\n    salvar: '<path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"/><path d=\"M17 21v-8H7v8M7 3v5h8\"/>',\n    cadeado: '<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>',\n    abrir: '<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 9.9-1\"/>',\n    baixar: '<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5M12 15V3\"/>',\n    mais1: '<path d=\"M12 5v14M5 12h14\"/>',\n    editar: '<path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z\"/>',\n    limpar: '<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"/><path d=\"M3 3v5h5\"/>',\n    todos: '<path d=\"M18 6 7 17l-5-5\"/><path d=\"m22 10-7.5 7.5L13 16\"/>',\n    transferir: '<path d=\"m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16\"/>',\n    fechar: '<path d=\"M18 6 6 18M6 6l12 12\"/>',\n    finalizar: '<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m8 12 3 3 5-6\"/>',\n    vazio: '<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>',\n    atualizar: '<path d=\"M21 12a9 9 0 1 1-3-6.7L21 8\"/><path d=\"M21 3v5h-5\"/>'\n  };\n  function ic(nome) { return '<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">' + (ICONES[nome] || '') + '</svg>'; }\n\n  // ------------------------------------------------------------------ Utilidades\n  function $(sel, raiz) { return (raiz || document).querySelector(sel); }\n  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }\n  function h(v) {\n    return String(v === null || v === undefined ? '' : v).replace(/[&<>\"']/g, function (c) {\n      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c];\n    });\n  }\n  function dataBr(iso) { if (!iso) return ''; var p = String(iso).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }\n  function dataHoraBr(s) { if (!s) return ''; var p = String(s).split(' '); return dataBr(p[0]) + (p[1] ? ' às ' + p[1].slice(0, 5) : ''); }\n  function pct(v) { return v === null || v === undefined || v === '' ? '—' : Number(v).toFixed(1).replace('.', ',') + '%'; }\n  function hojeSP() {\n    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }\n    catch (e) { return C.hoje; }\n  }\n  function somarDias(iso, n) {\n    var p = iso.split('-'); var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));\n    return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);\n  }\n  function diaSemana(iso) { var p = iso.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay(); }\n  function dataExtenso(iso) {\n    var p = iso.split('-');\n    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }\n    catch (e) { return dataBr(iso); }\n  }\n  function nomePeriodo(p) { return p === 'DIARIO' ? 'Chamada diária' : p; }\n  function idReq() { return 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }\n  function turmaAtual() { return C.turmas.filter(function (t) { return t.id === S.turmaId; })[0] || null; }\n  var ls = {\n    get: function (k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },\n    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },\n    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignorar */ } }\n  };\n\n  // ------------------------------------------------------------------ Comunicação com o servidor\n  /**\n   * Chama uma função do servidor e devolve uma Promise.\n   * Repete automaticamente em falhas de comunicação e quando o servidor está ocupado.\n   * O resultado só é considerado salvo quando o servidor confirma (ok: true).\n   */\n  function servidor(fn, args, opts) {\n    opts = opts || {};\n    var maxTentativas = opts.tentativas === undefined ? 2 : opts.tentativas;\n    return new Promise(function (resolve, reject) {\n      if (navigator.onLine === false && opts.exigeConexao) {\n        reject({ codigo: 'SEM_CONEXAO', erro: 'Sem conexão com a internet.', rede: true });\n        return;\n      }\n      var n = 0;\n      function tentar() {\n        n++;\n        var r = google.script.run\n          .withSuccessHandler(function (res) {\n            if (!res) { reject({ codigo: 'ERRO_INTERNO', erro: 'Resposta vazia do servidor.' }); return; }\n            if (res.ok) { resolve(res.data); return; }\n            if (res.codigo === 'OCUPADO' && n <= maxTentativas) { novaTentativa(); return; }\n            reject(res);\n          })\n          .withFailureHandler(function (err) {\n            if (n <= maxTentativas) { novaTentativa(); return; }\n            var off = navigator.onLine === false;\n            reject({ codigo: off ? 'SEM_CONEXAO' : 'FALHA_COMUNICACAO', rede: true,\n              erro: off ? 'Sem conexão com a internet.' : 'Não foi possível comunicar com o servidor' + (err && err.message ? ' (' + err.message + ')' : '') + '.' });\n          });\n        r[fn].apply(r, args || []);\n      }\n      function novaTentativa() {\n        if (opts.aoTentarNovamente) opts.aoTentarNovamente(n, maxTentativas);\n        setTimeout(tentar, Math.min(1500 * Math.pow(2, n - 1), 8000));\n      }\n      tentar();\n    });\n  }\n\n  // ------------------------------------------------------------------ Toasts e modais\n  function toast(msg, tipo, ms) {\n    var el = document.createElement('div');\n    el.className = 'toast ' + (tipo || '');\n    el.innerHTML = (tipo === 'ok' ? ic('PRESENTE') : tipo === 'erro' ? ic('alerta') : ic('info')) + '<span>' + h(msg) + '</span>';\n    var caixa = $('#toasts');\n    while (caixa.children.length >= 3) caixa.removeChild(caixa.firstChild); // no máximo 3 avisos visíveis\n    caixa.appendChild(el);\n    setTimeout(function () { el.remove(); }, ms || (tipo === 'erro' ? 6500 : 3200));\n  }\n  function erroMsg(e) { return (e && (e.erro || e.message)) || 'Erro inesperado.'; }\n\n  /**\n   * Abre um modal. acoes: [{ rotulo, classe, valor }]. Retorna Promise com o valor da ação\n   * escolhida (ou null ao fechar). Se acao.validar devolver false, o modal permanece aberto.\n   */\n  function modal(opts) {\n    return new Promise(function (resolve) {\n      var fundo = document.createElement('div');\n      fundo.className = 'modal-fundo';\n      fundo.innerHTML = '<div class=\"modal ' + (opts.largo ? 'largo' : '') + '\" role=\"dialog\" aria-modal=\"true\" aria-label=\"' + h(opts.titulo) + '\">' +\n        '<div class=\"modal-cab\"><h3>' + h(opts.titulo) + '</h3><button class=\"btn-fechar\" data-fechar aria-label=\"Fechar\">' + ic('fechar') + '</button></div>' +\n        '<div class=\"modal-corpo\">' + (opts.corpo || '') + '</div>' +\n        ((opts.acoes || []).length ? '<div class=\"modal-rodape\">' + opts.acoes.map(function (a, i) {\n          return '<button class=\"btn ' + (a.classe || '') + '\" data-acao-modal=\"' + i + '\">' + (a.icone ? ic(a.icone) : '') + h(a.rotulo) + '</button>';\n        }).join('') + '</div>' : '') + '</div>';\n      $('#modais').appendChild(fundo);\n      var anterior = document.activeElement;\n      function fechar(v) {\n        fundo.remove();\n        document.removeEventListener('keydown', esc);\n        if (anterior && anterior.focus) try { anterior.focus(); } catch (e) { /* ignorar */ }\n        resolve(v);\n      }\n      function esc(ev) { if (ev.key === 'Escape' && !opts.semFecharEsc) fechar(null); }\n      document.addEventListener('keydown', esc);\n      fundo.addEventListener('click', function (ev) {\n        if (ev.target === fundo && !opts.semFecharFora) { fechar(null); return; }\n        if (ev.target.closest('[data-fechar]')) { fechar(null); return; }\n        var b = ev.target.closest('[data-acao-modal]');\n        if (b) {\n          var a = opts.acoes[Number(b.getAttribute('data-acao-modal'))];\n          if (a.validar && a.validar(fundo) === false) return;\n          fechar(a.valor !== undefined ? a.valor : true);\n        }\n      });\n      if (opts.aoAbrir) opts.aoAbrir(fundo, fechar);\n      var foco = $('[autofocus]', fundo) || $('.modal-rodape .btn-primario, .modal-rodape .btn-sucesso', fundo);\n      if (foco) setTimeout(function () { foco.focus(); }, 30);\n    });\n  }\n  function confirmar(titulo, texto, rotuloOk, classeOk) {\n    return modal({ titulo: titulo, corpo: '<p style=\"margin:0\">' + texto + '</p>',\n      acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: rotuloOk || 'Confirmar', classe: classeOk || 'btn-primario', valor: true }] })\n      .then(function (v) { return v === true; });\n  }\n  function alertar(titulo, texto) {\n    return modal({ titulo: titulo, corpo: '<p style=\"margin:0\">' + texto + '</p>', acoes: [{ rotulo: 'Entendi', classe: 'btn-primario', valor: true }] });\n  }\n  /** Pede um texto (ex.: motivo). minimo = tamanho mínimo obrigatório. */\n  function pedirTexto(titulo, rotulo, ajuda, minimo, rotuloOk) {\n    var valor = null;\n    return modal({\n      titulo: titulo,\n      corpo: '<div class=\"campo\"><label for=\"pt-txt\">' + h(rotulo) + '</label><textarea id=\"pt-txt\" maxlength=\"500\" autofocus></textarea>' +\n        (ajuda ? '<div class=\"ajuda\">' + h(ajuda) + '</div>' : '') + '<div class=\"ajuda\" id=\"pt-erro\" style=\"color:#b91c1c\"></div></div>',\n      acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: rotuloOk || 'Confirmar', classe: 'btn-primario', valor: true, validar: function (f) {\n        var v = $('#pt-txt', f).value.trim();\n        if (v.length < (minimo || 0)) { $('#pt-erro', f).textContent = 'Informe pelo menos ' + minimo + ' caracteres.'; return false; }\n        valor = v; return true;\n      } }]\n    }).then(function (ok) { return ok === true ? valor : null; });\n  }\n  function carregandoHtml(txt) { return '<div class=\"carregando\"><div class=\"spinner\"></div>' + h(txt || 'Carregando...') + '</div>'; }\n  function vazioHtml(txt) { return '<div class=\"vazio\">' + ic('vazio') + '<div>' + h(txt) + '</div></div>'; }\n  function erroHtml(e, tentar) {\n    return '<div class=\"aviso aviso-erro\">' + ic('alerta') + '<div><strong>' + h(erroMsg(e)) + '</strong>' +\n      (tentar ? '<div class=\"acoes\"><button class=\"btn btn-sm\" data-acao=\"recarregar-view\">' + ic('atualizar') + 'Tentar novamente</button></div>' : '') + '</div></div>';\n  }\n\n  /** Download de arquivo recebido em base64 (PDF, Excel, CSV). */\n  function baixarArquivo(arq) {\n    var bin = atob(arq.base64);\n    var bytes = new Uint8Array(bin.length);\n    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);\n    var blob = new Blob([bytes], { type: arq.mime });\n    var url = URL.createObjectURL(blob);\n    var a = document.createElement('a');\n    a.href = url; a.download = arq.nome; a.rel = 'noopener';\n    document.body.appendChild(a);\n    try { a.click(); } catch (e) { window.open(url, '_blank'); }\n    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 60000);\n  }\n\n  // ------------------------------------------------------------------ Gráficos (SVG simples)\n  function graficoBarras(serie, limite) {\n    if (!serie.length) return vazioHtml('Ainda não há chamadas finalizadas para exibir no gráfico.');\n    var W = 640, H = 230, ml = 34, mr = 8, mt = 16, mb = 34;\n    var w = W - ml - mr, hh = H - mt - mb, n = serie.length;\n    var bw = Math.min(38, w / n * 0.66), passo = w / n;\n    var y = function (v) { return mt + hh - (v / 100) * hh; };\n    var s = '<svg viewBox=\"0 0 ' + W + ' ' + H + '\" role=\"img\" aria-label=\"Frequência por dia\">';\n    [0, 25, 50, 75, 100].forEach(function (g) {\n      s += '<line x1=\"' + ml + '\" x2=\"' + (W - mr) + '\" y1=\"' + y(g) + '\" y2=\"' + y(g) + '\" stroke=\"#e2e8f0\"/>' +\n        '<text x=\"' + (ml - 6) + '\" y=\"' + (y(g) + 4) + '\" text-anchor=\"end\" font-size=\"11\" fill=\"#64748b\">' + g + '%</text>';\n    });\n    var cada = Math.ceil(n / 10);\n    serie.forEach(function (p, i) {\n      var v = p.frequencia === null ? 0 : p.frequencia;\n      var x = ml + i * passo + (passo - bw) / 2;\n      var cor = v >= limite ? '#16a34a' : '#dc2626';\n      var rotulo = p.rotulo || dataBr(p.data).slice(0, 5);\n      s += '<rect x=\"' + x + '\" y=\"' + y(v) + '\" width=\"' + bw + '\" height=\"' + Math.max(0, mt + hh - y(v)) + '\" rx=\"4\" fill=\"' + cor + '\"><title>' +\n        h(p.rotulo || dataBr(p.data)) + ': ' + pct(p.frequencia) + ' (P ' + p.presentes + ', AT ' + p.atrasados + ', A ' + p.ausentes + ', J ' + p.justificados + ')</title></rect>';\n      if (n <= 12) s += '<text x=\"' + (x + bw / 2) + '\" y=\"' + (y(v) - 4) + '\" text-anchor=\"middle\" font-size=\"10.5\" font-weight=\"700\" fill=\"#334155\">' + Math.round(v) + '%</text>';\n      if (i % cada === 0) s += '<text x=\"' + (x + bw / 2) + '\" y=\"' + (H - 12) + '\" text-anchor=\"middle\" font-size=\"11\" fill=\"#64748b\">' + h(rotulo) + '</text>';\n    });\n    s += '<line x1=\"' + ml + '\" x2=\"' + (W - mr) + '\" y1=\"' + y(limite) + '\" y2=\"' + y(limite) + '\" stroke=\"#1d4ed8\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\"/>' +\n      '<text x=\"' + (W - mr) + '\" y=\"' + (y(limite) - 5) + '\" text-anchor=\"end\" font-size=\"11\" font-weight=\"700\" fill=\"#1d4ed8\">meta ' + limite + '%</text></svg>';\n    return '<div class=\"grafico\">' + s + '</div>';\n  }\n  function graficoRosca(partes, centro, sub) {\n    var total = partes.reduce(function (a, p) { return a + p.v; }, 0);\n    var R = 52, CIRC = 2 * Math.PI * R, acc = 0;\n    var s = '<svg viewBox=\"0 0 140 140\" role=\"img\" aria-label=\"Distribuição\"><circle cx=\"70\" cy=\"70\" r=\"' + R + '\" fill=\"none\" stroke=\"#f1f5f9\" stroke-width=\"20\"/>';\n    if (total > 0) partes.forEach(function (p) {\n      if (!p.v) return;\n      var len = p.v / total * CIRC;\n      s += '<circle cx=\"70\" cy=\"70\" r=\"' + R + '\" fill=\"none\" stroke=\"' + p.cor + '\" stroke-width=\"20\" stroke-dasharray=\"' + len + ' ' + (CIRC - len) +\n        '\" stroke-dashoffset=\"' + (-acc) + '\" transform=\"rotate(-90 70 70)\"><title>' + h(p.rotulo) + ': ' + p.v + '</title></circle>';\n      acc += len;\n    });\n    s += '<text x=\"70\" y=\"70\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"800\" fill=\"#0f172a\">' + h(centro) + '</text>' +\n      '<text x=\"70\" y=\"88\" text-anchor=\"middle\" font-size=\"10\" fill=\"#64748b\">' + h(sub) + '</text></svg>';\n    var leg = '<div class=\"legenda\" style=\"flex-direction:column;gap:6px\">' + partes.map(function (p) {\n      return '<span><i style=\"background:' + p.cor + '\"></i>' + h(p.rotulo) + ': <strong>' + p.v + '</strong>' +\n        (total ? ' (' + Math.round(p.v / total * 100) + '%)' : '') + '</span>';\n    }).join('') + '</div>';\n    return '<div class=\"donut-wrap\">' + s + leg + '</div>';\n  }\n  function partesDistribuicao(P, T, A, J) {\n    return [{ v: P, cor: COR.PRESENTE, rotulo: 'Presenças' }, { v: T, cor: '#eab308', rotulo: 'Atrasos' },\n      { v: A, cor: COR.AUSENTE, rotulo: 'Ausências' }, { v: J, cor: '#38bdf8', rotulo: 'Faltas justificadas' }];\n  }\n\n  // ------------------------------------------------------------------ Navegação\n  var VIEWS = [\n    { id: 'painel', rotulo: 'Painel', icone: 'painel' },\n    { id: 'chamada', rotulo: 'Fazer chamada', curto: 'Chamada', icone: 'chamada', destaque: true },\n    { id: 'historico', rotulo: 'Histórico', icone: 'historico' },\n    { id: 'relatorios', rotulo: 'Relatórios', icone: 'relatorios' },\n    { id: 'estudantes', rotulo: 'Estudantes', icone: 'estudantes', gestao: true },\n    { id: 'admin', rotulo: 'Administração', icone: 'admin', gestao: true }\n  ].filter(function (v) { return !v.gestao || PERFIL_GESTAO; });\n\n  function montarNavegacao() {\n    $('#nav-lateral').innerHTML = VIEWS.map(function (v) {\n      return '<button class=\"nav-item ' + (v.destaque ? 'destaque' : '') + '\" data-nav=\"' + v.id + '\">' + ic(v.icone) + h(v.rotulo) + '</button>';\n    }).join('');\n    var inferior = VIEWS.filter(function (v) { return !v.gestao; });\n    $('#nav-inferior').innerHTML = inferior.map(function (v) {\n      return '<button data-nav=\"' + v.id + '\">' + ic(v.icone) + '<span>' + h(v.curto || v.rotulo) + '</span></button>';\n    }).join('') + (PERFIL_GESTAO ? '<button data-nav=\"mais\">' + ic('mais') + '<span>Mais</span></button>' : '');\n    $('#rodape-lateral').innerHTML = 'Versão ' + h(C.versao) + '<br>Conectado como ' + h(C.usuario.email);\n    var ini = (C.usuario.nome || '?').split(' ').filter(String);\n    $('#usuario-chip').innerHTML = '<span class=\"avatar\">' + h((ini[0] || '?')[0] + (ini.length > 1 ? ini[ini.length - 1][0] : '')) + '</span><span class=\"nome\">' + h(C.usuario.nome) + '</span>';\n    $('#usuario-chip').title = C.usuario.nome + ' — ' + C.usuario.email + ' (' + C.usuario.perfil + ')';\n    $('#topo-escola').textContent = C.escola;\n    preencherSeletorTurma();\n  }\n  function preencherSeletorTurma() {\n    var sel = $('#sel-turma-global');\n    var ativas = C.turmas.filter(function (t) { return t.ativa; });\n    var inativas = C.turmas.filter(function (t) { return !t.ativa; });\n    if (!C.turmas.length) { sel.innerHTML = '<option value=\"\">Sem turmas</option>'; return; }\n    sel.innerHTML = ativas.map(function (t) { return '<option value=\"' + h(t.id) + '\">' + h(t.nome) + '</option>'; }).join('') +\n      (inativas.length ? '<optgroup label=\"Inativas\">' + inativas.map(function (t) { return '<option value=\"' + h(t.id) + '\">' + h(t.nome) + '</option>'; }).join('') + '</optgroup>' : '');\n    if (!turmaAtual()) {\n      var salva = ls.get('fe:turma');\n      var pref = [salva, C.turmaPilotoId].filter(function (id) { return C.turmas.some(function (t) { return t.id === id; }); })[0];\n      S.turmaId = pref || (ativas[0] || C.turmas[0]).id;\n    }\n    sel.value = S.turmaId;\n  }\n\n  function permitirSaida() {\n    if (!Ch || !Ch.alterado) return Promise.resolve(true);\n    if (navigator.onLine !== false && Ch.editavel) {\n      return salvarChamada({}).then(function () { return !Ch || !Ch.alterado; }).then(function (ok) {\n        if (ok) return true;\n        return confirmar('Marcações não salvas', 'Não foi possível salvar algumas marcações no servidor. Elas ficam guardadas temporariamente neste aparelho. Deseja sair mesmo assim?', 'Sair');\n      });\n    }\n    return confirmar('Marcações não salvas', 'Há marcações que ainda NÃO foram salvas no servidor. Elas ficam guardadas temporariamente neste aparelho e poderão ser recuperadas ao reabrir esta chamada. Deseja sair mesmo assim?', 'Sair');\n  }\n\n  function navegar(view, forcar) {\n    if (view === 'mais') { abrirMenuMais(); return; }\n    var alvo = VIEWS.filter(function (v) { return v.id === view; })[0] ? view : 'painel';\n    if (alvo === S.view && !forcar) return;\n    var sair = S.view === 'chamada' && alvo !== 'chamada' ? permitirSaida() : Promise.resolve(true);\n    sair.then(function (ok) {\n      if (!ok) return;\n      if (S.view === 'chamada' && alvo !== 'chamada') { pararChamada(); Ch = null; }\n      S.view = alvo;\n      $$('[data-nav]').forEach(function (b) { b.classList.toggle('ativo', b.getAttribute('data-nav') === alvo || (alvo === 'estudantes' || alvo === 'admin') && b.getAttribute('data-nav') === 'mais'); });\n      window.scrollTo(0, 0);\n      renderizarView();\n    });\n  }\n  function renderizarView() {\n    var fn = { painel: vPainel, chamada: vChamada, historico: vHistorico, relatorios: vRelatorios, estudantes: vEstudantes, admin: vAdmin }[S.view];\n    if (!S.turmaId && S.view !== 'admin') {\n      $('#conteudo').innerHTML = '<div class=\"aviso aviso-atencao\">' + ic('alerta') + '<div>Nenhuma turma disponível para o seu usuário. Solicite à equipe gestora a atribuição de uma turma.</div></div>';\n      return;\n    }\n    fn();\n  }\n  function abrirMenuMais() {\n    modal({ titulo: 'Mais opções', corpo: '<div class=\"grade\" style=\"gap:8px\">' + VIEWS.filter(function (v) { return v.gestao; }).map(function (v) {\n      return '<button class=\"btn btn-grande\" style=\"justify-content:flex-start\" data-ir=\"' + v.id + '\">' + ic(v.icone) + h(v.rotulo) + '</button>';\n    }).join('') + '</div>', aoAbrir: function (f, fechar) {\n      f.addEventListener('click', function (ev) { var b = ev.target.closest('[data-ir]'); if (b) { fechar(null); navegar(b.getAttribute('data-ir')); } });\n    } });\n  }\n  function atualizarContexto() {\n    return servidor('apiContexto', []).then(function (ctx) {\n      C.turmas = ctx.turmas; C.escola = ctx.escola; C.periodos = ctx.periodos; C.limite = ctx.limite; C.turmaPilotoId = ctx.turmaPilotoId;\n      $('#topo-escola').textContent = C.escola;\n      preencherSeletorTurma();\n    });\n  }\n  function cabecalho(titulo, sub, direita) {\n    return '<div class=\"cabecalho-pagina\"><div><h1>' + h(titulo) + '</h1>' + (sub ? '<div class=\"sub\">' + sub + '</div>' : '') + '</div>' +\n      (direita ? '<div class=\"linha-acoes\">' + direita + '</div>' : '') + '</div>';\n  }\n\n  // ================================================================== PAINEL\n  function vPainel() {\n    var t = turmaAtual();\n    var el = $('#conteudo');\n    el.innerHTML = carregandoHtml('Carregando painel...');\n    var turmaPedida = S.turmaId;\n    servidor('apiPainel', [S.turmaId]).then(function (d) {\n      if (S.view !== 'painel' || turmaPedida !== S.turmaId) return;\n      var T = d.totais;\n      var hoje = d.chamadaHoje[0];\n      var cta = hoje ? (hoje.status === 'FINALIZADA' ? 'Ver chamada de hoje' : 'Continuar chamada de hoje') : 'Fazer chamada';\n      var html = '<div class=\"card boas-vindas\"><div><div class=\"escola\">' + h(C.escola) + '</div>' +\n        '<div class=\"ola\">Olá, ' + h(C.usuario.nome) + '</div>' +\n        '<div class=\"info\">' + h(d.turma.nome) + ' · ' + h(dataExtenso(d.hoje)) + (hoje ? ' · Chamada de hoje: <strong>' + (hoje.status === 'FINALIZADA' ? 'finalizada' : 'em rascunho') + '</strong>' : '') + '</div></div>' +\n        '<button class=\"btn btn-grande\" data-nav=\"chamada\">' + ic('chamada') + h(cta) + '</button></div>';\n      if (d.rascunhos.length) {\n        html += '<div class=\"aviso aviso-atencao\" style=\"margin-top:14px\">' + ic('alerta') + '<div><strong>' + d.rascunhos.length + ' chamada(s) em rascunho</strong> (não entram nas estatísticas até serem finalizadas): ' +\n          d.rascunhos.slice(0, 6).map(function (r) { return '<button class=\"btn-link\" data-abrir-chamada=\"' + h(r.data) + '|' + h(r.periodo) + '\">' + dataBr(r.data) + (r.periodo !== 'DIARIO' ? ' (' + h(r.periodo) + ')' : '') + '</button>'; }).join(', ') + '</div></div>';\n      }\n      html += '<h2 class=\"secao\">Resumo da turma</h2><div class=\"grade grade-kpi\">' +\n        kpi('Estudantes cadastrados', d.estudantesAtivos, 'ativos na turma', '') +\n        kpi('Chamadas realizadas', d.chamadasRealizadas, 'finalizadas', '') +\n        kpi('Frequência geral', pct(T.frequencia), T.base ? T.comparecimentos + ' de ' + T.base + ' registros' : 'sem registros ainda', T.frequencia !== null && T.frequencia < d.limite ? 'vermelho' : 'verde') +\n        kpi('Ausências', T.A, 'faltas registradas', 'vermelho') +\n        kpi('Atrasos', T.T, 'registros de atraso', 'amarelo') +\n        kpi('Faltas justificadas', T.J, 'identificadas à parte', 'just') + '</div>';\n      html += '<div class=\"grade grade-2\" style=\"margin-top:14px\">' +\n        '<div class=\"card card-corpo\"><div class=\"card-titulo\">' + ic('relatorios') + 'Frequência por dia (últimas chamadas)</div>' + graficoBarras(d.serie, d.limite) + '</div>' +\n        '<div class=\"card card-corpo\"><div class=\"card-titulo\">' + ic('painel') + 'Distribuição dos registros</div>' + graficoRosca(partesDistribuicao(T.P, T.T, T.A, T.J), pct(T.frequencia), 'frequência') + '</div></div>';\n      html += '<h2 class=\"secao\">ACOMPANHAMENTO DA FREQUÊNCIA</h2><div class=\"card card-corpo\">';\n      if (!T.base) {\n        html += vazioHtml('Os indicadores aparecerão após a primeira chamada finalizada.');\n      } else if (!d.alertas.length) {\n        html += '<div class=\"aviso aviso-ok\" style=\"margin:0\">' + ic('PRESENTE') + '<div>Nenhum estudante está abaixo de ' + h(d.limite) + '% de frequência.</div></div>';\n      } else {\n        html += '<p style=\"margin:0 0 8px;color:#475569\">' + d.alertas.length + ' estudante(s) com frequência inferior a <strong>' + h(d.limite) + '%</strong>:</p><ul class=\"lista-alerta\">' +\n          d.alertas.map(function (a) {\n            return '<li><span class=\"n\">' + h(a.numero) + '</span><div class=\"nome\"><button class=\"btn-link\" data-ficha=\"' + h(a.id) + '\">' + h(a.nome) + '</button>' +\n              '<div class=\"barra-pct\"><span style=\"width:' + Math.max(2, a.frequencia) + '%\"></span></div></div>' +\n              '<div style=\"text-align:right\"><span class=\"etiqueta et-alerta\">' + pct(a.frequencia) + '</span><div style=\"font-size:12px;color:#64748b;margin-top:3px\">' +\n              a.ausencias + ' aus. · ' + a.justificadas + ' just. · ' + a.atrasos + ' atr.</div></div></li>';\n          }).join('') + '</ul>';\n      }\n      html += '<p style=\"font-size:12px;color:#64748b;margin:12px 0 0\">' + ic('info').replace('class=\"ic\"', 'class=\"ic\" style=\"width:14px;height:14px;vertical-align:-2px\"') + ' ' + h(d.regras) + '</p></div>';\n      el.innerHTML = html;\n    }).catch(function (e) { if (S.view === 'painel') el.innerHTML = erroHtml(e, true); });\n  }\n  function kpi(rotulo, valor, det, cor) {\n    return '<div class=\"card kpi ' + (cor || '') + '\"><div class=\"rotulo\">' + h(rotulo) + '</div><div class=\"valor\">' + h(valor) + '</div><div class=\"det\">' + h(det) + '</div></div>';\n  }\n\n  // ================================================================== CHAMADA\n  function chaveLocal(turmaId, data, periodo) { return 'fe:pend:' + turmaId + '|' + data + '|' + periodo; }\n\n  function vChamada(dataInicial, periodoInicial) {\n    var hoje = hojeSP();\n    var t = turmaAtual();\n    var data = dataInicial || (Ch && Ch.turmaId === S.turmaId ? Ch.data : hoje);\n    if (data > hoje) data = hoje;\n    var periodos = C.periodos || ['DIARIO'];\n    var periodo = periodoInicial || (Ch && Ch.turmaId === S.turmaId ? Ch.periodo : periodos[0]);\n    var el = $('#conteudo');\n    el.innerHTML = cabecalho('Fazer chamada', h(t ? t.nome : '') + ' · Professor(a): ' + h(C.usuario.nome)) +\n      '<div class=\"card card-corpo\"><div class=\"chamada-topo\">' +\n      '<div class=\"campo\"><label for=\"ch-turma\">Turma</label><select id=\"ch-turma\">' + C.turmas.map(function (x) { return '<option value=\"' + h(x.id) + '\"' + (x.id === S.turmaId ? ' selected' : '') + '>' + h(x.nome) + '</option>'; }).join('') + '</select></div>' +\n      '<div class=\"campo\"><label for=\"ch-data\">Data</label><input type=\"date\" id=\"ch-data\" value=\"' + h(data) + '\" max=\"' + h(hoje) + '\"' + (t && t.dataInicio ? ' min=\"' + h(t.dataInicio) + '\"' : '') + '></div>' +\n      (periodos.length > 1 || (periodo && periodos.indexOf(periodo) < 0) ? '<div class=\"campo\"><label for=\"ch-periodo\">Aula / período</label><select id=\"ch-periodo\">' +\n        periodos.concat(periodos.indexOf(periodo) < 0 ? [periodo] : []).map(function (p) { return '<option value=\"' + h(p) + '\"' + (p === periodo ? ' selected' : '') + '>' + h(nomePeriodo(p)) + '</option>'; }).join('') + '</select></div>' : '') +\n      '<div class=\"campo\"><label>Professor(a)</label><input type=\"text\" value=\"' + h(C.usuario.nome) + '\" readonly tabindex=\"-1\"></div>' +\n      '</div><div class=\"faixa-status\" id=\"ch-faixa\"></div></div>' +\n      '<div id=\"ch-avisos\" style=\"margin-top:14px\"></div><div id=\"ch-corpo\">' + carregandoHtml('Carregando estudantes...') + '</div>';\n    carregarChamada(S.turmaId, data, periodo);\n  }\n\n  function carregarChamada(turmaId, data, periodo) {\n    pararChamada();\n    var pedido = turmaId + '|' + data + '|' + periodo;\n    S.pedidoChamada = pedido;\n    $('#ch-corpo').innerHTML = carregandoHtml('Carregando estudantes...');\n    $('#ch-avisos').innerHTML = '';\n    $('#ch-faixa').innerHTML = '';\n    servidor('apiCarregarChamada', [{ turmaId: turmaId, data: data, periodo: periodo }]).then(function (estado) {\n      if (S.view !== 'chamada' || S.pedidoChamada !== pedido) return;\n      iniciarEstadoChamada(estado);\n      renderChamada();\n      verificarPendenciaLocal();\n    }).catch(function (e) {\n      if (S.view !== 'chamada' || S.pedidoChamada !== pedido) return;\n      $('#ch-corpo').innerHTML = erroHtml(e, true);\n    });\n  }\n\n  function iniciarEstadoChamada(estado) {\n    Ch = {\n      turmaId: estado.turma.id, turmaNome: estado.turma.nome, data: estado.data, periodo: estado.periodo,\n      chamada: estado.chamada, versao: estado.chamada ? estado.chamada.versao : 0,\n      estudantes: estado.estudantes, permissoes: estado.permissoes,\n      sit: {}, obs: {}, servidorSit: {}, servidorObs: {},\n      seq: 0, alterado: false, salvando: null, salvarDepois: false, timer: null, status: 'inicial'\n    };\n    estado.estudantes.forEach(function (e) {\n      Ch.sit[e.id] = Ch.servidorSit[e.id] = e.situacao;\n      Ch.obs[e.id] = Ch.servidorObs[e.id] = e.observacao || '';\n    });\n    Ch.editavel = Ch.permissoes.editar && !(Ch.chamada && Ch.chamada.status === 'FINALIZADA');\n  }\n\n  function pararChamada() {\n    if (Ch && Ch.timer) { clearTimeout(Ch.timer); Ch.timer = null; }\n  }\n\n  function renderChamada() {\n    var c = Ch.chamada;\n    var statusTxt = !c ? '<span class=\"etiqueta et-NAO_REGISTRADO\">Nova chamada</span>' :\n      '<span class=\"etiqueta et-' + c.status + '\">' + (c.status === 'FINALIZADA' ? 'Finalizada' : 'Rascunho') + '</span>';\n    var info = c ? (c.status === 'FINALIZADA' ? 'Finalizada em ' + dataHoraBr(c.finalizadoEm) + ' por ' + h(c.finalizadoPor) : 'Última gravação: ' + dataHoraBr(c.atualizadoEm) + ' por ' + h(c.atualizadoPor)) : 'Ainda não salva no servidor.';\n    $('#ch-faixa').innerHTML = '<div class=\"linha-acoes\">' + statusTxt + '<span style=\"font-size:13px;color:#64748b\">' + info + '</span></div>' +\n      '<span style=\"font-size:13px;color:#475569;font-weight:600\">' + h(dataExtenso(Ch.data)) + '</span>';\n\n    var avisos = '';\n    var dow = diaSemana(Ch.data);\n    if (dow === 0 || dow === 6) avisos += '<div class=\"aviso aviso-atencao\">' + ic('alerta') + '<div>A data selecionada é ' + (dow === 0 ? 'domingo' : 'sábado') + '. Confirme se é um dia letivo antes de registrar.</div></div>';\n    if (!Ch.permissoes.editar) avisos += '<div class=\"aviso aviso-info\">' + ic('cadeado') + '<div>' + h(Ch.permissoes.motivo || 'Somente consulta.') + '</div></div>';\n    if (c && c.status === 'FINALIZADA') {\n      avisos += '<div class=\"aviso aviso-ok\">' + ic('finalizar') + '<div><strong>Chamada finalizada.</strong> Os registros estão salvos no servidor.' +\n        (Ch.permissoes.editar && Ch.permissoes.reabrir ? '<div class=\"acoes\"><button class=\"btn btn-sm\" data-acao=\"reabrir\">' + ic('abrir') + 'Reabrir para correção</button></div>' : '') + '</div></div>';\n    }\n    if (!Ch.estudantes.length) {\n      $('#ch-avisos').innerHTML = avisos;\n      $('#ch-corpo').innerHTML = '<div class=\"card\">' + vazioHtml('Não há estudantes matriculados nesta turma para a data selecionada.') + '</div>';\n      return;\n    }\n    $('#ch-avisos').innerHTML = avisos + '<div id=\"ch-restaurar\"></div>';\n    var dis = Ch.editavel ? '' : ' disabled';\n    var linhas = Ch.estudantes.map(function (e) {\n      return '<div class=\"lc-linha s-' + Ch.sit[e.id] + (e.inativo ? ' inativo' : '') + '\" data-est=\"' + h(e.id) + '\">' +\n        '<div class=\"lc-num\">' + h(e.numero) + '</div>' +\n        '<div class=\"lc-nome\"><button class=\"btn-link\" data-ficha=\"' + h(e.id) + '\">' + h(e.nome) + '</button>' +\n        '<span class=\"sit-texto\">' + h(ROT_LONGO[Ch.sit[e.id]]) + (e.inativo ? ' · não matriculado(a) atualmente' : '') + '</span></div>' +\n        '<div class=\"lc-botoes\">' + SIT.map(function (s) {\n          var sel = Ch.sit[e.id] === s;\n          return '<button class=\"bsit b-' + s + (sel ? ' sel' : '') + '\" data-sit=\"' + s + '\" aria-pressed=\"' + sel + '\" aria-label=\"' + h(ROT_LONGO[s] + ' — ' + e.nome) + '\"' + dis + '>' + ic(s) + '<span>' + ROT[s] + '</span></button>';\n        }).join('') + '</div>' +\n        '<div class=\"lc-obs' + (Ch.obs[e.id] ? ' tem' : '') + '\"><input type=\"text\" maxlength=\"200\" data-obs=\"' + h(e.id) + '\" placeholder=\"Observação (opcional) — ex.: atestado médico\" value=\"' + h(Ch.obs[e.id]) + '\"' + dis + '></div>' +\n        '</div>';\n    }).join('');\n    $('#ch-corpo').innerHTML =\n      (Ch.editavel ? '<div class=\"linha-acoes acoes-lista\">' +\n        '<button class=\"btn\" data-acao=\"todos-presentes\">' + ic('todos') + 'Marcar todos como presentes</button>' +\n        '<button class=\"btn btn-perigo\" data-acao=\"limpar\">' + ic('limpar') + 'Limpar seleção</button></div>' : '') +\n      '<div class=\"contadores\" id=\"ch-contadores\"></div>' +\n      '<div class=\"lista-chamada\" role=\"table\" aria-label=\"Lista de chamada\"><div class=\"lc-cabecalho\" role=\"row\"><span>Nº</span><span>Estudante</span><span>Presente</span><span>Ausente</span><span>Atrasado</span><span>Justificada</span></div>' + linhas + '</div>' +\n      (Ch.editavel ? '<div class=\"barra-acoes\">' +\n        '<span class=\"status-salvamento\" id=\"ch-status\" role=\"status\" aria-live=\"polite\"><span class=\"ponto\"></span><span class=\"txt\"></span></span><span class=\"espaco\"></span>' +\n        '<button class=\"btn btn-primario\" data-acao=\"salvar\">' + ic('salvar') + 'Salvar chamada</button>' +\n        '<button class=\"btn btn-sucesso\" data-acao=\"finalizar\">' + ic('finalizar') + 'Finalizar chamada</button></div>' : '');\n    atualizarContadores();\n    definirStatus(Ch.alterado ? 'pendente' : (c ? 'salvo-inicial' : 'inicial'));\n  }\n\n  function contagem() {\n    var r = { total: Ch.estudantes.length, PRESENTE: 0, AUSENTE: 0, ATRASADO: 0, JUSTIFICADA: 0, NAO_REGISTRADO: 0 };\n    Ch.estudantes.forEach(function (e) { r[Ch.sit[e.id]]++; });\n    return r;\n  }\n  function atualizarContadores() {\n    var el = $('#ch-contadores');\n    if (!el) return;\n    var k = contagem();\n    el.innerHTML = [['', 'Total', 'Total', k.total], ['c-P', 'Presentes', 'Pres.', k.PRESENTE], ['c-A', 'Ausentes', 'Aus.', k.AUSENTE], ['c-T', 'Atrasados', 'Atr.', k.ATRASADO],\n      ['c-J', 'Justificados', 'Just.', k.JUSTIFICADA], ['c-N' + (k.NAO_REGISTRADO ? ' pendente' : ''), 'Não registrados', 'Falta', k.NAO_REGISTRADO]]\n      .map(function (x) {\n        return '<div class=\"contador ' + x[0] + '\" title=\"' + x[1] + '\"><div class=\"v\">' + x[3] + '</div><div class=\"r\"><span class=\"longo\">' + x[1] + '</span><span class=\"curto\">' + x[2] + '</span></div></div>';\n      }).join('');\n  }\n  function atualizarLinha(id) {\n    var linha = $('.lc-linha[data-est=\"' + id + '\"]');\n    if (!linha) return;\n    var s = Ch.sit[id];\n    linha.className = 'lc-linha s-' + s + (linha.classList.contains('inativo') ? ' inativo' : '');\n    $$('.bsit', linha).forEach(function (b) {\n      var sel = b.getAttribute('data-sit') === s;\n      b.classList.toggle('sel', sel);\n      b.setAttribute('aria-pressed', sel);\n    });\n    var txt = $('.sit-texto', linha);\n    var est = Ch.estudantes.filter(function (e) { return e.id === id; })[0];\n    if (txt) txt.textContent = ROT_LONGO[s] + (est && est.inativo ? ' · não matriculado(a) atualmente' : '');\n    var obs = $('.lc-obs', linha);\n    if (obs) obs.classList.toggle('tem', !!Ch.obs[id]);\n  }\n\n  /** Estado de salvamento exibido ao professor. Nunca indica \"salvo\" sem confirmação do servidor. */\n  function definirStatus(tipo, extra) {\n    if (Ch) Ch.status = tipo;\n    var el = $('#ch-status');\n    if (!el) return;\n    var mapa = {\n      'inicial': ['', 'Nenhuma alteração'],\n      'salvo-inicial': ['salvo', 'Dados carregados do servidor'],\n      'pendente': ['pendente', 'Alterações ainda não salvas'],\n      'salvando': ['salvando', 'Salvando...'],\n      'tentando': ['salvando', 'Tentando novamente' + (extra ? ' (' + extra + ')' : '') + '...'],\n      'salvo': ['salvo', 'Salvo com sucesso' + (extra ? ' às ' + extra : '')],\n      'erro': ['erro', 'Erro ao salvar' + (extra ? ': ' + extra : '')],\n      'offline': ['offline', 'Sem conexão — guardado só neste aparelho']\n    };\n    var m = mapa[tipo] || mapa.inicial;\n    el.className = 'status-salvamento ' + m[0];\n    $('.txt', el).textContent = m[1];\n  }\n\n  function guardarLocal() {\n    // Guarda as marcações e também a \"base\" (o que o servidor tinha), para reaplicar depois\n    // somente o que foi alterado NESTE aparelho, sem apagar alterações de outras pessoas.\n    ls.set(chaveLocal(Ch.turmaId, Ch.data, Ch.periodo), {\n      sit: Ch.sit, obs: Ch.obs, baseSit: Ch.servidorSit, baseObs: Ch.servidorObs,\n      versao: Ch.versao, chamadaId: Ch.chamada ? Ch.chamada.id : '', quando: new Date().toISOString()\n    });\n  }\n  function limparLocal() { ls.del(chaveLocal(Ch.turmaId, Ch.data, Ch.periodo)); }\n\n  /** Se há marcações deste aparelho que não chegaram ao servidor, oferece restaurá-las. */\n  function verificarPendenciaLocal() {\n    var p = ls.get(chaveLocal(Ch.turmaId, Ch.data, Ch.periodo));\n    if (!p) return;\n    if (!Ch.editavel) { return; }\n    var alteradosLocal = alteracoesLocais(p);\n    var diferencas = Ch.estudantes.filter(function (e) {\n      return alteradosLocal[e.id] && (p.sit[e.id] !== Ch.servidorSit[e.id] || (p.obs[e.id] || '') !== (Ch.servidorObs[e.id] || ''));\n    }).length;\n    if (!diferencas) { limparLocal(); return; }\n    var quando = '';\n    try { quando = new Date(p.quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { quando = ''; }\n    var conflito = Number(p.versao) !== Number(Ch.versao);\n    $('#ch-restaurar').innerHTML = '<div class=\"aviso aviso-atencao\">' + ic('alerta') + '<div><strong>Há ' + diferencas + ' marcação(ões) feitas neste aparelho' + (quando ? ' (' + h(quando) + ')' : '') +\n      ' que NÃO foram salvas no servidor.</strong>' + (conflito ? ' Atenção: a chamada foi alterada no servidor depois disso; ao restaurar, as marcações deste aparelho substituirão as do servidor para esses estudantes.' : '') +\n      '<div class=\"acoes\"><button class=\"btn btn-sm btn-primario\" data-acao=\"restaurar\">Restaurar e salvar</button><button class=\"btn btn-sm\" data-acao=\"descartar\">Descartar</button></div></div></div>';\n  }\n\n  /** Estudantes cuja marcação local difere da base do servidor no momento em que foi feita. */\n  function alteracoesLocais(p) {\n    var r = {};\n    Object.keys(p.sit || {}).forEach(function (id) {\n      var base = p.baseSit ? p.baseSit[id] : undefined;\n      var baseObs = p.baseObs ? (p.baseObs[id] || '') : '';\n      if (base === undefined || p.sit[id] !== base || (p.obs[id] || '') !== baseObs) r[id] = true;\n    });\n    return r;\n  }\n  function marcarAlterado() {\n    Ch.seq++;\n    Ch.alterado = true;\n    guardarLocal();\n    atualizarContadores();\n    definirStatus(navigator.onLine === false ? 'offline' : 'pendente');\n    if (Ch.timer) clearTimeout(Ch.timer);\n    Ch.timer = setTimeout(function () { Ch.timer = null; salvarChamada({ auto: true }); }, 4000);\n  }\n\n  /**\n   * Envia a chamada ao servidor. Só uma gravação por vez; alterações feitas durante\n   * o envio disparam nova gravação ao término. O mesmo requestId é reutilizado nas\n   * novas tentativas automáticas (o servidor não duplica).\n   */\n  function salvarChamada(opts) {\n    opts = opts || {};\n    if (!Ch || !Ch.editavel) return Promise.resolve(false);\n    if (Ch.salvando) {\n      if (!opts.finalizar) { Ch.salvarDepois = true; return Ch.salvando; }\n      return Ch.salvando.then(function () { return salvarChamada(opts); });\n    }\n    if (Ch.timer) { clearTimeout(Ch.timer); Ch.timer = null; }\n    if (!Ch.alterado && !opts.finalizar && !opts.forcar) { if (!opts.auto) definirStatus(Ch.chamada ? 'salvo' : 'inicial'); return Promise.resolve(true); }\n    if (navigator.onLine === false) { definirStatus('offline'); if (!opts.auto) toast('Sem conexão. As marcações estão guardadas neste aparelho e serão enviadas quando a internet voltar.', 'erro'); return Promise.resolve(false); }\n    var estado = Ch;\n    var seq = Ch.seq;\n    var payload = {\n      turmaId: Ch.turmaId, data: Ch.data, periodo: Ch.periodo, chamadaId: Ch.chamada ? Ch.chamada.id : '', versao: Ch.versao,\n      requestId: idReq(), finalizar: !!opts.finalizar,\n      registros: Ch.estudantes.map(function (e) { return { estudanteId: e.id, situacao: Ch.sit[e.id], observacao: Ch.obs[e.id] || '' }; })\n    };\n    definirStatus('salvando');\n    var botoes = $$('[data-acao=\"salvar\"],[data-acao=\"finalizar\"]');\n    if (opts.finalizar) botoes.forEach(function (b) { b.disabled = true; });\n    Ch.salvando = servidor('apiSalvarChamada', [payload], {\n      tentativas: 3, exigeConexao: true,\n      aoTentarNovamente: function (n, max) { if (Ch === estado) definirStatus('tentando', n + '/' + max); }\n    }).then(function (novo) {\n      if (Ch !== estado) return true;\n      aplicarRespostaServidor(novo, seq);\n      var hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });\n      if (opts.finalizar) {\n        toast('Chamada finalizada e salva com sucesso.', 'ok');\n        renderChamada();\n        definirStatus('salvo', hora);\n      } else {\n        definirStatus(Ch.alterado ? 'pendente' : 'salvo', hora);\n        if (!opts.auto) toast('Chamada salva com sucesso.', 'ok');\n        if (novo.chamada) renderFaixaSomente();\n      }\n      return true;\n    }).catch(function (e) {\n      if (Ch !== estado) return false;\n      tratarErroSalvar(e, opts);\n      return false;\n    }).then(function (r) {\n      if (Ch === estado) {\n        Ch.salvando = null;\n        botoes.forEach(function (b) { b.disabled = false; });\n        if (Ch.salvarDepois) { Ch.salvarDepois = false; if (Ch.alterado) salvarChamada({ auto: true }); }\n      }\n      return r;\n    });\n    return Ch.salvando;\n  }\n\n  function renderFaixaSomente() {\n    var c = Ch.chamada;\n    if (!c || !$('#ch-faixa')) return;\n    var span = $('#ch-faixa .linha-acoes');\n    if (span) span.innerHTML = '<span class=\"etiqueta et-' + c.status + '\">' + (c.status === 'FINALIZADA' ? 'Finalizada' : 'Rascunho') + '</span>' +\n      '<span style=\"font-size:13px;color:#64748b\">Última gravação: ' + dataHoraBr(c.atualizadoEm) + ' por ' + h(c.atualizadoPor) + '</span>';\n  }\n\n  /** Aplica a resposta confirmada do servidor, preservando alterações feitas durante o envio. */\n  function aplicarRespostaServidor(novo, seqEnviado) {\n    Ch.chamada = novo.chamada;\n    Ch.versao = novo.chamada ? novo.chamada.versao : 0;\n    Ch.permissoes = novo.permissoes;\n    var porId = {};\n    Ch.estudantes.forEach(function (e) { porId[e.id] = e; });\n    novo.estudantes.forEach(function (e) {\n      Ch.servidorSit[e.id] = e.situacao;\n      Ch.servidorObs[e.id] = e.observacao || '';\n      if (!porId[e.id]) { Ch.estudantes.push(e); Ch.sit[e.id] = e.situacao; Ch.obs[e.id] = e.observacao || ''; }\n    });\n    if (Ch.seq === seqEnviado) {\n      Ch.alterado = false;\n      limparLocal();\n    } else {\n      guardarLocal();\n    }\n    Ch.editavel = Ch.permissoes.editar && !(Ch.chamada && Ch.chamada.status === 'FINALIZADA');\n  }\n\n  function tratarErroSalvar(e, opts) {\n    if (e.rede) {\n      definirStatus(navigator.onLine === false ? 'offline' : 'erro', navigator.onLine === false ? '' : 'falha de comunicação');\n      if (!opts.auto) toast('Não foi possível salvar: ' + erroMsg(e) + ' As marcações continuam guardadas neste aparelho.', 'erro');\n      return;\n    }\n    if (e.codigo === 'CONFLITO' && e.dados) {\n      definirStatus('erro', 'conflito');\n      modal({\n        titulo: 'Chamada alterada por outra pessoa',\n        corpo: '<p style=\"margin-top:0\">' + h(e.erro) + '</p><p>O que deseja fazer?</p><ul><li><strong>Manter minhas marcações:</strong> suas marcações substituem as do servidor.</li><li><strong>Carregar versão do servidor:</strong> descarta as marcações feitas neste aparelho.</li></ul>',\n        semFecharFora: true,\n        acoes: [{ rotulo: 'Carregar versão do servidor', valor: 'servidor' }, { rotulo: 'Manter minhas marcações', classe: 'btn-primario', valor: 'manter' }]\n      }).then(function (op) {\n        if (op === 'manter') {\n          // Reaplica somente o que ESTE usuário alterou; o restante fica como a outra pessoa salvou.\n          var minhas = alteracoesLocais({ sit: Ch.sit, obs: Ch.obs, baseSit: Ch.servidorSit, baseObs: Ch.servidorObs });\n          var minhasSit = Ch.sit, minhasObs = Ch.obs;\n          iniciarEstadoChamada(e.dados);\n          if (!Ch.editavel) { renderChamada(); toast('A chamada foi finalizada por outra pessoa e não pode ser alterada sem reabertura.', 'erro'); return; }\n          Ch.estudantes.forEach(function (x) { if (minhas[x.id]) { Ch.sit[x.id] = minhasSit[x.id]; Ch.obs[x.id] = minhasObs[x.id] || ''; } });\n          renderChamada();\n          marcarAlterado();\n          salvarChamada({});\n        } else if (op === 'servidor') {\n          limparLocal();\n          iniciarEstadoChamada(e.dados);\n          renderChamada();\n        }\n      });\n      return;\n    }\n    if (e.codigo === 'FINALIZADA') {\n      definirStatus('erro', 'chamada já finalizada');\n      alertar('Chamada já finalizada', h(e.erro)).then(function () { carregarChamada(Ch.turmaId, Ch.data, Ch.periodo); });\n      return;\n    }\n    definirStatus('erro', '');\n    if (!opts.auto || e.codigo !== 'OCUPADO') toast(erroMsg(e), 'erro');\n  }\n\n  function finalizarChamada() {\n    var k = contagem();\n    if (k.NAO_REGISTRADO > 0) {\n      var faltam = Ch.estudantes.filter(function (e) { return Ch.sit[e.id] === 'NAO_REGISTRADO'; });\n      modal({\n        titulo: 'Ainda há estudantes sem registro',\n        corpo: '<p style=\"margin-top:0\">Para finalizar, todos os estudantes precisam ter uma situação registrada. Faltam <strong>' + faltam.length + '</strong>:</p><ul>' +\n          faltam.slice(0, 12).map(function (e) { return '<li>' + h(e.numero) + ' — ' + h(e.nome) + '</li>'; }).join('') + (faltam.length > 12 ? '<li>...</li>' : '') + '</ul>' +\n          '<p>Você pode salvar como rascunho e finalizar depois.</p>',\n        acoes: [{ rotulo: 'Voltar', valor: false }, { rotulo: 'Salvar como rascunho', classe: 'btn-primario', valor: 'rascunho' }]\n      }).then(function (v) {\n        if (v === 'rascunho') salvarChamada({ forcar: true });\n        var primeiro = faltam[0] && $('.lc-linha[data-est=\"' + faltam[0].id + '\"]');\n        if (primeiro && v !== 'rascunho') primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });\n      });\n      return;\n    }\n    confirmar('Finalizar chamada?',\n      '<strong>' + h(Ch.turmaNome) + ' — ' + dataBr(Ch.data) + (Ch.periodo !== 'DIARIO' ? ' (' + h(Ch.periodo) + ')' : '') + '</strong><br><br>' +\n      'Presentes: <strong>' + k.PRESENTE + '</strong> · Ausentes: <strong>' + k.AUSENTE + '</strong> · Atrasados: <strong>' + k.ATRASADO + '</strong> · Justificados: <strong>' + k.JUSTIFICADA + '</strong>' +\n      '<br><br>Depois de finalizada, alterações só poderão ser feitas por reabertura ou correção, com registro na auditoria.', 'Finalizar chamada', 'btn-sucesso')\n      .then(function (ok) { if (ok) salvarChamada({ finalizar: true }); });\n  }\n\n  function reabrirChamada() {\n    pedirTexto('Reabrir chamada para correção', 'Motivo da reabertura (obrigatório)', 'O motivo ficará registrado na auditoria.', 5, 'Reabrir').then(function (motivo) {\n      if (!motivo) return;\n      servidor('apiReabrirChamada', [{ chamadaId: Ch.chamada.id, versao: Ch.versao, motivo: motivo, requestId: idReq() }], { exigeConexao: true }).then(function (estado) {\n        iniciarEstadoChamada(estado);\n        renderChamada();\n        toast('Chamada reaberta para correção.', 'ok');\n      }).catch(function (e) { toast(erroMsg(e), 'erro'); if (e.codigo === 'CONFLITO') carregarChamada(Ch.turmaId, Ch.data, Ch.periodo); });\n    });\n  }\n\n  function trocarChamada(turmaId, data, periodo) {\n    if (S.pedidoChamada === turmaId + '|' + data + '|' + periodo) return; // já carregada/carregando\n    permitirSaida().then(function (ok) {\n      if (!ok) {\n        $('#ch-data').value = Ch.data;\n        if ($('#ch-turma')) $('#ch-turma').value = Ch.turmaId;\n        if ($('#ch-periodo')) $('#ch-periodo').value = Ch.periodo;\n        return;\n      }\n      if (turmaId !== S.turmaId) { S.turmaId = turmaId; ls.set('fe:turma', turmaId); $('#sel-turma-global').value = turmaId; vChamada(data, periodo); return; }\n      carregarChamada(turmaId, data, periodo);\n    });\n  }\n\n  // Eventos da tela de chamada\n  function eventoChamada(ev) {\n    if (!Ch) return false;\n    var b = ev.target.closest('.bsit');\n    if (b && !b.disabled) {\n      if (!Ch.editavel) return true;\n      var id = b.closest('.lc-linha').getAttribute('data-est');\n      var s = b.getAttribute('data-sit');\n      if (Ch.sit[id] !== s) {\n        Ch.sit[id] = s;\n        if (s !== 'JUSTIFICADA' && s !== 'ATRASADO') Ch.obs[id] = '';\n        atualizarLinha(id);\n        marcarAlterado();\n      }\n      return true;\n    }\n    var a = ev.target.closest('[data-acao]');\n    if (!a) return false;\n    var acao = a.getAttribute('data-acao');\n    if (acao === 'todos-presentes') {\n      var n = 0;\n      Ch.estudantes.forEach(function (e) { if (Ch.sit[e.id] === 'NAO_REGISTRADO') { Ch.sit[e.id] = 'PRESENTE'; atualizarLinha(e.id); n++; } });\n      if (n) { marcarAlterado(); toast(n + ' estudante(s) sem registro marcado(s) como presente(s). Ajuste as exceções.', 'ok'); }\n      else toast('Todos os estudantes já têm uma situação registrada.');\n      return true;\n    }\n    if (acao === 'limpar') {\n      confirmar('Limpar seleção?', 'Todas as marcações desta chamada voltarão para \"Não registrado\". Esta ação será salva no servidor como rascunho.', 'Limpar seleção', 'btn-perigo-cheio').then(function (ok) {\n        if (!ok) return;\n        Ch.estudantes.forEach(function (e) { Ch.sit[e.id] = 'NAO_REGISTRADO'; Ch.obs[e.id] = ''; atualizarLinha(e.id); });\n        $$('[data-obs]').forEach(function (i) { i.value = ''; });\n        marcarAlterado();\n      });\n      return true;\n    }\n    if (acao === 'salvar') { salvarChamada({ forcar: !Ch.chamada }); return true; }\n    if (acao === 'finalizar') { finalizarChamada(); return true; }\n    if (acao === 'reabrir') { reabrirChamada(); return true; }\n    if (acao === 'restaurar') {\n      var p = ls.get(chaveLocal(Ch.turmaId, Ch.data, Ch.periodo));\n      if (p) {\n        var alterados = alteracoesLocais(p);\n        Ch.estudantes.forEach(function (e) {\n          if (alterados[e.id] && p.sit[e.id]) { Ch.sit[e.id] = p.sit[e.id]; Ch.obs[e.id] = p.obs[e.id] || ''; }\n        });\n      }\n      renderChamada();\n      marcarAlterado();\n      salvarChamada({});\n      return true;\n    }\n    if (acao === 'descartar') {\n      confirmar('Descartar marcações?', 'As marcações guardadas neste aparelho serão descartadas. Os dados do servidor permanecem.', 'Descartar', 'btn-perigo-cheio').then(function (ok) {\n        if (ok) { limparLocal(); $('#ch-restaurar').innerHTML = ''; }\n      });\n      return true;\n    }\n    return false;\n  }\n\n  // ================================================================== HISTÓRICO\n  function opcoesEstudantes(turmaId, selecionado) {\n    return carregarEstudantesTurma(turmaId).then(function (lista) {\n      return '<option value=\"\">Todos</option>' + lista.map(function (e) {\n        return '<option value=\"' + h(e.id) + '\"' + (e.id === selecionado ? ' selected' : '') + '>' + h(e.numero) + ' — ' + h(e.nome) + (e.situacao !== 'ATIVO' ? ' (inativo)' : '') + '</option>';\n      }).join('');\n    });\n  }\n  function carregarEstudantesTurma(turmaId) {\n    if (S.estudantesCache[turmaId]) return Promise.resolve(S.estudantesCache[turmaId]);\n    return servidor('apiListarEstudantes', [turmaId, true]).then(function (l) { S.estudantesCache[turmaId] = l; return l; });\n  }\n\n  function vHistorico() {\n    var t = turmaAtual();\n    var hoje = hojeSP();\n    var f = S.filtroHist && S.filtroHist.turmaId === S.turmaId ? S.filtroHist : { turmaId: S.turmaId, inicio: somarDias(hoje, -30) < (t.dataInicio || '') ? t.dataInicio : somarDias(hoje, -30), fim: hoje, estudanteId: '', situacao: '', status: '', pagina: 1 };\n    S.filtroHist = f;\n    $('#conteudo').innerHTML = cabecalho('Histórico de frequência', h(t.nome) + ' · consulte chamadas e corrija registros') +\n      '<div class=\"card card-corpo\"><div class=\"filtros\">' +\n      '<div class=\"campo\"><label for=\"hf-ini\">De</label><input type=\"date\" id=\"hf-ini\" value=\"' + h(f.inicio) + '\"></div>' +\n      '<div class=\"campo\"><label for=\"hf-fim\">Até</label><input type=\"date\" id=\"hf-fim\" value=\"' + h(f.fim) + '\" max=\"' + h(hoje) + '\"></div>' +\n      '<div class=\"campo\"><label for=\"hf-est\">Estudante</label><select id=\"hf-est\"><option value=\"\">Carregando...</option></select></div>' +\n      '<div class=\"campo\"><label for=\"hf-sit\">Situação</label><select id=\"hf-sit\"><option value=\"\">Todas</option>' +\n      SIT.concat(['NAO_REGISTRADO']).map(function (s) { return '<option value=\"' + s + '\"' + (f.situacao === s ? ' selected' : '') + '>' + ROT_LONGO[s] + '</option>'; }).join('') + '</select></div>' +\n      '<div class=\"campo\"><label for=\"hf-status\">Status da chamada</label><select id=\"hf-status\"><option value=\"\">Todos</option><option value=\"FINALIZADA\"' + (f.status === 'FINALIZADA' ? ' selected' : '') + '>Finalizada</option><option value=\"RASCUNHO\"' + (f.status === 'RASCUNHO' ? ' selected' : '') + '>Rascunho</option></select></div>' +\n      '<div class=\"campo\"><button class=\"btn btn-primario\" data-acao=\"hist-buscar\">' + ic('vazio') + 'Consultar</button></div>' +\n      '</div></div><div id=\"hist-res\" style=\"margin-top:14px\"></div>';\n    opcoesEstudantes(S.turmaId, f.estudanteId).then(function (op) { if ($('#hf-est')) $('#hf-est').innerHTML = op; }).catch(function () { if ($('#hf-est')) $('#hf-est').innerHTML = '<option value=\"\">Todos</option>'; });\n    buscarHistorico();\n  }\n  function buscarHistorico() {\n    var f = S.filtroHist;\n    var el = $('#hist-res');\n    el.innerHTML = '<div class=\"card\">' + carregandoHtml('Consultando...') + '</div>';\n    servidor('apiListarHistorico', [f]).then(function (r) {\n      if (S.view !== 'historico' || !$('#hist-res')) return;\n      var html = '<div class=\"card\"><div class=\"tabela-wrap\">';\n      if (!r.itens.length) html += vazioHtml('Nenhum resultado para os filtros escolhidos.');\n      else if (r.modo === 'CHAMADAS') {\n        html += '<table class=\"tabela\"><thead><tr><th>Data</th><th>Período</th><th>Status</th><th class=\"num\">Pres.</th><th class=\"num\">Atr.</th><th class=\"num\">Aus.</th><th class=\"num\">Just.</th><th class=\"num\">Não reg.</th><th class=\"num\">Frequência</th><th>Responsável</th></tr></thead><tbody>' +\n          r.itens.map(function (c) {\n            return '<tr class=\"clicavel\" data-detalhe=\"' + h(c.id) + '\"><td><strong>' + dataBr(c.data) + '</strong></td><td>' + h(nomePeriodo(c.periodo)) + '</td>' +\n              '<td><span class=\"etiqueta et-' + c.status + '\">' + (c.status === 'FINALIZADA' ? 'Finalizada' : 'Rascunho') + '</span></td>' +\n              '<td class=\"num\">' + c.presentes + '</td><td class=\"num\">' + c.atrasados + '</td><td class=\"num\">' + c.ausentes + '</td><td class=\"num\">' + c.justificados + '</td><td class=\"num\">' + c.naoRegistrados + '</td>' +\n              '<td class=\"num ' + (c.frequencia !== null && c.frequencia < C.limite ? 'baixo' : '') + '\">' + pct(c.frequencia) + '</td><td>' + h(c.professorNome) + '</td></tr>';\n          }).join('') + '</tbody></table>';\n      } else {\n        html += '<table class=\"tabela\"><thead><tr><th>Data</th><th>Período</th><th>Nº</th><th>Estudante</th><th>Situação</th><th>Observação</th><th>Chamada</th></tr></thead><tbody>' +\n          r.itens.map(function (x) {\n            return '<tr class=\"clicavel\" data-detalhe=\"' + h(x.chamadaId) + '\"><td><strong>' + dataBr(x.data) + '</strong></td><td>' + h(nomePeriodo(x.periodo)) + '</td><td>' + h(x.numero) + '</td><td>' + h(x.nome) + '</td>' +\n              '<td><span class=\"etiqueta et-' + x.situacao + '\">' + ROT_LONGO[x.situacao] + '</span></td><td>' + h(x.observacao) + '</td>' +\n              '<td><span class=\"etiqueta et-' + x.statusChamada + '\">' + (x.statusChamada === 'FINALIZADA' ? 'Finalizada' : 'Rascunho') + '</span></td></tr>';\n          }).join('') + '</tbody></table>';\n      }\n      html += '</div>' + paginacaoHtml(r, 'hist') + '</div>';\n      el.innerHTML = html;\n    }).catch(function (e) { if ($('#hist-res')) el.innerHTML = erroHtml(e, false); });\n  }\n  function paginacaoHtml(r, prefixo) {\n    if (r.paginas <= 1) return '<div class=\"paginacao\">' + r.total + ' resultado(s)</div>';\n    return '<div class=\"paginacao\">' + r.total + ' resultado(s) · página ' + r.pagina + ' de ' + r.paginas +\n      '<button class=\"btn btn-sm\" data-pag=\"' + prefixo + '\" data-p=\"' + (r.pagina - 1) + '\"' + (r.pagina <= 1 ? ' disabled' : '') + '>Anterior</button>' +\n      '<button class=\"btn btn-sm\" data-pag=\"' + prefixo + '\" data-p=\"' + (r.pagina + 1) + '\"' + (r.pagina >= r.paginas ? ' disabled' : '') + '>Próxima</button></div>';\n  }\n\n  /** Detalhe de uma chamada (histórico): lista, correções, reabertura e auditoria. */\n  function abrirDetalheChamada(chamadaId) {\n    var fecharModal = null;\n    modal({ titulo: 'Detalhe da chamada', largo: true, corpo: '<div id=\"dc-corpo\">' + carregandoHtml() + '</div>', aoAbrir: function (f, fechar) {\n      fecharModal = fechar;\n      f.addEventListener('click', function (ev) {\n        var b = ev.target.closest('[data-dc]');\n        if (!b) return;\n        var acao = b.getAttribute('data-dc');\n        if (acao === 'corrigir') corrigirRegistro(S.detalhe, b.getAttribute('data-id'));\n        if (acao === 'abrir') { fechar(null); var d = S.detalhe; abrirNaChamada(d.turma.id, d.data, d.periodo); }\n        if (acao === 'ficha') abrirFicha(b.getAttribute('data-id'));\n      });\n    } });\n    carregarDetalhe(chamadaId);\n  }\n  function carregarDetalhe(chamadaId) {\n    servidor('apiDetalheChamada', [chamadaId]).then(function (d) {\n      S.detalhe = d;\n      var el = $('#dc-corpo');\n      if (!el) return;\n      var c = d.chamada;\n      var podeCorrigir = d.permissoes.editar && (c.status !== 'FINALIZADA' || d.permissoes.reabrir);\n      var html = '<div class=\"linha-acoes\" style=\"margin-bottom:12px\"><strong>' + h(d.turma.nome) + ' — ' + dataBr(d.data) + ' · ' + h(nomePeriodo(d.periodo)) + '</strong>' +\n        '<span class=\"etiqueta et-' + c.status + '\">' + (c.status === 'FINALIZADA' ? 'Finalizada' : 'Rascunho') + '</span></div>' +\n        '<p style=\"margin:0 0 12px;font-size:13px;color:#64748b\">Criada por ' + h(c.professorNome) + ' em ' + dataHoraBr(c.criadoEm) + ' · Última alteração ' + dataHoraBr(c.atualizadoEm) + ' por ' + h(c.atualizadoPor) +\n        (c.finalizadoEm ? ' · Finalizada em ' + dataHoraBr(c.finalizadoEm) : '') + '</p>' +\n        (!d.permissoes.editar ? '<div class=\"aviso aviso-info\">' + ic('cadeado') + '<div>' + h(d.permissoes.motivo) + '</div></div>' : '') +\n        '<div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr><th>Nº</th><th>Estudante</th><th>Situação</th><th>Observação</th>' + (podeCorrigir ? '<th></th>' : '') + '</tr></thead><tbody>' +\n        d.estudantes.map(function (e) {\n          return '<tr><td>' + h(e.numero) + '</td><td><button class=\"btn-link\" data-dc=\"ficha\" data-id=\"' + h(e.id) + '\">' + h(e.nome) + '</button></td>' +\n            '<td><span class=\"etiqueta et-' + e.situacao + '\">' + ROT_LONGO[e.situacao] + '</span></td><td>' + h(e.observacao) + '</td>' +\n            (podeCorrigir ? '<td style=\"text-align:right\"><button class=\"btn btn-sm\" data-dc=\"corrigir\" data-id=\"' + h(e.id) + '\">' + ic('editar') + 'Corrigir</button></td>' : '') + '</tr>';\n        }).join('') + '</tbody></table></div>' +\n        '<div class=\"linha-acoes\" style=\"margin-top:14px\"><button class=\"btn\" data-dc=\"abrir\">' + ic('chamada') + 'Abrir na tela de chamada</button></div>' +\n        '<h2 class=\"secao\">Registro de alterações (auditoria)</h2>' +\n        (d.auditoria && d.auditoria.length ? '<div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr><th>Data/hora</th><th>Usuário</th><th>Ação</th><th>Estudante</th><th>Anterior</th><th>Nova</th><th>Motivo</th></tr></thead><tbody>' +\n          d.auditoria.map(function (a) {\n            return '<tr><td>' + dataHoraBr(a.DATA_HORA) + '</td><td>' + h(a.USUARIO) + '</td><td>' + h(a.ACAO) + '</td><td>' + h(a.ESTUDANTE) + '</td><td>' + h(ROT_LONGO[a.VALOR_ANTERIOR] || a.VALOR_ANTERIOR) + '</td><td>' + h(ROT_LONGO[a.VALOR_NOVO] || a.VALOR_NOVO) + '</td><td>' + h(a.MOTIVO) + '</td></tr>';\n          }).join('') + '</tbody></table></div>' : '<p style=\"color:#64748b;font-size:14px\">Sem eventos de chamada registrados.</p>') +\n        '<p style=\"font-size:12px;color:#64748b\">As alterações individuais de situação aparecem na aba Auditoria (Administração).</p>';\n      el.innerHTML = html;\n    }).catch(function (e) { var el = $('#dc-corpo'); if (el) el.innerHTML = erroHtml(e, false); });\n  }\n  function corrigirRegistro(d, estudanteId) {\n    var e = d.estudantes.filter(function (x) { return x.id === estudanteId; })[0];\n    var finalizada = d.chamada.status === 'FINALIZADA';\n    var escolhida = e.situacao !== 'NAO_REGISTRADO' ? e.situacao : '';\n    modal({\n      titulo: 'Corrigir registro',\n      corpo: '<p style=\"margin-top:0\"><strong>' + h(e.numero) + ' — ' + h(e.nome) + '</strong><br><span style=\"color:#64748b;font-size:13px\">' + dataBr(d.data) + ' · ' + h(nomePeriodo(d.periodo)) +\n        ' · Situação atual: ' + ROT_LONGO[e.situacao] + '</span></p>' +\n        '<div class=\"lc-botoes\" style=\"display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px\">' + SIT.map(function (s) {\n          return '<button class=\"bsit b-' + s + (s === escolhida ? ' sel' : '') + '\" data-escolha=\"' + s + '\" style=\"min-height:52px\">' + ic(s) + ROT_LONGO[s] + '</button>';\n        }).join('') + '</div>' +\n        '<div class=\"campo\" style=\"margin-bottom:10px\"><label for=\"cr-obs\">Observação (opcional, para atraso ou justificada)</label><input type=\"text\" id=\"cr-obs\" maxlength=\"200\" value=\"' + h(e.observacao) + '\"></div>' +\n        '<div class=\"campo\"><label for=\"cr-mot\">Motivo da correção' + (finalizada ? ' (obrigatório)' : ' (opcional)') + '</label><textarea id=\"cr-mot\" maxlength=\"500\"></textarea><div class=\"ajuda\" id=\"cr-erro\" style=\"color:#b91c1c\"></div></div>',\n      aoAbrir: function (f) {\n        f.addEventListener('click', function (ev) {\n          var b = ev.target.closest('[data-escolha]');\n          if (!b) return;\n          escolhida = b.getAttribute('data-escolha');\n          $$('[data-escolha]', f).forEach(function (x) { x.classList.toggle('sel', x === b); });\n        });\n      },\n      acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: 'Salvar correção', classe: 'btn-primario', valor: true, validar: function (f) {\n        var mot = $('#cr-mot', f).value.trim();\n        if (!escolhida) { $('#cr-erro', f).textContent = 'Escolha a nova situação.'; return false; }\n        if (finalizada && mot.length < 5) { $('#cr-erro', f).textContent = 'Informe o motivo (mínimo de 5 caracteres).'; return false; }\n        S.correcao = { situacao: escolhida, motivo: mot, observacao: $('#cr-obs', f).value.trim() };\n        return true;\n      } }]\n    }).then(function (ok) {\n      if (!ok) return;\n      var p = { chamadaId: d.chamada.id, versao: d.chamada.versao, estudanteId: estudanteId, situacao: S.correcao.situacao, motivo: S.correcao.motivo, observacao: S.correcao.observacao, requestId: idReq() };\n      servidor('apiCorrigirRegistro', [p], { exigeConexao: true }).then(function () {\n        toast('Correção salva e registrada na auditoria.', 'ok');\n        carregarDetalhe(d.chamada.id);\n        if (S.view === 'historico') buscarHistorico();\n      }).catch(function (e2) { toast(erroMsg(e2), 'erro'); if (e2.codigo === 'CONFLITO') carregarDetalhe(d.chamada.id); });\n    });\n  }\n  function abrirNaChamada(turmaId, data, periodo) {\n    S.turmaId = turmaId;\n    $('#sel-turma-global').value = turmaId;\n    if (S.view === 'chamada') { trocarChamada(turmaId, data, periodo); return; }\n    S.view = 'chamada';\n    $$('[data-nav]').forEach(function (b) { b.classList.toggle('ativo', b.getAttribute('data-nav') === 'chamada'); });\n    window.scrollTo(0, 0);\n    vChamada(data, periodo);\n  }\n\n  // ================================================================== RELATÓRIOS\n  var TIPOS = [\n    ['DIARIA', 'Frequência diária'], ['SEMANAL', 'Frequência semanal'], ['MENSAL', 'Frequência mensal'],\n    ['INDIVIDUAL', 'Frequência individual'], ['GERAL', 'Frequência geral da turma'],\n    ['MAIS_FALTAS', 'Estudantes com maior número de faltas'], ['ABAIXO_LIMITE', 'Estudantes abaixo de 90% (limite configurado)']\n  ];\n  function vRelatorios() {\n    var t = turmaAtual();\n    var hoje = hojeSP();\n    var f = S.filtroRel && S.filtroRel.turmaId === S.turmaId ? S.filtroRel : { turmaId: S.turmaId, tipo: 'GERAL', inicio: t.dataInicio || hoje, fim: hoje, estudanteId: '', limiteLinhas: 10 };\n    if (f.inicio > hoje) f.inicio = hoje;\n    S.filtroRel = f;\n    $('#conteudo').innerHTML = cabecalho('Relatórios e estatísticas', h(t.nome) + ' · exportação em PDF (A4), Excel e CSV') +\n      '<div class=\"card card-corpo\"><div class=\"filtros\">' +\n      '<div class=\"campo\" style=\"grid-column:span 2\"><label for=\"rf-tipo\">Relatório</label><select id=\"rf-tipo\">' + TIPOS.map(function (x) {\n        return '<option value=\"' + x[0] + '\"' + (f.tipo === x[0] ? ' selected' : '') + '>' + h(x[0] === 'ABAIXO_LIMITE' ? 'Estudantes abaixo de ' + C.limite + '% de frequência' : x[1]) + '</option>';\n      }).join('') + '</select></div>' +\n      '<div class=\"campo\"><label for=\"rf-ini\">De</label><input type=\"date\" id=\"rf-ini\" value=\"' + h(f.inicio) + '\"></div>' +\n      '<div class=\"campo\"><label for=\"rf-fim\">Até</label><input type=\"date\" id=\"rf-fim\" value=\"' + h(f.fim) + '\"></div>' +\n      '<div class=\"campo\" id=\"rf-est-campo\"' + (f.tipo === 'INDIVIDUAL' ? '' : ' hidden') + '><label for=\"rf-est\">Estudante</label><select id=\"rf-est\"><option value=\"\">Carregando...</option></select></div>' +\n      '<div class=\"campo\" id=\"rf-qtd-campo\"' + (f.tipo === 'MAIS_FALTAS' ? '' : ' hidden') + '><label for=\"rf-qtd\">Quantidade</label><input type=\"number\" id=\"rf-qtd\" min=\"1\" max=\"200\" value=\"' + h(f.limiteLinhas) + '\"></div>' +\n      '</div><div class=\"linha-acoes\" style=\"margin-top:12px\">' +\n      '<button class=\"btn btn-sm\" data-periodo=\"hoje\">Hoje</button><button class=\"btn btn-sm\" data-periodo=\"semana\">Esta semana</button>' +\n      '<button class=\"btn btn-sm\" data-periodo=\"mes\">Este mês</button><button class=\"btn btn-sm\" data-periodo=\"mesant\">Mês anterior</button>' +\n      '<button class=\"btn btn-sm\" data-periodo=\"inicio\">Desde o início</button><span style=\"flex:1\"></span>' +\n      '<button class=\"btn btn-primario\" data-acao=\"rel-gerar\">' + ic('relatorios') + 'Gerar relatório</button></div></div>' +\n      '<div id=\"rel-res\" style=\"margin-top:14px\"></div>';\n    opcoesEstudantes(S.turmaId, f.estudanteId).then(function (op) {\n      if ($('#rf-est')) $('#rf-est').innerHTML = op.replace('<option value=\"\">Todos</option>', '<option value=\"\">Selecione...</option>');\n    }).catch(function () { /* exibido ao gerar */ });\n  }\n  function lerFiltroRel() {\n    var f = S.filtroRel;\n    f.tipo = $('#rf-tipo').value; f.inicio = $('#rf-ini').value; f.fim = $('#rf-fim').value;\n    f.estudanteId = $('#rf-est') ? $('#rf-est').value : ''; f.limiteLinhas = Number($('#rf-qtd').value) || 10;\n    return f;\n  }\n  function gerarRelatorio() {\n    var f = lerFiltroRel();\n    if (f.tipo === 'INDIVIDUAL' && !f.estudanteId) { toast('Selecione o estudante.', 'erro'); return; }\n    var el = $('#rel-res');\n    el.innerHTML = '<div class=\"card\">' + carregandoHtml('Gerando relatório...') + '</div>';\n    servidor('apiRelatorio', [f]).then(function (rel) {\n      if (S.view !== 'relatorios') return;\n      S.relatorio = rel;\n      var html = '<div class=\"card card-corpo\"><div class=\"faixa-status\" style=\"margin-bottom:10px\"><div><div style=\"font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em\">' + h(rel.meta.escola) + '</div>' +\n        '<div style=\"font-size:19px;font-weight:800\">' + h(rel.titulo) + '</div>' +\n        '<div style=\"font-size:13px;color:#475569\">Turma: <strong>' + h(rel.meta.turma) + '</strong> · Período: <strong>' + h(rel.meta.periodo) + '</strong> · Professor(a): ' + h(rel.meta.professor) + ' · Emitido em ' + h(rel.meta.emissao) + '</div></div>' +\n        '<div class=\"linha-acoes no-print\"><button class=\"btn\" data-exportar=\"PDF\">' + ic('baixar') + 'PDF</button><button class=\"btn\" data-exportar=\"XLSX\">' + ic('baixar') + 'Excel</button><button class=\"btn\" data-exportar=\"CSV\">' + ic('baixar') + 'CSV</button></div></div>';\n      if (rel.aviso) html += '<div class=\"aviso aviso-atencao\">' + ic('alerta') + '<div>' + h(rel.aviso) + '</div></div>';\n      if (rel.resumo.length) html += '<div class=\"mini-kpis\">' + rel.resumo.map(function (r) { return '<div class=\"card kpi\"><div class=\"rotulo\">' + h(r.rotulo) + '</div><div class=\"valor\">' + h(r.valor) + '</div></div>'; }).join('') + '</div>';\n      html += '<div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr>' + rel.colunas.map(function (c) { return '<th class=\"' + (c.tipo ? 'num' : '') + '\">' + h(c.rotulo) + '</th>'; }).join('') + '</tr></thead><tbody>' +\n        (rel.linhas.length ? rel.linhas.map(function (l) {\n          return '<tr>' + rel.colunas.map(function (c) {\n            var v = l[c.chave];\n            if (c.tipo === 'pct') return '<td class=\"num ' + (v !== null && v < C.limite ? 'baixo' : '') + '\">' + pct(v) + '</td>';\n            if (c.chave === 'nome' && l.id) return '<td><button class=\"btn-link\" data-ficha=\"' + h(l.id) + '\">' + h(v) + '</button>' + (l.ativo === false ? ' <span class=\"etiqueta et-INATIVO\">inativo</span>' : '') + '</td>';\n            if (c.chave === 'situacaoRotulo') return '<td><span class=\"etiqueta et-' + h(l.situacao) + '\">' + h(v) + '</span></td>';\n            return '<td class=\"' + (c.tipo ? 'num' : '') + '\">' + h(v) + '</td>';\n          }).join('') + '</tr>';\n        }).join('') : '<tr><td colspan=\"' + rel.colunas.length + '\">' + vazioHtml('Sem registros no período.') + '</td></tr>') + '</tbody></table></div>' +\n        '<p style=\"font-size:12px;color:#64748b;margin:12px 0 0\">' + h(rel.meta.regras) + '</p></div>';\n      el.innerHTML = html;\n    }).catch(function (e) { if ($('#rel-res')) el.innerHTML = erroHtml(e, false); });\n  }\n  function exportar(formato, params, botao) {\n    var txt = botao ? botao.innerHTML : '';\n    if (botao) { botao.disabled = true; botao.innerHTML = '<span class=\"spinner\" style=\"width:16px;height:16px;border-width:2px\"></span>Gerando...'; }\n    toast('Gerando arquivo ' + (formato === 'XLSX' ? 'Excel' : formato) + '... isso pode levar alguns segundos.');\n    var p = {}; for (var k in params) p[k] = params[k];\n    p.formato = formato;\n    servidor('apiExportarRelatorio', [p], { tentativas: 1 }).then(function (arq) {\n      baixarArquivo(arq);\n      toast('Arquivo gerado: ' + arq.nome, 'ok');\n    }).catch(function (e) { toast(erroMsg(e), 'erro'); }).then(function () {\n      if (botao) { botao.disabled = false; botao.innerHTML = txt; }\n    });\n  }\n\n  // ================================================================== FICHA INDIVIDUAL\n  function abrirFicha(estudanteId) {\n    var st = { estudanteId: estudanteId, inicio: '', fim: hojeSP() };\n    modal({ titulo: 'Ficha individual do estudante', largo: true, corpo: '<div id=\"fi-corpo\">' + carregandoHtml() + '</div>', aoAbrir: function (f) {\n      f.addEventListener('click', function (ev) {\n        var b = ev.target.closest('[data-fi]');\n        if (!b) return;\n        if (b.getAttribute('data-fi') === 'aplicar') { st.inicio = $('#fi-ini', f).value; st.fim = $('#fi-fim', f).value; carregar(); }\n        if (b.getAttribute('data-fi') === 'pdf' && S.ficha) {\n          exportar('PDF', { tipo: 'INDIVIDUAL', turmaId: S.ficha.estudante.turmaId, estudanteId: estudanteId, inicio: st.inicio || '', fim: st.fim }, b);\n        }\n      });\n    } });\n    function carregar() {\n      var el = $('#fi-corpo');\n      if (!el) return;\n      el.innerHTML = carregandoHtml();\n      servidor('apiFichaEstudante', [st]).then(function (d) {\n        S.ficha = d;\n        var el2 = $('#fi-corpo');\n        if (!el2) return;\n        var e = d.estudante, r = d.resumo;\n        var html = '<div class=\"ficha-cab\"><div class=\"lc-num\">' + h(e.numero) + '</div><div><div class=\"nome\">' + h(e.nome) + '</div>' +\n          '<div style=\"color:#64748b;font-size:13.5px\">Turma: ' + h(e.turmaNome) + ' · Nº de chamada: ' + h(e.numero) + ' · <span class=\"etiqueta et-' + h(e.situacao) + '\">' + h(e.situacao) + '</span>' +\n          (e.dataTransferencia ? ' · Transferido(a) em ' + dataBr(e.dataTransferencia) : '') + '</div></div></div>' +\n          '<div class=\"filtros\" style=\"margin-bottom:14px\"><div class=\"campo\"><label for=\"fi-ini\">De</label><input type=\"date\" id=\"fi-ini\" value=\"' + h(st.inicio) + '\"></div>' +\n          '<div class=\"campo\"><label for=\"fi-fim\">Até</label><input type=\"date\" id=\"fi-fim\" value=\"' + h(st.fim) + '\"></div>' +\n          '<div class=\"campo\"><button class=\"btn\" data-fi=\"aplicar\">Aplicar período</button></div><div class=\"campo\"><button class=\"btn\" data-fi=\"pdf\">' + ic('baixar') + 'PDF da ficha</button></div></div>' +\n          '<div class=\"mini-kpis\">' + kpi('Registros', r.registros, '', '') + kpi('Presenças', r.presencas, '', 'verde') + kpi('Ausências', r.ausencias, '', 'vermelho') +\n          kpi('Atrasos', r.atrasos, '', 'amarelo') + kpi('Justificadas', r.justificadas, '', 'just') +\n          kpi('Frequência', pct(r.frequencia), '', r.frequencia !== null && r.frequencia < d.limite ? 'vermelho' : 'verde') + '</div>' +\n          (r.frequencia !== null && r.frequencia < d.limite ? '<div class=\"aviso aviso-erro\">' + ic('alerta') + '<div>Frequência abaixo de ' + h(d.limite) + '%. Recomenda-se acompanhamento.</div></div>' : '') +\n          '<div class=\"grade grade-2\"><div class=\"card card-corpo\"><div class=\"card-titulo\">Frequência por mês</div>' +\n          graficoBarras(d.porMes.map(function (m) { return { data: '', rotulo: m.mes.slice(0, 3) + '/' + m.mes.slice(-2), frequencia: m.frequencia, presentes: m.P, ausentes: m.A, atrasados: m.T, justificados: m.J }; }), d.limite) +\n          '<div class=\"legenda\">' + d.porMes.map(function (m) { return '<span>' + h(m.mes) + ': <strong>' + pct(m.frequencia) + '</strong></span>'; }).join('') + '</div></div>' +\n          '<div class=\"card card-corpo\"><div class=\"card-titulo\">Distribuição</div>' + graficoRosca(partesDistribuicao(r.presencas, r.atrasos, r.ausencias, r.justificadas), pct(r.frequencia), 'frequência') + '</div></div>' +\n          '<h2 class=\"secao\">Histórico cronológico</h2>' +\n          (d.historico.length ? '<div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr><th>Data</th><th>Período</th><th>Situação</th><th>Observação</th><th>Turma</th></tr></thead><tbody>' +\n            d.historico.slice().reverse().map(function (x) {\n              return '<tr><td>' + h(x.dataBr) + '</td><td>' + h(x.periodo) + '</td><td><span class=\"etiqueta et-' + x.situacao + '\">' + h(x.situacaoRotulo) + '</span></td><td>' + h(x.observacao) + '</td><td>' + h(x.turma) + '</td></tr>';\n            }).join('') + '</tbody></table></div>' : vazioHtml('Sem registros em chamadas finalizadas no período.'));\n        el2.innerHTML = html;\n      }).catch(function (e) { var el3 = $('#fi-corpo'); if (el3) el3.innerHTML = erroHtml(e, false); });\n    }\n    carregar();\n  }\n\n  // ================================================================== ESTUDANTES (gestão)\n  function vEstudantes() {\n    var t = turmaAtual();\n    S.mostrarInativos = !!S.mostrarInativos;\n    $('#conteudo').innerHTML = cabecalho('Estudantes', h(t.nome) + ' · cadastro, edição, transferência e inativação',\n      '<label class=\"checks\"><label><input type=\"checkbox\" id=\"est-inativos\"' + (S.mostrarInativos ? ' checked' : '') + '> Mostrar inativos</label></label>' +\n      '<button class=\"btn btn-primario\" data-acao=\"est-novo\">' + ic('mais1') + 'Adicionar estudante</button>') +\n      '<div class=\"card\" id=\"est-lista\">' + carregandoHtml() + '</div>';\n    delete S.estudantesCache[S.turmaId];\n    servidor('apiListarEstudantes', [S.turmaId, true]).then(function (lista) {\n      S.estudantesCache[S.turmaId] = lista;\n      renderListaEstudantes();\n    }).catch(function (e) { $('#est-lista').innerHTML = erroHtml(e, true); });\n  }\n  function renderListaEstudantes() {\n    var lista = (S.estudantesCache[S.turmaId] || []).filter(function (e) { return S.mostrarInativos || e.situacao === 'ATIVO'; });\n    var el = $('#est-lista');\n    if (!el) return;\n    if (!lista.length) { el.innerHTML = vazioHtml('Nenhum estudante cadastrado.'); return; }\n    el.innerHTML = '<div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr><th>Nº</th><th>Nome</th><th>Situação</th><th>Entrada</th><th>Saída</th><th style=\"text-align:right\">Ações</th></tr></thead><tbody>' +\n      lista.map(function (e) {\n        var ativo = e.situacao === 'ATIVO';\n        return '<tr><td><strong>' + h(e.numero) + '</strong></td><td><button class=\"btn-link\" data-ficha=\"' + h(e.id) + '\">' + h(e.nome) + '</button>' + (e.observacao ? '<div style=\"font-size:12px;color:#64748b\">' + h(e.observacao) + '</div>' : '') + '</td>' +\n          '<td><span class=\"etiqueta et-' + h(e.situacao) + '\">' + h(ativo ? 'Ativo' : 'Inativo') + '</span></td><td>' + dataBr(e.dataEntrada) + '</td><td>' + dataBr(e.dataSaida) + '</td>' +\n          '<td style=\"text-align:right;white-space:nowrap\">' + (ativo ?\n            '<button class=\"btn btn-sm\" data-est-acao=\"editar\" data-id=\"' + h(e.id) + '\">' + ic('editar') + 'Editar</button> ' +\n            '<button class=\"btn btn-sm\" data-est-acao=\"transferir\" data-id=\"' + h(e.id) + '\">' + ic('transferir') + 'Transferir</button> ' +\n            '<button class=\"btn btn-sm btn-perigo\" data-est-acao=\"inativar\" data-id=\"' + h(e.id) + '\">Inativar</button>' :\n            '<button class=\"btn btn-sm\" data-est-acao=\"reativar\" data-id=\"' + h(e.id) + '\">Reativar</button>') + '</td></tr>';\n      }).join('') + '</tbody></table></div><div class=\"paginacao\">' + lista.length + ' estudante(s)</div>';\n  }\n  function formEstudante(e) {\n    var novo = !e;\n    var hoje = hojeSP();\n    var t = turmaAtual();\n    var dados = null;\n    return modal({\n      titulo: novo ? 'Adicionar estudante' : 'Editar estudante',\n      corpo: '<div class=\"grade\" style=\"gap:12px\">' +\n        '<div class=\"campo\"><label for=\"fe-nome\">Nome completo</label><input type=\"text\" id=\"fe-nome\" maxlength=\"150\" value=\"' + h(e ? e.nome : '') + '\" autofocus></div>' +\n        '<div class=\"form-grade\"><div class=\"campo\"><label for=\"fe-num\">Número de chamada</label><input type=\"number\" id=\"fe-num\" min=\"1\" max=\"999\" value=\"' + h(e ? e.numero : '') + '\" placeholder=\"' + (novo ? 'Automático' : '') + '\"></div>' +\n        (novo ? '<div class=\"campo\"><label for=\"fe-ent\">Data de entrada na turma</label><input type=\"date\" id=\"fe-ent\" value=\"' + h(hoje < (t.dataInicio || '') ? t.dataInicio : hoje) + '\"></div>' : '') + '</div>' +\n        '<div class=\"campo\"><label for=\"fe-obs\">Observação (opcional)</label><input type=\"text\" id=\"fe-obs\" maxlength=\"300\" value=\"' + h(e ? e.observacao : '') + '\"></div>' +\n        '<div class=\"ajuda\" id=\"fe-erro\" style=\"color:#b91c1c\"></div></div>',\n      acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: 'Salvar', classe: 'btn-primario', valor: true, validar: function (f) {\n        var nome = $('#fe-nome', f).value.trim();\n        if (nome.length < 3) { $('#fe-erro', f).textContent = 'Informe o nome completo.'; return false; }\n        dados = { id: e ? e.id : '', turmaId: S.turmaId, nome: nome, numero: $('#fe-num', f).value, observacao: $('#fe-obs', f).value, dataEntrada: $('#fe-ent', f) ? $('#fe-ent', f).value : '' };\n        if (!novo && !dados.numero) { $('#fe-erro', f).textContent = 'Informe o número de chamada.'; return false; }\n        return true;\n      } }]\n    }).then(function (ok) {\n      if (!ok) return;\n      enviarEstudante(dados);\n    });\n  }\n  function enviarEstudante(dados) {\n    servidor('apiSalvarEstudante', [dados], { exigeConexao: true }).then(function () {\n      toast('Estudante salvo.', 'ok');\n      atualizarContexto();\n      vEstudantes();\n    }).catch(function (err) {\n      if (err.codigo === 'HOMONIMO') {\n        confirmar('Possível cadastro duplicado', h(err.erro) + '<br><br>Deseja cadastrar mesmo assim?', 'Cadastrar mesmo assim').then(function (ok) {\n          if (ok) { dados.confirmarHomonimo = true; enviarEstudante(dados); }\n        });\n        return;\n      }\n      toast(erroMsg(err), 'erro');\n    });\n  }\n  function acaoEstudante(acao, id) {\n    var e = (S.estudantesCache[S.turmaId] || []).filter(function (x) { return x.id === id; })[0];\n    if (!e) return;\n    if (acao === 'editar') { formEstudante(e); return; }\n    if (acao === 'inativar') {\n      var motivo = '', data = hojeSP();\n      modal({ titulo: 'Inativar estudante', corpo: '<p style=\"margin-top:0\"><strong>' + h(e.numero) + ' — ' + h(e.nome) + '</strong></p><p style=\"color:#475569;font-size:14px\">O estudante deixa de aparecer nas próximas chamadas. Todo o histórico de frequência é preservado.</p>' +\n        '<div class=\"form-grade\"><div class=\"campo\"><label for=\"in-data\">Data de saída</label><input type=\"date\" id=\"in-data\" value=\"' + h(data) + '\"></div></div>' +\n        '<div class=\"campo\" style=\"margin-top:10px\"><label for=\"in-mot\">Motivo (obrigatório)</label><textarea id=\"in-mot\" maxlength=\"300\"></textarea><div class=\"ajuda\" id=\"in-erro\" style=\"color:#b91c1c\"></div></div>',\n        acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: 'Inativar', classe: 'btn-perigo-cheio', valor: true, validar: function (f) {\n          motivo = $('#in-mot', f).value.trim(); data = $('#in-data', f).value;\n          if (motivo.length < 3) { $('#in-erro', f).textContent = 'Informe o motivo.'; return false; }\n          return true;\n        } }] }).then(function (ok) {\n        if (!ok) return;\n        servidor('apiAlterarStatusEstudante', [id, false, motivo, data], { exigeConexao: true }).then(function () { toast('Estudante inativado. Histórico preservado.', 'ok'); vEstudantes(); }).catch(function (x) { toast(erroMsg(x), 'erro'); });\n      });\n      return;\n    }\n    if (acao === 'reativar') {\n      confirmar('Reativar estudante', 'Reativar <strong>' + h(e.nome) + '</strong>? Se o número ' + h(e.numero) + ' estiver ocupado, será atribuído o próximo número livre.', 'Reativar').then(function (ok) {\n        if (!ok) return;\n        servidor('apiAlterarStatusEstudante', [id, true, '', ''], { exigeConexao: true }).then(function () { toast('Estudante reativado.', 'ok'); vEstudantes(); }).catch(function (x) { toast(erroMsg(x), 'erro'); });\n      });\n      return;\n    }\n    if (acao === 'transferir') {\n      var destinos = C.turmas.filter(function (t) { return t.ativa && t.id !== S.turmaId; });\n      if (!destinos.length) { alertar('Transferência', 'Não há outra turma ativa cadastrada. Cadastre a turma de destino em Administração > Turmas.'); return; }\n      var par = {};\n      modal({ titulo: 'Transferir estudante', corpo: '<p style=\"margin-top:0\"><strong>' + h(e.numero) + ' — ' + h(e.nome) + '</strong></p>' +\n        '<div class=\"form-grade\"><div class=\"campo\"><label for=\"tr-turma\">Turma de destino</label><select id=\"tr-turma\">' + destinos.map(function (t) { return '<option value=\"' + h(t.id) + '\">' + h(t.nome) + '</option>'; }).join('') + '</select></div>' +\n        '<div class=\"campo\"><label for=\"tr-data\">Data da transferência</label><input type=\"date\" id=\"tr-data\" value=\"' + h(hojeSP()) + '\"></div></div>' +\n        '<div class=\"campo\" style=\"margin-top:10px\"><label for=\"tr-mot\">Motivo (opcional)</label><input type=\"text\" id=\"tr-mot\" maxlength=\"300\"></div>' +\n        '<p style=\"font-size:13px;color:#64748b\">Os registros de frequência anteriores permanecem vinculados à turma de origem.</p>',\n        acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: 'Transferir', classe: 'btn-primario', valor: true, validar: function (f) {\n          par = { turma: $('#tr-turma', f).value, data: $('#tr-data', f).value, motivo: $('#tr-mot', f).value }; return true;\n        } }] }).then(function (ok) {\n        if (!ok) return;\n        servidor('apiTransferirEstudante', [id, par.turma, par.data, par.motivo], { exigeConexao: true }).then(function () {\n          toast('Estudante transferido.', 'ok'); S.estudantesCache = {}; atualizarContexto(); vEstudantes();\n        }).catch(function (x) { toast(erroMsg(x), 'erro'); });\n      });\n    }\n  }\n\n  // ================================================================== ADMINISTRAÇÃO\n  function vAdmin() {\n    var abas = EH_ADMIN ? [['turmas', 'Turmas'], ['usuarios', 'Usuários'], ['config', 'Configurações'], ['backup', 'Backup e dados'], ['auditoria', 'Auditoria']]\n      : [['usuarios', 'Usuários'], ['auditoria', 'Auditoria']];\n    if (!S.abaAdmin || !abas.some(function (a) { return a[0] === S.abaAdmin; })) S.abaAdmin = abas[0][0];\n    $('#conteudo').innerHTML = cabecalho('Administração', EH_ADMIN ? 'Turmas, usuários, regras de cálculo, backup e auditoria' : 'Consulta de usuários e auditoria') +\n      '<div class=\"abas\">' + abas.map(function (a) { return '<button class=\"aba ' + (a[0] === S.abaAdmin ? 'ativa' : '') + '\" data-aba=\"' + a[0] + '\">' + h(a[1]) + '</button>'; }).join('') + '</div>' +\n      '<div id=\"admin-corpo\">' + carregandoHtml() + '</div>';\n    ({ turmas: aTurmas, usuarios: aUsuarios, config: aConfig, backup: aBackup, auditoria: aAuditoria })[S.abaAdmin]();\n  }\n  function aTurmas() {\n    servidor('apiListarTurmas', [true]).then(function (lista) {\n      S.listaTurmas = lista;\n      $('#admin-corpo').innerHTML = '<div class=\"linha-acoes\" style=\"margin-bottom:12px\"><button class=\"btn btn-primario\" data-adm=\"turma-nova\">' + ic('mais1') + 'Nova turma</button></div>' +\n        '<div class=\"card\"><div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr><th>Turma</th><th>Ano/série</th><th>Turno</th><th>Ano letivo</th><th>Início</th><th class=\"num\">Estudantes</th><th>Situação</th><th></th></tr></thead><tbody>' +\n        lista.map(function (t) {\n          return '<tr><td><strong>' + h(t.nome) + '</strong>' + (t.id === C.turmaPilotoId ? ' <span class=\"etiqueta et-ATIVO\">piloto</span>' : '') + '</td><td>' + h(t.anoSerie) + '</td><td>' + h(t.turno) + '</td><td>' + h(t.anoLetivo) + '</td><td>' + dataBr(t.dataInicio) + '</td><td class=\"num\">' + t.estudantesAtivos + '</td>' +\n            '<td><span class=\"etiqueta et-' + (t.ativa ? 'ATIVO' : 'INATIVO') + '\">' + (t.ativa ? 'Ativa' : 'Inativa') + '</span></td>' +\n            '<td style=\"text-align:right;white-space:nowrap\"><button class=\"btn btn-sm\" data-adm=\"turma-editar\" data-id=\"' + h(t.id) + '\">' + ic('editar') + 'Editar</button> ' +\n            '<button class=\"btn btn-sm ' + (t.ativa ? 'btn-perigo' : '') + '\" data-adm=\"turma-status\" data-id=\"' + h(t.id) + '\">' + (t.ativa ? 'Inativar' : 'Reativar') + '</button></td></tr>';\n        }).join('') + '</tbody></table></div></div>';\n    }).catch(function (e) { $('#admin-corpo').innerHTML = erroHtml(e, true); });\n  }\n  function formTurma(t) {\n    var dados = null;\n    modal({ titulo: t ? 'Editar turma' : 'Nova turma', corpo: '<div class=\"form-grade\">' +\n      '<div class=\"campo\"><label for=\"ft-nome\">Nome da turma</label><input type=\"text\" id=\"ft-nome\" maxlength=\"80\" value=\"' + h(t ? t.nome : '') + '\" autofocus></div>' +\n      '<div class=\"campo\"><label for=\"ft-serie\">Ano/série</label><input type=\"text\" id=\"ft-serie\" maxlength=\"40\" value=\"' + h(t ? t.anoSerie : '') + '\" placeholder=\"ex.: 5º ano\"></div>' +\n      '<div class=\"campo\"><label for=\"ft-turno\">Turno</label><select id=\"ft-turno\">' + ['', 'Matutino', 'Vespertino', 'Noturno', 'Integral'].map(function (x) { return '<option' + (t && t.turno === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +\n      '<div class=\"campo\"><label for=\"ft-ano\">Ano letivo</label><input type=\"text\" id=\"ft-ano\" maxlength=\"10\" value=\"' + h(t ? t.anoLetivo : hojeSP().slice(0, 4)) + '\"></div>' +\n      '<div class=\"campo\"><label for=\"ft-ini\">Data de início</label><input type=\"date\" id=\"ft-ini\" value=\"' + h(t ? t.dataInicio : hojeSP()) + '\"></div>' +\n      '</div><div class=\"ajuda\" id=\"ft-erro\" style=\"color:#b91c1c;margin-top:8px\"></div>',\n      acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: 'Salvar', classe: 'btn-primario', valor: true, validar: function (f) {\n        dados = { id: t ? t.id : '', nome: $('#ft-nome', f).value, anoSerie: $('#ft-serie', f).value, turno: $('#ft-turno', f).value, anoLetivo: $('#ft-ano', f).value, dataInicio: $('#ft-ini', f).value };\n        if (dados.nome.trim().length < 2 || !dados.dataInicio) { $('#ft-erro', f).textContent = 'Informe nome e data de início.'; return false; }\n        return true;\n      } }] }).then(function (ok) {\n      if (!ok) return;\n      servidor('apiSalvarTurma', [dados], { exigeConexao: true }).then(function () { toast('Turma salva.', 'ok'); atualizarContexto(); aTurmas(); }).catch(function (e) { toast(erroMsg(e), 'erro'); });\n    });\n  }\n  function aUsuarios() {\n    servidor('apiListarProfessores', []).then(function (lista) {\n      S.listaUsuarios = lista;\n      var nomes = {};\n      C.turmas.forEach(function (t) { nomes[t.id] = t.nome; });\n      $('#admin-corpo').innerHTML = (EH_ADMIN ? '<div class=\"linha-acoes\" style=\"margin-bottom:12px\"><button class=\"btn btn-primario\" data-adm=\"usuario-novo\">' + ic('mais1') + 'Cadastrar usuário</button></div>' : '') +\n        '<div class=\"aviso aviso-info\">' + ic('info') + '<div>O acesso é feito com a <strong>conta Google</strong> do e-mail cadastrado. Não há senhas no sistema. <strong>ADMIN</strong>: tudo · <strong>GESTOR</strong>: todas as turmas, correções e relatórios · <strong>PROFESSOR</strong>: somente as turmas atribuídas.</div></div>' +\n        '<div class=\"card\"><div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr><th>Nome</th><th>E-mail (conta Google)</th><th>Perfil</th><th>Turmas</th><th>Situação</th>' + (EH_ADMIN ? '<th></th>' : '') + '</tr></thead><tbody>' +\n        lista.map(function (u) {\n          var turmas = u.turmas.split(/[;,]/).filter(String).map(function (id) { return id === '*' ? 'Todas' : (nomes[id] || id); }).join(', ');\n          return '<tr><td><strong>' + h(u.nome) + '</strong></td><td>' + h(u.email) + '</td><td>' + h(u.perfil) + '</td><td>' + h(u.perfil === 'PROFESSOR' ? turmas : 'Todas') + '</td>' +\n            '<td><span class=\"etiqueta et-' + (u.ativo ? 'ATIVO' : 'INATIVO') + '\">' + (u.ativo ? 'Ativo' : 'Desativado') + '</span></td>' +\n            (EH_ADMIN ? '<td style=\"text-align:right;white-space:nowrap\"><button class=\"btn btn-sm\" data-adm=\"usuario-editar\" data-id=\"' + h(u.id) + '\">' + ic('editar') + 'Editar</button> ' +\n              '<button class=\"btn btn-sm ' + (u.ativo ? 'btn-perigo' : '') + '\" data-adm=\"usuario-status\" data-id=\"' + h(u.id) + '\">' + (u.ativo ? 'Desativar' : 'Reativar') + '</button></td>' : '') + '</tr>';\n        }).join('') + '</tbody></table></div></div>';\n    }).catch(function (e) { $('#admin-corpo').innerHTML = erroHtml(e, true); });\n  }\n  function formUsuario(u) {\n    var dados = null;\n    var selecionadas = u ? u.turmas.split(/[;,]/).filter(String) : [];\n    modal({ titulo: u ? 'Editar usuário' : 'Cadastrar usuário', corpo: '<div class=\"form-grade\">' +\n      '<div class=\"campo\"><label for=\"fu-nome\">Nome</label><input type=\"text\" id=\"fu-nome\" maxlength=\"150\" value=\"' + h(u ? u.nome : '') + '\" autofocus></div>' +\n      '<div class=\"campo\"><label for=\"fu-email\">E-mail da conta Google</label><input type=\"email\" id=\"fu-email\" maxlength=\"200\" value=\"' + h(u ? u.email : '') + '\"></div>' +\n      '<div class=\"campo\"><label for=\"fu-perfil\">Perfil</label><select id=\"fu-perfil\">' + ['PROFESSOR', 'GESTOR', 'ADMIN'].map(function (p) { return '<option' + (u && u.perfil === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div></div>' +\n      '<div class=\"campo\" style=\"margin-top:12px\"><label>Turmas do professor</label><div class=\"checks\">' + C.turmas.map(function (t) {\n        return '<label><input type=\"checkbox\" class=\"fu-turma\" value=\"' + h(t.id) + '\"' + (selecionadas.indexOf(t.id) >= 0 ? ' checked' : '') + '>' + h(t.nome) + '</label>';\n      }).join('') + '</div><div class=\"ajuda\">Gestores e administradores acessam todas as turmas.</div></div>' +\n      '<div class=\"ajuda\" id=\"fu-erro\" style=\"color:#b91c1c;margin-top:8px\"></div>',\n      acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: 'Salvar', classe: 'btn-primario', valor: true, validar: function (f) {\n        var perfil = $('#fu-perfil', f).value;\n        var turmas = $$('.fu-turma', f).filter(function (c) { return c.checked; }).map(function (c) { return c.value; });\n        dados = { id: u ? u.id : '', nome: $('#fu-nome', f).value, email: $('#fu-email', f).value, perfil: perfil, turmas: perfil === 'PROFESSOR' ? turmas : ['*'] };\n        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(dados.email.trim())) { $('#fu-erro', f).textContent = 'E-mail inválido.'; return false; }\n        if (perfil === 'PROFESSOR' && !turmas.length) { $('#fu-erro', f).textContent = 'Selecione ao menos uma turma.'; return false; }\n        return true;\n      } }] }).then(function (ok) {\n      if (!ok) return;\n      servidor('apiSalvarProfessor', [dados], { exigeConexao: true }).then(function () { toast('Usuário salvo.', 'ok'); aUsuarios(); }).catch(function (e) { toast(erroMsg(e), 'erro'); });\n    });\n  }\n  function aConfig() {\n    servidor('apiObterConfiguracoes', []).then(function (d) {\n      var v = {};\n      d.itens.forEach(function (i) { v[i.chave] = i; });\n      function sn(chave, rotulo) {\n        return '<div class=\"campo\"><label for=\"cf-' + chave + '\">' + h(rotulo) + '</label><select id=\"cf-' + chave + '\" data-cfg=\"' + chave + '\"><option value=\"SIM\"' + (v[chave] && v[chave].valor === 'SIM' ? ' selected' : '') + '>SIM</option><option value=\"NAO\"' + (v[chave] && v[chave].valor !== 'SIM' ? ' selected' : '') + '>NÃO</option></select><div class=\"ajuda\">' + h(v[chave] ? v[chave].descricao : '') + '</div></div>';\n      }\n      function tx(chave, rotulo, tipo) {\n        return '<div class=\"campo\"><label for=\"cf-' + chave + '\">' + h(rotulo) + '</label><input type=\"' + (tipo || 'text') + '\" id=\"cf-' + chave + '\" data-cfg=\"' + chave + '\" value=\"' + h(v[chave] ? v[chave].valor : '') + '\"><div class=\"ajuda\">' + h(v[chave] ? v[chave].descricao : '') + '</div></div>';\n      }\n      $('#admin-corpo').innerHTML = '<div class=\"card card-corpo\"><div class=\"card-titulo\">Identificação</div><div class=\"form-grade\">' + tx('NOME_ESCOLA', 'Nome da escola') + tx('ICONE_URL', 'Ícone (URL https, opcional)') + '</div>' +\n        '<div class=\"card-titulo\" style=\"margin-top:20px\">Regras de cálculo da frequência</div><div class=\"form-grade\">' + tx('LIMITE_FREQUENCIA', 'Limite mínimo de frequência (%)', 'number') +\n        sn('ATRASO_CONTA_COMPARECIMENTO', 'Atraso conta como comparecimento?') + sn('JUSTIFICADA_CONTA_COMPARECIMENTO', 'Falta justificada conta como comparecimento?') +\n        sn('JUSTIFICADA_EXCLUIR_DO_CALCULO', 'Excluir faltas justificadas da base de cálculo?') + sn('CONTAR_RASCUNHOS', 'Contar chamadas em rascunho nas estatísticas?') + '</div>' +\n        '<div class=\"card-titulo\" style=\"margin-top:20px\">Chamada e permissões</div><div class=\"form-grade\">' + tx('PERIODOS', 'Aulas/períodos (separados por ;)') +\n        tx('DIAS_EDICAO_PROFESSOR', 'Prazo de edição do professor (dias)', 'number') + sn('PROFESSOR_PODE_REABRIR', 'Professor pode reabrir chamadas?') + '</div>' +\n        (EH_ADMIN ? '<div class=\"linha-acoes\" style=\"margin-top:18px\"><button class=\"btn btn-primario\" data-adm=\"config-salvar\">' + ic('salvar') + 'Salvar configurações</button></div>' : '') +\n        '<p style=\"font-size:12px;color:#64748b\">Versão do sistema: ' + h(d.versao) + '. Todas as alterações ficam registradas na auditoria.</p></div>';\n    }).catch(function (e) { $('#admin-corpo').innerHTML = erroHtml(e, true); });\n  }\n  function aBackup() {\n    $('#admin-corpo').innerHTML = '<div class=\"grade grade-2\"><div class=\"card card-corpo\"><div class=\"card-titulo\">' + ic('salvar') + 'Backups da planilha</div><div id=\"bk-info\">' + carregandoHtml() + '</div></div>' +\n      '<div class=\"card card-corpo\"><div class=\"card-titulo\">' + ic('baixar') + 'Exportação e verificação</div>' +\n      '<p style=\"margin-top:0;color:#475569;font-size:14px\">Exporta uma cópia completa de todas as abas (configurações, usuários, turmas, estudantes, chamadas, frequências e auditoria) em Excel.</p>' +\n      '<div class=\"linha-acoes\"><button class=\"btn\" data-adm=\"exportar-dados\">' + ic('baixar') + 'Exportar todos os dados (.xlsx)</button><button class=\"btn\" data-adm=\"verificar\">' + ic('PRESENTE') + 'Verificar sistema</button></div>' +\n      '<div id=\"diag\" style=\"margin-top:12px\"></div></div></div>';\n    carregarBackups();\n  }\n  function carregarBackups() {\n    servidor('apiListarBackups', []).then(function (d) {\n      var el = $('#bk-info');\n      if (!el) return;\n      el.innerHTML = '<p style=\"margin-top:0;font-size:14px;color:#475569\">Backup diário automático: <strong>' + (d.backupDiarioAtivo ? 'ATIVO' : 'NÃO INSTALADO') + '</strong>' +\n        (d.backupDiarioAtivo ? '' : ' — execute <code>instalarBackupDiario</code> no editor do Apps Script.') + '<br>Último backup: <strong>' + h(d.ultimo ? dataHoraBr(d.ultimo.split(' | ')[0]) : 'nenhum') + '</strong></p>' +\n        '<div class=\"linha-acoes\" style=\"margin-bottom:12px\"><button class=\"btn btn-primario\" data-adm=\"backup-agora\">' + ic('salvar') + 'Fazer backup agora</button><a class=\"btn\" href=\"' + h(d.pastaUrl) + '\" target=\"_blank\" rel=\"noopener\">Abrir pasta de backups</a></div>' +\n        (d.backups.length ? '<div class=\"tabela-wrap\" style=\"max-height:300px;overflow:auto\"><table class=\"tabela\"><thead><tr><th>Backup</th><th>Criado em</th></tr></thead><tbody>' +\n          d.backups.map(function (b) { return '<tr><td><a href=\"' + h(b.url) + '\" target=\"_blank\" rel=\"noopener\">' + h(b.nome) + '</a></td><td>' + dataHoraBr(b.criadoEm) + '</td></tr>'; }).join('') + '</tbody></table></div>' : vazioHtml('Nenhum backup criado ainda.')) +\n        '<p style=\"font-size:12px;color:#64748b\">Backups nunca são apagados automaticamente. Para restaurar, veja o manual (README).</p>';\n    }).catch(function (e) { var el = $('#bk-info'); if (el) el.innerHTML = erroHtml(e, false); });\n  }\n  function aAuditoria() {\n    var hoje = hojeSP();\n    S.filtroAud = S.filtroAud || { inicio: somarDias(hoje, -30), fim: hoje, acao: '', turmaId: '', pagina: 1 };\n    var f = S.filtroAud;\n    var acoes = ['', 'CRIACAO_CHAMADA', 'FINALIZACAO_CHAMADA', 'REABERTURA_CHAMADA', 'ALTERACAO_SITUACAO', 'CORRECAO_REGISTRO', 'CADASTRO_ESTUDANTE', 'EDICAO_NOME_ESTUDANTE', 'EDICAO_NUMERO_ESTUDANTE',\n      'INATIVACAO_ESTUDANTE', 'REATIVACAO_ESTUDANTE', 'TRANSFERENCIA_ESTUDANTE', 'CRIACAO_TURMA', 'EDICAO_TURMA', 'INATIVACAO_TURMA', 'CADASTRO_USUARIO', 'EDICAO_USUARIO',\n      'DESATIVACAO_USUARIO', 'ALTERACAO_CONFIGURACAO', 'EXPORTACAO_RELATORIO', 'EXPORTACAO_DADOS', 'BACKUP', 'INSTALACAO'];\n    $('#admin-corpo').innerHTML = '<div class=\"card card-corpo\"><div class=\"filtros\">' +\n      '<div class=\"campo\"><label for=\"au-ini\">De</label><input type=\"date\" id=\"au-ini\" value=\"' + h(f.inicio) + '\"></div>' +\n      '<div class=\"campo\"><label for=\"au-fim\">Até</label><input type=\"date\" id=\"au-fim\" value=\"' + h(f.fim) + '\"></div>' +\n      '<div class=\"campo\"><label for=\"au-acao\">Ação</label><select id=\"au-acao\">' + acoes.map(function (a) { return '<option value=\"' + a + '\"' + (f.acao === a ? ' selected' : '') + '>' + (a || 'Todas') + '</option>'; }).join('') + '</select></div>' +\n      '<div class=\"campo\"><label for=\"au-turma\">Turma</label><select id=\"au-turma\"><option value=\"\">Todas</option>' + C.turmas.map(function (t) { return '<option value=\"' + h(t.id) + '\"' + (f.turmaId === t.id ? ' selected' : '') + '>' + h(t.nome) + '</option>'; }).join('') + '</select></div>' +\n      '<div class=\"campo\"><button class=\"btn btn-primario\" data-adm=\"aud-buscar\">Consultar</button></div></div></div><div class=\"card\" id=\"aud-res\" style=\"margin-top:14px\">' + carregandoHtml() + '</div>';\n    buscarAuditoria();\n  }\n  function buscarAuditoria() {\n    servidor('apiListarAuditoria', [S.filtroAud]).then(function (r) {\n      var el = $('#aud-res');\n      if (!el) return;\n      el.innerHTML = (r.itens.length ? '<div class=\"tabela-wrap\"><table class=\"tabela\"><thead><tr><th>Data/hora</th><th>Usuário</th><th>Ação</th><th>Turma</th><th>Estudante</th><th>Anterior</th><th>Novo</th><th>Motivo</th><th>Detalhes</th></tr></thead><tbody>' +\n        r.itens.map(function (a) {\n          return '<tr><td style=\"white-space:nowrap\">' + dataHoraBr(a.DATA_HORA) + '</td><td>' + h(a.USUARIO) + '</td><td><strong>' + h(a.ACAO) + '</strong></td><td>' + h(a.TURMA_NOME) + '</td><td>' + h(a.ESTUDANTE) + '</td>' +\n            '<td>' + h(ROT_LONGO[a.VALOR_ANTERIOR] || a.VALOR_ANTERIOR) + '</td><td>' + h(ROT_LONGO[a.VALOR_NOVO] || a.VALOR_NOVO) + '</td><td>' + h(a.MOTIVO) + '</td><td style=\"font-size:12.5px;color:#64748b;max-width:280px\">' + h(a.DETALHES) + '</td></tr>';\n        }).join('') + '</tbody></table></div>' : vazioHtml('Nenhum evento encontrado.')) + paginacaoHtml(r, 'aud');\n    }).catch(function (e) { var el = $('#aud-res'); if (el) el.innerHTML = erroHtml(e, false); });\n  }\n  function eventoAdmin(b) {\n    var acao = b.getAttribute('data-adm'), id = b.getAttribute('data-id');\n    if (acao === 'turma-nova') formTurma(null);\n    else if (acao === 'turma-editar') formTurma(S.listaTurmas.filter(function (t) { return t.id === id; })[0]);\n    else if (acao === 'turma-status') {\n      var t = S.listaTurmas.filter(function (x) { return x.id === id; })[0];\n      var acaoTxt = t.ativa ? 'Inativar' : 'Reativar';\n      confirmar(acaoTxt + ' turma', acaoTxt + ' a turma <strong>' + h(t.nome) + '</strong>? ' + (t.ativa ? 'A turma fica somente para consulta; nenhum dado é apagado.' : ''), acaoTxt, t.ativa ? 'btn-perigo-cheio' : 'btn-primario').then(function (ok) {\n        if (!ok) return;\n        servidor('apiAlterarStatusTurma', [id, !t.ativa, ''], { exigeConexao: true }).then(function () { toast('Turma atualizada.', 'ok'); atualizarContexto(); aTurmas(); }).catch(function (e) { toast(erroMsg(e), 'erro'); });\n      });\n    } else if (acao === 'usuario-novo') formUsuario(null);\n    else if (acao === 'usuario-editar') formUsuario(S.listaUsuarios.filter(function (u) { return u.id === id; })[0]);\n    else if (acao === 'usuario-status') {\n      var u = S.listaUsuarios.filter(function (x) { return x.id === id; })[0];\n      confirmar(u.ativo ? 'Desativar acesso' : 'Reativar acesso', (u.ativo ? 'Desativar' : 'Reativar') + ' o acesso de <strong>' + h(u.nome) + '</strong> (' + h(u.email) + ')?', u.ativo ? 'Desativar' : 'Reativar', u.ativo ? 'btn-perigo-cheio' : 'btn-primario').then(function (ok) {\n        if (!ok) return;\n        servidor('apiAlterarStatusProfessor', [id, !u.ativo], { exigeConexao: true }).then(function () { toast('Usuário atualizado.', 'ok'); aUsuarios(); }).catch(function (e) { toast(erroMsg(e), 'erro'); });\n      });\n    } else if (acao === 'config-salvar') {\n      var valores = {};\n      $$('[data-cfg]').forEach(function (i) { valores[i.getAttribute('data-cfg')] = i.value; });\n      b.disabled = true;\n      servidor('apiSalvarConfiguracoes', [valores], { exigeConexao: true }).then(function (r) {\n        toast(r.alteradas ? r.alteradas + ' configuração(ões) alterada(s).' : 'Nenhuma alteração.', 'ok');\n        return atualizarContexto();\n      }).catch(function (e) { toast(erroMsg(e), 'erro'); }).then(function () { b.disabled = false; });\n    } else if (acao === 'backup-agora') {\n      b.disabled = true;\n      toast('Criando backup...');\n      servidor('apiExecutarBackup', [], { tentativas: 0 }).then(function (r) { toast('Backup criado: ' + r.nome, 'ok'); carregarBackups(); })\n        .catch(function (e) { toast(erroMsg(e), 'erro'); }).then(function () { b.disabled = false; });\n    } else if (acao === 'exportar-dados') {\n      b.disabled = true;\n      toast('Gerando exportação completa...');\n      servidor('apiExportarDados', [], { tentativas: 0 }).then(function (arq) { baixarArquivo(arq); toast('Exportação concluída.', 'ok'); })\n        .catch(function (e) { toast(erroMsg(e), 'erro'); }).then(function () { b.disabled = false; });\n    } else if (acao === 'verificar') {\n      $('#diag').innerHTML = carregandoHtml('Verificando...');\n      servidor('apiVerificarSistema', []).then(function (d) {\n        $('#diag').innerHTML = '<div class=\"aviso ' + (d.ok ? 'aviso-ok' : 'aviso-atencao') + '\">' + ic(d.ok ? 'PRESENTE' : 'alerta') + '<div><strong>' + (d.ok ? 'Nenhuma inconsistência encontrada.' : 'Foram encontradas inconsistências.') + '</strong></div></div>' +\n          '<ul class=\"diag\">' + d.mensagens.map(function (m) { return '<li class=\"' + (m.ok ? 'okk' : 'nok') + '\">' + (m.ok ? '✔ ' : '✖ ') + h(m.texto) + '</li>'; }).join('') + '</ul>';\n      }).catch(function (e) { $('#diag').innerHTML = erroHtml(e, false); });\n    } else if (acao === 'aud-buscar') {\n      S.filtroAud = { inicio: $('#au-ini').value, fim: $('#au-fim').value, acao: $('#au-acao').value, turmaId: $('#au-turma').value, pagina: 1 };\n      $('#aud-res').innerHTML = carregandoHtml();\n      buscarAuditoria();\n    }\n  }\n\n  // ================================================================== Eventos globais\n  document.addEventListener('click', function (ev) {\n    var t = ev.target;\n    if (t.closest('.modal-fundo')) return; // modais tratam os próprios eventos\n    var nav = t.closest('[data-nav]');\n    if (nav) { navegar(nav.getAttribute('data-nav')); return; }\n    if (S.view === 'chamada' && eventoChamada(ev)) return;\n    var fi = t.closest('[data-ficha]');\n    if (fi) { abrirFicha(fi.getAttribute('data-ficha')); return; }\n    var ac = t.closest('[data-abrir-chamada]');\n    if (ac) { var p = ac.getAttribute('data-abrir-chamada').split('|'); abrirNaChamada(S.turmaId, p[0], p[1]); return; }\n    var det = t.closest('[data-detalhe]');\n    if (det) { abrirDetalheChamada(det.getAttribute('data-detalhe')); return; }\n    var pag = t.closest('[data-pag]');\n    if (pag && !pag.disabled) {\n      var n = Number(pag.getAttribute('data-p'));\n      if (pag.getAttribute('data-pag') === 'hist') { S.filtroHist.pagina = n; buscarHistorico(); }\n      else { S.filtroAud.pagina = n; $('#aud-res').innerHTML = carregandoHtml(); buscarAuditoria(); }\n      return;\n    }\n    var a = t.closest('[data-acao]');\n    if (a) {\n      var acao = a.getAttribute('data-acao');\n      if (acao === 'recarregar-view') { renderizarView(); return; }\n      if (acao === 'hist-buscar') {\n        S.filtroHist = { turmaId: S.turmaId, inicio: $('#hf-ini').value, fim: $('#hf-fim').value, estudanteId: $('#hf-est').value, situacao: $('#hf-sit').value, status: $('#hf-status').value, pagina: 1 };\n        buscarHistorico(); return;\n      }\n      if (acao === 'rel-gerar') { gerarRelatorio(); return; }\n      if (acao === 'est-novo') { formEstudante(null); return; }\n    }\n    var per = t.closest('[data-periodo]');\n    if (per) {\n      var hoje = hojeSP(), tipo = per.getAttribute('data-periodo'), ini = hoje, fim = hoje;\n      var turma = turmaAtual();\n      if (tipo === 'semana') { var d = diaSemana(hoje); ini = somarDias(hoje, d === 0 ? -6 : 1 - d); }\n      if (tipo === 'mes') ini = hoje.slice(0, 8) + '01';\n      if (tipo === 'mesant') { var u = somarDias(hoje.slice(0, 8) + '01', -1); ini = u.slice(0, 8) + '01'; fim = u; }\n      if (tipo === 'inicio') ini = turma.dataInicio || ini;\n      $('#rf-ini').value = ini; $('#rf-fim').value = fim;\n      return;\n    }\n    var ex = t.closest('[data-exportar]');\n    if (ex) { exportar(ex.getAttribute('data-exportar'), lerFiltroRel(), ex); return; }\n    var ea = t.closest('[data-est-acao]');\n    if (ea) { acaoEstudante(ea.getAttribute('data-est-acao'), ea.getAttribute('data-id')); return; }\n    var adm = t.closest('[data-adm]');\n    if (adm) { eventoAdmin(adm); return; }\n    var aba = t.closest('[data-aba]');\n    if (aba) { S.abaAdmin = aba.getAttribute('data-aba'); vAdmin(); }\n  });\n\n  document.addEventListener('change', function (ev) {\n    var t = ev.target;\n    if (t.id === 'sel-turma-global') {\n      var nova = t.value;\n      var antes = S.turmaId;\n      var trocar = function () { S.turmaId = nova; ls.set('fe:turma', nova); if (S.view === 'chamada') { Ch = null; vChamada(); } else renderizarView(); };\n      if (S.view === 'chamada') permitirSaida().then(function (ok) { if (ok) trocar(); else t.value = antes; });\n      else trocar();\n      return;\n    }\n    if (t.id === 'ch-turma' || t.id === 'ch-data' || t.id === 'ch-periodo') {\n      var data = $('#ch-data').value;\n      if (!data) { $('#ch-data').value = Ch ? Ch.data : hojeSP(); return; }\n      if (data > hojeSP()) { toast('Não é possível registrar chamada para data futura.', 'erro'); $('#ch-data').value = Ch ? Ch.data : hojeSP(); return; }\n      trocarChamada($('#ch-turma').value, data, $('#ch-periodo') ? $('#ch-periodo').value : (C.periodos || ['DIARIO'])[0]);\n      return;\n    }\n    if (t.id === 'rf-tipo') {\n      $('#rf-est-campo').hidden = t.value !== 'INDIVIDUAL';\n      $('#rf-qtd-campo').hidden = t.value !== 'MAIS_FALTAS';\n      return;\n    }\n    if (t.id === 'est-inativos') { S.mostrarInativos = t.checked; renderListaEstudantes(); }\n  });\n\n  // Observação da chamada (atraso/justificada)\n  document.addEventListener('input', function (ev) {\n    var t = ev.target;\n    if (!Ch || !t.hasAttribute('data-obs')) return;\n    var id = t.getAttribute('data-obs');\n    Ch.obs[id] = t.value.slice(0, 200);\n    marcarAlterado();\n  });\n\n  // Conexão: avisa o professor e reenvia ao voltar a internet.\n  function atualizarConexao() {\n    document.body.classList.toggle('offline', navigator.onLine === false);\n    if (navigator.onLine === false) { if (Ch && Ch.alterado) definirStatus('offline'); }\n    else if (Ch && Ch.alterado && S.view === 'chamada') { toast('Conexão restabelecida. Enviando marcações...'); salvarChamada({ auto: true }); }\n  }\n  window.addEventListener('online', atualizarConexao);\n  window.addEventListener('offline', atualizarConexao);\n  window.addEventListener('beforeunload', function (ev) {\n    if (Ch && Ch.alterado) { ev.preventDefault(); ev.returnValue = ''; return ''; }\n  });\n  document.addEventListener('visibilitychange', function () {\n    if (document.visibilityState === 'hidden' && Ch && Ch.alterado && navigator.onLine !== false) salvarChamada({ auto: true });\n  });\n\n  // ------------------------------------------------------------------ Início\n  montarNavegacao();\n  atualizarConexao();\n  navegar('painel', true);\n  window.__FE = { estado: function () { return { S: S, Ch: Ch }; } }; // diagnóstico\n})();\n</script>\n"
};
