/* =====================================================================
   Áudio sintetizado (Web Audio API) — sem arquivos externos.
   Efeitos sonoros e música ambiente opcionais.
   ===================================================================== */
(function () {
  'use strict';
  let ctx = null, master = null, musicGain = null, musicTimer = null, musicOn = false, sfxOn = true;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.0; musicGain.connect(master);
    return ctx;
  }

  function tone(freq, dur, type, vol, when, dest) {
    if (!ensure()) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function sweep(f1, f2, dur, type, vol) {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sawtooth';
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200;
    o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }

  const SFX = {
    click: () => tone(880, 0.06, 'triangle', 0.08),
    hover: () => tone(1320, 0.03, 'sine', 0.03),
    select: () => { tone(660, 0.07, 'triangle', 0.1); tone(990, 0.08, 'triangle', 0.07, 0.04); },
    drop: () => { tone(520, 0.06, 'square', 0.05); tone(780, 0.09, 'triangle', 0.08, 0.03); },
    type: () => tone(1800 + Math.random() * 400, 0.015, 'square', 0.015),
    scan: () => sweep(400, 1600, 0.35, 'sine', 0.06),
    success: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.08)); },
    error: () => { tone(220, 0.18, 'sawtooth', 0.06); tone(196, 0.25, 'sawtooth', 0.05, 0.12); },
    whoosh: () => sweep(200, 1200, 0.3, 'sawtooth', 0.04),
    unlock: () => { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.3, 'triangle', 0.1, i * 0.07)); },
    levelup: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'square', 0.06, i * 0.09)); },
    medal: () => { [659, 784, 988, 1319].forEach((f, i) => { tone(f, 0.5, 'triangle', 0.1, i * 0.12); tone(f / 2, 0.5, 'sine', 0.06, i * 0.12); }); },
    glitch: () => { for (let i = 0; i < 6; i++) tone(100 + Math.random() * 900, 0.04, 'square', 0.04, i * 0.04); },
    xp: () => tone(1568, 0.08, 'sine', 0.06)
  };

  function play(name) { if (!sfxOn) return; try { SFX[name] && SFX[name](); } catch (e) { /* sem áudio */ } }

  /* Música ambiente procedural: acordes suaves + arpejo */
  const CHORDS = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7], [164.8, 207.7, 246.9]];
  let step = 0;
  function musicTick() {
    if (!musicOn || !ctx) return;
    const ch = CHORDS[Math.floor(step / 8) % CHORDS.length];
    if (step % 8 === 0) ch.forEach((f) => tone(f / 2, 3.6, 'sine', 0.05, 0, musicGain));
    const arp = [0, 1, 2, 1, 2, 0, 2, 1];
    tone(ch[arp[step % 8]] * 2, 0.35, 'triangle', 0.025, 0, musicGain);
    step++;
  }
  function setMusic(on) {
    musicOn = !!on;
    if (musicOn) {
      if (!ensure()) return;
      musicGain.gain.cancelScheduledValues(ctx.currentTime);
      musicGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1);
      if (!musicTimer) musicTimer = setInterval(musicTick, 450);
    } else {
      if (musicGain && ctx) musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      clearInterval(musicTimer); musicTimer = null;
    }
  }
  function setSfx(on) { sfxOn = !!on; }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  window.AUDIO = { play, setMusic, setSfx, unlock: ensure };
})();
