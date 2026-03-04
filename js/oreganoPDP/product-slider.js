(function () {
  let scheduled = false;

  function optimizeImages() {

    const mainImgs = document.querySelectorAll(".pdp-img-slider .swiper-slide img");
    const thumbImgs = document.querySelectorAll(".pdp-img-slider-thumb .swiper-slide img");

    mainImgs.forEach(function(img, index) {

      const src = img.getAttribute("src");
      if (!src) return;

      const src47  = src.replace(/width=\d+/, "width=47");
      const src378 = src.replace(/width=\d+/, "width=378");
      const src589 = src.replace(/width=\d+/, "width=589");

      img.src = src589;

      img.srcset = `
        ${src47} 47w,
        ${src378} 378w,
        ${src589} 589w
      `.trim();

      img.sizes = "(max-width: 50px) 47px, (max-width: 425px) 378px, 589px";

      if (index === 0) {
        img.setAttribute("fetchpriority", "high");
      }

    });

    thumbImgs.forEach(function(img) {

      const src = img.getAttribute("src");
      if (!src) return;

      const size = 103;
      const optimized = src.replace(/width=\d+/, "width=" + size);

      img.src = optimized;
      img.srcset = optimized + " 103w";
      img.sizes = "103px";

      img.width = 103;
      img.height = 103;

    });

  }

  function initSliders() {
    scheduled = false;

    const mainEl = document.querySelector(".pdp-img-slider");
    const thumbEl = document.querySelector(".pdp-img-slider-thumb");

    if (!mainEl || !thumbEl) return;
    if (!window.Swiper) return;

    if (mainEl.swiper || thumbEl.swiper) return;

    optimizeImages();

    const thumbSwiper = new Swiper(thumbEl, {
      spaceBetween: 6,
      slidesPerView: 'auto',
      freeMode: true,
      watchSlidesProgress: true,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    new Swiper(mainEl, {
      speed: 400,
      spaceBetween: 1,
      slidesPerView: 1,
      loop: true,
      observer: true,
      observeParents: true,
      thumbs: {
        swiper: thumbSwiper,
      },
    });
  }

  function queueInit() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(initSliders);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", queueInit);
  } else {
    queueInit();
  }

  const observer = new MutationObserver(queueInit);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

})();
