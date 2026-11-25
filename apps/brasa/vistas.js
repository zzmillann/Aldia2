/* Grupo Brasa · plantillas de cada pantalla */
(() => {
'use strict';
const B = window.BRASA;
const { C, LOC, ic, dic, nf, eur } = B;
const V = (B.V = {});

/* ---------- piezas comunes ---------- */
const chip = (txt, cls = '') => `<span class="chip ${cls}">${txt}</span>`;
const locTag = (l) => `<span class="ltag"><i style="background:${LOC[l].c}"></i>${LOC[l].n}</span>`;
let uid = 0;
function spark(vals, color, w = 112, h = 40, delay = 300) {
  const id = 'sp' + (uid++);
  const mx = Math.max(...vals), mn = Math.min(...vals);
  const pts = vals.map((v, i) => [2 + i * (w - 8) / (vals.length - 1), h - 5 - (v - mn) / (mx - mn || 1) * (h - 12)]);
  const d = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  const last = pts[pts.length - 1];
  return `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".2"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>
  <clipPath id="${id}c"><rect data-cw="${delay}" data-w="${w}" width="${w}" height="${h}"/></clipPath></defs>
  <g clip-path="url(#${id}c)"><path d="${d} L${last[0]} ${h} L2 ${h} Z" fill="url(#${id}g)"/>
  <path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${last[0]}" cy="${last[1]}" r="3.2" fill="${C.card}" stroke="${color}" stroke-width="2"/></g>`;
}
B.spark = spark;
const ring = (pct, color, size = 58, sw = 6, delay = 300) => {
  const r = (size - sw) / 2;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${C.line2}" stroke-width="${sw}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" pathLength="100" stroke-dasharray="${pct} 100" data-arc="${pct}" data-d="${delay}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
};
const head = (eyebrow, title, sub, right = '') => `<div class="vh" data-in="0"><div><div class="eyebrow">${eyebrow}</div><h1 class="h1">${title}</h1>${sub ? `<p class="vsub">${sub}</p>` : ''}</div><div class="vh-r">${right}</div></div>`;

/* =========================================================
   1 · PANEL DEL GRUPO
   ========================================================= */
function hourChart() {
  const W = 852, H = 286, L = 50, R = 6, T = 16, Bm = 30, ih = H - T - Bm, max = 5000;
  const sw = (W - L - R) / 12, bw = 30;
  const y = (v) => T + ih * (1 - v / max);
  let s = `<svg id="hChart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  s += `<defs><pattern id="hatchP" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${C.card}"/><line x1="0" y1="0" x2="0" y2="6" stroke="${C.line}" stroke-width="2.2"/></pattern>
  <clipPath id="prevClip"><rect data-cw="500" data-w="${W}" data-dur="1500" width="${W}" height="${H}"/></clipPath></defs>`;
  for (let v = 0; v <= max; v += 1000) {
    s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.line2 : C.line}" stroke-width="1"/>`;
    s += `<text x="${L - 10}" y="${y(v) + 4}" text-anchor="end" class="ax">${v ? nf(v) : '0'}</text>`;
  }
  B.HOURS.forEach((h, i) => {
    const cx = L + sw * i + sw / 2, x = cx - bw / 2;
    if (i < 9) {
      let acc = 0; let g = `<g class="sy" data-sy="${80 + i * 55}">`;
      ['ch', 'ma', 're'].forEach((id, j) => {
        const v = B.HV[id][i]; const y0 = y(acc + v), hh = y(acc) - y(acc + v); acc += v;
        g += `<rect x="${x}" y="${y0 + (j ? 1 : 0)}" width="${bw}" height="${Math.max(0, hh - (j ? 1 : 0))}" rx="${j === 2 ? 4 : 1.5}" fill="${LOC[j].c}"/>`;
      });
      s += g + '</g>';
    } else if (i === 9) {
      s += `<rect x="${x - 3}" y="${y(B.PREV[i])}" width="${bw + 6}" height="${y(0) - y(B.PREV[i])}" rx="5" fill="url(#hatchP)" stroke="${C.line}" data-in="700"/>`;
      s += `<g class="sy" data-sy="${80 + i * 55}">` + ['ch', 'ma', 're'].map((id, j) => `<rect id="hb${j}" x="${x}" width="${bw}" rx="${j === 2 ? 4 : 1.5}" fill="${LOC[j].c}"/>`).join('') + '</g>';
      s += `<g data-in="900"><line x1="${cx}" x2="${cx}" y1="${T - 2}" y2="${y(0)}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="2 3"/>
      <rect x="${cx - 27}" y="${T - 14}" width="54" height="20" rx="10" fill="${C.ink}"/><text x="${cx}" y="${T}" text-anchor="middle" class="ax-now" id="hNow">21:05</text></g>`;
    } else {
      s += `<rect x="${x}" y="${y(B.PREV[i])}" width="${bw}" height="${y(0) - y(B.PREV[i])}" rx="4" fill="url(#hatchP)" stroke="${C.line}" data-in="${700 + i * 40}"/>`;
    }
    s += `<text x="${cx}" y="${H - 9}" text-anchor="middle" class="ax${i === 9 ? ' ax-b' : ''}">${h} h</text>`;
  });
  const pts = B.PREV.map((v, i) => `${(L + sw * i + sw / 2).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  s += `<g clip-path="url(#prevClip)"><polyline points="${pts}" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round"/>
  ${B.PREV.map((v, i) => `<circle cx="${(L + sw * i + sw / 2).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="${C.card}" stroke="${C.ink}" stroke-width="1.4"/>`).join('')}</g>`;
  s += '</svg>';
  B.hScale = { y, T, ih, max };
  return s;
}

V.panel = () => {
  const locCard = (l, i) => `
  <div class="card lc" data-in="${700 + i * 120}">
    <div class="lc-top"><div><div class="lc-n serif"><i style="background:${l.c}"></i>${l.n}</div><div class="lc-a">${l.dir}</div></div>
      <div class="lc-ring">${ring(l.occ, l.c, 60, 6, 800 + i * 120)}<b>${l.occ}<small>%</small></b></div></div>
    <div class="lc-g">
      <div><span>Ventas hoy</span><b class="mono" id="pL${i}">0 €</b></div>
      <div><span>Mesas</span><b class="mono">${l.mesas}</b></div>
      <div><span>Cocina</span><b class="mono">${[13, 16, 12][i]} min</b></div>
      <div><span>Espera</span><b class="mono">${['2 grupos', '1 grupo', '—'][i]}</b></div>
    </div>
    <div class="lc-f">${ic('tag', 14)}<span>Lo más pedido: <b>${['Chuletón ×21', 'Pulpo ×17', 'Chuletón ×16'][i]}</b></span></div>
  </div>`;
  return `
  <div class="vh" data-in="0">
    <div><div class="eyebrow">Viernes, 27 de noviembre · Servicio de cena</div>
    <h1 class="h1">Buenas noches, Lucía. Vamos <em>un <span id="pDeltaH">5,1</span> % por encima</em> de la previsión.</h1></div>
    <div class="vh-r"><div class="forecast"><span>Cierre previsto</span><b class="serif">28.340 €</b><small>${ic('sun', 13)} 14° · sin lluvia · 3 grupos grandes</small></div></div>
  </div>
  <div class="kpis">
    <div class="card kpi" data-in="120"><div class="kpi-l">${ic('euro', 15)}Ventas de hoy</div>
      <div class="kpi-v serif"><span id="pVentas">0</span><small> €</small></div>
      <div class="kpi-s"><span class="delta up">${ic('up', 11, 2)}<span id="pDelta">5,1</span> %</span> sobre la previsión</div>
      <svg class="kpi-sp" width="112" height="40">${spark([8, 11, 10, 13, 12, 15, 14, 17, 19], C.brasa, 112, 40, 400)}</svg></div>
    <div class="card kpi" data-in="200"><div class="kpi-l">${ic('users', 15)}Comensales</div>
      <div class="kpi-v serif"><span id="pPax">0</span></div>
      <div class="kpi-s">de <b>534</b> previstos para hoy</div>
      <svg class="kpi-sp" width="112" height="40">${spark([5, 7, 6, 9, 8, 11, 12, 12, 15], C.oliva, 112, 40, 480)}</svg></div>
    <div class="card kpi" data-in="280"><div class="kpi-l">${ic('card', 15)}Ticket medio</div>
      <div class="kpi-v serif"><span id="pTicket">0</span><small> €</small></div>
      <div class="kpi-s"><span class="delta up">${ic('up', 11, 2)}1,10 €</span> frente al viernes pasado</div>
      <svg class="kpi-sp" width="112" height="40">${spark([36, 37.2, 36.8, 38.1, 37.5, 38.4, 38.9, 38.6, 39.2], C.vio, 112, 40, 560)}</svg></div>
    <div class="card kpi" data-in="360"><div class="kpi-l">${ic('sala', 15)}Ocupación media</div>
      <div class="kpi-v serif"><span data-num="91" data-d="400">91</span><small> %</small></div>
      <div class="occ3">${LOC.map((l, i) => `<div><span>${l.n}</span><div class="occbar"><i data-sx="${500 + i * 90}" style="width:${l.occ}%;background:${l.c}"></i></div><b class="mono">${l.occ}</b></div>`).join('')}</div></div>
  </div>
  <div class="pgrid">
    <div class="pcol">
      <div class="card chartc" data-in="420">
        <div class="card-h"><div><div class="card-t">Ventas por hora</div><div class="card-s">Los tres locales · hoy frente a la previsión del día</div></div>
          <div class="legend">${LOC.map((l) => `<span><i style="background:${l.c}"></i>${l.n}</span>`).join('')}<span><i class="dash"></i>Previsión</span><span><i class="hatch"></i>Por venir</span></div></div>
        <div class="chart-wrap">${hourChart()}</div>
      </div>
      <div class="lcs">${LOC.map(locCard).join('')}</div>
    </div>
    <div class="card feed" data-in="520">
      <div class="card-h"><div><div class="card-t">Comandas y cobros</div><div class="card-s"><span id="pCount">0</span> movimientos hoy · los tres locales</div></div>${chip('<i class="live"></i>En directo', 'livechip')}</div>
      <div class="feed-l" id="feedL"><div class="feed-in" id="feedIn"></div></div>
      <div class="feed-f">
        <div><span>Cobrado</span><b class="mono" id="pCob">0 €</b></div>
        <div><span>Pendiente de cobro</span><b class="mono" id="pPend">0 €</b></div>
        <div><span>Mesas abiertas</span><b class="mono">41</b></div>
      </div>
    </div>
  </div>`;
};

V.feedRow = (tk, now) => {
  const l = LOC[tk.loc];
  if (tk.kind === 'comanda') {
    return `<div class="fr"><div class="fr-ic" style="background:${l.soft};color:${l.c}">${ic('receipt', 17)}</div>
    <div class="fr-m"><div class="fr-t">Mesa ${tk.mesa}<span class="fr-k">a cocina</span>${locTag(tk.loc)}</div><div class="fr-s">${tk.items.map((i) => `${i.q}× ${B.DISH[i.d].s}`).join(' · ')}</div></div>
    <div class="fr-r"><div class="fr-a mono">${eur(tk.amt)}</div><div class="fr-ago mono" data-t="${tk.t}"></div></div></div>`;
  }
  return `<div class="fr cobro"><div class="fr-ic pay">${B.payImg(tk.pay, 15)}</div>
  <div class="fr-m"><div class="fr-t">Mesa ${tk.mesa} cobrada${locTag(tk.loc)}</div><div class="fr-s">${tk.pax} comensales · ${tk.pay}${tk.tip ? ` · propina ${eur(tk.tip)}` : ''}</div></div>
  <div class="fr-r"><div class="fr-a mono">${eur(tk.amt)}</div><div class="fr-ago mono" data-t="${tk.t}"></div></div></div>`;
};

/* =========================================================
   2-3 · SALA EN VIVO Y MAPA DE CALOR
   ========================================================= */
function tableSVG(t) {
  let g = `<g class="tg st-lib" id="tb${t.n}" data-n="${t.n}">`;
  const ch = (x, y, w, h) => `<rect class="chair" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`;
  let ring = '';
  if (t.s === 'r') {
    g += ch(t.x - 11, t.y - 37, 22, 9) + ch(t.x - 11, t.y + 28, 22, 9);
    ring = `<circle class="pulse" cx="${t.x}" cy="${t.y}" r="25"/>`;
    g += ring + `<circle class="tb" cx="${t.x}" cy="${t.y}" r="24"/>`;
  } else if (t.s === 'q') {
    g += ch(t.x - 12, t.y - 41, 24, 9) + ch(t.x - 12, t.y + 32, 24, 9) + ch(t.x - 41, t.y - 12, 9, 24) + ch(t.x + 32, t.y - 12, 9, 24);
    g += `<rect class="pulse" x="${t.x - 29}" y="${t.y - 29}" width="58" height="58" rx="11"/><rect class="tb" x="${t.x - 29}" y="${t.y - 29}" width="58" height="58" rx="11"/>`;
  } else {
    const w = t.p === 8 ? 152 : 122, h = 54, n = t.p / 2;
    for (let i = 0; i < n; i++) { const cx = t.x - w / 2 + (w / n) * (i + 0.5); g += ch(cx - 11, t.y - h / 2 - 12, 22, 9) + ch(cx - 11, t.y + h / 2 + 3, 22, 9); }
    g += `<rect class="pulse" x="${t.x - w / 2}" y="${t.y - h / 2}" width="${w}" height="${h}" rx="12"/><rect class="tb" x="${t.x - w / 2}" y="${t.y - h / 2}" width="${w}" height="${h}" rx="12"/>`;
  }
  g += `<text class="tn" x="${t.x}" y="${t.y - 2}" text-anchor="middle">${t.n}</text><text class="tt" id="tt${t.n}" x="${t.x}" y="${t.y + 13}" text-anchor="middle"></text>`;
  return g + '</g>';
}
const heatColor = (v) => {
  const stops = [[25, [228, 236, 255]], [34, [157, 185, 255]], [43, [91, 140, 255]], [52, [36, 64, 170]]];
  for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) {
    const [a, ca] = stops[i - 1], [b, cb] = stops[i]; const t = (v - a) / (b - a);
    return `rgb(${ca.map((c, k) => Math.round(c + (cb[k] - c) * t)).join(',')})`;
  }
  return 'rgb(36,64,170)';
};
function planSVG() {
  let s = `<svg id="plan" viewBox="0 0 880 640" preserveAspectRatio="xMidYMid meet"><defs>`;
  B.TABLES.forEach((t) => { const c = heatColor(B.HEAT[t.n]); s += `<radialGradient id="hg${t.n}"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset=".55" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`; });
  s += `<pattern id="floor" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#FFFFFF"/><path d="M0 40V0h40" fill="none" stroke="#F3F4F6" stroke-width="1"/></pattern>
  <pattern id="terr" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#F9FAFB"/><line x1="0" y1="0" x2="0" y2="8" stroke="#F0F1F3" stroke-width="2"/></pattern></defs>`;
  s += `<rect x="20" y="20" width="840" height="600" rx="18" fill="url(#floor)" stroke="#D6D8DD" stroke-width="2"/>`;
  // zonas
  s += `<rect x="23" y="148" width="205" height="469" fill="url(#terr)"/><line x1="228" y1="150" x2="228" y2="616" stroke="#C3C7CE" stroke-width="1.5" stroke-dasharray="6 5"/>
  <text class="zl" x="40" y="172">TERRAZA ACRISTALADA</text>`;
  s += `<rect x="34" y="34" width="180" height="100" rx="10" fill="#F7F8FA" stroke="#E8E9EC"/><text class="zl" x="124" y="89" text-anchor="middle">ASEOS · ALMACÉN</text>`;
  s += `<rect x="250" y="34" width="300" height="48" rx="12" fill="#F0F1F3" stroke="#D6D8DD"/><text class="zl" x="400" y="63" text-anchor="middle">BARRA</text>`;
  for (let i = 0; i < 9; i++) s += `<circle cx="${270 + i * 32.5}" cy="100" r="8" fill="#F7F8FA" stroke="#D6D8DD"/>`;
  s += `<rect x="580" y="34" width="266" height="102" rx="12" fill="#2A2B2E"/>
  <rect x="604" y="52" width="122" height="46" rx="6" fill="#3A3C41"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${612 + i * 13}" y1="56" x2="${612 + i * 13}" y2="94" stroke="#55585E" stroke-width="1.5"/>`).join('')}
  <path d="M640 92c-3-6 2-10 5-14 1 4 4 5 5 8 2-3 2-6 1-9 5 4 7 10 4 15" fill="none" stroke="#8FB0FF" stroke-width="1.6" stroke-linecap="round"/>
  <text x="740" y="70" class="zl inv">COCINA VISTA</text><text x="740" y="86" class="zl inv dim">Parrilla de encina</text>
  <rect x="580" y="140" width="266" height="8" rx="4" fill="#D6D8DD"/>`;
  s += `<rect x="712" y="524" width="118" height="46" rx="10" fill="#F7F8FA" stroke="#E8E9EC"/><text class="zl" x="771" y="551" text-anchor="middle">RECEPCIÓN</text>
  <rect x="640" y="612" width="70" height="12" fill="#FFFFFF"/><path d="M640 618a34 34 0 0 1 34-34" fill="none" stroke="#C3C7CE" stroke-width="1.5" stroke-dasharray="3 3"/><text class="zl" x="675" y="606" text-anchor="middle">ENTRADA</text>`;
  s += `<g id="heatL">${B.TABLES.map((t) => `<circle cx="${t.x}" cy="${t.y}" r="${t.s === 'l' ? 105 : 78}" fill="url(#hg${t.n})"/>`).join('')}</g>`;
  s += `<rect id="selRing" x="0" y="0" width="0" height="0" rx="16" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  s += `<g id="tablesL">${B.TABLES.map(tableSVG).join('')}</g>`;
  s += `<g id="heatV">${B.TABLES.map((t) => `<g transform="translate(${t.x},${t.y + (t.s === 'l' ? 46 : t.s === 'q' ? 50 : 46)})"><rect x="-27" y="-11" width="54" height="20" rx="10" fill="${C.ink}"/><text class="hv" y="3.5" text-anchor="middle">${nf(B.HEAT[t.n], 1)} €</text></g>`).join('')}</g>`;
  return s + '</svg>';
}
V.sala = () => {
  const comanda = [
    ['chuleton', 2, 'Chuletón de vaca madurada 1 kg', 156], ['pulpo', 1, 'Pulpo a la brasa', 24.5], ['croqueta', 2, 'Croquetas de jamón', 19],
    ['pimiento', 2, 'Pimientos de padrón', 15.8], ['vino', 3, 'Rioja crianza', 72], ['tarta', 2, 'Tarta de queso', 15.6]
  ];
  const tot = comanda.reduce((a, c) => a + c[3], 0);
  const legend = [['lib', 'Libre'], ['ocu', 'Comiendo'], ['pos', 'Postre'], ['cue', 'Por cobrar'], ['res', 'Reservada']];
  const arr = [
    ['21:05', 'Familia Ortega', 4, 'globe', 'Mesa 6', 'arr0'], ['21:15', 'Andrés Pizarro', 4, 'phone', 'Mesa 5', 'arr1'],
    ['21:30', 'Carla Medina', 2, 'fork', 'Mesa 18 · aniversario', 'arr2'], ['21:45', 'Empresa Lumen', 8, 'globe', 'Mesa 12 al quedar libre', 'arr3']
  ];
  const zones = [['Junto a la parrilla', 49.3, 'Mesas 17 a 20'], ['Mesas largas', 45.5, 'Mesas 12 y 16'], ['Sala central', 39.9, 'Mesas 7 a 15 y 21'], ['Fondo', 36.6, 'Mesas 22 a 24'], ['Terraza', 27.6, 'Mesas 1 a 6']];
  return `
  ${head('Chamberí · Santa Engracia, 112', 'Sala en vivo', '', `<div class="statline"><div><span>Mesas ocupadas</span><b class="serif" id="sOcc">21/23</b></div><div><span>Comensales en sala</span><b class="serif" id="sPax">74</b></div><div><span>Tiempo medio en mesa</span><b class="serif" id="sTime">1 h 08</b></div></div>`)}
  <div class="sgrid">
    <div class="card planc" data-in="120">
      <div class="plan-h">
        <div class="legend lg2">${legend.map(([k, n]) => `<span class="lgi"><i class="sw sw-${k}"></i>${n}<b class="mono" id="lc-${k}">0</b></span>`).join('')}</div>
        <div class="seg sm" id="salaSeg"><button class="on" id="segEstado">${ic('grid', 14)}Estado</button><button id="segCalor">${ic('heat', 14)}Rentabilidad</button></div>
      </div>
      <div class="plan-w">${planSVG()}</div>
      <div class="heat-key" id="heatKey"><span>€ por cubierto · últimos 28 días</span><div class="hk-bar"></div><div class="hk-l mono"><span>25 €</span><span>38 €</span><span>52 €</span></div></div>
    </div>
    <div class="scol">
      <div class="spanel" id="spA">
        <div class="card mesa" data-in="260">
          <div class="mesa-h"><div><div class="eyebrow">Mesa seleccionada</div><div class="mesa-n serif">Mesa 12 <span>· 8 comensales</span></div></div><span class="chip" id="m12chip">Comiendo</span></div>
          <div class="mesa-meta"><span>${ic('clock', 14)}<b class="mono" id="m12t">1 h 52 min</b></span><span>${B.face(4, 20)}Diego · sala 2</span><span>${ic('flame', 14)}Punto: 2 al punto</span></div>
          <div class="mesa-l">${comanda.map(([d, q, n, p], i) => `<div class="ml" data-in="${380 + i * 70}"><span class="ml-q mono">${q}×</span><span class="ml-n">${n}</span><b class="mono">${eur(p)}</b></div>`).join('')}</div>
          <div class="mesa-f"><div><span>Total</span><b class="serif">${eur(tot)}</b><small>${eur(tot / 8)} por persona</small></div><div class="mesa-b"><button class="btn ghost">Dividir</button><button class="btn brasa" id="btnCobrar">${ic('card', 15)}Cobrar mesa</button></div></div>
        </div>
        <div class="card arr" data-in="380">
          <div class="card-h"><div class="card-t">Próximas llegadas</div><span class="card-s">${ic('wait', 13)} En espera: <b>2 grupos · 12 min</b></span></div>
          ${arr.map(([h, n, p, c, m, id]) => `<div class="ar" id="${id}"><span class="ar-h mono">${h}</span><span class="ar-c">${ic(c, 14)}</span><div class="ar-m"><b>${n}</b><span>${p} pers. · ${m}</span></div><span class="ar-s">Confirmada</span></div>`).join('')}
        </div>
      </div>
      <div class="spanel" id="spB">
        <div class="card zonas" data-in="850">
          <div class="card-h"><div><div class="card-t">Facturación por cubierto</div><div class="card-s">Por zona · últimos 28 días · media de la sala 40,20 €</div></div></div>
          ${zones.map(([n, v, sub], i) => `<div class="zr"><div class="zr-t"><b>${n}</b><span>${sub}</span></div><div class="zr-bar"><i data-sx="${1000 + i * 110}" style="width:${(v / 52) * 100}%;background:${heatColor(v)}"></i></div><b class="mono zr-v">${nf(v, 2)} €</b></div>`).join('')}
        </div>
        <div class="card insight" data-in="1250">
          <div class="ins-h">${ic('spark', 16)}<span>Lectura de la sala</span></div>
          <div class="ins-t serif">La terraza factura un <em>31 % menos</em> por cubierto que la sala.</div>
          <p>Rota más rápido (1,4 servicios por mesa frente a 1,1) pero pide menos vino y casi nunca chuletón. Las mesas junto a la parrilla son las que más dejan: 49,30 € por cubierto.</p>
          <div class="ins-k"><div><b class="serif">1,4×</b><span>rotación terraza</span></div><div><b class="serif">−42 %</b><span>vino por cubierto</span></div><div><b class="serif">2.180 €</b><span>al mes si se iguala</span></div></div>
          <div class="ins-p"><div><b>Propuesta</b><span>Carta corta de raciones para compartir y vino por copas en terraza los viernes y sábados.</span></div><button class="btn ink sm">Probar 4 semanas</button></div>
        </div>
      </div>
    </div>
  </div>`;
};

