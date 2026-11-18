/* NORTE CRM — demo interactiva. Marca, empresas, personas y cifras INVENTADAS. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const eur = n => fmt(n) + ' €';
  const k = n => (n / 1000).toFixed(1).replace('.', ',') + 'k';
  const Q = new URLSearchParams(location.search);
  const SHOT = Q.has('shot');
  if (SHOT) document.documentElement.classList.add('shot');

  /* ---------- iconos (trazos estilo lucide) ---------- */
  const P = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    pipe: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7M12 7v4M16 7v9"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    proj: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4M12 10v2M16 10v6"/>',
    inv: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    team: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="18" cy="17" r="3"/><path d="M18 12.5v1.5M18 20v1.5M22.5 17H21M15 17h-1.5"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    euro: '<path d="M4 10h12M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    spark: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
    down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    upr: '<path d="M7 17 17 7M7 7h10v10"/>'
  };
  const I = (n, st = '') => `<svg class="i" viewBox="0 0 24 24"${st ? ` style="${st}"` : ''}>${P[n]}</svg>`;

  /* ---------- datos inventados ---------- */
  const TEAM = [
    { i: 'LF', n: 'Lucía Ferrer', r: 'Propietaria', c: 'c4', mail: 'lucia@estudiomarea.test', on: 1 },
    { i: 'MV', n: 'Marcos Vidal', r: 'Ventas', c: 'c5', mail: 'marcos@estudiomarea.test', on: 1 },
    { i: 'IS', n: 'Irene Soto', r: 'Cuentas', c: 'c2', mail: 'irene@estudiomarea.test', on: 0 },
    { i: 'PN', n: 'Pablo Nieto', r: 'Proyectos', c: 'c1', mail: 'pablo@estudiomarea.test', on: 1 },
    { i: 'CR', n: 'Carla Ruiz', r: 'Marketing', c: 'c3', mail: 'carla@estudiomarea.test', on: 0 }
  ];
  const av = (t, sz = '') => `<span class="av ${sz} ${TEAM[t].c}" title="${TEAM[t].n}">${TEAM[t].i}</span>`;
  const STAGES = [
    { id: 'n', n: 'Nuevos', c: '#8b95aa', p: 10 }, { id: 'c', n: 'Contactado', c: '#5b8cff', p: 25 },
    { id: 'p', n: 'Propuesta', c: '#7c5cff', p: 50 }, { id: 'g', n: 'Negociación', c: '#e8590c', p: 75 },
    { id: 'w', n: 'Ganado', c: '#12a26b', p: 100 }
  ];
  const COL = ['#2f5bea', '#e8590c', '#12a26b', '#7c5cff', '#db2777', '#0891b2', '#ca8a04', '#475569'];
  let DEALS = [
    ['Panadería Ortiz', 'Alimentación', 2400, 1, 2, 'n', 'Web + pedidos online'],
    ['Floristería Jara', 'Comercio', 1500, 4, 1, 'n', 'Tienda online'],
    ['Taller Ribera', 'Automoción', 1800, 1, 4, 'n', 'Citas por WhatsApp'],
    ['Veterinaria Nube', 'Salud', 3300, 2, 3, 'c', 'Recordatorios a clientes'],
    ['Gimnasio Pulso', 'Deporte', 4200, 1, 6, 'c', 'App de socios'],
    ['Café Tranvía', 'Hostelería', 2100, 4, 2, 'c', 'Campaña de Navidad'],
    ['Academia Sigma', 'Formación', 6300, 3, 9, 'p', 'Portal de alumnos'],
    ['Ópticas Lince', 'Comercio', 3900, 2, 5, 'p', 'CRM + fidelización'],
    ['Inmobiliaria Brezo', 'Inmobiliaria', 9800, 1, 12, 'p', 'Web + fichas automáticas'],
    ['Bodegas Arnau', 'Vinos', 12500, 0, 15, 'g', 'Branding + e-commerce'],
    ['Asesoría Duero', 'Servicios', 7200, 2, 7, 'g', 'Automatizar facturas'],
    ['Hotel Mirador', 'Turismo', 14800, 3, 21, 'w', 'Web + motor de reservas'],
    ['Clínica Velarde', 'Salud', 8900, 1, 18, 'w', 'App de citas'],
    ['Logística Avante', 'Logística', 11200, 0, 26, 'w', 'Automatización de albaranes']
  ].map((d, x) => ({ id: x, name: d[0], sec: d[1], v: d[2], own: d[3], days: d[4], st: d[5], what: d[6], c: COL[x % COL.length] }));
  const nrm = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const ini = s => s.split(' ').filter(w => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  /* ---------- navegación ---------- */
  const NAV = [
    ['', [['inicio', 'Inicio', 'home']]],
    ['Ventas', [['pipeline', 'Pipeline', 'pipe'], ['clientes', 'Clientes', 'users'], ['presupuestos', 'Presupuestos', 'file'], ['mensajes', 'Mensajes', 'inbox', 3], ['reuniones', 'Reuniones', 'cal']]],
    ['Trabajo', [['tareas', 'Tareas', 'check', 2], ['proyectos', 'Proyectos', 'proj'], ['soporte', 'Soporte', 'msg'], ['documentos', 'Documentos', 'file'], ['automatizaciones', 'Automatizaciones', 'zap']]],
    ['Dinero', [['facturas', 'Facturación', 'inv'], ['suscripciones', 'Suscripciones', 'card'], ['productos', 'Productos', 'tag']]],
    ['Crecer', [['newsletter', 'Newsletter', 'mail'], ['analitica', 'Analítica', 'chart']]],
    ['Ajustes', [['equipo', 'Equipo y permisos', 'team']]]
  ];
  const TITLES = Object.fromEntries(NAV.flatMap(s => s[1]).map(n => [n[0], n[1]]));
  $('[data-sb]').innerHTML = `
    <div class="sb__logo"><span class="sb__mark"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/></svg></span><div><b>Norte</b><small>CRM para equipos pequeños</small></div></div>
    <div class="sb__ws"><i>EM</i><div><b>Estudio Marea</b><small>Plan Equipo · 5 plazas</small></div>${I('chev')}</div>
    ${NAV.map(([t, items]) => `${t ? `<p class="sb__sec">${t}</p>` : ''}<nav class="sb__nav">${items.map(([id, n, ic, b]) => `<button class="sb__a" data-go="${id}">${I(ic)}<span>${n}</span>${b ? `<em>${b}</em>` : ''}</button>`).join('')}</nav>`).join('')}
    <div class="sb__foot"><span class="av c4">LF</span><div><b>Lucía Ferrer</b><small>Propietaria</small></div></div>`;
  $$('[data-go]').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.go; }));

  const toastEl = $('[data-toast]'); let tt;
  const toast = m => { toastEl.querySelector('span').textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 2400); };

  /* ---------- gráficas SVG ---------- */
  function areaChart(el, labels, vals, opt = {}) {
    const W = 640, H = opt.h || 220, pl = 40, pr = 8, pt = 10, pb = 26;
    const max = opt.max || Math.ceil(Math.max(...vals) * 1.15 / 5000) * 5000, n = vals.length;
    const x = i => pl + i * (W - pl - pr) / (n - 1), y = v => pt + (1 - v / max) * (H - pt - pb);
    const line = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const prev = opt.prev ? opt.prev.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('') : '';
    let g = '';
    for (let t = 0; t <= 4; t++) { const v = max * t / 4; g += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="#e4e9f1" ${t ? 'stroke-dasharray="3 4"' : ''}/><text x="${pl - 8}" y="${y(v) + 4}" text-anchor="end" font-size="10.5" fill="#8b95aa">${v ? k(v) : '0'}</text>`; }
    labels.forEach((l, i) => g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" font-size="10.5" fill="#8b95aa">${l}</text>`);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="ga${opt.id || ''}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5bea" stop-opacity=".22"/><stop offset="1" stop-color="#2f5bea" stop-opacity="0"/></linearGradient></defs>${g}
      ${prev ? `<path d="${prev}" fill="none" stroke="#c3cee3" stroke-width="2" stroke-dasharray="4 5"/>` : ''}
      <path d="${line}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="url(#ga${opt.id || ''})"/>
      <path d="${line}" fill="none" stroke="#2f5bea" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" pathLength="1" class="draw"/>
      <circle cx="${x(n - 1)}" cy="${y(vals[n - 1])}" r="5" fill="#fff" stroke="#2f5bea" stroke-width="2.5"/>
      <line class="hv" x1="0" x2="0" y1="${pt}" y2="${H - pb}" stroke="#0a1633" stroke-opacity=".25" stroke-dasharray="3 3" opacity="0"/>
      <circle class="hd" r="5" fill="#2f5bea" stroke="#fff" stroke-width="2.5" opacity="0"/></svg><div class="tip"></div>`;
    const svg = el.querySelector('svg'), tip = el.querySelector('.tip'), hv = svg.querySelector('.hv'), hd = svg.querySelector('.hd');
    const dp = svg.querySelector('.draw');
    if (!SHOT) { dp.style.strokeDasharray = '1'; dp.style.strokeDashoffset = '1'; dp.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }); }
    svg.addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * W;
      const i = Math.max(0, Math.min(n - 1, Math.round((sx - pl) / ((W - pl - pr) / (n - 1)))));
      hv.setAttribute('x1', x(i)); hv.setAttribute('x2', x(i)); hv.setAttribute('opacity', 1);
      hd.setAttribute('cx', x(i)); hd.setAttribute('cy', y(vals[i])); hd.setAttribute('opacity', 1);
      tip.style.left = x(i) / W * 100 + '%'; tip.style.top = y(vals[i]) / H * 100 + '%'; tip.style.opacity = 1;
      tip.innerHTML = `<small>${opt.full ? opt.full[i] : labels[i]}</small><b>${eur(vals[i])}</b>${opt.prev ? `<small>Año anterior: ${eur(opt.prev[i])}</small>` : ''}`;
    });
    svg.addEventListener('pointerleave', () => { tip.style.opacity = 0; hv.setAttribute('opacity', 0); hd.setAttribute('opacity', 0); });
  }
  const spark = (vals, c = '#2f5bea') => {
    const W = 88, H = 30, mx = Math.max(...vals), mn = Math.min(...vals);
    const pts = vals.map((v, i) => `${(i * W / (vals.length - 1)).toFixed(1)},${(H - 3 - (v - mn) / (mx - mn || 1) * (H - 6)).toFixed(1)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 ${W} ${H}"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  };
  const kpi = (l, v, s, ic, cls = '', sp) => `<div class="kpi ${cls}"><div class="kpi__t"><span class="kpi__l">${l}</span><span class="ico ${cls === 'hero' ? '' : cls}">${I(ic)}</span></div><div class="kpi__v num">${v}</div><div class="kpi__s">${s}</div>${sp || ''}</div>`;
  const hd = (t, p, a = '', cnt = '') => `<div class="hd"><div><h1>${t}${cnt ? ` <span class="cnt">${cnt}</span>` : ''}</h1><p>${p}</p></div><div class="hd__a">${a}</div></div>`;

  const MON = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];
  const MONF = ['Diciembre 2025', 'Enero 2026', 'Febrero 2026', 'Marzo 2026', 'Abril 2026', 'Mayo 2026', 'Junio 2026', 'Julio 2026', 'Agosto 2026', 'Septiembre 2026', 'Octubre 2026', 'Noviembre 2026'];
  const REV = [14200, 15100, 15800, 16400, 17900, 18300, 19600, 17200, 20800, 22400, 23100, 24860];
  const REVP = [11800, 12100, 12500, 13300, 13900, 14600, 15200, 13800, 16100, 16900, 17800, 18400];

  /* ---------- vistas ---------- */
  const V = {};

  V.inicio = () => {
    const open = DEALS.filter(d => d.st !== 'w'), pipe = open.reduce((a, d) => a + d.v, 0);
    return `<section>${hd('Buenos días, Lucía', 'Miércoles 18 de noviembre · tienes 4 reuniones y 7 tareas para hoy.', `<button class="btn s">${I('down')}Exportar</button><button class="btn p" data-new>${I('plus')}Nuevo cliente</button>`)}
    <div class="kpis">
      ${kpi('Ingresos · noviembre', eur(24860), `<span class="up">▲ 12,4 %</span> vs. octubre`, 'euro', 'hero', spark(REV.slice(-8), '#9db7f5'))}
      ${kpi('Pipeline abierto', eur(pipe), `${open.length} oportunidades · ${eur(Math.round(open.reduce((a, d) => a + d.v * STAGES.find(s => s.id === d.st).p / 100, 0)))} ponderado`, 'target', '')}
      ${kpi('Clientes activos', '48', `<span class="up">+3</span> este mes · 2 en riesgo`, 'users', 'ok')}
      ${kpi('Tareas de hoy', '7', `<span class="dn">2 vencidas</span> · 5 a tiempo`, 'check', 'warn')}
    </div>
    <div class="g2">
      <div class="card"><div class="card__h"><h3>Ingresos de los últimos 12 meses</h3><div class="lgd"><span style="--c:#2f5bea"><i></i>2026</span><span style="--c:#c3cee3"><i></i>Año anterior</span></div></div><div class="chart" data-c="rev"></div></div>
      <div class="card"><div class="card__h"><h3>Próximas reuniones</h3><button class="btn s" data-go2="reuniones" style="height:30px;font-size:12px">Ver agenda</button></div><div class="list">
        ${[['10:00', 'Hoy', 'Bodegas Arnau', 'Revisión de propuesta · Meet', 0], ['12:30', 'Hoy', 'Academia Sigma', 'Demo del portal · oficina', 3], ['16:00', 'Hoy', 'Asesoría Duero', 'Cierre de contrato · Meet', 2], ['09:30', 'Jue', 'Gimnasio Pulso', 'Primera llamada', 1]]
        .map(m => `<div class="li"><span class="when">${m[1]}<span>${m[0]}</span></span><div class="grow"><b>${m[2]}</b><small>${m[3]}</small></div>${av(m[4], 'sm')}</div>`).join('')}</div></div>
    </div>
    <div class="g3 mt">
      <div class="card"><div class="card__h"><h3>Actividad reciente</h3></div><div class="list feed">
        ${[['ok', 'check', '<b>Clínica Velarde</b> firmó el contrato · 8.900 €', 'hace 12 min'], ['', 'mail', '<b>Carla</b> envió la newsletter «Cierre de año» a 3.482 contactos', 'hace 1 h'], ['warn', 'inv', 'Factura <b>F-2026-0139</b> vencida hace 3 días · recordatorio enviado', 'hace 2 h'], ['vio', 'spark', 'La IA resumió 6 conversaciones nuevas de WhatsApp', 'hace 3 h']]
        .map(a => `<div class="li"><span class="ico ${a[0]}">${I(a[1])}</span><div class="grow"><p>${a[2]}</p><small>${a[3]}</small></div></div>`).join('')}</div></div>
      <div class="card"><div class="card__h"><h3>Mejores clientes</h3><small class="muted">Facturado en 2026</small></div><div class="list">
        ${[['Hotel Mirador', 31200], ['Logística Avante', 22800], ['Clínica Velarde', 17400], ['Bodegas Arnau', 12900], ['Asesoría Duero', 9600]].map((c, x) => `<div class="li" data-oc="${c[0]}" style="cursor:pointer"><span class="logo" style="--c:${COL[x]}">${ini(c[0])}</span><div class="grow"><b>${c[0]}</b><div class="prob" style="margin-top:6px"><i style="width:${c[1] / 312}%;--c:${COL[x]}"></i></div></div><b class="num">${eur(c[1])}</b></div>`).join('')}</div></div>
      <div class="card"><div class="card__h"><h3>Tareas de hoy</h3><small class="muted">5 de 7</small></div><div class="list" data-tasks>
        ${[['Enviar propuesta a Ópticas Lince', 'Ventas · 11:00', 1, 0], ['Llamar a Veterinaria Nube', 'Seguimiento · vencida', 2, 0], ['Revisar maqueta Hotel Mirador', 'Proyecto · 13:00', 3, 1], ['Preparar demo Academia Sigma', 'Reunión · 12:30', 3, 1], ['Factura mensual Logística Avante', 'Facturación', 0, 0]].map(t => `<label class="li" style="cursor:pointer"><input type="checkbox" ${t[3] ? 'checked' : ''} style="accent-color:#2f5bea;width:16px;height:16px"><div class="grow"><b style="${t[3] ? 'text-decoration:line-through;color:#8b95aa' : ''}">${t[0]}</b><small>${t[1]}</small></div>${av(t[2], 'sm')}</label>`).join('')}</div></div>
    </div></section>`;
  };
  V.inicio.after = () => {
    areaChart($('[data-c="rev"]'), MON, REV, { prev: REVP, full: MONF, id: 'r', max: 30000 });
    $$('[data-tasks] input').forEach(c => c.addEventListener('change', () => { c.nextElementSibling.querySelector('b').style.cssText = c.checked ? 'text-decoration:line-through;color:#8b95aa' : ''; if (c.checked) toast('Tarea completada'); }));
  };

  V.pipeline = () => {
    const tot = DEALS.reduce((a, d) => a + d.v, 0);
    return `<section>${hd('Pipeline de ventas', 'Arrastra una oportunidad para cambiarla de etapa o púlsala para abrir la ficha.', `<div class="seg"><button class="on">Tablero</button><button>Lista</button><button>Previsión</button></div><button class="btn p">${I('plus')}Oportunidad</button>`, DEALS.length + ' abiertas')}
    <div class="bar"><div class="search">${I('filter', 'width:16px;height:16px')}<input placeholder="Filtrar por empresa o sector" data-f></div><div class="seg" data-own><button class="on" data-o="-1">Todo el equipo</button>${[1, 2, 3].map(t => `<button data-o="${t}">${TEAM[t].n.split(' ')[0]}</button>`).join('')}</div><span class="muted" style="margin-left:auto;font-size:12.5px">Total en pipeline <b class="num" style="color:var(--ink)" data-tot>${eur(tot)}</b></span></div>
    <div class="kb">${STAGES.map(s => `<div class="col" data-st="${s.id}" style="--c:${s.c}"><div class="col__h"><i></i><b>${s.n}</b><span data-n></span><em class="num" data-sum></em></div><div class="col__bar"><i data-w></i></div><div data-cards></div></div>`).join('')}</div></section>`;
  };
  V.pipeline.after = () => {
    let own = -1, q = '';
    const draw = () => {
      const vis = DEALS.filter(d => (own < 0 || d.own === own) && (!q || nrm(d.name + d.sec + d.what).includes(q)));
      const mx = Math.max(...STAGES.map(s => vis.filter(d => d.st === s.id).reduce((a, d) => a + d.v, 0)), 1);
      STAGES.forEach(s => {
        const col = $(`.col[data-st="${s.id}"]`), ds = vis.filter(d => d.st === s.id), sum = ds.reduce((a, d) => a + d.v, 0);
        col.querySelector('[data-n]').textContent = ds.length; col.querySelector('[data-sum]').textContent = eur(sum);
        col.querySelector('[data-w]').style.width = sum / mx * 100 + '%';
        col.querySelector('[data-cards]').innerHTML = ds.map(d => `<div class="deal" draggable="true" data-id="${d.id}"><div class="deal__t"><span class="logo" style="--c:${d.c}">${ini(d.name)}</span><div><b>${d.name}</b><small>${d.what}</small></div></div><div class="deal__v num">${eur(d.v)}</div><div class="prob" style="--c:${s.c}"><i style="width:${s.p}%"></i></div><div class="deal__f">${I('clock', 'width:13px;height:13px')}${d.days} día${d.days === 1 ? '' : 's'} · ${s.p} %${av(d.own, 'sm')}</div></div>`).join('');
      });
      $('[data-tot]').textContent = eur(vis.reduce((a, d) => a + d.v, 0));
      $$('.deal').forEach(el => {
        el.addEventListener('dragstart', e => { el.classList.add('drag'); e.dataTransfer.setData('text', el.dataset.id); });
        el.addEventListener('dragend', () => el.classList.remove('drag'));
        el.addEventListener('click', () => openClient(DEALS[+el.dataset.id].name));
      });
    };
    $$('.col').forEach(c => {
      c.addEventListener('dragover', e => { e.preventDefault(); c.classList.add('over'); });
      c.addEventListener('dragleave', () => c.classList.remove('over'));
      c.addEventListener('drop', e => { e.preventDefault(); c.classList.remove('over'); const d = DEALS[+e.dataTransfer.getData('text')]; if (d && d.st !== c.dataset.st) { d.st = c.dataset.st; d.days = 0; draw(); toast(`${d.name} → ${STAGES.find(s => s.id === d.st).n}`); } });
    });
    $$('[data-own] button').forEach(b => b.addEventListener('click', () => { $$('[data-own] button').forEach(x => x.classList.toggle('on', x === b)); own = +b.dataset.o; draw(); }));
    $('[data-f]').addEventListener('input', e => { q = nrm(e.target.value); draw(); });
    draw();
  };

  const CLIENTS = [
    ['Hotel Mirador', 'Elena Campos', 'Turismo', 'act', 31200, 3, 'Hoy', ['VIP', 'Web']],
    ['Logística Avante', 'Raúl Benítez', 'Logística', 'act', 22800, 0, 'Ayer', ['Automatización']],
    ['Clínica Velarde', 'Marta Velarde', 'Salud', 'new', 17400, 1, 'Hace 12 min', ['App']],
    ['Bodegas Arnau', 'Jordi Arnau', 'Vinos', 'act', 12900, 0, 'Hoy', ['Branding', 'E-commerce']],
    ['Asesoría Duero', 'Sonia Prieto', 'Servicios', 'act', 9600, 2, 'Hace 2 días', ['Automatización']],
    ['Academia Sigma', 'Tomás Iglesias', 'Formación', 'new', 6300, 3, 'Hoy', ['Portal']],
    ['Ópticas Lince', 'Nuria Gil', 'Comercio', 'risk', 5100, 2, 'Hace 19 días', ['CRM']],
    ['Café Tranvía', 'Andrés Mora', 'Hostelería', 'act', 4300, 4, 'Hace 4 días', ['Redes']],
    ['Gimnasio Pulso', 'Laura Peña', 'Deporte', 'new', 0, 1, 'Hace 6 días', ['App']],
    ['Inmobiliaria Brezo', 'Iván Rueda', 'Inmobiliaria', 'risk', 3600, 1, 'Hace 24 días', ['Web']],
    ['Veterinaria Nube', 'Paula Serrano', 'Salud', 'act', 2900, 2, 'Hace 3 días', ['WhatsApp']],
    ['Panadería Ortiz', 'Rosa Ortiz', 'Alimentación', 'new', 0, 1, 'Hace 2 días', ['Web']]
  ];
  const STC = { act: ['ok', 'Activo'], new: ['info', 'Nuevo'], risk: ['bad', 'En riesgo'] };
  V.clientes = () => `<section>${hd('Clientes', 'Pulsa una empresa para abrir su ficha: contactos, actividad, facturas y proyectos.', `<button class="btn s">${I('down')}Importar CSV</button><button class="btn p" data-new>${I('plus')}Nuevo cliente</button>`, '48')}
    <div class="bar"><div class="search">${I('filter', 'width:16px;height:16px')}<input placeholder="Buscar por empresa, persona o etiqueta" data-q></div>
    <div class="seg" data-st><button class="on" data-s="">Todos <b>${CLIENTS.length}</b></button><button data-s="act">Activos <b>${CLIENTS.filter(c => c[3] === 'act').length}</b></button><button data-s="new">Nuevos <b>${CLIENTS.filter(c => c[3] === 'new').length}</b></button><button data-s="risk">En riesgo <b>${CLIENTS.filter(c => c[3] === 'risk').length}</b></button></div></div>
    <div class="card np"><table class="tbl"><thead><tr><th><span class="chk"></span></th><th>Empresa</th><th>Estado</th><th>Sector</th><th class="r">Facturado 2026</th><th>Responsable</th><th>Último contacto</th><th>Etiquetas</th><th></th></tr></thead><tbody data-rows></tbody></table></div></section>`;
  V.clientes.after = () => {
    let s = '', q = '';
    const draw = () => {
      $('[data-rows]').innerHTML = CLIENTS.filter(c => (!s || c[3] === s) && (!q || nrm(c.join(' ')).includes(q))).map((c, x) => `<tr class="click" data-cl="${c[0]}" style="cursor:pointer"><td><span class="chk"></span></td><td><div class="who"><span class="logo" style="--c:${COL[x % 8]}">${ini(c[0])}</span><div><b>${c[0]}</b><small>${c[1]}</small></div></div></td><td><span class="pill ${STC[c[3]][0]}"><i></i>${STC[c[3]][1]}</span></td><td class="muted">${c[2]}</td><td class="r num"><b>${c[4] ? eur(c[4]) : '—'}</b></td><td>${av(c[5], 'sm')}</td><td class="muted">${c[6]}</td><td>${c[7].map(t => `<span class="pill" style="margin-right:4px">${t}</span>`).join('')}</td><td><button class="ibtn" style="width:28px;height:28px">${I('dots', 'width:16px;height:16px')}</button></td></tr>`).join('') || `<tr><td colspan="9" class="muted" style="text-align:center;padding:30px">Sin resultados</td></tr>`;
      $$('[data-cl]').forEach(r => r.addEventListener('click', () => openClient(r.dataset.cl)));
    };
    $$('[data-st] button').forEach(b => b.addEventListener('click', () => { $$('[data-st] button').forEach(x => x.classList.toggle('on', x === b)); s = b.dataset.s; draw(); }));
    $('[data-q]').addEventListener('input', e => { q = nrm(e.target.value); draw(); });
    draw();
  };

  const EVS = [
    [0, 9, 1, 'Equipo · planificación semanal', 'Sala grande', '#64748b', 0, 'interno'],
    [0, 11.5, 1, 'Café Tranvía', 'Campaña de Navidad · Meet', '#db2777', 4],
    [0, 15, 1.5, 'Hotel Mirador', 'Revisión de maqueta', '#2f5bea', 3],
    [1, 10, 1, 'Ópticas Lince', 'Presentar propuesta', '#7c5cff', 2],
    [1, 13, 1, 'Comida con Raúl (Avante)', 'Restaurante', '#0891b2', 0],
    [1, 16.5, 1, 'Veterinaria Nube', 'Llamada de seguimiento', '#5b8cff', 2],
    [2, 10, 1, 'Bodegas Arnau', 'Revisión de propuesta · Meet', '#e8590c', 0],
    [2, 12.5, 1.5, 'Academia Sigma', 'Demo del portal · oficina', '#7c5cff', 3],
    [2, 16, 1, 'Asesoría Duero', 'Cierre de contrato · Meet', '#12a26b', 2],
    [3, 9.5, 1, 'Gimnasio Pulso', 'Primera llamada', '#5b8cff', 1],
    [3, 12, 2, 'Taller de diseño', 'Hotel Mirador · fotos', '#2f5bea', 3],
    [3, 17, 1, 'Panadería Ortiz', 'Descubrimiento', '#8b95aa', 1],
    [4, 9, 1, 'Logística Avante', 'Informe mensual', '#0891b2', 0],
    [4, 11, 1, 'Inmobiliaria Brezo', 'Recuperar cliente', '#e5484d', 1],
    [4, 15, 1, 'Retro del equipo', 'Sala grande', '#64748b', 0, 'interno']
  ];
  const DAYS = [['Lun', 16], ['Mar', 17], ['Mié', 18], ['Jue', 19], ['Vie', 20]];
  const hh = h => `${Math.floor(h)}:${h % 1 ? '30' : '00'}`;
  V.reuniones = () => `<section>${hd('Reuniones', 'Semana del 16 al 20 de noviembre · sincronizado con Google Calendar.', `<div class="seg"><button>Día</button><button class="on">Semana</button><button>Mes</button></div><button class="btn p">${I('plus')}Agendar</button>`, '15 esta semana')}
    <div class="calw"><div class="cal"><div class="cal__dh" style="border-left:0"></div>${DAYS.map((d, i) => `<div class="cal__dh ${i === 2 ? 'today' : ''}">${d[0]}<b>${d[1]}</b></div>`).join('')}
      <div class="cal__hrs">${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => `<span>${h}:00</span>`).join('')}</div>
      ${DAYS.map((d, di) => `<div class="cal__day" style="height:560px">${EVS.map((e, x) => [e, x]).filter(([e]) => e[0] === di).map(([e, x]) => `<div class="ev" data-ev="${x}" style="--c:${e[5]};top:${(e[1] - 8) * 56 + 2}px;height:${e[2] * 56 - 4}px"><b>${e[3]}</b>${hh(e[1])} · ${e[4]}</div>`).join('')}${di === 2 ? `<div class="now" style="top:${(11.2 - 8) * 56}px"></div>` : ''}</div>`).join('')}
    </div><div class="card mdet" data-det></div></div></section>`;
  V.reuniones.after = () => {
    const show = x => {
      const e = EVS[x]; $$('.ev').forEach(v => v.classList.toggle('sel', +v.dataset.ev === x));
      $('[data-det]').innerHTML = `<span class="pill" style="background:color-mix(in srgb,${e[5]} 12%,#fff);color:${e[5]}"><i></i>${e[7] ? 'Interno' : 'Cliente'}</span><h2>${e[3]}</h2><p class="muted" style="font-size:13px">${e[4]}</p>
        <div class="row">${I('clock')}${DAYS[e[0]][0]} ${DAYS[e[0]][1]} nov · ${hh(e[1])} – ${hh(e[1] + e[2])}</div>
        <div class="row">${I(e[4].includes('Meet') ? 'video' : 'pin')}${e[4].includes('Meet') ? 'Videollamada · enlace en la invitación' : 'Calle del Puerto 14, 2.º'}</div>
        <div class="row">${I('users')}<div class="avs">${av(e[6], 'sm')}${av((e[6] + 2) % 5, 'sm')}</div>${e[7] ? 'Todo el equipo' : '+ 2 del cliente'}</div>
        <ul class="agenda"><b style="font-size:12px;color:var(--t3);letter-spacing:.08em;text-transform:uppercase">Orden del día</b>${['Repaso de lo acordado la última vez', 'Dudas sobre plazos y presupuesto', 'Siguientes pasos y responsable'].map(a => `<li>${a}</li>`).join('')}</ul>
        <div style="display:flex;gap:8px;margin-top:16px"><button class="btn p" data-join>${I('video')}Unirse</button><button class="btn s">Acta con IA</button></div>`;
      const j = $('[data-join]'); j && j.addEventListener('click', () => toast('Abriendo la videollamada (demo)'));
    };
    $$('.ev').forEach(v => v.addEventListener('click', () => show(+v.dataset.ev)));
    show(7);
  };

  const PROJ = [
    ['Web + reservas', 'Hotel Mirador', 0, 5.5, 68, '#2f5bea', 3, 'Diseño aprobado'],
    ['App de citas', 'Clínica Velarde', 2, 8, 22, '#12a26b', 1, 'Sprint 1'],
    ['Albaranes automáticos', 'Logística Avante', 0, 3.2, 92, '#0891b2', 0, 'En pruebas'],
    ['Branding + tienda', 'Bodegas Arnau', 3.5, 8, 0, '#e8590c', 4, 'Pendiente de firma'],
    ['Campaña Navidad', 'Café Tranvía', 1.5, 4.5, 55, '#db2777', 4, 'Contenido listo'],
    ['Portal de alumnos', 'Academia Sigma', 4, 7.6, 0, '#7c5cff', 3, 'Propuesta'],
    ['Facturas con IA', 'Asesoría Duero', 2.5, 5, 30, '#ca8a04', 2, 'Integración']
  ];
  V.proyectos = () => `<section>${hd('Proyectos', 'Plazos, responsables y avance real de cada entrega. La línea roja es hoy.', `<div class="seg"><button class="on">Cronograma</button><button>Tablero</button><button>Carga del equipo</button></div><button class="btn p">${I('plus')}Proyecto</button>`, '7 en curso')}
    <div class="kpis">${kpi('En plazo', '5 de 7', 'Avance medio 38 %', 'check', 'ok')}${kpi('Horas esta semana', '126 h', '82 % de la capacidad', 'clock')}${kpi('Entregas próximas', '3', 'Avante · viernes 20', 'target', 'vio')}${kpi('Con retraso', '1', '<span class="dn">Asesoría Duero · 4 días</span>', 'alert', 'warn')}</div>
    <div class="gantt"><div class="gt"><div class="gt__n" style="min-height:0;padding:12px 16px;font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t3)">Proyecto</div><div class="gt__h">${['S45 · 2 nov', 'S46 · 9 nov', 'S47 · 16 nov', 'S48 · 23 nov', 'S49 · 30 nov', 'S50 · 7 dic', 'S51 · 14 dic', 'S52 · 21 dic'].map((w, i) => `<span class="${i === 2 ? 'cur' : ''}">${w}</span>`).join('')}</div>
    ${PROJ.map((p, pi) => `<div class="gt__n"><span class="logo" style="--c:${p[5]}">${ini(p[1])}</span><div><b>${p[0]}</b><small>${p[1]} · ${p[7]}</small></div></div><div class="gt__r"><div class="gbar" style="--c:${p[5]};left:${p[2] / 8 * 100}%;width:${(p[3] - p[2]) / 8 * 100}%"><i style="width:${SHOT ? p[4] : 0}%" data-pw="${p[4]}"></i><span>${p[4]} %</span>${av(p[6], 'sm')}</div>${p[2] < 3 && p[3] > 3 ? `<span class="ms" style="left:calc(${p[3] / 8 * 100}% + 6px)" title="Entrega"></span>` : ''}<div class="gnow ${pi ? '' : 'lbl'}" style="left:${2.4 / 8 * 100}%"></div></div>`).join('')}
    </div></div></section>`;
  V.proyectos.after = () => requestAnimationFrame(() => setTimeout(() => $$('[data-pw]').forEach(i => i.style.width = i.dataset.pw + '%'), 60));

  const INV = [
    ['F-2026-0148', 'Hotel Mirador', '15 nov', '15 dic', 4840, 'pend'], ['F-2026-0147', 'Logística Avante', '14 nov', '14 dic', 1980, 'paid'],
    ['F-2026-0146', 'Clínica Velarde', '12 nov', '12 dic', 2967, 'paid'], ['F-2026-0145', 'Café Tranvía', '10 nov', '25 nov', 1210, 'pend'],
    ['F-2026-0144', 'Bodegas Arnau', '05 nov', '05 dic', 3630, 'paid'], ['F-2026-0139', 'Ópticas Lince', '15 oct', '15 nov', 1452, 'late'],
    ['F-2026-0137', 'Inmobiliaria Brezo', '10 oct', '09 nov', 968, 'late'], ['F-2026-0149', 'Asesoría Duero', '—', '—', 2420, 'draft']
  ];
  const IST = { paid: ['ok', 'Pagada'], pend: ['info', 'Pendiente'], late: ['bad', 'Vencida'], draft: ['', 'Borrador'] };
  V.facturas = () => `<section>${hd('Facturación', 'Facturas con numeración legal, cobro con tarjeta o transferencia y recordatorios automáticos.', `<button class="btn s">${I('down')}Exportar a la gestoría</button><button class="btn p">${I('plus')}Nueva factura</button>`)}
    <div class="kpis">${kpi('Facturado · noviembre', eur(24860), '<span class="up">▲ 12,4 %</span> vs. octubre', 'euro', 'hero', spark(REV.slice(-8), '#9db7f5'))}${kpi('Cobrado', eur(18577), '75 % de lo facturado', 'check', 'ok')}${kpi('Pendiente', eur(6050), '2 facturas · vencen en dic.', 'clock')}${kpi('Vencido', eur(2420), '<span class="dn">2 facturas</span> · recordatorio enviado', 'alert', 'warn')}</div>
    <div class="g2"><div class="card np" style="padding:6px 8px"><table class="tbl"><thead><tr><th>Factura</th><th>Cliente</th><th>Emitida</th><th>Vence</th><th class="r">Importe</th><th>Estado</th><th></th></tr></thead><tbody>
      ${INV.map((f, x) => `<tr><td class="num"><b>${f[0]}</b></td><td><div class="who"><span class="logo" style="--c:${COL[x % 8]};width:24px;height:24px;font-size:9.5px;border-radius:7px">${ini(f[1])}</span>${f[1]}</div></td><td class="muted">${f[2]}</td><td class="muted">${f[3]}</td><td class="r num"><b>${eur(f[4])}</b></td><td><span class="pill ${IST[f[5]][0]}"><i></i>${IST[f[5]][1]}</span></td><td>${f[5] === 'late' ? `<button class="btn s" data-remind style="height:28px;font-size:12px">Recordar</button>` : f[5] === 'draft' ? `<button class="btn s" data-emit style="height:28px;font-size:12px">Emitir</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="card"><div class="card__h"><h3>Cobrado vs. pendiente</h3><div class="lgd"><span style="--c:#2f5bea"><i></i>Cobrado</span><span style="--c:#c9d6f7"><i></i>Pendiente</span></div></div><div data-bars></div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)"><div class="kv"><span>Días medios de cobro</span><b>11,4 días</b></div><div class="kv"><span>Cobros con tarjeta</span><b>62 %</b></div><div class="kv"><span>IVA repercutido (trim.)</span><b class="num">${eur(12740)}</b></div></div></div></div></section>`;
  V.facturas.after = () => {
    const D = [['Jun', 19600, 0], ['Jul', 17200, 0], ['Ago', 20800, 0], ['Sep', 21900, 500], ['Oct', 21400, 1700], ['Nov', 18577, 6283]];
    const W = 340, H = 190, bw = 30, mx = 26000;
    $('[data-bars]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%">${D.map((d, i) => { const x = 20 + i * 54, h1 = d[1] / mx * 160, h2 = d[2] / mx * 160; return `<rect x="${x}" y="${170 - h1}" width="${bw}" height="${h1}" rx="6" fill="#2f5bea"/>${h2 ? `<rect x="${x}" y="${170 - h1 - h2 - 3}" width="${bw}" height="${h2}" rx="6" fill="#c9d6f7"/>` : ''}<text x="${x + bw / 2}" y="186" text-anchor="middle" font-size="10.5" fill="#8b95aa">${d[0]}</text>`; }).join('')}</svg>`;
    $$('[data-remind]').forEach(b => b.addEventListener('click', () => { b.textContent = 'Enviado'; b.disabled = true; toast('Recordatorio enviado por email y WhatsApp'); }));
    $$('[data-emit]').forEach(b => b.addEventListener('click', () => { const p = b.closest('tr').querySelector('.pill'); p.className = 'pill info'; p.innerHTML = '<i></i>Pendiente'; b.remove(); toast('Factura F-2026-0149 emitida y enviada'); }));
  };

  V.suscripciones = () => `<section>${hd('Suscripciones', 'Cuotas mensuales de mantenimiento cobradas automáticamente con Stripe.', `<button class="btn s"><img src="../assets/logos/stripe.svg" alt="" style="width:15px;height:15px">Abrir en Stripe</button><button class="btn p">${I('plus')}Nuevo plan</button>`)}
    <div class="kpis">${kpi('MRR', eur(9840), '<span class="up">▲ 1.200 €</span> este mes', 'trend', 'hero', spark([6200, 6900, 7300, 7800, 8100, 8640, 9840], '#9db7f5'))}${kpi('Suscripciones activas', '41', '<span class="up">+6</span> altas · 2 bajas', 'card', 'ok')}${kpi('Churn mensual', '2,1 %', 'Objetivo < 3 %', 'users', 'vio')}${kpi('Cobros fallidos', '1', 'Reintento automático mañana', 'alert', 'warn')}</div>
    <div class="g2e"><div class="card"><div class="card__h"><h3>Movimiento del MRR · noviembre</h3></div><div data-wf></div></div>
    <div class="card"><div class="card__h"><h3>Reparto por plan</h3></div><div style="display:flex;align-items:center;gap:24px"><div data-donut></div><div style="flex:1" class="list">${[['Básico', 29, 14, '#9db7f5'], ['Pro', 79, 19, '#2f5bea'], ['Empresa', 199, 8, '#0a1633']].map(p => `<div class="li"><i style="width:10px;height:10px;border-radius:3px;background:${p[3]}"></i><div class="grow"><b>${p[0]} · ${p[1]} €/mes</b><small>${p[2]} clientes</small></div><b class="num">${eur(p[1] * p[2])}</b></div>`).join('')}</div></div></div></div>
    <div class="card np mt"><table class="tbl"><thead><tr><th>Cliente</th><th>Plan</th><th>Desde</th><th>Próximo cobro</th><th>Método</th><th class="r">Importe</th><th>Estado</th></tr></thead><tbody>
      ${[['Hotel Mirador', 'Empresa', 'mar 2025', '1 dic', 'Visa ···· 4242', 199, 'ok'], ['Logística Avante', 'Empresa', 'ene 2026', '1 dic', 'SEPA ···· 0217', 199, 'ok'], ['Clínica Velarde', 'Pro', 'nov 2026', '12 dic', 'Mastercard ···· 8810', 79, 'trial'], ['Café Tranvía', 'Básico', 'jun 2025', '25 nov', 'Visa ···· 1881', 29, 'ok'], ['Inmobiliaria Brezo', 'Pro', 'feb 2026', 'reintento 19 nov', 'Visa ···· 3005', 79, 'fail']]
      .map((s, x) => `<tr><td><div class="who"><span class="logo" style="--c:${COL[x]}">${ini(s[0])}</span><b>${s[0]}</b></div></td><td><span class="pill ${s[1] === 'Empresa' ? 'vio' : s[1] === 'Pro' ? 'info' : ''}">${s[1]}</span></td><td class="muted">${s[2]}</td><td class="muted">${s[3]}</td><td class="muted">${s[4]}</td><td class="r num"><b>${eur(s[5])}</b>/mes</td><td><span class="pill ${s[6] === 'ok' ? 'ok' : s[6] === 'trial' ? 'info' : 'bad'}"><i></i>${s[6] === 'ok' ? 'Activa' : s[6] === 'trial' ? 'Prueba · 14 días' : 'Cobro fallido'}</span></td></tr>`).join('')}
    </tbody></table></div></section>`;
  V.suscripciones.after = () => {
    const M = [['MRR inicio', 8640, 'b'], ['Altas', 680, 'u'], ['Mejoras', 760, 'u'], ['Bajadas', -120, 'd'], ['Bajas', -120, 'd'], ['MRR final', 9840, 'b']];
    const W = 420, H = 200, mn = 8000, mx = 10200, y = v => 170 - (v - mn) / (mx - mn) * 150;
    let acc = 0, out = '';
    M.forEach((m, i) => {
      const x = 14 + i * 68, w = 46; let y1, y2, c;
      if (m[2] === 'b') { y1 = y(m[1]); y2 = 170; acc = m[1]; c = '#0a1633'; } else { const a = acc; acc += m[1]; y1 = y(Math.max(a, acc)); y2 = y(Math.min(a, acc)); c = m[1] > 0 ? '#12a26b' : '#e5484d'; }
      out += `<rect x="${x}" y="${y1}" width="${w}" height="${Math.max(2, y2 - y1)}" rx="6" fill="${c}"/><text x="${x + w / 2}" y="${y1 - 6}" text-anchor="middle" font-size="11" font-weight="600" fill="#0b1324">${m[2] === 'b' ? k(m[1]) : (m[1] > 0 ? '+' : '−') + Math.abs(m[1])}</text><text x="${x + w / 2}" y="190" text-anchor="middle" font-size="10" fill="#8b95aa">${m[0]}</text>`;
    });
    $('[data-wf]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%">${out}</svg>`;
    const parts = [[14 * 29, '#9db7f5'], [19 * 79, '#2f5bea'], [8 * 199, '#0a1633']], T = parts.reduce((a, p) => a + p[0], 0);
    let a0 = -Math.PI / 2; const R = 62, r = 40;
    const arcs = parts.map(([v, c]) => { const a1 = a0 + v / T * Math.PI * 2, L = a1 - a0 > Math.PI ? 1 : 0; const p = (a, rr) => `${70 + rr * Math.cos(a)},${70 + rr * Math.sin(a)}`; const d = `M${p(a0, R)}A${R},${R} 0 ${L} 1 ${p(a1, R)}L${p(a1, r)}A${r},${r} 0 ${L} 0 ${p(a0, r)}Z`; a0 = a1 + .02; return `<path d="${d}" fill="${c}"/>`; }).join('');
    $('[data-donut]').innerHTML = `<svg viewBox="0 0 140 140" width="150">${arcs}<text x="70" y="68" text-anchor="middle" font-size="17" font-weight="700" fill="#0b1324">41</text><text x="70" y="84" text-anchor="middle" font-size="9.5" fill="#8b95aa">clientes</text></svg>`;
  };

  const WA = '<img src="../assets/logos/whatsapp.svg" alt="" style="width:16px;height:16px;border-radius:5px;position:absolute;left:34px;top:34px;box-shadow:0 0 0 2px #fff;background:#fff">';
  const CH = { wa: WA, mail: `<span class="ch" style="background:#2f5bea"><svg viewBox="0 0 24 24"><path d="M3 6l9 6 9-6v12H3z"/></svg></span>`, web: `<span class="ch" style="background:#0a1633"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg></span>` };
  const CONV = [
    ['Elena Campos', 'Hotel Mirador', 'wa', '¿Podemos ver la web nueva antes del viernes?', '11:02', 1, 3, [['¡Hola! ¿Cómo va la web? Queremos enseñarla en la reunión de socios', 0, '10:41'], ['Hola Elena, va muy bien: el diseño está aprobado y estamos montando el motor de reservas.', 1, '10:52'], ['Genial. ¿Podemos ver la web nueva antes del viernes?', 0, '11:02']]],
    ['Rosa Ortiz', 'Panadería Ortiz', 'web', 'Formulario: quiero vender por internet los encargos', '10:15', 1, 1, [['Hola, tenemos una panadería con 2 locales y queremos que la gente pueda hacer encargos por internet y pagar al recoger. ¿Cuánto costaría?', 0, '10:15']]],
    ['Nuria Gil', 'Ópticas Lince', 'mail', 'Re: Propuesta CRM + fidelización', '09:48', 1, 2, [['Hemos revisado la propuesta. ¿Se puede empezar solo con la parte de fidelización?', 0, '09:48']]],
    ['Raúl Benítez', 'Logística Avante', 'wa', 'Perfecto, el informe nos sirve 👍', 'Ayer', 0, 0, [['Os paso el informe de octubre: 1.284 albaranes procesados solos.', 1, 'Ayer'], ['Perfecto, el informe nos sirve 👍', 0, 'Ayer']]],
    ['Tomás Iglesias', 'Academia Sigma', 'mail', 'Confirmo la demo del miércoles a las 12:30', 'Ayer', 0, 3, [['Confirmo la demo del miércoles a las 12:30. Vendremos dos personas.', 0, 'Ayer']]],
    ['Laura Peña', 'Gimnasio Pulso', 'wa', '¿La app funcionaría también en tablets?', 'Lun', 0, 1, [['¿La app funcionaría también en tablets? Tenemos una en recepción.', 0, 'Lun']]]
  ];
  const AIR = ['¡Claro, Elena! El jueves a las 17:00 te enviamos un enlace privado para verla desde el móvil o el ordenador. Si te viene bien, la repasamos juntos 15 minutos por videollamada.', 'Hola Rosa, gracias por escribirnos. Con dos locales lo ideal es una web con encargos y pago al recoger. ¿Te va bien una llamada de 20 minutos el jueves para ver cuántos encargos tenéis al día?', 'Hola Nuria, sí: podemos empezar por la fidelización (tarjeta de puntos y avisos por WhatsApp) y añadir el CRM después. Te preparo la propuesta separada hoy.', 'Gracias, Raúl. El próximo informe llegará el 1 de diciembre.', 'Perfecto, Tomás. Os esperamos el miércoles a las 12:30 en la oficina.', 'Sí, Laura: la app se adapta a tablets. En recepción puede quedar en modo «registro de entradas».'];
  V.mensajes = () => `<section>${hd('Mensajes', 'WhatsApp, email y el formulario web en una sola bandeja. La IA propone la respuesta; tú decides.', `<div class="seg"><button class="on">Todos <b>6</b></button><button>Sin leer <b>3</b></button><button>Míos</button></div>`)}
    <div class="inbox"><div class="ib__l">${CONV.map((c, x) => `<div class="ib__it ${c[5] ? 'unread' : ''}" data-cv="${x}"><span class="logo" style="--c:${COL[x]};width:38px;height:38px;border-radius:12px;font-size:12.5px">${ini(c[1])}</span>${CH[c[2]]}<div class="grow"><b>${c[0]}<small>${c[4]}</small></b><small class="muted" style="font-size:11.5px">${c[1]}</small><p>${c[3]}</p></div></div>`).join('')}</div>
    <div class="ib__c" data-cc></div><div class="ib__r" data-cr></div></div></section>`;
  V.mensajes.after = () => {
    const open = x => {
      const c = CONV[x]; $$('[data-cv]').forEach(e => e.classList.toggle('on', +e.dataset.cv === x)); $(`[data-cv="${x}"]`).classList.remove('unread');
      const d = DEALS.find(dd => dd.name === c[1]);
      $('[data-cc]').innerHTML = `<div class="ib__ch"><span class="logo" style="--c:${COL[x]};width:36px;height:36px;border-radius:12px">${ini(c[1])}</span><div><b>${c[0]}</b><small>${c[1]} · vía ${c[2] === 'wa' ? 'WhatsApp' : c[2] === 'mail' ? 'email' : 'formulario web'}</small></div><div style="margin-left:auto;display:flex;gap:6px"><button class="ibtn">${I('phone')}</button><button class="ibtn">${I('dots')}</button></div></div>
        <div class="ib__msgs" data-ms>${c[7].map(m => `<div class="msg ${m[1] ? 'me' : ''}">${m[0]}<small>${m[2]}</small></div>`).join('')}</div>
        <div class="ai" data-ai><div class="ai__h">${I('spark', 'width:14px;height:14px')}RESPUESTA SUGERIDA</div><span data-ait><span class="typing"><i></i><i></i><i></i></span></span><div class="ai__b"><button class="btn p" data-use style="height:30px;font-size:12px">Usar respuesta</button><button class="btn s" data-alt style="height:30px;font-size:12px">Otra versión</button></div></div>
        <div class="ib__in"><input placeholder="Escribe un mensaje…" data-in><button class="btn p" data-send style="height:34px">${I('send')}</button></div>`;
      $('[data-cr]').innerHTML = `<div style="text-align:center"><span class="logo" style="--c:${COL[x]};width:56px;height:56px;border-radius:18px;font-size:18px;margin:0 auto 10px">${ini(c[1])}</span><b style="font-size:15px">${c[1]}</b><p class="muted" style="font-size:12.5px">${c[0]}</p></div>
        <h4>Oportunidad</h4>${d ? `<div class="kv"><span>Etapa</span><span class="pill" style="color:${STAGES.find(s => s.id === d.st).c}">${STAGES.find(s => s.id === d.st).n}</span></div><div class="kv"><span>Valor</span><b class="num">${eur(d.v)}</b></div><div class="kv"><span>Proyecto</span><b>${d.what}</b></div>` : '<p class="muted" style="font-size:12.5px">Sin oportunidad abierta</p>'}
        <div class="kv"><span>Responsable</span>${av(c[6], 'sm')}</div>
        <h4>Resumen IA</h4><p style="font-size:12.5px;color:var(--t2)">${x === 0 ? 'Cliente muy implicado. Quiere enseñar la web a sus socios el viernes. Tono cercano.' : x === 1 ? 'Lead nuevo con 2 locales. Busca encargos online. Presupuesto aún sin definir.' : 'Conversación activa. Responder en menos de 24 h.'}</p>
        <h4>Etiquetas</h4><div style="display:flex;gap:5px;flex-wrap:wrap">${(CLIENTS.find(cc => cc[0] === c[1]) || [, , , , , , , ['Lead']])[7].map(t => `<span class="pill">${t}</span>`).join('')}</div>`;
      const ait = $('[data-ait]'), ms = $('[data-ms]'), inp = $('[data-in]');
      const write = t => { if (SHOT) { ait.textContent = t; return; } ait.textContent = ''; let i = 0; const s = setInterval(() => { ait.textContent = t.slice(0, i += 3); if (i >= t.length) clearInterval(s); }, 16); };
      setTimeout(() => write(AIR[x]), SHOT ? 0 : 700);
      $('[data-use]').addEventListener('click', () => { inp.value = AIR[x]; inp.focus(); });
      $('[data-alt]').addEventListener('click', () => write(AIR[x].replace(/^(¡Claro, |Hola |Gracias, |Perfecto, |Sí, )/, 'Buenas, ')));
      const send = () => { if (!inp.value.trim()) return; ms.insertAdjacentHTML('beforeend', `<div class="msg me">${inp.value.replace(/</g, '&lt;')}<small>Ahora · enviado</small></div>`); inp.value = ''; ms.scrollTop = 1e5; $('[data-ai]').style.display = 'none'; toast('Mensaje enviado (demo)'); };
      $('[data-send]').addEventListener('click', send); inp.addEventListener('keydown', e => e.key === 'Enter' && send());
    };
    $$('[data-cv]').forEach(e => e.addEventListener('click', () => open(+e.dataset.cv)));
    open(0);
  };

  V.newsletter = () => `<section>${hd('Newsletter', 'Campañas a tus contactos segmentados por etapa, sector o etiqueta. Con estadísticas por persona.', `<button class="btn s">Segmentos</button><button class="btn p">${I('plus')}Nueva campaña</button>`)}
    <div class="kpis">${kpi('Suscriptores', '3.482', '<span class="up">+214</span> este mes', 'users', 'hero', spark([2600, 2750, 2890, 3010, 3150, 3268, 3482], '#9db7f5'))}${kpi('Apertura media', '46,8 %', 'Sector: 21 %', 'mail', 'ok')}${kpi('Clics', '7,9 %', '<span class="up">▲ 1,2 pts</span>', 'upr')}${kpi('Bajas', '0,3 %', '11 este mes', 'users', 'warn')}</div>
    <div class="nl"><div class="card np" style="padding:6px 8px"><table class="tbl"><thead><tr><th>Campaña</th><th>Segmento</th><th>Enviada</th><th>Apertura</th><th>Clics</th><th>Estado</th></tr></thead><tbody>
      ${[['Cierre de año: lo que hemos aprendido', 'Todos', '18 nov', 52, 9.4, 'ok'], ['5 automatizaciones para Navidad', 'Comercio y hostelería', '4 nov', 48, 8.1, 'ok'], ['Caso: 1.284 albaranes sin tocar', 'Logística', '21 oct', 44, 11.2, 'ok'], ['Novedades de octubre', 'Clientes', '7 oct', 61, 6.3, 'ok'], ['Plantilla de presupuesto gratis', 'Leads', 'Programada · 25 nov', 0, 0, 'sch'], ['Encuesta de satisfacción', 'Clientes', '—', 0, 0, 'draft']]
      .map(c => `<tr><td><b>${c[0]}</b></td><td class="muted">${c[1]}</td><td class="muted">${c[2]}</td><td>${c[3] ? `<div class="rate" style="width:120px"><div class="b"><i style="width:${c[3]}%"></i></div><b class="num">${c[3]} %</b></div>` : '—'}</td><td class="num">${c[4] ? String(c[4]).replace('.', ',') + ' %' : '—'}</td><td><span class="pill ${c[5] === 'ok' ? 'ok' : c[5] === 'sch' ? 'info' : ''}"><i></i>${c[5] === 'ok' ? 'Enviada' : c[5] === 'sch' ? 'Programada' : 'Borrador'}</span></td></tr>`).join('')}
    </tbody></table></div>
    <div class="card"><div class="card__h"><h3>Vista previa</h3><div class="seg"><button class="on">Escritorio</button><button>Móvil</button></div></div><div class="mail"><div class="mail__in"><div class="mail__hero"><small>Estudio Marea · noviembre</small><b>Cierre de año: lo que hemos aprendido automatizando 40 negocios</b></div><div class="mail__body">Hola {{nombre}}, este año hemos ayudado a panaderías, clínicas y hoteles a quitarse horas de trabajo repetitivo…<div class="ln" style="width:92%"></div><div class="ln" style="width:80%"></div><div class="ln" style="width:86%"></div><button class="btn p">Leer el resumen</button></div></div></div>
      <div style="margin-top:14px">${[['Abrieron', 52, '#2f5bea'], ['Hicieron clic', 9.4, '#7c5cff'], ['Respondieron', 2.1, '#12a26b']].map(r => `<div class="rate" style="--c:${r[2]};margin-bottom:8px"><span style="width:96px">${r[0]}</span><div class="b"><i style="width:${r[1]}%"></i></div><b class="num" style="width:44px;text-align:right">${String(r[1]).replace('.', ',')} %</b></div>`).join('')}</div></div></div></section>`;

  V.analitica = () => `<section>${hd('Analítica', 'De dónde vienen tus clientes, cuántos se convierten y cuánto se quedan.', `<div class="seg"><button>30 días</button><button class="on">Este año</button><button>Todo</button></div>`)}
    <div class="kpis">${kpi('Tasa de cierre', '38,9 %', '<span class="up">▲ 4,1 pts</span> vs. 2025', 'target', 'hero')}${kpi('Ticket medio', eur(6840), '<span class="up">▲ 9 %</span>', 'euro')}${kpi('Ciclo de venta', '23 días', 'De lead a firma', 'clock', 'vio')}${kpi('Coste por lead', '18 €', 'Google + LinkedIn', 'chart', 'ok')}</div>
    <div class="g2"><div class="card"><div class="card__h"><h3>Embudo de conversión</h3><small>Ene – nov 2026</small></div><div class="fun">${[['Visitas a la web', 12480, 100], ['Leads', 642, 72], ['Reuniones', 118, 52], ['Propuestas', 54, 36], ['Clientes ganados', 21, 24]].map((f, i, a) => `<div class="fun__r"><span>${f[0]}</span><div class="fun__b"><i style="width:${SHOT ? f[2] : 0}%" data-fw="${f[2]}"></i><span>${fmt(f[1])}</span></div><span class="muted num" style="font-size:12px">${i ? (f[1] / a[i - 1][1] * 100).toFixed(1).replace('.', ',') + ' %' : ''}</span></div>`).join('')}</div></div>
    <div class="card"><div class="card__h"><h3>Origen de los clientes</h3></div><div class="list">${[['Recomendación', 34, '#12a26b'], ['Google', 27, '#2f5bea'], ['LinkedIn', 19, '#0a66c2'], ['Instagram', 12, '#db2777'], ['Eventos', 8, '#ca8a04']].map(s => `<div class="rate" style="--c:${s[2]};padding:8px 0"><span style="width:110px">${s[0]}</span><div class="b" style="height:8px"><i style="width:${s[1] * 2.6}%"></i></div><b class="num" style="width:40px;text-align:right">${s[1]} %</b></div>`).join('')}</div></div></div>
    <div class="g2 mt"><div class="card"><div class="card__h"><h3>Retención de clientes por mes de alta</h3><small>% que sigue pagando</small></div><div class="coh"><span></span>${['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => `<span>${m}</span>`).join('')}
      ${[['Abr', [100, 96, 93, 91, 90, 88, 88]], ['May', [100, 97, 94, 92, 91, 90]], ['Jun', [100, 95, 92, 90, 89]], ['Jul', [100, 98, 95, 94]], ['Ago', [100, 96, 94]], ['Sep', [100, 97]], ['Oct', [100]]].map(r => `<em>${r[0]}</em>${Array.from({ length: 7 }, (_, i) => r[1][i] ? `<b style="background:rgba(47,91,234,${(r[1][i] - 80) / 22});color:${r[1][i] > 93 ? '#fff' : '#13285a'}">${r[1][i]}</b>` : '<b style="background:#f5f7fb"></b>').join('')}`).join('')}</div></div>
    <div class="card"><div class="card__h"><h3>Ventas por persona</h3></div><div class="list">${[[1, 46800, 9, 41], [0, 38200, 5, 45], [2, 21300, 4, 33], [3, 12600, 3, 30]].map(p => `<div class="li">${av(p[0])}<div class="grow"><b>${TEAM[p[0]].n}</b><small>${p[2]} cierres · ${p[3]} % de cierre</small></div><b class="num">${eur(p[1])}</b></div>`).join('')}</div></div></div></section>`;
  V.analitica.after = () => setTimeout(() => $$('[data-fw]').forEach(i => i.style.width = i.dataset.fw + '%'), 60);

  const PERMS = ['Ver facturación', 'Editar clientes', 'Exportar datos', 'Administrar'];
  const PM = [[1, 1, 1, 1], [0, 1, 1, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0]];
  V.equipo = () => `<section>${hd('Equipo y permisos', 'Cada persona ve solo lo que necesita. Todo queda registrado.', `<button class="btn s">${I('file')}Registro de actividad</button><button class="btn p" data-inv>${I('plus')}Invitar</button>`, '5 de 10 plazas')}
    <div class="card np"><table class="tbl"><thead><tr><th>Persona</th><th>Rol</th>${PERMS.map(p => `<th class="c">${p}</th>`).join('')}<th>Último acceso</th></tr></thead><tbody>
      ${TEAM.map((t, x) => `<tr><td><div class="who"><span class="avw">${av(x)}${t.on ? '<i class="online"></i>' : ''}</span><div><b>${t.n}</b><small>${t.mail}</small></div></div></td><td><span class="pill ${x ? '' : 'vio'}">${t.r}</span></td>${PM[x].map((v, j) => `<td class="c"><span class="perm ${v ? 'on' : ''}" ${x ? `data-pm="${x},${j}" style="cursor:pointer"` : 'title="La propietaria tiene todos los permisos" style="opacity:.6"'}></span></td>`).join('')}<td class="muted">${t.on ? 'En línea' : ['', '', 'Hace 2 h', '', 'Ayer'][x]}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="g3 mt"><div class="card"><div class="card__h"><h3>Invitaciones pendientes</h3></div><div class="list" data-invs><div class="li"><span class="av c6">JM</span><div class="grow"><b>javier@estudiomarea.test</b><small>Proyectos · enviada hace 2 días</small></div><span class="pill warn"><i></i>Pendiente</span></div></div></div>
    <div class="card"><div class="card__h"><h3>Seguridad</h3></div><div class="kv"><span>Doble factor (2FA)</span><span class="pill ok"><i></i>Obligatorio</span></div><div class="kv"><span>Inicio con Google</span><span class="pill ok"><i></i>Activo</span></div><div class="kv"><span>Copias de seguridad</span><b>Cada noche</b></div><div class="kv"><span>Datos alojados en</span><b>UE · Fráncfort</b></div></div>
    <div class="card"><div class="card__h"><h3>Actividad del equipo</h3></div><div class="list feed">${[[1, 'movió <b>Asesoría Duero</b> a Negociación', '11:20'], [3, 'subió 4 archivos a <b>Hotel Mirador</b>', '10:05'], [4, 'programó una campaña', '09:40']].map(a => `<div class="li">${av(a[0], 'sm')}<div class="grow"><p><b>${TEAM[a[0]].n.split(' ')[0]}</b> ${a[1]}</p><small>Hoy, ${a[2]}</small></div></div>`).join('')}</div></div></div></section>`;
  V.equipo.after = () => {
    $$('[data-pm]').forEach(p => p.addEventListener('click', () => { const [x, j] = p.dataset.pm.split(',').map(Number); PM[x][j] ^= 1; p.classList.toggle('on'); toast(`${TEAM[x].n.split(' ')[0]}: «${PERMS[j]}» ${PM[x][j] ? 'activado' : 'desactivado'}`); }));
    $('[data-inv]').addEventListener('click', () => { $('[data-invs]').insertAdjacentHTML('afterbegin', `<div class="li"><span class="av c2">NP</span><div class="grow"><b>nueva.persona@estudiomarea.test</b><small>Ventas · enviada ahora</small></div><span class="pill warn"><i></i>Pendiente</span></div>`); toast('Invitación enviada (demo)'); });
  };

  const NODE = (ic, t, cls = '', img) => `<span class="node">${img ? `<img src="../assets/logos/${img}" alt="" style="width:18px;height:18px">` : `<span class="ico ${cls}">${I(ic)}</span>`}${t}</span>`;
  const AR = `<span class="arrow">${I('arrow', 'width:15px;height:15px')}</span>`;
  const AUTOS = [
    ['Nuevo lead desde la web', [NODE('globe', 'Formulario web'), NODE('spark', 'IA clasifica', 'vio'), NODE('users', 'Asignar a ventas'), NODE('', 'Bienvenida', '', 'whatsapp.svg')], 214, 'hace 2 h', 1],
    ['Factura vencida', [NODE('inv', 'Vence +3 días', 'warn'), NODE('mail', 'Email de recordatorio'), NODE('', 'Aviso por WhatsApp', '', 'whatsapp.svg'), NODE('bell', 'Avisar a Irene')], 9, 'hoy 08:00', 1],
    ['Contrato firmado', [NODE('check', 'Etapa → Ganado', 'ok'), NODE('proj', 'Crear proyecto'), NODE('', 'Carpeta en Drive', '', 'googledrive.svg'), NODE('inv', 'Factura de anticipo')], 12, 'hace 12 min', 1],
    ['Resumen semanal', [NODE('clock', 'Lunes 08:00'), NODE('chart', 'Calcular métricas'), NODE('spark', 'IA redacta', 'vio'), NODE('mail', 'Email al equipo')], 46, 'lunes', 1],
    ['Cliente sin actividad', [NODE('alert', '20 días sin contacto', 'warn'), NODE('tag', 'Marcar «en riesgo»'), NODE('cal', 'Proponer reunión')], 7, 'ayer', 0]
  ];
  V.automatizaciones = () => `<section>${hd('Automatizaciones', 'Reglas que trabajan solas: «cuando pasa esto, haz aquello». Sin programar.', `<button class="btn s">Plantillas</button><button class="btn p">${I('plus')}Nueva regla</button>`)}
    <div class="kpis">${kpi('Ejecuciones · noviembre', '1.938', '99,8 % sin errores', 'zap', 'hero')}${kpi('Horas ahorradas', '41 h', 'Estimado a 1,3 min por tarea', 'clock', 'ok')}${kpi('Reglas activas', '4 de 5', 'Última hace 12 min', 'check')}${kpi('Integraciones', '6', 'WhatsApp, Gmail, Drive, Stripe…', 'globe', 'vio')}</div>
    <div class="card">${AUTOS.map((a, x) => `<div class="au"><span class="perm ${a[4] ? 'on' : ''}" data-au="${x}" style="cursor:pointer;flex-shrink:0"></span><div class="grow" style="flex:1;min-width:0"><b style="font-size:14px;display:block;margin-bottom:8px">${a[0]}</b><div class="flow">${a[1].join(AR)}</div></div><div class="au__m"><b class="num">${a[2]}</b><small>ejecuciones · ${a[3]}</small></div></div>`).join('')}</div></section>`;
  V.automatizaciones.after = () => $$('[data-au]').forEach(p => p.addEventListener('click', () => { p.classList.toggle('on'); toast(`Regla «${AUTOS[+p.dataset.au][0]}» ${p.classList.contains('on') ? 'activada' : 'pausada'}`); }));

  /* ---------- más apartados: tareas, presupuestos, soporte, documentos, productos ---------- */
  const TASKS = [
    ['Llamar a Veterinaria Nube', 'Seguimiento de propuesta', 2, 'hoy', 'alta', 'todo'],
    ['Enviar propuesta a Ópticas Lince', 'CRM + fidelización', 1, 'hoy', 'alta', 'todo'],
    ['Preparar demo Academia Sigma', 'Reunión 12:30', 3, 'hoy', 'media', 'doing'],
    ['Revisar maqueta Hotel Mirador', 'Proyecto web', 3, 'mañana', 'media', 'doing'],
    ['Factura mensual Logística Avante', 'Facturación', 0, 'vie', 'baja', 'todo'],
    ['Subir fotos al Drive de Bodegas Arnau', 'Branding', 4, 'lun', 'baja', 'todo'],
    ['Contrato firmado Clínica Velarde', 'Ventas', 1, 'ayer', 'alta', 'done'],
    ['Campaña Navidad: textos', 'Café Tranvía', 4, 'ayer', 'media', 'done'],
    ['Revisar permisos de Irene', 'Equipo', 0, 'lun', 'baja', 'review']
  ];
  const TCOL = [['todo', 'Por hacer', '#8b95aa'], ['doing', 'En curso', '#2f5bea'], ['review', 'En revisión', '#7c5cff'], ['done', 'Hecho', '#12a26b']];
  const PRI = { alta: 'bad', media: 'warn', baja: '' };
  V.tareas = () => `<section>${hd('Tareas', 'Lo que tiene que hacer cada persona, con fecha y prioridad. Arrastra para cambiar el estado.', `<div class="seg"><button class="on">Tablero</button><button>Lista</button><button>Mis tareas</button></div><button class="btn p" data-addt>${I('plus')}Tarea</button>`, TASKS.length + ' abiertas')}
    <div class="kb" style="grid-template-columns:repeat(4,minmax(220px,1fr))">${TCOL.map(c => `<div class="col" data-tc="${c[0]}" style="--c:${c[2]}"><div class="col__h"><i></i><b>${c[1]}</b><span data-n></span></div><div data-cards></div></div>`).join('')}</div></section>`;
  V.tareas.after = () => {
    const draw = () => TCOL.forEach(c => {
      const col = $(`[data-tc="${c[0]}"]`), ts = TASKS.map((x, i) => [x, i]).filter(([x]) => x[5] === c[0]);
      col.querySelector('[data-n]').textContent = ts.length;
      col.querySelector('[data-cards]').innerHTML = ts.map(([x, i]) => `<div class="deal" draggable="true" data-ti="${i}"><b style="font-size:13px;display:block;${x[5] === 'done' ? 'text-decoration:line-through;color:#8b95aa' : ''}">${x[0]}</b><small class="muted" style="font-size:12px">${x[1]}</small><div class="deal__f">${I('cal', 'width:13px;height:13px')}${x[3]}${x[4] ? ` <span class="pill ${PRI[x[4]]}" style="margin-left:6px">${x[4]}</span>` : ''}${av(x[2], 'sm')}</div></div>`).join('');
      $$('[data-ti]', col).forEach(el => el.addEventListener('dragstart', e => e.dataTransfer.setData('text', el.dataset.ti)));
    });
    $$('[data-tc]').forEach(c => {
      c.addEventListener('dragover', e => { e.preventDefault(); c.classList.add('over'); });
      c.addEventListener('dragleave', () => c.classList.remove('over'));
      c.addEventListener('drop', e => { e.preventDefault(); c.classList.remove('over'); const x = TASKS[+e.dataTransfer.getData('text')]; if (x) { x[5] = c.dataset.tc; draw(); toast(`«${x[0]}» → ${TCOL.find(z => z[0] === x[5])[1]}`); } });
    });
    $('[data-addt]').addEventListener('click', () => { TASKS.unshift(['Nueva tarea', 'Escribe el detalle…', 0, 'hoy', 'media', 'todo']); draw(); toast('Tarea creada'); });
    draw();
  };

  const QUOTES = [
    ['P-2026-031', 'Ópticas Lince', 'CRM + fidelización', 5100, 'sent', '12 nov', 'Vista 3 veces'],
    ['P-2026-030', 'Inmobiliaria Brezo', 'Web + fichas automáticas', 9800, 'sent', '8 nov', 'Abierta ayer'],
    ['P-2026-029', 'Academia Sigma', 'Portal de alumnos', 6300, 'draft', '—', 'Borrador'],
    ['P-2026-028', 'Clínica Velarde', 'App de citas', 8900, 'ok', '2 nov', 'Firmada'],
    ['P-2026-027', 'Gimnasio Pulso', 'App de socios', 4200, 'sent', '30 oct', 'Sin abrir'],
    ['P-2026-026', 'Taller Ribera', 'Citas por WhatsApp', 1800, 'ko', '22 oct', 'Rechazada']
  ];
  const QST = { sent: ['info', 'Enviado'], draft: ['', 'Borrador'], ok: ['ok', 'Aceptado'], ko: ['bad', 'Rechazado'] };
  V.presupuestos = () => `<section>${hd('Presupuestos', 'Crea, envía y firma presupuestos. Sabes cuándo el cliente los abre.', `<button class="btn p">${I('plus')}Presupuesto</button>`)}
    <div class="kpis">${kpi('Enviados este mes', '9', eur(41300) + ' en total', 'send', 'hero')}${kpi('Tasa de aceptación', '44 %', '<span class="up">▲ 6 pts</span>', 'check', 'ok')}${kpi('Pendientes de respuesta', '3', eur(19100), 'clock')}${kpi('Tiempo medio de firma', '4,2 días', 'Desde el envío', 'file', 'vio')}</div>
    <div class="g2"><div class="card np"><table class="tbl"><thead><tr><th>Nº</th><th>Cliente</th><th>Concepto</th><th class="r">Importe</th><th>Estado</th><th>Seguimiento</th></tr></thead><tbody>${QUOTES.map((q, x) => `<tr class="click" data-q="${x}" style="cursor:pointer"><td class="num"><b>${q[0]}</b></td><td>${q[1]}</td><td class="muted">${q[2]}</td><td class="r num"><b>${eur(q[3])}</b></td><td><span class="pill ${QST[q[4]][0]}"><i></i>${QST[q[4]][1]}</span></td><td class="muted">${q[6]}</td></tr>`).join('')}</tbody></table></div>
    <div class="card" data-qd></div></div></section>`;
  V.presupuestos.after = () => {
    const show = x => { const q = QUOTES[x]; const lines = [[q[2], 1, Math.round(q[3] * .7)], ['Puesta en marcha y formación', 1, Math.round(q[3] * .2)], ['Soporte 3 meses', 1, q[3] - Math.round(q[3] * .7) - Math.round(q[3] * .2)]];
      $('[data-qd]').innerHTML = `<div class="card__h"><h3>${q[0]}</h3><span class="pill ${QST[q[4]][0]}"><i></i>${QST[q[4]][1]}</span></div><p class="muted" style="font-size:13px;margin-bottom:12px">${q[1]} · enviado ${q[5]}</p>
        ${lines.map(l => `<div class="kv"><span>${l[0]}</span><b class="num">${eur(l[2])}</b></div>`).join('')}
        <div class="kv" style="border-top:1px solid var(--line);margin-top:6px;padding-top:10px"><span>Base imponible</span><b class="num">${eur(q[3])}</b></div><div class="kv"><span>IVA 21 %</span><b class="num">${eur(q[3] * .21)}</b></div><div class="kv"><span><b>Total</b></span><b class="num" style="font-size:16px">${eur(q[3] * 1.21)}</b></div>
        <div style="display:flex;gap:8px;margin-top:14px"><button class="btn p" data-qa="Recordatorio enviado al cliente">${I('send')}Recordar</button><button class="btn s" data-qa="Convertido en factura">${I('inv')}Pasar a factura</button></div>`;
      $$('[data-qa]').forEach(b => b.addEventListener('click', () => toast(b.dataset.qa))); };
    $$('[data-q]').forEach(r => r.addEventListener('click', () => show(+r.dataset.q))); show(0);
  };

  const TICKETS = [
    ['#1042', 'No me llega el email de la reserva', 'Hotel Mirador', 'alta', 'open', 'hace 20 min', 3],
    ['#1041', 'Cambiar el logo de la web', 'Café Tranvía', 'baja', 'open', 'hace 2 h', 4],
    ['#1040', 'Duda con la factura de octubre', 'Asesoría Duero', 'media', 'wait', 'ayer', 2],
    ['#1039', 'Añadir un usuario nuevo', 'Logística Avante', 'baja', 'done', 'ayer', 0],
    ['#1038', 'La app va lenta en el móvil', 'Clínica Velarde', 'alta', 'done', 'lun', 3]
  ];
  const TST = { open: ['info', 'Abierto'], wait: ['warn', 'Esperando al cliente'], done: ['ok', 'Resuelto'] };
  V.soporte = () => `<section>${hd('Soporte', 'Las peticiones de tus clientes, con prioridad y tiempo de respuesta.', `<div class="seg"><button class="on">Abiertos <b>2</b></button><button>Todos</button></div><button class="btn p">${I('plus')}Ticket</button>`)}
    <div class="kpis">${kpi('Primera respuesta', '14 min', 'Media de noviembre', 'clock', 'hero')}${kpi('Resueltos', '38', '<span class="up">96 %</span> en menos de 24 h', 'check', 'ok')}${kpi('Satisfacción', '4,8 / 5', '<span class="stars">★★★★★</span>', 'star', 'vio')}${kpi('Abiertos ahora', '2', '1 de prioridad alta', 'alert', 'warn')}</div>
    <div class="card np"><table class="tbl"><thead><tr><th>Ticket</th><th>Asunto</th><th>Cliente</th><th>Prioridad</th><th>Estado</th><th>Última respuesta</th><th>Asignado</th></tr></thead><tbody>${TICKETS.map(k => `<tr><td class="num"><b>${k[0]}</b></td><td><b>${k[1]}</b></td><td class="muted">${k[2]}</td><td><span class="pill ${PRI[k[3]]}">${k[3]}</span></td><td><span class="pill ${TST[k[4]][0]}"><i></i>${TST[k[4]][1]}</span></td><td class="muted">${k[5]}</td><td>${av(k[6], 'sm')}</td></tr>`).join('')}</tbody></table></div></section>`;

  const DOCS = [['Contrato · Clínica Velarde.pdf', 'Contratos', '2 nov', '284 KB', '#e5484d'], ['Propuesta · Ópticas Lince.pdf', 'Presupuestos', '12 nov', '1,2 MB', '#e5484d'], ['Logos Bodegas Arnau.zip', 'Branding', '10 nov', '18 MB', '#ca8a04'], ['Informe mensual · Avante.xlsx', 'Informes', '1 nov', '96 KB', '#12a26b'], ['Fotos Hotel Mirador', 'Proyecto web', '15 nov', '64 fotos', '#2f5bea'], ['Plantilla de factura.docx', 'Plantillas', '3 oct', '48 KB', '#2f5bea']];
  V.documentos = () => `<section>${hd('Documentos', 'Contratos, presupuestos y archivos de cada cliente, ordenados y con permisos.', `<button class="btn s">${I('down')}Subir</button><button class="btn p">${I('plus')}Carpeta</button>`)}
    <div class="bar"><div class="seg"><button class="on">Todos</button>${['Contratos', 'Presupuestos', 'Branding', 'Informes'].map(f => `<button>${f}</button>`).join('')}</div><span class="muted" style="margin-left:auto;font-size:12.5px">3,4 GB de 50 GB usados</span></div>
    <div class="g3">${DOCS.map(d => `<div class="card" style="display:flex;gap:14px;align-items:center;cursor:pointer" data-doc><span class="ico" style="background:color-mix(in srgb,${d[4]} 12%,#fff);color:${d[4]};width:46px;height:46px;border-radius:14px">${I(d[0].includes('Fotos') ? 'proj' : 'file')}</span><div style="min-width:0"><b style="font-size:13.5px;display:block" class="mx-trunc">${d[0]}</b><small class="muted">${d[1]} · ${d[2]} · ${d[3]}</small></div></div>`).join('')}</div></section>`;
  V.documentos.after = () => $$('[data-doc]').forEach(d => d.addEventListener('click', () => toast('Vista previa del documento (demo)')));

  const PRODS = [['Web corporativa', 'Diseño + desarrollo', 2400, 'Servicio', 18], ['Tienda online', 'Con pagos y envíos', 4200, 'Servicio', 7], ['Mantenimiento web', 'Al mes', 79, 'Cuota', 23], ['Automatización', 'Por flujo', 1200, 'Servicio', 14], ['Agente de WhatsApp', 'Al mes', 149, 'Cuota', 9], ['Hora de consultoría', 'Por hora', 65, 'Hora', 120]];
  V.productos = () => `<section>${hd('Productos y tarifas', 'Tu catálogo con precios, para usarlo en presupuestos y facturas con un clic.', `<button class="btn p">${I('plus')}Producto</button>`)}
    <div class="card np"><table class="tbl"><thead><tr><th>Producto</th><th>Tipo</th><th class="r">Precio</th><th class="r">Vendidos 2026</th><th class="r">Ingresos</th></tr></thead><tbody>${PRODS.map((p, x) => `<tr><td><div class="who"><span class="logo" style="--c:${COL[x]}">${ini(p[0])}</span><div><b>${p[0]}</b><small>${p[1]}</small></div></div></td><td><span class="pill ${p[3] === 'Cuota' ? 'vio' : p[3] === 'Hora' ? '' : 'info'}">${p[3]}</span></td><td class="r num"><b>${eur(p[2])}</b></td><td class="r num">${p[4]}</td><td class="r num"><b>${eur(p[2] * p[4] * (p[3] === 'Cuota' ? 10 : 1))}</b></td></tr>`).join('')}</tbody></table></div></section>`;

  /* ---------- ficha de cliente ---------- */
  document.body.insertAdjacentHTML('beforeend', `<div class="scrim" data-scrim></div><aside class="drw" data-drw aria-label="Ficha de cliente"></aside>
    <div class="pal" data-pal><div class="pal__in">${I('filter')}<input placeholder="Busca clientes, oportunidades, facturas o pantallas…" data-pq><kbd>Esc</kbd></div><div class="pal__r" data-pr></div><div class="pal__f"><span>↑ ↓ moverse</span><span>↵ abrir</span><span>Esc cerrar</span></div></div>
    <div class="ntf" data-ntf><div class="ntf__h"><b>Avisos</b><button data-nall>Marcar todo como leído</button></div><div data-nl></div></div>`);
  const drw = $('[data-drw]'), scrim = $('[data-scrim]'), pal = $('[data-pal]'), ntf = $('[data-ntf]');
  const closeAll = () => { [drw, scrim, pal, ntf].forEach(e => e.classList.remove('on')); };
  scrim.addEventListener('click', closeAll);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  const SECOND = ['Jaime Ortega', 'Clara Medina', 'Óscar Lozano', 'Beatriz Calvo', 'Hugo Navarro', 'Alba Romero', 'Diego Herrera', 'Silvia Molina'];
  const SINCE = ['mar 2025', 'ene 2026', 'nov 2026', 'jun 2025'];
  function openClient(name) {
    const ci = CLIENTS.findIndex(c => c[0] === name), d = DEALS.find(dd => dd.name === name);
    const c = CLIENTS[ci] || [name, '—', d ? d.sec : '', 'new', 0, d ? d.own : 1, 'Hoy', ['Lead']];
    const x = ci >= 0 ? ci : (d ? d.id : 0), col = COL[x % 8];
    const inv = INV.filter(f => f[1] === name), pr = PROJ.filter(p => p[1] === name);
    const ev = EVS.filter(e => e[3] === name || e[4].includes(name));
    const conv = CONV.find(cv => cv[1] === name), st = STC[c[3]];
    const pend = inv.filter(f => f[5] === 'pend' || f[5] === 'late').reduce((a, f) => a + f[4], 0);
    const S = d ? STAGES.find(s => s.id === d.st) : null;
    const tl = [];
    if (conv) tl.push(['#25d366', 'Mensaje por ' + (conv[2] === 'wa' ? 'WhatsApp' : conv[2] === 'mail' ? 'email' : 'el formulario web'), `«${conv[3]}»`, conv[4]]);
    ev.forEach(e => tl.push([e[5], 'Reunión · ' + e[4], `${DAYS[e[0]][0]} ${DAYS[e[0]][1]} nov a las ${hh(e[1])}`, 'Esta semana']));
    inv.forEach(f => tl.push([f[5] === 'paid' ? '#12a26b' : f[5] === 'late' ? '#e5484d' : '#2f5bea', `Factura ${f[0]} · ${eur(f[4])}`, IST[f[5]][1] + (f[3] !== '—' ? ` · vence ${f[3]}` : ''), f[2] === '—' ? 'Borrador' : f[2]]));
    if (d) tl.push([S.c, `Oportunidad «${d.what}»`, `Etapa ${S.n} · ${eur(d.v)}`, (d.days ? `hace ${d.days} día${d.days === 1 ? '' : 's'}` : 'hoy')]);
    tl.push(['#8b95aa', 'Cliente creado', `Origen: ${['Recomendación', 'Google', 'LinkedIn', 'Instagram'][x % 4]}`, SINCE[x % 4]]);
    const body = {
      res: `<div class="mini"><div><small>Facturado 2026</small><b class="num">${c[4] ? eur(c[4]) : '—'}</b></div><div><small>Pendiente de cobro</small><b class="num ${pend ? 'dn' : ''}">${pend ? eur(pend) : '0 €'}</b></div><div><small>Cliente desde</small><b>${SINCE[x % 4]}</b></div><div><small>Satisfacción</small><b>${(4.4 + (x % 6) / 10).toFixed(1).replace('.', ',')} <span class="stars">★★★★★</span></b></div></div>
        ${d ? `<h4>Oportunidad abierta</h4><div class="card" style="padding:14px 16px;box-shadow:none;background:var(--bg)"><div style="display:flex;justify-content:space-between;align-items:center"><b>${d.what}</b><span class="pill" style="color:${S.c}"><i></i>${S.n}</span></div><div class="prob" style="--c:${S.c}"><i style="width:${S.p}%"></i></div><div class="kv" style="margin-top:6px"><span>Valor · probabilidad ${S.p} %</span><b class="num">${eur(d.v)}</b></div></div>` : ''}
        <h4>Contactos</h4><div class="list">${[[c[1] === '—' ? 'Sin nombre' : c[1], 'Gerencia · decide', 'c5'], [SECOND[x % 8], 'Administración · facturas', 'c2']].map(p => `<div class="li"><span class="av sm ${p[2]}">${ini(p[0])}</span><div class="grow"><b>${p[0]}</b><small>${p[1]}</small></div><button class="ibtn" style="width:30px;height:30px" data-a="Llamada registrada">${I('phone', 'width:15px;height:15px')}</button><button class="ibtn" style="width:30px;height:30px" data-a="Borrador de email creado">${I('mail', 'width:15px;height:15px')}</button></div>`).join('')}</div>
        <h4>Datos de la empresa</h4><div class="kv"><span>Sector</span><b>${c[2]}</b></div><div class="kv"><span>CIF (ficticio)</span><b class="num">B${46000000 + ((x + 3) * 7919357) % 3999999}</b></div><div class="kv"><span>Ciudad</span><b>${['Valencia', 'Madrid', 'Alicante', 'Barcelona', 'Sevilla', 'Bilbao'][x % 6]}</b></div><div class="kv"><span>Responsable</span>${av(c[5], 'sm')}</div><div class="kv"><span>Etiquetas</span><span>${c[7].map(t => `<span class="pill" style="margin-left:4px">${t}</span>`).join('')}</span></div>
        <h4>Nota interna</h4><div class="note"><textarea data-note placeholder="Escribe una nota para el equipo…">${name === 'Hotel Mirador' ? 'Prefiere WhatsApp. Reunión de socios el viernes: enseñar la web nueva.' : ''}</textarea></div>`,
      act: `<div class="tl">${tl.map(t => `<div style="--c:${t[0]}"><b>${t[1]}</b><p>${t[2]}</p><small>${t[3]}</small></div>`).join('')}</div>`,
      fac: inv.length ? `<table class="tbl sm"><thead><tr><th>Factura</th><th>Emitida</th><th class="r">Importe</th><th>Estado</th></tr></thead><tbody>${inv.map(f => `<tr><td class="num"><b>${f[0]}</b></td><td class="muted">${f[2]}</td><td class="r num"><b>${eur(f[4])}</b></td><td><span class="pill ${IST[f[5]][0]}"><i></i>${IST[f[5]][1]}</span></td></tr>`).join('')}</tbody></table>` : '<p class="muted" style="font-size:13px">Todavía no hay facturas para este cliente.</p>',
      pro: pr.length ? pr.map(p => `<div class="card" style="padding:14px 16px;margin-bottom:10px;box-shadow:none;background:var(--bg)"><div style="display:flex;justify-content:space-between"><b>${p[0]}</b>${av(p[6], 'sm')}</div><small class="muted">${p[7]}</small><div class="prob" style="--c:${p[5]}"><i style="width:${p[4]}%"></i></div><div class="kv"><span>Avance</span><b>${p[4]} %</b></div></div>`).join('') : '<p class="muted" style="font-size:13px">Sin proyectos en curso.</p>'
    };
    const bind = () => $$('[data-a]', drw).forEach(b => b.onclick = () => toast(b.dataset.a));
    drw.innerHTML = `<div class="drw__h"><div class="drw__top"><span class="logo" style="--c:${col};width:52px;height:52px;border-radius:16px;font-size:17px">${ini(name)}</span><div><h2>${name}</h2><p>${c[1]} · ${c[2]}</p><span class="pill ${st[0]}" style="margin-top:6px"><i></i>${st[1]}</span></div><button class="ibtn drw__x" data-x aria-label="Cerrar">${I('plus', 'transform:rotate(45deg)')}</button></div>
      <div class="drw__acts"><button class="btn p" data-a="Llamada registrada en la ficha">${I('phone')}Llamar</button><button class="btn s" data-a="Chat de WhatsApp abierto (demo)"><img src="../assets/logos/whatsapp.svg" alt="" style="width:15px;height:15px">WhatsApp</button><button class="btn s" data-a="Borrador de email creado">${I('mail')}Email</button><button class="btn s" data-a="Factura en borrador creada">${I('inv')}Factura</button><button class="btn s" data-a="Reunión propuesta por email">${I('cal')}Reunión</button></div>
      <div class="drw__tabs">${[['res', 'Resumen'], ['act', `Actividad ${tl.length}`], ['fac', `Facturas ${inv.length}`], ['pro', `Proyectos ${pr.length}`]].map((t, i) => `<button data-t="${t[0]}" class="${i ? '' : 'on'}">${t[1]}</button>`).join('')}</div></div>
      <div class="drw__b" data-db>${body.res}</div>`;
    $$('[data-t]', drw).forEach(b => b.addEventListener('click', () => { $$('[data-t]', drw).forEach(z => z.classList.toggle('on', z === b)); $('[data-db]', drw).innerHTML = body[b.dataset.t]; bind(); }));
    bind();
    $('[data-x]', drw).addEventListener('click', closeAll);
    closeAll(); drw.classList.add('on'); scrim.classList.add('on');
  }

  /* ---------- buscador Ctrl K ---------- */
  let pres = [], pi = 0;
  const palDraw = () => {
    const q = nrm($('[data-pq]').value.trim()), m = t => !q || nrm(t).includes(q);
    const g = [
      ['Clientes', CLIENTS.filter(c => m(c[0] + ' ' + c[1])).slice(0, 5).map(c => ({ h: `<span class="logo" style="--c:${COL[CLIENTS.indexOf(c) % 8]}">${ini(c[0])}</span>${c[0]}<small>${c[1]}</small>`, go: () => openClient(c[0]) }))],
      ['Oportunidades', DEALS.filter(d => m(d.name + ' ' + d.what)).slice(0, 4).map(d => ({ h: `${I('target', 'width:16px;height:16px;color:#8b95aa')}${d.what} · ${d.name}<small>${eur(d.v)}</small>`, go: () => openClient(d.name) }))],
      ['Facturas', INV.filter(f => m(f[0] + ' ' + f[1])).slice(0, 3).map(f => ({ h: `${I('inv', 'width:16px;height:16px;color:#8b95aa')}${f[0]} · ${f[1]}<small>${eur(f[4])}</small>`, go: () => { location.hash = 'facturas'; } }))],
      ['Ir a', Object.entries(TITLES).filter(([, t]) => m(t)).map(([id, t]) => ({ h: `${I('arrow', 'width:16px;height:16px;color:#8b95aa')}${t}`, go: () => { location.hash = id; } }))]
    ].filter(z => z[1].length);
    pres = g.flatMap(z => z[1]); pi = Math.min(pi, Math.max(0, pres.length - 1)); let n = 0;
    $('[data-pr]').innerHTML = g.map(([t, it]) => `<div class="pal__g">${t}</div>${it.map(r => `<div class="pal__it ${n === pi ? 'on' : ''}" data-pi="${n++}">${r.h}</div>`).join('')}`).join('') || '<p class="muted" style="padding:20px;text-align:center">Sin resultados</p>';
    $$('[data-pi]').forEach(e => e.addEventListener('click', () => { const r = pres[+e.dataset.pi]; closeAll(); r.go(); }));
  };
  const openPal = () => { closeAll(); pal.classList.add('on'); scrim.classList.add('on'); const i = $('[data-pq]'); i.value = ''; pi = 0; palDraw(); setTimeout(() => i.focus(), 50); };
  $('[data-pq]').addEventListener('input', () => { pi = 0; palDraw(); });
  $('[data-pq]').addEventListener('keydown', e => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && pres.length) { e.preventDefault(); pi = (pi + (e.key === 'ArrowDown' ? 1 : -1) + pres.length) % pres.length; palDraw(); const on = $('.pal__it.on'); on && on.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter' && pres[pi]) { const r = pres[pi]; closeAll(); r.go(); }
  });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPal(); } });
  $('.top__search').addEventListener('click', openPal);

  /* ---------- avisos ---------- */
  const NT = [['ok', 'check', 'Clínica Velarde firmó el contrato', 'hace 12 min', 1, () => openClient('Clínica Velarde')], ['', 'msg', 'Elena (Hotel Mirador) te escribió por WhatsApp', 'hace 20 min', 1, () => { location.hash = 'mensajes'; }], ['warn', 'inv', 'F-2026-0139 lleva 3 días vencida', 'hace 2 h', 1, () => { location.hash = 'facturas'; }], ['vio', 'cal', 'Demo con Academia Sigma a las 12:30', 'hoy', 0, () => { location.hash = 'reuniones'; }], ['', 'users', 'Irene Soto ya puede ver la facturación', 'ayer', 0, () => { location.hash = 'equipo'; }]];
  const dot = () => { const dd = $('.ibtn .dot'); if (dd) dd.style.display = NT.some(n => n[4]) ? '' : 'none'; };
  const ntDraw = () => { $('[data-nl]').innerHTML = NT.map((n, x) => `<div class="li ${n[4] ? 'new' : ''}" data-nt="${x}"><span class="ico ${n[0]}">${I(n[1])}</span><div class="grow"><b>${n[2]}</b><small>${n[3]}</small></div></div>`).join(''); $$('[data-nt]').forEach(e => e.addEventListener('click', ev => { ev.stopPropagation(); const n = NT[+e.dataset.nt]; n[4] = 0; dot(); closeAll(); n[5](); })); };
  $('.top__r .ibtn').addEventListener('click', e => { e.stopPropagation(); const on = ntf.classList.contains('on'); closeAll(); if (!on) { ntDraw(); ntf.classList.add('on'); } });
  $('[data-nall]').addEventListener('click', e => { e.stopPropagation(); NT.forEach(n => n[4] = 0); ntDraw(); dot(); });
  document.addEventListener('click', e => { if (ntf.classList.contains('on') && !ntf.contains(e.target)) ntf.classList.remove('on'); });
  window.NORTE = { openClient, closeAll, toast, palDraw, DEALS, route: () => route() };

  /* ---------- router ---------- */
  const view = $('[data-view]');
  function route() {
    let id = (location.hash || '').slice(1) || Q.get('v') || 'inicio';
    if (!V[id]) id = 'inicio';
    $$('[data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === id));
    $('[data-crumb]').textContent = TITLES[id];
    view.innerHTML = V[id](); view.scrollTop = 0;
    V[id].after && V[id].after();
    view.dataset.v = id; fit(); clearTimeout(route._t); route._t = setTimeout(fit, 500);
    $$('[data-go2]', view).forEach(b => b.addEventListener('click', () => location.hash = b.dataset.go2));
    $$('[data-oc]', view).forEach(b => b.addEventListener('click', () => openClient(b.dataset.oc)));
    $$('[data-new]', view).forEach(b => b.addEventListener('click', () => toast('Formulario de nuevo cliente (demo)')));
    try { parent !== window && parent.postMessage({ norte: id }, '*'); } catch (e) {}
  }
  // Cada apartado cabe en pantalla, sin scroll: si sobra contenido, se reduce lo justo (y se ensancha para no dejar hueco)
  function fit() {
    const sc = view.firstElementChild; if (!sc) return;
    sc.style.zoom = '';
    const cs = getComputedStyle(view), avail = view.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (view.scrollHeight > view.clientHeight + 1) { const pd = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom); sc.style.zoom = Math.max(.88, (avail - 4) / (view.scrollHeight - pd)).toFixed(3); }
  }
  window.addEventListener('resize', () => requestAnimationFrame(fit));
  window.addEventListener('hashchange', route);
  window.addEventListener('message', e => { if (e.data && e.data.goto && V[e.data.goto]) location.hash = e.data.goto; });
  route();
  if (Q.get('open')) openClient(Q.get('open'));
  if (Q.get('tab')) { const tb = document.querySelector(`[data-t="${Q.get('tab')}"]`); tb && tb.click(); }
})();
