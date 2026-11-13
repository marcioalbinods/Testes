import type { ReactNode } from 'react';

/** Palco do laboratório: chão, holofote e bolhas, onde o monstrinho aparece. */
export function LabStage({ children, tone = 'lab', className = '' }: { children: ReactNode; tone?: 'lab' | 'disco' | 'night' | 'sun'; className?: string }) {
  const bg =
    tone === 'disco'
      ? 'radial-gradient(circle at 50% 30%, #ff8fc7 0%, #7340d9 45%, #231a52 100%)'
      : tone === 'night'
        ? 'radial-gradient(circle at 50% 20%, #5b4fb8 0%, #231a52 70%)'
        : tone === 'sun'
          ? 'radial-gradient(circle at 50% 20%, #fff7c2 0%, #ffd27a 55%, #ff9a3c 100%)'
          : 'radial-gradient(circle at 50% 18%, #ffffff 0%, #e9defe 40%, #c9b8ff 100%)';
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: bg }}>
      {tone === 'disco' && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {['#ffc93c', '#32d1e5', '#7ee04a', '#ff5fa2'].map((c, i) => (
            <div key={c} className="absolute top-0 h-[140%] w-24 origin-top opacity-30 anim-wiggle" style={{ left: `${15 + i * 22}%`, background: `linear-gradient(180deg, ${c}, transparent)`, animationDuration: `${1.4 + i * 0.3}s`, filter: 'blur(6px)' }} />
          ))}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]" style={{ background: tone === 'disco' ? 'repeating-linear-gradient(90deg, #2b1f4a 0 40px, #3b2a8f 40px 80px)' : 'linear-gradient(180deg, #b49bff, #9b7cf0)' }} aria-hidden />
      <div className="pointer-events-none absolute inset-x-[15%] bottom-[14%] h-[10%] rounded-[50%] bg-white/30 blur-sm" aria-hidden />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
