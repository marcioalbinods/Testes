/**
 * Teste de ponta a ponta da interface: Chromium real + backend .gs real (simulador).
 * A ponte google.script.run -> backend é feita por page.exposeFunction.
 * Executar:  node tests/ui.test.js   (gera capturas em tests/capturas/)
 */
'use strict';
const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');
const { criarAmbiente } = require('./gas-mock');
const { NOMES, DADOS_ESCOLA } = require('./dados-teste'); // nomes FICTÍCIOS
const INSPETORA = 'inspetora@escola.edu.br';

const DONO = 'coordenacao@escola.edu.br';
const PROF = 'professora@escola.edu.br';
const AGORA = '2026-11-20T10:00:00-03:00';
const CAPTURAS = path.join(__dirname, 'capturas');
fs.mkdirSync(CAPTURAS, { recursive: true });

const amb = criarAmbiente({ agora: AGORA, dono: DONO });
amb.ctx.DADOS_ESCOLA_ = DADOS_ESCOLA;
amb.novaExecucao(DONO);
amb.ctx.setupSistema();
amb.novaExecucao(DONO);
amb.ctx.apiSalvarConfiguracoes({ NOME_ESCOLA: 'ESCOLA MUNICIPAL (NOME A CONFIGURAR)' });
amb.novaExecucao(DONO);
const turmaId = amb.ctx.apiListarTurmas(false).data[0].id; // 5º X
amb.novaExecucao(DONO);
amb.ctx.apiSalvarProfessor({ nome: 'MARIA PROFESSORA', email: PROF, perfil: 'PROFESSOR', turmas: [turmaId] });
amb.novaExecucao(DONO);
amb.ctx.apiSalvarProfessor({ nome: 'INSPETORA DE ALUNOS', email: INSPETORA, perfil: 'PROFESSOR', turmas: ['*'] });

let redeFalhando = false;
let chamadasServidor = [];

// Servidor HTTP local: entrega o HTML gerado pelo doGet() para o usuário informado.
const servidor = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  amb.novaExecucao(u.searchParams.get('u') || PROF);
  const html = amb.ctx.doGet({}).getContent();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

const PONTE = `
  (function () {
    function runner() {
      var ok = null, falha = null;
      var p = new Proxy({}, { get: function (_, nome) {
        if (nome === 'withSuccessHandler') return function (h) { ok = h; return p; };
        if (nome === 'withFailureHandler') return function (h) { falha = h; return p; };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          window.__gas(nome, JSON.stringify(args)).then(function (r) { setTimeout(function () { ok && ok(JSON.parse(r)); }, 30); })
            .catch(function (e) { setTimeout(function () { falha && falha(new Error('NetworkError: Connection failure due to HTTP 0')); }, 30); });
        };
      } });
      return p;
    }
    window.google = { script: {} };
    Object.defineProperty(window.google.script, 'run', { get: runner });
  })();`;

async function novaPagina(browser, opcoesContexto, usuario) {
  const contexto = await browser.newContext(opcoesContexto);
  const page = await contexto.newPage();
  await page.clock.setFixedTime(new Date(AGORA));
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await page.exposeFunction('__gas', (nome, argsJson) => {
    if (redeFalhando) throw new Error('rede');
    chamadasServidor.push(nome);
    const r = amb.api(usuario, nome, ...JSON.parse(argsJson));
    return JSON.stringify(r);
  });
  await page.addInitScript(PONTE);
  page.__erros = erros;
  page.__contexto = contexto;
  return page;
}

let total = 0, falhas = 0;
async function teste(nome, fn) {
  total++;
  try { await fn(); console.log('  ✔ ' + nome); }
  catch (e) { falhas++; console.log('  ✖ ' + nome + '\n      ' + String(e && e.stack || e).split('\n').slice(0, 5).join('\n      ')); }
}
const foto = async (page, nome, cheia) => { await page.waitForTimeout(300); await page.screenshot({ path: path.join(CAPTURAS, nome + '.png'), fullPage: !!cheia }); };
function backendChamada(data) {
  amb.novaExecucao(PROF);
  return JSON.parse(JSON.stringify(amb.ctx.apiCarregarChamada({ turmaId, data }))).data;
}

