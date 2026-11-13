// Gravação de voz pela interface (microfone simulado do Chromium) e envio ao Storage.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import pg from 'pg';
import { seedProject } from './seed.mjs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
const APP = process.env.APP_URL || 'http://localhost:5173/';
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:54322/postgres' });
const s = await seedProject({ turma: '3C', done: 9, data: { monster: { born: true, name: 'Voz' } } });
await db.query("update public.class_settings set allow_recordings = true where turma = '3C'");
const b = await pw.chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const ctx = await b.newContext({ permissions: ['microphone'] });
const p = await ctx.newPage();
await p.goto(APP);
await p.click('[data-testid=have-project]');
await p.fill('[data-testid=code-input]', s.code);
await p.click('[data-testid=recover-submit]');
await p.click('[data-testid=play-next]');
await p.click('[data-testid=mission-start]');
await p.click('[data-testid=mode-voz]');
await p.fill('[data-testid=pres-text]', 'Olá, eu sou o Voz!');
await p.click('[data-testid=rec-start]');
await p.waitForTimeout(2500);
await p.click('[data-testid=rec-stop]');
await p.click('[data-testid=pres-done]');
let objs;
for (let i = 0; i < 40; i++) {
  objs = await db.query('select name, metadata from storage.objects where bucket_id = $1 and name like $2', ['gravacoes', `${s.id}/%`]);
  if (objs.rows.length) break;
  await p.waitForTimeout(300);
}
assert.ok(objs.rows.length === 1, 'gravação enviada ao Storage');
await p.waitForFunction(() => document.querySelector('[data-testid="save-status"]')?.getAttribute('data-status') === 'saved');
const row = (await db.query('select data from public.projects where id = $1', [s.id])).rows[0];
const rec = row.data.sounds.recordings[0];
assert.ok(rec.path && rec.path.startsWith(s.id + '/'), 'caminho salvo no projeto');
assert.equal(row.data.sounds.presentation.recordingId, rec.id);
await db.query("update public.class_settings set allow_recordings = false where turma = '3C'");
console.log('✔ Gravação de voz: gravada, enviada ao Storage privado e registrada no projeto (' + objs.rows[0].name + ')');
await b.close();
await db.end();
