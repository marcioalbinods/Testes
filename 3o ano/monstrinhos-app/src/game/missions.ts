import type { GameData } from './types';

export type ToolId =
  | 'criatura' | 'animacao' | 'expressoes' | 'danca' | 'sons' | 'apresentacao'
  | 'personalidade' | 'comida' | 'poder' | 'gostos' | 'passaporte'
  | 'habitat' | 'explorar'
  | 'floresta' | 'amigo' | 'ponte' | 'tempestade' | 'festa'
  | 'historia';

export interface StageDef {
  id: number;
  name: string;
  short: string;
  goal: string;
  color: string;
  dark: string;
  icon: string;
}

export const STAGES: StageDef[] = [
  { id: 1, name: 'O Laboratório de Criação', short: 'Laboratório', goal: 'Invente uma criatura única!', color: '#9b6bff', dark: '#5a34b8', icon: '🧪' },
  { id: 2, name: 'Dê Vida ao seu Monstrinho', short: 'Vida', goal: 'Movimentos, caras e sons!', color: '#ff5fa2', dark: '#c22e72', icon: '🎵' },
  { id: 3, name: 'Quem é meu Monstrinho?', short: 'Identidade', goal: 'Jeito, gostos e passaporte!', color: '#ff9a3c', dark: '#c4621a', icon: '🪪' },
  { id: 4, name: 'Construa seu Habitat', short: 'Habitat', goal: 'Um mundo só dele!', color: '#4fc35a', dark: '#2a8a36', icon: '🏝️' },
  { id: 5, name: 'As Grandes Aventuras', short: 'Aventuras', goal: 'Desafios e amigos!', color: '#32b8e5', dark: '#1a7fa6', icon: '🗺️' },
  { id: 6, name: 'Meu Estúdio de Histórias', short: 'Histórias', goal: 'Crie e publique uma história!', color: '#ffc93c', dark: '#c48f10', icon: '🎬' },
];

export interface MissionDef {
  id: number;
  stage: number;
  title: string;
  intro: string; // pequena introdução narrativa (fala do Zuzu)
  task: string; // instrução curta
  icon: string;
  tool: ToolId;
  /** Aba ou modo para abrir a ferramenta. */
  focus?: string;
  check: (g: GameData) => boolean;
  /** Dica curta mostrada enquanto a missão não está pronta. */
  need: string;
  /** Estrelas extras (0 a 2) pela criatividade e experimentação. */
  bonus: (g: GameData) => number;
}

const triedSlot = (g: GameData, slot: string) => g.monster.tried.filter((t) => t.startsWith(slot + ':'));
const b = (...conds: boolean[]) => conds.filter(Boolean).length;
const clipsIn = (g: GameData) => g.sounds.track.lanes.flat().filter(Boolean).length;
const lanesUsed = (g: GameData) => g.sounds.track.lanes.filter((l) => l.some(Boolean)).length;
const STRUCT = ['arvore', 'pinheiro', 'palmeira', 'cacto', 'pedra', 'rochedo', 'montanha', 'rio', 'lago', 'cachoeira', 'casa', 'cabana', 'iglu', 'caverna', 'ponte', 'castelo', 'cogumelo-gigante', 'coral', 'tronco', 'nave', 'farol', 'duna', 'cristal-gigante'];
const LIVING = ['coelho', 'passaro', 'borboleta', 'peixe', 'sapo', 'tartaruga', 'caracol', 'polvo', 'pinguim', 'joaninha', 'camelo', 'baleia', 'estrela-mar', 'alien'];
export const isStructure = (type: string) => STRUCT.includes(type);
export const isLiving = (type: string) => LIVING.includes(type);
const currentStory = (g: GameData) => g.stories.stories.find((s) => s.id === g.stories.currentId) ?? g.stories.stories[0];
const frameHasText = (f: { balloons: { text: string }[]; caption: string }) => f.caption.trim().length > 1 || f.balloons.some((x) => x.text.trim().length > 1);

