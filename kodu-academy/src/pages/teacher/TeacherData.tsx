import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppContext';
import { toAppError } from '../../services/errors';
import type { TeacherData } from '../../services/types';
import { ErrorAlert, Loading } from '../../components/Feedback';

interface Ctx {
  data: TeacherData;
  reload: () => Promise<void>;
  loadedAt: Date;
}
const TeacherDataCtx = createContext<Ctx | null>(null);

export function TeacherDataProvider({ children }: { children: ReactNode }) {
  const { backend } = useApp();
  const [data, setData] = useState<TeacherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState(new Date());
  const reload = useCallback(async () => {
    if (!backend) return;
    try {
      setData(await backend.teacher.loadData());
      setLoadedAt(new Date());
      setError(null);
    } catch (e) {
      setError(toAppError(e).message);
    }
  }, [backend]);
  useEffect(() => {
    reload();
  }, [reload]);
  if (!data) return error ? <ErrorAlert message={error} onRetry={reload} /> : <Loading text="Carregando dados das turmas…" />;
  return (
    <TeacherDataCtx.Provider value={{ data, reload, loadedAt }}>
      <ErrorAlert message={error} onRetry={reload} />
      {children}
    </TeacherDataCtx.Provider>
  );
}

export function useTeacherData(): Ctx {
  const v = useContext(TeacherDataCtx);
  if (!v) throw new Error('useTeacherData fora do provedor');
  return v;
}
