/**
 * Programação por blocos: modelo dos blocos, geração do código C++ e explicação em português.
 */

export type BlockType = 'wait' | 'ledOn' | 'ledOff' | 'readButton' | 'if' | 'repeat' | 'setVar' | 'changeVar' | 'tone' | 'noTone' | 'print';

export interface Cond {
  kind: 'button' | 'var';
  pin?: number;
  name?: string;
  op?: '==' | '!=' | '<' | '>' | '<=' | '>=';
  value?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  pin?: number;
  ms?: number;
  name?: string;
  value?: number;
  freq?: number;
  times?: number;
  cond?: Cond;
  body?: Block[];
  elseBody?: Block[];
}

export interface BlockProgram {
  setup: Block[];
  loop: Block[];
}

export const VAR_NAMES = ['contador', 'botao', 'valor', 'vezes'];
export const LED_PINS = [13, 12, 11, 10, 9];

export const BLOCK_DEFS: Record<BlockType, { label: string; cat: 'control' | 'output' | 'input' | 'var' | 'sound'; container?: boolean }> = {
  wait: { label: 'Esperar', cat: 'control' },
  ledOn: { label: 'Acender LED', cat: 'output' },
  ledOff: { label: 'Apagar LED', cat: 'output' },
  readButton: { label: 'Ler botão', cat: 'input' },
  if: { label: 'Se… então… senão', cat: 'control', container: true },
  repeat: { label: 'Repetir vezes', cat: 'control', container: true },
  setVar: { label: 'Definir variável', cat: 'var' },
  changeVar: { label: 'Mudar variável', cat: 'var' },
  tone: { label: 'Tocar som', cat: 'sound' },
  noTone: { label: 'Parar som', cat: 'sound' },
  print: { label: 'Mostrar no Serial', cat: 'var' },
};

let n = 0;
export const blockId = () => `b${Date.now().toString(36)}${(n++).toString(36)}`;

export function newBlock(type: BlockType): Block {
  const id = blockId();
  switch (type) {
    case 'wait': return { id, type, ms: 1000 };
    case 'ledOn': case 'ledOff': return { id, type, pin: 13 };
    case 'readButton': return { id, type, pin: 2, name: 'botao' };
    case 'if': return { id, type, cond: { kind: 'button', pin: 2 }, body: [], elseBody: [] };
    case 'repeat': return { id, type, times: 3, body: [] };
    case 'setVar': return { id, type, name: 'contador', value: 0 };
    case 'changeVar': return { id, type, name: 'contador', value: 1 };
    case 'tone': return { id, type, pin: 8, freq: 440 };
    case 'noTone': return { id, type, pin: 8 };
    case 'print': return { id, type, name: 'contador' };
  }
}

export function countBlocks(list: Block[]): number {
  return list.reduce((s, b) => s + 1 + countBlocks(b.body ?? []) + countBlocks(b.elseBody ?? []), 0);
}

function walk(list: Block[], fn: (b: Block) => void) {
  for (const b of list) {
    fn(b);
    walk(b.body ?? [], fn);
    walk(b.elseBody ?? [], fn);
  }
}

const condCode = (c: Cond) => (c.kind === 'button' ? `digitalRead(${c.pin}) == LOW` : `${c.name} ${c.op ?? '=='} ${c.value ?? 0}`);
const condText = (c: Cond) => {
  if (c.kind === 'button') return `o botão do pino ${c.pin} estiver apertado`;
  const ops: Record<string, string> = { '==': 'for igual a', '!=': 'for diferente de', '<': 'for menor que', '>': 'for maior que', '<=': 'for menor ou igual a', '>=': 'for maior ou igual a' };
  return `${c.name} ${ops[c.op ?? '==']} ${c.value ?? 0}`;
};
const secs = (ms: number) => (ms >= 1000 ? `${String(ms / 1000).replace('.', ',')} segundo${ms === 1000 ? '' : 's'}` : `${ms} milissegundos`);

