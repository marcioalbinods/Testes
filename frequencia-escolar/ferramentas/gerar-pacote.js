/**
 * Gera a pasta "instalacao/" com o sistema num ÚNICO arquivo para colar no Google Apps Script:
 *  - Code.gs: todos os arquivos .gs de src/ concatenados + as telas HTML (Index, Styles,
 *    JavaScript) embutidas como texto em HTML_EMBUTIDO_;
 *  - appsscript.json (opcional).
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
let saida = '/**\n * FREQUÊNCIA ESCOLAR — PACOTE DE INSTALAÇÃO (sistema completo em um único arquivo)\n' +
  ' * Gerado automaticamente a partir de src/ — não edite aqui; edite src/ e gere de novo.\n' +
  ' * Este arquivo sozinho basta: as telas HTML estão embutidas no final (HTML_EMBUTIDO_).\n */\n';
for (const n of ordem) {
  saida += '\n\n// ' + '='.repeat(76) + '\n// ARQUIVO ORIGINAL: ' + n + '.gs\n// ' + '='.repeat(76) + '\n\n';
  saida += fs.readFileSync(path.join(src, n + '.gs'), 'utf8');
}
const html = {};
for (const n of ['Index', 'Styles', 'JavaScript']) html[n] = fs.readFileSync(path.join(src, n + '.html'), 'utf8');
saida += '\n\n// ' + '='.repeat(76) + '\n// TELAS HTML EMBUTIDAS (Index.html, Styles.html, JavaScript.html)\n// ' + '='.repeat(76) + '\n\n';
saida += 'var HTML_EMBUTIDO_ = {\n' + Object.keys(html).map(k => '  ' + k + ': ' + JSON.stringify(html[k]).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')).join(',\n') + '\n};\n';
for (const f of fs.readdirSync(dest)) if (/\.(html|gs)$/.test(f)) fs.unlinkSync(path.join(dest, f));
fs.writeFileSync(path.join(dest, 'Code.gs'), saida);
fs.copyFileSync(path.join(src, 'appsscript.json'), path.join(dest, 'appsscript.json'));
console.log('Pacote gerado: instalacao/Code.gs (' + Math.round(saida.length / 1024) + ' KB) + appsscript.json');
