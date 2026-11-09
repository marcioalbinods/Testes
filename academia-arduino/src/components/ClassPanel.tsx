/** Espaço do professor → Turma Robótica: cadastro dos estudantes e acompanhamento do progresso. */
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, KeyRound, LogOut, Printer, RefreshCw, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { teacher, useServer, type StudentRow } from '../lib/cloud';
import { MISSIONS, LEVELS } from '../data/missions';
import { ACHIEVEMENTS, levelFor } from '../data/achievements';
import { GAMES } from '../data/games';
import { Callout, Modal, ProgressBar } from './ui';

const PROF_KEY = 'academia-arduino:professor';
const GUIDE_URL = 'https://github.com/marcioalbinods/Testes/blob/main/academia-arduino/google-apps-script/LEIA-ME.md';

function readProf() { try { return window.sessionStorage.getItem(PROF_KEY) ?? ''; } catch { return ''; } }
function writeProf(v: string) { try { if (v) window.sessionStorage.setItem(PROF_KEY, v); else window.sessionStorage.removeItem(PROF_KEY); } catch { /* */ } }

type Card = { numero: string; nome: string; senha: string };

export function ClassPanel() {
  const { ready, url } = useServer();
  const [senha, setSenha] = useState(readProf);
  if (!ready) return <div className="empty">Carregando…</div>;
  if (!url) return <NotConfigured />;
  if (!senha) return <TeacherLogin onOk={(s) => { writeProf(s); setSenha(s); }} />;
  return <Roster senha={senha} onLogout={() => { writeProf(''); setSenha(''); }} />;
}

function NotConfigured() {
  return (
    <div className="stack">
      <Callout kind="info" title="A turma ainda não está ligada">
        Para cadastrar os estudantes com número e senha e acompanhar o progresso deles, instale uma vez o servidor da turma no seu Google Drive (cerca de 10 minutos). Os dados ficam numa planilha só sua; os estudantes não precisam de conta do Google.
      </Callout>
      <div className="card">
        <h3>Como ligar</h3>
        <ol style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
          <li>Abra <strong>script.google.com</strong> → Novo projeto e cole o arquivo <code>academia-arduino/google-apps-script/Code.gs</code>.</li>
          <li>No começo do código, troque <code>SENHA_DO_PROFESSOR</code> por uma senha sua.</li>
          <li>Execute a função <strong>configurar</strong> e autorize.</li>
          <li><strong>Implantar → Nova implantação → App da Web</strong>, executar como você, acesso: qualquer pessoa. Copie o endereço que termina em <code>/exec</code>.</li>
          <li>Cole esse endereço no arquivo <code>arduino/config.json</code> do repositório (ou mande para o Claude fazer isso).</li>
        </ol>
        <a className="btn primary" href={GUIDE_URL} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Passo a passo completo</a>
      </div>
    </div>
  );
}

function TeacherLogin({ onOk }: { onOk: (s: string) => void }) {
  const [v, setV] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  return (
    <form
      className="card stack"
      style={{ maxWidth: 460, gap: 12 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErro('');
        try { await teacher.entrar(v); onOk(v); } catch (err) { setErro(err instanceof Error ? err.message : 'Erro'); } finally { setBusy(false); }
      }}
    >
      <h3 style={{ margin: 0 }}><KeyRound size={20} /> Entrar como professor</h3>
      <p className="muted small" style={{ margin: 0 }}>Use a senha que você escreveu no servidor da turma (SENHA_DO_PROFESSOR). Ela fica guardada só até fechar esta aba.</p>
      <label className="field">Senha do professor
        <input type="password" value={v} onChange={(e) => setV(e.target.value)} autoComplete="current-password" autoFocus />
      </label>
      {erro && <div className="feedback no">{erro}</div>}
      <button className="btn primary" type="submit" disabled={busy || !v}>{busy ? 'Conferindo…' : 'Entrar'}</button>
    </form>
  );
}