/** Gera o código Arduino (C++) correspondente aos blocos. */
export function generateCode(p: BlockProgram): string {
  const all = [...p.setup, ...p.loop];
  const outPins = new Set<number>();
  const inPins = new Set<number>();
  const vars = new Set<string>();
  let serial = false;
  walk(all, (b) => {
    if (b.type === 'ledOn' || b.type === 'ledOff' || b.type === 'tone' || b.type === 'noTone') outPins.add(b.pin!);
    if (b.type === 'readButton') { inPins.add(b.pin!); vars.add(b.name!); }
    if (b.type === 'if' && b.cond?.kind === 'button') inPins.add(b.cond.pin!);
    if (b.type === 'if' && b.cond?.kind === 'var') vars.add(b.cond.name!);
    if (b.type === 'setVar' || b.type === 'changeVar') vars.add(b.name!);
    if (b.type === 'print') { serial = true; vars.add(b.name!); }
  });
  const lines: string[] = ['// Programa criado com blocos na Academia de Arduino', ''];
  for (const v of vars) lines.push(`int ${v} = 0;`);
  if (vars.size) lines.push('');
  const body = (list: Block[], depth: number, ind: string) => {
    for (const b of list) {
      switch (b.type) {
        case 'wait': lines.push(`${ind}delay(${b.ms});`); break;
        case 'ledOn': lines.push(`${ind}digitalWrite(${b.pin}, HIGH);`); break;
        case 'ledOff': lines.push(`${ind}digitalWrite(${b.pin}, LOW);`); break;
        case 'readButton': lines.push(`${ind}${b.name} = digitalRead(${b.pin});   // LOW = apertado`); break;
        case 'setVar': lines.push(`${ind}${b.name} = ${b.value};`); break;
        case 'changeVar': lines.push(`${ind}${b.name} = ${b.name} + ${b.value};`); break;
        case 'tone': lines.push(`${ind}tone(${b.pin}, ${b.freq});`); break;
        case 'noTone': lines.push(`${ind}noTone(${b.pin});`); break;
        case 'print': lines.push(`${ind}Serial.println(${b.name});`); break;
        case 'repeat': {
          const v = ['i', 'j', 'k', 'm', 'n'][depth] ?? `i${depth}`;
          lines.push(`${ind}for (int ${v} = 0; ${v} < ${b.times}; ${v}++) {`);
          body(b.body ?? [], depth + 1, ind + '  ');
          lines.push(`${ind}}`);
          break;
        }
        case 'if':
          lines.push(`${ind}if (${condCode(b.cond!)}) {`);
          body(b.body ?? [], depth, ind + '  ');
          if (b.elseBody && b.elseBody.length) {
            lines.push(`${ind}} else {`);
            body(b.elseBody, depth, ind + '  ');
          }
          lines.push(`${ind}}`);
          break;
      }
    }
  };
  lines.push('void setup() {');
  for (const pin of [...outPins].sort((a, b) => b - a)) lines.push(`  pinMode(${pin}, OUTPUT);`);
  for (const pin of [...inPins].sort((a, b) => a - b)) lines.push(`  pinMode(${pin}, INPUT_PULLUP);   // botão: pino e GND`);
  if (serial) lines.push('  Serial.begin(9600);');
  body(p.setup, 0, '  ');
  lines.push('}', '', 'void loop() {');
  body(p.loop, 0, '  ');
  lines.push('}');
  return lines.join('\n');
}

