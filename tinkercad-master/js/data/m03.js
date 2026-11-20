/* Módulo 3 — Primeiras construções (fases 21–30) */
(function () {
  const { box, cyl, sphere, cone, torus, roof, wedge, hbox, hcyl, hemi } = TM.S;
  TM.addModule({
    n: 3, cor: '#3aa655', titulo: 'Primeiras construções',
    resumo: 'Decompor objetos do dia a dia em formas básicas e montá-los com proporção, escala e furos.',
    phases: [
      {
        id: 21, nome: 'Mesa de jantar', diff: 2,
        obj: 'Decompor um móvel em peças e trabalhar em escala 1:10, convertendo medidas reais em milímetros do modelo.',
        novo: { titulo: 'Escala 1:10', texto: 'Em escala 1:10, cada 1 cm do objeto real vira 1 mm no modelo. Uma mesa real de 120 × 70 cm e 75 cm de altura vira 120 × 70 × 75 mm. Trabalhar em escala mantém todos os móveis do curso compatíveis entre si.' },
        desc: 'Uma mesa retangular de madeira: tampo grosso, quatro pernas quadradas recuadas das bordas e uma saia (moldura) sob o tampo ligando as pernas.',
        req: ['Escala 1:10: mesa de 120 × 70 mm e 75 mm de altura total.', 'Tampo de 4 mm de espessura.', 'Quatro pernas de 5 × 5 mm, recuadas cerca de 2 mm das bordas.', 'Saia de 8 mm de altura nos quatro lados, logo abaixo do tampo.', 'Tudo agrupado.'],
        formas: ['box'], tools: ['dimensionar', 'elevar', 'mover', 'copiar', 'agrupar'],
        skills: ['Decomposição em peças', 'Escala', 'Simetria de quatro cantos'],
        dicas: [
          'Uma mesa é: uma placa, quatro colunas e uma moldura. A altura das pernas é a altura total menos a espessura do tampo.',
          'Só Caixas. Faça uma perna, copie e cole três vezes; use a vista de topo para conferir os quatro cantos.',
          ['Tampo: Caixa 120 × 70 × 4, elevação 71.', 'Perna: Caixa 5 × 5 × 71. Coloque num canto, 2 mm para dentro das duas bordas.', 'Copie e cole a perna três vezes e leve aos outros cantos (vista de topo).', 'Saia frontal e traseira: Caixas 100 × 2 × 8, elevação 63, alinhadas com a face interna das pernas.', 'Saias laterais: Caixas 2 × 50 × 8, elevação 63.', 'Agrupe tudo.']
        ],
        crit: ['Medidas em escala 1:10 corretas.', 'Pernas simétricas e apoiadas.', 'Saia encostada no tampo e nas pernas.', 'Peça agrupada.'],
        model: () => {
          const o = [box(120, 70, 4, 0, 0, 71, { c: 'wood', n: 'Tampo' })];
          [[-55, -30], [55, -30], [-55, 30], [55, 30]].forEach(([x, y]) => o.push(box(5, 5, 71, x, y, 0, { c: 'brown', n: 'Perna' })));
          o.push(box(100, 2, 8, 0, -29, 63, { c: 'brown', n: 'Saia' }), box(100, 2, 8, 0, 29, 63, { c: 'brown', n: 'Saia' }), box(2, 50, 8, -54, 0, 63, { c: 'brown', n: 'Saia' }), box(2, 50, 8, 54, 0, 63, { c: 'brown', n: 'Saia' }));
          return o;
        }
      },
      {
        id: 22, nome: 'Cadeira com encosto', diff: 3,
        obj: 'Construir uma cadeira compatível com a mesa da fase anterior usando Ocultar e Bloquear para trabalhar em peças escondidas.',
        novo: { titulo: 'Ocultar e Bloquear', texto: 'Quando uma peça atrapalha a visão de outra, selecione-a e clique no ícone de lâmpada (Ocultar, Ctrl+H). "Mostrar tudo" traz de volta. O cadeado (Bloquear, Ctrl+L) trava a peça: ela não se move por acidente enquanto você ajusta as outras.' },
        desc: 'Uma cadeira de madeira na mesma escala da mesa: assento quadrado, pernas da frente redondas, pernas de trás que sobem e viram as colunas do encosto, três ripas horizontais no encosto e uma travessa entre as pernas da frente.',
        req: ['Escala 1:10: assento a 45 mm de altura e encosto até 90 mm.', 'Assento de 45 × 45 × 4 mm.', 'Pernas da frente cilíndricas; pernas de trás contínuas até o topo do encosto.', 'Três ripas horizontais no encosto, igualmente espaçadas.', 'Travessa entre as pernas da frente.', 'Proporção compatível com a mesa da fase 21.'],
        formas: ['box', 'cyl'], tools: ['ocultar', 'dimensionar', 'elevar', 'rotacionar', 'agrupar'],
        skills: ['Peças contínuas', 'Espaçamento igual', 'Compatibilidade de escala'],
        dicas: [
          'A perna de trás e a coluna do encosto são a mesma peça: começa no chão e termina no topo. Isso simplifica e deixa a cadeira mais firme.',
          'Caixa para assento, ripas e pernas de trás; Cilindro para as pernas da frente e para a travessa (girado 90° em Y). Oculte o assento para posicionar as pernas.',
          ['Assento: Caixa 45 × 45 × 4, elevação 41. Bloqueie (Ctrl+L) para não mover.', 'Pernas de trás: Caixas 4 × 4 × 90 nos cantos traseiros, embaixo do assento.', 'Pernas da frente: Cilindros 4 × 4 × 41 nos cantos frontais. Oculte o assento se precisar ver.', 'Ripas: Caixas 38 × 2 × 6 entre as pernas de trás, elevações 58, 70 e 82.', 'Travessa: Cilindro 3 × 3 × 38 girado 90° em Y, entre as pernas da frente, a 12 mm de altura.', 'Mostrar tudo, desbloquear e agrupar.']
        ],
        crit: ['Alturas de assento e encosto em escala.', 'Pernas de trás contínuas e alinhadas.', 'Ripas paralelas e bem espaçadas.', 'Cadeira estável e proporcional à mesa.'],
        model: () => [box(45, 45, 4, 0, 0, 41, { c: 'wood', n: 'Assento' }),
          cyl(4, 4, 41, -19, -19, 0, { c: 'brown', n: 'Perna da frente' }), cyl(4, 4, 41, 19, -19, 0, { c: 'brown', n: 'Perna da frente' }),
          box(4, 4, 90, -19, 19, 0, { c: 'brown', n: 'Perna de trás' }), box(4, 4, 90, 19, 19, 0, { c: 'brown', n: 'Perna de trás' }),
          box(34, 2, 6, 0, 19, 58, { c: 'wood', n: 'Ripa' }), box(34, 2, 6, 0, 19, 70, { c: 'wood', n: 'Ripa' }), box(34, 2, 6, 0, 19, 82, { c: 'wood', n: 'Ripa' }),
          cyl(3, 3, 38, 0, -19, 0, { c: 'brown', r: [0, 90, 0], cz: 12, n: 'Travessa' })]
      },
      {
        id: 23, nome: 'Casa com aberturas', diff: 3,
        obj: 'Unir o que foi aprendido em furos e construções: paredes ocas com porta e janelas que realmente atravessam.',
        desc: 'Uma casa com paredes de 3 mm e piso, porta e janelas vazadas na fachada, uma janela lateral, peitoris salientes sob as janelas, telhado de duas águas e chaminé. Olhando pela porta, vê-se o interior.',
        req: ['Paredes de 80 × 60 × 45 mm, ocas, com 3 mm de espessura e piso de 3 mm.', 'Porta vazada de 16 × 30 mm na fachada.', 'Duas janelas vazadas na fachada e uma na lateral.', 'Peitoris (placas) sob as janelas da fachada.', 'Telhado com beiral e chaminé como grupo separado.'],
        formas: ['box', 'boxh', 'roof'], tools: ['furo', 'agrupar', 'alinhar', 'elevar'],
        skills: ['Paredes ocas', 'Aberturas em várias faces', 'Grupos separados'],
        dicas: [
          'Esvazie a casa primeiro, depois recorte as aberturas. Um furo de porta só precisa atravessar uma parede: deixe-o raso o suficiente para não furar a de trás.',
          'Caixa + Caixa furo para paredes e piso; Caixas furo para porta e janelas; Telhado e Caixa da chaminé num segundo grupo.',
          ['Caixa 80 × 60 × 45. Caixa furo 74 × 54 × 45, elevação 3 (piso).', 'Porta: Caixa furo 16 × 10 × 30, elevação 3, centrada na fachada, atravessando só a parede da frente.', 'Janelas: Caixas furo 16 × 10 × 14, elevação 18, a 25 mm do centro para cada lado.', 'Janela lateral: Caixa furo 10 × 16 × 14 na parede direita.', 'Agrupe as paredes com os furos.', 'Peitoris: Caixas 20 × 4 × 2 sob cada janela, saindo 2 mm da fachada. Telhado 88 × 68 × 28 elevado a 45 e chaminé 10 × 10 × 20.']
        ],
        crit: ['Paredes e piso uniformes.', 'Aberturas atravessando apenas a parede correta.', 'Simetria da fachada.', 'Telhado e chaminé bem apoiados.'],
        model: () => [box(80, 60, 45, 0, 0, 0, { c: 'cream', n: 'Paredes' }), hbox(74, 54, 45, 0, 0, 3, { n: 'Interior' }), hbox(16, 10, 30, 0, -30, 3, { n: 'Porta' }),
          hbox(16, 10, 14, -25, -30, 18, { n: 'Janela' }), hbox(16, 10, 14, 25, -30, 18, { n: 'Janela' }), hbox(10, 16, 14, 40, 5, 18, { n: 'Janela lateral' }),
          box(20, 4, 2, -25, -31, 16, { c: 'white', g: 2, n: 'Peitoril' }), box(20, 4, 2, 25, -31, 16, { c: 'white', g: 2, n: 'Peitoril' }),
          roof(88, 68, 28, 0, 0, 45, { c: 'red', g: 1, n: 'Telhado' }), box(10, 10, 20, 22, 12, 55, { c: 'brown', g: 1, n: 'Chaminé' })]
      },
      {
        id: 24, nome: 'Janela com venezianas', diff: 3,
        obj: 'Modelar um componente arquitetônico detalhado: moldura vazada, divisórias, vidro e venezianas com frisos rasos.',
        desc: 'Uma janela isolada: moldura retangular vazada sobre um peitoril, uma cruz de divisórias dividindo o vão em quatro, vidro azul claro atrás e duas venezianas abertas ao lado, cada uma com frisos horizontais.',
        req: ['Moldura de 50 × 6 × 60 mm com vão de 42 × 52 mm.', 'Peitoril saliente na base.', 'Divisórias vertical e horizontal centradas no vão.', 'Vidro como placa fina de cor clara.', 'Duas venezianas abertas, cada uma com pelo menos 5 frisos rasos (furos de 0,6 mm de profundidade).'],
        formas: ['box', 'boxh'], tools: ['furo', 'agrupar', 'alinhar', 'copiar', 'grade'],
        skills: ['Moldura vazada', 'Frisos rasos', 'Detalhe em série'],
        dicas: [
          'A moldura é um bloco com um furo. As divisórias e o vidro moram dentro do vão. Os frisos são furos tão rasos que só marcam a superfície.',
          'Caixa + Caixa furo para a moldura; Caixas finas para divisórias, vidro e venezianas; Caixas furo bem finas para os frisos.',
          ['Peitoril: Caixa 56 × 10 × 3.', 'Moldura: Caixa 50 × 6 × 60, elevação 3. Caixa furo 42 × 10 × 52 elevada a 7. Agrupe.', 'Divisórias: Caixa 2 × 4 × 52 (vertical) e Caixa 42 × 4 × 2 (horizontal), centradas no vão.', 'Vidro: Caixa 42 × 1 × 52 no fundo do vão, azul claro.', 'Veneziana: Caixa 21 × 3 × 52 ao lado da moldura. Frisos: Caixas furo 17 × 1,2 × 1,6 na face da frente, afundando 0,6 mm, copiados a cada 8 mm. Agrupe e copie para o outro lado.']
        ],
        crit: ['Vão vazado com medidas corretas.', 'Divisórias centradas.', 'Frisos rasos e regulares.', 'Venezianas simétricas.'],
        model: () => {
          const o = [box(56, 10, 3, 0, -2, 0, { c: 'white', g: 3, n: 'Peitoril' }), box(50, 6, 60, 0, 0, 3, { c: 'white', n: 'Moldura' }), hbox(42, 10, 52, 0, 0, 7, { n: 'Vão' }),
            box(2, 4, 52, 0, 0, 7, { c: 'white', g: 1, n: 'Divisória' }), box(42, 4, 2, 0, 0, 32, { c: 'white', g: 1, n: 'Divisória' }), box(42, 1, 52, 0, 2, 7, { c: 'glass', g: 1, n: 'Vidro' })];
          [-1, 1].forEach((s) => {
            const x = s * 36.5;
            o.push(box(21, 3, 52, x, -1.5, 7, { c: 'green', g: 2, n: 'Veneziana' }));
            for (let i = 0; i < 6; i++) o.push(hbox(17, 1.2, 1.6, x, -3, 12 + i * 8, { g: 2, n: 'Friso' }));
          });
          return o;
        }
      },
      {
        id: 25, nome: 'Porta com almofadas', diff: 3,
        obj: 'Usar rebaixos rasos para criar relevo (almofadas) e montar uma porta com batente, maçaneta e dobradiças.',
        desc: 'Uma porta de madeira dentro de um batente em U: a folha tem quatro almofadas rebaixadas (duas em cima, duas embaixo), maçaneta redonda com espelho e duas dobradiças do lado oposto.',
        req: ['Batente em U (sem peça no chão) envolvendo a folha.', 'Folha de cerca de 43 × 4 × 89 mm.', 'Quatro almofadas rebaixadas 1 mm na face da frente, simétricas.', 'Maçaneta com espelho (Cilindro) e puxador (Esfera).', 'Duas dobradiças cilíndricas no lado oposto da maçaneta.'],
        formas: ['box', 'boxh', 'cyl', 'sphere'], tools: ['furo', 'agrupar', 'alinhar', 'rotacionar'],
        skills: ['Rebaixo para relevo', 'Simetria em grade 2 × 2', 'Peça dentro de moldura'],
        dicas: [
          'A almofada é a área que ficou mais funda. O batente é um bloco com um furo que sai pela parte de baixo.',
          'Caixa + Caixa furo para o batente; Caixa para a folha; quatro Caixas furo rasas; Cilindros girados para espelho e dobradiças; Esfera para o puxador.',
          ['Batente: Caixa 52 × 8 × 94. Caixa furo 44 × 12 × 91 começando abaixo do plano (elevação −1): o batente fica em U.', 'Folha: Caixa 43 × 4 × 89 dentro do batente.', 'Almofadas: Caixas furo 15 × 2 × 32, encostadas na face da frente para cortar 1 mm. Duas em cima (elevação 48) e duas embaixo (elevação 8), a 9,5 mm do centro. Agrupe com a folha.', 'Maçaneta: Cilindro 6 × 6 × 2 girado 90° em X na face, a 45 mm de altura e 16 mm do centro; Esfera Ø 6 à frente.', 'Dobradiças: Cilindros 3 × 3 × 10 em pé na junção folha/batente do outro lado.']
        ],
        crit: ['Almofadas simétricas e rasas.', 'Folha encaixada no batente.', 'Maçaneta e dobradiças em lados opostos.', 'Proporções de porta real.'],
        model: () => {
          const o = [box(52, 8, 94, 0, 0, 0, { c: 'brown', n: 'Batente' }), hbox(44, 12, 91, 0, 0, -1, { n: 'Vão do batente' }), box(43, 4, 89, 0, 0, 0.5, { c: 'wood', g: 1, n: 'Folha' })];
          [[-9.5, 48], [9.5, 48], [-9.5, 8], [9.5, 8]].forEach(([x, z]) => o.push(hbox(15, 2, 32, x, -2.5, z, { g: 1, n: 'Almofada' })));
          o.push(cyl(6, 6, 2, 16, -3, 0, { c: 'yellow', g: 2, r: [90, 0, 0], cz: 45, n: 'Espelho' }), sphere(6, 6, 6, 16, -6, 42, { c: 'yellow', g: 2, n: 'Puxador' }),
            cyl(3, 3, 10, -21.5, -2, 72, { c: 'silver', g: 2, n: 'Dobradiça' }), cyl(3, 3, 10, -21.5, -2, 12, { c: 'silver', g: 2, n: 'Dobradiça' }));
          return o;
        }
      },
      {
        id: 26, nome: 'Vaso com flores', diff: 3,
        obj: 'Esvaziar formas curvas com furos da mesma forma (esfera dentro de esfera) e compor um arranjo com Meia esfera.',
        desc: 'Um vaso bojudo: pé cilíndrico, corpo esférico oco com parede de 3 mm, gargalo cilíndrico, boca com borda de Toroide. Três flores saem do gargalo, com caules finos e flores feitas de Meia esfera com miolo.',
        req: ['Corpo esférico de Ø 50 mm, oco, com parede de 3 mm (Esfera furo de Ø 44 no mesmo centro).', 'Pé, gargalo e borda de Toroide centralizados.', 'Abertura contínua do gargalo até o interior do corpo.', 'Três flores com caule, pétalas (Meia esfera) e miolo.', 'Vaso e flores agrupados separadamente.'],
        formas: ['sphere', 'cyl', 'torus', 'hemi', 'cylh'], tools: ['furo', 'agrupar', 'alinhar', 'rotacionar'],
        skills: ['Casca de espessura constante', 'Alinhamento de centros', 'Composição orgânica'],
        dicas: [
          'Uma casca com parede uniforme nasce de duas formas iguais com o mesmo centro, uma 2 × espessura menor e transformada em furo.',
          'Esfera Ø 50 e Esfera furo Ø 44 com o mesmo centro; Cilindros para pé e gargalo; Cilindro furo para abrir a boca; Toroide na borda; Meias esferas nas flores.',
          ['Pé: Cilindro 24 × 24 × 4.', 'Corpo: Esfera 50 elevada a 2 (centro a 27 mm). Esfera furo 44 elevada a 5 (mesmo centro).', 'Gargalo: Cilindro 18 × 18 × 18 elevado a 44. Cilindro furo 12 × 12 × 40 elevado a 30 atravessando o gargalo até o corpo.', 'Borda: Toroide de Ø 22 e tubo 4 elevado a 60.', 'Agrupe o vaso. Flores: Cilindros 1,5 × 1,5 × 40 (caules, um levemente inclinado), Meia esfera Ø 12 virada para cima e Esfera Ø 4 de miolo.', 'Agrupe as flores com Multicor.']
        ],
        crit: ['Corpo oco com parede uniforme.', 'Peças centralizadas no mesmo eixo.', 'Boca aberta até o interior.', 'Flores bem posicionadas e coloridas.'],
        model: () => [cyl(24, 24, 4, 0, 0, 0, { c: 'blue', n: 'Pé' }), sphere(50, 50, 50, 0, 0, 2, { c: 'blue', n: 'Corpo' }), TM.S.sphere(44, 44, 44, 0, 0, 5, { hole: true, n: 'Esfera furo' }),
          cyl(18, 18, 18, 0, 0, 44, { c: 'blue', n: 'Gargalo' }), hcyl(12, 12, 40, 0, 0, 30, { n: 'Abertura' }), torus(22, 4, 0, 0, 60, { c: 'sky', n: 'Borda (Toroide)' }),
          cyl(1.5, 1.5, 40, 0, 0, 50, { c: 'green', g: 1, n: 'Caule' }), hemi(12, 12, 5, 0, 0, 90, { c: 'pink', g: 1, n: 'Flor (Meia esfera)' }), sphere(4, 4, 4, 0, 0, 93, { c: 'yellow', g: 1, n: 'Miolo' }),
          cyl(1.5, 1.5, 34, -6, 0, 0, { c: 'green', g: 1, r: [0, -14, 0], cz: 66, n: 'Caule' }), hemi(12, 12, 5, -10.5, 0, 82, { c: 'red', g: 1, r: [0, -14, 0], n: 'Flor (Meia esfera)' }), sphere(4, 4, 4, -11, 0, 85, { c: 'yellow', g: 1, n: 'Miolo' }),
          cyl(1.5, 1.5, 34, 6, 0, 0, { c: 'green', g: 1, r: [0, 14, 0], cz: 66, n: 'Caule' }), hemi(12, 12, 5, 10.5, 0, 82, { c: 'purple', g: 1, r: [0, 14, 0], n: 'Flor (Meia esfera)' }), sphere(4, 4, 4, 11, 0, 85, { c: 'yellow', g: 1, n: 'Miolo' })]
      },
      {
        id: 27, nome: 'Banco de praça', diff: 3,
        obj: 'Montar um móvel de ripas: peças repetidas com espaçamento constante e um encosto inclinado.',
        desc: 'Um banco de praça: duas laterais de metal com recorte em arco embaixo, assento de quatro ripas de madeira com frestas, encosto de três ripas inclinado 15° para trás apoiado em colunas e braços nas laterais.',
        req: ['Duas laterais de 6 × 44 × 40 mm, cada uma com recorte inferior (furo).', 'Assento com 4 ripas de 100 × 8 × 3 mm e frestas iguais entre elas.', 'Encosto com 3 ripas inclinadas 15° para trás.', 'Colunas do encosto com a mesma inclinação.', 'Braços sobre as laterais.'],
        formas: ['box', 'boxh'], tools: ['rotacionar', 'copiar', 'mover', 'furo', 'agrupar'],
        skills: ['Espaçamento constante', 'Inclinação coerente', 'Estrutura e acabamento'],
        dicas: [
          'Ripas iguais com frestas iguais: o passo entre os centros é sempre largura da ripa + fresta. Tudo no encosto gira o mesmo ângulo.',
          'Caixas para laterais, ripas, colunas e braços; Caixa furo para o recorte. Rotação em X para o encosto (−15°).',
          ['Laterais: Caixas 6 × 44 × 40 a 45 mm do centro. Caixa furo 8 × 30 × 22 embaixo de cada uma (elevação −1). Agrupe cada lateral.', 'Ripa do assento: Caixa 100 × 8 × 3, elevação 40. Copie e cole, movendo 10 mm em Y a cada vez (4 ripas, fresta de 2 mm).', 'Colunas: Caixas 6 × 4 × 40 sobre as laterais, no fundo, giradas −15° em X.', 'Ripas do encosto: Caixas 100 × 3 × 8 giradas −15° em X, encostadas na frente das colunas, uma acima da outra.', 'Braços: Caixas 6 × 36 × 3 sobre as laterais, a 58 mm.', 'Agrupe com Multicor.']
        ],
        crit: ['Ripas uniformes e frestas iguais.', 'Encosto com inclinação coerente em todas as peças.', 'Recortes das laterais limpos.', 'Banco estável e simétrico.'],
        model: () => {
          const o = [];
          [-1, 1].forEach((s) => {
            o.push(box(6, 44, 40, s * 45, 0, 0, { c: 'dark', g: s > 0 ? 1 : 2, n: 'Lateral' }), hbox(8, 30, 22, s * 45, 0, -1, { g: s > 0 ? 1 : 2, n: 'Recorte' }));
            o.push(box(6, 4, 42, s * 45, 25.5, 0, { c: 'dark', g: 5, r: [-15, 0, 0], cz: 62, n: 'Coluna do encosto' }), box(6, 36, 3, s * 45, -2, 56, { c: 'dark', g: 5, n: 'Braço' }));
          });
          [-15, -5, 5, 15].forEach((y) => o.push(box(100, 8, 3, 0, y, 40, { c: 'wood', g: 3, n: 'Ripa do assento' })));
          [[5, 0], [15, 1], [25, 2]].forEach(([h]) => o.push(box(100, 3, 8, 0, 21 + h * Math.tan(Math.PI / 12), 0, { c: 'wood', g: 4, r: [-15, 0, 0], cz: 50 + h, n: 'Ripa do encosto' })));
          return o;
        }
      },
      {
        id: 28, nome: 'Estante de livros', diff: 3,
        obj: 'Criar compartimentos com vários furos num mesmo bloco e organizar o projeto em subgrupos (estante, livros, objetos).',
        novo: { titulo: 'Grupos dentro de grupos', texto: 'Você pode agrupar grupos. Agrupe os livros de cada prateleira, depois agrupe as prateleiras de livros entre si. Assim é fácil mover uma prateleira inteira sem desmontar o resto. Desagrupar desfaz só um nível por vez.' },
        desc: 'Uma estante de madeira com fundo fechado e quatro nichos abertos na frente. Os nichos têm livros de alturas e cores diferentes, um livro inclinado apoiado nos outros, um pequeno vaso e uma caixa.',
        req: ['Corpo de 80 × 30 × 120 mm com quatro nichos feitos com Caixas furo.', 'Fundo fechado (os nichos não atravessam até as costas).', 'Prateleiras com 3 mm de espessura e rodapé na base.', 'Pelo menos 10 livros com alturas e cores variadas, um deles inclinado.', 'Livros e objetos organizados em subgrupos.'],
        formas: ['box', 'boxh', 'cyl'], tools: ['furo', 'agrupar', 'rotacionar', 'copiar', 'alinhar'],
        skills: ['Múltiplos nichos', 'Subgrupos', 'Variação controlada'],
        dicas: [
          'A estante é um bloco maciço "escavado" quatro vezes. A distância entre os furos é a espessura das prateleiras.',
          'Uma Caixa e quatro Caixas furo iguais, empilhadas com 3 mm de intervalo; Caixas finas para livros; um Cilindro para o vaso.',
          ['Caixa 80 × 30 × 120.', 'Caixa furo 74 × 29 × 26 deixando 2 mm de fundo atrás e saindo pela frente. Primeira com elevação 5 (rodapé).', 'Copie o furo e eleve 29 mm a cada vez (26 do nicho + 3 da prateleira): elevações 5, 34, 63 e 92. Agrupe.', 'Livros: Caixas de 4 a 6 mm de largura, 20 de profundidade, 16 a 24 de altura, apoiados nas prateleiras. Incline um em Y.', 'Vaso: Cilindro pequeno numa prateleira; caixa decorativa em outra.', 'Agrupe os livros por prateleira e depois tudo junto (Multicor).']
        ],
        crit: ['Nichos iguais e prateleiras uniformes.', 'Fundo fechado.', 'Livros apoiados, variados e organizados.', 'Uso de subgrupos.'],
        model: () => {
          const o = [box(80, 30, 120, 0, 0, 0, { c: 'wood', n: 'Corpo da estante' })];
          [5, 34, 63, 92].forEach((z) => o.push(hbox(74, 29, 26, 0, -2.5, z, { n: 'Nicho' })));
          const cols = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'navy', 'teal'];
          let k = 0;
          [[5, -34, 8], [34, -34, 5], [63, 4, 7]].forEach(([z, x0, n]) => { let x = x0; for (let i = 0; i < n; i++) { const w = 4 + (i % 3), h = 16 + ((i * 7) % 9); o.push(box(w, 20, h, x + w / 2, -4, z, { c: cols[k++ % cols.length], g: 1, n: 'Livro' })); x += w + 0.5; } });
          o.push(box(5, 20, 22, -12, -4, 34, { c: 'red', g: 1, r: [0, 22, 0], n: 'Livro inclinado' }));
          o.push(cyl(10, 10, 14, 22, -4, 34, { c: 'teal', g: 2, n: 'Vaso' }), box(18, 14, 10, -20, -4, 63, { c: 'pink', g: 2, n: 'Caixa' }), box(30, 18, 6, 15, -4, 92, { c: 'silver', g: 2, n: 'Livros deitados' }));
          return o;
        }
      },
      {
        id: 29, nome: 'Luminária de mesa', diff: 3,
        obj: 'Usar a propriedade Raio do topo do Cone para criar um cone truncado e esvaziá-lo com outro cone furo, formando uma cúpula.',
        novo: { titulo: 'Cone truncado', texto: 'No Inspetor do Cone há "Raio superior". Com valor maior que zero, a ponta vira um círculo: é um tronco de cone, ótimo para cúpulas, baldes e vasos. Um segundo cone truncado, um pouco menor e transformado em furo, deixa a cúpula oca.' },
        desc: 'Uma luminária de mesa: base redonda pesada com botão, haste vertical, articulação esférica, cúpula em tronco de cone oca (aberta em cima e embaixo) e lâmpada visível por baixo.',
        req: ['Base cilíndrica de Ø 40 mm e haste vertical centralizada.', 'Cúpula em tronco de cone (Raio superior maior que zero).', 'Cúpula oca, com parede de cerca de 2 mm, aberta em cima e embaixo.', 'Lâmpada (Esfera) dentro da cúpula, presa à haste.', 'Botão na base.'],
        formas: ['cyl', 'cone', 'sphere', 'box'], tools: ['propriedades', 'furo', 'agrupar', 'alinhar'],
        skills: ['Cone truncado', 'Casca cônica', 'Alinhamento vertical'],
        dicas: [
          'Uma cúpula é a "pele" de um tronco de cone. Para a pele ficar com espessura constante, o cone furo precisa ter a mesma inclinação do cone sólido.',
          'Cilindros para base e haste, Esfera para articulação e lâmpada, dois Cones truncados (um sólido e um furo), Caixa pequena para o botão.',
          ['Base: Cilindro 40 × 40 × 6. Botão: Caixa 6 × 4 × 3 sobre a base, perto da borda.', 'Haste: Cilindro 4 × 4 × 62 no centro. Articulação: Esfera Ø 7 no topo.', 'Cúpula: Cone 44 × 44 × 26 com Raio superior ≈ 10 (o topo fica com ~20 mm). Eleve a 52.', 'Furo: Cone 40 × 40 × 28 com Raio superior ≈ 9, elevado a 51 (passa 1 mm acima e abaixo). Agrupe com a cúpula.', 'Lâmpada: Esfera Ø 14 amarela sob a articulação. Alinhe tudo no centro (L) e agrupe com Multicor.']
        ],
        crit: ['Cúpula oca e aberta nas duas pontas.', 'Parede da cúpula uniforme.', 'Peças centralizadas no mesmo eixo.', 'Proporção de luminária de mesa.'],
        model: () => [cyl(40, 40, 6, 0, 0, 0, { c: 'dark', n: 'Base' }), box(6, 4, 3, 12, -8, 6, { c: 'red', n: 'Botão' }), cyl(4, 4, 62, 0, 0, 6, { c: 'silver', n: 'Haste' }), sphere(7, 7, 7, 0, 0, 66, { c: 'silver', n: 'Articulação' }),
          cone(44, 44, 26, 0, 0, 52, { c: 'yellow', g: 1, top: 0.45, n: 'Cúpula (Cone truncado)' }), cone(40, 40, 28, 0, 0, 51, { hole: true, g: 1, top: 0.45, n: 'Cone furo' }), sphere(14, 14, 14, 0, 0, 54, { c: 'cream', n: 'Lâmpada' })]
      },
      {
        id: 30, nome: 'Relógio de mesa', diff: 4,
        obj: 'Desafio do módulo: criar marcações circulares girando barras em torno do centro e montar um objeto com mostrador rebaixado e ponteiros.',
        novo: { titulo: 'Truque das barras', texto: 'Para 12 marcações em círculo sem calcular 12 posições: faça uma barra que atravesse o mostrador inteiro passando pelo centro (ela marca 12 e 6). Copie e gire 30°, depois 60°, 90°, 120° e 150°: seis barras viram doze marcas. Um disco no centro cobre o meio das barras.' },
        desc: 'Um relógio de mesa redondo em pé sobre uma base de madeira: caixa cilíndrica com mostrador branco rebaixado, doze marcações de horas, disco central cobrindo as barras, ponteiros das horas e dos minutos e um pino central. Um pequeno botão no topo.',
        req: ['Caixa cilíndrica em pé (Ø 70 mm) apoiada numa base.', 'Mostrador rebaixado com Cilindro furo raso na frente.', 'Doze marcações igualmente espaçadas (30° entre elas).', 'Ponteiro dos minutos apontando para 12 e das horas para 4.', 'Pino central e botão no topo.', 'Peças agrupadas com Multicor.'],
        formas: ['cyl', 'cylh', 'box', 'sphere'], tools: ['rotacionar', 'copiar', 'furo', 'alinhar', 'agrupar'],
        skills: ['Rotação em torno do centro', 'Rebaixo frontal', 'Ângulos de 30°'],
        dicas: [
          'O relógio é um círculo dividido em 12 partes: 360° ÷ 12 = 30°. Barras que passam pelo centro marcam duas horas de uma vez.',
          'Cilindro girado 90° em X para a caixa e o mostrador, Cilindro furo raso para o rebaixo, Caixas finas para barras e ponteiros. Gire as barras em Y (o eixo que aponta para você).',
          ['Base: Caixa 50 × 24 × 10. Caixa do relógio: Cilindro 70 × 70 × 12 girado 90° em X, com o centro a 45 mm de altura.', 'Rebaixo: Cilindro furo 62 × 62 × 4 girado 90° em X, cortando 2 mm da frente. Agrupe.', 'Mostrador: Cilindro 62 × 62 × 1 branco dentro do rebaixo.', 'Barra: Caixa 56 × 1 × 3 escura, centrada no mostrador. Copie e gire 30° em Y; repita até ter 6 barras (0°, 30°, ..., 150°).', 'Disco branco Ø 44 × 0,6 sobre as barras: só as pontas aparecem.', 'Ponteiros: Caixas 2 × 1 × 26 (minutos, para cima) e 2 × 1 × 18 girada 120° (horas). Pino: Cilindro Ø 5 no centro. Botão no topo.']
        ],
        crit: ['Doze marcações regulares.', 'Mostrador rebaixado e centralizado.', 'Ponteiros corretos e presos no pino.', 'Relógio estável e bem acabado.'],
        model: () => {
          const C = 45, o = [box(50, 24, 10, 0, 0, 0, { c: 'wood', g: 9, n: 'Base' }), cyl(70, 70, 12, 0, 0, 0, { c: 'red', r: [90, 0, 0], cz: C, n: 'Caixa do relógio' }), hcyl(62, 62, 4, 0, -6, 0, { r: [90, 0, 0], cz: C, n: 'Rebaixo' }),
            cyl(62, 62, 1, 0, -4.5, 0, { c: 'white', g: 1, r: [90, 0, 0], cz: C, n: 'Mostrador' })];
          for (let k = 0; k < 6; k++) o.push(box(56, 1, 3, 0, -5.2, 0, { c: 'dark', g: 1, r: [0, k * 30, 0], cz: C, n: 'Barra de marcação' }));
          o.push(cyl(44, 44, 0.6, 0, -5.9, 0, { c: 'white', g: 1, r: [90, 0, 0], cz: C, n: 'Disco central' }),
            box(2, 1, 26, 0, -6.6, 0, { c: 'black', g: 1, cz: C + 11, n: 'Ponteiro dos minutos' }), box(2.6, 1, 18, 7.8, -7, 0, { c: 'black', g: 1, r: [0, 120, 0], cz: C - 4.5, n: 'Ponteiro das horas' }),
            cyl(5, 5, 3, 0, -7, 0, { c: 'yellow', g: 1, r: [90, 0, 0], cz: C, n: 'Pino central' }), sphere(8, 8, 8, 0, 0, 79, { c: 'yellow', g: 1, n: 'Botão' }));
          return o;
        }
      }
    ]
  });
})();
