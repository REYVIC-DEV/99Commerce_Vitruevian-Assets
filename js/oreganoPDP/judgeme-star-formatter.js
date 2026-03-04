(function () {
  const WIDGET_SEL = ".jdgm-widget.jdgm-preview-badge";
  const BADGE_SEL = ".jdgm-prev-badge";
  const STARS_SEL = ".jdgm-prev-badge__stars[data-score]";

  const BUILT_ATTR = "data-lf-jdgm-built";

  function formatNumber(n) {
    try {
      return new Intl.NumberFormat(undefined).format(n);
    } catch {
      return String(n);
    }
  }

  // Simple label mapping (tweak thresholds/labels to taste)
  function ratingLabel(r) {
    if (r >= 4.7) return "Excellent";
    if (r >= 4.3) return "Great";
    if (r >= 3.8) return "Good";
    if (r >= 3.0) return "Average";
    return "Rated";
  }

  function buildForWidget(widget) {
    const badge = widget.querySelector(BADGE_SEL);
    if (!badge) return false;

    // Avoid rebuilding
    if (badge.getAttribute(BUILT_ATTR) === "1") return true;

    const stars = badge.querySelector(STARS_SEL);
    if (!stars) return false;

    // Pull rating & reviews (prefer badge dataset)
    const avgFromBadge = parseFloat(badge.getAttribute("data-average-rating") || "");
    const avgFromStars = parseFloat(stars.getAttribute("data-score") || "");
    const avg = !Number.isNaN(avgFromBadge) ? avgFromBadge : avgFromStars;

    const reviewsFromBadge = parseInt(badge.getAttribute("data-number-of-reviews") || "", 10);
    const reviews = Number.isFinite(reviewsFromBadge) ? reviewsFromBadge : null;

    if (!Number.isFinite(avg)) return false;

    const rounded = Math.round(avg * 10) / 10; // 1 decimal
    const label = ratingLabel(rounded);

    // Create/replace wrapper
    let inline = badge.querySelector(".lf-jdgm-inline");
    if (!inline) {
      inline = document.createElement("div");
      inline.className = "lf-jdgm-inline";
      // Put at start of badge
      badge.prepend(inline);
    } else {
      inline.innerHTML = "";
    }

    // Move the stars into our layout (keep Judge.me star markup)
    inline.appendChild(stars);

    // Build the text block
    const text = document.createElement("div");
    text.className = "lf-jdgm-inline-text";
    text.innerHTML = `
      <span class="lf-jdgm-rated">Rated</span>
      <span class="lf-jdgm-rating">${rounded.toFixed(1)}</span>
      <span class="lf-jdgm-label">${label}</span>
      ${reviews != null ? `<span class="lf-jdgm-reviews">${formatNumber(reviews)} Reviews</span>` : ""}
    `;
    inline.appendChild(text);

    // Hide default Judge.me text nodes so we don't get duplicates
    badge.classList.add("lf-jdgm-hide-default");

    // If you want clicking "Reviews" to trigger the original Judge.me behavior/link:
    // - some themes use anchor wrapping the badge; if so, click will bubble fine.
    // - if not, you can forward click to the stars (often opens reviews).
    const reviewsEl = text.querySelector(".lf-jdgm-reviews");
    if (reviewsEl) {
      reviewsEl.addEventListener("click", (e) => {
        // Forward click to stars (many setups open the reviews modal/scroll)
        try { stars.click(); } catch (err) {}
      });
    }

    badge.setAttribute(BUILT_ATTR, "1");
    return true;
  }

  function buildAll() {
    const widgets = document.querySelectorAll(WIDGET_SEL);
    widgets.forEach((w) => buildForWidget(w));
  }

  // Initial attempt
  buildAll();

  // Judge.me + Lightfunnels often render async; observe for injected badges
  const obs = new MutationObserver(() => buildAll());
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();