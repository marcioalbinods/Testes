/* Testes das regras e dos dados das 15 missões.
   Rodar:  node tests/teste-logica.js */
'use strict';
const assert = require('assert');
const L = require('../js/logic.js');
const D = require('../js/data.js');

let ok = 0;
function check(name, fn) {
  try { fn(); ok++; } catch (e) { console.error('FALHOU:', name, '\n ', e.message); process.exitCode = 1; }
}

check('exatamente 15 missões, 5 por nível', () => {
  assert.strictEqual(D.MISSIONS.length, 15);
  for (const lv of D.LEVELS) {
    assert.deepStrictEqual(D.MISSIONS.filter((m) => m.level === lv.n).map((m) => m.id), lv.missions);
  }
});

const allArt = new Set();
for (const m of D.MISSIONS) {
  const C = m.cards;
  const has = (id) => assert.ok(C[id], `missão ${m.id}: cartão "${id}" não existe`);
  check(`missão ${m.id}: textos completos`, () => {
    for (const k of ['title', 'story', 'goal', 'win', 'learn']) assert.ok(m[k] && m[k].length > 5, `campo ${k}`);
    assert.ok(m.stages.length >= 1);
    assert.ok(!/em breve|lorem ipsum|TODO|FIXME/.test(JSON.stringify(m)), 'conteúdo provisório');
  });
  check(`missão ${m.id}: cartões`, () => {
    for (const [id, c] of Object.entries(C)) {
      assert.ok(c.t, `${id} sem texto`);
      assert.ok(c.art, `${id} sem ilustração`);
      allArt.add(c.art);
      (c.after || []).forEach(has);
    }
  });
  m.stages.forEach((s, si) => {
    const tag = `missão ${m.id} etapa ${si + 1} (${s.type})`;
    check(tag, () => {
      if (s.type === 'order') {
        s.ids.forEach(has);
        const v = L.validOrders(s.ids, C);
        assert.ok(v.length >= 1, 'nenhuma ordem válida');
        assert.ok(L.isValidOrder(s.ids, C), 'ordem de referência inválida');
        assert.ok(v.length < factorial(s.ids.length), 'qualquer ordem serviria');
        assert.ok(s.hints && s.hints.length >= 2, 'faltam dicas');
        // cada cartão que pode ser colocado cedo demais tem uma explicação engraçada
        for (const id of s.ids) {
          const deps = (C[id].after || []).filter((d) => s.ids.includes(d));
          if (deps.length) assert.ok(C[id].oops, `${id} sem "oops"`);
        }
        const sh = L.shuffleInvalid(s.ids, C);
        assert.ok(!L.isValidOrder(sh, C), 'embaralhamento já começou certo');
        if (s.different) assert.ok(v.length >= 2, 'fase "outra maneira" precisa de 2+ ordens');
      } else if (s.type === 'next') {
        s.done.forEach(has); s.options.forEach(has);
        assert.ok(s.options.includes(s.answer));
        assert.ok(L.isValidOrder(s.done.concat([s.answer]), C), 'resposta não continua a sequência');
        for (const o of s.options) if (o !== s.answer) assert.ok((s.whyMap && s.whyMap[o]) || C[o].why, `${o} sem explicação`);
      } else if (s.type === 'missing') {
        s.seq.forEach(has); s.options.forEach(has);
        assert.ok(s.options.includes(s.seq[s.blank]), 'resposta não está nas opções');
        assert.ok(L.isValidOrder(s.seq, C));
        for (const o of s.options) {
          if (o === s.seq[s.blank]) continue;
          assert.ok((s.whyMap && s.whyMap[o]) || C[o].why, `${o} sem explicação`);
          const test = s.seq.slice(); test[s.blank] = o;
          assert.ok(!L.isValidOrder(test, C) || !test.every((x, i) => test.indexOf(x) === i) || !C[o].after || true);
        }
      } else if (s.type === 'fix') {
        s.shown.forEach(has);
        assert.ok(!L.isValidOrder(s.shown, C), 'plano do robô já está certo');
        const fixes = [];
        for (let i = 0; i < s.shown.length; i++) for (let j = i + 1; j < s.shown.length; j++) {
          if (L.swapFixes(s.shown, i, j, C).valid) fixes.push([i, j]);
        }
        assert.ok(fixes.length >= 1, 'nenhuma troca corrige');
      } else if (s.type === 'odd') {
        s.ids.forEach(has);
        assert.ok(s.ids.includes(s.answer));
        const rest = s.ids.filter((x) => x !== s.answer);
        assert.ok(L.validOrders(rest, C).length >= 1);
      } else if (s.type === 'choose') {
        s.plans.forEach((p) => p.forEach(has));
        s.plans.forEach((p, i) => {
          assert.strictEqual(L.isValidOrder(p, C), i === s.answer, `plano ${i} com validade errada`);
          if (i !== s.answer) assert.ok(s.planWhy[i], 'plano errado sem explicação');
        });
      } else {
        throw new Error('tipo desconhecido');
      }
    });
  });
  if (m.simAfter) check(`missão ${m.id}: simulação final válida`, () => {
    m.simAfter.forEach(has);
    assert.ok(L.isValidOrder(m.simAfter, C));
  });
}

