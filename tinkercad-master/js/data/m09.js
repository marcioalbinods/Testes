/* Módulo 9 — Projetos avançados (fases 81–90) */
(function () {
  const { box, cyl, sphere, cone, torus, tube, poly, wedge, roof, rroof, hemi, pyr, hbox, hcyl, bar, barY, sp, wheel } = TM.S;
  /* blocos de banda de rodagem em volta de um pneu deitado no eixo Y */
  const treads = (cx, cy, cz, R, n, w, g) => { const o = []; for (let k = 0; k < n; k++) { const a = (360 / n) * k, r = (a * Math.PI) / 180; o.push(box(5, w, 3, cx + R * Math.cos(r), cy, 0, { c: 'black', g, r: [0, 90 - a, 0], cz: cz + R * Math.sin(r), n: 'Garra do pneu' })); } return o; };

  TM.addModule({
    n: 9, cor: '#4f5fd0', titulo: 'Projetos avançados',
    resumo: 'Mecanismos, produtos e equipamentos com muitas peças, subconjuntos e planejamento de montagem.',
    phases: [
      {
        id: 81, nome: 'Luminária articulada', diff: 4,
        obj: 'Projetar um mecanismo de braços paralelos com articulações, molas e cúpula orientada, mantendo cada eixo no ponto de giro.',
        desc: 'Uma luminária de arquiteto: base pesada, articulação inferior, braço inferior duplo (duas barras paralelas) com mola, articulação do cotovelo, braço superior duplo, articulação da cabeça e cúpula cônica oca inclinada com lâmpada. Botões de aperto marcam os eixos.',
        req: ['Base com articulação inferior (eixo horizontal).', 'Dois braços, cada um formado por duas barras paralelas iguais.', 'Mola feita com Toroides repetidos (Ctrl+D) ao longo do braço inferior.', 'Cúpula oca (Cone truncado com Cone furo) inclinada para baixo, com lâmpada.', 'Botões de aperto (Cilindros) em todos os eixos.'],
        formas: ['cyl', 'cone', 'torus', 'sphere', 'box'], tools: ['rotacionar', 'duplicar', 'alinhar', 'furo', 'agrupar', 'regua'],
        skills: ['Mecanismo de barras', 'Eixos de giro', 'Componentes em série'],
        dicas: [
          'Marque os três pontos de giro (base, cotovelo, cabeça). Cada braço é uma barra que vai de um ponto a outro; a segunda barra é uma cópia deslocada em Y.',
          'Cilindros finos girados para as barras; Cilindros deitados em Y para os eixos; Toroides pequenos com Ctrl+D para a mola; Cone truncado + Cone furo para a cúpula.',
          ['Base: Cilindro 50 × 50 × 8 e suporte (Caixa) até a articulação a 14 mm.', 'Braço inferior: Cilindro Ø 4 do eixo (0, 14) ao cotovelo (30, 70), girado em Y. Copie 8 mm em Y.', 'Mola: Toroide Ø 5 tubo 1 junto ao braço; Ctrl+D andando ao longo dele (10 espiras).', 'Braço superior: do cotovelo (30, 70) à cabeça (70, 60), também duplo.', 'Cúpula: Cone 34 × 34 × 26 com Raio superior pequeno, oca com Cone furo, girada −20° em Y com a boca para baixo. Lâmpada: Esfera.', 'Eixos: Cilindros deitados em Y nos três pontos, com botões nas pontas.']
        ],
        crit: ['Braços duplos paralelos e ligados nos eixos.', 'Mola regular.', 'Cúpula oca e bem orientada.', 'Mecanismo coerente.'],
        model: () => {
          const A = [0, 14], B = [30, 70], C = [70, 60], o = [cyl(50, 50, 8, 0, 0, 0, { c: 'dark', n: 'Base' }), box(10, 14, 10, 0, 0, 8, { c: 'dark', n: 'Suporte' })];
          [A, B, C].forEach(([x, z]) => o.push(cyl(8, 8, 16, x, 0, 0, { c: 'silver', r: [90, 0, 0], cz: z, n: 'Eixo' }), cyl(10, 10, 2, x, -9, 0, { c: 'red', r: [90, 0, 0], cz: z, n: 'Botão de aperto' })));
          [-4, 4].forEach((y) => o.push(bar(A[0], A[1], B[0], B[1], y, 4, { c: 'red', n: 'Braço inferior' }), bar(B[0], B[1], C[0], C[1], y, 4, { c: 'red', n: 'Braço superior' })));
          for (let i = 0; i < 10; i++) { const t = 0.15 + i * 0.07, x = A[0] + (B[0] - A[0]) * t + 5, z = A[1] + (B[1] - A[1]) * t; o.push(torus(5, 1, x, 0, 0, { c: 'silver', r: [0, 28, 0], cz: z, n: 'Espira da mola' })); }
          o.push(cone(34, 34, 26, 74, 0, 0, { c: 'red', g: 1, r: [0, 160, 0], top: 0.3, cz: 46, n: 'Cúpula (Cone)' }), cone(30, 30, 28, 74.4, 0, 0, { hole: true, g: 1, r: [0, 160, 0], top: 0.3, cz: 45, n: 'Cone furo' }), sp(12, 75, 0, 46, { c: 'yellow', g: 2, n: 'Lâmpada' }));
          return o;
        }
      },
      {
        id: 82, nome: 'Cadeira de escritório ergonômica', diff: 5,
        obj: 'Projetar um móvel ergonômico com base de cinco pontas (72°), mecanismo, assento estofado, encosto com apoio lombar e braços reguláveis.',
        desc: 'Uma cadeira giratória em escala 1:10: base estrela de cinco pontas com rodízios, coluna a gás com capa, mecanismo sob o assento com alavanca, assento com borda frontal arredondada, encosto inclinado com apoio lombar e de cabeça, e dois braços em T.',
        req: ['Base de cinco pontas distribuídas a 72°, cada uma com rodízio.', 'Coluna central e mecanismo com alavanca.', 'Assento com borda frontal arredondada (Telhado redondo).', 'Encosto inclinado com apoio lombar e apoio de cabeça.', 'Dois braços em T simétricos.', 'Proporções de cadeira real em 1:10 (assento a ~46 mm).'],
        formas: ['box', 'cyl', 'sphere', 'rroof', 'hemi'], tools: ['duplicar', 'rotacionar', 'espelhar', 'alinhar', 'agrupar'],
        skills: ['Simetria de 5', 'Ergonomia', 'Subconjuntos móveis'],
        dicas: [
          '360° ÷ 5 = 72°. Uma ponta da base é uma barra que sai do centro: agrupe com um "ajudante" no centro oposto para girar em torno do eixo da coluna.',
          'Caixas giradas a 72° (Ctrl+D) para a base; Esferas e Cilindros para os rodízios; Cilindro para a coluna; Caixas e Telhado redondo para o assento; Caixas giradas para o encosto; Caixas para os braços.',
          ['Ponta: Caixa 30 × 6 × 4 saindo do centro; rodízio na ponta (Cilindro deitado + Esfera). Agrupe, Ctrl+D girando 72°, 4 vezes.', 'Coluna: Cilindro 6 × 6 × 30 com capa (Cilindro 8 × 8 × 14).', 'Mecanismo: Caixa 20 × 20 × 6 sob o assento + alavanca (Cilindro fino deitado).', 'Assento: Caixa 46 × 44 × 6 a 40 mm + Telhado redondo na borda da frente.', 'Encosto: Caixa 44 × 4 × 46 girada −10° em X; apoio lombar (Cilindro deitado); apoio de cabeça (Caixa menor). Haste de ligação atrás.', 'Braço: poste (Caixa) + apoio (Caixa) em T; espelhe para o outro lado.']
        ],
        crit: ['Cinco pontas exatas e simétricas.', 'Assento e encosto ergonômicos.', 'Braços simétricos.', 'Proporções realistas.'],
        model: () => {
          const o = [];
          for (let k = 0; k < 5; k++) { const a = 90 + k * 72, r = (a * Math.PI) / 180; o.push(box(30, 6, 4, 15 * Math.cos(r), 15 * Math.sin(r), 6, { c: 'dark', r: [0, 0, a], n: 'Ponta da base' }), sp(7, 29 * Math.cos(r), 29 * Math.sin(r), 3.5, { c: 'black', n: 'Rodízio' }), cyl(4, 4, 4, 29 * Math.cos(r), 29 * Math.sin(r), 6, { c: 'dark', n: 'Garfo do rodízio' })); }
          o.push(cyl(12, 12, 6, 0, 0, 5, { c: 'dark', n: 'Cubo' }), cyl(6, 6, 30, 0, 0, 10, { c: 'silver', n: 'Coluna a gás' }), cyl(8, 8, 14, 0, 0, 10, { c: 'dark', n: 'Capa' }), box(20, 20, 6, 0, 0, 34, { c: 'dark', n: 'Mecanismo' }), cyl(2, 2, 14, 14, -4, 0, { c: 'dark', r: [0, 90, 0], cz: 36, n: 'Alavanca' }),
            box(46, 40, 6, 0, 2, 40, { c: 'navy', g: 1, n: 'Assento' }), rroof(46, 6, 3, 0, -18.5, 43, { c: 'navy', g: 1, r: [0, 0, 0], n: 'Borda arredondada' }), box(46, 6, 6, 0, -19, 40, { c: 'navy', g: 1, n: 'Borda' }),
            box(6, 6, 30, 0, 24, 30, { c: 'dark', g: 2, r: [-10, 0, 0], n: 'Haste do encosto' }), box(44, 5, 46, 0, 26, 0, { c: 'navy', g: 2, r: [-10, 0, 0], cz: 72, n: 'Encosto' }), cyl(8, 8, 36, 0, 22, 0, { c: 'navy', g: 2, r: [0, 90, 0], cz: 58, n: 'Apoio lombar' }), box(28, 5, 12, 0, 32, 0, { c: 'navy', g: 2, r: [-10, 0, 0], cz: 102, n: 'Apoio de cabeça' }));
          [-1, 1].forEach((s) => o.push(box(4, 6, 16, s * 25, 2, 40, { c: 'dark', g: 3, n: 'Poste do braço' }), box(8, 24, 3, s * 25, 0, 56, { c: 'black', g: 3, n: 'Apoio de braço' })));
          return o;
        }
      },
      {
        id: 83, nome: 'Veículo off-road detalhado', diff: 5,
        obj: 'Detalhar um veículo aberto: cockpit oco com bancos e volante, santantônio, pneus com garras em repetição circular, estepe e acessórios.',
        desc: 'Um jipe off-road aberto: carroceria oca com quatro bancos e volante, para-brisa com moldura, santantônio (barra de proteção), capô com entradas de ar, faróis redondos, guincho no para-choque, para-lamas, quatro rodas grandes com garras na banda de rodagem e estepe na traseira.',
        req: ['Carroceria oca (cockpit) com bancos e volante visíveis.', 'Para-brisa com moldura (Caixa com furo) e santantônio em U.', 'Pneus com pelo menos 12 garras cada, distribuídas em círculo.', 'Estepe na traseira.', 'Faróis redondos, grade, guincho e para-lamas.'],
        formas: ['box', 'boxh', 'cyl', 'torus', 'sphere'], tools: ['duplicar', 'rotacionar', 'furo', 'espelhar', 'agrupar', 'alinhar'],
        skills: ['Detalhamento avançado', 'Repetição circular em pneus', 'Interior e exterior'],
        dicas: [
          'Uma garra do pneu é uma Caixa pequena tangente ao pneu. Agrupe uma garra com um furo-ajudante no lado oposto para girar em torno do eixo da roda.',
          'Caixa + Caixa furo para a carroceria; Caixas para bancos; Toroide para o volante; Cilindros giradas para o santantônio; Ctrl+D com rotação para as garras.',
          ['Carroceria: Caixa 90 × 46 × 18 elevada a 18; cockpit: Caixa furo 50 × 40 × 18 elevada a 21.', 'Capô: Caixa 26 × 44 × 6 na frente; entradas de ar com frisos (Caixas furo).', 'Bancos: Caixas (assento + encosto) em duas fileiras. Volante: Toroide inclinado + coluna.', 'Para-brisa: Caixa 3 × 44 × 18 com Caixa furo 4 × 38 × 12 e vidro. Santantônio: dois Cilindros verticais + um horizontal.', 'Roda Ø 30 com 12 garras (Ctrl+D girando 30°); copie para os 4 cantos e uma de estepe na traseira, em pé.', 'Faróis (Cilindros deitados), grade (frisos), guincho (Cilindro) e para-lamas (Caixas finas sobre as rodas).']
        ],
        crit: ['Interior visível e completo.', 'Garras regulares nos pneus.', 'Estrutura de proteção e para-brisa.', 'Riqueza e coerência de detalhes.'],
        model: () => {
          const o = [box(90, 46, 18, 0, 0, 18, { c: 'green', n: 'Carroceria' }), hbox(50, 40, 18, -8, 0, 21, { n: 'Cockpit' }), box(26, 44, 6, 32, 0, 36, { c: 'green', n: 'Capô' }),
            box(3, 44, 18, 18, 0, 36, { c: 'dark', g: 1, n: 'Moldura do para-brisa' }), hbox(5, 38, 12, 18, 0, 39, { g: 1, n: 'Vão do para-brisa' }), box(1, 38, 12, 18, 0, 39, { c: 'glass', g: 2, n: 'Vidro' }),
            box(14, 14, 4, -2, -10, 21, { c: 'black', g: 3, n: 'Banco' }), box(4, 14, 14, -9, -10, 21, { c: 'black', g: 3, n: 'Encosto' }), box(14, 14, 4, -2, 10, 21, { c: 'black', g: 3, n: 'Banco' }), box(4, 14, 14, -9, 10, 21, { c: 'black', g: 3, n: 'Encosto' }),
            box(12, 36, 4, -24, 0, 21, { c: 'black', g: 3, n: 'Banco traseiro' }), box(4, 36, 12, -30, 0, 21, { c: 'black', g: 3, n: 'Encosto' }), torus(12, 1.6, 9, -10, 0, { c: 'black', g: 3, r: [0, -60, 0], cz: 38, n: 'Volante (Toroide)' }), bar(10, 38, 15, 30, -10, 2, { c: 'black', g: 3, n: 'Coluna' }),
            cyl(3, 3, 26, -20, -21, 36, { c: 'silver', g: 4, n: 'Santantônio' }), cyl(3, 3, 26, -20, 21, 36, { c: 'silver', g: 4, n: 'Santantônio' }), cyl(3, 3, 45, -20, 0, 0, { c: 'silver', g: 4, r: [90, 0, 0], cz: 62, n: 'Santantônio' }),
            box(4, 50, 6, 47, 0, 16, { c: 'dark', g: 5, n: 'Para-choque' }), cyl(6, 6, 10, 50, 0, 0, { c: 'silver', g: 5, r: [90, 0, 0], cz: 19, n: 'Guincho' }), cyl(7, 7, 2, 45.5, -15, 0, { c: 'yellow', g: 5, r: [0, 90, 0], cz: 33, n: 'Farol' }), cyl(7, 7, 2, 45.5, 15, 0, { c: 'yellow', g: 5, r: [0, 90, 0], cz: 33, n: 'Farol' }),
            box(1.5, 16, 8, 45.5, 0, 28, { c: 'dark', g: 5, n: 'Grade' })];
          for (let i = 0; i < 3; i++) o.push(hbox(10, 2, 1, 32, -10 + i * 10, 41.2, { n: 'Entrada de ar' }));
          [[28, -24], [28, 24], [-28, -24], [-28, 24]].forEach(([x, y], i) => { o.push(...wheel(x, y, 15, 30, 10, 10 + i, 'dark'), ...treads(x, y, 15, 15, 12, 10, 10 + i), box(34, 10, 2, x, y * 0.98, 32, { c: 'green', g: 20, n: 'Para-lama' })); });
          o.push(cyl(28, 28, 8, -51, 0, 0, { c: 'black', g: 30, r: [0, 90, 0], cz: 32, n: 'Estepe' }), cyl(16, 16, 9, -51, 0, 0, { c: 'dark', g: 30, r: [0, 90, 0], cz: 32, n: 'Aro do estepe' }));
          return o;
        }
      },
      {
        id: 84, nome: 'Impressora 3D estilizada', diff: 5,
        obj: 'Representar uma máquina com eixos lineares (X, Y, Z): trilhos, fusos com rosca, cabeçote, mesa e carretel, organizados por subsistemas.',
        desc: 'Uma impressora 3D cartesiana: base com tela inclinada e botão, mesa aquecida com grade sobre trilhos, pórtico com duas colunas, fusos verticais com rosca, trilho horizontal com cabeçote e bico, suporte superior com carretel de filamento e uma peça sendo impressa na mesa.',
        req: ['Base, mesa e pórtico com duas colunas.', 'Dois fusos verticais com rosca (Toroides repetidos).', 'Trilho horizontal com cabeçote e bico (Cone).', 'Mesa com grade de marcação (frisos).', 'Carretel de filamento (Tubo + discos) no suporte superior.', 'Tela inclinada e peça sendo impressa.'],
        formas: ['box', 'cyl', 'torus', 'cone', 'tube', 'boxh'], tools: ['duplicar', 'alinhar', 'regua', 'agrupar', 'furo', 'rotacionar'],
        skills: ['Máquina com eixos', 'Subsistemas', 'Componentes repetidos'],
        dicas: [
          'Uma impressora cartesiana move a mesa em Y, o cabeçote em X e o pórtico em Z. Organize os grupos assim: base, eixo Y, eixo Z, eixo X, extrusora.',
          'Caixas para base, colunas e mesa; Cilindros finos para trilhos e fusos; Toroides com Ctrl+D para as roscas; Caixa + Cone para o cabeçote; Tubo + Cilindros para o carretel.',
          ['Base: Caixa 90 × 60 × 10. Trilhos da mesa: Cilindros deitados em Y. Mesa: Caixa 60 × 60 × 3 com frisos.', 'Colunas: Caixas 6 × 10 × 90 nas laterais; travessa no topo.', 'Fusos: Cilindros Ø 3 ao lado das colunas com Toroides Ø 4 a cada 4 mm (Ctrl+D).', 'Trilho X: Cilindro deitado em X a 60 mm. Cabeçote: Caixa 14 × 14 × 18 com Cone de bico para baixo.', 'Carretel: Tubo + dois Cilindros finos (abas) num eixo sobre a travessa.', 'Tela: Caixa girada na frente da base. Peça impressa: forma pequena sobre a mesa.']
        ],
        crit: ['Eixos X, Y e Z identificáveis.', 'Roscas regulares.', 'Subsistemas organizados.', 'Leitura clara de impressora 3D.'],
        model: () => {
          const o = [box(90, 60, 10, 0, 0, 0, { c: 'dark', n: 'Base' }), cyl(3, 3, 60, -20, 0, 0, { c: 'silver', r: [90, 0, 0], cz: 12, n: 'Trilho Y' }), cyl(3, 3, 60, 20, 0, 0, { c: 'silver', r: [90, 0, 0], cz: 12, n: 'Trilho Y' }),
            box(60, 60, 3, 0, 0, 14, { c: 'red', g: 1, n: 'Mesa' })];
          for (let i = 1; i < 6; i++) o.push(hbox(56, 0.6, 1, 0, -30 + i * 10, 16.5, { g: 1, n: 'Friso' }), hbox(0.6, 56, 1, -30 + i * 10, 0, 16.5, { g: 1, n: 'Friso' }));
          [-42, 42].forEach((x) => { o.push(box(6, 10, 90, x, 0, 10, { c: 'dark', g: 2, n: 'Coluna' }), cyl(3, 3, 78, x + (x > 0 ? -6 : 6), 4, 10, { c: 'silver', g: 2, n: 'Fuso' })); for (let i = 0; i < 18; i++) o.push(torus(4.4, 1, x + (x > 0 ? -6 : 6), 4, 12 + i * 4, { c: 'silver', g: 2, n: 'Rosca' })); });
          o.push(box(90, 10, 6, 0, 0, 100, { c: 'dark', g: 2, n: 'Travessa' }), cyl(3, 3, 84, 0, 0, 0, { c: 'silver', g: 3, r: [0, 90, 0], cz: 60, n: 'Trilho X' }), box(14, 14, 18, 6, -4, 51, { c: 'orange', g: 3, n: 'Cabeçote' }), cone(4, 4, 6, 6, -4, 45, { c: 'yellow', g: 3, r: [180, 0, 0], n: 'Bico (Cone)' }),
            tube(36, 14, 12, 0, 0, 0, { c: 'teal', g: 4, r: [90, 0, 0], cz: 128, n: 'Filamento (Tubo)' }), cyl(44, 44, 2, 0, -8, 0, { c: 'dark', g: 4, r: [90, 0, 0], cz: 128, n: 'Aba do carretel' }), cyl(44, 44, 2, 0, 8, 0, { c: 'dark', g: 4, r: [90, 0, 0], cz: 128, n: 'Aba do carretel' }), cyl(4, 4, 24, 0, 0, 0, { c: 'silver', g: 4, r: [90, 0, 0], cz: 128, n: 'Eixo do carretel' }), box(4, 4, 6, 0, 0, 104, { c: 'silver', g: 4, n: 'Suporte' }),
            box(24, 2, 14, -26, -31, 0, { c: 'black', g: 5, r: [30, 0, 0], cz: 7, n: 'Tela' }), box(20, 1, 10, -26, -32, 0, { c: 'sky', g: 5, r: [30, 0, 0], cz: 7.5, n: 'Display' }), cyl(6, 6, 3, 10, -30, 0, { c: 'silver', g: 5, r: [90, 0, 0], cz: 6, n: 'Botão' }),
            cyl(14, 14, 12, 6, -4, 17, { c: 'yellow', g: 6, n: 'Peça impressa' }), tube(14, 6, 2, 6, -4, 29, { c: 'yellow', g: 6, n: 'Peça impressa' }));
          return o;
        }
      },
      {
        id: 85, nome: 'Drone quadricóptero', diff: 5,
        obj: 'Construir um equipamento com simetria em X (braços a 45°), hélices, protetores circulares, câmera com gimbal e trem de pouso.',
        desc: 'Um drone em configuração X: corpo central com tampa abaulada, quatro braços a 45°, motores nas pontas, hélices de duas pás, protetores circulares (Toroides) em volta das hélices, câmera em gimbal sob a frente, LEDs nos braços e trem de pouso com esquis.',
        req: ['Corpo central com tampa (Meia esfera).', 'Quatro braços a 45°, 135°, 225° e 315°, iguais.', 'Motor e hélice de duas pás em cada braço.', 'Protetores circulares centrados em cada hélice.', 'Câmera com gimbal na frente, por baixo.', 'Trem de pouso com dois esquis paralelos.'],
        formas: ['box', 'hemi', 'cyl', 'torus', 'sphere'], tools: ['duplicar', 'rotacionar', 'espelhar', 'alinhar', 'agrupar'],
        skills: ['Simetria em X', 'Rotação de 90°', 'Equipamento compacto'],
        dicas: [
          'O drone é igual nos quatro quadrantes. Monte um braço completo (braço, motor, hélice, protetor, LED), agrupe com um ajudante no centro e gire 90° três vezes.',
          'Caixas para corpo e braços; Meia esfera para a tampa; Cilindros para motores; Caixas finas cruzadas para as hélices; Toroides para os protetores; Esfera + Cilindro para o gimbal; Cilindros para os esquis.',
          ['Corpo: Caixa 30 × 30 × 10 elevada a 14; tampa: Meia esfera 26 × 26 × 8.', 'Braço: Caixa 46 × 6 × 4 girada 45° em Z, saindo do centro.', 'Na ponta: motor (Cilindro 10 × 10 × 8), hélice (Caixa 34 × 3 × 1 + outra girada 90°), protetor (Toroide Ø 40 tubo 2).', 'Agrupe o conjunto do braço com um furo-ajudante simétrico e Ctrl+D girando 90° em Z, três vezes.', 'Gimbal: Cilindro curto + Esfera Ø 10 + lente (Cilindro deitado) sob a frente.', 'Trem de pouso: 4 pernas inclinadas + 2 esquis (Cilindros deitados em X).']
        ],
        crit: ['Braços a 45° e simétricos.', 'Hélices e protetores centrados.', 'Gimbal e trem de pouso.', 'Equilíbrio e acabamento.'],
        model: () => {
          const o = [box(30, 30, 10, 0, 0, 14, { c: 'dark', n: 'Corpo' }), hemi(26, 26, 8, 0, 0, 24, { c: 'white', n: 'Tampa (Meia esfera)' }), sp(10, 0, -10, 9, { c: 'black', g: 1, n: 'Gimbal' }), cyl(6, 6, 4, 0, -10, 0, { c: 'black', g: 1, r: [90, 0, 0], cz: 8, n: 'Lente' }), cyl(4, 4, 4, 0, -10, 10, { c: 'dark', g: 1, n: 'Suporte do gimbal' })];
          [45, 135, 225, 315].forEach((a) => { const r = (a * Math.PI) / 180, X = 36 * Math.cos(r), Y = 36 * Math.sin(r);
            o.push(box(46, 6, 4, 18 * Math.cos(r), 18 * Math.sin(r), 17, { c: 'dark', r: [0, 0, a], n: 'Braço' }), cyl(10, 10, 8, X, Y, 17, { c: 'gray', n: 'Motor' }), box(34, 3, 1, X, Y, 26, { c: 'black', r: [0, 0, a + 20], n: 'Pá da hélice' }), box(34, 3, 1, X, Y, 26, { c: 'black', r: [0, 0, a + 110], n: 'Pá da hélice' }),
              torus(42, 2, X, Y, 24.5, { c: a > 180 ? 'red' : 'sky', n: 'Protetor (Toroide)' }), sp(3, 22 * Math.cos(r), 22 * Math.sin(r), 16, { c: a < 180 ? 'lime' : 'red', n: 'LED' })); });
          [-1, 1].forEach((s) => o.push(cyl(3, 3, 60, 0, s * 14, 0, { c: 'dark', g: 2, r: [0, 90, 0], cz: 2, n: 'Esqui' }), bar(-10, 3, -6, 14, s * 14, 2.4, { c: 'dark', g: 2, n: 'Perna' }), bar(10, 3, 6, 14, s * 14, 2.4, { c: 'dark', g: 2, n: 'Perna' })));
          return o;
        }
      },
      {
        id: 86, nome: 'Máquina industrial', diff: 5,
        obj: 'Projetar uma célula industrial com esteira de roletes, prensa hidráulica, painel de comando e sinalização de segurança.',
        desc: 'Uma prensa com esteira: estrutura de base com faixas de segurança, esteira com dez roletes e correia, caixas sendo transportadas, pórtico da prensa com cilindro hidráulico e cabeçote, painel de comando com botões e botão de emergência, e torre de sinalização (vermelho, amarelo, verde).',
        req: ['Esteira com pelo menos 10 roletes iguais (Ctrl+D) e correia.', 'Prensa com duas colunas, viga, cilindro hidráulico e haste.', 'Painel de comando com botões e botão de emergência (Meia esfera vermelha).', 'Torre de sinalização com três cores.', 'Faixas de segurança alternadas na base.', 'Objetos sendo transportados.'],
        formas: ['box', 'cyl', 'hemi', 'wedge'], tools: ['duplicar', 'alinhar', 'regua', 'agrupar', 'cor'],
        skills: ['Layout industrial', 'Repetição técnica', 'Comunicação visual de segurança'],
        dicas: [
          'Uma máquina industrial comunica pela forma e pela cor: vermelho para emergência, amarelo e preto para perigo, verde para funcionando.',
          'Caixas para estrutura, viga e painel; Cilindros deitados em Y para os roletes (Ctrl+D); Cilindros para o hidráulico e a torre; Meia esfera para o botão de emergência; Caixas alternadas para as faixas.',
          ['Base: Caixa 160 × 50 × 8. Faixas: Caixas 8 × 2 × 8 alternando preto e amarelo na lateral (Ctrl+D).', 'Esteira: duas laterais (Caixas finas); rolete Cilindro 6 × 6 × 34 deitado em Y; Ctrl+D a cada 12 mm (10 roletes); correia: Caixa fina por cima.', 'Prensa: duas colunas, viga superior, cilindro hidráulico (Cilindro Ø 16) e haste (Cilindro Ø 6) até o cabeçote (Caixa).', 'Painel: Caixa inclinada sobre um pedestal; botões (Cilindros) e emergência (Meia esfera vermelha).', 'Torre: Cilindros empilhados vermelho, amarelo e verde sobre uma haste.', 'Caixas pequenas sobre a correia.']
        ],
        crit: ['Esteira regular e completa.', 'Prensa coerente e alinhada à esteira.', 'Painel e sinalização de segurança.', 'Organização do conjunto.'],
        model: () => {
          const o = [box(160, 50, 8, 0, 0, 0, { c: 'gray', n: 'Base' })];
          for (let i = 0; i < 20; i++) o.push(box(8, 1.2, 8, -76 + i * 8, -25.4, 0, { c: i % 2 ? 'black' : 'yellow', g: 1, n: 'Faixa de segurança' }));
          o.push(box(130, 3, 10, -10, -18, 8, { c: 'dark', g: 2, n: 'Lateral da esteira' }), box(130, 3, 10, -10, 18, 8, { c: 'dark', g: 2, n: 'Lateral da esteira' }), box(126, 34, 1.2, -10, 0, 20.5, { c: 'black', g: 2, n: 'Correia' }));
          for (let i = 0; i < 10; i++) o.push(cyl(6, 6, 34, -64 + i * 12, 0, 0, { c: 'silver', g: 2, r: [90, 0, 0], cz: 17, n: 'Rolete' }));
          [-50, -20].forEach((x) => o.push(box(14, 14, 12, x, 0, 21.7, { c: 'wood', g: 3, n: 'Caixa transportada' })));
          [-18, 18].forEach((y) => o.push(box(8, 8, 80, 20, y * 1.45, 8, { c: 'orange', g: 4, n: 'Coluna da prensa' })));
          o.push(box(16, 64, 10, 20, 0, 84, { c: 'orange', g: 4, n: 'Viga' }), cyl(16, 16, 22, 20, 0, 62, { c: 'silver', g: 4, n: 'Cilindro hidráulico' }), cyl(6, 6, 16, 20, 0, 46, { c: 'silver', g: 4, n: 'Haste' }), box(24, 30, 8, 20, 0, 38, { c: 'dark', g: 4, n: 'Cabeçote' }),
            box(8, 8, 40, 66, -10, 8, { c: 'dark', g: 5, n: 'Pedestal' }), box(26, 6, 18, 66, -12, 0, { c: 'gray', g: 5, r: [30, 0, 0], cz: 52, n: 'Painel de comando' }), cyl(4, 4, 3, 60, -15, 0, { c: 'lime', g: 5, r: [30, 0, 0], cz: 52, n: 'Botão' }), cyl(4, 4, 3, 66, -15, 0, { c: 'sky', g: 5, r: [30, 0, 0], cz: 52, n: 'Botão' }), hemi(7, 7, 4, 73, -15.5, 0, { c: 'red', g: 5, r: [-60, 0, 0], cz: 53, n: 'Emergência (Meia esfera)' }),
            cyl(3, 3, 60, 72, 18, 8, { c: 'dark', g: 6, n: 'Haste da torre' }), cyl(8, 8, 7, 72, 18, 68, { c: 'green', g: 6, n: 'Luz verde' }), cyl(8, 8, 7, 72, 18, 75, { c: 'yellow', g: 6, n: 'Luz amarela' }), cyl(8, 8, 7, 72, 18, 82, { c: 'red', g: 6, n: 'Luz vermelha' }));
          return o;
        }
      },
      {
        id: 87, nome: 'Caixa de engrenagens', diff: 5,
        obj: 'Projetar um mecanismo de peças encaixáveis: carcaça com mancais, eixos com folga, engrenagens que engrenam e tampa parafusada, em vista explodida.',
        desc: 'Uma caixa de redução: carcaça aberta na frente com quatro torres de parafuso nos cantos e dois mancais (Tubos) na parede do fundo; dois eixos com folga atravessando os mancais; engrenagem grande e pequena engrenadas; manivela no eixo pequeno; tampa transparente afastada para a frente com quatro furos alinhados às torres.',
        req: ['Carcaça oca com parede do fundo e quatro torres com furo.', 'Dois mancais com furo 0,4 mm maior que os eixos.', 'Engrenagens de tamanhos diferentes engrenadas (dentes intercalados).', 'Manivela fora da carcaça, presa ao eixo.', 'Tampa com furos exatamente alinhados às torres.', 'Montagem mostrada em vista explodida (tampa afastada).'],
        formas: ['box', 'boxh', 'tube', 'cyl', 'cylh'], tools: ['alinhar', 'furo', 'grade', 'regua', 'agrupar', 'duplicar'],
        skills: ['Mecanismo funcional', 'Folgas e alinhamento de furos', 'Vista explodida'],
        dicas: [
          'A distância entre os eixos é a soma dos raios das engrenagens (ajustada para os dentes encaixarem). Defina os eixos primeiro e posicione o resto a partir deles.',
          'Caixa + Caixa furo para a carcaça; Tubos para mancais e torres; Cilindros para eixos; engrenagens da fase 34; Caixa fina com Cilindros furo para a tampa.',
          ['Carcaça: Caixa 80 × 40 × 50 e Caixa furo 74 × 40 × 44 elevada a 3, saindo pela frente (parede do fundo de 3 mm).', 'Torres: Tubos Ø 8 parede 2,5 nos quatro cantos internos.', 'Mancais: Tubos Ø 10 com furo 4,4 na parede do fundo, a 32 mm um do outro.', 'Eixos: Cilindros Ø 4 deitados em Y atravessando os mancais. Engrenagens nos eixos, encostadas e intercaladas.', 'Manivela: Caixa + Cilindro de pega no eixo pequeno, do lado de fora.', 'Tampa: Caixa 80 × 3 × 50 com quatro Cilindros furo alinhados às torres (L). Afaste 30 mm para a frente.']
        ],
        crit: ['Folgas corretas nos mancais.', 'Engrenagens engrenadas.', 'Furos da tampa alinhados às torres.', 'Montagem clara em vista explodida.'],
        model: () => {
          const o = [box(80, 40, 50, 0, 0, 0, { c: 'gray', n: 'Carcaça' }), hbox(74, 40, 44, 0, -3, 3, { n: 'Interior' })];
          [[-33, 4], [33, 4], [-33, 42], [33, 42]].forEach(([x, z]) => o.push(tube(8, 34, 2.5, x, -1, 0, { c: 'gray', g: 1, r: [90, 0, 0], cz: z, n: 'Torre de parafuso' })));
          [[-12, 23], [20, 23]].forEach(([x, z]) => o.push(tube(10, 8, 2.8, x, 17, 0, { c: 'silver', g: 2, r: [90, 0, 0], cz: z, n: 'Mancal (Tubo)' }), cyl(4, 4, 50, x, 0, 0, { c: 'silver', g: 3, r: [90, 0, 0], cz: z, n: 'Eixo' })));
          const G1 = [], G2 = [];
          G1.push(cyl(30, 30, 6, -12, -6, 0, { c: 'orange', g: 4, r: [90, 0, 0], cz: 23, n: 'Engrenagem grande' })); for (let k = 0; k < 6; k++) G1.push(box(38, 6, 4, -12, -6, 0, { c: 'orange', g: 4, r: [0, k * 30, 0], cz: 23, n: 'Dente' }));
          G2.push(cyl(16, 16, 6, 20, -6, 0, { c: 'yellow', g: 5, r: [90, 0, 0], cz: 23, n: 'Engrenagem pequena' })); for (let k = 0; k < 4; k++) G2.push(box(24, 6, 4, 20, -6, 0, { c: 'yellow', g: 5, r: [0, 22.5 + k * 45, 0], cz: 23, n: 'Dente' }));
          o.push(...G1, ...G2, box(4, 4, 18, 20, -28, 0, { c: 'dark', g: 6, cz: 15, n: 'Braço da manivela' }), cyl(5, 5, 8, 20, -33, 0, { c: 'red', g: 6, r: [90, 0, 0], cz: 7, n: 'Pega da manivela' }),
            box(80, 3, 50, 0, -55, 0, { c: 'glass', g: 7, n: 'Tampa transparente' }));
          [[-33, 4], [33, 4], [-33, 42], [33, 42]].forEach(([x, z]) => o.push(hcyl(3.4, 3.4, 6, x, -55, 0, { g: 7, r: [90, 0, 0], cz: z, n: 'Furo da tampa' })));
          return o;
        }
      },
      {
        id: 88, nome: 'Miniestação de trabalho', diff: 5,
        obj: 'Montar um ambiente de trabalho completo em escala 1:10, integrando móveis, equipamentos e objetos das fases anteriores com coerência de escala.',
        desc: 'Um canto de trabalho: mesa em L com gaveteiro de três gavetas e puxadores, monitor em braço articulado, notebook aberto, teclado e mouse, luminária, cadeira de escritório, vaso de planta, caneca com alça, prateleira na parede com livros e calha de cabos.',
        req: ['Mesa em L com gaveteiro de três gavetas (frisos e puxadores).', 'Monitor, notebook aberto, teclado e mouse em escala.', 'Cadeira e luminária reaproveitadas e ajustadas à escala.', 'Planta, caneca e prateleira com livros.', 'Organização por subgrupos (móveis, equipamentos, objetos).', 'Escala 1:10 coerente em todos os elementos.'],
        formas: ['box', 'boxh', 'cyl', 'tube', 'torus', 'sphere', 'cone'], tools: ['copiar', 'agrupar', 'alinhar', 'regua', 'rotacionar', 'ocultar'],
        skills: ['Integração de projetos', 'Escala consistente', 'Organização de cena complexa'],
        dicas: [
          'Reaproveite: luminária (fase 29 ou 81), cadeira (82), teclado (58), mouse (59). Ajuste a escala de cada um para 1:10 antes de posicionar.',
          'Caixas para mesa e gaveteiro, Caixas furo para os frisos das gavetas, Cilindros para pés e caneca, Tubo + Toroide para a caneca, Esferas para a planta.',
          ['Mesa: tampo 120 × 60 × 3 a 72 mm + tampo lateral 60 × 50 formando o L, com pés.', 'Gaveteiro: Caixa 40 × 50 × 60 com 2 frisos (Caixas furo) e 3 puxadores.', 'Monitor 55 × 3 × 32 em braço (barras girando) preso à mesa; notebook: base + tela girada 105°.', 'Teclado e mouse em escala (copie e redimensione com Shift).', 'Cadeira e luminária reaproveitadas; vaso: Cilindro + Esferas; caneca: Tubo + Toroide.', 'Prateleira na parede com livros. Agrupe por categoria.']
        ],
        crit: ['Escala consistente entre tudo.', 'Ambiente completo e organizado.', 'Detalhes funcionais (gavetas, braço, notebook).', 'Uso de subgrupos.'],
        model: () => {
          const o = [box(140, 100, 2, 10, 10, 0, { c: 'sand', n: 'Piso' }), box(140, 3, 110, 10, 61.5, 0, { c: 'cream', n: 'Parede' }),
            box(120, 60, 3, 0, 30, 72, { c: 'wood', g: 1, n: 'Tampo' }), box(50, 60, 3, 55, -30, 72, { c: 'wood', g: 1, n: 'Tampo lateral' })];
          [[-57, 3], [-57, 57], [77, -57], [77, 57]].forEach(([x, y]) => o.push(box(4, 4, 72, x, y, 0, { c: 'dark', g: 1, n: 'Pé' })));
          o.push(box(40, 50, 60, -36, 30, 2, { c: 'white', g: 2, n: 'Gaveteiro' }), hbox(40, 1, 1, -36, 4.5, 22, { g: 2, n: 'Friso' }), hbox(40, 1, 1, -36, 4.5, 42, { g: 2, n: 'Friso' }));
          [12, 32, 52].forEach((z) => o.push(box(12, 2, 2, -36, 4, z, { c: 'silver', g: 3, n: 'Puxador' })));
          o.push(box(55, 3, 32, 10, 52, 95, { c: 'black', g: 4, n: 'Monitor' }), box(51, 1, 28, 10, 50.4, 97, { c: 'navy', g: 4, n: 'Tela' }), bar(10, 75, 10, 100, 58, 3, { c: 'silver', g: 4, n: 'Braço do monitor' }), box(8, 6, 4, 10, 58, 75, { c: 'silver', g: 4, n: 'Grampo' }),
            box(36, 12, 2, 10, 30, 75, { c: 'silver', g: 4, n: 'Teclado' }), hemi(6, 10, 3, 36, 30, 75, { c: 'silver', g: 4, n: 'Mouse' }), box(30, 22, 1.6, 55, -28, 75, { c: 'gray', g: 4, n: 'Notebook' }), box(30, 1.4, 20, 55, -16, 0, { c: 'gray', g: 4, r: [-15, 0, 0], cz: 86, n: 'Tela do notebook' }),
            cyl(12, 12, 2, -45, 50, 75, { c: 'dark', g: 5, n: 'Base da luminária' }), bar(-45, 77, -35, 105, 50, 2, { c: 'dark', g: 5, n: 'Braço da luminária' }), cone(14, 14, 10, -32, 46, 0, { c: 'orange', g: 5, r: [0, 150, 0], top: 0.4, cz: 104, n: 'Cúpula' }),
            cyl(12, 12, 14, -50, 20, 75, { c: 'copper', g: 6, n: 'Vaso' }), sp(14, -50, 20, 96, { c: 'green', g: 6, n: 'Planta' }), sp(10, -55, 24, 104, { c: 'lime', g: 6, n: 'Planta' }),
            tube(8, 10, 1, 35, 15, 75, { c: 'red', g: 6, n: 'Caneca (Tubo)' }), torus(6, 1.2, 40, 15, 0, { c: 'red', g: 6, r: [90, 0, 0], cz: 80, n: 'Alça' }),
            box(60, 16, 2, -20, 52, 140, { c: 'wood', g: 7, n: 'Prateleira' }));
          ['red', 'navy', 'yellow', 'green', 'purple'].forEach((c, i) => o.push(box(5, 12, 16 + (i % 2) * 3, -44 + i * 6, 52, 142, { c, g: 7, n: 'Livro' })));
          o.push(box(36, 34, 4, 10, -2, 40, { c: 'navy', g: 8, n: 'Assento' }), box(34, 4, 36, 10, -20, 0, { c: 'navy', g: 8, r: [10, 0, 0], cz: 64, n: 'Encosto' }), cyl(5, 5, 32, 10, -2, 8, { c: 'silver', g: 8, n: 'Coluna' }));
          for (let k = 0; k < 5; k++) { const a = 90 + k * 72, r = (a * Math.PI) / 180; o.push(box(24, 4, 3, 10 + 12 * Math.cos(r), -2 + 12 * Math.sin(r), 5, { c: 'dark', g: 8, r: [0, 0, a], n: 'Base da cadeira' })); }
          return o;
        }
      },
      {
        id: 89, nome: 'Robô humanoide completo', diff: 5,
        obj: 'Construir um robô humanoide com muitos componentes: articulações, placas de blindagem, mãos com dedos, visor, mochila com propulsores e painéis com luzes.',
        desc: 'Um robô humanoide de pé: cabeça com visor de vidro, orelhas-antena e crista; tronco com painel peitoral rebaixado e luzes; abdômen e quadril articulados; ombreiras (Meias esferas); braços com cotovelos esféricos e mãos de quatro dedos; pernas com joelheiras e pés largos; mochila com dois propulsores.',
        req: ['Cabeça com visor de vidro, antenas e crista.', 'Painel peitoral rebaixado com pelo menos três luzes.', 'Ombreiras, cotovelos e joelhos articulados.', 'Mãos com quatro dedos cada.', 'Mochila com dois propulsores (Cone truncado).', 'Simetria perfeita entre esquerda e direita (Espelhar).'],
        formas: ['box', 'cyl', 'sphere', 'hemi', 'cone', 'boxh'], tools: ['espelhar', 'duplicar', 'furo', 'alinhar', 'agrupar'],
        skills: ['Personagem técnico complexo', 'Simetria total', 'Detalhes em série'],
        dicas: [
          'Construa só a metade direita (braço, perna, ombreira, metade do tronco) e espelhe. A cabeça, o painel e a mochila ficam no eixo central.',
          'Caixas para tronco, pernas e cabeça; Caixa furo para o painel; Esferas nas articulações; Meias esferas nas ombreiras; Cilindros finos para os dedos (Ctrl+D); Cones truncados nos propulsores.',
          ['Pernas: coxa (Caixa), joelho (Esfera), canela (Caixa), pé (Caixa larga). Quadril: Caixa.', 'Tronco: abdômen (Cilindro) + peito (Caixa 40 × 24 × 30). Painel: Caixa furo rasa; luzes (Cilindros coloridos).', 'Ombreira: Meia esfera sobre uma Esfera de ombro. Braço: Cilindro, cotovelo (Esfera), antebraço (Caixa).', 'Mão: Caixa + quatro Cilindros finos (Ctrl+D a cada 3 mm).', 'Cabeça: Caixa + visor (Caixa azul) + antenas (Cilindros) + crista (Caixa fina).', 'Espelhe braço e perna. Mochila com dois Cones truncados apontando para baixo.']
        ],
        crit: ['Simetria esquerda/direita.', 'Articulações e mãos detalhadas.', 'Painel, visor e mochila.', 'Personagem robusto e equilibrado.'],
        model: () => {
          const o = [box(26, 18, 12, 0, 0, 52, { c: 'dark', n: 'Quadril' }), cyl(22, 18, 12, 0, 0, 62, { c: 'gray', n: 'Abdômen' }), box(40, 24, 30, 0, 0, 72, { c: 'white', g: 1, n: 'Peito' }), hbox(22, 4, 12, 0, -12, 82, { g: 1, n: 'Painel rebaixado' }),
            cyl(10, 10, 6, 0, 0, 102, { c: 'gray', n: 'Pescoço' }), box(22, 20, 20, 0, 0, 106, { c: 'white', g: 2, n: 'Cabeça' }), box(18, 2, 7, 0, -10.2, 115, { c: 'sky', g: 2, n: 'Visor' }), box(3, 16, 6, 0, 0, 126, { c: 'red', g: 2, n: 'Crista' }),
            box(28, 10, 26, 0, 17, 76, { c: 'gray', g: 3, n: 'Mochila' })];
          ['red', 'yellow', 'lime'].forEach((c, i) => o.push(cyl(4, 4, 2, -6 + i * 6, -10.5, 0, { c, g: 4, r: [90, 0, 0], cz: 88, n: 'Luz' })));
          [-1, 1].forEach((s) => {
            o.push(box(10, 12, 22, s * 8, 0, 30, { c: 'white', n: 'Coxa' }), sp(11, s * 8, -1, 29, { c: 'gray', n: 'Joelho' }), box(10, 12, 22, s * 8, 0, 6, { c: 'white', n: 'Canela' }), box(14, 22, 6, s * 8, -4, 0, { c: 'dark', n: 'Pé' }),
              sp(12, s * 24, 0, 96, { c: 'gray', n: 'Ombro' }), hemi(18, 18, 8, s * 25, 0, 97, { c: 'red', n: 'Ombreira' }), cyl(8, 8, 18, s * 26, 0, 74, { c: 'white', n: 'Braço' }), sp(10, s * 26, 0, 72, { c: 'gray', n: 'Cotovelo' }), box(9, 10, 16, s * 26, 0, 52, { c: 'white', n: 'Antebraço' }), box(10, 8, 6, s * 26, 0, 45, { c: 'dark', n: 'Mão' }),
              cyl(4, 4, 6, s * 12, 0, 0, { c: 'gray', g: 2, r: [0, 90, 0], cz: 114, n: 'Orelha' }), cyl(1.4, 1.4, 12, s * 12, 0, 118, { c: 'dark', g: 2, n: 'Antena' }),
              cone(8, 8, 8, s * 8, 21, 62, { c: 'dark', g: 3, top: 1.5, n: 'Propulsor (Cone truncado)' }));
            for (let i = 0; i < 4; i++) o.push(cyl(2, 2, 7, s * 26 - 4.5 + i * 3, -2, 38, { c: 'dark', n: 'Dedo' }));
          });
          return o;
        }
      },
      {
        id: 90, nome: 'Projeto de produto: caixa de som', diff: 5,
        obj: 'Desafio do módulo: conduzir um projeto de produto completo, com medidas reais, função, ergonomia, detalhes de fabricação e acabamento.',
        desc: 'Uma caixa de som portátil de 16 cm: corpo cilíndrico deitado com tampas de borracha nas pontas e radiadores passivos rebaixados, grade frontal com furos em grade, botões no topo com anel de LED, alça de tecido presa numa ponta, pés antiderrapantes e entrada USB-C recortada.',
        req: ['Medidas reais: corpo de Ø 60 mm e cerca de 160 mm de comprimento.', 'Grade frontal com pelo menos 27 furos regulares (Ctrl+D em X e Z).', 'Tampas laterais com radiador passivo rebaixado.', 'Botões no topo e anel de LED (Tubo).', 'Pés que impedem a caixa de rolar e entrada USB-C recortada.', 'Nas anotações da fase: público-alvo, medidas e uma justificativa de design.'],
        formas: ['cyl', 'cylh', 'tube', 'box', 'boxh', 'torus'], tools: ['duplicar', 'furo', 'alinhar', 'regua', 'agrupar', 'propriedades'],
        skills: ['Projeto de produto', 'Detalhes de fabricação', 'Comunicar decisões de design'],
        dicas: [
          'Pense no uso: onde a pessoa segura, como a caixa fica apoiada sem rolar, de onde o som sai e onde o cabo entra. Cada detalhe responde a uma dessas perguntas.',
          'Cilindro deitado em X para o corpo; Cilindros nas pontas como tampas com Cilindro furo raso; Cilindros furo curtos em grade (Ctrl+D) para a grade; Cilindros e Tubo para os botões; Toroide para a alça; Caixas para os pés.',
          ['Corpo: Cilindro 60 × 60 × 140 deitado em X, centro a 34 mm.', 'Tampas: Cilindros 62 × 62 × 10 nas pontas; radiador: Cilindro furo Ø 40 rebaixando 1,5 mm + disco interno.', 'Grade: Cilindro furo Ø 4 × 8 deitado em Y na frente; Ctrl+D a cada 10 mm em X (9) e depois copie a linha 10 mm acima e abaixo.', 'Botões: quatro Cilindros Ø 7 no topo; anel de LED: Tubo Ø 12 em volta do botão central.', 'Pés: duas Caixas 30 × 30 × 6 por baixo. USB-C: Caixa furo 9 × 3 × 10 numa tampa.', 'Alça: Toroide Ø 26 em pé preso numa tampa. Agrupe por subconjunto.']
        ],
        crit: ['Medidas reais e proporção de produto.', 'Grade regular e bem distribuída.', 'Detalhes funcionais (pés, USB-C, botões).', 'Justificativa de design coerente.'],
        model: () => {
          const H = 34, o = [cyl(60, 60, 140, 0, 0, 0, { c: 'navy', r: [0, 90, 0], cz: H, n: 'Corpo' })];
          for (let i = 0; i < 9; i++) for (let j = -1; j <= 1; j++) o.push(hcyl(4, 4, 8, -40 + i * 10, -28, 0, { r: [90, 0, 0], cz: H + j * 10, n: 'Furo da grade' }));
          [-1, 1].forEach((s) => o.push(cyl(62, 62, 10, s * 75, 0, 0, { c: 'black', g: 1 + (s > 0 ? 1 : 0), r: [0, 90, 0], cz: H, n: 'Tampa de borracha' }), hcyl(40, 40, 4, s * 80.5, 0, 0, { g: 1 + (s > 0 ? 1 : 0), r: [0, 90, 0], cz: H, n: 'Rebaixo do radiador' }), cyl(30, 30, 1, s * 79, 0, 0, { c: 'dark', g: 10, r: [0, 90, 0], cz: H, n: 'Radiador passivo' })));
          o.push(hbox(4, 9, 3, 80, 0, 10, { g: 2, n: 'Entrada USB-C' }));
          [-24, -8, 8, 24].forEach((x) => o.push(cyl(7, 7, 4, x, 0, 61, { c: x === 8 ? 'white' : 'silver', g: 3, n: 'Botão' })));
          o.push(tube(12, 1.5, 1.6, 8, 0, 63, { c: 'sky', g: 3, n: 'Anel de LED (Tubo)' }), box(30, 30, 6, -40, 0, 0, { c: 'black', g: 4, n: 'Pé antiderrapante' }), box(30, 30, 6, 40, 0, 0, { c: 'black', g: 4, n: 'Pé antiderrapante' }),
            torus(26, 5, -86, 0, 0, { c: 'orange', g: 5, r: [0, 90, 0], cz: 50, n: 'Alça (Toroide)' }));
          return o;
        }
      }
    ]
  });
})();
