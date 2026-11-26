// SEO de aldiaproject.es: metas de compartir, canónica, títulos, JSON-LD, URLs limpias, sitemap y robots.
// Idempotente: el bloque va entre <!-- SEO --> y <!-- /SEO --> y se rehace en cada pasada.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const SITE = 'https://aldiaproject.es';
const HOY = '2026-11-26';
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const wr = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const ORG_ID = SITE + '/#org', WEB_ID = SITE + '/#website';
const ORG = {
  '@type': 'Organization', '@id': ORG_ID, name: 'Aldia', alternateName: 'Aldia Project', url: SITE + '/',
  logo: { '@type': 'ImageObject', url: SITE + '/android-chrome-512x512.png', width: 512, height: 512 },
  image: SITE + '/assets/og/og-inicio.png',
  description: 'Auditamos cómo trabaja tu empresa y construimos las automatizaciones, agentes de IA y apps que hacen el trabajo repetitivo por ti.',
  sameAs: ['https://www.linkedin.com/company/aldia-project/', 'https://www.youtube.com/channel/UCcpICB6kew9aQgBzzZUxtuw'],
  knowsAbout: ['Automatización de procesos', 'Inteligencia artificial', 'n8n', 'Agentes de IA', 'Chatbots de WhatsApp', 'Desarrollo de aplicaciones a medida', 'Desarrollo web', 'SaaS']
};
const WEBSITE = { '@type': 'WebSite', '@id': WEB_ID, url: SITE + '/', name: 'Aldia', inLanguage: 'es-ES', publisher: { '@id': ORG_ID } };
const ES = { '@type': 'Country', name: 'España' };

const SERVICIOS = [
  { id: 'automatizacion', name: 'Automatización con IA', type: 'Automatización de procesos con IA',
    d: 'Facturas, cobros, pedidos, citas y emails: lo que tu equipo repite cada semana, hecho solo entre tus herramientas.' },
  { id: 'agentes', name: 'Agentes y chatbots', type: 'Agentes de IA y chatbots',
    d: 'Atienden, consultan disponibilidad, reservan y cobran por WhatsApp, web o Telegram, a cualquier hora.' },
  { id: 'apps', name: 'Apps a medida', type: 'Desarrollo de aplicaciones a medida',
    d: 'Agendas, partes de trabajo, órdenes de fabricación o portales de cliente: la app que tu negocio necesita, a su medida.' },
  { id: 'web', name: 'Webs que convierten', type: 'Diseño y desarrollo web',
    d: 'Rápidas, con SEO técnico y cada formulario conectado a tu CRM o a n8n.' }
];
const SAAS = { name: 'SaaS de suscripción', type: 'Desarrollo de SaaS',
  d: 'Producto, pagos recurrentes con Stripe, panel de administración y métricas. Del prototipo al primer cobro.' };
const service = (s, url) => ({ '@type': 'Service', name: s.name, serviceType: s.type, description: s.d, url, provider: { '@id': ORG_ID }, areaServed: ES });

const faq = html => {
  const qa = [...html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)]
    .map(m => ({ '@type': 'Question', name: plain(m[1]), acceptedAnswer: { '@type': 'Answer', text: plain(m[2]) } }));
  return qa.length ? { '@type': 'FAQPage', mainEntity: qa } : null;
};
const crumbs = (name, url) => ({ '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' },
  { '@type': 'ListItem', position: 2, name, item: url }] });

// slug → ruta limpia publicada (Cloudflare Pages quita el .html)
const PAGES = {
  'index.html': { url: '/', og: 'inicio', main: true,
    title: 'Aldia — Auditoría, automatización e IA para empresas' },
  'servicios.html': { url: '/servicios', og: 'servicios', main: true, crumb: 'Servicios',
    title: 'Automatización con IA, chatbots y apps a medida — Aldia',
    desc: 'Automatizamos facturas, pedidos y citas con IA, montamos agentes que atienden por WhatsApp 24/7, apps a medida y webs conectadas a tu CRM. Con casos reales.' },
  'saas.html': { url: '/saas', og: 'saas', main: true, crumb: 'SaaS',
    title: 'Desarrollo de SaaS: de la idea al primer cobro — Aldia',
    desc: 'Diseñamos, construimos y lanzamos tu SaaS de suscripción: producto, cuentas, pagos con Stripe, panel de administración y métricas. Del prototipo al primer cobro.' },
  'comunidad.html': { url: '/comunidad', og: 'comunidad', main: true, crumb: 'Aldia Community',
    title: 'Aldia Community: comunidad gratuita de IA y automatización' },
  'auditoria.html': { url: '/auditoria', og: 'auditoria', main: true, crumb: 'Pedir auditoría',
    title: 'Auditoría gratuita de automatización con IA — Aldia' },
  'privacidad.html': { url: '/privacidad', og: 'inicio', title: 'Política de privacidad — Aldia',
    desc: 'Cómo trata Aldia los datos personales de quien visita la web, pide una auditoría o entra en la comunidad.' },
  'cookies.html': { url: '/cookies', og: 'inicio', title: 'Política de cookies — Aldia',
    desc: 'Qué cookies usa aldiaproject.es, para qué sirven y cómo cambiar tu elección.' },
  'condiciones.html': { url: '/condiciones', og: 'inicio', title: 'Condiciones generales — Aldia',
    desc: 'Condiciones generales de contratación de los servicios de Aldia.' },
  'aviso-legal.html': { url: '/aviso-legal', og: 'inicio', title: 'Aviso legal — Aldia',
    desc: 'Datos del titular de aldiaproject.es y condiciones de uso de la web.' }
};
const OG_ALT = {
  inicio: 'Aldia: Automatiza hoy. Lidera mañana.',
  servicios: 'Aldia: El trabajo repetitivo, hecho solo.',
  saas: 'Aldia: De la idea al primer cobro.',
  comunidad: 'Aldia Community: gratis en Discord.',
  auditoria: 'Aldia: ¿Cuántas horas pierde tu equipo?'
};

