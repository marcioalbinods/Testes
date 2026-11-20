#!/usr/bin/env node
/*
 * Tinkercad Master — gerador do código de registro (uso do professor Claude).
 *
 * Uso:   node tools/gerar-codigo.js <fase> <resultado>
 *        resultado: A = APROVADO · O = APROVADO COM OBSERVAÇÕES · R = PRECISA REFAZER
 * Ex.:   node tools/gerar-codigo.js 12 A   →  TM-012-A-XXXX
 *
 * O algoritmo é o mesmo de js/core.js (TM.makeCode); o app confere o código digitado.
 */
function codigo(fase, resultado) {
  let h = 0x811c9dc5;
  const s = 'TINKERCAD-MASTER|' + fase + '|' + resultado + '|formas-basicas';
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) { c += A[h % 32]; h = Math.floor(h / 32); }
  return 'TM-' + String(fase).padStart(3, '0') + '-' + resultado + '-' + c;
}
const [fase, res] = process.argv.slice(2);
const n = parseInt(fase, 10);
if (!(n >= 1 && n <= 100) || !/^[AOR]$/.test(res || '')) {
  console.error('Uso: node tools/gerar-codigo.js <fase 1-100> <A|O|R>');
  process.exit(1);
}
console.log(codigo(n, res));
