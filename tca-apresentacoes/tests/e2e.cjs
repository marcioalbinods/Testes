// Teste de ponta a ponta no navegador: node tests/e2e.cjs <pasta-de-saida> <caminho/para/index.html>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2];
const URL = 'file://' + path.resolve(process.argv[3]);
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = []; const external = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u); });
  await page.goto(URL);
  await page.screenshot({ path: OUT + '/01-step1.png', fullPage: false });
  // tenta avançar vazio -> validação
  await page.getByRole('button', { name: 'Avançar' }).click();
  const alerts = await page.locator('[role=alert]').count();
  console.log('alertas validação etapa1:', alerts);
  await page.fill('#school', 'EMEF Vila Verde');
  await page.getByRole('button', { name: '8º C' }).click();
  await page.getByRole('button', { name: /Tarde/ }).click();
  await page.fill('#groupName', 'Guardiões do Rio');
  const names = ['Júlia Santos', 'Pedro Lima', 'Rafaela Souza', 'Apagar Depois', 'Miguel Costa'];
  for (let i = 0; i < names.length; i++) {
    if (i > 0) await page.getByRole('button', { name: 'Adicionar integrante' }).click();
    await page.locator('input[id^=member-]').nth(i).fill(names[i]);
  }
  await page.getByRole('button', { name: 'Remover integrante 4' }).click();
  console.log('integrantes:', await page.locator('input[id^=member-]').count());
  await page.getByRole('button', { name: 'Avançar' }).click();
  // etapa 2
  await page.fill('#theme', 'a poluicao do corrego do nosso bairro');
  await page.fill('#problem', 'O córrego que passa perto da escola está cheio de lixo e esgoto. Queremos investigar por que isso acontece e como afeta os moradores.');
  await page.fill('#whyChosen', 'nos escolhemos esse tema pq passamos todo dia pelo corrego e o cheiro e muito forte. tambem vimos ratos e mosquitos.');
  await page.fill('#whyImportant', 'Esse assunto é importante porque a água poluída transmite doenças como leptospirose e diarreia. Além disso a poluição mata os peixes e as plantas do córrego.');
  await page.fill('#affected', 'moradores das casas perto do córrego, crianças que brincam na rua, idosos e animais');
  await page.getByRole('button', { name: 'No bairro' }).click();
  await page.getByRole('button', { name: 'Na cidade' }).click();
  await page.screenshot({ path: OUT + '/02-step2.png', fullPage: true });
  await page.getByRole('button', { name: 'Avançar' }).click();
  // etapa 3
  const discs = [
    'Descobrimos que 40% do esgoto da cidade não é tratado, segundo a prefeitura.',
    'Muitas pessoas jogam sofás, pneus e garrafas no córrego.',
    'O esgoto de algumas casas vai direto para o córrego porque não tem rede de coleta.',
    'Nós descobrimos que muitas pessoas jogam pneus, sofás e garrafas dentro do córrego.',
    'Quando chove forte o córrego transborda e o lixo entra nas casas.',
    'A leptospirose é transmitida pela urina do rato misturada na água da enchente.',
    'Existe um projeto da prefeitura de limpeza, mas ele acontece só uma vez por ano.',
  ];
  for (const d of discs) {
    await page.fill('#discovery-draft', d);
    await page.getByRole('button', { name: 'Adicionar descoberta' }).click();
    if (await page.getByRole('button', { name: 'Adicionar mesmo assim' }).count()) {
      console.log('aviso de repetição apareceu para:', d.slice(0, 40));
      await page.getByRole('button', { name: 'Adicionar mesmo assim' }).click();
    }
  }
  // editar e excluir
  await page.getByRole('button', { name: 'Excluir descoberta 7' }).click();
  await page.getByRole('button', { name: 'Editar descoberta 2' }).click();
  await page.locator('textarea[id^=edit-]').fill('Muitas pessoas jogam sofás, pneus, garrafas e entulho no córrego.');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.fill('#causes', 'Falta de rede de esgoto, descarte irregular de lixo, falta de fiscalização e falta de informação dos moradores');
  await page.fill('#consequences', 'Doenças como leptospirose e dengue. Mau cheiro. Enchentes nas casas. Morte dos peixes.');
  await page.fill('#dataText', 'Segundo a prefeitura, 40% do esgoto da cidade não é tratado.');
  for (const [v, l] of [['40', 'do esgoto da cidade não é tratado'], ['65', 'dos moradores entrevistados já viram lixo no córrego'], ['30', 'dos entrevistados já tiveram a casa invadida pela enchente']]) {
    await page.getByRole('button', { name: 'Adicionar número' }).click();
    await page.locator('input[id^=dv-]').last().fill(v);
    await page.locator('input[id^=dl-]').last().fill(l);
    await page.locator('input[id^=do-]').last().fill('Entrevista do grupo com 40 moradores');
  }
  await page.fill('#surprising', 'Ficamos surpresos com a quantidade de esgoto sem tratamento. Também não sabíamos que a leptospirose podia matar.');
  await page.fill('#learned', 'Aprendemos que o córrego faz parte de uma bacia hidrográfica e que o lixo daqui chega até o rio principal da cidade.');
  await page.fill('#conclusion', 'A gente acha que o problema só vai melhorar se a prefeitura e os moradores trabalharem juntos.');
  await page.screenshot({ path: OUT + '/03-step3.png', fullPage: true });
  await page.getByRole('button', { name: 'Avançar' }).click();
  // etapa 4 (já existe 1 fonte vazia)
  const srcs = [
    ['Prefeitura Municipal', 'Plano de saneamento básico', 'www.prefeitura.sp.gov.br/saneamento', 'Secretaria de Obras', 'Dados sobre esgoto tratado na cidade'],
    ['Fiocruz', 'Leptospirose: sintomas e prevenção', 'https://portal.fiocruz.br/leptospirose', '', 'Como a doença é transmitida'],
    ['Blog do Bairro', '', '', '', 'Fotos antigas do córrego limpo'],
  ];
  for (let i = 0; i < srcs.length; i++) {
    if (i > 0) await page.getByRole('button', { name: /Adicionar outra fonte/ }).click();
    const ids = ['site', 'title', 'link', 'author'];
    for (let k = 0; k < 4; k++) await page.locator(`input[id^=src-${ids[k]}-]`).nth(i).fill(srcs[i][k]);
    await page.locator('textarea[id^=src-found-]').nth(i).fill(srcs[i][4]);
  }
  await page.screenshot({ path: OUT + '/04-step4.png', fullPage: true });
  await page.getByRole('button', { name: 'Avançar' }).click();
  // etapa 5
  await page.fill('#change', 'Queremos que os moradores parem de jogar lixo no córrego e cobrem a prefeitura.');
  await page.fill('#intervention', 'Um mutirão de conscientização com fotos do córrego, um podcast com moradores e cartazes no bairro.');
  await page.fill('#objective', 'Mostrar para os moradores como o lixo no córrego prejudica a saúde de todos.');
  await page.fill('#audience', 'Moradores do bairro e estudantes da escola');
  await page.fill('#how', 'Tirar fotos do córrego\nEntrevistar moradores para o podcast\nFazer uma exposição de fotos na escola\nEntregar um abaixo-assinado para a prefeitura');
  await page.fill('#resources', 'celular, cartolina, impressão das fotos, espaço na escola');
  await page.fill('#results', 'Esperamos que os moradores se mobilizem e que a prefeitura faça a limpeza com mais frequência.');
  await page.getByRole('button', { name: /Fotografia/ }).click();
  await page.getByRole('button', { name: /Podcast/ }).click();
  await page.getByRole('button', { name: /Cartazes e materiais/ }).click();
  await page.fill('#mediaWhy', 'As fotos mostram a realidade e chamam atenção. O podcast deixa os moradores contarem suas histórias.');
  await page.fill('#mediaHow', 'As fotos vão ficar expostas no pátio e o podcast vai ser compartilhado no grupo de mensagens do bairro.');
  await page.fill('#mediaMessage', 'O córrego é de todos: cuidar dele é cuidar da nossa saúde!');
  await page.fill('#mediaResult', 'Que mais pessoas assinem o abaixo-assinado.');
  await page.screenshot({ path: OUT + '/05-step5.png', fullPage: true });
  await page.getByRole('button', { name: 'Avançar' }).click();
  await page.screenshot({ path: OUT + '/06-step6.png', fullPage: true });
  await page.getByRole('button', { name: 'GERAR APRESENTAÇÃO DO TCA' }).click();
  await page.waitForSelector('text=Parabéns! Nossa apresentação do TCA está pronta!');
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '/07-final.png', fullPage: true });
  console.log('slides:', await page.locator('button[aria-label^="Ver slide"]').count());
  // downloads
  for (const [label, file] of [['Baixar PowerPoint', 'deck.pptx'], ['Baixar PDF', 'slides.pdf'], ['Baixar guia de apresentação', 'guia.pdf']]) {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.getByRole('button', { name: new RegExp(label) }).first().click()]);
    await dl.saveAs(path.join(OUT, file));
    console.log('download', file, dl.suggestedFilename(), fs.statSync(path.join(OUT, file)).size);
    await page.waitForTimeout(300);
  }
  // editor
  await page.getByRole('button', { name: 'Editar os slides' }).click();
  await page.locator('nav[aria-label=Slides] button').nth(1).click();
  await page.fill('#ed-title', 'Nosso tema: o córrego');
  await page.screenshot({ path: OUT + '/08-editor.png', fullPage: false });
  await page.getByRole('button', { name: 'Voltar para a apresentação' }).click();
  await page.getByRole('button', { name: 'Ver guia na tela' }).click();
  await page.screenshot({ path: OUT + '/09-guia.png', fullPage: false });
  // persistência
  await page.waitForTimeout(900);
  await page.reload();
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/reload.png' });
  console.log('após recarregar, guia?', await page.locator('text=Guia de apresentação do grupo').count() > 0, 'título editado?', await page.locator('h2:has-text("Nosso tema: o córrego")').count());
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  // resumo pdf
  await page.getByRole('button', { name: 'Editar a pesquisa' }).click();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Baixar resumo/ }).click()]);
  await dl.saveAs(path.join(OUT, 'resumo.pdf'));
  console.log('download resumo', fs.statSync(path.join(OUT, 'resumo.pdf')).size);
  // responsivo
  for (const [w, h, name] of [[820, 1180, 'tablet'], [390, 844, 'phone']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.getByRole('button', { name: 'Ver apresentação' }).click().catch(() => {});
    await page.waitForTimeout(300);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(name, 'scrollWidth', sw, 'viewport', w);
    await page.screenshot({ path: `${OUT}/10-${name}-final.png`, fullPage: false });
    await page.getByRole('button', { name: 'Editar a pesquisa' }).click();
    await page.locator('ol button').nth(2).click();
    await page.waitForTimeout(200);
    console.log(name, 'scrollWidth etapa3', await page.evaluate(() => document.documentElement.scrollWidth));
    await page.screenshot({ path: `${OUT}/11-${name}-step3.png`, fullPage: false });
    await page.locator('ol button').nth(5).click();
  }
  console.log('ERROS:', errors);
  console.log('REQUISIÇÕES EXTERNAS:', external);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
