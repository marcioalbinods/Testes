/**
 * Simulação mínima dos serviços do Google Apps Script, para testar o Code.gs no Node.
 */
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import vm from 'node:vm';

export interface FakeSheet {
  rows: unknown[][];
}

export function loadAppsScript(teacherPassword = 'professor123') {
  const sheet: FakeSheet = { rows: [] };
  const props = new Map<string, string>();
  const cache = new Map<string, string>();
  let name = 'Página1';
  const sheetApi = {
    getLastRow: () => sheet.rows.length,
    appendRow: (r: unknown[]) => { sheet.rows.push([...r]); },
    setFrozenRows: () => {},
    setName: (n: string) => { name = n; },
    getName: () => name,
    getDataRange: () => ({ getValues: () => sheet.rows.map((r) => [...r]) }),
    getRange: (row: number, col: number, nr: number, nc: number) => ({
      setValues: (vals: unknown[][]) => {
        for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) sheet.rows[row - 1 + i][col - 1 + j] = vals[i][j];
      },
    }),
    deleteRow: (row: number) => { sheet.rows.splice(row - 1, 1); },
    getParent: () => spreadsheet,
  };
  const spreadsheet = {
    getId: () => 'planilha-teste',
    getUrl: () => 'https://docs.google.com/spreadsheets/d/planilha-teste',
    getSheetByName: (n: string) => (n === name ? sheetApi : null),
    getSheets: () => [sheetApi],
  };
  const ctx: Record<string, unknown> = {
    SpreadsheetApp: { create: () => spreadsheet, openById: () => spreadsheet },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k: string) => props.get(k) ?? null, setProperty: (k: string, v: string) => props.set(k, v) }) },
    CacheService: { getScriptCache: () => ({ get: (k: string) => cache.get(k) ?? null, put: (k: string, v: string) => cache.set(k, v), remove: (k: string) => cache.delete(k) }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_a: string, s: string) => [...createHash('sha256').update(s, 'utf8').digest()].map((b) => (b > 127 ? b - 256 : b)),
      getUuid: () => randomUUID(),
      formatDate: (d: Date) => d.toISOString().slice(0, 16).replace('T', ' '),
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s: string) => ({ setMimeType: () => ({ text: s }) }),
    },
    Logger: { log: () => {} },
    Math,
    JSON,
    Date,
  };
  vm.createContext(ctx);
  const src = readFileSync(resolve(__dirname, '../google-apps-script/Code.gs'), 'utf8').replace("var SENHA_DO_PROFESSOR = 'troque-esta-senha';", `var SENHA_DO_PROFESSOR = '${teacherPassword}';`);
  vm.runInContext(src, ctx);
  const post = (body: object) => {
    const out = (ctx.doPost as (e: unknown) => { text: string })({ postData: { contents: JSON.stringify({ app: 'academia-arduino', ...body }) } });
    return JSON.parse(out.text);
  };
  return { post, sheet, cache, ctx };
}
