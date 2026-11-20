/* Módulo 6 — Objetos realistas (fases 51–60) */
(function () {
  const { box, cyl, sphere, cone, torus, tube, poly, wedge, roof, rroof, hemi, hbox, hcyl } = TM.S;
  /* barra (cilindro ou caixa) ligando dois pontos no plano X-Z, numa posição Y */
  const bar = (x1, z1, x2, z2, y, d, o, kind) => {
    const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz), th = (Math.atan2(dx, dz) * 180) / Math.PI;
    const f = kind === 'box' ? box : cyl;
    return f(d, kind === 'box' ? (o.w || d) : d, L, (x1 + x2) / 2, y, 0, Object.assign({}, o, { r: [0, th, 0], cz: (z1 + z2) / 2 }));
  };
  TM.S.bar = bar;
  /* roda deitada no eixo Y (pneu + aro + calota) */
  const wheel = (x, y, cz, d, w, g, cor) => [cyl(d, d, w, x, y, 0, { c: 'black', g, r: [90, 0, 0], cz, n: 'Pneu' }), cyl(d * 0.58, d * 0.58, w + 0.6, x, y, 0, { c: cor || 'silver', g, r: [90, 0, 0], cz, n: 'Aro' }), cyl(d * 0.22, d * 0.22, w + 1.4, x, y, 0, { c: 'gray', g, r: [90, 0, 0], cz, n: 'Calota' })];
  TM.S.wheel = wheel;

  TM.addModule({
    n: 6, cor: '#e5432f', titulo: 'Objetos realistas',
    resumo: 'Observar objetos reais, decompor em volumes e acrescentar os detalhes que dão realismo.',
    phases: [
      {
        id: 51, nome: 'Carro compacto', diff: 4,
        obj: 'Decompor um carro em volumes principais (carroceria, cabine, rodas) e acrescentar detalhes que dão leitura realista.',
        novo: { titulo: 'Do volume ao detalhe', texto: 'Modelos realistas nascem em três passadas: 1) volumes grandes nas proporções certas; 2) recortes que definem a silhueta (para-brisa, caixas de roda); 3) detalhes pequenos (faróis, maçanetas, retrovisores). Não comece pelos detalhes.' },
        desc: 'Um carro compacto de 100 mm: carroceria baixa com caixas de roda recortadas, cabine com para-brisa e vidro traseiro inclinados (Cunhas), janelas laterais, quatro rodas com aro e calota, faróis, lanternas, para-choques, grade e retrovisores.',
        req: ['Carroceria de cerca de 100 × 44 mm com cabine recuada.', 'Para-brisa e traseira inclinados (Cunha).', 'Quatro caixas de roda recortadas com Cilindro furo.', 'Quatro rodas com pneu, aro e calota, alinhadas aos pares.', 'Faróis, lanternas, para-choques, grade e retrovisores.', 'Grupos separados para carroceria e rodas.'],
        formas: ['box', 'wedge', 'cyl', 'cylh'], tools: ['furo', 'alinhar', 'espelhar', 'duplicar', 'agrupar'],
        skills: ['Proporção de veículo', 'Silhueta por recortes', 'Hierarquia de detalhes'],
        dicas: [
          'Olhe um carro de lado: a cabine fica mais para trás do que parece, e as rodas quase encostam nas pontas. Comece pela vista lateral.',
          'Caixas para carroceria e cabine, Cunhas para o para-brisa e a traseira, Cilindros furo para as caixas de roda (grupo da carroceria) e Cilindros para as rodas (grupo separado).',
          ['Carroceria: Caixa 100 × 44 × 16 elevada a 8.', 'Cabine: Caixa 52 × 40 × 16 sobre a carroceria, recuada 6 mm. Para-brisa: Cunha 14 × 40 × 16 na frente da cabine; traseira: Cunha 10 × 40 × 16 espelhada.', 'Caixas de roda: Cilindros furo 26 × 26 × 50 deitados no eixo Y, a 32 mm do centro, centro a 11 mm. Agrupe a carroceria.', 'Roda: Cilindro 22 × 22 × 8 deitado + aro 13 + calota 5. Agrupe e copie para os 4 cantos (espelhe em Y).', 'Detalhes: faróis (Caixas amarelas), lanternas (vermelhas), para-choques, grade, retrovisores.']
        ],
        crit: ['Proporções de carro reconhecíveis.', 'Rodas alinhadas e dentro das caixas.', 'Para-brisa e traseira coerentes.', 'Detalhes que reforçam o realismo.'],
        model: () => {
          const o = [box(100, 44, 16, 0, 0, 8, { c: 'red', n: 'Carroceria' }), box(48, 40, 16, -6, 0, 24, { c: 'red', n: 'Cabine' }), wedge(14, 40, 16, 25, 0, 24, { c: 'glass', n: 'Para-brisa (Cunha)' }), wedge(10, 40, 16, -35, 0, 24, { c: 'glass', r: [0, 0, 180], n: 'Vidro traseiro (Cunha)' }),
            hcyl(26, 26, 50, 32, 0, 0, { r: [90, 0, 0], cz: 11, n: 'Caixa de roda' }), hcyl(26, 26, 50, -32, 0, 0, { r: [90, 0, 0], cz: 11, n: 'Caixa de roda' }),
            box(40, 41, 9, -6, 0, 28, { c: 'glass', g: 3, n: 'Janelas laterais' }), box(4, 46, 5, 51, 0, 9, { c: 'dark', g: 3, n: 'Para-choque' }), box(4, 46, 5, -51, 0, 9, { c: 'dark', g: 3, n: 'Para-choque' }),
            box(1.5, 9, 4, 50.5, -14, 17, { c: 'yellow', g: 3, n: 'Farol' }), box(1.5, 9, 4, 50.5, 14, 17, { c: 'yellow', g: 3, n: 'Farol' }), box(1.5, 18, 4, 50.5, 0, 16, { c: 'dark', g: 3, n: 'Grade' }),
            box(1.5, 9, 4, -50.5, -14, 18, { c: 'red', g: 3, n: 'Lanterna' }), box(1.5, 9, 4, -50.5, 14, 18, { c: 'red', g: 3, n: 'Lanterna' }), box(4, 4, 3, 16, -23.5, 27, { c: 'dark', g: 3, n: 'Retrovisor' }), box(4, 4, 3, 16, 23.5, 27, { c: 'dark', g: 3, n: 'Retrovisor' })];
          [[32, -19], [32, 19], [-32, -19], [-32, 19]].forEach(([x, y], i) => o.push(...wheel(x, y, 11, 22, 8, 10 + i)));
          return o;
        }
      },
      {
        id: 52, nome: 'Caminhão baú', diff: 4,
        obj: 'Montar um veículo de várias partes sobre um chassi comum, com eixo simples na frente e eixo duplo atrás.',
        desc: 'Um caminhão baú: chassi longo, cabine com capô, para-brisa e janelas, grade e faróis, escapamento vertical atrás da cabine, tanque de combustível lateral, baú grande com portas traseiras e seis rodas (um eixo dianteiro e dois traseiros).',
        req: ['Chassi comum ligando cabine e baú.', 'Cabine com capô mais baixo à frente e para-brisa.', 'Baú com portas traseiras marcadas (frisos rasos).', 'Seis rodas: eixo dianteiro e eixo duplo traseiro, alinhados.', 'Escapamento, tanque, grade, faróis e para-choque.', 'Proporção: baú mais alto que a cabine.'],
        formas: ['box', 'cyl', 'boxh'], tools: ['alinhar', 'duplicar', 'furo', 'agrupar', 'regua'],
        skills: ['Montagem sobre chassi', 'Repetição de rodas', 'Proporção entre partes'],
        dicas: [
          'Comece pelo chassi: ele define o comprimento e onde ficam os eixos. Cabine e baú são "módulos" apoiados nele.',
          'Caixas para chassi, cabine, capô e baú; Caixas furo rasas para as portas; rodas da fase 51 reaproveitadas (Ctrl+C); Cilindros para escapamento e tanque.',
          ['Chassi: Caixa 130 × 30 × 8 elevado a 8.', 'Cabine: Caixa 30 × 46 × 40 elevada a 16, na frente. Capô: Caixa 16 × 46 × 22 à frente dela. Para-brisa: Caixa fina azul.', 'Baú: Caixa 80 × 48 × 48 elevado a 16, atrás. Portas: dois frisos (Caixas furo 1 × 22 × 44) na traseira.', 'Rodas Ø 22: eixo dianteiro sob o capô; eixo duplo sob o baú, separados por 24 mm.', 'Escapamento: Cilindro 4 × 4 × 46 atrás da cabine. Tanque: Cilindro 12 × 12 × 22 deitado na lateral do chassi.', 'Grade, faróis e para-choque na frente.']
        ],
        crit: ['Chassi contínuo e partes apoiadas.', 'Eixos e rodas alinhados.', 'Detalhes de cabine e baú.', 'Proporção de caminhão.'],
        model: () => {
          const o = [box(130, 30, 8, 0, 0, 8, { c: 'dark', n: 'Chassi' }), box(30, 46, 40, 40, 0, 16, { c: 'blue', n: 'Cabine' }), box(16, 46, 22, 63, 0, 16, { c: 'blue', n: 'Capô' }),
            box(1, 40, 16, 55.2, 0, 36, { c: 'glass', n: 'Para-brisa' }), box(16, 47, 12, 38, 0, 38, { c: 'glass', g: 4, n: 'Janelas' }),
            box(80, 48, 48, -25, 0, 16, { c: 'white', g: 1, n: 'Baú' }), hbox(1.6, 1, 44, -65, 0, 18, { g: 1, n: 'Friso das portas' }), box(1, 2, 8, -65.4, -6, 36, { c: 'silver', g: 4, n: 'Trava' }), box(1, 2, 8, -65.4, 6, 36, { c: 'silver', g: 4, n: 'Trava' }),
            box(1.5, 30, 12, 71.4, 0, 20, { c: 'silver', g: 4, n: 'Grade' }), box(1.5, 7, 5, 71.4, -19, 24, { c: 'yellow', g: 4, n: 'Farol' }), box(1.5, 7, 5, 71.4, 19, 24, { c: 'yellow', g: 4, n: 'Farol' }), box(4, 50, 6, 73, 0, 10, { c: 'dark', g: 4, n: 'Para-choque' }),
            cyl(4, 4, 46, 23, -20, 16, { c: 'silver', g: 4, n: 'Escapamento' }), cyl(12, 12, 22, 40, -21, 0, { c: 'silver', g: 4, r: [0, 90, 0], cz: 10, n: 'Tanque' })];
          [[58, -19], [58, 19], [-18, -19], [-18, 19], [-42, -19], [-42, 19]].forEach(([x, y], i) => o.push(...wheel(x, y, 11, 22, 8, 10 + i)));
          return o;
        }
      },
      {
        id: 53, nome: 'Avião comercial', diff: 4,
        obj: 'Construir um objeto alongado com simetria bilateral: fuselagem, asas espelhadas, empenagem e motores, alinhados num eixo central.',
        desc: 'Um avião de passageiros sobre o trem de pouso: fuselagem cilíndrica com nariz arredondado e cauda afinada, asas largas com dois motores, estabilizadores horizontais, deriva vertical, fileiras de janelas e para-brisa da cabine.',
        req: ['Fuselagem: Cilindro deitado em X, com nariz (Esfera alongada) e cauda (Cone truncado).', 'Asas simétricas atravessando a fuselagem.', 'Dois motores sob as asas, espelhados.', 'Estabilizador horizontal e deriva vertical (Cunha) na cauda.', 'Fileira de janelas repetida com Ctrl+D dos dois lados.', 'Trem de pouso com rodas tocando o chão.'],
        formas: ['cyl', 'sphere', 'cone', 'box', 'wedge'], tools: ['rotacionar', 'espelhar', 'duplicar', 'alinhar', 'agrupar'],
        skills: ['Simetria bilateral', 'Eixo longitudinal', 'Repetição de janelas'],
        dicas: [
          'Tudo no avião se organiza em volta da linha central da fuselagem. Construa o lado esquerdo e espelhe; alinhe sempre pelo centro em Y.',
          'Cilindro girado 90° em Y, Esfera alongada, Cone girado −90° em Y com Raio superior; Caixas para asas e estabilizador; Cunha para a deriva; Esferas pequenas nas janelas.',
          ['Fuselagem: Cilindro 18 × 18 × 110 girado 90° em Y, centro a 30 mm de altura.', 'Nariz: Esfera 30 × 18 × 18 na frente. Cauda: Cone 18 × 18 × 30 girado −90° em Y, Raio superior pequeno.', 'Asas: Caixa 36 × 130 × 3 atravessando, a 27 mm de altura. Motores: Cilindros 10 × 10 × 22 deitados sob as asas, a 30 mm do centro (espelhe).', 'Estabilizador: Caixa 18 × 50 × 2 na cauda. Deriva: Cunha 24 × 2 × 24 sobre a cauda.', 'Janela: Esfera Ø 3 na lateral; Ctrl+D a cada 7 mm. Espelhe a fileira para o outro lado.', 'Trem de pouso: Cilindros finos e rodas pequenas tocando o plano.']
        ],
        crit: ['Simetria entre os lados.', 'Fuselagem, nariz e cauda contínuos.', 'Asas e motores bem posicionados.', 'Janelas regulares e trem de pouso.'],
        model: () => {
          const H = 30, o = [cyl(18, 18, 110, 0, 0, 0, { c: 'white', r: [0, 90, 0], cz: H, n: 'Fuselagem' }), sphere(30, 18, 18, 55, 0, H - 9, { c: 'white', n: 'Nariz' }), cone(18, 18, 30, -70, 0, 0, { c: 'white', r: [0, -90, 0], top: 0.25, cz: H + 1, n: 'Cauda (Cone)' }),
            box(36, 130, 3, 5, 0, 25.5, { c: 'silver', n: 'Asas' }), box(18, 50, 2, -74, 0, H + 1, { c: 'silver', n: 'Estabilizador' }), wedge(24, 2, 24, -72, 0, H + 6, { c: 'blue', n: 'Deriva (Cunha)' }),
            box(6, 14, 4, 62, 0, H + 2, { c: 'navy', n: 'Para-brisa' })];
          [-30, 30].forEach((y) => o.push(cyl(10, 10, 22, 12, y, 0, { c: 'silver', r: [0, 90, 0], cz: 20, n: 'Motor' }), cyl(7, 7, 1, 23.2, y, 0, { c: 'dark', r: [0, 90, 0], cz: 20, n: 'Entrada de ar' })));
          [-8.6, 8.6].forEach((y) => { for (let i = 0; i < 12; i++) o.push(sphere(3, 3, 3, 40 - i * 7, y, H + 1.5, { c: 'navy', n: 'Janela' })); });
          o.push(cyl(2, 2, 22, 44, 0, 0, { c: 'dark', n: 'Trem dianteiro' }), cyl(6, 6, 3, 44, 0, 0, { c: 'black', r: [90, 0, 0], cz: 3, n: 'Roda' }));
          [-10, 10].forEach((y) => o.push(cyl(2, 2, 22, 0, y, 0, { c: 'dark', n: 'Trem principal' }), cyl(7, 7, 4, 0, y, 0, { c: 'black', r: [90, 0, 0], cz: 3.5, n: 'Roda' })));
          return o;
        }
      },
      {
        id: 54, nome: 'Veleiro', diff: 4,
        obj: 'Criar formas de casco com Polígono de 3 lados e velas triangulares com Cunhas finas, compondo um objeto com mastro alto.',
        desc: 'Um veleiro sobre a água: casco com proa pontuda e convés rebaixado, cabine com janelas redondas, mastro alto, retranca, vela grande e vela de proa triangulares e uma bandeira no topo.',
        req: ['Casco: Caixa + proa feita com Polígono de 3 lados girado, unidos.', 'Convés rebaixado (furo raso) deixando uma borda.', 'Cabine com pelo menos duas janelas redondas.', 'Mastro vertical e retranca horizontal.', 'Duas velas triangulares (Cunhas finas) com o lado vertical junto ao mastro.', 'Base de água e bandeira.'],
        formas: ['box', 'poly', 'cyl', 'wedge', 'boxh', 'cylh'], tools: ['propriedades', 'rotacionar', 'furo', 'agrupar', 'alinhar'],
        skills: ['Formas de casco', 'Velas com Cunha', 'Composição vertical'],
        dicas: [
          'Uma vela é um triângulo retângulo: um lado preso no mastro (vertical) e outro na retranca (horizontal). Uma Cunha bem fina tem exatamente esse perfil.',
          'Caixa + Polígono de 3 lados para o casco; Caixa furo rasa para o convés; Cilindros para mastro e retranca; Cunhas de 1 mm para as velas.',
          ['Água: Caixa 170 × 80 × 2 azul.', 'Casco: Caixa 70 × 30 × 14 elevada a 1. Proa: Polígono 3 lados 30 × 30 × 14 girado até um vértice apontar para a frente, encostado na Caixa.', 'Convés: Caixa furo 66 × 26 × 4 no topo do casco (borda de 2 mm). Agrupe o casco.', 'Cabine: Caixa 24 × 18 × 10 sobre o convés; janelas com Cilindros furo deitados.', 'Mastro: Cilindro 3 × 3 × 80. Retranca: Cilindro 2 × 2 × 42 deitado em X a 22 mm de altura.', 'Vela grande: Cunha 40 × 1 × 60 com o lado alto junto ao mastro. Vela de proa: Cunha 26 × 1 × 50 à frente. Bandeira no topo.']
        ],
        crit: ['Casco com proa e convés.', 'Velas triangulares bem orientadas.', 'Mastro e retranca alinhados.', 'Composição equilibrada.'],
        model: () => [box(170, 80, 2, 0, 0, 0, { c: 'sky', g: 9, n: 'Água' }), box(70, 30, 14, -5, 0, 1, { c: 'white', n: 'Casco' }), poly(30, 30, 14, 33.5, 0, 1, { c: 'white', sides: 3, r: [0, 0, 90], n: 'Proa (Polígono 3 lados)' }),
          hbox(64, 26, 4, -4, 0, 12, { n: 'Convés rebaixado' }), box(24, 18, 10, -18, 0, 11, { c: 'wood', g: 1, n: 'Cabine' }), hcyl(4, 4, 30, -24, 0, 0, { g: 1, r: [90, 0, 0], cz: 16, n: 'Janela' }), hcyl(4, 4, 30, -13, 0, 0, { g: 1, r: [90, 0, 0], cz: 16, n: 'Janela' }),
          cyl(3, 3, 82, 2, 0, 11, { c: 'brown', g: 2, n: 'Mastro' }), cyl(2, 2, 42, -19, 0, 0, { c: 'brown', g: 2, r: [0, 90, 0], cz: 24, n: 'Retranca' }),
          wedge(40, 1, 62, -19, 0, 25, { c: 'cream', g: 2, r: [0, 0, 180], n: 'Vela grande (Cunha)' }), wedge(26, 1, 52, 16, 0, 22, { c: 'white', g: 2, n: 'Vela de proa (Cunha)' }), box(10, 1, 6, 8, 0, 87, { c: 'red', g: 2, n: 'Bandeira' })]
      },
      {
        id: 55, nome: 'Bicicleta estilizada', diff: 5,
        obj: 'Construir uma estrutura de tubos com ângulos diferentes entre pontos definidos, combinando Toroides em pé com raios em repetição circular.',
        desc: 'Uma bicicleta de lado: duas rodas de Toroide com raios, cubos, quadro em diamante (tubos superior, inferior e do selim, pares de garfos traseiros), garfo dianteiro, guidão, selim, pedivela com coroa e pedais.',
        req: ['Duas rodas (Toroide em pé Ø 56) com pelo menos 6 raios cada, feitos por rotação.', 'Quadro com tubos inclinados ligando pontos-chave (movimento central, selim, caixa de direção, eixos).', 'Garfo traseiro e dianteiro duplos (dos dois lados da roda).', 'Guidão, selim, coroa e pedais.', 'Rodas tocando o chão e quadro centrado entre elas.'],
        formas: ['torus', 'cyl', 'box', 'hemi'], tools: ['rotacionar', 'duplicar', 'alinhar', 'regua', 'agrupar', 'espelhar'],
        skills: ['Tubos entre pontos', 'Ângulos medidos', 'Estrutura leve'],
        dicas: [
          'Marque primeiro os pontos: eixo traseiro, eixo dianteiro, movimento central, topo do selim e caixa de direção. Cada tubo liga dois desses pontos.',
          'Toroides girados 90° em X para as rodas; Caixas finas girando a cada 30° para os raios; Cilindros finos girados em Y para os tubos; Meia esfera para o selim.',
          ['Rodas: Toroides Ø 56 com tubo 4, girados 90° em X, centros a 28 mm de altura e 70 mm de distância entre eixos.', 'Raios: Caixa 1 × 1 × 52 pelo centro da roda; Ctrl+D girando 30° em Y. Cubo: Cilindro deitado no eixo.', 'Movimento central em (0, 26). Tubo do selim até (−8, 62); tubo superior até (28, 64); tubo inferior até (30, 52). Use a Régua e digite ângulos.', 'Garfos traseiros: do movimento central e do selim até o eixo traseiro, um de cada lado (espelhe em Y). Garfo dianteiro duplo até o eixo da frente.', 'Guidão: Cilindro deitado em Y no topo da direção. Selim: Meia esfera alongada. Coroa e pedivelas no movimento central.']
        ],
        crit: ['Rodas iguais com raios regulares.', 'Quadro ligando os pontos corretos.', 'Garfos duplos e simétricos.', 'Bicicleta apoiada e proporcional.'],
        model: () => {
          const R = 28, o = [];
          [-35, 35].forEach((x, i) => {
            o.push(torus(56, 4, x, 0, 0, { c: 'black', r: [90, 0, 0], cz: R, n: 'Roda (Toroide)' }), cyl(6, 6, 10, x, 0, 0, { c: 'silver', r: [90, 0, 0], cz: R, n: 'Cubo' }));
            for (let k = 0; k < 6; k++) o.push(box(1, 1, 52, x, 0, 0, { c: 'silver', r: [0, k * 30, 0], cz: R, n: 'Raio' }));
          });
          const C = { c: 'red' };
          o.push(bar(0, 26, -8, 64, 0, 3.4, Object.assign({ n: 'Tubo do selim' }, C)), bar(-8, 62, 28, 64, 0, 3.4, Object.assign({ n: 'Tubo superior' }, C)), bar(0, 26, 30, 52, 0, 3.6, Object.assign({ n: 'Tubo inferior' }, C)), bar(30, 52, 28, 66, 0, 4.2, Object.assign({ n: 'Caixa de direção' }, C)));
          [-4, 4].forEach((y) => o.push(bar(0, 26, -35, R, y, 2.2, Object.assign({ n: 'Garfo traseiro' }, C)), bar(-8, 62, -35, R, y, 2.2, Object.assign({ n: 'Garfo traseiro' }, C)), bar(30, 52, 35, R, y, 2.4, { c: 'silver', n: 'Garfo dianteiro' })));
          o.push(cyl(3, 3, 34, 27, 0, 0, { c: 'dark', r: [90, 0, 0], cz: 70, n: 'Guidão' }), cyl(2.6, 2.6, 8, 28, 0, 64, { c: 'dark', n: 'Mesa' }), cyl(2.6, 2.6, 10, -9, 0, 62, { c: 'silver', n: 'Canote' }), hemi(16, 8, 4, -10, 0, 71, { c: 'black', n: 'Selim' }),
            cyl(16, 16, 2, 0, 5, 0, { c: 'silver', r: [90, 0, 0], cz: 26, n: 'Coroa' }), bar(0, 26, 6, 15, 7, 2, { c: 'dark', n: 'Pedivela' }, 'box'), bar(0, 26, -6, 37, -7, 2, { c: 'dark', n: 'Pedivela' }, 'box'), box(8, 6, 2, 6, 11, 14, { c: 'dark', n: 'Pedal' }), box(8, 6, 2, -6, -11, 36, { c: 'dark', n: 'Pedal' }));
          return o;
        }
      },
      {
        id: 56, nome: 'Câmera fotográfica', diff: 4,
        obj: 'Modelar um objeto de precisão com cilindros concêntricos (lente), rebaixos e componentes pequenos alinhados.',
        desc: 'Uma câmera DSLR: corpo com empunhadura saliente, revestimento texturizado, visor elevado no topo, lente em anéis concêntricos com anel de foco, vidro frontal rebaixado, botão disparador, seletor de modos, flash e alças para a correia.',
        req: ['Corpo de cerca de 80 × 34 × 50 mm com empunhadura saliente.', 'Lente com pelo menos três cilindros concêntricos de diâmetros diferentes.', 'Vidro da lente rebaixado (Cilindro furo raso) com disco de vidro.', 'Visor elevado sobre o corpo, centrado com a lente.', 'Disparador, seletor, flash e alças da correia (Toroides).'],
        formas: ['box', 'cyl', 'cylh', 'torus', 'wedge'], tools: ['alinhar', 'furo', 'rotacionar', 'agrupar', 'cor'],
        skills: ['Peças concêntricas', 'Componentes pequenos', 'Acabamento de produto'],
        dicas: [
          'A lente e o visor compartilham o mesmo eixo vertical: alinhe-os pelo centro em X. A empunhadura fica do lado direito de quem segura (esquerdo de quem olha de frente).',
          'Caixas para corpo e empunhadura; Cilindros deitados em Y para a lente; Cilindro furo raso para o vidro; Telhado ou Cunhas para o visor; Toroides pequenos para as alças.',
          ['Corpo: Caixa 80 × 34 × 50. Empunhadura: Caixa 16 × 44 × 46 à esquerda (vista de frente), saliente para a frente.', 'Lente: Cilindros deitados no eixo Y: Ø 40 × 10, Ø 36 × 12 (anel de foco texturizado), Ø 38 × 4 na ponta.', 'Vidro: Cilindro furo Ø 28 × 4 na frente da lente; disco azul Ø 28 × 1 no fundo do rebaixo.', 'Visor: Caixa 30 × 24 × 10 sobre o corpo + Telhado por cima, centrado com a lente.', 'Disparador (Cilindro) sobre a empunhadura; seletor (Cilindro) à direita; flash (Caixa) na frente do visor; alças (Toroides em pé) nas laterais.']
        ],
        crit: ['Lente concêntrica e centrada com o visor.', 'Empunhadura proporcional.', 'Detalhes pequenos bem posicionados.', 'Leitura clara de câmera.'],
        model: () => [box(80, 34, 50, 0, 0, 0, { c: 'black', n: 'Corpo' }), box(16, 44, 46, -32, -5, 0, { c: 'dark', n: 'Empunhadura' }), box(82, 35, 22, 0, 0, 12, { c: 'dark', g: 1, n: 'Revestimento' }),
          cyl(40, 40, 10, 6, -20, 0, { c: 'black', r: [90, 0, 0], cz: 25, n: 'Base da lente' }), cyl(36, 36, 12, 6, -31, 0, { c: 'dark', r: [90, 0, 0], cz: 25, n: 'Anel de foco' }), cyl(38, 38, 4, 6, -39, 0, { c: 'black', r: [90, 0, 0], cz: 25, n: 'Ponta da lente' }),
          hcyl(28, 28, 6, 6, -41, 0, { r: [90, 0, 0], cz: 25, n: 'Rebaixo do vidro' }), cyl(28, 28, 1, 6, -38.5, 0, { c: 'navy', g: 2, r: [90, 0, 0], cz: 25, n: 'Vidro' }),
          box(30, 24, 10, 6, 2, 50, { c: 'black', g: 3, n: 'Visor' }), roof(30, 24, 8, 6, 2, 60, { c: 'black', g: 3, n: 'Topo do visor' }), box(14, 2, 6, 6, -10.5, 52, { c: 'silver', g: 3, n: 'Flash' }),
          cyl(8, 8, 3, -32, -10, 46, { c: 'silver', g: 3, n: 'Disparador' }), cyl(14, 14, 5, 28, 4, 50, { c: 'gray', g: 3, n: 'Seletor' }),
          torus(8, 2, -41, 6, 0, { c: 'silver', g: 3, r: [0, 90, 0], cz: 42, n: 'Alça' }), torus(8, 2, 41, 6, 0, { c: 'silver', g: 3, r: [0, 90, 0], cz: 42, n: 'Alça' })]
      },
      {
        id: 57, nome: 'Computador de mesa', diff: 4,
        obj: 'Compor um conjunto de equipamentos (monitor e gabinete) com rebaixos de tela, ventilação em série e botões.',
        desc: 'Um monitor widescreen com tela rebaixada e moldura fina, sustentado por um braço e base, ao lado de um gabinete torre com baia de drive, botão liga/desliga, LEDs e grade de ventilação de frisos repetidos.',
        req: ['Monitor 16:9 (cerca de 120 × 72 mm) com tela rebaixada e moldura uniforme.', 'Braço e base do monitor centralizados.', 'Gabinete torre com baia de drive (furo raso) e botão.', 'Grade de ventilação com pelo menos 8 frisos repetidos com Ctrl+D.', 'Monitor e gabinete em grupos separados, sobre o mesmo plano.'],
        formas: ['box', 'boxh', 'cyl'], tools: ['furo', 'duplicar', 'alinhar', 'agrupar', 'regua'],
        skills: ['Proporção 16:9', 'Moldura uniforme', 'Padrões repetidos'],
        dicas: [
          'Proporção 16:9 significa largura ÷ altura ≈ 1,78. A moldura fica igual nos quatro lados se o furo da tela for centrado e menor 8 mm em cada medida.',
          'Caixa + Caixa furo rasa para a tela; Caixa escura no fundo do rebaixo; Caixas para braço e base; Caixa + Caixas furo para baia e ventilação; Cilindros para botão e LEDs.',
          ['Monitor: Caixa 120 × 6 × 72 elevada a 40. Tela: Caixa furo 112 × 4 × 64 rebaixando 2 mm na frente. Painel: Caixa escura 112 × 1 × 64 no fundo.', 'Braço: Caixa 16 × 8 × 40 atrás; base: Caixa 50 × 30 × 4. Alinhe pelo centro em X.', 'Gabinete: Caixa 40 × 90 × 95 ao lado.', 'Baia: Caixa furo 30 × 2 × 8 na frente, perto do topo. Botão: Cilindro deitado. LEDs: Cilindros pequenos.', 'Ventilação: Caixa furo 26 × 2 × 2 na frente; Ctrl+D descendo 5 mm, oito vezes.', 'Agrupe monitor e gabinete separadamente.']
        ],
        crit: ['Tela 16:9 com moldura uniforme.', 'Monitor estável e centralizado.', 'Frisos regulares no gabinete.', 'Detalhes de equipamento.'],
        model: () => {
          const o = [box(120, 6, 72, 0, 0, 40, { c: 'dark', n: 'Monitor' }), hbox(112, 4, 64, 0, -3, 44, { n: 'Rebaixo da tela' }), box(112, 1, 64, 0, -0.5, 44, { c: 'navy', g: 1, n: 'Tela' }),
            box(16, 8, 40, 0, 8, 4, { c: 'silver', g: 2, n: 'Braço' }), box(50, 30, 4, 0, 6, 0, { c: 'silver', g: 2, n: 'Base' }), cyl(3, 3, 1, 52, -3.2, 0, { c: 'lime', g: 2, r: [90, 0, 0], cz: 41.5, n: 'LED' }),
            box(40, 90, 95, 100, 10, 0, { c: 'dark', g: 3, n: 'Gabinete' }), hbox(30, 2, 8, 100, -35, 80, { g: 3, n: 'Baia do drive' }), cyl(8, 8, 2, 100, -35.5, 0, { c: 'silver', g: 4, r: [90, 0, 0], cz: 68, n: 'Botão' }), cyl(2, 2, 1, 92, -35.2, 0, { c: 'sky', g: 4, r: [90, 0, 0], cz: 68, n: 'LED' })];
          for (let i = 0; i < 9; i++) o.push(hbox(26, 2, 2, 100, -35, 12 + i * 5, { g: 3, n: 'Friso de ventilação' }));
          return o;
        }
      },
      {
        id: 58, nome: 'Teclado completo', diff: 4,
        obj: 'Dominar repetição em grade com Ctrl+D em duas direções e lidar com variações (teclas largas, deslocamento de fileiras).',
        desc: 'Um teclado de 29 cm: base com borda, cinco fileiras de teclas com o deslocamento típico de cada linha, teclas largas (Tab, Caps, Shift, Enter, Backspace), barra de espaço e LEDs indicadores.',
        req: ['Base de cerca de 290 × 100 × 10 mm.', 'Teclas de 16 × 16 mm com passo de 19 mm (padrão real).', 'Fileiras deslocadas como num teclado real.', 'Teclas largas: Backspace, Tab, Caps Lock, Enter, Shift e barra de espaço.', 'Repetição feita com Ctrl+D, não peça por peça.', 'LEDs indicadores.'],
        formas: ['box', 'cyl'], tools: ['duplicar', 'alinhar', 'regua', 'agrupar', 'grade'],
        skills: ['Grade com passo fixo', 'Variações dentro do padrão', 'Medidas industriais'],
        dicas: [
          'Teclados reais usam passo de 19,05 mm: tecla de 16 mm + vão de 3 mm. Uma tecla larga ocupa 1,5 ou 2 passos.',
          'Uma Caixa-tecla perfeita; Ctrl+D andando 19 mm em X para a fileira; depois copie a fileira descendo 19 mm em Y e ajuste o início.',
          ['Base: Caixa 290 × 100 × 10.', 'Tecla: Caixa 16 × 16 × 6 sobre a base, no canto superior esquerdo.', 'Ctrl+D, 19 mm em X; Ctrl+D até completar 13 teclas. Backspace: tecla de 35 mm no fim.', 'Copie a fileira 19 mm para baixo e desloque conforme a referência; troque as pontas por Tab (26 mm), Caps (30 mm), Shift (40 mm) e Enter.', 'Última fileira: teclas de modificador e barra de espaço de 110 mm.', 'LEDs: Cilindros Ø 2 no canto. Agrupe as teclas e depois tudo.']
        ],
        crit: ['Passo constante entre teclas.', 'Deslocamento das fileiras.', 'Teclas especiais na largura certa.', 'Conjunto alinhado à base.'],
        model: () => {
          const o = [box(290, 100, 10, 0, 0, 0, { c: 'dark', n: 'Base' })];
          const P = 19, x0 = -145 + 7, k = (x, y, w) => o.push(box(w, 16, 6, x + w / 2, y, 10, { c: 'white', g: 1, n: w > 17 ? 'Tecla larga' : 'Tecla' }));
          const rows = [[[1, 13], 35], [[26, 0], 0], [[30, 0], 0], [[40, 0], 0]];
          let y = 36; let x = x0; for (let i = 0; i < 13; i++) k(x + i * P, y, 16); k(x0 + 13 * P, y, 35);
          y -= P; k(x0, y, 26); for (let i = 0; i < 13; i++) k(x0 + 29 + i * P, y, 16);
          y -= P; k(x0, y, 30); for (let i = 0; i < 11; i++) k(x0 + 33 + i * P, y, 16); k(x0 + 33 + 11 * P, y, 40);
          y -= P; k(x0, y, 40); for (let i = 0; i < 10; i++) k(x0 + 43 + i * P, y, 16); k(x0 + 43 + 10 * P, y, 49);
          y -= P; [22, 22, 22].forEach((w, i) => k(x0 + i * 25, y, w)); k(x0 + 75, y, 110); [22, 22, 22, 22].forEach((w, i) => k(x0 + 188 + i * 25, y, w));
          [0, 1, 2].forEach((i) => o.push(cyl(2, 2, 1, 120 + i * 6, 44, 10, { c: 'lime', g: 2, n: 'LED' })));
          return o;
        }
      },
      {
        id: 59, nome: 'Mouse ergonômico', diff: 4,
        obj: 'Esculpir uma forma orgânica a partir de uma Meia esfera esticada e cortá-la com furos finos para separar botões e encaixar a roda de rolagem.',
        desc: 'Um mouse com corpo em Meia esfera alongada, sulco central separando os botões esquerdo e direito, rasgo com roda de rolagem, dois botões laterais, cabo saindo pela frente e pés deslizantes por baixo.',
        req: ['Corpo: Meia esfera esticada (cerca de 62 × 110 × 36 mm).', 'Sulco fino separando os dois botões (Caixa furo de 1 mm).', 'Rasgo para a roda e roda de rolagem (Cilindro deitado em X) dentro dele.', 'Dois botões laterais.', 'Cabo saindo pela frente.', 'Grupo do corpo separado da roda e do cabo.'],
        formas: ['hemi', 'boxh', 'cyl', 'box'], tools: ['furo', 'dimensionar', 'rotacionar', 'agrupar', 'alinhar'],
        skills: ['Forma orgânica', 'Corte fino', 'Peça móvel em rasgo'],
        dicas: [
          'Esticar a Meia esfera em Y deixa o formato de ovo; achatar em Z deixa a "corcunda" suave da palma da mão.',
          'Meia esfera esticada; Caixa furo fina para o sulco; Caixa furo para o rasgo da roda; Cilindro girado 90° em Y para a roda; Cilindros para o cabo.',
          ['Corpo: Meia esfera 62 × 110 × 36.', 'Sulco: Caixa furo 1 × 50 × 40 no centro, da frente até a metade do comprimento.', 'Rasgo: Caixa furo 8 × 18 × 40 no centro, perto da frente. Agrupe o corpo.', 'Roda: Cilindro 14 × 14 × 6 girado 90° em Y, dentro do rasgo, aparecendo acima da superfície.', 'Botões laterais: Caixas pequenas na lateral esquerda. Cabo: Cilindro Ø 3 saindo pela frente.']
        ],
        crit: ['Forma ergonômica e proporcional.', 'Sulco e rasgo limpos.', 'Roda bem encaixada.', 'Detalhes completos.'],
        model: () => [hemi(62, 110, 36, 0, 0, 0, { c: 'silver', n: 'Corpo (Meia esfera)' }), hbox(1, 50, 40, 0, -32, 0, { n: 'Sulco dos botões' }), hbox(8, 18, 40, 0, -28, 0, { n: 'Rasgo da roda' }),
          cyl(14, 14, 6, 0, -28, 0, { c: 'dark', g: 1, r: [0, 90, 0], cz: 29, n: 'Roda de rolagem' }), box(3, 10, 5, -30, -2, 14, { c: 'dark', g: 1, n: 'Botão lateral' }), box(3, 10, 5, -29, 11, 14, { c: 'dark', g: 1, n: 'Botão lateral' }),
          cyl(3, 3, 40, 0, -74, 0, { c: 'black', g: 2, r: [90, 0, 0], cz: 6, n: 'Cabo' })]
      },
      {
        id: 60, nome: 'Braço robótico', diff: 5,
        obj: 'Desafio do módulo: montar um robô com várias articulações em ângulos diferentes, mantendo cada junta no ponto exato de conexão.',
        desc: 'Um braço robótico industrial: base fixa, torre giratória, junta de ombro, braço superior inclinado 30°, junta de cotovelo, antebraço apontando para frente e para baixo, punho esférico e garra de dois dedos. Mangueiras acompanham o braço.',
        req: ['Base e torre giratória cilíndricas.', 'Três juntas visíveis (ombro, cotovelo e punho).', 'Braço superior e antebraço em ângulos diferentes, ligados exatamente nas juntas.', 'Garra com dois dedos simétricos.', 'Juntas com eixo horizontal (Cilindros deitados).', 'Cores de equipamento industrial e grupos por segmento.'],
        formas: ['cyl', 'box', 'sphere', 'torus'], tools: ['rotacionar', 'alinhar', 'regua', 'agrupar', 'espelhar'],
        skills: ['Cadeia de articulações', 'Ângulos encadeados', 'Pontos de conexão'],
        dicas: [
          'Cada segmento gira em torno da junta anterior. Posicione a junta primeiro; depois o segmento, com uma ponta exatamente nela.',
          'Cilindros (base, torre, juntas deitadas em Y), Caixas para os segmentos (giradas em Y), Esfera no punho, Caixas finas para os dedos (espelhe).',
          ['Base: Cilindro 60 × 60 × 10. Torre: Cilindro 40 × 40 × 22.', 'Ombro: Cilindro 24 × 24 × 34 deitado em Y, centro a 42 mm.', 'Braço superior: Caixa 14 × 20 × 70 girada 30° em Y; uma ponta no centro do ombro (cerca de 17 mm para a frente e 72 mm de altura no centro da caixa).', 'Cotovelo no fim do braço; antebraço: Caixa 12 × 18 × 60 girada 110° em Y a partir do cotovelo.', 'Punho: Esfera Ø 14 no fim do antebraço. Garra: Caixa 6 × 24 × 8 e dois dedos 4 × 4 × 18 (espelhe em Y).', 'Mangueira: Toroide fino cortado ao lado do braço. Agrupe por segmento.']
        ],
        crit: ['Juntas nos pontos de conexão.', 'Ângulos coerentes e encadeados.', 'Garra simétrica.', 'Leitura clara de robô industrial.'],
        model: () => {
          const S = [0, 42], a1 = 30, L1 = 70, E = [S[0] + L1 * Math.sin((a1 * Math.PI) / 180), S[1] + L1 * Math.cos((a1 * Math.PI) / 180)], a2 = 110, L2 = 58, W = [E[0] + L2 * Math.sin((a2 * Math.PI) / 180), E[1] + L2 * Math.cos((a2 * Math.PI) / 180)];
          return [cyl(60, 60, 10, 0, 0, 0, { c: 'dark', n: 'Base' }), cyl(40, 40, 22, 0, 0, 10, { c: 'orange', n: 'Torre giratória' }), cyl(24, 24, 34, 0, 0, 0, { c: 'dark', r: [90, 0, 0], cz: S[1], n: 'Junta do ombro' }),
            bar(S[0], S[1], E[0], E[1], 0, 14, { c: 'orange', w: 20, n: 'Braço superior' }, 'box'), cyl(20, 20, 28, E[0], 0, 0, { c: 'dark', r: [90, 0, 0], cz: E[1], n: 'Junta do cotovelo' }),
            bar(E[0], E[1], W[0], W[1], 0, 12, { c: 'orange', w: 18, n: 'Antebraço' }, 'box'), sphere(16, 16, 16, W[0], 0, W[1] - 8, { c: 'dark', n: 'Punho' }),
            box(8, 26, 8, W[0] + 8, 0, W[1] - 14, { c: 'silver', n: 'Base da garra' }), box(4, 4, 18, W[0] + 9, -9, W[1] - 30, { c: 'silver', n: 'Dedo' }), box(4, 4, 18, W[0] + 9, 9, W[1] - 30, { c: 'silver', n: 'Dedo' }),
            bar(S[0] - 6, S[1] + 4, E[0] - 6, E[1] + 4, 12, 3, { c: 'black', n: 'Mangueira' }), bar(E[0], E[1] + 6, W[0] - 2, W[1] + 6, 11, 3, { c: 'black', n: 'Mangueira' })];
        }
      }
    ]
  });
})();
