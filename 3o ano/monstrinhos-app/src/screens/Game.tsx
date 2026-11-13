import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { GameProvider, useGame } from '../components/game';
import { CelebrationOverlay, SaveIndicator } from '../components/shell';
import { Btn, Confirm, IconBtn, Modal, Slider } from '../components/ui';
import { MonsterSvg } from '../art/Monster';
import type { ProjectStore } from '../lib/sync';
import type { ToolId } from '../game/missions';
import { STAGES } from '../game/missions';
import { medals, progressPct, totalStars } from '../game/progress';
import { getPrefs, setPrefs, speechAvailable } from '../lib/audio';
import * as api from '../lib/api';
import MapScreen from './Map';
import { Loading } from './Entry';

type ToolProps = { missionId: number | null; focus?: string };
const TOOLS: Record<ToolId, ComponentType<ToolProps>> = {
  criatura: lazy(() => import('../stages/creator/CreatureLab')),
  animacao: lazy(() => import('../stages/life/AnimationLab')),
  expressoes: lazy(() => import('../stages/life/ExpressionLab')),
  danca: lazy(() => import('../stages/life/DanceLab')),
  sons: lazy(() => import('../stages/life/SoundLab')),
  apresentacao: lazy(() => import('../stages/life/Presentation')),
  personalidade: lazy(() => import('../stages/identity/Traits')),
  comida: lazy(() => import('../stages/identity/Food')),
  poder: lazy(() => import('../stages/identity/Power')),
  gostos: lazy(() => import('../stages/identity/Likes')),
  passaporte: lazy(() => import('../stages/identity/Passport')),
  habitat: lazy(() => import('../stages/habitat/HabitatEditor')),
  explorar: lazy(() => import('../stages/habitat/Explore')),
  floresta: lazy(() => import('../stages/adventures/Forest')),
  amigo: lazy(() => import('../stages/adventures/LostFriend')),
  ponte: lazy(() => import('../stages/adventures/Bridge')),
  tempestade: lazy(() => import('../stages/adventures/Storm')),
  festa: lazy(() => import('../stages/adventures/Party')),
  historia: lazy(() => import('../stages/story/StoryStudio')),
};
const Trophies = lazy(() => import('./Trophies'));
const Exhibition = lazy(() => import('./Exhibition'));

function Settings({ open, onClose, onExit }: { open: boolean; onClose: () => void; onExit: () => void }) {
  const { store, data } = useGame();
  const [prefs, setP] = useState(getPrefs());
  const [code, setCode] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const set = (p: Partial<typeof prefs>) => {
    setPrefs(p);
    setP(getPrefs());
  };
  useEffect(() => {
    if (open && !code) api.getMyCode(store.info.id).then(setCode).catch(() => setCode(null));
  }, [open, code, store.info.id]);
  return (
    <>
      <Modal open={open} onClose={onClose} title="⚙️ Menu">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-cream p-3">
            <div className="h-20 w-20 shrink-0"><MonsterSvg m={data.monster} size="100%" still /></div>
            <div>
              <div className="text-xl font-bold">{store.info.student1} e {store.info.student2}</div>
              <div className="font-semibold text-ink/70">Turma {store.info.turma.replace('3', '3º ')}</div>
              <div className="font-semibold">Código: <span className="font-mono text-lg font-bold tracking-widest text-grape-dark" data-testid="my-code">{code ?? '—'}</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Btn variant={prefs.sound ? 'lime' : 'white'} onClick={() => set({ sound: !prefs.sound })} icon={prefs.sound ? '🔊' : '🔇'}>Sons {prefs.sound ? 'ligados' : 'desligados'}</Btn>
            {speechAvailable() && (
              <Btn variant={prefs.voice ? 'lime' : 'white'} onClick={() => set({ voice: !prefs.voice })} icon="🗣️">Ler em voz alta {prefs.voice ? 'ligado' : 'desligado'}</Btn>
            )}
          </div>
          <Slider label="Volume" value={prefs.volume} min={0} max={1} onChange={(v) => set({ volume: v })} left="🔈" right="🔊" />
          <div className="rounded-2xl border-4 border-dashed border-ink/30 p-3">
            <p className="mb-2 text-base font-semibold">Acabou a aula? Tudo é salvo na nuvem e este aparelho fica livre para outra dupla.</p>
            <Btn variant="bubble" className="w-full" onClick={() => setConfirm(true)} data-testid="exit">🚪 Terminar por hoje / Trocar de dupla</Btn>
          </div>
        </div>
      </Modal>
      <Confirm
        open={confirm}
        title="Terminar por hoje?"
        text={<>Vamos guardar tudo na nuvem. Para voltar, usem o código <b className="font-mono">{code ?? ''}</b>.</>}
        yes="Sim, terminar"
        no="Continuar jogando"
        onNo={() => setConfirm(false)}
        onYes={() => { setConfirm(false); onClose(); onExit(); }}
      />
    </>
  );
}

