import type { Phase } from '../types';
import { T, points } from '../tiles';

export const module3: Phase[] = [
  {
    id: 9,
    module: 3,
    title: 'Cenários com terrenos, caminhos e obstáculos',
    difficulty: 'intermediario',
    estimatedMinutes: [45, 60],
    objective:
      'Planejar e construir um cenário de jogo com regiões diferentes, muros criados com a Path Tool, obstáculos naturais e limites do mundo.',
    skills: [
      'Planejar um mapa antes de construir',
      'Criar muros e estradas com a Path Tool',
      'Usar terreno e água como obstáculos',
      'Ativar Glass Walls nas configurações do mundo',
    ],
    prerequisites: [8],
    materials: ['Kodu Game Lab', 'Ilha da fase 8', 'Papel e lápis para o esboço do mapa'],
    projectLink: 'A Ilha ganha um "percurso": área inicial, floresta, um corredor com muros e uma área final com um castelo.',
    concept: {
      title: 'O cenário também é parte do jogo',
      paragraphs: [
        'Em um jogo, o cenário guia o jogador: mostra por onde ir, esconde recompensas e cria desafios. Um bom mapa é planejado antes de ser construído.',
        'OBSTÁCULOS podem ser naturais (morros, água, pedras) ou construídos. No Kodu, a Path Tool cria caminhos de vários tipos: Plain (trajeto simples, usado por personagens), Road (estrada), Wall (muro) e Flora (vegetação).',
        'Glass Walls, em Change World Settings, cria paredes invisíveis na borda do mundo e evita que personagens caiam para fora.',
      ],
    },
    steps: [
      {
        title: 'Desenhe o mapa no papel',
        detail:
          'Faça um esboço da Ilha vista de cima com 4 regiões: (1) início, onde fica o Kodu; (2) floresta com árvores e maçãs; (3) corredor entre dois muros; (4) área final com um castelo. Marque onde ficarão os obstáculos.',
        where: 'Papel',
        check: 'Seu esboço tem as 4 regiões e um caminho possível do início ao fim.',
      },
      {
        title: 'Pinte as regiões com materiais diferentes',
        detail:
          'Abra a Ilha. Com o Ground Brush, pinte cada região com um material diferente (ex.: grama no início, terra na floresta, pedra no corredor). Lembre: botão esquerdo pinta/adiciona; setas ← → mudam o tamanho.',
        where: 'Ground Brush',
      },
      {
        title: 'Crie um muro com a Path Tool',
        detail:
          'Clique na Path Tool. Clique com o botão DIREITO no terreno e escolha Add Wall. Clique com o botão esquerdo em pontos seguidos para traçar o muro. Para terminar, aperte Esc (ou clique de novo no último ponto, conforme a versão).',
        where: 'Path Tool → botão direito no chão → Add Wall → cliques → Esc',
        check: 'Um muro aparece ligando os pontos.',
      },
      {
        title: 'Faça o corredor',
        detail:
          'Crie um segundo muro paralelo ao primeiro, formando um corredor largo o suficiente para o Kodu passar com folga. Para ajustar, arraste os pontos (nós) do muro com o botão esquerdo.',
        where: 'Path Tool → arrastar nós',
      },
      {
        title: 'Adicione uma estrada',
        detail: 'Com o botão direito no terreno, escolha Add Road e trace uma estrada do início até o corredor. Ela mostra ao jogador o caminho principal.',
        where: 'Path Tool → botão direito → Add Road',
      },
      {
        title: 'Obstáculos naturais',
        detail:
          'Use Up/Down para criar um pequeno morro que bloqueie um atalho e a Water Tool para um lago na floresta. Coloque 3 pedras no caminho para o jogador desviar.',
        where: 'Up/Down, Water Tool, Object Tool',
      },
      {
        title: 'Coloque o castelo e as moedas',
        detail:
          'Com a Object Tool, coloque um castle na área final. Espalhe 5 moedas (coin) pelo percurso, algumas em lugares mais difíceis. Mantenha as maçãs da fase 8.',
        where: 'Object Tool → castle, coin',
      },
      {
        title: 'Ative Glass Walls',
        detail: 'Clique em Change World Settings e marque a opção Glass Walls.',
        where: 'Barra de ferramentas → Change World Settings → Glass Walls',
      },
      {
        title: 'Teste o percurso',
        detail:
          'Jogue e faça o caminho completo com o Kodu: do início ao castelo. O muro deve bloquear a passagem. Se algum trecho for impossível, ajuste.',
        where: 'Esc → Esc',
        check: 'É possível chegar ao castelo, mas não atravessar os muros.',
      },
      {
        title: 'Salve',
        detail: 'Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'A Ilha tem 4 regiões visualmente diferentes, um corredor de muros, uma estrada, obstáculos naturais, um castelo e 5 moedas. O Kodu consegue fazer o percurso sem atravessar muros nem cair do mundo.',
    checklist: [
      { id: 'esboco', text: 'Fiz o esboço do mapa com 4 regiões', required: true },
      { id: 'materiais', text: 'Pintei as regiões com materiais diferentes', required: true },
      { id: 'muros', text: 'Criei um corredor com dois muros (Add Wall)', required: true },
      { id: 'estrada', text: 'Criei uma estrada (Add Road)', required: false },
      { id: 'obstaculos', text: 'Adicionei morro, lago e pedras como obstáculos', required: true },
      { id: 'castelo-moedas', text: 'Coloquei o castelo e 5 moedas', required: true },
      { id: 'glass', text: 'Ativei Glass Walls', required: true },
      { id: 'percurso', text: 'Testei o percurso completo até o castelo', required: true },
    ],
    hints: [
      'Comece pelo papel: é mais fácil construir quando você já sabe onde cada coisa vai ficar.',
      'Muros e estradas são feitos com a Path Tool, usando o menu do botão direito sobre o terreno (Add Wall, Add Road).',
      'Path Tool → botão direito no chão → Add Wall → clique em 3 ou 4 pontos → Esc. Repita para o segundo muro. Depois Change World Settings → Glass Walls.',
    ],
    troubleshooting: [
      { problem: 'O muro não aparece.', solution: 'Confira se escolheu Add Wall (e não Add Plain Path, que é invisível no jogo). Clique em pelo menos 2 pontos.' },
      { problem: 'O Kodu não passa no corredor.', solution: 'O corredor está estreito. Arraste os nós de um muro para afastá-lo.' },
      { problem: 'O Kodu passa por cima do muro.', solution: 'Muros podem ser vencidos com pulos se forem baixos ou se houver terreno elevado ao lado. Ajuste a altura do terreno ou o traçado.' },
      { problem: 'Não sei terminar o traçado.', solution: 'Aperte Esc para concluir. Se a versão for diferente, clique novamente sobre o último ponto.' },
    ],
    guidingQuestions: ['Como o cenário pode "ensinar" o caminho ao jogador sem usar texto?', 'Qual obstáculo deixa o jogo mais interessante sem torná-lo impossível?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual ferramenta cria muros no Kodu?',
        options: [
          { id: 'a', text: 'Water Tool' },
          { id: 'b', text: 'Path Tool (Add Wall)' },
          { id: 'c', text: 'Roughen' },
          { id: 'd', text: 'Move Camera' },
        ],
        explanation: 'A Path Tool cria caminhos de vários tipos; o tipo Wall é um muro.',
      },
      {
        id: 'q2',
        prompt: 'Para que serve a opção Glass Walls?',
        options: [
          { id: 'a', text: 'Deixa a água transparente' },
          { id: 'b', text: 'Cria paredes invisíveis na borda do mundo' },
          { id: 'c', text: 'Faz os muros ficarem de vidro' },
          { id: 'd', text: 'Mostra a pontuação' },
        ],
        explanation: 'Glass Walls impede que personagens saiam pela borda do mundo.',
      },
      {
        id: 'q3',
        prompt: 'Por que fazer um esboço do mapa antes de construir?',
        options: [
          { id: 'a', text: 'Porque o Kodu exige um desenho' },
          { id: 'b', text: 'Para planejar regiões, caminho e desafios e evitar retrabalho' },
          { id: 'c', text: 'Para ganhar pontos' },
          { id: 'd', text: 'Não há motivo' },
        ],
        explanation: 'Planejar ajuda a construir com intenção e a testar se o percurso é possível.',
      },
      {
        id: 'q4',
        prompt: 'Qual destes NÃO é um obstáculo?',
        options: [
          { id: 'a', text: 'Um morro alto' },
          { id: 'b', text: 'Um lago' },
          { id: 'c', text: 'Uma estrada (Road) indicando o caminho' },
          { id: 'd', text: 'Um muro' },
        ],
        explanation: 'A estrada orienta o jogador; não bloqueia a passagem.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie uma "área secreta" escondida atrás de um morro, acessível só com um pulo, e coloque uma moeda lá. Peça a um colega para encontrá-la sem dicas e observe se ele consegue.',
    reflection: {
      prompt: 'Compare seu esboço no papel com o mundo construído. O que mudou e por quê?',
      guide: 'Cite pelo menos uma mudança feita depois de testar.',
    },
    glossary: ['obstaculo', 'caminho'],
    versionNotes: ['O modo de finalizar o traçado de um caminho varia entre versões (Esc ou clique no último ponto).'],
  },

  {
    id: 10,
    module: 3,
    title: 'Coleta de objetos e interação com o cenário',
    difficulty: 'intermediario',
    estimatedMinutes: [45, 55],
    objective:
      'Programar três formas diferentes de coleta: consumir (eat), fazer sumir (vanish) e carregar e entregar (grab, got, drop).',
    skills: [
      'Escolher a ação adequada para cada tipo de coleta',
      'Usar grab e drop para carregar objetos',
      'Usar o sensor got para saber se o personagem está segurando algo',
      'Dar retorno visual e sonoro ao jogador',
    ],
    prerequisites: [9],
    materials: ['Kodu Game Lab', 'Ilha da fase 9 (com moedas e castelo)'],
    projectLink: 'O Kodu passa a recolher moedas e a levar uma estrela até o castelo — a missão principal da Ilha.',
    concept: {
      title: 'Três maneiras de coletar',
      paragraphs: [
        'COMER (eat it): o objeto é consumido. Bom para "alimentos".',
        'FAZER SUMIR (vanish it): o objeto desaparece sem efeito. Funciona com qualquer objeto, como moedas.',
        'CARREGAR (grab it): o personagem segura o objeto (um de cada vez) e pode soltá-lo depois com drop. O sensor got percebe o que ele está segurando.',
        'Todo jogo de coleta precisa de RETORNO (feedback): um som, um brilho ou uma mensagem que mostre ao jogador que deu certo.',
      ],
    },
    steps: [
      {
        title: 'Recolher moedas',
        detail: 'No programa do Kodu, em uma linha livre: WHEN bumped coin DO vanish it.',
        where: 'Kodu → Program → nova linha',
        rules: {
          character: 'Kodu',
          rules: [{ line: 9, when: [T.bumped, T.coin], do: [T.vanish, T.it] }],
          explanation: 'Ao encostar em uma moeda, ela desaparece.',
        },
      },
      {
        title: 'Som de moeda',
        detail: 'Próxima linha: WHEN bumped coin DO play (escolha um som curto e agudo). Teste recolhendo 2 moedas.',
        where: 'Kodu → nova linha',
        check: 'A moeda some e toca um som.',
      },
      {
        title: 'Coloque uma estrela',
        detail: 'Com a Object Tool, coloque uma estrela (star) na floresta, longe do castelo.',
        where: 'Object Tool → star',
      },
      {
        title: 'Pegar a estrela',
        detail: 'No programa do Kodu: WHEN bumped star DO grab it.',
        where: 'Kodu → nova linha',
      },
      {
        title: 'Mostrar que está carregando',
        detail:
          'Adicione: WHEN got star DO glow yellow. E: WHEN got star not DO glow off. Assim o jogador sabe se está com a estrela.',
        where: 'Kodu → novas linhas',
        check: 'O Kodu brilha enquanto segura a estrela.',
      },
      {
        title: 'Entregar no castelo',
        detail:
          'Adicione: WHEN bumped castle DO drop. Teste: pegue a estrela, leve até o castelo, encoste nele. A estrela deve cair ao lado do castelo e o brilho apagar.',
        where: 'Kodu → nova linha',
      },
      {
        title: 'Organize o programa',
        detail:
          'Seu programa já está ficando longo. Leia todas as linhas e confira se não sobrou nenhuma regra repetida. Use "Print kode for level" no Home Menu se quiser ver o programa inteiro em forma de texto (opcional).',
        where: 'Home Menu → Print kode for level (opcional)',
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
          { line: 9, when: [T.bumped, T.coin], do: [T.vanish, T.it] },
          { line: 10, when: [T.bumped, T.coin], do: [T.play] },
          { line: 11, when: [T.bumped, T.star], do: [T.grab, T.it] },
          { line: 12, when: [T.got, T.star], do: [T.glow, T.mYellow] },
          { line: 13, when: [T.got, T.star, T.not], do: [T.glow, T.off] },
          { line: 14, when: [T.bumped, T.castle], do: [T.drop] },
        ],
        explanation:
          'Números de linha aproximados: o importante é a regra estar no programa do Kodu. Atenção: se você manteve as linhas 7/8 da fase 8 (glow ao ver maçã), as duas regras de brilho vão "brigar". Apague as linhas 7 e 8 da fase 8.',
      },
    ],
    expectedResult:
      'Moedas somem com som ao serem tocadas; o Kodu pega a estrela, brilha enquanto a carrega e a solta ao encostar no castelo.',
    checklist: [
      { id: 'moedas', text: 'Moedas desaparecem ao serem tocadas (vanish it)', required: true },
      { id: 'som', text: 'Recolher moeda toca um som', required: true },
      { id: 'grab', text: 'O Kodu pega a estrela (grab it)', required: true },
      { id: 'got', text: 'O Kodu brilha enquanto segura a estrela (got star)', required: true },
      { id: 'drop', text: 'A estrela é solta ao encostar no castelo (drop)', required: true },
      { id: 'conflito', text: 'Removi as regras de brilho antigas que conflitavam', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Cada objeto pede uma ação diferente: algo que some, algo que se come, algo que se carrega. Procure ações no grupo de "segurar" (holding).',
      'Moeda: vanish it. Estrela: grab it. Saber se está segurando: sensor got. Soltar: drop.',
      'WHEN bumped coin DO vanish it | WHEN bumped star DO grab it | WHEN got star DO glow yellow | WHEN got star not DO glow off | WHEN bumped castle DO drop.',
    ],
    troubleshooting: [
      { problem: 'O Kodu não pega a estrela.', solution: 'Confira o it depois de grab. O Kodu só segura uma coisa por vez: se estiver com outra, solte antes.' },
      { problem: 'O brilho fica piscando.', solution: 'Existem duas regras diferentes mandando brilhar/apagar ao mesmo tempo (por exemplo, as da fase 8). Apague as antigas.' },
      { problem: 'A estrela cai longe do castelo.', solution: 'Normal: drop solta no lugar onde o Kodu está. Encoste bem no castelo.' },
      { problem: 'A moeda some mas não toca som.', solution: 'Verifique se a regra com play existe e se o volume está ligado.' },
    ],
    guidingQuestions: ['Por que usar got em vez de bumped para o brilho?', 'Qual o papel do feedback para quem está jogando?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual regra faz o Kodu carregar a estrela?',
        options: [
          { id: 'a', text: 'WHEN bumped star DO grab it' },
          { id: 'b', text: 'WHEN bumped star DO drop' },
          { id: 'c', text: 'WHEN got star DO vanish' },
          { id: 'd', text: 'WHEN see star DO eat it' },
        ],
        explanation: 'grab segura o objeto tocado (it).',
      },
      {
        id: 'q2',
        prompt: 'O que o sensor got percebe?',
        options: [
          { id: 'a', text: 'Que o personagem encostou em algo' },
          { id: 'b', text: 'Que o personagem está segurando um objeto' },
          { id: 'c', text: 'Que o jogo acabou' },
          { id: 'd', text: 'Que uma tecla foi apertada' },
        ],
        explanation: 'got indica o que o personagem pegou e está segurando.',
      },
      {
        id: 'q3',
        prompt: 'Quantos objetos o personagem consegue segurar ao mesmo tempo com grab?',
        options: [
          { id: 'a', text: 'Um' },
          { id: 'b', text: 'Dois' },
          { id: 'c', text: 'Dez' },
          { id: 'd', text: 'Quantos quiser' },
        ],
        explanation: 'Pela descrição oficial do bloco grab, só é possível segurar uma coisa por vez.',
      },
      {
        id: 'q4',
        prompt: 'Duas regras dizem "brilhe amarelo" e "apague o brilho" ao mesmo tempo. O que pode acontecer?',
        options: [
          { id: 'a', text: 'O jogo fecha' },
          { id: 'b', text: 'O comportamento fica confuso (pisca ou não muda), porque as regras conflitam' },
          { id: 'c', text: 'O Kodu ganha pontos' },
          { id: 'd', text: 'Nada, o Kodu escolhe a melhor' },
        ],
        explanation: 'Regras que disputam a mesma ação precisam ser planejadas para não se contradizerem.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Faça o Kodu dizer "Missão cumprida!" quando encostar no castelo segurando a estrela. Dica: pense em como juntar as duas condições — isso será estudado na fase 13; tente e anote o que acontece.',
    reflection: {
      prompt: 'Explique a diferença entre eat, vanish e grab. Em que tipo de jogo cada um seria útil?',
      guide: 'Dê um exemplo de jogo para cada ação.',
    },
    glossary: ['coleta'],
  },

  {
    id: 11,
    module: 3,
    title: 'Pontuação e objetivos',
    difficulty: 'intermediario',
    estimatedMinutes: [45, 55],
    objective:
      'Usar placares coloridos como variáveis para contar pontos, aplicar penalidades e comunicar o objetivo ao jogador.',
    skills: [
      'Somar pontos com score',
      'Subtrair pontos com subtract',
      'Usar placares de cores diferentes como contadores separados',
      'Comunicar o objetivo pela descrição do mundo',
    ],
    prerequisites: [10],
    materials: ['Kodu Game Lab', 'Ilha da fase 10'],
    projectLink: 'A Ilha passa a ter placar: maçãs vermelhas valem pontos, maçãs azuis tiram pontos e moedas têm um contador próprio.',
    concept: {
      title: 'Placar = variável',
      paragraphs: [
        'Uma VARIÁVEL é um lugar onde o jogo guarda um número que muda. No Kodu, cada COR de placar (red, blue, yellow...) é uma variável separada.',
        'A ação score soma pontos a um placar; subtract tira; set score define um valor exato. Os números vêm de blocos como 1 point, 5 points, 10 points — e podem ser combinados (5 + 1 = 6).',
        'Uma regra tem só UMA ação. Para comer a maçã E somar ponto, use duas regras com o mesmo WHEN.',
      ],
      example: 'WHEN bumped red apple DO score red 1 point → soma 1 no placar vermelho.',
    },
    steps: [
      {
        title: 'Garanta 10 maçãs vermelhas',
        detail: 'Abra a Ilha. Com a Object Tool, deixe exatamente 10 maçãs vermelhas e 3 azuis espalhadas pelo percurso. Conte duas vezes.',
        where: 'Object Tool',
      },
      {
        title: 'Pontos por maçã vermelha',
        detail:
          'No programa do Kodu, logo abaixo de "WHEN bumped red apple DO eat it", adicione: WHEN bumped red apple DO score → red → 1 point. (O bloco de cor vem do grupo de placares; o número, do grupo de pontos.)',
        where: 'Kodu → Program → nova linha abaixo da regra eat',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 3, when: [T.bumped, T.red, T.apple], do: [T.eat, T.it] },
            { line: 4, when: [T.bumped, T.red, T.apple], do: [T.score, T.mRed, T.pts1] },
          ],
          explanation: 'Mesmo WHEN, duas ações em duas regras.',
        },
      },
      {
        title: 'Teste o placar',
        detail: 'Jogue e coma 2 maçãs vermelhas. Observe o número vermelho que aparece no canto da tela.',
        where: 'Esc → Esc',
        check: 'O placar vermelho mostra 2.',
      },
      {
        title: 'Maçã azul: penalidade',
        detail:
          'Mude a regra da maçã azul (fase 8) para que ela também seja comida: WHEN bumped blue apple DO eat it. Abaixo: WHEN bumped blue apple DO subtract → red → 2 points. Mantenha a fala "Essa está estragada!" se quiser.',
        where: 'Kodu → regras da maçã azul',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 6, when: [T.bumped, T.blue, T.apple], do: [T.eat, T.it] },
            { line: 7, when: [T.bumped, T.blue, T.apple], do: [T.subtract, T.mRed, T.pts2] },
          ],
          explanation: 'A maçã azul é comida (some) e tira 2 pontos.',
        },
      },
      {
        title: 'Contador de moedas',
        detail:
          'Adicione: WHEN bumped coin DO score → yellow → 1 point. Agora existem dois placares: vermelho (maçãs) e amarelo (moedas).',
        where: 'Kodu → nova linha',
      },
      {
        title: 'Comunique o objetivo',
        detail:
          'Abra Home Menu → Save my world e, no campo de descrição, escreva o objetivo: "Use as setas para mover e espaço para pular. Coma as maçãs vermelhas (+1). Cuidado com as azuis (-2). Recolha moedas e leve a estrela ao castelo." Salve. Ao abrir o mundo para jogar, essa descrição aparece antes do início.',
        where: 'Home Menu → Save my world → descrição',
      },
      {
        title: 'Teste completo',
        detail:
          'Jogue a Ilha inteira. Anote: pontuação vermelha final, número de moedas. Confira se a soma bate com o que você comeu.',
        where: 'Esc → Esc',
        check: 'Comendo as 10 vermelhas e nenhuma azul, o placar vermelho chega a 10.',
      },
    ],
    rules: [
      {
        character: 'Kodu (regras de pontuação)',
        rules: [
          { line: 3, when: [T.bumped, T.red, T.apple], do: [T.eat, T.it] },
          { line: 4, when: [T.bumped, T.red, T.apple], do: [T.score, T.mRed, T.pts1] },
          { line: 6, when: [T.bumped, T.blue, T.apple], do: [T.eat, T.it] },
          { line: 7, when: [T.bumped, T.blue, T.apple], do: [T.subtract, T.mRed, T.pts2] },
          { line: 10, when: [T.bumped, T.coin], do: [T.score, T.mYellow, T.pts1] },
        ],
        explanation: 'Dois contadores: vermelho (maçãs, com penalidade) e amarelo (moedas).',
      },
    ],
    expectedResult:
      'Ao jogar, o placar vermelho sobe 1 a cada maçã vermelha e desce 2 a cada azul; o placar amarelo conta moedas. A descrição do mundo explica o objetivo.',
    checklist: [
      { id: 'dez', text: 'Há 10 maçãs vermelhas e 3 azuis no mundo', required: true },
      { id: 'score', text: 'Maçã vermelha soma 1 ponto no placar vermelho', required: true },
      { id: 'subtract', text: 'Maçã azul tira 2 pontos', required: true },
      { id: 'amarelo', text: 'Moedas contam no placar amarelo', required: true },
      { id: 'descricao', text: 'Escrevi o objetivo na descrição do mundo', required: true },
      { id: 'conferir', text: 'Conferi se o placar bate com o que comi', required: true },
    ],
    hints: [
      'Pense no placar como uma caixinha numerada que você enche ou esvazia. Cada cor é uma caixinha diferente.',
      'A ação score precisa de uma cor e de um número. Para tirar pontos, use subtract. Lembre: uma ação por regra.',
      'WHEN bumped red apple DO score red 1 point | WHEN bumped blue apple DO subtract red 2 points | WHEN bumped coin DO score yellow 1 point.',
    ],
    troubleshooting: [
      { problem: 'O placar não aparece.', solution: 'Ele só aparece depois da primeira mudança. Coma uma maçã vermelha.' },
      { problem: 'Os pontos sobem muitas vezes de uma vez.', solution: 'Se o objeto não some, o Kodu continua encostado e a regra se repete. Garanta que a regra eat it (ou vanish it) exista para o mesmo objeto.' },
      { problem: 'A cor do placar está errada.', solution: 'Confira o bloco de cor DEPOIS do score. Ele precisa ser red para maçãs e yellow para moedas.' },
      { problem: 'A descrição não aparece ao jogar.', solution: 'Ela aparece quando o mundo é aberto pelo LOAD WORLD → Play. Saia para o menu principal e abra de novo.' },
    ],
    guidingQuestions: ['Por que usar duas cores de placar?', 'O que aconteceria se a maçã azul não fosse comida?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual regra soma 1 ponto ao placar vermelho quando o Kodu encosta em uma maçã vermelha?',
        options: [
          { id: 'a', text: 'WHEN bumped red apple DO score red 1 point' },
          { id: 'b', text: 'WHEN score red DO bumped apple' },
          { id: 'c', text: 'WHEN bumped red apple DO eat red' },
          { id: 'd', text: 'WHEN see apple DO subtract red 1 point' },
        ],
        explanation: 'score + cor + quantidade no DO; colisão com maçã vermelha no WHEN.',
      },
      {
        id: 'q2',
        prompt: 'No Kodu, o que funciona como uma VARIÁVEL?',
        options: [
          { id: 'a', text: 'O nome do mundo' },
          { id: 'b', text: 'Cada placar colorido' },
          { id: 'c', text: 'O terreno' },
          { id: 'd', text: 'A câmera' },
        ],
        explanation: 'Cada cor de placar guarda um número que muda durante o jogo.',
      },
      {
        id: 'q3',
        prompt: 'O placar vermelho está em 5. O Kodu come uma maçã azul (subtract red 2 points). Quanto fica?',
        options: [
          { id: 'a', text: '7' },
          { id: 'b', text: '5' },
          { id: 'c', text: '3' },
          { id: 'd', text: '2' },
        ],
        explanation: '5 − 2 = 3.',
      },
      {
        id: 'q4',
        prompt: 'Por que precisamos de duas regras para comer a maçã e somar ponto?',
        options: [
          { id: 'a', text: 'Porque cada regra tem só uma ação no DO' },
          { id: 'b', text: 'Porque o Kodu é lento' },
          { id: 'c', text: 'Não precisa: dá para colocar eat e score no mesmo DO' },
          { id: 'd', text: 'Porque a maçã é vermelha' },
        ],
        explanation: 'Uma regra = uma ação (com seus modificadores).',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Faça a entrega da estrela no castelo valer 5 pontos no placar vermelho. Cuidado: encostar no castelo SEM a estrela não deveria dar pontos. Teste e anote o problema que aparece — ele será resolvido com regras recuadas na fase 13.',
    reflection: {
      prompt: 'Como a pontuação mudou a experiência de jogar a Ilha? O jogador agora tem um objetivo claro?',
      guide: 'Fale sobre motivação, desafio e o que ainda falta para virar um jogo completo.',
    },
    glossary: ['pontuacao', 'variavel', 'objetivo'],
  },

  {
    id: 12,
    module: 3,
    title: 'Condições de vitória e derrota',
    difficulty: 'intermediario',
    estimatedMinutes: [45, 55],
    objective:
      'Criar regras que encerram o jogo com vitória (win) ao atingir uma meta e com derrota (end) em uma situação de perigo, usando comparações numéricas.',
    skills: [
      'Usar o sensor scored com comparação (>=)',
      'Usar as ações win e end',
      'Usar o sensor on water como condição de perigo',
      'Testar todos os caminhos do jogo: vencer e perder',
    ],
    prerequisites: [11],
    materials: ['Kodu Game Lab', 'Ilha da fase 11'],
    projectLink: 'A Ilha vira um jogo completo: tem objetivo, pontuação, vitória e derrota. Faça uma cópia de segurança desta versão!',
    concept: {
      title: 'Todo jogo precisa de um fim',
      paragraphs: [
        'Uma CONDIÇÃO DE VITÓRIA diz quando o jogador ganhou. Uma CONDIÇÃO DE DERROTA diz quando perdeu. No Kodu, a ação win encerra mostrando vitória; a ação end encerra o jogo (fim de jogo).',
        'O sensor scored observa um placar. Para comparar números, use blocos de COMPARAÇÃO: equals (igual), >= (maior ou igual), <= (menor ou igual), above (acima), below (abaixo).',
        'Nas versões recentes do Kodu, "WHEN scored red 10 points" sem comparação significa "IGUAL a 10". Se o placar pular de 9 para 11, a regra nunca dispara. Por isso, para metas, prefira >=.',
      ],
      example: 'WHEN scored red >= 10 points DO win.',
    },
    steps: [
      {
        title: 'Faça uma cópia de segurança',
        detail: 'Abra a Ilha e salve uma cópia com o nome "Ilha - apelido - fase11". Depois volte a salvar com o nome original.',
        where: 'Home Menu → Save my world',
      },
      {
        title: 'Monte a regra de vitória',
        detail:
          'No programa do Kodu, nova linha: WHEN → scored → red → >= → 10 points. DO → win. O bloco >= fica no grupo de comparação (compare). O 10 points fica no grupo de pontos.',
        where: 'Kodu → Program → nova linha',
        rules: {
          character: 'Kodu',
          rules: [{ line: 15, when: [T.scored, T.red, T.gteq, points(10)], do: [T.win] }],
          explanation: 'Quando o placar vermelho chegar a 10 ou mais, vitória.',
        },
      },
      {
        title: 'Teste vencer',
        detail: 'Jogue e coma as 10 maçãs vermelhas sem tocar nas azuis.',
        where: 'Esc → Esc',
        check: 'Ao comer a 10ª maçã, aparece a mensagem de vitória.',
      },
      {
        title: 'Monte a regra de derrota',
        detail:
          'O Kodu flutua sobre a água, então podemos transformar o mar em perigo: WHEN → on water DO → end. Atualize a descrição do mundo avisando: "Não entre na água!".',
        where: 'Kodu → nova linha',
        rules: {
          character: 'Kodu',
          rules: [{ line: 16, when: [T.onWater], do: [T.end] }],
          explanation: 'Se o Kodu estiver sobre a água, fim de jogo.',
        },
      },
      {
        title: 'Teste perder',
        detail: 'Jogue e leve o Kodu propositalmente até a água.',
        where: 'Esc → Esc',
        check: 'O jogo termina ao entrar na água.',
      },
      {
        title: 'Revise o equilíbrio',
        detail:
          'Pergunte-se: é possível vencer? A água fica no caminho natural? O lago da floresta (fase 9) agora é um perigo — está bem sinalizado? Ajuste o cenário se necessário (por exemplo, coloque pedras ao redor do lago).',
        where: 'Modo de edição',
      },
      {
        title: 'Peça para alguém testar',
        detail: 'Peça a um colega para jogar sem explicação. Observe sem ajudar. Ele entendeu o objetivo? Venceu ou perdeu? Anote 2 observações.',
        where: 'Colega',
      },
      {
        title: 'Salve',
        detail: 'Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [
      {
        character: 'Kodu (fim de jogo)',
        rules: [
          { line: 15, when: [T.scored, T.red, T.gteq, points(10)], do: [T.win] },
          { line: 16, when: [T.onWater], do: [T.end] },
        ],
        explanation: 'Uma regra de vitória e uma de derrota.',
      },
    ],
    expectedResult: 'Comendo 10 maçãs vermelhas, o jogador vence; entrando na água, perde. Um colega consegue jogar entendendo o objetivo.',
    checklist: [
      { id: 'backup', text: 'Salvei a cópia de segurança "fase11"', required: true },
      { id: 'win', text: 'Montei WHEN scored red >= 10 points DO win', required: true },
      { id: 'testar-win', text: 'Testei e consegui vencer', required: true },
      { id: 'end', text: 'Montei WHEN on water DO end', required: true },
      { id: 'testar-end', text: 'Testei e vi a derrota acontecer', required: true },
      { id: 'colega', text: 'Um colega testou e eu anotei 2 observações', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Você precisa de duas regras novas: uma que observa o placar e outra que observa o perigo.',
      'Use o sensor scored com a cor red, a comparação >= e 10 points. Para perder, use o sensor on water. As ações são win e end.',
      'WHEN scored red >= 10 points DO win. WHEN on water DO end. Teste os dois caminhos.',
    ],
    troubleshooting: [
      { problem: 'Fiz 10 pontos e não venci.', solution: 'Confira se usou >= (e não apenas o número) e se a cor é red. Se o placar passou de 10 sem parar em 10, a comparação "igual" falha.' },
      { problem: 'O jogo termina logo no começo.', solution: 'O Kodu começa sobre a água ou perto dela. Mova-o para terra firme no modo de edição.' },
      { problem: 'Não encontro o bloco >=.', solution: 'Depois de escolher scored e a cor, clique no "+" e procure o grupo de comparação (compare). Em versões antigas, ele pode não existir: use apenas "scored red 10 points" e garanta que o placar suba de 1 em 1.' },
      { problem: 'É impossível chegar a 10 pontos.', solution: 'Conte as maçãs vermelhas: precisam ser pelo menos 10. As azuis tiram pontos.' },
    ],
    guidingQuestions: ['Por que >= é mais seguro do que "igual" para metas?', 'Uma condição de derrota deixa o jogo mais interessante? Por quê?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual regra dá vitória quando o placar vermelho chega a 10 ou mais?',
        options: [
          { id: 'a', text: 'WHEN scored red >= 10 points DO win' },
          { id: 'b', text: 'WHEN win DO scored red 10' },
          { id: 'c', text: 'WHEN scored red <= 10 points DO win' },
          { id: 'd', text: 'WHEN bumped red DO win' },
        ],
        explanation: '>= significa "maior ou igual a".',
      },
      {
        id: 'q2',
        prompt: 'O placar sobe de 2 em 2: 6, 8, 10, 12... A regra é "WHEN scored red equals 9 points DO win". O que acontece?',
        options: [
          { id: 'a', text: 'Vence no 9' },
          { id: 'b', text: 'Vence no 10' },
          { id: 'c', text: 'Nunca vence, porque o placar nunca é exatamente 9' },
          { id: 'd', text: 'Perde' },
        ],
        explanation: 'Com "igual", o valor precisa ser exatamente aquele número.',
      },
      {
        id: 'q3',
        prompt: 'Qual ação encerra o jogo como derrota (fim de jogo)?',
        options: [
          { id: 'a', text: 'win' },
          { id: 'b', text: 'end' },
          { id: 'c', text: 'vanish' },
          { id: 'd', text: 'drop' },
        ],
        explanation: 'end termina o jogo; win termina mostrando vitória.',
      },
      {
        id: 'q4',
        prompt: 'Por que testar tanto a vitória quanto a derrota?',
        options: [
          { id: 'a', text: 'Para garantir que todos os finais possíveis funcionam' },
          { id: 'b', text: 'Porque o Kodu exige' },
          { id: 'c', text: 'Para ganhar mais pontos' },
          { id: 'd', text: 'Não é necessário testar a derrota' },
        ],
        explanation: 'Cada regra precisa de pelo menos um teste que a faça acontecer.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie uma segunda forma de perder: se o placar vermelho ficar negativo (WHEN scored red below 0 points DO end), o jogo acaba. Planeje um teste que prove que a regra funciona.',
    reflection: {
      prompt: 'O que seu colega fez durante o teste que você não esperava? O que você mudaria por causa disso?',
      guide: 'Use suas 2 observações anotadas.',
    },
    glossary: ['vitoria', 'derrota', 'comparacao'],
    versionNotes: [
      'Nas versões recentes do Kodu, "scored red 10 points" sem comparação é tratado como "igual a 10" (verificado no código-fonte oficial). Em algumas versões antigas não há blocos de comparação.',
    ],
  },
];
