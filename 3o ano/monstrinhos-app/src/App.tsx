import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { loadConfig } from './lib/config';
import * as api from './lib/api';
import { device, hashCode, ProjectStore, syncBackground, type DeviceRecord } from './lib/sync';
import { AlreadyExists, CodeReveal, Identify, Loading, Recover, SetupNeeded, Welcome } from './screens/Entry';
import { Toasts } from './components/ui';
import type { Turma } from './game/types';

const Game = lazy(() => import('./screens/Game'));
const TeacherApp = lazy(() => import('./teacher/TeacherApp'));

type View =
  | { v: 'boot' }
  | { v: 'setup' }
  | { v: 'welcome' }
  | { v: 'identify'; error: string }
  | { v: 'exists'; turma: Turma; a: string; b: string }
  | { v: 'recover'; message: { kind: 'error' | 'blocked'; text: string } | null }
  | { v: 'code'; code: string; payload: api.ProjectPayload }
  | { v: 'loading'; text?: string }
  | { v: 'game'; store: ProjectStore; allowRecordings: boolean };

const ERR: Record<string, string> = {
  invalid_name: 'Escrevam só o primeiro nome de cada um (só letras, sem números).',
  same_name: 'Os dois nomes estão iguais.',
  invalid_class: 'Escolham a turma.',
  not_authenticated: 'Não foi possível entrar. Tentem de novo.',
};

/** Envia o que faltava do projeto antigo deste aparelho e sai dele. */
async function leaveOld(id: string) {
  const s = ProjectStore.fromLocal(id);
  if (s) await s.close({ leave: true });
  else await api.leaveProject(id).catch(() => {});
}

