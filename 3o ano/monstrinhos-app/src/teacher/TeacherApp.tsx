import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadConfig } from '../lib/config';
import * as T from './teacherApi';
import { Btn, Confirm, Modal, toast } from '../components/ui';
import { MonsterSvg } from '../art/Monster';
import { normalizeGame } from '../game/defaults';
import { MISSIONS, STAGES } from '../game/missions';
import { TURMAS, type GameData, type Turma } from '../game/types';
import { ExhibitionContent } from '../screens/Exhibition';
import StoryPlayer from '../stages/story/StoryPlayer';
import { SLOTS, SLOT_ORDER, ACCESSORIES } from '../art/parts';
import { playRecording } from '../lib/recorder';
import type { Story } from '../game/types';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—');
const fmtDay = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—');
const turmaLabel = (t: string) => TURMAS.find((x) => x.id === t)?.label ?? t;

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await T.signIn(email.trim(), pw);
      onDone();
    } catch {
      setErr('E-mail ou senha incorretos.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="magic-bg flex min-h-full items-center justify-center p-4">
      <form onSubmit={submit} className="panel w-full max-w-md bg-cream p-6">
        <h1 className="title-game text-4xl" style={{ color: '#ffc93c' }}>MONSTRINHOS!</h1>
        <h2 className="mt-1 text-2xl font-bold">👩‍🏫 Área do professor</h2>
        <p className="mb-4 mt-1 text-base text-ink/70">Acesso exclusivo para professores cadastrados.</p>
        <label className="block font-bold">E-mail
          <input className="field mt-1" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="t-email" />
        </label>
        <label className="mt-3 block font-bold">Senha
          <input className="field mt-1" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required data-testid="t-password" />
        </label>
        {err && <p className="mt-3 rounded-xl bg-[#ffe0e0] p-2 font-bold" role="alert">{err}</p>}
        <Btn variant="grape" big className="mt-5 w-full" disabled={busy} type="submit" data-testid="t-login">{busy ? 'Entrando...' : 'Entrar'}</Btn>
        <a href="#" className="mt-4 block text-center font-semibold underline">⬅ Voltar ao jogo</a>
      </form>
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-24 overflow-hidden rounded-full border-2 border-ink bg-white"><div className="h-full bg-lime" style={{ width: `${pct}%` }} /></div>
      <span className="text-sm font-bold">{pct}%</span>
    </div>
  );
}

