/**
 * Regras de validação das atividades de montagem.
 *
 * Cada regra testa o circuito de verdade: coloca os pinos em diferentes estados, calcula o
 * circuito com o motor elétrico e verifica a TOPOLOGIA (o que está ligado a quê),
 * a polaridade e se a corrente é segura. Quando algo está errado, explica o motivo.
 */
import { legHoles } from './parts';
import { analogReadNode, analyze, defaultPin, digitalReadNode, endpointNode, GND, type Analysis, type BoardState, type PinState } from './engine';
import type { Circuit, LedColor, PartKind, PlacedPart } from './types';
import { LED_COLORS } from './parts';
import { pinLabel } from '../arduino';

export type Rule =
  | { type: 'rails' }
  | { type: 'ledPowered'; color?: LedColor }
  | { type: 'ledPin'; pin: string; color?: LedColor }
  | { type: 'buttonPin'; pin: string }
  | { type: 'buzzerPin'; pin: string }
  | { type: 'potAnalog'; pin: string }
  | { type: 'ldrAnalog'; pin: string }
  | { type: 'servoPin'; pin: string }
  | { type: 'ultrasonic'; trig: string; echo: string };

export interface Problem {
  message: string;
  fix?: string;
  highlight: string[];
}

export interface CheckResult {
  ok: boolean;
  /** frases curtas do que está certo */
  passed: string[];
  problems: Problem[];
}

const out = (value: 0 | 1, pwm: number | null = null): PinState => ({ ...defaultPin(), mode: 'OUTPUT', value, pwm });
const board = (pins: Record<string, PinState> = {}): BoardState => ({ powered: true, pins });
const pinNice = (node: string) => pinLabel(node.startsWith('A') ? node : node);

/** Grafo de caminhos condutores (fios, resistores, botões, potenciômetro, LDR), ignorando um componente. */
function conductiveGraph(c: Circuit, exclude?: string) {
  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };
  for (const w of c.wires) {
    const a = endpointNode(w.a, c.railsSplit);
    const b = endpointNode(w.b, c.railsSplit);
    if (a && b) link(a, b);
  }
  for (const p of c.parts) {
    if (p.id === exclude) continue;
    const h = legHoles(p);
    if (!h) continue;
    const n = (k: string) => endpointNode(h[k], c.railsSplit)!;
    if (p.kind === 'resistor' || p.kind === 'ldr') link(n('1'), n('2'));
    if (p.kind === 'pot') { link(n('1'), n('W')); link(n('W'), n('3')); }
    if (p.kind === 'button') { link(n('1a'), n('1b')); link(n('2a'), n('2b')); link(n('1a'), n('2a')); }
  }
  const reach = (from: string, to: string) => {
    if (from === to) return true;
    const seen = new Set([from]);
    const stack = [from];
    while (stack.length) {
      const x = stack.pop()!;
      for (const y of adj.get(x) ?? []) {
        if (y === to) return true;
        if (!seen.has(y)) { seen.add(y); stack.push(y); }
      }
    }
    return false;
  };
  return { reach };
}

const partsOf = (c: Circuit, kind: PartKind) => c.parts.filter((p) => p.kind === kind);
const legNode = (c: Circuit, p: PlacedPart, key: string) => {
  const h = legHoles(p);
  return h ? endpointNode(h[key], c.railsSplit) : null;
};

function dangers(an: Analysis): Problem[] {
  return an.diagnostics
    .filter((d) => d.severity === 'danger')
    .map((d) => ({ message: d.message, fix: d.fix, highlight: d.highlight }));
}

