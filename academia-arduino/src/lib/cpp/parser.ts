/**
 * Analisador sintático (parser) do subconjunto de C++ do Arduino.
 * Mensagens de erro em português, pensadas para estudantes iniciantes.
 */
import type { CodeError, Expr, FuncDecl, NumKind, Program, Stmt, TypeRef, VarDecl } from './ast';
import { lex, type Token } from './lexer';

export class ParseError extends Error {
  constructor(public err: CodeError) {
    super(err.message);
  }
}

/** Classes conhecidas (bibliotecas). */
export const KNOWN_CLASSES = new Set(['Servo']);

const TYPE_START = new Set(['void', 'int', 'long', 'unsigned', 'float', 'double', 'bool', 'boolean', 'byte', 'char', 'const', 'String', 'static', 'word', 'short']);

export function parse(src: string): Program {
  const toks = lex(src);
  let p = 0;
  const prog: Program = { includes: [], defines: {}, globals: [], funcs: {} };

  const peek = (o = 0) => toks[Math.min(p + o, toks.length - 1)];
  const next = () => toks[p++];
  const fail = (t: Token, message: string, hint?: string): never => {
    throw new ParseError({ line: t.line, col: t.col, message, hint, severity: 'error' });
  };
  const describe = (t: Token) => (t.t === 'eof' ? 'o fim do código' : `"${t.v}"`);
  const is = (v: string, o = 0) => {
    const t = peek(o);
    return (t.t === 'punc' || t.t === 'op' || t.t === 'kw') && t.v === v;
  };
  const expect = (v: string, what?: string) => {
    const t = peek();
    if ((t.t === 'punc' || t.t === 'op' || t.t === 'kw') && t.v === v) return next();
    const prev = toks[p - 1];
    if (v === ';') {
      if (prev && t.line > prev.line)
        fail(prev, `Faltou o ponto e vírgula (;) no fim da linha ${prev.line}.`, 'Quase todas as instruções terminam com ; — como o ponto final de uma frase.');
      fail(t, `Era esperado ponto e vírgula (;) antes de ${describe(t)}.`, 'Verifique se a instrução terminou e se não sobrou nenhuma palavra.');
    }
    if (v === ')') fail(t, `Faltou fechar o parêntese ")"${what ? ` ${what}` : ''}.`, 'Cada "(" precisa de um ")" correspondente.');
    if (v === '}') fail(t, 'Faltou fechar a chave "}".', 'Cada "{" precisa de uma "}" correspondente. Confira o fim de cada bloco.');
    if (v === '{') fail(t, `Era esperado abrir chave "{"${what ? ` ${what}` : ''}, mas apareceu ${describe(t)}.`);
    if (v === '(') fail(t, `Era esperado "("${what ? ` ${what}` : ''}, mas apareceu ${describe(t)}.`);
    return fail(t, `Era esperado "${v}", mas apareceu ${describe(t)}.`);
  };

  const isTypeStart = (o = 0) => {
    const t = peek(o);
    if (t.t === 'kw' && TYPE_START.has(t.v)) return true;
    return t.t === 'id' && KNOWN_CLASSES.has(t.v) && peek(o + 1).t === 'id';
  };

  function parseType(): TypeRef {
    let isConst = false;
    let unsigned = false;
    let kind: NumKind | null = null;
    let cls: string | undefined;
    let longCount = 0;
    for (;;) {
      const t = peek();
      if (t.t === 'kw' && (t.v === 'const' || t.v === 'static')) { if (t.v === 'const') isConst = true; next(); continue; }
      if (t.t === 'kw' && t.v === 'unsigned') { unsigned = true; next(); continue; }
      if (t.t === 'kw' && t.v === 'long') { longCount++; next(); continue; }
      if (t.t === 'kw' && ['int', 'short', 'word'].includes(t.v)) { next(); if (!kind) kind = 'int'; continue; }
      if (t.t === 'kw' && (t.v === 'float' || t.v === 'double')) { next(); kind = 'float'; continue; }
      if (t.t === 'kw' && (t.v === 'bool' || t.v === 'boolean')) { next(); kind = 'bool'; continue; }
      if (t.t === 'kw' && (t.v === 'byte' || t.v === 'char')) { next(); kind = t.v === 'byte' ? 'byte' : 'int'; continue; }
      if (t.t === 'kw' && t.v === 'void') { next(); kind = 'void'; continue; }
      if (t.t === 'kw' && t.v === 'String') { next(); kind = 'string'; continue; }
      if (t.t === 'id' && KNOWN_CLASSES.has(t.v) && !kind && longCount === 0) { next(); kind = 'object'; cls = t.v; continue; }
      break;
    }
    if (longCount > 0 && kind !== 'float') kind = unsigned ? 'ulong' : 'long';
    else if (unsigned && (kind === 'int' || kind === null)) kind = 'uint';
    if (!kind) fail(peek(), `Tipo de variável desconhecido: ${describe(peek())}.`);
    return { kind: kind!, cls, isConst };
  }

  function parseVarRest(type: TypeRef, firstName: Token): VarDecl[] {
    const decls: VarDecl[] = [];
    let nameTok = firstName;
    for (;;) {
      const d: VarDecl = { k: 'var', type: { ...type }, name: nameTok.v, line: nameTok.line };
      if (is('[')) {
        next();
        let size: number | null = null;
        if (!is(']')) {
          const n = next();
          if (n.t !== 'num') fail(n, 'O tamanho do vetor precisa ser um número.');
          size = Number(n.v.replace(/[uUlL]+$/, ''));
        }
        expect(']');
        d.type.array = size;
      }
      if (is('=')) {
        next();
        if (d.type.array !== undefined) {
          expect('{', 'com os valores do vetor');
          const list: Expr[] = [];
          while (!is('}')) {
            list.push(parseAssign());
            if (is(',')) next();
            else break;
          }
          expect('}');
          d.initList = list;
          if (d.type.array === null) d.type.array = list.length;
        } else d.init = parseAssign();
      } else if (d.type.isConst) {
        fail(nameTok, `A constante "${nameTok.v}" precisa receber um valor, por exemplo: const int ${nameTok.v} = 13;`);
      }
      if (d.type.array === null) fail(nameTok, `Informe o tamanho do vetor "${nameTok.v}" ou seus valores.`);
      decls.push(d);
      if (is(',')) {
        next();
        nameTok = next();
        if (nameTok.t !== 'id') fail(nameTok, 'Era esperado o nome de outra variável depois da vírgula.');
        continue;
      }
      break;
    }
    expect(';');
    return decls;
  }

  function parseBlock(): Stmt & { k: 'block' } {
    const open = expect('{');
    const body: Stmt[] = [];
    while (!is('}')) {
      if (peek().t === 'eof') fail(open, `A chave "{" aberta na linha ${open.line} não foi fechada.`, 'Adicione "}" no fim do bloco.');
      body.push(parseStmt());
    }
    next();
    return { k: 'block', body, line: open.line };
  }

  function parseStmt(): Stmt {
    const t = peek();
    if (t.t === 'bad') badToken(t);
    if (is('{')) return parseBlock();
    if (is(';')) { next(); return { k: 'empty', line: t.line }; }
    if (t.t === 'kw') {
      switch (t.v) {
        case 'if': {
          next();
          expect('(', 'depois de if');
          const c = parseExpr();
          expect(')', 'da condição do if');
          const then = parseStmt();
          let els: Stmt | undefined;
          if (is('else')) { next(); els = parseStmt(); }
          return { k: 'if', c, then, else: els, line: t.line };
        }
        case 'else':
          return fail(t, 'Este "else" não tem um "if" antes dele.', 'O else deve vir logo depois do bloco { } do if.');
        case 'while': {
          next();
          expect('(', 'depois de while');
          const c = parseExpr();
          expect(')', 'da condição do while');
          return { k: 'while', c, body: parseStmt(), line: t.line };
        }
        case 'do': {
          next();
          const body = parseStmt();
          expect('while');
          expect('(');
          const c = parseExpr();
          expect(')');
          expect(';');
          return { k: 'do', c, body, line: t.line };
        }
        case 'for': {
          next();
          expect('(', 'depois de for');
          let init: Stmt | undefined;
          if (!is(';')) {
            if (isTypeStart()) {
              const type = parseType();
              const nm = next();
              if (nm.t !== 'id') fail(nm, 'Era esperado o nome da variável do for.');
              init = { k: 'decl', decls: parseVarRest(type, nm), line: t.line };
            } else {
              init = { k: 'expr', e: parseExpr(), line: t.line };
              expect(';');
            }
          } else next();
          const c = is(';') ? undefined : parseExpr();
          expect(';');
          const step = is(')') ? undefined : parseExpr();
          expect(')', 'do for');
          return { k: 'for', init, c, step, body: parseStmt(), line: t.line };
        }
        case 'return': {
          next();
          const e = is(';') ? undefined : parseExpr();
          expect(';');
          return { k: 'return', e, line: t.line };
        }
        case 'break': next(); expect(';'); return { k: 'break', line: t.line };
        case 'continue': next(); expect(';'); return { k: 'continue', line: t.line };
      }
    }
    if (isTypeStart()) {
      const type = parseType();
      const nm = next();
      if (nm.t !== 'id') fail(nm, `Era esperado o nome da variável depois do tipo, mas apareceu ${describe(nm)}.`);
      if (is('(')) fail(nm, 'Não é possível criar uma função dentro de outra função.', 'Verifique se a função anterior foi fechada com "}".');
      return { k: 'decl', decls: parseVarRest(type, nm), line: t.line };
    }
    const e = parseExpr();
    expect(';');
    return { k: 'expr', e, line: t.line };
  }

  function badToken(t: Token): never {
    if (t.v.startsWith('"')) fail(t, 'Este texto entre aspas não foi fechado.', 'Coloque outra aspa (") no fim do texto.');
    if (t.v.startsWith('/*')) fail(t, 'O comentário /* não foi fechado com */.');
    if (/[“”‘’]/.test(t.v)) fail(t, 'Aspas “curvas” não funcionam no código.', 'Use as aspas retas do teclado: "texto".');
    return fail(t, `O símbolo "${t.v}" não é reconhecido.`);
  }

  // ----- Expressões (precedência do C) -----
  function parseExpr(): Expr {
    return parseAssign();
  }
  function parseAssign(): Expr {
    const left = parseCond();
    const t = peek();
    if (t.t === 'op' && ['=', '+=', '-=', '*=', '/=', '%='].includes(t.v)) {
      next();
      if (left.k !== 'id' && left.k !== 'index') fail(t, 'Só é possível guardar valores em variáveis.');
      const value = parseAssign();
      return { k: 'assign', op: t.v, target: left, value, line: t.line };
    }
    return left;
  }
  function parseCond(): Expr {
    const c = parseBin(0);
    if (is('?')) {
      const t = next();
      const a = parseAssign();
      expect(':');
      const b = parseCond();
      return { k: 'cond', c, a, b, line: t.line };
    }
    return c;
  }
  const LEVELS = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '>', '<=', '>='], ['<<', '>>'], ['+', '-'], ['*', '/', '%']];
  function parseBin(level: number): Expr {
    if (level >= LEVELS.length) return parseUnary();
    let a = parseBin(level + 1);
    for (;;) {
      const t = peek();
      if (t.t === 'op' && LEVELS[level].includes(t.v)) {
        next();
        const b = parseBin(level + 1);
        a = { k: 'bin', op: t.v, a, b, line: t.line };
      } else return a;
    }
  }
  function parseUnary(): Expr {
    const t = peek();
    if (t.t === 'op' && ['!', '-', '+', '~'].includes(t.v)) {
      next();
      return { k: 'un', op: t.v, a: parseUnary(), line: t.line };
    }
    if (t.t === 'op' && (t.v === '++' || t.v === '--')) {
      next();
      return { k: 'pre', op: t.v, a: parseUnary(), line: t.line };
    }
    // conversão de tipo: (float) x, (int) x, (long) x
    if (is('(') && peek(1).t === 'kw' && ['int', 'float', 'long', 'double', 'byte', 'unsigned', 'bool'].includes(peek(1).v)) {
      next();
      const ty = parseType();
      expect(')');
      return { k: 'cast', to: ty.kind, a: parseUnary(), line: t.line };
    }
    return parsePostfix();
  }
  function parsePostfix(): Expr {
    let e = parsePrimary();
    for (;;) {
      const t = peek();
      if (t.t === 'op' && (t.v === '++' || t.v === '--')) {
        next();
        e = { k: 'post', op: t.v, a: e, line: t.line };
      } else if (is('[')) {
        next();
        const index = parseExpr();
        expect(']');
        e = { k: 'index', arr: e, index, line: t.line };
      } else return e;
    }
  }
  function parseArgs(): Expr[] {
    expect('(');
    const args: Expr[] = [];
    if (!is(')')) {
      for (;;) {
        args.push(parseAssign());
        if (is(',')) { next(); continue; }
        break;
      }
    }
    expect(')', 'da chamada da função');
    return args;
  }
  function parsePrimary(): Expr {
    const t = next();
    if (t.t === 'num') return numLiteral(t);
    if (t.t === 'str') {
      let v = unescape(t.v.slice(1, -1));
      while (peek().t === 'str') v += unescape(next().v.slice(1, -1));
      return { k: 'str', v, line: t.line };
    }
    if (t.t === 'char') return { k: 'num', v: unescape(t.v.slice(1, -1)).charCodeAt(0) || 0, type: 'int', line: t.line };
    if (t.t === 'kw' && (t.v === 'true' || t.v === 'false')) return { k: 'num', v: t.v === 'true' ? 1 : 0, type: 'bool', line: t.line };
    if (t.t === 'id') {
      if (is('.')) {
        next();
        const m = next();
        if (m.t !== 'id') fail(m, `Era esperado o nome de um comando depois de "${t.v}."`);
        if (!is('(')) fail(peek(), `Faltou "(" depois de ${t.v}.${m.v}.`);
        return { k: 'method', obj: t.v, name: m.v, args: parseArgs(), line: t.line };
      }
      if (is('(')) return { k: 'call', name: t.v, args: parseArgs(), line: t.line };
      if (t.v in prog.defines) return prog.defines[t.v];
      return { k: 'id', name: t.v, line: t.line };
    }
    if (t.t === 'punc' && t.v === '(') {
      const e = parseExpr();
      expect(')');
      return e;
    }
    if (t.t === 'bad') badToken(t);
    if (t.t === 'eof') return fail(t, 'O código terminou antes da hora. Falta completar alguma instrução.');
    if (t.t === 'punc' && t.v === ')') return fail(t, 'Há um ")" sobrando ou falta um valor antes dele.');
    if (t.t === 'kw' && TYPE_START.has(t.v)) return fail(t, `"${t.v}" é um tipo de variável e não pode aparecer aqui.`);
    return fail(t, `Não era esperado ${describe(t)} aqui.`);
  }

  // ----- Nível superior: #include, #define, variáveis globais e funções -----
  while (peek().t !== 'eof') {
    const t = peek();
    if (t.t === 'pre') {
      next();
      const inc = /^#\s*include\s*[<"]([^>"]+)[>"]/.exec(t.v);
      const def = /^#\s*define\s+([A-Za-z_]\w*)\s+(.+?)\s*(\/\/.*)?$/.exec(t.v);
      if (inc) prog.includes.push(inc[1]);
      else if (def) {
        const sub = parse(`int __d = ${def[2]};`);
        const g = sub.globals[0];
        if (!g?.init) fail(t, `Não foi possível entender o valor de #define ${def[1]}.`);
        prog.defines[def[1]] = g.init!;
      } else fail(t, 'Diretiva # não reconhecida. Use #include <Biblioteca.h> ou #define NOME valor.');
      continue;
    }
    if (t.t === 'bad') badToken(t);
    if (t.t === 'id' && !isTypeStart()) {
      if (/^(setup|loop)$/i.test(t.v) && peek(1).v === '(')
        fail(t, `Faltou o tipo "void" antes de ${t.v}().`, `Escreva: void ${t.v}() { ... }`);
      if (KNOWN_CLASSES.has(t.v)) fail(t, `Faltou o nome do objeto depois de ${t.v}. Exemplo: ${t.v} meuServo;`);
      fail(t, `Fora das funções só podem ficar declarações. "${t.v}" deveria estar dentro de setup() ou loop()?`, 'Comandos como pinMode e digitalWrite ficam dentro das chaves { } de uma função.');
    }
    if (!isTypeStart()) fail(t, `Não era esperado ${describe(t)} aqui.`, is('}') ? 'Parece haver uma chave "}" sobrando.' : undefined);
    const type = parseType();
    const nm = next();
    if (nm.t !== 'id') fail(nm, `Era esperado um nome depois do tipo, mas apareceu ${describe(nm)}.`);
    if (is('(')) {
      next();
      const params: FuncDecl['params'] = [];
      if (!is(')')) {
        if (is('void') && is(')', 1)) next();
        else
          for (;;) {
            const pt = parseType();
            const pn = next();
            if (pn.t !== 'id') fail(pn, 'Era esperado o nome do parâmetro.');
            params.push({ type: pt, name: pn.v });
            if (is(',')) { next(); continue; }
            break;
          }
      }
      expect(')', `da função ${nm.v}`);
      if (is(';')) { next(); continue; } // protótipo
      const body = parseBlock();
      if (prog.funcs[nm.v]) fail(nm, `A função ${nm.v}() foi escrita duas vezes.`);
      prog.funcs[nm.v] = { k: 'func', ret: type, name: nm.v, params, body, line: nm.line };
    } else {
      prog.globals.push(...parseVarRest(type, nm));
    }
  }
  return prog;
}

