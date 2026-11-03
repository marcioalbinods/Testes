import { createDemoBackend } from './demoBackend';
import { PHASES } from '../content/phases';
import { QUIZ_KEYS } from '../content/quizKeys';

const required = (id: number) => PHASES[id - 1].checklist.filter((c) => c.required).map((c) => c.id);

async function setup() {
  localStorage.clear();
  const b = createDemoBackend();
  await b.teacher.signIn('prof@escola.br', 'senha-segura');
  await b.teacher.createClass('7º A', '2026');
  const { classes } = await b.teacher.loadData();
  const codes = await b.teacher.createStudents(classes[0].id, ['Ana', 'Bruno', '  ']);
  await b.teacher.signOut();
  return { b, codes, classId: classes[0].id };
}

async function completePhase(b: ReturnType<typeof createDemoBackend>, id: number) {
  await b.student.saveChecklist(id, required(id));
  await b.student.submitQuiz(id, QUIZ_KEYS[id]);
  await b.student.saveReflection(id, 'Aprendi algo importante nesta fase.');
  await b.student.setReviewed(id, true);
  return b.student.completePhase(id);
}

describe('backend de demonstração (mesmas regras do servidor)', () => {
  it('cadastra alunos com códigos únicos e ignora nomes vazios', async () => {
    const { codes } = await setup();
    expect(codes).toHaveLength(2);
    expect(codes[0].code).toMatch(/^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
    expect(codes[0].code).not.toBe(codes[1].code);
  });

  it('não guarda o código em texto puro', async () => {
    const { codes } = await setup();
    expect(localStorage.getItem('kodu-academy-demo-v1')).not.toContain(codes[0].code);
  });

  it('aluno entra com o código (sem diferenciar maiúsculas e traço) e recusa código errado', async () => {
    const { b, codes } = await setup();
    await expect(b.student.login('ZZZZ-ZZZZ')).rejects.toThrow(/Código não encontrado/);
    const p = await b.student.login(codes[0].code.toLowerCase().replace('-', ''));
    expect(p.displayName).toBe('Ana');
    expect(p.className).toBe('7º A');
  });

  it('bloqueia fases futuras e exige todos os critérios', async () => {
    const { b, codes } = await setup();
    await b.student.login(codes[0].code);
    await expect(b.student.saveChecklist(2, [])).rejects.toThrow(/bloqueada/);
    const early = await b.student.completePhase(1);
    expect(early.ok).toBe(false);
    expect(early.missing).toEqual(['checklist', 'quiz', 'reflection', 'review']);
    const wrong = await b.student.submitQuiz(1, { q1: 'd', q2: 'd', q3: 'd', q4: 'd' });
    expect(wrong.passed).toBe(false);
    const r = await completePhase(b, 1);
    expect(r.ok).toBe(true);
    await expect(b.student.saveChecklist(1, [])).rejects.toThrow(/já foi concluída/);
    expect((await b.student.saveChecklist(2, ['camera-mover'])).phaseId).toBe(2);
  });

  it('mantém o progresso após "sair e entrar de novo"', async () => {
    const { b, codes } = await setup();
    await b.student.login(codes[0].code);
    await completePhase(b, 1);
    await b.student.saveChecklist(2, ['chao']);
    await b.student.logout();
    expect(await b.student.restore()).toBeNull();
    const again = createDemoBackend();
    await again.student.login(codes[0].code);
    const prog = await again.student.loadProgress();
    expect(prog[1].status).toBe('completed');
    expect(prog[2].checklist).toEqual(['chao']);
  });

  it('um aluno não vê o progresso do outro', async () => {
    const { b, codes } = await setup();
    await b.student.login(codes[0].code);
    await completePhase(b, 1);
    await b.student.logout();
    await b.student.login(codes[1].code);
    expect(await b.student.loadProgress()).toEqual({});
  });

  it('professor libera fase, altera status com histórico, redefine código e desativa aluno', async () => {
    const { b, codes } = await setup();
    await b.teacher.signIn('prof@escola.br', 'senha-segura');
    await expect(b.teacher.unlockPhase(codes[1].id, 5, '')).rejects.toThrow(/motivo/);
    await b.teacher.unlockPhase(codes[1].id, 5, 'Já domina');
    await b.teacher.setPhaseStatus(codes[1].id, 1, 'completed', 'Validado em aula');
    const newCode = await b.teacher.resetCode(codes[1].id);
    const data = await b.teacher.loadData();
    expect(data.audit.map((a) => a.action)).toEqual(expect.arrayContaining(['unlock_phase', 'set_status:completed', 'reset_code']));
    await b.teacher.signOut();
    await expect(b.student.login(codes[1].code)).rejects.toThrow();
    await b.student.login(newCode);
    const prog = await b.student.loadProgress();
    expect(prog[5].manuallyUnlocked).toBe(true);
    expect(prog[1].completedByTeacher).toBe(true);
    await b.student.logout();
    await b.teacher.signIn('prof@escola.br', 'senha-segura');
    await b.teacher.updateStudent(codes[1].id, { active: false }, 'teste');
    await b.teacher.signOut();
    await expect(b.student.login(newCode)).rejects.toThrow(/Código não encontrado/);
  });

  it('recusa senha errada do professor e protege funções de professor', async () => {
    const { b } = await setup();
    await expect(b.teacher.signIn('prof@escola.br', 'outra-senha')).rejects.toThrow(/incorretos/);
    await expect(b.teacher.loadData()).rejects.toThrow(/exclusiva do professor/);
  });

  it('limita tentativas de código', async () => {
    const { b, codes } = await setup();
    for (let i = 0; i < 8; i++) await b.student.login(`AAAA-AAA${i}`).catch(() => undefined);
    await expect(b.student.login(codes[0].code)).rejects.toThrow(/Muitas tentativas/);
  });
});
