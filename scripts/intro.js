/* Intro de la home. Se ve una vez por sesión (?intro=1 la fuerza). Saltar, Esc o el final del vídeo → salida animada. */
(function () {
  const root = document.documentElement;
  const box = document.getElementById('intro');
  if (!box || !root.classList.contains('intro-on')) { if (box) box.remove(); return; }
  const v = box.querySelector('.intro__v'), snd = box.querySelector('.intro__snd'), skip = box.querySelector('.intro__skip');
  const time = box.querySelector('.intro__time'), fg = box.querySelector('.ring .fg'), circle = box.querySelector('.intro__circle');
  // el círculo .fg lleva pathLength="100": el progreso va de 100 (vacío) a 0 (lleno)

  // resolución según pantalla
  const w = Math.max(screen.width, screen.height) * Math.min(window.devicePixelRatio || 1, 2);
  const q = w > 2600 ? '4k' : w > 1400 ? '1440' : '720';
  v.src = `./assets/videos/intro-${q}.mp4?v=1123b`;

  const fmt = (s) => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  let done = false, raf;
  const tick = () => {
    if (v.duration) { const p = Math.min(1, v.currentTime / v.duration); fg.style.strokeDashoffset = (100 * (1 - p)).toFixed(2); fg.classList.toggle('on', p > .004); time.textContent = fmt(v.duration - v.currentTime); }
    raf = requestAnimationFrame(tick);
  };

  function leave() {
    if (done) return; done = true;
    try { sessionStorage.setItem('aldia-intro', '1'); } catch (e) {}
    cancelAnimationFrame(raf);
    const r = Math.hypot(innerWidth / 2, innerHeight) * 2.1; box.style.setProperty('--k', (r / 10).toFixed(1));
    box.classList.add('is-out');
    setTimeout(() => {
      root.classList.add('intro-enter'); root.classList.remove('intro-on');
      box.classList.add('is-gone');
      setTimeout(() => { v.pause(); box.remove(); }, 900);
      setTimeout(() => root.classList.remove('intro-enter'), 2400);
    }, 820);
  }

  // la intro es muda: el botón redondo (con el anillo de progreso) también salta
  snd.addEventListener('click', leave);
  skip.addEventListener('click', leave);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') leave(); });
  v.addEventListener('ended', leave);
  v.addEventListener('error', leave);
  v.addEventListener('playing', () => { box.classList.add('is-ready'); tick(); }, { once: true });
  // si el navegador no deja reproducir (ahorro de energía…), no bloqueamos la web
  const pr = v.play(); if (pr && pr.catch) pr.catch(leave);
  setTimeout(() => { if (!box.classList.contains('is-ready')) leave(); }, 9000);
})();
