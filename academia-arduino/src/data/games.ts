/** Conteúdo dos jogos e desafios (Módulo 7). */
import type { Circuit } from '../lib/circuit/types';
import { C_BUTTON, C_LED_RAILS } from './circuits';

export interface GameMeta {
  id: string;
  emoji: string;
  title: string;
  short: string;
  instructions: string[];
}

export const GAMES: GameMeta[] = [
  { id: 'detetive', emoji: '🕵️', title: 'Detetive de circuitos', short: 'Encontre o erro em cada montagem.', instructions: ['Observe a montagem com atenção.', 'Escolha qual é o erro.', 'Acertou na 1ª tentativa: 2 pontos. Na 2ª: 1 ponto.', 'Use as dicas se precisar: a 2ª dica destaca a região do problema.'] },
  { id: 'onde-conectar', emoji: '📍', title: 'Onde devo conectar?', short: 'Escolha os furos certos na protoboard.', instructions: ['Leia a instrução.', 'Toque nos furos da protoboard.', 'Clique em Verificar.', 'Acerto de primeira: 3 pontos; depois: 1 ponto.'] },
  { id: 'organize', emoji: '🧱', title: 'Organize o código', short: 'Coloque as linhas na ordem certa.', instructions: ['Arraste as linhas (ou use as setas).', 'Clique em Conferir.', 'Linhas em vermelho estão fora do lugar.', 'Acerto de primeira: 3 pontos; depois: 1 ponto.'] },
  { id: 'componente', emoji: '🔍', title: 'Qual é o componente?', short: 'Descubra o componente pela silhueta.', instructions: ['Veja a sombra do componente.', 'Escolha o nome (1 ponto) e depois a função (1 ponto).', 'A dica mostra uma parte da imagem.'] },
  { id: 'preveja', emoji: '🔮', title: 'Preveja o resultado', short: 'O que acontece quando o código roda?', instructions: ['Leia o código.', 'Escolha o que vai acontecer.', 'Acerto de primeira: 2 pontos; depois: 1 ponto.'] },
  { id: 'logica', emoji: '🧠', title: 'Desafio de lógica', short: 'Resolva problemas com sensores e condições.', instructions: ['Leia a situação-problema.', 'Escolha a melhor solução.', 'Acerto de primeira: 2 pontos; depois: 1 ponto.'] },
];

/* ---------- Detetive de circuitos ---------- */
export interface DetectiveCase {
  id: string;
  circuit: Circuit;
  options: string[];
  correct: number;
  explain: string;
  hints: [string, string];
  /** peças/fios para destacar na 2ª dica */
  zone: string[];
}

const base = C_LED_RAILS;
const mapPart = (c: Circuit, id: string, patch: object): Circuit => ({ ...c, parts: c.parts.map((p) => (p.id === id ? { ...p, ...patch } : p)) });