(async () => {
  await new Promise(r => servidor.listen(0, r));
  const URL_APP = 'http://127.0.0.1:' + servidor.address().port + '/';
  const browser = await chromium.launch();

  // ---------------------------------------------------------------- Computador
  console.log('\nComputador (1440x900)');
  let page = await novaPagina(browser, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, PROF);
  await teste('painel carrega com escola, professor, turma, data e indicadores', async () => {
    await page.goto(URL_APP + '?u=' + PROF);
    await page.waitForSelector('.boas-vindas');
    const txt = await page.textContent('#conteudo');
    assert.ok(txt.includes('MARIA PROFESSORA'));
    assert.ok(txt.includes('5º X'));
    assert.ok(txt.includes('ESCOLA MUNICIPAL'));
    assert.ok(/20 de novembro de 2026/.test(txt));
    assert.ok(txt.includes('ACOMPANHAMENTO DA FREQUÊNCIA'));
    assert.ok(await page.isVisible('.sidebar'), 'menu lateral no computador');
    assert.ok(!(await page.isVisible('.bottomnav')));
  });
  await teste('fazer chamada: 32 estudantes, contadores e marcação das 4 situações', async () => {
    await page.click('.sidebar [data-nav="chamada"]');
    await page.waitForSelector('.lc-linha');
    assert.strictEqual(await page.locator('.lc-linha').count(), 32);
    assert.strictEqual(await page.inputValue('#ch-data'), '2026-11-20');
    const cont = async () => (await page.locator('.contador .v').allTextContents()).map(Number);
    assert.deepStrictEqual(await cont(), [32, 0, 0, 0, 0, 32]);
    await page.click('.lc-linha >> nth=0 >> .b-PRESENTE');
    await page.click('.lc-linha >> nth=1 >> .b-AUSENTE');
    await page.click('.lc-linha >> nth=2 >> .b-ATRASADO');
    await page.click('.lc-linha >> nth=3 >> .b-JUSTIFICADA');
    assert.deepStrictEqual(await cont(), [32, 1, 1, 1, 1, 28]);
    await page.fill('.lc-linha >> nth=3 >> input[data-obs]', 'Atestado médico');
    assert.ok(/não salvas/.test(await page.textContent('#ch-status')));
  });
  await teste('marcar todos como presentes afeta apenas os não registrados', async () => {
    await page.click('[data-acao="todos-presentes"]');
    const v = (await page.locator('.contador .v').allTextContents()).map(Number);
    assert.deepStrictEqual(v, [32, 29, 1, 1, 1, 0]);
  });
  await teste('salvar: mensagem só após confirmação do servidor; dados gravados', async () => {
    await page.click('[data-acao="salvar"]');
    await page.waitForFunction(() => /Salvo com sucesso/.test(document.querySelector('#ch-status').textContent));
    const b = backendChamada('2026-11-20');
    assert.strictEqual(b.chamada.status, 'RASCUNHO');
    assert.strictEqual(b.estudantes.filter(e => e.situacao === 'PRESENTE').length, 29);
    assert.strictEqual(b.estudantes[3].observacao, 'Atestado médico');
    await foto(page, '01-chamada-computador');
  });
  await teste('salvamento automático após alteração', async () => {
    await page.click('.lc-linha >> nth=10 >> .b-AUSENTE');
    await page.waitForFunction(() => /Salvo com sucesso/.test(document.querySelector('#ch-status').textContent), null, { timeout: 9000 });
    assert.strictEqual(backendChamada('2026-11-20').estudantes[10].situacao, 'AUSENTE');
  });
  await teste('limpar seleção pede confirmação (cancelar mantém marcações)', async () => {
    await page.click('[data-acao="limpar"]');
    await page.waitForSelector('.modal');
    assert.ok(/Limpar seleção\?/.test(await page.textContent('.modal')));
    await page.click('.modal-rodape >> text=Cancelar');
    assert.strictEqual(Number(await page.locator('.contador .v').nth(5).textContent()), 0);
  });
  await teste('finalizar: confirmação e chamada fica somente leitura', async () => {
    await page.click('[data-acao="finalizar"]');
    await page.waitForSelector('.modal');
    await foto(page, '02-confirmar-finalizacao');
    await page.click('.modal-rodape .btn-sucesso');
    await page.waitForSelector('.aviso-ok >> text=Chamada finalizada');
    assert.strictEqual(backendChamada('2026-11-20').chamada.status, 'FINALIZADA');
    assert.strictEqual(await page.locator('.bsit:not([disabled])').count(), 0, 'botões desabilitados');
    assert.ok(await page.isVisible('[data-acao="reabrir"]'));
  });
  await teste('recuperação após fechar e reabrir o navegador', async () => {
    await page.reload();
    await page.click('.sidebar [data-nav="chamada"]');
    await page.waitForSelector('.lc-linha');
    assert.ok(await page.isVisible('text=Chamada finalizada'));
    assert.strictEqual(Number(await page.locator('.contador.c-A .v').textContent()), 2);
  });
  await teste('finalizar com pendências mostra a lista e permite salvar rascunho', async () => {
    await page.fill('#ch-data', '2026-11-19');
    await page.dispatchEvent('#ch-data', 'change');
    await page.waitForFunction(() => document.querySelectorAll('.lc-linha').length === 32 && !document.querySelector('.aviso-ok'));
    await page.click('.lc-linha >> nth=0 >> .b-PRESENTE');
    await page.click('[data-acao="finalizar"]');
    await page.waitForSelector('.modal >> text=Ainda há estudantes sem registro');
    assert.ok((await page.textContent('.modal')).includes(NOMES[1]));
    await page.click('.modal-rodape >> text=Salvar como rascunho');
    await page.waitForFunction(() => /Salvo com sucesso/.test(document.querySelector('#ch-status').textContent));
    assert.strictEqual(backendChamada('2026-11-19').chamada.status, 'RASCUNHO');
  });
  await teste('queda de conexão: aviso, dados preservados no aparelho, NÃO indica salvo', async () => {
    redeFalhando = true;
    await page.click('.lc-linha >> nth=1 >> .b-AUSENTE');
    await page.click('[data-acao="salvar"]');
    await page.waitForFunction(() => /Tentando novamente/.test(document.querySelector('#ch-status').textContent), null, { timeout: 6000 });
    await foto(page, '03-tentando-novamente');
    await page.waitForFunction(() => /Erro ao salvar/.test(document.querySelector('#ch-status').textContent), null, { timeout: 30000 });
    assert.ok(!/Salvo com sucesso/.test(await page.textContent('#ch-status')));
    assert.strictEqual(backendChamada('2026-11-19').estudantes[1].situacao, 'NAO_REGISTRADO', 'servidor não recebeu');
    const local = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('fe:pend:')));
    assert.strictEqual(local.length, 1, 'marcações guardadas localmente');
    await page.__contexto.setOffline(true);
    await page.waitForSelector('body.offline .faixa-conexao');
    await foto(page, '04-sem-conexao');
    await page.click('.lc-linha >> nth=2 >> .b-ATRASADO');
    assert.ok(/Sem conexão/.test(await page.textContent('#ch-status')));
  });
  await teste('ao reabrir o app, oferece restaurar marcações não enviadas e as salva', async () => {
    // O professor fecha o aplicativo ainda sem internet; depois reabre com conexão.
    const pend = await page.evaluate(() => { const o = {}; Object.keys(localStorage).forEach(k => { o[k] = localStorage.getItem(k); }); return o; });
    await page.__contexto.close();
    redeFalhando = false;
    const p2 = await novaPagina(browser, { viewport: { width: 1440, height: 900 } }, PROF);
    await p2.goto(URL_APP + '?u=' + PROF);
    await p2.evaluate(o => Object.keys(o).forEach(k => localStorage.setItem(k, o[k])), pend);
    await p2.click('.sidebar [data-nav="chamada"]');
    await p2.waitForSelector('.lc-linha');
    await p2.fill('#ch-data', '2026-11-19');
    await p2.dispatchEvent('#ch-data', 'change');
    await p2.waitForSelector('[data-acao="restaurar"]');
    await foto(p2, '05-restaurar-pendencias');
    await p2.click('[data-acao="restaurar"]');
    await p2.waitForFunction(() => /Salvo com sucesso/.test(document.querySelector('#ch-status').textContent), null, { timeout: 10000 });
    const b = backendChamada('2026-11-19');
    assert.strictEqual(b.estudantes[1].situacao, 'AUSENTE');
    assert.strictEqual(b.estudantes[2].situacao, 'ATRASADO');
    page = p2;
  });
  await teste('conflito com outro usuário: modal de escolha', async () => {
    // gestão altera a mesma chamada "por fora"
    amb.novaExecucao(DONO);
    const atual = JSON.parse(JSON.stringify(amb.ctx.apiCarregarChamada({ turmaId, data: '2026-11-19' }))).data;
    amb.novaExecucao(DONO);
    amb.ctx.apiSalvarChamada({ turmaId, data: '2026-11-19', chamadaId: atual.chamada.id, versao: atual.chamada.versao, requestId: 'X1',
      registros: [{ estudanteId: atual.estudantes[5].id, situacao: 'AUSENTE' }] });
    await page.click('.lc-linha >> nth=6 >> .b-PRESENTE');
    await page.click('[data-acao="salvar"]');
    await page.waitForSelector('.modal >> text=Chamada alterada por outra pessoa');
    await page.click('.modal-rodape >> text=Manter minhas marcações');
    await page.waitForFunction(() => /Salvo com sucesso/.test(document.querySelector('#ch-status').textContent), null, { timeout: 10000 });
    const b = backendChamada('2026-11-19');
    assert.strictEqual(b.estudantes[5].situacao, 'AUSENTE', 'alteração da gestão preservada');
    assert.strictEqual(b.estudantes[6].situacao, 'PRESENTE');
  });
  await teste('histórico: lista, detalhe e correção com motivo (auditoria)', async () => {
    await page.click('.sidebar [data-nav="historico"]');
    await page.waitForSelector('#hist-res tr.clicavel');
    assert.strictEqual(await page.locator('#hist-res tr.clicavel').count(), 2);
    await page.click('#hist-res tr.clicavel >> nth=0');
    await page.waitForSelector('[data-dc="corrigir"]');
    await page.click('[data-dc="corrigir"] >> nth=4');
    await page.waitForSelector('#cr-mot');
    await page.click('.modal >> nth=1 >> [data-escolha="JUSTIFICADA"]');
    await page.click('.modal-rodape >> nth=-1 >> text=Salvar correção');
    assert.ok(/motivo/.test(await page.textContent('#cr-erro')), 'motivo obrigatório na finalizada');
    await page.fill('#cr-mot', 'Atestado entregue pela família');
    await page.click('.modal-rodape >> nth=-1 >> text=Salvar correção');
    await page.waitForSelector('.toast >> text=Correção salva');
    const b = backendChamada('2026-11-20');
    assert.strictEqual(b.estudantes[4].situacao, 'JUSTIFICADA');
    await page.waitForSelector('#dc-corpo >> text=CORRECAO_REGISTRO', { state: 'detached' }).catch(() => {});
    await foto(page, '06-historico-detalhe');
    await page.keyboard.press('Escape');
  });
  await teste('relatórios: gera relatório geral e exporta CSV/PDF/Excel (download)', async () => {
    await page.click('.sidebar [data-nav="relatorios"]');
    await page.waitForSelector('[data-acao="rel-gerar"]');
    await page.click('[data-acao="rel-gerar"]');
    await page.waitForSelector('#rel-res table.tabela tbody tr');
    assert.strictEqual(await page.locator('#rel-res tbody tr').count(), 32);
    await foto(page, '07-relatorio-geral');
    for (const fmt of ['CSV', 'PDF', 'XLSX']) {
      const [down] = await Promise.all([page.waitForEvent('download'), page.click('[data-exportar="' + fmt + '"]')]);
      assert.ok(new RegExp('\\.' + fmt.toLowerCase() + '$').test(down.suggestedFilename()), fmt + ' -> ' + down.suggestedFilename());
    }
    for (const tipo of ['DIARIA', 'SEMANAL', 'MENSAL', 'MAIS_FALTAS', 'ABAIXO_LIMITE']) {
      await page.selectOption('#rf-tipo', tipo);
      await page.click('[data-acao="rel-gerar"]');
      await page.waitForSelector('#rel-res .card');
      assert.ok(!(await page.isVisible('#rel-res .aviso-erro')), tipo);
    }
  });
  await teste('ficha individual ao clicar no nome', async () => {
    await page.selectOption('#rf-tipo', 'GERAL');
    await page.click('[data-acao="rel-gerar"]');
    await page.waitForSelector('#rel-res [data-ficha]');
    await page.click('#rel-res [data-ficha] >> nth=1');
    await page.waitForSelector('.ficha-cab');
    const t = await page.textContent('.modal');
    assert.ok(t.includes(NOMES[1]) && t.includes('Histórico cronológico') && t.includes('Frequência'));
    await foto(page, '08-ficha-estudante');
    await page.keyboard.press('Escape');
  });
  await teste('professor não vê menus de gestão', async () => {
    assert.strictEqual(await page.locator('.sidebar [data-nav="admin"]').count(), 0);
    assert.strictEqual(await page.locator('.sidebar [data-nav="estudantes"]').count(), 0);
  });
  await teste('painel com gráficos após chamadas finalizadas', async () => {
    await page.click('.sidebar [data-nav="painel"]');
    await page.waitForSelector('.grafico svg rect');
    await foto(page, '09-painel-computador', true);
  });
  assert.deepStrictEqual(page.__erros, [], 'erros de JavaScript: ' + page.__erros.join(' | '));

  // ---------------------------------------------------------------- Administração
  console.log('\nAdministração (computador)');
  const adm = await novaPagina(browser, { viewport: { width: 1366, height: 900 }, deviceScaleFactor: 2 }, DONO);
  await teste('admin: estudantes (adicionar), turmas, usuários, configurações, backup, auditoria', async () => {
    await adm.goto(URL_APP + '?u=' + DONO);
    await adm.click('.sidebar [data-nav="estudantes"]');
    await adm.waitForSelector('#est-lista table');
    assert.strictEqual(await adm.locator('#est-lista tbody tr').count(), 32);
    await adm.click('[data-acao="est-novo"]');
    await adm.fill('#fe-nome', 'ESTUDANTE NOVO DE TESTE');
    await adm.click('.modal-rodape >> text=Salvar');
    await adm.waitForFunction(() => document.querySelectorAll('#est-lista tbody tr').length === 33);
    await foto(adm, '10-estudantes');
    await adm.click('.sidebar [data-nav="admin"]');
    await adm.waitForSelector('[data-adm="turma-nova"]');
    await adm.click('[data-aba="usuarios"]');
    await adm.waitForSelector('text=MARIA PROFESSORA');
    await adm.click('[data-aba="config"]');
    await adm.waitForSelector('[data-adm="config-salvar"]');
    await adm.fill('#cf-LIMITE_FREQUENCIA', '85');
    await adm.click('[data-adm="config-salvar"]');
    await adm.waitForSelector('.toast >> text=alterada');
    await foto(adm, '11-configuracoes');
    await adm.click('[data-aba="backup"]');
    await adm.click('[data-adm="backup-agora"]');
    await adm.waitForSelector('.toast >> text=Backup criado');
    await adm.click('[data-adm="verificar"]');
    await adm.waitForSelector('#diag .diag');
    await adm.click('[data-aba="auditoria"]');
    await adm.waitForSelector('#aud-res table');
    await foto(adm, '12-auditoria');
  });
  assert.deepStrictEqual(adm.__erros, [], 'erros de JavaScript (admin): ' + adm.__erros.join(' | '));

  // ---------------------------------------------------------------- Inspetora (todas as turmas)
  console.log('\nInspetora — chamadas de várias turmas');
  const insp = await novaPagina(browser, { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 }, INSPETORA);
  await teste('painel "Chamadas de hoje" mostra todas as turmas e abre a chamada com um toque', async () => {
    await insp.goto(URL_APP + '?u=' + INSPETORA);
    await insp.waitForSelector('.grade-turmas .ficha-turma');
    assert.strictEqual(await insp.locator('.ficha-turma').count(), 3);
    assert.deepStrictEqual(await insp.locator('.ficha-turma .ft-nome').allTextContents(), ['5º X', '6º Y', '7º Z']);
    assert.ok(/1 de 3 turmas finalizadas/.test(await insp.textContent('#conteudo')), 'a 5º X já foi finalizada pela professora');
    assert.ok(await insp.isVisible('.ficha-turma.st-FINALIZADA >> text=5º X'));
    await foto(insp, '14-chamadas-de-hoje');
    await insp.click('.ficha-turma >> text=6º Y');
    await insp.waitForFunction(() => { const s = window.__FE.estado(); return s.Ch && document.querySelectorAll('.lc-linha').length === 4; });
    assert.strictEqual(await insp.inputValue('#ch-turma'), await insp.inputValue('#sel-turma-global'));
  });
  await teste('após finalizar, botão leva para a próxima turma pendente', async () => {
    await insp.click('[data-acao="todos-presentes"]');
    await insp.click('[data-acao="finalizar"]');
    await insp.click('.modal-rodape .btn-sucesso');
    await insp.waitForSelector('#ch-proxima >> text=Próxima turma: 7º Z');
    await foto(insp, '15-proxima-turma');
    await insp.click('#ch-proxima button');
    await insp.waitForFunction(() => document.querySelectorAll('.lc-linha').length === 3 && /7º Z/.test(document.querySelector('.cabecalho-pagina').textContent));
    await insp.click('[data-acao="todos-presentes"]');
    await insp.click('[data-acao="finalizar"]');
    await insp.click('.modal-rodape .btn-sucesso');
    await insp.waitForSelector('#ch-proxima >> text=Todas as 3 turmas');
    await insp.click('.sidebar [data-nav="painel"]');
    await insp.waitForSelector('text=3 de 3 turmas finalizadas');
  });
  assert.deepStrictEqual(insp.__erros, [], 'erros JS inspetora: ' + insp.__erros.join(' | '));
  await insp.__contexto.close();

  // ---------------------------------------------------------------- Opção: chamada inicia com todos presentes
  console.log('\nOpção "chamada já abre com todos presentes"');
  amb.novaExecucao(DONO); amb.ctx.apiSalvarConfiguracoes({ CHAMADA_INICIA_PRESENTE: 'SIM' });
  const pre = await novaPagina(browser, { viewport: { width: 1280, height: 900 } }, INSPETORA);
  const turmaY = (() => { amb.novaExecucao(DONO); return amb.ctx.apiListarTurmas(false).data.find(t => t.nome === '6º Y').id; })();
  const chamadaY17 = () => { amb.novaExecucao(DONO); return JSON.parse(JSON.stringify(amb.ctx.apiCarregarChamada({ turmaId: turmaY, data: '2026-11-17' }))).data; };
  await teste('abre com todos presentes; só consultar e sair NÃO grava nada', async () => {
    await pre.goto(URL_APP + '?u=' + INSPETORA);
    await pre.waitForSelector('.ficha-turma');
    await pre.click('.ficha-turma >> text=6º Y');
    await pre.waitForFunction(() => document.querySelectorAll('.lc-linha').length === 4);
    await pre.fill('#ch-data', '2026-11-17');
    await pre.dispatchEvent('#ch-data', 'change');
    await pre.waitForFunction(() => { const s = window.__FE.estado(); return s.Ch && s.Ch.data === '2026-11-17' && document.querySelectorAll('.lc-linha').length === 4; });
    assert.deepStrictEqual((await pre.locator('.contador .v').allTextContents()).map(Number), [4, 4, 0, 0, 0, 0]);
    assert.ok(/Todos marcados como presentes/.test(await pre.textContent('#ch-status')));
    await foto(pre, '16-inicia-presente');
    await pre.click('.sidebar [data-nav="painel"]');
    await pre.waitForSelector('.ficha-turma');
    assert.strictEqual(chamadaY17().chamada, null, 'nenhuma chamada criada só por abrir');
  });
  await teste('marca só a exceção e finaliza: grava presentes + ausente', async () => {
    await pre.click('.ficha-turma >> text=6º Y');
    await pre.waitForFunction(() => document.querySelectorAll('.lc-linha').length === 4);
    await pre.fill('#ch-data', '2026-11-17');
    await pre.dispatchEvent('#ch-data', 'change');
    await pre.waitForFunction(() => { const s = window.__FE.estado(); return s.Ch && s.Ch.data === '2026-11-17' && document.querySelectorAll('.lc-linha').length === 4; });
    await pre.click('.lc-linha >> nth=1 >> .b-AUSENTE');
    await pre.click('[data-acao="finalizar"]');
    await pre.click('.modal-rodape .btn-sucesso');
    await pre.waitForSelector('.aviso-ok >> text=Chamada finalizada');
    const c = chamadaY17();
    assert.strictEqual(c.chamada.status, 'FINALIZADA');
    assert.deepStrictEqual([c.chamada.presentes, c.chamada.ausentes, c.chamada.naoRegistrados], [3, 1, 0]);
  });
  await teste('finalizar sem tocar em nada grava todos como presentes', async () => {
    await pre.click('.sidebar [data-nav="painel"]');
    await pre.waitForSelector('.ficha-turma');
    await pre.click('.ficha-turma >> text=7º Z');
    await pre.waitForFunction(() => document.querySelectorAll('.lc-linha').length === 3);
    await pre.fill('#ch-data', '2026-11-17');
    await pre.dispatchEvent('#ch-data', 'change');
    await pre.waitForFunction(() => { const s = window.__FE.estado(); return s.Ch && s.Ch.data === '2026-11-17' && document.querySelectorAll('.lc-linha').length === 3; });
    await pre.click('[data-acao="finalizar"]');
    await pre.click('.modal-rodape .btn-sucesso');
    await pre.waitForSelector('.aviso-ok >> text=Chamada finalizada');
    amb.novaExecucao(DONO);
    const z = amb.ctx.apiListarTurmas(false).data.find(t => t.nome === '7º Z').id;
    amb.novaExecucao(DONO);
    const c = JSON.parse(JSON.stringify(amb.ctx.apiCarregarChamada({ turmaId: z, data: '2026-11-17' }))).data;
    assert.deepStrictEqual([c.chamada.status, c.chamada.presentes, c.chamada.naoRegistrados], ['FINALIZADA', 3, 0]);
  });
  assert.deepStrictEqual(pre.__erros, [], 'erros JS (inicia presente): ' + pre.__erros.join(' | '));
  await pre.__contexto.close();
  amb.novaExecucao(DONO); amb.ctx.apiSalvarConfiguracoes({ CHAMADA_INICIA_PRESENTE: 'NAO' });

  // ---------------------------------------------------------------- Tablet e celular
  for (const [nome, disp] of [['tablet-ipad', devices['iPad (gen 7)']], ['tablet-android', devices['Galaxy Tab S4']], ['celular', devices['iPhone 13']]]) {
    console.log('\n' + nome + ' (' + disp.viewport.width + 'x' + disp.viewport.height + ')');
    const tp = await novaPagina(browser, disp, PROF);
    await teste(nome + ': navegação inferior, chamada em cartões com botões grandes', async () => {
      await tp.goto(URL_APP + '?u=' + PROF);
      await tp.waitForSelector('.boas-vindas');
      assert.ok(await tp.isVisible('.bottomnav'));
      assert.ok(!(await tp.isVisible('.sidebar')));
      await foto(tp, nome + '-painel');
      await tp.tap('.bottomnav [data-nav="chamada"]');
      await tp.waitForSelector('.lc-linha');
      await tp.fill('#ch-data', '2026-11-18');
      await tp.dispatchEvent('#ch-data', 'change');
      await tp.waitForFunction(() => { const s = window.__FE.estado(); return s.Ch && s.Ch.data === '2026-11-18' && document.querySelectorAll('.lc-linha').length === 32; });
      const caixa = await tp.locator('.lc-linha >> nth=0 >> .b-PRESENTE').boundingBox();
      assert.ok(caixa.height >= 52, 'botão alto o bastante para toque: ' + caixa.height);
      assert.ok(caixa.width >= 60, 'largura ' + caixa.width);
      const largura = await tp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(largura <= 0, 'sem rolagem horizontal');
      await tp.tap('.lc-linha >> nth=0 >> .b-AUSENTE');
      await tp.tap('.lc-linha >> nth=1 >> .b-JUSTIFICADA');
      assert.strictEqual(Number(await tp.locator('.contador.c-A .v').textContent()), 1);
      await foto(tp, nome + '-chamada');
      await tp.tap('[data-acao="todos-presentes"]');
      await tp.tap('[data-acao="salvar"]');
      await tp.waitForFunction(() => /Salvo com sucesso/.test(document.querySelector('#ch-status').textContent), null, { timeout: 10000 });
      await tp.evaluate(() => window.scrollTo(0, 99999));
      await foto(tp, nome + '-chamada-salva');
    });
    assert.deepStrictEqual(tp.__erros, [], 'erros JS ' + nome + ': ' + tp.__erros.join(' | '));
    await tp.__contexto.close();
  }

  // ---------------------------------------------------------------- Acesso negado
  console.log('\nAcesso');
  const neg = await novaPagina(browser, { viewport: { width: 800, height: 700 } }, 'x@gmail.com');
  await teste('usuário não cadastrado vê página de acesso não autorizado', async () => {
    await neg.goto(URL_APP + '?u=intruso@gmail.com');
    assert.ok(/Acesso não autorizado/.test(await neg.textContent('body')));
    await foto(neg, '13-acesso-negado');
  });

  await browser.close();
  servidor.close();
  console.log('\n' + (total - falhas) + '/' + total + ' testes de interface passaram. Capturas em tests/capturas/');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
