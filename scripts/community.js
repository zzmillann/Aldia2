/* ALDIA — Vista previa del Discord y selector de perfiles */
(function () {
  const root = document.querySelector('[data-dsc]');
  if (root) {
    const chans = [...root.querySelectorAll('.dsc__ch[data-ch]')];
    const feeds = [...root.querySelectorAll('.dsc__feed')];
    const title = document.getElementById('dscTitle'), sub = document.getElementById('dscSub'), prog = document.getElementById('dscProg');
    const SUBS = [
      'Noticias de IA cada mañana · las 5 claves del día',
      'Herramienta del día a las 12:00 · qué es, para quién y cómo probarla hoy',
      'Modelos, tendencias e impacto en el trabajo · Pregunta del viernes a las 17:00',
      'Cada vídeo nuevo del canal de ALDIA, automáticamente'
    ];
    let i = 0, t0 = performance.now(), paused = false; const DUR = 8000;
    const go = n => {
      i = (n + chans.length) % chans.length;
      chans.forEach((c, k) => c.classList.toggle('is-active', k === i));
      feeds.forEach((f, k) => { f.classList.remove('is-active'); if (k === i) { void f.offsetWidth; f.classList.add('is-active'); } });
      const name = chans[i].textContent.replace(/\d+$/, '').trim();
      title.textContent = name;
      const inp = document.getElementById('dscInputName'); if (inp) inp.textContent = name;
      chans[i].querySelector('em')?.remove();
      sub.textContent = SUBS[i]; t0 = performance.now();
    };
    chans.forEach((c, k) => c.addEventListener('click', () => go(k)));
    root.addEventListener('pointerenter', () => paused = true);
    root.addEventListener('pointerleave', () => { paused = false; t0 = performance.now(); });
    let on = false;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }, { threshold: .3 }).observe(root);
    const loop = now => {
      if (on && !paused) { const p = Math.min((now - t0) / DUR, 1); prog.style.transform = `scaleX(${p})`; if (p >= 1) go(i + 1); }
      else if (paused) t0 = now - (parseFloat((prog.style.transform.match(/[\d.]+/) || [0])[0]) * DUR);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    // Reacciones que van subiendo poco a poco
    setInterval(() => {
      if (!on) return;
      const r = root.querySelectorAll('.dsc__feed.is-active [data-bump]');
      if (!r.length) return;
      const b = r[(Math.random() * r.length) | 0];
      b.textContent = +b.textContent + 1; b.parentElement.classList.remove('bump'); void b.offsetWidth; b.parentElement.classList.add('bump');
    }, 2600);
  }

  // Fondo del hero: malla de puntos muy sutil que se aparta del ratón
  const stage = document.getElementById('cstage'), cv = document.getElementById('cstageBg');
  if (stage && cv) {
    const ctx = cv.getContext('2d'), hero = document.getElementById('cstageHero');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W, H, pts = [], mx = -999, my = -999, on = true, tm = 0;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2); W = stage.clientWidth; H = stage.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = []; const G = 30;
      for (let y = G / 2; y < H; y += G) for (let x = G / 2; x < W; x += G) pts.push({ x, y, ox: x, oy: y, s: Math.random() });
    };
    const draw = () => {
      if (on) {
        tm += .006; ctx.clearRect(0, 0, W, H);
        for (const p of pts) {
          const dx = p.ox - mx, dy = p.oy - my, d = Math.hypot(dx, dy), R = 140;
          let tx = p.ox + Math.sin(tm + p.s * 6) * .6, ty = p.oy + Math.cos(tm + p.s * 6) * .6, a = .09;
          if (d < R && !reduce) { const f = (1 - d / R); tx += dx / (d || 1) * f * 10; ty += dy / (d || 1) * f * 10; a += f * .28; }
          p.x += (tx - p.x) * .08; p.y += (ty - p.y) * .08;
          ctx.fillStyle = `rgba(170,190,255,${a})`; ctx.fillRect(p.x - .75, p.y - .75, 1.5, 1.5);
        }
      }
      requestAnimationFrame(draw);
    };
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      if (hero && !reduce) { hero.style.setProperty('--rx', (((my / r.height) - .5) * -8).toFixed(2) + 'deg'); hero.style.setProperty('--ry', (((mx / r.width) - .5) * 10).toFixed(2) + 'deg'); }
    });
    stage.addEventListener('pointerleave', () => { mx = my = -999; });
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(stage);
    addEventListener('resize', size); size(); requestAnimationFrame(draw);
  }

  // Próxima publicación (hora de Madrid)
  const ag = document.querySelector('[data-agenda]');
  if (ag) {
    const EV = d => [{ h: 9, t: 'Noticias de IA', c: 'n' }, { h: 12, t: 'Herramienta del día', c: 't' }, ...(d === 4 ? [{ h: 17, t: 'Pregunta del viernes', c: 'q' }] : [])];
    const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const madrid = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const m = madrid(), today = (m.getDay() + 6) % 7, mins = m.getHours() * 60 + m.getMinutes(), secs = mins * 60 + m.getSeconds();
      for (let off = 0; off < 8; off++) {
        const d = (today + off) % 7, evs = EV(d).filter(e => off > 0 || e.h * 60 > mins);
        if (!evs.length) continue;
        const e = evs[0], diff = off * 1440 + e.h * 60 - mins, h = Math.floor(diff / 60), mm = diff % 60;
        ag.querySelector('[data-ag-what]').textContent = e.t;
        ag.querySelector('[data-ag-in]').textContent = `en ${h ? h + ' h ' : ''}${mm} min${off === 1 ? ' · mañana' : off > 1 ? ' · el ' + DAYS[d] : ''}`;
        const ds = off * 86400 + e.h * 3600 - secs, cd = ag.querySelector('[data-ag-cd]');
        if (cd) { cd.querySelector('[data-cd="h"]').textContent = pad(Math.floor(ds / 3600)); cd.querySelector('[data-cd="m"]').textContent = pad(Math.floor(ds % 3600 / 60)); const sb = cd.querySelector('[data-cd="s"]'), sv = pad(ds % 60); if (sb.textContent !== sv) { sb.textContent = sv; sb.classList.remove('tk'); void sb.offsetWidth; sb.classList.add('tk'); } }
        const w = ag.querySelector('[data-ag-when]'); if (w) w.textContent = `${off === 0 ? "Hoy" : off === 1 ? "Mañana" : "El " + DAYS[d]}, a las ${pad(e.h)}:00 (hora de Madrid)`;
        ag.querySelectorAll('.pub__it').forEach(it => it.classList.toggle('is-next', it.dataset.ev === e.c));
        break;
      }
    };
    tick(); setInterval(tick, 1000);
  }

  const who = document.querySelector('[data-who]');
  if (who) {
    const tabs = [...who.querySelectorAll('.who__tabs button')], panes = [...who.querySelectorAll('.who__pane')];
    tabs.forEach((t, k) => t.addEventListener('click', () => {
      tabs.forEach((x, j) => x.classList.toggle('is-active', j === k));
      panes.forEach((x, j) => { x.classList.remove('is-active'); if (j === k) { void x.offsetWidth; x.classList.add('is-active'); } });
    }));
  }
})();

