/* Fisio Vela — app de ejemplo viva (Aldia). Sin dependencias.
   ?mode=card  → pantalla principal viva en bucle, sin interacción.
   ?mode=tour  → la controla el padre con window.aldiaApp = { steps, go(i), pause(), resume() }.
   sin mode    → como tour, avanzando solo desde el paso 0. */
(() => {
  'use strict';
  const P = new URLSearchParams(location.search);
  const MODE = (P.get('mode') || 'auto').toLowerCase();
  const stage = document.getElementById('stage');
  let SCALE = 1;

  /* ---------------- utilidades ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function num(n, d = 0) {
    const neg = n < 0; n = Math.abs(n);
    const parts = n.toFixed(d).split('.');
    const i = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '−' : '') + i + (parts[1] ? ',' + parts[1] : '');
  }
  const eur = (n, d = 2) => num(n, d) + ' €';
  const hm = (m) => { m = Math.floor(m); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
  const hm2 = (m) => { m = Math.floor(m); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  /* ---------------- iconos (trazo fino, estilo Lucide, dibujados a mano) ---------------- */
  const IC = {
    home: '<path d="M3.5 10.2 12 3.5l8.5 6.7"/><path d="M5.5 9v11.5h13V9"/><path d="M10 20.5v-6h4v6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    calc: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
    users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.8 20c.7-3.4 3.2-5.3 6.2-5.3s5.5 1.9 6.2 5.3"/><path d="M15.5 5.2a3.4 3.4 0 0 1 0 6.6M17.6 14.9c1.9.6 3.2 2.3 3.6 5.1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.9-3.9 3.9-6 7.5-6s6.6 2.1 7.5 6"/>',
    ucheck: '<circle cx="10" cy="8" r="4"/><path d="M3 20.5c.9-3.9 3.6-6 7-6 1.4 0 2.7.3 3.8 1"/><path d="m15.5 18 2 2 4-4.5"/>',
    msg: '<path d="M20.5 11.6a8.3 8.3 0 0 1-12.3 7.3L3.5 20.3l1.4-4.6A8.3 8.3 0 1 1 20.5 11.6z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".9"/><circle cx="4.5" cy="12" r=".9"/><circle cx="4.5" cy="18" r=".9"/>',
    ticket: '<path d="M3.5 8A1.5 1.5 0 0 1 5 6.5h14A1.5 1.5 0 0 1 20.5 8v2.3a1.8 1.8 0 0 0 0 3.4V16a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-2.3a1.8 1.8 0 0 0 0-3.4z"/><path d="M14.5 6.5v2M14.5 11v2M14.5 15.5v2"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.8h19M6.5 15h4"/>',
    chart: '<path d="M4 4v16h16"/><path d="m8 14 3.5-3.5 3 3L20 8"/>',
    bars: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="6" width="3" height="11.5" rx="1"/><rect x="15.5" y="9" width="3" height="8.5" rx="1"/>',
    spark: '<path d="M11 3.5 12.9 9l5.6 2-5.6 2L11 18.5 9.1 13 3.5 11l5.6-2z"/><path d="M18.5 3v4M16.5 5h4"/>',
    gear: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
    heart: '<path d="M3.5 12h3.5l2-4.5 3.5 9 2.5-6 1.5 1.5h4"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.1 2.1 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    check2: '<path d="m2.5 12.5 4 4L15 8"/><path d="m11 16 1 .9L21 8"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevL: '<path d="m14.5 6-6 6 6 6"/>',
    chevR: '<path d="m9.5 6 6 6-6 6"/>',
    chevD: '<path d="m7 10 5 5 5-5"/>',
    chevUD: '<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>',
    file: '<path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4"/>',
    euro: '<path d="M17.5 7a6.5 6.5 0 1 0 0 10"/><path d="M4.5 10.5h9M4.5 13.5h9"/>',
    down: '<path d="m4 7 6 6 3.5-3.5L20 16"/><path d="M15 16h5v-5"/>',
    up: '<path d="m4 17 6-6 3.5 3.5L20 8"/><path d="M15 8h5v5"/>',
    phone: '<path d="M5 4.5h3.2l1.6 4-2 1.3a10 10 0 0 0 6.4 6.4l1.3-2 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    door: '<path d="M5 20.5h14"/><path d="M7 20.5V4.5h10v16"/><circle cx="14" cy="12.5" r=".9"/>',
    dumbbell: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
    filter: '<path d="M4 5.5h16l-6.2 7.2v5.6l-3.6 1.7v-7.3z"/>',
    more: '<circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/>',
    send: '<path d="M20.5 3.5 10 14"/><path d="m20.5 3.5-6.5 17-4-6.5-6.5-4z"/>',
    clip: '<path d="m20 11.5-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4L15 7"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    sync: '<path d="M20 11.5A8 8 0 0 0 6 6.5L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 12.5a8 8 0 0 0 14 5l2-2"/><path d="M20 20v-4.5h-4.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"/>',
    printer: '<path d="M7 8.5V4h10v4.5"/><rect x="3.5" y="8.5" width="17" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17h.01"/>',
    arrowUR: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    phoneS: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    star: '<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z"/>',
    repeat: '<path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20l-3-3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4l3 3"/>',
    knee: '<path d="M9 3.5v6.5c0 2 1 3 2.5 3.5L9.5 20.5M15 3.5v7c0 1.3-.4 2.4-1 3.2l1.5 6.8"/>',
    shield: '<path d="M12 3.5 5 6v5.5c0 4.6 3 7.7 7 9 4-1.3 7-4.4 7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    layers: '<path d="m12 3.5 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  };
  const ic = (n, s = 18, cls = '', sw = 1.75) => `<svg class="i ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
  const WA = (s = 20) => `<img class="lg" src="../assets/logos/whatsapp.svg" width="${s}" height="${s}" alt="">`;
  const LOGO = (id) => `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12B09E"/><stop offset="1" stop-color="#6F7CF2"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#${id})"/><path d="M16.8 6.2v15.3h7.4c-1-6.6-3.5-11.6-7.4-15.3z" fill="#fff"/><path d="M14.6 10v11.5H8.4c1.2-4.9 3.3-8.8 6.2-11.5z" fill="#fff" fill-opacity=".72"/><path d="M6.8 24.6c3 1.4 15.4 1.4 18.4 0" stroke="#fff" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>`;

  /* ---------------- datos ---------------- */
  const F = {
    irene: { n: 'Irene Soler', s: 'Irene', c: '#0F9F8F', bg: '#E7F6F3', dk: '#086A5F', esp: 'Fisio deportiva', sala: 'Box 1' },
    pablo: { n: 'Pablo Ferrer', s: 'Pablo', c: '#7C6CF0', bg: '#F1EFFE', dk: '#4F3FC6', esp: 'Terapia manual', sala: 'Box 2' },
    nuria: { n: 'Nuria Climent', s: 'Nuria', c: '#2F86D6', bg: '#EAF3FC', dk: '#1C5FA3', esp: 'Suelo pélvico', sala: 'Box 3' },
    sergio: { n: 'Sergio Albiol', s: 'Sergio', c: '#D9861A', bg: '#FDF4E6', dk: '#8F5306', esp: 'Pilates clínico', sala: 'Sala pilates' },
  };
  const FK = ['irene', 'pablo', 'nuria', 'sergio'];
  // Cada persona tiene una cara fija (mujeres: 1, 3, 6 · hombres: 2, 4, 5, 7, 8).
  // Varias personas comparten cara, pero nunca en la misma pantalla.
  const AS = '../assets/';
  const FACE = {
    'Irene Soler': 1, 'Nuria Climent': 3, 'Pablo Ferrer': 8, 'Sergio Albiol': 4,
    'Marta Sánchez': 3, 'Beatriz Ramos': 6, 'Laura Cano': 3, 'Lucía Vidal': 6, 'Ana Gil': 6, 'Sara Tormo': 3, 'Clara Ibáñez': 6, 'Amparo Navarro': 3,
    'Jorge Lozano': 2, 'Toni Esteve': 2, 'Xavier Sanz': 2, 'Josep Ferrando': 2,
    'Álex Roig': 8, 'Pau Llorens': 8, 'Iker Bolea': 8,
    'Marc Puig': 4, 'Álvaro Pastor': 4,
    'Raúl Martí': 5, 'Andrés Beltrán': 5, 'Quique Aliaga': 5, 'Nacho Ballester': 5,
    'Pep Llopis': 7, 'Vicent Mora': 7,
  };
  function av(name, size = 32) {
    const n = FACE[name] || FACE[name.split(' ').slice(0, 2).join(' ')];
    if (!n) { console.error('Sin cara para ' + name); return ''; }
    return `<img class="av" src="${AS}apps/caras/cara${n}.webp" width="${size}" height="${size}" alt="" style="width:${size}px;height:${size}px">`;
  }
  const avF = (k, size = 28) => av(F[k].n, size);
  const dotF = (k, s = 10) => `<i class="fdot" style="width:${s}px;height:${s}px;background:${F[k].c}"></i>`;
  const LG = (n, s = 18) => `<img class="lg" src="${AS}logos/${n}.svg" width="${s}" height="${s}" alt="">`;
  const ICO = (n, w = 24, hh = 17) => `<img class="ico-f" src="${AS}apps/iconos/${n}.svg" width="${w}" height="${hh}" alt="">`;
  const DOC = (n, s = 22) => ICO(n, Math.round(s * .8), s);

  // Agenda del miércoles 25 de noviembre de 2026 (minutos desde las 0:00)
  const AG = [
    { id: 'a1', f: 'irene', h: 540, d: 60, t: 'Fisio deportiva', p: 'Álvaro Pastor', tag: 'Bono 3/10', st: 'done' },
    { id: 'a2', f: 'irene', h: 605, d: 40, t: 'Rotura fibrilar isquio', p: 'Pau Llorens', tag: 'DKV', st: 'done' },
    { id: 'marta', f: 'irene', h: 650, d: 50, t: 'LCA · postoperatorio', p: 'Marta Sánchez', tag: 'Bono 5/10', st: 'insession' },
    { id: 'jorge', f: 'irene', h: 720, d: 60, t: 'Tendinopatía de hombro', p: 'Jorge Lozano', tag: 'Sesión 4', st: 'confirmed' },
    { id: 'lucia', f: 'irene', h: 795, d: 45, t: 'Esguince de tobillo', p: 'Lucía Vidal', tag: 'Sanitas', st: 'pending' },
    { id: 'a6', f: 'irene', h: 855, d: 45, t: 'Revisión', p: 'Vicent Mora', tag: 'Bono 4/5', st: 'confirmed' },
    { id: 'b1', f: 'pablo', h: 540, d: 45, t: 'Punción seca', p: 'Ana Gil', tag: 'Sesión 2', st: 'done' },
    { id: 'b2', f: 'pablo', h: 590, d: 50, t: 'Cervicalgia', p: 'Empar Ribes', tag: 'Bono 7/10', st: 'done' },
    { id: 'raul', f: 'pablo', h: 650, d: 60, t: 'Lumbalgia aguda', p: 'Raúl Martí', tag: 'Primera', st: 'insession' },
    { id: 'elena', f: 'pablo', h: 720, d: 45, t: 'Masaje de descarga', p: 'Álex Roig', tag: 'Bono 2/5', st: 'confirmed' },
    { id: 'b5', f: 'pablo', h: 770, d: 50, t: 'Disfunción ATM', p: 'Marc Puig', tag: 'Sesión 3', st: 'confirmed' },
    { id: 'b6', f: 'pablo', h: 830, d: 45, t: 'Cervicales', p: 'Iker Bolea', tag: 'Sanitas', st: 'pending' },
    { id: 'c1', f: 'nuria', h: 540, d: 60, t: 'Suelo pélvico', p: 'Sara Tormo', tag: 'Bono 3/6', st: 'done' },
    { id: 'c2', f: 'nuria', h: 605, d: 50, t: 'Fisio pediátrica', p: 'Hugo Ferrer · 8 años', tag: 'Adeslas', st: 'done' },
    { id: 'paula', f: 'nuria', h: 660, d: 60, t: 'Recuperación postparto', p: 'Paula Doménech', tag: 'Bono 2/6', st: 'insession' },
    { id: 'laura', f: 'nuria', h: 720, d: 60, t: 'Diástasis abdominal', p: 'Laura Cano', tag: 'Bono 4/6', st: 'confirmed' },
    { id: 'c5', f: 'nuria', h: 795, d: 45, t: 'Suelo pélvico', p: 'Neus Bataller', tag: 'Bono 4/6', st: 'confirmed' },
    { id: 'c6', f: 'nuria', h: 855, d: 45, t: 'Primera valoración', p: 'Carmen Ortega', tag: 'Nueva', st: 'confirmed' },
    { id: 'd1', f: 'sergio', h: 540, d: 60, t: 'Pilates clínico', p: 'Grupo · 4 personas', tag: 'Sala pilates', st: 'done' },
    { id: 'd2', f: 'sergio', h: 610, d: 45, t: 'Readaptación LCA', p: 'Xavier Sanz', tag: 'Gimnasio', st: 'done' },
    { id: 'pil', f: 'sergio', h: 660, d: 60, t: 'Pilates clínico', p: 'Grupo · 6 personas', tag: 'Sala pilates', st: 'insession' },
    { id: 'd4', f: 'sergio', h: 735, d: 45, t: 'Escoliosis', p: 'Andrés Beltrán', tag: 'Bono 6/10', st: 'confirmed' },
    { id: 'd5', f: 'sergio', h: 790, d: 60, t: 'Pilates clínico', p: 'Grupo · 5 personas', tag: 'Sala pilates', st: 'confirmed' },
    { id: 'd6', f: 'sergio', h: 860, d: 40, t: 'Primera valoración', p: 'Josep Martínez', tag: 'Nueva', st: 'pending' },
  ];
  const BEA = { id: 'bea', f: 'nuria', h: 720, d: 60, t: 'Diástasis postparto', p: 'Beatriz Ramos', tag: 'WhatsApp', st: 'confirmed' };

  /* ---------------- motor de tiempo propio (se puede pausar) ---------------- */
  const E = { o: (t) => 1 - Math.pow(1 - t, 3), io: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), l: (t) => t, b: (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); } };
  let vt = 0, lastT = 0, paused = false, gen = 0;
  let timers = [], tweens = [];
  const after = (ms, fn) => { timers.push({ t: vt + ms, fn, g: gen }); };
  const tween = (dur, fn, ease = E.o, delay = 0) => { tweens.push({ s: vt + delay, d: dur, fn, ease, g: gen }); };
  function clearStep() { gen++; timers = []; tweens = []; }
  const ambient = [];
  // Bucle: rAF solo mientras hay algo que se mueve (tweens o un evento a punto de llegar).
  // En reposo despierta con setTimeout como mucho 4 veces por segundo; en pausa no hay ni rAF ni temporizador.
  let rafId = 0, toId = 0;
  function schedule() {
    if (paused || rafId || toId) return;
    let next = Infinity;
    for (const t of timers) if (t.t < next) next = t.t;
    if (autoplay && cur_i >= 0) next = Math.min(next, autoNext);
    const wait = next - vt;
    if (tweens.length || wait < 40) rafId = requestAnimationFrame(frame);
    else toId = setTimeout(() => { toId = 0; rafId = requestAnimationFrame(frame); }, Math.min(wait - 20, 250));
  }
  function kick() { // algo nuevo desde fuera (go, mensaje del padre): ponerse al día y volver al rAF
    if (paused) return;
    const now = performance.now(); if (lastT) { vt += Math.min(300, now - lastT); lastT = now; }
    if (toId) { clearTimeout(toId); toId = 0; }
  }
  function frame(now) {
    rafId = 0;
    if (paused) return;
    if (!lastT) lastT = now;
    const dt = Math.min(300, Math.max(0, now - lastT)); lastT = now;
    {
      vt += dt;
      if (timers.length) {
        const due = timers.filter((x) => x.t <= vt);
        if (due.length) { timers = timers.filter((x) => x.t > vt); due.sort((a, b) => a.t - b.t).forEach((x) => { if (x.g === gen) x.fn(); }); }
      }
      if (tweens.length) {
        for (const tw of tweens) {
          if (tw.g !== gen) { tw.done = true; continue; }
          if (vt < tw.s) continue;
          const p = Math.min(1, (vt - tw.s) / tw.d);
          tw.fn(tw.ease(p), p);
          if (p >= 1) tw.done = true;
        }
        tweens = tweens.filter((t) => !t.done);
      }
      ambient.forEach((fn) => fn());
    }
    schedule();
  }

  function count(el, from, to, dur, f = (v) => num(Math.round(v)), delay = 0) {
    el = typeof el === 'string' ? $(el) : el; if (!el) return;
    el.textContent = f(from);
    let last = -1e9, txt = ''; // como mucho ~10 cambios por segundo
    tween(dur, (e, p) => { if (p < 1 && vt - last < 95) return; last = vt; const t = f(from + (to - from) * e); if (t !== txt) { txt = t; el.textContent = t; } }, E.o, delay);
  }
  // Reinicia una animación CSS sin forzar un layout síncrono: quita la clase y la vuelve a poner en el siguiente frame.
  function replay(el, cls) { el.classList.remove(cls); requestAnimationFrame(() => el.classList.add(cls)); }

  /* ---------------- reloj de la clínica ---------------- */
  const clk = { m0: 680, v0: 0, rate: 1 / 4500 };
  const clinicMin = () => clk.m0 + (vt - clk.v0) * clk.rate;
  const setClock = (m) => { clk.m0 = m; clk.v0 = vt; };

  /* ---------------- escala del lienzo ---------------- */
  function fit() {
    const w = window.innerWidth, hh = window.innerHeight;
    SCALE = Math.min(w / 1600, hh / 900);
    stage.style.transform = `translate(${(w - 1600 * SCALE) / 2}px,${(hh - 900 * SCALE) / 2}px) scale(${SCALE})`;
  }
  function rectOf(el) {
    const a = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { x: (a.left - s.left) / SCALE, y: (a.top - s.top) / SCALE, w: a.width / SCALE, h: a.height / SCALE };
  }

  /* ---------------- gráficas ---------------- */
  function smooth(p) {
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  }
  let gid = 0;
  function spark(vals, w, hgt, color) {
    const mn = Math.min(...vals), mx = Math.max(...vals), id = 'sg' + (gid++);
    const pts = vals.map((v, i) => [3 + i * ((w - 8) / (vals.length - 1)), hgt - 5 - ((v - mn) / (mx - mn || 1)) * (hgt - 12)]);
    const d = smooth(pts), lp = pts[pts.length - 1];
    return `<svg class="spark" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".2"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path class="sp-area" d="${d} L${lp[0]} ${hgt} L3 ${hgt}Z" fill="url(#${id})"/><path class="sp-line" pathLength="1" d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/><circle class="sp-dot" cx="${lp[0]}" cy="${lp[1]}" r="3.5" fill="#fff" stroke="${color}" stroke-width="2"/></svg>`;
  }

  /* ================= ESTRUCTURA ================= */
  function navItem(k, icon, label, cnt, cls = '') {
    return `<a data-k="${k}">${ic(icon, 18)}<span>${label}</span>${cnt ? `<span class="cnt ${cls}" data-cnt="${k}">${cnt}</span>` : ''}</a>`;
  }
  function buildShell() {
    stage.innerHTML = `
    <aside class="side">
      <div class="brand">${LOGO('lg1')}<div><b>Vela</b><small>Fisio Vela · Russafa</small></div>${ic('chevUD', 16, 'brand-chev')}</div>
      <nav class="nav">
        ${navItem('inicio', 'home', 'Inicio')}
        ${navItem('agenda', 'cal', 'Agenda', '38')}
        ${navItem('pacientes', 'users', 'Pacientes', '1.204')}
        ${navItem('mensajes', 'msg', 'Mensajes', '3', 'dot')}
        ${navItem('espera', 'list', 'Lista de espera', '14')}
        <div class="nav-h">Gestión</div>
        ${navItem('bonos', 'ticket', 'Bonos', '5', 'warn')}
        ${navItem('cobros', 'card', 'Cobros y facturas')}
        ${navItem('informes', 'chart', 'Informes')}
        <div class="nav-h">Clínica</div>
        ${navItem('equipo', 'heart', 'Equipo y salas')}
        ${navItem('ajustes', 'gear', 'Ajustes')}
      </nav>
      <div class="side-ai">
        <div class="t">${ic('spark', 16)}Asistente de Vela<span class="pulse"></span></div>
        <p>Este mes ha rellenado <b>31 huecos</b> con la lista de espera.</p>
        <div class="bar"><i></i></div>
        <small><span>Objetivo 40</span><span>2.480 € recuperados</span></small>
      </div>
      <div class="me">${avF('irene', 34)}<div><b>Irene Soler</b><small>Directora</small></div>${ic('more', 18)}</div>
    </aside>
    <header class="top">
      <div class="crumb" id="crumb">Inicio</div>
      <div class="search">${ic('search', 16)}<span>Buscar pacientes, citas, facturas…</span><kbd>Ctrl K</kbd></div>
      <button class="ask">${ic('spark', 16)}Pregunta al asistente</button>
      <div class="top-r">
        <div class="liveclk"><span class="pulse"></span><span id="clock">11:20</span></div>
        <button class="icon-btn">${ic('bell', 18)}<em>4</em></button>
        <button class="btn-dark">${ic('plus', 16)}Nueva cita</button>
      </div>
    </header>
    <main class="main">
      <section class="scr" data-s="inicio"></section>
      <section class="scr" data-s="agenda"></section>
      <section class="scr" data-s="pacientes"></section>
      <section class="scr" data-s="mensajes"></section>
      <section class="scr" data-s="bonos"></section>
      <section class="scr" data-s="cobros"></section>
      <section class="scr" data-s="informes"></section>
    </main>
    <div class="cardv" id="cardv"></div>
    <div id="toasts"></div>
    <div id="ring"></div>
    <div id="cursor"><span class="rip"></span><svg width="26" height="30" viewBox="0 0 26 30"><path d="M2 2v21.5l5.6-5.3 3.7 8.6 3.9-1.7-3.7-8.4 7.9-.4z" fill="#0E1726" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>`;
  }
  const scr = (k) => $(`.scr[data-s="${k}"]`);

  /* ================= INICIO ================= */
  const NEXT = [
    ['jorge', '12:00', '60 min', 'Jorge Lozano', 'Tendinopatía de hombro', 'irene', 'Box 1', 'ok', 'Confirmada'],
    ['elena', '12:00', '45 min', 'Álex Roig', 'Masaje de descarga', 'pablo', 'Box 2', 'ok', 'Confirmada'],
    ['laura', '12:00', '60 min', 'Laura Cano', 'Diástasis abdominal', 'nuria', 'Box 3', 'ok', 'Confirmada'],
    ['andrea', '12:15', '45 min', 'Andrés Beltrán', 'Escoliosis', 'sergio', 'Sala pilates', 'ok', 'Confirmada'],
    ['mireia', '12:50', '50 min', 'Marc Puig', 'Disfunción ATM', 'pablo', 'Box 2', 'ok', 'Confirmada'],
    ['lucia', '13:15', '45 min', 'Lucía Vidal', 'Esguince de tobillo', 'irene', 'Box 1', 'wait', 'Sin confirmar'],
  ];
  const FEED0 = [
    [LG('whatsapp', 18), '#E7F7EE', '#127A3A', '<b>Jorge Lozano</b> ha confirmado su cita de las 12:00', 'Por WhatsApp · respuesta automática', '11:14'],
    [ICO('bizum', 26, 18), '#E6F9F9', '#127A3A', 'Bizum de <b>Pau Llorens</b> · 45,00 €', 'Factura F-2026/1183 enviada por email', '10:48'],
    [LG('whatsapp', 18), '#E7F7EE', '#127A3A', '<b>34 recordatorios</b> enviados para mañana', '31 confirmadas · 3 pendientes', '10:30'],
    [ICO('tarjeta', 26, 18), '#EEF3FE', '#1C5FA3', '<b>Álvaro Pastor</b> renovó su bono', '10 sesiones · 450,00 € con tarjeta', '10:41'],
    [LG('googlemaps', 18), '#FDF4E6', '#8F5306', 'Nueva reseña de 5 estrellas en Google Maps', '«Nuria es un encanto, muy profesional»', '09:52'],
    ['ucheck', '#E7F6F3', '#086A5F', '<b>Raúl Martí</b> ha llegado · primera visita', 'Ficha y consentimiento firmados en tableta', '10:46'],
  ];
  const feedItem = (f, cls = '') => `<div class="fi ${cls}"><div class="ico" style="background:${f[1]};color:${f[2]}">${f[0][0] === '<' ? f[0] : ic(f[0], 16)}</div><p>${f[3]}<span>${f[4]}</span></p><time>${f[5]}</time></div>`;

  function weekBarsSvg() {
    const W = 372, H = 196, x0 = 40, top = 14, bot = 162, ch = bot - top, mx = 2000;
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const cob = [1620, 1890, 1284, 0, 0, 0], prev = [1620, 1890, 1710, 1750, 1540, 620];
    const step = (W - x0 - 4) / 6, bw = 30;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#F1EFFE"/><line x1="0" y1="0" x2="0" y2="6" stroke="#C9C1FA" stroke-width="2.2"/></pattern><pattern id="hatchT" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#E7F6F3"/><line x1="0" y1="0" x2="0" y2="6" stroke="#9ED9CF" stroke-width="2.2"/></pattern></defs>`;
    [0, 1000, 2000].forEach((v) => { const y = bot - (v / mx) * ch; s += `<line x1="${x0}" x2="${W}" y1="${y}" y2="${y}" stroke="#EEF1F4"/><text x="${x0 - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#A8B1BE" font-family="Geist Mono">${v ? num(v / 1000) + 'k' : '0'}</text>`; });
    days.forEach((d, i) => {
      const cx = x0 + step * i + step / 2, x = cx - bw / 2;
      const hp = (prev[i] / mx) * ch, hc = (cob[i] / mx) * ch;
      const delay = `style="animation-delay:${0.1 + i * .07}s"`;
      if (i < 2) s += `<rect class="bar" ${delay} x="${x}" y="${bot - hc}" width="${bw}" height="${hc}" rx="6" fill="#7FD3C7"/>`;
      else if (i === 2) s += `<rect class="bar" ${delay} x="${x}" y="${bot - hp}" width="${bw}" height="${hp}" rx="6" fill="url(#hatchT)"/><rect class="bar" ${delay} x="${x}" y="${bot - hc}" width="${bw}" height="${hc}" rx="6" fill="#0F9F8F"/><text x="${cx}" y="${bot - hp - 8}" text-anchor="middle" font-size="11.5" font-weight="600" fill="#086A5F">1.284 €</text>`;
      else s += `<rect class="bar" ${delay} x="${x}" y="${bot - hp}" width="${bw}" height="${hp}" rx="6" fill="url(#hatch)"/>`;
      s += `<text x="${cx}" y="${bot + 20}" text-anchor="middle" font-size="11.5" fill="${i === 2 ? '#0E1726' : '#7D8899'}" font-weight="${i === 2 ? 600 : 400}">${d}</text>`;
    });
    return s + '</svg>';
  }

  function buildInicio() {
    const s = scr('inicio');
    const occ = [['irene', 97], ['pablo', 100], ['nuria', 92], ['sergio', 91]];
    s.innerHTML = `
    <div class="pagehead">
      <div><div class="eyebrow">Miércoles, 25 de noviembre</div><h1>Buenos días, <em>Irene</em></h1><p>Hoy hay <b>38 citas</b> entre los cuatro, <b>2 sin confirmar</b> y <b>5 bonos</b> que caducan esta semana.</p></div>
      <div class="r"><div class="seg"><button class="on">Hoy</button><button>Semana</button><button>Mes</button></div></div>
    </div>
    <div class="kpis">
      <div class="card kpi"><div class="l">${ic('cal', 16)}Citas hoy</div><div class="v"><span id="k-citas">38</span></div><div class="ft"><div class="delta"><b>+4</b> que el miércoles pasado</div></div>${spark([31, 33, 30, 35, 34, 36, 38], 112, 46, '#0F9F8F')}</div>
      <div class="card kpi"><div class="l">${ic('bars', 16)}Ocupación</div><div class="v"><span id="k-ocup">95</span><small>%</small></div><div class="goal"><i id="k-ocup-bar" style="transform:scaleX(.95)"></i><u style="left:90%"></u></div><div class="delta">Objetivo 90 % · <b>superado</b></div></div>
      <div class="card kpi"><div class="l">${ICO('dinero', 22, 15)}Cobrado hoy</div><div class="v"><span id="k-cob">1.284</span><small>€</small></div><div class="ft"><div class="delta"><b>+12 %</b> esta semana</div></div>${spark([980, 1120, 1040, 1190, 1150, 1230, 1284], 112, 46, '#7C6CF0')}</div>
      <div class="card kpi"><div class="l">${ic('ticket', 16)}Bonos por renovar<span style="margin-left:auto" class="link">Avisar ${ic('arrowUR', 13)}</span></div><div class="v"><span id="k-bonos">5</span></div><div class="ft"><div class="delta">Caducan esta semana</div><span class="chip wait">1.616 € en juego</span></div></div>
    </div>
    <div class="dgrid">
      <div class="card" style="display:flex;flex-direction:column">
        <div class="card-h"><h3>Próximas citas</h3><span class="sub">desde ahora</span><div class="r"><span class="chip live"><span class="d"></span>4 en sala</span><span class="link">Ver agenda ${ic('chevR', 14)}</span></div></div>
        <div class="nextlist">${NEXT.map((r, i) => `<div class="nx rise" data-nx="${r[0]}" style="animation-delay:${.15 + i * .06}s"><div class="tm">${r[1]}<small>${r[2]}</small></div>${av(r[3], 34)}<div class="who"><b>${r[3]}</b><span>${r[4]}</span></div><div class="fis">${dotF(r[5], 8)}${F[r[5]].s} · ${r[6]}</div><div class="st"><span class="chip ${r[7]}">${r[7] === 'ok' ? ic('check', 12, '', 2.4) : ic('clock', 12, '', 2.2)}${r[8]}</span></div></div>`).join('')}</div>
      </div>
      <div class="dcol">
        <div class="card" style="height:290px"><div class="card-h"><h3>Ingresos de la semana</h3><div class="r"><span class="link">Cobros ${ic('chevR', 14)}</span></div></div><div style="padding:4px 14px 0 4px">${weekBarsSvg()}</div><div class="wsum"><span><i style="background:#0F9F8F"></i><b>4.794 €</b> cobrados</span><span><i style="background:repeating-linear-gradient(135deg,#C9C1FA 0 2px,#F1EFFE 2px 4px)"></i>3.910 € previstos</span></div></div>
        <div class="card" style="flex:1"><div class="card-h"><h3>Ocupación por fisio</h3><div class="r"><span class="sub">hoy</span></div></div>
          <div class="bars-week">${occ.map(([k, v], i) => `<div class="occ-row">${dotF(k, 12)}<span class="nm">${F[k].s}</span><span class="trk"><i class="gx" style="width:${v}%;background:${F[k].c};animation-delay:${.2 + i * .08}s"></i></span><span class="pc">${v} %</span></div>`).join('')}</div></div>
      </div>
      <div class="card" style="display:flex;flex-direction:column">
        <div class="card-h"><h3>Actividad</h3><div class="r"><span class="chip live"><span class="pulse" style="width:6px;height:6px"></span>En directo</span></div></div>
        <div class="feed" id="feed">${FEED0.map((f) => feedItem(f)).join('')}</div>
      </div>
    </div>`;
  }

  /* ================= AGENDA ================= */
  const OFF = 12, PXH = 110; // día: 9:00–15:00
  const yOf = (m) => OFF + ((m - 540) / 60) * PXH;
  function apHtml(a, extra = '') {
    const f = F[a.f], y = yOf(a.h), hg = (a.d / 60) * PXH - 4;
    const sIc = a.st === 'done' ? ic('check', 14, '', 2.2) : a.st === 'pending' ? ic('clock', 14, '', 2) : a.st === 'insession' ? '' : '';
    return `<div class="ap ${a.st} ${extra}" data-id="${a.id}" style="top:${y}px;height:${hg}px;--ac:${f.c};--abg:${f.bg};--adk:${f.dk}"><span class="s">${sIc}</span><div class="t">${a.t}</div><div class="p">${a.p}</div><div class="f"><span class="tm">${hm(a.h)}–${hm(a.h + a.d)}</span><span class="tag">${a.tag}</span></div></div>`;
  }
  function laneInner(k, o = {}) {
    const gone = o.laura === 'hueco' || o.laura === 'filled';
    let html = AG.filter((a) => a.f === k && !(a.id === 'laura' && gone)).map((a) => apHtml(a)).join('');
    if (k === 'nuria') {
      html += `<div class="hueco ${o.laura === 'hueco' ? 'on' : ''}" id="hueco" style="top:${yOf(720)}px;height:${PXH - 4}px"><div class="scan"></div><b>${ic('spark', 14)}Hueco libre · 12:00</b><span>Nuria · 60 min · Box 3</span></div>`;
      if (o.laura === 'filled') html += apHtml(BEA);
    }
    return html;
  }
  function seeded(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function weekHtml() {
    const WOFF = 10, WPX = (676 - 18) / 13; // 8:00–21:00
    const wy = (m) => WOFF + ((m - 480) / 60) * WPX;
    const days = [['Lun', 23, 'past', 96], ['Mar', 24, 'past', 94], ['Mié', 25, 'today', 95], ['Jue', 26, '', 89], ['Vie', 27, '', 86], ['Sáb', 28, '', 61]];
    const rnd = seeded(25112026);
    const FREE = [[4, 'nuria', 600, 60], [4, 'pablo', 1050, 45], [5, 'sergio', 720, 60]];
    let head = `<div class="wk-head"><div></div>${days.map((d) => `<div class="d ${d[2]}"><b>${d[0]} <em>${d[1]}</em></b><div class="oc"><i><u style="width:${d[3]}%"></u></i><span data-wocc="${d[3]}">${d[3]} %</span></div></div>`).join('')}</div>`;
    let hours = ''; for (let hh = 8; hh <= 21; hh++) hours += `<span style="top:${wy(hh * 60)}px">${hh}:00</span>`;
    let cols = '';
    days.forEach((d, di) => {
      let blocks = '';
      const laneW = 100 / 4;
      FK.forEach((k, li) => {
        const ranges = di === 5 ? [[540, 840]] : [[540, 840], [960, 1260]];
        ranges.forEach(([a, b]) => {
          let m = a;
          while (m < b - 30) {
            const dur = rnd() < .5 ? 45 : 60;
            const fr = FREE.find((x) => x[0] === di && x[1] === k && m < x[2] + x[3] && m + dur > x[2]);
            const skip = fr || rnd() > d[3] / 100 + .02;
            if (!skip) blocks += `<i class="wb" style="--ac:${F[k].c};--abg:${F[k].bg};top:${wy(m) + 1}px;height:${(dur / 60) * WPX - 3}px;left:calc(${li * laneW}% + 3px);width:calc(${laneW}% - 5px);animation-delay:${(di * .07 + li * .03 + (m - 540) / 4000).toFixed(2)}s"></i>`;
            m += dur + (rnd() < .3 ? 15 : 5);
          }
        });
      });
      FREE.filter((x) => x[0] === di).forEach((x) => { const li = FK.indexOf(x[1]); blocks += `<i class="wb free" style="top:${wy(x[2]) + 1}px;height:${(x[3] / 60) * WPX - 3}px;left:calc(${li * laneW}% + 3px);width:calc(${laneW}% - 5px)"></i>`; });
      const lunch = di === 5 ? '' : `<div class="wk-lunch" style="top:${wy(840)}px;height:${wy(960) - wy(840)}px"></div>`;
      cols += `<div class="wk-day ${d[2]}" style="animation-delay:${(di * .07).toFixed(2)}s">${lunch}${blocks}</div>`;
    });
    return `<div class="wk">${head}<div class="wk-body"><div class="hours">${hours}</div>${cols}</div></div>`;
  }
  function mcalHtml() {
    let g = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<i>${d}</i>`).join('');
    for (let d = 26; d <= 31; d++) g += `<u class="o">${d}</u>`;
    for (let d = 1; d <= 30; d++) { const wd = (d + 6) % 7; g += `<u class="${d === 25 ? 't' : (wd < 6 && d > 25 ? 'b' : '')}">${d}</u>`; }
    for (let d = 1; d <= 6; d++) g += `<u class="o">${d}</u>`;
    return `<div class="card mcal"><div class="mh">Noviembre 2026<span>${ic('chevL', 16)}${ic('chevR', 16)}</span></div><div class="g">${g}</div></div>`;
  }
  function buildAgenda() {
    const s = scr('agenda');
    let hours = ''; for (let hh = 9; hh <= 15; hh++) hours += `<span style="top:${yOf(hh * 60)}px">${hh}:00</span>`;
    let grid = ''; for (let m = 540; m <= 900; m += 30) grid += `<i class="${m % 60 ? 'hh' : ''}" style="top:${yOf(m)}px"></i>`;
    const occ = OCC0;
    const lanes = FK.map((k) => `<div class="lane" data-lane="${k}">${laneInner(k)}</div>`).join('');
    const rooms = [
      ['Box 1', 'Irene · Marta Sánchez', 'irene', 'live', 'En sesión'],
      ['Box 2', 'Pablo · Raúl Martí', 'pablo', 'live', 'En sesión'],
      ['Box 3', 'Nuria · Paula Doménech', 'nuria', 'live', 'En sesión'],
      ['Sala pilates', 'Sergio · grupo de 6', 'sergio', 'live', 'En sesión'],
      ['Gimnasio', 'Libre hasta las 12:15', null, '', 'Libre'],
    ];
    s.innerHTML = `
    <div class="ag-tool">
      <div class="navb"><button class="icon-btn">${ic('chevL', 16)}</button><button class="icon-btn">${ic('chevR', 16)}</button></div>
      <button class="btn" style="height:32px">Hoy</button>
      <div class="date"><b id="ag-date">Miércoles, 25 de noviembre</b><span id="ag-dsub">38 citas · 4 fisioterapeutas · 5 salas</span></div>
      <div class="seg" style="margin-left:14px" id="ag-view"><button class="on" data-v="day">Día</button><button data-v="week">Semana</button></div>
      <div class="seg"><button class="on">Por fisio</button><button>Por sala</button></div>
      <div class="legend"><span><i style="background:var(--teal)"></i>Confirmada</span><span><i style="background:repeating-linear-gradient(135deg,#D9861A 0 2px,#fff 2px 4px)"></i>Sin confirmar</span><span><i style="background:#fff;box-shadow:inset 0 0 0 2px var(--teal)"></i>En sala</span></div>
    </div>
    <div class="ag-wrap">
      <div class="card ag-card" id="agcard">
        <div class="ag-head"><div></div>${FK.map((k) => `<div class="col">${avF(k, 32)}<div><b>${F[k].n}</b><small>${F[k].esp}</small></div><div class="oc" data-occ="${k}"><b>${occ[k]} %</b><i><u style="transform:scaleX(${occ[k] / 100});background:${F[k].c}"></u></i></div></div>`).join('')}</div>
        <div class="ag-body" id="agbody"><div class="hours">${hours}</div>${lanes}<div class="ag-grid">${grid}</div><div class="now" id="now"><span id="nowl">11:20</span></div></div>
        ${weekHtml()}
        <div class="card pop" id="pop">
          <div class="ph"><span class="pico">${ic('knee', 20)}</span><div><b>Marta Sánchez Ferrer</b><small>LCA · postoperatorio · sesión 9 de 16</small></div></div>
          <dl><dt>Hora</dt><dd>10:50 – 11:40 · Box 1</dd><dt>Fisio</dt><dd>Irene Soler</dd><dt>Bono</dt><dd>Fisio 10 sesiones · 5/10</dd><dt>Cobro</dt><dd><span class="chip ok">${ic('check', 12, '', 2.4)}Incluido en bono</span></dd></dl>
          <div class="note">${ic('file', 14)} <b>Nota previa:</b> medir flexión; si pasa de 125°, empezar carrera continua.</div>
          <div class="acts"><button class="btn">${ic('file', 14)}Ficha</button><button class="btn pri">${ic('check', 14)}Terminar</button></div>
        </div>
      </div>
      <div class="rail" id="rail">
        <div class="rp on" data-rp="def">
          ${mcalHtml()}
          <div class="card rooms"><div class="card-h"><h3>Ahora en la clínica</h3><div class="r"><span class="chip live"><span class="d"></span>4 de 5</span></div></div>
            ${rooms.map((r) => `<div class="room"><span class="ri" style="background:${r[2] ? F[r[2]].bg : '#F2F4F6'};color:${r[2] ? F[r[2]].dk : '#7D8899'}">${ic(r[0] === 'Gimnasio' ? 'dumbbell' : 'door', 16)}</span><div><b>${r[0]}</b><span>${r[1]}</span></div><span class="chip ${r[3]}">${r[4]}</span></div>`).join('')}
          </div>
          <div class="card wl"><div class="card-h" style="padding:14px 0 0"><h3>Lista de espera</h3><div class="r"><span class="chip lila">14 pacientes</span></div></div>
            <div class="avs">${['Beatriz Ramos', 'Pep Llopis', 'Quique Aliaga', 'Toni Esteve'].map((n) => av(n, 32)).join('')}<span class="more">y 10 más</span></div>
            <p>El asistente les ofrece los huecos que se liberan, por orden de preferencia.</p></div>
        </div>
        <div class="rp" data-rp="week">
          <div class="card" style="padding:16px 18px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:14px;font-weight:600">Ocupación de la semana</h3><span class="chip ok">${ic('up', 12, '', 2.2)}+4 pts</span></div>
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px"><b style="font-size:34px;font-weight:650;letter-spacing:-.02em" class="tn" id="wk-occ">92</b><span style="color:var(--ink3);font-size:15px">%</span><span style="margin-left:auto;color:var(--ink3);font-size:12px">181 de 197 horas</span></div>
            <div style="display:flex;gap:6px;align-items:flex-end;height:64px;margin-top:10px">${[96, 94, 95, 89, 86, 61].map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px"><i class="bar" style="display:block;width:100%;height:${v * .5}px;border-radius:5px;background:${i === 2 ? 'var(--teal)' : i < 2 ? '#9EDDD3' : '#D6F0EB'};animation-delay:${.2 + i * .06}s"></i><small style="font-size:10.5px;color:var(--ink3)">${['L', 'M', 'X', 'J', 'V', 'S'][i]}</small></div>`).join('')}</div></div>
          <div class="card"><div class="card-h"><h3>Salas esta semana</h3></div><div style="padding:6px 18px 12px">
            ${[['Box 1', 96, 'irene'], ['Box 2', 98, 'pablo'], ['Box 3', 90, 'nuria'], ['Sala pilates', 84, 'sergio'], ['Gimnasio', 61, null]].map(([n, v, k], i) => `<div class="occ-row" style="grid-template-columns:90px 1fr 42px"><span class="nm">${n}</span><span class="trk"><i class="gx" style="width:${v}%;background:${k ? F[k].c : '#A8B1BE'};animation-delay:${.25 + i * .07}s"></i></span><span class="pc">${v} %</span></div>`).join('')}
          </div></div>
          <div class="card" id="wk-free"><div class="card-h"><h3>Huecos libres</h3><div class="r"><span class="chip sky">3 esta semana</span></div></div><div style="padding:4px 16px 14px">
            ${[['Vie 27', '10:00', 'Nuria · 60 min', 'nuria'], ['Vie 27', '17:30', 'Pablo · 45 min', 'pablo'], ['Sáb 28', '12:00', 'Sergio · 60 min', 'sergio']].map((r) => `<div class="room" style="padding:8px 0;grid-template-columns:44px 1fr auto"><span class="ri" style="width:44px;background:${F[r[3]].bg};color:${F[r[3]].dk};font-size:11px;font-weight:600">${r[0]}</span><div><b>${r[1]}</b><span>${r[2]}</span></div><span class="link">Ofrecer</span></div>`).join('')}
          </div></div>
        </div>
        <div class="rp" data-rp="ai">
          <div class="card ai">
            <div class="ai-top"><div class="k"><span class="sp">${ic('spark', 15)}</span>Asistente · hace un momento</div>
              <h4>Laura ha cancelado. Nuria tiene un hueco a las <em>12:00</em>.</h4><p>Busco en la lista de espera a quien mejor le encaja.</p></div>
            <div class="ai-scan"><div class="row"><span id="ai-st">Revisando lista de espera…</span><b id="ai-n">0/14</b></div><div class="pb"><i id="ai-pb"></i></div><div class="tick" id="ai-tick"></div></div>
            <div class="cands">
              ${[['Beatriz Ramos', 'Diástasis postparto · bono 6/10', 98, ['Pidió mañanas', 'Ya es paciente de Nuria', 'A 8 min']], ['Pep Llopis', 'Suelo pélvico · bono 4/8', 91, ['Mañanas', 'Ya es paciente de Nuria']], ['Quique Aliaga', 'Primera valoración', 84, ['Cualquier hora', 'Nuevo']]].map((c, i) => `<div class="cand ${i === 0 ? 'best' : ''}" data-cand="${i}"><div class="ch">${av(c[0], 36)}<div><b>${c[0]}</b><small>${c[1]}</small></div><div class="m"><b>${c[2]} %</b><small>encaje</small></div></div><div class="why">${c[3].map((w, j) => `<span class="chip ${j === 0 ? 'live' : ''}">${w}</span>`).join('')}</div></div>`).join('')}
            </div>
            <div class="ai-acts"><button class="btn pri" id="ai-send">${WA(18)}<span>Ofrecer a Beatriz</span></button><button class="btn">Ver lista</button></div>
          </div>
        </div>
        <div class="rp" data-rp="sync">
          <div class="card sync-big"><div class="ring spin" id="sy-ring">${ic('sync', 22)}</div><div><b id="sy-t">Sincronizando…</b><small>Cita de Beatriz Ramos · hoy 12:00</small></div></div>
          <div class="card sync" style="padding-top:4px">
            ${[['agenda', '<span class="si" style="background:#EAF3FC;color:#1C5FA3">' + ic('cal', 16) + '</span>', 'Agenda de Vela', 'Nuria · 12:00–13:00 · Box 3'], ['gcal', '<span class="si" style="background:#fff;border:1px solid var(--line)">' + LG('googlecalendar', 18) + '</span>', 'Google Calendar de Nuria', 'nuria.climent@fisiovela.es'], ['rec', '<span class="si" style="background:#E7F7EE">' + LG('whatsapp', 17) + '</span>', 'Recordatorio por WhatsApp', 'Programado a las 11:30'], ['bono', '<span class="si" style="background:#F1EFFE;color:#4F3FC6">' + ic('ticket', 16) + '</span>', 'Bono de Beatriz', 'Sesión 7 de 10 reservada'], ['wl', '<span class="si" style="background:#FDF4E6;color:#8F5306">' + ic('list', 16) + '</span>', 'Lista de espera', 'Beatriz sale de la lista · quedan 13']].map((r) => `<div class="sy" data-sy="${r[0]}">${r[1]}<div><b>${r[2]}</b><span>${r[3]}</span></div><span class="st">${ic('check', 12, '', 3)}</span></div>`).join('')}
          </div>
          <div class="card"><div class="card-h">${LG('googlecalendar', 18)}<h3>Así lo ve Nuria en su calendario</h3></div><div class="gview">
            <div class="gr"><time>11:00</time><div class="ev mut"><b>Paula Doménech</b>Recuperación postparto</div></div>
            <div class="gr"><time>12:00</time><div class="ev nw" id="gv-new"><b>Beatriz Ramos · Box 3</b>Diástasis postparto · Vela</div></div>
            <div class="gr"><time>13:15</time><div class="ev mut"><b>Neus Bataller</b>Suelo pélvico</div></div></div></div>
        </div>
      </div>
    </div>`;
  }

  const OCC0 = { irene: 97, pablo: 100, nuria: 92, sergio: 91 };
  function setOcc(k, v, dn) { const el = $(`.oc[data-occ="${k}"]`); if (!el) return; $('b', el).textContent = v + ' %'; $('b', el).classList.toggle('dn', !!dn); $('u', el).style.transform = `scaleX(${v / 100})`; }

  /* ================= PACIENTES ================= */
  function evaSvg() {
    const W = 404, H = 188, x0 = 34, x1 = W - 16, t = 14, b = 160;
    const vals = [8, 7, 7, 6, 5, 4, 4, 3, 2];
    const X = (i) => x0 + (i * (x1 - x0)) / (vals.length - 1), Y = (v) => b - (v / 10) * (b - t);
    const pts = vals.map((v, i) => [X(i), Y(v)]);
    let s = `<svg class="ch" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="evg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F9F8F" stop-opacity=".16"/><stop offset="1" stop-color="#0F9F8F" stop-opacity="0"/></linearGradient></defs>`;
    s += `<rect x="${x0}" y="${Y(2)}" width="${x1 - x0}" height="${b - Y(2)}" fill="#E7F7EE" opacity=".7"/><text x="${x1 - 4}" y="${Y(2) + 14}" text-anchor="end" fill="#127A3A" style="fill:#127A3A">Objetivo ≤ 2</text>`;
    [0, 5, 10].forEach((v) => { s += `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="#EEF1F4"/><text x="${x0 - 10}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`; });
    vals.forEach((v, i) => { s += `<text x="${X(i)}" y="${b + 20}" text-anchor="middle">S${i + 1}</text>`; });
    const d = smooth(pts);
    s += `<path d="${d} L${x1} ${b} L${x0} ${b}Z" fill="url(#evg)" class="rise" style="animation-delay:.9s"/>`;
    s += `<path class="ln" pathLength="1" d="${d}"/>`;
    pts.forEach((p, i) => { s += `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5.5 : 3.5}" fill="${i === pts.length - 1 ? '#0F9F8F' : '#fff'}" stroke="#0F9F8F" stroke-width="2" style="animation-delay:${.35 + i * .17}s;transform-origin:${p[0]}px ${p[1]}px"/>`; });
    const lp = pts[pts.length - 1];
    s += `<g class="pt" style="animation-delay:1.9s;transform-origin:${lp[0]}px ${lp[1]}px"><rect x="${lp[0] - 62}" y="${lp[1] - 44}" width="52" height="24" rx="7" fill="#0E1726"/><text x="${lp[0] - 36}" y="${lp[1] - 28}" text-anchor="middle" style="fill:#fff;font-weight:600;font-size:12px">EVA 2</text></g>`;
    return s + '</svg>';
  }
  function bodySvg() {
    return `<svg width="120" height="236" viewBox="0 0 120 236" aria-hidden="true"><g fill="none" stroke="#E3E8EE" stroke-linecap="round" stroke-linejoin="round">
      <path d="M43 50 30 100 25 132" stroke-width="12"/><path d="M77 50 90 100 95 132" stroke-width="12"/>
      <path d="M50 136 47 180 45 224" stroke-width="15"/><path d="M70 136 73 180 75 224" stroke-width="15"/></g>
      <circle cx="60" cy="22" r="14" fill="#E3E8EE"/><path d="M41 42c6-4 32-4 38 0l3 52c0 10-4 20-4 26v16H42v-16c0-6-4-16-4-26z" fill="#E3E8EE"/>
      <circle cx="47" cy="180" r="7" fill="#0F9F8F" class="bspot"/><circle cx="47" cy="180" r="6" fill="#0F9F8F"/><circle cx="47" cy="180" r="2.2" fill="#fff"/>
      <circle cx="49" cy="158" r="4.5" fill="#7C6CF0" opacity=".85"/><circle cx="52" cy="128" r="3.5" fill="#A8B1BE"/></svg>`;
  }
  function buildPacientes() {
    const s = scr('pacientes');
    const pl = [['Marta Sánchez Ferrer', 'LCA · postoperatorio', 'Hoy'], ['Raúl Martí Soler', 'Lumbalgia aguda', 'Hoy'], ['Jorge Lozano Pla', 'Tendinopatía de hombro', '20 nov'], ['Álvaro Pastor Ruiz', 'Fisio deportiva', 'Hoy'], ['Pau Llorens Mas', 'Rotura fibrilar', 'Hoy'], ['Vicent Mora Giner', 'Revisión de rodilla', '24 nov'], ['Clara Ibáñez Roca', 'Suelo pélvico', '23 nov']];
    s.innerHTML = `
    <div class="ptg">
      <div class="card plist">
        <div class="ps">${ic('search', 15)}Buscar entre 1.204 pacientes</div>
        <div class="pf"><span class="chip live">Activos · 312</span><span class="chip">En alta</span><span class="chip">Mutuas</span></div>
        ${pl.map((p, i) => `<div class="pr ${i === 0 ? 'on' : ''}" data-pr="${i}">${av(p[0], 36)}<div><b>${p[0]}</b><span>${p[1]}</span></div><time>${p[2]}</time></div>`).join('')}
        <div class="pmore">${ic('users', 15)}Ver los 1.204 pacientes</div>
      </div>
      <div class="pcenter">
        <div class="card phead">${av('Marta Sánchez', 60)}
          <div><h2>Marta Sánchez Ferrer</h2>
            <div class="meta"><span>34 años</span><span>${ic('heart', 13)}Corredora de montaña</span><span>${ic('phone', 13)}6•• ••• 284</span></div>
            <div class="tags"><span class="chip live">Postquirúrgico LCA</span><span class="chip lila">${ic('ticket', 12)}Bono 5/10</span><span class="chip ok">${ic('shield', 12)}Consentimiento firmado</span></div></div>
          <div class="r"><button class="icon-btn">${WA(18)}</button><button class="btn pri">${ic('plus', 15)}Nueva cita</button></div>
        </div>
        <div class="tabs"><span class="on">Resumen</span><span>Historia clínica <em>9</em></span><span>Sesiones <em>9</em></span><span>Ejercicios</span><span>Documentos <em>4</em></span><span>Facturas <em>3</em></span></div>
        <div class="pgrid">
          <div class="card eva" id="evacard"><div class="card-h"><h3>Dolor (escala EVA)</h3><div class="r"><span class="sub">por sesión</span></div></div>
            <div class="big"><b>8 → 2</b><span>de 10</span><span class="chip ok">${ic('down', 12, '', 2.2)}<span id="eva-pc">−75 %</span> en 9 sesiones</span></div>${evaSvg()}</div>
          <div class="card romc"><div class="card-h"><h3>Movilidad y fuerza</h3></div>
            <div class="rom"><div class="rl"><span>Flexión de rodilla</span><b id="rom1">128°</b></div><div class="rt"><i id="rom1b"></i><u style="left:${(135 / 150) * 100}%"></u></div><div class="rf"><span>Inicio 95°</span><span>Objetivo 135°</span></div></div>
            <div class="rom"><div class="rl"><span>Extensión</span><b>0°</b></div><div class="rt"><i style="width:100%" class="gx"></i></div><div class="rf"><span>Inicio −5°</span><span>Completa</span></div></div>
            <div class="rom"><div class="rl"><span>Fuerza cuádriceps vs. sana</span><b id="rom3">84 %</b></div><div class="rt"><i id="rom3b"></i><u style="left:90%"></u></div><div class="rf"><span>Inicio 62 %</span><span>Alta ≥ 90 %</span></div></div>
            <div class="dx"><b>Plastia LCA rodilla derecha</b>Operada el 2/9 · sesión 9 de 16</div></div>
        </div>
        <div class="card notes"><div class="card-h"><h3>Evolución</h3><div class="r"><span class="doc">${DOC('pdf', 22)}Informe quirúrgico</span><span class="doc">${DOC('jpg', 22)}RM rodilla</span><span class="doc">${DOC('docx', 22)}Consentimiento</span></div></div>
          <div class="nt today"><div class="tl"><i></i></div><div class="nb"><div class="nh"><b>Hoy · sesión 9</b>Irene Soler · Box 1</div><div class="box" id="note-box"><span class="caret"></span></div><div class="saved" id="note-saved"><span class="chip ok">${ic('check', 12, '', 2.4)}Guardada y firmada</span><span class="chip">${ic('spark', 12)}Ejercicios en casa actualizados</span></div></div></div>
          <div class="nt"><div class="tl"><i></i></div><div class="nb"><div class="nh"><b>18 nov · sesión 8</b>Irene Soler</div><p>Buena tolerancia a sentadilla búlgara. EVA 3 al bajar escaleras. Flexión 121°.</p></div></div>
          <div class="nt"><div class="tl"><i></i></div><div class="nb"><div class="nh"><b>11 nov · sesión 7</b>Irene Soler</div><p>Empieza propiocepción en bosu. Ligero derrame tras caminar rápido: crioterapia y descarga.</p></div></div>
        </div>
      </div>
      <div class="pright">
        <div class="card body"><div class="card-h"><h3>Mapa corporal</h3><div class="r"><span class="sub">vista frontal</span></div></div>
          <div class="bm">${bodySvg()}<div class="leg"><span><i style="background:var(--teal)"></i><span><b>Rodilla derecha</b><br>dolor 2/10 al flexionar</span></span><span><i style="background:var(--lila)"></i><span><b>Cuádriceps</b><br>fuerza al 84 %</span></span><span><i style="background:var(--ink4)"></i><span><b>Cadera</b><br>sin dolor</span></span></div></div></div>
        <div class="card"><div class="card-h"><h3>Próximas citas</h3></div><div class="nxt">
          <div class="r1"><div class="dd"><small>Lun</small><b>30</b></div><p>10:50 · Irene · Box 1<span>Sesión 10 · bono 6/10</span></p></div>
          <div class="r1"><div class="dd"><small>Jue</small><b>3</b></div><p>10:50 · Irene · Gimnasio<span>Test de salto y carrera</span></p></div></div></div>
        <div class="card" style="flex:1"><div class="card-h"><h3>Ejercicios en casa</h3><div class="r"><span class="chip ok">86 % hechos</span></div></div>
          <div class="ex"><svg width="74" height="74" viewBox="0 0 74 74"><circle cx="37" cy="37" r="30" fill="none" stroke="#EEF1F4" stroke-width="8"/><circle cx="37" cy="37" r="30" fill="none" stroke="#0F9F8F" stroke-width="8" stroke-linecap="round" pathLength="100" stroke-dasharray="86 100" transform="rotate(-90 37 37)"/><text x="37" y="42" text-anchor="middle" font-size="16" font-weight="650" fill="#0E1726" font-family="Geist">86%</text></svg>
            <ul><li><i>${ic('check', 11, '', 3)}</i>Sentadilla isométrica · 3×45 s</li><li><i>${ic('check', 11, '', 3)}</i>Puente unilateral · 3×12</li><li><i>${ic('check', 11, '', 3)}</i>Equilibrio a una pierna · 3×30 s</li><li><i style="background:var(--soft);color:var(--ink4)">${ic('clock', 11, '', 2.4)}</i>Bici estática · 15 min</li></ul></div>
          <div style="padding:0 16px 14px;font-size:12px;color:var(--ink3);display:flex;gap:6px;align-items:center">${ic('phoneS', 14)}Marta los marca desde el enlace que recibe por WhatsApp.</div>
        </div>
      </div>
    </div>`;
  }

  /* ================= MENSAJES ================= */
  function buildMensajes() {
    const s = scr('mensajes');
    const cvs = [
      ['Beatriz Ramos', 'Asistente: Se acaba de liberar una cita…', '11:25', 0, true],
      ['Laura Cano', 'Lo siento, hoy no puedo ir a las 12:00', '11:23', 0, false],
      ['Jorge Lozano', 'Perfecto, allí estaré', '11:14', 0, false],
      ['Iker Bolea', '¿Me podéis mandar la factura de octubre?', '10:58', 1, false],
      ['Álvaro Pastor', 'Bono renovado, ¡gracias!', '10:41', 0, false],
      ['Pep Llopis', 'Asistente: Te recordamos tu cita del jueves…', '10:30', 0, true],
      ['Quique Aliaga', '¿Hay aparcamiento cerca de la clínica?', 'Ayer', 2, false],
    ];
    s.style.padding = '22px 28px 24px';
    s.innerHTML = `
    <div class="card ms">
      <div class="inbox">
        <div class="ih"><h3>${WA(20)}WhatsApp Business</h3><small>Número de la clínica · 96• ••• 412</small><div class="seg"><button class="on">Todos</button><button>Sin leer <em>3</em></button><button>Asistente</button></div></div>
        ${cvs.map((c, i) => `<div class="cv ${i === 0 ? 'on' : ''}">${av(c[0], 38)}<div><b>${c[0]}</b><p>${c[4] ? `<span class="bot">${ic('spark', 11)}</span> ` : ''}${c[1]}</p></div><div class="rt">${c[2]}${c[3] ? `<span class="un">${c[3]}</span>` : ''}</div></div>`).join('')}
      </div>
      <div class="chat">
        <div class="chat-h">${av('Beatriz Ramos', 38)}<div><b>Beatriz Ramos</b><small>En lista de espera desde el 18 nov · prefiere mañanas</small></div><div class="r"><button class="icon-btn">${ic('phone', 16)}</button><button class="icon-btn">${ic('user', 16)}</button><button class="icon-btn">${ic('more', 16)}</button></div></div>
        <div class="chat-b" id="chatb"></div>
        <div class="chat-f">${ic('smile', 20)}${ic('clip', 20)}<div class="inp">Escribe un mensaje…<span style="margin-left:auto;font-size:11.5px;color:var(--lila6);display:flex;gap:5px;align-items:center">${ic('spark', 13)}Respuestas del asistente activadas</span></div><span class="send">${ic('mic', 18)}</span></div>
      </div>
      <div class="ctx">
        <div class="pc">${av('Beatriz Ramos', 56)}<b>Beatriz Ramos Gil</b><small>Paciente desde mayo · 31 años</small></div>
        <dl><dt>Motivo</dt><dd>Diástasis abdominal postparto</dd><dt>Fisio</dt><dd>Nuria Climent</dd><dt>Bono</dt><dd>Suelo pélvico · 6/10</dd><dt>Prefiere</dt><dd>Mañanas, de 10:00 a 13:00</dd></dl>
        <div class="flow"><h4>${ic('spark', 15)}Lo que ha hecho el asistente</h4>
          ${[['Hueco detectado', 'Laura Cano canceló las 12:00', '11:23'], ['Lista de espera revisada', '14 pacientes · 3 encajan', '11:24'], ['Oferta enviada a Beatriz', 'Plantilla de WhatsApp aprobada', '11:25'], ['Respuesta de la paciente', 'Esperando…', ''], ['Cita creada y sincronizada', 'Agenda y Google Calendar', ''], ['Recordatorio programado', '11:30 por WhatsApp', '']].map((f, i) => `<div class="fs" data-fs="${i}"><span class="k">${ic('check', 12, '', 3)}</span><div><b>${f[0]}</b><span>${f[1]}</span></div><time>${f[2]}</time></div>`).join('')}
          <div class="tot" id="flow-tot"><span>De la cancelación a la cita</span><b>2 min 41 s</b></div>
        </div>
      </div>
    </div>`;
  }
  const meta = (t, read = true) => `<div class="mt">${t}${read ? `<svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m1.5 9.5 4 4L13 5"/><path d="m9.5 13 1 .8L18 5"/></svg>` : ''}</div>`;

  /* ================= BONOS ================= */
  const BONOS = [
    ['Clara Ibáñez', 'Fisio · 10 sesiones', 8, 10, '28 nov', 'en 3 días', 450, 1],
    ['Vicent Mora', 'Fisio · 5 sesiones', 4, 5, '29 nov', 'en 4 días', 240, 1],
    ['Amparo Navarro', 'Pilates · 8 clases', 5, 8, '29 nov', 'en 4 días', 176, 1],
    ['Josep Ferrando', 'Fisio · 10 sesiones', 9, 10, '30 nov', 'en 5 días', 450, 1],
    ['Nacho Ballester', 'Suelo pélvico · 6 ses.', 4, 6, '1 dic', 'en 6 días', 300, 1],
    ['Iker Bolea', 'Fisio · 5 sesiones', 2, 5, '28 dic', 'en 33 días', 240, 0],
    ['Álvaro Pastor', 'Fisio · 10 sesiones', 1, 10, '25 may', 'renovado hoy', 450, 2],
  ];
  function buildBonos() {
    const s = scr('bonos');
    s.innerHTML = `
    <div class="pagehead" style="margin-bottom:14px"><div><h1>Bonos</h1><p>Sesiones prepagadas de fisio, pilates y suelo pélvico.</p></div>
      <div class="r"><button class="btn">${DOC('xlsx', 20)}Exportar a Excel</button><button class="btn pri">${ic('plus', 15)}Nuevo bono</button></div></div>
    <div class="mini-kpis">
      <div class="card mk"><div class="l">${ic('ticket', 15)}Bonos activos</div><div class="v">186<small>412 sesiones por usar</small></div></div>
      <div class="card mk warn"><div class="l">${ic('alert', 15)}Caducan en 7 días</div><div class="v">5<small>1.616 € en juego</small></div></div>
      <div class="card mk"><div class="l">${ic('repeat', 15)}Renovados en noviembre</div><div class="v"><span id="bk-ren">41</span><small class="g">+9 vs. octubre</small></div></div>
      <div class="card mk"><div class="l">${ICO('dinero', 21, 15)}Ingresos por bonos</div><div class="v"><span id="bk-ing">12.430</span> €<small>este mes</small></div></div>
    </div>
    <div class="card btab" id="btab">
      <div class="tb"><div class="seg" id="bseg"><button class="on" data-b="all">Todos <em>186</em></button><button data-b="exp">Por caducar <em>5</em></button><button>Agotándose <em>12</em></button><button>Caducados <em>3</em></button></div>
        <div class="r"><div class="search" style="width:240px;height:32px">${ic('search', 15)}<span>Buscar paciente</span></div><button class="btn" style="height:32px">${ic('filter', 15)}Filtros</button></div></div>
      <div class="tr th"><span class="cb" id="cb-all">${ic('check', 11, '', 3)}</span><span>Paciente</span><span>Bono</span><span>Uso</span><span>Caduca</span><span>Importe</span><span>Estado</span><span>Último aviso</span></div>
      ${BONOS.map((b, i) => `<div class="tr" data-b="${i}" data-exp="${b[7] === 1 ? 1 : 0}"><span class="cb">${ic('check', 11, '', 3)}</span><span class="pn">${av(b[0], 28)}<b>${b[0]}</b></span><span style="color:var(--ink2)">${b[1]}</span><span class="use"><span class="dots">${Array.from({ length: b[3] }, (_, j) => `<i class="${j < b[2] ? 'u' : ''}"></i>`).join('')}</span>${b[2]}/${b[3]}</span><span class="exp ${b[7] === 1 ? 'soon' : ''}">${b[4]}<small>${b[5]}</small></span><span class="tn">${num(b[6])} €</span><span class="stc">${b[7] === 1 ? '<span class="chip wait"><span class="d"></span>Por caducar</span>' : b[7] === 2 ? '<span class="chip live"><span class="d"></span>Renovado</span>' : '<span class="chip ok"><span class="d"></span>Activo</span>'}</span><span class="last">${b[7] === 2 ? 'Hoy, 10:41' : b[7] === 1 ? 'Sin aviso' : '—'}</span></div>`).join('')}
      <div class="selbar" id="selbar"><div><b><span id="sel-n">5</span> bonos seleccionados</b><br><span>Mensaje con enlace para renovar por Bizum o tarjeta</span></div><button class="btn ghost">Vista previa</button><button class="btn wa" id="sel-send">${WA(18)}Avisar por WhatsApp</button></div>
    </div>`;
  }

  /* ================= COBROS ================= */
  function buildCobros() {
    const s = scr('cobros');
    const pays = [['Pau Llorens', 'Rotura fibrilar', 45, '11:18', 'bizum'], ['Álvaro Pastor', 'Bono de 10 sesiones', 450, '10:41', 'tarjeta'], ['Ana Gil', 'Punción seca', 50, '10:02', 'tarjeta'], ['Sara Tormo', 'Suelo pélvico', 55, '09:58', 'bizum'], ['Xavier Sanz', 'Readaptación LCA', 45, '09:55', 'dinero'], ['Vicent Mora', 'Revisión · bono 4/5', 0, '09:47', 'bono']];
    const pm = (m) => (m === 'bono' ? `<span class="pmi bono">${ic('ticket', 14)}</span>` : ICO(m, 24, 17));
    s.innerHTML = `
    <div class="cb3">
      <div class="card cobday">
        <div class="card-h"><h3>Cobros de hoy</h3><div class="r"><span class="link">Caja ${ic('chevR', 14)}</span></div></div>
        <div class="sum"><b id="cob-tot">1.284,00 €</b><small id="cob-n">16 cobros</small>
          <div class="split"><i style="width:48%;background:#3B6FE8"></i><i style="width:34%;background:#05C3C3"></i><i style="width:6%;background:#19A974"></i><i style="width:12%;background:var(--lila)"></i></div>
          <div class="lg"><span>${ICO('tarjeta', 20, 14)}Tarjeta<b>616 €</b></span><span>${ICO('bizum', 20, 14)}Bizum<b id="cob-biz">437 €</b></span><span>${ICO('dinero', 20, 14)}Efectivo<b>77 €</b></span><span>${ic('shield', 15)}Mutuas<b>154 €</b></span></div></div>
        <div id="paylist">${pays.map((p) => `<div class="pay">${av(p[0], 36)}<div><b>${p[0]}</b><span>${p[1]}</span></div><div class="am"><span class="amv">${pm(p[4])}${p[2] ? eur(p[2]) : 'Bono'}</span><small>${p[3]}</small></div></div>`).join('')}</div>
      </div>
      <div class="card tpv">
        <div class="who">${av('Raúl Martí', 50)}<div><b>Raúl Martí Soler</b><small>Lumbalgia aguda · Pablo Ferrer · Box 2 · 10:50–11:50</small></div><span class="chip lila" style="margin-left:auto">Primera visita</span></div>
        <div class="lines">
          <div class="ln" style="background:var(--soft2);font-size:11.5px;color:var(--ink3);padding:8px 14px"><span>Concepto</span><span>Ud.</span><span>Importe</span></div>
          <div class="ln"><span>Sesión de fisioterapia · 60 min<small>Terapia manual y ejercicio terapéutico</small></span><span>1</span><span>50,00 €</span></div>
          <div class="ln"><span>Vendaje neuromuscular<small>Zona lumbar</small></span><span>1</span><span>8,00 €</span></div>
          <div class="ln ex"><span>IVA · exento por servicio sanitario</span><span></span><span>0,00 €</span></div>
          <div class="ln tt"><span>Total</span><span></span><span>58,00 €</span></div>
        </div>
        <div class="upsell">${ic('spark', 16)}<span>Con el <b>bono de 10 sesiones</b> Raúl pagaría 45 € por sesión y ahorraría 50 €.</span><button class="btn">Ofrecer bono</button></div>
        <div class="methods">
          <div class="mth" data-m="card"><span class="mi">${ICO('tarjeta', 30, 21)}</span><b>Tarjeta</b><small>Datáfono de recepción</small></div>
          <div class="mth" data-m="bizum"><span class="mi">${ICO('bizum', 30, 21)}</span><b>Bizum</b><small>Al móvil 6•• ••• 731</small></div>
          <div class="mth" data-m="cash"><span class="mi">${ICO('dinero', 30, 21)}</span><b>Efectivo</b><small>Calcula el cambio</small></div>
          <div class="mth" data-m="link"><span class="mi">${LG('stripe', 20)}</span><b>Enlace de pago</b><small>Stripe, por WhatsApp</small></div>
        </div>
        <div class="nextslot"><div class="nh">${ic('calc', 16)}<b>Siguiente cita</b>· Pablo recomienda 3 sesiones más</div>
          <div class="sl"><span class="on"><b>Vie 27 · 10:50</b>Pablo · Box 2</span><span><b>Lun 30 · 17:30</b>Pablo · Box 2</span><span><b>Mar 1 · 9:00</b>Pablo · Box 2</span></div></div>
        <div style="flex:1"></div>
        <button class="paybtn" id="paybtn"><span id="paytxt">Cobrar 58,00 €</span><span class="prog" id="payprog"></span></button>
        <div class="payst" id="payst">Elige cómo paga Raúl</div>
      </div>
      <div class="card inv" id="inv">
        <div class="empty"><div><span class="eico">${DOC('factura', 46)}</span>La factura se genera sola<br>al terminar el cobro</div></div>
        <div class="paper">
          <div class="ph"><div class="lg">${LOGO('lg3').replace('class="logo"', 'width="30" height="30"')}<div><b>Fisio Vela, S.L.</b>CIF B-98765432</div></div><h5><span class="fh">${DOC('factura', 22)}Factura</span><small>F-2026/1184</small></h5></div>
          <div class="pp"><div><b>Emisor</b>C/ de Cádiz, 32 · 46006 València<br>hola@fisiovela.es</div><div><b>Paciente</b>Raúl Martí Soler<br>NIF •••••412K</div><div><b>Fecha</b>25/11/2026 · 11:52</div><div><b>Forma de pago</b>Bizum</div><div><b>Fisioterapeuta</b>Pablo Ferrer · col. 4.218</div></div>
          <table><tr><th>Concepto</th><th>Importe</th></tr>
            <tr class="r" style="animation-delay:.5s"><td>Sesión de fisioterapia · 60 min</td><td>50,00 €</td></tr>
            <tr class="r" style="animation-delay:.65s"><td>Vendaje neuromuscular</td><td>8,00 €</td></tr></table>
          <div class="tot"><div><span>Base</span><span>58,00 €</span></div><div><span>IVA (exento)</span><span>0,00 €</span></div><div class="g"><span>Total</span><span>58,00 €</span></div></div>
          <div class="lex">Operación exenta de IVA según el artículo 20.Uno.3.º de la Ley 37/1992 (asistencia sanitaria).</div>
          <div class="qr">${qrSvg()}<span>Código de verificación<br><span class="mono">VLA-1184-7Q2K</span></span></div>
          <div class="stamp" id="stamp">PAGADA</div>
        </div>
        <span class="chip line sent" id="inv-sent">${LG('gmail', 15)}Enviada a raul.m•••@gmail.com</span>
      </div>
    </div>`;
  }
  function qrSvg() {
    const r = seeded(1184); let s = '<svg width="54" height="54" viewBox="0 0 21 21" shape-rendering="crispEdges"><rect width="21" height="21" fill="#fff"/>';
    const fin = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#0E1726"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0E1726"/>`;
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12); if (!inF && r() > .52) s += `<rect x="${x}" y="${y}" width="1" height="1" fill="#0E1726"/>`; }
    return s + fin(0, 0) + fin(14, 0) + fin(0, 14) + '</svg>';
  }

  /* ================= INFORMES ================= */
  function ingresosSvg() {
    const W = 792, H = 214, x0 = 58, x1 = W - 52, t = 14, b = 178;
    const m = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'], inc = [38200, 33900, 24600, 41300, 45100, 48920], occ = [82, 78, 64, 88, 92, 95];
    const step = (x1 - x0) / 6, bw = 46, mx = 60000;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
    [0, 20000, 40000, 60000].forEach((v) => { const y = b - (v / mx) * (b - t); s += `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#EEF1F4"/><text x="${x0 - 10}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#A8B1BE" font-family="Geist Mono">${v ? num(v / 1000) + 'k €' : '0'}</text>`; });
    [50, 75, 100].forEach((v) => { const y = b - ((v - 40) / 60) * (b - t); s += `<text x="${x1 + 10}" y="${y + 4}" font-size="10.5" fill="#A99CF7" font-family="Geist Mono">${v} %</text>`; });
    const pts = [];
    m.forEach((mm, i) => {
      const cx = x0 + step * i + step / 2, hh = (inc[i] / mx) * (b - t), last = i === 5;
      s += `<rect class="bar" style="animation-delay:${.1 + i * .08}s" x="${cx - bw / 2}" y="${b - hh}" width="${bw}" height="${hh}" rx="7" fill="${last ? '#0F9F8F' : '#BFE8E1'}"/>`;
      s += `<text x="${cx}" y="${b + 20}" text-anchor="middle" font-size="12" fill="${last ? '#0E1726' : '#7D8899'}" font-weight="${last ? 600 : 400}">${mm}</text>`;
      pts.push([cx, b - ((occ[i] - 40) / 60) * (b - t)]);
    });
    s += `<path class="ln2" pathLength="1" d="${smooth(pts)}" fill="none" stroke="#7C6CF0" stroke-width="2.4" stroke-linecap="round"/>`;
    pts.forEach((p, i) => { s += `<circle class="pt" style="animation-delay:${.6 + i * .15}s;transform-origin:${p[0]}px ${p[1]}px" cx="${p[0]}" cy="${p[1]}" r="4" fill="#fff" stroke="#7C6CF0" stroke-width="2"/>`; if (i === 5 || i === 2) s += `<text class="pt" style="animation-delay:${.6 + i * .15}s" x="${p[0] + (i === 5 ? 0 : 0)}" y="${p[1] - 11}" text-anchor="middle" font-size="11.5" font-weight="600" fill="#4F3FC6">${occ[i]} %</text>`; });
    return s + '</svg>';
  }
  function noshowSvg() {
    const W = 446, H = 214, x0 = 40, x1 = W - 18, t = 22, b = 178;
    const v = [7.8, 6.9, 5.2, 4.1, 3.0, 2.1], m = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];
    const X = (i) => x0 + (i * (x1 - x0)) / 5, Y = (q) => b - (q / 10) * (b - t);
    const pts = v.map((q, i) => [X(i), Y(q)]);
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="nsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E5484D" stop-opacity=".12"/><stop offset="1" stop-color="#0F9F8F" stop-opacity=".02"/></linearGradient><linearGradient id="nsl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E5484D"/><stop offset="1" stop-color="#0F9F8F"/></linearGradient></defs>`;
    [0, 5, 10].forEach((q) => { s += `<line x1="${x0}" x2="${x1}" y1="${Y(q)}" y2="${Y(q)}" stroke="#EEF1F4"/><text x="${x0 - 10}" y="${Y(q) + 4}" text-anchor="end" font-size="10.5" fill="#A8B1BE" font-family="Geist Mono">${q} %</text>`; });
    s += `<line x1="${X(1)}" x2="${X(1)}" y1="${t - 6}" y2="${b}" stroke="#7C6CF0" stroke-dasharray="3 4"/><text x="${X(1) + 8}" y="${t + 4}" font-size="11" fill="#4F3FC6">Recordatorios por WhatsApp</text>`;
    m.forEach((mm, i) => { s += `<text x="${X(i)}" y="${b + 20}" text-anchor="middle" font-size="12" fill="${i === 5 ? '#0E1726' : '#7D8899'}" font-weight="${i === 5 ? 600 : 400}">${mm}</text>`; });
    const d = smooth(pts);
    s += `<path d="${d} L${x1} ${b} L${x0} ${b}Z" fill="url(#nsg)" class="rise" style="animation-delay:.8s"/><path class="ln2" pathLength="1" d="${d}" fill="none" stroke="url(#nsl)" stroke-width="2.6" stroke-linecap="round"/>`;
    pts.forEach((p, i) => { s += `<circle class="pt" style="animation-delay:${.5 + i * .16}s;transform-origin:${p[0]}px ${p[1]}px" cx="${p[0]}" cy="${p[1]}" r="${i === 5 ? 5 : 3.5}" fill="${i === 5 ? '#0F9F8F' : '#fff'}" stroke="${i < 2 ? '#E5484D' : '#0F9F8F'}" stroke-width="2"/>`; });
    s += `<text class="pt" style="animation-delay:.6s" x="${pts[0][0] + 8}" y="${pts[0][1] - 10}" font-size="12" font-weight="600" fill="#B42E33">7,8 %</text><text class="pt" style="animation-delay:1.4s" x="${pts[5][0]}" y="${pts[5][1] - 13}" text-anchor="end" font-size="12" font-weight="600" fill="#086A5F">2,1 %</text>`;
    return s + '</svg>';
  }
  function donutSvg() {
    const seg = [[31, '#0F9F8F'], [22, '#2F86D6'], [19, '#D9861A'], [18, '#7C6CF0'], [10, '#C4CBD5']];
    let acc = 0, s = `<svg width="132" height="132" viewBox="0 0 132 132"><defs><mask id="dmask"><circle cx="66" cy="66" r="50" fill="none" stroke="#fff" stroke-width="20" pathLength="1" class="dn" style="stroke-dasharray:1" transform="rotate(-90 66 66)"/></mask></defs><g mask="url(#dmask)">`;
    seg.forEach(([v, c]) => { s += `<circle cx="66" cy="66" r="50" fill="none" stroke="${c}" stroke-width="18" pathLength="100" stroke-dasharray="${v - .8} ${100 - v + .8}" stroke-dashoffset="${-acc}" transform="rotate(-90 66 66)"/>`; acc += v; });
    return s + `</g><text x="66" y="63" text-anchor="middle" font-size="20" font-weight="650" fill="#0E1726" font-family="Geist">1.046</text><text x="66" y="80" text-anchor="middle" font-size="11" fill="#7D8899" font-family="Geist">sesiones</text></svg>`;
  }
  function buildInformes() {
    const s = scr('informes');
    const fis = [['irene', 284, 97, 13480], ['pablo', 271, 98, 12950], ['nuria', 246, 93, 12120], ['sergio', 245, 92, 10370]];
    s.innerHTML = `
    <div class="pagehead" style="margin-bottom:14px"><div><div class="eyebrow">Del 1 al 30 de noviembre de 2026</div><h1>Informe de noviembre</h1></div>
      <div class="r"><div class="seg"><button class="on">Mes</button><button>Trimestre</button><button>Año</button></div><button class="btn">${DOC('xlsx', 20)}Excel</button><button class="btn">${DOC('pdf', 20)}PDF</button><button class="btn dark" id="rep-send">${ic('send', 15)}Enviar a la gestoría</button></div></div>
    <div class="rk">
      <div class="card mk"><div class="l">${ic('bars', 15)}Ocupación media</div><div class="v"><span id="r-occ">95</span> %<small class="g">+13 pts vs. junio</small></div></div>
      <div class="card mk"><div class="l">${ICO('dinero', 21, 15)}Ingresos</div><div class="v"><span id="r-inc">48.920</span> €<small class="g">+8,5 % vs. octubre</small></div></div>
      <div class="card mk"><div class="l">${ic('calc', 15)}Sesiones realizadas</div><div class="v"><span id="r-ses">1.046</span><small class="g">+71 vs. octubre</small></div></div>
      <div class="card mk" id="r-ns-card"><div class="l">${ic('down', 15)}Citas perdidas (no-shows)</div><div class="v"><span id="r-ns">2,1</span> %<small class="g">desde 7,8 % en junio</small></div></div>
    </div>
    <div class="rgA">
      <div class="card rc"><div class="card-h"><h3>Ingresos y ocupación</h3><div class="r lgd"><span><i style="background:#0F9F8F"></i>Ingresos</span><span><i style="background:#7C6CF0;height:3px;border-radius:2px"></i>Ocupación</span></div></div><div style="padding:10px 6px 0">${ingresosSvg()}</div></div>
      <div class="card rc" id="r-ns-chart"><div class="card-h"><h3>Citas perdidas</h3><div class="r"><span class="chip ok">${ic('down', 12, '', 2.2)}−73 %</span></div></div><div style="padding:10px 4px 0">${noshowSvg()}</div></div>
    </div>
    <div class="rgB">
      <div class="card"><div class="card-h"><h3>Por fisioterapeuta</h3></div><div class="fis-t">
        <div class="ft h"><span></span><span>Nombre</span><span class="tn">Sesiones</span><span>Ocupación</span><span class="tn">Ingresos</span></div>
        ${fis.map(([k, se, oc, inc], i) => `<div class="ft">${avF(k, 28)}<b style="font-weight:500">${F[k].n}</b><span class="tn">${num(se)}</span><span style="display:flex;align-items:center;gap:8px"><span class="ob" style="flex:1"><i style="width:${oc}%;background:${F[k].c};animation-delay:${.3 + i * .08}s"></i></span><span class="tn" style="font-size:12px;color:var(--ink2);width:34px">${oc} %</span></span><span class="tn" style="font-weight:600">${num(inc)} €</span></div>`).join('')}
      </div></div>
      <div class="card"><div class="card-h"><h3>Tratamientos</h3></div><div class="donut">${donutSvg()}<ul>${[['Deportiva', 31, '#0F9F8F'], ['Suelo pélvico', 22, '#2F86D6'], ['Pilates clínico', 19, '#D9861A'], ['Terapia manual', 18, '#7C6CF0'], ['Otros', 10, '#C4CBD5']].map((d) => `<li><i style="background:${d[2]}"></i>${d[0]}<b>${d[1]} %</b></li>`).join('')}</ul></div></div>
      <div class="card aiw"><div class="card-h"><h3 style="display:flex;gap:7px;align-items:center">${ic('spark', 16)}El asistente este mes</h3></div>
        <div class="g4"><div><b id="ai-h">31</b><span>huecos rellenados con la lista de espera</span></div><div><b id="ai-e">2.480 €</b><span>que se habrían perdido</span></div><div><b id="ai-r">1.212</b><span>recordatorios enviados</span></div><div><b id="ai-t">38 h</b><span>de recepción ahorradas</span></div></div><p>Ofrece los huecos a la lista de espera, confirma por WhatsApp y recuerda cada cita el día antes.</p></div>
    </div>`;
  }

  /* ================= VISTA TARJETA ================= */
  const C0 = 650, CPX = 428 / 180; // 10:50–13:50
  const cy = (m) => (m - C0) * CPX;
  const CARD_AG = [
    { f: 'irene', h: 650, d: 50, t: 'Rodilla · LCA', p: 'Marta Sánchez', st: 'insession' },
    { f: 'irene', h: 720, d: 60, t: 'Hombro', p: 'Jorge Lozano', st: 'confirmed' },
    { f: 'irene', h: 795, d: 45, t: 'Tobillo', p: 'Lucía Vidal', st: 'pending' },
    { f: 'pablo', h: 650, d: 60, t: 'Lumbalgia', p: 'Raúl Martí', st: 'insession' },
    { f: 'pablo', h: 720, d: 45, t: 'Descarga', p: 'Álex Roig', st: 'confirmed' },
    { f: 'pablo', h: 770, d: 50, t: 'ATM', p: 'Marc Puig', st: 'confirmed' },
    { f: 'nuria', h: 660, d: 60, t: 'Postparto', p: 'Paula Doménech', st: 'insession' },
    { f: 'nuria', h: 795, d: 45, t: 'Suelo pélvico', p: 'Neus Bataller', st: 'confirmed' },
    { f: 'sergio', h: 660, d: 60, t: 'Pilates', p: 'Grupo de 6', st: 'insession' },
    { f: 'sergio', h: 735, d: 45, t: 'Escoliosis', p: 'Andrés Beltrán', st: 'confirmed' },
    { f: 'sergio', h: 790, d: 60, t: 'Pilates', p: 'Grupo de 5', st: 'confirmed' },
  ];
  function cardAp(a, extra = '', id = '') {
    const f = F[a.f], top = cy(a.h), hg = a.d * CPX - 8;
    return `<div class="ap ${a.st} ${extra}" ${id ? `id="${id}"` : ''} style="top:${top}px;height:${hg}px;--ac:${f.c};--abg:${f.bg};--adk:${f.dk}"><span class="s">${a.st === 'pending' ? ic('clock', 22, '', 2.2) : ''}</span><div class="t">${a.t}</div><div class="p">${a.p}</div></div>`;
  }
  function buildCard() {
    const c = $('#cardv');
    let hours = ''; for (let hh = 11; hh <= 13; hh++) hours += `<span style="top:${cy(hh * 60)}px">${hh}:00</span>`;
    let grid = ''; for (let m = 660; m <= 780; m += 60) grid += `<i style="top:${cy(m)}px"></i>`;
    c.innerHTML = `
    <div class="cr">${LOGO('lg2')}<a class="on">${ic('cal', 28)}</a><a>${ic('users', 28)}</a><a>${ic('msg', 28)}</a><a>${ic('ticket', 28)}</a><a>${ic('chart', 28)}</a></div>
    <div class="cc"><div class="cc-wrap" id="ccw">
      <div class="cc-h"><div><small>Fisio Vela · miércoles 25</small><h1>Agenda de <em>hoy</em></h1></div><div class="clk"><span class="pulse"></span><span id="c-clock">11:18</span></div></div>
      <div class="ck">
        <div class="card" id="ck1"><div class="l">${ic('cal', 30)}Citas hoy</div><div class="v"><span id="c-citas">38</span></div></div>
        <div class="card" id="ck2"><div class="l">${ic('bars', 30)}Ocupación</div><div class="v"><span id="c-occ">94</span><small>%</small></div></div>
        <div class="card" id="ck3"><div class="l">${ICO('dinero', 40, 28)}Cobrado hoy</div><div class="v"><span id="c-cob">1.284</span><small>€</small></div></div>
      </div>
      <div class="card cg">
        <div class="cg-h"><div></div>${FK.map((k) => `<div>${avF(k, 46)}${F[k].s}</div>`).join('')}</div>
        <div class="cg-b"><div class="hours">${hours}</div>${FK.map((k) => `<div class="lane">${CARD_AG.filter((a) => a.f === k).map((a) => cardAp(a)).join('')}${k === 'nuria' ? `<div class="hueco on" id="c-hueco" style="top:${cy(720)}px;height:${60 * CPX - 8}px"><div class="scan"></div><b>${ic('spark', 26)}Hueco · 12:00</b><span>Laura ha cancelado</span></div><div id="c-bea-slot"></div>` : ''}</div>`).join('')}<div class="ag-grid">${grid}</div><div class="now" id="c-now"></div></div>
      </div>
    </div>
    <div class="ctoast" id="c-toast"><div class="ti" id="c-ti"></div><div><b id="c-tt"></b><span id="c-ts"></span></div></div>
    <div class="cpill" id="c-pill"><span class="sp" id="c-psp">${ic('spark', 28)}</span><span id="c-ptx">El asistente ofrece el hueco a la lista de espera…</span></div>
    </div>`;
  }

  /* ================= SUPERPOSICIONES ================= */
  const cur = { x: 1180, y: 760 };
  function moveCursor(x, y, dur = 700) {
    const C = $('#cursor'); C.classList.add('on');
    const x0 = cur.x, y0 = cur.y;
    tween(dur, (e) => { cur.x = x0 + (x - x0) * e; cur.y = y0 + (y - y0) * e; C.style.transform = `translate(${cur.x}px,${cur.y}px)`; }, E.io);
  }
  function cursorTo(el, dur = 700, dx = 0, dy = 0) { if (!el) return; const r = rectOf(el); moveCursor(r.x + r.w / 2 + dx, r.y + r.h / 2 + dy, dur); }
  function click(el) {
    replay($('#cursor .rip'), 'go');
    if (el) { el.classList.add('press'); after(170, () => el.classList.remove('press')); }
  }
  function ring(el, pad = 6, rad = 14) {
    if (!el) return;
    const R = $('#ring'), r = rectOf(el), was = R.classList.contains('on');
    if (!was) R.style.transition = 'none';
    Object.assign(R.style, { transform: `translate(${r.x - pad}px,${r.y - pad}px)`, width: r.w + pad * 2 + 'px', height: r.h + pad * 2 + 'px', borderRadius: rad + 'px' });
    if (!was) { void R.offsetWidth; R.style.transition = ''; }
    R.classList.add('on');
  }
  const unring = () => $('#ring').classList.remove('on');
  function toast(o, life = 3400) {
    const el = h(`<div class="toast"><div class="ti" style="background:${o.bg || 'rgba(255,255,255,.1)'}">${o.icon}</div><div><b>${o.t}</b><span>${o.s}</span></div></div>`);
    $('#toasts').prepend(el);
    after(life, () => { el.classList.add('out'); after(420, () => el.remove()); });
    return el;
  }

  /* ================= NAVEGACIÓN ================= */
  const CRUMB = {
    inicio: 'Inicio', agenda: 'Agenda <small>· Miércoles, 25 nov</small>', pacientes: 'Pacientes <small>· Marta Sánchez</small>',
    mensajes: 'Mensajes <small>· WhatsApp</small>', bonos: 'Bonos', cobros: 'Cobros y facturas', informes: 'Informes',
  };
  function show(k) {
    const s = scr(k);
    if (s.classList.contains('on')) { s.classList.add('stay'); replay(s, 'play'); } // misma pantalla: solo reinicia sus animaciones
    else {
      $$('.scr.on').forEach((o) => { o.classList.remove('on', 'stay'); o.classList.add('out'); setTimeout(() => { if (!o.classList.contains('on')) o.classList.remove('out', 'play'); }, 320); });
      s.classList.remove('out', 'stay');
      if (s.classList.contains('play')) replay(s, 'play'); else s.classList.add('play'); // entra con un solo recálculo de estilo
      s.classList.add('on');
    }
    $$('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.k === k));
    $('#crumb').innerHTML = CRUMB[k];
    return s;
  }
  function setNavCount(k, v, bump) { const el = $(`[data-cnt="${k}"]`); if (!el) return; el.textContent = v; if (bump) replay(el, 'bump'); }

  /* ---------- estados ---------- */
  function resetAgenda(o = {}) {
    const card = $('#agcard');
    card.classList.toggle('week', o.view === 'week');
    $$('#ag-view button').forEach((b) => b.classList.toggle('on', b.dataset.v === (o.view || 'day')));
    $('#ag-dsub').textContent = o.view === 'week' ? 'Semana 48 · 181 citas · ocupación 92 %' : `${o.citas || 38} citas · 4 fisioterapeutas · 5 salas`;
    $('#ag-date').textContent = o.view === 'week' ? '23 – 28 de noviembre' : 'Miércoles, 25 de noviembre';
    // citas a su estado base
    $$('#agbody .lane').forEach((l) => { l.innerHTML = laneInner(l.dataset.lane, o); });
    $('#pop').classList.remove('on');
    FK.forEach((k) => setOcc(k, OCC0[k]));
    if (o.laura === 'hueco') setOcc('nuria', 83, true);
    rail(o.rail || (o.view === 'week' ? 'week' : 'def'));
    // asistente
    $('#ai-pb').style.transform = 'scaleX(0)'; $('#ai-n').textContent = '0/14'; $('#ai-st').textContent = 'Revisando lista de espera…'; $('#ai-tick').textContent = '';
    $$('.cand').forEach((c) => c.classList.remove('in'));
    const send = $('#ai-send'); send.className = 'btn pri'; send.innerHTML = `${WA(18)}<span>Ofrecer a Beatriz</span>`;
    // sincronización
    $$('.sy').forEach((x) => x.classList.remove('ok'));
    $('#sy-ring').className = 'ring spin'; $('#sy-ring').innerHTML = ic('sync', 22); $('#sy-t').textContent = 'Sincronizando…';
    setNavCount('agenda', o.citas || 38);
  }
  function rail(k) { $$('#rail > .rp').forEach((p) => p.classList.toggle('on', p.dataset.rp === k)); }
  function aiDone() {
    $('#ai-pb').style.transform = 'scaleX(1)'; $('#ai-n').textContent = '14/14'; $('#ai-st').textContent = '3 pacientes encajan con el hueco';
    $$('.cand').forEach((c) => c.classList.add('in'));
    const send = $('#ai-send'); send.className = 'btn okd'; send.innerHTML = `${ic('check', 16, '', 2.4)}<span>Enviado a Beatriz</span>`;
  }

  /* ================= PASOS DEL TOUR ================= */
  const STEPS = [
    { title: 'Empieza el día', text: 'Al abrir Vela, Irene ve de un vistazo las citas de hoy, la ocupación, lo cobrado y los bonos que hay que renovar.', ms: 6000 },
    { title: 'Agenda por fisio', text: 'Cada fisioterapeuta tiene su columna y la línea roja marca la hora: quién está en sala y quién acaba de llegar.', ms: 6000 },
    { title: 'Semana y salas', text: 'La vista semanal enseña la ocupación de cada día y de cada sala, y señala los huecos que quedan libres.', ms: 5500 },
    { title: 'Ficha del paciente', text: 'La historia clínica guarda cada sesión y la gráfica EVA enseña cómo baja el dolor de Marta.', ms: 7000 },
    { title: 'Hueco detectado', text: 'Laura cancela por WhatsApp y el asistente busca en la lista de espera a quién le encaja mejor esa hora.', ms: 6500 },
    { title: 'Confirmación por WhatsApp', text: 'El asistente ofrece la cita a Beatriz por WhatsApp y ella la acepta con un toque.', ms: 7000 },
    { title: 'Cita en la agenda', text: 'La cita entra sola en la agenda de Nuria y se sincroniza con su Google Calendar.', ms: 5500 },
    { title: 'Bonos que caducan', text: 'Vela avisa de los bonos a punto de caducar y manda el recordatorio a todos de una vez.', ms: 6000 },
    { title: 'Cobro y factura', text: 'Raúl paga con Bizum en segundos y la factura se genera y se le envía sola.', ms: 6500 },
    { title: 'Informe del mes', text: 'A fin de mes, el informe enseña la ocupación, los ingresos y cómo han bajado las citas perdidas.', ms: 7000 },
  ];

  const ENTER = [
    // 0 · Inicio
    () => {
      const s = show('inicio'); setClock(11 * 60 + 20);
      $('#feed').innerHTML = FEED0.map((f) => feedItem(f)).join('');
      const elena = $('.nx[data-nx="elena"]', s); elena.classList.remove('hl');
      $('.st', elena).innerHTML = `<span class="chip ok">${ic('check', 12, '', 2.4)}Confirmada</span>`;
      count('#k-citas', 0, 38, 1300); count('#k-ocup', 0, 95, 1300);
      count('#k-cob', 0, 1284, 1500); count('#k-bonos', 0, 5, 900);
      const bar = $('#k-ocup-bar'); tween(1300, (e) => { bar.style.transform = `scaleX(${.95 * e})`; });
      after(2300, () => {
        $('#feed').insertAdjacentHTML('afterbegin', feedItem(['ucheck', '#E7F6F3', '#086A5F', '<b>Álex Roig</b> ha llegado a recepción', 'Pablo ya tiene el aviso en su móvil', '11:21'], 'new'));
        elena.classList.add('hl'); $('.st', elena).innerHTML = `<span class="chip live"><span class="d"></span>Ha llegado</span>`;
      });
      after(4100, () => {
        $('#feed').insertAdjacentHTML('afterbegin', feedItem(['calc', '#F1EFFE', '#4F3FC6', 'Reserva online de <b>Toni Esteve</b>', 'Lunes 30 a las 9:00 con Irene · primera visita', '11:22'], 'new'));
        replay($('#k-citas').closest('.kpi'), 'flash');
      });
    },
    // 1 · Agenda por fisio
    () => {
      const s = show('agenda'); setClock(11 * 60 + 21); resetAgenda();
      after(1300, () => {
        const el = $('.ap[data-id="elena"]'); el.classList.add('arrived');
        $('.s', el).innerHTML = ic('ucheck', 14, '', 2); $('.s', el).style.color = 'var(--green)';
        ring(el, 4, 12);
        toast({ icon: ic('ucheck', 20), bg: 'rgba(23,163,74,.25)', t: 'Álex Roig ha llegado', s: 'Cita de las 12:00 con Pablo · aviso enviado a su móvil' }, 3000);
      });
      after(3000, () => { unring(); cursorTo($('.ap[data-id="marta"]'), 800, 40, 8); });
      after(3900, () => {
        const m = $('.ap[data-id="marta"]'); m.classList.add('hl');
        const pop = $('#pop'), lane = m.parentElement;
        pop.style.left = lane.offsetLeft + m.offsetLeft + m.offsetWidth + 12 + 'px';
        pop.style.top = 60 + m.offsetTop - 190 + 'px';
        pop.classList.add('on');
      });
    },
    // 2 · Semana y salas
    () => {
      show('agenda'); setClock(11 * 60 + 22); resetAgenda();
      after(450, () => cursorTo($('#ag-view button[data-v="week"]'), 700));
      after(1250, () => {
        click($('#ag-view button[data-v="week"]'));
        $('#agcard').classList.add('week');
        $$('#ag-view button').forEach((b) => b.classList.toggle('on', b.dataset.v === 'week'));
        $('#ag-date').textContent = '23 – 28 de noviembre'; $('#ag-dsub').textContent = 'Semana 48 · 181 citas · ocupación 92 %';
        rail('week'); replay($('[data-rp="week"]'), 'play');
        count('#wk-occ', 70, 92, 1200);
        $$('[data-wocc]').forEach((el) => { const v = +el.dataset.wocc; count(el, 0, v, 1200, (x) => Math.round(x) + ' %'); });
      });
      after(3000, () => { $('#cursor').classList.remove('on'); const f = $$('.wb.free'); if (f[0]) ring(f[0], 5, 8); });
      after(4200, () => ring($('#wk-free'), 4, 16));
    },
    // 3 · Ficha del paciente
    () => {
      const s = show('pacientes'); setClock(11 * 60 + 22);
      $$('.pr', s).forEach((p) => p.classList.remove('on'));
      $('#note-box').innerHTML = '<span class="caret"></span>'; $('#note-saved').classList.remove('on');
      $('#rom1b').style.transform = 'scaleX(0)'; $('#rom3b').style.transform = 'scaleX(0)';
      after(350, () => cursorTo($('.pr[data-pr="0"]'), 650));
      after(1000, () => { click(); $$('.pr', s).forEach((p, i) => p.classList.toggle('on', i === 0)); });
      tween(1300, (e) => { $('#rom1b').style.transform = `scaleX(${(95 + 33 * e) / 150})`; }, E.o, 900);
      tween(1300, (e) => { $('#rom3b').style.transform = `scaleX(${(62 + 22 * e) / 100})`; }, E.o, 1100);
      count('#rom1', 95, 128, 1300, (v) => Math.round(v) + '°', 900); count('#rom3', 62, 84, 1300, (v) => Math.round(v) + ' %', 1100);
      after(2100, () => { $('#cursor').classList.remove('on'); ring($('#evacard'), 5, 18); });
      const txt = 'Flexión 128°, sin derrame. EVA 2 al bajar escaleras. Empieza carrera continua: 10 min en cinta a ritmo suave.';
      after(3400, () => unring());
      let shown = -1; const nb = $('#note-box');
      tween(2500, (e, p) => { const n = Math.round(txt.length * p); if (n === shown) return; shown = n; if (!nb.firstChild || nb.firstChild.nodeType !== 3) nb.insertBefore(document.createTextNode(''), nb.firstChild); nb.firstChild.nodeValue = txt.slice(0, n); }, E.l, 3300);
      after(6000, () => { $('#note-box').innerHTML = esc(txt); $('#note-saved').classList.add('on'); });
    },
    // 4 · Hueco detectado
    () => {
      show('agenda'); setClock(11 * 60 + 23); resetAgenda();
      after(600, () => {
        toast({ icon: WA(26), bg: '#fff', t: 'Laura Cano ha cancelado', s: '«Lo siento, hoy no puedo ir a las 12:00»' }, 3200);
        $('.ap[data-id="laura"]').classList.add('cancel'); setOcc('nuria', 83, true);
      });
      after(1250, () => { $('.ap[data-id="laura"]').style.display = 'none'; $('#hueco').classList.add('on'); });
      after(1500, () => { ring($('#hueco'), 5, 13); rail('ai'); });
      const names = ['Toni Esteve', 'Mar Sorlí', 'Quique Aliaga', 'Clara Ibáñez', 'Rosa Gil', 'Beatriz Ramos', 'Pep Llopis', 'Inma Roselló'];
      tween(1700, (e, p) => {
        $('#ai-pb').style.transform = `scaleX(${p})`;
        const nn = Math.round(14 * p) + '/14', tk = p < 1 ? 'Comprobando ' + names[Math.min(names.length - 1, Math.floor(p * names.length))] + '…' : '';
        if ($('#ai-n').textContent !== nn) $('#ai-n').textContent = nn; if ($('#ai-tick').textContent !== tk) $('#ai-tick').textContent = tk;
      }, E.l, 1900);
      after(3650, () => { $('#ai-st').textContent = '3 pacientes encajan con el hueco'; $$('.cand').forEach((c, i) => after(i * 180, () => c.classList.add('in'))); });
      after(4600, () => { unring(); cursorTo($('#ai-send'), 700); });
      after(5450, () => {
        const b = $('#ai-send'); click(b);
        after(150, () => { b.className = 'btn okd'; b.innerHTML = `${ic('check', 16, '', 2.4)}<span>Enviado a Beatriz</span>`; });
      });
    },
    // 5 · WhatsApp
    () => {
      show('mensajes'); setClock(11 * 60 + 25);
      const cb = $('#chatb');
      cb.innerHTML = `<div class="sysc">18 de noviembre</div>
        <div class="bb out"><div class="by">${ic('spark', 11)}Asistente de Fisio Vela</div>Hola, Beatriz. Te hemos apuntado en la lista de espera de Nuria para las mañanas. Si se libera una hora, te escribimos por aquí.${meta('17:42')}</div>
        <div class="bb in">¡Genial, muchas gracias!${meta('17:45', false)}</div>
        <div class="sysc">Hoy</div>`;
      $$('.fs').forEach((f, i) => { f.className = 'fs ' + (i < 3 ? 'ok' : i === 3 ? 'run' : 'wait'); });
      $('.fs[data-fs="3"] span:not(.k)').textContent = 'Esperando…'; $('.fs[data-fs="3"] time').textContent = '';
      $('.fs[data-fs="4"] time').textContent = ''; $('.fs[data-fs="5"] time').textContent = '';
      $('#flow-tot').classList.remove('on');
      const add = (html) => { const el = h(html); el.classList.add('msg-in'); cb.appendChild(el); return el; };
      after(400, () => add(`<div class="bb out" id="offer"><div class="by">${ic('spark', 11)}Asistente de Fisio Vela</div>Hola, Beatriz. Se acaba de liberar una cita con <b>Nuria</b> hoy a las <b>12:00</b> (60 min, Box 3). ¿Te la reservo?<div class="qr"><span id="qr-yes">Sí, resérvala</span><span>Otro día</span></div>${meta('11:25')}</div>`));
      let typing;
      after(1600, () => { typing = add('<div class="typing"><i></i><i></i><i></i></div>'); });
      after(2900, () => {
        typing && typing.remove(); $('#qr-yes') && $('#qr-yes').classList.add('sel');
        add(`<div class="bb in"><div class="rq">Se acaba de liberar una cita con Nuria hoy a las 12:00…</div>Sí, resérvala${meta('11:26', false)}</div>`);
        const f3 = $('.fs[data-fs="3"]'); f3.className = 'fs ok'; $('span:not(.k)', f3).textContent = 'Aceptada en 58 s'; $('time', f3).textContent = '11:26';
        $('.fs[data-fs="4"]').className = 'fs run';
      });
      after(3700, () => add(`<div class="bb in">Salgo ahora del trabajo, llego sin problema.${meta('11:26', false)}</div>`));
      after(4500, () => {
        add(`<div class="sysc ok">${ic('calc', 13)}Cita creada · hoy 12:00 con Nuria · Box 3</div>`);
        const f4 = $('.fs[data-fs="4"]'); f4.className = 'fs ok'; $('time', f4).textContent = '11:26'; $('.fs[data-fs="5"]').className = 'fs run';
      });
      after(5300, () => {
        add(`<div class="bb out"><div class="by">${ic('spark', 11)}Asistente de Fisio Vela</div>¡Hecho! Te esperamos a las 12:00 en C/ de Cádiz, 32. Usamos la sesión 7 de 10 de tu bono. Te dejo los ejercicios de la última sesión.<div class="att">${DOC('pdf', 30)}<div><b>Ejercicios diástasis.pdf</b><span>2 páginas · 180 KB</span></div></div>${meta('11:26')}</div>`);
        const f5 = $('.fs[data-fs="5"]'); f5.className = 'fs ok'; $('time', f5).textContent = '11:26';
      });
      after(5900, () => { $('#flow-tot').classList.add('on'); ring($('#flow-tot'), 4, 12); });
    },
    // 6 · Cita en la agenda + Google Calendar
    () => {
      show('agenda'); setClock(11 * 60 + 26); resetAgenda({ laura: 'hueco', rail: 'ai' }); aiDone();
      after(700, () => {
        $('#hueco').classList.remove('on');
        $('.lane[data-lane="nuria"]').insertAdjacentHTML('beforeend', apHtml(BEA, 'drop'));
        rail('sync'); $('#gv-new').classList.remove('nw');
        after(1300, () => replay($('#gv-new'), 'nw'));
        toast({ icon: LG('googlecalendar', 22), bg: '#fff', t: 'Cita creada para Beatriz Ramos', s: 'Hoy 12:00 con Nuria · confirmada por WhatsApp' }, 3600);
        setNavCount('agenda', 39, true); setOcc('nuria', 92); $('#ag-dsub').textContent = '39 citas · 4 fisioterapeutas · 5 salas';
      });
      after(1500, () => ring($('.ap[data-id="bea"]'), 5, 13));
      ['agenda', 'gcal', 'rec', 'bono', 'wl'].forEach((k, i) => after(1700 + i * 520, () => $(`.sy[data-sy="${k}"]`).classList.add('ok')));
      after(4400, () => { const r = $('#sy-ring'); r.className = 'ring'; r.style.background = 'var(--green1)'; r.style.color = 'var(--green)'; r.innerHTML = ic('check', 24, '', 2.4); $('#sy-t').textContent = 'Todo sincronizado'; });
      after(4500, () => { const b = $('.ap[data-id="bea"]'); if (b) b.classList.remove('drop'); });
    },
    // 7 · Bonos
    () => {
      const s = show('bonos'); setClock(11 * 60 + 30);
      $$('#bseg button').forEach((b, i) => b.classList.toggle('on', i === 0));
      $$('.tr[data-b]', s).forEach((r) => { r.classList.remove('dim', 'sel', 'gone'); $('.cb', r).classList.remove('on'); });
      $('#cb-all').classList.remove('on'); $('#selbar').classList.remove('on');
      BONOS.forEach((b, i) => {
        const r = $(`.tr[data-b="${i}"]`, s);
        $('.last', r).className = 'last'; $('.last', r).textContent = b[7] === 2 ? 'Hoy, 10:41' : b[7] === 1 ? 'Sin aviso' : '—';
        $('.stc', r).innerHTML = b[7] === 1 ? '<span class="chip wait"><span class="d"></span>Por caducar</span>' : b[7] === 2 ? '<span class="chip live"><span class="d"></span>Renovado</span>' : '<span class="chip ok"><span class="d"></span>Activo</span>';
      });
      $('#bk-ren').textContent = '41'; $('#bk-ing').textContent = '12.430';
      after(400, () => cursorTo($('#bseg button[data-b="exp"]'), 650));
      after(1100, () => {
        click($('#bseg button[data-b="exp"]'));
        $$('#bseg button').forEach((b) => b.classList.toggle('on', b.dataset.b === 'exp'));
        $$('.tr[data-exp="0"]', s).forEach((r) => { r.classList.add('dim'); });
      });
      after(1450, () => $$('.tr[data-exp="0"]', s).forEach((r) => r.classList.add('gone')));
      after(1700, () => cursorTo($('#cb-all'), 550));
      after(2300, () => {
        click(); $('#cb-all').classList.add('on');
        $$('.tr[data-exp="1"]', s).forEach((r, i) => after(i * 70, () => { r.classList.add('sel'); $('.cb', r).classList.add('on'); }));
      });
      after(2900, () => $('#selbar').classList.add('on'));
      after(3200, () => cursorTo($('#sel-send'), 600));
      after(3850, () => {
        click($('#sel-send'));
        $$('.tr[data-exp="1"]', s).forEach((r, i) => after(120 + i * 150, () => { const l = $('.last', r); l.className = 'last sent'; l.innerHTML = `${ic('check2', 15, '', 2)}Enviado 11:30`; }));
      });
      after(5000, () => { $('#selbar').classList.remove('on'); toast({ icon: WA(26), bg: '#fff', t: '5 avisos enviados por WhatsApp', s: 'Cada uno con su enlace para renovar con Bizum o tarjeta' }, 3000); $('#cursor').classList.remove('on'); });
      after(5600, () => {
        const r = $('.tr[data-b="0"]', s); $('.stc', r).innerHTML = '<span class="chip live"><span class="d"></span>Renovado</span>';
        ring(r, 2, 10); count('#bk-ren', 41, 42, 600); count('#bk-ing', 12430, 12880, 800);
      });
    },
    // 8 · Cobro y factura
    () => {
      const s = show('cobros'); setClock(11 * 60 + 52);
      $$('.mth', s).forEach((m) => m.classList.remove('on'));
      const pb = $('#paybtn'); pb.className = 'paybtn'; $('#paytxt').innerHTML = 'Cobrar 58,00 €'; $('#payprog').style.transform = 'scaleX(0)';
      $('#payst').textContent = 'Elige cómo paga Raúl';
      $('#inv').classList.remove('on'); $('#stamp').classList.remove('on'); $('#inv-sent').classList.remove('on');
      $$('#paylist .pay.new').forEach((x) => x.remove());
      $('#cob-tot').textContent = '1.284,00 €'; $('#cob-n').textContent = '16 cobros'; $('#cob-biz').textContent = '437 €';
      after(400, () => cursorTo($('.mth[data-m="bizum"]'), 650));
      after(1100, () => {
        const m = $('.mth[data-m="bizum"]'); click(m); m.classList.add('on');
        $('#paytxt').innerHTML = 'Cobrar 58,00 € con Bizum'; $('#payst').textContent = 'Se envía la solicitud al móvil de Raúl';
      });
      after(1700, () => cursorTo(pb, 600));
      after(2350, () => {
        click(pb); pb.className = 'paybtn wait'; $('#paytxt').innerHTML = '<span class="spin"></span>Esperando a que Raúl acepte en su móvil…';
        $('#payst').textContent = 'Solicitud de Bizum enviada al 6•• ••• 731';
        tween(1300, (e) => { $('#payprog').style.transform = `scaleX(${e})`; }, E.l);
      });
      after(3700, () => {
        pb.className = 'paybtn paid'; $('#paytxt').innerHTML = `${ic('check', 20, '', 2.6)}Pagado · 58,00 € con ${ICO('bizum', 34, 24)}`;
        $('#payst').textContent = 'Cobrado a las 11:52 · sin datáfono ni efectivo';
        $('#paylist').insertAdjacentHTML('afterbegin', `<div class="pay new">${av('Raúl Martí', 36)}<div><b>Raúl Martí</b><span>Lumbalgia aguda</span></div><div class="am"><span class="amv">${ICO('bizum', 24, 17)}58,00 €</span><small>11:52</small></div></div>`);
        count('#cob-tot', 1284, 1342, 900, (v) => eur(v)); $('#cob-n').textContent = '17 cobros'; $('#cob-biz').textContent = '495 €';
        $('#cursor').classList.remove('on');
      });
      after(4100, () => $('#inv').classList.add('on'));
      after(5100, () => $('#stamp').classList.add('on'));
      after(5600, () => { $('#inv-sent').classList.add('on'); ring($('#inv'), 4, 18); });
    },
    // 9 · Informe del mes
    () => {
      show('informes'); setClock(11 * 60 + 55);
      count('#r-occ', 60, 95, 1400); count('#r-inc', 30000, 48920, 1600); count('#r-ses', 700, 1046, 1500);
      count('#r-ns', 7.8, 2.1, 1800, (v) => num(v, 1));
      count('#ai-h', 0, 31, 1400, (v) => num(Math.round(v)), 400); count('#ai-e', 0, 2480, 1600, (v) => num(Math.round(v)) + ' €', 400);
      count('#ai-r', 0, 1212, 1600, (v) => num(Math.round(v)), 400); count('#ai-t', 0, 38, 1400, (v) => Math.round(v) + ' h', 400);
      after(2600, () => ring($('#r-ns-chart'), 4, 18));
      after(4300, () => { unring(); cursorTo($('#rep-send'), 700); });
      after(5100, () => { click($('#rep-send')); toast({ icon: DOC('pdf', 26), bg: '#fff', t: 'Informe enviado a la gestoría', s: 'PDF de 6 páginas · noviembre de 2026' }, 3000); });
      after(5600, () => $('#cursor').classList.remove('on'));
    },
  ];

  let cur_i = -1, autoplay = MODE === 'auto', autoNext = 0;
  function go(i) {
    i = ((Math.round(+i) || 0) % STEPS.length + STEPS.length) % STEPS.length;
    kick(); clearStep();
    $('#toasts').innerHTML = ''; unring(); $('#cursor').classList.remove('on');
    cur_i = i;
    ENTER[i]();
    autoNext = vt + STEPS[i].ms;
    schedule();
  }

  /* ================= BUCLE DE LA TARJETA ================= */
  function cardToast(icon, bg, t, sub) {
    $('#c-ti').innerHTML = icon; $('#c-ti').style.background = bg; $('#c-tt').textContent = t; $('#c-ts').textContent = sub;
    $('#c-toast').classList.add('on');
  }
  function cardCycle() {
    const CYC = 14000;
    setClock(11 * 60 + 18); clk.rate = 16 / CYC;
    $('#c-slot') && $('#c-slot').remove();
    $('#c-hueco').classList.add('on');
    $('#c-citas').textContent = '38'; $('#c-occ').textContent = '94'; $('#c-cob').textContent = '1.284';
    $('#c-toast').classList.remove('on'); $('#c-pill').classList.remove('on');
    $('#ccw').classList.remove('dip');
    after(1200, () => { $('#c-psp').className = 'sp'; $('#c-psp').innerHTML = ic('spark', 28); $('#c-ptx').textContent = 'El asistente ofrece el hueco a la lista de espera…'; $('#c-pill').classList.add('on'); });
    after(3500, () => cardToast(WA(46), '#fff', 'Beatriz Ramos ha dicho que sí', '«Sí, resérvala. Llego a las 12:00»'));
    after(4500, () => {
      $('#c-hueco').classList.remove('on');
      $('#c-bea-slot').insertAdjacentHTML('afterend', `<div id="c-slot">${cardAp({ f: 'nuria', h: 720, d: 60, t: 'Diástasis', p: 'Beatriz Ramos', st: 'confirmed' }, 'drop')}</div>`);
      count('#c-citas', 38, 39, 700); count('#c-occ', 94, 95, 700);
      replay($('#ck1'), 'flash'); replay($('#ck2'), 'flash');
      $('#c-psp').className = 'sp ok'; $('#c-psp').innerHTML = ic('check', 28, '', 2.6); $('#c-ptx').textContent = 'Cita creada y sincronizada con Google Calendar';
    });
    after(6800, () => $('#c-toast').classList.remove('on'));
    after(7600, () => $('#c-pill').classList.remove('on'));
    after(8300, () => { cardToast(ICO('bizum', 60, 42), '#fff', 'Bizum recibido · 58,00 €', 'Raúl Martí · factura enviada por email'); count('#c-cob', 1284, 1342, 900); replay($('#ck3'), 'flash'); });
    after(11300, () => $('#c-toast').classList.remove('on'));
    after(13300, () => $('#ccw').classList.add('dip'));
    after(CYC, () => cardCycle());
  }

  /* ================= ARRANQUE ================= */
  let NOW = null, NOWL = null, lastNowY = -1;
  function tickAmbient() {
    const m = clinicMin();
    const t = hm2(m);
    if (MODE === 'card') {
      const el = $('#c-clock'); if (el && el.textContent !== t) el.textContent = t;
      const now = NOW || (NOW = $('#c-now')); if (now) { const y = Math.round(cy(m) * 2) / 2; if (y !== lastNowY) { lastNowY = y; now.style.transform = `translateY(${y}px)`; } }
      return;
    }
    const c = $('#clock'); if (c && c.textContent !== t) c.textContent = t;
    const now = NOW || (NOW = $('#now')); if (now) { const y = Math.round(yOf(m) * 2) / 2; if (y !== lastNowY) { lastNowY = y; now.style.transform = `translateY(${y}px)`; } const l = NOWL || (NOWL = $('#nowl')); if (l.textContent !== t) l.textContent = t; }
    if (autoplay && vt >= autoNext && cur_i >= 0) go(cur_i + 1);
  }

  function init() {
    buildShell();
    if (MODE === 'card') {
      document.documentElement.classList.add('mode-card'); stage.classList.add('mode-card');
      buildCard();
    } else {
      buildInicio(); buildAgenda(); buildPacientes(); buildMensajes(); buildBonos(); buildCobros(); buildInformes();
    }
    $('#now') && ($('#now').style.top = '0px');
    $('#c-now') && ($('#c-now').style.top = '0px');
    fit(); window.addEventListener('resize', fit);
    // descodifica caras, logos e iconos antes de que se vean, para que el primer cambio de pantalla no dé tirón
    document.querySelectorAll('img').forEach((im) => { if (im.decode) im.decode().catch(() => {}); });
    ambient.push(tickAmbient);
    if (MODE === 'card') { cardCycle(); schedule(); } else go(0);

    window.aldiaApp = {
      app: 'vela',
      steps: STEPS.map((s) => ({ title: s.title, text: s.text, ms: s.ms })),
      go: (i) => { if (MODE === 'card') return; autoplay = MODE === 'auto' ? autoplay : false; go(i); },
      pause: () => { kick(); paused = true; document.documentElement.classList.add('paused'); if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } if (toId) { clearTimeout(toId); toId = 0; } },
      resume: () => { if (!paused) return; paused = false; lastT = 0; document.documentElement.classList.remove('paused'); schedule(); },
      get current() { return cur_i; },
    };
    window.addEventListener('message', (e) => {
      const d = e.data || {}; if (d.type !== 'aldia-app') return;
      if (d.action === 'go') window.aldiaApp.go(d.i); else if (d.action === 'pause') window.aldiaApp.pause(); else if (d.action === 'resume') window.aldiaApp.resume();
    });
    try { (window.parent !== window ? window.parent : window).postMessage({ type: 'aldia-app-ready', app: 'vela' }, '*'); } catch (_) { /* sin padre */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
