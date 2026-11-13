import { useEffect, useRef, useState } from 'react';
import { Btn, Bubbles, SpeakBtn, useAutoSpeak } from '../components/ui';
import { Zuzu } from '../components/shell';
import { MonsterSvg } from '../art/Monster';
import { NPCS, ZUZU } from '../game/npcs';
import { TURMAS, type Turma } from '../game/types';
import { sfx, unlockAudio } from '../lib/audio';

export function Logo({ small }: { small?: boolean }) {
  return (
    <div className="text-center">
      <h1 className={`title-game leading-none ${small ? 'text-3xl' : 'text-6xl sm:text-7xl'}`} style={{ color: '#ffc93c' }}>
        MONSTRINHOS!
      </h1>
      {!small && <p className="mt-2 text-xl font-bold text-white sm:text-2xl" style={{ textShadow: '0 2px 0 #2b1f4a' }}>O Laboratório das Criaturas Fantásticas</p>}
    </div>
  );
}

function FloatingFriends() {
  const spots = [
    { n: 0, l: '4%', t: '58%', s: 110, d: 0 },
    { n: 1, l: '80%', t: '62%', s: 130, d: 0.6 },
    { n: 2, l: '8%', t: '12%', s: 90, d: 1.2 },
    { n: 4, l: '84%', t: '10%', s: 96, d: 0.3 },
    { n: 6, l: '70%', t: '36%', s: 76, d: 0.9 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
      {spots.map((s, i) => (
        <div key={i} className="absolute anim-float" style={{ left: s.l, top: s.t, width: s.s, height: s.s, animationDelay: `${s.d}s` }}>
          <MonsterSvg m={NPCS[s.n].m} anim={i % 2 ? 'dancar' : 'parado'} size={s.s} />
        </div>
      ))}
    </div>
  );
}

export function Screen({ children, center = true }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`magic-bg relative flex min-h-full w-full flex-col items-center ${center ? 'justify-center' : ''} overflow-y-auto px-4 py-6`}>
      <Bubbles />
      <FloatingFriends />
      <div className="relative z-10 flex w-full flex-col items-center">{children}</div>
    </div>
  );
}

// ------------------------------------------------------------- Boas-vindas
export function Welcome({ remembered, stale, onNew, onRecover, onContinue, onOther, busy }: {
  remembered: { student1: string; student2: string } | null;
  stale: boolean;
  onNew: () => void;
  onRecover: () => void;
  onContinue: () => void;
  onOther: () => void;
  busy: boolean;
}) {
  return (
    <Screen>
      <div className="anim-pop mb-2 h-40 w-40 sm:h-48 sm:w-48">
        <MonsterSvg m={ZUZU} anim="comemorar" size="100%" />
      </div>
      <Logo />
      <div className="mt-8 flex w-full max-w-md flex-col gap-4">
        {remembered && !stale && (
          <Btn variant="lime" big onClick={() => { unlockAudio(); onContinue(); }} disabled={busy} data-testid="continue">
            ▶ Continuar: {remembered.student1} e {remembered.student2}
          </Btn>
        )}
        {remembered && stale && (
          <Btn variant="lime" big onClick={() => { unlockAudio(); onRecover(); }} disabled={busy} data-testid="continue-code">
            🔑 {remembered.student1} e {remembered.student2}: digitar o código
          </Btn>
        )}
        <Btn variant="sun" big onClick={() => { unlockAudio(); onNew(); }} disabled={busy} data-testid="new-project">✨ Novo projeto</Btn>
        <Btn variant="aqua" big onClick={() => { unlockAudio(); onRecover(); }} disabled={busy} data-testid="have-project">🔑 Já tenho meu projeto</Btn>
        {remembered && (
          <button type="button" onClick={onOther} disabled={busy} className="mx-auto mt-1 rounded-full bg-white/20 px-4 py-2 text-base font-bold text-white underline-offset-2 hover:underline" data-testid="other-pair">
            Não somos {remembered.student1} e {remembered.student2} (trocar de dupla)
          </button>
        )}
      </div>
      <a href="#/professor" className="mt-8 rounded-full bg-night/40 px-4 py-2 text-sm font-semibold text-white/85">👩‍🏫 Área do professor</a>
    </Screen>
  );
}