/** Explica por que um LED não está funcionando entre uma fonte e o GND. */
function explainLed(c: Circuit, an: Analysis, led: PlacedPart, source: string, sourceName: string): Problem[] {
  const res = an.parts[led.id];
  const a = legNode(c, led, 'A');
  const k = legNode(c, led, 'K');
  if (!a || !k || !res) return [{ message: 'O LED está fora da protoboard.', highlight: [led.id] }];
  const hl = [led.id];
  const d = an.diagnostics.find((x) => x.highlight.includes(led.id) && (x.code === 'led-same-net' || x.code === 'led-reversed'));
  if (d) return [{ message: d.message, fix: d.fix, highlight: d.highlight }];
  const g = conductiveGraph(c, led.id);
  const anodeToSrc = g.reach(a, source);
  const cathodeToGnd = g.reach(k, GND);
  const anodeToGnd = g.reach(a, GND);
  const cathodeToSrc = g.reach(k, source);
  if (!anodeToSrc && !cathodeToGnd && anodeToGnd && cathodeToSrc)
    return [{ message: 'O LED está invertido.', fix: 'A perna longa (ânodo, +) deve ir para o lado do ' + sourceName + ' e a curta (cátodo, −) para o GND.', highlight: hl }];
  const probs: Problem[] = [];
  if (!anodeToSrc)
    probs.push({ message: `O ânodo (perna longa, +) do LED não chega ao ${sourceName}.`, fix: `Ligue um fio (ou o resistor) do ${sourceName} até o grupo de furos onde está a perna longa do LED.`, highlight: [...hl, legHoles(led)!.A] });
  if (!cathodeToGnd)
    probs.push({ message: 'O cátodo (perna curta, −) do LED não chega ao GND.', fix: 'Ligue o grupo de furos da perna curta do LED ao GND (ou ao trilho negativo ligado ao GND).', highlight: [...hl, legHoles(led)!.K] });
  if (!probs.length && (res.brightness ?? 0) === 0)
    probs.push({ message: 'O LED não acendeu. Confira se todos os fios estão nos furos certos.', highlight: hl });
  return probs;
}

/** Existe um resistor em série com o LED (mesma corrente passando pelos dois)? */
function hasSeriesResistor(c: Circuit, an: Analysis, led: PlacedPart) {
  const i = an.parts[led.id]?.current ?? 0;
  if (i <= 0) return false;
  return partsOf(c, 'resistor').some((r) => {
    const ir = Math.abs(an.parts[r.id]?.current ?? 0);
    return Math.abs(ir - i) / i < 0.05;
  });
}

function filterColor(leds: PlacedPart[], color?: LedColor) {
  return color ? leds.filter((l) => (l.props.color ?? 'red') === color) : leds;
}

