/* Frank's Hive Builder — cedar fence-board materials mode: stock assumptions, edge-joined walls, warnings, strip packing */
(function () {
  'use strict';
  var HB = window.HB, C = HB.COL, f = function (x) { return HB.f(x); };
  function E(s) { return HB.esc(s); } // ui.js loads later
  function c16(x) { return Math.ceil(x * 16 - 1e-6) / 16; }

  /* Fixed build locations (no prompt anywhere) */
  HB.LOCATIONS = ['Southaven, Mississippi', 'Olive Branch, Mississippi'];

  /* ---- Fence stock assumptions (actual sizes, check yours) ---- */
  HB.FENCE = {
    t: 0.625, rawW: 5.5, lenAllow: 1, ripAllow: 0.25, cleatW: 1.5,
    dog: { name: 'Dog-eared cedar pickets', short: 'dog-ear picket', netW: 5.25, earTrim: 1.5, endTrim: 0.5 },
    tg: { name: 'Cedar tongue-and-groove fence boards', short: 'T&G fence board', tongue: 0.375, cover: 5.125, edgeClean: 0.5, endTrim: 0.5 }
  };
  HB.isFence = function (o) { return !!o && o.mat === 'fence'; };
  HB.fenceKind = function (o) { return o && o.fence === 'dog' ? 'dog' : 'tg'; };
  HB.fenceStock = function (o) { var k = HB.fenceKind(o), ft = +o.fenceLen === 8 ? 8 : 6; return { kind: k, ft: ft, name: HB.FENCE[k].name, label: '5/8" × 5 1/2" × ' + ft + "' " + HB.FENCE[k].short }; };

  /* How many boards are edge-joined to reach height H, and where the glue joints land (measured down from the top edge) */
  HB.fenceLayout = function (H, kind) {
    var F = HB.FENCE, n, joints = [], k, sw, panel, top;
    if (kind === 'dog') {
      n = Math.max(1, Math.ceil((H + F.ripAllow) / F.dog.netW - 1e-9)); sw = c16((H + F.ripAllow) / n); panel = n * sw;
      for (k = 1; k < n; k++) joints.push(k * sw);
      return { kind: kind, n: n, stripW: sw, raw: panel, topRip: 0, botRip: panel - H, joints: joints };
    }
    var T = F.tg; n = 1;
    while (n * T.cover - T.edgeClean < H - 1e-9) n++;
    top = Math.min(T.cover - T.edgeClean, Math.max(H - (n - 1) * T.cover, c16(H / n)));
    for (k = 1; k < n; k++) joints.push(top + (k - 1) * T.cover);
    panel = n * T.cover; // as glued, outer tongue ripped off
    return { kind: kind, n: n, stripW: F.rawW, top: top, raw: panel, topRip: T.cover - top, botRip: panel - (T.cover - top) - H, joints: joints };
  };

  /* Options used for a box when it is built from fence stock: inside held standard, wall = 5/8", cleats only */
  HB.fenceBoxOpts = function (comp, o) {
    var H = HB.STD.height[comp], lay = HB.fenceLayout(H, HB.fenceKind(o));
    return Object.assign({}, o, { t: HB.FENCE.t, solidT: +o.t || 0.75, handhold: 'cleat', joints: lay.joints, cleatY: lay.joints.length ? lay.joints[0] - HB.FENCE.cleatW / 2 : Math.min(2.5, H * .3), lay: lay });
  };

  /* ---- Warnings (shown inline on parts, cut-list rows and steps) ---- */
  HB.FENCE_WARN = {
    dogTop: ['Dog-eared pickets', 'Never use a dog-eared picket, or the clipped end of one, for a box top edge, a cover, or any part that has to be one full-width piece. Cut the dog-ear end off first (about 1 1/2" lost per picket).'],
    rabbet: ['Frame rest in thin stock', 'A 3/8"-deep frame-rest rabbet in 5/8" stock leaves only a 1/4" lip carrying every frame (a full deep can top 70–80 lb). Metal frame rests are REQUIRED in fence mode. Keep the top board knot-free in its top 1 1/2" and keep the glue joint at least 2" below the top edge.'],
    hand: ['Handholds', 'Don\'t rout handholds in 5/8" walls; that leaves about 5/16". Use solid 3/4" cleats glued and screwed across the glue joint with 1 1/4" #8 screws, so nothing pokes through inside.'],
    corner: ['Corners & joints', 'The corners carry the load when a full box gets lifted, and thin fingers and rabbets split easily. Glue every corner with Titebond III, pre-drill, and use 1 1/2" (4d) galvanized ring-shank nails or #6 screws. No butt joints.'],
    knots: ['Knots, warping, splitting', 'Fence-grade cedar has loose knots, splits, wane and cup, and is often sold wet. Sticker it in the shop 1–2 weeks. Cut around loose or large knots (never in a finger, the rabbet zone or the top board), reject boards cupped more than about 1/8" or twisted, and pre-drill every fastener near an end.'],
    joint: ['Full-length glue joint', 'The edge joint runs the full length of the wall, so it has to be a strong glue joint: straight, square edges, Titebond III, splines or dowels for alignment, even clamping, and a solid cleat screwed across it.'],
    butt: ['Butt joints', 'Butt joints in 5/8" stock are too weak for a box that gets lifted full. Use box joints or rabbets in fence mode.'],
    tg: ['Tongue & groove fit', 'Fence T&G is often loose. If the dry joint rocks or shows light, rip the tongue and groove off and use a spline instead. Glue the whole joint, not just the tongue.'],
    solidBottom: ['Stays SOLID', 'The bottom board carries the whole hive (150+ lb) and needs a 3/8" floor groove, which would leave 1/4" in fence stock. Make the rails from solid boards.'],
    solidCover: ['Stays SOLID', 'Covers need flat, full-width, single-piece stock and take the weather on top. Never use dog-eared pickets or edge-joined fence boards here. Use solid boards and exterior plywood.'],
    solidCleat: ['Stays SOLID', 'Cleats are the lifting handles, and their screws tie the glue joint together. Make them from solid 3/4" stock.'],
    solidSmall: ['Stays SOLID', 'Needs a full 3/4" × 3/4" section, and fence stock is only 5/8" thick.']
  };
  HB.fwHtml = function (keys, compact) {
    if (compact) { var ks = (keys || []).filter(function (k) { return HB.FENCE_WARN[k]; }), so = ks.filter(function (k) { return k.indexOf('solid') === 0; }), wa = ks.filter(function (k) { return k.indexOf('solid') !== 0; });
      return (so.length ? '<div class="fw sol mini"><b>■ Stays SOLID</b></div>' : '') + (wa.length ? '<div class="fw mini"><b>⚠ Watch:</b> ' + wa.map(function (k) { return E(HB.FENCE_WARN[k][0]); }).join(' · ') + '</div>' : ''); }
    return (keys || []).map(function (k) { var w = HB.FENCE_WARN[k]; return w ? '<div class="fw' + (k.indexOf('solid') === 0 ? ' sol' : '') + '"><b>' + (k.indexOf('solid') === 0 ? '■ ' : '⚠ ') + E(w[0]) + ':</b> ' + E(w[1]) + '</div>' : ''; }).join('');
  };
  var SOLID_WARN = { 'bottom-solid': 'solidBottom', 'bottom-screened': 'solidBottom', inner: 'solidCover', outer: 'solidCover', reducer: 'solidSmall' };
  HB.solidWarn = function (comp) { return SOLID_WARN[comp] || ''; };

  /* ---- Parts: fence branch wraps HB.parts (solid mode passes straight through, unchanged) ---- */
  var baseParts = HB.parts;
  HB.parts = function (comp, o) {
    if (!HB.isFence(o)) return baseParts(comp, o);
    if (HB.STD.height[comp]) return fenceBoxParts(comp, o);
    var sw = SOLID_WARN[comp];
    return baseParts(comp, o).map(function (p) { if (p.mat === 'board' && sw) { p.solid = true; p.warn = [sw]; } return p; });
  };
  function fenceBoxParts(comp, o) {
    var bo = HB.fenceBoxOpts(comp, o), lay = bo.lay, kind = lay.kind, t = bo.t, st = bo.solidT, g = HB.geom(bo), H = HB.STD.height[comp];
    var base = baseParts(comp, bo), out = [], nm = HB.NAMES[comp].split(' ')[0], pf = nm.charAt(0), longL = g.L;
    var how = 'Edge-join ' + lay.n + ' ' + HB.FENCE[kind].short + 's' + (kind === 'dog' ? ' ripped to ' + HB.frac(lay.stripW) + ' each' : ' (glued T&G)') + ', rip to ' + HB.frac(H) + ' from the bottom edge';
    base.forEach(function (p) {
      if (p.code === pf + 'H') return; // cleats re-added below as solid stock
      var isEnd = p.code === pf + 'E'; if (!isEnd) longL = p.L;
      var w = (kind === 'dog' ? ['dogTop'] : ['tg']).concat(isEnd ? ['rabbet', 'corner', 'joint', 'knots'] : ['corner', 'joint', 'knots']);
      if (o.joint === 'butt') w.unshift('butt');
      out.push(Object.assign({}, p, { mat: 'fence', fence: true, join: lay.n, lay: lay, stripW: lay.stripW, stripL: p.L + HB.FENCE.lenAllow, how: how, warn: w }));
    });
    var jy = lay.joints.length ? lay.joints[0] : 2.5, top = jy - HB.FENCE.cleatW / 2;
    out.push(HB.P(nm + ' handhold cleat (solid)', 2, st, HB.FENCE.cleatW, g.W, 'Center over the glue joint: top edge ' + HB.frac(top) + ' below box top. Glue + 1 1/4" #8 screws every 4", staggered into BOTH boards. Bevel top edge.', 'board', pf + 'H'));
    out.push(HB.P(nm + ' joint cleat, long side (solid)', 2, st, HB.FENCE.cleatW, longL - 2, 'Same height as the handhold cleats, 1" short of each corner. Glue + 1 1/4" screws into both boards.', 'board', pf + 'J'));
    out[out.length - 2].solid = out[out.length - 1].solid = true;
    out[out.length - 2].warn = ['solidCleat', 'hand']; out[out.length - 1].warn = ['solidCleat'];
    return out;
  }

  /* ---- Strip packing: crosscut-first, so each strip uses the full board width (1-D first-fit decreasing) ---- */
  HB.fenceGroup = function (rows, c) {
    var st = HB.fenceStock(c), K = HB.FENCE[st.kind], L = st.ft * 12, a = K.endTrim, b = st.kind === 'dog' ? K.earTrim : K.endTrim, kerf = +c.kerf || 0.125;
    var strips = [], bad = [], boards = [], partArea = 0;
    rows.forEach(function (r) { partArea += r.w * r.L; for (var i = 0; i < r.join; i++) strips.push({ w: r.stripW, L: r.stripL, code: r.code, name: r.name }); });
    strips.sort(function (x, y) { return y.L - x.L; });
    var stock = { name: st.label, w: HB.FENCE.rawW, L: L, ft: st.ft, nom: 'fence', dog: st.kind === 'dog' };
    strips.forEach(function (s) {
      if (s.L > L - a - b + 1e-6) { bad.push(s); return; }
      var bd = null;
      for (var i = 0; i < boards.length && !bd; i++) if (boards[i].x + s.L <= L - b + 1e-6) bd = boards[i];
      if (!bd) { bd = { stock: stock, placed: [], x: a }; boards.push(bd); }
      bd.placed.push({ p: s, x: bd.x, y: 0 }); bd.x += s.L + kerf;
    });
    boards.forEach(function (bd) { bd.util = bd.placed.reduce(function (s, q) { return s + q.p.w * q.p.L; }, 0) / (stock.w * L); });
    var counts = {}; if (boards.length) counts[stock.name] = boards.length;
    var tot = boards.length * stock.w * L;
    return { title: 'Fence boards — ' + st.name + ' (walls)', mat: 'fence', pack: { boards: boards, bad: bad }, counts: counts, parts: rows,
      strips: strips.length, panels: rows.length, joints: strips.length - rows.length, waste: tot ? 1 - partArea / tot : 0, kind: st.kind };
  };

  /* ---- Diagrams: fence stock, joint section, clamping, panel rip ---- */
  HB.fenceFigs = {
    stock: function (o) {
      var k = HB.fenceKind(o), F = HB.FENCE, Lb = 30;
      return HB.view(k === 'dog' ? 'Dog-eared picket — trim before use' : 'T&G fence board — profile and trim', Lb, 9, function (c, fs) {
        if (k === 'dog') {
          c.poly([[0, 0], [Lb - 1, 0], [Lb, 1], [Lb, 4.5], [Lb - 1, 5.5], [0, 5.5]], C.wood, C.edge);
          c.line(Lb - F.dog.earTrim, -.6, Lb - F.dog.earTrim, 6.1, '#ff5b5b', c.sw * 1.6, true); c.line(F.dog.endTrim, -.6, F.dog.endTrim, 6.1, '#ff5b5b', c.sw * 1.6, true);
          c.dh(Lb - F.dog.earTrim, Lb, -fs * 1.3, 'cut off ' + f(F.dog.earTrim), 0);
          c.dv(0, 5.5, -fs * 1.2, f(5.5), 0); c.text(Lb / 2 - 2, 2.9, 'usable ' + f(o.fenceLen == 8 ? 94 : 70) + ' of ' + (o.fenceLen == 8 ? "8'" : "6'"), { k: .8, c: 'lb' });
          c.text(Lb / 2, 7.8, 'Rip both edges straight + square → ' + f(F.dog.netW) + ' max net width', { k: .7, c: 'nt' });
        } else {
          c.rect(0, 0, Lb, 5.5, C.wood, C.edge); c.rect(Lb * .7, 5.5, 4, F.tg.tongue, C.wood2, C.edge);
          c.line(0, 5.5 - .2, Lb, 5.5 - .2, C.hid, c.sw, true); c.line(0, .2, Lb, .2, C.hid, c.sw, true);
          c.dv(0, 5.5, -fs * 1.2, f(5.5) + ' + tongue', 0); c.dv(5.5, 5.5 + F.tg.tongue, Lb + fs * .3, f(F.tg.tongue) + ' tongue', Lb);
          c.text(Lb / 2 - 2, 2.9, 'covers ' + f(F.tg.cover) + ' once joined', { k: .8, c: 'lb' });
          c.text(Lb / 2, 7.8, 'Square both ends 1/2". Rip outer tongue + groove off after glue-up.', { k: .7, c: 'nt' });
        }
      }, { fs: 1.1, pl: 2.2, pr: 3, pt: 2, pb: 1 });
    },
    joint: function (o) {
      var k = HB.fenceKind(o), t = HB.FENCE.t;
      return HB.view(k === 'dog' ? 'Edge joint section — spline keeps faces flush' : 'Edge joint section — glued tongue & groove', 6, t, function (c, fs) {
        if (k === 'dog') {
          c.rect(0, 0, 3, t, C.wood, C.edge); c.rect(3, 0, 3, t, C.wood2, C.edge);
          c.rect(3 - .375, t / 2 - .0625, .75, .125, '#e8c27a', '#fff');
          c.dh(3 - .375, 3 + .375, t + fs * 1.3, 'spline 1/8" × 3/4" (groove 3/8" deep each edge)', t);
          c.text(1.5, -fs * .5, 'board 1', { k: .8, c: 'nt' }); c.text(4.5, -fs * .5, 'board 2', { k: .8, c: 'nt' });
        } else {
          c.poly([[0, 0], [3, 0], [3, t * .35], [3.375, t * .35], [3.375, t * .65], [3, t * .65], [3, t], [0, t]], C.wood, C.edge); c.rect(3, 0, 3, t, C.wood2, C.edge);
          c.rect(3, t * .35, .375, t * .3, C.wood, C.edge);
          c.dh(3, 3.375, t + fs * 1.3, 'tongue ' + f(.375) + ' into groove', t);
          c.text(1.5, -fs * .5, 'upper board', { k: .8, c: 'nt' }); c.text(4.5, -fs * .5, 'lower board', { k: .8, c: 'nt' });
        }
        c.dv(0, t, -fs * 1.1, f(t), 0);
      }, { fs: .22, pl: .6, pr: .3, pt: .55, pb: 1.3, note: 'Titebond III on both mating edges. Dowel option: 1/4" × 1 1/4" dowels every 6" on center, centered in the 5/8" edge.' });
    },
    clamp: function (o, H, L) {
      var lay = HB.fenceLayout(H || 9.625, HB.fenceKind(o)), Lp = L || 20.625, W = lay.n * lay.stripW;
      return HB.view('Edge-glue + clamp (' + lay.n + ' boards)', Lp, W, function (c, fs) {
        for (var i = 0; i < lay.n; i++) c.rect(0, i * lay.stripW, Lp, lay.stripW, i % 2 ? C.wood2 : C.wood, C.edge);
        for (var j = 1; j < lay.n; j++) c.line(0, j * lay.stripW, Lp, j * lay.stripW, '#ff5b8a', c.sw * 2, true);
        for (var x = 2, m = 0; x < Lp; x += 6, m++) { c.rect(x - .4, -1.4, .8, W + 2.8, m % 2 ? 'rgba(111,208,255,.25)' : 'rgba(111,208,255,.6)', C.dim); c.text(x, m % 2 ? W + 2.6 : -1.8, m % 2 ? 'under' : 'over', { k: .6, c: 'nt' }); }
        c.text(Lp / 2, lay.stripW + fs * .35, 'glue joint runs full length', { k: .75, c: 'lb' });
        c.dv(0, W, -fs * 1.2, f(W), 0);
      }, { fs: 1, pl: 2, pr: .6, pt: 3, pb: 3.2, note: 'Clamps every 6–8", alternating over and under so the panel stays flat. Snug, even pressure: a thin bead of squeeze-out the whole length. Don\'t crank it until the glue starves.' });
    },
    rip: function (o, H) {
      var lay = HB.fenceLayout(H, HB.fenceKind(o)), W = lay.raw, a = lay.topRip, Lp = 20;
      return HB.view('Glued panel → rip to ' + HB.frac(H), Lp, W, function (c, fs) {
        c.rect(0, 0, Lp, W, C.wood, C.edge);
        lay.joints.forEach(function (y) { c.line(0, a + y, Lp, a + y, '#ff5b8a', c.sw * 2, true); });
        if (a > .05) { c.rect(0, 0, Lp, a, 'rgba(255,91,91,.35)', '#ff5b5b', true); c.text(Lp / 2, a / 2 + fs * .3, 'rip off top (groove edge) ' + f(a), { k: .6, c: 'nt' }); }
        if (lay.botRip > .05) { c.rect(0, a + H, Lp, lay.botRip, 'rgba(255,91,91,.35)', '#ff5b5b', true); c.text(Lp * .35, lay.botRip < 1 ? W + fs * 1.1 : a + H + lay.botRip / 2 + fs * .3, 'rip off bottom ' + f(lay.botRip), { k: .6, c: 'nt' }); }
        c.rect(0, a, Lp, .625, 'rgba(242,182,50,.35)', C.hid, true);
        c.text(Lp / 2, a + .5, 'rabbet zone (top board, knot-free)', { k: .6, c: 'nt' });
        c.dv(a, a + H, -fs * 1.2, f(H), a); c.dv(a, a + (lay.joints[0] || H), Lp + fs * 1.2, 'joint ' + f(lay.joints[0] || 0), Lp);
      }, { fs: .7, pl: 2, pr: 2, pt: 1, pb: 2.6 });
    }
  };

  /* Wrap HB.diagram: fence boxes are drawn at 5/8" with joint lines + extra edge-joining views */
  var baseDiagram = HB.diagram;
  HB.diagram = function (comp, o) {
    if (!HB.isFence(o) || !HB.STD.height[comp]) return baseDiagram(comp, o);
    var bo = HB.fenceBoxOpts(comp, o), H = HB.STD.height[comp], v = baseDiagram(comp, bo);
    v.push(HB.fenceFigs.rip(bo, H)); v.push(HB.fenceFigs.joint(bo));
    return v;
  };

  /* Assumptions card (Parts, Cut list, Specs) */
  HB.fenceCard = function (o, open) {
    var F = HB.FENCE, g = HB.geom({ frames: o.frames, t: F.t }), g0 = HB.geom({ frames: o.frames, t: 0.75 }), k = HB.fenceKind(o), st = HB.fenceStock(o);
    var rows = ['deep', 'medium', 'shallow'].map(function (h) { var l = HB.fenceLayout(HB.STD.height[h], k); return '<tr><td>' + E(HB.NAMES[h]) + ' ' + f(HB.STD.height[h]) + '</td><td class="q">' + l.n + '</td><td>' + (k === 'dog' ? 'rip each to ' + f(l.stripW) : 'glued T&G') + '; joint ' + f(l.joints[0] || 0) + ' down</td></tr>'; }).join('');
    return '<details class="card fcard"' + (open ? ' open' : '') + '><summary>Fence-board mode: assumptions</summary><div class="cb"><ul>' +
      '<li><b>Stock:</b> ' + E(st.name) + ', actual <b>' + f(F.t) + ' × ' + f(F.rawW) + ' × ' + st.ft + ' ft</b>. ' + (k === 'dog' ? 'Dog-ear end trimmed ' + f(F.dog.earTrim) + ', other end squared ' + f(F.dog.endTrim) + '; both edges ripped straight → ' + f(F.dog.netW) + ' max net width.' : 'Tongue ' + f(F.tg.tongue) + ' → ' + f(F.tg.cover) + ' coverage per board; outer tongue and ' + f(F.tg.edgeClean) + ' groove edge ripped off after glue-up; ends squared ' + f(F.tg.endTrim) + '.') + ' Strips cut ' + f(F.lenAllow) + ' over length and ' + f(F.ripAllow) + ' over height, trimmed after glue-up. Measure yours: some fence boards run 9/16" to 11/16".</li>' +
      '<li><b>Walls:</b> the <b>inside stays standard</b> (' + f(g.inL) + ' × ' + f(g.inW) + '), so frames, bee space and the ' + f(HB.STD.rabbet.down) + ' × ' + f(HB.STD.rabbet.into) + ' frame rest are unchanged. The <b>outside shrinks</b> to ' + f(g.L) + ' × ' + f(g.W) + ' (standard ' + f(g0.L) + ' × ' + f(g0.W) + '). Box heights don\'t change.</li>' +
      '<li><b>Mixing:</b> fence boxes stack on standard boxes (the insides line up, and the outside steps in 1/8" a side). Bottom board, inner cover, telescoping cover and reducer stay <b>solid, standard size</b>, so they fit both.</li>' +
      '<li><b>Stays solid stock:</b> bottom-board rails, inner- and outer-cover rims, the reducer, and every cleat. Fence stock is only used for box walls.</li></ul>' +
      '<table class="tbl"><tr><th>Wall height</th><th>Boards</th><th>Layout</th></tr>' + rows + '</table>' +
      '<p class="meta">Build locations: ' + HB.LOCATIONS.join(' and ') + '. Cedar pickets are sold wet in our humid summers; let them dry in the shop first.</p></div></details>';
  };
})();
