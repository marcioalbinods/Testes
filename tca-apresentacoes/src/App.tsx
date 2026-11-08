import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, FolderOpen, Info, RotateCcw, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { STEPS } from './data/constants';
import { exampleForm } from './data/example';
import { useProject, type ProjectState } from './state/useProject';
import { validateStep, type Errors } from './state/validation';
import { Step1 } from './steps/Step1';
import { Step2 } from './steps/Step2';
import { Step3 } from './steps/Step3';
import { Step4 } from './steps/Step4';
import { Step5 } from './steps/Step5';
import { Step6 } from './steps/Step6';
import { FinalScreen, type DownloadKind } from './screens/FinalScreen';
import { SlideEditor } from './screens/SlideEditor';
import { GuideView } from './screens/GuideView';
import { Modal } from './components/ui';
import { buildDeck, workTitle } from './engine/buildDeck';
import { buildGuide } from './engine/guide';
import { saveFile, slug } from './lib/save';
import { loadDriveStatus, sendToTeacher, type DriveStatus } from './lib/teacherDrive';

export default function App() {
  const { state, update, set, reset, replace, storageOk } = useProject();
  const { form, step, screen, deck } = state;
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'bad' } | null>(null);
  const [modal, setModal] = useState<'new' | 'backup' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [drive, setDrive] = useState<DriveStatus | null>(null);

  useEffect(() => {
    loadDriveStatus().then(setDrive);
  }, []);

  const say = useCallback((text: string, tone: 'ok' | 'bad' = 'ok') => {
    setToast({ text, tone });
    window.setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 4500);
  }, []);

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    setErrors({});
  }, [step]);

  const goStep = (n: number) => {
    set({ step: n, screen: 'form' });
    scrollTop();
  };

  const next = () => {
    const e = validateStep(step, form);
    setErrors(e);
    if (Object.keys(e).length) {
      say('Faltam algumas respostas obrigatórias. Elas estão marcadas em vermelho.', 'bad');
      const first = Object.keys(e)[0];
      setTimeout(() => {
        const el = document.querySelector(`[data-field="${first}"]`) ?? document.getElementById(first);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    goStep(Math.min(6, step + 1));
  };

  const generate = async () => {
    setBusy('generate');
    try {
      await document.fonts?.ready;
      const d = buildDeck(form, state.themeChoice || undefined);
      set({ deck: d, screen: 'final', deckEdited: false });
      scrollTop();
    } finally {
      setBusy(null);
    }
  };

  const title = workTitle(form);

  const download = async (kind: DownloadKind) => {
    if (busy) return;
    setBusy(kind);
    try {
      let blob: Blob;
      let name: string;
      if (kind === 'pptx' && deck) {
        const { exportPptx } = await import('./render/exportPptx');
        blob = await exportPptx(deck, form);
        name = `TCA-${slug(title)}.pptx`;
      } else if (kind === 'pdf' && deck) {
        const { exportSlidesPdf } = await import('./render/exportPdf');
        blob = await exportSlidesPdf(deck, form);
        name = `TCA-${slug(title)}-slides.pdf`;
      } else if (kind === 'guide' && deck) {
        const { exportGuidePdf } = await import('./render/exportPdf');
        blob = exportGuidePdf(buildGuide(form, deck), form, title);
        name = `TCA-${slug(title)}-guia-de-apresentacao.pdf`;
      } else if (kind === 'summary') {
        const { exportSummaryPdf } = await import('./render/exportPdf');
        blob = exportSummaryPdf(form, title);
        name = `TCA-${slug(title)}-resumo-da-pesquisa.pdf`;
      } else {
        blob = new Blob([JSON.stringify({ app: 'tca-da-pesquisa-a-intervencao', version: 1, state }, null, 2)], { type: 'application/json' });
        name = `TCA-${slug(title)}-copia-do-trabalho.json`;
      }
      const res = await saveFile(name, blob);
      say(res === 'saved' ? 'Arquivo pronto! Confira a pasta de downloads.' : 'Download cancelado.');
    } catch (e) {
      console.error(e);
      say(e instanceof Error && e.message ? e.message : 'Não foi possível gerar o arquivo. Tente de novo.', 'bad');
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    if (busy || !deck || drive?.kind !== 'on') return;
    setBusy('send');
    try {
      const backup = { app: 'tca-da-pesquisa-a-intervencao', version: 1, state };
      await sendToTeacher(drive.url, form, deck, backup);
      set({ sentAt: new Date().toISOString() });
      say('Trabalho enviado ao professor!');
    } catch (e) {
      console.error(e);
      say(e instanceof Error && e.message && !/fetch/i.test(e.message) ? e.message : 'Não foi possível enviar. Confiram a internet e tentem de novo.', 'bad');
    } finally {
      setBusy(null);
    }
  };

  const openBackup = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (data?.app !== 'tca-da-pesquisa-a-intervencao' || !data.state?.form) throw new Error();
      replace(data.state as ProjectState);
      setModal(null);
      say('Trabalho aberto com sucesso!');
    } catch {
      say('Esse arquivo não é uma cópia do TCA. Escolha o arquivo .json baixado por este site.', 'bad');
    }
  };

  const stepProps = { form, update, errors };

  return (
    <div className="min-h-screen">
      <div ref={topRef} />
      <header className="no-print sticky z-30 border-b border-line bg-bg/90 backdrop-blur" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="gutter mx-auto flex max-w-[1100px] items-center justify-between gap-3 py-3">
          <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => (deck && screen !== 'form' ? set({ screen: 'final' }) : goStep(1))} aria-label="TCA: Da Pesquisa à Intervenção, início">
            <Logo />
            <span className="min-w-0">
              <span className="block font-display text-[19px] font-extrabold leading-none">TCA</span>
              <span className="block truncate text-[13px] font-bold text-muted">Da Pesquisa à Intervenção</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost min-h-[44px] px-3 text-[15px]" onClick={() => setModal('backup')} aria-label="Salvar ou abrir uma cópia do trabalho">
              <Save size={18} aria-hidden /> <span className="hidden sm:inline">Cópia do trabalho</span>
            </button>
            <button type="button" className="btn btn-ghost min-h-[44px] px-3 text-[15px]" onClick={() => setModal('new')} aria-label="Começar um novo trabalho">
              <RotateCcw size={18} aria-hidden /> <span className="hidden sm:inline">Novo trabalho</span>
            </button>
          </div>
        </div>
        {screen === 'form' && <Stepper step={step} onGo={goStep} doneUntil={doneUntil(form)} />}
      </header>

      <main className="gutter mx-auto max-w-[1100px] pb-32 pt-6">
        <div className={screen === 'form' ? 'mx-auto max-w-[880px]' : ''}>
          {state.isExample && (
            <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border-2 border-sun/60 bg-sun/15 p-4">
              <p className="flex items-center gap-2 font-bold">
                <Info size={20} aria-hidden /> Vocês estão vendo um trabalho de exemplo (fictício).
              </p>
              <button type="button" className="btn btn-primary" onClick={() => { reset(); scrollTop(); }}>
                Começar o nosso trabalho
              </button>
            </div>
          )}
          {!storageOk && <p className="mb-4 rounded-2xl bg-coral/10 p-3 font-bold text-coral">Este navegador não está salvando o preenchimento. Não fechem a página antes de baixar seus arquivos.</p>}

          {screen === 'form' && (
            <>
              {step === 1 && !form.theme && !form.members.some((m) => m.name.trim()) && !state.isExample && (
                <button type="button" className="no-print mb-5 inline-flex items-center gap-2 text-[15px] font-bold text-brand underline-offset-4 hover:underline" onClick={() => replace({ ...state, form: exampleForm(), isExample: true, deck: null, step: 1 })}>
                  <Sparkles size={18} aria-hidden /> Quer ver um exemplo preenchido antes de começar?
                </button>
              )}
              <div key={step}>
                {step === 1 && <Step1 {...stepProps} />}
                {step === 2 && <Step2 {...stepProps} />}
                {step === 3 && <Step3 {...stepProps} />}
                {step === 4 && <Step4 {...stepProps} />}
                {step === 5 && <Step5 {...stepProps} />}
                {step === 6 && (
                  <Step6
                    form={form}
                    themeChoice={state.themeChoice}
                    onTheme={(id) => set({ themeChoice: id })}
                    onEdit={goStep}
                    onGenerate={generate}
                    onSummaryPdf={() => download('summary')}
                    deckEdited={state.deckEdited}
                    busy={busy === 'generate'}
                  />
                )}
              </div>
            </>
          )}
          {screen === 'final' && deck && <FinalScreen deck={deck} form={form} busy={busy} onDownload={download} onEditResearch={() => goStep(6)} onEditSlides={() => { set({ screen: 'editor' }); scrollTop(); }} onGuide={() => { set({ screen: 'guide' }); scrollTop(); }} drive={drive} sentAt={state.sentAt} onSend={send} />}
          {screen === 'editor' && deck && <SlideEditor deck={deck} form={form} onChange={(d) => set({ deck: d, deckEdited: true })} onBack={() => { set({ screen: 'final' }); scrollTop(); }} />}
          {screen === 'guide' && deck && <GuideView deck={deck} form={form} busy={busy === 'guide'} onDownload={() => download('guide')} onBack={() => { set({ screen: 'final' }); scrollTop(); }} />}
          {screen !== 'form' && !deck && (
            <button type="button" className="btn btn-primary" onClick={() => goStep(6)}>
              Ir para a revisão
            </button>
          )}
        </div>
      </main>

      {screen === 'form' && (
        <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="Navegação entre etapas">
          <div className="gutter mx-auto flex max-w-[880px] items-center justify-between gap-3 py-3">
            <button type="button" className="btn btn-ghost" onClick={() => goStep(Math.max(1, step - 1))} disabled={step === 1}>
              <ChevronLeft size={20} aria-hidden /> Voltar
            </button>
            <span className="text-[14px] font-bold text-muted">
              {step} de 6
            </span>
            {step < 6 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Avançar <ChevronRight size={20} aria-hidden />
              </button>
            ) : deck ? (
              <button type="button" className="btn btn-soft" onClick={() => set({ screen: 'final' })}>
                Ver apresentação <ChevronRight size={20} aria-hidden />
              </button>
            ) : (
              <span className="w-[120px]" />
            )}
          </div>
        </nav>
      )}

      <footer className="no-print gutter mx-auto mb-24 flex max-w-[1100px] items-start gap-2 text-[13px] text-muted">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden />
        <p>Sem cadastro e sem coleta automática: o preenchimento fica guardado neste navegador. O trabalho só sai daqui quando o grupo toca em “Enviar ao professor”, e vai apenas para o Google Drive do professor. Baixem seus arquivos antes de limpar os dados do navegador ou trocar de dispositivo.</p>
      </footer>

      {toast && (
        <div className="no-print pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4" style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
          <div role="status" className={`enter w-full max-w-[520px] rounded-2xl px-5 py-3 text-center font-bold shadow-xl ${toast.tone === 'ok' ? 'bg-ink text-bg' : 'bg-danger text-white'}`}>
            {toast.text}
          </div>
        </div>
      )}

      {modal === 'new' && (
        <Modal title="Começar um novo trabalho?" onClose={() => setModal(null)}>
          <p>Isso apaga deste aparelho o trabalho atual, os slides e o guia. Se ainda precisam dele, baixem antes uma cópia do trabalho ou os arquivos.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => download('backup')}>
              <Save size={18} aria-hidden /> Baixar cópia antes
            </button>
            <button type="button" className="btn btn-danger" onClick={() => { reset(); setModal(null); scrollTop(); say('Novo trabalho iniciado.'); }}>
              <RotateCcw size={18} aria-hidden /> Apagar e começar de novo
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
      {modal === 'backup' && (
        <Modal title="Cópia do trabalho" onClose={() => setModal(null)}>
          <p>Vão usar outro computador ou celular? Baixem uma cópia do trabalho (.json) e abram no outro aparelho para continuar de onde pararam.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => download('backup')}>
              <Save size={18} aria-hidden /> Baixar cópia
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              <FolderOpen size={18} aria-hidden /> Abrir uma cópia
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => e.target.files?.[0] && openBackup(e.target.files[0])} />
          </div>
          <p className="text-[14px] text-muted">Abrir uma cópia substitui o trabalho que está neste aparelho.</p>
        </Modal>
      )}
    </div>
  );
}

