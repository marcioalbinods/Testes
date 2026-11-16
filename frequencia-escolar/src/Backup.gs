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
