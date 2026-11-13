import { describe, expect, it } from 'vitest';
import { newGame, normalizeGame } from '../../src/game/defaults';
import { merge3, mergeWithBase } from '../../src/game/merge';
import { MISSIONS } from '../../src/game/missions';
import { isUnlocked, missionStars, nextMission, progressPct, stageUnlocked } from '../../src/game/progress';
import type { GameData } from '../../src/game/types';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

describe('dados do jogo', () => {
  it('normaliza dados vazios, antigos ou incompletos sem perder o que existe', () => {
    expect(normalizeGame({})).toEqual(newGame());
    const g = normalizeGame({ monster: { name: 'Bolinho', parts: { tail: { id: 'gato' }, wings: null } }, progress: { done: [3, 1, 1, 99] } });
    expect(g.monster.name).toBe('Bolinho');
    expect(g.monster.parts.tail?.id).toBe('gato');
    expect(g.monster.parts.tail?.scale).toBe(1);
    expect(g.monster.parts.head?.id).toBe('redonda');
    expect(g.progress.done).toEqual([1, 3]);
    expect(g.life.dance.moves).toHaveLength(8);
  });

  it('tem 30 missões em 6 etapas, com 5 por etapa', () => {
    expect(MISSIONS).toHaveLength(30);
    for (let s = 1; s <= 6; s++) expect(MISSIONS.filter((m) => m.stage === s)).toHaveLength(5);
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(30);
  });

  it('libera as missões em ordem e calcula o progresso', () => {
    const g = newGame();
    expect(isUnlocked(g, 1)).toBe(true);
    expect(isUnlocked(g, 2)).toBe(false);
    g.progress.done = [1, 2, 3, 4, 5];
    expect(isUnlocked(g, 6)).toBe(true);
    expect(stageUnlocked(g, 2)).toBe(true);
    expect(stageUnlocked(g, 3)).toBe(false);
    expect(nextMission(g)?.id).toBe(6);
    expect(progressPct(g)).toBe(17);
  });

  it('nenhuma missão começa pronta (é preciso criar algo)', () => {
    const g = newGame();
    for (const m of MISSIONS) expect(m.check(g), `missão ${m.id}`).toBe(false);
  });

  it('estrelas valorizam experimentar (1 a 3)', () => {
    const g = newGame();
    g.monster.tried = ['head:redonda'];
    expect(missionStars(g, 1)).toBe(1);
    g.monster.tried.push('head:ovo', 'head:gota');
    g.monster.skin = '#ff5c7a';
    expect(missionStars(g, 1)).toBe(3);
  });
});

describe('junção de versões (conflitos)', () => {
  it('campos diferentes editados em dois aparelhos: os dois ficam', () => {
    const base = newGame();
    const a = clone(base);
    a.monster.parts.head = { ...a.monster.parts.head!, id: 'sino' };
    const b = clone(base);
    b.monster.skin = '#ffd23f';
    const m = mergeWithBase(base, b, a, ['monster']);
    expect(m.monster.parts.head?.id).toBe('sino');
    expect(m.monster.skin).toBe('#ffd23f');
  });

  it('objetos do habitat criados em aparelhos diferentes não se perdem; apagados somem', () => {
    const base = newGame();
    const o = (uid: string) => ({ uid, type: 'arvore', x: 1, y: 2, s: 1, r: 0, flip: false, z: 0 });
    base.habitat.objects = [o('a'), o('b')];
    const local = clone(base);
    local.habitat.objects = [o('a'), o('c')]; // apagou b, criou c
    const server = clone(base);
    server.habitat.objects = [o('a'), o('b'), o('d')]; // criou d
    const m = mergeWithBase(base, local, server, ['habitat']);
    expect(m.habitat.objects.map((x) => x.uid).sort()).toEqual(['a', 'c', 'd']);
  });

  it('missões concluídas em qualquer aparelho nunca se perdem', () => {
    const base = newGame();
    const local = clone(base);
    local.progress.done = [1, 2];
    const server = clone(base);
    server.progress.done = [1, 3];
    expect(mergeWithBase(base, local, server, ['progress']).progress.done).toEqual([1, 2, 3]);
  });

  it('a mudança mais antiga não apaga a mais nova quando só o servidor mudou', () => {
    const base = newGame();
    const local = clone(base) as GameData;
    const server = clone(base);
    server.stories.cast = ['eu', 'pipoca'];
    expect(mergeWithBase(base, local, server, []).stories.cast).toEqual(['eu', 'pipoca']);
  });

  it('listas simples: juntam itens e respeitam remoções', () => {
    expect(merge3(['a', 'b'], ['a'], ['a', 'b', 'c'])).toEqual(['a', 'c']);
    expect(merge3([null, null], ['x', null], [null, 'y'])).toEqual(['x', 'y']);
  });
});
