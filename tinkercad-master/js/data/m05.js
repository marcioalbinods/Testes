/* Módulo 5 — Objetos funcionais (fases 41–50) */
(function () {
  const { box, cyl, sphere, cone, torus, tube, poly, wedge, roof, rroof, hemi, hbox, hcyl } = TM.S;
  TM.addModule({
    n: 5, cor: '#17a99b', titulo: 'Objetos funcionais',
    resumo: 'Projetar para usar: medidas reais em escala 1:1, paredes, folgas, estabilidade e ergonomia.',
    phases: [
      {
        id: 41, nome: 'Porta-lápis hexagonal', diff: 3,
        obj: 'Projetar um objeto real em escala 1:1, esvaziando um Polígono com outro Polígono furo e furando faces inclinadas com rotação composta.',
        novo: { titulo: 'Escala 1:1 e espessura de parede', texto: 'A partir deste módulo os objetos têm o tamanho real, prontos para imprimir. Para peças de uso diário, paredes de 2 a 3 mm são firmes e econômicas. Meça um lápis real: um porta-lápis precisa ser mais alto que metade do lápis para ele não tombar.' },
        desc: 'Um porta-lápis hexagonal de 10 cm de altura, oco com fundo de 3 mm, com seis janelas redondas decorativas, uma em cada face, e um anel saliente na base.',
        req: ['Corpo: Polígono de 6 lados com Ø 70 mm e 100 mm de altura.', 'Interior: Polígono furo de 6 lados, Ø 64 mm, elevado a 3 mm (parede de cerca de 3 mm).', 'Seis furos Ø 14 mm, um no centro de cada face, à mesma altura.', 'Anel de base (Toroide ou Cilindro) mais largo que o corpo.', 'Interior livre e fundo intacto.'],
        formas: ['poly', 'cylh', 'torus'], tools: ['propriedades', 'furo', 'rotacionar', 'duplicar', 'agrupar'],
        skills: ['Escala real', 'Paredes uniformes', 'Furos radiais'],
        dicas: [
          'Num hexágono, o centro de cada face fica a 60° do vizinho. Um furo atravessando uma face precisa estar perpendicular a ela.',
          'Polígono (Lados = 6) sólido e furo. Cilindro furo deitado e girado em Z para cada face (Ctrl+D com 60°). Toroide na base.',
          ['Polígono 6 lados, 70 × 70 × 100. Polígono 6 lados furo, 64 × 64 × 100, elevado a 3, alinhado ao centro.', 'Cilindro furo 14 × 14 × 12 girado 90° em Y, atravessando a face da direita a 60 mm de altura.', 'Agrupe esse furo com uma cópia do outro lado (face oposta), para o centro do par ficar no eixo do porta-lápis.', 'Ctrl+D e gire 60° em Z; Ctrl+D de novo: seis furos.', 'Anel: Toroide Ø 74 com tubo 5 na base. Agrupe tudo.']
        ],
        crit: ['Medidas reais e parede uniforme.', 'Furos centrados nas seis faces.', 'Fundo intacto.', 'Acabamento da base.'],
        model: () => {
          const o = [poly(70, 70, 100, 0, 0, 0, { c: 'teal', sides: 6, n: 'Corpo (Polígono)' }), poly(64, 64, 100, 0, 0, 3, { hole: true, sides: 6, n: 'Interior (Polígono furo)' }), torus(76, 5, 0, 0, 0, { c: 'mint', g: 1, n: 'Anel da base' })];
          for (let k = 0; k < 6; k++) { const a = k * 60, r = (a * Math.PI) / 180; o.push(hcyl(14, 14, 12, 30 * Math.cos(r), 30 * Math.sin(r), 0, { r: [0, 90, a], ro: 'ZYX', cz: 62, n: 'Janela' })); }
          return o;
        }
      },
      {
        id: 42, nome: 'Suporte de celular', diff: 3,
        obj: 'Projetar com ergonomia: ângulo de leitura, apoio para o aparelho, passagem de cabo e estabilidade da base.',
        desc: 'Um suporte de mesa: base larga e pesada, encosto inclinado 25° para trás, aba frontal que segura o celular e um rasgo central na aba para passar o cabo de carregamento. O celular aparece apoiado para mostrar o uso.',
        req: ['Base de 80 × 70 × 6 mm.', 'Encosto de 80 × 6 × 90 mm inclinado 25° para trás.', 'Aba frontal de 14 mm de altura segurando a parte de baixo do celular.', 'Rasgo para cabo (Caixa furo) no centro da aba.', 'Espaço entre aba e encosto compatível com um celular de 9 mm de espessura (com capa).', 'Celular de referência apoiado (grupo separado).'],
        formas: ['box', 'boxh'], tools: ['rotacionar', 'furo', 'regua', 'agrupar'],
        skills: ['Ergonomia', 'Ângulo funcional', 'Passagem de cabo'],
        dicas: [
          'O celular encosta no encosto e "pisa" na base, travado pela aba. O centro de massa precisa cair dentro da base, senão tomba.',
          'Caixas para base, encosto e aba; rotação em X para o encosto; Caixa furo para o rasgo. Use a Régua para medir o vão entre aba e encosto.',
          ['Base: Caixa 80 × 70 × 6.', 'Aba: Caixa 80 × 8 × 14 na borda frontal da base, elevada a 6.', 'Rasgo: Caixa furo 20 × 12 × 12 no centro da aba.', 'Encosto: Caixa 80 × 6 × 90 girada −25° em X, com a borda de baixo apoiada na base a cerca de 12 mm atrás da aba.', 'Meça o vão com a Régua: no mínimo 10 mm para o celular com capa. Agrupe o suporte.', 'Celular: Caixa 75 × 9 × 150 escura, com a mesma inclinação, apoiada na base e no encosto.']
        ],
        crit: ['Ângulo do encosto correto.', 'Vão compatível com o celular.', 'Rasgo do cabo centralizado.', 'Conjunto estável.'],
        model: () => [box(80, 70, 6, 0, 0, 0, { c: 'teal', n: 'Base' }), box(80, 8, 14, 0, -24, 6, { c: 'teal', n: 'Aba frontal' }), hbox(20, 12, 12, 0, -24, 9, { n: 'Rasgo do cabo' }),
          box(80, 6, 90, 0, 7, 0, { c: 'teal', r: [-25, 0, 0], cz: 46.8, n: 'Encosto inclinado' }), box(75, 9, 150, 0, 12.9 - 4, 0, { c: 'black', g: 1, r: [-25, 0, 0], cz: 77, n: 'Celular (referência)' })]
      },
      {
        id: 43, nome: 'Organizador de mesa', diff: 3,
        obj: 'Planejar compartimentos de alturas e profundidades diferentes para objetos reais (canetas, clipes, celular, papéis).',
        desc: 'Um organizador em três blocos de alturas diferentes, unidos: torre alta com dois tubos para canetas, bloco médio com três nichos e um rasgo para celular, e bandeja baixa para clipes.',
        req: ['Torre de 50 × 80 × 100 mm com dois furos redondos Ø 30 para canetas.', 'Bloco médio de 60 × 80 × 50 mm com três nichos retangulares.', 'Rasgo de 14 mm de largura para apoiar um celular em pé.', 'Bandeja de 40 × 80 × 20 mm com cavidade rasa.', 'Fundo de 3 a 4 mm em todos os compartimentos.', 'Blocos unidos sem degraus na base.'],
        formas: ['box', 'cylh', 'boxh'], tools: ['furo', 'alinhar', 'regua', 'agrupar'],
        skills: ['Programa de necessidades', 'Profundidades diferentes', 'Composição em volumes'],
        dicas: [
          'Liste os objetos e suas medidas antes de modelar. A profundidade de cada nicho depende de quanto o objeto precisa ficar para fora.',
          'Três Caixas alinhadas pela base e pelo fundo (L). Cilindros furo para canetas, Caixas furo para nichos, rasgo e bandeja.',
          ['Torre: Caixa 50 × 80 × 100. Bloco médio: Caixa 60 × 80 × 50 encostado. Bandeja: Caixa 40 × 80 × 20 encostada. Alinhe pela frente e pela base.', 'Canetas: Cilindros furo 30 × 30 × 100 elevados a 4, a 18 mm do centro da torre para frente e para trás.', 'Nichos: Caixas furo 16 × 34 × 50 elevadas a 4 na metade da frente do bloco médio.', 'Rasgo do celular: Caixa furo 54 × 14 × 50 elevada a 15 na metade de trás.', 'Bandeja: Caixa furo 34 × 74 × 20 elevada a 3.', 'Agrupe tudo.']
        ],
        crit: ['Compartimentos coerentes com os objetos.', 'Fundos com espessura adequada.', 'Blocos alinhados.', 'Organização visual equilibrada.'],
        model: () => [box(50, 80, 100, -55, 0, 0, { c: 'teal', n: 'Torre' }), box(60, 80, 50, 0, 0, 0, { c: 'mint', n: 'Bloco médio' }), box(40, 80, 20, 50, 0, 0, { c: 'teal', n: 'Bandeja' }),
          hcyl(30, 30, 100, -55, -18, 4, { n: 'Furo de canetas' }), hcyl(30, 30, 100, -55, 18, 4, { n: 'Furo de canetas' }),
          hbox(16, 34, 50, -19, -18, 4, { n: 'Nicho' }), hbox(16, 34, 50, 0, -18, 4, { n: 'Nicho' }), hbox(16, 34, 50, 19, -18, 4, { n: 'Nicho' }),
          hbox(54, 14, 50, 0, 22, 15, { n: 'Rasgo do celular' }), hbox(34, 74, 20, 50, 0, 3, { n: 'Bandeja' })]
      },
      {
        id: 44, nome: 'Vaso torcido', diff: 4,
        obj: 'Usar Ctrl+D combinando elevação e rotação ao mesmo tempo para criar uma forma torcida a partir de camadas.',
        desc: 'Um vaso decorativo feito de doze camadas hexagonais empilhadas, cada uma girada 5° em relação à de baixo, formando uma torção suave. É oco, com fundo, e tem um disco de base.',
        req: ['Camada: Polígono de 6 lados com Ø 60 mm e 8 mm de altura.', 'Doze camadas criadas com Ctrl+D, cada uma 8 mm acima e 5° girada.', 'Interior oco com Cilindro furo de Ø 48, deixando fundo de 3 mm.', 'Disco de base de Ø 50 mm.', 'Torção contínua e regular (60° no total).'],
        formas: ['poly', 'cyl', 'cylh'], tools: ['duplicar', 'rotacionar', 'elevar', 'furo', 'agrupar'],
        skills: ['Transformação composta', 'Padrões generativos', 'Forma orgânica com sólidos simples'],
        dicas: [
          'O Ctrl+D lembra todas as transformações feitas na cópia, não só uma. Se você eleva e gira a cópia, as próximas sobem e giram juntas.',
          'Polígono 6 lados. Ctrl+D, eleve 8 mm e gire 5° em Z; depois Ctrl+D dez vezes. Cilindro furo para esvaziar.',
          ['Base: Cilindro 50 × 50 × 3.', 'Camada: Polígono 6 lados 60 × 60 × 8, elevado a 3.', 'Ctrl+D. Na cópia, eleve 8 mm (digite 11) e gire 5° em Z.', 'Ctrl+D mais dez vezes, sem clicar em outra coisa. Doze camadas, até 99 mm.', 'Cilindro furo 48 × 48 × 100 elevado a 6 (fundo de 3 mm na primeira camada). Agrupe tudo.']
        ],
        crit: ['Doze camadas iguais e encostadas.', 'Rotação constante entre camadas.', 'Interior oco com fundo.', 'Acabamento da base.'],
        model: () => {
          const o = [cyl(50, 50, 3, 0, 0, 0, { c: 'teal', n: 'Base' })];
          for (let i = 0; i < 12; i++) o.push(poly(60, 60, 8, 0, 0, 3 + i * 8, { c: i % 2 ? 'mint' : 'teal', sides: 6, r: [0, 0, i * 5], n: 'Camada (Polígono)' }));
          o.push(hcyl(48, 48, 100, 0, 0, 6, { n: 'Interior' }));
          return o;
        }
      },
      {
        id: 45, nome: 'Porta-joias com tampa', diff: 4,
        obj: 'Projetar compartimentos de tamanhos diferentes, um suporte de anéis em rolos e uma tampa com encaixe e puxador.',
        desc: 'Uma caixa de joias com três compartimentos: um grande à esquerda com três rolos (Telhado redondo) para prender anéis, e dois pequenos à direita. Ao lado, a tampa virada para cima com rebaixo de encaixe e um puxador em Meia esfera.',
        req: ['Caixa de 80 × 60 × 35 mm com fundo de 3 mm.', 'Um compartimento grande (36 × 52) e dois pequenos (34 × 24) separados por paredes de 2 a 4 mm.', 'Três rolos de anéis feitos com Telhado redondo no compartimento grande.', 'Tampa de 80 × 60 × 6 com rebaixo de folga 0,3 mm por lado.', 'Puxador centralizado na tampa.'],
        formas: ['box', 'boxh', 'rroof', 'hemi'], tools: ['furo', 'agrupar', 'alinhar', 'grade'],
        skills: ['Compartimentação', 'Tampa com encaixe', 'Detalhe funcional'],
        dicas: [
          'As paredes entre os compartimentos são o que sobra entre os furos. Desenhe os furos pensando nas paredes que vão sobrar.',
          'Caixa + três Caixas furo; Telhados redondos deitados no compartimento grande; tampa com duas Caixas e uma Meia esfera.',
          ['Caixa 80 × 60 × 35.', 'Compartimento grande: Caixa furo 36 × 52 × 35 elevada a 3, a 4 mm da borda esquerda.', 'Pequenos: Caixas furo 34 × 24 × 35 elevadas a 3, à direita, com 4 mm de parede entre eles. Agrupe.', 'Rolos: três Telhados redondos 36 × 10 × 8 no fundo do compartimento grande, lado a lado com 6 mm de fresta (onde os anéis entram).', 'Tampa: Caixa 80 × 60 × 6. Rebaixo: Caixa 75,4 × 55,4 × 3 (folga 0,3 sobre o vão de 76 × 56).', 'Puxador: Meia esfera Ø 16 do outro lado da tampa (vire para mostrar ou mantenha ao lado).']
        ],
        crit: ['Compartimentos com paredes consistentes.', 'Rolos de anéis bem posicionados.', 'Tampa com folga correta.', 'Acabamento e proporção.'],
        model: () => [box(80, 60, 35, 0, 0, 0, { c: 'pink', n: 'Caixa' }), hbox(36, 52, 35, -18, 0, 3, { n: 'Compartimento grande' }), hbox(34, 24, 35, 19, -14, 3, { n: 'Compartimento pequeno' }), hbox(34, 24, 35, 19, 14, 3, { n: 'Compartimento pequeno' }),
          rroof(10, 34, 8, -28, 0, 3, { c: 'purple', g: 1, r: [0, 0, 90], n: 'Rolo de anéis' }), rroof(10, 34, 8, -18, 0, 3, { c: 'purple', g: 1, r: [0, 0, 90], n: 'Rolo de anéis' }), rroof(10, 34, 8, -8, 0, 3, { c: 'purple', g: 1, r: [0, 0, 90], n: 'Rolo de anéis' }),
          box(75.4, 55.4, 3, 0, 72, 0, { c: 'pink', g: 2, n: 'Rebaixo' }), box(80, 60, 6, 0, 72, 3, { c: 'pink', g: 2, n: 'Tampa' }), hemi(16, 16, 8, 0, 72, 9, { c: 'yellow', g: 3, n: 'Puxador (Meia esfera)' })]
      },
      {
        id: 46, nome: 'Suporte de fones', diff: 4,
        obj: 'Cortar um Toroide ao meio para criar um arco de apoio e dimensionar uma peça alta para não tombar.',
        desc: 'Um suporte de fones de ouvido com 25 cm: base redonda larga com anel antiderrapante, haste cilíndrica e, no topo, um arco em meia-lua (metade de um toroide) onde a tiara do fone descansa. Um gancho lateral guarda o cabo.',
        req: ['Base Ø 100 mm com 10 mm de altura.', 'Haste Ø 22 mm até cerca de 235 mm.', 'Arco superior: Toroide em pé (Ø 80, tubo 18) com a metade de baixo removida por uma Caixa furo.', 'Gancho para cabo na haste.', 'Altura total de aproximadamente 250 mm e base larga o bastante para ficar de pé.'],
        formas: ['cyl', 'torus', 'boxh', 'box', 'tube'], tools: ['furo', 'rotacionar', 'alinhar', 'agrupar', 'regua'],
        skills: ['Meio toroide', 'Estabilidade', 'Peça alta'],
        dicas: [
          'Um arco é um toroide sem a metade de baixo. A haste entra por baixo até tocar o topo interno do arco.',
          'Cilindros para base e haste; Toroide girado 90° em X; Caixa furo para cortar a metade inferior; Tubo fino na base; Caixas para o gancho.',
          ['Base: Cilindro 100 × 100 × 10. Anel: Tubo Ø 100 × 2 com parede 6, por baixo.', 'Haste: Cilindro 22 × 22 × 226 elevado a 10.', 'Arco: Toroide Ø 80, tubo 18, girado 90° em X, centro a 210 mm de altura.', 'Caixa furo 100 × 30 × 50 cobrindo a metade de baixo do toroide (do centro para baixo). Agrupe arco + furo.', 'Alinhe arco e haste pelo centro. Gancho: Caixa 6 × 20 × 6 saindo da haste e Caixa 6 × 6 × 14 virada para cima na ponta.']
        ],
        crit: ['Arco limpo, exatamente meio toroide.', 'Haste centrada e encaixada no arco.', 'Base estável e proporcional.', 'Gancho funcional.'],
        model: () => [cyl(100, 100, 10, 0, 0, 2, { c: 'dark', n: 'Base' }), tube(100, 2, 6, 0, 0, 0, { c: 'black', n: 'Anel antiderrapante' }), cyl(22, 22, 226, 0, 0, 12, { c: 'silver', n: 'Haste' }),
          torus(80, 18, 0, 0, 0, { c: 'dark', g: 1, r: [90, 0, 0], cz: 210, n: 'Arco (Toroide)' }), hbox(100, 30, 50, 0, 0, 160, { g: 1, n: 'Furo que corta a metade' }),
          box(6, 20, 6, 0, -18, 140, { c: 'silver', n: 'Gancho' }), box(6, 6, 14, 0, -25, 140, { c: 'silver', n: 'Ponta do gancho' })]
      },
      {
        id: 47, nome: 'Porta-cartões inclinado', diff: 4,
        obj: 'Usar o Plano de trabalho (W) para construir sobre uma face inclinada e cortar um rasgo inclinado com precisão.',
        novo: { titulo: 'Plano de trabalho (W)', texto: 'Aperte W e clique numa face: o plano de trabalho se move para ela, inclinado se a face for inclinada. Formas arrastadas agora caem rentes àquela face, já com o ângulo certo. Aperte W e clique no espaço vazio para voltar ao plano original.' },
        desc: 'Um porta-cartões de visita para mesa: bloco com a frente chanfrada em 30°, rasgo inclinado 15° para trás onde os cartões ficam de pé, e um emblema circular rebaixado na face chanfrada. Três cartões aparecem no rasgo.',
        req: ['Bloco de 100 × 45 × 30 mm.', 'Chanfro frontal cortado por uma Caixa furo girada 30°.', 'Rasgo de 92 × 6 mm para cartões de 90 × 50 mm, inclinado 15° para trás, sem atravessar o fundo.', 'Emblema circular rebaixado 1 mm na face chanfrada, feito com o Plano de trabalho.', 'Cartões de referência no rasgo.'],
        formas: ['box', 'boxh', 'cylh'], tools: ['plano', 'furo', 'rotacionar', 'agrupar'],
        skills: ['Plano de trabalho', 'Furo inclinado', 'Medida de objeto real'],
        dicas: [
          'Um cartão de visita tem 90 × 50 mm. O rasgo deve ter folga em comprimento e espessura para tirar um cartão com facilidade.',
          'Caixa; Caixa furo girada em X para o chanfro e para o rasgo; Plano de trabalho (W) sobre a face chanfrada para posicionar o Cilindro furo raso.',
          ['Bloco: Caixa 100 × 45 × 30.', 'Chanfro: Caixa furo 110 × 30 × 30 girada 30° em X, cortando a aresta superior da frente.', 'Rasgo: Caixa furo 92 × 6 × 40 girada −15° em X, começando a 6 mm do fundo do bloco.', 'Aperte W e clique na face chanfrada. Arraste um Cilindro furo 18 × 18 × 2: ele cai rente à face; afunde 1 mm.', 'W + clique no vazio para voltar. Agrupe.', 'Cartões: Caixas 90 × 0,6 × 50 brancas com a mesma inclinação, no rasgo.']
        ],
        crit: ['Rasgo inclinado com medida correta.', 'Chanfro limpo e no ângulo pedido.', 'Emblema rente à face inclinada.', 'Cartões cabem no rasgo.'],
        model: () => [box(100, 45, 30, 0, 0, 0, { c: 'navy', n: 'Bloco' }), hbox(110, 30, 30, 0, -28, 0, { r: [30, 0, 0], cz: 32, n: 'Chanfro' }),
          hbox(92, 6, 40, 0, 6, 0, { r: [-15, 0, 0], cz: 26, n: 'Rasgo dos cartões' }), hcyl(18, 18, 4, 0, -14.5, 0, { r: [-60, 0, 0], cz: 21, n: 'Emblema (furo raso)' }),
          box(90, 0.6, 50, 0, 10.5, 0, { c: 'white', g: 1, r: [-15, 0, 0], cz: 30, n: 'Cartão' }), box(90, 0.6, 50, 0, 9.4, 0, { c: 'cream', g: 1, r: [-15, 0, 0], cz: 30, n: 'Cartão' })]
      },
      {
        id: 48, nome: 'Jogo de porta-copos', diff: 4,
        obj: 'Projetar um conjunto: peças repetidas (porta-copos) e um suporte dimensionado para guardá-las, com ranhuras feitas com Tubo furo.',
        desc: 'Quatro porta-copos redondos de 95 mm, cada um com duas ranhuras circulares e um emblema central, guardados num suporte cilíndrico com abertura frontal para retirar. Um porta-copos está fora do suporte, mostrando o desenho.',
        req: ['Porta-copos: Cilindro Ø 95 × 4 mm.', 'Duas ranhuras circulares rasas (Tubo transformado em furo) em cada porta-copos.', 'Suporte com Ø interno de pelo menos 97 mm (1 mm de folga por lado) e fundo.', 'Abertura frontal no suporte (Caixa furo) para pegar os porta-copos.', 'Três porta-copos empilhados no suporte e um ao lado.'],
        formas: ['cyl', 'tube', 'boxh', 'hemi'], tools: ['furo', 'propriedades', 'duplicar', 'agrupar', 'alinhar'],
        skills: ['Conjunto de peças', 'Tubo como furo', 'Folga entre peça e suporte'],
        dicas: [
          'Projete primeiro uma peça perfeita, depois duplique. O suporte é dimensionado a partir da peça, não o contrário.',
          'Cilindro + dois Tubos furo rasos + Meia esfera central. Suporte: Tubo + Cilindro de fundo + Caixa furo frontal. Ctrl+D para empilhar.',
          ['Porta-copos: Cilindro 95 × 95 × 4.', 'Ranhuras: Tubo Ø 80 parede 2 e Tubo Ø 60 parede 2, como furo, afundando 1 mm no topo.', 'Emblema: Meia esfera Ø 16 × 3 no centro. Agrupe.', 'Suporte: Cilindro 103 × 103 × 3 (fundo) + Tubo Ø 103, parede 3, altura 22. Interior: 97 mm.', 'Abertura: Caixa furo 60 × 20 × 30 na frente do tubo, elevada a 8. Agrupe.', 'Ctrl+D do porta-copos subindo 4 mm: três dentro do suporte; um ao lado.']
        ],
        crit: ['Ranhuras rasas e concêntricas.', 'Folga correta entre porta-copos e suporte.', 'Abertura frontal funcional.', 'Conjunto organizado.'],
        model: () => {
          const coaster = (x, y, z, g) => [cyl(95, 95, 4, x, y, z, { c: 'wood', g, n: 'Porta-copos' }), tube(80, 2, 2, x, y, z + 3, { hole: true, g, n: 'Ranhura (Tubo furo)' }), tube(60, 2, 2, x, y, z + 3, { hole: true, g, n: 'Ranhura (Tubo furo)' }), hemi(16, 16, 3, x, y, z + 4, { c: 'brown', g, n: 'Emblema' })];
          const o = [cyl(103, 103, 3, 0, 0, 0, { c: 'dark', n: 'Fundo do suporte' }), tube(103, 22, 3, 0, 0, 0, { c: 'dark', n: 'Parede do suporte' }), hbox(60, 20, 30, 0, -50, 8, { n: 'Abertura frontal' })];
          [3, 7, 11].forEach((z, i) => o.push(...coaster(0, 0, z, 10 + i)));
          o.push(...coaster(110, -10, 0, 20));
          return o;
        }
      },
      {
        id: 49, nome: 'Suporte para controles remotos', diff: 4,
        obj: 'Projetar nichos verticais para objetos de tamanhos diferentes e um corte frontal inclinado que facilita pegar e ler os controles.',
        desc: 'Um organizador de sofá com três nichos verticais lado a lado (o do meio mais largo), frente rebaixada em rampa para os controles ficarem à mostra e uma placa de identificação rebaixada. Três controles remotos aparecem encaixados.',
        req: ['Corpo de 120 × 60 × 90 mm.', 'Três nichos verticais (Caixas furo), o central mais largo, com fundo de 5 mm.', 'Corte frontal inclinado (Caixa furo girada) baixando a frente.', 'Paredes entre nichos de pelo menos 4 mm.', 'Placa de identificação rebaixada na lateral.', 'Controles de referência nos nichos.'],
        formas: ['box', 'boxh'], tools: ['furo', 'rotacionar', 'regua', 'agrupar'],
        skills: ['Nichos sob medida', 'Corte inclinado', 'Ergonomia de uso'],
        dicas: [
          'Meça os controles reais da sua casa. A largura do nicho é a do controle mais uma folga de 2 a 3 mm.',
          'Caixa; três Caixas furo; uma Caixa furo grande girada em X para o corte frontal; Caixa furo rasa na lateral.',
          ['Corpo: Caixa 120 × 60 × 90.', 'Nichos: Caixas furo 32 × 48 × 90 (laterais) e 36 × 48 × 90 (central), elevadas a 5, com paredes de 4 a 5 mm.', 'Corte frontal: Caixa furo 130 × 60 × 70 girada 35° em X, removendo a parte superior da frente.', 'Placa: Caixa furo 2 × 40 × 20 na lateral, rebaixando 1 mm. Agrupe.', 'Controles: Caixas escuras 28 × 16 × 120 e 32 × 18 × 110 dentro dos nichos.']
        ],
        crit: ['Nichos com folga para os controles.', 'Corte frontal limpo e inclinado.', 'Paredes firmes.', 'Uso evidente na composição.'],
        model: () => [box(120, 60, 90, 0, 0, 0, { c: 'sky', n: 'Corpo' }), hbox(32, 48, 90, -40, 2, 5, { n: 'Nicho' }), hbox(36, 48, 90, 0, 2, 5, { n: 'Nicho central' }), hbox(32, 48, 90, 40, 2, 5, { n: 'Nicho' }),
          hbox(130, 60, 70, 0, -38, 0, { r: [35, 0, 0], cz: 84, n: 'Corte frontal inclinado' }), hbox(2, 40, 20, 60, 0, 35, { n: 'Placa rebaixada' }),
          box(28, 16, 120, -40, 2, 5, { c: 'black', g: 1, n: 'Controle' }), box(32, 18, 110, 0, 2, 5, { c: 'dark', g: 1, n: 'Controle' }), box(26, 14, 100, 40, 2, 5, { c: 'black', g: 1, n: 'Controle' })]
      },
      {
        id: 50, nome: 'Organizador modular', diff: 5,
        obj: 'Desafio do módulo: criar um sistema de módulos com padrão de medidas e conectores macho/fêmea que encaixam em qualquer ordem.',
        desc: 'Três módulos que se encaixam lado a lado por trilhos: um copo para canetas, uma bandeja dupla e um porta-cartões. Todos seguem a mesma grade de 40 mm e têm trilho macho à direita e canal fêmea à esquerda. Eles aparecem levemente afastados para mostrar os conectores.',
        req: ['Unidade de grade de 40 mm: módulos de 40 × 40 e 80 × 40 mm de base.', 'Trilho macho (Caixa 4 × 10 mm) na lateral direita de cada módulo.', 'Canal fêmea (Caixa furo 4,4 × 10,4 mm) na lateral esquerda de cada módulo.', 'Copo com cavidade cilíndrica, bandeja com cavidade retangular e porta-cartões com rasgo.', 'Os três módulos compatíveis entre si em qualquer ordem.'],
        formas: ['box', 'boxh', 'cylh'], tools: ['furo', 'alinhar', 'duplicar', 'agrupar', 'grade', 'regua'],
        skills: ['Sistema modular', 'Padrão de conectores', 'Projeto de família de peças'],
        dicas: [
          'Um sistema modular depende de um padrão: mesma altura do trilho, mesma posição, mesma folga. Desenhe o conector uma vez e copie para todos.',
          'Caixas para os corpos, Caixa para o trilho, Caixa furo para o canal; Cilindro furo e Caixas furo para as funções. Grade de 0,1 mm nos conectores.',
          ['Conector macho: Caixa 4 × 10 × 30 colada no centro da face direita.', 'Conector fêmea: Caixa furo 4,4 × 10,4 × 31 entrando 4,4 mm na face esquerda, mesma posição em Y.', 'Copo: Caixa 40 × 40 × 70 + Cilindro furo Ø 34 elevado a 3 + conectores. Agrupe.', 'Bandeja: Caixa 80 × 40 × 30 + Caixa furo 74 × 34 elevada a 3 + conectores.', 'Porta-cartões: Caixa 40 × 40 × 45 + Caixa furo 34 × 6 × 45 em rasgo + conectores.', 'Confira com a Régua que o trilho de um módulo entra no canal do outro com 0,2 mm de folga por lado.']
        ],
        crit: ['Conectores idênticos em todos os módulos.', 'Folga correta trilho/canal.', 'Funções de cada módulo bem resolvidas.', 'Sistema coerente com a grade de 40 mm.'],
        model: () => {
          const mod = (x, w, h, g, cor, nome, extra) => [box(w, 40, h, x, 0, 0, { c: cor, g, n: nome }), box(4, 10, 30, x + w / 2 + 2, 0, 0, { c: cor, g, n: 'Trilho macho' }), hbox(4.4, 10.4, 31, x - w / 2 + 2.2 - 0.01, 0, -0.5, { g, n: 'Canal fêmea' })].concat(extra);
          return [].concat(
            mod(-70, 40, 70, 1, 'teal', 'Módulo copo', [hcyl(34, 34, 70, -70, 0, 3, { g: 1, n: 'Cavidade' })]),
            mod(-6, 80, 30, 2, 'mint', 'Módulo bandeja', [hbox(74, 34, 30, -6, 0, 3, { g: 2, n: 'Cavidade' })]),
            mod(58, 40, 45, 3, 'teal', 'Módulo porta-cartões', [hbox(34, 6, 45, 58, 4, 5, { g: 3, n: 'Rasgo' }), hbox(34, 6, 45, 58, -8, 5, { g: 3, n: 'Rasgo' })])
          );
        }
      }
    ]
  });
})();
