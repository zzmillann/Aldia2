/* ALDIA — portada: «Automatiza hoy. Lidera mañana.»
   Escena (Three.js): el amanecer de mañana. El horizonte de un planeta hecho de puntos, con un sol azul
   y violeta saliendo por detrás. Por encima vuelan arcos de luz entre puntos del planeta con paquetes
   que los recorren: las automatizaciones trabajando.
   Ratón: los puntos bajo el cursor se encienden, el sol lo sigue un poco y el planeta se inclina.
   Clic: lanza un arco nuevo desde donde pulsas. Scroll: el planeta gira y el sol sube.
   Sin ratón (móvil o quieto), la escena se mueve sola. */
(function () {
  const root = document.querySelector('.hx'); if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = [...root.querySelectorAll('.hx__rot span')];
  const copy = root.querySelector('.hx__copy');
  const COLORS = ['#2F62E0'];
  let cur = 0;
  // la palabra que cambia: si la nueva es más larga, primero se abre el hueco y luego entra;
  // si es más corta, primero cambia y luego se cierra el hueco (así nunca se corta ninguna letra)
  const rot = root.querySelector('.hx__rot');
  let wTimer = 0;
  const swap = k => words.forEach((w, j) => { w.classList.toggle('is-on', j === k); w.classList.toggle('is-out', j === (k + words.length - 1) % words.length); });
  const setWord = (k, instant) => {
    cur = k; clearTimeout(wTimer);
    const nw = words[k] ? words[k].scrollWidth : 0, ow = rot ? rot.getBoundingClientRect().width : 0;
    if (instant || !rot || !ow) { swap(k); if (rot) rot.style.width = nw + 'px'; return; }
    if (nw >= ow) { rot.style.width = nw + 'px'; wTimer = setTimeout(() => swap(k), 140); }
    else { swap(k); wTimer = setTimeout(() => { rot.style.width = nw + 'px'; }, 260); }
  };
  addEventListener('resize', () => setWord(cur, true));
  if (document.fonts) document.fonts.ready.then(() => setWord(cur, true));
  setWord(0, true);
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
  if (!reduce) setInterval(() => { if (visible && !document.hidden) setWord((cur + 1) % words.length); }, 3200);

  let mx = 0, my = 0, tmx = 0, tmy = 0, scrollP = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth * 2 - 1; tmy = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const onScroll = () => { const r = root.getBoundingClientRect(); scrollP = Math.min(Math.max(-r.top / (r.height * .8), 0), 1); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const THREE = window.THREE;
  const canvas = root.querySelector('[data-hx-gl]');
  if (!THREE || !canvas || reduce) { root.classList.add('no-gl'); return; }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const DPR = Math.min(devicePixelRatio, 2); renderer.setPixelRatio(DPR);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

  const R = 7.2;                                   // radio del planeta
  const planet = new THREE.Group(); planet.position.set(0, -R + .5, 0); scene.add(planet);

  const radial = (stops, size = 256) => { const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
    const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); stops.forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g; c.fillRect(0, 0, size, size); return new THREE.CanvasTexture(cv); };

  // ---------- sol que sale detrás del horizonte ----------
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [.12, 'rgba(196,210,255,.95)'], [.35, 'rgba(139,124,255,.45)'], [.65, 'rgba(91,140,255,.14)'], [1, 'rgba(91,140,255,0)']]), transparent: true, depthWrite: false }));
  sun.scale.set(11, 11, 1); sun.position.set(0, -.6, -9); scene.add(sun);
  const rays = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial([[0, 'rgba(139,124,255,.35)'], [.5, 'rgba(91,140,255,.08)'], [1, 'rgba(91,140,255,0)']]), transparent: true, depthWrite: false }));
  rays.scale.set(28, 9, 1); rays.position.set(0, -1.1, -10); scene.add(rays);

  // ---------- planeta: esfera tapadera (oculta lo de detrás) + puntos ----------
  // cara del planeta con un sombreado suave hacia el borde (volumen) en vez de un blanco plano
  const occl = new THREE.Mesh(new THREE.SphereGeometry(R * .995, 96, 96), new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = clamp(dot(vN, vV), 0., 1.); vec3 c = mix(vec3(.86,.89,.98), vec3(.975,.98,1.), pow(f, .7)); gl_FragColor = vec4(c, 1.); }`
  }));
  planet.add(occl);
  // borde atmosférico (fresnel)
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 96, 96), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(mix(vec3(.36,.55,1.),vec3(.55,.49,1.), f), f*.75); }`
  }));
  planet.add(atm);

  const DOTS = 14000;
  const dPos = new Float32Array(DOTS * 3), dSize = new Float32Array(DOTS), dCol = new Float32Array(DOTS * 3), dDir = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < DOTS; i++) {
    const y = 1 - (i / (DOTS - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    const v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r); dDir.push(v);
    dPos[i * 3] = v.x * R; dPos[i * 3 + 1] = v.y * R; dPos[i * 3 + 2] = v.z * R;
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('aSize', new THREE.BufferAttribute(dSize, 1));
  dGeo.setAttribute('aColor', new THREE.BufferAttribute(dCol, 3));
  const dMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uScale: { value: 1 } },
    vertexShader: `attribute float aSize; attribute vec3 aColor; varying vec3 vC; varying float vA; uniform float uScale;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vec3 n = normalize(normalMatrix*normalize(position)); vA = smoothstep(.0,.35,dot(n, normalize(-mv.xyz)));
        gl_PointSize = aSize*uScale*(10./-mv.z); gl_Position = projectionMatrix*mv; vC = aColor; }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord-.5); gl_FragColor = vec4(vC, smoothstep(.5,.3,d)*vA); }`
  });
  planet.add(new THREE.Points(dGeo, dMat));

  // ---------- arcos (automatizaciones) ----------
  const randDir = () => { // puntos de la cara visible (arriba)
    const a = Math.random() * Math.PI * 2, el = .55 + Math.random() * .4;
    return new THREE.Vector3(Math.cos(a) * Math.sqrt(1 - el * el), el, Math.sin(a) * Math.sqrt(1 - el * el)).normalize();
  };
  const arcs = [];
  const PAL = [0x2F62E0, 0x5B8CFF, 0x8B7CFF, 0x4C7DFF];
  const glowTex = radial([[0, 'rgba(255,255,255,1)'], [.25, 'rgba(140,165,255,.9)'], [1, 'rgba(91,140,255,0)']], 64);
  const makeArc = (a, b, life = 0) => {
    const A = a.clone().multiplyScalar(R), B = b.clone().multiplyScalar(R);
    const ang = a.angleTo(b), mid = a.clone().add(b).normalize().multiplyScalar(R * (1 + .18 + ang * .25));
    const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
    const pts = curve.getPoints(80);
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const color = PAL[(Math.random() * PAL.length) | 0];
    const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }));
    planet.add(line);
    const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false })); head.scale.setScalar(.38); planet.add(head);
    const ends = [A, B].map(p => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, opacity: 0 })); s.position.copy(p); s.scale.setScalar(.3); planet.add(s); return s; });
    const arc = { curve, line, head, ends, born: performance.now() / 1000, dur: 2.2 + Math.random() * 1.6, life: life || (5 + Math.random() * 5) };
    arcs.push(arc); return arc;
  };
  const killArc = arc => { [arc.line, arc.head, ...arc.ends].forEach(o => { planet.remove(o); o.geometry && o.geometry.dispose(); o.material.dispose(); }); };
  for (let i = 0; i < 12; i++) { const a = makeArc(randDir(), randDir()); a.born -= Math.random() * a.life; }

  // ---------- ratón ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), inv = new THREE.Matrix4();
  let hitDir = null, lastMove = -1e9;
  const aim = (cx, cy) => {
    const r = canvas.getBoundingClientRect();
    ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1));
    ray.setFromCamera(ndc, cam);
    const h = ray.intersectObject(occl)[0];
    if (h) { inv.copy(planet.matrixWorld).invert(); hitDir = h.point.clone().applyMatrix4(inv).normalize(); } else hitDir = null;
  };
  canvas.addEventListener('pointermove', e => { aim(e.clientX, e.clientY); lastMove = performance.now(); root.classList.add('is-touched'); }, { passive: true });
  canvas.addEventListener('pointerleave', () => { hitDir = null; });
  canvas.addEventListener('pointerdown', e => {
    aim(e.clientX, e.clientY);
    const from = hitDir ? hitDir.clone() : randDir();
    for (let k = 0; k < 3; k++) { const a = makeArc(from, randDir(), 4 + k); a.dur = 1.2 + k * .35; }
  });

  let lastW = 0, lastH = 0;
  const resize = () => sizeTo(canvas.clientWidth, canvas.clientHeight);
  const sizeTo = (w, h) => {
    if (!w || !h) return;
    if (w === lastW && h === lastH) return;   // cambiar el tamaño borra el lienzo: solo si cambia de verdad
    lastW = w; lastH = h;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    dMat.uniforms.uScale.value = h * DPR / 440;
    camZ = w < 700 ? 15 : 11.5;
  };
  let camZ = 11.5;
  new ResizeObserver(resize).observe(canvas); resize();


  const C_DOT = new THREE.Color('#A8B9E6'), C_INK = new THREE.Color('#4F74E0'), C_HOT = new THREE.Color('#2F62E0'), C_VIO = new THREE.Color('#8B7CFF'), tmp = new THREE.Color();
  const autoDir = new THREE.Vector3();
  const t0 = performance.now();
  let spin = 0;
  // la intro de la home llama a esto para que la transición acabe en este mismo planeta (sin corte)
  const viz = root.querySelector('.hx__viz');
  let intro = null, introFade = 1, introInk = 0;
  const bgEl = root.querySelector('.hx__bg');
  window.aldiaHeroIntro = (done, dur = 2600) => {
    scrollTo(0, 0);
    const rect = viz.getBoundingClientRect();
    viz.classList.add('is-intro');
    // la sección de la portada pasa por encima de la intro (fondo transparente) y el lienzo ocupa la pantalla
    root.classList.add('is-intro-host');
    Object.assign(viz.style, { position: 'fixed', left: '0px', top: '0px', width: innerWidth + 'px', height: innerHeight + 'px', zIndex: 5, margin: '0', maxWidth: 'none', minHeight: '0' });
    intro = { t0: performance.now(), dur, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }, done };
    visible = true;
  };

  const frame = now => {
    requestAnimationFrame(frame);
    if ((!visible && !intro) || document.hidden) return;
    const t = (now - t0) / 1000;
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;

    if (intro) {
      // salida de la intro: la cámara baja de un vuelo rasante sobre el horizonte a su posición normal
      const k = Math.min((now - intro.t0) / intro.dur, 1), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const top = planet.position.y + R;
      // órbita: desde arriba (el planeta visto desde el espacio, un círculo limpio de puntos) hasta la cámara
      // normal de la portada (ratón y scroll incluidos) para que el relevo no salte
      const C = planet.position, F = new THREE.Vector3(mx * .8, 1.1 - my * .3, camZ), L = new THREE.Vector3(0, -.15 + scrollP * 1.2, 0);
      const d0 = new THREE.Vector3(0, 1, .02).normalize(), d1 = F.clone().sub(C), r1 = d1.length(); d1.normalize();
      // distancia para que la bola entera quepa en pantalla con margen (campo vertical de 32°)
      const r0 = R / Math.sin((cam.fov * Math.PI / 180) / 2 * .82);
      const dir = new THREE.Vector3().copy(d0).lerp(d1, e).normalize();   // arco sobre la esfera
      cam.position.copy(C).addScaledVector(dir, r0 + (r1 - r0) * e);
      cam.up.set(0, 0, -1).lerp(new THREE.Vector3(0, 1, 0), Math.min(e * 1.6, 1)).normalize();
      cam.lookAt(new THREE.Vector3().copy(C).lerp(L, e));
      introFade = Math.max(0, (e - .55) / .45);
      introInk = 1 - e;
      // el lienzo pasa de pantalla completa a su hueco en la página
      const r = intro.rect, f = 1 - e;
      // tamaño calculado (sin medir la página: medirla en cada fotograma la ralentiza)
      const vw = Math.round(r.width + (innerWidth - r.width) * f), vh = Math.round(r.height + (innerHeight - r.height) * f);
      Object.assign(viz.style, { left: (r.left * e) + 'px', top: (r.top * e) + 'px', width: vw + 'px', height: vh + 'px' });
      sizeTo(vw, vh);   // ajustar antes de dibujar este fotograma
      if (bgEl) bgEl.style.opacity = e.toFixed(3);   // el fondo de la portada entra a la vez que la transición
      canvas.style.setProperty('--mk', (24 * e).toFixed(2) + '%'); canvas.style.setProperty('--ms', (9 * e).toFixed(2) + '%');
      if (k >= 1) { const cb = intro.done; intro = null; cam.up.set(0, 1, 0); introFade = 1; introInk = 0; sizeTo(Math.round(r.width), Math.round(r.height)); ['position', 'left', 'top', 'width', 'height', 'zIndex', 'margin', 'maxWidth', 'minHeight'].forEach(x => viz.style[x] = ''); canvas.style.removeProperty('--mk'); canvas.style.removeProperty('--ms'); if (bgEl) bgEl.style.opacity = ''; viz.classList.remove('is-intro'); root.classList.remove('is-intro-host'); cb && cb(); }
    } else {
      cam.position.set(mx * .8, 1.1 - my * .3, camZ);
      cam.lookAt(0, -.15 + scrollP * 1.2, 0);
    }

    // planeta: gira despacio, se inclina con el ratón y sube con el scroll
    spin += .0012 + scrollP * .004;
    planet.rotation.set(.18 + my * .06, spin + mx * .25, mx * -.04);
    planet.position.y = -R + .5 + scrollP * 2.2;
    planet.updateMatrixWorld();

    // sol: sube con el scroll y sigue un poco al ratón
    sun.position.set(mx * 1.6, .1 + scrollP * 3.2 + Math.sin(t * .6) * .05, -9);
    sun.material.opacity = .9 + Math.sin(t * 1.3) * .08;
    rays.position.set(mx * 1.1, -.4 + scrollP * 2.6, -10);

    // puntos encendidos alrededor del cursor (o de un punto que pasea solo)
    const idle = now - lastMove > 2500 || !hitDir;
    let focus = hitDir;
    if (idle) { const a = t * .25; autoDir.set(Math.cos(a) * .55, .78, Math.sin(a) * .55).normalize(); focus = autoDir; }
    for (let i = 0; i < DOTS; i++) {
      const d = dDir[i];
      const near = Math.max(0, d.dot(focus) - .955) / .045;     // 0..1 dentro de ~17°
      const e = near * near * (idle ? .6 : 1);
      tmp.copy(C_DOT).lerp(C_INK, introInk).lerp(C_HOT, e).lerp(C_VIO, e * .35 * (1 + Math.sin(t * 3 + i) * .5));
      dCol[i * 3] = tmp.r; dCol[i * 3 + 1] = tmp.g; dCol[i * 3 + 2] = tmp.b;
      dSize[i] = (1.3 + e * 2.4) * (1 + introInk * .55);
    }
    dGeo.attributes.aColor.needsUpdate = true; dGeo.attributes.aSize.needsUpdate = true;

    // arcos: se dibujan, el paquete los recorre en bucle, y se desvanecen
    const ts = now / 1000;
    for (let k = arcs.length - 1; k >= 0; k--) {
      const a = arcs[k], age = ts - a.born;
      if (age > a.life) { killArc(a); arcs.splice(k, 1); if (arcs.length < 12) makeArc(randDir(), randDir()); continue; }
      const fadeIn = Math.min(age / .6, 1), fadeOut = Math.min((a.life - age) / .8, 1), vis = Math.min(fadeIn, fadeOut);
      const drawn = Math.min(age / .9, 1);
      a.line.geometry.setDrawRange(0, Math.floor(81 * drawn));
      a.line.material.opacity = .55 * vis * (intro ? .4 + .6 * introFade : 1);
      const p = (age % a.dur) / a.dur;
      a.head.position.copy(a.curve.getPoint(p)); a.head.material.opacity = vis * (drawn >= 1 ? 1 : 0) * introFade;
      a.ends.forEach((s, j) => { s.material.opacity = vis * (j === 0 ? 1 : drawn) * .9 * introFade; s.scale.setScalar(.26 + (j === 1 && p > .9 ? (p - .9) * 4 : 0)); });
    }

    renderer.render(scene, cam);
    copy.style.transform = innerWidth > 1024 ? `translate3d(0, ${scrollP * 60}px, 0)` : '';
  };
  requestAnimationFrame(frame);
})();
