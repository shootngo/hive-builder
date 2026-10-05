/* Frank's Hive Builder — fence-board build steps (edge-joining) + location/spec notes */
(function () {
  'use strict';
  var HB = window.HB, C = HB.COL, F = function (x) { return HB.f(x); };
  var SAFE = { rip: 'Riving knife/splitter on, push stick for the last 12", stand out of the kickback line. Thin fence stock chatters, so use a featherboard. Eye + hearing protection.',
    cross: 'Use a miter gauge or crosscut sled with a stop block, never the rip fence as a length stop for crosscuts (kickback).',
    dust: 'Western red cedar dust is a known respiratory irritant/sensitizer. Wear a dust mask or respirator and run dust collection.' };

  /* Table-saw end-view sketch (same style as the solid guides) */
  function saw(o) {
    return HB.view(o.title, 8, 4, function (c, fs) {
      c.line(-1, 3, 9, 3, '#aaa', c.sw * 1.5); c.rect(7.4, 1.2, 0.6, 1.8, '#556', '#aab');
      var bx = 7.4 - o.fence, bw = o.dado || 0.125;
      c.rect(bx - bw, 3 - o.blade, bw, o.blade, '#d33', '#f66');
      if (o.onEdge) c.rect(7.4 - o.boardT, 3 - o.boardW, o.boardT, o.boardW, 'rgba(201,141,58,.55)', C.edge);
      else c.rect(7.4 - o.boardW, 3 - o.boardT, o.boardW, o.boardT, 'rgba(201,141,58,.55)', C.edge);
      c.dv(3 - o.blade, 3, bx - bw - fs * 1.2, 'blade ' + F(o.blade), bx - bw);
      c.dh(bx, 7.4, 3 + fs * 1.4, 'fence ' + F(o.fence), 3);
      c.text(7.7, 1, 'fence', { k: .7, c: 'nt' });
    }, { fs: .42, pt: 1.2, pb: 1.2, pl: .6, pr: .6 });
  }

  /* Edge-joining steps for one wall height. Ls = [{n: label, L: final length}] */
  function edgeSteps(H, Ls, o) {
    var k = HB.fenceKind(o), lay = HB.fenceLayout(H, k), t = HB.FENCE.t, st = HB.fenceStock(o), dog = k === 'dog', s = [];
    var cut = Ls.map(function (x) { return x.n + ' ' + F(x.L + HB.FENCE.lenAllow); });
    s.push({ t: 'Pick fence boards and let them dry', b: 'Pick through the stack for straight, flat ' + st.label + 's with tight knots and no splits running in from the ends. Buy about 10% extra. Fence boards around ' + HB.LOCATIONS.join(' and ') + ' are usually sold wet, so sticker them flat in the shop for 1–2 weeks before you cut. Plan which board goes on TOP of each wall: the cleanest, knot-free one, because it carries the frame rest.', s: ['Stock: ' + F(t) + ' × ' + F(HB.FENCE.rawW) + ' × ' + st.ft + ' ft (measure yours)', 'Boards per wall: ' + lay.n + ' edge-joined'], w: SAFE.dust, fw: dog ? ['dogTop', 'knots'] : ['knots'], fig: HB.fenceFigs.stock });
    s.push({ t: dog ? 'Cut off the dog-ears, crosscut strips' : 'Square the ends, crosscut strips', b: (dog ? 'Cut the dog-eared end off every picket (' + F(HB.FENCE.dog.earTrim) + ') and square the other end. A clipped corner can never end up in a part. ' : 'Square both ends of each board (about ' + F(HB.FENCE.tg.endTrim) + '). ') + 'Crosscut the strips ' + F(HB.FENCE.lenAllow) + ' longer than the finished part, ' + lay.n + ' strips per wall. Cut around loose knots and end splits.', s: ['Strip lengths: ' + cut.join(' · '), lay.n + ' strips per wall'], w: SAFE.cross, fw: dog ? ['dogTop'] : ['tg'], fig: HB.fenceFigs.stock });
    if (dog) {
      s.push({ t: 'Rip strips to one consistent width', b: 'Picket edges are rounded and rarely straight. Pass 1: straight-line rip one edge with the picket screwed to a straight carrier board, or use a jointer. Pass 2: put that clean edge on the fence and rip every strip for this box size to ' + F(lay.stripW) + ' at ONE fence setting, so all the panels come out the same. Check that the edges are square (90°) to the face. A beveled edge opens the joint on one side.', s: ['Fence: ' + F(lay.stripW) + ' from blade', 'Blade height: ' + F(t + .125), 'Blade at 90°: check with a square'], w: SAFE.rip, fw: ['joint'], fig: function () { return saw({ title: 'Rip strips to width', blade: t + .125, fence: lay.stripW, boardW: lay.stripW, boardT: t }); } });
      s.push({ t: 'Cut spline grooves (or drill for dowels)', b: 'Splines keep the faces flush along the whole long joint. Cut a centered 1/8" kerf 3/8" deep in each mating edge, with the OUTSIDE face against the fence on every strip so the faces line up even if the thickness varies. Rip 1/8" × 3/4" splines from cedar offcuts or exterior 1/8" plywood. Dowel option: 1/4" × 1 1/4" fluted dowels every 6" on center with a doweling jig.', s: ['Blade height: 3/8"', 'Fence: 1/4" to blade (centers a 1/8" kerf in 5/8")', 'Outside face against the fence', 'Spline: 1/8" × 3/4" × strip length'], w: 'Strip is standing on edge: use a tall auxiliary fence, a featherboard, and a push block. Never your fingers near the blade.', fw: ['joint'], fig: function (oo) { return HB.fenceFigs.joint(oo); } });
    } else {
      s.push({ t: 'Dry-fit the tongue & groove', b: 'Push pairs together dry. A good joint slides in with hand pressure, sits flush on the face, and shows no light. The tongue does the job of a spline. If it rocks or gaps, rip both edges straight and square, cut 1/8" spline grooves 3/8" deep, and use a 1/8" × 3/4" spline instead. Orient the GROOVE edge up on the top board, since it gets ripped off later.', s: ['Tongue: ' + F(HB.FENCE.tg.tongue), 'Coverage per board: ' + F(HB.FENCE.tg.cover)], w: SAFE.dust, fw: ['tg', 'joint'], fig: function (oo) { return HB.fenceFigs.joint(oo); } });
    }
    s.push({ t: 'Edge-glue and clamp', b: 'Roll a thin, even coat of waterproof exterior glue (Titebond III) on BOTH mating edges' + (dog ? ', set the splines,' : '') + ' and clamp with bar clamps every 6–8", alternating over and under so the panel stays flat. Use even, snug pressure: you want a thin bead of squeeze-out along the whole length, not a starved joint. Check flat with a straightedge. The joint runs the full length of the wall, so it has to be a strong glue joint with no gaps. Scrape the squeeze-out when it turns rubbery. Clamp 1 hour and wait 24 hours before machining.', s: ['Glue: Titebond III (waterproof, exterior)', 'Clamps: every 6–8", alternate over/under', 'Clamp 1 hr; machine after 24 hr', 'Titebond III needs 47°F+ to cure'], w: 'Gloves on. On cold days in an unheated North MS shop, warm the shop or wait.', fw: ['joint'], fig: function (oo) { return HB.fenceFigs.clamp(oo, H, Ls[0].L + HB.FENCE.lenAllow); } });
    s.push({ t: 'Rip the panel to box height', b: (dog ? 'Rip the glued panel to exactly ' + F(H) + ', taking the ' + F(lay.botRip) + ' of waste off the BOTTOM edge so the top strip stays full width.' : 'Rip the outer tongue off the bottom board. Then rip ' + F(lay.topRip) + ' off the top (groove) edge, so the joint sits ' + F(lay.joints[0] || 0) + ' below the top, and finish by ripping the bottom edge to exactly ' + F(H) + ' (' + F(lay.botRip) + ' off).') + ' The glue joint ends up ' + F(lay.joints[0] || 0) + ' below the top, well clear of the 5/8" frame-rest rabbet. Rip every panel for this box size at the same fence settings.', s: (dog ? [] : ['Top rip: ' + F(lay.topRip) + ' off the groove edge']).concat(['Final fence: ' + F(H) + ' from blade', 'Blade height: ' + F(t + .125), 'Joint: ' + F(lay.joints[0] || 0) + ' below the top edge']), w: SAFE.rip, fw: ['rabbet'], fig: function (oo) { return HB.fenceFigs.rip(oo, H); } });
    return s;
  }
  HB.edgeSteps = edgeSteps;

  function tag(st, keys) { st.fw = (st.fw || []).concat(keys); return st; }
  function fenceBoxSteps(comp, o, base) {
    var bo = HB.fenceBoxOpts(comp, o), H = HB.STD.height[comp], parts = HB.parts(comp, bo), out = [], lay = bo.lay;
    var walls = parts.filter(function (p) { return p.fence; }), ls = walls.map(function (p) { return { n: p.name.replace(/^\S+ /, ''), L: p.L }; });
    var cl = parts.filter(function (p) { return p.solid; }), top = bo.cleatY;
    base.forEach(function (st) {
      var T = st.t;
      if (T === 'Pick and acclimate the boards') { out = out.concat(edgeSteps(H, ls, o)); return; }
      if (T === 'Rip to box height') return; // handled by the panel rip
      if (T === 'Crosscut to final length') { st.b = 'Trim the glued panels from the ' + F(HB.FENCE.lenAllow) + '-oversize length to final: ' + ls.map(function (x) { return x.n + ' ' + F(x.L); }).join(', ') + '. Square one end first, then use a stop block so pairs come out identical. Make sure the top board (rabbet edge) is the same edge on every panel.'; return out.push(tag(st, ['knots'])); }
      if (T === 'Make the handhold cleats') {
        return out.push({ t: 'Screw solid cleats across the joints', b: 'Rip 1 1/2" cleats from SOLID ' + F(bo.solidT) + ' stock (not fence boards). Handhold cleats ' + F(cl[0].L) + ' go on the end boards, joint cleats ' + F(cl[1].L) + ' on the long sides, all centered on the glue joint with the top edge ' + F(top) + ' below the box top. Glue, then drive 1 1/4" #8 exterior screws every 4", staggered: one row into the upper board and one into the lower. That screws the edge-joined boards together so the glue joint never carries the load alone. Bevel the top edge so rain runs off.', s: ['Cleat: ' + F(bo.solidT) + ' × 1 1/2" (solid)', 'Top edge ' + F(top) + ' below box top', 'Screws: 1 1/4" #8 exterior, every 4", both boards'], w: 'Pre-drill and countersink. Check that the screw tips don\'t come through inside (' + F(bo.solidT) + ' + 5/8" = ' + F(bo.solidT + .625) + ').', fw: ['solidCleat', 'hand', 'joint'], fig: st.fig });
      }
      if (T === 'Cut the frame-rest rabbet') { st.b += ' In 5/8" stock this leaves a 1/4" lip, so keep this edge in the clean top board.'; return out.push(tag(st, ['rabbet'])); }
      if (T === 'Glue up and square') { st.b += ' Fence boxes: the outside should read ' + F(HB.geom(bo).L) + ' × ' + F(HB.geom(bo).W) + ', the inside stays standard.'; return out.push(tag(st, ['corner'])); }
      if (T === 'Nail the corners') { st.b = 'Pre-drill and drive 1 1/2" (4d) galvanized ring-shank nails through each finger, or every 2" along a rabbet. #6 × 1 1/4" exterior screws also work. A 6d nail is too long and fat for 5/8" fingers and splits them. Set the heads and fill.'; st.s = ['Fastener: 4d (1 1/2") galv. ring-shank or #6 × 1 1/4" screws', 'Pre-drill every hole']; return out.push(tag(st, ['corner', 'knots'])); }
      if (T === 'Frame rests, sand, finish') { st.b = 'Metal frame rests are REQUIRED in fence mode. Tack them into the rabbet so the frames hang on metal, not the 1/4" lip. Sand the joints flush and ease the edges. Prime and give 2 coats of exterior paint to the outside faces and all edges, and seal the end grain. Thin boards cup when one side stays wet. Leave the inside bare.'; return out.push(tag(st, ['rabbet'])); }
      if (/finger|box-joint jig|corner rabbets/i.test(T)) return out.push(tag(st, ['corner']));
      if (T === 'Butt-joint layout') return out.push(tag(st, ['butt', 'corner']));
      out.push(st);
    });
    return out;
  }

  var baseSteps = HB.steps, SOLID = { 'bottom-solid': 1, 'bottom-screened': 1, inner: 1, outer: 1, reducer: 1 };
  HB.steps = function (comp, o) {
    if (comp === 'edgejoin') {
      var fo = Object.assign({}, o, { mat: 'fence' }), g = HB.geom({ frames: fo.frames, t: HB.FENCE.t });
      return edgeSteps(HB.STD.height.deep, [{ n: 'long sides', L: g.L }, { n: 'end boards', L: g.W }], fo);
    }
    if (!HB.isFence(o)) return baseSteps(comp, o);
    if (HB.STD.height[comp]) return fenceBoxSteps(comp, o, baseSteps(comp, HB.fenceBoxOpts(comp, o)));
    var s = baseSteps(comp, o);
    if (SOLID[comp] && s.length) tag(s[0], [HB.solidWarn(comp)]);
    return s;
  };
  HB.GUIDE_LIST.push('edgejoin');
  HB.NAMES.edgejoin = 'Edge-joining fence boards';

  /* ---- Region + Specs additions (locations are fixed: Southaven and Olive Branch) ---- */
  function sec(title, body) { return '<details class="card"><summary>' + title + '</summary><div class="cb">' + body + '</div></details>'; }
  function addBefore(html, extra) { var i = html.lastIndexOf('</div>'); return html.slice(0, i) + extra + html.slice(i); }
  var baseRegion = HB.regionHtml;
  HB.regionHtml = function () {
    var h = baseRegion().replace('</h2>', '</h2><p class="meta loc"><b>Build locations:</b> ' + HB.LOCATIONS.join(' · ') + ' (both in DeSoto County)</p>');
    return addBefore(h, sec('Fence-board lumber in Southaven & Olive Branch', '<ul>' +
      '<li>Home centers and fence suppliers in Southaven and Olive Branch usually stock 5/8" × 5 1/2" × 6\' cedar dog-ear pickets. Tongue-and-groove cedar fence boards are less common, so call ahead. No store names or prices here on purpose; put your real price in the Cost tab.</li>' +
      '<li>Pick through the stack yourself: straight, flat boards with tight knots and no end splits. Buy about 10% extra.</li>' +
      '<li>Our summers are humid and pickets are often sold wet. Sticker them flat in a covered shop for 1–2 weeks before ripping and gluing, or the glue joints and corners open as the wood dries.</li>' +
      '<li>Titebond III needs about 47°F or warmer to cure, so on cold days in an unheated shop, warm it up or wait.</li>' +
      '<li>Thin 5/8" walls insulate a little less than 3/4" (practical advice, not a sourced figure). Give afternoon shade and airflow in summer, and keep colonies strong with a reducer in winter.</li></ul>'));
  };
  var baseSpecs = HB.specsHtml;
  HB.specsHtml = function () {
    var o = Object.assign({}, HB.cfg, { mat: 'fence' });
    return addBefore(baseSpecs(), HB.fenceCard(o, false) + sec('Fence-board warnings', HB.fwHtml(['dogTop', 'rabbet', 'hand', 'corner', 'knots', 'joint', 'tg', 'butt'])));
  };
})();
