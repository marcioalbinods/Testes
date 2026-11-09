import { createRoot } from 'react-dom/client';
import '@fontsource/lexend/latin-400.css';
import '@fontsource/lexend/latin-600.css';
import '@fontsource/lexend/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import './styles/global.css';
import './styles/app.css';
import App from './App';
import { ProgressProvider } from './lib/progress';

createRoot(document.getElementById('root')!).render(
  <ProgressProvider>
    <App />
  </ProgressProvider>,
);
