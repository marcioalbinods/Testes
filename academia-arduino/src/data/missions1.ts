/** Missões 01 a 10 — Níveis 1 (Primeiros passos) e 2 (Primeiros comandos). */
import { C_BLINK13, C_BUTTON, C_LED_FAULTY, C_LED_RAILS, C_RAILS, C_TRAFFIC, C_TWO_LEDS } from './circuits';
import type { BuildStep, Mission } from './missionTypes';
import { emptyCircuit } from '../lib/circuit/types';

export const SAFE_BASE = [
  'Monte e altere o circuito sempre com o cabo USB DESLIGADO do computador.',
  'Antes de ligar, peça para um colega ou para o professor conferir a montagem.',
  'Nunca ligue o 5V diretamente no GND: isso é um curto-circuito.',
];
const SAFE_LED = [...SAFE_BASE, 'Todo LED precisa de um resistor em série (220 Ω ou 330 Ω).'];

export const PIN_NAMES: Record<string, string> = { D13: 'pino 13', D12: 'pino 12', D11: 'pino 11', D9: 'pino 9', D8: 'pino 8' };

/** Passos de montagem de um LED com resistor controlado por um pino (padrão das missões). */
export function ledSteps(prefix: string, pin: string, c: number, color: string, railCol: number): BuildStep[] {
  return [
    { text: `Coloque o resistor de 220 Ω (vermelho, vermelho, marrom) nos furos b${c} e b${c + 4}.`, add: [`${prefix}r`], tip: 'O resistor não tem lado certo: pode virar à vontade.' },
    { text: `Coloque o LED ${color}: perna LONGA (ânodo, +) no furo c${c + 4}, no mesmo grupo da perna do resistor, e perna CURTA (cátodo, −) no furo c${c + 5}.`, add: [`${prefix}l`], tip: 'O lado chato da “cabeça” do LED fica do lado do cátodo (perna curta).' },
    { text: `Ligue um fio do ${PIN_NAMES[pin] ?? pin} da placa até o furo a${c}.`, add: [`${prefix}w1`] },
    { text: `Ligue um fio preto do furo d${c + 5} (perna curta do LED) até o trilho negativo (−, linha azul).`, add: [`${prefix}w2`], tip: `Pode ser qualquer furo do trilho azul — por exemplo, o da coluna ${railCol}.` },
  ];
}
const GND_TOP_STEP: BuildStep = { text: 'Ligue um fio preto do pino GND da placa (ao lado do pino 13) até o trilho negativo de cima (−, linha azul).', add: ['gt'] };

