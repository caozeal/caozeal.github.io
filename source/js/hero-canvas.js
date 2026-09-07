/**
 * hero-canvas.js — 首页头图动态层（黑洞·吸积盘 v5）
 * 底层为黑洞吸积盘插画 JPEG；叠加：
 *   ① 全景 Ken Burns 呼吸（banner 与 canvas 同步缩放，光点永不脱锚）
 *   ② 吸积流：五条开普勒差速椭圆轨道金尘（近洞快、远洞慢，过剪影自动消隐）
 *   ③ 光子环脉冲事件（~24s 周期：热点绕环一周 + 白核绽放 + 横向镜头光带）
 *   ④ 上下相对论性喷流（呼吸光束 + 微粒喷射）
 *   ⑤ 透镜星芒（被引力透镜拱起的恒星沿光环弧缓慢环绕）
 *   前景散景微尘 / 三层视差星尘 / 流星 / 鼠标光晕
 * 全部锚点定义在图片坐标系（1920x1550，底部扩版使黑洞居中于视口），按 cover 数学映射任意视口。
 */
(function () {
  'use strict';

  var header = document.querySelector('.header-inner[style*="100vh"]');
  if (!header || document.getElementById('hero-scene')) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var banner = document.getElementById('banner');
  var IMG_W = 1920, IMG_H = 1550;

  var cfg = {
    gold: '210,165,105',
    starCount: 78,
    diskPerRing: 52,
    satCount: 5,
    trailSeg: 40,
    trailStep: 0.055,        // 彗尾角度步长 rad
    shootMin: 5500,
    shootMax: 11500,
    parallax: 5,
    fadeInMs: 1100,
    breathPeriod: 20,        // Ken Burns 呼吸周期 s
    breathAmp: 0.07,         // 缩放幅度
    flarePeriod: 24,         // 光子环脉冲周期 s
    flareDur: 5200,          // 脉冲持续 ms
    bokehCount: 7,
    /* 黑洞剪影（图片坐标） */
    hole: { cx: 950, cy: 775, r: 122 },
    ringR: 136,              // 光子环半径
    /* 吸积盘五条椭圆轨道：前缘下弯、两端齐平盘面 */
    diskCy: 788,
    rings: [
      { rx: 292, ry: 47 }, { rx: 432, ry: 69 }, { rx: 582, ry: 93 },
      { rx: 748, ry: 120 }, { rx: 912, ry: 146 }
    ],
    /* 透镜星芒弧（上半弧，绕过黑洞上方） */
    halos: [
      { rx: 172, ry: 152 }, { rx: 216, ry: 186 }, { rx: 262, ry: 222 }
    ],
    /* 喷流：top / bottom 端点 */
    jets: {
      top: { x: 947, y0: 640, y1: 408 },
      bottom: { x: 950, y0: 1008, y1: 1300 }
    }
  };

  var canvas = document.createElement('canvas');
  canvas.id = 'hero-scene';
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, S = 1, OX = 0, OY = 0;

  function resize() {
    W = header.clientWidth; H = header.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.cssText = 'position:absolute;left:-2%;top:-2%;width:104%;height:104%;' +
      'z-index:1;pointer-events:none;will-change:transform;opacity:0;' +
      'transition:opacity ' + cfg.fadeInMs + 'ms ease-out;transform-origin:50% 50%;';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.max(W / IMG_W, H / IMG_H);
    OX = (W - IMG_W * S) / 2; OY = (H - IMG_H * S) / 2;
    seedStars(); seedBokeh();
  }
  function map(pt) { return { x: OX + pt[0] * S, y: OY + pt[1] * S }; }

  /* 椭圆轨道取点（θ=π/2 为画面正下方前缘） */
  function ellipseAt(cx, cy, rx, ry, th) {
    return [cx + rx * Math.cos(th), cy + ry * Math.sin(th)];
  }
  /* 黑洞剪影消隐系数：r 内为 0，向外 40px 渐变到 1 */
  function occ(x, y) {
    var dx = x - cfg.hole.cx, dy = y - cfg.hole.cy;
    var d = Math.sqrt(dx * dx + dy * dy) - cfg.hole.r;
    if (d <= 0) return 0;
    if (d >= 40) return 1;
    return d / 40;
  }
  /* 开普勒差速角速度：近洞快、远洞慢 */
  function kepler(rx) { return 0.30 * Math.pow(300 / rx, 1.5); }

  /* ---------- 三层视差星尘 ---------- */
  var starLayers = [];
  function seedStars() {
    starLayers = [];
    var depths = [3, 7, 13];
    for (var L = 0; L < 3; L++) {
      var arr = [];
      for (var i = 0; i < Math.round(cfg.starCount * [0.5, 0.3, 0.2][L]); i++) {
        arr.push({
          x: Math.random() * (W + 40) - 20, y: Math.random() * H * 0.62 - 10,
          r: (0.4 + Math.random() * 1.0) * [1, 1.15, 1.35][L],
          base: 0.10 + Math.random() * 0.38,
          amp: 0.28 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.3,
          gold: Math.random() < 0.22
        });
      }
      starLayers.push({ stars: arr, depth: depths[L] });
    }
  }

  /* ---------- 前景散景微尘 ---------- */
  var bokehs = [];
  function seedBokeh() {
    bokehs = [];
    for (var i = 0; i < cfg.bokehCount; i++) {
      bokehs.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 2 + Math.random() * 3,
        depth: 16 + Math.random() * 14,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.35,
        base: 0.015 + Math.random() * 0.03,
        phase: Math.random() * 6.283, wob: 0.25 + Math.random() * 0.5,
        gold: Math.random() < 0.6
      });
    }
  }

  /* ---------- 吸积流粒子 ---------- */
  var streams = [];
  cfg.rings.forEach(function (ring, ri) {
    for (var i = 0; i < cfg.diskPerRing; i++) {
      var tier = Math.random();
      streams.push({
        ring: ring,
        th: Math.random() * 6.283,
        speed: kepler(ring.rx) * (0.7 + Math.random() * 0.6),
        size: tier < 0.75 ? 0.4 + Math.random() * 0.7
            : tier < 0.95 ? 0.9 + Math.random() * 0.9
            : 1.6 + Math.random() * 1.1,
        base: (tier < 0.75 ? 0.08 + Math.random() * 0.16
            : tier < 0.95 ? 0.12 + Math.random() * 0.18
            : 0.2 + Math.random() * 0.22),
        amp: 0.15 + Math.random() * 0.3,
        phase: Math.random() * 6.283,
        wob: 0.7 + Math.random() * 2.0,
        rj: (Math.random() - 0.5) * 16,          // 径向抖动（图片坐标 px）
        gold: Math.random() < 0.85
      });
    }
  });

  /* ---------- 大彗星光点（沿吸积盘轨道） ---------- */
  var sats = [];
  for (var si = 0; si < cfg.satCount; si++) {
    var ring = cfg.rings[si % cfg.rings.length];
    sats.push({
      ring: ring,
      th: Math.random() * 6.283,
      speed: kepler(ring.rx) * (0.85 + Math.random() * 0.4),
      size: 2.4 + Math.random() * 1.6
    });
  }

  /* ---------- 透镜星芒（沿上半透镜弧缓行） ---------- */
  var lensed = [];
  cfg.halos.forEach(function (h) {
    for (var i = 0; i < 4; i++) {
      lensed.push({
        halo: h,
        th: Math.PI + Math.random() * Math.PI,    // 上半弧
        speed: (Math.random() < 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.035),
        r: 0.8 + Math.random() * 1.4,
        base: 0.25 + Math.random() * 0.4,
        amp: 0.2 + Math.random() * 0.3,
        phase: Math.random() * 6.283,
        wob: 0.5 + Math.random() * 1.2
      });
    }
  });

  /* ---------- 喷流微粒 ---------- */
  var jetPs = [];
  ['top', 'bottom'].forEach(function (k) {
    var j = cfg.jets[k], dir = k === 'top' ? -1 : 1;
    for (var i = 0; i < 14; i++) {
      jetPs.push({
        jet: j, dir: dir,
        p: Math.random(),                          // 沿喷流进度 0..1
        speed: 0.10 + Math.random() * 0.16,        // 进度/s
        jx: (Math.random() - 0.5) * 7,
        r: 0.5 + Math.random() * 0.9,
        base: 0.15 + Math.random() * 0.3
      });
    }
  });

  /* ---------- 流星 ---------- */
  var shoots = [], nextShoot = performance.now() + cfg.shootMin;
  function spawnShoot(now) {
    var base = {
      x: W * (0.18 + Math.random() * 0.6), y: H * (0.04 + Math.random() * 0.22),
      ang: Math.PI * (0.70 + Math.random() * 0.26), len: 110 + Math.random() * 90,
      t0: now, dur: 900 + Math.random() * 300
    };
    shoots.push(base);
    if (Math.random() < 0.5) {
      shoots.push({ x: base.x - W * 0.08, y: base.y - H * 0.06, ang: base.ang + (Math.random() - 0.5) * 0.1,
        len: base.len * 0.7, t0: now + 160 + Math.random() * 140, dur: base.dur * 0.85 });
    }
  }

  /* ---------- 光子环脉冲事件 ---------- */
  var flare = { t0: performance.now() + 3500, a0: 0 };
  function updateFlare(now) {
    var p = (now - flare.t0) / cfg.flareDur;
    if (p >= 1) {
      flare.t0 = now + cfg.flarePeriod * 1000 + Math.random() * 4000;
      flare.a0 = Math.random() * 6.283;
      return null;
    }
    if (p < 0) return null;
    return { env: Math.pow(Math.sin(p * Math.PI), 1.4), ang: flare.a0 + p * 6.283 };
  }

  var cmx = -999, cmy = -999, gmx = -999, gmy = -999;
  var lastNow = 0;

  function draw(now, mx, my) {
    var dt = Math.min(0.05, lastNow ? (now - lastNow) / 1000 : 0.016);
    lastNow = now;
    ctx.clearRect(0, 0, W, H);
    var t = now / 1000;
    var fl = updateFlare(now);
    var env = fl ? fl.env : 0;
    var boost = 1 + 0.8 * env;                     // 脉冲时吸积流加速

    starLayers.forEach(function (layer) {
      var ox = mx * layer.depth, oy = my * layer.depth * 0.6;
      layer.stars.forEach(function (s) {
        var a = Math.max(0.04, s.base + Math.sin(t * s.speed + s.phase) * s.amp);
        ctx.fillStyle = s.gold
          ? 'rgba(' + cfg.gold + ',' + a.toFixed(2) + ')'
          : 'rgba(225,235,248,' + a.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(s.x + ox, s.y + oy, s.r, 0, 6.283); ctx.fill();
      });
    });

    ctx.globalCompositeOperation = 'lighter';

    /* 前景散景：失焦大颗粒，强视差，缓慢漂移 */
    bokehs.forEach(function (b) {
      b.x += b.vx * dt * 60 * 0.016; b.y += b.vy * dt * 60 * 0.016;
      if (b.x < -30) b.x = W + 30; if (b.x > W + 30) b.x = -30;
      if (b.y < -30) b.y = H + 30; if (b.y > H + 30) b.y = -30;
      var a = b.base * (0.6 + 0.4 * Math.sin(t * b.wob + b.phase));
      var bx = b.x + mx * b.depth, by = b.y + my * b.depth * 0.6;
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
      g.addColorStop(0, (b.gold ? 'rgba(230,196,150,' : 'rgba(190,208,228,') + (a).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(bx, by, b.r, 0, 6.283); ctx.fill();
    });

    /* 光子环呼吸辉光 + 脉冲热点 */
    (function photonRing() {
      var breath = 0.5 + 0.5 * Math.sin(t * 0.75);
      var segs = 72;
      ctx.lineCap = 'round';
      for (var i = 0; i < segs; i++) {
        var a1 = i / segs * 6.283, a2 = (i + 1) / segs * 6.283;
        var p1 = map(ellipseAt(cfg.hole.cx, cfg.hole.cy, cfg.ringR, cfg.ringR, a1));
        var p2 = map(ellipseAt(cfg.hole.cx, cfg.hole.cy, cfg.ringR, cfg.ringR, a2));
        /* 脉冲扫过：高斯中心跟随热点角度 */
        var sweep = 0;
        if (fl) {
          var dA = Math.atan2(Math.sin(a1 - fl.ang), Math.cos(a1 - fl.ang));
          sweep = Math.exp(-Math.pow(dA * 2.6, 2)) * env * 0.35;
        }
        ctx.strokeStyle = 'rgba(' + cfg.gold + ',' + (0.030 + 0.040 * breath + sweep).toFixed(2) + ')';
        ctx.lineWidth = 13 * S;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,240,214,' + (0.05 + 0.09 * breath + sweep * 1.2).toFixed(2) + ')';
        ctx.lineWidth = 2.8 * S;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      /* 脉冲热点：白核 + 金晕 + 大气暖光 + 横向镜头光带 */
      if (fl && env > 0.01) {
        var fp = map(ellipseAt(cfg.hole.cx, cfg.hole.cy, cfg.ringR, cfg.ringR, fl.ang));
        var rOut = (260 * S + 50) * (0.55 + 0.9 * env);
        var gOut = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, rOut);
        gOut.addColorStop(0, 'rgba(230,196,150,' + (0.16 * env).toFixed(2) + ')');
        gOut.addColorStop(0.5, 'rgba(' + cfg.gold + ',' + (0.07 * env).toFixed(2) + ')');
        gOut.addColorStop(1, 'rgba(' + cfg.gold + ',0)');
        ctx.fillStyle = gOut;
        ctx.beginPath(); ctx.arc(fp.x, fp.y, rOut, 0, 6.283); ctx.fill();
        var rMid = (95 * S + 20) * (0.5 + 0.9 * env);
        var gMid = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, rMid);
        gMid.addColorStop(0, 'rgba(255,240,208,' + (0.55 * env).toFixed(2) + ')');
        gMid.addColorStop(0.45, 'rgba(' + cfg.gold + ',' + (0.28 * env).toFixed(2) + ')');
        gMid.addColorStop(1, 'rgba(' + cfg.gold + ',0)');
        ctx.fillStyle = gMid;
        ctx.beginPath(); ctx.arc(fp.x, fp.y, rMid, 0, 6.283); ctx.fill();
        var rCore = (16 * S + 7) * (0.5 + 0.8 * env);
        var gCore = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, rCore);
        gCore.addColorStop(0, 'rgba(255,252,244,' + (0.95 * env).toFixed(2) + ')');
        gCore.addColorStop(1, 'rgba(255,248,228,0)');
        ctx.fillStyle = gCore;
        ctx.beginPath(); ctx.arc(fp.x, fp.y, rCore, 0, 6.283); ctx.fill();
        /* 横向镜头光带（anamorphic flare） */
        var half = W * 0.40 * (0.4 + 0.6 * env);
        var sg = ctx.createLinearGradient(fp.x - half, fp.y, fp.x + half, fp.y);
        sg.addColorStop(0, 'rgba(230,196,150,0)');
        sg.addColorStop(0.5, 'rgba(255,242,214,' + (0.32 * env).toFixed(2) + ')');
        sg.addColorStop(1, 'rgba(230,196,150,0)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(fp.x - half, fp.y); ctx.lineTo(fp.x + half, fp.y); ctx.stroke();
      }
    })();

    /* 吸积流（脉冲时加速；过黑洞剪影自动消隐） */
    streams.forEach(function (d) {
      d.th += d.speed * boost * dt;
      var rx = d.ring.rx + d.rj, ry = d.ring.ry + d.rj * 0.16;
      var pt = ellipseAt(cfg.hole.cx, cfg.diskCy, rx, ry, d.th);
      var o = occ(pt[0], pt[1]);
      if (o <= 0.02) return;
      var p = map(pt);
      var a = Math.max(0.03, (d.base + Math.sin(t * d.wob + d.phase) * d.amp) * (1 + env * 0.5)) * o;
      ctx.fillStyle = d.gold
        ? 'rgba(' + cfg.gold + ',' + Math.min(0.85, a).toFixed(2) + ')'
        : 'rgba(214,226,240,' + Math.min(0.7, a * 0.8).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, d.size, 0, 6.283); ctx.fill();
    });

    /* 大彗星光点（沿轨道拖尾，同样消隐） */
    sats.forEach(function (sat) {
      sat.th += sat.speed * boost * dt;
      var headPt = ellipseAt(cfg.hole.cx, cfg.diskCy, sat.ring.rx, sat.ring.ry, sat.th);
      var o = occ(headPt[0], headPt[1]);
      if (o <= 0.02) return;
      ctx.lineCap = 'round';
      var prev = map(headPt);
      for (var k = 0; k < cfg.trailSeg; k++) {
        var thk = sat.th - (k + 1) * cfg.trailStep;
        var ptk = ellipseAt(cfg.hole.cx, cfg.diskCy, sat.ring.rx, sat.ring.ry, thk);
        var ok = occ(ptk[0], ptk[1]);
        var pk = map(ptk);
        var f1 = 1 - k / cfg.trailSeg;
        ctx.strokeStyle = 'rgba(' + cfg.gold + ',' + (f1 * f1 * 0.5 * Math.min(o, ok)).toFixed(2) + ')';
        ctx.lineWidth = Math.max(0.4, sat.size * 0.9 * f1);
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pk.x, pk.y); ctx.stroke();
        prev = pk;
      }
      var head = map(headPt);
      var g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, sat.size * 3.4);
      g.addColorStop(0, 'rgba(255,244,220,' + (0.95 * o).toFixed(2) + ')');
      g.addColorStop(0.35, 'rgba(' + cfg.gold + ',' + (0.55 * o).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(' + cfg.gold + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(head.x, head.y, sat.size * 3.4, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,248,232,' + (0.98 * o).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(head.x, head.y, sat.size * 0.55, 0, 6.283); ctx.fill();
    });

    /* 透镜星芒 */
    lensed.forEach(function (s) {
      s.th += s.speed * dt;
      if (s.th < Math.PI) s.th += Math.PI * 2;      // 保持在上半弧附近漂移
      var pt = ellipseAt(cfg.hole.cx, cfg.hole.cy, s.halo.rx, s.halo.ry, s.th % (Math.PI * 2));
      var o = occ(pt[0], pt[1]);
      if (o <= 0.02) return;
      var p = map(pt);
      var a = Math.max(0.05, s.base + Math.sin(t * s.wob + s.phase) * s.amp) * o;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s.r * 3);
      g.addColorStop(0, 'rgba(255,242,218,' + Math.min(0.9, a).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(' + cfg.gold + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, s.r * 3, 0, 6.283); ctx.fill();
    });

    /* 相对论性喷流：呼吸光束 + 微粒喷射 */
    (function jets() {
      var breath = 0.5 + 0.5 * Math.sin(t * 1.1);
      ['top', 'bottom'].forEach(function (k) {
        var j = cfg.jets[k];
        var p0 = map([j.x, j.y0]), p1 = map([j.x, j.y1]);
        var g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        var peak = (0.10 + 0.10 * breath) * (1 + env * 0.8);
        g.addColorStop(0, 'rgba(255,238,205,' + peak.toFixed(2) + ')');
        g.addColorStop(0.6, 'rgba(' + cfg.gold + ',' + (peak * 0.4).toFixed(2) + ')');
        g.addColorStop(1, 'rgba(' + cfg.gold + ',0)');
        ctx.strokeStyle = g;
        ctx.lineCap = 'round';
        ctx.lineWidth = 3.2 * S;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        ctx.lineWidth = 9 * S;
        ctx.globalAlpha = 0.28;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        ctx.globalAlpha = 1;
      });
      jetPs.forEach(function (p) {
        p.p += p.speed * (1 + env) * dt;
        if (p.p > 1) p.p -= 1;
        var y = p.jet.y0 + (p.jet.y1 - p.jet.y0) * p.p;
        var fade = Math.sin(p.p * Math.PI);
        var mp = map([p.jet.x + p.jx, y]);
        ctx.fillStyle = 'rgba(255,236,200,' + (p.base * fade).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(mp.x, mp.y, p.r, 0, 6.283); ctx.fill();
      });
    })();

    /* 流星 */
    if (!shoots.length && now > nextShoot) {
      spawnShoot(now);
      nextShoot = now + cfg.shootMin + Math.random() * (cfg.shootMax - cfg.shootMin);
    }
    shoots = shoots.filter(function (sh) {
      var p = (now - sh.t0) / sh.dur;
      if (p < 0) return true;
      if (p >= 1) return false;
      var fade = Math.sin(p * Math.PI);
      var d = p * sh.len * 1.6;
      var x1 = sh.x + Math.cos(sh.ang) * d, y1 = sh.y + Math.sin(sh.ang) * d;
      var grad = ctx.createLinearGradient(x1, y1,
        x1 - Math.cos(sh.ang) * sh.len, y1 - Math.sin(sh.ang) * sh.len);
      grad.addColorStop(0, 'rgba(255,244,222,' + (0.95 * fade).toFixed(2) + ')');
      grad.addColorStop(0.25, 'rgba(' + cfg.gold + ',' + (0.5 * fade).toFixed(2) + ')');
      grad.addColorStop(1, 'rgba(' + cfg.gold + ',0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2.1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - Math.cos(sh.ang) * sh.len, y1 - Math.sin(sh.ang) * sh.len);
      ctx.stroke();
      var hg = ctx.createRadialGradient(x1, y1, 0, x1, y1, 7);
      hg.addColorStop(0, 'rgba(255,250,238,' + (0.9 * fade).toFixed(2) + ')');
      hg.addColorStop(1, 'rgba(255,250,238,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(x1, y1, 7, 0, 6.283); ctx.fill();
      return true;
    });

    /* 鼠标光晕 */
    if (cmx > -900) {
      gmx += (cmx - gmx) * 0.06; gmy += (cmy - gmy) * 0.06;
      var cg = ctx.createRadialGradient(gmx, gmy, 0, gmx, gmy, 190);
      cg.addColorStop(0, 'rgba(' + cfg.gold + ',0.075)');
      cg.addColorStop(0.55, 'rgba(110,140,180,0.045)');
      cg.addColorStop(1, 'rgba(110,140,180,0)');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(gmx, gmy, 190, 0, 6.283); ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    /* ① 全景 Ken Burns 呼吸：banner 与 canvas 同参变换，锚点不失效 */
    var k = 1.02 + cfg.breathAmp * (0.5 - 0.5 * Math.cos(6.283 * t / cfg.breathPeriod));
    var panX = Math.sin(6.283 * t / 38) * 0.008 * W;
    var panY = Math.cos(6.283 * t / 46) * 0.004 * H;
    var common = 'translate(' + panX.toFixed(1) + 'px,' + panY.toFixed(1) + 'px) scale(' + k.toFixed(4) + ')';
    if (banner) banner.style.transform = common;
    canvas.style.transform = 'translate(' + (mx * cfg.parallax).toFixed(1) + 'px,' +
      (my * cfg.parallax * 0.6).toFixed(1) + 'px) ' + common;

    if (canvas.style.opacity === '0') canvas.style.opacity = '1';
  }

  /* ---------- 生命周期 ---------- */
  header.insertBefore(canvas, header.firstChild);
  if (banner) {
    banner.style.transformOrigin = '50% 50%';
    banner.style.willChange = 'transform';
  }

  var running = false, rafId = 0, mx = 0, my = 0;
  function frame(now) {
    if (!running) return;
    draw(now, mx, my);
    rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }
  function staticFrame() {
    draw(performance.now(), 0, 0);
    canvas.style.transition = 'none'; canvas.style.opacity = '1';
    if (banner) banner.style.transform = 'none';
  }

  header.addEventListener('mousemove', function (e) {
    var r = header.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5;
    my = (e.clientY - r.top) / r.height - 0.5;
    cmx = e.clientX - r.left; cmy = e.clientY - r.top;
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es[0].isIntersecting ? start() : stop();
    }, { threshold: 0.02 }).observe(header);
  } else { start(); }

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  var rsTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rsTimer);
    rsTimer = setTimeout(resize, 150);
  }, { passive: true });

  resize();
  reduceMotion ? staticFrame() : start();
})();