function useHash() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const h = () => setHash(location.hash);
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const [view, setView] = useState<View>({ v: 'boot' });
  const [busy, setBusy] = useState(false);
  const [remembered, setRemembered] = useState<DeviceRecord | null>(null);
  const isTeacher = hash.startsWith('#/professor');

  // Início: carrega a configuração e lembra a última dupla deste aparelho.
  useEffect(() => {
    let alive = true;
    (async () => {
      const cfg = await loadConfig();
      if (!alive) return;
      if (!cfg) return setView({ v: 'setup' });
      api.initClient(cfg);
      const rec = device.get();
      setRemembered(rec);
      setView({ v: 'welcome' });
      if (rec && device.isStale(rec) && navigator.onLine) {
        // Aula nova: este aparelho envia o que faltava e sai do projeto.
        // A dupla volta digitando o código.
        await leaveOld(rec.projectId).catch(() => {});
      }
      void syncBackground(rec?.projectId);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const enterGame = useCallback(async (store: ProjectStore, code: string | null) => {
    const prev = device.get();
    device.set({
      projectId: store.info.id, turma: store.info.turma, student1: store.info.student1, student2: store.info.student2, lastActive: Date.now(),
      codeHash: code ? await hashCode(code) : prev?.projectId === store.info.id ? prev.codeHash : null,
    });
    let allow = false;
    try {
      allow = (await api.getProjectSettings(store.info.id)).allowRecordings;
    } catch {
      allow = false;
    }
    setRemembered(device.get());
    setView({ v: 'game', store, allowRecordings: allow });
  }, []);

  const start = async (turma: Turma, a: string, b: string, force = false) => {
    setBusy(true);
    try {
      const r = await api.createProject(turma, a, b, force);
      if (r.status === 'created') setView({ v: 'code', code: r.code, payload: r.project });
      else if (r.status === 'exists') setView({ v: 'exists', turma, a, b });
      else if (r.status === 'blocked') setView({ v: 'identify', error: 'Muitas tentativas agora. Esperem alguns minutos ou chamem o professor.' });
      else setView({ v: 'identify', error: ERR[r.message] ?? 'Não deu certo. Tentem de novo.' });
    } catch (e) {
      setView({ v: 'identify', error: e instanceof api.NetworkError ? 'Sem internet agora. Para criar um projeto novo é preciso internet. 📶' : 'Não deu certo. Tentem de novo ou chamem o professor.' });
    } finally {
      setBusy(false);
    }
  };

  const recover = async (code: string) => {
    setBusy(true);
    try {
      const r = await api.recoverProject(code);
      if (r.status === 'ok') {
        const rec = device.get();
        if (rec && rec.projectId !== r.project.id) void leaveOld(rec.projectId); // outra dupla usava este aparelho
        setView({ v: 'loading' });
        await enterGame(ProjectStore.fromServer(r.project), code);
      } else if (r.status === 'blocked') {
        setView({ v: 'recover', message: { kind: 'blocked', text: 'Muitas tentativas erradas. Esperem 10 minutos ou peçam o código ao professor. ⏳' } });
      } else if (r.status === 'invalid') {
        setView({ v: 'recover', message: { kind: 'error', text: `Código não encontrado. Confiram as letras e tentem de novo. 🔍` } });
      } else {
        setView({ v: 'recover', message: { kind: 'error', text: 'Não deu certo. Tentem de novo.' } });
      }
    } catch (e) {
      // Sem internet: aceita o código se for o mesmo projeto guardado aqui.
      const rec = device.get();
      if (e instanceof api.NetworkError && rec?.codeHash && (await hashCode(code)) === rec.codeHash) {
        const store = ProjectStore.fromLocal(rec.projectId);
        if (store) {
          await enterGame(store, code);
          return;
        }
      }
      setView({ v: 'recover', message: { kind: 'error', text: e instanceof api.NetworkError ? 'Sem internet agora. Esperem a internet voltar. 📶' : 'Não deu certo. Tentem de novo.' } });
    } finally {
      setBusy(false);
    }
  };

  const continueProject = async () => {
    const rec = device.get();
    if (!rec) return;
    setBusy(true);
    setView({ v: 'loading' });
    try {
      const r = await api.loadProject(rec.projectId);
      if (r.status === 'ok') return await enterGame(ProjectStore.fromServer(r.project), null);
      device.clear();
      setRemembered(null);
      setView({ v: 'recover', message: { kind: 'error', text: 'Este aparelho não está mais ligado ao projeto. Digitem o código.' } });
    } catch {
      const store = ProjectStore.fromLocal(rec.projectId);
      if (store) return await enterGame(store, null);
      setView({ v: 'welcome' });
    } finally {
      setBusy(false);
    }
  };

  const otherPair = async () => {
    const rec = device.get();
    setBusy(true);
    if (rec) await leaveOld(rec.projectId);
    device.clear();
    setRemembered(null);
    setBusy(false);
    setView({ v: 'identify', error: '' });
  };

  const exitGame = async (store: ProjectStore) => {
    setView({ v: 'loading', text: 'Guardando tudo na nuvem...' });
    await store.close({ leave: true });
    device.clear();
    setRemembered(null);
    setView({ v: 'welcome' });
  };

  if (isTeacher) {
    return (
      <Suspense fallback={<Loading text="Abrindo a área do professor..." />}>
        <TeacherApp />
        <Toasts />
      </Suspense>
    );
  }

  let content: React.ReactNode = null;
  switch (view.v) {
    case 'boot':
      content = <Loading />;
      break;
    case 'setup':
      content = <SetupNeeded />;
      break;
    case 'welcome':
      content = (
        <Welcome
          remembered={remembered}
          stale={!!remembered && device.isStale(remembered)}
          busy={busy}
          onNew={() => setView({ v: 'identify', error: '' })}
          onRecover={() => setView({ v: 'recover', message: null })}
          onContinue={continueProject}
          onOther={otherPair}
        />
      );
      break;
    case 'identify':
      content = <Identify busy={busy} error={view.error} onBack={() => setView({ v: 'welcome' })} onStart={(t, a, b) => start(t, a, b)} />;
      break;
    case 'exists':
      content = (
        <AlreadyExists
          names={`${view.a} e ${view.b}`}
          onRecover={() => setView({ v: 'recover', message: null })}
          onForce={() => start(view.turma, view.a, view.b, true)}
          onBack={() => setView({ v: 'identify', error: '' })}
        />
      );
      break;
    case 'recover':
      content = (
        <Recover
          hint={remembered ? `${remembered.student1} e ${remembered.student2}` : null}
          busy={busy}
          message={view.message}
          onBack={() => setView({ v: 'welcome' })}
          onSubmit={recover}
        />
      );
      break;
    case 'code':
      content = (
        <CodeReveal
          code={view.code}
          names={`${view.payload.student1} e ${view.payload.student2}`}
          onOk={async () => {
            const old = device.get();
            if (old && old.projectId !== view.payload.id) void leaveOld(old.projectId);
            setView({ v: 'loading' });
            await enterGame(ProjectStore.fromServer(view.payload), view.code);
          }}
        />
      );
      break;
    case 'loading':
      content = <Loading text={view.text} />;
      break;
    case 'game':
      content = (
        <Suspense fallback={<Loading />}>
          <Game store={view.store} allowRecordings={view.allowRecordings} onExit={() => exitGame(view.store)} />
        </Suspense>
      );
      break;
  }
  return (
    <>
      {content}
      <Toasts />
    </>
  );
}
