/*
  Cookie consent (per the nonprofit's lawyer: minimal marketing cookies,
  and visitors choose whether to allow non-essential ones).

  Nothing non-essential is loaded until the visitor agrees.
  To add analytics/marketing later, register a loader:
    AmitConsent.onGrant('analytics', () => { ...load script... });
*/
(function () {
  var KEY = 'amit-cookie-consent-v1';
  var listeners = { analytics: [], marketing: [] };

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage blocked: banner shows again next visit */ }
  }
  function fire(state) {
    Object.keys(listeners).forEach(function (k) {
      if (state && state[k]) listeners[k].splice(0).forEach(function (fn) { fn(); });
    });
  }

  window.AmitConsent = {
    get: read,
    onGrant: function (kind, fn) {
      var s = read();
      if (s && s[kind]) fn(); else listeners[kind].push(fn);
    },
    open: function () { show(true); }
  };

  var bar;
  function show(withPrefs) {
    if (!bar) return;
    bar.hidden = false;
    var prefs = bar.querySelector('.cookie-prefs');
    var s = read() || {};
    bar.querySelector('#ck-analytics').checked = !!s.analytics;
    bar.querySelector('#ck-marketing').checked = !!s.marketing;
    if (withPrefs) prefs.hidden = false;
    bar.querySelector('h2').focus();
  }
  function save(state) {
    state.date = new Date().toISOString();
    write(state);
    bar.hidden = true;
    fire(state);
  }

  document.addEventListener('DOMContentLoaded', function () {
    bar = document.getElementById('cookie-bar');
    if (!bar) return;
    var prefs = bar.querySelector('.cookie-prefs');
    bar.querySelector('[data-ck="all"]').addEventListener('click', function () { save({ analytics: true, marketing: true }); });
    bar.querySelector('[data-ck="essential"]').addEventListener('click', function () { save({ analytics: false, marketing: false }); });
    bar.querySelector('[data-ck="prefs"]').addEventListener('click', function () {
      if (prefs.hidden) { prefs.hidden = false; this.textContent = 'שמירת הבחירה'; return; }
      save({ analytics: bar.querySelector('#ck-analytics').checked, marketing: bar.querySelector('#ck-marketing').checked });
    });
    document.querySelectorAll('[data-open-cookies]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); show(true); });
    });
    var s = read();
    if (!s) { bar.hidden = false; } else { fire(s); }
  });
})();
