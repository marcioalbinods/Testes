/* =========================================================
   LABIRINTO DOS ALGORITMOS — Teste do motor lógico (Node puro)
   Uso:  node tests/teste-motor.js
   Verifica: as 25 fases têm solução, a pontuação máxima é
   alcançável, regras de colisão, coleta, portas, lasers,
   interruptores, drones, perseguidor, energia, variáveis,
   condições SE/SENÃO e proteção contra laços infinitos.
   ========================================================= */
const path = require('path');
['levels.js', 'engine.js', 'interpreter.js', 'scoring.js'].forEach((f) => require(path.join(__dirname, '..', 'js', f)));
const LA = globalThis.LA;
const P = LA.dsl;

let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('  ✘ FALHOU: ' + m); } };

function runLevel(level, ast) {
  const results = level.variants.map((_, i) => LA.runAll(ast, level, i));
  return { results, score: LA.score(level, ast, results) };
}

console.log('▶ 25 fases com soluções de referência');
ok(LA.LEVELS.length === 25, 'existem 25 fases');
for (let w = 1; w <= 5; w++) ok(LA.levelsOfWorld(w).length === 5, `mundo ${w} tem 5 fases`);
LA.LEVELS.forEach((lv) => {
  const { results, score } = runLevel(lv, lv.solution);
  results.forEach((r, i) => ok(r.world.won, `fase ${lv.id} (${lv.title}) mapa ${i + 1}: solução vence (${r.end.msg || r.end.result})`));
  ok(score.total === 100 && score.stars === 3, `fase ${lv.id}: solução de referência vale 100 pontos e 3 estrelas (obteve ${score.total}: ${JSON.stringify(score.parts)} ${score.notes.join(' ')})`);
  // mapa consistente
  lv.variants.forEach((v, i) => {
    const m = LA.parseMap(v.map);
    ok(v.map.every((r) => r.length === m.w), `fase ${lv.id} mapa ${i + 1}: linhas do mesmo tamanho`);
  });
});
console.log(`  ${passes} verificações ok`);

console.log('▶ Movimento e colisões');
const L1 = LA.levelById(1);
let r = LA.runAll(P(['F', 'F', 'F']), L1);
ok(r.end.result === 'incomplete', 'programa curto termina sem chegar (aviso de incompleto)');
r = LA.runAll(P(['L', 'F']), L1);
ok(r.end.result === 'fail' && r.end.reason === 'wall', 'virar e avançar contra a parede = batida');
r = LA.runAll(P(['R', 'R', 'R', 'R', 'F', 'F', 'F', 'F']), L1);
ok(r.world.won, 'quatro giros voltam à direção original');
r = LA.runAll(P(['F', 'F', 'F', 'F', 'F']), L1);
ok(r.world.won && r.world.x === 5, 'execução para ao chegar no portal (comandos extras ignorados)');

console.log('▶ Baterias obrigatórias e coleta');
const L2 = LA.levelById(2);
r = LA.runAll(P(['F', 'F', 'F', 'F', 'R', 'F', 'F', 'R', 'F', 'F', 'F', 'F']), L2);
ok(r.world.collected.battery === 3, '3 baterias coletadas');
const L2b = { ...L2, variants: [{ dir: 'E', map: ['######', '#S.EB#', '######'] }] };
r = LA.runAll(P(['F', 'F']), L2b);
ok(r.end.reason === 'locked', 'portal trancado quando falta bateria');

console.log('▶ Porta e chave');
const L4 = LA.levelById(4);
r = LA.runAll(P(['L', 'L', 'F']), L4);
ok(r.end.reason === 'wall', 'parede atrás do início');
const L4door = { ...L4, variants: [{ dir: 'E', map: ['#####', '#S.DE', '#####'] }] };
r = LA.runAll(P(['F', 'F']), L4door);
ok(r.end.reason === 'door', 'porta trancada sem chave');
const L4key = { ...L4, variants: [{ dir: 'E', map: ['######', '#SKD.E', '######'] }] };
r = LA.runAll(P(['F', 'F', 'F', 'F']), L4key);
ok(r.world.won && r.world.keys === 0, 'chave abre a porta e é usada');

console.log('▶ Repetição e laços aninhados');
const L10 = LA.levelById(10);
let a = LA.analyze(L10.solution);
ok(a.nested && a.loop && a.count === 7, 'análise detecta laço aninhado e conta 7 blocos');
const flat = P([['rep', 2, ['F', 'F', 'F', 'R', 'F', 'F', 'F', 'L']]]);
let s = runLevel(L10, flat).score;
ok(s.completed && s.parts.concept === 0 && s.parts.rule === 0, 'solução sem laço aninhado conclui mas perde conceito e regra');

