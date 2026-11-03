import { NavLink, Route, Routes } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { TeacherDataProvider, useTeacherData } from './TeacherData';
import { OverviewPage } from './OverviewPage';
import { ClassTrackingPage } from './ClassTrackingPage';
import { ManagePage } from './ManagePage';
import { PhaseStatsPage } from './PhaseStatsPage';
import { AuditPage } from './AuditPage';
import { StudentDetailPage } from './StudentDetailPage';

function Header() {
  const { teacher } = useApp();
  const { reload, loadedAt } = useTeacherData();
  return (
    <div className="row" style={{ marginBottom: 8 }}>
      <h1 style={{ margin: 0 }}>Painel do professor</h1>
      <span className="spacer" />
      <span className="small muted">
        {teacher?.displayName} · dados de {loadedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </span>
      <button type="button" className="btn btn-sm btn-ghost no-print" onClick={reload}>
        Atualizar
      </button>
    </div>
  );
}

export default function TeacherArea() {
  return (
    <TeacherDataProvider>
      <Header />
      <nav className="tabs" aria-label="Seções do painel">
        <NavLink to="/professor" end>Visão geral</NavLink>
        <NavLink to="/professor/turma">Acompanhamento da turma</NavLink>
        <NavLink to="/professor/fases">Fases e conteúdos</NavLink>
        <NavLink to="/professor/gestao">Turmas e alunos</NavLink>
        <NavLink to="/professor/historico">Histórico de alterações</NavLink>
      </nav>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="turma" element={<ClassTrackingPage />} />
        <Route path="fases" element={<PhaseStatsPage />} />
        <Route path="gestao" element={<ManagePage />} />
        <Route path="historico" element={<AuditPage />} />
        <Route path="aluno/:id" element={<StudentDetailPage />} />
      </Routes>
    </TeacherDataProvider>
  );
}
