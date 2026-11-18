/* ALDIA — Selector de servicios de la home, al ritmo de los vídeos 4K */
(function () {
  const root = document.querySelector('[data-svx]'); if (!root) return;
  const tabs = [...root.querySelectorAll('.svx__tab')];
  const panes = [...root.querySelectorAll('.svx__pane')];
  const vids = panes.map(p => p.querySelector('video'));
  let i = 0, visible = false;

  const load = v => {
    if (!v || v.dataset.loaded) return;
    const big = Math.max(screen.width, screen.height) * (devicePixelRatio || 1) >= 2560;
    v.src = (big && v.dataset.src4k) || v.dataset.srcHd; v.dataset.loaded = 1;
  };

  const go = (n, play = true) => {
    i = (n + tabs.length) % tabs.length;
    tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.setAttribute('aria-selected', k === i); t.style.setProperty('--p', 0); });
    panes.forEach((p, k) => {
      p.classList.remove('is-active');
      if (k === i) { void p.offsetWidth; p.classList.add('is-active'); }
      if (k !== i && vids[k]) vids[k].pause();
    });
    const v = vids[i];
    if (v) {
      load(v);
      try { v.currentTime = 0; } catch (e) {}
      if (play && visible) v.play().catch(() => {});
    }
    // precarga la siguiente para que el cambio sea instantáneo
    const nx = vids[(i + 1) % vids.length]; if (nx && !nx.dataset.loaded) { load(nx); nx.preload = 'auto'; }
  };

  // progreso de la pestaña = progreso del vídeo; al terminar pasa a la siguiente
  vids.forEach((v, k) => {
    if (!v) return;
    v.addEventListener('timeupdate', () => { if (k === i && v.duration) tabs[i].style.setProperty('--p', v.currentTime / v.duration); });
    v.addEventListener('ended', () => { if (k === i) go(i + 1); });
  });
  // el SaaS 3D dura 6 s: que dé dos vueltas antes de pasar
  const saas = vids[4]; if (saas) { let laps = 0; saas.addEventListener('ended', () => {}); saas.addEventListener('play', () => { laps = 0; });
    saas.addEventListener('timeupdate', () => {}); saas.loop = false;
    saas.addEventListener('ended', e => { if (i === 4 && ++laps < 2) { e.stopImmediatePropagation(); saas.currentTime = 0; saas.play().catch(() => {}); } }, true); }

  tabs.forEach((t, k) => {
    t.addEventListener('click', () => go(k));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); tabs[i].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); tabs[i].focus(); }
    });
  });

  // solo reproduce cuando la sección está en pantalla
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    const v = vids[i];
    if (visible) { if (!v || !v.dataset.loaded) go(i); else v.play().catch(() => {}); }
    else if (v) v.pause();
  }, { threshold: .35 }).observe(root);

  go(0, false);
})();
