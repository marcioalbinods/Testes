/**
 * TCA — Da Pesquisa à Intervenção
 * Receptor dos trabalhos enviados pelos grupos para o Google Drive do professor.
 *
 * O que ele faz a cada envio:
 *  - cria a pasta "TCA - Trabalhos dos alunos" no seu Drive (na primeira vez);
 *  - dentro dela, uma pasta por turma (8º A, 8º B, 8º C) e uma pasta por envio do grupo;
 *  - salva o PowerPoint, o guia em PDF e a cópia do trabalho (.json) nessa pasta;
 *  - acrescenta uma linha com todas as respostas na planilha "TCA - Respostas dos grupos".
 *
 * Como instalar: veja o arquivo LEIA-ME.md desta pasta.
 */

var ROOT_NAME = 'TCA - Trabalhos dos alunos';
var SHEET_NAME = 'TCA - Respostas dos grupos';
var APP_ID = 'tca-da-pesquisa-a-intervencao';
var TIMEZONE = 'America/Sao_Paulo';
var MAX_FILES = 5;
var MAX_FILE_BYTES = 15 * 1024 * 1024;

/** Rode esta função uma vez no editor para autorizar e criar a pasta e a planilha. */
function configurar() {
  var root = getRoot_();
  var sheet = getSheet_(root);
  Logger.log('Pasta: ' + root.getUrl());
  Logger.log('Planilha: ' + sheet.getParent().getUrl());
}

/** Abrir o endereço do app no navegador mostra se o receptor está funcionando. */
function doGet() {
  return json_({ ok: true, mensagem: 'Receptor do TCA funcionando.' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var p = JSON.parse(e.postData.contents);
    if (!p || p.app !== APP_ID || !p.campos) throw new Error('Envio inválido.');

    var root = getRoot_();
    var turma = getOrCreateFolder_(root, clean_(p.turma || 'Sem turma'));
    var stamp = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH-mm');
    var who = p.grupo || (p.integrantes || []).slice(0, 2).join(', ') || 'Grupo';
    var folder = turma.createFolder(clean_(who + ' - ' + (p.tema || 'TCA')).slice(0, 90) + ' - ' + stamp);

    (p.arquivos || []).slice(0, MAX_FILES).forEach(function (f) {
      var bytes = Utilities.base64Decode(f.data);
      if (bytes.length > MAX_FILE_BYTES) return;
      folder.createFile(Utilities.newBlob(bytes, f.mimeType || 'application/octet-stream', clean_(f.name || 'arquivo')));
    });

    var sheet = getSheet_(root);
    var row = { 'Enviado em': Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm'), 'Pasta no Drive': folder.getUrl() };
    Object.keys(p.campos).forEach(function (k) {
      row[k] = String(p.campos[k] == null ? '' : p.campos[k]).slice(0, 45000);
    });
    appendRow_(sheet, row);

    return json_({ ok: true, pasta: folder.getUrl() });
  } catch (err) {
    return json_({ ok: false, erro: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

// ---------------- auxiliares ----------------

function getRoot_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ROOT_ID');
  if (id) {
    try {
      return DriveApp.getFolderById(id);
    } catch (e) {
      /* pasta apagada: cria outra */
    }
  }
  var folder = DriveApp.createFolder(ROOT_NAME);
  props.setProperty('ROOT_ID', folder.getId());
  return folder;
}

function getSheet_(root) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = null;
  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (e) {
      ss = null;
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(root);
    props.setProperty('SHEET_ID', ss.getId());
  }
  return ss.getSheets()[0];
}

function getOrCreateFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/** Acrescenta a linha respeitando os títulos das colunas (cria colunas novas se precisar). */
function appendRow_(sheet, row) {
  var keys = Object.keys(row);
  var lastCol = sheet.getLastColumn();
  var header = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (!header.length) {
    header = keys;
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else {
    keys.forEach(function (k) {
      if (header.indexOf(k) === -1) {
        header.push(k);
        sheet.getRange(1, header.length).setValue(k).setFontWeight('bold');
      }
    });
  }
  sheet.appendRow(header.map(function (h) {
    return row[h] === undefined ? '' : row[h];
  }));
}

function clean_(s) {
  return String(s).replace(/[\\/:*?"<>|#\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim() || 'sem nome';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
