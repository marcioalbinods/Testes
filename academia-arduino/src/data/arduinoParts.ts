/** Informações das partes da placa Arduino Uno e de cada grupo de pinos. */
import type { BoardPartId } from '../svg/ArduinoUno';

export interface BoardPartInfo {
  id: BoardPartId;
  name: string;
  what: string;
  how: string;
  where: string;
  example: string;
  curiosity: string;
  /** entrada, saída, energia ou referência */
  kind: 'entrada/saída' | 'entrada' | 'energia' | 'referência' | 'controle' | 'indicador' | 'cérebro' | 'comunicação';
}

export const BOARD_PARTS: BoardPartInfo[] = [
  {
    id: 'micro', name: 'Microcontrolador (ATmega328P)', kind: 'cérebro',
    what: 'É o "cérebro" da placa. Guarda o programa e executa as instruções, uma de cada vez.',
    how: 'Dentro dele há um processador, uma memória para o programa (32 KB) e uma pequena memória para as variáveis. Ele trabalha a 16 milhões de passos por segundo (16 MHz).',
    where: 'Controla tudo: lê os pinos de entrada e liga ou desliga os pinos de saída.',
    example: 'Quando você escreve digitalWrite(13, HIGH), é o microcontrolador que liga o pino 13.',
    curiosity: 'Microcontroladores parecidos estão em micro-ondas, controles remotos, brinquedos e máquinas de lavar.',
  },
  {
    id: 'usb', name: 'Porta USB', kind: 'comunicação',
    what: 'Liga o Arduino ao computador.',
    how: 'Pelo cabo USB a placa recebe energia (5 V) e o programa. Também é por ele que o Arduino envia mensagens ao Monitor Serial.',
    where: 'Usada para programar e para alimentar a placa durante as aulas.',
    example: 'Ao clicar em "Carregar" no Arduino IDE, o programa viaja pelo cabo USB até o microcontrolador.',
    curiosity: 'A placa tem um fusível que se desliga sozinho se houver um curto-circuito, protegendo a porta USB do computador.',
  },
  {
    id: 'jack', name: 'Conector de alimentação', kind: 'energia',
    what: 'Entrada para uma fonte externa ou bateria.',
    how: 'Recebe de 7 V a 12 V (recomendado) e um regulador na placa transforma em 5 V.',
    where: 'Usado quando o projeto precisa funcionar longe do computador.',
    example: 'Um robô com bateria de 9 V conectada neste conector.',
    curiosity: 'Nunca use fontes de tomada sem orientação do professor. Use apenas fontes próprias para Arduino.',
  },
  {
    id: 'digital', name: 'Pinos digitais (0 a 13)', kind: 'entrada/saída',
    what: 'Pinos que trabalham com dois estados: ligado (HIGH, 5 V) ou desligado (LOW, 0 V).',
    how: 'Cada pino pode ser ENTRADA (para ler botões) ou SAÍDA (para acender LEDs). Quem escolhe é o pinMode(). Os pinos com ~ (3, 5, 6, 9, 10, 11) também fazem PWM.',
    where: 'LEDs, botões, buzzers, sinal de servos e sensores digitais.',
    example: 'Um LED com resistor no pino 13 pisca com digitalWrite.',
    curiosity: 'Os pinos 0 (RX) e 1 (TX) são usados pela comunicação USB. Evite usá-los nos projetos.',
  },
  {
    id: 'analog', name: 'Pinos analógicos (A0 a A5)', kind: 'entrada',
    what: 'Entradas que medem tensões entre 0 V e 5 V.',
    how: 'O analogRead() transforma a tensão em um número de 0 (0 V) a 1023 (5 V).',
    where: 'Potenciômetros, sensores de luz (LDR) e de temperatura.',
    example: 'analogRead(A0) lê a posição de um potenciômetro.',
    curiosity: 'Os pinos A0 a A5 também podem funcionar como pinos digitais (números 14 a 19).',
  },
  {
    id: 'gnd', name: 'Pinos GND', kind: 'referência',
    what: 'O negativo do circuito (0 V). É o caminho de volta da corrente.',
    how: 'Todo circuito precisa voltar ao GND. A placa tem três pinos GND, todos ligados entre si.',
    where: 'Perna curta dos LEDs, um lado dos botões, fio marrom do servo, GND dos sensores.',
    example: 'O trilho azul (−) da protoboard é ligado a um pino GND.',
    curiosity: 'GND vem do inglês ground, que significa "terra" ou "chão".',
  },
  {
    id: '5v', name: 'Pino 5V', kind: 'energia',
    what: 'Fornece 5 volts para alimentar componentes.',
    how: 'Quando a placa está ligada, este pino tem 5 V em relação ao GND.',
    where: 'Alimentação de sensores, do potenciômetro e de um micro servo pequeno.',
    example: 'O fio vermelho do 5V vai ao trilho + da protoboard.',
    curiosity: 'Ligar o 5V direto no GND causa um curto-circuito. Nunca faça isso!',
  },
  {
    id: '3v3', name: 'Pino 3.3V', kind: 'energia',
    what: 'Fornece 3,3 volts.',
    how: 'Um pequeno regulador gera 3,3 V. Ele aguenta pouca corrente (cerca de 50 mA).',
    where: 'Alguns sensores e módulos que trabalham com 3,3 V.',
    example: 'Módulos de rádio e alguns sensores modernos usam 3,3 V.',
    curiosity: 'Ligar um componente de 3,3 V no 5V pode estragá-lo. Leia sempre a etiqueta do módulo.',
  },
  {
    id: 'reset-pin', name: 'Pino RESET', kind: 'controle',
    what: 'Faz o mesmo que o botão de reset, mas por um fio.',
    how: 'Se este pino for ligado ao GND, o programa para; ao soltar, recomeça do início.',
    where: 'Usado para colocar um botão de reset fora da placa, por exemplo na caixa do projeto.',
    example: 'Um botão entre RESET e GND reinicia o Arduino.',
    curiosity: 'Normalmente este pino fica sem ligação.',
  },
  {
    id: 'reset-btn', name: 'Botão de reset', kind: 'controle',
    what: 'Botão que reinicia o programa.',
    how: 'Ao apertar, o microcontrolador para. Ao soltar, o programa começa de novo pelo setup(). O programa NÃO é apagado.',
    where: 'Útil para recomeçar um teste.',
    example: 'O semáforo volta a começar pelo verde depois do reset.',
    curiosity: 'Na placa Uno R3, o botão fica perto da porta USB.',
  },
  {
    id: 'leds', name: 'LEDs indicadores (ON, L, TX, RX)', kind: 'indicador',
    what: 'Pequenas luzes que mostram o que a placa está fazendo.',
    how: 'ON: placa ligada. L: ligado ao pino 13. TX e RX: piscam quando há comunicação pelo USB (envio e recebimento).',
    where: 'Ajudam a descobrir problemas: se o ON está apagado, a placa não está recebendo energia.',
    example: 'O programa do pisca-pisca no pino 13 faz o LED L piscar.',
    curiosity: 'TX vem de "transmitir" e RX de "receber".',
  },
  {
    id: 'vin', name: 'Pino VIN', kind: 'energia',
    what: 'Entrada de energia da fonte externa.',
    how: 'Recebe a mesma tensão do conector de alimentação (7 V a 12 V). Pode ser usado para alimentar a placa por fios.',
    where: 'Projetos com bateria ligada por fios.',
    example: 'Uma bateria com o + no VIN e o − no GND.',
    curiosity: 'Quando a placa está ligada só pelo USB, não use o VIN para alimentar componentes: prefira o 5V.',
  },
];

