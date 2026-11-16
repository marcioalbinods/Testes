/* ATELIÊ AFRO — galeria com as 5 coleções e as miniaturas coloridas. */
(function (AA) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const G = { colecao: AA.Salvar.preferencia('colecao', 1) };
  AA.Galeria = G;

  // miniatura com as cores salvas (ids trocados para não colidir com o desenho aberto)
  G.miniatura = (d, prefixo) => {
    const pre = prefixo || 'm-';
    const svg = AA.svgDe(d).replace(/id="/g, `id="${pre}`).replace(/url\(#/g, `url(#${pre}`);
    const box = document.createElement('div');
    box.className = 'mini';
    box.innerHTML = svg;
    const f = AA.Salvar.pintura(d.id).f || {};
    const regs = box.querySelectorAll('.r');
    Object.keys(f).forEach((i) => { if (regs[i]) regs[i].style.fill = f[i]; });
    return box;
  };

  const doColecao = (n) => AA.DESENHOS.filter((d) => d.col === n);
  const contar = (n) => doColecao(n).filter((d) => AA.Salvar.estado(d.id) === 'concluido').length;

  G.montarAbas = () => {
    const abas = $('abas');
    abas.innerHTML = AA.COLECOES.map((c) => `
      <button class="aba${c.n === G.colecao ? ' ativa' : ''}" data-col="${c.n}" style="--cc:${c.cor}" aria-label="Coleção ${c.n}: ${c.nome}">
        <span class="aba-num">${c.n}</span>
        <span class="aba-ico" aria-hidden="true">${c.icone}</span>
        <span class="aba-nome">${c.curto}</span>
        <span class="aba-cont">${contar(c.n)}/10</span>
      </button>`).join('');
  };

  G.montar = () => {
    G.montarAbas();
    const col = AA.COLECOES[G.colecao - 1];
    document.documentElement.style.setProperty('--cc', col.cor);
    $('colecao-nome').textContent = col.nome;
    $('colecao-nome').style.setProperty('--cc', col.cor);
    const total = AA.DESENHOS.filter((d) => AA.Salvar.estado(d.id) === 'concluido').length;
    $('contador-total').innerHTML = `<span class="ico">${AA.icone('estrela')}</span> ${total}/${AA.DESENHOS.length}`;
    const grade = $('grade');
    grade.innerHTML = '';
    doColecao(G.colecao).forEach((d) => {
      const est = AA.Salvar.estado(d.id);
      const card = document.createElement('div');
      card.className = 'cartao est-' + est;
      card.style.setProperty('--cc', col.cor);
      const abrir = document.createElement('button');
      abrir.className = 'cartao-abrir';
      abrir.setAttribute('aria-label', `Desenho ${d.n}: ${d.titulo}`);
      abrir.appendChild(G.miniatura(d, 'm' + d.id + '-'));
      abrir.insertAdjacentHTML('beforeend', `<span class="cartao-num">${d.n}</span>` +
        `<span class="cartao-est" title="${est === 'concluido' ? 'Pronto' : est === 'andamento' ? 'Começado' : 'Novo'}">${AA.icone(est === 'concluido' ? 'estrela' : est === 'andamento' ? 'andamento' : 'novo')}</span>`);
      abrir.addEventListener('click', () => { AA.Som.clique(); AA.App.abrirDesenho(d); });
      card.appendChild(abrir);
      if (est !== 'novo') {
        const apagar = document.createElement('button');
        apagar.className = 'cartao-apagar';
        apagar.setAttribute('aria-label', 'Apagar esta pintura');
        apagar.innerHTML = AA.icone('lixo');
        apagar.addEventListener('click', (e) => {
          e.stopPropagation();
          AA.App.confirmar('Apagar esta pintura?', 'lixo', () => { AA.Salvar.apagarPintura(d.id); AA.Som.apagar(); G.montar(); }, card.querySelector('.mini').cloneNode(true));
        });
        card.appendChild(apagar);
      }
      grade.appendChild(card);
    });
  };

  G.iniciar = () => {
    $('abas').addEventListener('click', (e) => {
      const b = e.target.closest('.aba');
      if (!b) return;
      G.colecao = +b.dataset.col;
      AA.Salvar.guardarPreferencia('colecao', G.colecao);
      AA.Som.clique();
      G.montar();
      $('grade').scrollTop = 0;
    });
  };
})(window.AA);
