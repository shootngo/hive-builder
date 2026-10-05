/* Frank's Hive Builder — cut list, board optimizer, cutting diagrams, materials */
(function () {
  'use strict';
  var HB = window.HB;
  HB.BOARDS = { '1x6': 5.5, '1x8': 7.25, '1x10': 9.25, '1x12': 11.25 };
  HB.SPECIES = { cypress: 'Cypress', cedar: 'Cedar (western red)', pine: 'Pine' };
  HB.defaultCfg = function () {
    return { hives: 5, deep: 2, medium: 2, shallow: 0, frames: 10, bottom: 'bottom-screened', inner: true, outer: true, reducer: true,
      makeFrames: false, stand: true, standH: 18, joint: 'box', handhold: 'cleat', species: 'cypress', t: 0.75,
      widths: ['1x8', '1x12'], custom: 0, lengths: [8, 10, 12], kerf: 0.125, mat: 'solid', fence: 'tg', fenceLen: 6 };
  };
  HB.loadCfg = function () { try { var c = JSON.parse(localStorage.getItem('hb_cfg')); if (c) return Object.assign(HB.defaultCfg(), c); } catch (e) {} return HB.defaultCfg(); };
  HB.saveCfg = function (c) { localStorage.setItem('hb_cfg', JSON.stringify(c)); };

  /* Component counts for the whole job */
  HB.jobComps = function (c) {
    var N = Math.max(1, +c.hives || 1), m = {};
    function add(k, q) { if (q > 0) m[k] = (m[k] || 0) + q; }
    add('deep', N * c.deep); add('medium', N * c.medium); add('shallow', N * c.shallow);
    add(c.bottom, N); if (c.inner) add('inner', N); if (c.outer) add('outer', N); if (c.reducer) add('reducer', N);
    if (c.makeFrames) { add('frame-deep', N * c.deep); add('frame-medium', N * c.medium); add('frame-shallow', N * c.shallow); }
    if (c.stand) add('stand', N);
    return m;
  };

  HB.cutList = function (c) {
    var comps = HB.jobComps(c), rows = [], o = { frames: c.frames, t: c.t, joint: c.joint, handhold: c.handhold, standH: c.standH, mat: c.mat, fence: c.fence, fenceLen: c.fenceLen };
    Object.keys(comps).forEach(function (k) {
      HB.parts(k, o).forEach(function (p) { var r = Object.assign({}, p); r.qty = p.qty * comps[k]; r.comp = k; rows.push(r); });
    });
    return { comps: comps, rows: rows };
  };

  /* ---- Lane (rip-strip) packer. board {w, L}; parts [{w,L,label,code}] ---- */
  function fill(bw, bl, parts, kerf, trim) {
    var lanes = [], usedW = 0, placed = [], rest = [];
    parts.forEach(function (p) {
      var ok = false, i;
      for (i = 0; i < lanes.length && !ok; i++) {
        var ln = lanes[i];
        if (p.w <= ln.w + 1e-6 && ln.w - p.w <= 0.5 && ln.x + p.L <= bl - trim + 1e-6) {
          placed.push({ p: p, x: ln.x, y: ln.y }); ln.x += p.L + kerf; ok = true;
        }
      }
      if (!ok) {
        var need = p.w + (lanes.length ? kerf : 0);
        if (usedW + need <= bw + 1e-6 && trim + p.L <= bl - trim + 1e-6) {
          var y = usedW + (lanes.length ? kerf : 0);
          lanes.push({ w: p.w, y: y, x: trim + p.L + kerf }); usedW = y + p.w;
          placed.push({ p: p, x: trim, y: y }); ok = true;
        }
      }
      if (!ok) rest.push(p);
    });
    var area = placed.reduce(function (s, q) { return s + q.p.w * q.p.L; }, 0);
    return { placed: placed, rest: rest, util: area / (bw * bl) };
  }
  HB.pack = function (parts, stocks, kerf, trim) {
    parts = parts.slice().sort(function (a, b) { return (b.w - a.w) || (b.L - a.L); });
    var boards = [], bad = [], guard = 0;
    var maxW = Math.max.apply(null, stocks.map(function (s) { return s.w; }));
    var maxL = Math.max.apply(null, stocks.map(function (s) { return s.L; }));
    parts = parts.filter(function (p) { if (p.w > maxW + 1e-6 || p.L > maxL - 2 * trim) { bad.push(p); return false; } return true; });
    while (parts.length && guard++ < 2000) {
      var best = null;
      stocks.forEach(function (s) {
        if (s.w + 1e-6 < parts[0].w || s.L - 2 * trim < parts[0].L) return;
        var r = fill(s.w, s.L, parts, kerf, trim);
        var score = r.util + r.placed.length * 1e-4;
        if (!best || score > best.score + 1e-9) best = { s: s, r: r, score: score };
      });
      if (!best) { bad = bad.concat(parts); break; }
      boards.push({ stock: best.s, placed: best.r.placed, util: best.r.util });
      parts = best.r.rest;
    }
    return { boards: boards, bad: bad };
  };

  HB.optimize = function (c) {
    var cl = HB.cutList(c), byMat = {};
    cl.rows.forEach(function (r) {
      for (var i = 0; i < r.qty; i++) (byMat[r.mat] = byMat[r.mat] || []).push(r.mat === 'fence' ? { w: r.w, L: r.L, t: r.t, code: r.code, name: r.name, join: r.join, stripW: r.stripW, stripL: r.stripL } : { w: r.w, L: r.L, t: r.t, code: r.code, name: r.name });
    });
    var kerf = +c.kerf || 0.125, res = { cl: cl, groups: [] };
    var widths = (c.widths || []).map(function (k) { return { name: k, w: HB.BOARDS[k] }; });
    if (+c.custom > 0) widths.push({ name: HB.frac(+c.custom) + ' rough', w: +c.custom });
    if (!widths.length) widths = [{ name: '1x12', w: 11.25 }];
    var lens = (c.lengths && c.lengths.length ? c.lengths : [8]).map(Number);
    function stocksFor(ws, ls) { var s = []; ws.forEach(function (w) { ls.forEach(function (l) { s.push({ name: w.name + ' × ' + l + "'", w: w.w, L: l * 12, ft: l, nom: w.name }); }); }); return s; }
    if (byMat.fence) { res.fence = HB.fenceGroup(byMat.fence, c); res.groups.push(res.fence); }
    if (byMat.board) res.groups.push(group((byMat.fence ? 'Solid lumber (parts that stay solid) — ' : 'Box lumber — ') + HB.SPECIES[c.species] + ' ' + HB.frac(c.t) + ' S4S', 'board', HB.pack(byMat.board, stocksFor(widths, lens), kerf, 0.5), byMat.board));
    if (byMat.ply34) res.groups.push(group('3/4" exterior plywood (4×8 sheets)', 'ply34', HB.pack(rot(byMat.ply34), [{ name: '4×8 sheet', w: 48, L: 96, ft: 8, nom: 'sheet' }], kerf, 0), byMat.ply34));
    if (byMat.ply14) res.groups.push(group('1/4" exterior plywood (4×8 sheets)', 'ply14', HB.pack(rot(byMat.ply14), [{ name: '4×8 sheet', w: 48, L: 96, ft: 8, nom: 'sheet' }], kerf, 0), byMat.ply14));
    if (byMat['2x4']) res.groups.push(group('2x4 (stand frame)', '2x4', HB.pack(byMat['2x4'], [{ name: "2x4 × 8'", w: 3.5, L: 96, ft: 8, nom: '2x4' }], kerf, 0.25), byMat['2x4']));
    if (byMat['4x4']) res.groups.push(group('4x4 ground-contact treated (legs)', '4x4', HB.pack(byMat['4x4'], [{ name: "4x4 × 8'", w: 3.5, L: 96, ft: 8, nom: '4x4' }], kerf, 0.25), byMat['4x4']));
    res.frames = byMat.frame || [];
    res.screen = byMat.screen || []; res.metal = byMat.metal || [];
    // board feet (nominal 1" thick for 1x stock, sold by bd ft)
    var bg = res.groups.filter(function (g) { return g.mat === 'board'; })[0];
    if (bg) {
      bg.bf = bg.pack.boards.reduce(function (s, b) { var nomW = b.stock.nom.indexOf('1x') === 0 ? +b.stock.nom.slice(2) : Math.ceil(b.stock.w); return s + nomW * b.stock.ft / 12; }, 0);
      var used = byMat.board.reduce(function (s, p) { return s + p.w * p.L; }, 0), tot = bg.pack.boards.reduce(function (s, b) { return s + b.stock.w * b.stock.L; }, 0);
      bg.waste = tot ? 1 - used / tot : 0;
      res.bf = bg.bf; res.waste = bg.waste;
    }
    if (res.frames.length) res.frameBf = res.frames.reduce(function (s, p) { return s + p.t * p.w * p.L / 144; }, 0) * 1.4;
    return res;
  };
  function rot(parts) { return parts.map(function (p) { return p.w > p.L ? Object.assign({}, p, { w: p.L, L: p.w }) : p; }); }
  function group(title, mat, pack, parts) {
    var counts = {};
    pack.boards.forEach(function (b) { counts[b.stock.name] = (counts[b.stock.name] || 0) + 1; });
    return { title: title, mat: mat, pack: pack, counts: counts, parts: parts };
  }

  /* SVG cutting diagram for one group */
  HB.layoutSvg = function (g) {
    var out = [], colors = ['#c98d3a', '#9a6b2c', '#b5833f', '#8c5f25', '#d4a256', '#a8762f'];
    g.pack.boards.forEach(function (b, i) {
      var X = b.stock.w < 20 ? 2 : 1, W = b.stock.L, Hh = b.stock.w * X, fs = Math.max(2.2, W / 26), c = new HB.Ctx(fs);
      c.rect(0, 0, W, Hh, '#2a2014', '#777');
      b.placed.forEach(function (q, j) {
        var ph = q.p.w * X, py = q.y * X;
        c.rect(q.x, py, q.p.L, ph, colors[j % colors.length], '#111');
        var lab = q.p.code + ' ' + HB.f(q.p.L), k = Math.min(1, ph / (fs * 1.25), q.p.L / (lab.length * fs * .6));
        c.text(q.x + q.p.L / 2, py + ph / 2 + fs * k * .36, lab, { k: Math.max(.45, k), c: 'lb' });
      });
      if (b.stock.dog) { c.poly([[W - 1, 0], [W, 0], [W, 1 * X]], '#0d0b07', '#777'); c.poly([[W - 1, Hh], [W, Hh], [W, Hh - 1 * X]], '#0d0b07', '#777'); }
      var title = '#' + (i + 1) + ' ' + b.stock.name + ' — ' + Math.round(b.util * 100) + '% used' + (X > 1 ? ' (width drawn ×2)' : '');
      out.push('<div class="lay"><div class="lay-t">' + title + '</div><div class="zoom"><svg viewBox="-1 -1 ' + (W + 2) + ' ' + (Hh + 2) + '" preserveAspectRatio="xMinYMin meet">' + c.o.join('') + '</svg></div></div>');
    });
    return out.join('');
  };

  /* ---- Materials & prices ---- */
  HB.defaultPrices = function () {
    return { bf_cypress: 4.5, bf_cedar: 6.5, bf_pine: 3.25, ply34: 60, ply14: 28, s2x4: 5, s4x4: 16, screen: 1.5, metal: 9, nails: 9, glue: 12, paint: 45, rests: 2.5, frame: 2.75, screws: 12, picket_dog: 3.75, picket_tg: 5.75, dowels: 5, screws114: 9, nails4d: 8 };
  };
  HB.PRICE_LABELS = { bf_cypress: 'Cypress, per board foot', bf_cedar: 'Cedar, per board foot', bf_pine: 'Pine, per board foot', ply34: '3/4" ext. plywood, sheet', ply14: '1/4" ext. plywood, sheet', s2x4: "2x4 × 8'", s4x4: "4x4 × 8' treated (ground contact)", screen: '#8 hardware cloth, per sq ft', metal: 'Cover sheet metal, each', nails: '6d galv. nails, 1 lb box', glue: 'Waterproof wood glue (Titebond III), 16 oz', paint: 'Exterior primer/paint, gallon', rests: 'Metal frame rests, pair', frame: 'Pre-made frame (if buying), each', screws: '3" exterior screws, 1 lb box', picket_dog: "Cedar dog-ear picket 5/8\" × 5 1/2\" × 6' (8' scaled)", picket_tg: "Cedar T&G fence board 5/8\" × 5 1/2\" × 6' (8' scaled)", dowels: '1/4" × 1 1/4" fluted dowel pins, bag of 50', screws114: '1 1/4" #8 exterior screws, 1 lb box', nails4d: '4d (1 1/2") galv. ring-shank nails, 1 lb' };
  HB.FENCE_PRICE_KEYS = ['picket_dog', 'picket_tg', 'dowels', 'screws114', 'nails4d'];
  HB.loadPrices = function () { try { return Object.assign(HB.defaultPrices(), JSON.parse(localStorage.getItem('hb_prices') || '{}')); } catch (e) { return HB.defaultPrices(); } };
  HB.materials = function (c, res, pr) {
    var items = [], comps = res.cl.comps, boxes = (comps.deep || 0) + (comps.medium || 0) + (comps.shallow || 0);
    function it(name, qty, unit, price, note) { items.push({ name: name, qty: qty, unit: unit, price: price, cost: qty * price, note: note || '' }); }
    res.groups.forEach(function (g) {
      Object.keys(g.counts).forEach(function (k) {
        var q = g.counts[k];
        if (g.mat === 'board') { var nom = k.split(' × ')[0], ft = parseFloat(k.split(' × ')[1]), nw = nom.indexOf('1x') === 0 ? +nom.slice(2) : Math.ceil(parseFloat(nom)); var bf = nw * ft / 12; it(HB.SPECIES[c.species] + ' ' + k + ' (' + HB.frac(c.t) + ')', q, 'board', bf * pr['bf_' + c.species], bf.toFixed(1) + ' bd ft each'); }
        else if (g.mat === 'fence') { var fk = g.kind === 'dog' ? 'picket_dog' : 'picket_tg', fe = pr[fk] * (+c.fenceLen === 8 ? 8 / 6 : 1); it(HB.FENCE[g.kind].name + ' ' + k.split("' ")[0] + "'", q, 'board', fe, g.strips + ' strips → ' + g.panels + ' edge-joined walls'); it('Spare fence boards (~10% for knots, splits, cup)', Math.max(1, Math.ceil(q * 0.1)), 'board', fe, 'Fence-grade stock: pick through the pile'); }
        else if (g.mat === 'ply34') it('3/4" exterior plywood 4×8', q, 'sheet', pr.ply34);
        else if (g.mat === 'ply14') it('1/4" exterior plywood 4×8', q, 'sheet', pr.ply14);
        else if (g.mat === '2x4') it("2x4 × 8'", q, 'stick', pr.s2x4);
        else if (g.mat === '4x4') it("4x4 × 8' ground-contact treated", q, 'stick', pr.s4x4, 'Stand legs only — never inside the hive');
      });
    });
    var sq = res.screen.reduce(function (s, p) { return s + p.w * p.L / 144; }, 0);
    if (sq) it('#8 (1/8") galvanized hardware cloth', Math.ceil(sq), 'sq ft', pr.screen);
    if (res.metal.length) it('Cover sheet metal (galv./aluminum)', res.metal.length, 'each', pr.metal);
    var nails = boxes * 28 + (comps.outer || 0) * 20 + (comps.inner || 0) * 12 + (comps['bottom-solid'] || 0) * 16 + (comps['bottom-screened'] || 0) * 16;
    var fz = res.fence;
    if (fz) { var n4 = boxes * 28; nails -= n4; it('4d (1 1/2") galv. ring-shank nails (≈' + n4 + ' est.)', Math.max(1, Math.ceil(n4 / 250)), 'lb box', pr.nails4d, 'Fence-box corners; pre-drill. ~250 per lb'); }
    if (nails) it('6d galvanized nails (≈' + nails + ' est.)', Math.max(1, Math.ceil(nails / 150)), 'lb box', pr.nails, 'Estimate ~150 per lb');
    var parts = boxes + (comps.outer || 0) + (comps.inner || 0) + (comps['bottom-solid'] || 0) + (comps['bottom-screened'] || 0);
    if (parts) it('Waterproof wood glue 16 oz', Math.max(1, Math.ceil(parts / 8)) + (fz ? Math.ceil(boxes / 6) : 0), 'bottle', pr.glue, fz ? 'Titebond III. Includes extra for ' + fz.joints + ' full-length edge joints' : 'Estimate ~8 assemblies per bottle');
    if (fz) {
      var dw = fz.parts.reduce(function (s, p) { return s + (p.join - 1) * Math.ceil(p.L / 6); }, 0);
      if (dw) it('1/4" × 1 1/4" fluted dowel pins', Math.max(1, Math.ceil(dw / 50)), 'bag of 50', pr.dowels, '≈' + dw + ' dowels at 6" o.c. — or rip 1/8" splines from offcuts (free)');
      var nc = res.cl.rows.filter(function (r) { return r.solid && /cleat/.test(r.name); }).reduce(function (s, r) { return s + r.qty * (Math.ceil(r.L / 4) + 1); }, 0);
      if (nc) it('1 1/4" #8 exterior screws (cleats, ≈' + nc + ')', Math.max(1, Math.ceil(nc / 150)), 'lb box', pr.screws114, 'Staggered into both boards, every 4"');
    }
    var area = 0, g = HB.geom(fz ? { frames: c.frames, t: HB.FENCE.t } : c);
    ['deep', 'medium', 'shallow'].forEach(function (k) { area += (comps[k] || 0) * 2 * (g.L + g.W) * HB.STD.height[k]; });
    area += (comps.outer || 0) * (22 * 18.5 + 2 * (22 + 18.5) * 2.25) + ((comps['bottom-solid'] || 0) + (comps['bottom-screened'] || 0)) * 2 * 22 * 2.5;
    var gal = area / 144 * 3 / 350;
    if (gal > 0) it('Exterior primer + paint (3 coats outside only)', Math.max(1, Math.ceil(gal)), 'gal', pr.paint, '≈' + Math.round(area / 144) + ' sq ft; 350 sq ft/gal/coat est.');
    if (boxes) it(fz ? 'Metal frame rests (REQUIRED in fence mode)' : 'Metal frame rests (optional)', boxes, 'pair', pr.rests, fz ? '5/8" walls leave a 1/4" lip at the rabbet' : '');
    if (comps.stand) it('3" exterior screws', Math.max(1, Math.ceil(comps.stand / 4)), 'lb box', pr.screws);
    if (!c.makeFrames) { var nf = ((comps.deep || 0) + (comps.medium || 0) + (comps.shallow || 0)) * c.frames; if (nf) it('Frames (buy, ' + c.frames + ' per box)', nf, 'each', pr.frame, 'Foundation not included'); }
    else if (res.frameBf) it('Frame stock, clear pine (est.)', Math.ceil(res.frameBf), 'bd ft', pr.bf_pine, 'Includes ~40% milling waste');
    return items;
  };
})();
