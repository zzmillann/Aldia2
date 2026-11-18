/* ALDIA — «¿Cuánto podría ganar tu idea?»: tres preguntas y barras 3D (three.js) */
(function () {
  const box = document.querySelector('[data-sim2]'); if (!box || !window.THREE) return;
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const S = { price: 39, new: 20, churn: 3, h: 12 };
  const PRE = { slow: { price: 29, new: 8, churn: 5 }, base: { price: 39, new: 20, churn: 3 }, fast: { price: 49, new: 45, churn: 2 } };
  const MON = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const q = s => box.querySelector(s), qa = s => [...box.querySelectorAll(s)];

  function model() {
    let subs = 0, total = 0; const out = [];
    for (let m = 1; m <= S.h; m++) {
      subs = subs * (1 - S.churn / 100) + S.new;
      const mrr = subs * S.price; total += mrr; out.push({ m, subs, mrr });
    }
    return { out, subs, mrr: subs * S.price, total };
  }

  /* ---------- escena 3D ---------- */
  const wrap = q('[data-3d]'), cv = q('[data-cv]'), lb = q('[data-lb]'), tip = q('[data-tip]');
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 2, .1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe7ff, .95));
  const key = new THREE.DirectionalLight(0xffffff, .9); key.position.set(-8, 16, 10); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -22, right: 22, top: 14, bottom: -14 }); key.shadow.radius = 6; scene.add(key);
  const rim = new THREE.DirectionalLight(0x9db8ff, .5); rim.position.set(10, 6, -10); scene.add(rim);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.ShadowMaterial({ opacity: .12 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const N = 36, GAP = 1.25, bars = [], group = new THREE.Group(); scene.add(group);
  const geo = new THREE.BoxGeometry(.82, 1, .82); geo.translate(0, .5, 0);
  const cA = new THREE.Color('#2F62E0'), cB = new THREE.Color('#9DB8FF');
  for (let i = 0; i < N; i++) {
    const mat = new THREE.MeshPhysicalMaterial({ color: cB.clone(), roughness: .28, metalness: .05, clearcoat: .6, clearcoatRoughness: .25, transparent: true, opacity: 1 });
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.scale.y = .001; m.userData = { h: .001, t: .001, i, show: 0, st: 0 };
    group.add(m); bars.push(m);
    const el = document.createElement('span'); lb.appendChild(el); m.userData.lb = el;
  }
  // tapa luminosa en la barra del último mes
  const cap = new THREE.Mesh(new THREE.BoxGeometry(.86, .06, .86), new THREE.MeshBasicMaterial({ color: 0xffffff })); scene.add(cap);

  let data = model(), mx = 1, hover = -1, t0 = performance.now(), vis = false;
  function layout() {
    const n = S.h, width = (n - 1) * GAP;
    mx = Math.max(...data.out.map(d => d.mrr), 1);
    bars.forEach((b, i) => {
      const on = i < n; b.userData.show = on ? 1 : 0;
      b.position.x = i * GAP - width / 2; b.position.z = 0;
      b.userData.t = on ? Math.max(.05, data.out[i].mrr / mx * 9) : .001;
      const k = on ? i / Math.max(1, n - 1) : 0; b.material.color.copy(cB).lerp(cA, k);
      b.userData.lb.textContent = on ? (n <= 12 ? MON[i] : (i % 3 === 2 ? 'M' + (i + 1) : '')) : '';
    });
    const span = width + 4;
    cam.position.set(-span * .18, span * .42 + 4, span * .95 + 6); cam.lookAt(0, 3.2, 0);
  }
  function size() { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(wrap); size();

  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  wrap.addEventListener('pointermove', e => { const r = wrap.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(mouse, cam); const hit = ray.intersectObjects(bars.filter(b => b.userData.show))[0]; hover = hit ? hit.object.userData.i : -1; });
  wrap.addEventListener('pointerleave', () => hover = -1);
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) t0 = performance.now(); }, { threshold: .2 }).observe(wrap);

  const v = new THREE.Vector3();
  function loop(now) {
    requestAnimationFrame(loop);
    if (!vis) return;
    const el = (now - t0) / 1000;
    bars.forEach((b, i) => {
      const u = b.userData, delay = Math.max(0, Math.min(1, (el - i * .035) / .6));
      u.h += (u.t * delay - u.h) * .12; b.scale.y = Math.max(.001, u.h);
      b.visible = u.show > 0 || u.h > .01;
      const hv = i === hover; b.material.emissive = b.material.emissive || new THREE.Color(); b.material.emissive.setRGB(hv ? .12 : 0, hv ? .16 : 0, hv ? .35 : 0);
      v.set(b.position.x, -.2, .6).project(cam);
      u.lb.style.transform = `translate(${(v.x * .5 + .5) * wrap.clientWidth}px, ${(-v.y * .5 + .5) * wrap.clientHeight}px)`;
    });
    const last = bars[S.h - 1]; cap.position.set(last.position.x, last.scale.y + .03, 0); cap.visible = last.scale.y > .2;
    group.rotation.y = Math.sin(now / 4000) * .06;
    cap.rotation.y = group.rotation.y; cap.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), group.rotation.y);
    if (hover >= 0) {
      const b = bars[hover], d = data.out[hover]; v.set(b.position.x, b.scale.y + .6, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), group.rotation.y).project(cam);
      tip.style.opacity = 1; tip.style.transform = `translate(${(v.x * .5 + .5) * wrap.clientWidth}px, ${(-v.y * .5 + .5) * wrap.clientHeight}px) translate(-50%, -110%)`;
      tip.innerHTML = `<small>Mes ${d.m}</small><b>${fmt(d.mrr)} €/mes</b><span>${fmt(d.subs)} clientes</span>`;
    } else tip.style.opacity = 0;
    renderer.render(scene, cam);
  }
  requestAnimationFrame(loop);

  /* ---------- controles ---------- */
  function paint() {
    data = model();
    q('[data-o="when"]').textContent = { 12: 'En 1 año', 24: 'En 2 años', 36: 'En 3 años' }[S.h];
    q('[data-o="subs"]').textContent = fmt(data.subs);
    q('[data-o="mrr"]').textContent = fmt(data.mrr);
    q('[data-o="arr"]').textContent = fmt(data.mrr * 12);
    q('[data-o="total"]').textContent = fmt(data.total);
    ['price', 'new', 'churn'].forEach(k => { q(`[data-o="${k}"]`).textContent = String(S[k]).replace('.', ','); const r = q(`input[data-k="${k}"]`); r.value = S[k]; r.style.setProperty('--p', (S[k] - r.min) / (r.max - r.min) * 100 + '%'); });
    layout();
    const big = q('[data-o="mrr"]'); big.classList.remove('bump'); void big.offsetWidth; big.classList.add('bump');
  }
  qa('input[data-k]').forEach(r => r.addEventListener('input', () => { S[r.dataset.k] = +r.value; qa('[data-p]').forEach(b => b.classList.remove('is-on')); paint(); }));
  qa('[data-p]').forEach(b => b.addEventListener('click', () => { Object.assign(S, PRE[b.dataset.p]); qa('[data-p]').forEach(x => x.classList.toggle('is-on', x === b)); t0 = performance.now(); bars.forEach(x => x.userData.h = .001); paint(); }));
  qa('[data-h]').forEach(b => b.addEventListener('click', () => { S.h = +b.dataset.h; qa('[data-h]').forEach(x => x.classList.toggle('is-on', x === b)); paint(); }));
  paint();
})();
