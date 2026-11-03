import type { Tile } from './types';

/**
 * Blocos (tiles) do Kodu usados nas fases.
 * Os rótulos em inglês foram conferidos no arquivo de cartas do código-fonte oficial
 * do Kodu Game Lab (Microsoft/KoduGameLab, Content/Xml/Localizable/EN/Cards.xml).
 * A tradução para português do próprio Kodu mantém a maioria dos rótulos em inglês.
 */
const t = (kind: Tile['kind']) => (label: string, pt?: string): Tile => ({ label, kind, pt });

export const sensor = t('sensor');
export const filter = t('filter');
export const action = t('action');
export const modifier = t('modifier');

/** WHEN vazio: o Kodu entende como "sempre". */
export const ALWAYS: Tile[] = [];

export const T = {
  // Sensores (WHEN)
  see: sensor('see', 'ver'),
  hear: sensor('hear', 'ouvir'),
  bumped: sensor('bumped', 'encostar/colidir'),
  keyboard: sensor('keyboard', 'teclado'),
  gamepad: sensor('gamepad', 'controle'),
  mouse: sensor('mouse', 'mouse'),
  timer: sensor('timer', 'temporizador'),
  got: sensor('got', 'pegou/está segurando'),
  scored: sensor('scored', 'pontuação'),
  health: sensor('health', 'saúde/vida'),
  onWater: sensor('on water', 'sobre a água'),
  onLand: sensor('on land', 'sobre o terreno'),
  endOfPath: sensor('end of path', 'fim do caminho'),

  // Filtros (complementos do WHEN)
  apple: filter('apple', 'maçã'),
  coin: filter('coin', 'moeda'),
  star: filter('star', 'estrela'),
  heart: filter('heart', 'coração'),
  tree: filter('tree', 'árvore'),
  rock: filter('rock', 'pedra'),
  castle: filter('castle', 'castelo'),
  kodu: filter('kodu', 'Kodu'),
  cycle: filter('cycle', 'Cycle'),
  turtle: filter('turtle', 'tartaruga'),
  saucer: filter('saucer', 'disco voador'),
  anything: filter('anything', 'qualquer coisa'),
  arrows: filter('Arrows', 'setas do teclado'),
  wasd: filter('WASD', 'teclas W A S D'),
  space: filter('Space', 'barra de espaço'),
  lstick: filter('L stick', 'alavanca esquerda'),
  red: filter('red', 'vermelho'),
  blue: filter('blue', 'azul'),
  yellow: filter('yellow', 'amarelo'),
  green: filter('green', 'verde'),
  not: filter('not', 'não'),
  closeBy: filter('close by', 'perto'),
  farAway: filter('far away', 'longe'),
  gteq: filter('>=', 'maior ou igual a'),
  lteq: filter('<=', 'menor ou igual a'),
  below: filter('below', 'abaixo de'),
  above: filter('above', 'acima de'),
  equals: filter('equals', 'igual a'),
  sec1: filter('1 second', '1 segundo'),
  sec3: filter('3 seconds', '3 segundos'),
  sec5: filter('5 seconds', '5 segundos'),
  sec10: filter('10 seconds', '10 segundos'),

  // Ações (DO)
  move: action('move', 'mover'),
  turn: action('turn', 'virar'),
  jump: action('jump', 'pular'),
  eat: action('eat', 'comer'),
  grab: action('grab', 'pegar'),
  drop: action('drop', 'soltar'),
  say: action('say', 'dizer'),
  express: action('express', 'expressar'),
  color: action('color', 'mudar cor'),
  glow: action('glow', 'brilhar'),
  play: action('play', 'tocar som'),
  score: action('score', 'somar pontos'),
  subtract: action('subtract', 'subtrair pontos'),
  setScore: action('set score', 'definir pontuação'),
  win: action('win', 'vencer'),
  end: action('end', 'fim de jogo'),
  vanish: action('vanish', 'desaparecer'),
  boom: action('boom', 'explodir'),
  switchPage: action('switch', 'trocar de página'),
  shoot: action('shoot', 'atirar'),
  create: action('create', 'criar'),
  damage: action('damage', 'causar dano'),

  // Modificadores (complementos do DO)
  wander: modifier('wander', 'vagar'),
  toward: modifier('toward', 'em direção a'),
  away: modifier('away', 'para longe'),
  forward: modifier('forward', 'para frente'),
  onPath: modifier('on path', 'pelo caminho'),
  quickly: modifier('quickly', 'rápido'),
  slowly: modifier('slowly', 'devagar'),
  left: modifier('left', 'esquerda'),
  right: modifier('right', 'direita'),
  it: modifier('it', 'isso (o objeto percebido)'),
  me: modifier('me', 'eu mesmo'),
  once: modifier('once', 'uma vez'),
  happy: modifier('happy', 'feliz'),
  sad: modifier('sad', 'triste'),
  hearts: modifier('hearts', 'corações'),
  stars: modifier('stars', 'estrelas'),
  mRed: modifier('red', 'vermelho'),
  mBlue: modifier('blue', 'azul'),
  mYellow: modifier('yellow', 'amarelo'),
  mGreen: modifier('green', 'verde'),
  off: modifier('off', 'desligar'),
  page1: modifier('page 1', 'página 1'),
  page2: modifier('page 2', 'página 2'),
  pts0: modifier('0 points', '0 pontos'),
  pts1: modifier('1 point', '1 ponto'),
  pts2: modifier('2 points', '2 pontos'),
  pts3: modifier('3 points', '3 pontos'),
  pts5: modifier('5 points', '5 pontos'),
  pts10: modifier('10 points', '10 pontos'),
  pts20: modifier('20 points', '20 pontos'),
  pts50: modifier('50 points', '50 pontos'),
  mApple: modifier('apple', 'maçã'),
  mCoin: modifier('coin', 'moeda'),
};

/** Texto digitado em uma ação "say" (aparece no Kodu como um bloco com o texto). */
export const text = (s: string): Tile => ({ label: `"${s}"`, kind: 'modifier', pt: 'texto digitado' });
/** Filtro de pontos usado no WHEN (ex.: WHEN scored red >= 10 points). */
export const points = (n: number): Tile => ({ label: `${n} ${n === 1 ? 'point' : 'points'}`, kind: 'filter', pt: `${n} ${n === 1 ? 'ponto' : 'pontos'}` });
