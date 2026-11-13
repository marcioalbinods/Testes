import { useEffect, useState } from 'react';
import { MonsterSvg } from '../../art/Monster';
import { Btn, Confetti, SpeakBtn } from '../../components/ui';
import type { MonsterState } from '../../game/types';
import { sfx, speak } from '../../lib/audio';
import { INK, shade } from '../../art/colors';
import { randomName } from './CreatureLab';

/** Animação de nascimento: o ovo treme, racha e o monstrinho aparece. */
export default function Birth({ m, onDone, onClose }: { m: MonsterState; onDone: (name: string) => void; onClose: () => void }) {
  const [phase, setPhase] = useState<'egg' | 'born' | 'name'>(m.born ? 'name' : 'egg');
  const [taps, setTaps] = useState(0);
  const [name, setName] = useState(m.name);
  useEffect(() => {
    if (phase === 'egg') speak('Toque no ovo três vezes para ele nascer!');
    if (phase === 'born') {
      sfx.born();
      const t = setTimeout(() => setPhase('name'), 2600);
      return () => clearTimeout(t);
    }
    if (phase === 'name') speak('Que nome vocês vão dar para a criatura?');
  }, [phase]);
  const tapEgg = () => {
    sfx.hatch();
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) setTimeout(() => setPhase('born'), 350);
  };
  const ok = name.trim().length >= 2;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-3 anim-fade" data-testid="birth">
      {phase === 'born' && <Confetti count={120} />}
      <div className="panel relative w-full max-w-lg overflow-hidden bg-cream p-5 text-center anim-pop">
        {phase === 'egg' && (
          <>
            <h2 className="title-game text-4xl" style={{ color: '#ffc93c' }}>Vai nascer!</h2>
            <p className="mt-1 text-lg font-bold">Toque no ovo 3 vezes! ({taps}/3)</p>
            <button type="button" onClick={tapEgg} className="mx-auto mt-3 block h-64 w-56 egg-shake" aria-label="Tocar no ovo" data-testid="egg" style={{ animationDuration: `${0.6 - taps * 0.15}s` }}>
              <svg viewBox="0 0 200 240" className="h-full w-full" aria-hidden>
                <ellipse cx={100} cy={226} rx={70} ry={10} fill="#000" opacity={0.15} />
                <path d="M100,10 C160,10 186,110 186,150 C186,200 150,226 100,226 C50,226 14,200 14,150 C14,110 40,10 100,10Z" fill="#fffaf0" stroke={INK} strokeWidth={6} />
                <circle cx={70} cy={90} r={16} fill={m.skin} />
                <circle cx={130} cy={140} r={22} fill={shade(m.skin, 0.15)} />
                <circle cx={80} cy={180} r={12} fill={m.belly ?? m.skin} />
                <circle cx={140} cy={70} r={10} fill={m.skin} />
                {taps >= 1 && <path d="M60,120 l18,-14 l10,16 l14,-12 l12,14" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
                {taps >= 2 && <path d="M112,124 l14,10 l12,-14 l16,12 l10,-8" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
                {taps >= 3 && <path d="M40,150 l20,-8 l14,12 l20,-10 l16,10 l20,-12 l18,8 l14,-6" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            </button>
            <Btn variant="ghost" className="mt-2" onClick={onClose}>Ainda não, quero mudar mais coisas</Btn>
          </>
        )}
        {phase === 'born' && (
          <>
            <h2 className="title-game text-4xl" style={{ color: '#7ee04a' }}>NASCEU!</h2>
            <div className="mx-auto mt-2 h-72 w-72 born-pop">
              <MonsterSvg m={m} anim="comemorar" face={{ brows: 'surpresa', eyes: 'estrelas', mouth: null, mouthMod: 'aberto', blush: true, extra: 'brilhos', lookX: 0, lookY: 0 }} size="100%" />
            </div>
          </>
        )}
        {phase === 'name' && (
          <>
            <div className="mx-auto h-48 w-48"><MonsterSvg m={m} anim="pular" size="100%" /></div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold">Qual é o nome dele?</h2>
              <SpeakBtn text="Que nome vocês vão dar para a criatura?" />
            </div>
            <div className="mt-3 flex gap-2">
              <input className="field text-center text-2xl" value={name} maxLength={18} onChange={(e) => setName(e.target.value.replace(/[<>{}]/g, ''))} placeholder="Nome da criatura" autoFocus data-testid="monster-name" />
              <button type="button" className="btn btn-aqua btn-icon shrink-0" aria-label="Sortear um nome" title="Sortear um nome" onClick={() => { sfx.select(); setName(randomName()); }}>🎲</button>
            </div>
            <Btn variant="lime" big className="mt-4 w-full" disabled={!ok} onClick={() => { sfx.star(); onDone(name.trim()); }} data-testid="name-ok">
              {m.born ? 'Guardar nome ✔' : `Bem-vindo, ${name.trim() || '...'}! 🎉`}
            </Btn>
            {m.born && <Btn variant="ghost" className="mt-2" onClick={onClose}>Cancelar</Btn>}
          </>
        )}
      </div>
    </div>
  );
}
