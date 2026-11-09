/** Missões 11 a 20 — Níveis 3 (Inventando soluções) e 4 (Engenheiros do futuro). */
import {
  C_BLINK13, C_BUTTON, C_BUZZER, C_CANCELA, C_LDR, C_PORTEIRO, C_POT, C_PROJ_ALARME, C_PROJ_CANCELA, C_PROJ_LUZ, C_SERVO, C_SONAR, C_TRAFFIC,
} from './circuits';
import type { BuildStep, Mission } from './missionTypes';
import { ledSteps, SAFE_BASE } from './missions1';
import { emptyCircuit } from '../lib/circuit/types';

const SAFE_LED = [...SAFE_BASE, 'Todo LED precisa de um resistor em série (220 Ω ou 330 Ω).'];
const SAFE_MOTOR = [
  ...SAFE_BASE,
  'Nunca alimente motores pelos pinos digitais: o pino só fornece até 20 mA. O pino digital envia apenas o SINAL.',
  'Um micro servo (SG90) parado ou com pouco esforço pode usar o 5V da placa. Para servos maiores ou vários servos, use uma fonte externa de 5 V.',
  'Com fonte externa, ligue o GND da fonte ao GND do Arduino (GND comum). Sem isso, o sinal não funciona.',
  'Mantenha os dedos longe do braço do servo enquanto ele se move.',
];
const GND_TOP_STEP: BuildStep = { text: 'Ligue um fio preto do GND da placa (ao lado do pino 13) até o trilho negativo de cima (−).', add: ['gt'] };
const RAILS_STEP: BuildStep = { text: 'Ligue o 5V ao trilho + de baixo (fio vermelho) e o GND ao trilho − de baixo (fio preto).', add: ['p5', 'pg'] };

export const SONAR_CODE = `// Missão 19 — Detectando objetos
// HC-SR04: VCC → 5V, TRIG → pino 9, ECHO → pino 10, GND → GND. LED no pino 13.

const int trig = 9;
const int echo = 10;

void setup() {
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // 1) dispara um pulso de 10 microssegundos no TRIG
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  // 2) mede quanto tempo (em microssegundos) o eco demora para voltar
  long duracao = pulseIn(echo, HIGH);

  // 3) o som anda 0,034 cm por microssegundo; dividimos por 2 (ida e volta)
  int distancia = duracao * 0.034 / 2;

  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.println(" cm");

  if (distancia < 20) {
    digitalWrite(13, HIGH);   // objeto perto: acende o LED
  } else {
    digitalWrite(13, LOW);
  }
  delay(100);
}`;

