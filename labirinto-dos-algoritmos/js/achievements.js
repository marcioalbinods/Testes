/* =========================================================
   LABIRINTO DOS ALGORITMOS — Conquistas
   ========================================================= */
(function (LA) {
  'use strict';

  function done(p, id) { var l = p.levels[id]; return !!(l && l.completed); }
  function worldDone(p, w) { return LA.levelsOfWorld(w).every(function (l) { return done(p, l.id); }); }
  function worldPerfect(p, w) { return LA.levelsOfWorld(w).every(function (l) { var r = p.levels[l.id]; return r && r.stars === 3; }); }
  function stars(p) { var s = 0; for (var k in p.levels) s += p.levels[k].stars || 0; return s; }

  LA.ACHIEVEMENTS = [
    { id: 'primeiro_passo', icon: '👣', name: 'Primeiro passo', desc: 'Concluir a primeira fase.', check: function (p) { return done(p, 1); } },
    { id: 'mundo1', icon: '🌱', name: 'Explorador do Vale', desc: 'Concluir o Vale dos Primeiros Passos.', special: true, check: function (p) { return worldDone(p, 1); } },
    { id: 'mundo2', icon: '🌲', name: 'Guardião da Floresta', desc: 'Concluir a Floresta das Repetições.', special: true, check: function (p) { return worldDone(p, 2); } },
    { id: 'mundo3', icon: '🏰', name: 'Estrategista da Fortaleza', desc: 'Concluir a Fortaleza das Decisões.', special: true, check: function (p) { return worldDone(p, 3); } },
    { id: 'mundo4', icon: '🧪', name: 'Cientista do Laboratório', desc: 'Concluir o Laboratório dos Códigos.', special: true, check: function (p) { return worldDone(p, 4); } },
    { id: 'mundo5', icon: '💠', name: 'Mestre do Núcleo', desc: 'Concluir o Núcleo do Algoritmo.', special: true, check: function (p) { return worldDone(p, 5); } },
    { id: 'grande_escape', icon: '🏆', name: 'O Grande Escape', desc: 'Concluir as 25 fases e libertar o Byte!', special: true, check: function (p) { return LA.LEVELS.every(function (l) { return done(p, l.id); }); } },
    { id: 'tres_estrelas', icon: '⭐', name: 'Brilhou!', desc: 'Ganhar 3 estrelas em uma fase.', check: function (p) { for (var k in p.levels) if (p.levels[k].stars === 3) return true; return false; } },
    { id: 'estrelas25', icon: '🌟', name: 'Céu estrelado', desc: 'Juntar 25 estrelas.', check: function (p) { return stars(p) >= 25; } },
    { id: 'estrelas50', icon: '✨', name: 'Constelação', desc: 'Juntar 50 estrelas.', check: function (p) { return stars(p) >= 50; } },
    { id: 'estrelas75', icon: '🌌', name: 'Galáxia completa', desc: 'Juntar todas as 75 estrelas.', check: function (p) { return stars(p) >= 75; } },
    { id: 'perfeito', icon: '💯', name: 'Mundo perfeito', desc: 'Ganhar 3 estrelas em todas as fases de um mundo.', check: function (p) { for (var w = 1; w <= 5; w++) if (worldPerfect(p, w)) return true; return false; } },
    { id: 'laco', icon: '🔁', name: 'Mestre das repetições', desc: 'Usar um REPETIR dentro de outro REPETIR.', check: function (p, c) { return !!(c && c.info && c.info.nested && c.won); } },
    { id: 'decisao', icon: '🔀', name: 'Tomador de decisões', desc: 'Vencer uma fase usando SE / SENÃO.', check: function (p, c) { return !!(c && c.info && c.info.ifelse && c.won); } },
    { id: 'variavel', icon: '📦', name: 'Guardião dos números', desc: 'Vencer uma fase usando uma variável.', check: function (p, c) { return !!(c && c.info && c.info.variable && c.won); } },
    { id: 'depurador', icon: '🐞', name: 'Caçador de bugs', desc: 'Consertar o código corrompido (fase 18).', check: function (p) { return done(p, 18); } },
    { id: 'fuga', icon: '🏃', name: 'Fuga perfeita', desc: 'Escapar do perseguidor (fase 22).', check: function (p) { return done(p, 22); } },
    { id: 'economico', icon: '🪙', name: 'Programador econômico', desc: 'Fazer a pontuação máxima de eficiência em 10 fases.', check: function (p) { var n = 0; for (var k in p.levels) if (p.levels[k].bestEff === 20) n++; return n >= 10; } },
    { id: 'coletor', icon: '🔋', name: 'Coletor de energia', desc: 'Coletar 40 baterias e cristais ao todo.', check: function (p) { return (p.stats.items || 0) >= 40; } },
    { id: 'persistente', icon: '💪', name: 'Nunca desista', desc: 'Tentar 5 vezes a mesma fase até conseguir.', check: function (p, c) { return !!(c && c.won && c.attempts >= 5); } },
    { id: 'criativo', icon: '🧩', name: 'Outra solução', desc: 'Vencer de novo uma fase com um programa diferente.', check: function (p, c) { return !!(c && c.won && c.differentSolution); } },
    { id: 'arquiteto', icon: '🏗️', name: 'Arquiteto de labirintos', desc: 'Salvar um labirinto no Laboratório de Criação.', check: function (p, c) { return !!(c && c.mazeSaved); } },
    { id: 'testador', icon: '🧪', name: 'Testador oficial', desc: 'Vencer um labirinto criado no Laboratório.', check: function (p, c) { return !!(c && c.customWon); } }
  ];

  LA.achievementById = function (id) {
    for (var i = 0; i < LA.ACHIEVEMENTS.length; i++) if (LA.ACHIEVEMENTS[i].id === id) return LA.ACHIEVEMENTS[i];
    return null;
  };

  /* Confere conquistas novas para o jogador; devolve a lista das novas. */
  LA.checkAchievements = function (player, ctx) {
    var fresh = [];
    LA.ACHIEVEMENTS.forEach(function (a) {
      if (player.achievements[a.id]) return;
      var got = false;
      try { got = a.check(player, ctx || {}); } catch (e) { got = false; }
      if (got) { player.achievements[a.id] = Date.now(); fresh.push(a); }
    });
    return fresh;
  };
})(globalThis.LA = globalThis.LA || {});
