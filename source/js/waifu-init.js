// Live2D 看板娘（动态宠物）加载器
// 说明：
// - 通过 CDN 动态加载 live2d-widget 脚本与模型
// - 默认固定在页面右下角，适配浅/深色模式
// - 若需替换模型，可修改 `MODEL_JSON` 地址为其他模型的 model.json

(function () {
  // 防重复加载
  if (window.__WAIFU_LOADED__) return;
  window.__WAIFU_LOADED__ = true;

  // 可替换的模型地址（示例使用 shizuku）
  const MODEL_JSON = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku/assets/shizuku.model.json';

  // 主库地址（3.x）
  const LIB_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function init() {
    // 某些页面可能不希望显示（例如归档/友链页），可以按需判断
    // 这里示例：仅在首页与文章页显示
    try {
      const path = (location.pathname || '').replace(/\/+$/, '');
      const isIndex = path === '' || path === '/' || /index\.html$/.test(path);
      const isPost = /\/\d{4}\/\d{2}\//.test(path) || document.querySelector('.post-title');
      if (!isIndex && !isPost) return; // 不在首页或文章页则不加载
    } catch (e) {}

    // 初始化 Live2D
    if (window.L2Dwidget && window.L2Dwidget.init) {
      window.L2Dwidget.init({
        model: {
          jsonPath: MODEL_JSON,
          scale: 1
        },
        display: {
          position: 'right',
          // 固定在右下角
          width: 150,
          height: 300,
          hOffset: 20,
          vOffset: 0
        },
        mobile: {
          show: true,
          scale: 0.5
        },
        react: {
          opacity: 0.9
        }
      });
    }
  }

  // 延迟到页面可交互后加载，避免阻塞首屏
  function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function () {
    loadScript(LIB_URL).then(init).catch(function (err) {
      // 静默失败，不影响页面其它功能
      console && console.warn && console.warn('[waifu] load failed:', err);
    });
  });
})();