export const DETECTIVE: DetectiveCase[] = [
  {
    id: 'invertido', circuit: mapPart(base, 'l1', { flip: true }),
    options: ['O LED está invertido', 'Falta o resistor', 'O GND está desligado', 'O resistor está em curto'], correct: 0,
    explain: 'A perna curta (cátodo) ficou do lado do resistor e a longa do lado do GND. O LED só conduz do ânodo para o cátodo.',
    hints: ['Observe o lado chato do LED e o comprimento das pernas.', 'Olhe o LED destacado: qual perna está do lado do +?'], zone: ['l1'],
  },
  {
    id: 'sem-resistor',
    circuit: { parts: [base.parts[1]], wires: [base.wires[0], base.wires[1], { id: 'w3', a: 'bp-9', b: 'j9', color: 'red' }, base.wires[3]] },
    options: ['O LED está invertido', 'Falta o resistor', 'O LED está fora da protoboard', 'O 5V está no trilho errado'], correct: 1,
    explain: 'O fio liga o trilho + direto no LED. Sem resistor, a corrente fica alta demais e o LED pode queimar.',
    hints: ['Siga o caminho do + até o LED: existe algum componente no meio?', 'Veja o fio vermelho destacado: aonde ele chega?'], zone: ['w3'],
  },
  {
    id: 'fio-errado',
    circuit: { ...base, wires: base.wires.map((w) => (w.id === 'w4' ? { ...w, a: 'j11' } : w)) },
    options: ['O fio do GND está na coluna errada', 'O resistor está invertido', 'O LED está invertido', 'Falta o fio do 5V'], correct: 0,
    explain: 'O fio preto está na coluna 11, mas a perna curta do LED está na coluna 10. Colunas diferentes não se ligam: o circuito ficou aberto.',
    hints: ['Confira em que coluna está a perna curta do LED.', 'Compare a coluna do fio preto destacado com a do LED.'], zone: ['w4', 'l1'],
  },
  {
    id: 'mesma-linha',
    circuit: mapPart(base, 'l1', { anchor: 'h9', orient: 'v' }),
    options: ['As duas pernas do LED estão no mesmo grupo de furos', 'Falta o resistor', 'O GND está desligado', 'O LED é da cor errada'], correct: 0,
    explain: 'As duas pernas do LED estão na coluna 9 (h9 e i9), no mesmo grupo de 5 furos. A corrente passa pela tira de metal e não pelo LED.',
    hints: ['Em que furos estão as duas pernas do LED?', 'As duas pernas destacadas estão na mesma coluna?'], zone: ['l1'],
  },
  {
    id: 'sem-gnd',
    circuit: { ...base, wires: base.wires.filter((w) => w.id !== 'pg') },
    options: ['O GND da placa não está ligado ao trilho −', 'O LED está invertido', 'Falta o resistor', 'O resistor está em curto'], correct: 0,
    explain: 'O trilho − não está ligado ao GND da placa. A corrente não tem por onde voltar: circuito aberto.',
    hints: ['Todo circuito precisa voltar ao GND da placa.', 'Olhe os fios que saem da placa: quantos são?'], zone: ['p5'],
  },
  {
    id: 'trilhos-trocados',
    circuit: { ...base, wires: base.wires.map((w) => (w.id === 'p5' ? { ...w, b: 'bn-2' } : w.id === 'pg' ? { ...w, b: 'bp-3' } : w)) },
    options: ['5V e GND estão nos trilhos trocados', 'Falta o resistor', 'O LED está fora do lugar', 'Está tudo certo'], correct: 0,
    explain: 'O fio do 5V foi para o trilho − (azul) e o GND para o trilho + (vermelho). Assim a polaridade fica invertida e o LED não acende.',
    hints: ['Confira as cores: vermelho no +, azul no −.', 'Veja onde chegam os dois fios que saem da placa.'], zone: ['p5', 'pg'],
  },
  {
    id: 'botao-mesmo-lado',
    circuit: { ...C_BUTTON, wires: C_BUTTON.wires.map((w) => (w.id === 'bw2' ? { ...w, a: 'j20', b: 'bn-20' } : w)).concat({ id: 'pg', a: 'ard:GND1', b: 'bn-3', color: 'black' }) },
    options: ['Pino 2 e GND estão do mesmo lado do botão', 'O LED está invertido', 'Falta o resistor do LED', 'O botão está fora do canal central'], correct: 0,
    explain: 'O fio do pino 2 (coluna 20, em cima) e o fio do GND (coluna 20, embaixo) estão no mesmo lado do botão — e esse lado já é ligado por dentro. O pino fica sempre em LOW, apertando ou não.',
    hints: ['As pernas da mesma coluna do botão são ligadas por dentro.', 'Compare as colunas dos dois fios ligados ao botão.'], zone: ['bw1', 'bw2', 'bt'],
  },
  {
    id: 'resistor-curto',
    circuit: mapPart(base, 'r1', { anchor: 'f9', orient: 'v' }),
    options: ['O resistor está com as duas pernas no mesmo grupo', 'O LED está invertido', 'O GND está desligado', 'O fio do 5V está solto'], correct: 0,
    explain: 'O resistor está em pé na coluna 9 (f9 e j9): as duas pernas ficam no mesmo grupo, então ele não liga o trilho + ao LED. O LED fica sem energia.',
    hints: ['Em que furos estão as pernas do resistor?', 'Veja o resistor destacado: as pernas estão em colunas diferentes?'], zone: ['r1'],
  },
];

/* ---------- Organize o código ---------- */
export const ORDER_PUZZLES: { title: string; lines: string[] }[] = [
  { title: 'Pisca-pisca', lines: ['void setup() {', '  pinMode(13, OUTPUT);', '}', 'void loop() {', '  digitalWrite(13, HIGH);', '  delay(1000);', '  digitalWrite(13, LOW);', '  delay(1000);', '}'] },
  { title: 'Semáforo curto', lines: ['void loop() {', '  digitalWrite(11, HIGH);', '  delay(3000);', '  digitalWrite(11, LOW);', '  digitalWrite(12, HIGH);', '  delay(1000);', '  digitalWrite(12, LOW);', '}'] },
  { title: 'Botão e LED', lines: ['void setup() {', '  pinMode(2, INPUT_PULLUP);', '  pinMode(13, OUTPUT);', '}', 'void loop() {', '  if (digitalRead(2) == LOW) {', '    digitalWrite(13, HIGH);', '  } else {', '    digitalWrite(13, LOW);', '  }', '}'] },
  { title: 'Melodia', lines: ['void loop() {', '  tone(8, 262);', '  delay(300);', '  tone(8, 330);', '  delay(300);', '  noTone(8);', '  delay(1000);', '}'] },
  { title: 'Servo', lines: ['#include <Servo.h>', 'Servo meuServo;', 'void setup() {', '  meuServo.attach(9);', '}', 'void loop() {', '  meuServo.write(0);', '  delay(1000);', '  meuServo.write(180);', '  delay(1000);', '}'] },
];

