/* Intro de la home. Se ve una vez por sesión (?intro=1 la fuerza). Saltar, Esc o el final del vídeo → salida animada. */
(function () {
  const root = document.documentElement;
  const box = document.getElementById('intro');
  if (!box || !root.classList.contains('intro-on')) { if (box) box.remove(); return; }
  const v = box.querySelector('.intro__v'), snd = box.querySelector('.intro__snd'), skip = box.querySelector('.intro__skip');
  const time = box.querySelector('.intro__time'), fg = box.querySelector('.ring .fg'), circle = box.querySelector('.intro__circle');
  const L = 2 * Math.PI * 30; fg.style.strokeDasharray = L; fg.style.strokeDashoffset = L;

  // resolución según pantalla
  const w = Math.max(screen.width, screen.height) * Math.min(window.devicePixelRatio || 1, 2);
  const q = w > 2600 ? '4k' : w > 1400 ? '1440' : '720';
  v.src = `./assets/videos/intro-${q}.mp4?v=1118c`;

  const fmt = (s) => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  let done = false, raf;
  const tick = () => {
    if (v.duration) { const p = v.currentTime / v.duration; fg.style.strokeDashoffset = L * (1 - p); time.textContent = fmt(v.duration - v.currentTime); }
    raf = requestAnimationFrame(tick);
  };

  function leave() {
    if (done) return; done = true;
    try { sessionStorage.setItem('aldia-intro', '1'); } catch (e) {}
    cancelAnimationFrame(raf);
    // fundido del sonido para que no corte en seco
    if (!v.muted) { const f = setInterval(() => { v.volume = Math.max(0, v.volume - .08); if (v.volume <= 0) clearInterval(f); }, 40); }
    const r = Math.hypot(innerWidth / 2, innerHeight) * 2.1; box.style.setProperty('--k', (r / 10).toFixed(1));
    box.classList.add('is-out');
    setTimeout(() => {
      root.classList.add('intro-enter'); root.classList.remove('intro-on');
      box.classList.add('is-gone');
      setTimeout(() => { v.pause(); box.remove(); }, 900);
      setTimeout(() => root.classList.remove('intro-enter'), 2400);
    }, 820);
  }

  snd.addEventListener('click', () => {
    v.muted = !v.muted; if (!v.muted) v.volume = 1;
    snd.setAttribute('aria-pressed', String(!v.muted));
    snd.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Quitar sonido');
  });
  skip.addEventListener('click', leave);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') leave(); });
  v.addEventListener('ended', leave);
  v.addEventListener('error', leave);
  v.addEventListener('playing', () => { box.classList.add('is-ready'); tick(); }, { once: true });
  // si el navegador no deja reproducir (ahorro de energía…), no bloqueamos la web
  const pr = v.play(); if (pr && pr.catch) pr.catch(leave);
  setTimeout(() => { if (!box.classList.contains('is-ready')) leave(); }, 9000);
  snd.focus({ preventScroll: true });
})();
