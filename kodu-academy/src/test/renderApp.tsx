import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { AppProvider } from '../state/AppContext';
import { ToastProvider } from '../components/Feedback';
import { setBackendForTests } from '../services/backend';
import { createDemoBackend } from '../services/demoBackend';

/** Monta a aplicação completa (como no navegador) com o backend de demonstração. */
export function renderApp(route = '/') {
  setBackendForTests(createDemoBackend());
  return render(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}

/** Cria professor, turma e alunos no armazenamento de demonstração. Devolve os códigos. */
export async function seedClass(names = ['Ana', 'Bruno']) {
  localStorage.clear();
  const b = createDemoBackend();
  await b.teacher.signIn('prof@escola.br', 'senha-segura');
  await b.teacher.createClass('7º A', '2026');
  const { classes } = await b.teacher.loadData();
  const codes = await b.teacher.createStudents(classes[0].id, names);
  await b.teacher.signOut();
  return codes;
}