function jsonld(file, p, html, url, title, desc) {
  const page = { '@type': 'WebPage', '@id': url + '#webpage', url, name: title, description: desc, inLanguage: 'es-ES',
    isPartOf: { '@id': WEB_ID }, about: { '@id': ORG_ID }, primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/assets/og/og-${p.og}.png` } };
  const g = [page];
  if (file === 'index.html') {
    g.unshift({ ...ORG, hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Servicios de Aldia', itemListElement: [
      ...SERVICIOS.map(s => ({ '@type': 'Offer', itemOffered: service(s, `${SITE}/servicios#${s.id}`) })),
      { '@type': 'Offer', itemOffered: service(SAAS, `${SITE}/saas`) }] } }, WEBSITE);
  } else {
    g.push(crumbs(p.crumb, url));
    page.breadcrumb = { '@id': url + '#breadcrumb' };
    g[g.length - 1]['@id'] = url + '#breadcrumb';
  }
  if (file === 'servicios.html') g.push(...SERVICIOS.map(s => service(s, `${SITE}/servicios#${s.id}`)));
  if (file === 'saas.html') g.push(service(SAAS, url));
  if (file === 'auditoria.html') g.push({ '@type': 'Service', name: 'Auditoría de automatización', serviceType: 'Consultoría de automatización e IA',
    description: 'Llamada de 45 minutos en la que analizamos tus procesos y te decimos qué automatizar primero, cuánto cuesta y cuántas horas te devuelve.',
    url, provider: { '@id': ORG_ID }, areaServed: ES, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', url } });
  const f = faq(html); if (f) { f['@id'] = url + '#faq'; g.push(f); }
  return { '@context': 'https://schema.org', '@graph': g };
}

for (const [file, p] of Object.entries(PAGES)) {
  let html = rd(file);
  const url = SITE + p.url;
  html = html.replace(/\n?[ \t]*<!-- SEO -->[\s\S]*?<!-- \/SEO -->/, '');
  // título
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)}</title>`);
  // descripción: la nueva si la hay; si no, la que tenía
  const old = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1];
  const desc = p.desc || (old && old.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  if (!desc) throw new Error('sin descripción: ' + file);
  if (old !== undefined) html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  else html = html.replace(/(<title>[\s\S]*?<\/title>)/, `$1\n  <meta name="description" content="${esc(desc)}">`);
  const ogTitle = p.title.replace(/ — Aldia$/, '');
  const img = `${SITE}/assets/og/og-${p.og}.png`;
  const block = [
    '<!-- SEO -->',
    `<link rel="canonical" href="${url}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Aldia">`,
    `<meta property="og:locale" content="es_ES">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(ogTitle)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(OG_ALT[p.og])}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(ogTitle)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${img}">`,
    ...(p.main ? [`<script type="application/ld+json">${JSON.stringify(jsonld(file, p, html, url, p.title, desc)).replace(/</g, '\\u003c')}</script>`] : []),
    '<!-- /SEO -->'
  ].map(l => '  ' + l).join('\n');
  html = html.replace(/(<meta name="description" content="[^"]*">)/, `$1\n${block}`);
  wr(file, html);
  console.log('ok', file, '·', p.title.length, 'car. título ·', desc.length, 'car. descripción');
}

// páginas que no deben salir en Google
for (const f of ['correo.html', 'apps/brasa.html']) {
  let h = rd(f);
  if (!/<meta name="robots"/.test(h)) { h = h.replace(/(<title>[\s\S]*?<\/title>)/, '$1\n<meta name="robots" content="noindex">'); wr(f, h); console.log('noindex', f); }
}

// URLs limpias en los enlaces internos (evita la redirección 307 de Cloudflare en cada clic)
const NAMES = 'index|servicios|saas|comunidad|auditoria|privacidad|cookies|condiciones|aviso-legal';
const re = new RegExp(`(href=["']|href:\\s*['"])(?:\\./)?(${NAMES})\\.html(#[^"'\\s]*)?(?=["'])`, 'g');
const files = [...Object.keys(PAGES), ...fs.readdirSync(path.join(ROOT, 'scripts')).filter(f => f.endsWith('.js')).map(f => 'scripts/' + f)];
for (const f of files) {
  const h = rd(f);
  let n = 0;
  const out = h.replace(re, (m, pre, name, hash = '') => { n++; return pre + (name === 'index' ? './' : name) + hash; });
  if (n) { wr(f, out); console.log('enlaces', f, n); }
}

// sitemap + robots
const urls = Object.values(PAGES).map(p => `  <url><loc>${SITE}${p.url}</loc><lastmod>${HOY}</lastmod><priority>${p.main ? (p.url === '/' ? '1.0' : '0.8') : '0.2'}</priority></url>`);
wr('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
wr('robots.txt', `User-agent: *\nAllow: /\nDisallow: /scratch/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('sitemap.xml y robots.txt');
