import { useState } from 'react';

const KEY = 'kodu-academy-filtro-turma';

/** Turma selecionada, lembrada entre as abas do painel durante a sessão. */
export function useClassFilter(): [string, (v: string) => void] {
  const [v, setV] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) ?? '';
    } catch {
      return '';
    }
  });
  return [
    v,
    (next) => {
      setV(next);
      try {
        sessionStorage.setItem(KEY, next);
      } catch {
        /* armazenamento indisponível */
      }
    },
  ];
}
