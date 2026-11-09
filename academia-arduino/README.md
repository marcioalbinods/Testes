# ACADEMIA DE ARDUINO — Academia do Arduino do Prof. Márcio

**Aprenda, conecte, programe e invente!**

Plataforma educacional interativa de eletrônica, robótica e programação com Arduino, para estudantes de **9 a 13 anos**.
O site é um único arquivo HTML que funciona no GitHub Pages e até offline. Sem configuração nenhuma, o progresso fica
salvo **somente no navegador** (`localStorage`).

**Turma Robótica (opcional):** com o servidor da turma instalado no Google Drive do professor
([`google-apps-script/LEIA-ME.md`](google-apps-script/LEIA-ME.md)), o professor cadastra os estudantes, cada um recebe
**número de acesso e senha**, o progresso é salvo numa planilha do professor (continua em qualquer computador) e o
**Espaço do professor → Turma Robótica** mostra o desenvolvimento de cada estudante. O endereço do servidor fica em
`arduino/config.json`.

## O que tem na plataforma

| Área | O que faz |
|---|---|
| **Página inicial** | Apresentação, "Começar a aprender", mapa de aprendizagem, módulos, progresso, laboratórios, desafios e conquistas. |
| **Central de aprendizagem** | XP, níveis, medalhas, mapa das missões, recordes dos jogos, regras de ouro da bancada e botão para reiniciar o progresso (com confirmação). |
| **Curso — 20 missões** | 4 níveis. Cada missão tem objetivo, introdução, materiais, segurança, demonstração passo a passo, código completo explicado, atividade prática, perguntas com feedback, desafio final e botão de conclusão (só libera depois da atividade e das perguntas). |
| **Conheça o Arduino** | Placa Uno R3 clicável (12 partes, com função, funcionamento, uso, exemplo e curiosidade), "Explore os pinos" (função, o que ligar, tipo de sinal, exemplo; cores separando entradas, saídas, energia e GND) e testes. |
| **Laboratório da protoboard** | Clique em um furo e veja tudo o que está ligado a ele; visão superior, "Ver por dentro" e conexões destacadas; trilhos contínuos ou interrompidos; modo de perguntas (pares de furos, grupo de 5, canal central, onde colocar o LED, pernas na mesma linha) e desafios de escolher furos. |
| **Laboratório de circuitos** | Bancada virtual com Arduino, protoboard, jumpers, LEDs, resistores, botão, buzzer, potenciômetro, LDR, servo e HC-SR04: colocar, arrastar, ligar fios, mover pontas, remover, desfazer, verificar a montagem. "Caminho da eletricidade" com animação da corrente (convencional ou elétrons) e cores de tensão. Simulador livre que roda programas. |
| **Escola de programação** | Biblioteca de 19 comandos com exercício; programação por blocos (arrastar, soltar, aninhar, remover) que gera o código C++ e uma explicação; editor com destaque, numeração, erros básicos, copiar, limpar e exemplos; exercícios de completar o código; "O que acontece se…?" com execução real. |
| **Enciclopédia** | 16 componentes com ilustração, símbolo, terminais, ligação, cuidados, exemplos e atividade; busca e filtros por categoria. |
| **Calculadora de resistores** | Código de cores (4 e 5 faixas), exercícios e resistor para LED com a Lei de Ohm explicada passo a passo e alertas de limite de corrente. |
| **Glossário** | Termos com definição simples e exemplo do cotidiano. |
| **Jogos** | Detetive de circuitos, Onde devo conectar?, Organize o código, Qual é o componente?, Preveja o resultado e Desafio de lógica — com instruções, feedback, tentativas, dicas progressivas, pontuação local e reinício. |
| **Espaço do professor** | Guia de aulas, tempos, kit de materiais, objetivos, códigos, respostas, dificuldades comuns, dicas e **modo de apresentação em tela cheia** (avançar/voltar, destacar conexões, ampliar, mostrar/esconder explicações e código, ligar e mostrar a corrente). |

## O que é simulado (e o que não é)

