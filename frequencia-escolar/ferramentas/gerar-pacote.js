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
const ordem = ['Code', 'Util', 'Database', 'Security', 'Audit', 'Students', 'Attendance', 'Reports', 'Export', 'Backup', 'Consulta'];
const extras = fs.readdirSync(src).filter(f => f.endsWith('.gs')).map(f => f.slice(0, -3)).filter(n => !ordem.includes(n));
if (extras.length) throw new Error('Arquivos .gs fora da ordem definida: ' + extras.join(', '));
let saida = '/**\n * FREQUÊNCIA ESCOLAR — PACOTE DE INSTALAÇÃO (sistema completo em um único arquivo)\n' +
  ' * Gerado automaticamente a partir de src/ — não edite aqui; edite src/ e gere de novo.\n' +
  ' * Este arquivo sozinho basta: as telas HTML estão embutidas no final (HTML_EMBUTIDO_).\n */\n';
for (const n of ordem) {
  saida += '\n\n// ' + '='.repeat(76) + '\n// ARQUIVO ORIGINAL: ' + n + '.gs\n// ' + '='.repeat(76) + '\n\n';
  saida += fs.readFileSync(path.join(src, n + '.gs'), 'utf8');
}
// Dados da escola (turmas e estudantes): arquivo JSON PRIVADO, fora do repositório.
//   node ferramentas/gerar-pacote.js --dados /caminho/escola.json --saida /caminho/Code.gs
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : ''; };
const arqDados = arg('--dados');
const html = {};
for (const n of ['Index', 'Styles', 'JavaScript', 'ConsultaPublica']) html[n] = fs.readFileSync(path.join(src, n + '.html'), 'utf8');
saida += '\n\n// ' + '='.repeat(76) + '\n// TELAS HTML EMBUTIDAS (Index, Styles, JavaScript, ConsultaPublica)\n// ' + '='.repeat(76) + '\n\n';
saida += 'var HTML_EMBUTIDO_ = {\n' + Object.keys(html).map(k => '  ' + k + ': ' + JSON.stringify(html[k]).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')).join(',\n') + '\n};\n';
if (arqDados) {
  const dados = JSON.parse(fs.readFileSync(arqDados, 'utf8'));
  if (!Array.isArray(dados.turmas) || !dados.turmas.length) throw new Error('JSON sem turmas.');
  dados.turmas.forEach(t => {
    if (!t.nome || !Array.isArray(t.estudantes) || !t.estudantes.length) throw new Error('Turma inválida: ' + JSON.stringify(t.nome));
    t.estudantes = t.estudantes.map(n => String(n).replace(/\s+/g, ' ').trim()).filter(Boolean);
    const rep = t.estudantes.filter((n, i) => t.estudantes.indexOf(n) !== i);
    if (rep.length) throw new Error('Nome repetido em ' + t.nome + ': ' + rep.join(', '));
  });
  saida += '\n\n// ' + '='.repeat(76) + '\n// DADOS DA ESCOLA (turmas e estudantes iniciais) — CONFIDENCIAL: não publique este arquivo\n// ' + '='.repeat(76) + '\n\n';
  saida += 'var DADOS_ESCOLA_ = ' + JSON.stringify(dados, null, 1) + ';\n';
  const saidaPath = arg('--saida');
  if (!saidaPath) throw new Error('Com --dados, informe --saida (fora do repositório).');
  if (path.resolve(saidaPath).startsWith(path.resolve(__dirname, '..'))) throw new Error('Por privacidade, --saida deve ficar fora do repositório.');
  fs.writeFileSync(saidaPath, saida);
  const total = dados.turmas.reduce((a, t) => a + t.estudantes.length, 0);
  console.log('Arquivo personalizado gerado: ' + saidaPath + ' (' + dados.turmas.length + ' turmas, ' + total + ' estudantes, ' + Math.round(saida.length / 1024) + ' KB)');
} else {
  for (const f of fs.readdirSync(dest)) if (/\.(html|gs)$/.test(f)) fs.unlinkSync(path.join(dest, f));
  fs.writeFileSync(path.join(dest, 'Code.gs'), saida);
  fs.copyFileSync(path.join(src, 'appsscript.json'), path.join(dest, 'appsscript.json'));
  console.log('Pacote gerado: instalacao/Code.gs (' + Math.round(saida.length / 1024) + ' KB) + appsscript.json');
}
