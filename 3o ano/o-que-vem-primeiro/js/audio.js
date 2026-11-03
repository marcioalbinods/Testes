/* O QUE VEM PRIMEIRO? — Sons curtos gerados pelo navegador (sem arquivos de áudio). */
(function (root) {
  'use strict';
  let ctx = null;
  let on = true;
  function ac() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, vol) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + start;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const SOUNDS = {
    tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
    pick: () => { tone(520, 0, 0.07, 'triangle', 0.09); tone(780, 0.05, 0.08, 'triangle', 0.08); },
    drop: () => tone(392, 0, 0.12, 'triangle', 0.1),
    step: () => tone(880, 0, 0.09, 'sine', 0.07),
    good: () => { tone(523, 0, 0.12, 'triangle'); tone(659, 0.1, 0.12, 'triangle'); tone(784, 0.2, 0.22, 'triangle'); },
    oops: () => { tone(330, 0, 0.16, 'sine', 0.12); tone(262, 0.14, 0.24, 'sine', 0.1); },
    hint: () => { tone(988, 0, 0.1, 'sine', 0.07); tone(1319, 0.08, 0.16, 'sine', 0.06); },
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.2, 'triangle', 0.13)),
    medal: () => [392, 523, 659, 784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.12))
  };
  function play(name) {
    if (!on || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch (e) { /* sem som, sem problema */ }
  }
  root.OQVP = root.OQVP || {};
  root.OQVP.audio = { play, setOn: (v) => { on = !!v; }, isOn: () => on, unlock: () => { try { ac(); } catch (e) { /* ok */ } } };
})(window);
