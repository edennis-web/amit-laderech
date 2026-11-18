/*
  Route-line drawing.
  Each brand route-line SVG is one <path> holding six parallel sub-paths.
  We inline it, split it into six paths, and draw them together:
    data-draw="load"   → draws once when the page loads
    data-draw="scroll" → draws as the section scrolls through the viewport
  If anything fails (e.g. opened from file://) the original <img> stays as is.
*/
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollers = [];

  function inline(img) {
    return fetch(img.getAttribute('src')).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (txt) {
      var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      var svg = doc.documentElement;
      var src = svg.querySelector('path');
      var parts = src.getAttribute('d').split(/(?=M)/).filter(function (s) { return s.trim(); });
      parts.forEach(function (d) {
        var p = src.cloneNode();
        p.setAttribute('d', d);
        p.setAttribute('pathLength', '1');
        svg.appendChild(p);
      });
      src.remove();
      svg.removeAttribute('width'); svg.removeAttribute('height');
      svg.setAttribute('class', img.getAttribute('class'));
      svg.setAttribute('data-draw', img.dataset.draw);
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      img.replaceWith(svg);
      return svg;
    });
  }

  function update() {
    var vh = window.innerHeight;
    scrollers.forEach(function (svg) {
      var host = svg.parentElement.getBoundingClientRect();
      // 0 when the section's top reaches the bottom of the screen, 1 when it is ~60% scrolled through
      var p = (vh - host.top) / (vh * 0.4 + host.height * 0.6);
      p = Math.max(0, Math.min(1, p));
      svg.style.setProperty('--draw', (1 - p).toFixed(4));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (reduced) return;
    document.querySelectorAll('img.route[data-draw]').forEach(function (img) {
      inline(img).then(function (svg) {
        if (svg.dataset.draw === 'load') {
          requestAnimationFrame(function () { requestAnimationFrame(function () { svg.classList.add('drawn'); }); });
        } else {
          scrollers.push(svg); update();
        }
      }).catch(function () {});
    });
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update);
  });
})();
