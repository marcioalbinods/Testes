import { parseCsv, toCsv } from './csv';

describe('exportação CSV', () => {
  it('produz CSV válido com BOM, aspas, ponto e vírgula e quebras de linha', () => {
    const rows = [
      ['Nome', 'Comentário', 'Nota'],
      ['Ana; S.', 'Disse "olá"\nem duas linhas', 10],
      ['Bruno', '', null],
    ];
    const csv = toCsv(rows);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(parseCsv(csv)).toEqual([
      ['Nome', 'Comentário', 'Nota'],
      ['Ana; S.', 'Disse "olá"\nem duas linhas', '10'],
      ['Bruno', '', ''],
    ]);
  });
  it('neutraliza fórmulas (injeção de CSV)', () => {
    const parsed = parseCsv(toCsv([['=HYPERLINK("x")', '+1', '-2', '@SUM(A1)']]));
    expect(parsed[0].every((c) => c.startsWith("'"))).toBe(true);
  });
  it('converte booleanos para sim/não', () => {
    expect(parseCsv(toCsv([[true, false]]))[0]).toEqual(['sim', 'não']);
  });
});
