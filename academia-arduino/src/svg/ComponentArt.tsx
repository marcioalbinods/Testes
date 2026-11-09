/** Ilustrações (vista realista simplificada) e símbolos elétricos dos componentes da enciclopédia. */
import type { ReactNode } from 'react';
import { Buzzer, Led, Ldr, Pot, Resistor, Button, PartsDefs } from './Parts';
import { ArduinoUnoSvg } from './ArduinoUno';
import { BreadboardSvg } from './Breadboard';

const Frame = ({ vb, children, label }: { vb: string; children: ReactNode; label: string }) => (
  <svg viewBox={vb} role="img" aria-label={label}>
    <PartsDefs />
    {children}
  </svg>
);

const Lbl = ({ x, y, t, a = 'middle' }: { x: number; y: number; t: string; a?: 'middle' | 'start' | 'end' }) => (
  <text x={x} y={y} fontSize="6" textAnchor={a} fill="#3c4766" fontFamily="var(--font-head)" fontWeight="600">{t}</text>
);

export function ComponentArt({ id, labels = false }: { id: string; labels?: boolean }) {
  switch (id) {
    case 'arduino': return <ArduinoUnoSvg className="" />;
    case 'protoboard': return <BreadboardSvg cfg={{ railsSplit: false }} view="top" labels={labels} />;
    case 'jumper':
      return (
        <Frame vb="0 0 120 70" label="Jumpers">
          {[['#e03131', 10], ['#2b2b33', 25], ['#16a34a', 40]].map(([c, y]) => (
            <g key={String(c)}>
              <path d={`M14 ${Number(y) + 10} C 40 ${Number(y) - 10}, 80 ${Number(y) + 30}, 106 ${Number(y) + 10}`} stroke={String(c)} strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <rect x="6" y={Number(y) + 7} width="9" height="6" rx="1" fill="#555" /><rect x="105" y={Number(y) + 7} width="9" height="6" rx="1" fill="#555" />
              <rect x="1" y={Number(y) + 9} width="5" height="2" fill="#c9a227" /><rect x="114" y={Number(y) + 9} width="5" height="2" fill="#c9a227" />
            </g>
          ))}
        </Frame>
      );
    case 'led':
      return (
        <Frame vb="-30 -34 60 62" label="LED">
          <Led a={{ x: -5, y: 22 }} k={{ x: 5, y: 22 }} color="red" b={0.8} />
          {labels && <><Lbl x={-12} y={27} t="ânodo +" a="end" /><Lbl x={12} y={27} t="cátodo −" a="start" /></>}
        </Frame>
      );
    case 'resistor':
      return <Frame vb="-30 -12 60 24" label="Resistor"><Resistor a={{ x: -25, y: 0 }} b={{ x: 25, y: 0 }} ohms={220} /></Frame>;
    case 'button':
      return <Frame vb="-22 -22 44 44" label="Botão"><Button legs={{ '1a': { x: -10, y: -13 }, '2a': { x: 10, y: -13 }, '1b': { x: -10, y: 13 }, '2b': { x: 10, y: 13 } }} pressed={false} /></Frame>;
    case 'buzzer':
      return <Frame vb="-24 -22 48 40" label="Buzzer"><Buzzer p={{ x: -15, y: 10 }} n={{ x: 15, y: 10 }} sound={false} /></Frame>;
    case 'pot':
      return <Frame vb="-30 -30 60 40" label="Potenciômetro"><Pot a={{ x: -20, y: 6 }} w={{ x: 0, y: 6 }} c={{ x: 20, y: 6 }} pos={0.35} /></Frame>;
    case 'ldr':
      return <Frame vb="-22 -26 44 36" label="LDR"><Ldr a={{ x: -10, y: 6 }} b={{ x: 10, y: 6 }} light={0.6} /></Frame>;
    case 'servo':
      return (
        <Frame vb="-50 -30 100 60" label="Servo motor">
          <rect x="-34" y="-14" width="56" height="28" rx="3" fill="#2f6bff" stroke="#163c9a" />
          <rect x="-42" y="-5" width="72" height="10" rx="2" fill="#2459d8" stroke="#163c9a" />
          <circle cx="8" cy="0" r="8" fill="#e9ecf3" stroke="#8a93a5" />
          <path d="M8 -3 L34 -1.5 a1.6 1.6 0 0 1 0 3 L8 3 z" fill="#fff" stroke="#8a93a5" strokeWidth=".8" transform="rotate(-30 8 0)" />
          <path d="M-34 6 C -44 14, -40 22, -48 26" stroke="#6b3d1f" strokeWidth="2" fill="none" />
          <path d="M-34 8 C -42 16, -36 24, -44 28" stroke="#d62f2f" strokeWidth="2" fill="none" />
          <path d="M-34 10 C -40 18, -32 26, -40 30" stroke="#f08a12" strokeWidth="2" fill="none" />
          <text x="-26" y="11" fontSize="5" fill="#cfe0ff" fontFamily="var(--font-head)">SG90</text>
        </Frame>
      );
    case 'ultrasonic':
      return (
        <Frame vb="-50 -26 100 56" label="Sensor ultrassônico">
          <rect x="-46" y="-22" width="92" height="40" rx="3" fill="#2a64d6" stroke="#173f94" />
          {[-22, 22].map((dx) => (
            <g key={dx}><circle cx={dx} cy="-2" r="14" fill="#d9dde6" stroke="#8d95a5" /><circle cx={dx} cy="-2" r="9.5" fill="url(#mesh)" /></g>
          ))}
          {['VCC', 'Trig', 'Echo', 'GND'].map((n, i) => (
            <g key={n}><line x1={-15 + i * 10} y1="18" x2={-15 + i * 10} y2="28" stroke="#b9bfca" strokeWidth="1.6" /><text x={-15 + i * 10} y="16" fontSize="3.4" fill="#fff" textAnchor="middle">{n}</text></g>
          ))}
          <text x="0" y="-16" fontSize="5" fill="#fff" textAnchor="middle" fontFamily="var(--font-head)">HC-SR04</text>
        </Frame>
      );
    case 'temp':
      return (
        <Frame vb="-24 -24 48 54" label="Sensor de temperatura LM35">
          <path d="M-12 4 V-10 a12 12 0 0 1 24 0 V4 z" fill="#2b2f3a" />
          <text x="0" y="-4" fontSize="5" fill="#ccd" textAnchor="middle" fontFamily="var(--font-code)">LM35</text>
          {[-6, 0, 6].map((x) => <line key={x} x1={x} y1="4" x2={x} y2="24" stroke="#b9bfca" strokeWidth="1.6" />)}
          {labels && ['+Vs', 'Vout', 'GND'].map((t, i) => <text key={t} x={-6 + i * 6} y={29} fontSize="3.4" textAnchor="middle" fill="#3c4766" fontFamily="var(--font-head)">{t}</text>)}
        </Frame>
      );
    case 'lcd':
      return (
        <Frame vb="-60 -26 120 52" label="Display LCD 16x2">
          <rect x="-58" y="-24" width="116" height="48" rx="3" fill="#1f7a3e" stroke="#0f4f27" />
          <rect x="-50" y="-16" width="100" height="32" rx="2" fill="#262b33" />
          <rect x="-46" y="-12" width="92" height="24" fill="#7ec8ff" />
          <text x="-42" y="-2" fontSize="8" fill="#0b2a52" fontFamily="var(--font-code)">Ola, Arduino!</text>
          <text x="-42" y="8" fontSize="8" fill="#0b2a52" fontFamily="var(--font-code)">Temp: 25 C</text>
          {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={-50 + i * 4} y="-23" width="2.4" height="2.4" fill="#d4af37" />)}
        </Frame>
      );
    case 'motor':
      return (
        <Frame vb="-40 -26 80 52" label="Motor DC">
          <rect x="-28" y="-16" width="44" height="32" rx="12" fill="#c7cdd8" stroke="#7d8597" />
          <rect x="-28" y="-16" width="10" height="32" rx="4" fill="#e9c46a" stroke="#a88a32" />
          <rect x="16" y="-2.5" width="18" height="5" rx="2" fill="#9aa3b5" />
          <path d="M-28 -6 h-8 M-28 6 h-8" stroke="#d62f2f" strokeWidth="2" />
          <path d="M-28 6 h-8" stroke="#2b2b33" strokeWidth="2" />
        </Frame>
      );
    case 'transistor':
      return (
        <Frame vb="-24 -24 48 54" label="Transistor BC547">
          <path d="M-12 4 V-10 a12 12 0 0 1 24 0 V4 z" fill="#2b2f3a" />
          <text x="0" y="-4" fontSize="4.6" fill="#ccd" textAnchor="middle" fontFamily="var(--font-code)">BC547</text>
          {[-6, 0, 6].map((x) => <line key={x} x1={x} y1="4" x2={x} y2="24" stroke="#b9bfca" strokeWidth="1.6" />)}
          {labels && <><Lbl x={-6} y={30} t="C" /><Lbl x={0} y={30} t="B" /><Lbl x={6} y={30} t="E" /></>}
        </Frame>
      );
    case 'diode':
      return (
        <Frame vb="-34 -10 68 20" label="Diodo">
          <line x1="-32" y1="0" x2="32" y2="0" stroke="#b9bfca" strokeWidth="1.6" />
          <rect x="-11" y="-5" width="22" height="10" rx="2" fill="#262830" />
          <rect x="6" y="-5" width="3" height="10" fill="#d9dde6" />
          {labels && <><Lbl x={-26} y={-4} t="ânodo" /><Lbl x={26} y={-4} t="cátodo" /></>}
        </Frame>
      );
  }
  return null;
}

