/** Destaque de sintaxe: divide o código em linhas e trechos coloridos. */
import { BUILTIN_FNS, CONSTANTS } from './builtins';
import { lex, TYPE_WORDS } from './lexer';

export interface Span {
  cls: string;
  text: string;
}

const OBJECTS = new Set(['Serial', 'Servo']);

export function highlightLines(src: string): Span[][] {
  const toks = lex(src, true);
  const lines: Span[][] = [[]];
  const push = (cls: string, text: string) => {
    const parts = text.split('\n');
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ cls, text: p });
    });
  };
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.t === 'eof') break;
    let cls = '';
    switch (t.t) {
      case 'kw': cls = TYPE_WORDS.has(t.v) ? 'tk-type' : t.v === 'true' || t.v === 'false' ? 'tk-const' : 'tk-kw'; break;
      case 'num': cls = 'tk-num'; break;
      case 'str': case 'char': cls = 'tk-str'; break;
      case 'comment': cls = 'tk-com'; break;
      case 'pre': cls = 'tk-pre'; break;
      case 'bad': cls = 'tk-bad'; break;
      case 'id': {
        const nextNonWs = toks.slice(i + 1).find((x) => x.t !== 'ws');
        if (t.v in CONSTANTS) cls = 'tk-const';
        else if (OBJECTS.has(t.v)) cls = 'tk-type';
        else if (nextNonWs?.v === '(' && (t.v in BUILTIN_FNS || /^(setup|loop|begin|print|println|attach|write|read|detach)$/.test(t.v))) cls = 'tk-fn';
        else if (nextNonWs?.v === '(') cls = 'tk-fn';
        break;
      }
    }
    push(cls, t.v);
  }
  return lines;
}