function Hud({ onMenu }: { onMenu: () => void }) {
  const { data, store, go } = useGame();
  const stars = totalStars(data);
  const med = medals(data).length;
  return (
    <div className="flex shrink-0 items-center gap-2 border-b-4 border-ink bg-grape px-2 py-1.5 sm:px-3">
      <button type="button" onClick={() => go({ name: 'map' })} className="flex items-center gap-2" aria-label="Mapa">
        <div className="h-12 w-12 shrink-0 rounded-full border-[3px] border-ink bg-white">
          <MonsterSvg m={data.monster} size="100%" still />
        </div>
        <div className="hidden text-left leading-tight sm:block">
          <div className="title-game text-xl" style={{ color: '#ffc93c' }}>MONSTRINHOS!</div>
          <div className="text-sm font-bold text-white">{data.monster.name || 'Seu monstrinho'} · {store.info.student1} e {store.info.student2}</div>
        </div>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <span className="chip bg-sun-light text-base" title="Estrelas" data-testid="stars">⭐ {stars}</span>
        <span className="chip hidden bg-white text-base sm:inline-flex" title="Medalhas">🏅 {med}/6</span>
        <span className="chip hidden bg-white text-base md:inline-flex" title="Progresso">📈 {progressPct(data)}%</span>
        <SaveIndicator />
        <IconBtn label="Menu" icon="⚙️" onClick={onMenu} data-testid="menu" />
      </div>
    </div>
  );
}

function Notices() {
  const { store } = useGame();
  const [notice, setNotice] = useState(store.notice);
  useEffect(() => store.subscribe(() => setNotice(store.notice)), [store]);
  return (
    <Modal open={!!notice} title={notice === 'reset' ? '🔄 Projeto reiniciado' : '🔒 Acesso encerrado'} onClose={notice === 'reset' ? () => { store.notice = null; setNotice(null); } : undefined}>
      {notice === 'reset' ? (
        <>
          <p className="text-lg">O professor reiniciou este projeto. Vocês podem começar uma nova aventura!</p>
          <Btn variant="lime" className="mt-4 w-full" onClick={() => { store.notice = null; setNotice(null); }}>Entendi</Btn>
        </>
      ) : (
        <>
          <p className="text-lg">Este aparelho não tem mais acesso a este projeto. Chamem o professor.</p>
          <Btn variant="sun" className="mt-4 w-full" onClick={() => location.reload()}>Voltar ao início</Btn>
        </>
      )}
    </Modal>
  );
}

function Router() {
  const { route } = useGame();
  if (route.name === 'map') return <MapScreen />;
  if (route.name === 'trophies') return <Trophies />;
  if (route.name === 'exhibition') return <Exhibition />;
  const Tool = TOOLS[route.tool];
  return <Tool key={`${route.tool}-${route.mission}`} missionId={route.mission} focus={route.focus} />;
}

function Shell({ onExit }: { onExit: () => void }) {
  const [menu, setMenu] = useState(false);
  const { route } = useGame();
  return (
    <div className="flex h-full flex-col bg-cream" data-testid="game">
      {route.name !== 'tool' && <Hud onMenu={() => setMenu(true)} />}
      <main className="relative min-h-0 flex-1">
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Loading text="Carregando..." /></div>}>
          <Router />
        </Suspense>
      </main>
      <CelebrationOverlay />
      <Settings open={menu} onClose={() => setMenu(false)} onExit={onExit} />
      <Notices />
    </div>
  );
}

export default function Game({ store, allowRecordings, onExit }: { store: ProjectStore; allowRecordings: boolean; onExit: () => void }) {
  return (
    <GameProvider store={store} allowRecordings={allowRecordings}>
      <Shell onExit={onExit} />
    </GameProvider>
  );
}

export { STAGES };