function ProjectViewer({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [row, setRow] = useState<T.ProjectRow | null>(null);
  const [snaps, setSnaps] = useState<T.SnapshotRow[]>([]);
  const [play, setPlay] = useState<Story | null>(null);
  const [restore, setRestore] = useState<T.SnapshotRow | null>(null);
  const load = useCallback(async () => {
    setRow(await T.getProject(id));
    setSnaps(await T.listSnapshots(id).catch(() => []));
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  const g: GameData | null = row ? normalizeGame(row.data) : null;
  const names = row ? `${row.student1} e ${row.student2}` : '';
  return (
    <Modal open onClose={onClose} title={row ? `${names} · ${turmaLabel(row.turma)}` : 'Carregando...'} wide>
      {g && row && (
        <div className="space-y-4" data-testid="t-viewer">
          <div className="grid gap-2 rounded-2xl bg-cream p-3 sm:grid-cols-4">
            <div><b>Progresso</b><Bar pct={row.progress} /></div>
            <div><b>Etapa atual</b><div>{STAGES[row.current_stage - 1]?.name}</div></div>
            <div><b>Missões</b><div>{row.missions_done.length} de 30 · ⭐ {row.stars}</div></div>
            <div><b>Último acesso</b><div>{fmt(row.last_access_at)}</div></div>
          </div>
          <section className="rounded-2xl border-[3px] border-ink/20 p-3">
            <h3 className="mb-2 text-xl font-bold">🧪 Personalizações do monstrinho</h3>
            <div className="flex flex-wrap gap-4">
              <div className="h-40 w-40"><MonsterSvg m={g.monster} still size="100%" /></div>
              <ul className="grid flex-1 gap-x-4 text-sm sm:grid-cols-2">
                <li><b>Nome:</b> {g.monster.name || '—'}</li>
                <li><b>Pele:</b> <span className="inline-block h-3 w-6 rounded border border-ink align-middle" style={{ background: g.monster.skin }} /> · textura {g.monster.texture}</li>
                {SLOT_ORDER.map((s) => {
                  const p = g.monster.parts[s];
                  return <li key={s}><b>{SLOTS[s].name}:</b> {p ? SLOTS[s].items.find((i) => i.id === p.id)?.name ?? p.id : '—'}</li>;
                })}
                <li><b>Enfeites:</b> {g.monster.accessories.map((a) => ACCESSORIES.find((x) => x.id === a.id)?.name).join(', ') || '—'}</li>
                <li><b>Peças testadas:</b> {g.monster.tried.length}</li>
              </ul>
            </div>
          </section>
          <section className="rounded-2xl border-[3px] border-ink/20 p-3">
            <h3 className="mb-2 text-xl font-bold">🎵 Movimentos, expressões e sons</h3>
            <ul className="text-sm">
              <li><b>Movimento favorito:</b> {g.life.favoriteAnim ?? '—'} · testados: {g.life.tried.length}</li>
              <li><b>Expressões criadas:</b> {g.life.expressions.map((e) => e.name).join(', ') || '—'}</li>
              <li><b>Coreografia:</b> {g.life.dance.moves.filter(Boolean).join(', ') || '—'} ({g.life.dance.played} vezes)</li>
              <li><b>Sons na linha do tempo:</b> {g.sounds.track.lanes.flat().filter(Boolean).length} · apresentação: {g.sounds.presentation.done ? `pronta (${g.sounds.presentation.mode})` : 'não'}</li>
              {g.sounds.presentation.text && <li><b>Texto da apresentação:</b> “{g.sounds.presentation.text}”</li>}
            </ul>
            {g.sounds.recordings.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {g.sounds.recordings.map((r) => (
                  <Btn key={r.id} onClick={() => void playRecording(r).then((d) => { if (!d) toast('Gravação ainda não enviada para a nuvem.', '📱', 'warn'); })} icon="🎙️">{r.label}</Btn>
                ))}
              </div>
            )}
          </section>
          <ExhibitionContent g={g} names={names} onPlay={setPlay} />
          <section className="rounded-2xl border-[3px] border-ink/20 p-3">
            <h3 className="mb-2 text-xl font-bold">🕘 Versões anteriores (cópias automáticas)</h3>
            {snaps.length === 0 ? <p className="text-sm">Nenhuma cópia ainda (são criadas a cada 20 minutos de trabalho).</p> : (
              <div className="space-y-1">
                {snaps.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 rounded-xl bg-cream px-2 py-1 text-sm">
                    <span className="flex-1">{fmt(s.created_at)} · progresso {s.progress}%</span>
                    <Btn className="!min-h-[40px]" onClick={() => setRestore(s)}>Restaurar</Btn>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      {play && g && <StoryPlayer story={play} g={g} credits={names} onClose={() => setPlay(null)} />}
      <Confirm open={!!restore} title="Restaurar versão?" text={`O projeto volta para como estava em ${fmt(restore?.created_at ?? null)}. A versão atual vira uma cópia automática.`} yes="Restaurar" onNo={() => setRestore(null)}
        onYes={async () => { const s = restore!; setRestore(null); try { await T.restoreSnapshot(s.id); toast('Versão restaurada.', '✔', 'ok'); await load(); onChanged(); } catch (e) { toast(String(e), '⚠️', 'warn'); } }} />
    </Modal>
  );
}

type Danger = { kind: 'reset' | 'clear' | 'delete' | 'resetClass' | 'delArchive'; id?: string; archiveId?: number; label: string; turma?: Turma };

export default function TeacherApp() {
  const [ready, setReady] = useState<'loading' | 'nocfg' | 'login' | 'notTeacher' | 'ok'>('loading');
  const [rows, setRows] = useState<T.ProjectRow[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [archive, setArchive] = useState<T.ArchiveRow[]>([]);
  const [tab, setTab] = useState<'geral' | Turma | 'anteriores'>('geral');
  const [view, setView] = useState<string | null>(null);
  const [archiveView, setArchiveView] = useState<T.ArchiveRow | null>(null);
  const [danger, setDanger] = useState<Danger | null>(null);
  const [typed, setTyped] = useState('');
  const [printTurma, setPrintTurma] = useState<Turma | null>(null);
  const [q, setQ] = useState('');

  const refresh = useCallback(async () => {
    const [r, c, s, a] = await Promise.all([T.listProjects(true), T.listCodes(), T.classSettings(), T.listArchive()]);
    setRows(r);
    setCodes(c);
    setSettings(s);
    setArchive(a);
  }, []);

  const boot = useCallback(async () => {
    const cfg = await loadConfig();
    if (!cfg) return setReady('nocfg');
    T.teacherClient(cfg);
    const s = await T.currentSession();
    if (!s) return setReady('login');
    if (!(await T.isTeacher())) return setReady('notTeacher');
    setReady('ok');
    await refresh().catch((e) => toast(String(e), '⚠️', 'warn'));
  }, [refresh]);
  useEffect(() => { void boot(); }, [boot]);

  const stats = useMemo(() => {
    const started = rows.filter((r) => r.progress > 0).length;
    const done = rows.filter((r) => r.progress >= 100).length;
    const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.progress, 0) / rows.length) : 0;
    const recent = [...rows].sort((a, b) => b.last_access_at.localeCompare(a.last_access_at)).slice(0, 8);
    return { started, done, avg, recent };
  }, [rows]);

  const exportCsv = () => {
    const head = ['Turma', 'Estudante 1', 'Estudante 2', 'Código', 'Criado em', 'Último acesso', 'Etapa atual', 'Missões concluídas', 'Progresso (%)', 'Estrelas', 'Concluído em', 'Nome do monstrinho', 'Histórias publicadas'];
    const lines = rows.map((r) => {
      const g = normalizeGame(r.data);
      return [turmaLabel(r.turma), r.student1, r.student2, codes[r.id] ?? '', fmtDay(r.created_at), fmt(r.last_access_at), `${r.current_stage}. ${STAGES[r.current_stage - 1]?.name ?? ''}`, r.missions_done.length, r.progress, r.stars, fmtDay(r.completed_at), g.monster.name, g.stories.stories.filter((s) => s.published).length];
    });
    const csv = '﻿' + [head, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `monstrinhos-relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Relatório baixado!', '📄', 'ok');
  };

  const runDanger = async () => {
    const d = danger!;
    setDanger(null);
    setTyped('');
    try {
      if (d.kind === 'reset') await T.resetProject(d.id!);
      if (d.kind === 'clear') await T.clearProject(d.id!);
      if (d.kind === 'delete') await T.deleteProject(d.id!);
      if (d.kind === 'resetClass') await T.resetClass(d.turma!);
      if (d.kind === 'delArchive') await T.deleteArchive(d.archiveId!);
      toast('Feito!', '✔', 'ok');
      await refresh();
    } catch (e) {
      toast('Não foi possível: ' + String(e), '⚠️', 'warn');
    }
  };

  if (ready === 'loading') return <div className="magic-bg flex h-full items-center justify-center text-2xl font-bold text-white">Carregando...</div>;
  if (ready === 'nocfg') return <div className="magic-bg flex h-full items-center justify-center p-4"><div className="panel max-w-lg p-6 text-lg">⚙️ Falta configurar o Supabase (arquivo config.json). Veja o LEIA-ME.</div></div>;
  if (ready === 'login') return <Login onDone={() => void boot()} />;
  if (ready === 'notTeacher') {
    return (
      <div className="magic-bg flex h-full items-center justify-center p-4">
        <div className="panel max-w-xl p-6">
          <h2 className="text-2xl font-bold">🔒 Conta sem permissão de professor</h2>
          <p className="mt-2 text-lg">Este usuário entrou, mas não está cadastrado como professor. No Supabase, rode no SQL Editor:</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-night p-3 text-sm text-white">{`insert into public.teachers (user_id, name)\nselect id, 'Seu nome' from auth.users\nwhere email = 'seu-email@escola.com';`}</pre>
          <Btn className="mt-4" onClick={async () => { await T.signOut(); setReady('login'); }}>Sair</Btn>
        </div>
      </div>
    );
  }

  const turmaRows = (t: Turma) => rows.filter((r) => r.turma === t && (!q || `${r.student1} ${r.student2} ${codes[r.id] ?? ''}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="flex h-full flex-col bg-[#f4f1fb]" data-testid="teacher">
      <header className="no-print flex flex-wrap items-center gap-2 border-b-4 border-ink bg-grape px-3 py-2">
        <h1 className="title-game text-2xl" style={{ color: '#ffc93c' }}>MONSTRINHOS!</h1>
        <span className="font-bold text-white">Painel do professor</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Btn className="!min-h-[44px]" onClick={() => void refresh()}>🔄 Atualizar</Btn>
          <Btn className="!min-h-[44px]" onClick={exportCsv} data-testid="t-export">📄 Exportar relatório</Btn>
          <Btn className="!min-h-[44px]" onClick={async () => { await T.signOut(); setReady('login'); }}>Sair</Btn>
        </div>
      </header>
      <nav className="no-print flex flex-wrap gap-2 border-b-2 border-ink/20 bg-white px-3 py-2" role="tablist">
        {[{ id: 'geral', label: '📊 Visão geral' }, ...TURMAS.map((t) => ({ id: t.id, label: `🏫 ${t.label.replace(' ano ', ' ')} (${rows.filter((r) => r.turma === t.id).length})` })), { id: 'anteriores', label: `🗄️ Projetos anteriores (${archive.length})` }].map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id as typeof tab)} data-testid={`t-tab-${t.id}`}
            className={`rounded-xl border-[3px] px-3 py-2 font-bold ${tab === t.id ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`}>{t.label}</button>
        ))}
      </nav>
      <main className="no-print scroll-y min-h-0 flex-1 p-3 sm:p-4">
        {tab === 'geral' && (
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="panel p-4"><div className="text-sm font-bold uppercase text-ink/60">Duplas cadastradas</div><div className="text-4xl font-bold" data-testid="t-count">{rows.length}</div></div>
              <div className="panel p-4"><div className="text-sm font-bold uppercase text-ink/60">Projetos iniciados</div><div className="text-4xl font-bold">{stats.started}</div></div>
              <div className="panel p-4"><div className="text-sm font-bold uppercase text-ink/60">Projetos concluídos</div><div className="text-4xl font-bold">{stats.done}</div></div>
              <div className="panel p-4"><div className="text-sm font-bold uppercase text-ink/60">Progresso médio</div><div className="text-4xl font-bold">{stats.avg}%</div></div>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {TURMAS.map((t) => {
                const rs = rows.filter((r) => r.turma === t.id);
                const avg = rs.length ? Math.round(rs.reduce((a, r) => a + r.progress, 0) / rs.length) : 0;
                return (
                  <div key={t.id} className="panel p-4">
                    <div className="text-xl font-bold">{t.label}</div>
                    <div>{rs.length} duplas · progresso médio {avg}%</div>
                    <div className="mt-2 flex gap-1">{STAGES.map((s) => <div key={s.id} title={s.name} className="h-6 flex-1 rounded" style={{ background: s.color, opacity: rs.length ? 0.25 + 0.75 * (rs.filter((r) => r.current_stage > s.id || r.progress >= 100).length / rs.length) : 0.2 }} />)}</div>
                    <Btn className="mt-3 !min-h-[44px]" onClick={() => setTab(t.id)}>Abrir turma</Btn>
                  </div>
                );
              })}
            </div>
            <div className="panel p-4">
              <h2 className="mb-2 text-xl font-bold">🕘 Últimos acessos</h2>
              {stats.recent.length === 0 ? <p>Nenhuma dupla ainda.</p> : (
                <table className="w-full text-left">
                  <tbody>
                    {stats.recent.map((r) => (
                      <tr key={r.id} className="border-t border-ink/10">
                        <td className="py-1.5 font-bold">{r.student1} e {r.student2}</td>
                        <td>{turmaLabel(r.turma)}</td>
                        <td>{fmt(r.last_access_at)}</td>
                        <td><Bar pct={r.progress} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {(tab === '3A' || tab === '3B' || tab === '3C') && (
          <div className="mx-auto max-w-7xl space-y-3">
            <div className="panel flex flex-wrap items-center gap-2 p-3">
              <h2 className="mr-auto text-2xl font-bold">{turmaLabel(tab)}</h2>
              <input className="h-11 rounded-xl border-[3px] border-ink px-3 font-semibold" placeholder="🔍 Buscar nome ou código" value={q} onChange={(e) => setQ(e.target.value)} />
              <Btn className="!min-h-[44px]" variant={settings[tab] ? 'lime' : 'white'} onClick={async () => { try { await T.setRecordings(tab, !settings[tab]); await refresh(); toast(!settings[tab] ? 'Gravação de voz LIBERADA para a turma.' : 'Gravação de voz BLOQUEADA para a turma.', '🎙️', 'ok'); } catch (e) { toast(String(e), '⚠️', 'warn'); } }} data-testid="t-rec-toggle">
                🎙️ Gravação de voz: {settings[tab] ? 'permitida' : 'bloqueada'}
              </Btn>
              <Btn className="!min-h-[44px]" onClick={() => { setPrintTurma(tab); setTimeout(() => window.print(), 300); }}>🖨️ Cartões de código</Btn>
              <Btn className="!min-h-[44px]" variant="bubble" onClick={() => setDanger({ kind: 'resetClass', turma: tab, label: `Reiniciar TODOS os projetos do ${turmaLabel(tab)}` })} data-testid="t-reset-class">♻️ Reiniciar turma</Btn>
            </div>
            <div className="panel overflow-x-auto p-0">
              <table className="w-full min-w-[900px] text-left" data-testid="t-table">
                <thead className="bg-cream text-sm uppercase">
                  <tr>
                    <th className="p-2">Dupla</th><th>Código</th><th>Criado em</th><th>Último acesso</th><th>Etapa atual</th><th>Progresso</th><th className="text-right pr-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {turmaRows(tab).map((r) => (
                    <tr key={r.id} className="border-t-2 border-ink/10" data-testid="t-row">
                      <td className="p-2 font-bold">{r.student1} e {r.student2}</td>
                      <td className="font-mono font-bold tracking-wider text-grape-dark">{codes[r.id] ?? '—'}</td>
                      <td>{fmtDay(r.created_at)}</td>
                      <td>{fmt(r.last_access_at)}</td>
                      <td className="text-sm">{r.progress >= 100 ? '🏆 Concluído' : `${r.current_stage}. ${STAGES[r.current_stage - 1]?.short}`}<div className="text-xs text-ink/60">missão {Math.min(30, r.current_mission)}: {MISSIONS[Math.min(29, r.current_mission - 1)]?.title}</div></td>
                      <td><Bar pct={r.progress} /></td>
                      <td className="p-2">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Btn className="!min-h-[40px] !px-3 !text-base" variant="aqua" onClick={() => setView(r.id)} data-testid="t-view">👁️ Ver</Btn>
                          <Btn className="!min-h-[40px] !px-3 !text-base" onClick={() => setDanger({ kind: 'reset', id: r.id, label: `Reiniciar o progresso de ${r.student1} e ${r.student2}` })} data-testid="t-reset">♻️ Reiniciar</Btn>
                          <Btn className="!min-h-[40px] !px-3 !text-base" onClick={() => setDanger({ kind: 'clear', id: r.id, label: `Excluir o projeto (criações) de ${r.student1} e ${r.student2}` })}>🧹 Excluir projeto</Btn>
                          <Btn className="!min-h-[40px] !px-3 !text-base" variant="bubble" onClick={() => setDanger({ kind: 'delete', id: r.id, label: `Excluir a dupla ${r.student1} e ${r.student2}` })} data-testid="t-delete">🗑️ Excluir dupla</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {turmaRows(tab).length === 0 && <tr><td colSpan={7} className="p-4 text-center font-semibold">Nenhuma dupla nesta turma ainda.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'anteriores' && (
          <div className="mx-auto max-w-5xl space-y-2">
            <p className="font-semibold">Quando um projeto é reiniciado, uma cópia fica guardada aqui até você excluir.</p>
            {archive.length === 0 && <div className="panel p-4">Nenhum projeto anterior.</div>}
            {archive.map((a) => (
              <div key={a.id} className="panel flex flex-wrap items-center gap-3 p-3">
                <div className="h-16 w-16"><MonsterSvg m={normalizeGame(a.data).monster} still size="100%" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{a.student1} e {a.student2} · {turmaLabel(a.turma)}</div>
                  <div className="text-sm">Guardado em {fmt(a.archived_at)} · progresso {a.progress}% · motivo: {a.reason}</div>
                </div>
                <Btn variant="aqua" onClick={() => setArchiveView(a)}>👁️ Ver</Btn>
                <Btn variant="bubble" onClick={() => setDanger({ kind: 'delArchive', archiveId: a.id, label: `Excluir a cópia de ${a.student1} e ${a.student2}` })}>🗑️</Btn>
              </div>
            ))}
          </div>
        )}
      </main>
      {printTurma && (
        <div className="print-area hidden print:block">
          <h1 className="mb-2 text-xl font-bold">Monstrinhos! — Códigos do {turmaLabel(printTurma)}</h1>
          <div className="grid grid-cols-2 gap-3">
            {rows.filter((r) => r.turma === printTurma).map((r) => (
              <div key={r.id} className="rounded-xl border-2 border-dashed border-black p-3">
                <div className="text-lg font-bold">{r.student1} e {r.student2}</div>
                <div className="font-mono text-3xl font-bold tracking-widest">{codes[r.id]}</div>
                <div className="text-sm">Use este código em “Já tenho meu projeto”.</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {view && <ProjectViewer id={view} onClose={() => setView(null)} onChanged={() => void refresh()} />}
      {archiveView && (
        <Modal open onClose={() => setArchiveView(null)} title={`Projeto anterior: ${archiveView.student1} e ${archiveView.student2}`} wide>
          <ExhibitionContent g={normalizeGame(archiveView.data)} names={`${archiveView.student1} e ${archiveView.student2}`} onPlay={() => toast('Abra pelo projeto atual para assistir.', 'ℹ️')} />
        </Modal>
      )}
      <Modal open={!!danger} onClose={() => { setDanger(null); setTyped(''); }} title="⚠️ Confirmar">
        {danger && (
          <div>
            <p className="text-lg font-bold">{danger.label}?</p>
            <p className="mt-2">
              {danger.kind === 'reset' && 'O progresso volta ao início. Uma cópia fica em "Projetos anteriores". A dupla continua com o mesmo código.'}
              {danger.kind === 'clear' && 'As criações e gravações serão apagadas SEM cópia. A dupla e o código continuam.'}
              {danger.kind === 'delete' && 'A dupla, o código, as criações e as gravações serão apagados para sempre.'}
              {danger.kind === 'resetClass' && 'Todos os projetos DESTA turma voltam ao início (com cópia em "Projetos anteriores"). As outras turmas não mudam.'}
              {danger.kind === 'delArchive' && 'Esta cópia será apagada para sempre.'}
            </p>
            {(danger.kind === 'resetClass' || danger.kind === 'delete') && (
              <label className="mt-3 block font-bold">Para confirmar, digite <code className="rounded bg-cream px-1">{danger.kind === 'resetClass' ? danger.turma : 'EXCLUIR'}</code>:
                <input className="field mt-1" value={typed} onChange={(e) => setTyped(e.target.value)} data-testid="t-confirm-text" />
              </label>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Btn onClick={() => { setDanger(null); setTyped(''); }}>Cancelar</Btn>
              <Btn variant="bubble" disabled={(danger.kind === 'resetClass' && typed.trim().toUpperCase() !== danger.turma) || (danger.kind === 'delete' && typed.trim().toUpperCase() !== 'EXCLUIR')} onClick={() => void runDanger()} data-testid="t-confirm">Confirmar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
