/* Frank's Hive Builder — UI helpers: escaping, pinch-zoom, menu, units, update check, toasts */
(function () {
  'use strict';
  var HB = window.HB;
  HB.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  HB.toast = function (msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(HB._tt); HB._tt = setTimeout(function () { t.classList.remove('show'); }, 2200);
  };
  HB.download = function (name, text, type) {
    var b = new Blob([text], { type: type || 'text/plain' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  HB.zoomBox = function (v) {
    return '<figure class="fig"><figcaption>' + HB.esc(v.title) + '</figcaption><div class="zoom">' + v.svg +
      '<div class="zb"><button type="button" data-z="in" aria-label="Zoom in">＋</button><button type="button" data-z="out" aria-label="Zoom out">－</button><button type="button" data-z="reset" aria-label="Reset zoom">⟲</button></div></div>' +
      (v.note ? '<p class="meta">' + HB.esc(v.note) + '</p>' : '') + '</figure>';
  };
  /* Pinch / drag zoom on .zoom containers (pointer events; scale via CSS transform) */
  HB.initZoom = function (root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('.zoom'), function (el) {
      if (el._z) return; var svg = el.querySelector('svg'); if (!svg) return;
      var st = { s: 1, x: 0, y: 0 }, pts = {}, start = null; el._z = st;
      function apply() {
        st.s = Math.max(1, Math.min(6, st.s));
        var w = el.clientWidth, h = el.clientHeight;
        st.x = Math.min(0, Math.max(w - w * st.s, st.x)); st.y = Math.min(0, Math.max(h - h * st.s, st.y));
        if (st.s === 1) { st.x = 0; st.y = 0; }
        svg.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px) scale(' + st.s + ')';
        el.style.touchAction = st.s > 1 ? 'none' : 'pan-y';
        el.classList.toggle('zoomed', st.s > 1);
      }
      function zoomAt(f, cx, cy) { var ns = Math.max(1, Math.min(6, st.s * f)); st.x = cx - (cx - st.x) * ns / st.s; st.y = cy - (cy - st.y) * ns / st.s; st.s = ns; apply(); }
      el.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.zb')) return;
        pts[e.pointerId] = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId); } catch (x) {}
        var k = Object.keys(pts);
        if (k.length === 2) { var a = pts[k[0]], b = pts[k[1]]; start = { d: Math.hypot(a.x - b.x, a.y - b.y), s: st.s, x: st.x, y: st.y, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; }
        else start = { px: e.clientX, py: e.clientY, x: st.x, y: st.y };
      });
      el.addEventListener('pointermove', function (e) {
        if (!pts[e.pointerId] || !start) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        var k = Object.keys(pts), r = el.getBoundingClientRect();
        if (k.length >= 2 && start.d) {
          var a = pts[k[0]], b = pts[k[1]], d = Math.hypot(a.x - b.x, a.y - b.y), ns = Math.max(1, Math.min(6, start.s * d / start.d));
          var cx = start.cx - r.left, cy = start.cy - r.top;
          st.x = cx - (cx - start.x) * ns / start.s; st.y = cy - (cy - start.y) * ns / start.s; st.s = ns; apply(); e.preventDefault();
        } else if (st.s > 1 && start.px !== undefined) { st.x = start.x + e.clientX - start.px; st.y = start.y + e.clientY - start.py; apply(); e.preventDefault(); }
      });
      function up(e) { delete pts[e.pointerId]; var k = Object.keys(pts); start = k.length === 1 ? { px: pts[k[0]].x, py: pts[k[0]].y, x: st.x, y: st.y } : null; }
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      var last = 0;
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-z]'), r = el.getBoundingClientRect();
        if (b) { var z = b.getAttribute('data-z'); if (z === 'reset') { st.s = 1; apply(); } else zoomAt(z === 'in' ? 1.6 : 1 / 1.6, r.width / 2, r.height / 2); return; }
        var now = Date.now(); if (now - last < 320) { if (st.s > 1) { st.s = 1; apply(); } else zoomAt(2.2, e.clientX - r.left, e.clientY - r.top); } last = now;
      });
      el.addEventListener('wheel', function (e) { if (!e.ctrlKey) return; e.preventDefault(); var r = el.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
      apply();
    });
  };
  HB.checkUpdate = function () {
    var V = window.HB_VERSION;
    if (!('serviceWorker' in navigator)) { alert('You are on ' + V); return; }
    HB.toast('Checking for update…');
    navigator.serviceWorker.getRegistration('./').then(function (reg) {
      return reg || navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
    }).then(function (reg) {
      return reg.update().then(function () { return new Promise(function (r) { setTimeout(r, 800); }); }).then(function () { return reg; });
    }).then(function (reg) {
      var w = reg.waiting || reg.installing;
      if (w && confirm('New version found. Update now?\n\nCurrently ' + V)) {
        w.postMessage({ type: 'SKIP_WAITING' });
        navigator.serviceWorker.addEventListener('controllerchange', function () { location.reload(); });
        setTimeout(function () { location.reload(); }, 1500); return;
      }
      if (!w) alert('You are on ' + V + ' — already the latest.');
    }).catch(function () { alert('Could not check (offline?).\n\nYou are on ' + V + '.'); });
  };
})();
