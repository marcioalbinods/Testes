/* ATELIÊ AFRO — efeitos sonoros sintetizados (Web Audio), sem arquivos externos. Opcionais. */
(function (AA) {
  'use strict';
  let ctx = null;
  let ligado = AA.Salvar.preferencia('som', true);
  const audio = () => {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const tom = (freq, dur, tipo, vol, atraso, freqFim) => {
    const c = audio();
    if (!c) return;
    const t0 = c.currentTime + (atraso || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  };
  const notas = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77];
  let passo = 0;
  AA.Som = {
    ligado: () => ligado,
    alternar: () => { ligado = !ligado; AA.Salvar.guardarPreferencia('som', ligado); if (ligado) AA.Som.clique(); return ligado; },
    pintar: () => { if (!ligado) return; const n = notas[passo++ % notas.length]; tom(n, 0.16, 'sine', 0.16, 0, n * 1.5); },
    apagar: () => { if (!ligado) return; tom(500, 0.14, 'triangle', 0.12, 0, 200); },
    clique: () => { if (!ligado) return; tom(660, 0.07, 'square', 0.05); },
    desfazer: () => { if (!ligado) return; tom(440, 0.1, 'sine', 0.12, 0, 330); },
    salvar: () => { if (!ligado) return; tom(660, 0.12, 'sine', 0.14); tom(990, 0.18, 'sine', 0.14, 0.1); },
    festa: () => {
      if (!ligado) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => tom(n, 0.28, 'triangle', 0.16, i * 0.12));
      [1318.5, 1568, 2093].forEach((n, i) => tom(n, 0.2, 'sine', 0.08, 0.55 + i * 0.08));
    }
  };
})(window.AA);
