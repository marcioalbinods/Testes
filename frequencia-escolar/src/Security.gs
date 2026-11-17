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
  }).sort(function (a, b) {
    // Ativas primeiro; depois por nome em ordem natural (5º A, 5º B, ..., 9º D).
    return (ehSim_(b.ATIVA) ? 1 : 0) - (ehSim_(a.ATIVA) ? 1 : 0) ||
      String(a.NOME).localeCompare(String(b.NOME), 'pt-BR', { numeric: true, sensitivity: 'base' });
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
