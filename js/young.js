// Youth feed: vertical, one card at a time (phone and desktop).
document.addEventListener('DOMContentLoaded', function () {
  var feed = document.getElementById('feed');
  var cards = Array.prototype.slice.call(feed.querySelectorAll('.card'));
  var dots = document.getElementById('dots');
  var pos = document.getElementById('pos');
  var bar = document.getElementById('bar');
  var prev = document.querySelector('.pager .prev');
  var next = document.querySelector('.pager .next');
  var desktop = window.matchMedia('(min-width: 1024px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.getElementById('total').textContent = cards.length;
  cards.forEach(function () { dots.appendChild(document.createElement('span')); });
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabbar a'));
  var current = 0;

  function setActive(i) {
    current = i;
    pos.textContent = i + 1;
    Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('on', j === i); });
    if (bar) bar.style.width = ((i + 1) / cards.length * 100) + '%';
    prev.disabled = i === 0;
    next.disabled = i === cards.length - 1;
    document.body.dataset.tone = cards[i].dataset.tone || 'dark';
    document.body.classList.toggle('at-end', i === cards.length - 1);
    // current tab = the last tab whose target is at or before this card
    var best = null;
    tabs.forEach(function (t) {
      var idx = cards.indexOf(document.querySelector(t.getAttribute('href')));
      if (idx > -1 && idx <= i && (!best || idx >= best.idx)) best = { t: t, idx: idx };
    });
    tabs.forEach(function (t) { t.removeAttribute('aria-current'); });
    if (best) best.t.setAttribute('aria-current', 'true');
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.intersectionRatio > 0.6) setActive(cards.indexOf(e.target));
    });
  }, { root: feed, threshold: [0.3, 0.65] });
  cards.forEach(function (c) { io.observe(c); });
  // Safety net: show whatever is already on screen, even if the observer is late
  function showVisible() {
    cards.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) c.classList.add('in'); });
  }
  setTimeout(showVisible, 250);
  window.addEventListener('load', showVisible);
  setActive(0);

  function go(i, focus) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    cards[i].scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center', inline: 'start' });
    if (focus) {
      var h = cards[i].querySelector('h1, h2');
      if (h) { h.setAttribute('tabindex', '-1'); setTimeout(function () { h.focus({ preventScroll: true }); }, 450); }
    }
  }
  prev.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });

  document.querySelectorAll('a[href^="#c-"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      go(cards.indexOf(t), true);
    });
  });

  // Keyboard: up/down arrows move one card
  document.addEventListener('keydown', function (e) {
    if (desktop.matches) return; // desktop: normal page scrolling
    if (e.target.closest('input, textarea, button[data-ck]')) return;
    var k = e.key;
    var fwd = k === 'ArrowDown' || k === 'PageDown';
    var back = k === 'ArrowUp' || k === 'PageUp';
    if (fwd) { e.preventDefault(); go(current + 1); }
    if (back) { e.preventDefault(); go(current - 1); }
  });

  // Share
  document.querySelectorAll('.share').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var data = { title: 'יש לך עמית לדרך', text: 'השתחררת? שנה של ליווי אישי, ללא עלות', url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () {
        var l = btn.querySelector('.lbl'); var old = l.textContent; l.textContent = 'הועתק'; setTimeout(function () { l.textContent = old; }, 1800);
      });
    });
  });

  // Success-story buttons link to the YouTube channel for now.
  // When the story videos arrive, swap the href (or load the video on click - never embed before consent).
});
