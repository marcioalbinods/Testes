/* Tinkercad Master — núcleo: catálogos, construtores de forma, pontuação, códigos.
   Script clássico (funciona também abrindo o arquivo direto no navegador). */
(function () {
  const TM = (window.TM = window.TM || {});

  /* ---------- Cores (próximas da paleta do Tinkercad) ---------- */
  TM.C = {
    red: '#e5432f', orange: '#f28a1c', yellow: '#f5c518', lime: '#9ccc3a', green: '#3aa655',
    teal: '#17a99b', sky: '#5bb8f0', blue: '#2f74e0', navy: '#273c75', purple: '#8250d6',
    pink: '#ec6fa5', white: '#f1f2f4', silver: '#b9c0c9', gray: '#8a939e', dark: '#3b414a',
    black: '#24272c', wood: '#c98b4e', brown: '#86562e', sand: '#e6cf9c', glass: '#a8dcf6',
    cream: '#f3e6c8', skin: '#f0c39a', copper: '#c8744a', mint: '#8fdcc0'
  };

  /* ---------- Formas básicas (nomes da aba "Formas básicas") ---------- */
  TM.SHAPES = {
    box: { nome: 'Caixa', icon: 'box' },
    cyl: { nome: 'Cilindro', icon: 'cyl' },
    sphere: { nome: 'Esfera', icon: 'sphere' },
    cone: { nome: 'Cone', icon: 'cone' },
    pyr: { nome: 'Pirâmide', icon: 'pyr' },
    torus: { nome: 'Toroide', icon: 'torus' },
    tube: { nome: 'Tubo', icon: 'tube' },
    roof: { nome: 'Telhado', icon: 'roof' },
    rroof: { nome: 'Telhado redondo', icon: 'rroof' },
    wedge: { nome: 'Cunha', icon: 'wedge' },
    hemi: { nome: 'Meia esfera', icon: 'hemi' },
    poly: { nome: 'Polígono', icon: 'poly' },
    para: { nome: 'Paraboloide', icon: 'para' },
    boxh: { nome: 'Caixa (furo)', icon: 'boxh' },
    cylh: { nome: 'Cilindro (furo)', icon: 'cylh' }
  };

  /* ---------- Ferramentas do Tinkercad (para o indicador de domínio) ---------- */
  TM.TOOLS = {
    inserir: { nome: 'Inserir formas', atalho: 'arrastar', desc: 'Arrastar uma forma do painel "Formas básicas" para o plano de trabalho.' },
    navegar: { nome: 'Navegação 3D', atalho: 'botão dir. / roda / F', desc: 'Orbitar (botão direito), deslocar (Shift + botão direito ou botão do meio), zoom (roda) e Ajustar à vista (F). Cubo de vista no canto.' },
    dimensionar: { nome: 'Redimensionar', atalho: 'alças brancas', desc: 'Alças brancas dos cantos e laterais. Shift mantém a proporção; Alt redimensiona a partir do centro. Clique no número para digitar a medida.' },
    rotacionar: { nome: 'Rotação', atalho: 'setas curvas', desc: 'Setas curvas em volta da forma. Gira em passos de 22,5°; segurando Shift, em passos de 45°. É possível digitar o ângulo.' },
    elevar: { nome: 'Elevação (Z)', atalho: 'cone preto / Ctrl+↑↓', desc: 'O cone preto acima da forma levanta ou abaixa no eixo Z. Ctrl + seta para cima/baixo também move em Z. D solta no plano.' },
    mover: { nome: 'Posicionar (X/Y)', atalho: 'arrastar / setas', desc: 'Arrastar no plano ou usar as setas do teclado (1 passo da grade; Shift = 10 passos).' },
    cor: { nome: 'Cor e Multicor', atalho: 'Inspetor', desc: 'No Inspetor de formas escolhe-se a cor do sólido. Em grupos, a opção "Multicor" preserva as cores originais.' },
    propriedades: { nome: 'Propriedades da forma', atalho: 'Inspetor', desc: 'Parâmetros da forma: lados, raio, passos, chanfro, espessura da parede (Tubo), raio do topo (Cone).' },
    furo: { nome: 'Furo', atalho: 'H', desc: 'Transforma a forma em furo (translúcida, listrada). O furo só "corta" depois de agrupado com o sólido. S volta a sólido.' },
    agrupar: { nome: 'Agrupar / Desagrupar', atalho: 'Ctrl+G / Ctrl+Shift+G', desc: 'Agrupar une formas e aplica os furos. Desagrupar devolve as peças originais para edição.' },
    alinhar: { nome: 'Alinhar', atalho: 'L', desc: 'Com duas ou mais formas selecionadas, mostra pontos de alinhamento em X, Y e Z. Clicar antes numa forma a torna a referência fixa.' },
    regua: { nome: 'Régua', atalho: 'R', desc: 'Posicionada no plano, mostra distâncias e dimensões da forma selecionada; permite digitar posições exatas em mm.' },
    grade: { nome: 'Ajustar grade', atalho: 'canto inferior direito', desc: 'Define o passo do movimento: 0,1 / 0,25 / 0,5 / 1 / 2 / 5 / 10 mm ou desligado.' },
    duplicar: { nome: 'Duplicar e repetir', atalho: 'Ctrl+D', desc: 'Cria uma cópia no mesmo lugar. Mova/gire a cópia e aperte Ctrl+D de novo: o Tinkercad repete a mesma transformação.' },
    copiar: { nome: 'Copiar e colar', atalho: 'Ctrl+C / Ctrl+V', desc: 'Copia a forma; a cópia colada aparece deslocada.' },
    espelhar: { nome: 'Espelhar', atalho: 'M', desc: 'Mostra setas em cada eixo; clicar numa seta inverte a forma naquele eixo (útil para peças simétricas).' },
    plano: { nome: 'Plano de trabalho', atalho: 'W', desc: 'Coloca um plano de trabalho temporário sobre a face de uma forma, para construir em superfícies inclinadas ou elevadas.' },
    ocultar: { nome: 'Ocultar / Bloquear', atalho: 'Ctrl+H / Ctrl+L', desc: 'Oculta formas que atrapalham a visão ou trava peças prontas para não movê-las sem querer.' }
  };

  /* ---------- Construtores de forma ----------
     Coordenadas no padrão do Tinkercad: X (direita), Y (fundo), Z (altura), em mm.
     p = [x, y, z] → x,y = centro da forma no plano; z = elevação da base (como no Tinkercad).
     s = [largura X, profundidade Y, altura Z].
     o = { c: cor, n: nome da peça, r: [rx, ry, rz] em graus, hole: true, g: grupo, ... } */
  function part(t, s, p, o) {
    o = o || {};
    if (typeof o === 'string') o = { c: o };
    return Object.assign({ t, s, p: p || [0, 0, 0], c: TM.C.blue }, o, { c: TM.C[o.c] || o.c || TM.C.blue });
  }
  const S = (TM.S = {
    box: (w, d, h, x, y, z, o) => part('box', [w, d, h], [x || 0, y || 0, z || 0], o),
    cyl: (dx, dy, h, x, y, z, o) => part('cyl', [dx, dy, h], [x || 0, y || 0, z || 0], o),
    sphere: (dx, dy, dz, x, y, z, o) => part('sphere', [dx, dy, dz], [x || 0, y || 0, z || 0], o),
    hemi: (dx, dy, h, x, y, z, o) => part('hemi', [dx, dy, h], [x || 0, y || 0, z || 0], o),
    cone: (dx, dy, h, x, y, z, o) => part('cone', [dx, dy, h], [x || 0, y || 0, z || 0], o),
    pyr: (w, d, h, x, y, z, o) => part('pyr', [w, d, h], [x || 0, y || 0, z || 0], o),
    roof: (w, d, h, x, y, z, o) => part('roof', [w, d, h], [x || 0, y || 0, z || 0], o),
    rroof: (w, d, h, x, y, z, o) => part('rroof', [w, d, h], [x || 0, y || 0, z || 0], o),
    wedge: (w, d, h, x, y, z, o) => part('wedge', [w, d, h], [x || 0, y || 0, z || 0], o),
    poly: (dx, dy, h, x, y, z, o) => part('poly', [dx, dy, h], [x || 0, y || 0, z || 0], Object.assign({ sides: 6 }, typeof o === 'string' ? { c: o } : o)),
    para: (dx, dy, h, x, y, z, o) => part('para', [dx, dy, h], [x || 0, y || 0, z || 0], o),
    /* Toroide: diâmetro externo D e espessura do anel t (altura = t) */
    torus: (D, t, x, y, z, o) => part('torus', [D, D, t], [x || 0, y || 0, z || 0], o),
    /* Tubo: diâmetro externo, altura e espessura da parede */
    tube: (D, h, wall, x, y, z, o) => part('tube', [D, D, h], [x || 0, y || 0, z || 0], Object.assign({ wall }, typeof o === 'string' ? { c: o } : o)),
    /* Furos */
    hbox: (w, d, h, x, y, z, o) => part('box', [w, d, h], [x || 0, y || 0, z || 0], Object.assign({ hole: true }, o || {})),
    hcyl: (dx, dy, h, x, y, z, o) => part('cyl', [dx, dy, h], [x || 0, y || 0, z || 0], Object.assign({ hole: true }, o || {}))
  });

  /* Repetição circular: n cópias girando em torno de (cx, cy) a partir de uma fábrica (ang em graus) */
  S.ring = (n, radius, cx, cy, make, startDeg) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (startDeg || 0) + (360 / n) * i;
      const rad = (a * Math.PI) / 180;
      out.push(...[].concat(make(cx + radius * Math.cos(rad), cy + radius * Math.sin(rad), a, i)));
    }
    return out;
  };
  /* Repetição em grade */
  S.grid = (nx, ny, dx, dy, x0, y0, make) => {
    const out = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) out.push(...[].concat(make(x0 + i * dx, y0 + j * dy, i, j)));
    return out;
  };
  /* Espelha peças em X (cria a cópia simétrica) */
  S.mirrorX = (parts) => parts.concat(parts.map((q) => Object.assign({}, q, { p: [-q.p[0], q.p[1], q.p[2]], r: q.r ? [q.r[0], -q.r[1], -q.r[2]] : undefined })));
  S.mirrorY = (parts) => parts.concat(parts.map((q) => Object.assign({}, q, { p: [q.p[0], -q.p[1], q.p[2]], r: q.r ? [-q.r[0], q.r[1], -q.r[2]] : undefined })));

  /* ---------- Dificuldade ---------- */
  TM.DIFF = ['', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Especialista'];

  /* ---------- Pontuação ---------- */
  TM.HINT_PENALTY = [0, 0.1, 0.25, 0.5]; // desconto acumulado por nível de dica aberto
  TM.basePoints = (ph) => 80 + 20 * ph.diff;
  TM.score = (ph, result, hintLevel) => {
    const mult = result === 'A' ? 1 : result === 'O' ? 0.8 : 0;
    return Math.round(TM.basePoints(ph) * mult * (1 - TM.HINT_PENALTY[hintLevel || 0]));
  };
  TM.RESULTS = {
    A: { nome: 'APROVADO', cls: 'ok' },
    O: { nome: 'APROVADO COM OBSERVAÇÕES', cls: 'obs' },
    R: { nome: 'PRECISA REFAZER', cls: 'redo' }
  };

  /* ---------- Código de registro da avaliação ----------
     Formato: TM-012-A-K3Q7  (fase, resultado, verificação)
     O professor Claude gera com tools/gerar-codigo.js; o app confere aqui. */
  TM.hash = (str) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  };
  const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  TM.makeCode = (phase, result) => {
    let h = TM.hash('TINKERCAD-MASTER|' + phase + '|' + result + '|formas-basicas');
    let s = '';
    for (let i = 0; i < 4; i++) { s += ALPH[h % 32]; h = Math.floor(h / 32); }
    return 'TM-' + String(phase).padStart(3, '0') + '-' + result + '-' + s;
  };
  TM.parseCode = (raw) => {
    const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    const m = code.match(/^TM-(\d{3})-([AOR])-([A-Z0-9]{4})$/);
    if (!m) return { ok: false, erro: 'Formato inválido. O código tem o formato TM-012-A-XXXX.' };
    const phase = parseInt(m[1], 10);
    if (code !== TM.makeCode(phase, m[2])) return { ok: false, erro: 'Código não confere. Verifique se copiou exatamente o código que o professor Claude enviou.' };
    return { ok: true, phase, result: m[2], code };
  };

  /* Registro dos módulos (preenchido pelos arquivos js/data/m*.js) */
  TM.modules = TM.modules || [];
  TM.addModule = (m) => { TM.modules.push(m); TM.modules.sort((a, b) => a.n - b.n); };
  TM.allPhases = () => TM.modules.flatMap((m) => m.phases.map((p) => Object.assign(p, { mod: m.n })));
})();
