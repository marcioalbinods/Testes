/* =========================================================
   LABIRINTO DOS ALGORITMOS — Utilidades de interface
   Telas, janelas, avisos, confete, arquivos.
   ========================================================= */
(function (LA) {
  'use strict';

  var UI = LA.UI = {};
  UI.$ = function (sel, root) { return (root || document).querySelector(sel); };
  UI.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  UI.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  UI.html = function (str) { var t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstElementChild; };
  UI.stars = function (n, total) {
    var s = '<span class="stars" aria-label="' + n + ' de ' + (total || 3) + ' estrelas">';
    for (var i = 0; i < (total || 3); i++) s += '<span class="star' + (i < n ? ' on' : '') + '">★</span>';
    return s + '</span>';
  };

  /* ---------- Telas ---------- */
  UI.current = null;
  var hooks = {};
  UI.onShow = function (id, fn) { hooks[id] = fn; };
  UI.show = function (id, arg) {
    UI.$$('.screen').forEach(function (s) { s.classList.remove('active'); });
    var el = UI.$('#scr-' + id);
    if (!el) return;
    el.classList.add('active');
    var prev = UI.current;
    UI.current = id;
    if (hooks[id]) hooks[id](arg, prev);
    var body = el.querySelector('.screen-body'); if (body) body.scrollTop = 0;
  };

  /* ---------- Janelas ---------- */
  var stack = [];
  UI.modal = function (opts) {
    return new Promise(function (resolve) {
      var root = UI.$('#modal-root');
      var back = document.createElement('div');
      back.className = 'modal-back';
      var box = document.createElement('div');
      box.className = 'modal' + (opts.wide ? ' wide' : '') + (opts.cls ? ' ' + opts.cls : '');
      box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      box.innerHTML = (opts.title ? '<h3>' + opts.title + '</h3>' : '') + (opts.html || '');
      if (opts.closable !== false) {
        var x = document.createElement('button');
        x.className = 'modal-close'; x.type = 'button'; x.setAttribute('aria-label', 'Fechar'); x.textContent = '✕';
        x.onclick = function () { close(opts.closeValue == null ? null : opts.closeValue); };
        box.appendChild(x);
      }
      if (opts.buttons && opts.buttons.length) {
        var acts = document.createElement('div'); acts.className = 'actions';
        opts.buttons.forEach(function (b) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn ' + (b.cls || '');
          btn.innerHTML = b.label;
          if (b.id) btn.id = b.id;
          btn.onclick = function () { LA.sfx('click'); if (b.keep) { b.onClick && b.onClick(); return; } close(b.value); };
          acts.appendChild(btn);
        });
        box.appendChild(acts);
      }
      back.appendChild(box);
      back.addEventListener('pointerdown', function (e) { if (e.target === back && opts.closable !== false && opts.backdropClose) close(null); });
      root.appendChild(back);
      var entry = { close: close, el: box };
      stack.push(entry);
      if (opts.onOpen) opts.onOpen(box, close);
      var first = box.querySelector('.actions .btn');
      if (first && !('ontouchstart' in window)) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }, 50);
      function close(v) {
        if (!back.parentNode) return;
        back.parentNode.removeChild(back);
        var i = stack.indexOf(entry); if (i >= 0) stack.splice(i, 1);
        resolve(v);
      }
    });
  };
  UI.closeAllModals = function () { stack.slice().forEach(function (m) { m.close(null); }); };
  UI.hasModal = function () { return stack.length > 0; };
  UI.confirm = function (title, text, yes, no, danger) {
    return UI.modal({
      title: title, html: '<p>' + text + '</p>',
      buttons: [{ label: no || 'Cancelar', value: false }, { label: yes || 'Confirmar', value: true, cls: danger ? 'btn-red' : 'btn-green' }]
    }).then(function (v) { return v === true; });
  };
  UI.alert = function (title, text) { return UI.modal({ title: title, html: '<p>' + text + '</p>', buttons: [{ label: 'OK', value: true, cls: 'btn-blue' }] }); };

  /* ---------- Avisos ---------- */
  UI.toast = function (icon, text, sub, ms) {
    var wrap = UI.$('#toasts');
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="ti">' + icon + '</span><div><b>' + text + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div>';
    wrap.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 320); }, ms || 3600);
  };

  /* ---------- Confete ---------- */
  UI.confetti = function (n) {
    if (document.body.classList.contains('reduce-motion')) return;
    var colors = ['#ffd23f', '#ff6b9a', '#1fc8b5', '#4c97ff', '#8b5cf6', '#34c759'];
    for (var i = 0; i < (n || 80); i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (1.8 + Math.random() * 1.8) + 's';
      c.style.animationDelay = (Math.random() * 0.6) + 's';
      c.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      document.body.appendChild(c);
      setTimeout(function (el) { return function () { el.remove(); }; }(c), 4500);
    }
  };

  /* ---------- Arquivos (sem internet) ---------- */
  UI.download = function (filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  };
  UI.pickFile = function () {
    return new Promise(function (resolve) {
      var inp = UI.$('#file-input');
      inp.value = '';
      inp.onchange = function () {
        var f = inp.files && inp.files[0];
        if (!f) { resolve(null); return; }
        var r = new FileReader();
        r.onload = function () { resolve({ name: f.name, text: String(r.result) }); };
        r.onerror = function () { resolve(null); };
        r.readAsText(f);
      };
      inp.click();
    });
  };

  /* ---------- Botão de segurar (para o professor) ---------- */
  UI.holdButton = function (btn, ms, done) {
    var fill = document.createElement('span'); fill.className = 'fill'; btn.appendChild(fill);
    btn.classList.add('hold-btn');
    var start = 0, raf = 0;
    function step() {
      var k = Math.min(1, (performance.now() - start) / ms);
      fill.style.width = (k * 100) + '%';
      if (k >= 1) { cancel(); done(); return; }
      raf = requestAnimationFrame(step);
    }
    function cancel() { cancelAnimationFrame(raf); start = 0; fill.style.width = '0'; }
    btn.addEventListener('pointerdown', function (e) { e.preventDefault(); start = performance.now(); raf = requestAnimationFrame(step); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, cancel); });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  };

  UI.fmtDate = function (t) {
    try { return new Date(t).toLocaleDateString('pt-BR'); } catch (e) { return ''; }
  };
})(globalThis.LA = globalThis.LA || {});
