import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { Btn, IconBtn, toast } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { STAGES } from '../../game/missions';
import { SOUNDS, playSound, sfx, speak } from '../../lib/audio';
import { playRecording, recordingSupported, startRecording, type ActiveRecording } from '../../lib/recorder';
import { idb } from '../../lib/idb';
import { uid } from '../../lib/util';
import type { Recording } from '../../game/types';

const STARTERS = ['Olá! Eu sou o {nome}!', 'Eu gosto de dançar!', 'Eu moro num lugar mágico.', 'Meu barulho favorito é assim:', 'Vamos ser amigos?', 'Eu adoro fazer bagunça!'];

/** Gravador reutilizável (apresentação e narração das histórias). */
export function Recorder({ label, onSaved, maxSeconds = 20 }: { label: string; onSaved: (r: Recording) => void; maxSeconds?: number }) {
  const { update, store } = useGame();
  const [rec, setRec] = useState<ActiveRecording | null>(null);
  const [level, setLevel] = useState(0);
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState('');
  const raf = useRef(0);

  useEffect(() => () => { cancelAnimationFrame(raf.current); rec?.cancel(); }, [rec]);

  const begin = async () => {
    setErr('');
    try {
      const r = await startRecording(maxSeconds, () => void finish(r));
      setRec(r);
      const t0 = Date.now();
      const loop = () => {
        setLevel(r.level());
        setSecs(Math.floor((Date.now() - t0) / 1000));
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      setErr('Não conseguimos usar o microfone. Peçam ajuda ao professor.');
    }
  };
  const finish = async (r: ActiveRecording | null = rec) => {
    if (!r) return;
    cancelAnimationFrame(raf.current);
    const { blob, mime, duration } = await r.stop();
    setRec(null);
    if (blob.size < 500) {
      setErr('A gravação ficou vazia. Tentem de novo, falando pertinho.');
      return;
    }
    const id = uid();
    await idb.set(`rec:${id}`, blob);
    const meta: Recording = { id, label: label.slice(0, 24), path: null, duration, createdAt: Date.now(), mime };
    update('sounds', (s) => ({ ...s, recordings: [...s.recordings, meta] }), { immediate: true });
    sfx.star();
    onSaved(meta);
    void store.flush();
  };

  if (!recordingSupported()) return <p className="rounded-2xl bg-sun-light p-3 font-bold">Este aparelho não grava áudio. Usem os sons do laboratório! 🎵</p>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {!rec ? (
        <Btn variant="bubble" big onClick={begin} data-testid="rec-start">🎙️ Gravar</Btn>
      ) : (
        <Btn variant="sun" big onClick={() => void finish()} className="anim-pulse" data-testid="rec-stop">⏹ Parar ({secs}s)</Btn>
      )}
      {rec && (
        <div className="flex h-10 flex-1 items-end gap-1" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="w-3 rounded-full bg-bubble transition-all" style={{ height: `${Math.max(8, Math.min(100, level * 260 * (0.6 + ((i * 7) % 5) / 6)))}%` }} />
          ))}
        </div>
      )}
      {err && <p className="w-full font-bold text-bubble">{err}</p>}
    </div>
  );
}

