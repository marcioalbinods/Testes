// Testes do backend (SQL + RLS + Storage) usando o cliente oficial
// @supabase/supabase-js contra o Postgres real do Supabase.
// Requer a ponte de teste (tests/harness/gateway.mjs) e os contêineres
// descritos em tests/README.md.
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import assert from 'node:assert/strict';

const URL = process.env.SB_URL || 'http://127.0.0.1:54321';
const ANON = process.env.SB_ANON || 'anon-key-de-teste';
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:54322/postgres' });

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log('  ✔', name);
  } catch (e) {
    console.error('  ✘', name);
    throw e;
  }
}

function client(ip = '10.0.0.1') {
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-test-ip': ip } },
  });
}
async function student(ip) {
  const c = client(ip);
  const { error } = await c.auth.signInAnonymously();
  assert.equal(error, null);
  return c;
}
const rpc = async (c, fn, args) => {
  const { data, error } = await c.rpc(fn, args);
  if (error) throw new Error(fn + ': ' + error.message);
  return data;
};
const save = (c, id, base, epoch, data, done = []) =>
  rpc(c, 'save_project', {
    p_id: id, p_base_version: base, p_epoch: epoch, p_data: data, p_current_stage: 1,
    p_current_mission: done.length + 1, p_missions_done: done, p_progress: Math.round((done.length / 30) * 100), p_stars: done.length,
  });

