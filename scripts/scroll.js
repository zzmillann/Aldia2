/* ALDIA — «Lo que construimos»: escena fija que avanza con el scroll */
(function () {
  const sc = document.querySelector('[data-sc]'); if (!sc) return;
  const items = [...sc.querySelectorAll('.sc__it')], media = [...sc.querySelectorAll('.sc__m')];
  const vids = media.map(m => m.querySelector('video'));
  const bar = sc.querySelector('[data-sc-bar]');
  const N = items.length;
  const mobile = () => matchMedia('(max-width: 900px)').matches;
  let cur = -1, onScreen = false;

  const load = v => {
    if (!v || v.dataset.loaded) return;
    const big = Math.max(screen.width, screen.height) * (devicePixelRatio || 1) >= 2560;
    v.src = (big && v.dataset.src4k) || v.dataset.srcHd; v.dataset.loaded = 1;
  };
  const activate = i => {
    if (i === cur) return; cur = i;
    items.forEach((it, k) => it.classList.toggle('is-on', k === i));
    media.forEach((m, k) => m.classList.toggle('is-on', k === i));
    vids.forEach((v, k) => {
      if (k === i) { load(v); try { v.currentTime = 0; } catch (e) {} if (onScreen) v.play().catch(() => {}); }
      else v.pause();
    });
    load(vids[(i + 1) % N]);
  };

  const onScroll = () => {
    if (mobile()) return;
    const r = sc.getBoundingClientRect(), total = sc.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    onScreen = r.top < innerHeight && r.bottom > 0;
    const f = p * N, i = Math.min(N - 1, Math.floor(f)), sub = f - i;
    activate(i);
    bar.style.transform = `scaleY(${p})`;
    // entrada de cada ejemplo: se endereza desde una leve perspectiva
    media.forEach((m, k) => {
      const d = k - f + .5;                    // 0 = centrado en su tramo
      const rot = Math.max(-10, Math.min(10, d * 10));
      const y = Math.max(-60, Math.min(60, d * 60));
      m.style.transform = `perspective(1600px) translateY(${y}px) rotateX(${rot}deg) scale(${k === i ? 1 : .94})`;
    });
    if (!onScreen) vids.forEach(v => v.pause()); else if (vids[cur] && vids[cur].paused && vids[cur].dataset.loaded) vids[cur].play().catch(() => {});
  };

  // móvil: cada ejemplo se reproduce al verse
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!mobile()) return;
    const v = e.target.querySelector('video');
    if (e.isIntersecting) { load(v); v.play().catch(() => {}); } else v.pause();
  }), { threshold: .5 });
  media.forEach(m => io.observe(m));

  items.forEach((it, k) => it.addEventListener('click', e => {
    if (e.target.closest('a') || mobile()) return;
    const total = sc.offsetHeight - innerHeight;
    scrollTo({ top: sc.offsetTop + total * (k + .5) / N, behavior: 'smooth' });
  }));
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
  activate(0); onScroll();
})();
