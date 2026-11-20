/* Módulo 10 — Desafios de especialista (fases 91–100) */
(function () {
  const { box, cyl, sphere, cone, torus, tube, poly, wedge, roof, rroof, hemi, pyr, hbox, hcyl, bar, barY, sp, wheel, tree } = TM.S;
  /* roda deitada em Y com raios */
  const spokedWheel = (x, y, cz, d, w, n, cor, g) => { const o = [torus(d, 3, x, y, 0, { c: cor, g, r: [90, 0, 0], cz, n: 'Aro' }), cyl(d * 0.22, d * 0.22, w, x, y, 0, { c: cor, g, r: [90, 0, 0], cz, n: 'Cubo' })]; for (let k = 0; k < n; k++) o.push(box(1.6, w * 0.6, d - 4, x, y, 0, { c: cor, g, r: [0, (180 / n) * k, 0], cz, n: 'Raio' })); return o; };
  const banda = (cx, cy, cz, R, n, w, g) => { const o = []; for (let k = 0; k < n; k++) { const a = (360 / n) * k, r = (a * Math.PI) / 180; o.push(box(6, w, 3.4, cx + R * Math.cos(r), cy, 0, { c: 'black', g, r: [0, 90 - a, 0], cz: cz + R * Math.sin(r), n: 'Garra' })); } return o; };
  /* elemento de vela de moinho: posição local (v lateral, u ao longo da vara) girada em torno do eixo Y */
  const rotY = (hx, hz, a, v, u) => { const r = (a * Math.PI) / 180; return [hx + u * Math.sin(r) + v * Math.cos(r), hz + u * Math.cos(r) - v * Math.sin(r)]; };

  TM.addModule({
    n: 10, cor: '#c9a227', titulo: 'Desafios de especialista',
    resumo: 'Projetos longos com dezenas de formas, planejamento de construção, precisão e autonomia. Termina no seu projeto autoral.',
    phases: [
      {
        id: 91, nome: 'Locomotiva a vapor', diff: 5,
        obj: 'Planejar e executar um modelo histórico complexo com dezenas de formas: caldeira, rodas raiadas, bielas, cabine e trilhos.',
        novo: { titulo: 'Plano de construção', texto: 'Nos projetos de especialista, escreva antes um plano: lista de subconjuntos, ordem de montagem, medidas principais e quais peças serão repetidas. Envie esse plano junto com o print: ele faz parte da avaliação.' },
        desc: 'Uma locomotiva a vapor sobre trilhos: chassi, caldeira cilíndrica com câmara de fumaça, chaminé com boca alargada, domo e areeiro, farol, sino, cabine com janelas e teto curvo, três pares de rodas motrizes raiadas ligadas por biela, rodas guia menores, limpa-trilhos em cunha e trilhos com dormentes.',
        req: ['Plano de construção escrito (subconjuntos e ordem) enviado com o print.', 'Caldeira, câmara de fumaça, chaminé, domo e farol alinhados no eixo.', 'Seis rodas motrizes raiadas iguais e duas rodas guia por lado.', 'Biela ligando as rodas motrizes.', 'Cabine com janelas recortadas e teto curvo.', 'Trilhos com dormentes repetidos (Ctrl+D).'],
        formas: ['cyl', 'cone', 'hemi', 'box', 'boxh', 'torus', 'wedge', 'rroof'], tools: ['duplicar', 'alinhar', 'espelhar', 'furo', 'agrupar', 'regua'],
        skills: ['Planejamento de projeto longo', 'Subconjuntos', 'Precisão acumulada'],
        dicas: [
          'Divida em: via (trilhos), chassi + rodas, caldeira, cabine, acessórios. Termine e agrupe cada parte antes de começar a próxima.',
          'Cilindros deitados em X (caldeira) e em Y (rodas); Toroide + Caixas girando para os raios; Cone com Raio superior maior para a boca da chaminé; Meias esferas para os domos; Cunha para o limpa-trilhos; Telhado redondo para o teto.',
          ['Via: dois trilhos (Caixas 160 × 3 × 3) sobre dormentes (Caixas 8 × 44 × 3, Ctrl+D a cada 14 mm).', 'Chassi: Caixa 110 × 30 × 8 a 14 mm. Rodas motrizes Ø 26 com 6 raios; Ctrl+D a cada 27 mm; espelhe em Y.', 'Caldeira: Cilindro 30 × 30 × 70 deitado em X; câmara de fumaça: Cilindro 32 × 32 × 12 escuro na frente; farol na ponta.', 'Chaminé: Cilindro 8 + Cone invertido alargado. Domo e areeiro: Meias esferas sobre a caldeira. Sino: Cone pequeno.', 'Cabine: Caixa 30 × 36 × 40 com janelas (Caixas furo) e teto de Telhado redondo.', 'Biela: Caixa fina ligando os pinos das rodas. Limpa-trilhos: Cunha na frente.']
        ],
        crit: ['Plano coerente com o modelo entregue.', 'Rodas e bielas regulares e alinhadas.', 'Caldeira, chaminé e cabine bem resolvidas.', 'Riqueza de detalhes e acabamento.'],
        model: () => {
          const o = [];
          [-14, 14].forEach((y) => o.push(box(170, 3, 3, 0, y, 3, { c: 'silver', g: 1, n: 'Trilho' })));
          for (let i = 0; i < 12; i++) o.push(box(8, 44, 3, -77 + i * 14, 0, 0, { c: 'brown', g: 1, n: 'Dormente' }));
          o.push(box(110, 26, 8, 0, 0, 16, { c: 'dark', n: 'Chassi' }), cyl(30, 30, 70, 14, 0, 0, { c: 'black', r: [0, 90, 0], cz: 39, n: 'Caldeira' }), cyl(32, 32, 12, 52, 0, 0, { c: 'dark', r: [0, 90, 0], cz: 39, n: 'Câmara de fumaça' }), cyl(10, 10, 3, 59, 0, 0, { c: 'yellow', r: [0, 90, 0], cz: 47, n: 'Farol' }),
            cyl(8, 8, 14, 48, 0, 53, { c: 'black', n: 'Chaminé' }), cone(14, 14, 8, 48, 0, 65, { c: 'black', top: 1.6, n: 'Boca da chaminé' }), hemi(14, 14, 8, 22, 0, 53, { c: 'copper', n: 'Domo' }), hemi(10, 10, 6, 4, 0, 53, { c: 'black', n: 'Areeiro' }), cone(6, 6, 6, 34, 0, 53.5, { c: 'yellow', n: 'Sino' }),
            box(30, 34, 40, -38, 0, 22, { c: 'red', g: 2, n: 'Cabine' }), hbox(12, 40, 12, -38, 0, 42, { g: 2, n: 'Janelas' }), rroof(34, 38, 8, -38, 0, 62, { c: 'black', g: 2, r: [0, 0, 90], n: 'Teto (Telhado redondo)' }),
            wedge(16, 30, 12, 64, 0, 4, { c: 'red', g: 3, r: [0, 0, 180], n: 'Limpa-trilhos (Cunha)' }), box(18, 30, 6, -58, 0, 18, { c: 'dark', g: 3, n: 'Engate' }));
          [-1, 1].forEach((s) => { [-26, 0, 26].forEach((x) => o.push(...spokedWheel(x, s * 17, 17, 28, 4, 6, 'red', 10))); o.push(...spokedWheel(48, s * 16, 10, 16, 3, 4, 'red', 11), box(58, 1.5, 3, 0, s * 20, 0, { c: 'silver', g: 12, cz: 12, n: 'Biela' })); });
          return o;
        }
      },
      {
        id: 92, nome: 'Castelo medieval', diff: 5,
        obj: 'Organizar uma construção grande e simétrica com centenas de repetições (ameias), torres, portão em arco e elementos de defesa.',
        desc: 'Um castelo cercado por fosso: quatro muralhas com ameias regulares, quatro torres redondas nos cantos com telhados cônicos e bandeiras, portão em arco com grade levadiça meio erguida e ponte levadiça abaixada, torre de menagem central com janelas e ameias.',
        req: ['Quatro muralhas formando um quadrado, com ameias regulares (Ctrl+D) em todas.', 'Quatro torres de canto iguais com telhado cônico e bandeira.', 'Portão em arco (furo composto) com grade levadiça de barras e ponte levadiça.', 'Torre de menagem central com janelas recortadas.', 'Fosso em volta (Tubo ou moldura).', 'Simetria geral do conjunto.'],
        formas: ['box', 'cyl', 'cone', 'boxh', 'cylh', 'tube'], tools: ['duplicar', 'espelhar', 'alinhar', 'furo', 'agrupar', 'regua'],
        skills: ['Repetição em larga escala', 'Simetria de quatro lados', 'Composição monumental'],
        dicas: [
          'Uma muralha completa (com ameias) pode ser girada 90°, 180° e 270° em torno do centro do castelo. Faça uma muito bem feita e gire cópias.',
          'Caixas para muralhas e ameias (Ctrl+D a cada 12 mm); Cilindros + Cones para as torres; Cilindro furo + Caixa furo para o arco; Caixas finas para a grade; Tubo azul para o fosso.',
          ['Base: Caixa 170 × 170 × 4 verde; fosso: Tubo Ø 200 parede 16 azul (ou moldura de Caixas).', 'Muralha: Caixa 120 × 8 × 40; ameia: Caixa 6 × 10 × 6 em cima; Ctrl+D a cada 12 mm. Agrupe e gire cópias em torno do centro.', 'Torres: Cilindro 28 × 28 × 60 nos cantos; telhado: Cone 32 × 32 × 26; bandeira: mastro + Caixa fina.', 'Portão: Cilindro furo Ø 24 deitado + Caixa furo abaixo, na muralha da frente. Grade: Caixas finas verticais e horizontais.', 'Ponte levadiça: Caixa 24 × 30 × 2 à frente do portão.', 'Menagem: Caixa 40 × 40 × 80 no centro com janelas (Caixas furo) e ameias.']
        ],
        crit: ['Ameias regulares em todas as muralhas.', 'Torres idênticas e simétricas.', 'Portão em arco bem resolvido.', 'Conjunto monumental e organizado.'],
        model: () => {
          const o = [box(170, 170, 4, 0, 0, 0, { c: 'green', g: 9, n: 'Terreno' }), tube(210, 3, 18, 0, 0, 0, { c: 'sky', g: 9, n: 'Fosso (Tubo)' }),
            box(120, 8, 40, 0, -60, 4, { c: 'silver', n: 'Muralha' }), hcyl(24, 24, 12, 0, -60, 0, { r: [90, 0, 0], cz: 24, n: 'Arco do portão' }), hbox(24, 12, 21, 0, -60, 3, { n: 'Vão do portão' }),
            box(120, 8, 40, 0, 60, 4, { c: 'silver', g: 1, n: 'Muralha' }), box(8, 120, 40, -60, 0, 4, { c: 'silver', g: 1, n: 'Muralha' }), box(8, 120, 40, 60, 0, 4, { c: 'silver', g: 1, n: 'Muralha' })];
          for (let i = 0; i < 9; i++) { const t = -48 + i * 12; o.push(box(6, 10, 6, t, -60, 44, { c: 'silver', g: 2, n: 'Ameia' }), box(6, 10, 6, t, 60, 44, { c: 'silver', g: 2, n: 'Ameia' }), box(10, 6, 6, -60, t, 44, { c: 'silver', g: 2, n: 'Ameia' }), box(10, 6, 6, 60, t, 44, { c: 'silver', g: 2, n: 'Ameia' })); }
          [[-60, -60], [60, -60], [-60, 60], [60, 60]].forEach(([x, y]) => o.push(cyl(28, 28, 60, x, y, 4, { c: 'gray', g: 3, n: 'Torre' }), cone(34, 34, 26, x, y, 64, { c: 'red', g: 3, n: 'Telhado (Cone)' }), cyl(1.5, 1.5, 14, x, y, 88, { c: 'dark', g: 3, n: 'Mastro' }), box(10, 1, 6, x + 5, y, 96, { c: 'yellow', g: 3, n: 'Bandeira' })));
          for (let i = 0; i < 5; i++) o.push(box(1.6, 2, 20, -8 + i * 4, -60, 16, { c: 'dark', g: 4, n: 'Grade levadiça' }));
          o.push(box(22, 2, 1.6, 0, -60, 22, { c: 'dark', g: 4, n: 'Grade levadiça' }), box(24, 30, 2, 0, -79, 3, { c: 'brown', g: 4, n: 'Ponte levadiça' }),
            box(40, 40, 80, 0, 10, 4, { c: 'gray', g: 5, n: 'Torre de menagem' }), hbox(6, 44, 12, -10, 10, 54, { g: 5, n: 'Janela' }), hbox(6, 44, 12, 10, 10, 54, { g: 5, n: 'Janela' }), hbox(44, 6, 12, 0, 10, 34, { g: 5, n: 'Janela' }));
          for (let i = 0; i < 4; i++) { const t = -15 + i * 10; o.push(box(5, 5, 6, t, -10, 84, { c: 'gray', g: 6, n: 'Ameia' }), box(5, 5, 6, t, 30, 84, { c: 'gray', g: 6, n: 'Ameia' }), box(5, 5, 6, -20, t + 10, 84, { c: 'gray', g: 6, n: 'Ameia' }), box(5, 5, 6, 20, t + 10, 84, { c: 'gray', g: 6, n: 'Ameia' })); }
          return o;
        }
      },
      {
        id: 93, nome: 'Farol na costa', diff: 5,
        obj: 'Construir uma torre cônica com faixas que acompanham a inclinação, galeria com guarda-corpo circular e lanterna envidraçada, num cenário costeiro.',
        desc: 'Um farol sobre rochas à beira-mar: torre em tronco de cone branca com duas faixas vermelhas que seguem a inclinação, porta e janelinhas, galeria com piso circular e guarda-corpo de balaústres, sala da lanterna envidraçada com montantes, lâmpada, cúpula vermelha com para-raios e casa do faroleiro ao lado.',
        req: ['Torre em Cone truncado com faixas que acompanham a conicidade (sem degraus visíveis).', 'Porta e janelas recortadas na torre.', 'Galeria com guarda-corpo de pelo menos 12 balaústres em círculo e corrimão (Toroide).', 'Lanterna de vidro com montantes, lâmpada e cúpula.', 'Rochas e casa do faroleiro.'],
        formas: ['cone', 'cyl', 'torus', 'hemi', 'box', 'boxh', 'sphere', 'roof'], tools: ['propriedades', 'duplicar', 'alinhar', 'furo', 'agrupar', 'regua'],
        skills: ['Faixas em superfície cônica', 'Repetição circular', 'Cenário'],
        dicas: [
          'Para uma faixa seguir a torre, ela precisa ser um pedaço de cone com a mesma inclinação, só um pouquinho maior. Calcule o raio da torre na altura de início e de fim da faixa.',
          'Cone truncado (Raio superior) para a torre e para cada faixa; Caixas furo para porta e janelas; Cilindros finos em círculo (Ctrl+D com rotação) e Toroide para o guarda-corpo; Cilindro azul claro para o vidro; Meia esfera para a cúpula.',
          ['Rochas: Esferas cinzentas de vários tamanhos achatadas. Torre: Cone Ø 40 × 100 com topo Ø 24.', 'Faixas: Cones truncados 0,8 mm mais largos que a torre, entre 30–45 mm e 65–80 mm de altura.', 'Porta e janelas: Caixas furo na base e em alturas diferentes.', 'Galeria: Cilindro Ø 36 × 3 no topo. Balaústre: Cilindro fino na borda; Ctrl+D girando 30° (12). Corrimão: Toroide Ø 34.', 'Lanterna: Cilindro azul claro Ø 20 × 16 com 6 montantes finos; lâmpada amarela dentro; cúpula: Meia esfera vermelha + Esfera + para-raios.', 'Casa: Caixa + Telhado ao lado da torre.']
        ],
        crit: ['Faixas acompanhando a conicidade.', 'Galeria e guarda-corpo regulares.', 'Lanterna detalhada.', 'Cenário completo.'],
        model: () => {
          const r = (z) => 20 - 8 * (z / 100), o = [];
          [[-10, 6, 26], [16, -8, 30], [6, 18, 22], [-18, -14, 20], [24, 14, 18]].forEach(([x, y, d]) => o.push(sphere(d, d, d * 0.55, x, y, 0, { c: 'gray', g: 9, n: 'Rocha' })));
          o.push(cone(40, 40, 100, 0, 0, 8, { c: 'white', top: 0.6, n: 'Torre (Cone truncado)' }), hbox(10, 10, 16, 0, -19, 8, { n: 'Porta' }), hbox(5, 30, 8, 0, 0, 52, { n: 'Janela' }), hbox(30, 5, 8, 0, 0, 82, { n: 'Janela' }));
          [[30, 45], [65, 80]].forEach(([a, b]) => o.push(cone(2 * r(a) + 1.6, 2 * r(a) + 1.6, b - a, 0, 0, 8 + a, { c: 'red', g: 1, top: (r(b) + 0.8) / (r(a) + 0.8), n: 'Faixa (Cone truncado)' })));
          o.push(cyl(38, 38, 3, 0, 0, 108, { c: 'dark', g: 2, n: 'Piso da galeria' }), torus(36, 1.6, 0, 0, 119, { c: 'dark', g: 2, n: 'Corrimão (Toroide)' }));
          TM.S.ring(12, 17.2, 0, 0, (x, y) => cyl(1.4, 1.4, 10, x, y, 111, { c: 'dark', g: 2, n: 'Balaústre' })).forEach((q) => o.push(q));
          o.push(cyl(20, 20, 16, 0, 0, 111, { c: 'glass', g: 3, n: 'Vidro da lanterna' }), sp(10, 0, 0, 119, { c: 'yellow', g: 3, n: 'Lâmpada' }), hemi(24, 24, 12, 0, 0, 127, { c: 'red', g: 3, n: 'Cúpula (Meia esfera)' }), sp(5, 0, 0, 140, { c: 'dark', g: 3, n: 'Esfera' }), cyl(1, 1, 10, 0, 0, 142, { c: 'dark', g: 3, n: 'Para-raios' }));
          TM.S.ring(6, 10, 0, 0, (x, y) => box(1.4, 1.4, 16, x, y, 111, { c: 'dark', g: 3, n: 'Montante' })).forEach((q) => o.push(q));
          o.push(box(34, 26, 22, 40, 14, 4, { c: 'cream', g: 4, n: 'Casa do faroleiro' }), roof(38, 30, 14, 40, 14, 26, { c: 'red', g: 4, n: 'Telhado' }), box(8, 1, 14, 40, 0.6, 4, { c: 'brown', g: 4, n: 'Porta da casa' }), box(70, 60, 4, 20, 4, 0, { c: 'sand', g: 9, n: 'Costa' }));
          return o;
        }
      },
      {
        id: 94, nome: 'Guitarra elétrica', diff: 5,
        obj: 'Modelar um instrumento com medidas proporcionais reais, incluindo trastes com espaçamento decrescente, captadores, cordas e tarraxas.',
        desc: 'Uma guitarra elétrica deitada: corpo com duas curvas (Cilindros sobrepostos) e recortes de acesso, escudo, braço com escala escura, 12 trastes cada vez mais próximos, marcações, mão com 6 tarraxas, dois captadores com polos, ponte, três botões, saída de cabo e seis cordas.',
        req: ['Corpo com curvas formadas por Cilindros e recortes com Cilindro furo.', 'Braço e escala com 12 trastes cujo espaçamento diminui (cerca de 5,6% a cada traste).', 'Dois captadores com seis polos cada.', 'Ponte, três botões e mão com seis tarraxas.', 'Seis cordas paralelas da ponte até a pestana.'],
        formas: ['cyl', 'cylh', 'box', 'sphere'], tools: ['duplicar', 'regua', 'alinhar', 'furo', 'agrupar', 'grade'],
        skills: ['Proporção de instrumento', 'Série com razão constante', 'Peças finas e longas'],
        dicas: [
          'Em instrumentos reais, a distância de cada traste à ponte é a do anterior × 0,944. Com a Régua, posicione cada traste em vez de usar Ctrl+D com passo fixo.',
          'Cilindros (corpo, botões, polos), Cilindros furo (recortes), Caixas (braço, escala, trastes, captadores, ponte, mão), Cilindros finos deitados para as cordas.',
          ['Corpo: Cilindro Ø 70 × 10 e Cilindro Ø 56 × 10 sobrepostos + Caixa unindo; recortes com Cilindros furo Ø 26 nos dois "chifres".', 'Braço: Caixa 120 × 14 × 6 saindo do corpo; escala escura por cima; mão: Caixa 34 × 22 × 4 na ponta.', 'Trastes: Caixas 0,8 × 14 × 1. Distâncias à pestana: 0; 6,7; 13; 18,9; ... (cada vão = anterior × 0,944).', 'Captadores: Caixas 18 × 8 × 2 com 6 Cilindros Ø 1,6 (Ctrl+D a cada 2,6 mm). Ponte e botões.', 'Tarraxas: 3 Cilindros de cada lado da mão (espelhe).', 'Cordas: seis Cilindros Ø 0,6 deitados em X, a 2 mm um do outro, da ponte à pestana.']
        ],
        crit: ['Trastes com espaçamento decrescente.', 'Corpo com curvas e recortes.', 'Componentes eletrônicos e tarraxas completos.', 'Cordas paralelas e bem presas.'],
        model: () => {
          const o = [cyl(70, 70, 10, 0, 0, 0, { c: 'red', n: 'Corpo inferior' }), cyl(56, 56, 10, 38, 0, 0, { c: 'red', n: 'Corpo superior' }), box(30, 56, 10, 20, 0, 0, { c: 'red', n: 'União do corpo' }),
            hcyl(26, 26, 14, 60, -26, -2, { n: 'Recorte' }), hcyl(26, 26, 14, 62, 27, -2, { n: 'Recorte' }), box(44, 30, 0.8, 18, 12, 10, { c: 'white', g: 1, n: 'Escudo' }),
            box(130, 14, 6, 112, 0, 4, { c: 'wood', g: 2, n: 'Braço' }), box(124, 14, 1.4, 115, 0, 10, { c: 'brown', g: 2, n: 'Escala' }), box(34, 22, 4, 192, 0, 4, { c: 'red', g: 2, n: 'Mão' }), box(1.6, 14, 2, 176.5, 0, 10, { c: 'white', g: 2, n: 'Pestana' })];
          let x = 176.5, L = 126; for (let i = 0; i < 12; i++) { const d = L * 0.0561; x -= d; L -= d; o.push(box(0.8, 14, 1, x, 0, 11.4, { c: 'silver', g: 3, n: 'Traste' })); if ([2, 4, 6, 8].includes(i)) o.push(sp(2, x + d / 2, 0, 12.2, { c: 'white', g: 3, n: 'Marcação' })); }
          [[22, 'Captador'], [50, 'Captador']].forEach(([px, n]) => { o.push(box(8, 18, 2, px, 0, 10, { c: 'black', g: 4, n })); for (let k = 0; k < 6; k++) o.push(cyl(1.6, 1.6, 1, px, -6.5 + k * 2.6, 12, { c: 'silver', g: 4, n: 'Polo' })); });
          o.push(box(8, 16, 3, 6, 0, 10, { c: 'silver', g: 4, n: 'Ponte' }));
          [[-14, 20], [-10, 28], [-2, 26]].forEach(([y, xx]) => o.push(cyl(6, 6, 4, xx - 30, y - 10, 10, { c: 'black', g: 4, n: 'Botão' })));
          [-1, 1].forEach((s) => [0, 1, 2].forEach((k) => o.push(cyl(3, 3, 6, 182 + k * 9, s * 12, 0, { c: 'silver', g: 5, r: [90, 0, 0], cz: 7, n: 'Tarraxa' }), sp(4, 182 + k * 9, s * 15.5, 7, { c: 'white', g: 5, n: 'Botão da tarraxa' }))));
          for (let k = 0; k < 6; k++) o.push(cyl(0.6, 0.6, 172, 92, -5 + k * 2, 0, { c: 'silver', g: 6, r: [0, 90, 0], cz: 12.5, n: 'Corda' }));
          return o;
        }
      },
      {
        id: 95, nome: 'Máquina de café espresso', diff: 5,
        obj: 'Projetar um eletrodoméstico com componentes funcionais: grupo, porta-filtro, vaporizador, manômetro, bandeja com grade e reservatório.',
        desc: 'Uma cafeteira espresso de bancada: corpo em aço com laterais escuras, aquecedor de xícaras com grade no topo, grupo de extração, porta-filtro com cabo, bicos, bandeja de gotejamento com grade de furos, vaporizador articulado, manômetro com ponteiro, botões, reservatório de água transparente atrás e duas xícaras.',
        req: ['Corpo com laterais e aquecedor de xícaras com grade no topo.', 'Grupo e porta-filtro com cabo inclinado e dois bicos.', 'Bandeja de gotejamento com grade de pelo menos 15 furos (Ctrl+D em duas direções).', 'Manômetro (Cilindro + Toroide) com ponteiro.', 'Vaporizador com tubo inclinado e manopla.', 'Reservatório transparente e duas xícaras com alça.'],
        formas: ['box', 'boxh', 'cyl', 'cylh', 'torus', 'tube', 'cone'], tools: ['duplicar', 'furo', 'alinhar', 'agrupar', 'rotacionar', 'regua'],
        skills: ['Eletrodoméstico', 'Componentes funcionais', 'Acabamento de produto'],
        dicas: [
          'Liste o caminho da água: reservatório → caldeira → grupo → porta-filtro → bicos → xícara → bandeja. Cada etapa vira um componente.',
          'Caixas para corpo, laterais e bandeja; Caixas furo/Cilindros furo para grades; Cilindros para grupo, porta-filtro e manômetro; Toroide para a moldura do manômetro e as alças; Tubo para as xícaras; Cilindros girados para o vaporizador.',
          ['Corpo: Caixa 80 × 60 × 90 prateada com laterais escuras (Caixas finas).', 'Aquecedor: Caixa furo rasa no topo com grade de barras.', 'Grupo: Cilindro Ø 26 × 10 sob a frente. Porta-filtro: Cilindro Ø 22 × 8 + cabo (Caixa girada) + 2 bicos (Cilindros).', 'Bandeja: Caixa 70 × 30 × 8 com Cilindros furo Ø 3 em grade (5 × 3).', 'Manômetro: Cilindro deitado Ø 18 + Toroide + ponteiro (Caixa fina girada). Vaporizador: tubo girado + manopla.', 'Reservatório: Caixa azul clara atrás. Xícaras: Tubo + fundo + Toroide de alça.']
        ],
        crit: ['Componentes funcionais completos.', 'Grades regulares.', 'Detalhes de produto bem alinhados.', 'Proporções de eletrodoméstico real.'],
        model: () => {
          const o = [box(80, 60, 90, 0, 0, 10, { c: 'silver', n: 'Corpo' }), box(80, 70, 10, 0, -5, 0, { c: 'dark', n: 'Base' }), box(2, 60, 90, -41, 0, 10, { c: 'dark', g: 1, n: 'Lateral' }), box(2, 60, 90, 41, 0, 10, { c: 'dark', g: 1, n: 'Lateral' }),
            hbox(70, 50, 3, 0, 0, 98, { n: 'Aquecedor de xícaras' })];
          for (let i = 0; i < 8; i++) o.push(box(70, 1.6, 2, 0, -21 + i * 6, 97, { c: 'silver', g: 2, n: 'Grade do aquecedor' }));
          o.push(cyl(26, 26, 10, 0, -38, 52, { c: 'silver', g: 3, n: 'Grupo' }), box(8, 10, 40, 0, -32, 62, { c: 'silver', g: 3, n: 'Suporte do grupo' }), cyl(22, 22, 8, 0, -38, 44, { c: 'dark', g: 3, n: 'Porta-filtro' }), bar(10, 47, 34, 40, -38, 5, { c: 'black', g: 3, n: 'Cabo' }, 'box'),
            cyl(2.4, 2.4, 6, -4, -38, 38, { c: 'silver', g: 3, n: 'Bico' }), cyl(2.4, 2.4, 6, 4, -38, 38, { c: 'silver', g: 3, n: 'Bico' }),
            box(70, 30, 8, 0, -42, 10, { c: 'dark', g: 4, n: 'Bandeja' }));
          for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) o.push(hcyl(3, 3, 4, -24 + i * 12, -50 + j * 8, 15, { g: 4, n: 'Furo da grade' }));
          o.push(cyl(18, 18, 3, 24, -31, 0, { c: 'white', g: 5, r: [90, 0, 0], cz: 80, n: 'Manômetro' }), torus(20, 2, 24, -32.5, 0, { c: 'silver', g: 5, r: [90, 0, 0], cz: 80, n: 'Moldura (Toroide)' }), box(1, 1, 7, 26, -33, 0, { c: 'red', g: 5, r: [0, 40, 0], cz: 82, n: 'Ponteiro' }),
            cyl(4, 4, 6, -30, -32, 0, { c: 'silver', g: 6, r: [90, 0, 0], cz: 74, n: 'Base do vaporizador' }), bar(-30, 74, -36, 36, -36, 3, { c: 'silver', g: 6, n: 'Vaporizador' }), cyl(8, 8, 6, -30, -32, 82, { c: 'black', g: 6, n: 'Manopla' }));
          [-12, 0, 12].forEach((x, i) => o.push(cyl(6, 6, 3, x - 2, -31, 0, { c: i ? 'black' : 'lime', g: 7, r: [90, 0, 0], cz: 92, n: 'Botão' })));
          o.push(box(60, 20, 70, 0, 38, 20, { c: 'glass', g: 8, n: 'Reservatório' }));
          [[-10, 'white'], [10, 'red']].forEach(([x, c]) => o.push(tube(12, 10, 1.4, x, -45, 18, { c, g: 9, n: 'Xícara (Tubo)' }), cyl(12, 12, 1, x, -45, 18, { c, g: 9, n: 'Fundo' }), torus(7, 1.6, x + 7, -45, 0, { c, g: 9, r: [90, 0, 0], cz: 23, n: 'Alça' })));
          return o;
        }
      },
      {
        id: 96, nome: 'Moinho de vento', diff: 5,
        obj: 'Montar um moinho com torre octogonal cônica, galeria e quatro velas treliçadas giradas em torno de um eixo inclinado.',
        desc: 'Um moinho de vento tradicional: base de pedra, torre de oito lados afinando para cima, porta e janelas, galeria (varanda) octogonal com guarda-corpo, capota arredondada, eixo saindo da frente e quatro velas em cruz, cada uma com vara, moldura treliçada e lona, giradas 15° em relação à vertical.',
        req: ['Torre de 8 lados afinando para cima (Cone com 8 lados ou Pirâmide de 8 lados truncada).', 'Galeria octogonal com guarda-corpo.', 'Capota e eixo das velas.', 'Quatro velas iguais a 90° entre si, cada uma com vara, moldura e lona.', 'Velas giradas juntas 15° (cruz inclinada).', 'Porta, janelas e base de pedra.'],
        formas: ['cone', 'poly', 'hemi', 'cyl', 'box', 'boxh'], tools: ['propriedades', 'duplicar', 'rotacionar', 'alinhar', 'agrupar', 'furo'],
        skills: ['Formas octogonais', 'Rotação de conjuntos', 'Treliça'],
        dicas: [
          'Monte uma vela completa apontando para cima, com o pé exatamente no centro do eixo. Agrupe-a com um ajudante simétrico para girar em torno do eixo e use Ctrl+D com 90°.',
          'Cone com Lados = 8 e Raio superior para a torre; Polígono 8 lados para a galeria; Meia esfera para a capota; Caixas finas para varas, molduras e lonas.',
          ['Base: Cilindro Ø 70 × 8 cinza. Torre: Cone 8 lados Ø 60 × 90, topo Ø 38.', 'Galeria: Polígono 8 lados Ø 74 × 3 a 30 mm; guarda-corpo: Caixas finas em volta.', 'Capota: Meia esfera 44 × 44 × 24 no topo. Eixo: Cilindro deitado em Y saindo da frente.', 'Vela: vara (Caixa 3 × 2 × 70), lona (Caixa 16 × 1 × 50) ao lado e travessas finas. Agrupe.', 'Gire a vela 15°, Ctrl+D girando 90° em Y em torno do eixo, 3 vezes.', 'Porta e janelas com Caixas furo e moldura.']
        ],
        crit: ['Torre octogonal cônica.', 'Velas iguais, a 90° e inclinadas juntas.', 'Galeria e capota bem resolvidas.', 'Detalhes de treliça.'],
        model: () => {
          const o = [cyl(70, 70, 8, 0, 0, 0, { c: 'gray', n: 'Base de pedra' }), cone(60, 60, 90, 0, 0, 8, { c: 'cream', sides: 8, top: 0.63, n: 'Torre (Cone 8 lados)' }), hbox(12, 20, 20, 0, -28, 8, { n: 'Porta' }), hbox(8, 20, 10, 0, -22, 62, { n: 'Janela' }),
            poly(76, 76, 3, 0, 0, 34, { c: 'brown', g: 1, sides: 8, n: 'Galeria (Polígono)' })];
          TM.S.ring(16, 36, 0, 0, (x, y) => cyl(1.2, 1.2, 8, x, y, 37, { c: 'brown', g: 1, n: 'Guarda-corpo' })).forEach((q) => o.push(q));
          o.push(torus(74, 1.4, 0, 0, 44, { c: 'brown', g: 1, n: 'Corrimão' }), hemi(44, 44, 24, 0, 0, 97, { c: 'dark', g: 2, n: 'Capota (Meia esfera)' }), cyl(8, 8, 26, 0, -26, 0, { c: 'brown', g: 2, r: [90, 0, 0], cz: 106, n: 'Eixo' }), sp(10, 0, -40, 106, { c: 'dark', g: 2, n: 'Cubo' }));
          const H = [0, 106];
          [15, 105, 195, 285].forEach((a) => {
            const [sx, sz] = rotY(H[0], H[1], a, 0, 38); o.push(box(3, 2, 72, sx, -42, 0, { c: 'brown', g: 3, r: [0, a, 0], cz: sz, n: 'Vara da vela' }));
            const [lx, lz] = rotY(H[0], H[1], a, 9, 44); o.push(box(15, 1, 50, lx, -43, 0, { c: 'white', g: 3, r: [0, a, 0], cz: lz, n: 'Lona' }));
            [24, 40, 56, 70].forEach((u) => { const [tx, tz] = rotY(H[0], H[1], a, 8, u); o.push(box(18, 1.4, 1.4, tx, -44, 0, { c: 'brown', g: 3, r: [0, a, 0], cz: tz, n: 'Travessa' })); });
          });
          return o;
        }
      },
      {
        id: 97, nome: 'Estação espacial', diff: 5,
        obj: 'Integrar módulos, treliça, painéis solares repetidos e um anel habitacional, mantendo um eixo de simetria e encaixes coerentes entre módulos.',
        desc: 'Uma estação espacial orbital: nó central esférico, módulos habitacionais cilíndricos nos dois lados com portas de acoplamento, treliça longa transversal com travessas repetidas, quatro conjuntos de painéis solares com divisões, radiadores, um anel habitacional ligado por quatro raios e uma nave acoplada.',
        req: ['Nó central e módulos cilíndricos alinhados num eixo.', 'Treliça com travessas repetidas (Ctrl+D).', 'Quatro painéis solares iguais com divisões (frisos).', 'Anel habitacional (Toroide) ligado por quatro raios.', 'Portas de acoplamento (Tubos) e uma nave acoplada.', 'Simetria em relação ao centro.'],
        formas: ['sphere', 'cyl', 'tube', 'box', 'boxh', 'torus', 'cone'], tools: ['duplicar', 'espelhar', 'alinhar', 'agrupar', 'furo', 'rotacionar'],
        skills: ['Arquitetura modular', 'Grandes repetições', 'Simetria espacial'],
        dicas: [
          'Uma estação é um sistema modular: todos os módulos se conectam por portas iguais, no mesmo diâmetro. Defina a porta padrão primeiro.',
          'Esfera e Cilindros deitados para nó e módulos; Tubos para as portas; Caixas para treliça e painéis (Caixas furo rasas para as divisões); Toroide + Cilindros para o anel.',
          ['Nó: Esfera Ø 30 a 40 mm do plano (a estação "flutua" sobre um suporte de exposição).', 'Módulos: Cilindros Ø 20 × 50 deitados em X dos dois lados; portas: Tubos Ø 14 nas pontas.', 'Treliça: Caixa 8 × 200 × 8 em Y + travessas a cada 16 mm.', 'Painel: Caixa 60 × 24 × 1 com frisos; quatro painéis nas pontas da treliça (espelhe).', 'Anel: Toroide Ø 120 tubo 8 em volta do eixo X, com quatro raios (Cilindros).', 'Nave: Cilindro + Cone acoplados numa porta. Suporte: Cilindro fino + base.']
        ],
        crit: ['Eixo e simetria claros.', 'Painéis iguais e repetições regulares.', 'Anel bem ligado ao centro.', 'Encaixes coerentes entre módulos.'],
        model: () => {
          const Z = 70, o = [cyl(50, 50, 4, 0, 0, 0, { c: 'dark', g: 9, n: 'Base de exposição' }), cyl(3, 3, 52, 0, 0, 4, { c: 'dark', g: 9, n: 'Haste' }), sp(30, 0, 0, Z, { c: 'white', n: 'Nó central' })];
          [-1, 1].forEach((s) => o.push(cyl(20, 20, 50, s * 40, 0, 0, { c: 'white', r: [0, 90, 0], cz: Z, n: 'Módulo habitacional' }), tube(14, 6, 2, s * 68, 0, 0, { c: 'silver', r: [0, 90, 0], cz: Z, n: 'Porta de acoplamento (Tubo)' })));
          o.push(box(8, 200, 8, 0, 0, Z + 14, { c: 'silver', g: 1, n: 'Treliça' }));
          for (let i = 0; i < 13; i++) o.push(box(16, 2, 2, 0, -96 + i * 16, Z + 17, { c: 'silver', g: 1, n: 'Travessa' }));
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { const x = sx * 38, y = sy * 86; o.push(box(60, 24, 1, x, y, Z + 17.5, { c: 'navy', g: 2, n: 'Painel solar' })); for (let k = 1; k < 6; k++) o.push(hbox(0.8, 24, 2, x - 30 + k * 10, y, Z + 17, { g: 2, n: 'Divisão' })); });
          o.push(torus(120, 8, 0, 0, 0, { c: 'white', g: 3, r: [0, 90, 0], cz: Z, n: 'Anel habitacional (Toroide)' }));
          [0, 90, 180, 270].forEach((a) => { const r = (a * Math.PI) / 180; o.push(cyl(4, 4, 46, 0, 33 * Math.cos(r), 0, { c: 'silver', g: 3, r: [a + 90, 0, 0], cz: Z + 33 * Math.sin(r), n: 'Raio do anel' })); });
          o.push(box(30, 12, 2, 0, 0, Z + 22, { c: 'white', g: 4, n: 'Radiador' }), cyl(12, 12, 24, 86, 0, 0, { c: 'silver', g: 5, r: [0, 90, 0], cz: Z, n: 'Nave acoplada' }), cone(12, 12, 14, 105, 0, 0, { c: 'red', g: 5, r: [0, 90, 0], cz: Z, n: 'Nariz da nave' }));
          return o;
        }
      },
      {
        id: 98, nome: 'Trator agrícola', diff: 5,
        obj: 'Construir uma máquina com rodas de tamanhos muito diferentes, bandas de rodagem em chevron, cabine envidraçada e implementos traseiros.',
        desc: 'Um trator agrícola: rodas traseiras grandes e dianteiras pequenas, ambas com garras na banda de rodagem, capô longo com grade e escapamento vertical, cabine com estrutura de colunas, vidros e teto, banco e volante, para-lamas sobre as rodas traseiras, contrapesos na frente, faróis e engate de três pontos atrás.',
        req: ['Rodas traseiras (Ø 60) e dianteiras (Ø 32) com garras em repetição circular.', 'Capô com grade, escapamento e faróis.', 'Cabine com quatro colunas, vidros, teto, banco e volante.', 'Para-lamas sobre as rodas traseiras (Telhado redondo).', 'Contrapesos dianteiros repetidos e engate de três pontos.'],
        formas: ['cyl', 'box', 'rroof', 'torus', 'boxh'], tools: ['duplicar', 'rotacionar', 'espelhar', 'alinhar', 'agrupar', 'furo'],
        skills: ['Máquina agrícola', 'Escalas diferentes de roda', 'Cabine estrutural'],
        dicas: [
          'As rodas traseiras grandes definem a altura da cabine. Monte as quatro rodas e o chassi primeiro; o resto se apoia neles.',
          'Cilindros deitados em Y para rodas, com garras (Ctrl+D girando); Caixas para capô, cabine e contrapesos; Telhado redondo para os para-lamas; Toroide para o volante.',
          ['Rodas traseiras: Ø 60 × 18 com 16 garras; dianteiras: Ø 32 × 10 com 12 garras. Espelhe em Y.', 'Chassi: Caixa 90 × 24 × 14. Capô: Caixa 50 × 22 × 22 na frente com grade (frisos) e faróis.', 'Escapamento: Cilindro vertical no capô.', 'Cabine: quatro colunas (Cilindros), teto (Caixa), vidros (Caixas azul claro); banco e volante (Toroide inclinado).', 'Para-lamas: Telhado redondo sobre cada roda traseira.', 'Contrapesos: Caixas empilhadas na frente (Ctrl+D). Engate: três barras atrás.']
        ],
        crit: ['Rodas e garras regulares.', 'Cabine estrutural completa.', 'Implementos e detalhes.', 'Proporção de trator real.'],
        model: () => {
          const o = [box(90, 24, 14, 10, 0, 22, { c: 'green', n: 'Chassi' }), box(50, 22, 22, 36, 0, 30, { c: 'green', n: 'Capô' }), box(1.5, 18, 16, 61.5, 0, 33, { c: 'dark', g: 1, n: 'Grade' }), cyl(6, 6, 2, 61, -8, 0, { c: 'yellow', g: 1, r: [0, 90, 0], cz: 48, n: 'Farol' }), cyl(6, 6, 2, 61, 8, 0, { c: 'yellow', g: 1, r: [0, 90, 0], cz: 48, n: 'Farol' }),
            cyl(4, 4, 30, 44, -6, 52, { c: 'dark', g: 1, n: 'Escapamento' })];
          [-1, 1].forEach((s) => {
            o.push(...wheel(-18, s * 26, 30, 60, 18, 10, 'yellow'), ...banda(-18, s * 26, 30, 30, 16, 18, 10), ...wheel(50, s * 22, 16, 32, 10, 11, 'yellow'), ...banda(50, s * 22, 16, 16, 12, 10, 11),
              rroof(46, 22, 12, -18, s * 26, 58, { c: 'green', g: 12, n: 'Para-lama (Telhado redondo)' }));
            [-36, 4].forEach((x) => o.push(cyl(3, 3, 52, x, s * 15, 36, { c: 'dark', g: 13, n: 'Coluna da cabine' })));
          });
          o.push(box(46, 36, 3, -16, 0, 88, { c: 'green', g: 13, n: 'Teto' }), box(1, 30, 40, 4, 0, 46, { c: 'glass', g: 13, n: 'Vidro frontal' }), box(36, 1, 30, -16, -15, 56, { c: 'glass', g: 13, n: 'Vidro lateral' }), box(36, 1, 30, -16, 15, 56, { c: 'glass', g: 13, n: 'Vidro lateral' }),
            box(14, 14, 3, -22, 0, 40, { c: 'black', g: 14, n: 'Banco' }), box(3, 14, 14, -29, 0, 43, { c: 'black', g: 14, n: 'Encosto' }), torus(12, 1.6, -6, 0, 0, { c: 'black', g: 14, r: [0, -50, 0], cz: 58, n: 'Volante (Toroide)' }), bar(-6, 58, 2, 44, 0, 2, { c: 'black', g: 14, n: 'Coluna do volante' }));
          for (let i = 0; i < 4; i++) o.push(box(6, 30, 12, 64 + i * 6.5, 0, 24, { c: 'dark', g: 15, n: 'Contrapeso' }));
          o.push(bar(-34, 30, -54, 22, -8, 3, { c: 'dark', g: 16, n: 'Braço do engate' }, 'box'), bar(-34, 30, -54, 22, 8, 3, { c: 'dark', g: 16, n: 'Braço do engate' }, 'box'), bar(-34, 44, -54, 32, 0, 3, { c: 'dark', g: 16, n: 'Terceiro ponto' }, 'box'));
          return o;
        }
      },
      {
        id: 99, nome: 'Quarteirão urbano', diff: 5,
        obj: 'Planejar uma cena urbana completa: ruas, calçadas, edifícios variados, mobiliário urbano, sinalização e veículos, com escala única e muitos elementos repetidos.',
        desc: 'Um quarteirão visto do alto: ruas em volta com faixas de pedestre nas esquinas, calçada com meio-fio, três edifícios de alturas e estilos diferentes com janelas, uma pracinha com árvores e banco, postes de luz, semáforo, carros nas ruas e faixas centrais tracejadas.',
        req: ['Ruas, calçada elevada e faixas de pedestre (Ctrl+D) nas esquinas.', 'Pelo menos três edifícios diferentes com janelas repetidas.', 'Praça com árvores e banco.', 'Postes de luz e um semáforo com três luzes.', 'Pelo menos três carros na mesma escala.', 'Faixa central tracejada nas ruas.'],
        formas: ['box', 'boxh', 'cyl', 'sphere', 'roof'], tools: ['duplicar', 'copiar', 'alinhar', 'agrupar', 'regua', 'ocultar'],
        skills: ['Planejamento urbano', 'Reaproveitamento em escala', 'Cenas com centenas de peças'],
        dicas: [
          'Escolha uma escala (por exemplo 1:200: 1 m = 5 mm) e defina antes: largura da rua, da calçada, altura do andar. Tudo depois segue essas medidas.',
          'Caixas para ruas, calçada, prédios e faixas (Ctrl+D); Caixas furo para janelas; Cilindros e Esferas para postes, semáforo e árvores; carros simplificados copiados.',
          ['Asfalto: Caixa 240 × 240 × 2. Calçada: Caixa 160 × 160 × 4 no centro.', 'Faixas de pedestre: Caixas 3 × 14 × 0,6 brancas com Ctrl+D a cada 6 mm nas esquinas. Faixa central: Caixas 10 × 1,4 com Ctrl+D a cada 20 mm.', 'Edifícios: três Caixas de alturas diferentes, cada uma com grade de janelas (Caixas furo, Ctrl+D); um com telhado.', 'Praça: piso diferente, árvores (Cilindro + Esfera) e banco.', 'Postes: Cilindro fino + braço + Esfera. Semáforo: poste + Caixa + 3 Cilindros coloridos.', 'Carros: Caixa + cabine + rodas (simples), copiados com cores diferentes.']
        ],
        crit: ['Escala única e coerente.', 'Elementos urbanos completos.', 'Repetições regulares (faixas, janelas).', 'Organização e legibilidade da cena.'],
        model: () => {
          const o = [box(240, 240, 2, 0, 0, 0, { c: 'dark', g: 9, n: 'Asfalto' }), box(160, 160, 4, 0, 0, 2, { c: 'silver', g: 9, n: 'Calçada' })];
          [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => { for (let i = 0; i < 5; i++) o.push(box(3, 14, 0.6, sx * 70 + (i - 2) * 6 * -sx, sy * 100, 2, { c: 'white', g: 8, n: 'Faixa de pedestre' })); });
          for (let i = 0; i < 11; i++) { const t = -100 + i * 20; o.push(box(10, 1.4, 0.4, t, -100, 2, { c: 'yellow', g: 8, n: 'Faixa central' }), box(1.4, 10, 0.4, 100, t, 2, { c: 'yellow', g: 8, n: 'Faixa central' })); }
          const bld = (x, y, w, d, h, c, g) => { const q = [box(w, d, h, x, y, 6, { c, g, n: 'Edifício' })]; for (let f = 0; f < Math.floor((h - 8) / 12); f++) for (let k = 0; k < Math.floor((w - 6) / 10); k++) q.push(hbox(5, 4, 7, x - w / 2 + 8 + k * 10, y - d / 2, 12 + f * 12, { g, n: 'Janela' })); return q; };
          o.push(...bld(-40, 40, 60, 50, 110, 'cream', 1), ...bld(40, 40, 50, 50, 70, 'sky', 2), ...bld(-40, -38, 56, 46, 48, 'pink', 3), roof(56, 46, 16, -40, -38, 54, { c: 'red', g: 3, n: 'Telhado' }));
          o.push(box(56, 56, 1, 40, -38, 6, { c: 'green', g: 4, n: 'Praça' }), ...tree(28, -26, 7, 1, 4), ...tree(54, -48, 7, 1, 4), ...tree(30, -54, 7, 0.9, 4), box(20, 6, 2, 46, -22, 12, { c: 'wood', g: 4, n: 'Banco' }), box(20, 1.5, 6, 46, -19, 14, { c: 'wood', g: 4, n: 'Encosto' }));
          [[-76, -76], [76, 76], [-76, 76], [76, -76]].forEach(([x, y]) => o.push(cyl(2, 2, 40, x, y, 6, { c: 'dark', g: 5, n: 'Poste' }), box(10, 2, 2, x + (x > 0 ? 5 : -5) * -1, y, 44, { c: 'dark', g: 5, n: 'Braço do poste' }), sp(5, x + (x > 0 ? -9 : 9), y, 42, { c: 'yellow', g: 5, n: 'Luminária' })));
          o.push(cyl(2, 2, 30, 78, -88, 2, { c: 'dark', g: 6, n: 'Poste do semáforo' }), box(6, 6, 18, 78, -88, 30, { c: 'black', g: 6, n: 'Semáforo' }));
          ['red', 'yellow', 'lime'].forEach((c, i) => o.push(cyl(4, 4, 1, 78, -91.3, 0, { c, g: 6, r: [90, 0, 0], cz: 44 - i * 5.5, n: 'Luz' })));
          [[-40, -100, 0, 'red'], [30, 100, 0, 'blue'], [100, 30, 90, 'yellow']].forEach(([x, y, a, c], i) => { const R = a ? (v) => [v[1], v[0]] : (v) => v; const [w, d] = R([24, 12]); const [cw, cd] = R([12, 11]); o.push(box(w, d, 6, x, y + (a ? 0 : -5), 3, { c, g: 20 + i, n: 'Carro' }), box(cw, cd, 5, x, y + (a ? 0 : -5), 9, { c, g: 20 + i, n: 'Cabine' })); });
          return o;
        }
      },
      {
        id: 100, nome: 'Projeto final autoral', diff: 5,
        obj: 'Projeto de conclusão: escolher um objeto real complexo, planejar e construir um modelo detalhado e realista usando apenas as formas e ferramentas estudadas, demonstrando domínio completo.',
        novo: { titulo: 'Como será a avaliação final', texto: 'A referência mostra um exemplo (um gramofone antigo) apenas como nível de ambição. O seu objeto deve ser outro, escolhido por você. Envie três imagens: o modelo montado, o modelo desagrupado (furos visíveis) e uma foto ou desenho do objeto real que inspirou o projeto, junto com o plano de construção.' },
        desc: 'Exemplo de nível esperado: um gramofone com base de madeira com molduras e pés, prato giratório com disco e rótulo, braço da agulha, corneta grande oca e curva, manivela lateral e detalhes metálicos. O seu projeto deve ter complexidade semelhante, com um objeto escolhido por você.',
        req: ['Objeto real escolhido por você, diferente das fases do curso e do exemplo.', 'Pelo menos 50 formas básicas e pelo menos 6 tipos diferentes de forma.', 'Pelo menos 3 furos com função (cavidade, encaixe, recorte, passagem).', 'Uso comprovado de Alinhar, Duplicar e repetir, Espelhar e Agrupar com Multicor.', 'Medidas reais ou escala declarada e coerente.', 'Plano de construção, foto/desenho de referência e três prints (montado, desagrupado e referência).'],
        formas: ['box', 'cyl', 'sphere', 'cone', 'torus', 'tube', 'hemi', 'wedge', 'cylh', 'boxh'], tools: ['inserir', 'navegar', 'dimensionar', 'rotacionar', 'elevar', 'mover', 'cor', 'propriedades', 'furo', 'agrupar', 'alinhar', 'regua', 'grade', 'duplicar', 'copiar', 'espelhar', 'plano', 'ocultar'],
        skills: ['Autonomia completa', 'Observação do real', 'Planejamento, execução e comunicação'],
        dicas: [
          'Escolha algo que você consegue observar de verdade (na sua casa, na escola, na rua). Fotografe de frente, de lado e de cima antes de começar: as fotos são o seu desenho técnico.',
          'Decomponha o objeto: volumes principais, recortes, peças repetidas, peças simétricas, detalhes. Para cada parte, escreva qual forma e qual ferramenta vai usar. Esse é o plano que vai junto com o print.',
          ['1. Escolha o objeto e meça (ou estime) as dimensões reais; defina a escala.', '2. Escreva o plano: subconjuntos, formas, furos, repetições, simetrias e ordem de montagem.', '3. Construa os volumes principais e confira as proporções nas vistas Frente, Lado e Topo.', '4. Aplique os recortes e furos funcionais; agrupe cada subconjunto.', '5. Acrescente repetições (Ctrl+D), peças espelhadas (M) e detalhes finos.', '6. Revise com a lista de requisitos, faça os três prints e envie ao professor com o plano.']
        ],
        crit: ['Complexidade e realismo do objeto escolhido.', 'Domínio técnico: furos, alinhamento, simetria, duplicação, grupos.', 'Fidelidade às proporções da referência real.', 'Qualidade do plano e da apresentação.', 'Acabamento e criatividade.'],
        model: () => {
          const o = [box(80, 80, 24, 0, 0, 6, { c: 'wood', n: 'Base de madeira' }), box(84, 84, 4, 0, 0, 6, { c: 'brown', n: 'Moldura inferior' }), box(84, 84, 3, 0, 0, 27, { c: 'brown', n: 'Moldura superior' })];
          [[-36, -36], [36, -36], [-36, 36], [36, 36]].forEach(([x, y]) => o.push(sp(10, x, y, 4, { c: 'brown', n: 'Pé' })));
          o.push(hbox(50, 4, 12, 0, -40, 12, { n: 'Painel rebaixado' }), box(50, 1, 12, 0, -39, 12, { c: 'brown', g: 1, n: 'Painel' }),
            cyl(64, 64, 3, -4, -2, 30, { c: 'dark', g: 2, n: 'Prato' }), cyl(60, 60, 1.2, -4, -2, 33, { c: 'black', g: 2, n: 'Disco' }), cyl(20, 20, 0.6, -4, -2, 34.2, { c: 'red', g: 2, n: 'Rótulo' }), cyl(2, 2, 6, -4, -2, 34, { c: 'silver', g: 2, n: 'Eixo' }),
            tube(44, 0.6, 0.6, -4, -2, 33.8, { hole: true, g: 2, n: 'Sulco (Tubo furo)' }), tube(52, 0.6, 0.6, -4, -2, 33.8, { hole: true, g: 2, n: 'Sulco (Tubo furo)' }),
            cyl(8, 8, 18, 30, 26, 30, { c: 'copper', g: 3, n: 'Coluna do braço' }), bar(30, 48, 14, 40, 26, 4, { c: 'copper', g: 3, n: 'Braço da agulha' }), box(5, 5, 6, 14, 22, 36, { c: 'silver', g: 3, n: 'Diafragma' }),
            torus(24, 6, 30, 26, 0, { c: 'copper', g: 4, r: [90, 0, 0], cz: 56, n: 'Pescoço curvo (Toroide)' }), hbox(30, 10, 14, 30, 26, 42, { g: 4, n: 'Corte do pescoço' }),
            cone(80, 80, 80, 6, 26, 0, { c: 'copper', g: 5, r: [0, -60, 0], top: 0.12, cz: 92, n: 'Corneta (Cone truncado)' }), cone(76, 76, 82, 5.5, 26, 0, { hole: true, g: 5, r: [0, -60, 0], top: 0.1, cz: 92, n: 'Interior da corneta' }),
            cyl(4, 4, 12, 46, 0, 0, { c: 'silver', g: 6, r: [0, 90, 0], cz: 18, n: 'Eixo da manivela' }), box(3, 3, 18, 52, 0, 18, { c: 'silver', g: 6, n: 'Braço da manivela' }), cyl(5, 5, 10, 56, 0, 0, { c: 'black', g: 6, r: [0, 90, 0], cz: 34, n: 'Pega da manivela' }));
          return o;
        }
      }
    ]
  });
})();
