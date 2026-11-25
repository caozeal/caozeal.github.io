/*
 * DeepSeek 大肥鱼桌宠：复用本机 dsh-pet 0.4.8 原版素材。
 * 来源：https://github.com/PC2005-cloud/dsh-pet
 * 代码许可 MIT；素材禁止商用，公开二创须署名 PC2005-cloud。
 */
(function () {
  'use strict';

  var path = (location.pathname || '').replace(/\/+$/, '');
  var isHome = path === '' || /index\.html$/.test(path);
  var isPost = /\/\d{4}\/\d{2}\//.test(path) || document.querySelector('.post-title');
  if ((!isHome && !isPost) || window.__DSH_PET_LOADED__) return;
  window.__DSH_PET_LOADED__ = true;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrowScreen = window.matchMedia('(max-width: 991px)');
  var ROOT = '/resources/dsh-pet/';
  var IDLE = ROOT + 'idle.webm';
  var DRAG = ROOT + 'drag.webm';
  var ACTIONS = [
    { src: ROOT + 'wave.webm', text: '你好呀，今天也想看点新东西吗？' },
    { src: ROOT + 'jump.webm', text: '今天也要做点好玩的东西。' },
    { src: ROOT + 'tickle.webm', text: '哈哈，别挠了。' },
    { src: ROOT + 'angry.webm', text: '哼，我可是大肥鱼。' }
  ];

  var shell;
  var button;
  var video;
  var bubble;
  var bubbleTimer;
  var actionPlaying = false;
  var lastAction = -1;
  var drag = null;
  var flight = null;
  var suppressClick = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Safari/WKWebView 能解码 WebM 却可能丢失 alpha，改用透明静态图。
  function supportsAlphaWebm() {
    var ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) return false;
    if (/Chrome|Chromium|Edg|OPR|Firefox/i.test(ua)) return true;
    return !/Mac/i.test(navigator.platform || ua);
  }

  function makeImage() {
    var img = document.createElement('img');
    img.src = ROOT + 'idle.png';
    img.alt = '大肥鱼';
    img.width = 640;
    img.height = 360;
    img.decoding = 'async';
    return img;
  }

  function safePlay() {
    if (!video || document.hidden || narrowScreen.matches || reducedMotion.matches) return;
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        // 自动播放被拦截时保留海报帧，点击后仍可播放。
      });
    }
  }

  function setVideo(src, loop) {
    if (!video) return;
    var changed = video.getAttribute('src') !== src;
    video.loop = loop;
    if (changed) {
      video.src = src;
      video.load();
    } else if (!loop) {
      video.currentTime = 0;
    }
    safePlay();
  }

  function playIdle() {
    actionPlaying = false;
    if (video) setVideo(IDLE, true);
  }

  function hideBubble() {
    if (!bubble) return;
    clearTimeout(bubbleTimer);
    bubble.hidden = true;
  }

  function showBubble(text) {
    if (!bubble) return;
    clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.classList.toggle('dsh-pet-bubble--below', shell.getBoundingClientRect().top < 90);
    bubble.hidden = false;
    bubbleTimer = setTimeout(hideBubble, 3200);
  }

  function playAction() {
    if (!video || drag || flight || reducedMotion.matches) return;
    var index;
    do {
      index = Math.floor(Math.random() * ACTIONS.length);
    } while (ACTIONS.length > 1 && index === lastAction);
    lastAction = index;
    actionPlaying = true;
    setVideo(ACTIONS[index].src, false);
    showBubble(ACTIONS[index].text);
  }

  function setPosition(x, y) {
    shell.style.left = x + 'px';
    shell.style.top = y + 'px';
    shell.style.right = 'auto';
    shell.style.bottom = 'auto';
  }

  function getBounds(width, height) {
    return {
      maxX: Math.max(0, window.innerWidth - width),
      maxY: Math.max(0, window.innerHeight - height)
    };
  }

  function stopFlight() {
    if (!flight) return;
    cancelAnimationFrame(flight.raf);
    flight = null;
  }

  function settleFlight(message) {
    if (!flight) return;
    stopFlight();
    playIdle();
    if (message) showBubble(message);
  }

  // 无重力惯性：保留抛掷的前冲与碰边反弹，减速后悬停在当前位置。
  function startFlight(current, vx, vy) {
    if (Math.hypot(vx, vy) < 90) {
      playIdle();
      showBubble('就待在这里啦。');
      return;
    }

    var state = {
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
      vx: clamp(vx, -1800, 1800),
      vy: clamp(vy, -1800, 1800),
      last: performance.now(),
      rest: 0,
      elapsed: 0,
      raf: 0
    };
    flight = state;

    function step(now) {
      if (flight !== state) return;
      if (document.hidden || narrowScreen.matches || reducedMotion.matches) {
        settleFlight();
        return;
      }

      var dt = Math.min(0.032, Math.max(0, (now - state.last) / 1000));
      state.last = now;
      state.elapsed += dt;
      var damping = Math.pow(0.075, dt);
      state.vx *= damping;
      state.vy *= damping;
      state.x += state.vx * dt;
      state.y += state.vy * dt;

      var bounds = getBounds(state.width, state.height);
      if (state.x < 0) {
        state.x = 0;
        state.vx = Math.abs(state.vx) * 0.55;
      } else if (state.x > bounds.maxX) {
        state.x = bounds.maxX;
        state.vx = -Math.abs(state.vx) * 0.55;
      }
      if (state.y < 0) {
        state.y = 0;
        state.vy = Math.abs(state.vy) * 0.55;
      } else if (state.y > bounds.maxY) {
        state.y = bounds.maxY;
        state.vy = -Math.abs(state.vy) * 0.55;
      }

      setPosition(state.x, state.y);
      var still = Math.hypot(state.vx, state.vy) < 18;
      state.rest = still ? state.rest + dt : 0;
      if (state.rest >= 0.2 || state.elapsed >= 4) {
        settleFlight('就待在这里啦。');
        return;
      }
      state.raf = requestAnimationFrame(step);
    }

    state.raf = requestAnimationFrame(step);
  }

  function onPointerDown(event) {
    if (!video || event.button !== 0 || narrowScreen.matches || reducedMotion.matches) return;
    stopFlight();
    actionPlaying = false;
    hideBubble();

    var rect = shell.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      vx: 0,
      vy: 0,
      moved: false
    };
    button.setPointerCapture(event.pointerId);
    shell.classList.add('is-dragging');
  }

  function onPointerMove(event) {
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      setVideo(DRAG, true);
    }
    event.preventDefault();

    var now = performance.now();
    var dt = Math.max(0.008, (now - drag.lastTime) / 1000);
    var nextVx = (event.clientX - drag.lastX) / dt;
    var nextVy = (event.clientY - drag.lastY) / dt;
    drag.vx = drag.vx * 0.55 + nextVx * 0.45;
    drag.vy = drag.vy * 0.55 + nextVy * 0.45;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;

    var bounds = getBounds(drag.width, drag.height);
    drag.x = clamp(event.clientX - drag.offsetX, 0, bounds.maxX);
    drag.y = clamp(event.clientY - drag.offsetY, 0, bounds.maxY);
    setPosition(drag.x, drag.y);
  }

  function onPointerEnd(event) {
    if (!drag || drag.id !== event.pointerId) return;
    var current = drag;
    drag = null;
    shell.classList.remove('is-dragging');
    if (button && button.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }

    if (current.moved) {
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 0);
      var momentum = event.type === 'pointercancel' ? 0
        : clamp(1 - (performance.now() - current.lastTime) / 180, 0, 1);
      startFlight(current, current.vx * momentum, current.vy * momentum);
    } else if (event.type === 'pointercancel') {
      playIdle();
    }
  }

  function cancelInteractions() {
    if (drag) {
      if (button && button.hasPointerCapture(drag.id)) {
        button.releasePointerCapture(drag.id);
      }
      drag = null;
      shell.classList.remove('is-dragging');
      playIdle();
    }
    settleFlight();
    hideBubble();
  }

  function useStaticFallback() {
    if (!shell || !button) return;
    cancelInteractions();
    var staticBox = document.createElement('div');
    staticBox.className = 'dsh-pet-button dsh-pet-static';
    staticBox.appendChild(makeImage());
    shell.replaceChild(staticBox, button);
    button = null;
    video = null;
  }

  function init() {
    shell = document.createElement('aside');
    shell.id = 'dsh-pet';
    shell.setAttribute('aria-label', '大肥鱼桌宠');

    bubble = document.createElement('div');
    bubble.className = 'dsh-pet-bubble';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    bubble.hidden = true;
    shell.appendChild(bubble);

    if (reducedMotion.matches || !supportsAlphaWebm()) {
      var staticBox = document.createElement('div');
      staticBox.className = 'dsh-pet-button dsh-pet-static';
      staticBox.appendChild(makeImage());
      shell.appendChild(staticBox);
    } else {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'dsh-pet-button';
      button.setAttribute('aria-label', '和大肥鱼互动：点击或拖拽');
      button.title = '点我互动，也可以拖到喜欢的位置';

      video = document.createElement('video');
      video.src = IDLE;
      video.poster = ROOT + 'idle.png';
      video.width = 640;
      video.height = 360;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = !narrowScreen.matches;
      video.preload = narrowScreen.matches ? 'none' : 'auto';
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('aria-hidden', 'true');
      video.addEventListener('ended', function () {
        if (actionPlaying) playIdle();
      });
      video.addEventListener('error', useStaticFallback);
      button.addEventListener('click', function () {
        if (suppressClick) return;
        playAction();
      });
      button.addEventListener('dragstart', function (event) { event.preventDefault(); });
      button.addEventListener('pointerdown', onPointerDown);
      button.addEventListener('pointermove', onPointerMove);
      button.addEventListener('pointerup', onPointerEnd);
      button.addEventListener('pointercancel', onPointerEnd);
      button.appendChild(video);
      shell.appendChild(button);
    }

    document.body.appendChild(shell);
    safePlay();

    document.addEventListener('visibilitychange', function () {
      if (!video) return;
      if (document.hidden) {
        cancelInteractions();
        video.pause();
      } else {
        safePlay();
      }
    });
    narrowScreen.addEventListener('change', function () {
      if (!video) return;
      if (narrowScreen.matches) {
        cancelInteractions();
        video.pause();
      } else {
        if (video.preload === 'none') {
          video.preload = 'auto';
          video.load();
        }
        safePlay();
      }
    });
    reducedMotion.addEventListener('change', function () {
      if (!video) return;
      if (reducedMotion.matches) {
        cancelInteractions();
        video.pause();
      } else {
        safePlay();
      }
    });
    window.addEventListener('resize', function () {
      if (!shell.style.left) return;
      cancelInteractions();
      var rect = shell.getBoundingClientRect();
      var bounds = getBounds(rect.width, rect.height);
      setPosition(clamp(rect.left, 0, bounds.maxX), clamp(rect.top, 0, bounds.maxY));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
