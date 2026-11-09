/** Níveis, conquistas e medalhas. A gamificação valoriza a persistência e a evolução individual. */

export interface AchievementCtx {
  xp: number;
  missions: Record<string, { quiz?: boolean; activity?: boolean; done?: boolean; challenge?: boolean }>;
  counters: Record<string, number>;
  seen: Record<string, string[]>;
  games: Record<string, { best: number; plays: number }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  /** como conseguir (mostrado quando ainda está bloqueada) */
  how: string;
  icon: string;
  color: string;
  test: (c: AchievementCtx) => boolean;
}

const done = (c: AchievementCtx, n: number) => !!c.missions[`m${n}`]?.done;
const allDone = (c: AchievementCtx, from: number, to: number) => {
  for (let i = from; i <= to; i++) if (!done(c, i)) return false;
  return true;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'explorador-placa', name: 'Explorador da placa', description: 'Conheceu as 12 partes do Arduino Uno.', how: 'Clique em todas as partes do Arduino interativo.', icon: 'cpu', color: '#3a6cf4', test: (c) => (c.seen.arduinoParts?.length ?? 0) >= 12 },
  { id: 'primeiro-circuito', name: 'Primeiro circuito montado', description: 'Montou um circuito com LED e resistor que funciona.', how: 'Conclua a atividade de montagem da Missão 04 ou 05.', icon: 'lightbulb', color: '#f5b800', test: (c) => !!c.missions.m4?.activity || !!c.missions.m5?.activity },
  { id: 'mestre-protoboard', name: 'Mestre da protoboard', description: 'Entendeu as conexões internas da protoboard.', how: 'Conclua a Missão 02 e todos os desafios do Laboratório da Protoboard.', icon: 'grid', color: '#7c4dff', test: (c) => done(c, 2) && (c.counters.protoChallenges ?? 0) >= 4 },
  { id: 'programador-iniciante', name: 'Programador iniciante', description: 'Fez o primeiro LED piscar com programação.', how: 'Conclua a Missão 07.', icon: 'code', color: '#16b862', test: (c) => done(c, 7) },
  { id: 'cacador-erros', name: 'Caçador de erros', description: 'Encontrou e corrigiu erros em circuitos.', how: 'Faça 6 pontos no Detetive de circuitos ou corrija o circuito da Missão 05.', icon: 'search', color: '#e5484d', test: (c) => (c.games.detetive?.best ?? 0) >= 6 || !!c.missions.m5?.activity },
  { id: 'inventor-circuitos', name: 'Inventor de circuitos', description: 'Verificou 5 montagens corretas na bancada virtual.', how: 'Monte e verifique 5 circuitos corretos.', icon: 'zap', color: '#f76b15', test: (c) => (c.counters.circuitsOk ?? 0) >= 5 },
  { id: 'mestre-blocos', name: 'Mestre dos blocos', description: 'Criou um programa com blocos e viu o código gerado.', how: 'Monte um programa com pelo menos 5 blocos.', icon: 'blocks', color: '#7c4dff', test: (c) => (c.counters.blocksProgram ?? 0) >= 1 },
  { id: 'calculista', name: 'Calculista dos resistores', description: 'Acertou 5 exercícios de cores dos resistores.', how: 'Acerte 5 exercícios na Calculadora de resistores.', icon: 'calculator', color: '#0f9a50', test: (c) => (c.counters.resistorOk ?? 0) >= 5 },
  { id: 'curioso', name: 'Pesquisador curioso', description: 'Leu 8 páginas da Enciclopédia de componentes.', how: 'Abra 8 componentes na Enciclopédia.', icon: 'book', color: '#2453d6', test: (c) => (c.seen.encyclopedia?.length ?? 0) >= 8 },
  { id: 'persistente', name: 'Persistente', description: 'Tentou de novo depois de errar 10 vezes. Errar faz parte de aprender!', how: 'Continue tentando depois de errar (10 vezes).', icon: 'repeat', color: '#a87700', test: (c) => (c.counters.retries ?? 0) >= 10 },
  { id: 'jogador', name: 'Desafiante', description: 'Jogou os 6 jogos e desafios.', how: 'Jogue todos os 6 jogos.', icon: 'gamepad', color: '#5524c9', test: (c) => ['detetive', 'onde-conectar', 'organize', 'componente', 'preveja', 'logica'].every((g) => (c.games[g]?.plays ?? 0) > 0) },
  { id: 'nivel-1', name: 'Primeiros passos', description: 'Concluiu as missões 1 a 5.', how: 'Conclua o Nível 1.', icon: 'footprints', color: '#16b862', test: (c) => allDone(c, 1, 5) },
  { id: 'nivel-2', name: 'Primeiros comandos', description: 'Concluiu as missões 6 a 10.', how: 'Conclua o Nível 2.', icon: 'terminal', color: '#3a6cf4', test: (c) => allDone(c, 6, 10) },
  { id: 'nivel-3', name: 'Inventando soluções', description: 'Concluiu as missões 11 a 15.', how: 'Conclua o Nível 3.', icon: 'sparkles', color: '#7c4dff', test: (c) => allDone(c, 11, 15) },
  { id: 'engenheiro-arduino', name: 'Engenheiro Arduino', description: 'Concluiu todas as 20 missões. Parabéns, inventor!', how: 'Conclua as 20 missões.', icon: 'trophy', color: '#f5b800', test: (c) => allDone(c, 1, 20) },
];

export interface Level {
  index: number;
  name: string;
  min: number;
  next: number | null;
}

const LEVELS: [string, number][] = [
  ['Aprendiz de inventor', 0],
  ['Explorador de circuitos', 250],
  ['Montador habilidoso', 650],
  ['Programador criativo', 1200],
  ['Inventor brilhante', 1900],
  ['Engenheiro Arduino', 2700],
];

export function levelFor(xp: number): Level {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][1]) i++;
  return { index: i, name: LEVELS[i][0], min: LEVELS[i][1], next: i + 1 < LEVELS.length ? LEVELS[i + 1][1] : null };
}

export const LEVEL_NAMES = LEVELS.map((l) => l[0]);
