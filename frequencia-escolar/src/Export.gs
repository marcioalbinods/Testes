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