export const partInfo = (id: BoardPartId) => BOARD_PARTS.find((p) => p.id === id)!;

/** Informações por pino para a ferramenta "Explore os pinos". */
export interface PinInfo {
  role: string;
  connect: string;
  signal: string;
  examples: string;
}

export function pinInfo(pinId: string): PinInfo {
  const d = /^D(\d+)$/.exec(pinId);
  if (d) {
    const n = Number(d[1]);
    const pwm = [3, 5, 6, 9, 10, 11].includes(n);
    if (n === 0 || n === 1)
      return {
        role: `Pino digital ${n} (${n === 0 ? 'RX — recebe' : 'TX — envia'} dados pelo USB).`,
        connect: 'Evite usar: ele é ocupado pela comunicação com o computador.',
        signal: 'Digital: HIGH (5 V) ou LOW (0 V).',
        examples: 'Comunicação serial com o computador ou outros módulos.',
      };
    return {
      role: `Pino digital ${n}: pode ser entrada ou saída${pwm ? ' e também gerar PWM (~)' : ''}.${n === 13 ? ' O LED L da placa está ligado a ele.' : ''}${n === 2 || n === 3 ? ' Também aceita interrupções (avançado).' : ''}`,
      connect: `LED com resistor, botão, buzzer, sinal de servo${pwm ? ', LED com brilho controlado (PWM)' : ''}.`,
      signal: pwm ? 'Digital (HIGH/LOW) ou PWM com analogWrite (0 a 255).' : 'Digital: HIGH (5 V) ou LOW (0 V).',
      examples: pwm ? `analogWrite(${n}, 128); deixa um LED com brilho médio.` : `digitalWrite(${n}, HIGH); liga o pino.`,
    };
  }
  const a = /^A(\d)$/.exec(pinId);
  if (a)
    return {
      role: `Entrada analógica ${pinId}: mede tensões de 0 a 5 V.${pinId === 'A4' ? ' Também é o SDA (comunicação I2C).' : pinId === 'A5' ? ' Também é o SCL (comunicação I2C).' : ''}`,
      connect: 'Perna do meio do potenciômetro, divisor com LDR, sensor de temperatura LM35.',
      signal: 'Analógico: analogRead devolve de 0 a 1023. Também funciona como digital.',
      examples: `int valor = analogRead(${pinId});`,
    };
  const map: Record<string, PinInfo> = {
    '5V': { role: 'Saída de energia de 5 volts.', connect: 'Trilho + da protoboard, VCC de sensores, pontas do potenciômetro.', signal: 'Energia contínua: 5 V.', examples: 'Fio vermelho do 5V até o trilho +.' },
    '3V3': { role: 'Saída de energia de 3,3 volts (pouca corrente, ~50 mA).', connect: 'Sensores e módulos de 3,3 V.', signal: 'Energia contínua: 3,3 V.', examples: 'Alimentar um sensor que trabalha com 3,3 V.' },
    VIN: { role: 'Entrada de energia externa (7 a 12 V).', connect: 'Bateria ou fonte externa (com orientação do professor).', signal: 'Energia contínua.', examples: 'Robô alimentado por bateria.' },
    GND1: { role: 'GND: negativo, 0 V.', connect: 'Trilho − da protoboard, perna curta do LED, GND de sensores e servos.', signal: 'Referência: 0 V.', examples: 'Fio preto do GND até o trilho −.' },
    RESET: { role: 'Reinicia o programa quando ligado ao GND.', connect: 'Um botão externo de reset (outro lado no GND).', signal: 'Controle (fica em HIGH normalmente).', examples: 'Botão de reset na tampa do projeto.' },
    IOREF: { role: 'Informa a tensão de trabalho da placa (5 V no Uno) para placas de expansão (shields).', connect: 'Usado por shields. Normalmente não ligamos nada.', signal: 'Referência de tensão.', examples: 'Shields que funcionam em placas de 5 V e de 3,3 V.' },
    AREF: { role: 'Referência para as entradas analógicas (avançado).', connect: 'Normalmente fica sem ligação.', signal: 'Referência de tensão.', examples: 'Medições analógicas mais precisas em projetos avançados.' },
    SDA: { role: 'SDA: dados da comunicação I2C (o mesmo que A4).', connect: 'Displays LCD com módulo I2C, sensores I2C.', signal: 'Comunicação digital.', examples: 'Display LCD 16x2 com I2C.' },
    SCL: { role: 'SCL: relógio da comunicação I2C (o mesmo que A5).', connect: 'Displays LCD com módulo I2C, sensores I2C.', signal: 'Comunicação digital.', examples: 'Display LCD 16x2 com I2C.' },
    NC: { role: 'Sem ligação (reservado).', connect: 'Nada.', signal: '—', examples: '—' },
  };
  map.GND2 = map.GND1;
  map.GND3 = map.GND1;
  return map[pinId] ?? map.NC;
}
