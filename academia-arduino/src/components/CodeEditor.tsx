/**
 * Ferramenta C — Editor de código: destaque de sintaxe, numeração de linhas, identificação de erros
 * básicos, copiar, limpar, exemplos prontos e explicação dos comandos usados.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Copy, FlaskConical, Trash2, XCircle } from 'lucide-react';
import { checkCode } from '../lib/cpp/check';
import { highlightLines } from '../lib/cpp/highlight';
import { BUILTIN_FNS, CONSTANTS, SERIAL_DOC, SERVO_DOC } from '../lib/cpp/builtins';
import { lex } from '../lib/cpp/lexer';
import { useLocalState } from '../lib/progress';
import { MISSIONS } from '../data/missions';
import { navigate } from '../lib/router';
import { Modal } from './ui';

const STARTER = `// Escreva seu programa aqui!
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}`;

const KW_DOC: Record<string, string> = {
  if: 'if (se): executa o bloco somente se a condição for verdadeira.',
  else: 'else (senão): executa quando a condição do if é falsa.',
  for: 'for: repete um número certo de vezes.',
  while: 'while (enquanto): repete enquanto a condição for verdadeira.',
  int: 'int: variável para números inteiros (−32768 a 32767).',
  long: 'long: variável para números inteiros grandes.',
  float: 'float: variável para números com vírgula (ex.: 3.14).',
  bool: 'bool: variável que guarda true (verdadeiro) ou false (falso).',
  const: 'const: o valor não pode mudar (constante).',
  void: 'void: a função não devolve nenhum valor.',
};

export function CodeEditor() {
  const [code, setCode] = useLocalState<string>('editor:codigo', STARTER);
  const [debounced, setDebounced] = useState(code);
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(code), 350);
    return () => window.clearTimeout(t);
  }, [code]);
  const result = useMemo(() => checkCode(debounced), [debounced]);
  const lines = highlightLines(code);
  const errLines = new Set(result.errors.map((e) => e.line));
  const warnLines = new Set(result.warnings.map((e) => e.line));
  const longest = Math.max(20, ...code.split('\n').map((l) => l.length));

  const used = useMemo(() => {
    const seen = new Map<string, string>();
    const toks = lex(debounced);
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t.t === 'id' && BUILTIN_FNS[t.v]) seen.set(`${t.v}()`, BUILTIN_FNS[t.v].doc);
      else if (t.t === 'id' && CONSTANTS[t.v]) seen.set(t.v, CONSTANTS[t.v].doc);
      else if (t.t === 'kw' && KW_DOC[t.v]) seen.set(t.v, KW_DOC[t.v]);
      else if (t.t === 'id' && t.v === 'Serial' && toks[i + 2]?.t === 'id' && SERIAL_DOC[toks[i + 2].v]) seen.set(`Serial.${toks[i + 2].v}()`, SERIAL_DOC[toks[i + 2].v]);
      else if (t.t === 'punc' && t.v === '.' && toks[i + 1]?.t === 'id' && SERVO_DOC[toks[i + 1].v] && toks[i - 1]?.v !== 'Serial') seen.set(`servo.${toks[i + 1].v}()`, SERVO_DOC[toks[i + 1].v]);
    }
    if (/\bsetup\s*\(/.test(debounced)) seen.set('setup()', 'Roda uma vez quando a placa liga.');
    if (/\bloop\s*\(/.test(debounced)) seen.set('loop()', 'Repete para sempre.');
    return [...seen.entries()];
  }, [debounced]);

  const goLine = (line: number) => {
    const ta = taRef.current;
    if (!ta) return;
    const idx = code.split('\n').slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
    ta.focus();
    ta.setSelectionRange(idx, idx + (code.split('\n')[line - 1]?.length ?? 0));
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: en } = ta;
      const next = code.slice(0, s) + '  ' + code.slice(en);
      setCode(next);
      requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); } catch { taRef.current?.select(); document.execCommand('copy'); }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const examples = MISSIONS.filter((m) => m.code);
  const ok = result.errors.length === 0;

  return (
    <div className="stack">
      <div className="row">
        <select defaultValue="" onChange={(e) => { const m = examples.find((x) => x.id === e.target.value); if (m) setCode(m.code!); e.target.value = ''; }} aria-label="Exemplos prontos">
          <option value="">📚 Exemplos prontos…</option>
          {examples.map((m) => <option key={m.id} value={m.id}>Missão {String(m.n).padStart(2, '0')} — {m.title}</option>)}
        </select>
        <button className="btn small" onClick={copy}><Copy size={16} /> {copied ? 'Copiado!' : 'Copiar'}</button>
        <button className="btn small danger" onClick={() => setConfirmClear(true)}><Trash2 size={16} /> Limpar</button>
        <button className="btn small success" onClick={() => navigate('/circuitos/simulador')} disabled={!ok}><FlaskConical size={16} /> Testar no simulador</button>
        <span className={`chip ${ok ? (result.warnings.length ? 'yellow' : 'green') : 'red'}`}>
          {ok ? (result.warnings.length ? <><AlertTriangle size={14} /> {result.warnings.length} aviso(s)</> : <><CheckCircle2 size={14} /> Sem erros encontrados</>) : <><XCircle size={14} /> {result.errors.length} erro(s)</>}
        </span>
      </div>
      <div className="split editor-split">
        <div className="editor" aria-label="Editor de código">
          <div className="gutter" aria-hidden>
            {lines.map((_, i) => (
              <div key={i} className={errLines.has(i + 1) ? 'err' : warnLines.has(i + 1) ? 'warn' : ''}>{i + 1}</div>
            ))}
          </div>
          <div className="area">
            <div style={{ position: 'relative', minWidth: 'max-content' }}>
              <pre aria-hidden>
                {lines.map((ln, i) => (
                  <div key={i} style={{ height: '1.6em' }}>
                    {ln.map((s, j) => <span key={j} className={s.cls}>{s.text}</span>)}
                  </div>
                ))}
              </pre>
              <textarea
                ref={taRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={onKey}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                rows={lines.length + 1}
                cols={longest + 4}
                aria-label="Código Arduino"
                style={{ minHeight: `${(lines.length + 1) * 1.6 + 1.6}em` }}
              />
            </div>
          </div>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          <div className="card" style={{ padding: 14 }}>
            <h4>Verificação do código</h4>
            {ok && !result.warnings.length && <p className="small" style={{ color: 'var(--green-700)', margin: 0 }}>Nenhum erro básico encontrado. Lembre: o Arduino IDE faz a verificação completa.</p>}
            <div className="problems-list">
              {[...result.errors, ...result.warnings].map((e, i) => (
                <button key={i} className={`problem-item ${e.severity}`} onClick={() => goLine(e.line)}>
                  {e.severity === 'error' ? <XCircle size={18} /> : <AlertTriangle size={18} />}
                  <span><strong>Linha {e.line}:</strong> {e.message}{e.hint && <span className="small" style={{ display: 'block', opacity: 0.85 }}>{e.hint}</span>}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <h4><BookOpen size={16} /> Comandos usados no seu código</h4>
            {used.length === 0 && <p className="small muted">Os comandos que você usar aparecem aqui com explicação.</p>}
            <ul className="small" style={{ paddingLeft: 16, margin: 0, display: 'grid', gap: 6 }}>
              {used.map(([k, v]) => <li key={k}><code>{k}</code> — {v}</li>)}
            </ul>
          </div>
        </div>
      </div>
      {confirmClear && (
        <Modal title="Limpar o editor?" onClose={() => setConfirmClear(false)}>
          <p>Seu código será apagado e o editor ficará só com a estrutura básica (setup e loop).</p>
          <div className="row">
            <button className="btn danger" onClick={() => { setCode('void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n'); setConfirmClear(false); }}>Limpar</button>
            <button className="btn ghost" onClick={() => setConfirmClear(false)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
