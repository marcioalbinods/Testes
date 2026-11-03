import type { Phase } from '../types';
import { T, ALWAYS, text, points } from '../tiles';

export const module4: Phase[] = [
  {
    id: 13,
    diagrams: ['states'],
    module: 4,
    title: 'Múltiplas regras: regras recuadas e páginas',
    difficulty: 'intermediario',
    estimatedMinutes: [50, 60],
    objective:
      'Combinar condições com regras recuadas (lógica "E") e organizar comportamentos em estados usando páginas e a ação switch.',
    skills: [
      'Criar regras recuadas (subordinadas)',
      'Combinar duas condições ("E")',
      'Programar estados diferentes em páginas',
      'Trocar de página com switch',
    ],
    prerequisites: [12],
    materials: ['Kodu Game Lab', 'Ilha da fase 12 (salve uma cópia "fase12" antes)'],
    projectLink: 'A entrega da estrela no castelo passa a valer pontos só quando o Kodu está com ela, e a tartaruga ganha dois "humores".',
    concept: {
      title: 'Regras dentro de regras e estados',
      paragraphs: [
        'Uma REGRA RECUADA fica deslocada para a direita, logo abaixo de outra. Ela só é verificada quando a regra de cima (a "mãe") é verdadeira. Assim você monta "SE encostou no castelo E está com a estrela, ENTÃO...".',
        'Uma regra mãe pode ter o DO vazio: ela serve só para agrupar as filhas.',
        'O programa de um personagem pode ter até 12 PÁGINAS. Só as regras da página atual funcionam. Cada página pode representar um ESTADO (calmo, assustado, perseguindo...). A ação switch troca de página.',
      ],
      example: 'Página 1 = tartaruga calma. Página 2 = tartaruga assustada. Encostou no Kodu? switch page 2. Passaram 5 segundos? switch page 1.',
    },
    steps: [
      {
        title: 'Salve a cópia de segurança',
        detail: 'Abra a Ilha e salve como "Ilha - apelido - fase12". Depois salve de novo com o nome original.',
        where: 'Home Menu → Save my world',
      },
      {
        title: 'Crie a regra mãe do castelo',
        detail:
          'No programa do Kodu, encontre "WHEN bumped castle DO drop". Logo ABAIXO dela, crie uma nova linha: WHEN bumped castle e deixe o DO vazio.',
        where: 'Kodu → Program',
      },
      {
        title: 'Crie a regra filha e recue-a',
        detail:
          'Na linha seguinte, monte: WHEN got star DO score red 5 points. Agora recue essa linha: clique no NÚMERO da linha para pegá-la e mova-a um pouco para a DIREITA (ou aperte a seta →) e solte. Ela deve ficar deslocada, "pendurada" na regra mãe.',
        where: 'Número da linha → mover para a direita → soltar',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 17, when: [T.bumped, T.castle], do: [T.drop] },
            { line: 18, when: [T.bumped, T.castle], do: [] },
            { line: 19, when: [T.got, T.star], do: [T.score, T.mRed, T.pts5], indent: 1 },
            { line: 20, when: [T.got, T.star, T.not], do: [T.say, text('Traga a estrela até aqui!')], indent: 1 },
          ],
          explanation: 'As linhas 19 e 20 só são verificadas quando o Kodu encosta no castelo. Com a estrela: +5 pontos. Sem: um aviso.',
        },
      },
      {
        title: 'Adicione a segunda filha',
        detail: 'Abaixo, também recuada: WHEN got star not DO say "Traga a estrela até aqui!".',
        where: 'Kodu → nova linha recuada',
      },
      {
        title: 'Teste os dois casos',
        detail: 'Jogue: (1) encoste no castelo SEM a estrela; (2) pegue a estrela e encoste no castelo. Observe placar e mensagens.',
        where: 'Esc → Esc',
        check: 'Sem a estrela: aparece o aviso e não ganha pontos. Com a estrela: +5 e a estrela cai.',
      },
      {
        title: 'Página 1 da tartaruga: calma',
        detail:
          'Abra o programa da tartaruga. Deixe na página 1: linha 1 WHEN see kodu close by DO move away quickly (da fase 8), linha 2 DO move wander slowly. Troque a regra "bumped kodu" por: WHEN bumped kodu DO switch page 2.',
        where: 'Tartaruga → Program → página 1',
        rules: {
          character: 'Tartaruga — página 1 (calma)',
          rules: [
            { line: 1, when: [T.see, T.kodu, T.closeBy], do: [T.move, T.away, T.quickly], page: 1 },
            { line: 2, when: ALWAYS, do: [T.move, T.wander, T.slowly], page: 1 },
            { line: 3, when: [T.bumped, T.kodu], do: [T.switchPage, T.page2], page: 1 },
          ],
          explanation: 'Se for tocada pelo Kodu, a tartaruga muda para o estado "assustada".',
        },
      },
      {
        title: 'Página 2 da tartaruga: assustada',
        detail:
          'No topo do editor há o indicador de página. Vá para a página 2 (clique na seta ao lado do número da página ou aperte Tab). Monte: linha 1 DO move wander quickly; linha 2 DO glow red; linha 3 WHEN timer 5 seconds DO switch page 1.',
        where: 'Editor → página 2',
        rules: {
          character: 'Tartaruga — página 2 (assustada)',
          rules: [
            { line: 1, when: ALWAYS, do: [T.move, T.wander, T.quickly], page: 2 },
            { line: 2, when: ALWAYS, do: [T.glow, T.mRed], page: 2 },
            { line: 3, when: [T.timer, T.sec5], do: [T.switchPage, T.page1], page: 2 },
          ],
          explanation: 'Ela corre e brilha em vermelho por 5 segundos, depois volta ao estado calmo.',
        },
      },
      {
        title: 'Apague o brilho na página 1',
        detail: 'Volte à página 1 e acrescente: DO glow off (WHEN vazio). Sem isso, o brilho vermelho continuaria depois da volta.',
        where: 'Tartaruga → página 1 → nova linha',
      },
      {
        title: 'Teste e salve',
        detail: 'Jogue, encoste na tartaruga e cronometre: ela deve ficar assustada por cerca de 5 segundos. Salve.',
        where: 'Esc → Esc → Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'Encostar no castelo sem a estrela mostra um aviso; com a estrela dá +5 pontos. A tartaruga fica assustada (corre e brilha) por 5 segundos depois de ser tocada e volta ao normal.',
    checklist: [
      { id: 'backup', text: 'Salvei a cópia "fase12"', required: true },
      { id: 'mae', text: 'Criei a regra mãe WHEN bumped castle', required: true },
      { id: 'recuo', text: 'Recuei as regras got star e got star not', required: true },
      { id: 'teste-e', text: 'Testei com e sem a estrela', required: true },
      { id: 'pagina2', text: 'A tartaruga troca para a página 2 ao ser tocada', required: true },
      { id: 'volta', text: 'A tartaruga volta para a página 1 depois de 5 segundos', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Para "isto E aquilo", uma regra precisa depender da outra. Para "modos" diferentes, pense em páginas.',
      'Regra mãe: WHEN bumped castle (DO vazio). Regra filha recuada: WHEN got star DO score red 5 points. Na tartaruga: switch page 2 na página 1; timer 5 seconds + switch page 1 na página 2.',
      'Para recuar: clique no número da linha filha, mova para a direita, solte. Para trocar de página no editor: indicador de página no topo (ou Tab). Confira a página antes de montar cada regra.',
    ],
    troubleshooting: [
      { problem: 'Ganho pontos encostando no castelo sem estrela.', solution: 'A regra got star não está recuada (ou está recuada sob a regra errada). Ela precisa ficar logo abaixo da regra mãe "bumped castle".' },
      { problem: 'Não consigo recuar a linha.', solution: 'Com a linha "pega", use a seta → do teclado. Em versões antigas sem recuo, use a solução da fase 17 com placares como "bandeiras".' },
      { problem: 'A tartaruga para de se mexer depois de ser tocada.', solution: 'A página 2 está vazia ou você montou as regras na página errada. Confira o número da página no topo do editor.' },
      { problem: 'A tartaruga nunca volta ao normal.', solution: 'Falta a regra WHEN timer 5 seconds DO switch page 1 na página 2.' },
    ],
    guidingQuestions: ['O que acontece com as regras da página 1 quando a tartaruga está na página 2?', 'Como você explicaria regra recuada usando a palavra "E"?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Uma regra recuada (filha) é verificada...',
        options: [
          { id: 'a', text: 'sempre, como qualquer regra' },
          { id: 'b', text: 'somente quando a regra mãe, logo acima, é verdadeira' },
          { id: 'c', text: 'somente na página 2' },
          { id: 'd', text: 'nunca' },
        ],
        explanation: 'O recuo faz a regra depender da mãe: funciona como "E".',
      },
      {
        id: 'q2',
        prompt: 'A tartaruga está na página 2. As regras da página 1...',
        options: [
          { id: 'a', text: 'continuam funcionando junto' },
          { id: 'b', text: 'não funcionam até ela voltar para a página 1' },
          { id: 'c', text: 'são apagadas' },
          { id: 'd', text: 'passam para o Kodu' },
        ],
        explanation: 'Só as regras da página atual são executadas.',
      },
      {
        id: 'q3',
        prompt: 'Qual ação troca a página do programa?',
        options: [
          { id: 'a', text: 'switch' },
          { id: 'b', text: 'turn' },
          { id: 'c', text: 'drop' },
          { id: 'd', text: 'play' },
        ],
        explanation: 'switch + page N muda para a página N.',
      },
      {
        id: 'q4',
        prompt: 'Você quer: "SE encostar no castelo E estiver com a estrela, ganhe 5 pontos". Qual estrutura usar?',
        options: [
          { id: 'a', text: 'Duas regras independentes sem recuo' },
          { id: 'b', text: 'Regra mãe "bumped castle" + regra filha recuada "got star → score"' },
          { id: 'c', text: 'Uma regra com dois DO' },
          { id: 'd', text: 'Uma página nova para o castelo' },
        ],
        explanation: 'A combinação de condições se faz com a regra filha recuada.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie uma página 3 para o Kodu: um "modo turbo" de 5 segundos que começa quando ele come um coração (heart). Atenção: na página 3, as regras da página 1 (andar, comer, pontuar) param! Você precisará copiar as regras essenciais (botão direito no número da linha → Copy Row / Paste Row, se a sua versão permitir) ou recriá-las.',
    reflection: {
      prompt: 'Onde, em um jogo que você conhece, um personagem muda de "estado"? Como você programaria isso com páginas?',
      guide: 'Descreva os estados e o que faz o personagem passar de um para outro.',
    },
    glossary: ['pagina', 'estado', 'recuo'],
    versionNotes: ['Regras recuadas existem a partir das versões 1.2 do Kodu. Se a sua não tiver, use a técnica de "bandeira" com placares (fase 17).'],
  },

  {
    id: 14,
    diagrams: ['states'],
    module: 4,
    title: 'Inimigos com comportamento próprio',
    difficulty: 'dificil',
    estimatedMinutes: [50, 65],
    objective:
      'Criar um inimigo que patrulha um caminho e persegue o jogador quando o vê, usando caminhos coloridos, páginas e o sensor see.',
    skills: [
      'Criar um caminho de patrulha (Add Plain Path) colorido',
      'Usar move on path',
      'Programar estados de patrulha e perseguição',
      'Equilibrar a dificuldade (velocidade, alcance)',
    ],
    prerequisites: [13],
    materials: ['Kodu Game Lab', 'Ilha da fase 13'],
    projectLink: 'A Ilha ganha um guarda: o Cycle patrulha o corredor e persegue o Kodu.',
    concept: {
      title: 'Inimigos são personagens com estados',
      paragraphs: [
        'Um NPC (personagem não jogável) tem comportamento próprio. Um inimigo típico tem pelo menos dois estados: PATRULHA (segue um trajeto) e PERSEGUIÇÃO (vai atrás do jogador).',
        'A Path Tool cria um trajeto invisível com Add Plain Path. O modificador on path faz o personagem andar sobre um caminho. Estradas e muros também são caminhos — por isso vamos dar uma COR ao caminho de patrulha e usar essa cor na regra.',
        'Equilíbrio é essencial: um inimigo rápido demais deixa o jogo frustrante; lento demais, sem graça.',
      ],
    },
    steps: [
      {
        title: 'Crie o caminho de patrulha',
        detail:
          'Abra a Ilha. Path Tool → botão direito no chão → Add Plain Path. Clique 4 pontos formando um retângulo dentro ou perto do corredor e termine. Clique em um ponto do caminho e use as setas ← → para mudar a cor do caminho para vermelho.',
        where: 'Path Tool → Add Plain Path → setas para a cor',
        check: 'No modo de edição você vê o caminho vermelho (no jogo ele fica invisível).',
      },
      {
        title: 'Feche o circuito',
        detail:
          'Para o inimigo dar voltas, o último ponto deve se ligar ao primeiro. Se o seu caminho ficou aberto, arraste o último ponto até o primeiro ou adicione um trecho (botão direito sobre um ponto → opções como Add More Nodes).',
        where: 'Path Tool → arrastar pontos',
      },
      {
        title: 'Adicione o Cycle',
        detail: 'Object Tool → coloque um Cycle perto do caminho vermelho. Com as setas, mude a cor dele para vermelho (fica claro que é inimigo).',
        where: 'Object Tool → Cycle',
      },
      {
        title: 'Página 1: patrulha',
        detail:
          'Programa do Cycle, página 1: linha 1 WHEN see kodu close by DO switch page 2. Linha 2: DO move on path → red (cor do caminho).',
        where: 'Cycle → Program → página 1',
        rules: {
          character: 'Cycle — página 1 (patrulha)',
          rules: [
            { line: 1, when: [T.see, T.kodu, T.closeBy], do: [T.switchPage, T.page2], page: 1 },
            { line: 2, when: ALWAYS, do: [T.move, T.onPath, T.mRed], page: 1 },
          ],
          explanation: 'Segue o caminho vermelho; se vir o Kodu por perto, passa a perseguir.',
        },
      },
      {
        title: 'Página 2: perseguição',
        detail:
          'Página 2: linha 1 WHEN see kodu DO move toward. Linha 2: WHEN see kodu not DO switch page 1. Linha 3: DO glow red (para o jogador perceber o perigo). Na página 1, acrescente DO glow off.',
        where: 'Cycle → página 2',
        rules: {
          character: 'Cycle — página 2 (perseguição)',
          rules: [
            { line: 1, when: [T.see, T.kodu], do: [T.move, T.toward], page: 2 },
            { line: 2, when: [T.see, T.kodu, T.not], do: [T.switchPage, T.page1], page: 2 },
            { line: 3, when: ALWAYS, do: [T.glow, T.mRed], page: 2 },
          ],
          explanation: 'Persegue enquanto vê o Kodu; ao perdê-lo de vista, volta a patrulhar.',
        },
      },
      {
        title: 'Consequência para o jogador',
        detail: 'No programa do Kodu: WHEN bumped cycle DO end. (Na fase 15 isso vira um sistema de vidas.)',
        where: 'Kodu → nova linha',
      },
      {
        title: 'Teste a patrulha',
        detail: 'Jogue SEM chegar perto. O Cycle deve dar voltas no caminho vermelho.',
        where: 'Esc → Esc',
        check: 'O Cycle percorre o circuito repetidamente.',
      },
      {
        title: 'Teste a perseguição e o equilíbrio',
        detail:
          'Aproxime-se, deixe-se ver e fuja. Você consegue escapar? Se for impossível, deixe o Cycle mais lento (move toward slowly) ou troque close by por algo mais restrito. Se for fácil demais, use quickly. Anote a configuração escolhida.',
        where: 'Esc → Esc',
      },
      {
        title: 'Salve',
        detail: 'Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'O Cycle vermelho patrulha o circuito, persegue o Kodu quando o vê por perto, volta a patrulhar ao perdê-lo de vista e encerra o jogo se encostar no Kodu.',
    checklist: [
      { id: 'caminho', text: 'Criei um caminho Plain vermelho e fechado', required: true },
      { id: 'cycle', text: 'Adicionei o Cycle vermelho', required: true },
      { id: 'patrulha', text: 'O Cycle patrulha com move on path red', required: true },
      { id: 'perseguicao', text: 'O Cycle persegue o Kodu e volta a patrulhar', required: true },
      { id: 'consequencia', text: 'Encostar no Cycle encerra o jogo', required: true },
      { id: 'equilibrio', text: 'Ajustei a velocidade e anotei a configuração', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Divida o inimigo em dois comportamentos e coloque cada um em uma página. Pense no que faz ele trocar de um para o outro.',
      'Patrulha: move on path (com a cor do caminho). Perseguição: see kodu → move toward. Trocas: switch page 2 quando vê; switch page 1 quando "see kodu not".',
      'Página 1: WHEN see kodu close by DO switch page 2 | DO move on path red. Página 2: WHEN see kodu DO move toward | WHEN see kodu not DO switch page 1 | DO glow red.',
    ],
    troubleshooting: [
      { problem: 'O Cycle fica parado.', solution: 'Ele não está perto do caminho ou a cor na regra não é a do caminho. Coloque-o em cima do caminho e confira a cor.' },
      { problem: 'O Cycle segue a estrada ou o muro.', solution: 'Falta a cor na regra move on path. Sem cor, ele segue qualquer caminho.' },
      { problem: 'O Cycle persegue para sempre.', solution: 'Falta a regra "WHEN see kodu not DO switch page 1" na página 2.' },
      { problem: 'O jogo acaba logo no início.', solution: 'O Cycle começa encostado no Kodu. Afaste-os no modo de edição.' },
    ],
    guidingQuestions: ['Por que usar uma cor específica para o caminho de patrulha?', 'Como você decidiu a velocidade do inimigo?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual regra faz o Cycle seguir o caminho de patrulha vermelho?',
        options: [
          { id: 'a', text: 'DO move on path red' },
          { id: 'b', text: 'DO move wander' },
          { id: 'c', text: 'WHEN see path DO jump' },
          { id: 'd', text: 'DO switch red' },
        ],
        explanation: 'move + on path + cor faz o personagem andar sobre o caminho daquela cor.',
      },
      {
        id: 'q2',
        prompt: 'Na página 2 (perseguição), qual regra faz o Cycle voltar à patrulha?',
        options: [
          { id: 'a', text: 'WHEN see kodu DO move toward' },
          { id: 'b', text: 'WHEN see kodu not DO switch page 1' },
          { id: 'c', text: 'DO glow red' },
          { id: 'd', text: 'WHEN bumped kodu DO end' },
        ],
        explanation: 'Quando o Kodu sai do campo de visão, a condição "not" fica verdadeira e ele troca de página.',
      },
      {
        id: 'q3',
        prompt: 'O que é um NPC?',
        options: [
          { id: 'a', text: 'O personagem controlado pelo jogador' },
          { id: 'b', text: 'Um personagem controlado pelo próprio jogo' },
          { id: 'c', text: 'Um tipo de terreno' },
          { id: 'd', text: 'Um placar' },
        ],
        explanation: 'NPC = non-player character: age segundo o próprio programa.',
      },
      {
        id: 'q4',
        prompt: 'Os jogadores dizem que é impossível fugir do inimigo. Qual é uma boa correção?',
        options: [
          { id: 'a', text: 'Apagar o Kodu' },
          { id: 'b', text: 'Deixar o inimigo mais lento ou reduzir quando ele começa a perseguir' },
          { id: 'c', text: 'Adicionar mais inimigos' },
          { id: 'd', text: 'Tirar a regra de vitória' },
        ],
        explanation: 'Equilibrar velocidade e alcance torna o desafio justo.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Adicione um segundo inimigo diferente (por exemplo, um disco voador — saucer) que use outro caminho de cor diferente. Os dois inimigos devem ter comportamentos distintos (um só patrulha, outro persegue).',
    reflection: {
      prompt: 'Explique os dois estados do seu inimigo e o que faz ele mudar de um para o outro.',
      guide: 'Use as palavras "página", "condição" e "switch".',
    },
    glossary: ['npc', 'patrulha'],
  },

  {
    id: 15,
    diagrams: ['counter'],
    module: 4,
    title: 'Tempo, vidas e o modificador once',
    difficulty: 'dificil',
    estimatedMinutes: [50, 65],
    objective:
      'Usar o temporizador para criar um limite de tempo, placares como contadores de vidas e o modificador once para evitar que uma ação se repita sem querer.',
    skills: [
      'Usar o sensor timer, que se repete',
      'Iniciar uma variável com set score ... once',
      'Criar contagem regressiva',
      'Evitar repetições indesejadas com once',
    ],
    prerequisites: [14],
    materials: ['Kodu Game Lab', 'Ilha da fase 14'],
    projectLink: 'A Ilha ganha relógio (60 segundos) e 3 vidas. O inimigo empurra para trás em vez de terminar o jogo.',
    concept: {
      title: 'Tempo e contadores',
      paragraphs: [
        'O sensor timer dispara a cada X segundos e recomeça a contar sozinho. "WHEN timer 1 second" é verdadeiro uma vez por segundo.',
        'O modificador once faz a ação acontecer só UMA VEZ a cada vez que a condição começa a valer. Com WHEN vazio, "set score blue 3 points once" acontece uma única vez, no início: perfeito para dar o valor inicial de uma variável.',
        'Por que once é importante? O sensor bumped continua verdadeiro enquanto os personagens estão encostados. Sem once, "perder uma vida" aconteceria muitas vezes em um só toque.',
      ],
      example: 'WHEN bumped cycle DO subtract blue 1 point once → perde exatamente 1 vida por encostão.',
    },
    steps: [
      {
        title: 'Vidas: valor inicial',
        detail: 'No programa do Kodu, nova linha: WHEN (vazio) DO set score → blue → 3 points → once.',
        where: 'Kodu → Program',
        rules: {
          character: 'Kodu',
          rules: [{ line: 21, when: ALWAYS, do: [T.setScore, T.mBlue, T.pts3, T.once] }],
          explanation: 'No início do jogo, o placar azul (vidas) vale 3.',
        },
      },
      {
        title: 'Perder vida ao encostar no inimigo',
        detail:
          'Encontre a regra "WHEN bumped cycle DO end" (fase 14) e troque a ação: WHEN bumped cycle DO subtract → blue → 1 point → once.',
        where: 'Kodu → regra do bumped cycle',
      },
      {
        title: 'Fim de jogo sem vidas',
        detail: 'Nova linha: WHEN scored → blue → <= → 0 points DO end.',
        where: 'Kodu → nova linha',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 22, when: [T.bumped, T.cycle], do: [T.subtract, T.mBlue, T.pts1, T.once] },
            { line: 23, when: [T.scored, T.blue, T.lteq, points(0)], do: [T.end] },
          ],
          explanation: 'Cada encostão tira 1 vida; com 0 vidas, fim de jogo.',
        },
      },
      {
        title: 'Inimigo recua depois de atingir',
        detail:
          'Para o Cycle não "grudar" no Kodu: no programa do Cycle, página 2, adicione no TOPO: WHEN bumped kodu DO switch page 3. Na página 3: linha 1 WHEN see kodu DO move away quickly; linha 2 WHEN timer 3 seconds DO switch page 1.',
        where: 'Cycle → páginas 2 e 3',
        rules: {
          character: 'Cycle — página 3 (recuo)',
          rules: [
            { line: 1, when: [T.see, T.kodu], do: [T.move, T.away, T.quickly], page: 3 },
            { line: 2, when: [T.timer, T.sec3], do: [T.switchPage, T.page1], page: 3 },
          ],
          explanation: 'Depois de atingir o Kodu, o Cycle se afasta por 3 segundos e volta a patrulhar.',
        },
      },
      {
        title: 'Relógio: valor inicial',
        detail:
          'No Kodu: WHEN (vazio) DO set score → green → 50 points → 10 points → once. (Blocos de número se somam: 50 + 10 = 60.)',
        where: 'Kodu → nova linha',
      },
      {
        title: 'Contagem regressiva',
        detail: 'Nova linha: WHEN timer 1 second DO subtract → green → 1 point. Nova linha: WHEN scored green <= 0 points DO end.',
        where: 'Kodu → novas linhas',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 24, when: ALWAYS, do: [T.setScore, T.mGreen, T.pts50, T.pts10, T.once] },
            { line: 25, when: [T.timer, T.sec1], do: [T.subtract, T.mGreen, T.pts1] },
            { line: 26, when: [T.scored, T.green, T.lteq, points(0)], do: [T.end] },
          ],
          explanation: '60 segundos para vencer. A cada segundo, −1. Chegou a 0? Fim.',
        },
      },
      {
        title: 'Atualize a descrição do mundo',
        detail: 'Explique ao jogador: "Você tem 3 vidas (azul) e 60 segundos (verde)."',
        where: 'Home Menu → Save my world → descrição',
      },
      {
        title: 'Teste cada contador',
        detail:
          'Teste 1: encoste no Cycle 1 vez → vidas devem ir de 3 para 2 (não para 0!). Teste 2: encoste 3 vezes → fim de jogo. Teste 3: espere parado → o verde desce de 1 em 1 e o jogo acaba em 0. Teste 4: ainda dá para vencer em 60 segundos?',
        where: 'Esc → Esc',
      },
      {
        title: 'Experimento com once',
        detail: 'Remova temporariamente o once da regra do bumped cycle e teste. Anote o que acontece. Depois coloque o once de volta.',
        where: 'Kodu → regra do bumped cycle',
      },
      {
        title: 'Salve',
        detail: 'Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'O jogo começa com 3 vidas e 60 segundos. Cada encostão do Cycle tira exatamente 1 vida e o Cycle recua. O jogo acaba com 0 vidas ou com o tempo esgotado. Ainda é possível vencer.',
    checklist: [
      { id: 'vidas-inicio', text: 'Vidas começam em 3 (set score blue 3 points once)', required: true },
      { id: 'vida-menos', text: 'Encostar no Cycle tira exatamente 1 vida (once)', required: true },
      { id: 'fim-vidas', text: 'Sem vidas, o jogo acaba', required: true },
      { id: 'recuo', text: 'O Cycle recua por 3 segundos depois de atingir', required: true },
      { id: 'relogio', text: 'O relógio começa em 60 e desce 1 por segundo', required: true },
      { id: 'fim-tempo', text: 'Com o tempo esgotado, o jogo acaba', required: true },
      { id: 'once-teste', text: 'Fiz o experimento sem once e anotei o resultado', required: true },
      { id: 'vencivel', text: 'Confirmei que ainda é possível vencer', required: true },
    ],
    hints: [
      'Um contador precisa de três coisas: valor inicial, regra que muda o valor e regra que verifica o limite.',
      'Valor inicial: set score + cor + número + once (WHEN vazio). Mudança: subtract. Limite: scored + cor + <= + 0 points → end. Para o tempo, timer 1 second.',
      'Vidas: DO set score blue 3 points once | WHEN bumped cycle DO subtract blue 1 point once | WHEN scored blue <= 0 points DO end. Tempo: DO set score green 50 points 10 points once | WHEN timer 1 second DO subtract green 1 point | WHEN scored green <= 0 points DO end.',
    ],
    troubleshooting: [
      { problem: 'Perco todas as vidas em um encostão.', solution: 'Falta o once na regra do bumped cycle, ou o Cycle continua encostado. Confira também a página 3 de recuo.' },
      { problem: 'As vidas voltam para 3 o tempo todo.', solution: 'Falta o once na regra set score blue 3 points.' },
      { problem: 'O relógio não desce.', solution: 'Confira o timer 1 second e a cor green na regra subtract.' },
      { problem: 'O jogo termina na hora.', solution: 'A regra de fim compara o placar antes de ele receber o valor inicial? Garanta o once nas regras de valor inicial e coloque-as nas primeiras linhas do programa.' },
    ],
    guidingQuestions: ['Quais são as três partes de um contador?', 'Por que bumped sem once tirou muitas vidas?'],
    quiz: [
      {
        id: 'q1',
        prompt: '"WHEN timer 1 second DO subtract green 1 point". Depois de 10 segundos, quanto foi subtraído?',
        options: [
          { id: 'a', text: '1 ponto' },
          { id: 'b', text: 'cerca de 10 pontos' },
          { id: 'c', text: '0' },
          { id: 'd', text: '60 pontos' },
        ],
        explanation: 'O timer recomeça sozinho e dispara uma vez por segundo.',
      },
      {
        id: 'q2',
        prompt: 'Para que serve o once em "DO set score blue 3 points once"?',
        options: [
          { id: 'a', text: 'Para o valor 3 ser definido só uma vez, no início' },
          { id: 'b', text: 'Para somar 3 a cada segundo' },
          { id: 'c', text: 'Para mudar a cor do Kodu' },
          { id: 'd', text: 'Não tem efeito' },
        ],
        explanation: 'Sem once, a regra (sempre verdadeira) redefiniria as vidas para 3 o tempo todo.',
      },
      {
        id: 'q3',
        prompt: 'Sem once, "WHEN bumped cycle DO subtract blue 1 point" pode...',
        options: [
          { id: 'a', text: 'tirar várias vidas em um único encostão' },
          { id: 'b', text: 'dar vidas extras' },
          { id: 'c', text: 'nunca funcionar' },
          { id: 'd', text: 'trocar de página' },
        ],
        explanation: 'bumped continua verdadeiro enquanto há contato, então a ação se repete.',
      },
      {
        id: 'q4',
        prompt: 'Como formar o número 60 com blocos do Kodu?',
        options: [
          { id: 'a', text: 'Digitando 60' },
          { id: 'b', text: 'Combinando 50 points + 10 points' },
          { id: 'c', text: 'Não é possível' },
          { id: 'd', text: 'Usando 6 points' },
        ],
        explanation: 'Blocos de número em sequência se somam.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie corações (heart) que dão +1 vida (WHEN bumped heart DO eat it + WHEN bumped heart DO score blue 1 point). Depois, faça o tempo ficar mais interessante: cada moeda dá +5 segundos ao placar verde.',
    reflection: {
      prompt: 'Explique, como se fosse para um colega, o que o once faz e dê um exemplo de quando ele é indispensável.',
      guide: 'Use o experimento que você fez.',
    },
    glossary: ['temporizador', 'once'],
  },

  {
    id: 16,
    diagrams: ['debug'],
    module: 4,
    title: 'Testando e depurando: caça aos bugs',
    difficulty: 'dificil',
    estimatedMinutes: [50, 70],
    objective:
      'Aplicar um método de depuração para encontrar e corrigir erros em um programa com bugs e criar um plano de testes para a Ilha.',
    skills: [
      'Reproduzir um bug de forma consistente',
      'Formular hipóteses sobre a causa',
      'Mudar uma coisa por vez e testar de novo',
      'Escrever casos de teste com resultado esperado',
    ],
    prerequisites: [15],
    materials: ['Kodu Game Lab', 'Caderno ou folha para a tabela de bugs', 'Ilha da fase 15'],
    projectLink: 'A Ilha passa por um teste completo. Ao final, você tem a versão "Ilha 1.0", sem bugs conhecidos.',
    concept: {
      title: 'Método de depuração em 5 passos',
      paragraphs: [
        '1) REPRODUZIR: descubra exatamente o que fazer para o bug acontecer de novo. 2) OBSERVAR: leia as regras envolvidas. 3) HIPÓTESE: "acho que o problema é...". 4) MUDAR UMA COISA SÓ e testar. 5) REGISTRAR o que funcionou.',
        'Bugs comuns no Kodu: regra no personagem errado; ordem de regras com conflito; falta do it; cor diferente entre score e scored; comparação "igual" em vez de >=; falta de once; regras na página errada.',
        'Um CASO DE TESTE descreve: o que fazer, o resultado esperado e o resultado obtido.',
      ],
    },
    steps: [
      {
        title: 'Crie um mundo de laboratório',
        detail:
          'Menu principal → NEW WORLD. Salve como "Laboratório de bugs - apelido". Coloque: o Kodu, 3 maçãs vermelhas e 1 pedra. Ative Glass Walls.',
        where: 'NEW WORLD → Object Tool',
      },
      {
        title: 'Monte o programa com bugs',
        detail:
          'Monte EXATAMENTE este programa no Kodu (ele tem 5 bugs de propósito). Não corrija nada ainda.',
        where: 'Kodu → Program',
        rules: {
          character: 'Kodu (programa com bugs!)',
          rules: [
            { line: 1, when: ALWAYS, do: [T.move, T.wander] },
            { line: 2, when: [T.keyboard, T.arrows], do: [T.move] },
            { line: 3, when: [T.bumped, T.apple], do: [T.eat] },
            { line: 4, when: [T.bumped, T.apple], do: [T.score, T.mBlue, T.pts1] },
            { line: 5, when: [T.scored, T.red, T.gteq, points(3)], do: [T.win] },
            { line: 6, when: [T.bumped, T.rock], do: [T.subtract, T.mRed, T.pts1] },
          ],
          explanation: 'Objetivo pretendido: controlar o Kodu pelas setas, comer as 3 maçãs (+1 vermelho cada), vencer com 3 pontos e perder 1 ponto por batida na pedra.',
        },
      },
      {
        title: 'Monte a tabela de bugs',
        detail:
          'No caderno, faça uma tabela com 4 colunas: SINTOMA (o que acontece de errado) | COMO REPRODUZIR | CAUSA (qual regra) | CORREÇÃO.',
        where: 'Caderno',
      },
      {
        title: 'Investigue o controle',
        detail: 'Jogue sem apertar nada, depois apertando as setas. Registre o sintoma. Lembre da fase 5 e 6: o que acontece quando duas regras disputam o movimento?',
        where: 'Esc → Esc',
      },
      {
        title: 'Investigue a coleta e a pontuação',
        detail: 'Encoste em uma maçã. Ela some? Qual placar mudou? A cor bate com a regra de vitória?',
        where: 'Esc → Esc',
      },
      {
        title: 'Investigue a pedra',
        detail: 'Encoste na pedra e fique encostado por 2 segundos. Quantos pontos foram perdidos? Por quê? (Fase 15.)',
        where: 'Esc → Esc',
      },
      {
        title: 'Corrija um bug por vez',
        detail:
          'Para cada linha da tabela: faça UMA correção, teste, e só então passe para o próximo. Se uma correção não funcionar, desfaça e tente outra hipótese.',
        where: 'Kodu → Program',
        check: 'Ao final: setas controlam, maçãs somem e somam vermelho, 3 pontos dão vitória, a pedra tira 1 ponto por batida.',
      },
      {
        title: 'Plano de testes da Ilha',
        detail:
          'Abra a Ilha. Escreva pelo menos 6 casos de teste, um por regra importante: vencer com 10 maçãs, perder na água, perder 3 vidas, tempo esgotado, maçã azul tira 2, estrela entregue dá +5. Para cada um: o que fazer | resultado esperado | resultado obtido (OK/FALHOU).',
        where: 'Caderno',
      },
      {
        title: 'Execute os testes e corrija',
        detail:
          'Execute cada caso. Corrija o que falhar usando o método. Use Home Menu → Print kode for level para revisar o programa inteiro, se a sua instalação permitir.',
        where: 'Ilha → Esc → Esc',
      },
      {
        title: 'Salve como versão 1.0',
        detail: 'Salve a Ilha como "Ilha - apelido - 1.0".',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [
      {
        character: 'Kodu (laboratório) — exemplo de programa corrigido',
        rules: [
          { line: 1, when: [T.keyboard, T.arrows], do: [T.move] },
          { line: 2, when: [T.bumped, T.apple], do: [T.eat, T.it] },
          { line: 3, when: [T.bumped, T.apple], do: [T.score, T.mRed, T.pts1] },
          { line: 4, when: [T.scored, T.red, T.gteq, points(3)], do: [T.win] },
          { line: 5, when: [T.bumped, T.rock], do: [T.subtract, T.mRed, T.pts1, T.once] },
        ],
        explanation:
          'Consulte este gabarito só depois de tentar! Correções: (1) remover "move wander" que conflita com o teclado; (2) acrescentar "it" ao eat; (3) placar azul → vermelho; (4) a vitória agora usa a mesma cor; (5) once na pedra.',
      },
    ],
    expectedResult:
      'Você encontrou e corrigiu os 5 bugs do laboratório, registrou-os na tabela e executou pelo menos 6 casos de teste na Ilha, salvando a versão 1.0.',
    checklist: [
      { id: 'lab', text: 'Montei o mundo de laboratório com o programa com bugs', required: true },
      { id: 'tabela', text: 'Preenchi a tabela de bugs (sintoma, reprodução, causa, correção)', required: true },
      { id: 'bug-controle', text: 'Corrigi o conflito de movimento', required: true },
      { id: 'bug-it', text: 'Corrigi o eat sem it', required: true },
      { id: 'bug-cor', text: 'Corrigi a cor do placar', required: true },
      { id: 'bug-once', text: 'Corrigi a pedra com once', required: true },
      { id: 'casos', text: 'Escrevi e executei 6 casos de teste na Ilha', required: true },
      { id: 'versao', text: 'Salvei a Ilha 1.0', required: true },
    ],
    hints: [
      'Não tente corrigir tudo de uma vez. Faça um teste para cada comportamento e compare com o objetivo pretendido.',
      'Os bugs envolvem: prioridade de movimento, o modificador it, cores de placar e o modificador once. Confira cada linha procurando um desses.',
      'Linha 1 (wander) briga com o teclado: apague-a. Linha 3: eat it. Linha 4: score red. Linha 6: subtract red 1 point once. Teste depois de cada mudança.',
    ],
    troubleshooting: [
      { problem: 'Não acho a causa de um bug.', solution: 'Desative suspeitos: apague temporariamente uma regra e teste. Se o bug sumir, a causa está nela (ou na interação dela com outra).' },
      { problem: 'Corrigi um bug e apareceu outro.', solution: 'Normal! Registre o novo na tabela. Por isso mudamos uma coisa por vez.' },
      { problem: 'O teste às vezes funciona, às vezes não.', solution: 'Procure o que muda entre as tentativas: posição inicial, câmera, velocidade. Tente reproduzir sempre igual.' },
      { problem: 'Print kode não funciona.', solution: 'Depende da impressora/instalação. Revise as regras na tela, página por página.' },
    ],
    guidingQuestions: ['Por que mudar uma coisa por vez?', 'Qual bug foi o mais difícil de achar e o que ajudou a encontrá-lo?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual é o PRIMEIRO passo do método de depuração?',
        options: [
          { id: 'a', text: 'Apagar o programa e começar de novo' },
          { id: 'b', text: 'Reproduzir o bug de forma consistente' },
          { id: 'c', text: 'Pedir para o professor corrigir' },
          { id: 'd', text: 'Mudar várias regras ao mesmo tempo' },
        ],
        explanation: 'Sem reproduzir o bug, não dá para saber se a correção funcionou.',
      },
      {
        id: 'q2',
        prompt: 'O placar azul sobe ao comer maçã, mas a regra de vitória observa o vermelho. Que tipo de bug é esse?',
        options: [
          { id: 'a', text: 'Conflito de prioridade' },
          { id: 'b', text: 'Inconsistência de variável (cores diferentes)' },
          { id: 'c', text: 'Falta de it' },
          { id: 'd', text: 'Não é um bug' },
        ],
        explanation: 'A regra que muda a variável e a que a verifica precisam usar a mesma cor.',
      },
      {
        id: 'q3',
        prompt: 'Um bom caso de teste contém...',
        options: [
          { id: 'a', text: 'só o nome do jogo' },
          { id: 'b', text: 'o que fazer, o resultado esperado e o resultado obtido' },
          { id: 'c', text: 'a pontuação máxima' },
          { id: 'd', text: 'a cor do Kodu' },
        ],
        explanation: 'Comparar o esperado com o obtido é o que revela o bug.',
      },
      {
        id: 'q4',
        prompt: 'Por que mudar UMA coisa por vez ao corrigir?',
        options: [
          { id: 'a', text: 'Para saber exatamente qual mudança resolveu (ou causou) o problema' },
          { id: 'b', text: 'Porque o Kodu só aceita uma mudança' },
          { id: 'c', text: 'Para demorar mais' },
          { id: 'd', text: 'Não faz diferença' },
        ],
        explanation: 'Várias mudanças juntas escondem a causa real.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie você mesmo um "programa com 3 bugs" em um mundo pequeno e troque com um colega. Cada um depura o do outro usando a tabela. Comparem as estratégias.',
    reflection: {
      prompt: 'Descreva o bug mais difícil que você encontrou hoje: o sintoma, a causa e como chegou à correção.',
      guide: 'Siga a ordem: sintoma → hipótese → teste → correção.',
    },
    glossary: ['bug', 'depuracao', 'caso-teste'],
  },
];
