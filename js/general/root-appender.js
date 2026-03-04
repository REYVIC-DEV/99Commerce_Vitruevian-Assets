(function () {
  function ensureMainLandmark() {
    const root = document.getElementById("root");
    if (!root) return;

    // If already exists, do nothing
    if (root.querySelector('main, [role="main"]')) return;

    // Find first meaningful element inside root
    const firstElement = Array.from(root.children).find(
      (el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE"
    );

    if (!firstElement) return;

    // If it's already semantic sectioning, upgrade to main
    if (firstElement.tagName === "MAIN") return;

    // Safest approach: add role instead of wrapping
    firstElement.setAttribute("role", "main");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureMainLandmark);
  } else {
    ensureMainLandmark();
  }

  // React-safe observer (for hydration delay)
  const obs = new MutationObserver(() => {
    ensureMainLandmark();
  });

  obs.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();