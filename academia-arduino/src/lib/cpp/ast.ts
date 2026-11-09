/** Árvore sintática do subconjunto de C++ do Arduino aceito pela plataforma. */

/** Tipos numéricos, em ordem de "tamanho" (promoção aritmética simplificada do C). */
export type NumKind = 'bool' | 'byte' | 'int' | 'uint' | 'long' | 'ulong' | 'float' | 'string' | 'void' | 'object';

export interface TypeRef {
  kind: NumKind;
  /** nome da classe, para objetos (ex.: "Servo") */
  cls?: string;
  isConst?: boolean;
  /** tamanho de vetor (array) — undefined se não for vetor */
  array?: number | null;
}

export type Expr =
  | { k: 'num'; v: number; type: NumKind; line: number }
  | { k: 'str'; v: string; line: number }
  | { k: 'id'; name: string; line: number }
  | { k: 'bin'; op: string; a: Expr; b: Expr; line: number }
  | { k: 'un'; op: string; a: Expr; line: number }
  | { k: 'post'; op: '++' | '--'; a: Expr; line: number }
  | { k: 'pre'; op: '++' | '--'; a: Expr; line: number }
  | { k: 'assign'; op: string; target: Expr; value: Expr; line: number }
  | { k: 'call'; name: string; args: Expr[]; line: number }
  | { k: 'method'; obj: string; name: string; args: Expr[]; line: number }
  | { k: 'index'; arr: Expr; index: Expr; line: number }
  | { k: 'cond'; c: Expr; a: Expr; b: Expr; line: number }
  | { k: 'cast'; to: NumKind; a: Expr; line: number };

export interface VarDecl {
  k: 'var';
  type: TypeRef;
  name: string;
  init?: Expr;
  initList?: Expr[];
  line: number;
}

export type Stmt =
  | { k: 'block'; body: Stmt[]; line: number }
  | { k: 'decl'; decls: VarDecl[]; line: number }
  | { k: 'expr'; e: Expr; line: number }
  | { k: 'if'; c: Expr; then: Stmt; else?: Stmt; line: number }
  | { k: 'while'; c: Expr; body: Stmt; line: number }
  | { k: 'do'; c: Expr; body: Stmt; line: number }
  | { k: 'for'; init?: Stmt; c?: Expr; step?: Expr; body: Stmt; line: number }
  | { k: 'return'; e?: Expr; line: number }
  | { k: 'break'; line: number }
  | { k: 'continue'; line: number }
  | { k: 'empty'; line: number };

export interface FuncDecl {
  k: 'func';
  ret: TypeRef;
  name: string;
  params: { type: TypeRef; name: string }[];
  body: Stmt & { k: 'block' };
  line: number;
}

export interface Program {
  includes: string[];
  defines: Record<string, Expr>;
  globals: VarDecl[];
  funcs: Record<string, FuncDecl>;
}

export interface CodeError {
  line: number;
  col?: number;
  message: string;
  /** dica para corrigir */
  hint?: string;
  severity: 'error' | 'warning';
}