/* ---------- Preveja o resultado ---------- */
export const PREDICT: { code: string; q: string; options: string[]; correct: number; explain: string; hint: string }[] = [
  { code: 'void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(250);\n  digitalWrite(13, LOW);\n  delay(250);\n}', q: 'O que acontece com o LED do pino 13?', options: ['Fica sempre aceso', 'Pisca 2 vezes por segundo', 'Pisca 1 vez a cada 4 segundos', 'Não acende'], correct: 1, explain: '250 ms aceso + 250 ms apagado = 500 ms por piscada: 2 piscadas por segundo.', hint: 'Some os dois delays para saber quanto dura uma piscada.' },
  { code: 'void setup() {\n  pinMode(13, OUTPUT);\n  digitalWrite(13, HIGH);\n}\n\nvoid loop() {\n}', q: 'O que acontece com o LED?', options: ['Fica aceso para sempre', 'Pisca', 'Acende e apaga uma vez', 'Fica apagado'], correct: 0, explain: 'O setup liga o pino uma vez e o loop vazio não muda nada.', hint: 'O loop está vazio: quem muda o pino depois do setup?' },
  { code: 'void loop() {\n  for (int i = 0; i < 4; i++) {\n    digitalWrite(13, HIGH);\n    delay(200);\n    digitalWrite(13, LOW);\n    delay(200);\n  }\n  delay(2000);\n}', q: 'Quantas piscadas o LED dá antes de cada pausa longa?', options: ['3', '4', '5', '2'], correct: 1, explain: 'i vale 0, 1, 2 e 3: são 4 repetições.', hint: 'Conte os valores de i que deixam a condição i < 4 verdadeira.' },
  { code: 'void loop() {\n  digitalWrite(13, HIGH);\n  digitalWrite(13, LOW);\n}', q: 'Sem nenhum delay, como o LED vai parecer?', options: ['Piscando devagar', 'Aceso com brilho forte', 'Praticamente apagado: liga e desliga rápido demais', 'O programa não roda'], correct: 2, explain: 'O LED fica ligado só por um instante muito curto em cada volta: nossos olhos quase não percebem a luz.', hint: 'Quanto tempo o LED fica ligado entre as duas linhas?' },
  { code: 'void setup() {\n  pinMode(8, OUTPUT);\n  tone(8, 440);\n}\n\nvoid loop() {\n}', q: 'O que o buzzer no pino 8 faz?', options: ['Toca a nota Lá sem parar', 'Toca um bipe curto', 'Fica em silêncio', 'Toca uma música'], correct: 0, explain: 'tone() começa o som e ele só para com noTone().', hint: 'Existe algum noTone no programa?' },
  { code: 'int x = 5;\n\nvoid setup() {\n  Serial.begin(9600);\n  x = x + 3;\n  Serial.println(x);\n}\n\nvoid loop() {\n}', q: 'O que aparece no Monitor Serial?', options: ['x', '5', '8', '53'], correct: 2, explain: 'x começa em 5 e recebe 5 + 3 = 8.', hint: 'Faça a conta: qual o valor de x depois da soma?' },
  { code: 'int contador = 0;\n\nvoid loop() {\n  contador = contador + 1;\n  if (contador >= 3) {\n    digitalWrite(13, HIGH);\n  }\n  delay(1000);\n}', q: 'Quando o LED acende?', options: ['Logo no início', 'Depois de cerca de 2 segundos, e fica aceso', 'Nunca', 'Pisca a cada segundo'], correct: 1, explain: 'Na 3ª volta (após cerca de 2 segundos) o contador chega a 3 e o LED acende. Ninguém apaga depois.', hint: 'Em qual volta do loop o contador chega a 3?' },
  { code: 'int luz = 200;  // leitura do LDR no escuro\n\nvoid loop() {\n  if (luz < 300) {\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(13, LOW);\n  }\n}', q: 'Com luz = 200, o LED…', options: ['acende', 'apaga', 'pisca'], correct: 0, explain: '200 é menor que 300: a condição é verdadeira e o LED acende.', hint: '200 é menor que 300?' },
  { code: '#include <Servo.h>\nServo s;\n\nvoid setup() {\n  s.attach(9);\n  s.write(180);\n}\n\nvoid loop() {\n}', q: 'O que o servo faz?', options: ['Gira até 180° e fica parado', 'Gira sem parar', 'Vai e volta', 'Nada'], correct: 0, explain: 'write(180) manda o servo para 180 graus. Como o loop está vazio, ele fica lá.', hint: 'O servo vai para um ângulo e para.' },
];

