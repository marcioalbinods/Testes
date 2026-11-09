/** Enciclopédia dos componentes (Módulo 6). */

export type Category = 'Placas' | 'Componentes passivos' | 'Componentes de entrada' | 'Componentes de saída' | 'Sensores' | 'Motores' | 'Semicondutores';
export const CATEGORIES: Category[] = ['Placas', 'Componentes passivos', 'Componentes de entrada', 'Componentes de saída', 'Sensores', 'Motores', 'Semicondutores'];

export interface ComponentEntry {
  id: string;
  name: string;
  cats: Category[];
  short: string;
  func: string;
  symbol: boolean;
  terminals: { name: string; desc: string }[];
  connect: string[];
  care: string[];
  uses: string[];
  activity: { label: string; to: string };
  keywords?: string;
}

export const COMPONENTS: ComponentEntry[] = [
  {
    id: 'arduino', name: 'Arduino Uno', cats: ['Placas'], symbol: false,
    short: 'Placa com microcontrolador que executa os nossos programas.',
    func: 'É o "cérebro" dos projetos. Lê sensores e botões pelas entradas e controla LEDs, sons e motores pelas saídas, seguindo o programa gravado nele.',
    terminals: [
      { name: 'Pinos digitais 0–13', desc: 'Entradas ou saídas digitais (HIGH/LOW). Os com ~ fazem PWM.' },
      { name: 'Pinos A0–A5', desc: 'Entradas analógicas (0 a 1023).' },
      { name: '5V, 3.3V', desc: 'Saídas de energia.' },
      { name: 'GND', desc: 'Negativo (0 V).' },
      { name: 'VIN', desc: 'Entrada de fonte externa (7–12 V).' },
    ],
    connect: ['Ligue ao computador pelo cabo USB.', 'Use o 5V e o GND para alimentar a protoboard.', 'Ligue os componentes aos pinos com jumpers.'],
    care: ['Não coloque sobre superfícies de metal.', 'Nunca ligue o 5V direto no GND.', 'Cada pino fornece no máximo 20 mA recomendados (40 mA é o limite absoluto).', 'Não ligue motores direto nos pinos.'],
    uses: ['Robôs', 'Estações meteorológicas', 'Automação de luzes', 'Jogos eletrônicos'],
    activity: { label: 'Arduino interativo', to: '/arduino' },
  },
  {
    id: 'protoboard', name: 'Protoboard', cats: ['Placas'], symbol: false,
    short: 'Placa com furos para montar circuitos sem solda.',
    func: 'Os furos têm tiras de metal por dentro que ligam grupos de furos. Assim podemos montar e desmontar circuitos rapidamente.',
    terminals: [
      { name: 'Trilhos + e −', desc: 'Fileiras das bordas, ligadas ao longo da placa (algumas são interrompidas no meio).' },
      { name: 'Grupos de 5 (a–e, f–j)', desc: 'Furos da mesma coluna e mesma metade estão ligados.' },
      { name: 'Canal central', desc: 'Separa as duas metades: sem ligação.' },
    ],
    connect: ['5V no trilho +, GND no trilho −.', 'Cada perna de um componente em um grupo diferente.', 'Componentes de 4 pernas (botão) sobre o canal central.'],
    care: ['Não force pernas grossas nos furos.', 'Não deixe pedaços de fio dentro dos furos.'],
    uses: ['Protótipos', 'Testes de circuitos', 'Aulas de eletrônica'],
    activity: { label: 'Laboratório da protoboard', to: '/protoboard' },
    keywords: 'matriz de contatos breadboard',
  },
  {
    id: 'jumper', name: 'Jumpers (fios)', cats: ['Componentes passivos'], symbol: true,
    short: 'Fios com pontas rígidas para fazer as ligações.',
    func: 'Conduzem a eletricidade de um ponto a outro do circuito: da placa para a protoboard ou entre furos.',
    terminals: [{ name: 'Macho-macho', desc: 'Pontas com pino: para protoboard e barras do Arduino.' }, { name: 'Macho-fêmea', desc: 'Uma ponta com pino e outra com encaixe: para módulos e sensores.' }],
    connect: ['Encaixe cada ponta firmemente no furo ou pino.', 'Use cores combinadas: vermelho = 5V, preto = GND.'],
    care: ['Fios com a ponta quebrada podem causar mau contato.', 'Organize os fios para encontrar erros com facilidade.'],
    uses: ['Todas as montagens na protoboard'],
    activity: { label: 'Missão 03 — Positivo e negativo', to: '/curso/missao/m3' },
    keywords: 'fio cabo',
  },
  {
    id: 'led', name: 'LED', cats: ['Componentes de saída', 'Semicondutores'], symbol: true,
    short: 'Pequena luz que acende quando a corrente passa no sentido certo.',
    func: 'LED significa Diodo Emissor de Luz. Ele transforma energia elétrica em luz e só funciona em um sentido (tem polaridade).',
    terminals: [{ name: 'Ânodo (+)', desc: 'Perna LONGA. Vai para o lado do 5V ou do pino.' }, { name: 'Cátodo (−)', desc: 'Perna CURTA, do lado chato da borda. Vai para o GND.' }],
    connect: ['Pino (ou 5V) → resistor de 220 Ω → ânodo → cátodo → GND.', 'Cada perna em um grupo diferente da protoboard.'],
    care: ['SEMPRE use resistor em série.', 'Invertido, ele não acende (com 5 V não estraga).', 'Corrente recomendada: 10 a 20 mA.'],
    uses: ['Indicadores de ligado', 'Semáforos', 'Iluminação', 'Painéis'],
    activity: { label: 'Missão 04 — Conhecendo o LED', to: '/curso/missao/m4' },
  },
  {
    id: 'resistor', name: 'Resistor', cats: ['Componentes passivos'], symbol: true,
    short: 'Limita a passagem da corrente elétrica.',
    func: 'Dificulta a passagem da corrente. Quanto maior a resistência (em ohms, Ω), menor a corrente. As faixas coloridas mostram o valor.',
    terminals: [{ name: 'Terminal 1 e 2', desc: 'Não tem polaridade: pode ser colocado em qualquer sentido.' }],
    connect: ['Em série com o LED (no mesmo caminho).', 'Em divisores de tensão com sensores (ex.: 10 kΩ com o LDR).'],
    care: ['Confira as cores antes de usar.', 'Resistores comuns aguentam 1/4 W.'],
    uses: ['Proteger LEDs', 'Divisores de tensão', 'Resistor de pull-up/pull-down'],
    activity: { label: 'Calculadora de resistores', to: '/resistores' },
  },
  {
    id: 'button', name: 'Push button', cats: ['Componentes de entrada'], symbol: true,
    short: 'Botão que liga o circuito enquanto está apertado.',
    func: 'Quando apertado, liga os dois lados do botão; quando solto, desliga. O Arduino lê esse estado com digitalRead.',
    terminals: [{ name: '4 pernas em 2 pares', desc: 'As pernas de cada par (que atravessam o canal) são sempre ligadas. Apertar liga um par ao outro.' }],
    connect: ['Coloque sobre o canal central.', 'Pino em uma perna e GND na perna do outro lado (diagonal).', 'Use pinMode(pino, INPUT_PULLUP).'],
    care: ['Pino e GND do mesmo lado = o botão não faz efeito.', 'Sem pull-up (INPUT simples) a leitura fica instável.'],
    uses: ['Campainhas', 'Controles de jogos', 'Iniciar/parar máquinas'],
    activity: { label: 'Missão 10 — O botão mágico', to: '/curso/missao/m10' },
    keywords: 'chave tactil interruptor',
  },
  {
    id: 'buzzer', name: 'Buzzer', cats: ['Componentes de saída'], symbol: true,
    short: 'Pequeno alto-falante que emite sons e bipes.',
    func: 'O buzzer PASSIVO toca a frequência enviada por tone(). O buzzer ATIVO tem um circuito interno e apita sozinho, sempre na mesma nota, quando recebe energia.',
    terminals: [{ name: '+ (positivo)', desc: 'Perna mais longa ou marcada com +. Vai ao pino.' }, { name: '− (negativo)', desc: 'Vai ao GND.' }],
    connect: ['Pino → resistor de 100 Ω → + do buzzer; − do buzzer → GND.', 'Use tone(pino, frequência) e noTone(pino).'],
    care: ['Use volume baixo em sala.', 'Respeite a polaridade marcada.'],
    uses: ['Alarmes', 'Músicas', 'Avisos sonoros'],
    activity: { label: 'Missão 13 — Sons', to: '/curso/missao/m13' },
    keywords: 'som piezo',
  },
  {
    id: 'pot', name: 'Potenciômetro', cats: ['Componentes passivos', 'Componentes de entrada'], symbol: true,
    short: 'Resistor de girar, que fornece uma tensão variável.',
    func: 'Ao girar o eixo, o cursor (perna do meio) se move sobre uma trilha de resistência, mudando a tensão de saída entre 0 e 5 V.',
    terminals: [{ name: 'Pontas (esquerda e direita)', desc: 'Uma no 5V e outra no GND.' }, { name: 'Cursor (meio)', desc: 'Vai ao pino analógico (A0).' }],
    connect: ['5V e GND nas pontas, meio no A0.', 'Leia com analogRead(A0): 0 a 1023.'],
    care: ['Nunca ligue a perna do meio direto no 5V ou no GND.'],
    uses: ['Controle de volume', 'Controle de brilho', 'Ajustes de velocidade'],
    activity: { label: 'Missão 14 — Intensidade da luz', to: '/curso/missao/m14' },
    keywords: 'trimpot',
  },
  {
    id: 'ldr', name: 'LDR (sensor de luz)', cats: ['Componentes passivos', 'Sensores', 'Componentes de entrada'], symbol: true,
    short: 'Resistor que muda com a luz.',
    func: 'No claro, a resistência fica baixa; no escuro, fica muito alta. Com um resistor de 10 kΩ, forma um divisor de tensão lido pelo A0.',
    terminals: [{ name: 'Terminal 1 e 2', desc: 'Sem polaridade.' }],
    connect: ['5V → LDR → A0 → resistor de 10 kΩ → GND.'],
    care: ['Sem o resistor de 10 kΩ a leitura não muda corretamente.'],
    uses: ['Iluminação automática de postes', 'Detectores de dia/noite'],
    activity: { label: 'Missão 15 — Sensor de luz', to: '/curso/missao/m15' },
    keywords: 'fotoresistor luz',
  },
  {
    id: 'servo', name: 'Servo motor', cats: ['Componentes de saída', 'Motores'], symbol: true,
    short: 'Motor que gira até um ângulo exato (0° a 180°).',
    func: 'Recebe um sinal do Arduino que indica o ângulo. Um circuito interno gira o motor até essa posição e o mantém lá.',
    terminals: [{ name: 'Marrom (ou preto)', desc: 'GND.' }, { name: 'Vermelho', desc: 'Alimentação 5V.' }, { name: 'Laranja (ou amarelo/branco)', desc: 'Sinal: vai ao pino digital.' }],
    connect: ['Marrom → GND, vermelho → 5V, laranja → pino 9.', '#include <Servo.h>, servo.attach(9), servo.write(ângulo).'],
    care: ['Nunca alimente pelo pino digital.', 'Servos grandes ou vários servos: fonte externa de 5 V com GND comum.', 'Mantenha os dedos longe do braço em movimento.'],
    uses: ['Braços robóticos', 'Cancelas', 'Lemes de barcos e aviões de controle remoto'],
    activity: { label: 'Missão 17 — Servo motor', to: '/curso/missao/m17' },
  },
  {
    id: 'ultrasonic', name: 'Sensor ultrassônico HC-SR04', cats: ['Sensores', 'Componentes de entrada'], symbol: false,
    short: 'Mede distâncias usando o eco de um som que não escutamos.',
    func: 'Emite um ultrassom (TRIG) e mede quanto tempo o eco demora para voltar (ECHO). Distância (cm) = tempo (µs) × 0,034 ÷ 2. Mede de cerca de 2 cm a 4 m.',
    terminals: [{ name: 'VCC', desc: '5V.' }, { name: 'TRIG', desc: 'Entrada do sensor: um pulso de 10 µs inicia a medição.' }, { name: 'ECHO', desc: 'Saída do sensor: fica em HIGH durante o tempo do eco.' }, { name: 'GND', desc: 'GND.' }],
    connect: ['VCC → 5V, TRIG → pino 9, ECHO → pino 10, GND → GND.', 'Meça com pulseIn(echo, HIGH).'],
    care: ['Não inverta VCC e GND.', 'Superfícies macias ou inclinadas refletem mal o som.'],
    uses: ['Sensores de estacionamento', 'Robôs que desviam de obstáculos', 'Medidores de nível'],
    activity: { label: 'Missão 19 — Detectando objetos', to: '/curso/missao/m19' },
    keywords: 'distância sonar',
  },
  {
    id: 'temp', name: 'Sensor de temperatura LM35', cats: ['Sensores', 'Componentes de entrada'], symbol: true,
    short: 'Fornece uma tensão proporcional à temperatura.',
    func: 'A saída aumenta 10 mV para cada grau Celsius. Com 5 V de referência: temperatura (°C) = leitura × 500 ÷ 1023.',
    terminals: [{ name: '+Vs', desc: 'Perna da esquerda (lado chato virado para você): 5V.' }, { name: 'Vout', desc: 'Perna do meio: vai ao A0.' }, { name: 'GND', desc: 'Perna da direita: GND.' }],
    connect: ['Lado chato virado para você, pernas para baixo: esquerda 5V, meio A0, direita GND.', 'float temp = analogRead(A0) * 500.0 / 1023;'],
    care: ['Invertido, o sensor esquenta e pode estragar: desligue logo se ficar quente.', 'Confira o modelo: o TMP36 tem outra fórmula, e o DHT11 é digital.'],
    uses: ['Termômetros', 'Ventiladores automáticos', 'Estufas'],
    activity: { label: 'Use no Projeto Final', to: '/curso/missao/m20' },
    keywords: 'termometro calor',
  },
  {
    id: 'lcd', name: 'Display LCD 16x2', cats: ['Componentes de saída'], symbol: false,
    short: 'Tela de 2 linhas com 16 caracteres cada.',
    func: 'Mostra textos e números. O mais prático para iniciantes é o LCD com módulo I2C, que usa só 4 fios.',
    terminals: [{ name: 'GND / VCC', desc: 'Alimentação (GND e 5V).' }, { name: 'SDA', desc: 'Dados I2C: pino A4 do Uno.' }, { name: 'SCL', desc: 'Relógio I2C: pino A5 do Uno.' }],
    connect: ['GND → GND, VCC → 5V, SDA → A4, SCL → A5.', 'Use uma biblioteca de LCD I2C (ex.: LiquidCrystal_I2C). O endereço costuma ser 0x27 ou 0x3F.', 'Sem módulo I2C, o LCD usa 16 pinos e a biblioteca LiquidCrystal.'],
    care: ['Se a tela acender mas não mostrar letras, ajuste o contraste no parafuso azul do módulo.'],
    uses: ['Mostrar temperatura', 'Placar de jogos', 'Mensagens'],
    activity: { label: 'Escola de programação', to: '/programacao' },
    keywords: 'tela display',
  },
  {
    id: 'motor', name: 'Motor DC', cats: ['Componentes de saída', 'Motores'], symbol: true,
    short: 'Motor que gira continuamente quando recebe energia.',
    func: 'Transforma energia elétrica em movimento de rotação. Invertendo a polaridade, ele gira para o outro lado. A velocidade pode ser controlada por PWM.',
    terminals: [{ name: 'Dois terminais', desc: 'Sem marcação fixa: trocar os fios muda o sentido de giro.' }],
    connect: ['NUNCA ligue direto no pino do Arduino.', 'Use um transistor (ou um módulo driver de motor, como L298N/L9110) e uma fonte externa.', 'Coloque um diodo (1N4007) em paralelo com o motor, com a faixa no lado positivo.', 'GND da fonte externa ligado ao GND do Arduino.'],
    care: ['Motores puxam muita corrente: podem reiniciar ou danificar a placa.', 'Ao desligar, o motor gera um pico de tensão: por isso usamos o diodo.'],
    uses: ['Carrinhos robôs', 'Ventiladores', 'Esteiras'],
    activity: { label: 'Leia sobre o transistor', to: '/enciclopedia/transistor' },
  },
  {
    id: 'transistor', name: 'Transistor (BC547)', cats: ['Semicondutores'], symbol: true,
    short: 'Chave eletrônica controlada por uma pequena corrente.',
    func: 'Uma corrente pequena na base (B) permite passar uma corrente maior entre o coletor (C) e o emissor (E). O Arduino usa o transistor para ligar cargas que precisam de mais corrente do que o pino fornece.',
    terminals: [{ name: 'C — coletor', desc: 'Perna da esquerda (lado chato virado para você): vai à carga.' }, { name: 'B — base', desc: 'Perna do meio: recebe o sinal do pino por um resistor de 1 kΩ.' }, { name: 'E — emissor', desc: 'Perna da direita: vai ao GND.' }],
    connect: ['Pino → resistor de 1 kΩ → base.', 'Emissor → GND.', 'Carga (ex.: LEDs, buzzer) entre o + e o coletor.'],
    care: ['O BC547 aguenta até 100 mA: serve para cargas pequenas. Para motores, use um transistor mais forte (ex.: TIP120) ou um módulo driver.', 'Confira a pinagem no datasheet: outros modelos (como o 2N2222) têm ordem diferente.'],
    uses: ['Ligar cargas maiores', 'Amplificadores', 'Circuitos de motores (com diodo)'],
    activity: { label: 'Motor DC', to: '/enciclopedia/motor' },
    keywords: 'npn',
  },
  {
    id: 'diode', name: 'Diodo (1N4007)', cats: ['Semicondutores'], symbol: true,
    short: 'Deixa a corrente passar em um só sentido.',
    func: 'Funciona como uma "válvula": conduz do ânodo para o cátodo e bloqueia no sentido contrário. Protege circuitos contra ligação invertida e contra picos de motores.',
    terminals: [{ name: 'Ânodo', desc: 'Lado sem faixa.' }, { name: 'Cátodo', desc: 'Lado com a faixa (prateada ou branca).' }],
    connect: ['Proteção de motor: diodo em paralelo com o motor, faixa (cátodo) no lado positivo.'],
    care: ['Ao conduzir, o diodo "gasta" cerca de 0,7 V.', 'O LED também é um diodo — mas o diodo comum não emite luz.'],
    uses: ['Proteção de motores e relés', 'Proteção contra inversão de polaridade', 'Fontes de alimentação'],
    activity: { label: 'Comparar com o LED', to: '/enciclopedia/led' },
  },
];