async function main() {
  const suffix = Math.random().toString(36).slice(2, 6);
  const nm = (n) => n + 'zz'.slice(0, 0); // nomes simples
  await db.query("delete from public.auth_attempts");
  console.log('Backend Monstrinhos');

  const a1 = await student('10.1.0.1');
  const a2 = await student('10.1.0.2');
  const b1 = await student('10.1.0.3');
  const c1 = await student('10.1.0.4');
  let p1, p2, pb, pc;

  await test('1. cadastro de uma dupla do 3º A', async () => {
    const r = await rpc(a1, 'create_project', { p_turma: '3A', p_student1: 'ana  clara', p_student2: 'Bia', p_force: false });
    if (r.status === 'exists') {
      // execução repetida: força uma nova dupla
      const r2 = await rpc(a1, 'create_project', { p_turma: '3A', p_student1: 'ana clara', p_student2: 'Bia', p_force: true });
      p1 = r2;
    } else p1 = r;
    assert.equal(p1.status, 'created');
    assert.match(p1.code, /^[A-HJ-KM-NP-Z2-9]{4}-[A-HJ-KM-NP-Z2-9]{4}$/);
    assert.equal(p1.project.student1, 'Ana Clara');
    assert.equal(p1.project.turma, '3A');
  });

  await test('2. cadastro de outra dupla do 3º A', async () => {
    p2 = await rpc(a2, 'create_project', { p_turma: '3A', p_student1: 'Caio' + suffix.replace(/[0-9]/g, 'x'), p_student2: 'Davi', p_force: false });
    assert.equal(p2.status, 'created');
    assert.notEqual(p2.project.id, p1.project.id);
    assert.notEqual(p2.code, p1.code);
  });

  await test('3. cadastro de duplas do 3º B e do 3º C', async () => {
    pb = await rpc(b1, 'create_project', { p_turma: '3B', p_student1: 'Enzo', p_student2: 'Flora', p_force: true });
    pc = await rpc(c1, 'create_project', { p_turma: '3C', p_student1: 'Gael', p_student2: 'Helena', p_force: true });
    assert.equal(pb.status, 'created');
    assert.equal(pc.status, 'created');
  });

  await test('não duplica projeto quando a dupla volta com os mesmos nomes (em qualquer ordem)', async () => {
    const other = await student('10.1.0.9');
    const r = await rpc(other, 'create_project', { p_turma: '3A', p_student1: 'BIA', p_student2: 'Ana Clara', p_force: false });
    assert.equal(r.status, 'exists');
  });

  await test('nomes inválidos são recusados (sobrenome longo, números, iguais)', async () => {
    const r1 = await rpc(a1, 'create_project', { p_turma: '3A', p_student1: 'Ana Maria da Silva', p_student2: 'Bia', p_force: true });
    assert.equal(r1.message, 'invalid_name');
    const r2 = await rpc(a1, 'create_project', { p_turma: '3A', p_student1: 'Ana1', p_student2: 'Bia', p_force: true });
    assert.equal(r2.message, 'invalid_name');
    const r3 = await rpc(a1, 'create_project', { p_turma: '3A', p_student1: 'Bia', p_student2: 'bia', p_force: true });
    assert.equal(r3.message, 'same_name');
    const r4 = await rpc(a1, 'create_project', { p_turma: '9Z', p_student1: 'Ana', p_student2: 'Bia', p_force: true });
    assert.equal(r4.message, 'invalid_class');
  });

  await test('13. isolamento: uma dupla não lê o projeto de outra', async () => {
    const r = await rpc(a2, 'load_project', { p_id: p1.project.id });
    assert.equal(r.status, 'forbidden');
    const { data } = await a2.from('projects').select('*');
    assert.deepEqual(data.map((x) => x.id), [p2.project.id]);
    const { data: codes } = await a2.from('project_codes').select('*');
    assert.equal(codes.length, 0, 'estudante não pode ler códigos');
    const w = await save(a2, p1.project.id, 1, 1, { hack: true });
    assert.equal(w.status, 'forbidden');
    const { data: snaps } = await a2.from('project_snapshots').select('*');
    assert.equal(snaps.length, 0);
  });

  await test('usuário sem login (anon) não lê nada nem chama funções', async () => {
    const anon = client();
    const { data } = await anon.from('projects').select('*');
    assert.ok(!data || data.length === 0);
    const { error } = await anon.rpc('create_project', { p_turma: '3A', p_student1: 'Ana', p_student2: 'Bia', p_force: true });
    assert.ok(error, 'anon não pode executar');
  });

  await test('5. salvamento com versão e detecção de conflito', async () => {
    const id = p1.project.id;
    const s1 = await save(a1, id, 1, 1, { monster: { name: 'Bolota' }, progress: { done: [1] } }, [1]);
    assert.equal(s1.status, 'ok');
    assert.equal(s1.version, 2);
    const stale = await save(a1, id, 1, 1, { monster: { name: 'Velho' } }, []);
    assert.equal(stale.status, 'conflict', 'versão antiga não sobrescreve a nova');
    assert.equal(stale.project.data.monster.name, 'Bolota');
    const s2 = await save(a1, id, 2, 1, { monster: { name: 'Bolota 2' }, progress: { done: [1, 2] } }, [1, 2]);
    assert.equal(s2.version, 3);
  });

  await test('4/7. recuperação pelo código em outro aparelho', async () => {
    const tablet = await student('10.1.0.20');
    const r = await rpc(tablet, 'recover_project', { p_code: p1.code.toLowerCase().replace('-', ' ') });
    assert.equal(r.status, 'ok');
    assert.equal(r.project.id, p1.project.id);
    assert.equal(r.project.data.monster.name, 'Bolota 2');
    const again = await rpc(tablet, 'load_project', { p_id: p1.project.id });
    assert.equal(again.status, 'ok');
    const code = await rpc(tablet, 'get_my_code', { p_id: p1.project.id });
    assert.equal(code.code, p1.code);
  });

  await test('limite de tentativas erradas do código', async () => {
    const hacker = await student('10.9.9.9');
    let last;
    for (let i = 0; i < 6; i++) last = await rpc(hacker, 'recover_project', { p_code: 'ZZZZ-ZZZZ' });
    assert.equal(last.status, 'invalid');
    const blocked = await rpc(hacker, 'recover_project', { p_code: p2.code });
    assert.equal(blocked.status, 'blocked', 'mesmo o código certo é bloqueado depois de 6 erros');
    const { data: attempts } = await hacker.from('auth_attempts').select('*');
    assert.ok(!attempts || attempts.length === 0);
  });

  await test('trocar de dupla remove o acesso do aparelho', async () => {
    const shared = await student('10.1.0.30');
    await rpc(shared, 'recover_project', { p_code: pb.code });
    assert.equal((await rpc(shared, 'load_project', { p_id: pb.project.id })).status, 'ok');
    await rpc(shared, 'leave_project', { p_id: pb.project.id });
    assert.equal((await rpc(shared, 'load_project', { p_id: pb.project.id })).status, 'forbidden');
  });

  // ---------------- Professor ----------------
  const email = `prof${suffix}@escola.test`;
  await db.query(`insert into auth.users (id, aud, role, email, encrypted_password, is_anonymous, created_at, updated_at, instance_id)
    values (gen_random_uuid(), 'authenticated', 'authenticated', $1, extensions.crypt('senha-forte-123', extensions.gen_salt('bf')), false, now(), now(), '00000000-0000-0000-0000-000000000000')`, [email]);
  const teacher = client();
  const notTeacherYet = await teacher.auth.signInWithPassword({ email, password: 'senha-forte-123' });
  assert.equal(notTeacherYet.error, null);

  await test('usuário com login mas sem cadastro de professor não vê nada', async () => {
    const { data } = await teacher.from('projects').select('id');
    assert.equal(data.length, 0);
    const r = await rpc(teacher, 'teacher_reset_class', { p_turma: '3A' });
    assert.equal(r.status, 'forbidden');
  });

  await db.query(`insert into public.teachers (user_id, name) select id, 'Prof Teste' from auth.users where email = $1`, [email]);

  await test('12. professor vê todas as duplas e os códigos', async () => {
    assert.equal(await rpc(teacher, 'is_teacher', {}), true);
    const { data } = await teacher.from('projects').select('id,turma,student1,student2');
    const ids = data.map((x) => x.id);
    for (const p of [p1, p2, pb, pc]) assert.ok(ids.includes(p.project.id));
    const { data: codes } = await teacher.from('project_codes').select('*');
    assert.ok(codes.find((c) => c.project_id === p1.project.id && c.code === p1.code));
  });

  await test('gravações: bloqueadas até o professor permitir; privadas por dupla', async () => {
    const path = `${p1.project.id}/teste.webm`;
    const blob = new Blob([new Uint8Array([26, 69, 223, 163, 1, 2, 3])], { type: 'audio/webm' });
    const denied = await a1.storage.from('gravacoes').upload(path, blob, { contentType: 'audio/webm', upsert: true });
    assert.ok(denied.error, 'sem permissão da turma, não envia');
    assert.equal((await rpc(teacher, 'teacher_set_class_setting', { p_turma: '3A', p_allow_recordings: true })).status, 'ok');
    const st = await rpc(a1, 'get_project_settings', { p_id: p1.project.id });
    assert.equal(st.allow_recordings, true);
    const ok = await a1.storage.from('gravacoes').upload(path, blob, { contentType: 'audio/webm', upsert: true });
    assert.equal(ok.error, null, ok.error?.message);
    const other = await a2.storage.from('gravacoes').download(path);
    assert.ok(other.error, 'outra dupla não ouve');
    const otherUp = await a2.storage.from('gravacoes').upload(`${p1.project.id}/invasao.webm`, blob, { contentType: 'audio/webm' });
    assert.ok(otherUp.error, 'outra dupla não envia para a pasta alheia');
    const mine = await a1.storage.from('gravacoes').download(path);
    assert.equal(mine.error, null);
    const prof = await teacher.storage.from('gravacoes').download(path);
    assert.equal(prof.error, null);
    const anon = await client().storage.from('gravacoes').download(path);
    assert.ok(anon.error, 'sem login não ouve');
    const list = await teacher.storage.from('gravacoes').list(p1.project.id);
    assert.ok(list.data.find((f) => f.name === 'teste.webm'));
  });

  await test('14. reinício de uma única dupla (guarda cópia em projetos anteriores)', async () => {
    const r = await rpc(teacher, 'teacher_reset_project', { p_id: p1.project.id });
    assert.equal(r.status, 'ok');
    const l = await rpc(a1, 'load_project', { p_id: p1.project.id });
    assert.equal(l.project.progress, 0);
    assert.deepEqual(l.project.data, {});
    assert.equal(l.project.epoch, 2);
    const old = await save(a1, p1.project.id, 3, 1, { monster: { name: 'offline antigo' } });
    assert.equal(old.status, 'conflict', 'aparelho com época antiga não desfaz o reinício');
    const { data: arch } = await teacher.from('project_archive').select('*').eq('project_id', p1.project.id);
    assert.ok(arch.length >= 1);
    assert.equal(arch[0].data.monster.name, 'Bolota 2');
    const l2 = await rpc(a2, 'load_project', { p_id: p2.project.id });
    assert.equal(l2.status, 'ok');
  });

  await test('15. reinício de uma turma sem afetar as outras', async () => {
    await save(b1, pb.project.id, pb.project.version, 1, { monster: { name: 'Do 3B' }, progress: { done: [1, 2, 3] } }, [1, 2, 3]);
    await save(a2, p2.project.id, p2.project.version, 1, { monster: { name: 'Do 3A' }, progress: { done: [1] } }, [1]);
    const r = await rpc(teacher, 'teacher_reset_class', { p_turma: '3A' });
    assert.equal(r.status, 'ok');
    const a = await rpc(a2, 'load_project', { p_id: p2.project.id });
    assert.equal(a.project.progress, 0);
    const b = await rpc(b1, 'load_project', { p_id: pb.project.id });
    assert.equal(b.project.data.monster.name, 'Do 3B');
    assert.equal(b.project.progress, 10);
  });

  await test('cópias de segurança automáticas e restauração pelo professor', async () => {
    const l = await rpc(b1, 'load_project', { p_id: pb.project.id });
    await db.query('update public.project_snapshots set created_at = created_at - interval \'1 hour\' where project_id = $1', [pb.project.id]);
    await save(b1, pb.project.id, l.project.version, l.project.epoch, { monster: { name: 'Apagou tudo' } }, []);
    const { data: snaps } = await teacher.from('project_snapshots').select('*').eq('project_id', pb.project.id).order('created_at', { ascending: false });
    assert.ok(snaps.length >= 1);
    assert.equal(snaps[0].data.monster.name, 'Do 3B');
    await rpc(teacher, 'teacher_restore_snapshot', { p_snapshot: snaps[0].id });
    const back = await rpc(b1, 'load_project', { p_id: pb.project.id });
    assert.equal(back.project.data.monster.name, 'Do 3B');
    assert.deepEqual(back.project.missions_done, [1, 2, 3]);
  });

  await test('professor exclui uma dupla (e só ela)', async () => {
    await teacher.storage.from('gravacoes').remove([`${p1.project.id}/teste.webm`]);
    const r = await rpc(teacher, 'teacher_delete_project', { p_id: pc.project.id });
    assert.equal(r.status, 'ok');
    assert.equal((await rpc(c1, 'load_project', { p_id: pc.project.id })).status, 'forbidden');
    const { data } = await teacher.from('projects').select('id').eq('id', pb.project.id);
    assert.equal(data.length, 1);
    const rec = await rpc(client().auth ? c1 : c1, 'recover_project', { p_code: pc.code });
    assert.equal(rec.status, 'invalid');
  });

  await rpc(teacher, 'teacher_set_class_setting', { p_turma: '3A', p_allow_recordings: false });
  console.log(`\n${passed} testes do backend passaram.`);
  void nm;
  await db.end();
}

main().catch(async (e) => {
  console.error(e);
  await db.end();
  process.exit(1);
});
