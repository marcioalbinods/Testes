/* MOSAICO SECRETO — Sons (gerados no navegador, sem arquivos) e voz. */
(function () {
  'use strict';
  let ctx = null;
  let soundOn = true, voiceOn = true;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, opts) {
    if (!soundOn) return;
    const c = ac(); if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(freq * opts.slide, t0 + dur);
    const v = opts.vol || 0.18;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  // escala pentatônica: cada cor da legenda tem a sua nota
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1568];

  const Sfx = {
    setSound(on) { soundOn = !!on; },
    setVoice(on) { voiceOn = !!on; if (!on && window.speechSynthesis) speechSynthesis.cancel(); },
    unlock() { if (soundOn) ac(); },
    click() { tone(660, 0.08, { type: 'triangle', vol: 0.12 }); },
    pop(i) {
      const f = SCALE[(i || 0) % SCALE.length];
      tone(f, 0.14, { type: 'triangle', vol: 0.16, slide: 1.25 });
    },
    chime() {
      [0, 0.09, 0.18].forEach((d, k) => tone([784, 988, 1319][k], 0.25, { type: 'sine', vol: 0.16, delay: d }));
    },
    cheer() {
      [523, 659, 784, 1047].forEach((f, k) => tone(f, 0.18, { type: 'triangle', vol: 0.14, delay: k * 0.07 }));
    },
    fanfare() {
      const notes = [523, 523, 523, 659, 784, 659, 784, 1047];
      const times = [0, 0.12, 0.24, 0.36, 0.56, 0.72, 0.84, 1.0];
      notes.forEach((f, k) => tone(f, k === 7 ? 0.7 : 0.2, { type: 'square', vol: 0.07, delay: times[k] }));
      notes.forEach((f, k) => tone(f / 2, k === 7 ? 0.7 : 0.2, { type: 'triangle', vol: 0.1, delay: times[k] }));
    },
    locked() { tone(220, 0.18, { type: 'sine', vol: 0.12, slide: 0.8 }); },
    speak(text, opts) {
      if (!voiceOn || !window.speechSynthesis) return;
      try {
        opts = opts || {};
        if (!opts.queue) speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        const v = speechSynthesis.getVoices().find((x) => /pt[-_]BR/i.test(x.lang)) ||
                  speechSynthesis.getVoices().find((x) => /^pt/i.test(x.lang));
        if (v) u.voice = v;
        u.rate = opts.rate || 0.92; u.pitch = 1.1;
        speechSynthesis.speak(u);
      } catch (e) { /* sem voz neste navegador */ }
    }
  };
  if (window.speechSynthesis) speechSynthesis.getVoices();
  window.Sfx = Sfx;
})();
