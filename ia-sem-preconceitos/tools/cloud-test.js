/* Teste do salvamento online com um servidor simulado (imita o google-apps-script/Code.gs).
   Uso: node tools/serve.js 8765 &  depois  node tools/cloud-test.js [pastaDeCapturas] */
const { chromium } = require('playwright');
const SHOTS = process.argv[2] || null;
const MOCK = 'https://script.google.com/macros/s/TESTE/exec';
const db = []; let next = 101;
function server(p) {
  const T = ['8A', '8B', '8C', '9A', '9B', '9C', '9D'];
  if (p.app !== 'nexuslab-ia-justa') return { ok: false, erro: 'Pedido inválido.' };
  if (p.acao === 'turma') return { ok: true, duplas: db.filter((d) => d.turma === p.turma).map((d) => ({ codigo: d.codigo, nome: d.nome, xp: d.resumo.xp || 0, progresso: d.resumo.progresso || 0, missoes: d.resumo.missoes })) };
  if (p.acao === 'criar') {
    if (!T.includes(p.turma)) return { ok: false, erro: 'Turma inválida.' };
    const ex = db.find((d) => d.turma === p.turma && d.nome.toLowerCase() === p.nome.toLowerCase());
    if (ex) return ex.senha === p.senha ? { ok: true, codigo: ex.codigo, token: (ex.token = 't' + Math.random()), turma: ex.turma, nome: ex.nome, estado: ex.estado, atualizadoEm: ex.at } : { ok: false, erro: 'NOME_EM_USO' };
    const d = { codigo: String(next++), turma: p.turma, nome: p.nome, senha: p.senha, estado: p.estado, resumo: p.resumo || {}, at: p.atualizadoEm, token: 't' + Math.random() };
    db.push(d); return { ok: true, codigo: d.codigo, token: d.token, turma: d.turma, nome: d.nome, estado: null, atualizadoEm: 0 };
  }
  if (p.acao === 'entrar') { const d = db.find((x) => x.codigo === p.codigo); if (!d || d.senha !== p.senha) return { ok: false, erro: 'Senha errada. Confiram os 4 números e tentem de novo.' }; d.token = 't' + Math.random(); return { ok: true, codigo: d.codigo, token: d.token, turma: d.turma, nome: d.nome, estado: d.estado, atualizadoEm: d.at }; }
  if (p.acao === 'salvar') { const d = db.find((x) => x.codigo === p.codigo); if (!d || d.token !== p.token) return { ok: false, erro: 'SESSAO_EXPIRADA' }; d.estado = p.estado; d.resumo = p.resumo; d.at = p.atualizadoEm; return { ok: true }; }
  return { ok: false, erro: 'Ação desconhecida.' };
}
async function device(browser, name) {
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(name + ': ' + e.message));
  await page.route('**/config.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ servidorUrl: MOCK, turmas: ['8A', '8B', '8C', '9A', '9B', '9C', '9D'] }) }));
  await page.route(MOCK, async (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(server(JSON.parse(r.request().postData()))) }));
  await page.goto('http://localhost:8765/'); await page.waitForTimeout(700);
  return page;
}
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  // Aparelho A: dupla nova
  const A = await device(b, 'A');
  await A.click('text=Iniciar missão'); await A.waitForTimeout(300);
  if (SHOTS) await A.screenshot({ path: SHOTS + '/c1-turmas.png' });
  await A.click('.turma-btn:has-text("8º A")'); await A.waitForTimeout(500);
  await A.click('text=Dupla nova'); await A.waitForTimeout(400);
  await A.click('text=Pular abertura'); await A.waitForTimeout(400);
  await A.fill('.name-input >> nth=0', 'Dupla Pixel');
  await A.fill('.pin-small >> nth=0', '0427'); await A.fill('.pin-small >> nth=1', '0427');
  if (SHOTS) await A.screenshot({ path: SHOTS + '/c2-criar.png', fullPage: true });
  await A.click('text=Entrar na NEXUS LAB'); await A.waitForTimeout(800);
  ok(db.length === 1 && db[0].senha === '0427' && db[0].turma === '8A', 'dupla criada na planilha simulada (turma 8A, senha 0427)');
  await A.evaluate(() => { ENGINE.state.xp = 321; ENGINE.state.missions.m1.status = 'done'; ENGINE.state.missions.m2.status = 'open'; ENGINE.save(); });
  await A.waitForTimeout(4000);
  ok(db[0].estado && db[0].estado.xp === 321 && db[0].resumo.missoes === '1/6', 'progresso enviado automaticamente (XP 321, 1/6 missões)');
  if (SHOTS) { await A.click('.dlg-skip'); await A.click('.dlg-next'); await A.waitForTimeout(600); await A.screenshot({ path: SHOTS + '/c3-hud.png' }); }

  // Outro aparelho tenta criar o mesmo nome com outra senha
  const C = await device(b, 'C');
  await C.click('text=Iniciar missão'); await C.click('.turma-btn:has-text("8º A")'); await C.waitForTimeout(400);
  await C.click('text=Dupla nova'); await C.click('text=Pular abertura'); await C.waitForTimeout(300);
  await C.fill('.name-input >> nth=0', 'dupla pixel'); await C.fill('.pin-small >> nth=0', '1111'); await C.fill('.pin-small >> nth=1', '1111');
  await C.click('text=Entrar na NEXUS LAB'); await C.waitForTimeout(500);
  ok(/Já existe uma dupla/.test(await C.textContent('.create-left')), 'nome repetido na turma é recusado com explicação');

  // Aparelho B: continua a dupla na outra aula
  const B = await device(b, 'B');
  await B.click('text=Iniciar missão'); await B.click('.turma-btn:has-text("8º A")'); await B.waitForTimeout(500);
  if (SHOTS) await B.screenshot({ path: SHOTS + '/c4-duplas.png' });
  await B.click('.dupla-card:has-text("Dupla Pixel")'); await B.waitForTimeout(200);
  for (const k of '9999') await B.click(`.pin-key[aria-label="${k}"]`);
  await B.waitForTimeout(400);
  ok(/Senha errada/.test(await B.textContent('.pin-msg')), 'senha errada é recusada');
  if (SHOTS) await B.screenshot({ path: SHOTS + '/c5-senha.png' });
  for (const k of '0427') await B.click(`.pin-key[aria-label="${k}"]`);
  await B.waitForTimeout(900);
  const sb = await B.evaluate(() => ({ xp: ENGINE.state.xp, name: ENGINE.state.player.name, m2: ENGINE.state.missions.m2.status }));
  ok(sb.xp === 321 && sb.name === 'Dupla Pixel' && sb.m2 === 'open' && await B.$('.map-node'), 'em outro aparelho a dupla entra com a senha e continua de onde parou');
  await B.evaluate(() => { ENGINE.state.xp = 400; ENGINE.save(); }); await B.waitForTimeout(4000);
  ok(db[0].estado.xp === 400, 'o novo aparelho salva online');
  // A sessão antiga (aparelho A) fica expirada
  await A.evaluate(() => { ENGINE.state.xp = 999; ENGINE.save(); }); await A.waitForTimeout(4000);
  ok(db[0].estado.xp === 400 && await A.evaluate(() => ENGINE.state.cloud.expired === true), 'aparelho antigo não sobrescreve: pede para entrar de novo');
  // Sair da dupla no aparelho B
  await B.click('.hud-btn[aria-label="Menu"]'); await B.click('text=Sair da dupla'); await B.click('.modal .btn-primary >> text=Sair da dupla'); await B.waitForTimeout(600);
  ok(await B.$('text=Iniciar missão') && await B.evaluate(() => !ENGINE.state.player), 'sair da dupla libera o aparelho para a próxima dupla');
  const errs = [...A.errors, ...B.errors, ...C.errors];
  ok(!errs.length, 'nenhum erro de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
})();