/* =========================================================
   4 · RESERVAS DEL FIN DE SEMANA
   ========================================================= */
function resChart() {
  const W = 596, H = 236, L = 34, R = 8, T = 18, Bm = 30, ih = H - T - Bm, max = 14;
  const y = (v) => T + ih * (1 - v / max);
  const n = B.RES_SLOTS.length, gap = 28, sw = (W - L - R - gap) / n, bw = 36;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  for (let v = 0; v <= max; v += 7) { s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.line2 : C.line}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}</text>`; }
  B.RES_SLOTS.forEach((sl, i) => {
    const cx = L + sw * i + sw / 2 + (i >= 4 ? gap : 0), x = cx - bw / 2;
    let acc = 0, g = `<g class="sy" data-sy="${200 + i * 70}">`;
    sl.v.forEach((v, j) => { if (!v) return; const y0 = y(acc + v), hh = y(acc) - y(acc + v); acc += v; g += `<rect x="${x}" y="${y0 + 1}" width="${bw}" height="${hh - 1}" rx="${2}" fill="${LOC[j].c}"/>`; });
    s += g + `</g><text x="${cx}" y="${y(acc) - 7}" text-anchor="middle" class="ax-v" data-in="${600 + i * 70}">${acc}</text>`;
    s += `<text x="${cx}" y="${H - 9}" text-anchor="middle" class="ax">${sl.h}</text>`;
  });
  const capY = y(10);
  s += `<g data-in="1300"><line x1="${L}" x2="${W - R}" y1="${capY}" y2="${capY}" stroke="${C.bad}" stroke-width="1.2" stroke-dasharray="4 4"/><rect x="${W - R - 150}" y="${capY - 22}" width="150" height="18" rx="9" fill="${C.badSoft}"/><text x="${W - R - 75}" y="${capY - 9}" text-anchor="middle" class="ax-cap">Cocina: 10 por franja</text></g>`;
  const mid = L + sw * 4 + gap / 2;
  s += `<text x="${L + sw * 2}" y="${T - 4}" text-anchor="middle" class="ax-g">COMIDA</text><text x="${mid + gap / 2 + sw * 2}" y="${T - 4}" text-anchor="middle" class="ax-g">CENA</text>`;
  return s + '</svg>';
}
function donut() {
  const tot = B.CHANNELS.reduce((a, c) => a + c.v, 0); let off = 0;
  let s = `<svg width="176" height="176" viewBox="0 0 176 176"><circle cx="88" cy="88" r="70" fill="none" stroke="${C.line2}" stroke-width="22"/>`;
  B.CHANNELS.forEach((c, i) => {
    const len = (c.v / tot) * 100 - 0.8;
    s += `<circle cx="88" cy="88" r="70" fill="none" stroke="${c.c}" stroke-width="22" pathLength="100" stroke-dasharray="${len} 100" stroke-dashoffset="${-off}" data-arc="${len}" data-d="${300 + i * 220}" transform="rotate(-90 88 88)"/>`;
    off += (c.v / tot) * 100;
  });
  return s + `</svg>`;
}
V.resRow = (r, cls = '') => `<div class="rr ${cls}"><span class="rr-c ch-${r.ch}">${r.ch === 'google' ? B.logo('googlemaps', 16) : ic(B.CHANNELS.find((c) => c.id === r.ch).ic, 15)}</span>
  <div class="rr-m"><div class="rr-t"><b>${r.n}</b>${r.note ? `<span class="note">${r.note}</span>` : ''}</div><div class="rr-s">${r.p} pers. · ${LOC[r.l].n} · ${r.d}</div></div>
  <div class="rr-r"><span class="mono">${r.ago}</span><span class="rr-st">${ic('check', 12, 2)}Confirmada</span></div></div>`;
V.reservas = () => `
  ${head('Viernes 27 – domingo 29 de noviembre', 'Reservas del fin de semana', '', `<div class="statline"><div><span>Cubiertos reservados</span><b class="serif"><span data-num="438" data-d="300">438</span></b></div><div><span>Confirmadas por SMS</span><b class="serif"><span data-num="92" data-d="380">92</span> %</b></div><div><span>No-shows previstos</span><b class="serif">4 <small>(3,1 %)</small></b></div></div>`)}
  <div class="rgrid">
    <div class="rcol">
      <div class="card rbig" data-in="120">
        <div class="rbig-n"><div class="eyebrow">Reservas</div><div class="rbig-v serif" id="rTotal">125</div><div class="rbig-s"><span class="delta up">${ic('up', 11, 2)}22 %</span> frente al finde pasado</div>
          <div class="rbig-l">${LOC.map((l, i) => `<div><i style="background:${l.c}"></i>${l.n}<b class="mono" id="rL${i}">${[47, 39, 40][i]}</b></div>`).join('')}</div></div>
        <div class="rbig-c"><div class="card-h0"><div><div class="card-t">Sábado 28 · reservas por franja</div><div class="card-s">Mesas reservadas a cada hora en los tres locales</div></div>
          <div class="warnchip" data-in="1500">${ic('alert', 13)}13:30 pasa del ritmo de cocina</div></div>${resChart()}</div>
      </div>
      <div class="rbot">
        <div class="card canal" data-in="240">
          <div class="card-h"><div><div class="card-t">De dónde vienen</div><div class="card-s">Canal de cada reserva del finde</div></div></div>
          <div class="canal-b"><div class="donut">${donut()}<div class="donut-c"><b class="serif" id="rDon">125</b><span>reservas</span></div></div>
          <div class="canal-l">${B.CHANNELS.map((c, i) => `<div class="cl" data-in="${400 + i * 120}"><span class="cl-i" style="color:${c.c};background:${c.c}1f">${c.id === 'google' ? B.logo('googlemaps', 15) : ic(c.ic, 14)}</span><div><b>${c.n}</b><span>${c.note}</span></div><b class="mono" id="rc-${c.id}">${c.v}</b><span class="mono cl-p">${Math.round((c.v / 126) * 100)} %</span></div>`).join('')}</div></div>
          <div class="cfoot" data-in="900">${ic('up', 14, 2)}<span>La web propia sube <b>9 puntos</b> desde que el botón de reservar está en Google y en Instagram.</span></div>
        </div>
        <div class="card dias" data-in="320">
          <div class="card-h"><div><div class="card-t">Por día y local</div><div class="card-s">Reservas y ocupación prevista de la sala</div></div></div>
          <div class="dg"><div class="dg-h"><span></span>${LOC.map((l) => `<span><i style="background:${l.c}"></i>${l.n}</span>`).join('')}</div>
          ${B.RES_DAYS.map((d, r) => `<div class="dg-r"><div class="dg-d"><b>${d.d}</b><span>${d.sub}</span></div>${d.v.map((v, j) => `<div class="dg-c" data-in="${450 + r * 120 + j * 50}" style="background:${LOC[j].c}${Math.round(8 + d.occ[j] * 0.42).toString(16).padStart(2, '0')}"><b class="serif">${v}</b><span class="mono">${d.occ[j]} %</span></div>`).join('')}</div>`).join('')}</div>
          <div class="cfoot" data-in="1000">${ic('wait', 14)}<span>Sábado noche lleno en Chamberí: <b>4 grupos en lista de espera</b> avisados si se libera mesa.</span></div>
        </div>
      </div>
    </div>
    <div class="card rlist" data-in="200">
      <div class="card-h"><div><div class="card-t">Últimas reservas</div><div class="card-s">Entran solas desde la web, TheFork, Google y el teléfono</div></div></div>
      <div class="rl-w"><div class="rl-in" id="rlIn">${B.RES_LIST.map((r) => V.resRow(r)).join('')}</div></div>
    </div>
  </div>`;

/* =========================================================
   5 · STOCK
   ========================================================= */
const ratioState = (r) => (r < 0.5 ? 'crit' : r < 0.9 ? 'low' : 'ok');
V.stock = () => {
  const per = LOC.map((l, j) => { let c = 0, b = 0; B.STOCK.forEach((s) => { const st = ratioState(s.v[j] / s.need[j]); if (st === 'crit') c++; else if (st === 'low') b++; }); return { c, b }; });
  const val = [4820, 3910, 5140];
  const row = (s, i) => {
    const tot = s.v.reduce((a, b) => a + b, 0), need = s.need.reduce((a, b) => a + b, 0), st = ratioState(tot / need);
    return `<div class="sr ${st}" data-in="${300 + i * 70}">
      <div class="sr-p"><span class="sr-ic">${dic(s.d, 18, 1.5)}</span><div><b>${s.n}</b><span class="pvn">${B.plogo(s.prov, 13)}${s.prov}</span></div></div>
      ${s.v.map((v, j) => { const r = v / s.need[j], cs = ratioState(r); return `<div class="sr-l"><div class="sr-q"><b class="mono">${nf(v, s.dec)}</b><span>/ ${nf(s.need[j], s.dec)} ${s.u}</span></div><div class="lvl"><i class="${cs}" data-sx="${450 + i * 70 + j * 60}" style="width:${Math.min(100, r * 100)}%"></i></div></div>`; }).join('')}
      <div class="sr-n mono">${nf(need, s.dec)} ${s.u}</div>
      <div class="sr-c mono">${s.cubre}</div>
      <div class="sr-s">${st === 'crit' ? chip('Crítico', 'crit') : st === 'low' ? chip('Bajo', 'warn') : chip('Suficiente', 'ok')}</div>
    </div>`;
  };
  return `
  ${head('Para el viernes, sábado y domingo · actualizado a las 21:04', 'Stock para el fin de semana', 'Lo que queda en cada cocina frente a lo que se va a necesitar con las reservas y el consumo de los últimos sábados.', `<div class="statline"><div><span>Bajo mínimo</span><b class="serif" style="color:${C.bad}">8</b></div><div><span>Se acaban el sábado</span><b class="serif">6</b></div><div><span>Valor en cámara</span><b class="serif">13.870 €</b></div></div>`)}
  <div class="lstrip">${LOC.map((l, j) => `<div class="card ls" data-in="${120 + j * 80}"><div class="ls-n"><i style="background:${l.c}"></i><b>${l.n}</b></div>
    <div class="ls-k"><div><b class="serif" style="color:${C.bad}">${per[j].c}</b><span>críticos</span></div><div><b class="serif" style="color:${C.ambar}">${per[j].b}</b><span>bajos</span></div><div><b class="serif">${nf(val[j])} €</b><span>en cámara</span></div></div>
    <div class="ls-f">${ic('truck', 14)}Última entrega: ${['hoy 9:10', 'hoy 9:40', 'ayer 18:20'][j]}</div></div>`).join('')}</div>
  <div class="card stab" data-in="300">
    <div class="sr sh"><div>Producto</div>${LOC.map((l) => `<div><i style="background:${l.c}"></i>${l.n}</div>`).join('')}<div>Necesario finde</div><div>Se acaba</div><div>Estado</div></div>
    ${B.STOCK.map(row).join('')}
    <div class="stab-f"><span>${ic('spark', 15)}Brasa ya ha calculado cuánto pedir de cada producto a cada proveedor.</span><button class="btn ink" id="btnPrev">Ver previsión de compra ${ic('arrowR', 15)}</button></div>
  </div>`;
};

/* =========================================================
   6 · PREVISIÓN DE COMPRA
   ========================================================= */
function satChart() {
  const data = [['31 oct', 47.8, 281], ['7 nov', 51.2, 300], ['14 nov', 49.5, 289], ['21 nov', 55.1, 322], ['28 nov', 52.4, 308]];
  const W = 470, H = 300, L = 36, R = 6, T = 26, Bm = 50, ih = H - T - Bm, max = 60;
  const y = (v) => T + ih * (1 - v / max); const sw = (W - L - R) / data.length, bw = 50;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><pattern id="hatchB" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${C.brasaSoft}"/><line x1="0" y1="0" x2="0" y2="7" stroke="${C.brasa}" stroke-width="2.4"/></pattern></defs>`;
  for (let v = 0; v <= max; v += 20) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.line2 : C.line}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}</text>`;
  const avgY = y(50.9);
  data.forEach(([d, v, cub], i) => {
    const cx = L + sw * i + sw / 2, last = i === 4;
    s += `<rect class="sy" data-sy="${300 + i * 120}" x="${cx - bw / 2}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" rx="6" fill="${last ? 'url(#hatchB)' : C.acc}" ${last ? `stroke="${C.brasa}" stroke-width="1.5"` : ''} opacity="${last ? 1 : 0.86}"/>`;
    s += last ? `<rect x="${cx - 24}" y="${y(v) - 30}" width="48" height="20" rx="10" fill="${C.brasa}" data-in="${900 + i * 120}"/><text x="${cx}" y="${y(v) - 16}" text-anchor="middle" class="ax-in" data-in="${900 + i * 120}">${nf(v, 1)}</text>`
      : `<text x="${cx}" y="${y(v) + 20}" text-anchor="middle" class="ax-in" data-in="${700 + i * 120}" dy="16">${nf(v, 1)}</text>`;
    s += `<text x="${cx}" y="${H - 28}" text-anchor="middle" class="ax${last ? ' ax-b' : ''}">${d}</text><text x="${cx}" y="${H - 12}" text-anchor="middle" class="ax dim">${cub} cub.</text>`;
  });
  s += `<g data-in="1200"><line x1="${L}" x2="${W - R}" y1="${avgY}" y2="${avgY}" stroke="${C.oliva}" stroke-width="1.6" stroke-dasharray="5 4"/></g>`;
  return s + '</svg>';
}
V.prevision = () => {
  const tile = (d, big, lbl, sub, cls = '') => `<div class="ft ${cls}" data-in="${d}"><div class="ft-v serif">${big}</div><div class="ft-l">${lbl}</div><div class="ft-s">${sub}</div></div>`;
  const op = (d, o) => `<div class="fo serif" data-in="${d}">${o}</div>`;
  const tot = B.PROPUESTA.reduce((a, p) => a + p.q * p.pr, 0);
  return `
  ${head('Sábado 28 de noviembre · los tres locales', 'Previsión de compra', 'Brasa cruza las reservas con lo que se consumió los últimos sábados y lo compara con lo que queda en cámara.', `<div class="statline"><div><span>Acierto del último mes</span><b class="serif" style="color:${C.oliva}">94 %</b></div><div><span>Proveedores</span><b class="serif">6</b></div><div><span>Importe total</span><b class="serif">${eur(tot, 0)}</b></div></div>`)}
  <div class="card formula" data-in="100">
    <div class="card-h"><div class="fh"><span class="fh-i">${ic('calc', 17)}</span><div><div class="card-t">Cómo se calcula · Chuletón de vaca madurada</div><div class="card-s">El mismo cálculo se hace con cada producto de la carta y su escandallo</div></div></div><span class="who">${B.face(8, 22)}Revisado por Rubén, jefe de parrilla ${ic('check', 13, 2)}</span></div>
    <div class="frow">
      ${tile(250, '308', 'cubiertos el sábado', '212 con reserva + 96 sin reserva (media de los últimos sábados)')}
      ${op(800, '×')}
      ${tile(950, '0,17 kg', 'de chuletón por cubierto', 'Consumo medio de los últimos 4 sábados')}
      ${op(1500, '+')}
      ${tile(1650, '10 %', 'de margen de seguridad', 'Para no quedarse corto si el día sale fuerte')}
      ${op(2200, '−')}
      ${tile(2350, '19,7 kg', 'en cámara ahora', 'Chamberí 6,5 · Malasaña 4,0 · Retiro 9,2')}
      ${op(2900, '=')}
      ${tile(3050, '<span data-num="38.4" data-d="3050" data-fmt="1">38,4</span> kg', 'a pedir', '32 piezas de 1,2 kg a Carnes Ortiz', 'res')}
    </div>
  </div>
  <div class="pvgrid">
    <div class="card satc" data-in="260">
      <div class="card-h"><div><div class="card-t">Chuletón: kilos vendidos los sábados</div><div class="card-s">El de mañana, rayado, es la previsión</div></div><div class="legend"><span><i class="dash ol"></i>Media: 50,9 kg</span></div></div>
      <div class="chart-wrap">${satChart()}</div>
    </div>
    <div class="card prop" data-in="360">
      <div class="card-h"><div><div class="card-t">Propuesta de pedido para el sábado</div><div class="card-s">9 productos · 6 proveedores · entrega mañana por la mañana</div></div></div>
      <div class="pt pth"><span>Producto</span><span>Cantidad</span><span>Precio</span><span>Proveedor</span><span>Importe</span></div>
      ${B.PROPUESTA.map((p, i) => `<div class="pt" data-in="${1200 + i * 90}"><span class="pt-p"><span class="pi">${dic(p.d, 15, 1.5)}</span>${p.n}</span><span class="mono">${nf(p.q, p.u === 'kg' ? 1 : 0)} ${p.u}</span><span class="mono dim">${eur(p.pr)}</span><span class="pt-v">${B.plogo(p.prov, 16)}${p.prov}</span><b class="mono">${eur(p.q * p.pr)}</b></div>`).join('')}
      <div class="prop-f"><div><span>Total sin IVA</span><b class="serif">${eur(tot)}</b></div><button class="btn brasa" id="btnRevisar">${ic('send', 15)}Revisar y enviar los 6 pedidos</button></div>
    </div>
  </div>`;
};

/* =========================================================
   7 · PEDIDO AL PROVEEDOR
   ========================================================= */
V.pedido = () => {
  const sub = B.PEDIDO.reduce((a, p) => a + p.q * p.pr, 0), iva = sub * 0.1;
  B.PED_TOTAL = sub + iva;
  const provs = [['Pescados Rías Baixas', 'mail', 'Correo', 294.5, 'pv1'], ['Carbones La Encina', 'chat', 'WhatsApp', 116, 'pv2'], ['Vinos Laguardia', 'mail', 'Correo', 237.6, 'pv3'], ['Lácteos Campoazul', 'chat', 'WhatsApp', 62.1, 'pv4'], ['Huerta de Aranjuez', 'mail', 'Correo', 22.4, 'pv5']];
  return `
  ${head('Pedido PC-2611-084 · creado desde la previsión', 'Pedido a Carnes Ortiz', '', `<div class="tline" id="tline">${['Borrador', 'Enviado', 'Leído', 'Confirmado'].map((s, i) => `<div class="tl ${i === 0 ? 'on' : ''}" id="tl${i}"><i>${ic('check', 11, 2.4)}</i><b>${s}</b><span class="mono" id="tlt${i}">${i === 0 ? '21:06' : '—'}</span></div>`).join('<em></em>')}</div>`)}
  <div class="pdgrid">
    <div class="card doc" data-in="100">
      <div class="doc-h">
        <div class="doc-from"><div class="logo sm">${ic('flame', 16)}</div><div><b>Grupo Brasa Restauración S.L.</b><span>Compras · Lucía Ferrer</span></div></div>
        <div class="doc-no"><span class="eyebrow">Pedido</span><b class="mono">PC-2611-084</b><span>27/11/2026 · 21:06</span></div>
      </div>
      <div class="doc-to">
        <div><span class="eyebrow">Proveedor</span><b class="pvb">${B.plogo('Carnes Ortiz', 20)}Carnes Ortiz S.L.</b><span>Mercamadrid · nave C-14 · Andrés Ortiz</span></div>
        <div><span class="eyebrow">Entrega · sábado 28</span><div class="deliv">${LOC.map((l, i) => `<span><i style="background:${l.c}"></i>${l.n} <b class="mono">${['8:30', '9:00', '9:15'][i]}</b></span>`).join('')}</div></div>
      </div>
      <div class="dl dlh"><span>Producto</span><span>Reparto Ch · Ma · Re</span><span>Cantidad</span><span>Precio</span><span>Importe</span></div>
      ${B.PEDIDO.map((p, i) => `<div class="dl" data-in="${300 + i * 90}"><span class="dl-p"><i>${dic(p.d, 17, 1.5)}</i><span><b>${p.n}</b><small>${p.sub}</small></span></span><span class="mono dim">${p.rep.map((r) => nf(r, 1)).join(' · ')}</span><span class="mono">${nf(p.q, 1)} ${p.u}</span><span class="mono dim">${eur(p.pr)}</span><b class="mono">${eur(p.q * p.pr)}</b></div>`).join('')}
      <div class="doc-t"><div class="doc-note">${ic('spark', 14)}Cantidades de la previsión del sábado. Precio pactado de noviembre; el chuletón sube un 2,3 % frente a octubre.</div>
        <div class="doc-sum"><div><span>Base imponible</span><b class="mono">${eur(sub)}</b></div><div><span>IVA 10 %</span><b class="mono">${eur(iva)}</b></div><div class="tot"><span>Total</span><b class="serif">${eur(sub + iva)}</b></div></div></div>
      <div class="doc-a"><div class="doc-ch"><span class="chk on">${ic('check', 11, 2.4)}</span>${B.logo('whatsapp', 14)}WhatsApp de Andrés<span class="chk on">${ic('check', 11, 2.4)}</span>${B.logo('gmail', 14)}Correo de pedidos<span class="chk">${ic('check', 11, 2.4)}</span>Copia a cada cocina</div>
        <button class="btn ink lg" id="btnEnviar"><span class="bt-a">${ic('send', 16)}Enviar pedido</span><span class="bt-b"><i class="spin"></i>Enviando…</span><span class="bt-c">${ic('check', 16, 2.2)}Enviado a las 21:07</span></button></div>
    </div>
    <div class="pdcol">
      <div class="card wa" data-in="200">
        <div class="wa-h">${B.face(7, 34)}<div><b>Andrés · Carnes Ortiz</b><span id="waSt">últ. vez hoy a las 20:41</span></div><span class="wa-ch">${B.logo('whatsapp', 13)}WhatsApp</span></div>
        <div class="wa-b" id="waB">
          <div class="wa-day">Hoy</div>
          <div class="msg in old"><p>Mañana tengo vaca rubia gallega de 45 días, por si queréis subir el chuletón.</p><span class="mono">19:12</span></div>
          <div class="msg out" id="waOut"><div class="att">${B.file('pdf', 30)}<div><b>PC-2611-084.pdf</b><span>2 páginas · ${eur(sub + iva)}</span></div></div><p>Hola Andrés, te paso el pedido del sábado para los tres locales. Gracias.</p><span class="mono">21:07 <i class="ticks" id="waTicks">${ic('check2', 15, 1.8)}</i></span></div>
          <div class="msg in typing" id="waTyping"><i></i><i></i><i></i></div>
          <div class="msg in" id="waIn"><p>Hola Lucía, confirmado todo. Mañana a las 8:30 en Chamberí y a partir de las 9 en Malasaña y Retiro. El chuletón va de la rubia gallega</p><span class="mono">21:09</span></div>
          <div class="wa-sys" id="waSys">${ic('check', 12, 2.2)}Brasa ha marcado el pedido como confirmado</div>
        </div>
      </div>
      <div class="card provs" data-in="320">
        <div class="card-h"><div><div class="card-t">Los otros pedidos del sábado</div><div class="card-s">Salieron con el mismo clic</div></div></div>
        ${provs.map(([n, icn, canal, imp, id]) => `<div class="pv" id="${id}"><span class="pv-i">${B.plogo(n, 26)}</span><div><b>${n}</b><span>${B.logo(icn === 'mail' ? 'gmail' : 'whatsapp', 11)}${canal} · ${eur(imp * 1.1)}</span></div><span class="pv-s">Enviado</span></div>`).join('')}
      </div>
    </div>
  </div>`;
};

/* =========================================================
   8 · ESCANDALLO Y MARGEN
   ========================================================= */
function scatter() {
  const W = 690, H = 392, L = 46, R = 14, T = 20, Bm = 34;
  const xs = (p) => L + (p / 440) * (W - L - R);
  const ys = (m) => T + (H - T - Bm) * (1 - Math.sqrt(m) / Math.sqrt(45));
  const ds = Object.entries(B.DISH).filter(([, d]) => d.pop);
  const avgP = 191, avgM = 12.5;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  s += `<rect x="${xs(avgP)}" y="${T}" width="${W - R - xs(avgP)}" height="${ys(avgM) - T}" fill="${C.accSoft}" opacity=".7"/>`;
  [5, 10, 20, 40].forEach((m) => { s += `<line x1="${L}" x2="${W - R}" y1="${ys(m)}" y2="${ys(m)}" stroke="${C.line2}"/><text x="${L - 8}" y="${ys(m) + 4}" text-anchor="end" class="ax">${m} €</text>`; });
  [0, 100, 200, 300, 400].forEach((p) => { s += `<text x="${xs(p)}" y="${H - 8}" text-anchor="middle" class="ax">${p}</text>`; });
  s += `<line x1="${xs(avgP)}" x2="${xs(avgP)}" y1="${T}" y2="${H - Bm}" stroke="${C.ink4}" stroke-dasharray="3 4"/><line x1="${L}" x2="${W - R}" y1="${ys(avgM)}" y2="${ys(avgM)}" stroke="${C.ink4}" stroke-dasharray="3 4"/>`;
  s += `<text x="${W - R - 8}" y="${T + 16}" text-anchor="end" class="qd q-st">ESTRELLAS</text><text x="${L + 8}" y="${T + 16}" class="qd">ROMPECABEZAS</text><text x="${W - R - 8}" y="${H - Bm - 10}" text-anchor="end" class="qd">CABALLOS DE BATALLA</text><text x="${L + 8}" y="${H - Bm - 10}" class="qd">PERROS</text>`;
  ds.forEach(([k, d], i) => {
    const m = d.p / 1.1 - d.cost, x = xs(d.pop), y = ys(m), r = 6 + Math.sqrt(d.pop * d.p) / 9;
    const star = d.pop > avgP && m > avgM, dog = d.pop < avgP && m < avgM;
    const col = star ? '#2F62E0' : dog ? '#C3C7CE' : d.pop > avgP ? '#9DB9FF' : '#9B8AFB';
    const pos = { croquetas: 'l', secreto: 'l', lubina: 'l', alcachofas: 'u', provoleta: 'd', tarta: 'd', pimientos: 'u', burrata: 'r' }[k] || 'r';
    const lx = pos === 'l' ? x - r - 6 : pos === 'r' ? x + r + 6 : x, ly = pos === 'u' ? y - r - 6 : pos === 'd' ? y + r + 14 : y + 4;
    const anchor = pos === 'l' ? 'end' : pos === 'r' ? 'start' : 'middle';
    s += `<g class="pop" data-pop="${400 + i * 110}" ${k === 'pulpo' ? 'id="scPulpo"' : ''}><circle cx="${x}" cy="${y}" r="${r}" fill="${col}" fill-opacity=".9" stroke="${C.card}" stroke-width="2"/><text x="${lx}" y="${ly}" text-anchor="${anchor}" class="sc-l">${d.s}</text></g>`;
    if (k === 'pulpo') { const y2 = ys(m + 0.91); B.PULPO = { x, y, y2, r }; }
  });
  const P = B.PULPO;
  s += `<g id="scGhost" opacity="0"><line x1="${P.x}" y1="${P.y - P.r - 2}" x2="${P.x}" y2="${P.y2 + P.r + 4}" stroke="${C.brasa}" stroke-width="1.6" stroke-dasharray="3 3"/><circle id="scG" cx="${P.x}" cy="${P.y}" r="${P.r}" fill="none" stroke="${C.brasa}" stroke-width="2" stroke-dasharray="4 3"/><rect x="${P.x - 104}" y="${P.y2 - 32}" width="94" height="22" rx="11" fill="${C.brasa}"/><text x="${P.x - 57}" y="${P.y2 - 17}" text-anchor="middle" class="sc-tag">+1,00 € de precio</text></g>`;
  s += `<text x="${W - R}" y="${H - 26}" text-anchor="end" class="ax-g">PLATOS POR SEMANA →</text>`;
  return s + '</svg>';
}
V.escandallo = () => {
  const d = B.DISH.chuleton, cost = B.ESC.reduce((a, e) => a + e.v, 0), net = d.p / 1.1, fc = (cost / net) * 100;
  let acc = 0;
  const hist = [24.9, 25.1, 25.1, 25.6, 25.8, 26.0, 26.1, 26.4];
  return `
  ${head('Carta de otoño · precios de la última compra', 'Escandallos y margen', '', `<div class="statline"><div><span>Food cost de la carta</span><b class="serif">29,4 %</b></div><div><span>Objetivo</span><b class="serif">30 %</b></div><div><span>Platos escandallados</span><b class="serif">46/46</b></div></div>`)}
  <div class="egrid">
    <div class="card dish" data-in="100">
      <div class="dish-h"><div class="dish-ic">${dic('chuleton', 30, 1.4)}</div><div><div class="eyebrow">Plato · Brasas</div><div class="dish-n serif">Chuletón de vaca madurada</div><div class="dish-s">Ración de 1 kg para compartir · parrilla de encina</div></div></div>
      <div class="dish-k">
        <div><span>Precio de carta</span><b class="serif">${eur(d.p)}</b><small>${eur(net)} sin IVA</small></div>
        <div><span>Coste del plato</span><b class="serif"><span data-num="${cost.toFixed(2)}" data-d="300" data-fmt="2">${nf(cost, 2)}</span> €</b><small>con mermas</small></div>
        <div><span>Food cost</span><b class="serif" style="color:${C.ambar}"><span data-num="${fc.toFixed(1)}" data-d="400" data-fmt="1">${nf(fc, 1)}</span> %</b><small>alto, pero…</small></div>
        <div class="hl"><span>Margen por plato</span><b class="serif">${eur(net - cost)}</b><small>el que más deja de la carta</small></div>
      </div>
      <div class="cbar">${B.ESC.map((e, i) => { const w = (e.v / cost) * 100; acc += w; return `<i data-sx="${500 + i * 90}" style="width:${w}%;background:${e.c}"></i>`; }).join('')}</div>
      <div class="esc">
        <div class="es esh"><span>Ingrediente</span><span>Cantidad</span><span>Precio</span><span>Coste</span></div>
        ${B.ESC.map((e, i) => `<div class="es" data-in="${600 + i * 80}"><span><i style="background:${e.c}"></i>${e.n}${e.nota ? `<small>${e.nota}</small>` : ''}</span><span class="mono dim">${e.q}</span><span class="mono dim">${e.pu}</span><b class="mono">${eur(e.v)}</b></div>`).join('')}
      </div>
      <div class="sim" data-in="1200">${ic('spark', 15)}<div><b>Si la carne sube a 28,00 €/kg</b><span>El coste sube a 32,84 € (food cost del 46,3 %) y el margen baja a 38,07 €. Brasa avisa si pasa del 45 %.</span></div></div>
      <div class="dish-f"><div><div class="card-t">Precio de compra del chuletón</div><div class="card-s">€/kg · últimas 8 semanas · <b style="color:${C.brasa}">+6,0 %</b></div></div><svg width="200" height="46">${spark(hist, C.brasa, 200, 46, 900)}</svg></div>
    </div>
    <div class="ecol">
      <div class="card mat" data-in="200">
        <div class="card-h"><div><div class="card-t">Ingeniería de carta</div><div class="card-s">Margen por plato y platos vendidos por semana</div></div>
          <div class="legend"><span><i style="background:#2F62E0"></i>Estrella</span><span><i style="background:#9DB9FF"></i>Caballo de batalla</span><span><i style="background:#9B8AFB"></i>Rompecabezas</span><span><i style="background:#C3C7CE"></i>Perro</span></div></div>
        <div class="chart-wrap">${scatter()}</div>
      </div>
      <div class="sugs">
        <div class="card sug hot" id="sug1" data-in="900"><div class="sug-h"><b>Pulpo a la brasa</b></div><div class="sug-k">${chip('Estrella', 'crit')}<span>Precio</span></div><p>Subir <b>1,00 €</b> (de 24,50 a 25,50 €). El food cost baja del 31,9 % al 30,6 % y deja <b>+243 € a la semana</b> sin tocar la ración.</p><button class="btn brasa sm" id="btnPulpo">Aplicar en la carta</button></div>
        <div class="card sug" data-in="1050"><div class="sug-h"><b>Lubina a la brasa</b></div><div class="sug-k">${chip('Rompecabezas', 'ok')}<span>En sala</span></div><p>Deja 13,84 € por plato pero se piden 58 a la semana. Ofrecerla como sugerencia del día en sala.</p><div class="sug-m"><div><b class="serif">13,84 €</b><span>de margen</span></div><div><b class="serif">58</b><span>a la semana</span></div></div></div>
        <div class="card sug" data-in="1200"><div class="sug-h"><b>Alcachofas</b></div><div class="sug-k">${chip('Perro')}<span>Carta de invierno</span></div><p>Poca salida y margen bajo. Pasarla a guarnición del secreto en la carta de invierno.</p><div class="sug-m"><div><b class="serif">8,04 €</b><span>de margen</span></div><div><b class="serif">72</b><span>a la semana</span></div></div></div>
      </div>
    </div>
  </div>`;
};

/* =========================================================
   9 · CUADRANTE DEL EQUIPO
   ========================================================= */
const DAYS = ['Lun 23', 'Mar 24', 'Mié 25', 'Jue 26', 'Vie 27', 'Sáb 28', 'Dom 29'];
const shiftHours = (code) => (B.SHIFT[code] || []).reduce((a, [s, e]) => a + (e - s), 0);
function staffRow(p, ri, extra) {
  const [n, role, area, days] = p; const [bg, fg] = B.ROLE[area];
  const hours = days.reduce((a, c) => a + shiftHours(c.replace('*', '')), 0);
  return `<div class="tr ${extra ? 'extra' : ''}" ${extra ? 'id="trExtra"' : `data-in="${200 + ri * 45}"`}>
    <div class="tr-p">${B.face(p[4], 30)}<div><b>${n}</b><span>${role}</span></div><span class="mono tr-h">${nf(hours, 1)} h</span></div>
    ${days.map((c, di) => {
      const code = c.replace('*', '');
      if (code === 'L') return `<div class="td"><span class="off">Libre</span></div>`;
      if (!code) return `<div class="td"></div>`;
      return `<div class="td ${di === 5 ? 'sat' : ''} ${di === 4 ? 'today' : ''}">${B.SHIFT[code].map(([s, e]) => `<i class="shf" ${extra ? 'id="shExtra"' : `data-sx="${300 + ri * 45 + di * 25}"`} style="left:${((s - 10) / 16) * 100}%;width:${((e - s) / 16) * 100}%;background:${bg};border-color:${fg}55"></i>`).join('')}<span class="sh-t mono">${code === 'M' ? '11:30–17' : code === 'T' ? '19:30–0:30' : code === 'C' ? '18–1:30' : 'Partido'}</span></div>`;
    }).join('')}
  </div>`;
}
function coverChart() {
  const W = 314, H = 200, L = 26, R = 22, T = 12, Bm = 24; const hrs = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const cub = [10, 48, 62, 30, 6, 4, 8, 22, 46, 64, 58, 24], staff = [2, 4, 5, 3, 2, 2, 2, 3, 4, 4, 4, 3];
  const need = cub.map((v) => Math.max(1, Math.ceil(v / 14)));
  const sw = (W - L - R) / 12, x0 = (i) => L + i * sw, yc = (v) => T + (H - T - Bm) * (1 - v / 70), yp = (v) => T + (H - T - Bm) * (1 - v / 6);
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  [0, 35, 70].forEach((v) => { s += `<line x1="${L}" x2="${W - R}" y1="${yc(v)}" y2="${yc(v)}" stroke="${v ? C.line2 : C.line}"/><text x="${L - 5}" y="${yc(v) + 4}" text-anchor="end" class="ax">${v}</text>`; });
  [0, 3, 6].forEach((v) => { s += `<text x="${W - R + 5}" y="${yp(v) + 4}" class="ax">${v}</text>`; });
  s += `<rect id="gapR" x="${x0(9)}" y="${T}" width="${x0(11) - x0(9)}" height="${H - T - Bm}" fill="${C.bad}" opacity=".1"/>`;
  cub.forEach((v, i) => { s += `<rect class="sy" data-sy="${250 + i * 50}" x="${x0(i) + 3}" y="${yc(v)}" width="${sw - 6}" height="${yc(0) - yc(v)}" rx="3" fill="#9DB9FF" fill-opacity=".6"/>`; });
  const step = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x0(i).toFixed(1)} ${yp(v).toFixed(1)} L${x0(i + 1).toFixed(1)} ${yp(v).toFixed(1)}`).join(' ');
  s += `<path d="${step(need)}" fill="none" stroke="${C.bad}" stroke-width="1.5" stroke-dasharray="4 3" data-in="800" id="needL"/>`;
  s += `<path d="${step(staff)}" fill="none" stroke="${C.ink}" stroke-width="2.2" data-in="950"/>`;
  s += `<path id="stFix" d="M${x0(9)} ${yp(4)} L${x0(9)} ${yp(5)} L${x0(11)} ${yp(5)} L${x0(11)} ${yp(4)}" fill="none" stroke="${C.oliva}" stroke-width="3" opacity="0"/>`;
  hrs.forEach((h, i) => { if (i % 2 === 0) s += `<text x="${x0(i) + sw / 2}" y="${H - 6}" text-anchor="middle" class="ax">${h}h</text>`; });
  return s + '</svg>';
}
V.turnos = () => `
  ${head('Chamberí · semana 48 · del 23 al 29 de noviembre', 'Cuadrante del equipo', '', `<div class="statline"><div><span>Horas planificadas</span><b class="serif" id="tHoras">438 h</b></div><div><span>Coste de personal</span><b class="serif" id="tCoste">9.860 €</b></div><div><span>Sobre ventas previstas</span><b class="serif" id="tPct">27,6 %</b></div></div>`)}
  <div class="tgrid">
    <div class="card sched" data-in="100">
      <div class="tr thh"><div class="tr-p"><b>Equipo</b><span class="mono">horas</span></div>${DAYS.map((d, i) => `<div class="td-h ${i === 4 ? 'today' : ''} ${i === 5 ? 'sat' : ''}"><b>${d}</b><span class="mono">${['54', '61', '58', '96', '142', '168', '121'][i]} reservas·cub</span></div>`).join('')}</div>
      <div class="tscale"><span></span>${DAYS.map(() => '<div><span>10</span><span>16</span><span>22</span><span>2</span></div>').join('')}</div>
      ${B.STAFF.map((p, i) => staffRow(p, i)).join('')}
      <div class="tr grp" data-in="460"><div class="tr-p"><span class="gi">${ic('users', 15)}</span><div><b>${B.STAFF_GRUPO.n}</b><span>${B.STAFF_GRUPO.sub}</span></div></div>${B.STAFF_GRUPO.days.map((c, di) => `<div class="td ${di === 5 ? 'sat' : ''} ${di === 4 ? 'today' : ''}"><i class="shf" data-sx="${520 + di * 25}" style="left:${(1 / 16) * 100}%;width:${(14.5 / 16) * 100}%;background:#EEF0F3;border-color:#4B505855"></i><span class="sh-t mono">11–1:30</span></div>`).join('')}</div>
      ${staffRow(['Claudia Vega', 'Camarera · refuerzo de Retiro', 'sala', ['', '', '', '', '', 'T', ''], 1], 12, true)}
      <div class="t-key">${Object.entries({ sala: 'Sala', barra: 'Barra', parrilla: 'Parrilla', cocina: 'Cocina', office: 'Office' }).map(([k, n]) => `<span><i style="background:${B.ROLE[k][0]};border-color:${B.ROLE[k][1]}55"></i>${n}</span>`).join('')}<span class="t-cv">Convenio de hostelería de Madrid · descansos de 12 h respetados</span></div>
    </div>
    <div class="tcol">
      <div class="card cover" data-in="200">
        <div class="card-h"><div><div class="card-t">Sábado 28 · sala</div><div class="card-s">Cubiertos por hora frente a camareros en turno</div></div></div>
        <div class="chart-wrap">${coverChart()}</div>
        <div class="legend lg3"><span><i style="background:#9DB9FF"></i>Cubiertos</span><span><i style="background:${C.ink}"></i>Camareros</span><span><i class="dash br"></i>Necesarios</span></div>
      </div>
      <div class="card alertc" id="tAlert" data-in="1700">
        <div class="al-h" id="alH">${ic('alert', 15)}<b>De 21 a 23 h falta una persona en sala</b></div>
        <p>64 cubiertos por hora con 4 camareros: el objetivo de Chamberí es uno por cada 14.</p>
        <div class="eyebrow al-e">Opciones que propone Brasa</div>
        <div class="al-s best">${B.face(1, 28)}<div><b>Claudia Vega · Retiro</b><span>32 de 40 h · sábado noche libre · 5 h, 75 €</span></div><em>Mejor</em></div>
        <div class="al-s">${B.face(6, 28)}<div><b>Nerea Gil · Chamberí</b><span>Alargar 2 h su turno · pasaría de 30 h</span></div></div>
        <div class="al-s"><span class="gi">${ic('users', 14)}</span><div><b>Extra de la bolsa de trabajo</b><span>Disponible desde las 20:30 · 96 €</span></div></div>
        <button class="btn ink" id="btnRefuerzo"><span class="bt-a">${ic('plus', 15)}Añadir refuerzo y avisar</span><span class="bt-c">${ic('check', 15, 2.2)}Añadida · avisada por WhatsApp</span></button>
      </div>
    </div>
  </div>`;

