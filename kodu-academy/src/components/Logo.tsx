/** Marca própria da plataforma (não usa a marca do Kodu/Microsoft). */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ka-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2449b8" />
          <stop offset="1" stopColor="#0b7f6f" />
        </linearGradient>
      </defs>
      <path d="M24 3 42 13.5v21L24 45 6 34.5v-21Z" fill="url(#ka-g)" />
      <path d="M17 15v18M17 24l10-9M20.5 21l7.5 12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="33" cy="24" r="2.6" fill="#ffd166" />
    </svg>
  );
}
