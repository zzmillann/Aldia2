/* Ruta · mapa 3D de la flota (three.js r128). Ciudad estilizada, furgonetas que circulan por sus rutas,
   rutas con flujo animado, paradas que pasan a verde al entregar y cámara que vuela. */
(function () {
  const T3 = window.THREE;
  const P = 16, X = i => (i - 6) * P, Z = j => (j - 4.5) * P;
  const BRIDGES = [2, 5, 8, 10, 12];
  const RIVER_Z0 = Z(6) + 2, RIVER_Z1 = Z(7) - 2;           // franja del río (con orillas)
  const C = (h) => new T3.Color(h);
  const OK = C('#19A974'), BAD = C('#E5484D'), MOVED = C('#A3A9B6'), NEWC = C('#2A2B2E');

  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let renderer, scene, camera, cont, W = 800, H = 400, card = false;
  const M = { vans: [], rutas: [], listeners: {}, T: 0 };
  const on = (k, f) => (M.listeners[k] = M.listeners[k] || []).push(f);
  const emit = (k, ...a) => (M.listeners[k] || []).forEach(f => f(...a));
  M.on = on;

  // ---------------------------------------------------------------- trayectorias
  function offsetPoly(nodes, off, closed) {
    const pts = nodes.map(([i, j]) => [X(i), Z(j)]), n = pts.length, out = [];
    for (let k = 0; k < n; k++) {
      const a = pts[(k - 1 + n) % n], b = pts[k], c = pts[(k + 1) % n];
      let n1 = null, n2 = null;
      if (closed || k > 0) { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); n1 = [-dz / l, dx / l]; }
      if (closed || k < n - 1) { const dx = c[0] - b[0], dz = c[1] - b[1], l = Math.hypot(dx, dz); n2 = [-dz / l, dx / l]; }
      if (!n1) n1 = n2; if (!n2) n2 = n1;
      const d = 1 + n1[0] * n2[0] + n1[1] * n2[1];
      // normal a la derecha del sentido de marcha (x hacia la izquierda de la normal geométrica)
      out.push([b[0] + (n1[0] + n2[0]) / d * off, b[1] + (n1[1] + n2[1]) / d * off]);
    }
    return out;
  }
  function smooth(pts, closed, r) {
    const n = pts.length, out = [];
    for (let k = 0; k < n; k++) {
      const b = pts[k];
      if (!closed && (k === 0 || k === n - 1)) { out.push(b); continue; }
      const a = pts[(k - 1 + n) % n], c = pts[(k + 1) % n];
      const d1 = [b[0] - a[0], b[1] - a[1]], l1 = Math.hypot(...d1), d2 = [c[0] - b[0], c[1] - b[1]], l2 = Math.hypot(...d2);
      const u1 = [d1[0] / l1, d1[1] / l1], u2 = [d2[0] / l2, d2[1] / l2];
      if (Math.abs(u1[0] * u2[0] + u1[1] * u2[1]) > .99) { out.push(b); continue; }
      const rr = Math.min(r, l1 * .45, l2 * .45), p0 = [b[0] - u1[0] * rr, b[1] - u1[1] * rr], p2 = [b[0] + u2[0] * rr, b[1] + u2[1] * rr];
      for (let s = 0; s <= 6; s++) { const t = s / 6, m = 1 - t; out.push([m * m * p0[0] + 2 * m * t * b[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * b[1] + t * t * p2[1]]); }
    }
    if (closed) out.push(out[0].slice());
    return out;
  }
  function makePath(nodes, off, closed = true) {
    const raw = offsetPoly(nodes, off, closed), pts = smooth(raw, closed, 3.2), cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    const L = cum[cum.length - 1];
    // distancias de las esquinas (para frenar en los giros)
    const corners = [];
    for (let k = 0; k < raw.length; k++) { if (!closed && (k === 0 || k === raw.length - 1)) continue; corners.push(project(raw[k][0], raw[k][1]).d); }
    function at(d) {
      d = closed ? ((d % L) + L) % L : clamp(d, 0, L);
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; }
      const seg = cum[hi] - cum[lo] || 1, t = (d - cum[lo]) / seg, a = pts[lo], b = pts[hi];
      return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, tx: (b[0] - a[0]) / seg, tz: (b[1] - a[1]) / seg };
    }
    function project(x, z) {
      let best = { e: 1e9, d: 0 };
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1;
        const t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / l2, 0, 1), px = a[0] + dx * t, pz = a[1] + dz * t, e = Math.hypot(x - px, z - pz);
        if (e < best.e) best = { e, d: cum[k - 1] + Math.sqrt(l2) * t, tx: dx / Math.sqrt(l2), tz: dz / Math.sqrt(l2) };
      }
      return best;
    }
    const p = { pts, cum, L, at, project, closed, corners: [] };
    p.corners = corners;
    return p;
  }

  // ---------------------------------------------------------------- materiales de ruta (flujo animado)
  const ribbonVS = `
    attribute float aD; attribute float aS; varying float vD; varying float vS;
    void main(){ vD = aD; vS = aS; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
  const ribbonFS = `
    uniform vec3 uColor; uniform float uTime; uniform float uProg; uniform float uLen; uniform float uOp;
    uniform float uRevFrom; uniform float uRev; uniform float uGlow; uniform float uClosed; uniform float uDash; uniform float uSpeed;
    varying float vD; varying float vS;
    void main(){
      float rel = uClosed > .5 ? mod(vD - uRevFrom + uLen, uLen) : vD - uRevFrom;
      if (rel > uRev * uLen + .01) discard;
      float edge = 1.0 - smoothstep(.62, 1.0, abs(vS));
      float done = uClosed > .5 ? step(mod(uProg - vD + uLen, uLen), uLen * .3) : 0.0;
      float f = fract((vD - uTime * uSpeed) / uDash);
      float dash = smoothstep(0.0, .12, f) * (1.0 - smoothstep(.42, .55, f));
      float head = 1.0 - smoothstep(0.0, 3.0, uRev * uLen - rel);
      vec3 col = uColor;
      float a;
      if (uGlow > .5) { a = (1.0 - abs(vS)) * (1.0 - abs(vS)) * .2 * (1.0 - done * .6); }
      else { a = edge * mix(.96, .42, done); col = mix(col, vec3(1.0), dash * (1.0 - done) * .62 + head * .45); }
      gl_FragColor = vec4(col, a * uOp);
    }`;
  function ribbon(path, width, color, glow) {
    const { pts, cum } = path, n = pts.length, pos = [], aD = [], aS = [], idx = [];
    for (let k = 0; k < n; k++) {
      const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)];
      let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      const nx = -tz, nz = tx, w = width / 2;
      pos.push(pts[k][0] + nx * w, 0, pts[k][1] + nz * w, pts[k][0] - nx * w, 0, pts[k][1] - nz * w);
      aD.push(cum[k], cum[k]); aS.push(1, -1);
      if (k < n - 1) { const o = k * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
    }
    const g = new T3.BufferGeometry();
    g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
    g.setAttribute('aD', new T3.Float32BufferAttribute(aD, 1));
    g.setAttribute('aS', new T3.Float32BufferAttribute(aS, 1));
    g.setIndex(idx);
    const m = new T3.ShaderMaterial({
      vertexShader: ribbonVS, fragmentShader: ribbonFS, transparent: true, depthWrite: false, side: T3.DoubleSide,
      uniforms: { uColor: { value: C(color) }, uTime: { value: 0 }, uProg: { value: 0 }, uLen: { value: path.L }, uOp: { value: 1 },
        uRevFrom: { value: 0 }, uRev: { value: 1 }, uGlow: { value: glow ? 1 : 0 }, uClosed: { value: path.closed ? 1 : 0 }, uDash: { value: 4.2 }, uSpeed: { value: 5 } }
    });
    const mesh = new T3.Mesh(g, m); mesh.renderOrder = glow ? 2 : 3; mesh.frustumCulled = false;
    return mesh;
  }

  // ---------------------------------------------------------------- texturas pequeñas
  function radialTex(inner, outer) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, inner); g.addColorStop(1, outer);
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T3.CanvasTexture(c);
  }
  function roofSign() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#F7F8FA'; x.fillRect(0, 0, 512, 256);
    x.strokeStyle = '#D5E2FF'; x.lineWidth = 6; x.strokeRect(18, 18, 476, 220);
    x.fillStyle = '#2F62E0'; x.font = '700 120px Inter, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('ARGA', 256, 112);
    x.fillStyle = '#6B6F76'; x.font = '600 30px Inter, Arial, sans-serif'; x.fillText('D I S T R I B U C I O N E S', 256, 196);
    const t = new T3.CanvasTexture(c); t.anisotropy = 4; return t;
  }

  // ---------------------------------------------------------------- ciudad
  function buildCity() {
    const r = rng(7);
    const ground = new T3.Mesh(new T3.PlaneGeometry(1400, 1400), new T3.MeshLambertMaterial({ color: 0xffffff }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);

    const boxes = [];   // [x, z, w, d, h, color]
    const slabs = [];   // aceras
    const parks = [];
    const trees = [];
    const inGrid = (bi, bj) => bi >= 0 && bi <= 11 && bj >= 0 && bj <= 8;
    const isWare = (bi, bj) => bi <= 1 && bi >= 0 && bj >= 7 && bj <= 8;
    const isCiud = (bi, bj) => bi >= 1 && bi <= 2 && bj >= 1 && bj <= 2;
    const tint = (base, v) => { const c = C(base); c.offsetHSL(0, 0, (r() - .5) * v * .5); return c; };

    for (let bi = -5; bi <= 16; bi++) for (let bj = -5; bj <= 14; bj++) {
      if (bj === 6) continue;
      if (isWare(bi, bj) || isCiud(bi, bj)) continue;
      const x0 = X(bi) + 2, x1 = X(bi + 1) - 2, z0 = Z(bj) + 2, z1 = Z(bj + 1) - 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const grid = inGrid(bi, bj);
      const far = Math.max(0, Math.max(-bi, bi - 11, -bj, bj - 8));
      slabs.push([cx, cz, 12, 12]);
      if (bi === 6 && bj === 4) { // plaza del Castillo
        parks.push([cx, cz, 11, 11, '#E9EBEF']);
        for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; trees.push([cx + Math.cos(a) * 4.6, cz + Math.sin(a) * 4.6, .8]); }
        boxes.push([cx, cz, 1.6, 1.6, 1.4, C('#F4F5F7')]);
        continue;
      }
      if (bi === 7 && bj === 2) { // catedral
        const st = '#EFEBE4';
        boxes.push([cx, cz + 1, 9, 6, 5, C(st)], [cx - 3, cz - 3.2, 2.4, 2.4, 9.5, C(st)], [cx + 3, cz - 3.2, 2.4, 2.4, 9.5, C(st)], [cx, cz + 4.5, 3, 2, 6.5, C(st)]);
        continue;
      }
      const casco = bi >= 4 && bi <= 7 && bj >= 2 && bj <= 5;
      const ens = bi >= 8 && bi <= 11 && bj >= 1 && bj <= 5;
      const roch = bj >= 7 && bj <= 9 && bi >= 2;
      if (ens) { // manzana de ensanche con patio
        const h = 4.2 + r() * 1.6, t = 3.6, col = tint('#F1F2F5', .05);
        boxes.push([cx, z0 + t / 2, 12, t, h, col], [cx, z1 - t / 2, 12, t, h + (r() - .5) * 1.5, tint('#F1F2F5', .05)],
          [x0 + t / 2, cz, t, 12 - 2 * t, h, tint('#F1F2F5', .05)], [x1 - t / 2, cz, t, 12 - 2 * t, h - .6, tint('#F1F2F5', .05)]);
        if (r() < .5) trees.push([cx, cz, .9]);
        continue;
      }
      if (casco) { // lotes pequeños y bajos
        const n = 3;
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
          if (r() < .12) continue;
          const w = 12 / n, lx = x0 + w * (a + .5), lz = z0 + w * (b + .5);
          boxes.push([lx, lz, w - .25, w - .25, 2.2 + r() * 2.4, tint('#F2F1EF', .06)]);
        }
        continue;
      }
      if (roch && grid) { // torres
        const k = 1 + Math.floor(r() * 2);
        if (k === 1) boxes.push([cx, cz, 7 + r() * 3, 9 + r() * 2, 6 + r() * 6, tint('#F0F2F6', .05)]);
        else { boxes.push([cx - 3, cz - 2, 5, 7, 5 + r() * 6, tint('#F0F2F6', .05)], [cx + 3.2, cz + 2.5, 5, 6, 4 + r() * 6, tint('#F0F2F6', .05)]); }
        if (r() < .6) trees.push([cx + (r() - .5) * 9, cz + 5, .8]);
        continue;
      }
      // genérico
      const hMax = far ? Math.max(2, 6 - far * 1.0) : 5.5;
      const lots = r() < .4 ? 1 : 2;
      for (let a = 0; a < lots; a++) for (let b = 0; b < 2; b++) {
        const w = 12 / lots, lx = x0 + w * (a + .5), lz = z0 + 6 * (b + .5);
        boxes.push([lx, lz, w - .5, 5.5, 2 + r() * hMax, tint(far ? '#F4F5F7' : '#F1F2F5', .05)]);
      }
    }

    // ciudadela (fuerte en estrella con parque)
    { const cx = (X(1) + X(3)) / 2, cz = (Z(1) + Z(3)) / 2;
      parks.push([cx, cz, 28, 28, '#E4F1E8']);
      const sh = new T3.Shape(); const N = 5;
      for (let k = 0; k < N * 2; k++) { const a = k / (N * 2) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? 7.2 : 11.5; const px = Math.cos(a) * rr, pz = Math.sin(a) * rr; k ? sh.lineTo(px, pz) : sh.moveTo(px, pz); }
      sh.closePath();
      const hole = new T3.Path(); for (let k = 0; k < N * 2; k++) { const a = k / (N * 2) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? 6.0 : 9.8; const px = Math.cos(a) * rr, pz = Math.sin(a) * rr; k ? hole.lineTo(px, pz) : hole.moveTo(px, pz); }
      sh.holes.push(hole);
      const eg = new T3.ExtrudeGeometry(sh, { depth: 1.3, bevelEnabled: false }); eg.rotateX(Math.PI / 2); eg.translate(cx, 1.3, cz);
      const wall = new T3.Mesh(eg, new T3.MeshLambertMaterial({ color: 0xD4E6DA })); scene.add(wall);
      const inner = new T3.Mesh(new T3.CircleGeometry(7.5, 10), new T3.MeshLambertMaterial({ color: 0xDCEDE2 })); inner.rotation.x = -Math.PI / 2; inner.position.set(cx, .2, cz); scene.add(inner);
      for (let k = 0; k < 46; k++) { const a = r() * Math.PI * 2, rr = 12.2 + r() * 1.6; trees.push([cx + Math.cos(a) * rr, cz + Math.sin(a) * rr, .7 + r() * .5]); }
    }

    // almacén (Landaben): parcela de 2×2 manzanas
    const WX0 = X(0) + 2, WX1 = X(2) - 2, WZ0 = Z(7) + 2, WZ1 = Z(9) - 2;
    slabs.push([(WX0 + WX1) / 2, (WZ0 + WZ1) / 2, WX1 - WX0, WZ1 - WZ0, '#E6E8EC']);
    { const bx0 = WX0 + 1, bx1 = WX0 + 17, bz0 = WZ0 + 1, bz1 = WZ1 - 4;
      const bw = bx1 - bx0, bd = bz1 - bz0, bh = 5.5, bcx = (bx0 + bx1) / 2, bcz = (bz0 + bz1) / 2;
      boxes.push([bcx, bcz, bw, bd, bh, C('#ECEEF2')]);
      const sign = new T3.Mesh(new T3.PlaneGeometry(13, 6.5), new T3.MeshBasicMaterial({ map: roofSign() }));
      sign.rotation.x = -Math.PI / 2; sign.position.set(bcx, bh + .06, bcz); scene.add(sign);
      // muelles en la fachada este
      const dockM = new T3.MeshBasicMaterial({ color: 0x6B6F76 }), stripe = new T3.MeshBasicMaterial({ color: 0xB3B7BE });
      for (let k = 0; k < 4; k++) {
        const dz = bz0 + 2.6 + k * 4.6;
        const d = new T3.Mesh(new T3.BoxGeometry(.1, 3.2, 3), dockM); d.position.set(bx1 + .06, 1.7, dz); scene.add(d);
        const s = new T3.Mesh(new T3.BoxGeometry(.12, .16, 3), stripe); s.position.set(bx1 + .08, 3.45, dz); scene.add(s);
      }
      M.ware = { x: bx1, z0: bz0, docks: [0, 1, 2, 3].map(k => bz0 + 2.6 + k * 4.6), cx: bcx, cz: bcz };
      // remolque aparcado
      boxes.push([WX1 - 2.2, WZ1 - 6.5, 2.6, 11, 3.8, C('#E3E6EC')]);
      // palés de reserva
      for (let k = 0; k < 5; k++) boxes.push([bx1 + 7.5, bz0 + 1.5 + k * 1.6, 1.2, 1.1, .9 + r() * .6, C('#D8C8AE')]);
    }

    // aceras / losas
    const slabG = new T3.BoxGeometry(1, 1, 1); slabG.translate(0, .5, 0);
    const slabMesh = new T3.InstancedMesh(slabG, new T3.MeshLambertMaterial({ color: 0xffffff }), slabs.length + parks.length); slabMesh.frustumCulled = false;
    const m4 = new T3.Matrix4(); let si = 0;
    slabs.forEach(s => { m4.makeScale(s[2], .22, s[3]); m4.setPosition(s[0], 0, s[1]); slabMesh.setMatrixAt(si, m4); slabMesh.setColorAt(si++, C(s[4] || '#E9ECF1')); });
    parks.forEach(s => { m4.makeScale(s[2], .26, s[3]); m4.setPosition(s[0], 0, s[1]); slabMesh.setMatrixAt(si, m4); slabMesh.setColorAt(si++, C(s[4])); });
    slabMesh.receiveShadow = true; scene.add(slabMesh);

    // edificios instanciados + ventanas por shader
    const bG = new T3.BoxGeometry(1, 1, 1); bG.translate(0, .5, 0);
    const bM = new T3.MeshLambertMaterial({ color: 0xffffff });
    bM.onBeforeCompile = (sh) => {
      sh.vertexShader = 'varying vec3 vWP; varying vec3 vWN;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
        #ifdef USE_INSTANCING
          vWP = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz; vWN = normalize(mat3(instanceMatrix) * objectNormal);
        #else
          vWP = (modelMatrix * vec4(transformed,1.0)).xyz; vWN = objectNormal;
        #endif`);
      sh.fragmentShader = 'varying vec3 vWP; varying vec3 vWN;\n' + sh.fragmentShader.replace('#include <fog_fragment>', `
        if (abs(vWN.y) < .5) {
          float h = vWP.y; float u = abs(vWN.x) > .5 ? vWP.z : vWP.x; float face = abs(vWN.x) > .5 ? vWP.x : vWP.z;
          gl_FragColor.rgb *= mix(.9, 1.0, smoothstep(0.0, 2.6, h));
        }
        #include <fog_fragment>`);
    };
    const bMesh = new T3.InstancedMesh(bG, bM, boxes.length); bMesh.frustumCulled = false;
    const edge = [];
    boxes.forEach((b, k) => {
      m4.makeScale(b[2], b[4], b[3]); m4.setPosition(b[0], .2, b[1]); bMesh.setMatrixAt(k, m4); bMesh.setColorAt(k, b[5]);
      if (Math.abs(b[0]) < 120 && b[1] > -100 && b[1] < 95) {
        const x0 = b[0] - b[2] / 2, x1 = b[0] + b[2] / 2, z0 = b[1] - b[3] / 2, z1 = b[1] + b[3] / 2, y = b[4] + .2;
        edge.push(x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0,
          x0, .2, z0, x0, y, z0, x1, .2, z0, x1, y, z0, x1, .2, z1, x1, y, z1, x0, .2, z1, x0, y, z1);
      }
    });
    scene.add(bMesh);
    // sombras suaves en el suelo (más baratas que un shadow map): un plano difuminado por edificio, desplazado según la luz
    { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
      x.filter = 'blur(7px)'; x.fillStyle = '#000'; x.fillRect(14, 14, 36, 36);
      const sg = new T3.PlaneGeometry(1, 1); sg.rotateX(-Math.PI / 2);
      const sm = new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(c), color: 0x1c2740, transparent: true, opacity: .3, depthWrite: false });
      const sh = new T3.InstancedMesh(sg, sm, boxes.length); sh.frustumCulled = false;
      let ns = 0; boxes.forEach(b => { if (Math.abs(b[0]) > 118 || b[1] < -95 || b[1] > 92) return; const h = b[4]; m4.makeScale((b[2] + h * .55) * 1.3, 1, (b[3] + h * .45) * 1.3); m4.setPosition(b[0] + h * .3, .24, b[1] - h * .24); sh.setMatrixAt(ns++, m4); }); sh.count = ns;
      sh.renderOrder = 1; scene.add(sh); }
    const eg = new T3.BufferGeometry(); eg.setAttribute('position', new T3.Float32BufferAttribute(edge, 3));
    scene.add(new T3.LineSegments(eg, new T3.LineBasicMaterial({ color: 0xBFC4CC, transparent: true, opacity: .22 })));

    // río Arga
    { const seg = 120, pos = [], idx = [];
      for (let k = 0; k <= seg; k++) {
        const x = -330 + 660 * k / seg, w = Math.sin(x * .045) * .9;
        pos.push(x, .03, RIVER_Z0 + 2.2 + w, x, .03, RIVER_Z1 - 2.2 + w * .7);
        if (k < seg) { const o = k * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
      }
      const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      M.riverMat = new T3.ShaderMaterial({ transparent: false, uniforms: { uT: { value: 0 } },
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `uniform float uT; varying vec3 vP;
          void main(){ float s = sin(vP.x * .35 + vP.z * 1.7 - uT * 1.4) * sin(vP.x * .11 - uT * .5);
            float l = smoothstep(.82, 1.0, s); vec3 c = mix(vec3(.80,.87,.97), vec3(.84,.90,.99), .5 + .5 * sin(vP.x * .02));
            gl_FragColor = vec4(c + l * vec3(.08,.06,.02), 1.0); }` });
      scene.add(new T3.Mesh(g, M.riverMat));
      // orillas verdes con árboles
      const bank = new T3.MeshLambertMaterial({ color: 0xE1F0E6 });
      [[RIVER_Z0, RIVER_Z0 + 2.4], [RIVER_Z1 - 2.4, RIVER_Z1]].forEach(([a, b]) => {
        const m = new T3.Mesh(new T3.PlaneGeometry(660, b - a), bank); m.rotation.x = -Math.PI / 2; m.position.set(0, .02, (a + b) / 2); scene.add(m);
        for (let x = -200; x < 200; x += 5.5 + r() * 5) if (!BRIDGES.some(i => Math.abs(X(i) - x) < 4)) trees.push([x, (a + b) / 2, .7 + r() * .4]);
      });
      // puentes
      const deck = new T3.MeshLambertMaterial({ color: 0xFFFFFF }), rail = new T3.MeshLambertMaterial({ color: 0xC9CDD4 });
      BRIDGES.forEach(i => {
        const len = Z(7) - Z(6) - 4;
        const d = new T3.Mesh(new T3.BoxGeometry(5.6, .5, len), deck); d.position.set(X(i), -.2, (Z(6) + Z(7)) / 2); scene.add(d);
        [-2.75, 2.75].forEach(o => { const rr = new T3.Mesh(new T3.BoxGeometry(.18, .5, len), rail); rr.position.set(X(i) + o, .25, (Z(6) + Z(7)) / 2); scene.add(rr); });
      });
    }

    // marcas viales en las calles de la rejilla
    { const dashes = [];
      for (let j = 0; j <= 9; j++) for (let i = 0; i < 12; i++) { if (j === 8 && i <= 1) continue; for (let k = 1; k < 5; k++) dashes.push([X(i) + k * 3.2, Z(j), 1.4, .14]); }
      for (let i = 0; i <= 12; i++) for (let j = 0; j < 9; j++) { if (j === 6) continue; if (i === 1 && j >= 7) continue; if (i === 2 && (j === 1 || j === 2)) continue; for (let k = 1; k < 5; k++) dashes.push([X(i), Z(j) + k * 3.2, .14, 1.4]); }
      const dg = new T3.PlaneGeometry(1, 1); dg.rotateX(-Math.PI / 2);
      const dm = new T3.InstancedMesh(dg, new T3.MeshBasicMaterial({ color: 0xE6E8EC }), dashes.length); dm.frustumCulled = false;
      dashes.forEach((d, k) => { m4.makeScale(d[2], 1, d[3]); m4.setPosition(d[0], .015, d[1]); dm.setMatrixAt(k, m4); });
      scene.add(dm);
    }

    // árboles
    { const tg = new T3.IcosahedronGeometry(1, 0); tg.translate(0, 1.3, 0);
      const tm = new T3.InstancedMesh(tg, new T3.MeshLambertMaterial({ color: 0xffffff }), trees.length); tm.frustumCulled = false;
      trees.forEach((t, k) => { m4.makeScale(t[2] * 1.1, t[2] * 1.3, t[2] * 1.1); m4.setPosition(t[0], .2, t[1]); tm.setMatrixAt(k, m4); tm.setColorAt(k, C('#B9DCC6').offsetHSL(0, 0, (r() - .5) * .06)); });
      scene.add(tm);
    }
  }

  // ---------------------------------------------------------------- furgoneta
  const glowTex = () => M._glow || (M._glow = radialTex('rgba(255,236,200,.9)', 'rgba(255,236,200,0)'));
  const shadowTex = () => M._shadow || (M._shadow = radialTex('rgba(0,0,0,.75)', 'rgba(0,0,0,0)'));
  function makeVan(color) {
    const g = new T3.Group(), body = new T3.Group(); g.add(body);
    const lam = c => new T3.MeshLambertMaterial({ color: c });
    const box = (w, h, d, m, x, y, z) => { const b = new T3.Mesh(new T3.BoxGeometry(w, h, d), m); b.position.set(x, y, z); body.add(b); return b; };
    const cm = lam(color); cm.emissive = C(color).multiplyScalar(.12);
    box(1.72, 1.8, 2.7, cm, 0, 1.28, -.5);
    const white = lam(0xffffff);
    box(1.68, 1.3, 1.25, white, 0, 1.03, 1.45);
    box(1.62, .62, .55, white, 0, .7, 2.32);
    const glass = new T3.MeshLambertMaterial({ color: 0x33405A, emissive: 0x111827 });
    const ws = box(1.5, .62, .06, glass, 0, 1.36, 2.07); ws.rotation.x = -.42;
    box(.06, .5, .8, glass, .85, 1.35, 1.5); box(.06, .5, .8, glass, -.85, 1.35, 1.5);
    box(1.74, .16, 2.72, lam(0xC9CDD4), 0, .42, -.5);
    const tire = lam(0x2A2B2E), wg = new T3.CylinderGeometry(.37, .37, .32, 12); wg.rotateZ(Math.PI / 2);
    [[.84, 1.6], [-.84, 1.6], [.84, -1.25], [-.84, -1.25]].forEach(([x, z]) => { const w = new T3.Mesh(wg, tire); w.position.set(x, .37, z); body.add(w); });
    const hl = new T3.MeshBasicMaterial({ color: 0xFFF6DC }), tl = new T3.MeshBasicMaterial({ color: 0xE5484D });
    box(.36, .14, .06, hl, .56, .8, 2.6); box(.36, .14, .06, hl, -.56, .8, 2.6);
    box(.18, .34, .06, tl, .74, 1.0, -1.86); box(.18, .34, .06, tl, -.74, 1.0, -1.86);
    const glow = new T3.Mesh(new T3.PlaneGeometry(3.2, 6), new T3.MeshBasicMaterial({ map: glowTex(), transparent: true, opacity: .22, blending: T3.AdditiveBlending, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.set(0, .05, 5.2); glow.visible = false; g.add(glow);
    const sh = new T3.Mesh(new T3.PlaneGeometry(3, 5.6), new T3.MeshBasicMaterial({ map: shadowTex(), transparent: true, opacity: .35, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = .04; g.add(sh);
    const ring = new T3.Mesh(new T3.RingGeometry(4.6, 5.1, 48), new T3.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .08; g.add(ring);
    g.userData = { ring, body, glow };
    body.scale.setScalar(1.45);
    scene.add(g);
    return g;
  }

  // ---------------------------------------------------------------- paradas (pines)
  const pinStick = new T3.CylinderGeometry(.1, .1, 3.6, 6); pinStick.translate(0, 1.8, 0);
  const pinHead = new T3.SphereGeometry(.95, 18, 14);
  const pinBase = new T3.CircleGeometry(1.25, 28); pinBase.rotateX(-Math.PI / 2);
  function makePin(color) {
    const g = new T3.Group();
    const stick = new T3.Mesh(pinStick, new T3.MeshBasicMaterial({ color: 0x9A9EA6, transparent: true, opacity: .9 }));
    const hm = new T3.MeshLambertMaterial({ color }); hm.emissive = C(color).multiplyScalar(.2);
    const head = new T3.Mesh(pinHead, hm); head.position.y = 4.2;
    const base = new T3.Mesh(pinBase, new T3.MeshBasicMaterial({ color, transparent: true, opacity: .45, depthWrite: false }));
    base.position.y = .26;
    g.add(stick, head, base); g.userData = { head, base, hm };
    scene.add(g); return g;
  }
  const rings = [];
  function pulse(x, z, color, big) {
    let r = rings.find(q => !q.visible);
    if (!r) { r = new T3.Mesh(new T3.RingGeometry(.8, 1.05, 40), new T3.MeshBasicMaterial({ transparent: true, depthWrite: false })); r.rotation.x = -Math.PI / 2; scene.add(r); rings.push(r); }
    r.visible = true; r.position.set(x, .3, z); r.material.color.set(color); r.userData = { t: 0, big: big || 1 };
  }

  // ---------------------------------------------------------------- rutas y furgonetas
  function buildRoutes() {
    const R = window.ARGA.RUTAS;
    R.forEach((rd, k) => {
      const off = 1.05;
      const path = makePath(rd.nodos, off);
      const ru = { d: rd, col: C(rd.color), k, path, ribbons: [ribbon(path, 1.5, rd.color), ribbon(path, 5.2, rd.color, true)], stops: [], op: 1, opT: 1 };
      ru.ribbons.forEach(m => { m.position.y = .07 + k * .006; scene.add(m); });
      if (rd.nodosB) {
        ru.pathA = path; ru.pathB = makePath(rd.nodosB, off);
        ru.ribbonsB = [ribbon(ru.pathB, 1.5, rd.color), ribbon(ru.pathB, 5.2, rd.color, true)];
        ru.ribbonsB.forEach(m => { m.position.y = .07 + k * .006; m.visible = false; scene.add(m); });
      }
      if (rd.antes) {
        ru.antes = makePath(rd.antes, off, false);
        ru.antesRib = [ribbon(ru.antes, 1.3, '#E5484D'), ribbon(ru.antes, 4.4, '#E5484D', true)];
        ru.antesRib.forEach(m => { m.position.y = .1; m.visible = false; m.material.uniforms.uDash.value = 2.2; m.material.uniforms.uSpeed.value = 2; scene.add(m); });
      }
      rd.paradas.forEach((p, si) => {
        const sx = X(p[0]), sz = Z(p[1]);
        const pr = path.project(sx, sz);
        // a la derecha del sentido de marcha, en la acera
        const px = sx - pr.tz * 3.6, pz = sz + pr.tx * 3.6;
        const pin = makePin(rd.color); pin.position.set(px, 0, pz);
        const st = { ru, si, name: p[2], addr: p[3], cajas: p[4], tipo: p[5], x: px, z: pz, sx, sz, dA: pr.d, d: pr.d, pin, ok: false, state: 'normal', col: C(rd.color), okT: -9 };
        if (ru.pathB) st.dB = ru.pathB.project(sx, sz).d;
        ru.stops.push(st);
      });
      const van = makeVan(rd.color);
      const v = { ru, g: van, d: rd.fase * path.L, v: 0, dwell: 0, hold: null, sel: 0, selT: 0, label: null, done: rd.hechas, delivered: 0 };
      ru.van = v;
      // estado inicial de los pines: entregados los que quedan detrás en el último 60 % de la vuelta
      ru.stops.forEach(s => { s.ok = ((v.d - s.d + path.L) % path.L) < path.L * .45; });
      M.rutas.push(ru); M.vans.push(v);
      placeVan(v);
    });
    // furgoneta 7 en el muelle del almacén
    const f7 = makeVan('#B3B7BE');
    f7.position.set(M.ware.x + 3.1, 0, M.ware.docks[2]); f7.rotation.y = Math.PI / 2;
    M.f7 = { g: f7, label: null };
  }
  function placeVan(v) {
    const p = v.ru.path.at(v.d);
    v.g.position.set(p.x, 0, p.z);
    v.g.rotation.y = Math.atan2(p.tx, p.tz);
  }

  const NS = { s: null, dist: 0 };
  function nextStop(v) {
    const L = v.ru.path.L, st = v.ru.stops; let best = null, bd = 1e9;
    for (let k = 0; k < st.length; k++) { const s = st[k]; if (s.state === 'moved') continue; const dd = (s.d - v.d + L) % L; if (dd > .05 && dd < bd) { bd = dd; best = s; } }
    NS.s = best; NS.dist = bd; return NS;
  }
  M.nextStop = (v) => nextStop(v).s;

  function updateVan(v, dt) {
    const path = v.ru.path, L = path.L;
    if (v.dwell > 0) { v.dwell -= dt; if (v.dwell > 0) { placeVan(v); return; } }
    let { s, dist } = nextStop(v);
    let target = dist;
    if (v.hold != null) { const dh = (v.hold - v.d + L) % L; if (dh < .05) { v.v = 0; placeVan(v); return; } if (dh < target) { target = dh; s = null; } }
    let vlim = v.ru.d.vel * (card ? 1.15 : 1);
    vlim = Math.min(vlim, .5 + Math.sqrt(2 * 1.3 * target));
    let dc = 1e9; const cs = path.corners; for (let k = 0; k < cs.length; k++) { const e = Math.abs(((cs[k] - v.d + L * 1.5) % L) - L * .5); if (e < dc) dc = e; }
    vlim = Math.min(vlim, 1.5 + dc * .45);
    v.v += clamp(vlim - v.v, -5 * dt, 1.7 * dt);
    const step = Math.max(0, v.v) * dt;
    if (step >= target) {
      v.d = (v.d + target) % L; v.v = 0;
      if (s) { v.dwell = 2.8; deliver(v, s); }
    } else v.d = (v.d + step) % L;
    placeVan(v);
  }
  function deliver(v, s) {
    if (s.state === 'incident') return;
    s.ok = true; s.okT = M.T; v.delivered++;
    pulse(s.x, s.z, '#19A974');
    emit('deliver', v, s);
  }

  // ---------------------------------------------------------------- etiquetas HTML
  let labelLayer;
  const tags = [];
  function tag(html, cls, world, opts = {}) {
    const el = document.createElement('div'); el.className = 'tag ' + (cls || ''); el.innerHTML = html;
    labelLayer.appendChild(el);
    const t = { el, world, obj: opts.obj || null, y: opts.y || 0, hide: false, minDist: opts.minDist, maxDist: opts.maxDist, px: -1, py: -1 };
    tags.push(t); return t;
  }
  M.tag = tag;
  M.removeTag = (t) => { if (!t) return; t.el.remove(); const i = tags.indexOf(t); if (i >= 0) tags.splice(i, 1); };
  const vproj = new T3.Vector3();
  function placeTags() {
    const dist = cam.dist;
    for (const t of tags) {
      if (t.obj) vproj.set(t.obj.position.x, t.y, t.obj.position.z); else { const w = typeof t.world === 'function' ? t.world() : t.world; vproj.set(w[0], t.y, w[1]); }
      vproj.project(camera);
      const vis = !t.hide && vproj.z < 1 && Math.abs(vproj.x) < 1.1 && vproj.y < .86 && vproj.y > -1.1 &&
        (!t.maxDist || dist < t.maxDist) && (!t.minDist || dist > t.minDist);
      if (!vis) { if (t._v !== 0) { t.el.style.opacity = 0; t._v = 0; } continue; }
      const x = (vproj.x + 1) / 2 * W, y = (1 - vproj.y) / 2 * H;
      if (Math.abs(x - t.px) > .2 || Math.abs(y - t.py) > .2) { t.px = x; t.py = y; t.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }
      if (t._v !== 1) { t.el.style.opacity = ''; t._v = 1; }
    }
  }
  M.screen = (x, y, z) => { vproj.set(x, y, z).project(camera); return [(vproj.x + 1) / 2 * W, (1 - vproj.y) / 2 * H]; };

  // ---------------------------------------------------------------- cámara
  const cam = { tx: 0, tz: 6, dist: 215, polar: .8, az: -.2, orbit: true, follow: null, shift: 0, shiftT: 0 };
  let fly = null;
  M.cam = cam;
  M.fly = function (o) {
    const from = { tx: cam.tx, tz: cam.tz, dist: cam.dist, polar: cam.polar, az: cam.az };
    const toT = o.van ? () => [o.van.g.position.x, o.van.g.position.z] : (o.target ? () => o.target : () => [cam.tx, cam.tz]);
    cam.follow = o.van || null;
    cam.orbit = !!o.orbit;
    fly = { from, toT, dist: o.dist ?? cam.dist, polar: o.polar ?? cam.polar, az: o.az ?? cam.az, t: 0, dur: Math.max(.001, o.dur ?? 1.8) };
    if (o.dur === 0) { fly.t = 1; stepCam(0); fly = null; }
    if (o.shift != null) { cam.shiftT = o.shift; if (o.dur === 0) cam.shift = o.shift; }
  };
  let orbitPhase = 0;
  function stepCam(dt) {
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const e = ease(fly.t), [tx, tz] = fly.toT();
      cam.tx = fly.from.tx + (tx - fly.from.tx) * e; cam.tz = fly.from.tz + (tz - fly.from.tz) * e;
      cam.dist = fly.from.dist + (fly.dist - fly.from.dist) * e;
      cam.polar = fly.from.polar + (fly.polar - fly.from.polar) * e;
      cam.az = fly.from.az + (fly.az - fly.from.az) * e;
      if (fly.t >= 1) { fly = null; orbitPhase = 0; }
    } else if (cam.follow) {
      const p = cam.follow.g.position, k = 1 - Math.exp(-dt * 3);
      cam.tx += (p.x - cam.tx) * k; cam.tz += (p.z - cam.tz) * k;
    }
    if (!fly && cam.orbit) { orbitPhase += dt; cam.az += Math.sin(orbitPhase * .05) * dt * .022 + dt * .006; }
    else if (!fly && cam.follow) cam.az += dt * .03;
    cam.shift += (cam.shiftT - cam.shift) * (1 - Math.exp(-dt * 4));
    const sp = Math.sin(cam.polar);
    camera.position.set(cam.tx + sp * Math.sin(cam.az) * cam.dist, Math.cos(cam.polar) * cam.dist, cam.tz + sp * Math.cos(cam.az) * cam.dist);
    camera.lookAt(cam.tx, 0, cam.tz);
    camera.setViewOffset(W, H, -cam.shift, 0, W, H);
  }

  // ---------------------------------------------------------------- estado de escena (lo usan los pasos del tour)
  M.select = function (v) { M.vans.forEach(q => (q.sel = q === v ? 1 : 0)); M.selVan = v; };
  M.dim = function (keep) { M.rutas.forEach(r => (r.opT = !keep || keep.includes(r.d.id) ? 1 : .18)); };
  M.hold = function (v, d, teleport) {
    v.hold = d; if (d != null && teleport) { v.d = d; v.v = 0; v.dwell = 0; placeVan(v); }
  };
  // incidencia de Bar La Plaza (R1): 'none' | 'open' | 'resolved'
  M.blp = () => M.rutas[0].stops[1];
  M.setIncident = function (state, animate) {
    const ru = M.rutas[0], s = M.blp(), v = ru.van;
    s.state = state === 'open' ? 'incident' : state === 'resolved' ? 'moved' : 'normal';
    if (state === 'open') { M.hold(v, s.dA, true); s.ok = false; usePath(ru, 'A'); }
    else if (state === 'resolved') {
      if (ru.path !== ru.pathB) { usePath(ru, 'B', animate); }
      M.hold(v, null);
    } else { usePath(ru, 'A'); M.hold(v, null); }
  };
  function usePath(ru, which, animate) {
    const toB = which === 'B';
    if ((ru.path === ru.pathB) === toB && !animate) { ru.ribbons.forEach(m => (m.visible = !toB)); ru.ribbonsB.forEach(m => (m.visible = toB)); return; }
    const old = toB ? ru.ribbons : ru.ribbonsB, nu = toB ? ru.ribbonsB : ru.ribbons;
    ru.path = toB ? ru.pathB : ru.pathA;
    ru.stops.forEach(s => (s.d = toB ? s.dB : s.dA));
    nu.forEach(m => { m.visible = true; m.material.uniforms.uLen.value = ru.path.L; });
    if (animate) {
      ru.anim = { t: 0, old, nu, from: ru.van.d };
      old.forEach(m => (m.visible = true));
    } else { old.forEach(m => (m.visible = false)); ru.anim = null; nu.forEach(m => { m.material.uniforms.uRev.value = 1; m.material.uniforms.uOp.value = 1; }); }
  }
  // comparación antes/después de R2
  M.optimizer = function (phase) { // 0 = nada, 1 = se dibuja «antes», 2 = se dibuja la optimizada
    const ru = M.rutas[1];
    ru.opt = { phase, t: 0 };
    ru.antesRib.forEach(m => { m.visible = phase > 0; m.material.uniforms.uRev.value = phase === 1 ? 0 : 1; m.material.uniforms.uOp.value = 1; });
    if (phase === 0) ru.ribbons.forEach(m => (m.material.uniforms.uRev.value = 1));
    if (phase === 1) ru.ribbons.forEach(m => (m.material.uniforms.uRev.value = 0));
  };
  // pedido nuevo que cae en el mapa
  M.dropOrder = function (i, j, on) {
    if (!M.newPin) { M.newPin = makePin('#2A2B2E'); M.newPin.userData.hm.emissive = C('#2A2B2E').multiplyScalar(.1); }
    const p = M.newPin; p.visible = !!on; p.position.set(X(i), 0, Z(j)); p.userData.t = on === 'instant' ? 9 : 0; p.userData.ring = 0;
  };
  // almacén: palés que entran en la furgoneta 7 (0..1)
  M.loading = function (on) {
    if (!M.pallets) {
      M.pallets = [];
      const crate = new T3.BoxGeometry(1.15, 1, 1.15); crate.translate(0, .5, 0);
      const cols = ['#D8C8AE', '#E2D4BC', '#D2C1A5', '#DDCDB3', '#D8C8AE', '#E2D4BC', '#D2C1A5', '#DDCDB3'];
      for (let k = 0; k < 8; k++) {
        const m = new T3.Mesh(crate, new T3.MeshLambertMaterial({ color: C(cols[k]) }));
        const base = new T3.Mesh(new T3.BoxGeometry(1.25, .16, 1.25), new T3.MeshLambertMaterial({ color: 0xB89E78 })); base.position.y = .08; m.add(base);
        m.visible = false; scene.add(m); M.pallets.push(m);
      }
    }
    M.load = { on, t: 0 };
    M.pallets.forEach(p => (p.visible = false));
  };

  // ---------------------------------------------------------------- bucle
  const tmpC = new T3.Color();
  M.update = function (dt, T) {
    M.T = T;
    M.riverMat.uniforms.uT.value = T;
    M.vans.forEach(v => updateVan(v, dt));
    M.rutas.forEach(ru => {
      ru.op += (ru.opT - ru.op) * (1 - Math.exp(-dt * 4));
      const prog = ru.van.d;
      const setU = (m, op) => { const u = m.material.uniforms; u.uTime.value = T; u.uProg.value = prog; u.uOp.value = op; };
      if (ru.anim) { // re-ruta animada: lo viejo se apaga, lo nuevo se dibuja desde la furgoneta
        const a = ru.anim; a.t += dt;
        a.old.forEach(m => { const u = m.material.uniforms; u.uOp.value = Math.max(0, 1 - a.t / .9) * ru.op; u.uColor.value.copy(ru.col).lerp(BAD, Math.min(1, a.t * 2)); u.uTime.value = T; });
        const k = clamp((a.t - .5) / 1.6, 0, 1);
        a.nu.forEach(m => { const u = m.material.uniforms; u.uRevFrom.value = a.from; u.uRev.value = ease(k); setU(m, ru.op); });
        if (a.t > 2.3) { a.old.forEach(m => { m.visible = false; m.material.uniforms.uColor.value.set(ru.d.color); }); a.nu.forEach(m => { m.material.uniforms.uRev.value = 1; m.material.uniforms.uRevFrom.value = 0; }); ru.anim = null; }
      } else {
        (ru.path === ru.pathB ? ru.ribbonsB : ru.ribbons).forEach(m => setU(m, ru.op));
      }
      if (ru.opt) { // antes / después
        const o = ru.opt; o.t += dt;
        if (o.phase === 1) ru.antesRib.forEach(m => { m.material.uniforms.uRev.value = ease(clamp(o.t / 1.8, 0, 1)); m.material.uniforms.uTime.value = T; });
        if (o.phase === 2) {
          ru.antesRib.forEach(m => { m.material.uniforms.uOp.value = Math.max(.0, 1 - o.t / 1.0); m.material.uniforms.uTime.value = T; });
          ru.ribbons.forEach(m => { m.material.uniforms.uRevFrom.value = 0; m.material.uniforms.uRev.value = ease(clamp((o.t - .4) / 1.8, 0, 1)); });
          if (o.t > 1.2) ru.antesRib.forEach(m => (m.visible = false));
        }
      }
      // pines
      const L = ru.path.L;
      ru.stops.forEach(s => {
        const behind = (ru.van.d - s.d + L) % L;
        if (s.ok && behind > L * .45 && s.state === 'normal' && T - s.okT > 4) s.ok = false;
        let target = ru.d.color, op = ru.op;
        if (s.state === 'incident') target = '#E5484D'; else if (s.state === 'moved') target = '#A3A9B6'; else if (s.ok) target = '#19A974';
        const hm = s.pin.userData.hm; tmpC.set(target);
        hm.color.lerp(tmpC, 1 - Math.exp(-dt * 5)); hm.emissive.copy(hm.color).multiplyScalar(.2);
        s.pin.userData.base.material.color.copy(hm.color); s.pin.userData.base.material.opacity = .35 * op;
        const head = s.pin.userData.head;
        let sc = 1; const since = T - s.okT; if (since < .8) sc = 1 + Math.sin(since / .8 * Math.PI) * .55;
        if (s.state === 'incident') { sc = 1.15 + Math.sin(T * 6) * .12; if ((T * 1.2) % 1 < dt * 1.2) pulse(s.x, s.z, '#E5484D', 1.4); }
        head.scale.setScalar(sc * (op < .5 ? .7 : 1));
        s.pin.visible = op > .25 || s.state !== 'normal';
      });
    });
    // anillo de selección
    M.vans.forEach(v => {
      const rg = v.g.userData.ring; v.selT += (v.sel - v.selT) * (1 - Math.exp(-dt * 5));
      rg.material.opacity = v.selT * (.55 + Math.sin(T * 4) * .25); rg.scale.setScalar(1 + Math.sin(T * 4) * .06);
      v.g.userData.body.position.y = v.v > .3 ? Math.sin(T * 18 + v.ru.k) * .02 : 0;
    });
    // anillos de pulso
    rings.forEach(r => { if (!r.visible) return; const u = r.userData; u.t += dt; const k = u.t / 1.3; r.scale.setScalar(1 + k * 5 * u.big); r.material.opacity = Math.max(0, .9 * (1 - k)); if (k >= 1) r.visible = false; });
    // pedido nuevo
    if (M.newPin && M.newPin.visible) {
      const u = M.newPin.userData; u.t += dt;
      const k = clamp(u.t / .7, 0, 1); const y = (1 - k) * 26 + (k >= 1 ? Math.abs(Math.sin(Math.min(1, (u.t - .7) / .5) * Math.PI)) * .9 * Math.max(0, 1 - (u.t - .7) / .5) : 0);
      u.head = u.head || M.newPin.userData.head;
      M.newPin.children.forEach(ch => { if (ch !== M.newPin.userData.base) ch.position.y = (ch === M.newPin.userData.head ? 4.2 : 0) + y; });
      u.ring = (u.ring || 0) + dt; if (k >= 1 && u.ring > 1.1) { u.ring = 0; pulse(M.newPin.position.x, M.newPin.position.z, '#2F62E0', 1.2); }
    }
    // palés
    if (M.load && M.load.on) {
      const L = M.load; L.t += dt;
      M.pallets.forEach((p, k) => {
        const t0 = k * .55, t = L.t - t0; if (t < 0) { p.visible = false; return; }
        p.visible = true;
        const dz = M.ware.docks[2], row = k % 2, col = Math.floor(k / 2);
        const sx = M.ware.x + 2.4 + col * 1.45, sz = dz - 4.4 - row * 1.4;
        const ex = M.ware.x + 1.2, ez = dz;
        const m = clamp((t - 2.2 - k * .25) / .8, 0, 1), pop = clamp(t / .35, 0, 1);
        p.position.set(sx + (ex - sx) * ease(m), 0, sz + (ez - sz) * ease(m));
        p.scale.setScalar((.4 + .6 * pop) * (1 - .55 * ease(m)));
        if (m >= 1) p.visible = false;
      });
    }
    stepCam(dt);
    placeTags();
  };
  M.render = () => renderer.render(scene, camera);
  M.resize = function (w, h, pr) {
    W = w; H = h; renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };

  M.init = function (canvas, container, layer, opts) {
    card = !!opts.card; cont = container; labelLayer = layer;
    renderer = new T3.WebGLRenderer({ canvas, antialias: opts.aa !== false, alpha: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0xF4F5F7, 1);
        scene = new T3.Scene();
    scene.fog = new T3.Fog(0xF4F5F7, 230, 520);
    camera = new T3.PerspectiveCamera(card ? 34 : 30, 2, 1, 1200);
    scene.add(new T3.HemisphereLight(0xffffff, 0xBFC5D0, .6));
    const dl = new T3.DirectionalLight(0xffffff, .62); dl.position.set(-70, 130, 55);
    dl.target.position.set(0, 0, 10); scene.add(dl, dl.target);
    buildCity();
    buildRoutes();
    M.resize(opts.w, opts.h, opts.pr);
    stepCam(0);
    M.ready = true;
    return M;
  };
  M.grid = { X, Z };
  window.Mapa = M;
})();
