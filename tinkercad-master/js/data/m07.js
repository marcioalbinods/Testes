/* Módulo 7 — Arquitetura e ambientes (fases 61–70) */
(function () {
  const { box, cyl, sphere, cone, torus, tube, poly, wedge, roof, rroof, hemi, pyr, hbox, hcyl, bar, wheel } = TM.S;
  /* barra no plano Y-Z (corrimão que sobe em Y) */
  const barY = (y1, z1, y2, z2, x, d, o) => {
    const dy = y2 - y1, dz = z2 - z1, L = Math.hypot(dy, dz), th = (-Math.atan2(dy, dz) * 180) / Math.PI;
    return cyl(d, d, L, x, (y1 + y2) / 2, 0, Object.assign({}, o, { r: [th, 0, 0], cz: (z1 + z2) / 2 }));
  };
  TM.S.barY = barY;
  /* árvore simples reaproveitada nas cenas */
  const tree = (x, y, z, s, g) => [cyl(4 * s, 4 * s, 16 * s, x, y, z, { c: 'brown', g, n: 'Tronco' }), sphere(22 * s, 22 * s, 22 * s, x, y, z + 13 * s, { c: 'green', g, n: 'Copa' })];
  TM.S.tree = tree;
  /* janela com moldura (moldura com furo + vidro) na fachada frontal (normal −Y) */
  const win = (x, y, z, w, h, g) => [box(w + 4, 3, h + 4, x, y, z - 2, { c: 'white', g, n: 'Moldura' }), hbox(w, 6, h, x, y, z, { g, n: 'Vão da moldura' }), box(w, 1, h, x, y + 0.5, z, { c: 'glass', g: g + 100, n: 'Vidro' })];
  TM.S.win = win;

  TM.addModule({
    n: 7, cor: '#c98b4e', titulo: 'Arquitetura e ambientes',
    resumo: 'Escala de arquitetura, paredes, aberturas, telhados, escadas e ambientes mobiliados completos.',
    phases: [
      {
        id: 61, nome: 'Casa com telhado de quatro águas', diff: 3,
        obj: 'Trabalhar em escala de arquitetura (1:50) e criar um telhado de quatro águas com Pirâmide esticada, e uma varanda com telhado de uma água.',
        novo: { titulo: 'Escala 1:50', texto: 'Em arquitetura é comum a escala 1:50: 1 metro real vira 20 mm. Uma casa de 8 × 5 m vira 160 × 100 mm; um pé-direito de 2,8 m vira 56 mm; uma porta de 2,1 m vira 42 mm. Pense sempre em metros reais e converta.' },
        desc: 'Uma casa térrea de 8 × 5 m em escala 1:50: paredes ocas, telhado de quatro águas em pirâmide com beiral, varanda frontal com piso, quatro colunas e telhado de uma água (Cunha), porta, janelas e chaminé.',
        req: ['Paredes de 160 × 100 × 56 mm (8 × 5 × 2,8 m em 1:50), ocas.', 'Telhado de quatro águas: Pirâmide esticada com beiral de 8 mm.', 'Varanda com piso, quatro colunas cilíndricas e telhado de uma água (Cunha).', 'Porta e duas janelas recortadas na fachada.', 'Chaminé saindo do telhado.'],
        formas: ['box', 'boxh', 'pyr', 'wedge', 'cyl'], tools: ['furo', 'dimensionar', 'alinhar', 'duplicar', 'agrupar'],
        skills: ['Escala de arquitetura', 'Telhado de quatro águas', 'Varanda e colunata'],
        dicas: [
          'Converta tudo para metros antes de modelar: a casa tem 8 × 5 m, o beiral 0,4 m, as colunas 2,6 m. Depois multiplique por 20.',
          'Caixa + Caixa furo para paredes; Caixas furo para porta e janelas; Pirâmide esticada para o telhado; Caixa (piso), Cilindros (colunas) e Cunha (telhado da varanda).',
          ['Paredes: Caixa 160 × 100 × 56 e Caixa furo 152 × 92 elevada a 3.', 'Porta: Caixa furo 20 × 10 × 42 no centro da fachada. Janelas: Caixas furo 28 × 10 × 24 elevadas a 18, a 50 mm do centro.', 'Telhado: Pirâmide 176 × 116 × 44 elevada a 56.', 'Varanda: piso Caixa 120 × 30 × 3 na frente; colunas Cilindros 4 × 4 × 50 (Ctrl+D a cada 36 mm); telhado: Cunha 124 × 32 × 8 girada para a água cair para a frente, apoiada nas colunas.', 'Chaminé: Caixa 12 × 12 × 40 atravessando o telhado.']
        ],
        crit: ['Medidas coerentes com a escala.', 'Telhado com beiral e quatro águas.', 'Varanda apoiada e simétrica.', 'Aberturas na fachada.'],
        model: () => {
          const o = [box(160, 100, 56, 0, 0, 0, { c: 'cream', n: 'Paredes' }), hbox(152, 92, 56, 0, 0, 3, { n: 'Interior' }), hbox(20, 10, 42, 0, -50, 3, { n: 'Porta' }), hbox(28, 10, 24, -50, -50, 18, { n: 'Janela' }), hbox(28, 10, 24, 50, -50, 18, { n: 'Janela' }),
            pyr(176, 116, 44, 0, 0, 56, { c: 'red', g: 1, n: 'Telhado 4 águas (Pirâmide)' }), box(12, 12, 40, 40, 18, 50, { c: 'brown', g: 1, n: 'Chaminé' }),
            box(120, 30, 3, 0, -65, 0, { c: 'gray', g: 2, n: 'Piso da varanda' }), wedge(32, 124, 8, 0, -66, 50, { c: 'brown', g: 2, r: [0, 0, 90], n: 'Telhado de uma água (Cunha)' })];
          for (let i = 0; i < 4; i++) o.push(cyl(4, 4, 47, -54 + i * 36, -76, 3, { c: 'white', g: 2, n: 'Coluna' }));
          return o;
        }
      },
      {
        id: 62, nome: 'Casa com portas e janelas', diff: 4,
        obj: 'Detalhar aberturas arquitetônicas: janelas com moldura, vidro e peitoril; porta entreaberta girada no eixo da dobradiça.',
        desc: 'Uma casa com telhado de duas águas, porta de entrada entreaberta (girada 60° em torno da dobradiça), janelas com moldura branca, vidro e peitoril na fachada e na lateral, escada de entrada com dois degraus e luminária ao lado da porta.',
        req: ['Paredes ocas de 140 × 90 × 60 mm com telhado de duas águas e beiral.', 'Porta entreaberta: folha girada cerca de 60° com a borda presa no batente.', 'Pelo menos três janelas com moldura, vidro e peitoril.', 'Escada de dois degraus na entrada.', 'Luminária de parede ao lado da porta.'],
        formas: ['box', 'boxh', 'roof', 'cyl', 'sphere'], tools: ['furo', 'rotacionar', 'duplicar', 'agrupar', 'alinhar'],
        skills: ['Esquadrias', 'Rotação em torno de um eixo deslocado', 'Composição de fachada'],
        dicas: [
          'Para girar a porta em torno da dobradiça, e não do centro, gire primeiro e depois mova a folha até a borda tocar o batente.',
          'Caixas e Caixas furo para paredes e aberturas; molduras com Caixa + Caixa furo; vidro em Caixa fina; Telhado; Cilindro e Esfera para a luminária.',
          ['Paredes: Caixa 140 × 90 × 60, Caixa furo 134 × 84 elevada a 3.', 'Porta: Caixa furo 22 × 10 × 44 na fachada. Folha: Caixa 22 × 2 × 43, gire 60° em Z e encoste a borda no lado da dobradiça.', 'Janela: moldura (Caixa 32 × 3 × 28 + Caixa furo 28 × 6 × 24), vidro e peitoril. Agrupe e copie para as outras posições.', 'Furos das janelas nas paredes, alinhados com as molduras.', 'Telhado 150 × 100 × 34. Degraus: Caixas 34 × 8 × 3 e 34 × 4 × 6.', 'Luminária: Cilindro pequeno deitado + Esfera amarela.']
        ],
        crit: ['Porta girada no eixo certo.', 'Janelas completas e alinhadas.', 'Telhado com beiral.', 'Detalhes da entrada.'],
        model: () => {
          const o = [box(140, 90, 60, 0, 0, 0, { c: 'sand', n: 'Paredes' }), hbox(134, 84, 60, 0, 0, 3, { n: 'Interior' }), hbox(22, 10, 44, 0, -45, 3, { n: 'Vão da porta' }),
            hbox(28, 10, 24, -42, -45, 22, { n: 'Vão da janela' }), hbox(28, 10, 24, 42, -45, 22, { n: 'Vão da janela' }), hbox(10, 28, 24, 70, 10, 22, { n: 'Vão lateral' }),
            roof(150, 100, 34, 0, 0, 60, { c: 'brown', g: 1, n: 'Telhado' }),
            box(22, 2, 43, 11 - 11 * Math.cos(Math.PI / 3), -46 - 11 * Math.sin(Math.PI / 3), 3, { c: 'red', g: 2, r: [0, 0, -60], n: 'Porta entreaberta' }),
            box(34, 8, 3, 0, -49, 0, { c: 'gray', g: 3, n: 'Degrau' }), box(34, 4, 6, 0, -47, 0, { c: 'gray', g: 3, n: 'Degrau' }), cyl(3, 3, 5, 18, -46, 0, { c: 'dark', g: 3, r: [90, 0, 0], cz: 40, n: 'Luminária' }), sphere(5, 5, 5, 18, -49, 37.5, { c: 'yellow', g: 3, n: 'Lâmpada' })];
          [-42, 42].forEach((x, i) => o.push(...win(x, -45.5, 22, 28, 24, 10 + i), box(34, 5, 2, x, -47, 19, { c: 'white', g: 20, n: 'Peitoril' })));
          o.push(box(3, 32, 28, 70.5, 10, 20, { c: 'white', g: 30, n: 'Moldura' }), hbox(6, 28, 24, 70.5, 10, 22, { g: 30, n: 'Vão da moldura' }), box(1, 28, 24, 70, 10, 22, { c: 'glass', g: 31, n: 'Vidro' }));
          return o;
        }
      },
      {
        id: 63, nome: 'Prédio residencial', diff: 4,
        obj: 'Repetir andares e janelas em grade (Ctrl+D em Z e em X) e organizar a construção por pavimentos.',
        desc: 'Um prédio de seis andares: térreo com portaria envidraçada e marquise, cinco andares-tipo com janelas em grade e sacadas, lajes marcando cada pavimento, e cobertura com caixa d’água, casa de máquinas e antena.',
        req: ['Bloco de 100 × 70 mm com seis pavimentos de 30 mm.', 'Lajes salientes marcando cada andar (Ctrl+D em Z).', 'Grade de janelas (furos rasos) com pelo menos 4 colunas × 5 andares.', 'Sacadas em pelo menos uma coluna.', 'Térreo com portaria de vidro e marquise.', 'Cobertura com caixa d’água, casa de máquinas e antena.'],
        formas: ['box', 'boxh', 'cyl'], tools: ['duplicar', 'furo', 'alinhar', 'agrupar', 'regua'],
        skills: ['Andar-tipo', 'Repetição em grade', 'Hierarquia de pavimentos'],
        dicas: [
          'Construa um andar-tipo completo (janelas + laje + sacada) e repita. O térreo e a cobertura são diferentes e vêm depois.',
          'Caixa para o bloco; Caixas furo para janelas (Ctrl+D em X, depois copiar a linha em Z); Caixas finas para lajes e sacadas; Cilindros na cobertura.',
          ['Bloco: Caixa 100 × 70 × 180.', 'Janela: Caixa furo 12 × 6 × 16 na fachada (2 mm de profundidade), primeiro andar. Ctrl+D a cada 22 mm em X (4 janelas).', 'Selecione a linha e Ctrl+D subindo 30 mm (5 andares). Agrupe com o bloco.', 'Lajes: Caixa 104 × 74 × 2 a cada 30 mm. Sacadas: Caixa 18 × 8 × 2 + guarda-corpo fino, numa coluna.', 'Térreo: Caixa furo grande + vidro; marquise Caixa 50 × 14 × 2.', 'Cobertura: caixa d’água (Cilindro), casa de máquinas (Caixa), antena (Cilindro fino).']
        ],
        crit: ['Andares iguais e alinhados.', 'Grade de janelas regular.', 'Térreo e cobertura diferenciados.', 'Prédio proporcional.'],
        model: () => {
          const o = [box(100, 70, 180, 0, 0, 0, { c: 'cream', n: 'Bloco' }), hbox(40, 6, 22, 0, -35, 0, { n: 'Portaria' }), box(40, 1, 22, 0, -33.5, 0, { c: 'glass', g: 1, n: 'Vidro da portaria' }), box(50, 14, 2, 0, -41, 24, { c: 'dark', g: 1, n: 'Marquise' })];
          for (let f = 1; f < 6; f++) {
            for (let c = 0; c < 4; c++) o.push(hbox(12, 6, 16, -33 + c * 22, -35, f * 30 + 8, { n: 'Janela' }));
            o.push(box(104, 74, 2, 0, 0, f * 30, { c: 'white', g: 2, n: 'Laje' }), box(18, 8, 2, 33, -39, f * 30 + 2, { c: 'white', g: 2, n: 'Sacada' }), box(18, 1, 7, 33, -42.5, f * 30 + 4, { c: 'glass', g: 3, n: 'Guarda-corpo' }));
          }
          o.push(box(30, 24, 16, -20, 10, 180, { c: 'gray', g: 4, n: 'Casa de máquinas' }), cyl(22, 22, 18, 25, 10, 180, { c: 'sky', g: 4, n: 'Caixa d’água' }), cyl(1.5, 1.5, 30, -30, 15, 196, { c: 'dark', g: 4, n: 'Antena' }));
          return o;
        }
      },
      {
        id: 64, nome: 'Garagem com portão', diff: 4,
        obj: 'Projetar uma garagem para um carro real em escala, com portão de enrolar parcialmente aberto feito de réguas repetidas e rampa de acesso.',
        desc: 'Uma garagem em escala 1:50 para um carro: volume oco com telhado de duas águas, portão de enrolar meio aberto (réguas horizontais empilhadas e o rolo no alto), rampa de acesso, porta lateral de serviço, luminária e um carro estacionado na rampa.',
        req: ['Garagem com vão livre para um carro (pelo menos 3 × 5,5 m reais = 60 × 110 mm).', 'Portão de enrolar com réguas repetidas (Ctrl+D) e caixa do rolo.', 'Portão parcialmente aberto, mostrando o interior.', 'Rampa de acesso com Cunha.', 'Porta lateral e luminária.', 'Carro simplificado na mesma escala.'],
        formas: ['box', 'boxh', 'roof', 'wedge', 'cyl'], tools: ['duplicar', 'furo', 'agrupar', 'regua', 'alinhar'],
        skills: ['Dimensionar pelo uso', 'Elementos móveis', 'Compatibilidade de escala'],
        dicas: [
          'O tamanho da garagem nasce do carro: comprimento do carro + espaço para circular. Em 1:50, um carro de 4 m tem 80 mm.',
          'Caixa + Caixa furo; Caixa furo do vão do portão; Caixas finas para as réguas (Ctrl+D em Z); Cilindro deitado para o rolo; Cunha para a rampa; Telhado.',
          ['Garagem: Caixa 80 × 130 × 54 e Caixa furo 74 × 124 × 54 elevada a 3.', 'Vão do portão: Caixa furo 64 × 10 × 46 na frente.', 'Réguas: Caixa 66 × 2 × 4; Ctrl+D subindo 4 mm até cobrir só a metade de cima do vão.', 'Rolo: Cilindro 8 × 8 × 70 deitado em X no alto do vão.', 'Rampa: Cunha 64 × 30 × 3 com a parte alta encostada no piso.', 'Telhado 88 × 138 × 26; porta lateral (furo + folha); carro: Caixas + rodas na escala.']
        ],
        crit: ['Vão adequado ao carro.', 'Réguas regulares e portão coerente.', 'Rampa e porta lateral.', 'Escala consistente.'],
        model: () => {
          const o = [box(80, 130, 54, 0, 20, 0, { c: 'white', n: 'Garagem' }), hbox(74, 124, 54, 0, 20, 3, { n: 'Interior' }), hbox(64, 10, 46, 0, -45, 3, { n: 'Vão do portão' }), hbox(10, 18, 40, 40, 30, 3, { n: 'Porta lateral' }),
            roof(88, 138, 26, 0, 20, 54, { c: 'gray', g: 1, n: 'Telhado' }), cyl(8, 8, 70, 0, -47, 0, { c: 'silver', g: 2, r: [0, 90, 0], cz: 50, n: 'Rolo do portão' }),
            wedge(30, 64, 3, 0, -60, 0, { c: 'gray', g: 3, r: [0, 0, 90], n: 'Rampa (Cunha)' }), box(2, 18, 40, 41, 30, 3, { c: 'brown', g: 4, n: 'Porta de serviço' }), box(6, 3, 3, 26, -46.5, 50, { c: 'yellow', g: 4, n: 'Luminária' })];
          for (let i = 0; i < 6; i++) o.push(box(66, 2, 4, 0, -46, 26 + i * 4, { c: 'silver', g: 2, n: 'Régua do portão' }));
          o.push(box(36, 80, 12, 0, -10, 4, { c: 'blue', g: 5, n: 'Carro' }), box(32, 40, 10, 0, -6, 16, { c: 'blue', g: 5, n: 'Cabine do carro' }));
          [[-15, -36], [15, -36], [-15, 16], [15, 16]].forEach(([x, y], i) => o.push(cyl(14, 14, 6, x, y, 0, { c: 'black', g: 6, r: [0, 90, 0], cz: 7, n: 'Roda' })));
          return o;
        }
      },
      {
        id: 65, nome: 'Escada em L com patamar', diff: 4,
        obj: 'Usar Ctrl+D com duas transformações ao mesmo tempo (avançar e subir) e girar um lance inteiro 90° em torno do patamar.',
        desc: 'Uma escada maciça em L: primeiro lance de oito degraus subindo para a direita, patamar quadrado, segundo lance de oito degraus virando 90° para o fundo, e corrimãos inclinados apoiados em balaústres que acompanham os dois lances.',
        req: ['Degraus com 12 mm de piso (avanço) e 8 mm de espelho (altura).', 'Oito degraus em cada lance, feitos com Ctrl+D.', 'Patamar com a altura do 9º degrau.', 'Segundo lance girado 90° em relação ao primeiro.', 'Corrimãos inclinados na mesma inclinação dos degraus, com balaústres.'],
        formas: ['box', 'cyl'], tools: ['duplicar', 'rotacionar', 'alinhar', 'regua', 'agrupar'],
        skills: ['Transformação dupla', 'Inclinação constante', 'Mudança de direção'],
        dicas: [
          'Cada degrau é o anterior movido 12 mm para a frente e 8 mm para cima. A inclinação do corrimão é a mesma da escada: espelho ÷ piso.',
          'Caixas para degraus e patamar; Ctrl+D com movimento em X e elevação ao mesmo tempo; Cilindros finos para balaústres e corrimão (girados).',
          ['Primeiro degrau: Caixa 12 × 40 × 8.', 'Ctrl+D: mova a cópia 12 mm em X e aumente a altura para 16 (ou eleve 8 e mantenha degrau maciço). Ctrl+D até 8 degraus.', 'Patamar: Caixa 40 × 40 × 72 encostado no último degrau.', 'Segundo lance: construa igual ao primeiro, agrupe, gire 90° em Z e encoste no lado do patamar, começando na altura 72.', 'Balaústres: Cilindros 2 × 2 × 30 sobre os degraus da borda (Ctrl+D). Corrimão: Cilindro fino girado com a mesma inclinação (cerca de 34°).']
        ],
        crit: ['Degraus iguais nos dois lances.', 'Patamar na altura correta.', 'Giro de 90° bem encaixado.', 'Corrimão paralelo aos degraus.'],
        model: () => {
          const o = [];
          for (let i = 0; i < 8; i++) o.push(box(12, 40, 8 * (i + 1), i * 12, 0, 0, { c: 'sand', n: 'Degrau (lance 1)' }));
          o.push(box(40, 40, 72, 110, 0, 0, { c: 'cream', n: 'Patamar' }));
          for (let j = 0; j < 8; j++) o.push(box(40, 12, 72 + 8 * (j + 1), 110, 26 + 12 * j, 0, { c: 'sand', n: 'Degrau (lance 2)' }));
          for (let i = 0; i < 8; i++) o.push(cyl(2, 2, 28, i * 12, -18, 8 * (i + 1), { c: 'dark', g: 1, n: 'Balaústre' }));
          o.push(bar(-6, 8 + 28, 90, 64 + 28, -18, 2.4, { c: 'wood', g: 1, n: 'Corrimão' }));
          for (let j = 0; j < 8; j++) o.push(cyl(2, 2, 28, 128, 26 + 12 * j, 72 + 8 * (j + 1), { c: 'dark', g: 2, n: 'Balaústre' }));
          o.push(barY(20, 72 + 28, 116, 136 + 28, 128, 2.4, { c: 'wood', g: 2, n: 'Corrimão' }));
          return o;
        }
      },
      {
        id: 66, nome: 'Quarto mobiliado', diff: 4,
        obj: 'Compor um ambiente interno em escala 1:25 com mobiliário proporcional, circulação livre e paredes em corte.',
        desc: 'Um quarto em corte (piso e duas paredes): cama de casal com cabeceira, colchão, travesseiros e manta; dois criados-mudos com abajur; guarda-roupa de duas portas com puxadores; escrivaninha com cadeira; tapete; janela recortada na parede e prateleira.',
        req: ['Piso de 140 × 120 mm (3,5 × 3 m em 1:25) e duas paredes em corte.', 'Cama de casal (1,9 × 1,4 m = 76 × 56 mm) com cabeceira, colchão e travesseiros.', 'Guarda-roupa, escrivaninha com cadeira e dois criados-mudos.', 'Janela recortada numa parede.', 'Circulação de pelo menos 0,6 m (24 mm) em volta da cama.', 'Cada móvel agrupado separadamente.'],
        formas: ['box', 'boxh', 'cyl', 'cone', 'rroof'], tools: ['furo', 'alinhar', 'agrupar', 'regua', 'ocultar'],
        skills: ['Layout de ambiente', 'Escala de mobiliário', 'Circulação'],
        dicas: [
          'Antes dos móveis, desenhe o "vazio": onde as pessoas andam. Os móveis ocupam o resto. Medidas reais divididas por 25.',
          'Caixas para quase tudo; Telhado redondo para travesseiros; Cilindro + Cone para os abajures; Caixa furo para a janela.',
          ['Piso: Caixa 140 × 120 × 2. Paredes: Caixas 140 × 3 × 100 (fundo) e 3 × 120 × 100 (esquerda). Janela: Caixa furo 40 × 6 × 36 na parede do fundo.', 'Cama: estrado 56 × 76 × 10, colchão 54 × 72 × 8, cabeceira 58 × 4 × 34, travesseiros (Telhado redondo), manta (Caixa fina).', 'Criados-mudos 16 × 16 × 20 com abajur (Cilindro + Cone truncado).', 'Guarda-roupa 60 × 24 × 88 com frisos e puxadores. Escrivaninha 44 × 22 + cadeira.', 'Tapete: Caixa 60 × 40 × 0,6. Confira com a Régua a circulação de 24 mm.']
        ],
        crit: ['Móveis em escala coerente.', 'Circulação livre.', 'Ambiente completo e organizado.', 'Paredes em corte e janela.'],
        model: () => [box(140, 120, 2, 0, 0, 0, { c: 'wood', n: 'Piso' }), box(140, 3, 100, 0, 58.5, 0, { c: 'cream', n: 'Parede do fundo' }), box(3, 120, 100, -68.5, 0, 0, { c: 'cream', n: 'Parede lateral' }), hbox(40, 6, 36, 30, 58.5, 44, { n: 'Janela' }), box(40, 1, 36, 30, 59, 44, { c: 'glass', g: 9, n: 'Vidro' }),
          box(56, 76, 10, -5, 18, 2, { c: 'brown', g: 1, n: 'Estrado' }), box(54, 72, 8, -5, 18, 12, { c: 'white', g: 1, n: 'Colchão' }), box(58, 4, 34, -5, 57, 2, { c: 'brown', g: 1, n: 'Cabeceira' }),
          rroof(22, 12, 6, -18, 48, 20, { c: 'white', g: 1, n: 'Travesseiro' }), rroof(22, 12, 6, 8, 48, 20, { c: 'white', g: 1, n: 'Travesseiro' }), box(56, 44, 2, -5, 0, 19, { c: 'blue', g: 1, n: 'Manta' }),
          box(16, 16, 20, -45, 48, 2, { c: 'brown', g: 2, n: 'Criado-mudo' }), cyl(3, 3, 10, -45, 48, 22, { c: 'dark', g: 2, n: 'Abajur' }), cone(12, 12, 8, -45, 48, 31, { c: 'yellow', g: 2, top: 0.6, n: 'Cúpula' }),
          box(16, 16, 20, 35, 48, 2, { c: 'brown', g: 3, n: 'Criado-mudo' }), cyl(3, 3, 10, 35, 48, 22, { c: 'dark', g: 3, n: 'Abajur' }), cone(12, 12, 8, 35, 48, 31, { c: 'yellow', g: 3, top: 0.6, n: 'Cúpula' }),
          box(24, 60, 88, -55, -28, 2, { c: 'white', g: 4, n: 'Guarda-roupa' }), hbox(2, 1, 84, -42.5, -28, 4, { g: 4, n: 'Friso das portas' }), box(1.5, 2, 10, -42.5, -32, 42, { c: 'silver', g: 5, n: 'Puxador' }), box(1.5, 2, 10, -42.5, -24, 42, { c: 'silver', g: 5, n: 'Puxador' }),
          box(44, 22, 3, 45, -40, 30, { c: 'wood', g: 6, n: 'Tampo da escrivaninha' }), box(3, 22, 28, 25, -40, 2, { c: 'wood', g: 6, n: 'Pé' }), box(3, 22, 28, 65, -40, 2, { c: 'wood', g: 6, n: 'Pé' }),
          box(16, 16, 2, 45, -24, 18, { c: 'red', g: 7, n: 'Assento' }), box(16, 2, 18, 45, -16, 20, { c: 'red', g: 7, n: 'Encosto' }), cyl(2, 2, 16, 45, -24, 2, { c: 'dark', g: 7, n: 'Coluna da cadeira' }),
          box(60, 40, 0.6, 15, -20, 2, { c: 'pink', g: 8, n: 'Tapete' }), box(40, 10, 2, -30, 54, 70, { c: 'brown', g: 8, n: 'Prateleira' })]
      },
      {
        id: 67, nome: 'Sala de aula', diff: 4,
        obj: 'Organizar mobiliário repetido em grade (carteiras e cadeiras) com Ctrl+D em duas direções, respeitando corredores e a frente da sala.',
        desc: 'Uma sala de aula em corte: piso, parede do quadro e parede das janelas; quadro com moldura e calha; mesa do professor com cadeira; nove conjuntos de carteira e cadeira em três fileiras com corredores; porta; três janelas; relógio e armário.',
        req: ['Piso e duas paredes em corte.', 'Quadro na parede da frente, com moldura e calha.', 'Nove conjuntos carteira + cadeira em grade 3 × 3, com corredores iguais.', 'Mesa do professor de frente para a turma.', 'Três janelas recortadas numa parede e uma porta na outra.', 'Relógio e armário.'],
        formas: ['box', 'boxh', 'cyl'], tools: ['duplicar', 'alinhar', 'agrupar', 'furo', 'regua'],
        skills: ['Layout em grade', 'Corredores', 'Repetição de conjuntos'],
        dicas: [
          'Agrupe uma carteira com sua cadeira como um "conjunto" e repita o conjunto, não as peças soltas.',
          'Caixas e Cilindros finos para os móveis; Ctrl+D em X e depois em Y para a grade; Caixas furo para janelas e porta.',
          ['Piso 200 × 160 × 2; parede da frente 200 × 3 × 80; parede lateral 3 × 160 × 80.', 'Quadro: Caixa 90 × 2 × 34 verde com moldura (Caixa + furo) e calha (Caixa fina).', 'Conjunto: tampo 18 × 12 × 2 em 4 pés finos + cadeira (assento, encosto e pés). Agrupe.', 'Ctrl+D a cada 34 mm em X (3 colunas); selecione a fileira e Ctrl+D 34 mm em Y (3 fileiras).', 'Mesa do professor de frente para a turma, perto do quadro. Janelas (furos) na lateral, porta na frente.']
        ],
        crit: ['Grade regular com corredores.', 'Orientação correta dos móveis (todos para o quadro).', 'Elementos de sala completos.', 'Escala consistente.'],
        model: () => {
          const o = [box(200, 160, 2, 0, 0, 0, { c: 'sand', n: 'Piso' }), box(200, 3, 80, 0, 81.5, 0, { c: 'cream', n: 'Parede do quadro' }), box(3, 160, 80, -101.5, 0, 0, { c: 'cream', n: 'Parede das janelas' }),
            box(92, 2, 36, 10, 79, 26, { c: 'white', g: 1, n: 'Moldura do quadro' }), box(88, 1, 32, 10, 78, 28, { c: 'green', g: 1, n: 'Quadro' }), box(88, 4, 1.5, 10, 77, 26, { c: 'silver', g: 1, n: 'Calha' }),
            hbox(18, 8, 40, 80, 81.5, 2, { n: 'Porta' }), box(18, 1, 40, 80, 80, 2, { c: 'brown', g: 9, n: 'Folha da porta' }), cyl(10, 10, 1.5, -40, 79.5, 0, { c: 'white', g: 1, r: [90, 0, 0], cz: 66, n: 'Relógio' }),
            box(40, 20, 3, 10, 52, 24, { c: 'brown', g: 2, n: 'Mesa do professor' }), box(40, 2, 22, 10, 61, 2, { c: 'brown', g: 2, n: 'Painel da mesa' }), box(12, 12, 2, 10, 66, 14, { c: 'dark', g: 2, n: 'Cadeira do professor' }),
            box(14, 30, 50, 90, -60, 2, { c: 'gray', g: 3, n: 'Armário' })];
          [-40, 0, 40].forEach((y) => o.push(hbox(8, 30, 26, -101.5, y, 30, { n: 'Janela' }), box(1, 30, 26, -101, y, 30, { c: 'glass', g: 8, n: 'Vidro' })));
          TM.S.grid(3, 3, 40, 38, -28, -50, (x, y) => [box(20, 13, 2, x, y, 18, { c: 'wood', g: 4, n: 'Carteira' }), box(1.5, 1.5, 16, x - 9, y - 5.5, 2, { c: 'dark', g: 4, n: 'Pé' }), box(1.5, 1.5, 16, x + 9, y - 5.5, 2, { c: 'dark', g: 4, n: 'Pé' }), box(1.5, 1.5, 16, x - 9, y + 5.5, 2, { c: 'dark', g: 4, n: 'Pé' }), box(1.5, 1.5, 16, x + 9, y + 5.5, 2, { c: 'dark', g: 4, n: 'Pé' }),
            box(12, 11, 2, x, y - 14, 11, { c: 'blue', g: 5, n: 'Cadeira' }), box(12, 1.5, 12, x, y - 19.5, 13, { c: 'blue', g: 5, n: 'Encosto' }), box(10, 9, 9, x, y - 14, 2, { c: 'dark', g: 5, n: 'Base da cadeira' })]).forEach((q) => o.push(q));
          return o;
        }
      },
      {
        id: 68, nome: 'Laboratório de informática', diff: 5,
        obj: 'Montar um ambiente técnico com muitos equipamentos repetidos, reaproveitando componentes de fases anteriores e organizando grupos por bancada.',
        desc: 'Um laboratório em corte com duas bancadas longas de quatro estações (monitor, teclado, gabinete e cadeira), mesa do professor com notebook, tela de projeção, projetor no teto, rack de servidores com luzes e ar-condicionado.',
        req: ['Duas bancadas com quatro estações iguais cada (Ctrl+D).', 'Cada estação com monitor, teclado, gabinete e cadeira.', 'Mesa do professor com notebook aberto (tela girada).', 'Tela de projeção e projetor.', 'Rack de servidores com frisos e LEDs.', 'Ar-condicionado e grupos organizados por bancada.'],
        formas: ['box', 'boxh', 'cyl'], tools: ['duplicar', 'copiar', 'agrupar', 'alinhar', 'rotacionar'],
        skills: ['Componentes reutilizáveis', 'Ambiente técnico', 'Organização de grupos'],
        dicas: [
          'Reaproveite: um monitor e um teclado bem feitos viram uma estação; uma estação vira uma bancada; uma bancada vira duas.',
          'Caixas para bancadas e equipamentos; Caixas furo para frisos do rack; Cilindros para LEDs e pés de cadeira; rotação para a tela do notebook.',
          ['Piso 220 × 160 e duas paredes em corte.', 'Bancada: Caixa 170 × 26 × 3 sobre pés, a 30 mm de altura.', 'Estação: monitor 24 × 2 × 16 em pé, teclado 20 × 7 × 1, gabinete 8 × 18 × 18 sob a bancada, cadeira. Agrupe.', 'Ctrl+D a cada 42 mm (4 estações). Copie a bancada inteira para trás.', 'Professor: mesa + notebook (base + tela girada 100°). Tela de projeção e projetor.', 'Rack 30 × 30 × 90 com frisos (Caixa furo, Ctrl+D) e LEDs; ar-condicionado na parede.']
        ],
        crit: ['Estações idênticas e alinhadas.', 'Ambiente completo e funcional.', 'Equipamentos em escala.', 'Grupos bem organizados.'],
        model: () => {
          const o = [box(220, 160, 2, 0, 0, 0, { c: 'gray', n: 'Piso' }), box(220, 3, 90, 0, 81.5, 0, { c: 'white', n: 'Parede' }), box(3, 160, 90, -111.5, 0, 0, { c: 'white', n: 'Parede' }),
            box(90, 1, 50, 20, 79.5, 30, { c: 'white', g: 1, n: 'Tela de projeção' }), box(16, 12, 6, 20, 30, 80, { c: 'dark', g: 1, n: 'Projetor' }), box(50, 12, 14, -60, 76, 68, { c: 'white', g: 1, n: 'Ar-condicionado' }),
            box(30, 30, 90, 90, 60, 2, { c: 'black', g: 2, n: 'Rack de servidores' })];
          for (let i = 0; i < 8; i++) o.push(hbox(24, 2, 3, 90, 45, 12 + i * 9, { g: 2, n: 'Friso' }), cyl(1.6, 1.6, 1, 80, 44.5, 0, { c: i % 3 ? 'lime' : 'sky', g: 3, r: [90, 0, 0], cz: 16 + i * 9, n: 'LED' }));
          [-20, -70].forEach((y, b) => {
            o.push(box(170, 26, 3, -10, y, 30, { c: 'wood', g: 10 + b, n: 'Bancada' }), box(3, 24, 28, -93, y, 2, { c: 'dark', g: 10 + b, n: 'Pé' }), box(3, 24, 28, 73, y, 2, { c: 'dark', g: 10 + b, n: 'Pé' }));
            for (let k = 0; k < 4; k++) { const x = -73 + k * 42; o.push(box(24, 2, 16, x, y + 8, 35, { c: 'dark', g: 20 + b, n: 'Monitor' }), box(22, 0.6, 14, x, y + 6.8, 36, { c: 'navy', g: 20 + b, n: 'Tela' }), box(4, 4, 3, x, y + 9, 33, { c: 'dark', g: 20 + b, n: 'Suporte' }), box(20, 7, 1, x, y - 4, 33, { c: 'silver', g: 20 + b, n: 'Teclado' }), box(8, 18, 18, x + 14, y + 2, 2, { c: 'dark', g: 20 + b, n: 'Gabinete' }),
              box(12, 12, 2, x, y - 24, 14, { c: 'blue', g: 30 + b, n: 'Cadeira' }), box(12, 1.5, 12, x, y - 30, 16, { c: 'blue', g: 30 + b, n: 'Encosto' }), cyl(2, 2, 12, x, y - 24, 2, { c: 'dark', g: 30 + b, n: 'Coluna' })); }
          });
          o.push(box(50, 24, 3, 20, 50, 28, { c: 'brown', g: 4, n: 'Mesa do professor' }), box(46, 22, 26, 20, 50, 2, { c: 'brown', g: 4, n: 'Corpo da mesa' }), box(22, 15, 1.4, 20, 48, 31, { c: 'silver', g: 5, n: 'Notebook' }), box(22, 1.2, 14, 20, 56, 31, { c: 'silver', g: 5, r: [-10, 0, 0], n: 'Tela do notebook' }));
          return o;
        }
      },
      {
        id: 69, nome: 'Fachada comercial', diff: 5,
        obj: 'Desenhar uma fachada de loja com vitrines amplas, toldo listrado, letreiro geométrico, colunas e calçada, em composição simétrica.',
        desc: 'Uma loja de esquina em dois pavimentos: térreo com duas grandes vitrines e porta de vidro central entre colunas, toldo listrado inclinado, letreiro com logotipo geométrico, andar superior com três janelas e sacada, calçada com meio-fio e floreiras.',
        req: ['Fachada simétrica em relação à porta central.', 'Duas vitrines grandes (Caixas furo) com vidro.', 'Toldo inclinado com listras alternadas (Ctrl+D).', 'Letreiro com logotipo feito só com formas básicas.', 'Andar superior com três janelas e sacada.', 'Calçada com meio-fio, floreiras e colunas.'],
        formas: ['box', 'boxh', 'cyl', 'wedge', 'sphere', 'torus'], tools: ['espelhar', 'duplicar', 'furo', 'alinhar', 'agrupar'],
        skills: ['Composição de fachada', 'Ritmo e simetria', 'Identidade visual com formas'],
        dicas: [
          'Uma fachada comercial é lida de longe: vitrines grandes, letreiro no eixo e toldo marcam a identidade. Construa metade e espelhe.',
          'Caixa para o prédio; Caixas furo para vitrines, porta e janelas; Cunhas finas alternando cores para o toldo; Cilindros para colunas; logotipo com Toroide e Esfera.',
          ['Prédio: Caixa 160 × 40 × 100.', 'Vitrines: Caixas furo 50 × 10 × 36 a 45 mm do centro, elevadas a 6; vidro fino no fundo. Porta: Caixa furo 22 × 10 × 40 no centro.', 'Colunas: Cilindros 6 × 6 × 46 ladeando a porta.', 'Toldo: Cunha 10 × 18 × 8 girada; Ctrl+D a cada 10 mm alternando cores, ao longo da fachada, sobre as vitrines.', 'Letreiro: Caixa 70 × 4 × 12 com logotipo (Toroide + Esfera). Andar superior: janelas e sacada.', 'Calçada: Caixa 180 × 30 × 3 com meio-fio; floreiras (Caixa + Esferas verdes).']
        ],
        crit: ['Simetria e ritmo da fachada.', 'Vitrines, porta e toldo bem resolvidos.', 'Letreiro legível só com formas.', 'Calçada e detalhes urbanos.'],
        model: () => {
          const o = [box(160, 40, 100, 0, 0, 3, { c: 'white', n: 'Prédio' }), hbox(50, 10, 36, -45, -20, 9, { n: 'Vitrine' }), hbox(50, 10, 36, 45, -20, 9, { n: 'Vitrine' }), hbox(22, 10, 40, 0, -20, 3, { n: 'Porta' }),
            box(50, 1, 36, -45, -17, 9, { c: 'glass', g: 1, n: 'Vidro' }), box(50, 1, 36, 45, -17, 9, { c: 'glass', g: 1, n: 'Vidro' }), box(22, 1, 40, 0, -17, 3, { c: 'glass', g: 1, n: 'Porta de vidro' }),
            cyl(6, 6, 46, -15, -22, 3, { c: 'dark', g: 2, n: 'Coluna' }), cyl(6, 6, 46, 15, -22, 3, { c: 'dark', g: 2, n: 'Coluna' }), box(160, 2, 4, 0, -21, 49, { c: 'dark', g: 2, n: 'Viga' }),
            box(70, 4, 12, 0, -22, 60, { c: 'navy', g: 3, n: 'Letreiro' }), torus(10, 2.4, -26, -24.5, 0, { c: 'yellow', g: 3, r: [90, 0, 0], cz: 66, n: 'Logotipo' }), sphere(4, 4, 4, -26, -25, 64, { c: 'orange', g: 3, n: 'Logotipo' }), box(36, 1, 3, 4, -24.5, 64.5, { c: 'white', g: 3, n: 'Faixa do letreiro' }),
            box(180, 30, 3, 0, -32, 0, { c: 'gray', g: 4, n: 'Calçada' }), box(180, 3, 4, 0, -45.5, 0, { c: 'silver', g: 4, n: 'Meio-fio' })];
          for (let i = 0; i < 16; i++) { const x = -75 + i * 10; if (Math.abs(x) < 14) continue; o.push(wedge(18, 10, 7, x, -29, 46, { c: i % 2 ? 'white' : 'red', g: 5, r: [0, 0, -90], n: 'Listra do toldo' })); }
          [-50, 0, 50].forEach((x) => o.push(hbox(22, 6, 20, x, -20, 76, { n: 'Janela' }), box(22, 1, 20, x, -17.5, 76, { c: 'glass', g: 6, n: 'Vidro' })));
          o.push(box(34, 8, 2, 0, -24, 74, { c: 'white', g: 6, n: 'Sacada' }), box(34, 1, 8, 0, -27.5, 76, { c: 'dark', g: 6, n: 'Guarda-corpo' }));
          [-80, 80].forEach((x) => o.push(box(14, 10, 8, x, -30, 3, { c: 'brown', g: 7, n: 'Floreira' }), sphere(12, 9, 9, x, -30, 9, { c: 'green', g: 7, n: 'Planta' })));
          return o;
        }
      },
      {
        id: 70, nome: 'Lote residencial completo', diff: 5,
        obj: 'Desafio do módulo: planejar um ambiente arquitetônico completo num terreno, com edificações, paisagismo, piscina escavada e circulação.',
        desc: 'Um terreno com casa (telhado, porta, janelas), garagem integrada, caminho de pedras até a calçada, gramado, piscina escavada no terreno com borda e água, deck de madeira, cerca com portão na frente, árvores, arbustos e caixa de correio.',
        req: ['Terreno com espessura suficiente para a piscina ser um furo (cavidade) no próprio terreno.', 'Casa e garagem com telhado e aberturas.', 'Piscina escavada com borda e água abaixo do nível do gramado.', 'Cerca frontal com estacas repetidas e portão.', 'Caminho de pedras (Ctrl+D) ligando portão e porta.', 'Árvores, deck e caixa de correio.'],
        formas: ['box', 'boxh', 'roof', 'cyl', 'sphere', 'pyr'], tools: ['furo', 'duplicar', 'agrupar', 'alinhar', 'regua', 'ocultar'],
        skills: ['Implantação no terreno', 'Paisagismo', 'Planejamento de projeto'],
        dicas: [
          'Planeje em planta (vista de topo) antes de levantar qualquer volume: onde ficam casa, garagem, piscina, caminho e jardim.',
          'Terreno grosso (Caixa) com Caixa furo para a piscina; casa e garagem de fases anteriores adaptadas; estacas com Ctrl+D; Cilindros achatados para as pedras do caminho.',
          ['Terreno: Caixa 220 × 160 × 8 verde. Piscina: Caixa furo 60 × 34 × 6 elevada a 2. Água: Caixa azul 60 × 34 × 4 dentro. Borda: moldura clara.', 'Casa: Caixa 90 × 60 × 50 com Telhado, porta e janelas, no fundo do terreno. Garagem colada na lateral.', 'Deck: Caixa de madeira ao lado da piscina.', 'Cerca: estaca (Caixa + Pirâmide) com Ctrl+D na frente, deixando o vão do portão.', 'Caminho: Cilindros achatados Ø 10 com Ctrl+D do portão até a porta.', 'Árvores (fases anteriores), arbustos (Esferas) e caixa de correio.']
        ],
        crit: ['Implantação organizada.', 'Piscina realmente escavada.', 'Elementos completos e em escala.', 'Circulação clara do portão à casa.'],
        model: () => {
          const o = [box(220, 160, 8, 0, 0, 0, { c: 'green', n: 'Terreno' }), hbox(60, 34, 8, 55, -10, 2, { n: 'Escavação da piscina' }), box(60, 34, 4, 55, -10, 2, { c: 'sky', g: 1, n: 'Água' }),
            box(66, 4, 1, 55, -29, 8, { c: 'white', g: 1, n: 'Borda' }), box(66, 4, 1, 55, 9, 8, { c: 'white', g: 1, n: 'Borda' }), box(30, 40, 1.5, 100, -10, 8, { c: 'wood', g: 1, n: 'Deck' }),
            box(90, 60, 50, -40, 40, 8, { c: 'cream', g: 2, n: 'Casa' }), hbox(16, 6, 32, -40, 10, 8, { g: 2, n: 'Porta' }), hbox(20, 6, 18, -70, 10, 24, { g: 2, n: 'Janela' }), hbox(20, 6, 18, -10, 10, 24, { g: 2, n: 'Janela' }),
            roof(98, 68, 28, -40, 40, 58, { c: 'red', g: 3, n: 'Telhado' }), box(50, 60, 36, 30, 40, 8, { c: 'white', g: 4, n: 'Garagem' }), hbox(40, 6, 30, 30, 10, 8, { g: 4, n: 'Portão da garagem' }), roof(56, 66, 18, 30, 40, 44, { c: 'gray', g: 4, n: 'Telhado da garagem' }),
            box(40, 50, 0.8, 30, -15, 8, { c: 'gray', g: 5, n: 'Acesso da garagem' }), box(14, 10, 22, -80, -74, 8, { c: 'dark', g: 6, n: 'Caixa de correio' })];
          for (let i = 0; i < 22; i++) { const x = -105 + i * 10; if (x > -50 && x < -30) continue; o.push(box(3, 3, 20, x, -78, 8, { c: 'white', g: 7, n: 'Estaca' }), pyr(3, 3, 4, x, -78, 28, { c: 'white', g: 7, n: 'Ponta' })); }
          o.push(box(220, 2, 3, 0, -76, 14, { c: 'white', g: 7, n: 'Travessa' }));
          for (let i = 0; i < 7; i++) o.push(cyl(10, 10, 1, -40, -70 + i * 11, 8, { c: 'silver', g: 8, n: 'Pedra do caminho' }));
          [[-95, 0], [-90, -40], [95, 60]].forEach(([x, y], i) => o.push(...tree(x, y, 8, 1.1, 9)));
          [[-15, -2], [-65, -2], [80, 30]].forEach(([x, y]) => o.push(sphere(14, 14, 10, x, y, 6, { c: 'lime', g: 9, n: 'Arbusto' })));
          return o;
        }
      }
    ]
  });
})();
