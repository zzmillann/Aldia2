/* ALDIA — Comunidad, «Un sitio para crecer»: piezas de Discord vivas.
   · #empleo (foro): entran publicaciones de ejemplo y llega un mensaje directo de una empresa.
   · Barra lateral: canales por área que se marcan como no leídos y un canal de voz con gente hablando.
   · Eventos: alguien pulsa «Interesado» y sube el contador.
   Todo se para cuando no se ve y respeta «reducir movimiento». */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const face = n => `./assets/apps/caras/cara${n}.webp`;
  // más caras reales (Unsplash, ver assets/community/fotos/CREDITOS.md)
  const AV = ['a01', 'a02', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a12', 'a13', 'a14', 'a15', 'a21', 'a22', 'a23'];
  const av = i => `./assets/community/fotos/${AV[i % AV.length]}.webp`;
  // ejecuta fn cada ms solo mientras el elemento esté a la vista
  const whileVisible = (el, ms, fn) => {
    let t = 0;
    new IntersectionObserver(([e]) => {
      clearInterval(t);
      if (e.isIntersecting && !reduce) t = setInterval(fn, ms);
    }, { threshold: .2 }).observe(el);
  };
  const ICON = {
    msg: '<svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z"/></svg>'
  };

  /* ---------- #empleo ---------- */
  const forum = document.querySelector('[data-cxj]');
  if (forum) {
    const list = forum.querySelector('[data-cxj-list]'), dm = forum.querySelector('[data-cxj-dm]');
    const POSTS = [
      { t: 'Técnico/a de automatización con n8n', by: 'laura.rrhh', f: 6, tags: [['Híbrido', '#5865F2'], ['Junior', '#19A974'], ['Valencia', '#949BA4']], r: 14, v: [1, 4, 8] },
      { t: 'Busco prácticas en análisis de datos (Power BI, SQL)', by: 'ane.datos', f: 3, tags: [['Prácticas', '#F5A524'], ['Datos', '#19A974']], r: 9, v: [2, 7, 5] },
      { t: 'Pentester junior para consultora en Barcelona', by: 'sergio.sec', f: 2, tags: [['Ciberseguridad', '#E5484D'], ['Presencial', '#949BA4']], r: 21, v: [5, 8, 3] },
      { t: 'Ingeniero/a de IA aplicada · startup de salud', by: 'marta.ops', f: 1, tags: [['IA', '#8B5CF6'], ['Remoto', '#5865F2']], r: 18, v: [4, 6, 2] },
      { t: 'Smart contracts en Solidity · 100 % remoto', by: 'pablo.web3', f: 8, tags: [['Blockchain', '#F5A524'], ['Remoto', '#5865F2']], r: 7, v: [7, 1, 4] },
      { t: 'Mi portfolio de flujos con IA: ¿qué mejoraríais?', by: 'javi.dev', f: 4, tags: [['Revisión de CV', '#2F62E0'], ['IA', '#8B5CF6']], r: 26, v: [3, 6, 8] }
    ];
    const AGO = ['ahora', 'hace 12 min', 'hace 1 h'];
    const post = p => {
      const li = document.createElement('li'); li.className = 'dz__post';
      li.innerHTML = `<div><div class="dz__pt">${p.tags.map(([t, c]) => `<em style="--c:${c}">${t}</em>`).join('')}</div>
        <b>${p.t}</b><span class="dz__by"><img src="${face(p.f)}" alt="" width="20" height="20"><strong>${p.by}</strong><span data-ago></span></span></div>
        <div class="dz__meta"><span class="dz__faces">${p.v.map(n => `<img src="${face(n)}" alt="" width="20" height="20" loading="lazy">`).join('')}</span><span>${ICON.msg}${p.r}</span></div>`;
      return li;
    };
    const SHOW = innerWidth < 600 ? 3 : 5; let k = 0;
    const stamp = () => [...list.children].forEach((li, i) => { const s = li.querySelector('[data-ago]'); if (s) s.textContent = '· ' + (AGO[i] || 'hace 3 h'); });
    for (let i = SHOW - 1; i >= 0; i--) list.appendChild(post(POSTS[i]));
    k = SHOW; stamp();
    // altura fija: al entrar una oferta, la última sale por abajo sin que cambie el alto de la tarjeta
    const lock = () => { list.style.height = ''; list.style.height = list.offsetHeight + 'px'; };
    lock(); addEventListener('resize', lock); addEventListener('load', lock); if (document.fonts) document.fonts.ready.then(lock);
    // desliza las publicaciones hacia abajo con suavidad (FLIP)
    const flip = fn => {
      const before = new Map([...list.children].map(el => [el, el.getBoundingClientRect().top]));
      fn();
      [...list.children].forEach(el => {
        const t0 = before.get(el); if (t0 === undefined) return;
        const dy = t0 - el.getBoundingClientRect().top; if (!dy) return;
        el.style.transition = 'none'; el.style.transform = `translateY(${dy}px)`;
        el.offsetWidth; el.style.transition = ''; el.style.transform = '';
      });
    };
    let tick = 0;
    whileVisible(forum, 3400, () => {
      tick++;
      const li = post(POSTS[k++ % POSTS.length]); li.classList.add('is-new');
      flip(() => list.prepend(li)); stamp();
      li.offsetWidth; setTimeout(() => { li.classList.remove('is-new'); li.classList.add('is-new-in'); }, 30);
      const old = list.children[SHOW]; if (old) { old.classList.add('is-out'); setTimeout(() => old.remove(), 650); }
      // cada tres publicaciones, una empresa escribe por privado y luego se va
      if (dm && tick % 3 === 2) { dm.classList.add('is-on'); setTimeout(() => dm.classList.remove('is-on'), 3000); }
    });
  }

  /* ---------- barra lateral: no leídos y voz ---------- */
  const side = document.querySelector('[data-cxs]');
  if (side) {
    const chans = [...side.querySelectorAll('.dz__cat a:not(.dz__voice)')];
    const voices = [...side.querySelectorAll('[data-vc]')];
    // como mucho dos canales sin leer a la vez: entra uno nuevo y el más antiguo se «lee» (se abre un momento)
    const setUnread = (a, on, count) => {
      const u = a.querySelector('[data-u]');
      a.classList.toggle('is-unread', on);
      a.classList.toggle('has-count', !!(on && count));
      if (u && on && count) u.textContent = count;
    };
    const queue = [];
    chans.forEach((a, idx) => { const n = +a.querySelector('[data-u]').textContent; if (n) { setUnread(a, true, n); queue.push(idx); } });
    const ORDER = [2, 4, 1, 7, 5, 0, 8, 3, 6];
    let o = 0;
    whileVisible(side, 1900, () => {
      side.querySelectorAll('.dz__cat a.is-active').forEach(x => x.classList.remove('is-active'));
      let next = ORDER[o++ % ORDER.length];
      if (next >= chans.length || queue.includes(next)) next = ORDER[o++ % ORDER.length] % chans.length;
      if (!queue.includes(next)) { setUnread(chans[next], true, o % 2 ? 1 + (o * 7) % 9 : 0); queue.push(next); }
      while (queue.length > 2) {
        const old = chans[queue.shift()];
        setUnread(old, false); old.classList.add('is-active');
      }
    });
    // quien habla en el canal de voz
    let v = 0;
    whileVisible(side, 900, () => {
      voices.forEach(x => x.classList.remove('is-talk'));
      const who = [0, 0, 1, 2, 2, 1, 0, 2][v++ % 8];
      if (Math.random() > .15) voices[who].classList.add('is-talk');
    });
  }

  /* ---------- eventos: «Interesado» ---------- */
  const ev = document.querySelector('[data-cxe]');
  if (ev) {
    const cards = [...ev.querySelectorAll('.dzev__card')];
    const START = [[0, 3, 6, 9], [1, 4, 7, 10], [2, 5, 8, 11]];
    cards.forEach((c, j) => { c.querySelector('[data-faces]').innerHTML = START[j].map(n => `<img src="${av(n)}" alt="" width="24" height="24">`).join(''); });
    let j = 0;
    whileVisible(ev, 2600, () => {
      const c = cards[j % cards.length]; j++;
      cards.forEach(x => x.classList.toggle('is-focus', x === c));
      const btn = c.querySelector('.dzev__btn'), n = c.querySelector('.dzev__n'), faces = c.querySelector('[data-faces]');
      btn.classList.add('is-press'); setTimeout(() => btn.classList.remove('is-press'), 180);
      setTimeout(() => {
        btn.classList.add('is-on'); btn.querySelector('span').textContent = 'Interesado';
        n.dataset.n = +n.dataset.n + 1; n.textContent = n.dataset.n;
        const img = document.createElement('img'); img.src = av(12 + j); img.alt = ''; img.width = img.height = 24; img.className = 'is-new';
        faces.prepend(img); img.offsetWidth; setTimeout(() => img.classList.remove('is-new'), 30);
        if (faces.children.length > 4) faces.lastElementChild.remove();
      }, 220);
      // al rato vuelve a estar libre para que la animación siga teniendo sentido
      setTimeout(() => btn.classList.remove('is-on'), 2300);
    });
  }
})();
