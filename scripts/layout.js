/* ALDIA — menú, footer y animaciones comunes a todas las páginas */
(function () {
  // Redes sociales: rellena la URL y aparecen solas en el footer. Vacías = ocultas.
  const SOCIAL = {
    discord:   'https://discord.gg/huftNymgT',
    linkedin:  '',
    instagram: '',
    tiktok:    '',
    youtube:   'https://www.youtube.com/channel/UCcpICB6kew9aQgBzzZUxtuw',
    x:         ''
  };
  const DISCORD = SOCIAL.discord;

  const ICONS = {
    discord: '<path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>',
    linkedin: '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
    instagram: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>',
    tiktok: '<path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
    youtube: '<path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>',
    x: '<path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z"/>'
  };

  const LINKS = [
    { href: 'index.html#aldia', label: 'Qué es Aldia', key: 'aldia' },
    { href: 'servicios.html', label: 'Servicios', key: 'servicios' },
    { href: 'saas.html', label: 'SaaS', key: 'saas' },
    { href: 'comunidad.html', label: 'Community', key: 'comunidad' }
  ];

  const page = document.body.dataset.page || '';
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  const brand = '<a href="index.html" class="nav__brand" aria-label="Aldia, inicio"><img src="./assets/logo-circulo.png" alt="" width="28" height="28">aldia</a>';

  const SERVICES = [
    { href: 'servicios.html#automatizacion', t: 'Automatización con IA', d: 'Flujos que trabajan solos entre tus herramientas.', img: 'automatizacion.svg' },
    { href: 'servicios.html#agentes', t: 'Agentes y chatbots', d: 'Atienden, cualifican y reservan 24/7.', img: 'agentes.svg' },
    { href: 'servicios.html#apps', t: 'Apps a medida', d: 'Agendas, partes, stock o portales, a tu medida.', img: 'apps.svg' },
    { href: 'servicios.html#web', t: 'Webs que convierten', d: 'Rápidas, con SEO y conectadas a tu CRM.', img: 'web.svg' },
    { href: 'saas.html', t: 'SaaS de suscripción', d: 'Nuestras apps y cómo lanzamos la tuya.', img: 'saas.svg' }
  ];
  const card = s => `<a href="${s.href}" class="mcard"><span class="mcard__ico"><img src="./assets/iconos/${s.img}" alt=""></span><span><b>${s.t}</b><small>${s.d}</small></span></a>`;
  const glyph = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

  const nav = `
    <header class="nav" id="nav">
      <a href="index.html" class="nav__brand nav__brand--icon" aria-label="Aldia, inicio"><img src="./assets/logo-circulo.png" alt="Aldia" width="34" height="34"></a>
      <ul class="nav__links">
        ${LINKS.map(l => l.key === 'servicios'
          ? `<li class="has-drop"><a href="${l.href}" class="${l.key === page ? 'is-active' : ''}">${l.label}<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></a>
               <div class="drop"><div class="drop__grid">${SERVICES.map(card).join('')}</div></div></li>`
          : `<li><a href="${l.href}" class="${l.key === page ? 'is-active' : ''}${l.key === 'comunidad' ? ' nav-dc' : ''}">${l.key === 'comunidad' ? `<span class="nav-dc__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor">${ICONS.discord}</svg></span>` : ''}${l.label}</a></li>`).join('')}
      </ul>
      <div class="nav__cta">
        <a href="${DISCORD}" target="_blank" rel="noopener" class="btn btn--line btn--sm">Únete a la comunidad</a>
        <a href="auditoria.html" class="btn btn--dark btn--sm nav__audit">Pedir auditoría</a>
        <button class="nav__burger" id="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="mnav">
          <span></span><span></span>
        </button>
      </div>
    </header>
    <nav class="mnav" id="mnav" aria-label="Menú">
      <div class="mnav__scroll">
        <p class="mnav__label">Aldia</p>
        <a href="index.html#aldia" class="mcard"><span class="mcard__ico">${glyph('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>')}</span><span><b>Qué es Aldia</b><small>Quiénes somos y cómo pensamos.</small></span></a>
        <a href="index.html#como-trabajamos" class="mcard"><span class="mcard__ico">${glyph('<path d="M4 6h16M4 12h10M4 18h6"/>')}</span><span><b>Cómo trabajamos</b><small>Todo empieza por una auditoría.</small></span></a>
        <p class="mnav__label">Servicios</p>
        ${SERVICES.map(card).join('')}
        <p class="mnav__label">Community</p>
        <a href="comunidad.html" class="mcard mcard--accent"><span class="mcard__ico"><svg viewBox="0 0 24 24" fill="currentColor">${ICONS.discord}</svg></span><span><b>Aldia Community</b><small>Gratis en Discord: retos, herramientas y noticias de IA.</small></span></a>
      </div>
      <div class="mnav__foot">
        <a href="auditoria.html" class="btn btn--dark">Pedir auditoría gratuita ${arrow}</a>
      </div>
    </nav>`;

  const socials = Object.entries(SOCIAL).filter(([, url]) => url)
    .map(([k, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${k}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></a>`).join('');

  const footer = `
    <footer class="footer">
      <div class="wrap">
        <div class="footer__top">
          <div class="footer__brand">
            ${brand}
            <p>Auditamos cómo trabaja tu empresa y construimos la tecnología que hace el trabajo repetitivo por ti.</p>
            <div class="social">${socials}</div>
          </div>
          <div>
            <h5>Aldia</h5>
            <ul>
              <li><a href="index.html#aldia">Qué es Aldia</a></li>
              <li><a href="index.html#como-trabajamos">Cómo trabajamos</a></li>
              <li><a href="auditoria.html">Pedir auditoría</a></li>
            </ul>
          </div>
          <div>
            <h5>Servicios</h5>
            <ul>
              <li><a href="servicios.html#automatizacion">Automatización con IA</a></li>
              <li><a href="servicios.html#agentes">Agentes y chatbots</a></li>
              <li><a href="servicios.html#apps">Apps a medida</a></li>
              <li><a href="servicios.html#web">Webs que convierten</a></li>
              <li><a href="saas.html">SaaS de suscripción</a></li>
            </ul>
          </div>
          <div>
            <h5>Community</h5>
            <ul>
              <li><a href="comunidad.html">Aldia Community</a></li>
              <li><a href="${DISCORD}" target="_blank" rel="noopener">Entrar en Discord</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__word" aria-hidden="true">aldia<span class="fw-dot"></span></div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} Aldia Project</span>
          <nav>
            <a href="privacidad.html">Privacidad</a>
            <a href="cookies.html">Cookies</a>
            <a href="#" data-cookies>Configurar cookies</a>
            <a href="condiciones.html">Condiciones</a>
            <a href="aviso-legal.html">Aviso legal</a>
          </nav>
        </div>
      </div>
    </footer>`;

  document.body.insertAdjacentHTML('afterbegin', nav);
  document.body.insertAdjacentHTML('beforeend', footer);

  // Menú móvil
  const burger = document.getElementById('burger');
  const mnav = document.getElementById('mnav');
  const setMenu = open => {
    mnav.classList.toggle('is-open', open);
    document.getElementById('nav').classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!mnav.classList.contains('is-open')));
  mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Sombra del menú al hacer scroll
  const navEl = document.getElementById('nav');
  const onScroll = () => navEl.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Enlaces a Discord marcados con data-discord
  document.querySelectorAll('[data-discord]').forEach(a => { a.href = DISCORD; a.target = '_blank'; a.rel = 'noopener'; });

  // Entrada al hacer scroll + contadores
  const countUp = el => {
    const target = parseFloat(el.dataset.count); const dur = 1800; const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1); const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * e).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    en.target.querySelectorAll('[data-count]').forEach(countUp);
    en.target.querySelectorAll('.stat__bars i').forEach(b => { b.style.height = b.dataset.h + '%'; });
    io.unobserve(en.target);
  }), { threshold: .2 });
  document.querySelectorAll('.reveal, .stat').forEach(el => io.observe(el));

  // Vídeos: 4K en pantallas grandes, 1440p en el resto
  window.AldiaHQ = v => {
    if (v.dataset.loaded) return;
    const big = Math.max(screen.width, screen.height) * (devicePixelRatio || 1) >= 2560;
    const src = (big && v.dataset.src4k) || v.dataset.srcHd || v.dataset.src4k;
    if (src) { v.dataset.loaded = 1; v.src = src; v.play && v.play().catch(() => {}); }
  };
  // solo los que se ven: los de pestañas ocultas se cargan al mostrarlas
  const loadVisible = () => document.querySelectorAll('video[data-hq]').forEach(v => { if (!v.closest('[hidden]')) window.AldiaHQ(v); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadVisible); else setTimeout(loadVisible, 0);

  // Aviso de cookies (consentimiento guardado en este navegador)
  const CK = 'aldia_cookies_v1';
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(CK) || 'null'); } catch (e) {}
  document.body.insertAdjacentHTML('beforeend', `
    <section class="ck" id="ck" role="dialog" aria-live="polite" aria-label="Preferencias de cookies">
      <div class="ck__row">
        <span class="ck__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5-5 4 4 0 0 1-4-4z"/><path d="M8.5 11.5h.01M12 16h.01M15.5 13h.01"/></svg></span>
        <p class="ck__txt"><b>Solo las cookies necesarias.</b> El resto, si tú quieres. <a href="cookies.html">Más info</a></p>
        <div class="ck__btns">
          <button class="ck__b" data-ck="cfg">Ajustes</button>
          <button class="ck__b" data-ck="no">Rechazar</button>
          <button class="ck__b ck__b--ok" data-ck="ok">Aceptar</button>
        </div>
      </div>
      <div class="ck__more"><div>
        <div class="ck__cats">
          <label class="ck__cat"><div><b>Necesarias</b><small>Hacen que la web funcione y guardan esta elección.</small></div><span class="ck__sw"><input type="checkbox" checked disabled><span></span></span></label>
          <label class="ck__cat"><div><b>Análisis</b><small>Estadísticas anónimas de uso. Ahora no hay ninguna activa.</small></div><span class="ck__sw"><input type="checkbox" data-cat="analitica"><span></span></span></label>
          <label class="ck__cat"><div><b>Marketing</b><small>Medir campañas en redes. Ahora no hay ninguna activa.</small></div><span class="ck__sw"><input type="checkbox" data-cat="marketing"><span></span></span></label>
        </div>
        <div class="ck__save"><button class="ck__b ck__b--ok" data-ck="save">Guardar selección</button></div>
      </div></div>
    </section>`);
  const ck = document.getElementById('ck');
  const store = v => { try { localStorage.setItem(CK, JSON.stringify({ ...v, fecha: Date.now() })); } catch (e) {} ck.classList.remove('is-on', 'is-open'); };
  ck.addEventListener('click', e => {
    const a = e.target.closest('[data-ck]'); if (!a) return;
    const cats = () => Object.fromEntries([...ck.querySelectorAll('[data-cat]')].map(i => [i.dataset.cat, i.checked]));
    if (a.dataset.ck === 'cfg') ck.classList.toggle('is-open');
    if (a.dataset.ck === 'ok') store({ analitica: true, marketing: true });
    if (a.dataset.ck === 'no') store({ analitica: false, marketing: false });
    if (a.dataset.ck === 'save') store(cats());
  });
  if (!saved) setTimeout(() => ck.classList.add('is-on'), 900);
  // Reabrir desde cualquier enlace con data-cookies (p. ej. en la página de cookies)
  document.querySelectorAll('[data-cookies]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); ck.classList.add('is-on', 'is-open'); }));
})();

// Community en el menú: al pulsar, el logo de Discord entra con un giro y luego se navega
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a.nav-dc'); if (!a || a.classList.contains('is-active') || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  e.preventDefault(); a.classList.add('is-going'); setTimeout(() => { location.href = a.href; }, 650);
});