/** Explica, em português, o que o programa faz. */
export function explainProgram(p: BlockProgram): string[] {
  const out: string[] = [];
  const say = (list: Block[], ind: number) => {
    const pad = '  '.repeat(ind);
    for (const b of list) {
      switch (b.type) {
        case 'wait': out.push(`${pad}• espera ${secs(b.ms!)};`); break;
        case 'ledOn': out.push(`${pad}• acende o LED do pino ${b.pin};`); break;
        case 'ledOff': out.push(`${pad}• apaga o LED do pino ${b.pin};`); break;
        case 'readButton': out.push(`${pad}• lê o botão do pino ${b.pin} e guarda em "${b.name}" (LOW = apertado);`); break;
        case 'setVar': out.push(`${pad}• guarda o valor ${b.value} na variável "${b.name}";`); break;
        case 'changeVar': out.push(`${pad}• soma ${b.value} à variável "${b.name}";`); break;
        case 'tone': out.push(`${pad}• toca um som de ${b.freq} Hz no pino ${b.pin};`); break;
        case 'noTone': out.push(`${pad}• para o som do pino ${b.pin};`); break;
        case 'print': out.push(`${pad}• mostra o valor de "${b.name}" no Monitor Serial;`); break;
        case 'repeat':
          out.push(`${pad}• repete ${b.times} vezes:`);
          say(b.body ?? [], ind + 1);
          break;
        case 'if':
          out.push(`${pad}• SE ${condText(b.cond!)}:`);
          say(b.body ?? [], ind + 1);
          if (b.elseBody?.length) { out.push(`${pad}• SENÃO:`); say(b.elseBody, ind + 1); }
          break;
      }
    }
  };
  out.push('Ao iniciar, o Arduino prepara os pinos usados.');
  if (p.setup.length) { out.push('Depois, uma única vez:'); say(p.setup, 1); }
  if (p.loop.length) { out.push('E então, para sempre:'); say(p.loop, 1); }
  else out.push('O "Repetir para sempre" está vazio: arraste blocos para ele.');
  return out;
}

const b = (type: BlockType, extra: Partial<Block> = {}): Block => ({ ...newBlock(type), ...extra });

export const BLOCK_EXAMPLES: { id: string; title: string; make: () => BlockProgram }[] = [
  { id: 'pisca', title: 'Pisca-pisca', make: () => ({ setup: [], loop: [b('ledOn'), b('wait', { ms: 500 }), b('ledOff'), b('wait', { ms: 500 })] }) },
  {
    id: 'semaforo', title: 'Semáforo',
    make: () => ({ setup: [], loop: [b('ledOn', { pin: 11 }), b('wait', { ms: 3000 }), b('ledOff', { pin: 11 }), b('ledOn', { pin: 12 }), b('wait', { ms: 1000 }), b('ledOff', { pin: 12 }), b('ledOn', { pin: 13 }), b('wait', { ms: 3000 }), b('ledOff', { pin: 13 })] }),
  },
  { id: 'botao', title: 'Botão acende LED', make: () => ({ setup: [], loop: [b('if', { cond: { kind: 'button', pin: 2 }, body: [b('ledOn', { pin: 11 })], elseBody: [b('ledOff', { pin: 11 })] })] }) },
  {
    id: 'contador', title: 'Contador com repetição',
    make: () => ({
      setup: [b('setVar', { name: 'contador', value: 0 })],
      loop: [b('repeat', { times: 3, body: [b('ledOn', { pin: 12 }), b('wait', { ms: 200 }), b('ledOff', { pin: 12 }), b('wait', { ms: 200 })] }), b('changeVar', { name: 'contador', value: 1 }), b('print', { name: 'contador' }), b('wait', { ms: 1000 })],
    }),
  },
  {
    id: 'alarme', title: 'Alarme com botão',
    make: () => ({ setup: [], loop: [b('if', { cond: { kind: 'button', pin: 2 }, body: [b('tone', { pin: 8, freq: 880 }), b('ledOn', { pin: 13 }), b('wait', { ms: 200 }), b('tone', { pin: 8, freq: 440 }), b('ledOff', { pin: 13 }), b('wait', { ms: 200 })], elseBody: [b('noTone', { pin: 8 })] })] }),
  },
];
