/* ATELIÊ AFRO — salvamento automático no próprio aparelho (localStorage).
 * Nada é enviado para a internet. Nenhum dado pessoal é pedido.
 */
(function (AA) {
  'use strict';
  const PREFIXO = 'atelie-afro:v1:';
  let memoria = {}; // reserva caso o navegador bloqueie o armazenamento
  const ler = (k) => {
    try { const v = localStorage.getItem(PREFIXO + k); return v == null ? memoria[k] || null : JSON.parse(v); } catch (e) { return memoria[k] || null; }
  };
  const gravar = (k, v) => {
    memoria[k] = v;
    try { localStorage.setItem(PREFIXO + k, JSON.stringify(v)); return true; } catch (e) { return false; }
  };
  const remover = (k) => {
    delete memoria[k];
    try { localStorage.removeItem(PREFIXO + k); } catch (e) { /* ignora */ }
  };

  AA.Salvar = {
    // pintura: { f: {indice: cor}, total: n, feito: bool, t: data }
    pintura: (id) => ler('d:' + id) || { f: {}, total: 0, feito: false, t: 0 },
    guardarPintura: (id, dados) => { dados.t = Date.now(); return gravar('d:' + id, dados); },
    apagarPintura: (id) => remover('d:' + id),
    estado: (id) => {
      const p = ler('d:' + id);
      if (!p || !p.f || Object.keys(p.f).length === 0) return 'novo';
      return p.feito ? 'concluido' : 'andamento';
    },
    preferencia: (k, padrao) => { const v = ler('pref:' + k); return v == null ? padrao : v; },
    guardarPreferencia: (k, v) => gravar('pref:' + k, v),
    ultimo: () => ler('ultimo'),
    guardarUltimo: (id) => gravar('ultimo', id),
    apagarTudo: () => {
      memoria = {};
      try {
        const chaves = [];
        for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(PREFIXO) === 0 && k.indexOf(PREFIXO + 'pref:') !== 0) chaves.push(k); }
        chaves.forEach((k) => localStorage.removeItem(k));
      } catch (e) { /* ignora */ }
    }
  };
})(window.AA);