export const MISSIONS_1: Mission[] = [
  {
    n: 1, id: 'm1', level: 1, title: 'Conhecendo o Arduino', icon: '🔌', xp: 100,
    objective: 'Identificar as principais partes da placa Arduino Uno e encontrar os pinos GND, 5V e digitais.',
    goals: ['Identificar os principais componentes da placa.', 'Encontrar os pinos GND, 5V e digitais.', 'Compreender para que serve a placa.'],
    intro: [
      'O Arduino é uma pequena placa com um "cérebro" eletrônico chamado microcontrolador. Ele segue as instruções que nós escrevemos: acender luzes, tocar sons, ler sensores e mover motores.',
      'Pense no Arduino como o cérebro de um robô: os sensores são os olhos e ouvidos, e os LEDs, buzzers e motores são a voz e os músculos.',
      'Nesta missão você vai explorar a placa Arduino Uno e descobrir para que serve cada parte.',
    ],
    ideas: [
      { title: 'Microcontrolador', text: 'É o "cérebro". Guarda o programa e decide o que fazer.' },
      { title: 'Pinos', text: 'São os furinhos pretos nas bordas. Neles ligamos os fios dos componentes.' },
      { title: 'USB', text: 'Por ele o Arduino recebe energia e o programa do computador.' },
    ],
    materials: [{ item: 'Placa Arduino Uno', qty: '1' }, { item: 'Cabo USB', qty: '1' }],
    safety: ['Segure a placa pelas bordas e evite tocar nos componentes com os dedos.', 'Não coloque a placa sobre objetos de metal (clipes, moedas, estojo de metal): podem causar curto-circuito.', 'Ao terminar, desconecte o cabo USB puxando pelo conector, não pelo fio.'],
    activity: {
      type: 'arduino-find',
      intro: 'Encontre cada parte na placa e clique nela. Se errar, o Faísca dá uma dica!',
      targets: [
        { part: 'usb', prompt: 'Onde o cabo USB é conectado?', explain: 'A porta USB traz energia e o programa do computador.' },
        { part: 'micro', prompt: 'Onde fica o microcontrolador, o "cérebro" da placa?', explain: 'É o chip grande e comprido: ATmega328P.' },
        { part: '5v', prompt: 'Encontre o pino 5V.', explain: 'O pino 5V fornece energia (5 volts) para os componentes.' },
        { part: 'gnd', prompt: 'Encontre um pino GND.', explain: 'GND é o negativo, o "caminho de volta" da eletricidade. A placa tem 3 pinos GND.' },
        { part: 'digital', prompt: 'Encontre os pinos digitais.', explain: 'Os pinos digitais (0 a 13) ligam e desligam LEDs ou leem botões.' },
      ],
    },
    quiz: [
      { q: 'Qual parte é o "cérebro" do Arduino, que guarda e executa o programa?', options: ['A porta USB', 'O microcontrolador', 'O botão de reset', 'O conector de alimentação'], correct: 1, explain: 'O microcontrolador (ATmega328P) guarda o programa e executa as instruções.' },
      { q: 'O que significa GND?', options: ['Um pino que liga LEDs automaticamente', 'O negativo do circuito, o caminho de volta da corrente', 'Uma porta para o cabo USB', 'Um tipo de sensor'], correct: 1, explain: 'GND (do inglês ground, "terra") é o negativo: 0 volt. Todo circuito precisa voltar ao GND.' },
      { q: 'Quantos pinos digitais (numerados) o Arduino Uno tem?', options: ['6', '10', '14 (de 0 a 13)', '20'], correct: 2, explain: 'São 14 pinos digitais, numerados de 0 a 13. Seis deles (com ~) também fazem PWM.' },
      { q: 'Para que serve o botão de reset?', options: ['Para apagar o programa da placa', 'Para recomeçar o programa do início', 'Para desligar o computador', 'Para aumentar a energia'], correct: 1, explain: 'O reset faz o programa começar de novo, do início. O programa NÃO é apagado.' },
    ],
    challenge: {
      text: 'Com a placa real nas mãos, encontre: os 3 pinos GND, o pino 5V, o pino 3.3V e o LED "L". Mostre para um colega e explique para que serve cada um.',
      hint: 'Dois GND ficam na barra de baixo, junto com 5V e 3.3V. O terceiro GND fica em cima, ao lado do pino 13.',
      solution: 'GND: dois na barra POWER (embaixo) e um ao lado do pino 13 (em cima). 5V e 3.3V: barra POWER. LED L: perto do pino 13, ligado a esse pino.',
    },
    teacher: {
      minutes: 50,
      tips: ['Distribua uma placa por dupla e peça para desenharem a placa no caderno, marcando 5V, GND e pinos digitais.', 'Use a analogia do corpo humano: cérebro (microcontrolador), boca/olhos (pinos), alimento (energia USB).'],
      difficulties: ['Confundir 5V com VIN.', 'Achar que existe só um GND.', 'Pensar que o botão de reset apaga o programa.'],
    },
  },
  {
    n: 2, id: 'm2', level: 1, title: 'Explorando a protoboard', icon: '🧩', xp: 100,
    objective: 'Entender como os furos da protoboard são ligados por dentro.',
    goals: ['Entender os grupos de 5 furos.', 'Conhecer os trilhos de alimentação.', 'Entender o canal central.'],
    intro: [
      'A protoboard (ou matriz de contatos) serve para montar circuitos sem solda: é só encaixar as pernas dos componentes nos furos.',
      'O segredo: por baixo dos furos existem tiras de metal que ligam alguns furos entre si. Na parte do meio, cada coluna tem dois grupos de 5 furos ligados (a–e e f–j).',
      'Nas bordas ficam os trilhos de alimentação (+ vermelho e − azul), que são ligados ao longo de toda a placa. No meio há o canal central, que separa as duas metades.',
    ],
    ideas: [
      { title: 'Grupo de 5', text: 'Os furos a, b, c, d, e da mesma coluna estão ligados. O mesmo vale para f, g, h, i, j.' },
      { title: 'Trilhos', text: 'As fileiras com + e − são ligadas de ponta a ponta. Usamos para 5V e GND.' },
      { title: 'Canal central', text: 'O vão do meio NÃO tem ligação. Ele separa os lados de cima e de baixo.' },
    ],
    materials: [{ item: 'Protoboard', qty: '1' }],
    safety: ['Encaixe as pernas dos componentes com cuidado, sem forçar, para não entortar os contatos internos.', 'Não coloque objetos de metal soltos (clipes, grampos) nos furos.'],
    activity: {
      type: 'proto-quiz',
      intro: 'Para cada par de furos destacados, responda: eles estão ligados por dentro da protoboard?',
      items: [
        { a: 'a3', b: 'e3', connected: true, explain: 'a3 e e3 ficam na mesma coluna e na mesma metade: mesmo grupo de 5.' },
        { a: 'c7', b: 'c8', connected: false, explain: 'Colunas diferentes (7 e 8) são grupos diferentes.' },
        { a: 'e12', b: 'f12', connected: false, explain: 'O canal central separa e12 (metade de cima) de f12 (metade de baixo).' },
        { a: 'tp-3', b: 'tp-27', connected: true, explain: 'Os dois estão no mesmo trilho positivo, que vai de ponta a ponta.' },
        { a: 'tp-5', b: 'tn-5', connected: false, explain: 'O trilho + e o trilho − são tiras diferentes. Ainda bem: senão seria um curto!' },
        { a: 'g20', b: 'j20', connected: true, explain: 'g20 e j20 estão no mesmo grupo de 5 (f a j da coluna 20).' },
      ],
    },
    quiz: [
      { q: 'Quais furos estão ligados ao furo b10?', options: ['Todos da linha b', 'a10, c10, d10 e e10', 'f10, g10, h10, i10 e j10', 'Nenhum'], correct: 1, explain: 'b10 faz parte do grupo de 5 da coluna 10 na metade de cima: a10 a e10.' },
      { q: 'Os furos e5 e f5 estão ligados?', options: ['Sim, estão na mesma coluna', 'Não, o canal central separa os dois'], correct: 1, explain: 'O canal central não tem ligação: a metade de cima e a de baixo são separadas.' },
      { q: 'Para que servem os trilhos com + e −?', options: ['Para decorar a protoboard', 'Para distribuir a alimentação (5V e GND) por toda a placa', 'Para ligar a protoboard na tomada', 'Para guardar componentes'], correct: 1, explain: 'Ligamos o 5V no trilho + e o GND no trilho −. Assim temos energia em qualquer ponto da placa.' },
      { q: 'Posso colocar as duas pernas de um LED no mesmo grupo de 5 furos?', options: ['Sim, assim ele acende mais', 'Não, as duas pernas ficariam ligadas juntas e o LED não acenderia'], correct: 1, explain: 'No mesmo grupo, as duas pernas estão ligadas pelo metal: a corrente passa pelo metal e não pelo LED.' },
    ],
    challenge: {
      text: 'No Laboratório da Protoboard, ligue a opção "trilhos interrompidos" e descubra: o furo do trilho + da coluna 3 está ligado ao da coluna 27?',
      hint: 'Clique em um furo do trilho e veja até onde vai o destaque colorido.',
      solution: 'Não. Em protoboards com trilho interrompido no meio, a metade esquerda do trilho não se liga à direita. É preciso colocar um fio (jumper) ligando as duas metades.',
    },
    teacher: {
      minutes: 50,
      tips: ['Se possível, mostre uma protoboard com a fita adesiva de baixo removida, para ver as tiras de metal.', 'Projete o modo "Ver por dentro" do laboratório e peça para os estudantes preverem antes de clicar.', 'Verifique se as protoboards da escola têm trilhos interrompidos no meio (há uma falha na linha vermelha/azul).'],
      difficulties: ['Achar que os furos de uma mesma LINHA (letra) são ligados.', 'Esquecer que o canal central separa as metades.', 'Não saber que alguns trilhos são interrompidos.'],
    },
  },
  {
    n: 3, id: 'm3', level: 1, title: 'Positivo e negativo', icon: '🔋', xp: 100,
    objective: 'Levar a energia da placa (5V e GND) até os trilhos da protoboard usando jumpers.',
    goals: ['Entender alimentação elétrica.', 'Conhecer 5V e GND.', 'Aprender a utilizar os jumpers.'],
    intro: [
      'Para um componente funcionar, a eletricidade precisa sair do positivo (+), passar pelo componente e voltar para o negativo (−). Esse caminho completo se chama circuito.',
      'No Arduino, o pino 5V é o positivo e o GND é o negativo. Vamos usar fios chamados jumpers para levar o 5V até o trilho + e o GND até o trilho − da protoboard.',
      'Combinado de cores: fio VERMELHO para o 5V e fio PRETO para o GND. Isso evita confusões!',
    ],
    ideas: [
      { title: 'Tensão (V)', text: 'É a "força" que empurra a eletricidade. O pino 5V empurra com 5 volts.' },
      { title: 'Jumper', text: 'Fio com pontas rígidas, feito para encaixar na protoboard e nos pinos.' },
    ],
    materials: [{ item: 'Placa Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard', qty: '1' }, { item: 'Jumper vermelho (macho-macho)', qty: '1' }, { item: 'Jumper preto (macho-macho)', qty: '1' }],
    safety: [...SAFE_BASE, 'Ligar 5V e GND no mesmo trilho é um curto-circuito: a placa pode esquentar e o fusível da USB desliga.'],
    circuit: C_RAILS,
    steps: [
      { text: 'Com o USB desligado, ligue um jumper VERMELHO do pino 5V da placa até um furo do trilho positivo (+, linha vermelha) da protoboard.', add: ['p5'] },
      { text: 'Ligue um jumper PRETO de um pino GND da placa até um furo do trilho negativo (−, linha azul).', add: ['pg'], tip: 'Agora todo o trilho + tem 5V e todo o trilho − é GND.' },
    ],
    activity: {
      type: 'build',
      intro: 'Na bancada virtual, use a ferramenta Fio para ligar o 5V ao trilho + e o GND ao trilho −. Depois clique em "Verificar montagem".',
      start: emptyCircuit(),
      palette: [],
      rules: [{ type: 'rails' }],
      hint: 'Os pinos 5V e GND ficam na barra POWER, na parte de baixo da placa.',
    },
    quiz: [
      { q: 'Qual pino do Arduino fornece o positivo de 5 volts?', options: ['GND', '5V', 'A0', 'RESET'], correct: 1, explain: 'O pino 5V fornece 5 volts. É o "positivo" dos nossos circuitos.' },
      { q: 'Qual cor de fio combinamos usar para o GND?', options: ['Vermelho', 'Amarelo', 'Preto', 'Qualquer uma, a cor muda a eletricidade'], correct: 2, explain: 'A cor do fio não muda a eletricidade, mas o combinado (preto = GND) ajuda a não errar.' },
      { q: 'O que acontece se ligarmos um fio direto do 5V ao GND?', options: ['Nada', 'Um curto-circuito: muita corrente, aquecimento e risco de estragar a placa', 'O LED acende mais forte', 'O Arduino fica mais rápido'], correct: 1, explain: 'Sem nenhum componente no caminho, a corrente fica enorme. Isso é um curto-circuito. Nunca faça!' },
      { q: 'Por que ligamos os trilhos à placa?', options: ['Para ter 5V e GND disponíveis em vários pontos da protoboard', 'Para a protoboard ficar mais bonita', 'Para programar a placa'], correct: 0, explain: 'Com os trilhos alimentados, podemos pegar 5V e GND em qualquer lugar da protoboard.' },
    ],
    challenge: {
      text: 'Alimente também os trilhos de CIMA da protoboard, usando só mais dois fios curtos (sem voltar à placa).',
      hint: 'Um fio liga o trilho + de baixo ao + de cima. Outro liga o − de baixo ao − de cima.',
      solution: 'Ligue um jumper vermelho entre o trilho + de baixo e o trilho + de cima, e um jumper preto entre o trilho − de baixo e o − de cima. Cuidado para não cruzar + com −!',
    },
    teacher: {
      minutes: 50,
      tips: ['Reforce o combinado de cores com um cartaz na sala: vermelho = 5V, preto = GND.', 'Peça para as duplas falarem em voz alta "fio vermelho no 5V, fio preto no GND" antes de ligar.'],
      difficulties: ['Ligar o 5V no trilho azul (−).', 'Usar o pino VIN ou 3.3V no lugar do 5V.', 'Encaixar o jumper no furo errado do trilho (outro trilho).'],
    },
  },
  {
    n: 4, id: 'm4', level: 1, title: 'Conhecendo o LED', icon: '💡', xp: 100,
    objective: 'Identificar o ânodo e o cátodo do LED e entender por que ele precisa de um resistor.',
    goals: ['Identificar ânodo e cátodo.', 'Entender polaridade.', 'Conhecer o resistor.', 'Entender por que o resistor é necessário.'],
    intro: [
      'O LED é uma pequena lâmpada que acende quando a corrente passa por ele no sentido certo. Ele tem polaridade: uma perna é o + e a outra é o −.',
      'A perna LONGA é o ânodo (+). A perna CURTA é o cátodo (−). A borda da "cabeça" do LED também tem um lado chato, do lado do cátodo.',
      'O resistor é um componente que dificulta a passagem da corrente. Sem ele, passaria corrente demais e o LED (e até o pino do Arduino) poderia queimar. Usamos 220 Ω ou 330 Ω.',
    ],
    ideas: [
      { title: 'Polaridade', text: 'O LED só acende em um sentido: do ânodo (+) para o cátodo (−).' },
      { title: 'Resistor', text: 'Limita a corrente, como um registro que deixa passar só um pouco de água.' },
      { title: 'Em série', text: 'Resistor e LED um depois do outro, no mesmo caminho.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard', qty: '1' }, { item: 'LED vermelho', qty: '1' }, { item: 'Resistor de 220 Ω (vermelho, vermelho, marrom)', qty: '1' }, { item: 'Jumpers', qty: '4' }],
    safety: SAFE_LED,
    circuit: C_LED_RAILS,
    steps: [
      { text: 'Ligue o 5V ao trilho + e o GND ao trilho − (como na Missão 03).', add: ['p5', 'pg'] },
      { text: 'Coloque o resistor de 220 Ω nos furos g5 e g9.', add: ['r1'] },
      { text: 'Coloque o LED: perna LONGA (ânodo) no furo h9 — mesmo grupo do resistor — e perna CURTA (cátodo) no furo h10.', add: ['l1'] },
      { text: 'Ligue um fio vermelho do trilho + até o furo j5 (grupo da outra perna do resistor).', add: ['w3'] },
      { text: 'Ligue um fio preto do furo j10 (grupo do cátodo) até o trilho −. Confira tudo e ligue o USB!', add: ['w4'], tip: 'Caminho: 5V → resistor → LED → GND.' },
    ],
    activity: {
      type: 'build',
      intro: 'Os trilhos já estão alimentados. Coloque um resistor e um LED e ligue tudo para o LED acender. Use "Ligar USB" para testar e "Verificar montagem" para conferir.',
      start: C_RAILS,
      palette: ['led', 'resistor'],
      rules: [{ type: 'ledPowered' }],
      hint: 'A perna longa do LED fica no mesmo grupo de 5 que uma perna do resistor. A outra perna do resistor vai ao +; a perna curta do LED vai ao −.',
    },
    quiz: [
      { q: 'Qual perna do LED é o ânodo (+)?', options: ['A perna curta', 'A perna longa', 'Tanto faz'], correct: 1, explain: 'A perna longa é o ânodo (+). A curta é o cátodo (−).' },
      { q: 'O que acontece se o LED for colocado ao contrário?', options: ['Ele queima na hora', 'Ele não acende, mas também não estraga (com 5V)', 'Ele acende de outra cor'], correct: 1, explain: 'Invertido, o LED não deixa a corrente passar e fica apagado. É só desvirar.' },
      { q: 'Por que usamos um resistor junto com o LED?', options: ['Para o LED piscar', 'Para limitar a corrente e proteger o LED e a placa', 'Para mudar a cor do LED', 'Não precisa de resistor'], correct: 1, explain: 'O resistor limita a corrente. Sem ele, a corrente ficaria alta demais.' },
      { q: 'Quais são as cores de um resistor de 220 Ω?', options: ['Marrom, preto, laranja', 'Vermelho, vermelho, marrom', 'Amarelo, violeta, vermelho'], correct: 1, explain: 'Vermelho (2), vermelho (2), marrom (×10) = 220 Ω.' },
    ],
    challenge: {
      text: 'Troque o resistor de 220 Ω por um de 1 kΩ (marrom, preto, vermelho). O que acontece com o brilho do LED? Por quê?',
      hint: 'Um resistor maior deixa passar mais ou menos corrente?',
      solution: 'O LED fica mais fraco: um resistor maior deixa passar menos corrente. Na bancada virtual dá para ver a corrente cair de cerca de 13 mA para cerca de 3 mA.',
    },
    teacher: {
      minutes: 50,
      tips: ['Mostre um LED de perto: perna longa, perna curta e o lado chato.', 'Se um LED tiver as pernas cortadas no mesmo tamanho, use o lado chato da borda para achar o cátodo.'],
      difficulties: ['Colocar as duas pernas do LED no mesmo grupo de 5.', 'Esquecer o resistor.', 'Inverter o LED.'],
    },
  },
  {
    n: 5, id: 'm5', level: 1, title: 'Meu primeiro circuito', icon: '⚡', xp: 100,
    objective: 'Montar um circuito completo, alimentá-lo e encontrar erros de montagem.',
    goals: ['Montar um circuito completo.', 'Conectar corretamente o LED e o resistor.', 'Alimentar o circuito.', 'Observar o LED acender.'],
    intro: [
      'Agora você vai montar sozinho o circuito completo e também virar um detetive: encontrar e corrigir erros em uma montagem.',
      'Lembre do caminho da eletricidade: ela sai do 5V, passa pelo resistor, passa pelo LED (do ânodo para o cátodo) e volta para o GND. Se o caminho estiver interrompido em qualquer ponto, o LED não acende. Isso é um circuito aberto.',
    ],
    ideas: [
      { title: 'Circuito fechado', text: 'O caminho está completo: a corrente circula e o LED acende.' },
      { title: 'Circuito aberto', text: 'Falta uma ligação: a corrente não circula.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard', qty: '1' }, { item: 'LED', qty: '1' }, { item: 'Resistor de 220 Ω', qty: '1' }, { item: 'Jumpers', qty: '4' }],
    safety: SAFE_LED,
    circuit: C_LED_RAILS,
    steps: [
      { text: 'Alimente os trilhos: 5V no + e GND no −.', add: ['p5', 'pg'] },
      { text: 'Resistor de 220 Ω nos furos g5 e g9.', add: ['r1'] },
      { text: 'LED com a perna longa em h9 e a curta em h10.', add: ['l1'] },
      { text: 'Fio do trilho + até j5.', add: ['w3'] },
      { text: 'Fio do furo j10 até o trilho −. Ligue o USB e veja o LED acender!', add: ['w4'] },
    ],
    activity: {
      type: 'build',
      intro: 'Esta montagem tem DOIS erros. Ligue o USB, observe, encontre os erros e corrija. Depois clique em "Verificar montagem".',
      start: C_LED_FAULTY,
      palette: ['led', 'resistor'],
      rules: [{ type: 'ledPowered' }],
      hint: 'Selecione o LED e veja onde está cada perna. Depois siga o caminho até o GND: falta alguma coisa?',
    },
    quiz: [
      { q: 'O LED não acendeu. Qual é a PRIMEIRA coisa a fazer antes de mexer no circuito?', options: ['Puxar todos os fios rapidamente', 'Desligar o cabo USB', 'Trocar a placa'], correct: 1, explain: 'Sempre desligue a alimentação antes de alterar as conexões.' },
      { q: 'O que é um circuito aberto?', options: ['Um circuito sem tampa', 'Um circuito com o caminho interrompido, onde a corrente não circula', 'Um circuito com muitos LEDs'], correct: 1, explain: 'Se falta uma ligação, a corrente não tem por onde voltar: o circuito está aberto.' },
      { q: 'Neste circuito, o resistor pode ficar antes ou depois do LED?', options: ['Só antes', 'Só depois', 'Tanto faz: em série, a corrente é a mesma'], correct: 2, explain: 'Em série, a mesma corrente passa pelos dois. O resistor protege o LED nas duas posições.' },
    ],
    challenge: {
      text: 'Monte um segundo LED, de outra cor, também alimentado pelos trilhos, com seu próprio resistor. Os dois devem acender juntos.',
      hint: 'Repita o mesmo caminho em outras colunas: + → resistor → LED → −.',
      solution: 'Cada LED precisa de seu próprio resistor. Exemplo: resistor em g18–g22, LED em h22 (longa) e h23 (curta), fio do + até j18 e fio de j23 até o −.',
    },
    teacher: {
      minutes: 50,
      tips: ['Peça às duplas para traçarem com o dedo o caminho da corrente antes de ligar.', 'Mostre o "Caminho da eletricidade" na bancada virtual para discutir circuito aberto e fechado.'],
      difficulties: ['Esquecer o fio do GND.', 'LED invertido.', 'Fio no furo vizinho (coluna errada).'],
    },
  },
  {
    n: 6, id: 'm6', level: 2, title: 'O Arduino também programa!', icon: '🧠', xp: 120,
    objective: 'Conhecer o Arduino IDE e a estrutura básica de um programa: setup() e loop().',
    goals: ['Conhecer o Arduino IDE.', 'Entender o que é um programa.', 'Conhecer a estrutura básica de um código.'],
    intro: [
      'Um programa é uma lista de instruções, escrita em uma ordem certa, que o Arduino segue sem se cansar. Escrevemos o programa no computador, no Arduino IDE, e enviamos para a placa pelo cabo USB.',
      'Todo programa do Arduino tem duas partes: o setup(), que roda UMA vez quando a placa liga, e o loop(), que se repete PARA SEMPRE.',
      'No Arduino IDE: escreva o código, clique em ✔ (Verificar) para procurar erros e em ➜ (Carregar) para enviar à placa. Antes, escolha a placa "Arduino Uno" e a porta USB no menu Ferramentas.',
    ],
    ideas: [
      { title: 'setup()', text: 'Preparação. Roda uma vez, como arrumar a mochila antes da aula.' },
      { title: 'loop()', text: 'Repetição. Roda sem parar, como o coração batendo.' },
      { title: '{ } e ;', text: 'As chaves guardam as instruções de cada parte. O ponto e vírgula termina cada instrução.' },
    ],
    materials: [{ item: 'Computador com Arduino IDE', qty: '1' }, { item: 'Arduino Uno + cabo USB', qty: '1' }],
    safety: ['Conecte o cabo USB com cuidado, sem forçar o encaixe.', 'Não coloque a placa ligada sobre superfícies de metal.'],
    code: `// Meu primeiro programa
// Abra o Monitor Serial (lupa no canto do Arduino IDE) para ver as mensagens.

void setup() {
  // Tudo aqui dentro roda UMA vez, quando a placa liga.
  Serial.begin(9600);
  Serial.println("Ola! Eu sou o Arduino.");
}

void loop() {
  // Tudo aqui dentro se repete PARA SEMPRE.
  Serial.println("Estou funcionando...");
  delay(2000);
}`,
    codeExplain: [
      { code: '// texto', text: 'Comentário: anotação para pessoas. O Arduino ignora tudo depois de //.' },
      { code: 'void setup() { }', text: 'Parte de preparação: roda uma vez.' },
      { code: 'Serial.begin(9600);', text: 'Liga a conversa com o computador na velocidade 9600.' },
      { code: 'Serial.println("...");', text: 'Escreve uma mensagem no Monitor Serial.' },
      { code: 'void loop() { }', text: 'Parte que se repete para sempre.' },
      { code: 'delay(2000);', text: 'Espera 2000 milissegundos (2 segundos).' },
    ],
    activity: {
      type: 'code-order',
      intro: 'As linhas do programa ficaram embaralhadas! Arraste (ou use as setas) para colocar na ordem certa.',
      lines: ['void setup() {', '  Serial.begin(9600);', '  Serial.println("Ola!");', '}', 'void loop() {', '  Serial.println("Funcionando");', '  delay(2000);', '}'],
    },
    quiz: [
      { q: 'Quantas vezes o código dentro de setup() é executado?', options: ['Nenhuma', 'Uma vez, quando a placa liga', 'Para sempre'], correct: 1, explain: 'O setup() roda uma única vez, no começo.' },
      { q: 'E o código dentro de loop()?', options: ['Uma vez', 'Duas vezes', 'Repete para sempre, enquanto a placa estiver ligada'], correct: 2, explain: 'O loop() recomeça assim que termina, sem parar.' },
      { q: 'Para que serve o ponto e vírgula ( ; )?', options: ['Para enfeitar', 'Para terminar cada instrução', 'Para começar um comentário'], correct: 1, explain: 'O ; avisa onde termina cada instrução, como o ponto final de uma frase.' },
      { q: 'O que o Arduino faz com o texto depois de // ?', options: ['Executa como comando', 'Ignora: é um comentário para pessoas lerem', 'Mostra na tela'], correct: 1, explain: 'Comentários ajudam a explicar o código e não são executados.' },
    ],
    challenge: {
      text: 'Mude o programa para mostrar seu apelido (ou o nome da equipe) no Monitor Serial e para escrever a mensagem do loop a cada 1 segundo.',
      hint: 'Troque o texto entre aspas e o número dentro do delay().',
      solution: 'Serial.println("Equipe Faísca"); no setup() e delay(1000); no loop().',
      solutionCode: `void setup() {\n  Serial.begin(9600);\n  Serial.println("Equipe Faisca");\n}\n\nvoid loop() {\n  Serial.println("Estou funcionando...");\n  delay(1000);\n}`,
    },
    teacher: {
      minutes: 50,
      tips: ['Antes da aula, instale o Arduino IDE e teste a porta USB em cada computador.', 'Faça os estudantes "executarem" o programa como robôs: um lê o setup uma vez e o loop várias vezes.', 'Se a sala não tiver placas suficientes, use o simulador desta plataforma.'],
      difficulties: ['Esquecer de selecionar a placa e a porta no Arduino IDE.', 'Apagar uma chave { } ou um ;.', 'Escrever setup com letra maiúscula (Setup).'],
    },
  },
  {
    n: 7, id: 'm7', level: 2, title: 'Fazendo o LED piscar', icon: '✨', xp: 120,
    objective: 'Programar o Arduino para acender e apagar um LED usando pinMode, digitalWrite e delay.',
    goals: ['Usar setup() e loop().', 'Configurar um pino com pinMode().', 'Ligar e desligar com digitalWrite().', 'Controlar o tempo com delay().'],
    intro: [
      'Agora o LED vai ser controlado pelo programa! Em vez de ligar o LED no 5V, vamos ligá-lo em um pino digital: o pino 13.',
      'No programa, dizemos que o pino 13 é uma SAÍDA (OUTPUT). Depois mandamos o pino ficar em HIGH (5 V, LED aceso) ou LOW (0 V, LED apagado), esperando um tempo entre uma coisa e outra.',
      'Curiosidade: o LED "L" da própria placa também é ligado ao pino 13. Ele vai piscar junto!',
    ],
    ideas: [
      { title: 'pinMode(13, OUTPUT)', text: 'Avisa que o pino 13 vai ser uma saída.' },
      { title: 'digitalWrite(13, HIGH)', text: 'Liga o pino 13: 5 volts saem por ele.' },
      { title: 'delay(1000)', text: 'Espera 1000 milissegundos = 1 segundo.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard', qty: '1' }, { item: 'LED vermelho', qty: '1' }, { item: 'Resistor de 220 Ω', qty: '1' }, { item: 'Jumpers', qty: '3' }],
    safety: SAFE_LED,
    circuit: C_BLINK13,
    steps: [GND_TOP_STEP, ...ledSteps('a', 'D13', 2, 'vermelho', 6)],
    code: `// Missão 07 — Fazendo o LED piscar
// LED (com resistor de 220 Ω) ligado ao pino 13

void setup() {
  pinMode(13, OUTPUT);      // o pino 13 será uma SAÍDA
}

void loop() {
  digitalWrite(13, HIGH);   // liga o pino 13 (5 V): LED aceso
  delay(1000);              // espera 1000 ms = 1 segundo
  digitalWrite(13, LOW);    // desliga o pino 13 (0 V): LED apagado
  delay(1000);              // espera mais 1 segundo
}`,
    codeExplain: [
      { code: 'pinMode(13, OUTPUT);', text: 'Configura o pino 13 como saída. Fica no setup(), porque basta fazer uma vez.' },
      { code: 'digitalWrite(13, HIGH);', text: 'HIGH = alto = 5 V. A corrente sai do pino, passa pelo resistor e pelo LED e volta pelo GND.' },
      { code: 'delay(1000);', text: 'O Arduino espera 1 segundo com o LED aceso.' },
      { code: 'digitalWrite(13, LOW);', text: 'LOW = baixo = 0 V. Sem tensão, o LED apaga.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o LED com resistor no pino 13. Ligue o USB para ver o programa rodando e verifique a montagem.',
      start: emptyCircuit(),
      palette: ['led', 'resistor'],
      rules: [{ type: 'ledPin', pin: 'D13' }],
      hint: 'Caminho: pino 13 → resistor → perna longa do LED → perna curta → GND.',
    },
    quiz: [
      { q: 'O que faz pinMode(13, OUTPUT)?', options: ['Acende o LED', 'Configura o pino 13 como saída', 'Lê o pino 13'], correct: 1, explain: 'pinMode só configura. Quem liga e desliga é o digitalWrite.' },
      { q: 'Se trocarmos delay(1000) por delay(250), o LED vai piscar…', options: ['mais devagar', 'mais rápido', 'do mesmo jeito'], correct: 1, explain: '250 ms é menos tempo de espera: o LED pisca 4 vezes mais rápido.' },
      { q: 'O que significa LOW no digitalWrite?', options: ['5 volts', '0 volt (desligado)', 'Metade do brilho'], correct: 1, explain: 'LOW = 0 V. HIGH = 5 V.' },
      { q: 'Por que o pinMode fica no setup() e não no loop()?', options: ['Porque basta configurar o pino uma vez', 'Porque no loop dá erro', 'Porque o loop não roda'], correct: 0, explain: 'A configuração não muda: fazer uma vez no setup() é suficiente.' },
    ],
    challenge: {
      text: 'Faça o LED piscar como um sinal de SOS em código Morse: 3 piscadas curtas, 3 longas e 3 curtas.',
      hint: 'Curta: aceso 200 ms. Longa: aceso 600 ms. Entre piscadas, apagado 200 ms.',
      solution: 'Repita digitalWrite HIGH / delay / digitalWrite LOW / delay com tempos curtos (200) e longos (600). Na Missão 16 você vai aprender a usar o for para não repetir tanto!',
      solutionCode: `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  // S: 3 curtas\n  digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200);\n  digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200);\n  digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200);\n  // O: 3 longas\n  digitalWrite(13, HIGH); delay(600); digitalWrite(13, LOW); delay(200);\n  digitalWrite(13, HIGH); delay(600); digitalWrite(13, LOW); delay(200);\n  digitalWrite(13, HIGH); delay(600); digitalWrite(13, LOW); delay(200);\n  // S: 3 curtas\n  digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200);\n  digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200);\n  digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200);\n  delay(1500);\n}`,
    },
    teacher: {
      minutes: 50,
      tips: ['Mostre que o LED L da placa pisca junto com o LED da protoboard (ambos no pino 13).', 'Peça para mudarem só o delay e preverem o resultado antes de enviar.'],
      difficulties: ['Esquecer o pinMode: o LED fica muito fraco.', 'Faltar ; no fim das linhas.', 'Erro de upload por porta não selecionada.'],
    },
  },
  {
    n: 8, id: 'm8', level: 2, title: 'Controlando dois LEDs', icon: '🚦', xp: 120,
    objective: 'Ligar dois LEDs em pinos diferentes e controlar cada um separadamente.',
    goals: ['Conectar dois LEDs em pinos diferentes.', 'Controlar cada LED individualmente.', 'Compreender HIGH e LOW.'],
    intro: [
      'Cada pino digital pode controlar um LED diferente. Com dois LEDs (pinos 13 e 12), podemos acender um, apagar o outro, e criar efeitos.',
      'Cada LED continua precisando do seu próprio resistor. Os dois cátodos (pernas curtas) podem ir para o mesmo trilho −, que está ligado ao GND.',
    ],
    ideas: [
      { title: 'HIGH', text: 'Pino ligado: 5 V. O LED daquele pino acende.' },
      { title: 'LOW', text: 'Pino desligado: 0 V. O LED daquele pino apaga.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard', qty: '1' }, { item: 'LED vermelho e LED verde', qty: '2' }, { item: 'Resistores de 220 Ω', qty: '2' }, { item: 'Jumpers', qty: '5' }],
    safety: SAFE_LED,
    circuit: C_TWO_LEDS,
    steps: [GND_TOP_STEP, ...ledSteps('a', 'D13', 2, 'vermelho', 6), ...ledSteps('b', 'D12', 11, 'verde', 13)],
    code: `// Missão 08 — Controlando dois LEDs
// LED vermelho no pino 13 e LED verde no pino 12 (cada um com resistor de 220 Ω)

void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);   // vermelho aceso
  digitalWrite(12, LOW);    // verde apagado
  delay(500);
  digitalWrite(13, LOW);    // vermelho apagado
  digitalWrite(12, HIGH);   // verde aceso
  delay(500);
}`,
    codeExplain: [
      { code: 'pinMode(12, OUTPUT);', text: 'Cada pino usado como saída precisa do seu pinMode.' },
      { code: 'digitalWrite(13, HIGH);\ndigitalWrite(12, LOW);', text: 'Um aceso e outro apagado ao mesmo tempo. As duas instruções são tão rápidas que parecem simultâneas.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o LED vermelho no pino 13 e o LED verde no pino 12. Ligue o USB e veja a alternância.',
      start: emptyCircuit(),
      palette: ['led', 'resistor'],
      rules: [{ type: 'ledPin', pin: 'D13', color: 'red' }, { type: 'ledPin', pin: 'D12', color: 'green' }],
      hint: 'Selecione um LED para trocar a cor. Faça dois caminhos iguais em colunas diferentes.',
    },
    quiz: [
      { q: 'Dois LEDs podem usar o mesmo resistor no lugar de um resistor para cada?', options: ['É melhor cada LED ter o seu resistor', 'Não precisa de resistor com dois LEDs'], correct: 0, explain: 'Cada LED com seu resistor garante a corrente certa em cada um.' },
      { q: 'No código, o que faz o LED verde acender?', options: ['digitalWrite(12, HIGH);', 'digitalWrite(13, HIGH);', 'pinMode(12, OUTPUT);'], correct: 0, explain: 'O verde está no pino 12: digitalWrite(12, HIGH) o acende.' },
      { q: 'Para os dois LEDs ficarem acesos juntos, o que precisa estar no código?', options: ['Os dois pinos em HIGH ao mesmo tempo', 'Um pino em HIGH e o outro em LOW', 'Só o pinMode'], correct: 0, explain: 'Com os dois pinos em HIGH, os dois LEDs acendem.' },
    ],
    challenge: {
      text: 'Crie uma sequência luminosa: os dois acesos, os dois apagados, só o vermelho, só o verde — e repita.',
      hint: 'Escreva cada "quadro" da sequência com dois digitalWrite e um delay.',
      solution: 'Quatro blocos de dois digitalWrite + delay, um para cada momento da sequência.',
      solutionCode: `void setup() {\n  pinMode(13, OUTPUT);\n  pinMode(12, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH); digitalWrite(12, HIGH); delay(400);  // os dois\n  digitalWrite(13, LOW);  digitalWrite(12, LOW);  delay(400);  // nenhum\n  digitalWrite(13, HIGH); digitalWrite(12, LOW);  delay(400);  // vermelho\n  digitalWrite(13, LOW);  digitalWrite(12, HIGH); delay(400);  // verde\n}`,
    },
    teacher: {
      minutes: 50,
      tips: ['Proponha que cada dupla invente uma sequência e a desafie a outra dupla a adivinhar o padrão.'],
      difficulties: ['Trocar os números dos pinos no código e na montagem.', 'Usar um único resistor para os dois LEDs.'],
    },
  },
  {
    n: 9, id: 'm9', level: 2, title: 'Criando um semáforo', icon: '🚥', xp: 120,
    objective: 'Programar uma sequência com três LEDs, como um semáforo de verdade.',
    goals: ['Utilizar três LEDs.', 'Programar uma sequência.', 'Alterar os intervalos.', 'Entender a ordem das instruções.'],
    intro: [
      'O semáforo segue sempre a mesma ordem: verde (siga), amarelo (atenção) e vermelho (pare). O Arduino executa as instruções de cima para baixo, uma de cada vez, e é essa ordem que cria a sequência.',
      'Vamos usar o vermelho no pino 13, o amarelo no 12 e o verde no 11.',
    ],
    ideas: [
      { title: 'Sequência', text: 'O programa roda as linhas na ordem em que foram escritas.' },
      { title: 'Intervalos', text: 'Os números no delay definem quanto tempo cada luz fica acesa.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard', qty: '1' }, { item: 'LEDs vermelho, amarelo e verde', qty: '3' }, { item: 'Resistores de 220 Ω', qty: '3' }, { item: 'Jumpers', qty: '7' }],
    safety: SAFE_LED,
    circuit: C_TRAFFIC,
    steps: [GND_TOP_STEP, ...ledSteps('a', 'D13', 2, 'vermelho', 6), ...ledSteps('b', 'D12', 11, 'amarelo', 13), ...ledSteps('c', 'D11', 20, 'verde', 25)],
    code: `// Missão 09 — Semáforo
// Vermelho no pino 13, amarelo no 12, verde no 11

void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  // VERDE: os carros podem passar
  digitalWrite(11, HIGH);
  delay(4000);
  digitalWrite(11, LOW);

  // AMARELO: atenção!
  digitalWrite(12, HIGH);
  delay(1500);
  digitalWrite(12, LOW);

  // VERMELHO: pare
  digitalWrite(13, HIGH);
  delay(4000);
  digitalWrite(13, LOW);
}`,
    codeExplain: [
      { code: 'digitalWrite(11, HIGH);\ndelay(4000);\ndigitalWrite(11, LOW);', text: 'Acende o verde, espera 4 segundos e apaga. Depois o programa passa para o amarelo.' },
      { code: 'delay(1500);', text: 'O amarelo fica menos tempo: 1,5 segundo.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte os três LEDs nos pinos certos: vermelho no 13, amarelo no 12 e verde no 11.',
      start: emptyCircuit(),
      palette: ['led', 'resistor'],
      rules: [{ type: 'ledPin', pin: 'D13', color: 'red' }, { type: 'ledPin', pin: 'D12', color: 'yellow' }, { type: 'ledPin', pin: 'D11', color: 'green' }],
      hint: 'Faça três caminhos iguais: pino → resistor → LED → trilho −. Não esqueça o fio do GND até o trilho −.',
    },
    quiz: [
      { q: 'Se você trocar a ordem dos blocos do código, o que acontece?', options: ['Nada muda', 'A ordem das cores do semáforo muda', 'O programa para de funcionar'], correct: 1, explain: 'O Arduino executa na ordem escrita. Mudar a ordem muda a sequência.' },
      { q: 'Para o verde ficar aceso 6 segundos, o que mudar?', options: ['delay(4000) do verde para delay(6000)', 'pinMode(11, OUTPUT)', 'digitalWrite(11, LOW)'], correct: 0, explain: '6 segundos = 6000 milissegundos.' },
      { q: 'Quanto tempo dura um ciclo completo deste semáforo?', options: ['4 segundos', '9,5 segundos', '15 segundos'], correct: 1, explain: '4000 + 1500 + 4000 = 9500 ms = 9,5 segundos.' },
    ],
    challenge: {
      text: 'Crie um semáforo de pedestres: quando o vermelho dos carros acender, o verde de pedestres (outro LED) acende junto.',
      hint: 'Use mais um pino (por exemplo, o 10) e acenda-o junto com o pino 13.',
      solution: 'Adicione um LED no pino 10 com resistor, pinMode(10, OUTPUT) e digitalWrite(10, HIGH) logo depois de digitalWrite(13, HIGH) (e LOW junto com o 13).',
    },
    teacher: {
      minutes: 60,
      tips: ['Discuta o semáforo do bairro da escola: quanto tempo dura cada cor?', 'Desafie as equipes a cronometrarem o ciclo com um relógio.'],
      difficulties: ['LED de cor diferente no pino errado.', 'Esquecer de apagar uma cor antes de acender a próxima.'],
    },
  },
  {
    n: 10, id: 'm10', level: 2, title: 'O botão mágico', icon: '🔘', xp: 120,
    objective: 'Ler um botão com digitalRead() usando INPUT_PULLUP.',
    goals: ['Conhecer o push button.', 'Entender o funcionamento de um botão.', 'Aprender INPUT e INPUT_PULLUP.', 'Utilizar digitalRead().'],
    intro: [
      'Até agora os pinos foram SAÍDAS. Agora um pino vai ser ENTRADA: o Arduino vai "sentir" se o botão está apertado.',
      'O botão (push button) tem 4 pernas. As pernas que ficam em lados opostos do canal central já são ligadas por dentro. Ao apertar, o lado esquerdo se liga ao lado direito.',
      'Com INPUT_PULLUP, o Arduino liga o pino ao 5V por um resistor interno. Botão solto: o pino lê HIGH. Botão apertado: o pino fica ligado ao GND e lê LOW. É ao contrário do que muita gente espera!',
    ],
    ideas: [
      { title: 'INPUT', text: 'Entrada simples. Sem um resistor, o pino fica "flutuando" e a leitura muda sozinha.' },
      { title: 'INPUT_PULLUP', text: 'Entrada com resistor interno ao 5V: solto = HIGH, apertado = LOW.' },
      { title: 'digitalRead(2)', text: 'Lê o pino 2 e devolve HIGH ou LOW.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard', qty: '1' }, { item: 'Push button (botão de 4 pernas)', qty: '1' }, { item: 'LED + resistor de 220 Ω', qty: '1' }, { item: 'Jumpers', qty: '5' }],
    safety: [...SAFE_LED, 'Com INPUT_PULLUP não é preciso ligar o botão ao 5V: ligue só no pino e no GND.'],
    circuit: C_BUTTON,
    steps: [
      GND_TOP_STEP,
      ...ledSteps('a', 'D13', 2, 'vermelho', 6),
      { text: 'Coloque o botão sobre o canal central: pernas em e20, e22, f20 e f22.', add: ['bt'], tip: 'Se o botão não encaixar, gire-o 90 graus: as pernas mais afastadas atravessam o canal.' },
      { text: 'Ligue um fio do pino 2 até o furo a20 (lado esquerdo do botão).', add: ['bw1'] },
      { text: 'Ligue um fio preto do furo a22 (lado direito do botão) até o trilho −.', add: ['bw2'], tip: 'Pino e GND em lados DIFERENTES do botão: apertar liga um ao outro.' },
    ],
    code: `// Missão 10 — O botão mágico
// Botão: uma perna no pino 2 e a do outro lado no GND. LED com resistor no pino 13.

void setup() {
  pinMode(2, INPUT_PULLUP);  // entrada com resistor interno ligado ao 5 V
  pinMode(13, OUTPUT);       // saída para o LED
}

void loop() {
  // digitalRead(2) devolve HIGH com o botão solto e LOW com o botão apertado.
  // O LED recebe o mesmo valor lido no botão:
  digitalWrite(13, digitalRead(2));
}`,
    codeExplain: [
      { code: 'pinMode(2, INPUT_PULLUP);', text: 'O pino 2 vira entrada, com um resistor interno ligado ao 5V.' },
      { code: 'digitalRead(2)', text: 'Lê o botão: HIGH (solto) ou LOW (apertado).' },
      { code: 'digitalWrite(13, digitalRead(2));', text: 'O LED copia a leitura: aceso com o botão solto, apagado ao apertar. Teste e veja!' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o botão no pino 2 (e GND) e o LED no pino 13. Ligue o USB e toque no botão para apertá-lo.',
      start: emptyCircuit(),
      palette: ['button', 'led', 'resistor'],
      rules: [{ type: 'buttonPin', pin: 'D2' }, { type: 'ledPin', pin: 'D13' }],
      hint: 'O botão fica sobre o canal. Ligue o pino 2 em uma perna e o GND na perna do OUTRO lado do botão.',
    },
    quiz: [
      { q: 'Com INPUT_PULLUP, o que digitalRead lê quando o botão está SOLTO?', options: ['LOW', 'HIGH', 'Um número de 0 a 1023'], correct: 1, explain: 'O resistor interno mantém o pino em HIGH enquanto o botão está solto.' },
      { q: 'E quando o botão está APERTADO?', options: ['LOW, porque o pino fica ligado ao GND', 'HIGH', 'O Arduino desliga'], correct: 0, explain: 'Apertado, o botão liga o pino ao GND: a leitura é LOW.' },
      { q: 'O que acontece com um pino em INPUT (sem pull-up) ligado só ao botão?', options: ['Ele fica "flutuando" e a leitura pode mudar sozinha', 'Ele sempre lê HIGH', 'Ele queima'], correct: 0, explain: 'Sem resistor, a entrada não tem um nível definido quando o botão está solto.' },
    ],
    challenge: {
      text: 'Faça o LED acender SOMENTE quando o botão for pressionado.',
      hint: 'O sinal ! inverte um valor: !HIGH vira LOW e !LOW vira HIGH. Na Missão 12 você vai aprender outra forma, com if.',
      solution: 'Use digitalWrite(13, !digitalRead(2)); — o ! inverte a leitura.',
      solutionCode: `void setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, !digitalRead(2));  // ! inverte: apertado (LOW) acende\n}`,
    },
    teacher: {
      minutes: 60,
      tips: ['Mostre o botão por baixo: as pernas são ligadas em pares.', 'Use a dica da diagonal: pino em uma perna e GND na perna diagonal oposta sempre funciona.'],
      difficulties: ['Ligar o pino e o GND do mesmo lado do botão (o botão não faz efeito).', 'Esperar HIGH ao apertar (com INPUT_PULLUP é LOW).', 'Botão fora do canal central.'],
    },
  },
];
