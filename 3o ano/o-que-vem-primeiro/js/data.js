/* O QUE VEM PRIMEIRO? — As 15 missões.
   Cada cartão: t = texto, art = ilustração, after = etapas que precisam vir ANTES,
   oops = o que acontece de engraçado quando a etapa é feita cedo demais,
   why = explicação quando o cartão é escolhido como resposta errada.
   Tipos de etapa (stage):
     order   → organizar os cartões (Mecânica A) + o robô executa (Mecânica F)
     next    → o que acontece depois? (Mecânica D)
     missing → qual etapa está faltando? (Mecânica C)
     fix     → descubra o erro do robô (Mecânica B)
     odd     → qual ação não faz parte da tarefa?
     choose  → escolha o plano certo entre vários
     order + different → encontre outra maneira que também funcione (Mecânica E) */
(function (root) {
  'use strict';

  const LEVELS = [
    { n: 1, name: 'Aprendiz de Organização', short: 'Fácil', color: '#17b59a', dark: '#0c7d6a', soft: '#d6f7ef', missions: [1, 2, 3, 4, 5],
      desc: 'Ações do dia a dia em 3 etapas.' },
    { n: 2, name: 'Organizador de Tarefas', short: 'Médio', color: '#ff8f2e', dark: '#c25e08', soft: '#ffead6', missions: [6, 7, 8, 9, 10],
      desc: 'Tarefas maiores, etapas que faltam e ordens que podem mudar.' },
    { n: 3, name: 'Mestre das Sequências', short: 'Desafiador', color: '#7a5cf0', dark: '#4f33c2', soft: '#ebe5ff', missions: [11, 12, 13, 14, 15],
      desc: 'Encontre erros, corrija planos e resolva grandes desafios.' }
  ];

  const MISSIONS = [
    /* ======================= NÍVEL 1 ======================= */
    {
      id: 1, level: 1, title: 'Escovando os dentes', theme: 'bath', icon: 'm1_escovar',
      story: 'Bom dia! O Pipo acabou de tomar o café da manhã e quer deixar o sorriso brilhando. Mas as instruções da escovação caíram no chão e se misturaram!',
      goal: 'Coloque as 3 etapas na ordem certa para o Pipo escovar os dentes.',
      cards: {
        pasta: { t: 'Colocar pasta na escova', art: 'm1_pasta' },
        escovar: { t: 'Escovar os dentes', art: 'm1_escovar', after: ['pasta'],
          oops: 'O Pipo escovou os dentes com a escova sequinha, sem pasta! Os dentes não ficaram bem limpos.' },
        enxaguar: { t: 'Enxaguar a boca', art: 'm1_enxaguar', after: ['escovar'],
          oops: 'O Pipo enxaguou a boca antes de escovar... A boca ficou molhada, mas os dentes continuaram sujos!' }
      },
      stages: [
        { type: 'order', ids: ['pasta', 'escovar', 'enxaguar'],
          prompt: 'Arraste os cartões ou toque em dois cartões para trocar de lugar. Depois, toque em TESTAR!',
          hints: ['Pense: o que a escova precisa ter antes de ir para a boca?',
            'A pasta vai na escova primeiro. E o enxágue: vem antes ou depois de escovar?'] }
      ],
      win: 'Excelente! Você organizou tudo direitinho! Que sorriso brilhante!',
      learn: 'Cada etapa prepara a próxima: sem pasta, não dá para escovar bem.'
    },
    {
      id: 2, level: 1, title: 'Lavando as mãos', theme: 'bath', icon: 'm2_sabao',
      story: 'O Pipo brincou no jardim e ficou com as mãos cheias de terra. Antes do lanche, ele precisa lavá-las muito bem!',
      goal: 'Organize as 3 etapas para o Pipo lavar as mãos.',
      cards: {
        molhar: { t: 'Molhar as mãos', art: 'm2_molhar' },
        sabao: { t: 'Passar sabonete e esfregar', art: 'm2_sabao', after: ['molhar'],
          oops: 'O Pipo passou sabonete nas mãos secas... quase não fez espuma!' },
        secar: { t: 'Enxaguar e secar as mãos', art: 'm2_secar', after: ['sabao'],
          oops: 'O Pipo enxaguou e secou as mãos sem usar sabonete. A sujeira continuou lá!' }
      },
      stages: [
        { type: 'order', ids: ['molhar', 'sabao', 'secar'],
          prompt: 'Coloque as etapas em ordem: a primeira fica no número 1.',
          hints: ['O sabonete faz mais espuma com as mãos secas ou molhadas?',
            'Secar as mãos é sempre uma das últimas coisas. O que vem antes?'] }
      ],
      win: 'Muito bem! Seu planejamento funcionou! Mãos limpinhas!',
      learn: 'Primeiro molhamos, depois ensaboamos e, por fim, enxaguamos e secamos.'
    },
    {
      id: 3, level: 1, title: 'Calçando os sapatos', theme: 'room', icon: 'm3_amarrar',
      story: 'Hora de passear no parque! O Pipo ganhou um tênis novo com cadarço, mas ficou confuso: o que ele faz depois de cada etapa?',
      goal: 'Descubra o que acontece depois em cada momento.',
      cards: {
        pegar: { t: 'Pegar os sapatos', art: 'm3_pegar' },
        pes: { t: 'Colocar os pés nos sapatos', art: 'm3_pes', after: ['pegar'] },
        amarrar: { t: 'Amarrar os cadarços', art: 'm3_amarrar', after: ['pes'] },
        caixa: { t: 'Guardar os sapatos na caixa', art: 'm3_caixa',
          why: 'Se guardar os sapatos agora, o Pipo vai passear descalço!' },
        correr: { t: 'Sair correndo com o cadarço solto', art: 'm3_correr',
          why: 'Cuidado! Com o cadarço solto, o Pipo pode tropeçar e cair.' }
      },
      stages: [
        { type: 'next', done: ['pegar'], options: ['amarrar', 'pes', 'caixa'], answer: 'pes',
          prompt: 'O Pipo já pegou os sapatos. O que ele deve fazer DEPOIS?',
          whyMap: { amarrar: 'Será que dá para amarrar os cadarços se o sapato ainda não está no pé?' } },
        { type: 'next', done: ['pegar', 'pes'], options: ['correr', 'caixa', 'amarrar'], answer: 'amarrar',
          prompt: 'Os pés já estão dentro dos sapatos. E agora, o que vem DEPOIS?' }
      ],
      simAfter: ['pegar', 'pes', 'amarrar'],
      win: 'Você pensou antes de agir. Isso é raciocínio lógico!',
      learn: 'Para escolher o próximo passo, olhamos o que já foi feito.'
    },
    {
      id: 4, level: 1, title: 'Preparando um sanduíche', theme: 'kitchen', icon: 'm4_fechar',
      story: 'O Pipo está com fome e quer preparar um sanduíche de queijo, alface e tomate para o lanche da tarde. Só que a receita ficou embaralhada!',
      goal: 'Organize as 3 etapas para montar o sanduíche.',
      cards: {
        fatias: { t: 'Pegar duas fatias de pão', art: 'm4_fatias' },
        recheio: { t: 'Colocar o recheio', art: 'm4_recheio', after: ['fatias'],
          oops: 'O Pipo colocou o recheio direto na mesa! Sem o pão, o queijo e o tomate não têm onde ficar.' },
        fechar: { t: 'Fechar o sanduíche e colocar no prato', art: 'm4_fechar', after: ['recheio'],
          oops: 'O Pipo fechou o sanduíche sem recheio. Ficou só pão com pão!' }
      },
      stages: [
        { type: 'order', ids: ['fatias', 'recheio', 'fechar'],
          prompt: 'Monte a receita na ordem certa e teste com o Pipo.',
          hints: ['Onde o recheio vai ficar? O que precisa estar na mesa antes dele?',
            'Só dá para fechar o sanduíche depois que o recheio estiver lá dentro.'] }
      ],
      win: 'Missão concluída! Que sanduíche caprichado!',
      learn: 'Algumas etapas dependem de outras: o recheio precisa do pão.'
    },
    {
      id: 5, level: 1, title: 'Plantando uma semente', theme: 'garden', icon: 'm5_cobrir',
      story: 'A professora deu uma semente de girassol para o Pipo. Ele quer plantá-la em um vaso e ver uma flor nascer!',
      goal: 'Organize o plantio e descubra o que fazer depois.',
      cards: {
        terra: { t: 'Colocar terra no vaso', art: 'm5_terra' },
        semente: { t: 'Colocar a semente na terra', art: 'm5_semente', after: ['terra'],
          oops: 'O Pipo jogou a semente no vaso vazio. Sem terra, ela não consegue crescer!' },
        cobrir: { t: 'Cobrir com um pouco de terra e regar', art: 'm5_cobrir', after: ['semente'],
          oops: 'O Pipo cobriu e regou... mas ainda não tinha semente! Assim não vai nascer nada.' },
        cuidar: { t: 'Deixar no sol e regar nos próximos dias', art: 'm5_cuidar', after: ['cobrir'] },
        desenterrar: { t: 'Desenterrar a semente para ver se cresceu', art: 'm5_desenterrar',
          why: 'Se o Pipo desenterrar a semente, ela não consegue criar raízes. Plantas precisam de tempo!' },
        armario: { t: 'Guardar o vaso no armário escuro', art: 'm5_armario',
          why: 'No escuro, a plantinha não recebe luz do sol. Ela precisa de sol para crescer!' }
      },
      stages: [
        { type: 'order', ids: ['terra', 'semente', 'cobrir'],
          prompt: 'Organize as 3 etapas do plantio.',
          hints: ['Antes de colocar a semente, o vaso precisa ter o quê?',
            'A semente vai na terra e depois é coberta. Qual destas é a primeira?'] },
        { type: 'next', done: ['terra', 'semente', 'cobrir'], options: ['desenterrar', 'cuidar', 'armario'], answer: 'cuidar',
          prompt: 'A semente está plantada e regada. O que o Pipo deve fazer DEPOIS?' }
      ],
      win: 'Muito bem! Você percebeu que uma ação depende da outra!',
      learn: 'Planejar é pensar no antes e também no depois.'
    },

    /* ======================= NÍVEL 2 ======================= */
    {
      id: 6, level: 2, title: 'Organizando a mochila', theme: 'school', icon: 'm6_conferir',
      story: 'Amanhã tem aula de Ciências e de Português! O Pipo quer arrumar a mochila hoje à noite para não esquecer nada.',
      goal: 'Organize as 5 etapas. Atenção: aqui, mais de uma ordem pode funcionar!',
      cards: {
        consultar: { t: 'Consultar quais materiais serão necessários', art: 'm6_consultar' },
        separar: { t: 'Separar os livros e cadernos', art: 'm6_separar', after: ['consultar'],
          oops: 'O Pipo separou os livros sem olhar o horário... e pegou o de Matemática, que nem tem aula amanhã!' },
        colocar: { t: 'Colocar os materiais na mochila', art: 'm6_colocar', after: ['separar'],
          oops: 'O Pipo abriu a mochila para colocar os materiais, mas nenhum livro tinha sido separado!' },
        estojo: { t: 'Guardar o estojo', art: 'm6_estojo' },
        conferir: { t: 'Conferir se está tudo pronto', art: 'm6_conferir', after: ['consultar', 'separar', 'colocar', 'estojo'],
          oops: 'O Pipo conferiu a mochila antes de terminar de arrumar... ainda faltavam coisas! Conferir é para o final.' }
      },
      stages: [
        { type: 'order', ids: ['consultar', 'separar', 'colocar', 'estojo', 'conferir'],
          prompt: 'Organize a arrumação da mochila. O estojo pode ser guardado em momentos diferentes!',
          hints: ['Antes de pegar qualquer livro, o que o Pipo precisa saber?',
            'Conferir é a última coisa: só dá para conferir quando tudo já estiver na mochila.'] }
      ],
      altMsg: 'Você sabia? O estojo pode ser guardado em vários momentos e a arrumação continua certa!',
      win: 'Excelente! Mochila pronta e nada esquecido!',
      learn: 'Algumas etapas têm lugar fixo; outras podem mudar de lugar sem problema.'
    },
    {
      id: 7, level: 2, title: 'Salada de frutas', theme: 'kitchen', icon: 'm7_misturar',
      story: 'É dia de festa na escola! O Pipo vai levar uma salada de frutas. Mas a receita dele está com um buraco: uma etapa sumiu!',
      goal: 'Descubra a etapa que falta e depois organize a receita completa.',
      cards: {
        separar: { t: 'Separar as frutas', art: 'm7_separar' },
        lavar: { t: 'Lavar as frutas', art: 'm7_lavar', after: ['separar'],
          oops: 'O Pipo foi lavar as frutas... mas elas ainda estavam no mercado! Primeiro é preciso separá-las.' },
        cortar: { t: 'Pedir ajuda a um adulto para cortar as frutas', art: 'm7_cortar', after: ['lavar'],
          oops: 'As frutas foram cortadas sem lavar! A sujeirinha da casca foi parar na salada.' },
        tigela: { t: 'Colocar os pedaços em uma tigela', art: 'm7_tigela', after: ['cortar'],
          oops: 'O Pipo colocou as frutas inteiras na tigela. Ninguém consegue comer uma melancia inteira de colher!' },
        misturar: { t: 'Misturar os ingredientes', art: 'm7_misturar', after: ['tigela'],
          oops: 'O Pipo tentou misturar... mas não tinha nada na tigela!' },
        comer: { t: 'Comer as frutas inteiras', art: 'm7_comer',
          why: 'Hum... se o Pipo comer as frutas agora, não vai sobrar nada para a salada!' }
      },
      stages: [
        { type: 'missing', seq: ['separar', 'lavar', 'cortar', 'tigela', 'misturar'], blank: 1,
          options: ['misturar', 'lavar', 'comer'],
          prompt: 'Uma etapa sumiu da receita! Qual cartão completa a sequência?',
          whyMap: { misturar: 'Misturar já está no fim da receita. E antes de cortar, as frutas ainda estão inteiras!' } },
        { type: 'order', ids: ['separar', 'lavar', 'cortar', 'tigela', 'misturar'],
          prompt: 'Ops, a receita completa caiu e embaralhou! Organize as 5 etapas.',
          hints: ['Frutas precisam estar limpas antes de serem cortadas.',
            'A tigela recebe os pedaços. Então o que precisa acontecer antes de colocar na tigela?'] }
      ],
      win: 'Muito bem! Seu planejamento funcionou! A salada ficou deliciosa!',
      learn: 'Quando falta uma etapa, a tarefa não funciona. Por isso conferimos cada passo.',
      safety: 'Lembre-se: facas são usadas por adultos!'
    },
    {
      id: 8, level: 2, title: 'Preparando-se para a escola', theme: 'room', icon: 'm8_sair',
      story: 'TRIIIIM! O despertador tocou! O Pipo não pode se atrasar para a escola. Ajude-o a planejar a manhã.',
      goal: 'Organize as 5 etapas da manhã. Algumas podem trocar de lugar!',
      cards: {
        acordar: { t: 'Acordar', art: 'm8_acordar' },
        higiene: { t: 'Higienizar-se e escovar os dentes', art: 'm8_higiene', after: ['acordar'],
          oops: 'O Pipo tentou escovar os dentes... dormindo! Primeiro ele precisa acordar.' },
        vestir: { t: 'Vestir o uniforme', art: 'm8_vestir', after: ['acordar', 'higiene'],
          oops: 'O Pipo vestiu o uniforme e depois foi tomar banho... O uniforme ficou todo molhado!' },
        cafe: { t: 'Tomar café da manhã', art: 'm8_cafe', after: ['acordar'],
          oops: 'O Pipo tentou tomar café ainda dormindo. O leite foi parar no travesseiro!' },
        sair: { t: 'Pegar a mochila e preparar-se para sair', art: 'm8_sair', after: ['acordar', 'higiene', 'vestir', 'cafe'],
          oops: 'O Pipo saiu correndo para a escola... mas esqueceu de terminar de se arrumar! Sair é a última etapa.' }
      },
      stages: [
        { type: 'order', ids: ['acordar', 'higiene', 'vestir', 'cafe', 'sair'],
          prompt: 'Planeje a manhã do Pipo. Pense no que precisa vir antes de cada coisa.',
          hints: ['Qual é a primeira coisa que acontece de manhã, antes de tudo?',
            'O banho vem antes de vestir a roupa. Já o café pode ser antes ou depois de se vestir!'] }
      ],
      altMsg: 'Você sabia? Tomar café antes ou depois de vestir o uniforme: as duas ordens funcionam!',
      win: 'Excelente! O Pipo chegou na escola na hora certa!',
      learn: 'Uma etapa pode depender de várias outras. Sair de casa depende de tudo estar pronto.'
    },
    {
      id: 9, level: 2, title: 'Construindo uma torre', theme: 'room', icon: 'm9_verificar',
      story: 'O Pipo quer construir a torre de blocos mais alta da sala! Mas a última torre dele caiu... Desta vez ele quer planejar antes.',
      goal: 'Descubra o próximo passo e depois organize a construção.',
      cards: {
        separar: { t: 'Separar os blocos', art: 'm9_separar' },
        base: { t: 'Escolher uma base firme', art: 'm9_base' },
        maiores: { t: 'Colocar os blocos maiores embaixo', art: 'm9_maiores', after: ['separar', 'base'],
          oops: 'O Pipo começou a empilhar sem estar tudo pronto: faltava separar os blocos ou escolher uma base firme. Tudo balançou!' },
        menores: { t: 'Empilhar os blocos menores', art: 'm9_menores', after: ['maiores'],
          oops: 'O Pipo colocou os blocos pequenos embaixo e os grandes em cima... CATAPLOFT! A torre caiu!' },
        verificar: { t: 'Verificar se a torre está equilibrada', art: 'm9_verificar', after: ['menores'],
          oops: 'O Pipo foi verificar a torre... mas ela ainda nem estava pronta!' }
      },
      stages: [
        { type: 'next', done: ['separar', 'base'], options: ['menores', 'verificar', 'maiores'], answer: 'maiores',
          prompt: 'Os blocos estão separados e a base é firme. O que vem DEPOIS?',
          whyMap: {
            menores: 'Se os blocos pequenos ficarem embaixo, a torre fica bamba e pode cair!',
            verificar: 'Ainda não existe torre para verificar! O que precisa ser construído primeiro?' } },
        { type: 'order', ids: ['separar', 'base', 'maiores', 'menores', 'verificar'],
          prompt: 'Agora organize a construção inteira da torre.',
          hints: ['Antes de empilhar, o que precisa estar preparado?',
            'Separar os blocos e escolher a base podem vir em qualquer ordem. Depois, os maiores vão embaixo!'] }
      ],
      altMsg: 'Você sabia? Separar os blocos ou escolher a base primeiro: as duas ordens funcionam!',
      win: 'Muito bem! Que torre firme e alta!',
      learn: 'O que fica embaixo sustenta o que vem em cima. A ordem muda o resultado!'
    },
    {
      id: 10, level: 2, title: 'Organizando o quarto', theme: 'room', icon: 'm10_conferir',
      story: 'O quarto do Pipo virou uma bagunça depois da brincadeira! Os amigos vão chegar daqui a pouco e ele quer deixar tudo arrumado.',
      goal: 'Descubra a etapa que falta e organize a arrumação.',
      cards: {
        recolher: { t: 'Recolher os brinquedos espalhados', art: 'm10_recolher' },
        guardar: { t: 'Guardar os brinquedos nos locais adequados', art: 'm10_guardar', after: ['recolher'],
          oops: 'O Pipo foi guardar os brinquedos, mas eles ainda estavam espalhados pelo chão todo!' },
        livros: { t: 'Organizar os livros', art: 'm10_livros' },
        cama: { t: 'Arrumar a cama', art: 'm10_cama' },
        conferir: { t: 'Conferir se o quarto está organizado', art: 'm10_conferir', after: ['recolher', 'guardar', 'livros', 'cama'],
          oops: 'O Pipo conferiu o quarto e disse "pronto!"... mas ainda tinha coisa fora do lugar. Conferir é no final!' },
        espalhar: { t: 'Espalhar mais brinquedos', art: 'm10_espalhar',
          why: 'Assim a bagunça só aumenta! Queremos deixar o quarto organizado.' },
        pular: { t: 'Pular na cama', art: 'm10_pular',
          why: 'Pular na cama não ajuda a arrumar e ainda pode bagunçar o lençol!' }
      },
      stages: [
        { type: 'missing', seq: ['recolher', 'guardar', 'livros', 'cama', 'conferir'], blank: 1,
          options: ['espalhar', 'pular', 'guardar'],
          prompt: 'Uma etapa sumiu do plano de arrumação. Qual delas completa a sequência?' },
        { type: 'order', ids: ['recolher', 'guardar', 'livros', 'cama', 'conferir'],
          prompt: 'Organize o plano completo. Lembre-se: algumas etapas podem trocar de lugar!',
          hints: ['Para guardar os brinquedos, o que precisa acontecer antes?',
            'Arrumar a cama e organizar os livros podem ser feitos em momentos diferentes. Mas conferir é sempre no fim!'] }
      ],
      altMsg: 'Você sabia? Arrumar a cama ou organizar os livros primeiro: o quarto fica arrumado do mesmo jeito!',
      win: 'Missão concluída! Quarto organizado e amigos felizes!',
      learn: 'Conferir no final ajuda a perceber se alguma etapa ficou esquecida.'
    },

    /* ======================= NÍVEL 3 ======================= */
    {
      id: 11, level: 3, title: 'O robô precisa de ajuda!', theme: 'kitchen', icon: 'm11_prato',
      story: 'O Pipo escreveu sozinho as instruções para fazer um sanduíche. Mas, quando ele tentou seguir o plano, tudo deu errado! Duas etapas estão trocadas.',
      goal: 'Investigue o plano do Pipo, encontre as DUAS etapas trocadas e corrija.',
      cards: {
        lavar: { t: 'Lavar as mãos', art: 'm11_lavar' },
        pao: { t: 'Pegar duas fatias de pão', art: 'm4_fatias', after: ['lavar'],
          oops: 'O Pipo pegou o pão com as mãos sujas! Antes de mexer na comida, é preciso lavar as mãos.' },
        recheio: { t: 'Colocar o recheio no pão', art: 'm4_recheio', after: ['pao'],
          oops: 'O Pipo colocou o recheio... mas ainda não tinha pão na mesa!' },
        fechar: { t: 'Fechar o sanduíche com a outra fatia', art: 'm11_fechar', after: ['recheio'],
          oops: 'O Pipo tentou fechar o sanduíche... mas não tinha pão nem recheio! Ele fechou o ar!' },
        prato: { t: 'Servir o sanduíche no prato', art: 'm11_prato', after: ['fechar'],
          oops: 'O Pipo serviu um prato vazio! O sanduíche ainda não estava pronto.' }
      },
      stages: [
        { type: 'fix', shown: ['lavar', 'fechar', 'recheio', 'pao', 'prato'], ids: ['lavar', 'pao', 'recheio', 'fechar', 'prato'],
          prompt: 'Toque nas DUAS etapas que estão trocadas. Elas vão trocar de lugar!',
          hints: ['Leia o plano do começo ao fim. Em qual etapa alguma coisa parece impossível?',
            'Dá para fechar o sanduíche antes de pegar o pão?'] }
      ],
      simAfter: ['lavar', 'pao', 'recheio', 'fechar', 'prato'],
      win: 'Muito bem, investigador! Você encontrou e corrigiu o erro do Pipo!',
      learn: 'Para achar um erro, seguimos o plano passo a passo e perguntamos: isso já é possível agora?'
    },
    {
      id: 12, level: 3, title: 'Qual etapa está faltando?', theme: 'kitchen', icon: 'm12_beber',
      story: 'O Pipo quer fazer um suco de laranja fresquinho para a turma. A receita tem 5 etapas, mas uma delas foi apagada pela chuva!',
      goal: 'Descubra qual das 4 opções completa a receita do suco.',
      cards: {
        lavar: { t: 'Lavar as laranjas', art: 'm12_lavar' },
        cortar: { t: 'Pedir a um adulto para cortar as laranjas', art: 'm12_cortar', after: ['lavar'] },
        espremer: { t: 'Espremer as laranjas', art: 'm12_espremer', after: ['cortar'] },
        coar: { t: 'Coar o suco e colocar no copo', art: 'm12_coar', after: ['espremer'],
          why: 'Coar o quê? O suco ainda nem saiu de dentro das laranjas! E coar já aparece logo depois.' },
        beber: { t: 'Beber o suco', art: 'm12_beber', after: ['coar'],
          why: 'Beber já está no fim da receita. E, neste momento, ainda não tem suco no copo!' },
        inteira: { t: 'Colocar as laranjas inteiras no copo', art: 'm12_inteira',
          why: 'Laranja inteira não vira suco sozinha! Ela não cabe no copo e não sai suco.' },
        plantar: { t: 'Plantar uma laranjeira', art: 'm12_plantar',
          why: 'Uma laranjeira demora anos para crescer! E as laranjas já estão aqui.' }
      },
      stages: [
        { type: 'missing', seq: ['lavar', 'cortar', 'espremer', 'coar', 'beber'], blank: 2,
          options: ['coar', 'espremer', 'inteira', 'plantar'],
          prompt: 'Olhe a etapa de antes e a de depois do espaço vazio. Qual opção completa a receita?',
          hints: ['O que acontece com as laranjas entre serem cortadas e o suco ser coado?'] }
      ],
      simAfter: ['lavar', 'cortar', 'espremer', 'coar', 'beber'],
      win: 'Excelente! Você olhou o antes e o depois para descobrir a etapa que faltava!',
      learn: 'A etapa que falta precisa "encaixar" entre a anterior e a seguinte.'
    },
    {
      id: 13, level: 3, title: 'A missão da horta', theme: 'garden', icon: 'm13_acompanhar',
      story: 'A escola ganhou um cantinho para fazer uma horta! O Pipo foi escolhido para planejar o trabalho, e são muitas etapas.',
      goal: 'Organize as 6 etapas para plantar e cuidar da horta.',
      cards: {
        espaco: { t: 'Preparar o espaço', art: 'm13_espaco' },
        materiais: { t: 'Separar os materiais', art: 'm13_materiais' },
        terra: { t: 'Preparar a terra', art: 'm13_terra', after: ['espaco', 'materiais'],
          oops: 'O Pipo quis mexer na terra sem ter as ferramentas ou o lugar pronto. Não deu certo!' },
        plantar: { t: 'Plantar as sementes', art: 'm13_plantar', after: ['terra'],
          oops: 'O Pipo plantou as sementes na terra dura e cheia de pedras. Elas não conseguiram entrar!' },
        regar: { t: 'Regar', art: 'm13_regar', after: ['plantar'],
          oops: 'O Pipo regou a terra... mas ainda não tinha nenhuma semente plantada!' },
        acompanhar: { t: 'Acompanhar o crescimento', art: 'm13_acompanhar', after: ['regar'],
          oops: 'O Pipo ficou esperando as plantas crescerem... mas nada tinha sido plantado ainda!' }
      },
      stages: [
        { type: 'order', ids: ['espaco', 'materiais', 'terra', 'plantar', 'regar', 'acompanhar'],
          prompt: 'Organize as 6 etapas da horta e veja o Pipo trabalhando.',
          hints: ['O que precisa estar pronto antes de mexer na terra?',
            'Preparar o espaço e separar os materiais vêm no começo, em qualquer ordem. Acompanhar o crescimento é o fim.'] }
      ],
      altMsg: 'Você sabia? Preparar o espaço ou separar os materiais primeiro: as duas ordens funcionam!',
      win: 'Missão concluída! A horta vai dar alfaces, cenouras e muito orgulho!',
      learn: 'Tarefas grandes ficam fáceis quando dividimos em etapas.'
    },
    {
      id: 14, level: 3, title: 'Duas maneiras de resolver', theme: 'school', icon: 'm14_fechar',
      story: 'Antes de sair de casa, o Pipo precisa organizar os materiais escolares. Ele descobriu que existe mais de um jeito certo de fazer isso!',
      goal: 'Encontre uma sequência que funcione e depois descubra OUTRA maneira diferente.',
      cards: {
        horario: { t: 'Olhar o horário das aulas do dia', art: 'm6_consultar' },
        livros: { t: 'Separar os livros e cadernos do dia', art: 'm6_separar', after: ['horario'],
          oops: 'O Pipo separou os livros sem olhar o horário. Levou o livro errado!' },
        estojo: { t: 'Apontar os lápis e arrumar o estojo', art: 'm14_estojo' },
        garrafa: { t: 'Encher a garrafinha de água', art: 'm14_garrafa' },
        mochila: { t: 'Colocar tudo na mochila', art: 'm14_mochila', after: ['livros', 'estojo', 'garrafa'],
          oops: 'O Pipo colocou tudo na mochila... mas ainda faltava preparar algumas coisas!' },
        fechar: { t: 'Fechar a mochila e colocá-la nas costas', art: 'm14_fechar', after: ['mochila'],
          oops: 'O Pipo fechou a mochila e colocou nas costas... mas ela estava vazia!' }
      },
      stages: [
        { type: 'order', ids: ['horario', 'livros', 'estojo', 'garrafa', 'mochila', 'fechar'],
          prompt: 'Primeira maneira: organize os cartões numa ordem que funcione.',
          hints: ['Quais coisas precisam estar prontas antes de ir para a mochila?',
            'Os livros dependem do horário. O estojo e a garrafinha podem ser preparados a qualquer momento antes da mochila.'] },
        { type: 'order', ids: ['horario', 'livros', 'estojo', 'garrafa', 'mochila', 'fechar'], different: true,
          prompt: 'Agora, encontre OUTRA maneira diferente que também funcione! Troque a ordem de algumas etapas.',
          hints: ['Tente mudar o momento de encher a garrafinha ou de arrumar o estojo.',
            'A garrafinha pode ser a primeira coisa, por exemplo. O resto continua funcionando?'],
          bonus: { label: 'Descobriu outra maneira', pts: 30 } }
      ],
      win: 'Incrível! Você encontrou duas maneiras corretas de resolver o mesmo problema!',
      learn: 'Um problema pode ter mais de uma solução correta. O importante é respeitar o que depende do quê.'
    },
    {
      id: 15, level: 3, title: 'O grande desafio da lógica', theme: 'trail', icon: 'x_trilha',
      story: 'O Pipo e a turma vão fazer uma expedição de acampamento na trilha do parque, com os adultos! Para tudo dar certo, ele precisa da sua ajuda em 4 desafios.',
      goal: 'Use tudo o que você aprendeu: escolha o que é necessário, organize, corrija e escolha o plano final.',
      cards: {
        destino: { t: 'Escolher o destino e olhar o mapa da trilha', art: 'x_destino' },
        tempo: { t: 'Ver a previsão do tempo para o dia', art: 'x_tempo', after: ['destino'],
          oops: 'O Pipo quis ver a previsão do tempo, mas ainda não sabia para onde ia!' },
        mochila: { t: 'Arrumar a mochila com água, lanche e capa de chuva', art: 'x_mochila', after: ['tempo'],
          oops: 'O Pipo arrumou a mochila sem ver o tempo... e esqueceu a capa no dia de chuva!' },
        protetor: { t: 'Passar protetor solar e colocar o boné', art: 'x_protetor', after: ['destino'],
          oops: 'O Pipo passou protetor e colocou o boné... mas nem sabia ainda se ia sair de casa!' },
        trilha: { t: 'Caminhar pela trilha com os adultos, seguindo o mapa', art: 'x_trilha', after: ['mochila', 'protetor'],
          oops: 'O Pipo saiu para a trilha sem estar pronto: faltava a mochila ou a proteção do sol!' },
        chegar: { t: 'Chegar ao lugar do acampamento', art: 'x_chegar', after: ['trilha'],
          oops: 'Como o Pipo chegou ao acampamento sem caminhar pela trilha? Teletransporte não vale!' },
        videogame: { t: 'Levar o videogame e a televisão', art: 'x_videogame' },
        lugar: { t: 'Escolher um lugar plano e limpo', art: 'x_lugar' },
        lona: { t: 'Abrir e esticar a barraca no chão', art: 'x_lona', after: ['lugar'] },
        varetas: { t: 'Encaixar as varetas para levantar a barraca', art: 'x_varetas', after: ['lona'] },
        estacas: { t: 'Prender a barraca no chão com estacas', art: 'x_estacas', after: ['lona'] },
        saco: { t: 'Arrumar o saco de dormir dentro da barraca', art: 'x_saco', after: ['varetas', 'estacas'] },
        lixo: { t: 'Recolher todo o lixo', art: 'x_lixo' },
        desmontar: { t: 'Desmontar a barraca', art: 'x_desmontar' },
        guardar: { t: 'Guardar a barraca na mochila', art: 'x_guardar', after: ['desmontar'] },
        voltar: { t: 'Voltar pela trilha com os adultos', art: 'x_voltar', after: ['lixo', 'guardar'] }
      },
      stages: [
        { type: 'odd', ids: ['destino', 'tempo', 'videogame', 'mochila', 'protetor', 'trilha', 'chegar'], answer: 'videogame',
          title: 'Desafio 1: O que é necessário?',
          prompt: 'O Pipo listou 7 ações para a expedição, mas UMA não é necessária. Toque nela!',
          wrongMsg: 'Essa ação é importante para a expedição! Procure uma que não ajuda em nada na trilha.' },
        { type: 'order', ids: ['destino', 'tempo', 'mochila', 'protetor', 'trilha', 'chegar'],
          title: 'Desafio 2: Organize a expedição',
          prompt: 'Organize as 6 etapas da ida até o acampamento.',
          hints: ['Antes de qualquer coisa, o Pipo precisa saber para onde vai!',
            'A previsão do tempo ajuda a arrumar a mochila. Caminhar pela trilha só depois de tudo pronto.'] },
        { type: 'fix', shown: ['saco', 'lona', 'varetas', 'estacas', 'lugar'], ids: ['lugar', 'lona', 'varetas', 'estacas', 'saco'],
          title: 'Desafio 3: Corrija o plano da barraca',
          prompt: 'O Pipo escreveu como montar a barraca, mas duas etapas estão trocadas. Toque nelas para corrigir!',
          hints: ['Dá para arrumar o saco de dormir dentro de uma barraca que ainda não existe?',
            'Qual etapa precisa ser a primeira de todas para montar uma barraca?'],
          okSwapMsg: 'Essas duas podem ficar em qualquer ordem: varetas ou estacas primeiro, tanto faz! O problema está em outro lugar.' },
        { type: 'choose', plans: [
            ['desmontar', 'guardar', 'voltar', 'lixo'],
            ['lixo', 'desmontar', 'guardar', 'voltar'],
            ['lixo', 'guardar', 'desmontar', 'voltar']],
          answer: 1,
          planWhy: [
            'Nesse plano, o Pipo volta para casa e só depois lembra do lixo... O lixo ficou na natureza!',
            '',
            'Nesse plano, o Pipo tenta guardar a barraca na mochila ainda montada! Não cabe!'],
          title: 'Desafio 4: O plano da volta',
          prompt: 'Hora de voltar para casa! Qual destes 3 planos está correto? Leia cada um com atenção.' }
      ],
      simAfter: ['destino', 'tempo', 'mochila', 'protetor', 'trilha', 'chegar', 'lugar', 'lona', 'varetas', 'estacas', 'saco', 'lixo', 'desmontar', 'guardar', 'voltar'],
      win: 'VOCÊ É UM MESTRE DA LÓGICA! A expedição foi um sucesso do começo ao fim!',
      learn: 'Você escolheu o que era necessário, organizou, corrigiu e planejou. Isso é pensar passo a passo!'
    }
  ];

  const api = { LEVELS, MISSIONS, mission: (n) => MISSIONS.find((m) => m.id === n), level: (n) => LEVELS[n - 1] };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.OQVP = root.OQVP || {}; root.OQVP.data = api; }
})(typeof window !== 'undefined' ? window : globalThis);
