/* ATELIÊ AFRO — navegação entre telas, janelas, comemoração e tela inicial. */
(function (AA) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const App = {};
  AA.App = App;

  /* ---------- telas (com o botão "voltar" do Android funcionando) ---------- */
  const mostrar = (nome) => {
    document.querySelectorAll('.tela').forEach((t) => t.classList.toggle('ativa', t.id === 'tela-' + nome));
    document.body.dataset.tela = nome;
  };
  const rota = () => {
    const h = decodeURIComponent(location.hash.replace('#', ''));
    if (h.indexOf('pintar/') === 0) {
      const d = AA.DESENHOS.find((x) => x.id === h.slice(7));
      if (d) {
        mostrar('pintura');
        AA.Galeria.colecao = d.col;
        AA.Salvar.guardarPreferencia('colecao', d.col);
        const col = AA.COLECOES[d.col - 1];
        $('chip-colecao').textContent = col.curto;
        $('chip-colecao').style.background = col.cor;
        $('num-desenho').innerHTML = `<span class="num-bola" style="--cc:${col.cor}">${d.n}</span><span class="num-titulo">${d.titulo}</span>`;
        $('painel').style.setProperty('--cc', col.cor);
        requestAnimationFrame(() => AA.Pintura.abrir(d));
        return;
      }
    }
    if (h === 'galeria') { AA.Galeria.montar(); mostrar('galeria'); return; }
    mostrar('inicio');
  };
  const ir = (h) => { if (location.hash === '#' + h) rota(); else location.hash = h; };
  App.abrirDesenho = (d) => { AA.Galeria.colecao = d.col; AA.Salvar.guardarPreferencia('colecao', d.col); ir('pintar/' + d.id); };

  /* ---------- janela de confirmação (ícones grandes: X e ✓) ---------- */
  let aoConfirmar = null;
  App.confirmar = (texto, ico, fn, imagem) => {
    aoConfirmar = fn;
    $('confirmar-texto').textContent = texto;
    const box = $('confirmar-ico');
    box.innerHTML = '';
    if (imagem) { imagem.classList.add('confirmar-mini'); box.appendChild(imagem); } else box.innerHTML = `<span class="ico">${AA.icone(ico || 'lixo')}</span>`;
    $('janela-confirmar').hidden = false;
    AA.Som.clique();
  };
  const fecharConfirmar = (sim) => {
    $('janela-confirmar').hidden = true;
    const fn = aoConfirmar;
    aoConfirmar = null;
    if (sim && fn) fn();
  };

  /* ---------- aviso rápido ---------- */
  let avisoTimer = null;
  App.aviso = (texto, ico) => {
    const a = $('aviso');
    a.innerHTML = (ico ? `<span class="ico">${AA.icone(ico)}</span>` : '') + texto;
    a.classList.add('ver');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => a.classList.remove('ver'), 1800);
  };

  /* ---------- comemoração ---------- */
  const MENSAGENS = ['Que lindo!', 'Você arrasou!', 'Sua arte ficou incrível!', 'Que obra de arte!', 'Muito criativo!', 'Ficou maravilhoso!'];
  App.festa = () => {
    const d = AA.Pintura.desenho;
    $('festa-msg').textContent = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)];
    const mini = $('festa-mini');
    mini.innerHTML = '';
    mini.appendChild(AA.Galeria.miniatura(d, 'f-'));
    const est = $('festa-estrelas');
    let html = '';
    const cores = ['#FFC21A', '#FF4F8B', '#3D7BFF', '#18B46B', '#FF7A1A', '#B04BE0'];
    for (let i = 0; i < 28; i++) {
      const x = Math.random() * 100, atraso = Math.random() * 0.8, dur = 1.6 + Math.random() * 1.4, tam = 18 + Math.random() * 30;
      html += `<span class="estrela-voa" style="left:${x}%;--d:${dur}s;--a:${atraso}s;--t:${tam}px;color:${cores[i % cores.length]}">${AA.icone('estrela')}</span>`;
    }
    est.innerHTML = html;
    $('festa').hidden = false;
    AA.Som.festa();
  };

  /* ---------- tela inicial: ilustração colorida de crianças ---------- */
  const arteInicio = () => {
    const A = AA.A, P = AA.P;
    A.idPrefix = 'ini';
    A.idCount = 0;
    A.swStack = [3.4];
    const base = { iris: '#3B2314', lip: '#8A3B32', lip2: '#7A3028', mouth: '#5A1F1F', tongue: '#E57373', teeth: '#FFFFFF', eye: '#FFFFFF' };
    const kids = [
      [{ hair: 'puffs', puffSize: 0.95, nose: 'round', mouth: 'grin', lashes: true, freckles: true, neckline: 'round', paint: Object.assign({}, base, { skin: '#8D5524', hair: '#2A1810', hair2: '#2A1810', top: '#FF4F8B', top2: '#FFC21A', acc: '#FFC21A', acc2: '#3D7BFF' }) }, 95, 150, 0.78],
      [{ hair: 'locs', locLen: 1.5, nose: 'broad', mouth: 'grin', neckline: 'v', paint: Object.assign({}, base, { skin: '#5A3825', hair: '#1D1D1F', top: '#18B46B', top2: '#FFC21A', acc: '#FFC21A' }) }, 225, 145, 0.8],
      [{ hair: 'afro', afroSize: 0.95, nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, earrings: 'stud', neckline: 'round', paint: Object.assign({}, base, { skin: '#C68642', hair: '#3D2314', top: '#FFC21A', top2: '#FF7A1A', acc4: '#FF4F8B' }) }, 375, 150, 0.8],
      [{ hair: 'boxbraids', nose: 'wide', mouth: 'grin', lashes: true, neckline: 'round', paint: Object.assign({}, base, { skin: '#3D2314', hair: '#1D1D1F', top: '#3D7BFF', top2: '#FFC21A', acc: '#FF4F8B', acc2: '#FFC21A', acc3: '#B04BE0', acc4: '#FFC21A' }) }, 505, 148, 0.78]
    ];
    let s = '';
    kids.forEach(([o, x, y, sc]) => { s += A.G(x, y, sc, () => P.bust(Object.assign({ bottom: (330 - y) / sc }, o))); });
    $('inicio-arte').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 330" class="aa-art" stroke-width="3.4">${A.STYLE}${s}</svg>`;
  };

  /* ---------- tela cheia ---------- */
  const telaCheia = () => {
    const el = document.documentElement;
    const ativo = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (ativo) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } catch (e) { App.aviso('Tela cheia não disponível', 'x'); }
  };
  const atualizarTelaCheia = () => {
    const ativo = document.fullscreenElement || document.webkitFullscreenElement;
    $('btn-tela-cheia').innerHTML = `<span class="ico">${AA.icone(ativo ? 'sairtela' : 'telacheia')}</span>`;
    setTimeout(() => AA.Pintura.ajustar && document.body.dataset.tela === 'pintura' && AA.Pintura.ajustar(), 200);
  };

  const atualizarSom = () => {
    document.querySelectorAll('[data-acao="som"]').forEach((b) => {
      b.innerHTML = `<span class="ico">${AA.icone(AA.Som.ligado() ? 'somon' : 'somoff')}</span>`;
      b.classList.toggle('desligado', !AA.Som.ligado());
    });
  };

  /* ---------- início ---------- */
  App.iniciar = () => {
    AA.preencherIcones();
    $('btn-config').innerHTML = `<span class="ico">${AA.icone('engrenagem')}</span>`;
    arteInicio();
    AA.Pintura.iniciar();
    AA.Galeria.iniciar();
    atualizarSom();
    atualizarTelaCheia();

    $('btn-comecar').addEventListener('click', () => {
      AA.Som.clique();
      // continua o último desenho começado; se não houver, abre o primeiro ainda não concluído
      const ult = AA.Salvar.ultimo();
      let d = ult && AA.DESENHOS.find((x) => x.id === ult && AA.Salvar.estado(x.id) === 'andamento');
      if (!d) d = AA.DESENHOS.find((x) => AA.Salvar.estado(x.id) !== 'concluido') || AA.DESENHOS[0];
      App.abrirDesenho(d);
    });
    $('btn-galeria').addEventListener('click', () => { AA.Som.clique(); ir('galeria'); });
    $('btn-galeria-voltar').addEventListener('click', () => { AA.Som.clique(); ir('inicio'); });
    $('btn-voltar').addEventListener('click', () => { AA.Som.clique(); AA.Pintura.salvar(); ir('galeria'); });
    document.querySelectorAll('[data-acao="som"]').forEach((b) => b.addEventListener('click', () => { AA.Som.alternar(); atualizarSom(); }));
    $('btn-tela-cheia').addEventListener('click', telaCheia);
    document.addEventListener('fullscreenchange', atualizarTelaCheia);
    document.addEventListener('webkitfullscreenchange', atualizarTelaCheia);

    $('confirmar-sim').addEventListener('click', () => fecharConfirmar(true));
    $('confirmar-nao').addEventListener('click', () => { AA.Som.clique(); fecharConfirmar(false); });
    $('janela-confirmar').addEventListener('click', (e) => { if (e.target.id === 'janela-confirmar') fecharConfirmar(false); });

    $('festa-ok').addEventListener('click', () => { $('festa').hidden = true; AA.Som.clique(); });
    $('festa-galeria').addEventListener('click', () => { $('festa').hidden = true; AA.Som.clique(); ir('galeria'); });

    $('btn-config').addEventListener('click', () => { AA.Som.clique(); $('janela-config').hidden = false; });
    $('btn-config-fechar').addEventListener('click', () => { AA.Som.clique(); $('janela-config').hidden = true; });
    $('btn-apagar-tudo').addEventListener('click', () => {
      $('janela-config').hidden = true;
      App.confirmar('Apagar TODAS as pinturas deste aparelho?', 'lixo', () => { AA.Salvar.apagarTudo(); App.aviso('Tudo limpo!', 'check'); });
    });

    document.addEventListener('keydown', (e) => {
      if (document.body.dataset.tela !== 'pintura') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) AA.Pintura.acaoRefazer(); else AA.Pintura.acaoDesfazer(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); AA.Pintura.acaoRefazer(); }
      if (e.key === 'Escape' && !$('janela-confirmar').hidden) fecharConfirmar(false);
    });

    window.addEventListener('hashchange', rota);
    rota();

    // funciona sem internet depois do primeiro carregamento
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* ignora */ });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.iniciar);
  else App.iniciar();
})(window.AA);
