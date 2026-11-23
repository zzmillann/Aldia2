(function () {
  'use strict';

  // ─── CONFIG ──────────────────────────────────────────────
  const CONFIG = {
    dotColor: '#1a1a1aff', // blackish
    bgColor: '#ffffffff',  // off-white
    dotCount: 2000,
    rotSpeed: 0.0018,
    repulseRatio: 0.22,
    topRatio: 0.6,
    focalMult: 2.8,
    springK: 0.055,
    damping: 0.7,
    repulsePwr: 26,
  };

  // ─── INIT ────────────────────────────────────────────────
  const canvas = document.getElementById('dotGlobeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Parse color
  const hex = CONFIG.dotColor.replace('#', '');
  const dr = parseInt(hex.substring(0, 2), 16);
  const dg = parseInt(hex.substring(2, 4), 16);
  const db = parseInt(hex.substring(4, 6), 16);

  // ─── GENERA PUNTOS (Fibonacci lattice) ───────────────────
  const golden = Math.PI * (3 - Math.sqrt(5));
  const N = CONFIG.dotCount;
  const dots = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const phi = Math.acos(Math.max(-1, Math.min(1, y)));
    const theta = (golden * i) % (2 * Math.PI);
    const r = Math.random();
    const size = r < 0.62 ? 0.2 + Math.random() * 0.55 :
      r < 0.88 ? 0.75 + Math.random() * 0.8 :
        1.55 + Math.random() * 1.4;
    dots.push({
      phi: phi,
      theta0: theta,
      size: size,
      ox: 0, oy: 0,
      vox: 0, voy: 0,
    });
  }

  const indices = dots.map(function (_, i) { return i; });
  const depthCache = new Float32Array(N);

  // ─── ESTADO ──────────────────────────────────────────────
  let rotY = 0;
  let mouseX = -99999;
  let mouseY = -99999;
  let W = 0, H = 0, R = 0, cx = 0, cy = 0, foc = 0, repR = 0;
  let rafId;

  // ─── RESIZE ──────────────────────────────────────────────
  function getDpr() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  function resize() {
    var d = getDpr();
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W * d;
    canvas.height = H * d;
    R = Math.min(W * 0.5, H * 0.5);
    cx = W / 2;
    cy = H * CONFIG.topRatio + R;
    foc = R * CONFIG.focalMult;
    repR = R * CONFIG.repulseRatio;
  }

  // ─── MOUSE ───────────────────────────────────────────────
  function onMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }
  function onLeave() {
    mouseX = -99999;
    mouseY = -99999;
  }

  function onTouch(e) {
    if (e.touches.length > 0) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
    }
  }

  // ─── RENDER LOOP ─────────────────────────────────────────
  // color: una ola de azul y violeta recorre la esfera; los puntos de atrás se aclaran y el cursor los enciende
  var INK = [16, 20, 34], BLUE = [47, 98, 224], SKY = [91, 140, 255], VIO = [139, 124, 255];
  var col_arr = new Array(N), t0 = performance.now();
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  var sx_arr = new Float32Array(N);
  var sy_arr = new Float32Array(N);
  var rs_arr = new Float32Array(N);

  function frame() {
    var d = getDpr();
    if (canvas.width !== W * d || canvas.height !== H * d) resize();

    ctx.save();
    ctx.scale(d, d);
    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, W, H);

    // halo azul suave detrás de la esfera
    var hg = ctx.createRadialGradient(cx, cy - R * 0.35, R * 0.1, cx, cy - R * 0.2, R * 1.25);
    hg.addColorStop(0, 'rgba(91,140,255,0.16)'); hg.addColorStop(0.55, 'rgba(139,124,255,0.07)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    rotY += CONFIG.rotSpeed;

    var mdx = mouseX - cx;
    var mdy = mouseY - cy;
    var cursorInSphere = (mdx * mdx + mdy * mdy) < (R * R * 1.05);

    for (var i = 0; i < N; i++) {
      var dot = dots[i];
      var theta = dot.theta0 + rotY;
      var sinPhi = Math.sin(dot.phi);
      var cosPhi = Math.cos(dot.phi);
      var x3 = sinPhi * Math.cos(theta);
      var y3 = cosPhi;
      var z3 = sinPhi * Math.sin(theta);

      var ps = foc / (foc + z3 * R);
      var sx0 = cx + x3 * R * ps;
      var sy0 = cy - y3 * R * ps;

      var fx = -CONFIG.springK * dot.ox;
      var fy = -CONFIG.springK * dot.oy;

      if (cursorInSphere) {
        var dx = sx0 - mouseX;
        var dy = sy0 - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < repR && dist > 0.5) {
          var t = 1 - dist / repR;
          var force = CONFIG.repulsePwr * t * t;
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        }
      }

      dot.vox = (dot.vox + fx) * CONFIG.damping;
      dot.voy = (dot.voy + fy) * CONFIG.damping;
      dot.ox += dot.vox;
      dot.oy += dot.voy;

      sx_arr[i] = sx0 + dot.ox;
      sy_arr[i] = sy0 + dot.oy;

      var baseSize = dot.size * R * 0.0035;
      rs_arr[i] = Math.max(0.3, baseSize * ps);
      depthCache[i] = z3;
      var tt = reduce ? 0 : (performance.now() - t0) / 1000;
      var w = 0.5 + 0.5 * Math.sin(theta * 1.3 + y3 * 2.2 - tt * 0.9);
      w = Math.pow(w, 1.15);
      var v = 0.5 + 0.5 * Math.sin(dot.phi * 3.1 + tt * 0.55);
      var c = mix(INK, mix(BLUE, VIO, v), w);
      if (cursorInSphere) {
        var ddx = sx0 - mouseX, ddy = sy0 - mouseY, dd = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dd < repR * 1.8) c = mix(c, SKY, (1 - dd / (repR * 1.8)) * 0.9);
      }
      var a = 0.35 + 0.65 * (1 - (z3 + 1) / 2);
      col_arr[i] = 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(2) + ')';
    }

    indices.sort(function (a, b) {
      return depthCache[a] - depthCache[b];
    });

    for (var ii = 0; ii < N; ii++) {
      var idx = indices[ii];
      var sx = sx_arr[idx];
      var sy = sy_arr[idx];

      if (sy > H + 20 || sy < -20 || sx < -20 || sx > W + 20) continue;

      var rs = rs_arr[idx];
      ctx.beginPath();
      ctx.arc(sx, sy, rs, 0, 6.283185307);
      ctx.fillStyle = col_arr[idx];
      ctx.fill();
    }

    ctx.restore();
    rafId = requestAnimationFrame(frame);
  }

  // ─── BOOTSTRAP ───────────────────────────────────────────
  resize();
  var ro = new ResizeObserver(resize);
  ro.observe(canvas);

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('touchmove', onTouch, { passive: true });
  canvas.addEventListener('touchend', onLeave);

  rafId = requestAnimationFrame(frame);
})();
