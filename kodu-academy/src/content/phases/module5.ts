import type { Phase } from '../types';
import { T, text, points } from '../tiles';

export const module5: Phase[] = [
  {
    id: 17,
    module: 5,
    title: 'Múltiplos objetivos e regras combinadas',
    difficulty: 'dificil',
    estimatedMinutes: [50, 65],
    objective:
      'Exigir que o jogador cumpra mais de um objetivo para vencer, usando placares como "bandeiras" (0 = não cumprido, 1 = cumprido) e regras recuadas.',
    skills: [
      'Usar uma variável como bandeira (flag)',
      'Combinar várias condições para a vitória',
      'Reorganizar um programa grande',
      'Dar retorno sobre o progresso dos objetivos',
    ],
    prerequisites: [16],
    materials: ['Kodu Game Lab', 'Ilha 1.0 (fase 16)'],
    projectLink: 'Ilha 2.0: para vencer, é preciso ter 10 pontos E entregar a estrela no castelo.',
    concept: {
      title: 'Bandeiras: variáveis que lembram',
      paragraphs: [
        'Uma BANDEIRA (flag) é uma variável que guarda se algo já aconteceu: 0 = ainda não, 1 = sim. No Kodu, use um placar de cor livre (por exemplo, orange).',
        'Com bandeiras, o jogo "lembra" de eventos passados. A estrela foi entregue há 30 segundos? A bandeira laranja continua valendo 1.',
        'Para vencer com dois objetivos: regra mãe "pontos >= 10" + regra filha recuada "bandeira >= 1 → win". As duas condições precisam ser verdadeiras ao mesmo tempo.',
      ],
    },
    steps: [
      {
        title: 'Salve como Ilha 2.0',
        detail: 'Abra a Ilha 1.0 e salve como "Ilha - apelido - 2.0". Trabalhe nesta cópia.',
        where: 'Home Menu → Save my world',
      },
      {
        title: 'Escreva os objetivos no papel',
        detail:
          'Objetivo A: 10 pontos vermelhos. Objetivo B: entregar a estrela no castelo. Escreva a condição de vitória como frase: "SE pontos >= 10 E estrela entregue, ENTÃO vence".',
        where: 'Caderno',
      },
      {
        title: 'Crie a bandeira',
        detail:
          'Na regra mãe "WHEN bumped castle" (fase 13), adicione mais uma filha recuada abaixo de "got star → score red 5": WHEN got star DO set score → orange → 1 point.',
        where: 'Kodu → regras do castelo',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 18, when: [T.bumped, T.castle], do: [] },
            { line: 19, when: [T.got, T.star], do: [T.score, T.mRed, T.pts5], indent: 1 },
            { line: 20, when: [T.got, T.star], do: [T.setScore, { label: 'orange', kind: 'modifier', pt: 'laranja' }, T.pts1], indent: 1 },
            { line: 21, when: [T.got, T.star, T.not], do: [T.say, text('Traga a estrela até aqui!')], indent: 1 },
          ],
          explanation: 'Entregar a estrela agora também levanta a bandeira laranja (= 1).',
        },
      },
      {
        title: 'Remova a vitória antiga',
        detail: 'Apague a regra "WHEN scored red >= 10 points DO win" (fase 12). Ela venceria sem a estrela.',
        where: 'Kodu → Program',
      },
      {
        title: 'Monte a nova vitória combinada',
        detail:
          'Regra mãe: WHEN scored red >= 10 points (DO vazio). Filha recuada: WHEN scored orange >= 1 point DO win. Outra filha recuada: WHEN scored orange <= 0 points DO say "Falta entregar a estrela!".',
        where: 'Kodu → novas linhas',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 27, when: [T.scored, T.red, T.gteq, points(10)], do: [] },
            { line: 28, when: [T.scored, { label: 'orange', kind: 'filter', pt: 'laranja' }, T.gteq, points(1)], do: [T.win], indent: 1 },
            { line: 29, when: [T.scored, { label: 'orange', kind: 'filter', pt: 'laranja' }, T.lteq, points(0)], do: [T.say, text('Falta entregar a estrela!')], indent: 1 },
          ],
          explanation: 'Só vence com os dois objetivos. Com 10 pontos e sem a estrela, o jogo avisa o que falta.',
        },
      },
      {
        title: 'Teste as combinações',
        detail:
          'Faça os 3 testes e anote: (1) 10 pontos SEM entregar a estrela → aviso, sem vitória; (2) estrela entregue com menos de 10 pontos → nada ainda; (3) os dois → vitória.',
        where: 'Esc → Esc',
      },
      {
        title: 'Verifique o tempo',
        detail:
          'Com dois objetivos, 60 segundos ainda são suficientes? Ajuste o valor inicial do relógio (fase 15) se necessário. Lembre: as regras do tempo e das vidas continuam valendo.',
        where: 'Kodu → regra set score green',
      },
      {
        title: 'Atualize a descrição e salve',
        detail: 'Descrição: "Para vencer: faça 10 pontos E leve a estrela ao castelo. 3 vidas, tempo limitado." Salve.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'A Ilha 2.0 só termina em vitória quando o jogador tem 10 pontos ou mais E entregou a estrela. Os três testes de combinação foram feitos e registrados.',
    checklist: [
      { id: 'copia', text: 'Salvei como Ilha 2.0', required: true },
      { id: 'frase', text: 'Escrevi a condição de vitória como frase SE... E... ENTÃO', required: true },
      { id: 'bandeira', text: 'A entrega da estrela define a bandeira laranja = 1', required: true },
      { id: 'antiga', text: 'Removi a regra de vitória antiga', required: true },
      { id: 'combinada', text: 'Montei a vitória combinada com regra recuada', required: true },
      { id: 'testes', text: 'Fiz os 3 testes de combinação', required: true },
      { id: 'tempo', text: 'Revisei se o tempo é suficiente', required: true },
    ],
    hints: [
      'O jogo precisa "lembrar" que a estrela foi entregue. Qual recurso do Kodu guarda informações enquanto o jogo roda?',
      'Use um placar de outra cor como bandeira (set score orange 1 point na entrega). A vitória é uma regra mãe (scored red >= 10) com uma filha recuada (scored orange >= 1 → win).',
      'Filha do castelo: WHEN got star DO set score orange 1 point. Vitória: WHEN scored red >= 10 points (DO vazio) → recuada: WHEN scored orange >= 1 point DO win. Apague a vitória antiga.',
    ],
    troubleshooting: [
      { problem: 'Venço sem a estrela.', solution: 'A regra antiga de vitória ainda existe, ou a regra win não está recuada sob a mãe.' },
      { problem: 'Entrego a estrela e a bandeira não muda.', solution: 'A regra set score orange precisa estar recuada sob "bumped castle", com got star no WHEN. Teste se o +5 funciona: se sim, a bandeira deveria funcionar também.' },
      { problem: 'O aviso "Falta entregar a estrela" aparece o tempo todo.', solution: 'Ele deve estar recuado sob "scored red >= 10". Assim só aparece depois dos 10 pontos.' },
      { problem: 'Não aparece o placar laranja.', solution: 'Ele surge na primeira mudança. Isso é normal; não é um erro.' },
    ],
    guidingQuestions: ['Como o jogo "lembra" que a estrela foi entregue?', 'Por que a regra antiga de vitória precisou sair?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'O que é uma "bandeira" em programação de jogos?',
        options: [
          { id: 'a', text: 'Um enfeite no castelo' },
          { id: 'b', text: 'Uma variável que indica se algo já aconteceu (ex.: 0 ou 1)' },
          { id: 'c', text: 'O nome do jogador' },
          { id: 'd', text: 'Um tipo de caminho' },
        ],
        explanation: 'Bandeiras guardam um estado do jogo para ser consultado depois.',
      },
      {
        id: 'q2',
        prompt: 'Regra mãe: WHEN scored red >= 10 points. Filha recuada: WHEN scored orange >= 1 point DO win. Quando o jogador vence?',
        options: [
          { id: 'a', text: 'Com 10 pontos, mesmo sem a bandeira' },
          { id: 'b', text: 'Com a bandeira, mesmo sem os pontos' },
          { id: 'c', text: 'Só com 10 pontos ou mais E a bandeira laranja em 1 ou mais' },
          { id: 'd', text: 'Nunca' },
        ],
        explanation: 'A filha só é verificada quando a mãe é verdadeira: as duas condições precisam valer.',
      },
      {
        id: 'q3',
        prompt: 'Para testar uma vitória com dois objetivos, quantas combinações vale a pena testar no mínimo?',
        options: [
          { id: 'a', text: 'Só a vitória' },
          { id: 'b', text: 'Três: só A, só B, A e B' },
          { id: 'c', text: 'Nenhuma' },
          { id: 'd', text: 'Uma por cor' },
        ],
        explanation: 'É preciso provar que nem A sozinho nem B sozinho dão vitória.',
      },
      {
        id: 'q4',
        prompt: 'Qual ação define a bandeira laranja como 1?',
        options: [
          { id: 'a', text: 'set score orange 1 point' },
          { id: 'b', text: 'switch page 1' },
          { id: 'c', text: 'glow orange' },
          { id: 'd', text: 'color orange' },
        ],
        explanation: 'set score coloca um valor exato no placar escolhido.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Adicione um terceiro objetivo opcional que dá bônus: recolher todas as 5 moedas dá +3 segundos por moeda restante... ou crie a sua própria regra de bônus. Escreva-a primeiro como frase SE... E... ENTÃO.',
    reflection: {
      prompt: 'Qual foi a maior diferença entre programar um objetivo e programar dois objetivos combinados?',
      guide: 'Fale sobre planejamento, testes e a ideia de "bandeira".',
    },
    glossary: ['logica-e'],
  },

  {
    id: 18,
    diagrams: ['iteration'],
    module: 5,
    title: 'Projeto autoral: planejamento e protótipo',
    difficulty: 'dificil',
    estimatedMinutes: [60, 90],
    objective:
      'Planejar o próprio jogo com um documento de game design e construir um protótipo jogável do "ciclo principal" (o que o jogador faz o tempo todo).',
    skills: [
      'Escrever um documento de game design',
      'Planejar regras em WHEN/DO antes de programar',
      'Construir um protótipo mínimo',
      'Escolher o escopo adequado ao tempo disponível',
    ],
    prerequisites: [17],
    materials: ['Kodu Game Lab', 'Folha ou arquivo para o documento de design', 'Anotações das fases 1 (jogos de exemplo) e 16 (testes)'],
    projectLink: 'Começa o SEU jogo, em um mundo novo. A Ilha serve de referência e fonte de ideias.',
    concept: {
      title: 'Game design: pensar antes de construir',
      paragraphs: [
        'Todo jogo responde a perguntas: Quem é o jogador? O que ele faz? Qual o objetivo? O que atrapalha? Como se ganha e como se perde?',
        'Um PROTÓTIPO é a menor versão jogável da ideia. Ele testa o CICLO PRINCIPAL — por exemplo, "andar, coletar e fugir". Se o ciclo principal for divertido, vale a pena acrescentar detalhes.',
        'ESCOPO é o tamanho do projeto. Um jogo pequeno e bem-feito é melhor do que um enorme e inacabado.',
      ],
    },
    steps: [
      {
        title: 'Escolha um tipo de jogo',
        detail:
          'Ideias: corrida contra o tempo, coleta com inimigos, labirinto, esconde-esconde, defesa de base, aventura com missões. Escolha uma — você pode misturar com o que aprendeu.',
        where: 'Caderno',
      },
      {
        title: 'Preencha o documento de design',
        detail:
          'Responda por escrito: 1. Título. 2. História em 2 frases. 3. Personagem do jogador e controles. 4. Objetivo (como vencer). 5. Como perder. 6. Inimigos/obstáculos e como se comportam. 7. Pontuação e variáveis (quais cores e para quê). 8. Mapa (esboço com regiões). 9. Pelo menos 3 recursos da trilha que você vai usar (ex.: páginas, timer, bandeiras, recuo).',
        where: 'Documento de design',
        check: 'Todas as 9 perguntas respondidas.',
      },
      {
        title: 'Escreva as regras principais no papel',
        detail:
          'Para cada personagem importante, escreva as regras como WHEN ... DO .... Exemplo: "Jogador: WHEN keyboard Arrows DO move". Isso evita retrabalho no Kodu.',
        where: 'Documento de design',
      },
      {
        title: 'Defina o ciclo principal',
        detail: 'Escreva em uma frase o que o jogador faz o tempo todo. Ex.: "explorar o labirinto pegando chaves e evitando guardas".',
        where: 'Documento de design',
      },
      {
        title: 'Crie o mundo do projeto',
        detail: 'NEW WORLD → salve como "Projeto - apelido - v0.1". Ative Glass Walls. Construa só a área necessária para o protótipo (não o mapa todo).',
        where: 'NEW WORLD → Home Menu → Save my world',
      },
      {
        title: 'Programe o protótipo mínimo',
        detail:
          'O protótipo precisa ter: (1) personagem controlado pelo jogador; (2) uma mecânica de coleta ou desafio com pontuação; (3) uma condição de vitória. Ainda sem enfeites.',
        where: 'Object Tool → Program',
      },
      {
        title: 'Teste o ciclo principal',
        detail: 'Jogue o protótipo 3 vezes. É divertido? É muito fácil ou difícil? Anote 3 ajustes.',
        where: 'Esc → Esc',
      },
      {
        title: 'Revise o escopo',
        detail:
          'Compare o que planejou com o tempo que resta (fases 19 e 20). Marque no documento o que é ESSENCIAL e o que é EXTRA (só se sobrar tempo).',
        where: 'Documento de design',
      },
      {
        title: 'Salve',
        detail: 'Salve como "Projeto - apelido - v0.2".',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'Documento de design completo, regras principais escritas no papel e um protótipo jogável com controle do jogador, uma mecânica com pontuação e uma condição de vitória.',
    checklist: [
      { id: 'tipo', text: 'Escolhi o tipo de jogo', required: true },
      { id: 'documento', text: 'Respondi as 9 perguntas do documento de design', required: true },
      { id: 'regras-papel', text: 'Escrevi as regras principais em WHEN/DO no papel', required: true },
      { id: 'ciclo', text: 'Defini o ciclo principal em uma frase', required: true },
      { id: 'prototipo', text: 'Construí o protótipo com controle, pontuação e vitória', required: true },
      { id: 'testes', text: 'Testei 3 vezes e anotei 3 ajustes', required: true },
      { id: 'escopo', text: 'Separei o essencial do extra', required: true },
    ],
    hints: [
      'Comece pequeno. Pense em um jogo que você conseguiria explicar em 20 segundos.',
      'Use a Ilha como modelo: controle (fase 6), coleta e pontos (10–11), vitória/derrota (12), inimigo (14), tempo/vidas (15). Escolha o que combina com a sua ideia.',
      'Exemplo de protótipo mínimo: jogador com WHEN keyboard Arrows DO move; 5 moedas com WHEN bumped coin DO vanish it + score yellow 1 point; WHEN scored yellow >= 5 points DO win. Depois evolua.',
    ],
    troubleshooting: [
      { problem: 'Não tenho ideia de jogo.', solution: 'Volte às anotações da fase 1 ou mude um elemento da Ilha: troque coletar por fugir, ou o tempo por vidas.' },
      { problem: 'Meu plano é grande demais.', solution: 'Corte metade. Mantenha o ciclo principal e uma vitória; o resto vira "extra".' },
      { problem: 'O protótipo não é divertido.', solution: 'Mude UMA variável de jogo: velocidade, quantidade de objetos, tempo limite. Teste de novo.' },
      { problem: 'Gastei o tempo todo no cenário.', solution: 'Na fase 18, o cenário pode ser simples. Programação e testes vêm primeiro.' },
    ],
    guidingQuestions: ['Qual é o ciclo principal do seu jogo?', 'O que você deixou como "extra" e por quê?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'O que é um protótipo?',
        options: [
          { id: 'a', text: 'A versão final, com todos os detalhes' },
          { id: 'b', text: 'A menor versão jogável que testa a ideia principal' },
          { id: 'c', text: 'Um desenho do personagem' },
          { id: 'd', text: 'O nome do jogo' },
        ],
        explanation: 'Protótipos testam cedo se a ideia funciona.',
      },
      {
        id: 'q2',
        prompt: 'Por que escrever as regras em WHEN/DO no papel antes de programar?',
        options: [
          { id: 'a', text: 'Porque o Kodu lê o papel' },
          { id: 'b', text: 'Para planejar a lógica e evitar retrabalho' },
          { id: 'c', text: 'Para gastar tempo' },
          { id: 'd', text: 'Não tem utilidade' },
        ],
        explanation: 'Planejar ajuda a encontrar conflitos e lacunas antes de construir.',
      },
      {
        id: 'q3',
        prompt: 'Seu plano tem 15 recursos e faltam 2 aulas. O que fazer?',
        options: [
          { id: 'a', text: 'Tentar fazer todos ao mesmo tempo' },
          { id: 'b', text: 'Separar o essencial do extra e garantir o essencial primeiro' },
          { id: 'c', text: 'Desistir' },
          { id: 'd', text: 'Fazer só o cenário' },
        ],
        explanation: 'Ajustar o escopo é parte do trabalho de quem cria jogos.',
      },
      {
        id: 'q4',
        prompt: 'Qual destes itens NÃO é essencial em um protótipo mínimo?',
        options: [
          { id: 'a', text: 'Controle do jogador' },
          { id: 'b', text: 'Uma condição de vitória' },
          { id: 'c', text: 'Música de fundo personalizada' },
          { id: 'd', text: 'Uma mecânica principal' },
        ],
        explanation: 'Acabamento (como música) vem depois do ciclo principal funcionar.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Peça a um colega para jogar seu protótipo por 2 minutos e explicar, sem sua ajuda, qual é o objetivo. Se ele não souber, o que você pode mudar no jogo (não na explicação)?',
    reflection: {
      prompt: 'Descreva seu jogo em 3 frases: o que é, o que o jogador faz e como se vence.',
      guide: 'Este texto pode virar a descrição do seu mundo no Kodu.',
    },
    glossary: ['game-design', 'prototipo'],
  },

  {
    id: 19,
    diagrams: ['iteration'],
    module: 5,
    title: 'Finalizar, testar com jogadores e aprimorar',
    difficulty: 'dificil',
    estimatedMinutes: [60, 90],
    objective:
      'Completar o jogo autoral, realizar playtests com outras pessoas, priorizar melhorias com base nas observações e polir a experiência.',
    skills: [
      'Conduzir um playtest sem interferir',
      'Transformar observações em melhorias priorizadas',
      'Corrigir bugs com o método da fase 16',
      'Dar acabamento (feedback visual e sonoro, instruções)',
    ],
    prerequisites: [18],
    materials: ['Kodu Game Lab', 'Projeto v0.2 (fase 18)', 'Documento de design', 'Ficha de playtest (no caderno)'],
    projectLink: 'Seu jogo chega à versão 1.0, testada por outras pessoas.',
    concept: {
      title: 'Iteração: construir → testar → melhorar',
      paragraphs: [
        'Criadores de jogos não acertam na primeira tentativa. Eles ITERAM: constroem, observam pessoas jogando, ajustam e repetem.',
        'No PLAYTEST, a regra de ouro é: observe e anote, não explique. Se você precisar explicar, o jogo ainda não está claro.',
        'Nem toda sugestão precisa ser feita. PRIORIZE: primeiro bugs que impedem jogar, depois problemas de clareza, depois melhorias de diversão e, por fim, enfeites.',
      ],
    },
    steps: [
      {
        title: 'Complete os requisitos do jogo',
        detail:
          'Garanta que seu jogo tenha: jogador controlável; pelo menos 1 NPC com comportamento próprio; pontuação ou outra variável; vitória E derrota; pelo menos 1 recurso entre timer, once, páginas ou regra recuada; cenário com pelo menos 3 regiões; descrição com instruções.',
        where: 'Projeto no Kodu',
      },
      {
        title: 'Faça seu próprio teste',
        detail: 'Escreva e execute casos de teste para cada regra importante (como na fase 16). Corrija o que falhar. Salve como "v0.9".',
        where: 'Caderno + Kodu',
      },
      {
        title: 'Prepare a ficha de playtest',
        detail:
          'No caderno, para cada testador: 1. Entendeu o objetivo sem ajuda? 2. Onde ficou travado? 3. Venceu ou perdeu? Em quanto tempo? 4. O que achou mais divertido? 5. O que mudaria?',
        where: 'Caderno',
      },
      {
        title: 'Playtest com 2 colegas',
        detail:
          'Cada colega joga por 3 a 5 minutos. Você observa em silêncio e anota. Só responda perguntas DEPOIS. Faça as perguntas 4 e 5 ao final.',
        where: 'Colegas',
      },
      {
        title: 'Priorize as melhorias',
        detail:
          'Liste tudo o que observou. Classifique em: (A) bug que impede jogar; (B) falta de clareza; (C) diversão/equilíbrio; (D) enfeite. Escolha pelo menos 3 melhorias, começando pelo A.',
        where: 'Caderno',
      },
      {
        title: 'Implemente e reteste',
        detail: 'Faça as melhorias uma por vez, testando depois de cada uma.',
        where: 'Kodu',
      },
      {
        title: 'Dê acabamento',
        detail:
          'Feedback: sons ao coletar e ao perder vida (play), brilho ou expressão (glow, express), mensagens (say). Revise a descrição do mundo com instruções claras. Confira a câmera em Change World Settings.',
        where: 'Kodu → Program, Change World Settings',
      },
      {
        title: 'Salve a versão 1.0 e uma cópia',
        detail: 'Salve como "Projeto - apelido - 1.0". Se o professor pedir, exporte ou entregue o arquivo do mundo conforme a orientação da turma.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'Jogo autoral 1.0 com todos os requisitos, testado por você e por 2 colegas, com pelo menos 3 melhorias feitas a partir das observações.',
    checklist: [
      { id: 'requisitos', text: 'Meu jogo cumpre todos os requisitos listados', required: true },
      { id: 'testes-proprios', text: 'Executei meus casos de teste e corrigi falhas', required: true },
      { id: 'ficha', text: 'Preparei a ficha de playtest', required: true },
      { id: 'playtest', text: 'Fiz playtest com 2 colegas, sem explicar durante o jogo', required: true },
      { id: 'prioridades', text: 'Classifiquei as observações (A, B, C, D)', required: true },
      { id: 'melhorias', text: 'Implementei pelo menos 3 melhorias', required: true },
      { id: 'acabamento', text: 'Adicionei feedback visual/sonoro e revisei a descrição', required: true },
      { id: 'versao', text: 'Salvei a versão 1.0', required: true },
    ],
    hints: [
      'Observe os jogadores mais do que ouve as opiniões deles: onde eles param, erram ou se confundem?',
      'Priorize na ordem A (bugs) → B (clareza) → C (diversão) → D (enfeite). Teste depois de cada mudança.',
      'Exemplo: testador não entendeu o objetivo (B) → reescreva a descrição e adicione um say no início (WHEN vazio DO say "..." once). Testador ficou preso atrás de um morro (A) → ajuste o terreno.',
    ],
    troubleshooting: [
      { problem: 'Os colegas acharam difícil demais.', solution: 'Reduza a velocidade dos inimigos, aumente o tempo ou as vidas. Ajuste um valor por vez.' },
      { problem: 'Ninguém entendeu o objetivo.', solution: 'Melhore a descrição do mundo e use mensagens (say) no começo do jogo e em momentos-chave.' },
      { problem: 'Uma melhoria criou um bug novo.', solution: 'Volte à versão salva anterior ou desfaça a última mudança e use o método da fase 16.' },
      { problem: 'Não deu tempo de fazer tudo.', solution: 'Normal. Garanta que o essencial funcione e registre o resto como "próximas ideias".' },
    ],
    guidingQuestions: ['Qual observação dos testadores mais surpreendeu você?', 'Por que bugs que impedem jogar vêm antes dos enfeites?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Durante o playtest, o testador fica perdido. O que você deve fazer?',
        options: [
          { id: 'a', text: 'Explicar imediatamente o que fazer' },
          { id: 'b', text: 'Observar e anotar onde e por que ele se perdeu' },
          { id: 'c', text: 'Pegar o mouse e jogar por ele' },
          { id: 'd', text: 'Encerrar o teste' },
        ],
        explanation: 'A dificuldade dele é uma informação valiosa sobre o jogo.',
      },
      {
        id: 'q2',
        prompt: 'Qual melhoria tem MAIOR prioridade?',
        options: [
          { id: 'a', text: 'Trocar a cor das árvores' },
          { id: 'b', text: 'Corrigir um bug que impede vencer' },
          { id: 'c', text: 'Adicionar uma música' },
          { id: 'd', text: 'Mudar o nome do jogo' },
        ],
        explanation: 'Bugs que impedem jogar vêm primeiro.',
      },
      {
        id: 'q3',
        prompt: 'O que significa iterar?',
        options: [
          { id: 'a', text: 'Fazer tudo de uma vez só' },
          { id: 'b', text: 'Repetir ciclos de construir, testar e melhorar' },
          { id: 'c', text: 'Apagar o jogo e começar outro' },
          { id: 'd', text: 'Copiar o jogo de um colega' },
        ],
        explanation: 'A iteração é a base do desenvolvimento de jogos.',
      },
      {
        id: 'q4',
        prompt: 'Qual destes é um exemplo de "feedback" ao jogador?',
        options: [
          { id: 'a', text: 'Um som quando ele coleta uma moeda' },
          { id: 'b', text: 'O nome do arquivo do mundo' },
          { id: 'c', text: 'A quantidade de páginas do programa' },
          { id: 'd', text: 'A versão do Kodu' },
        ],
        explanation: 'Feedback mostra ao jogador o resultado das ações dele.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Crie um segundo nível: em Change World Settings, procure a opção de próximo nível (Next Level, quando disponível) e a ação next level. Se a sua versão não tiver, crie um "modo difícil" no mesmo mundo usando páginas.',
    reflection: {
      prompt: 'Qual mudança, feita por causa do playtest, mais melhorou seu jogo? Como você sabe que melhorou?',
      guide: 'Mencione a observação, a mudança e o novo teste.',
    },
    glossary: ['playtest', 'iteracao'],
  },

  {
    id: 20,
    module: 5,
    title: 'Projeto final: apresentação do jogo autoral',
    difficulty: 'dificil',
    estimatedMinutes: [50, 70],
    objective:
      'Apresentar o jogo autoral explicando objetivo, controles e regras de programação, demonstrar o funcionamento e avaliar o próprio trabalho com uma rubrica.',
    skills: [
      'Explicar regras de programação com vocabulário correto',
      'Demonstrar um jogo funcionando',
      'Autoavaliar com critérios objetivos',
      'Dar e receber feedback respeitoso',
    ],
    prerequisites: [19],
    materials: ['Kodu Game Lab', 'Projeto 1.0 (fase 19)', 'Documento de design', 'Tabela de bugs e fichas de playtest'],
    projectLink: 'Encerramento da trilha: seu jogo é apresentado e você registra tudo o que aprendeu.',
    concept: {
      title: 'Comunicar também é programar',
      paragraphs: [
        'Saber explicar o próprio código mostra que você realmente o entende. Na apresentação, use os termos corretos: sensor, ação, modificador, filtro, variável, página, regra recuada.',
        'Uma RUBRICA lista critérios objetivos. Ela ajuda você a avaliar seu trabalho com honestidade e a enxergar o que melhorar.',
      ],
    },
    steps: [
      {
        title: 'Monte o roteiro da apresentação (3 minutos)',
        detail:
          'Roteiro: 1. Nome do jogo e ideia (20 s). 2. Objetivo, controles, vitória e derrota (30 s). 3. Demonstração jogando (60 s). 4. Explicação de 3 regras interessantes em WHEN/DO (50 s). 5. Um bug que você corrigiu e como (20 s).',
        where: 'Caderno',
      },
      {
        title: 'Escolha as 3 regras para explicar',
        detail:
          'Escolha regras que mostrem conceitos diferentes, por exemplo: uma de controle, uma com variável (score/scored) e uma com página, timer, once ou recuo. Para cada uma, explique: "QUANDO ... o personagem FAZ ..., porque ...".',
        where: 'Kodu → Program',
      },
      {
        title: 'Ensaie',
        detail: 'Ensaie uma vez cronometrando. Deixe o mundo aberto e pronto para jogar antes da sua vez.',
        where: 'Kodu',
      },
      {
        title: 'Faça a autoavaliação',
        detail:
          'Avalie seu jogo de 1 a 4 em cada critério: (a) funciona sem bugs graves; (b) objetivo claro; (c) usa pelo menos 5 conceitos da trilha; (d) inimigo/NPC com comportamento próprio; (e) vitória e derrota testadas; (f) melhorias a partir de playtest. Escreva uma justificativa curta para cada nota.',
        where: 'Caderno',
      },
      {
        title: 'Apresente',
        detail: 'Apresente para a turma ou para o professor, seguindo o roteiro.',
        where: 'Sala de aula',
      },
      {
        title: 'Jogue o jogo de um colega e dê feedback',
        detail: 'Jogue o jogo de pelo menos um colega e dê um feedback no formato: "Gostei de... / Fiquei com dúvida em... / Sugiro...".',
        where: 'Colegas',
      },
      {
        title: 'Entregue',
        detail: 'Salve a versão final como "Projeto - apelido - final" e entregue conforme a orientação do professor.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'Você apresentou seu jogo, explicou 3 regras com vocabulário correto, demonstrou vitória ou derrota, fez a autoavaliação e deu feedback a um colega.',
    checklist: [
      { id: 'roteiro', text: 'Montei o roteiro de 5 partes', required: true },
      { id: 'regras', text: 'Escolhi 3 regras de conceitos diferentes para explicar', required: true },
      { id: 'ensaio', text: 'Ensaiei cronometrando', required: true },
      { id: 'autoavaliacao', text: 'Fiz a autoavaliação com justificativas', required: true },
      { id: 'apresentacao', text: 'Apresentei o jogo', required: true },
      { id: 'feedback', text: 'Joguei o jogo de um colega e dei feedback', required: true },
      { id: 'entrega', text: 'Salvei a versão final e entreguei', required: true },
    ],
    hints: [
      'Pense na apresentação como um "trailer" do seu jogo: mostre o essencial e o que você mais se orgulha.',
      'Para explicar uma regra, leia-a em voz alta como frase: "QUANDO o Kodu encosta em uma moeda, ele soma 1 ponto amarelo".',
      'Exemplo de explicação: "Esta regra recuada só vale quando o jogador encosta no castelo; se ele estiver com a estrela, ganha 5 pontos e a bandeira laranja vira 1. Assim o jogo lembra que a missão foi cumprida."',
    ],
    troubleshooting: [
      { problem: 'Fico nervoso para apresentar.', solution: 'Siga o roteiro escrito e foque na demonstração: o jogo "fala" por você.' },
      { problem: 'O jogo deu erro na hora da apresentação.', solution: 'Explique o bug como um caso real de depuração: qual é o sintoma e qual seria sua hipótese.' },
      { problem: 'Não sei explicar uma regra.', solution: 'Leia os blocos na ordem: sensor, filtros, ação, modificadores. Depois diga POR QUE ela existe.' },
    ],
    guidingQuestions: ['Qual conceito você entende hoje que não entendia na fase 1?', 'O que você faria no próximo jogo?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Em "WHEN see red apple close by DO move toward quickly", quais são os FILTROS?',
        options: [
          { id: 'a', text: 'see e move' },
          { id: 'b', text: 'red, apple e close by' },
          { id: 'c', text: 'toward e quickly' },
          { id: 'd', text: 'WHEN e DO' },
        ],
        explanation: 'Filtros detalham o sensor (no WHEN); modificadores detalham a ação (no DO).',
      },
      {
        id: 'q2',
        prompt: 'Qual recurso você usaria para um inimigo que muda de "patrulhando" para "perseguindo"?',
        options: [
          { id: 'a', text: 'Páginas e a ação switch' },
          { id: 'b', text: 'A Water Tool' },
          { id: 'c', text: 'Apenas a ação win' },
          { id: 'd', text: 'Glass Walls' },
        ],
        explanation: 'Cada estado pode ser uma página; switch troca entre elas.',
      },
      {
        id: 'q3',
        prompt: 'O jogo deve acabar quando o placar azul (vidas) chegar a zero. Qual regra é a mais segura?',
        options: [
          { id: 'a', text: 'WHEN scored blue <= 0 points DO end' },
          { id: 'b', text: 'WHEN scored blue >= 0 points DO end' },
          { id: 'c', text: 'WHEN bumped blue DO end' },
          { id: 'd', text: 'WHEN scored red 0 DO win' },
        ],
        explanation: '<= 0 funciona mesmo que o placar pule para um valor negativo.',
      },
      {
        id: 'q4',
        prompt: 'Uma ação acontece várias vezes em um único encostão. Qual modificador resolve?',
        options: [
          { id: 'a', text: 'quickly' },
          { id: 'b', text: 'once' },
          { id: 'c', text: 'it' },
          { id: 'd', text: 'wander' },
        ],
        explanation: 'once executa a ação uma vez por ativação da condição.',
      },
      {
        id: 'q5',
        prompt: 'Para vencer, o jogador precisa de 10 pontos E da chave. Qual estrutura usar?',
        options: [
          { id: 'a', text: 'Duas regras win independentes' },
          { id: 'b', text: 'Regra mãe com uma condição e regra filha recuada com a outra, com win na filha' },
          { id: 'c', text: 'Uma página para cada objetivo' },
          { id: 'd', text: 'Não é possível no Kodu' },
        ],
        explanation: 'Recuo = "E": a filha só é verificada quando a mãe é verdadeira.',
      },
    ],
    quizPassMin: 4,
    completionCriteria: [
      'Itens obrigatórios do checklist',
      'Pelo menos 4 de 5 acertos no teste final',
      'Reflexão final escrita',
      'Revisão confirmada',
    ],
    extraChallenge:
      'Escreva um pequeno "manual do jogador" (meia página) e um "manual do programador" explicando as páginas e variáveis do seu jogo, para que outra pessoa consiga continuar o projeto.',
    reflection: {
      prompt: 'Olhando para as 20 fases: o que você aprendeu sobre programação e sobre você mesmo como criador? Qual será seu próximo projeto?',
      guide: 'Escreva pelo menos 4 frases.',
    },
    glossary: [],
  },
];
