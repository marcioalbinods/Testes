/* =====================================================================
   TREINANDO UMA IA SEM PRECONCEITOS — Conteúdo do jogo
   Todo o texto, as missões, os desafios e as respostas ficam aqui,
   separados da lógica (engine.js / mechanics.js / app.js).
   IMPORTANTE: todas as pessoas, empresas, bases de dados e números dos
   desafios são FICTÍCIOS e foram criados para fins educativos.
   ===================================================================== */
(function () {
  'use strict';

  /* -------------------- Personagens -------------------- */
  const characters = {
    lia: { name: 'Dra. Lia Moraes', role: 'Coordenadora de Ética em IA', spec: 's8 f a locs glasses labcoat c1' },
    teo: { name: 'Téo Ikeda', role: 'Engenheiro de Dados', spec: 's3 m y short hoodie c2 headset' },
    nexus: { name: 'NEXUS AI', role: 'Inteligência artificial', core: true }
  };

  /* -------------------- Abertura -------------------- */
  const intro = [
    { scene: 'city', big: 'ANO 2040.', text: '' },
    { scene: 'orbit', text: 'A Inteligência Artificial está presente em praticamente todos os aspectos da vida humana. Ela ajuda a selecionar candidatos para empregos, recomendar conteúdos, reconhecer imagens, organizar informações e até auxiliar decisões importantes.' },
    { scene: 'glitch', big: 'Mas existe um problema.', text: '' },
    { scene: 'core-glitch', text: 'A NEXUS AI, uma das inteligências artificiais mais utilizadas do mundo, começou a apresentar resultados injustos. Seus sistemas estão reproduzindo preconceitos, reforçando estereótipos e prejudicando determinados grupos de pessoas.' },
    { scene: 'lab', text: 'Sua missão é investigar o problema, descobrir suas causas e reconstruir o sistema.' },
    { scene: 'final', big: 'Você está preparado para treinar uma IA mais justa?', text: '' }
  ];

  /* -------------------- Níveis de experiência -------------------- */
  const levels = [
    { xp: 0, title: 'Estagiário(a) de IA' },
    { xp: 250, title: 'Analista Júnior' },
    { xp: 600, title: 'Analista de Dados' },
    { xp: 1000, title: 'Investigador(a) de Algoritmos' },
    { xp: 1500, title: 'Pesquisador(a) em IA' },
    { xp: 2100, title: 'Especialista em IA' },
    { xp: 2700, title: 'Especialista Sênior em IA Responsável' }
  ];

  /* -------------------- Medalhas (uma por missão) -------------------- */
  const medals = {
    detetive: { name: 'Detetive dos Dados', icon: 'search', color: '#06b6d4', desc: 'Investigou como uma IA aprende padrões e estereótipos com os dados.' },
    guardiao: { name: 'Guardião(ã) da Diversidade', icon: 'shield', color: '#8b5cf6', desc: 'Reconstruiu bases de dados mais representativas, com qualidade e contexto.' },
    investigador: { name: 'Investigador(a) de Algoritmos', icon: 'eye', color: '#e11d48', desc: 'Encontrou evidências de racismo algorítmico em sistemas fictícios.' },
    desenvolvedor: { name: 'Desenvolvedor(a) Consciente', icon: 'wrench', color: '#10b981', desc: 'Corrigiu dados e critérios e mediu os resultados antes e depois.' },
    auditor: { name: 'Auditor(a) de Qualidade', icon: 'chart', color: '#f59e0b', desc: 'Testou a IA por grupos e decidiu com responsabilidade.' },
    etica: { name: 'Especialista em Ética Digital', icon: 'scale', color: '#eab308', desc: 'Liderou uma investigação completa e propôs uma solução justa.' }
  };

  /* -------------------- Conquistas especiais -------------------- */
  const achievements = [
    { id: 'recruta', name: 'Recruta da NEXUS', icon: 'user', desc: 'Criou seu personagem e aceitou a missão.' },
    { id: 'errar', name: 'Errar faz parte', icon: 'refresh', desc: 'Corrigiu um erro e acertou na nova tentativa.' },
    { id: 'persistencia', name: 'Persistência', icon: 'bolt', desc: 'Corrigiu 10 erros ao longo do jogo. Especialistas também revisam suas ideias!' },
    { id: 'impecavel', name: 'Missão impecável', icon: 'star', desc: 'Concluiu uma missão inteira sem nenhum erro.' },
    { id: 'autonomia', name: 'Pensamento independente', icon: 'bulb', desc: 'Concluiu uma missão sem pedir dicas.' },
    { id: 'explorador', name: 'Explorador(a) de evidências', icon: 'folder', desc: 'Abriu todos os arquivos de uma investigação.' },
    { id: 'argumento', name: 'Argumentação de especialista', icon: 'book', desc: 'Escreveu uma solução final que atendeu a todos os critérios de avaliação.' },
    { id: 'inspiracao', name: 'Galeria completa', icon: 'sparkles', desc: 'Desbloqueou todos os cartões do Arquivo de Inspirações.' },
    { id: 'metade', name: 'Metade do caminho', icon: 'map', desc: 'Concluiu 3 missões.' },
    { id: 'formatura', name: 'IA Responsável', icon: 'grad', desc: 'Concluiu todas as missões e se formou na NEXUS LAB.' }
  ];

  /* -------------------- Arquivo de Inspirações (pessoas reais) -------------------- */
  const inspirations = [
    { id: 'katherine', name: 'Katherine Johnson', field: 'Matemática · NASA', icon: 'rocket', country: 'Estados Unidos',
      text: 'Matemática da NASA (1918–2020). Seus cálculos de trajetória foram essenciais para o voo orbital de John Glenn, em 1962, e para a missão Apollo 11. Sua história é contada no filme “Estrelas Além do Tempo”.' },
    { id: 'sonia', name: 'Sônia Guimarães', field: 'Física · ITA', icon: 'bolt', country: 'Brasil',
      text: 'Primeira mulher negra brasileira a obter doutorado em Física (Universidade de Manchester, 1989). É professora do ITA, o Instituto Tecnológico de Aeronáutica, e defende mais diversidade na ciência.' },
    { id: 'gladys', name: 'Gladys West', field: 'Matemática · GPS', icon: 'globe', country: 'Estados Unidos',
      text: 'Matemática que trabalhou para a Marinha dos EUA criando modelos muito precisos do formato da Terra. Esse trabalho foi fundamental para o desenvolvimento do GPS que usamos nos celulares.' },
    { id: 'enedina', name: 'Enedina Alves Marques', field: 'Engenharia', icon: 'wrench', country: 'Brasil',
      text: 'Primeira mulher a se formar em Engenharia no Paraná (1945) e reconhecida como a primeira engenheira negra do Brasil. Trabalhou no plano hidrelétrico do Paraná, incluindo a Usina Capivari-Cachoeira.' },
    { id: 'joy', name: 'Joy Buolamwini', field: 'Ciência da Computação · Justiça algorítmica', icon: 'eye', country: 'Gana / EUA',
      text: 'Pesquisadora que percebeu que um sistema de reconhecimento facial não detectava seu rosto — até ela colocar uma máscara branca. Sua pesquisa “Gender Shades” mostrou que sistemas comerciais erravam muito mais com mulheres de pele escura. Fundou a Algorithmic Justice League.' },
    { id: 'nina', name: 'Nina da Hora', field: 'Ciência da Computação · Ética em IA', icon: 'cpu', country: 'Brasil',
      text: 'Cientista da computação brasileira, pesquisadora e divulgadora científica. Fala sobre ética em inteligência artificial, segurança digital e tecnologias antirracistas, e se apresenta como “hacker antirracista”.' },
    { id: 'mark', name: 'Mark Dean', field: 'Engenharia da Computação · IBM', icon: 'cpu', country: 'Estados Unidos',
      text: 'Engenheiro da IBM que ajudou a criar o computador pessoal IBM PC, lançado em 1981, e é coinventor de várias de suas patentes. Também liderou a equipe que criou o primeiro chip de computador de 1 gigahertz.' },
    { id: 'timnit', name: 'Timnit Gebru', field: 'Ética em IA', icon: 'scale', country: 'Etiópia / EUA',
      text: 'Cientista da computação que estuda os riscos e os vieses da inteligência artificial. Foi coautora da pesquisa “Gender Shades”, cofundou a organização Black in AI e fundou o instituto de pesquisa DAIR.' },
    { id: 'jerry', name: 'Jerry Lawson', field: 'Engenharia · Videogames', icon: 'game', country: 'Estados Unidos',
      text: 'Engenheiro (1940–2011) que liderou a criação do Fairchild Channel F, lançado em 1976: o primeiro videogame com cartuchos de jogos intercambiáveis. Graças a essa ideia, um só console passou a rodar muitos jogos diferentes.' },
    { id: 'tarcizio', name: 'Tarcízio Silva', field: 'Pesquisa · Racismo algorítmico', icon: 'book', country: 'Brasil',
      text: 'Pesquisador brasileiro, autor do livro “Racismo Algorítmico: inteligência artificial e discriminação nas redes digitais” (2022), uma das principais referências sobre o tema no país.' },
    { id: 'alan', name: 'Alan Emtage', field: 'Ciência da Computação · Internet', icon: 'search', country: 'Barbados',
      text: 'Cientista da computação que criou o Archie, em 1990, considerado o primeiro mecanismo de busca da internet — um antepassado dos buscadores que usamos hoje.' },
    { id: 'lonnie', name: 'Lonnie Johnson', field: 'Engenharia · NASA', icon: 'rocket', country: 'Estados Unidos',
      text: 'Engenheiro que trabalhou em projetos da NASA, como a missão Galileo, que estudou Júpiter. Também é inventor do famoso lançador de água Super Soaker e de tecnologias de energia.' }
  ];

  /* =====================================================================
     MISSÕES
     Tipos de etapa (mecânicas): generate, choice, multi, sort, hypothesis,
     builder, compare, expand, evidence, sequence, highlight, pairs, datafix,
     rules, chart, number, conveyor, decision, twins, write
     ===================================================================== */

  const SIM = 'Situação simulada: pessoas, empresas e números são fictícios.';

  const missions = [
    /* ============================ MISSÃO 1 ============================ */
    {
      id: 'm1', num: 1, title: 'A IA aprendeu errado?', short: 'Investigação inicial', color: '#06b6d4', icon: 'search', medal: 'detetive',
      inspirations: ['katherine', 'sonia'], place: 'Sala de Monitoramento',
      story: [
        { who: 'lia', text: 'Bem-vindo(a) à NEXUS LAB, {nome}! Eu sou a Dra. Lia Moraes, coordenadora de Ética em IA. Chegaram centenas de reclamações sobre o gerador de imagens da NEXUS AI.' },
        { who: 'teo', text: 'Eu sou o Téo, engenheiro de dados. Quando alguém pede imagens de profissões, os resultados parecem… sempre iguais. Mesmo rosto, mesma idade, mesmo tipo de pessoa.' },
        { who: 'nexus', text: 'SISTEMA NEXUS AI ONLINE. Eu apenas repito os padrões que aprendi. Padrões são… verdades?' },
        { who: 'lia', text: 'Antes de corrigir qualquer coisa, precisamos investigar. Uma boa especialista observa, compara e levanta hipóteses. Vamos começar.' }
      ],
      objective: 'Descobrir se a NEXUS AI está reproduzindo estereótipos e entender por que isso acontece.',
      context: 'Uma IA generativa aprende observando milhões de exemplos, como imagens e textos. Ela não “pensa” sobre o mundo: identifica padrões nos dados e os repete. Se os exemplos mostram quase sempre o mesmo tipo de pessoa em uma profissão, a IA tende a repetir esse padrão — e pode transformar uma desigualdade do passado em “regra” para o futuro.',
      conclusion: [
        'Uma IA aprende padrões a partir dos dados de treinamento — inclusive padrões injustos.',
        'Estereótipo é uma ideia simplificada e generalizada sobre um grupo de pessoas. Quando uma IA repete estereótipos, ela os espalha em grande escala.',
        'Os vieses podem vir de dados pouco representativos, de escolhas no desenvolvimento e de desigualdades históricas.',
        'Qualquer pessoa pode exercer qualquer profissão, independentemente de raça, gênero, idade, deficiência ou origem social.'
      ],
      challenges: [
        {
          id: 'm1c1', title: 'O cientista ideal', mech: 'Gerar · escanear · identificar padrões', icon: 'flask', xp: 100,
          intro: [{ who: 'teo', text: 'Vamos reproduzir o problema. Envie um comando ao gerador de imagens da NEXUS AI e analise o que ele produz.' }],
          learn: 'A NEXUS AI repetiu um único “modelo” de cientista porque foi isso que ela mais viu nos dados. Mas cientistas existem em todos os gêneros, idades, cores e origens. Quando a IA mostra só um perfil, ela reforça a ideia falsa de que a ciência “pertence” a um grupo.',
          steps: [
            {
              type: 'generate', title: 'Gere e investigue as imagens',
              text: 'Envie o comando para a NEXUS AI. Depois, toque nas imagens para escanear os dados de cada uma (escaneie pelo menos 6).',
              prompt: 'Imagine um cientista trabalhando em seu laboratório.',
              scanRequired: 6,
              results: [
                's2 m o short labcoat glasses beard', 's1 m o bald labcoat glasses', 's3 m a short labcoat c1', 's2 m o short white labcoat mustache',
                's1 m a short brown labcoat glasses', 's2 m o bald labcoat beard gray', 's3 m o short labcoat glasses c3', 's1 m a short blond labcoat',
                's2 f a bun brown labcoat glasses', 's5 m o short labcoat beard', 's2 m y short brown labcoat glasses', 's1 m o short white labcoat glasses'
              ],
              patterns: {
                q: 'Use o Painel de Padrões. Marque TODOS os padrões que a análise confirma:',
                options: [
                  { t: 'Quase todos os resultados mostram homens.', ok: true },
                  { t: 'A maioria aparenta ter mais de 50 anos.', ok: true },
                  { t: 'Os tons de pele são pouco variados: quase todos são claros.', ok: true },
                  { t: 'Nenhum resultado mostra uma pessoa com deficiência.', ok: true },
                  { t: 'Os resultados mostram grande diversidade de pessoas.', ok: false, why: 'Confira o painel: gênero, idade e tom de pele se concentram em poucos valores. Isso é o contrário de diversidade.' },
                  { t: 'As imagens mostram que só homens mais velhos sabem fazer ciência.', ok: false, why: 'Cuidado! As imagens mostram o que a IA aprendeu a repetir, não a realidade. Não existe relação entre gênero, idade ou cor da pele e capacidade científica.' }
                ]
              },
              hints: ['O painel mostra contagens de gênero, faixa de idade, tom de pele e deficiência. Compare cada barra.', 'Existem 4 padrões verdadeiros. As outras frases são conclusões erradas.'],
              success: 'Isso! O scanner revelou um padrão muito repetido: o gerador entrega quase sempre homens, mais velhos e de pele clara.'
            },
            {
              type: 'choice', title: 'Por que isso acontece?',
              q: 'Por que determinados perfis aparecem com maior frequência nos resultados?',
              options: [
                { t: 'Porque a IA repete os padrões mais comuns nas imagens usadas para treiná-la.', ok: true, why: 'Exato. Se a maior parte das imagens de “cientista” no treinamento mostra um único perfil, a IA aprende que esse é o “padrão”.' },
                { t: 'Porque homens mais velhos são naturalmente melhores cientistas.', ok: false, why: 'Isso é um estereótipo, não um fato. Capacidade científica não depende de gênero, idade ou cor da pele.' },
                { t: 'Porque a IA tem opinião própria e decidiu escolher esse perfil.', ok: false, why: 'A IA não tem intenções nem opiniões. Ela reproduz padrões dos dados e das escolhas de quem a desenvolveu.' }
              ],
              hints: ['Pense em como uma IA aprende: com exemplos.']
            },
            {
              type: 'choice', title: 'IA × sociedade',
              q: 'A representação apresentada pela NEXUS AI corresponde à diversidade existente na sociedade?',
              options: [
                { t: 'Não. Pessoas de todos os gêneros, idades, cores e origens fazem ciência — a IA mostra um recorte distorcido.', ok: true, why: 'Isso mesmo. Katherine Johnson, Sônia Guimarães e muitas outras pessoas mostram que a ciência é feita por gente diversa.' },
                { t: 'Sim, porque os cientistas famosos dos livros antigos são assim.', ok: false, why: 'Os registros do passado nem sempre mostraram todas as pessoas que fizeram ciência. Muitas mulheres e pessoas negras foram apagadas da história — Katherine Johnson, essencial para a NASA, só ficou amplamente conhecida décadas depois.' },
                { t: 'Não importa: são só imagens, não fazem diferença.', ok: false, why: 'Imagens influenciam como as pessoas se enxergam. Se uma menina negra nunca vê cientistas parecidas com ela, pode achar que esse lugar não é para ela.' }
              ],
              bonus: 20
            }
          ]
        },
        {
          id: 'm1c2', title: 'Identifique o estereótipo', mech: 'Classificar cartões', icon: 'tag', xp: 100,
          intro: [{ who: 'lia', text: 'Recebemos vários resultados da NEXUS AI. Arraste cada cartão para a área certa: ele reforça um estereótipo ou mostra uma representação diversa?' }],
          learn: 'Estereótipos associam profissões a um gênero, a uma cor/raça ou a uma idade. Eles não descrevem a realidade: limitam sonhos e oportunidades. Qualquer pessoa pode exercer qualquer profissão, independentemente de raça, gênero, idade, deficiência ou origem social.',
          steps: [
            {
              type: 'sort', title: 'Classifique os resultados da IA',
              text: 'Arraste (ou toque no cartão e depois na área) cada resultado para a categoria certa.',
              bins: [
                { id: 'est', label: 'Reforça estereótipo', icon: 'alert', cls: 'bad' },
                { id: 'div', label: 'Representação diversa', icon: 'check', cls: 'good' }
              ],
              cards: [
                { id: 'a', bin: 'est', req: 'engenheiro de foguetes', res: 'Todas as imagens geradas mostram homens.', people: ['s2 m a short vest', 's3 m a buzz vest', 's1 m o short vest beard'], why: 'Associa engenharia apenas a homens. Mulheres projetam foguetes, satélites, pontes e muito mais.' },
                { id: 'b', bin: 'est', req: 'pessoa que trabalha com limpeza', res: 'A IA gera quase só pessoas negras.', people: null, icon: 'alert', why: 'Associar pessoas negras a determinadas funções é um estereótipo racial. Ele nasce de desigualdades históricas de oportunidade — nunca de capacidade.' },
                { id: 'c', bin: 'div', req: 'médica', res: 'Mulheres de várias idades e tons de pele, inclusive uma médica cadeirante.', people: ['s9 f a afro labcoat', 's3 f o bun labcoat glasses', 's6 f a long labcoat wheelchair'], why: 'Mostra a variedade real de pessoas que exercem a medicina.' },
                { id: 'd', bin: 'est', req: 'enfermeiro', res: 'A IA troca para “enfermeira” e gera só mulheres.', people: ['s3 f a ponytail scrubs', 's2 f y long scrubs', 's4 f a bun scrubs'], why: 'Reforça a ideia de que o cuidado é “coisa de mulher”. Homens também são enfermeiros — e a IA nem respeitou o pedido.' },
                { id: 'e', bin: 'est', req: 'pessoa CEO de empresa', res: 'Só homens brancos de terno.', people: ['s1 m a short suit', 's2 m o short suit', 's2 m a short suit glasses'], why: 'Liderança não tem gênero nem cor. Esse resultado reforça quem “parece” chefe e invisibiliza muitas lideranças.' },
                { id: 'f', bin: 'div', req: 'programadora', res: 'Pessoas jovens e idosas, de vários tons de pele, uma delas usando hijab.', people: ['s4 f y hijab hoodie c1', 's8 f o short white hoodie c0 glasses', 's6 f y curly headset hoodie c2'], why: 'A programação é feita por pessoas muito diferentes entre si — e é bom que seja.' },
                { id: 'g', bin: 'est', req: 'suspeito de crime', res: 'A IA gera principalmente rostos de homens negros.', people: null, icon: 'eye', why: 'Esse é um dos estereótipos raciais mais graves: associar pessoas negras ao crime. Em sistemas de segurança, isso pode levar a abordagens e prisões injustas.' },
                { id: 'h', bin: 'div', req: 'astronauta', res: 'Uma tripulação com pessoas de diferentes gêneros, idades e tons de pele.', people: ['s9 m a bald astronaut', 's2 f a bob astronaut', 's6 f o bun astronaut'], why: 'Representa a diversidade de pessoas que podem explorar o espaço.' },
                { id: 'i', bin: 'est', req: 'gênio da matemática', res: 'Apenas meninos de óculos.', people: ['s2 m y short tshirt glasses c0', 's3 m y short tshirt glasses c5', 's1 m y short tshirt glasses c3'], why: 'Meninas também são ótimas em matemática — Katherine Johnson e Gladys West mudaram a história da exploração espacial e do GPS.' }
              ],
              hints: ['Pergunte-se: o resultado mostra só UM tipo de pessoa para aquela profissão?', 'São 6 estereótipos e 3 representações diversas.'],
              success: 'Classificação correta! Você identificou os estereótipos que a NEXUS AI estava repetindo.'
            },
            {
              type: 'choice', title: 'Justifique',
              q: 'Por que o cartão “suspeito de crime” é especialmente perigoso quando aparece em uma IA?',
              options: [
                { t: 'Porque, usado em sistemas de segurança, pode fazer pessoas negras serem tratadas como suspeitas injustamente, em grande escala.', ok: true, why: 'Exato. Um estereótipo em uma IA se repete milhares de vezes por dia e pode causar danos reais, como abordagens e prisões injustas.' },
                { t: 'Porque a imagem fica feia.', ok: false, why: 'O problema não é estético: é a discriminação que essa associação produz na vida das pessoas.' },
                { t: 'Não é perigoso, porque a IA só repete o que viu.', ok: false, why: 'Justamente por repetir o que viu, a IA pode multiplicar uma injustiça. “Só repetir” não torna o resultado justo.' }
              ],
              bonus: 20
            }
          ]
        },
        {
          id: 'm1c3', title: 'O que está acontecendo?', mech: 'Hipóteses + evidências', icon: 'bulb', xp: 100,
          intro: [{ who: 'lia', text: 'Hora de pensar como cientista. Temos evidências na mesa. Escolha as hipóteses que explicam o problema e conecte cada uma à evidência que a sustenta.' }],
          learn: 'Vieses em IA quase nunca têm uma única causa. Dados pouco representativos, escolhas inadequadas da equipe e desigualdades históricas se combinam. Por isso, investigar com evidências é essencial.',
          steps: [
            {
              type: 'hypothesis', title: 'Quadro de hipóteses',
              text: 'Fase 1: selecione as hipóteses mais adequadas. Fase 2: conecte cada hipótese escolhida à evidência que a comprova.',
              evidence: [
                { id: 'e1', icon: 'db', title: 'Relatório da base de dados', text: '78% das imagens de “cientista” usadas no treino vieram de arquivos antigos, de 1950 a 1990.' },
                { id: 'e2', icon: 'file', title: 'Ata de reunião da equipe', text: '“Não vamos perder tempo conferindo a variedade das imagens. O prazo de lançamento é curto.”' },
                { id: 'e3', icon: 'book', title: 'Pesquisa histórica', text: 'Durante décadas, mulheres e pessoas negras tiveram menos acesso às universidades e foram menos fotografadas em laboratórios.' }
              ],
              hypotheses: [
                { id: 'h1', t: 'Dados de treinamento pouco representativos.', ok: true, ev: 'e1', why: 'Se a base tem quase só um perfil de pessoa, a IA aprende que esse perfil é o “normal”.' },
                { id: 'h2', t: 'Escolhas inadequadas no desenvolvimento.', ok: true, ev: 'e2', why: 'A equipe decidiu não verificar a diversidade dos dados. Escolhas humanas também criam vieses.' },
                { id: 'h3', t: 'Reprodução de padrões históricos de desigualdade.', ok: true, ev: 'e3', why: 'As imagens antigas registram uma época de menos oportunidades para alguns grupos. A IA confunde essa desigualdade com uma “regra”.' },
                { id: 'h4', t: 'A IA tem opiniões próprias e decidiu excluir grupos.', ok: false, why: 'Uma IA não tem vontade nem opinião. Os resultados vêm dos dados e das decisões humanas.' },
                { id: 'h5', t: 'Alguns grupos têm menos talento para a ciência.', ok: false, why: 'Isso é falso e preconceituoso. As diferenças de presença na ciência vêm de desigualdade de oportunidades, não de talento.' },
                { id: 'h6', t: 'Foi um defeito na tela do computador.', ok: false, why: 'O problema não está no equipamento: está no que a IA aprendeu.' }
              ],
              hints: ['As hipóteses corretas podem ser comprovadas pelas evidências da mesa.', 'Há 3 hipóteses corretas — uma para cada evidência.'],
              bonus: 20
            }
          ]
        }
      ]
    },

    /* ============================ MISSÃO 2 ============================ */
    {
      id: 'm2', num: 2, title: 'Organizando os dados', short: 'Representatividade', color: '#8b5cf6', icon: 'db', medal: 'guardiao',
      inspirations: ['gladys', 'enedina'], place: 'Arquivo de Dados',
      story: [
        { who: 'teo', text: 'Rastreei a origem do problema, {nome}: a NEXUS AI foi treinada com uma base de dados pequena e muito parecida.' },
        { who: 'lia', text: 'Agora você vai reconstruir essa base. Mas atenção: uma boa base não é só uma questão de “quantidade de cada grupo”.' },
        { who: 'lia', text: 'Qualidade das imagens, rótulos corretos e contexto respeitoso também importam. Dados ruins ensinam coisas ruins.' }
      ],
      objective: 'Montar e comparar bases de dados, buscando representatividade, qualidade e contexto.',
      context: 'Base de dados (ou dataset) é o conjunto de exemplos usado para treinar uma IA. Uma base representativa inclui a variedade de pessoas e situações com que o sistema vai lidar no mundo real. Ela também precisa de exemplos com boa qualidade, rótulos corretos (a etiqueta que diz o que é cada exemplo) e contextos que não reforcem estereótipos. Nesta missão, os dados de cor/raça seguem as categorias do IBGE e são autodeclarados pelas pessoas fictícias.',
      conclusion: [
        'Uma base de dados representativa inclui a diversidade de pessoas com quem a IA vai lidar.',
        'Diversidade não é só uma conta: rótulos errados, imagens de má qualidade e contextos estereotipados também distorcem o aprendizado.',
        'A cor/raça de uma pessoa deve ser autodeclarada — não “adivinhada” por uma foto.',
        'Uma base melhor ajuda muito, mas sozinha não elimina todos os vieses: critérios, testes e acompanhamento também são necessários.'
      ],
      challenges: [
        {
          id: 'm2c1', title: 'Organize a base de dados', mech: 'Arrastar e soltar', icon: 'db', xp: 120,
          intro: [{ who: 'teo', text: 'Temos 20 exemplos disponíveis e espaço para 10 na nova base “Profissões”. Arraste os cartões para os espaços da base. Os medidores mostram se ela está diversa — e fique de olho na qualidade de cada exemplo!' }],
          learn: 'Você montou uma base com variedade de gênero, cor/raça, idade, região, profissão e pessoas com deficiência — e evitou exemplos com problemas de qualidade. Isso dá à IA uma visão muito mais completa do mundo.',
          steps: [
            {
              type: 'builder', title: 'Base de treino “Profissões”',
              text: 'Arraste 10 cartões para a base. Todos os medidores precisam ficar verdes. Leia a linha de qualidade de cada cartão!',
              slots: 10,
              pool: [
                { id: 'p1', name: 'Rafael M.', prof: 'Engenheiro', area: 'Engenharia', spec: 's3 m a short vest', genero: 'Homem', raca: 'Branca', idade: '30-59', regiao: 'Sudeste', def: false },
                { id: 'p2', name: 'Gustavo L.', prof: 'Médico', area: 'Medicina', spec: 's2 m a short labcoat glasses', genero: 'Homem', raca: 'Branca', idade: '30-59', regiao: 'Sudeste', def: false },
                { id: 'p3', name: 'Henrique P.', prof: 'Cientista', area: 'Ciência', spec: 's1 m o short labcoat beard', genero: 'Homem', raca: 'Branca', idade: '60+', regiao: 'Sul', def: false },
                { id: 'p4', name: 'Felipe A.', prof: 'Programador', area: 'Programação', spec: 's2 m a buzz hoodie c0', genero: 'Homem', raca: 'Branca', idade: '30-59', regiao: 'Sudeste', def: false },
                { id: 'p5', name: 'Marcos T.', prof: 'Piloto', area: 'Aviação', spec: 's2 m a short pilot', genero: 'Homem', raca: 'Branca', idade: '30-59', regiao: 'Sul', def: false },
                { id: 'p6', name: 'Aline S.', prof: 'Engenheira', area: 'Engenharia', spec: 's9 f a braids vest', genero: 'Mulher', raca: 'Preta', idade: '30-59', regiao: 'Nordeste', def: false },
                { id: 'p7', name: 'Jurema T.', prof: 'Professora', area: 'Educação', spec: 's6 f a long cardigan c1', genero: 'Mulher', raca: 'Indígena', idade: '30-59', regiao: 'Norte', def: false },
                { id: 'p8', name: 'Hiroshi N.', prof: 'Cientista', area: 'Ciência', spec: 's2 m o short labcoat glasses', genero: 'Homem', raca: 'Amarela', idade: '60+', regiao: 'Sudeste', def: false },
                { id: 'p9', name: 'Beatriz C.', prof: 'Programadora', area: 'Programação', spec: 's6 f y curly hoodie c1 headset', genero: 'Mulher', raca: 'Parda', idade: '18-29', regiao: 'Centro-Oeste', def: false },
                { id: 'p10', name: 'Samuel O.', prof: 'Médico', area: 'Medicina', spec: 's10 m a buzz labcoat wheelchair', genero: 'Homem', raca: 'Preta', idade: '30-59', regiao: 'Nordeste', def: 'Cadeirante' },
                { id: 'p11', name: 'Lúcia R.', prof: 'Chef de cozinha', area: 'Gastronomia', spec: 's5 f o bun chef', genero: 'Mulher', raca: 'Parda', idade: '60+', regiao: 'Norte', def: false },
                { id: 'p12', name: 'Kauã P.', prof: 'Astronauta', area: 'Astronáutica', spec: 's5 m y short astronaut', genero: 'Homem', raca: 'Indígena', idade: '18-29', regiao: 'Centro-Oeste', def: false },
                { id: 'p13', name: 'Fátima H.', prof: 'Advogada', area: 'Direito', spec: 's3 f a hijab suit c1', genero: 'Mulher', raca: 'Branca', idade: '30-59', regiao: 'Sul', def: false },
                { id: 'p14', name: 'Dandara M.', prof: 'Pilota de avião', area: 'Aviação', spec: 's8 f y afro pilot', genero: 'Mulher', raca: 'Preta', idade: '18-29', regiao: 'Sudeste', def: false },
                { id: 'p15', name: 'Ana Paula G.', prof: 'Enfermeira', area: 'Enfermagem', spec: 's6 f a ponytail scrubs hearing', genero: 'Mulher', raca: 'Parda', idade: '30-59', regiao: 'Nordeste', def: 'Auditiva' },
                { id: 'p16', name: 'Tiago B.', prof: 'Engenheiro', area: 'Engenharia', spec: 's3 m a short vest', genero: 'Homem', raca: 'Branca', idade: '30-59', regiao: 'Sudeste', def: false, issue: 'Duplicata: é a mesma foto do exemplo de Rafael M.' },
                { id: 'p17', name: 'Joana D.', prof: 'Cientista', area: 'Ciência', spec: 's9 f a locs labcoat', genero: 'Mulher', raca: 'Preta', idade: '30-59', regiao: 'Sudeste', def: false, issue: 'Imagem desfocada e muito escura.', blur: true },
                { id: 'p18', name: 'Carla F.', prof: 'Recepcionista', area: 'Engenharia', spec: 's7 f a bob vest', genero: 'Mulher', raca: 'Parda', idade: '30-59', regiao: 'Sul', def: false, issue: 'Rótulo errado: a foto mostra uma engenheira em obra.' },
                { id: 'p19', name: 'Pedro H.', prof: 'Professor', area: 'Educação', spec: 's3 m a short cardigan c7', genero: 'Homem', raca: 'Branca', idade: '30-59', regiao: 'Sudeste', def: false },
                { id: 'p20', name: 'Sam R.', prof: 'Designer', area: 'Design', spec: 's3 n y bob tshirt c6', genero: 'Não binária', raca: 'Branca', idade: '18-29', regiao: 'Sul', def: false }
              ],
              criteria: [
                { dim: 'genero', label: 'Gênero', maxShare: 0.6, minCats: 2, help: 'Nenhum gênero com mais de 60%.' },
                { dim: 'raca', label: 'Cor/raça (autodeclarada)', maxShare: 0.5, minCats: 4, help: 'Pelo menos 4 categorias e nenhuma com mais de 50%.' },
                { dim: 'idade', label: 'Faixa etária', minCats: 3, help: 'As 3 faixas: 18-29, 30-59 e 60+.' },
                { dim: 'regiao', label: 'Região do Brasil', minCats: 4, help: 'Pelo menos 4 regiões.' },
                { dim: 'area', label: 'Profissões', minCats: 6, help: 'Pelo menos 6 áreas diferentes.' },
                { dim: 'def', label: 'Pessoas com deficiência', minTrue: 1, help: 'Pelo menos 1 pessoa com deficiência.' }
              ],
              hints: ['Os medidores mostram exatamente o que falta. Troque cartões que repetem o mesmo perfil.', 'Três cartões têm problemas de qualidade: leia a linha “Qualidade” de cada um.']
            },
            {
              type: 'choice', title: 'Reflita',
              q: 'Sua base agora é diversa. Isso garante que a IA nunca mais terá vieses?',
              options: [
                { t: 'Não. A diversidade ajuda muito, mas também é preciso conferir rótulos, qualidade, critérios do algoritmo e testar os resultados.', ok: true, why: 'Perfeito. Diversidade é um passo importante, não uma solução mágica.' },
                { t: 'Sim. Com 10 exemplos diversos, o problema está resolvido para sempre.', ok: false, why: 'Uma base diversa é um ótimo começo, mas vieses também podem vir dos critérios, do uso e de mudanças com o tempo.' },
                { t: 'Não, porque diversidade não faz diferença nenhuma.', ok: false, why: 'Faz muita diferença! Só não é suficiente sozinha.' }
              ],
              bonus: 20
            }
          ]
        },
        {
          id: 'm2c2', title: 'Encontre a base problemática', mech: 'Comparar conjuntos de dados', icon: 'chart', xp: 120,
          intro: [{ who: 'lia', text: 'Três fornecedores ofereceram bases de dados para a NEXUS. Analise a composição e a ficha técnica de cada uma antes de decidir. Números bonitos podem esconder problemas!' }],
          learn: 'A base BETA parecia diversa nos números, mas tinha rótulos estereotipados, imagens de pior qualidade para alguns grupos e contextos que reforçam preconceitos. Representatividade envolve quantidade, mas também qualidade, contexto e respeito.',
          steps: [
            {
              type: 'compare', title: 'Análise das bases',
              text: 'Leia cada base e arraste (ou toque) a etiqueta certa para cada uma.',
              labels: [
                { id: 'low', t: 'Baixa diversidade' },
                { id: 'mid', t: 'Diversa nos números, mas com problemas' },
                { id: 'best', t: 'Mais representativa' }
              ],
              bases: [
                {
                  id: 'alfa', name: 'Base ALFA', answer: 'low', samples: ['s2 m a short suit', 's1 m o short labcoat', 's2 m a short vest', 's3 m o bald suit', 's2 f a bob labcoat', 's1 m a short pilot'],
                  comp: [['Gênero', [['Homens', 85], ['Mulheres', 15]]], ['Cor/raça', [['Branca', 88], ['Parda', 7], ['Preta', 3], ['Outras', 2]]], ['Idade', [['40+', 80], ['18-39', 20]]]],
                  ficha: ['Fonte: bancos de imagens antigos', 'Rótulos: revisados e corretos', 'Qualidade das imagens: alta e uniforme', 'Contextos: escritórios e laboratórios']
                },
                {
                  id: 'beta', name: 'Base BETA', answer: 'mid', samples: ['s9 f a afro apron c4', 's2 m a short suit', 's6 f a long tshirt c1', 's3 f a bob suit', 's8 m a buzz jacket', 's5 m y short tshirt c5'],
                  comp: [['Gênero', [['Mulheres', 50], ['Homens', 50]]], ['Cor/raça', [['Parda', 44], ['Branca', 42], ['Preta', 11], ['Outras', 3]]], ['Idade', [['40+', 50], ['18-39', 50]]]],
                  ficha: ['Fonte: fotos coletadas da internet sem autorização', '⚠ Rótulos: engenheiras negras rotuladas como “auxiliar”; mulheres rotuladas como “assistente”', '⚠ Qualidade: 40% das fotos de pessoas negras estão escuras ou desfocadas', '⚠ Contextos: pessoas indígenas aparecem só em trajes tradicionais, nunca em profissões']
                },
                {
                  id: 'gama', name: 'Base GAMA', answer: 'best', samples: ['s8 f a braids vest', 's3 m o short labcoat', 's5 f y hijab hoodie c1', 's10 m a bald suit', 's6 f o bun labcoat glasses', 's4 m y curly scrubs'],
                  comp: [['Gênero', [['Mulheres', 51], ['Homens', 48], ['Não binárias', 1]]], ['Cor/raça', [['Parda', 44], ['Branca', 42], ['Preta', 11], ['Outras', 3]]], ['Idade', [['40+', 48], ['18-39', 52]]]],
                  ficha: ['Fonte: fotos com consentimento das pessoas', 'Rótulos: revisados por uma equipe diversa', 'Qualidade: igual para todos os grupos', 'Contextos: profissões variadas para todos os grupos', 'Cor/raça: autodeclarada pelas pessoas']
                }
              ],
              hints: ['Não olhe só os gráficos: a ficha técnica de cada base esconde informações importantes.', 'Duas bases têm números parecidos. O que diferencia uma da outra está na ficha técnica.'],
              success: 'Boa análise! A GAMA é a mais representativa — e você percebeu que a BETA só parecia boa.'
            },
            {
              type: 'multi', title: 'Justifique',
              q: 'Quais problemas a base BETA ainda tem, mesmo com números equilibrados? Marque todos.',
              options: [
                { t: 'Rótulos estereotipados (engenheiras negras rotuladas como “auxiliar”).', ok: true },
                { t: 'Qualidade de imagem pior para pessoas negras.', ok: true },
                { t: 'Contexto estereotipado: pessoas indígenas só em trajes tradicionais.', ok: true },
                { t: 'Fotos coletadas sem autorização das pessoas.', ok: true },
                { t: 'Tem pessoas negras demais.', ok: false, why: 'Não existe “pessoas negras demais”. A proporção da BETA é parecida com a da GAMA. O problema está em COMO essas pessoas são representadas.' },
                { t: 'Tem o mesmo número de homens e mulheres.', ok: false, why: 'Equilíbrio de gênero não é um problema. Os problemas da BETA estão nos rótulos, na qualidade, no contexto e na falta de autorização.' }
              ],
              bonus: 20,
              success: 'Exato: diversidade não é só uma quantidade matemática. Contexto, qualidade, rótulos e respeito às pessoas também contam.'
            }
          ]
        },
        {
          id: 'm2c3', title: 'Reconstruindo os exemplos', mech: 'Ampliar com orçamento + antes/depois', icon: 'plus', xp: 120,
          intro: [{ who: 'teo', text: 'A base atual da NEXUS tem só 12 exemplos e é bem desequilibrada. Você pode acrescentar ATÉ 6 novos exemplos do catálogo. Escolha bem: o orçamento é limitado!' }],
          learn: 'Compare os gráficos: a base revisada é muito mais representativa. Mas atenção — diversidade nos dados melhora a IA, mas não elimina sozinha todos os vieses. Ainda será preciso revisar os critérios e testar o sistema.',
          steps: [
            {
              type: 'expand', title: 'Amplie a base com até 6 exemplos',
              text: 'Toque nos cartões do catálogo para acrescentá-los. Os gráficos “Depois” se atualizam na hora. Cumpra todas as metas.',
              budget: 6,
              base: [
                { genero: 'Homem', raca: 'Branca', idade: '30-59', def: false, spec: 's2 m a short vest' },
                { genero: 'Homem', raca: 'Branca', idade: '30-59', def: false, spec: 's1 m a short labcoat' },
                { genero: 'Homem', raca: 'Branca', idade: '30-59', def: false, spec: 's3 m a short suit' },
                { genero: 'Homem', raca: 'Branca', idade: '30-59', def: false, spec: 's2 m a buzz hoodie c0' },
                { genero: 'Homem', raca: 'Branca', idade: '18-29', def: false, spec: 's2 m y short tshirt c3' },
                { genero: 'Homem', raca: 'Parda', idade: '30-59', def: false, spec: 's5 m a short labcoat beard' },
                { genero: 'Homem', raca: 'Branca', idade: '30-59', def: false, spec: 's1 m a short pilot' },
                { genero: 'Homem', raca: 'Amarela', idade: '30-59', def: false, spec: 's2 m a short vest glasses' },
                { genero: 'Mulher', raca: 'Branca', idade: '30-59', def: false, spec: 's2 f a bob cardigan' },
                { genero: 'Mulher', raca: 'Branca', idade: '30-59', def: false, spec: 's1 f a ponytail scrubs' },
                { genero: 'Mulher', raca: 'Parda', idade: '18-29', def: false, spec: 's5 f y long tshirt c6' },
                { genero: 'Mulher', raca: 'Preta', idade: '30-59', def: false, spec: 's9 f a afro labcoat' }
              ],
              candidates: [
                { id: 'c1', name: 'Engenheira', genero: 'Mulher', raca: 'Preta', idade: '30-59', def: false, spec: 's8 f a braids vest' },
                { id: 'c2', name: 'Cientista', genero: 'Mulher', raca: 'Parda', idade: '60+', def: false, spec: 's6 f o bun labcoat glasses' },
                { id: 'c3', name: 'Programadora', genero: 'Mulher', raca: 'Indígena', idade: '18-29', def: false, spec: 's5 f y long hoodie c2' },
                { id: 'c4', name: 'Enfermeiro', genero: 'Homem', raca: 'Preta', idade: '30-59', def: 'Cadeirante', spec: 's9 m a buzz scrubs wheelchair' },
                { id: 'c5', name: 'Pilota', genero: 'Mulher', raca: 'Parda', idade: '18-29', def: false, spec: 's7 f y curly pilot' },
                { id: 'c6', name: 'Médica', genero: 'Mulher', raca: 'Branca', idade: '30-59', def: false, spec: 's2 f a long labcoat' },
                { id: 'c7', name: 'Engenheiro', genero: 'Homem', raca: 'Branca', idade: '30-59', def: false, spec: 's1 m a short vest beard' },
                { id: 'c8', name: 'Auxiliar de limpeza', genero: 'Mulher', raca: 'Preta', idade: '30-59', def: false, spec: 's9 f a bun suit', issue: 'Rótulo errado: a foto mostra uma advogada no tribunal.' },
                { id: 'c9', name: 'Engenheiro', genero: 'Homem', raca: 'Branca', idade: '30-59', def: false, spec: 's2 m a short vest', issue: 'Duplicata de um exemplo que já está na base.' },
                { id: 'c10', name: 'Arquiteta', genero: 'Mulher', raca: 'Amarela', idade: '60+', def: 'Auditiva', spec: 's2 f o bob white jacket c1 hearing' },
                { id: 'c11', name: 'Professor', genero: 'Homem', raca: 'Branca', idade: '60+', def: false, spec: 's2 m o short cardigan c7 glasses' },
                { id: 'c12', name: 'Designer', genero: 'Mulher', raca: 'Parda', idade: '30-59', def: false, spec: 's6 f a ponytail tshirt c4', issue: 'Imagem desfocada.', blur: true }
              ],
              goals: [
                { dim: 'genero', label: 'Gênero: nenhum acima de 50%', maxShare: 0.5 },
                { dim: 'raca', label: 'Cor/raça: as 5 categorias do IBGE e nenhuma acima de 50%', maxShare: 0.5, minCats: 5 },
                { dim: 'idade', label: 'Idade: as 3 faixas etárias', minCats: 3 },
                { dim: 'def', label: 'Pelo menos 1 pessoa com deficiência', minTrue: 1 },
                { dim: 'issue', label: 'Nenhum exemplo com problema de qualidade', noIssue: true }
              ],
              hints: ['Cada meta mostra se está cumprida. Comece pela que está mais longe.', 'Há mais de uma combinação certa. Evite os 3 exemplos com problemas de qualidade.']
            }
          ]
        }
      ]
    },

    /* ============================ MISSÃO 3 ============================ */
    {
      id: 'm3', num: 3, title: 'Detetives do racismo algorítmico', short: 'Investigação', color: '#e11d48', icon: 'eye', medal: 'investigador',
      inspirations: ['joy', 'nina'], place: 'Central de Investigação',
      story: [
        { who: 'lia', text: 'Agora o assunto é ainda mais sério, {nome}. Quando um sistema trata pessoas de forma diferente por causa da cor da pele ou da raça, chamamos isso de racismo algorítmico.' },
        { who: 'teo', text: 'E ele raramente aparece escrito no código. Ele se esconde nos dados, nos critérios e na forma de usar o sistema.' },
        { who: 'lia', text: 'Recebemos três casos. Abra os arquivos, colete pistas e chegue a conclusões com base em evidências. É assim que se combate uma injustiça: com investigação séria.' }
      ],
      objective: 'Investigar casos simulados e identificar como sistemas tecnológicos podem reproduzir discriminação racial.',
      context: 'Racismo algorítmico é quando sistemas automatizados produzem resultados que prejudicam pessoas negras, indígenas ou de outros grupos racializados — mesmo que ninguém tenha escrito uma regra racista. Pode acontecer por dados desequilibrados, por critérios que funcionam como “atalhos” para a raça (como o bairro onde a pessoa mora ou a escola onde estudou) ou pelo uso do sistema sem testes adequados. Todos os casos desta missão são fictícios.',
      conclusion: [
        'Racismo algorítmico acontece quando sistemas automatizados prejudicam grupos raciais — mesmo sem nenhuma regra explícita.',
        'Critérios aparentemente neutros (bairro, escola, nome, “pausa na carreira”) podem funcionar como atalhos para raça, gênero e classe social.',
        'Para investigar, ouvimos as pessoas afetadas, separamos os resultados por grupo, analisamos os dados e os critérios.',
        'Pesquisadoras como Joy Buolamwini e Nina da Hora mostram que denunciar e corrigir esses problemas é trabalho de ciência e cidadania.'
      ],
      challenges: [
        {
          id: 'm3c1', title: 'O sistema de reconhecimento facial', mech: 'Investigação de pistas', icon: 'eye', xp: 140,
          intro: [{ who: 'lia', text: 'Caso 1: a empresa fictícia VISIOTECH instalou reconhecimento facial nas catracas de um condomínio. Os moradores reclamam. Abra TODOS os arquivos do dossiê e anote as pistas.' }],
          learn: 'O sistema errava muito mais com pessoas de pele mais escura, principalmente mulheres, porque foi treinado e testado com pouca diversidade. Investigar exige ouvir quem foi prejudicado, separar resultados por grupo e analisar dados e condições de teste. Atenção: nesta investigação, ninguém precisou “classificar” a raça de alguém por foto — usamos dados de testes e relatos.',
          dossier: true,
          steps: [
            {
              type: 'evidence', title: 'Dossiê do caso VISIOTECH',
              text: 'Abra cada arquivo. As pistas importantes vão para o seu caderno de investigação.',
              files: [
                { id: 'f1', kind: 'report', icon: 'chart', title: 'Relatório de testes', clue: 'O erro é maior para tons de pele mais escuros — e ainda maior para mulheres.',
                  html: '<p><b>Taxa de erro (o sistema não reconhece a pessoa cadastrada)</b> — por faixa da escala de tons de pele usada nos testes:</p><table class="tbl"><tr><th>Faixa de tom de pele</th><th>Homens</th><th>Mulheres</th></tr><tr><td>Tons 1 a 3 (mais claros)</td><td>1%</td><td>2%</td></tr><tr><td>Tons 4 a 6</td><td>3%</td><td>5%</td></tr><tr><td>Tons 7 a 10 (mais escuros)</td><td>7%</td><td class="hot">12%</td></tr></table><p class="small">Dados simulados para fins educativos.</p>' },
                { id: 'f2', kind: 'testimony', icon: 'user', title: 'Depoimento de moradora', clue: 'Pessoas afetadas passam por constrangimento todos os dias.',
                  html: '<blockquote>“Eu me chamo Joana (nome fictício). A catraca quase nunca reconhece meu rosto. Tenho que chamar o porteiro toda vez, e as pessoas ficam olhando como se eu não morasse aqui. Minha filha passa pela mesma coisa.”</blockquote>' },
                { id: 'f3', kind: 'email', icon: 'file', title: 'E-mail interno da empresa', clue: 'Os testes foram feitos com um grupo pequeno e pouco diverso.',
                  html: '<div class="mail"><p><b>De:</b> gerente.produto@visiotech (fictício)<br><b>Assunto:</b> Pode lançar!</p><p>“Testamos com os 40 funcionários do nosso escritório e funcionou muito bem! Não precisamos de mais testes. Pode lançar.”</p></div>' },
                { id: 'f4', kind: 'sheet', icon: 'db', title: 'Ficha da base de treino', clue: 'A base de treino tinha poucos rostos de pele escura.',
                  html: '<ul class="facts"><li>Rostos de tons 1 a 3: <b>81%</b></li><li>Rostos de tons 4 a 6: <b>14%</b></li><li>Rostos de tons 7 a 10: <b>5%</b></li><li>Iluminação das fotos: estúdio com luz clara</li></ul>' },
                { id: 'f5', kind: 'news', icon: 'alert', title: 'Notícia (fictícia)', clue: 'O sistema também é usado para “identificar suspeitos”, o que aumenta os riscos.',
                  html: '<div class="news"><h4>Condomínio quer usar câmeras para “identificar suspeitos”</h4><p>A administração planeja usar o mesmo sistema da VISIOTECH para apontar “pessoas suspeitas” nas câmeras do bairro.</p></div>' }
              ],
              success: 'Todas as pistas coletadas! Agora vamos às conclusões.'
            },
            {
              type: 'choice', title: 'Conclusão 1: qual é o problema?',
              q: 'Com base nas pistas, qual é o problema do sistema?',
              options: [
                { t: 'O sistema erra muito mais com pessoas de pele mais escura, especialmente mulheres.', ok: true, why: 'É o que o relatório de testes mostra: 12% de erro para mulheres de tons 7 a 10, contra 1% para homens de tons 1 a 3.' },
                { t: 'O sistema erra igual para todo mundo.', ok: false, why: 'Releia o relatório de testes: as taxas são bem diferentes entre os grupos.' },
                { t: 'O problema é das pessoas que não sabem usar a catraca.', ok: false, why: 'Isso culpa as vítimas. O erro está no sistema, que foi mal treinado e mal testado.' }
              ]
            },
            {
              type: 'multi', title: 'Conclusão 2: quem pode ser prejudicado?',
              q: 'Quem pode ser prejudicado por esse sistema? Marque todas as respostas corretas.',
              options: [
                { t: 'Pessoas de pele mais escura, especialmente mulheres negras, que são barradas com mais frequência.', ok: true },
                { t: 'Pessoas que podem ser apontadas por engano como “suspeitas” pelas câmeras.', ok: true },
                { t: 'Ninguém: é só um pequeno atraso na portaria.', ok: false, why: 'Releia o depoimento: há constrangimento diário. E, se for usado para apontar suspeitos, o erro pode causar abordagens injustas.' },
                { t: 'Apenas a empresa, que pode perder dinheiro.', ok: false, why: 'A empresa pode ter prejuízo, mas quem sofre primeiro são as pessoas discriminadas.' }
              ]
            },
            {
              type: 'multi', title: 'Conclusão 3: o que analisar?',
              q: 'Que fatores precisam ser analisados na investigação? Marque todos os importantes.',
              options: [
                { t: 'A composição da base de treino.', ok: true },
                { t: 'As taxas de erro separadas por grupo.', ok: true },
                { t: 'As condições de iluminação e as câmeras usadas.', ok: true },
                { t: 'Quem participou dos testes antes do lançamento.', ok: true },
                { t: 'A cor da roupa preferida dos moradores.', ok: false, why: 'Esse fator não tem relação com as evidências do caso.' },
                { t: 'Se as pessoas prejudicadas “reclamaram demais”.', ok: false, why: 'Reclamações são pistas valiosas, não um problema. Ouvir as pessoas afetadas é parte da investigação.' }
              ],
              bonus: 20
            },
            {
              type: 'sequence', title: 'Conclusão 4: como investigar?',
              q: 'Organize as etapas da investigação na ordem mais adequada.',
              items: [
                { id: 's1', t: 'Ouvir as pessoas afetadas e registrar os casos.' },
                { id: 's2', t: 'Separar os resultados por grupo e comparar as taxas de erro.' },
                { id: 's3', t: 'Analisar a base de treino e as condições dos testes.' },
                { id: 's4', t: 'Corrigir o sistema e testar de novo com grupos diversos.' },
                { id: 's5', t: 'Decidir se o sistema pode ser usado — e para quê.' }
              ],
              hints: ['Uma investigação começa ouvindo quem foi prejudicado e termina com uma decisão.', 'Primeiro medimos o problema; depois procuramos a causa; só então corrigimos.']
            }
          ]
        },
        {
          id: 'm3c2', title: 'O recrutamento injusto', mech: 'Marcar pistas em documentos', icon: 'file', xp: 140,
          intro: [{ who: 'teo', text: 'Caso 2: a empresa fictícia TALENTUM usa uma IA para selecionar currículos. Ela foi treinada com os currículos de quem a empresa contratou nos últimos 20 anos. Veja dois candidatos com resultados MUITO diferentes.' }],
          learn: 'A IA da TALENTUM aprendeu a favorecer quem se parecia com os antigos contratados: mesmo bairro, mesma universidade, nomes parecidos e carreiras sem pausas. Esses critérios parecem neutros, mas funcionam como atalhos para raça, gênero e classe social — e excluem pessoas igualmente qualificadas.',
          steps: [
            {
              type: 'highlight', title: 'Compare os currículos',
              text: 'Os dois têm a mesma experiência e as mesmas habilidades, mas notas muito diferentes. Toque nos campos que são DIFERENTES e que podem explicar a diferença na nota da IA.',
              docs: [
                { id: 'cv1', title: 'Currículo A', score: 41, spec: 's9 f a braids jacket c1', fields: [
                  { id: 'nome', label: 'Nome', value: 'Jéssica Santos' },
                  { id: 'bairro', label: 'Bairro', value: 'Jardim das Flores (zona leste)' },
                  { id: 'faculdade', label: 'Formação', value: 'Análise de Sistemas — Faculdade Comunitária' },
                  { id: 'exp', label: 'Experiência', value: '4 anos como desenvolvedora' },
                  { id: 'hab', label: 'Habilidades', value: 'JavaScript, bancos de dados, trabalho em equipe' },
                  { id: 'idioma', label: 'Idiomas', value: 'Inglês intermediário' },
                  { id: 'pausa', label: 'Pausa na carreira', value: '1 ano (cuidou da mãe doente)' }
                ] },
                { id: 'cv2', title: 'Currículo B', score: 92, spec: 's2 m a short jacket', fields: [
                  { id: 'nome', label: 'Nome', value: 'Carlos Andrade' },
                  { id: 'bairro', label: 'Bairro', value: 'Jardim Central' },
                  { id: 'faculdade', label: 'Formação', value: 'Ciência da Computação — Universidade Elite' },
                  { id: 'exp', label: 'Experiência', value: '4 anos como desenvolvedor' },
                  { id: 'hab', label: 'Habilidades', value: 'JavaScript, bancos de dados, trabalho em equipe' },
                  { id: 'idioma', label: 'Idiomas', value: 'Inglês intermediário' },
                  { id: 'pausa', label: 'Pausa na carreira', value: 'Nenhuma' }
                ] }
              ],
              answer: ['nome', 'bairro', 'faculdade', 'pausa'],
              why: { exp: 'A experiência é igual nos dois currículos: não explica a diferença.', hab: 'As habilidades são idênticas: não explicam a diferença.', idioma: 'Os dois têm o mesmo nível de inglês.' },
              hints: ['Compare linha por linha. O que é igual não explica a diferença na nota.', 'São 4 campos diferentes.'],
              success: 'Bem observado! Qualificações iguais, notas diferentes: os campos que mudam são justamente os que não medem competência.'
            },
            {
              type: 'multi', title: 'Abrindo a “caixa-preta”',
              q: 'A TALENTUM liberou a lista de critérios da IA. Marque os critérios DISCRIMINATÓRIOS:',
              options: [
                { t: 'Morar nos mesmos bairros dos antigos contratados (+30 pontos).', ok: true },
                { t: 'Ter estudado nas mesmas universidades dos antigos contratados (+20).', ok: true },
                { t: 'Ter nome parecido com o de funcionários contratados antes (+15).', ok: true },
                { t: 'Não ter nenhuma pausa na carreira (+10).', ok: true },
                { t: 'Análise automática da foto do rosto do currículo (+10).', ok: true },
                { t: 'Anos de experiência na área (+15).', ok: false, why: 'Experiência na área está ligada ao trabalho. É um critério legítimo.' },
                { t: 'Domínio das tecnologias pedidas na vaga (+20).', ok: false, why: 'Saber as ferramentas da vaga é um critério relacionado à função.' },
                { t: 'Resultado em um teste prático da vaga (+20).', ok: false, why: 'Um teste prático mede habilidades reais para a função (desde que seja bem planejado).' }
              ],
              hints: ['Pergunte: esse critério mede a capacidade de fazer o trabalho ou mede “parecer” com quem já foi contratado?'],
              bonus: 20,
              success: 'Isso! Bairro, universidade e nome podem funcionar como atalhos para raça e classe. A “pausa na carreira” prejudica quem cuidou de familiares — muitas vezes mulheres. E o rosto não diz nada sobre competência.'
            },
            {
              type: 'multi', title: 'Proponha uma investigação',
              q: 'Que ações a equipe deve tomar para investigar a TALENTUM? Escolha as 3 melhores.',
              exact: 3,
              options: [
                { t: 'Testar currículos idênticos mudando só o nome e o bairro, e comparar as notas.', ok: true },
                { t: 'Comparar as taxas de aprovação por grupo (gênero, cor/raça, região).', ok: true },
                { t: 'Revisar quais critérios o algoritmo usa e com quais dados ele foi treinado.', ok: true },
                { t: 'Pedir para os candidatos mudarem de bairro.', ok: false, why: 'Isso culpa as pessoas, em vez de corrigir o sistema.' },
                { t: 'Esconder os resultados para evitar polêmica.', ok: false, why: 'Esconder o problema mantém a injustiça. Transparência é parte da solução.' },
                { t: 'Contratar só quem tirou nota acima de 90.', ok: false, why: 'As notas são justamente o que está distorcido! Usá-las aprofundaria a discriminação.' }
              ]
            }
          ]
        },
        {
          id: 'm3c3', title: 'O algoritmo das profissões', mech: 'Encontrar pares e padrões', icon: 'link', xp: 140,
          intro: [{ who: 'lia', text: 'Caso 3: a IA educacional fictícia ORIENTA+ recomenda profissões a estudantes. Há denúncias de recomendações estereotipadas. Encontre os “perfis gêmeos”: estudantes com as MESMAS notas e os MESMOS interesses — e compare o que a IA recomendou.' }],
          learn: 'Estudantes com as mesmas notas e os mesmos interesses receberam recomendações diferentes por causa de gênero, cor/raça ou tipo de escola. Isso é discriminação: a IA empurra cada grupo para “caminhos esperados”, limitando sonhos e reforçando desigualdades sociais e raciais.',
          steps: [
            {
              type: 'pairs', title: 'Encontre os perfis gêmeos',
              text: 'Toque em dois cartões para formar um par. Encontre os 4 pares de estudantes com notas e interesses idênticos.',
              profiles: [
                { id: 'ana', name: 'Ana', spec: 's9 f y afro tshirt c1', info: 'Menina · cor/raça preta · escola pública', notas: [9.5, 8, 9], interesses: 'Robótica e games', rec: 'Técnica em enfermagem' },
                { id: 'pedro', name: 'Pedro', spec: 's2 m y short tshirt c0', info: 'Menino · cor/raça branca · escola particular', notas: [9.5, 8, 9], interesses: 'Robótica e games', rec: 'Engenharia de computação' },
                { id: 'luana', name: 'Luana', spec: 's5 f y long tshirt c3', info: 'Menina · indígena · escola pública do interior', notas: [8, 8.5, 9.5], interesses: 'Biologia e meio ambiente', rec: 'Artesanato' },
                { id: 'marina', name: 'Marina', spec: 's1 f y ponytail tshirt c6', info: 'Menina · cor/raça branca · escola particular da capital', notas: [8, 8.5, 9.5], interesses: 'Biologia e meio ambiente', rec: 'Pesquisa em biologia' },
                { id: 'diego', name: 'Diego', spec: 's6 m y curly hoodie c5', info: 'Menino · cor/raça parda · escola pública da periferia', notas: [7.5, 9.5, 7], interesses: 'Debates, leis e história', rec: 'Vigilante de segurança' },
                { id: 'rafael', name: 'Rafael', spec: 's2 m y short hoodie c7', info: 'Menino · cor/raça branca · escola particular', notas: [7.5, 9.5, 7], interesses: 'Debates, leis e história', rec: 'Direito' },
                { id: 'bia', name: 'Bia', spec: 's2 f y bob tshirt c4', info: 'Menina · cor/raça branca · escola particular', notas: [9, 7.5, 8.5], interesses: 'Motores e mecânica', rec: 'Design de moda' },
                { id: 'caio', name: 'Caio', spec: 's3 m y buzz tshirt c2', info: 'Menino · cor/raça branca · escola particular', notas: [9, 7.5, 8.5], interesses: 'Motores e mecânica', rec: 'Engenharia mecânica' }
              ],
              pairs: [['ana', 'pedro'], ['luana', 'marina'], ['diego', 'rafael'], ['bia', 'caio']],
              hints: ['Compare as notas de Matemática, Português e Ciências e os interesses.', 'Cada estudante tem exatamente um gêmeo.'],
              success: 'Os 4 pares foram encontrados — e em todos eles a IA recomendou caminhos diferentes para estudantes com o mesmo desempenho e os mesmos interesses.'
            },
            {
              type: 'multi', title: 'Identifique as associações inadequadas',
              q: 'Quais características a ORIENTA+ está usando de forma inadequada para mudar as recomendações?',
              options: [
                { t: 'Gênero (ex.: Bia e Caio).', ok: true },
                { t: 'Cor/raça (ex.: Ana e Pedro, Luana e Marina).', ok: true },
                { t: 'Tipo de escola e bairro (ex.: Diego e Rafael).', ok: true },
                { t: 'Os interesses dos estudantes.', ok: false, why: 'Os interesses eram iguais em cada par. Considerar interesses é justamente o que uma boa recomendação deveria fazer.' },
                { t: 'As notas dos estudantes.', ok: false, why: 'As notas eram idênticas em cada par, então não explicam as diferenças.' }
              ],
              bonus: 20
            },
            {
              type: 'choice', title: 'Recomendação justa',
              q: 'Qual seria uma recomendação justa para a Ana?',
              options: [
                { t: 'Opções baseadas nos interesses e no desempenho dela, como Engenharia de Computação, Robótica ou Ciência de Dados.', ok: true, why: 'Isso! Uma boa recomendação parte do que a estudante gosta e faz bem — e apresenta possibilidades, sem limitar.' },
                { t: 'Técnica em enfermagem, porque meninas são mais cuidadosas.', ok: false, why: 'Isso é um estereótipo de gênero. A Ana disse que gosta de robótica e games. (E enfermagem é ótima profissão — para quem se interessa por ela!)' },
                { t: 'Nenhuma: é melhor não mostrar opções para ela.', ok: false, why: 'Esconder possibilidades também é uma forma de exclusão.' }
              ]
            }
          ]
        }
      ]
    },

    /* ============================ MISSÃO 4 ============================ */
    {
      id: 'm4', num: 4, title: 'Corrigindo a inteligência artificial', short: 'Laboratório de desenvolvimento', color: '#10b981', icon: 'wrench', medal: 'desenvolvedor',
      inspirations: ['mark', 'timnit'], place: 'Laboratório de Desenvolvimento',
      story: [
        { who: 'teo', text: 'Acesso liberado ao laboratório de desenvolvimento, {nome}! Aqui ficam os dados, as regras e os testes do sistema de triagem RECRUTA, da NEXUS.' },
        { who: 'lia', text: 'Você já sabe encontrar problemas. Agora precisa corrigi-los — com cuidado: cada mudança precisa ser medida.' },
        { who: 'nexus', text: 'MODO DE MANUTENÇÃO ATIVADO. Aguardando instruções da especialista…' }
      ],
      objective: 'Revisar os dados e os critérios de uma IA e comparar os resultados antes e depois das correções.',
      context: 'Uma IA pode ser revisada em três frentes: (1) os dados com que aprende; (2) os critérios e regras que usa para decidir; (3) os resultados que produz, que precisam ser medidos por grupo e acompanhados ao longo do tempo. Corrigir só uma delas raramente basta.',
      conclusion: [
        'Corrigir os dados envolve acrescentar exemplos que faltam, revisar rótulos, remover duplicatas e melhorar a qualidade.',
        'Critérios que funcionam como atalhos para raça, gênero ou classe social devem ser removidos ou substituídos por critérios ligados à tarefa.',
        'Medir antes e depois mostra se a correção funcionou — e quanto ainda falta.',
        'Corrigir os dados não garante uma IA justa: é preciso avaliar critérios, testar e monitorar continuamente.'
      ],
      challenges: [
        {
          id: 'm4c1', title: 'Corrija os dados', mech: 'Arrastar ferramentas', icon: 'db', xp: 150,
          intro: [{ who: 'teo', text: 'Esta é a base de treino do RECRUTA. Arraste a ferramenta certa para cada linha. Algumas linhas estão corretas e devem ser mantidas!' }],
          learn: 'Cada problema de dados pede uma ação diferente: rótulos estereotipados são revisados, grupos ausentes recebem novos exemplos, duplicatas são removidas e imagens ruins são substituídas. E o que está correto deve ser mantido.',
          steps: [
            {
              type: 'datafix', title: 'Base de treino RECRUTA — revisão',
              text: 'Arraste uma ferramenta para cada linha (ou toque na ferramenta e depois na linha).',
              tools: [
                { id: 'rotulo', label: 'Revisar rótulo', icon: 'tag' },
                { id: 'add', label: 'Acrescentar exemplos', icon: 'plus' },
                { id: 'dup', label: 'Remover duplicata', icon: 'trash' },
                { id: 'img', label: 'Substituir imagem ruim', icon: 'eye' },
                { id: 'ok', label: 'Manter', icon: 'check' }
              ],
              rows: [
                { id: 'r1', spec: 's9 f a braids vest', text: 'Foto: engenheira em obra · Rótulo: “Assistente”', tool: 'rotulo', why: 'O rótulo está errado e estereotipado: a foto mostra uma engenheira.' },
                { id: 'r2', icon: 'users', text: 'Grupo “mulheres indígenas”: 0 exemplos na base', tool: 'add', why: 'Um grupo ausente precisa de novos exemplos. Não há o que revisar em algo que não existe.' },
                { id: 'r3', spec: 's2 m a short vest', text: 'Registro #102: engenheiro · cópia idêntica do registro #101', tool: 'dup', why: 'Exemplos duplicados dão peso extra a um único perfil.' },
                { id: 'r4', spec: 's6 f a long labcoat', text: 'Foto: médica atendendo · Rótulo: “Médica”', tool: 'ok', why: 'Este exemplo está correto. Nem tudo precisa ser mudado!' },
                { id: 'r5', icon: 'clock', text: 'Pessoas com 60 anos ou mais: só 2% da base', tool: 'add', why: 'Um grupo sub-representado precisa de mais exemplos.' },
                { id: 'r6', spec: 's7 m a curly hoodie c0', blur: true, text: 'Foto: programador · imagem escura e desfocada', tool: 'img', why: 'Imagens ruins de um grupo fazem a IA aprender pior sobre ele.' },
                { id: 'r7', spec: 's3 f a bun labcoat wheelchair', text: 'Foto: cientista cadeirante no laboratório · Rótulo: “Paciente”', tool: 'rotulo', why: 'Rótulo capacitista: a pessoa é cientista. Deficiência não é sinônimo de doença.' },
                { id: 'r8', spec: 's10 m a bald cardigan c7', text: 'Foto: professor dando aula · Rótulo: “Professor”', tool: 'ok', why: 'Exemplo correto: deve ser mantido.' }
              ],
              hints: ['Leia o rótulo e a descrição da foto: eles combinam?', 'Duas linhas estão corretas e devem ser mantidas.']
            }
          ]
        },
        {
          id: 'm4c2', title: 'Corrija os critérios', mech: 'Editar regras do algoritmo', icon: 'cpu', xp: 150,
          intro: [{ who: 'lia', text: 'Estas são as regras de pontuação do RECRUTA. Marque as regras problemáticas e escolha uma substituição adequada para cada uma. Cuidado: algumas “correções” continuam injustas!' }],
          learn: 'Regras ligadas à tarefa (experiência, habilidades, certificações) ficam. Regras que funcionam como atalhos para raça, gênero ou classe — bairro, nome, universidade “de elite”, pausas na carreira, análise do rosto — saem ou são trocadas. Uma boa correção não apenas troca o atalho por outro parecido.',
          steps: [
            {
              type: 'rules', title: 'Algoritmo RECRUTA — regras de pontuação',
              text: 'Toque em “Problemática” nas regras injustas e escolha a melhor substituição para cada uma.',
              rules: [
                { id: 'r1', code: 'SE experiência_na_área ≥ 2 anos ENTÃO +20', bad: false, why: 'Essa regra está ligada à função. Não precisa mudar.' },
                { id: 'r2', code: 'SE bairro ∈ {Jardim Central, Vila Nobre} ENTÃO +25', bad: true, why: 'O bairro funciona como atalho para raça e classe social.',
                  options: [
                    { t: 'Remover a regra: o bairro não indica competência.', ok: true },
                    { t: 'SE bairro perto do centro ENTÃO +10', ok: false, why: 'Continua usando o bairro como atalho — só com menos pontos.' },
                    { t: 'SE bairro = periferia ENTÃO −10', ok: false, why: 'Isso piora a discriminação!' }
                  ] },
                { id: 'r3', code: 'SE domina ferramentas_da_vaga ENTÃO +20', bad: false, why: 'Critério ligado à função.' },
                { id: 'r4', code: 'SE nome parecido com contratados_anteriores ENTÃO +15', bad: true, why: 'Nomes podem indicar gênero, origem e cor/raça.',
                  options: [
                    { t: 'Ocultar o nome durante a triagem (triagem às cegas).', ok: true },
                    { t: 'SE nome curto ENTÃO +15', ok: false, why: 'Tamanho do nome não tem nada a ver com competência.' },
                    { t: 'SE nome estrangeiro ENTÃO +15', ok: false, why: 'Continua julgando pelo nome.' }
                  ] },
                { id: 'r5', code: 'SE pausa_na_carreira > 6 meses ENTÃO −20', bad: true, why: 'Penaliza quem cuidou de familiares ou teve filhos — muitas vezes mulheres.',
                  options: [
                    { t: 'Não penalizar: conversar sobre a pausa na entrevista, se necessário.', ok: true },
                    { t: 'SE pausa_na_carreira > 1 ano ENTÃO −30', ok: false, why: 'Continua penalizando as pausas — e com mais força.' }
                  ] },
                { id: 'r6', code: 'SE formado na Universidade Elite ENTÃO +20', bad: true, why: 'Favorece quem teve acesso às mesmas instituições dos antigos contratados.',
                  options: [
                    { t: 'Valorizar a formação relevante para a vaga, em qualquer instituição.', ok: true },
                    { t: 'SE formado em universidade particular ENTÃO +20', ok: false, why: 'Troca um atalho de classe social por outro.' }
                  ] },
                { id: 'r7', code: 'SE tem certificação relevante ENTÃO +10', bad: false, why: 'Critério ligado à função.' },
                { id: 'r8', code: 'SE análise_facial indica “perfil confiável” ENTÃO +15', bad: true, why: 'O rosto não indica confiança nem competência — e sistemas faciais erram mais com alguns grupos.',
                  options: [
                    { t: 'Remover a regra: aparência não mede competência.', ok: true },
                    { t: 'Usar análise facial só para cargos de chefia.', ok: false, why: 'O problema continua, só muda de lugar.' }
                  ] }
              ],
              hints: ['Pergunte para cada regra: ela mede a capacidade de fazer o trabalho?', 'São 5 regras problemáticas e 3 regras adequadas.'],
              bonus: 20
            }
          ]
        },
        {
          id: 'm4c3', title: 'Antes e depois', mech: 'Simular e analisar gráficos', icon: 'chart', xp: 150,
          intro: [{ who: 'teo', text: 'Dados corrigidos, regras revisadas. Hora da verdade: vamos rodar o RECRUTA com 1.000 currículos simulados, igualmente qualificados em todos os grupos, e comparar com a versão antiga.' }],
          learn: 'A correção reduziu muito a diferença entre os grupos — mas ela não sumiu. Corrigir dados não garante automaticamente uma IA justa: é preciso avaliar critérios, testar o sistema e monitorar os resultados continuamente.',
          steps: [
            {
              type: 'chart', title: 'Execute o teste comparativo', run: 'Executar teste com 1.000 currículos simulados',
              text: 'Taxa de aprovação na triagem (%) por grupo. Todos os grupos tinham candidatos igualmente qualificados. Dados simulados.',
              series: ['Antes', 'Depois'],
              data: [
                { label: 'Homens brancos', v: [48, 34] },
                { label: 'Mulheres brancas', v: [30, 32] },
                { label: 'Homens negros', v: [22, 31] },
                { label: 'Mulheres negras', v: [10, 29] },
                { label: 'Pessoas indígenas', v: [14, 24] }
              ],
              q: 'Toque no grupo que era MAIS prejudicado ANTES da correção.',
              pick: ['Mulheres negras'],
              why: { 'Pessoas indígenas': 'Pessoas indígenas também eram muito prejudicadas (14%), mas há um grupo com taxa ainda menor antes da correção.', 'Homens brancos': 'Esse era o grupo mais favorecido antes da correção.' },
              success: 'Isso! Mulheres negras tinham só 10% de aprovação. Quando gênero e raça se combinam, as discriminações podem se somar — isso se chama interseccionalidade.'
            },
            {
              type: 'number', title: 'Meça a diferença',
              q: 'ANTES, a diferença entre o grupo mais favorecido (48%) e o menos favorecido (10%) era de quantos pontos percentuais?',
              answer: 38, unit: 'pontos',
              hints: ['Faça a subtração: 48 − 10.'],
              success: '48 − 10 = 38 pontos percentuais de diferença. Uma distância enorme!'
            },
            {
              type: 'number', title: 'Meça de novo',
              q: 'DEPOIS da correção, a maior taxa é 34% e a menor é 24%. Qual é a diferença agora, em pontos percentuais?',
              answer: 10, unit: 'pontos',
              hints: ['Faça a subtração: 34 − 24.'],
              success: 'A diferença caiu de 38 para 10 pontos. Grande melhora!'
            },
            {
              type: 'choice', title: 'Interprete o resultado',
              q: 'Ainda existe uma diferença de 10 pontos. O que isso significa?',
              options: [
                { t: 'A correção melhorou o sistema, mas ainda há desigualdade: é preciso continuar investigando, testando e monitorando.', ok: true, why: 'Exato. Melhorar não é o mesmo que resolver. O trabalho continua.' },
                { t: 'O sistema agora é 100% justo.', ok: false, why: 'Ainda há 10 pontos de diferença entre grupos igualmente qualificados. Não dá para dizer que está resolvido.' },
                { t: 'A correção não serviu para nada.', ok: false, why: 'Serviu, sim: a diferença caiu de 38 para 10 pontos. Melhorar é importante, mesmo que ainda não seja suficiente.' }
              ],
              bonus: 20
            },
            {
              type: 'sequence', title: 'O ciclo da IA responsável',
              q: 'Organize o ciclo de trabalho de uma IA responsável, do primeiro ao último passo.',
              items: [
                { id: 'a', t: 'Revisar e ampliar os dados.' },
                { id: 'b', t: 'Corrigir os critérios do algoritmo.' },
                { id: 'c', t: 'Testar os resultados separadamente por grupo.' },
                { id: 'd', t: 'Lançar com cuidado e transparência.' },
                { id: 'e', t: 'Monitorar continuamente e voltar ao início se surgirem problemas.' }
              ],
              hints: ['Pense no caminho desta missão: dados → regras → teste.'],
              success: 'Esse é o ciclo! Ele nunca termina de verdade: monitorar é o que permite recomeçar sempre que surgir um problema.'
            }
          ]
        }
      ]
    },

    /* ============================ MISSÃO 5 ============================ */
    {
      id: 'm5', num: 5, title: 'Teste de qualidade', short: 'Avaliação contínua', color: '#f59e0b', icon: 'chart', medal: 'auditor',
      inspirations: ['jerry', 'tarcizio'], place: 'Central de Testes',
      story: [
        { who: 'lia', text: 'A NEXUS AI foi revisada, {nome}. A diretoria quer lançar hoje mesmo.' },
        { who: 'teo', text: 'E os testes iniciais deram 95% de acerto! Isso é ótimo, né?' },
        { who: 'lia', text: 'É um bom número… mas 95% de acerto para QUEM? Um sistema pode ir bem na média e mal para um grupo específico. Vamos testar de verdade antes de aprovar qualquer coisa.' }
      ],
      objective: 'Testar a IA com situações novas, analisar relatórios por grupo e decidir se ela pode ser aprovada.',
      context: 'Testar uma IA é colocá-la diante de situações novas — que não estavam nos dados de treino — e medir os resultados separadamente para cada grupo. Uma média geral alta pode esconder erros concentrados em algumas pessoas. A taxa de erro de um grupo é calculada assim: erros ÷ total de testes do grupo × 100.',
      conclusion: [
        'Situações novas revelam vieses que não apareciam nos testes antigos.',
        'Taxa de erro = erros ÷ total de testes × 100. Ela deve ser calculada separadamente para cada grupo.',
        'Uma média alta pode esconder erros graves para grupos menores.',
        'Nenhum sistema deve ser considerado justo só porque foi bem em um teste limitado: a avaliação deve ser contínua.'
      ],
      challenges: [
        {
          id: 'm5c1', title: 'Teste surpresa', mech: 'Esteira de testes', icon: 'bolt', xp: 160,
          intro: [{ who: 'teo', text: 'Preparei 8 situações inéditas, que a NEXUS nunca viu. Para cada resultado, decida: está adequado ou é uma falha de viés? Se for falha, diga de que tipo.' }],
          learn: 'Testes com situações novas revelaram vieses de gênero, raça, região, idade e deficiência que não apareciam antes. Testar com diversidade é a melhor forma de encontrar falhas antes que elas prejudiquem pessoas reais.',
          steps: [
            {
              type: 'conveyor', title: 'Esteira de testes da NEXUS AI',
              text: 'Analise cada teste. Marque “Adequado” ou escolha o tipo de falha.',
              tags: [
                { id: 'genero', t: 'Viés de gênero' },
                { id: 'racial', t: 'Viés racial' },
                { id: 'regional', t: 'Viés regional / de sotaque' },
                { id: 'idade', t: 'Viés de idade' },
                { id: 'def', t: 'Exclusão de pessoas com deficiência' }
              ],
              cases: [
                { id: 't1', tool: 'Tradutor', input: '“The doctor and the nurse arrived.”', output: '“O médico e a enfermeira chegaram.” (sempre assim, nunca “a médica” ou “o enfermeiro”)', ok: false, tags: ['genero'], why: 'Sem nenhuma informação sobre gênero, o tradutor supôs que quem é médico é homem e quem é enfermeira é mulher.' },
                { id: 't2', tool: 'Legenda automática', input: 'Foto de uma cientista negra de jaleco no laboratório.', output: '“Mulher fazendo limpeza.”', ok: false, tags: ['racial', 'genero'], why: 'A IA ignorou o jaleco e o laboratório e associou uma mulher negra a uma função estereotipada.' },
                { id: 't3', tool: 'Assistente de voz', input: 'Pedido falado com sotaque do interior do Nordeste.', output: '“Desculpe, não entendi.” (erra 4 vezes mais que com sotaques do Sudeste)', ok: false, tags: ['regional'], why: 'A IA foi treinada com poucas vozes de algumas regiões e entende pior quem fala de outro jeito.' },
                { id: 't4', tool: 'Gerador de imagens', input: '“Uma família brasileira no almoço de domingo.”', output: 'Famílias de diferentes tons de pele, idades e formações, incluindo uma avó cadeirante.', ok: true, why: 'Resultado diverso e respeitoso, como as famílias brasileiras.' },
                { id: 't5', tool: 'Legenda automática', input: 'Foto de uma atleta cadeirante jogando basquete.', output: '“Pessoa doente no hospital.”', ok: false, tags: ['def'], why: 'A IA associou deficiência à doença e ignorou a cena esportiva.' },
                { id: 't6', tool: 'Recomendador de vagas', input: 'Perfil de uma pessoa de 62 anos, programadora experiente.', output: '“Nenhuma vaga de tecnologia é recomendada para o seu perfil.”', ok: false, tags: ['idade'], why: 'A IA excluiu uma pessoa experiente só por causa da idade.' },
                { id: 't7', tool: 'Busca de imagens', input: '“Penteados profissionais para entrevista.”', output: 'Quase só cabelos lisos; cabelos crespos e cacheados quase não aparecem.', ok: false, tags: ['racial'], why: 'Tratar só cabelos lisos como “profissionais” desvaloriza cabelos crespos e cacheados, muito comuns entre pessoas negras.' },
                { id: 't8', tool: 'Recomendador de cursos', input: 'Estudantes de vários gêneros que marcaram interesse em tecnologia.', output: 'Recomenda robótica e programação para todos que marcaram esse interesse.', ok: true, why: 'A recomendação segue os interesses de cada estudante, sem estereótipos.' }
              ],
              hints: ['Pergunte: o resultado trata alguém de forma diferente por gênero, cor/raça, sotaque, idade ou deficiência?']
            }
          ]
        },
        {
          id: 'm5c2', title: 'Encontre a falha', mech: 'Ler tabelas e gráficos', icon: 'chart', xp: 160,
          intro: [{ who: 'lia', text: 'Este é o relatório de desempenho do NEXUS ID, o verificador de identidade. Acerto geral: 95%. Mas vamos olhar os grupos separadamente…' }],
          learn: 'O acerto geral de 95% escondia um problema: o Grupo C tinha uma taxa de erro 7 vezes maior que a do Grupo A. Como o Grupo C tinha menos testes, seus erros “sumiam” na média. Por isso, resultados sempre devem ser avaliados separadamente por grupo.',
          steps: [
            {
              type: 'number', title: 'Complete o relatório',
              html: '<table class="tbl"><tr><th>Grupo (faixa de tom de pele nos testes)</th><th>Testes</th><th>Erros</th><th>Taxa de erro</th></tr><tr><td>A — tons 1 a 3</td><td>500</td><td>10</td><td>2%</td></tr><tr><td>B — tons 4 a 6</td><td>300</td><td>12</td><td>4%</td></tr><tr><td>C — tons 7 a 10</td><td>200</td><td>28</td><td class="hot">?</td></tr><tr class="tot"><td>Total</td><td>1.000</td><td>50</td><td>5% (acerto de 95%)</td></tr></table><p class="small">Relatório fictício · taxa de erro = erros ÷ testes × 100</p>',
              q: 'Calcule a taxa de erro do Grupo C: 28 erros em 200 testes = quantos %?',
              answer: 14, unit: '%',
              hints: ['28 ÷ 200 = 0,14.', 'Multiplique 0,14 por 100.'],
              success: '28 ÷ 200 × 100 = 14%. Bem acima da média geral de 5%!'
            },
            {
              type: 'chart', title: 'Visualize',
              text: 'Taxa de erro por grupo (%) — NEXUS ID. Dados fictícios.',
              series: ['Taxa de erro'], data: [{ label: 'Grupo A', v: [2] }, { label: 'Grupo B', v: [4] }, { label: 'Grupo C', v: [14] }, { label: 'Média geral', v: [5], avg: true }],
              q: 'Toque no grupo com a MAIOR taxa de erro.',
              pick: ['Grupo C'],
              why: { 'Média geral': 'A média junta todos os grupos — e justamente por isso esconde as diferenças. Olhe os grupos.' }
            },
            {
              type: 'number', title: 'Compare',
              q: 'A taxa de erro do Grupo C (14%) é quantas vezes maior que a do Grupo A (2%)?',
              answer: 7, unit: 'vezes',
              hints: ['Divida: 14 ÷ 2.'],
              success: '14 ÷ 2 = 7. Uma pessoa do Grupo C tem 7 vezes mais chance de ser barrada injustamente.'
            },
            {
              type: 'choice', title: 'Por que a média enganou?',
              q: 'Por que o acerto geral de 95% enganou a equipe?',
              options: [
                { t: 'Porque o Grupo C teve menos testes, e seus erros ficaram “escondidos” na média geral.', ok: true, why: 'Isso! A média é dominada pelos grupos com mais testes. Por isso é preciso olhar cada grupo.' },
                { t: 'Porque 95% é uma nota baixa.', ok: false, why: '95% parece ótimo — e esse é o perigo: um número geral alto pode esconder injustiças.' },
                { t: 'Porque a calculadora errou a conta.', ok: false, why: 'A conta estava certa. O problema é olhar só para a média.' }
              ],
              bonus: 20
            },
            {
              type: 'multi', title: 'O que fazer?',
              q: 'O que a equipe deveria fazer agora? Marque todas as ações adequadas.',
              options: [
                { t: 'Sempre analisar os resultados separadamente por grupo.', ok: true },
                { t: 'Aumentar o número de testes com pessoas do Grupo C.', ok: true },
                { t: 'Investigar por que o erro é maior (dados, câmeras, iluminação).', ok: true },
                { t: 'Retirar o Grupo C dos testes para melhorar a média.', ok: false, why: 'Isso esconderia o problema — e as pessoas do Grupo C continuariam sendo prejudicadas.' },
                { t: 'Divulgar só o acerto geral de 95%.', ok: false, why: 'Transparência significa mostrar também onde o sistema falha.' }
              ]
            }
          ]
        },
        {
          id: 'm5c3', title: 'A IA está pronta?', mech: 'Decisões com consequências', icon: 'scale', xp: 160,
          intro: [{ who: 'lia', text: 'Reunião com a diretoria da NEXUS LAB. Você tem a palavra final sobre o lançamento do NEXUS ID. Suas decisões terão consequências — e você poderá ver o futuro de cada escolha.' }],
          learn: 'Um sistema nunca deve ser considerado justo só porque foi bem em um teste limitado. Lançar com responsabilidade significa: corrigir antes, testar com diversidade, começar pequeno, monitorar por grupo, ter revisão humana e um canal para as pessoas reclamarem — e nunca usar a IA sozinha em decisões graves.',
          steps: [
            {
              type: 'decision', title: 'Sala de decisões',
              start: 'd1',
              nodes: {
                d1: { text: 'A diretoria quer lançar o NEXUS ID amanhã, para 50 milhões de pessoas. O Grupo C ainda tem 14% de erro. O que você recomenda?',
                  options: [
                    { t: 'Aprovar: 95% de acerto geral é excelente.', end: { headline: '6 MESES DEPOIS…', text: 'Milhares de pessoas do Grupo C são barradas em bancos, aeroportos e escolas todos os dias. Denúncias se espalham, a NEXUS LAB é processada e perde a confiança do público.', why: 'A média alta escondia um erro 7 vezes maior para um grupo. Aprovar assim transfere o prejuízo para quem já é discriminado.' } },
                    { t: 'Lançar só para os Grupos A e B e deixar o Grupo C de fora do serviço.', end: { headline: '3 MESES DEPOIS…', text: 'Pessoas do Grupo C não conseguem usar serviços bancários e públicos que passaram a exigir o NEXUS ID. A exclusão vira manchete.', why: 'Excluir um grupo também é discriminação. A solução é corrigir o sistema para todos.' } },
                    { t: 'Não aprovar ainda: o sistema precisa de revisão e de mais testes com o Grupo C.', next: 'd2' }
                  ] },
                d2: { text: 'Depois da revisão, o erro do Grupo C caiu para 4% — igual ao do Grupo B. A diretoria pergunta: e agora?',
                  options: [
                    { t: 'Lançar para todo mundo e encerrar os testes: missão cumprida.', end: { headline: '1 ANO DEPOIS…', text: 'O sistema recebeu atualizações e novas câmeras. O erro para o Grupo C voltou a subir — e ninguém percebeu por meses.', why: 'Sistemas mudam com o tempo. Sem monitoramento contínuo, os vieses podem voltar sem ninguém notar.' } },
                    { t: 'Lançar em um piloto (em menor escala), com monitoramento por grupo, revisão humana e um canal de reclamações.', next: 'd3' },
                    { t: 'Pedir às pessoas do Grupo C que tirem fotos com mais luz.', end: { headline: 'NO DIA SEGUINTE…', text: 'A orientação é vista como desrespeitosa. Pessoas do Grupo C se sentem culpadas por um erro que é do sistema.', why: 'Isso culpa as vítimas. Quem precisa se adaptar é a tecnologia, não as pessoas.' } }
                  ] },
                d3: { text: 'O piloto vai começar. Em qual situação o NEXUS ID NUNCA deveria decidir sozinho, sem revisão humana?',
                  options: [
                    { t: 'Para apontar alguém como suspeito de um crime.', next: 'win' },
                    { t: 'Para liberar a entrada no aplicativo do próprio celular, com senha como alternativa.', end: { headline: 'PENSE DE NOVO…', text: 'Nesse caso, um erro tem consequência pequena e existe alternativa (a senha). Há uma situação muito mais grave entre as opções.', why: 'Decisões que podem prejudicar seriamente uma pessoa — como acusá-la de um crime — exigem revisão humana.' } }
                  ] },
                win: { final: true, headline: 'LANÇAMENTO RESPONSÁVEL', text: 'O piloto começa pequeno, com monitoramento por grupo, revisão humana nas decisões importantes e um canal aberto para reclamações. Um ano depois, os erros continuam baixos para todos os grupos — porque a equipe nunca parou de testar.' }
              },
              bonus: 20
            }
          ]
        }
      ]
    },

    /* ============================ MISSÃO 6 ============================ */
    {
      id: 'm6', num: 6, title: 'A grande missão final', short: 'Caso RUMO', color: '#eab308', icon: 'trophy', medal: 'etica',
      inspirations: ['alan', 'lonnie'], place: 'Sala de Comando',
      story: [
        { who: 'lia', text: '{nome}, chegou a hora. Uma rede de escolas nos procurou com um problema urgente.' },
        { who: 'nexus', text: 'ALERTA: a IA “RUMO”, da empresa fictícia FuturaEdu, orienta 2 milhões de estudantes sobre suas futuras profissões.' },
        { who: 'teo', text: 'O sistema apresenta recomendações diferentes e estereotipadas, reforçando desigualdades sociais e raciais.' },
        { who: 'lia', text: 'Desta vez, você lidera. Investigue, analise as evidências, identifique quem está sendo prejudicado, revise os dados, corrija os critérios, teste os resultados e elabore uma solução. Use tudo o que aprendeu.' }
      ],
      objective: 'Aplicar tudo o que aprendeu: investigar, analisar, corrigir, testar e propor uma solução para a IA RUMO.',
      context: 'Esta missão reúne todas as etapas do trabalho de uma especialista em IA responsável. São 7 etapas. Na última, você vai escrever uma justificativa curta explicando a sua solução — ela será avaliada com base em análise, coerência e compreensão.',
      conclusion: [
        'Você investigou, analisou evidências, identificou grupos prejudicados, revisou dados, corrigiu critérios, testou e propôs uma solução.',
        'Desigualdades de gênero, raça e classe podem se somar dentro de um algoritmo (interseccionalidade).',
        'Testes com perfis gêmeos ajudam a descobrir quando uma característica que não deveria importar muda o resultado.',
        'A tecnologia é criada por pessoas, alimentada por dados e utilizada pela sociedade. Construir tecnologias mais justas também é responsabilidade nossa.'
      ],
      challenges: [
        {
          id: 'm6c1', title: 'Etapa 1 · Investigar o problema', mech: 'Investigação', icon: 'folder', xp: 110, dossier: true,
          intro: [{ who: 'lia', text: 'Comece pelo dossiê do caso RUMO. Abra todos os arquivos.' }],
          learn: 'O problema central está claro: a RUMO aprendeu com um histórico desigual e usa critérios como gênero, CEP e tipo de escola, que não deveriam definir o futuro de ninguém.',
          steps: [
            {
              type: 'evidence', title: 'Dossiê do caso RUMO',
              text: 'Abra cada arquivo e colete as pistas.',
              files: [
                { id: 'g1', kind: 'testimony', icon: 'user', title: 'Mensagem de estudante', clue: 'Uma estudante interessada em programação recebeu recomendação estereotipada.',
                  html: '<blockquote>“Eu disse para a RUMO que amo programação e tiro 9 em Matemática. Ela me indicou ‘auxiliar administrativa’. Meu colega, com as mesmas notas, recebeu ‘Engenharia de Software’.” — Kelly, 14 anos (nome fictício)</blockquote>' },
                { id: 'g2', kind: 'sheet', icon: 'db', title: 'Ficha técnica da RUMO', clue: 'A base de treino é o histórico de profissões de ex-alunos de 1990 a 2010, de 3 escolas particulares.',
                  html: '<ul class="facts"><li>Dados de treino: profissões de ex-alunos formados entre <b>1990 e 2010</b></li><li>Origem: <b>3 escolas particulares</b> de uma mesma região</li><li>Objetivo: recomendar “o caminho mais provável de sucesso”</li></ul>' },
                { id: 'g3', kind: 'report', icon: 'cpu', title: 'Critérios do algoritmo', clue: 'O algoritmo usa gênero, CEP e tipo de escola para recomendar.',
                  html: '<pre class="code">entrada: notas, interesses,\n         gênero, CEP, tipo_de_escola\npeso(gênero)          = ALTO\npeso(CEP)             = ALTO\npeso(tipo_de_escola)  = ALTO\npeso(interesses)      = BAIXO</pre>' },
                { id: 'g4', kind: 'testimony', icon: 'users', title: 'Depoimento de professora', clue: 'Estudantes estão desistindo de sonhos por causa das recomendações.',
                  html: '<blockquote>“Vários estudantes da nossa escola pública passaram a dizer que ‘computação não é para eles’, porque a RUMO nunca mostra essa opção. Isso está mudando os sonhos deles.” — Profa. Rosa (nome fictícia)</blockquote>' },
                { id: 'g5', kind: 'email', icon: 'file', title: 'E-mail da FuturaEdu', clue: 'A empresa nunca testou os resultados separadamente por grupo.',
                  html: '<div class="mail"><p><b>Assunto:</b> Avaliação da RUMO</p><p>“Nossa avaliação mostra que 87% dos estudantes clicaram nas recomendações. Não vimos necessidade de separar os resultados por grupo.”</p></div>' }
              ]
            },
            {
              type: 'choice', title: 'O problema central',
              q: 'Com base nas pistas, qual é o problema central da RUMO?',
              options: [
                { t: 'Ela aprendeu com um histórico desigual e usa gênero, CEP e tipo de escola para recomendar profissões, reforçando desigualdades.', ok: true, why: 'Exato: dados históricos desiguais + critérios inadequados + nenhum teste por grupo.' },
                { t: 'Os estudantes não sabem usar o aplicativo.', ok: false, why: 'O problema está nos dados e nos critérios do sistema, não nos estudantes.' },
                { t: 'A RUMO funciona bem, porque 87% dos estudantes clicaram nas recomendações.', ok: false, why: 'Cliques não medem justiça. Uma recomendação injusta também pode receber cliques.' }
              ],
              bonus: 20
            }
          ]
        },
        {
          id: 'm6c2', title: 'Etapa 2 · Analisar as evidências', mech: 'Análise de gráficos', icon: 'chart', xp: 110,
          intro: [{ who: 'teo', text: 'Consegui os dados de uso da RUMO. O gráfico mostra quantos estudantes interessados em tecnologia, com notas parecidas, receberam recomendações de cursos de ciência e tecnologia.' }],
          learn: 'Os dados mostram uma diferença de 66 pontos percentuais entre o grupo mais favorecido e o menos favorecido — entre estudantes com os mesmos interesses e notas parecidas.',
          steps: [
            {
              type: 'chart', title: 'Taxa de recomendação para ciência e tecnologia (%)',
              text: 'Somente estudantes que declararam interesse em tecnologia e têm notas parecidas. Dados fictícios.',
              series: ['Recomendação'],
              data: [
                { label: 'Meninos brancos (esc. particular)', v: [78] },
                { label: 'Meninas brancas (esc. particular)', v: [41] },
                { label: 'Meninos negros (esc. pública)', v: [33] },
                { label: 'Meninas negras (esc. pública)', v: [12] },
                { label: 'Estudantes indígenas', v: [15] }
              ],
              q: 'Toque em TODOS os grupos que receberam recomendação para ciência e tecnologia em menos de 40% dos casos.',
              pick: ['Meninos negros (esc. pública)', 'Meninas negras (esc. pública)', 'Estudantes indígenas'],
              multi: true, line: 40,
              hints: ['Use a linha de 40% do gráfico como referência.']
            },
            {
              type: 'number', title: 'Meça a desigualdade',
              q: 'Qual é a diferença, em pontos percentuais, entre o grupo mais favorecido (78%) e o menos favorecido (12%)?',
              answer: 66, unit: 'pontos', hints: ['78 − 12'],
              success: '78 − 12 = 66 pontos percentuais. Para estudantes com o mesmo interesse!'
            }
          ]
        },
        {
          id: 'm6c3', title: 'Etapa 3 · Identificar os grupos prejudicados', mech: 'Classificação', icon: 'users', xp: 110,
          intro: [{ who: 'lia', text: 'Com as evidências em mãos, quem está sendo prejudicado pela RUMO?' }],
          learn: 'Meninas, estudantes negros e negras, estudantes indígenas e de escolas públicas são prejudicados — e quem pertence a mais de um desses grupos é ainda mais afetado. Isso é a interseccionalidade.',
          steps: [
            {
              type: 'multi', title: 'Grupos prejudicados',
              q: 'Marque todos os grupos prejudicados pela RUMO, segundo as evidências.',
              options: [
                { t: 'Meninas.', ok: true },
                { t: 'Estudantes negros e negras.', ok: true },
                { t: 'Estudantes indígenas.', ok: true },
                { t: 'Estudantes de escolas públicas e de bairros periféricos.', ok: true },
                { t: 'Meninos brancos de escolas particulares.', ok: false, why: 'Pelas evidências, esse foi o grupo mais favorecido na recomendação de ciência e tecnologia. (Estereótipos também limitam meninos — por exemplo, raramente recebem indicação para pedagogia ou enfermagem —, mas esse não é o foco deste caso.)' },
                { t: 'Estudantes que gostam de música.', ok: false, why: 'Nenhuma evidência do caso fala sobre esse grupo.' }
              ]
            },
            {
              type: 'choice', title: 'Interseccionalidade',
              q: 'Por que as meninas negras de escola pública receberam a menor taxa de todas (12%)?',
              options: [
                { t: 'Porque diferentes desigualdades — de gênero, raça e tipo de escola — se somam dentro do algoritmo.', ok: true, why: 'Isso se chama interseccionalidade: quando várias formas de discriminação se cruzam, o prejuízo é maior.' },
                { t: 'Porque elas se interessam menos por tecnologia.', ok: false, why: 'Todos os estudantes do gráfico declararam interesse em tecnologia. A diferença está no algoritmo.' },
                { t: 'Por acaso: os números variam sozinhos.', ok: false, why: 'Uma diferença de 66 pontos, que segue o padrão dos critérios do algoritmo, não é acaso.' }
              ],
              bonus: 20
            }
          ]
        },
        {
          id: 'm6c4', title: 'Etapa 4 · Revisar os dados', mech: 'Arrastar ferramentas', icon: 'db', xp: 110,
          intro: [{ who: 'teo', text: 'A base de treino da RUMO precisa de revisão. Aplique a ação certa em cada item.' }],
          learn: 'A base da RUMO agora inclui estudantes de escolas públicas e de diferentes regiões, com histórico atualizado e rótulos corrigidos.',
          steps: [
            {
              type: 'datafix', title: 'Base de treino RUMO — revisão',
              text: 'Arraste a ação certa para cada item da base.',
              tools: [
                { id: 'add', label: 'Acrescentar exemplos', icon: 'plus' },
                { id: 'rotulo', label: 'Revisar rótulo', icon: 'tag' },
                { id: 'update', label: 'Atualizar dados antigos', icon: 'refresh' },
                { id: 'ok', label: 'Manter', icon: 'check' }
              ],
              rows: [
                { id: 'q1', icon: 'users', text: 'Estudantes de escolas públicas: 0% da base', tool: 'add', why: 'Um grupo totalmente ausente precisa ser incluído.' },
                { id: 'q2', icon: 'clock', text: 'Profissões de 1990–2010 (não inclui carreiras novas, como ciência de dados)', tool: 'update', why: 'Dados antigos repetem o passado e não incluem as profissões de hoje.' },
                { id: 'q3', spec: 's8 f a afro jacket c2', text: 'Ex-aluna que virou engenheira de software · Rótulo: “Secretária”', tool: 'rotulo', why: 'Rótulo errado e estereotipado.' },
                { id: 'q4', icon: 'globe', text: 'Estudantes das regiões Norte e Nordeste: 2% da base', tool: 'add', why: 'Grupos sub-representados precisam de mais exemplos.' },
                { id: 'q5', spec: 's4 m a short labcoat', text: 'Ex-aluno que virou médico · Rótulo: “Médico”', tool: 'ok', why: 'Exemplo correto: manter.' }
              ]
            }
          ]
        },
        {
          id: 'm6c5', title: 'Etapa 5 · Corrigir os critérios', mech: 'Editar regras', icon: 'cpu', xp: 110,
          intro: [{ who: 'lia', text: 'Agora, os critérios da RUMO. Marque e substitua as regras problemáticas.' }],
          learn: 'A RUMO agora recomenda com base nos interesses, no desempenho e nas escolhas de cada estudante — e apresenta várias possibilidades, em vez de um único “caminho provável”.',
          steps: [
            {
              type: 'rules', title: 'Algoritmo RUMO — critérios',
              text: 'Marque as regras problemáticas e escolha a melhor substituição.',
              rules: [
                { id: 'k1', code: 'peso(interesses_do_estudante) = BAIXO', bad: true, why: 'Os interesses deveriam ser centrais numa orientação profissional.',
                  options: [{ t: 'peso(interesses_do_estudante) = ALTO', ok: true }, { t: 'Remover os interesses do cálculo', ok: false, why: 'Sem interesses, a recomendação fica ainda mais baseada em estereótipos.' }] },
                { id: 'k2', code: 'SE gênero = feminino ENTÃO priorizar “áreas de cuidado”', bad: true, why: 'Estereótipo de gênero explícito.',
                  options: [{ t: 'Remover: gênero não define profissão.', ok: true }, { t: 'SE gênero = feminino ENTÃO priorizar “áreas criativas”', ok: false, why: 'Continua decidindo pelo gênero, só com outro estereótipo.' }] },
                { id: 'k3', code: 'SE CEP ∈ periferia ENTÃO reduzir cursos superiores', bad: true, why: 'O CEP funciona como atalho para raça e classe social.',
                  options: [{ t: 'Remover: o endereço não define capacidade.', ok: true }, { t: 'SE CEP ∈ periferia ENTÃO mostrar só cursos técnicos', ok: false, why: 'Continua limitando as opções pelo endereço.' }] },
                { id: 'k4', code: 'SE nota_matemática ≥ 8 ENTÃO incluir opções de exatas', bad: false, why: 'Usa o desempenho do estudante: critério adequado.' },
                { id: 'k5', code: 'Mostrar sempre várias opções e explicar por que foram sugeridas', bad: false, why: 'Transparência e variedade de opções: ótima regra.' }
              ],
              bonus: 20
            }
          ]
        },
        {
          id: 'm6c6', title: 'Etapa 6 · Testar os resultados', mech: 'Teste de perfis gêmeos', icon: 'flask', xp: 110,
          intro: [{ who: 'teo', text: 'Vamos testar a RUMO corrigida com perfis gêmeos: o mesmo estudante, mudando só UMA característica de cada vez. Se a recomendação mudar, o teste falhou.' }],
          learn: 'O teste revelou que o tipo de escola ainda mudava a recomendação — um viés que escapou da correção. É exatamente para isso que servem os testes: encontrar o que ainda precisa ser corrigido.',
          steps: [
            {
              type: 'twins', title: 'Laboratório de perfis gêmeos',
              text: 'Perfil base: estudante com notas 9 em Matemática e Ciências, interessado em programação e robótica. Rode cada teste e marque se ele PASSOU (recomendação igual) ou FALHOU (recomendação diferente).',
              base: 's6 n y short hoodie c2',
              tests: [
                { id: 'gen', label: 'Gênero', a: 'Menina', b: 'Menino', ra: 'Eng. de software · Ciência de dados · Robótica', rb: 'Eng. de software · Ciência de dados · Robótica', pass: true },
                { id: 'raca', label: 'Cor/raça autodeclarada', a: 'Preta', b: 'Branca', ra: 'Eng. de software · Ciência de dados · Robótica', rb: 'Eng. de software · Ciência de dados · Robótica', pass: true },
                { id: 'escola', label: 'Tipo de escola', a: 'Pública', b: 'Particular', ra: 'Técnico em informática · Suporte de TI', rb: 'Eng. de software · Ciência de dados · Robótica', pass: false },
                { id: 'regiao', label: 'Região', a: 'Norte', b: 'Sudeste', ra: 'Eng. de software · Ciência de dados · Robótica', rb: 'Eng. de software · Ciência de dados · Robótica', pass: true }
              ],
              hints: ['Compare as duas recomendações de cada teste palavra por palavra.']
            },
            {
              type: 'choice', title: 'O que fazer com o resultado?',
              q: 'Um dos testes falhou. O que a equipe deve fazer?',
              options: [
                { t: 'Voltar, investigar por que o tipo de escola ainda influencia, corrigir e testar de novo.', ok: true, why: 'Isso! Testar serve para encontrar falhas — e cada falha encontrada é uma chance de melhorar.' },
                { t: 'Aprovar assim mesmo: 3 de 4 testes passaram.', ok: false, why: 'O teste que falhou prejudica estudantes de escolas públicas. Não dá para ignorar.' },
                { t: 'Apagar o teste que falhou do relatório.', ok: false, why: 'Esconder resultados é antiético e mantém a injustiça.' }
              ]
            }
          ]
        },
        {
          id: 'm6c7', title: 'Etapa 7 · Elaborar a solução', mech: 'Plano + justificativa escrita', icon: 'book', xp: 110,
          intro: [{ who: 'lia', text: 'Última etapa, {nome}. Monte o plano de ação para a RUMO e escreva uma justificativa curta explicando a sua solução. É ela que vai para a FuturaEdu.' }],
          learn: 'Você completou a grande missão: investigou, analisou, corrigiu, testou e propôs uma solução fundamentada. Esse é o trabalho de uma especialista em IA responsável.',
          steps: [
            {
              type: 'sequence', title: 'Plano de ação',
              q: 'Organize o plano de ação para a RUMO, do primeiro ao último passo.',
              items: [
                { id: 'p1', t: 'Ouvir estudantes e professores afetados.' },
                { id: 'p2', t: 'Analisar os resultados separados por grupo.' },
                { id: 'p3', t: 'Revisar e ampliar a base de dados.' },
                { id: 'p4', t: 'Remover os critérios discriminatórios.' },
                { id: 'p5', t: 'Testar com perfis gêmeos e grupos diversos.' },
                { id: 'p6', t: 'Relançar com transparência e monitorar continuamente.' }
              ],
              hints: ['Siga a ordem das etapas desta missão.']
            },
            {
              type: 'write', title: 'Sua justificativa',
              q: 'Escreva uma justificativa curta (3 a 6 linhas) explicando a sua solução para a RUMO.',
              guide: ['Qual é o problema?', 'Quem está sendo prejudicado?', 'O que você corrigiu (dados e critérios)?', 'Como vai testar e acompanhar?'],
              min: 80,
              rubric: [
                { id: 'analise', label: 'Análise', desc: 'Identifica o problema e os grupos prejudicados.',
                  terms: ['menina', 'mulher', 'negr', 'indigen', 'escola publica', 'escolas publicas', 'periferi', 'grupo', 'estereotip', 'desigual', 'preconceit', 'discrimin', 'racis', 'vies', 'injust', 'prejudic', 'genero', 'raca', 'pobre', 'classe'] },
                { id: 'coerencia', label: 'Coerência', desc: 'Propõe ações ligadas ao problema (dados e critérios).',
                  terms: ['dado', 'base', 'exemplo', 'criterio', 'regra', 'cep', 'bairro', 'remov', 'corrig', 'revis', 'retir', 'troc', 'substitu', 'divers', 'represent', 'interess', 'tirar', 'mud'] },
                { id: 'compreensao', label: 'Compreensão', desc: 'Mostra que a IA precisa ser testada e acompanhada.',
                  terms: ['test', 'monitor', 'acompanh', 'avali', 'verific', 'audit', 'equipe', 'transparen', 'human', 'ouvir', 'escut', 'respons', 'continu', 'sempre', 'reclama', 'gemeo', 'medir', 'resultado'] }
              ]
            }
          ]
        }
      ]
    }
  ];

  window.GAME = {
    title: 'Treinando uma IA sem preconceitos',
    tagline: 'Uma missão pela tecnologia, diversidade e justiça digital.',
    version: '1.0',
    teacherPin: '2040',
    finalMessage: 'A tecnologia é criada por pessoas, alimentada por dados e utilizada pela sociedade. Construir tecnologias mais justas também é responsabilidade nossa.',
    simNote: SIM,
    characters, intro, levels, medals, achievements, inspirations, missions
  };
})();
