/** Faísca — o robô mascote da Academia (antena de LED que acende!). */
import type { ReactNode } from 'react';

export type Mood = 'happy' | 'think' | 'wow' | 'alert' | 'party';

export function Mascot({ size = 96, mood = 'happy', glow = true }: { size?: number; mood?: Mood; glow?: boolean }) {
  const eye = mood === 'party' ? 'M-6 0 q6 -7 12 0' : null;
  const ledColor = mood === 'alert' ? '#ff5a5a' : mood === 'think' ? '#6ab0ff' : '#ffe14d';
  return (
    <svg width={size} height={size} viewBox="-50 -62 100 112" aria-hidden className="mascot">
      <defs>
        <radialGradient id="m-glow">
          <stop offset="0" stopColor={ledColor} stopOpacity=".9" />
          <stop offset="1" stopColor={ledColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="m-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6d8dff" />
          <stop offset="1" stopColor="#5a3fe0" />
        </linearGradient>
      </defs>
      {/* antena com LED */}
      <line x1="0" y1="-30" x2="0" y2="-44" stroke="#2b2f55" strokeWidth="3" strokeLinecap="round" />
      {glow && <circle cx="0" cy="-50" r="14" fill="url(#m-glow)"><animate attributeName="r" values="12;15;12" dur="2.4s" repeatCount="indefinite" /></circle>}
      <path d="M-6 -46 a6 6 0 1 1 12 0 v5 h-12z" fill={ledColor} stroke="#2b2f55" strokeWidth="2" />
      {/* cabeça */}
      <rect x="-34" y="-32" width="68" height="52" rx="16" fill="url(#m-body)" stroke="#2b2f55" strokeWidth="3" />
      <rect x="-26" y="-24" width="52" height="34" rx="10" fill="#162048" />
      {eye ? (
        <>
          <path d={eye} transform="translate(-11 -6)" stroke="#4dff88" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d={eye} transform="translate(11 -6)" stroke="#4dff88" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'think' ? (
        <>
          <rect x="-16" y="-10" width="9" height="4" rx="2" fill="#6ab0ff" />
          <circle cx="11" cy="-8" r="4.5" fill="#6ab0ff" />
        </>
      ) : (
        <>
          <circle cx="-11" cy="-8" r={mood === 'wow' ? 6 : 4.8} fill={mood === 'alert' ? '#ff8a8a' : '#4dff88'}>
            <animate attributeName="ry" values="4.8;0.6;4.8" dur="4s" begin="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="11" cy="-8" r={mood === 'wow' ? 6 : 4.8} fill={mood === 'alert' ? '#ff8a8a' : '#4dff88'} />
        </>
      )}
      {mood === 'wow' ? (
        <ellipse cx="0" cy="3" rx="4" ry="4.5" fill="#4dff88" />
      ) : mood === 'alert' ? (
        <path d="M-7 5 h14" stroke="#ff8a8a" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M-8 2 q8 7 16 0" stroke="#4dff88" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {/* orelhas / conectores */}
      <rect x="-40" y="-16" width="7" height="18" rx="3" fill="#ffd43b" stroke="#2b2f55" strokeWidth="2" />
      <rect x="33" y="-16" width="7" height="18" rx="3" fill="#ffd43b" stroke="#2b2f55" strokeWidth="2" />
      {/* corpo */}
      <rect x="-22" y="22" width="44" height="24" rx="8" fill="url(#m-body)" stroke="#2b2f55" strokeWidth="3" />
      <circle cx="-8" cy="34" r="3.4" fill="#ff5a5a" />
      <circle cx="2" cy="34" r="3.4" fill="#ffe14d" />
      <circle cx="12" cy="34" r="3.4" fill="#4dff88" />
      {mood === 'party' && (
        <g>
          <path d="M-44 -40 l6 4 M44 -36 l-6 4 M-40 -54 l3 6 M40 -52 l-4 6" stroke="#ffd43b" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/** Mascote com balão de fala. */
export function MascotSays({ children, mood = 'happy', size = 76 }: { children: ReactNode; mood?: Mood; size?: number }) {
  return (
    <div className="mascot-says">
      <Mascot size={size} mood={mood} />
      <div className="bubble">{children}</div>
    </div>
  );
}
