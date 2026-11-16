/**
 * Gera a pasta "instalacao/" com o mínimo de arquivos para colar no Google Apps Script:
 *  - Code.gs: todos os arquivos .gs de src/ concatenados (o Apps Script aceita tudo num só arquivo);
 *  - Index.html, Styles.html, JavaScript.html, Mensagem.html e appsscript.json (cópias).
 * Executar: node ferramentas/gerar-pacote.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'src');
const dest = path.join(__dirname, '..', 'instalacao');
fs.mkdirSync(dest, { recursive: true });
const ordem = ['Code', 'Util', 'Database', 'Security', 'Audit', 'Students', 'Attendance', 'Reports', 'Export', 'Backup'];
const extras = fs.readdirSync(src).filter(f => f.endsWith('.gs')).map(f => f.slice(0, -3)).filter(n => !ordem.includes(n));
if (extras.length) throw new Error('Arquivos .gs fora da ordem definida: ' + extras.join(', '));
let saida = '/**\n * FREQUÊNCIA ESCOLAR — PACOTE DE INSTALAÇÃO (arquivo único de servidor)\n' +
  ' * Gerado automaticamente a partir de src/*.gs — não edite aqui; edite src/ e gere de novo.\n */\n';
for (const n of ordem) {
  saida += '\n\n// ' + '='.repeat(76) + '\n// ARQUIVO ORIGINAL: ' + n + '.gs\n// ' + '='.repeat(76) + '\n\n';
  saida += fs.readFileSync(path.join(src, n + '.gs'), 'utf8');
}
fs.writeFileSync(path.join(dest, 'Code.gs'), saida);
for (const f of ['Index.html', 'Styles.html', 'JavaScript.html', 'Mensagem.html', 'appsscript.json']) {
  fs.copyFileSync(path.join(src, f), path.join(dest, f));
}
console.log('Pacote gerado em instalacao/ (' + fs.readdirSync(dest).length + ' arquivos).');
