/* =========================================================
   CAÇADORES DE LETRAS — Cronômetro baseado em timestamps
   O tempo é calculado pela diferença entre horários (Date.now),
   então continua correto mesmo se a aba for trocada ou o
   navegador minimizado.
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});

  function Timer() {
    this.startedAt = null; // timestamp do último "start/resume"
    this.accum = 0;        // tempo acumulado antes da última pausa
    this.running = false;
  }
  Timer.prototype.start = function () {
    this.accum = 0;
    this.startedAt = Date.now();
    this.running = true;
  };
  Timer.prototype.pause = function () {
    if (!this.running) return;
    this.accum += Date.now() - this.startedAt;
    this.running = false;
  };
  Timer.prototype.resume = function () {
    if (this.running) return;
    this.startedAt = Date.now();
    this.running = true;
  };
  Timer.prototype.stop = function () {
    this.pause();
    return this.accum;
  };
  Timer.prototype.reset = function () {
    this.accum = 0;
    this.startedAt = null;
    this.running = false;
  };
  Timer.prototype.elapsed = function () {
    return this.accum + (this.running ? Date.now() - this.startedAt : 0);
  };

  CDL.Timer = Timer;

  CDL.formatTime = function (ms, long) {
    const total = Math.max(0, Math.floor((ms || 0) / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (long) {
      const parts = [];
      if (h) parts.push(h + 'h');
      if (h || m) parts.push(m + ' min');
      parts.push(s + ' s');
      return parts.join(' ');
    }
    return (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(s);
  };
})();
