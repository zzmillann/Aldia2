/* Grupo Brasa · motor: escala, pasos del recorrido, animaciones con rAF y contrato con el portfolio */
(() => {
'use strict';
const B = window.BRASA;
const { C, LOC, ic, nf, eur, clamp, ease, easeIO, prog, lerp, back } = B;
const V = B.V;
const Q = new URLSearchParams(location.search);
const MODE = ['card', 'tour'].includes(Q.get('mode')) ? Q.get('mode') : 'auto';
const _q = {};
const $ = (s, r) => (r ? r.querySelector(s) : (_q[s] && _q[s].isConnected ? _q[s] : (_q[s] = document.querySelector(s))));
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $('#stage');
document.documentElement.dataset.mode = MODE;

const S = { clock: 0, paused: false, cur: -1, stepStart: 0, view: null, prevView: null, switchAt: -1e9, anims: [], liveBase: 0, timeBase: 0, scale: 1,
  navFrom: 0, navTo: 0, navAt: -1e9, toastKey: null, feedK: null, feedAt: -1e9, heatP: 0, heatFrom: 0 };

/* ---------------- construcción ---------------- */
const NAV = [['g', 'Operación'], ['panel', 'panel', 'Panel del grupo'], ['sala', 'sala', 'Sala en vivo', '3', 'hot'], ['reservas', 'cal', 'Reservas', '126'],
  ['g', 'Cocina y compras'], ['stock', 'box', 'Stock', '8', 'hot'], ['compras', 'cart', 'Compras', '6'], ['escandallo', 'calc', 'Escandallos'],
  ['g', 'Equipo y negocio'], ['turnos', 'users', 'Cuadrante'], ['informes', 'doc', 'Informes']];
const VIEWS = ['panel', 'sala', 'reservas', 'stock', 'prevision', 'pedido', 'escandallo', 'turnos', 'informe'];

function shell() {
  return `<div id="app">
  <aside class="side">
    <div class="brand"><div class="logo">${ic('flame', 20, 1.8)}</div><div><div class="brand-n">Grupo Brasa</div><div class="brand-s">3 locales · Madrid</div></div></div>
    <nav class="nav"><div class="nav-pill" id="navPill"></div>
      ${NAV.map((n) => n[0] === 'g' ? `<div class="nav-g">${n[1]}</div>` : `<div class="ni" data-nav="${n[0]}">${ic(n[1], 18)}<span>${n[2]}</span>${n[3] ? `<em class="nb ${n[4] || ''}">${n[3]}</em>` : ''}</div>`).join('')}
    </nav>
    <div class="svc">
      <div class="svc-h"><i class="live"></i>Servicio de cena<span class="mono" id="svcT">21:05</span></div>
      ${LOC.map((l) => `<div class="svc-r"><span>${l.n}</span><div class="svc-b"><i style="width:${l.occ}%;background:${l.c}"></i></div><b class="mono">${l.occ} %</b></div>`).join('')}
    </div>
    <div class="me">${B.face(3, 32)}<div><b>Lucía Ferrer</b><span>Dirección de operaciones</span></div>${ic('dots', 16)}</div>
  </aside>
  <header class="top">
    <div class="crumb"><span>Grupo Brasa</span>${ic('chev', 14)}<b id="crumb">Panel del grupo</b></div>
    <div class="search">${ic('search', 16)}<span>Buscar plato, proveedor…</span><kbd>Ctrl K</kbd></div>
    <div class="sp"></div>
    <div class="seg" id="segLoc"><button data-l="todos">Todos</button>${LOC.map((l) => `<button data-l="${l.id}"><i style="background:${l.c}"></i>${l.n}</button>`).join('')}</div>
    <div class="clock"><span class="mono" id="clock">vie 27 nov · 21:05</span></div>
    <div class="bell">${ic('bell', 18)}<i></i></div>
    <button class="btn ink">${ic('plus', 16, 2)}Nueva reserva</button>
  </header>
  <main class="main">${VIEWS.map((v) => `<section class="view" id="v-${v}">${V[v]()}</section>`).join('')}</main>
  <div id="toastW"><div id="toast"></div></div>
  <div id="cursor"><svg width="26" height="30" viewBox="0 0 26 30"><path d="M2 2v22l6-5.5 4 9 4-1.8-4-8.7h8z" fill="#0E0E0E" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><i></i></div>
  </div>`;
}

if (MODE === 'card') stage.innerHTML = `<div id="card">${V.card()}</div>`;
else stage.innerHTML = shell();
const viewEls = Object.fromEntries(VIEWS.map((v) => [v, $('#v-' + v)]));

/* ---------------- pasos del recorrido ---------------- */
const STEPS = [
  { view: 'panel', nav: 'panel', crumb: 'Panel del grupo', loc: 'todos', ms: 6500,
    title: 'Panel del grupo', text: 'Las ventas de los tres locales, hora a hora, frente a la previsión del día.', frame: fPanel },
  { view: 'sala', nav: 'sala', crumb: 'Sala en vivo', loc: 'ch', ms: 6000, enter: () => { S.heatFrom = S.heatP; },
    title: 'Sala en vivo', text: 'El plano de Chamberí dice qué mesas están libres, comiendo o pidiendo la cuenta.', frame: fSala,
    toasts: [{ at: 3200, dur: 2300, img: B.payImg('Tarjeta', 20), t: 'Mesa 9 cobrada · 186,40 €', s: 'Tarjeta · propina 5,00 € · queda libre' }] },
  { view: 'sala', nav: 'sala', crumb: 'Sala en vivo', loc: 'ch', ms: 5500, reveal: '#spB',
    title: 'Mapa de calor', text: 'Cuánto deja cada mesa por cubierto en las últimas cuatro semanas.', frame: fHeat,
    cursor: [{ t: 700, sel: '#segCalor' }] },
  { view: 'reservas', nav: 'reservas', crumb: 'Reservas', loc: 'todos', ms: 6000,
    title: 'Reservas del finde', text: '126 reservas para el fin de semana y de dónde llega cada una.', frame: fRes, enter: resEnter,
    toasts: [{ at: 2800, dur: 2400, ic: 'fork', t: 'Nueva reserva desde TheFork', s: 'Marta Gil · 6 pers. · Malasaña · sábado 21:30' }] },
  { view: 'stock', nav: 'stock', crumb: 'Stock', loc: 'todos', ms: 5500,
    title: 'Stock bajo', text: 'Lo que falta para el sábado, local por local, antes de quedarse sin ello.', frame: fPress('#btnPrev', 4300),
    cursor: [{ t: 4300, sel: '#btnPrev' }] },
  { view: 'prevision', nav: 'compras', crumb: 'Previsión de compra', loc: 'todos', ms: 7000,
    title: 'Previsión de compra', text: 'Reservas más el consumo de los últimos sábados: así sale lo que hay que pedir.', frame: fPress('#btnRevisar', 5900),
    cursor: [{ t: 5900, sel: '#btnRevisar' }] },
  { view: 'pedido', nav: 'compras', crumb: 'Pedido PC-2611-084', loc: 'todos', ms: 7000,
    title: 'Pedido en un clic', text: 'El pedido sale por WhatsApp y correo, y el proveedor lo confirma.', frame: fPedido,
    cursor: [{ t: 1300, sel: '#btnEnviar' }],
    toasts: [{ at: 5000, dur: 1900, img: B.logo('whatsapp', 20), t: 'Carnes Ortiz ha confirmado el pedido', s: '' }] },
  { view: 'escandallo', nav: 'escandallo', crumb: 'Escandallos', loc: 'todos', ms: 6500,
    title: 'Escandallo y margen', text: 'El coste real de cada plato y lo que deja, con los precios de la última compra.', frame: fEsc,
    cursor: [{ t: 3700, sel: '#btnPulpo' }],
    toasts: [{ at: 4200, dur: 2100, ic: 'check', t: 'Precio cambiado en la carta y el TPV', s: 'Pulpo a la brasa · 25,50 € desde mañana' }] },
  { view: 'turnos', nav: 'turnos', crumb: 'Cuadrante · Chamberí', loc: 'ch', ms: 6000,
    title: 'Cuadrante del equipo', text: 'Turnos ajustados a las reservas, con el coste de personal siempre a la vista.', frame: fTurnos,
    cursor: [{ t: 3300, sel: '#btnRefuerzo' }],
    toasts: [{ at: 4200, dur: 1700, img: B.logo('whatsapp', 20), t: 'Cuadrante publicado', s: '13 personas avisadas por WhatsApp' }] },
  { view: 'informe', nav: 'informes', crumb: 'Informe semana 47', loc: 'todos', ms: 6000,
    title: 'Informe semanal', text: 'Cada lunes, ventas, food cost y merma en un informe para los socios.' }
];
const N = STEPS.length;


/* ---------------- escritura barata: solo se toca el DOM cuando el valor cambia ---------------- */
const sty = (el, k, v) => { if (!el) return; const c = el._st || (el._st = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
const setAttr = (el, k, v) => { if (!el) return; const c = el._at || (el._at = {}); if (c[k] !== v) { c[k] = v; el.setAttribute(k, v); } };
const setClass = (el, v) => { if (el && el._cl !== v) { el._cl = v; el.className = v; } };
const tog = (el, cls, on) => { if (el && el.classList.contains(cls) !== !!on) el.classList.toggle(cls, !!on); };
const vis = (el, on) => sty(el, 'visibility', on ? 'visible' : 'hidden');
const setText = (el, t) => { if (el && el._tx !== t) { el._tx = t; el.textContent = t; } };
const setHTML = (el, h) => { if (el && el._h !== h) { el._h = h; el.innerHTML = h; } };
const showAt = (el, st, t, dy = 8) => {
  if (!el) return; const p = ease(prog(st, t, 380));
  sty(el, 'display', st >= t ? '' : 'none');
  sty(el, 'opacity', p.toFixed(3)); sty(el, 'transform', p < 1 ? `translateY(${((1 - p) * dy).toFixed(1)}px)` : 'none');
};

/* ---------------- animaciones genéricas (solo transform y opacity) ---------------- */
const ANIM = '[data-in],[data-sy],[data-sx],[data-cw],[data-num],[data-arc],[data-pop]';
function collect(viewEl, roots) {
  return $$(ANIM, viewEl).map((el) => {
    const d = el.dataset; const a = { el, on: roots.some((r) => r.contains(el)), t: [] };
    a.layer = a.on && !(el instanceof SVGElement) && (d.in !== undefined || d.sx !== undefined);
    if (d.in !== undefined) a.t.push(['in', +d.in, 560]);
    if (d.sy !== undefined) a.t.push(['sy', +d.sy, 760]);
    if (d.sx !== undefined) a.t.push(['sx', +d.sx, 850]);
    if (d.cw !== undefined) a.t.push(['cw', +d.cw, +(d.dur || 1100)]);
    if (d.num !== undefined) a.t.push(['num', +(d.d || 0), 1100, +d.num, +(d.fmt || 0)]);
    if (d.arc !== undefined) a.t.push(['arc', +(d.d || 0), 950]);
    if (d.pop !== undefined) a.t.push(['pop', +d.pop, 520]);
    return a;
  });
}
function applyAnims(st) {
  for (const a of S.anims) {
    if (a.done) continue;
    let fin = true;
    for (const [k, d, dur, x, y] of a.t) {
      const raw = a.on ? prog(st, d, dur) : 1; if (raw < 1) fin = false;
      const el = a.el;
      if (k === 'in') { const p = ease(raw); sty(el, 'opacity', p < 1 ? p.toFixed(3) : ''); sty(el, 'transform', p < 1 ? `translateY(${((1 - p) * 12).toFixed(1)}px)` : ''); }
      else if (k === 'sy') sty(el, 'transform', `scaleY(${ease(raw).toFixed(4)})`);
      else if (k === 'sx') sty(el, 'transform', `scaleX(${ease(raw).toFixed(4)})`);
      else if (k === 'cw') setAttr(el, 'transform', `scale(${Math.max(0.0001, easeIO(raw)).toFixed(4)} 1)`); // en clipPath solo vale el atributo transform
      else if (k === 'num') { if (S.slow || raw >= 1) setText(el, nf(x * ease(raw), y)); }
      else if (k === 'arc') { const p = ease(raw); sty(el, 'opacity', p.toFixed(3)); sty(el, 'transform', `rotate(${(-90 - (1 - p) * 70).toFixed(2)}deg)`); }
      else if (k === 'pop') { sty(el, 'opacity', clamp(raw * 2.5).toFixed(3)); sty(el, 'transform', `scale(${back(raw).toFixed(3)})`); }
    }
    // capa propia solo mientras se mueve (los elementos HTML; en SVG no sirve)
    if (a.layer) sty(a.el, 'willChange', fin ? 'auto' : 'transform, opacity');
    if (fin) a.done = true;
  }
}

/* ---------------- navegación entre pasos ---------------- */
function go(i) {
  if (MODE === 'card') return;
  i = ((Math.round(i) % N) + N) % N;
  const step = STEPS[i];
  const changed = step.view !== S.view;
  if (changed) { S.prevView = S.view; S.view = step.view; S.switchAt = S.clock; }
  if (i === 0 || S.cur === -1) S.timeBase = S.clock;
  if (step.view === 'panel' && (S.clock - S.liveBase > 80000 || S.cur === -1)) { S.liveBase = S.clock; S.feedK = null; S.hbK = null; }
  const same = i === S.cur; S.cur = i; S.stepStart = S.clock; S.curPts = null; S.force = true;
  const vEl = viewEls[step.view];
  const roots = changed || same ? [vEl] : step.reveal ? $$(step.reveal, vEl) : [];
  S.anims = collect(vEl, roots);
  S.toastKey = null;
  if (step.enter) step.enter();
  setText($('#crumb'), step.crumb);
  $$('#segLoc button').forEach((b) => tog(b, 'on', b.dataset.l === step.loc));
  $$('.ni').forEach((n) => tog(n, 'on', n.dataset.nav === step.nav));
  const target = $(`.ni[data-nav="${step.nav}"]`);
  if (target) { if (target._top === undefined) $$('.ni').forEach((x) => { x._top = x.offsetTop; }); S.navFrom = currentPill(); S.navTo = target._top; S.navAt = S.clock; }
  frame();
}
function currentPill() { return lerp(S.navFrom, S.navTo, ease((S.clock - S.navAt) / 420)); }

/* ---------------- bucle: en pausa no hace trabajo ---------------- */
let last = performance.now(), lastTick = -1;
function loop(now) {
  const dt = Math.min(80, now - last); last = now;
  if (!S.paused) {
    S.clock += dt;
    if (MODE === 'auto' && S.cur >= 0 && S.clock - S.stepStart >= STEPS[S.cur].ms) go(S.cur + 1);
    else frame();
  }
  requestAnimationFrame(loop);
}
function frame() {
  const tick = Math.floor(S.clock / 100); S.slow = S.force || tick !== lastTick; lastTick = tick; S.force = false;
  if (MODE === 'card') return fCard();
  if (S.cur < 0) return;
  const step = STEPS[S.cur], st = S.clock - S.stepStart;
  // vistas: fundido corto; will-change solo mientras se mueven
  const tp = (S.clock - S.switchAt) / 520;
  for (const v of VIEWS) {
    const el = viewEls[v];
    if (v === S.view) { const p = ease(tp); vis(el, true); sty(el, 'opacity', p < 1 ? p.toFixed(3) : '1'); sty(el, 'transform', p < 1 ? `translateY(${((1 - p) * 14).toFixed(1)}px)` : 'none'); sty(el, 'willChange', p < 1 ? 'opacity, transform' : 'auto'); }
    else if (v === S.prevView && tp < 0.55) { const p = clamp(tp / 0.55); vis(el, true); sty(el, 'opacity', (1 - p).toFixed(3)); sty(el, 'transform', `translateY(${(-p * 8).toFixed(1)}px)`); sty(el, 'willChange', 'opacity, transform'); }
    else { vis(el, false); sty(el, 'willChange', 'auto'); }
  }
  sty($('#navPill'), 'transform', `translateY(${currentPill().toFixed(1)}px)`);
  if (S.slow) {
    const m = 5 + Math.floor((S.clock - S.timeBase) / 15000);
    const hh = 21 + Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
    setText($('#clock'), `vie 27 nov · ${hh}:${mm}`); setText($('#svcT'), `${hh}:${mm}`);
  }
  applyAnims(st);
  if (step.frame) step.frame(st);
  cursorFrame(step, st, tp >= 1);
  toastFrame(step, st);
}

/* ---------------- cursor y avisos ---------------- */
function posOf(sel, fx = 0.5, fy = 0.55) {
  const el = $(sel); if (!el) return { x: 800, y: 450 };
  const r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect();
  return { x: (r.left + r.width * fx - sr.left) / S.scale, y: (r.top + r.height * fy - sr.top) / S.scale };
}
function cursorFrame(step, st, settled) {
  const cur = $('#cursor'); const keys = step.cursor;
  if (!keys) { sty(cur, 'opacity', '0'); return; }
  // las posiciones se miden una sola vez por paso, cuando la vista ya está quieta
  if (!S.curPts) { if (!settled) { sty(cur, 'opacity', '0'); return; } S.curPts = keys.map((k) => ({ t: k.t, p: posOf(k.sel, k.fx ?? 0.42, k.fy ?? 0.6) })); }
  const pts = S.curPts;
  let pos = { x: pts[0].p.x + 170, y: pts[0].p.y + 150 };
  for (const k of pts) { const p = easeIO(prog(st, k.t - 780, 680)); pos = { x: lerp(pos.x, k.p.x, p), y: lerp(pos.y, k.p.y, p) }; }
  const t0 = pts[0].t - 1100, tEnd = pts[pts.length - 1].t + 1100;
  const op = Math.min(ease(prog(st, t0, 300)), 1 - ease(prog(st, tEnd, 350)));
  let press = 1, ring = 0;
  for (const k of pts) { const c = st - k.t; if (c >= 0 && c < 520) { ring = c / 520; press = c < 140 ? 0.86 : 1; } }
  sty(cur, 'opacity', op.toFixed(3));
  sty(cur, 'transform', `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) scale(${press})`);
  const rg = cur.querySelector('i');
  sty(rg, 'opacity', ring ? (1 - ring).toFixed(3) : '0'); sty(rg, 'transform', `translate(-50%,-50%) scale(${(0.3 + ring * 1.4).toFixed(3)})`);
}
function toastFrame(step, st) {
  const el = $('#toast'); const a = (step.toasts || []).find((t) => st >= t.at && st < t.at + t.dur);
  if (!a) { sty(el, 'opacity', '0'); sty(el, 'transform', 'translateY(-14px)'); return; }
  if (S.toastKey !== a.t) {
    S.toastKey = a.t;
    const sub = a.s || (step.view === 'pedido' ? `PC-2611-084 · ${eur(B.PED_TOTAL)} · entrega el sábado a las 8:30` : '');
    el.innerHTML = `<span class="to-i${a.img ? ' img' : ''}">${a.img || ic(a.ic, 17, 1.9)}</span><div><b>${a.t}</b><span>${sub}</span></div>`;
  }
  const pin = ease(prog(st, a.at, 380)), pout = ease(prog(st, a.at + a.dur - 320, 320));
  sty(el, 'opacity', (pin * (1 - pout)).toFixed(3));
  sty(el, 'transform', `translateY(${((1 - pin) * -14).toFixed(1)}px)`);
}
function press(sel, st, t) { tog($(sel), 'pressed', st >= t && st < t + 160); }
function fPress(sel, t) { return (st) => press(sel, st, t); }

/* ---------------- 1 · panel ---------------- */
const BASE = ['ch', 'ma', 're'].map((id) => B.HV[id].reduce((a, b) => a + b, 0));
const PREV_DONE = B.PREV.slice(0, 9).reduce((a, b) => a + b, 0);
function live(liveT) {
  const K = B.lastK(liveT); const sums = B.liveSums(K);
  const per = BASE.map((b, i) => b + sums.v[i]); const total = per[0] + per[1] + per[2];
  const prevNow = PREV_DONE + B.PREV[9] * 0.3 + sums.all / 1.06;
  return { K, sums, per, total, delta: (total / prevNow - 1) * 100 };
}
function stackBar(ids, vals, y, gap) { // ajusta la barra apilada solo cuando entra una venta
  let acc = 0;
  vals.forEach((v, j) => { const r = $(ids + j); setAttr(r, 'y', (y(acc + v) + (j ? gap : 0)).toFixed(1)); setAttr(r, 'height', Math.max(0, y(acc) - y(acc + v) - (j ? gap : 0)).toFixed(1)); acc += v; });
}
function fPanel(st) {
  const liveT = S.clock - S.liveBase;
  const L = live(liveT);
  // comandas en directo: se reconstruye la lista solo cuando entra una
  const feedIn = $('#feedIn');
  if (S.feedK !== L.K) {
    const first = S.feedK === null; S.feedK = L.K; S.feedAt = first ? -1e9 : S.clock;
    if (first || !feedIn.firstElementChild) { let h = ''; for (let k = L.K; k > L.K - 8; k--) h += V.feedRow(B.ticket(k)); feedIn.innerHTML = h; }
    else { feedIn.insertAdjacentHTML('afterbegin', V.feedRow(B.ticket(L.K))); feedIn.lastElementChild.remove(); const prev = feedIn.children[1]; if (prev) { prev._st = {}; prev.style.opacity = ''; prev.classList.remove('fresh'); } }
    S.agoEls = $$('.fr-ago', feedIn); S.agoEls.forEach((el) => { el._t = +el.dataset.t; });
    S.slow = true;
  }
  if (S.slow) { // contadores a 10 por segundo como mucho
    const intro = ease(prog(st, 150, 1300));
    const pax = Math.round(L.total / 39.18);
    setText($('#pVentas'), nf(L.total * intro));
    setText($('#pPax'), nf(pax * intro));
    setText($('#pTicket'), nf(L.total / pax, 2));
    setText($('#pDelta'), nf(L.delta, 1)); setText($('#pDeltaH'), nf(L.delta, 1));
    L.per.forEach((v, i) => setText($('#pL' + i), eur(v * intro, 0)));
    setText($('#pCount'), nf(Math.round((372 + L.K) * intro)));
    const pend = 3480 + L.sums.all * 0.55 - L.sums.cob * 0.35;
    setText($('#pPend'), eur(pend * intro, 0)); setText($('#pCob'), eur((L.total - pend) * intro, 0));
    if (S.agoEls) S.agoEls.forEach((el) => { const s = Math.max(0, Math.round((liveT - el._t) / 1000)); setText(el, s < 3 ? 'ahora' : s < 60 ? `hace ${s} s` : `hace ${Math.floor(s / 60)} min`); });
    const m = 5 + Math.floor((S.clock - S.timeBase) / 15000); setText($('#hNow'), `21:${String(m % 60).padStart(2, '0')}`);
  }
  if (S.hbK !== L.K) { S.hbK = L.K; stackBar('#hb', ['ch', 'ma', 're'].map((id, j) => B.HV[id][9] + L.sums.v[j]), B.hScale.y, 1); }
  const fp = ease((S.clock - S.feedAt) / 460);
  sty(feedIn, 'transform', fp < 1 ? `translateY(${(-(1 - fp) * 62).toFixed(1)}px)` : 'none');
  const firstRow = feedIn.firstElementChild; if (firstRow) { sty(firstRow, 'opacity', fp.toFixed(3)); tog(firstRow, 'fresh', S.clock - S.feedAt < 1600); }
}

/* ---------------- 2-3 · sala ---------------- */
const EV = [[900, 12, 'cue'], [2000, 6, 'ocu'], [3200, 9, 'lib'], [4300, 3, 'cue'], [5000, 14, 'ocu']];
function renderTables(st, all) {
  const cnt = { lib: 0, ocu: 0, pos: 0, cue: 0, res: 0 }; let pax = 0, nOcc = 0;
  for (const t of B.TABLES) {
    let [s, v] = B.T0[t.n]; let since = null;
    for (const [at, n, to] of EV) if (n === t.n && (all || st >= at)) { s = to; if (to === 'ocu' && B.T0[t.n][0] === 'lib') { since = at; v = 0; } if (to === 'lib') v = 0; }
    cnt[s]++;
    setAttr($('#tb' + t.n), 'class', `tg st-${s}`);
    let label = '';
    if (s === 'res') label = v;
    else if (s !== 'lib') { const mm = (since !== null ? Math.max(0, Math.floor((st - since) / 1500)) : v + Math.floor(st / 1500)); label = mm >= 60 ? `${Math.floor(mm / 60)}h${String(mm % 60).padStart(2, '0')}` : `${mm}′`; pax += Math.round(t.p * 0.9); nOcc++; }
    setText($('#tt' + t.n), label);
  }
  Object.keys(cnt).forEach((k) => setText($('#lc-' + k), String(cnt[k])));
  setText($('#sOcc'), `${nOcc}/${B.TABLES.length}`); setText($('#sPax'), String(pax));
}
(() => { const t = B.TABLES.find((x) => x.n === 12), r = $('#selRing'); if (r) { r.setAttribute('x', t.x - 90); r.setAttribute('y', t.y - 49); r.setAttribute('width', 180); r.setAttribute('height', 98); } })();
function heatApply(p, switched) {
  tog($('#plan'), 'heat', switched); tog($('.planc'), 'heatm', switched);
  const o = p.toFixed(3), io = (1 - p).toFixed(3);
  ['#heatL', '#heatV', '#heatKey', '#spB'].forEach((s) => sty($(s), 'opacity', o)); sty($('#spA'), 'opacity', io);
  tog($('#segEstado'), 'on', !switched); tog($('#segCalor'), 'on', switched);
  S.heatP = p;
}
function fSala(st) {
  if (S.slow) renderTables(st, false);
  const hp = S.heatFrom * (1 - ease(prog(st, 0, 450)));
  heatApply(hp, hp > 0.5);
  sty($('#selRing'), 'opacity', (1 - hp).toFixed(3));
  const cue = st >= 900;
  const chip = $('#m12chip'); setText(chip, cue ? 'Pide la cuenta' : 'Comiendo'); setClass(chip, 'chip ' + (cue ? 'crit' : 'dark'));
  if (S.slow) setText($('#m12t'), `1 h ${52 + Math.floor(st / 1500)} min`);
  tog($('#btnCobrar'), 'glow', cue);
  const a0 = $('#arr0'); tog(a0, 'done', st >= 2000); setText(a0.querySelector('.ar-s'), st >= 2000 ? 'Sentados' : 'Confirmada');
}
function fHeat(st) {
  if (S.slow) renderTables(6000, true);
  heatApply(ease(prog(st, 760, 900)), st >= 700);
  sty($('#selRing'), 'opacity', '0');
  press('#segCalor', st, 700);
}

/* ---------------- 4 · reservas ---------------- */
function resEnter() { const rl = $('#rlIn'); rl.innerHTML = B.RES_LIST.map((r) => V.resRow(r)).join(''); rl._st = {}; S.resNew = false; }
function fRes(st) {
  const EVT = 2800, done = st >= EVT;
  if (S.slow || done) { const n = done ? 126 : Math.round(125 * ease(prog(st, 150, 1300))); setText($('#rTotal'), String(n)); setText($('#rDon'), String(n)); }
  tog($('#rTotal'), 'flash', done && st < EVT + 1400);
  setText($('#rL1'), done ? '39' : '38'); setText($('#rc-fork'), done ? '39' : '38');
  if (done && !S.resNew) { S.resNew = true; $('#rlIn').insertAdjacentHTML('afterbegin', V.resRow(B.RES_NEW, 'new')); S.resNewEl = $('#rlIn').firstElementChild; }
  if (!done && S.resNew) resEnter();
  const p = done ? ease(prog(st, EVT, 500)) : 1;
  sty($('#rlIn'), 'transform', done && p < 1 ? `translateY(${(-(1 - p) * 64).toFixed(1)}px)` : 'none');
  if (S.resNew && S.resNewEl) { sty(S.resNewEl, 'opacity', p.toFixed(3)); tog(S.resNewEl, 'hl', st < EVT + 2600); }
}

/* ---------------- 7 · pedido ---------------- */
const PV = [['pv1', 3600, 'Confirmado'], ['pv2', 2600, 'Leído'], ['pv3', 5600, 'Confirmado'], ['pv4', 4200, 'Confirmado'], ['pv5', 3900, 'Leído']];
function fPedido(st) {
  setClass($('#btnEnviar'), 'btn ink lg ' + (st < 1300 ? 's-a' : st < 2000 ? 's-b' : 's-c') + (st >= 1300 && st < 1460 ? ' pressed' : ''));
  [[0, 0, '21:06'], [1, 2000, '21:07'], [2, 3000, '21:08'], [3, 4700, '21:09']].forEach(([i, t, h]) => {
    const on = st >= t, el = $('#tl' + i); tog(el, 'on', on); tog(el, 'pop', on && st < t + 600 && t > 0); setText($('#tlt' + i), on ? h : '—');
  });
  showAt($('#waOut'), st, 2000, 14);
  tog($('#waTicks'), 'read', st >= 3000);
  setText($('#waSt'), st < 2900 ? 'últ. vez hoy a las 20:41' : st >= 3300 && st < 4600 ? 'escribiendo…' : 'en línea');
  const ty = $('#waTyping'); if (st >= 4600) sty(ty, 'display', 'none'); else showAt(ty, st, 3300, 6);
  showAt($('#waIn'), st, 4600, 14); showAt($('#waSys'), st, 5200, 6);
  PV.forEach(([id, t, s]) => {
    const ps = $('#' + id + ' .pv-s'); const on = st >= t;
    setText(ps, on ? s : st >= 2000 ? 'Enviado' : 'Preparado'); setClass(ps, 'pv-s ' + (on ? (s === 'Confirmado' ? 'ok' : 'rd') : st >= 2000 ? 'sent' : ''));
  });
}

/* ---------------- 8 · escandallo ---------------- */
function fEsc(st) {
  press('#btnPulpo', st, 3700);
  const done = st >= 3700, b = $('#btnPulpo');
  setHTML(b, done ? `${ic('check', 14, 2.2)}Aplicado · 25,50 €` : 'Aplicar en la carta');
  tog(b, 'done', done);
  const p = ease(prog(st, 3800, 700)); const P = B.PULPO;
  sty($('#scGhost'), 'opacity', p.toFixed(3)); sty($('#scG'), 'transform', `translateY(${((P.y2 - P.y) * p).toFixed(1)}px)`);
}

/* ---------------- 9 · cuadrante ---------------- */
function fTurnos(st) {
  const T = 3300, done = st >= T;
  setClass($('#btnRefuerzo'), 'btn ' + (done ? 'ok s-c' : 'ink s-a') + (st >= T && st < T + 160 ? ' pressed' : ''));
  const p = ease(prog(st, T + 100, 450)), tr = $('#trExtra');
  sty(tr, 'opacity', p.toFixed(3)); sty(tr, 'transform', p < 1 ? `translateY(${((1 - p) * 10).toFixed(1)}px)` : 'none');
  sty($('#shExtra'), 'transform', `scaleX(${ease(prog(st, T + 300, 700)).toFixed(4)})`);
  const q = ease(prog(st, T + 400, 600));
  sty($('#stFix'), 'opacity', q.toFixed(3)); sty($('#needL'), 'opacity', (1 - q * 0.7).toFixed(3));
  setAttr($('#gapR'), 'fill', done ? C.oliva : C.bad);
  tog($('#tAlert'), 'solved', done);
  setHTML($('#alH'), done ? `${ic('check', 15, 2.2)}<b>Hueco cubierto: 5 camareros de 21 a 23 h</b>` : `${ic('alert', 15)}<b>De 21 a 23 h falta una persona en sala</b>`);
  setText($('#tHoras'), done ? '443 h' : '438 h'); setText($('#tCoste'), done ? '9.935 €' : '9.860 €'); setText($('#tPct'), done ? '27,8 %' : '27,6 %');
}

/* ---------------- tarjeta del portfolio ---------------- */
const CLOOP = 40000;
function fCard() {
  const t = S.clock % CLOOP, cyc = Math.floor(S.clock / CLOOP);
  sty($('#card'), 'opacity', Math.min(ease(prog(t, 0, 500)), 1 - ease(prog(t, CLOOP - 450, 450))).toFixed(3));
  const L = live(t + 2000);
  const intro = ease(prog(t, 100, 1400));
  if (S.slow) {
    setText($('#cdV'), nf(L.total * (0.82 + 0.18 * intro)));
    setText($('#cdD'), nf(L.delta, 1));
    const pax = Math.round(L.total / 39.18); setText($('#cdPax'), nf(pax)); setText($('#cdTm'), nf(L.total / pax, 2));
    const m = 5 + Math.floor(t / 10000), sec = Math.floor((t / 1000) * 6) % 60;
    setText($('#cdClock'), `21:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    L.per.forEach((v, i) => setText($('#cdL' + i), eur(v, 0)));
  }
  L.per.forEach((v, i) => sty($('#cdB' + i), 'transform', `scaleX(${((v / 8200) * intro).toFixed(4)})`));
  for (let i = 0; i < 9; i++) sty($('#cb' + i), 'transform', `scaleY(${ease(prog(t, 150 + i * 70, 700)).toFixed(4)})`);
  if (S.cbK !== L.K) { S.cbK = L.K; stackBar('#cbh', ['ch', 'ma', 're'].map((id, j) => B.HV[id][9] + L.sums.v[j]), B.cScale.y, 1.5); }
  sty($('#cbhG'), 'transform', `scaleY(${ease(prog(t, 800, 700)).toFixed(4)})`);
  setAttr($('#cPrevR'), 'transform', `scale(${Math.max(0.0001, easeIO(prog(t, 600, 1800))).toFixed(4)} 1)`);
  // tiques
  const inEl = $('#cdTkIn'); const key = cyc * 100000 + L.K;
  if (S.cardK !== key) {
    const first = S.cardK === undefined || Math.floor(S.cardK / 100000) !== cyc; S.cardK = key; S.cardAt = first ? -1e9 : S.clock;
    if (first || !inEl.firstElementChild) inEl.innerHTML = [0, 1, 2].map((j) => V.cardTk(B.ticket(L.K - j))).join('');
    else { inEl.insertAdjacentHTML('afterbegin', V.cardTk(B.ticket(L.K))); inEl.lastElementChild.remove(); const prev = inEl.children[1]; if (prev) { prev._st = {}; prev.style.opacity = ''; prev.classList.remove('fresh'); } }
  }
  const fp = ease((S.clock - S.cardAt) / 480);
  sty(inEl, 'transform', fp < 1 ? `translateY(${(-(1 - fp) * 104).toFixed(1)}px)` : 'none');
  const f0 = inEl.firstElementChild; if (f0) { sty(f0, 'opacity', fp.toFixed(3)); tog(f0, 'fresh', S.clock - S.cardAt < 1500); }
}

/* ---------------- escala y arranque ---------------- */
function fit() {
  const w = innerWidth, h = innerHeight;
  const s = MODE === 'card' ? Math.max(w / 1600, h / 900) : Math.min(w / 1600, h / 900);
  S.scale = s; S.curPts = null;
  stage.style.transform = `translate(${((w - 1600 * s) / 2).toFixed(2)}px, ${((h - 900 * s) / 2).toFixed(2)}px) scale(${s})`;
}
addEventListener('resize', fit); fit();

window.aldiaApp = {
  steps: STEPS.map(({ title, text, ms }) => ({ title, text, ms })),
  go: (i) => go(i),
  pause: () => { S.paused = true; document.documentElement.classList.add('paused'); },
  resume: () => { S.paused = false; last = performance.now(); document.documentElement.classList.remove('paused'); }
};
// solo para capturas: lleva la app a un paso y a un instante exacto
window.__seek = (i, ms) => { if (MODE === 'card') { S.clock = ms; S.cardK = undefined; S.cbK = null; S.force = true; frame(); return; } go(i); S.clock += ms; S.force = true; S.curPts = null; frame(); };

if (MODE !== 'card') go(0); else { S.force = true; frame(); }
requestAnimationFrame((n) => { last = n; requestAnimationFrame(loop); });

let sent = false;
const ready = () => { if (sent) return; sent = true; window.__ready = true; try { (window.parent || window).postMessage({ type: 'aldia-app-ready', app: 'brasa' }, '*'); } catch (e) { /* sin padre */ } };
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { fit(); ready(); });
setTimeout(ready, 2500);
})();
