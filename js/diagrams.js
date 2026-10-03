/* Frank's Hive Builder — dimensioned SVG diagrams (inches as SVG units) */
(function () {
  'use strict';
  var HB = window.HB;
  var C = { wood: '#7a5a2e', wood2: '#5e4522', edge: '#f0c879', dim: '#6fd0ff', ply: '#8d7a55', metal: '#9fb3c8', hid: '#ffb347', scr: '#9aa' };

  function n(v) { return Math.round(v * 1000) / 1000; }
  function Ctx(fs) { this.fs = fs; this.sw = fs * 0.07; this.o = []; }
  Ctx.prototype.add = function (s) { this.o.push(s); return this; };
  Ctx.prototype.rect = function (x, y, w, h, fill, stroke, dash) {
    return this.add('<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || C.edge) + '" stroke-width="' + n(this.sw) + '"' + (dash ? ' stroke-dasharray="' + n(this.fs * .4) + ' ' + n(this.fs * .25) + '"' : '') + '/>');
  };
  Ctx.prototype.poly = function (pts, fill, stroke, dash) {
    return this.add('<polygon points="' + pts.map(function (p) { return n(p[0]) + ',' + n(p[1]); }).join(' ') + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || C.edge) + '" stroke-width="' + n(this.sw) + '"' + (dash ? ' stroke-dasharray="' + n(this.fs * .4) + ' ' + n(this.fs * .25) + '"' : '') + '/>');
  };
  Ctx.prototype.line = function (x1, y1, x2, y2, col, w, dash) {
    return this.add('<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" stroke="' + (col || C.dim) + '" stroke-width="' + n(w || this.sw * .8) + '"' + (dash ? ' stroke-dasharray="' + n(this.fs * .4) + ' ' + n(this.fs * .25) + '"' : '') + '/>');
  };
  Ctx.prototype.text = function (x, y, s, opt) {
    opt = opt || {};
    var fs = this.fs * (opt.k || 1), rot = opt.rot ? ' transform="rotate(' + opt.rot + ' ' + n(x) + ' ' + n(y) + ')"' : '';
    return this.add('<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + n(fs) + '" text-anchor="' + (opt.a || 'middle') + '" class="' + (opt.c || 'dl') + '"' + rot + ' stroke-width="' + n(fs * .18) + '">' + s + '</text>');
  };
  Ctx.prototype.arrow = function (x, y, dx, dy) {
    var a = this.fs * .42, b = this.fs * .17, px = -dy, py = dx;
    return this.poly([[x, y], [x - dx * a + px * b, y - dy * a + py * b], [x - dx * a - px * b, y - dy * a - py * b]], C.dim, C.dim);
  };
  /* horizontal dimension at y between x1,x2; ext = y of the object edge for extension lines */
  Ctx.prototype.dh = function (x1, x2, y, label, ext, pos) {
    if (ext !== undefined) { this.line(x1, ext, x1, y + (y > ext ? .3 : -.3) * this.fs, C.dim, this.sw * .5); this.line(x2, ext, x2, y + (y > ext ? .3 : -.3) * this.fs, C.dim, this.sw * .5); }
    this.line(x1, y, x2, y); this.arrow(x1, y, -1, 0); this.arrow(x2, y, 1, 0);
    var small = Math.abs(x2 - x1) < this.fs * 2.6;
    return this.text(small ? x2 + this.fs * .3 : x1 + (x2 - x1) * (pos || .5), y - this.fs * .3, label, small ? { a: 'start' } : {});
  };
  Ctx.prototype.dv = function (y1, y2, x, label, ext, pos) {
    if (ext !== undefined) { this.line(ext, y1, x + (x > ext ? .3 : -.3) * this.fs, y1, C.dim, this.sw * .5); this.line(ext, y2, x + (x > ext ? .3 : -.3) * this.fs, y2, C.dim, this.sw * .5); }
    this.line(x, y1, x, y2); this.arrow(x, y1, 0, -1); this.arrow(x, y2, 0, 1);
    var small = Math.abs(y2 - y1) < this.fs * 2.6;
    if (small) return this.text(x + (x > ext ? .35 : -.35) * this.fs, Math.min(y1, y2) - this.fs * .35, label, { a: x > ext ? 'start' : 'end' });
    var my = y1 + (y2 - y1) * (pos || .5); return this.text(x - this.fs * .3, my, label, { rot: -90 });
  };
  function svg(x0, y0, w, h, ctx) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + n(x0) + ' ' + n(y0) + ' ' + n(w) + ' ' + n(h) + '" preserveAspectRatio="xMidYMid meet">' + ctx.o.join('') + '</svg>';
  }
  /* Build a view: drawing occupies (0,0)-(w,h); pads leave room for dims */
  function view(title, w, h, draw, opt) {
    opt = opt || {};
    var fs = opt.fs || Math.max(w, h * 1.15) / 15, c = new Ctx(fs);
    var pl = opt.pl !== undefined ? opt.pl : fs * 3, pr = opt.pr !== undefined ? opt.pr : fs * 3, pt = opt.pt !== undefined ? opt.pt : fs * 3.2, pb = opt.pb !== undefined ? opt.pb : fs * 3;
    draw(c, fs);
    return { title: title, svg: svg(-pl, -pt, w + pl + pr, h + pt + pb, c), note: opt.note || '' };
  }
  HB.view = view; HB.Ctx = Ctx; HB.COL = C;
  var F = function (x) { return HB.f(x); };

  function boxViews(comp, o) {
    var g = HB.geom(o), t = g.t, H = HB.STD.height[comp], R = HB.STD.rabbet, joint = o.joint || 'box', V = [];
    // 1 plan
    V.push(view('Top view (looking down) — ' + g.frames + '-frame', g.L, g.W, function (c, fs) {
      c.rect(0, 0, g.L, g.W, C.wood2); c.rect(t, t, g.inL, g.inW, '#1b1b1b');
      c.line(t + R.into, t, t + R.into, t + g.inW, C.hid, c.sw, true); c.line(g.L - t - R.into, t, g.L - t - R.into, t + g.inW, C.hid, c.sw, true);
      c.dh(0, g.L, -fs * 1.6, 'Outside ' + F(g.L), 0);
      c.dv(0, g.W, -fs * 1.4, 'Outside ' + F(g.W), 0);
      c.dh(t, t + g.inL, g.W * .26, 'Inside ' + F(g.inL), undefined, .4);
      c.dv(t, t + g.inW, g.L * .86, 'Inside ' + F(g.inW), undefined, .66);
      c.dh(g.L - t, g.L, g.W + fs * 1.5, 'Wall ' + F(t), g.W);
      c.text(g.L * .42, g.W * .66, 'Frames hang across the ends ↔', { k: .7, c: 'nt' });
      c.text(g.L / 2, g.W + fs * 2.8, 'Orange dashes = frame-rest ledge on the end boards', { k: .62, c: 'nt' });
    }, { pb: g.W * 0 + (g.L / 15) * 3.4 }));
    // 2 end board
    V.push(view('End board (front/back) — outside face', g.W, H, function (c, fs) {
      drawBoard(c, g.W, H, t, joint, 'end');
      c.line(0, R.down, g.W, R.down, C.hid, c.sw, true);
      c.dh(0, g.W, -fs * 1.6, F(joint === 'butt' ? g.W - 2 * t : g.W), 0);
      c.dv(0, H, -fs * 1.4, F(H), 0);
      c.dv(0, R.down, g.W + fs * 1.4, F(R.down) + ' rabbet', g.W);
      handhold(c, g.W, H, o, fs);
    }, { fs: Math.max(g.W, H * 1.15) / 15, pr: Math.max(g.W, H * 1.15) / 15 * 6 }));
    // 3 long side
    var ll = joint === 'rabbet' ? g.L - 2 * (t - Math.round(t / 2 * 16) / 16) : g.L;
    V.push(view('Long side — outside face', ll, H, function (c, fs) {
      drawBoard(c, ll, H, t, joint, 'long');
      c.dh(0, ll, -fs * 1.6, F(ll), 0);
      c.dv(0, H, -fs * 1.4, F(H), 0);
      if (o.handhold === 'routed') handhold(c, ll, H, o, fs);
    }, { fs: Math.max(g.W, H * 1.15) / 15 }));
    // 4 rabbet detail
    V.push(view('Frame-rest rabbet — section through end board (enlarged)', t + 1.6, 2.2, function (c, fs) {
      var x0 = 0.8;
      c.poly([[x0, R.down], [x0 + t - R.into, R.down], [x0 + t - R.into, 0], [x0 + t, 0], [x0 + t, 2.2], [x0, 2.2]].map(function (p) { return p; }), C.wood, C.edge);
      c.poly([[x0, 0], [x0 + t - R.into, 0], [x0 + t - R.into, R.down], [x0, R.down]], 'none', C.hid, true);
      c.dh(x0, x0 + t - R.into, -fs * 1.2, F(R.into) + ' deep', 0);
      c.dv(0, R.down, x0 - fs * .9, F(R.down) + ' down', x0);
      c.dh(x0, x0 + t, 2.2 + fs * 1.3, 'Stock ' + F(t), 2.2);
      c.text(x0 + t + fs * .4, 1.2, 'outside', { a: 'start', k: .8, c: 'nt' });
      c.text(x0 - fs * .3, 1.2, 'inside', { a: 'end', k: .8, c: 'nt' });
    }, { fs: 0.17, pl: 0.2, pr: 0.2, pt: 0.55, pb: 0.5, note: 'Frame top-bar ears hang on this ledge. Outline said 3/8" × 3/8" — too shallow; verified plans use 5/8" × 3/8".' }));
    return V;
  }
  function drawBoard(c, w, H, t, joint, side) {
    c.rect(0, 0, w, H, C.wood);
    for (var gy = H * .18; gy < H; gy += H * .22) c.line(0, gy, w, gy + H * .03, C.wood2, c.sw * .6);
    if (joint === 'box') {
      HB.fingers(H).forEach(function (u) {
        var y0 = H - u.y1, hh = u.y1 - u.y0, cut = 0;
        if (side === 'end' && u.owner === 'long') cut = t;
        if (side === 'long' && u.owner === 'end') cut = t;
        if (side === 'long' && u.owner === 'top') cut = t - HB.STD.rabbet.into;
        if (cut) { c.rect(0, y0, cut, hh, '#151515', C.edge); c.rect(w - cut, y0, cut, hh, '#151515', C.edge); }
      });
    } else if (joint === 'rabbet' && side === 'end') {
      var d = Math.round(t / 2 * 16) / 16;
      c.line(t, 0, t, H, C.hid, c.sw, true); c.line(w - t, 0, w - t, H, C.hid, c.sw, true);
      c.text(t + .2, H * .5, 'rabbet ' + HB.f(t) + '×' + HB.f(d), { a: 'start', k: .6, c: 'nt' });
    }
  }
  function handhold(c, w, H, o, fs) {
    if (o.handhold === 'routed') { var hw = 4.5, hy = Math.min(2, H * .25); c.rect(w / 2 - hw / 2, hy, hw, 1, '#151515', C.edge); c.text(w / 2, hy + 1 + fs * 1.1, 'handhold ≈4 1/2"×1" (approx.)', { k: .6, c: 'nt' }); }
    else { var cy = Math.min(2.5, H * .3); c.rect(1, cy, w - 2, 1.5, 'none', C.hid, true); c.text(w / 2, cy + .95, 'cleat 1 1/2" (on face)', { k: .6, c: 'nt' }); }
  }

  function bottomViews(comp, o) {
    var g = HB.geom(o), t = g.t, B = HB.STD.bottom, V = [], iw = g.W - 2 * t, scr = comp === 'bottom-screened';
    V.push(view('Bottom board — top view', B.L, g.W, function (c, fs) {
      c.rect(0, 0, B.L, g.W, scr ? '#2a2f2f' : C.ply);
      if (scr) for (var x = 1; x < B.L - t; x += .9) c.line(x, t, x, g.W - t, C.scr, c.sw * .4);
      c.rect(0, 0, B.L, t, C.wood); c.rect(0, g.W - t, B.L, t, C.wood); c.rect(B.L - t, t, t, iw, C.wood2);
      c.rect(0, t, B.L - 19.875 - (scr ? 0 : 0), iw, 'none', C.hid, true);
      c.dh(0, B.L, -fs * 1.6, F(B.L), 0); c.dv(0, g.W, -fs * 1.4, F(g.W), 0);
      c.dh(0, B.L - 19.875, g.W + fs * 1.5, 'landing ' + F(B.L - 19.875), g.W);
      c.text(B.L * .55, g.W / 2, scr ? '#8 hardware cloth' : '3/4" ext. plywood floor', { k: .75, c: 'nt' });
      c.text(-fs * .2, g.W + fs * 2.9, 'FRONT / entrance ←', { a: 'start', k: .65, c: 'nt' });
    }));
    if (!scr) {
      V.push(view('Rail section — reversible entrance', 3.4, B.railH, function (c, fs) {
        c.rect(0, 0, t, B.railH, C.wood); c.rect(t - .375, B.winter, 3.4 - t + .375, .75, C.ply);
        c.dv(0, B.summer, 3.4 + fs * .2, F(B.summer) + ' summer', 3.4);
        c.dv(B.summer + .75, B.railH, 3.4 + fs * .2, F(B.winter) + ' winter', 3.4);
        c.dv(0, B.railH, -fs * 1.1, F(B.railH), 0);
        c.dh(0, t, B.railH + fs * 1.2, F(t), B.railH);
        c.text(1.8, B.summer + .5, 'floor in 3/8" groove', { k: .7, c: 'nt' });
      }, { fs: .2, pl: .5, pr: 1.6, pt: .5, pb: .55, note: 'Floor is offset in the groove: flip the board for a 3/4" (summer) or 3/8" (winter) entrance — Beesource plan geometry.' }));
    } else {
      V.push(view('Rail section — screened bottom', 3.4, 2.5, function (c, fs) {
        c.rect(0, 0, t, 2.5, C.wood); c.rect(t, .75, t, .75, C.wood2);
        c.line(t, .75, 3.4, .75, C.scr, c.sw * 1.5, true);
        c.rect(t - .25, 2, 3.4 - t + .25, .25, C.ply);
        c.dv(0, .75, 3.4 + fs * .2, '3/4" entrance', 3.4);
        c.dv(0, 2, -fs * 1.1, '2" to slot', 0);
        c.dh(0, t, 2.5 + fs * 1.2, F(t), 2.5);
        c.text(2.4, 1.6, 'mite / SHB board', { k: .65, c: 'nt' });
      }, { fs: .2, pl: .55, pr: 1.6, pt: .5, pb: .55, note: 'Shop design on the standard 22" footprint. MSU Extension notes screened floors are used year-round in Mississippi and help with SHB debris and mite sampling.' }));
    }
    return V;
  }

  function innerViews(o) {
    var g = HB.geom(o), I = HB.STD.inner, V = [];
    V.push(view('Inner cover — top view', g.L, g.W, function (c, fs) {
      c.rect(0, 0, g.L, g.W, C.ply); c.rect(I.rim, I.rim, g.L - 2 * I.rim, g.W - 2 * I.rim, 'none', C.hid, true);
      var hx = g.L / 2, hy = g.W / 2;
      c.add('<rect x="' + n(hx - I.hole.L / 2) + '" y="' + n(hy - I.hole.w / 2) + '" width="' + I.hole.L + '" height="' + I.hole.w + '" rx="' + I.hole.w / 2 + '" fill="#111" stroke="' + C.edge + '" stroke-width="' + n(c.sw) + '"/>');
      c.dh(0, g.L, -fs * 1.6, F(g.L), 0); c.dv(0, g.W, -fs * 1.4, F(g.W), 0);
      c.dh(hx - I.hole.L / 2, hx + I.hole.L / 2, hy - fs * 1.2, F(I.hole.L)); c.dv(hy - I.hole.w / 2, hy + I.hole.w / 2, hx + I.hole.L / 2 + fs * 1.6, F(I.hole.w), hx + I.hole.L / 2);
    }));
    V.push(view('Inner cover — rim section', 2.6, I.h, function (c, fs) {
      c.poly([[0, 0], [I.rim - .375, 0], [I.rim - .375, .25], [I.rim, .25], [I.rim, I.h], [0, I.h]], C.wood);
      c.rect(I.rim - .375, 0, 2.6 - I.rim + .375, .25, C.ply);
      c.dv(0, I.h, -fs * 1.1, F(I.h), 0); c.dh(0, I.rim, I.h + fs * 1.2, F(I.rim), I.h);
      c.dv(.25, I.h, 2.6 + fs * .3, '3/8" bee space', 2.6);
      c.text(1.8, -fs * .5, '1/4" plywood in 3/8"×1/4" rabbet', { k: .7, c: 'nt' });
    }, { fs: .15, pl: .45, pr: 1.3, pt: .45, pb: .45, note: 'Bee-space side faces down. MSU Extension: about 5/8" air space between inner cover and telescoping lid.' }));
    return V;
  }

  function outerViews(o) {
    var g = HB.geom(o), t = g.t, O = HB.STD.outer, iL = g.L + O.clear, iW = g.W + O.clear, oL = iL + 2 * t, oW = iW + 2 * t, V = [];
    V.push(view('Telescoping cover — top view', oL, oW, function (c, fs) {
      c.rect(0, 0, oL, oW, C.metal); c.rect(t, t, iL, iW, 'none', C.hid, true);
      c.dh(0, oL, -fs * 1.6, F(oL), 0); c.dv(0, oW, -fs * 1.4, F(oW), 0);
      c.dh(t, t + iL, oW * .28, 'Inside ' + F(iL), undefined, .4); c.dv(t, t + iW, oL * .86, 'Inside ' + F(iW), undefined, .66);
    }));
    V.push(view('Telescoping cover — section', 3, O.rimH + O.top, function (c, fs) {
      c.rect(0, O.top, t, O.rimH, C.wood); c.rect(0, 0, 3, O.top, C.ply); c.line(-.05, -.05, 3, -.05, C.metal, c.sw * 2); c.line(-.05, -.05, -.05, .9, C.metal, c.sw * 2);
      c.dv(0, O.top + O.rimH, -fs * 1.2, F(O.top + O.rimH), 0); c.dv(O.top, O.top + O.rimH, 3 + fs * .3, F(O.rimH) + ' rim', 3);
      c.dh(0, t, O.top + O.rimH + fs * 1.2, F(t), O.top + O.rimH);
      c.text(1.9, O.top * .65, '3/4" ext. plywood + metal', { k: .65, c: 'nt' });
    }, { fs: .2, pl: .55, pr: 1.25, pt: .45, pb: .55, note: 'Inside is 3/8" larger than the box each way so it telescopes over the top box (Beesource: 20 1/4" × 16 5/8" inside for 10-frame).' }));
    return V;
  }

  function frameViews(k, o) {
    var Fm = HB.STD.frame, h = Fm.end[k], V = [], eo = (Fm.top.L - Fm.bottom.L) / 2;
    V.push(view('Frame (' + k + ') — face view', Fm.top.L, h, function (c, fs) {
      var ex = 0.6; // end bar offset under ear (approx)
      c.rect(0, 0, Fm.top.L, Fm.top.t, C.wood);
      c.rect(ex, 0, Fm.endT, h, C.wood2); c.rect(Fm.top.L - ex - Fm.endT, 0, Fm.endT, h, C.wood2);
      c.rect(eo, h - Fm.bottom.t, Fm.bottom.L, Fm.bottom.t, C.wood);
      c.rect(ex + Fm.endT, Fm.top.t, Fm.top.L - 2 * (ex + Fm.endT), h - Fm.top.t - Fm.bottom.t, '#2b2410', C.edge, true);
      c.dh(0, Fm.top.L, -fs * 1.6, 'Top bar ' + F(Fm.top.L), 0);
      c.dh(eo, eo + Fm.bottom.L, h + fs * 1.6, 'Bottom bar ' + F(Fm.bottom.L), h);
      c.dv(0, h, -fs * 1.4, F(h), 0);
      c.text(Fm.top.L / 2, h / 2 + fs * .3, 'foundation', { k: .8, c: 'nt' });
    }));
    V.push(view('End bar — edge view (taper)', 3, h, function (c, fs) {
      var w1 = Fm.endW, w2 = Fm.endWlow, tz = Math.min(h * .33, 3), off = (w1 - w2) / 2, x0 = .8;
      c.poly([[x0, 0], [x0 + w1, 0], [x0 + w1, tz], [x0 + w1 - off, tz + .3], [x0 + w1 - off, h], [x0 + off, h], [x0 + off, tz + .3], [x0, tz]], C.wood2);
      c.dh(x0, x0 + w1, -fs * 1.3, F(w1), 0); c.dh(x0 + off, x0 + w1 - off, h + fs * 1.3, F(w2), h);
      c.dv(0, h, x0 + w1 + fs * 1.4, F(h), x0 + w1);
    }, { pl: .3, pr: 2.4, note: 'Wide top section spaces frames at 1 3/8" centers; Beesource frame review gives 1 1/8" below (some plans taper to 1"). Frame stock 3/8" thick end bars, 3/4" top bar, 3/8" bottom bar.' }));
    return V;
  }

  function reducerViews(o) {
    var g = HB.geom(o), R = HB.STD.reducer, L = g.W - 2 * g.t;
    return [view('Entrance reducer — front & back faces', L, 2.6, function (c, fs) {
      c.poly([[0, 0], [L, 0], [L, .75], [L - 1, .75], [L - 1, .375], [L - 1 - R.notchSmall, .375], [L - 1 - R.notchSmall, .75], [0, .75]], C.wood);
      var y2 = 1.85, a = L / 2 - R.notchBig / 2;
      c.poly([[0, y2], [L, y2], [L, y2 + .75], [a + R.notchBig, y2 + .75], [a + R.notchBig, y2 + .375], [a, y2 + .375], [a, y2 + .75], [0, y2 + .75]], C.wood);
      c.dh(0, L, -fs * 1.4, F(L), 0);
      c.dh(L - 1 - R.notchSmall, L - 1, .75 + fs * 1.4, F(R.notchSmall), .75);
      c.dh(a, a + R.notchBig, y2 + .75 + fs * 1.4, F(R.notchBig), y2 + .75);
      c.dv(y2, y2 + .75, -fs * 1.1, '3/4"', 0); c.dv(y2 + .375, y2 + .75, L + fs * .9, '3/8"', L);
    }, { fs: Math.max(.7, L / 16), pt: 2, note: 'Block is 3/4" × 3/4" to fill the 3/4" summer entrance; turn it to choose the small or large notch.' })];
  }

  function standViews(o) {
    var g = HB.geom(o), sh = +o.standH || 18;
    return [view('Hive stand — side view', 22, sh, function (c, fs) {
      c.rect(0, 0, 22, 3.5, C.wood); c.rect(.5, 3.5, 3.5, sh - 3.5, '#4f6b3a'); c.rect(22 - 4, 3.5, 3.5, sh - 3.5, '#4f6b3a');
      c.line(-2, sh, 24, sh, '#888', c.sw);
      c.dh(0, 22, -fs * 1.6, F(22), 0); c.dv(0, sh, -fs * 1.4, F(sh) + ' to top', 0);
      c.dv(3.5, sh, 22 + fs * 1.4, 'legs ' + F(sh - 3.5), 22);
      c.text(11, 2.2, '2x4 frame', { k: .7, c: 'nt' });
    }, { note: 'MSU Extension: raising colonies more than 18" off the ground discourages skunks. Frame is ' + F(22) + ' × ' + F(g.W) + ' to match the bottom board.' })];
  }

  HB.diagram = function (comp, o) {
    if (HB.STD.height[comp]) return boxViews(comp, o);
    if (comp.indexOf('bottom') === 0) return bottomViews(comp, o);
    if (comp === 'inner') return innerViews(o);
    if (comp === 'outer') return outerViews(o);
    if (comp.indexOf('frame-') === 0) return frameViews(comp.slice(6), o);
    if (comp === 'reducer') return reducerViews(o);
    if (comp === 'stand') return standViews(o);
    return [];
  };
})();
