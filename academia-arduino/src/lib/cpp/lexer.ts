/**
 * Analisador léxico de um subconjunto da linguagem do Arduino (C/C++).
 * Usado pelo editor (destaque de sintaxe), pelo verificador de erros e pelo interpretador.
 */

export type TokType = 'num' | 'str' | 'char' | 'id' | 'kw' | 'op' | 'punc' | 'comment' | 'pre' | 'ws' | 'nl' | 'bad' | 'eof';

export interface Token {
  t: TokType;
  v: string;
  line: number;
  col: number;
  /** posição no texto */
  pos: number;
}

export const KEYWORDS = new Set([
  'void', 'int', 'long', 'unsigned', 'float', 'double', 'bool', 'boolean', 'byte', 'char', 'const', 'String',
  'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'true', 'false', 'static', 'word', 'short',
]);

export const TYPE_WORDS = new Set(['void', 'int', 'long', 'unsigned', 'float', 'double', 'bool', 'boolean', 'byte', 'char', 'const', 'String', 'static', 'word', 'short']);

const OPS = [
  '<<=', '>>=', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '<<', '>>', '->',
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':',
];
const PUNC = new Set(['(', ')', '{', '}', '[', ']', ';', ',', '.']);

export function lex(src: string, keepTrivia = false): Token[] {
  const out: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const push = (t: TokType, v: string, start: number, l: number, c: number) => {
    if (!keepTrivia && (t === 'ws' || t === 'comment' || t === 'nl')) return;
    out.push({ t, v, line: l, col: c, pos: start });
  };
  const adv = (s: string) => {
    for (const ch of s) {
      if (ch === '\n') { line++; col = 1; } else col++;
    }
  };
  while (i < src.length) {
    const start = i;
    const l = line;
    const c = col;
    const ch = src[i];
    let m: RegExpExecArray | null;
    const rest = () => src.slice(i);
    if (ch === '\n') { i++; adv('\n'); push('nl', '\n', start, l, c); continue; }
    if (/[ \t\r]/.test(ch)) {
      m = /^[ \t\r]+/.exec(rest())!;
      i += m[0].length; adv(m[0]); push('ws', m[0], start, l, c); continue;
    }
    if (src.startsWith('//', i)) {
      const e = src.indexOf('\n', i);
      const s = e < 0 ? src.slice(i) : src.slice(i, e);
      i += s.length; adv(s); push('comment', s, start, l, c); continue;
    }
    if (src.startsWith('/*', i)) {
      const e = src.indexOf('*/', i + 2);
      const s = e < 0 ? src.slice(i) : src.slice(i, e + 2);
      i += s.length; adv(s); push(e < 0 ? 'bad' : 'comment', s, start, l, c); continue;
    }
    if (ch === '#') {
      const e = src.indexOf('\n', i);
      const s = e < 0 ? src.slice(i) : src.slice(i, e);
      i += s.length; adv(s); push('pre', s, start, l, c); continue;
    }
    if ((m = /^(0[xX][0-9a-fA-F]+|0[bB][01]+|\d+\.\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|\d+(?:[eE][+-]?\d+)?)[uUlLfF]*/.exec(rest()))) {
      i += m[0].length; adv(m[0]); push('num', m[0], start, l, c); continue;
    }
    if (ch === '"') {
      m = /^"(?:[^"\\\n]|\\.)*"?/.exec(rest())!;
      i += m[0].length; adv(m[0]);
      push(m[0].length > 1 && m[0].endsWith('"') ? 'str' : 'bad', m[0], start, l, c); continue;
    }
    if (ch === "'") {
      m = /^'(?:[^'\\\n]|\\.)*'?/.exec(rest())!;
      i += m[0].length; adv(m[0]); push(m[0].length > 2 && m[0].endsWith("'") ? 'char' : 'bad', m[0], start, l, c); continue;
    }
    if ((m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest()))) {
      i += m[0].length; adv(m[0]); push(KEYWORDS.has(m[0]) ? 'kw' : 'id', m[0], start, l, c); continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) { i += op.length; adv(op); push('op', op, start, l, c); continue; }
    if (PUNC.has(ch)) { i++; adv(ch); push('punc', ch, start, l, c); continue; }
    // caractere desconhecido (ex.: aspas “curvas” copiadas de um texto)
    i++; adv(ch); push('bad', ch, start, l, c);
  }
  out.push({ t: 'eof', v: '', line, col, pos: src.length });
  return out;
}