/* =========================================================
   10 · INFORME SEMANAL
   ========================================================= */
function fcChart() {
  const W = 470, H = 214, L = 38, R = 14, T = 18, Bm = 26; const min = 28, max = 34;
  const xs = (i) => L + (i / 9) * (W - L - R), ys = (v) => T + (H - T - Bm) * (1 - (v - min) / (max - min));
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  [28, 30, 32, 34].forEach((v) => { s += `<line x1="${L}" x2="${W - R}" y1="${ys(v)}" y2="${ys(v)}" stroke="${C.line2}"/><text x="${L - 8}" y="${ys(v) + 4}" text-anchor="end" class="ax">${v} %</text>`; });
  s += `<line x1="${L}" x2="${W - R}" y1="${ys(30)}" y2="${ys(30)}" stroke="${C.oliva}" stroke-width="1.4" stroke-dasharray="5 4"/><text x="${L + 6}" y="${ys(30) + 15}" class="ax-ol2">Objetivo 30 %</text>`;
  const pts = B.FC.map((v, i) => [xs(i), ys(v)]);
  const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L');
  s += `<clipPath id="fcClip"><rect data-cw="300" data-w="${W}" data-dur="1500" width="${W}" height="${H}"/></clipPath><g clip-path="url(#fcClip)"><path d="${d} L${xs(9)} ${H - Bm} L${xs(0)} ${H - Bm} Z" fill="${C.brasa}" fill-opacity=".08"/><path d="${d}" fill="none" stroke="${C.brasa}" stroke-width="2.4" stroke-linejoin="round"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === 9 ? 5 : 3}" fill="${i === 9 ? C.brasa : C.card}" stroke="${C.brasa}" stroke-width="2"/>`).join('')}</g>`;
  s += `<g data-in="1300"><line x1="${xs(4)}" x2="${xs(4)}" y1="${T}" y2="${H - Bm}" stroke="${C.ink4}" stroke-dasharray="2 3"/><text x="${xs(4) + 6}" y="${T + 10}" class="ax">Escandallos al día</text></g>`;
  for (let i = 0; i < 10; i++) if (i % 3 === 0 || i === 9) s += `<text x="${xs(i)}" y="${H - 6}" text-anchor="middle" class="ax${i === 9 ? ' ax-b' : ''}">S${38 + i}</text>`;
  return s + '</svg>';
}
function dayChart() {
  const W = 400, H = 214, L = 30, R = 6, T = 14, Bm = 26, max = 30;
  const y = (v) => T + (H - T - Bm) * (1 - v / max), sw = (W - L - R) / 7, bw = 28;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  [0, 10, 20, 30].forEach((v) => { s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.line2 : C.line}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}k</text>`; });
  B.SEMDIA.forEach((d, i) => {
    const cx = L + sw * i + sw / 2; let acc = 0, g = `<g class="sy" data-sy="${300 + i * 70}">`;
    d.v.forEach((v, j) => { const y0 = y(acc + v), hh = y(acc) - y(acc + v); acc += v; g += `<rect x="${cx - bw / 2}" y="${y0 + (j ? 1 : 0)}" width="${bw}" height="${hh - (j ? 1 : 0)}" rx="${j === 2 ? 4 : 1.5}" fill="${LOC[j].c}"/>`; });
    s += g + `</g><text x="${cx}" y="${H - 6}" text-anchor="middle" class="ax">${d.d}</text>`;
  });
  return s + '</svg>';
}
V.informe = () => `
  <div class="vh" data-in="0"><div><div class="eyebrow">Informe semanal · semana 47 · del 16 al 22 de noviembre</div><h1 class="h1">El food cost baja al <em>29,4 %</em> y la merma se queda en el 1,9 %.</h1></div>
    <div class="vh-r"><div class="sent">${B.logo('gmail', 15)}Enviado el lunes a las 8:00 a 4 socios</div><button class="btn ghost">${B.file('xlsx', 18)}Exportar Excel</button><button class="btn ink">${B.file('pdf', 18)}Descargar PDF</button></div></div>
  <div class="kpis">
    ${[['euro', 'Ventas de la semana', '<span data-num="104920" data-d="200">104.920</span><small> €</small>', 'up', '7,8 %', 'frente a la semana 46', C.brasa, [88, 91, 90, 94, 96, 97.3, 104.9]],
      ['scale', 'Food cost', '<span data-num="29.4" data-d="280" data-fmt="1">29,4</span><small> %</small>', 'down good', '2,1 pp', 'desde la semana 42', C.oliva, [33, 32.8, 32.2, 31.5, 30.6, 30.1, 29.4].map((v) => -v)],
      ['layers', 'Merma', '<span data-num="1.9" data-d="360" data-fmt="1">1,9</span><small> %</small>', 'down good', '0,8 pp', '810 € tirados', C.ambar, [2.9, 2.8, 2.6, 2.4, 2.2, 2.1, 1.9].map((v) => -v)],
      ['users', 'Ticket medio', '<span data-num="39.2" data-d="440" data-fmt="2">39,20</span><small> €</small>', 'up', '1,10 €', '2.677 comensales', C.ink2, [37.4, 37.9, 38.1, 38.0, 38.6, 38.1, 39.2]]]
    .map(([i, l, v, dc, dv, ds, col, sp], k) => `<div class="card kpi" data-in="${100 + k * 80}"><div class="kpi-l">${ic(i, 15)}${l}</div><div class="kpi-v serif">${v}</div><div class="kpi-s"><span class="delta ${dc}">${ic(dc.startsWith('up') ? 'up' : 'down', 11, 2)}${dv}</span> ${ds}</div><svg class="kpi-sp" width="112" height="40">${spark(sp, col, 112, 40, 400 + k * 80)}</svg></div>`).join('')}
  </div>
  <div class="igrid">
    <div class="card" data-in="300"><div class="card-h"><div><div class="card-t">Food cost · últimas 10 semanas</div><div class="card-s">Coste de la materia prima sobre ventas sin IVA</div></div></div><div class="chart-wrap">${fcChart()}</div></div>
    <div class="card" data-in="380"><div class="card-h"><div><div class="card-t">Ventas por día</div><div class="card-s">Miles de euros · los tres locales</div></div></div><div class="chart-wrap">${dayChart()}</div></div>
    <div class="card merma" data-in="460"><div class="card-h"><div><div class="card-t">Merma por familia</div><div class="card-s">% de lo comprado · € tirados</div></div></div>
      ${B.MERMA.map((m, i) => `<div class="mr"><span>${m.n}</span><div class="mr-b"><i data-sx="${600 + i * 80}" style="width:${(m.v / 5) * 100}%;background:${m.v > 3 ? C.bad : m.v > 2 ? '#5B8CFF' : '#9DB9FF'}"></i></div><b class="mono">${nf(m.v, 1)} %</b><span class="mono dim">${m.e} €</span></div>`).join('')}</div>
  </div>
  <div class="ibot">
    <div class="card ltab" data-in="560">
      <div class="lt lth"><span>Local</span><span>Ventas</span><span>Frente a S46</span><span>Ticket medio</span><span>Food cost</span><span>Merma</span><span>Personal</span><span>Reseñas</span></div>
      ${[[0, 39120, 9.1, 41.3, 28.9, 1.7, 26.8, 4.8], [1, 33680, 6.2, 37.4, 29.6, 2.0, 28.9, 4.6], [2, 32120, 7.9, 38.6, 29.8, 2.1, 27.4, 4.7]].map(([l, v, d, t, f, m, p, r], i) => `<div class="lt" data-in="${700 + i * 90}"><span class="lt-n"><i style="background:${LOC[l].c}"></i>${LOC[l].n}</span><b class="mono">${eur(v, 0)}</b><span class="mono up">+${nf(d, 1)} %</span><span class="mono">${eur(t)}</span><span class="mono">${nf(f, 1)} %</span><span class="mono">${nf(m, 1)} %</span><span class="mono">${nf(p, 1)} %</span><span class="mono">${ic('star', 13)} ${nf(r, 1)}</span></div>`).join('')}
      <div class="lt tot"><span class="lt-n">Grupo</span><b class="mono">104.920 €</b><span class="mono up">+7,8 %</span><span class="mono">39,20 €</span><span class="mono">29,4 %</span><span class="mono">1,9 %</span><span class="mono">27,6 %</span><span class="mono">${ic('star', 13)} 4,7</span></div>
    </div>
    <div class="card notes" data-in="640">
      <div class="ins-h">${ic('spark', 16)}<span>Lo que ha pasado esta semana</span></div>
      <div class="nt" data-in="900"><b>Pulpo +1,00 €</b><span>Aplicado el miércoles: se han vendido 271, tres más que la semana anterior.</span></div>
      <div class="nt" data-in="1000"><b>Pan en Malasaña</b><span>El 4,8 % de merma viene de los lunes. Desde hoy se pide un 20 % menos.</span></div>
      <div class="nt" data-in="1100"><b>Chuletón +6 % en compra</b><span>El margen aguanta: 39,80 € por plato. Se revisa precio con Carnes Ortiz en diciembre.</span></div>
      <div class="files" data-in="1200"><span>${B.file('pdf', 26)}<b>Informe_S47.pdf</b><small>1,2 MB</small></span><span>${B.file('xlsx', 26)}<b>Ventas_S47.xlsx</b><small>86 KB</small></span></div>
    </div>
  </div>`;

