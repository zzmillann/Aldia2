/* ALDIA — Home: titular que se enciende con el scroll, pilares y línea de proceso */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palabras que pasan de gris a negro según avanzas
  const big = document.querySelector('[data-words]');
  let words = [];
  if (big) {
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else wrap(n);
      });
    };
    wrap(big); words = [...big.querySelectorAll('.w')];
  }

  // Pilares: avanzan solos, se pueden pulsar
  const list = document.querySelector('[data-ablist]');
  if (list) {
    const rows = [...list.children]; let i = 0, hover = false;
    const go = n => { i = n % rows.length; rows.forEach((r, k) => r.classList.toggle('is-active', k === i)); };
    rows.forEach((r, k) => { r.addEventListener('click', () => go(k)); r.addEventListener('pointerenter', () => go(k)); });
    list.addEventListener('pointerenter', () => hover = true); list.addEventListener('pointerleave', () => hover = false);
    if (!reduce) setInterval(() => { if (!hover && list.getBoundingClientRect().top < innerHeight) go(i + 1); }, 3500);
  }

  // Proceso: la línea se rellena con el scroll y cada paso se enciende
  const proc = document.querySelector('[data-proc]');
  const fill = document.querySelector('[data-proc-fill]'), num = document.querySelector('[data-proc-n]');
  const steps = proc ? [...proc.querySelectorAll('.pr__st')] : [];

  const onScroll = () => {
    const vh = innerHeight;
    if (words.length) {
      const r = big.getBoundingClientRect();
      const p = Math.min(Math.max((vh * .85 - r.top) / (vh * .6), 0), 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, k) => w.classList.toggle('on', reduce || k < lit));
    }
    if (proc) {
      const box = proc.querySelector('.pr__steps').getBoundingClientRect();
      const p = Math.min(Math.max((vh * .6 - box.top) / box.height, 0), 1);
      fill.style.transform = `scaleY(${p})`;
      let active = 0;
      steps.forEach((s, k) => { const on = s.getBoundingClientRect().top < vh * .6; s.classList.toggle('is-on', on); if (on) active = k; });
      num.textContent = '0' + (active + 1);
    }
  };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
})();
