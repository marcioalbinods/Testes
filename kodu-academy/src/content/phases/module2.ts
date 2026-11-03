import type { Phase } from '../types';
import { T, ALWAYS, text } from '../tiles';

export const module2: Phase[] = [
  {
    id: 5,
    diagrams: ['rule-anatomy'],
    module: 2,
    title: 'A estrutura WHEN/DO e a ordem das regras',
    difficulty: 'facil',
    estimatedMinutes: [40, 50],
    objective:
      'Usar sensores no WHEN para criar regras do tipo "quando acontecer X, faça Y" e entender que, em regras que disputam a mesma ação, a regra de cima tem prioridade.',
    skills: [
      'Usar o sensor see com um filtro de objeto',
      'Combinar duas regras de movimento',
      'Reordenar regras e prever o efeito da ordem',
      'Usar a ação say com texto',
    ],
    prerequisites: [4],
    materials: ['Kodu Game Lab', 'Ilha da fase 4 (Kodu com DO move wander)'],
    projectLink: 'O Kodu da Ilha passa a reagir ao que vê: procura maçãs em vez de andar ao acaso.',
    concept: {
      title: 'WHEN = quando | DO = faça',
      paragraphs: [
        'Uma regra do Kodu funciona como uma frase: QUANDO (WHEN) uma condição é verdadeira, FAÇA (DO) uma ação.',
        'O primeiro bloco do WHEN é um SENSOR: é o "sentido" do personagem. O sensor see (ver) percebe objetos à frente. Depois do sensor você pode colocar o que ele deve perceber, como apple (maçã).',
        'O Kodu verifica todas as regras o tempo todo. Quando duas regras mandam o personagem se MOVER de jeitos diferentes ao mesmo tempo, vale a que estiver MAIS ACIMA. Por isso a ordem importa.',
      ],
      example: 'WHEN see apple DO move toward → "quando vir uma maçã, vá em direção a ela".',
    },
    steps: [
      {
        title: 'Abra o programa do Kodu',
        detail: 'Abra a Ilha (Edit) → Object Tool → botão direito no Kodu → Program. A linha 1 deve ter DO move wander.',
        where: 'Object Tool → botão direito → Program',
      },
      {
        title: 'Monte a regra "ver maçã" na linha 2',
        detail:
          'Na linha 2, clique no "+" depois do WHEN e escolha see. Clique no "+" seguinte e escolha apple (procure no grupo de objetos). Agora clique no "+" depois do DO e escolha move; no próximo "+", escolha toward.',
        where: 'Linha 2 → WHEN: see → apple | DO: move → toward',
        check: 'Linha 2: WHEN see apple DO move toward.',
      },
      {
        title: 'Faça uma previsão e teste',
        detail:
          'Antes de jogar, escreva no seu caderno: "Acho que o Kodu vai...". Agora jogue (Esc, Esc). Observe bem: o Kodu vai até as maçãs ou continua vagando?',
        where: 'Esc → Esc',
        check: 'Provavelmente ele continua vagando e ignora as maçãs. Isso é esperado!',
        rules: {
          character: 'Kodu (ordem errada)',
          rules: [
            { line: 1, when: ALWAYS, do: [T.move, T.wander] },
            { line: 2, when: [T.see, T.apple], do: [T.move, T.toward] },
          ],
          explanation: 'As duas regras querem controlar o movimento. A linha 1 está acima, então ela "ganha" e o Kodu vaga.',
        },
      },
      {
        title: 'Troque a ordem das regras',
        detail:
          'Volte ao editor. Clique sobre o NÚMERO da linha 2 para "pegar" a regra, leve-a para cima da linha 1 e clique para soltar. Se tiver dificuldade, apague as duas regras e monte de novo na ordem certa: primeiro "see apple → move toward", depois "move wander".',
        where: 'Editor → número da linha (alça) → arrastar para cima',
        rules: {
          character: 'Kodu (ordem certa)',
          rules: [
            { line: 1, when: [T.see, T.apple], do: [T.move, T.toward] },
            { line: 2, when: ALWAYS, do: [T.move, T.wander] },
          ],
          explanation: 'Se vê uma maçã, a linha 1 vale e ele vai até ela. Se não vê, só a linha 2 vale e ele vaga procurando.',
        },
      },
      {
        title: 'Teste de novo',
        detail: 'Jogue. Agora o Kodu deve vagar até avistar uma maçã e então ir até ela. Ele ainda não come — isso fica para a fase 7.',
        where: 'Esc → Esc',
        check: 'O Kodu vai até uma maçã e fica perto dela.',
      },
      {
        title: 'Faça o Kodu falar',
        detail:
          'Na linha 3, monte: WHEN see apple DO say. Ao escolher say, o Kodu abre uma caixa para digitar o texto: escreva "Achei uma maçã!" e confirme. Teste.',
        where: 'Linha 3 → WHEN: see → apple | DO: say → digitar texto',
        rules: {
          character: 'Kodu',
          rules: [{ line: 3, when: [T.see, T.apple], do: [T.say, text('Achei uma maçã!')] }],
          explanation: 'say mostra um balão de fala. Esta regra não disputa o movimento, então funciona junto com a linha 1.',
        },
      },
      {
        title: 'Salve',
        detail: 'Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [
      {
        character: 'Kodu',
        rules: [
          { line: 1, when: [T.see, T.apple], do: [T.move, T.toward] },
          { line: 2, when: ALWAYS, do: [T.move, T.wander] },
          { line: 3, when: [T.see, T.apple], do: [T.say, text('Achei uma maçã!')] },
        ],
        explanation: 'Programa final: procurar maçãs e avisar quando encontrar.',
      },
    ],
    expectedResult:
      'O Kodu vaga até ver uma maçã, vai em direção a ela e mostra o balão "Achei uma maçã!". Você consegue explicar por que a ordem das linhas 1 e 2 muda o comportamento.',
    checklist: [
      { id: 'see-apple', text: 'Montei WHEN see apple DO move toward', required: true },
      { id: 'previsao', text: 'Fiz uma previsão antes de testar', required: true },
      { id: 'ordem-errada', text: 'Observei o comportamento com a regra wander em cima', required: true },
      { id: 'reordenar', text: 'Coloquei a regra see apple acima da regra wander', required: true },
      { id: 'say', text: 'Fiz o Kodu dizer "Achei uma maçã!"', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Pense em prioridades: o que é mais importante para o Kodu — ir até a maçã ou passear? A regra mais importante deve vir primeiro.',
      'Use o sensor see no WHEN e o filtro apple. No DO, move com o modificador toward. Depois confira qual linha está acima.',
      'Ordem final: linha 1 = WHEN see apple DO move toward; linha 2 = WHEN (vazio) DO move wander; linha 3 = WHEN see apple DO say "Achei uma maçã!".',
    ],
    troubleshooting: [
      { problem: 'O Kodu ignora as maçãs.', solution: 'A regra wander está acima da regra see apple. Troque a ordem. Confira também se você escolheu apple (e não outro objeto).' },
      { problem: 'O Kodu fica parado.', solution: 'Verifique se a linha "move wander" ainda existe. Sem ela, se não houver maçã à vista, ele não tem o que fazer.' },
      { problem: 'Não consigo digitar o texto do say.', solution: 'Depois de escolher say, clique no bloco de texto que aparece (ou no "+") para abrir a caixa de digitação. Confirme ao terminar.' },
      { problem: 'O Kodu não vê uma maçã atrás do morro.', solution: 'O sensor see tem alcance limitado. Teste com maçãs mais próximas ou em lugar aberto.' },
    ],
    guidingQuestions: [
      'Por que o Kodu ignorou as maçãs quando a regra wander estava em cima?',
      'A regra do say "briga" com a regra de movimento? Por quê?',
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'Na regra "WHEN see apple DO move toward", qual parte é a condição?',
        options: [
          { id: 'a', text: 'move toward' },
          { id: 'b', text: 'see apple' },
          { id: 'c', text: 'DO' },
          { id: 'd', text: 'Não há condição' },
        ],
        explanation: 'A condição fica no WHEN: ela precisa ser verdadeira para a ação acontecer.',
      },
      {
        id: 'q2',
        prompt: 'Linha 1: WHEN (vazio) DO move wander. Linha 2: WHEN see apple DO move toward. O que acontece?',
        options: [
          { id: 'a', text: 'O Kodu vai até as maçãs' },
          { id: 'b', text: 'O Kodu vaga e ignora as maçãs, pois a linha 1 tem prioridade no movimento' },
          { id: 'c', text: 'O Kodu fica parado' },
          { id: 'd', text: 'O jogo dá erro' },
        ],
        explanation: 'Regras de movimento em conflito: vale a que está mais acima.',
      },
      {
        id: 'q3',
        prompt: 'Qual destes blocos é um SENSOR?',
        options: [
          { id: 'a', text: 'see' },
          { id: 'b', text: 'toward' },
          { id: 'c', text: 'wander' },
          { id: 'd', text: 'say' },
        ],
        explanation: 'Sensores ficam no WHEN e percebem algo (see, hear, bumped, keyboard...).',
      },
      {
        id: 'q4',
        prompt: 'Você quer que o Kodu diga "Oi!" ao ver uma árvore. Qual regra está certa?',
        options: [
          { id: 'a', text: 'WHEN say "Oi!" DO see tree' },
          { id: 'b', text: 'WHEN see tree DO say "Oi!"' },
          { id: 'c', text: 'WHEN tree DO see' },
          { id: 'd', text: 'DO see tree say "Oi!"' },
        ],
        explanation: 'Condição (sensor + filtro) no WHEN; ação (+ texto) no DO.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Acrescente uma regra para o Kodu reagir às árvores: WHEN see tree DO express hearts (express → hearts). Onde você precisa colocá-la para não atrapalhar a busca por maçãs? Teste duas posições e explique.',
    reflection: {
      prompt: 'Explique com suas palavras por que a ordem das regras importa no Kodu. Use o que aconteceu no seu teste como exemplo.',
      guide: 'Compare o comportamento antes e depois de trocar as linhas.',
    },
    glossary: ['when-do', 'sensor', 'condicao', 'prioridade'],
    versionNotes: ['Se a sua versão não permitir arrastar a linha pelo número, apague e recrie as regras na ordem certa — o resultado é o mesmo.'],
  },

  {
    id: 6,
    module: 2,
    title: 'Controlando o Kodu pelo teclado',
    difficulty: 'facil',
    estimatedMinutes: [35, 45],
    objective: 'Transformar o Kodu em personagem do jogador, controlado pelo teclado (ou por um controle compatível).',
    skills: [
      'Usar o sensor keyboard com Arrows, WASD e Space',
      'Apagar regras antigas com segurança',
      'Ajustar a velocidade do personagem do jogador',
      'Testar controles e corrigir conflitos',
    ],
    prerequisites: [5],
    materials: ['Kodu Game Lab', 'Ilha da fase 5', 'Controle de Xbox compatível (opcional)'],
    projectLink: 'O Kodu vira o herói controlado pelo jogador. A Ilha começa a ser um jogo.',
    concept: {
      title: 'Entrada do jogador',
      paragraphs: [
        'Até agora o Kodu agia sozinho. Em um jogo, o jogador envia ENTRADAS: aperta teclas ou move alavancas.',
        'O sensor keyboard percebe teclas. Com o filtro Arrows, ele reage às setas; com WASD, às teclas W, A, S, D. Combinado com DO move, o Kodu anda na direção da seta apertada.',
        'Cuidado com regras antigas: se "move wander" continuar no programa, o Kodu andará sozinho sempre que você não estiver apertando uma tecla.',
      ],
    },
    steps: [
      {
        title: 'Guarde uma cópia da versão anterior',
        detail:
          'Abra a Ilha. Antes de mudar o programa, salve uma cópia: Home Menu → Save my world e mude o nome para "Ilha - apelido - fase5". Depois salve de novo com o nome original "Ilha - apelido". Assim você pode voltar se precisar.',
        where: 'Home Menu → Save my world',
      },
      {
        title: 'Apague as regras antigas do Kodu',
        detail:
          'Abra o programa do Kodu (botão direito → Program). Apague as 3 regras: clique com o botão direito sobre cada bloco até a linha ficar vazia, ou clique com o botão direito no número da linha (Cut Row).',
        where: 'Editor → botão direito nos blocos ou no número da linha',
        check: 'O programa está vazio.',
      },
      {
        title: 'Programe as setas',
        detail: 'Linha 1: WHEN → keyboard → Arrows. DO → move.',
        where: 'Linha 1 → WHEN: keyboard → Arrows | DO: move',
        rules: {
          character: 'Kodu',
          rules: [{ line: 1, when: [T.keyboard, T.arrows], do: [T.move] }],
          explanation: 'Quando uma seta for apertada, mova-se na direção dela.',
        },
      },
      {
        title: 'Teste o controle',
        detail: 'Jogue e use as quatro setas. Leve o Kodu até cada maçã. Ele não come (ainda).',
        where: 'Esc → Esc → setas',
        check: 'O Kodu anda só quando você aperta as setas.',
      },
      {
        title: 'Adicione o pulo',
        detail: 'Linha 2: WHEN → keyboard → Space. DO → jump. Teste pular sobre uma pedra.',
        where: 'Linha 2 → WHEN: keyboard → Space | DO: jump',
        rules: {
          character: 'Kodu',
          rules: [{ line: 2, when: [T.keyboard, T.space], do: [T.jump] }],
          explanation: 'Barra de espaço = pular.',
        },
      },
      {
        title: 'Ajuste a velocidade',
        detail:
          'Teste a linha 1 com o modificador quickly (WHEN keyboard Arrows DO move quickly). Decida qual velocidade torna o jogo mais controlável e deixe assim.',
        where: 'Linha 1 → "+" após move → quickly',
      },
      {
        title: 'Alternativa: WASD ou controle',
        detail:
          'Se preferir, troque Arrows por WASD. Se a escola tiver um controle de Xbox conectado, você pode usar WHEN gamepad L stick DO move. Escolha apenas um jeito principal para não confundir o jogador.',
        where: 'Filtro do keyboard: WASD | Sensor gamepad: L stick',
      },
      {
        title: 'Observe a câmera e salve',
        detail:
          'Ao jogar, observe se a câmera acompanha o Kodu. Se ficar difícil enxergar, abra Change World Settings e experimente a opção Camera Mode. Depois salve.',
        where: 'Change World Settings → Camera Mode (opcional) | Home Menu → Save my world',
      },
    ],
    rules: [
      {
        character: 'Kodu',
        rules: [
          { line: 1, when: [T.keyboard, T.arrows], do: [T.move] },
          { line: 2, when: [T.keyboard, T.space], do: [T.jump] },
        ],
        explanation: 'Programa final: setas movem, espaço pula. (quickly é opcional.)',
      },
    ],
    expectedResult: 'Você controla o Kodu com as setas e o faz pular com a barra de espaço. Ele fica parado quando nenhuma tecla é apertada.',
    checklist: [
      { id: 'copia', text: 'Salvei uma cópia "fase5" antes de mudar', required: false },
      { id: 'apagar', text: 'Apaguei as regras antigas do Kodu', required: true },
      { id: 'setas', text: 'Programei WHEN keyboard Arrows DO move', required: true },
      { id: 'pulo', text: 'Programei WHEN keyboard Space DO jump', required: true },
      { id: 'testar', text: 'Levei o Kodu até todas as maçãs usando o teclado', required: true },
      { id: 'velocidade', text: 'Testei a velocidade com quickly e escolhi a melhor', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'O Kodu precisa perceber o teclado. Procure o sensor que tem a ver com teclas.',
      'Use o sensor keyboard e o filtro Arrows no WHEN; no DO, apenas move. Para pular, outra regra com Space e jump.',
      'Linha 1: WHEN keyboard Arrows DO move. Linha 2: WHEN keyboard Space DO jump. Não deixe nenhuma regra "move wander" no programa.',
    ],
    troubleshooting: [
      { problem: 'O Kodu anda sozinho mesmo sem eu apertar nada.', solution: 'Sobrou uma regra antiga com move wander ou see apple. Apague-a.' },
      { problem: 'As setas não fazem nada.', solution: 'Confira se a regra está no programa do Kodu e se o filtro é Arrows. Clique na janela do jogo antes de apertar as teclas.' },
      { problem: 'O Kodu anda na direção "errada".', solution: 'O movimento depende do ângulo da câmera. Gire a câmera para ficar atrás do Kodu ou experimente outro Camera Mode.' },
      { problem: 'O Kodu cai na água.', solution: 'O Kodu flutua; dependendo da versão ele pode sair pela borda do mundo. Ative Glass Walls em Change World Settings.' },
    ],
    guidingQuestions: ['O que acontece se você deixar uma regra "move wander" junto com o controle do teclado?', 'Por que escolher só um esquema de controle principal?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual regra faz o Kodu andar com as setas do teclado?',
        options: [
          { id: 'a', text: 'WHEN keyboard Arrows DO move' },
          { id: 'b', text: 'WHEN move DO keyboard Arrows' },
          { id: 'c', text: 'WHEN see Arrows DO move' },
          { id: 'd', text: 'DO move wander' },
        ],
        explanation: 'O sensor keyboard com o filtro Arrows fica no WHEN; a ação move fica no DO.',
      },
      {
        id: 'q2',
        prompt: 'O programa tem "WHEN keyboard Arrows DO move" e também "DO move wander" embaixo. Sem apertar nada, o Kodu...',
        options: [
          { id: 'a', text: 'fica parado' },
          { id: 'b', text: 'anda sozinho vagando' },
          { id: 'c', text: 'pula' },
          { id: 'd', text: 'desaparece' },
        ],
        explanation: 'Quando nenhuma seta está apertada, a primeira regra é falsa e a regra wander (sempre verdadeira) passa a valer.',
      },
      {
        id: 'q3',
        prompt: 'Para pular com a barra de espaço, qual filtro do sensor keyboard você usa?',
        options: [
          { id: 'a', text: 'Arrows' },
          { id: 'b', text: 'Space' },
          { id: 'c', text: 'WASD' },
          { id: 'd', text: 'jump' },
        ],
        explanation: 'Space é a barra de espaço. jump é a ação, que fica no DO.',
      },
      {
        id: 'q4',
        prompt: 'O que é uma "entrada" (input) em um jogo?',
        options: [
          { id: 'a', text: 'A porta do castelo' },
          { id: 'b', text: 'Uma informação enviada pelo jogador, como apertar uma tecla' },
          { id: 'c', text: 'O nome do mundo' },
          { id: 'd', text: 'A pontuação final' },
        ],
        explanation: 'Entradas são as ações do jogador captadas pelo jogo: teclas, mouse, controle.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie um "turbo": WHEN keyboard Arrows DO move quickly em uma linha e teste também uma tecla extra (por exemplo, a letra E) para outra ação divertida, como express hearts. Explique ao professor como você testou que as duas regras não brigam.',
    reflection: {
      prompt: 'O que muda para quem joga quando o personagem passa a ser controlado pelo teclado em vez de andar sozinho?',
      guide: 'Pense em controle, desafio e diversão.',
    },
    glossary: ['entrada'],
  },

  {
    id: 7,
    module: 2,
    title: 'Interações entre personagens e objetos',
    difficulty: 'intermediario',
    estimatedMinutes: [45, 55],
    objective: 'Programar reações a colisões (bumped), usando "it" para agir sobre o objeto tocado, e criar um segundo personagem que interage com o Kodu.',
    skills: [
      'Usar o sensor bumped',
      'Usar o modificador it para agir sobre o objeto percebido',
      'Programar dois personagens diferentes',
      'Combinar ações visuais (express) e sonoras (play)',
    ],
    prerequisites: [6],
    materials: ['Kodu Game Lab', 'Ilha da fase 6', 'Fones de ouvido (para testar sons)'],
    projectLink: 'Na Ilha, o Kodu passa a comer maçãs e ganha um vizinho: a tartaruga.',
    concept: {
      title: 'Colisões e o "it"',
      paragraphs: [
        'COLISÃO é quando dois elementos se encostam. O sensor bumped percebe isso. "WHEN bumped apple" significa "quando eu encostar em uma maçã".',
        'O modificador it (isso) aponta para o que o sensor percebeu. Em "WHEN bumped apple DO eat it", it é a maçã encostada. Sem o it, o Kodu não saberia o que comer.',
        'Cada personagem tem o SEU programa. Para que a tartaruga reaja ao Kodu, a regra fica no programa da tartaruga.',
      ],
    },
    steps: [
      {
        title: 'Comer maçãs',
        detail: 'Abra o programa do Kodu. Na linha 3, monte: WHEN → bumped → apple. DO → eat → it.',
        where: 'Kodu → Program → Linha 3',
        rules: {
          character: 'Kodu',
          rules: [{ line: 3, when: [T.bumped, T.apple], do: [T.eat, T.it] }],
          explanation: 'Quando encostar em uma maçã, coma essa maçã.',
        },
      },
      {
        title: 'Teste comer',
        detail: 'Jogue e encoste o Kodu em uma maçã usando as setas.',
        where: 'Esc → Esc',
        check: 'A maçã desaparece quando o Kodu encosta nela.',
      },
      {
        title: 'Som ao bater na pedra',
        detail:
          'Linha 4: WHEN bumped rock DO play. Ao escolher play, navegue pelo menu de sons e escolha um som curto. Use fones e teste batendo em uma pedra.',
        where: 'Linha 4 → WHEN: bumped → rock | DO: play → (som)',
      },
      {
        title: 'Adicione a tartaruga',
        detail: 'Saia do editor. Com a Object Tool, clique em um lugar vazio e adicione a tartaruga (turtle). Coloque-a longe do Kodu.',
        where: 'Object Tool → menu circular → turtle',
      },
      {
        title: 'Programe a tartaruga',
        detail:
          'Botão direito na tartaruga → Program. Linha 1: DO move wander slowly. Linha 2: WHEN bumped kodu DO express happy.',
        where: 'Tartaruga → Program',
        rules: {
          character: 'Tartaruga',
          rules: [
            { line: 1, when: ALWAYS, do: [T.move, T.wander, T.slowly] },
            { line: 2, when: [T.bumped, T.kodu], do: [T.express, T.happy] },
          ],
          explanation: 'A tartaruga passeia devagar e fica feliz quando o Kodu encosta nela.',
        },
      },
      {
        title: 'O Kodu também reage',
        detail: 'No programa do Kodu, linha 5: WHEN bumped turtle DO express hearts. Teste encostando na tartaruga.',
        where: 'Kodu → Program → Linha 5',
        check: 'Ao encostar, aparecem corações no Kodu e a tartaruga mostra expressão feliz.',
      },
      {
        title: 'Experimento: com e sem "it"',
        detail:
          'Na linha 3, apague o bloco it e teste. Depois coloque-o de volta. Anote no caderno o que aconteceu nas duas situações.',
        where: 'Kodu → Linha 3',
      },
      {
        title: 'Salve',
        detail: 'Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [
      {
        character: 'Kodu',
        rules: [
          { line: 1, when: [T.keyboard, T.arrows], do: [T.move] },
          { line: 2, when: [T.keyboard, T.space], do: [T.jump] },
          { line: 3, when: [T.bumped, T.apple], do: [T.eat, T.it] },
          { line: 4, when: [T.bumped, T.rock], do: [T.play] },
          { line: 5, when: [T.bumped, T.turtle], do: [T.express, T.hearts] },
        ],
        explanation: 'O jogador controla o Kodu, que come maçãs, faz som nas pedras e demonstra carinho pela tartaruga.',
      },
      {
        character: 'Tartaruga',
        rules: [
          { line: 1, when: ALWAYS, do: [T.move, T.wander, T.slowly] },
          { line: 2, when: [T.bumped, T.kodu], do: [T.express, T.happy] },
        ],
        explanation: 'Personagem não controlado pelo jogador, com comportamento próprio.',
      },
    ],
    expectedResult: 'O Kodu come as maçãs ao encostar, faz um som ao bater nas pedras e troca expressões com a tartaruga, que passeia sozinha.',
    checklist: [
      { id: 'eat', text: 'O Kodu come maçãs com WHEN bumped apple DO eat it', required: true },
      { id: 'som', text: 'Bater na pedra toca um som', required: true },
      { id: 'tartaruga', text: 'Adicionei e programei a tartaruga (wander slowly)', required: true },
      { id: 'interacao', text: 'Kodu e tartaruga reagem quando se encostam', required: true },
      { id: 'it', text: 'Fiz o experimento com e sem "it" e anotei o resultado', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Para algo acontecer quando dois elementos se tocam, use o sensor de colisão. E diga ao Kodu SOBRE O QUE ele deve agir.',
      'Sensor bumped + filtro apple. Ação eat + modificador it. Para a tartaruga, as regras ficam no programa DELA.',
      'Kodu, linha 3: WHEN bumped apple DO eat it. Tartaruga, linha 1: DO move wander slowly; linha 2: WHEN bumped kodu DO express happy.',
    ],
    troubleshooting: [
      { problem: 'O Kodu encosta mas não come.', solution: 'Verifique se o filtro é apple e se a ação tem o it. Encoste de frente, devagar.' },
      { problem: 'Não ouço o som.', solution: 'Confira o volume do computador e dos fones. Alguns sons são baixos: escolha outro.' },
      { problem: 'A tartaruga não se mexe.', solution: 'Você provavelmente colocou a regra no programa do Kodu. Abra o programa da tartaruga e monte lá.' },
      { problem: 'A tartaruga foge pela borda.', solution: 'Ative Glass Walls em Change World Settings ou coloque pedras como barreira.' },
    ],
    guidingQuestions: ['Para que serve o modificador it?', 'Por que a regra da tartaruga não pode ficar no programa do Kodu?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Em "WHEN bumped apple DO eat it", o que é o "it"?',
        options: [
          { id: 'a', text: 'O próprio Kodu' },
          { id: 'b', text: 'A maçã em que o Kodu encostou' },
          { id: 'c', text: 'Todas as maçãs do mundo' },
          { id: 'd', text: 'A tartaruga' },
        ],
        explanation: 'it aponta para o objeto que o sensor percebeu.',
      },
      {
        id: 'q2',
        prompt: 'Qual sensor percebe que dois elementos se encostaram?',
        options: [
          { id: 'a', text: 'see' },
          { id: 'b', text: 'hear' },
          { id: 'c', text: 'bumped' },
          { id: 'd', text: 'timer' },
        ],
        explanation: 'bumped percebe colisões. see percebe à distância.',
      },
      {
        id: 'q3',
        prompt: 'Você quer que a tartaruga fique feliz ao ser tocada pelo Kodu. Onde coloca a regra?',
        options: [
          { id: 'a', text: 'No programa do Kodu' },
          { id: 'b', text: 'No programa da tartaruga' },
          { id: 'c', text: 'Em Change World Settings' },
          { id: 'd', text: 'Na Water Tool' },
        ],
        explanation: 'Cada personagem executa o próprio programa; a reação da tartaruga fica com ela.',
      },
      {
        id: 'q4',
        prompt: 'Qual regra faz a tartaruga passear devagar o tempo todo?',
        options: [
          { id: 'a', text: 'WHEN (vazio) DO move wander slowly' },
          { id: 'b', text: 'WHEN slowly DO wander' },
          { id: 'c', text: 'WHEN bumped DO move' },
          { id: 'd', text: 'WHEN keyboard Arrows DO move' },
        ],
        explanation: 'WHEN vazio = sempre; move + wander + slowly = passear devagar.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Faça a tartaruga "seguir" o Kodu quando estiver perto: no programa dela, acima da regra wander, coloque WHEN see kodu DO move toward slowly. Observe e explique por que a posição dessa regra importa (lembre da fase 5).',
    reflection: {
      prompt: 'O que aconteceu no experimento sem o "it"? O que isso ensina sobre dar instruções precisas para o computador?',
      guide: 'Relacione com a ideia de que o computador não "adivinha" o que você quer.',
    },
    glossary: ['it', 'colisao'],
  },

  {
    id: 8,
    module: 2,
    title: 'Condições, filtros e comportamentos diferentes',
    difficulty: 'intermediario',
    estimatedMinutes: [45, 60],
    objective:
      'Usar filtros de cor, distância e "not" para que personagens tomem decisões diferentes em situações diferentes.',
    skills: [
      'Refinar condições com filtros de cor (red, blue)',
      'Usar filtros de distância (close by)',
      'Inverter condições com not',
      'Diferenciar eventos (bumped) de estados contínuos (see)',
    ],
    prerequisites: [7],
    materials: ['Kodu Game Lab', 'Ilha da fase 7 (com maçãs vermelhas e uma azul — fase 3)'],
    projectLink: 'A Ilha ganha "maçãs estragadas" (azuis) e uma tartaruga que foge quando o Kodu chega perto.',
    concept: {
      title: 'Filtros tornam a condição mais precisa',
      paragraphs: [
        'Um FILTRO é um bloco que vem depois do sensor e restringe o que conta. "WHEN bumped apple" vale para qualquer maçã; "WHEN bumped red apple" só para maçãs vermelhas.',
        'Existem filtros de cor (red, blue...), de distância (close by, far away), de posição e o filtro not, que INVERTE a condição: "WHEN see apple not" vale quando o personagem NÃO vê maçãs.',
        'Alguns sensores percebem EVENTOS — algo que acontece num instante, como um encostão (bumped). Outros percebem um ESTADO contínuo, como estar vendo algo (see). Essa diferença ajuda a prever quanto tempo a ação dura.',
      ],
    },
    steps: [
      {
        title: 'Confira as maçãs',
        detail:
          'Abra a Ilha. Se as maçãs foram comidas apenas no teste, elas voltam ao estado inicial ao editar. Garanta que existam pelo menos 3 maçãs vermelhas e 2 azuis (Object Tool → selecionar → setas ← →).',
        where: 'Object Tool → selecionar maçã → setas',
      },
      {
        title: 'Comer só maçãs vermelhas',
        detail:
          'No programa do Kodu, altere a linha 3: clique no "+" entre bumped e apple e adicione o filtro red. Resultado: WHEN bumped red apple DO eat it.',
        where: 'Kodu → Program → Linha 3 → adicionar red',
        rules: {
          character: 'Kodu',
          rules: [{ line: 3, when: [T.bumped, T.red, T.apple], do: [T.eat, T.it] }],
          explanation: 'Só as maçãs vermelhas são comidas.',
        },
      },
      {
        title: 'Reagir à maçã azul',
        detail: 'Linha 6: WHEN bumped blue apple DO say "Essa está estragada!". Teste encostando em uma maçã azul e em uma vermelha.',
        where: 'Kodu → Linha 6',
        rules: {
          character: 'Kodu',
          rules: [{ line: 6, when: [T.bumped, T.blue, T.apple], do: [T.say, text('Essa está estragada!')] }],
          explanation: 'Mesmo sensor, filtro diferente, ação diferente.',
        },
      },
      {
        title: 'Brilhar ao avistar comida',
        detail:
          'Linha 7: WHEN see red apple DO glow → yellow. Linha 8: WHEN see red apple not DO glow → off. O "not" fica no final do WHEN.',
        where: 'Kodu → Linhas 7 e 8',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 7, when: [T.see, T.red, T.apple], do: [T.glow, T.mYellow] },
            { line: 8, when: [T.see, T.red, T.apple, T.not], do: [T.glow, T.off] },
          ],
          explanation: 'O Kodu brilha enquanto vê uma maçã vermelha e apaga o brilho quando não vê nenhuma.',
        },
      },
      {
        title: 'Tartaruga assustada',
        detail:
          'Abra o programa da tartaruga. ACIMA da regra wander, insira: WHEN see kodu close by DO move away quickly. Lembre-se: regras de movimento mais acima têm prioridade.',
        where: 'Tartaruga → Program → nova linha 1',
        rules: {
          character: 'Tartaruga',
          rules: [
            { line: 1, when: [T.see, T.kodu, T.closeBy], do: [T.move, T.away, T.quickly] },
            { line: 2, when: ALWAYS, do: [T.move, T.wander, T.slowly] },
            { line: 3, when: [T.bumped, T.kodu], do: [T.express, T.happy] },
          ],
          explanation: 'Perto do Kodu, ela foge rápido; longe, volta a passear.',
        },
      },
      {
        title: 'Teste cada condição separadamente',
        detail:
          'Faça um teste para cada regra nova: (1) encostar na maçã vermelha; (2) encostar na azul; (3) olhar para uma maçã vermelha e depois virar de costas; (4) chegar perto da tartaruga. Marque no checklist o que funcionou.',
        where: 'Esc → Esc',
      },
      {
        title: 'Salve',
        detail: 'Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [
      {
        character: 'Kodu (linhas novas)',
        rules: [
          { line: 3, when: [T.bumped, T.red, T.apple], do: [T.eat, T.it] },
          { line: 6, when: [T.bumped, T.blue, T.apple], do: [T.say, text('Essa está estragada!')] },
          { line: 7, when: [T.see, T.red, T.apple], do: [T.glow, T.mYellow] },
          { line: 8, when: [T.see, T.red, T.apple, T.not], do: [T.glow, T.off] },
        ],
        explanation: 'Filtros de cor e not criam decisões diferentes.',
      },
    ],
    expectedResult:
      'O Kodu come só maçãs vermelhas, avisa sobre as azuis, brilha quando vê comida e a tartaruga foge quando ele se aproxima.',
    checklist: [
      { id: 'cores', text: 'Tenho maçãs vermelhas e azuis no mundo', required: true },
      { id: 'red', text: 'O Kodu come apenas maçãs vermelhas', required: true },
      { id: 'blue', text: 'O Kodu fala uma frase ao encostar na maçã azul', required: true },
      { id: 'not', text: 'Usei not para desligar o brilho', required: true },
      { id: 'closeby', text: 'A tartaruga foge quando o Kodu chega perto (close by)', required: true },
      { id: 'testes', text: 'Testei cada condição separadamente', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Você não precisa de sensores novos: precisa deixar as condições mais específicas. Procure blocos que vêm DEPOIS do sensor.',
      'Filtros de cor ficam no WHEN (bumped red apple). O not vai no final do WHEN. Distância: close by.',
      'Kodu: linha 3 = WHEN bumped red apple DO eat it; linha 6 = WHEN bumped blue apple DO say; linhas 7/8 = see red apple → glow yellow / see red apple not → glow off. Tartaruga: linha 1 = WHEN see kodu close by DO move away quickly.',
    ],
    troubleshooting: [
      { problem: 'O Kodu come também as azuis.', solution: 'A linha 3 ainda está sem o filtro red, ou existe outra regra "bumped apple DO eat it" sem cor. Procure em todas as linhas.' },
      { problem: 'O brilho nunca apaga.', solution: 'Confira se a linha 8 tem o not no WHEN e a ação glow com off.' },
      { problem: 'A tartaruga não foge.', solution: 'A regra de fuga precisa ficar ACIMA da regra wander no programa da tartaruga.' },
      { problem: 'As maçãs voltam a aparecer.', solution: 'Normal: cada vez que você joga, o mundo começa do estado salvo/editado.' },
    ],
    guidingQuestions: ['Qual a diferença entre "WHEN see apple" e "WHEN see apple not"?', 'Por que a fuga da tartaruga precisa ficar acima do passeio?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual regra faz o Kodu comer SOMENTE maçãs vermelhas?',
        options: [
          { id: 'a', text: 'WHEN bumped apple DO eat it' },
          { id: 'b', text: 'WHEN bumped red apple DO eat it' },
          { id: 'c', text: 'WHEN see apple DO eat red' },
          { id: 'd', text: 'WHEN red DO eat' },
        ],
        explanation: 'O filtro de cor no WHEN restringe quais maçãs disparam a regra.',
      },
      {
        id: 'q2',
        prompt: 'O que o filtro not faz?',
        options: [
          { id: 'a', text: 'Apaga a regra' },
          { id: 'b', text: 'Inverte a condição: a regra vale quando o sensor NÃO percebe aquilo' },
          { id: 'c', text: 'Deixa o personagem invisível' },
          { id: 'd', text: 'Para o jogo' },
        ],
        explanation: '"WHEN see red apple not" é verdadeiro quando nenhuma maçã vermelha está à vista.',
      },
      {
        id: 'q3',
        prompt: 'Qual destes é um EVENTO (acontece em um instante)?',
        options: [
          { id: 'a', text: 'Estar vendo uma árvore' },
          { id: 'b', text: 'Encostar em uma pedra (bumped)' },
          { id: 'c', text: 'Estar sobre o terreno' },
          { id: 'd', text: 'Estar longe do Kodu' },
        ],
        explanation: 'A colisão acontece em um momento; ver algo é um estado que pode durar.',
      },
      {
        id: 'q4',
        prompt: 'A tartaruga deve fugir só quando o Kodu está PERTO. Qual filtro usar?',
        options: [
          { id: 'a', text: 'far away' },
          { id: 'b', text: 'close by' },
          { id: 'c', text: 'blue' },
          { id: 'd', text: 'quickly' },
        ],
        explanation: 'close by restringe a percepção a objetos próximos.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie uma terceira cor de maçã (por exemplo, verde) com um efeito especial diferente — como o Kodu pular sozinho (DO jump) ao encostar nela. Planeje a regra no papel antes de montar.',
    reflection: {
      prompt: 'Dê um exemplo da vida real de uma decisão do tipo "se isso, faça aquilo; se NÃO, faça outra coisa". Como você montaria isso no Kodu?',
      guide: 'Use a estrutura WHEN/DO e o filtro not.',
    },
    glossary: ['filtro', 'evento', 'not'],
  },
];
