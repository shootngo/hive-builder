/* Frank's Hive Builder — Builds tracker, Costs, router, menu */
(function () {
  'use strict';
  var HB = window.HB, E = HB.esc, main = document.getElementById('main');

  function pageBuilds(el, id) {
    if (!id) {
      HB.db.all().then(function (bs) {
        el.innerHTML = '<div class="pad"><h2>Builds</h2><div class="form"><label class="fl">Name <input id="bn" value="Hive #' + (bs.length + 1) + ' — 2 deeps + 2 mediums"></label>' +
          '<div class="fl3"><label>Deeps <input type="number" id="bd" value="2" min="0" max="4"></label><label>Mediums <input type="number" id="bm" value="2" min="0" max="6"></label><label>Shallows <input type="number" id="bs" value="0" min="0" max="6"></label></div>' +
          HB.seg('nf', HB.cfg.frames, [[10, '10-frame'], [8, '8-frame']]) + HB.seg('nb', HB.cfg.bottom, [['bottom-screened', 'Screened'], ['bottom-solid', 'Solid']]) +
          '<button type="button" class="btn big" id="bnew">＋ Create build</button></div>' +
          '<div class="list">' + (bs.length ? bs.map(function (b) {
            var tot = b.parts.length * 2, d = b.parts.reduce(function (s, p) { return s + (p.cut ? 1 : 0) + (p.assembled ? 1 : 0); }, 0);
            return '<a class="li" href="#builds/' + b.id + '"><span>' + E(b.name) + '<small>' + new Date(b.created).toLocaleDateString() + ' · ' + b.photos.length + ' photos</small></span><span class="pill' + (d >= tot ? ' ok' : '') + '">' + Math.round(d / tot * 100) + '%</span></a>';
          }).join('') : '<p class="meta">No builds yet.</p>') + '</div>' +
          '<div class="row2"><button type="button" class="btn alt" id="exp">Export JSON</button><label class="btn alt">Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label></div></div>';
        var sel = { nf: HB.cfg.frames, nb: HB.cfg.bottom };
        el.querySelectorAll('[data-seg]').forEach(function (s) { s.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sel[s.getAttribute('data-seg')] = b.getAttribute('data-v'); s.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); }); });
        el.querySelector('#bnew').addEventListener('click', function () {
          var b = HB.newBuild({ name: el.querySelector('#bn').value || 'Hive', deep: +el.querySelector('#bd').value || 0, medium: +el.querySelector('#bm').value || 0, shallow: +el.querySelector('#bs').value || 0, frames: +sel.nf, bottom: sel.nb, stand: true });
          HB.db.put(b).then(function () { localStorage.setItem('hb_curbuild', b.id); location.hash = '#builds/' + b.id; });
        });
        el.querySelector('#exp').addEventListener('click', exportAll);
        el.querySelector('#imp').addEventListener('change', importFile);
      });
      return;
    }
    HB.db.get(id).then(function (b) {
      if (!b) { el.innerHTML = '<div class="pad"><a class="back" href="#builds">‹ Builds</a><p>Build not found.</p></div>'; return; }
      el.innerHTML = '<div class="pad"><a class="back" href="#builds">‹ Builds</a><h2 contenteditable="true" id="bname">' + E(b.name) + '</h2>' +
        '<p class="meta">' + b.cfg.frames + '-frame · ' + b.cfg.deep + ' deep, ' + b.cfg.medium + ' medium, ' + b.cfg.shallow + ' shallow</p>' +
        '<table class="tbl chk"><tr><th>Part</th><th>Cut</th><th>Built</th></tr>' + b.parts.map(function (p, i) {
          return '<tr><td>' + E(p.label) + '</td><td><button type="button" class="tick' + (p.cut ? ' on' : '') + '" data-i="' + i + '" data-f="cut">' + (p.cut ? '✓' : '') + '</button></td><td><button type="button" class="tick' + (p.assembled ? ' on' : '') + '" data-i="' + i + '" data-f="assembled">' + (p.assembled ? '✓' : '') + '</button></td></tr>';
        }).join('') + '</table>' +
        '<a class="btn big" href="#steps" id="go">Open build guides for this build ›</a>' +
        '<h3>Photos</h3><div class="photos">' + b.photos.map(function (ph, i) { return '<div class="ph"><img src="' + ph.src + '" alt="build photo"><button type="button" data-delph="' + i + '" aria-label="Delete photo">✕</button></div>'; }).join('') +
        '<label class="ph add">＋<br>Photo<input type="file" id="addph" accept="image/*" capture="environment" hidden></label></div>' +
        '<h3>Notes</h3><textarea id="notes" rows="4" placeholder="Lumber source, finish, which colony…">' + E(b.notes) + '</textarea>' +
        '<div class="row2"><button type="button" class="btn alt" id="dup">Duplicate</button><button type="button" class="btn danger" id="del">Delete build</button></div></div>';
      function save() { return HB.db.put(b); }
      el.querySelectorAll('.tick').forEach(function (t) { t.addEventListener('click', function () { var p = b.parts[+t.getAttribute('data-i')], f = t.getAttribute('data-f'); p[f] = !p[f]; t.classList.toggle('on', p[f]); t.textContent = p[f] ? '✓' : ''; if (p[f] && navigator.vibrate) navigator.vibrate(25); save(); }); });
      el.querySelector('#bname').addEventListener('blur', function (e) { b.name = e.target.textContent.trim() || b.name; save(); });
      el.querySelector('#notes').addEventListener('change', function (e) { b.notes = e.target.value; save(); });
      el.querySelector('#go').addEventListener('click', function () { localStorage.setItem('hb_curbuild', b.id); });
      el.querySelector('#addph').addEventListener('change', function (e) {
        var f = e.target.files[0]; if (!f) return;
        HB.resizeImage(f, 1280).then(function (src) { b.photos.push({ id: Date.now(), src: src, at: new Date().toISOString() }); return save(); }).then(function () { pageBuilds(el, id); }).catch(function () { HB.toast('Could not read photo'); });
      });
      el.querySelectorAll('[data-delph]').forEach(function (x) { x.addEventListener('click', function () { if (!confirm('Delete this photo?')) return; b.photos.splice(+x.getAttribute('data-delph'), 1); save().then(function () { pageBuilds(el, id); }); }); });
      el.querySelector('#dup').addEventListener('click', function () { var n = JSON.parse(JSON.stringify(b)); n.id = 'b' + Date.now().toString(36); n.name = b.name + ' (copy)'; n.created = Date.now(); n.photos = []; n.parts.forEach(function (p) { p.cut = p.assembled = false; }); HB.db.put(n).then(function () { location.hash = '#builds/' + n.id; }); });
      el.querySelector('#del').addEventListener('click', function () { if (confirm('Delete "' + b.name + '" and its photos from this phone?')) HB.db.del(b.id).then(function () { location.hash = '#builds'; }); });
    });
  }
  function exportAll() { HB.db.exportAll().then(function (o) { HB.download('hive-builder-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(o), 'application/json'); }); }
  function importFile(e) {
    var f = e.target.files[0]; if (!f) return;
    f.text().then(function (t) { return HB.db.importAll(JSON.parse(t)); }).then(function (n) { HB.toast('Imported ' + n + ' build(s)'); route(); }).catch(function (er) { alert('Import failed: ' + er.message); });
  }

  function pageCost(el) {
    var pr = HB.loadPrices(), c = HB.cfg, r = HB.optimize(c), items = HB.materials(c, r, pr), tot = items.reduce(function (s, i) { return s + i.cost; }, 0);
    el.innerHTML = '<div class="pad"><h2>Materials &amp; cost</h2><p class="meta">For the job in Cut List: ' + c.hives + ' hives, ' + c.deep + 'D + ' + c.medium + 'M + ' + c.shallow + 'S, ' + HB.SPECIES[c.species] + ' ' + HB.frac(c.t) + '. <b>Prices are rough estimates</b>; edit them to what your lumberyard or sawmill charges.</p>' +
      '<table class="tbl cost"><tr><th>Item</th><th>Qty</th><th>$</th></tr>' + items.map(function (i) { return '<tr><td>' + E(i.name) + (i.note ? '<div class="op">' + E(i.note) + '</div>' : '') + '</td><td class="q">' + i.qty + ' ' + E(i.unit) + '</td><td class="d">' + i.cost.toFixed(2) + '</td></tr>'; }).join('') +
      '<tr class="tot"><td>Total (est.)</td><td></td><td class="d">$' + tot.toFixed(2) + '</td></tr><tr><td>Per hive</td><td></td><td class="d">$' + (tot / c.hives).toFixed(2) + '</td></tr></table>' +
      '<div class="row2"><button type="button" class="btn big" id="shop">Export shopping list</button><button type="button" class="btn big alt" id="share">Share / copy</button></div>' +
      '<h3>Edit prices (estimates)</h3><div class="prices">' + Object.keys(HB.PRICE_LABELS).map(function (k) { return '<label class="fl">' + E(HB.PRICE_LABELS[k]) + ' <input type="number" inputmode="decimal" step="0.05" data-p="' + k + '" value="' + pr[k] + '"></label>'; }).join('') +
      '</div><button type="button" class="btn alt" id="reset">Reset to default estimates</button></div>';
    el.querySelectorAll('[data-p]').forEach(function (i) { i.addEventListener('change', function () { pr[i.getAttribute('data-p')] = +i.value || 0; localStorage.setItem('hb_prices', JSON.stringify(pr)); var y = scrollY; pageCost(el); scrollTo(0, y); }); });
    el.querySelector('#reset').addEventListener('click', function () { localStorage.removeItem('hb_prices'); pageCost(el); });
    function txt() { return ["Frank's Hive Builder — shopping list", c.hives + ' hives (' + c.frames + '-frame), ' + HB.SPECIES[c.species] + ' ' + HB.frac(c.t), ''].concat(items.map(function (i) { return '☐ ' + i.qty + ' ' + i.unit + ' — ' + i.name + '  (~$' + i.cost.toFixed(2) + ')'; })).concat(['', 'Estimated total: $' + tot.toFixed(2) + ' (prices are estimates)']).join('\n'); }
    el.querySelector('#shop').addEventListener('click', function () { HB.download('hive-shopping-list.txt', txt()); });
    el.querySelector('#share').addEventListener('click', function () {
      var t = txt();
      if (navigator.share) navigator.share({ title: 'Hive shopping list', text: t }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { HB.toast('Copied'); });
    });
  }

  var TABS = ['parts', 'cuts', 'steps', 'builds', 'cost', 'region'];
  function route() {
    var h = (location.hash || '#parts').slice(1).split('/'), p = h[0] || 'parts';
    document.querySelectorAll('.tabs a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-t') === p); });
    main.scrollTop = 0; window.scrollTo(0, 0);
    if (p === 'parts') HB.pageParts(main, h[1]);
    else if (p === 'cuts') HB.pageCuts(main);
    else if (p === 'steps') HB.pageSteps(main, h[1], +h[2] || 0);
    else if (p === 'builds') pageBuilds(main, h[1]);
    else if (p === 'cost') pageCost(main);
    else if (p === 'region') { main.innerHTML = HB.regionHtml(); }
    else if (p === 'specs') { main.innerHTML = HB.specsHtml(); }
    else HB.pageParts(main);
  }
  HB.route = route;
  window.addEventListener('hashchange', route);

  var menu = document.getElementById('menu');
  document.getElementById('btnMenu').addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('hidden'); });
  document.addEventListener('click', function (e) { if (!menu.classList.contains('hidden') && !e.target.closest('#menu')) menu.classList.add('hidden'); });
  function unitLabel() { document.getElementById('uBtn').textContent = HB.units === 'mm' ? 'mm' : 'in'; var m = menu.querySelector('[data-action="units"]'); if (m) m.textContent = 'Units: ' + (HB.units === 'mm' ? 'mm → switch to inches' : 'inches (1/16") → switch to mm'); }
  function toggleUnits() { HB.setUnits(HB.units === 'mm' ? 'in' : 'mm'); unitLabel(); route(); HB.toast(HB.units === 'mm' ? 'Millimeters' : 'Inches (1/16")'); }
  document.getElementById('uBtn').addEventListener('click', toggleUnits);
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]'); if (!b) return; menu.classList.add('hidden');
    var a = b.getAttribute('data-action');
    if (a === 'check-update') HB.checkUpdate();
    else if (a === 'units') toggleUnits();
    else if (a === 'specs') location.hash = '#specs';
    else if (a === 'region') location.hash = '#region';
    else if (a === 'export') exportAll();
    else if (a === 'about') alert("Frank's Hive Builder " + window.HB_VERSION + '\n\nLangstroth box builder for the shop. Works offline once loaded. Data stays on this phone (IndexedDB); use Export JSON to back up.');
  });
  unitLabel();
  route();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).catch(function () {});
})();
