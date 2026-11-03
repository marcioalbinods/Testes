/* =========================================================
   LABIRINTO DOS ALGORITMOS — Pontuação (até 100 por fase)
     40 conclusão · 20 eficiência · 15 conceito · 15 itens · 10 regra da fase
   Não há desconto por tentativas: só vale a melhor pontuação.
   ========================================================= */
(function (LA) {
  'use strict';

  var CONCEPT_TEXT = {
    sequence: 'sequência de comandos',
    loop: 'bloco de REPETIÇÃO',
    nested: 'REPETIR dentro de REPETIR',
    if: 'bloco SE (condição)',
    ifelse: 'bloco SE / SENÃO',
    variable: 'VARIÁVEL (criar e alterar)'
  };
  LA.CONCEPT_TEXT = CONCEPT_TEXT;

  /* Quantos blocos a solução de referência usa (eficiência ideal). */
  LA.optimalBlocks = function (level) {
    if (level._opt == null) level._opt = level.solution ? LA.countBlocks(level.solution) : 99;
    return level._opt;
  };
  /* Quantos tempos a solução de referência gasta (por variante). */
  LA.optimalTicks = function (level) {
    if (level._optTicks == null) {
      var t = 0;
      if (level.solution) for (var i = 0; i < level.variants.length; i++) t = Math.max(t, LA.runAll(level.solution, level, i).world.tick);
      level._optTicks = t;
    }
    return level._optTicks;
  };

  function efficiencyPoints(blocks, opt) {
    if (blocks <= opt) return 20;
    if (blocks <= opt + 2) return 16;
    if (blocks <= Math.ceil(opt * 1.5)) return 12;
    if (blocks <= opt * 2) return 8;
    return 4;
  }

  /* results: [{world, end}] um por mapa testado; ast = programa */
  LA.score = function (level, ast, results) {
    var info = LA.analyze(ast);
    var completed = results.length === level.variants.length && results.every(function (r) { return r.world.won; });
    var parts = { completion: 0, efficiency: 0, concept: 0, items: 0, rule: 0 };
    var notes = [];
    if (!completed) return { total: 0, stars: 0, completed: false, parts: parts, notes: notes, blocks: info.count };

    parts.completion = 40;

    // eficiência
    var opt = LA.optimalBlocks(level);
    parts.efficiency = efficiencyPoints(info.count, opt);
    if (parts.efficiency < 20) notes.push('Dá para resolver com menos blocos (o desafio ideal usa ' + opt + '). Você usou ' + info.count + '.');

    // conceito
    var cs = level.concepts || ['sequence'];
    var ok = 0, missing = [];
    cs.forEach(function (c) {
      var has = c === 'sequence' ? true : !!info[c];
      if (has) ok++; else missing.push(CONCEPT_TEXT[c] || c);
    });
    parts.concept = Math.round(15 * ok / cs.length);
    if (missing.length) notes.push('Tente usar ' + missing.join(' e ') + ' para ganhar os pontos de conceito.');

    // itens (baterias e cristais)
    var got = 0, tot = 0;
    results.forEach(function (r) {
      got += r.world.collected.battery + r.world.collected.crystal;
      tot += r.world.totals.battery + r.world.totals.crystal;
    });
    parts.items = tot === 0 ? 15 : Math.round(15 * got / tot);
    if (tot > 0 && got < tot) notes.push('Ficaram itens para trás: ' + got + ' de ' + tot + ' coletados.');

    // regra da fase
    var rule = level.rule || { type: 'none' };
    var pass = true;
    switch (rule.type) {
      case 'maxBlocks': pass = info.count <= rule.n; break;
      case 'maxTicks': pass = results.every(function (r) { return r.world.tick <= rule.n; }); break;
      case 'minEnergy': pass = results.every(function (r) { return r.world.energy != null && r.world.energy >= rule.n; }); break;
      case 'portalVar': pass = true; break;
      default: pass = true;
    }
    parts.rule = pass ? 10 : 0;
    if (!pass) notes.push('Regra da fase não cumprida: ' + rule.text + '.');

    var total = parts.completion + parts.efficiency + parts.concept + parts.items + parts.rule;
    return { total: total, stars: LA.starsFor(total, true), completed: true, parts: parts, notes: notes, blocks: info.count, info: info };
  };

  LA.starsFor = function (total, completed) {
    if (!completed) return 0;
    if (total >= 90) return 3;
    if (total >= 70) return 2;
    return 1;
  };
})(globalThis.LA = globalThis.LA || {});
