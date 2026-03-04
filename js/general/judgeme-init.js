(function () {
  // 1) Configure Judge.me ASAP
  window.jdgm = window.jdgm || {};
  window.jdgm.SHOP_DOMAIN = "99brands1.myshopify.com";
  window.jdgm.PLATFORM = "shopify";
  window.jdgm.PUBLIC_TOKEN = "Ol224LN84BU5YZ8InSpr9XVXA34";

  var WIDGET_SRC = "https://cdnwidget.judge.me/widget_preloader.js";
  var WIDGET_HOST = "https://cdnwidget.judge.me";

  function addHint(tag, attrs) {
    try {
      var el = document.createElement(tag);
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
      document.head.appendChild(el);
    } catch (e) {}
  }

  // 2) Performance hints (helps fresh visit / DNS+TLS)
  addHint("link", { rel: "preconnect", href: WIDGET_HOST, crossorigin: "" });
  addHint("link", { rel: "dns-prefetch", href: WIDGET_HOST });

  // Optional: try to fetch the script sooner (browser may prioritize it)
  // Note: some browsers ignore preload for cross-origin unless CORS is compatible, but it doesn't hurt.
  addHint("link", { rel: "preload", as: "script", href: WIDGET_SRC, crossorigin: "" });

  // 3) Wait for element helper
  function waitForEl(selector, timeoutMs) {
    timeoutMs = timeoutMs || 10000;
    var start = Date.now();

    return new Promise(function (resolve, reject) {
      (function tick() {
        var el = document.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() - start > timeoutMs) return reject(new Error("Timeout: " + selector));
        setTimeout(tick, 50); // faster polling
      })();
    });
  }

  // 4) Load Judge.me script once
  function loadJdgm() {
    return new Promise(function (resolve) {
      // Already loaded / loading
      var existing = document.querySelector('script[data-lf-jdgm="1"]') ||
                     document.querySelector('script[src*="judge.me/widget_preloader.js"]');
      if (existing) return resolve();

      var s = document.createElement("script");
      s.src = WIDGET_SRC;
      s.async = true;
      s.defer = true;
      s.setAttribute("data-cfasync", "false");
      s.setAttribute("data-lf-jdgm", "1");
      s.onload = function () { resolve(); };
      document.head.appendChild(s); // append to HEAD to start sooner
    });
  }

  // 5) Render/refresh (debounced-ish)
  var renderQueued = false;
  function renderJdgmSoon() {
    if (renderQueued) return;
    renderQueued = true;

    setTimeout(function () {
      renderQueued = false;
      if (!window.jdgm) return;

      if (typeof window.jdgm.refreshWidgets === "function") window.jdgm.refreshWidgets();
      else if (typeof window.jdgm.renderWidgets === "function") window.jdgm.renderWidgets();
    }, 0);
  }

  // 6) Start ASAP (don’t wait for window.load)
  function start() {
    // Kick off script load immediately
    loadJdgm().then(renderJdgmSoon);

    // If container appears later (React), render then too
    waitForEl(".jdgm-widget", 15000).then(renderJdgmSoon).catch(function(){});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  // 7) Bonus: if React re-renders and re-inserts widgets, observe and refresh
  var mo = new MutationObserver(function () {
    // Only react when there is at least one widget container in DOM
    if (document.querySelector(".jdgm-widget")) renderJdgmSoon();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

})();