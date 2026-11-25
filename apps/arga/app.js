/* Ruta · Distribuciones Arga — consola de operaciones (vistas, tour guiado, tarjeta y contrato con el portfolio). */
(function () {
  const Q = new URLSearchParams(location.search);
  const MODE = Q.get('mode') === 'card' ? 'card' : Q.get('mode') === 'tour' ? 'tour' : 'auto';
  const D = window.ARGA, R = D.RUTAS;
  const $ = (s, el = document) => el.querySelector(s);
  const stage = $('#stage'), ov = $('#ov'), mapEl = $('#map');
  if (MODE === 'card') document.body.classList.add('card');
  const SW = MODE === 'card' ? 640 : 1600, SH = MODE === 'card' ? 344 : 900;

  // ------------------------------------------------------------------ iconos (trazo fino, a mano)
  const IC = {
    tower: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><path d="M12 12l5.2-5.2"/><circle cx="12" cy="12" r=".6"/>',
    inbox: '<path d="M4 13l2.4-7h11.2L20 13v5.2a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8z"/><path d="M4 13h4.6l1.1 2.2h4.6l1.1-2.2H20"/>',
    ware: '<path d="M3 9.2l9-5 9 5V19.5a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5z"/><path d="M7 20v-7h10v7M7 16.5h10"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    alert: '<path d="M10.3 4.6 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4.2M12 16.8v.1"/>',
    doc: '<path d="M6.5 3.5h7.5l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5z"/><path d="M13.5 3.5V8h4.5M9 12h6M9 15.5h4"/><path d="M8.5 18.5c1-1 1.6-.2 2.2 0s1.2-.8 2 0"/>',
    euro: '<circle cx="12" cy="12" r="8.5"/><path d="M15 8.8a4 4 0 1 0 0 6.4M7.6 11h6M7.6 13.2h6"/>',
    chart: '<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    truck: '<path d="M3 6.5h11v9.5H3zM14 10h3.8l3.2 3.2V16h-7"/><circle cx="7" cy="17.6" r="1.8"/><circle cx="17" cy="17.6" r="1.8"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.6 14.4a5 5 0 0 1 2.9 4.6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    checkc: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.3l2.6 2.6 5-5.2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    wa: '<path d="M4.6 19.4l1.1-3.5a8 8 0 1 1 2.8 2.6z"/><path d="M9.2 8.8c.2 2.5 2.5 4.9 5 5.3l.9-1.2 1.6.8-.3 1.1"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.6"/><path d="M4 7l8 6 8-6"/>',
    web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.7 2.6 14.3 0 17M12 3.5c-2.6 2.7-2.6 14.3 0 17"/>',
    tel: '<path d="M6.2 3.5h2.9l1.5 4-1.9 1.3a10 10 0 0 0 4.5 4.5l1.3-1.9 4 1.5v2.9a2 2 0 0 1-2 2A14.3 14.3 0 0 1 4.2 5.5a2 2 0 0 1 2-2z"/>',
    spark: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    layers: '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2l-1.6 4-4 1.6 1.6-4z"/>',
    kg: '<path d="M6.5 8.5h11l2 11.5h-15z"/><circle cx="12" cy="5.6" r="2"/>',
    cube: '<path d="M12 3.5l8 4.5v8l-8 4.5-8-4.5V8z"/><path d="M4 8l8 4.5L20 8M12 12.5V21"/>',
    pallet: '<rect x="6" y="5.5" width="12" height="9" rx="1"/><path d="M4 15h16M4 19h16M6 15v4M12 15v4M18 15v4"/>',
    scan: '<path d="M4 7.5v-3h3M17 4.5h3v3M20 16.5v3h-3M7 19.5H4v-3M8 9v6M11 9v6M14 9v6M17 9v6"/>',
    fuel: '<path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M5 10h9"/><path d="M14 8l3 2.5V17a1.5 1.5 0 0 0 3 0V9l-2.5-2.5"/>',
    leaf: '<path d="M5 19c0-8 5-13.5 14-14 0 9-5 14-13 14z"/><path d="M5 19l7.5-7.5"/>',
    gauge: '<path d="M4.4 16.5a8 8 0 1 1 15.2 0"/><path d="M12 13.2l3.6-4"/><circle cx="12" cy="13.5" r=".8"/>',
    card: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10h17M7 14.5h3"/>',
    cash: '<rect x="3" y="6.5" width="18" height="11" rx="1.6"/><circle cx="12" cy="12" r="2.4"/><path d="M6 9.5v.1M18 14.5v.1"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    filter: '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>',
    cal: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.1M4.5 12h.1M4.5 17.5h.1"/>',
    map: '<path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>',
    cam: '<path d="M4 8.2h3.5L9 6h6l1.5 2.2H20V19H4z"/><circle cx="12" cy="13.2" r="3.2"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4z"/>',
    box3d: '<path d="M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7z"/><path d="M4.5 7.7 12 12l7.5-4.3M12 12v8.5"/>',
    pen: '<path d="M4 20l1-4L15.5 5.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M13.5 7.5l3 3"/>',
    bolt: '<path d="M13 3.5 5.5 13.5H11l-1 7 7.5-10H12z"/>',
    store: '<path d="M4 9.5 5.5 4.5h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12v8h13v-8"/><path d="M10 20v-4.5h4V20"/>'
  };
  const ic = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24">${IC[k]}</svg>`;

  // ------------------------------------------------------------------ formato es-ES
  const num = (n, dec = 0) => { const s = Math.abs(n).toFixed(dec).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (n < 0 ? '−' : '') + s.join(','); };
  const eur = n => num(n, 2) + ' €';
  const hhmm = s => { s = Math.floor(s); const h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };
  const hhmmss = s => hhmm(s) + ':' + String(Math.floor(s) % 60).padStart(2, '0');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  // caras, logos e iconos de archivo / pago (nunca iniciales ni letras sueltas)
  const FACE = n => '../assets/apps/caras/cara' + n + '.webp';
  const face = (n, cls = '') => '<img class="face ' + cls + '" src="' + FACE(n) + '" alt="" loading="eager" decoding="async">';
  const FILE = k => '<img class="fi" src="../assets/apps/iconos/' + k + '.svg" alt="">';
  const BRAND = { wa: 'whatsapp', mail: 'gmail' };
  const chan = (c, cls = '') => BRAND[c] ? '<span class="chb ' + cls + '"><img src="../assets/logos/' + BRAND[c] + '.svg" alt=""></span>' : '<span class="chb ' + cls + ' chb--' + c + '">' + ic(c === 'web' ? 'web' : 'tel') + '</span>';
  const TIPOS = {};
  R.forEach(r => r.paradas.forEach(p => (TIPOS[p[2]] = p[5])));
  Object.assign(TIPOS, { 'Bar Gure Txoko': 'Bar', 'Asador Rochapea': 'Restaurante', 'Cafetería Ulzama': 'Cafetería', 'Restaurante Amaiur': 'Restaurante', 'Kiosko del Paseo': 'Quiosco', 'Hotel Ensanche': 'Hotel', 'Bar Txirrista': 'Bar' });
  const PICTO = {
    Bar: '<path d="M7.5 4.5h9l-1.2 6.2a3.3 3.3 0 0 1-6.6 0z"/><path d="M12 14v5M9 19.5h6M8 7.5h8"/>',
    Cafetería: '<path d="M5.5 9h10v4.2a5 5 0 0 1-10 0z"/><path d="M15.5 10.2h1.3a2.1 2.1 0 0 1 0 4.2h-1.6M8.5 4.5v2M11.5 4.5v2"/>',
    Restaurante: '<path d="M7.5 4v5.5a2 2 0 0 0 2 2V20M9.5 4v5M5.5 4v5M17 4c-1.6 1-2.3 3.3-2.3 6.3h2.3V20"/>',
    Hotel: '<path d="M4 18.5V6.5M4 14h16v4.5M20 14v-1.8a3 3 0 0 0-3-3h-6V14"/><circle cx="7.4" cy="11.2" r="1.6"/>',
    Sidrería: '<path d="M10 3.5h4M10.6 3.5v3.8L9 9.6V20.5h6V9.6l-1.6-2.3V3.5"/><path d="M9 13h6"/>',
    Tienda: '<path d="M5.5 8.5h13l-1.2 11.5H6.7z"/><path d="M9 8.5a3 3 0 0 1 6 0"/>',
    Taberna: '<ellipse cx="12" cy="6" rx="5.5" ry="2"/><path d="M6.5 6v12c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V6M6.5 12c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"/>',
    Quiosco: '<path d="M4 9l2-4h12l2 4z"/><path d="M4 9c0 1.4 1.2 2 2.7 2s2.6-.6 2.6-2c0 1.4 1.2 2 2.7 2s2.7-.6 2.7-2c0 1.4 1.1 2 2.6 2S20 10.4 20 9M6 11v8.5h12V11"/>'
  };
  const LCOL = ['#2F62E0', '#0F8A5C', '#C24E0C', '#6E56E8', '#B42863', '#0E7490', '#8A6A00', '#2A2B2E'];
  const logo = (name, cls = '') => {
    let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const tipo = TIPOS[name] || (/^Hotel/.test(name) ? 'Hotel' : /^Caf/.test(name) ? 'Cafetería' : /^(Restaurante|Asador)/.test(name) ? 'Restaurante' : 'Bar');
    return '<span class="lg lg--' + (h % 3) + ' ' + cls + '" style="--l:' + LCOL[h % LCOL.length] + '"><svg viewBox="0 0 24 24">' + PICTO[tipo] + '</svg></span>';
  };
  const bar = (el, p) => { if (el) el.style.transform = 'scaleX(' + clamp(p, 0, 100) / 100 + ')'; };

  // ------------------------------------------------------------------ reloj y planificador (se congela en pausa)
  let T = 0, paused = false, raf = 0, last = 0, stepT0 = 0;
  const BASE = 10 * 3600 + 44 * 60;
  const clockS = () => BASE + T;
  // todo lo que programa un paso vive en «jobs» y se borra al cambiar de paso
  let jobs = [];
  const at = (sec, fn) => jobs.push({ t: T + sec, fn });
  const later = at;
  const tween = (sec, dur, fn) => jobs.push({ t: T + sec, dur, fn, tw: true });
  const every = (sec, fn) => jobs.push({ t: T + sec, every: sec, fn });
  function runJobs() {
    const list = jobs;
    for (let k = 0; k < list.length; k++) {
      const j = list[k];
      if (T < j.t) continue;
      let p = 1;
      try { if (j.tw) { p = clamp((T - j.t) / j.dur, 0, 1); j.fn(p); } else j.fn(); } catch (e) { console.warn('[arga]', e); p = 1; j.every = 0; }
      if (list !== jobs) return; // el trabajo ha cambiado de paso
      if (j.tw) { if (p >= 1) list.splice(k--, 1); continue; }
      if (j.every) j.t += j.every; else list.splice(k--, 1);
    }
  }

  // ------------------------------------------------------------------ escala del lienzo
  let scale = 1, pr = 1;
  function fit() {
    const w = innerWidth, h = innerHeight;
    scale = Math.min(w / SW, h / SH);
    stage.style.transform = `translate(${((w - SW * scale) / 2).toFixed(2)}px,${((h - SH * scale) / 2).toFixed(2)}px) scale(${scale})`;
    pr = MODE === 'card' ? 1 : clamp((devicePixelRatio || 1) * scale, 1, 1.5);
    if (window.Mapa && Mapa.ready) Mapa.resize(mapEl.offsetWidth, mapEl.offsetHeight, pr);
  }

  // ------------------------------------------------------------------ mapa 3D
  fit();
  const M = Mapa.init($('#gl'), mapEl, $('#labels'), { card: MODE === 'card', aa: Q.get('aa') !== '0', w: mapEl.offsetWidth, h: mapEl.offsetHeight, pr });
  addEventListener('resize', fit);
  const X = M.grid.X, Z = M.grid.Z;

  // etiquetas de furgonetas y zonas
  M.vans.forEach(v => {
    const rd = v.ru.d;
    v.tag = M.tag(`<div>${face(rd.foto, 'f')}<b>${rd.corto}</b><em>${rd.total - rd.hechas} pend.</em><span class="st"></span></div>`, 'tag--van', null, { y: 6.2, obj: v.g });
    v.tag.el.style.setProperty('--c', rd.color);
  });
  M.f7.tag = M.tag(`<div style="--c:#B3B7BE">${face(5, 'f')}<b>Unai</b><em>cargando</em></div>`, 'tag--van', [M.f7.g.position.x, M.f7.g.position.z], { y: 4.4 });
  const ZONAS = [['Casco Antiguo', 5.5, 1.55], ['Ensanche', 10, .45], ['San Juan', 1.5, -.4], ['Ciudadela', 2, 2], ['Iturrama', 2, 5.55], ['Rochapea', 5.5, 8.5], ['Txantrea', 11, 8.5], ['Río Arga', 6.6, 6.5, 'river'], ['Landaben', 1, 9.3]];
  const zoneTags = ZONAS.map(([n, i, j, c]) => M.tag(`<div>${n}</div>`, 'tag--zone ' + (c || ''), [X(i), Z(j)], { minDist: 105 }));
  const wareTag = M.tag(`<div>${ic('ware')}<b>Almacén Arga</b><small class="mono" style="color:var(--tx3)">Landaben · muelle 3</small></div>`, 'tag--ware', [M.ware.x - 8, M.ware.cz], { y: 9.5, maxDist: 140 });

  // ------------------------------------------------------------------ contadores vivos
  const ENT0 = R.reduce((a, r) => a + r.hechas, 0) + 0; // 152
  const entregados = () => Math.min(214, ENT0 + M.vans.reduce((a, v) => a + v.delivered, 0));
  const hechas = v => Math.min(v.ru.d.total, v.ru.d.hechas + v.delivered);
  M.on('deliver', (v, s) => {
    const rd = v.ru.d;
    v.tag.el.querySelector('em').textContent = (rd.total - hechas(v)) + ' pend.';
    const e = $('#kpi-ent'); if (e) { e.innerHTML = `${entregados()}<small>/214</small>`; e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }
    const p = $('#ph-ent'); if (p) p.textContent = entregados();
    const sb = Math.round(entregados() / 214 * 100); $('#sb-pct').textContent = sb + ' %'; bar($('#sb-bar'), sb);
    feedAdd('check', `<b>${rd.corto}</b> entregó en ${s.name} · <span class="mono">${s.cajas}</span> cajas`, '--ok');
    if (MODE === 'card') cardDeliver(v, s);
  });

  // ------------------------------------------------------------------ barra lateral
  const NAV = [
    ['sec', 'Operaciones'], ['control', 'tower', 'Torre de control', '6'], ['pedidos', 'inbox', 'Pedidos', '214'], ['almacen', 'ware', 'Almacén', ''],
    ['rutas', 'route', 'Planificador', ''], ['incid', 'alert', 'Incidencias', ''], ['albaranes', 'doc', 'Albaranes', '149'], ['cobros', 'euro', 'Cobros', ''],
    ['sec', 'Análisis'], ['informe', 'chart', 'Informes', ''], ['flota', 'truck', 'Flota', '7'], ['clientes', 'users', 'Clientes', '642'], ['ajustes', 'gear', 'Ajustes', '']
  ];
  $('#nav').innerHTML = NAV.map(n => n[0] === 'sec' ? `<div class="sb__sec">${n[1]}</div>` : `<a class="nv" data-k="${n[0]}">${ic(n[1])}<span>${n[2]}</span><em>${n[3]}</em></a>`).join('');
  function navOn(k, incBadge) {
    document.querySelectorAll('.nv').forEach(a => a.classList.toggle('on', a.dataset.k === k));
    const inc = $('.nv[data-k="incid"] em'); inc.className = incBadge ? 'b' : ''; inc.textContent = incBadge ? '1' : '';
  }

  // ------------------------------------------------------------------ cabecera, KPIs y controles del mapa
  function spark(vals, col, fill = true) {
    const w = 74, h = 30, mx = Math.max(...vals), mn = Math.min(...vals);
    const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - 2 - (v - mn) / (mx - mn || 1) * (h - 6)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
    const id = 'g' + Math.random().toString(36).slice(2, 7);
    return `<svg class="sp" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".28"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>${fill ? `<path d="${d}L${w} ${h}L0 ${h}Z" fill="url(#${id})"/>` : ''}<path d="${d}" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2.4" fill="${col}"/></svg>`;
  }
  const kpi = (k) => `<div class="kpi ${k.cls || ''}"><div class="kpi__l">${k.img ? FILE(k.img) : ic(k.ic)}${k.l}</div><div class="kpi__v" ${k.id ? `id="${k.id}"` : ''}>${k.v}</div><div class="kpi__s">${k.s}</div>${k.sp || ''}</div>`;
  const seg = (items, on) => `<div class="seg">${items.map((t, i) => `<span class="${i === on ? 'on' : ''}">${t}</span>`).join('')}</div>`;

  const COB = [
    { r: 'R1', ent: '18/26', ef: 412.5, tj: 806.3, rc: 423.5, pd: 96, st: 'ruta' },
    { r: 'R2', ent: '22/30', ef: 288, tj: 744.6, rc: 252, pd: 0, st: 'ruta' },
    { r: 'R3', ent: '21/21', ef: 520.4, tj: 1110, rc: 690.6, pd: 0, st: 'cuadre', at: 1.6 },
    { r: 'R4', ent: '27/36', ef: 355.2, tj: 980, rc: 595.2, pd: 140.5, st: 'ruta' },
    { r: 'R5', ent: '31/44', ef: 610, tj: 1406.15, rc: 744, pd: 0, st: 'ruta' },
    { r: 'R6', ent: '24/24', ef: 924.1, tj: 1812.25, rc: 1206.8, pd: 0, st: 'cuadre', at: 2.9 }
  ];
  const sum = k => COB.reduce((a, c) => a + c[k], 0);
  const COBRADO = sum('ef') + sum('tj') + sum('rc');

  const VIEWS = {
    control: (o) => ({
      nav: 'control', crumb: 'Torre de control', t: 'Torre de control',
      s: `Martes, 24 de noviembre · <span class="mono">6</span> furgonetas en la calle · <span class="mono" id="ph-ent">${entregados()}</span> de <span class="mono">214</span> pedidos entregados`,
      r: seg([ic('box3d') + 'Mapa 3D', ic('list') + 'Lista', ic('cal') + 'Calendario'], 0) + `<button class="btn">${ic('filter')}Filtros</button>`,
      k: [
        { ic: 'box3d', l: 'Pedidos hoy', v: '214', s: '<span class="up">+18</span> que el martes pasado', sp: spark([150, 172, 160, 181, 176, 196, 214], '#5B8CFF') },
        { ic: 'checkc', l: 'Entregados', id: 'kpi-ent', v: `${entregados()}<small>/214</small>`, s: 'Cierre previsto <span class="mono">13:40</span>', sp: spark([10, 32, 70, 104, 128, 140, 152], '#19A974') },
        { ic: 'clock', l: 'Puntualidad', v: '96,8<small> %</small>', s: 'Dentro de la ventana horaria', sp: spark([94, 95.5, 95, 96.2, 96.6, 96.8], '#5B8CFF', false) },
        { ic: 'route', l: 'Km recorridos', v: '312<small>/487</small>', s: 'Plan optimizado del día' },
        o.inc === 'open' ? { ic: 'alert', l: 'Incidencias', v: '1', s: '<span class="dn">Bar La Plaza</span> · cerrado', cls: 'bad' }
          : o.inc === 'resolved' ? { ic: 'alert', l: 'Incidencias', v: '0', s: '<span class="up">1 resuelta</span> en 14 s', id: 'kpi-inc' }
            : { ic: 'alert', l: 'Incidencias', v: '0', s: 'Ninguna abierta' },
        { ic: 'euro', l: 'Cobrado en ruta', v: num(COBRADO, 0) + '<small> €</small>', s: '49 % con tarjeta' }
      ], pl: 0, pr: o.inc === 'open' ? 432 : 342
    }),
    pedidos: () => ({
      nav: 'pedidos', crumb: 'Pedidos', t: 'Pedidos', s: 'Bandeja única: WhatsApp, correo, web y teléfono, todo en el mismo sitio',
      r: seg(['Hoy', 'Mañana', 'Semana'], 1) + `<button class="btn">${ic('plus')}Pedido manual</button>`,
      k: [
        { ic: 'inbox', l: 'Entrados hoy', v: '214', s: '<span class="up">+18</span> que el martes pasado', sp: spark([120, 150, 140, 170, 190, 214], '#5B8CFF') },
        { ic: 'clock', l: 'Por confirmar', id: 'kpi-pc', v: '6', s: 'El más antiguo hace 4 min', cls: 'hl' },
        { ic: 'cal', l: 'Para mañana', id: 'kpi-man', v: '87', s: 'Cierre de pedidos a las 18:00' },
        { ic: 'euro', l: 'Importe del día', v: '24.310<small> €</small>', s: 'Ticket medio 113,60 €' },
        { ic: 'wa', l: 'Entran por WhatsApp', v: '46<small> %</small>', s: 'Correo 28 % · web 19 % · tel. 7 %' },
        { ic: 'bolt', l: 'Alta de un pedido', v: '38<small> s</small>', s: 'Antes, unos 4 min a mano' }
      ], pl: 822, pr: 0
    }),
    almacen: () => ({
      nav: 'almacen', crumb: 'Almacén', t: 'Almacén · Landaben', s: 'Preparación de la 2ª vuelta · 4 muelles · cierre de carga a las <span class="mono">12:30</span>',
      r: seg(['Por ruta', 'Por producto', 'Por muelle'], 0) + `<button class="btn">${ic('scan')}Lectores (4)</button>`,
      k: [
        { ic: 'list', l: 'Líneas preparadas', id: 'kpi-lin', v: '1.284<small>/1.420</small>', s: '90 % · al ritmo de las 12:10', sp: spark([200, 480, 760, 1020, 1180, 1284], '#19A974') },
        { ic: 'pallet', l: 'Palés cargados', id: 'kpi-pal', v: '38', s: 'De 46 previstos' },
        { ic: 'kg', l: 'Kilos en furgonetas', v: '9.640<small> kg</small>', s: '81 % de la capacidad' },
        { ic: 'checkc', l: 'Errores de picking', v: '0', s: 'Cada caja se escanea', cls: 'okk' },
        { ic: 'ware', l: 'Muelles', v: '3<small>/4</small>', s: 'Muelle 3: Unai cargando' },
        { ic: 'clock', l: 'Salida 2ª vuelta', v: '11:05', s: 'Unai · Rochapea 2' }
      ], pl: 772, pr: 0
    }),
    rutas: () => ({
      nav: 'rutas', crumb: 'Planificador', t: 'Planificador de rutas', s: 'Mañana, miércoles 25 · <span class="mono">221</span> pedidos · <span class="mono">6</span> furgonetas · salida <span class="mono">7:00</span>',
      r: seg(['Mapa', 'Secuencia', 'Carga'], 0) + `<button class="btn btn--accent">${ic('send')}Publicar rutas</button>`,
      k: [
        { ic: 'box3d', l: 'Pedidos', v: '221', s: '198 paradas · 23 con ventana' },
        { ic: 'route', l: 'Kilómetros', id: 'kpi-km', v: '634', s: 'Ruta de siempre', cls: '' },
        { ic: 'clock', l: 'Horas de conducción', id: 'kpi-h', v: '41 h 20', s: 'Ruta de siempre' },
        { ic: 'fuel', l: 'Gasoil', id: 'kpi-gas', v: '66<small> L</small>', s: 'Ruta de siempre' },
        { ic: 'truck', l: 'Furgonetas', v: '6<small>/7</small>', s: 'La 7 queda de apoyo' },
        { ic: 'checkc', l: 'Ventanas horarias', v: '100<small> %</small>', s: 'Casco Antiguo de 7 a 11 h', cls: 'okk' }
      ], pl: 432, pr: 0
    }),
    albaranes: () => ({
      nav: 'albaranes', crumb: 'Albaranes', t: 'Albaranes', s: 'Se firman en el móvil del repartidor y llegan a la oficina al momento',
      r: seg(['Hoy', 'Semana', 'Mes'], 0) + `<button class="btn">${FILE('xlsx')}Exportar a contabilidad</button>`,
      k: [
        { ic: 'pen', l: 'Firmados hoy', id: 'kpi-alb', v: '149', s: 'Con nombre, hora y GPS', sp: spark([20, 48, 80, 112, 131, 149], '#19A974') },
        { ic: 'clock', l: 'Pendientes de firma', id: 'kpi-pf', v: '3', s: 'En reparto ahora mismo' },
        { ic: 'alert', l: 'Con incidencia', v: '1', s: 'Bar La Plaza · mañana 9:10' },
        { ic: 'cam', img: 'jpg', l: 'Con foto', v: '41', s: 'Entregas sin firma en mano' },
        { ic: 'bolt', l: 'Llegan a la oficina en', v: '2<small> s</small>', s: 'Antes, al volver la furgoneta' },
        { ic: 'doc', img: 'pdf', l: 'Albaranes en papel', v: '0', s: 'Ahorro de 1.200 hojas al mes', cls: 'okk' }
      ], pl: 602, pr: 360
    }),
    cobros: () => ({
      nav: 'cobros', crumb: 'Cobros', t: 'Cobros y cierre de rutas', s: 'Cada ruta cuadra su caja al volver al almacén · vuelta de mañana',
      r: seg(['Hoy', 'Ayer', 'Semana'], 0) + `<button class="btn">${FILE('csv')}Enviar cierre a contabilidad</button>`,
      k: [
        { ic: 'euro', l: 'Cobrado hoy', id: 'kpi-cob', v: num(COBRADO, 2) + '<small> €</small>', s: '<span class="up">+6 %</span> que el martes pasado' },
        { ic: 'cash', img: 'dinero', l: 'Efectivo', v: num(sum('ef'), 2) + '<small> €</small>', s: 'Se entrega en caja al volver' },
        { ic: 'card', img: 'tarjeta', l: 'Tarjeta (datáfono)', v: num(sum('tj'), 2) + '<small> €</small>', s: '49 % de lo cobrado' },
        { ic: 'doc', img: 'factura', l: 'Recibo domiciliado', v: num(sum('rc'), 2) + '<small> €</small>', s: 'Clientes con crédito' },
        { ic: 'clock', l: 'Pendiente de cobro', v: num(sum('pd'), 2) + '<small> €</small>', s: '2 clientes · aviso programado', cls: 'hl' },
        { ic: 'checkc', l: 'Rutas cerradas', id: 'kpi-rc', v: '0<small>/6</small>', s: 'Sin descuadres hoy' }
      ], pl: 912, pr: 0
    }),
    informe: () => ({
      nav: 'informe', crumb: 'Informes', t: 'Informe del día', s: 'Martes, 24 de noviembre · se actualiza solo con cada entrega',
      r: seg(['Día', 'Semana', 'Mes'], 0) + `<button class="btn">${FILE('pdf')}Enviar a dirección</button>`,
      k: [
        { ic: 'clock', l: 'Entregas a tiempo', id: 'kpi-r1', v: '97,2<small> %</small>', s: '<span class="up">+4,1 puntos</span> este mes', cls: 'okk' },
        { ic: 'route', l: 'Km ahorrados hoy', id: 'kpi-r2', v: '125<small> km</small>', s: 'Frente a la ruta de siempre' },
        { ic: 'leaf', l: 'CO₂ evitado', id: 'kpi-r3', v: '33<small> kg</small>', s: '≈ 1,6 árboles al año' },
        { ic: 'euro', l: 'Coste por entrega', id: 'kpi-r4', v: '2,84<small> €</small>', s: '<span class="up">−0,61 €</span> que en octubre' },
        { ic: 'fuel', l: 'Gasoil ahorrado', v: '12<small> L</small>', s: 'Unos 19 € hoy' },
        { ic: 'wa', l: 'Clientes avisados', v: '23', s: 'Retrasos y cambios, sin llamar' }
      ], pl: 832, pr: 0
    })
  };

  let curView = null;
  function setView(key, o = {}) {
    const v = VIEWS[key](o);
    navOn(v.nav === 'control' && o.inc === 'open' ? 'incid' : v.nav, o.inc === 'open');
    $('#crumb').textContent = o.inc === 'open' ? 'Incidencias' : v.crumb;
    const same = curView === key + (o.inc || '');
    curView = key + (o.inc || '');
    const ph = $('.ph'), kp = $('#kpis');
    $('#ph-t').textContent = o.inc === 'open' ? 'Torre de control · incidencia' : v.t; $('#ph-s').innerHTML = v.s; $('#ph-r').innerHTML = v.r;
    kp.innerHTML = v.k.map(kpi).join('');
    if (!same) [ph, kp].forEach(el => { el.classList.remove('swap-in'); void el.offsetWidth; el.classList.add('swap-in'); });
    mapUI(v.pl, v.pr);
  }
  function mapUI(pl, pr) {
    const free = 1328 - pl - pr;
    $('#mapui').innerHTML = `
      <div class="mtool" style="left:${12 + pl}px">
        <div class="seg"><span class="on">${ic('box3d')}3D</span><span>${ic('map')}2D</span></div>
        ${free > 560 ? `<span class="mchip on"><span class="sw">${R.map(r => `<i style="background:${r.color}"></i>`).join('')}</span>6 rutas</span>` : ''}
        ${free > 760 ? `<span class="mchip">${ic('layers')}Capas</span>` : ''}
      </div>
      <div class="mlive" style="right:${12 + pr}px"><span class="live"></span><b>En directo</b><span class="mono" id="upd">hace 1 s</span></div>
      <div class="mzoom" style="right:${12 + pr}px"><span>${ic('plus')}</span><span>${ic('minus')}</span><span>${ic('compass')}</span></div>
      <div class="mscale" style="left:${14 + pl}px"><i></i>200 m · Pamplona</div>`;
  }

  // ------------------------------------------------------------------ paneles flotantes
  function panel(html, style, cls = '') {
    const el = document.createElement('div'); el.className = 'pn ' + cls; el.style.cssText = style; el.innerHTML = html;
    ov.appendChild(el); void el.offsetWidth; el.classList.add('in'); return el;
  }
  function clearOv() { ov.innerHTML = ''; }

  // flota
  const statusOf = v => {
    if (v.ru.d.id === 'R1' && M.blp().state === 'incident' && v.hold != null) return '<span class="chip chip--bad"><i></i>Parado</span>';
    if (v.dwell > 0 || (v.hold != null && v.v < .05)) return '<span class="chip chip--ok"><i></i>Descargando</span>';
    if (v.ru.d.id === 'R4') return '<span class="chip chip--ac"><i></i>+6 min</span>';
    return '<span class="chip chip--info"><i></i>En ruta</span>';
  };
  const etaOf = (v) => { const s = M.nextStop(v); if (!s) return ['—', '']; const L = v.ru.path.L; const dd = (s.d - v.d + L) % L; return [s.name, hhmm(clockS() + 60 + dd * 2.2)]; };
  function flotaPanel(selId) {
    const rows = M.vans.map(v => {
      const rd = v.ru.d, h = hechas(v), [nx, eta] = etaOf(v);
      return `<div class="fl__r ${rd.id === selId ? 'sel' : ''}" data-v="${rd.id}" style="--c:${rd.color}"><i></i>${face(rd.foto, 'fr')}
        <div><div class="fl__n"><b>${rd.conductor}</b><small>R${rd.n}</small></div>
          <div class="fl__m"><div class="bar"><i style="transform:scaleX(${h / rd.total})"></i></div><span class="mono">${h}/${rd.total}</span></div>
          <div class="fl__x">Próxima: <b>${nx}</b></div></div>
        <div class="rt">${statusOf(v)}<span class="mono">ETA ${eta}</span></div></div>`;
    }).join('') + `<div class="fl__r" style="--c:#B3B7BE"><i></i>${face(5, 'fr')}<div><div class="fl__n"><b>Unai Lasa</b><small>F7 · 2ª vuelta</small></div>
      <div class="fl__m"><div class="bar"><i style="transform:scaleX(.62)"></i></div><span class="mono">5/8 pal</span></div><div class="fl__x">Muelle 3 · sale a las <b>11:05</b></div></div>
      <div class="rt"><span class="chip chip--ac"><i></i>Cargando</span><span class="mono">5512 LCC</span></div></div>`;
    const el = panel(`<div class="pn__h"><h3>Flota</h3><small>7 furgonetas · 6 en ruta</small><div class="r"><span class="chip chip--mute">${ic('filter')}Todas</span></div></div><div class="fl">${rows}</div>`,
      'right:12px;top:12px;width:330px;bottom:12px');
    el.addEventListener('click', e => { const r = e.target.closest('[data-v]'); if (r && MODE !== 'card') followVan(M.vans.find(v => v.ru.d.id === r.dataset.v)); });
    return el;
  }
  function refreshFlota() {
    const el = ov.querySelector('.fl'); if (!el) return;
    el.querySelectorAll('[data-v]').forEach(r => {
      const v = M.vans.find(q => q.ru.d.id === r.dataset.v), rd = v.ru.d, h = hechas(v), [nx, eta] = etaOf(v);
      bar(r.querySelector('.bar i'), h / rd.total * 100);
      r.querySelector('.fl__m .mono').textContent = `${h}/${rd.total}`;
      r.querySelector('.fl__x b').textContent = nx;
      r.querySelector('.rt').innerHTML = statusOf(v) + `<span class="mono">ETA ${eta}</span>`;
      r.classList.toggle('sel', M.selVan === v);
    });
  }
  // actividad
  let feedEl = null;
  function feedPanel(extra = []) {
    const base = [['10:43', 'check', '<b>Iker</b> entregó en Hotel Puente · <span class="mono">19</span> cajas', '--ok'],
      ['10:42', 'wa', 'Pedido por WhatsApp de <b>Cafetería Ulzama</b>', '--info'],
      ['10:40', 'pallet', '<b>Unai</b> empieza a cargar en el muelle 3', '--ac'],
      ['10:38', 'check', '<b>Ane</b> entregó en Restaurante Ardoa · <span class="mono">12</span> cajas', '--ok'],
      ['10:35', 'route', 'Ruta 4 recalculada por obras en C/ Iturrama', '--vi']];
    const items = extra.concat(base).slice(0, 6);
    const el = panel(`<div class="pn__h"><h3>Actividad</h3><small>en directo</small><div class="r"><span class="live"></span></div></div><div class="feed">${items.map(f => feedItem(...f)).join('')}</div>`,
      'left:12px;bottom:12px;width:330px;height:226px');
    feedEl = el.querySelector('.feed');
    return el;
  }
  const feedItem = (t, i, h, c) => `<div class="feed__i"><span class="mono">${t}</span><span style="color:var(${c})">${ic(i)}</span><span>${h}</span></div>`;
  function feedAdd(i, h, c) {
    if (!feedEl || !feedEl.isConnected) return;
    feedEl.insertAdjacentHTML('afterbegin', feedItem(hhmm(clockS()), i, h, c));
    while (feedEl.children.length > 6) feedEl.lastElementChild.remove();
  }
  // detalle de una furgoneta
  function vanPanel(v) {
    const rd = v.ru.d, h = hechas(v), L = v.ru.path.L;
    const ahead = v.ru.stops.filter(s => s.state !== 'moved').map(s => ({ s, dd: (s.d - v.d + L) % L })).filter(o => o.dd > .05).sort((a, b) => a.dd - b.dd);
    const nx = ahead[0].s;
    const tl = ahead.slice(0, Math.min(5, v.ru.stops.length - 2)).map((o, k) => `<div class="tl__i ${k === 0 ? 'now' : ''}"><span class="mono">${hhmm(clockS() + 60 + o.dd * 2.2)}</span><i></i><span>${o.s.name}</span><em>${o.s.cajas} cj</em></div>`).join('');
    const prev = v.ru.stops.map(s => ({ s, db: (v.d - s.d + L) % L })).sort((a, b) => a.db - b.db).slice(0, 2).reverse()
      .map(o => `<div class="tl__i ok"><span class="mono">${hhmm(clockS() - 120 - o.db * 2.2)}</span><i></i><span>${o.s.name}</span><em style="color:var(--ok)">✓</em></div>`).join('');
    return panel(`
      <div class="vd__top" style="--c:${rd.color}">${face(rd.foto, 'big')}<div><b>${rd.conductor}</b><small>Ruta ${rd.n} · ${rd.zona} · ${rd.vehiculo} <span class="mono">${rd.matricula}</span></small></div><span class="chip chip--info" style="margin-left:auto"><i></i>En ruta</span></div>
      <div class="vd__grid"><div><small>Paradas</small><span class="mono" id="vd-p">${h}<small>/${rd.total}</small></span></div><div><small>Carga</small><span class="mono">${rd.kg}<small> kg</small></span></div><div><small>Cobrado</small><span class="mono">${num(rd.cobrado, 0)}<small> €</small></span></div></div>
      <div class="vd__grid"><div><small>Velocidad</small><span class="mono" id="vd-v">24<small> km/h</small></span></div><div><small>Km hoy</small><span class="mono">46,2</span></div><div><small>Puntualidad</small><span class="mono" style="color:var(--ok)">100<small> %</small></span></div></div>
      <div class="vd__next"><small>Próxima parada</small><b>${nx.name}</b><p><span>${nx.addr} · ${nx.cajas} cajas</span><span class="mono" style="color:var(--tx)">ETA ${hhmm(clockS() + 60 + ahead[0].dd * 2.2)}</span></p></div>
      <div class="tl" style="--c:${rd.color}">${prev}${tl}</div>`, 'right:12px;top:12px;width:330px;bottom:12px');
  }

  // ------------------------------------------------------------------ toasts y cursor
  function toast(icon, title, sub, cls = '') {
    if (MODE === 'card') return;
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `<span class="ti ${cls}">${icon === 'wa' ? '<img src="../assets/logos/whatsapp.svg" alt="" style="width:16px;height:16px">' : icon.startsWith('file:') ? FILE(icon.slice(5)).replace('class="fi"', 'class="fi" style="width:18px;height:18px;margin:0"') : ic(icon)}</span><div><b>${title}</b><small>${sub}</small></div>`;
    $('#toasts').appendChild(el);
    later(3.6, () => { el.classList.add('bye'); later(.4, () => el.remove()); });
  }
  const cur = $('#cursor');
  function stageXY(el, fx = .5, fy = .5) {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return [(r.left - s.left + r.width * fx) / scale, (r.top - s.top + r.height * fy) / scale];
  }
  function cursorTo(el, dur = .7, fx = .5, fy = .55) {
    if (!el) return;
    const [x, y] = stageXY(el, fx, fy);
    if (!cur.classList.contains('on')) { cur.style.transition = 'none'; cur.style.transform = `translate(${x + 140}px,${y + 120}px)`; void cur.offsetWidth; cur.classList.add('on'); }
    cur.style.transition = `transform ${dur}s cubic-bezier(.45,.05,.25,1), opacity .3s`;
    cur.style.transform = `translate(${x}px,${y}px)`;
  }
  function click(el) {
    cur.classList.remove('click'); void cur.offsetWidth; cur.classList.add('click');
    if (el) { el.classList.add('press'); later(.18, () => el.classList.remove('press')); }
  }
  const cursorOff = () => cur.classList.remove('on');

  function typeText(el, text, sec, dur, done) {
    el.classList.add('caret');
    tween(sec, dur, p => { el.textContent = text.slice(0, Math.round(text.length * p)); if (p >= 1) { el.classList.remove('caret'); done && done(); } });
  }
  function countTo(el, from, to, sec, dur, fmt) { let q = -1; tween(sec, dur, p => { const n = p >= 1 ? 1e9 : Math.floor(T * 10); if (n === q) return; q = n; el.innerHTML = fmt(from + (to - from) * ease(p)); }); }

  // ------------------------------------------------------------------ pasos del tour
  let tagsStep = [];
  const stepTag = (...a) => { const t = M.tag(...a); tagsStep.push(t); return t; };
  function followVan(v, dist = 64) {
    M.select(v);
    M.vans.forEach(q => q.tag.el.classList.toggle('sel', q === v));
    M.fly({ van: v, dist, polar: .8, az: M.cam.az + .5, dur: 1.9, shift: -171 });
    const old = ov.querySelector('.pn'); if (old && old.querySelector('.fl')) { old.classList.add('out'); later(.25, () => old.remove()); }
    later(.3, () => { vanPanel(v); });
  }
  function resetScene() {
    jobs = []; cursorOff(); clearOv(); feedEl = null;
    tagsStep.forEach(t => M.removeTag(t)); tagsStep = [];
    M.select(null); M.vans.forEach(q => q.tag.el.classList.remove('sel'));
    M.dim(null); M.optimizer(0); M.dropOrder(0, 0, false); M.loading(false);
    M.vans.forEach(v => { if (v.ru.d.id !== 'R1') M.hold(v, null); });
    $('#toasts').innerHTML = '';
  }
  const OVERVIEW = { target: [4, 4], dist: 215, polar: .8, orbit: true };

  const blpTag = () => {
    const s = M.blp();
    const t = stepTag('<div><i></i><b>Bar La Plaza</b><small>cerrado al llegar</small></div>', 'tag--pin bad below', [s.x, s.z], { y: 0 });
    return t;
  };
  function setBlpTag(t, moved) {
    if (moved) { t.el.className = 'tag tag--pin moved below'; t.el.innerHTML = `<div>${ic('clock')}<b>Bar La Plaza</b><small>mañana 9:10</small></div>`; }
  }

  const STEPS = [
    { title: 'Rutas en vivo', text: 'Las seis furgonetas circulan por el mapa 3D y cada entrega se marca sola.', ms: 6500,
      go() {
        M.setIncident('none'); setView('control', { inc: 'none' });
        M.fly({ ...OVERVIEW, az: -.32, dur: 1.6, shift: -171 });
        flotaPanel(); feedPanel();
        at(1.2, () => toast('wa', 'Nuevo pedido por WhatsApp', 'Bar Gure Txoko · 3 líneas · entra solo en la bandeja', 'wa'));
      } },
    { title: 'Sigue una furgoneta', text: 'Pulsas en Marta y la cámara vuela hasta ella: próxima parada, carga y cobros.', ms: 6000,
      go() {
        M.setIncident('none'); setView('control', { inc: 'none' });
        M.fly({ ...OVERVIEW, dist: 200, az: -.2, dur: 1.0, shift: -171 });
        flotaPanel(); feedPanel();
        const marta = M.vans[1];
        at(.5, () => cursorTo(ov.querySelector('[data-v="R2"]'), .8, .4, .45));
        at(1.35, () => { const r = ov.querySelector('[data-v="R2"]'); click(r); r && r.classList.add('sel'); });
        at(1.6, () => { cursorOff(); followVan(marta, 96); });
        every(.5, () => {
          if (M.selVan !== marta) return;
          const s = M.nextStop(marta), st = marta.tag.el.querySelector('.st');
          if (st) st.textContent = marta.dwell > 0 ? '· descargando' : s ? '→ ' + s.name : '';
          const vv = $('#vd-v'); if (vv) vv.innerHTML = Math.round(marta.v * 7.2) + '<small> km/h</small>';
          const vp = $('#vd-p'); if (vp) vp.innerHTML = hechas(marta) + '<small>/' + marta.ru.d.total + '</small>';
        });
      } },
    { title: 'Pedidos que entran solos', text: 'Llegan por WhatsApp, correo o la web y el asistente los convierte en pedidos.', ms: 7000,
      go() {
        M.setIncident('none'); setView('pedidos');
        M.fly({ target: [X(10), Z(3.5)], dist: 118, polar: .9, az: -.15, dur: 1.8, shift: 411 });
        pedidosPanel();
      } },
    { title: 'Almacén y carga', text: 'El almacén prepara cada ruta y ve cuántos kilos y palés caben en la furgoneta.', ms: 6500,
      go() {
        M.setIncident('none'); setView('almacen');
        M.fly({ target: [M.ware.x - 1, M.ware.docks[2] - 4], dist: 74, polar: .8, az: .62, dur: 2.0, shift: 386 });
        almacenPanel();
      } },
    { title: 'Ruta optimizada', text: 'La ruta de mañana se recalcula sola: 131 km y más de 7 horas menos.', ms: 6500,
      go() {
        M.setIncident('none'); setView('rutas');
        M.dim(['R2']);
        M.fly({ target: [X(9.6), Z(3)], dist: 118, polar: .82, az: -.12, dur: 1.8, shift: 216 });
        rutasPanel();
      } },
    { title: 'Una incidencia en ruta', text: 'Bar La Plaza está cerrado y el asistente propone pasar mañana a las 9:10, cuando Javi va por su calle.', ms: 6500,
      go() { incidencia(false); } },
    { title: 'Un toque y resuelto', text: 'Se mueve el pedido, la ruta se rehace en el mapa y el cliente recibe un WhatsApp.', ms: 7000,
      go() { incidencia(true); } },
    { title: 'Albarán firmado', text: 'El cliente firma en el móvil del repartidor y el albarán llega a la oficina al momento.', ms: 6500,
      go() {
        M.setIncident('resolved'); setView('albaranes');
        const marta = M.vans[1], kup = marta.ru.stops[0];
        M.hold(marta, kup.d - .01, true); M.select(marta); marta.tag.el.classList.add('sel');
        marta.tag.el.querySelector('.st').textContent = '· Sidrería Kupela';
        M.fly({ van: marta, dist: 112, polar: .72, az: .35, dur: 1.9, shift: 100 });
        albaranesPanel();
      } },
    { title: 'Cobros y cierre', text: 'Cada ruta cuadra su caja al volver: efectivo, tarjeta y lo que queda pendiente.', ms: 6000,
      go() {
        M.setIncident('resolved'); setView('cobros');
        M.fly({ ...OVERVIEW, target: [6, 4], dist: 236, az: .18, dur: 1.8, shift: 456 });
        cobrosPanel();
      } },
    { title: 'Informe del día', text: 'Entregas a tiempo, kilómetros ahorrados y CO₂ evitado, sin hacer cuentas.', ms: 6500,
      go() {
        M.setIncident('resolved'); setView('informe');
        M.fly({ ...OVERVIEW, target: [4, 4], dist: 250, az: -.42, polar: .9, dur: 1.9, shift: 416 });
        informePanel();
      } }
  ];

  // ---------- paso 3: bandeja de pedidos
  function pedidosPanel() {
    const B = D.BANDEJA, nw = B[0];
    nw.hora = hhmm(clockS());
    const chIc = { wa: 'wa', mail: 'mail', web: 'web', tel: 'tel' };
    const item = (b, cls = '') => `<div class="ib__it ${cls}" data-id="${b.id}"><span class="lgw">${logo(b.cli)}${chan(b.canal, 'sm')}</span><div><b>${b.cli}</b><p>${b.canal === 'mail' && /PDF|adjunto/.test(b.txt) ? FILE('pdf') : ''}${b.txt}</p></div><span class="mono">${b.hora}</span>${b.nuevo ? '<i class="nw"></i>' : ''}</div>`;
    const el = panel(`<div class="ib">
      <div class="ib__l"><div class="ib__tabs"><span class="chip chip--info">Todos · 7</span><span class="chip"><img class="cl" src="../assets/logos/whatsapp.svg" alt="">3</span><span class="chip"><img class="cl" src="../assets/logos/gmail.svg" alt="">2</span><span class="chip">${ic('web')}2</span><span class="chip">${ic('tel')}1</span></div>
        <div class="ib__list">${B.slice(1).map(b => item(b)).join('')}</div></div>
      <div class="ib__d">
        <div class="ib__who"><span class="lgw">${logo(nw.cli, 'lg--md')}${chan('wa', 'sm')}</span><div><b>${nw.cli}</b><small>${nw.quien} · por WhatsApp · cliente desde 2019</small></div><span class="chip chip--ac" style="margin-left:auto"><i></i>Nuevo · ${nw.hora}</span></div>
        <div class="bubble"><span id="wa-txt"></span><small>${nw.hora} ✓✓</small></div>
        <div class="ai" id="ai-l" style="opacity:0">${ic('spark', 'spin')}<span>El asistente está leyendo el mensaje…</span></div>
        <table class="tbl" id="ped-t" style="opacity:0"><thead><tr><th>Código</th><th>Producto</th><th class="n">Cant.</th><th class="n">Precio</th><th class="n">Importe</th></tr></thead><tbody></tbody></table>
        <div class="sug" id="ped-s"></div>
        <div class="ib__f"><div class="tot"><small>Total sin IVA</small><b class="mono" id="ped-tot">0,00 €</b></div><button class="btn">Editar</button><button class="btn btn--accent" id="ped-ok">${ic('check')}Confirmar pedido</button></div>
      </div></div>`, 'left:12px;top:12px;bottom:12px;width:800px');
    const list = el.querySelector('.ib__list');
    at(.7, () => { list.insertAdjacentHTML('afterbegin', item(nw, 'enter sel')); const pc = $('#kpi-pc'); if (pc) pc.textContent = '7'; });
    typeText($('#wa-txt', el), nw.txt, 1.0, 1.5);
    at(2.6, () => { $('#ai-l').style.cssText = 'opacity:1;transition:opacity .3s'; });
    at(2.9, () => { $('#ped-t').style.cssText = 'opacity:1;transition:opacity .3s'; });
    let tot = 0;
    nw.lineas.forEach((l, k) => at(3.0 + k * .35, () => {
      tot += l[2] * l[4];
      $('#ped-t tbody').insertAdjacentHTML('beforeend', `<tr class="row-in"><td class="id">${l[0]}</td><td><b>${l[1]}</b></td><td class="n mono">${l[2]} ${l[3]}</td><td class="n mono">${num(l[4], 2)}</td><td class="n mono">${num(l[2] * l[4], 2)}</td></tr>`);
      $('#ped-tot').textContent = eur(tot);
    }));
    at(4.1, () => {
      $('#ai-l').innerHTML = `${ic('spark')}<span>Leído en 2 s · 3 líneas, sin dudas</span>`;
      const s = $('#ped-s');
      [['ok', 'Stock disponible'], ['info', 'Ruta 2 · Marta · mañana 9:00–11:00'], ['ok', 'Cliente al día de pagos'], ['ac', 'Pide antes de las 11: encaja']].forEach((c, k) =>
        later(k * .15, () => s.insertAdjacentHTML('beforeend', `<span class="chip chip--${c[0]} row-in"><i></i>${c[1]}</span>`)));
    });
    at(4.6, () => cursorTo($('#ped-ok'), .7));
    at(5.4, () => {
      const b = $('#ped-ok'); click(b); b.classList.add('done'); b.innerHTML = ic('check') + 'Confirmado';
      const it = list.querySelector('.ib__it.sel .nw'); it && it.remove();
      const pc = $('#kpi-pc'); if (pc) pc.textContent = '6'; const mn = $('#kpi-man'); if (mn) mn.textContent = '88';
      M.dropOrder(10, 3.5, true);
      stepTag(`<div>${ic('pin')}<b>${nw.cli}</b><small>mañana 9:00–11:00</small></div>`, 'tag--pin new', [X(10), Z(3.5)], { y: 6.6 });
      toast('check', `Pedido ${nw.id} confirmado`, 'Ruta 2 · Marta · mañana de 9:00 a 11:00 · 361,00 €');
    });
    at(6.0, cursorOff);
  }

  // ---------- paso 4: almacén
  function almacenPanel() {
    const waves = [
      ['R1', 'Javi', 'Casco Antiguo', 100, 'Cargada'], ['R2', 'Marta', 'Ensanche', 100, 'Cargada'], ['R5', 'Iker', 'Rochapea', 100, 'Cargada'],
      ['F7', 'Unai', 'Rochapea 2', 62, 'Cargando'], ['R3', 'Luis', 'San Juan', 44, 'Picking'], ['R6', 'Sara', 'Txantrea', 18, 'En cola']];
    const col = id => id === 'F7' ? '#B3B7BE' : R.find(r => r.id === id).color;
    const chip = s => s === 'Cargada' ? 'ok' : s === 'Cargando' ? 'ac' : s === 'Picking' ? 'info' : 'mute';
    const scan = [['EG-BAR30', 'Estrella Galicia · barril 30 L', '×4', '128 kg'], ['KL-BAR30', 'Keler · barril 30 L', '×2', '64 kg'], ['CC-24', 'Coca-Cola · caja 24 latas', '×12', '108 kg'],
      ['AG-15', 'Agua Insalus 1,5 L · pack 6', '×20', '186 kg'], ['TX-GT6', 'Txakoli Getaria · caja 6', '×3', '27 kg'], ['RS-NA6', 'Rosado de Navarra · caja 6', '×5', '45 kg'], ['HI-4', 'Hielo · saco 4 kg', '×10', '40 kg']];
    const el = panel(`<div class="wh">
      <div class="wh__l"><div class="pn__h"><h3>Preparación por ruta</h3><small>2ª vuelta · 6 olas de picking</small><div class="r"><span class="chip chip--ok"><i></i>0 errores</span></div></div>
        ${waves.map(w => `<div class="wave ${w[0] === 'F7' ? 'sel' : ''}" style="--c:${col(w[0])}" data-w="${w[0]}"><i></i>${face(w[0] === 'F7' ? 5 : R.find(r => r.id === w[0]).foto, 'sm')}<div><b>${w[0] === 'F7' ? 'F7' : w[0]} · ${w[1]}</b><small>${w[2]}</small></div><div class="bar"><i style="transform:scaleX(${w[3] / 100})"></i></div><span class="mono">${w[3]} %</span><span class="chip chip--${chip(w[4])}"><i></i>${w[4]}</span></div>`).join('')}
        <div class="pn__h" style="border-top:1px solid var(--line)"><h3>Lecturas en el muelle 3</h3><small>lector de Unai</small><div class="r"><span class="live"></span></div></div>
        <div class="scan" id="scan"></div></div>
      <div class="wh__r"><div class="pn__h" style="margin:-14px -14px 26px"><h3>F7 · Renault Master</h3><small class="mono">5512 LCC</small></div>
        <div class="cargo" id="cargo">${Array.from({ length: 8 }, (_, k) => `<div class="slot">P${k + 1}</div>`).join('')}</div>
        <div class="gauge"><small><span>${ic('kg')} Peso</span><span class="mono" id="g-kg">640 / 1.400 kg</span></small><div class="bar"><i id="g-kgb" style="transform:scaleX(.46);background:var(--accent)"></i></div></div>
        <div class="gauge"><small><span>${ic('cube')} Volumen</span><span class="mono" id="g-m3">6,1 / 11 m³</span></small><div class="bar"><i id="g-m3b" style="transform:scaleX(.55);background:#8FB0FF"></i></div></div>
        <div class="unl"><small>Orden de descarga</small>
          <div><span class="mono">P8</span><b>Hotel Puente</b><em class="mono">1ª · 11:18</em></div>
          <div><span class="mono">P7</span><b>Bar Txantxangorri</b><em class="mono">2ª · 11:26</em></div>
          <div><span class="mono">P5–6</span><b>Asador Rochapea</b><em class="mono">3ª · 11:34</em></div></div>
        <button class="btn btn--sm" id="g-go" style="margin-top:auto">${ic('truck')}Cerrar carga y salir · 11:05</button></div></div>`, 'left:12px;top:12px;bottom:12px;width:760px');
    const slots = el.querySelectorAll('.slot');
    for (let k = 0; k < 5; k++) slots[k].classList.add('on'), slots[k].textContent = 'P' + (k + 1) + ' ✓';
    M.loading(true);
    let kg = 640, m3 = 6.1;
    scan.forEach((s, k) => at(.5 + k * .55, () => {
      $('#scan').insertAdjacentHTML('afterbegin', `<div class="scan__i">${ic('checkc', 'ok')}<span class="id">${s[0]}</span><span>${s[1]}</span><span class="mono">${s[2]}</span><span class="mono" style="text-align:right">${s[3]}</span></div>`);
      while ($('#scan').children.length > 6) $('#scan').lastElementChild.remove();
      kg += [62, 64, 66, 70, 58, 62, 62][k]; m3 += .45;
      $('#g-kg').textContent = num(kg) + ' / 1.400 kg'; bar($('#g-kgb'), kg / 14);
      $('#g-m3').textContent = num(m3, 1) + ' / 11 m³'; bar($('#g-m3b'), m3 / 11 * 100);
      const w = el.querySelector('[data-w="F7"]'), p = Math.min(100, 62 + (k + 1) * 5.5);
      bar(w.querySelector('.bar i'), p); w.querySelector('.mono').textContent = Math.round(p) + ' %';
      const lin = $('#kpi-lin'); if (lin) lin.innerHTML = num(1284 + (k + 1) * 9) + '<small>/1.420</small>';
    }));
    [5, 6, 7].forEach((k, n) => at(1.4 + n * 1.0, () => { slots[k].classList.add('on'); slots[k].textContent = 'P' + (k + 1) + ' ✓'; const p = $('#kpi-pal'); if (p) p.textContent = 39 + n; }));
    at(4.6, () => {
      const w = el.querySelector('[data-w="F7"]'); w.querySelector('.chip').className = 'chip chip--ok'; w.querySelector('.chip').innerHTML = '<i></i>Cargada';
      const b = $('#g-go'); b.classList.add('btn--accent');
      toast('truck', 'F7 cargada: 8 palés · 1.084 kg', 'Unai sale a las 11:05 con 24 pedidos de Rochapea', 'ac');
    });
  }

  // ---------- paso 5: optimizador
  function rutasPanel() {
    const rows = [['Kilómetros', 634, 503, 'km', 0], ['Horas de conducción', 41.33, 34.08, 'h', 1], ['Paradas por hora', 5.2, 6.3, '', 1], ['Gasoil', 66, 53, 'L', 0], ['CO₂', 172, 138, 'kg', 0]];
    const fmtH = v => { const h = Math.floor(v), m = Math.round((v - h) * 60); return `${h} h ${String(m).padStart(2, '0')}`; };
    const f = (r, v) => r[3] === 'h' ? fmtH(v) : num(v, r[4] && r[3] !== 'h' ? 1 : 0) + (r[3] ? ' ' + r[3] : '');
    const el = panel(`<div class="pn__h"><h3>Optimización</h3><small>Ruta 2 · Ensanche · Marta</small><div class="r"><span class="chip chip--info">${ic('spark')}Asistente</span></div></div>
      <div class="opt">
        <div class="opt__run" id="opt-run">${ic('spark', 'spin')}<span id="opt-msg">Ruta de siempre cargada · 38 paradas</span><div class="bar"><i id="opt-bar" style="transform:scaleX(0);background:var(--accent);transition:none"></i></div></div>
        <div><div class="cmp" style="height:24px;border:0;font:500 10.5px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--tx4)"><span>Las 6 rutas</span><span style="text-align:right">Antes</span><span></span><span style="text-align:right">Después</span><span style="text-align:right">Ahorro</span></div>
        ${rows.map((r, k) => `<div class="cmp"><span>${r[0]}</span><span class="mono a">${f(r, r[1])}</span>${ic('arrow')}<span class="mono b" id="cmp-${k}">—</span><span class="d" id="cmpd-${k}"></span></div>`).join('')}</div>
        <div class="cons" id="opt-cons"></div>
        <div style="display:flex;gap:8px;margin-top:2px"><button class="btn" style="flex:1">Ver secuencia</button><button class="btn btn--accent" id="opt-ok" style="flex:1.4">${ic('check')}Aplicar a las 6 rutas</button></div>
      </div>`, 'left:12px;top:12px;width:420px');
    M.optimizer(1);
    const ta = stepTag(`<div>${ic('route')}<b>Antes</b><small>9,8 km · 2 h 05</small></div>`, 'tag--pin bad', [X(10), Z(1)], { y: 2 });
    at(1.7, () => { $('#opt-msg').textContent = 'Calculando 221 paradas, ventanas horarias y carga…'; });
    tween(1.7, 1.6, p => { bar($('#opt-bar'), p * 100); });
    at(3.3, () => {
      $('#opt-run').innerHTML = `${ic('checkc')}<span style="color:var(--ok)">Ruta óptima encontrada en 1,6 s</span>`;
      M.optimizer(2);
      ta.el.className = 'tag tag--pin'; ta.el.style.opacity = 0;
      stepTag(`<div style="box-shadow:0 0 0 1.5px #2BB3D1,0 8px 20px -8px rgba(14,14,14,.3)">${ic('route')}<b>Después</b><small>7,1 km · 1 h 31</small></div>`, 'tag--pin', [X(11), Z(3)], { y: 2 });
      rows.forEach((r, k) => {
        countTo($('#cmp-' + k), r[1], r[2], 0, 1.1, v => f(r, v));
        later(1.1, () => { const d = r[2] - r[1]; $('#cmpd-' + k).textContent = (r[0] === 'Paradas por hora' ? '+' : '') + Math.round(Math.abs(d / r[1]) * 100) * (r[0] === 'Paradas por hora' ? 1 : -1) + ' %'; });
      });
      const km = $('#kpi-km'); if (km) { km.closest('.kpi').classList.add('okk'); countTo(km, 634, 503, 0, 1.1, v => Math.round(v) + ''); later(1.1, () => (km.nextElementSibling.innerHTML = '<span class="up">−131 km</span> · optimizada')); }
      const h = $('#kpi-h'); if (h) { countTo(h, 41.33, 34.08, 0, 1.1, fmtH); later(1.1, () => (h.nextElementSibling.innerHTML = '<span class="up">−7 h 15 min</span>')); }
      const g = $('#kpi-gas'); if (g) { countTo(g, 66, 53, 0, 1.1, v => Math.round(v) + '<small> L</small>'); later(1.1, () => (g.nextElementSibling.innerHTML = '<span class="up">−13 L</span> · unos 21 €')); }
    });
    at(4.3, () => { const c = $('#opt-cons'); [['ok', 'Ventanas horarias'], ['ok', 'Capacidad 1.200 kg'], ['ok', 'Casco Antiguo de 7 a 11 h'], ['ok', 'Descanso de 30 min']].forEach((x, k) => later(k * .12, () => c.insertAdjacentHTML('beforeend', `<span class="chip chip--${x[0]} row-in">${ic('check')}${x[1]}</span>`))); });
    at(5.0, () => cursorTo($('#opt-ok'), .6));
    at(5.7, () => { const b = $('#opt-ok'); click(b); b.classList.add('done'); b.innerHTML = ic('check') + 'Rutas publicadas'; toast('send', 'Rutas de mañana publicadas', 'Cada conductor ya las tiene en el móvil'); });
    at(6.2, cursorOff);
  }

  // ---------- pasos 6 y 7: incidencia
  function incidencia(resolve) {
    M.setIncident('open'); setView('control', { inc: 'open' });
    const s = M.blp(), javi = M.vans[0];
    const now = hhmm(clockS()), now1 = hhmm(clockS() + 60);
    M.select(javi); javi.tag.el.classList.add('sel'); javi.tag.el.querySelector('.st').textContent = '· parado';
    M.fly({ target: [s.x + 6, s.z + 4], dist: resolve ? 118 : 84, polar: resolve ? .8 : .86, az: -.32, dur: resolve ? 1.4 : 1.9, shift: -221 });
    const bt = blpTag();
    feedPanel([[now, 'alert', '<b>Javi</b>: Bar La Plaza cerrado al llegar', '--bad']]);
    const el = panel(`<div class="pn__h"><span class="ai">${ic('spark')}Asistente · incidencia</span><div class="r"><span class="chip chip--bad" id="inc-chip"><i></i>Abierta · ${now}</span></div></div>
      <div class="inc__b">
        <div class="inc__rep"><div class="shutter"></div><div><b>Bar La Plaza</b><small style="margin-left:6px">C/ San Nicolás 14</small><p>Javi: «Persiana bajada. He llamado dos veces y no lo cogen.»</p><small>PED-0188 · 12 cajas · 286,40 € · ${FILE('jpg')}persiana.jpg</small></div></div>
        <div class="inc__say" id="inc-say"></div>
        <div class="inc__why" id="inc-why" style="opacity:0"><div><small>Mañana pasa por su calle</small><b>Javi · 9:10</b></div><div><small>Desvío extra</small><b>0 km</b></div><div><small>Hoy la ruta ahorra</small><b>1,2 km</b></div></div>
        <div class="inc__act" id="inc-act" style="opacity:0"><button class="btn btn--accent" id="inc-ok">${ic('clock')}Mover a mañana 9:10</button><button class="btn">${ic('tel')}Llamar</button><button class="btn">${ic('ware')}Almacén</button></div>
        <div class="steps" id="inc-steps" style="display:none">
          <div>${ic('checkc')}<span>Pedido <b>PED-0188</b> movido a mañana, <b>9:10</b></span></div>
          <div>${ic('checkc')}<span>Ruta 1 recalculada: <b>−1,2 km</b> y <b>9 min</b> antes</span></div>
          <div>${ic('checkc')}<span>WhatsApp enviado a <b>Bar La Plaza</b></span></div>
          <div>${ic('checkc')}<span>Albarán <b>ALB-08808</b> pasa a mañana</span></div>
        </div>
      </div>`, 'right:12px;top:12px;width:420px', 'inc');
    const say = $('#inc-say', el), SAY = 'Bar La Plaza está cerrado. Javi pasa mañana a las 9:10 por su calle.';
    const sayHTML = 'Bar La Plaza está cerrado. Javi pasa mañana a las <em>9:10</em> por su calle.';
    const showRest = () => { $('#inc-why').style.cssText = 'opacity:1;transition:opacity .4s'; $('#inc-act').style.cssText = 'opacity:1;transition:opacity .4s'; };
    if (!resolve) {
      typeText(say, SAY, .9, 1.6, () => (say.innerHTML = sayHTML));
      at(2.7, showRest);
      at(3.4, () => toast('alert', 'Incidencia en Ruta 1', 'El asistente ya tiene una propuesta', 'ac'));
      return;
    }
    say.innerHTML = sayHTML; showRest();
    at(.5, () => cursorTo($('#inc-ok'), .7));
    at(1.3, () => {
      const b = $('#inc-ok'); click(b); b.classList.add('done'); b.innerHTML = ic('check') + 'Hecho';
      $('#inc-why').style.display = 'none'; $('#inc-act').style.display = 'none';
      const st = $('#inc-steps'); st.style.display = '';
      st.querySelectorAll('div').forEach((d, k) => later(.15 + k * .55, () => d.classList.add('on')));
    });
    at(1.5, cursorOff);
    at(1.6, () => { M.setIncident('resolved', true); setBlpTag(bt, true); javi.tag.el.querySelector('.st').textContent = '· sigue su ruta'; });
    at(2.2, () => {
      const wa = panel(`<div class="wa__h"><span class="lgw">${logo('Bar La Plaza', 'lg--md')}${chan('wa', 'sm')}</span><div><b>Bar La Plaza</b><small>WhatsApp Business · Distribuciones Arga</small></div></div>
        <div class="wa__b"><div class="wa__m out" id="wa1">Hola, somos Distribuciones Arga 👋 Hoy hemos pasado y estaba cerrado. Os llevamos el pedido <b>mañana miércoles a las 9:10</b>. ¿Os viene bien?<small>${now} ✓✓</small></div>
        <div class="wa__m in" id="wa2">¡Perfecto! Mañana a esa hora estamos. Gracias 🙌<small>${now1}</small></div></div>`, 'left:354px;bottom:12px;width:300px', 'wa');
      later(.25, () => $('#wa1', wa).classList.add('on'));
      later(2.2, () => $('#wa2', wa).classList.add('on'));
    });
    at(4.6, () => {
      const c = $('#inc-chip'); c.className = 'chip chip--ok'; c.innerHTML = '<i></i>Resuelta en 14 s';
      const k = document.querySelector('.kpi.bad'); if (k) { k.className = 'kpi okk'; k.querySelector('.kpi__v').textContent = '0'; k.querySelector('.kpi__s').innerHTML = '<span class="up">1 resuelta</span> en 14 s'; }
      navOn('incid', false);
      feedAdd('wa', '<b>Bar La Plaza</b> confirma: mañana a las 9:10', '--ok');
      toast('wa', 'Bar La Plaza ha respondido', '«¡Perfecto! Mañana a esa hora estamos»', 'wa');
    });
  }

  // ---------- paso 8: albaranes y firma
  function albaranesPanel() {
    const A = D.ALBARANES;
    const st = x => x === 'ok' ? '<span class="chip chip--ok"><i></i>Firmado</span>' : x === 'inc' ? '<span class="chip chip--mute"><i></i>Mañana 9:10</span>' : '<span class="chip chip--ac"><i></i>En la puerta</span>';
    const el = panel(`<div class="pn__h"><h3>Albaranes de hoy</h3><small>149 firmados · 3 pendientes</small><div class="r"><span class="chip chip--mute">${ic('filter')}Todos</span></div></div>
      <table class="tbl"><thead><tr><th>Albarán</th><th>Cliente</th><th>Repartidor</th><th class="n">Hora</th><th>Estado</th></tr></thead><tbody>
      ${A.map(a => `<tr data-a="${a[0]}"><td class="id"><span class="cell">${FILE('pdf')}${a[0]}</span></td><td><span class="cell">${logo(a[1], 'lg--sm')}<b>${a[1]}</b></span></td><td><span class="cell">${face(R.find(r => r.corto === a[2]).foto, 'sm')}${a[2]}</span></td><td class="n mono">${a[3]}</td><td>${st(a[4])}</td></tr>`).join('')}</tbody></table>`,
    'left:12px;top:12px;width:590px');
    const ph = document.createElement('div'); ph.className = 'phone'; ph.style.cssText = 'right:44px;top:24px';
    const now = hhmm(clockS() + 4);
    ph.innerHTML = `<div class="phone__s"><div class="phone__notch"></div><div class="phone__bar"><span>${now}</span><span>5G ▮▮▮</span></div>
      <div class="phone__hd"><small>RUTA 2 · PARADA 23/30</small><b>Sidrería Kupela</b><p>C/ Navas de Tolosa 21 · Pamplona</p></div>
      <div class="phone__card">
        <div class="phone__ln"><span>Estrella Galicia barril 30 L × 2</span><b>192,00</b></div>
        <div class="phone__ln"><span>Coca-Cola caja 24 × 3</span><b>47,40</b></div>
        <div class="phone__ln"><span>Agua Insalus 1,5 L × 6</span><b>41,40</b></div>
        <div class="phone__ln"><span>Txakoli Getaria caja 6 × 1</span><b>62,40</b></div>
        <div class="phone__tot"><span>Total (IVA incl.)</span><b>415,27 €</b></div></div>
      <div class="phone__paym"><span class="on">${FILE('tarjeta')}Tarjeta</span><span>${FILE('dinero')}Efectivo</span><span>${FILE('bizum')}Bizum</span></div>
      <div class="phone__pay">${ic('checkc')}Cobrado con tarjeta · 415,27 €</div>
      <div class="sig"><small>Firma del cliente</small><svg viewBox="0 0 244 118"><path id="sig-p" d="M24 78c8-22 14-38 18-36s-6 34-2 36 12-30 20-30-2 26 4 26 10-18 16-18 0 14 6 14 8-10 14-12 4 10 10 10c8 0 10-18 18-20s0 20 8 20 14-26 24-34 4 30 10 30 18-10 30-14"/></svg><div class="ln"></div><span class="nm">Maite Arrieta · encargada</span></div>
      <button class="phone__btn" id="ph-ok">${ic('pen')}Firmar y enviar</button>
      <div class="phone__gps">GPS 42,8187 · −1,6432 · precisión 4 m</div></div>`;
    ov.appendChild(ph); void ph.offsetWidth; ph.classList.add('in');
    const p = $('#sig-p', ph), L = p.getTotalLength();
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    tween(1.0, 1.9, k => { p.style.strokeDashoffset = L * (1 - k); });
    at(3.2, () => { const b = $('#ph-ok'); b.classList.add('press'); later(.18, () => b.classList.remove('press')); });
    at(3.5, () => { const b = $('#ph-ok'); b.classList.add('done'); b.innerHTML = ic('checkc') + 'Enviado a la oficina'; });
    at(4.0, () => {
      const tr = el.querySelector('[data-a="ALB-08812"]');
      tr.children[3].textContent = now; tr.children[4].innerHTML = st('ok'); tr.classList.add('flash'); later(1.8, () => tr.classList.remove('flash'));
      const k = $('#kpi-alb'); if (k) { k.textContent = '150'; k.classList.add('bump'); }
      const pf = $('#kpi-pf'); if (pf) pf.textContent = '2';
      toast('file:pdf', 'Albarán ALB-08812 firmado', `Sidrería Kupela · Maite Arrieta · ${now} · con GPS`);
    });
  }

  // ---------- paso 9: cobros
  function cobrosPanel() {
    const rd = id => R.find(r => r.id === id);
    const stc = s => s === 'cerrada' ? '<span class="chip chip--ok"><i></i>Cerrada</span>' : s === 'cuadre' ? '<span class="chip chip--ac"><i></i>Cuadrando…</span>' : '<span class="chip chip--info"><i></i>En ruta</span>';
    const el = panel(`<div class="pn__h"><h3>Caja por ruta</h3><small>vuelta de mañana · martes 24</small><div class="r"><span class="chip chip--ok">${ic('check')}Sin descuadres</span></div></div>
      <table class="tbl cb"><thead><tr><th>Ruta</th><th>Conductor</th><th class="n">Entregas</th><th class="n"><span class="cell r">${FILE('dinero')}Efectivo</span></th><th class="n"><span class="cell r">${FILE('tarjeta')}Tarjeta</span></th><th class="n"><span class="cell r">${FILE('factura')}Recibo</span></th><th class="n">Pendiente</th><th class="n">Cuadre</th><th>Estado</th></tr></thead><tbody>
      ${COB.map(c => { const r = rd(c.r); return `<tr data-c="${c.r}"><td><span class="rdot" style="--c:${r.color}"><i></i><b>${c.r}</b></span></td><td><span class="cell">${face(r.foto, 'sm')}${r.conductor}</span></td><td class="n mono">${c.ent}</td><td class="n mono">${num(c.ef, 2)}</td><td class="n mono">${num(c.tj, 2)}</td><td class="n mono">${num(c.rc, 2)}</td><td class="n mono" ${c.pd ? 'style="color:var(--ac)"' : ''}>${c.pd ? num(c.pd, 2) : '—'}</td><td class="n mono">—</td><td>${stc(c.st)}</td></tr>`; }).join('')}
      <tr class="tot-row"><td colspan="2">Total</td><td class="n mono">143/189</td><td class="n mono">${num(sum('ef'), 2)}</td><td class="n mono">${num(sum('tj'), 2)}</td><td class="n mono">${num(sum('rc'), 2)}</td><td class="n mono">${num(sum('pd'), 2)}</td><td class="n mono">0,00</td><td></td></tr></tbody></table>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid var(--line)">
        <div style="padding:12px 14px;border-right:1px solid var(--line)"><small style="color:var(--tx3);font-size:11.5px">Efectivo entregado en caja</small><div class="mono" id="cb-ef" style="font-size:18px;margin-top:3px">0,00 €</div></div>
        <div style="padding:12px 14px;border-right:1px solid var(--line)"><small style="color:var(--tx3);font-size:11.5px">Diferencias de caja</small><div class="mono" style="font-size:18px;margin-top:3px;color:var(--ok)">0,00 €</div></div>
        <div style="padding:12px 14px"><small style="color:var(--tx3);font-size:11.5px">Pendiente de cobro</small><div class="mono" style="font-size:18px;margin-top:3px;color:var(--ac)">${eur(sum('pd'))}</div><small style="color:var(--tx3);font-size:11px">Recordatorio por WhatsApp mañana 9:00</small></div></div>`,
    'left:12px;top:12px;width:900px');
    let closed = 0, ef = 0;
    COB.filter(c => c.at).forEach(c => at(c.at, () => {
      const tr = el.querySelector(`[data-c="${c.r}"]`);
      tr.children[7].textContent = '0,00'; tr.children[7].style.color = 'var(--ok)'; tr.children[8].innerHTML = stc('cerrada'); tr.classList.add('flash'); later(1.8, () => tr.classList.remove('flash'));
      closed++; const k = $('#kpi-rc'); if (k) { k.innerHTML = closed + '<small>/6</small>'; k.classList.add('bump'); k.closest('.kpi').classList.add('okk'); }
      countTo($('#cb-ef'), ef, ef + c.ef, 0, .8, v => eur(v)); ef += c.ef;
      toast('file:dinero', `Ruta ${c.r.slice(1)} cerrada · ${rd(c.r).corto}`, `${num(c.ef, 2)} € en efectivo entregados · cuadre 0,00 €`);
    }));
  }

  // ---------- paso 10: informe
  function informePanel() {
    const H = ['7', '8', '9', '10', '11', '12', '13', '14'], plan = [20, 36, 42, 40, 34, 24, 12, 6], real = [22, 38, 44, 48];
    const cw = 760, ch = 190, bw = 40, gap = (cw - 40) / H.length, mx = 50;
    const y = v => ch - v / mx * (ch - 14);
    const line = plan.map((v, k) => `${k ? 'L' : 'M'}${40 + gap * k + gap / 2} ${y(v)}`).join('');
    const bars = real.map((v, k) => `<rect class="rb" data-k="${k}" x="${40 + gap * k + gap / 2 - bw / 2}" y="${ch}" width="${bw}" height="0" rx="4" fill="${k === 3 ? '#2F62E0' : '#5B8CFF'}" opacity="${k === 3 ? 1 : .9}" data-h="${ch - y(v)}"/><text x="${40 + gap * k + gap / 2}" y="${y(v) - 7}" text-anchor="middle" fill="#2A2B2E" font-size="11.5" font-weight="600" font-family="Inter" class="rt" opacity="0">${v}</text>`).join('');
    const grid = [0, 25, 50].map(v => `<line x1="40" x2="${cw}" y1="${y(v)}" y2="${y(v)}" stroke="#E8E9EC"/><text x="30" y="${y(v) + 4}" text-anchor="end" fill="#9A9EA6" font-size="11" font-family="Inter">${v}</text>`).join('');
    const xl = H.map((h, k) => `<text x="${40 + gap * k + gap / 2}" y="${ch + 16}" text-anchor="middle" fill="#9A9EA6" font-size="11" font-family="Inter">${h}:00</text>`).join('');
    const rk = R.map(r => ({ r, e: r.hechas, p: { R1: 94, R2: 100, R3: 100, R4: 96, R5: 98, R6: 99 }[r.id] })).sort((a, b) => b.e - a.e);
    const NE = entregados(); const SUM = 'Hoy van ' + NE + ' entregas y el 97,2 % ha llegado dentro de su ventana. Las rutas optimizadas han ahorrado 125 km frente a las de siempre, 33 kg de CO₂ menos. La única incidencia, Bar La Plaza, se resolvió en 14 segundos y el pedido sale mañana a las 9:10 con Javi.';
    const el = panel(`<div class="rp">
      <div class="rp__chart"><div class="pn__h" style="margin:-12px -16px 10px"><h3>Entregas por hora</h3><small>real frente a plan</small></div>
        <div class="rp__leg"><span><i style="background:#5B8CFF"></i>Real</span><span><i style="background:#9A9EA6"></i>Plan</span><span><i style="background:#2F62E0"></i>Hora en curso</span></div>
        <svg viewBox="0 0 ${cw} ${ch + 22}"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB224"/><stop offset="1" stop-color="#FFB224" stop-opacity=".35"/></linearGradient></defs>
          ${grid}${bars}<path id="rp-line" d="${line}" fill="none" stroke="#9A9EA6" stroke-width="1.5" stroke-dasharray="4 4"/>${plan.map((v, k) => `<circle cx="${40 + gap * k + gap / 2}" cy="${y(v)}" r="2.8" fill="#fff" stroke="#9A9EA6" stroke-width="1.5"/>`).join('')}${xl}</svg></div>
      <div class="rk"><div class="pn__h" style="margin-top:-8px"><h3>Conductores</h3><small>entregas · puntualidad</small></div>
        ${rk.map((o, k) => `<div class="rk__i" style="--c:${o.r.color}"><span class="mono" style="color:var(--subtle)">${k + 1}</span>${face(o.r.foto, 'sm')}<span><b>${o.r.conductor}</b></span><span class="mono">${o.e}</span><span class="mono" style="color:${o.p >= 98 ? 'var(--ok-t)' : 'var(--muted)'};font-weight:600">${o.p} %</span></div>`).join('')}</div>
      <div class="sum"><span class="ai">${ic('spark')}Resumen del asistente</span><p id="rp-sum"></p>
        <div class="todo" id="rp-todo" style="opacity:0;transition:opacity .5s"><small>Para mañana</small>
          <div>${ic('clock')}<span><b>Bar La Plaza</b> a las 9:10 con Javi, ya avisado</span></div>
          <div>${ic('route')}<span>Obras en C/ Iturrama hasta el viernes: la Ruta 4 entra por Sancho el Fuerte</span></div>
          <div>${ic('box3d')}<span>Jueves de puente: el asistente propone adelantar 18 pedidos al miércoles</span></div></div></div></div>`, 'left:12px;top:12px;bottom:12px;width:820px');
    el.querySelectorAll('.rb').forEach((b, k) => tween(.4 + k * .15, .7, p => { const h = +b.dataset.h * ease(p); b.setAttribute('y', ch - h); b.setAttribute('height', h); if (p >= 1) el.querySelectorAll('.rt')[k].setAttribute('opacity', 1); }));
    [['#kpi-r1', 90, 97.2, v => num(v, 1) + '<small> %</small>'], ['#kpi-r2', 0, 125, v => Math.round(v) + '<small> km</small>'], ['#kpi-r3', 0, 33, v => Math.round(v) + '<small> kg</small>'], ['#kpi-r4', 3.45, 2.84, v => num(v, 2) + '<small> €</small>']]
      .forEach(([id, a, b, f]) => { const e = $(id); if (e) countTo(e, a, b, .2, 1.4, f); });
    const sm = $('#rp-sum', el);
    at(4.9, () => { const t = $('#rp-todo'); if (t) t.style.opacity = 1; });
    typeText(sm, SUM, 1.4, 3.4, () => { sm.innerHTML = SUM.replace(NE + ' entregas', '<b>' + NE + ' entregas</b>').replace('97,2 %', '<b>97,2 %</b>').replace('125 km', '<b>125 km</b>').replace('33 kg de CO₂', '<b>33 kg de CO₂</b>').replace('14 segundos', '<b>14 segundos</b>'); });
  }

  // ------------------------------------------------------------------ navegación entre pasos
  let stepIdx = 0, autoT = 0;
  function go(i) {
    i = ((Math.round(+i || 0) % STEPS.length) + STEPS.length) % STEPS.length;
    stepIdx = i; resetScene(); stepT0 = T; autoT = 0;
    try { STEPS[i].go(); } catch (e) { console.warn('[arga]', e); }
  }
  document.querySelector('#nav').addEventListener('click', e => {
    const a = e.target.closest('.nv'); if (!a || MODE === 'card') return;
    const map = { control: 0, pedidos: 2, almacen: 3, rutas: 4, incid: 5, albaranes: 7, cobros: 8, informe: 9, flota: 1 };
    if (a.dataset.k in map) go(map[a.dataset.k]);
  });

  // ------------------------------------------------------------------ modo tarjeta
  let cardToastT = 0;
  function cardUI() {
    $('#cardui').innerHTML = `
      <div class="cu__top"><div class="cu__brand"><span class="sb__logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/></svg></span><b>Ruta</b><small>Distribuciones Arga</small></div>
        <div class="cu__live"><span class="live"></span>En directo <b id="cu-clock">10:44</b></div></div>
      <div class="cu__pn"><small class="l">Entregados hoy</small><div class="cu__big" id="cu-ent">${entregados()}<small>/214</small></div><div class="bar"><i id="cu-bar" style="transform:scaleX(${entregados() / 214})"></i></div>
        ${M.vans.map(v => `<div class="cu__r" style="--c:${v.ru.d.color}">${face(v.ru.d.foto, 'cu')}<span>${v.ru.d.corto}</span><span class="mono" data-cu="${v.ru.d.id}">${hechas(v)}/${v.ru.d.total}</span></div>`).join('')}</div>
      <div class="cu__toast hide" id="cu-toast"><span class="ti">${ic('check')}</span><span id="cu-tt"></span></div>`;
    M.fly({ target: [10, 8], dist: 168, polar: .97, az: -.3, orbit: true, dur: 0, shift: 104 });
    // la cámara se acerca a una furgoneta de vez en cuando y vuelve
    let k = 0;
    every(15, () => {
      const v = M.vans[[1, 4, 0, 5, 2, 3][k++ % 6]];
      M.fly({ van: v, dist: 74, polar: .92, az: M.cam.az + .4, dur: 2.2, shift: 104 }); M.select(v);
      later(6.5, () => { M.select(null); M.fly({ target: [10, 8], dist: 168, polar: .97, az: M.cam.az - .3, orbit: true, dur: 2.4, shift: 104 }); });
    });
    // pedidos nuevos que caen en el mapa
    const NEW = [['Bar Gure Txoko', 10, 3.5], ['Cafetería Mendebaldea', 3, 2.5], ['Hotel Rochapea', 4, 8.5]];
    let n = 0;
    every(11, () => {
      const o = NEW[n++ % NEW.length]; M.dropOrder(o[1], o[2], true);
      cardToast('ac', 'wa', `Nuevo pedido · <b>${o[0]}</b> <small>WhatsApp</small>`);
      later(6, () => M.dropOrder(0, 0, false));
    });
  }
  function cardToast(cls, icon, html) {
    const t = $('#cu-toast'); if (!t) return;
    t.querySelector('.ti').className = 'ti ' + cls; t.querySelector('.ti').innerHTML = icon === 'wa' ? '<img src="../assets/logos/whatsapp.svg" alt="" style="width:15px;height:15px">' : ic(icon);
    $('#cu-tt').innerHTML = html; t.classList.remove('hide');
    cardToastT = T + 2.8;
  }
  function cardDeliver(v, s) {
    $('#cu-ent').innerHTML = `${entregados()}<small>/214</small>`; bar($('#cu-bar'), entregados() / 2.14);
    const c = document.querySelector(`[data-cu="${v.ru.d.id}"]`); if (c) c.textContent = `${hechas(v)}/${v.ru.d.total}`;
    cardToast('', 'check', `Entregado · <b>${s.name}</b> <small>${v.ru.d.corto}</small>`);
  }

  // ------------------------------------------------------------------ bucle principal
  let lastClock = -1, updS = 0;
  const PROF = []; // ms de trabajo por fotograma (lógica + render), para medir
  const DTMAX = Q.has('captura') ? .2 : .05; // solo para capturas sin GPU
  function frame(now) {
    if (paused || hiddenNow) return;
    const dt = Math.min(DTMAX, Math.max(0, (now - last) / 1000)); last = now;
    T += dt;
    const w0 = performance.now();
    runJobs();
    M.update(dt, T); M.render();
    if (PROF.length < 3000) PROF.push(performance.now() - w0);
    const cs = Math.floor(clockS());
    if (cs !== lastClock) {
      lastClock = cs;
      if (MODE === 'card') { const c = $('#cu-clock'); if (c) c.textContent = hhmm(cs); if (cardToastT && T > cardToastT) { $('#cu-toast').classList.add('hide'); cardToastT = 0; } }
      else { $('#clock').textContent = hhmmss(cs); updS = (updS + 1) % 4; const u = $('#upd'); if (u) u.textContent = `hace ${updS + 1} s`; refreshFlota(); }
    }
    if (MODE === 'auto') { autoT += dt * 1000; if (autoT >= STEPS[stepIdx].ms) go(stepIdx + 1); }
    raf = requestAnimationFrame(frame);
  }
  function pause() { if (paused) return; paused = true; cancelAnimationFrame(raf); document.body.classList.add('paused'); }
  function resume() { if (!paused) return; paused = false; document.body.classList.remove('paused'); if (!hiddenNow) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } }
  // sin pintar cuando no se ve: pestaña oculta o iframe fuera de la pantalla
  let hiddenNow = false;
  function setHidden(h) { if (h === hiddenNow) return; hiddenNow = h; if (h) cancelAnimationFrame(raf); else if (!paused) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', () => setHidden(document.hidden));
  if ('IntersectionObserver' in window) new IntersectionObserver(e => setHidden(!e[e.length - 1].isIntersecting)).observe(stage);

  window.__arga = { time: () => T, prof: () => { const p = PROF.splice(0).sort((a, b) => a - b); return p.length ? { n: p.length, media: +(p.reduce((a, b) => a + b, 0) / p.length).toFixed(2), p95: +p[Math.floor(p.length * .95)].toFixed(2), max: +p[p.length - 1].toFixed(2) } : null; } };
  window.aldiaApp = { steps: STEPS.map(s => ({ title: s.title, text: s.text, ms: s.ms })), go, pause, resume };

  // precarga y decodifica caras, logos e iconos para que ningún paso dé un tirón al abrirse
  [1, 2, 3, 4, 5, 6, 7, 8].map(FACE).concat(['pdf', 'xlsx', 'csv', 'jpg', 'factura', 'dinero', 'tarjeta', 'bizum'].map(k => '../assets/apps/iconos/' + k + '.svg'), ['whatsapp', 'gmail'].map(k => '../assets/logos/' + k + '.svg'))
    .forEach(src => { const im = new Image(); im.src = src; im.decode && im.decode().catch(() => {}); });
  // arranque
  if (MODE === 'card') cardUI(); else go(0);
  last = performance.now();
  M.update(0, 0); M.render();
  raf = requestAnimationFrame(frame);
  // listo para el portfolio cuando las fuentes estén cargadas y haya un primer fotograma
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    requestAnimationFrame(() => { try { parent.postMessage({ type: 'aldia-app-ready', app: 'arga' }, '*'); } catch (e) { } window.ARGA_READY = true; });
  });
})();
