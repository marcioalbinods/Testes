/* =========================================================
   LABIRINTO DOS ALGORITMOS — Interpretador de algoritmos
   Lê a árvore de comandos (gerada a partir dos blocos) e executa
   passo a passo no mundo lógico. É um gerador: a cada passo
   devolve um evento para a tela animar e destacar o bloco.
   ========================================================= */
(function (LA) {
  'use strict';

  var LIMITS = { actions: 300, evals: 6000 };
  LA.LIMITS = LIMITS;

  function LoopGuard(msg) { this.msg = msg; }

  function* run(ast, world) {
    var evals = 0;
    var stopped = false;

    function tick() {
      evals++;
      if (evals > LIMITS.evals) throw new LoopGuard('O programa ficou repetindo sem parar (laço infinito?). Byte parou para descansar. Confira as condições das repetições.');
      if (world.actions >= LIMITS.actions) throw new LoopGuard('O programa já deu ' + LIMITS.actions + ' comandos e não terminou. Pode haver uma repetição que nunca acaba.');
    }

    function evalCond(c) {
      if (!c) return { value: false, text: 'condição vazia' };
      switch (c.type) {
        case 'sensor': {
          var v = world.sense(c.sensor, c.arg);
          return { value: v, text: LA.describeCond(c) };
        }
        case 'energy': {
          var e = world.energy == null ? 0 : world.energy;
          return { value: world.compare(e, c.op, c.value), text: LA.describeCond(c) + ' (energia = ' + e + ')' };
        }
        case 'var_cmp': {
          var vv = world.getVar(c.name);
          return { value: world.compare(vv, c.op, c.value), text: LA.describeCond(c) + ' (' + c.name + ' = ' + vv + ')' };
        }
        case 'not': {
          var r = evalCond(c.cond);
          return { value: !r.value, text: 'NÃO (' + r.text + ')' };
        }
      }
      return { value: false, text: '?' };
    }

    function finished() { return world.won || world.failed || stopped; }

    function* block(list) {
      for (var i = 0; i < list.length; i++) {
        if (finished()) return;
        yield* stmt(list[i]);
      }
    }

    function* stmt(s) {
      tick();
      if (finished()) return;
      switch (s.type) {
        case 'forward': case 'left': case 'right': case 'wait': {
          yield { type: 'highlight', id: s.id };
          var ev = s.type === 'forward' ? world.forward() : s.type === 'wait' ? world.wait() : world.turn(s.type);
          yield { type: 'action', id: s.id, action: s.type, ev: ev };
          return;
        }
        case 'stop':
          yield { type: 'highlight', id: s.id };
          stopped = true;
          yield { type: 'stop', id: s.id };
          return;
        case 'repeat': {
          var n = Math.max(0, Math.min(50, s.times | 0));
          for (var i = 0; i < n; i++) {
            tick();
            if (finished()) return;
            yield { type: 'loop', id: s.id, iteration: i + 1, total: n };
            yield* block(s.body);
          }
          return;
        }
        case 'until_goal': {
          while (!finished()) {
            tick();
            if (world.sense('goal')) return;
            yield { type: 'loop', id: s.id };
            var before = world.actions;
            yield* block(s.body);
            if (!s.body.length) throw new LoopGuard('O bloco “repetir até chegar ao portal” está vazio. Coloque comandos dentro dele!');
            if (world.actions === before && !finished()) {
              // nenhuma ação na volta: só continua se algo puder mudar (evita travar)
              tick();
            }
          }
          return;
        }
        case 'while': {
          while (!finished()) {
            tick();
            var r = evalCond(s.cond);
            yield { type: 'cond', id: s.id, value: r.value, text: r.text };
            if (!r.value) return;
            yield* block(s.body);
          }
          return;
        }
        case 'if': {
          var rc = evalCond(s.cond);
          yield { type: 'cond', id: s.id, value: rc.value, text: rc.text };
          if (rc.value) yield* block(s.then || []);
          else if (s.else) yield* block(s.else);
          return;
        }
        case 'var_set':
          world.vars[s.name] = s.value | 0;
          yield { type: 'var', id: s.id, name: s.name, value: world.vars[s.name], text: 'Variável “' + s.name + '” criada com valor ' + world.vars[s.name] };
          return;
        case 'var_add': case 'var_sub': {
          var cur = world.getVar(s.name);
          var created = !(s.name in world.vars);
          world.vars[s.name] = cur + (s.type === 'var_add' ? 1 : -1) * (s.value | 0);
          yield { type: 'var', id: s.id, name: s.name, value: world.vars[s.name],
            text: (created ? 'Atenção: a variável “' + s.name + '” não tinha sido criada. ' : '') + '“' + s.name + '” agora vale ' + world.vars[s.name] };
          return;
        }
      }
    }

    try {
      yield* block(ast);
      if (world.won) yield { type: 'end', result: 'win' };
      else if (world.failed) yield { type: 'end', result: 'fail', reason: world.failed.reason, msg: world.failed.msg };
      else yield { type: 'end', result: 'incomplete', msg: stopped ? 'O bloco PARAR encerrou o programa antes de Byte chegar ao portal.' : 'A programação terminou, mas Byte ainda não chegou ao portal. Continue o algoritmo!' };
    } catch (e) {
      if (e instanceof LoopGuard) {
        world.failed = { reason: 'loop', msg: e.msg };
        yield { type: 'end', result: 'fail', reason: 'loop', msg: e.msg };
      } else throw e;
    }
  }
  LA.run = run;

  /* Executa tudo de uma vez (testes e verificação rápida). */
  LA.runAll = function (ast, level, variantIndex) {
    var w = new LA.World(level, variantIndex || 0);
    var last = null, events = [];
    for (var e of run(ast, w)) { events.push(e); last = e; }
    return { world: w, end: last, events: events };
  };

  /* ---------- Textos amigáveis ---------- */
  var OP_TXT = { '<': 'menor que', '>': 'maior que', '=': 'igual a', '<=': 'até', '>=': 'pelo menos', '!=': 'diferente de' };
  LA.describeCond = function (c) {
    if (!c) return 'condição vazia';
    switch (c.type) {
      case 'sensor':
        switch (c.sensor) {
          case 'wall': return 'obstáculo à frente';
          case 'path': return 'caminho ' + (c.arg === 'left' ? 'à esquerda' : c.arg === 'right' ? 'à direita' : 'à frente');
          case 'laser': return 'laser ligado à frente';
          case 'danger': return 'perigo à frente';
          case 'door': return 'porta à frente';
          case 'key': return 'Byte tem chave';
          case 'item': return (LA.ITEM_NAMES[c.arg] || 'objeto') + ' à frente';
        }
        return c.sensor;
      case 'energy': return 'energia ' + (OP_TXT[c.op] || c.op) + ' ' + c.value;
      case 'var_cmp': return c.name + ' ' + (OP_TXT[c.op] || c.op) + ' ' + c.value;
      case 'not': return 'NÃO ' + LA.describeCond(c.cond);
    }
    return '?';
  };

  /* ---------- Análise do programa ---------- */
  LA.countBlocks = function (ast) {
    var n = 0;
    function c(cond) { if (!cond) return; n++; if (cond.type === 'not') c(cond.cond); }
    function walk(list) {
      (list || []).forEach(function (s) {
        n++;
        if (s.cond) c(s.cond);
        if (s.body) walk(s.body);
        if (s.then) walk(s.then);
        if (s.else) walk(s.else);
      });
    }
    walk(ast);
    return n;
  };

  LA.analyze = function (ast) {
    var info = { loop: false, repeat: false, nested: false, if: false, ifelse: false, sensor: false, variable: false, varSet: false, varAdd: false, wait: false, count: LA.countBlocks(ast) };
    function cond(c) {
      if (!c) return;
      if (c.type === 'sensor' || c.type === 'energy') info.sensor = true;
      if (c.type === 'var_cmp') info.variable = true;
      if (c.type === 'not') cond(c.cond);
    }
    function walk(list, depth) {
      (list || []).forEach(function (s) {
        var isLoop = s.type === 'repeat' || s.type === 'until_goal' || s.type === 'while';
        if (isLoop) { info.loop = true; if (s.type === 'repeat') info.repeat = true; if (depth > 0) info.nested = true; }
        if (s.type === 'if') { info.if = true; if (s.else) info.ifelse = true; }
        if (s.type === 'until_goal') info.sensor = true;
        if (s.type === 'var_set') info.varSet = true;
        if (s.type === 'var_add' || s.type === 'var_sub') info.varAdd = true;
        if (s.type === 'wait') info.wait = true;
        cond(s.cond);
        var d = depth + (isLoop ? 1 : 0);
        walk(s.body, d); walk(s.then, d); walk(s.else, d);
      });
    }
    walk(ast, 0);
    if (info.varSet && info.varAdd) info.variable = true;
    return info;
  };
})(globalThis.LA = globalThis.LA || {});
