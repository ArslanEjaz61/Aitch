/**
 * Aitch theme — scroll reveals, hero stat count-up, staggered children.
 * Respects data-animations="off" and prefers-reduced-motion.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  if (root.getAttribute('data-animations') === 'off') return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  /* ---------- Scroll reveal (sections) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          revObs.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    reveals.forEach(function (el) {
      revObs.observe(el);
    });
  }

  /* ---------- Hero stat count-up ---------- */
  function parseStat(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var s = raw.trim();
    // "20+", "99+"
    var mPlus = /^(\d+)\s*\+$/.exec(s);
    if (mPlus) return { n: parseInt(mPlus[1], 10), suffix: '+', duration: 900 };
    // "30 Day", "14 Day"
    var mDay = /^(\d+)\s+Day$/i.exec(s);
    if (mDay) return { n: parseInt(mDay[1], 10), suffix: ' Day', duration: 900 };
    // plain number
    var mNum = /^(\d+)$/.exec(s);
    if (mNum) return { n: parseInt(mNum[1], 10), suffix: '', duration: 800 };
    return null;
  }

  function runCountUp(el, spec) {
    var start = 0;
    var end = spec.n;
    var dur = spec.duration;
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(start + (end - start) * eased);
      el.textContent = val + spec.suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = end + spec.suffix;
    }
    requestAnimationFrame(step);
  }

  var heroStats = document.querySelector('.hero__stats');
  if (heroStats) {
    var statObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          statObs.unobserve(entry.target);
          entry.target.querySelectorAll('.hero-count').forEach(function (cell, idx) {
            var raw = cell.getAttribute('data-raw') || cell.textContent.trim();
            var spec = parseStat(raw);
            if (!spec) return;
            if (spec.suffix === '+') cell.textContent = '0+';
            else if (spec.suffix === ' Day') cell.textContent = '0 Day';
            else cell.textContent = '0';
            setTimeout(function () {
              runCountUp(cell, spec);
            }, 120 + idx * 100);
          });
        });
      },
      { threshold: 0.25 }
    );
    statObs.observe(heroStats);
  }

  /* ---------- Cart badge subtle bump (if count > 0) ---------- */
  var cartBadge = document.querySelector('.header__cart-count');
  if (cartBadge && parseInt(cartBadge.textContent, 10) > 0) {
    cartBadge.classList.add('header__cart-count--pop');
  }
})();
