/* ALDIA — Logo «a.» de partículas sobre rejilla en perspectiva.
   Se monta en cualquier <div data-particles data-src="logo.png">. Reacciona al puntero. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['#5B8CFF', '#2F62E0', '#8FB0FF', '#0E0E0E', '#5B8CFF', '#C9D8FF'];

  document.querySelectorAll('[data-particles]').forEach(host => {
    const cv = document.createElement('canvas'); host.appendChild(cv);
    const ctx = cv.getContext('2d');
    let W, H, dpr, parts = [], pointer = { x: -9999, y: -9999 }, t0 = performance.now(), visible = true;

    const img = new Image(); img.src = host.dataset.src;
    img.onload = () => { resize(); build(); loop(); };

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = host.clientWidth; H = host.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function build() {
      // Muestrea el glifo del logo (píxeles oscuros y opacos)
      const S = 160, off = document.createElement('canvas'); off.width = off.height = S;
      const o = off.getContext('2d');
      const r = Math.min(S / img.width, S / img.height) * 2.3;   // el glifo ocupa poco del png
      o.drawImage(img, (S - img.width * r) / 2, (S - img.height * r) / 2, img.width * r, img.height * r);
      const d = o.getImageData(0, 0, S, S).data;
      const pts = [];
      for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) {
        const i = (y * S + x) * 4;
        if (d[i + 3] > 128 && d[i] < 100) pts.push([x / S - .5, y / S - .5]);
      }
      const scale = Math.min(W, H) * .95;
      const cx = W / 2, cy = H * .42;
      parts = pts.map(([x, y]) => {
        const tx = cx + x * scale, ty = cy + y * scale;
        return {
          tx, ty, x: cx + (Math.random() - .5) * W * 1.4, y: cy + (Math.random() - .5) * H * 1.4,
          vx: 0, vy: 0, s: 2 + Math.random() * 2.6, c: COLORS[(Math.random() * COLORS.length) | 0],
          ph: Math.random() * Math.PI * 2, a: .55 + Math.random() * .45
        };
      });
    }

    function floor(t) {
      // Rejilla isométrica de baldosas que se iluminan bajo el logo
      const rows = 14, cols = 18, tw = W / 11, th = tw * .5;
      const ox = W / 2, oy = H * .7;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const gx = c - cols / 2, gy = r - rows / 2;
        const x = ox + (gx - gy) * tw / 2, y = oy + (gx + gy) * th / 2 * .55;
        if (y < H * .52 || y > H + th) continue;
        const dist = Math.hypot(gx, gy);
        const glow = Math.max(0, 1 - dist / 5.5) * (.75 + .25 * Math.sin(t * 1.6 - dist * .8));
        const fade = Math.min(1, (y - H * .52) / (H * .18)) * Math.max(0, 1 - (y - H * .7) / (H * .32));
        const lift = glow * 6;
        ctx.globalAlpha = fade * (.35 + glow * .65);
        ctx.fillStyle = glow > .15 ? `rgba(91,140,255,${.25 + glow * .5})` : '#EEF2FA';
        ctx.beginPath();
        ctx.moveTo(x, y - th * .275 - lift); ctx.lineTo(x + tw / 2 - 2, y - lift);
        ctx.lineTo(x, y + th * .275 - lift); ctx.lineTo(x - tw / 2 + 2, y - lift); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = fade * .5; ctx.fillStyle = '#D9E2F5';
        ctx.fillRect(x - tw / 2 + 2, y - lift, tw - 4, 3 + lift * .4);
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      if (!visible) { requestAnimationFrame(loop); return; }
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      floor(t);
      for (const p of parts) {
        const bob = reduce ? 0 : Math.sin(t * 1.4 + p.ph + p.ty * .02) * 2.2;
        let ax = (p.tx - p.x) * .045, ay = (p.ty + bob - p.y) * .045;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy, R = 90;
        if (d2 < R * R) { const f = (1 - Math.sqrt(d2) / R) * 6; const d = Math.sqrt(d2) || 1; ax += dx / d * f; ay += dy / d * f; }
        p.vx = (p.vx + ax) * .82; p.vy = (p.vy + ay) * .82;
        p.x += p.vx; p.y += p.vy;
        ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }

    const move = e => { const r = cv.getBoundingClientRect(); const pt = e.touches ? e.touches[0] : e; pointer.x = pt.clientX - r.left; pointer.y = pt.clientY - r.top; };
    host.addEventListener('pointermove', move);
    host.addEventListener('touchmove', move, { passive: true });
    host.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); build(); }, 150); });
  });
})();
