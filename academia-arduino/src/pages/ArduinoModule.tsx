/** Módulo 1 — Conhecendo o Arduino: placa interativa, "Explore os pinos" e testes. */
import { useState } from 'react';
import { Cpu, MousePointerClick } from 'lucide-react';
import { ArduinoUnoSvg, type BoardPartId } from '../svg/ArduinoUno';
import { BOARD_PARTS, partInfo, pinInfo } from '../data/arduinoParts';
import { ARDUINO_UNO, pinLabel, type BoardPin } from '../lib/arduino';
import { useProgress } from '../lib/progress';
import { Modal, PageHead, Quiz, Tabs, type QuizQuestion } from '../components/ui';
import { MascotSays } from '../svg/Mascot';
import { ArduinoFind } from '../components/activities';

const PIN_QUIZ: QuizQuestion[] = [
  { q: 'Você quer ligar um LED que pisca. Em qual tipo de pino?', options: ['Pino digital (ex.: 13)', 'Pino GND', 'Pino VIN'], correct: 0, explain: 'Os pinos digitais podem ser saídas que ligam e desligam o LED.' },
  { q: 'Para ler a posição de um potenciômetro, qual pino usar?', options: ['A0 (analógico)', '5V', 'RESET'], correct: 0, explain: 'Os pinos A0 a A5 medem tensões de 0 a 5 V.' },
  { q: 'Qual destes pinos pode controlar o brilho de um LED com analogWrite?', options: ['Pino 7', 'Pino 9 (~)', 'Pino 4'], correct: 1, explain: 'Só os pinos com ~ (3, 5, 6, 9, 10, 11) têm PWM.' },
  { q: 'A perna curta (cátodo) do LED vai ligada, no final do caminho, a qual pino?', options: ['5V', 'GND', 'A5'], correct: 1, explain: 'O caminho da corrente termina no GND (negativo).' },
  { q: 'Os pinos digitais funcionam como…', options: ['Somente entrada', 'Somente saída', 'Entrada OU saída, conforme o pinMode'], correct: 2, explain: 'O pinMode decide: INPUT, INPUT_PULLUP ou OUTPUT.' },
  { q: 'Por que é melhor evitar os pinos 0 e 1?', options: ['Porque são usados pela comunicação USB com o computador', 'Porque não existem', 'Porque são de 12 V'], correct: 0, explain: '0 (RX) e 1 (TX) são usados para enviar o programa e as mensagens do Serial.' },
];

const GROUP_LEGEND = [
  { color: '#3a6cf4', name: 'Digitais: entrada ou saída (0 a 13)' },
  { color: '#c9a8ff', name: 'Contorno lilás: também fazem PWM (~)' },
  { color: '#16b862', name: 'Analógicos: entradas (A0 a A5)' },
  { color: '#e5484d', name: 'Energia: 5V, 3.3V, VIN' },
  { color: '#2b2f3a', name: 'GND: negativo (0 V)' },
  { color: '#8a93ad', name: 'Outros: RESET, AREF, IOREF, SDA, SCL' },
];

