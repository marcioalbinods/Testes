/* =========================================================
   LABIRINTO DOS ALGORITMOS — Mundos e fases
   ---------------------------------------------------------
   Legenda dos mapas (cada caractere é uma casa da grade):
     #  parede            .  chão             (espaço) buraco
     S  início do Byte    E  portal de saída
     B  bateria           C  cristal          K  chave
     D  porta trancada    T/U interruptores
     L/M lasers (grupos)  |  trilho de drone (Byte não anda nele)
   As soluções de referência servem para calcular a eficiência
   ideal e para os testes automáticos. Outras soluções corretas
   também valem pontos.
   ========================================================= */
(function (LA) {
  'use strict';

  /* ---------- Mini linguagem para escrever programas ----------
     'F' avançar, 'L' esquerda, 'R' direita, 'W' esperar, 'STOP'
     ['rep', n, [...]]          repetir n vezes
     ['until', [...]]           repetir até chegar ao portal
     ['while', cond, [...]]     repetir enquanto
     ['if', cond, [...]]        se
     ['ifelse', cond, [...], [...]]
     ['set'|'add'|'sub', nome, valor]
     condições: 'wall', 'pathF', 'pathL', 'pathR', 'laser', 'danger',
       'door', 'key', ['item', 'battery'|'crystal'|'key'],
       ['energy', op, n], ['var', nome, op, n], ['not', cond]          */
  function cond(c) {
    if (c == null) return null;
    if (typeof c === 'string') {
      switch (c) {
        case 'wall': return { type: 'sensor', sensor: 'wall' };
        case 'pathF': return { type: 'sensor', sensor: 'path', arg: 'ahead' };
        case 'pathL': return { type: 'sensor', sensor: 'path', arg: 'left' };
        case 'pathR': return { type: 'sensor', sensor: 'path', arg: 'right' };
        case 'laser': return { type: 'sensor', sensor: 'laser' };
        case 'danger': return { type: 'sensor', sensor: 'danger' };
        case 'door': return { type: 'sensor', sensor: 'door' };
        case 'key': return { type: 'sensor', sensor: 'key' };
      }
      throw new Error('Condição desconhecida: ' + c);
    }
    switch (c[0]) {
      case 'item': return { type: 'sensor', sensor: 'item', arg: c[1] };
      case 'energy': return { type: 'energy', op: c[1], value: c[2] };
      case 'var': return { type: 'var_cmp', name: c[1], op: c[2], value: c[3] };
      case 'not': return { type: 'not', cond: cond(c[1]) };
    }
    throw new Error('Condição desconhecida: ' + JSON.stringify(c));
  }
  function prog(list) {
    return list.map(function (s) {
      if (typeof s === 'string') {
        var m = { F: 'forward', L: 'left', R: 'right', W: 'wait', STOP: 'stop' }[s];
        if (!m) throw new Error('Comando desconhecido: ' + s);
        return { type: m };
      }
      switch (s[0]) {
        case 'rep': return { type: 'repeat', times: s[1], body: prog(s[2]) };
        case 'until': return { type: 'until_goal', body: prog(s[1]) };
        case 'while': return { type: 'while', cond: cond(s[1]), body: prog(s[2]) };
        case 'if': return { type: 'if', cond: cond(s[1]), then: prog(s[2]), else: null };
        case 'ifelse': return { type: 'if', cond: cond(s[1]), then: prog(s[2]), else: prog(s[3]) };
        case 'set': return { type: 'var_set', name: s[1], value: s[2] };
        case 'add': return { type: 'var_add', name: s[1], value: s[2] };
        case 'sub': return { type: 'var_sub', name: s[1], value: s[2] };
      }
      throw new Error('Comando desconhecido: ' + JSON.stringify(s));
    });
  }
  LA.dsl = prog;
  LA.dslCond = cond;

  /* ---------- Mundos ---------- */
  LA.WORLDS = [
    { id: 1, name: 'Vale dos Primeiros Passos', short: 'Vale', emoji: '🌱', theme: 'vale',
      goal: 'Sequência lógica e orientação espacial',
      desc: 'Byte acorda num vale verdinho. Aqui você aprende a dar ordens em sequência: uma depois da outra!' },
    { id: 2, name: 'Floresta das Repetições', short: 'Floresta', emoji: '🌲', theme: 'floresta',
      goal: 'Laços de repetição e otimização',
      desc: 'Na floresta os caminhos se repetem. Use o bloco REPETIR para escrever menos e fazer mais.' },
    { id: 3, name: 'Fortaleza das Decisões', short: 'Fortaleza', emoji: '🏰', theme: 'fortaleza',
      goal: 'Condições e sensores',
      desc: 'A fortaleza muda de forma! Byte usa sensores e decide o que fazer com SE e SENÃO.' },
    { id: 4, name: 'Laboratório dos Códigos', short: 'Laboratório', emoji: '🧪', theme: 'laboratorio',
      goal: 'Variáveis, depuração e otimização',
      desc: 'No laboratório, Byte guarda números em variáveis, conserta códigos e economiza energia.' },
    { id: 5, name: 'Núcleo do Algoritmo', short: 'Núcleo', emoji: '💠', theme: 'nucleo',
      goal: 'Integrar todos os conhecimentos',
      desc: 'O coração do universo digital. Junte tudo o que aprendeu para o grande escape!' }
  ];

  /* ---------- Conjuntos de blocos ---------- */
  var MOVE = ['forward', 'left', 'right'];
  var LOOP = ['repeat'];
  var SENS = ['until_goal', 'if', 'ifelse', 's_wall', 's_path', 's_item', 's_door', 's_key', 'not'];
  var LAB = ['var_set', 'var_add', 'var_sub', 'var_cmp', 's_energy', 'wait', 'stop', 'while'];
  var ALL = MOVE.concat(LOOP, SENS, LAB, ['s_laser', 's_danger']);
  LA.ALL_BLOCKS = ALL;

  var L = [];
  function level(o) { L.push(o); }

  /* ================= MUNDO 1 ================= */
  level({
    id: 1, world: 1, title: 'Acordando o Byte',
    story: 'Bip! Bip! Byte acabou de acordar e não sabe onde está. O portal de saída brilha logo ali na frente!',
    objective: 'Leve o Byte até o portal 🌀.',
    concept: 'Um ALGORITMO é uma sequência de passos em ordem. O computador faz exatamente o que você manda, um bloco de cada vez.',
    hints: ['Arraste o bloco “avançar” e encaixe embaixo de “quando iniciar”.', 'Conte quantas casas existem entre o Byte e o portal.', 'São 4 casas: use 4 blocos “avançar”.'],
    blocks: MOVE, concepts: ['sequence'],
    rule: { type: 'maxBlocks', n: 4, text: 'Usar no máximo 4 blocos' },
    variants: [{ dir: 'E', map: [
      '#######',
      '#S...E#',
      '#######'] }],
    solution: prog(['F', 'F', 'F', 'F'])
  });
  level({
    id: 2, world: 1, title: 'Caminho das baterias',
    story: 'O portal está sem energia! Byte precisa pegar as 3 baterias espalhadas no caminho para ligá-lo.',
    objective: 'Colete as 3 baterias 🔋 e entre no portal.',
    concept: 'Virar à direita ou à esquerda muda a DIREÇÃO do Byte, sem sair do lugar. Pense sempre para onde ele está olhando!',
    hints: ['O portal só liga depois que as 3 baterias forem coletadas.', 'Quando chegar na parede, Byte precisa VIRAR. Imagine-se no lugar dele.', 'Avance 4, vire à direita, avance 2, vire à direita e avance 4.'],
    blocks: MOVE, concepts: ['sequence'], requireBatteries: true,
    rule: { type: 'maxBlocks', n: 12, text: 'Usar no máximo 12 blocos' },
    variants: [{ dir: 'E', map: [
      '#######',
      '#S.B..#',
      '#####B#',
      '#E.B..#',
      '#######'] }],
    solution: prog(['F', 'F', 'F', 'F', 'R', 'F', 'F', 'R', 'F', 'F', 'F', 'F'])
  });
  level({
    id: 3, world: 1, title: 'Desvio perigoso',
    story: 'Duas pedras gigantes bloqueiam o caminho! Byte vai ter que dar a volta por cima… ou por baixo.',
    objective: 'Contorne as paredes e chegue ao portal.',
    concept: 'Muitas vezes existe mais de um caminho certo. Programadores comparam soluções e escolhem a melhor!',
    hints: ['Byte não atravessa paredes. Se bater, a programação para.', 'Suba uma casa, ande para a direita e desça depois das pedras.', 'Avançar, esquerda, avançar, direita, avançar 3 vezes, direita, avançar, esquerda, avançar.'],
    blocks: MOVE, concepts: ['sequence'],
    rule: { type: 'maxBlocks', n: 11, text: 'Usar no máximo 11 blocos' },
    variants: [{ dir: 'E', map: [
      '########',
      '#......#',
      '#S.##.E#',
      '#......#',
      '########'] }],
    solution: prog(['F', 'L', 'F', 'R', 'F', 'F', 'F', 'R', 'F', 'L', 'F'])
  });
  level({
    id: 4, world: 1, title: 'A porta misteriosa',
    story: 'Uma porta trancada protege o portal. Dizem que a chave dourada está escondida bem pertinho…',
    objective: 'Pegue a chave 🔑, abra a porta e chegue ao portal.',
    concept: 'A ORDEM dos comandos importa: primeiro pegar a chave, depois passar pela porta. Trocar a ordem muda o resultado!',
    hints: ['Byte abre a porta sozinho quando chega nela com a chave.', 'Para dar meia-volta, vire duas vezes para o mesmo lado.', 'Avance 2 (chave), vire 2 vezes, avance 2, vire à esquerda, avance 2, vire à esquerda e avance 4.'],
    blocks: MOVE, concepts: ['sequence'],
    rule: { type: 'maxBlocks', n: 14, text: 'Usar no máximo 14 blocos' },
    variants: [{ dir: 'E', map: [
      '######',
      '#S.K##',
      '#.####',
      '#..D.E',
      '######'] }],
    solution: prog(['F', 'F', 'L', 'L', 'F', 'F', 'L', 'F', 'F', 'L', 'F', 'F', 'F', 'F'])
  });
  level({
    id: 5, world: 1, title: 'Primeiro grande escape',
    story: 'Um labirinto de verdade! Byte precisa da sua ajuda para não se perder. Pegue os cristais no caminho!',
    objective: 'Atravesse o labirinto e colete os 2 cristais 💎.',
    concept: 'Para resolver um problema grande, divida em partes pequenas: um trecho do caminho de cada vez.',
    hints: ['Monte o programa aos poucos: execute, veja até onde o Byte chega e continue.', 'Siga o corredor: direita, baixo, esquerda, baixo, direita e sobe até o portal.', 'Os cristais ficam no próprio caminho.'],
    blocks: MOVE, concepts: ['sequence'],
    rule: { type: 'maxBlocks', n: 19, text: 'Usar no máximo 19 blocos' },
    variants: [{ dir: 'E', map: [
      '#######',
      '#S..###',
      '###.###',
      '#C..#E#',
      '#.###.#',
      '#..C..#',
      '#######'] }],
    solution: prog(['F', 'F', 'R', 'F', 'F', 'R', 'F', 'F', 'L', 'F', 'F', 'L', 'F', 'F', 'F', 'F', 'L', 'F', 'F'])
  });

  /* ================= MUNDO 2 ================= */
  level({
    id: 6, world: 2, title: 'Corredor infinito',
    story: 'Na Floresta das Repetições os corredores parecem não ter fim. Que tal ensinar o Byte a repetir?',
    objective: 'Use o bloco REPETIR para avançar 4 vezes.',
    concept: 'Um LAÇO DE REPETIÇÃO executa os mesmos comandos várias vezes. Em vez de 4 blocos “avançar”, basta “repetir 4 vezes: avançar”.',
    hints: ['Procure o bloco “repetir” na categoria Repetição.', 'Coloque o “avançar” DENTRO da boca do bloco repetir.', 'Repetir 4 vezes: avançar.'],
    blocks: MOVE.concat(LOOP), concepts: ['loop'], newBlocks: ['repeat'],
    rule: { type: 'maxBlocks', n: 2, text: 'Usar no máximo 2 blocos' },
    variants: [{ dir: 'E', map: [
      '#######',
      '#S.B.E#',
      '#######'] }],
    solution: prog([['rep', 4, ['F']]])
  });
  level({
    id: 7, world: 2, title: 'Escadaria robótica',
    story: 'Uma escada de pedras sobe pela floresta. Cada degrau é igualzinho ao outro…',
    objective: 'Suba a escadaria até o portal.',
    concept: 'Quando um PADRÃO se repete (avançar, esquerda, avançar, direita), colocamos o padrão inteiro dentro do REPETIR.',
    hints: ['Descubra os comandos de UM degrau.', 'Um degrau: avançar, virar à esquerda, avançar, virar à direita.', 'Repetir 4 vezes: avançar, esquerda, avançar, direita.'],
    blocks: MOVE.concat(LOOP), concepts: ['loop'],
    rule: { type: 'maxBlocks', n: 5, text: 'Usar no máximo 5 blocos' },
    variants: [{ dir: 'E', map: [
      '#######',
      '#####E#',
      '####..#',
      '###..##',
      '##..###',
      '#S.####',
      '#######'] }],
    solution: prog([['rep', 4, ['F', 'L', 'F', 'R']]])
  });
  level({
    id: 8, world: 2, title: 'Energia perdida',
    story: 'As baterias da floresta se espalharam em volta de um lago. O caminho dá a volta… sempre do mesmo jeito!',
    objective: 'Colete as 3 baterias 🔋 e chegue ao portal.',
    concept: 'Um bom programador procura o que se repete no caminho. Aqui, cada lado é: avançar 3 vezes e virar à direita.',
    hints: ['O caminho tem 3 lados parecidos.', 'Cada lado: avançar, avançar, avançar, virar à direita.', 'Repetir 3 vezes: avançar, avançar, avançar, direita.'],
    blocks: MOVE.concat(LOOP), concepts: ['loop'], requireBatteries: true,
    rule: { type: 'maxBlocks', n: 5, text: 'Usar no máximo 5 blocos' },
    variants: [{ dir: 'E', map: [
      '######',
      '#S.B.#',
      '####.#',
      '####B#',
      '#EB..#',
      '######'] }],
    solution: prog([['rep', 3, ['F', 'F', 'F', 'R']]])
  });
  level({
    id: 9, world: 2, title: 'Caminho simétrico',
    story: 'Este caminho faz um zigue-zague perfeito, como o desenho de uma cobra. Descubra o padrão!',
    objective: 'Siga o zigue-zague e colete os 2 cristais 💎.',
    concept: 'SIMETRIA: a curva para a direita é igual à curva para a esquerda, só que espelhada. Achar padrões deixa o programa curto.',
    hints: ['Olhe só a primeira “volta” da cobra: até onde ela se repete?', 'Uma volta: avançar 2, direita, avançar 2, direita, avançar 2, esquerda, avançar 2, esquerda.', 'Coloque essa volta dentro de “repetir 2 vezes”.'],
    blocks: MOVE.concat(LOOP), concepts: ['loop'],
    rule: { type: 'maxBlocks', n: 13, text: 'Usar no máximo 13 blocos' },
    variants: [{ dir: 'E', map: [
      '#####',
      '#S..#',
      '###.#',
      '#.C.#',
      '#.###',
      '#.C.#',
      '###.#',
      '#E..#',
      '#####'] }],
    solution: prog([['rep', 2, ['F', 'F', 'R', 'F', 'F', 'R', 'F', 'F', 'L', 'F', 'F', 'L']]])
  });
  level({
    id: 10, world: 2, title: 'Fábrica de comandos',
    story: 'A fábrica da floresta só tem 7 blocos sobrando! Byte vai precisar de um programa bem econômico.',
    objective: 'Chegue ao portal usando no máximo 7 blocos.',
    concept: 'Um REPETIR pode ficar dentro de outro REPETIR. Isso se chama LAÇO ANINHADO e economiza muitos blocos.',
    hints: ['Repare: o caminho tem trechos de 3 casas retas.', '“Avançar 3 vezes” pode virar “repetir 3 vezes: avançar”.', 'Repetir 2 vezes: [repetir 3: avançar], direita, [repetir 3: avançar], esquerda.'],
    blocks: MOVE.concat(LOOP), concepts: ['nested'], maxBlocks: 7,
    rule: { type: 'maxBlocks', n: 7, text: 'Usar no máximo 7 blocos (limite da fábrica)' },
    variants: [{ dir: 'E', map: [
      '#########',
      '#S...####',
      '####.####',
      '####C####',
      '####....#',
      '#######.#',
      '#######C#',
      '#######E#',
      '#########'] }],
    solution: prog([['rep', 2, [['rep', 3, ['F']], 'R', ['rep', 3, ['F']], 'L']]])
  });

  /* ================= MUNDO 3 ================= */
  level({
    id: 11, world: 3, title: 'Sensor de paredes',
    story: 'As salas da fortaleza mudam de tamanho! Um programa decorado não funciona. Byte ganhou um SENSOR de parede.',
    objective: 'Faça um programa que funcione nos 2 mapas.',
    concept: 'Um SENSOR observa o ambiente. Com “SE obstáculo à frente → virar”, Byte decide sozinho, em qualquer mapa.',
    hints: ['O programa será testado em 2 mapas diferentes. Veja os dois nas abas acima do labirinto.', 'Use “repetir até chegar ao portal”. Dentro dele: SE obstáculo à frente → virar à direita.', 'Repetir até chegar ao portal: [se obstáculo à frente: virar à direita], avançar.'],
    blocks: MOVE.concat(LOOP, ['until_goal', 'if', 's_wall']), concepts: ['if', 'loop'], newBlocks: ['until_goal', 'if', 's_wall'],
    rule: { type: 'maxBlocks', n: 5, text: 'Usar no máximo 5 blocos' },
    variants: [
      { dir: 'E', map: [
        '#######',
        '#S....#',
        '#####.#',
        '#E....#',
        '#######'] },
      { dir: 'E', map: [
        '#####',
        '#S..#',
        '###.#',
        '###.#',
        '#E..#',
        '#####'] }],
    solution: prog([['until', [['if', 'wall', ['R']], 'F']]])
  });
  level({
    id: 12, world: 3, title: 'Chave misteriosa',
    story: 'Às vezes a chave está no corredor, às vezes não! Se Byte tiver a chave, a porta é o atalho. Se não tiver, o caminho é outro.',
    objective: 'Funcione nos 2 mapas: com chave e sem chave.',
    concept: 'SE / SENÃO escolhe entre dois caminhos: SE a condição for verdadeira faz uma coisa, SENÃO faz outra.',
    hints: ['Avance até o cruzamento (2 casas). Lá, pergunte: Byte tem chave?', 'SE tem chave: siga em frente pela porta. SENÃO: vire à direita e desça.', 'Avançar 2; se Byte tem chave: avançar 3; senão: direita, avançar 2.'],
    blocks: MOVE.concat(LOOP, ['until_goal', 'if', 'ifelse', 's_wall', 's_key', 's_door']), concepts: ['ifelse'], newBlocks: ['ifelse', 's_key', 's_door'],
    rule: { type: 'maxBlocks', n: 10, text: 'Usar no máximo 10 blocos' },
    variants: [
      { dir: 'E', map: [
        '#######',
        '#SK.D.E',
        '###.###',
        '###.###',
        '#######'] },
      { dir: 'E', map: [
        '#######',
        '#S..D.#',
        '###.###',
        '###E###',
        '#######'] }],
    solution: prog(['F', 'F', ['ifelse', 'key', ['F', 'F', 'F'], ['R', 'F', 'F']]])
  });
  level({
    id: 13, world: 3, title: 'Corredor de lasers',
    story: 'Lasers vermelhos piscam no corredor! Se Byte andar para dentro de um laser ligado, leva um choque.',
    objective: 'Atravesse os lasers sem levar choque.',
    concept: 'Condições ajudam a evitar PERIGOS: “SE laser ligado à frente → esperar, SENÃO → avançar”.',
    hints: ['Os lasers ligam e desligam sozinhos. Byte pode esperar.', 'Use “repetir até chegar ao portal” com um SE/SENÃO dentro.', 'Repetir até o portal: se laser ligado à frente → esperar; senão → avançar.'],
    blocks: MOVE.concat(LOOP, ['until_goal', 'if', 'ifelse', 's_wall', 's_laser', 'wait']), concepts: ['if', 'loop'], newBlocks: ['s_laser', 'wait'],
    lasers: { L: { blink: [2, 2], offset: 0 }, M: { blink: [3, 2], offset: 1 } },
    rule: { type: 'maxTicks', n: 10, text: 'Chegar em até 10 tempos (sem esperas extras)' },
    variants: [{ dir: 'E', map: [
      '##########',
      '#S.L..M.E#',
      '##########'] }],
    solution: prog([['until', [['ifelse', 'laser', ['W'], ['F']]]]])
  });
  level({
    id: 14, world: 3, title: 'Duas possibilidades',
    story: 'No fim do corredor há uma bifurcação. Num mapa, a saída fica à esquerda; no outro, à direita!',
    objective: 'Use SE/SENÃO para escolher o lado certo nos 2 mapas.',
    concept: 'O sensor “caminho à esquerda?” responde SIM ou NÃO. Com SE/SENÃO, o mesmo programa serve para situações diferentes.',
    hints: ['Avance até o fim do corredor (3 casas).', 'SE caminho à esquerda → virar à esquerda, SENÃO → virar à direita.', 'Depois da curva, avance 2 casas.'],
    blocks: MOVE.concat(LOOP, ['until_goal', 'if', 'ifelse', 's_wall', 's_path']), concepts: ['ifelse'], newBlocks: ['s_path'],
    rule: { type: 'maxBlocks', n: 9, text: 'Usar no máximo 9 blocos' },
    variants: [
      { dir: 'N', map: [
        '#######',
        '#E..###',
        '###.###',
        '###.###',
        '###S###',
        '#######'] },
      { dir: 'N', map: [
        '#######',
        '###..E#',
        '###.###',
        '###.###',
        '###S###',
        '#######'] }],
    solution: prog(['F', 'F', 'F', ['ifelse', 'pathL', ['L'], ['R']], 'F', 'F'])
  });
  level({
    id: 15, world: 3, title: 'Labirinto adaptável',
    story: 'A fortaleza se transforma a cada visita! São 3 labirintos diferentes. Só um programa esperto vence todos.',
    objective: 'Crie um programa que vença os 3 labirintos.',
    concept: 'Um algoritmo ADAPTÁVEL usa sensores para decidir: se dá para seguir em frente, segue; senão, procura o caminho livre.',
    hints: ['Repetir até chegar ao portal…', 'SE caminho à frente → avançar. SENÃO → decidir para que lado virar.', 'Senão: SE caminho à esquerda → virar à esquerda, SENÃO → virar à direita.'],
    blocks: MOVE.concat(LOOP, SENS), concepts: ['ifelse', 'loop'],
    rule: { type: 'maxBlocks', n: 8, text: 'Usar no máximo 8 blocos' },
    variants: [
      { dir: 'E', map: [
        '#######',
        '#S..###',
        '###.###',
        '#..C###',
        '#.#####',
        '#...CE#',
        '#######'] },
      { dir: 'E', map: [
        '#######',
        '#####E#',
        '#####C#',
        '#S.C..#',
        '#######'] },
      { dir: 'S', map: [
        '#######',
        '#S#.C.#',
        '#.#.#.#',
        '#.C.#E#',
        '#######'] }],
    solution: prog([['until', [['ifelse', 'pathF', ['F'], [['ifelse', 'pathL', ['L'], ['R']]]]]]])
  });

  /* ================= MUNDO 4 ================= */
  level({
    id: 16, world: 4, title: 'Bateria limitada',
    story: 'Alerta! A bateria do Byte está quase no fim. Cada passo gasta 1 de energia. O caminho mais curto nem sempre é o melhor…',
    objective: 'Chegue ao portal sem ficar sem energia ⚡.',
    concept: 'Planejar recursos: antes de executar, calcule quanta energia o caminho gasta e onde recarregar.',
    hints: ['Byte começa com 3 de energia. Cada bateria dá +3.', 'Pelo caminho de cima a energia acaba antes do portal.', 'Desça pela esquerda (4 casas), vire à esquerda e avance 6.'],
    blocks: MOVE.concat(LOOP, SENS, ['s_energy']), concepts: ['loop'], newBlocks: ['s_energy'],
    energy: { start: 3, battery: 3 },
    rule: { type: 'minEnergy', n: 2, text: 'Chegar com pelo menos 2 de energia' },
    variants: [{ dir: 'S', map: [
      '#########',
      '#S......#',
      '#.#####.#',
      '#B#####.#',
      '#.#####.#',
      '#B..B..E#',
      '#########'] }],
    solution: prog([['rep', 4, ['F']], 'L', ['rep', 6, ['F']]])
  });
  level({
    id: 17, world: 4, title: 'Contador de cristais',
    story: 'O portal do laboratório faz uma pergunta: “Quantos cristais você coletou?”. Byte precisa CONTAR!',
    objective: 'Crie a variável “cristais”, some 1 a cada cristal e chegue ao portal.',
    concept: 'Uma VARIÁVEL é uma caixinha com nome que guarda um número. Ela começa com um valor e pode aumentar ou diminuir.',
    hints: ['Comece com “criar variável cristais com valor 0”.', 'Dentro de “repetir até chegar ao portal”: SE cristal à frente → avançar e adicionar 1 a cristais; SENÃO → avançar.', 'O portal confere se a variável é igual ao número de cristais coletados.'],
    blocks: MOVE.concat(LOOP, SENS, ['var_set', 'var_add', 'var_sub', 'var_cmp']), concepts: ['variable', 'loop'], newBlocks: ['var_set', 'var_add', 'var_sub', 'var_cmp'],
    portalVar: 'cristais',
    rule: { type: 'portalVar', text: 'O portal confere a variável “cristais”' },
    variants: [
      { dir: 'E', map: [
        '###########',
        '#SC.CC..CE#',
        '###########'] },
      { dir: 'E', map: [
        '###########',
        '#S..C.C.CE#',
        '###########'] }],
    solution: prog([['set', 'cristais', 0], ['until', [['ifelse', ['item', 'crystal'], ['F', ['add', 'cristais', 1]], ['F']]]]])
  });
  level({
    id: 18, world: 4, title: 'Código corrompido',
    story: 'Um vírus bagunçou o programa do Byte! O código já está montado, mas tem ERROS. Você consegue consertar?',
    objective: 'Encontre e corrija os erros do programa.',
    concept: 'DEPURAR é encontrar e corrigir erros (bugs). Execute, observe onde o Byte erra e mude só o que está errado.',
    hints: ['Execute primeiro para ver o que acontece. Use o botão Pausar para observar.', 'Cada degrau desce para a direita: avançar, direita, avançar, esquerda.', 'Há 2 erros: o número de repetições (deve ser 3) e o último giro (deve ser à esquerda).'],
    blocks: MOVE.concat(LOOP, SENS, LAB), concepts: ['loop'],
    startProgram: prog([['rep', 2, ['F', 'R', 'F', 'R']]]),
    rule: { type: 'maxBlocks', n: 5, text: 'Corrigir sem aumentar o programa (máx. 5 blocos)' },
    variants: [{ dir: 'E', map: [
      '######',
      '#S.###',
      '##C.##',
      '###C.#',
      '####E#',
      '######'] }],
    solution: prog([['rep', 3, ['F', 'R', 'F', 'L']]])
  });
  level({
    id: 19, world: 4, title: 'Caminho econômico',
    story: 'Um caracol gigante de corredores! Escrever cada passo daria um programa enorme. Só cabem 6 blocos.',
    objective: 'Chegue ao centro do caracol com no máximo 6 blocos.',
    concept: 'OTIMIZAR é fazer o mesmo trabalho com menos comandos. Laços e sensores juntos criam programas curtos e poderosos.',
    hints: ['Todas as curvas do caracol são para o mesmo lado.', 'Lembra do sensor de parede da Fortaleza?', 'Repetir até chegar ao portal: se obstáculo à frente → direita, senão → avançar.'],
    blocks: MOVE.concat(LOOP, SENS, LAB), concepts: ['loop', 'if'], maxBlocks: 6,
    rule: { type: 'maxBlocks', n: 6, text: 'Usar no máximo 6 blocos (limite)' },
    variants: [{ dir: 'E', map: [
      '#########',
      '#S......#',
      '#######.#',
      '#.....#.#',
      '#.###.#C#',
      '#.#E..#.#',
      '#.#####.#',
      '#..C....#',
      '#########'] }],
    solution: prog([['until', [['ifelse', 'wall', ['R'], ['F']]]]])
  });
  level({
    id: 20, world: 4, title: 'Programação completa',
    story: 'O último teste do laboratório: um corredor sinuoso, uma porta trancada e o portal que pergunta quantos cristais Byte pegou.',
    objective: 'Conte os cristais, pegue a chave e chegue ao portal.',
    concept: 'Programas reais combinam tudo: REPETIÇÃO para continuar, CONDIÇÕES para decidir e VARIÁVEIS para lembrar.',
    hints: ['Comece criando a variável cristais com valor 0.', 'No repetir até o portal: SE cristal à frente → adicionar 1 a cristais.', 'Depois: SE caminho à frente → avançar; SENÃO → SE caminho à esquerda → esquerda; SENÃO → direita.'],
    blocks: MOVE.concat(LOOP, SENS, LAB), concepts: ['loop', 'if', 'variable'],
    portalVar: 'cristais',
    rule: { type: 'portalVar', text: 'O portal confere a variável “cristais”' },
    variants: [{ dir: 'E', map: [
      '#########',
      '#S.C.####',
      '####.####',
      '#.C..####',
      '#.#######',
      '#K..C.D.E',
      '#########'] }],
    solution: prog([['set', 'cristais', 0], ['until', [['if', ['item', 'crystal'], [['add', 'cristais', 1]]], ['ifelse', 'pathF', ['F'], [['ifelse', 'pathL', ['L'], ['R']]]]]]])
  });

  /* ================= MUNDO 5 ================= */
  var MAZE = prog([['until', [['ifelse', 'pathF', ['F'], [['ifelse', 'pathL', ['L'], ['R']]]]]]]);
  level({
    id: 21, world: 5, title: 'Labirinto misterioso',
    story: 'Uma névoa digital cobre o Núcleo. Byte só enxerga as casas pertinho dele, e o labirinto muda a cada teste!',
    objective: 'Vença os 3 labirintos escondidos pela névoa.',
    concept: 'Quando não dá para ver o mapa inteiro, um algoritmo baseado em SENSORES encontra a saída sozinho.',
    hints: ['Você não precisa ver o mapa: confie nos sensores!', 'Use o mesmo raciocínio do Labirinto adaptável.', 'Repetir até o portal: se caminho à frente → avançar; senão: se caminho à esquerda → esquerda; senão → direita.'],
    blocks: ALL, concepts: ['loop', 'ifelse'], fog: true,
    rule: { type: 'maxBlocks', n: 8, text: 'Usar no máximo 8 blocos' },
    variants: [
      { dir: 'E', map: [
        '########',
        '#S.#...#',
        '##.#.#.#',
        '#..#C#.#',
        '#.##.#.#',
        '#...C#E#',
        '########'] },
      { dir: 'E', map: [
        '########',
        '#S..C..#',
        '######.#',
        '#E.#...#',
        '##.#C###',
        '##...###',
        '########'] },
      { dir: 'W', map: [
        '#######',
        '#..E###',
        '#C#####',
        '#...CS#',
        '#######'] }],
    solution: MAZE
  });
  level({
    id: 22, world: 5, title: 'O perseguidor',
    story: 'Um vírus vermelho persegue o Byte! A cada comando ele dá um passo. Se Byte ficar parado 3 tempos seguidos, é pego!',
    objective: 'Fuja do perseguidor e chegue ao portal.',
    concept: 'EFICIÊNCIA no tempo: cada comando conta. Giros e esperas desnecessários deixam o perseguidor alcançar o Byte.',
    hints: ['Não use “esperar” e não dê meia-volta: o vírus vem logo atrás.', 'Um algoritmo com sensores segue o corredor sem desperdiçar comandos.', 'Repetir até o portal: se caminho à frente → avançar; senão: se caminho à esquerda → esquerda; senão → direita.'],
    blocks: ALL, concepts: ['loop', 'if'],
    chaser: { trail: [[2, 1], [3, 1], [4, 1]] },
    rule: { type: 'maxBlocks', n: 8, text: 'Usar no máximo 8 blocos' },
    variants: [{ dir: 'E', map: [
      '###########',
      '#....S..###',
      '#######.###',
      '###..C..###',
      '###.#######',
      '###...C..E#',
      '###########'] }],
    solution: MAZE
  });
  level({
    id: 23, world: 5, title: 'Sala dos interruptores',
    story: 'Dois lasers fecham a saída. Cada interruptor desliga um laser. Byte precisa passar pelos dois antes de sair!',
    objective: 'Pise nos 2 interruptores e atravesse os lasers desligados.',
    concept: 'Planejar a ORDEM das tarefas: primeiro desligar os lasers, depois atravessar. Use REPETIR para os trechos retos.',
    hints: ['Interruptor da esquerda (T) desliga o laser de cima. O da direita (U) desliga o de baixo.', 'Caminho: oeste até a parede, sobe, atravessa o corredor de cima, desce e volta ao centro.', 'No centro, vire para o sul e avance 3 casas.'],
    blocks: ALL, concepts: ['loop'],
    lasers: { L: {}, M: {} }, switches: { T: ['L'], U: ['M'] },
    rule: { type: 'maxBlocks', n: 17, text: 'Usar no máximo 17 blocos' },
    variants: [{ dir: 'W', map: [
      '#########',
      '#T.....U#',
      '#.#####.#',
      '#...S...#',
      '####L####',
      '####M####',
      '####E####',
      '#########'] }],
    solution: prog([['rep', 3, ['F']], 'R', ['rep', 2, ['F']], 'R', ['rep', 6, ['F']], 'R', ['rep', 2, ['F']], 'R', ['rep', 3, ['F']], 'L', ['rep', 3, ['F']]])
  });
  level({
    id: 24, world: 5, title: 'Último circuito',
    story: 'O circuito final tem lasers piscando, uma porta trancada e pouca energia. Pense em tudo antes de executar!',
    objective: 'Chegue ao portal com energia, sem levar choque.',
    concept: 'Condições ENCADEADAS: primeiro checar o perigo, depois checar o caminho. A ordem das perguntas importa!',
    hints: ['Byte começa com 6 de energia e cada bateria dá +6. Esperar não gasta energia.', 'Repetir até o portal: SE laser ligado à frente → esperar…', '…SENÃO: SE caminho à frente → avançar, SENÃO → virar à direita.'],
    blocks: ALL, concepts: ['loop', 'if'],
    energy: { start: 6, battery: 6 },
    lasers: { L: { blink: [2, 2], offset: 0 }, M: { blink: [2, 3], offset: 2 } },
    rule: { type: 'minEnergy', n: 1, text: 'Chegar com pelo menos 1 de energia' },
    variants: [{ dir: 'E', map: [
      '##########',
      '#S.L.B.M.#',
      '########K#',
      '#E.D.B...#',
      '##########'] }],
    solution: prog([['until', [['ifelse', 'laser', ['W'], [['ifelse', 'pathF', ['F'], ['R']]]]]]])
  });
  level({
    id: 25, world: 5, title: 'O grande escape',
    story: 'É agora! O último labirinto tem de tudo: laser, drone de segurança, interruptor, chave e porta. Byte confia em você!',
    objective: 'Escape do Núcleo do Algoritmo!',
    concept: 'Você aprendeu SEQUÊNCIA, REPETIÇÃO, CONDIÇÕES, SENSORES e VARIÁVEIS: as peças de todo programa de computador!',
    hints: ['O sensor “perigo à frente?” vê lasers ligados e drones.', 'Repetir até o portal: SE perigo à frente → esperar; SENÃO → seguir o caminho.', 'Seguir o caminho: se caminho à frente → avançar; senão: se caminho à esquerda → esquerda; senão → direita.'],
    blocks: ALL, concepts: ['loop', 'ifelse'], newBlocks: ['s_danger'],
    lasers: { L: { blink: [2, 2], offset: 0 }, M: {} }, switches: { T: ['M'] },
    drones: [{ path: [[6, 2], [6, 3], [6, 4]] }],
    rule: { type: 'maxBlocks', n: 11, text: 'Usar no máximo 11 blocos' },
    variants: [{ dir: 'E', map: [
      '###########',
      '#S.C.L..T.#',
      '######|##.#',
      '#.K.B...C.#',
      '#.####|####',
      '#..M.D.C.E#',
      '###########'] }],
    solution: prog([['until', [['ifelse', 'danger', ['W'], [['ifelse', 'pathF', ['F'], [['ifelse', 'pathL', ['L'], ['R']]]]]]]]])
  });

  LA.LEVELS = L;
  LA.levelById = function (id) {
    for (var i = 0; i < L.length; i++) if (String(L[i].id) === String(id)) return L[i];
    return null;
  };
  LA.levelsOfWorld = function (w) { return L.filter(function (l) { return l.world === w; }); };
})(globalThis.LA = globalThis.LA || {});
