export type CsvCell = string | number | boolean | null | undefined;

/**
 * Gera CSV (RFC 4180) usando ";" como separador, que é o padrão do Excel em português.
 * Começa com BOM UTF-8 para acentos aparecerem corretamente.
 * Células que começam com =, +, - ou @ recebem um apóstrofo (proteção contra fórmulas maliciosas).
 */
export function toCsv(rows: CsvCell[][], sep = ';'): string {
  const esc = (v: CsvCell): string => {
    if (v === null || v === undefined) return '';
    let s = typeof v === 'boolean' ? (v ? 'sim' : 'não') : String(v);
    if (/^[=+\-@\t\r]/.test(s) && typeof v === 'string') s = `'${s}`;
    return /[";\n\r,]/.test(s) || s.includes(sep) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + rows.map((r) => r.map(esc).join(sep)).join('\r\n') + '\r\n';
}

/** Leitor de CSV simples (usado nos testes para validar a exportação). */
export function parseCsv(text: string, sep = ';'): string[][] {
  const src = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
