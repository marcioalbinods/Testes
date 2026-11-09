/** Biblioteca de comandos do Arduino (Escola de programação — Ferramenta A). */
import type { QuizQuestion } from '../components/ui';

export interface CommandInfo {
  id: string;
  name: string;
  group: 'Estrutura' | 'Pinos' | 'Tempo' | 'Decisões e repetições' | 'Variáveis' | 'Constantes';
  explain: string;
  syntax: string;
  example: string;
  situation: string;
  exercise: QuizQuestion;
}

export const COMMANDS: CommandInfo[] = [
  {
    id: 'setup', name: 'void setup()', group: 'Estrutura',
    explain: 'Função que roda UMA vez, quando a placa liga ou depois do reset. Usada para preparar tudo.',
    syntax: 'void setup() {\n  // instruções de preparação\n}',
    example: 'void setup() {\n  pinMode(13, OUTPUT);\n}',
    situation: 'Configurar os pinos e ligar o Serial antes de começar.',
    exercise: { q: 'Quantas vezes o setup() é executado?', options: ['Uma vez', 'Sempre', 'Nunca'], correct: 0, explain: 'Só uma vez, no início.' },
  },
  {
    id: 'loop', name: 'void loop()', group: 'Estrutura',
    explain: 'Função que se repete para sempre, enquanto a placa estiver ligada.',
    syntax: 'void loop() {\n  // instruções que se repetem\n}',
    example: 'void loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}',
    situation: 'O pisca-pisca, a leitura de sensores, o semáforo — tudo o que precisa continuar acontecendo.',
    exercise: { q: 'Quando o loop() termina a última linha, o que acontece?', options: ['O programa para', 'Ele recomeça da primeira linha do loop', 'Volta para o setup'], correct: 1, explain: 'O loop recomeça imediatamente.' },
  },
  {
    id: 'pinMode', name: 'pinMode()', group: 'Pinos',
    explain: 'Diz se um pino será entrada (INPUT ou INPUT_PULLUP) ou saída (OUTPUT).',
    syntax: 'pinMode(pino, modo);',
    example: 'pinMode(13, OUTPUT);\npinMode(2, INPUT_PULLUP);',
    situation: 'Antes de acender um LED no pino 13, configure o pino como saída.',
    exercise: { q: 'Qual linha configura o pino 8 para um buzzer?', options: ['pinMode(8, INPUT);', 'pinMode(8, OUTPUT);', 'digitalWrite(8, OUTPUT);'], correct: 1, explain: 'O buzzer é uma saída: OUTPUT.' },
  },
  {
    id: 'digitalWrite', name: 'digitalWrite()', group: 'Pinos',
    explain: 'Liga (HIGH = 5 V) ou desliga (LOW = 0 V) um pino de saída.',
    syntax: 'digitalWrite(pino, HIGH ou LOW);',
    example: 'digitalWrite(13, HIGH);  // acende\ndigitalWrite(13, LOW);   // apaga',
    situation: 'Acender e apagar LEDs.',
    exercise: { q: 'Como apagar o LED do pino 12?', options: ['digitalWrite(12, LOW);', 'digitalWrite(12, HIGH);', 'pinMode(12, LOW);'], correct: 0, explain: 'LOW deixa o pino em 0 V.' },
  },
  {
    id: 'digitalRead', name: 'digitalRead()', group: 'Pinos',
    explain: 'Lê um pino de entrada e devolve HIGH (1) ou LOW (0).',
    syntax: 'int valor = digitalRead(pino);',
    example: 'int botao = digitalRead(2);',
    situation: 'Saber se um botão está apertado.',
    exercise: { q: 'Com INPUT_PULLUP, o que digitalRead devolve com o botão apertado?', options: ['HIGH', 'LOW', '1023'], correct: 1, explain: 'Apertado liga o pino ao GND: LOW.' },
  },
  {
    id: 'analogRead', name: 'analogRead()', group: 'Pinos',
    explain: 'Lê a tensão de um pino analógico (A0 a A5) e devolve um número de 0 a 1023.',
    syntax: 'int valor = analogRead(A0);',
    example: 'int luz = analogRead(A0);',
    situation: 'Ler potenciômetros, sensores de luz e de temperatura.',
    exercise: { q: 'Com 5 V no pino A0, analogRead(A0) devolve…', options: ['5', '255', '1023'], correct: 2, explain: '5 V corresponde ao valor máximo: 1023.' },
  },
  {
    id: 'analogWrite', name: 'analogWrite()', group: 'Pinos',
    explain: 'Gera um sinal PWM (liga e desliga muito rápido). O valor vai de 0 (sempre desligado) a 255 (sempre ligado). Só nos pinos com ~.',
    syntax: 'analogWrite(pino, valor);',
    example: 'analogWrite(9, 128);  // brilho médio',
    situation: 'Controlar o brilho de um LED.',
    exercise: { q: 'Qual valor deixa o LED com brilho máximo?', options: ['1023', '255', '100'], correct: 1, explain: 'No analogWrite o máximo é 255.' },
  },
  {
    id: 'delay', name: 'delay()', group: 'Tempo',
    explain: 'Faz o Arduino esperar. O valor é em milissegundos: 1000 = 1 segundo.',
    syntax: 'delay(milissegundos);',
    example: 'delay(500);  // meio segundo',
    situation: 'Deixar o LED aceso por um tempo antes de apagar.',
    exercise: { q: 'Quanto tempo espera delay(2000)?', options: ['2 milissegundos', '2 segundos', '20 segundos'], correct: 1, explain: '2000 ms = 2 segundos.' },
  },
  {
    id: 'if', name: 'if', group: 'Decisões e repetições',
    explain: 'Executa um bloco de instruções SOMENTE SE a condição for verdadeira.',
    syntax: 'if (condição) {\n  // faz isto\n}',
    example: 'if (luz < 300) {\n  digitalWrite(13, HIGH);\n}',
    situation: 'Acender a luz somente quando estiver escuro.',
    exercise: { q: 'Qual condição pergunta se botao é igual a LOW?', options: ['if (botao = LOW)', 'if (botao == LOW)', 'if botao LOW'], correct: 1, explain: 'Para comparar usamos ==.' },
  },
  {
    id: 'else', name: 'else', group: 'Decisões e repetições',
    explain: 'Vem logo depois do if: executa quando a condição do if é FALSA.',
    syntax: 'if (condição) {\n  // verdadeiro\n} else {\n  // falso\n}',
    example: 'if (botao == LOW) {\n  digitalWrite(12, HIGH);\n} else {\n  digitalWrite(12, LOW);\n}',
    situation: 'Verde se pode entrar, senão vermelho.',
    exercise: { q: 'O bloco do else roda quando…', options: ['a condição do if é verdadeira', 'a condição do if é falsa', 'sempre'], correct: 1, explain: 'else = senão.' },
  },
  {
    id: 'for', name: 'for', group: 'Decisões e repetições',
    explain: 'Repete um bloco um número certo de vezes, usando uma variável contadora.',
    syntax: 'for (início; condição; passo) {\n  // repete\n}',
    example: 'for (int i = 0; i < 3; i++) {\n  digitalWrite(13, HIGH);\n  delay(200);\n  digitalWrite(13, LOW);\n  delay(200);\n}',
    situation: 'Piscar um LED exatamente 3 vezes.',
    exercise: { q: 'for (int i = 1; i <= 4; i++) repete quantas vezes?', options: ['3', '4', '5'], correct: 1, explain: 'i vale 1, 2, 3 e 4.' },
  },
  {
    id: 'while', name: 'while', group: 'Decisões e repetições',
    explain: 'Repete ENQUANTO a condição for verdadeira.',
    syntax: 'while (condição) {\n  // repete\n}',
    example: 'while (digitalRead(2) == LOW) {\n  tone(8, 440);\n}\nnoTone(8);',
    situation: 'Tocar o buzzer enquanto o botão estiver apertado.',
    exercise: { q: 'O que acontece se a condição do while nunca ficar falsa?', options: ['Repete para sempre', 'Repete uma vez', 'Dá erro de montagem'], correct: 0, explain: 'Cuidado: o while só para quando a condição fica falsa.' },
  },
  {
    id: 'int', name: 'int', group: 'Variáveis',
    explain: 'Tipo de variável para números inteiros (sem vírgula). No Arduino Uno vai de −32768 a 32767.',
    syntax: 'int nome = valor;',
    example: 'int contador = 0;\ncontador = contador + 1;',
    situation: 'Contar piscadas, guardar leituras de sensores.',
    exercise: { q: 'Qual linha está correta?', options: ['int pontos = 10;', 'int = 10 pontos;', 'pontos int 10;'], correct: 0, explain: 'Tipo, nome e valor.' },
  },
  {
    id: 'bool', name: 'bool', group: 'Variáveis',
    explain: 'Tipo de variável que guarda só verdadeiro (true) ou falso (false).',
    syntax: 'bool nome = true;',
    example: 'bool ligado = false;\nligado = !ligado;  // inverte',
    situation: 'Lembrar se uma luz está ligada ou desligada.',
    exercise: { q: 'Quais valores uma variável bool pode ter?', options: ['Qualquer número', 'true ou false', 'Só textos'], correct: 1, explain: 'bool = verdadeiro ou falso.' },
  },
  {
    id: 'HIGH', name: 'HIGH', group: 'Constantes',
    explain: 'Nível alto: 5 V no Arduino Uno. Representa "ligado".',
    syntax: 'digitalWrite(pino, HIGH);',
    example: 'digitalWrite(13, HIGH);',
    situation: 'Acender um LED.',
    exercise: { q: 'HIGH no Arduino Uno corresponde a…', options: ['0 V', '5 V', '12 V'], correct: 1, explain: 'HIGH = 5 V.' },
  },
  {
    id: 'LOW', name: 'LOW', group: 'Constantes',
    explain: 'Nível baixo: 0 V. Representa "desligado".',
    syntax: 'digitalWrite(pino, LOW);',
    example: 'digitalWrite(13, LOW);',
    situation: 'Apagar um LED; botão apertado com INPUT_PULLUP.',
    exercise: { q: 'LOW corresponde a…', options: ['0 V', '5 V', '3,3 V'], correct: 0, explain: 'LOW = 0 V.' },
  },
  {
    id: 'INPUT', name: 'INPUT', group: 'Constantes',
    explain: 'Modo de entrada simples. Sem um resistor externo, a entrada pode ficar "flutuando" (leitura instável).',
    syntax: 'pinMode(pino, INPUT);',
    example: 'pinMode(10, INPUT);  // ECHO do sensor ultrassônico',
    situation: 'Ler sinais que já vêm prontos de um sensor.',
    exercise: { q: 'O que pode acontecer com um botão em INPUT sem resistor?', options: ['A leitura fica instável quando ele está solto', 'O LED queima', 'Nada'], correct: 0, explain: 'A entrada fica "flutuando".' },
  },
  {
    id: 'OUTPUT', name: 'OUTPUT', group: 'Constantes',
    explain: 'Modo de saída: o pino fornece 5 V (HIGH) ou 0 V (LOW).',
    syntax: 'pinMode(pino, OUTPUT);',
    example: 'pinMode(13, OUTPUT);',
    situation: 'LEDs, buzzers, sinal de servo.',
    exercise: { q: 'Para um LED, o pino deve ser…', options: ['INPUT', 'OUTPUT', 'INPUT_PULLUP'], correct: 1, explain: 'O LED recebe energia do pino: saída.' },
  },
  {
    id: 'INPUT_PULLUP', name: 'INPUT_PULLUP', group: 'Constantes',
    explain: 'Entrada com um resistor interno ligado ao 5V. Botão solto = HIGH; botão apertado (ligado ao GND) = LOW.',
    syntax: 'pinMode(pino, INPUT_PULLUP);',
    example: 'pinMode(2, INPUT_PULLUP);\nif (digitalRead(2) == LOW) { /* apertado */ }',
    situation: 'Ligar botões só com dois fios (pino e GND), sem resistor externo.',
    exercise: { q: 'Com INPUT_PULLUP, o botão solto é lido como…', options: ['HIGH', 'LOW'], correct: 0, explain: 'O resistor interno puxa o pino para o 5V.' },
  },
];
