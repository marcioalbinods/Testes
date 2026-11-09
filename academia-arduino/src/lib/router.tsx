/**
 * Roteamento por "hash" (#/caminho). Funciona no GitHub Pages sem erros 404 ao recarregar a página.
 */
import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/';
}

export function navigate(path: string) {
  if (currentPath() === path) return;
  window.location.hash = path;
}

export function useRoute(): string[] {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const on = () => setPath(currentPath());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