export const MISSIONS: MissionDef[] = [
  // ---------------- Etapa 1
  {
    id: 1, stage: 1, title: 'Escolha a cabeça', icon: '🟣', tool: 'criatura', focus: 'head',
    intro: 'Olá! Eu sou o Zuzu, ajudante do laboratório. Vamos inventar uma criatura que nunca existiu!',
    task: 'Toque nas cabeças e escolha a sua favorita.',
    need: 'Toque em uma cabeça.',
    check: (g) => triedSlot(g, 'head').length >= 1,
    bonus: (g) => b(triedSlot(g, 'head').length >= 3, g.monster.skin !== '#7cc9ff' || (g.monster.parts.head?.scale ?? 1) !== 1),
  },
  {
    id: 2, stage: 1, title: 'Crie os olhos', icon: '👀', tool: 'criatura', focus: 'eyes',
    intro: 'Todo monstrinho precisa ver o mundo! Quantos olhos o seu vai ter?',
    task: 'Escolha os olhos e a cor deles.',
    need: 'Escolha um tipo de olho.',
    check: (g) => triedSlot(g, 'eyes').length >= 1,
    bonus: (g) => b(triedSlot(g, 'eyes').length >= 3, !!g.monster.parts.eyes?.color || (g.monster.parts.eyes?.scale ?? 1) !== 1 || g.monster.parts.eyes?.dy !== 0),
  },
  {
    id: 3, stage: 1, title: 'A boca e a expressão', icon: '👄', tool: 'criatura', focus: 'mouth',
    intro: 'Agora a boca! Ela mostra se o monstrinho é sorridente, dentuço ou bagunceiro.',
    task: 'Escolha uma boca. Experimente várias!',
    need: 'Escolha uma boca.',
    check: (g) => triedSlot(g, 'mouth').length >= 1,
    bonus: (g) => b(triedSlot(g, 'mouth').length >= 3, (g.monster.parts.mouth?.scale ?? 1) !== 1 || !!g.monster.parts.mouth?.color || g.monster.parts.mouth?.dy !== 0),
  },
  {
    id: 4, stage: 1, title: 'Monte o corpo e os membros', icon: '🦵', tool: 'criatura', focus: 'body',
    intro: 'Hora de montar o corpo! Braços, pernas, cauda, asas, chifres... você decide!',
    task: 'Escolha o corpo e pelo menos um braço, perna, cauda ou asa.',
    need: 'Escolha um corpo e um membro.',
    check: (g) => triedSlot(g, 'body').length >= 1 && ['arms', 'legs', 'tail', 'wings'].some((s) => triedSlot(g, s).length >= 1),
    bonus: (g) => b(['ears', 'horns', 'antennae', 'spikes', 'tail', 'wings'].filter((s) => !!(g.monster.parts as Record<string, unknown>)[s]).length >= 2, g.monster.tried.includes('tool:move') || g.monster.tried.includes('tool:size')),
  },
  {
    id: 5, stage: 1, title: 'Cores, acessórios e nome', icon: '🎨', tool: 'criatura', focus: 'colors',
    intro: 'Quase pronto! Pinte, enfeite e depois aperte CRIAR MEU MONSTRINHO para ele nascer.',
    task: 'Pinte, enfeite e dê um nome à criatura.',
    need: 'Toque em CRIAR MEU MONSTRINHO! e dê um nome.',
    check: (g) => g.monster.born && g.monster.name.trim().length >= 2,
    bonus: (g) => b(g.monster.accessories.length >= 1, g.monster.texture !== 'liso' || g.monster.tried.filter((t) => t.startsWith('color:')).length >= 3),
  },
  // ---------------- Etapa 2
  {
    id: 6, stage: 2, title: 'Escolha uma animação', icon: '🏃', tool: 'animacao',
    intro: 'Seu monstrinho nasceu, mas está paradinho. Vamos ensinar ele a se mexer!',
    task: 'Teste os movimentos e escolha o favorito.',
    need: 'Escolha um movimento favorito.',
    check: (g) => !!g.life.favoriteAnim,
    bonus: (g) => b(g.life.tried.length >= 4, Object.values(g.life.settings).some((s) => s && (s.speed !== 1 || s.size !== 1))),
  },
  {
    id: 7, stage: 2, title: 'Crie uma expressão', icon: '😜', tool: 'expressoes',
    intro: 'Monstrinhos sentem muitas coisas: alegria, susto, sono... Crie uma cara bem diferente!',
    task: 'Monte uma expressão e guarde com um nome.',
    need: 'Guarde uma expressão.',
    check: (g) => g.life.expressions.length >= 1,
    bonus: (g) => b(g.life.expressions.length >= 2, g.life.expressions.some((e) => e.face.extra !== 'nenhum')),
  },
  {
    id: 8, stage: 2, title: 'Faça seu monstrinho dançar', icon: '💃', tool: 'danca',
    intro: 'Vai ter música no laboratório! Monte uma coreografia para o seu monstrinho.',
    task: 'Coloque 4 passos ou mais e aperte Dançar!',
    need: 'Monte 4 passos e toque em Dançar!',
    check: (g) => g.life.dance.moves.filter(Boolean).length >= 4 && g.life.dance.played >= 1,
    bonus: (g) => b(g.life.dance.moves.filter(Boolean).length === 8, new Set(g.life.dance.moves.filter(Boolean)).size >= 4),
  },
  {
    id: 9, stage: 2, title: 'Crie ou combine seus sons', icon: '🔊', tool: 'sons',
    intro: 'Qual é o barulho do seu monstrinho? Rugido? Risada? Bolhas? Vamos compor!',
    task: 'Coloque 3 sons na linha do tempo e toque para ouvir.',
    need: 'Coloque 3 sons e toque ▶.',
    check: (g) => clipsIn(g) >= 3 && g.sounds.trackPlays >= 1,
    bonus: (g) => b(lanesUsed(g) >= 2, g.sounds.track.lanes.flat().some((c) => c && c.pitch !== 0) || !!g.sounds.signature),
  },
  {
    id: 10, stage: 2, title: 'Grave sua apresentação', icon: '🎤', tool: 'apresentacao',
    intro: 'Seu monstrinho vai se apresentar! Use a sua voz (se puder) ou os sons do laboratório.',
    task: 'Crie a apresentação do monstrinho.',
    need: 'Termine a apresentação.',
    check: (g) => g.sounds.presentation.done,
    bonus: (g) => b(g.sounds.presentation.text.trim().length >= 5, !!g.sounds.presentation.recordingId || g.sounds.presentation.sounds.length >= 3),
  },
  // ---------------- Etapa 3
  {
    id: 11, stage: 3, title: 'Escolha a personalidade', icon: '💖', tool: 'personalidade',
    intro: 'Cada monstrinho tem um jeito de ser. O seu é corajoso? Tímido? Engraçado?',
    task: 'Escolha até 3 jeitos de ser.',
    need: 'Escolha pelo menos 1 jeito.',
    check: (g) => g.identity.traits.length >= 1,
    bonus: (g) => b(g.identity.traits.length >= 2, g.identity.traits.length >= 3),
  },
  {
    id: 12, stage: 3, title: 'Descubra a comida favorita', icon: '🍕', tool: 'comida',
    intro: 'Hora do lanche! Arraste comidas até a boca do monstrinho e veja o que ele acha.',
    task: 'Dê 2 comidas e escolha a favorita.',
    need: 'Dê 2 comidas e escolha a favorita.',
    check: (g) => !!g.identity.food && g.identity.foodsTried.length >= 2,
    bonus: (g) => b(g.identity.foodsTried.length >= 4, Object.values(g.identity.foodReactions).includes('eca')),
  },
  {
    id: 13, stage: 3, title: 'Escolha um superpoder', icon: '⚡', tool: 'poder',
    intro: 'Todo monstrinho tem um poder secreto. Teste os poderes e escolha um!',
    task: 'Teste os poderes e escolha um.',
    need: 'Escolha um superpoder.',
    check: (g) => !!g.identity.power,
    bonus: (g) => b(g.identity.powersTried.length >= 2, g.identity.powersTried.length >= 4),
  },
  {
    id: 14, stage: 3, title: 'Descubra do que ele gosta', icon: '🌈', tool: 'gostos',
    intro: 'O que deixa seu monstrinho feliz? E do que ele tem medo? Vamos descobrir!',
    task: 'Escolha gostos e mais uma coisa: medo, hábito ou lugar.',
    need: 'Escolha 1 gosto e mais 1 item.',
    check: (g) => g.identity.likes.length >= 1 && (g.identity.fears.length + g.identity.habits.length + g.identity.dislikes.length >= 1 || !!g.identity.place),
    bonus: (g) => b([g.identity.fears.length, g.identity.habits.length, g.identity.dislikes.length, g.identity.place ? 1 : 0].filter((n) => n > 0).length >= 2, [g.identity.fears.length, g.identity.habits.length, g.identity.dislikes.length, g.identity.place ? 1 : 0].every((n) => n > 0)),
  },
  {
    id: 15, stage: 3, title: 'Crie seu passaporte', icon: '🪪', tool: 'passaporte',
    intro: 'Para viajar pelo mundo dos monstrinhos é preciso um passaporte. Vamos fazer o seu!',
    task: 'Complete o passaporte e carimbe!',
    need: 'Toque no carimbo para carimbar.',
    check: (g) => g.identity.passport.stamped,
    bonus: (g) => b(g.identity.passport.motto.trim().length >= 3, g.identity.passport.nickname.trim().length >= 2),
  },
  // ---------------- Etapa 4
  {
    id: 16, stage: 4, title: 'Escolha seu mundo', icon: '🌍', tool: 'habitat', focus: 'mundo',
    intro: 'Seu monstrinho precisa de uma casa! Onde ele vai morar?',
    task: 'Escolha o mundo, o céu e o clima.',
    need: 'Escolha um mundo.',
    check: (g) => !!g.habitat.biome,
    bonus: (g) => b(g.habitat.sky !== 'dia', g.habitat.weather !== 'sol'),
  },
  {
    id: 17, stage: 4, title: 'Construa o ambiente', icon: '🌳', tool: 'habitat', focus: 'natureza',
    intro: 'Arraste árvores, pedras, rios, casas e cavernas para construir o lugar.',
    task: 'Coloque 3 elementos: árvores, pedras, água, casas...',
    need: 'Coloque 3 elementos de construção.',
    check: (g) => g.habitat.objects.filter((o) => isStructure(o.type)).length >= 3,
    bonus: (g) => b(g.habitat.objects.filter((o) => isStructure(o.type)).length >= 6, g.habitat.objects.some((o) => o.s !== 1 || o.r !== 0 || o.flip)),
  },
  {
    id: 18, stage: 4, title: 'Decore seu habitat', icon: '🌸', tool: 'habitat', focus: 'enfeites',
    intro: 'Agora deixe tudo lindo: flores, plantas, enfeites e muita cor!',
    task: 'Coloque 3 enfeites ou plantas.',
    need: 'Coloque 3 enfeites ou plantas.',
    check: (g) => g.habitat.objects.filter((o) => !isStructure(o.type) && !isLiving(o.type)).length >= 3,
    bonus: (g) => b(g.habitat.objects.length >= 10, g.habitat.objects.some((o) => o.z !== 0)),
  },
  {
    id: 19, stage: 4, title: 'Adicione elementos vivos', icon: '🦋', tool: 'habitat', focus: 'vivos',
    intro: 'Um mundo precisa de vida! Coloque bichinhos e efeitos de luz.',
    task: 'Coloque 2 seres vivos no habitat.',
    need: 'Coloque 2 bichinhos.',
    check: (g) => g.habitat.objects.filter((o) => isLiving(o.type)).length >= 2,
    bonus: (g) => b(g.habitat.light !== 'nenhuma', g.habitat.objects.filter((o) => isLiving(o.type)).length >= 4),
  },
  {
    id: 20, stage: 4, title: 'Explore seu mundo', icon: '🧭', tool: 'explorar',
    intro: 'Tudo pronto! Leve o monstrinho para passear e toque nas coisas do mundo.',
    task: 'Ande pelo mundo e toque em 3 coisas.',
    need: 'Toque em 3 coisas do mundo.',
    check: (g) => g.habitat.explored.interactions >= 3,
    bonus: (g) => b(g.habitat.explored.interactions >= 8, g.habitat.explored.touched.length >= 4),
  },
  // ---------------- Etapa 5
  {
    id: 21, stage: 5, title: 'A floresta misteriosa', icon: '🔎', tool: 'floresta',
    intro: 'Uma floresta cheia de segredos! Há 6 tesouros escondidos. Siga as pistas brilhantes.',
    task: 'Encontre os 6 tesouros escondidos.',
    need: 'Encontre todos os tesouros.',
    check: (g) => g.adventures.forest.done,
    bonus: (g) => b(g.adventures.forest.surprises.length >= 2, !!g.adventures.forest.keep),
  },
  {
    id: 22, stage: 5, title: 'O amigo perdido', icon: '🤝', tool: 'amigo',
    intro: 'O Pipoca se perdeu e está chorando. Seu monstrinho pode ajudar!',
    task: 'Converse, escolha como ajudar e faça um cartão.',
    need: 'Ajude o Pipoca e faça o cartão.',
    check: (g) => g.adventures.friend.done,
    bonus: (g) => b(g.adventures.friend.solutionsTried.length >= 2, (g.adventures.friend.card?.text.trim().length ?? 0) >= 5),
  },
  {
    id: 23, stage: 5, title: 'A ponte quebrada', icon: '🌉', tool: 'ponte',
    intro: 'A ponte do rio caiu! Use os objetos para criar um jeito de atravessar.',
    task: 'Monte uma passagem e teste!',
    need: 'Atravesse o rio.',
    check: (g) => g.adventures.bridge.done,
    bonus: (g) => b(g.adventures.bridge.solutions.length >= 2, g.adventures.bridge.solutions.length >= 3),
  },
  {
    id: 24, stage: 5, title: 'A grande tempestade', icon: '⛈️', tool: 'tempestade',
    intro: 'Nuvens escuras chegando no seu habitat! Construa um abrigo para o monstrinho.',
    task: 'Monte um abrigo e proteja o monstrinho.',
    need: 'Proteja o monstrinho da chuva.',
    check: (g) => g.adventures.storm.done,
    bonus: (g) => b(g.adventures.storm.objects.length >= 3, g.adventures.storm.savedToHabitat),
  },
  {
    id: 25, stage: 5, title: 'A festa dos monstrinhos', icon: '🎉', tool: 'festa',
    intro: 'Vocês merecem uma festa! Convide amigos, decore, escolha a música e comece!',
    task: 'Organize a festa e toque em COMEÇAR A FESTA!',
    need: 'Comece a festa.',
    check: (g) => g.adventures.party.done,
    bonus: (g) => b(g.adventures.party.guests.length >= 3, g.adventures.party.decorations.length >= 4),
  },
  // ---------------- Etapa 6
  {
    id: 26, stage: 6, title: 'Escolha o cenário', icon: '🖼️', tool: 'historia', focus: 'cenario',
    intro: 'Bem-vindos ao estúdio! Toda história começa num lugar. Onde vai ser a sua?',
    task: 'Escolha o cenário principal da história.',
    need: 'Escolha um cenário.',
    check: (g) => !!g.stories.mainScene && g.stories.stories.length >= 1,
    bonus: (g) => b(!!currentStory(g)?.title.trim(), new Set((currentStory(g)?.frames ?? []).map((f) => JSON.stringify(f.scene))).size >= 2),
  },
  {
    id: 27, stage: 6, title: 'Escolha os personagens', icon: '🎭', tool: 'historia', focus: 'elenco',
    intro: 'Quem vai participar? Seu monstrinho é a estrela, mas pode chamar amigos!',
    task: 'Escolha 2 personagens ou mais.',
    need: 'Escolha 2 personagens.',
    check: (g) => g.stories.cast.length >= 2,
    bonus: (g) => b(g.stories.cast.length >= 3, g.stories.cast.length >= 4),
  },
  {
    id: 28, stage: 6, title: 'Crie o começo da história', icon: '📖', tool: 'historia', focus: 'quadros',
    intro: 'Era uma vez... Monte os 2 primeiros quadros: quem são e o que estão fazendo?',
    task: 'Monte os quadros 1 e 2 com personagens e falas.',
    need: 'Coloque personagem e fala nos quadros 1 e 2.',
    check: (g) => {
      const s = currentStory(g);
      return !!s && s.frames.length >= 2 && s.frames.slice(0, 2).every((f) => f.chars.length >= 1 && frameHasText(f));
    },
    bonus: (g) => b((currentStory(g)?.frames ?? []).slice(0, 2).some((f) => !!f.sound), (currentStory(g)?.frames ?? []).slice(0, 2).some((f) => f.chars.some((c) => c.face !== 'normal'))),
  },
  {
    id: 29, stage: 6, title: 'O problema e o final', icon: '🌟', tool: 'historia', focus: 'quadros',
    intro: 'Toda boa história tem um problema... e um final! O que acontece depois?',
    task: 'Monte 4 quadros ou mais, com um final.',
    need: 'Monte 4 quadros com falas.',
    check: (g) => {
      const s = currentStory(g);
      return !!s && s.frames.length >= 4 && s.frames.every((f) => f.chars.length >= 1 || frameHasText(f)) && frameHasText(s.frames[s.frames.length - 1]);
    },
    bonus: (g) => b((currentStory(g)?.frames.length ?? 0) >= 5, (currentStory(g)?.frames ?? []).some((f) => !!f.narration)),
  },
  {
    id: 30, stage: 6, title: 'Publique sua história', icon: '🏆', tool: 'historia', focus: 'publicar',
    intro: 'Último passo! Dê um título, assista e publique na exposição da dupla.',
    task: 'Assista e publique a história.',
    need: 'Toque em PUBLICAR.',
    check: (g) => !!currentStory(g)?.published,
    bonus: (g) => b(!!currentStory(g)?.title.trim(), (currentStory(g)?.views ?? 0) >= 2),
  },
];

export const missionById = (id: number) => MISSIONS.find((m) => m.id === id);
export const missionsOfStage = (stage: number) => MISSIONS.filter((m) => m.stage === stage);
