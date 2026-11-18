/* ALDIA — Lienzo animado del flujo ALDIA 2 (caso Fun & Tickets) */
(function () {
  const root = document.querySelector('[data-flowx]'); if (!root) return;
  const L = './assets/logos/';
  const PH = [
    { t: 'Entrada desde Bokun', ico: 'B', d: 'La reserva llega desde GetYourGuide, Viator, Tripadvisor, Headout o Civitatis a Bokun, que avisa al webhook de n8n. El flujo limpia el payload, normaliza horas y marcadores y descarta productos de otros proveedores.', n: ['Webhook', 'Clean Bokun Payload', 'Normalize Time + Markers', '¿Producto de otro proveedor?'] },
    { t: 'Carpeta y hoja del día', img: 'googledrive.svg', d: 'Calcula la ruta año/mes en Google Drive, crea las carpetas si faltan y copia la plantilla del día comprobando que no se duplique.', n: ['Build Drive Paths', 'Search Month Folder', 'Copy Daily Template', '¿Día duplicado?'] },
    { t: 'Lectura del bloque', img: 'googlesheets.svg', d: 'Abre la hoja del día, localiza los marcadores de la franja horaria y revisa qué reservas hay ya para decidir si inserta, salta o cancela.', n: ['Read Daily Sheet', 'Find Block Markers', 'Parse Pending', 'Check Duplicate'] },
    { t: 'Escritura dinámica', img: 'googlesheets.svg', d: 'Si el bloque necesita crecer inserta filas, recalcula el rango, escribe la reserva, limpia el sobrante y verifica que ha quedado bien.', n: ['LOCK Acquire', 'Insert Rows Before End', 'Write Pending Rows', 'VERIFY Write'] },
    { t: 'Cancelaciones', img: 'n8n.svg', d: 'Busca la reserva, reescribe el bloque sin ella y, si falta menos de 24 h para la actividad, avisa al equipo.', n: ['Build Cancellation Plan', 'Rewrite Cancelled Block', 'Late Cancellation <24h', 'VERIFY Cancel'] },
    { t: 'Control y avisos', img: 'telegram.svg', d: 'Registra todo en Supabase y en el Bokun Control Center, sincroniza la reserva con la web y envía alertas por Telegram si algo no cuadra.', n: ['Supabase · Insert Reservation', 'Bokun Control Center', 'WEB · ingest_bokun', 'Telegram'] }
  ];
  const nodesEl = root.querySelector('.fx__nodes'), canvas = root.querySelector('.fx__canvas');
  const svg = root.querySelector('.fx__wires'), base = root.querySelector('.fx__base'), trail = root.querySelector('.fx__trail');
  const dot = root.querySelector('.fx__dot'), halo = root.querySelector('.fx__halo');
  const stepEl = root.querySelector('.fx__step'), titleEl = root.querySelector('.fx__title'), descEl = root.querySelector('.fx__desc'), log = root.querySelector('.fx__log');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  nodesEl.innerHTML = PH.map((p, i) => `
    <button class="fxn" data-i="${i}" style="--i:${i}">
      <span class="fxn__ico">${p.img ? `<img src="${L + p.img}" alt="">` : `<b>${p.ico}</b>`}</span>
      <span class="fxn__txt"><small>0${i + 1}</small>${p.t}</span>
      <span class="fxn__port fxn__port--in"></span><span class="fxn__port fxn__port--out"></span>
      <span class="fxn__ok">✓</span>
    </button>`).join('');
  const nodes = [...nodesEl.children];

  // Cables: curva entre los centros de cada nodo, se recalcula con el tamaño
  let pts = [], segLen = [], total = 0;
  const build = () => {
    const c = canvas.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${c.width} ${c.height}`);
    pts = nodes.map(n => { const r = n.getBoundingClientRect(); return [r.left - c.left + r.width / 2, r.top - c.top + r.height / 2]; });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
      if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) { const mx = (x0 + x1) / 2; d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`; }
      else { const my = (y0 + y1) / 2; d += ` C${x0},${my} ${x1},${my} ${x1},${y1}`; }
    }
    base.setAttribute('d', d); trail.setAttribute('d', d);
    total = base.getTotalLength();
    // longitud acumulada hasta cada nodo
    segLen = [0];
    let acc = 0, k = 1;
    for (let s = 0; s <= total && k < pts.length; s += 2) {
      const p = base.getPointAtLength(s);
      if (Math.hypot(p.x - pts[k][0], p.y - pts[k][1]) < 3) { segLen.push(s); k++; }
      acc = s;
    }
    while (segLen.length < pts.length) segLen.push(total);
    trail.style.strokeDasharray = total; setTrail(cur);
  };

  let cur = 0, at = 0, anim = null, paused = false, timers = [];
  const setTrail = len => { at = len; trail.style.strokeDashoffset = total - len; const p = base.getPointAtLength(len); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); halo.setAttribute('cx', p.x); halo.setAttribute('cy', p.y); };

  const ms = () => (Math.random() * 40 + 6).toFixed(0);
  const now = () => new Date().toLocaleTimeString('es-ES', { hour12: false });
  const line = (html, cls = '') => {
    const d = document.createElement('div'); d.className = 'fx__line ' + cls; d.innerHTML = html; log.appendChild(d);
    while (log.children.length > 9) log.firstElementChild.remove();
  };

  const activate = i => {
    nodes.forEach((n, k) => { n.classList.toggle('is-on', k === i); n.classList.toggle('is-done', k < i); });
    stepEl.textContent = `Fase 0${i + 1} de 06`; titleEl.textContent = PH[i].t; descEl.textContent = PH[i].d;
    [stepEl, titleEl, descEl].forEach(e => { e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); });
    timers.forEach(clearTimeout); timers = [];
    PH[i].n.forEach((name, k) => timers.push(setTimeout(() => line(`<time>${now()}</time><span class="ok">✓</span>${name}<em>${ms()} ms</em>`), 220 * (k + 1))));
    if (i === PH.length - 1) timers.push(setTimeout(() => line(`<time>${now()}</time><span class="ok">●</span><b>Reserva lista en su hoja y franja</b><em>${(Math.random() * 2.2 + 8.8).toFixed(1).replace('.', ',')} s</em>`, 'fx__line--done'), 220 * 5));
  };

  const travel = (from, to, dur, done) => {
    cancelAnimationFrame(anim);
    const t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setTrail(from + (to - from) * e);
      if (p < 1) anim = requestAnimationFrame(step); else done && done();
    };
    anim = requestAnimationFrame(step);
  };

  let loopTimer;
  const next = () => {
    clearTimeout(loopTimer);
    if (paused) return;
    if (cur >= PH.length - 1) {
      loopTimer = setTimeout(() => {
        line(`<time>${now()}</time><span class="in">→</span>Nueva reserva recibida desde Bokun`, 'fx__line--in');
        nodes.forEach(n => n.classList.remove('is-done', 'is-on'));
        travel(at, 0, 500, () => { cur = 0; activate(0); loopTimer = setTimeout(next, 2200); });
      }, 2600);
      return;
    }
    travel(segLen[cur], segLen[cur + 1], reduce ? 1 : 1200, () => { cur++; activate(cur); loopTimer = setTimeout(next, 2200); });
  };

  nodes.forEach((n, i) => n.addEventListener('click', () => {
    paused = true; clearTimeout(loopTimer);
    travel(at, segLen[i], 600, () => { cur = i; activate(i); });
    clearTimeout(n._r); n._r = setTimeout(() => { paused = false; next(); }, 9000);
  }));

  let started = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !started) { started = true; build(); line(`<time>${now()}</time><span class="in">→</span>Nueva reserva recibida desde Bokun`, 'fx__line--in'); activate(0); loopTimer = setTimeout(next, 2000); }
    else if (!e.isIntersecting) { clearTimeout(loopTimer); }
    else if (started && !paused) { next(); }
  }, { threshold: .25 }).observe(root);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
})();
