// 滚动入场动画：元素进入视口时淡入上移
// 兼容性兜底：不支持 IntersectionObserver 时直接显示
(function () {
  function init() {
    var els = document.querySelectorAll(
      '.index-info, .markdown-body img, .markdown-body blockquote, figure.highlight'
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
