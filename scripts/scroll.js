/* ALDIA — «Lo que construimos»: se elige un ejemplo pulsándolo y, al acabar su vídeo, pasa solo al siguiente
   (después del último vuelve al primero). La barra lateral marca por dónde va la serie. */
(function () {
  const sc = document.querySelector('[data-sc]'); if (!sc) return;
  const items = [...sc.querySelectorAll('.sc__it')], media = [...sc.querySelectorAll('.sc__m')];
  const vids = media.map(m => m.querySelector('video'));
  const bar = sc.querySelector('[data-sc-bar]');
  const N = items.length;
  const mobile = () => matchMedia('(max-width: 900px)').matches;
  let cur = -1, onScreen = false, raf;

  const load = v => {
    if (!v || v.dataset.loaded) return;
    const big = Math.max(screen.width, screen.height) * (devicePixelRatio || 1) >= 2560;
    v.src = (big && v.dataset.src4k) || v.dataset.srcHd; v.dataset.loaded = 1;
  };
  const play = v => { if (v && onScreen && !mobile()) v.play().catch(() => {}); };

  const activate = i => {
    if (i === cur) return; cur = i;
    items.forEach((it, k) => it.classList.toggle('is-on', k === i));
    media.forEach((m, k) => {
      m.classList.toggle('is-on', k === i);
      // el que entra se endereza; los demás esperan arriba o abajo con una leve perspectiva
      const d = k === i ? 0 : (k < i ? -1 : 1);
      m.style.transform = d ? `perspective(1600px) translateY(${d * 60}px) rotateX(${d * 10}deg) scale(.94)` : 'none';
    });
    vids.forEach((v, k) => {
      if (k === i) { load(v); try { v.currentTime = 0; } catch (e) {} play(v); }
      else v.pause();
    });
    load(vids[(i + 1) % N]);
  };

  // barra: avance de la serie completa (ejemplo actual + lo que lleva su vídeo)
  const tick = () => {
    const v = vids[cur], f = v && v.duration ? Math.min(1, v.currentTime / v.duration) : 0;
    bar.style.transform = `scaleY(${((cur + f) / N).toFixed(4)})`;
    raf = requestAnimationFrame(tick);
  };

  vids.forEach((v, k) => {
    if (!v) return;
    v.addEventListener('ended', () => { if (!mobile() && k === cur) activate((cur + 1) % N); });
  });
  const setLoop = () => vids.forEach(v => { if (v) v.loop = mobile(); });   // en escritorio no se repite: avanza

  items.forEach((it, k) => it.addEventListener('click', e => {
    if (e.target.closest('a') || mobile()) return;
    if (k === cur) { const v = vids[k]; try { v.currentTime = 0; } catch (er) {} play(v); return; }
    activate(k);
  }));

  // sólo se reproduce cuando la sección está a la vista
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (mobile()) return;
    if (onScreen) { play(vids[cur]); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    else { vids.forEach(v => v && v.pause()); cancelAnimationFrame(raf); }
  }, { threshold: .35 }).observe(sc);

  // móvil: cada ejemplo se reproduce al verse, en bucle
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!mobile()) return;
    const v = e.target.querySelector('video');
    if (e.isIntersecting) { load(v); v.play().catch(() => {}); } else v.pause();
  }), { threshold: .5 });
  media.forEach(m => io.observe(m));

  addEventListener('resize', setLoop);
  setLoop(); activate(0);
})();
