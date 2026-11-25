/* Grupo Brasa · datos de ejemplo e iconos (empresa, personas y cifras ficticias) */
(() => {
'use strict';
const B = (window.BRASA = {});

/* ---------- utilidades ---------- */
B.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
B.ease = (t) => 1 - Math.pow(1 - B.clamp(t), 3);
B.easeIO = (t) => { t = B.clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
B.back = (t) => { t = B.clamp(t); const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
B.prog = (t, a, d) => B.clamp((t - a) / d);
B.lerp = (a, b, t) => a + (b - a) * t;
B.nf = (n, d = 0) => {
  const neg = n < 0; const s = Math.abs(n).toFixed(d).split('.');
  s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + s.join(',');
};
B.eur = (n, d = 2) => B.nf(n, d) + ' €';
B.rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/* ---------- paleta ---------- */
B.C = { // sistema de Aldia
  brasa: '#2F62E0', brasa2: '#2F62E0', brasaSoft: '#EEF3FF', oliva: '#19A974', oliva2: '#12875C', olivaSoft: '#E8F7F1',
  ambar: '#C98A12', ambarSoft: '#FEF5E6', ink: '#0E0E0E', ink2: '#2A2B2E', ink3: '#6B6F76', ink4: '#9A9EA6',
  line: '#E8E9EC', line2: '#F0F1F3', paper: '#F7F8FA', paper2: '#F7F8FA', card: '#FFFFFF', vino: '#2A2B2E',
  acc: '#5B8CFF', accInk: '#2F62E0', accSoft: '#EEF3FF', accLine: '#D5E2FF', bad: '#E5484D', badSoft: '#FDECEC', vio: '#9B8AFB', teal: '#3FB2A6'
};
const C = B.C;
B.LOC = [
  { id: 'ch', n: 'Chamberí', c: '#5B8CFF', soft: '#EEF3FF', dir: 'Santa Engracia, 112', occ: 96, mesas: '21/23' },
  { id: 'ma', n: 'Malasaña', c: '#9B8AFB', soft: '#F1EEFF', dir: 'Calle del Pez, 27', occ: 91, mesas: '19/21' },
  { id: 're', n: 'Retiro', c: '#3FB2A6', soft: '#E6F6F4', dir: 'Calle de Ibiza, 41', occ: 86, mesas: '18/21' }
];

/* ---------- iconos de interfaz (trazo, 24×24) ---------- */
const I = {
  panel: '<path d="M4 4h6.5v8H4zM13.5 4H20v4.5h-6.5zM13.5 11.5H20V20h-6.5zM4 15h6.5v5H4z"/>',
  sala: '<circle cx="8" cy="8" r="3.2"/><circle cx="16.5" cy="16.5" r="3.2"/><path d="M13.5 4.8h6v6h-6zM4.5 13.5h6v6h-6z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  cart: '<path d="M3 4h2.4l2.3 11.2h10.5L20.6 7.5H6.4"/><circle cx="9.2" cy="19.2" r="1.4"/><circle cx="16.8" cy="19.2" r="1.4"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.2h7M8.6 11h.01M12 11h.01M15.4 11h.01M8.6 14.5h.01M12 14.5h.01M8.6 18h.01M12 18h.01M15.4 14.5V18"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5.2 5.5-5.2s4.9 2 5.5 5.2"/><circle cx="17" cy="9" r="2.4"/><path d="M15.6 14.3c2.4-.3 4.3 1.3 4.9 4.3"/>',
  doc: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12.5h7M9 16.5h7"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  bell: '<path d="M6 16.5v-5.5a6 6 0 1 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  flame: '<path d="M12 2.8c.6 3.2 5 5.2 5 10.4a5 5 0 0 1-10 0c0-2.4 1.1-4 2.5-5.1.1 1.9.9 3.1 2 3.4-.5-3.7-.7-6 .5-8.7z"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  check2: '<path d="m2.5 12.5 4 4L15 8M10.5 16.5l.5.5L20 8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>',
  down: '<path d="M12 5v14M6.5 13.5 12 19l5.5-5.5"/>',
  chat: '<path d="M4 19.5 5.2 15.6A8 8 0 1 1 8.6 19z"/><path d="M9 10.5h6M9 13.5h4"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.4 5.4 3.4 8.5s-1 6-3.4 8.5c-2.4-2.5-3.4-5.4-3.4-8.5s1-6 3.4-8.5z"/>',
  fork: '<path d="M7.5 3v5.5a2.5 2.5 0 0 0 5 0V3M10 11v10M16.5 3c-1.6 1.6-2.2 4-2.2 6.2 0 1.7.9 2.8 2.2 2.8V21"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  truck: '<path d="M3 6.5h11v9.5H3zM14 9.5h3.8l3.2 3.6V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
  alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4M12 17v.01"/>',
  spark: '<path d="M12 3.5c.6 4.3 2.7 6.9 6.5 8.5-3.8 1.6-5.9 4.2-6.5 8.5-.6-4.3-2.7-6.9-6.5-8.5 3.8-1.6 5.9-4.2 6.5-8.5z"/>',
  send: '<path d="M4 12 20 4l-6 16-2.6-6.4z"/><path d="m11.4 13.6 3.6-3.6"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18M7 15h3"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/>',
  dots: '<circle cx="5.5" cy="12" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="18.5" cy="12" r=".9"/>',
  chev: '<path d="m9.5 6 6 6-6 6"/>',
  pdf: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5"/><path d="M8.8 16.8v-4h1.4a1.2 1.2 0 0 1 0 2.4H8.8M13 12.8v4h.9a2 2 0 0 0 0-4z"/>',
  share: '<circle cx="6.5" cy="12" r="2.3"/><circle cx="17.5" cy="6" r="2.3"/><circle cx="17.5" cy="18" r="2.3"/><path d="m8.5 11 7-4M8.5 13l7 4"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
  swap: '<path d="M4 8.5h14.5l-3.5-3.5M20 15.5H5.5L9 19"/>',
  heat: '<path d="M4 20h16"/><rect x="5" y="12" width="3" height="5" rx="1"/><rect x="10.5" y="7" width="3" height="10" rx="1"/><rect x="16" y="4" width="3" height="13" rx="1"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  euro: '<path d="M17.5 6.5a6.5 6.5 0 1 0 0 11M5 10.5h8.5M5 13.5h8.5"/>',
  wait: '<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4 4 5 4 8.5s-4 4.5-4 8.5M16 3.5c0 4-4 5-4 8.5s4 4.5 4 8.5"/>',
  filter: '<path d="M4 5.5h16l-6.2 7.3V19l-3.6 1.5v-7.7z"/>',
  scale: '<path d="M12 4v16M6 20h12M5 8h14M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z"/>',
  layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  receipt: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  tag: '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z"/><circle cx="8.5" cy="8.5" r="1.4"/>'
};

/* ---------- platos (iconos dibujados a mano) ---------- */
const D = {
  chuleton: '<path d="M4.3 10.6C4.3 6.6 7.9 4 12.4 4 16.9 4 20 6.3 20 10.2c0 4.6-3.3 9.3-8.6 9.3-4.3 0-7.1-3.2-7.1-8.9z"/><path d="M10.6 7.2v9M8 10.6h5.2"/><path d="M15.6 8.4c1 .8 1.6 1.9 1.6 3.2"/>',
  pulpo: '<path d="M8 10.2a4 4 0 1 1 8 0v1.3c0 1-.6 1.9-1.4 2.3"/><path d="M9.4 13.8C8.6 13.4 8 12.5 8 11.5"/><path d="M9.4 13.8c-1.6 1.2-3.9 1.4-4.4 3.3-.4 1.6 1.3 2.6 2.4 1.6"/><path d="M11.2 14.3c-.4 1.8-.6 3.8.9 4.8 1.2.8 2.6-.2 2.1-1.4"/><path d="M14.6 13.8c1.4 1 3.7 1 4.2 2.8.4 1.4-1 2.4-2 1.6"/><circle cx="10.6" cy="9.6" r=".55"/><circle cx="13.4" cy="9.6" r=".55"/>',
  carne: '<path d="M4 15.2c1.8-4.6 5-7.6 9.6-8.6 3.3-.7 6.2.9 6.4 3.5.2 2.4-2.3 3.6-5 4.3-3 .8-5.2 2.4-6.9 4.2-2 .8-4.6-1.1-4.1-3.4z"/><path d="M9 13.2c2-1.6 4.3-2.6 7-3"/>',
  croqueta: '<path d="M6.6 17.6c-2.3-.8-3.2-3.2-2.1-5.3l1.3-2.4C7 7.4 9.9 6 12.4 6.9l5 1.8c2.3.8 3.2 3.2 2.1 5.3l-1.3 2.4c-1.2 2.4-4.1 3.8-6.6 2.9z"/><path d="M8.5 11.4h.01M12 10.2h.01M14.8 13h.01M10.6 14.6h.01"/>',
  burrata: '<circle cx="12" cy="13.6" r="6.4"/><path d="M9.9 7.6c.2-1.7 1-2.8 2.1-2.8s1.9 1.1 2.1 2.8"/><path d="M9.6 5.4h4.8"/><path d="M9 14.2c1.5 1.2 4.5 1.2 6 0"/>',
  pimiento: '<path d="M12.6 6.6c0-1.6.8-2.8 2.5-3.3"/><path d="M9.5 7.3c2.2-1.3 5.3-.9 6.8 1 1.6 2.1 1 5.5-.8 8.1-1.8 2.6-5 4.5-7.3 3.2-1.9-1.1-1.4-4.2-.6-7 .5-2 .7-4.1 1.9-5.3z"/><path d="M11.5 9.5c-.8 2.2-1 4.6-.4 6.6"/>',
  alcachofa: '<path d="M12 18v2.8"/><path d="M12 18c-3.9 0-6.4-3-6.4-6.5C5.6 8 8.6 4 12 4s6.4 4 6.4 7.5S15.9 18 12 18z"/><path d="M12 18c-1.8-2.4-2.4-5-2-8M12 18c1.8-2.4 2.4-5 2-8M8.6 12.6c1 .8 2.2 1.2 3.4 1.2s2.4-.4 3.4-1.2"/>',
  pescado: '<path d="M4.5 12c2.6-3.6 6-5.2 9.4-5.2 3 0 5.4 2 6.6 5.2-1.2 3.2-3.6 5.2-6.6 5.2-3.4 0-6.8-1.6-9.4-5.2z"/><path d="M4.5 12 2.5 8.6M4.5 12l-2 3.4"/><circle cx="16.4" cy="11" r=".6"/><path d="M11.5 9.4c.6 1.6.6 3.6 0 5.2"/>',
  tarta: '<path d="M3.5 17.5h17v-5L9.5 7.2 3.5 12.5z"/><path d="M3.5 12.5h17"/><path d="M9.5 7.2c.6-1.4 1.8-2 3-1.6"/>',
  queso: '<path d="M4 14.4c0 2.5 3.6 4.1 8 4.1s8-1.6 8-4.1V11.6c0-2.5-3.6-4.1-8-4.1s-8 1.6-8 4.1z"/><path d="M4 11.6c0 2.5 3.6 4.1 8 4.1s8-1.6 8-4.1"/><path d="M9 10.6h.01M14 9.8h.01"/>',
  vino: '<path d="M7.5 3.5h9l-.7 5.6a3.8 3.8 0 0 1-7.6 0z"/><path d="M8 7.2h8"/><path d="M12 12.9v6.6M8.5 20h7"/>',
  botella: '<path d="M10 3h4v4.2c1.6.8 2.5 2.2 2.5 4V20a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-8.8c0-1.8.9-3.2 2.5-4z"/><path d="M7.5 13.5h9v4h-9z"/>',
  patata: '<path d="M5.5 9.6c1.3-3.6 5.8-5 9.4-3.8 3.4 1.2 4.6 4.6 3.4 7.9-1.3 3.6-5.4 5.5-9 4.4-3.5-1-5-4.8-3.8-8.5z"/><path d="M9.5 9.6h.01M14 11.2h.01M11 14.2h.01"/>',
  carbon: '<path d="M4.8 18.8c-.8-2 .4-3.6 2-4.2.4-1.8 2-3 3.8-2.6 1.2-1.3 3.4-1.3 4.6.2 2-.2 3.6 1.4 3.4 3.4 1 .6 1.4 2 .8 3.2z"/><path d="M12 9.4c-.8-1.3-.3-2.7.8-3.8.2 1.2.9 1.8 1.6 2.2M8.5 9.8c-.4-.9-.1-1.8.6-2.5"/>',
  pan: '<path d="M4 13.2c0-4 3.6-6.6 8-6.6s8 2.6 8 6.6v4.6H4z"/><path d="M9 9.6l-1.5 3M13 9.2l-1.5 3M17 10l-1.5 2.6"/>',
  chorizo: '<path d="M4.6 14.8c2.4 3.2 8 3.7 12 1.2s4.1-7.1 1.6-8.6-3.5 2.5-6 3.5-6.1-.6-7.6 1.5z"/><path d="M8 13.8h.01M11.5 14.4h.01M15 12.6h.01"/>',
  cana: '<path d="M6 6.8h9.5v13H6z"/><path d="M15.5 9.6h2a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-2"/><path d="M6 6.8c0-1.4 1.2-2.5 2.6-2.5.6-.6 1.5-1 2.4-1s1.8.4 2.4 1c1.2 0 2.1 1.1 2.1 2.5"/>'
};

const svgOpen = (s, sw) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">`;
B.ic = (n, s = 18, sw = 1.5) => svgOpen(s, sw) + (I[n] || '') + '</svg>';
const ASSET = '../assets/';
B.face = (n, s = 28, cls = '') => `<img class="face ${cls}" src="${ASSET}apps/caras/cara${n}.webp" width="${s}" height="${s}" alt="" decoding="async">`;
B.logo = (n, s = 14) => `<img class="blogo" src="${ASSET}logos/${n}.svg" width="${s}" height="${s}" alt="" decoding="async">`;
B.file = (n, s = 18) => `<img class="ficon" src="${ASSET}apps/iconos/${n}.svg" height="${s}" alt="" decoding="async">`;
B.payImg = (pay, s = 16) => B.file(pay === 'Bizum' ? 'bizum' : pay === 'Efectivo' ? 'dinero' : 'tarjeta', s);
// mini logotipos de proveedores: marca sencilla con forma y color
const PLOGO = {
  'Carnes Ortiz': ['#8E1F24', '<path d="M7.2 9.6c-1.7-.2-2.8-1.5-3-3.2 1.5.7 2.8.9 4 .7M16.8 9.6c1.7-.2 2.8-1.5 3-3.2-1.5.7-2.8.9-4 .7" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M8 9h8l-1.1 7a2.9 2.9 0 0 1-5.8 0z" fill="#fff"/>'],
  'Pescados Rías Baixas': ['#0F4C81', '<path d="M5.5 11.5c2.4-2.9 5-4.1 7.9-4.1 2.6 0 4.5 1.6 5.5 4.1-1 2.5-2.9 4.1-5.5 4.1-2.9 0-5.5-1.2-7.9-4.1z" fill="#fff"/><path d="M5.5 11.5 3.4 9.2M5.5 11.5l-2.1 2.3" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="15.2" cy="10.8" r=".9" fill="#0F4C81"/><path d="M5 18.5c1.2-.9 2.4-.9 3.6 0s2.4.9 3.6 0 2.4-.9 3.6 0 2.4.9 3.6 0" stroke="#7FB2E5" stroke-width="1.3" fill="none" stroke-linecap="round"/>'],
  'Carbones La Encina': ['#2A2B2E', '<path d="M12 4.2c3.1 2 4.9 4.6 4.9 7.6a4.9 4.9 0 0 1-9.8 0c0-1.6.7-3 1.8-4 .2 1.4.9 2.2 1.8 2.5-.4-2.4.1-4.3 1.3-6.1z" fill="#F59E0B"/><path d="M12 13.2c.9.9 1.4 1.8 1.4 2.7a1.4 1.4 0 0 1-2.8 0c0-.9.5-1.8 1.4-2.7z" fill="#FDE68A"/>'],
  'Vinos Laguardia': ['#6D1A36', '<path d="M12 6V3.6M12 4.6c1.5-1.1 3-1.1 4.2 0" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/><g fill="#fff"><circle cx="9.8" cy="8.4" r="1.9"/><circle cx="14.2" cy="8.4" r="1.9"/><circle cx="7.8" cy="11.9" r="1.9"/><circle cx="12" cy="11.9" r="1.9"/><circle cx="16.2" cy="11.9" r="1.9"/><circle cx="9.8" cy="15.4" r="1.9"/><circle cx="14.2" cy="15.4" r="1.9"/><circle cx="12" cy="18.8" r="1.9"/></g>'],
  'Lácteos Campoazul': ['#3B82C4', '<path d="M12 4.3c2.8 3.4 5 6.2 5 8.8a5 5 0 0 1-10 0c0-2.6 2.2-5.4 5-8.8z" fill="#fff"/><path d="M9.6 13.6c.4 1.3 1.4 2 2.6 2.1" stroke="#3B82C4" stroke-width="1.3" fill="none" stroke-linecap="round"/>'],
  'Huerta de Aranjuez': ['#2E8B57', '<path d="M6 18C6 10.3 10.4 6 18 6c0 7.6-4 12-11.2 12" fill="#fff"/><path d="M6.4 17.6 13.2 10.8" stroke="#2E8B57" stroke-width="1.5" stroke-linecap="round"/>'],
  'Obrador propio': ['#2F62E0', '<path d="M12 4c.5 2.7 4.2 4.4 4.2 8.8a4.2 4.2 0 0 1-8.4 0c0-2 .9-3.4 2.1-4.3.1 1.6.8 2.6 1.7 2.9-.4-3.1-.6-5 .4-7.4z" fill="#fff"/>']
};
B.plogo = (name, s = 22) => { const [bg, inner] = PLOGO[name] || PLOGO['Obrador propio']; return `<svg class="plogo" width="${s}" height="${s}" viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="${bg}"/>${inner}</svg>`; };
B.ini = (n) => n.split(/\s+/).filter((w) => w.length > 2 && !/^(de|del|la|las|los)$/i.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
B.dic = (n, s = 22, sw = 1.45) => svgOpen(s, sw) + (D[n] || '') + '</svg>';

/* ---------- carta ---------- */
B.DISH = {
  chuleton: { n: 'Chuletón de vaca madurada', s: 'Chuletón', p: 78, cost: 31.11, pop: 212, ic: 'chuleton' },
  pulpo: { n: 'Pulpo a la brasa', s: 'Pulpo', p: 24.5, cost: 7.1, pop: 268, ic: 'pulpo' },
  secreto: { n: 'Secreto ibérico', s: 'Secreto', p: 19.8, cost: 5.4, pop: 204, ic: 'carne' },
  entrana: { n: 'Entraña de ternera', s: 'Entraña', p: 22.5, cost: 6.9, pop: 96, ic: 'carne' },
  croquetas: { n: 'Croquetas de jamón (6)', s: 'Croquetas', p: 9.5, cost: 1.62, pop: 410, ic: 'croqueta' },
  burrata: { n: 'Burrata con tomate', s: 'Burrata', p: 14.5, cost: 4.2, pop: 176, ic: 'burrata' },
  pimientos: { n: 'Pimientos de padrón', s: 'Pimientos', p: 7.9, cost: 1.3, pop: 302, ic: 'pimiento' },
  alcachofas: { n: 'Alcachofas a la brasa', s: 'Alcachofas', p: 13.9, cost: 4.6, pop: 72, ic: 'alcachofa' },
  lubina: { n: 'Lubina a la brasa', s: 'Lubina', p: 26, cost: 9.8, pop: 58, ic: 'pescado' },
  tarta: { n: 'Tarta de queso', s: 'Tarta de queso', p: 7.8, cost: 1.45, pop: 236, ic: 'tarta' },
  provoleta: { n: 'Provoleta', s: 'Provoleta', p: 11.5, cost: 3.1, pop: 84, ic: 'queso' },
  rioja: { n: 'Rioja crianza', s: 'Rioja crianza', p: 24, cost: 6.6, pop: 0, ic: 'vino' },
  patatas: { n: 'Patatas a la brasa', s: 'Patatas', p: 6.5, cost: 0.9, pop: 0, ic: 'patata' },
  cana: { n: 'Caña', s: 'Cañas', p: 2.8, cost: 0.5, pop: 0, ic: 'cana' }
};

/* ---------- ventas por hora (12 h a 23 h) ---------- */
B.HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
B.HV = { // ventas cerradas hasta las 20 h; la de las 21 h es la parcial al arrancar
  ch: [170, 1210, 1650, 900, 230, 140, 300, 700, 1460, 610],
  ma: [100, 880, 1230, 760, 250, 170, 380, 760, 1320, 540],
  re: [140, 1030, 1400, 690, 140, 80, 210, 560, 1130, 470]
};
B.PREV = [400, 2950, 4100, 2250, 600, 380, 820, 1900, 3720, 4800, 4300, 1750];

/* ---------- comandas y cobros (deterministas, infinitos) ---------- */
const MESAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const POOL = ['chuleton', 'pulpo', 'secreto', 'croquetas', 'pimientos', 'burrata', 'rioja', 'entrana', 'tarta', 'patatas', 'cana', 'provoleta', 'alcachofas', 'lubina', 'chuleton', 'pulpo', 'croquetas', 'rioja'];
const PAY = ['Tarjeta', 'Tarjeta', 'Bizum', 'Tarjeta', 'Efectivo', 'Tarjeta'];
B.TK_GAP = 1750;
const tkCache = new Map();
B.ticket = (k) => {
  if (tkCache.has(k)) return tkCache.get(k);
  const r = B.rng(9001 + k * 7919);
  const t = k * B.TK_GAP + r() * 500;
  const loc = Math.floor(r() * 3);
  const mesa = MESAS[Math.floor(r() * MESAS.length)];
  const kind = r() < 0.3 ? 'cobro' : 'comanda';
  let items = [], amt = 0, pax = 0, pay = '', tip = 0;
  if (kind === 'comanda') {
    const n = 1 + Math.floor(r() * 3); const used = new Set();
    for (let i = 0; i < n; i++) {
      let d = POOL[Math.floor(r() * POOL.length)]; if (used.has(d)) continue; used.add(d);
      const q = d === 'cana' ? 2 + Math.floor(r() * 4) : d === 'chuleton' ? 1 + Math.floor(r() * 2) : 1 + Math.floor(r() * 2);
      items.push({ d, q }); amt += q * B.DISH[d].p;
    }
  } else {
    pax = 2 + Math.floor(r() * 6); amt = Math.round((pax * (31 + r() * 18)) * 10) / 10; pay = PAY[Math.floor(r() * PAY.length)];
    tip = r() < 0.45 ? [2, 3, 5, 5, 6, 10][Math.floor(r() * 6)] : 0;
  }
  const tk = { k, t, loc, mesa, kind, items, amt, pax, pay, tip };
  tkCache.set(k, tk); return tk;
};
const cum = [{ v: [0, 0, 0], all: 0, cob: 0 }];
B.liveSums = (K) => { // suma de comandas 0..K por local y de cobros
  if (K < 0) return cum[0];
  while (cum.length <= K + 1) {
    const k = cum.length - 1; const p = cum[k]; const tk = B.ticket(k);
    const v = p.v.slice(); let all = p.all, cob = p.cob;
    if (tk.kind === 'comanda') { v[tk.loc] += tk.amt; all += tk.amt; } else cob += tk.amt;
    cum.push({ v, all, cob });
  }
  return cum[K + 1];
};
B.lastK = (liveT) => { let k = Math.floor(liveT / B.TK_GAP) + 1; while (k > -12 && B.ticket(k).t > liveT) k--; return k; };

/* ---------- plano de Chamberí ---------- */
B.TABLES = [
  { n: 1, x: 92, y: 210, s: 'r', p: 2, z: 't' }, { n: 2, x: 174, y: 210, s: 'r', p: 2, z: 't' },
  { n: 3, x: 92, y: 300, s: 'r', p: 2, z: 't' }, { n: 4, x: 174, y: 300, s: 'r', p: 2, z: 't' },
  { n: 5, x: 133, y: 405, s: 'q', p: 4, z: 't' }, { n: 6, x: 133, y: 520, s: 'q', p: 4, z: 't' },
  { n: 7, x: 318, y: 215, s: 'q', p: 4, z: 's' }, { n: 8, x: 423, y: 215, s: 'q', p: 4, z: 's' }, { n: 9, x: 528, y: 215, s: 'q', p: 4, z: 's' },
  { n: 10, x: 318, y: 325, s: 'q', p: 4, z: 's' }, { n: 11, x: 423, y: 325, s: 'q', p: 4, z: 's' }, { n: 12, x: 566, y: 330, s: 'l', p: 8, z: 'l' },
  { n: 14, x: 318, y: 435, s: 'q', p: 4, z: 's' }, { n: 15, x: 423, y: 435, s: 'q', p: 4, z: 's' }, { n: 16, x: 566, y: 440, s: 'l', p: 6, z: 'l' },
  { n: 17, x: 712, y: 205, s: 'r', p: 2, z: 'p' }, { n: 18, x: 800, y: 205, s: 'r', p: 2, z: 'p' },
  { n: 19, x: 712, y: 292, s: 'r', p: 2, z: 'p' }, { n: 20, x: 800, y: 292, s: 'r', p: 2, z: 'p' },
  { n: 21, x: 756, y: 400, s: 'q', p: 4, z: 's' },
  { n: 22, x: 318, y: 548, s: 'q', p: 4, z: 'f' }, { n: 23, x: 423, y: 548, s: 'q', p: 4, z: 'f' }, { n: 24, x: 528, y: 548, s: 'q', p: 4, z: 'f' }
];
// estado inicial a las 21:05: [estado, minutos o hora de reserva]
B.T0 = {
  1: ['ocu', 34], 2: ['ocu', 52], 3: ['pos', 81], 4: ['cue', 96], 5: ['res', '21:15'], 6: ['lib', 0],
  7: ['ocu', 18], 8: ['pos', 74], 9: ['cue', 102], 10: ['ocu', 41], 11: ['ocu', 27], 12: ['ocu', 112],
  14: ['lib', 0], 15: ['ocu', 9], 16: ['pos', 88], 17: ['ocu', 46], 18: ['res', '21:30'], 19: ['ocu', 63],
  20: ['ocu', 22], 21: ['ocu', 55], 22: ['pos', 70], 23: ['ocu', 37], 24: ['cue', 91]
};
B.HEAT = { 1: 26.8, 2: 27.9, 3: 25.4, 4: 28.6, 5: 29.9, 6: 27.2, 7: 39.6, 8: 41.2, 9: 40.4, 10: 38.8, 11: 42.1, 12: 46.8, 14: 38.2, 15: 39.9, 16: 44.1, 17: 49.6, 18: 51.2, 19: 47.9, 20: 48.3, 21: 41.0, 22: 35.2, 23: 36.8, 24: 37.9 };

/* ---------- stock para el fin de semana ---------- */
B.STOCK = [
  { d: 'chuleton', n: 'Chuletón de vaca madurada 45 d', prov: 'Carnes Ortiz', u: 'kg', v: [6.5, 4.0, 9.2], need: [21.4, 17.3, 18.9], cubre: 'Sáb 14:30', dec: 1 },
  { d: 'carne', n: 'Solomillo de ternera', prov: 'Carnes Ortiz', u: 'kg', v: [3.1, 2.4, 2.2], need: [6.5, 5.2, 5.4], cubre: 'Sáb 15:10', dec: 1 },
  { d: 'pulpo', n: 'Pulpo cocido (patas)', prov: 'Pescados Rías Baixas', u: 'kg', v: [2.4, 1.8, 3.0], need: [6.0, 5.0, 5.5], cubre: 'Sáb 13:50', dec: 1 },
  { d: 'carne', n: 'Secreto ibérico de bellota', prov: 'Carnes Ortiz', u: 'kg', v: [4.8, 3.9, 5.1], need: [6.2, 5.6, 5.8], cubre: 'Sáb 22:00', dec: 1 },
  { d: 'carbon', n: 'Carbón de encina (saco 15 kg)', prov: 'Carbones La Encina', u: 'sacos', v: [3, 2, 4], need: [6, 5, 6], cubre: 'Sáb 21:30', dec: 0 },
  { d: 'burrata', n: 'Burrata 125 g', prov: 'Lácteos Campoazul', u: 'ud', v: [9, 6, 12], need: [16, 14, 14], cubre: 'Sáb 21:00', dec: 0 },
  { d: 'botella', n: 'Rioja crianza', prov: 'Vinos Laguardia', u: 'bot', v: [18, 11, 24], need: [30, 26, 28], cubre: 'Sáb 22:30', dec: 0 },
  { d: 'pimiento', n: 'Pimiento de padrón', prov: 'Huerta de Aranjuez', u: 'kg', v: [3.2, 2.1, 4.0], need: [4.5, 3.8, 4.2], cubre: 'Dom 13:00', dec: 1 },
  { d: 'patata', n: 'Patata agria', prov: 'Huerta de Aranjuez', u: 'kg', v: [22, 18, 25], need: [20, 16, 19], cubre: 'Lun 30', dec: 0 },
  { d: 'croqueta', n: 'Croquetas de jamón', prov: 'Obrador propio', u: 'ud', v: [140, 96, 180], need: [120, 110, 130], cubre: 'Dom 22:00', dec: 0 }
];

/* ---------- reservas ---------- */
B.RES_SLOTS = [
  { h: '13:30', v: [4, 3, 5] }, { h: '14:00', v: [5, 2, 4] }, { h: '14:30', v: [3, 2, 3] }, { h: '15:00', v: [1, 1, 0] },
  { h: '20:30', v: [1, 2, 1] }, { h: '21:00', v: [3, 4, 2] }, { h: '21:30', v: [3, 4, 1] }, { h: '22:00', v: [2, 2, 1] }
];
B.RES_DAYS = [
  { d: 'Vie 27', sub: 'esta noche', v: [9, 8, 7], occ: [96, 91, 86] },
  { d: 'Sáb 28', sub: 'comida y cena', v: [22, 20, 17], occ: [100, 94, 88] },
  { d: 'Dom 29', sub: 'comida', v: [16, 11, 16], occ: [78, 62, 81] }
];
B.CHANNELS = [
  { id: 'web', n: 'Web propia', v: 47, c: '#2F62E0', ic: 'globe', note: 'sin comisión' },
  { id: 'fork', n: 'TheFork', v: 39, c: '#9B8AFB', ic: 'fork', note: '≈ 340 € en comisiones' },
  { id: 'tel', n: 'Teléfono', v: 28, c: '#3FB2A6', ic: 'phone', note: 'atendidas en sala' },
  { id: 'google', n: 'Google', v: 12, c: '#C3C7CE', ic: 'pin', note: 'desde la ficha' }
];
B.RES_LIST = [
  { ch: 'web', n: 'Javier Ortega', p: 4, l: 1 - 1, d: 'Sáb 28 · 14:00', note: 'Trona', ago: '6 min' },
  { ch: 'tel', n: 'Pilar Domínguez', p: 2, l: 2, d: 'Sáb 28 · 21:00', note: 'Terraza', ago: '11 min' },
  { ch: 'fork', n: 'Hugo Sanz', p: 3, l: 0, d: 'Sáb 28 · 21:30', note: '', ago: '18 min' },
  { ch: 'web', n: 'Comida de empresa Lumen', p: 12, l: 1, d: 'Sáb 28 · 14:30', note: 'Menú cerrado', ago: '25 min' },
  { ch: 'google', n: 'Irene Calvo', p: 2, l: 2, d: 'Dom 29 · 14:30', note: 'Celíaca', ago: '31 min' },
  { ch: 'tel', n: 'Familia Robles', p: 7, l: 0, d: 'Dom 29 · 14:00', note: '2 tronas', ago: '44 min' },
  { ch: 'fork', n: 'Álvaro Méndez', p: 2, l: 1, d: 'Sáb 28 · 22:00', note: '', ago: '52 min' },
  { ch: 'web', n: 'Sofía Navarro', p: 5, l: 2, d: 'Sáb 28 · 13:30', note: 'Alergia al marisco', ago: '1 h' },
  { ch: 'web', n: 'Daniel Ferrer', p: 2, l: 0, d: 'Dom 29 · 15:00', note: 'Aniversario', ago: '1 h' }
];
B.RES_NEW = { ch: 'fork', n: 'Marta Gil', p: 6, l: 1, d: 'Sáb 28 · 21:30', note: 'Cumpleaños', ago: 'ahora' };

/* ---------- compras ---------- */
B.PROPUESTA = [
  { d: 'chuleton', n: 'Chuletón vaca madurada', q: 38.4, u: 'kg', pr: 26.4, prov: 'Carnes Ortiz' },
  { d: 'carne', n: 'Solomillo de ternera', q: 9.5, u: 'kg', pr: 34.8, prov: 'Carnes Ortiz' },
  { d: 'carne', n: 'Secreto ibérico', q: 3.0, u: 'kg', pr: 16.9, prov: 'Carnes Ortiz' },
  { d: 'carne', n: 'Entraña de ternera', q: 5.0, u: 'kg', pr: 18.5, prov: 'Carnes Ortiz' },
  { d: 'pulpo', n: 'Pulpo cocido (patas)', q: 9.5, u: 'kg', pr: 31.0, prov: 'Pescados Rías Baixas' },
  { d: 'carbon', n: 'Carbón de encina', q: 8, u: 'sacos', pr: 14.5, prov: 'Carbones La Encina' },
  { d: 'burrata', n: 'Burrata 125 g', q: 27, u: 'ud', pr: 2.3, prov: 'Lácteos Campoazul' },
  { d: 'botella', n: 'Rioja crianza', q: 36, u: 'bot', pr: 6.6, prov: 'Vinos Laguardia' },
  { d: 'pimiento', n: 'Pimiento de padrón', q: 3.5, u: 'kg', pr: 6.4, prov: 'Huerta de Aranjuez' }
];
B.PEDIDO = [
  { d: 'chuleton', n: 'Chuletón de vaca madurada 45 días', sub: 'Rubia gallega · piezas de 1,2 kg', q: 38.4, u: 'kg', pr: 26.4, rep: [14.4, 12.0, 12.0] },
  { d: 'carne', n: 'Solomillo de ternera', sub: 'Pieza entera limpia', q: 9.5, u: 'kg', pr: 34.8, rep: [3.5, 3.0, 3.0] },
  { d: 'carne', n: 'Entraña de ternera', sub: 'Fina, sin telilla', q: 5.0, u: 'kg', pr: 18.5, rep: [2.0, 1.5, 1.5] },
  { d: 'carne', n: 'Secreto ibérico de bellota', sub: 'Bandejas de 1 kg', q: 3.0, u: 'kg', pr: 16.9, rep: [1, 1, 1] },
  { d: 'chorizo', n: 'Chorizo criollo', sub: 'Elaboración del obrador', q: 4.0, u: 'kg', pr: 9.8, rep: [1.5, 1.5, 1.0] }
];

/* ---------- escandallo ---------- */
B.ESC = [
  { n: 'Chuletón de vaca madurada 45 d', q: '1,08 kg', pu: '26,40 €/kg', v: 28.51, c: '#2F62E0', nota: 'incluye 8 % de merma de limpieza' },
  { n: 'Pimientos de padrón', q: '0,12 kg', pu: '6,40 €/kg', v: 0.77, c: '#5B8CFF' },
  { n: 'Pan de masa madre (2)', q: '2 ud', pu: '0,28 €/ud', v: 0.56, c: '#9DB9FF' },
  { n: 'Patatas a la brasa', q: '0,30 kg', pu: '1,10 €/kg', v: 0.52, c: '#9B8AFB' },
  { n: 'Carbón de encina (prorrateo)', q: '0,45 kg', pu: '0,97 €/kg', v: 0.44, c: '#6B6F76' },
  { n: 'Sal en escamas y aceite', q: '—', pu: '', v: 0.31, c: '#D6D8DD' }
];

/* ---------- cuadrante (Malasaña) ---------- */
B.SHIFT = { M: [[11.5, 17]], T: [[19.5, 24.5]], P: [[12.5, 16.5], [20, 24]], C: [[18, 25.5]] };
// cada persona tiene su cara fija (assets/apps/caras): Lucía 3 · Iván 2 · Diego 4 · Nerea 6 · Óscar 5 · Rubén 8 · Claudia 1 · Andrés (proveedor) 7
B.STAFF = [
  ['Iván Morales', 'Jefe de sala', 'sala', ['L', 'P', 'P', 'P', 'P', 'T', 'M'], 2],
  ['Diego Ramos', 'Camarero', 'sala', ['M', 'M', 'M', 'L', 'T', 'T', 'M'], 4],
  ['Nerea Gil', 'Camarera · 30 h', 'sala', ['L', 'L', 'T', 'T', 'T', 'M', 'L'], 6],
  ['Óscar Prieto', 'Barra', 'barra', ['T', 'L', 'L', 'T', 'C', 'C', 'T'], 5],
  ['Rubén Castro', 'Jefe de parrilla', 'parrilla', ['L', 'P', 'P', 'P', 'P', 'P', 'L'], 8]
];
// el resto del equipo de cocina y office va agrupado en una fila (sin avatares)
B.STAFF_GRUPO = { n: 'Cocina, parrilla y office', sub: '6 personas · 214 h', days: ['P', 'P', 'P', 'P', 'P', 'P', 'P'] };
B.ROLE = { sala: ['#E6EEFF', '#2F62E0'], barra: ['#F1EEFF', '#6A55E0'], parrilla: ['#E6F6F4', '#1F8A80'], cocina: ['#EEF0F3', '#4B5058'], office: ['#F7F8FA', '#9A9EA6'] };

/* ---------- informe semanal ---------- */
B.FC = [33.1, 32.8, 32.9, 32.2, 31.9, 31.5, 31.0, 30.6, 30.1, 29.4]; // semanas 38..47
B.SEMDIA = [
  { d: 'Lun', v: [3.1, 2.6, 2.4] }, { d: 'Mar', v: [3.4, 2.9, 2.7] }, { d: 'Mié', v: [3.9, 3.2, 3.0] },
  { d: 'Jue', v: [4.6, 4.0, 3.6] }, { d: 'Vie', v: [7.8, 7.0, 6.1] }, { d: 'Sáb', v: [9.4, 8.6, 7.9] }, { d: 'Dom', v: [6.9, 5.4, 6.4] }
];
B.MERMA = [
  { n: 'Pan', v: 4.8, e: 61 }, { n: 'Pescado', v: 3.4, e: 186 }, { n: 'Verdura', v: 2.6, e: 94 },
  { n: 'Carne', v: 2.1, e: 412 }, { n: 'Postres', v: 1.2, e: 22 }, { n: 'Bebida', v: 0.4, e: 35 }
];
})();
