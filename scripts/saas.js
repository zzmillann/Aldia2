/* ALDIA — Página SaaS: panel en vivo, pestañas de «qué incluye» y calculadora */
(function () {
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Panel del hero: eventos de cobro que van entrando
  const feed = document.querySelector('[data-feed]');
  const mrr = document.querySelector('[data-live="mrr"]'), subs = document.querySelector('[data-live="subs"]');
  if (feed) {
    const EV = [['Nueva suscripción · Plan Pro', 49], ['Cambio a plan Equipo', 50], ['Nueva suscripción · Básico', 19], ['Renovación anual', 390], ['Nueva suscripción · Plan Pro', 49]];
    let m = 4820, s = 163, k = 0;
    setInterval(() => {
      const [t, v] = EV[k++ % EV.length];
      const d = document.createElement('div'); d.className = 'app__ev is-new';
      d.innerHTML = `<img src="./assets/logos/stripe.svg" alt=""><span>${t}</span><b>+${v} €</b>`;
      feed.prepend(d);
      while (feed.children.length > 2) feed.lastElementChild.remove();
      if (v < 100) { m += v; s += t.includes('Nueva') ? 1 : 0; }
      mrr.textContent = fmt(m); subs.textContent = s;
    }, 3200);
  }

  // Qué incluye: pestañas con avance automático
  const inc = document.querySelector('[data-inc]');
  if (inc) {
    const tabs = [...inc.querySelectorAll('.inc__tab')], panes = [...inc.querySelectorAll('.inc__pane')];
    let i = 0, timer, hover = false;
    const go = n => { i = (n + tabs.length) % tabs.length;
      tabs.forEach((t, k) => t.classList.toggle('is-active', k === i));
      panes.forEach((p, k) => { p.classList.remove('is-active'); if (k === i) { void p.offsetWidth; p.classList.add('is-active'); } }); };
    tabs.forEach((t, k) => t.addEventListener('click', () => go(k)));
    inc.addEventListener('pointerenter', () => hover = true); inc.addEventListener('pointerleave', () => hover = false);
    new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting) timer = setInterval(() => { if (!hover) go(i + 1); }, 5000); }, { threshold: .3 }).observe(inc);
  }


  // Simulador de MRR (sustituye a la calculadora sencilla)
  const sim = document.querySelector('[data-sim]');
  if (sim) {
    const S = { price: 39, new: 20, churn: 3, growth: 5, fees: true, h: 12 };
    const PRE = { cons: { price: 29, new: 10, churn: 5, growth: 2 }, base: { price: 39, new: 20, churn: 3, growth: 5 }, opt: { price: 49, new: 35, churn: 2, growth: 8 } };
    const eur = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
    const k = n => n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.', ',') + 'k €' : eur(n);
    const svg = sim.querySelector('[data-svg]'), chart = sim.querySelector('[data-chart]'), tip = sim.querySelector('[data-tip]');
    let series = [];
    const model = () => {
      const out = []; let c = 0, total = 0, add = S.new;
      for (let m = 1; m <= S.h; m++) {
        const lost = c * S.churn / 100; c = c - lost + add;
        const gross = c * S.price, fee = S.fees ? c * (S.price * 0.015 + 0.25) : 0, net = gross - fee;
        total += net; out.push({ m, subs: c, add, lost, mrr: net, gross }); add = add * (1 + S.growth / 100);
      }
      return { out, total };
    };
    const set = (key, v) => {
      sim.querySelectorAll(`[data-k="${key}"]`).forEach(el => { if (el.type === 'checkbox') el.checked = !!v; else if (el.tagName === 'INPUT') el.value = v; });
    };
    const draw = () => {
      const { out, total } = model(); series = out;
      const last = out[out.length - 1], prev = out[Math.max(0, out.length - 2)];
      const arpu = last.subs ? last.mrr / last.subs : 0, ltv = S.churn > 0 ? arpu / (S.churn / 100) : arpu * 60;
      const o = (n, v) => sim.querySelector(`[data-o="${n}"]`).textContent = v;
      o('mrr', eur(last.mrr)); o('mrrd', (prev.mrr ? '▲ ' + ((last.mrr / prev.mrr - 1) * 100).toFixed(1).replace('.', ',') + ' % último mes' : ''));
      o('arr', eur(last.mrr * 12)); o('subs', Math.round(last.subs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
      o('arpu', arpu.toFixed(2).replace('.', ',') + ' €'); o('ltv', eur(ltv)); o('total', eur(total));
      o('hash', `${S.price}€ · ${S.new}/m · ${String(S.churn).replace('.', ',')}% · +${S.growth}% · ${S.h}m`);
      // gráfica con ejes
      const W = chart.clientWidth, H = chart.clientHeight, L = 58, R = 14, T = 14, B = 28;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const max = Math.max(...out.map(d => d.mrr)) * 1.1 || 1;
      const nice = (() => { const p = Math.pow(10, Math.floor(Math.log10(max))); const r = max / p; return (r <= 2 ? 2 : r <= 5 ? 5 : 10) * p; })();
      const X = m => L + (m - 1) / Math.max(1, S.h - 1) * (W - L - R), Y = v => T + (1 - v / nice) * (H - T - B);
      let g = '';
      for (let i = 0; i <= 4; i++) { const v = nice * i / 4, y = Y(v); g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="gl"/><text x="${L - 10}" y="${y + 4}" text-anchor="end" class="ax">${k(v)}</text>`; }
      const step = S.h <= 12 ? 1 : S.h <= 24 ? 3 : 6;
      out.forEach(d => { if (d.m === 1 || d.m % step === 0) g += `<text x="${X(d.m)}" y="${H - 8}" text-anchor="middle" class="ax">M${d.m}</text>`; });
      const bw = Math.max(2, (W - L - R) / S.h * .42);
      out.forEach(d => { const h = (H - T - B) * (d.add * S.price / nice); g += `<rect x="${X(d.m) - bw / 2}" y="${Y(0) - h}" width="${bw}" height="${h}" rx="2" class="bar"/>`; });
      const line = out.map((d, i) => `${i ? 'L' : 'M'}${X(d.m).toFixed(1)},${Y(d.mrr).toFixed(1)}`).join(' ');
      g += `<path d="${line} L${X(S.h)},${Y(0)} L${X(1)},${Y(0)} Z" class="area"/><path d="${line}" class="ln"/>`;
      g += `<line class="cross" x1="0" x2="0" y1="${T}" y2="${H - B}" style="display:none"/><circle class="pt" r="5" style="display:none"/>`;
      g += `<defs><linearGradient id="simFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B8CFF" stop-opacity=".22"/><stop offset="1" stop-color="#5B8CFF" stop-opacity="0"/></linearGradient></defs>`;
      svg.innerHTML = g;
      svg._X = X; svg._Y = Y; svg._L = L; svg._R = R; svg._W = W;
      // tabla trimestral
      const rows = out.filter(d => d.m % 3 === 0 || d.m === 1);
      sim.querySelector('[data-tbl]').innerHTML = `<tr><th>Mes</th><th>Altas</th><th>Bajas</th><th>Clientes</th><th>MRR neto</th></tr>` +
        rows.map(d => `<tr><td>M${d.m}</td><td>+${Math.round(d.add)}</td><td>−${Math.round(d.lost)}</td><td>${Math.round(d.subs)}</td><td>${eur(d.mrr)}</td></tr>`).join('');
    };
    chart.addEventListener('pointermove', e => {
      if (!series.length) return;
      const r = chart.getBoundingClientRect(), x = e.clientX - r.left;
      const m = Math.min(S.h, Math.max(1, Math.round((x - svg._L) / (svg._W - svg._L - svg._R) * (S.h - 1) + 1)));
      const d = series[m - 1], px = svg._X(m), py = svg._Y(d.mrr);
      const cr = svg.querySelector('.cross'), pt = svg.querySelector('.pt');
      cr.setAttribute('x1', px); cr.setAttribute('x2', px); cr.style.display = ''; pt.setAttribute('cx', px); pt.setAttribute('cy', py); pt.style.display = '';
      tip.innerHTML = `<b>Mes ${m}</b><span>MRR neto <em>${eur(d.mrr)}</em></span><span>Clientes <em>${Math.round(d.subs)}</em></span><span>Altas / bajas <em>+${Math.round(d.add)} / −${Math.round(d.lost)}</em></span>`;
      tip.style.left = Math.min(px + 14, r.width - 190) + 'px'; tip.style.top = Math.max(8, py - 40) + 'px'; tip.classList.add('on');
    });
    chart.addEventListener('pointerleave', () => { tip.classList.remove('on'); svg.querySelectorAll('.cross,.pt').forEach(e => e.style.display = 'none'); });
    sim.addEventListener('input', e => {
      const key = e.target.dataset.k; if (!key) return;
      S[key] = e.target.type === 'checkbox' ? e.target.checked : +e.target.value; set(key, S[key]);
      sim.querySelectorAll('[data-preset] button').forEach(b => b.classList.remove('is-on')); draw();
    });
    sim.addEventListener('click', e => {
      const st = e.target.closest('[data-step]');
      if (st) { e.preventDefault(); const key = st.dataset.k; S[key] = Math.max(0, +(S[key] + +st.dataset.step).toFixed(1)); set(key, S[key]); draw(); return; }
      const p = e.target.closest('[data-p]');
      if (p) { Object.assign(S, PRE[p.dataset.p]); Object.keys(PRE.base).forEach(key => set(key, S[key])); sim.querySelectorAll('[data-preset] button').forEach(b => b.classList.toggle('is-on', b === p)); draw(); return; }
      const h = e.target.closest('[data-h]');
      if (h) { S.h = +h.dataset.h; sim.querySelectorAll('[data-horizon] button').forEach(b => b.classList.toggle('is-on', b === h)); draw(); }
    });
    addEventListener('resize', draw); draw();
  }
})();

/* CRM de demo en vivo: iframe escalado + pestañas sincronizadas */
(function () {
  const box = document.querySelector('[data-crmx]'); if (!box) return;
  const vp = box.querySelector('[data-vp]'), fr = box.querySelector('[data-if]'), btns = [...box.querySelectorAll('[data-g]')];
  const fit = () => {
    const w = vp.clientWidth, base = w < 700 ? 1100 : 1440, sc = w / base;
    const boxH = Math.max(360, Math.min(w * .625, window.innerHeight - 130)), h = boxH / sc;
    fr.style.width = base + 'px'; fr.style.height = h + 'px'; fr.style.transform = `scale(${sc})`; vp.style.height = boxH + 'px';
  };
  new ResizeObserver(fit).observe(vp); window.addEventListener('resize', fit); fit();
  const mark = id => btns.forEach(b => b.classList.toggle('is-on', b.dataset.g === id));
  btns.forEach(b => b.addEventListener('click', () => { mark(b.dataset.g); fr.contentWindow && fr.contentWindow.postMessage({ goto: b.dataset.g }, '*'); }));
  window.addEventListener('message', e => { if (e.source === fr.contentWindow && e.data && e.data.norte) mark(e.data.norte); });
})();
