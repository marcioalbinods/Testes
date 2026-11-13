// Cria um projeto de teste no backend local com missões já concluídas.
import { createClient } from '@supabase/supabase-js';

export async function seedProject({ turma = '3B', a = 'Teste', b = 'Robo', done = 0, data = {} } = {}) {
  const sb = createClient(process.env.SB_URL || 'http://127.0.0.1:54321', 'anon', { auth: { persistSession: false } });
  await sb.auth.signInAnonymously();
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const rnd = () => Array.from({ length: 5 }, () => letters[Math.floor(Math.random() * 26)]).join('');
  const { data: r, error } = await sb.rpc('create_project', { p_turma: turma, p_student1: a + rnd(), p_student2: b + rnd(), p_force: true });
  if (error || r.status !== 'created') throw new Error('seed: ' + JSON.stringify(error || r));
  if (done > 0 || Object.keys(data).length) {
    const ids = Array.from({ length: done }, (_, i) => i + 1);
    const payload = { progress: { done: ids, stars: Object.fromEntries(ids.map((i) => [String(i), 2])), achievements: [], seenIntro: [], lastMission: done }, ...data };
    const s = await sb.rpc('save_project', { p_id: r.project.id, p_base_version: 1, p_epoch: 1, p_data: payload, p_current_stage: 1, p_current_mission: done + 1, p_missions_done: ids, p_progress: Math.round((done / 30) * 100), p_stars: done * 2 });
    if (s.data?.status !== 'ok') throw new Error('seed save ' + JSON.stringify(s));
  }
  return { code: r.code, id: r.project.id, names: [r.project.student1, r.project.student2] };
}

export const bornMonster = {
  born: true, name: 'Bolinho', skin: '#ff8fc7', belly: '#fff6cf', texture: 'bolinhas', textureColor: '#ff5c7a', cheeks: true,
  parts: {
    head: { id: 'nuvem', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    body: { id: 'pera', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    eyes: { id: 'brilhantes', color: '#2fa35a', scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    mouth: { id: 'dentucinho', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    ears: { id: 'gato', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    horns: { id: 'unicornio', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    antennae: null, spikes: null,
    arms: { id: 'gordinho', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    legs: { id: 'botinha', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    tail: { id: 'raposa', color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
    wings: { id: 'borboleta', color: '#c3a6ff', scale: 1, dx: 0, dy: 0, flip: false, rot: 0 },
  },
  accessories: [{ id: 'coroa', color: null, scale: 0.8, dx: 0, dy: 0 }], tried: [],
};
