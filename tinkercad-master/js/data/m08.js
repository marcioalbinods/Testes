/* Módulo 8 — Personagens e criatividade (fases 71–80) */
(function () {
  const { box, cyl, sphere, cone, torus, tube, poly, wedge, roof, rroof, hemi, pyr, hbox, hcyl, bar } = TM.S;
  const sp = (d, x, y, cz, o) => sphere(d, d, d, x, y, cz - d / 2, o); // esfera pelo centro
  const eye = (x, y, cz, d, g) => [sp(d, x, y, cz, { c: 'white', g, n: 'Olho' }), sp(d * 0.5, x, y - d * 0.32, cz, { c: 'black', g, n: 'Pupila' })];
  TM.S.sp = sp; TM.S.eye = eye;

  TM.addModule({
    n: 8, cor: '#ec6fa5', titulo: 'Personagens e criatividade',
    resumo: 'Anatomia simplificada, expressão, pose e estilo próprio construídos com formas básicas.',
    phases: [
      {
        id: 71, nome: 'Manequim articulado', diff: 4,
        obj: 'Estruturar uma figura humana por articulações (esferas) e segmentos (cilindros), aplicando proporção corporal e pose.',
        novo: { titulo: 'Proporção do corpo em "cabeças"', texto: 'Uma figura adulta mede cerca de 7,5 cabeças de altura. O quadril fica na metade da altura; os ombros têm cerca de 2 cabeças de largura; o cotovelo fica na altura da cintura e o pulso, na altura do quadril. Use a cabeça como régua do personagem.' },
        desc: 'Um manequim de desenho em madeira sobre uma base: cabeça oval, tórax e quadril em esferas alongadas, esferas em todas as articulações (ombros, cotovelos, pulsos, quadris, joelhos, tornozelos) e cilindros ligando-as. Um braço acena para cima e as pernas estão num passo.',
        req: ['Altura de cerca de 7,5 cabeças.', 'Esferas em ombros, cotovelos, pulsos, quadris, joelhos e tornozelos.', 'Segmentos (Cilindros) ligando exatamente as articulações.', 'Pose: um braço erguido e as pernas em passo.', 'Base com haste de apoio.'],
        formas: ['sphere', 'cyl', 'box'], tools: ['rotacionar', 'alinhar', 'regua', 'agrupar', 'espelhar'],
        skills: ['Proporção humana', 'Estrutura por articulações', 'Pose'],
        dicas: [
          'Posicione primeiro todas as esferas das articulações, como pontos de um esqueleto. Só depois ligue os pontos com os cilindros.',
          'Esferas alongadas para cabeça, tórax e quadril; Esferas Ø 8 nas juntas; Cilindros girados para os membros; Caixas para os pés; Cilindro para base e haste.',
          ['Base: Cilindro 44 × 44 × 4. Haste: Cilindro fino até o quadril, atrás da figura.', 'Quadril: Esfera 22 × 14 × 14 com centro a 60 mm. Tórax: Esfera 26 × 16 × 30 com centro a 84. Cabeça: Esfera 15 × 15 × 19 com centro a 111.', 'Juntas: ombros (±14, 94), cotovelos, pulsos, quadris (±7, 56), joelhos, tornozelos. Esferas Ø 8.', 'Membros: Cilindros Ø 6 com o comprimento entre duas juntas, girados em Y até tocar as duas.', 'Braço esquerdo para cima (cotovelo e pulso acima do ombro). Pernas: um joelho mais à frente. Pés: Caixas 8 × 14 × 4.']
        ],
        crit: ['Proporções do corpo coerentes.', 'Todas as articulações presentes.', 'Segmentos ligados às juntas.', 'Pose expressiva e estável.'],
        model: () => {
          const W = { c: 'wood' }, J = { c: 'brown' };
          const pts = { sL: [-14, 94], sR: [14, 94], eL: [-28, 108], wL: [-32, 127], eR: [18, 73], wR: [20, 54], hL: [-7, 56], hR: [7, 56], kL: [-9, 32], kR: [10, 33], aL: [-9, 9], aR: [11, 9] };
          const o = [cyl(44, 44, 4, 0, 14, 0, { c: 'dark', n: 'Base' }), cyl(3, 3, 54, 0, 14, 4, { c: 'dark', n: 'Haste' }),
            sp(22, 0, 0, 60, Object.assign({ n: 'Quadril' }, W)), sphere(26, 16, 30, 0, 0, 69, Object.assign({ n: 'Tórax' }, W)), cyl(7, 7, 10, 0, 0, 96, Object.assign({ n: 'Pescoço' }, W)), sphere(15, 15, 19, 0, 0, 101.5, Object.assign({ n: 'Cabeça' }, W)), cyl(10, 8, 10, 0, 0, 62, Object.assign({ n: 'Cintura' }, W))];
          Object.values(pts).forEach(([x, z]) => o.push(sp(8, x, 0, z, Object.assign({ n: 'Articulação' }, J))));
          [['sL', 'eL'], ['eL', 'wL'], ['sR', 'eR'], ['eR', 'wR'], ['hL', 'kL'], ['kL', 'aL'], ['hR', 'kR'], ['kR', 'aR']].forEach(([a, b]) => o.push(bar(pts[a][0], pts[a][1], pts[b][0], pts[b][1], 0, 6, Object.assign({ n: 'Segmento' }, W))));
          o.push(sp(9, -33, 0, 133, Object.assign({ n: 'Mão' }, W)), sp(9, 20, 0, 48, Object.assign({ n: 'Mão' }, W)), box(8, 14, 4, -9, -4, 4, Object.assign({ n: 'Pé' }, W)), box(8, 14, 4, 11, -4, 4, Object.assign({ n: 'Pé' }, W)));
          return o;
        }
      },
      {
        id: 72, nome: 'Robô explorador detalhado', diff: 4,
        obj: 'Criar um personagem mecânico com muitos componentes: esteiras, corpo cilíndrico, cabeça em cúpula, braços com garras e painel com botões.',
        desc: 'Um robô explorador sobre duas esteiras: cada esteira tem bloco com rodas aparentes; corpo cilíndrico com painel frontal rebaixado, tela e botões; cabeça em Meia esfera com lente grande; braços articulados com garras de dois dedos; mochila de bateria com aletas; antena e luzes.',
        req: ['Duas esteiras simétricas com pelo menos 3 rodas cada.', 'Corpo cilíndrico com painel rebaixado contendo tela e 3 botões.', 'Cabeça em Meia esfera com lente (Cilindro + Tubo).', 'Dois braços com ombro, antebraço e garra.', 'Mochila de bateria com aletas repetidas.', 'Antena e luzes.'],
        formas: ['box', 'cyl', 'hemi', 'tube', 'sphere', 'boxh'], tools: ['espelhar', 'duplicar', 'furo', 'alinhar', 'agrupar'],
        skills: ['Personagem mecânico', 'Muitos subgrupos', 'Simetria com detalhes'],
        dicas: [
          'Separe o robô em subsistemas: locomoção, corpo, cabeça, braços, energia. Modele e agrupe cada um antes de juntar.',
          'Caixas e Cilindros deitados para as esteiras; Cilindro + Caixa furo para o painel; Meia esfera e Tubo para cabeça e lente; Caixas giradas para os dedos; espelhe braços e esteiras.',
          ['Esteira: Caixa 16 × 60 × 14 + 3 Cilindros Ø 14 deitados em X ao longo dela. Agrupe e espelhe para o outro lado.', 'Corpo: Cilindro 40 × 40 × 36 sobre as esteiras. Painel: Caixa furo 20 × 6 × 16 na frente, tela e botões dentro.', 'Cabeça: Meia esfera 40 × 40 × 20. Lente: Cilindro deitado Ø 12 + Tubo de moldura.', 'Braço: Esfera de ombro, Cilindro do braço, Caixa do antebraço e dois dedos girados ±20°. Espelhe.', 'Mochila: Caixa nas costas com aletas (Ctrl+D). Antena: Cilindro + Esfera.']
        ],
        crit: ['Subsistemas completos.', 'Simetria de esteiras e braços.', 'Painel e lente bem detalhados.', 'Personagem com identidade.'],
        model: () => {
          const o = [];
          [-1, 1].forEach((s) => { o.push(box(16, 60, 14, s * 22, 0, 0, { c: 'dark', n: 'Esteira' })); [-20, 0, 20].forEach((y) => o.push(cyl(14, 14, 17, s * 22, y, 0, { c: 'gray', r: [0, 90, 0], cz: 7, n: 'Roda' }))); });
          o.push(box(40, 40, 6, 0, 0, 12, { c: 'gray', n: 'Chassi' }), cyl(40, 40, 36, 0, 0, 18, { c: 'yellow', g: 1, n: 'Corpo' }), hbox(20, 10, 16, 0, -19, 30, { g: 1, n: 'Painel rebaixado' }),
            box(14, 1, 7, 0, -16.5, 38, { c: 'sky', g: 2, n: 'Tela' }), cyl(3, 3, 2, -5, -17, 0, { c: 'red', g: 2, r: [90, 0, 0], cz: 34, n: 'Botão' }), cyl(3, 3, 2, 0, -17, 0, { c: 'lime', g: 2, r: [90, 0, 0], cz: 34, n: 'Botão' }), cyl(3, 3, 2, 5, -17, 0, { c: 'blue', g: 2, r: [90, 0, 0], cz: 34, n: 'Botão' }),
            hemi(40, 40, 20, 0, 0, 54, { c: 'white', g: 3, n: 'Cabeça (Meia esfera)' }), cyl(12, 12, 8, 0, -16, 0, { c: 'black', g: 3, r: [90, 0, 0], cz: 62, n: 'Lente' }), tube(16, 3, 2, 0, -19, 0, { c: 'yellow', g: 3, r: [90, 0, 0], cz: 62, n: 'Moldura (Tubo)' }), cyl(6, 6, 1, 0, -20, 0, { c: 'sky', g: 3, r: [90, 0, 0], cz: 62, n: 'Vidro' }),
            cyl(2, 2, 16, 10, 4, 70, { c: 'dark', g: 3, n: 'Antena' }), sp(5, 10, 4, 87, { c: 'red', g: 3, n: 'Luz' }), box(30, 12, 30, 0, 24, 22, { c: 'dark', g: 4, n: 'Mochila de bateria' }));
          for (let i = 0; i < 5; i++) o.push(box(30, 4, 1.6, 0, 31, 25 + i * 5.5, { c: 'gray', g: 4, n: 'Aleta' }));
          [-1, 1].forEach((s) => o.push(sp(12, s * 24, 0, 46, { c: 'gray', g: 5, n: 'Ombro' }), bar(s * 26, 44, s * 32, 28, 0, 6, { c: 'gray', g: 5, n: 'Braço' }), box(8, 18, 8, s * 32, -8, 22, { c: 'yellow', g: 5, n: 'Antebraço' }),
            box(3, 10, 3, s * 30, -20, 24, { c: 'dark', g: 5, r: [0, 0, s * 20], n: 'Dedo da garra' }), box(3, 10, 3, s * 34, -20, 24, { c: 'dark', g: 5, r: [0, 0, -s * 20], n: 'Dedo da garra' })));
          return o;
        }
      },
      {
        id: 73, nome: 'Personagem humano estilizado', diff: 4,
        obj: 'Criar um personagem humano em estilo "cabeção" (chibi), trabalhando expressão facial, cabelo e roupa com formas básicas.',
        desc: 'Um personagem jovem em estilo cabeção: cabeça grande com cabelo (Meia esfera + franja), olhos com brilho, nariz, boca sorridente, orelhas; camiseta em tronco de cone, bermuda, braços com mãos, pernas e tênis; mochila nas costas com alças.',
        req: ['Cabeça com cerca de 1/3 da altura total (estilo cabeção).', 'Cabelo com Meia esfera e franja.', 'Rosto com olhos (com brilho), nariz, boca e orelhas simétricas.', 'Roupa: camiseta (Cone truncado), bermuda e tênis.', 'Mochila com alças.', 'Personagem de pé e equilibrado.'],
        formas: ['sphere', 'hemi', 'cone', 'cyl', 'box', 'torus'], tools: ['espelhar', 'alinhar', 'rotacionar', 'agrupar', 'cor'],
        skills: ['Estilização', 'Expressão facial', 'Roupa e acessório'],
        dicas: [
          'No estilo cabeção, os olhos ficam abaixo do meio da cabeça e bem separados. Isso deixa o personagem simpático.',
          'Esfera para a cabeça, Meia esfera para o cabelo, Esferas pequenas para olhos e nariz, Toroide cortado para a boca, Cone truncado para a camiseta, Meias esferas esticadas para os tênis.',
          ['Pernas: Cilindros 8 × 8 × 18; tênis: Meias esferas 10 × 16 × 7 deslocadas para a frente.', 'Bermuda: Caixa 24 × 14 × 10. Camiseta: Cone 28 × 18 × 24 com Raio superior menor.', 'Braços: Cilindros Ø 6 levemente inclinados; mãos: Esferas Ø 8.', 'Cabeça: Esfera Ø 36. Cabelo: Meia esfera Ø 38 e franja (Caixas giradas).', 'Olhos: Esferas pretas Ø 6 + brilho branco Ø 2; boca: Toroide pequeno com metade cortada; orelhas: Meias esferas nas laterais (espelhe).', 'Mochila: Caixa nas costas + alças (Caixas finas).']
        ],
        crit: ['Proporção do estilo cabeção.', 'Rosto expressivo e simétrico.', 'Roupa e mochila coerentes.', 'Personagem equilibrado.'],
        model: () => {
          const o = [];
          [-1, 1].forEach((s) => o.push(cyl(8, 8, 18, s * 6, 0, 5, { c: 'skin', n: 'Perna' }), hemi(10, 16, 7, s * 6, -3, 0, { c: 'red', n: 'Tênis' }), bar(s * 13, 44, s * 18, 30, 0, 6, { c: 'skin', n: 'Braço' }), sp(8, s * 18.5, 0, 28, { c: 'skin', n: 'Mão' }),
            sp(8, s * 18, 0, 68, { c: 'skin', g: 1, n: 'Orelha' }), sp(6, s * 7, -15, 67, { c: 'black', g: 1, n: 'Olho' }), sp(2, s * 7 - 1.4, -17.6, 68.6, { c: 'white', g: 1, n: 'Brilho' }), box(3, 3, 12, s * 4, -3, 46, { c: 'orange', g: 2, n: 'Alça' })));
          o.push(box(24, 14, 10, 0, 0, 22, { c: 'navy', n: 'Bermuda' }), cone(28, 18, 24, 0, 0, 30, { c: 'teal', top: 0.7, n: 'Camiseta (Cone)' }), cyl(8, 8, 4, 0, 0, 52, { c: 'skin', n: 'Pescoço' }),
            sp(36, 0, 0, 70, { c: 'skin', g: 1, n: 'Cabeça' }), hemi(38, 38, 20, 0, 2, 72, { c: 'brown', g: 1, n: 'Cabelo (Meia esfera)' }), rroof(26, 7, 5, 0, -14.5, 75, { c: 'brown', g: 1, r: [-25, 0, 0], n: 'Franja (Telhado redondo)' }),
            sp(3, 0, -17.5, 62, { c: 'pink', g: 1, n: 'Nariz' }), torus(8, 1.4, 0, -16.6, 0, { c: 'red', g: 1, r: [90, 0, 0], cz: 57, n: 'Boca (Toroide)' }), hbox(12, 6, 6, 0, -17, 57, { g: 1, n: 'Corte da boca' }),
            box(20, 10, 24, 0, 13, 28, { c: 'orange', g: 2, n: 'Mochila' }));
          return o;
        }
      },
      {
        id: 74, nome: 'Cachorro estilizado', diff: 4,
        obj: 'Construir um quadrúpede: corpo alongado, quatro patas niveladas, cabeça com focinho e orelhas caídas, cauda e coleira.',
        desc: 'Um cachorro de pé, de perfil para a direita: corpo em cápsula (Cilindro deitado com Esferas nas pontas), quatro patas com pés arredondados, cabeça com focinho, nariz, olhos e orelhas caídas, cauda erguida, coleira com plaquinha e manchas no corpo.',
        req: ['Corpo em cápsula (Cilindro deitado + duas Esferas).', 'Quatro patas iguais com as bases no mesmo plano.', 'Cabeça com focinho, nariz, olhos e duas orelhas caídas.', 'Cauda erguida (Cone girado).', 'Coleira (Toroide) com plaquinha.', 'Pelo menos duas manchas (Meias esferas achatadas).'],
        formas: ['cyl', 'sphere', 'hemi', 'cone', 'torus'], tools: ['rotacionar', 'espelhar', 'alinhar', 'agrupar', 'cor'],
        skills: ['Anatomia de quadrúpede', 'Cápsula', 'Equilíbrio de quatro apoios'],
        dicas: [
          'Uma cápsula é a melhor forma para corpos de animais. As patas da frente ficam embaixo do peito e as de trás embaixo do quadril.',
          'Cilindro deitado em X + Esferas nas pontas; Cilindros para as patas e Meias esferas para os pés; Esferas para cabeça e focinho; Esferas achatadas e giradas para as orelhas; Cone para a cauda; Toroide para a coleira.',
          ['Corpo: Cilindro 24 × 24 × 40 girado 90° em Y, centro a 34 mm. Esferas Ø 24 nas duas pontas.', 'Patas: Cilindros 7 × 7 × 26 sob o peito e o quadril (espelhe em Y). Pés: Meias esferas 9 × 11 × 5.', 'Cabeça: Esfera Ø 22 à frente e acima. Focinho: Esfera 16 × 12 × 10 à frente; nariz preto.', 'Orelhas: Esferas 10 × 3 × 15 nas laterais da cabeça, inclinadas para baixo.', 'Cauda: Cone 6 × 6 × 18 girado para cima e para trás. Coleira: Toroide em volta do pescoço e plaquinha (Cilindro).']
        ],
        crit: ['Quatro patas niveladas.', 'Cabeça com expressão e orelhas.', 'Proporções de cachorro.', 'Detalhes de cauda, coleira e manchas.'],
        model: () => {
          const o = [cyl(24, 24, 40, 0, 0, 0, { c: 'sand', r: [0, 90, 0], cz: 34, n: 'Corpo' }), sp(24, -20, 0, 34, { c: 'sand', n: 'Quadril' }), sp(24, 20, 0, 34, { c: 'sand', n: 'Peito' })];
          [[-20, -7], [-20, 7], [20, -7], [20, 7]].forEach(([x, y]) => o.push(cyl(7, 7, 26, x, y, 3, { c: 'sand', n: 'Pata' }), hemi(9, 11, 5, x + 1, y, 0, { c: 'white', n: 'Pé' })));
          o.push(cyl(12, 12, 14, 26, 0, 0, { c: 'sand', r: [0, 35, 0], cz: 47, n: 'Pescoço' }), sp(22, 33, 0, 56, { c: 'sand', g: 1, n: 'Cabeça' }), sphere(16, 12, 10, 42, 0, 47, { c: 'white', g: 1, n: 'Focinho' }), sp(5, 50, 0, 53, { c: 'black', g: 1, n: 'Nariz' }),
            sp(4, 40, -6, 60, { c: 'black', g: 1, n: 'Olho' }), sp(4, 40, 6, 60, { c: 'black', g: 1, n: 'Olho' }), sphere(10, 3, 15, 30, -11, 47, { c: 'brown', g: 1, r: [15, 0, 0], n: 'Orelha' }), sphere(10, 3, 15, 30, 11, 47, { c: 'brown', g: 1, r: [-15, 0, 0], n: 'Orelha' }),
            torus(16, 3, 27, 0, 0, { c: 'red', g: 2, r: [0, 55, 0], cz: 45, n: 'Coleira (Toroide)' }), cyl(5, 5, 1, 31, -1, 0, { c: 'yellow', g: 2, r: [0, 55, 0], cz: 41, n: 'Plaquinha' }),
            cone(6, 6, 18, -32, 0, 0, { c: 'sand', r: [0, -40, 0], cz: 46, n: 'Cauda (Cone)' }), hemi(14, 10, 3, -6, -11, 0, { c: 'brown', r: [90, 0, 0], cz: 38, n: 'Mancha' }), hemi(10, 8, 3, 10, 11.5, 0, { c: 'brown', r: [-90, 0, 0], cz: 32, n: 'Mancha' }));
          return o;
        }
      },
      {
        id: 75, nome: 'Gato sentado', diff: 4,
        obj: 'Representar uma pose sentada e detalhes finos (bigodes, orelhas com parte interna, cauda curvada com Toroide cortado).',
        desc: 'Um gato sentado de frente: corpo em gota (Esfera alongada), coxas arredondadas, patas da frente retas com pés, cabeça com orelhas pontudas (Pirâmides) e parte interna rosa, olhos amendoados, focinho, nariz triangular, bigodes finos e a cauda contornando o corpo pelo chão.',
        req: ['Corpo e coxas formando uma pose sentada estável.', 'Duas orelhas de Pirâmide com parte interna de outra cor.', 'Olhos, nariz (Cone invertido) e focinho.', 'Pelo menos 4 bigodes finos inclinados (Cilindros).', 'Cauda curva com metade de um Toroide contornando o corpo.'],
        formas: ['sphere', 'pyr', 'cone', 'cyl', 'torus', 'boxh', 'hemi'], tools: ['rotacionar', 'espelhar', 'furo', 'agrupar', 'alinhar'],
        skills: ['Pose sentada', 'Detalhes finos', 'Curva com Toroide cortado'],
        dicas: [
          'Num gato sentado, o peso fica nas coxas e nas patas da frente, que formam um triângulo de apoio. A cauda "abraça" a base.',
          'Esferas alongadas para corpo e coxas; Cilindros para as patas; Pirâmides para as orelhas; Cone girado 180° para o nariz; Cilindros finos girados para os bigodes; Toroide com Caixa furo para a cauda.',
          ['Corpo: Esfera 34 × 30 × 42. Coxas: Esferas 18 × 26 × 18 nas laterais, embaixo.', 'Patas: Cilindros 7 × 7 × 20 na frente; pés: Meias esferas.', 'Cabeça: Esfera 30 × 26 × 26 acima. Orelhas: Pirâmides 10 × 5 × 12 inclinadas; interna rosa menor (espelhe).', 'Olhos: Esferas 5 × 2 × 7 verdes com pupila. Nariz: Cone 4 × 4 × 3 girado 180°.', 'Bigodes: Cilindros 0,8 × 0,8 × 14 girados ±80° em Y e inclinados (3 de cada lado).', 'Cauda: Toroide Ø 50 tubo 6 no chão, com Caixa furo removendo a metade de trás. Agrupe.']
        ],
        crit: ['Pose sentada convincente.', 'Orelhas e rosto detalhados.', 'Bigodes simétricos.', 'Cauda curva bem resolvida.'],
        model: () => {
          const C = { c: 'orange' }, o = [sphere(34, 30, 42, 0, 0, 2, Object.assign({ n: 'Corpo' }, C)), sphere(18, 26, 18, -13, 3, 1, Object.assign({ n: 'Coxa' }, C)), sphere(18, 26, 18, 13, 3, 1, Object.assign({ n: 'Coxa' }, C)),
            torus(52, 6, 0, 4, 0, { c: 'orange', g: 1, n: 'Cauda (Toroide)' }), hbox(60, 32, 10, 0, 22, -1, { g: 1, n: 'Corte da cauda' }), sphere(30, 26, 26, 0, -2, 40, Object.assign({ n: 'Cabeça' }, C))];
          [-1, 1].forEach((s) => {
            o.push(cyl(7, 7, 20, s * 6, -11, 2, Object.assign({ n: 'Pata' }, C)), hemi(9, 11, 4, s * 6, -13, 0, { c: 'white', n: 'Pé' }),
              pyr(10, 6, 12, s * 9, 0, 61, { c: 'orange', r: [0, s * 14, 0], n: 'Orelha (Pirâmide)' }), pyr(6, 3, 8, s * 9, -1.8, 61.5, { c: 'pink', r: [0, s * 14, 0], n: 'Orelha interna' }),
              sphere(5, 2, 7, s * 6, -14.4, 51, { c: 'lime', g: 2, n: 'Olho' }), sphere(1.6, 1, 5, s * 6, -15.2, 52, { c: 'black', g: 2, n: 'Pupila' }));
            [-8, 0, 8].forEach((a) => o.push(cyl(0.8, 0.8, 14, s * 10, -14, 0, { c: 'dark', g: 3, r: [0, s * 82, a * s], ro: 'ZYX', cz: 46 + a / 4, n: 'Bigode' })));
          });
          o.push(sphere(12, 6, 8, 0, -13, 41, { c: 'white', g: 2, n: 'Focinho' }), cone(4, 4, 3, 0, -15.5, 47, { c: 'pink', g: 2, r: [180, 0, 0], n: 'Nariz (Cone)' }));
          return o;
        }
      },
      {
        id: 76, nome: 'Dinossauro', diff: 5,
        obj: 'Modelar uma criatura com corpo inclinado, cauda e pescoço em ângulo, pernas fortes e uma fileira de placas dorsais distribuídas ao longo de uma curva.',
        desc: 'Um dinossauro bípede estilizado: corpo inclinado, cauda longa em cone apontando para trás, pescoço e cabeça com mandíbula aberta e dentes, olhos, braços curtos, pernas com coxas grandes, canelas e pés com garras, e placas dorsais em Pirâmide ao longo das costas e da cauda.',
        req: ['Corpo inclinado com cauda (Cone) que equilibra a cabeça.', 'Cabeça com mandíbula superior e inferior separadas e dentes.', 'Pernas com coxa, canela e pé com três garras.', 'Braços curtos.', 'Pelo menos 7 placas dorsais diminuindo em direção à cauda.', 'Apoio estável nos dois pés.'],
        formas: ['sphere', 'cone', 'box', 'pyr', 'cyl'], tools: ['rotacionar', 'duplicar', 'espelhar', 'alinhar', 'agrupar'],
        skills: ['Equilíbrio de massas', 'Série decrescente', 'Criatura estilizada'],
        dicas: [
          'Um bípede como esse funciona como uma gangorra: a cauda equilibra a cabeça sobre as pernas. O quadril é o ponto de apoio.',
          'Esfera alongada e girada para o corpo; Cone girado para a cauda; Caixas para as mandíbulas; Pirâmides pequenas para dentes e placas; Esferas, Cilindros e Caixas para as pernas.',
          ['Corpo: Esfera 60 × 34 × 40 girada −15° em Y, centro a 60 mm.', 'Cauda: Cone 30 × 30 × 70 girado para trás e um pouco para baixo.', 'Pescoço: Cilindro inclinado; cabeça: Caixa 30 × 18 × 16 e mandíbula inferior girada 15° (boca aberta); dentes: Pirâmides invertidas.', 'Perna: coxa (Esfera), canela (Cilindro inclinado), pé (Caixa) com três Cones de garra. Espelhe.', 'Braços: Cilindros curtos com garras.', 'Placas: Pirâmide achatada nas costas; Ctrl+D descendo e diminuindo até a cauda.']
        ],
        crit: ['Equilíbrio entre cabeça e cauda.', 'Boca aberta com dentes.', 'Pernas fortes e simétricas.', 'Placas em série decrescente.'],
        model: () => {
          const G = { c: 'green' }, o = [sphere(60, 34, 40, 0, 0, 40, Object.assign({ r: [0, -15, 0], n: 'Corpo' }, G)), cone(30, 30, 72, -54, 0, 0, Object.assign({ r: [0, -100, 0], cz: 52, n: 'Cauda (Cone)' }, G)),
            bar(22, 66, 36, 84, 0, 16, Object.assign({ n: 'Pescoço' }, G)), box(32, 18, 12, 46, 0, 86, Object.assign({ n: 'Cabeça' }, G)), box(28, 16, 5, 46, 0, 78, Object.assign({ r: [0, 14, 0], n: 'Mandíbula' }, G)),
            sp(5, 42, -8, 94, { c: 'yellow', n: 'Olho' }), sp(5, 42, 8, 94, { c: 'yellow', n: 'Olho' })];
          for (let i = 0; i < 5; i++) { o.push(pyr(3, 3, 4, 36 + i * 5.5, -6, 82, { c: 'white', r: [180, 0, 0], n: 'Dente' }), pyr(3, 3, 4, 36 + i * 5.5, 6, 82, { c: 'white', r: [180, 0, 0], n: 'Dente' })); }
          [-1, 1].forEach((s) => o.push(sphere(22, 14, 30, 2, s * 14, 30, Object.assign({ n: 'Coxa' }, G)), bar(4, 36, 0, 8, s * 15, 9, Object.assign({ n: 'Canela' }, G)), box(22, 12, 6, 6, s * 15, 0, Object.assign({ n: 'Pé' }, G)),
            cone(3, 3, 6, 18, s * 15 - 4, 0, { c: 'white', r: [0, 90, 0], cz: 2, n: 'Garra' }), cone(3, 3, 6, 18, s * 15, 0, { c: 'white', r: [0, 90, 0], cz: 2, n: 'Garra' }), cone(3, 3, 6, 18, s * 15 + 4, 0, { c: 'white', r: [0, 90, 0], cz: 2, n: 'Garra' }),
            bar(24, 56, 32, 46, s * 12, 4, Object.assign({ n: 'Braço curto' }, G))));
          for (let i = 0; i < 9; i++) { const x = 20 - i * 12, z = x > -20 ? 77 + x * 0.05 : 66 + (x + 20) * 0.3, k = 1 - i * 0.08; o.push(pyr(13 * k, 3, 14 * k, x, 0, z - 2, { c: 'orange', n: 'Placa dorsal' })); }
          return o;
        }
      },
      {
        id: 77, nome: 'Foguete na plataforma', diff: 4,
        obj: 'Distribuir aletas a 120° com rotação composta, criar janelas recortadas num cilindro e montar a cena de lançamento.',
        desc: 'Um foguete clássico pronto para decolar: corpo cilíndrico com faixas, ogiva cônica, três janelas redondas com moldura, três aletas a 120°, bocal em tronco de cone e chamas de cores diferentes, sobre uma plataforma com torre de serviço treliçada.',
        req: ['Corpo cilíndrico com ogiva (Cone) e faixas (Toroide ou Tubo).', 'Três janelas recortadas com Cilindro furo e vidro.', 'Três aletas (Cunha) distribuídas exatamente a 120°.', 'Bocal em Cone truncado e chamas com Cones de cores diferentes.', 'Plataforma e torre de serviço com treliça.'],
        formas: ['cyl', 'cone', 'wedge', 'tube', 'cylh', 'box', 'sphere'], tools: ['rotacionar', 'duplicar', 'furo', 'alinhar', 'agrupar'],
        skills: ['Simetria radial de 3', 'Recortes em cilindro', 'Cena com contexto'],
        dicas: [
          'As aletas giram em torno do eixo do foguete. Agrupe uma aleta com uma cópia-furo do lado oposto para o centro do grupo coincidir com o eixo, depois gire 120°.',
          'Cilindro + Cone; Tubos finos para as faixas; Cilindros furo deitados para as janelas; Cunhas para as aletas; Cones truncados e invertidos para bocal e chamas; Caixas para a torre.',
          ['Corpo: Cilindro 30 × 30 × 90 elevado a 30. Ogiva: Cone 30 × 30 × 36 em cima.', 'Faixas: Tubos Ø 31 × 4 a 50 e 100 mm.', 'Janelas: Cilindro furo Ø 8 deitado, atravessando só a frente; vidro e moldura (Tubo). Ctrl+D subindo 16 mm.', 'Aleta: Cunha 20 × 3 × 30 com a parte alta no corpo. Gire cópias a 120° e 240° em torno do eixo.', 'Bocal: Cone truncado invertido. Chamas: Cones vermelho, laranja e amarelo apontando para baixo.', 'Plataforma: Cilindro 90 × 90 × 6. Torre: Caixas verticais com travessas e braço até o foguete.']
        ],
        crit: ['Aletas a 120° exatos.', 'Janelas recortadas e alinhadas.', 'Bocal e chamas centrados.', 'Cena completa e estável.'],
        model: () => {
          const o = [cyl(90, 90, 6, 0, 0, 0, { c: 'gray', g: 9, n: 'Plataforma' }), cyl(30, 30, 90, 0, 0, 30, { c: 'white', n: 'Corpo' }), cone(30, 30, 36, 0, 0, 120, { c: 'red', g: 1, n: 'Ogiva (Cone)' }),
            tube(31, 4, 2, 0, 0, 50, { c: 'red', g: 1, n: 'Faixa (Tubo)' }), tube(31, 4, 2, 0, 0, 108, { c: 'red', g: 1, n: 'Faixa (Tubo)' }),
            cone(18, 18, 10, 0, 0, 20, { c: 'dark', g: 2, top: 1.5, n: 'Bocal (Cone truncado)' }), cone(16, 16, 14, 0, 0, 6, { c: 'orange', g: 3, r: [180, 0, 0], n: 'Chama' }), cone(9, 9, 10, 0, 0, 6, { c: 'yellow', g: 3, r: [180, 0, 0], n: 'Chama' })];
          [70, 86, 102].forEach((z) => o.push(hcyl(8, 8, 10, 0, -14, 0, { r: [90, 0, 0], cz: z, n: 'Janela (furo)' }), cyl(8, 8, 1, 0, -12, 0, { c: 'sky', g: 4, r: [90, 0, 0], cz: z, n: 'Vidro' }), tube(11, 1.5, 1.6, 0, -15, 0, { c: 'silver', g: 4, r: [90, 0, 0], cz: z, n: 'Moldura (Tubo)' })));
          for (let k = 0; k < 3; k++) { const a = 90 + k * 120, r = (a * Math.PI) / 180; o.push(wedge(20, 3, 30, 24 * Math.cos(r), 24 * Math.sin(r), 22, { c: 'red', g: 5, r: [0, 0, a], n: 'Aleta (Cunha)' })); }
          [[-44, -6], [-44, 6], [-32, -6], [-32, 6]].forEach(([x, y]) => o.push(box(3, 3, 140, x, y, 6, { c: 'orange', g: 6, n: 'Coluna da torre' })));
          for (let i = 0; i < 7; i++) o.push(box(15, 15, 2, -38, 0, 20 + i * 20, { c: 'orange', g: 6, n: 'Travessa' }));
          o.push(box(22, 4, 4, -22, 0, 96, { c: 'gray', g: 6, n: 'Braço de serviço' }));
          return o;
        }
      },
      {
        id: 78, nome: 'Monstro criativo', diff: 4,
        obj: 'Criar um personagem original usando exagero, assimetria intencional e repetição de elementos (olhos, dentes, manchas).',
        desc: 'Um monstro fofo e original: corpo redondo com barriga de outra cor, três olhos de tamanhos diferentes (um sobre uma haste), boca larga recortada com fileira de dentes, dois chifres curvos, braços em tentáculo feitos de esferas decrescentes, pés curtos e manchas espalhadas.',
        req: ['Corpo principal arredondado com barriga destacada.', 'Pelo menos três olhos com tamanhos diferentes (assimetria intencional).', 'Boca recortada (furo) com dentes repetidos.', 'Chifres, braços em tentáculo e pés.', 'Manchas (Meias esferas) distribuídas.', 'Personagem original, sem copiar personagens existentes.'],
        formas: ['sphere', 'hemi', 'cone', 'pyr', 'cyl', 'boxh'], tools: ['furo', 'duplicar', 'rotacionar', 'agrupar', 'cor'],
        skills: ['Exagero e estilo', 'Assimetria intencional', 'Repetição decrescente'],
        dicas: [
          'Personagens memoráveis têm um traço exagerado. Escolha o seu (olhos? boca? chifres?) e deixe o resto mais simples.',
          'Esfera grande para o corpo, Meia esfera para a barriga, Esferas para olhos e tentáculos, Caixa furo arredondada para a boca, Pirâmides para os dentes, Cones girados para os chifres.',
          ['Corpo: Esfera 60 × 50 × 56. Barriga: Meia esfera achatada girada na frente.', 'Olhos: um grande (Ø 18), um médio (Ø 12) e um pequeno sobre uma haste (Cilindro + Esfera Ø 10). Pupilas pretas.', 'Boca: Caixa furo 30 × 12 × 8 na frente; dentes: Pirâmides brancas invertidas com Ctrl+D.', 'Chifres: Cones girados 30° para fora (espelhe).', 'Tentáculos: Esferas de 12, 10, 8 e 6 mm descendo em curva de cada lado. Pés: Meias esferas.', 'Manchas: Meias esferas achatadas de cor contrastante.']
        ],
        crit: ['Personagem original e expressivo.', 'Boca recortada com dentes regulares.', 'Assimetria proposital equilibrada.', 'Acabamento com manchas e cores.'],
        model: () => {
          const P = { c: 'purple' }, o = [sphere(60, 50, 56, 0, 0, 6, Object.assign({ n: 'Corpo' }, P)), hemi(36, 30, 8, 0, -21, 0, { c: 'pink', r: [90, 0, 0], cz: 28, n: 'Barriga' }),
            hbox(30, 14, 8, 0, -24, 38, { n: 'Boca (furo)' })].concat(eye(-12, -20, 50, 18, 1), eye(10, -21, 48, 12, 1), [cyl(3, 3, 16, 4, -4, 58, { c: 'purple', g: 1, n: 'Haste do olho' })], eye(4, -6, 78, 10, 1));
          for (let i = 0; i < 6; i++) o.push(pyr(4, 3, 4, -12.5 + i * 5, -20.5, 42, { c: 'white', g: 2, r: [180, 0, 0], n: 'Dente' }));
          [-1, 1].forEach((s) => {
            o.push(cone(8, 8, 18, s * 20, 0, 0, { c: 'yellow', g: 3, r: [0, s * 30, 0], cz: 66, n: 'Chifre (Cone)' }), hemi(14, 18, 6, s * 14, -2, 0, { c: 'purple', g: 3, n: 'Pé' }));
            [12, 10, 8, 6].forEach((d, i) => o.push(sp(d, s * (30 + i * 7), -4, 34 - i * 7 + i * i, { c: 'purple', g: 4, n: 'Tentáculo' })));
          });
          [[-24, 4, 46], [22, 10, 22], [18, 14, 50], [-20, 16, 20]].forEach(([x, y, z]) => o.push(sphere(10, 10, 4, x, y, z, { c: 'lime', g: 5, r: [0, x > 0 ? 70 : -70, 0], n: 'Mancha' })));
          return o;
        }
      },
      {
        id: 79, nome: 'Explorador com acessórios', diff: 5,
        obj: 'Vestir e equipar um personagem com vários acessórios funcionais, mantendo-os presos ao corpo e coerentes com a história do personagem.',
        desc: 'Um explorador estilizado pronto para a aventura: chapéu de abas largas com fita, cachecol, colete com bolsos, binóculo pendurado no peito, mochila grande com saco de dormir enrolado, cinto, botas, lanterna numa mão e mapa na outra.',
        req: ['Personagem base completo (pode partir da fase 73).', 'Chapéu com aba, copa e fita.', 'Pelo menos cinco acessórios: cachecol, binóculo, mochila com saco de dormir, cinto, lanterna e mapa.', 'Todos os acessórios encostados no corpo (nada flutuando).', 'Cores e acessórios que contam uma história.'],
        formas: ['sphere', 'cyl', 'box', 'torus', 'hemi', 'cone', 'tube'], tools: ['copiar', 'agrupar', 'alinhar', 'rotacionar', 'cor'],
        skills: ['Narrativa visual', 'Acessórios presos ao corpo', 'Reaproveitamento'],
        dicas: [
          'Cada acessório precisa de um ponto de contato: o chapéu na cabeça, a mochila nas costas, a lanterna na mão. Verifique de vários ângulos.',
          'Reaproveite o personagem da fase 73. Cilindros para chapéu, binóculo e saco de dormir; Toroides para cachecol, fita e alça da lanterna; Caixas para mapa, bolsos e mochila.',
          ['Copie o personagem da fase 73 e troque as cores (roupa de explorador).', 'Chapéu: Cilindro Ø 50 × 2 (aba) + Cilindro Ø 30 × 12 (copa) + Toroide como fita.', 'Cachecol: Toroide em volta do pescoço + Caixa pendurada. Binóculo: dois Cilindros deitados unidos, pendurados por uma alça fina.', 'Mochila: Caixa grande nas costas + saco de dormir (Cilindro deitado em X) por cima.', 'Lanterna: Cilindro + Tubo + alça de Toroide na mão; mapa: Caixa fina na outra mão.', 'Cinto: Tubo fino na cintura com fivela. Botas: Meias esferas + Cilindros.']
        ],
        crit: ['Acessórios completos e presos.', 'Coerência de tema e cores.', 'Personagem equilibrado.', 'Detalhamento cuidadoso.'],
        model: () => {
          const o = [];
          [-1, 1].forEach((s) => o.push(cyl(9, 9, 12, s * 6, 0, 3, { c: 'brown', n: 'Bota' }), hemi(11, 16, 7, s * 6, -3, 0, { c: 'brown', n: 'Bota' }), cyl(8, 8, 10, s * 6, 0, 13, { c: 'sand', n: 'Perna' }),
            bar(s * 13, 44, s * 19, 30, 0, 6, { c: 'sand', n: 'Braço' }), sp(8, s * 19.5, 0, 28, { c: 'skin', n: 'Mão' }), sp(6, s * 7, -15, 67, { c: 'black', g: 1, n: 'Olho' }), sp(8, s * 18, 0, 68, { c: 'skin', g: 1, n: 'Orelha' })));
          o.push(box(24, 14, 8, 0, 0, 22, { c: 'sand', n: 'Calça' }), cone(28, 18, 24, 0, 0, 30, { c: 'green', top: 0.7, n: 'Camisa' }), box(22, 4, 16, 0, -8, 34, { c: 'brown', g: 2, n: 'Colete' }), box(6, 2, 5, -6, -10.5, 40, { c: 'sand', g: 2, n: 'Bolso' }), box(6, 2, 5, 6, -10.5, 40, { c: 'sand', g: 2, n: 'Bolso' }),
            tube(26, 3, 2, 0, 0, 29, { c: 'dark', g: 2, n: 'Cinto (Tubo)' }), box(5, 2, 4, 0, -13.5, 28.5, { c: 'yellow', g: 2, n: 'Fivela' }),
            sp(36, 0, 0, 70, { c: 'skin', g: 1, n: 'Cabeça' }), sp(3, 0, -17.5, 62, { c: 'pink', g: 1, n: 'Nariz' }), torus(18, 4, 0, 0, 52, { c: 'red', g: 3, n: 'Cachecol (Toroide)' }), box(5, 2, 12, 5, -9, 40, { c: 'red', g: 3, n: 'Ponta do cachecol' }),
            cyl(50, 50, 2, 0, 0, 82, { c: 'wood', g: 4, n: 'Aba do chapéu' }), cyl(30, 30, 12, 0, 0, 83, { c: 'wood', g: 4, n: 'Copa do chapéu' }), tube(31, 3, 1.5, 0, 0, 84, { c: 'dark', g: 4, n: 'Fita (Tubo)' }),
            cyl(5, 5, 8, -3, -12, 0, { c: 'black', g: 5, r: [90, 0, 0], cz: 44, n: 'Binóculo' }), cyl(5, 5, 8, 3, -12, 0, { c: 'black', g: 5, r: [90, 0, 0], cz: 44, n: 'Binóculo' }),
            box(22, 12, 28, 0, 13, 26, { c: 'teal', g: 6, n: 'Mochila' }), cyl(10, 10, 26, 0, 13, 0, { c: 'orange', g: 6, r: [0, 90, 0], cz: 59, n: 'Saco de dormir' }),
            cyl(5, 5, 10, 20, -2, 16, { c: 'dark', g: 7, n: 'Lanterna' }), tube(7, 4, 1, 20, -2, 12, { c: 'yellow', g: 7, n: 'Vidro da lanterna' }), torus(8, 1.2, 20, -2, 0, { c: 'dark', g: 7, r: [90, 0, 0], cz: 29, n: 'Alça' }),
            box(2, 14, 10, -22, -6, 24, { c: 'cream', g: 8, r: [0, 0, 20], n: 'Mapa' }));
          return o;
        }
      },
      {
        id: 80, nome: 'Escultura geométrica autoral', diff: 5,
        obj: 'Desafio do módulo: criar uma escultura abstrata própria aplicando princípios de composição (equilíbrio, ritmo, contraste, proporção) só com formas básicas.',
        desc: 'Exemplo de escultura (a sua deve ser diferente): pedestal em dois níveis, uma coluna de cubos que giram progressivamente e diminuem, um anel inclinado orbitando a coluna, uma esfera equilibrada na ponta de um cone e seis pirâmides em ritmo radial na base.',
        req: ['Composição autoral (não copie a referência) com pelo menos 15 formas.', 'Ao menos três tipos diferentes de forma básica.', 'Um elemento de ritmo (repetição com variação, Ctrl+D).', 'Um elemento de contraste (tamanho, cor ou forma).', 'Equilíbrio visual: a peça parece estável.', 'Pedestal e título pensado por você (anote nas suas anotações da fase).'],
        formas: ['box', 'torus', 'cone', 'sphere', 'pyr', 'cyl'], tools: ['duplicar', 'rotacionar', 'alinhar', 'agrupar', 'cor'],
        skills: ['Composição', 'Autoria', 'Princípios visuais'],
        dicas: [
          'Defina uma ideia em uma frase (por exemplo: "crescimento", "órbita", "tensão") e escolha formas e movimentos que expressem essa ideia.',
          'Ctrl+D com rotação e redução gera ritmo; um Toroide inclinado cria movimento; uma Esfera sobre uma ponta cria tensão. Use Alinhar para o eixo principal.',
          ['Pedestal: Caixa 60 × 60 × 10 + Caixa 50 × 50 × 4.', 'Coluna: Caixa 24 × 24 × 12; Ctrl+D subindo 12 mm, girando 15° e reduzindo 2 mm (5 cubos).', 'Órbita: Toroide Ø 70 tubo 3 girado 25° em X em volta da coluna.', 'Ápice: Cone fino no topo e Esfera equilibrada na ponta.', 'Ritmo radial: Pirâmides pequenas em volta da coluna a cada 60°.', 'Escolha uma paleta de 2 a 3 cores e dê um título à obra.']
        ],
        crit: ['Originalidade da composição.', 'Uso consciente de ritmo e contraste.', 'Equilíbrio visual.', 'Execução precisa.'],
        model: () => {
          const o = [box(60, 60, 10, 0, 0, 0, { c: 'dark', n: 'Pedestal' }), box(50, 50, 4, 0, 0, 10, { c: 'white', n: 'Pedestal' })];
          for (let i = 0; i < 5; i++) { const s = 24 - i * 3; o.push(box(s, s, 12, 0, 0, 14 + i * 12, { c: i % 2 ? 'white' : 'navy', r: [0, 0, i * 15], n: 'Cubo girado' })); }
          o.push(torus(70, 3, 0, 0, 0, { c: 'orange', r: [25, 10, 0], cz: 50, n: 'Órbita (Toroide)' }), cone(10, 10, 20, 0, 0, 74, { c: 'navy', n: 'Ápice (Cone)' }), sp(10, 0, 0, 98, { c: 'orange', n: 'Esfera em equilíbrio' }));
          TM.S.ring(6, 19, 0, 0, (x, y) => pyr(6, 6, 8, x, y, 14, { c: 'orange', n: 'Pirâmide (ritmo)' }), 30).forEach((q) => o.push(q));
          return o;
        }
      }
    ]
  });
})();
