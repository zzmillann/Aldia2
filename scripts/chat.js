/* ALDIA — Asistente: primero botones, después IA (n8n) */
(function () {
  const WEBHOOK_URL = 'https://n8n.srv1623151.hstgr.cloud/webhook/aldia-web-asistente';
  const LEAD_WEBHOOK = 'https://n8n.srv1623151.hstgr.cloud/webhook/aldia-web-leads';
  // los mensajes se guardan en Smart Connect › Mensajes web (el flujo de n8n sigue recibiéndolos igual)
  const CONTACTO = 'https://aldiasmart.pages.dev/api/contacto';
  const DISCORD = 'https://discord.gg/huftNymgT';

  let sessionId;
  try {
    sessionId = localStorage.getItem('aldia_chat_session');
    if (!sessionId) { sessionId = 'aldia_' + Math.random().toString(36).slice(2, 11); localStorage.setItem('aldia_chat_session', sessionId); }
  } catch (e) { sessionId = 'aldia_' + Math.random().toString(36).slice(2, 11); }

  const ico = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'
  };

  document.body.insertAdjacentHTML('beforeend', `
    <button id="ac-trigger" aria-label="Abrir el asistente de Aldia"><img class="abot3d" src="./assets/bot/aldia-bot.webp?v=1124c" alt="" width="96" height="96" draggable="false"></button>
    <section id="ac-win" role="dialog" aria-label="Asistente de Aldia" aria-hidden="true">
      <header class="ac-head">
        <img src="./assets/logo-circulo.png" alt="">
        <div><b>Asistente Aldia</b><small><i></i>Responde al momento</small></div>
        <button class="ac-icon" id="ac-reset" aria-label="Empezar de nuevo" title="Empezar de nuevo">${ico.reset}</button>
        <button class="ac-icon" id="ac-close" aria-label="Cerrar">${ico.close}</button>
      </header>
      <div class="ac-msgs" id="ac-msgs" aria-live="polite"></div>
      <div class="ac-quick" id="ac-quick"></div>
      <form class="ac-input" id="ac-form">
        <input id="ac-text" type="text" placeholder="Escribe tu pregunta…" autocomplete="off" aria-label="Mensaje">
        <button type="submit" aria-label="Enviar">${ico.send}</button>
      </form>
    </section>`);

  const win = document.getElementById('ac-win');
  const trig = document.getElementById('ac-trigger');
  const msgs = document.getElementById('ac-msgs');
  const quick = document.getElementById('ac-quick');
  const form = document.getElementById('ac-form');
  const input = document.getElementById('ac-text');
  let started = false;
  let mode = 'menu';           // menu | ia | lead-name | lead-email
  const lead = {};

  const open = () => {
    win.classList.add('is-open'); win.setAttribute('aria-hidden', 'false'); trig.classList.add('is-hidden');
    if (!started) { started = true; start(); }
    setTimeout(() => input.focus(), 250);
  };
  const close = () => { win.classList.remove('is-open'); win.setAttribute('aria-hidden', 'true'); trig.classList.remove('is-hidden'); };
  trig.addEventListener('click', open);
  document.getElementById('ac-close').addEventListener('click', close);
  document.getElementById('ac-reset').addEventListener('click', () => { msgs.innerHTML = ''; mode = 'menu'; start(); });
  window.AldiaChat = { open };

  const scroll = () => { msgs.scrollTop = msgs.scrollHeight; };
  const add = (role, html, isHtml) => {
    const d = document.createElement('div'); d.className = 'ac-msg ac-' + role;
    if (isHtml) d.innerHTML = html; else d.textContent = html;
    msgs.appendChild(d); scroll(); return d;
  };
  const typing = () => { const d = add('bot', '<span></span><span></span><span></span>', true); d.classList.add('ac-typing'); return d; };
  const say = (html, delay = 450) => new Promise(r => { const t = typing(); setTimeout(() => { t.remove(); add('bot', html, true); r(); }, delay); });

  const setQuick = list => {
    quick.innerHTML = '';
    list.forEach(o => {
      const b = document.createElement(o.href ? 'a' : 'button');
      b.className = 'ac-chip' + (o.primary ? ' is-primary' : '');
      b.textContent = o.label;
      if (o.href) { b.href = o.href; if (o.blank) { b.target = '_blank'; b.rel = 'noopener'; } }
      else b.type = 'button';
      b.addEventListener('click', () => { if (!o.href) { add('user', o.label); o.run(); } });
      quick.appendChild(b);
    });
  };

  const MENU = [
    { label: 'Quiero una auditoría', run: audit, primary: true },
    { label: '¿Qué hacéis?', run: services },
    { label: 'Unirme a la comunidad', run: community },
    { label: 'Tengo otra pregunta', run: askAI }
  ];

  async function start() {
    setQuick([]);
    await say('Hola, soy el asistente de <b>Aldia</b>.', 300);
    await say('Auditamos empresas y automatizamos lo que les quita tiempo. ¿En qué te ayudo?');
    setQuick(MENU);
  }

  async function audit() {
    setQuick([]);
    await say('La auditoría es gratuita: respondes 4 preguntas (2 min) y eliges hora para una llamada de 45 min.');
    setQuick([
      { label: 'Empezar auditoría →', href: 'auditoria', primary: true },
      { label: 'Prefiero que me llaméis', run: leadStart },
      { label: 'Volver', run: back }
    ]);
  }

  async function services() {
    setQuick([]);
    await say('Hacemos cuatro cosas, siempre después de auditar:<br>• <b>Automatización con IA</b><br>• <b>Agentes y chatbots</b> (como yo)<br>• <b>Apps a medida</b><br>• <b>Webs que convierten</b><br>Y lanzamos nuestras propias <b>apps SaaS</b>.');
    setQuick([
      { label: 'Ver servicios', href: 'servicios' },
      { label: 'Ver portfolio SaaS', href: 'saas' },
      { label: 'Quiero una auditoría', run: audit, primary: true },
      { label: 'Volver', run: back }
    ]);
  }

  async function community() {
    setQuick([]);
    await say('<b>Aldia Community</b> es nuestro Discord gratuito: noticias de IA, herramienta de la semana, retos y plantillas de flujos.');
    setQuick([
      { label: 'Entrar en Discord', href: DISCORD, blank: true, primary: true },
      { label: 'Qué hay dentro', href: 'comunidad' },
      { label: 'Volver', run: back }
    ]);
  }

  async function askAI() {
    mode = 'ia'; setQuick([{ label: 'Volver al menú', run: back }]);
    await say('Claro, pregúntame lo que quieras sobre Aldia y te respondo.');
    input.focus();
  }

  async function leadStart() {
    mode = 'lead-name'; setQuick([{ label: 'Cancelar', run: back }]);
    await say('Perfecto. ¿Cómo te llamas?');
    input.placeholder = 'Tu nombre'; input.focus();
  }

  async function back() { mode = 'menu'; input.placeholder = 'Escribe tu pregunta…'; setQuick([]); await say('¿Algo más en lo que te ayude?', 250); setQuick(MENU); }

  async function sendLead() {
    const body = JSON.stringify({
      nombre: lead.nombre, email: lead.email, telefono: 'No proporcionado',
      mensaje: 'Pide que le contactemos desde el asistente de la web', fecha: new Date().toLocaleString('es-ES'), origen: 'Asistente web'
    });
    const post = url => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => { /* el flujo puede responder sin CORS aunque lo reciba */ });
    await Promise.all([post(CONTACTO), post(LEAD_WEBHOOK)]);
  }

  async function askN8n(text) {
    const t = typing();
    try {
      const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/plain, */*' }, body: JSON.stringify({ chatInput: text, sessionId }), signal: ctrl.signal });
      if (!res.ok) throw new Error(res.status);
      const ct = res.headers.get('content-type') || '';
      let reply = '';
      if (ct.includes('application/json')) { const d = await res.json(); reply = d.output || d.response || d.text || ''; }
      else reply = await res.text();
      t.remove(); add('bot', reply || 'No me ha llegado una respuesta clara. ¿Lo reformulas?');
    } catch (e) {
      t.remove(); add('bot', 'Ahora mismo no consigo conectar. Si quieres, déjame tu email y te escribimos nosotros.');
      setQuick([{ label: 'Dejar mi email', run: leadStart, primary: true }, { label: 'Volver al menú', run: back }]);
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const val = input.value.trim(); if (!val) return;
    add('user', val); input.value = '';

    if (mode === 'lead-name') {
      lead.nombre = val; mode = 'lead-email'; input.placeholder = 'tu@empresa.com';
      await say(`Encantado, ${val.split(' ')[0]}. ¿A qué email te escribimos?`);
      return;
    }
    if (mode === 'lead-email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { await say('Ese email no parece válido. ¿Lo revisas?'); return; }
      lead.email = val; mode = 'menu'; input.placeholder = 'Escribe tu pregunta…';
      sendLead();
      await say('¡Hecho! Te escribimos en menos de 24 h laborables. Si quieres adelantar, puedes rellenar ya la auditoría.');
      setQuick([{ label: 'Rellenar auditoría', href: 'auditoria', primary: true }, { label: 'Volver al menú', run: back }]);
      return;
    }
    if (mode === 'menu') { mode = 'ia'; setQuick([{ label: 'Volver al menú', run: back }]); }
    askN8n(val);
  });
})();