/* =========================================================
   TARJETA DEL PORTFOLIO (mode=card)
   ========================================================= */
V.card = () => {
  const W = 840, H = 380, L = 104, R = 10, T = 24, Bm = 44, max = 5000;
  const y = (v) => T + (H - T - Bm) * (1 - v / max), sw = (W - L - R) / 12, bw = 40;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><pattern id="hatchC" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="${C.card}"/><line x1="0" y1="0" x2="0" y2="9" stroke="${C.line}" stroke-width="3"/></pattern><clipPath id="cPrev"><rect id="cPrevR" width="${W}" height="${H}"/></clipPath></defs>`;
  [0, 2500, 5000].forEach((v) => { s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.line2 : C.line}" stroke-width="1.5"/><text x="${L - 12}" y="${y(v) + 8}" text-anchor="end" class="cax">${v ? nf(v) : '0'}</text>`; });
  B.HOURS.forEach((h, i) => {
    const cx = L + sw * i + sw / 2, x = cx - bw / 2;
    if (i < 9) {
      let acc = 0, g = `<g class="cbarg" id="cb${i}">`;
      ['ch', 'ma', 're'].forEach((id, j) => { const v = B.HV[id][i]; const y0 = y(acc + v), hh = y(acc) - y(acc + v); acc += v; g += `<rect x="${x}" y="${y0 + (j ? 1.5 : 0)}" width="${bw}" height="${hh - (j ? 1.5 : 0)}" rx="${j === 2 ? 5 : 2}" fill="${LOC[j].c}"/>`; });
      s += g + '</g>';
    } else if (i === 9) {
      s += `<rect x="${x - 4}" y="${y(B.PREV[i])}" width="${bw + 8}" height="${y(0) - y(B.PREV[i])}" rx="6" fill="url(#hatchC)" stroke="${C.line}" stroke-width="1.5"/>`;
      s += '<g id="cbhG" class="cbarg">' + [0, 1, 2].map((j) => `<rect id="cbh${j}" x="${x}" width="${bw}" rx="${j === 2 ? 5 : 2}" fill="${LOC[j].c}"/>`).join('') + '</g>';
    } else s += `<rect x="${x}" y="${y(B.PREV[i])}" width="${bw}" height="${y(0) - y(B.PREV[i])}" rx="5" fill="url(#hatchC)" stroke="${C.line}" stroke-width="1.5"/>`;
    if (i % 2 === 1 || i === 9) s += `<text x="${cx}" y="${H - 10}" text-anchor="middle" class="cax${i === 9 ? ' b' : ''}">${h}h</text>`;
  });
  const pts = B.PREV.map((v, i) => `${(L + sw * i + sw / 2).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  s += `<g clip-path="url(#cPrev)"><polyline points="${pts}" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-dasharray="8 6"/></g></svg>`;
  B.cScale = { y };
  return `
  <div class="cd-top"><div class="cd-brand"><div class="logo xl">${ic('flame', 34, 1.8)}</div><span class="serif">Grupo Brasa</span></div>
    <div class="cd-live"><i class="live"></i>En directo · 3 locales</div><div class="cd-clock mono" id="cdClock">21:05:00</div></div>
  <div class="cd-main">
    <div class="cd-left">
      <div class="cd-l">Ventas de hoy</div>
      <div class="cd-v serif"><span id="cdV">19.612</span><small>€</small></div>
      <div class="cd-d"><span class="delta up">${ic('up', 22, 2.4)}<span id="cdD">5,1</span> %</span> sobre la previsión</div>
      <div class="cd-k"><div><span>Comensales</span><b class="serif" id="cdPax">506</b></div><div><span>Ticket medio</span><b class="serif"><span id="cdTm">39,20</span> €</b></div><div><span>Ocupación</span><b class="serif">91 %</b></div></div>
      <div class="cd-locs">${LOC.map((l, i) => `<div class="cd-loc"><i style="background:${l.c}"></i><span>${l.n}</span><div class="cd-bar"><b id="cdB${i}" style="background:${l.c}"></b></div><em class="mono" id="cdL${i}">0</em></div>`).join('')}</div>
    </div>
    <div class="cd-right">
      <div class="card cd-chart"><div class="cd-ch"><b>Ventas por hora</b><span><i class="dash"></i>Previsión</span></div>${s}</div>
      <div class="cd-tk" id="cdTk"><div class="cd-tk-in" id="cdTkIn"></div></div>
    </div>
  </div>`;
};
V.cardTk = (tk) => {
  const l = LOC[tk.loc];
  const sub = tk.kind === 'comanda' ? tk.items.map((i) => `${i.q}× ${B.DISH[i.d].s}`).slice(0, 2).join(' · ') : `Cobrada · ${tk.pay}`;
  return `<div class="ctk"><div class="ctk-ic" style="background:${tk.kind === 'comanda' ? l.soft : C.line2};color:${tk.kind === 'comanda' ? l.c : C.ink2}">${tk.kind === 'comanda' ? ic('receipt', 32) : B.payImg(tk.pay, 30)}</div><div class="ctk-m"><b>Mesa ${tk.mesa} · ${l.n}</b><span>${sub}</span></div><div class="ctk-a mono">${eur(tk.amt)}</div></div>`;
};
})();
