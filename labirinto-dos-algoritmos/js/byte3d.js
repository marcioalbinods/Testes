/* =========================================================
   LABIRINTO DOS ALGORITMOS — Byte, o robô (Three.js low poly)
   Estados de animação: idle, walk, turn, collect, celebrate,
   error, defeat. A cena controla posição/rotação; aqui ficam
   os movimentos do corpo, braços, cabeça, olhos e antena.
   ========================================================= */
(function (LA) {
  'use strict';

  LA.createByte = function (THREE, M) {
    var root = new THREE.Group();
    root.name = 'Byte';
    var rig = new THREE.Group();
    root.add(rig);

    var white = M.std(0xf4f7fb), teal = M.std(0x1fc8b5), dark = M.std(0x26304a), navy = M.std(0x0f1a33, { roughness: 0.3 });
    var yellow = M.glow(0xffd23f, 0.9), cyan = M.glow(0x64f4ff, 1.2);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x64f4ff, emissive: 0x64f4ff, emissiveIntensity: 1.3, flatShading: true });
    var chestMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffb800, emissiveIntensity: 0.9, flatShading: true });

    function box(w, h, d, mat, x, y, z, parent) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x || 0, y || 0, z || 0);
      m.castShadow = true; m.receiveShadow = true;
      (parent || rig).add(m);
      return m;
    }

    // pés (esteiras)
    var feet = [];
    [-0.14, 0.14].forEach(function (x) {
      var f = box(0.13, 0.1, 0.3, dark, x, 0.05, 0.01);
      var w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 8), teal);
      w1.rotation.z = Math.PI / 2; w1.position.set(0, -0.005, 0.12); f.add(w1);
      var w2 = w1.clone(); w2.position.z = -0.12; f.add(w2);
      feet.push(f);
    });

    // corpo
    var body = new THREE.Group(); body.position.y = 0.13; rig.add(body);
    var torso = box(0.44, 0.3, 0.34, white, 0, 0.15, 0, body);
    box(0.36, 0.06, 0.3, teal, 0, 0.02, 0, body);
    var chest = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 10), chestMat);
    chest.rotation.x = Math.PI / 2; chest.position.set(0, 0.17, 0.175); body.add(chest);
    box(0.2, 0.025, 0.01, teal, 0, 0.08, 0.172, body);

    // braços
    var arms = [];
    [-1, 1].forEach(function (s) {
      var pivot = new THREE.Group();
      pivot.position.set(0.27 * s, 0.26, 0);
      body.add(pivot);
      box(0.08, 0.2, 0.09, teal, 0, -0.09, 0, pivot);
      var hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), white);
      hand.position.y = -0.21; hand.castShadow = true; pivot.add(hand);
      arms.push(pivot);
    });

    // cabeça
    var head = new THREE.Group(); head.position.y = 0.47; body.add(head);
    box(0.52, 0.36, 0.42, white, 0, 0.16, 0, head);
    box(0.44, 0.25, 0.02, navy, 0, 0.17, 0.21, head);
    var eyes = [];
    [-0.1, 0.1].forEach(function (x) {
      var e = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.11, 0.02), eyeMat);
      e.position.set(x, 0.19, 0.222);
      head.add(e); eyes.push(e);
    });
    var mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), eyeMat);
    mouth.position.set(0, 0.09, 0.222); head.add(mouth);
    [-1, 1].forEach(function (s) {
      var ear = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 8), teal);
      ear.rotation.z = Math.PI / 2; ear.position.set(0.28 * s, 0.16, 0); ear.castShadow = true; head.add(ear);
    });
    var antenna = new THREE.Group(); antenna.position.set(0, 0.34, 0); head.add(antenna);
    var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 6), dark);
    stick.position.y = 0.08; antenna.add(stick);
    var ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), yellow);
    ball.position.y = 0.18; antenna.add(ball);

    // seta de direção no chão
    var shape = new THREE.Shape();
    shape.moveTo(0, 0.16); shape.lineTo(0.13, -0.02); shape.lineTo(0.05, -0.02); shape.lineTo(0.05, -0.1);
    shape.lineTo(-0.05, -0.1); shape.lineTo(-0.05, -0.02); shape.lineTo(-0.13, -0.02); shape.closePath();
    var arrow = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.85, depthWrite: false }));
    arrow.rotation.x = -Math.PI / 2; arrow.position.set(0, 0.015, 0.48);
    root.add(arrow);

    // sombra simples (para o modo leve sem sombras)
    var blob = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.01; root.add(blob);

    var state = 'idle', stateT = 0, mood = 'normal', nextBlink = 2, blinkT = -1;

    var MOODS = {
      normal: { color: 0x64f4ff, sy: 1, mouth: 1 },
      happy: { color: 0x7dff9b, sy: 0.45, mouth: 1.6 },
      think: { color: 0xffd23f, sy: 0.8, mouth: 0.6 },
      error: { color: 0xff5a5a, sy: 0.7, mouth: 0.5 },
      off: { color: 0x3a4660, sy: 0.15, mouth: 0.3 }
    };
    function applyMood() {
      var m = MOODS[mood] || MOODS.normal;
      eyeMat.color.setHex(m.color); eyeMat.emissive.setHex(m.color);
      eyeMat.emissiveIntensity = mood === 'off' ? 0.1 : 1.3;
      mouth.scale.x = m.mouth;
    }
    applyMood();

    var api = {
      root: root,
      get state() { return state; },
      setState: function (s) { state = s; stateT = 0; if (s === 'idle') { rig.rotation.set(0, 0, 0); rig.position.set(0, 0, 0); } },
      setMood: function (m) { mood = m; applyMood(); },
      setArrowVisible: function (v) { arrow.visible = v; },
      setBlobVisible: function (v) { blob.visible = v; },
      reset: function () {
        api.setState('idle'); api.setMood('normal');
        rig.rotation.set(0, 0, 0); rig.position.set(0, 0, 0); head.rotation.set(0, 0, 0);
        arms.forEach(function (a) { a.rotation.set(0, 0, 0); });
        root.scale.set(1, 1, 1); arrow.visible = true;
      },
      update: function (dt, t) {
        stateT += dt;
        var eyeSY = (MOODS[mood] || MOODS.normal).sy;
        // piscar
        if (mood === 'normal' || mood === 'think') {
          nextBlink -= dt;
          if (nextBlink <= 0) { blinkT = 0.14; nextBlink = 2 + Math.random() * 3; }
        }
        if (blinkT > 0) { blinkT -= dt; eyeSY *= 0.12; }
        eyes.forEach(function (e) { e.scale.y += (eyeSY - e.scale.y) * Math.min(1, dt * 25); });
        ball.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 4);
        chestMat.emissiveIntensity = mood === 'off' ? 0.05 : 0.6 + 0.4 * Math.sin(t * 3);

        var k;
        switch (state) {
          case 'idle':
            rig.position.y = 0.015 * Math.sin(t * 2.2);
            rig.rotation.x = 0; rig.rotation.z = 0;
            head.rotation.y = 0.15 * Math.sin(t * 0.7); head.rotation.z = 0;
            antenna.rotation.z = 0.12 * Math.sin(t * 2.4);
            arms[0].rotation.x = 0.08 * Math.sin(t * 2.2); arms[1].rotation.x = -0.08 * Math.sin(t * 2.2);
            arms[0].rotation.z = 0; arms[1].rotation.z = 0;
            feet[0].position.y = feet[1].position.y = 0.05;
            break;
          case 'walk':
            rig.position.y = Math.abs(Math.sin(stateT * 14)) * 0.05;
            rig.rotation.x = 0.1;
            arms[0].rotation.x = 0.7 * Math.sin(stateT * 14); arms[1].rotation.x = -0.7 * Math.sin(stateT * 14);
            feet[0].position.y = 0.05 + Math.max(0, Math.sin(stateT * 14)) * 0.04;
            feet[1].position.y = 0.05 + Math.max(0, -Math.sin(stateT * 14)) * 0.04;
            antenna.rotation.z = 0.25 * Math.sin(stateT * 14);
            head.rotation.y = 0;
            break;
          case 'turn':
            rig.position.y = Math.sin(Math.min(1, stateT * 3) * Math.PI) * 0.06;
            antenna.rotation.z = 0.3 * Math.sin(stateT * 20);
            break;
          case 'collect':
            k = Math.min(1, stateT * 2.2);
            rig.position.y = Math.sin(k * Math.PI) * 0.35;
            arms[0].rotation.x = arms[1].rotation.x = -2.6 * Math.sin(k * Math.PI);
            rig.rotation.y = k * Math.PI * 2;
            if (k >= 1) { rig.rotation.y = 0; }
            break;
          case 'celebrate':
            rig.position.y = Math.abs(Math.sin(stateT * 7)) * 0.4;
            rig.rotation.y = stateT * 5;
            arms[0].rotation.x = -2.8 + 0.4 * Math.sin(stateT * 18);
            arms[1].rotation.x = -2.8 - 0.4 * Math.sin(stateT * 18);
            arms[0].rotation.z = -0.3; arms[1].rotation.z = 0.3;
            antenna.rotation.z = 0.4 * Math.sin(stateT * 12);
            break;
          case 'error':
            k = Math.max(0, 1 - stateT * 1.2);
            head.rotation.y = Math.sin(stateT * 28) * 0.45 * k;
            rig.rotation.z = Math.sin(stateT * 28) * 0.08 * k;
            arms[0].rotation.z = -0.5 * k; arms[1].rotation.z = 0.5 * k;
            rig.position.y = 0;
            break;
          case 'defeat':
            k = Math.min(1, stateT * 1.6);
            rig.rotation.x = -1.25 * (1 - Math.pow(1 - k, 3));
            rig.position.y = 0.12 * Math.sin(k * Math.PI);
            rig.position.z = -0.12 * k;
            head.rotation.z = 0.3 * k;
            arms[0].rotation.x = arms[1].rotation.x = -1.4 * k;
            antenna.rotation.z = 0.6 * k;
            break;
        }
      }
    };
    return api;
  };
})(globalThis.LA = globalThis.LA || {});