function numLiteral(t: Token): Expr {
  const raw = t.v;
  const suffix = /[uUlLfF]*$/.exec(raw)![0].toLowerCase();
  const body = raw.slice(0, raw.length - suffix.length);
  if (/^0[xX]/.test(body)) return { k: 'num', v: parseInt(body, 16), type: litType(parseInt(body, 16), suffix), line: t.line };
  if (/^0[bB]/.test(body)) return { k: 'num', v: parseInt(body.slice(2), 2), type: litType(parseInt(body.slice(2), 2), suffix), line: t.line };
  if (/[.eE]/.test(body) || suffix.includes('f')) return { k: 'num', v: parseFloat(body), type: 'float', line: t.line };
  const v = parseInt(body, 10);
  return { k: 'num', v, type: litType(v, suffix), line: t.line };
}

function litType(v: number, suffix: string): NumKind {
  const u = suffix.includes('u');
  if (suffix.includes('l') || v > 65535) return u ? 'ulong' : 'long';
  if (v > 32767) return u ? 'uint' : 'long';
  return u ? 'uint' : 'int';
}

function unescape(s: string) {
  return s.replace(/\\(.)/g, (_, c: string) => ({ n: '\n', t: '\t', '0': '\0', r: '' } as Record<string, string>)[c] ?? c);
}
