(function () {
  const BUNDLES_SELECTOR = "#the-bundles";
  const OFFICIAL_PRICE_SELECTOR = "#official-price .wys";
  const OFFICIAL_COMPARE_SELECTOR = "#official-compare-at-price .wys";

  // Finds the currently selected bundle using multiple heuristics (more stable than random classes)
  function findSelectedBundle(bundlesEl) {
    if (!bundlesEl) return null;

    // 1) If LF/your component ever adds ARIA states, these are ideal
    let selected =
      bundlesEl.querySelector(".jupTd[aria-selected='true']") ||
      bundlesEl.querySelector(".jupTd[aria-checked='true']");

    if (selected) return selected;

    // 2) If the "radio" indicator has active
    selected = bundlesEl.querySelector(".jupTd .tHIdP.active")?.closest(".jupTd");
    if (selected) return selected;

    // 3) Fallback: container item is marked active
    selected = bundlesEl.querySelector(".jupTd.active");
    if (selected) return selected;

    return null;
  }

  function getPricesFromBundle(bundleEl) {
    if (!bundleEl) return { price: null, compare: null };

    // Avoid relying on .LyYxP / .hYUmS (may be temp)
    const priceWrap = bundleEl.querySelector(".dKL7m");
    if (!priceWrap) return { price: null, compare: null };

    const priceEl = priceWrap.querySelector(":scope > div:nth-child(1)");
    const compareEl = priceWrap.querySelector(":scope > div:nth-child(2)");

    const price = priceEl ? priceEl.textContent.trim() : null;
    const compare = compareEl ? compareEl.textContent.trim() : null;

    return { price, compare };
  }

  function setText(selector, text) {
    const el = document.querySelector(selector);
    if (!el || text == null || text === "") return;
    if (el.textContent.trim() !== text) el.textContent = text;
  }

  function syncOfficialPrices() {
    const bundlesEl = document.querySelector(BUNDLES_SELECTOR);
    if (!bundlesEl) return;

    const selectedBundle = findSelectedBundle(bundlesEl);
    const { price, compare } = getPricesFromBundle(selectedBundle);

    setText(OFFICIAL_PRICE_SELECTOR, price);
    setText(OFFICIAL_COMPARE_SELECTOR, compare);
  }

  function bindDelegatedClick() {
    const bundlesEl = document.querySelector(BUNDLES_SELECTOR);
    if (!bundlesEl) return;

    if (bundlesEl.dataset.lfOfficialPriceBound === "1") return;
    bundlesEl.dataset.lfOfficialPriceBound = "1";

    // Use event delegation so re-renders don't break listeners
    bundlesEl.addEventListener("click", function (e) {
      const clicked = e.target.closest(".jupTd");
      if (!clicked) return;

      // Wait for LF to toggle "selected" state
      setTimeout(syncOfficialPrices, 50);
    });
  }

  function init() {
    bindDelegatedClick();
    syncOfficialPrices();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(init, 300);
  });

  // React/LF re-render resilience
  const mo = new MutationObserver(function () {
    bindDelegatedClick();
    syncOfficialPrices();
  });

  mo.observe(document.body, { childList: true, subtree: true });
})();