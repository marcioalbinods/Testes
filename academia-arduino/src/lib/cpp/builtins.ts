/** Funções, constantes e objetos do Arduino reconhecidos pela plataforma. */
import type { NumKind } from './ast';

export interface BuiltinFn {
  name: string;
  /** quantidades de argumentos aceitas */
  args: number[];
  ret: NumKind;
  doc: string;
}

export const BUILTIN_FNS: Record<string, BuiltinFn> = Object.fromEntries(
  ([
    ['pinMode', [2], 'void', 'Define se o pino será uma entrada (INPUT / INPUT_PULLUP) ou uma saída (OUTPUT).'],
    ['digitalWrite', [2], 'void', 'Liga (HIGH = 5 V) ou desliga (LOW = 0 V) um pino de saída.'],
    ['digitalRead', [1], 'int', 'Lê um pino de entrada e devolve HIGH (1) ou LOW (0).'],
    ['analogRead', [1], 'int', 'Lê a tensão de um pino analógico (A0 a A5) e devolve um número de 0 a 1023.'],
    ['analogWrite', [2], 'void', 'Gera um sinal PWM de 0 a 255 nos pinos com ~ (3, 5, 6, 9, 10, 11). Serve para controlar o brilho de um LED.'],
    ['delay', [1], 'void', 'Faz o Arduino esperar. O valor é em milissegundos: 1000 = 1 segundo.'],
    ['delayMicroseconds', [1], 'void', 'Espera alguns microssegundos (1 000 000 = 1 segundo).'],
    ['millis', [0], 'ulong', 'Devolve quantos milissegundos se passaram desde que a placa ligou.'],
    ['micros', [0], 'ulong', 'Devolve quantos microssegundos se passaram desde que a placa ligou.'],
    ['tone', [2, 3], 'void', 'Faz o buzzer tocar uma nota: tone(pino, frequência) ou tone(pino, frequência, duração).'],
    ['noTone', [1], 'void', 'Para o som do buzzer no pino.'],
    ['pulseIn', [2, 3], 'ulong', 'Mede quanto tempo (em microssegundos) um pino fica em HIGH ou LOW. Usado com o sensor ultrassônico.'],
    ['map', [5], 'long', 'Converte um número de uma faixa para outra. Ex.: map(valor, 0, 1023, 0, 255).'],
    ['constrain', [3], 'long', 'Mantém um número dentro de um limite: constrain(x, mínimo, máximo).'],
    ['min', [2], 'long', 'Devolve o menor de dois números.'],
    ['max', [2], 'long', 'Devolve o maior de dois números.'],
    ['abs', [1], 'long', 'Devolve o valor sem sinal (ex.: abs(-5) = 5).'],
    ['random', [1, 2], 'long', 'Sorteia um número: random(máximo) ou random(mínimo, máximo).'],
    ['randomSeed', [1], 'void', 'Prepara o sorteio de números aleatórios.'],
    ['sqrt', [1], 'float', 'Raiz quadrada.'],
    ['pow', [2], 'float', 'Potência: pow(base, expoente).'],
  ] as [string, number[], NumKind, string][]).map(([name, args, ret, doc]) => [name, { name, args, ret, doc }]),
);

export const CONSTANTS: Record<string, { v: number; type: NumKind; doc: string }> = {
  HIGH: { v: 1, type: 'int', doc: 'Nível alto: 5 V (ligado).' },
  LOW: { v: 0, type: 'int', doc: 'Nível baixo: 0 V (desligado).' },
  INPUT: { v: 0, type: 'int', doc: 'Pino como entrada (para ler sensores e botões).' },
  OUTPUT: { v: 1, type: 'int', doc: 'Pino como saída (para acender LEDs, tocar buzzer...).' },
  INPUT_PULLUP: { v: 2, type: 'int', doc: 'Entrada com resistor interno ligado ao 5 V. Botão solto = HIGH, apertado = LOW.' },
  LED_BUILTIN: { v: 13, type: 'int', doc: 'O LED "L" da placa, ligado ao pino 13.' },
  A0: { v: 14, type: 'int', doc: 'Pino analógico A0.' },
  A1: { v: 15, type: 'int', doc: 'Pino analógico A1.' },
  A2: { v: 16, type: 'int', doc: 'Pino analógico A2.' },
  A3: { v: 17, type: 'int', doc: 'Pino analógico A3.' },
  A4: { v: 18, type: 'int', doc: 'Pino analógico A4.' },
  A5: { v: 19, type: 'int', doc: 'Pino analógico A5.' },
};

export const SERIAL_METHODS: Record<string, number[]> = { begin: [1], print: [1, 2], println: [0, 1, 2], available: [0], read: [0] };
export const SERVO_METHODS: Record<string, number[]> = { attach: [1, 3], write: [1], read: [0], detach: [0], attached: [0] };

export const SERVO_DOC: Record<string, string> = {
  attach: 'Informa em qual pino está o fio de sinal (laranja) do servo.',
  write: 'Gira o servo até o ângulo informado (0 a 180 graus).',
  read: 'Devolve o último ângulo enviado ao servo.',
  detach: 'Desliga o sinal do servo.',
  attached: 'Diz se o servo está ligado a um pino.',
};
export const SERIAL_DOC: Record<string, string> = {
  begin: 'Liga a comunicação com o computador. Use Serial.begin(9600); no setup().',
  print: 'Escreve um texto ou número no Monitor Serial.',
  println: 'Escreve no Monitor Serial e pula para a próxima linha.',
  available: 'Diz quantos caracteres chegaram do computador.',
  read: 'Lê um caractere enviado pelo computador.',
};

/** Distância de edição (para sugerir "você quis dizer ...?"). */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

export function suggest(name: string, candidates: string[]): string | null {
  const lower = name.toLowerCase();
  const exactCase = candidates.find((c) => c.toLowerCase() === lower);
  if (exactCase) return exactCase;
  let best: string | null = null;
  let bestD = 3;
  for (const c of candidates) {
    const dd = editDistance(lower, c.toLowerCase());
    if (dd < bestD) { bestD = dd; best = c; }
  }
  return best;
}
