/* =========================================================
   MISSÃO RESPEITO — Conteúdo pedagógico
   5 mundos × 5 missões = 25 missões
   ========================================================= */
(function () {
  'use strict';

  const CHARACTERS = {
    ayo:   { name: 'Ayo',   color: '#FFC531', role: 'O detetive curioso', about: 'Adora investigar, fazer perguntas e descobrir pistas. Usa sempre a sua lupa.', hello: 'Oi! Eu sou o Ayo. Bora investigar comigo?' },
    kiara: { name: 'Kiara', color: '#FF8A3D', role: 'A contadora de histórias', about: 'Ama música, capoeira e histórias de família. Sabe muitas curiosidades.', hello: 'Oi, eu sou a Kiara! Adoro histórias e música.' },
    luna:  { name: 'Luna',  color: '#9B6BFF', role: 'A artista', about: 'Desenha o tempo todo e transforma ideias em cartazes coloridos.', hello: 'Olá! Sou a Luna. Vamos criar coisas lindas?' },
    kaua:  { name: 'Kauã',  color: '#2BB673', role: 'O bom ouvinte', about: 'É calmo, ouve com atenção e sempre pensa antes de agir.', hello: 'Oi, eu sou o Kauã. Vamos pensar juntos.' },
    mei:   { name: 'Mei',   color: '#3D8BFF', role: 'A pesquisadora', about: 'Ama ciência, livros e descobrir quem fez coisas importantes.', hello: 'Oi! Eu sou a Mei. Pesquisar é comigo!' },
    theo:  { name: 'Theo',  color: '#EF4E4E', role: 'O animado do esporte', about: 'Joga basquete em cadeira de rodas, conta piadas e anima a turma.', hello: 'E aí! Sou o Theo. Ninguém fica de fora no meu time!' },
    lucia: { name: 'Professora Lúcia', color: '#14A098', role: 'A professora', about: 'Ajuda a turma a conversar, aprender e resolver problemas com respeito.', hello: 'Olá! Pode contar comigo sempre que precisar.' }
  };

  /* ===================== MUNDO 1 ===================== */
  const W1 = {
    id: 'w1', num: 1, title: 'Detetives do Respeito', color: '#14A098', dark: '#0c6f69', icon: 'magnifier', guide: 'ayo',
    goal: 'Identificar situações de racismo, preconceito, discriminação e respeito.',
    medal: { name: 'Medalha Detetive do Respeito', icon: 'magnifier' },
    intro: 'Detetives do respeito observam com atenção. Vamos descobrir onde há respeito e onde há racismo!',
    celebration: 'Você virou Detetive do Respeito! Agora sabe perceber o racismo — até quando ele aparece disfarçado de "brincadeira".',
    missions: [
      {
        id: 'm1', title: 'Frases que machucam', type: 'classify', icon: '💬', guide: 'ayo', mood: 'happy',
        intro: ['Antes de tudo, uma pista importante:', '<b>Racismo</b> é quando alguém é tratado de forma pior por causa da cor da pele, do cabelo ou de traços do corpo ligados à sua origem. Isso é <b>discriminação</b> e causa sofrimento de verdade.', 'Vamos separar as frases que respeitam das que mostram preconceito?'],
        howto: [{ i: '👆', t: 'Arraste cada frase para a caixa certa.' }, { i: '👉', t: 'Ou toque na frase e depois na caixa.' }],
        data: {
          bins: [{ id: 'ok', label: 'Respeito', icon: '💚', cls: 'bin-ok' }, { id: 'bad', label: 'Preconceito', icon: '🚫', cls: 'bin-bad' }],
          items: [
            { t: 'Que legal o seu cabelo! Combina com você.', a: 'ok', why: 'Elogiar com sinceridade valoriza a pessoa.' },
            { t: 'Seu cabelo crespo é feio, você devia alisar.', a: 'bad', why: 'Cabelo crespo é lindo. Dizer que ele é feio é racismo: ataca uma característica ligada à origem africana.' },
            { t: 'Vem brincar com a gente!', a: 'ok', why: 'Convidar inclui. Todo mundo tem direito de brincar.' },
            { t: 'Não vou brincar com você por causa da sua cor.', a: 'bad', why: 'Excluir alguém pela cor da pele é discriminação racial. Machuca e é injusto.' },
            { t: 'Todas as cores de pele são bonitas.', a: 'ok', why: 'Isso mesmo! Nenhuma cor de pele é melhor que outra.' },
            { t: 'Princesa não pode ter pele escura.', a: 'bad', why: 'Qualquer criança pode ser princesa, rainha, cientista ou o que quiser. Isso é preconceito.' },
            { t: 'Me conta qual música você mais gosta?', a: 'ok', why: 'Mostrar interesse pelo outro aproxima as pessoas.' },
            { t: 'Aqui só entra quem tem cabelo liso.', a: 'bad', why: 'Separar pessoas pelo tipo de cabelo é discriminação.' },
            { t: 'Desculpa, eu errei. Não vou repetir.', a: 'ok', why: 'Reconhecer o erro e mudar a atitude é muito importante.' },
            { t: 'Vou te dar um apelido por causa do seu nariz.', a: 'bad', why: 'Apelidos sobre traços do corpo zombam da pessoa. Quando ligados à origem, são racismo.' }
          ]
        },
        lesson: 'Racismo não é uma simples falta de educação nem uma questão de opinião: é discriminação e machuca de verdade. Palavras podem acolher ou ferir — e nós escolhemos quais usar.'
      },
      {
        id: 'm2', title: 'Investigação no recreio', type: 'scene', icon: '🔍', guide: 'ayo', mood: 'thinking',
        intro: ['Chegou a hora do recreio!', 'Use sua lupa de detetive: há <b>3 situações de discriminação</b> escondidas nesta cena.', 'Toque em cada grupo para investigar.'],
        howto: [{ i: '🔍', t: 'Toque nos grupos de crianças.' }, { i: '🚩', t: 'Marque se há discriminação ou respeito.' }],
        data: {
          bg: 'recreio', need: 3,
          spots: [
            { kids: [['bia', 'smile', 'cross'], ['leo', 'smile', 'cross'], ['ayo', 'sad', 'down']], text: 'Bia e Léo dizem que Ayo não pode brincar de pega-pega por causa do cabelo crespo dele.', bad: true, why: 'Excluir alguém por causa do cabelo crespo é discriminação racial.' },
            { kids: [['kaua', 'happy', 'wave'], ['theo', 'happy', 'up']], text: 'Kauã e Theo jogam bola: "Passa pra mim, Theo!"', bad: false, why: 'Aqui todo mundo participa. Isso é respeito!' },
            { kids: [['caio', 'smile', 'point'], ['kiara', 'sad', 'down']], text: 'Caio diz que Kiara não pode ser a princesa da brincadeira porque "princesa tem que ser loira".', bad: true, why: 'Dizer que só pessoas loiras podem ser princesas é racismo. Kiara pode ser princesa, sim!' },
            { kids: [['mei', 'happy', 'hold'], ['luna', 'happy', 'hold']], text: 'Mei e Luna desenham juntas e trocam lápis de muitas cores.', bad: false, why: 'Dividir e criar juntas: respeito e amizade.' },
            { kids: [['davi', 'laugh', 'point'], ['rafa', 'laugh', 'down'], ['nina', 'sad', 'down']], text: 'Davi zomba do cabelo da Nina e chama os outros para rir.', bad: true, why: 'Zombar do cabelo de alguém, mesmo rindo, é uma ofensa racista. Rir junto também machuca.' },
            { kids: [['lucia', 'happy', 'wave'], ['sara', 'happy', 'up']], text: 'A Professora Lúcia ensina uma ciranda e todos dão as mãos.', bad: false, why: 'Brincadeira em que todos cabem. Que bom!' }
          ]
        },
        lesson: 'O racismo pode aparecer no recreio: na hora de escolher quem brinca, nas zombarias e nos "papéis" das brincadeiras. Perceber é o primeiro passo para mudar.'
      },
      {
        id: 'm3', title: 'Brincadeira ou ofensa?', type: 'traffic', icon: '🚦', guide: 'theo', mood: 'happy',
        intro: ['Eu adoro uma boa brincadeira!', 'Mas atenção: <b>brincadeira de verdade é quando todo mundo se diverte</b>. Se alguém é zoado por causa da cor, do cabelo ou do corpo, não é brincadeira: é ofensa.', 'Use o semáforo para decidir!'],
        howto: [{ i: '🟢', t: 'Verde: brincadeira respeitosa.' }, { i: '🔴', t: 'Vermelho: ofensa / racismo.' }],
        data: {
          items: [
            { t: 'No jogo, Theo inventa uma música engraçada sobre o time, e todos cantam juntos.', a: 'ok', why: 'Todos se divertem e ninguém é alvo. Brincadeira respeitosa!' },
            { t: 'Chamar um colega por um apelido sobre a cor da pele dele, "só de brincadeira".', a: 'bad', why: 'Mesmo que digam "é brincadeira", apelidos sobre a cor da pele são racismo e machucam.' },
            { t: 'Dizer que cabelo crespo é "cabelo ruim".', a: 'bad', why: 'Não existe cabelo ruim! Essa expressão é racista. O certo é dizer cabelo crespo ou cacheado — e todos são bonitos.' },
            { t: 'Brincar de capoeira no recreio, com todo mundo participando.', a: 'ok', why: 'A capoeira é uma tradição afro-brasileira linda, e todos podem aprender e jogar.' },
            { t: 'Imitar os traços do rosto de alguém para fazer os outros rirem.', a: 'bad', why: 'Imitar traços físicos para zombar é humilhante e preconceituoso.' },
            { t: 'Fazer careta junto com o amigo na hora da foto, e os dois rirem.', a: 'ok', why: 'Os dois escolheram brincar e se divertiram juntos.' },
            { t: 'Esconder a boneca negra da Kiara dizendo que "boneca bonita é a loira".', a: 'bad', why: 'Bonecas negras são lindas! Dizer o contrário ensina uma ideia racista.' },
            { t: 'Dizer que só o lápis bege é o "lápis cor de pele".', a: 'bad', why: 'Existem muitos tons de pele! Hoje há caixas de lápis com vários tons. Todos são "cor de pele".' },
            { t: 'Brincar de pega-pega em que todo mundo pode entrar.', a: 'ok', why: 'Ninguém fica de fora. Isso é respeito!' }
          ]
        },
        lesson: '"Era só brincadeira" não apaga a dor de quem foi ofendido. Uma brincadeira só é brincadeira quando todo mundo se diverte, inclusive quem está participando.'
      },
      {
        id: 'm4', title: 'Quem ficou de fora?', type: 'scene', icon: '👥', guide: 'kaua', mood: 'thinking',
        intro: ['Na sala de aula, a turma está formando grupos para um trabalho sobre o Brasil.', 'Algumas crianças estão sendo <b>excluídas por causa da aparência</b>. Encontre as <b>3 situações</b>.'],
        howto: [{ i: '🔍', t: 'Toque em cada grupo.' }, { i: '🚩', t: 'Descubra quem foi deixado de fora e por quê.' }],
        data: {
          bg: 'sala', need: 3,
          spots: [
            { kids: [['leo', 'smile', 'cross'], ['bia', 'smile', 'down'], ['kiara', 'sad', 'down']], text: 'O grupo do Léo diz para Kiara procurar "um grupo de gente parecida com ela".', bad: true, why: 'Separar pessoas pela cor da pele é discriminação racial. A escola é de todos!' },
            { kids: [['mei', 'happy', 'wave'], ['theo', 'happy', 'up']], text: 'Mei chama o Theo e arruma as mesas para a cadeira de rodas passar.', bad: false, why: 'Pensar no outro e incluir. Respeito em ação!' },
            { kids: [['caio', 'smile', 'point'], ['davi', 'smile', 'down'], ['sara', 'sad', 'down']], text: 'Caio quer só gente de cabelo liso na foto do cartaz e deixa Sara de fora.', bad: true, why: 'Escolher quem aparece pela cor ou cabelo é discriminação. O cartaz fica mais bonito com todo mundo.' },
            { kids: [['luna', 'happy', 'hold'], ['kaua', 'happy', 'hold']], text: 'Luna e Kauã combinam: "Cada um dá uma ideia. Todas são importantes."', bad: false, why: 'Ouvir todo mundo é um jeito de respeitar.' },
            { kids: [['rafa', 'smile', 'cross'], ['ayo', 'sad', 'down']], text: 'Rafa não quer sentar ao lado do Ayo por causa da cor da pele dele.', bad: true, why: 'Recusar ficar perto de alguém pela cor da pele é racismo. Isso precisa ser interrompido.' },
            { kids: [['nina', 'happy', 'wave'], ['pedro', 'happy', 'down']], text: 'A turma sugere o nome "Grupo Palmares" e todos votam juntos.', bad: false, why: 'Decidir juntos e conhecer nossa história. Muito bom!' }
          ]
        },
        lesson: 'Excluir alguém por causa da cor da pele, do cabelo ou dos traços do rosto é discriminação. Quando percebemos, podemos convidar, acolher e chamar um adulto.'
      },
      {
        id: 'm5', title: 'Conserte a cena', type: 'fixit', icon: '🛠️', guide: 'kiara', mood: 'smile',
        intro: ['Detetive não só descobre: também ajuda a <b>consertar</b>!', 'Em cada cena, alguém foi desrespeitado. Escolha a atitude que deixa a escola mais justa.'],
        howto: [{ i: '👀', t: 'Leia a cena.' }, { i: '✅', t: 'Escolha a melhor atitude.' }],
        data: {
          items: [
            {
              bg: 'recreio', victim: 'ayo', others: ['bia', 'leo'],
              t: 'Disseram que Ayo não podia brincar por causa do cabelo crespo dele. Ele está sozinho.',
              options: [
                { t: 'Convidar Ayo e dizer: "Aqui todo mundo pode brincar!"', ok: true, why: 'Você incluiu o Ayo e mostrou que a regra injusta não vale.' },
                { t: 'Deixar como está, não é problema meu.', ok: false, why: 'Quando ninguém faz nada, a exclusão continua. Combater o racismo é tarefa de todos.' },
                { t: 'Pedir para o Ayo prender o cabelo para ser aceito.', ok: false, why: 'Ayo não tem que mudar nada! O cabelo dele é lindo. Quem precisa mudar é a atitude de quem excluiu.' }
              ]
            },
            {
              bg: 'patio', victim: 'kiara', others: ['caio', 'davi'],
              t: 'Na peça da escola, disseram que Kiara não pode ser a rainha por ser negra.',
              options: [
                { t: 'Dar para Kiara um papel sem falas, para evitar briga.', ok: false, why: 'Isso continuaria tratando Kiara de forma injusta.' },
                { t: 'Dizer que qualquer pessoa pode ser rainha e pedir à professora uma escolha justa.', ok: true, why: 'Isso! Houve muitas rainhas negras na história, como as rainhas do Congo lembradas no maracatu.' },
                { t: 'Ficar quieto e esperar a peça acabar.', ok: false, why: 'O silêncio deixa Kiara sozinha. Você pode apoiar e chamar um adulto.' }
              ]
            },
            {
              bg: 'sala', victim: 'ninaTurban', others: ['rafa', 'bia'],
              t: 'Nina chegou de turbante e algumas crianças começaram a rir dela.',
              options: [
                { t: 'Rir junto para não ficar de fora.', ok: false, why: 'Rir junto aumenta a dor de quem está sendo zoado.' },
                { t: 'Sugerir que Nina tire o turbante para não chamar atenção.', ok: false, why: 'Nina tem o direito de usar o turbante. O problema é a zombaria, não ela.' },
                { t: 'Dizer "Zombar é desrespeito. Ficou lindo, Nina!" e ficar ao lado dela.', ok: true, why: 'Você interrompeu a zombaria e mostrou apoio. O turbante é um símbolo de beleza e de cultura.' }
              ]
            },
            {
              bg: 'sala', victim: 'kaua', others: ['davi'],
              t: 'Na hora de formar duplas, Davi diz que não quer sentar com o Kauã por causa da cor da pele dele.',
              options: [
                { t: 'Dizer que isso é discriminação, sentar com o Kauã e avisar a professora.', ok: true, why: 'Você apoiou o colega e chamou um adulto. Racismo também atinge pessoas indígenas e precisa ser enfrentado.' },
                { t: 'Trocar todo mundo de lugar para evitar confusão.', ok: false, why: 'Mudar de lugar não resolve. Davi precisa entender que isso é discriminação.' },
                { t: 'Dizer para o Kauã não ligar, que é bobagem.', ok: false, why: 'Não é bobagem: discriminar machuca. Kauã merece apoio, não que digam para ele "não ligar".' }
              ]
            }
          ]
        },
        lesson: 'Diante do desrespeito, podemos: não participar, apoiar quem foi atingido, falar com respeito e chamar um adulto. Nunca é a vítima que precisa mudar.'
      }
    ]
  };

  /* ===================== MUNDO 2 ===================== */
  const W2 = {
    id: 'w2', num: 2, title: 'Nossa História, Nossa Cultura', color: '#FF8A3D', dark: '#b85a1a', icon: 'berimbau', guide: 'kiara',
    goal: 'Valorizar a cultura afro-brasileira e suas contribuições.',
    medal: { name: 'Medalha Guardiã(o) da Cultura', icon: 'berimbau' },
    intro: 'A cultura afro-brasileira está na música, na comida, nas palavras, na ciência e na arte. Ela é rica, criativa e viva!',
    celebration: 'Você conheceu a riqueza da cultura afro-brasileira! Ela está no nosso jeito de falar, de comer, de dançar e de pensar.',
    missions: [
      {
        id: 'm6', title: 'Memória da cultura', type: 'memory', icon: '🃏', guide: 'kiara', mood: 'happy',
        intro: ['Na minha família, a gente adora música e comida boa!', 'Neste jogo da memória, encontre cada <b>desenho</b> com o seu <b>nome</b>.'],
        howto: [{ i: '🃏', t: 'Vire duas cartas.' }, { i: '🔗', t: 'Junte a figura com o nome certo.' }],
        data: {
          pairs: [
            { icon: 'berimbau', name: 'Berimbau', fact: 'O berimbau comanda o ritmo da roda de capoeira.' },
            { icon: 'atabaque', name: 'Atabaque', fact: 'O atabaque é um tambor de origem africana, tocado na capoeira, no jongo e em muitas festas.' },
            { icon: 'agogo', name: 'Agogô', fact: 'O agogô tem sinos de metal e veio de tradições africanas. Ele aparece no samba e na capoeira.' },
            { icon: 'acaraje', name: 'Acarajé', fact: 'O acarajé é um bolinho de feijão-fradinho frito no azeite de dendê. O ofício das baianas de acarajé é patrimônio do Brasil.' },
            { icon: 'abayomi', name: 'Abayomi', fact: 'A boneca Abayomi é feita de retalhos de pano, só com nós, sem cola e sem costura.' },
            { icon: 'turbante', name: 'Turbante', fact: 'O turbante é um tecido amarrado na cabeça. Para muitas pessoas negras, é símbolo de beleza, cultura e identidade.' }
          ]
        },
        lesson: 'Instrumentos, comidas, bonecas e roupas contam histórias. A cultura afro-brasileira faz parte do Brasil inteiro, todos os dias.'
      },
      {
        id: 'm7', title: 'Liga-liga das tradições', type: 'match', icon: '🔗', guide: 'kiara', mood: 'smile',
        intro: ['O Brasil tem muitas tradições afro-brasileiras, em todas as regiões!', 'Ligue cada <b>manifestação cultural</b> à sua <b>descrição</b>.'],
        howto: [{ i: '👆', t: 'Toque em um nome à esquerda.' }, { i: '👉', t: 'Depois toque na descrição certa.' }],
        data: {
          left: [
            { id: 'cap', t: 'Capoeira', icon: 'capoeira' },
            { id: 'sam', t: 'Samba de roda', icon: 'pandeiro' },
            { id: 'mar', t: 'Maracatu', icon: 'crown' },
            { id: 'jon', t: 'Jongo', icon: 'fire' },
            { id: 'aba', t: 'Abayomi', icon: 'abayomi' }
          ],
          right: [
            { id: 'cap', t: 'Mistura luta, dança e música. A roda é Patrimônio da Humanidade (UNESCO).' },
            { id: 'sam', t: 'Nasceu no Recôncavo Baiano, com palmas, viola e pandeiro. Também é Patrimônio da Humanidade.' },
            { id: 'mar', t: 'Cortejo de Pernambuco, com rei, rainha e muitos tambores.' },
            { id: 'jon', t: 'Dança do Sudeste, com tambores e versos cantados, muitas vezes perto de uma fogueira.' },
            { id: 'aba', t: 'Boneca feita só com nós de pano. Seu nome vem do iorubá.' }
          ]
        },
        lesson: 'As tradições afro-brasileiras são diferentes em cada lugar do Brasil e foram criadas e mantidas com muita criatividade e resistência.'
      },
      {
        id: 'm8', title: 'Quebra-cabeça da roda', type: 'puzzle', icon: '🧩', guide: 'kiara', mood: 'happy',
        intro: ['Ê, capoeira! Montei uma imagem da roda, mas as peças se misturaram.', 'Primeiro, <b>monte a imagem</b>. Depois, <b>monte as palavras</b> da nossa cultura.'],
        howto: [{ i: '🔄', t: 'Toque em duas peças para trocá-las de lugar.' }, { i: '🔤', t: 'Depois, toque nas sílabas na ordem certa.' }],
        data: {
          size: 3,
          words: [
            { w: ['CA', 'PO', 'EI', 'RA'], clue: 'Luta, dança e música com berimbau.' },
            { w: ['MA', 'RA', 'CA', 'TU'], clue: 'Cortejo com rei e rainha, em Pernambuco.' },
            { w: ['A', 'CA', 'RA', 'JÉ'], clue: 'Bolinho de feijão-fradinho frito no dendê.' },
            { w: ['GRI', 'Ô'], clue: 'Pessoa que guarda e conta as histórias de um povo, em tradições da África Ocidental.' }
          ],
          facts: 'A roda de capoeira foi reconhecida pela UNESCO, em 2014, como Patrimônio Cultural Imaterial da Humanidade.'
        },
        lesson: 'A capoeira foi perseguida no passado e hoje é reconhecida no mundo todo. Isso mostra a força e a resistência da cultura afro-brasileira.'
      },
      {
        id: 'm9', title: 'Heranças do dia a dia', type: 'classify', icon: '🧺', guide: 'mei', mood: 'happy',
        intro: ['Você sabia que usamos heranças africanas o tempo todo, sem perceber?', 'Elas estão na <b>música</b>, na <b>comida</b>, nas <b>palavras</b> e no <b>conhecimento</b>.', 'Coloque cada item na cesta certa!'],
        howto: [{ i: '👆', t: 'Arraste cada item para a cesta.' }, { i: '👉', t: 'Ou toque no item e depois na cesta.' }],
        data: {
          bins: [
            { id: 'mus', label: 'Música', icon: '🎵' },
            { id: 'com', label: 'Comida', icon: '🍲' },
            { id: 'pal', label: 'Palavras', icon: '💬' },
            { id: 'con', label: 'Conhecimento', icon: '💡' }
          ],
          items: [
            { t: 'Samba', a: 'mus', why: 'O samba tem raízes africanas e é uma das grandes criações da cultura brasileira.' },
            { t: 'Atabaque', a: 'mus', why: 'Tambor de origem africana.' },
            { t: 'Vatapá', a: 'com', why: 'Prato da culinária afro-baiana, feito com dendê.' },
            { t: 'Azeite de dendê', a: 'com', why: 'O dendê vem de uma palmeira africana e está em muitos pratos brasileiros.' },
            { t: 'Cafuné', a: 'pal', why: 'Cafuné vem do quimbundo, uma língua de Angola.' },
            { t: 'Caçula', a: 'pal', why: 'Caçula também vem do quimbundo e quer dizer o filho mais novo.' },
            { t: 'Moleque', a: 'pal', why: 'Palavra de origem quimbundo, usada no Brasil todo.' },
            { t: 'Trabalhar o ferro (metalurgia)', a: 'con', why: 'Povos africanos dominavam técnicas de trabalhar o ferro há muitos séculos.' },
            { t: 'Manuscritos de Tombuctu', a: 'con', why: 'Em Tombuctu (Mali), há manuscritos antigos sobre matemática, astronomia e medicina.' },
            { t: 'Pirâmides do Egito', a: 'con', why: 'O Egito fica na África! Suas pirâmides mostram muito conhecimento de matemática e engenharia.' }
          ]
        },
        lesson: 'A África é um continente enorme, com muitos povos, línguas e saberes. Muito do que somos no Brasil tem raízes africanas.'
      },
      {
        id: 'm10', title: 'Linha do tempo da luta e da criação', type: 'order', icon: '📜', guide: 'kiara', mood: 'thinking',
        intro: ['A história do povo negro no Brasil é de <b>luta, resistência e muitas conquistas</b>.', 'Coloque os acontecimentos em ordem, do <b>mais antigo</b> para o <b>mais recente</b>.'],
        howto: [{ i: '📅', t: 'Olhe os anos com atenção.' }, { i: '👆', t: 'Toque nos cartões na ordem certa.' }],
        data: {
          items: [
            { y: 'Anos 1600', t: 'O Quilombo dos Palmares, onde viveram Zumbi e Dandara, resiste por quase 100 anos.' },
            { y: '1888', t: 'Fim da escravidão no Brasil, conquistado com muita luta de pessoas negras e abolicionistas.' },
            { y: '1931', t: 'É criada a Frente Negra Brasileira, em São Paulo, para lutar por direitos.' },
            { y: '1978', t: 'Nasce o Movimento Negro Unificado, que luta contra o racismo.' },
            { y: '2003', t: 'Lei 10.639: as escolas devem ensinar história e cultura africana e afro-brasileira.' },
            { y: '2014', t: 'A roda de capoeira vira Patrimônio Cultural Imaterial da Humanidade.' },
            { y: '2024', t: 'O dia 20 de novembro passa a ser feriado em todo o Brasil: Dia Nacional de Zumbi e da Consciência Negra.' }
          ]
        },
        lesson: 'A população negra sempre lutou e criou. Muitos direitos de hoje foram conquistados por essa luta — e ela continua.'
      }
    ]
  };

  /* ===================== MUNDO 3 ===================== */
  const W3 = {
    id: 'w3', num: 3, title: 'E Agora, o que Fazer?', color: '#6A4CE0', dark: '#4630a8', icon: 'compass', guide: 'kaua',
    goal: 'Reconhecer e enfrentar situações de racismo, com segurança.',
    medal: { name: 'Medalha Agente da Ação', icon: 'hands' },
    intro: 'Nestas histórias, você decide o que fazer. Cada escolha tem uma consequência. Pense com calma!',
    celebration: 'Você aprendeu a agir! Não participar, apoiar, falar com respeito e chamar um adulto: assim se combate o racismo.',
    missions: [
      {
        id: 'm11', title: 'O apelido do cabelo', type: 'story', icon: '📖', guide: 'kaua', mood: 'thinking',
        intro: ['Nesta história, <b>você</b> faz parte da turma.', 'Leia, pense e escolha o que fazer. Se a escolha não ajudar, você pode tentar de novo.'],
        howto: [{ i: '📖', t: 'Leia a cena.' }, { i: '🤔', t: 'Escolha uma atitude e veja o que acontece.' }],
        data: {
          nodes: {
            start: {
              bg: 'sala', chars: [['rafa', 'laugh', 'point'], ['ayo', 'sad', 'down'], ['davi', 'laugh', 'down']],
              text: 'Ayo chegou com o cabelo black power bem bonito. Rafa inventou um apelido para zoar o cabelo dele, e alguns colegas riram. Ayo abaixou a cabeça.',
              ask: 'O que você faz?',
              choices: [
                { t: 'Rio junto, todo mundo está rindo.', icon: '😅', q: 'bad', res: 'Ayo fica ainda mais triste. Ele percebe que mais uma pessoa achou graça de algo que o machucou.', why: 'Rir junto faz a ofensa crescer. Quem ri também participa do racismo.' },
                { t: 'Digo: "Isso não tem graça. O cabelo do Ayo é lindo!" e sento perto dele.', icon: '💬', q: 'best', res: 'As risadas param. Ayo levanta a cabeça e sorri um pouquinho. Outra colega também vai sentar perto dele.', why: 'Você interrompeu a ofensa com respeito e mostrou apoio. Quando alguém fala, outras pessoas também têm coragem.', next: 'second', chars: [['rafa', 'surprised', 'down'], ['ayo', 'smile', 'down'], ['kiara', 'smile', 'wave']] },
                { t: 'Digo ao Ayo para cortar o cabelo, assim param de zoar.', icon: '✂️', q: 'bad', res: 'Ayo fica confuso e triste. Parece que a culpa é dele.', why: 'A culpa nunca é de quem sofre racismo! O cabelo crespo é lindo. Quem precisa mudar é quem ofendeu.' },
                { t: 'Fico quieto e finjo que não vi.', icon: '🙈', q: 'bad', res: 'A zoeira continua. Ayo sente que está sozinho.', why: 'O silêncio deixa a pessoa sozinha. Você pode ajudar com segurança: apoiar e chamar um adulto.' }
              ]
            },
            second: {
              bg: 'sala', chars: [['ayo', 'smile', 'down'], ['lucia', 'smile', 'down']],
              text: 'No intervalo, Rafa diz que "foi só brincadeira" e que ninguém precisa contar nada para a professora.',
              ask: 'E agora?',
              choices: [
                { t: 'Conto para a Professora Lúcia o que aconteceu.', icon: '👩🏾‍🏫', q: 'best', res: 'A professora conversa com a turma sobre cabelos crespos e sobre racismo. Rafa entende o erro e pede desculpas ao Ayo.', why: 'Chamar um adulto não é "dedurar": é proteger. Adultos responsáveis ajudam a resolver e a reparar o dano.', next: 'end' },
                { t: 'Deixo para lá, já passou.', icon: '🤷', q: 'bad', res: 'No dia seguinte, o apelido aparece de novo.', why: 'Quando ninguém fala, a situação costuma se repetir. Contar a um adulto ajuda a parar.' },
                { t: 'Espalho o apelido no grupo de mensagens da turma.', icon: '📱', q: 'bad', res: 'Mais gente vê o apelido, e Ayo fica muito magoado.', why: 'Espalhar uma ofensa, inclusive na internet, aumenta o dano. Racismo na internet também é racismo.' }
              ]
            },
            end: { final: true, bg: 'sala', chars: [['ayo', 'happy', 'wave'], ['rafa', 'smile', 'down'], ['kiara', 'happy', 'up']], text: 'Rafa pediu desculpas de verdade e prometeu não repetir. A turma fez um mural com o tema "Nossos cabelos, nossa história".' }
          }
        },
        lesson: 'Diante de um apelido racista: não ria, apoie quem foi atingido, diga com respeito que aquilo não tem graça e chame um adulto. A culpa nunca é de quem sofre racismo.'
      },
      {
        id: 'm12', title: 'Qual cor é mais bonita?', type: 'story', icon: '🎨', guide: 'luna', mood: 'thinking',
        intro: ['Na aula de artes, aconteceu uma coisa que me deixou pensando...', 'Me ajuda a decidir o que fazer?'],
        howto: [{ i: '📖', t: 'Leia a cena.' }, { i: '🤔', t: 'Escolha uma atitude e veja o que acontece.' }],
        data: {
          nodes: {
            start: {
              bg: 'arte', chars: [['bia', 'smile', 'point'], ['luna', 'worried', 'hold'], ['nina', 'sad', 'down']],
              text: 'Bia está pintando uma princesa e diz bem alto: "Pele clara é mais bonita que pele escura." Nina, que está do lado, fica em silêncio.',
              ask: 'O que você faz?',
              choices: [
                { t: 'Concordo, para não discutir com a Bia.', icon: '👍', q: 'bad', res: 'Nina se sente ainda pior. Agora são duas pessoas dizendo isso.', why: 'Concordar com uma ideia racista reforça essa ideia. Nenhuma cor de pele é mais bonita que outra.' },
                { t: 'Digo: "Todas as cores de pele são bonitas! Olha quantos tons existem."', icon: '🎨', q: 'best', res: 'Luna mostra os potes de tinta com muitos tons. Nina sorri e começa a pintar uma princesa parecida com ela.', why: 'Você respondeu com respeito e mostrou que a beleza está na diversidade.', next: 'second', chars: [['bia', 'thinking', 'down'], ['luna', 'happy', 'hold'], ['nina', 'happy', 'hold']] },
                { t: 'Rio e mudo de assunto.', icon: '😶', q: 'bad', res: 'Bia acha que todo mundo concorda com ela.', why: 'Quando ninguém questiona, a ideia racista continua circulando.' },
                { t: 'Peço para Nina explicar para a Bia por que ela está errada.', icon: '🗣️', q: 'bad', res: 'Nina fica sem graça. Ela não queria falar disso agora.', why: 'Quem sofre racismo não tem obrigação de explicar ou resolver. Quem presencia e os adultos devem agir.' }
              ]
            },
            second: {
              bg: 'arte', chars: [['lucia', 'smile', 'wave'], ['bia', 'thinking', 'down'], ['nina', 'happy', 'hold']],
              text: 'A Professora Lúcia ouviu a conversa e quer fazer uma atividade com a turma.',
              ask: 'Qual atividade ajuda mais?',
              choices: [
                { t: 'Cada criança mistura tintas para descobrir o seu próprio tom de pele.', icon: '🖌️', q: 'best', res: 'A turma descobre dezenas de tons diferentes. Bia percebe que não existe só um "tom bonito".', why: 'Atividades que mostram a variedade valorizam todo mundo sem comparar.', next: 'end' },
                { t: 'Fazer uma fila do tom mais claro ao mais escuro.', icon: '📏', q: 'bad', res: 'Algumas crianças ficam desconfortáveis por serem comparadas.', why: 'Comparar e classificar pessoas pela cor da pele reforça a discriminação, mesmo sem querer.' },
                { t: 'Votar qual cor de pele é a mais bonita.', icon: '🗳️', q: 'bad', res: 'A votação deixa muitas crianças tristes.', why: 'Competição entre cores de pele é sempre injusta. Todas têm o mesmo valor.' }
              ]
            },
            end: { final: true, bg: 'arte', chars: [['bia', 'happy', 'hold'], ['nina', 'happy', 'up'], ['luna', 'happy', 'wave']], text: 'O mural da turma ficou cheio de autorretratos, cada um com seu tom. Bia disse: "Eu não tinha pensado nisso. Todas as cores são bonitas!"' }
          }
        },
        lesson: 'Nenhuma cor de pele é mais bonita que outra. Podemos responder com respeito, mostrar a diversidade e nunca transformar cores em competição.'
      },
      {
        id: 'm13', title: 'Fora do grupo', type: 'story', icon: '🚪', guide: 'mei', mood: 'thinking',
        intro: ['Trabalho em grupo deveria ser legal para todo mundo...', 'Veja o que aconteceu e escolha como agir.'],
        howto: [{ i: '📖', t: 'Leia a cena.' }, { i: '🤔', t: 'Escolha uma atitude e veja o que acontece.' }],
        data: {
          nodes: {
            start: {
              bg: 'biblioteca', chars: [['leo', 'smile', 'cross'], ['kiara', 'sad', 'down'], ['mei', 'worried', 'down']],
              text: 'A turma vai pesquisar na biblioteca. Léo diz para Kiara: "No nosso grupo, não. Você não combina com a gente", olhando para o cabelo e a pele dela.',
              ask: 'O que você faz?',
              choices: [
                { t: 'Aceito, o grupo é do Léo.', icon: '🤐', q: 'bad', res: 'Kiara fica sozinha num canto da biblioteca.', why: 'Excluir alguém por causa da aparência é discriminação. Aceitar em silêncio deixa a exclusão acontecer.' },
                { t: 'Digo para Kiara procurar outro grupo.', icon: '👉', q: 'bad', res: 'Kiara se sente rejeitada de novo.', why: 'Isso joga o problema para Kiara. Ela não fez nada de errado.' },
                { t: 'Convido Kiara para o meu grupo e digo ao Léo que excluir pela aparência é discriminação.', icon: '🤝', q: 'best', res: 'Kiara entra no grupo e dá ótimas ideias. Léo fica pensando no que ouviu.', why: 'Você acolheu e também nomeou o problema com respeito.', next: 'second', chars: [['mei', 'happy', 'wave'], ['kiara', 'happy', 'hold'], ['leo', 'thinking', 'down']] },
                { t: 'Aviso a Professora Lúcia sobre o que aconteceu.', icon: '👩🏾‍🏫', q: 'good', res: 'A professora reorganiza a atividade e conversa com o Léo.', why: 'Chamar um adulto é uma ótima atitude! E você também pode acolher a Kiara enquanto isso.', next: 'second', chars: [['lucia', 'smile', 'down'], ['kiara', 'smile', 'down'], ['leo', 'thinking', 'down']] }
              ]
            },
            second: {
              bg: 'biblioteca', chars: [['leo', 'worried', 'down'], ['mei', 'smile', 'down']],
              text: 'Depois, Léo diz: "Mas era só brincadeira! Por que estão fazendo tanto drama?"',
              ask: 'O que você responde?',
              choices: [
                { t: '"Excluir alguém pela aparência machuca, mesmo como brincadeira. Que tal conhecer a Kiara?"', icon: '💬', q: 'best', res: 'Léo fica em silêncio, pensa e depois vai conversar com a Kiara.', why: 'Você explicou com calma e abriu uma chance de Léo mudar a atitude.', next: 'end' },
                { t: '"Tá bom, então esquece."', icon: '🤷', q: 'bad', res: 'Léo continua achando que não fez nada de errado.', why: 'Chamar a discriminação de "drama" diminui a dor de quem foi atingido. Vale explicar.' },
                { t: 'Xingo o Léo bem alto.', icon: '😡', q: 'bad', res: 'Começa uma briga e ninguém se escuta.', why: 'Responder com ofensa cria mais conflito. Podemos ser firmes sem desrespeitar.' }
              ]
            },
            end: { final: true, bg: 'biblioteca', chars: [['leo', 'smile', 'down'], ['kiara', 'happy', 'wave'], ['mei', 'happy', 'up']], text: 'Léo pediu desculpas à Kiara. No fim, os dois grupos apresentaram juntos um trabalho incrível sobre o Quilombo dos Palmares.' }
          }
        },
        lesson: 'Excluir por causa da aparência é discriminação, mesmo quando chamam de "brincadeira". Podemos acolher, explicar com calma e buscar ajuda de um adulto.'
      },
      {
        id: 'm14', title: 'A imitação', type: 'story', icon: '🎭', guide: 'theo', mood: 'worried',
        intro: ['No recreio, vi uma coisa que não teve graça nenhuma.', 'Você decide o que fazer. E depois, vamos pensar em como <b>reparar o erro</b>.'],
        howto: [{ i: '📖', t: 'Leia a cena.' }, { i: '🤔', t: 'Escolha uma atitude e veja o que acontece.' }],
        data: {
          nodes: {
            start: {
              bg: 'recreio', chars: [['davi', 'laugh', 'up'], ['ayo', 'sad', 'down'], ['gui', 'laugh', 'point']],
              text: 'Davi começou a imitar o Ayo de um jeito que zomba dos traços do rosto dele. Um colega maior quer filmar com o celular.',
              ask: 'O que você faz?',
              choices: [
                { t: 'Filmo também e mando para os amigos.', icon: '📹', q: 'bad', res: 'O vídeo se espalha, e Ayo fica muito magoado.', why: 'Compartilhar uma zombaria racista espalha o dano. Na internet ele pode durar muito tempo.' },
                { t: 'Digo: "Para, Davi. Isso é preconceito e machuca." e pergunto se o Ayo está bem.', icon: '✋', q: 'best', res: 'Davi para. Ayo diz baixinho: "Obrigado por ficar do meu lado."', why: 'Você interrompeu a ofensa com segurança e cuidou de quem foi atingido.', next: 'second', chars: [['davi', 'surprised', 'down'], ['ayo', 'smile', 'down'], ['theo', 'smile', 'up']] },
                { t: 'Chamo a inspetora ou a professora.', icon: '👩🏾‍🏫', q: 'good', res: 'Um adulto chega rápido e a imitação para.', why: 'Chamar um adulto é sempre uma ótima escolha, principalmente quando há crianças maiores envolvidas.', next: 'second', chars: [['lucia', 'smile', 'down'], ['davi', 'worried', 'down'], ['ayo', 'smile', 'down']] },
                { t: 'Rio um pouquinho, mas não filmo.', icon: '😬', q: 'bad', res: 'Davi continua, porque acha que está fazendo sucesso.', why: 'Mesmo uma risadinha incentiva a zombaria.' }
              ]
            },
            second: {
              bg: 'patio', chars: [['davi', 'worried', 'down'], ['lucia', 'smile', 'down']],
              text: 'A Professora Lúcia conversa com o Davi. Ele percebe que errou. O que o Davi deve fazer agora?',
              ask: 'Como reparar o erro?',
              choices: [
                { t: 'Dizer só "foi mal, era zoeira".', icon: '🙄', q: 'bad', res: 'Ayo não sente que Davi entendeu de verdade.', why: 'Um pedido de desculpas de verdade reconhece o erro, sem diminuí-lo.' },
                { t: 'Pedir desculpas de verdade, dizer que entendeu o erro e não repetir.', icon: '🤝', q: 'best', res: 'Ayo aceita conversar. Davi passa a defender colegas quando vê situações parecidas.', why: 'Reparar o dano é reconhecer o erro, pedir desculpas sinceras e mudar a atitude.', next: 'end' },
                { t: 'Pedir para o Ayo esquecer o que aconteceu.', icon: '🫥', q: 'bad', res: 'Ayo se sente pressionado.', why: 'Quem foi atingido não precisa "esquecer". Quem errou é quem precisa mudar.' }
              ]
            },
            end: { final: true, bg: 'patio', chars: [['davi', 'smile', 'down'], ['ayo', 'happy', 'wave'], ['theo', 'happy', 'up']], text: 'Davi pediu desculpas, e a turma combinou: "Aqui ninguém imita para zombar. Aqui a gente respeita."' }
          }
        },
        lesson: 'Imitar traços de alguém para zombar é racismo. Podemos interromper, cuidar de quem foi atingido e chamar um adulto. Quem errou pode reparar: reconhecer, pedir desculpas e mudar.'
      },
      {
        id: 'm15', title: 'Eu vi. E agora?', type: 'story', icon: '👀', guide: 'kaua', mood: 'worried',
        intro: ['Às vezes a gente vê um racismo acontecer e não sabe o que fazer.', 'Nesta história, vamos descobrir como ajudar <b>com segurança</b>.'],
        howto: [{ i: '📖', t: 'Leia a cena.' }, { i: '🤔', t: 'Escolha uma atitude e veja o que acontece.' }],
        data: {
          nodes: {
            start: {
              bg: 'saida', chars: [['pedro', 'laugh', 'point'], ['gui', 'laugh', 'down'], ['kiara', 'sad', 'down']],
              text: 'Na saída da escola, dois estudantes mais velhos fazem comentários racistas sobre o turbante e a pele da Kiara. Você está por perto e sente medo.',
              ask: 'O que você faz?',
              choices: [
                { t: 'Parto para cima deles e grito.', icon: '👊', q: 'bad', res: 'Os mais velhos ficam bravos e a situação fica perigosa.', why: 'Sua segurança é importante. Enfrentar sozinho, com briga, pode piorar. Há jeitos seguros de ajudar.' },
                { t: 'Vou para casa e tento esquecer.', icon: '🚶', q: 'bad', res: 'Kiara fica sozinha com os dois.', why: 'Sentir medo é normal, mas mesmo com medo dá para ajudar de um jeito seguro.' },
                { t: 'Fico ao lado da Kiara, saímos dali e procuramos um adulto.', icon: '🛡️', q: 'best', res: 'Vocês saem dali e encontram a Professora Lúcia no portão.', why: 'Ficar ao lado de quem foi atingido e buscar um adulto é seguro e muito eficaz.', next: 'second', chars: [['kiara', 'worried', 'down'], ['lucia', 'smile', 'down']] },
                { t: 'Dou risada para os mais velhos não mexerem comigo.', icon: '😬', q: 'bad', res: 'Kiara vê você rindo e se sente traída.', why: 'Rir junto, mesmo com medo, aumenta a dor de quem é atingido.' }
              ]
            },
            second: {
              bg: 'saida', chars: [['kiara', 'sad', 'down']],
              text: 'Kiara está chateada. Ela diz: "Será que eu devia parar de usar turbante?"',
              ask: 'O que você diz?',
              choices: [
                { t: '"Talvez seja melhor tirar, para não chamarem atenção."', icon: '🙁', q: 'bad', res: 'Kiara fica ainda mais triste.', why: 'A culpa nunca é de quem sofre racismo. Kiara tem todo o direito de ser quem ela é.' },
                { t: '"A culpa não é sua. Seu turbante é lindo. Estou com você."', icon: '💛', q: 'best', res: 'Kiara respira fundo e sorri. "Obrigada por ficar comigo."', why: 'Apoiar é lembrar que a pessoa não tem culpa e não está sozinha.', next: 'third' },
                { t: '"Ah, eles são assim mesmo, ignora."', icon: '😑', q: 'bad', res: 'Kiara sente que ninguém leva o que aconteceu a sério.', why: 'Racismo não deve ser ignorado. Ele precisa ser enfrentado pelos adultos e por todos.' }
              ]
            },
            third: {
              bg: 'saida', chars: [['lucia', 'smile', 'wave'], ['kiara', 'smile', 'down']],
              text: 'O que fazer com o que aconteceu?',
              ask: 'Quem deve saber?',
              choices: [
                { t: 'Ninguém. É melhor guardar segredo.', icon: '🤫', q: 'bad', res: 'Os mais velhos continuam fazendo isso com outras crianças.', why: 'Racismo é grave. Adultos responsáveis precisam saber para agir.' },
                { t: 'Contar para a professora, a coordenação e a família.', icon: '📣', q: 'best', res: 'A escola conversa com os estudantes mais velhos e com as famílias. A situação é tratada com seriedade.', why: 'A escola e as famílias têm o dever de proteger as crianças e de combater o racismo.', next: 'end' }
              ]
            },
            end: { final: true, bg: 'saida', chars: [['kiara', 'happy', 'wave'], ['lucia', 'happy', 'up']], text: 'A escola tratou o caso com seriedade. Kiara continuou usando seus turbantes coloridos, e a amizade de vocês ficou ainda mais forte.' }
          }
        },
        lesson: 'Ao ver racismo: mantenha-se em segurança, fique ao lado de quem foi atingido, procure um adulto e conte o que aconteceu. Racismo é grave e os adultos têm o dever de agir.'
      }
    ]
  };

  /* ===================== MUNDO 4 ===================== */
  const PEOPLE_BIOS = {
    zumbi: {
      name: 'Zumbi dos Palmares', years: 'c. 1655 – 1695', area: 'Liderança e luta pela liberdade', color: '#8B5A3C', icon: 'quilombo',
      facts: [
        'Foi o último líder do Quilombo dos Palmares, na Serra da Barriga, onde hoje é Alagoas.',
        'Palmares foi uma grande comunidade de pessoas que fugiram da escravidão e viviam em liberdade, com plantações e organização própria.',
        'Zumbi morreu em 20 de novembro de 1695. Hoje essa data é o Dia Nacional de Zumbi e da Consciência Negra.'
      ],
      clues: ['Fui líder de uma comunidade de pessoas que buscavam a liberdade.', 'Vivi na Serra da Barriga, onde hoje é Alagoas.', 'O dia 20 de novembro lembra a minha luta.']
    },
    dandara: {
      name: 'Dandara dos Palmares', years: 'século XVII', area: 'Liderança e luta pela liberdade', color: '#C0392B', icon: 'crown',
      facts: [
        'Foi uma guerreira do Quilombo dos Palmares e companheira de Zumbi.',
        'Lutou pela liberdade do seu povo e é lembrada como símbolo da força das mulheres negras.',
        'Há poucos documentos escritos sobre ela: sua história foi mantida viva pela memória do povo. Em 2019, seu nome entrou no Livro dos Heróis e Heroínas da Pátria.'
      ],
      clues: ['Fui uma guerreira que lutou pela liberdade.', 'Vivi no Quilombo dos Palmares.', 'Sou símbolo da força das mulheres negras e fui companheira de Zumbi.']
    },
    machado: {
      name: 'Machado de Assis', years: '1839 – 1908', area: 'Literatura', color: '#2B2140', icon: 'pen',
      facts: [
        'Nasceu no Rio de Janeiro, em 1839. Começou a trabalhar cedo e aprendeu muito lendo.',
        'Escreveu livros famosos, como "Dom Casmurro" e "Memórias Póstumas de Brás Cubas".',
        'Ajudou a fundar a Academia Brasileira de Letras e foi o seu primeiro presidente, em 1897.'
      ],
      clues: ['Sou considerado um dos maiores escritores do Brasil.', 'Nasci no Rio de Janeiro, em 1839.', 'Fui o primeiro presidente da Academia Brasileira de Letras.']
    },
    carolina: {
      name: 'Carolina Maria de Jesus', years: '1914 – 1977', area: 'Literatura', color: '#2E86C1', icon: 'book',
      facts: [
        'Nasceu em Sacramento, Minas Gerais, em 1914. Estudou só cerca de dois anos na escola, mas amava ler e escrever.',
        'Escrevia diários em cadernos, contando o seu dia a dia na comunidade onde morava, em São Paulo.',
        'Seu livro "Quarto de Despejo", de 1960, fez enorme sucesso e foi traduzido para mais de dez línguas.'
      ],
      clues: ['Eu escrevia diários em cadernos.', 'Nasci em Minas Gerais e morei em São Paulo.', 'Escrevi o livro "Quarto de Despejo".']
    },
    conceicao: {
      name: 'Conceição Evaristo', years: 'nascida em 1946', area: 'Literatura e educação', color: '#C0392B', icon: 'words',
      facts: [
        'Nasceu em Belo Horizonte, Minas Gerais, em 1946.',
        'É escritora, poeta e professora. Estudou muito e se tornou doutora em Literatura.',
        'Criou a palavra "escrevivência": escrever a partir das vivências, especialmente das mulheres negras. Escreveu "Ponciá Vicêncio" e "Olhos d\'água".'
      ],
      clues: ['Sou escritora, poeta e professora.', 'Nasci em Belo Horizonte, em 1946.', 'Criei a palavra "escrevivência".']
    },
    milton: {
      name: 'Milton Santos', years: '1926 – 2001', area: 'Geografia', color: '#34495E', icon: 'globe',
      facts: [
        'Nasceu em Brotas de Macaúbas, na Bahia, em 1926.',
        'Foi geógrafo e professor, e deu aulas em universidades do Brasil e de outros países.',
        'Estudou as cidades e a globalização. Em 1994, ganhou o Prêmio Vautrin Lud, conhecido como o "Nobel da Geografia".'
      ],
      clues: ['Estudei as cidades e como o mundo está conectado.', 'Nasci na Bahia, em 1926.', 'Ganhei o prêmio conhecido como "Nobel da Geografia".']
    },
    antonieta: {
      name: 'Antonieta de Barros', years: '1901 – 1952', area: 'Educação e política', color: '#6C3483', icon: 'school',
      facts: [
        'Nasceu em Florianópolis, Santa Catarina, em 1901. Foi professora e jornalista.',
        'Criou um curso para ensinar pessoas a ler e escrever.',
        'Em 1934, foi a primeira mulher negra eleita deputada estadual no Brasil. Propôs o Dia do Professor (15 de outubro) em Santa Catarina; depois, a data passou a ser comemorada no país todo.'
      ],
      clues: ['Fui professora e jornalista em Santa Catarina.', 'Fui a primeira mulher negra eleita deputada estadual no Brasil.', 'Propus a criação do Dia do Professor.']
    },
    lelia: {
      name: 'Lélia Gonzalez', years: '1935 – 1994', area: 'Ciências sociais e movimento negro', color: '#E67E22', icon: 'mic',
      facts: [
        'Nasceu em Belo Horizonte, Minas Gerais, em 1935.',
        'Foi professora, filósofa e antropóloga: estudava as culturas e os modos de vida das pessoas.',
        'Ajudou a fundar o Movimento Negro Unificado, em 1978, e mostrou como as línguas africanas influenciaram o português do Brasil, que ela chamou de "pretuguês".'
      ],
      clues: ['Fui professora, filósofa e antropóloga.', 'Ajudei a fundar o Movimento Negro Unificado.', 'Chamei o português falado no Brasil de "pretuguês".']
    }
  };

  const W4 = {
    id: 'w4', num: 4, title: 'Grandes Personalidades Negras', color: '#E9A23B', dark: '#a76a0c', icon: 'star', guide: 'mei',
    goal: 'Conhecer personalidades negras brasileiras e suas contribuições.',
    medal: { name: 'Medalha Pesquisador(a) de Histórias', icon: 'book' },
    intro: 'Liderança, literatura, geografia, educação, ciência... Pessoas negras construíram e constroem o Brasil em todas as áreas!',
    celebration: 'Você conheceu pessoas incríveis! Zumbi, Dandara, Machado, Carolina, Conceição, Milton, Antonieta e Lélia fazem parte da história de todos nós.',
    missions: [
      {
        id: 'm16', title: 'Galeria: liberdade e palavras', type: 'bios', icon: '🖼️', guide: 'mei', mood: 'happy',
        intro: ['Bem-vindo à galeria! Aqui você vai conhecer <b>quatro personalidades</b>.', 'Leia os cartões com calma. Depois, vem um desafio!'],
        howto: [{ i: '⬅️➡️', t: 'Passe os cartões com as setas.' }, { i: '🔗', t: 'Depois, ligue cada pessoa à sua conquista.' }],
        data: {
          people: ['zumbi', 'dandara', 'machado', 'carolina'],
          match: [
            { id: 'zumbi', t: 'Liderou o Quilombo dos Palmares.' },
            { id: 'dandara', t: 'Guerreira de Palmares, símbolo da força das mulheres negras.' },
            { id: 'machado', t: 'Escreveu "Dom Casmurro" e presidiu a Academia Brasileira de Letras.' },
            { id: 'carolina', t: 'Escreveu "Quarto de Despejo", a partir dos seus diários.' }
          ]
        },
        lesson: 'Zumbi e Dandara lutaram pela liberdade. Machado e Carolina transformaram palavras em obras que o mundo inteiro lê.'
      },
      {
        id: 'm17', title: 'Galeria: saberes que transformam', type: 'bios', icon: '🖼️', guide: 'mei', mood: 'happy',
        intro: ['Mais quatro personalidades para conhecer!', 'Elas se destacaram na <b>literatura</b>, na <b>geografia</b>, na <b>educação</b> e nas <b>ciências sociais</b>.'],
        howto: [{ i: '⬅️➡️', t: 'Passe os cartões com as setas.' }, { i: '🔗', t: 'Depois, ligue cada pessoa à sua conquista.' }],
        data: {
          people: ['conceicao', 'milton', 'antonieta', 'lelia'],
          match: [
            { id: 'conceicao', t: 'Criou a palavra "escrevivência".' },
            { id: 'milton', t: 'Geógrafo que ganhou o "Nobel da Geografia".' },
            { id: 'antonieta', t: 'Primeira mulher negra eleita deputada estadual no Brasil.' },
            { id: 'lelia', t: 'Ajudou a fundar o Movimento Negro Unificado.' }
          ]
        },
        lesson: 'Conhecimento, escrita, política e pesquisa: pessoas negras são protagonistas em todas as áreas.'
      },
      {
        id: 'm18', title: 'Quem sou eu?', type: 'whoami', icon: '❓', guide: 'ayo', mood: 'thinking',
        intro: ['Hora de usar as pistas, detetive!', 'Leia a pista e toque na personalidade certa. Se precisar, peça <b>mais uma pista</b> — mas quanto menos pistas, mais pontos!'],
        howto: [{ i: '🧩', t: 'Leia a pista.' }, { i: '👆', t: 'Toque na pessoa certa.' }, { i: '➕', t: 'Peça outra pista se precisar.' }],
        data: { order: ['carolina', 'milton', 'dandara', 'antonieta', 'machado', 'lelia', 'zumbi', 'conceicao'] },
        lesson: 'Cada uma dessas pessoas deixou marcas na história do Brasil. Conhecer essas histórias é conhecer o nosso país.'
      },
      {
        id: 'm19', title: 'Memória das conquistas', type: 'memory', icon: '🃏', guide: 'mei', mood: 'happy',
        intro: ['Jogo da memória especial!', 'Encontre cada <b>personalidade</b> com a sua <b>área de atuação</b>.'],
        howto: [{ i: '🃏', t: 'Vire duas cartas.' }, { i: '🔗', t: 'Junte a pessoa com a área certa.' }],
        data: {
          portraits: true,
          pairs: [
            { person: 'zumbi', name: 'Liderança em Palmares', icon: 'quilombo', fact: 'Zumbi liderou o Quilombo dos Palmares na luta pela liberdade.' },
            { person: 'machado', name: 'Romances e contos', icon: 'pen', fact: 'Machado de Assis escreveu romances, contos, poemas e crônicas.' },
            { person: 'carolina', name: 'Diários', icon: 'book', fact: 'Carolina Maria de Jesus escrevia diários que viraram livros.' },
            { person: 'milton', name: 'Geografia', icon: 'globe', fact: 'Milton Santos estudou cidades e a globalização.' },
            { person: 'antonieta', name: 'Educação e política', icon: 'school', fact: 'Antonieta de Barros foi professora e deputada.' },
            { person: 'lelia', name: 'Movimento negro', icon: 'mic', fact: 'Lélia Gonzalez estudou o racismo e ajudou a fundar o MNU.' }
          ]
        },
        lesson: 'Pessoas negras brasileiras se destacaram em muitas áreas diferentes. Não existe uma única área "para" ninguém.'
      },
      {
        id: 'm20', title: 'Fichas da pesquisa', type: 'fillblank', icon: '📝', guide: 'mei', mood: 'thinking',
        intro: ['Estou montando as fichas de pesquisa, mas faltam algumas palavras!', 'Complete cada ficha com a palavra certa.'],
        howto: [{ i: '👆', t: 'Arraste a palavra para o espaço.' }, { i: '👉', t: 'Ou toque na palavra e depois no espaço.' }],
        data: {
          sentences: [
            { p: 'machado', b: 'Machado de Assis foi o primeiro presidente da Academia Brasileira de ___.', a: 'Letras' },
            { p: 'carolina', b: 'Carolina Maria de Jesus escreveu o livro "Quarto de ___".', a: 'Despejo' },
            { p: 'conceicao', b: 'Conceição Evaristo criou a palavra ___.', a: 'escrevivência' },
            { p: 'zumbi', b: 'Zumbi foi líder do Quilombo dos ___.', a: 'Palmares' },
            { p: 'dandara', b: 'Dandara foi uma ___ que lutou pela liberdade.', a: 'guerreira' },
            { p: 'milton', b: 'Milton Santos foi um grande ___ brasileiro.', a: 'geógrafo' },
            { p: 'antonieta', b: 'Antonieta de Barros propôs o Dia do ___ em Santa Catarina.', a: 'Professor' },
            { p: 'lelia', b: 'Lélia Gonzalez ajudou a fundar o Movimento Negro ___.', a: 'Unificado' }
          ],
          extra: ['Futebol', 'Esquecido']
        },
        lesson: 'Pesquisar e registrar com cuidado ajuda a contar histórias verdadeiras e a valorizar quem construiu o Brasil.'
      }
    ]
  };

  /* ===================== MUNDO 5 ===================== */
  const W5 = {
    id: 'w5', num: 5, title: 'Construindo uma Escola Antirracista', color: '#FF5C8A', dark: '#c22a5a', icon: 'school', guide: 'luna',
    goal: 'Transformar o aprendizado em atitudes práticas.',
    medal: { name: 'Medalha Construtor(a) da Escola Antirracista', icon: 'school' },
    intro: 'Agora é hora de colocar a mão na massa: frases, murais, cartazes e uma grande campanha!',
    celebration: 'Você construiu, com palavras e atitudes, uma escola antirracista!',
    missions: [
      {
        id: 'm21', title: 'Frases que transformam', type: 'sentences', icon: '✍️', guide: 'luna', mood: 'happy',
        intro: ['Palavras podem mudar o mundo!', 'Complete cada frase com o final certo. As frases vão para o seu <b>Caderno de Frases</b> e podem ir para o cartaz final.'],
        howto: [{ i: '✍️', t: 'Escolha o final de cada frase.' }, { i: '📒', t: 'No fim, se quiser, escreva a sua própria frase.' }],
        data: {
          items: [
            { s: 'O racismo...', o: [{ t: 'machuca e precisa ser combatido.', ok: true }, { t: 'é só uma brincadeira.', ok: false, why: 'Racismo nunca é brincadeira: é discriminação e causa dor.' }, { t: 'não é problema meu.', ok: false, why: 'Combater o racismo é responsabilidade de todos.' }] },
            { s: 'Todo tipo de cabelo — crespo, cacheado ou liso...', o: [{ t: 'precisa ser alisado.', ok: false, why: 'Ninguém precisa mudar o cabelo para ser respeitado. Todos os tipos de cabelo são bonitos.' }, { t: 'é bonito e merece respeito.', ok: true }, { t: 'deve ser escondido.', ok: false, why: 'Ninguém precisa esconder quem é.' }] },
            { s: 'Quando vejo alguém sofrendo racismo, eu...', o: [{ t: 'finjo que não vi.', ok: false, why: 'O silêncio deixa a pessoa sozinha.' }, { t: 'rio para não ficar de fora.', ok: false, why: 'Rir junto aumenta a ofensa.' }, { t: 'fico ao lado da pessoa e chamo um adulto.', ok: true }] },
            { s: 'A cultura afro-brasileira...', o: [{ t: 'está na música, na comida, nas palavras e na ciência.', ok: true }, { t: 'é só coisa do passado.', ok: false, why: 'Ela é viva e está presente hoje, em todo lugar!' }, { t: 'só aparece em novembro.', ok: false, why: 'Ela está presente todos os dias do ano.' }] },
            { s: 'Combater o racismo é...', o: [{ t: 'só tarefa de quem sofre racismo.', ok: false, why: 'Quem sofre racismo não deve carregar essa luta sozinho.' }, { t: 'tarefa de todos nós, todos os dias.', ok: true }, { t: 'coisa só de gente grande.', ok: false, why: 'Crianças também podem agir: apoiando, respeitando e chamando adultos.' }] }
          ]
        },
        lesson: 'Frases antirracistas lembram a todos que o respeito é um compromisso diário. Você já tem um caderno cheio delas!'
      },
      {
        id: 'm22', title: 'Mural coletivo', type: 'mural', icon: '📌', guide: 'theo', mood: 'happy',
        intro: ['A turma vai montar um mural no corredor da escola!', 'Escolha as <b>mensagens que combatem o racismo</b> e prenda no mural. Cuidado: algumas mensagens não ajudam.'],
        howto: [{ i: '📌', t: 'Arraste a mensagem para o mural.' }, { i: '👉', t: 'Ou toque na mensagem e depois no mural.' }],
        data: {
          need: 6,
          items: [
            { t: 'Aqui, todo mundo pode brincar!', ok: true },
            { t: 'Racismo não existe mais.', ok: false, why: 'Infelizmente, o racismo ainda existe e precisa ser enfrentado.' },
            { t: 'Todas as cores de pele são bonitas.', ok: true },
            { t: 'Viu racismo? Apoie quem foi atingido e chame um adulto.', ok: true },
            { t: 'Cada um no seu grupo, sem misturar.', ok: false, why: 'Separar pessoas é o contrário de respeito. A diversidade nos enriquece.' },
            { t: 'Nossa história tem Zumbi, Dandara, Carolina e muito mais!', ok: true },
            { t: 'Quem sofre racismo deve ignorar.', ok: false, why: 'Ninguém deve ignorar o racismo. A responsabilidade de agir é de todos, especialmente dos adultos.' },
            { t: 'Respeito se aprende e se pratica todo dia.', ok: true },
            { t: 'Só vamos falar disso no dia 20 de novembro.', ok: false, why: 'O 20 de novembro é muito importante, mas a educação antirracista acontece o ano inteiro.' },
            { t: 'Seu cabelo, sua identidade: respeito!', ok: true }
          ]
        },
        lesson: 'Um mural coletivo mostra que a escola inteira está junta contra o racismo. Mensagens boas acolhem, valorizam e convidam à ação.'
      },
      {
        id: 'm23', title: 'Oficina de cartazes', type: 'poster', icon: '🖌️', guide: 'luna', mood: 'happy',
        intro: ['Bem-vindo à minha oficina!', 'Um bom cartaz tem: <b>título</b>, <b>imagem</b>, <b>mensagem</b> e <b>cores</b>. Monte o seu seguindo a lista.'],
        howto: [{ i: '🔤', t: 'Escolha título, imagem e mensagem.' }, { i: '⭐', t: 'Toque nos adesivos para colocar. Arraste para mover.' }],
        data: {
          titles: [
            { t: 'RESPEITO TEM TODAS AS CORES', ok: true },
            { t: 'DIVERSIDADE É A NOSSA FORÇA', ok: true },
            { t: 'CADA UM NO SEU CANTO', ok: false, why: 'Esse título separa as pessoas. Um cartaz antirracista une!' },
            { t: 'SOMOS DIFERENTES, SOMOS IGUAIS EM DIREITOS', ok: true }
          ],
          minStickers: 2
        },
        lesson: 'Cartazes comunicam ideias para muitas pessoas. Título claro, imagem que mostra a diversidade e uma boa mensagem fazem toda a diferença.'
      },
      {
        id: 'm24', title: 'Complete as mensagens', type: 'fillblank', icon: '🧩', guide: 'kaua', mood: 'smile',
        intro: ['Estas mensagens vão para a rádio da escola, mas estão incompletas!', 'Complete com as palavras certas.'],
        howto: [{ i: '👆', t: 'Arraste a palavra para o espaço.' }, { i: '👉', t: 'Ou toque na palavra e depois no espaço.' }],
        data: {
          sentences: [
            { b: 'Racismo é uma forma de ___ que causa sofrimento.', a: 'discriminação' },
            { b: 'Todas as pessoas têm o mesmo ___.', a: 'valor' },
            { b: 'Se eu errar, peço ___ e não repito.', a: 'desculpas' },
            { b: 'A diversidade deixa a nossa escola mais ___.', a: 'rica' },
            { b: 'Quando vejo uma injustiça, eu ___ quem foi atingido.', a: 'apoio' },
            { b: 'Combater o racismo é responsabilidade de ___.', a: 'todos' }
          ],
          extra: ['silêncio', 'alguns']
        },
        lesson: 'Respeito, valor, desculpas, apoio, diversidade e responsabilidade coletiva: palavras que viram atitudes.'
      },
      {
        id: 'm25', title: 'Campanha: o racismo não tem vez!', type: 'campaign', icon: '📣', guide: 'lucia', mood: 'happy',
        intro: ['Chegou o grande desafio final!', 'Você vai criar a campanha <b>NA NOSSA ESCOLA, O RACISMO NÃO TEM VEZ!</b>', 'Primeiro, escolha as ações da campanha. Depois, monte o cartaz oficial.'],
        howto: [{ i: '✅', t: 'Escolha boas ações para a campanha.' }, { i: '🎨', t: 'Monte o cartaz com frases, cores e ilustrações.' }, { i: '🖨️', t: 'Se quiser, imprima ou salve o cartaz.' }],
        data: {
          actions: [
            { t: 'Roda de conversa sobre respeito com a turma', icon: '🗣️', ok: true },
            { t: 'Cantinho de leitura com livros de autoras e autores negros', icon: '📚', ok: true },
            { t: 'Falar sobre racismo só no dia 20 de novembro', icon: '📅', ok: false, why: 'A educação antirracista acontece todos os dias, não só em uma data.' },
            { t: 'Mural com personalidades negras brasileiras', icon: '🖼️', ok: true },
            { t: 'Pedir que só os colegas negros expliquem o que é racismo', icon: '🙋', ok: false, why: 'Ninguém deve ser obrigado a explicar ou representar a sua identidade. Essa tarefa é de toda a escola.' },
            { t: 'Oficina de brincadeiras e músicas afro-brasileiras', icon: '🥁', ok: true },
            { t: 'Concurso para escolher a cor de pele mais bonita', icon: '🏆', ok: false, why: 'Competir por cor de pele é discriminação. Todas as cores têm o mesmo valor.' },
            { t: 'Combinados da turma: aqui ninguém é excluído', icon: '🤝', ok: true }
          ],
          minGood: 3,
          title: 'NA NOSSA ESCOLA, O RACISMO NÃO TEM VEZ!'
        },
        lesson: 'Uma escola antirracista é construída todos os dias, com nossas palavras, escolhas e atitudes.'
      }
    ]
  };

  const POSTER = {
    colors: [
      { id: 'sol', bg: '#FFE08A', ink: '#2B2140', accent: '#FF5C8A', name: 'Sol' },
      { id: 'mar', bg: '#BDE7FF', ink: '#1B2A4A', accent: '#6A4CE0', name: 'Mar' },
      { id: 'folha', bg: '#C9F2D0', ink: '#14352a', accent: '#FF8A3D', name: 'Folha' },
      { id: 'flor', bg: '#FFD1E1', ink: '#4a1030', accent: '#14A098', name: 'Flor' },
      { id: 'noite', bg: '#2B2140', ink: '#FFFFFF', accent: '#FFC531', name: 'Noite' },
      { id: 'terra', bg: '#F2C48D', ink: '#3b1f0c', accent: '#14A098', name: 'Terra' }
    ],
    arts: [
      { id: 'turma', name: 'Turma unida' },
      { id: 'roda', name: 'Amigos' },
      { id: 'maos', name: 'Mãos dadas' },
      { id: 'musica', name: 'Música afro-brasileira' },
      { id: 'livros', name: 'Livros e mundo' },
      { id: 'coracao', name: 'Coração' }
    ],
    frames: [
      { id: 'none', name: 'Sem moldura' },
      { id: 'stars', name: 'Estrelas' },
      { id: 'hearts', name: 'Corações' },
      { id: 'stripes', name: 'Faixas coloridas' },
      { id: 'dots', name: 'Bolinhas' }
    ],
    stickers: ['star', 'heart', 'hands', 'berimbau', 'atabaque', 'book', 'globe', 'crown', 'pandeiro', 'abayomi', 'music', 'school'],
    phrases: [
      'Todas as cores de pele são bonitas.',
      'Racismo machuca. Respeito acolhe.',
      'Viu racismo? Apoie e chame um adulto.',
      'Nossa história é feita de muitas histórias.',
      'Aqui, ninguém fica de fora!',
      'Diversidade deixa a escola mais bonita.'
    ]
  };

  window.GAME = { CHARACTERS, WORLDS: [W1, W2, W3, W4, W5], BIOS: PEOPLE_BIOS, POSTER };
})();
