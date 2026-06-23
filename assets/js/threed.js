/* =====================================================================
   LIGHT-3D interactions — hero 3D tilt group + tilt-on-hover cards.
   Decorative only. Skipped on touch + reduced-motion. rAF-throttled.
   ===================================================================== */
(function () {
  "use strict";
  var mm = window.matchMedia;
  if (mm && mm("(prefers-reduced-motion: reduce)").matches) return;
  if (!mm || !mm("(hover: hover) and (pointer: fine)").matches) return; // mouse only
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ---- tilt-on-hover cards (self-perspective) ---- */
  document.querySelectorAll(".feat,.prog,.award,.news,.act-card,.life-tile,.testi,.cm-quote-card").forEach(function (card) {
    card.classList.add("tilt");
    var rect = null, ticking = false, lx = 0, ly = 0;
    function render() {
      ticking = false;
      card.style.transform = "perspective(850px) rotateX(" + (-ly * 7).toFixed(2) + "deg) rotateY(" +
        (lx * 7).toFixed(2) + "deg) translateZ(12px)";
    }
    card.addEventListener("pointerenter", function () { rect = card.getBoundingClientRect(); });
    card.addEventListener("pointermove", function (e) {
      if (!rect) rect = card.getBoundingClientRect();
      lx = (e.clientX - rect.left) / rect.width - 0.5;
      ly = (e.clientY - rect.top) / rect.height - 0.5;
      if (!ticking) { ticking = true; raf(render); }
    });
    card.addEventListener("pointerleave", function () { rect = null; card.style.transform = ""; });
  });

  /* ---- hero: rotate the whole visual group in one 3D space ---- */
  var hero = document.querySelector(".hero");
  if (hero) {
    var vis = document.querySelector(".hero-visual");
    var card = document.querySelector(".hero-card-img");
    var dots = document.querySelector(".hero__dots");
    var ticking = false, hx = 0, hy = 0, gx = 50, gy = 22;
    function render() {
      ticking = false;
      if (vis) vis.style.transform = "rotateX(" + (-hy * 9).toFixed(2) + "deg) rotateY(" + (hx * 11).toFixed(2) + "deg)";
      if (dots) dots.style.transform = "translate(" + (hx * -22).toFixed(1) + "px," + (hy * -22).toFixed(1) + "px)";
      if (card) { card.style.setProperty("--gx", gx + "%"); card.style.setProperty("--gy", gy + "%"); }
    }
    hero.addEventListener("pointermove", function (e) {
      var hr = hero.getBoundingClientRect();
      hx = (e.clientX - hr.left) / hr.width - 0.5;
      hy = (e.clientY - hr.top) / hr.height - 0.5;
      if (card) {
        var cr = card.getBoundingClientRect();
        gx = ((e.clientX - cr.left) / cr.width * 100).toFixed(1);
        gy = ((e.clientY - cr.top) / cr.height * 100).toFixed(1);
      }
      if (!ticking) { ticking = true; raf(render); }
    });
    hero.addEventListener("pointerleave", function () {
      if (vis) vis.style.transform = "";
      if (dots) dots.style.transform = "";
    });
  }
})();