function doneUntil(form: Parameters<typeof validateStep>[1]) {
  let n = 0;
  for (let s = 1; s <= 5; s++) {
    if (Object.keys(validateStep(s, form)).length) break;
    n = s;
  }
  return n;
}

function Stepper({ step, onGo, doneUntil }: { step: number; onGo: (n: number) => void; doneUntil: number }) {
  const pct = ((step - 1) / 5) * 100;
  return (
    <div className="gutter mx-auto max-w-[1100px] pb-3">
      <div className="h-1.5 overflow-hidden rounded-full bg-sunk" role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={step} aria-label="Progresso">
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-violet transition-all duration-500" style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
      <ol className="mt-2 grid grid-cols-6 gap-1">
        {STEPS.map((s) => {
          const done = s.n <= doneUntil && s.n !== step;
          const cur = s.n === step;
          return (
            <li key={s.n}>
              <button type="button" onClick={() => onGo(s.n)} aria-current={cur ? 'step' : undefined} className={`flex w-full flex-col items-center gap-1 rounded-xl py-1 text-[12px] font-bold sm:flex-row sm:justify-center sm:gap-2 sm:text-[14px] ${cur ? 'text-brand' : 'text-muted hover:text-ink'}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${cur ? 'bg-brand text-brand-ink' : done ? 'bg-mint text-white' : 'bg-sunk'}`}>{done ? <Check size={15} aria-hidden /> : s.n}</span>
                <span className="hidden truncate min-[420px]:block">{s.short}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Logo() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden>
      <rect width="42" height="42" rx="13" fill="rgb(var(--brand))" />
      <circle cx="31" cy="11" r="7" fill="rgb(var(--violet))" />
      <path d="M11 14h14M18 14v16" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 26l4 4 7-8" stroke="rgb(var(--sun))" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
