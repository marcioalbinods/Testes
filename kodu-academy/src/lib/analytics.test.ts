import { classReportCsv, overview, phaseStats, questionStats, studentReportCsv, summarizeAll } from './analytics';
import { parseCsv } from './csv';
import { emptyProgress } from './progression';
import type { AttemptRow, ProgressRow, StudentRow, TeacherData } from '../services/types';

const NOW = new Date('2026-10-27T12:00:00Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const student = (id: string, name: string, extra: Partial<StudentRow> = {}): StudentRow => ({
  id, classId: 'c1', displayName: name, active: true, startedAt: daysAgo(30), lastActivityAt: daysAgo(1), createdAt: daysAgo(30), ...extra,
});
const prog = (studentId: string, phaseId: number, extra: Partial<ProgressRow> = {}): ProgressRow => ({
  ...emptyProgress(phaseId), studentId, updatedAt: daysAgo(1), ...extra,
});
let aid = 1;
const attempt = (studentId: string, phaseId: number, passed: boolean, createdAt = daysAgo(1), results = { q1: passed, q2: true, q3: true, q4: passed }): AttemptRow => ({
  id: aid++, studentId, phaseId, answers: {}, results, score: passed ? 4 : 2, total: 4, passed, createdAt,
});

function dataset(): TeacherData {
  return {
    classes: [{ id: 'c1', name: '7º A', schoolYear: '2026', archived: false, createdAt: daysAgo(40) }],
    students: [
      student('s1', 'Ana'),
      student('s2', 'Bruno', { lastActivityAt: daysAgo(12) }),
      student('s3', 'Carla', { startedAt: null, lastActivityAt: null }),
      student('s4', 'Davi'),
      student('s5', 'Eva', { active: false }),
    ],
    progress: [
      prog('s1', 1, { status: 'completed' }), prog('s1', 2, { status: 'completed' }), prog('s1', 3),
      prog('s2', 1, { updatedAt: daysAgo(12) }),
      prog('s4', 1, { hintsViewed: 3 }),
    ],
    attempts: [
      attempt('s1', 1, true), attempt('s1', 2, false, daysAgo(3)), attempt('s1', 2, true, daysAgo(2)),
      attempt('s2', 1, false, daysAgo(12)),
      attempt('s4', 1, false, daysAgo(3)), attempt('s4', 1, false, daysAgo(2)), attempt('s4', 1, false, daysAgo(1)),
    ],
    activity: [],
    audit: [],
  };
}

describe('análises do painel do professor', () => {
  it('classifica a situação de cada aluno', () => {
    const byName = Object.fromEntries(summarizeAll(dataset(), NOW).map((s) => [s.student.displayName, s]));
    expect(byName.Ana.status).toBe('avancando');
    expect(byName.Ana.currentPhase).toBe(3);
    expect(byName.Ana.completed).toBe(2);
    expect(byName.Bruno.status).toBe('inativo');
    expect(byName.Carla.status).toBe('nao_iniciou');
    expect(byName.Davi.status).toBe('precisa_apoio');
    expect(byName.Davi.difficultPhases).toContain(1);
    expect(byName.Eva.status).toBe('desativado');
  });

  it('gera a visão geral com distribuição por fase', () => {
    const ov = overview(dataset(), NOW);
    expect(ov.totalStudents).toBe(5);
    expect(ov.activeStudents).toBe(4);
    expect(ov.totalClasses).toBe(1);
    expect(ov.inactive.map((s) => s.student.displayName)).toEqual(['Bruno']);
    expect(ov.needSupport.map((s) => s.student.displayName)).toEqual(['Davi']);
    expect(ov.distribution.find((d) => d.phaseId === 3)!.count).toBe(1);
    expect(ov.distribution.find((d) => d.phaseId === 1)!.count).toBe(2);
  });

  it('calcula estatísticas por fase e perguntas mais erradas', () => {
    const st = phaseStats(dataset());
    const f1 = st.find((s) => s.phaseId === 1)!;
    expect(f1.reached).toBe(3);
    expect(f1.completed).toBe(1);
    expect(f1.firstTryPassRate).toBeCloseTo(1 / 3);
    const q = questionStats(dataset().attempts);
    expect(q[0].errorRate).toBeGreaterThan(0.5);
  });

  it('exporta relatórios CSV válidos', () => {
    const sums = summarizeAll(dataset(), NOW);
    const rows = parseCsv(classReportCsv(sums));
    expect(rows[0][0]).toBe('Turma');
    expect(rows).toHaveLength(6);
    expect(rows.every((r) => r.length === rows[0].length)).toBe(true);
    const ana = dataset().students[0];
    const sr = parseCsv(studentReportCsv(ana, '7º A', { 1: dataset().progress[0] }, dataset().attempts));
    expect(sr).toHaveLength(21);
    expect(sr[1][4]).toBe('Concluída');
  });
});
