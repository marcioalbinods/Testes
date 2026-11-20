/* Módulo 1 — Dominando as formas básicas (fases 1–10) */
(function () {
  const { box, cyl, sphere, cone, pyr, torus, roof } = TM.S;
  TM.addModule({
    n: 1, cor: '#f28a1c', titulo: 'Dominando as formas básicas',
    resumo: 'Inserir, medir, girar, elevar, colorir e navegar. A base de tudo o que vem depois.',
    phases: [
      {
        id: 1, nome: 'Três blocos de construção', diff: 1,
        obj: 'Inserir caixas no plano de trabalho e definir medidas exatas em milímetros, navegando pelo ambiente 3D para conferir o resultado.',
        novo: { titulo: 'O plano de trabalho e a primeira forma', texto: 'O plano azul quadriculado é o seu chão. Cada quadrado pequeno da grade mede 1 mm e as linhas fortes marcam 10 mm. As formas são arrastadas da aba "Formas básicas" (painel da direita) e caem sobre esse plano.', passos: ['Arraste uma Caixa até o plano: ela chega com 20 × 20 × 20 mm.', 'Clique na caixa: aparecem alças brancas. Clique sobre o número de uma medida para digitar o valor exato.', 'Orbite com o botão direito do mouse, aproxime com a roda e aperte F para enquadrar a peça selecionada.', 'No Inspetor de formas (janela que abre ao selecionar), escolha a cor.'] },
        desc: 'Três blocos lado a lado, todos apoiados no plano: um bloco vermelho comprido e baixo, um cubo azul e uma coluna amarela fina e alta. Os três ficam alinhados numa fila, com 10 mm de espaço entre eles.',
        req: ['Bloco vermelho com 40 × 20 × 10 mm (largura × profundidade × altura).', 'Cubo azul com 20 × 20 × 20 mm.', 'Coluna amarela com 10 × 10 × 30 mm.', 'Os três apoiados no plano (nenhum flutuando).', 'Espaço de cerca de 10 mm entre um bloco e outro, numa mesma fila.'],
        formas: ['box'], tools: ['inserir', 'dimensionar', 'cor', 'navegar'],
        skills: ['Ler medidas em mm', 'Digitar dimensões exatas', 'Orbitar e enquadrar a vista'],
        dicas: [
          'Antes de arrastar, observe a referência: as três peças são a mesma forma básica, só mudam as medidas. Pense em qual eixo cada uma é maior.',
          'Use só a Caixa. Para cada uma, digite as medidas clicando nos números que aparecem nas alças brancas. A cor fica no Inspetor de formas, no canto superior direito.',
          ['Arraste uma Caixa para o plano. Clique nela, clique no número da largura e digite 40; na profundidade, 20; na altura (alça branca de cima), 10. No Inspetor, escolha vermelho.', 'Arraste a segunda Caixa para a direita da primeira. Ela já tem 20 × 20 × 20: só pinte de azul.', 'Arraste a terceira Caixa. Digite 10 de largura, 10 de profundidade e 30 de altura. Pinte de amarelo.', 'Para o espaço de 10 mm: com a grade em 1 mm, arraste cada bloco e observe as cotas que aparecem; ou conte 10 quadradinhos entre as peças.', 'Orbite com o botão direito, aproxime com a roda e aperte F para enquadrar. Tire o print em perspectiva, mostrando as três peças.']
        ],
        crit: ['As medidas de cada bloco correspondem às pedidas (tolerância de 1 mm).', 'As cores estão certas e cada bloco é uma peça separada.', 'Todos os blocos estão apoiados no plano de trabalho.', 'A fila está organizada, com espaçamento regular.'],
        model: () => [box(40, 20, 10, -40, 0, 0, { c: 'red', n: 'Bloco 40×20×10' }), box(20, 20, 20, 0, 0, 0, { c: 'blue', n: 'Cubo 20' }), box(10, 10, 30, 25, 0, 0, { c: 'yellow', n: 'Coluna 10×10×30' })]
      },
      {
        id: 2, nome: 'Torre de cilindros', diff: 1,
        obj: 'Usar a elevação no eixo Z para empilhar formas com precisão, sem que uma afunde na outra.',
        novo: { titulo: 'Elevação: o cone preto', texto: 'Toda forma nasce apoiada no plano (Z = 0). Para colocá-la em cima de outra, use o pequeno cone preto acima da forma selecionada: arraste-o para cima e um número mostra a elevação em mm. Clique nesse número para digitar a altura exata.', passos: ['Ctrl + seta para cima / para baixo também move a peça no eixo Z, um passo da grade por vez.', 'A tecla D solta a forma de volta no plano (ou sobre a forma que estiver logo abaixo).'] },
        desc: 'Uma torre de três cilindros empilhados, cada um mais estreito que o de baixo, coroada por um cone. Vista de frente, lembra um bolo de andares ou uma torre de castelo.',
        req: ['Cilindro de base com Ø 40 mm e 10 mm de altura.', 'Segundo cilindro com Ø 30 mm e 10 mm, elevado exatamente a 10 mm.', 'Terceiro cilindro com Ø 20 mm e 10 mm, elevado a 20 mm.', 'Cone de Ø 20 mm e 15 mm de altura no topo, elevado a 30 mm.', 'Todas as peças centralizadas umas sobre as outras.'],
        formas: ['cyl', 'cone'], tools: ['inserir', 'dimensionar', 'elevar', 'cor'],
        skills: ['Empilhar com elevação exata', 'Centralizar visualmente', 'Somar alturas'],
        dicas: [
          'Cada andar começa exatamente onde o de baixo termina. Se a base tem 10 mm de altura, onde começa o próximo?',
          'Use Cilindro três vezes e Cone uma vez. A ferramenta-chave é o cone preto de elevação: digite os valores em vez de arrastar no olho.',
          ['Arraste um Cilindro, digite 40 × 40 e altura 10.', 'Arraste outro Cilindro, digite 30 × 30 × 10. Clique no cone preto e digite 10 na elevação.', 'Arraste o terceiro, 20 × 20 × 10, elevação 20.', 'Arraste um Cone, 20 × 20 e altura 15, elevação 30.', 'Para centralizar: olhe de cima (clique na face SUPERIOR do cubo de vista) e mova cada peça com as setas do teclado até ficar no centro da base. Volte à vista inicial (ícone da casinha) para o print.']
        ],
        crit: ['Os diâmetros diminuem na ordem pedida.', 'As elevações estão corretas: nenhuma peça afunda nem flutua.', 'As peças estão centralizadas no mesmo eixo.', 'O cone fecha a torre no topo.'],
        model: () => [cyl(40, 40, 10, 0, 0, 0, { c: 'blue', n: 'Base Ø40' }), cyl(30, 30, 10, 0, 0, 10, { c: 'sky', n: 'Andar Ø30' }), cyl(20, 20, 10, 0, 0, 20, { c: 'teal', n: 'Andar Ø20' }), cone(20, 20, 15, 0, 0, 30, { c: 'orange', n: 'Cone do topo' })]
      },
      {
        id: 3, nome: 'Dado de mesa', diff: 2,
        obj: 'Posicionar formas pequenas com precisão sobre faces diferentes de um cubo, usando a grade de ajuste e as setas do teclado.',
        novo: { titulo: 'Ajustar grade e setas do teclado', texto: 'No canto inferior direito fica "Ajustar grade". Com 1 mm, cada toque na seta move a peça 1 mm; com Shift + seta, 10 mm. Para encaixes finos, use 0,5 mm. Copiar (Ctrl+C) e colar (Ctrl+V) cria cópias da bolinha sem precisar ajustar o tamanho de novo.' },
        desc: 'Um cubo branco de 20 mm com pontos pretos em três faces visíveis: cinco pontos no topo, três na frente (em diagonal) e dois na face direita (em diagonal). Os pontos são esferas que ficam metade para fora da face.',
        req: ['Cubo branco de 20 × 20 × 20 mm.', 'Pontos feitos com esferas de Ø 4 mm, metade para dentro da face.', 'Face superior com 5 pontos (quatro cantos e o centro).', 'Face frontal com 3 pontos em diagonal.', 'Face direita com 2 pontos em diagonal.', 'Pontos simétricos: a 5 mm do centro da face.'],
        formas: ['box', 'sphere'], tools: ['dimensionar', 'mover', 'grade', 'elevar', 'copiar'],
        skills: ['Posicionar em X, Y e Z', 'Trabalhar em várias faces', 'Copiar e colar'],
        dicas: [
          'Um ponto que fica "meio para fora" tem o centro exatamente sobre a face. Descubra onde fica cada face do cubo em X, Y e Z.',
          'Caixa para o dado e Esfera de 4 mm para os pontos. Ajuste a grade para 1 mm, use Ctrl+C / Ctrl+V para multiplicar as esferas e as setas para posicionar.',
          ['Caixa 20 × 20 × 20, branca. Se ela estiver com o canto em (0,0), as faces ficam em X = 0 e 20, Y = 0 e 20, Z = 0 e 20.', 'Esfera 4 × 4 × 4, preta. Para o topo, eleve a 18 mm (o centro fica em 20). Posicione no centro do topo.', 'Copie e cole 4 vezes; mova cada cópia 5 mm em X e 5 mm em Y a partir do centro (cantos do padrão 5).', 'Face frontal: esfera com o centro em Y = 0 (metade para fora). Faça a diagonal: alto-esquerda, centro, baixo-direita, a 5 mm do centro da face.', 'Face direita: centro da esfera em X = 20, dois pontos em diagonal.', 'Use as vistas Frente, Direita e Topo do cubo de vista para conferir a simetria antes do print.']
        ],
        crit: ['Cubo e esferas com as medidas pedidas.', 'Pontos na quantidade certa em cada face.', 'Os pontos estão metade para fora, sem flutuar.', 'Os padrões estão simétricos e centrados nas faces.'],
        model: () => {
          const d = [];
          [[-5, -5], [5, -5], [-5, 5], [5, 5], [0, 0]].forEach(([x, y]) => d.push(sphere(4, 4, 4, x, y, 18, { c: 'black', n: 'Ponto Ø4' })));
          [[-5, 15], [0, 10], [5, 5]].forEach(([x, z]) => d.push(sphere(4, 4, 4, x, -10, z - 2, { c: 'black', n: 'Ponto Ø4' })));
          [[-5, 15], [5, 5]].forEach(([y, z]) => d.push(sphere(4, 4, 4, 10, y, z - 2, { c: 'black', n: 'Ponto Ø4' })));
          return [box(20, 20, 20, 0, 0, 0, { c: 'white', n: 'Cubo 20' })].concat(d);
        }
      },
      {
        id: 4, nome: 'Pirâmide de degraus', diff: 2,
        obj: 'Conhecer a Pirâmide e a Esfera e combinar escala e elevação para montar um monumento escalonado e centrado.',
        desc: 'Um monumento com três degraus quadrados cada vez menores, uma pirâmide sobre o último degrau e uma pequena esfera dourada encaixada na ponta.',
        req: ['Três degraus de 5 mm de altura: 50 × 50, 40 × 40 e 30 × 30 mm.', 'Pirâmide com base 30 × 30 mm e 25 mm de altura sobre o degrau superior.', 'Esfera de Ø 6 mm encaixada no topo da pirâmide.', 'Tudo centrado no mesmo eixo vertical.', 'Pelo menos duas cores diferentes.'],
        formas: ['box', 'pyr', 'sphere'], tools: ['dimensionar', 'elevar', 'mover', 'cor'],
        skills: ['Escalonar medidas', 'Calcular elevações acumuladas', 'Centralizar formas diferentes'],
        dicas: [
          'Cada degrau é 10 mm menor que o de baixo e 5 mm mais alto. A pirâmide começa onde o último degrau termina.',
          'Três Caixas, uma Pirâmide e uma Esfera. Elevação (cone preto) e as setas resolvem tudo. Olhe de cima para centralizar.',
          ['Caixa 50 × 50 × 5 (elevação 0).', 'Caixa 40 × 40 × 5, elevação 5. Caixa 30 × 30 × 5, elevação 10.', 'Pirâmide: digite 30 × 30 e altura 25; elevação 15. A ponta fica em 40 mm.', 'Esfera 6 × 6 × 6, elevação 37 (fica um pouco afundada na ponta, parecendo encaixada).', 'Na vista de topo, mova as peças até que todas as bordas fiquem igualmente afastadas (5 mm de cada lado entre os degraus).']
        ],
        crit: ['Degraus nas medidas e alturas corretas.', 'Pirâmide apoiada exatamente no último degrau.', 'Esfera no topo, sem flutuar.', 'Conjunto centrado e com degraus uniformes.'],
        model: () => [box(50, 50, 5, 0, 0, 0, { c: 'sand', n: 'Degrau 50' }), box(40, 40, 5, 0, 0, 5, { c: 'cream', n: 'Degrau 40' }), box(30, 30, 5, 0, 0, 10, { c: 'sand', n: 'Degrau 30' }), pyr(30, 30, 25, 0, 0, 15, { c: 'orange', n: 'Pirâmide' }), sphere(6, 6, 6, 0, 0, 37, { c: 'yellow', n: 'Esfera do topo' })]
      },
      {
        id: 5, nome: 'Gangorra', diff: 2,
        obj: 'Girar formas em torno de um eixo com as setas curvas de rotação e posicionar peças que acompanham a inclinação.',
        novo: { titulo: 'Rotação', texto: 'Ao selecionar uma forma aparecem setas curvas, uma para cada eixo. Arraste a seta: a rotação anda em passos de 22,5°; segurando Shift, de 45° em 45°. Se o cursor ficar dentro do anel de graus, você pode girar livremente; dá também para digitar o ângulo exato.' },
        desc: 'Uma gangorra de parque: um apoio triangular no centro e uma prancha comprida inclinada cerca de 12° sobre ele. Em cada ponta da prancha há uma alça vertical que acompanha a inclinação.',
        req: ['Apoio feito com um Telhado (cumeeira perpendicular à prancha), com cerca de 14 mm de altura.', 'Prancha de aproximadamente 90 × 14 × 3 mm apoiada no topo do apoio.', 'Prancha girada em torno do eixo Y, entre 10° e 15°.', 'Duas alças (cilindros) nas pontas, inclinadas junto com a prancha.', 'Nenhuma ponta da prancha atravessa o chão.'],
        formas: ['roof', 'box', 'cyl'], tools: ['rotacionar', 'elevar', 'dimensionar', 'navegar'],
        skills: ['Rotacionar em um eixo', 'Ler ângulos', 'Ajustar posição após girar'],
        dicas: [
          'Pense no eixo em que a gangorra gira na vida real: é a linha do apoio. A prancha gira em volta dessa linha.',
          'Telhado para o apoio (gire 90° em Z se a cumeeira ficar no sentido errado), Caixa para a prancha, Cilindros para as alças. Use as setas curvas de rotação e confira na vista Frente.',
          ['Telhado com 20 × 16 × 14 mm; se a cumeeira estiver paralela à prancha, gire 90° em torno de Z.', 'Caixa 90 × 14 × 3, eleve a 14 mm (sobre a cumeeira) e centralize.', 'Selecione a prancha e arraste a seta curva frontal (eixo Y) até 12° ou digite o valor.', 'Depois de girar, a prancha pode ter afundado no apoio: ajuste a elevação para que ela toque a ponta do Telhado.', 'Cilindro 4 × 4 × 12 para cada alça: gire 12° no mesmo eixo, posicione perto de cada ponta e ajuste a altura para a base tocar a prancha.', 'Confira na vista Frente se as duas alças estão perpendiculares à prancha.']
        ],
        crit: ['O apoio está centrado e com a cumeeira no sentido certo.', 'A prancha está inclinada no eixo correto e apoiada no apoio.', 'As alças acompanham o mesmo ângulo da prancha.', 'Nenhuma peça atravessa o plano.'],
        model: () => [roof(20, 16, 14, 0, 0, 0, { c: 'dark', r: [0, 0, 90], n: 'Apoio (Telhado)' }), box(90, 14, 3, 0, 0, 14, { c: 'red', r: [0, 12, 0], n: 'Prancha' }), cyl(4, 4, 12, -33.7, 0, 24.3, { c: 'yellow', r: [0, 12, 0], n: 'Alça' }), cyl(4, 4, 12, 36.8, 0, 9.4, { c: 'yellow', r: [0, 12, 0], n: 'Alça' })]
      },
      {
        id: 6, nome: 'Jogo de argolas', diff: 2,
        obj: 'Conhecer o Toroide e alterar as propriedades da forma (raio e espessura do tubo) no Inspetor.',
        novo: { titulo: 'Propriedades da forma', texto: 'Algumas formas têm parâmetros próprios no Inspetor. No Toroide: Raio (tamanho do anel), Tubo (grossura da "boia"), Lados e Passos (suavidade). Mudar o Tubo pelo Inspetor mantém o anel redondo; esticar pelas alças achata a forma.' },
        desc: 'Um jogo de argolas: base quadrada de madeira, um pino vertical com uma bolinha no topo, duas argolas encaixadas no pino (uma no chão da base e uma no ar, levemente inclinada, como se estivesse caindo) e uma terceira argola deitada no chão ao lado.',
        req: ['Base de 60 × 60 × 4 mm.', 'Pino cilíndrico de Ø 6 mm e 50 mm de altura sobre a base, com esfera no topo.', 'Três toroides de Ø 24 mm com o anel de 5 mm de espessura, em cores diferentes.', 'Uma argola apoiada na base, em volta do pino.', 'Uma argola no ar, em volta do pino, inclinada cerca de 20°.', 'Uma argola deitada no plano, fora da base.'],
        formas: ['box', 'cyl', 'sphere', 'torus'], tools: ['propriedades', 'rotacionar', 'elevar', 'cor'],
        skills: ['Editar parâmetros da forma', 'Encaixar um anel em volta de um eixo', 'Combinar rotação e elevação'],
        dicas: [
          'Para a argola "abraçar" o pino, o centro do Toroide e o centro do pino precisam coincidir, e o furo do anel precisa ser maior que o pino.',
          'Caixa, Cilindro, Esfera e três Toroides. No Inspetor do Toroide ajuste Raio e Tubo. Use rotação em X para a argola que está caindo.',
          ['Caixa 60 × 60 × 4. Cilindro 6 × 6 × 50 elevado a 4 mm, no centro da base. Esfera 8 mm elevada a 53 mm.', 'Arraste um Toroide. No Inspetor, ajuste o tamanho até ficar com 24 mm de diâmetro externo e o Tubo até a espessura de 5 mm.', 'Centralize o toroide no pino (vista de topo) e eleve a 4 mm: é a argola apoiada.', 'Copie e cole para a segunda argola, eleve a 30 mm e gire 20° em X. Confira de frente se ela continua em volta do pino sem atravessá-lo.', 'Cole a terceira, deixe no plano (Z = 0) ao lado da base.', 'Pinte as três argolas com cores diferentes.']
        ],
        crit: ['Toroides com tamanho e espessura parecidos com os pedidos.', 'As duas argolas do pino estão realmente em volta dele.', 'A argola inclinada não atravessa o pino.', 'Pino centrado na base, com esfera no topo.'],
        model: () => [box(60, 60, 4, 0, 0, 0, { c: 'wood', n: 'Base' }), cyl(6, 6, 50, 0, 0, 4, { c: 'white', n: 'Pino' }), sphere(8, 8, 8, 0, 0, 52, { c: 'red', n: 'Esfera do pino' }), torus(24, 5, 0, 0, 4, { c: 'red', n: 'Argola' }), torus(24, 5, 0, 0, 28, { c: 'blue', r: [20, 0, 0], n: 'Argola inclinada' }), torus(24, 5, 52, -6, 0, { c: 'yellow', n: 'Argola no chão' })]
      },
      {
        id: 7, nome: 'Boneco de neve', diff: 2,
        obj: 'Redimensionar proporcionalmente, girar um cone para apontar para a frente e encaixar formas umas nas outras na medida certa.',
        novo: { titulo: 'Escala proporcional', texto: 'Segure Shift enquanto arrasta uma alça de canto: a forma cresce igual nos três eixos e uma esfera continua esfera. Segurando Alt, ela cresce a partir do centro, sem sair do lugar.' },
        desc: 'Um boneco de neve com três esferas sobrepostas (cada uma menor que a de baixo), olhos e botões pretos, nariz de cenoura apontando para a frente, braços finos inclinados e uma cartola.',
        req: ['Três esferas brancas: cerca de Ø 40, Ø 30 e Ø 22 mm, levemente encaixadas (sem vãos).', 'Nariz feito com um Cone laranja girado 90° apontando para a frente (eixo −Y).', 'Dois olhos e pelo menos dois botões pretos.', 'Dois braços finos (cilindros) inclinados.', 'Cartola com aba (cilindro largo e baixo) e copa (cilindro alto).'],
        formas: ['sphere', 'cone', 'cyl'], tools: ['dimensionar', 'rotacionar', 'elevar', 'mover', 'copiar'],
        skills: ['Escala proporcional (Shift)', 'Encaixar esferas', 'Orientar um cone'],
        dicas: [
          'Esferas empilhadas só se tocam num ponto. Para parecer neve compactada, cada esfera deve afundar alguns milímetros na de baixo.',
          'Esferas com Shift para manter a forma, Cone girado 90° no eixo X para o nariz, Cilindros girados para os braços, dois Cilindros para a cartola.',
          ['Esfera Ø 40 no plano. Esfera Ø 30 com elevação 32 (afunda 8 mm). Esfera Ø 22 com elevação 56.', 'Cone 4 × 4 × 12, laranja: gire 90° em X para a ponta ir para a frente e posicione no rosto, a ponta para fora.', 'Esferas de 3 mm para os olhos, logo acima do nariz; esferas de 4 mm para os botões na esfera do meio.', 'Cilindro 2 × 2 × 22 para cada braço, girado cerca de 60° em Y (um para cada lado), enfiado um pouco na esfera do meio.', 'Cartola: Cilindro 26 × 26 × 2 como aba sobre a cabeça e Cilindro 16 × 16 × 14 logo acima. Confira de frente e de lado.']
        ],
        crit: ['Proporção entre as três esferas e encaixe sem vãos.', 'Nariz apontando para a frente.', 'Olhos, botões e braços posicionados no corpo, sem flutuar.', 'Cartola centrada na cabeça.'],
        model: () => [sphere(40, 40, 40, 0, 0, 0, { c: 'white', n: 'Base Ø40' }), sphere(30, 30, 30, 0, 0, 32, { c: 'white', n: 'Corpo Ø30' }), sphere(22, 22, 22, 0, 0, 56, { c: 'white', n: 'Cabeça Ø22' }),
          cone(4, 4, 12, 0, -15, 61, { c: 'orange', r: [90, 0, 0], n: 'Nariz (Cone)' }),
          sphere(3, 3, 3, -4, -9.2, 68.5, { c: 'black', n: 'Olho' }), sphere(3, 3, 3, 4, -9.2, 68.5, { c: 'black', n: 'Olho' }),
          sphere(4, 4, 4, 0, -14, 48, { c: 'black', n: 'Botão' }), sphere(4, 4, 4, 0, -14.6, 41, { c: 'black', n: 'Botão' }),
          cyl(2, 2, 22, -20, 0, 39, { c: 'brown', r: [0, -60, 0], n: 'Braço' }), cyl(2, 2, 22, 20, 0, 39, { c: 'brown', r: [0, 60, 0], n: 'Braço' }),
          cyl(26, 26, 2, 0, 0, 75, { c: 'black', n: 'Aba da cartola' }), cyl(16, 16, 14, 0, 0, 76, { c: 'black', n: 'Copa da cartola' })]
      },
      {
        id: 8, nome: 'Robô de blocos', diff: 3,
        obj: 'Agrupar várias formas em um único objeto e preservar as cores com a opção Multicor.',
        novo: { titulo: 'Agrupar e Multicor', texto: 'Selecione várias formas (arraste uma janela de seleção ou use Shift + clique) e aperte Ctrl+G: elas viram um objeto só, que se move e gira inteiro. Por padrão o grupo fica com uma cor; marque "Multicor" no Inspetor para manter as cores de cada peça. Ctrl+Shift+G desagrupa.' },
        desc: 'Um robô de brinquedo de pé: duas pernas, corpo retangular, cabeça com olhos e antena, braços horizontais terminando em mãos esféricas. Todas as peças estão agrupadas num único objeto multicolorido.',
        req: ['Duas pernas, corpo e cabeça feitos com Caixas proporcionais.', 'Braços com Cilindros girados 90° (horizontais) e mãos esféricas.', 'Dois olhos e uma antena com bolinha na ponta.', 'Todas as peças agrupadas (Ctrl+G) em um único objeto.', 'Opção Multicor ativada, mantendo pelo menos 4 cores.'],
        formas: ['box', 'cyl', 'sphere'], tools: ['agrupar', 'cor', 'rotacionar', 'elevar', 'mover'],
        skills: ['Agrupar sólidos', 'Usar Multicor', 'Montar figura simétrica'],
        dicas: [
          'Monte de baixo para cima, como se o robô fosse uma pilha. Só agrupe no fim, quando tudo estiver no lugar.',
          'Caixas para pernas, corpo e cabeça; Cilindros deitados (90° em Y) para os braços; Esferas para mãos, olhos e ponta da antena. Ctrl+G no final e Multicor no Inspetor.',
          ['Duas Caixas 8 × 8 × 20 para as pernas, separadas por 6 mm.', 'Caixa 30 × 18 × 28 para o corpo, elevação 20.', 'Caixa 20 × 16 × 16 para a cabeça, elevação 48, centrada no corpo.', 'Cilindro 7 × 7 × 24 girado 90° em Y: um de cada lado do corpo, na altura do peito (cerca de 42 mm). Esferas Ø 9 nas pontas.', 'Olhos: esferas Ø 5 metade para fora da frente da cabeça. Antena: Cilindro 2 × 2 × 8 sobre a cabeça e esfera Ø 5 na ponta.', 'Selecione tudo, Ctrl+G, e marque Multicor no Inspetor. Teste movendo o robô: ele deve andar inteiro.']
        ],
        crit: ['Figura completa e proporcional.', 'Braços horizontais e simétricos.', 'Peças agrupadas em um único objeto.', 'Cores preservadas com Multicor.'],
        model: () => [box(8, 8, 20, -7, 0, 0, { c: 'dark', n: 'Perna' }), box(8, 8, 20, 7, 0, 0, { c: 'dark', n: 'Perna' }), box(30, 18, 28, 0, 0, 20, { c: 'silver', n: 'Corpo' }), box(20, 16, 16, 0, 0, 48, { c: 'sky', n: 'Cabeça' }),
          sphere(5, 5, 5, -5, -8, 55.5, { c: 'yellow', n: 'Olho' }), sphere(5, 5, 5, 5, -8, 55.5, { c: 'yellow', n: 'Olho' }), cyl(2, 2, 8, 0, 0, 64, { c: 'dark', n: 'Antena' }), sphere(5, 5, 5, 0, 0, 71, { c: 'red', n: 'Ponta da antena' }),
          cyl(7, 7, 24, -27, 0, 30, { c: 'orange', r: [0, 90, 0], n: 'Braço' }), cyl(7, 7, 24, 27, 0, 30, { c: 'orange', r: [0, 90, 0], n: 'Braço' }), sphere(9, 9, 9, -40, 0, 37.5, { c: 'dark', n: 'Mão' }), sphere(9, 9, 9, 40, 0, 37.5, { c: 'dark', n: 'Mão' }), box(14, 1, 8, 0, -9.3, 30, { c: 'red', n: 'Painel do peito' })]
      },
      {
        id: 9, nome: 'Casinha de blocos', diff: 3,
        obj: 'Usar o Telhado na proporção certa e conferir o modelo pelas vistas ortogonais do cubo de vista (Frente, Topo, Direita).',
        novo: { titulo: 'Cubo de vista e vistas ortogonais', texto: 'O cubo no canto superior esquerdo gira a câmera: clique em FRENTE, TOPO ou DIREITA para olhar reto para uma face. Vistas retas revelam desalinhamentos que a perspectiva esconde. O botão abaixo do cubo alterna entre perspectiva e vista ortográfica.' },
        desc: 'Uma casinha simples: paredes de um bloco só, telhado de duas águas um pouco maior que as paredes (beiral), chaminé saindo do telhado, porta e duas janelas na fachada (peças finas coladas na parede) e um degrau de entrada.',
        req: ['Paredes com cerca de 60 × 40 × 35 mm.', 'Telhado (forma Telhado) com beiral de 2 mm para cada lado, apoiado no topo das paredes.', 'Chaminé saindo de dentro do telhado.', 'Porta e duas janelas como placas finas na fachada frontal, todas apoiadas na parede.', 'Degrau na frente da porta.', 'Conferido nas vistas Frente e Topo (porta centrada, janelas simétricas).'],
        formas: ['box', 'roof'], tools: ['navegar', 'dimensionar', 'elevar', 'mover', 'cor'],
        skills: ['Proporção de fachada', 'Usar vistas ortogonais', 'Beiral e encaixes visuais'],
        dicas: [
          'O telhado é um pouco maior que a casa nos dois sentidos: isso é o beiral. A chaminé pode começar dentro do telhado, ninguém vê a parte escondida.',
          'Caixas para paredes, chaminé, porta, janelas e degrau; Telhado para o telhado. Verifique tudo pela vista FRENTE do cubo de vista.',
          ['Caixa 60 × 40 × 35 para as paredes.', 'Telhado 64 × 44 × 22, elevação 35, centrado (2 mm de beiral para cada lado).', 'Caixa 8 × 8 × 16 para a chaminé, elevação 42, perto de um dos lados do telhado.', 'Porta: Caixa 12 × 2 × 22 no centro da fachada, encostada (metade dentro, metade fora da parede).', 'Janelas: Caixas 12 × 2 × 10 a 18 mm do centro para cada lado, elevação 15.', 'Degrau: Caixa 18 × 6 × 2 na frente da porta. Clique em FRENTE no cubo de vista e confira a simetria.']
        ],
        crit: ['Paredes e telhado proporcionais, com beiral.', 'Telhado apoiado sem vãos nem sobreposição exagerada.', 'Porta centrada e janelas simétricas.', 'Chaminé, degrau e fachada completos.'],
        model: () => [box(60, 40, 35, 0, 0, 0, { c: 'cream', n: 'Paredes' }), roof(64, 44, 22, 0, 0, 35, { c: 'red', n: 'Telhado' }), box(8, 8, 16, 18, 8, 42, { c: 'brown', n: 'Chaminé' }), box(12, 2, 22, 0, -20, 0, { c: 'brown', n: 'Porta' }), box(12, 2, 10, -18, -20, 15, { c: 'glass', n: 'Janela' }), box(12, 2, 10, 18, -20, 15, { c: 'glass', n: 'Janela' }), box(18, 6, 2, 0, -24, 0, { c: 'gray', n: 'Degrau' })]
      },
      {
        id: 10, nome: 'Praça geométrica', diff: 3,
        obj: 'Desafio do módulo: planejar uma pequena cena usando todas as formas e ferramentas do módulo, com escala coerente entre os objetos.',
        desc: 'Uma praça sobre uma base verde: caminho de areia atravessando, duas árvores diferentes (copa esférica e copa cônica), um poste com luminária esférica, um banco com encosto e um chafariz redondo com borda de toroide e esguicho central.',
        req: ['Base de cerca de 140 × 90 mm com caminho de outra cor.', 'Duas árvores com copas de formatos diferentes (Esfera e Cone).', 'Banco com assento, pés e encosto.', 'Poste com luminária.', 'Chafariz com borda feita de Toroide e esguicho central.', 'Cada objeto agrupado separadamente (Multicor) e todos apoiados na base.'],
        formas: ['box', 'cyl', 'sphere', 'cone', 'torus'], tools: ['inserir', 'dimensionar', 'elevar', 'rotacionar', 'agrupar', 'cor', 'navegar'],
        skills: ['Planejar uma cena', 'Escala entre objetos', 'Organizar por grupos'],
        dicas: [
          'Antes de começar, decida o tamanho de uma pessoa imaginária nessa praça (por exemplo, 18 mm). Banco, poste e árvores devem fazer sentido para essa pessoa.',
          'Construa e agrupe um objeto por vez, ao lado da base, e só depois leve cada grupo para o lugar. Use Esfera e Cone nas copas, Toroide na borda do chafariz.',
          ['Base: Caixa 140 × 90 × 3, verde. Caminho: Caixa 140 × 16 × 1 elevada a 3, cor areia.', 'Árvore 1: Cilindro 6 × 6 × 25 (tronco) e Esfera Ø 28 elevada a 22. Árvore 2: Cilindro 5 × 5 × 10 e Cone Ø 24 × 32 elevado a 12. Agrupe cada árvore com Multicor.', 'Banco: assento 30 × 10 × 2 elevado a 8; dois pés 2 × 10 × 8; encosto 30 × 2 × 10 no fundo do assento.', 'Poste: Cilindro 3 × 3 × 40 e Esfera Ø 8 no topo.', 'Chafariz: Cilindro 34 × 34 × 6 (bacia), Toroide de Ø 36 com tubo 5 elevado a 3 (borda), Cilindro 6 × 6 × 14 no centro e Esfera Ø 10 no topo (água).', 'Leve cada grupo para a base, eleve todos a 3 mm (ou use D para soltar sobre a base) e confira de cima se nada invade o caminho.']
        ],
        crit: ['Todos os elementos pedidos estão presentes.', 'Escala coerente entre banco, poste, árvores e chafariz.', 'Objetos apoiados na base, sem flutuar.', 'Organização em grupos e composição equilibrada.'],
        model: () => {
          const z = 3;
          return [box(140, 90, 3, 0, 0, 0, { c: 'green', n: 'Base' }), box(140, 16, 1, 0, -8, z, { c: 'sand', n: 'Caminho' }),
            cyl(6, 6, 25, -50, 24, z, { c: 'brown', n: 'Tronco' }), sphere(28, 28, 28, -50, 24, z + 20, { c: 'lime', n: 'Copa esférica' }),
            cyl(5, 5, 10, -22, 30, z, { c: 'brown', n: 'Tronco' }), cone(24, 24, 32, -22, 30, z + 10, { c: 'green', n: 'Copa cônica' }),
            box(30, 10, 2, -10, -30, z + 8, { c: 'wood', n: 'Assento' }), box(2, 10, 8, -23, -30, z, { c: 'dark', n: 'Pé do banco' }), box(2, 10, 8, 3, -30, z, { c: 'dark', n: 'Pé do banco' }), box(30, 2, 10, -10, -26, z + 10, { c: 'wood', n: 'Encosto' }),
            cyl(3, 3, 40, 45, -30, z, { c: 'dark', n: 'Poste' }), sphere(8, 8, 8, 45, -30, z + 39, { c: 'yellow', n: 'Luminária' }),
            cyl(34, 34, 6, 30, 22, z, { c: 'sky', n: 'Bacia' }), torus(36, 5, 30, 22, z + 3, { c: 'silver', n: 'Borda (Toroide)' }), cyl(6, 6, 14, 30, 22, z, { c: 'silver', n: 'Esguicho' }), sphere(10, 10, 10, 30, 22, z + 13, { c: 'glass', n: 'Água' })];
        }
      }
    ]
  });
})();
