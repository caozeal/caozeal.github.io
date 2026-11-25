// 滚动入场动画：元素进入视口时淡入上移
// 兼容性兜底：不支持 IntersectionObserver 时直接显示
(function () {
  function init() {
    var els = document.querySelectorAll(
      '.portal-reveal, .index-info, .markdown-body img, .markdown-body blockquote, figure.highlight'
    );
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('fx-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fx-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px 40px 0px' });

    els.forEach(function (el) {
      // 已在首屏内的直接显示，避免闪跳
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('fx-in');
      } else {
        el.classList.add('fx-wait');
        io.observe(el);
      }
    });

    // 安全兜底：3 秒后强制全部显示，防止意外情况内容不可见
    setTimeout(function () {
      document.querySelectorAll('.fx-wait').forEach(function (el) {
        el.classList.add('fx-in');
        el.classList.remove('fx-wait');
      });
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// 文章页：公众号原文二维码
// 由 front-matter 的 mp_url 驱动。渲染成 <img> 而非 <canvas>——微信只能长按识别 img
(function () {
  function render() {
    var box = document.querySelector('.mp-original');
    if (!box) return;

    var url = box.getAttribute('data-mp-url');
    if (!url || typeof QRCode === 'undefined') return;

    var holder = box.querySelector('.mp-original-qr');
    var tmp = document.createElement('div');
    tmp.style.cssText = 'position:absolute;left:-9999px;top:0';
    document.body.appendChild(tmp);

    try {
      // 生成 300px 高清码，CSS 缩放到 108px 显示，兼顾高分屏清晰度与扫码成功率
      new QRCode(tmp, {
        text: url,
        width: 300,
        height: 300,
        correctLevel: QRCode.CorrectLevel.M
      });

      var canvas = tmp.querySelector('canvas');
      if (!canvas) return;

      var img = new Image();
      img.src = canvas.toDataURL('image/png');
      img.alt = '公众号原文二维码';
      holder.appendChild(img);
    } catch (e) {
      // 生成失败也要保住文字链接，二维码区域留空即可
      holder.style.display = 'none';
    } finally {
      document.body.removeChild(tmp);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
