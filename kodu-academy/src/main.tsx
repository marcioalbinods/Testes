import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { AppProvider } from './state/AppContext';
import { ToastProvider } from './components/Feedback';
import './styles.css';

// HashRouter: funciona no GitHub Pages sem configuração de servidor.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
