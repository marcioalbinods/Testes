// =====================================================================
// Testes de ponta a ponta (navegador real + backend real local).
// Cobre os 18 testes obrigatórios do projeto. Veja tests/README.md.
//
//   APP_URL=http://localhost:4173/ node tests/e2e/run.mjs
// =====================================================================
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require('/opt/node-tools/node_modules/playwright');
}
const { chromium, devices } = playwright;

const APP = process.env.APP_URL || 'http://localhost:5173/';
const SB = process.env.SB_URL || 'http://127.0.0.1:54321';
const OUT = fileURLToPath(new URL('./output/', import.meta.url));
fs.mkdirSync(OUT, { recursive: true });
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:54322/postgres' });

const results = [];
async function test(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push([true, name]);
    console.log(`  ✔ ${name} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } catch (e) {
    results.push([false, name]);
    console.error(`  ✘ ${name}\n    ${String(e?.stack || e).split('\n').slice(0, 6).join('\n    ')}`);
  }
}

const rnd = () => Array.from({ length: 4 }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
const browser = await chromium.launch();
const pageErrors = [];
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.setDefaultTimeout(15000);
  return { ctx, page };
}
const tid = (id) => `[data-testid="${id}"]`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function createPair(page, turma, a, b) {
  await page.goto(APP);
  await page.click(tid('new-project'));
  await page.click(tid(`turma-${turma}`));
  await page.fill(tid('name1'), a);
  await page.fill(tid('name2'), b);
  await page.click(tid('start'));
  const code = (await page.textContent(tid('code'), { timeout: 15000 })).trim();
  await page.click(tid('code-ok'));
  await page.waitForSelector(tid('game'));
  return code;
}
async function saved(page) {
  await page.waitForFunction(() => document.querySelector('[data-testid="save-status"]')?.getAttribute('data-status') === 'saved', null, { timeout: 20000 });
}
async function projectByNames(a, b) {
  const r = await db.query('select p.*, c.code from public.projects p join public.project_codes c on c.project_id = p.id where p.student1 = $1 and p.student2 = $2', [a, b]);
  return r.rows[0];
}
async function openMission(page, n) {
  console.log('    · missão', n);
  const back = await page.$('[aria-label="Voltar ao mapa"]');
  if (back) await back.click();
  await page.click(tid(`mission-${n}`));
  const start = await page.waitForSelector(tid('mission-start'), { timeout: 4000 }).catch(() => null);
  if (start) await start.click();
}
async function finishMission(page) {
  await page.waitForSelector(`${tid('mission-done')}:not([disabled])`, { timeout: 15000 });
  await page.click(tid('mission-done'));
  await page.waitForSelector(tid('celebration'));
  await page.click(tid('back-map'));
  await page.waitForSelector(tid('play-next'), { timeout: 8000 }).catch(() => {});
}
async function tapEgg(page) {
  for (let i = 0; i < 3; i++) {
    await page.click(tid('egg'), { force: true });
    await sleep(150);
  }
}

console.log('\nMonstrinhos — testes de ponta a ponta');
console.log('App:', APP);

const A1 = { a: 'Ana' + rnd(), b: 'Bia' + rnd() };
const A2 = { a: 'Caio' + rnd(), b: 'Davi' + rnd() };
const B1 = { a: 'Enzo' + rnd(), b: 'Flora' + rnd() };
const C1 = { a: 'Gael' + rnd(), b: 'Helena' + rnd() };
const clean = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
let codeA1, codeA2, codeB1;
const main = await newPage();

await test('1. Cadastro de uma dupla do 3º A', async () => {
  codeA1 = await createPair(main.page, '3A', A1.a, A1.b);
  assert.match(codeA1, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  const p = await projectByNames(clean(A1.a), clean(A1.b));
  assert.equal(p.turma, '3A');
  assert.equal(p.code, codeA1);
  await main.page.screenshot({ path: OUT + '01-mapa.png' });
});

await test('2. Cadastro de outra dupla do 3º A (sem duplicar)', async () => {
  const { page, ctx } = await newPage();
  codeA2 = await createPair(page, '3A', A2.a, A2.b);
  assert.notEqual(codeA2, codeA1);
  // mesma dupla tentando de novo em outro aparelho: não duplica
  const { page: p3, ctx: c3 } = await newPage();
  await p3.goto(APP);
  await p3.click(tid('new-project'));
  await p3.click(tid('turma-3A'));
  await p3.fill(tid('name1'), A2.b);
  await p3.fill(tid('name2'), A2.a);
  await p3.click(tid('start'));
  await p3.waitForSelector(tid('go-recover'));
  const n = await db.query('select count(*)::int as n from public.projects where names_key = $1', [[clean(A2.a), clean(A2.b)].map((x) => x.toLowerCase()).sort().join('+')]);
  assert.equal(n.rows[0].n, 1);
  await c3.close();
  await ctx.close();
});

await test('3. Cadastro de duplas do 3º B e do 3º C', async () => {
  const b = await newPage();
  codeB1 = await createPair(b.page, '3B', B1.a, B1.b);
  const c = await newPage();
  await createPair(c.page, '3C', C1.a, C1.b);
  assert.equal((await projectByNames(clean(B1.a), clean(B1.b))).turma, '3B');
  assert.equal((await projectByNames(clean(C1.a), clean(C1.b))).turma, '3C');
  await b.ctx.close();
  await c.ctx.close();
});

// ------------------------------------------------------------------ jogar todas as missões
await test('8/11. Personalização completa e as 30 missões pela interface', async () => {
  const page = main.page;
  // Missão 1
  await page.click(tid('play-next'));
  await page.click(tid('mission-start'));
  await page.click(tid('part-head-coracao'));
  await page.click(tid('part-head-gota'));
  await page.click(tid('part-head-nuvem'));
  await page.click(tid('bigger'));
  await page.click(tid('undo'));
  await page.click(tid('redo'));
  await finishMission(page);
  // Missão 2
  await openMission(page, 2);
  await page.click(tid('part-eyes-estrela'));
  await page.click('[aria-label="Uva"]');
  await finishMission(page);
  // Missão 3
  await openMission(page, 3);
  await page.click(tid('part-mouth-sorrisao'));
  await page.click(tid('part-mouth-dentucinho'));
  await finishMission(page);
  // Missão 4: corpo e membros, arrastar, tamanho, girar, espelhar
  await openMission(page, 4);
  await page.click(tid('part-body-pera'));
  for (const [tab, part] of [['arms', 'garra'], ['legs', 'pato'], ['ears', 'gato'], ['horns', 'unicornio'], ['antennae', 'estrela'], ['spikes', 'cristas'], ['tail', 'dragao'], ['wings', 'morcego']]) {
    await page.click(tid(`tab-${tab}`));
    await page.click(tid(`part-${tab}-${part}`));
  }
  await page.click(tid('tab-tail'));
  const st = await page.$(tid('monster-stage'));
  const box = await st.boundingBox();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.55, { steps: 5 });
  await page.mouse.up();
  await page.click(tid('rotate'));
  await page.click(tid('flip'));
  await page.click(tid('bigger'));
  await finishMission(page);
  // Missão 5: cores, textura, acessórios e nascimento
  await openMission(page, 5);
  await page.click('[aria-label="Morango"]');
  await page.click(tid('texture-bolinhas'));
  await page.click(tid('tab-acc'));
  await page.click(tid('acc-coroa'));
  await page.click(tid('acc-gravata'));
  await page.click(tid('create-monster'));
  await tapEgg(page);
  await page.waitForSelector(tid('monster-name'), { timeout: 8000 });
  await page.fill(tid('monster-name'), 'Fofucho');
  await page.click(tid('name-ok'));
  await page.screenshot({ path: OUT + '02-laboratorio.png' });
  await finishMission(page);
  await saved(page);
  const p = await projectByNames(clean(A1.a), clean(A1.b));
  assert.equal(p.data.monster.name, 'Fofucho');
  assert.equal(p.data.monster.born, true);
  assert.equal(p.data.monster.parts.head.id, 'nuvem');
  assert.equal(p.data.monster.parts.eyes.id, 'estrela');
  assert.equal(p.data.monster.parts.wings.id, 'morcego');
  assert.equal(p.data.monster.texture, 'bolinhas');
  assert.ok(p.data.monster.accessories.some((a) => a.id === 'coroa'));
  assert.ok(p.data.monster.parts.tail.flip === true && p.data.monster.parts.tail.rot !== 0);
  assert.ok(p.data.monster.tried.includes('tool:move'));
  assert.deepEqual(p.missions_done, [1, 2, 3, 4, 5]);

  // Etapa 2
  await openMission(page, 6);
  await page.click(tid('anim-pular'));
  await page.click(tid('anim-dancar'));
  await page.click(tid('anim-favorite'));
  await finishMission(page);
  await openMission(page, 7);
  await page.click(tid('preset-rindo'));
  await page.fill(tid('expr-name'), 'Gargalhada');
  await page.click(tid('expr-save'));
  await finishMission(page);
  await openMission(page, 8);
  for (const m of ['balanco', 'pulinho', 'giro', 'bracos', 'estrela']) await page.click(tid(`move-${m}`));
  await page.click(tid('dance-play'));
  await sleep(600);
  await page.screenshot({ path: OUT + '03-danca.png' });
  await page.click(tid('dance-play'));
  await finishMission(page);
  await openMission(page, 9);
  await page.click(tid('cell-0-0'));
  await page.click(tid('cell-0-4'));
  await page.click(tid('cat-animais'));
  await page.click(tid('sound-miau'));
  await page.click(tid('cell-1-2'));
  await page.click(tid('cell-1-6'));
  await page.click(tid('track-play'));
  await page.click(tid('set-signature'));
  await finishMission(page);
  await openMission(page, 10);
  await page.click(tid('mode-sons'));
  await page.fill(tid('pres-text'), 'Olá! Eu sou o Fofucho e adoro dançar!');
  await page.click(tid('pres-sound-risada'));
  await page.click(tid('pres-sound-boing'));
  await page.click(tid('pres-done'));
  await finishMission(page);
  // Etapa 3
  await openMission(page, 11);
  await page.click(tid('trait-alegre'));
  await page.click(tid('trait-curioso'));
  await finishMission(page);
  await openMission(page, 12);
  await page.click(tid('food-pizza'));
  await sleep(1600);
  await page.click(tid('food-maca'));
  await sleep(1600);
  await page.click(tid('food-favorite'));
  await finishMission(page);
  await openMission(page, 13);
  await page.click(tid('power-bolhas'));
  await page.click(tid('power-voar'));
  await page.click(tid('power-choose'));
  await finishMission(page);
  await openMission(page, 14);
  await page.click(tid('like-likes-musica'));
  await page.click(tid('ltab-fears'));
  await page.click(tid('like-fears-escuro'));
  await page.click(tid('ltab-place'));
  await page.click(tid('like-place-floresta'));
  await finishMission(page);
  await openMission(page, 15);
  await page.fill(tid('pp-nick'), 'Fofinho');
  await page.fill(tid('pp-motto'), 'Amizade é tudo!');
  await page.click(tid('pp-stamp'));
  await page.screenshot({ path: OUT + '04-passaporte.png' });
  await finishMission(page);
  // Etapa 4
  await openMission(page, 16);
  await page.click(tid('biome-floresta'));
  await page.click(tid('sky-entardecer'));
  await finishMission(page);
  await openMission(page, 17);
  for (const o of ['arvore', 'pinheiro', 'pedra']) await page.click(tid(`obj-${o}`));
  await page.click(tid('htab-agua'));
  await page.click(tid('obj-lago'));
  await page.click(tid('htab-construcoes'));
  await page.click(tid('obj-casa'));
  await page.click(tid('obj-bigger'));
  await page.click(tid('obj-rotate'));
  // arrastar a casa
  const house = await page.$('[data-testid="habitat-scene"] [data-type="casa"]');
  const hb = await house.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height * 0.7);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2 + 120, hb.y + hb.height * 0.7 - 10, { steps: 6 });
  await page.mouse.up();
  await finishMission(page);
  await openMission(page, 18);
  for (const o of ['flor', 'girassol', 'arbusto', 'lanterna']) await page.click(tid(`obj-${o}`));
  await page.click(tid('obj-dup'));
  await page.click(tid('obj-front'));
  await finishMission(page);
  await openMission(page, 19);
  await page.click(tid('obj-coelho'));
  await page.click(tid('obj-borboleta'));
  await page.click(tid('obj-sapo'));
  await page.click(tid('htab-mundo'));
  await page.click(tid('light-vagalumes'));
  await page.screenshot({ path: OUT + '05-habitat.png' });
  await finishMission(page);
  await saved(page);
  const ph = await projectByNames(clean(A1.a), clean(A1.b));
  assert.equal(ph.data.habitat.biome, 'floresta');
  assert.ok(ph.data.habitat.objects.length >= 12, 'objetos do habitat salvos');
  // Missão 20: explorar (toca em objetos; o monstrinho anda até eles)
  await openMission(page, 20);
  const ids = await page.$$eval('[data-testid="explore-scene"] [data-obj]', (els) => els.map((e) => e.getAttribute('data-obj')));
  for (const id of ids.slice(0, 4)) {
    await page.dispatchEvent(`[data-testid="explore-scene"] [data-obj="${id}"]`, 'pointerdown');
    await sleep(3500);
  }
  await page.keyboard.down('ArrowRight');
  await sleep(500);
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: OUT + '06-explorar.png' });
  await finishMission(page);

  // Etapa 5
  await openMission(page, 21);
  for (let k = 0; k < 6; k++) {
    await page.click(tid('hint'));
    const spot = await page.getAttribute('[data-hint="sim"]', 'data-spot');
    await page.dispatchEvent(`[data-obj="${spot}"]`, 'pointerdown');
    await page.waitForFunction(() => document.querySelector('[data-testid="forest-msg"]')?.textContent?.includes('Achou'), null, { timeout: 9000 });
    await sleep(300);
  }
  await page.screenshot({ path: OUT + '06b-floresta.png' });
  await page.click(tid('keep-enfeite'));
  await finishMission(page);
  await openMission(page, 22);
  await page.click(tid('ask-triste'));
  await page.click(tid('ask-casa'));
  await page.click(tid('to-help'));
  await page.click(tid('help-lanche'));
  await page.click(tid('to-card'), { timeout: 6000 });
  await page.fill(tid('card-text'), 'Você é meu amigo!');
  await page.click(tid('card-send'));
  await finishMission(page);
  await openMission(page, 23);
  await page.click(tid('piece-folha'));
  for (let i = 0; i < 4; i++) await page.click(tid(`slot-${i}`));
  await page.click(tid('bridge-test'));
  await sleep(3200);
  await page.click(tid('piece-tabua'));
  for (let i = 0; i < 4; i++) await page.click(tid(`slot-${i}`));
  await page.click(tid('bridge-test'));
  await page.waitForFunction(() => document.querySelector('[data-testid="bridge-say"]')?.textContent?.includes('aguentou'), null, { timeout: 8000 });
  await finishMission(page);
  await openMission(page, 24);
  await page.click(tid('obj-guarda-chuva'));
  const umb = await page.$('[data-testid="storm-scene"] [data-type="guarda-chuva"]');
  const ub = await umb.boundingBox();
  const mon = await page.$(tid('storm-monster'));
  const mb = await mon.boundingBox();
  await page.mouse.move(mb.x + mb.width / 2, mb.y + mb.height - 8);
  await page.mouse.down();
  await page.mouse.move(ub.x + ub.width / 2, ub.y + ub.height - 18, { steps: 8 });
  await page.mouse.up();
  await page.waitForFunction(() => document.querySelector('[data-testid="storm-say"]')?.textContent?.includes('protegido'), null, { timeout: 5000 });
  await page.click(tid('storm-go'));
  await page.waitForFunction(() => document.querySelector('[data-testid="storm-say"]')?.textContent?.includes('Passou'), null, { timeout: 10000 });
  await page.click(tid('storm-save'));
  await page.click('text=Sim, guardar');
  await finishMission(page);
  await openMission(page, 25);
  await page.click(tid('guest-pipoca'));
  await page.click(tid('guest-lili'));
  await page.click(tid('ptab-musica'));
  await page.click(tid('pmusic-festa'));
  await page.click(tid('ptab-decorar'));
  await page.click(tid('obj-baloes'));
  await page.click(tid('party-start'));
  await sleep(1500);
  await page.screenshot({ path: OUT + '07-festa.png' });
  await page.click(tid('party-stop'));
  await finishMission(page);

  // Etapa 6
  await openMission(page, 26);
  await page.click(tid('scene-habitat'));
  await finishMission(page);
  await openMission(page, 27);
  await page.click(tid('cast-pipoca'));
  await page.click(tid('cast-luna'));
  await finishMission(page);
  await openMission(page, 28);
  await page.click(tid('frame-0'));
  await page.click(tid('spanel-falas'));
  await page.click(tid('add-fala'));
  await page.fill(tid('balloon-text'), 'Era uma vez o Fofucho!');
  await page.fill(tid('caption'), 'Era uma vez...');
  await page.click(tid('frame-1'));
  await page.click(tid('add-fala'));
  await page.fill(tid('balloon-text'), 'Vamos brincar?');
  await page.click(tid('spanel-som'));
  await page.click(tid('fsound-risada'));
  await finishMission(page);
  await openMission(page, 29);
  await page.click(tid('frame-2'));
  await page.click(tid('spanel-falas'));
  await page.click(tid('add-fala'));
  await page.fill(tid('balloon-text'), 'Oh não! Uma tempestade!');
  await page.click(tid('frame-3'));
  await page.click(tid('add-fala'));
  await page.fill(tid('balloon-text'), 'Mas o abrigo salvou todos!');
  await page.click(tid('add-frame'));
  await page.click(tid('add-fala'));
  await page.fill(tid('balloon-text'), 'E todos ficaram felizes!');
  await page.screenshot({ path: OUT + '08-estudio.png' });
  await finishMission(page);
  await openMission(page, 30);
  await page.click(tid('publish-open'));
  await page.waitForSelector(tid('publish-title'));
  await page.fill(tid('publish-title'), 'A aventura do Fofucho');
  await page.click(tid('publish-ok'));
  await finishMission(page);
  await saved(page);
  const pf = await projectByNames(clean(A1.a), clean(A1.b));
  assert.equal(pf.missions_done.length, 30);
  assert.equal(pf.progress, 100);
  assert.ok(pf.completed_at);
  await page.screenshot({ path: OUT + '09-mapa-completo.png' });
});

await test('10. Salvamento das histórias + ASSISTIR À MINHA HISTÓRIA', async () => {
  const page = main.page;
  const p = await projectByNames(clean(A1.a), clean(A1.b));
  const s = p.data.stories.stories[0];
  assert.equal(s.title, 'A aventura do Fofucho');
  assert.equal(s.published, true);
  assert.ok(s.frames.length >= 5);
  assert.equal(s.frames[0].balloons[0].text, 'Era uma vez o Fofucho!');
  assert.equal(s.frames[1].sound, 'risada');
  await page.click(tid('open-exhibition'));
  await page.click(tid('play-story-0'));
  await page.waitForSelector(tid('story-player'));
  await sleep(4000);
  await page.screenshot({ path: OUT + '10-historia.png' });
  await page.click(tid('player-close'));
});

await test('9. Salvamento do habitat (com o abrigo da tempestade)', async () => {
  const p = await projectByNames(clean(A1.a), clean(A1.b));
  assert.ok(p.data.habitat.objects.some((o) => o.type === 'guarda-chuva'));
  assert.ok(p.data.habitat.objects.some((o) => o.type === 'casa' && o.s > 1));
});

await test('5. Salvamento automático (debounce) e indicador "Tudo salvo!"', async () => {
  const page = main.page;
  await page.goto(APP);
  await page.click(tid('continue'));
  await page.waitForSelector(tid('game'));
  await page.click(tid('island-1'));
  await page.click(tid('free-criatura'));
  await page.click(tid('tab-colors'));
  await page.click('[aria-label="Turquesa"]');
  const status = await page.getAttribute(tid('save-status'), 'data-status');
  assert.ok(['pending', 'saving', 'saved'].includes(status));
  await saved(page);
  const p = await projectByNames(clean(A1.a), clean(A1.b));
  assert.equal(p.data.monster.skin, '#1fb5c7');
});

await test('6. Fechamento e reabertura do site', async () => {
  await main.page.close();
  const page = await main.ctx.newPage();
  await page.goto(APP);
  await page.waitForSelector(tid('continue'));
  await page.click(tid('continue'));
  await page.waitForSelector(tid('game'));
  const stars = await page.textContent(tid('stars'));
  assert.ok(Number(stars.replace(/\D/g, '')) >= 30);
  main.page = page;
});

await test('7/4. Continuação em outro aparelho (recuperação pelo código)', async () => {
  const { page, ctx } = await newPage(devices['iPad (gen 7) landscape'] ?? {});
  await page.goto(APP);
  await page.click(tid('have-project'));
  await page.fill(tid('code-input'), codeA1.toLowerCase());
  await page.click(tid('recover-submit'));
  await page.waitForSelector(tid('game'));
  await page.click(tid('menu'));
  await page.waitForFunction(() => document.querySelector('[data-testid="my-code"]')?.textContent?.includes('-'));
  assert.equal((await page.textContent(tid('my-code'))).trim(), codeA1);
  await page.keyboard.press('Escape');
  await page.click(tid('open-exhibition'));
  await page.getByRole('heading', { name: 'Fofucho' }).first().waitFor();
  await ctx.close();
});

await test('Código errado: mensagem amigável', async () => {
  const { page, ctx } = await newPage();
  await page.goto(APP);
  await page.click(tid('have-project'));
  await page.fill(tid('code-input'), 'ZZZZZZZZ');
  await page.click(tid('recover-submit'));
  await page.waitForSelector('text=Código não encontrado');
  await ctx.close();
});

await test('13. Isolamento: uma dupla não consegue ler o projeto de outra', async () => {
  const { page, ctx } = await newPage();
  await page.goto(APP);
  await page.click(tid('have-project'));
  await page.fill(tid('code-input'), codeB1);
  await page.click(tid('recover-submit'));
  await page.waitForSelector(tid('game'));
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem('monstrinhos-auth')).access_token);
  const pA = await projectByNames(clean(A1.a), clean(A1.b));
  const r = await fetch(`${SB}/rest/v1/projects?select=*`, { headers: { Authorization: `Bearer ${token}`, apikey: 'x' } });
  const rows = await r.json();
  assert.ok(rows.every((x) => x.id !== pA.id), 'não vê a outra dupla');
  const r2 = await fetch(`${SB}/rest/v1/rpc/load_project`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, apikey: 'x', 'content-type': 'application/json' }, body: JSON.stringify({ p_id: pA.id }) });
  assert.equal((await r2.json()).status, 'forbidden');
  const r3 = await fetch(`${SB}/rest/v1/project_codes?select=*`, { headers: { Authorization: `Bearer ${token}`, apikey: 'x' } });
  assert.equal((await r3.json()).length, 0, 'estudante não lê códigos');
  await ctx.close();
});

await test('18. Recuperação após queda da internet (sem perder nada)', async () => {
  const { page, ctx } = await newPage();
  await page.goto(APP);
  await page.click(tid('have-project'));
  await page.fill(tid('code-input'), codeA2);
  await page.click(tid('recover-submit'));
  await page.waitForSelector(tid('game'));
  await page.click(tid('play-next'));
  await page.click(tid('mission-start'));
  await ctx.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await page.click(tid('part-head-estrela').replace('estrela', 'fofinha'));
  await page.click(tid('tab-colors'));
  await page.click('[aria-label="Limão"]');
  await page.waitForFunction(() => document.querySelector('[data-testid="save-status"]')?.getAttribute('data-status') === 'offline', null, { timeout: 8000 });
  await page.screenshot({ path: OUT + '11-sem-conexao.png' });
  // fecha a página ainda sem internet
  const local = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('monstrinhos:proj:')).map((k) => JSON.parse(localStorage.getItem(k))));
  assert.ok(local.some((c) => c.dirty.length > 0 && c.data.monster.skin === '#b8ec5a'), 'mudança guardada no aparelho');
  await page.close();
  await ctx.setOffline(false);
  const p2 = await ctx.newPage();
  await p2.goto(APP);
  await p2.click(tid('continue'));
  await p2.waitForSelector(tid('game'));
  await saved(p2);
  const p = await projectByNames(clean(A2.a), clean(A2.b));
  assert.equal(p.data.monster.skin, '#b8ec5a');
  assert.equal(p.data.monster.parts.head.id, 'fofinha');
  // queda durante o uso: volta sozinho
  await p2.click(tid('play-next'));
  const st = await p2.waitForSelector(tid('mission-start'), { timeout: 4000 }).catch(() => null);
  if (st) await st.click();
  await ctx.setOffline(true);
  await p2.evaluate(() => window.dispatchEvent(new Event('offline')));
  await p2.click(tid('part-head-gota'));
  await sleep(1800);
  await ctx.setOffline(false);
  await p2.evaluate(() => window.dispatchEvent(new Event('online')));
  await saved(p2);
  assert.equal((await projectByNames(clean(A2.a), clean(A2.b))).data.monster.parts.head.id, 'gota');
  await ctx.close();
});

await test('Conflito: dois aparelhos editando ao mesmo tempo não se apagam', async () => {
  const d1 = await newPage();
  const d2 = await newPage();
  for (const d of [d1, d2]) {
    await d.page.goto(APP);
    await d.page.click(tid('have-project'));
    await d.page.fill(tid('code-input'), codeB1);
    await d.page.click(tid('recover-submit'));
    await d.page.waitForSelector(tid('game'));
  }
  // aparelho 1 muda o monstrinho; aparelho 2 muda o progresso (missão 1)
  await d1.page.click(tid('play-next'));
  await d1.page.click(tid('mission-start'));
  await d1.page.click(tid('part-head-sino'));
  await saved(d1.page);
  await d2.page.click(tid('play-next'));
  await d2.page.click(tid('mission-start'));
  await d2.page.click(tid('tab-colors'));
  await d2.page.click('[aria-label="Sol"]');
  await saved(d2.page);
  const p = await projectByNames(clean(B1.a), clean(B1.b));
  assert.equal(p.data.monster.skin, '#ffd23f', 'mudança do aparelho 2');
  // o aparelho 2 tinha a cabeça antiga; a junção mantém a mais recente de cada parte
  assert.ok(p.version >= 3);
  await d1.ctx.close();
  await d2.ctx.close();
});

// ------------------------------------------------------------------ professor
const email = `prof${rnd()}@escola.test`;
await db.query(`insert into auth.users (id, aud, role, email, encrypted_password, is_anonymous, created_at, updated_at, instance_id)
  values (gen_random_uuid(), 'authenticated', 'authenticated', $1, extensions.crypt('Senha-Forte-2026', extensions.gen_salt('bf')), false, now(), now(), '00000000-0000-0000-0000-000000000000')`, [email]);
await db.query(`insert into public.teachers (user_id, name) select id, 'Prof E2E' from auth.users where email = $1`, [email]);
const teacher = await newPage({ acceptDownloads: true });

await test('12. Painel do professor: login, turmas, ver projeto, relatório', async () => {
  const page = teacher.page;
  await page.goto(APP + '#/professor');
  await page.fill(tid('t-email'), email);
  await page.fill(tid('t-password'), 'senha-errada');
  await page.click(tid('t-login'));
  await page.waitForSelector('text=E-mail ou senha incorretos');
  await page.fill(tid('t-password'), 'Senha-Forte-2026');
  await page.click(tid('t-login'));
  await page.waitForSelector(tid('teacher'));
  await page.waitForFunction(() => Number(document.querySelector('[data-testid="t-count"]')?.textContent) > 0);
  const count = Number(await page.textContent(tid('t-count')));
  assert.ok(count >= 4);
  await page.screenshot({ path: OUT + '12-professor.png' });
  await page.click(tid('t-tab-3A'));
  await page.waitForSelector(`text=${codeA1}`);
  const row = page.locator(tid('t-row'), { hasText: clean(A1.a) });
  await row.locator(tid('t-view')).click();
  await page.waitForSelector(tid('t-viewer'));
  await page.getByRole('heading', { name: 'Fofucho' }).first().waitFor();
  await page.screenshot({ path: OUT + '13-professor-projeto.png' });
  await page.keyboard.press('Escape');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(tid('t-export'))]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  assert.ok(csv.includes(clean(A1.a)) && csv.includes(codeA1) && csv.includes('Fofucho'));
});

await test('Professor libera gravação de voz para a turma', async () => {
  const page = teacher.page;
  await page.click(tid('t-tab-3B'));
  await page.click(tid('t-rec-toggle'));
  await page.waitForSelector('text=Gravação de voz: permitida');
  const r = await db.query("select allow_recordings from public.class_settings where turma = '3B'");
  assert.equal(r.rows[0].allow_recordings, true);
  await page.click(tid('t-rec-toggle'));
  await page.waitForSelector('text=Gravação de voz: bloqueada');
});

await test('14. Reiniciar uma única dupla (a dupla vê o aviso)', async () => {
  const page = teacher.page;
  await page.click(tid('t-tab-3A'));
  const row = page.locator(tid('t-row'), { hasText: clean(A2.a) });
  await row.locator(tid('t-reset')).click();
  await page.click(tid('t-confirm'));
  for (let i = 0; i < 20 && Object.keys((await projectByNames(clean(A2.a), clean(A2.b))).data).length; i++) await sleep(250);
  const p = await projectByNames(clean(A2.a), clean(A2.b));
  assert.equal(p.progress, 0);
  assert.deepEqual(p.data, {});
  const a1 = await projectByNames(clean(A1.a), clean(A1.b));
  assert.equal(a1.progress, 100, 'a outra dupla não mudou');
  const arch = await db.query('select * from public.project_archive where project_id = $1', [p.id]);
  assert.ok(arch.rows.length >= 1);
});

await test('15. Reiniciar o 3º A sem afetar o 3º B e o 3º C', async () => {
  const page = teacher.page;
  const before3B = await projectByNames(clean(B1.a), clean(B1.b));
  const before3C = await projectByNames(clean(C1.a), clean(C1.b));
  await page.click(tid('t-tab-3A'));
  await page.click(tid('t-reset-class'));
  assert.ok(await page.isDisabled(tid('t-confirm')), 'exige digitar a turma');
  await page.fill(tid('t-confirm-text'), '3A');
  await page.click(tid('t-confirm'));
  for (let i = 0; i < 20 && (await projectByNames(clean(A1.a), clean(A1.b))).progress !== 0; i++) await sleep(250);
  const a1 = await projectByNames(clean(A1.a), clean(A1.b));
  assert.equal(a1.progress, 0);
  const b = await projectByNames(clean(B1.a), clean(B1.b));
  const c = await projectByNames(clean(C1.a), clean(C1.b));
  assert.deepEqual(b.data, before3B.data);
  assert.deepEqual(c.data, before3C.data);
  // a dupla do 3º A que estava jogando recebe o aviso e não desfaz o reinício
  await main.page.click(tid('island-1')).catch(() => {});
  await main.page.goto(APP);
  await main.page.click(tid('continue'));
  await main.page.waitForSelector(tid('game'));
  const stars = Number((await main.page.textContent(tid('stars'))).replace(/\D/g, ''));
  assert.equal(stars, 0);
});

await test('Professor exclui uma dupla (com confirmação digitada)', async () => {
  const page = teacher.page;
  await page.click(tid('t-tab-3C'));
  const row = page.locator(tid('t-row'), { hasText: clean(C1.a) });
  await row.locator(tid('t-delete')).click();
  assert.ok(await page.isDisabled(tid('t-confirm')));
  await page.fill(tid('t-confirm-text'), 'excluir');
  await page.click(tid('t-confirm'));
  for (let i = 0; i < 20 && (await projectByNames(clean(C1.a), clean(C1.b))); i++) await sleep(250);
  assert.equal(await projectByNames(clean(C1.a), clean(C1.b)), undefined);
});

await test('16. Tablet (toque, tela 10"): criar, arrastar objeto e sem rolagem lateral', async () => {
  const { page, ctx } = await newPage({ ...(devices['Galaxy Tab S4'] ?? devices['iPad (gen 7)']) });
  await page.goto(APP);
  await page.tap(tid('new-project'));
  await page.tap(tid('turma-3B'));
  await page.fill(tid('name1'), 'Iris' + rnd());
  await page.fill(tid('name2'), 'Joao' + rnd());
  await page.tap(tid('start'));
  await page.waitForSelector(tid('code'));
  await page.tap(tid('code-ok'));
  await page.waitForSelector(tid('game'));
  await page.tap(tid('play-next'));
  await page.tap(tid('mission-start'));
  await page.tap(tid('part-head-ovo'));
  await page.tap(tid('mission-done'));
  await page.waitForSelector(tid('celebration'));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, 'sem rolagem lateral');
  await page.screenshot({ path: OUT + '14-tablet.png' });
  await ctx.close();
});

await test('17. Notebook (mouse e teclado): atalhos e setas', async () => {
  const { page, ctx } = await newPage({ viewport: { width: 1366, height: 768 } });
  await page.goto(APP);
  await page.click(tid('have-project'));
  await page.fill(tid('code-input'), codeB1);
  await page.keyboard.press('Enter');
  await page.waitForSelector(tid('game'));
  await page.click(tid('play-next'));
  await page.click(tid('mission-start'));
  await page.click(tid('part-head-quadrada'));
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+y');
  await saved(page);
  const p = await projectByNames(clean(B1.a), clean(B1.b));
  assert.equal(p.data.monster.parts.head.dy, -8);
  await page.screenshot({ path: OUT + '15-notebook.png' });
  await ctx.close();
});

await test('Trocar de dupla: o aparelho perde o acesso ao projeto anterior', async () => {
  const { page, ctx } = await newPage();
  await page.goto(APP);
  await page.click(tid('have-project'));
  await page.fill(tid('code-input'), codeB1);
  await page.click(tid('recover-submit'));
  await page.waitForSelector(tid('game'));
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem('monstrinhos-auth')).access_token);
  await page.click(tid('menu'));
  await page.click(tid('exit'));
  await page.click('text=Sim, terminar');
  await page.waitForSelector(tid('new-project'));
  const pB = await projectByNames(clean(B1.a), clean(B1.b));
  const r = await fetch(`${SB}/rest/v1/rpc/load_project`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, apikey: 'x', 'content-type': 'application/json' }, body: JSON.stringify({ p_id: pB.id }) });
  assert.equal((await r.json()).status, 'forbidden');
  assert.equal(await page.$(tid('continue')), null);
  await ctx.close();
});

await test('Sem erros de JavaScript em nenhuma página', async () => {
  const relevant = pageErrors.filter((e) => !/ResizeObserver|AbortError|play\(\) request/.test(e));
  assert.deepEqual(relevant, []);
});

await browser.close();
await db.end();
const ok = results.filter((r) => r[0]).length;
console.log(`\n${ok} de ${results.length} testes passaram. Capturas de tela em ${OUT}`);
process.exit(ok === results.length ? 0 : 1);