// ------------------------------------------------------------- Identificação
export function Identify({ onStart, onBack, busy, error }: { onStart: (t: Turma, a: string, b: string) => void; onBack: () => void; busy: boolean; error: string }) {
  const [turma, setTurma] = useState<Turma | null>(null);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useAutoSpeak('Quem vai jogar hoje? Escolham a turma e escrevam o primeiro nome de cada um.');
  const clean = (s: string) => s.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, '').replace(/\s{2,}/g, ' ').slice(0, 24);
  const okName = (s: string) => /^[A-Za-zÀ-ÖØ-öø-ÿ'-]{2,14}( [A-Za-zÀ-ÖØ-öø-ÿ'-]{2,14})?$/.test(s.trim());
  const same = a.trim() && a.trim().toLowerCase() === b.trim().toLowerCase();
  const ready = !!turma && okName(a) && okName(b) && !same;
  return (
    <Screen>
      <div className="panel w-full max-w-2xl bg-cream p-5 sm:p-7 anim-pop">
        <div className="flex items-center justify-between gap-2">
          <h1 className="title-game text-4xl sm:text-5xl" style={{ color: '#ff5fa2' }}>QUEM VAI JOGAR HOJE?</h1>
          <SpeakBtn text="Quem vai jogar hoje? Escolham a turma e escrevam o primeiro nome de cada um." />
        </div>
        <h2 className="mt-5 text-xl font-bold">1. Turma</h2>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {TURMAS.map((t) => (
            <button key={t.id} type="button" onClick={() => { sfx.select(); setTurma(t.id); }} aria-pressed={turma === t.id} data-testid={`turma-${t.id}`}
              className={`rounded-2xl border-4 border-ink px-2 py-4 text-xl font-bold shadow-chunky-sm transition-transform active:translate-y-1 sm:text-2xl ${turma === t.id ? 'bg-sun' : 'bg-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xl font-bold">2. Primeiro estudante</span>
            <input className="field mt-2" value={a} onChange={(e) => setA(clean(e.target.value))} placeholder="Só o primeiro nome" autoComplete="off" autoCapitalize="words" spellCheck={false} maxLength={24} data-testid="name1" />
          </label>
          <label className="block">
            <span className="text-xl font-bold">3. Segundo estudante</span>
            <input className="field mt-2" value={b} onChange={(e) => setB(clean(e.target.value))} placeholder="Só o primeiro nome" autoComplete="off" autoCapitalize="words" spellCheck={false} maxLength={24} data-testid="name2" />
          </label>
        </div>
        <p className="mt-3 text-base font-semibold text-ink/70">🔒 Só o primeiro nome. Sem sobrenome, sem e-mail.</p>
        {same && <p className="mt-2 text-lg font-bold text-bubble">Os dois nomes estão iguais. Escrevam o nome de cada um.</p>}
        {error && <p className="mt-2 rounded-2xl bg-[#ffe0e0] p-3 text-lg font-bold" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <Btn onClick={onBack} disabled={busy}>⬅ Voltar</Btn>
          <Btn variant="lime" big className="flex-1" disabled={!ready || busy} onClick={() => turma && onStart(turma, a.trim(), b.trim())} data-testid="start">
            {busy ? 'Preparando o laboratório...' : 'COMEÇAR A AVENTURA! 🚀'}
          </Btn>
        </div>
      </div>
    </Screen>
  );
}

// ------------------------------------------------------------- Já existe?
export function AlreadyExists({ names, onRecover, onForce, onBack }: { names: string; onRecover: () => void; onForce: () => void; onBack: () => void }) {
  return (
    <Screen>
      <div className="panel w-full max-w-xl bg-cream p-6 anim-pop">
        <Zuzu text={<>Parece que {names} já têm um projeto nesta turma! Para continuar, usem o <b>código</b> de vocês.</>} size={110} />
        <div className="mt-5 flex flex-col gap-3">
          <Btn variant="aqua" big onClick={onRecover} data-testid="go-recover">🔑 Digitar nosso código</Btn>
          <Btn variant="white" onClick={onForce} data-testid="force-new">Somos outra dupla com os mesmos nomes</Btn>
          <Btn variant="ghost" onClick={onBack}>⬅ Voltar</Btn>
        </div>
      </div>
    </Screen>
  );
}

// ------------------------------------------------------------- Código novo
export function CodeReveal({ code, names, onOk }: { code: string; names: string; onOk: () => void }) {
  const [copied, setCopied] = useState(false);
  useAutoSpeak('Este é o código secreto de vocês. Anotem no caderno. Com ele vocês continuam o projeto em outra aula ou em outro aparelho.');
  useEffect(() => sfx.unlock(), []);
  return (
    <Screen>
      <div className="panel w-full max-w-xl bg-cream p-6 text-center anim-pop">
        <div className="text-5xl">🔑</div>
        <h1 className="title-game mt-1 text-4xl" style={{ color: '#ffc93c' }}>Código secreto</h1>
        <p className="mt-2 text-lg font-semibold">{names}, este é o código do projeto de vocês:</p>
        <div className="mx-auto mt-4 select-all rounded-3xl border-4 border-dashed border-grape bg-white px-4 py-5 font-mono text-5xl font-bold tracking-[0.18em] text-grape-dark sm:text-6xl" data-testid="code" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {code}
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-sun-light p-3 text-left text-lg font-semibold">
          <span className="text-3xl">📒</span>
          <span>Anotem no caderno! Com ele vocês continuam em outra aula ou em outro aparelho. O professor também tem o código.</span>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Btn variant="white" onClick={() => { void navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => {}); }}>{copied ? '✔ Copiado' : '📋 Copiar'}</Btn>
          <Btn variant="lime" big className="flex-1" onClick={onOk} data-testid="code-ok">Já anotamos! ➜</Btn>
        </div>
      </div>
    </Screen>
  );
}

// ------------------------------------------------------------- Recuperar
export function Recover({ hint, onSubmit, onBack, busy, message }: { hint: string | null; onSubmit: (code: string) => void; onBack: () => void; busy: boolean; message: { kind: 'error' | 'blocked'; text: string } | null }) {
  const [code, setCode] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useAutoSpeak('Digitem o código secreto do projeto de vocês.');
  const norm = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const shown = norm.length > 4 ? `${norm.slice(0, 4)}-${norm.slice(4)}` : norm;
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <Screen>
      <div className="panel w-full max-w-xl bg-cream p-6 anim-pop">
        <div className="flex items-center justify-between gap-2">
          <h1 className="title-game text-4xl sm:text-5xl" style={{ color: '#32d1e5' }}>JÁ TENHO MEU PROJETO</h1>
          <SpeakBtn text="Digitem o código secreto do projeto de vocês." />
        </div>
        {hint && <p className="mt-2 text-xl font-bold">Olá, {hint}! 👋</p>}
        <p className="mt-2 text-lg font-semibold">Digitem o código secreto (8 letras e números):</p>
        <div className="relative mt-4" onClick={() => ref.current?.focus()}>
          <div className="flex justify-center gap-1.5 sm:gap-2" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => {
              if (i === 4) return <span key={i} className="self-center text-3xl font-bold text-ink/50">-</span>;
              const idx = i > 4 ? i - 1 : i;
              const ch = norm[idx] ?? '';
              const active = idx === norm.length;
              return (
                <span key={i} className={`flex h-14 w-10 items-center justify-center rounded-xl border-4 font-mono text-3xl font-bold sm:h-16 sm:w-12 ${ch ? 'border-ink bg-white' : active ? 'border-grape bg-white anim-pulse' : 'border-ink/25 bg-white/70'}`}>
                  {ch}
                </span>
              );
            })}
          </div>
          <input
            ref={ref}
            value={shown}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && norm.length === 8 && !busy) onSubmit(norm); }}
            className="absolute inset-0 h-full w-full cursor-text opacity-0"
            aria-label="Código do projeto"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            data-testid="code-input"
          />
        </div>
        {message && <p className={`mt-4 rounded-2xl p-3 text-lg font-bold ${message.kind === 'blocked' ? 'bg-sun-light' : 'bg-[#ffe0e0]'}`} role="alert">{message.text}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <Btn onClick={onBack} disabled={busy}>⬅ Voltar</Btn>
          <Btn variant="lime" big className="flex-1" disabled={norm.length !== 8 || busy} onClick={() => onSubmit(norm)} data-testid="recover-submit">
            {busy ? 'Procurando...' : 'Abrir projeto 🔓'}
          </Btn>
        </div>
        <p className="mt-4 text-center text-base font-semibold text-ink/70">Esqueceram o código? Peçam ao professor. 👩‍🏫</p>
      </div>
    </Screen>
  );
}

export function Loading({ text = 'Abrindo o laboratório...' }: { text?: string }) {
  return (
    <Screen>
      <div className="h-40 w-40"><MonsterSvg m={ZUZU} anim="pular" size="100%" /></div>
      <p className="mt-4 text-2xl font-bold text-white" style={{ textShadow: '0 2px 0 #2b1f4a' }} role="status">{text}</p>
    </Screen>
  );
}

export function SetupNeeded() {
  return (
    <Screen>
      <div className="panel w-full max-w-2xl bg-cream p-6">
        <Logo small />
        <h2 className="mt-4 text-2xl font-bold">⚙️ Falta configurar o salvamento online</h2>
        <p className="mt-2 text-lg">O jogo precisa do endereço e da chave pública (anon) do projeto Supabase da escola.</p>
        <ol className="mt-3 list-decimal space-y-1 pl-6 text-lg">
          <li>Abra o arquivo <code className="rounded bg-white px-1">config.json</code> que está na mesma pasta deste site.</li>
          <li>Preencha <code className="rounded bg-white px-1">supabaseUrl</code> e <code className="rounded bg-white px-1">supabaseAnonKey</code>.</li>
          <li>Salve e recarregue esta página.</li>
        </ol>
        <p className="mt-3 text-base text-ink/70">O passo a passo completo está no arquivo LEIA-ME (README) do jogo. Nunca use a chave “service_role”.</p>
      </div>
    </Screen>
  );
}
