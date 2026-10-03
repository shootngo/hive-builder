/* Frank's Hive Builder — standard dimensions, units, parts generator */
(function () {
  'use strict';
  var HB = window.HB = window.HB || {};
  HB.units = localStorage.getItem('hb_units') || 'in';
  HB.setUnits = function (u) { HB.units = u; localStorage.setItem('hb_units', u); };

  function frac(x) {
    var neg = x < 0; x = Math.abs(x);
    var n = Math.round(x * 16), w = Math.floor(n / 16), r = n % 16, d = 16;
    while (r && r % 2 === 0) { r /= 2; d /= 2; }
    var s = (w ? String(w) : '') + (r ? (w ? ' ' : '') + r + '/' + d : '');
    return (neg ? '-' : '') + (s || '0') + '"';
  }
  HB.frac = frac;
  HB.f = function (x) {
    if (HB.units === 'mm') { var m = x * 25.4; return (m < 20 ? (Math.round(m * 10) / 10) : Math.round(m)) + ' mm'; }
    return frac(x);
  };
  HB.txwxl = function (p) { return HB.f(p.t) + ' × ' + HB.f(p.w) + ' × ' + HB.f(p.L); };

  /* ---- Verified standards (Beesource 10-frame plans, MSU Ext. Pub. 3594, Dadant) ---- */
  HB.STD = {
    inside: { 10: { L: 18.375, W: 14.75 }, 8: { L: 18.375, W: 12.5 } },
    height: { deep: 9.625, medium: 6.625, shallow: 5.6875 },
    rabbet: { down: 0.625, into: 0.375 },      // frame rest: 5/8" down from top edge x 3/8" into the board
    finger: 0.75,
    frame: { top: { L: 19, w: 1.0625, t: 0.75 }, bottom: { L: 17.75, w: 0.75, t: 0.375 },
      end: { deep: 9.125, medium: 6.25, shallow: 5.375 }, endW: 1.375, endWlow: 1.125, endT: 0.375 },
    bottom: { L: 22, railH: 1.875, summer: 0.75, winter: 0.375 },
    inner: { h: 0.625, rim: 0.75, hole: { w: 1.25, L: 3.5 } },
    outer: { clear: 0.375, rimH: 1.5, top: 0.75 },
    reducer: { t: 0.75, notchBig: 3.5, notchSmall: 0.75, notchD: 0.375 }
  };
  HB.NAMES = {
    deep: 'Deep box', medium: 'Medium super', shallow: 'Shallow super',
    'bottom-solid': 'Bottom board — solid (reversible)', 'bottom-screened': 'Bottom board — screened',
    inner: 'Inner cover', outer: 'Telescoping top cover', 'frame-deep': 'Frames — deep',
    'frame-medium': 'Frames — medium', 'frame-shallow': 'Frames — shallow', reducer: 'Entrance reducer', stand: 'Hive stand'
  };

  HB.geom = function (o) {
    var fr = o.frames == 8 ? 8 : 10, t = +o.t || 0.75, ins = HB.STD.inside[fr];
    return { frames: fr, t: t, inL: ins.L, inW: ins.W, L: ins.L + 2 * t, W: ins.W + 2 * t };
  };

  /* Box-joint finger layout, 3/4" fingers from the bottom; top 5/8" zone belongs to the end board (frame rest). */
  HB.fingers = function (H) {
    var P = HB.STD.finger, low = H - HB.STD.rabbet.down, n = Math.floor(low / P + 1e-6), out = [], y = 0, i;
    if (n < 1) n = 1;
    for (i = 1; i <= n; i++) {
      var h = i === n ? low - y : P;
      out.push({ y0: y, y1: y + h, owner: ((n - i) % 2 === 0) ? 'end' : 'long' });
      y += h;
    }
    out.push({ y0: low, y1: H, owner: 'top' });
    return out; // y measured up from bottom edge
  };

  function P(name, qty, t, w, L, op, mat, code) { return { name: name, qty: qty, t: t, w: w, L: L, op: op || '', mat: mat || 'board', code: code || '' }; }
  HB.P = P;

  /* Parts for one component. o = {frames, t, joint:'box'|'rabbet'|'butt', handhold:'cleat'|'routed', standH} */
  HB.parts = function (comp, o) {
    var g = HB.geom(o), t = g.t, S = HB.STD, f = HB.frac, out = [];
    var joint = o.joint || 'box', hh = o.handhold || 'cleat';
    if (S.height[comp]) {
      var H = S.height[comp], nm = HB.NAMES[comp].split(' ')[0], longL, endL, lop, eop;
      var fr = 'frame-rest rabbet ' + f(S.rabbet.down) + ' down × ' + f(S.rabbet.into) + ' deep along inside top edge';
      if (joint === 'rabbet') {
        var d = Math.round(t / 2 * 16) / 16;
        longL = g.L - 2 * (t - d); endL = g.W;
        lop = 'Square ends; sits in end-board rabbets';
        eop = 'Rabbet both ends ' + f(t) + ' wide × ' + f(d) + ' deep; ' + fr;
      } else if (joint === 'butt') {
        longL = g.L; endL = g.W - 2 * t;
        lop = 'Square ends (butt joint — glue + screws/nails)';
        eop = 'Fits between sides; ' + fr;
      } else {
        longL = g.L; endL = g.W;
        lop = 'Box joints, 3/4" fingers: FINGER at bottom edge; trim top finger to 3/8" long';
        eop = 'Box joints, 3/4" fingers: SLOT at bottom edge; ' + fr;
      }
      if (hh === 'routed') { lop += '; routed handhold'; eop += '; routed handhold'; }
      var pf = nm.charAt(0);
      out.push(P(nm + ' long side', 2, t, H, longL, lop, 'board', pf + 'S'));
      out.push(P(nm + ' end board', 2, t, H, endL, eop, 'board', pf + 'E'));
      if (hh === 'cleat') out.push(P(nm + ' handhold cleat', 2, t, 1.5, g.W, 'Glue + screw to end boards, top edge about 2 1/2" below box top', 'board', pf + 'H'));
      return out;
    }
    if (comp === 'bottom-solid') {
      var iw = g.W - 2 * t;
      out.push(P('Bottom rail', 2, t, S.bottom.railH, S.bottom.L, 'Groove to fit plywood (≈3/4" wide) × 3/8" deep, bottom of groove 3/8" up from lower edge', 'board', 'R'));
      out.push(P('Bottom floor (3/4" ext. plywood)', 1, 0.75, iw + 0.75, S.bottom.L, 'Slides into rail grooves', 'ply34', 'F'));
      out.push(P('Back cleat — 3/4" (summer) side', 1, t, 0.75, iw, 'Glue + nail on floor at back', 'board', 'C'));
      out.push(P('Back cleat — 3/8" (winter) side', 1, t, 0.375, iw, 'Glue + nail under floor at back', 'board', 'c'));
      return out;
    }
    if (comp === 'bottom-screened') {
      var iw2 = g.W - 2 * t;
      out.push(P('Screened-bottom rail', 2, t, 2.5, S.bottom.L, 'Groove 1/4" wide × 1/4" deep, 2" down from top edge (sticky-board slot)', 'board', 'R'));
      out.push(P('Screen ledge strip', 2, t, 0.75, S.bottom.L - t, 'Glue + nail inside rails, top 3/4" below rail top', 'board', 'L'));
      out.push(P('Back cleat (above screen)', 1, t, 0.75, iw2, 'Closes back; screen pinched under it', 'board', 'C'));
      out.push(P('#8 (1/8") hardware cloth', 1, 0.03, iw2, S.bottom.L - t, 'Staple to ledges every 2"', 'screen', 'M'));
      out.push(P('Sticky / mite board (1/4" ply or coroplast)', 1, 0.25, iw2 + 0.375, S.bottom.L - 0.5, 'Slides in from back in the 1/4" grooves', 'ply14', 'B'));
      return out;
    }
    if (comp === 'inner') {
      var r = S.inner.rim;
      out.push(P('Inner-cover rim, long', 2, r, S.inner.h, g.L, 'Rabbet 3/8" wide × 1/4" deep on top inside edge', 'board', 'I'));
      out.push(P('Inner-cover rim, short', 2, r, S.inner.h, g.W - 2 * r, 'Same rabbet; butt between long rims', 'board', 'i'));
      out.push(P('Inner-cover panel (1/4" ext. plywood)', 1, 0.25, g.W - 2 * r + 0.75, g.L - 2 * r + 0.75, 'Center hole ' + f(S.inner.hole.w) + ' × ' + f(S.inner.hole.L) + ' (two 1 1/4" holes, jigsaw between)', 'ply14', 'P'));
      return out;
    }
    if (comp === 'outer') {
      var oiL = g.L + S.outer.clear, oiW = g.W + S.outer.clear, oL = oiL + 2 * t, oW = oiW + 2 * t;
      out.push(P('Top-cover rim, long', 2, t, S.outer.rimH, oL, 'Square ends; long rims overlap short rims', 'board', 'T'));
      out.push(P('Top-cover rim, short', 2, t, S.outer.rimH, oiW, 'Butt between long rims', 'board', 't'));
      out.push(P('Top-cover lid (3/4" ext. plywood)', 1, 0.75, oW, oL, 'Glue + nail onto rims', 'ply34', 'K'));
      out.push(P('Galvanized/aluminum sheet', 1, 0.02, oW + 2, oL + 2, 'Fold 1" down each side, nail edges', 'metal', 'G'));
      return out;
    }
    if (comp === 'reducer') {
      out.push(P('Entrance reducer', 1, 0.75, 0.75, g.W - 2 * t, 'Notch 3/8" × 3 1/2" on one face, 3/8" × 3/4" on another', 'board', 'Z'));
      return out;
    }
    if (comp.indexOf('frame-') === 0) {
      var k = comp.slice(6), n = g.frames, F = S.frame;
      out.push(P('Frame top bar', n, F.top.t, F.top.w, F.top.L, 'Groove/wedge for foundation; ears rest on frame rest', 'frame', 'A'));
      out.push(P('Frame end bar (' + k + ')', 2 * n, F.endT, F.endW, F.end[k], 'Taper 1 3/8" → 1 1/8" on lower part; notch for top & bottom bars', 'frame', 'N'));
      out.push(P('Frame bottom bar', n, F.bottom.t, F.bottom.w, F.bottom.L, 'Kerf 1/8" × 5/16" for foundation', 'frame', 'O'));
      return out;
    }
    if (comp === 'stand') {
      var sh = +o.standH || 18;
      out.push(P('Stand rail, long (2x4)', 2, 1.5, 3.5, 22, 'Frame top matches the 22" bottom board', '2x4', 'U'));
      out.push(P('Stand rail, cross (2x4)', 2, 1.5, 3.5, g.W - 3, 'Between long rails; 3" exterior screws', '2x4', 'u'));
      out.push(P('Stand leg (4x4, ground-contact treated)', 4, 3.5, 3.5, sh - 3.5, 'Top of rails = ' + f(sh) + ' off the ground', '4x4', 'Y'));
      return out;
    }
    return out;
  };

  HB.COMP_LIST = ['deep', 'medium', 'shallow', 'bottom-solid', 'bottom-screened', 'inner', 'outer', 'frame-deep', 'frame-medium', 'frame-shallow', 'reducer', 'stand'];
})();