function Roster({ senha, onLogout }: { senha: string; onLogout: () => void }) {
  const [data, setData] = useState<{ planilha: string; estudantes: StudentRow[]; turma: string } | null>(null);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [add, setAdd] = useState(false);
  const [cards, setCards] = useState<Card[] | null>(null);
  const [detail, setDetail] = useState<StudentRow | null>(null);
  const [confirmDel, setConfirmDel] = useState<StudentRow | null>(null);

  const load = async () => {
    setBusy(true);
    setErro('');
    try { setData(await teacher.listar(senha)); } catch (e) {
      const m = e instanceof Error ? e.message : 'Erro';
      if (/senha do professor/i.test(m)) onLogout();
      setErro(m);
    } finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data?.estudantes ?? []).filter((e) => !s || e.nome.toLowerCase().includes(s) || e.numero.includes(s)).sort((a, b) => Number(a.numero) - Number(b.numero));
  }, [data, q]);
  const n = data?.estudantes.length ?? 0;
  const media = n ? (data!.estudantes.reduce((s, e) => s + e.concluidas, 0) / n) : 0;

  const newPassword = async (st: StudentRow) => {
    setBusy(true);
    try { const r = await teacher.novaSenha(senha, st.numero); setCards([{ numero: r.numero, nome: r.nome, senha: r.senha }]); } catch (e) { setErro(e instanceof Error ? e.message : 'Erro'); } finally { setBusy(false); }
  };
  const remove = async (st: StudentRow) => {
    setBusy(true);
    try { await teacher.remover(senha, st.numero); setConfirmDel(null); await load(); } catch (e) { setErro(e instanceof Error ? e.message : 'Erro'); } finally { setBusy(false); }
  };

  return (
    <div className="stack">
      <div className="row between">
        <div className="row">
          <span className="chip purple"><Users size={14} /> Turma {data?.turma ?? 'Robótica'}</span>
          <span className="chip gray">{n} estudante(s)</span>
          {n > 0 && <span className="chip green">Média: {media.toFixed(1).replace('.', ',')} de 20 missões</span>}
        </div>
        <div className="row">
          <button className="btn small primary" onClick={() => setAdd(true)}><UserPlus size={16} /> Cadastrar estudantes</button>
          <button className="btn small ghost" onClick={load} disabled={busy}><RefreshCw size={16} /> Atualizar</button>
          {data?.planilha && <a className="btn small ghost" href={data.planilha} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Abrir a planilha</a>}
          <button className="btn small ghost" onClick={onLogout}><LogOut size={16} /> Sair</button>
        </div>
      </div>
      {erro && <div className="feedback no">{erro}</div>}
      {busy && !data && <div className="empty">Carregando a turma…</div>}
      {data && n === 0 && (
        <div className="card center">
          <h3>Nenhum estudante cadastrado ainda</h3>
          <p className="muted">Clique em "Cadastrar estudantes" e escreva um primeiro nome por linha.</p>
        </div>
      )}
      {data && n > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <label className="row" style={{ gap: 8, marginBottom: 10, maxWidth: 360 }}>
            <Search size={16} />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou número" style={{ flex: 1 }} aria-label="Buscar estudante" />
          </label>
          <table className="t">
            <thead><tr><th>Nº</th><th>Nome</th><th style={{ minWidth: 170 }}>Missões</th><th>Missão atual</th><th>Nível / XP</th><th>Conquistas</th><th>Último acesso</th><th></th></tr></thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.numero}>
                  <td><strong>{e.numero}</strong></td>
                  <td>{e.nome}</td>
                  <td><div className="small">{e.concluidas}/20</div><ProgressBar value={e.concluidas} max={20} label={`Missões de ${e.nome}`} /></td>
                  <td>{e.atual}</td>
                  <td className="small">{levelFor(e.xp).name}<br />{e.xp} XP</td>
                  <td>{e.conquistas}</td>
                  <td className="small">{e.ultimoAcesso || 'nunca entrou'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn small" onClick={() => setDetail(e)}>Ver</button>{' '}
                    <button className="btn small ghost" onClick={() => newPassword(e)} disabled={busy} title="Gerar uma nova senha"><KeyRound size={14} /></button>{' '}
                    <button className="btn small danger" onClick={() => setConfirmDel(e)} title="Remover"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Callout kind="safety" title="Privacidade">Guarde só o primeiro nome dos estudantes. A planilha fica no seu Drive: não a compartilhe publicamente. As senhas não ficam guardadas em lugar nenhum — se um estudante esquecer, gere uma nova.</Callout>

      {add && <AddStudents senha={senha} onClose={() => setAdd(false)} onCreated={(c) => { setAdd(false); setCards(c); void load(); }} />}
      {cards && <CardsModal cards={cards} onClose={() => setCards(null)} />}
      {detail && <StudentDetail st={detail} onClose={() => setDetail(null)} />}
      {confirmDel && (
        <Modal title={`Remover ${confirmDel.nome}?`} onClose={() => setConfirmDel(null)}>
          <p>O estudante nº {confirmDel.numero} e todo o progresso dele serão apagados da planilha. Não dá para desfazer.</p>
          <div className="row">
            <button className="btn danger" onClick={() => remove(confirmDel)} disabled={busy}>Remover</button>
            <button className="btn ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AddStudents({ senha, onClose, onCreated }: { senha: string; onClose: () => void; onCreated: (c: Card[]) => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const nomes = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <Modal title="Cadastrar estudantes da turma Robótica" onClose={onClose}>
      <div className="stack" style={{ gap: 10 }}>
        <p style={{ margin: 0 }}>Escreva <strong>um nome por linha</strong>. Recomendamos só o primeiro nome (e a inicial do sobrenome se houver nomes repetidos). Cada estudante recebe um número e uma senha.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder={'Ana\nBruno\nCarla M.'} aria-label="Nomes dos estudantes" />
        <span className="small muted">{nomes.length} nome(s)</span>
        {erro && <div className="feedback no">{erro}</div>}
        <div className="row">
          <button className="btn primary" disabled={busy || !nomes.length} onClick={async () => {
            setBusy(true);
            setErro('');
            try { const r = await teacher.cadastrar(senha, nomes); onCreated(r.criados); } catch (e) { setErro(e instanceof Error ? e.message : 'Erro'); setBusy(false); }
          }}>{busy ? 'Cadastrando…' : 'Cadastrar e gerar senhas'}</button>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </Modal>
  );
}

function printCards(cards: Card[]) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const site = window.location.href.split('#')[0];
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Cartões de acesso — Academia de Arduino</title>
<style>body{font-family:system-ui,sans-serif;margin:16px}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.c{border:2px dashed #7c4dff;border-radius:12px;padding:14px;break-inside:avoid}.t{font-weight:800;color:#5524c9}
.b{font-family:monospace;font-size:20px;font-weight:700}.s{font-size:12px;color:#555}</style></head><body>
<div class="g">${cards.map((c) => `<div class="c"><div class="t">🤖 ACADEMIA DE ARDUINO — Turma Robótica</div><p>Estudante: <b>${esc(c.nome)}</b></p>
<p>Número de acesso: <span class="b">${esc(c.numero)}</span><br>Senha: <span class="b">${esc(c.senha)}</span></p>
<div class="s">Entre em ${esc(site)} e clique em "Entrar". Guarde este cartão e não mostre a senha para ninguém.</div></div>`).join('')}</div>
<script>window.onload=function(){window.print()}<\/script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}

function CardsModal({ cards, onClose }: { cards: Card[]; onClose: () => void }) {
  const [blocked, setBlocked] = useState(false);
  return (
    <Modal title={cards.length > 1 ? 'Estudantes cadastrados' : `Nova senha de ${cards[0].nome}`} onClose={onClose} wide>
      <div className="stack" style={{ gap: 12 }}>
        <Callout kind="safety" title="Anote ou imprima agora">As senhas não ficam guardadas. Se você fechar esta janela sem anotar, será preciso gerar uma senha nova.</Callout>
        <div className="print-cards">
          {cards.map((c) => (
            <div key={c.numero} className="access-card">
              <strong>{c.nome}</strong>
              <div className="small muted">Número de acesso</div>
              <div className="big">{c.numero}</div>
              <div className="small muted">Senha</div>
              <div className="big">{c.senha}</div>
            </div>
          ))}
        </div>
        <div className="row">
          <button className="btn primary" onClick={() => setBlocked(!printCards(cards))}><Printer size={16} /> Imprimir cartões</button>
          <button className="btn ghost" onClick={onClose}>Já anotei, fechar</button>
        </div>
        {blocked && <div className="feedback no">O navegador bloqueou a janela de impressão. Permita pop-ups para este site ou anote os dados acima.</div>}
      </div>
    </Modal>
  );
}

function StudentDetail({ st, onClose }: { st: StudentRow; onClose: () => void }) {
  const p = st.progresso ?? {};
  const ms = p.missions ?? {};
  const badges = new Set(p.badges ?? []);
  return (
    <Modal title={`${st.nome} — nº ${st.numero}`} onClose={onClose} wide>
      <div className="stack" style={{ gap: 14 }}>
        <div className="row">
          <span className="chip purple">{levelFor(st.xp).name}</span>
          <span className="chip yellow">{st.xp} XP</span>
          <span className="chip green">{st.concluidas}/20 missões</span>
          <span className="chip gray">Último acesso: {st.ultimoAcesso || '—'}</span>
          <span className="chip gray">Persistência: {p.counters?.retries ?? 0} nova(s) tentativa(s) após erro</span>
        </div>
        {LEVELS.map((L) => (
          <div key={L.n}>
            <h4 style={{ color: L.color, marginBottom: 6 }}>Nível {L.n} — {L.name}</h4>
            <table className="t">
              <thead><tr><th>Missão</th><th>Atividade</th><th>Perguntas</th><th>Desafio</th><th>Concluída</th></tr></thead>
              <tbody>
                {MISSIONS.filter((m) => m.level === L.n).map((m) => {
                  const x = ms[m.id] ?? {};
                  const mk = (v?: boolean) => (v ? '✅' : '—');
                  return <tr key={m.id}><td>{String(m.n).padStart(2, '0')} · {m.title}</td><td>{mk(x.activity)}</td><td>{mk(x.quiz)}</td><td>{mk(x.challenge)}</td><td>{mk(x.done)}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        ))}
        <div className="grid cols-2">
          <div>
            <h4>Conquistas</h4>
            <ul style={{ paddingLeft: 18, margin: 0 }}>{ACHIEVEMENTS.filter((a) => badges.has(a.id)).map((a) => <li key={a.id}>{a.name}</li>)}</ul>
            {!badges.size && <p className="muted small">Nenhuma ainda.</p>}
          </div>
          <div>
            <h4>Jogos (recorde · partidas)</h4>
            <ul style={{ paddingLeft: 18, margin: 0 }}>{GAMES.map((g) => <li key={g.id}>{g.title}: {p.games?.[g.id] ? `${p.games[g.id].best} · ${p.games[g.id].plays}` : '—'}</li>)}</ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}
