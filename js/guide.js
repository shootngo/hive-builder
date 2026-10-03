/* Frank's Hive Builder — step-by-step build guides */
(function () {
  'use strict';
  var HB = window.HB, C = HB.COL, F = function (x) { return HB.f(x); };

  /* Table-saw cross-section sketch: board on table, blade height, fence distance */
  function saw(o) {
    return HB.view(o.title || 'Saw setup (end view)', 8, 4, function (c, fs) {
      c.line(-1, 3, 9, 3, '#aaa', c.sw * 1.5);
      var fx = o.fenceLeft ? 0.6 : 7.4; c.rect(o.fenceLeft ? 0 : 7.4, 1.2, 0.6, 1.8, '#556', '#aab');
      var bx = o.fenceLeft ? 0.6 + o.fence : 7.4 - o.fence;
      var bw = o.dado || 0.125;
      c.rect(o.fenceLeft ? bx : bx - bw, 3 - o.blade, bw, o.blade, '#d33', '#f66');
      if (o.boardW) {
        var th = o.boardT || 0.75;
        if (o.onEdge) c.rect(o.fenceLeft ? 0.6 : 7.4 - th, 3 - o.boardW, th, o.boardW, 'rgba(201,141,58,.55)', C.edge);
        else c.rect(o.fenceLeft ? 0.6 : 7.4 - o.boardW, 3 - th, o.boardW, th, 'rgba(201,141,58,.55)', C.edge);
      }
      c.dv(3 - o.blade, 3, o.fenceLeft ? bx + bw + fs * 1.2 : bx - bw - fs * 1.2, 'blade ' + F(o.blade), o.fenceLeft ? bx + bw : bx - bw);
      c.dh(o.fenceLeft ? 0.6 : bx, o.fenceLeft ? bx : 7.4, 3 + fs * 1.4, 'fence ' + F(o.fence), 3);
      c.text(o.fenceLeft ? 0.3 : 7.7, 1, 'fence', { k: .7, c: 'nt' });
    }, { fs: .42, pt: 1.2, pb: 1.2, pl: .6, pr: .6 });
  }
  function jig(o) {
    return HB.view('Box-joint jig (front view)', 8, 3.5, function (c, fs) {
      c.line(-1, 3, 9, 3, '#aaa', c.sw * 1.5); c.rect(1, 0.6, 6.5, 2.4, '#334', '#889');
      c.rect(3.5, 3 - o.blade, .75, o.blade, '#d33', '#f66'); c.rect(4.25 + .75, 3 - .75, .75, .75, '#e8c27a', '#fff');
      c.dh(4.25, 5, 1.1, '3/4" gap'); c.dh(5, 5.75, 3 + fs * 1.4, '3/4" key', 3); c.dv(3 - o.blade, 3, 3.5 - fs * .9, F(o.blade), 3.5);
    }, { fs: .4, pt: 1, pb: 1.2, pl: .5, pr: .5 });
  }
  function square() {
    return HB.view('Check square: diagonals equal', 10, 8, function (c, fs) {
      c.rect(0, 0, 10, 8, C.wood2); c.rect(.75, .75, 8.5, 6.5, '#151515');
      c.line(0, 0, 10, 8, C.dim, c.sw * 1.4, true); c.line(10, 0, 0, 8, C.dim, c.sw * 1.4, true);
      c.text(5, 3.6, 'A = B', { k: 1.2 }); c.text(2, 2.6, 'A', {}); c.text(8, 2.6, 'B', {});
    }, { fs: .9 });
  }
  function stack() {
    var L = [['Telescoping cover', 2.25, C.metal], ['Inner cover', .625, C.ply], ['Medium super', 6.625, C.wood], ['Medium super', 6.625, C.wood], ['(Queen excluder, optional)', .3, '#999'], ['Deep (upper brood)', 9.625, C.wood2], ['Deep (lower brood)', 9.625, C.wood2], ['Bottom board', 1.875, C.ply], ['Stand 18–24"', 18, '#4f6b3a']];
    var tot = L.reduce(function (s, x) { return s + x[1]; }, 0);
    return HB.view('Full stack — bottom to top', 20, tot, function (c, fs) {
      var y = 0;
      L.forEach(function (x) { var w = x[0].indexOf('cover') > 0 && x[0][0] === 'T' ? 21.5 : 19.875; c.rect((20 - w) / 2, y, w, x[1], x[2], '#111'); c.text(10, y + x[1] / 2 + fs * .35, x[0], { k: x[1] < 1.5 ? .7 : 1, c: 'lb' }); y += x[1]; });
      c.dv(0, tot, -fs * 1.2, '≈' + Math.round(tot) + '"', 0);
    }, { fs: 2.2 });
  }
  function dg(comp, i) { return function (o) { var v = HB.diagram(comp, o); return v[Math.min(i, v.length - 1)]; }; }

  var SAFE = { rip: 'Riving knife/splitter on, push stick for the last 12", stand out of the kickback line. Eye + hearing protection.',
    cross: 'Use a miter gauge or crosscut sled with a stop block — never the rip fence as a length stop for crosscuts (kickback).',
    dado: 'Dado stack needs a zero-clearance insert; the riving knife comes off, so use featherboards and push blocks. Never cut a dado freehand.',
    dust: 'Western red cedar dust is a known respiratory irritant/sensitizer — wear a dust mask or respirator; run dust collection.',
    nail: 'Pre-drill near ends to avoid splitting cypress/cedar. Keep fingers clear of the nailer nose.' };

  function boxSteps(comp, o) {
    var t = +o.t || .75, H = HB.STD.height[comp], g = HB.geom(o), j = o.joint || 'box', d = Math.round(t / 2 * 16) / 16;
    var longL = j === 'rabbet' ? g.L - 2 * (t - d) : g.L, endL = j === 'butt' ? g.W - 2 * t : g.W;
    var s = [
      { t: 'Pick and acclimate the boards', b: 'Choose straight, flat ' + (H > 7.25 ? '1x12' : '1x8') + ' stock (' + F(t) + ' thick). Mostly heartwood for cedar/cypress. Let it sit in the shop a few days. Put the crown (cup) facing OUT on every wall so it pulls tight against the corners.', s: ['Stock: ' + F(t) + ' thick', 'Rip width needed: ' + F(H)], w: SAFE.dust, fig: dg(comp, 1) },
      { t: 'Rip to box height', b: 'Rip all walls to exactly ' + F(H) + '. Rip every wall for this box size at one fence setting so the corners line up.', s: ['Fence: ' + F(H) + ' from blade', 'Blade height: ' + F(t + .125) + ' (about 1/8" above the stock)'], w: SAFE.rip, fig: function () { return saw({ title: 'Rip to height', blade: t + .125, fence: H, boardW: H, boardT: t, onEdge: false, fenceLeft: false }); } },
      { t: 'Crosscut to final length', b: 'Long sides ' + F(longL) + ', end boards ' + F(endL) + '. Square one end first, then use a stop block so pairs come out identical.', s: ['Stop block: ' + F(longL) + ' (long sides)', 'Stop block: ' + F(endL) + ' (end boards)'], w: SAFE.cross, fig: dg(comp, 2) }
    ];
    if (j === 'box') {
      s.push({ t: 'Set up the box-joint jig', b: 'Install a 3/4" dado stack. Fasten a 3/4"-wide key to the jig fence exactly 3/4" from the dado. Test on scrap until the joint slides together with hand pressure.', s: ['Dado width: 3/4"', 'Blade height: ' + F(t + 1 / 32) + ' (stock + 1/32", sand flush later)', 'Key: 3/4" wide, 3/4" from blade'], w: SAFE.dado, fig: function () { return jig({ blade: t + 1 / 32 }); } });
      s.push({ t: 'Cut fingers — long sides', b: 'Long sides START WITH A FINGER at the bottom edge: bottom edge against the key, cut, hop the slot over the key, repeat to the top. Do both ends of both long sides. Mark the bottom edge of every board first.', s: ['First cut: bottom edge against key', 'Pattern from bottom: finger, slot, finger …'], w: SAFE.dado, fig: dg(comp, 2) });
      s.push({ t: 'Cut fingers — end boards', b: 'End boards START WITH A SLOT at the bottom edge: put a cut long side\'s first slot over the key as a 3/4" spacer, butt the end board against it, cut, then continue normally. The top finger of each end board ends up 1 3/8" tall on 9 5/8" and 6 5/8" boxes (it carries the frame rest).', s: ['First cut: use a long side as 3/4" spacer', 'Pattern from bottom: slot, finger, slot …'], w: SAFE.dado, fig: dg(comp, 1) });
      s.push({ t: 'Trim the long sides\' top finger', b: 'On each long side the top finger (5/8" tall on deeps/mediums) gets trimmed to 3/8" long, so it fills only the outside half of the corner and leaves room for the frame-rest rabbet.', s: ['Trim to 3/8" long', 'Bandsaw or handsaw + chisel'], w: 'Clamp the board; keep both hands behind the cut line.', fig: dg(comp, 3) });
    } else if (j === 'rabbet') {
      s.push({ t: 'Cut corner rabbets on end boards', b: 'Cut a rabbet across both ends of each end board, ' + F(t) + ' wide × ' + F(d) + ' deep, on the inside face. The long sides sit in these rabbets.', s: ['Dado width: ' + F(t) + ' (or stack + sacrificial fence)', 'Blade height: ' + F(d), 'Fence (sacrificial) exposes: ' + F(t)], w: SAFE.dado, fig: function () { return saw({ title: 'Corner rabbet', blade: d, fence: t, dado: t, boardW: 3, boardT: t, fenceLeft: true }); } });
    } else {
      s.push({ t: 'Butt-joint layout', b: 'End boards fit between the long sides. Butt joints are the weakest option — glue plus 2" exterior screws (pre-drilled) every 2". Pocket screws are not standard for hive bodies; box joints or rabbets are.', s: ['End boards ' + F(endL)], w: SAFE.nail, fig: dg(comp, 0) });
    }
    s.push({ t: 'Cut the frame-rest rabbet', b: 'On the INSIDE top edge of both end boards, cut a rabbet 5/8" down × 3/8" deep (into the board). With box joints, stop just short of the end fingers and chisel square after assembly (Beesource method).', s: ['Dado stack: ≥5/8" wide, buried in a sacrificial fence exposing 5/8"', 'Blade height: 3/8"', 'Two-pass option: pass 1 flat, blade 3/8", fence 5/8" to far side of blade; pass 2 on edge, blade 5/8", fence ' + F(t - .375) + ' to near side'], w: SAFE.dado, fig: function () { return saw({ title: 'Frame-rest rabbet (flat pass)', blade: .375, fence: .625, dado: .625, boardW: 3, boardT: t, fenceLeft: true }); } });
    s.push(o.handhold === 'routed'
      ? { t: 'Rout the handholds', b: 'Rout or dado a handhold centered on each wall about 2" below the top edge. Typical commercial handholds are roughly 4–5" wide × 1" tall; depth about half the stock (≈' + F(t / 2) + '). These numbers are approximate shop practice, not a published standard.', s: ['Depth ≈ ' + F(t / 2), 'Width ≈ 4 1/2", height ≈ 1"'], w: 'Clamp the work; take shallow passes with the router.', fig: dg(comp, 1) }
      : { t: 'Make the handhold cleats', b: 'Cut 1 1/2" × ' + F(g.W) + ' cleats (the 1 1/2" offcut from ripping 1x12 to 9 5/8" is perfect). Glue and screw one to each end board, top edge about 2 1/2" below the box top. Bevel the top edge so rain runs off.', s: ['Cleat: ' + F(t) + ' × 1 1/2" × ' + F(g.W)], w: SAFE.rip, fig: dg(comp, 1) });
    s.push({ t: 'Glue up and square', b: 'Dry-fit first. Glue the joints with waterproof glue (Titebond III), clamp, and measure both diagonals — they must match within 1/16". Set the box on a flat surface so it doesn\'t rack.', s: ['Diagonals equal ±1/16"', 'Inside should read ' + F(g.inL) + ' × ' + F(g.inW)], w: 'Wipe squeeze-out before it skins.', fig: square });
    s.push({ t: 'Nail the corners', b: 'Pre-drill and drive a 6d galvanized nail through each finger (Beesource plan) — or two per rabbet joint every 2". Set the heads; fill holes.', s: ['Fastener: 6d galvanized nails', 'Pre-drill ~1/16" near ends'], w: SAFE.nail, fig: dg(comp, 1) });
    s.push({ t: 'Frame rests, sand, finish', b: 'Optional metal frame rests tack into the rabbet. Sand the joints flush, ease edges. Prime + 2 coats of exterior paint on the OUTSIDE only — MSU Extension says interiors don\'t need paint; bees coat them with propolis. Cedar/cypress can be painted or sealed outside.', s: ['Primer + 2 topcoats, outside surfaces + top/bottom edges'], w: 'Never use pressure-treated or preservative-treated wood for parts the bees live in.', fig: dg(comp, 3) });
    return s;
  }

  var STEPS = {
    'bottom-solid': function (o) { var g = HB.geom(o); return [
      { t: 'Cut the rails', b: 'Rip two rails 1 7/8" × 22" from ' + F(g.t) + ' stock.', s: ['Fence: 1 7/8"', 'Crosscut stop: 22"'], w: SAFE.rip, fig: dg('bottom-solid', 1) },
      { t: 'Groove the rails', b: 'Cut a groove sized to your plywood (3/4" ext. ply is often 23/32") × 3/8" deep, with its lower edge 3/8" above the bottom of the rail. That leaves a 3/4" entrance above the floor and 3/8" below — flip the board for summer/winter.', s: ['Dado width: plywood thickness', 'Blade height: 3/8"', 'Fence: 3/8" to near side of dado'], w: SAFE.dado, fig: function () { return saw({ title: 'Floor groove', blade: .375, fence: .375, dado: .72, boardW: 1.875, boardT: g.t, onEdge: true, fenceLeft: true }); } },
      { t: 'Cut floor and cleats', b: 'Floor ' + F(g.W - 2 * g.t + .75) + ' × 22" from 3/4" exterior plywood. Back cleats ' + F(g.W - 2 * g.t) + ' long: one 3/4" tall, one 3/8" tall.', s: ['Floor width: ' + F(g.W - 2 * g.t + .75)], w: SAFE.rip, fig: dg('bottom-solid', 0) },
      { t: 'Assemble', b: 'Slide floor into grooves with glue, nail through rails. Glue + nail the 3/4" cleat on top at the back and the 3/8" cleat underneath. Check that the outside width equals ' + F(g.W) + '.', s: ['Outside: 22" × ' + F(g.W)], w: SAFE.nail, fig: dg('bottom-solid', 0) },
      { t: 'Finish', b: 'Paint all surfaces of the bottom board — MSU Extension notes it sits close to ground moisture. Wedge the back up a little in use so rain drains out the entrance.', s: ['Paint every surface'], w: 'Let paint cure fully before bees go on.', fig: dg('bottom-solid', 1) }]; },
    'bottom-screened': function (o) { var g = HB.geom(o), iw = g.W - 2 * g.t; return [
      { t: 'Cut rails and slot', b: 'Rip rails 2 1/2" × 22". Cut a 1/4" × 1/4" groove 2" down from the top edge for the sticky/mite board.', s: ['Rip fence: 2 1/2"', 'Groove: 1/4" wide, 1/4" deep, 2" from top'], w: SAFE.dado, fig: dg('bottom-screened', 1) },
      { t: 'Ledges and back cleat', b: 'Glue and nail 3/4" × 3/4" ledge strips (' + F(22 - g.t) + ') inside each rail with their top 3/4" below the rail top. Cut the back cleat ' + F(iw) + ' long.', s: ['Ledge top: 3/4" below rail top'], w: SAFE.nail, fig: dg('bottom-screened', 1) },
      { t: 'Screen and assemble', b: 'Join rails with the back cleat. Staple #8 (1/8") galvanized hardware cloth onto the ledges every 2", tucked under the back cleat. The open front above the screen is the 3/4" entrance.', s: ['Screen: ' + F(iw) + ' × ' + F(22 - g.t)], w: 'Wear gloves — cut hardware cloth edges are sharp.', fig: dg('bottom-screened', 0) },
      { t: 'Mite / beetle board', b: 'Cut 1/4" ply or coroplast to slide in the grooves from the back. Use it as a sticky board for varroa counts or with an oil tray for small hive beetles (hive must be level for oil trays — MSU/MBA guidance).', s: ['Board: ' + F(iw + .375) + ' × 21 1/2"'], w: 'Keep oil trays level so oil doesn\'t spill on bees.', fig: dg('bottom-screened', 1) }]; },
    inner: function (o) { var g = HB.geom(o); return [
      { t: 'Rip rim stock', b: 'Rip 5/8"-tall strips from 3/4" stock (rim is 3/4" wide × 5/8" tall).', s: ['Fence: 5/8"'], w: SAFE.rip, fig: dg('inner', 1) },
      { t: 'Rabbet the rims', b: 'Cut a 3/8" wide × 1/4" deep rabbet on the top inside edge of the rim strips for the 1/4" plywood panel.', s: ['Dado/blade height: 1/4"', 'Fence exposes: 3/8"'], w: SAFE.dado, fig: function () { return saw({ title: 'Rim rabbet', blade: .25, fence: .375, dado: .375, boardW: .75, boardT: .625, fenceLeft: true }); } },
      { t: 'Cut panel and hole', b: 'Panel ' + F(g.W - .75) + ' × ' + F(g.L - .75) + ' from 1/4" exterior plywood. Center a 1 1/4" × 3 1/2" slot: drill two 1 1/4" holes 2 1/4" apart and jigsaw between.', s: ['Hole saw / Forstner: 1 1/4"'], w: 'Clamp the panel; let the bit do the work.', fig: dg('inner', 0) },
      { t: 'Assemble', b: 'Long rims ' + F(g.L) + ', short rims ' + F(g.W - 1.5) + ' butted between. Glue + brad-nail the panel into the rabbets. The bee-space side faces down.', s: ['Outside: ' + F(g.L) + ' × ' + F(g.W)], w: SAFE.nail, fig: dg('inner', 1) }]; },
    outer: function (o) { var g = HB.geom(o), oL = g.L + .375 + 2 * g.t, oW = g.W + .375 + 2 * g.t; return [
      { t: 'Cut rims', b: 'Rip 1 1/2" rim stock. Long rims ' + F(oL) + ', short rims ' + F(g.W + .375) + '.', s: ['Fence: 1 1/2"'], w: SAFE.rip, fig: dg('outer', 1) },
      { t: 'Cut the lid', b: 'Lid ' + F(oW) + ' × ' + F(oL) + ' from 3/4" exterior plywood.', s: ['Sheet layout: see Cut List'], w: 'Support the full sheet; use a track saw or helper on the table saw.', fig: dg('outer', 0) },
      { t: 'Assemble rims + lid', b: 'Glue + nail the short rims between the long ones, check square, then glue + nail the lid on top. Inside must be ' + F(g.L + .375) + ' × ' + F(g.W + .375) + ' so it telescopes over the box.', s: ['Inside: ' + F(g.L + .375) + ' × ' + F(g.W + .375)], w: SAFE.nail, fig: square },
      { t: 'Metal top', b: 'Cut galvanized or aluminum sheet ' + F(oW + 2) + ' × ' + F(oL + 2) + ', fold 1" down each side (snip the corners), and nail along the rim. Paint the wood first.', s: ['Sheet: ' + F(oW + 2) + ' × ' + F(oL + 2)], w: 'Wear gloves; deburr cut metal edges.', fig: dg('outer', 1) }]; },
    reducer: function (o) { var g = HB.geom(o); return [
      { t: 'Cut the block', b: 'Rip and crosscut a 3/4" × 3/4" block ' + F(g.W - 2 * g.t) + ' long.', s: ['Rip fence: 3/4"'], w: 'Ripping narrow strips: use a push stick, keep the strip on the outside of the blade.', fig: dg('reducer', 0) },
      { t: 'Cut the notches', b: 'One face: 3/8" deep × 3 1/2" wide, centered. Adjacent face: 3/8" deep × 3/4" wide near one end. Nibble with the dado stack using the miter gauge.', s: ['Blade height: 3/8"'], w: SAFE.dado, fig: dg('reducer', 0) }]; },
    stand: function (o) { var g = HB.geom(o), sh = +o.standH || 18; return [
      { t: 'Cut stand parts', b: 'Long 2x4 rails 22", cross rails ' + F(g.W - 3) + ', 4x4 legs ' + F(sh - 3.5) + ' (ground-contact treated). Total height ' + F(sh) + '.', s: ['Height: 18–24" (MSU: >18" deters skunks)'], w: 'Treated-wood sawdust: mask + gloves; don\'t burn scraps.', fig: dg('stand', 0) },
      { t: 'Assemble and level', b: 'Screw the frame with 3" exterior screws, then legs inside the corners. Set on pavers, level side to side, slight tilt forward. A full 2-deep + 2-medium hive can top 150 lb — build it stout.', s: ['Level side-to-side'], w: 'Lift with a helper.', fig: dg('stand', 0) },
      { t: 'Ant barrier', b: 'Keep weeds from touching the stand so ants can\'t bridge it. MSU Extension suggests a sticky barrier or setting stand feet in shallow containers of oil to stop ants; Texas A&M lists barrier treatments on stand legs for fire ants (keep pesticides off bees).', s: ['Oil cups under each leg'], w: 'Never apply insecticide where bees contact it.', fig: dg('stand', 0) }]; },
    stack: function () { return [
      { t: 'Assembly order of the full stack', b: 'Bottom to top: stand → bottom board → deep (brood) → deep (brood) → optional queen excluder → medium supers → inner cover → telescoping cover. MSU Extension: deeps are usually the brood chamber; supers go on as the colony fills ~2/3 of the box below.', s: ['10-frame and 8-frame parts do not mix'], w: 'A full deep can weigh over 70 lb (MSU Extension).', fig: stack }]; }
  };
  ['deep', 'medium', 'shallow'].forEach(function (k) { STEPS[k] = function (o) { return boxSteps(k, o); }; });
  ['frame-deep', 'frame-medium', 'frame-shallow'].forEach(function (k) {
    STEPS[k] = function (o) { var kk = k.slice(6), h = HB.STD.frame.end[kk]; return [
      { t: 'Frames: buy or build?', b: 'Frames are cheap and fiddly; most builders buy them (Dadant, Mann Lake, etc.) and build the boxes. If you build, use clear straight-grained pine.', s: ['Top bar 19" × 1 1/16" × 3/4"', 'End bars ' + F(h) + ' × 1 3/8" × 3/8"', 'Bottom bar 17 3/4" × 3/4" × 3/8"'], w: 'Small parts: use a sled and hold-downs, never fingers near the blade.', fig: dg(k, 0) },
      { t: 'End-bar taper and notches', b: 'Taper the lower part of each end bar from 1 3/8" to about 1 1/8" (some plans 1"). Notch the top for the top bar and the bottom for the bottom bar. Drill pin holes if using wired wax.', s: ['Taper: 1 3/8" → 1 1/8"'], w: 'Gang-cut with a jig; small parts fly.', fig: dg(k, 1) },
      { t: 'Assemble', b: 'Glue + 1 1/4" nails top bar to end bars, 1" nails bottom bar. Check square. Install foundation.', s: ['Nails: 1 1/4" top, 1" bottom (cement-coated frame nails)'], w: SAFE.nail, fig: dg(k, 0) }]; };
  });
  HB.steps = function (comp, o) { return STEPS[comp] ? STEPS[comp](o) : []; };
  HB.GUIDE_LIST = ['deep', 'medium', 'shallow', 'bottom-solid', 'bottom-screened', 'inner', 'outer', 'reducer', 'stand', 'frame-deep', 'frame-medium', 'frame-shallow', 'stack'];
  HB.NAMES.stack = 'Full stack assembly order';
})();
