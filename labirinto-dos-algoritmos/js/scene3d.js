/* =========================================================
   LABIRINTO DOS ALGORITMOS — Cena 3D (Three.js, low poly, isométrica)
   A lógica fica no motor (engine.js). Aqui só desenhamos e animamos.
   ========================================================= */
(function (LA) {
  'use strict';
  var THREE = globalThis.THREE;

  /* ---------- Temas dos mundos ---------- */
  var THEMES = {
    vale: { sky: ['#7fcfff', '#e9f8ff'], floor: [0x93d46e, 0x84c95f], side: 0x8a5a3c, wall: 'hedge', wallColor: 0x4fa83f, wall2: 0x3d8f33, deco: 'vale', light: 0xfff4e0, hemi: [0xcfeeff, 0x6b8f4a], fog: '#d8f1ff' },
    floresta: { sky: ['#5fbf9a', '#e3f7e0'], floor: [0xc9b07a, 0xbda36c], side: 0x7a5232, wall: 'tree', wallColor: 0x2f8f4e, wall2: 0x3fae5e, deco: 'floresta', light: 0xfff0d0, hemi: [0xd5ffe5, 0x4f6f3a], fog: '#d4efd6' },
    fortaleza: { sky: ['#9fb0ff', '#f3e9ff'], floor: [0xdcd4c6, 0xcfc6b5], side: 0x857b6c, wall: 'stone', wallColor: 0x9c917f, wall2: 0x8a7f6d, deco: 'fortaleza', light: 0xfff2e6, hemi: [0xe8e4ff, 0x6c6258], fog: '#ece6ff' },
    laboratorio: { sky: ['#bfe3ff', '#ffffff'], floor: [0xeef2f8, 0xdfe6f0], side: 0x5d6b80, wall: 'metal', wallColor: 0x8ea2bf, wall2: 0x22d3ee, deco: 'laboratorio', light: 0xffffff, hemi: [0xffffff, 0x8090a8], fog: '#eef6ff' },
    nucleo: { sky: ['#140b33', '#3d1f78'], floor: [0x3d3478, 0x352d6b], side: 0x171238, wall: 'neon', wallColor: 0x3a2f7c, wall2: 0x7cf7ff, deco: 'nucleo', light: 0xd8ccff, hemi: [0x9a8cff, 0x201a40], fog: '#2a1d5c' }
  };
  LA.THEMES = THEMES;

  /* ---------- Materiais e geometrias reaproveitados ---------- */
  var matCache = {};
  var M = {
    std: function (color, o) {
      o = o || {};
      var k = 's' + color + JSON.stringify(o);
      if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial(Object.assign({ color: color, flatShading: true, roughness: 0.85, metalness: 0.05 }, o));
      return matCache[k];
    },
    glow: function (color, intensity) {
      var k = 'g' + color + '_' + intensity;
      if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: intensity == null ? 1 : intensity, flatShading: true, roughness: 0.4 });
      return matCache[k];
    },
    basic: function (color, opacity) {
      var k = 'b' + color + '_' + opacity;
      if (!matCache[k]) matCache[k] = new THREE.MeshBasicMaterial({ color: color, transparent: opacity < 1, opacity: opacity, depthWrite: opacity >= 1 });
      return matCache[k];
    }
  };
  LA.M = M;
  var geoCache = {};
  function G(key, make) { if (!geoCache[key]) geoCache[key] = make(); return geoCache[key]; }

  /* ---------- Gerador aleatório com semente (decoração estável) ---------- */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function mesh(geo, mat, cast, recv) {
    var m = new THREE.Mesh(geo, mat);
    m.castShadow = cast !== false; m.receiveShadow = recv !== false;
    return m;
  }

  /* =======================================================
     Classe da cena
     ======================================================= */
  function Scene3D() {
    this.quality = 'auto';
    this.speed = 1;
    this.reduceMotion = false;
    this.viewIndex = 0;
    this.zoomFactor = 1;
    this.tweens = [];
    this.particles = [];
    this.spinners = [];
    this.running = false;
    this.container = null;
    this.ok = false;
    try { this._init(); this.ok = true; } catch (e) { console.warn('WebGL indisponível', e); this.error = e; }
  }

  Scene3D.prototype._init = function () {
    var q = this._qualityParams();
    var canvas = document.createElement('canvas');
    canvas.className = 'scene-canvas';
    canvas.setAttribute('aria-label', 'Labirinto em 3D');
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: q.aa, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(q.pr);
    this.renderer.shadowMap.enabled = q.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 200);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 1.1);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.6);
    this.sun.castShadow = q.shadows;
    this.sun.shadow.mapSize.set(q.shadowSize, q.shadowSize);
    this.sun.shadow.bias = -0.0008;
    this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.clock = new THREE.Clock();
    this.time = 0;
    this.byte = LA.createByte(THREE, M);
    this.byte.setBlobVisible(!q.shadows);
    var self = this;
    this._loop = function () {
      if (!self.running) return;
      requestAnimationFrame(self._loop);
      self._frame();
    };
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(function () { self.resize(); });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) self.stop(); else if (self.container) self.start();
    });
  };

  Scene3D.prototype._qualityParams = function () {
    var dpr = window.devicePixelRatio || 1;
    var touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var q = this.quality;
    if (q === 'leve') return { pr: 1, aa: false, shadows: false, shadowSize: 512 };
    if (q === 'alta') return { pr: Math.min(dpr, 2), aa: true, shadows: true, shadowSize: 2048 };
    return { pr: Math.min(dpr, touch ? 1.5 : 2), aa: true, shadows: true, shadowSize: 1024 };
  };

  Scene3D.prototype.setQuality = function (q) {
    if (q === this.quality) return;
    this.quality = q;
    if (!this.ok) return;
    var p = this._qualityParams();
    this.renderer.setPixelRatio(p.pr);
    this.renderer.shadowMap.enabled = p.shadows;
    this.sun.castShadow = p.shadows;
    if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
    this.sun.shadow.mapSize.set(p.shadowSize, p.shadowSize);
    this.byte.setBlobVisible(!p.shadows);
    this.scene.traverse(function (o) { if (o.material) o.material.needsUpdate = true; });
    this.resize();
  };

  Scene3D.prototype.attach = function (container) {
    if (!this.ok) return;
    if (this.container && this.ro) this.ro.unobserve(this.container);
    this.container = container;
    container.appendChild(this.canvas);
    if (this.ro) this.ro.observe(container);
    this.resize();
    this.start();
  };
  Scene3D.prototype.detach = function () {
    this.stop();
    if (this.ro && this.container) this.ro.unobserve(this.container);
    this.container = null;
  };
  Scene3D.prototype.start = function () { if (!this.running && this.ok) { this.running = true; this.clock.getDelta(); this._loop(); } };
  Scene3D.prototype.stop = function () { this.running = false; };

  Scene3D.prototype.resize = function () {
    if (!this.container || !this.ok) return;
    var w = this.container.clientWidth, h = this.container.clientHeight;
    if (w < 2 || h < 2) return;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.aspect = w / h;
    this.fitCamera();
  };

  /* ---------- Câmera isométrica ---------- */
  Scene3D.prototype.fitCamera = function () {
    if (!this.bounds) return;
    var b = this.bounds;
    var ang = Math.PI / 4 + this.viewIndex * Math.PI / 2 + (this.orbit || 0);
    var D = 30;
    var cx = b.cx, cz = b.cz;
    this.camera.position.set(cx + Math.sin(ang) * D, D * 1.3, cz + Math.cos(ang) * D);
    this.camera.lookAt(cx, 0, cz);
    this.camera.updateMatrixWorld();
    var inv = this.camera.matrixWorldInverse;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    var v = new THREE.Vector3();
    [b.minX, b.maxX].forEach(function (x) {
      [b.minZ, b.maxZ].forEach(function (z) {
        [b.minY, b.maxY].forEach(function (y) {
          v.set(x, y, z).applyMatrix4(inv);
          minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
        });
      });
    });
    var pad = 0.6;
    var wv = (maxX - minX) + pad * 2, hv = (maxY - minY) + pad * 2;
    var aspect = this.aspect || 1;
    if (wv / hv > aspect) hv = wv / aspect; else wv = hv * aspect;
    wv /= this.zoomFactor; hv /= this.zoomFactor;
    var mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
    this.camera.left = mx - wv / 2; this.camera.right = mx + wv / 2;
    this.camera.top = my + hv / 2; this.camera.bottom = my - hv / 2;
    this.camera.updateProjectionMatrix();
    // sol acompanha o mapa
    var r = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
    this.sun.position.set(cx - 6, 14, cz + 8);
    this.sun.target.position.set(cx, 0, cz);
    var sc = this.sun.shadow.camera;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 1; sc.far = 50;
    sc.updateProjectionMatrix();
  };
  Scene3D.prototype.rotateView = function (dir) {
    var self = this, from = this.viewIndex, to = from + (dir || 1);
    this.viewIndex = to;
    this.orbit = (from - to) * Math.PI / 2;
    return this.tween(450, function (k) { self.orbit = (from - to) * Math.PI / 2 * (1 - k); self.fitCamera(); }).then(function () {
      self.viewIndex = ((to % 4) + 4) % 4; self.orbit = 0; self.fitCamera();
    });
  };
  Scene3D.prototype.zoom = function (f) {
    this.zoomFactor = Math.max(0.7, Math.min(2.5, this.zoomFactor * f));
    this.fitCamera();
  };

  /* ---------- Laço de animação ---------- */
  Scene3D.prototype._frame = function () {
    var dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt;
    var t = this.time;
    // tweens
    var now = performance.now();
    for (var i = this.tweens.length - 1; i >= 0; i--) {
      var tw = this.tweens[i];
      var k = Math.min(1, (now - tw.start) / tw.dur);
      tw.fn(k);
      if (k >= 1) { this.tweens.splice(i, 1); tw.resolve(); }
    }
    // giradores e flutuação dos itens
    for (var j = 0; j < this.spinners.length; j++) {
      var s = this.spinners[j];
      if (!s.obj.parent) continue;
      if (s.spin) s.obj.rotation.y += dt * s.spin;
      if (s.bob) s.obj.position.y = s.baseY + Math.sin(t * 2.4 + s.phase) * s.bob;
      if (s.fn) s.fn(t, dt);
    }
    // partículas
    for (var p = this.particles.length - 1; p >= 0; p--) {
      var pa = this.particles[p];
      pa.life -= dt;
      pa.v.y -= pa.g * dt;
      pa.m.position.addScaledVector(pa.v, dt);
      pa.m.rotation.x += dt * 5; pa.m.rotation.y += dt * 4;
      var sc = Math.max(0.01, pa.life / pa.maxLife) * pa.size;
      pa.m.scale.setScalar(sc);
      if (pa.life <= 0) { this.world.remove(pa.m); this.particles.splice(p, 1); }
    }
    if (this.byte) this.byte.update(dt, t);
    if (this.onFrame) this.onFrame(dt, t);
    this.renderer.render(this.scene, this.camera);
  };

  Scene3D.prototype.tween = function (dur, fn) {
    var self = this;
    dur = this.reduceMotion ? Math.min(dur, 120) : dur;
    return new Promise(function (resolve) {
      if (!self.running || dur <= 0) { fn(1); resolve(); return; }
      self.tweens.push({ start: performance.now(), dur: dur, fn: fn, resolve: resolve });
    });
  };
  Scene3D.prototype.wait = function (ms) { return this.tween(ms, function () {}); };
  Scene3D.prototype.finishTweens = function () {
    var list = this.tweens.splice(0);
    list.forEach(function (tw) { tw.fn(1); tw.resolve(); });
  };

  Scene3D.prototype.burst = function (pos, color, count, opts) {
    if (this.reduceMotion) count = Math.ceil(count / 3);
    opts = opts || {};
    var geo = G('tetra', function () { return new THREE.TetrahedronGeometry(0.08, 0); });
    for (var i = 0; i < count; i++) {
      var c = Array.isArray(color) ? color[i % color.length] : color;
      var m = mesh(geo, M.glow(c, 0.7), false, false);
      m.position.copy(pos);
      var a = Math.random() * Math.PI * 2, sp = (opts.speed || 2.2) * (0.5 + Math.random());
      this.world.add(m);
      this.particles.push({ m: m, v: new THREE.Vector3(Math.cos(a) * sp * 0.5, (opts.up || 3) * (0.6 + Math.random() * 0.6), Math.sin(a) * sp * 0.5), g: opts.g == null ? 7 : opts.g, life: opts.life || 1, maxLife: opts.life || 1, size: opts.size || 1 });
    }
  };

  /* ---------- Fundo (degradê) ---------- */
  Scene3D.prototype.setBackground = function (top, bottom) {
    var c = document.createElement('canvas'); c.width = 4; c.height = 256;
    var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    if (this.scene.background && this.scene.background.dispose) this.scene.background.dispose();
    this.scene.background = tex;
  };

  /* ---------- Limpeza ---------- */
  Scene3D.prototype.clear = function () {
    this.finishTweens();
    var keep = this.byte.root;
    var self = this;
    this.world.children.slice().forEach(function (o) {
      self.world.remove(o);
      if (o === keep) return;
      o.traverse(function (n) {
        if (n.geometry && !n.geometry._cached) {
          var cached = false;
          for (var k in geoCache) if (geoCache[k] === n.geometry) { cached = true; break; }
          if (!cached) n.geometry.dispose();
        }
        if (n.material && n.material._own) n.material.dispose();
      });
    });
    this.spinners = []; this.particles = [];
    this.items = {}; this.doors = {}; this.lasers = {}; this.switches = {}; this.clouds = {};
    this.drones = []; this.chaser = null; this.portal = null;
  };

  Scene3D.prototype.cellPos = function (x, y, h) {
    return new THREE.Vector3(x - this.offX, h || 0, y - this.offZ);
  };

  /* =======================================================
     Construção do nível
     ======================================================= */
  Scene3D.prototype.buildLevel = function (level, world, opts) {
    if (!this.ok) return;
    opts = opts || {};
    this.clear();
    var themeName = opts.theme || (LA.WORLDS[(level.world || 1) - 1] || LA.WORLDS[0]).theme;
    var th = this.theme = THEMES[themeName] || THEMES.vale;
    this.themeName = themeName;
    this.setBackground(th.sky[0], th.sky[1]);
    this.hemi.color.setHex(th.hemi[0]); this.hemi.groundColor.setHex(th.hemi[1]);
    this.sun.color.setHex(th.light);
    this.sun.intensity = themeName === 'nucleo' ? 1.0 : 1.6;
    this.hemi.intensity = themeName === 'nucleo' ? 1.3 : 1.1;

    var W = world.w, H = world.h;
    this.offX = (W - 1) / 2; this.offZ = (H - 1) / 2;
    this.gridW = W; this.gridH = H;
    var rand = rng((level.id ? String(level.id).split('').reduce(function (a, c) { return a * 31 + c.charCodeAt(0); }, 7) : 99) + world.variantIndex * 101);
    this.bounds = { minX: -W / 2 - 0.3, maxX: W / 2 + 0.3, minZ: -H / 2 - 0.3, maxZ: H / 2 + 0.3, minY: -0.6, maxY: 1.2, cx: 0, cz: 0 };

    var self = this;
    var tileGeo = G('tile', function () { var g = new THREE.BoxGeometry(0.98, 0.5, 0.98); g.translate(0, -0.25, 0); return g; });
    var sideGeo = G('side', function () { var g = new THREE.BoxGeometry(1, 0.6, 1); g.translate(0, -0.8, 0); return g; });

    // ilha flutuante por baixo
    var island = this._island(W, H, th, rand);
    this.world.add(island);

    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var c = world.cells[y][x];
        if (c === 'void') continue;
        var p = this.cellPos(x, y);
        var floorMat = M.std(th.floor[(x + y) % 2]);
        var t = mesh(tileGeo, floorMat, false, true);
        t.position.copy(p);
        this.world.add(t);
        var sd = mesh(sideGeo, M.std(th.side), false, false);
        sd.position.copy(p);
        this.world.add(sd);
        if (c === 'wall') this._wall(p, x, y, th, rand);
        if (c === 'rail') this._rail(p, world, x, y);
      }
    }
    // portal
    this._portal(world);
    // itens
    for (var k in world.items) {
      var xy = k.split(',').map(Number);
      this._item(world.items[k], xy[0], xy[1], k);
    }
    for (var dk in world.doors) this._door(world, world.doors[dk], dk);
    for (var lk in world.lasers) this._laser(world, world.lasers[lk], lk);
    for (var sk in world.switches) this._switch(world.switches[sk], sk);
    world.drones.forEach(function (d) { self._drone(d); });
    if (world.chaser) this._chaser(world.chaser);
    this._decorate(W, H, th, rand, world);
    if (world.fog) this._fog(world);

    // Byte
    var b = this.byte;
    b.reset();
    this.world.add(b.root);
    this.placeByte(world.x, world.y, world.dir);
    this.updateFromWorld(world, true);
    this.fitCamera();
  };

  Scene3D.prototype.placeByte = function (x, y, dir) {
    var p = this.cellPos(x, y);
    this.byte.root.position.copy(p);
    this.byte.root.rotation.set(0, dirAngle(dir), 0);
  };
  function dirAngle(d) { return [Math.PI, Math.PI / 2, 0, -Math.PI / 2][d]; }

  Scene3D.prototype._island = function (W, H, th, rand) {
    var g = new THREE.Group();
    var r = Math.max(W, H) * 0.62 + 0.6;
    var geo = new THREE.CylinderGeometry(r, r * 0.35, 2.4, 9, 2);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var yy = pos.getY(i);
      if (yy < 1.1) { pos.setX(i, pos.getX(i) * (0.85 + rand() * 0.3)); pos.setZ(i, pos.getZ(i) * (0.85 + rand() * 0.3)); pos.setY(i, yy + (rand() - 0.5) * 0.4); }
    }
    geo.computeVertexNormals();
    var m = mesh(geo, M.std(th.side), false, false);
    m.scale.set(W / Math.max(W, H) * 1.0 + 0.1, 1, H / Math.max(W, H) * 1.0 + 0.1);
    m.position.y = -2.25;
    g.add(m);
    var top = mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.0, 0.25, 9), M.std(th.floor[1]), false, true);
    top.scale.copy(m.scale);
    top.position.y = -1.08;
    g.add(top);
    return g;
  };

  /* ---------- Paredes temáticas ---------- */
  Scene3D.prototype._wall = function (p, x, y, th, rand) {
    var g = new THREE.Group();
    g.position.copy(p);
    var h;
    switch (th.wall) {
      case 'hedge': {
        h = 0.38 + rand() * 0.14;
        var hb = mesh(G('hedge', function () { var b = new THREE.BoxGeometry(0.94, 1, 0.94, 2, 1, 2); jitter(b, 0.03); return b; }), M.std(th.wallColor));
        hb.scale.y = h; hb.position.y = h / 2; g.add(hb);
        var top = mesh(G('hedgeTop', function () { return new THREE.DodecahedronGeometry(0.36, 0); }), M.std(th.wall2));
        top.position.set((rand() - 0.5) * 0.15, h + 0.02, (rand() - 0.5) * 0.15); top.scale.set(1.1, 0.42, 1.1); top.rotation.y = rand() * 3; g.add(top);
        if (rand() < 0.35) {
          var fl = mesh(G('flower', function () { return new THREE.IcosahedronGeometry(0.07, 0); }), M.std([0xff6b9a, 0xffd23f, 0xffffff][Math.floor(rand() * 3)]));
          fl.position.set((rand() - 0.5) * 0.5, h + 0.16, (rand() - 0.5) * 0.5); g.add(fl);
        }
        break;
      }
      case 'tree': {
        var base = mesh(G('bush', function () { var b = new THREE.BoxGeometry(0.92, 0.25, 0.92); b.translate(0, 0.125, 0); return b; }), M.std(0x4f8f3a));
        g.add(base);
        var trunk = mesh(G('trunk', function () { var c = new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6); c.translate(0, 0.25, 0); return c; }), M.std(0x8b5a2b));
        trunk.position.y = 0.2; g.add(trunk);
        var s = 0.62 + rand() * 0.18;
        var c1 = mesh(G('cone1', function () { return new THREE.ConeGeometry(0.46, 0.7, 7); }), M.std(rand() < 0.5 ? th.wallColor : th.wall2));
        c1.position.y = 0.75 * s; c1.scale.setScalar(s); c1.rotation.y = rand() * 3; g.add(c1);
        var c2 = mesh(G('cone2', function () { return new THREE.ConeGeometry(0.34, 0.55, 7); }), M.std(th.wall2));
        c2.position.y = 1.15 * s; c2.scale.setScalar(s); c2.rotation.y = rand() * 3; g.add(c2);
        h = 1.2 * s;
        break;
      }
      case 'stone': {
        h = 0.55;
        var sb = mesh(G('stone', function () { var b = new THREE.BoxGeometry(0.96, 0.55, 0.96, 2, 2, 2); jitter(b, 0.025); b.translate(0, 0.275, 0); return b; }), M.std(rand() < 0.5 ? th.wallColor : th.wall2));
        g.add(sb);
        var cr = G('crenel', function () { return new THREE.BoxGeometry(0.28, 0.2, 0.28); });
        [[-0.3, -0.3], [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3]].forEach(function (o) {
          var m = mesh(cr, M.std(th.wall2)); m.position.set(o[0], 0.64, o[1]); g.add(m);
        });
        if (rand() < 0.15) {
          var flag = mesh(G('flag', function () { return new THREE.BoxGeometry(0.02, 0.22, 0.3); }), M.std(0xe63946));
          flag.position.set(0, 1.05, 0.15); g.add(flag);
          var pole = mesh(G('pole', function () { return new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5); }), M.std(0x444444));
          pole.position.set(0, 0.9, 0); g.add(pole);
        }
        break;
      }
      case 'metal': {
        h = 0.6;
        var mb = mesh(G('metal', function () { var b = new THREE.BoxGeometry(0.94, 0.6, 0.94); b.translate(0, 0.3, 0); return b; }), M.std(th.wallColor, { metalness: 0.4, roughness: 0.45 }));
        g.add(mb);
        var stripe = mesh(G('stripe', function () { var b = new THREE.BoxGeometry(0.96, 0.06, 0.96); return b; }), M.glow(th.wall2, 0.8), false, false);
        stripe.position.y = 0.4; g.add(stripe);
        var lid = mesh(G('lid', function () { return new THREE.BoxGeometry(0.8, 0.06, 0.8); }), M.std(0xc6d2e3, { metalness: 0.3, roughness: 0.5 }));
        lid.position.y = 0.63; g.add(lid);
        if (rand() < 0.2) {
          var tube = mesh(G('tube', function () { return new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8); }), M.std(0x9ef0ff, { transparent: true, opacity: 0.7 }));
          tube.position.set(0, 0.85, 0); g.add(tube);
          var liquid = mesh(G('liquid', function () { return new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8); }), M.glow(0x3cff9e, 0.8), false, false);
          liquid.position.set(0, 0.78, 0); g.add(liquid);
        }
        break;
      }
      case 'neon': {
        h = 0.5 + rand() * 0.18;
        var nb = mesh(G('neon', function () { var b = new THREE.BoxGeometry(0.92, 1, 0.92); b.translate(0, 0.5, 0); return b; }), M.std(th.wallColor, { roughness: 0.5, metalness: 0.3 }));
        nb.scale.y = h; g.add(nb);
        var edges = new THREE.LineSegments(G('neonEdges', function () { var b = new THREE.BoxGeometry(0.93, 1, 0.93); b.translate(0, 0.5, 0); return new THREE.EdgesGeometry(b); }),
          new THREE.LineBasicMaterial({ color: rand() < 0.5 ? 0x7cf7ff : 0xff5cf4 }));
        edges.scale.y = h; g.add(edges);
        edges.material._own = true;
        break;
      }
    }
    this.world.add(g);
    return g;
  };
  function jitter(geo, a) {
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) {
      p.setX(i, p.getX(i) + (Math.sin(i * 12.9898) * 43758.5453 % 1) * a);
      p.setZ(i, p.getZ(i) + (Math.sin(i * 78.233) * 12345.678 % 1) * a);
    }
    geo.computeVertexNormals();
  }

  Scene3D.prototype._rail = function (p) {
    var r = mesh(G('rail', function () { return new THREE.BoxGeometry(0.9, 0.05, 0.9); }), M.std(0x333a55, { metalness: 0.6, roughness: 0.4 }));
    r.position.copy(p); r.position.y = 0.03; this.world.add(r);
    var stripe = mesh(G('railStripe', function () { return new THREE.BoxGeometry(0.12, 0.06, 0.95); }), M.glow(0xffb800, 0.6), false);
    stripe.position.copy(p); stripe.position.y = 0.05; this.world.add(stripe);
  };

  /* ---------- Portal ---------- */
  Scene3D.prototype._portal = function (world) {
    var p = this.cellPos(world.exit.x, world.exit.y);
    var g = new THREE.Group(); g.position.copy(p);
    var pad = mesh(G('padBase', function () { return new THREE.CylinderGeometry(0.45, 0.48, 0.08, 10); }), M.std(0x3b2f7a));
    pad.position.y = 0.04; g.add(pad);
    var ringMat = new THREE.MeshStandardMaterial({ color: 0xb06bff, emissive: 0x9d4dff, emissiveIntensity: 1.2, flatShading: true });
    ringMat._own = true;
    var ring = mesh(new THREE.TorusGeometry(0.36, 0.06, 6, 16), ringMat);
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.1; g.add(ring);
    var beamMat = new THREE.MeshBasicMaterial({ color: 0xc89bff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
    beamMat._own = true;
    var beam = mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.4, 12, 1, true), beamMat, false, false);
    beam.position.y = 0.75; g.add(beam);
    var swirl = new THREE.Group(); swirl.position.y = 0.6; g.add(swirl);
    for (var i = 0; i < 3; i++) {
      var o = mesh(G('orb', function () { return new THREE.OctahedronGeometry(0.06, 0); }), M.glow(0xffffff, 1), false, false);
      o.position.set(Math.cos(i * 2.094) * 0.26, i * 0.15, Math.sin(i * 2.094) * 0.26);
      swirl.add(o);
    }
    this.world.add(g);
    this.portal = { g: g, ring: ring, ringMat: ringMat, beam: beam, beamMat: beamMat, swirl: swirl, open: true };
    var self = this;
    this.spinners.push({ obj: swirl, spin: 2.5, fn: function (t) {
      swirl.position.y = 0.5 + Math.sin(t * 1.5) * 0.15;
      beamMat.opacity = self.portal.open ? 0.28 + Math.sin(t * 3) * 0.08 : 0.07;
      ring.rotation.z = t * 0.8;
    } });
  };
  Scene3D.prototype.setPortalOpen = function (open) {
    if (!this.portal || this.portal.open === open) return;
    this.portal.open = open;
    this.portal.ringMat.color.setHex(open ? 0xb06bff : 0x667085);
    this.portal.ringMat.emissive.setHex(open ? 0x9d4dff : 0x1d2433);
    this.portal.swirl.visible = open;
    if (open) this.burst(this.portal.g.position.clone().setY(0.6), [0xb06bff, 0xffffff], 14);
  };

  /* ---------- Itens ---------- */
  Scene3D.prototype._item = function (type, x, y, k) {
    var g = new THREE.Group();
    var p = this.cellPos(x, y, 0.35);
    g.position.copy(p);
    if (type === 'battery') {
      var body = mesh(G('batBody', function () { return new THREE.CylinderGeometry(0.13, 0.13, 0.34, 8); }), M.std(0x2ecc71));
      g.add(body);
      var band = mesh(G('batBand', function () { return new THREE.CylinderGeometry(0.135, 0.135, 0.1, 8); }), M.glow(0xbfff3c, 0.9), false);
      band.position.y = 0.06; g.add(band);
      var cap = mesh(G('batCap', function () { return new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8); }), M.std(0xdddddd, { metalness: 0.5 }));
      cap.position.y = 0.2; g.add(cap);
      g.rotation.z = 0.25;
    } else if (type === 'crystal') {
      var cr = mesh(G('crystal', function () { var o = new THREE.OctahedronGeometry(0.2, 0); o.scale(0.8, 1.35, 0.8); return o; }), new THREE.MeshStandardMaterial({ color: 0x5ee7ff, emissive: 0x1aa7ff, emissiveIntensity: 0.6, flatShading: true, roughness: 0.15, transparent: true, opacity: 0.92 }));
      cr.material._own = true;
      g.add(cr);
    } else if (type === 'key') {
      var gold = M.std(0xffc83d, { metalness: 0.6, roughness: 0.3 });
      var ring = mesh(G('keyRing', function () { return new THREE.TorusGeometry(0.09, 0.035, 6, 10); }), gold);
      ring.position.y = 0.12; g.add(ring);
      var shaft = mesh(G('keyShaft', function () { return new THREE.BoxGeometry(0.05, 0.26, 0.05); }), gold);
      shaft.position.y = -0.07; g.add(shaft);
      var t1 = mesh(G('keyTooth', function () { return new THREE.BoxGeometry(0.09, 0.04, 0.05); }), gold);
      t1.position.set(0.06, -0.16, 0); g.add(t1);
      var t2 = t1.clone(); t2.position.set(0.05, -0.08, 0); g.add(t2);
    }
    var shadow = mesh(G('itemShadow', function () { return new THREE.CircleGeometry(0.18, 12); }), M.basic(0x000000, 0.15), false, false);
    shadow.rotation.x = -Math.PI / 2; shadow.position.copy(this.cellPos(x, y, 0.012));
    this.world.add(shadow);
    this.world.add(g);
    this.items[k] = { g: g, shadow: shadow, type: type };
    this.spinners.push({ obj: g, spin: 1.6, bob: 0.06, baseY: 0.35, phase: x * 0.7 + y });
  };

  Scene3D.prototype.collectItem = function (k) {
    var it = this.items[k];
    if (!it) return Promise.resolve();
    delete this.items[k];
    var self = this, g = it.g;
    var color = { battery: [0x2ecc71, 0xbfff3c], crystal: [0x5ee7ff, 0xffffff], key: [0xffc83d, 0xffffff] }[it.type];
    this.burst(g.position.clone(), color, 12);
    this.world.remove(it.shadow);
    var y0 = g.position.y;
    return this.tween(380 / this.speed, function (k2) {
      g.position.y = y0 + k2 * 0.8;
      g.scale.setScalar(1 + k2 * 0.6 - k2 * k2 * 1.5);
    }).then(function () { self.world.remove(g); });
  };

  /* ---------- Portas ---------- */
  function corridorAlongX(world, x, y) {
    var up = world.cell(x, y - 1), dn = world.cell(x, y + 1);
    var blockedZ = (up === 'wall' || up === 'void' || up === 'rail') && (dn === 'wall' || dn === 'void' || dn === 'rail');
    return blockedZ;
  }
  Scene3D.prototype._door = function (world, d, k) {
    var g = new THREE.Group(); g.position.copy(this.cellPos(d.x, d.y));
    var alongX = corridorAlongX(world, d.x, d.y);
    if (!alongX) g.rotation.y = Math.PI / 2;
    // porta atravessa o corredor (plano perpendicular à direção do corredor)
    var frameMat = M.std(0x6b4a2f);
    var post = G('doorPost', function () { return new THREE.BoxGeometry(0.12, 1.0, 0.12); });
    var p1 = mesh(post, frameMat); p1.position.set(0, 0.5, -0.44); g.add(p1);
    var p2 = mesh(post, frameMat); p2.position.set(0, 0.5, 0.44); g.add(p2);
    var lintel = mesh(G('doorLintel', function () { return new THREE.BoxGeometry(0.14, 0.12, 1.0); }), frameMat); lintel.position.y = 1.0; g.add(lintel);
    var slab = mesh(G('doorSlab', function () { return new THREE.BoxGeometry(0.1, 0.9, 0.78); }), M.std(0xd9822b));
    slab.position.y = 0.45; g.add(slab);
    var lock = mesh(G('doorLock', function () { return new THREE.BoxGeometry(0.14, 0.16, 0.14); }), M.std(0xffc83d, { metalness: 0.6, roughness: 0.3 }));
    lock.position.set(0, 0.5, 0); g.add(lock);
    this.world.add(g);
    this.doors[k] = { g: g, slab: slab, lock: lock, open: false };
    if (d.open) { slab.position.y = -0.5; lock.visible = false; this.doors[k].open = true; }
  };
  Scene3D.prototype.openDoor = function (k) {
    var d = this.doors[k];
    if (!d || d.open) return Promise.resolve();
    d.open = true;
    this.burst(d.g.position.clone().setY(0.6), [0xffc83d, 0xffffff], 10);
    d.lock.visible = false;
    return this.tween(380 / this.speed, function (t) { d.slab.position.y = 0.45 - t * 0.95; });
  };

  /* ---------- Lasers ---------- */
  Scene3D.prototype._laser = function (world, l, k) {
    var g = new THREE.Group(); g.position.copy(this.cellPos(l.x, l.y));
    var alongX = corridorAlongX(world, l.x, l.y);
    if (!alongX) g.rotation.y = Math.PI / 2;
    var color = l.group === 'M' ? 0xff3cac : 0xff3b3b;
    var emMat = M.std(0x2b2f3a, { metalness: 0.5 });
    var post = G('laserPost', function () { return new THREE.BoxGeometry(0.12, 0.7, 0.12); });
    var e1 = mesh(post, emMat); e1.position.set(0, 0.35, -0.44); g.add(e1);
    var e2 = mesh(post, emMat); e2.position.set(0, 0.35, 0.44); g.add(e2);
    var lightMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 1.2, flatShading: true }); lightMat._own = true;
    var lens = G('laserLens', function () { return new THREE.BoxGeometry(0.13, 0.08, 0.13); });
    [0.2, 0.45].forEach(function (yy) {
      var a = mesh(lens, lightMat, false); a.position.set(0, yy, -0.44); g.add(a);
      var b = mesh(lens, lightMat, false); b.position.set(0, yy, 0.44); g.add(b);
    });
    var beams = new THREE.Group();
    var beamMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 }); beamMat._own = true;
    var glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.25, depthWrite: false }); glowMat._own = true;
    [0.2, 0.45].forEach(function (yy) {
      var b = mesh(G('beam', function () { var c = new THREE.CylinderGeometry(0.025, 0.025, 0.86, 6); c.rotateX(Math.PI / 2); return c; }), beamMat, false, false);
      b.position.y = yy; beams.add(b);
      var gl = mesh(G('beamGlow', function () { var c = new THREE.CylinderGeometry(0.07, 0.07, 0.86, 8); c.rotateX(Math.PI / 2); return c; }), glowMat, false, false);
      gl.position.y = yy; beams.add(gl);
    });
    g.add(beams);
    // marca no chão
    var mark = mesh(G('laserMark', function () { return new THREE.PlaneGeometry(0.2, 0.9); }), M.basic(color, 0.25), false, false);
    mark.rotation.x = -Math.PI / 2; mark.position.y = 0.012; g.add(mark);
    this.world.add(g);
    this.lasers[k] = { g: g, beams: beams, lightMat: lightMat, beamMat: beamMat, glowMat: glowMat, on: true };
    this.spinners.push({ obj: beams, fn: function (t) { glowMat.opacity = 0.18 + Math.sin(t * 20) * 0.07; } });
  };
  Scene3D.prototype.setLasers = function (states) {
    for (var k in states) {
      var l = this.lasers[k]; if (!l) continue;
      var on = !!states[k];
      if (l.on === on) continue;
      l.on = on;
      l.beams.visible = on;
      l.lightMat.emissiveIntensity = on ? 1.2 : 0.1;
    }
  };

  /* ---------- Interruptores ---------- */
  Scene3D.prototype._switch = function (s, k) {
    var g = new THREE.Group(); g.position.copy(this.cellPos(s.x, s.y));
    var base = mesh(G('swBase', function () { return new THREE.CylinderGeometry(0.34, 0.38, 0.08, 8); }), M.std(0x3d4560));
    base.position.y = 0.04; g.add(base);
    var btnMat = new THREE.MeshStandardMaterial({ color: 0xff5a5a, emissive: 0xff2a2a, emissiveIntensity: 0.6, flatShading: true }); btnMat._own = true;
    var btn = mesh(G('swBtn', function () { return new THREE.CylinderGeometry(0.2, 0.22, 0.12, 8); }), btnMat);
    btn.position.y = 0.13; g.add(btn);
    var label = makeLabel(s.id === 'T' ? '1' : s.id === 'U' ? '2' : '3', '#ffffff');
    label.position.y = 0.6; label.scale.set(0.35, 0.35, 0.35); g.add(label);
    this.world.add(g);
    this.switches[k] = { btn: btn, mat: btnMat, on: s.on };
    this.spinners.push({ obj: label, bob: 0.05, baseY: 0.6, phase: s.x });
  };
  Scene3D.prototype.pressSwitch = function (k, on) {
    var s = this.switches[k]; if (!s) return Promise.resolve();
    s.on = on;
    s.mat.color.setHex(on ? 0x3cff8f : 0xff5a5a); s.mat.emissive.setHex(on ? 0x1fd16a : 0xff2a2a);
    this.burst(s.btn.getWorldPosition(new THREE.Vector3()).setY(0.3), on ? 0x3cff8f : 0xff5a5a, 8);
    var btn = s.btn;
    return this.tween(250 / this.speed, function (t) { btn.position.y = 0.13 - Math.sin(t * Math.PI) * 0.06; });
  };
  function makeLabel(text, color) {
    var c = document.createElement('canvas'); c.width = 64; c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = 'rgba(20,24,40,0.85)'; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
    g.fillStyle = color; g.font = 'bold 36px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 32, 34);
    var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    var mat = new THREE.SpriteMaterial({ map: tex, depthTest: false }); mat._own = true;
    var s = new THREE.Sprite(mat); s.renderOrder = 10;
    return s;
  }

  /* ---------- Drones e perseguidor ---------- */
  Scene3D.prototype._drone = function (d) {
    var g = new THREE.Group(); g.position.copy(this.cellPos(d.x, d.y, 0.55));
    var body = mesh(G('droneBody', function () { return new THREE.OctahedronGeometry(0.2, 0); }), M.std(0x4b5568, { metalness: 0.5 }));
    body.scale.set(1.2, 0.7, 1.2); g.add(body);
    var eye = mesh(G('droneEye', function () { return new THREE.IcosahedronGeometry(0.07, 0); }), M.glow(0xff3b3b, 1.4), false);
    eye.position.y = -0.06; g.add(eye);
    var rotors = [];
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (o) {
      var arm = mesh(G('droneArm', function () { return new THREE.BoxGeometry(0.04, 0.03, 0.04); }), M.std(0x222222));
      arm.position.set(o[0] * 0.22, 0.08, o[1] * 0.22); g.add(arm);
      var r = mesh(G('rotor', function () { return new THREE.BoxGeometry(0.26, 0.01, 0.04); }), M.std(0xdddddd), false);
      r.position.set(o[0] * 0.22, 0.11, o[1] * 0.22); g.add(r); rotors.push(r);
    });
    var cone = mesh(G('droneCone', function () { return new THREE.ConeGeometry(0.4, 0.5, 8, 1, true); }), M.basic(0xff3b3b, 0.12), false, false);
    cone.position.y = -0.3; g.add(cone);
    this.world.add(g);
    this.drones.push(g);
    this.spinners.push({ obj: g, fn: function (t) { rotors.forEach(function (r) { r.rotation.y = t * 30; }); body.position.y = Math.sin(t * 3) * 0.04; } });
  };
  Scene3D.prototype._chaser = function (c) {
    var g = new THREE.Group(); g.position.copy(this.cellPos(c.x, c.y));
    var body = mesh(G('virus', function () { return new THREE.IcosahedronGeometry(0.28, 0); }), new THREE.MeshStandardMaterial({ color: 0xff2d55, emissive: 0xc8102e, emissiveIntensity: 0.55, flatShading: true }));
    body.material._own = true;
    body.position.y = 0.4; g.add(body);
    var spike = G('spike', function () { return new THREE.ConeGeometry(0.06, 0.2, 5); });
    for (var i = 0; i < 8; i++) {
      var s = mesh(spike, M.std(0x8b0f1e));
      var a = i / 8 * Math.PI * 2;
      s.position.set(Math.cos(a) * 0.3, 0.4 + (i % 2 ? 0.12 : -0.12), Math.sin(a) * 0.3);
      s.lookAt(new THREE.Vector3(Math.cos(a) * 2, 0.4 + (i % 2 ? 0.5 : -0.5), Math.sin(a) * 2));
      s.rotateX(Math.PI / 2);
      g.add(s);
    }
    [-0.1, 0.1].forEach(function (x) {
      var e = mesh(G('virusEye', function () { return new THREE.BoxGeometry(0.08, 0.06, 0.04); }), M.glow(0xfff200, 1.5), false);
      e.position.set(x, 0.46, 0.26); g.add(e);
    });
    var ring = mesh(new THREE.TorusGeometry(0.38, 0.03, 4, 16), M.glow(0xff2d55, 1.2), false, false);
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.05; g.add(ring);
    g.scale.setScalar(1.15);
    this.world.add(g);
    this.chaser = g;
    this.spinners.push({ obj: body, fn: function (t) { body.rotation.y = t * 1.5; body.position.y = 0.4 + Math.sin(t * 4) * 0.05; ring.rotation.z = t * 2; } });
  };

  /* ---------- Névoa ---------- */
  Scene3D.prototype._fog = function (world) {
    var geo = G('cloud', function () { return new THREE.IcosahedronGeometry(0.42, 0); });
    var mat = new THREE.MeshStandardMaterial({ color: 0x8a7fc7, flatShading: true, transparent: true, opacity: 0.94, roughness: 1 }); mat._own = true;
    for (var y = 0; y < world.h; y++) for (var x = 0; x < world.w; x++) {
      var k = x + ',' + y;
      if (world.cells[y][x] === 'void') continue;
      if (x === world.exit.x && y === world.exit.y) continue;
      var g = new THREE.Group(); g.position.copy(this.cellPos(x, y, 0.45));
      var a = mesh(geo, mat, false, false); a.scale.set(1.25, 1, 1.25); g.add(a);
      var b = mesh(geo, mat, false, false); b.position.set(0.15, 0.3, -0.1); b.scale.setScalar(0.8); g.add(b);
      this.world.add(g);
      this.clouds[k] = g;
      this.spinners.push({ obj: g, bob: 0.05, baseY: 0.45 + (x * 7 + y * 3) % 3 * 0.05, phase: x + y * 2 });
    }
  };
  Scene3D.prototype.updateFog = function (world) {
    var self = this;
    for (var k in this.clouds) {
      if (world.revealed[k]) {
        var g = this.clouds[k];
        delete this.clouds[k];
        (function (g) {
          self.tween(350, function (t) { g.scale.setScalar(1 - t); g.position.y += 0.02; }).then(function () { self.world.remove(g); });
        })(g);
      }
    }
  };

  /* ---------- Decoração ao redor ---------- */
  Scene3D.prototype._decorate = function (W, H, th, rand, world) {
    var self = this;
    var spots = [];
    for (var i = 0; i < Math.round((W + H) * 1.3); i++) {
      var side = Math.floor(rand() * 4), x, z, off = 0.9 + rand() * 1.4;
      if (side === 0) { x = -W / 2 - off; z = (rand() - 0.5) * (H + 1); }
      else if (side === 1) { x = W / 2 + off; z = (rand() - 0.5) * (H + 1); }
      else if (side === 2) { z = -H / 2 - off; x = (rand() - 0.5) * (W + 1); }
      else { z = H / 2 + off; x = (rand() - 0.5) * (W + 1); }
      spots.push([x, z]);
    }
    var r = Math.max(W, H) * 0.62 + 0.6;
    spots.forEach(function (s, i) {
      // só dentro da ilha
      var ex = s[0] / (W / Math.max(W, H) + 0.1), ez = s[1] / (H / Math.max(W, H) + 0.1);
      if (Math.sqrt(ex * ex + ez * ez) > r * 0.92) return;
      var g = new THREE.Group(); g.position.set(s[0], -0.95, s[1]);
      var kind = rand();
      switch (th.deco) {
        case 'vale':
          if (kind < 0.45) addTree(g, rand, 0x4fa83f, 0x2f8f4e);
          else if (kind < 0.75) addRock(g, rand, 0xa7a7a7);
          else addFlowers(g, rand);
          break;
        case 'floresta':
          if (kind < 0.6) addTree(g, rand, 0x2f8f4e, 0x3fae5e, true);
          else if (kind < 0.85) addMushroom(g, rand);
          else addRock(g, rand, 0x8d8d8d);
          break;
        case 'fortaleza':
          if (kind < 0.35) addTower(g, rand);
          else if (kind < 0.7) addRock(g, rand, 0x9c917f);
          else addTree(g, rand, 0x5a8f4e, 0x6faa5e);
          break;
        case 'laboratorio':
          if (kind < 0.4) addTank(g, rand);
          else if (kind < 0.7) addCrate(g, rand);
          else addAntenna(g, rand);
          break;
        case 'nucleo':
          if (kind < 0.5) addCrystalSpire(g, rand);
          else addFloatCube(g, rand, self);
          break;
      }
      self.world.add(g);
    });
    // nuvens / partículas no céu
    var n = th.deco === 'nucleo' ? 18 : 6;
    for (var c = 0; c < n; c++) {
      var cl;
      if (th.deco === 'nucleo') {
        cl = mesh(G('star', function () { return new THREE.OctahedronGeometry(0.06, 0); }), M.glow(rand() < 0.5 ? 0x7cf7ff : 0xff5cf4, 1.2), false, false);
        cl.position.set((rand() - 0.5) * (W + 8), 1.5 + rand() * 3, (rand() - 0.5) * (H + 8));
      } else {
        cl = new THREE.Group();
        var cm = M.std(0xffffff, { roughness: 1 });
        for (var j = 0; j < 3; j++) {
          var puff = mesh(G('puff', function () { return new THREE.IcosahedronGeometry(0.45, 0); }), cm, false, false);
          puff.position.set(j * 0.45 - 0.45, (j === 1 ? 0.15 : 0), 0); puff.scale.setScalar(j === 1 ? 1.2 : 0.9);
          cl.add(puff);
        }
        cl.position.set((rand() - 0.5) * (W + 6), -2.5 - rand() * 1.5, (rand() - 0.5) * (H + 6));
      }
      this.world.add(cl);
      this.spinners.push({ obj: cl, bob: 0.15, baseY: cl.position.y, phase: c * 1.3, spin: th.deco === 'nucleo' ? 1 : 0 });
    }
  };
  function addTree(g, rand, c1, c2, tall) {
    var s = 0.6 + rand() * 0.6 + (tall ? 0.3 : 0);
    var t = mesh(G('dTrunk', function () { var c = new THREE.CylinderGeometry(0.07, 0.1, 0.5, 5); c.translate(0, 0.25, 0); return c; }), M.std(0x8b5a2b));
    t.scale.setScalar(s); g.add(t);
    var c = mesh(G('dCone', function () { var c = new THREE.ConeGeometry(0.4, 0.9, 6); c.translate(0, 0.85, 0); return c; }), M.std(rand() < 0.5 ? c1 : c2));
    c.scale.setScalar(s); c.rotation.y = rand() * 3; g.add(c);
  }
  function addRock(g, rand, color) {
    var r = mesh(G('dRock', function () { return new THREE.DodecahedronGeometry(0.3, 0); }), M.std(color));
    r.scale.set(0.6 + rand() * 0.8, 0.4 + rand() * 0.5, 0.6 + rand() * 0.8); r.rotation.y = rand() * 3; r.position.y = 0.08; g.add(r);
  }
  function addFlowers(g, rand) {
    for (var i = 0; i < 3; i++) {
      var f = mesh(G('dFlower', function () { return new THREE.IcosahedronGeometry(0.08, 0); }), M.std([0xff6b9a, 0xffd23f, 0xffffff, 0xb388ff][Math.floor(rand() * 4)]));
      f.position.set((rand() - 0.5) * 0.6, 0.15, (rand() - 0.5) * 0.6); g.add(f);
      var st = mesh(G('dStem', function () { return new THREE.CylinderGeometry(0.01, 0.01, 0.15, 3); }), M.std(0x3d8f33));
      st.position.set(f.position.x, 0.07, f.position.z); g.add(st);
    }
  }
  function addMushroom(g, rand) {
    var s = 0.6 + rand() * 0.7;
    var st = mesh(G('mStem', function () { var c = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 6); c.translate(0, 0.12, 0); return c; }), M.std(0xf5f0e1));
    st.scale.setScalar(s); g.add(st);
    var cap = mesh(G('mCap', function () { var c = new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2); c.translate(0, 0.24, 0); return c; }), M.std(rand() < 0.5 ? 0xe63946 : 0xff9f1c));
    cap.scale.setScalar(s); g.add(cap);
  }
  function addTower(g, rand) {
    var t = mesh(G('tower', function () { var c = new THREE.CylinderGeometry(0.3, 0.35, 1.4, 7); c.translate(0, 0.7, 0); return c; }), M.std(0x9c917f));
    g.add(t);
    var roof = mesh(G('roof', function () { var c = new THREE.ConeGeometry(0.4, 0.5, 7); c.translate(0, 1.65, 0); return c; }), M.std(rand() < 0.5 ? 0x3a5bd9 : 0xe63946));
    g.add(roof);
  }
  function addTank(g, rand) {
    var t = mesh(G('tank', function () { var c = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8); c.translate(0, 0.4, 0); return c; }), M.std(0x9ef0ff, { transparent: true, opacity: 0.6, roughness: 0.1 }));
    g.add(t);
    var l = mesh(G('tankLiq', function () { var c = new THREE.CylinderGeometry(0.21, 0.21, 0.5, 8); c.translate(0, 0.25, 0); return c; }), M.glow(rand() < 0.5 ? 0x3cff9e : 0xff5cf4, 0.7), false);
    g.add(l);
    var cap = mesh(G('tankCap', function () { var c = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 8); c.translate(0, 0.82, 0); return c; }), M.std(0x8ea2bf, { metalness: 0.5 }));
    g.add(cap);
  }
  function addCrate(g, rand) {
    var c = mesh(G('crate', function () { var b = new THREE.BoxGeometry(0.5, 0.5, 0.5); b.translate(0, 0.25, 0); return b; }), M.std(rand() < 0.5 ? 0xffb703 : 0x8ea2bf));
    c.rotation.y = rand(); g.add(c);
  }
  function addAntenna(g) {
    var p = mesh(G('antPole', function () { var c = new THREE.CylinderGeometry(0.03, 0.05, 1.2, 5); c.translate(0, 0.6, 0); return c; }), M.std(0x5d6b80));
    g.add(p);
    var d = mesh(G('antDish', function () { var c = new THREE.SphereGeometry(0.25, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.5); c.rotateX(Math.PI * 0.75); c.translate(0, 1.2, 0); return c; }), M.std(0xdfe6f0));
    g.add(d);
  }
  function addCrystalSpire(g, rand) {
    var s = 0.6 + rand() * 0.9;
    var c = mesh(G('spire', function () { var o = new THREE.OctahedronGeometry(0.25, 0); o.scale(0.6, 2.2, 0.6); o.translate(0, 0.5, 0); return o; }), M.glow(rand() < 0.5 ? 0x7cf7ff : 0xff5cf4, 0.6));
    c.scale.setScalar(s); c.rotation.y = rand() * 3; g.add(c);
  }
  function addFloatCube(g, rand, self) {
    var c = mesh(G('fcube', function () { return new THREE.BoxGeometry(0.3, 0.3, 0.3); }), M.std(0x3a2f7c));
    c.position.y = 0.8 + rand(); c.rotation.set(rand(), rand(), rand()); g.add(c);
    var e = new THREE.LineSegments(G('fcubeE', function () { return new THREE.EdgesGeometry(new THREE.BoxGeometry(0.31, 0.31, 0.31)); }), new THREE.LineBasicMaterial({ color: 0x7cf7ff }));
    e.material._own = true;
    c.add(e);
    self.spinners.push({ obj: c, spin: 0.8, bob: 0.2, baseY: c.position.y, phase: rand() * 6 });
  }

  /* =======================================================
     Sincronização e animação dos eventos do motor
     ======================================================= */
  Scene3D.prototype.updateFromWorld = function (world, instant) {
    this.setLasers(world.laserSnapshot());
    this.setPortalOpen(world.goalOpen());
    if (world.fog) this.updateFog(world);
  };

  Scene3D.prototype.dur = function (ms) { return Math.max(60, ms / this.speed); };

  Scene3D.prototype.animateEvent = function (ev, world) {
    var self = this, b = this.byte, root = b.root;
    if (!this.ok) return Promise.resolve();
    var p = Promise.resolve();
    var moveAll = function () { return self._moveActors(ev); };

    switch (ev.kind) {
      case 'move': {
        var from = this.cellPos(ev.from.x, ev.from.y), to = this.cellPos(ev.to.x, ev.to.y);
        var doorK = ev.doorOpened ? ev.doorOpened.x + ',' + ev.doorOpened.y : null;
        b.setState('walk');
        p = (doorK ? this.openDoor(doorK) : Promise.resolve()).then(function () {
          return Promise.all([
            self.tween(self.dur(420), function (k) { root.position.lerpVectors(from, to, easeInOut(k)); }),
            moveAll()
          ]);
        }).then(function () {
          b.setState('idle');
          var after = [];
          if (ev.collected) {
            var ck = ev.collected.x + ',' + ev.collected.y;
            b.setState('collect'); b.setMood('happy');
            after.push(self.collectItem(ck));
            after.push(self.wait(self.dur(450)).then(function () { b.setState('idle'); b.setMood('normal'); }));
          }
          if (ev.switched) after.push(self.pressSwitch(ev.switched.x + ',' + ev.switched.y, ev.switched.on));
          self.updateFromWorld(world);
          return Promise.all(after);
        });
        break;
      }
      case 'turn': {
        var a0 = root.rotation.y, a1 = a0 + (ev.side === 'left' ? Math.PI / 2 : -Math.PI / 2);
        b.setState('turn');
        p = Promise.all([
          this.tween(this.dur(300), function (k) { root.rotation.y = a0 + (a1 - a0) * easeInOut(k); }),
          moveAll()
        ]).then(function () { b.setState('idle'); self.updateFromWorld(world); });
        break;
      }
      case 'wait': {
        b.setMood('think');
        p = Promise.all([this.wait(this.dur(380)), moveAll()]).then(function () { b.setMood('normal'); self.updateFromWorld(world); });
        break;
      }
      case 'bump': {
        var f0 = this.cellPos(ev.from.x, ev.from.y);
        var d = LA.DIRS[ev.dir != null ? ev.dir : world.dir];
        b.setState('walk');
        p = this.tween(this.dur(200), function (k) { root.position.set(f0.x + d[0] * 0.28 * k, 0, f0.z + d[1] * 0.28 * k); })
          .then(function () {
            self.burst(new THREE.Vector3(f0.x + d[0] * 0.45, 0.5, f0.z + d[1] * 0.45), [0xffffff, 0xffd23f], 8, { up: 1.5 });
            b.setState('error'); b.setMood('error');
            return self.tween(self.dur(220), function (k) { root.position.set(f0.x + d[0] * 0.28 * (1 - k), 0, f0.z + d[1] * 0.28 * (1 - k)); });
          }).then(function () { return self.wait(500); });
        break;
      }
      case 'fall': {
        var ff = this.cellPos(ev.from.x, ev.from.y), ft = this.cellPos(ev.to.x, ev.to.y);
        b.setState('walk');
        p = this.tween(this.dur(350), function (k) { root.position.lerpVectors(ff, ft, k); })
          .then(function () { b.setState('defeat'); b.setMood('off'); return self.tween(700, function (k) { root.position.y = -k * k * 4; }); })
          .then(function () { return self.wait(300); });
        break;
      }
      case 'zap': {
        var zf = this.cellPos(ev.from.x, ev.from.y), zt = this.cellPos(ev.to.x, ev.to.y);
        b.setState('walk');
        p = this.tween(this.dur(380), function (k) { root.position.lerpVectors(zf, zt, k); })
          .then(function () {
            self.burst(zt.clone().setY(0.6), [0xff3b3b, 0xffffff, 0xffd23f], 22, { up: 3.5 });
            b.setState('defeat'); b.setMood('off');
            return self.wait(900);
          });
        break;
      }
      case 'drone': {
        b.setState('error'); b.setMood('error');
        this.burst(root.position.clone().setY(0.6), [0xff3b3b, 0xffffff], 12);
        p = this.wait(800).then(function () { b.setState('defeat'); b.setMood('off'); return self.wait(500); });
        break;
      }
      case 'noenergy': {
        b.setState('defeat'); b.setMood('off');
        p = this.wait(1000);
        break;
      }
    }
    return p.then(function () {
      if (ev.fail && ev.fail.reason === 'caught') {
        b.setState('defeat'); b.setMood('off');
        self.burst(root.position.clone().setY(0.5), [0xd62839, 0x222222], 16);
        return self.wait(900);
      }
      if (ev.fail && ev.fail.reason === 'locked' || ev.fail && ev.fail.reason === 'portalvar') {
        b.setState('error'); b.setMood('error');
        return self.wait(900);
      }
    });
  };

  Scene3D.prototype._moveActors = function (ev) {
    var self = this, all = [];
    if (ev.drones) ev.drones.forEach(function (d, i) {
      var g = self.drones[i]; if (!g) return;
      var from = g.position.clone(), to = self.cellPos(d.x, d.y, 0.55);
      all.push(self.tween(self.dur(380), function (k) { g.position.lerpVectors(from, to, easeInOut(k)); }));
    });
    if (ev.chaser && this.chaser) {
      var g = this.chaser, from = g.position.clone(), to = this.cellPos(ev.chaser.x, ev.chaser.y);
      if (to.distanceTo(from) > 0.01) {
        var ang = Math.atan2(to.x - from.x, to.z - from.z);
        g.rotation.y = ang;
      }
      all.push(this.tween(this.dur(400), function (k) { g.position.lerpVectors(from, to, easeInOut(k)); }));
    }
    if (ev.lasers) {
      var lasers = ev.lasers;
      all.push(this.wait(this.dur(200)).then(function () { self.setLasers(lasers); }));
    }
    return Promise.all(all);
  };

  Scene3D.prototype.celebrate = function () {
    var self = this;
    this.byte.setState('celebrate'); this.byte.setMood('happy');
    var pos = this.byte.root.position.clone().setY(0.8);
    var colors = [0xff6b9a, 0xffd23f, 0x5ee7ff, 0x7dff9b, 0xb06bff];
    this.burst(pos, colors, 40, { up: 5, speed: 3, life: 1.6 });
    if (this.portal) this.burst(this.portal.g.position.clone().setY(1), colors, 20, { up: 4, life: 1.4 });
    return this.wait(1400).then(function () { self.byte.setState('idle'); });
  };
  Scene3D.prototype.showError = function () {
    var b = this.byte;
    b.setState('error'); b.setMood('error');
    return this.wait(900).then(function () { b.setState('idle'); b.setMood('normal'); });
  };

  /* Ponto da tela onde fica a cabeça do Byte (para o balão de fala). */
  Scene3D.prototype.byteScreenPos = function () {
    if (!this.ok || !this.container) return null;
    var v = this.byte.root.position.clone(); v.y += 1.3;
    v.project(this.camera);
    return { x: (v.x + 1) / 2 * this.container.clientWidth, y: (1 - v.y) / 2 * this.container.clientHeight };
  };

  /* Cena decorativa da tela inicial. */
  Scene3D.prototype.buildHome = function () {
    if (!this.ok) return;
    var lv = { id: 'home', world: 1, variants: [{ dir: 'S', map: [
      '#.#C#',
      '.....',
      'B.S.E',
      '.....',
      '#.K.#'] }] };
    var w = new LA.World(lv, 0);
    this.buildLevel(lv, w, { theme: 'vale' });
    this.byte.setArrowVisible(false);
    this.bounds.minY = -1.2;
    this.zoomFactor = 1;
    this.fitCamera();
    var self = this;
    this.homeMode = true;
    this.onFrame = function (dt, t) {
      if (!self.homeMode) return;
      self.orbit = Math.sin(t * 0.15) * 0.5;
      self.fitCamera();
    };
    this.byte.setState('celebrate'); this.byte.setMood('happy');
    clearInterval(this._homeTimer);
    this._homeTimer = setInterval(function () {
      if (!self.homeMode) return;
      var s = self.byte.state;
      self.byte.setState(s === 'idle' ? 'celebrate' : 'idle');
      self.byte.setMood(s === 'idle' ? 'happy' : 'normal');
    }, 3200);
  };
  Scene3D.prototype.leaveHome = function () {
    this.homeMode = false; this.onFrame = null; this.orbit = 0;
    clearInterval(this._homeTimer);
    this.byte.setArrowVisible(true);
  };

  function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

  LA.Scene3D = Scene3D;
})(globalThis.LA = globalThis.LA || {});
