/* =========================================================
   CAÇADORES DE LETRAS — Sons (sintetizados com Web Audio)
   Nenhum arquivo de áudio é necessário: funciona offline.
   Narração opcional usa a voz do próprio dispositivo (pt-BR).
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});

  let ctx = null;
  let master = null;
  const state = { sound: true, voice: true, volume: 0.6 };

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = state.volume * 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, start, dur, type = 'sine', vol = 0.3, slideTo) {
    const c = ensure();
    if (!c || !state.sound) return;
    const t0 = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  const SFX = {
    tap: () => tone(660, 0, 0.08, 'triangle', 0.15),
    select: () => tone(880, 0, 0.1, 'triangle', 0.2),
    correct: () => { tone(784, 0, 0.16, 'triangle', 0.28); tone(1175, 0.1, 0.26, 'triangle', 0.24); },
    wrong: () => { tone(300, 0, 0.22, 'sine', 0.2, 220); },
    hint: () => { tone(988, 0, 0.12, 'sine', 0.16); tone(1319, 0.12, 0.18, 'sine', 0.14); },
    complete: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.35, 'triangle', 0.24)),
    star: () => tone(1568, 0, 0.25, 'sine', 0.18, 2093),
    unlock: () => {
      [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.14, 0.3, 'square', 0.08));
      [1047, 1319, 1568].forEach((f) => tone(f, 0.62, 0.8, 'triangle', 0.18));
    }
  };

  CDL.audio = {
    configure(opts) {
      Object.assign(state, opts);
      if (master) master.gain.value = state.volume * 0.5;
    },
    unlock() { ensure(); },
    play(name) {
      try { if (state.sound && SFX[name]) SFX[name](); } catch (e) { /* som é opcional */ }
    },
    get voiceAvailable() { return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'; },
    speak(text, opts = {}) {
      if (!state.voice || !this.voiceAvailable) return;
      try {
        const synth = window.speechSynthesis;
        if (opts.interrupt !== false) synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = opts.rate || 0.9;
        u.pitch = 1.1;
        u.volume = Math.min(1, state.volume + 0.3);
        const voices = synth.getVoices ? synth.getVoices() : [];
        const v = voices.find((x) => /pt[-_]BR/i.test(x.lang)) || voices.find((x) => /^pt/i.test(x.lang));
        if (v) u.voice = v;
        synth.speak(u);
      } catch (e) { /* narração é opcional */ }
    },
    stopVoice() { try { if (this.voiceAvailable) window.speechSynthesis.cancel(); } catch (e) {} }
  };
})();
