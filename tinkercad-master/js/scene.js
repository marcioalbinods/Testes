/* Tinkercad Master — visualizador 3D das referências (Three.js + CSG real para os furos). */
(function () {
  const TM = (window.TM = window.TM || {});
  let libP = null;

  function loadLib() {
    if (!libP) {
      libP = Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
        import('three/addons/renderers/CSS2DRenderer.js'),
        import('three-bvh-csg').catch(() => null)
      ]).then(([THREE, OC, CSS2D, CSG]) => ({ THREE, OrbitControls: OC.OrbitControls, CSS2DRenderer: CSS2D.CSS2DRenderer, CSS2DObject: CSS2D.CSS2DObject, CSG }));
    }
    return libP;
  }
  TM.loadLib = loadLib;

  /* ---------- Geometrias (sempre em mm, eixo Z para cima) ---------- */
  function buildGeometry(L, q) {
    const T = L.THREE;
    const [sx, sy, sz] = q.s;
    let g;
    const seg = q.sides || 48;
    switch (q.t) {
      case 'box':
        g = new T.BoxGeometry(1, 1, 1); g.scale(sx, sy, sz); break;
      case 'cyl':
      case 'poly':
        g = new T.CylinderGeometry(0.5, 0.5, 1, q.t === 'poly' ? q.sides || 6 : seg, 1);
        g.rotateX(Math.PI / 2);
        g.scale(sx, sy, sz); break;
      case 'cone': {
        g = new T.CylinderGeometry((q.top || 0) * 0.5, 0.5, 1, q.sides || seg, 1);
        g.rotateX(Math.PI / 2); g.scale(sx, sy, sz); break;
      }
      case 'sphere':
        g = new T.SphereGeometry(0.5, 40, 24); g.rotateX(Math.PI / 2); g.scale(sx, sy, sz); break;
      case 'hemi': {
        g = new T.SphereGeometry(0.5, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new T.CircleGeometry(0.5, 40); cap.rotateX(Math.PI / 2);
        g = mergeSimple(T, [g, cap]);
        g.rotateX(Math.PI / 2); g.translate(0, 0, -0.25);
        g.scale(sx, sy, sz * 2); break;
      }
      case 'pyr': {
        const n = q.sides || 4;
        g = new T.ConeGeometry(n === 4 ? Math.SQRT1_2 : 0.5, 1, n, 1);
        if (n === 4) g.rotateY(Math.PI / 4);
        g.rotateX(Math.PI / 2); g.scale(sx, sy, sz); break;
      }
      case 'para': {
        const pts = [];
        for (let i = 0; i <= 20; i++) { const r = 0.5 * Math.sqrt(1 - i / 20); pts.push(new T.Vector2(Math.max(r, 0.0001), i / 20 - 0.5)); }
        pts.unshift(new T.Vector2(0.0001, -0.5));
        g = new T.LatheGeometry(pts, 40); g.rotateX(Math.PI / 2); g.scale(sx, sy, sz); break;
      }
      case 'roof':
      case 'wedge':
      case 'rroof': {
        const sh = new T.Shape();
        if (q.t === 'roof') { sh.moveTo(-0.5, -0.5); sh.lineTo(0.5, -0.5); sh.lineTo(0, 0.5); sh.closePath(); }
        else if (q.t === 'wedge') { sh.moveTo(-0.5, -0.5); sh.lineTo(0.5, -0.5); sh.lineTo(-0.5, 0.5); sh.closePath(); }
        else { sh.moveTo(-0.5, -0.5); sh.lineTo(0.5, -0.5); sh.absarc(0, -0.5, 0.5, 0, Math.PI, false); sh.closePath(); }
        g = new T.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 32 });
        g.translate(0, 0, -0.5);
        const M = new T.Matrix4();
        if (q.t === 'wedge') M.set(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1); // perfil X-Z, extrusão em Y
        else M.set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1); // perfil Y-Z, cumeeira em X
        g.applyMatrix4(M);
        if (q.t === 'rroof') { g.scale(sx, sy, sz * 2); g.translate(0, 0, sz * 0.5); }
        else g.scale(sx, sy, sz);
        break;
      }
      case 'torus': {
        const t = sz, R = (sx - t) / 2;
        g = new T.TorusGeometry(Math.max(R, 0.1), t / 2, 18, 56);
        if (sy !== sx) g.scale(1, sy / sx, 1);
        break;
      }
      case 'tube': {
        const ro = 0.5 * sx, ri = Math.max(ro - (q.wall || 2), 0.05), h = sz;
        const pts = [new T.Vector2(ri, -h / 2), new T.Vector2(ro, -h / 2), new T.Vector2(ro, h / 2), new T.Vector2(ri, h / 2), new T.Vector2(ri, -h / 2)];
        g = new T.LatheGeometry(pts, q.sides || 48); g.rotateX(Math.PI / 2);
        if (sy !== sx) g.scale(1, sy / sx, 1);
        break;
      }
      default:
        g = new T.BoxGeometry(sx, sy, sz);
    }
    g = g.index ? g.toNonIndexed() : g;
    g.computeVertexNormals();
    if (!g.attributes.uv) {
      const n = g.attributes.position.count; g.setAttribute('uv', new T.BufferAttribute(new Float32Array(n * 2), 2));
    }
    g.clearGroups();
    return g;
  }
  function mergeSimple(T, geos) {
    const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
    const attrs = ['position', 'normal', 'uv'];
    const out = new T.BufferGeometry();
    attrs.forEach((a) => {
      const size = parts[0].attributes[a].itemSize;
      const total = parts.reduce((s, g) => s + g.attributes[a].array.length, 0);
      const arr = new Float32Array(total); let off = 0;
      parts.forEach((g) => { arr.set(g.attributes[a].array, off); off += g.attributes[a].array.length; });
      out.setAttribute(a, new T.BufferAttribute(arr, size));
    });
    return out;
  }

  function placeMesh(L, mesh, q) {
    const T = L.THREE;
    const [x, y, z] = q.p;
    mesh.position.set(x, y, q.cz != null ? q.cz : z + q.s[2] / 2); // cz = centro explícito (útil em peças giradas)
    if (q.r) mesh.rotation.set(T.MathUtils.degToRad(q.r[0] || 0), T.MathUtils.degToRad(q.r[1] || 0), T.MathUtils.degToRad(q.r[2] || 0), q.ro || 'XYZ');
    mesh.updateMatrixWorld(true);
  }

  /* Textura listrada dos furos (como no Tinkercad) */
  let stripeTex = null;
  function holeTexture(T) {
    if (stripeTex) return stripeTex;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = '#c7ced8'; x.fillRect(0, 0, 64, 64);
    x.strokeStyle = '#8d97a5'; x.lineWidth = 7;
    for (let i = -64; i < 128; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); }
    stripeTex = new T.CanvasTexture(c); stripeTex.wrapS = stripeTex.wrapT = T.RepeatWrapping; stripeTex.repeat.set(3, 3);
    return stripeTex;
  }

  /* ---------- Cache de resultados CSG por fase ---------- */
  const csgCache = new Map();

  function boxesIntersect(a, b) { return a.intersectsBox(b); }

  function computeResult(L, key, parts) {
    if (csgCache.has(key)) return csgCache.get(key);
    const T = L.THREE;
    const solids = parts.filter((q) => !q.hole);
    const holes = parts.filter((q) => q.hole);
    const out = [];
    const evaluator = L.CSG ? new L.CSG.Evaluator() : null;
    if (evaluator) { evaluator.attributes = ['position', 'normal', 'uv']; evaluator.useGroups = false; }
    const holeBrushes = holes.map((h) => {
      const b = L.CSG ? new L.CSG.Brush(buildGeometry(L, h)) : new T.Mesh(buildGeometry(L, h));
      placeMesh(L, b, h); const bb = new T.Box3().setFromObject(b); return { b, bb, g: h.g };
    });
    solids.forEach((q, idx) => {
      const geo = buildGeometry(L, q);
      let mesh;
      if (evaluator && holes.length) {
        let brush = new L.CSG.Brush(geo); placeMesh(L, brush, q);
        const bb = new T.Box3().setFromObject(brush);
        let cut = false;
        holeBrushes.forEach((h) => {
          if ((h.g || 0) !== (q.g || 0)) return;
          if (!boxesIntersect(bb, h.bb)) return;
          try { brush = evaluator.evaluate(brush, h.b, L.CSG.SUBTRACTION); cut = true; } catch (e) { /* mantém */ }
        });
        if (cut) {
          const g2 = brush.geometry.clone();
          g2.applyMatrix4(brush.matrixWorld);
          mesh = { geo: g2, world: true };
        } else mesh = { geo, world: false };
      } else mesh = { geo, world: false };
      out.push({ q, idx, ...mesh });
    });
    csgCache.set(key, out);
    return out;
  }

  /* ---------- Visualizador ---------- */
  class Viewer {
    constructor(container, opts) {
      this.el = container; this.opts = opts || {}; this.mode = 'result'; this.explode = 0; this.labels = [];
      this.ready = loadLib().then((L) => { this.L = L; this._init(); return this; });
    }
    _init() {
      const { THREE: T, OrbitControls, CSS2DRenderer } = this.L;
      const w = this.el.clientWidth || 600, h = this.el.clientHeight || 420;
      const r = (this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!this.opts.thumb }));
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.setSize(w, h);
      r.outputColorSpace = T.SRGBColorSpace;
      this.el.appendChild(r.domElement);
      if (!this.opts.thumb) {
        this.labelR = new CSS2DRenderer(); this.labelR.setSize(w, h);
        Object.assign(this.labelR.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
        this.el.appendChild(this.labelR.domElement);
      }
      this.scene = new T.Scene();
      this.cam = new T.PerspectiveCamera(32, w / h, 1, 20000);
      this.cam.up.set(0, 0, 1); // eixo Z para cima, como no Tinkercad
      const hemi = new T.HemisphereLight(0xffffff, 0x8899aa, 1.35); hemi.position.set(0, 0, 1); this.scene.add(hemi);
      const d1 = new T.DirectionalLight(0xffffff, 1.6); d1.position.set(1.2, -1.6, 2.4); this.scene.add(d1);
      const d2 = new T.DirectionalLight(0xffffff, 0.45); d2.position.set(-1.5, 1.2, 0.6); this.scene.add(d2);
      this.root = new T.Group(); this.scene.add(this.root);
      if (!this.opts.thumb) {
        this.controls = new OrbitControls(this.cam, r.domElement);
        this.controls.enableDamping = true; this.controls.dampingFactor = 0.08;
        this.controls.addEventListener('start', () => { this.autoRotate = false; this.opts.onInteract && this.opts.onInteract(); });
        this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.el);
        this._loop = this._loop.bind(this); this.raf = requestAnimationFrame(this._loop);
      }
    }
    resize() {
      if (!this.renderer) return;
      const w = this.el.clientWidth, h = this.el.clientHeight; if (!w || !h) return;
      this.renderer.setSize(w, h); this.labelR && this.labelR.setSize(w, h);
      this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
    }
    _loop() {
      this.raf = requestAnimationFrame(this._loop);
      if (this.autoRotate && this.controls) {
        const T = this.L.THREE; const t = this.controls.target; const off = this.cam.position.clone().sub(t);
        off.applyAxisAngle(new T.Vector3(0, 0, 1), 0.0035); this.cam.position.copy(t).add(off);
      }
      // anima explosão
      if (this.meshes) {
        const k = this.explode;
        this.meshes.forEach((m) => { if (m.userData.base) m.position.copy(m.userData.base).addScaledVector(m.userData.dir, k); });
        this.labels.forEach((lb) => { lb.visible = k > 0.15 && this.mode === 'explode'; });
      }
      this.controls && this.controls.update();
      this.renderer.render(this.scene, this.cam);
      this.labelR && this.labelR.render(this.scene, this.cam);
    }
    setModel(key, parts, mode) {
      this.key = key; this.parts = parts; this.mode = mode || this.mode;
      return this.ready.then(() => this._build());
    }
    setMode(mode) { this.mode = mode; if (mode !== 'explode') this.explode = 0; return this.ready.then(() => this._build(true)); }
    setExplode(v) { this.explode = v * this.explodeScale; }
    _clear() {
      while (this.root.children.length) { const c = this.root.children.pop(); c.traverse((o) => { if (o.element && o.element.remove) o.element.remove(); }); }
      this.labels = []; this.meshes = [];
    }
    _build(keepCam) {
      const L = this.L, T = L.THREE; this._clear();
      const parts = this.parts || [];
      const bbAll = new T.Box3();
      const matCache = {};
      const mat = (c) => matCache[c] || (matCache[c] = new T.MeshStandardMaterial({ color: c, roughness: 0.52, metalness: 0.04, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
      const holeMat = new T.MeshStandardMaterial({ color: 0xffffff, map: holeTexture(T), transparent: true, opacity: 0.42, depthWrite: false, roughness: 0.9 });
      const edgeMat = new T.LineBasicMaterial({ color: 0x1b2230, transparent: true, opacity: 0.28 });
      const showResult = this.mode === 'result';
      const items = [];
      if (showResult) {
        computeResult(L, this.key, parts).forEach((r) => {
          const m = new T.Mesh(r.geo, mat(r.q.c));
          if (!r.world) placeMesh(L, m, r.q);
          items.push({ m, q: r.q, cut: r.world });
        });
      } else {
        parts.forEach((q) => {
          const m = new T.Mesh(buildGeometry(L, q), q.hole ? holeMat : mat(q.c));
          placeMesh(L, m, q); if (q.hole) m.renderOrder = 2;
          items.push({ m, q });
        });
      }
      items.forEach(({ m, q, cut }) => {
        if (!cut && (!q.hole || !showResult)) { // peças cortadas por CSG ficam sem contorno (evita linhas de triangulação)
          const e = new T.LineSegments(new T.EdgesGeometry(m.geometry, 28), edgeMat);
          m.add(e);
        }
        this.root.add(m); m.updateMatrixWorld(true);
        bbAll.expandByObject(m);
      });
      // direções de explosão
      const center = bbAll.getCenter(new T.Vector3()); const size = bbAll.getSize(new T.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 10);
      this.explodeScale = maxDim * 0.55;
      const seen = new Set();
      items.forEach(({ m, q }) => {
        const c = new T.Box3().setFromObject(m).getCenter(new T.Vector3());
        let dir;
        if (q.ex) dir = new T.Vector3(q.ex[0], q.ex[1], q.ex[2]);
        else { dir = c.clone().sub(center); dir.z *= 1.4; if (dir.length() < 1e-3) dir.set(0, 0, 0); }
        const len = dir.length(); if (len > 0) dir.divideScalar(Math.max(len, 1e-6)).multiplyScalar(Math.min(1, 0.35 + len / maxDim));
        m.userData.base = m.position.clone(); m.userData.dir = dir;
        this.meshes.push(m);
        if (this.labelR && q.n && !seen.has(q.n) && L.CSS2DObject) {
          seen.add(q.n);
          const div = document.createElement('div'); div.className = 'tm-label'; div.textContent = q.n;
          const lab = new L.CSS2DObject(div); lab.position.set(0, 0, q.s[2] / 2 + 2); lab.visible = false;
          m.add(lab); this.labels.push(lab);
        }
      });
      // plano de trabalho (grade azul do Tinkercad)
      const span = Math.max(Math.ceil(Math.max(size.x, size.y) * 1.3 / 20) * 20, 60);
      const plane = new T.Mesh(new T.PlaneGeometry(span, span), new T.MeshBasicMaterial({ color: 0x9fc4ee, transparent: true, opacity: 0.55, depthWrite: false }));
      plane.position.set(center.x, center.y, -0.05); this.root.add(plane);
      const grid = new T.GridHelper(span, Math.round(span / (span > 300 ? 10 : 5)), 0x3f7fd0, 0x7aa9e0);
      grid.rotation.x = Math.PI / 2; grid.position.set(center.x, center.y, 0.02); grid.material.transparent = true; grid.material.opacity = 0.55; this.root.add(grid);
      this.bb = { center, maxDim, size };
      if (!keepCam || !this._fitted) this.fit('iso');
      if (this.opts.thumb) { this.renderer.render(this.scene, this.cam); }
    }
    fit(view) {
      const T = this.L.THREE; if (!this.bb) return;
      const { center, size } = this.bb;
      const c3 = center.clone();
      // raio da esfera envolvente, com reforço para objetos altos e estreitos
      const radius = Math.max(size.length() / 2, size.z * 0.62, 8);
      const dist = (radius / Math.sin(T.MathUtils.degToRad(this.cam.fov / 2))) * (this.opts.thumb ? 0.86 : 0.92);
      const dirs = { iso: [0.95, -1.35, 0.85], front: [0, -1, 0.18], top: [0, -0.0001, 1], side: [1, 0, 0.18] };
      const d = new T.Vector3(...(dirs[view] || dirs.iso)).normalize();
      this.cam.position.copy(c3).addScaledVector(d, dist);
      this.cam.near = dist / 100; this.cam.far = dist * 10; this.cam.updateProjectionMatrix();
      this.cam.lookAt(c3);
      if (this.controls) { this.controls.target.copy(c3); this.controls.update(); }
      this._fitted = true;
    }
    snapshot() { this.renderer.render(this.scene, this.cam); return this.renderer.domElement.toDataURL('image/png'); }
    dispose() {
      cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect();
      this.controls && this.controls.dispose(); this.renderer && this.renderer.dispose();
      this.el.innerHTML = '';
    }
  }
  TM.Viewer = Viewer;

  /* ---------- Miniaturas (um renderizador compartilhado, fila) ---------- */
  const thumbCache = new Map(); let thumbViewer = null; let queue = Promise.resolve();
  TM.thumb = (key, parts) => {
    if (thumbCache.has(key)) return Promise.resolve(thumbCache.get(key));
    queue = queue.then(async () => {
      if (thumbCache.has(key)) return thumbCache.get(key);
      if (!thumbViewer) {
        const host = document.createElement('div');
        Object.assign(host.style, { position: 'fixed', left: '-9999px', top: '0', width: '320px', height: '240px' });
        document.body.appendChild(host);
        thumbViewer = new Viewer(host, { thumb: true }); await thumbViewer.ready;
      }
      await thumbViewer.setModel(key, parts, 'result');
      const url = thumbViewer.snapshot(); thumbCache.set(key, url);
      await new Promise((r) => setTimeout(r, 0));
      return url;
    }).catch(() => null);
    return queue;
  };
})();