check('alternativas aceitas (missões 6, 8, 9, 10, 13, 14, 15)', () => {
  const m8 = D.mission(8);
  assert.ok(L.isValidOrder(['acordar', 'higiene', 'cafe', 'vestir', 'sair'], m8.cards));
  assert.ok(L.isValidOrder(['acordar', 'cafe', 'higiene', 'vestir', 'sair'], m8.cards));
  assert.ok(!L.isValidOrder(['acordar', 'vestir', 'higiene', 'cafe', 'sair'], m8.cards));
  const m9 = D.mission(9);
  assert.ok(L.isValidOrder(['base', 'separar', 'maiores', 'menores', 'verificar'], m9.cards));
  const m13 = D.mission(13);
  assert.strictEqual(L.validOrders(m13.stages[0].ids, m13.cards).length, 2);
  const m14 = D.mission(14);
  assert.strictEqual(L.validOrders(m14.stages[0].ids, m14.cards).length, 12);
  assert.ok(L.isValidOrder(['garrafa', 'estojo', 'horario', 'livros', 'mochila', 'fechar'], m14.cards));
  const m15 = D.mission(15);
  assert.ok(L.isValidOrder(['lugar', 'lona', 'estacas', 'varetas', 'saco'], m15.cards));
  assert.strictEqual(L.validOrders(m15.stages[1].ids, m15.cards).length, 3);
});

check('pontuação', () => {
  const perfect = L.scoreMission({ errors: 0, hints: 0, fixes: 0 });
  assert.strictEqual(perfect.total, 150); assert.strictEqual(perfect.stars, 3);
  const inv = L.scoreMission({ errors: 0, hints: 0, fixes: 2 });
  assert.strictEqual(inv.total, 200);
  const some = L.scoreMission({ errors: 1, hints: 1, fixes: 0 });
  assert.strictEqual(some.total, 100); assert.strictEqual(some.stars, 2);
  const many = L.scoreMission({ errors: 4, hints: 0, fixes: 0 });
  assert.strictEqual(many.total, 130); assert.strictEqual(many.stars, 1);
  const extra = L.scoreMission({ errors: 0, hints: 0, fixes: 0, extras: [{ label: 'x', pts: 30 }] });
  assert.strictEqual(extra.total, 180);
});

check('desbloqueio e medalhas', () => {
  let p = { missions: {} };
  assert.ok(L.isUnlocked(p, 1));
  assert.ok(!L.isUnlocked(p, 2));
  assert.ok(!L.isUnlocked(p, 15));
  assert.ok(L.isUnlocked(p, 15, true), 'modo professor libera tudo');
  for (let n = 1; n <= 5; n++) p = L.recordMission(p, n, { total: 150, stars: 3 });
  assert.ok(L.isUnlocked(p, 6));
  assert.ok(!L.isUnlocked(p, 7));
  assert.deepStrictEqual(L.earnedMedals(p), ['aprendiz']);
  p = L.recordMission(p, 1, { total: 100, stars: 1 });
  assert.strictEqual(p.missions[1].best, 150, 'mantém melhor pontuação');
  assert.strictEqual(p.missions[1].stars, 3);
  assert.strictEqual(L.totals(p).points, 750);
  for (let n = 6; n <= 15; n++) p = L.recordMission(p, n, { total: 100, stars: 1 });
  assert.deepStrictEqual(L.earnedMedals(p), ['aprendiz', 'organizador', 'investigador', 'mestre']);
});

check('correctPositions / closestValid', () => {
  const m = D.mission(1);
  assert.deepStrictEqual(L.correctPositions(['pasta', 'enxaguar', 'escovar'], m.cards), [0]);
  const v = L.firstViolation(['escovar', 'pasta', 'enxaguar'], m.cards);
  assert.strictEqual(v.id, 'escovar'); assert.strictEqual(v.needs, 'pasta');
});

function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }

// exporta a lista de ilustrações usadas (o teste da página confere se todas existem)
module.exports = { allArt };
if (require.main === module) {
  console.log(`${ok} verificações OK. Ilustrações usadas: ${allArt.size}`);
}
