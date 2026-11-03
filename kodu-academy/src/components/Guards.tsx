import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { ErrorAlert, Loading } from './Feedback';

export function RequireStudent({ children }: { children: ReactNode }) {
  const { student, studentLoading, bootError } = useApp();
  const loc = useLocation();
  if (studentLoading) return <Loading />;
  if (bootError) return <ErrorAlert message={bootError} onRetry={() => window.location.reload()} />;
  if (!student) return <Navigate to="/aluno/entrar" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export function RequireTeacher({ children }: { children: ReactNode }) {
  const { teacher, teacherLoading, bootError } = useApp();
  const loc = useLocation();
  if (teacherLoading) return <Loading />;
  if (bootError) return <ErrorAlert message={bootError} onRetry={() => window.location.reload()} />;
  if (!teacher) return <Navigate to="/professor/entrar" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