A bancada usa uma **simulação didática** (`src/lib/circuit/engine.ts`): o circuito é resolvido em corrente contínua por
análise nodal (Leis de Kirchhoff e de Ohm), com resistores ideais, LEDs com tensão de condução fixa e pinos do Arduino
com pequena resistência interna. Assim a plataforma detecta curto-circuito, LED invertido, LED sem resistor, pernas no
mesmo grupo, circuito aberto, entrada "flutuando" e motor ligado em pino digital. O buzzer, o servo e o sensor
ultrassônico seguem regras simples. **Não** simula capacitores, aquecimento, ruído nem motores DC. A animação da corrente
é identificada na tela como demonstração didática.

Os programas são executados por um **interpretador de um subconjunto do C++ do Arduino** (`src/lib/cpp/`), com `int` de
16 bits, divisão inteira, `Serial`, `Servo`, `tone`, `pulseIn`, `analogRead/Write`, `for`, `while`, `if`, funções e vetores.
Por isso os códigos mostrados nas missões são os mesmos que rodam no simulador.

## Verificação automática

`npm test` roda 42 testes que conferem, entre outros:

- a conectividade da protoboard (grupos de 5, canal central, trilhos contínuos e interrompidos);
- o motor elétrico (LED com resistor ≈ 13 mA, LED invertido, curto, botão com INPUT_PULLUP);
- que **cada circuito de referência das missões passa nas regras da sua atividade** e não tem perigos;
- que **todos os códigos** (missões, soluções e projetos) compilam sem erros nem avisos;
- que cada programa produz o comportamento descrito (pisca no tempo certo, semáforo na ordem certa, botão, notas do
  buzzer, brilho do potenciômetro, luz no escuro, servo nos ângulos, distância do HC-SR04, projetos finais);
- que cada caso do "Detetive de circuitos" realmente tem um defeito.

## Desenvolvimento

```bash
npm install
npm run dev            # servidor local
npm test               # testes automáticos
npm run build          # gera dist/index.html (um único arquivo)
npm run build:publish  # gera e copia para ../arduino/index.html (GitHub Pages deste repositório)
```

Tecnologias: React 18, TypeScript, Vite, CSS próprio, SVG, ícones Lucide e fontes embutidas (Lexend, Atkinson
Hyperlegible, JetBrains Mono). Roteamento por hash (`#/curso/missao/m7`), sem erros 404 no GitHub Pages.

### Estrutura

- `src/data/` — conteúdo separado da interface: missões (`missions1.ts`, `missions2.ts`), circuitos, comandos, componentes, jogos, conquistas.
- `src/lib/breadboard.ts` — modelo elétrico da protoboard. `src/lib/arduino.ts` — modelo da placa (troque por outro `BoardModel` para outras placas).
- `src/lib/circuit/` — peças, motor elétrico e regras de validação das atividades.
- `src/lib/cpp/` — analisador, verificador de erros e interpretador do código Arduino. `src/lib/sim/` — simulador.
- `src/components/` — bancada, editor de blocos, editor de código, atividades, apresentação.
- `src/svg/` — ilustrações próprias (Arduino, protoboard, componentes, mascote Faísca).
- `src/pages/` — páginas.

Para adicionar uma missão, crie um objeto `Mission` em `src/data/missions2.ts` (e um circuito em `circuits.ts`);
os testes conferem automaticamente se o circuito passa nas regras e se o código compila.

## Publicar em um repositório próprio

1. Crie o repositório (ex.: `academia-do-arduino-do-prof-marcio`) e copie para ele **o conteúdo desta pasta**.
2. Copie `deploy-proprio-repositorio/deploy.yml` para `.github/workflows/deploy.yml`.
3. No GitHub: **Settings → Pages → Source: GitHub Actions**. A cada envio para `main`, o site é testado e publicado.

## Privacidade e segurança

Sem a turma ligada, nenhum dado sai do navegador. Com a turma ligada, só o primeiro nome, o número de acesso e o
progresso vão para a planilha **do professor** (senhas guardadas apenas como hash; bloqueio após 8 tentativas erradas).
Não há e-mails, rankings públicos nem comparação entre estudantes. Todas as
atividades práticas trazem orientações de segurança (desligar o USB antes de alterar conexões, nunca ligar 5V no GND,
resistor nos LEDs, limites de corrente dos pinos, motores nunca nos pinos digitais, GND comum com fonte externa, nada de
rede elétrica da tomada).
