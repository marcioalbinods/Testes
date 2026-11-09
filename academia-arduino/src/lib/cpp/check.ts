/**
 * Verificador de erros básicos do código Arduino.
 * Encontra erros de sintaxe (via parser) e erros comuns de iniciantes:
 * nomes escritos errado, variáveis não declaradas, falta de setup()/loop(),
 * pinMode esquecido, uso de constantes no lugar errado etc.
 */
import type { CodeError, Expr, Program, Stmt } from './ast';
import { BUILTIN_FNS, CONSTANTS, SERIAL_METHODS, SERVO_METHODS, suggest } from './builtins';
import { parse, ParseError } from './parser';

export interface CheckResult {
  program: Program | null;
  errors: CodeError[];
  warnings: CodeError[];
}

const PWM = [3, 5, 6, 9, 10, 11];

export function checkCode(src: string): CheckResult {
  let program: Program;
  try {
    program = parse(src);
  } catch (e) {
    if (e instanceof ParseError) return { program: null, errors: [e.err], warnings: [] };
    return { program: null, errors: [{ line: 1, message: 'Não foi possível ler o código.', severity: 'error' }], warnings: [] };
  }
  const errors: CodeError[] = [];
  const warnings: CodeError[] = [];
  const err = (line: number, message: string, hint?: string) => errors.push({ line, message, hint, severity: 'error' });
  const warn = (line: number, message: string, hint?: string) => warnings.push({ line, message, hint, severity: 'warning' });

  if (!program.funcs.setup) err(1, 'Falta a função void setup() { }.', 'Todo programa Arduino precisa de setup() (roda uma vez) e loop() (repete para sempre).');
  if (!program.funcs.loop) err(1, 'Falta a função void loop() { }.', 'Todo programa Arduino precisa de setup() e loop(), mesmo que o loop fique vazio.');
  for (const name of ['setup', 'loop']) {
    const f = program.funcs[name];
    if (f && f.ret.kind !== 'void') err(f.line, `A função ${name}() deve ser do tipo void.`);
  }
  for (const [lname, f] of Object.entries(program.funcs)) {
    if (/^(setup|loop)$/i.test(lname) && lname !== lname.toLowerCase())
      err(f.line, `A função "${lname}" deve ser escrita com letras minúsculas: ${lname.toLowerCase()}().`);
  }

  const hasServo = program.includes.some((i) => i.toLowerCase() === 'servo.h');
  const objects = new Map<string, string>();
  const globalNames = new Map<string, { isConst: boolean; isArray: boolean; constVal?: number }>();
  const outputPins = new Set<number>();
  const pinModeCalls: { pin: number; line: number }[] = [];
  const writes: { pin: number; line: number; fn: string }[] = [];
  let dynamicPinMode = false;

  for (const g of program.globals) {
    if (g.type.kind === 'object') {
      if (g.type.cls === 'Servo' && !hasServo) err(g.line, 'Para usar Servo, coloque #include <Servo.h> no começo do código.');
      objects.set(g.name, g.type.cls!);
    }
    const cv = g.type.isConst && g.init?.k === 'num' ? g.init.v : undefined;
    if (globalNames.has(g.name)) err(g.line, `A variável "${g.name}" foi criada duas vezes.`);
    globalNames.set(g.name, { isConst: !!g.type.isConst, isArray: g.type.array !== undefined, constVal: cv });
  }
  const knownFns = [...Object.keys(BUILTIN_FNS), ...Object.keys(program.funcs)];

  /** Valor constante de uma expressão simples (número, constante ou const global). */
  const constValue = (e: Expr): number | undefined => {
    if (e.k === 'num') return e.v;
    if (e.k === 'id') {
      if (e.name in CONSTANTS) return CONSTANTS[e.name].v;
      return globalNames.get(e.name)?.constVal;
    }
    return undefined;
  };

  const visitFn = (fnName: string) => {
    const f = program.funcs[fnName];
    const scopes: Map<string, { isConst: boolean; isArray: boolean }>[] = [new Map(f.params.map((p) => [p.name, { isConst: false, isArray: false }]))];
    const lookup = (n: string) => {
      for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(n)) return scopes[i].get(n)!;
      return globalNames.get(n);
    };
    let loopDepth = 0;

    const expr = (e: Expr, inCondition = false): void => {
      switch (e.k) {
        case 'num': case 'str': return;
        case 'id': {
          if (e.name in CONSTANTS || lookup(e.name) || objects.has(e.name)) return;
          const s = suggest(e.name, [...Object.keys(CONSTANTS), ...globalNames.keys(), ...scopes.flatMap((s) => [...s.keys()])]);
          if (/^(high|low|output|input|input_pullup)$/i.test(e.name))
            err(e.line, `"${e.name}" deve ser escrito com letras MAIÚSCULAS: ${e.name.toUpperCase()}.`);
          else err(e.line, `A variável "${e.name}" não foi criada.`, s ? `Você quis dizer "${s}"?` : 'Crie a variável antes de usar, por exemplo: int ' + e.name + ' = 0;');
          return;
        }
        case 'bin': expr(e.a); expr(e.b); return;
        case 'un': case 'cast': expr(e.a); return;
        case 'pre': case 'post':
          checkTarget(e.a);
          return;
        case 'cond': expr(e.c); expr(e.a); expr(e.b); return;
        case 'index': expr(e.arr); expr(e.index); return;
        case 'assign':
          if (inCondition && e.op === '=')
            warn(e.line, 'Dentro da condição há um "=" (guardar valor). Para comparar, use "==".', 'Exemplo: if (estado == HIGH)');
          checkTarget(e.target);
          expr(e.value);
          return;
        case 'call': {
          e.args.forEach((a) => expr(a));
          const b = BUILTIN_FNS[e.name];
          const user = program.funcs[e.name];
          if (!b && !user) {
            const s = suggest(e.name, knownFns);
            err(e.line, `O comando "${e.name}" não existe.`, s ? `Você quis dizer "${s}"? Atenção às letras maiúsculas e minúsculas.` : undefined);
            return;
          }
          if (b && !b.args.includes(e.args.length))
            err(e.line, `${e.name}() precisa de ${b.args.join(' ou ')} valor(es) entre parênteses, mas recebeu ${e.args.length}.`);
          if (user && user.params.length !== e.args.length)
            err(e.line, `A função ${e.name}() precisa de ${user.params.length} valor(es), mas recebeu ${e.args.length}.`);
          if (e.name === 'setup' || e.name === 'loop')
            warn(e.line, `Não é preciso chamar ${e.name}() — o Arduino faz isso sozinho.`);
          const pin = e.args[0] ? constValue(e.args[0]) : undefined;
          if (e.name === 'pinMode' && e.args.length === 2) {
            const m = e.args[1];
            const mv = m.k === 'id' ? m.name : '';
            if (m.k === 'id' && (mv === 'HIGH' || mv === 'LOW'))
              err(e.line, `pinMode usa OUTPUT, INPUT ou INPUT_PULLUP — não ${mv}.`, 'HIGH e LOW são usados no digitalWrite.');
            if (pin === undefined) dynamicPinMode = true;
            else {
              pinModeCalls.push({ pin, line: e.line });
              if (m.k === 'id' && mv === 'OUTPUT') outputPins.add(pin);
            }
          }
          if (e.name === 'digitalWrite' && e.args.length === 2) {
            const v = e.args[1];
            if (v.k === 'id' && ['OUTPUT', 'INPUT', 'INPUT_PULLUP'].includes(v.name))
              err(e.line, `digitalWrite usa HIGH ou LOW — não ${v.name}.`, 'OUTPUT e INPUT são usados no pinMode.');
            if (pin !== undefined) writes.push({ pin, line: e.line, fn: 'digitalWrite' });
          }
          if (e.name === 'analogWrite' && pin !== undefined) {
            if (!PWM.includes(pin)) warn(e.line, `O pino ${pin} não tem PWM (~). O analogWrite só controla o brilho nos pinos 3, 5, 6, 9, 10 e 11.`);
            writes.push({ pin, line: e.line, fn: 'analogWrite' });
          }
          if (['pinMode', 'digitalWrite', 'digitalRead', 'tone', 'noTone', 'analogWrite'].includes(e.name) && pin !== undefined && (pin < 0 || pin > 19))
            err(e.line, `O pino ${pin} não existe no Arduino Uno. Use 0 a 13 ou A0 a A5.`);
          if (e.name === 'analogRead' && pin !== undefined && !((pin >= 0 && pin <= 5) || (pin >= 14 && pin <= 19)))
            err(e.line, `analogRead só funciona nos pinos A0 a A5.`);
          if ((pin === 0 || pin === 1) && ['pinMode', 'digitalWrite'].includes(e.name))
            warn(e.line, `Os pinos 0 e 1 são usados para enviar o programa pelo USB. Prefira os pinos 2 a 13.`);
          if (e.name === 'delay' && e.args[0]) {
            const d = constValue(e.args[0]);
            if (d !== undefined && d < 0) err(e.line, 'O delay não pode ser negativo.');
          }
          return;
        }
        case 'method': {
          e.args.forEach((a) => expr(a));
          if (e.obj === 'Serial') {
            if (!(e.name in SERIAL_METHODS)) {
              const s = suggest(e.name, Object.keys(SERIAL_METHODS));
              err(e.line, `Serial.${e.name} não existe.`, s ? `Você quis dizer Serial.${s}?` : undefined);
            } else if (!SERIAL_METHODS[e.name].includes(e.args.length))
              err(e.line, `Serial.${e.name}() recebeu uma quantidade errada de valores.`);
            return;
          }
          const cls = objects.get(e.obj);
          if (!cls) {
            if (/^serial$/i.test(e.obj)) err(e.line, `Escreva "Serial" com S maiúsculo.`);
            else err(e.line, `O objeto "${e.obj}" não foi criado.`, 'Para um servo: #include <Servo.h> e depois Servo ' + e.obj + ';');
            return;
          }
          if (cls === 'Servo') {
            if (!(e.name in SERVO_METHODS)) {
              const s = suggest(e.name, Object.keys(SERVO_METHODS));
              err(e.line, `${e.obj}.${e.name} não existe.`, s ? `Você quis dizer ${e.obj}.${s}?` : undefined);
            } else if (!SERVO_METHODS[e.name].includes(e.args.length))
              err(e.line, `${e.obj}.${e.name}() recebeu uma quantidade errada de valores.`);
          }
          return;
        }
      }
    };
    const checkTarget = (t: Expr) => {
      if (t.k === 'id') {
        if (t.name in CONSTANTS) { err(t.line, `${t.name} é uma constante do Arduino e não pode mudar.`); return; }
        const v = lookup(t.name);
        if (!v) { expr(t); return; }
        if (v.isConst) err(t.line, `"${t.name}" é uma constante (const) e não pode mudar de valor.`);
      } else if (t.k === 'index') { expr(t.arr); expr(t.index); }
    };
    const stmt = (s: Stmt): void => {
      switch (s.k) {
        case 'block':
          scopes.push(new Map());
          s.body.forEach(stmt);
          scopes.pop();
          return;
        case 'decl':
          for (const d of s.decls) {
            if (d.init) expr(d.init);
            d.initList?.forEach((x) => expr(x));
            if (d.type.kind === 'object') err(d.line, 'Crie objetos (como Servo) fora das funções, no começo do código.');
            if (scopes[scopes.length - 1].has(d.name)) err(d.line, `A variável "${d.name}" foi criada duas vezes.`);
            scopes[scopes.length - 1].set(d.name, { isConst: !!d.type.isConst, isArray: d.type.array !== undefined });
          }
          return;
        case 'expr':
          expr(s.e);
          if (s.e.k === 'bin' && s.e.op === '==') warn(s.line, 'Esta comparação (==) não faz nada sozinha. Para guardar um valor use "=".');
          return;
        case 'if':
          expr(s.c, true);
          if (s.then.k === 'empty') warn(s.line, 'Há um ";" logo depois do if(...). Assim o if não controla nada.', 'Tire o ponto e vírgula depois do parêntese.');
          stmt(s.then);
          if (s.else) stmt(s.else);
          return;
        case 'while': case 'do':
          expr(s.c, true);
          loopDepth++; stmt(s.body); loopDepth--;
          return;
        case 'for':
          scopes.push(new Map());
          if (s.init) stmt(s.init);
          if (s.c) expr(s.c, true);
          if (s.step) expr(s.step);
          loopDepth++; stmt(s.body); loopDepth--;
          scopes.pop();
          return;
        case 'return':
          if (s.e) expr(s.e);
          return;
        case 'break': case 'continue':
          if (loopDepth === 0) err(s.line, `"${s.k}" só pode ser usado dentro de um for ou while.`);
          return;
        case 'empty':
          return;
      }
    };
    stmt(f.body);
  };
  for (const g of program.globals) {
    if (g.init) {
      // valores de variáveis globais
      const visit = (e: Expr): void => {
        if (e.k === 'id' && !(e.name in CONSTANTS) && !globalNames.has(e.name)) err(e.line, `A variável "${e.name}" não foi criada.`);
        if (e.k === 'bin') { visit(e.a); visit(e.b); }
        if (e.k === 'un') visit(e.a);
      };
      visit(g.init);
    }
  }
  Object.keys(program.funcs).forEach(visitFn);

  // pinMode esquecido
  const reported = new Set<number>();
  for (const w of writes) {
    if (dynamicPinMode) break;
    if (w.fn === 'digitalWrite' && !outputPins.has(w.pin) && !reported.has(w.pin) && !pinModeCalls.some((p) => p.pin === w.pin)) {
      reported.add(w.pin);
      warn(w.line, `O pino ${w.pin} não foi configurado como saída.`, `Coloque pinMode(${w.pin}, OUTPUT); dentro do setup().`);
    }
  }
  errors.sort((a, b) => a.line - b.line);
  warnings.sort((a, b) => a.line - b.line);
  return { program: errors.length ? null : program, errors, warnings };
}
