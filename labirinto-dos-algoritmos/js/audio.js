/* =========================================================
   LABIRINTO DOS ALGORITMOS — Sons (gerados na hora, sem arquivos)
   ========================================================= */
(function (LA) {
  'use strict';
  var ctx = null;
  function ac() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when, slide) {
    var c = ac(); if (!c) return;
    var t = c.currentTime + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  var SFX = {
    click: function () { tone(660, 0.06, 'triangle', 0.08); },
    step: function () { tone(220, 0.07, 'square', 0.04); tone(330, 0.05, 'triangle', 0.04, 0.05); },
    turn: function () { tone(440, 0.08, 'triangle', 0.06, 0, 560); },
    wait: function () { tone(300, 0.1, 'sine', 0.05); },
    collect: function () { tone(880, 0.09, 'triangle', 0.12); tone(1320, 0.14, 'triangle', 0.12, 0.08); },
    door: function () { tone(180, 0.25, 'sawtooth', 0.06, 0, 90); tone(520, 0.12, 'triangle', 0.08, 0.2); },
    switch: function () { tone(500, 0.06, 'square', 0.06); tone(750, 0.08, 'square', 0.06, 0.07); },
    bump: function () { tone(140, 0.2, 'square', 0.1, 0, 70); },
    zap: function () { tone(1200, 0.3, 'sawtooth', 0.08, 0, 80); },
    fail: function () { tone(392, 0.18, 'triangle', 0.1); tone(311, 0.18, 'triangle', 0.1, 0.18); tone(233, 0.35, 'triangle', 0.1, 0.36); },
    cond: function () { tone(990, 0.05, 'sine', 0.05); },
    win: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.18, 'triangle', 0.12, i * 0.11); }); tone(1318, 0.5, 'triangle', 0.1, 0.48); },
    star: function (i) { tone(880 + (i || 0) * 220, 0.18, 'triangle', 0.12); },
    unlock: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, 0.16, 'square', 0.05, i * 0.09); }); }
  };
  LA.sfx = function (name, arg) {
    if (!LA.Store || !LA.Store.data || !LA.Store.settings.sound) return;
    try { SFX[name] && SFX[name](arg); } catch (e) { /* sem som */ }
  };
  LA.unlockAudio = function () { ac(); };
})(globalThis.LA = globalThis.LA || {});
