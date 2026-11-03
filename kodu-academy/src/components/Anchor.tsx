import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Link para uma seção da mesma página. Com HashRouter, "#secao" mudaria a rota,
 * então rolamos até o elemento e movemos o foco para ele (acessibilidade).
 */
export function Anchor({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(to);
      }}
    >
      {children}
    </a>
  );
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** Rola até a seção indicada após "#" na rota (ex.: /como-usar#professor). */
export function useScrollToRouteHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => scrollToId(hash.slice(1)), 50);
  }, [hash]);
}
