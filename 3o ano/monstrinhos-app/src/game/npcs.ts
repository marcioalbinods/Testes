import type { MonsterState } from './types';
import { newMonster, part } from './defaults';

// Outros monstrinhos do mundo (amigos, convidados da festa, personagens das
// histórias). Feitos com as mesmas peças que as duplas usam.

function mk(name: string, skin: string, belly: string | null, parts: Partial<MonsterState['parts']>, extra: Partial<MonsterState> = {}): MonsterState {
  const m = newMonster();
  return { ...m, born: true, name, skin, belly, ...extra, parts: { ...m.parts, ...parts } };
}

export interface Npc {
  id: string;
  name: string;
  desc: string;
  m: MonsterState;
}

export const ZUZU: MonsterState = mk('Zuzu', '#9b6bff', '#e3d6ff', {
  head: part('redonda'),
  body: part('pera'),
  eyes: part('ciclope', { color: '#45d9d0' }),
  mouth: part('sorrisao'),
  antennae: part('luz'),
  arms: part('luva'),
  legs: part('botinha'),
  ears: null,
}, { accessories: [{ id: 'oculos', color: '#ffd23f', scale: 1.25, dx: 0, dy: 0 }], texture: 'pintinhas', textureColor: '#7f4fe6' });

export const NPCS: Npc[] = [
  {
    id: 'pipoca', name: 'Pipoca', desc: 'Pequenino e medroso',
    m: mk('Pipoca', '#ffd23f', '#fff6cf', { head: part('nuvem'), body: part('mini'), eyes: part('brilhantes', { color: '#8a5a3c' }), mouth: part('dentucinho'), ears: part('coelho'), arms: part('trex'), legs: part('redondinho'), tail: part('pompom') }),
  },
  {
    id: 'bolota', name: 'Bolota', desc: 'Grandão e carinhoso',
    m: mk('Bolota', '#5fd068', '#d9f7c8', { head: part('oval'), body: part('barrigudo'), eyes: part('bolinhas'), mouth: part('sapo', { color: '#ff7a9a' }), horns: part('chifrinho'), arms: part('gordinho'), legs: part('urso') }, { texture: 'manchas', textureColor: '#3fae54' }),
  },
  {
    id: 'faisca', name: 'Faísca', desc: 'Rápida e brilhante',
    m: mk('Faísca', '#ff5c7a', null, { head: part('gota'), body: part('ovo'), eyes: part('estrela', { color: '#ffd23f' }), mouth: part('lingua'), antennae: part('estrela'), arms: part('fininho'), legs: part('fininho'), tail: part('raio'), wings: part('fada') }, { texture: 'estrelinhas', textureColor: '#ffd23f' }),
  },
  {
    id: 'nino', name: 'Nino', desc: 'Curioso e sabido',
    m: mk('Nino', '#45d9d0', '#d9fffb', { head: part('quadrada'), body: part('quadrado'), eyes: part('robo', { color: '#ff9a3c' }), mouth: part('janelinha'), antennae: part('mola'), arms: part('robo'), legs: part('rodinha') }),
  },
  {
    id: 'lili', name: 'Lili', desc: 'Dançarina e alegre',
    m: mk('Lili', '#ff8fc7', '#ffe3f1', { head: part('coracao'), body: part('saquinho'), eyes: part('cilios', { color: '#7340d9' }), mouth: part('beijinho'), ears: part('gato'), arms: part('estrela'), legs: part('pato'), tail: part('coracao'), wings: part('borboleta', { color: '#c3a6ff' }) }, { accessories: [{ id: 'laco', color: '#7340d9', scale: 1, dx: 0, dy: 0 }] }),
  },
  {
    id: 'tito', name: 'Tito', desc: 'Engraçado e bagunceiro',
    m: mk('Tito', '#ff9a3c', '#ffe1c2', { head: part('abobora'), body: part('fofo'), eyes: part('malucos', { color: '#2fa35a' }), mouth: part('zigue'), horns: part('diabinho'), arms: part('pinca'), legs: part('dino'), tail: part('dragao') }, { texture: 'listras', textureColor: '#f0702a' }),
  },
  {
    id: 'luna', name: 'Luna', desc: 'Sonhadora da noite',
    m: mk('Luna', '#7340d9', '#c3a6ff', { head: part('sino'), body: part('comprido'), eyes: part('sonolentos', { color: '#ffd23f' }), mouth: part('timido'), horns: part('lua'), arms: part('nadadeira'), legs: part('flutua'), wings: part('morcego', { color: '#2f2a55' }) }, { texture: 'estrelinhas', textureColor: '#fff07a' }),
  },
];

export const npcById = (id: string) => NPCS.find((n) => n.id === id);
