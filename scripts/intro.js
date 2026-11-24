/* Intro de la home. Se ve una vez por sesión (?intro=1 la fuerza). Saltar, Esc o el final del vídeo → salida.
   Salida limpia: el vídeo se encoge como una tarjeta y se funde; la cámara se desliza sobre el horizonte de un
   planeta de puntos, se aleja y el planeta baja a su sitio en la portada mientras entra la web. */
(function () {
  const root = document.documentElement;
  const box = document.getElementById('intro');
  if (!box || !root.classList.contains('intro-on')) { if (box) box.remove(); return; }
  const v = box.querySelector('.intro__v'), snd = box.querySelector('.intro__snd'), skip = box.querySelector('.intro__skip');
  const time = box.querySelector('.intro__time'), fg = box.querySelector('.ring .fg');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // bloquear el scroll mientras dura la intro (la barra se ve pero no se mueve)
  const block = e => { if (root.classList.contains('intro-on')) e.preventDefault(); };
  const keys = e => { if (root.classList.contains('intro-on') && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) e.preventDefault(); };
  addEventListener('wheel', block, { passive: false }); addEventListener('touchmove', block, { passive: false }); addEventListener('keydown', keys);

  const w = Math.max(screen.width, screen.height) * Math.min(window.devicePixelRatio || 1, 2);
  const q = w > 2600 ? '4k' : w > 1400 ? '1440' : '720';
  v.src = `./assets/videos/intro-${q}.mp4?v=1123b`;

  // contador: segundos que quedan, con un pequeño deslizamiento cada vez que cambia
  const num = time.querySelector('[data-it]');
  let lastSec = -1;
  const showSec = (sec) => {
    sec = Math.max(0, Math.ceil(sec)); if (sec === lastSec) return; lastSec = sec;
    num.textContent = sec; num.classList.remove('is-tick'); void num.offsetWidth; num.classList.add('is-tick');
  };
  let done = false, raf;
  const tick = () => {
    if (v.duration) { const p = Math.min(1, v.currentTime / v.duration); fg.style.strokeDashoffset = (100 * (1 - p)).toFixed(2); fg.classList.toggle('on', p > .004); showSec(v.duration - v.currentTime); }
    raf = requestAnimationFrame(tick);
  };

  // entra la web y se va la intro
  function enter() {
    root.classList.add('intro-enter'); root.classList.remove('intro-on');
    box.classList.add('is-gone');
    setTimeout(() => { v.pause(); box.remove(); }, 900);
    setTimeout(() => root.classList.remove('intro-enter'), 2600);
  }

  function leave() {
    if (done) return; done = true;
    try { sessionStorage.setItem('aldia-intro', '1'); } catch (e) {}
    cancelAnimationFrame(raf);
    box.classList.add('is-fly');
    if (reduce || !window.THREE) { setTimeout(enter, 450); return; }
    if (window.aldiaHeroIntro) {
      // el planeta real de la portada hace la transición: ocupa la pantalla y se coloca en su sitio
      setTimeout(() => { try { window.aldiaHeroIntro(null, 2700); } catch (e) {} }, 420);
      setTimeout(enter, 1700);
      return;
    }
    try { flyOut(enter); } catch (e) { setTimeout(enter, 450); }
  }

  // ---------- vuelo de cámara sobre el planeta de puntos ----------
  function flyOut(onSettle) {
    const THREE = window.THREE;
    const W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio, 2);
    const cv = document.createElement('canvas'); cv.className = 'intro__fly'; box.appendChild(cv);
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
    const radial = (stops, size = 256) => { const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
      const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, size, size); return new THREE.CanvasTexture(c); };
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const lerp = (a, b, t) => a + (b - a) * t, clamp = x => Math.min(Math.max(x, 0), 1);
    const seg = (ms, a, b) => clamp((ms - a) / (b - a));

    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, .05, 300);
    const R = 7.2, planet = new THREE.Group(); scene.add(planet);
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [.14, 'rgba(214,224,255,.9)'], [.4, 'rgba(139,124,255,.28)'], [.7, 'rgba(91,140,255,.08)'], [1, 'rgba(91,140,255,0)']]), transparent: true, depthWrite: false }));
    sun.scale.set(16, 16, 1); scene.add(sun);
    planet.add(new THREE.Mesh(new THREE.SphereGeometry(R * .995, 96, 96), new THREE.MeshBasicMaterial({ color: 0xF8FAFF })));
    const N = 26000, pos = new Float32Array(N * 3), gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = gold * i; pos[i * 3] = Math.cos(th) * r * R; pos[i * 3 + 1] = y * R; pos[i * 3 + 2] = Math.sin(th) * r * R; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uS: { value: H * DPR / 440 } },
      vertexShader: `uniform float uS; varying float vA;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vec3 n = normalize(normalMatrix*normalize(position));
          vA = smoothstep(0.,.4,dot(n, normalize(-mv.xyz))); gl_PointSize = 1.25*uS*(10./-mv.z); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord-.5); gl_FragColor = vec4(.62,.70,.9, smoothstep(.5,.3,d)*vA*.9); }`
    });
    planet.add(new THREE.Points(g, mat));
    planet.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.03, 96, 96), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide,
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.6); gl_FragColor = vec4(mix(vec3(.42,.6,1.),vec3(.58,.52,1.), f), f*.55); }`
    })));
    // pocos arcos, finos
    const arcs = [];
    const dirAt = (lon, lat) => new THREE.Vector3(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
    for (let i = 0; i < 7; i++) {
      const a = dirAt((Math.random() - .5) * 1.4, .35 + Math.random() * .8), b = dirAt((Math.random() - .5) * 1.4, .35 + Math.random() * .8);
      const A = a.clone().multiplyScalar(R), B = b.clone().multiplyScalar(R), M = a.clone().add(b).normalize().multiplyScalar(R * (1.18 + a.angleTo(b) * .25));
      const curve = new THREE.QuadraticBezierCurve3(A, M, B);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(90)), new THREE.LineBasicMaterial({ color: [0x2F62E0, 0x5B8CFF, 0x8B7CFF][i % 3], transparent: true, opacity: .55 }));
      line.geometry.setDrawRange(0, 0); planet.add(line);
      arcs.push({ line, start: 900 + i * 140 });
    }

    const viz = document.querySelector('.hx__viz');
    const vr = viz ? viz.getBoundingClientRect() : { top: H * .55, height: H * .45 };
    const targetHorizon = Math.min(H * .92, vr.top + vr.height * .34);

    const T = 3400, t0 = performance.now(), look = new THREE.Vector3(), far = new THREE.Vector3(0, 1.6, 23);
    let settled = false;
    cv.style.opacity = '0';
    const frame = now => {
      const ms = now - t0;
      cv.style.opacity = String(ms < T - 650 ? seg(ms, 150, 650) : 1 - seg(ms, T - 650, T + 150));
      const a = ease(seg(ms, 0, 1700)), b = ease(seg(ms, 1200, 2700));
      planet.rotation.set(-.12 - ms / 9000, ms / 14000, 0);
      cam.position.set(0, lerp(lerp(R + 1.1, R + .55, a), far.y, b), lerp(lerp(5.5, 2.6, a), far.z, b));
      look.set(0, lerp(R + .3, 0, b), lerp(-8, 0, b)); cam.lookAt(look);
      const drop = ease(seg(ms, 1900, 2900));
      const topNdc = 1 - 2 * (targetHorizon / H), vFov = cam.fov * Math.PI / 180;
      planet.position.y = lerp(0, Math.tan(vFov / 2) * far.z * topNdc - R, drop);
      const rise = easeOut(seg(ms, 100, 1800));
      sun.position.set(0, lerp(lerp(R - .4, R + .9, rise), planet.position.y + R * .95, b), lerp(-16, -13, b));
      sun.material.opacity = .35 + .55 * rise;
      arcs.forEach(ar => ar.line.geometry.setDrawRange(0, Math.floor(91 * easeOut(seg(ms, ar.start, ar.start + 900)))));
      renderer.render(scene, cam);
      if (!settled && ms > 2450) { settled = true; onSettle(); }
      if (ms < T + 200) requestAnimationFrame(frame); else { renderer.dispose(); g.dispose(); }
    };
    requestAnimationFrame(frame);
  }

  snd.addEventListener('click', leave);
  skip.addEventListener('click', leave);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') leave(); });
  v.addEventListener('ended', leave);
  v.addEventListener('error', leave);
  v.addEventListener('playing', () => { box.classList.add('is-ready'); tick(); }, { once: true });
  const pr = v.play(); if (pr && pr.catch) pr.catch(leave);
  setTimeout(() => { if (!box.classList.contains('is-ready')) leave(); }, 9000);
})();
