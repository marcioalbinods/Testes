// Teste do envio ao professor (receptor simulado). Sirva a pasta ../tca em http://127.0.0.1:8765 e rode: node tests/e2e-envio.cjs <pasta-de-saida>
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let body = null;
  await page.route('**/config.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ envioUrl: 'https://script.google.com/macros/s/AKfyTESTE123/exec' }) }));
  await page.route('https://script.google.com/**', async (r) => { body = JSON.parse(r.request().postData()); await r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify({ ok: true, pasta: 'https://drive.google.com/x' }) }); });
  await page.goto('http://127.0.0.1:8765/');
  await page.getByRole('button', { name: /Quer ver um exemplo/ }).click();
  await page.locator('ol button').nth(5).click();
  await page.getByRole('button', { name: 'GERAR APRESENTAÇÃO DO TCA' }).click();
  await page.waitForSelector('text=Enviar ao professor');
  const btn = page.getByRole('button', { name: 'Enviar ao professor', exact: true });
  console.log('desabilitado antes do aceite:', await btn.isDisabled());
  await page.getByText('Conferimos as informações').click();
  await btn.click();
  await page.waitForSelector('text=Trabalho enviado ao professor!', { timeout: 60000 });
  await page.locator('#send-title').scrollIntoViewIfNeeded();
  await page.screenshot({ path: process.argv[2] + '/send.png' });
  console.log('turma', body.turma, '| arquivos', body.arquivos.map((a) => a.name + ' ' + Math.round(a.data.length / 1024) + 'KB'));
  console.log('colunas', Object.keys(body.campos).length, '| integrantes:', JSON.stringify(body.campos.Integrantes), '| orientador:', body.campos['Prof. Orientador']);
  console.log('enviado agora:', await page.locator('text=Enviado em').count());
  console.log('ERROS', errors);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
