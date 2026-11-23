/* ALDIA — Caso Fun & Tickets (servicios.html):
   1) «De dónde llegan las reservas» en vivo: contador y notificación que cambia.
   2) «Reservas en directo»: consola que rota entre 5 escenarios reales del flujo (reserva nueva, cancelación con
      aviso por Telegram, «rebooked» de Viator, reseña contestada por la IA y red de seguridad). Datos de ejemplo. */
(function () {
  const L = './assets/logos/';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enVista = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: .2 }).observe(el);

  /* ---------------- 1) esquema en vivo ---------------- */
  const fx = document.getElementById('fx');
  if (fx) {
    const MUESTRAS = [
      ['getyourguide', 'Toledo · 10:00', 'Laura M. · 4 personas'], ['viator', 'Segovia · 9:00', 'Tom H. · 2 personas'],
      ['civitatis', 'Museo del Prado · 11:30', 'Lucía V. · 5 personas'], ['tripadvisor', 'El Escorial · 9:30', 'Ana P. · 3 personas'],
      ['headout', 'Palacio Real · 16:00', 'Marco T. · 2 personas'],
    ];
    const n = fx.querySelector('#fx-n'), toast = fx.querySelector('#fx-toast');
    let k = 0, total = 142, t = null;
    const paso = () => {
      const [c, a, b] = MUESTRAS[k++ % MUESTRAS.length];
      toast.classList.remove('in'); void toast.offsetWidth;
      fx.querySelector('#fx-tl').src = L + 'ch-' + c + '.png'; fx.querySelector('#fx-tt').textContent = a; fx.querySelector('#fx-ts').textContent = b;
      toast.classList.add('in'); n.textContent = ++total;
      fx.querySelector('.fx-hoja').classList.remove('pulso'); void fx.offsetWidth; fx.querySelector('.fx-hoja').classList.add('pulso');
    };
    enVista(fx, (v) => { clearInterval(t); if (v && !reduce) { paso(); t = setInterval(paso, 2600); } });
  }

  /* ---------------- 2) consola «Reservas en directo» ---------------- */
  const ops = document.getElementById('ops');
  if (!ops) return;
  const $ = (s) => ops.querySelector(s);
  const TABS = ['Toledo', 'Segovia', 'Prado', 'El Escorial', 'Ávila'];
  // hoja: filas por pestaña; las que empiezan por «#» son marcadores de bloque (franja horaria)
  const HOJA = {
    Toledo: [['#', '10:00 · Toledo clásico'], ['GYG-5H2LQ1', 'Pedro S.', '2', 'Tripadvisor'], ['CIV-88213', 'Ana G.', '3', 'Civitatis'], ['#', '15:00 · Toledo y Catedral'], ['VIA-102416', 'Marco T.', '2', 'Viator'], ['HDO-4471', 'Sofía L.', '4', 'Headout']],
    Segovia: [['#', '09:00 · Segovia completo'], ['VIA-93691', 'Carlos R.', '2', 'Viator'], ['CIV-88990', 'Ana P.', '3', 'Civitatis'], ['GYG-7Y1MZ0', 'John D.', '2', 'GetYourGuide'], ['#', '14:30 · Segovia tarde'], ['TRP-55102', 'Elena F.', '6', 'Tripadvisor']],
  };
  const CANAL = { Tripadvisor: 'tripadvisor', Civitatis: 'civitatis', Viator: 'viator', Headout: 'headout', GetYourGuide: 'getyourguide' };
  const ESC = [
    { tipo: 'BOOKING_CONFIRMED', ref: 'GYG-7Q2K9X', canal: 'getyourguide', ev: 'Nueva reserva', det: 'Toledo · 10:00 · Laura M. · 4', tab: 'Toledo', t: '8,9 s', fin: 'Escrita en su hoja y guardada en Drive',
      pasos: [['Webhook de Bokun', 'BOOKING_CONFIRMED'], ['Limpia y normaliza', 'hora 10:00 · Toledo'], ['¿Es de otro proveedor?', 'no'], ['Drive: carpeta 2026 / 11', 'creada si faltaba'], ['Hoja del día', 'Reservas 2026-11-18'], ['Busca el bloque', 'Toledo · 10:00'], ['¿Duplicada?', 'no'], ['Bloquea y escribe', 'fila nueva'], ['Verifica lo escrito', 'ok'], ['Supabase y web', 'registrada']],
      efecto: (g, i) => { if (i === 7) inserta(g, 'Toledo', 2, ['GYG-7Q2K9X', 'Laura M.', '4', 'GetYourGuide'], 'is-new'); } },
    { tipo: 'BOOKING_ITEM_CANCELLED', ref: 'VIA-93691', canal: 'viator', ev: 'Cancelación', det: 'Segovia · 9:00 · Carlos R. · 2', tab: 'Segovia', t: '6,4 s', fin: 'Quitada de la hoja y equipo avisado', tg: ['Cancelación de última hora', 'Segovia 9:00 · Carlos R. · 2 plazas libres'],
      pasos: [['Webhook de Bokun', 'BOOKING_ITEM_CANCELLED'], ['Busca la reserva', 'Segovia · fila 3'], ['Plan de cancelación', 'quitar 1 fila'], ['Reescribe el bloque', 'sin la reserva'], ['Verifica', 'ok'], ['¿Menos de 24 h?', 'sí: mañana 9:00'], ['Telegram al equipo', 'aviso enviado'], ['Supabase y web', 'actualizado']],
      efecto: (g, i) => { if (i === 3) marca(g, 'VIA-93691', 'is-del'); if (i === 6) aviso(); } },
    { tipo: 'BOOKING_UPDATED', ref: 'VIA-102416', canal: 'viator', ev: 'Cambio de reserva', det: '«Rebooked» · Toledo 11:30 → 15:00', tab: 'Toledo', t: '7,2 s', fin: 'Movida de franja sin perder la nueva',
      pasos: [['Webhook de Bokun', 'BOOKING_UPDATED'], ['Detecta «rebooked» de Viator', 'mismo localizador'], ['Conserva la reserva nueva', 'descarta la vieja'], ['Busca el bloque nuevo', 'Toledo · 15:00'], ['Mueve la fila', '11:30 → 15:00'], ['Verifica', 'ok'], ['Supabase y web', 'actualizado']],
      efecto: (g, i) => { if (i === 4) marca(g, 'VIA-102416', 'is-mod'); } },
    { tipo: 'REVIEW_NEW', ref: 'Tripadvisor', canal: 'tripadvisor', ev: 'Reseña nueva', det: '★★★★★ · Museo del Prado', vista: 'resena', t: '12 s', fin: 'Contestada por la IA',
      pasos: [['Nueva reseña', 'Tripadvisor · 5 ★'], ['La IA la lee', 'idioma: inglés'], ['Redacta la respuesta', 'con el tono de la casa'], ['Comprueba datos y tono', 'ok'], ['Publica la respuesta', 'en Tripadvisor']],
      efecto: (g, i) => { if (i === 2) $('.rv-ia').classList.add('escribe'); if (i === 4) $('.rv-ia').classList.add('ok'); } },
    { tipo: 'RED DE SEGURIDAD', ref: 'cada 2 h', canal: 'bokun', ev: 'Red de seguridad', det: '312 reservas comparadas · 0 faltan', tab: 'Toledo', t: '41 s', fin: 'Todo cuadra con Bokun',
      pasos: [['Programado', 'cada 2 h, de 7 a 21'], ['Lee lo confirmado en Bokun', '312 reservas'], ['Compara con las hojas', 'día a día'], ['¿Falta alguna?', '0 faltan'], ['Índice', 'autorreparado'], ['Registro en el panel', 'cuadre ok']],
      efecto: (g, i) => { if (i === 3) $('.gs-ok').classList.add('in'); } },
  ];

  const feed = $('#ops-feed'), lista = $('#ops-pasos'), grid = $('#gs-grid'), tabs = $('#gs-tabs');
  const sheet = $('.ops-sheet');
  // vista de reseña y aviso de Telegram (se crean una vez)
  sheet.insertAdjacentHTML('beforeend', `<div class="rv"><div class="rv-cab"><img src="${L}ch-tripadvisor.png" alt=""><b>Tripadvisor</b><small>Fun &amp; Tickets · Museo del Prado</small></div>
    <div class="rv-op"><span class="rv-av">LW</span><div><b>Laura W.</b> <em>★★★★★</em><p>“Amazing guide at the Prado! Skip-the-line worked perfectly and Pablo made every painting come alive.”</p></div></div>
    <div class="rv-ia"><div class="rv-ia-h"><img src="./assets/logo-circulo.png" alt=""><b>Respuesta del propietario</b><small>redactada por la IA</small></div><p>Thank you so much, Laura! We’re thrilled you enjoyed the Prado with Pablo. Hope to see you again on our Toledo tour!</p></div></div>
    <div class="gs-ok"><i>✓</i><span><b>Cuadrado con Bokun</b><small>312 reservas · 0 faltan</small></span></div>`);
  $('.ops-win').insertAdjacentHTML('beforeend', `<div class="tg"><img src="${L}telegram.svg" alt=""><div><small>Telegram · Fun &amp; Tickets Equipo · ahora</small><b></b><span></span></div></div>`);

  const filaHTML = (r, cls = '') => r[0] === '#' ? `<div class="gs-r gs-blk"><span></span><span>${r[1]}</span></div>`
    : `<div class="gs-r ${cls}" data-loc="${r[0]}"><span></span><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span><img src="${L}ch-${CANAL[r[3]] || 'bokun'}.png" alt="">${r[3]}</span></div>`;
  const pinta = (tab) => {
    tabs.innerHTML = TABS.map((t) => `<span class="${t === tab ? 'on' : ''}">${t}</span>`).join('') + '<span class="mas">+</span>';
    grid.innerHTML = `<div class="gs-r gs-h"><span></span><span>Localizador</span><span>Cliente</span><span>Pax</span><span>Canal</span></div>` + (HOJA[tab] || []).map((r) => filaHTML(r)).join('');
    numera();
  };
  const numera = () => [...grid.children].forEach((r, i) => { r.firstElementChild.textContent = i ? i : ''; });
  function inserta(g, tab, pos, r, cls) { const ref = g.children[pos + 1]; ref.insertAdjacentHTML('afterend', filaHTML(r, cls)); numera(); $('#gs-fx').textContent = r[1]; }
  function marca(g, loc, cls) { const f = g.querySelector(`[data-loc="${loc}"]`); if (f) { f.classList.add(cls); $('#gs-fx').textContent = f.children[2].textContent; } if (cls === 'is-del') setTimeout(() => f && f.classList.add('fuera'), 900); }
  function aviso() { const e = ESC[i]; const tg = $('.tg'); tg.querySelector('b').textContent = e.tg[0]; tg.querySelector('span').textContent = e.tg[1]; tg.classList.add('in'); }

  let i = -1, timers = [];
  const hora = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const run = () => {
    timers.forEach(clearTimeout); timers = [];
    i = (i + 1) % ESC.length; const e = ESC[i];
    $('.tg').classList.remove('in'); $('.gs-ok').classList.remove('in'); $('.rv-ia').classList.remove('escribe', 'ok');
    sheet.classList.toggle('ver-resena', e.vista === 'resena');
    if (e.tab) pinta(e.tab);
    $('#gs-doc').textContent = e.vista === 'resena' ? 'Reseñas · Tripadvisor' : 'Reservas 2026-11-18';
    $('#gs-fx').textContent = '=';
    $('#ops-tipo').textContent = e.tipo; $('#ops-ref').textContent = e.ref;
    // evento nuevo arriba del todo
    feed.insertAdjacentHTML('afterbegin', `<li class="nuevo"><img src="${L}ch-${e.canal}.png" alt=""><span><b>${e.ev}</b><small>${e.det}</small></span><time>${hora()}</time><em class="pr">procesando</em></li>`);
    while (feed.children.length > 6) feed.lastElementChild.remove();
    const li = feed.firstElementChild;
    lista.innerHTML = e.pasos.map(([a, b]) => `<li><i></i><span><b>${a}</b><small>${b}</small></span><em></em></li>`).join('');
    const fin = $('#ops-fin'); fin.classList.remove('in'); fin.querySelector('b').textContent = e.fin; $('#ops-t').textContent = e.t;
    const PASO = reduce ? 0 : 560;
    [...lista.children].forEach((p, k) => timers.push(setTimeout(() => {
      p.classList.add('on'); p.querySelector('em').textContent = (k * 37 % 90 + 12) + ' ms';
      if (k) lista.children[k - 1].classList.add('hecho');
      e.efecto && e.efecto(grid, k);
    }, 350 + k * PASO)));
    const tFin = 350 + e.pasos.length * PASO;
    timers.push(setTimeout(() => { lista.lastElementChild.classList.add('hecho'); fin.classList.add('in'); li.classList.remove('nuevo'); li.querySelector('.pr').textContent = e.t; li.querySelector('.pr').className = 'ok'; }, tFin));
    timers.push(setTimeout(run, tFin + 3200));
  };
  enVista(ops, (v) => { timers.forEach(clearTimeout); if (v) run(); });
})();
