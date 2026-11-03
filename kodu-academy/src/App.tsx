import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loading } from './components/Feedback';
import { RequireStudent, RequireTeacher } from './components/Guards';
import { HomePage } from './pages/HomePage';
import { HowToPage } from './pages/HowToPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { StudentLoginPage } from './pages/student/StudentLoginPage';
import { TrailPage } from './pages/student/TrailPage';
import { PhasePage } from './pages/student/PhasePage';
import { AchievementsPage } from './pages/student/AchievementsPage';
import { GlossaryPage } from './pages/student/GlossaryPage';
import { TeacherLoginPage } from './pages/teacher/TeacherLoginPage';

// O painel do professor é carregado sob demanda: alunos não baixam esse código.
const TeacherArea = lazy(() => import('./pages/teacher/TeacherArea'));

export function App() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/como-usar" element={<HowToPage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/aluno/entrar" element={<StudentLoginPage />} />
          <Route path="/trilha" element={<RequireStudent><TrailPage /></RequireStudent>} />
          <Route path="/fase/:id" element={<RequireStudent><PhasePage /></RequireStudent>} />
          <Route path="/conquistas" element={<RequireStudent><AchievementsPage /></RequireStudent>} />
          <Route path="/glossario" element={<RequireStudent><GlossaryPage /></RequireStudent>} />
          <Route path="/professor/entrar" element={<TeacherLoginPage />} />
          <Route path="/professor/*" element={<RequireTeacher><TeacherArea /></RequireTeacher>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