export default function Presentation({ missionId }: { missionId: number | null }) {
  const { data, update, allowRecordings } = useGame();
  const pres = data.sounds.presentation;
  const [mode, setMode] = useState<'voz' | 'sons'>(pres.mode ?? (allowRecordings ? 'voz' : 'sons'));
  const [text, setText] = useState(pres.text);
  const [show, setShow] = useState(false);
  const [typed, setTyped] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const name = data.monster.name || 'Monstrinho';
  const recording = data.sounds.recordings.find((r) => r.id === pres.recordingId) ?? null;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const savePres = (p: Partial<typeof pres>) => update('sounds', (s) => ({ ...s, presentation: { ...s.presentation, ...p } }));

  const rehearse = async () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setShow(true);
    setTyped('');
    const full = text.trim() || `Olá! Eu sou o ${name}!`;
    for (let i = 1; i <= full.length; i++) timers.current.push(setTimeout(() => setTyped(full.slice(0, i)), i * 45));
    if (mode === 'voz' && recording) {
      await playRecording(recording);
    } else {
      pres.sounds.forEach((s, i) => timers.current.push(setTimeout(() => playSound(s), i * 700)));
      if (!pres.sounds.length) speak(full, true);
    }
    timers.current.push(setTimeout(() => setShow(false), Math.max(3500, full.length * 45 + 2500)));
  };

  const canFinish = (mode === 'voz' ? !!recording : pres.sounds.length >= 1) && text.trim().length >= 2;

  return (
    <ToolShell title="Apresentação" icon="🎤" color={STAGES[1].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <LabStage tone="sun" className="min-h-[240px] flex-1">
          <div className="absolute inset-x-0 bottom-0 top-[18%] p-3">
            <MonsterSvg m={data.monster} anim={show ? 'rir' : 'parado'} face={show ? FACE_PRESETS.find((f) => f.id === 'feliz')!.face : undefined} size="100%" />
          </div>
          {show && typed && (
            <div className="absolute left-1/2 top-3 w-[88%] -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-3 text-xl font-bold shadow-chunky anim-pop" data-testid="speech">
              {typed}
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1 text-3xl" aria-hidden>🎤</div>
        </LabStage>
        <div className="scroll-y flex min-h-0 flex-col gap-3 border-t-4 border-ink bg-cream p-3 md:w-[50%] md:border-l-4 md:border-t-0">
          <section>
            <h2 className="mb-1 text-lg font-bold">1. O que o {name} vai dizer?</h2>
            <textarea className="field !min-h-[90px] py-2 !text-lg" maxLength={140} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => savePres({ text })} placeholder={`Olá! Eu sou o ${name}...`} data-testid="pres-text" />
            <div className="mt-1 flex flex-wrap gap-1.5">
              {STARTERS.map((s) => (
                <button key={s} type="button" className="chip !text-xs" onClick={() => { const t = (text ? text + ' ' : '') + s.replace('{nome}', name); setText(t.slice(0, 140)); savePres({ text: t.slice(0, 140) }); sfx.tap(); }}>+ {s.replace('{nome}', name)}</button>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-1 text-lg font-bold">2. Como vai ser?</h2>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="tile" aria-pressed={mode === 'voz'} onClick={() => { if (!allowRecordings) { toast('A gravação de voz está desligada pela escola.', '🔒', 'warn'); return; } setMode('voz'); savePres({ mode: 'voz' }); }} data-testid="mode-voz">
                <span className="text-3xl">{allowRecordings ? '🎙️' : '🔒'}</span><span className="font-bold">Com a nossa voz</span>
              </button>
              <button type="button" className="tile" aria-pressed={mode === 'sons'} onClick={() => { setMode('sons'); savePres({ mode: 'sons' }); }} data-testid="mode-sons">
                <span className="text-3xl">🎵</span><span className="font-bold">Com sons do laboratório</span>
              </button>
            </div>
            {!allowRecordings && <p className="mt-2 rounded-2xl bg-white p-2 text-sm font-semibold">🔒 A gravação de voz só funciona quando o professor libera. Usem os sons!</p>}
          </section>
          {mode === 'voz' && allowRecordings && (
            <section className="rounded-2xl border-[3px] border-ink/20 bg-white p-3">
              <h2 className="mb-2 text-lg font-bold">3. Gravem a apresentação (até 20 segundos)</h2>
              <Recorder label={`Apresentação ${name}`} onSaved={(r) => savePres({ recordingId: r.id, mode: 'voz', text })} />
              {recording && (
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-cream p-2">
                  <span className="text-2xl">🎙️</span>
                  <span className="flex-1 font-bold">Gravação pronta ({Math.round(recording.duration)}s) {recording.path ? '☁️' : '📱'}</span>
                  <IconBtn label="Ouvir" icon="▶" onClick={() => void playRecording(recording)} />
                </div>
              )}
            </section>
          )}
          {mode === 'sons' && (
            <section className="rounded-2xl border-[3px] border-ink/20 bg-white p-3">
              <h2 className="mb-2 text-lg font-bold">3. Escolham até 4 sons</h2>
              <div className="grid-fill-sm">
                {SOUNDS.map((s) => {
                  const on = pres.sounds.includes(s.id);
                  return (
                    <button key={s.id} type="button" className="tile" aria-pressed={on} data-testid={`pres-sound-${s.id}`}
                      onClick={() => { playSound(s.id); if (on) savePres({ sounds: pres.sounds.filter((x) => x !== s.id) }); else if (pres.sounds.length < 4) savePres({ sounds: [...pres.sounds, s.id], mode: 'sons', text }); else toast('Máximo de 4 sons.', '🎵', 'warn'); }}>
                      <span className="text-2xl">{s.icon}</span><span className="text-[11px] font-bold">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          <div className="flex flex-wrap gap-2">
            <Btn variant="aqua" big className="flex-1" onClick={() => { savePres({ text }); void rehearse(); }} data-testid="pres-play">▶ Ensaiar</Btn>
            <Btn variant="lime" big className="flex-1" disabled={!canFinish} onClick={() => { sfx.star(); savePres({ done: true, text, mode }); toast('Apresentação pronta!', '🎤', 'ok'); void rehearse(); }} data-testid="pres-done">
              ✔ Apresentação pronta
            </Btn>
          </div>
          {!canFinish && <p className="text-sm font-semibold text-ink/70">Escrevam o que ele diz e {mode === 'voz' ? 'gravem a voz' : 'escolham pelo menos 1 som'}.</p>}
        </div>
      </div>
    </ToolShell>
  );
}
