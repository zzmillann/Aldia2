/* ALDIA — Cartas de cifras con mini visualizaciones en movimiento */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.kpi');
  if (!cards.length) return;
  const timers = [];
  const every = (ms, fn) => { fn(); if (!reduce) timers.push([ms, fn]); };

  // Rejilla: 40 sistemas que se encienden y procesan
  const grid = document.querySelector('[data-kpi-grid]');
  if (grid) {
    grid.innerHTML = Array.from({ length: 40 }, () => '<i></i>').join('');
    const cells = [...grid.children];
    cells.forEach(c => c.classList.add('on'));
    every(260, () => {
      const c = cells[(Math.random() * cells.length) | 0];
      c.classList.remove('ping'); void c.offsetWidth; c.classList.add('ping');
    });
  }

  // Barras: tendencia que sube y se recoloca sola
  const bars = document.querySelector('[data-kpi-bars]');
  if (bars) {
    const N = 12;
    bars.innerHTML = Array.from({ length: N }, () => '<i></i>').join('');
    const els = [...bars.children];
    let t = 0;
    every(1400, () => {
      t++;
      els.forEach((b, k) => {
        const base = 22 + (k / (N - 1)) * 70;
        const wobble = Math.sin(t * .9 + k * .7) * 8 + (Math.random() - .5) * 6;
        b.style.height = Math.max(10, Math.min(100, base + wobble)) + '%';
      });
    });
  }

  // Tareas: la barra «manual» se encoge al automatizarse
  const tasks = document.querySelector('[data-kpi-tasks]');
  if (tasks) {
    const rows = [...tasks.children], orig = rows.map(r => r.querySelector('em').textContent);
    let k = 0;
    every(1500, () => {
      const r = rows[k % rows.length], auto = !r.classList.contains('is-auto');
      r.classList.toggle('is-auto', auto);
      r.querySelector('em').textContent = auto ? '0 min' : orig[k % rows.length];
      k++;
    });
  }

  // Línea de 24 h con actividad
  const hours = document.querySelector('[data-kpi-hours]');
  if (hours) {
    const act = [2, 1, 1, 1, 2, 3, 5, 7, 9, 8, 7, 8, 9, 8, 7, 8, 9, 8, 6, 5, 4, 3, 3, 2];
    hours.insertAdjacentHTML('afterbegin', act.map(v => `<i style="--h:${18 + v * 9}%"></i>`).join(''));
  }

  // Últimos eventos del 24/7
  const ticker = document.querySelector('[data-kpi-ticker]');
  if (ticker) {
    const EVENTS = ['Reserva sincronizada', 'Factura procesada', 'Lead enviado al CRM', 'Informe diario creado', 'Cancelación aplicada', 'Aviso enviado al equipo', 'Pago conciliado'];
    let k = 0;
    every(2000, () => {
      const t = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const s = document.createElement('div'); s.className = 'kpi__ev';
      s.innerHTML = `<time>${t}</time><span>${EVENTS[k++ % EVENTS.length]}</span>`;
      ticker.prepend(s);
      while (ticker.children.length > 2) ticker.lastElementChild.remove();
    });
  }

  // Foco de luz que sigue al cursor en cada carta
  cards.forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  // Los intervalos solo corren con las cartas en pantalla
  let ids = [];
  const wrap = cards[0].parentElement;
  new IntersectionObserver(([e]) => {
    ids.forEach(clearInterval); ids = [];
    if (e.isIntersecting) ids = timers.map(([ms, fn]) => setInterval(fn, ms));
    if (e.isIntersecting) cards.forEach(c => c.classList.add('is-in'));
  }, { threshold: .2 }).observe(wrap);

  // Contadores
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count, t0 = performance.now();
      const tick = now => { const p = Math.min((now - t0) / 1800, 1); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.unobserve(en.target);
  }), { threshold: .3 });
  cards.forEach(c => io.observe(c));
})();