/* ---------- Desafio de lógica ---------- */
export const LOGIC: { q: string; options: string[]; correct: number; explain: string; hint: string }[] = [
  { q: 'Uma luminária deve acender sozinha quando escurecer. Do que você precisa?', options: ['LDR + LED + if (luz < limite)', 'Botão + buzzer', 'Servo + for', 'Sensor ultrassônico + delay'], correct: 0, explain: 'O LDR mede a luz; a condição decide quando acender o LED.', hint: 'Qual sensor percebe a luz?' },
  { q: 'Um alarme deve tocar SE alguém chegar a menos de 30 cm E o sistema estiver ligado (botão de armar). Qual condição?', options: ['if (distancia < 30 && armado == true)', 'if (distancia > 30)', 'if (armado == false)', 'for (int i = 0; i < 30; i++)'], correct: 0, explain: '&& significa "E": as duas coisas precisam ser verdadeiras.', hint: 'Você precisa juntar duas condições ao mesmo tempo.' },
  { q: 'Você quer piscar um LED 10 vezes e depois parar de piscar. Qual estrutura ajuda mais?', options: ['Um for que repete 10 vezes, dentro do setup()', 'Um if no loop', 'Só um delay(10)', 'Um tone()'], correct: 0, explain: 'O for repete um número certo de vezes. No setup, ele roda só uma vez.', hint: 'Qual estrutura repete um número certo de vezes?' },
  { q: 'Uma cancela abre quando um carro chega e fecha depois de 3 segundos. Qual é a sequência certa?', options: ['Detectar carro → abrir (90°) → esperar 3 s → fechar (0°)', 'Fechar → abrir → detectar', 'Esperar 3 s → detectar → fechar', 'Abrir sempre, sem detectar'], correct: 0, explain: 'A ordem das instruções cria a lógica: primeiro detectar, depois agir.', hint: 'O que precisa acontecer primeiro?' },
  { q: 'Um sensor de estacionamento deve apitar mais RÁPIDO quanto mais PERTO o carro está. O que fazer com o tempo entre os bipes?', options: ['Usar um delay proporcional à distância (menor distância = menor delay)', 'Usar sempre delay(1000)', 'Usar o maior delay possível', 'Não usar delay'], correct: 0, explain: 'Se o delay depende da distância, os bipes ficam mais frequentes quando a distância diminui.', hint: 'Perto = número pequeno. Delay pequeno = bipes rápidos.' },
  { q: 'Um botão deve LIGAR a luz no 1º toque e DESLIGAR no 2º toque. O que guarda se a luz está ligada?', options: ['Uma variável bool, invertida a cada toque (ligada = !ligada)', 'O delay', 'O pinMode', 'Um resistor maior'], correct: 0, explain: 'A variável "lembra" o estado. O ! inverte: true vira false e vice-versa.', hint: 'Você precisa de "memória" no programa.' },
  { q: 'Uma estufa deve ligar o ventilador (motor DC) quando a temperatura passar de 30 °C. Qual montagem é SEGURA?', options: ['LM35 no A0 e motor ligado por um transistor/módulo driver com fonte externa e GND comum', 'Motor direto no pino 9', 'Motor direto no 3.3V', 'LDR no motor'], correct: 0, explain: 'Motores nunca vão direto no pino: use transistor ou driver, fonte externa e GND comum.', hint: 'Lembre da regra de ouro sobre motores.' },
  { q: 'Um jogo de reflexo: o LED acende em um tempo aleatório e o jogador aperta o botão. O que mede o tempo de reação?', options: ['millis() no momento em que acende e no momento do aperto; a diferença é o tempo', 'O valor do resistor', 'O analogWrite', 'O número do pino'], correct: 0, explain: 'millis() conta o tempo desde que a placa ligou. A diferença entre duas leituras mostra quanto tempo passou.', hint: 'Qual comando "olha o relógio" do Arduino?' },
];