export const MISSIONS_2: Mission[] = [
  {
    n: 11, id: 'm11', level: 3, title: 'Conhecendo as variáveis', icon: '📦', xp: 140,
    objective: 'Criar uma variável do tipo int e usá-la como contador.',
    goals: ['Entender o que é uma variável.', 'Saber para que serve.', 'Armazenar valores.', 'Utilizar int.'],
    intro: [
      'Uma variável é como uma caixinha com um nome, onde o Arduino guarda um valor para usar depois. O valor pode mudar enquanto o programa roda — por isso se chama variável.',
      'Para criar uma variável dizemos o TIPO, o NOME e o valor inicial. Exemplo: int contador = 0; cria uma caixinha chamada contador, que guarda números inteiros e começa com zero.',
      'Vamos fazer um contador de piscadas e ver os números no Monitor Serial.',
    ],
    ideas: [
      { title: 'int', text: 'Tipo para números inteiros (sem vírgula), de −32768 a 32767 no Arduino Uno.' },
      { title: 'contador = contador + 1;', text: 'Pega o valor atual, soma 1 e guarda de novo na mesma caixinha.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'LED + resistor de 220 Ω no pino 13', qty: '1' }, { item: 'Jumpers', qty: '3' }],
    safety: SAFE_LED,
    circuit: C_BLINK13,
    steps: [GND_TOP_STEP, ...ledSteps('a', 'D13', 2, 'vermelho', 6)],
    code: `// Missão 11 — Conhecendo as variáveis
// Contador de piscadas. LED com resistor no pino 13.
// Abra o Monitor Serial para ver os números.

int contador = 0;   // caixinha "contador" para números inteiros, começa em 0

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);       // liga a comunicação com o computador
}

void loop() {
  contador = contador + 1;  // soma 1 ao valor guardado
  Serial.print("Piscadas: ");
  Serial.println(contador); // mostra o valor no Monitor Serial

  digitalWrite(13, HIGH);
  delay(300);
  digitalWrite(13, LOW);
  delay(700);
}`,
    codeExplain: [
      { code: 'int contador = 0;', text: 'Cria a variável fora das funções, para o valor não se perder a cada volta do loop.' },
      { code: 'contador = contador + 1;', text: 'A cada volta do loop, o contador aumenta 1.' },
      { code: 'Serial.println(contador);', text: 'Sem aspas: mostra o VALOR da variável. Com aspas, mostraria a palavra "contador".' },
    ],
    activity: {
      type: 'code-fill',
      intro: 'Complete as partes que faltam no contador. Dica: o tipo da variável, a soma e o comando que mostra o valor.',
      template: `[[int]] contador = 0;

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  contador = contador [[+ 1|+1]];
  Serial.[[println]](contador);
  digitalWrite(13, HIGH);
  delay(300);
  digitalWrite(13, LOW);
  delay(700);
}`,
    },
    quiz: [
      { q: 'O que é uma variável?', options: ['Um tipo de LED', 'Um espaço com nome que guarda um valor que pode mudar', 'Um pino do Arduino'], correct: 1, explain: 'Variável = caixinha com nome que guarda um valor.' },
      { q: 'Qual linha cria uma variável inteira chamada pontos começando em 10?', options: ['pontos = int 10;', 'int pontos = 10;', 'int = pontos 10;'], correct: 1, explain: 'Primeiro o tipo, depois o nome e o valor: int pontos = 10;' },
      { q: 'O que mostra Serial.println(contador); quando contador vale 7?', options: ['contador', '7', 'Nada'], correct: 1, explain: 'Sem aspas, aparece o valor guardado: 7.' },
      { q: 'Por que a variável foi criada FORA do loop()?', options: ['Para guardar o valor entre uma volta e outra do loop', 'Porque dentro dá erro sempre', 'Para o LED piscar mais rápido'], correct: 0, explain: 'Se fosse criada dentro do loop, voltaria a 0 a cada volta.' },
    ],
    challenge: {
      text: 'Faça o contador contar de 2 em 2 e mostre também quantos segundos se passaram (cada volta dura 1 segundo).',
      hint: 'Some 2 em vez de 1. Crie outra variável segundos que aumenta 1 a cada volta.',
      solution: 'contador = contador + 2; e uma variável int segundos = 0; com segundos = segundos + 1; mostrada no Serial.',
      solutionCode: `int contador = 0;\nint segundos = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  contador = contador + 2;\n  segundos = segundos + 1;\n  Serial.print("Contador: ");\n  Serial.print(contador);\n  Serial.print("  Segundos: ");\n  Serial.println(segundos);\n  digitalWrite(13, HIGH);\n  delay(300);\n  digitalWrite(13, LOW);\n  delay(700);\n}`,
    },
    teacher: {
      minutes: 50,
      tips: ['Use caixas de papel com etiquetas para representar variáveis e "trocar" o valor guardado.', 'Mostre o Monitor Serial projetado para todos.'],
      difficulties: ['Colocar a variável entre aspas no println.', 'Criar a variável dentro do loop (volta sempre a zero).', 'Esquecer o Serial.begin.'],
    },
  },
  {
    n: 12, id: 'm12', level: 3, title: 'Tomando decisões', icon: '🔀', xp: 140,
    objective: 'Usar if e else para o Arduino decidir o que fazer.',
    goals: ['Ensinar if e else.', 'Trabalhar condições.', 'Relacionar programação e situações cotidianas.'],
    intro: [
      'Todo dia tomamos decisões: SE estiver chovendo, levo o guarda-chuva; SENÃO, deixo em casa. Na programação usamos if (se) e else (senão).',
      'Vamos criar um porteiro eletrônico: SE o botão estiver apertado, acende o LED verde (pode entrar); SENÃO, acende o vermelho (aguarde).',
      'Para comparar valores usamos == (é igual a). Atenção: um sinal = sozinho GUARDA um valor; dois sinais == COMPARAM.',
    ],
    ideas: [
      { title: 'if (condição) { }', text: 'Executa o bloco somente se a condição for verdadeira.' },
      { title: 'else { }', text: 'Executa quando a condição for falsa.' },
      { title: '== != < >', text: 'Igual, diferente, menor e maior: usados para comparar.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Push button', qty: '1' }, { item: 'LEDs vermelho e verde', qty: '2' }, { item: 'Resistores de 220 Ω', qty: '2' }, { item: 'Jumpers', qty: '7' }],
    safety: SAFE_LED,
    circuit: C_PORTEIRO,
    steps: [
      GND_TOP_STEP,
      ...ledSteps('a', 'D13', 2, 'vermelho', 6),
      ...ledSteps('b', 'D12', 11, 'verde', 13),
      { text: 'Botão sobre o canal central (e20, e22, f20, f22).', add: ['bt'] },
      { text: 'Fio do pino 2 até a20 e fio preto de a22 até o trilho −.', add: ['bw1', 'bw2'] },
    ],
    code: `// Missão 12 — Tomando decisões
// Porteiro eletrônico: botão no pino 2, LED vermelho no 13, LED verde no 12.

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  int botao = digitalRead(2);   // guarda a leitura do botão

  if (botao == LOW) {           // SE o botão está apertado...
    digitalWrite(12, HIGH);     // ...acende o verde (pode entrar)
    digitalWrite(13, LOW);
  } else {                      // SENÃO...
    digitalWrite(12, LOW);
    digitalWrite(13, HIGH);     // ...acende o vermelho (aguarde)
  }
}`,
    codeExplain: [
      { code: 'int botao = digitalRead(2);', text: 'Guarda a leitura numa variável para usar na decisão.' },
      { code: 'if (botao == LOW) {', text: 'Com INPUT_PULLUP, apertado = LOW. A condição pergunta: "o botão está apertado?"' },
      { code: '} else {', text: 'Caso contrário (botão solto), faz o outro bloco.' },
    ],
    activity: {
      type: 'build',
      intro: 'O botão e o LED vermelho da Missão 10 já estão montados. Adicione o LED verde no pino 12 e teste o porteiro.',
      start: C_BUTTON,
      palette: ['led', 'resistor', 'button'],
      rules: [{ type: 'buttonPin', pin: 'D2' }, { type: 'ledPin', pin: 'D13', color: 'red' }, { type: 'ledPin', pin: 'D12', color: 'green' }],
      hint: 'Monte o LED verde igual ao vermelho, em outras colunas, ligado ao pino 12.',
    },
    quiz: [
      { q: 'Qual a diferença entre = e == ?', options: ['Nenhuma', '= guarda um valor; == compara dois valores', '== guarda um valor; = compara'], correct: 1, explain: 'x = 5 guarda 5 em x. x == 5 pergunta se x é igual a 5.' },
      { q: 'Quando o bloco do else é executado?', options: ['Sempre', 'Quando a condição do if é falsa', 'Antes do if'], correct: 1, explain: 'O else roda só quando a condição do if não é verdadeira.' },
      { q: 'Que situação do dia a dia é um "if/else"?', options: ['Se o sinal está verde, atravesso; senão, espero', 'Escovar os dentes', 'Contar até 10'], correct: 0, explain: 'É uma decisão com duas saídas, igual ao if/else.' },
    ],
    challenge: {
      text: 'Crie uma "senha": o verde só acende se o botão ficar apertado por mais de 2 segundos.',
      hint: 'Use uma variável para contar quanto tempo o botão ficou apertado (some 100 a cada 100 ms) e zere quando ele for solto.',
      solution: 'Uma variável tempo aumenta enquanto o botão está apertado; se tempo >= 2000 acende o verde; ao soltar, tempo = 0.',
      solutionCode: `int tempo = 0;\n\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n  pinMode(12, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(2) == LOW) {\n    tempo = tempo + 100;\n  } else {\n    tempo = 0;\n  }\n\n  if (tempo >= 2000) {\n    digitalWrite(12, HIGH);\n    digitalWrite(13, LOW);\n  } else {\n    digitalWrite(12, LOW);\n    digitalWrite(13, HIGH);\n  }\n  delay(100);\n}`,
    },
    teacher: {
      minutes: 60,
      tips: ['Faça um jogo de "Se... então... senão" com a turma antes de programar.', 'Desenhe o fluxograma da decisão no quadro.'],
      difficulties: ['Usar = no lugar de == dentro do if.', 'Esquecer as chaves do bloco do else.', 'Inverter HIGH/LOW por causa do INPUT_PULLUP.'],
    },
  },
  {
    n: 13, id: 'm13', level: 3, title: 'O Arduino pode emitir sons', icon: '🎵', xp: 140,
    objective: 'Tocar notas musicais com um buzzer passivo usando tone() e noTone().',
    goals: ['Conhecer o buzzer.', 'Utilizar tone() e noTone().', 'Criar sequências sonoras.'],
    intro: [
      'O buzzer passivo é um pequeno alto-falante. Para fazer som, o Arduino liga e desliga o pino muito rápido — centenas de vezes por segundo. Esse número de vezes por segundo é a frequência, medida em hertz (Hz).',
      'Frequência baixa = som grave. Frequência alta = som agudo. O comando tone(pino, frequência) começa o som e noTone(pino) para.',
      'Vamos usar um resistor de 100 Ω em série com o buzzer para proteger o pino.',
    ],
    ideas: [
      { title: 'tone(8, 440)', text: 'Toca a nota Lá (440 Hz) no pino 8 até mandar parar.' },
      { title: 'noTone(8)', text: 'Para o som no pino 8.' },
      { title: 'Notas', text: 'Dó 262 · Ré 294 · Mi 330 · Fá 349 · Sol 392 · Lá 440 · Si 494' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Buzzer passivo', qty: '1' }, { item: 'Resistor de 100 Ω (marrom, preto, marrom)', qty: '1' }, { item: 'Jumpers', qty: '3' }],
    safety: [...SAFE_BASE, 'Use volume baixo e toque sons curtos para não atrapalhar a turma.', 'O buzzer tem lado + (perna mais longa ou marca +): ligue o + no lado do pino.'],
    circuit: C_BUZZER,
    steps: [
      GND_TOP_STEP,
      { text: 'Coloque o resistor de 100 Ω nos furos b5 e b9.', add: ['zr'] },
      { text: 'Coloque o buzzer com o + no furo c9 e o − no furo c12.', add: ['bz'] },
      { text: 'Ligue um fio do pino 8 até o furo a5.', add: ['zw1'] },
      { text: 'Ligue um fio preto do furo d12 até o trilho −.', add: ['zw2'] },
    ],
    code: `// Missão 13 — O Arduino pode emitir sons
// Buzzer passivo: + no pino 8 (com resistor de 100 Ω), − no GND.

void setup() {
  pinMode(8, OUTPUT);
}

void loop() {
  tone(8, 262);   // Dó (262 Hz)
  delay(400);
  tone(8, 294);   // Ré (294 Hz)
  delay(400);
  tone(8, 330);   // Mi (330 Hz)
  delay(400);
  noTone(8);      // silêncio
  delay(1000);
}`,
    codeExplain: [
      { code: 'tone(8, 262);', text: 'Começa a tocar 262 Hz (Dó) no pino 8. O som continua enquanto o programa segue.' },
      { code: 'delay(400);', text: 'Deixa a nota tocando por 400 ms.' },
      { code: 'noTone(8);', text: 'Silêncio.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o buzzer no pino 8 com o resistor de 100 Ω. Ligue o USB e ouça (o botão de som fica abaixo da bancada).',
      start: emptyCircuit(),
      palette: ['buzzer', 'resistor'],
      rules: [{ type: 'buzzerPin', pin: 'D8' }],
      hint: 'Selecione o resistor e troque o valor para 100 Ω. Caminho: pino 8 → resistor → + do buzzer → − do buzzer → GND.',
    },
    quiz: [
      { q: 'O que significa uma frequência MAIOR?', options: ['Som mais grave', 'Som mais agudo', 'Som mais alto (volume)'], correct: 1, explain: 'Mais vibrações por segundo = som mais agudo (fino).' },
      { q: 'Qual comando para o som?', options: ['tone(8, 0);', 'noTone(8);', 'digitalWrite(8, HIGH);'], correct: 1, explain: 'noTone(pino) para o som daquele pino.' },
      { q: 'Por que o buzzer passivo não toca com digitalWrite(8, HIGH)?', options: ['Porque ele precisa de um sinal que liga e desliga rápido', 'Porque precisa de 12 V', 'Porque está quebrado'], correct: 0, explain: 'Com tensão fixa, a membrana não vibra. O tone() cria a vibração.' },
    ],
    challenge: {
      text: 'Construa um alarme simples: uma sirene que alterna entre um som agudo e um grave.',
      hint: 'Alterne tone(8, 1000) e tone(8, 600) com delay entre eles.',
      solution: 'Dois tons alternados criam o efeito de sirene.',
      solutionCode: `void setup() {\n  pinMode(8, OUTPUT);\n}\n\nvoid loop() {\n  tone(8, 1000);  // agudo\n  delay(300);\n  tone(8, 600);   // grave\n  delay(300);\n}`,
    },
    teacher: {
      minutes: 50,
      tips: ['Combine um sinal para silêncio na sala (mão levantada = todos desligam o USB).', 'Proponha que cada equipe componha uma pequena música com 5 notas.'],
      difficulties: ['Buzzer ativo no lugar do passivo (o ativo apita sempre na mesma nota).', 'Esquecer o noTone e o som não parar.'],
    },
  },
  {
    n: 14, id: 'm14', level: 3, title: 'Controlando a intensidade da luz', icon: '🎚️', xp: 140,
    objective: 'Ler um potenciômetro com analogRead() e controlar o brilho de um LED com analogWrite() (PWM).',
    goals: ['Conhecer o potenciômetro.', 'Introduzir entradas analógicas.', 'Ensinar analogRead().', 'Introduzir PWM e analogWrite().'],
    intro: [
      'Um sinal digital só tem dois valores: ligado ou desligado. Um sinal analógico pode ter muitos valores no meio, como o volume de um som.',
      'O potenciômetro é um botão de girar. Ligamos suas pontas no 5V e no GND; a perna do meio fornece uma tensão entre 0 e 5 V. O analogRead(A0) transforma essa tensão em um número de 0 a 1023.',
      'Para controlar o brilho, o Arduino usa o PWM: liga e desliga o pino muito rápido. Quanto mais tempo ligado, mais forte o brilho. O analogWrite(pino, valor) usa valores de 0 a 255 e só funciona nos pinos com ~ (3, 5, 6, 9, 10, 11).',
    ],
    ideas: [
      { title: 'analogRead(A0)', text: '0 V → 0 · 2,5 V → cerca de 512 · 5 V → 1023' },
      { title: 'map()', text: 'Converte de uma faixa para outra: 0–1023 vira 0–255.' },
      { title: 'analogWrite(9, 128)', text: 'Pino 9 ligado cerca de metade do tempo: brilho médio.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Potenciômetro de 10 kΩ', qty: '1' }, { item: 'LED + resistor de 220 Ω', qty: '1' }, { item: 'Jumpers', qty: '8' }],
    safety: [...SAFE_LED, 'A perna do meio do potenciômetro vai SEMPRE no pino analógico. Nunca ligue a perna do meio direto no 5V ou no GND.'],
    circuit: C_POT,
    steps: [
      GND_TOP_STEP,
      ...ledSteps('a', 'D9', 2, 'vermelho', 6),
      RAILS_STEP,
      { text: 'Coloque o potenciômetro com as pernas nos furos h20, h22 e h24.', add: ['pt'] },
      { text: 'Ligue a perna da esquerda (j20) ao trilho + e a da direita (j24) ao trilho −.', add: ['pw1', 'pw2'] },
      { text: 'Ligue a perna do MEIO (j22) ao pino A0.', add: ['pw3'] },
    ],
    code: `// Missão 14 — Controlando a intensidade da luz
// Potenciômetro: pontas no 5V e no GND, perna do meio no A0.
// LED com resistor no pino 9 (pino com ~, que faz PWM).

void setup() {
  pinMode(9, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int leitura = analogRead(A0);                // número de 0 a 1023
  int brilho = map(leitura, 0, 1023, 0, 255);  // converte para 0 a 255
  analogWrite(9, brilho);                      // brilho do LED (PWM)
  Serial.println(leitura);
  delay(50);
}`,
    codeExplain: [
      { code: 'int leitura = analogRead(A0);', text: 'Lê a tensão do cursor do potenciômetro.' },
      { code: 'map(leitura, 0, 1023, 0, 255)', text: 'O analogWrite aceita só até 255, então convertemos a leitura.' },
      { code: 'analogWrite(9, brilho);', text: 'Controla o brilho do LED pelo PWM.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o potenciômetro no A0 e o LED no pino 9. Com o USB ligado, selecione o potenciômetro e gire o controle deslizante.',
      start: emptyCircuit(),
      palette: ['pot', 'led', 'resistor'],
      rules: [{ type: 'potAnalog', pin: 'A0' }, { type: 'ledPin', pin: 'D9' }],
      hint: 'Perna do meio → A0. Uma ponta → 5V. A outra ponta → GND.',
    },
    quiz: [
      { q: 'Qual a faixa de valores do analogRead no Arduino Uno?', options: ['0 a 1', '0 a 255', '0 a 1023'], correct: 2, explain: 'O conversor do Uno tem 10 bits: 1024 valores, de 0 a 1023.' },
      { q: 'Em quais pinos o analogWrite controla o brilho?', options: ['Em todos', 'Nos pinos com ~ (3, 5, 6, 9, 10 e 11)', 'Só no 13'], correct: 1, explain: 'Somente os pinos com ~ têm PWM.' },
      { q: 'O que faz map(512, 0, 1023, 0, 255)?', options: ['Devolve cerca de 127', 'Devolve 512', 'Acende o LED'], correct: 0, explain: '512 é a metade de 0–1023; a metade de 0–255 é cerca de 127.' },
    ],
    challenge: {
      text: 'Use o potenciômetro para controlar a VELOCIDADE com que um LED pisca, em vez do brilho.',
      hint: 'Use a leitura dentro do delay(): delay(leitura);',
      solution: 'Leia o A0 e use o valor como tempo do delay entre aceso e apagado.',
      solutionCode: `void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  int leitura = analogRead(A0);\n  digitalWrite(9, HIGH);\n  delay(leitura);\n  digitalWrite(9, LOW);\n  delay(leitura);\n}`,
    },
    teacher: {
      minutes: 60,
      tips: ['Compare digital (interruptor) e analógico (dimmer, volume).', 'Abra o Monitor Serial e mostre os números mudando ao girar.'],
      difficulties: ['Ligar o LED em um pino sem ~.', 'Ligar a perna do meio no 5V.', 'Esperar valores até 255 no analogRead.'],
    },
  },
  {
    n: 15, id: 'm15', level: 3, title: 'O sensor de luz', icon: '☀️', xp: 140,
    objective: 'Medir a luz do ambiente com um LDR e usar uma condição para acender um LED.',
    goals: ['Conhecer o LDR.', 'Entender sensores.', 'Ler valores analógicos.', 'Trabalhar condições.'],
    intro: [
      'O LDR é um resistor que muda com a luz: no claro, sua resistência é baixa; no escuro, fica muito alta.',
      'Para o Arduino medir isso, montamos um divisor de tensão: 5V → LDR → ponto do meio → resistor de 10 kΩ → GND. O ponto do meio vai ao pino A0.',
      'Com essa montagem: muita luz = número alto no analogRead; escuro = número baixo.',
    ],
    ideas: [
      { title: 'Sensor', text: 'Componente que transforma algo do ambiente (luz, distância, temperatura) em sinal elétrico.' },
      { title: 'Divisor de tensão', text: 'Dois resistores em série: a tensão do meio depende dos dois valores.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'LDR', qty: '1' }, { item: 'Resistor de 10 kΩ (marrom, preto, laranja)', qty: '1' }, { item: 'LED + resistor de 220 Ω', qty: '1' }, { item: 'Jumpers', qty: '8' }],
    safety: SAFE_LED,
    circuit: C_LDR,
    steps: [
      GND_TOP_STEP,
      ...ledSteps('a', 'D13', 2, 'vermelho', 6),
      RAILS_STEP,
      { text: 'Coloque o LDR nos furos h20 e h22.', add: ['ld'] },
      { text: 'Coloque o resistor de 10 kΩ nos furos i22 e i26.', add: ['lr'] },
      { text: 'Fio do trilho + até j20 (perna livre do LDR) e fio de j26 até o trilho −.', add: ['lw1', 'lw3'] },
      { text: 'Fio do furo g22 (ponto entre o LDR e o resistor) até o pino A0.', add: ['lw2'] },
    ],
    code: `// Missão 15 — O sensor de luz
// 5V → LDR → A0 → resistor de 10 kΩ → GND. LED com resistor no pino 13.

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int luz = analogRead(A0);   // muita luz = número alto; escuro = número baixo
  Serial.print("Luz: ");
  Serial.println(luz);
  delay(300);
}`,
    codeExplain: [
      { code: 'int luz = analogRead(A0);', text: 'Lê a tensão do divisor e guarda na variável luz.' },
      { code: 'Serial.println(luz);', text: 'Mostra o valor: observe como ele muda com mais ou menos luz.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o divisor de tensão com LDR + resistor de 10 kΩ no A0 e um LED no pino 13. Ligue o USB e mude a luz do LDR.',
      start: emptyCircuit(),
      palette: ['ldr', 'resistor', 'led'],
      rules: [{ type: 'ldrAnalog', pin: 'A0' }, { type: 'ledPin', pin: 'D13' }],
      hint: '5V → LDR → ponto do meio (A0) → resistor de 10 kΩ → GND. Troque o valor do resistor selecionando-o.',
    },
    quiz: [
      { q: 'O que acontece com a resistência do LDR no escuro?', options: ['Diminui', 'Aumenta muito', 'Fica igual'], correct: 1, explain: 'No escuro o LDR conduz pouco: resistência alta.' },
      { q: 'Nesta montagem, o que o analogRead mostra quando está escuro?', options: ['Um número baixo', 'Um número alto', 'Sempre 1023'], correct: 0, explain: 'No escuro o LDR tem resistência alta, a tensão no A0 cai e o número fica baixo.' },
      { q: 'Para que serve o resistor de 10 kΩ no circuito do LDR?', options: ['Para formar o divisor de tensão', 'Para o LED acender', 'Para nada'], correct: 0, explain: 'Sem ele, a tensão no A0 não mudaria com a luz.' },
    ],
    challenge: {
      text: 'Crie uma luz que acende automaticamente quando escurece (como a iluminação dos postes).',
      hint: 'Use if (luz < 300) para acender o LED e else para apagar. Ajuste o 300 olhando os valores no Monitor Serial.',
      solution: 'Compare a leitura com um limite e acenda o LED quando estiver escuro.',
      solutionCode: `void setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int luz = analogRead(A0);\n  Serial.println(luz);\n\n  if (luz < 300) {          // está escuro?\n    digitalWrite(13, HIGH); // acende\n  } else {\n    digitalWrite(13, LOW);  // apaga\n  }\n  delay(200);\n}`,
    },
    teacher: {
      minutes: 60,
      tips: ['Cubra o LDR com a mão ou ilumine com a lanterna do celular para mostrar a variação.', 'Peça para cada equipe anotar o valor no claro e no escuro e escolher o limite.'],
      difficulties: ['Esquecer o resistor de 10 kΩ.', 'Ligar o A0 no lado errado do LDR.', 'Limite (300) inadequado para a luz da sala.'],
    },
  },
  {
    n: 16, id: 'm16', level: 4, title: 'Repetindo comandos', icon: '🔁', xp: 160,
    objective: 'Usar os laços for e while para repetir comandos e simplificar o código.',
    goals: ['Ensinar for e while.', 'Entender repetições.', 'Simplificar códigos.'],
    intro: [
      'Imagine escrever 100 vezes a mesma instrução... Os laços de repetição fazem isso por nós!',
      'O for repete um número certo de vezes: for (int i = 0; i < 3; i++) { ... } repete 3 vezes (i vale 0, 1 e 2).',
      'O while repete ENQUANTO uma condição for verdadeira: while (vezes < 3) { ... }.',
    ],
    ideas: [
      { title: 'for', text: 'Início; condição para continuar; o que muda a cada volta.' },
      { title: 'while', text: 'Repete enquanto a condição for verdadeira. Lembre de mudar algo dentro, senão nunca para!' },
      { title: 'i++', text: 'É o mesmo que i = i + 1.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'LEDs', qty: '3' }, { item: 'Resistores de 220 Ω', qty: '3' }, { item: 'Jumpers', qty: '7' }],
    safety: SAFE_LED,
    circuit: C_TRAFFIC,
    steps: [GND_TOP_STEP, ...ledSteps('a', 'D13', 2, 'vermelho', 6), ...ledSteps('b', 'D12', 11, 'amarelo', 13), ...ledSteps('c', 'D11', 20, 'verde', 25)],
    code: `// Missão 16 — Repetindo comandos
// LEDs nos pinos 11, 12 e 13 (cada um com resistor de 220 Ω).

void setup() {
  for (int pino = 11; pino <= 13; pino++) {
    pinMode(pino, OUTPUT);       // configura os 3 pinos com uma só linha
  }
}

void loop() {
  // acende um LED de cada vez, do pino 11 até o 13
  for (int pino = 11; pino <= 13; pino++) {
    digitalWrite(pino, HIGH);
    delay(300);
    digitalWrite(pino, LOW);
  }

  // pisca todos juntos 3 vezes
  int vezes = 0;
  while (vezes < 3) {
    digitalWrite(11, HIGH);
    digitalWrite(12, HIGH);
    digitalWrite(13, HIGH);
    delay(200);
    digitalWrite(11, LOW);
    digitalWrite(12, LOW);
    digitalWrite(13, LOW);
    delay(200);
    vezes++;
  }
}`,
    codeExplain: [
      { code: 'for (int pino = 11; pino <= 13; pino++)', text: 'A variável pino começa em 11, repete enquanto for até 13 e aumenta 1 a cada volta: 11, 12, 13.' },
      { code: 'digitalWrite(pino, HIGH);', text: 'Usa a variável: em cada volta, um pino diferente.' },
      { code: 'while (vezes < 3) { ... vezes++; }', text: 'Repete enquanto vezes for menor que 3. O vezes++ garante que a repetição termina.' },
    ],
    activity: {
      type: 'code-fill',
      intro: 'Complete o for para que ele passe pelos pinos 11, 12 e 13.',
      template: `void setup() {
  for (int pino = [[11]]; pino <= [[13]]; pino[[++|+=1| = pino + 1]]) {
    pinMode(pino, OUTPUT);
  }
}

void loop() {
  for (int pino = 11; pino <= 13; pino++) {
    digitalWrite(pino, [[HIGH]]);
    delay(300);
    digitalWrite(pino, LOW);
  }
}`,
    },
    quiz: [
      { q: 'Quantas vezes repete: for (int i = 0; i < 5; i++)?', options: ['4', '5', '6'], correct: 1, explain: 'i vale 0, 1, 2, 3, 4: são 5 repetições.' },
      { q: 'O que acontece se esquecermos o vezes++ dentro do while (vezes < 3)?', options: ['Repete 3 vezes mesmo assim', 'Repete para sempre: a condição nunca fica falsa', 'Dá erro de montagem'], correct: 1, explain: 'Sem mudar vezes, a condição continua verdadeira para sempre.' },
      { q: 'Qual a vantagem dos laços de repetição?', options: ['Deixam o código menor e mais fácil de mudar', 'Deixam o LED mais forte', 'Não têm vantagem'], correct: 0, explain: 'Menos linhas repetidas = menos erros e mudanças mais fáceis.' },
    ],
    challenge: {
      text: 'Faça um efeito "vai e volta": acende 11 → 12 → 13 e depois 13 → 12 → 11.',
      hint: 'Use dois for: um subindo (pino++) e outro descendo (pino--).',
      solution: 'Um for de 11 até 13 com pino++ e outro de 13 até 11 com pino--.',
      solutionCode: `void setup() {\n  for (int pino = 11; pino <= 13; pino++) pinMode(pino, OUTPUT);\n}\n\nvoid loop() {\n  for (int pino = 11; pino <= 13; pino++) {\n    digitalWrite(pino, HIGH); delay(150); digitalWrite(pino, LOW);\n  }\n  for (int pino = 13; pino >= 11; pino--) {\n    digitalWrite(pino, HIGH); delay(150); digitalWrite(pino, LOW);\n  }\n}`,
    },
    teacher: {
      minutes: 60,
      tips: ['Compare o código da Missão 09 com o desta missão: qual é mais curto?', 'Faça a turma "executar" o for em voz alta, dizendo o valor de pino a cada volta.'],
      difficulties: ['Confundir < com <=.', 'Esquecer o incremento e criar repetição infinita.', 'Usar pinos não consecutivos no for.'],
    },
  },
  {
    n: 17, id: 'm17', level: 4, title: 'Conhecendo o servo motor', icon: '⚙️', xp: 160,
    objective: 'Controlar o ângulo de um servo motor com a biblioteca Servo.',
    goals: ['Entender o funcionamento de um servo.', 'Identificar seus fios.', 'Conhecer alimentação, GND e sinal.', 'Introduzir a biblioteca Servo.'],
    intro: [
      'O servo motor é um motor que gira até um ângulo exato, de 0 a 180 graus, e fica parado ali. É usado em braços robóticos, cancelas e lemes de aviõezinhos.',
      'Ele tem 3 fios: MARROM (GND), VERMELHO (alimentação 5V) e LARANJA (sinal). O pino do Arduino envia só o sinal, dizendo o ângulo. A energia para o motor vem do 5V.',
      'Uma biblioteca é um conjunto de códigos prontos. A biblioteca Servo já sabe criar o sinal certo: basta dizer meuServo.write(90).',
    ],
    ideas: [
      { title: '#include <Servo.h>', text: 'Carrega a biblioteca do servo.' },
      { title: 'attach(9)', text: 'Diz em qual pino está o fio laranja.' },
      { title: 'write(90)', text: 'Gira até 90 graus.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Micro servo SG90', qty: '1' }, { item: 'Jumpers', qty: '5' }],
    safety: SAFE_MOTOR,
    circuit: C_SERVO,
    steps: [
      RAILS_STEP,
      { text: 'Encaixe o conector do servo (3 pinos) nos furos h20 (marrom), h21 (vermelho) e h22 (laranja).', add: ['sv'], tip: 'Na placa real, você pode usar jumpers macho-macho encaixados no conector do servo.' },
      { text: 'Fio preto de j20 (marrom/GND) até o trilho − e fio vermelho de j21 (vermelho/5V) até o trilho +.', add: ['sw1', 'sw2'] },
      { text: 'Fio laranja de j22 (sinal) até o pino 9.', add: ['sw3'] },
    ],
    code: `// Missão 17 — Conhecendo o servo motor
// Servo: marrom → GND, vermelho → 5V, laranja → pino 9.

#include <Servo.h>   // biblioteca que sabe controlar servos

Servo meuServo;      // cria um servo chamado "meuServo"

void setup() {
  meuServo.attach(9);  // o fio de sinal está no pino 9
}

void loop() {
  meuServo.write(0);    // gira até 0 grau
  delay(1000);
  meuServo.write(90);   // gira até 90 graus
  delay(1000);
  meuServo.write(180);  // gira até 180 graus
  delay(1000);
}`,
    codeExplain: [
      { code: '#include <Servo.h>', text: 'Inclui a biblioteca. Fica na primeira linha.' },
      { code: 'Servo meuServo;', text: 'Cria o objeto que representa o servo.' },
      { code: 'meuServo.attach(9);', text: 'O sinal sai pelo pino 9.' },
      { code: 'meuServo.write(90);', text: 'Manda o servo para 90 graus. O delay dá tempo para ele chegar.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o servo: marrom no GND, vermelho no 5V e laranja no pino 9. Ligue o USB e observe o braço girar.',
      start: emptyCircuit(),
      palette: ['servo'],
      rules: [{ type: 'servoPin', pin: 'D9' }],
      hint: 'O conector do servo ocupa 3 furos em sequência: marrom, vermelho e laranja.',
    },
    quiz: [
      { q: 'Qual fio do servo recebe o sinal do Arduino?', options: ['Marrom', 'Vermelho', 'Laranja'], correct: 2, explain: 'Laranja (ou amarelo/branco em alguns modelos) é o sinal.' },
      { q: 'Por que não ligamos o fio vermelho do servo em um pino digital?', options: ['Porque o pino não fornece corrente suficiente para o motor', 'Porque o servo gira ao contrário', 'Tanto faz'], correct: 0, explain: 'Pinos digitais fornecem até 20 mA; o motor precisa de muito mais. A energia vem do 5V ou de uma fonte externa.' },
      { q: 'Ao usar uma fonte externa para o servo, o que é obrigatório?', options: ['Ligar o GND da fonte ao GND do Arduino (GND comum)', 'Desligar o Arduino', 'Usar fio vermelho no GND'], correct: 0, explain: 'Sem GND comum, o sinal do Arduino não tem referência e o servo não obedece.' },
      { q: 'Qual comando gira o servo até 45 graus?', options: ['meuServo.attach(45);', 'meuServo.write(45);', 'delay(45);'], correct: 1, explain: 'write(ângulo) define a posição.' },
    ],
    challenge: {
      text: 'Controle o ângulo do motor: faça o servo varrer de 0 a 180 graus devagar, de 10 em 10 graus.',
      hint: 'Use um for com a variável angulo indo de 0 a 180 com angulo += 10.',
      solution: 'for (int angulo = 0; angulo <= 180; angulo += 10) { meuServo.write(angulo); delay(100); }',
      solutionCode: `#include <Servo.h>\n\nServo meuServo;\n\nvoid setup() {\n  meuServo.attach(9);\n}\n\nvoid loop() {\n  for (int angulo = 0; angulo <= 180; angulo += 10) {\n    meuServo.write(angulo);\n    delay(100);\n  }\n  for (int angulo = 180; angulo >= 0; angulo -= 10) {\n    meuServo.write(angulo);\n    delay(100);\n  }\n}`,
    },
    teacher: {
      minutes: 60,
      tips: ['Mostre a diferença entre um motor DC (gira sem parar) e um servo (vai a um ângulo).', 'Se a placa reiniciar sozinha quando o servo se move, a USB não está aguentando: use fonte externa de 5 V com GND comum.'],
      difficulties: ['Trocar a ordem dos fios do servo.', 'Esquecer o #include.', 'Servo tremendo por falta de energia.'],
    },
  },
  {
    n: 18, id: 'm18', level: 4, title: 'Criando uma cancela automática', icon: '🚧', xp: 160,
    objective: 'Integrar servo e botão para abrir e fechar uma cancela.',
    goals: ['Integrar servo motor e botão.', 'Construir uma sequência lógica.', 'Programar abertura e fechamento.'],
    intro: [
      'Estacionamentos usam cancelas que abrem quando o carro chega. Vamos simular isso: o botão representa o carro chegando e o servo levanta a cancela.',
      'A lógica: SE o botão for apertado, ENTÃO abre (90°), espera 3 segundos e fecha (0°).',
    ],
    ideas: [
      { title: 'Integração', text: 'Juntar entrada (botão) e saída (servo) em um só projeto.' },
      { title: 'Sequência lógica', text: 'Detectar → abrir → esperar → fechar.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Micro servo SG90', qty: '1' }, { item: 'Push button', qty: '1' }, { item: 'Jumpers', qty: '8' }, { item: 'Palito de sorvete (para a cancela)', qty: '1' }],
    safety: SAFE_MOTOR,
    circuit: C_CANCELA,
    steps: [
      RAILS_STEP,
      { text: 'Encaixe o servo em h20 (marrom), h21 (vermelho), h22 (laranja).', add: ['sv'] },
      { text: 'Ligue j20 ao trilho −, j21 ao trilho + e j22 ao pino 9.', add: ['sw1', 'sw2', 'sw3'] },
      { text: 'Ligue o GND da placa (ao lado do pino 13) ao trilho − de cima.', add: ['gt'] },
      { text: 'Coloque o botão sobre o canal: e5, e7, f5, f7.', add: ['bt'] },
      { text: 'Fio do pino 2 até a5 e fio preto de a7 até o trilho − de cima.', add: ['bw1', 'bw2'] },
    ],
    code: `// Missão 18 — Cancela automática
// Servo no pino 9 (marrom → GND, vermelho → 5V). Botão no pino 2 e no GND.

#include <Servo.h>

Servo cancela;

void setup() {
  pinMode(2, INPUT_PULLUP);   // botão no pino 2
  cancela.attach(9);
  cancela.write(0);           // começa fechada
}

void loop() {
  if (digitalRead(2) == LOW) {   // carro chegou (botão apertado)
    cancela.write(90);           // abre
    delay(3000);                 // espera o carro passar
    cancela.write(0);            // fecha
  }
}`,
    codeExplain: [
      { code: 'cancela.write(0);  // no setup', text: 'Garante que a cancela começa fechada.' },
      { code: 'if (digitalRead(2) == LOW)', text: 'Apertado = LOW, por causa do INPUT_PULLUP.' },
      { code: 'delay(3000);', text: 'Tempo para o carro passar antes de fechar.' },
    ],
    activity: {
      type: 'build',
      intro: 'O servo já está montado. Adicione o botão no pino 2 (e no GND). Ligue o USB e aperte o botão para abrir a cancela.',
      start: C_SERVO,
      palette: ['button', 'servo'],
      rules: [{ type: 'servoPin', pin: 'D9' }, { type: 'buttonPin', pin: 'D2' }],
      hint: 'Botão sobre o canal; pino 2 em uma perna e GND na perna do outro lado.',
    },
    quiz: [
      { q: 'Por que usamos cancela.write(0) no setup()?', options: ['Para a cancela começar fechada', 'Para abrir a cancela', 'Para ler o botão'], correct: 0, explain: 'Assim a posição inicial é conhecida.' },
      { q: 'O que aconteceria sem o delay(3000)?', options: ['A cancela abriria e fecharia tão rápido que quase não se moveria', 'A cancela ficaria aberta para sempre', 'Nada muda'], correct: 0, explain: 'O servo precisa de tempo para chegar à posição e o carro para passar.' },
    ],
    challenge: {
      text: 'Adicione um LED: vermelho com a cancela fechada e apagado com ela aberta (ou use um LED verde para "aberta").',
      hint: 'Acenda/apague o LED junto com cada cancela.write().',
      solution: 'digitalWrite(13, LOW) ao abrir e digitalWrite(13, HIGH) ao fechar, com pinMode(13, OUTPUT) no setup.',
    },
    teacher: {
      minutes: 70,
      tips: ['Cole um palito de sorvete no braço do servo para virar a cancela.', 'Monte uma "rua" de papelão para as equipes testarem.'],
      difficulties: ['Servo sem GND comum com o botão (todos os GND devem estar ligados).', 'Botão do mesmo lado.'],
    },
  },
  {
    n: 19, id: 'm19', level: 4, title: 'Detectando objetos', icon: '📡', xp: 160,
    objective: 'Medir distâncias com o sensor ultrassônico HC-SR04.',
    goals: ['Conhecer o sensor ultrassônico HC-SR04.', 'Entender os pinos TRIG e ECHO.', 'Calcular distância.', 'Trabalhar condições.'],
    intro: [
      'O HC-SR04 funciona como um morcego: emite um som agudo que não escutamos (ultrassom) e espera o eco voltar. Quanto mais longe o objeto, mais o eco demora.',
      'Pinos: VCC (5V), TRIG (o Arduino manda o sensor apitar), ECHO (o sensor avisa quanto tempo o eco demorou) e GND.',
      'O som anda cerca de 0,034 cm por microssegundo. Como ele vai e volta, a distância é: tempo × 0,034 ÷ 2. O sensor mede de cerca de 2 cm a 4 m.',
    ],
    ideas: [
      { title: 'TRIG', text: 'Pulso de 10 microssegundos = "apite agora!"' },
      { title: 'ECHO', text: 'Fica em HIGH pelo tempo que o eco demorou. Medimos com pulseIn().' },
      { title: 'distância = tempo × 0,034 ÷ 2', text: 'Dividimos por 2 porque o som vai e volta.' },
    ],
    materials: [{ item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Sensor ultrassônico HC-SR04', qty: '1' }, { item: 'LED + resistor de 220 Ω', qty: '1' }, { item: 'Jumpers', qty: '7' }],
    safety: [...SAFE_LED, 'Confira VCC e GND do sensor antes de ligar: invertidos podem danificar o HC-SR04.'],
    circuit: C_SONAR,
    steps: [
      GND_TOP_STEP,
      ...ledSteps('a', 'D13', 2, 'vermelho', 6),
      { text: 'Encaixe o sensor com os pinos em a20 (VCC), a21 (TRIG), a22 (ECHO) e a23 (GND).', add: ['us'] },
      { text: 'Ligue e20 (VCC) ao 5V da placa.', add: ['uw1'] },
      { text: 'Ligue e21 (TRIG) ao pino 9 e e22 (ECHO) ao pino 10.', add: ['uw2', 'uw3'] },
      { text: 'Ligue e23 (GND) ao trilho −.', add: ['uw4'] },
    ],
    code: SONAR_CODE,
    codeExplain: [
      { code: 'digitalWrite(trig, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(trig, LOW);', text: 'Pulso de 10 µs no TRIG: o sensor emite o ultrassom.' },
      { code: 'long duracao = pulseIn(echo, HIGH);', text: 'Mede, em microssegundos, quanto tempo o ECHO ficou em HIGH (ida e volta do som).' },
      { code: 'int distancia = duracao * 0.034 / 2;', text: 'Converte o tempo em centímetros.' },
      { code: 'if (distancia < 20)', text: 'Decisão: objeto a menos de 20 cm acende o LED.' },
    ],
    activity: {
      type: 'build',
      intro: 'Monte o sensor (TRIG no pino 9, ECHO no 10) e o LED no pino 13. Ligue o USB e mude a distância do objeto selecionando o sensor.',
      start: emptyCircuit(),
      palette: ['ultrasonic', 'led', 'resistor'],
      rules: [{ type: 'ultrasonic', trig: 'D9', echo: 'D10' }, { type: 'ledPin', pin: 'D13' }],
      hint: 'VCC → 5V, TRIG → 9, ECHO → 10, GND → GND.',
    },
    quiz: [
      { q: 'Qual pino do HC-SR04 o Arduino usa para mandar o sensor emitir o som?', options: ['ECHO', 'TRIG', 'VCC'], correct: 1, explain: 'TRIG (trigger = gatilho) dispara a medição.' },
      { q: 'Se o eco demorou 1000 microssegundos, qual a distância aproximada?', options: ['17 cm', '34 cm', '1000 cm'], correct: 0, explain: '1000 × 0,034 ÷ 2 = 17 cm.' },
      { q: 'Por que dividimos por 2?', options: ['Porque o som vai até o objeto e volta', 'Porque o sensor tem 2 "olhos"', 'Para o número ficar menor'], correct: 0, explain: 'O tempo medido é de ida e volta.' },
    ],
    challenge: {
      text: 'Crie um sensor de estacionamento: um buzzer que apita mais rápido quanto mais perto o objeto estiver.',
      hint: 'Use a distância como tempo do delay entre os bipes: quanto menor a distância, menor o delay. Ligue um buzzer no pino 8 (com resistor de 100 Ω).',
      solution: 'Se distancia < 50: tone(8, 1000), delay(50), noTone(8) e delay(distancia * 10).',
      solutionCode: SONAR_CODE.replace(
        `  if (distancia < 20) {
    digitalWrite(13, HIGH);   // objeto perto: acende o LED
  } else {
    digitalWrite(13, LOW);
  }
  delay(100);`,
        `  if (distancia < 50) {
    tone(8, 1000);              // bipe
    delay(50);
    noTone(8);
    delay(distancia * 10);      // mais perto = bipes mais rápidos
  } else {
    noTone(8);
    delay(100);
  }`,
      ).replace('// Missão 19 — Detectando objetos', '// Desafio — Sensor de estacionamento (buzzer no pino 8)').replace('  pinMode(13, OUTPUT);', '  pinMode(8, OUTPUT);'),
    },
    teacher: {
      minutes: 70,
      tips: ['Use uma régua e um caderno como "parede" para comparar a distância medida com a real.', 'Superfícies macias (tecido) refletem pouco o som: a medida pode falhar.'],
      difficulties: ['Trocar TRIG e ECHO.', 'Sensor sem alimentação.', 'Esquecer de dividir por 2.'],
    },
  },
  {
    n: 20, id: 'm20', level: 4, title: 'PROJETO FINAL: Inventores em ação', icon: '🏆', xp: 200,
    objective: 'Desenvolver uma solução tecnológica usando os conhecimentos das missões anteriores.',
    goals: ['Escolher um problema real.', 'Planejar o circuito e o programa.', 'Montar, testar e corrigir.', 'Apresentar a solução.'],
    intro: [
      'Chegou a hora de inventar! Escolha um dos três projetos ou crie o seu. Use a bancada virtual para planejar e testar antes de montar na bancada real.',
      'Engenheiros trabalham em etapas: 1) entender o problema; 2) planejar; 3) montar; 4) testar; 5) melhorar. Você pode consultar todas as missões anteriores.',
    ],
    ideas: [
      { title: 'Planejar', text: 'Liste os componentes, desenhe o circuito e escreva os passos do programa.' },
      { title: 'Testar e melhorar', text: 'Errar faz parte! Teste uma parte de cada vez.' },
    ],
    materials: [{ item: 'Os componentes do projeto escolhido', qty: '—' }, { item: 'Arduino Uno + cabo USB', qty: '1' }, { item: 'Protoboard e jumpers', qty: '1' }],
    safety: [...SAFE_LED, 'Motores com fonte externa: GND comum com o Arduino.', 'Nada de ligar o projeto à tomada da parede: use apenas USB ou pilhas/baterias com orientação do professor.'],
    activity: { type: 'project', intro: 'Escolha um projeto, estude a montagem sugerida e construa o seu na bancada virtual. A verificação confere as ligações principais.' },
    projects: [
      {
        id: 'luz', title: 'Sistema de iluminação inteligente',
        description: 'Uma luz que fica mais forte quanto mais escuro estiver o ambiente — como uma luminária automática.',
        materials: ['LDR', 'Resistor de 10 kΩ', 'LED branco + resistor de 220 Ω', 'Jumpers'],
        circuit: C_PROJ_LUZ, palette: ['ldr', 'resistor', 'led'], rules: [{ type: 'ldrAnalog', pin: 'A0' }, { type: 'ledPin', pin: 'D9' }],
        code: `// Projeto final — Iluminação inteligente
// 5V → LDR → A0 → resistor de 10 kΩ → GND. LED (com resistor) no pino 9 (PWM).

void setup() {
  pinMode(9, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int luz = analogRead(A0);                 // claro = alto, escuro = baixo
  int brilho = map(luz, 0, 1023, 255, 0);   // invertido: mais escuro, mais brilho
  brilho = constrain(brilho, 0, 255);
  analogWrite(9, brilho);
  Serial.print("Luz: ");
  Serial.print(luz);
  Serial.print("  Brilho: ");
  Serial.println(brilho);
  delay(100);
}`,
      },
      {
        id: 'alarme', title: 'Alarme de segurança',
        description: 'Se alguém chegar perto (menos de 30 cm), o alarme pisca o LED vermelho e toca o buzzer.',
        materials: ['Sensor HC-SR04', 'Buzzer passivo + resistor de 100 Ω', 'LED vermelho + resistor de 220 Ω', 'Jumpers'],
        circuit: C_PROJ_ALARME, palette: ['ultrasonic', 'buzzer', 'resistor', 'led'], rules: [{ type: 'ultrasonic', trig: 'D9', echo: 'D10' }, { type: 'buzzerPin', pin: 'D8' }, { type: 'ledPin', pin: 'D13' }],
        code: `// Projeto final — Alarme de segurança
// HC-SR04: TRIG → 9, ECHO → 10. Buzzer no 8 (com 100 Ω). LED no 13.

const int trig = 9;
const int echo = 10;
const int buzzer = 8;
const int led = 13;

void setup() {
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(led, OUTPUT);
  Serial.begin(9600);
}

long medirDistancia() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duracao = pulseIn(echo, HIGH);
  return duracao * 0.034 / 2;
}

void loop() {
  long distancia = medirDistancia();
  Serial.println(distancia);

  if (distancia < 30) {        // alguém chegou perto!
    digitalWrite(led, HIGH);
    tone(buzzer, 880);
    delay(150);
    digitalWrite(led, LOW);
    noTone(buzzer);
    delay(150);
  } else {
    digitalWrite(led, LOW);
    noTone(buzzer);
    delay(100);
  }
}`,
      },
      {
        id: 'cancela', title: 'Cancela automática',
        description: 'Quando um carro chega perto (menos de 15 cm), a cancela abre sozinha, espera e fecha.',
        materials: ['Sensor HC-SR04', 'Micro servo SG90', 'Jumpers', 'Palito de sorvete'],
        circuit: C_PROJ_CANCELA, palette: ['ultrasonic', 'servo'], rules: [{ type: 'ultrasonic', trig: 'D9', echo: 'D10' }, { type: 'servoPin', pin: 'D6' }],
        code: `// Projeto final — Cancela automática com sensor
// HC-SR04: TRIG → 9, ECHO → 10. Servo: sinal no pino 6, vermelho → 5V, marrom → GND.

#include <Servo.h>

const int trig = 9;
const int echo = 10;
Servo cancela;

void setup() {
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  cancela.attach(6);
  cancela.write(0);            // começa fechada
  Serial.begin(9600);
}

long medirDistancia() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  return pulseIn(echo, HIGH) * 0.034 / 2;
}

void loop() {
  long distancia = medirDistancia();
  Serial.println(distancia);

  if (distancia < 15) {        // carro na frente da cancela
    cancela.write(90);         // abre
    delay(3000);               // espera passar
    cancela.write(0);          // fecha
  }
  delay(200);
}`,
      },
    ],
    quiz: [
      { q: 'Um LED não acende. Qual a ordem certa para investigar?', options: ['Desligar o USB, conferir polaridade, resistor e fios, e testar de novo', 'Trocar a placa por outra', 'Apertar o reset várias vezes'], correct: 0, explain: 'Sempre desligue antes de mexer e confira uma coisa de cada vez.' },
      { q: 'Qual função lê um sensor analógico como o LDR ou o potenciômetro?', options: ['digitalRead()', 'analogRead()', 'analogWrite()'], correct: 1, explain: 'analogRead lê valores de 0 a 1023 nos pinos A0 a A5.' },
      { q: 'Qual estrutura repete comandos um número certo de vezes?', options: ['if', 'for', 'delay'], correct: 1, explain: 'O for repete um número definido de vezes.' },
      { q: 'Para um motor maior com fonte externa, o que é OBRIGATÓRIO?', options: ['GND comum entre a fonte e o Arduino', 'Ligar o motor direto no pino digital', 'Usar 220 V'], correct: 0, explain: 'GND comum, e nunca motor direto no pino.' },
      { q: 'Com INPUT_PULLUP, o botão apertado é lido como…', options: ['HIGH', 'LOW'], correct: 1, explain: 'Apertado liga o pino ao GND: LOW.' },
      { q: 'Por que todo LED precisa de resistor?', options: ['Para limitar a corrente', 'Para mudar a cor', 'Para piscar'], correct: 0, explain: 'O resistor limita a corrente e protege o LED e o pino.' },
      { q: 'O que o canal central da protoboard faz?', options: ['Separa eletricamente as duas metades', 'Liga as duas metades', 'Guarda os fios'], correct: 0, explain: 'Não há ligação de um lado para o outro do canal.' },
      { q: 'O que faz analogWrite(9, 255)?', options: ['LED com brilho máximo no pino 9', 'Lê o pino 9', 'Apaga o LED'], correct: 0, explain: '255 é o valor máximo do PWM: pino ligado o tempo todo.' },
      { q: 'O que significa um "if" no programa?', options: ['Uma repetição', 'Uma decisão: faz algo SE a condição for verdadeira', 'Uma espera'], correct: 1, explain: 'if = se. Executa o bloco só quando a condição é verdadeira.' },
      { q: 'O sensor ultrassônico mediu 600 µs de eco. A distância é…', options: ['Cerca de 10 cm', 'Cerca de 600 cm', 'Cerca de 34 cm'], correct: 0, explain: '600 × 0,034 ÷ 2 ≈ 10,2 cm.' },
    ],
    challenge: {
      text: 'Apresente seu projeto para a turma: qual problema ele resolve, quais componentes usa, como o programa decide o que fazer e o que você melhoraria.',
      hint: 'Prepare um desenho do circuito e destaque uma parte do código que você criou ou modificou.',
      solution: 'Avaliação pela apresentação: problema, solução, explicação do circuito e do código, e ideias de melhoria.',
    },
    teacher: {
      minutes: 150,
      tips: ['Divida em 3 aulas: planejamento (desenho + lista de materiais), montagem e testes, apresentação.', 'Use uma ficha de planejamento: problema, entradas (sensores), saídas (atuadores) e lógica.', 'Valorize o processo de depuração tanto quanto o resultado.'],
      difficulties: ['Querer montar tudo de uma vez: oriente a testar parte por parte.', 'Conflito de pinos entre componentes.', 'GND não comum entre partes do circuito.'],
    },
  },
];
