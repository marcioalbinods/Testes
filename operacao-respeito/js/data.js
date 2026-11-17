/* =========================================================
   OPERAÇÃO RESPEITO — Conteúdo do jogo
   5 operações • 30 fases • Dossiê Antirracista • Medalhas
   Todas as situações, pessoas e perfis são FICTÍCIOS.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- OPERAÇÕES ---------------- */
  const OPERATIONS = [
    {
      id: 1, name: 'Identificando o racismo', level: 'Nível fácil', color: '#f97316',
      desc: 'Aprenda a reconhecer manifestações de racismo em fotos, comentários e publicações da CONECTA.',
      done: 'Você aprendeu que o racismo nem sempre aparece como um xingamento: ele também se esconde em “opiniões”, “elogios” e generalizações. Reconhecer é o primeiro passo para combater.',
      medal: null
    },
    {
      id: 2, name: 'Investigando os memes', level: 'Fácil / intermediário', color: '#a855f7',
      desc: 'Descubra como o racismo pode se disfarçar de humor em memes, imagens e “brincadeiras”.',
      done: 'Você descobriu que a intenção de fazer rir não apaga o preconceito. Humor que ridiculariza a identidade negra é racismo recreativo — e compartilhar também é participar.',
      medal: 'memes'
    },
    {
      id: 3, name: 'O que você faria?', level: 'Nível intermediário', color: '#ec4899',
      desc: 'Tome decisões em situações reais da rede: intervir, acolher, denunciar e buscar ajuda com segurança.',
      done: 'Você aprendeu que agir contra o racismo não exige enfrentar o agressor sozinho. Acolher a vítima, não compartilhar, guardar evidências, denunciar e buscar adultos de confiança são atitudes poderosas.',
      medal: 'empatia'
    },
    {
      id: 4, name: 'Desmascarando o racismo', level: 'Intermediário / difícil', color: '#0ea5e9',
      desc: 'Investigue formas menos explícitas de racismo: padrões de beleza, naturalização e até algoritmos.',
      done: 'Você desmascarou formas sutis de racismo: o “eu não sou racista, mas…”, os padrões de beleza, o preconceito naturalizado e os vieses em tecnologias. Pensamento crítico é a sua melhor ferramenta.',
      medal: 'cidad'
    },
    {
      id: 5, name: 'Agentes da transformação', level: 'Nível difícil', color: '#22c55e',
      desc: 'Transforme conhecimento em atitude: responda com respeito, modere conteúdos e crie uma campanha.',
      done: 'Você transformou conhecimento em atitude antirracista. A internet que queremos é construída por pessoas que respeitam, acolhem e se posicionam.',
      medal: 'transf'
    }
  ];

  const MECH = {
    choice: 'Múltipla escolha', evidence: 'Investigação de evidências', comments: 'Identificação de comentários',
    segments: 'Elementos discriminatórios', classify: 'Classificação', match: 'Associação de conceitos',
    order: 'Ordenação de atitudes', decision: 'Tomada de decisão', moderation: 'Moderação de conteúdo',
    meme: 'Análise de meme', post: 'Análise de publicação', select: 'Seleção de atitudes', campaign: 'Campanha antirracista',
    case: 'Resolução de caso', reflection: 'Reflexão investigativa'
  };

  /* ---------------- FASES ---------------- */
  const PHASES = [
    /* ===================== OPERAÇÃO 01 ===================== */
    {
      id: 1, op: 1, title: 'O comentário sobre o cabelo', mech: ['choice'],
      brief: 'Agente, nossa primeira denúncia chegou! Malu publicou uma foto celebrando seu cabelo crespo natural. Um dos comentários recebeu muitas curtidas — e várias denúncias. Analise a evidência.',
      wrap: 'Cabelo crespo não é “ruim”, “rebelde” nem “desarrumado”. Ele é parte da identidade, da história e da beleza de muitas pessoas negras.',
      steps: [{
        type: 'choice',
        scene: {
          kind: 'post', who: 'malu', name: 'Malu Santos', handle: '@malu.crespa', time: '2 h',
          text: 'Primeiro dia indo pra escola com meu crespo solto! Levei um tempão pra me sentir assim. ✨👑', photo: 'selfie-crespo', likes: 248,
          comments: [
            { who: 'bia', name: 'Bia', text: 'Que lindo!! Tá maravilhosa 😍' },
            { who: 'anon', name: 'user_8841', text: 'Ficaria bem mais bonita se alisasse esse cabelo 😬', hl: true },
            { who: 'nina', name: 'Nina', text: 'Coroa mesmo! 👑' }
          ]
        },
        prompt: 'Por que o comentário destacado pode reproduzir um preconceito racial?',
        options: [
          { t: 'Porque trata o cabelo crespo — uma característica natural de muitas pessoas negras — como algo que precisa ser “corrigido” para ficar bonito.', ok: true,
            fb: 'Exatamente! O comentário parte da ideia de que só o cabelo liso é bonito. Esse padrão foi construído historicamente para desvalorizar os traços de pessoas negras. Valorizar o cabelo crespo é valorizar a identidade negra.' },
          { t: 'Porque é proibido comentar a aparência de qualquer pessoa na internet.',
            fb: 'Não é bem isso: um elogio também comenta a aparência. O problema aqui é outro — o comentário desvaloriza um traço natural ligado à identidade negra. Releia e tente de novo.' },
          { t: 'Não há problema: é apenas uma opinião sobre gosto pessoal.',
            fb: 'Cuidado: chamar de “gosto pessoal” esconde o padrão por trás do comentário. Dizer que uma pessoa negra só seria bonita alisando o cabelo reforça uma ideia racista de beleza — não é uma simples preferência.' },
          { t: 'Porque o usuário colocou um emoji no final do comentário.',
            fb: 'O emoji não é o centro do problema. Pense no que a frase diz sobre o cabelo crespo.' }
        ]
      }]
    },
    {
      id: 2, op: 1, title: 'A piada que não tem graça', mech: ['evidence', 'choice'], bonus: true,
      brief: 'Um perfil de estudantes publicou uma montagem “de humor”. Por segurança, a Agência ocultou a imagem. Abra as três evidências antes de dar o seu parecer.',
      wrap: 'Quando o “humor” usa traços físicos de um grupo racial para ridicularizá-lo, ele humilha pessoas reais. A risada coletiva não diminui a dor de quem é atingido.',
      steps: [
        {
          type: 'evidence', prompt: 'Abra e analise todas as evidências do caso.',
          files: [
            { icon: '🖼️', title: 'Evidência 1 — A montagem', body: '@censored|Montagem que exagera os lábios, o nariz e o cabelo de pessoas negras, transformando essas características em motivo de piada.|kkkk achei a foto do novo grupo da escola 😂' },
            { icon: '📊', title: 'Evidência 2 — Reações', body: '<p><strong>312</strong> reações de risada e <strong>47</strong> compartilhamentos em duas horas.</p><p>Comentários: “pesado kkk”, “manda no grupo”.</p><p>Três estudantes denunciaram a publicação.</p>' },
            { icon: '💬', title: 'Evidência 3 — Relato (fictício)', body: '<p>Uma estudante negra contou à orientadora da escola:</p><blockquote>“Fiquei com vergonha de ir pra aula no dia seguinte. Parecia que todo mundo estava rindo da gente.”</blockquote>' }
          ]
        },
        {
          type: 'choice', prompt: 'Com base nas evidências, qual é o principal problema da publicação?',
          options: [
            { t: 'Ela ridiculariza características físicas de pessoas negras, transformando a identidade de um grupo em piada e causando humilhação.', ok: true,
              fb: 'Isso mesmo, agente! A montagem usa traços de pessoas negras como “motivo de riso”. O relato mostra o efeito real: vergonha e exclusão. Isso é discriminação racial, não humor inocente.' },
            { t: 'O problema é só ter viralizado. Se pouca gente visse, estaria tudo bem.',
              fb: 'A viralização aumenta o dano, mas não cria o problema. Mesmo vista por poucas pessoas, a montagem continua ridicularizando pessoas negras.' },
            { t: 'O problema é a montagem ter sido feita com pouca qualidade.',
              fb: 'A qualidade da edição não importa aqui. Observe o que a montagem faz com as características das pessoas.' },
            { t: 'Não há problema, porque a montagem não cita o nome de ninguém.',
              fb: 'Não citar nomes não torna a montagem inofensiva: ela atinge todas as pessoas negras ao tratar seus traços como algo risível. O relato da Evidência 3 mostra isso.' }
          ]
        }
      ]
    },
    {
      id: 3, op: 1, title: 'Quem pode estar na foto?', mech: ['reflection', 'select'],
      brief: 'Uma empresa fictícia de tecnologia apresentou sua equipe de liderança. Alguns usuários perceberam algo e começaram a comentar. Um bom agente investiga com cuidado antes de concluir.',
      wrap: 'Representatividade importa: quando jovens negros não se veem em espaços de liderança, ciência e tecnologia, recebem a mensagem de que aquele lugar “não é para eles”. Investigar com dados é a postura de um bom agente.',
      steps: [
        {
          type: 'choice',
          scene: {
            kind: 'post', who: 'theo', name: 'Vértice Tech', handle: '@vertice.tech', time: '5 h', verified: true,
            text: 'Conheça quem lidera a inovação na Vértice Tech! 🚀 #NossaEquipe', photo: 'equipe-empresa', likes: 1032,
            comments: [
              { who: 'lia', name: 'Lia', text: 'Parabéns ao time! 👏' },
              { who: 'joao', name: 'João Pedro', text: 'Cadê a diversidade? 🤔 Nossa cidade é super diversa.' }
            ]
          },
          prompt: 'O que essa imagem, sozinha, permite concluir?',
          options: [
            { t: 'Ela mostra ausência de diversidade na liderança e merece reflexão — mas, sozinha, não prova que houve discriminação.', ok: true,
              fb: 'Ótima análise! A foto revela um problema de representatividade que merece ser questionado. Para saber se há discriminação, é preciso investigar mais: dados, processos de seleção, oportunidades.' },
            { t: 'Ela prova, sem dúvida nenhuma, que a empresa é racista.',
              fb: 'Calma, agente! Uma imagem isolada é uma pista, não uma prova. Ela levanta uma questão importante, mas uma conclusão exige mais evidências.' },
            { t: 'Não há nada para observar. Foto é só foto.',
              fb: 'Há algo, sim: todas as pessoas na liderança são brancas, num país em que a maioria da população é negra. Essa ausência merece reflexão.' },
            { t: 'Que pessoas negras não se interessam por tecnologia.',
              fb: 'Essa conclusão é um estereótipo! Existem muitas pessoas negras na ciência e na tecnologia. A ausência nas fotos pode indicar falta de oportunidades e barreiras — não falta de interesse.' }
          ]
        },
        {
          type: 'multi', layout: 'cards',
          prompt: 'Para investigar a fundo, quais perguntas um bom agente faria? Selecione TODAS as perguntas úteis.',
          items: [
            { t: 'Quantas pessoas negras trabalham na empresa e em quais cargos?', ok: true, fb: 'Dados sobre cargos mostram se há desigualdade de oportunidades.' },
            { t: 'Como funcionam os processos de seleção e de promoção?', ok: true, fb: 'Processos de seleção podem ter barreiras que excluem pessoas negras.' },
            { t: 'A empresa tem ações para ampliar a diversidade?', ok: true, fb: 'Ações afirmativas e metas de diversidade mostram compromisso com a igualdade.' },
            { t: 'No Brasil, onde mais da metade da população é negra, essa ausência na liderança é comum?', ok: true, fb: 'Sim! Segundo o Censo 2022 do IBGE, 55,5% da população se declara preta ou parda, mas pessoas negras ainda são minoria em cargos de liderança.' },
            { t: 'Quantas curtidas a foto recebeu?', ok: false, fb: 'O número de curtidas não ajuda a entender a representatividade da equipe.' },
            { t: 'Qual filtro foi usado na foto?', ok: false, fb: 'O filtro da foto não tem relação com a diversidade da equipe.' }
          ]
        }
      ]
    },
    {
      id: 4, op: 1, title: 'O comentário disfarçado', mech: ['segments', 'choice'],
      brief: 'João Pedro postou uma foto antes da apresentação na feira de ciências. Um comentário começou “educado”, mas recebeu denúncias. Encontre os trechos problemáticos.',
      wrap: 'Preconceito disfarçado de “opinião sincera” continua sendo preconceito. Associar cabelo afro a desleixo é desvalorizar a identidade negra.',
      steps: [
        {
          type: 'multi', layout: 'segments',
          scene: { kind: 'post', who: 'joao', name: 'João Pedro', handle: '@jp.cientista', time: '1 h', text: 'Hoje é dia de apresentar nosso projeto de energia solar! Torçam por nós! ☀️🔬', photo: 'black-power', likes: 87, comments: [] },
          commenter: { who: 'anon2', name: 'olhar.sincero' },
          prompt: 'Toque nos trechos do comentário que transformam uma característica natural em algo negativo.',
          items: [
            { t: 'Só uma opinião sincera:', ok: false, fb: 'Esse trecho é o “disfarce”: ele tenta fazer o que vem depois parecer inofensivo. Sozinho, não é a parte discriminatória.' },
            { t: 'você parece inteligente,', ok: false, fb: 'Esse trecho é um elogio. Mas atenção: ele prepara o “mas” que vem a seguir.' },
            { t: 'mas com esse cabelo parece desleixado.', ok: true, fb: 'Aqui o comentário associa o cabelo afro a desleixo — um preconceito racial.' },
            { t: 'Se raspasse, passaria uma imagem mais séria.', ok: true, fb: 'Sugerir apagar um traço natural para “parecer sério” é dizer que a identidade negra não combina com seriedade.' },
            { t: 'Boa sorte na feira!', ok: false, fb: 'Um desejo de boa sorte não é problemático.' }
          ]
        },
        {
          type: 'choice', prompt: 'Por que chamar de “opinião sincera” não torna o comentário aceitável?',
          options: [
            { t: 'Porque o rótulo “opinião” não muda o conteúdo: associar o cabelo afro a desleixo é um preconceito racial, não um gosto neutro.', ok: true,
              fb: 'Perfeito! Racismo não é questão de opinião. Um comentário não deixa de ser discriminatório só porque foi apresentado com educação ou com elogios.' },
            { t: 'Porque opiniões nunca podem ser publicadas nas redes sociais.',
              fb: 'Opiniões podem ser publicadas, sim. O problema é quando a “opinião” desvaloriza pessoas por suas características raciais.' },
            { t: 'Na verdade é aceitável, porque começou com um elogio.',
              fb: 'O elogio no início não apaga o preconceito que vem depois. Essa estrutura “elogio + mas” é muito comum em preconceitos disfarçados.' },
            { t: 'Porque o comentário ficou longo demais.',
              fb: 'O tamanho não é o problema. Observe o que o comentário diz sobre o cabelo do João.' }
          ]
        }
      ]
    },
    {
      id: 5, op: 1, title: 'A generalização', mech: ['classify'],
      brief: 'O sistema da CONECTA recebeu seis frases denunciadas. Algumas atribuem características negativas a um grupo racial inteiro. Classifique cada uma.',
      wrap: 'Generalizar é atribuir uma característica a TODAS as pessoas de um grupo. Quando isso é feito com base na raça ou cor, é discriminação: cada pessoa é única.',
      steps: [{
        type: 'classify',
        prompt: 'Classifique cada frase: ela traz uma generalização racial discriminatória?',
        cats: [
          { id: 'gen', label: 'Generalização discriminatória', icon: '⚠️', cls: 'bad' },
          { id: 'nao', label: 'Não é generalização racial', icon: '✔️', cls: 'good' }
        ],
        items: [
          { t: '“Não adianta, esse povo de pele escura é tudo igual: sempre arruma confusão.”', a: 'gen', fb: 'Atribui um comportamento negativo a todas as pessoas negras. Isso é generalização racista.' },
          { t: '“O jogador @raio_77 foi grosseiro comigo na partida de ontem.”', a: 'nao', fb: 'É uma crítica a uma atitude de UMA pessoa específica, sem relação com raça.' },
          { t: '“Meninas negras são sempre ‘barraqueiras’, nem adianta conversar.”', a: 'gen', fb: 'Esse é um estereótipo antigo que atinge mulheres negras, tratando-as como agressivas. É generalização discriminatória.' },
          { t: '“Pesquisas do IBGE mostram que, em média, pessoas negras recebem salários menores que pessoas brancas no Brasil.”', a: 'nao', fb: 'É um dado sobre desigualdade social — ele denuncia o racismo, não atribui um defeito a um grupo.' },
          { t: '“Sumiu meu fone. Com certeza foi alguém ‘daquele tipo’, vocês sabem de quem estou falando.”', a: 'gen', fb: 'É uma acusação sem provas que insinua a culpa de pessoas negras. A generalização está escondida no “daquele tipo”.' },
          { t: '“Meu time perdeu porque o goleiro falhou no último minuto.”', a: 'nao', fb: 'Comentário sobre futebol, sem relação com raça ou cor.' }
        ]
      }]
    },
    {
      id: 6, op: 1, title: 'Investigação concluída', mech: ['comments', 'choice'], bonus: true,
      brief: 'Caso de encerramento da Operação 01! Gabi postou o vídeo do grupo de dança afro da escola. A publicação recebeu seis comentários. Separe o que é racismo do que é opinião legítima.',
      wrap: 'Nem todo comentário crítico é racista, mas o racismo também aparece em “elogios”, em desprezo pela cultura afro-brasileira e por religiões de matriz africana. Saber diferenciar é coisa de agente.',
      steps: [
        {
          type: 'multi', layout: 'comments',
          scene: { kind: 'post', who: 'gabi', name: 'Gabi Oliveira', handle: '@gabi.danca', time: '3 h', text: 'Nosso primeiro vídeo de dança afro! Foram 3 meses de ensaio 🥁✨ #DançaAfro #Cultura', photo: 'festa', likes: 412 },
          prompt: 'Toque em TODOS os comentários que apresentam manifestações de racismo.',
          items: [
            { who: 'bia', name: 'Bia', t: 'Que energia!! Vocês arrasaram 👏', ok: false, fb: 'Comentário de apoio e admiração.' },
            { who: 'anon', name: 'zueiro_99', t: 'Isso aí é coisa de macumba, credo 🙄', ok: true, fb: 'Usa “macumba” de forma pejorativa e trata expressões culturais e religiosas de matriz africana como algo ruim. Isso é racismo religioso.' },
            { who: 'theo', name: 'Theo', t: 'Achei o som um pouco alto pro meu gosto, mas a coreografia ficou incrível.', ok: false, fb: 'É uma opinião sobre o volume do som, sem desvalorizar ninguém por sua raça ou cultura.' },
            { who: 'anon2', name: 'carlos.mm', t: 'Até que você é bonita pra uma menina tão escura.', ok: true, fb: 'Parece um elogio, mas sugere que a pele escura seria um “defeito”. Isso se chama colorismo, uma forma de racismo.' },
            { who: 'yasmin', name: 'Yasmin', t: 'Qual é o nome dessa música? Quero aprender a coreografia!', ok: false, fb: 'Interesse genuíno pela cultura — ótimo!' },
            { who: 'anon', name: 'tiago_x', t: 'Dança afro é muito estranho, dança uma coisa normal aí.', ok: true, fb: 'Trata a cultura afro-brasileira como “anormal”, como se apenas outras culturas fossem o padrão. É desvalorização cultural racista.' }
          ]
        },
        {
          type: 'choice', prompt: 'O comentário “Até que você é bonita pra uma menina tão escura” parece um elogio. Por que ele é racista?',
          options: [
            { t: 'Porque sugere que a pele escura seria um defeito e que a beleza da Gabi seria uma “exceção”. Isso é colorismo.', ok: true,
              fb: 'Isso mesmo! O colorismo é uma forma de racismo que discrimina mais intensamente pessoas de pele mais escura. Um “elogio” que inferioriza não é elogio.' },
            { t: 'Porque todo elogio na internet é falso.', fb: 'Muitos elogios são sinceros e bem-vindos! O problema está no “até que… pra uma menina tão escura”.' },
            { t: 'Ele não é racista: é apenas um elogio.', fb: 'Releia o “até que” e o “pra uma menina tão escura”. A frase supõe que pele escura e beleza não combinam.' },
            { t: 'Porque o comentário foi escrito sem emojis.', fb: 'Emojis não são o problema. Observe o que a frase diz sobre a cor da pele.' }
          ]
        }
      ]
    },

    /* ===================== OPERAÇÃO 02 ===================== */
    {
      id: 7, op: 2, title: 'É só uma brincadeira?', mech: ['meme', 'choice'],
      brief: 'Um meme está circulando muito rápido na CONECTA. O autor se defende dizendo que é “só uma brincadeira”. A imagem foi ocultada pela Agência — leia a descrição da evidência.',
      wrap: 'A intenção de fazer rir não apaga o efeito do preconceito. Humor que ridiculariza a identidade negra tem nome: racismo recreativo.',
      steps: [
        {
          type: 'choice',
          scene: {
            kind: 'post', who: 'anon', name: 'zoeira.total', handle: '@zoeira.total', time: '40 min', likes: 2304,
            text: 'kkkkkk não aguento 😂 #sóbrincadeira',
            censored: { desc: 'Meme que coloca a foto de uma garota de cabelo afro ao lado de um objeto de limpeza, sugerindo que o cabelo dela seria “áspero” e “sujo”.', caption: 'quando ela diz que lavou o cabelo 😂' },
            comments: [{ who: 'anon2', name: 'rafa_r', text: 'Ah, é só zoeira. Quem se ofende é chato.', hl: true }]
          },
          prompt: 'O autor diz que é “só uma brincadeira”. Qual análise está correta?',
          options: [
            { t: 'A intenção de fazer rir não apaga o efeito: o meme reforça a ideia racista de que o cabelo crespo é “sujo” ou “feio” e atinge pessoas reais.', ok: true,
              fb: 'Análise certeira! O que importa é o efeito do conteúdo: ele humilha a garota e reforça um preconceito contra todas as pessoas de cabelo crespo.' },
            { t: 'Se a intenção era só brincar, então não é preconceito.', fb: 'A intenção não muda o efeito. Um conteúdo pode machucar e reforçar o racismo mesmo quando a pessoa diz que “só queria brincar”.' },
            { t: 'Só seria racismo se a garota da foto reclamasse.', fb: 'O racismo não depende de a vítima reclamar. Muitas vezes, ela se cala por medo ou vergonha. O conteúdo é discriminatório de qualquer forma.' },
            { t: 'Quem se ofende é que precisa aprender a levar na esportiva.', fb: 'Esse argumento transfere a culpa para quem foi atingido. O problema é o conteúdo racista, não a reação de quem sofre com ele.' }
          ]
        },
        {
          type: 'choice', prompt: 'Esse tipo de “humor” que usa a identidade negra como motivo de piada tem um nome. Qual?',
          options: [
            { t: 'Racismo recreativo.', ok: true, fb: 'Correto! O conceito, estudado pelo jurista brasileiro Adilson Moreira, mostra como piadas e “brincadeiras” racistas mantêm o desprezo por pessoas negras de forma aparentemente “leve”. A lei brasileira, inclusive, aumenta a pena do crime de racismo quando ele é cometido em contexto de “diversão”.' },
            { t: 'Liberdade de expressão.', fb: 'A liberdade de expressão é um direito importante, mas não protege a discriminação racial. No Brasil, o racismo é crime.' },
            { t: 'Crítica construtiva.', fb: 'Uma crítica construtiva ajuda alguém a melhorar algo. O meme apenas ridiculariza uma característica natural.' },
            { t: 'Humor inteligente.', fb: 'Humor inteligente não precisa humilhar ninguém por sua cor ou cabelo.' }
          ]
        }
      ]
    },
    {
      id: 8, op: 2, title: 'O estereótipo escondido', mech: ['meme', 'match'],
      brief: 'Uma imagem de “jogo de adivinhação” viralizou. Ela parece inocente, mas a Agência detectou um estereótipo escondido. Associe cada elemento ao que ele comunica.',
      wrap: 'Estereótipos que associam pessoas negras ao crime têm consequências reais: muitas pessoas negras relatam ser seguidas em lojas ou tratadas como suspeitas sem ter feito nada.',
      steps: [{
        type: 'match',
        scene: {
          kind: 'post', who: 'anon2', name: 'humor.diario', handle: '@humor.diario', time: '1 d', likes: 8930,
          text: 'Nem precisa pensar 😂😂',
          censored: { desc: 'Ilustração com quatro personagens. Apenas o personagem negro aparece com roupa de presidiário, sob o título “Adivinhe quem pegou o celular”.', caption: 'Adivinhe quem pegou o celular' }
        },
        prompt: 'Toque em um elemento da imagem e depois no significado correspondente.',
        left: [
          'Só o personagem negro aparece como suspeito',
          'O título “Adivinhe quem pegou o celular”',
          'A legenda “Nem precisa pensar 😂”',
          'Os milhares de compartilhamentos'
        ],
        right: [
          'Reforça o estereótipo que associa pessoas negras ao crime',
          'Induz o público a culpar alguém pela cor da pele, sem nenhuma prova',
          'Apresenta o preconceito como algo “óbvio” e engraçado, naturalizando-o',
          'Espalham o estereótipo e ampliam o dano para muitas pessoas'
        ],
        fb: [
          'Representar apenas a pessoa negra como suspeita reproduz um estereótipo de criminalidade.',
          'O “jogo” convida a julgar pela aparência e pela cor — sem fatos.',
          'Tratar o preconceito como “óbvio” e risível é uma forma de naturalizá-lo.',
          'Cada compartilhamento leva o estereótipo a mais pessoas.'
        ]
      }]
    },
    {
      id: 9, op: 2, title: 'Compartilhar também é participar?', mech: ['decision'],
      brief: 'No grupo do time de vôlei, Theo repassou um meme discriminatório. Quando foi questionado, disse que não tinha culpa porque “não foi ele que fez”. Avalie.',
      wrap: 'Compartilhar também é participar. Cada repasse ajuda um conteúdo discriminatório a alcançar e ferir mais pessoas. E a lei brasileira aumenta a pena do racismo praticado por redes sociais.',
      steps: [
        {
          type: 'choice',
          scene: {
            kind: 'chat', title: 'Galera do Vôlei 🏐', members: '14 participantes',
            messages: [
              { who: 'theo', name: 'Theo', censored: 'Meme que ridiculariza o cabelo e a cor de pessoas negras', t: 'kkkkk olha esse' },
              { who: 'lia', name: 'Lia', t: 'Theo, isso é bem racista… 😕' },
              { who: 'theo', name: 'Theo', t: 'Ué, não fui eu que fiz. Só repassei. Não tenho culpa.' }
            ]
          },
          prompt: 'Theo tem razão ao dizer que não é responsável?',
          options: [
            { t: 'Não. Ao compartilhar, Theo ajudou o conteúdo discriminatório a chegar a mais pessoas. Compartilhar também é participar.', ok: true,
              fb: 'Exatamente! Quem repassa ajuda o preconceito a circular. A responsabilidade digital vale para o que criamos E para o que espalhamos.' },
            { t: 'Sim. Só quem cria um conteúdo é responsável por ele.', fb: 'Se ninguém repassasse, o conteúdo não chegaria tão longe. Quem compartilha também tem responsabilidade.' },
            { t: 'Sim, porque um grupo fechado é um espaço privado.', fb: 'Mesmo em grupos fechados, as mensagens atingem pessoas reais, podem ser repassadas e geram danos. Grupo privado não é “terra sem lei”.' },
            { t: 'Só teria responsabilidade se ganhasse dinheiro com o meme.', fb: 'A responsabilidade não depende de lucro. O dano às pessoas atingidas acontece de qualquer forma.' }
          ]
        },
        {
          type: 'choice', prompt: 'O que Theo poderia fazer agora para agir com responsabilidade?',
          options: [
            { t: 'Apagar a mensagem, reconhecer no grupo que errou e não repassar mais conteúdos assim.', ok: true, fb: 'Reconhecer o erro e corrigir a atitude é sinal de maturidade. Todos podemos aprender e mudar.' },
            { t: 'Mandar outro meme para mudar de assunto.', fb: 'Mudar de assunto não desfaz o que foi compartilhado. O conteúdo continua no grupo.' },
            { t: 'Sair do grupo sem falar nada.', fb: 'Sair do grupo deixa o meme circulando e não repara o erro.' },
            { t: 'Ficar bravo com a Lia por tê-lo questionado.', fb: 'A Lia agiu com responsabilidade ao apontar o problema. Ela merece apoio, não ataques.' }
          ]
        }
      ]
    },
    {
      id: 10, op: 2, title: 'O humor tem limites?', mech: ['classify'],
      brief: 'Três vídeos foram denunciados na aba “Humor” da CONECTA. Nem todo humor é problemático! Sua missão é distinguir humor respeitoso de conteúdo discriminatório.',
      wrap: 'O humor respeitoso ri de situações e ri JUNTO. O humor discriminatório ri DE um grupo, usando sua cor, cabelo ou cultura como motivo de piada.',
      steps: [{
        type: 'classify',
        prompt: 'Classifique cada situação.',
        cats: [
          { id: 'ok', label: 'Humor respeitoso', icon: '😄', cls: 'good' },
          { id: 'bad', label: 'Conteúdo discriminatório', icon: '🚫', cls: 'bad' }
        ],
        items: [
          { t: '🎤 Um comediante negro conta, no palco, a confusão que a família dele faz para decidir quem lava a louça no almoço de domingo.', a: 'ok', fb: 'O humor vem de uma situação familiar comum, que muitas pessoas reconhecem. Ninguém é ridicularizado por sua raça.' },
          { t: '🎭 Um vídeo mostra uma pessoa branca com o rosto pintado de escuro e uma peruca afro, imitando de forma exagerada o jeito de falar de pessoas negras.', a: 'bad', fb: 'Isso é blackface: a prática de pintar o rosto para caricaturar pessoas negras. Ela tem uma longa história de ridicularização e é racista.' },
          { t: '🐱 Um vídeo mostra um gato derrubando um copo da mesa, com a legenda “eu na segunda-feira”.', a: 'ok', fb: 'Humor sobre uma situação do dia a dia, sem atingir nenhum grupo.' }
        ]
      }]
    },
    {
      id: 11, op: 2, title: 'Analisando a publicação', mech: ['post', 'choice'], bonus: true,
      brief: 'Uma publicação completa de Carnaval foi denunciada. Analise TODOS os elementos: imagem, legenda, hashtags, localização e comentários. Nem tudo é problemático!',
      wrap: 'Fantasias que pintam o rosto de preto e exageram traços negros (blackface) transformam a identidade negra em caricatura. Cultura não é fantasia.',
      steps: [
        {
          type: 'multi', layout: 'post',
          scene: { kind: 'post', who: 'davi', name: 'Folia da Galera', handle: '@folia.galera', time: '2 d', likes: 640 },
          prompt: 'Toque em TODOS os elementos problemáticos desta publicação.',
          items: [
            { part: 'image', t: 'Foto de pessoas brancas com o rosto pintado de preto, perucas afro e roupas exageradas, posando para fazer rir.', ok: true, fb: 'A imagem mostra blackface: caricaturar pessoas negras como fantasia.' },
            { part: 'caption', t: 'Nossa fantasia de bloco esse ano 😂🤣 Ficou perfeita!', ok: true, fb: 'A legenda apresenta a caricatura como algo engraçado e “perfeito”.' },
            { part: 'location', t: '📍 Bloco da Praça Central', ok: false, fb: 'A localização, sozinha, não é problemática.' },
            { part: 'tags', t: '#carnaval #bloco #folia', ok: false, fb: 'Hashtags de Carnaval não são problemáticas por si só.' },
            { part: 'comment', who: 'anon', name: 'leo.k', t: 'kkkk ficou idêntico!', ok: true, fb: 'Dizer que a caricatura ficou “idêntica” reforça a ideia de que pessoas negras seriam aquilo.' },
            { part: 'comment', who: 'nina', name: 'Nina', t: 'Gente, isso é blackface. Não é fantasia, é ofensa. 😔', ok: false, fb: 'Esse comentário é uma crítica respeitosa e educativa. Ótima atitude!' },
            { part: 'comment', who: 'anon2', name: 'duda.f', t: 'Bora fazer igual no próximo bloco!', ok: true, fb: 'Incentivar que outras pessoas repitam a caricatura espalha o preconceito.' }
          ]
        },
        {
          type: 'choice', prompt: 'A publicação não tem nenhuma palavra ofensiva. Por que ela é discriminatória mesmo assim?',
          options: [
            { t: 'Porque pintar o rosto de preto e exagerar traços negros para fazer rir transforma a identidade negra em caricatura, uma prática com longa história de ridicularização.', ok: true, fb: 'Exato! O racismo pode estar na imagem, e não apenas nas palavras. Identidade negra não é fantasia.' },
            { t: 'Ela não é discriminatória: no Carnaval tudo é permitido.', fb: 'O Carnaval é uma festa de enorme importância cultural — inclusive para a cultura negra —, mas não autoriza a discriminação.' },
            { t: 'Porque as fantasias eram caras demais.', fb: 'O preço da fantasia não tem relação com o problema. Observe o que a fantasia representa.' },
            { t: 'Porque usar perucas é proibido.', fb: 'Perucas não são proibidas. O problema é usar a aparência de pessoas negras como caricatura.' }
          ]
        }
      ]
    },
    {
      id: 12, op: 2, title: 'Detetive dos memes', mech: ['classify'], bonus: true,
      brief: 'Desafio final da Operação 02! Quatro publicações chegaram à central. Classifique cada uma como Respeitosa, Merece reflexão ou Discriminatória.',
      wrap: 'Um bom detetive dos memes analisa o conteúdo, o contexto e o efeito. Alguns conteúdos não são intencionalmente ofensivos, mas reforçam padrões — e por isso merecem reflexão.',
      steps: [{
        type: 'classify',
        prompt: 'Classifique as quatro publicações.',
        cats: [
          { id: 'res', label: 'Respeitosa', icon: '💚', cls: 'good' },
          { id: 'ref', label: 'Merece reflexão', icon: '🤔', cls: 'warn' },
          { id: 'dis', label: 'Discriminatória', icon: '🚫', cls: 'bad' }
        ],
        items: [
          { t: '👑 “Tranças nagô, twists, black power, coque afro: qual é o seu favorito?” — com fotos de jovens negros com diferentes penteados.', a: 'res', fb: 'Valoriza a diversidade dos cabelos afro e a identidade negra.' },
          { t: '🌧️ Meme “Meu cabelo em dia de chuva” que usa sempre a foto de uma pessoa de cabelo crespo volumoso como exemplo de cabelo “bagunçado”.', a: 'ref', fb: 'Pode não ter a intenção de ofender, mas reforça a ideia de que o cabelo crespo é “desarrumado”. Merece reflexão.' },
          { t: '🍳 Meme com a foto de uma mulher negra cozinhando e a legenda “achei o emprego dela no futuro”, marcando uma colega negra.', a: 'dis', fb: 'Associa pessoas negras a funções subalternas, como se não pudessem ocupar outros espaços. É discriminatório.' },
          { t: '📝 Meme “Quando a professora diz ‘prova surpresa’ 😱” com ilustração de estudantes de vários tons de pele.', a: 'res', fb: 'Humor sobre a vida escolar, com representação diversa e respeitosa.' }
        ]
      }]
    },

    /* ===================== OPERAÇÃO 03 ===================== */
    {
      id: 13, op: 3, title: 'No grupo da turma', mech: ['decision'],
      brief: 'Alerta urgente! No grupo de mensagens do 7º B, Caio postou uma montagem racista com a foto de um colega, o Bento. Logo depois, Bento saiu do grupo. Você está no grupo. Como agir?',
      wrap: 'Diante do racismo em grupos: não ria, não repasse, posicione-se se for seguro, apoie a vítima em privado e leve o caso a um adulto de confiança.',
      steps: [
        {
          type: 'choice',
          scene: {
            kind: 'chat', title: '7º B 📚', members: '32 participantes',
            messages: [
              { who: 'caio', name: 'Caio', t: 'Gente, olhem o que eu fiz com a foto do Bento kkkkk', censored: 'Montagem com a foto de Bento, colega negro da turma, comparando-o a um animal' },
              { who: 'davi', name: 'Davi', t: '😂😂😂' },
              { who: 'kaua', name: 'Kauã', t: 'pesado mano' },
              { sys: true, t: 'Bento saiu do grupo' }
            ]
          },
          prompt: 'Qual é a sua PRIMEIRA atitude?',
          options: [
            { t: 'Não reagir com risadas, não repassar e — se me sentir seguro — escrever no grupo: “Isso não é engraçado, é racismo. Apaga, Caio.”', ok: true, fb: 'Ótima decisão! Você interrompe a “plateia” que incentiva o agressor, sem ofensas e sem espalhar o conteúdo.' },
            { t: 'Mandar um “kkk” para não ficar de fora.', fb: 'Rir, mesmo que “só para não ficar de fora”, mostra ao agressor que a montagem foi aceita. Isso aumenta a dor do Bento.' },
            { t: 'Encaminhar para outros grupos para todo mundo ver o absurdo.', fb: 'Mesmo com boa intenção, repassar espalha a montagem e expõe ainda mais o Bento.' },
            { t: 'Xingar o Caio no grupo.', fb: 'Responder com ofensas pode piorar o conflito e tirar o foco do Bento. É possível se posicionar com firmeza sem agredir.' }
          ]
        },
        {
          type: 'choice', prompt: 'O Bento saiu do grupo. E agora, qual é o próximo passo?',
          options: [
            { t: 'Mandar uma mensagem privada de apoio ao Bento e, com um print guardado, contar a um(a) professor(a) ou à coordenação.', ok: true, fb: 'Perfeito! A vítima precisa saber que não está sozinha, e a escola precisa saber para agir. Você não precisa resolver tudo sozinho.' },
            { t: 'Fingir que nada aconteceu: amanhã todo mundo esquece.', fb: 'O Bento não vai esquecer facilmente. O silêncio deixa a vítima sozinha e o agressor sem limites.' },
            { t: 'Postar o print no meu perfil público para expor o Caio.', fb: 'Expor publicamente espalha a montagem e expõe o Bento de novo. As evidências devem ir para quem pode agir: adultos responsáveis e canais de denúncia.' },
            { t: 'Perguntar ao Bento, no grupo da turma, se ele ficou chateado.', fb: 'Perguntar no grupo expõe o Bento na frente de todos. O apoio deve ser oferecido em privado.' }
          ]
        }
      ]
    },
    {
      id: 14, op: 3, title: 'Você presenciou o racismo', mech: ['select'],
      brief: 'Nina passou na seletiva do time de basquete e postou a conquista. Um comentário racista apareceu. Existem várias formas responsáveis de intervir. Encontre todas.',
      wrap: 'Intervir não é só “responder ao agressor”: denunciar, apoiar publicamente a vítima e conversar com ela em privado também são formas poderosas — e seguras — de agir.',
      steps: [{
        type: 'multi', layout: 'cards',
        scene: {
          kind: 'post', who: 'nina', name: 'Nina Ferreira', handle: '@nina.cesta', time: '30 min', likes: 156,
          text: 'PASSEI NA SELETIVA DO TIME DE BASQUETE!!! 🏀🔥 Treinei o ano inteiro pra isso.', photo: 'trancas', photoCap: 'Agora é oficial: camisa 23! 🏀',
          comments: [{ who: 'anon', name: 'fulano_22', text: 'Claro, né. Pra isso vocês são bons.', hl: true }]
        },
        prompt: 'Selecione TODAS as formas responsáveis de intervir.',
        items: [
          { t: 'Denunciar o comentário usando a ferramenta da plataforma.', ok: true, fb: 'A denúncia é rápida e, na maioria das plataformas, quem denuncia não é identificado.' },
          { t: 'Deixar um comentário de apoio valorizando o esforço da Nina.', ok: true, fb: 'Mostrar apoio público ajuda a vítima a se sentir acolhida e mostra que o racismo não é aceito ali.' },
          { t: 'Responder com calma: “Esse comentário reforça um estereótipo racial. A Nina passou por esforço e talento.”', ok: true, fb: 'Uma resposta firme e educativa, sem ofensas, pode fazer outras pessoas refletirem — se você se sentir seguro para isso.' },
          { t: 'Mandar mensagem privada para a Nina e perguntar como ela prefere ser apoiada.', ok: true, fb: 'Respeitar o que a vítima deseja é essencial para um apoio verdadeiro.' },
          { t: 'Responder com xingamentos ao autor do comentário.', ok: false, fb: 'Xingar pode gerar mais ataques e tirar o foco da conquista da Nina.' },
          { t: 'Curtir o comentário “só de brincadeira”.', ok: false, fb: 'Curtir um comentário racista dá força a ele, mesmo que seja “de brincadeira”.' },
          { t: 'Marcar a escola inteira na publicação para todos verem a confusão.', ok: false, fb: 'Isso transforma a conquista da Nina num espetáculo e a expõe ainda mais.' }
        ]
      }]
    },
    {
      id: 15, op: 3, title: 'A vítima precisa de apoio', mech: ['decision'],
      brief: 'Kauã, seu colega, mandou uma mensagem privada. Ele está recebendo ataques racistas há uma semana. Cada resposta sua importa. Escolha com cuidado.',
      wrap: 'Acolher é ouvir sem julgar, dizer que a culpa não é da vítima, respeitar suas decisões e ajudá-la a buscar apoio. A vítima não precisa “explicar” o racismo para ninguém.',
      steps: [
        {
          type: 'choice',
          scene: { kind: 'chat', title: 'Kauã', members: 'conversa privada', messages: [{ who: 'kaua', name: 'Kauã', t: 'Oi… posso te contar uma coisa? Tão mandando mensagens me zoando por causa da minha cor. Já faz uma semana. 😞' }] },
          prompt: 'Escolha a sua resposta para o Kauã:',
          options: [
            { t: '“Que bom que você me contou. Sinto muito que esteja passando por isso. Você não tem culpa nenhuma.”', ok: true, fb: 'Acolhimento perfeito! Você valoriza a confiança dele e deixa claro que a culpa é de quem pratica o racismo.' },
            { t: '“Ah, ignora, isso é bobeira.”', fb: 'Chamar de “bobeira” minimiza a dor do Kauã. O racismo machuca e precisa ser levado a sério.' },
            { t: '“Você deve ter feito alguma coisa pra provocar.”', fb: 'Isso culpa a vítima. Nada justifica o racismo.' },
            { t: '“Me manda os prints que eu posto nos stories pra todo mundo ver!”', fb: 'Expor sem a permissão do Kauã pode aumentar a humilhação dele. Primeiro, acolha.' }
          ]
        },
        {
          type: 'choice',
          scene: { kind: 'chat', title: 'Kauã', members: 'conversa privada', messages: [{ who: 'kaua', name: 'Kauã', t: 'Valeu… mas tô com vergonha de contar pra alguém da escola.' }] },
          prompt: 'Como você responde?',
          options: [
            { t: '“Entendo. Se quiser, posso ir com você conversar com um(a) professor(a) de confiança. Você não precisa enfrentar isso sozinho.”', ok: true, fb: 'Você respeita o sentimento dele e oferece companhia para buscar ajuda. Isso faz toda a diferença.' },
            { t: '“Então não conta pra ninguém. Esconder é melhor.”', fb: 'Esconder deixa o Kauã sozinho e permite que os ataques continuem. Adultos de confiança podem ajudar.' },
            { t: '“Você devia explicar pra turma inteira o que é racismo.”', fb: 'Não é responsabilidade da vítima ensinar os outros sobre racismo. Essa tarefa é de todos, especialmente da escola.' },
            { t: '“Deixa que eu conto pra todo mundo agora mesmo, sem você saber como.”', fb: 'Decidir pela vítima, sem o consentimento dela, pode deixá-la ainda mais exposta. Combine junto com ele.' }
          ]
        },
        {
          type: 'choice',
          scene: { kind: 'chat', title: 'Kauã', members: 'conversa privada', messages: [{ who: 'kaua', name: 'Kauã', t: 'Tá bom, vamos juntos amanhã. E o que eu faço com as mensagens?' }] },
          prompt: 'Qual orientação é a mais adequada?',
          options: [
            { t: '“Não responda às ofensas. Tire prints com data e nome de quem enviou, guarde, bloqueie e denuncie na plataforma. Depois mostramos tudo à escola.”', ok: true, fb: 'Orientação completa e segura! Evidências guardadas ajudam a escola, a família e, se necessário, as autoridades a agir.' },
            { t: '“Apaga tudo e tenta esquecer.”', fb: 'Apagar elimina as provas. É melhor guardar as evidências antes de bloquear.' },
            { t: '“Responde com ofensas piores pra eles pararem.”', fb: 'Responder com ofensas pode piorar a situação e colocar o Kauã em risco.' },
            { t: '“Encaminha pra todos os grupos que você conhece.”', fb: 'Espalhar as mensagens aumenta a exposição do Kauã. As provas devem ir para quem pode agir.' }
          ]
        }
      ]
    },
    {
      id: 16, op: 3, title: 'Denunciar ou ignorar?', mech: ['classify'],
      brief: 'Uma publicação discriminatória está circulando rápido na CONECTA. Muitos estudantes não sabem o que fazer. Classifique cada atitude como adequada ou inadequada.',
      wrap: 'Diante de conteúdo racista: não compartilhe, registre evidências com segurança, denuncie na plataforma e procure ajuda. Denunciar é um ato de cidadania digital.',
      steps: [{
        type: 'classify',
        scene: { kind: 'post', who: 'anon', name: 'perfil_anonimo_x', handle: '@perfil_anonimo_x', time: '3 h', likes: 1520, text: 'Compartilha se concorda!! 🔁', censored: { desc: 'Publicação com texto que afirma que pessoas negras “não deveriam frequentar” determinados lugares da cidade.', caption: '' } },
        prompt: 'Classifique cada atitude.',
        cats: [
          { id: 'sim', label: 'Atitude adequada', icon: '✅', cls: 'good' },
          { id: 'nao', label: 'Atitude inadequada', icon: '❌', cls: 'bad' }
        ],
        items: [
          { t: '🚩 Denunciar a publicação na ferramenta da plataforma.', a: 'sim', fb: 'A denúncia permite que a plataforma analise e remova o conteúdo.' },
          { t: '📸 Fazer print com data, hora e endereço do perfil e guardar, sem divulgar.', a: 'sim', fb: 'Evidências guardadas com segurança ajudam em denúncias formais.' },
          { t: '🔁 Compartilhar “para criticar” e mostrar como é absurdo.', a: 'nao', fb: 'Mesmo com boa intenção, compartilhar aumenta o alcance do conteúdo racista.' },
          { t: '🙋 Procurar um adulto de confiança, professor(a) ou a coordenação.', a: 'sim', fb: 'Adultos podem orientar e acionar os canais adequados.' },
          { t: '🤬 Comentar com xingamentos no post.', a: 'nao', fb: 'Comentários (até os negativos) aumentam o engajamento e podem fazer o post aparecer para mais pessoas.' },
          { t: '📞 Com apoio de um adulto, usar canais oficiais como a SaferNet Brasil ou o Disque 100.', a: 'sim', fb: 'A SaferNet recebe denúncias de crimes na internet e o Disque 100 recebe denúncias de violações de direitos humanos, como o racismo.' },
          { t: '🙈 Rolar o feed e fingir que não viu nada.', a: 'nao', fb: 'Não engajar com o post é bom, mas fingir que nada aconteceu deixa o conteúdo circulando. Denunciar leva segundos.' }
        ]
      }]
    },
    {
      id: 17, op: 3, title: 'O silêncio também importa?', mech: ['decision', 'reflection'],
      brief: 'Durante a transmissão ao vivo de um campeonato de games da escola, um jogador negro passou a receber mensagens racistas no chat. Quarenta colegas assistiam. Ninguém disse nada.',
      wrap: 'A omissão ajuda a normalizar o racismo. Mas agir não significa se arriscar: denunciar, apoiar a vítima em privado e avisar adultos são caminhos seguros.',
      steps: [
        {
          type: 'choice',
          scene: {
            kind: 'chat', title: '🔴 AO VIVO — Copa Gamer da Escola', members: '40 assistindo', live: true,
            messages: [
              { who: 'bento', name: 'Raio_Bento (jogador)', t: 'Valeu pela torcida, galera! Próxima rodada! 🎮' },
              { who: 'anon', name: 'anonimo_77', t: '[mensagem com ofensa racista ocultada pela Agência]', hidden: true },
              { who: 'anon2', name: 'anonimo_77', t: '[mensagem com ofensa racista ocultada pela Agência]', hidden: true },
              { sys: true, t: '40 pessoas assistindo • nenhuma resposta no chat' }
            ]
          },
          prompt: 'Por que o silêncio de todos importa?',
          options: [
            { t: 'Porque, quando ninguém reage, o agressor entende que aquilo é aceito e a vítima se sente sozinha. A omissão ajuda a normalizar o racismo.', ok: true, fb: 'Reflexão precisa! O racismo se fortalece quando é tratado como algo “normal” por quem assiste.' },
            { t: 'Não importa. Só quem escreveu as mensagens tem responsabilidade.', fb: 'Quem escreveu é o principal responsável, sim. Mas quem presencia também influencia: o silêncio pode soar como aprovação.' },
            { t: 'Porque todos deveriam ter atacado o agressor no chat.', fb: 'Atacar o agressor não é a única forma de agir — e nem sempre é a mais segura. Existem outras formas de não se omitir.' },
            { t: 'Porque ficar em silêncio é sempre crime.', fb: 'Presenciar não torna ninguém criminoso. Mas existe uma responsabilidade ética e coletiva de não deixar a vítima sozinha.' }
          ]
        },
        {
          type: 'choice', prompt: 'Uma colega diz: “Eu não falei nada porque tive medo de virar alvo também”. O que você responde?',
          options: [
            { t: '“Seu medo é válido. Dá pra agir com segurança: denunciar as mensagens, mandar apoio em privado ao jogador e avisar um adulto. Ninguém precisa enfrentar o agressor sozinho.”', ok: true, fb: 'Resposta empática e responsável! Sua segurança importa — e mesmo assim é possível agir.' },
            { t: '“Então fica quieta mesmo, não é problema seu.”', fb: 'O racismo é problema de todos. Existem formas seguras de agir.' },
            { t: '“Medo é desculpa. Tinha que enfrentar o agressor de qualquer jeito.”', fb: 'Ninguém deve colocar a própria segurança em risco. Agir com responsabilidade inclui se proteger.' },
            { t: '“Cria uma conta falsa e ataca ele.”', fb: 'Atacar com perfis falsos é outra forma de violência digital e pode trazer consequências graves.' }
          ]
        }
      ]
    },
    {
      id: 18, op: 3, title: 'A decisão final', mech: ['decision', 'order'], bonus: true,
      brief: 'Caso de encerramento da Operação 03. Um perfil anônimo, @verdades.do.7ano, está postando fotos de estudantes negros da escola com legendas que ridicularizam seus cabelos e tons de pele. Muitos colegas seguem o perfil.',
      wrap: 'Você não precisa confrontar o agressor nem se colocar em risco. Não compartilhar, guardar evidências, denunciar e buscar adultos e canais apropriados é a forma mais eficaz e segura de agir.',
      steps: [
        {
          type: 'choice', prompt: 'Qual destas atitudes NÃO é necessária — e nem recomendada?',
          options: [
            { t: 'Descobrir sozinho quem está por trás do perfil e confrontar a pessoa cara a cara.', ok: true, fb: 'Isso mesmo! Investigar e confrontar sozinho pode colocar você em risco. Essa tarefa é de adultos responsáveis, da escola e das autoridades.' },
            { t: 'Denunciar o perfil na plataforma.', fb: 'Denunciar é necessário e recomendado! Procure a atitude que pode colocar você em risco.' },
            { t: 'Contar a um adulto de confiança.', fb: 'Contar a um adulto é essencial. Procure a atitude que NÃO é recomendada.' },
            { t: 'Não seguir e não compartilhar o perfil.', fb: 'Não dar audiência ao perfil é uma atitude importante. Procure outra opção.' }
          ]
        },
        {
          type: 'order', prompt: 'Monte a sequência de atitudes: toque nas ações na ordem em que devem acontecer.',
          items: [
            { t: 'Não seguir, não curtir e não compartilhar as publicações.', fb: 'Primeiro, pare de dar audiência ao perfil: isso freia a circulação imediatamente.' },
            { t: 'Registrar evidências: prints com data, hora e endereço do perfil, sem repassar.', fb: 'Guarde provas antes da denúncia, pois o conteúdo pode ser apagado depois.' },
            { t: 'Denunciar o perfil e as publicações na plataforma.', fb: 'Com as provas guardadas, denuncie para que a plataforma analise e remova.' },
            { t: 'Levar as evidências a um adulto de confiança: professor(a), coordenação ou família.', fb: 'Adultos podem acionar a escola, a família das vítimas e, se necessário, as autoridades.' },
            { t: 'Junto com a escola, apoiar os colegas atingidos e acompanhar as providências.', fb: 'O cuidado com as vítimas continua depois da denúncia.' }
          ],
          accept: [[0, 1, 3, 2, 4]]
        }
      ]
    },

    /* ===================== OPERAÇÃO 04 ===================== */
    {
      id: 19, op: 4, title: 'Eu não sou racista, mas…', mech: ['segments', 'choice'],
      brief: 'Uma nova novela anunciou sua protagonista: uma atriz negra fictícia, Lara Monteiro. Um comentário começa com “eu não sou racista”. Investigue a contradição.',
      wrap: 'Dizer “não sou racista” não basta. O que define uma atitude é o seu conteúdo e o seu efeito. Ser antirracista é agir para combater o racismo, não apenas negar que se é racista.',
      steps: [
        {
          type: 'multi', layout: 'segments',
          scene: { kind: 'post', who: 'rute', name: 'Telinha News', handle: '@telinha.news', time: '6 h', text: 'Estreia hoje! A atriz Lara Monteiro é a protagonista da nova novela das nove. 🎬✨', photo: 'selfie-crespo', photoCap: 'Lara Monteiro • protagonista', likes: 5321, comments: [] },
          commenter: { who: 'theo', name: 'opiniao.do.ze' },
          prompt: 'Toque nos trechos que CONTRADIZEM a frase “Eu não sou racista”.',
          items: [
            { t: 'Eu não sou racista, viu?', ok: false, fb: 'É a afirmação inicial. O problema está no que vem depois.' },
            { t: 'Respeito todo mundo.', ok: false, fb: 'Outra afirmação de “boa intenção”. Ela será contrariada pelos próximos trechos.' },
            { t: 'Mas uma protagonista negra na novela das nove é forçar a barra.', ok: true, fb: 'Tratar a presença de uma mulher negra como protagonista como “exagero” desvaloriza a representatividade negra.' },
            { t: 'E esse cabelo armado não combina com papel de mocinha.', ok: true, fb: 'Associa o cabelo crespo a algo inadequado para uma personagem “boa” ou “bonita”.' },
            { t: 'Só tô dando minha opinião.', ok: false, fb: 'É uma tentativa de se proteger de críticas. O conteúdo discriminatório já apareceu nos trechos anteriores.' }
          ]
        },
        {
          type: 'choice', prompt: 'Qual análise explica melhor a contradição do comentário?',
          options: [
            { t: 'Declarar-se “não racista” não basta: os trechos tratam a presença de uma mulher negra como exagero e seus traços como inadequados. O conteúdo contradiz a declaração.', ok: true, fb: 'Análise de especialista! O “eu não sou racista, mas…” é um padrão comum: a negação vem antes justamente para disfarçar o preconceito que vem depois.' },
            { t: 'Não há contradição: se a pessoa diz que não é racista, então não é.', fb: 'O que define uma atitude não é o que a pessoa diz sobre si, e sim o que ela faz e fala.' },
            { t: 'A contradição é que a pessoa disse “viu?” no começo.', fb: 'A palavra “viu?” não é o problema. Compare a declaração inicial com o que vem depois do “mas”.' },
            { t: 'Ter amigos negros provaria que a pessoa não é racista.', fb: 'Ter amigos negros não impede alguém de reproduzir preconceitos. Atitudes e falas são o que importa.' }
          ]
        }
      ]
    },
    {
      id: 20, op: 4, title: 'Padrões de beleza', mech: ['select'],
      brief: 'A Agência recebeu um dossiê com seis conteúdos do feed “Beleza” da CONECTA. Alguns valorizam a diversidade; outros reproduzem padrões preconceituosos. Identifique-os.',
      wrap: 'Expressões como “cabelo ruim” e “traços finos” vêm de um padrão de beleza eurocêntrico, que trata traços brancos como ideais. Beleza é diversa.',
      steps: [{
        type: 'multi', layout: 'cards',
        prompt: 'Selecione TODOS os conteúdos que reproduzem padrões de beleza preconceituosos.',
        items: [
          { t: '🧴 Propaganda: “Diga adeus ao cabelo ruim! Fios lisos e disciplinados em 7 dias.”', ok: true, fb: 'Chamar o cabelo crespo de “ruim” e vender o liso como “disciplinado” reforça um padrão racista.' },
          { t: '💇🏾 Tutorial: “Como hidratar cachos e crespos — cada curvatura tem seu cuidado.”', ok: false, fb: 'Valoriza e respeita a diversidade dos cabelos.' },
          { t: '📷 Filtro “Beleza Perfeita”: afina o nariz, clareia a pele e deixa os olhos claros automaticamente.', ok: true, fb: 'O filtro define como “perfeito” um padrão de traços brancos, apagando traços negros.' },
          { t: '🎨 Marca de maquiagem: “Nossa nova linha de bases tem 40 tons, do mais claro ao mais escuro.”', ok: false, fb: 'Incluir variedade de tons de pele é uma prática de valorização da diversidade.' },
          { t: '💬 Comentário: “Ela é negra, mas tem traços finos, por isso é bonita.”', ok: true, fb: 'O “mas” e os “traços finos” sugerem que traços negros não seriam bonitos.' },
          { t: '📸 Ensaio fotográfico do Novembro Negro celebrando tranças, turbantes e black power.', ok: false, fb: 'Celebra a estética e a identidade negra.' }
        ]
      }]
    },
    {
      id: 21, op: 4, title: 'Quem é considerado profissional?', mech: ['choice', 'match'],
      brief: 'Um perfil de “dicas de carreira” fez uma publicação sobre o visual ideal para entrevistas de emprego. Muitos usuários reagiram. Investigue.',
      wrap: 'Profissionalismo depende de competência, ética e responsabilidade — não do tipo de cabelo. Valorizar a identidade negra em todos os espaços, inclusive no trabalho, é combater o racismo.',
      steps: [
        {
          type: 'choice',
          scene: {
            kind: 'post', who: 'davi', name: 'Carreira Top', handle: '@carreira.top', time: '1 d', likes: 980,
            text: '💼 DICA DE OURO PRA ENTREVISTA: cabelo crespo solto, tranças e dreads passam imagem de desleixo. Prenda ou alise para parecer profissional!',
            comments: [{ who: 'nina', name: 'Nina', text: 'Fui pra entrevista com minhas tranças e fui aprovada. 💼✨ Competência não tem textura de cabelo.' }]
          },
          prompt: 'Qual é o problema da “dica”?',
          options: [
            { t: 'Ela associa cabelos e penteados afro a desleixo, tratando a identidade negra como inadequada e exigindo que pessoas negras escondam seus traços para serem aceitas.', ok: true, fb: 'Exatamente! A “dica” transforma um preconceito em regra de comportamento. Ninguém deveria ter que mudar sua identidade para ser respeitado.' },
            { t: 'Nenhum: é só uma dica de moda.', fb: 'Não é uma questão de moda: a “dica” afirma que traços naturais de pessoas negras são “desleixo”. Isso é preconceito.' },
            { t: 'O problema é a dica não falar de roupas.', fb: 'O foco não é o que faltou, mas o que foi dito sobre cabelos afro.' },
            { t: 'O problema é que dicas de carreira são sempre falsas.', fb: 'Muitas dicas de carreira são úteis. Esta, porém, reproduz um preconceito racial.' }
          ]
        },
        {
          type: 'match', prompt: 'Associe cada conceito à sua explicação.',
          left: ['Tranças', 'Black power', 'Exigir alisamento no trabalho', 'Profissionalismo'],
          right: [
            'Penteado de origem africana, com séculos de história, ligado à identidade, à arte e à cultura',
            'Estilo que se tornou símbolo de orgulho e resistência negra, especialmente a partir dos anos 1960 e 1970',
            'Prática discriminatória, que pode e deve ser denunciada',
            'Depende de competência, ética e responsabilidade — não do tipo de cabelo'
          ],
          fb: [
            'As tranças têm raízes em diversas culturas africanas e são parte importante da cultura negra.',
            'O black power se tornou símbolo de orgulho negro e de valorização da estética negra.',
            'Exigir que alguém mude o cabelo por ser afro é discriminação racial.',
            'O que torna alguém profissional são suas atitudes e competências.'
          ]
        }
      ]
    },
    {
      id: 22, op: 4, title: 'Quando a discriminação é naturalizada', mech: ['comments', 'choice'],
      brief: 'Lia contou no grupo da família que está namorando o Bento. A conversa que veio depois foi denunciada por ela à Agência. Analise o diálogo.',
      wrap: 'Quando frases preconceituosas são repetidas como “normais” ou “carinhosas”, elas passam de geração em geração sem serem questionadas. Isso ajuda a manter o racismo estrutural.',
      steps: [
        {
          type: 'multi', layout: 'chat', chatTitle: 'Família Reunida 🏡',
          prompt: 'Toque nas mensagens que tratam o preconceito como algo “normal”.',
          items: [
            { who: 'davi', name: 'Tio Beto', t: 'Vi que a Lia tá namorando um menino “moreninho”, né? 😅', ok: true, fb: 'Usar “moreninho” para evitar dizer “negro” trata a palavra negro como algo ruim. É um eufemismo racista muito naturalizado.' },
            { who: 'caio', name: 'Primo Caio', t: 'Tio, ele é negro, pode falar. Não é palavrão.', ok: false, fb: 'Uma correção respeitosa: “negro” não é ofensa, é identidade.' },
            { who: 'lia', name: 'Tia Rosa', t: 'Ai, que exagero, sempre falamos assim. É carinhoso.', ok: true, fb: '“Sempre falamos assim” é a própria naturalização: o hábito não torna o preconceito aceitável.' },
            { who: 'anon2', name: 'Vovó', t: 'Pelo menos ele é de família boa, apesar de tudo.', ok: true, fb: 'O “apesar de tudo” sugere que ser negro seria um defeito a ser compensado.' },
            { who: 'lia', name: 'Lia', t: 'Ele se chama Bento, é ótimo em matemática e toca violino. 🎻', ok: false, fb: 'Lia apresenta o Bento como pessoa, com nome e qualidades.' },
            { who: 'davi', name: 'Tio Beto', t: 'Ih, já vão começar com mimimi.', ok: true, fb: 'Chamar a crítica ao racismo de “mimimi” deslegitima quem denuncia e mantém o preconceito.' }
          ]
        },
        {
          type: 'choice', prompt: 'Como preconceitos como esses são reproduzidos socialmente?',
          options: [
            { t: 'Quando frases preconceituosas são repetidas como “normais” em família, na escola e na mídia, elas passam de geração em geração e deixam de ser questionadas.', ok: true, fb: 'Isso mesmo! O racismo não depende só de “pessoas más”: ele é sustentado por hábitos, falas e instituições. Por isso, questionar o que é “normal” é tão importante.' },
            { t: 'Eles surgem do nada, de repente, em cada pessoa.', fb: 'Preconceitos são aprendidos socialmente, não surgem do nada.' },
            { t: 'Só acontecem na internet.', fb: 'O diálogo aconteceu num grupo de família, mas falas assim também aparecem fora da internet.' },
            { t: 'Não são reproduzidos: são apenas jeitos carinhosos de falar.', fb: 'O “carinho” não apaga o preconceito presente nas palavras.' }
          ]
        }
      ]
    },
    {
      id: 23, op: 4, title: 'O algoritmo e o preconceito', mech: ['evidence', 'choice', 'select'], bonus: true,
      brief: 'A startup fictícia FotoMágica lançou uma IA que cria imagens a partir de palavras. A cientista de dados Dra. Rute Nascimento investigou a ferramenta e enviou os arquivos para a Agência.',
      wrap: 'Tecnologias não são neutras: elas aprendem com dados e são construídas por pessoas. Se os dados e as escolhas carregam desigualdades, a máquina as reproduz — e pode até ampliá-las.',
      steps: [
        {
          type: 'evidence', prompt: 'Abra e analise todos os arquivos da investigação.',
          scene: { kind: 'post', who: 'rute', name: 'Dra. Rute Nascimento', handle: '@rute.dados', time: '2 h', verified: true, text: 'Testei a nova IA de imagens da FotoMágica e encontrei vieses raciais graves. Enviei meu relatório à Agência. 🧪📊', photo: 'ia-teste', likes: 2210, comments: [] },
          files: [
            { icon: '🧪', title: 'Arquivo 1 — Teste de geração', body: '<p>Ao pedir imagens de <strong>“cientista”</strong>, <strong>“médica”</strong> ou <strong>“engenheiro”</strong>, <strong>92 de cada 100</strong> imagens mostraram pessoas brancas.</p><p>Ao pedir <strong>“pessoa suspeita”</strong>, a maioria das imagens mostrou pessoas negras.</p>' },
            { icon: '🗂️', title: 'Arquivo 2 — Dados de treinamento', body: '<p>A IA aprendeu com <strong>10 milhões de imagens</strong> coletadas da internet, com legendas antigas.</p><p>Imagens de profissionais negros eram raras, e muitas legendas repetiam estereótipos.</p>' },
            { icon: '👥', title: 'Arquivo 3 — Equipe e testes', body: '<p>A equipe que desenvolveu o sistema <strong>não testou</strong> os resultados com diferentes grupos raciais antes do lançamento.</p><p>Ninguém da equipe revisou as legendas usadas no treinamento.</p>' },
            { icon: '📷', title: 'Arquivo 4 — Filtro “Embelezar”', body: '<p>O filtro “Embelezar”, da mesma empresa, <strong>clareia a pele</strong> em 80% das fotos de pessoas negras.</p>' }
          ]
        },
        {
          type: 'choice', prompt: 'Por que a IA reproduz estereótipos raciais?',
          options: [
            { t: 'Porque aprendeu com dados desequilibrados e cheios de estereótipos, e a equipe não testou nem corrigiu esses vieses. A tecnologia reproduz escolhas e desigualdades humanas.', ok: true, fb: 'Diagnóstico perfeito! Pesquisadoras como a cientista Joy Buolamwini já mostraram que sistemas de reconhecimento facial erravam muito mais com mulheres negras. Vieses nos dados viram vieses nos resultados.' },
            { t: 'Porque computadores são racistas por natureza.', fb: 'Máquinas não têm “natureza”. Elas reproduzem padrões dos dados e das escolhas feitas por pessoas.' },
            { t: 'Porque a IA é neutra: os resultados apenas mostram a realidade.', fb: 'A IA não é neutra. Ela reflete dados desequilibrados — e existem muitos cientistas, médicas e engenheiros negros na realidade.' },
            { t: 'Porque os usuários digitaram as palavras erradas.', fb: 'As palavras estavam corretas. O problema está no modo como o sistema foi treinado e testado.' }
          ]
        },
        {
          type: 'multi', layout: 'cards', prompt: 'Quais medidas ajudariam a corrigir o problema? Selecione TODAS as adequadas.',
          items: [
            { t: 'Usar dados de treinamento mais diversos e revisados.', ok: true, fb: 'Dados diversos e revisados reduzem os vieses aprendidos.' },
            { t: 'Testar o sistema com pessoas de diferentes grupos raciais antes de lançar.', ok: true, fb: 'Testes com diversidade revelam problemas antes que causem danos.' },
            { t: 'Ter equipes de desenvolvimento diversas.', ok: true, fb: 'Equipes diversas percebem problemas que equipes homogêneas podem não ver.' },
            { t: 'Criar um canal para usuários denunciarem resultados discriminatórios.', ok: true, fb: 'Ouvir os usuários ajuda a encontrar e corrigir vieses.' },
            { t: 'Esconder os resultados ruins e lançar assim mesmo.', ok: false, fb: 'Esconder o problema permite que ele cause danos a muitas pessoas.' },
            { t: 'Remover todas as pessoas negras do banco de dados “para evitar erros”.', ok: false, fb: 'Isso apagaria pessoas negras e pioraria ainda mais o viés.' },
            { t: 'Dizer que a IA é neutra e não precisa de revisão.', ok: false, fb: 'Nenhuma tecnologia é neutra. Revisão constante é necessária.' }
          ]
        }
      ]
    },
    {
      id: 24, op: 4, title: 'O grande caso', mech: ['case'], bonus: true,
      brief: 'CASO #24 — A ELEIÇÃO DO GRÊMIO. Gabi é a primeira estudante negra a se candidatar à presidência do grêmio da escola. Uma página anônima começou a atacá-la. Reúna as evidências e resolva o caso.',
      wrap: 'O racismo nas redes pode tentar afastar pessoas negras de espaços de liderança. Combatê-lo é proteger o direito de todos de participar, liderar e serem respeitados.',
      steps: [
        {
          type: 'evidence', prompt: 'Abra e analise todas as evidências do caso.',
          files: [
            { icon: '🖼️', title: 'Evidência A — A publicação', body: '@censored|Montagem com a foto da Gabi e a frase “Presidente? Só se for da cozinha da escola”, acompanhada de emojis de risada.|votem consciente kkkk' },
            { icon: '💬', title: 'Evidência B — Comentários', body: '<ul><li>“Ela só tá na chapa por causa de cota 🙄”</li><li>“A Gabi é a mais preparada, já organizou 3 projetos!”</li><li>“Imagina esse cabelo na foto oficial kkk”</li><li>“Não concordo com a proposta dela sobre o horário do intervalo.”</li></ul>' },
            { icon: '📋', title: 'Evidência C — Contexto', body: '<p>Desde a publicação, a Gabi <strong>faltou duas vezes</strong> e contou à orientadora que <strong>pensa em desistir</strong> da candidatura.</p>' },
            { icon: '📈', title: 'Evidência D — Alcance', body: '<p>A publicação foi <strong>compartilhada 180 vezes</strong> em grupos de estudantes.</p>' }
          ]
        },
        {
          type: 'multi', layout: 'cards', prompt: 'ETAPA 1 — Quais elementos do caso são discriminatórios? Selecione TODOS.',
          items: [
            { t: 'A montagem “Presidente? Só se for da cozinha da escola”.', ok: true, fb: 'Associa uma menina negra a funções subalternas e nega seu direito de liderar.' },
            { t: '“Ela só tá na chapa por causa de cota 🙄”', ok: true, fb: 'Deslegitima o mérito da Gabi com base na raça, sem nenhum fato.' },
            { t: '“Imagina esse cabelo na foto oficial kkk”', ok: true, fb: 'Ridiculariza o cabelo afro da Gabi.' },
            { t: '“Não concordo com a proposta dela sobre o horário do intervalo.”', ok: false, fb: 'Discordar de uma proposta é parte da democracia. Isso não é discriminação.' },
            { t: '“A Gabi é a mais preparada, já organizou 3 projetos!”', ok: false, fb: 'É um comentário de apoio baseado em fatos.' }
          ]
        },
        {
          type: 'choice', prompt: 'ETAPA 2 — Qual é a consequência mais grave revelada pelas evidências?',
          options: [
            { t: 'A Gabi está sendo afastada de um espaço de participação e liderança: falta às aulas e pensa em desistir. O racismo tenta impedir o protagonismo negro.', ok: true, fb: 'Você enxergou o centro do caso. Além da dor individual, o racismo tenta definir quem pode ou não ocupar espaços de poder.' },
            { t: 'A página anônima ganhou seguidores.', fb: 'O crescimento da página é um efeito, mas não é o dano mais grave. Pense na Gabi.' },
            { t: 'A eleição vai atrasar.', fb: 'Não há evidência de atraso. Observe o que aconteceu com a Gabi.' },
            { t: 'Nenhuma: são só comentários na internet.', fb: 'A Evidência C mostra consequências reais na vida da Gabi: faltas e vontade de desistir.' }
          ]
        },
        {
          type: 'multi', layout: 'cards', prompt: 'ETAPA 3 — Quais atitudes a turma e a escola devem tomar? Selecione TODAS as adequadas.',
          items: [
            { t: 'Denunciar a página e a montagem na plataforma.', ok: true, fb: 'Interrompe a circulação do conteúdo.' },
            { t: 'Guardar as evidências e levá-las à coordenação.', ok: true, fb: 'Permite que a escola investigue e tome providências.' },
            { t: 'A escola acolher a Gabi e garantir que ela continue candidata, se quiser.', ok: true, fb: 'Protege o direito da Gabi de participar.' },
            { t: 'Promover uma conversa com as turmas sobre racismo e eleições respeitosas.', ok: true, fb: 'A educação previne novos casos.' },
            { t: 'Pedir que a Gabi desista “para evitar confusão”.', ok: false, fb: 'Isso puniria a vítima e daria vitória ao racismo.' },
            { t: 'Criar outra página para atacar quem fez a montagem.', ok: false, fb: 'Responder violência com violência não resolve e pode gerar novos danos.' },
            { t: 'Pedir que a Gabi explique em público o que sentiu.', ok: false, fb: 'A vítima não deve ser exposta nem obrigada a falar publicamente.' }
          ]
        }
      ]
    },

    /* ===================== OPERAÇÃO 05 ===================== */
    {
      id: 25, op: 5, title: 'Reescrevendo com respeito', mech: ['choice'],
      brief: 'Agora você é quem responde! Três comentários com preconceitos indiretos apareceram na CONECTA. Para cada um, escolha a resposta antirracista, respeitosa e educativa.',
      wrap: 'Uma boa resposta antirracista é firme, respeitosa e informativa. Ela corrige o preconceito sem humilhar — e valoriza a pessoa atingida.',
      steps: [
        {
          type: 'choice',
          scene: { kind: 'post', who: 'bento', name: 'Bento', handle: '@bento.twists', time: '1 h', text: 'Twists novos! 🔥', comments: [{ who: 'anon', name: 'marcos_t', text: 'Esse cabelo aí é moda passageira. Logo você corta e fica apresentável.', hl: true }] },
          prompt: 'COMENTÁRIO 1 — Qual é a melhor resposta?',
          options: [
            { t: '“Os twists fazem parte da identidade e da cultura negra, não são moda passageira. Cabelo afro já é apresentável do jeito que é. 💪🏿”', ok: true, fb: 'Resposta firme, educativa e respeitosa, que valoriza a identidade do Bento.' },
            { t: '“Cala a boca, ninguém pediu sua opinião, seu ridículo.”', fb: 'A ofensa pode gerar briga e não ajuda ninguém a refletir.' },
            { t: '“kkkk verdade”', fb: 'Concordar reforça o preconceito.' },
            { t: '“Deixa pra lá, Bento, ninguém liga pra isso.”', fb: 'Minimizar não acolhe o Bento nem questiona o preconceito.' }
          ]
        },
        {
          type: 'choice',
          scene: { kind: 'post', who: 'rute', name: 'Escola Horizonte', handle: '@escola.horizonte', time: '3 h', text: 'Novembro Negro começou! Este mês teremos exposições, rodas de conversa e apresentações sobre história e cultura afro-brasileira. ✊🏾', comments: [{ who: 'anon2', name: 'lucas_99', text: 'Pra que Novembro Negro? Somos todos humanos, isso só divide as pessoas.', hl: true }] },
          prompt: 'COMENTÁRIO 2 — Qual é a melhor resposta?',
          options: [
            { t: '“Somos todos humanos, sim — e justamente por isso é importante lembrar que o racismo ainda gera desigualdades. O Novembro Negro valoriza a história e a cultura negra e fortalece a luta por igualdade.”', ok: true, fb: 'Excelente! Você concorda com a humanidade comum e explica por que reconhecer o racismo é necessário para alcançar a igualdade.' },
            { t: '“Verdade, deveria acabar.”', fb: 'Ignorar o racismo não o faz desaparecer. O Novembro Negro existe porque a desigualdade racial é real.' },
            { t: '“Você é burro.”', fb: 'A ofensa encerra o diálogo e não esclarece nada.' },
            { t: '“Não sei o que responder.”', fb: 'Tudo bem ter dúvidas, mas você já tem conhecimento para dar uma resposta educativa!' }
          ]
        },
        {
          type: 'choice',
          scene: { kind: 'post', who: 'malu', name: 'Debate Escolar', handle: '@debate.escolar', time: '5 h', text: 'A Malu foi eleita a melhor oradora do campeonato de debates! 🏆🎤', comments: [{ who: 'anon', name: 'pedro.ln', text: 'Até que ela fala bem, pra alguém “de lá”, né.', hl: true }] },
          prompt: 'COMENTÁRIO 3 — Qual é a melhor resposta?',
          options: [
            { t: '“Ela fala bem porque se preparou e é talentosa. Esperar menos de alguém por causa da cor ou de onde vem é preconceito.”', ok: true, fb: 'Perfeito! Você desmonta a expectativa preconceituosa e valoriza a intelectualidade da Malu.' },
            { t: '“É mesmo, foi uma surpresa.”', fb: 'Tratar o talento da Malu como “surpresa” reforça a ideia preconceituosa.' },
            { t: '“Você é que não sabe falar nada.”', fb: 'A ofensa desvia o foco e não questiona o preconceito.' },
            { t: 'Curtir o comentário e seguir rolando o feed.', fb: 'Curtir dá apoio ao preconceito.' }
          ]
        }
      ]
    },
    {
      id: 26, op: 5, title: 'Apoiando quem sofre racismo', mech: ['select', 'order'],
      brief: 'Malu postou um vídeo cantando e recebeu mensagens racistas. Ela é sua amiga. Monte um plano de apoio: primeiro escolha as ações certas, depois organize a sequência.',
      wrap: 'Apoiar é ouvir, respeitar as decisões da vítima, ajudar a guardar provas, buscar adultos de confiança e continuar por perto. A vítima nunca tem culpa.',
      steps: [
        {
          type: 'multi', layout: 'cards', prompt: 'Quais ações devem fazer parte do plano de apoio? Selecione TODAS.',
          items: [
            { t: 'Ouvir a Malu com atenção e sem julgamentos, dizendo que ela não tem culpa.', ok: true, fb: 'Acolher é o primeiro passo.' },
            { t: 'Perguntar como ela se sente e do que precisa, respeitando as decisões dela.', ok: true, fb: 'O apoio deve respeitar a vontade da vítima.' },
            { t: 'Ajudar a guardar as provas (prints com data e perfil) e bloquear os agressores.', ok: true, fb: 'Provas guardadas permitem denúncias.' },
            { t: 'Acompanhar a Malu para conversar com um adulto de confiança ou a coordenação.', ok: true, fb: 'Adultos podem agir e proteger.' },
            { t: 'Continuar por perto nos dias seguintes e valorizar o talento dela.', ok: true, fb: 'O apoio não termina num único dia.' },
            { t: 'Pedir que ela apague o vídeo para “não provocar”.', ok: false, fb: 'Isso culpa a vítima e silencia o talento dela.' },
            { t: 'Dizer que ela é sensível demais.', ok: false, fb: 'Isso minimiza o sofrimento dela.' },
            { t: 'Postar as mensagens racistas sem pedir a permissão dela.', ok: false, fb: 'Expor sem consentimento pode aumentar a violência.' }
          ]
        },
        {
          type: 'order', prompt: 'Agora organize o plano: toque nas ações na ordem em que devem acontecer.',
          items: [
            { t: 'Ouvir a Malu com atenção e sem julgamentos, dizendo que ela não tem culpa.', fb: 'Primeiro, acolha.' },
            { t: 'Perguntar como ela se sente e do que precisa, respeitando as decisões dela.', fb: 'Depois, entenda o que ela deseja.' },
            { t: 'Ajudar a guardar as provas (prints com data e perfil) e bloquear os agressores.', fb: 'Com o consentimento dela, proteja as provas e bloqueie os agressores.' },
            { t: 'Acompanhar a Malu para conversar com um adulto de confiança ou a coordenação.', fb: 'Leve o caso a quem pode agir.' },
            { t: 'Continuar por perto nos dias seguintes e valorizar o talento dela.', fb: 'Por fim, mantenha o apoio ao longo do tempo.' }
          ],
          accept: [[0, 1, 3, 2, 4]]
        }
      ]
    },
    {
      id: 27, op: 5, title: 'Moderadores digitais', mech: ['moderation', 'choice'], bonus: true,
      brief: 'Você foi promovido a MODERADOR da CONECTA! Analise cinco publicações e decida: manter, sinalizar com aviso de contexto ou denunciar para remoção. Atenção: opinião diferente não é discriminação.',
      wrap: 'Moderar com justiça é proteger as pessoas da discriminação sem censurar opiniões diferentes. Discordar é democrático; inferiorizar alguém por sua raça é discriminação.',
      steps: [
        {
          type: 'classify', prompt: 'Decida o destino de cada publicação.',
          cats: [
            { id: 'manter', label: 'Manter', icon: '✅', cls: 'good' },
            { id: 'sinal', label: 'Sinalizar (aviso)', icon: '⚠️', cls: 'warn' },
            { id: 'denun', label: 'Denunciar', icon: '🚩', cls: 'bad' }
          ],
          items: [
            { t: '🕐 “Discordo do novo horário da escola. Acho que o intervalo deveria ser maior!”', a: 'manter', fb: 'Opinião legítima sobre uma regra. Discordar não é discriminar.' },
            { t: '🍲 Vídeo ensinando a receita do acarajé e contando sua história na Bahia e sua ligação com a cultura afro-brasileira.', a: 'manter', fb: 'Conteúdo que valoriza a cultura afro-brasileira.' },
            { t: '🔒 Meme de “humor” que compara pessoas negras a animais. (imagem ocultada)', a: 'denun', fb: 'Desumanizar pessoas negras é racismo e deve ser denunciado e removido.' },
            { t: '📢 “Racismo no Brasil não existe mais, isso é coisa do passado.”', a: 'sinal', fb: 'É desinformação: dados do IBGE mostram desigualdades raciais atuais. Um aviso de contexto com informações confiáveis ajuda quem lê a refletir.' },
            { t: '⚽ “No nosso time não entra gente da cor dele.” — sobre um jogador.', a: 'denun', fb: 'Exclui uma pessoa por sua cor. É discriminação racial e deve ser denunciada.' }
          ]
        },
        {
          type: 'choice', prompt: 'Por que a publicação sobre o horário do intervalo deve ser MANTIDA?',
          options: [
            { t: 'Porque discordar de uma regra é uma opinião legítima. Discriminação racial é atacar, excluir ou inferiorizar pessoas por sua raça ou cor — são coisas diferentes.', ok: true, fb: 'Moderação justa! Saber distinguir divergência de discriminação é essencial para uma internet democrática e antirracista.' },
            { t: 'Porque tudo o que é publicado deve ser mantido.', fb: 'Conteúdos discriminatórios devem ser denunciados. Pense no que diferencia esta publicação das outras.' },
            { t: 'Porque a publicação tinha muitas curtidas.', fb: 'Curtidas não definem se um conteúdo é legítimo ou discriminatório.' },
            { t: 'Na verdade, deveria ser removida: discordar da escola é desrespeito.', fb: 'Discordar com respeito faz parte da vida democrática. Não é discriminação.' }
          ]
        }
      ]
    },
    {
      id: 28, op: 5, title: 'Construindo uma internet melhor', mech: ['select'],
      brief: 'A CONECTA vai lançar o selo “Rede Antirracista”. Para isso, a Agência precisa de uma lista de atitudes digitais que realmente contribuem para uma internet antirracista. Monte essa lista.',
      wrap: 'Uma internet antirracista é construída todos os dias: com o que seguimos, compartilhamos, denunciamos e aprendemos — e com o apoio que oferecemos.',
      steps: [{
        type: 'multi', layout: 'cards', prompt: 'Selecione TODAS as atitudes que contribuem para uma internet antirracista.',
        items: [
          { t: 'Seguir e divulgar criadores de conteúdo negros que falam de ciência, arte, games e história.', ok: true, fb: 'Amplia a representatividade e a diversidade no seu feed.' },
          { t: 'Pensar antes de compartilhar: “Esse conteúdo ridiculariza alguém?”', ok: true, fb: 'Um segundo de reflexão evita espalhar preconceito.' },
          { t: 'Denunciar conteúdos racistas em vez de comentá-los ou repassá-los.', ok: true, fb: 'Denunciar reduz o alcance do conteúdo.' },
          { t: 'Apoiar quem sofreu ataques, respeitando a vontade da pessoa.', ok: true, fb: 'A solidariedade fortalece a vítima.' },
          { t: 'Questionar “piadas” racistas nos grupos de amigos.', ok: true, fb: 'Quebrar o “riso coletivo” desestimula novas piadas.' },
          { t: 'Aprender sobre a história e a cultura afro-brasileira.', ok: true, fb: 'Conhecimento combate estereótipos.' },
          { t: 'Usar perfis falsos para atacar quem é racista.', ok: false, fb: 'Violência digital não combate o racismo e pode trazer consequências graves.' },
          { t: 'Ficar em silêncio porque “não é comigo”.', ok: false, fb: 'O silêncio ajuda a normalizar o racismo.' },
          { t: 'Rir de memes racistas só para não ficar de fora.', ok: false, fb: 'Rir incentiva quem produz esse tipo de conteúdo.' }
        ]
      }]
    },
    {
      id: 29, op: 5, title: 'Campanha antirracista', mech: ['campaign'],
      brief: 'Missão criativa! A escola vai lançar na CONECTA uma campanha de conscientização sobre racismo digital, e você foi escolhido para montar o cartaz. Escolha o slogan, a imagem e a chamada para ação.',
      wrap: 'Boas campanhas antirracistas valorizam a identidade negra, mostram pessoas negras como protagonistas e convidam todos a agir com responsabilidade.',
      steps: [
        {
          type: 'choice', prompt: 'PASSO 1 — Escolha o slogan da campanha.', campaign: 'slogan',
          options: [
            { t: '“Na rede ou na rua: respeito à identidade negra não é opcional.”', ok: true, fb: 'Slogan forte, que valoriza a identidade negra e afirma o respeito como compromisso.' },
            { t: '“Somos todos iguais, então não precisamos falar de racismo.”', fb: 'Esse slogan apaga as desigualdades reais. Falar de racismo é necessário para combatê-lo.' },
            { t: '“Racista é sempre o outro.”', fb: 'Esse slogan afasta a responsabilidade de cada um. Todos podemos rever atitudes.' },
            { t: '“Ignore os haters e pronto.”', fb: 'Ignorar não enfrenta o problema. Uma campanha deve incentivar atitudes.' }
          ]
        },
        {
          type: 'choice', prompt: 'PASSO 2 — Escolha a imagem do cartaz.', campaign: 'image',
          options: [
            { t: 'Jovens negros como protagonistas: cientistas, artistas, atletas e gamers, com diferentes tons de pele e tipos de cabelo.', ok: true, fb: 'Representatividade com protagonismo e diversidade! Pessoas negras aparecem em lugares de destaque e potência.' },
            { t: 'Uma pessoa negra chorando sozinha.', fb: 'Mostrar pessoas negras apenas em sofrimento reforça uma imagem limitada. Campanhas podem valorizar potência e protagonismo.' },
            { t: 'Uma mão branca “salvando” uma pessoa negra.', fb: 'Essa imagem coloca pessoas negras como passivas e dependentes. Prefira o protagonismo negro.' },
            { t: 'Um computador sem nenhuma pessoa.', fb: 'Sem pessoas, a campanha perde a força da representatividade.' }
          ]
        },
        {
          type: 'choice', prompt: 'PASSO 3 — Escolha a chamada para ação.', campaign: 'cta',
          options: [
            { t: '#RespeitoNaRede — Viu racismo? Não compartilhe, denuncie e acolha.', ok: true, fb: 'Chamada clara, com atitudes concretas e seguras.' },
            { t: '#ExpõeEle — Poste os prints dos racistas!', fb: 'Expor publicamente pode espalhar o conteúdo e gerar novas violências.' },
            { t: '#SóBrincadeira', fb: 'Essa hashtag reforça a desculpa usada no racismo recreativo.' },
            { t: '#Ignora', fb: 'Ignorar não combate o racismo.' }
          ]
        },
        { type: 'showcase', prompt: 'Seu cartaz está pronto para ser publicado na CONECTA!', show: 'poster' }
      ]
    },
    {
      id: 30, op: 5, title: 'A missão final: transformar o futuro', mech: ['case'], bonus: true,
      brief: 'MISSÃO FINAL — O FESTIVAL CONECTA. A rede vai premiar os melhores vídeos de jovens talentos. O mais votado é do grupo de dança afro “Raízes”, formado por estudantes negros. Então, tudo mudou. Use tudo o que aprendeu.',
      wrap: 'Você mostrou que sabe identificar o racismo, reconhecer quem é prejudicado, avaliar consequências, agir com responsabilidade e transformar a rede com mensagens de respeito.',
      steps: [
        {
          type: 'evidence', prompt: 'Abra os quatro arquivos da missão final.',
          files: [
            { icon: '🖼️', title: 'Arquivo 1 — O meme', body: '@censored|Meme com a foto do grupo Raízes, comparando os cabelos e as roupas tradicionais dos integrantes a “fantasias”, com emojis de risada.|kkkk o figurino do Raízes 🤡' },
            { icon: '🤖', title: 'Arquivo 2 — A página inicial', body: '<p>Na página inicial do Festival, o sistema de destaques da CONECTA mostrou <strong>apenas vídeos de jovens brancos</strong>, mesmo o Raízes sendo o mais votado.</p><p>O sistema foi treinado com dados de “vídeos populares” de anos anteriores, com pouca diversidade.</p>' },
            { icon: '💬', title: 'Arquivo 3 — Os grupos', body: '<p>Estudantes compartilharam o meme em <strong>12 grupos</strong> “só pra zoar”.</p><p>Um comentário no vídeo diz: “Achei que o figurino podia ter mais cores.”</p>' },
            { icon: '📋', title: 'Arquivo 4 — O grupo Raízes', body: '<p>Integrantes do grupo disseram à professora que estão pensando em <strong>não se apresentar</strong> na final do festival.</p>' }
          ]
        },
        {
          type: 'multi', layout: 'cards', prompt: 'ETAPA 1 — IDENTIFICAR: quais são as manifestações de racismo no caso? Selecione TODAS.',
          items: [
            { t: 'O meme que trata os cabelos e as roupas tradicionais do grupo como “fantasia” ridícula.', ok: true, fb: 'Racismo recreativo: ridiculariza a identidade e a cultura negra.' },
            { t: 'O sistema de destaques que invisibilizou o grupo mais votado.', ok: true, fb: 'Viés algorítmico: a tecnologia reproduziu a falta de diversidade dos dados.' },
            { t: 'O compartilhamento do meme em 12 grupos “só pra zoar”.', ok: true, fb: 'Compartilhar também é participar.' },
            { t: 'O comentário “Achei que o figurino podia ter mais cores”.', ok: false, fb: 'É uma opinião estética legítima, sem desvalorizar ninguém por sua raça.' }
          ]
        },
        {
          type: 'multi', layout: 'cards', prompt: 'ETAPA 2 — RECONHECER: quem está sendo prejudicado? Selecione TODOS.',
          items: [
            { t: 'Os integrantes do grupo Raízes.', ok: true, fb: 'São os alvos diretos do meme e da invisibilização.' },
            { t: 'Outros jovens negros, que veem sua identidade e sua cultura ridicularizadas.', ok: true, fb: 'O racismo atinge o grupo inteiro, não só os alvos diretos.' },
            { t: 'Toda a comunidade da escola e da rede, que fica mais hostil e menos democrática.', ok: true, fb: 'Um ambiente racista prejudica todos.' },
            { t: 'Ninguém: foi só um meme.', ok: false, fb: 'As evidências mostram danos reais: o grupo pensa em não se apresentar.' }
          ]
        },
        {
          type: 'choice', prompt: 'ETAPA 3 — AVALIAR: quais são as consequências se nada for feito?',
          options: [
            { t: 'O grupo pode desistir de se apresentar, outros jovens negros podem deixar de mostrar seus talentos e o racismo passa a parecer “normal” na rede.', ok: true, fb: 'Avaliação completa: dano individual, dano coletivo e naturalização.' },
            { t: 'Nada demais: as pessoas esquecem logo.', fb: 'O Arquivo 4 mostra um efeito real e imediato.' },
            { t: 'Só o grupo Raízes vai ser afetado, e mais ninguém.', fb: 'O racismo afeta também outros jovens negros e toda a comunidade.' },
            { t: 'O festival vai ficar mais divertido.', fb: 'Não há diversão quando pessoas são humilhadas e excluídas.' }
          ]
        },
        {
          type: 'order', prompt: 'ETAPA 4 — AGIR: organize as atitudes responsáveis na ordem certa.',
          items: [
            { t: 'Não compartilhar o meme e pedir aos colegas que parem de repassar.', fb: 'Primeiro, interrompa a circulação.' },
            { t: 'Registrar as evidências com segurança (prints com data e link).', fb: 'Guarde as provas antes que sejam apagadas.' },
            { t: 'Denunciar o meme e a conta que o criou na plataforma.', fb: 'Com as provas guardadas, denuncie.' },
            { t: 'Levar o caso à escola e pedir que a CONECTA revise o sistema de destaques.', fb: 'Adultos e a própria rede precisam agir, inclusive sobre o algoritmo.' },
            { t: 'Apoiar publicamente o grupo Raízes, com o consentimento dos integrantes.', fb: 'O apoio fortalece o grupo e mostra que o racismo não é aceito.' }
          ],
          accept: [[0, 1, 3, 2, 4]]
        },
        {
          type: 'choice', prompt: 'ETAPA 5 — TRANSFORMAR: escolha a mensagem final para a página do Festival.',
          options: [
            { t: '“O Raízes é cultura, talento e história. Aqui, ninguém é diminuído pela cor da pele ou pelo cabelo. A transformação começa com nossas atitudes: na internet, respeito não é opcional.”', ok: true, fb: 'Mensagem perfeita: valoriza o grupo, afirma a igualdade e convida todos à ação.' },
            { t: '“Vamos esquecer o que aconteceu e seguir em frente.”', fb: 'Esquecer sem reparar o dano deixa o racismo sem resposta.' },
            { t: '“Quem fez o meme vai pagar caro!”', fb: 'Mensagens de vingança não constroem uma internet melhor. O caso deve seguir pelos canais adequados.' },
            { t: '“Cada um pensa o que quiser sobre isso.”', fb: 'Racismo não é questão de opinião. A mensagem precisa ser clara contra a discriminação.' }
          ]
        }
      ]
    }
  ];

  /* ---------------- DOSSIÊ ANTIRRACISTA ---------------- */
  // unlock: 0 = disponível desde o início; n = após concluir a operação n
  const DOSSIER = [
    { id: 'novembro', unlock: 0, icon: '✊🏾', cat: 'História', title: 'O que é o Novembro Negro?',
      body: `<p>O <strong>Novembro Negro</strong> é um mês dedicado à reflexão sobre a história, a cultura e as lutas da população negra no Brasil, e ao combate ao racismo.</p>
      <p>Ele acontece em novembro por causa do <strong>dia 20</strong>, data que lembra a morte de <strong>Zumbi dos Palmares</strong>, em 1695.</p>
      <p>Durante o mês, escolas, coletivos e instituições promovem atividades que valorizam a <strong>identidade negra</strong>, a <strong>cultura afro-brasileira</strong> e a <strong>igualdade racial</strong>. Mas atenção: a luta antirracista vale para o ano inteiro!</p>` },
    { id: 'dia20', unlock: 0, icon: '📅', cat: 'História', title: '20 de novembro: Dia Nacional de Zumbi e da Consciência Negra',
      body: `<p>A proposta de celebrar a data surgiu em <strong>1971</strong>, com o <strong>Grupo Palmares</strong>, de Porto Alegre (RS), que tinha entre seus fundadores o poeta <strong>Oliveira Silveira</strong>. O grupo defendia que o 20 de novembro — data da morte de Zumbi — representava melhor a luta negra do que o 13 de maio, dia da assinatura da Lei Áurea (1888).</p>
      <p>Em <strong>1978</strong>, o <strong>Movimento Negro Unificado (MNU)</strong> adotou a data como Dia Nacional da Consciência Negra.</p>
      <p>A <strong>Lei 10.639/2003</strong> incluiu a data no calendário escolar e tornou obrigatório o ensino de história e cultura afro-brasileira. A <strong>Lei 12.519/2011</strong> instituiu o Dia Nacional de Zumbi e da Consciência Negra, e a <strong>Lei 14.759/2023</strong> tornou o 20 de novembro <strong>feriado nacional</strong>.</p>` },
    { id: 'racismo', unlock: 1, icon: '⚖️', cat: 'Conceitos', title: 'O que é racismo?',
      body: `<p><strong>Racismo</strong> é a discriminação de pessoas por causa de sua raça, cor, etnia ou origem, baseada na ideia falsa de que alguns grupos seriam superiores a outros.</p>
      <p>Ele aparece em xingamentos, mas também em “piadas”, “opiniões”, exclusões, falta de oportunidades e tratamentos desiguais.</p>
      <p>No Brasil, <strong>racismo é crime</strong> inafiançável e imprescritível (Constituição Federal, art. 5º, XLII). A <strong>Lei 7.716/1989</strong> define os crimes de racismo, e a <strong>Lei 14.532/2023</strong> equiparou a injúria racial ao racismo e aumentou as penas quando o crime ocorre em redes sociais ou em contexto de “diversão”.</p>` },
    { id: 'estereotipos', unlock: 1, icon: '🏷️', cat: 'Conceitos', title: 'O que são estereótipos raciais?',
      body: `<p><strong>Estereótipos</strong> são ideias simplificadas e generalizadas sobre um grupo, que ignoram que cada pessoa é única.</p>
      <p>Estereótipos raciais associam pessoas negras, por exemplo, à criminalidade, a funções subalternas ou “apenas” ao esporte, ou tratam seus traços como feios.</p>
      <p>Eles têm efeitos reais: desconfiança, abordagens injustas, falta de oportunidades e baixa autoestima. Desconfiar das generalizações é um hábito de agente!</p>` },
    { id: 'identificar', unlock: 1, icon: '🔎', cat: 'Cidadania digital', title: 'Como identificar racismo nas redes sociais?',
      body: `<p>Pergunte-se diante de um conteúdo:</p>
      <ul><li>Ele <strong>ridiculariza</strong> traços físicos, cabelo, cor ou cultura de pessoas negras?</li>
      <li>Ele <strong>generaliza</strong> um comportamento negativo para todo um grupo?</li>
      <li>Usa “só uma opinião”, “é brincadeira” ou “não sou racista, mas…” como <strong>disfarce</strong>?</li>
      <li>Faz um “elogio” que, na verdade, <strong>inferioriza</strong> (“até que é bonita pra…”)?</li>
      <li>Exclui ou <strong>invisibiliza</strong> pessoas negras?</li></ul>
      <p>Se a resposta for sim, você pode estar diante de racismo.</p>` },
    { id: 'zumbi', unlock: 1, icon: '🛡️', cat: 'História', title: 'Zumbi dos Palmares',
      body: `<p>O <strong>Quilombo dos Palmares</strong> se formou na Serra da Barriga, na então capitania de Pernambuco (hoje Alagoas), por volta do fim do século XVI. Foi o maior e mais duradouro quilombo das Américas: resistiu por cerca de um século e reuniu milhares de pessoas que fugiam da escravidão, organizadas em diversos mocambos.</p>
      <p><strong>Zumbi</strong> tornou-se o principal líder de Palmares após recusar o acordo firmado entre o líder anterior, <strong>Ganga Zumba</strong>, e o governo colonial (1678), que não garantia a liberdade de todos.</p>
      <p>Em 1694, o principal núcleo de Palmares foi destruído por uma expedição comandada pelo bandeirante Domingos Jorge Velho. Zumbi resistiu, mas foi traído e morto em <strong>20 de novembro de 1695</strong>. Ele se tornou símbolo da resistência negra e da luta por liberdade, e seu nome está no <strong>Livro dos Heróis e Heroínas da Pátria</strong>.</p>` },
    { id: 'recreativo', unlock: 2, icon: '🎭', cat: 'Conceitos', title: 'O que é racismo recreativo?',
      body: `<p><strong>Racismo recreativo</strong> é o racismo disfarçado de humor: piadas, memes, apelidos e “brincadeiras” que usam a cor, o cabelo ou a cultura de pessoas negras como motivo de riso.</p>
      <p>O conceito foi desenvolvido pelo jurista brasileiro <strong>Adilson Moreira</strong>. Ele mostra que esse tipo de humor mantém o desprezo por pessoas negras enquanto parece “inofensivo”.</p>
      <p>A <strong>Lei 14.532/2023</strong> prevê aumento de pena quando o crime de racismo é cometido em contexto de descontração, diversão ou recreação. Ou seja: “era só brincadeira” não é desculpa.</p>` },
    { id: 'representatividade', unlock: 2, icon: '🌟', cat: 'Conceitos', title: 'O que é representatividade?',
      body: `<p><strong>Representatividade</strong> é a presença de diferentes grupos em espaços de visibilidade, poder e decisão: na TV, nos livros, na ciência, na política, nas empresas, nas redes.</p>
      <p>Segundo o <strong>Censo 2022 do IBGE</strong>, <strong>55,5%</strong> da população brasileira se declara preta ou parda. Mesmo assim, pessoas negras ainda são minoria em muitos espaços de liderança.</p>
      <p>Quando jovens negros se veem como cientistas, artistas, médicos, programadores e líderes, ampliam seus sonhos. Representatividade importa!</p>` },
    { id: 'dandara', unlock: 2, icon: '⚔️', cat: 'História', title: 'Dandara dos Palmares',
      body: `<p><strong>Dandara</strong> foi uma guerreira do Quilombo dos Palmares e companheira de Zumbi. Segundo os relatos que chegaram até nós, ela participava das estratégias de defesa e da luta contra as tropas coloniais, e defendia a liberdade de todo o povo de Palmares.</p>
      <p>Existem <strong>poucos documentos históricos</strong> sobre a vida dela — o que também mostra como a história de mulheres negras foi apagada. Muito do que se conhece vem da <strong>memória e da tradição oral</strong>, preservadas pelo movimento negro.</p>
      <p>Em <strong>2019</strong>, o nome de Dandara foi inscrito no <strong>Livro dos Heróis e Heroínas da Pátria</strong>. Ela é símbolo da força e do protagonismo das mulheres negras na resistência.</p>` },
    { id: 'cidadania', unlock: 3, icon: '🌐', cat: 'Cidadania digital', title: 'O que é cidadania digital?',
      body: `<p><strong>Cidadania digital</strong> é usar a internet de forma ética, segura, crítica e responsável, respeitando os direitos de todas as pessoas.</p>
      <p>Um cidadão digital:</p>
      <ul><li>pensa antes de postar e de compartilhar;</li><li>respeita a diversidade;</li><li>protege sua privacidade e a dos outros;</li><li>denuncia conteúdos discriminatórios;</li><li>apoia quem sofre ataques.</li></ul>
      <p>O que é crime fora da internet também é crime dentro dela.</p>` },
    { id: 'denunciar', unlock: 3, icon: '🚩', cat: 'Cidadania digital', title: 'Como denunciar conteúdos discriminatórios?',
      body: `<ol><li><strong>Não compartilhe</strong> o conteúdo, nem para criticar.</li>
      <li><strong>Registre evidências</strong>: prints com data, hora, nome do perfil e link. Guarde sem divulgar.</li>
      <li><strong>Denuncie na plataforma</strong>: quase todas as redes têm a opção “denunciar”.</li>
      <li><strong>Procure um adulto de confiança</strong>: família, professores, coordenação.</li>
      <li>Com apoio de um adulto, use <strong>canais oficiais</strong>: a <strong>SaferNet Brasil</strong> (denúncias de crimes na internet), o <strong>Disque 100</strong> (direitos humanos) ou uma <strong>delegacia</strong>, inclusive as delegacias on-line. Em emergências, ligue <strong>190</strong>.</li></ol>
      <p>Você não precisa confrontar o agressor nem se colocar em risco.</p>` },
    { id: 'estrutural', unlock: 4, icon: '🏛️', cat: 'Conceitos', title: 'O que é racismo estrutural?',
      body: `<p><strong>Racismo estrutural</strong> é quando o racismo está presente no funcionamento da sociedade — nas instituições, na economia, na educação, na mídia, nas tecnologias — e não apenas nas atitudes de algumas pessoas.</p>
      <p>No Brasil, ele tem raízes em mais de <strong>300 anos de escravidão</strong> e na forma como a abolição aconteceu (1888), sem garantir terra, educação ou trabalho digno à população negra. O Brasil foi o último país das Américas a abolir a escravidão.</p>
      <p>Hoje, ele aparece em desigualdades de renda, de acesso a oportunidades e de representação. Por isso, não basta “não ser racista”: é preciso ser <strong>antirracista</strong>.</p>` },
    { id: 'identidade', unlock: 4, icon: '👑', cat: 'Conceitos', title: 'O que é identidade negra?',
      body: `<p><strong>Identidade negra</strong> é o modo como pessoas negras se reconhecem, se afirmam e se relacionam com sua história, cultura, ancestralidade e aparência.</p>
      <p>Ela está nos cabelos crespos e cacheados, nas tranças e no black power, na música, na dança, na culinária, nas religiões de matriz africana, na literatura e na ciência.</p>
      <p>Intelectuais e artistas negros, como <strong>Lélia Gonzalez</strong>, <strong>Abdias Nascimento</strong>, <strong>Carolina Maria de Jesus</strong>, <strong>Conceição Evaristo</strong> e <strong>Milton Santos</strong>, mostram a enorme contribuição negra para o pensamento brasileiro. Valorizar a identidade negra é valorizar o Brasil.</p>` },
    { id: 'resistencia', unlock: 4, icon: '🔥', cat: 'História', title: 'A resistência negra no Brasil',
      body: `<p>Estima-se que cerca de <strong>4,8 milhões</strong> de africanos escravizados desembarcaram no Brasil — o maior número das Américas. Desde o início, houve <strong>resistência</strong>: fugas, quilombos, revoltas, preservação de culturas e religiões.</p>
      <ul><li><strong>Quilombos</strong>, como Palmares — muitas comunidades quilombolas existem até hoje.</li>
      <li><strong>Revolta dos Malês</strong> (Salvador, 1835), liderada por africanos muçulmanos escravizados e libertos.</li>
      <li><strong>Luís Gama</strong>, advogado autodidata que libertou centenas de pessoas na Justiça no século XIX.</li>
      <li><strong>Revolta da Chibata</strong> (1910), liderada pelo marinheiro João Cândido.</li>
      <li><strong>Teatro Experimental do Negro</strong> (1944), fundado por Abdias Nascimento.</li></ul>
      <p>A resistência negra continua hoje, nos movimentos sociais, na arte, na educação — e também nas redes.</p>` },
    { id: 'internet', unlock: 5, icon: '💻', cat: 'Cidadania digital', title: 'Como construir uma internet antirracista?',
      body: `<ul><li><strong>Diversifique seu feed</strong>: siga criadores negros de ciência, arte, games, história.</li>
      <li><strong>Pense antes de compartilhar</strong>: “isso ridiculariza alguém?”</li>
      <li><strong>Não ria</strong> de piadas racistas: quebrar o riso coletivo desestimula novas piadas.</li>
      <li><strong>Denuncie</strong> em vez de comentar ou repassar.</li>
      <li><strong>Acolha</strong> quem sofre ataques, respeitando a vontade da pessoa.</li>
      <li><strong>Aprenda</strong> sempre sobre história e cultura afro-brasileira.</li>
      <li><strong>Cobre</strong> das plataformas e empresas tecnologias sem vieses.</li></ul>
      <p>Na internet, respeito não é opcional!</p>` }
  ];

  /* ---------------- MEDALHAS ---------------- */
  const MEDALS = [
    { id: 'first', name: 'Primeiro Caso Investigado', desc: 'Concluiu a Fase 01.' },
    { id: 'memes', name: 'Detetive dos Memes', desc: 'Concluiu a Operação 02 — Investigando os memes.' },
    { id: 'empatia', name: 'Agente da Empatia', desc: 'Concluiu a Operação 03 — O que você faria?' },
    { id: 'cidad', name: 'Especialista em Cidadania Digital', desc: 'Concluiu a Operação 04 — Desmascarando o racismo.' },
    { id: 'transf', name: 'Agente da Transformação', desc: 'Concluiu a Operação 05 e a missão final.' },
    { id: 'perfect', name: 'Olhar Afiado', desc: 'Concluiu uma operação inteira sem nenhum erro.', extra: true },
    { id: 'leitor', name: 'Leitor do Dossiê', desc: 'Leu todos os 15 arquivos do Dossiê Antirracista.', extra: true }
  ];

  window.GAME_DATA = { OPERATIONS, PHASES, DOSSIER, MEDALS, MECH };
})();
