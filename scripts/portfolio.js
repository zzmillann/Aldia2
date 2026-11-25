/* ALDIA — portfolio de apps.
   Cada tarjeta lleva la app viva (apps/<k>.html?mode=card) y la ficha la abre en modo tour (?mode=tour).
   Dentro del iframe, cada app expone window.aldiaApp = { steps: [{ title, text, ms }], go(i), pause(), resume() }. */
(function () {
  const grid = document.querySelector('.pf__grid'); if (!grid) return;
  const V = '20261125c';
  const src = (k, mode) => `./apps/${k}.html?mode=${mode}&v=${V}`;
  const APPS = [
    { k: 'vela', sector: 'Clínica de fisioterapia', name: 'Fisio Vela',
      text: 'Una clínica con cuatro fisioterapeutas que vivía pegada al teléfono. Ahora la agenda se llena sola: cuando alguien cancela, el asistente busca en la lista de espera quién encaja, se lo ofrece por WhatsApp y apunta la cita en cuanto confirma.',
      does: ['Agenda por fisioterapeuta y por sala', 'Lista de espera que rellena los huecos sola', 'Confirmaciones y recordatorios por WhatsApp', 'Bonos con aviso antes de caducar', 'Cobros y facturas en el mismo sitio'] },
    { k: 'arga', sector: 'Distribuidora de bebidas', name: 'Distribuciones Arga',
      text: 'Seis furgonetas y más de doscientos pedidos al día. La oficina ve la flota en 3D y en directo y, cuando algo falla, el asistente propone la solución: mover el pedido, rehacer la ruta y avisar al cliente con un solo toque.',
      does: ['Flota en 3D con cada furgoneta en directo', 'Pedidos desde WhatsApp, correo o la web', 'Rutas optimizadas que se rehacen solas', 'Incidencias resueltas con una propuesta del asistente', 'Albaranes firmados en el móvil del repartidor'] },
    { k: 'brasa', sector: 'Grupo de restaurantes', name: 'Grupo Brasa',
      text: 'Tres restaurantes que hacían los pedidos a ojo. Ahora ven las ventas de cada local por hora y la app calcula lo que hay que pedir con las reservas del fin de semana y lo que se vendió los últimos sábados.',
      does: ['Ventas en tiempo real por local y por hora', 'Sala en directo: mesas, tiempos y cuentas', 'Previsión con las reservas y el histórico', 'Pedidos al proveedor calculados y enviados', 'Escandallos y márgenes por plato'] }
  ];
  const ICO = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>',
    tour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'
  };
  const api = fr => { try { return fr && fr.contentWindow && fr.contentWindow.aldiaApp; } catch (e) { return null; } };

  // ---------- ficha (se crea primero: las tarjetas consultan si está abierta) ----------
  document.body.insertAdjacentHTML('beforeend', `
    <div class="pfm" id="pfm" role="dialog" aria-modal="true" aria-labelledby="pfm-t" hidden>
      <div class="pfm__bg" data-close></div>
      <div class="pfm__box">
        <button type="button" class="pfm__x" data-close aria-label="Cerrar">${ICO.x}</button>
        <div class="pfm__media">
          <div class="pfm__bars"></div>
          <div class="pfm__stage"><iframe title="App de ejemplo en modo tour" tabindex="-1"></iframe><div class="pfm__veil"></div></div>
          <div class="pfm__foot">
            <div class="pfm__cap"><span class="pfm__n"></span><b></b><p></p></div>
            <div class="pfm__ctrl">
              <button type="button" data-prev aria-label="Paso anterior">${ICO.prev}</button>
              <button type="button" data-play aria-label="Pausar">${ICO.pause}</button>
              <button type="button" data-next aria-label="Paso siguiente">${ICO.next}</button>
              <button type="button" class="pfm__full" data-full aria-label="Modo tour">${ICO.tour}<span>Modo tour</span></button>
            </div>
          </div>
        </div>
        <div class="pfm__info">
          <small class="pfm__k"></small><h3 id="pfm-t"></h3><p class="pfm__txt"></p>
          <h5>Lo que hace</h5><ul class="pfm__list"></ul>
          <div class="pfm__pie"><a class="btn btn--dark btn--sm" href="auditoria.html">Quiero una así</a><button type="button" class="pfm__sig" data-sig></button></div>
        </div>
      </div>
    </div>`);
  const m = document.getElementById('pfm');
  const $ = s => m.querySelector(s);
  const stage = $('.pfm__stage'), bars = $('.pfm__bars'), frame = stage.querySelector('iframe');

  // ---------- tarjetas: la app viva dentro, que se pausa cuando no se ve ----------
  const cards = [...grid.querySelectorAll('.pf__it')];
  const cardFrames = [];
  const seen = new Map();
  const syncCards = () => cardFrames.forEach(fr => { const ap = api(fr); if (!ap) return; (seen.get(fr) && m.hidden) ? ap.resume() : ap.pause(); });
  const io = new IntersectionObserver(es => { es.forEach(e => seen.set(e.target, e.isIntersecting)); syncCards(); }, { rootMargin: '120px' });
  cards.forEach((c, i) => {
    const a = APPS[i]; if (!a) return;
    c.tabIndex = 0; c.setAttribute('role', 'button'); c.setAttribute('aria-haspopup', 'dialog'); c.setAttribute('aria-label', 'Ver detalles de ' + a.name);
    const shot = c.querySelector('.pf__shot');
    shot.classList.add('pf__shot--live');
    shot.innerHTML = `<iframe src="${src(a.k, 'card')}" title="${a.name}: app de ejemplo en directo" loading="lazy" tabindex="-1" aria-hidden="true"></iframe>`;
    const fr = shot.querySelector('iframe'); cardFrames.push(fr);
    fr.addEventListener('load', () => { shot.classList.add('is-ready'); setTimeout(syncCards, 60); });
    io.observe(fr);
    const meta = c.querySelector('.pf__meta');
    meta.insertAdjacentHTML('beforeend', `<div class="pf__go"><span class="pf__det">Ver detalles ${ICO.arrow}</span><button type="button" class="pf__tour" data-tour>${ICO.tour}Modo tour</button></div>`);
    c.addEventListener('click', e => open(i, !!e.target.closest('[data-tour]')));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, false); } });
  });

  let app = 0, step = 0, steps = [], playing = true, t0 = 0, raf = 0, lastFocus = null, loadId = 0;
  const dur = () => (steps[step] && steps[step].ms) || 5500;

  const render = () => {
    const a = APPS[app], id = ++loadId;
    $('.pfm__k').textContent = a.sector; $('#pfm-t').textContent = a.name; $('.pfm__txt').textContent = a.text;
    $('.pfm__list').innerHTML = a.does.map(d => `<li><i>${ICO.check}</i>${d}</li>`).join('');
    const nx = APPS[(app + 1) % APPS.length];
    $('[data-sig]').innerHTML = `${nx.name} ${ICO.arrow}`;
    steps = []; bars.innerHTML = ''; stage.classList.remove('is-ready');
    $('.pfm__n').textContent = ''; $('.pfm__cap b').textContent = 'Cargando la app…'; $('.pfm__cap p').textContent = '';
    frame.onload = () => {
      if (id !== loadId) return;
      let tries = 0;
      const wait = () => {
        if (id !== loadId) return;
        const ap = api(frame);
        if (ap && ap.steps && ap.steps.length) return ready(ap);
        if (++tries < 100) setTimeout(wait, 50);
      };
      wait();
    };
    frame.src = src(a.k, 'tour');
  };
  const ready = ap => {
    steps = ap.steps;
    bars.innerHTML = steps.map((s, i) => `<button type="button" aria-label="Paso ${i + 1}: ${s.title}"><i></i></button>`).join('');
    bars.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => go(i, true)));
    stage.classList.add('is-ready');
    go(0, true);
    if (playing) { ap.resume && ap.resume(); } else { ap.pause && ap.pause(); }
  };
  const go = (i, reset) => {
    if (!steps.length) return;
    step = (i + steps.length) % steps.length;
    const ap = api(frame); if (ap) ap.go(step);
    bars.querySelectorAll('button').forEach((b, j) => { b.classList.toggle('is-done', j < step); b.classList.toggle('is-on', j === step); b.querySelector('i').style.transform = j < step ? 'scaleX(1)' : 'scaleX(0)'; });
    $('.pfm__n').textContent = `${step + 1} / ${steps.length}`;
    $('.pfm__cap b').textContent = steps[step].title; $('.pfm__cap p').textContent = steps[step].text;
    const cap = $('.pfm__cap'); cap.classList.remove('is-in'); void cap.offsetWidth; cap.classList.add('is-in');
    if (reset) { t0 = performance.now(); bars.dataset.p = 0; }
  };
  const tick = now => {
    raf = requestAnimationFrame(tick);
    if (!steps.length) return;
    if (!playing) { t0 = now - (bars.dataset.p || 0) * dur(); return; }
    const p = Math.min((now - t0) / dur(), 1); bars.dataset.p = p;
    const cur = bars.querySelectorAll('button')[step]; if (cur) cur.querySelector('i').style.transform = `scaleX(${p})`;
    if (p >= 1) go(step + 1, true);
  };
  const setPlay = v => {
    playing = v; const b = $('[data-play]'); b.innerHTML = v ? ICO.pause : ICO.play; b.setAttribute('aria-label', v ? 'Pausar' : 'Reproducir');
    const ap = api(frame); if (ap) { if (v) { ap.resume && ap.resume(); } else { ap.pause && ap.pause(); } }
  };
  const setFull = v => { m.classList.toggle('is-tour', v); $('[data-full] span').textContent = v ? 'Salir del tour' : 'Modo tour'; };

  function open(i, tour) {
    app = i; lastFocus = document.activeElement;
    m.hidden = false; document.documentElement.classList.add('pfm-open');
    syncCards();
    playing = true; render(); setPlay(true); setFull(!!tour);
    requestAnimationFrame(() => m.classList.add('is-open'));
    cancelAnimationFrame(raf); t0 = performance.now(); raf = requestAnimationFrame(tick);
    $('.pfm__x').focus({ preventScroll: true });
  }
  function close() {
    m.classList.remove('is-open', 'is-tour'); document.documentElement.classList.remove('pfm-open');
    cancelAnimationFrame(raf); loadId++;
    setTimeout(() => { m.hidden = true; frame.removeAttribute('src'); steps = []; syncCards(); }, 350);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  m.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return close();
    if (e.target.closest('[data-prev]')) return go(step - 1, true);
    if (e.target.closest('[data-next]')) return go(step + 1, true);
    if (e.target.closest('[data-play]')) return setPlay(!playing);
    if (e.target.closest('[data-full]')) return setFull(!m.classList.contains('is-tour'));
    if (e.target.closest('[data-sig]')) { app = (app + 1) % APPS.length; return render(); }
    if (e.target.closest('.pfm__stage')) return go(step + 1, true);
  });
  addEventListener('keydown', e => {
    if (m.hidden) return;
    if (e.key === 'Escape') { if (m.classList.contains('is-tour')) setFull(false); else close(); }
    if (e.key === 'ArrowRight') go(step + 1, true);
    if (e.key === 'ArrowLeft') go(step - 1, true);
  });
  // deslizar en el móvil (el velo encima del iframe recoge los toques)
  let sx = null;
  stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(step + (dx < 0 ? 1 : -1), true); sx = null; });
})();
