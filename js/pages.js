/* Frank's Hive Builder — Parts picker, Cut list, Build steps pages */
(function () {
  'use strict';
  var HB = window.HB, E = HB.esc;
  HB.cfg = HB.loadCfg();
  function opts() { var c = HB.cfg; return { frames: c.frames, t: c.t, joint: c.joint, handhold: c.handhold, standH: c.standH }; }
  HB.opts = opts;
  function seg(name, val, choices) {
    return '<div class="seg" data-seg="' + name + '">' + choices.map(function (ch) { return '<button type="button" data-v="' + ch[0] + '" class="' + (String(val) === String(ch[0]) ? 'on' : '') + '">' + ch[1] + '</button>'; }).join('') + '</div>';
  }
  HB.seg = seg;
  function optBar(full) {
    var c = HB.cfg;
    return '<div class="optbar">' + seg('frames', c.frames, [[10, '10-frame'], [8, '8-frame']]) + seg('t', c.t, [[0.75, '3/4" stock'], [0.875, '7/8" stock']]) +
      (full ? seg('joint', c.joint, [['box', 'Box joint'], ['rabbet', 'Rabbet'], ['butt', 'Butt']]) + seg('handhold', c.handhold, [['cleat', 'Cleat handhold'], ['routed', 'Routed']]) : '') + '</div>';
  }
  HB.bindSeg = function (root, after) {
    root.querySelectorAll('[data-seg]').forEach(function (s) {
      s.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var k = s.getAttribute('data-seg'), v = b.getAttribute('data-v');
        HB.cfg[k] = isNaN(+v) ? v : +v; HB.saveCfg(HB.cfg); after();
      });
    });
  };
  var ICON = { deep: '▭', medium: '▬', shallow: '▁', 'bottom-solid': '⎽', 'bottom-screened': '▦', inner: '◫', outer: '⌂', 'frame-deep': '▯', 'frame-medium': '▯', 'frame-shallow': '▯', reducer: '▔', stand: '┳' };

  HB.pageParts = function (el, comp) {
    if (!comp) {
      el.innerHTML = '<div class="pad"><h2>Pick a component</h2>' + optBar(false) + '<div class="grid">' + HB.COMP_LIST.map(function (k) {
        return '<a class="tile" href="#parts/' + k + '"><span class="ti">' + ICON[k] + '</span>' + E(HB.NAMES[k]) + '</a>';
      }).join('') + '</div><p class="meta">All drawings use verified Langstroth standards. Tap ☰ → Specs for the corrections to your outline.</p></div>';
      HB.bindSeg(el, function () { HB.pageParts(el); });
      return;
    }
    var o = opts(), views = HB.diagram(comp, o), parts = HB.parts(comp, o), isBox = !!HB.STD.height[comp];
    var h = '<div class="pad"><a class="back" href="#parts">‹ All parts</a><h2>' + E(HB.NAMES[comp]) + '</h2>' + optBar(isBox) +
      views.map(HB.zoomBox).join('');
    if (isBox && o.joint === 'box') {
      h += '<h3>Finger layout (from bottom edge)</h3><table class="tbl"><tr><th>#</th><th>From – to</th><th>End board</th><th>Long side</th></tr>' +
        HB.fingers(HB.STD.height[comp]).map(function (u, i) {
          var e = u.owner === 'end' || u.owner === 'top' ? 'finger' : 'slot', l = u.owner === 'long' ? 'finger' : (u.owner === 'top' ? 'finger 3/8" long' : 'slot');
          return '<tr><td>' + (i + 1) + '</td><td>' + HB.f(u.y0) + ' – ' + HB.f(u.y1) + '</td><td>' + e + (u.owner === 'top' ? ' (rabbeted)' : '') + '</td><td>' + l + '</td></tr>';
        }).join('') + '</table>';
    }
    h += '<h3>Parts for one</h3>' + partsTable(parts) +
      '<div class="row2"><a class="btn big" href="#steps/' + (HB.GUIDE_LIST.indexOf(comp) >= 0 ? comp : 'stack') + '/0">Build steps ›</a><a class="btn big alt" href="#cuts">Cut list ›</a></div></div>';
    el.innerHTML = h; HB.initZoom(el);
    HB.bindSeg(el, function () { HB.pageParts(el, comp); });
  };
  function dimTxt(p) { return p.t < 0.05 ? HB.f(p.w) + ' × ' + HB.f(p.L) + ' (sheet)' : HB.txwxl(p); }
  function partsTable(rows) {
    return '<table class="tbl cut"><tr><th>Part · T × W × L · operation</th><th>Qty</th></tr>' + rows.map(function (p) {
      return '<tr><td><b class="code">' + E(p.code) + '</b> ' + E(p.name) + '<div class="dims">' + dimTxt(p) + '</div>' + (p.op ? '<div class="op">' + E(p.op) + '</div>' : '') + '</td><td class="q">' + p.qty + '</td></tr>';
    }).join('') + '</table>';
  }

  HB.pageCuts = function (el) {
    var c = HB.cfg, num = function (k, v, min, max, step) { return '<input type="number" inputmode="decimal" data-k="' + k + '" value="' + v + '" min="' + min + '" max="' + max + '" step="' + (step || 1) + '">'; };
    var chk = function (k, v, label) { return '<label class="ck"><input type="checkbox" data-k="' + k + '"' + (v ? ' checked' : '') + '><span>' + label + '</span></label>'; };
    var h = '<div class="pad"><h2>Cut list generator</h2><div class="form">' +
      '<label class="fl">Hives ' + num('hives', c.hives, 1, 50) + '</label>' +
      '<div class="fl3"><label>Deeps/hive ' + num('deep', c.deep, 0, 4) + '</label><label>Mediums/hive ' + num('medium', c.medium, 0, 6) + '</label><label>Shallows/hive ' + num('shallow', c.shallow, 0, 6) + '</label></div>' +
      seg('frames', c.frames, [[10, '10-frame'], [8, '8-frame']]) + seg('bottom', c.bottom, [['bottom-screened', 'Screened bottom'], ['bottom-solid', 'Solid bottom']]) +
      '<div class="cks">' + chk('inner', c.inner, 'Inner cover') + chk('outer', c.outer, 'Telescoping cover') + chk('reducer', c.reducer, 'Entrance reducer') + chk('stand', c.stand, 'Stand') + chk('makeFrames', c.makeFrames, 'Make frames too') + '</div>' +
      '<label class="fl">Stand height (in) ' + num('standH', c.standH, 18, 24) + '</label>' +
      '<h3>Lumber</h3>' + seg('species', c.species, [['cypress', 'Cypress'], ['cedar', 'Cedar'], ['pine', 'Pine']]) + seg('t', c.t, [[0.75, '3/4"'], [0.875, '7/8"']]) +
      seg('joint', c.joint, [['box', 'Box joint'], ['rabbet', 'Rabbet'], ['butt', 'Butt']]) + seg('handhold', c.handhold, [['cleat', 'Cleats'], ['routed', 'Routed']]) +
      '<div class="cks">' + Object.keys(HB.BOARDS).map(function (k) { return '<label class="ck"><input type="checkbox" data-w="' + k + '"' + (c.widths.indexOf(k) >= 0 ? ' checked' : '') + '><span>' + k + ' (' + HB.frac(HB.BOARDS[k]) + ')</span></label>'; }).join('') + '</div>' +
      '<label class="fl">Rough/custom width (in, 0 = none) ' + num('custom', c.custom, 0, 24, 0.0625) + '</label>' +
      '<div class="cks">' + [6, 8, 10, 12, 16].map(function (l) { return '<label class="ck"><input type="checkbox" data-l="' + l + '"' + (c.lengths.indexOf(l) >= 0 ? ' checked' : '') + '><span>' + l + ' ft</span></label>'; }).join('') + '</div>' +
      '<label class="fl">Saw kerf (in) ' + num('kerf', c.kerf, 0.0625, 0.25, 0.0625) + '</label>' +
      '<button type="button" class="btn big" id="gen">Generate cut list</button></div><div id="out"></div></div>';
    el.innerHTML = h;
    HB.bindSeg(el, function () { var y = window.scrollY; HB.pageCuts(el); window.scrollTo(0, y); });
    el.querySelectorAll('input[data-k]').forEach(function (i) {
      i.addEventListener('change', function () { var k = i.getAttribute('data-k'); HB.cfg[k] = i.type === 'checkbox' ? i.checked : (+i.value || 0); HB.saveCfg(HB.cfg); });
    });
    el.querySelectorAll('input[data-w],input[data-l]').forEach(function (i) {
      i.addEventListener('change', function () {
        HB.cfg.widths = Array.prototype.filter.call(el.querySelectorAll('input[data-w]'), function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-w'); });
        HB.cfg.lengths = Array.prototype.filter.call(el.querySelectorAll('input[data-l]'), function (x) { return x.checked; }).map(function (x) { return +x.getAttribute('data-l'); });
        HB.saveCfg(HB.cfg);
      });
    });
    el.querySelector('#gen').addEventListener('click', function () { renderCuts(el.querySelector('#out')); el.querySelector('#out').scrollIntoView({ behavior: 'smooth' }); });
    if (HB._cutsShown) renderCuts(el.querySelector('#out'));
  };
  function renderCuts(out) {
    HB._cutsShown = true;
    var c = HB.cfg, r = HB.optimize(c), h = '';
    var bg = r.groups.filter(function (g) { return g.mat === 'board'; })[0];
    h += '<div class="sum">' +
      '<div class="k"><b>' + (r.bf ? r.bf.toFixed(1) : '0') + '</b><span>board feet (1x)</span></div>' +
      '<div class="k"><b>' + (r.waste !== undefined ? Math.round(r.waste * 100) : 0) + '%</b><span>waste</span></div>' +
      '<div class="k"><b>' + (bg ? bg.pack.boards.length : 0) + '</b><span>boards</span></div>' +
      '<div class="k"><b>' + (r.bf ? (r.bf / c.hives).toFixed(1) : 0) + '</b><span>bd ft / hive</span></div></div>';
    h += '<h3>Components (' + c.hives + ' hives)</h3><p>' + Object.keys(r.cl.comps).map(function (k) { return r.cl.comps[k] + '× ' + E(HB.NAMES[k]); }).join(' · ') + '</p>';
    h += '<h3>Cut list</h3>' + partsTable(r.cl.rows);
    if (r.frameBf) h += '<p class="meta">Frame parts need ≈' + r.frameBf.toFixed(1) + ' bd ft of clear pine resawn to 3/8" (not in the board layout).</p>';
    r.groups.forEach(function (g) {
      h += '<h3>' + E(g.title) + '</h3><p class="buy">Buy: ' + Object.keys(g.counts).map(function (k) { return '<b>' + g.counts[k] + '×</b> ' + E(k); }).join(', ') + '</p>';
      if (g.pack.bad.length) h += '<p class="warn">⚠ ' + g.pack.bad.length + ' part(s) don\'t fit any selected board (too wide/long) — add a wider board or a custom width, or edge-glue.</p>';
      h += HB.layoutSvg(g);
    });
    h += '<p class="meta">Letters on the diagrams match the part codes in the cut list. Layout keeps 1/2" end trim per board and your saw kerf. Pinch or tap ＋ to zoom.</p>';
    h += '<div class="row2"><button type="button" class="btn big" id="dlcut">Export cut list (.txt)</button><a class="btn big alt" href="#cost">Costs ›</a></div>';
    out.innerHTML = h; HB.initZoom(out);
    out.querySelector('#dlcut').addEventListener('click', function () { HB.download('hive-cut-list.txt', cutText(r)); });
    HB.lastRes = r;
  }
  function cutText(r) {
    var c = HB.cfg, L = ["Frank's Hive Builder — cut list (" + window.HB_VERSION + ')', c.hives + ' hives · ' + c.frames + '-frame · ' + HB.SPECIES[c.species] + ' ' + HB.frac(c.t) + ' · ' + c.joint + ' joints', ''];
    r.cl.rows.forEach(function (p) { L.push(p.qty + ' × ' + p.name + ' — ' + dimTxt(p) + (p.op ? ' — ' + p.op : '')); });
    L.push(''); r.groups.forEach(function (g) { L.push(g.title + ': ' + Object.keys(g.counts).map(function (k) { return g.counts[k] + '× ' + k; }).join(', ')); });
    if (r.bf) L.push('Total ' + r.bf.toFixed(1) + ' bd ft, waste ' + Math.round(r.waste * 100) + '%');
    return L.join('\n');
  }

  /* ---- Build steps ---- */
  HB.curBuild = function () { return localStorage.getItem('hb_curbuild') || 'shop'; };
  HB.pageSteps = function (el, comp, idx) {
    var bid = HB.curBuild();
    HB.db.all().then(function (builds) {
      var pick = '<label class="fl">Log progress to <select id="bsel"><option value="shop">Shop (no build)</option>' + builds.map(function (b) { return '<option value="' + b.id + '"' + (b.id === bid ? ' selected' : '') + '>' + E(b.name) + '</option>'; }).join('') + '</select></label>';
      if (!comp) {
        el.innerHTML = '<div class="pad"><h2>Build guides</h2>' + pick + optBar(true) + '<div class="list">' + HB.GUIDE_LIST.map(function (k) {
          var n = HB.steps(k, opts()).length, d = HB.gp.get(bid, k).length;
          return '<a class="li" href="#steps/' + k + '/0"><span>' + E(HB.NAMES[k]) + '</span><span class="pill' + (d >= n ? ' ok' : '') + '">' + d + '/' + n + '</span></a>';
        }).join('') + '</div></div>';
        HB.bindSeg(el, function () { HB.pageSteps(el); });
      } else {
        var steps = HB.steps(comp, opts()), i = Math.max(0, Math.min(steps.length - 1, idx || 0)), st = steps[i], done = HB.gp.get(bid, comp), isD = done.indexOf(i) >= 0;
        var fig = st.fig ? st.fig(opts()) : null;
        el.innerHTML = '<div class="pad step"><a class="back" href="#steps">‹ All guides</a>' + pick +
          '<div class="sh"><span>' + E(HB.NAMES[comp]) + '</span><span>Step ' + (i + 1) + ' of ' + steps.length + '</span></div>' +
          '<div class="prog"><i style="width:' + Math.round(done.length / steps.length * 100) + '%"></i></div>' +
          '<h2>' + E(st.t) + '</h2>' + (fig ? HB.zoomBox(fig) : '') + '<p class="body">' + E(st.b) + '</p>' +
          (st.s && st.s.length ? '<div class="set"><h4>Tool settings</h4><ul>' + st.s.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>' : '') +
          (st.w ? '<div class="safety">⚠ ' + E(st.w) + '</div>' : '') +
          '<button type="button" class="done' + (isD ? ' on' : '') + '" id="done"><span class="box">' + (isD ? '✓' : '') + '</span>' + (isD ? 'Done' : 'Mark done') + '</button>' +
          '<div class="row2"><a class="btn big alt' + (i === 0 ? ' dis' : '') + '" href="#steps/' + comp + '/' + Math.max(0, i - 1) + '">‹ Back</a><a class="btn big" href="' + (i < steps.length - 1 ? '#steps/' + comp + '/' + (i + 1) : '#steps') + '">' + (i < steps.length - 1 ? 'Next ›' : 'Finish') + '</a></div></div>';
        HB.initZoom(el);
        el.querySelector('#done').addEventListener('click', function () {
          var on = HB.gp.toggle(HB.curBuild(), comp, i);
          if (on && navigator.vibrate) navigator.vibrate(30);
          if (on && i < steps.length - 1) location.hash = '#steps/' + comp + '/' + (i + 1); else HB.pageSteps(el, comp, i);
        });
      }
      el.querySelector('#bsel').addEventListener('change', function (e) { localStorage.setItem('hb_curbuild', e.target.value); HB.pageSteps(el, comp, idx); });
    });
  };
})();