export function ArduinoPage() {
  const [tab, setTab] = useState<'placa' | 'pinos' | 'teste'>('placa');
  const { state, markSeen, reward, bump } = useProgress();
  const [part, setPart] = useState<BoardPartId | null>(null);
  const [hover, setHover] = useState<BoardPartId | null>(null);
  const [pin, setPin] = useState<BoardPin | null>(null);
  const seen = state.seen.arduinoParts ?? [];

  const openPart = (id: BoardPartId) => {
    setPart(id);
    markSeen('arduinoParts', id);
  };

  return (
    <div className="stack">
      <PageHead icon={<Cpu size={30} />} color="#00878f" title="Conhecendo o Arduino" subtitle="Explore a placa Arduino Uno R3: clique nas partes, descubra a função de cada pino e teste seus conhecimentos." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'placa', label: 'Arduino interativo' },
          { id: 'pinos', label: 'Explore os pinos' },
          { id: 'teste', label: 'Testes rápidos' },
        ]}
      />

      {tab === 'placa' && (
        <div className="split">
          <div className="card">
            <div className="row between mb">
              <span className="chip"><MousePointerClick size={14} /> Clique em uma parte da placa</span>
              <span className="chip green">{seen.length} de 12 partes descobertas</span>
            </div>
            <div className="proto-stage">
              <ArduinoUnoSvg onPart={openPart} highlightPart={hover} />
            </div>
          </div>
          <div className="card">
            <h3>Partes da placa</h3>
            <div className="grid" style={{ gap: 6 }}>
              {BOARD_PARTS.map((p) => (
                <button
                  key={p.id}
                  className="option"
                  style={{ minHeight: 44, padding: '8px 10px' }}
                  onClick={() => openPart(p.id)}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(p.id)}
                  onBlur={() => setHover(null)}
                >
                  <span className="letter" style={{ background: seen.includes(p.id) ? 'var(--green-500)' : undefined, color: seen.includes(p.id) ? '#fff' : undefined }}>{seen.includes(p.id) ? '✓' : '?'}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'pinos' && (
        <div className="split">
          <div className="card">
            <p className="muted">Toque em qualquer pino (os quadradinhos das barras pretas). As cores mostram o tipo de cada pino.</p>
            <div className="proto-stage">
              <ArduinoUnoSvg colorPins onPin={(p) => { setPin(p); bump('pinsExplored'); }} highlightPins={pin ? [pin.id] : []} />
            </div>
            <div className="grid cols-3 mt" style={{ gap: 8 }}>
              {GROUP_LEGEND.map((g) => (
                <div key={g.name} className="row small" style={{ gap: 8, flexWrap: 'nowrap' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: g.color, flex: '0 0 18px' }} />{g.name}
                </div>
              ))}
            </div>
          </div>
          <div className="info-panel" aria-live="polite">
            {pin ? (
              <>
                <h3>{pinLabel(pin.id)} {pin.label && <code style={{ background: '#2b3570', color: '#ffd166' }}>{pin.label}</code>}</h3>
                <InfoRow title="Função" text={pinInfo(pin.id).role} />
                <InfoRow title="O que conectar" text={pinInfo(pin.id).connect} />
                <InfoRow title="Tipo de sinal" text={pinInfo(pin.id).signal} />
                <InfoRow title="Exemplo" text={pinInfo(pin.id).examples} code />
                <p className="small muted" style={{ marginTop: 10 }}>
                  {pin.group === 'digital' ? '↔ Pode ser ENTRADA ou SAÍDA.' : pin.group === 'analog' ? '→ ENTRADA analógica (também pode ser digital).' : pin.group === 'power' ? '⚡ Pino de ENERGIA.' : pin.group === 'gnd' ? '⏚ Referência (negativo).' : 'Pino especial.'}
                </p>
              </>
            ) : (
              <>
                <h3>Explore os pinos</h3>
                <p className="muted">Escolha um pino na placa para ver sua função, o que pode ser ligado nele e o tipo de sinal.</p>
                <p className="muted small">A placa tem {ARDUINO_UNO.pins.filter((p) => p.group === 'digital').length} pinos digitais, 6 analógicos e vários pinos de energia.</p>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'teste' && (
        <div className="grid cols-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h2>Encontre na placa</h2>
            <ArduinoFind
              targets={[
                { part: 'gnd', prompt: 'Onde está um pino GND?', explain: 'GND é o negativo.' },
                { part: 'analog', prompt: 'Onde ficam as entradas analógicas?', explain: 'A0 a A5, na barra de baixo à direita.' },
                { part: 'reset-btn', prompt: 'Onde fica o botão que reinicia o programa?', explain: 'O botão de reset fica perto da USB.' },
                { part: 'leds', prompt: 'Onde estão os LEDs indicadores?', explain: 'ON, L, TX e RX.' },
                { part: 'jack', prompt: 'Onde se liga uma fonte externa?', explain: 'No conector de alimentação (7 a 12 V).' },
                { part: '3v3', prompt: 'Encontre o pino de 3,3 volts.', explain: 'O 3.3V fica ao lado do 5V.' },
              ]}
              onDone={() => reward('arduino:find', 30, 'Você encontrou todas as partes!')}
            />
          </div>
          <div className="card">
            <h2>Qual pino usar?</h2>
            <Quiz questions={PIN_QUIZ} onComplete={() => reward('arduino:pinquiz', 30, 'Teste dos pinos concluído')} onWrong={() => bump('retries')} />
          </div>
        </div>
      )}

      {part && <PartModal id={part} onClose={() => setPart(null)} />}
    </div>
  );
}

function InfoRow({ title, text, code }: { title: string; text: string; code?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="small" style={{ color: '#ffd166', fontFamily: 'var(--font-head)', fontWeight: 700 }}>{title}</div>
      {code ? <code style={{ background: '#2b3570', color: '#e6e9ff', display: 'inline-block' }}>{text}</code> : <div>{text}</div>}
    </div>
  );
}

function PartModal({ id, onClose }: { id: BoardPartId; onClose: () => void }) {
  const p = partInfo(id);
  return (
    <Modal title={p.name} onClose={onClose} wide>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="proto-stage"><ArduinoUnoSvg highlightPart={id} colorPins={['digital', 'analog', 'gnd', '5v', '3v3', 'vin', 'reset-pin'].includes(id)} /></div>
        <div className="stack" style={{ gap: 10 }}>
          <span className="chip purple" style={{ width: 'fit-content' }}>{p.kind}</span>
          <Section t="Para que serve" v={p.what} />
          <Section t="Como funciona" v={p.how} />
          <Section t="Onde é utilizado" v={p.where} />
          <Section t="Exemplo prático" v={p.example} />
          <MascotSays mood="wow" size={56}><strong>Curiosidade:</strong> {p.curiosity}</MascotSays>
        </div>
      </div>
    </Modal>
  );
}

const Section = ({ t, v }: { t: string; v: string }) => (
  <div>
    <h4 style={{ marginBottom: 2, color: 'var(--blue-700)' }}>{t}</h4>
    <p style={{ margin: 0 }}>{v}</p>
  </div>
);
