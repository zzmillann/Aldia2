/* ALDIA — «Así funciona, paso a paso»: avanza despacio, se puede pulsar cada paso */
(function () {
  document.querySelectorAll('[data-ps]').forEach(box => {
    const btns = [...box.querySelectorAll('[data-k]')], stage = box.querySelector('.ps__stage');
    const STEP = 5200; let k = 0, timer = null, hover = false, seen = false;
    const go = n => {
      k = (n + btns.length) % btns.length;
      btns.forEach((b, i) => { b.classList.toggle('is-on', i === k); b.classList.toggle('is-done', i < k); b.style.setProperty('--dur', STEP + 'ms'); });
      stage.dataset.s = k + 1;
    };
    const tick = () => { if (!hover) go(k + 1); };
    btns.forEach((b, i) => b.addEventListener('click', () => { go(i); clearInterval(timer); timer = setInterval(tick, STEP); }));
    box.addEventListener('pointerenter', () => { hover = true; box.classList.add('is-paused'); });
    box.addEventListener('pointerleave', () => { hover = false; box.classList.remove('is-paused'); });
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) { if (!seen) { seen = true; go(0); } timer = setInterval(tick, STEP); }
    }, { threshold: .35 }).observe(box);
  });
})();
