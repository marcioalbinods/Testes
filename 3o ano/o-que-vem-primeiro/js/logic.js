/* O QUE VEM PRIMEIRO? — Regras do jogo (funções puras, sem tela).
   Cada cartão pode ter uma lista "after": as etapas que precisam acontecer ANTES dele.
   Uma sequência é correta quando todas essas dependências são respeitadas.
   Assim, o jogo aceita TODAS as ordens logicamente válidas, e não só uma. */
(function (root) {
  'use strict';

  // Primeiro cartão que aparece antes de uma etapa da qual depende.
  // Retorna null quando a sequência está correta.
  function firstViolation(order, cards) {
    const pos = {};
    order.forEach((id, i) => { pos[id] = i; });
    for (let i = 0; i < order.length; i++) {
      const card = cards[order[i]];
      const deps = (card && card.after) || [];
      for (const dep of deps) {
        if (pos[dep] !== undefined && pos[dep] > i) {
          return { index: i, id: order[i], needs: dep };
        }
      }
    }
    return null;
  }

  function isValidOrder(order, cards) {
    return firstViolation(order, cards) === null;
  }

  // Todas as ordens válidas para um conjunto de cartões (no máximo 7 cartões: 5040 permutações).
  function validOrders(ids, cards) {
    const out = [];
    const used = new Array(ids.length).fill(false);
    const cur = [];
    const placed = new Set();
    (function walk() {
      if (cur.length === ids.length) { out.push(cur.slice()); return; }
      for (let i = 0; i < ids.length; i++) {
        if (used[i]) continue;
        const deps = ((cards[ids[i]] && cards[ids[i]].after) || []).filter((d) => ids.includes(d));
        if (!deps.every((d) => placed.has(d))) continue;
        used[i] = true; cur.push(ids[i]); placed.add(ids[i]);
        walk();
        used[i] = false; cur.pop(); placed.delete(ids[i]);
      }
    })();
    return out;
  }

  // A ordem válida mais parecida com a do estudante (mais cartões na mesma posição).
  function closestValid(order, cards) {
    const all = validOrders(order.slice().sort(), cards);
    let best = all[0];
    let bestScore = -1;
    for (const v of all) {
      let s = 0;
      for (let i = 0; i < v.length; i++) if (v[i] === order[i]) s++;
      if (s > bestScore) { bestScore = s; best = v; }
    }
    return best;
  }

  // Posições que já estão certas (comparando com a ordem válida mais próxima).
  function correctPositions(order, cards) {
    const target = closestValid(order, cards);
    const ok = [];
    order.forEach((id, i) => { if (target[i] === id) ok.push(i); });
    return ok;
  }

  // Embaralha garantindo que o resultado NÃO seja uma ordem válida.
  function shuffleInvalid(ids, cards, rnd) {
    const r = rnd || Math.random;
    if (validOrders(ids, cards).length >= factorial(ids.length)) return ids.slice();
    let arr = ids.slice();
    for (let tries = 0; tries < 200; tries++) {
      arr = ids.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      // Evita começar com quase tudo no lugar: pelo menos metade fora da posição original.
      let same = 0;
      arr.forEach((id, i) => { if (id === ids[i]) same++; });
      if (!isValidOrder(arr, cards) && same <= Math.floor(ids.length / 2)) return arr;
    }
    return ids.slice().reverse();
  }

  function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }

  function sameOrder(a, b) {
    return a.length === b.length && a.every((x, i) => x === b[i]);
  }

  // Troca dois cartões e diz se a sequência ficou correta.
  function swapFixes(order, i, j, cards) {
    const arr = order.slice();
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { order: arr, valid: isValidOrder(arr, cards) };
  }

  // Cartões envolvidos em algum problema de ordem (o próprio cartão ou uma dependência dele está fora do lugar).
  function misplacedIndexes(order, cards) {
    const target = closestValid(order, cards);
    const bad = [];
    order.forEach((id, i) => { if (target[i] !== id) bad.push(i); });
    return bad;
  }

  /* ---------------- Pontuação ----------------
     100 por missão concluída
     +30 se não usou dicas
     +20 se pensou antes de agir (nenhuma tentativa errada)
     +25 por etapa errada que o estudante descobriu e corrigiu
     + bônus especiais de algumas fases (ex.: descobrir uma segunda maneira)
     Estrelas: 3 = sem erros e sem dicas; 2 = até 2 erros/dicas; 1 = concluiu. */
  const POINTS = { base: 100, noHints: 30, firstTry: 20, perFix: 25 };

  function scoreMission(stats) {
    const items = [{ label: 'Missão concluída', pts: POINTS.base }];
    if (!stats.hints) items.push({ label: 'Sem usar dicas', pts: POINTS.noHints });
    if (!stats.errors) items.push({ label: 'Pensou antes de agir', pts: POINTS.firstTry });
    if (stats.fixes) items.push({ label: 'Investigador: erros corrigidos (' + stats.fixes + ')', pts: POINTS.perFix * stats.fixes });
    (stats.extras || []).forEach((x) => items.push(x));
    const total = items.reduce((s, x) => s + x.pts, 0);
    const slips = (stats.errors || 0) + (stats.hints || 0);
    const stars = slips === 0 ? 3 : slips <= 2 ? 2 : 1;
    return { items, total, stars };
  }

  /* ---------------- Progresso e medalhas ---------------- */
  const MEDALS = [
    { id: 'aprendiz', name: 'Estrela de Aprendiz', desc: 'Concluiu o Nível 1: Aprendiz de Organização.', needs: [1, 2, 3, 4, 5] },
    { id: 'organizador', name: 'Medalha de Organizador', desc: 'Concluiu o Nível 2: Organizador de Tarefas.', needs: [6, 7, 8, 9, 10] },
    { id: 'investigador', name: 'Troféu de Investigador', desc: 'Descobriu o erro do robô e a etapa que faltava (Missões 11 e 12).', needs: [11, 12] },
    { id: 'mestre', name: 'Medalha de Mestre da Lógica', desc: 'Venceu o Grande Desafio da Lógica e todas as 15 missões.', needs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
  ];

  function isDone(progress, n) {
    return !!(progress.missions && progress.missions[n] && progress.missions[n].done);
  }

  function isUnlocked(progress, n, teacher) {
    if (teacher) return true;
    return n === 1 || isDone(progress, n - 1);
  }

  function earnedMedals(progress) {
    return MEDALS.filter((m) => m.needs.every((n) => isDone(progress, n))).map((m) => m.id);
  }

  function totals(progress) {
    let points = 0, stars = 0, done = 0;
    for (let n = 1; n <= 15; n++) {
      const m = progress.missions && progress.missions[n];
      if (m && m.done) { done++; points += m.best || 0; stars += m.stars || 0; }
    }
    return { points, stars, done };
  }

  // Guarda a missão concluída mantendo sempre o melhor resultado.
  function recordMission(progress, n, result) {
    const p = JSON.parse(JSON.stringify(progress || {}));
    p.missions = p.missions || {};
    const old = p.missions[n] || {};
    p.missions[n] = {
      done: true,
      best: Math.max(old.best || 0, result.total),
      stars: Math.max(old.stars || 0, result.stars),
      plays: (old.plays || 0) + 1
    };
    return p;
  }

  const api = {
    firstViolation, isValidOrder, validOrders, closestValid, correctPositions,
    shuffleInvalid, sameOrder, swapFixes, misplacedIndexes,
    POINTS, scoreMission, MEDALS, isDone, isUnlocked, earnedMedals, totals, recordMission
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.OQVP = root.OQVP || {}; root.OQVP.logic = api; }
})(typeof window !== 'undefined' ? window : globalThis);
