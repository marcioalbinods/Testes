/* =========================================================
   LABIRINTO DOS ALGORITMOS — Blocos de programação (Blockly)
   Define os blocos em português, monta a caixa de ferramentas
   de cada fase e converte blocos ⇄ programa executável.
   ========================================================= */
(function (LA) {
  'use strict';
  var Blockly = globalThis.Blockly;

  var C = {
    control: '#FFBF00', move: '#4C97FF', loop: '#FF8C1A', cond: '#5CB85C', sensor: '#2CB5D6', vars: '#E05FA8'
  };
  LA.BLOCK_COLORS = C;

  var NUMS = [['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['1', '1']];
  var VALS = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10']];
  var VARNAMES = [['cristais', 'cristais'], ['baterias', 'baterias'], ['passos', 'passos'], ['contador', 'contador']];
  var OPS = [['=', '='], ['<', '<'], ['>', '>']];

  LA.BLOCK_INFO = {
    forward: { name: 'avançar', cat: 'move', desc: 'Byte anda uma casa para a frente.' },
    left: { name: 'virar à esquerda', cat: 'move', desc: 'Byte gira para a esquerda, sem sair do lugar.' },
    right: { name: 'virar à direita', cat: 'move', desc: 'Byte gira para a direita, sem sair do lugar.' },
    repeat: { name: 'repetir __ vezes', cat: 'loop', desc: 'Executa os blocos de dentro várias vezes.' },
    until_goal: { name: 'repetir até chegar ao portal', cat: 'loop', desc: 'Repete os blocos de dentro até Byte chegar ao portal.' },
    while: { name: 'repetir enquanto', cat: 'loop', desc: 'Repete enquanto a condição for verdadeira.' },
    if: { name: 'se … então', cat: 'cond', desc: 'Só executa os blocos de dentro SE a condição for verdadeira.' },
    ifelse: { name: 'se … senão', cat: 'cond', desc: 'Escolhe um de dois caminhos: SE verdadeiro faz o primeiro, SENÃO faz o segundo.' },
    s_wall: { name: 'obstáculo à frente?', cat: 'sensor', desc: 'Verdadeiro se houver parede, buraco ou porta trancada na frente.' },
    s_path: { name: 'caminho à frente/esquerda/direita?', cat: 'sensor', desc: 'Verdadeiro se Byte puder andar para aquele lado.' },
    s_item: { name: 'objeto à frente?', cat: 'sensor', desc: 'Detecta bateria, cristal ou chave na casa da frente.' },
    s_door: { name: 'porta à frente?', cat: 'sensor', desc: 'Verdadeiro se houver uma porta trancada na frente.' },
    s_key: { name: 'Byte tem chave?', cat: 'sensor', desc: 'Verdadeiro se Byte estiver carregando uma chave.' },
    s_laser: { name: 'laser ligado à frente?', cat: 'sensor', desc: 'Verdadeiro se o laser da frente estiver ligado agora.' },
    s_danger: { name: 'perigo à frente?', cat: 'sensor', desc: 'Detecta laser ligado ou drone na casa da frente.' },
    s_energy: { name: 'energia', cat: 'sensor', desc: 'Compara a energia do Byte com um número.' },
    not: { name: 'não', cat: 'sensor', desc: 'Inverte a resposta: verdadeiro vira falso e falso vira verdadeiro.' },
    var_set: { name: 'criar variável', cat: 'vars', desc: 'Cria uma variável (caixinha com nome) e dá um valor inicial.' },
    var_add: { name: 'adicionar valor', cat: 'vars', desc: 'Soma um número à variável.' },
    var_sub: { name: 'diminuir valor', cat: 'vars', desc: 'Subtrai um número da variável.' },
    var_cmp: { name: 'verificar valor', cat: 'vars', desc: 'Compara a variável com um número.' },
    wait: { name: 'esperar', cat: 'control', desc: 'Byte fica parado por um tempo (os lasers e drones continuam).' },
    stop: { name: 'parar', cat: 'control', desc: 'Encerra o programa.' }
  };

  var defined = false;
  LA.defineBlocks = function () {
    if (defined || !Blockly) return;
    defined = true;
    if (globalThis.Blockly && Blockly.Msg) {
      Blockly.Msg.DELETE_BLOCK = 'Apagar bloco';
      Blockly.Msg.DELETE_X_BLOCKS = 'Apagar %1 blocos';
      Blockly.Msg.DUPLICATE_BLOCK = 'Duplicar';
      Blockly.Msg.CLEAN_UP = 'Organizar blocos';
    }
    Blockly.common.defineBlocksWithJsonArray([
      { type: 'la_start', message0: '▶ quando iniciar', nextStatement: null, colour: C.control, tooltip: 'O programa começa aqui. Encaixe os blocos embaixo.', deletable: false },
      { type: 'la_forward', message0: '⬆ avançar', previousStatement: null, nextStatement: null, colour: C.move, tooltip: 'Andar uma casa para a frente' },
      { type: 'la_left', message0: '↺ virar à esquerda', previousStatement: null, nextStatement: null, colour: C.move, tooltip: 'Girar para a esquerda' },
      { type: 'la_right', message0: '↻ virar à direita', previousStatement: null, nextStatement: null, colour: C.move, tooltip: 'Girar para a direita' },
      { type: 'la_repeat', message0: '🔁 repetir %1 vezes', args0: [{ type: 'field_dropdown', name: 'TIMES', options: NUMS }],
        message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: C.loop, tooltip: 'Repete os blocos de dentro' },
      { type: 'la_until_goal', message0: '🔁 repetir até chegar ao portal 🌀', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
        previousStatement: null, nextStatement: null, colour: C.loop, tooltip: 'Repete até Byte chegar ao portal' },
      { type: 'la_while', message0: '🔁 repetir enquanto %1', args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
        message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: C.loop, tooltip: 'Repete enquanto a condição for verdadeira' },
      { type: 'la_if', message0: '❓ se %1 então', args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
        message1: '%1', args1: [{ type: 'input_statement', name: 'THEN' }], previousStatement: null, nextStatement: null, colour: C.cond, tooltip: 'Executa só se a condição for verdadeira' },
      { type: 'la_ifelse', message0: '❓ se %1 então', args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
        message1: '%1', args1: [{ type: 'input_statement', name: 'THEN' }],
        message2: 'senão', message3: '%1', args3: [{ type: 'input_statement', name: 'ELSE' }],
        previousStatement: null, nextStatement: null, colour: C.cond, tooltip: 'Se verdadeiro faz o primeiro; senão, o segundo' },
      { type: 'la_s_wall', message0: '🧱 obstáculo à frente?', output: 'Boolean', colour: C.sensor, tooltip: 'Parede, buraco ou porta trancada na frente' },
      { type: 'la_s_path', message0: '👣 caminho %1?', args0: [{ type: 'field_dropdown', name: 'SIDE', options: [['à frente', 'ahead'], ['à esquerda', 'left'], ['à direita', 'right']] }], output: 'Boolean', colour: C.sensor, tooltip: 'Byte pode andar para esse lado?' },
      { type: 'la_s_item', message0: '%1 à frente?', args0: [{ type: 'field_dropdown', name: 'ITEM', options: [['🔋 bateria', 'battery'], ['💎 cristal', 'crystal'], ['🔑 chave', 'key']] }], output: 'Boolean', colour: C.sensor, tooltip: 'Detectar objeto na frente' },
      { type: 'la_s_door', message0: '🚪 porta à frente?', output: 'Boolean', colour: C.sensor, tooltip: 'Porta trancada na frente' },
      { type: 'la_s_key', message0: '🔑 Byte tem chave?', output: 'Boolean', colour: C.sensor, tooltip: 'Byte está com uma chave?' },
      { type: 'la_s_laser', message0: '🔴 laser ligado à frente?', output: 'Boolean', colour: C.sensor, tooltip: 'O laser da frente está ligado?' },
      { type: 'la_s_danger', message0: '⚠️ perigo à frente?', output: 'Boolean', colour: C.sensor, tooltip: 'Laser ligado ou drone na frente' },
      { type: 'la_s_energy', message0: '⚡ energia %1 %2 ?', args0: [{ type: 'field_dropdown', name: 'OP', options: OPS.slice(1).concat([OPS[0]]) }, { type: 'field_dropdown', name: 'VALUE', options: VALS.slice(1) }], output: 'Boolean', colour: C.sensor, tooltip: 'Verificar a energia do Byte' },
      { type: 'la_not', message0: 'não %1', args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }], output: 'Boolean', colour: C.sensor, tooltip: 'Inverte a condição' },
      { type: 'la_var_set', message0: '📦 criar variável %1 com valor %2', args0: [{ type: 'field_dropdown', name: 'VAR', options: VARNAMES }, { type: 'field_dropdown', name: 'VALUE', options: VALS }], previousStatement: null, nextStatement: null, colour: C.vars, tooltip: 'Criar uma variável' },
      { type: 'la_var_add', message0: '➕ adicionar %1 a %2', args0: [{ type: 'field_dropdown', name: 'VALUE', options: VALS.slice(1) }, { type: 'field_dropdown', name: 'VAR', options: VARNAMES }], previousStatement: null, nextStatement: null, colour: C.vars, tooltip: 'Aumentar a variável' },
      { type: 'la_var_sub', message0: '➖ diminuir %1 de %2', args0: [{ type: 'field_dropdown', name: 'VALUE', options: VALS.slice(1) }, { type: 'field_dropdown', name: 'VAR', options: VARNAMES }], previousStatement: null, nextStatement: null, colour: C.vars, tooltip: 'Diminuir a variável' },
      { type: 'la_var_cmp', message0: '📦 %1 %2 %3 ?', args0: [{ type: 'field_dropdown', name: 'VAR', options: VARNAMES }, { type: 'field_dropdown', name: 'OP', options: OPS }, { type: 'field_dropdown', name: 'VALUE', options: VALS }], output: 'Boolean', colour: C.vars, tooltip: 'Verificar o valor da variável' },
      { type: 'la_wait', message0: '⏳ esperar', previousStatement: null, nextStatement: null, colour: C.control, tooltip: 'Esperar um tempo' },
      { type: 'la_stop', message0: '⏹️ parar', previousStatement: null, colour: C.control, tooltip: 'Encerrar o programa' }
    ]);
  };

  /* ---------- Caixa de ferramentas ---------- */
  function blk(type, extra) { return Object.assign({ kind: 'block', type: 'la_' + type }, extra || {}); }
  function withCond(type, cond, fields) {
    var c = { type: 'la_' + cond };
    if (fields) c.fields = fields;
    return blk(type, { inputs: { COND: { block: c } } });
  }

  LA.buildToolbox = function (allowed) {
    var has = function (k) { return allowed.indexOf(k) >= 0; };
    var cats = [];
    var move = [];
    if (has('forward')) move.push(blk('forward'));
    if (has('left')) move.push(blk('left'));
    if (has('right')) move.push(blk('right'));
    if (move.length) cats.push({ kind: 'category', name: 'Movimento', colour: C.move, contents: move });

    var loop = [];
    if (has('repeat')) {
      [2, 3, 4, 5, 10].forEach(function (n) { loop.push(blk('repeat', { fields: { TIMES: String(n) } })); });
    }
    if (has('until_goal')) loop.push(blk('until_goal'));
    if (has('while')) loop.push(withCond('while', 'not', null));
    if (loop.length) cats.push({ kind: 'category', name: 'Repetição', colour: C.loop, contents: loop });

    var cond = [];
    if (has('if')) {
      if (has('s_wall')) cond.push(withCond('if', 's_wall'));
      if (has('s_item')) {
        cond.push(withCond('if', 's_item', { ITEM: 'battery' }));
        cond.push(withCond('if', 's_item', { ITEM: 'key' }));
      }
      if (has('s_door')) cond.push(withCond('if', 's_door'));
      if (has('s_key')) cond.push(withCond('if', 's_key'));
      if (has('s_laser')) cond.push(withCond('if', 's_laser'));
      cond.push(blk('if'));
    }
    if (has('ifelse')) cond.push(blk('ifelse'));
    if (cond.length) cats.push({ kind: 'category', name: 'Condições', colour: C.cond, contents: cond });

    var sens = [];
    if (has('s_wall')) sens.push(blk('s_wall'));
    if (has('s_path')) { sens.push(blk('s_path')); sens.push(blk('s_path', { fields: { SIDE: 'left' } })); }
    if (has('s_item')) sens.push(blk('s_item', { fields: { ITEM: 'crystal' } }));
    if (has('s_door')) sens.push(blk('s_door'));
    if (has('s_key')) sens.push(blk('s_key'));
    if (has('s_laser')) sens.push(blk('s_laser'));
    if (has('s_danger')) sens.push(blk('s_danger'));
    if (has('s_energy')) sens.push(blk('s_energy'));
    if (has('not')) sens.push(blk('not'));
    if (sens.length) cats.push({ kind: 'category', name: 'Sensores', colour: C.sensor, contents: sens });

    var vars = [];
    ['var_set', 'var_add', 'var_sub', 'var_cmp'].forEach(function (k) { if (has(k)) vars.push(blk(k)); });
    if (vars.length) cats.push({ kind: 'category', name: 'Variáveis', colour: C.vars, contents: vars });

    var ctrl = [];
    if (has('wait')) ctrl.push(blk('wait'));
    if (has('stop')) ctrl.push(blk('stop'));
    if (ctrl.length) cats.push({ kind: 'category', name: 'Controle', colour: C.control, contents: ctrl });

    return { kind: 'categoryToolbox', contents: cats };
  };

  /* ---------- Blocos → programa ---------- */
  LA.workspaceToAst = function (ws) {
    var start = ws.getTopBlocks(false).filter(function (b) { return b.type === 'la_start'; })[0];
    if (!start) return { ast: [], start: null };
    function cond(b) {
      if (!b) return null;
      var c;
      switch (b.type) {
        case 'la_s_wall': c = { type: 'sensor', sensor: 'wall' }; break;
        case 'la_s_path': c = { type: 'sensor', sensor: 'path', arg: b.getFieldValue('SIDE') }; break;
        case 'la_s_item': c = { type: 'sensor', sensor: 'item', arg: b.getFieldValue('ITEM') }; break;
        case 'la_s_door': c = { type: 'sensor', sensor: 'door' }; break;
        case 'la_s_key': c = { type: 'sensor', sensor: 'key' }; break;
        case 'la_s_laser': c = { type: 'sensor', sensor: 'laser' }; break;
        case 'la_s_danger': c = { type: 'sensor', sensor: 'danger' }; break;
        case 'la_s_energy': c = { type: 'energy', op: b.getFieldValue('OP'), value: Number(b.getFieldValue('VALUE')) }; break;
        case 'la_var_cmp': c = { type: 'var_cmp', name: b.getFieldValue('VAR'), op: b.getFieldValue('OP'), value: Number(b.getFieldValue('VALUE')) }; break;
        case 'la_not': c = { type: 'not', cond: cond(b.getInputTargetBlock('COND')) }; break;
        default: return null;
      }
      c.id = b.id;
      return c;
    }
    function chain(b) {
      var out = [];
      while (b) {
        if (b.isEnabled && !b.isEnabled()) { b = b.getNextBlock(); continue; }
        var s = null;
        switch (b.type) {
          case 'la_forward': s = { type: 'forward' }; break;
          case 'la_left': s = { type: 'left' }; break;
          case 'la_right': s = { type: 'right' }; break;
          case 'la_wait': s = { type: 'wait' }; break;
          case 'la_stop': s = { type: 'stop' }; break;
          case 'la_repeat': s = { type: 'repeat', times: Number(b.getFieldValue('TIMES')), body: chain(b.getInputTargetBlock('DO')) }; break;
          case 'la_until_goal': s = { type: 'until_goal', body: chain(b.getInputTargetBlock('DO')) }; break;
          case 'la_while': s = { type: 'while', cond: cond(b.getInputTargetBlock('COND')), body: chain(b.getInputTargetBlock('DO')) }; break;
          case 'la_if': s = { type: 'if', cond: cond(b.getInputTargetBlock('COND')), then: chain(b.getInputTargetBlock('THEN')), else: null }; break;
          case 'la_ifelse': s = { type: 'if', cond: cond(b.getInputTargetBlock('COND')), then: chain(b.getInputTargetBlock('THEN')), else: chain(b.getInputTargetBlock('ELSE')) }; break;
          case 'la_var_set': s = { type: 'var_set', name: b.getFieldValue('VAR'), value: Number(b.getFieldValue('VALUE')) }; break;
          case 'la_var_add': s = { type: 'var_add', name: b.getFieldValue('VAR'), value: Number(b.getFieldValue('VALUE')) }; break;
          case 'la_var_sub': s = { type: 'var_sub', name: b.getFieldValue('VAR'), value: Number(b.getFieldValue('VALUE')) }; break;
        }
        if (s) { s.id = b.id; out.push(s); }
        b = b.getNextBlock();
      }
      return out;
    }
    var ast = chain(start.getNextBlock());
    return { ast: ast, start: start };
  };

  /* ---------- Programa → blocos (código pronto, testes, soluções) ---------- */
  LA.astToBlocklyJson = function (ast, x, y) {
    function condJson(c) {
      if (!c) return null;
      switch (c.type) {
        case 'sensor':
          switch (c.sensor) {
            case 'wall': return { type: 'la_s_wall' };
            case 'path': return { type: 'la_s_path', fields: { SIDE: c.arg || 'ahead' } };
            case 'item': return { type: 'la_s_item', fields: { ITEM: c.arg || 'battery' } };
            case 'door': return { type: 'la_s_door' };
            case 'key': return { type: 'la_s_key' };
            case 'laser': return { type: 'la_s_laser' };
            case 'danger': return { type: 'la_s_danger' };
          }
          return null;
        case 'energy': return { type: 'la_s_energy', fields: { OP: c.op, VALUE: String(c.value) } };
        case 'var_cmp': return { type: 'la_var_cmp', fields: { VAR: c.name, OP: c.op, VALUE: String(c.value) } };
        case 'not': { var n = { type: 'la_not' }; var inner = condJson(c.cond); if (inner) n.inputs = { COND: { block: inner } }; return n; }
      }
      return null;
    }
    function stmtJson(s) {
      var b;
      switch (s.type) {
        case 'forward': b = { type: 'la_forward' }; break;
        case 'left': b = { type: 'la_left' }; break;
        case 'right': b = { type: 'la_right' }; break;
        case 'wait': b = { type: 'la_wait' }; break;
        case 'stop': b = { type: 'la_stop' }; break;
        case 'repeat': b = { type: 'la_repeat', fields: { TIMES: String(s.times) }, inputs: {} }; addChain(b, 'DO', s.body); break;
        case 'until_goal': b = { type: 'la_until_goal', inputs: {} }; addChain(b, 'DO', s.body); break;
        case 'while': b = { type: 'la_while', inputs: {} }; addCond(b, s.cond); addChain(b, 'DO', s.body); break;
        case 'if':
          b = { type: s.else ? 'la_ifelse' : 'la_if', inputs: {} };
          addCond(b, s.cond); addChain(b, 'THEN', s.then); if (s.else) addChain(b, 'ELSE', s.else);
          break;
        case 'var_set': b = { type: 'la_var_set', fields: { VAR: s.name, VALUE: String(s.value) } }; break;
        case 'var_add': b = { type: 'la_var_add', fields: { VALUE: String(s.value), VAR: s.name } }; break;
        case 'var_sub': b = { type: 'la_var_sub', fields: { VALUE: String(s.value), VAR: s.name } }; break;
      }
      return b;
    }
    function addCond(b, c) { var j = condJson(c); if (j) b.inputs.COND = { block: j }; }
    function addChain(b, name, list) { var j = chainJson(list); if (j) b.inputs[name] = { block: j }; }
    function chainJson(list) {
      var first = null, prev = null;
      (list || []).forEach(function (s) {
        var j = stmtJson(s); if (!j) return;
        if (!first) first = j; else prev.next = { block: j };
        prev = j;
      });
      return first;
    }
    var start = { type: 'la_start', x: x || 30, y: y || 30, deletable: false };
    var c = chainJson(ast);
    if (c) start.next = { block: c };
    return { blocks: { languageVersion: 0, blocks: [start] } };
  };

  /* Assinatura do programa (para reconhecer soluções diferentes). */
  LA.astSignature = function (ast) {
    return JSON.stringify(ast, function (k, v) { return k === 'id' ? undefined : v; });
  };

  /* Conta blocos de verdade no espaço de trabalho (sem o “quando iniciar”). */
  LA.workspaceBlockCount = function (ws) {
    return ws.getAllBlocks(false).filter(function (b) { return b.type !== 'la_start' && !b.isShadow(); }).length;
  };
})(globalThis.LA = globalThis.LA || {});