/** Símbolo elétrico (esquemático). */
export function Symbol({ id }: { id: string }) {
  const s = { stroke: '#17203a', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const wrap = (c: ReactNode, label: string) => <svg viewBox="0 0 100 50" width="160" height="80" role="img" aria-label={`Símbolo: ${label}`}>{c}</svg>;
  switch (id) {
    case 'resistor': return wrap(<g {...s}><path d="M5 25 H25 l4 -9 l8 18 l8 -18 l8 18 l8 -18 l8 18 l4 -9 H95" /></g>, 'resistor');
    case 'led': return wrap(<g {...s}><path d="M5 25 H38 M62 25 H95 M38 10 V40 L62 25 Z M62 10 V40" /><path d="M58 8 l8 -8 M64 12 l8 -8 M66 0 h-4 M66 0 v4 M72 4 h-4 M72 4 v4" /></g>, 'LED');
    case 'diode': return wrap(<g {...s}><path d="M5 25 H38 M62 25 H95 M38 10 V40 L62 25 Z M62 10 V40" /></g>, 'diodo');
    case 'button': return wrap(<g {...s}><path d="M5 30 H30 M70 30 H95" /><circle cx="30" cy="30" r="2.5" /><circle cx="70" cy="30" r="2.5" /><path d="M26 20 H74 M50 20 V8 M42 8 H58" /></g>, 'botão');
    case 'buzzer': return wrap(<g {...s}><path d="M5 25 H35 M65 25 H95" /><path d="M35 15 H45 V35 H35 Z M45 15 L60 5 V45 L45 35" /><text x="30" y="12" fontSize="10" fill="#17203a" stroke="none">+</text></g>, 'buzzer');
    case 'pot': return wrap(<g {...s}><path d="M5 30 H25 l4 -9 l8 18 l8 -18 l8 18 l8 -18 l8 18 l4 -9 H95" /><path d="M50 2 V18 M44 12 L50 18 L56 12" /></g>, 'potenciômetro');
    case 'ldr': return wrap(<g {...s}><rect x="25" y="17" width="50" height="16" rx="2" /><path d="M5 25 H25 M75 25 H95" /><path d="M30 4 l8 8 M40 2 l8 8 M38 12 h-4 M38 12 v-4 M48 10 h-4 M48 10 v-4" /></g>, 'LDR');
    case 'motor': return wrap(<g {...s}><circle cx="50" cy="25" r="16" /><path d="M5 25 H34 M66 25 H95" /><text x="43" y="31" fontSize="16" fill="#17203a" stroke="none" fontFamily="var(--font-head)">M</text></g>, 'motor');
    case 'servo': return wrap(<g {...s}><rect x="30" y="10" width="40" height="30" rx="4" /><text x="40" y="30" fontSize="12" fill="#17203a" stroke="none" fontFamily="var(--font-head)">M</text><path d="M5 18 H30 M5 25 H30 M5 32 H30" /><path d="M62 18 l6 -6" /></g>, 'servo');
    case 'transistor': return wrap(<g {...s}><circle cx="55" cy="25" r="20" /><path d="M5 25 H45 M45 12 V38 M45 18 L68 6 M45 32 L68 44 M68 44 l-8 -1 M68 44 l-3 -7" /></g>, 'transistor NPN');
    case 'temp': return wrap(<g {...s}><rect x="30" y="8" width="40" height="34" rx="3" /><text x="36" y="30" fontSize="11" fill="#17203a" stroke="none" fontFamily="var(--font-code)">LM35</text><path d="M5 15 H30 M5 25 H30 M5 35 H30" /></g>, 'sensor de temperatura');
    case 'jumper': return wrap(<g {...s}><path d="M5 25 H95" /><circle cx="5" cy="25" r="3" fill="#17203a" /><circle cx="95" cy="25" r="3" fill="#17203a" /></g>, 'fio');
  }
  return null;
}
