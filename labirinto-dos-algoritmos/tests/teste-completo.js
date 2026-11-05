/* =========================================================
   LABIRINTO DOS ALGORITMOS — Teste automatizado completo (navegador)
   Joga as 25 fases pela interface, testa arrastar blocos com mouse
   e com TOQUE, desbloqueio, pontuação, estrelas, ranking, conquistas,
   salvamento, exportar/importar, dados corrompidos, Laboratório,
   responsividade e funcionamento offline (PWA).

   Uso (precisa de Node.js e Playwright):
     cd labirinto-dos-algoritmos
     node tests/teste-completo.js
   (o próprio teste sobe um servidor local temporário)
   ========================================================= */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = process.env.OUT || path.join(__dirname, 'resultados');
fs.mkdirSync(OUT, { recursive: true });
const ARGS = ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'];

let failures = 0, passes = 0;
const ok = (cond, msg) => {
  if (cond) { passes++; console.log('  ✔ ' + msg); }
  else { failures++; console.log('  ✘ FALHOU: ' + msg); }
};

/* ---------- servidor estático simples ---------- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.cur': 'image/x-icon' };
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

async function newPage(browser, base, opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 800 }, acceptDownloads: true }, opts));
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  await page.goto(base + '/index.html');
  await page.waitForFunction(() => window.LA && LA.app && LA.app.scene);
  await page.waitForTimeout(400);
  return { ctx, page };
}

async function closeModals(page) { await page.evaluate(() => LA.UI.closeAllModals()); await page.waitForTimeout(150); }

async function dragBlockMouse(page, category, index) {
  await page.locator('.blocklyTreeRow', { hasText: category }).click();
  await page.waitForTimeout(350);
  const blocks = await page.$$('.blocklyFlyout .blocklyDraggable');
  const box = await blocks[index || 0].boundingBox();
  const tgt = await page.evaluate(() => {
    let b = LA.Game.ws.getTopBlocks().find((x) => x.type === 'la_start');
    while (b.getNextBlock()) b = b.getNextBlock();
    const r = b.getSvgRoot().getBoundingClientRect();
    return { x: r.x, y: r.y + r.height };
  });
  await page.mouse.move(box.x + 12, box.y + 14);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 40, { steps: 6 });
  await page.mouse.move(tgt.x + 14, tgt.y + 14, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(250);
}

async function dragBlockTouch(page, cdp, category) {
  const row = page.locator('.blocklyTreeRow', { hasText: category });
  const rb = await row.boundingBox();
  await page.touchscreen.tap(rb.x + rb.width / 2, rb.y + rb.height / 2);
  await page.waitForTimeout(400);
  const box = await (await page.$$('.blocklyFlyout .blocklyDraggable'))[0].boundingBox();
  const tgt = await page.evaluate(() => {
    let b = LA.Game.ws.getTopBlocks().find((x) => x.type === 'la_start');
    while (b.getNextBlock()) b = b.getNextBlock();
    const r = b.getSvgRoot().getBoundingClientRect();
    return { x: r.x, y: r.y + r.height };
  });
  const pt = (x, y) => [{ x, y, id: 1, radiusX: 2, radiusY: 2, force: 1 }];
  const sx = box.x + 14, sy = box.y + 16;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(sx, sy) });
  const steps = 16;
  for (let i = 1; i <= steps; i++) {
    const x = sx + (tgt.x + 16 - sx) * i / steps, y = sy + (tgt.y + 16 - sy) * i / steps;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x, y) });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(300);
}

async function playWithSolution(page, id, ast) {
  await page.evaluate(({ id, ast }) => {
    LA.Game.open(LA.levelById(id), { skipIntro: true });
    if (ast) LA.debug.loadAst(ast); else LA.debug.loadSolution();
  }, { id, ast });
  await page.waitForTimeout(200);
  await page.click('#btn-run');
  try { await page.waitForSelector('.victory, .fail-box', { timeout: 120000 }); }
  catch (e) {
    console.log('  [diagnóstico]', await page.evaluate(() => JSON.stringify({ run: LA.Game.running, lvl: LA.Game.level.id, tick: LA.Game.world.tick, failed: LA.Game.world.failed, won: LA.Game.world.won, modal: LA.UI.hasModal(), log: document.querySelector('#log').textContent.slice(-200) })));
    throw e;
  }
  const res = (await page.locator('.victory').count()) ? 'win' : 'fail';
  await page.waitForTimeout(250);
  return res;
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await chromium.launch({ args: ARGS });

  /* ===== 1-3. Abertura, navegação, mundos ===== */
  console.log('▶ 1-3. Abertura, navegação e mapa');
  let { ctx, page } = await newPage(browser, base);
  ok(await page.isVisible('#scr-home.active'), 'tela inicial aberta');
  ok(await page.evaluate(() => LA.app.scene.ok && !!document.querySelector('#home-3d canvas')), 'cena 3D (WebGL) criada na tela inicial');
  for (const t of ['JOGAR', 'CONTINUAR', 'Mapa dos Mundos', 'Ranking', 'Conquistas', 'Como Jogar', 'Configurações']) ok(await page.locator('#scr-home').getByText(t).count() > 0, `botão “${t}” presente`);
  ok(await page.locator('input:visible, textarea:visible').count() === 0, 'tela inicial sem formulário de cadastro');
  await page.screenshot({ path: path.join(OUT, '01-inicio.png') });
  for (const s of ['ranking', 'howto', 'settings', 'lab']) {
    await page.click('#scr-home.active [data-go="' + s + '"], #scr-home.active [data-action="' + s + '"]');
    await page.waitForTimeout(250);
    ok(await page.isVisible('#scr-' + s + '.active'), `navega para a tela “${s}”`);
    await page.click('#scr-' + s + ' .btn-back');
    await page.waitForTimeout(200);
  }
  await page.click('[data-action="play"]');
  ok(await page.isVisible('#scr-players.active'), 'JOGAR abre a escolha de jogador (sem formulário)');
  await page.click('.player-card.new');
  await page.waitForSelector('#player-name');
  ok(true, 'novo jogador: aparece a caixa para digitar o nome (opcional)');
  await page.click('#btn-name-skip');
  await page.waitForSelector('#btn-intro-go');
  ok(await page.isVisible('#scr-game.active'), 'novo jogador começa direto na fase 1');
  ok(await page.evaluate(() => LA.Store.label(LA.Store.player())) === 'Jogador 1', 'identificação genérica “Jogador 1”');
  await page.click('#btn-intro-go');
  for (const s of ['achievements', 'map']) {
    await page.click('#game-back'); await page.waitForTimeout(200);
    await page.evaluate(() => LA.UI.show('home')); await page.waitForTimeout(200);
    await page.click('#scr-home [data-go="' + s + '"]');
    await page.waitForTimeout(250);
    ok(await page.isVisible('#scr-' + s + '.active'), `navega para a tela “${s}”`);
    if (s === 'achievements') { await page.evaluate(() => LA.Game.open(LA.levelById(1), { skipIntro: true })); }
  }
  ok(await page.locator('.world-card').count() === 5, 'mapa mostra 5 mundos');
  ok(await page.locator('.level-node').count() === 25, 'mapa mostra 25 fases');
  await page.screenshot({ path: path.join(OUT, '02-mapa.png'), fullPage: true });

  /* ===== 4. Desbloqueio progressivo ===== */
  console.log('▶ 4. Desbloqueio progressivo');
  ok(await page.locator('.level-node[data-level="1"]:not(.locked)').count() === 1, 'fase 1 liberada');
  ok(await page.locator('.level-node[data-level="2"].locked').count() === 1, 'fase 2 bloqueada');
  await page.click('.level-node[data-level="2"]', { force: true });
  await page.waitForTimeout(250);
  ok(await page.isVisible('#scr-map.active'), 'tocar em fase bloqueada não abre a fase');
  ok(await page.evaluate(() => LA.Store.isUnlocked(25)) === false, 'fase 25 bloqueada no início');

  /* ===== 5-7. Encaixe com mouse, execução e movimento ===== */
  console.log('▶ 5-7. Arrastar blocos (mouse) e executar');
  await page.click('.level-node[data-level="1"]', { force: true });
  await page.click('#btn-intro-go');
  for (let i = 0; i < 4; i++) await dragBlockMouse(page, 'Movimento', 0);
  const ast1 = await page.evaluate(() => LA.workspaceToAst(LA.Game.ws).ast.map((s) => s.type));
  ok(ast1.length === 4 && ast1.every((t) => t === 'forward'), 'quatro blocos “avançar” encaixados com o mouse (' + ast1.join(',') + ')');
  ok((await page.textContent('#blocks-count')).includes('4'), 'contador de blocos atualizado');
  await page.click('#btn-run');
  await page.waitForTimeout(700);
  ok(await page.evaluate(() => !!document.querySelector('.la-running')), 'bloco em execução é destacado');
  ok(await page.isVisible('#editor-lock'), 'editor travado durante a execução');
  await page.waitForSelector('.victory', { timeout: 30000 });
  ok(true, 'Byte chegou ao portal: vitória na fase 1');
  await page.screenshot({ path: path.join(OUT, '03-vitoria.png') });
  let rec = await page.evaluate(() => LA.Store.player().levels[1]);
  ok(rec && rec.best === 100 && rec.stars === 3, 'fase 1: 100 pontos e 3 estrelas');
  ok(await page.isVisible('#btn-next-level'), 'tela de vitória mostra a próxima fase');
  await page.click('#btn-next-level');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => LA.Game.level.id) === 2, 'próxima fase abre a fase 2');
  ok(await page.evaluate(() => LA.Store.isUnlocked(2)), 'fase 2 desbloqueada após vencer a fase 1');
  await closeModals(page);

  /* ===== Erros e mensagens ===== */
  console.log('▶ Mensagens de erro e laço infinito');
  let r = await playWithSolution(page, 2, LA_P([['rep', 2, ['F']], 'L', 'F']));
  ok(r === 'fail', 'bater na parede mostra a janela “Quase lá”');
  ok((await page.textContent('#log')).includes('parede'), 'mensagem “Byte bateu em uma parede” no diário');
  await closeModals(page);
  r = await playWithSolution(page, 2, LA_P([['until', [['if', 'door', ['F']]]]]));
  ok(r === 'fail' && (await page.textContent('.fail-box')).includes('repetindo'), 'proteção contra laço infinito avisa o estudante');
  await closeModals(page);
  r = await playWithSolution(page, 2, LA_P(['F', 'F']));
  ok(r === 'fail' && (await page.textContent('.fail-box')).includes('terminou'), 'aviso de programação concluída sem chegar ao portal');
  await closeModals(page);
  const attempts = await page.evaluate(() => LA.Store.player().stats.attempts[2]);
  ok(attempts === 3 && !(await page.evaluate(() => LA.Store.player().levels[2])), 'tentativas registradas sem descontar pontos');

  /* ===== Pausar e parar ===== */
  console.log('▶ Pausar, parar e reiniciar');
  await page.evaluate(() => { LA.Game.open(LA.levelById(2), { skipIntro: true }); LA.debug.loadSolution(); });
  await page.click('#btn-run');
  await page.waitForTimeout(900);
  await page.click('#btn-pause');
  const t1 = await page.evaluate(() => LA.Game.world.tick);
  await page.waitForTimeout(1200);
  const t2 = await page.evaluate(() => LA.Game.world.tick);
  ok(t1 === t2 && (await page.evaluate(() => LA.Game.paused)), 'pausar congela a execução');
  await page.click('#btn-stop');
  await page.waitForTimeout(600);
  ok(!(await page.evaluate(() => LA.Game.running)) && (await page.evaluate(() => LA.Game.world.tick)) === 0, 'parar interrompe e devolve o Byte ao início');

  /* ===== 8-16. As 25 fases pela interface ===== */
  console.log('▶ 8-16. Jogando as 25 fases (soluções de referência)');
  await page.evaluate(() => { LA.Store.settings.speed = 3; LA.Game.applySpeed(); LA.Game.scene.speed = 8; });
  // velocidade extra só para o teste
  await page.evaluate(() => { LA.Game.applySpeed = function () { LA.Game.scene.speed = 8; }; });
  for (let id = 2; id <= 25; id++) {
    ok(await page.evaluate((id) => LA.Store.isUnlocked(id), id), `fase ${id} desbloqueada na ordem`);
    const res = await playWithSolution(page, id);
    const lv = await page.evaluate((id) => LA.Store.player().levels[id], id);
    ok(res === 'win' && lv && lv.best === 100 && lv.stars === 3, `fase ${id}: vitória com 100 pontos e 3 estrelas`);
    if (id === 5) await page.screenshot({ path: path.join(OUT, '04-fase5-vitoria.png') });
    // fecha vitória e celebrações (mundo concluído / jogo concluído)
    for (let k = 0; k < 4 && (await page.evaluate(() => LA.UI.hasModal())); k++) { await closeModals(page); await page.waitForTimeout(200); }
  }
  const ach = await page.evaluate(() => Object.keys(LA.Store.player().achievements));
  for (const a of ['primeiro_passo', 'mundo1', 'mundo2', 'mundo3', 'mundo4', 'mundo5', 'grande_escape', 'laco', 'decisao', 'variavel', 'depurador', 'fuga', 'estrelas75', 'perfeito'])
    ok(ach.includes(a), 'conquista “' + a + '” desbloqueada');
  ok(await page.evaluate(() => LA.Store.labUnlocked()), 'Laboratório de Criação liberado após as 25 fases');

  /* ===== 15-16. Pontuação: só vale a melhor, sem duplicar ===== */
  console.log('▶ 15-16. Melhor pontuação e soluções alternativas');
  r = await playWithSolution(page, 1, LA_P(['F', 'L', 'R', 'F', 'F', 'F']));
  ok(r === 'win', 'solução alternativa (com blocos extras) também vence');
  await page.waitForFunction(() => document.querySelector('#score-count') && document.querySelector('#score-count').textContent === '86', null, { timeout: 5000 }).catch(() => {});
  ok((await page.textContent('#score-count')) === '86', 'solução alternativa vale 86 pontos (eficiência e regra menores)');
  rec = await page.evaluate(() => LA.Store.player().levels[1]);
  ok(rec.best === 100 && rec.stars === 3, 'resultado pior não substitui o melhor (100 continua)');
  ok(await page.evaluate(() => Object.keys(LA.Store.player().levels).length) === 25, 'repetir fase não duplica registros');
  await closeModals(page);

  /* ===== 17. Ranking local ===== */
  console.log('▶ 17. Ranking local');
  await page.evaluate(() => { const p1 = LA.Store.player().id; LA.Store.newPlayer(); LA.Store.setPlayer(LA.Store.localPlayers()[1].id); window._p1 = p1; });
  await playWithSolution(page, 1, LA_P(['F', 'F', 'F', 'F']));
  await closeModals(page);
  await page.evaluate(() => LA.UI.show('ranking'));
  await page.waitForTimeout(1200);
  ok(await page.locator('.local-banner').count() === 1 && (await page.textContent('.local-banner')).includes('deste aparelho'), 'aviso de ranking local visível');
  ok(await page.locator('.pod').count() === 3, 'pódio com 3 posições');
  ok(await page.locator('#rank-table tbody tr').count() === 2, 'ranking geral lista os 2 jogadores');
  ok((await page.textContent('#rank-table tbody tr:first-child')).includes('Jogador 1'), 'Jogador 1 em primeiro (mais pontos)');
  ok((await page.textContent('#rank-table thead')).includes('Mundos'), 'colunas: pontos, fases, estrelas, mundos');
  await page.screenshot({ path: path.join(OUT, '05-ranking.png') });
  for (const tab of ['mundo', 'fase', 'conquistas']) {
    await page.click('[data-tab="' + tab + '"]');
    await page.waitForTimeout(300);
    ok(await page.locator('#rank-table tbody tr').count() >= 1, `ranking “${tab}” mostra resultados`);
  }
  await page.click('[data-tab="fase"]');
  await page.locator('#rank-filter .chip', { hasText: /^25$/ }).click();
  await page.waitForTimeout(300);
  ok(await page.locator('#rank-table tbody tr').count() === 1, 'ranking da fase 25 mostra só quem a concluiu');

  /* ===== 18. Salvamento ===== */
  console.log('▶ 18. Salvamento automático');
  const progBefore = await page.evaluate(() => JSON.stringify(LA.Store.loadProgram(1)));
  await page.reload();
  await page.waitForFunction(() => window.LA && LA.app && LA.app.scene);
  ok(await page.evaluate(() => LA.Store.players().length) === 2, 'jogadores recuperados após recarregar');
  ok(await page.evaluate(() => LA.Store.label(LA.Store.player())) === 'Jogador 2', 'jogador atual lembrado');
  ok(await page.evaluate(() => LA.Store.data.players[window.localStorage && Object.keys(LA.Store.data.players)[0]].levels[25].best) === 100, 'pontuações recuperadas');
  ok(await page.evaluate(() => JSON.stringify(LA.Store.loadProgram(1))) === progBefore, 'programa em blocos da fase recuperado');

  /* ===== 19. Exportar e importar ===== */
  console.log('▶ 19. Exportar e importar');
  await page.evaluate(() => LA.UI.show('ranking'));
  await page.click('#scr-ranking [data-action="export"]');
  let [dl] = await Promise.all([page.waitForEvent('download'), page.click('.modal .btn-blue')]);
  const jsonPath = path.join(OUT, 'export.json');
  await dl.saveAs(jsonPath);
  const exp = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  ok(exp.app === 'labirinto-dos-algoritmos' && exp.players.length === 2, 'JSON exportado com 2 jogadores');
  ok(!/nome|email|e-mail|turma/i.test(JSON.stringify(Object.keys(exp.players[0]))), 'exportação sem dados pessoais');
  await page.click('#scr-ranking [data-action="export"]');
  [dl] = await Promise.all([page.waitForEvent('download'), page.click('.modal .btn-teal')]);
  const csvPath = path.join(OUT, 'export.csv');
  await dl.saveAs(csvPath);
  const csv = fs.readFileSync(csvPath, 'utf8');
  ok(csv.includes('aparelho;jogador;fase') && csv.split('\n').length > 25, 'CSV exportado (planilha)');
  const device1 = await page.evaluate(() => LA.Store.device);
  await ctx.close();

  // outro aparelho
  ({ ctx, page } = await newPage(browser, base));
  const device2 = await page.evaluate(() => LA.Store.device);
  ok(device1 !== device2, 'cada aparelho tem seu código próprio');
  console.log('▶ Nome do jogador');
  await page.evaluate(() => LA.UI.show('players', 'home'));
  await page.click('.player-card.new');
  await page.fill('#player-name', '  Ana <b>Clara</b> da Silva Santos  ');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const nm = await page.evaluate(() => LA.Store.name(LA.Store.player()));
  ok(nm.startsWith('Ana') && !/[<>]/.test(nm) && nm.length <= 20, 'nome limpo (sem HTML) e limitado a 20 letras (' + nm + ')');
  await page.evaluate(() => LA.UI.show('players', 'home'));
  await page.click('.player-card .ren');
  await page.fill('#player-name', 'Ana Clara');
  await page.click('#btn-name-save');
  await page.waitForTimeout(200);
  ok((await page.textContent('#players-grid')).includes('Ana Clara'), 'nome alterado pelo botão ✏️ aparece no cartão');
  await page.evaluate(() => { const p = LA.Store.player(); p.levels[1] = { best: 90, stars: 3, completed: true }; LA.Store.save(); LA.UI.show('ranking'); });
  await page.waitForTimeout(300);
  ok((await page.textContent('#rank-table')).includes('Ana Clara'), 'nome aparece no ranking');
  ok(JSON.parse(await page.evaluate(() => LA.Store.exportJSON())).players.some((p) => p.name === 'Ana Clara'), 'nome vai no arquivo exportado');
  await page.evaluate(() => LA.UI.show('ranking'));
  await page.click('#scr-ranking [data-action="import"]');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('.modal .btn-green')]);
  await chooser.setFiles(jsonPath);
  await page.waitForTimeout(500);
  ok((await page.textContent('.modal')).includes('Jogadores novos: 2'), 'importação JSON adicionou 2 jogadores');
  await closeModals(page);
  await page.evaluate(() => LA.Ranking.render());
  await page.waitForTimeout(300);
  ok((await page.textContent('#rank-table')).includes('aparelho ' + device1), 'jogadores importados aparecem com o código do aparelho');
  const r2 = await page.evaluate((csv) => LA.Store.importText(csv, 'x.csv'), csv);
  ok(r2.merged === 2 && r2.added === 0, 'importar o CSV do mesmo aparelho junta resultados sem duplicar');
  const r3 = await page.evaluate(() => { try { LA.Store.importText('{"oi":1}', 'x.json'); return 'aceitou'; } catch (e) { return e.message; } });
  ok(r3 !== 'aceitou', 'arquivo incompatível é recusado com mensagem (' + r3 + ')');
  // dados corrompidos
  await page.evaluate(() => localStorage.setItem('labirinto-algoritmos:v1', '{corrompido!!'));
  await page.reload();
  await page.waitForFunction(() => window.LA && LA.app && LA.app.scene);
  await page.waitForTimeout(300);
  ok(await page.isVisible('.modal') && (await page.textContent('.modal')).includes('danificados'), 'dados corrompidos: jogo abre e avisa');
  ok(await page.evaluate(() => Object.keys(localStorage).some((k) => k.includes('corrompido'))), 'cópia de segurança dos dados danificados guardada');
  await closeModals(page);
  // reiniciar progresso com confirmação
  await page.evaluate(() => { const p = LA.Store.newPlayer(); p.levels[1] = { best: 50, stars: 1, completed: true }; LA.Store.save(); LA.UI.show('settings'); });
  await page.click('#set-reset-me');
  ok(await page.isVisible('.modal'), 'reiniciar progresso pede confirmação');
  await page.click('.modal .btn-red');
  ok(await page.evaluate(() => Object.keys(LA.Store.player().levels).length) === 0, 'progresso reiniciado após confirmar');
  await ctx.close();

  /* ===== Laboratório de Criação ===== */
  console.log('▶ Laboratório de Criação');
  ({ ctx, page } = await newPage(browser, base));
  await page.evaluate(() => { LA.Store.ensurePlayer(); LA.Store.settings.demo = true; LA.UI.show('lab'); });
  await page.waitForTimeout(300);
  ok(await page.locator('.lab-cell').count() === 64, 'grade 8×8 do Laboratório');
  await page.locator('.tool', { hasText: 'Parede' }).click();
  const cells = await page.$$('.lab-cell');
  const c1 = await cells[8 * 3 + 2].boundingBox(), c2 = await cells[8 * 3 + 5].boundingBox();
  await page.mouse.move(c1.x + 5, c1.y + 5); await page.mouse.down(); await page.mouse.move(c2.x + 5, c2.y + 5, { steps: 6 }); await page.mouse.up();
  ok(await page.evaluate(() => LA.Lab.grid[3].slice(2, 6).join('')) === '####', 'arrastar desenha paredes');
  await page.locator('.tool', { hasText: 'Cristal' }).click();
  await cells[8 * 1 + 4].click();
  await page.click('#lab-save');
  await page.waitForTimeout(300);
  ok(await page.locator('.maze-item').count() === 1, 'labirinto salvo no aparelho');
  ok(await page.evaluate(() => !!LA.Store.player().achievements.arquiteto), 'conquista “Arquiteto” ao salvar');
  await page.click('#lab-test');
  await page.waitForTimeout(500);
  ok(await page.isVisible('#scr-game.active'), 'Testar abre o labirinto criado no 3D');
  await page.evaluate(() => LA.debug.loadAst(LA.dsl([['rep', 5, ['F']], 'R', ['rep', 5, ['F']]])));
  await page.click('#btn-run');
  await page.waitForSelector('.victory', { timeout: 30000 });
  ok(await page.evaluate(() => !!LA.Store.player().achievements.testador), 'vencer o próprio labirinto dá a conquista “Testador”');
  await page.screenshot({ path: path.join(OUT, '06-laboratorio-vitoria.png') });
  await ctx.close();

  /* ===== 20-21. Tablet e toque (sem mouse) ===== */
  console.log('▶ 20-21. Tablets e toque');
  for (const dev of [{ name: 'iPad retrato', w: 820, h: 1180 }, { name: 'Tablet Android paisagem', w: 1280, h: 800 }, { name: 'iPad paisagem', w: 1180, h: 820 }]) {
    ({ ctx, page } = await newPage(browser, base, { viewport: { width: dev.w, height: dev.h }, hasTouch: true, isMobile: true }));
    const cdp = await ctx.newCDPSession(page);
    await page.tap('[data-action="play"]');
    await page.tap('.player-card.new');
    await page.waitForSelector('#player-name');
    await page.tap('#player-name');
    await page.keyboard.type('Bia ' + dev.w);
    await page.tap('#btn-name-save');
    ok(await page.evaluate(() => LA.Store.label(LA.Store.player())) === 'Bia ' + dev.w, `${dev.name}: nome digitado pelo estudante`);
    await page.waitForSelector('#btn-intro-go');
    await page.tap('#btn-intro-go');
    await page.waitForTimeout(300);
    for (let i = 0; i < 4; i++) await dragBlockTouch(page, cdp, 'Movimento');
    const a = await page.evaluate(() => LA.workspaceToAst(LA.Game.ws).ast.length);
    ok(a === 4, `${dev.name}: 4 blocos encaixados só com toque`);
    await page.tap('#btn-run');
    await page.waitForSelector('.victory', { timeout: 30000 });
    ok(true, `${dev.name}: fase vencida sem mouse`);
    await page.screenshot({ path: path.join(OUT, `07-${dev.name.replace(/\s/g, '-')}.png`) });
    await closeModals(page);
    const small = await page.evaluate(() => Array.from(document.querySelectorAll('#scr-game .btn')).filter((b) => b.offsetParent && (b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44)).map((b) => b.id || b.textContent));
    ok(small.length === 0, `${dev.name}: botões com área de toque ≥ 44px ${small.join(',')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(!over, `${dev.name}: sem rolagem horizontal da página`);
    for (const s of ['map', 'ranking', 'settings', 'home']) {
      await page.evaluate((s) => LA.UI.show(s), s);
      await page.waitForTimeout(250);
      const ov = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      ok(!ov, `${dev.name}: tela “${s}” cabe na largura`);
    }
    await page.screenshot({ path: path.join(OUT, `08-${dev.name.replace(/\s/g, '-')}-inicio.png`) });
    ok(page.errors.length === 0, `${dev.name}: sem erros no console ${page.errors.join(' | ')}`);
    await ctx.close();
  }

  /* ===== 22. Offline (PWA) ===== */
  console.log('▶ 22. Funcionamento offline');
  ({ ctx, page } = await newPage(browser, base));
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(1500);
  ok(await page.evaluate(async () => (await caches.keys()).some((k) => k.startsWith('labirinto-algoritmos'))), 'service worker guardou os arquivos');
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => window.LA && LA.app && LA.app.scene, null, { timeout: 15000 });
  ok(await page.isVisible('#scr-home.active'), 'jogo abre SEM internet');
  ok(await page.evaluate(() => typeof THREE !== 'undefined' && typeof Blockly !== 'undefined'), 'Three.js e Blockly carregados do cache local');
  await page.click('[data-action="play"]');
  await page.click('.player-card.new');
  await page.click('#btn-name-skip');
  await page.waitForSelector('#btn-intro-go');
  await page.click('#btn-intro-go');
  await page.evaluate(() => LA.debug.loadSolution());
  await page.click('#btn-run');
  await page.waitForSelector('.victory', { timeout: 30000 });
  ok(true, 'fase jogada e vencida offline');
  await ctx.close();

  await browser.close();
  srv.close();
  console.log(`\n${failures === 0 ? '✅' : '❌'} ${passes} verificações passaram, ${failures} falharam.`);
  console.log('Capturas de tela em: ' + OUT);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

/* Converte a mini linguagem das fases em programa (igual a LA.dsl). */
function LA_P(list) {
  function cond(c) {
    if (typeof c === 'string') return ({ wall: { type: 'sensor', sensor: 'wall' }, door: { type: 'sensor', sensor: 'door' }, key: { type: 'sensor', sensor: 'key' } })[c];
    return null;
  }
  return list.map((s) => {
    if (typeof s === 'string') return { type: { F: 'forward', L: 'left', R: 'right', W: 'wait' }[s] };
    if (s[0] === 'rep') return { type: 'repeat', times: s[1], body: LA_P(s[2]) };
    if (s[0] === 'until') return { type: 'until_goal', body: LA_P(s[1]) };
    if (s[0] === 'if') return { type: 'if', cond: cond(s[1]), then: LA_P(s[2]), else: null };
    return null;
  });
}
