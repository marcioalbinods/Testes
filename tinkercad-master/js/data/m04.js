/* Módulo 4 — Precisão e controle (fases 31–40) */
(function () {
  const { box, cyl, sphere, cone, pyr, torus, tube, poly, wedge, roof, hbox, hcyl } = TM.S;
  TM.addModule({
    n: 4, cor: '#8250d6', titulo: 'Precisão e controle',
    resumo: 'Alinhar, medir com a régua, duplicar e repetir, espelhar e girar com exatidão.',
    phases: [
      {
        id: 31, nome: 'Alvo de precisão', diff: 3,
        obj: 'Usar a ferramenta Alinhar para centralizar várias formas de uma vez e alinhar peças por uma borda comum.',
        novo: { titulo: 'Alinhar (L)', texto: 'Selecione duas ou mais formas e aperte L. Aparecem pontos pretos em X, Y e Z: os das pontas alinham pelas bordas, o do meio alinha pelos centros. Antes de clicar num ponto, clique em uma das formas: ela vira a referência fixa e as outras se movem até ela.', passos: ['Centralizar tudo numa base: selecione base + peças, clique na base (referência) e depois nos pontos do meio em X e em Y.', 'Alinhar pela esquerda: ponto da extremidade esquerda no eixo X.'] },
        desc: 'Um alvo sobre uma placa quadrada: cinco discos concêntricos empilhados como degraus (vermelho e branco alternados), perfeitamente centrados. Na frente da placa, três barras de tamanhos diferentes alinhadas pela borda esquerda, como uma legenda.',
        req: ['Placa de 70 × 70 × 4 mm.', 'Cinco discos de Ø 56, 44, 32, 20 e 8 mm, cada um 3 mm mais alto que o anterior.', 'Discos centralizados na placa com a ferramenta Alinhar (sem ajuste no olho).', 'Três barras de 30, 20 e 10 mm alinhadas pela borda esquerda da placa.', 'Barras com o mesmo espaçamento entre si.'],
        formas: ['box', 'cyl'], tools: ['alinhar', 'elevar', 'dimensionar', 'cor'],
        skills: ['Alinhar por centro', 'Alinhar por borda', 'Escolher a referência'],
        dicas: [
          'Deixe a placa como referência: ela não deve se mover. Tudo que precisa ficar "no meio" alinha pelo ponto do meio.',
          'Placa (Caixa), cinco Cilindros, três Caixas finas. Ferramenta Alinhar (L): primeiro clique na placa, depois nos pontos de centro de X e Y.',
          ['Placa: Caixa 70 × 70 × 4.', 'Cilindros: Ø 56 × 3 (elevação 4), Ø 44 × 3 (7), Ø 32 × 3 (10), Ø 20 × 3 (13), Ø 8 × 3 (16). Cores alternadas.', 'Selecione placa e cilindros, aperte L, clique na placa, depois no ponto central de X e no ponto central de Y.', 'Barras: Caixas 30 × 5 × 4, 20 × 5 × 4 e 10 × 5 × 4 na frente da placa, a 7 mm uma da outra em Y.', 'Selecione placa e barras, L, clique na placa e no ponto da esquerda em X.']
        ],
        crit: ['Discos perfeitamente concêntricos.', 'Alturas em degraus de 3 mm.', 'Barras alinhadas pela borda esquerda.', 'Espaçamento regular.'],
        model: () => {
          const o = [box(70, 70, 4, 0, 0, 0, { c: 'white', n: 'Placa' })];
          [56, 44, 32, 20, 8].forEach((d, i) => o.push(cyl(d, d, 3, 0, 0, 4 + i * 3, { c: i % 2 ? 'white' : 'red', n: 'Disco Ø' + d })));
          [30, 20, 10].forEach((w, i) => o.push(box(w, 5, 4, -35 + w / 2, -45 - i * 7, 0, { c: 'purple', n: 'Barra ' + w })));
          return o;
        }
      },
      {
        id: 32, nome: 'Placa de montagem', diff: 3,
        obj: 'Usar a Régua para posicionar furos e peças em coordenadas exatas, como num projeto técnico.',
        novo: { titulo: 'Régua (R)', texto: 'Arraste a Régua para um canto da peça. Ao selecionar uma forma aparecem as distâncias dela até a régua, em X e Y, e a elevação. Clique em qualquer número para digitar a posição exata. É assim que se trabalha com cotas de desenho técnico.' },
        desc: 'Uma placa para fixar uma placa eletrônica: quatro torres (espaçadores) ocos nos cantos sobre furos passantes, um recorte retangular central para passar cabos e dois furos para LEDs na frente, todos em posições cotadas.',
        req: ['Placa de 100 × 60 × 3 mm.', 'Quatro espaçadores (Tubo Ø 6 mm, 6 mm de altura, furo Ø 2,5) com centros a 5 mm das duas bordas de cada canto.', 'Furos Ø 2,5 atravessando a placa sob os espaçadores.', 'Recorte retangular de 40 × 20 mm exatamente no centro.', 'Dois furos Ø 5 com centros a 20 mm um do outro, a 10 mm da borda da frente, simétricos.'],
        formas: ['box', 'tube', 'boxh', 'cylh'], tools: ['regua', 'furo', 'agrupar', 'grade'],
        skills: ['Posicionar por cotas', 'Ler coordenadas', 'Furos de montagem'],
        dicas: [
          'Com a régua no canto inferior esquerdo da placa, o canto vira (0, 0). Um centro "a 5 mm das bordas" fica em (5, 5); mas a régua mede a borda da forma, então desconte o raio.',
          'Régua no canto da placa; Tubos para os espaçadores; Cilindros furo e Caixa furo. Digite as distâncias nos números da régua.',
          ['Placa: Caixa 100 × 60 × 3. Coloque a Régua no canto frontal esquerdo.', 'Tubo Ø 6 (parede 1,75) × 6 elevado a 3. Na régua, digite X = 2 e Y = 2 (borda do tubo; o centro fica em 5, 5).', 'Copie para os outros cantos: X = 92 ou Y = 52 conforme o canto.', 'Cilindros furo Ø 2,5 sob cada tubo, atravessando a placa.', 'Recorte: Caixa furo 40 × 20 em X = 30, Y = 20.', 'LEDs: Cilindros furo Ø 5 com borda em X = 37,5 e 57,5, Y = 7,5. Agrupe tudo.']
        ],
        crit: ['Furos e espaçadores nas cotas pedidas (±0,5 mm).', 'Recorte centrado.', 'Furos dos LEDs simétricos.', 'Peça agrupada.'],
        model: () => {
          const o = [box(100, 60, 3, 0, 0, 0, { c: 'green', n: 'Placa' })];
          [[-45, -25], [45, -25], [-45, 25], [45, 25]].forEach(([x, y]) => { o.push(tube(6, 6, 1.75, x, y, 3, { c: 'yellow', n: 'Espaçador (Tubo)' }), hcyl(2.5, 2.5, 8, x, y, -1, { n: 'Furo de fixação' })); });
          o.push(hbox(40, 20, 6, 0, 0, -1, { n: 'Recorte central' }), hcyl(5, 5, 6, -10, -20, -1, { n: 'Furo do LED' }), hcyl(5, 5, 6, 10, -20, -1, { n: 'Furo do LED' }));
          return o;
        }
      },
      {
        id: 33, nome: 'Cerca de estacas', diff: 3,
        obj: 'Usar Duplicar e repetir (Ctrl+D) para criar uma série de peças com espaçamento perfeito em poucos cliques.',
        novo: { titulo: 'Duplicar e repetir (Ctrl+D)', texto: 'Selecione a peça e aperte Ctrl+D: uma cópia nasce no mesmo lugar. Mova a cópia (por exemplo, 10 mm em X). Agora aperte Ctrl+D de novo: o Tinkercad cria outra cópia já deslocada 10 mm. Ele lembra a última transformação. Não clique em outro lugar entre um Ctrl+D e outro, senão ele esquece.' },
        desc: 'Um trecho de cerca sobre uma faixa de grama: nove estacas iguais com ponta piramidal, espaçadas exatamente 10 mm, presas por duas travessas horizontais.',
        req: ['Faixa de grama de 100 × 16 × 2 mm.', 'Estaca de 4 × 4 × 30 mm com ponta de Pirâmide, agrupada antes de duplicar.', 'Nove estacas com centros a 10 mm um do outro, feitas com Ctrl+D.', 'Duas travessas atrás das estacas, a 8 e 22 mm de altura.', 'Estacas centralizadas na faixa.'],
        formas: ['box', 'pyr'], tools: ['duplicar', 'agrupar', 'alinhar', 'mover'],
        skills: ['Repetição linear', 'Agrupar antes de repetir', 'Centralizar uma série'],
        dicas: [
          'Uma estaca é "uma peça" (corpo + ponta). Monte e agrupe a primeira com perfeição: todas as cópias herdarão a qualidade (ou o defeito) dela.',
          'Caixa + Pirâmide agrupadas; Ctrl+D, mover 10 mm, Ctrl+D sete vezes. Caixas finas para as travessas; Alinhar para centralizar a série na grama.',
          ['Grama: Caixa 100 × 16 × 2, verde.', 'Estaca: Caixa 4 × 4 × 30 e Pirâmide 4 × 4 × 5 elevada a 30 (no topo). Agrupe e eleve tudo a 2.', 'Ctrl+D, seta para a direita 10 vezes (grade 1 mm). Depois Ctrl+D mais 7 vezes.', 'Selecione as 9 estacas, agrupe, e com Alinhar centralize em X e Y sobre a grama.', 'Travessas: Caixas 88 × 2 × 4 encostadas atrás das estacas, elevações 10 e 24.']
        ],
        crit: ['Espaçamento idêntico entre todas as estacas.', 'Estacas iguais (agrupadas antes da cópia).', 'Travessas retas e encostadas.', 'Série centralizada.'],
        model: () => {
          const o = [box(100, 16, 2, 0, 0, 0, { c: 'green', n: 'Grama' })];
          for (let i = 0; i < 9; i++) { const x = -40 + i * 10; o.push(box(4, 4, 30, x, 0, 2, { c: 'white', n: 'Estaca' }), pyr(4, 4, 5, x, 0, 32, { c: 'white', n: 'Ponta (Pirâmide)' })); }
          o.push(box(88, 2, 4, 0, 3, 10, { c: 'wood', n: 'Travessa' }), box(88, 2, 4, 0, 3, 24, { c: 'wood', n: 'Travessa' }));
          return o;
        }
      },
      {
        id: 34, nome: 'Engrenagem visual', diff: 4,
        obj: 'Criar repetição circular girando com Ctrl+D e combinar a série com furos centrais e de alívio.',
        novo: { titulo: 'Repetição circular com Ctrl+D', texto: 'O Tinkercad gira a seleção em torno do centro dela. Por isso, uma barra que atravessa o disco pelo centro gira em torno do centro do disco. Ctrl+D, gire 22,5°, Ctrl+D, Ctrl+D... Oito barras viram dezesseis dentes.' },
        desc: 'Uma engrenagem grande de 16 dentes com cubo central saliente, furo de eixo com rasgo de chaveta e quatro furos de alívio, engrenada com uma engrenagem menor de 12 dentes ao lado.',
        req: ['Disco de Ø 50 × 8 mm com 16 dentes regulares (barras de 58 × 5 mm a cada 22,5°).', 'Cubo central de Ø 16 mm mais alto que o disco.', 'Furo de eixo Ø 8 com rasgo de chaveta.', 'Quatro furos de alívio Ø 9 em círculo, a 90° entre si.', 'Engrenagem menor de 12 dentes (barras a cada 30°) encostada na grande, com dentes intercalados.'],
        formas: ['cyl', 'box', 'cylh', 'boxh'], tools: ['duplicar', 'rotacionar', 'furo', 'agrupar', 'alinhar'],
        skills: ['Repetição circular', 'Simetria radial', 'Furos funcionais'],
        dicas: [
          '360° ÷ 16 dentes = 22,5°. Como cada barra faz dois dentes, você precisa de 8 barras: 0°, 22,5°, 45°... até 157,5°.',
          'Caixa (barra) centrada no disco, Ctrl+D e rotação de 22,5° em Z. Cilindros e Cilindros furo para cubo, eixo e alívios.',
          ['Disco: Cilindro 50 × 50 × 8.', 'Barra: Caixa 58 × 5 × 8, alinhada no centro do disco (L).', 'Ctrl+D, gire 22,5° em Z (digite o ângulo). Ctrl+D seis vezes. Agora são 8 barras.', 'Cubo: Cilindro 16 × 16 × 12. Eixo: Cilindro furo 8 × 8 × 20 atravessando. Chaveta: Caixa furo 2 × 3 encostada no furo do eixo.', 'Alívio: Cilindro furo Ø 9 a 16 mm do centro; Ctrl+D com rotação de 90° em torno do centro (agrupe com um "ajudante" simétrico ou posicione os quatro pela régua). Agrupe tudo.', 'Engrenagem menor: disco Ø 26, 6 barras de 33 × 5 a cada 30°. Encoste na grande girando 15° para intercalar os dentes.']
        ],
        crit: ['Dentes igualmente espaçados.', 'Furos centrais e de alívio corretos.', 'Engrenagens encostadas com dentes intercalados.', 'Cada engrenagem agrupada.'],
        model: () => {
          const o = [cyl(50, 50, 8, 0, 0, 0, { c: 'purple', n: 'Disco' }), cyl(16, 16, 12, 0, 0, 0, { c: 'purple', n: 'Cubo' })];
          for (let k = 0; k < 8; k++) o.push(box(58, 5, 8, 0, 0, 0, { c: 'purple', r: [0, 0, k * 22.5], n: 'Barra (2 dentes)' }));
          o.push(hcyl(8, 8, 20, 0, 0, -1, { n: 'Furo do eixo' }), hbox(2, 3, 20, 0, 5, -1, { n: 'Chaveta' }));
          TM.S.ring(4, 15, 0, 0, (x, y) => hcyl(9, 9, 20, x, y, -1, { n: 'Furo de alívio' }), 45).forEach((q) => o.push(q));
          const X = 43;
          o.push(cyl(26, 26, 8, X, 0, 0, { c: 'orange', g: 1, n: 'Disco menor' }), hcyl(6, 6, 20, X, 0, -1, { g: 1, n: 'Furo do eixo' }));
          for (let k = 0; k < 6; k++) o.push(box(33, 5, 8, X, 0, 0, { c: 'orange', g: 1, r: [0, 0, 15 + k * 30], n: 'Barra (2 dentes)' }));
          return o;
        }
      },
      {
        id: 35, nome: 'Parafuso estilizado', diff: 3,
        obj: 'Usar Ctrl+D com deslocamento vertical para repetir anéis ao longo de um eixo e construir uma peça mecânica reconhecível.',
        desc: 'Um parafuso em pé: cabeça sextavada com fenda, corpo cilíndrico com dez anéis simulando a rosca e ponta cônica. Os anéis têm o mesmo passo do começo ao fim.',
        req: ['Cabeça sextavada feita com Polígono de 6 lados (Ø 14 mm, 6 mm de altura).', 'Fenda na cabeça (Caixa furo).', 'Corpo Ø 8 mm com 28 mm de comprimento.', 'Dez anéis (Toroide) com passo constante de 2,5 mm feitos com Ctrl+D.', 'Ponta em Cone virada para baixo.'],
        formas: ['poly', 'cyl', 'torus', 'cone', 'boxh'], tools: ['duplicar', 'propriedades', 'alinhar', 'furo', 'agrupar'],
        skills: ['Repetição em Z', 'Polígono regular', 'Montagem axial'],
        dicas: [
          'A rosca é uma pilha de anéis idênticos, um a cada 2,5 mm. Comece pelo anel de baixo e deixe o Ctrl+D subir os outros.',
          'Polígono (Lados = 6), Cilindro, Toroide pequeno, Cone girado 180°, Caixa furo para a fenda. Ctrl+D com elevação de 2,5 mm.',
          ['Ponta: Cone 8 × 8 × 4 girado 180° (ponta para baixo).', 'Corpo: Cilindro 8 × 8 × 28 elevado a 4.', 'Anel: Toroide com Ø 9,2 e tubo 1,6, elevado a 5, centralizado no corpo (L).', 'Ctrl+D, eleve 2,5 mm (Ctrl + seta para cima com grade 0,5). Repita Ctrl+D até ter 10 anéis.', 'Cabeça: Polígono com 6 lados, Ø 14 × 6, elevado a 32. Fenda: Caixa furo 1,8 × 16 × 3 no topo da cabeça.', 'Alinhe tudo no centro e agrupe.']
        ],
        crit: ['Passo da rosca constante.', 'Cabeça sextavada com fenda centrada.', 'Peças concêntricas.', 'Proporção de parafuso real.'],
        model: () => {
          const o = [cone(8, 8, 4, 0, 0, 0, { c: 'silver', r: [180, 0, 0], n: 'Ponta (Cone)' }), cyl(8, 8, 28, 0, 0, 4, { c: 'silver', n: 'Corpo' })];
          for (let i = 0; i < 10; i++) o.push(torus(9.2, 1.6, 0, 0, 5 + i * 2.5, { c: 'silver', n: 'Anel de rosca' }));
          o.push(poly(14, 14, 6, 0, 0, 32, { c: 'gray', sides: 6, n: 'Cabeça (Polígono)' }), hbox(1.8, 16, 3, 0, 0, 35.5, { n: 'Fenda' }));
          return o;
        }
      },
      {
        id: 36, nome: 'Porcas e arruela', diff: 4,
        obj: 'Desagrupar uma peça pronta para editá-la e projetar peças que se encaixam num parafuso existente.',
        novo: { titulo: 'Desagrupar para editar', texto: 'Um grupo não é definitivo. Selecione e aperte Ctrl+Shift+G: as peças voltam, inclusive os furos. Edite o que precisar (um diâmetro, um comprimento) e agrupe de novo. Copie o parafuso da fase 35 para conferir o encaixe das porcas.' },
        desc: 'Três peças de fixação para o parafuso da fase anterior: uma porca sextavada com rosca interna aparente, uma arruela lisa e uma porca borboleta com duas abas.',
        req: ['Porca sextavada: Polígono de 6 lados Ø 14 × 7 mm com furo Ø 8,4.', 'Rosca interna aparente com anéis dentro do furo.', 'Arruela: Tubo com Ø externo 18 mm e furo de 8,8 mm, 1,6 mm de espessura.', 'Porca borboleta: corpo cilíndrico com furo e duas abas (Cunhas) simétricas.', 'Furos com folga para o corpo de 8 mm do parafuso.'],
        formas: ['poly', 'cylh', 'torus', 'tube', 'cyl', 'wedge'], tools: ['agrupar', 'furo', 'propriedades', 'espelhar', 'alinhar'],
        skills: ['Editar grupos', 'Peças compatíveis', 'Folga radial'],
        dicas: [
          'Todas as peças precisam passar no corpo de 8 mm do parafuso. Furo igual a 8 trava; furo de 8,4 a 8,8 passa.',
          'Polígono 6 lados + Cilindro furo; Toroides finos dentro do furo como grupo separado; Tubo para a arruela; Cilindro + Cunhas para a borboleta.',
          ['Porca: Polígono 6 lados, Ø 14 × 7. Cilindro furo Ø 8,4 atravessando. Agrupe.', 'Rosca aparente: dois Toroides Ø 8,6 com tubo 1,2 dentro do furo, a 1,5 e 4 mm de altura (grupo separado, para não serem cortados).', 'Arruela: Tubo Ø 18, parede 4,6, altura 1,6.', 'Borboleta: Cilindro 12 × 12 × 8 com furo Ø 8,4. Aba: Cunha 10 × 2,5 × 12 encostada na lateral com a parte alta junto ao corpo.', 'Copie a aba e use Espelhar (M) para o outro lado. Agrupe.', 'Copie o parafuso da fase 35, desagrupe se precisar, e confira se as peças passam no corpo.']
        ],
        crit: ['Furos com folga correta.', 'Porca sextavada regular e rosca aparente.', 'Arruela fina e centrada.', 'Abas da borboleta simétricas.'],
        model: () => [poly(14, 14, 7, -30, 0, 0, { c: 'gray', sides: 6, n: 'Porca sextavada' }), hcyl(8.4, 8.4, 9, -30, 0, -1, { n: 'Furo da porca' }),
          torus(8.8, 1.2, -30, 0, 1.5, { c: 'silver', g: 1, n: 'Rosca interna' }), torus(8.8, 1.2, -30, 0, 4.2, { c: 'silver', g: 1, n: 'Rosca interna' }),
          tube(18, 1.6, 4.6, 0, 0, 0, { c: 'silver', g: 2, n: 'Arruela (Tubo)' }),
          cyl(12, 12, 8, 32, 0, 0, { c: 'gray', g: 3, n: 'Corpo da borboleta' }), hcyl(8.4, 8.4, 10, 32, 0, -1, { g: 3, n: 'Furo' }),
          wedge(10, 2.5, 14, 32 + 10, 0, 0, { c: 'gray', g: 3, r: [0, 0, 180], n: 'Aba (Cunha)' }), wedge(10, 2.5, 14, 32 - 10, 0, 0, { c: 'gray', g: 3, n: 'Aba espelhada' })]
      },
      {
        id: 37, nome: 'Par de aparadores de livros', diff: 3,
        obj: 'Usar Espelhar para gerar a versão esquerda e direita de uma peça assimétrica, mantendo as duas idênticas.',
        novo: { titulo: 'Espelhar (M)', texto: 'Selecione a peça e aperte M: aparecem setas nos três eixos. Clicar na seta de X inverte a peça da esquerda para a direita. Diferente de girar 180°, espelhar troca a "mão" da peça: é assim que se faz o par esquerdo/direito de sapatos, orelhas, faróis ou aparadores.' },
        desc: 'Dois aparadores de livros, um de cada lado de uma fileira de livros. Cada um tem base, placa vertical com recorte redondo decorativo e dois reforços triangulares do lado de fora. O da esquerda é o espelho exato do da direita.',
        req: ['Aparador com base de 20 × 30 × 2 mm e placa vertical de 3 × 30 × 50 mm.', 'Recorte redondo Ø 14 atravessando a placa.', 'Dois reforços (Cunha) do lado de fora, com a parte alta junto à placa.', 'Segundo aparador criado com Espelhar (M), não reconstruído.', 'Fileira de livros entre os dois, encostada nas placas.'],
        formas: ['box', 'wedge', 'cylh'], tools: ['espelhar', 'copiar', 'agrupar', 'alinhar', 'furo'],
        skills: ['Peças espelhadas', 'Assimetria controlada', 'Composição em par'],
        dicas: [
          'Construa e agrupe um aparador completo. O outro é uma cópia virada "como num espelho". Girar 180° deixaria os reforços do lado errado.',
          'Caixas, Cunhas e Cilindro furo para um aparador. Ctrl+C / Ctrl+V e depois M + seta do eixo X.',
          ['Base: Caixa 20 × 30 × 2. Placa: Caixa 3 × 30 × 50 na borda interna da base.', 'Recorte: Cilindro furo Ø 14 girado 90° em Y atravessando a placa, centro a 34 mm de altura.', 'Reforços: Cunhas 18 × 3 × 30 sobre a base, do lado de fora da placa, com a parte alta encostada nela, uma em cada ponta.', 'Agrupe o aparador. Copie, cole e aperte M; clique na seta de X.', 'Afaste os dois e coloque entre eles livros (Caixas de cores variadas) encostados nas placas.']
        ],
        crit: ['Aparadores idênticos e espelhados.', 'Reforços do lado de fora nos dois.', 'Recortes alinhados.', 'Livros encostados nas placas.'],
        model: () => {
          const one = (s, g) => [box(20, 30, 2, s * 30.5, 0, 0, { c: 'teal', g, n: 'Base' }), box(3, 30, 50, s * 22, 0, 0, { c: 'teal', g, n: 'Placa vertical' }), hcyl(14, 14, 10, s * 22, 0, 0, { g, r: [0, 90, 0], cz: 34, n: 'Recorte' }),
            wedge(18, 3, 30, s * 32.5, -12, 2, { c: 'teal', g, r: [0, 0, s > 0 ? 0 : 180], n: 'Reforço (Cunha)' }), wedge(18, 3, 30, s * 32.5, 12, 2, { c: 'teal', g, r: [0, 0, s > 0 ? 0 : 180], n: 'Reforço (Cunha)' })];
          const o = one(1, 1).concat(one(-1, 2));
          const cols = ['red', 'navy', 'yellow', 'green', 'orange', 'purple', 'blue', 'pink'];
          let x = -20.5;
          [5, 4, 6, 5, 4, 5, 6, 4].forEach((w, i) => { o.push(box(w, 24, 30 + ((i * 5) % 12), x + w / 2, 0, 0, { c: cols[i], g: 3, n: 'Livro' })); x += w + 0.2; });
          return o;
        }
      },
      {
        id: 38, nome: 'Dobradiça de encaixe', diff: 4,
        obj: 'Projetar peças encaixáveis que trabalham juntas: dobradiça com nós alternados, pino e folgas, usando alinhamento e duplicação.',
        desc: 'Uma dobradiça aberta a 180°: duas folhas com furos escareados para parafusos e cinco nós cilíndricos alternados (três de uma folha e dois da outra) com pequenas folgas, atravessados por um pino.',
        req: ['Duas folhas de 28 × 40 × 3 mm com três furos escareados cada.', 'Cinco nós (Cilindros deitados de Ø 8) alternando entre as folhas: 3 numa, 2 na outra.', 'Folga de 0,5 mm entre nós vizinhos.', 'Furo Ø 3,4 atravessando todos os nós e pino de Ø 3 passando por ele.', 'Cada folha agrupada com seus nós; o pino separado.'],
        formas: ['box', 'cyl', 'cylh', 'cone'], tools: ['alinhar', 'duplicar', 'furo', 'agrupar', 'grade'],
        skills: ['Peças intercaladas', 'Folga axial', 'Eixo comum'],
        dicas: [
          'Os nós dividem o comprimento da dobradiça em 5 partes iguais menos as folgas. Todos os nós e o pino compartilham o mesmo eixo.',
          'Caixas para as folhas, Cilindros deitados (90° em X) para os nós e o pino, Cilindro furo para o canal do pino, Cilindro + Cone furo para os escareados.',
          ['Folha A: Caixa 28 × 40 × 3 à esquerda do eixo. Folha B: igual, à direita.', 'Nó: Cilindro 8 × 8 × 7,6 girado 90° em X, centro do eixo a 4 mm de altura. Ctrl+D movendo 8,1 mm em Y (7,6 + 0,5) até ter 5 nós.', 'Agrupe os nós 1, 3 e 5 com a folha A e os nós 2 e 4 com a folha B, cada grupo com seu Cilindro furo Ø 3,4 ao longo do eixo.', 'Escareados: em cada folha, três Cilindros furo Ø 3 + Cones furo invertidos Ø 6.', 'Pino: Cilindro 3 × 3 × 42 deitado, no eixo. Alinhe pino e nós pelo centro em X e Z.']
        ],
        crit: ['Nós alternados e com folgas iguais.', 'Pino e furos no mesmo eixo.', 'Escareados corretos nas duas folhas.', 'Grupos corretos para funcionar.'],
        model: () => {
          const o = [box(28, 40, 3, -18, 0, 0, { c: 'yellow', g: 1, n: 'Folha A' }), box(28, 40, 3, 18, 0, 0, { c: 'orange', g: 2, n: 'Folha B' })];
          for (let i = 0; i < 5; i++) { const g = i % 2 ? 2 : 1; const y = -16.2 + i * 8.1; o.push(cyl(8, 8, 7.6, 0, y, 0, { c: g === 1 ? 'yellow' : 'orange', g, r: [90, 0, 0], cz: 4, n: 'Nó' })); }
          o.push(hcyl(3.4, 3.4, 44, 0, 0, 0, { g: 1, r: [90, 0, 0], cz: 4, n: 'Canal do pino' }), hcyl(3.4, 3.4, 44, 0, 0, 0, { g: 2, r: [90, 0, 0], cz: 4, n: 'Canal do pino' }));
          [-1, 1].forEach((s) => [-12, 0, 12].forEach((y) => { const g = s < 0 ? 1 : 2; o.push(hcyl(3, 3, 6, s * 20, y, -1, { g, n: 'Furo' }), cone(6, 6, 3, s * 20, y, 0.01, { hole: true, g, r: [180, 0, 0], n: 'Escareado' })); }));
          o.push(cyl(3, 3, 42, 0, 0, 0, { c: 'silver', g: 3, r: [90, 0, 0], cz: 4, n: 'Pino' }));
          return o;
        }
      },
      {
        id: 39, nome: 'Ventilador de mesa', diff: 4,
        obj: 'Fazer rotações precisas em dois eixos: girar pás em torno do cubo a cada 120° e inclinar cada pá 25° em torno do próprio comprimento.',
        novo: { titulo: 'Rotação em dois eixos', texto: 'A ordem importa. Primeiro incline a pá em torno do comprimento dela (o "passo" da hélice), com a pá ainda deitada no lugar de partida. Depois agrupe-a com um ajudante simétrico e gire o conjunto em torno do centro do cubo. Digite os ângulos para não depender do olho.' },
        desc: 'Um ventilador de mesa: base redonda, haste, carcaça do motor deitada, cubo central, três pás inclinadas distribuídas a cada 120° e dois aros de proteção na frente e atrás das pás.',
        req: ['Base Ø 50 mm, haste vertical e motor (Cilindro deitado) no topo.', 'Três pás iguais distribuídas a 120° em torno do cubo.', 'Cada pá inclinada 25° em torno do próprio comprimento, todas no mesmo sentido.', 'Dois aros (Toroide em pé) protegendo as pás.', 'Conjunto centralizado no eixo do motor.'],
        formas: ['cyl', 'box', 'torus', 'sphere'], tools: ['rotacionar', 'duplicar', 'alinhar', 'agrupar'],
        skills: ['Rotação composta', 'Distribuição a 120°', 'Eixo horizontal'],
        dicas: [
          'Uma hélice é simétrica por rotação: o que vale para uma pá vale para as outras, só muda o ângulo em torno do eixo. 360° ÷ 3 = 120°.',
          'Caixa fina para a pá, Cilindros deitados (90° em X) para motor e cubo, Toroides em pé para os aros. Ctrl+D com rotação de 120° no eixo do motor.',
          ['Base: Cilindro 50 × 50 × 6. Haste: Cilindro 8 × 8 × 50. Motor: Cilindro 20 × 20 × 24 girado 90° em X, centro a 70 mm.', 'Cubo: Cilindro 12 × 12 × 6 girado 90° em X, na frente do motor.', 'Pá: Caixa 24 × 1,5 × 10, apontando para cima a partir do cubo. Gire 25° em torno do seu comprimento.', 'Agrupe a pá com uma cópia invisível (furo) do outro lado do cubo, para o centro do grupo coincidir com o eixo. Ctrl+D e gire 120° em Y; Ctrl+D de novo.', 'Aros: Toroides Ø 66 com tubo 2,5, girados 90° em X, na frente e atrás das pás. Alinhe tudo pelo eixo.']
        ],
        crit: ['Pás a 120° exatos.', 'Inclinação igual nas três pás.', 'Aros e cubo no mesmo eixo.', 'Ventilador estável e proporcional.'],
        model: () => {
          const H = 70, o = [cyl(50, 50, 6, 0, 0, 0, { c: 'dark', n: 'Base' }), cyl(8, 8, 50, 0, 6, 6, { c: 'silver', n: 'Haste' }), cyl(20, 20, 24, 0, 10, 0, { c: 'dark', r: [90, 0, 0], cz: H, n: 'Motor' }), cyl(12, 12, 6, 0, -4, 0, { c: 'sky', r: [90, 0, 0], cz: H, n: 'Cubo' })];
          for (let k = 0; k < 3; k++) { const a = 90 + k * 120, rad = (a * Math.PI) / 180; o.push(box(24, 1.5, 10, 17 * Math.cos(rad), -6, 0, { c: 'sky', r: [25, -a, 0], ro: 'YXZ', cz: H + 17 * Math.sin(rad), n: 'Pá' })); }
          o.push(torus(66, 2.5, 0, -11, 0, { c: 'silver', r: [90, 0, 0], cz: H, n: 'Aro dianteiro' }), torus(66, 2.5, 0, 0, 0, { c: 'silver', r: [90, 0, 0], cz: H, n: 'Aro traseiro' }), sphere(6, 6, 6, 0, -9, H - 3, { c: 'silver', n: 'Ponta do eixo' }));
          return o;
        }
      },
      {
        id: 40, nome: 'Ponte treliçada', diff: 4,
        obj: 'Desafio do módulo: construir uma estrutura simétrica combinando duplicação, espelhamento, rotação de 45°, alinhamento e grupos.',
        desc: 'Uma ponte sobre um rio: tabuleiro apoiado em dois pilares nas margens, duas treliças laterais iguais (banzo superior, banzo inferior, montantes verticais a cada 20 mm e diagonais a 45° espelhadas a partir do centro) e vigas transversais no alto ligando as treliças.',
        req: ['Tabuleiro de 160 × 30 mm apoiado em dois pilares.', 'Treliça com banzos superior e inferior, montantes a cada 20 mm (Ctrl+D).', 'Diagonais a 45°, espelhadas a partir do centro da ponte (simetria).', 'Segunda treliça idêntica do outro lado, feita por cópia ou espelhamento.', 'Vigas transversais no topo, igualmente espaçadas.', 'Rio e margens sob a ponte.'],
        formas: ['box'], tools: ['duplicar', 'espelhar', 'rotacionar', 'alinhar', 'agrupar', 'regua'],
        skills: ['Estrutura simétrica', 'Planejamento modular', 'Precisão acumulada'],
        dicas: [
          'Construa só metade de uma treliça. A outra metade é o espelho dela, e a outra treliça é uma cópia. Planejar a simetria economiza 75% do trabalho.',
          'Só Caixas. Montantes com Ctrl+D (20 mm), diagonais com rotação de 45° em Y, Espelhar (M) em X para a outra metade, cópia em Y para a outra treliça.',
          ['Rio: Caixa 200 × 60 × 1 azul. Margens: Caixas 30 × 60 × 20 nas pontas. Pilares: Caixas 10 × 36 × 20.', 'Tabuleiro: Caixa 160 × 30 × 3 elevado a 20.', 'Banzo inferior: Caixa 140 × 3 × 3 na borda do tabuleiro, elevação 23. Banzo superior: igual, elevação 43.', 'Montante: Caixa 3 × 3 × 20 na ponta; Ctrl+D a cada 20 mm até a outra ponta.', 'Diagonal: Caixa 3 × 3 × 28,3 girada 45° em Y dentro do primeiro painel; Ctrl+D andando 20 mm até o centro. Agrupe essa metade e espelhe em X para o outro lado.', 'Agrupe a treliça, copie para o outro lado do tabuleiro e coloque vigas 3 × 30 × 3 no topo a cada 40 mm.']
        ],
        crit: ['Simetria perfeita em relação ao centro.', 'Montantes e diagonais regulares.', 'Treliças idênticas e paralelas.', 'Estrutura apoiada e completa.'],
        model: () => {
          const o = [box(200, 60, 1, 0, 0, 0, { c: 'sky', n: 'Rio' }), box(30, 60, 20, -85, 0, 0, { c: 'green', n: 'Margem' }), box(30, 60, 20, 85, 0, 0, { c: 'green', n: 'Margem' }),
            box(160, 30, 3, 0, 0, 20, { c: 'gray', n: 'Tabuleiro' })];
          [-13.5, 13.5].forEach((y) => {
            o.push(box(140, 3, 3, 0, y, 23, { c: 'red', n: 'Banzo inferior' }), box(140, 3, 3, 0, y, 43, { c: 'red', n: 'Banzo superior' }));
            for (let i = 0; i <= 7; i++) o.push(box(3, 3, 20, -70 + i * 20, y, 23, { c: 'red', n: 'Montante' }));
            for (let i = 0; i < 7; i++) { const xc = -60 + i * 20; (xc === 0 ? [45, -45] : [xc < 0 ? 45 : -45]).forEach((ang) => o.push(box(3, 3, 28.3, xc, y, 0, { c: 'orange', r: [0, ang, 0], cz: 34.5, n: 'Diagonal 45°' }))); }
          });
          for (let i = 0; i < 4; i++) o.push(box(3, 30, 3, -60 + i * 40, 0, 46, { c: 'red', n: 'Viga transversal' }));
          return o;
        }
      }
    ]
  });
})();
