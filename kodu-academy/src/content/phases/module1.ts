import type { Phase } from '../types';
import { T, ALWAYS } from '../tiles';

const TOOLBAR =
  'Barra de ferramentas (da esquerda para a direita, na versão para teclado e mouse): Home Menu (casa), Play Game (jogar), Move Camera (mão), Object Tool (adicionar objetos), Path Tool (caminhos), Ground Brush (pincel de terreno), Up/Down (morros e vales), Flatten (nivelar), Roughen (deixar irregular), Water Tool (água), Delete Tool (apagar objetos) e Change World Settings (configurações do mundo). Passe o mouse sobre um ícone para ver o nome dele.';

export const module1: Phase[] = [
  {
    id: 1,
    diagrams: ['toolbar'],
    module: 1,
    title: 'Conhecendo o Kodu Game Lab',
    difficulty: 'facil',
    estimatedMinutes: [30, 45],
    objective:
      'Abrir o Kodu, reconhecer o menu principal e a barra de ferramentas, jogar um mundo de exemplo, criar um mundo novo e salvá-lo com um nome.',
    skills: [
      'Navegar pelo menu principal do Kodu',
      'Diferenciar modo de jogo e modo de edição',
      'Criar e salvar um mundo',
      'Proteger a própria identidade ao usar nomes no Kodu',
    ],
    prerequisites: [],
    materials: [
      'Computador com Kodu Game Lab instalado (Windows)',
      'Mouse com botão direito e roda (scroll)',
      'Teclado',
      'Fones de ouvido (opcional)',
    ],
    projectLink:
      'Você cria o arquivo "Ilha" que vai evoluir até a fase 16. Nas fases 17 a 20, você cria seu jogo autoral.',
    concept: {
      title: 'Jogar × editar: os dois modos do Kodu',
      paragraphs: [
        'O Kodu Game Lab é um programa para criar jogos em 3D. Você não digita código: monta regras com blocos visuais.',
        'Todo jogo do Kodu é guardado em um MUNDO. Dentro de um mundo existem terreno, personagens, objetos e a programação de cada personagem.',
        'O Kodu tem dois modos. No MODO DE EDIÇÃO você constrói e programa usando a barra de ferramentas. No MODO DE JOGO as regras funcionam e você testa o resultado. A tecla Esc alterna entre os dois.',
      ],
      example: 'Pense em um palco de teatro: no modo de edição você monta o cenário e ensaia os atores; no modo de jogo a peça começa.',
    },
    steps: [
      {
        title: 'Abra o Kodu Game Lab',
        detail:
          'Dê dois cliques no ícone "Kodu Game Lab" na área de trabalho ou procure por "Kodu" no menu Iniciar do Windows. A primeira abertura pode demorar um pouco.',
        where: 'Área de trabalho ou menu Iniciar → Kodu Game Lab',
        check: 'Você vê a tela inicial do Kodu com um menu de opções.',
      },
      {
        title: 'Se o Kodu pedir um nome de criador, proteja sua identidade',
        detail:
          'Algumas versões pedem um "Creator name" (nome de criador) e um número PIN. Use apenas um apelido ou seu primeiro nome — nunca sobrenome, e-mail, endereço ou telefone. Se preferir, clique em OK sem criar conta para entrar como convidado (Guest).',
        where: 'Janela "Creator name" (se aparecer)',
        check: 'Você chegou ao menu principal.',
      },
      {
        title: 'Conheça o menu principal',
        detail:
          'Leia as opções. As mais importantes agora são: NEW WORLD (criar um mundo vazio), LOAD WORLD (abrir mundos salvos e exemplos), RESUME (voltar ao último mundo aberto), OPTIONS (configurações, como idioma, quando disponível) e QUIT KODU (sair). A lista pode variar um pouco conforme a versão.',
        where: 'Menu principal',
      },
      {
        title: 'Abra um mundo de exemplo',
        detail:
          'Clique em LOAD WORLD. Você verá uma lista de mundos com miniaturas. Procure as abas/filtros na parte de cima (por exemplo, "Lessons" para lições ou todos os mundos). Escolha um mundo que pareça interessante e clique nele. Quando aparecer o menu do mundo, escolha "Play" para jogar.',
        where: 'Menu principal → LOAD WORLD → escolher um mundo → Play',
        check: 'O jogo começou e algo está se movendo na tela.',
      },
      {
        title: 'Jogue e depois volte ao modo de edição',
        detail:
          'Jogue por 2 ou 3 minutos. Leia as instruções que o mundo mostrar. Depois aperte Esc no teclado. O jogo para e aparece a barra de ferramentas na parte de baixo da tela: você está no modo de edição.',
        where: 'Tecla Esc',
        check: 'A barra de ferramentas com vários ícones aparece embaixo.',
      },
      {
        title: 'Identifique as ferramentas',
        detail:
          `Passe o mouse devagar sobre cada ícone da barra de ferramentas e leia o nome que aparece. ${TOOLBAR} Não clique ainda nas ferramentas de terreno para não estragar o mundo de exemplo.`,
        where: 'Barra de ferramentas (parte de baixo da tela)',
        check: 'Você consegue apontar onde estão Home Menu, Play Game, Move Camera e Object Tool.',
      },
      {
        title: 'Abra o Home Menu',
        detail:
          'Clique no ícone da casinha (Home Menu) — ou aperte a tecla Home. Veja as opções: Play world, Edit world, Save my world, Load world, Print kode for level, Options e Exit to Main Menu.',
        where: 'Barra de ferramentas → Home Menu',
      },
      {
        title: 'Volte ao menu principal sem salvar o exemplo',
        detail:
          'Clique em "Exit to Main Menu". Se o Kodu perguntar se deseja salvar alterações no mundo de exemplo, escolha não salvar: ele não é seu.',
        where: 'Home Menu → Exit to Main Menu',
      },
      {
        title: 'Crie seu primeiro mundo',
        detail:
          'No menu principal, clique em NEW WORLD. Um mundo novo abre direto no modo de edição, com um pedaço de chão. Este será o começo da sua "Ilha".',
        where: 'Menu principal → NEW WORLD',
        check: 'Você vê um terreno simples e a barra de ferramentas.',
      },
      {
        title: 'Salve o mundo com um nome',
        detail:
          'Abra o Home Menu (casinha) e clique em "Save my world". Digite o nome "Ilha - seu apelido" (por exemplo, "Ilha - Gabi"). No campo de descrição escreva "Meu projeto da trilha Kodu Academy". Confirme em Save.',
        where: 'Home Menu → Save my world',
        check: 'Aparece uma confirmação ou o Kodu volta ao modo de edição sem erro.',
      },
      {
        title: 'Confira se o mundo foi salvo',
        detail:
          'Abra o Home Menu → Exit to Main Menu. Depois clique em LOAD WORLD e procure seu mundo pelo nome (pode estar na aba dos seus mundos). Abra-o e escolha "Edit" para voltar a editar.',
        where: 'Menu principal → LOAD WORLD',
        check: 'Seu mundo "Ilha - apelido" aparece na lista.',
      },
    ],
    rules: [],
    expectedResult:
      'Você jogou um mundo de exemplo, sabe alternar entre jogar e editar com Esc, conhece a barra de ferramentas e tem um mundo novo chamado "Ilha - seu apelido" salvo no computador.',
    checklist: [
      { id: 'abrir', text: 'Abri o Kodu e cheguei ao menu principal', required: true },
      { id: 'jogar-exemplo', text: 'Abri e joguei um mundo de exemplo pelo LOAD WORLD', required: true },
      { id: 'esc', text: 'Usei Esc para sair do jogo e ver a barra de ferramentas', required: true },
      { id: 'ferramentas', text: 'Li o nome de pelo menos 6 ferramentas da barra', required: true },
      { id: 'novo', text: 'Criei um mundo novo com NEW WORLD', required: true },
      { id: 'salvar', text: 'Salvei o mundo como "Ilha - meu apelido" pelo Home Menu', required: true },
      { id: 'reabrir', text: 'Encontrei meu mundo na lista do LOAD WORLD', required: true },
      { id: 'explorar-mais', text: 'Joguei um segundo mundo de exemplo (opcional)', required: false },
    ],
    hints: [
      'Tudo começa no menu principal. Para jogar algo pronto, procure a opção que CARREGA mundos; para começar do zero, a que cria um mundo NOVO.',
      'O botão de casinha na barra de ferramentas (Home Menu) concentra salvar, carregar e sair. A tecla Esc liga e desliga o modo de jogo.',
      'Faça assim: Menu principal → NEW WORLD. Depois clique na casinha (Home Menu) → "Save my world" → digite "Ilha - seu apelido" → Save. Para conferir, use Home Menu → Exit to Main Menu → LOAD WORLD e procure o nome.',
    ],
    troubleshooting: [
      { problem: 'Não encontro a barra de ferramentas.', solution: 'Você provavelmente está no modo de jogo. Aperte Esc uma vez. Se estiver usando controle de videogame, a interface é diferente: use teclado e mouse nesta trilha.' },
      { problem: 'O mundo de exemplo não começa.', solution: 'Ao clicar no mundo, escolha "Play" no menu que aparece. Algumas versões mostram uma tela de descrição: aperte Enter para começar.' },
      { problem: 'Não acho meu mundo no LOAD WORLD.', solution: 'Verifique as abas/filtros no topo da lista (seus mundos podem estar separados dos exemplos). Se mesmo assim não aparecer, o mundo não foi salvo: crie de novo e use Home Menu → Save my world.' },
      { problem: 'O Kodu está lento ou travando.', solution: 'Feche outros programas abertos. Avise o professor se o problema continuar: pode ser necessário ajustar a qualidade gráfica em OPTIONS.' },
    ],
    guidingQuestions: [
      'O que muda na tela quando você aperta Esc?',
      'Qual a diferença entre NEW WORLD e LOAD WORLD?',
      'Por que é importante salvar com um nome que você reconheça?',
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'Você quer começar um jogo do zero, com um mundo vazio. Qual opção do menu principal deve usar?',
        options: [
          { id: 'a', text: 'LOAD WORLD' },
          { id: 'b', text: 'NEW WORLD' },
          { id: 'c', text: 'RESUME' },
          { id: 'd', text: 'COMMUNITY' },
        ],
        explanation: 'LOAD WORLD abre mundos existentes; RESUME volta ao último mundo. Para começar do zero, cria-se um mundo novo.',
      },
      {
        id: 'q2',
        prompt: 'Você está jogando e quer voltar para editar o mundo. O que faz?',
        options: [
          { id: 'a', text: 'Aperto Esc' },
          { id: 'b', text: 'Fecho o Kodu' },
          { id: 'c', text: 'Clico com o botão direito no personagem' },
          { id: 'd', text: 'Aperto a barra de espaço' },
        ],
        explanation: 'A tecla Esc alterna entre o modo de jogo e o modo de edição.',
      },
      {
        id: 'q3',
        prompt: 'Onde fica a opção "Save my world"?',
        options: [
          { id: 'a', text: 'No menu principal, em OPTIONS' },
          { id: 'b', text: 'No Home Menu (ícone de casinha da barra de ferramentas)' },
          { id: 'c', text: 'Ela aparece sozinha quando o jogo termina' },
          { id: 'd', text: 'No Object Tool' },
        ],
        explanation: 'Salvar, carregar e sair ficam no Home Menu, o primeiro ícone da barra de ferramentas.',
      },
      {
        id: 'q4',
        prompt: 'O Kodu pediu um "Creator name". Qual é a melhor escolha?',
        options: [
          { id: 'a', text: 'Meu nome completo, para todos saberem que fui eu' },
          { id: 'b', text: 'Meu e-mail' },
          { id: 'c', text: 'Um apelido ou só o primeiro nome' },
          { id: 'd', text: 'O nome e a turma de um colega' },
        ],
        explanation: 'Nomes de criador podem ficar visíveis se o mundo for compartilhado. Use apenas dados que não identifiquem você.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: [
      'Todos os itens obrigatórios do checklist marcados',
      'Acertar pelo menos 3 de 4 perguntas do teste',
      'Escrever a reflexão',
      'Confirmar a revisão das instruções',
    ],
    extraChallenge:
      'Abra mais dois mundos de exemplo e anote, para cada um: qual é o objetivo do jogo, como o jogador controla o personagem e como se ganha. Essas anotações vão ajudar no seu jogo autoral.',
    reflection: {
      prompt: 'Qual mundo de exemplo você jogou e o que achou mais interessante nele? O que você gostaria de criar no seu próprio jogo?',
      guide: 'Escreva 2 ou 3 frases. Cite o nome do mundo e uma ideia para o futuro.',
    },
    glossary: ['kodu', 'mundo', 'modo-edicao', 'modo-jogo', 'barra-ferramentas'],
    versionNotes: [
      'Esta trilha usa a interface de teclado e mouse. Com controle de videogame (Xbox), os menus funcionam de outro jeito.',
      'Os nomes de menus e blocos aparecem em inglês na maioria das instalações, mesmo com o idioma em português. Por isso mostramos o nome original e a tradução.',
    ],
  },

  {
    id: 2,
    diagrams: ['mouse', 'toolbar'],
    module: 1,
    title: 'Explorando o ambiente: câmera e terreno',
    difficulty: 'facil',
    estimatedMinutes: [40, 50],
    objective:
      'Controlar a câmera e usar as ferramentas de terreno para transformar o mundo em uma ilha com chão, morro e água.',
    skills: [
      'Mover, girar e aproximar a câmera',
      'Pintar e apagar terreno com o Ground Brush',
      'Criar morros e vales com Up/Down',
      'Adicionar água com a Water Tool',
    ],
    prerequisites: [1],
    materials: ['Kodu Game Lab', 'Mundo "Ilha - seu apelido" da fase 1', 'Mouse com roda e botão direito'],
    projectLink: 'Sua Ilha ganha forma: chão, um morro e mar ao redor. Nas próximas fases ela recebe personagens.',
    concept: {
      title: 'Ferramentas e "pincéis"',
      paragraphs: [
        'Construir um mundo é como pintar: você escolhe uma FERRAMENTA (o que fazer) e um PINCEL (o formato e o tamanho da área).',
        'Com o mouse, cada ferramenta de terreno usa os dois botões: em geral, o botão esquerdo acrescenta ou levanta e o botão direito apaga ou abaixa. As setas ← e → do teclado mudam o tamanho do pincel.',
        'A CÂMERA é o seu ponto de vista. Saber movimentá-la evita a maioria dos "não consigo clicar no lugar certo".',
      ],
    },
    steps: [
      {
        title: 'Abra sua Ilha no modo de edição',
        detail: 'Menu principal → LOAD WORLD → clique no seu mundo "Ilha - apelido" → Edit.',
        where: 'LOAD WORLD → seu mundo → Edit',
      },
      {
        title: 'Use a ferramenta Move Camera',
        detail:
          'Clique no ícone da mão (Move Camera). Agora: arraste com o botão ESQUERDO para deslizar o mundo; arraste com o botão DIREITO para girar a câmera em volta; gire a RODA do mouse para aproximar e afastar. Se você se perder, aperte F4 para centralizar a câmera.',
        where: 'Barra de ferramentas → Move Camera (mão)',
        check: 'Você consegue ver o terreno de cima, de lado e de perto.',
      },
      {
        title: 'Escolha o Ground Brush',
        detail:
          'Clique no ícone Ground Brush (pincel de terreno). Aparecem opções de PINCEL (redondo, quadrado, linear, "mágico") e de MATERIAL (texturas como grama, areia, pedra). Escolha o pincel redondo e um material de grama ou areia.',
        where: 'Barra de ferramentas → Ground Brush',
      },
      {
        title: 'Aumente a ilha',
        detail:
          'Clique e arraste com o botão ESQUERDO ao lado do terreno para adicionar chão. Use as setas ← e → do teclado para mudar o tamanho do pincel. Faça uma ilha mais ou menos redonda, umas 3 vezes maior que o terreno inicial.',
        where: 'Ground Brush → botão esquerdo (adicionar) | setas ← → (tamanho)',
        check: 'O terreno cresceu.',
      },
      {
        title: 'Apague um pedaço e pinte outro material',
        detail:
          'Arraste com o botão DIREITO sobre uma borda para apagar terreno. Depois escolha outro material (por exemplo, areia) e pinte uma "praia" na borda da ilha com o botão esquerdo.',
        where: 'Ground Brush → botão direito (apagar)',
      },
      {
        title: 'Crie um morro',
        detail:
          'Clique na ferramenta Up/Down. Segure o botão ESQUERDO sobre o centro da ilha para levantar o terreno e formar um morro. O botão DIREITO abaixa (cria vales). Faça um morro de altura média — não alto demais.',
        where: 'Barra de ferramentas → Up/Down',
        check: 'Há um morro visível no meio da ilha.',
      },
      {
        title: 'Suavize o morro',
        detail:
          'Use a ferramenta Flatten: o botão ESQUERDO suaviza; o botão DIREITO nivela (deixa plano). Passe o botão esquerdo nas bordas do morro para que não fique "pontudo". Para conhecer, teste também a Roughen (deixa o terreno irregular) em uma área pequena.',
        where: 'Barra de ferramentas → Flatten / Roughen',
      },
      {
        title: 'Adicione o mar',
        detail:
          'Clique na Water Tool. Clique com o botão ESQUERDO fora da ilha para subir o nível da água; com o botão DIREITO você abaixa. Suba a água até cercar a ilha sem cobrir todo o chão.',
        where: 'Barra de ferramentas → Water Tool',
        check: 'A ilha está cercada de água e o morro continua de fora.',
      },
      {
        title: 'Teste e salve',
        detail:
          'Aperte Esc para entrar no modo de jogo e veja a ilha (ainda sem personagens). Aperte Esc de novo para voltar. Depois: Home Menu → Save my world. Mantenha o mesmo nome; se o Kodu oferecer, você pode salvar como nova versão.',
        where: 'Esc → Esc → Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult: 'Sua Ilha tem chão com pelo menos dois materiais, um morro suave no centro e água em volta. Você consegue olhar o mundo de qualquer ângulo.',
    checklist: [
      { id: 'camera-mover', text: 'Movi a câmera arrastando com o botão esquerdo (Move Camera)', required: true },
      { id: 'camera-girar', text: 'Girei a câmera com o botão direito e aproximei com a roda', required: true },
      { id: 'f4', text: 'Usei F4 para recentralizar a câmera', required: false },
      { id: 'chao', text: 'Aumentei a ilha com o Ground Brush e mudei o tamanho do pincel', required: true },
      { id: 'material', text: 'Pintei uma área com outro material', required: true },
      { id: 'morro', text: 'Criei um morro com Up/Down e suavizei com Flatten', required: true },
      { id: 'agua', text: 'Cerquei a ilha de água com a Water Tool', required: true },
      { id: 'salvar', text: 'Salvei o mundo', required: true },
    ],
    hints: [
      'Cada ferramenta de terreno faz uma coisa diferente. Leia o nome do ícone antes de clicar no mundo.',
      'Botão esquerdo costuma acrescentar/levantar e o direito apagar/abaixar. As setas ← e → mudam o tamanho do pincel. Para a câmera, use a mão (Move Camera).',
      'Ordem sugerida: Move Camera para enxergar bem → Ground Brush (esquerdo adiciona chão) → Up/Down (esquerdo levanta o morro) → Flatten (esquerdo suaviza) → Water Tool (esquerdo sobe a água) → Home Menu → Save my world.',
    ],
    troubleshooting: [
      { problem: 'Cliquei e nada aconteceu.', solution: 'Verifique qual ferramenta está ativa (ícone destacado). Algumas ferramentas, como Up/Down, só funcionam onde já existe terreno.' },
      { problem: 'A água cobriu tudo.', solution: 'Com a Water Tool, clique com o botão DIREITO para abaixar o nível da água. Ou levante o terreno com Up/Down.' },
      { problem: 'A câmera ficou de cabeça para baixo ou muito longe.', solution: 'Aperte F4 para centralizar. Use a roda do mouse para aproximar.' },
      { problem: 'Apaguei sem querer uma parte grande.', solution: 'Pinte de novo com o botão esquerdo do Ground Brush. Se o estrago for grande, saia sem salvar e abra a versão salva.' },
    ],
    guidingQuestions: [
      'Qual botão do mouse levanta o terreno na ferramenta Up/Down?',
      'Por que um morro muito alto pode atrapalhar o jogo depois?',
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'Com a ferramenta Move Camera, o que acontece ao arrastar com o botão DIREITO do mouse?',
        options: [
          { id: 'a', text: 'A câmera gira em volta do mundo' },
          { id: 'b', text: 'O terreno é apagado' },
          { id: 'c', text: 'Um personagem é criado' },
          { id: 'd', text: 'O jogo começa' },
        ],
        explanation: 'Na Move Camera: botão esquerdo desliza, botão direito gira (orbita) e a roda aproxima/afasta.',
      },
      {
        id: 'q2',
        prompt: 'Qual ferramenta você usa para criar um morro?',
        options: [
          { id: 'a', text: 'Water Tool' },
          { id: 'b', text: 'Object Tool' },
          { id: 'c', text: 'Up/Down' },
          { id: 'd', text: 'Path Tool' },
        ],
        explanation: 'Up/Down levanta (botão esquerdo) ou abaixa (botão direito) o terreno.',
      },
      {
        id: 'q3',
        prompt: 'Você quer um pincel maior no Ground Brush. O que faz?',
        options: [
          { id: 'a', text: 'Aperta Esc' },
          { id: 'b', text: 'Usa as setas ← e → do teclado' },
          { id: 'c', text: 'Clica duas vezes no terreno' },
          { id: 'd', text: 'Não é possível mudar o tamanho' },
        ],
        explanation: 'Nas ferramentas de pincel, as setas esquerda e direita mudam o tamanho.',
      },
      {
        id: 'q4',
        prompt: 'A câmera ficou perdida e você não vê mais a ilha. Qual tecla ajuda?',
        options: [
          { id: 'a', text: 'F4' },
          { id: 'b', text: 'Delete' },
          { id: 'c', text: 'Enter' },
          { id: 'd', text: 'Tab apaga o mundo' },
        ],
        explanation: 'F4 centraliza a câmera em uma posição razoável.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: [
      'Todos os itens obrigatórios do checklist marcados',
      'Acertar pelo menos 3 de 4 perguntas',
      'Escrever a reflexão',
      'Confirmar a revisão das instruções',
    ],
    extraChallenge:
      'Use o pincel "mágico" (magic brush) do Ground Brush ou a Roughen para criar uma pequena área montanhosa em um canto da ilha, e um lago dentro da ilha com a Water Tool. Teste como fica no modo de jogo.',
    reflection: {
      prompt: 'Qual ferramenta de terreno foi mais difícil de controlar e o que você fez para conseguir usá-la?',
      guide: 'Conte o problema e a estratégia que funcionou (por exemplo, mudar a câmera ou o tamanho do pincel).',
    },
    glossary: ['camera', 'terreno', 'pincel'],
    versionNotes: [
      'Em algumas versões, a lista de materiais e formatos de pincel é diferente. Qualquer material serve para esta fase.',
    ],
  },

  {
    id: 3,
    module: 1,
    title: 'Personagens e objetos no mundo',
    difficulty: 'facil',
    estimatedMinutes: [35, 45],
    objective:
      'Usar a Object Tool para adicionar o Kodu e objetos, mover, mudar cor, tamanho, rotação e altura, e organizar a ilha para as próximas missões.',
    skills: [
      'Adicionar personagens e objetos pelo menu circular',
      'Selecionar, arrastar e apagar objetos',
      'Alterar cor, tamanho, rotação e altura',
      'Diferenciar personagem (programável) de cenário',
    ],
    prerequisites: [2],
    materials: ['Kodu Game Lab', 'Mundo "Ilha" da fase 2'],
    projectLink: 'A Ilha recebe o herói (Kodu), maçãs, árvores e pedras que serão usados nas missões de programação.',
    concept: {
      title: 'Personagens e objetos',
      paragraphs: [
        'PERSONAGENS (bots) como Kodu, Cycle e a tartaruga podem se mover e receber programas. OBJETOS como maçãs, moedas, árvores e pedras compõem o cenário e podem ser percebidos pelos personagens.',
        'Na Object Tool, um clique com o botão esquerdo em um lugar vazio abre um MENU CIRCULAR. Itens com uma setinha abrem um submenu com mais opções.',
        'Clicando com o botão direito sobre algo que já está no mundo, você abre o menu de opções daquele item: Program, Change Settings, Cut, Copy, Change Size, Rotate, Change Height, entre outros.',
      ],
    },
    steps: [
      {
        title: 'Abra a Ilha e escolha a Object Tool',
        detail: 'LOAD WORLD → sua Ilha → Edit. Na barra de ferramentas, clique na Object Tool (ícone de adicionar objetos).',
        where: 'Barra de ferramentas → Object Tool',
      },
      {
        title: 'Adicione o Kodu',
        detail:
          'Clique com o botão ESQUERDO em um lugar plano da ilha. Um menu circular aparece. Clique no Kodu (personagem azul/branco flutuante). Se não o vir, procure no grupo de personagens ("bots").',
        where: 'Object Tool → clique esquerdo no chão → menu circular → Kodu',
        check: 'O Kodu aparece no lugar clicado.',
      },
      {
        title: 'Mova o Kodu',
        detail: 'Com a Object Tool ativa, clique e segure o botão esquerdo sobre o Kodu e arraste até perto da praia. Solte.',
        where: 'Object Tool → arrastar com botão esquerdo',
      },
      {
        title: 'Adicione 6 maçãs',
        detail:
          'Clique em lugares vazios e escolha a maçã (apple) — ela fica no grupo de objetos. Espalhe 6 maçãs pela ilha, longe umas das outras. Dica: depois de colocar uma, você pode clicar com o botão direito sobre ela e usar Copy e depois Paste em outro lugar.',
        where: 'Menu circular → grupo de objetos → apple',
        check: 'Há 6 maçãs espalhadas.',
      },
      {
        title: 'Adicione 3 árvores e 2 pedras',
        detail: 'Do mesmo jeito, adicione árvores (tree) e pedras (rock). Coloque algumas pedras entre o Kodu e as maçãs: elas serão obstáculos.',
        where: 'Menu circular → tree / rock',
      },
      {
        title: 'Mude a cor de um objeto',
        detail:
          'Clique uma vez em uma das maçãs para selecioná-la e aperte as setas ← e → do teclado. A cor muda. Deixe 2 maçãs VERMELHAS e 1 AZUL — vamos usar cores na fase 8.',
        where: 'Selecionar objeto → setas ← →',
        check: 'Você tem maçãs de cores diferentes.',
      },
      {
        title: 'Use o menu de opções do botão direito',
        detail:
          'Clique com o botão DIREITO sobre uma árvore. No menu, escolha Change Size e aumente um pouco a árvore. Depois, clique com o direito em uma pedra e use Rotate para girá-la. Experimente Change Height em um objeto e depois volte à altura normal.',
        where: 'Botão direito sobre o objeto → Change Size / Rotate / Change Height',
      },
      {
        title: 'Apague um objeto',
        detail:
          'Adicione um objeto extra qualquer. Depois clique com o botão direito sobre ele e escolha Cut — ele sai do mundo. (A Delete Tool também apaga objetos em área, como uma borracha.)',
        where: 'Botão direito → Cut',
      },
      {
        title: 'Teste e salve',
        detail:
          'Aperte Esc para jogar: os objetos aparecem, mas o Kodu fica parado — ele ainda não tem programa! Esc de novo e salve (Home Menu → Save my world).',
        where: 'Esc → Esc → Home Menu → Save my world',
      },
    ],
    rules: [],
    expectedResult:
      'A Ilha tem 1 Kodu perto da praia, 6 maçãs (incluindo vermelhas e uma azul), 3 árvores e 2 pedras. No modo de jogo nada se move, porque ainda não há programação.',
    checklist: [
      { id: 'kodu', text: 'Adicionei o Kodu pela Object Tool', required: true },
      { id: 'arrastar', text: 'Arrastei o Kodu para outro lugar', required: true },
      { id: 'macas', text: 'Coloquei 6 maçãs espalhadas', required: true },
      { id: 'cenario', text: 'Coloquei 3 árvores e 2 pedras', required: true },
      { id: 'cores', text: 'Mudei a cor de maçãs com as setas (vermelhas e uma azul)', required: true },
      { id: 'opcoes', text: 'Usei Change Size ou Rotate pelo botão direito', required: true },
      { id: 'cut', text: 'Removi um objeto com Cut', required: true },
      { id: 'salvar', text: 'Testei com Esc e salvei', required: true },
    ],
    hints: [
      'Para colocar coisas no mundo, a ferramenta certa é a que adiciona objetos. Clique no chão vazio e observe o menu que aparece.',
      'Botão esquerdo em lugar vazio = adicionar. Botão esquerdo sobre um objeto = selecionar/arrastar. Botão direito sobre um objeto = menu de opções (Program, Change Size, Rotate, Cut...).',
      'Exemplo: Object Tool → clique esquerdo no chão → no menu circular, clique em Kodu. Para a maçã, clique esquerdo em outro lugar vazio → grupo de objetos → apple. Selecione a maçã e aperte → para mudar a cor.',
    ],
    troubleshooting: [
      { problem: 'O menu circular não aparece.', solution: 'Confirme que a Object Tool está ativa e clique em um lugar vazio do terreno (não sobre a água ou sobre outro objeto).' },
      { problem: 'Não encontro a maçã.', solution: 'Itens com setinha no menu circular abrem submenus. Procure no grupo de objetos. Passe o mouse para ver os nomes.' },
      { problem: 'A cor não muda.', solution: 'Primeiro clique uma vez no objeto para selecioná-lo; depois use as setas ← e → (não use o teclado numérico).' },
      { problem: 'O objeto sumiu dentro do morro.', solution: 'Use o botão direito → Change Height ou arraste-o para um lugar plano.' },
    ],
    guidingQuestions: ['Qual a diferença entre clicar com o botão esquerdo e o direito sobre um objeto?', 'Por que o Kodu não se moveu no modo de jogo?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Na Object Tool, o que acontece ao clicar com o botão ESQUERDO em um lugar vazio do terreno?',
        options: [
          { id: 'a', text: 'O terreno é apagado' },
          { id: 'b', text: 'Abre um menu circular para escolher o que adicionar' },
          { id: 'c', text: 'O jogo começa' },
          { id: 'd', text: 'A câmera gira' },
        ],
        explanation: 'Clique esquerdo em área vazia abre o menu circular de personagens e objetos.',
      },
      {
        id: 'q2',
        prompt: 'Como mudar a cor de uma maçã que já está no mundo?',
        options: [
          { id: 'a', text: 'Selecionar a maçã e usar as setas ← →' },
          { id: 'b', text: 'Pintar com o Ground Brush' },
          { id: 'c', text: 'Apertar F4' },
          { id: 'd', text: 'Usar a Water Tool' },
        ],
        explanation: 'Com o objeto selecionado na Object Tool, as setas esquerda/direita trocam a cor.',
      },
      {
        id: 'q3',
        prompt: 'Qual opção do menu do botão direito permite deixar uma árvore maior?',
        options: [
          { id: 'a', text: 'Program' },
          { id: 'b', text: 'Rotate' },
          { id: 'c', text: 'Change Size' },
          { id: 'd', text: 'Copy' },
        ],
        explanation: 'Change Size altera o tamanho; Rotate gira; Change Height muda a altura.',
      },
      {
        id: 'q4',
        prompt: 'Você colocou o Kodu e apertou Esc para jogar, mas ele não se mexe. Por quê?',
        options: [
          { id: 'a', text: 'O Kodu está quebrado' },
          { id: 'b', text: 'Ele ainda não tem nenhuma regra no seu programa' },
          { id: 'c', text: 'Falta água no mundo' },
          { id: 'd', text: 'Precisa ser da cor vermelha' },
        ],
        explanation: 'Personagens só fazem algo quando recebem regras. Programar é o assunto da próxima fase.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Monte uma pequena "vila" em um canto da ilha usando castle, hut ou outros objetos de cenário. Use Rotate e Change Size para que fique organizada. Atenção: não apague nada que as próximas fases pedem (Kodu, maçãs, pedras).',
    reflection: {
      prompt: 'Explique, com suas palavras, a diferença entre um personagem e um objeto de cenário no Kodu.',
      guide: 'Dê um exemplo de cada um que você colocou na Ilha.',
    },
    glossary: ['personagem', 'objeto'],
    versionNotes: ['A posição dos itens no menu circular muda entre versões. Passe o mouse sobre cada item para ler o nome.'],
  },

  {
    id: 4,
    diagrams: ['rule-anatomy'],
    module: 1,
    title: 'Programando o primeiro movimento',
    difficulty: 'facil',
    estimatedMinutes: [35, 45],
    objective:
      'Abrir o editor de programação do Kodu, criar uma regra de movimento, testá-la e modificá-la com modificadores.',
    skills: [
      'Abrir o editor com botão direito → Program',
      'Adicionar blocos à parte DO de uma regra',
      'Usar modificadores (wander, quickly, slowly)',
      'Testar e ajustar um programa',
    ],
    prerequisites: [3],
    materials: ['Kodu Game Lab', 'Mundo "Ilha" com o Kodu (fase 3)'],
    projectLink: 'O Kodu da Ilha ganha vida pela primeira vez.',
    concept: {
      title: 'Programa, regra e ação',
      paragraphs: [
        'O PROGRAMA de um personagem é uma lista de REGRAS. Cada regra ocupa uma linha numerada e tem duas partes: WHEN (quando) e DO (faça).',
        'Nesta fase você vai usar só a parte DO. Quando a parte WHEN fica VAZIA, o Kodu entende "sempre": a ação acontece o tempo todo.',
        'Uma AÇÃO (como move) pode receber MODIFICADORES, que dizem como ela acontece: wander (vagando), quickly (rápido), slowly (devagar).',
      ],
      example: 'WHEN (vazio) DO move wander = "sempre, ande vagando pela ilha".',
    },
    steps: [
      {
        title: 'Abra o programa do Kodu',
        detail:
          'Abra sua Ilha no modo de edição. Escolha a Object Tool. Clique com o botão DIREITO sobre o Kodu e escolha Program no menu.',
        where: 'Object Tool → botão direito sobre o Kodu → Program',
        check: 'Abre o editor de programação, com a linha 1 mostrando WHEN e DO.',
      },
      {
        title: 'Observe o editor',
        detail:
          'Cada linha numerada é uma regra. À esquerda fica o WHEN e à direita o DO. Os sinais de "+" indicam onde você pode adicionar blocos. No topo há a indicação da página (página 1). Clicar com o botão esquerdo em um bloco ou "+" adiciona/troca; clicar com o botão direito em um bloco o apaga.',
        where: 'Editor de programação',
      },
      {
        title: 'Adicione a ação move',
        detail:
          'Na linha 1, NÃO mexa no WHEN. Clique no "+" que fica depois do DO. No menu circular de ações, clique em move.',
        where: 'Linha 1 → "+" após DO → move',
        check: 'A linha 1 mostra: WHEN [vazio] DO [move].',
      },
      {
        title: 'Adicione o modificador wander',
        detail:
          'Clique no novo "+" que apareceu depois do move. Escolha wander. Essa combinação faz o Kodu andar sem destino, explorando a ilha.',
        where: 'Linha 1 → "+" após move → wander',
        rules: {
          character: 'Kodu',
          rules: [{ line: 1, when: ALWAYS, do: [T.move, T.wander] }],
          explanation: 'Sempre (WHEN vazio), mova-se vagando.',
        },
      },
      {
        title: 'Teste o programa',
        detail:
          'Aperte Esc para sair do editor e Esc mais uma vez (ou clique em Play Game) para jogar. Observe o Kodu por 20 segundos. Depois aperte Esc para voltar ao modo de edição.',
        where: 'Esc → Esc (jogar) → Esc (voltar)',
        check: 'O Kodu anda sozinho pela ilha, mudando de direção.',
      },
      {
        title: 'Deixe o movimento mais rápido',
        detail:
          'Reabra o programa (botão direito no Kodu → Program). Clique no "+" depois de wander e adicione quickly. Teste. Depois adicione mais um quickly e teste de novo. O que muda?',
        where: 'Linha 1 → "+" → quickly',
      },
      {
        title: 'Troque para devagar',
        detail:
          'Clique com o botão DIREITO sobre cada quickly para apagá-lo. Adicione slowly. Teste e compare.',
        where: 'Botão direito sobre o bloco → apagar',
      },
      {
        title: 'Experimente outra ação: turn',
        detail:
          'Em vez de mudar a linha 1, use a linha 2: no DO da linha 2, adicione turn e depois left. Teste. O Kodu deve girar enquanto anda. Depois apague a linha 2 (botão direito sobre os blocos) e deixe só DO move wander.',
        where: 'Linha 2 → DO → turn → left',
        rules: {
          character: 'Kodu',
          rules: [
            { line: 1, when: ALWAYS, do: [T.move, T.wander] },
            { line: 2, when: ALWAYS, do: [T.turn, T.left] },
          ],
          explanation: 'Teste temporário: andar vagando e virar para a esquerda ao mesmo tempo.',
        },
      },
      {
        title: 'Salve',
        detail: 'Deixe o programa final como DO move wander e salve: Home Menu → Save my world.',
        where: 'Home Menu → Save my world',
      },
    ],
    rules: [
      {
        character: 'Kodu',
        rules: [{ line: 1, when: ALWAYS, do: [T.move, T.wander] }],
        explanation: 'Programa final da fase: o Kodu vaga pela ilha o tempo todo.',
      },
    ],
    expectedResult: 'Ao jogar, o Kodu passeia sozinho pela ilha. Você sabe acelerar, desacelerar e testar mudanças.',
    checklist: [
      { id: 'abrir-editor', text: 'Abri o editor com botão direito no Kodu → Program', required: true },
      { id: 'move', text: 'Montei a regra DO move wander na linha 1', required: true },
      { id: 'testar', text: 'Testei e vi o Kodu andando sozinho', required: true },
      { id: 'quickly', text: 'Testei com quickly e com slowly', required: true },
      { id: 'apagar-bloco', text: 'Apaguei um bloco com o botão direito', required: true },
      { id: 'turn', text: 'Experimentei a ação turn left na linha 2', required: false },
      { id: 'salvar', text: 'Salvei com o programa final', required: true },
    ],
    hints: [
      'O programa fica "dentro" do personagem. Procure no menu de opções do Kodu (botão direito) a opção para programá-lo.',
      'Você só precisa da parte DO: clique no "+" depois do DO, escolha a ação de movimento e depois um modificador que faça o Kodu andar sem destino.',
      'Linha 1: deixe o WHEN vazio. Clique no "+" do DO → move. Clique no "+" seguinte → wander. Esc, Esc para jogar.',
    ],
    troubleshooting: [
      { problem: 'Não aparece a opção Program.', solution: 'Verifique se a Object Tool está ativa e se você clicou com o botão DIREITO exatamente em cima do Kodu.' },
      { problem: 'O Kodu não se move ao jogar.', solution: 'Confira se a regra está no Kodu (e não em outro objeto) e se o bloco wander está depois de move.' },
      { problem: 'Coloquei o bloco no WHEN por engano.', solution: 'Clique com o botão direito sobre o bloco errado para apagá-lo e coloque-o depois do DO.' },
      { problem: 'O Kodu cai na água ou some.', solution: 'Normal em mundos pequenos. Aumente a ilha (fase 2) ou ative Glass Walls em Change World Settings, que impede sair pela borda do mundo.' },
    ],
    guidingQuestions: ['O que o Kodu entende quando o WHEN está vazio?', 'Qual é a função de um modificador?'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Como se abre o editor de programação do Kodu?',
        options: [
          { id: 'a', text: 'Home Menu → Save my world' },
          { id: 'b', text: 'Object Tool → botão direito sobre o Kodu → Program' },
          { id: 'c', text: 'Ground Brush → botão direito' },
          { id: 'd', text: 'Apertando F4' },
        ],
        explanation: 'O programa pertence ao personagem; abre-se pelo menu de opções dele.',
      },
      {
        id: 'q2',
        prompt: 'A regra é: WHEN (vazio) DO move wander. Quando o Kodu vai se mover?',
        options: [
          { id: 'a', text: 'Nunca, porque falta o WHEN' },
          { id: 'b', text: 'Só quando ver uma maçã' },
          { id: 'c', text: 'Sempre, durante todo o jogo' },
          { id: 'd', text: 'Só quando apertar uma tecla' },
        ],
        explanation: 'WHEN vazio significa "sempre".',
      },
      {
        id: 'q3',
        prompt: 'Em "move wander quickly", qual é a AÇÃO?',
        options: [
          { id: 'a', text: 'move' },
          { id: 'b', text: 'wander' },
          { id: 'c', text: 'quickly' },
          { id: 'd', text: 'Todos são ações' },
        ],
        explanation: 'A ação é o primeiro bloco do DO. Os seguintes são modificadores que detalham a ação.',
      },
      {
        id: 'q4',
        prompt: 'Como apagar um bloco no editor de programação usando o mouse?',
        options: [
          { id: 'a', text: 'Clicar com o botão direito sobre o bloco' },
          { id: 'b', text: 'Apertar Esc' },
          { id: 'c', text: 'Arrastar para a água' },
          { id: 'd', text: 'Não é possível apagar' },
        ],
        explanation: 'No editor, o botão esquerdo adiciona/troca e o botão direito apaga o bloco.',
      },
    ],
    quizPassMin: 3,
    completionCriteria: ['Itens obrigatórios do checklist', 'Pelo menos 3 de 4 acertos', 'Reflexão escrita', 'Revisão confirmada'],
    extraChallenge:
      'Adicione um segundo personagem (por exemplo, a tartaruga ou o Cycle) e programe-o com DO move wander slowly. Compare a velocidade dos dois. Depois apague esse personagem ou guarde-o para a fase 7.',
    reflection: {
      prompt: 'Descreva, passo a passo, como você programou o Kodu para andar sozinho. O que aconteceu quando adicionou quickly?',
      guide: 'Imagine que está explicando para um colega que faltou na aula.',
    },
    glossary: ['programa', 'regra', 'acao', 'modificador'],
  },
];
