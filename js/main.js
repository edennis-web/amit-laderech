document.addEventListener('DOMContentLoaded', function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Mobile menu ----
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('main-nav');
  function closeMenu() { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', function () { btn.setAttribute('aria-expanded', nav.classList.toggle('open')); });

  // ---- Dropdowns (click/tap/keyboard; hover in CSS on wide screens) ----
  var subs = Array.prototype.slice.call(document.querySelectorAll('.has-sub'));
  function closeSubs(except) {
    subs.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('open');
      li.querySelector('.nav-top').setAttribute('aria-expanded', 'false');
    });
  }
  subs.forEach(function (li) {
    var t = li.querySelector('.nav-top');
    t.addEventListener('click', function () {
      var open = !li.classList.contains('open');
      closeSubs(li);
      li.classList.toggle('open', open);
      t.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-sub')) closeSubs(); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) { closeSubs(); closeMenu(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openLi = subs.filter(function (li) { return li.classList.contains('open'); })[0];
    if (openLi) { closeSubs(); openLi.querySelector('.nav-top').focus(); return; }
    if (nav.classList.contains('open')) { closeMenu(); btn.focus(); }
  });

  // ---- Inner pages: mark blocks for a gentle step-by-step reveal ----
  if (document.body.classList.contains('inner') && !reduced) {
    document.querySelectorAll('main .section .section-head, main .section .prose, main .section .notice, main .section .pull-quote, main .section .doc-list, main .section .media-slot, main .cta-band .wrap')
      .forEach(function (el) { el.classList.add('rv', 'reveal-one'); });
    document.querySelectorAll('main .cards, main .people, main .tiles, main .link-list, main .contact-grid, main .logo-wall').forEach(function (list) {
      Array.prototype.forEach.call(list.children, function (el, i) {
        el.classList.add('rv', 'reveal-one');
        el.style.setProperty('--d', Math.min(i % 4, 3) * 0.09 + 's');   // stagger along a row
      });
    });
  }

  // ---- Reveal on scroll ----
  var items = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-photo, .spin-in, .reveal-one');
  // A clipped photo has no visible area, so the observer watches its parent instead
  var watch = new Map();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      (watch.get(e.target) || [e.target]).forEach(function (el) {
        el.classList.add('in');
        el.querySelectorAll('[data-count]').forEach(countUp);
      });
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) {
    var t = el.classList.contains('reveal-photo') ? el.parentElement : el;
    if (!watch.has(t)) watch.set(t, []);
    watch.get(t).push(el);
    io.observe(t);
  });

  // ---- Count-up numbers ----
  function countUp(el) {
    var end = parseInt(el.dataset.count, 10);
    if (reduced || !end) return;
    var t0 = null, dur = 1400;
    function fmt(n) { return n.toLocaleString('en-US'); }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  // ---- Story: one fact at a time ----
  var beats = Array.prototype.slice.call(document.querySelectorAll('.beat'));
  var nums = document.querySelectorAll('.story-num .n');
  if (beats.length) {
    var active = -1;
    var pick = function () {
      var mid = window.innerHeight / 2, best = 0, bestD = Infinity;
      beats.forEach(function (b, i) {
        var r = b.querySelector('.beat-txt').getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best === active) return;
      active = best;
      beats.forEach(function (b, i) { b.classList.toggle('is-on', i === best); });
      nums.forEach(function (n) { n.classList.toggle('is-on', +n.dataset.beat === best); });
    };
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return; queued = true;
      requestAnimationFrame(function () { pick(); queued = false; });
    }, { passive: true });
    pick();
  }

  // ---- Join cards: sideways swipe on phones, dots follow ----
  var jg = document.querySelector('.join-grid');
  var jd = document.querySelectorAll('.join-dots span');
  if (jg && jd.length) {
    jg.addEventListener('scroll', function () {
      var cards = jg.children, mid = jg.getBoundingClientRect().left + jg.clientWidth / 2, best = 0, bestD = Infinity;
      Array.prototype.forEach.call(cards, function (c, i) {
        var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      jd.forEach(function (d, i) { d.classList.toggle('on', i === best); });
    }, { passive: true });
  }

  // ---- Hero road (desktop): the arc stands beside the photo (as far out as the screen allows) -
  // the rest of the road runs behind the photo, so its ends are never seen ----
  var hero = document.querySelector('.hero');
  var wide = window.matchMedia('(min-width: 901px)');
  var geo = null;
  function measure(svg) {
    var vb = svg.viewBox.baseVal, pts = [];
    svg.querySelectorAll('path').forEach(function (p) {
      var L = p.getTotalLength();
      for (var i = 0; i <= L; i += 4) { var q = p.getPointAtLength(i); pts.push([q.x, q.y]); }
    });
    var edgeX = vb.x + vb.width * 0.01;
    var startYs = pts.filter(function (q) { return q[0] < edgeX; }).map(function (q) { return q[1]; });
    var startY = Math.min.apply(null, startYs), startY2 = Math.max.apply(null, startYs);
    var arch = pts.filter(function (q) { return q[1] < startY - 2 && q[0] < vb.x + vb.width * 0.75; });
    var xs = arch.map(function (q) { return q[0]; });
    return { vb: vb, pts: pts, startY2: startY2,
      archMid: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2,
      archHalf: (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2,
      archTop: Math.min.apply(null, arch.map(function (q) { return q[1]; })) };
  }
  function placeRoad() {
    var svg = hero && hero.querySelector('svg.route');
    if (!svg) return;
    if (!wide.matches) { svg.removeAttribute('style'); return; }
    if (!geo) geo = measure(svg);
    var wrap = svg.parentElement.getBoundingClientRect();
    var photo = hero.querySelector('.hero-photo').getBoundingClientRect();
    var w = window.innerWidth >= 1300 ? 1700 : 1400;
    var s = w / geo.vb.width;
    var half = s * geo.archHalf;
    // as far beside the photo as the screen allows; whatever doesn't fit passes behind the photo
    var center = Math.max(16 + half, photo.left - half - 24);
    var left = center - s * (geo.archMid - geo.vb.x);
    var top = photo.top - 48 - s * (geo.archTop - geo.vb.y);       // arc rises a little above the photo
    svg.style.width = w + 'px';
    svg.style.left = (left - wrap.left) + 'px';
    svg.style.top = (top - wrap.top) + 'px';
    svg.style.bottom = 'auto';
  }
  if (hero) {
    var tries = 0, wait = setInterval(function () {
      if (hero.querySelector('svg.route') || ++tries > 40) { clearInterval(wait); placeRoad(); }
    }, 100);
    window.addEventListener('resize', placeRoad);
  }
});
