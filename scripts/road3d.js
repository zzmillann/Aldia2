/* ALDIA — «De la idea a cobrar»: camino 3D que se recorre con el scroll (three.js) */
(function () {
  const rd = document.querySelector('[data-rd]'); if (!rd || !window.THREE) return;
  const cv = rd.querySelector('[data-rdcv]'), wrap = cv.parentElement;
  const phs = [...rd.querySelectorAll('.rd__ph')], dots = [...rd.querySelectorAll('.rd__dot')], N = phs.length;

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf7f9ff, 34, 95);
  const cam = new THREE.PerspectiveCamera(42, 1, .1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfdcff, .75));
  const dl = new THREE.DirectionalLight(0xffffff, .7); dl.position.set(5, 10, 8); scene.add(dl);

  // camino: curva suave que serpentea hacia el fondo
  const pts = [];
  for (let i = 0; i <= N * 4; i++) { const k = i / 4; pts.push(new THREE.Vector3(Math.sin(k * 1.25) * 4.2, Math.cos(k * .9) * 1.2 - k * .35, -k * 9)); }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, .16, 16, false), new THREE.MeshStandardMaterial({ color: 0xa9bdf0, roughness: .4 }));
  scene.add(tube);
  // tramo recorrido (brilla)
  const doneMat = new THREE.MeshBasicMaterial({ color: 0x2f62e0 });
  let doneMesh = null;
  const setDone = u => {
    if (doneMesh) { scene.remove(doneMesh); doneMesh.geometry.dispose(); }
    if (u < .002) return;
    const sub = new THREE.CatmullRomCurve3(curve.getSpacedPoints(300).slice(0, Math.max(2, Math.round(300 * u))));
    doneMesh = new THREE.Mesh(new THREE.TubeGeometry(sub, 200, .24, 16, false), doneMat); scene.add(doneMesh);
  };
  // hitos: esferas de cristal con anillo
  const node = [], uAt = i => (i * 4) / (N * 4) + .0001;
  for (let i = 0; i < N; i++) {
    const g = new THREE.Group(), p = curve.getPointAt(Math.min(1, uAt(i)));
    const sph = new THREE.Mesh(new THREE.SphereGeometry(.95, 48, 48), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .15, clearcoat: 1, metalness: 0, transmission: 0, emissive: 0x000000 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, .05, 16, 120), new THREE.MeshBasicMaterial({ color: 0x9db8ff, transparent: true, opacity: .6 }));
    g.add(sph, ring); g.position.copy(p); scene.add(g); node.push({ g, sph, ring });
  }
  // partículas suaves alrededor
  const pg = new THREE.BufferGeometry(), P = 900, arr = new Float32Array(P * 3);
  for (let i = 0; i < P; i++) { const p = curve.getPointAt(Math.random()); arr[i * 3] = p.x + (Math.random() - .5) * 14; arr[i * 3 + 1] = p.y + (Math.random() - .5) * 8; arr[i * 3 + 2] = p.z + (Math.random() - .5) * 10; }
  pg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const dotsP = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x7fa0ff, size: .06, transparent: true, opacity: .55 })); scene.add(dotsP);

  const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(wrap); size();

  let target = 0, cur = 0, active = -1, vis = false;
  const read = () => { const r = rd.getBoundingClientRect(), tot = r.height - innerHeight; target = Math.max(0, Math.min(1, -r.top / Math.max(1, tot))); };
  addEventListener('scroll', read, { passive: true }); read();
  new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(rd);
  dots.forEach((d, i) => d.addEventListener('click', () => { const r = rd.getBoundingClientRect(), tot = r.height - innerHeight; scrollTo({ top: scrollY + r.top + tot * (i / (N - 1)) * .999, behavior: 'smooth' }); }));

  const look = new THREE.Vector3(), pos = new THREE.Vector3(); let lastDone = -1;
  function loop(now) {
    requestAnimationFrame(loop);
    if (!vis) return;
    cur += (target - cur) * .08;
    const u = Math.min(.999, cur * ((N - 1) * 4) / (N * 4) + .0001);
    const p = curve.getPointAt(u), ahead = curve.getPointAt(Math.min(1, u + .14));
    pos.set(p.x + 8.5, p.y + 4.5, p.z + 3.5); cam.position.lerp(pos, .2); look.lerp(ahead, .2); cam.lookAt(look);
    const k = Math.round(cur * (N - 1));
    if (k !== active) { active = k; phs.forEach((e, i) => e.classList.toggle('is-on', i === k)); dots.forEach((e, i) => { e.classList.toggle('is-on', i === k); e.classList.toggle('is-done', i < k); }); }
    const dq = Math.round(u * 200) / 200; if (dq !== lastDone) { lastDone = dq; setDone(dq); }
    node.forEach((n, i) => {
      const on = i <= k, me = i === k, s = me ? 1.25 + Math.sin(now / 400) * .05 : on ? 1 : .8;
      n.g.scale.lerp(new THREE.Vector3(s, s, s), .1);
      n.sph.material.color.set(on ? 0x4f7dff : 0xc9d6ff); n.sph.material.emissive.set(me ? 0x1d3fb0 : 0x000000);
      n.ring.rotation.x = now / 1600 + i; n.ring.rotation.y = now / 2100; n.ring.material.opacity = me ? .9 : .35;
    });
    dotsP.rotation.z = Math.sin(now / 9000) * .03;
    renderer.render(scene, cam);
  }
  requestAnimationFrame(loop);
})();
