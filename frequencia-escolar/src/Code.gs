/**
 * ============================================================================
 *  FREQUÊNCIA ESCOLAR — Controle de Frequência e Acompanhamento dos Estudantes
 *  Google Apps Script + Google Sheets
 * ============================================================================
 *
 *  Code.gs — Arquivo principal:
 *   - doGet(): entrada do Web App (com verificação de identidade e autorização).
 *   - setupSistema(): instalação idempotente (cria planilha, abas, turmas e estudantes).
 *   - verificarSistema(): diagnóstico da estrutura e da integridade dos dados.
 *   - executar_(): envelope padrão das funções da API (tratamento de erros).
 *   - Configurações e contexto do usuário.
 *
 *  Para instalar: veja README.md.
 */

/** OPCIONAL: preencha antes de executar setupSistema() (pode ser alterado depois no sistema). */
var NOME_ESCOLA_INICIAL = '';

var VERSAO_SISTEMA = '1.2.0';
/**
 * Turmas e estudantes iniciais.
 * Por privacidade, os nomes dos estudantes NÃO ficam neste código-fonte: o arquivo de
 * instalação gerado para a escola (ferramentas/gerar-pacote.js --dados) acrescenta no
 * final a variável DADOS_ESCOLA_ = { dataInicio, turno, anoLetivo, turmas: [{ nome, estudantes: [...] }] }.
 * Sem ela, o setupSistema cria só a estrutura e o administrador.
 */
function dadosIniciais_() {
  if (typeof DADOS_ESCOLA_ === 'undefined' || !DADOS_ESCOLA_ || !Array.isArray(DADOS_ESCOLA_.turmas)) {
    return { dataInicio: hoje_(), turno: '', anoLetivo: hoje_().slice(0, 4), turmas: [] };
  }
  var d = DADOS_ESCOLA_;
  var inicio = d.dataInicio ? validarData_(d.dataInicio, 'dataInicio') : hoje_();
  return { dataInicio: inicio, turno: d.turno || '', anoLetivo: String(d.anoLetivo || inicio.slice(0, 4)), turmas: d.turmas };
}

/**
 * A chamada abre com todos como Presente? Usa a configuração; se ela ainda não existir na
 * planilha (sistema instalado antes desta opção), usa o padrão do arquivo de instalação.
 */
function chamadaIniciaPresente_(cfg) {
  if (cfg.CHAMADA_INICIA_PRESENTE !== undefined && cfg.CHAMADA_INICIA_PRESENTE !== '') return ehSim_(cfg.CHAMADA_INICIA_PRESENTE);
  return typeof DADOS_ESCOLA_ !== 'undefined' && !!DADOS_ESCOLA_ && DADOS_ESCOLA_.chamadaIniciaPresente === true;
}

