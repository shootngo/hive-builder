/* Frank's Hive Builder — IndexedDB storage for builds (+ export/import JSON) */
(function () {
  'use strict';
  var HB = window.HB, DBN = 'hive-builder', ST = 'builds', dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      var r = indexedDB.open(DBN, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(ST, { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(ST, mode), s = t.objectStore(ST), out = fn(s);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  HB.db = {
    all: function () { return tx('readonly', function (s) { return s.getAll(); }).then(function (a) { return (a || []).sort(function (x, y) { return y.created - x.created; }); }); },
    get: function (id) { return tx('readonly', function (s) { return s.get(id); }); },
    put: function (b) { b.updated = Date.now(); return tx('readwrite', function (s) { s.put(b); }).then(function () { return b; }); },
    del: function (id) { return tx('readwrite', function (s) { s.delete(id); }); },
    exportAll: function () { return HB.db.all().then(function (a) { return { app: 'hive-builder', version: window.HB_VERSION, exported: new Date().toISOString(), builds: a, guide: JSON.parse(localStorage.getItem('hb_guide') || '{}'), prices: JSON.parse(localStorage.getItem('hb_prices') || '{}') }; }); },
    importAll: function (obj) {
      if (!obj || !Array.isArray(obj.builds)) return Promise.reject(new Error('Not a Hive Builder export'));
      if (obj.guide) localStorage.setItem('hb_guide', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('hb_guide') || '{}'), obj.guide)));
      return Promise.all(obj.builds.map(function (b) { return HB.db.put(b); })).then(function () { return obj.builds.length; });
    }
  };
  HB.newBuild = function (o) {
    var parts = [], k;
    function add(key, label) { parts.push({ key: key, label: label, cut: false, assembled: false }); }
    for (k = 1; k <= o.deep; k++) add('deep' + k, 'Deep box #' + k);
    for (k = 1; k <= o.medium; k++) add('medium' + k, 'Medium super #' + k);
    for (k = 1; k <= o.shallow; k++) add('shallow' + k, 'Shallow super #' + k);
    add('bottom', o.bottom === 'bottom-solid' ? 'Bottom board (solid)' : 'Bottom board (screened)');
    add('inner', 'Inner cover'); add('outer', 'Telescoping cover'); add('reducer', 'Entrance reducer');
    if (o.stand) add('stand', 'Stand');
    add('frames', 'Frames (' + (o.frames * (o.deep + o.medium + o.shallow)) + ')');
    return { id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: o.name, created: Date.now(), cfg: o, parts: parts, photos: [], notes: '' };
  };
  /* guide progress: { buildId|'shop': { comp: [doneStepIdx...] } } in localStorage (small) */
  HB.gp = {
    get: function (bid, comp) { var g = JSON.parse(localStorage.getItem('hb_guide') || '{}'); return ((g[bid] || {})[comp]) || []; },
    toggle: function (bid, comp, i) {
      var g = JSON.parse(localStorage.getItem('hb_guide') || '{}'); g[bid] = g[bid] || {}; var a = g[bid][comp] || [], p = a.indexOf(i);
      if (p >= 0) a.splice(p, 1); else a.push(i); g[bid][comp] = a; localStorage.setItem('hb_guide', JSON.stringify(g)); return p < 0;
    }
  };
  HB.resizeImage = function (file, max) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, (max || 1280) / Math.max(img.width, img.height)), cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        res(cv.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = rej; img.src = url;
    });
  };
})();