/* «Para quién es»: perfiles con avance automático */
(function () {
  const g = document.querySelector('[data-who2]'); if (!g) return;
  const tabs = [...g.querySelectorAll('.who2__tab')], panes = [...g.querySelectorAll('.who2__pane')];
  let i = 0, hover = false;
  const go = n => { i = n % tabs.length; tabs.forEach((t, k) => t.classList.toggle('is-active', k === i));
    panes.forEach((p, k) => { p.classList.remove('is-active'); if (k === i) { void p.offsetWidth; p.classList.add('is-active'); } }); };
  tabs.forEach((t, k) => t.addEventListener('click', () => go(k)));
  g.addEventListener('pointerenter', () => hover = true); g.addEventListener('pointerleave', () => hover = false);
  setInterval(() => { if (!hover && g.getBoundingClientRect().top < innerHeight && g.getBoundingClientRect().bottom > 0) go(i + 1); }, 6000);
})();

/* Ejemplos de Discord: escribe, aparece, reacciones y relieve al pasar el ratón */
(function () {
  const ICO = {
    fire: '<path d="M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/>',
    up: '<path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 16.8 20H7"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>'
  };
  const RX = [[['fire', 14], ['up', 9], ['eye', 6]], [['up', 11], ['bulb', 7]], [['fire', 8], ['up', 12], ['bulb', 4]], [['bulb', 17], ['eye', 9]]];
  const TH = [6, 4, 9, 23];
  document.querySelectorAll('.st').forEach((st, i) => {
    const dc = st.querySelector('.st__dc'); if (!dc) return;
    dc.insertAdjacentHTML('afterbegin', '<div class="st__typing"><i></i><i></i><i></i><span>ALDIA está escribiendo…</span></div>');
    dc.insertAdjacentHTML('beforeend', `<div class="st__rx">${(RX[i] || RX[0]).map(([k, n], j) => `<span style="--d:${j * .09}s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg></span>`).join('')}<em>Ver hilo</em></div>`);
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { dc.classList.add('is-typing'); setTimeout(() => { dc.classList.remove('is-typing'); dc.classList.add('is-on'); }, 1100 + i * 120); o.disconnect(); } }, { threshold: .4 }).observe(dc);
    dc.addEventListener('pointermove', ev => { const r = dc.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
      dc.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`; dc.style.setProperty('--gx', (x + .5) * 100 + '%'); dc.style.setProperty('--gy', (y + .5) * 100 + '%'); });
    dc.addEventListener('pointerleave', () => { dc.style.transform = ''; });
  });
})();