/** Lista de nomes em ordem alfabética (ignorando acentos), sem alterar a grafia. */
function ordenarNomes_(nomes) {
  return nomes.slice().sort(function (a, b) {
    var x = normalizarNome_(a), y = normalizarNome_(b);
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

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
  ['CHAMADA_INICIA_PRESENTE', 'NAO', 'SIM: a chamada abre com todos os estudantes marcados como Presente (só é gravada ao salvar/finalizar). NAO: todos começam como Não registrado.'],
  ['BACKUP_PASTA_ID', '', 'Pasta do Google Drive com os backups (preenchido automaticamente).'],
  ['ULTIMO_BACKUP', '', 'Data/hora e ID do último backup (preenchido automaticamente).'],
  ['ICONE_URL', '', 'Endereço público de imagem PNG (ícone do navegador). Opcional.'],
  ['VERSAO_ESTRUTURA', '1', 'Versão da estrutura do banco de dados.']
];

/** Chaves que o ADMIN pode alterar pela tela de Configurações. */
var CONFIG_EDITAVEIS = ['CHAMADA_INICIA_PRESENTE', 'NOME_ESCOLA', 'LIMITE_FREQUENCIA', 'ATRASO_CONTA_COMPARECIMENTO', 'JUSTIFICADA_CONTA_COMPARECIMENTO',
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
    periodos: periodosConfigurados_(cfg),
    limite: configNum_(cfg, 'LIMITE_FREQUENCIA', 90),
    diasEdicaoProfessor: configNum_(cfg, 'DIAS_EDICAO_PROFESSOR', 7),
    chamadaIniciaPresente: chamadaIniciaPresente_(cfg)
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
      } else if (['ATRASO_CONTA_COMPARECIMENTO', 'JUSTIFICADA_CONTA_COMPARECIMENTO', 'JUSTIFICADA_EXCLUIR_DO_CALCULO', 'CONTAR_RASCUNHOS', 'PROFESSOR_PODE_REABRIR', 'CHAMADA_INICIA_PRESENTE'].indexOf(k) >= 0) {
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
 * planilha, abas, configurações, administrador, turmas ou estudantes.
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
      var valor = c[0] === 'NOME_ESCOLA' ? (texto_(NOME_ESCOLA_INICIAL, 150) || 'NOME DA ESCOLA (configure em Administração)') :
        c[0] === 'CHAMADA_INICIA_PRESENTE' ? (chamadaIniciaPresente_({}) ? 'SIM' : 'NAO') : c[1];
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

    // 5-6. Turmas e estudantes iniciais (sem duplicar: turma por nome + ano letivo; estudante
    // por nome normalizado dentro da turma, inclusive inativos e transferidos).
    var ini = dadosIniciais_();
    var turmas = lerTabela_('TURMAS', { fresco: true });
    var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
    var novasTurmas = [], novosEst = [];
    if (!ini.turmas.length) info('Nenhuma turma inicial neste arquivo: cadastre as turmas em Administração > Turmas.');
    ini.turmas.forEach(function (def) {
      var nomeTurma = texto_(def.nome, 80);
      var turma = turmas.concat(novasTurmas).filter(function (t) {
        return normalizarNome_(t.NOME) === normalizarNome_(nomeTurma) && String(t.ANO_LETIVO) === ini.anoLetivo;
      })[0];
      if (!turma) {
        turma = { ID: gerarId_('TUR'), NOME: nomeTurma, ANO_SERIE: texto_(def.anoSerie || '', 40), TURNO: ini.turno, ANO_LETIVO: ini.anoLetivo,
          DATA_INICIO: ini.dataInicio, ATIVA: 'SIM', CRIADO_EM: agora_(), CRIADO_POR: email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: email };
        novasTurmas.push(turma);
      }
      var existentes = {};
      estudantes.concat(novosEst).forEach(function (e) {
        if (e.TURMA_ID === turma.ID || e.TURMA_ANTERIOR_ID === turma.ID) existentes[normalizarNome_(e.NOME)] = e;
      });
      var criados = 0;
      ordenarNomes_(def.estudantes || []).forEach(function (bruto) {
        var nome = texto_(bruto, 150);
        if (!nome || existentes[normalizarNome_(nome)]) return;
        var numero = proximoNumero_(estudantes.concat(novosEst), turma.ID);
        var e = { ID: gerarId_('EST'), TURMA_ID: turma.ID, NUMERO: numero, NOME: nome, SITUACAO: SITUACAO_ESTUDANTE.ATIVO,
          DATA_ENTRADA: turma.DATA_INICIO || ini.dataInicio, DATA_SAIDA: '', TURMA_ANTERIOR_ID: '', NUMERO_ANTERIOR: '', DATA_TRANSFERENCIA: '',
          OBSERVACAO: '', CRIADO_EM: agora_(), CRIADO_POR: email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: email };
        novosEst.push(e);
        existentes[normalizarNome_(nome)] = e;
        criados++;
      });
      info('Turma ' + nomeTurma + ': ' + (criados ? criados + ' estudante(s) cadastrado(s).' : 'estudantes já cadastrados (nenhuma duplicação).'));
    });
    inserirRegistros_('TURMAS', novasTurmas);
    inserirRegistros_('ESTUDANTES', novosEst);
    info(novasTurmas.length + ' turma(s) nova(s) e ' + novosEst.length + ' estudante(s) novo(s) cadastrados.');

    registrarAuditoria_([novaAuditoria_(email, { acao: 'INSTALACAO', entidade: 'SISTEMA', registroId: ss.getId(),
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

/** Diagnóstico completo: estrutura, duplicidades, referências e conferência das turmas iniciais. */
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

  // Confere cada turma inicial do arquivo de instalação: nomes idênticos e numeração 1..N em ordem alfabética.
  var ini = dadosIniciais_();
  ini.turmas.forEach(function (def) {
    var t = dados.TURMAS.filter(function (x) { return normalizarNome_(x.NOME) === normalizarNome_(def.nome) && String(x.ANO_LETIVO) === ini.anoLetivo; })[0];
    if (!t) { alerta('Turma ' + def.nome + ' não encontrada.'); return; }
    var daTurma = dados.ESTUDANTES.filter(function (e) { return e.TURMA_ID === t.ID || e.TURMA_ANTERIOR_ID === t.ID; });
    var porNome = {};
    daTurma.forEach(function (e) { porNome[e.NOME] = e; });
    var esperados = ordenarNomes_(def.estudantes.map(function (n) { return texto_(n, 150); }));
    var faltando = esperados.filter(function (n) { return !porNome[n]; });
    if (faltando.length) { alerta('Turma ' + def.nome + ': estudantes ausentes ou com nome diferente: ' + faltando.join(', ')); return; }
    var numeracaoOk = esperados.every(function (n, i) {
      var e = porNome[n];
      return Number(e.TURMA_ID === t.ID ? e.NUMERO : e.NUMERO_ANTERIOR) === i + 1;
    });
    var ativos = daTurma.filter(function (e) { return e.TURMA_ID === t.ID && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO; }).length;
    ok('Turma ' + t.NOME + ': ' + esperados.length + ' nomes conferidos' + (numeracaoOk ? ', numeração 1 a ' + esperados.length + ' em ordem alfabética' : ' (numeração alterada depois da instalação)') +
      ', ' + ativos + ' ativo(s), início ' + dataBr_(t.DATA_INICIO) + '.');
  });
  if (!dados.TURMAS.length) alerta('Nenhuma turma cadastrada.');

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
