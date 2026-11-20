/* Módulo 2 — Dominando os furos (fases 11–20) */
(function () {
  const { box, cyl, sphere, cone, torus, tube, roof, poly, hemi, wedge, hbox, hcyl } = TM.S;
  const hs = (d, x, y, z, o) => sphere(d, d, d, x, y, z, Object.assign({ hole: true }, o || {}));
  TM.addModule({
    n: 2, cor: '#2f74e0', titulo: 'Dominando os furos',
    resumo: 'Sólido versus furo, cavidades, cortes, furos passantes, encaixes e o que acontece ao agrupar.',
    phases: [
      {
        id: 11, nome: 'Bloco com janela', diff: 2,
        obj: 'Entender a diferença entre sólido e furo e aplicar o primeiro furo passante agrupando as duas formas.',
        novo: { titulo: 'Furo e agrupamento', texto: 'Qualquer forma pode virar furo: selecione e clique em "Furo" no Inspetor (ou aperte H). Ela fica translúcida e listrada, mas ainda não corta nada. O corte só acontece quando você seleciona o furo junto com o sólido e agrupa (Ctrl+G). Para voltar atrás, desagrupe (Ctrl+Shift+G): as duas peças reaparecem intactas.', passos: ['Furo passante: o furo é maior que o sólido na direção do corte, atravessando de um lado ao outro.', 'Se o furo ficar exatamente do mesmo tamanho da parede, pode sobrar uma "película" fina. Deixe o furo sempre um pouco maior.'] },
        desc: 'Um bloco azul em pé com uma abertura quadrada atravessando de frente para trás, como uma janela vazada. Olhando pela abertura, vê-se o outro lado.',
        req: ['Bloco sólido de 40 × 20 × 30 mm.', 'Furo em forma de Caixa, de 16 × 16 mm, atravessando o bloco de frente para trás.', 'O furo é mais profundo que o bloco (sem película no fundo).', 'Abertura centrada na largura e a 7 mm da base.', 'Furo e bloco agrupados: o resultado é uma peça só.'],
        formas: ['box', 'boxh'], tools: ['furo', 'agrupar', 'dimensionar', 'elevar'],
        skills: ['Converter forma em furo', 'Furo passante', 'Agrupar para aplicar o corte'],
        dicas: [
          'Um furo funciona como uma borracha 3D: ele apaga o volume que ocupa, mas só depois de "colado" ao sólido.',
          'Uma Caixa sólida e uma Caixa transformada em furo (H). Faça o furo mais comprido que a espessura do bloco e use Ctrl+G.',
          ['Caixa 40 × 20 × 30, azul.', 'Segunda Caixa: 16 de largura, 30 de profundidade (mais que os 20 do bloco), 16 de altura. Aperte H para virar furo.', 'Eleve o furo a 7 mm. Na vista de topo, centralize o furo no bloco: ele deve sobrar 5 mm na frente e 5 mm atrás.', 'Selecione as duas peças e aperte Ctrl+G. A janela aparece.', 'Gire a vista para olhar através da abertura. Tire o print em perspectiva.']
        ],
        crit: ['Abertura atravessando o bloco inteiro.', 'Medidas e posição da abertura corretas.', 'Bloco e furo agrupados.', 'Sem películas ou sobras dentro da abertura.'],
        model: () => [box(40, 20, 30, 0, 0, 0, { c: 'blue', n: 'Bloco' }), hbox(16, 30, 16, 0, 0, 7, { n: 'Furo (Caixa)' })]
      },
      {
        id: 12, nome: 'Copo com alça', diff: 2,
        obj: 'Criar uma cavidade (furo que não atravessa) deixando um fundo com espessura definida.',
        novo: { titulo: 'Cavidade: furo com fundo', texto: 'Para esvaziar um objeto sem furar o fundo, eleve o furo. A elevação do furo é exatamente a espessura do fundo. O furo pode passar do topo do objeto, assim a boca fica aberta.' },
        desc: 'Um copo cilíndrico com parede de 3 mm, fundo de 3 mm e uma alça em forma de anel na lateral. Por dentro, o copo é oco até o fundo; a parte da alça que entraria no copo é cortada pelo próprio furo.',
        req: ['Corpo: Cilindro de Ø 40 mm e 50 mm de altura.', 'Cavidade: Cilindro furo de Ø 34 mm (parede de 3 mm).', 'Fundo de 3 mm (furo elevado a 3 mm).', 'Alça feita com Toroide em pé, presa na lateral.', 'Todas as peças agrupadas; o interior fica livre, sem pedaço da alça dentro.'],
        formas: ['cyl', 'cylh', 'torus'], tools: ['furo', 'agrupar', 'elevar', 'rotacionar', 'propriedades'],
        skills: ['Cavidade com fundo', 'Espessura de parede', 'Ordem de agrupamento'],
        dicas: [
          'A diferença entre os diâmetros do corpo e do furo, dividida por dois, é a espessura da parede. A elevação do furo é a espessura do fundo.',
          'Cilindro sólido, Cilindro furo um pouco mais alto que o copo e Toroide girado 90° em X para a alça. Agrupe tudo junto para o furo limpar o interior.',
          ['Cilindro 40 × 40 × 50.', 'Cilindro 34 × 34 × 50, Furo, elevação 3 e centralizado (vista de topo).', 'Toroide com Ø 26 e tubo de 5 mm. Gire 90° em X para ficar em pé.', 'Leve o toroide para a lateral (centro a cerca de 22 mm do centro do copo) e eleve até o meio da altura.', 'Selecione corpo, furo e alça e agrupe. A parte da alça que entrava no copo some.', 'Confira olhando de cima, dentro do copo.']
        ],
        crit: ['Parede e fundo com 3 mm.', 'Boca aberta e interior oco.', 'Alça bem presa e sem invadir o interior.', 'Tudo agrupado.'],
        model: () => [cyl(40, 40, 50, 0, 0, 0, { c: 'teal', n: 'Corpo' }), hcyl(34, 34, 50, 0, 0, 3, { n: 'Cavidade' }), torus(26, 5, 22, 0, 22.5, { c: 'teal', r: [90, 0, 0], n: 'Alça (Toroide)' })]
      },
      {
        id: 13, nome: 'Queijo cortado', diff: 3,
        obj: 'Cortar partes de um objeto com furos e usar esferas furo para criar cavidades na superfície.',
        desc: 'Uma roda de queijo com um quarto removido e, ao lado, a fatia que saiu dela. As duas peças têm buracos redondos espalhados pela superfície e pelas faces do corte.',
        req: ['Roda: Cilindro de Ø 60 mm e 24 mm de altura.', 'Um quarto da roda removido com um único furo em forma de Caixa.', 'A fatia ao lado, feita com outro cilindro e furos que removem os outros três quartos.', 'Pelo menos 6 buracos com Esferas furo, alguns cortando as bordas e as faces do corte.', 'Roda e fatia agrupadas separadamente.'],
        formas: ['cyl', 'boxh', 'sphere'], tools: ['furo', 'agrupar', 'mover', 'dimensionar'],
        skills: ['Corte com furo', 'Furos de formato livre', 'Pensar o negativo da peça'],
        dicas: [
          'Para tirar um quarto, o furo precisa cobrir exatamente um dos quatro quadrantes, a partir do centro. Para sobrar só a fatia, faça o contrário.',
          'Cilindro, Caixa furo com o canto no centro da roda, Esferas transformadas em furo. A fatia é outro cilindro com dois furos de Caixa.',
          ['Cilindro 60 × 60 × 24, amarelo.', 'Caixa 40 × 40 × 30 como furo. Posicione com um canto exatamente no centro da roda (use a vista de topo e a grade de 1 mm).', 'Esferas de 8 a 10 mm como furo, metade para fora em vários pontos da lateral, do topo e das faces do corte.', 'Agrupe a roda com seus furos.', 'Fatia: outro Cilindro igual, ao lado. Uma Caixa furo remove a metade esquerda e outra remove a metade da frente. Sobra um quarto.', 'Adicione esferas furo na fatia e agrupe.']
        ],
        crit: ['Corte de 90° limpo, a partir do centro.', 'Fatia com o mesmo raio e altura da roda.', 'Buracos espalhados, alguns cortando bordas.', 'Peças agrupadas.'],
        model: () => [cyl(60, 60, 24, 0, 0, 0, { c: 'yellow', n: 'Roda de queijo' }), hbox(40, 40, 30, 20, -20, -2, { n: 'Furo do corte' }),
          hs(9, -20, -18, 16), hs(8, 6, 26, 6), hs(10, -24, 12, 20), hs(8, 3, -12, 21), hs(9, 10, -1, 9, {}), hs(7, -6, 8, 22),
          cyl(60, 60, 24, 34, -34, 0, { c: 'yellow', g: 1, n: 'Fatia' }), hbox(32, 64, 30, 34 - 16, -34, -2, { g: 1, n: 'Furo da fatia' }), hbox(64, 32, 30, 34, -34 - 16, -2, { g: 1, n: 'Furo da fatia' }),
          hs(8, 48, -34, 7, { g: 1 }), hs(7, 40, -46, 20, { g: 1 }), hs(8, 34, -40, 12, { g: 1 })]
      },
      {
        id: 14, nome: 'Recipiente com tampa', diff: 3,
        obj: 'Projetar um recipiente com paredes finas e uma tampa que encaixa, calculando a folga entre as peças.',
        novo: { titulo: 'Folga de encaixe', texto: 'Duas peças que encaixam não podem ter exatamente a mesma medida: na impressão 3D elas travam. Use uma folga de 0,2 a 0,4 mm por lado. Se o vão interno tem 56 mm, a borda da tampa deve ter cerca de 55,4 mm. Ajuste a grade para 0,1 mm para conseguir digitar essas medidas.' },
        desc: 'Uma caixa retangular aberta com paredes de 2 mm e fundo de 2 mm e, ao lado, a tampa virada para cima mostrando o rebaixo (borda interna) que entra na caixa.',
        req: ['Caixa de 60 × 40 × 30 mm com paredes e fundo de 2 mm.', 'Tampa de 60 × 40 × 3 mm.', 'Rebaixo da tampa com folga de 0,3 mm por lado (55,4 × 35,4 mm).', 'Rebaixo de 3 mm de altura, centrado na tampa.', 'Caixa e tampa como dois grupos separados.'],
        formas: ['box', 'boxh'], tools: ['furo', 'agrupar', 'grade', 'dimensionar'],
        skills: ['Paredes finas', 'Calcular folga', 'Medidas decimais'],
        dicas: [
          'O rebaixo da tampa precisa entrar no vão interno da caixa. Qual é a medida do vão? Quanto menor o rebaixo deve ser?',
          'Caixa sólida + Caixa furo para o recipiente. Para a tampa, duas Caixas sólidas agrupadas. Grade de 0,1 mm para as medidas decimais.',
          ['Caixa 60 × 40 × 30.', 'Caixa furo 56 × 36 × 30, elevação 2, centralizada. Agrupe: paredes e fundo de 2 mm.', 'Ao lado, Caixa 60 × 40 × 3 (a tampa).', 'Mude a grade para 0,1 mm. Caixa 55,4 × 35,4 × 3, elevação 3, centralizada na tampa (0,3 mm de folga por lado em relação aos 56 × 36 do vão).', 'Agrupe a tampa. Deixe-a com o rebaixo para cima, que é como seria impressa.']
        ],
        crit: ['Paredes e fundo com espessura uniforme.', 'Rebaixo com folga correta.', 'Tampa centrada e proporcional à caixa.', 'Dois grupos independentes.'],
        model: () => [box(60, 40, 30, 0, 0, 0, { c: 'purple', n: 'Caixa' }), hbox(56, 36, 30, 0, 0, 2, { n: 'Vão interno' }), box(60, 40, 3, 0, 52, 0, { c: 'pink', g: 1, n: 'Tampa' }), box(55.4, 35.4, 3, 0, 52, 3, { c: 'pink', g: 1, n: 'Rebaixo da tampa' })]
      },
      {
        id: 15, nome: 'Túnel de pedra', diff: 3,
        obj: 'Combinar dois furos de formatos diferentes para obter uma abertura em arco.',
        desc: 'Um grande bloco de pedra com um túnel em arco atravessando de frente para trás: paredes retas na parte de baixo e teto em semicírculo. Uma estrada cinza passa pelo túnel e um morro arredondado cobre o bloco.',
        req: ['Bloco de cerca de 80 × 40 × 40 mm.', 'Arco formado por um Cilindro furo deitado e uma Caixa furo abaixo dele, com a mesma largura.', 'O túnel atravessa o bloco de ponta a ponta.', 'Estrada (Caixa fina) passando pelo túnel.', 'Morro sobre o bloco com Telhado redondo.'],
        formas: ['box', 'cylh', 'boxh', 'rroof'], tools: ['furo', 'agrupar', 'rotacionar', 'alinhar'],
        skills: ['Furo composto', 'Furo girado', 'Arcos'],
        dicas: [
          'Um arco é um retângulo com um semicírculo em cima. Dois furos que se sobrepõem funcionam como um furo só.',
          'Cilindro furo girado 90° em X e Caixa furo com a mesma largura do diâmetro, terminando na altura do centro do cilindro.',
          ['Caixa 80 × 40 × 40, cinza.', 'Cilindro 24 × 24 × 50 como furo, girado 90° em X (atravessando de frente para trás). Eleve até o centro ficar a 20 mm do chão.', 'Caixa furo 24 × 50 × 21 começando 1 mm abaixo do plano e terminando no centro do cilindro.', 'Centralize os dois furos no bloco e agrupe tudo.', 'Estrada: Caixa 30 × 70 × 1, escura, passando pelo túnel.', 'Morro: Telhado redondo 80 × 40 × 14 sobre o bloco, verde.']
        ],
        crit: ['Arco limpo, sem degrau entre a parte reta e a curva.', 'Túnel atravessando o bloco.', 'Estrada alinhada com o túnel.', 'Composição completa.'],
        model: () => [box(80, 40, 40, 0, 0, 0, { c: 'gray', n: 'Bloco de pedra' }), hcyl(24, 24, 50, 0, 0, -5, { r: [90, 0, 0], n: 'Furo do arco' }), hbox(24, 50, 21, 0, 0, -1, { n: 'Furo reto' }),
          box(30, 70, 1, 0, 0, 0, { c: 'dark', g: 1, n: 'Estrada' }), TM.S.rroof(80, 40, 14, 0, 0, 40, { c: 'green', g: 1, n: 'Morro (Telhado redondo)' })]
      },
      {
        id: 16, nome: 'Anel com pedra', diff: 3,
        obj: 'Comparar duas formas de fazer um anel: a forma Tubo (furo embutido) e o Cilindro com Cilindro furo.',
        novo: { titulo: 'Tubo: uma forma que já vem furada', texto: 'O Tubo tem Raio e Espessura da parede no Inspetor. Ele é prático, mas o Cilindro + Cilindro furo dá mais controle (por exemplo, para um furo fora do centro). Saber os dois caminhos ajuda a escolher o melhor em cada projeto.' },
        desc: 'Dois anéis: um em pé, feito com a forma Tubo, com uma pedra lapidada no topo sobre um engaste; outro deitado, feito com Cilindro e Cilindro furo, de mesmo tamanho.',
        req: ['Anel 1 com a forma Tubo: Ø externo 22 mm, parede 2,5 mm, largura 6 mm.', 'Anel 1 em pé (girado 90°), com engaste (cilindro) e pedra no topo.', 'Anel 2 com Cilindro Ø 22 e Cilindro furo Ø 17, largura 6 mm, deitado.', 'Os dois anéis com o mesmo diâmetro interno (17 mm).', 'Cada anel agrupado separadamente.'],
        formas: ['tube', 'cyl', 'cylh', 'sphere'], tools: ['propriedades', 'furo', 'agrupar', 'rotacionar'],
        skills: ['Tubo x cilindro com furo', 'Diâmetro interno', 'Montagem de detalhe pequeno'],
        dicas: [
          'Diâmetro interno = diâmetro externo − 2 × espessura da parede. Confira se os dois caminhos chegam ao mesmo número.',
          'Tubo (ajuste Raio e Parede no Inspetor), Cilindro e Cilindro furo, um Cilindro pequeno de engaste e uma Esfera achatada para a pedra.',
          ['Tubo: no Inspetor, ajuste até ficar com 22 mm de diâmetro externo, parede de 2,5 mm e altura 6.', 'Gire 90° em X para o anel ficar em pé.', 'Engaste: Cilindro 9 × 9 × 2 no topo do anel. Pedra: Esfera 8 × 8 × 6 sobre o engaste, rosa.', 'Agrupe o anel 1 com Multicor.', 'Anel 2: Cilindro 22 × 22 × 6 e Cilindro furo 17 × 17 × 8 centralizado (passando acima e abaixo). Agrupe.']
        ],
        crit: ['Medidas dos dois anéis coerentes.', 'Anel 1 em pé, com pedra centrada no topo.', 'Anel 2 vazado de ponta a ponta.', 'Grupos separados.'],
        model: () => [tube(22, 6, 2.5, 0, 0, 8, { c: 'yellow', r: [90, 0, 0], n: 'Anel (Tubo)' }), cyl(9, 9, 2, 0, 0, 21.3, { c: 'yellow', n: 'Engaste' }), sphere(8, 8, 6, 0, 0, 22.5, { c: 'pink', n: 'Pedra' }),
          cyl(22, 22, 6, 32, 0, 0, { c: 'silver', g: 1, n: 'Anel (Cilindro)' }), hcyl(17, 17, 8, 32, 0, -1, { g: 1, n: 'Furo do anel' })]
      },
      {
        id: 17, nome: 'Gabarito de brocas', diff: 3,
        obj: 'Aplicar vários furos passantes de diâmetros diferentes, igualmente espaçados, numa única operação de agrupamento.',
        desc: 'Uma régua metálica para conferir diâmetros: seis furos redondos em fila, do menor (3 mm) ao maior (10 mm), igualmente espaçados, mais um furo de pendurar na ponta e uma faixa em baixo-relevo ao longo da peça.',
        req: ['Placa de 90 × 24 × 4 mm.', 'Seis furos passantes: Ø 3, 4, 5, 6, 8 e 10 mm.', 'Centros dos furos a 12 mm um do outro, todos na mesma linha.', 'Furo de pendurar Ø 5 mm numa das pontas.', 'Rebaixo de 1 mm de profundidade em faixa (furo raso) ao longo da placa.', 'Tudo agrupado de uma vez.'],
        formas: ['box', 'cylh', 'boxh'], tools: ['furo', 'agrupar', 'mover', 'grade'],
        skills: ['Vários furos de uma vez', 'Espaçamento constante', 'Furo raso (rebaixo)'],
        dicas: [
          'Se todos os centros estão na mesma linha, todos os furos têm o mesmo Y. Só muda o X, sempre somando o mesmo valor.',
          'Uma placa, sete Cilindros furo e uma Caixa furo rasa. Use a grade de 1 mm e mova com as setas, contando os passos.',
          ['Placa: Caixa 90 × 24 × 4.', 'Cilindro furo 3 × 3 × 6, elevação −1 (atravessa por cima e por baixo). Posicione a 15 mm da borda esquerda.', 'Copie e cole, mude o diâmetro para 4 e mova 12 mm para a direita. Repita para 5, 6, 8 e 10.', 'Furo de pendurar: Cilindro furo Ø 5 na outra ponta.', 'Rebaixo: Caixa furo 80 × 4 × 2 elevada a 3 mm (corta só 1 mm), perto da borda.', 'Selecione tudo e agrupe uma única vez.']
        ],
        crit: ['Diâmetros corretos e em ordem.', 'Espaçamento igual e furos alinhados.', 'Furos atravessando a placa.', 'Rebaixo raso, sem furar.'],
        model: () => {
          const out = [box(90, 24, 4, 0, 0, 0, { c: 'silver', n: 'Placa' })];
          [3, 4, 5, 6, 8, 10].forEach((d, i) => out.push(hcyl(d, d, 6, -30 + i * 12, 2, -1, { n: 'Furo Ø' + d })));
          out.push(hcyl(5, 5, 6, 38, 2, -1, { n: 'Furo de pendurar' }));
          out.push(hbox(80, 4, 2, -2, -8, 3, { n: 'Rebaixo' }));
          return out;
        }
      },
      {
        id: 18, nome: 'Encaixe macho e fêmea', diff: 3,
        obj: 'Criar encaixes funcionais: furos que recebem pinos, com folga calculada para formatos quadrado e redondo.',
        desc: 'Uma base com dois soquetes (um quadrado e um redondo) e, ao lado, os dois pinos com cabeça que entram neles. Os soquetes são cavidades com fundo, ligeiramente maiores que os pinos.',
        req: ['Base de 50 × 30 × 15 mm.', 'Soquete quadrado de 10,4 × 10,4 mm e soquete redondo de Ø 8,4 mm, ambos com 11 mm de profundidade.', 'Pino quadrado de 10 × 10 mm e pino redondo de Ø 8 mm, ambos com cabeça mais larga.', 'Folga de 0,2 mm por lado nos dois encaixes.', 'Base e cada pino agrupados separadamente.'],
        formas: ['box', 'cyl', 'boxh', 'cylh'], tools: ['furo', 'agrupar', 'grade', 'alinhar'],
        skills: ['Encaixe com folga', 'Cavidade de profundidade definida', 'Peças complementares'],
        dicas: [
          'O furo da fêmea é o "molde" do pino, um pouquinho maior. A profundidade do soquete deve ser menor que o comprimento do pino, para a cabeça ficar para fora.',
          'Caixa furo e Cilindro furo na base, elevados para deixar fundo. Pinos com Caixa/Cilindro + cabeça. Grade de 0,1 mm.',
          ['Base: Caixa 50 × 30 × 15.', 'Soquete quadrado: Caixa furo 10,4 × 10,4 × 12, elevação 4 (fundo de 4 mm), a 12 mm do centro para a esquerda.', 'Soquete redondo: Cilindro furo 8,4 × 8,4 × 12, elevação 4, a 12 mm para a direita. Agrupe a base.', 'Pino quadrado: Caixa 10 × 10 × 16 com uma Caixa 16 × 16 × 4 por cima (cabeça). Agrupe.', 'Pino redondo: Cilindro 8 × 8 × 16 com Cilindro 14 × 14 × 4 por cima. Agrupe.', 'Coloque os pinos ao lado da base, em pé.']
        ],
        crit: ['Folgas corretas nos dois soquetes.', 'Soquetes com fundo (não atravessam).', 'Pinos compatíveis com os soquetes.', 'Grupos separados e organizados.'],
        model: () => [box(50, 30, 15, 0, 0, 0, { c: 'blue', n: 'Base' }), hbox(10.4, 10.4, 12, -12, 0, 4, { n: 'Soquete quadrado' }), hcyl(8.4, 8.4, 12, 12, 0, 4, { n: 'Soquete redondo' }),
          box(10, 10, 16, 42, -8, 0, { c: 'orange', g: 1, n: 'Pino quadrado' }), box(16, 16, 4, 42, -8, 16, { c: 'orange', g: 1, n: 'Cabeça' }), cyl(8, 8, 16, 42, 14, 0, { c: 'yellow', g: 2, n: 'Pino redondo' }), cyl(14, 14, 4, 42, 14, 16, { c: 'yellow', g: 2, n: 'Cabeça' })]
      },
      {
        id: 19, nome: 'Suporte em L', diff: 3,
        obj: 'Construir um suporte de parede com reforços e furos escareados para parafuso, usando o Cone como furo.',
        novo: { titulo: 'Cone como furo: o escareado', texto: 'Parafusos de cabeça chata precisam de um furo em funil (escareado) para a cabeça ficar rente. Um Cone virado de cabeça para baixo, transformado em furo, faz exatamente isso. Combine com um Cilindro furo fino para o corpo do parafuso.' },
        desc: 'Uma cantoneira em L: placa horizontal e placa vertical unidas, dois reforços triangulares nas laterais, dois furos escareados na placa horizontal e dois furos simples na vertical.',
        req: ['Placa horizontal de 50 × 30 × 4 mm e placa vertical de 50 × 4 × 40 mm, formando um L.', 'Dois reforços triangulares (Cunha) entre as placas.', 'Dois furos escareados na horizontal: Cilindro furo Ø 4 + Cone furo invertido Ø 8.', 'Dois furos Ø 4 atravessando a placa vertical.', 'Tudo agrupado em uma peça.'],
        formas: ['box', 'wedge', 'cylh', 'cone'], tools: ['furo', 'agrupar', 'rotacionar', 'alinhar'],
        skills: ['Escareado', 'Reforço estrutural', 'Furos em faces diferentes'],
        dicas: [
          'O reforço triangular trabalha como um esquadro: liga a placa de baixo à de trás. O escareado é um funil: largo em cima, estreito embaixo.',
          'Duas Caixas, duas Cunhas (gire em Z até a parte alta encostar na placa vertical), Cilindros furo e Cones furo girados 180°.',
          ['Caixa 50 × 30 × 4 (horizontal). Caixa 50 × 4 × 40 na borda de trás, apoiada no plano.', 'Cunha 20 × 4 × 20, girada em Z até o lado alto encostar na placa vertical. Uma em cada lateral, sobre a placa horizontal.', 'Cilindro furo 4 × 4 × 10 atravessando a horizontal, a 15 mm do centro para cada lado.', 'Cone 8 × 8 × 4 girado 180° (ponta para baixo), como furo, com a base larga rente ao topo da placa, sobre cada furo.', 'Na vertical: Cilindros furo Ø 4 girados 90° em X, atravessando, a 28 mm de altura.', 'Agrupe tudo.']
        ],
        crit: ['L firme, com placas unidas sem vão.', 'Reforços na posição e orientação corretas.', 'Escareados com funil voltado para cima.', 'Furos atravessando as placas.'],
        model: () => [box(50, 30, 4, 0, 0, 0, { c: 'silver', n: 'Placa horizontal' }), box(50, 4, 40, 0, 13, 0, { c: 'silver', n: 'Placa vertical' }),
          wedge(20, 4, 20, -20, 1, 4, { c: 'gray', r: [0, 0, -90], n: 'Reforço (Cunha)' }), wedge(20, 4, 20, 20, 1, 4, { c: 'gray', r: [0, 0, -90], n: 'Reforço (Cunha)' }),
          hcyl(4, 4, 10, -12, -4, -2, { n: 'Furo do parafuso' }), hcyl(4, 4, 10, 12, -4, -2, { n: 'Furo do parafuso' }),
          cone(8, 8, 4, -12, -4, 0.01, { hole: true, r: [180, 0, 0], n: 'Escareado (Cone furo)' }), cone(8, 8, 4, 12, -4, 0.01, { hole: true, r: [180, 0, 0], n: 'Escareado (Cone furo)' }),
          hcyl(4, 4, 10, -12, 13, 23, { r: [90, 0, 0], n: 'Furo da parede' }), hcyl(4, 4, 10, 12, 13, 23, { r: [90, 0, 0], n: 'Furo da parede' })]
      },
      {
        id: 20, nome: 'Casa de passarinho', diff: 4,
        obj: 'Desafio do módulo: combinar cavidade, furos passantes, furos decorativos e grupos independentes num objeto real.',
        desc: 'Uma casinha de passarinho para pendurar: corpo oco com fundo, entrada redonda na frente, poleiro logo abaixo da entrada, furos de ventilação nas laterais, telhado de duas águas com beiral e uma argola no topo.',
        req: ['Corpo de 50 × 50 × 60 mm, oco, com paredes de 3 mm e fundo de 3 mm.', 'Entrada redonda de Ø 18 mm atravessando só a parede da frente.', 'Poleiro cilíndrico abaixo da entrada.', 'Dois furos de ventilação Ø 5 em cada lateral.', 'Telhado com beiral, como grupo separado apoiado no corpo.', 'Argola (Toroide) no topo para pendurar.'],
        formas: ['box', 'boxh', 'cylh', 'cyl', 'roof', 'torus'], tools: ['furo', 'agrupar', 'rotacionar', 'elevar', 'cor'],
        skills: ['Planejar furos com função', 'Separar grupos', 'Objeto funcional completo'],
        dicas: [
          'Liste as aberturas e para que cada uma serve: entrar, ventilar, limpar. Cada furo tem um tamanho e uma profundidade por um motivo.',
          'Caixa + Caixa furo para o corpo, Cilindros furo girados para a entrada e ventilação, Cilindro para o poleiro, Telhado e Toroide em pé.',
          ['Caixa 50 × 50 × 60. Caixa furo 44 × 44 × 60, elevação 3: paredes e fundo de 3 mm, topo aberto.', 'Entrada: Cilindro furo 18 × 18 × 10 girado 90° em X, atravessando só a parede frontal, centro a 40 mm de altura.', 'Ventilação: Cilindros furo Ø 5 girados 90° em Y, atravessando as laterais, a 48 mm de altura.', 'Poleiro: Cilindro 4 × 4 × 14 girado 90° em X, saindo da frente 10 mm abaixo da entrada. Agrupe o corpo.', 'Telhado: Telhado 62 × 60 × 22 elevado a 60 mm, cor diferente, grupo separado.', 'Argola: Toroide em pé (90° em X) com Ø 14, no topo do telhado.']
        ],
        crit: ['Corpo oco com fundo e paredes uniformes.', 'Entrada, ventilação e poleiro nas posições corretas.', 'Telhado apoiado, com beiral.', 'Argola presa no topo e grupos organizados.'],
        model: () => [box(50, 50, 60, 0, 0, 0, { c: 'wood', n: 'Corpo' }), hbox(44, 44, 60, 0, 0, 3, { n: 'Cavidade' }), hcyl(18, 18, 10, 0, -25, 35, { r: [90, 0, 0], n: 'Entrada' }),
          hcyl(5, 5, 60, 0, -8, 18, { r: [0, 90, 0], n: 'Ventilação' }), hcyl(5, 5, 60, 0, 8, 18, { r: [0, 90, 0], n: 'Ventilação' }),
          cyl(4, 4, 14, 0, -28, 23, { c: 'brown', r: [90, 0, 0], n: 'Poleiro' }),
          roof(62, 60, 22, 0, 0, 60, { c: 'red', g: 1, n: 'Telhado' }), torus(14, 3, 0, 0, 85, { c: 'dark', g: 1, r: [90, 0, 0], n: 'Argola' })]
      }
    ]
  });
})();
