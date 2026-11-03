import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getBackend } from '../services/backend';
import { toAppError } from '../services/errors';
import type { Backend, StudentProfile, TeacherProfile } from '../services/types';
import type { PhaseProgress, ProgressMap } from '../lib/progression';

interface AppState {
  backend: Backend | null;
  bootError: string | null;
  student: StudentProfile | null;
  progress: ProgressMap;
  studentLoading: boolean;
  teacher: TeacherProfile | null;
  teacherLoading: boolean;
  setStudent: (s: StudentProfile | null) => void;
  setTeacher: (t: TeacherProfile | null) => void;
  reloadProgress: () => Promise<void>;
  updateProgress: (p: PhaseProgress) => void;
  logoutStudent: () => Promise<void>;
  logoutTeacher: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [backend, setBackend] = useState<Backend | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [studentLoading, setStudentLoading] = useState(true);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getBackend()
      .then(async (b) => {
        if (!alive) return;
        setBackend(b);
        const [s, t] = await Promise.allSettled([b.student.restore(), b.teacher.restore()]);
        if (!alive) return;
        if (s.status === 'fulfilled' && s.value) {
          setStudent(s.value);
          try {
            setProgress(await b.student.loadProgress());
          } catch {
            /* a página da trilha mostra o erro ao recarregar */
          }
        }
        if (t.status === 'fulfilled') setTeacher(t.value);
        if (s.status === 'rejected' && t.status === 'rejected') setBootError(toAppError(s.reason).message);
      })
      .catch((e) => alive && setBootError(e instanceof Error && e.name === 'AppError' ? e.message : toAppError(e).message))
      .finally(() => {
        if (alive) {
          setStudentLoading(false);
          setTeacherLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const reloadProgress = useCallback(async () => {
    if (!backend) return;
    setProgress(await backend.student.loadProgress());
  }, [backend]);

  const updateProgress = useCallback((p: PhaseProgress) => {
    setProgress((prev) => ({ ...prev, [p.phaseId]: p }));
  }, []);

  const logoutStudent = useCallback(async () => {
    try {
      await backend?.student.logout();
    } finally {
      setStudent(null);
      setProgress({});
    }
  }, [backend]);

  const logoutTeacher = useCallback(async () => {
    try {
      await backend?.teacher.signOut();
    } finally {
      setTeacher(null);
    }
  }, [backend]);

  const value = useMemo<AppState>(
    () => ({
      backend, bootError, student, progress, studentLoading, teacher, teacherLoading,
      setStudent, setTeacher, reloadProgress, updateProgress, logoutStudent, logoutTeacher,
    }),
    [backend, bootError, student, progress, studentLoading, teacher, teacherLoading, reloadProgress, updateProgress, logoutStudent, logoutTeacher],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp fora do AppProvider');
  return v;
}
