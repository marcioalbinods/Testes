export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  /** Fase em que o termo é apresentado. O glossário do aluno libera o termo quando a fase fica disponível. */
  phase: number;
  example?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { id: 'kodu', term: 'Kodu Game Lab', phase: 1, definition: 'Programa gratuito para criar jogos em 3D usando programação visual: em vez de digitar código, você monta regras com blocos.' },
  { id: 'mundo', term: 'Mundo', phase: 1, definition: 'O arquivo do seu jogo no Kodu. Guarda o terreno, os personagens, os objetos e toda a programação.' },
  { id: 'modo-edicao', term: 'Modo de edição', phase: 1, definition: 'Momento em que você constrói e programa o mundo usando a barra de ferramentas.' },
  { id: 'modo-jogo', term: 'Modo de jogo', phase: 1, definition: 'Momento em que o mundo "roda" e as regras são executadas. No Kodu, a tecla Esc alterna entre jogar e editar.' },
  { id: 'barra-ferramentas', term: 'Barra de ferramentas', phase: 1, definition: 'Fileira de ícones na parte de baixo da tela do modo de edição (Home Menu, Play, câmera, objetos, terreno...).' },
  { id: 'camera', term: 'Câmera', phase: 2, definition: 'O "olho" pelo qual você vê o mundo. Pode ser movida, girada e aproximada.' },
  { id: 'terreno', term: 'Terreno', phase: 2, definition: 'O chão do mundo. Pode ter materiais diferentes, morros, vales e água.' },
  { id: 'pincel', term: 'Pincel (brush)', phase: 2, definition: 'Formato e tamanho da área afetada pelas ferramentas de terreno.' },
  { id: 'personagem', term: 'Personagem (bot)', phase: 3, definition: 'Ser que pode se mover e ser programado, como Kodu, Cycle, Rover ou a tartaruga.' },
  { id: 'objeto', term: 'Objeto', phase: 3, definition: 'Elemento colocado no mundo, como maçã, moeda, árvore, pedra ou castelo.' },
  { id: 'programa', term: 'Programa', phase: 4, definition: 'Conjunto de regras que define o comportamento de um personagem.' },
  { id: 'regra', term: 'Regra', phase: 4, definition: 'Uma linha do programa no Kodu, formada por uma parte WHEN (quando) e uma parte DO (faça).' },
  { id: 'acao', term: 'Ação', phase: 4, definition: 'O que o personagem faz. Fica na parte DO da regra. Ex.: move, jump, eat.', example: 'DO move wander' },
  { id: 'modificador', term: 'Modificador', phase: 4, definition: 'Bloco que detalha uma ação: como, para onde ou quanto. Ex.: quickly, toward, wander.' },
  { id: 'when-do', term: 'WHEN / DO', phase: 5, definition: 'WHEN significa "quando" (a condição). DO significa "faça" (a ação). Toda regra do Kodu segue esse formato.' },
  { id: 'sensor', term: 'Sensor', phase: 5, definition: 'Bloco do WHEN que percebe algo: ver (see), ouvir (hear), encostar (bumped), teclado (keyboard)...' },
  { id: 'condicao', term: 'Condição', phase: 5, definition: 'Situação que precisa ser verdadeira para a ação acontecer.', example: 'WHEN see apple — a condição é "ver uma maçã".' },
  { id: 'prioridade', term: 'Prioridade das regras', phase: 5, definition: 'Quando duas regras mandam o personagem fazer coisas conflitantes (como ir para lugares diferentes), a regra mais acima tem preferência.' },
  { id: 'entrada', term: 'Entrada (input)', phase: 6, definition: 'Informação que o jogador envia ao jogo, como apertar uma tecla ou mover a alavanca do controle.' },
  { id: 'it', term: 'it (isso)', phase: 7, definition: 'Modificador que aponta para o objeto que o sensor percebeu. Em "WHEN bumped apple DO eat it", "it" é a maçã em que o personagem encostou.' },
  { id: 'colisao', term: 'Colisão', phase: 7, definition: 'Quando dois elementos se encostam. No Kodu, é percebida pelo sensor bumped.' },
  { id: 'filtro', term: 'Filtro', phase: 8, definition: 'Bloco que deixa o sensor mais específico: cor, distância, tipo de objeto ou "not".', example: 'WHEN see red apple close by' },
  { id: 'evento', term: 'Evento', phase: 8, definition: 'Algo que acontece em um momento específico, como uma colisão ou o aperto de uma tecla.' },
  { id: 'not', term: 'not (não)', phase: 8, definition: 'Filtro que inverte a condição: a regra vale quando o sensor NÃO percebe aquilo.' },
  { id: 'obstaculo', term: 'Obstáculo', phase: 9, definition: 'Elemento que bloqueia ou dificulta o caminho do jogador: paredes, morros, água, pedras.' },
  { id: 'caminho', term: 'Caminho (path)', phase: 9, definition: 'Linha criada com a Path Tool. Pode ser estrada, muro (wall), vegetação ou um trajeto invisível que personagens seguem.' },
  { id: 'coleta', term: 'Coleta', phase: 10, definition: 'Mecânica em que o jogador pega ou consome objetos espalhados pelo mundo.' },
  { id: 'pontuacao', term: 'Pontuação (score)', phase: 11, definition: 'Número que o jogo guarda e mostra na tela. No Kodu, cada cor funciona como um placar separado.' },
  { id: 'variavel', term: 'Variável / contador', phase: 11, definition: 'Lugar onde o jogo guarda um número que pode mudar. No Kodu, os placares coloridos funcionam como variáveis.' },
  { id: 'objetivo', term: 'Objetivo', phase: 11, definition: 'O que o jogador precisa alcançar para vencer.' },
  { id: 'vitoria', term: 'Condição de vitória', phase: 12, definition: 'Regra que termina o jogo com vitória (ação win).' },
  { id: 'derrota', term: 'Condição de derrota', phase: 12, definition: 'Regra que termina o jogo com derrota (ação end).' },
  { id: 'comparacao', term: 'Comparação', phase: 12, definition: 'Teste entre números: igual (equals), maior ou igual (>=), menor ou igual (<=), acima (above), abaixo (below).' },
  { id: 'pagina', term: 'Página', phase: 13, definition: 'O programa de um personagem pode ter até 12 páginas. Só as regras da página atual funcionam. A ação switch troca de página.' },
  { id: 'estado', term: 'Estado', phase: 13, definition: 'Modo de comportamento de um personagem (ex.: normal, turbo, fugindo). No Kodu, cada estado pode ser uma página.' },
  { id: 'recuo', term: 'Regra recuada (subordinada)', phase: 13, definition: 'Regra deslocada para a direita, abaixo de outra. Ela só é verificada quando a regra de cima é verdadeira — funciona como "E".' },
  { id: 'npc', term: 'NPC / inimigo', phase: 14, definition: 'Personagem controlado pelo próprio jogo, com comportamento programado.' },
  { id: 'patrulha', term: 'Patrulha', phase: 14, definition: 'Comportamento de seguir um trajeto repetidamente, por exemplo com "move on path".' },
  { id: 'temporizador', term: 'Temporizador (timer)', phase: 15, definition: 'Sensor que dispara depois de um número de segundos e se repete.' },
  { id: 'once', term: 'once (uma vez)', phase: 15, definition: 'Modificador que faz a ação acontecer só uma vez a cada vez que a condição começa a valer.' },
  { id: 'bug', term: 'Bug', phase: 16, definition: 'Erro: o jogo faz algo diferente do que você planejou.' },
  { id: 'depuracao', term: 'Depuração (debug)', phase: 16, definition: 'Processo de encontrar a causa de um bug e corrigi-la: reproduzir, isolar, testar hipótese, corrigir e testar de novo.' },
  { id: 'caso-teste', term: 'Caso de teste', phase: 16, definition: 'Situação planejada para verificar se uma regra funciona, com o resultado esperado anotado.' },
  { id: 'logica-e', term: 'Lógica "E"', phase: 17, definition: 'Duas condições precisam ser verdadeiras ao mesmo tempo. No Kodu, use uma regra recuada abaixo de outra.' },
  { id: 'game-design', term: 'Game design', phase: 18, definition: 'Planejamento do jogo: objetivo, regras, controles, desafios, cenário e experiência do jogador.' },
  { id: 'prototipo', term: 'Protótipo', phase: 18, definition: 'Primeira versão jogável e simples, feita para testar a ideia principal.' },
  { id: 'playtest', term: 'Playtest', phase: 19, definition: 'Sessão em que outra pessoa joga seu jogo enquanto você observa e anota problemas.' },
  { id: 'iteracao', term: 'Iteração', phase: 19, definition: 'Ciclo de melhorar, testar e melhorar de novo.' },
];