console.log('▶ Condições SE / SENÃO e variantes');
const L12 = LA.levelById(12);
s = runLevel(L12, P(['F', 'F', 'F', 'F', 'F'])).score;
ok(!s.completed, 'programa fixo não vence os 2 mapas');
const L14 = LA.levelById(14);
s = runLevel(L14, P(['F', 'F', 'F', ['if', 'pathL', ['L']], ['if', 'pathR', ['R']], 'F', 'F'])).score;
ok(s.completed && s.stars >= 1, 'solução alternativa com dois SE também vence');
ok(s.parts.concept === 0, 'mas sem SENÃO não ganha os pontos de conceito');

console.log('▶ Lasers, interruptores, drones e perseguidor');
const L13 = LA.levelById(13);
r = LA.runAll(P(['F', 'F']), L13);
ok(r.end.reason === 'laser', 'entrar em laser ligado = choque');
r = LA.runAll(P(['F', 'W', 'F', 'F', 'F', 'W', 'W', 'F', 'F', 'F']), L13);
ok(r.world.won, 'esperar no tempo certo também vence (sequência alternativa)');
const L23 = LA.levelById(23);
r = LA.runAll(P(['L', 'F']), L23);
ok(r.end.reason === 'laser', 'laser estático bloqueia antes do interruptor');
const L25 = LA.levelById(25);
const w25 = new LA.World(L25, 0);
const dronePos = [];
for (let i = 0; i < 5; i++) { w25.wait(); dronePos.push(w25.drones[0].y); }
ok(JSON.stringify(dronePos) === '[3,4,3,2,3]', 'drone vai e volta no trilho');
const L22 = LA.levelById(22);
r = LA.runAll(P(['L', 'L', 'L']), L22);
ok(r.end.reason === 'caught', 'perseguidor pega o Byte parado 3 tempos');
r = LA.runAll(P(['L', 'R', 'F', 'F']), L22);
ok(!r.world.failed || r.world.failed.reason !== 'caught', 'dois giros seguidos ainda são permitidos');
r = LA.runAll(P(['F', 'L', 'L', 'F']), L22);
ok(r.end.reason === 'caught', 'meia-volta em direção ao perseguidor = pego');

console.log('▶ Energia');
const L16 = LA.levelById(16);
r = LA.runAll(P(['L', 'F', 'F', 'F', 'F', 'F', 'F']), L16);
ok(r.end.reason === 'energy', 'caminho sem baterias esgota a energia');
r = LA.runAll(L16.solution, L16);
ok(r.world.energy === 2, 'solução chega com 2 de energia');
r = LA.runAll(P([['if', ['energy', '<', 4], ['F']], ['if', ['energy', '>', 2], ['STOP']]]), L16);
ok(r.end.result === 'incomplete' && r.world.y === 2, 'sensor de energia e bloco PARAR funcionam');

console.log('▶ Variáveis');
const L17 = LA.levelById(17);
s = runLevel(L17, P([['until', ['F']]])).score;
ok(!s.completed, 'sem variável o portal não abre');
r = LA.runAll(P([['set', 'cristais', 0], ['until', [['if', ['item', 'crystal'], [['add', 'cristais', 2]]], 'F']]]), L17);
ok(r.end.reason === 'portalvar', 'contagem errada é detectada pelo portal');
r = LA.runAll(P([['set', 'cristais', 0], ['until', [['if', ['item', 'crystal'], [['add', 'cristais', 1]]], 'F']], ['sub', 'cristais', 1]]), L17);
ok(r.world.won && r.world.vars.cristais === 4, 'variável conta 4 cristais (comando após a vitória não executa)');
r = LA.runAll(P([['set', 'n', 3], ['while', ['var', 'n', '>', 0], ['F', ['sub', 'n', 1]]]]), L17);
ok(r.world.x === 4 && r.world.vars.n === 0, 'repetir enquanto com variável');

console.log('▶ Proteção contra laços infinitos');
r = LA.runAll(P([['until', [['if', 'door', ['F']]]]]), L1);
ok(r.end.reason === 'loop', 'repetição sem ação é interrompida');
r = LA.runAll(P([['until', ['L']]]), L1);
ok(r.end.reason === 'loop', 'giro infinito é interrompido');
r = LA.runAll(P([['until', []]]), L1);
ok(r.end.reason === 'loop', 'repetir vazio é detectado');

console.log('▶ Pontuação');
s = runLevel(L1, P(['F', 'L', 'R', 'F', 'F', 'F'])).score;
ok(s.completed && s.parts.efficiency === 16 && s.parts.rule === 0 && s.total === 86 && s.stars === 2, `solução com blocos extras: 86 pontos e 2 estrelas (obteve ${s.total})`);
const L5 = LA.levelById(5);
s = runLevel(L5, L5.solution).score;
ok(s.parts.items === 15, 'itens completos = 15 pontos');

console.log(`\n${fails === 0 ? '✅' : '❌'} ${passes} verificações passaram, ${fails} falharam.`);
process.exit(fails ? 1 : 0);
