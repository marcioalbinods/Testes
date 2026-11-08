import { useCallback, useEffect, useRef, useState } from 'react';
import type { Deck, ProjectForm } from '../types';
import { emptyForm } from '../data/constants';

export type Screen = 'form' | 'final' | 'editor' | 'guide';

export interface ProjectState {
  form: ProjectForm;
  step: number;
  screen: Screen;
  deck: Deck | null;
  deckEdited: boolean;
  isExample: boolean;
  themeChoice: string;
  savedAt?: string;
}

const KEY = 'tca-da-pesquisa-a-intervencao:v1';

const initial = (): ProjectState => ({ form: emptyForm(), step: 1, screen: 'form', deck: null, deckEdited: false, isExample: false, themeChoice: '' });

function load(): ProjectState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw) as Partial<ProjectState>;
    return { ...initial(), ...parsed, form: { ...emptyForm(), ...(parsed.form ?? {}) } };
  } catch {
    return initial();
  }
}

/** Estado do trabalho, salvo automaticamente apenas neste navegador. */
export function useProject() {
  const [state, setState] = useState<ProjectState>(load);
  const [storageOk, setStorageOk] = useState(true);
  const timer = useRef<number>();

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: new Date().toISOString() }));
        setStorageOk(true);
      } catch {
        setStorageOk(false);
      }
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  const update = useCallback((patch: Partial<ProjectForm>) => setState((s) => ({ ...s, form: { ...s.form, ...patch } })), []);
  const set = useCallback((patch: Partial<ProjectState>) => setState((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* sem armazenamento disponível */
    }
    setState(initial());
  }, []);
  const replace = useCallback((next: ProjectState) => setState({ ...initial(), ...next, form: { ...emptyForm(), ...next.form } }), []);

  return { state, update, set, reset, replace, storageOk };
}
