// Verificação completa do Ateliê Afro (seção 14 do pedido).
// Uso: python3 -m http.server 8765 (na pasta atelie-afro) e depois: node tools/verificar.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ok = [], falhas = [];
const check = (nome, cond, info) => { (cond ? ok : falhas).push(nome + (info ? ' — ' + info : '')); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [], externos = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', (r) => { if (!r.url().startsWith('http://localhost:8765') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) externos.push(r.url()); });
  await p.goto('http://localhost:8765/');
  await p.waitForTimeout(500);

  const info = await p.evaluate(() => {
    const out = { total: AA.DESENHOS.length, porCol: {}, regioes: [], dup: 0, hrefs: 0, imgs: 0, semFechar: 0 };
    const vistos = new Set();
    AA.DESENHOS.forEach((d) => {
      out.porCol[d.col] = (out.porCol[d.col] || 0) + 1;
      const s = AA.svgDe(d);
      if (vistos.has(s)) out.dup++; vistos.add(s);
      if (/<image|href=|https?:/.test(s.replace('http://www.w3.org/2000/svg', ''))) out.hrefs++;
      const div = document.createElement('div'); div.innerHTML = s;
      const regs = div.querySelectorAll('.r');
      regs.forEach((r) => { const dd = r.getAttribute('d') || ''; if (!/[Zz]\s*$/.test(dd.trim())) out.semFechar++; });
      out.regioes.push([d.id, regs.length]);
    });
    return out;
  });
  check('1. Existem exatamente 50 desenhos', info.total === 50, info.total);
  check('2. Cinco coleções com 10 desenhos cada', [1, 2, 3, 4, 5].every((c) => info.porCol[c] === 10), JSON.stringify(info.porCol));
  const minReg = Math.min(...info.regioes.map((r) => r[1]));
  check('3. Todos os desenhos têm regiões coloríveis', minReg >= 20, 'mínimo de regiões: ' + minReg + ', total: ' + info.regioes.reduce((a, r) => a + r[1], 0));
  check('3b. Todas as regiões são caminhos fechados', info.semFechar === 0, info.semFechar + ' abertas');
  check('14. Os 50 desenhos são diferentes', info.dup === 0);
  check('15a. Sem imagens/links externos nos desenhos', info.hrefs === 0);

  // abre cada desenho no painel de pintura e confere que tocar pinta só a região tocada
  let acertos = 0, testes = 0, vazou = 0;
  for (const d of await p.evaluate(() => AA.DESENHOS.map((x) => x.id))) {
    await p.evaluate((id) => { location.hash = 'pintar/' + id; }, d);
    await p.waitForTimeout(120);
    const pts = await p.evaluate(() => {
      const regs = Array.from(document.querySelectorAll('#papel .r'));
      const out = [];
      for (let i = 0; i < regs.length && out.length < 6; i += Math.max(1, Math.floor(regs.length / 12))) {
        const r = regs[i].getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (document.elementFromPoint(x, y) === regs[i]) out.push([x, y, i]);
      }
      return out;
    });
    for (const [x, y, i] of pts) {
      const antes = await p.evaluate(() => Object.keys(AA.Pintura.fills).length);
      await p.touchscreen.tap(x, y);
      const r = await p.evaluate((i) => ({ n: Object.keys(AA.Pintura.fills).length, f: !!AA.Pintura.fills[i] }), i);
      testes++;
      if (r.f) acertos++;
      if (r.n - antes > 1) vazou++;
    }
  }
  check('4. O preenchimento funciona em todos os desenhos', acertos === testes, acertos + '/' + testes + ' toques');
  check('5. A cor não passa para regiões vizinhas', vazou === 0);
  const contorno = await p.evaluate(() => { const r = document.querySelector('#papel .r'); const cs = getComputedStyle(r); return cs.stroke + ' ' + cs.strokeWidth; });
  check('5b. Contornos pretos visíveis por cima da cor', /rgb\(29, 29, 31\)/.test(contorno), contorno);

  // desfazer, refazer, borracha, limpar
  await p.evaluate(() => { location.hash = 'pintar/c4-01'; });
  await p.waitForTimeout(200);
  const [alvoX, alvoY, K] = await p.evaluate(() => {
    const regs = Array.from(document.querySelectorAll('#papel .r'));
    for (let i = 5; i < regs.length; i++) { const r = regs[i].getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (document.elementFromPoint(x, y) === regs[i] && !AA.Pintura.fills[i]) return [x, y, i]; }
  });
  const alvo = [alvoX, alvoY];
  await p.click('.cor[data-cor="#1E7BE0"]');
  await p.touchscreen.tap(alvo[0], alvo[1]);
  const pintou = await p.evaluate((K) => AA.Pintura.fills[K], K);
  await p.click('#btn-desfazer');
  const desfez = await p.evaluate((K) => AA.Pintura.fills[K] || null, K);
  await p.click('#btn-refazer');
  const refez = await p.evaluate((K) => AA.Pintura.fills[K], K);
  check('6. Desfazer e refazer funcionam', pintou === '#1E7BE0' && desfez === null && refez === '#1E7BE0');
  await p.click('.ferr[data-ferr="borracha"]');
  await p.touchscreen.tap(alvo[0], alvo[1]);
  const apagou = await p.evaluate((K) => AA.Pintura.fills[K] || null, K);
  check('7. A borracha volta a região para o branco', apagou === null);
  await p.click('.cor[data-cor="#FF7A00"]');
  await p.touchscreen.tap(alvo[0], alvo[1]);

  // salvamento automático e recarregar
  const salvoAntes = await p.evaluate((K) => JSON.parse(localStorage.getItem('atelie-afro:v1:d:c4-01')).f[K], K);
  check('8. O salvamento é automático', salvoAntes === '#FF7A00');
  await p.reload();
  await p.waitForTimeout(500);
  const depois = await p.evaluate((K) => AA.Pintura.fills[K], K);
  const corTela = await p.evaluate((K) => document.querySelectorAll('#papel .r')[K].style.fill, K);
  check('9. O progresso continua após atualizar a página', depois === '#FF7A00' && /255, 122, 0/.test(corTela), corTela);

  // limpar com confirmação
  await p.click('#btn-limpar');
  const janela = await p.isVisible('#janela-confirmar');
  await p.click('#confirmar-nao');
  const aindaTem = await p.evaluate(() => Object.keys(AA.Pintura.fills).length);
  await p.click('#btn-limpar');
  await p.click('#confirmar-sim');
  const limpo = await p.evaluate(() => Object.keys(AA.Pintura.fills).length);
  check('7b. Limpar pede confirmação e limpa', janela && aindaTem > 0 && limpo === 0, [janela, aindaTem, limpo].join(','));
  await p.click('#btn-desfazer', { timeout: 3000 }).catch(() => {});
  check('7c. Limpar pode ser desfeito', await p.evaluate(() => Object.keys(AA.Pintura.fills).length) > 0);

  // concluir e galeria
  await p.click('#btn-terminei');
  await p.waitForTimeout(300);
  check('10a. Comemoração aparece ao terminar', await p.isVisible('#festa'));
  await p.click('#festa-galeria');
  await p.waitForTimeout(300);
  const estados = await p.evaluate(() => Array.from(document.querySelectorAll('.cartao')).map((c) => c.className));
  check('10. A galeria identifica o desenho concluído', estados[0].includes('est-concluido') && !estados[1].includes('est-concluido'), estados.slice(0, 2).join(' | '));
  const minisPintadas = await p.evaluate(() => document.querySelector('.cartao .mini .r[style*="fill"]') !== null);
  check('10b. A miniatura mostra as cores', minisPintadas);
  // apagar individualmente
  await p.click('.cartao-apagar');
  await p.click('#confirmar-sim');
  await p.waitForTimeout(200);
  check('9b. Apagar uma pintura individualmente', await p.evaluate(() => AA.Salvar.estado('c4-01') === 'novo'));

  // telas pequenas: sem rolagem horizontal
  for (const [w, h] of [[360, 640], [640, 360], [800, 1280], [1280, 800], [1024, 600]]) {
    await p.setViewportSize({ width: w, height: h });
    for (const tela of ['', 'galeria', 'pintar/c2-05']) {
      await p.evaluate((t) => { location.hash = t; }, tela);
      await p.waitForTimeout(150);
      const rola = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth || Array.from(document.querySelectorAll('.tela.ativa *')).some((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > window.innerWidth + 1 && !e.closest('#papel') && getComputedStyle(e).position !== 'fixed'; }));
      check(`11. Sem rolagem horizontal ${w}x${h} ${tela || 'início'}`, !rola);
    }
    const tam = await p.evaluate(() => Math.min(...Array.from(document.querySelectorAll('.ferr, .cor')).map((e) => e.getBoundingClientRect().width)));
    check(`12. Botões de toque com tamanho bom ${w}x${h}`, tam >= 26, Math.round(tam) + 'px');
  }

  // botões sem função
  const botoes = await p.evaluate(() => Array.from(document.querySelectorAll('button[id]:not([data-acao])')).map((b) => b.id));
  const js = ['app.js', 'pintura.js', 'galeria.js'].map((f) => fs.readFileSync(path.join(__dirname, '../js', f), 'utf8')).join('\n');
  const semFuncao = botoes.filter((id) => !js.includes(`'${id}'`) && !js.includes(`"${id}"`));
  check('13. Não existem botões sem funcionalidade', semFuncao.length === 0, semFuncao.join(', '));

  check('15. Nenhuma dependência externa carregada', externos.length === 0, externos.join(', '));
  check('15b. Nenhum erro no console', errs.length === 0, errs.join(' | '));
  console.log('OK (' + ok.length + '):\n  ' + ok.join('\n  '));
  console.log('FALHAS (' + falhas.length + '):\n  ' + falhas.join('\n  '));
  await b.close();
  process.exit(falhas.length ? 1 : 0);
})();