export function runRule(c: Circuit, rule: Rule): CheckResult {
  const passed: string[] = [];
  const problems: Problem[] = [];
  switch (rule.type) {
    case 'rails': {
      const an = analyze(c, board());
      problems.push(...dangers(an));
      const plus = ['rail:tp', 'rail:bp', 'rail:tp:L', 'rail:tp:R', 'rail:bp:L', 'rail:bp:R'].some((r) => an.connected('5V', r));
      const minus = ['rail:tn', 'rail:bn', 'rail:tn:L', 'rail:tn:R', 'rail:bn:L', 'rail:bn:R'].some((r) => an.connected(GND, r));
      const wrong1 = ['rail:tn', 'rail:bn', 'rail:tn:L', 'rail:tn:R', 'rail:bn:L', 'rail:bn:R'].some((r) => an.connected('5V', r));
      const wrong2 = ['rail:tp', 'rail:bp', 'rail:tp:L', 'rail:tp:R', 'rail:bp:L', 'rail:bp:R'].some((r) => an.connected(GND, r));
      if (wrong1 || wrong2)
        problems.push({ message: 'As cores estão trocadas: o 5V deve ir para o trilho vermelho (+) e o GND para o trilho azul (−).', fix: 'Troque os fios de lugar. Use fio vermelho para o 5V e preto para o GND.', highlight: [] });
      if (plus) passed.push('5V ligado ao trilho positivo (+).');
      else if (!wrong1) problems.push({ message: 'O pino 5V da placa ainda não está ligado ao trilho positivo (+, linha vermelha).', fix: 'Puxe um fio do pino 5V até um furo da linha vermelha (+).', highlight: ['ard:5V'] });
      if (minus) passed.push('GND ligado ao trilho negativo (−).');
      else if (!wrong2) problems.push({ message: 'O pino GND da placa ainda não está ligado ao trilho negativo (−, linha azul).', fix: 'Puxe um fio de um pino GND até um furo da linha azul (−).', highlight: ['ard:GND1'] });
      break;
    }
    case 'ledPowered': {
      const an = analyze(c, board());
      problems.push(...dangers(an));
      const leds = filterColor(partsOf(c, 'led'), rule.color);
      if (!leds.length) {
        problems.push({ message: rule.color ? `Coloque um LED ${LED_COLORS[rule.color].name} na protoboard.` : 'Coloque um LED na protoboard.', highlight: [] });
        break;
      }
      const lit = leds.find((l) => (an.parts[l.id]?.brightness ?? 0) > 0.3);
      if (!lit) {
        problems.push(...explainLed(c, an, leds[0], '5V', '5V'));
        break;
      }
      passed.push('O LED acende.');
      if (!hasSeriesResistor(c, an, lit))
        problems.push({ message: 'O LED acendeu, mas sem um resistor em série. Na vida real ele poderia queimar.', fix: 'Coloque um resistor (220 Ω) no caminho entre o 5V e o LED, ou entre o LED e o GND.', highlight: [lit.id] });
      else passed.push('Há um resistor em série protegendo o LED.');
      break;
    }
    case 'ledPin': {
      const leds = filterColor(partsOf(c, 'led'), rule.color);
      const nice = pinNice(rule.pin);
      if (!leds.length) {
        problems.push({ message: rule.color ? `Coloque um LED ${LED_COLORS[rule.color].name}.` : 'Coloque um LED na protoboard.', highlight: [] });
        break;
      }
      const anH = analyze(c, board({ [rule.pin]: out(1) }));
      const anL = analyze(c, board({ [rule.pin]: out(0) }));
      problems.push(...dangers(anH));
      const lit = leds.find((l) => (anH.parts[l.id]?.brightness ?? 0) > 0.3 && (anL.parts[l.id]?.brightness ?? 0) === 0);
      if (!lit) {
        const alwaysOn = leds.find((l) => (anL.parts[l.id]?.brightness ?? 0) > 0.3);
        if (alwaysOn) problems.push({ message: `O LED fica aceso mesmo com o ${nice} desligado: ele está ligado ao 5V, não ao pino.`, fix: `Ligue o LED (pelo resistor) ao ${nice}.`, highlight: [alwaysOn.id] });
        else problems.push(...explainLed(c, anH, leds[0], rule.pin, nice));
        break;
      }
      passed.push(`O LED${rule.color ? ' ' + LED_COLORS[rule.color].name : ''} acende quando o ${nice} está em HIGH e apaga em LOW.`);
      if (!hasSeriesResistor(c, anH, lit))
        problems.push({ message: 'Falta um resistor em série com o LED.', fix: 'Coloque um resistor de 220 Ω entre o pino e o LED (ou entre o LED e o GND).', highlight: [lit.id] });
      break;
    }
    case 'buttonPin': {
      const buttons = partsOf(c, 'button');
      const nice = pinNice(rule.pin);
      if (!buttons.length) { problems.push({ message: 'Coloque um botão sobre o canal central da protoboard.', highlight: [] }); break; }
      const pins = { [rule.pin]: { ...defaultPin(), mode: 'INPUT_PULLUP' as const } };
      const press = (v: boolean): Circuit => ({ ...c, parts: c.parts.map((p) => (p.kind === 'button' ? { ...p, props: { ...p.props, pressed: v } } : p)) });
      const up = analyze(press(false), board(pins));
      const down = analyze(press(true), board(pins));
      problems.push(...dangers(up), ...dangers(down));
      const rUp = digitalReadNode(up, rule.pin);
      const rDown = digitalReadNode(down, rule.pin);
      if (rUp === 1 && rDown === 0) {
        passed.push(`Com INPUT_PULLUP, o ${nice} lê HIGH com o botão solto e LOW com o botão apertado.`);
        break;
      }
      const b = buttons[0];
      const g = conductiveGraph(c);
      const legs = ['1a', '2a'].map((k) => legNode(c, b, k)!);
      const toPin = legs.some((n) => g.reach(n, rule.pin));
      const toGnd = legs.some((n) => g.reach(n, GND));
      if (rDown === 1 && rUp === 1) {
        if (!toPin) problems.push({ message: `O botão não está ligado ao ${nice}.`, fix: `Ligue um fio do ${nice} até o grupo de furos de uma das pernas do botão.`, highlight: [b.id, `ard:${rule.pin}`] });
        else if (!toGnd) problems.push({ message: 'O outro lado do botão não está ligado ao GND.', fix: 'Ligue a perna do lado oposto do botão ao GND (ou ao trilho −).', highlight: [b.id] });
        else problems.push({ message: 'O pino e o GND estão do mesmo lado do botão: apertar não muda nada.', fix: 'Ligue o pino em uma perna e o GND na perna do OUTRO lado do botão (na diagonal funciona sempre).', highlight: [b.id] });
      } else if (rUp === 0) {
        problems.push({ message: `O ${nice} está ligado direto ao GND, mesmo com o botão solto.`, fix: 'O pino e o GND devem ficar em pernas de lados diferentes do botão.', highlight: [b.id, `ard:${rule.pin}`] });
      } else {
        problems.push({ message: 'A leitura do botão não funcionou como esperado.', fix: 'Confira os fios do pino e do GND.', highlight: [b.id] });
      }
      break;
    }
    case 'buzzerPin': {
      const bz = partsOf(c, 'buzzer');
      const nice = pinNice(rule.pin);
      if (!bz.length) { problems.push({ message: 'Coloque um buzzer na protoboard.', highlight: [] }); break; }
      const an = analyze(c, board({ [rule.pin]: { ...out(1), tone: 440 } }));
      problems.push(...dangers(an));
      const ok = bz.find((b) => an.parts[b.id]?.sound);
      if (ok) {
        passed.push(`O buzzer toca quando o ${nice} usa tone().`);
        const pN = legNode(c, ok, 'P')!;
        if (!conductiveGraph(c, ok.id).reach(pN, rule.pin))
          problems.push({ message: 'O buzzer está invertido: o lado + deve ir para o pino.', fix: 'Vire o buzzer: o terminal + (perna maior) no lado do pino, o − no GND.', highlight: [ok.id] });
        break;
      }
      const b = bz[0];
      const g = conductiveGraph(c, b.id);
      const p = legNode(c, b, 'P')!;
      const n = legNode(c, b, 'N')!;
      if (!g.reach(p, rule.pin) && !g.reach(n, rule.pin)) problems.push({ message: `O buzzer não está ligado ao ${nice}.`, fix: `Ligue o terminal + do buzzer ao ${nice}.`, highlight: [b.id] });
      else if (!g.reach(p, GND) && !g.reach(n, GND)) problems.push({ message: 'O buzzer não está ligado ao GND.', fix: 'Ligue o terminal − do buzzer ao GND.', highlight: [b.id] });
      else problems.push({ message: 'O buzzer não recebe o sinal. Ele pode estar com as duas pernas no mesmo caminho.', highlight: [b.id] });
      break;
    }
    case 'potAnalog': {
      const pots = partsOf(c, 'pot');
      if (!pots.length) { problems.push({ message: 'Coloque um potenciômetro na protoboard.', highlight: [] }); break; }
      const at = (pos: number) => analogReadNode(analyze({ ...c, parts: c.parts.map((p) => (p.kind === 'pot' ? { ...p, props: { ...p.props, pos } } : p)) }, board()), rule.pin);
      const an = analyze(c, board());
      problems.push(...dangers(an));
      const lo = at(0);
      const hi = at(1);
      const mid = at(0.5);
      if (lo !== null && hi !== null && mid !== null && Math.abs(hi - lo) > 900 && Math.abs(mid - 512) < 60) {
        passed.push(`Girando o potenciômetro, a leitura do ${rule.pin} vai de 0 a 1023.`);
        break;
      }
      const p = pots[0];
      const g = conductiveGraph(c, p.id);
      const [e1, w, e3] = ['1', 'W', '3'].map((k) => legNode(c, p, k)!);
      if (!g.reach(w, rule.pin)) problems.push({ message: `A perna do meio (cursor) do potenciômetro deve ir ao ${rule.pin}.`, fix: `Ligue um fio da perna do meio até o pino ${rule.pin}.`, highlight: [p.id] });
      const ends = [e1, e3];
      if (!ends.some((e) => g.reach(e, '5V'))) problems.push({ message: 'Uma das pernas das pontas deve ir ao 5V.', highlight: [p.id] });
      if (!ends.some((e) => g.reach(e, GND))) problems.push({ message: 'A outra perna das pontas deve ir ao GND.', highlight: [p.id] });
      if (!problems.length) problems.push({ message: 'O potenciômetro não está variando a leitura corretamente. Confira as três pernas.', highlight: [p.id] });
      break;
    }
    case 'ldrAnalog': {
      const ldrs = partsOf(c, 'ldr');
      if (!ldrs.length) { problems.push({ message: 'Coloque um LDR na protoboard.', highlight: [] }); break; }
      const at = (light: number) => analogReadNode(analyze({ ...c, parts: c.parts.map((p) => (p.kind === 'ldr' ? { ...p, props: { ...p.props, light } } : p)) }, board()), rule.pin);
      const an = analyze(c, board());
      problems.push(...dangers(an));
      const dark = at(0);
      const bright = at(1);
      if (dark !== null && bright !== null && Math.abs(bright - dark) > 300) {
        passed.push(`A leitura do ${rule.pin} muda com a luz (escuro: ${dark}, claro: ${bright}).`);
        break;
      }
      const l = ldrs[0];
      const [n1, n2] = ['1', '2'].map((k) => legNode(c, l, k)!);
      const g = conductiveGraph(c, l.id);
      if (![n1, n2].some((n) => g.reach(n, rule.pin)) && !an.connected(n1, rule.pin) && !an.connected(n2, rule.pin))
        problems.push({ message: `O LDR precisa estar ligado ao ${rule.pin}.`, fix: `Ligue o ponto entre o LDR e o resistor ao pino ${rule.pin}.`, highlight: [l.id] });
      else if (![n1, n2].some((n) => an.connected(n, '5V') || g.reach(n, '5V')))
        problems.push({ message: 'Uma perna do LDR deve ir ao 5V.', highlight: [l.id] });
      else
        problems.push({ message: 'Falta o resistor do divisor de tensão (10 kΩ) entre o pino analógico e o GND.', fix: 'Monte: 5V → LDR → ponto do meio (ligado ao A0) → resistor de 10 kΩ → GND.', highlight: [l.id] });
      break;
    }
    case 'servoPin': {
      const servos = partsOf(c, 'servo');
      if (!servos.length) { problems.push({ message: 'Coloque o conector do servo na protoboard.', highlight: [] }); break; }
      const an = analyze(c, board({}), { servoPins: [rule.pin] });
      problems.push(...dangers(an));
      const s = servos[0];
      const res = an.parts[s.id];
      if (res.powered) passed.push('O servo está alimentado (vermelho no 5V, marrom no GND).');
      else problems.push({ message: 'O servo não está alimentado.', fix: 'Fio vermelho → 5V e fio marrom → GND.', highlight: [s.id] });
      if (an.connected(legNode(c, s, 'SIG')!, rule.pin)) passed.push(`O fio laranja (sinal) está no ${pinNice(rule.pin)}.`);
      else problems.push({ message: `O fio laranja (sinal) do servo deve ir ao ${pinNice(rule.pin)}.`, highlight: [s.id] });
      break;
    }
    case 'ultrasonic': {
      const us = partsOf(c, 'ultrasonic');
      if (!us.length) { problems.push({ message: 'Coloque o sensor ultrassônico na protoboard.', highlight: [] }); break; }
      const an = analyze(c, board());
      problems.push(...dangers(an));
      const s = us[0];
      if (an.parts[s.id].powered) passed.push('O sensor está alimentado (VCC no 5V, GND no GND).');
      else problems.push({ message: 'O sensor não está alimentado: VCC vai ao 5V e GND ao GND.', highlight: [s.id] });
      if (an.connected(legNode(c, s, 'TRIG')!, rule.trig)) passed.push(`TRIG ligado ao ${pinNice(rule.trig)}.`);
      else problems.push({ message: `O pino TRIG do sensor deve ir ao ${pinNice(rule.trig)}.`, highlight: [s.id] });
      if (an.connected(legNode(c, s, 'ECHO')!, rule.echo)) passed.push(`ECHO ligado ao ${pinNice(rule.echo)}.`);
      else problems.push({ message: `O pino ECHO do sensor deve ir ao ${pinNice(rule.echo)}.`, highlight: [s.id] });
      break;
    }
  }
  // remove problemas repetidos
  const seen = new Set<string>();
  const uniq = problems.filter((p) => (seen.has(p.message) ? false : (seen.add(p.message), true)));
  return { ok: uniq.length === 0, passed, problems: uniq };
}

export function runRules(c: Circuit, rules: Rule[]): CheckResult {
  const all = rules.map((r) => runRule(c, r));
  const seen = new Set<string>();
  const problems = all.flatMap((r) => r.problems).filter((p) => (seen.has(p.message) ? false : (seen.add(p.message), true)));
  return { ok: problems.length === 0, passed: all.flatMap((r) => r.passed), problems };
}
