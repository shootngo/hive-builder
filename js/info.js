/* Frank's Hive Builder — Region (north MS) + Specs/Reference content. Every fact links to its source. */
(function () {
  'use strict';
  var HB = window.HB;
  var SRC = {
    begin: ['MSU Ext. Pub. 3594 Beginning Beekeeping in Mississippi', 'https://extension.msstate.edu/publications/beginning-beekeeping-mississippi'],
    cal: ['MSU Ext. Pub. 4053 Mississippi Beekeeping Calendar', 'https://extension.msstate.edu/publications/mississippi-beekeeping-calendar'],
    season: ['MSU Ext. Pub. 2941 Colony Growth & Seasonal Management', 'https://extension.msstate.edu/publications/colony-growth-and-seasonal-management-honey-bees'],
    honey: ['MSU Ext. Pub. 3382 Maximizing Honey Production', 'https://extension.msstate.edu/publications/maximizing-honey-production'],
    site: ['MSU Ext. Pub. 2937 Choosing an Apiary Location', 'https://extension.msstate.edu/publications/choosing-apiary-location'],
    shb: ['MSU Ext. Pub. 2825 Small Hive Beetle', 'https://extension.msstate.edu/publications/small-hive-beetle'],
    shbms: ['SHB Management in Mississippi (MS Beekeepers Assn. / MSU pamphlet)', 'https://bee-health.extension.org/wp-content/uploads/2019/08/SHB-Mgt-in-MS_2012_Sheridan-Fulton-Zawislak-1.pdf'],
    varroa: ['MSU Ext. Pub. 2826 Managing Varroa Mites', 'https://extension.msstate.edu/publications/managing-varroa-mites-honey-bee-colonies'],
    minor: ['MSU Ext. Pub. 3195 Minor Pests of Honey Bees in MS', 'https://extension.msstate.edu/publications/minor-pests-honey-bees-mississippi'],
    tamu: ['Texas A&M AgriLife ENTO-021 Fire Ant Management for Beekeepers', 'https://research.entomology.tamu.edu/wp-content/uploads/sites/28/2014/03/ENTO_021.pdf'],
    mdac: ['MDAC Bureau of Plant Industry — Honey Bee Program', 'https://www.mdac.ms.gov/bureaus-departments/bpi/honey-bee-program/'],
    regs: ['MS Bee Disease Regulations (2 Miss. Code R. 1-3-06)', 'https://agnet.mdac.ms.gov/agManage/uploads/1636.pdf'],
    mba: ['Mississippi Beekeepers Association', 'https://mshoneybee.org/'],
    hbhc: ['Honey Bee Health Coalition — Varroa Management Guide', 'https://honeybeehealthcoalition.org/resources/varroa-management/'],
    usda: ['USDA Plant Hardiness Zone Map (enter ZIP 38671)', 'https://planthardiness.ars.usda.gov/'],
    mfc: ['Mississippi Forestry Commission — Forest Industry Directory', 'https://www.mfc.ms.gov/timber-industry/forest-industry-directory/'],
    fpl: ['USDA Forest Products Lab — Wood Handbook ch. 14 (decay resistance)', 'https://www.fpl.fs.usda.gov/documnts/fplgtr/fplgtr190/chapter_14.pdf'],
    bs: ['Beesource 10-Frame Langstroth plans (3/4" lumber)', 'https://sierrabeekeepers.com/images/beeplans/10-Frame%20Langstroth%20Hive%20Plans.pdf'],
    dadant: ['Dadant — 10-frame deep supers (sizes & prices)', 'https://www.dadant.com/catalog/hives/10-frame/hive-bodies-supers-10-frame/deep-10-frame'],
    dum10: ['Dummies — 10-frame cut list (box & rabbet joints)', 'https://www.dummies.com/article/home-auto-hobbies/hobby-farming/beekeeping/cut-list-for-the-ten-frame-langstroth-hive-170399/'],
    dumfr: ['Dummies — Langstroth frame cut list', 'https://www.dummies.com/article/cut-list-for-langstroth-frames-170336'],
    ch8: ['Carolina Honeybees — Langstroth dimensions (8-frame)', 'https://carolinahoneybees.com/langstroth-hive-dimensions-ins-and-outs/'],
    red: ['Carolina Honeybees — entrance reducers', 'https://carolinahoneybees.com/entrance-reducers-beehives/']
  };
  function s() { return ' <span class="src">' + Array.prototype.map.call(arguments, function (k) { var x = SRC[k]; return '<a href="' + x[1] + '" target="_blank" rel="noopener">' + x[0] + '</a>'; }).join(' · ') + '</span>'; }
  function sec(title, body, open) { return '<details class="card"' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="cb">' + body + '</div></details>'; }

  HB.regionHtml = function () {
    return '<div class="pad"><h2>North Mississippi care</h2><p class="meta">Southaven, DeSoto County. USDA\'s 2023 map lists ZIP 38671 as zone 8a (you had 7b/8a — check it yourself).' + s('usda') + '</p>' +
      sec('Your site: Debbie Lane, past the canal by the coop', '<ul>' +
        '<li><b>Flooding / water\'s edge:</b> MSU says to make sure the apiary ground is not prone to flooding and to avoid close proximity to drainage ditches and creeks. Put the stands on the highest, driest spot across the canal and keep them well back from the bank.' + s('site') + '</li>' +
        '<li><b>Chickens:</b> MSU warns never to keep bees near penned animals that cannot escape attacking bees. Hens shut in a coop or run count. Keep the hives a good distance from the coop and pointed away from it, and ideally put a fence or hedge between them so the bees fly up and over.' + s('site') + '</li>' +
        '<li><b>Facing:</b> entrances ideally face south to east, with a tree line, building or shed on the north side as a winter windbreak. Don\'t set hives in the woods (understory spots invite hive beetles and ants).' + s('site') + '</li>' +
        '<li><b>Spacing:</b> for 4–5 colonies in a row, leave a few feet between hives and alternate which way the entrances face to cut down on drifting.' + s('site') + '</li></ul>', true) +
      sec('Water: give bees their own, away from the coop', '<p>MSU says to have a water source year-round, and warns that once foragers fix on a water source it can be almost impossible to move them off it. Set up a dedicated bee waterer near the hives early in the season (shallow, with stones or floats to land on), and keep it on the hive side of the canal, well away from the chicken waterers. That keeps bees from crowding the hens\' water and keeps chicken mess out of the bees\' water. (The last part is practical advice; the fixation fact is MSU\'s.)' + s('site') + '</p>') +
      sec('Local timing: flows, swarms, dearth', '<ul>' +
        '<li><b>Main flow (north MS):</b> end of March through early June, driven by <b>Chinese privet and white clover</b>.' + s('cal') + ' Privet blooms about May 1–15 in north MS; white clover about Mar 10–Jun 30.' + s('honey') + '</li>' +
        '<li><b>May nectar plants (north):</b> rattanvine, privet, tulip poplar, white clover. <b>June:</b> blue vervain, sumac, sourwood, cotton, white clover, peppervine.' + s('season') + '</li>' +
        '<li><b>Chinese tallow</b> is a big source from <i>Jackson southward</i> and isn\'t a main flow for DeSoto County (north MS bloom is about Jun 1–20 where it does grow).' + s('cal', 'honey') + '</li>' +
        '<li><b>Swarms:</b> most swarming in MS is in April–May. Check colonies weekly then. Swarm prevention (reversing brood boxes) starts about mid-March in north MS, and swarm cells can show up by late Feb or early March in some years.' + s('season') + '</li>' +
        '<li><b>Summer dearth:</b> mid-June to the end of August has little forage in most of north MS. Keep inspections short then to avoid robbing.' + s('cal') + '</li>' +
        '<li><b>New colonies:</b> order nucs in the first two weeks of January. Install them roughly from early April to early May.' + s('cal', 'begin') + '</li></ul>') +
      sec('Summer heat & humidity: shade, ventilation', '<ul>' +
        '<li>MSU calls sun versus shade in the South "debatable". Full sun slows small hive beetles and mites, but in our humid summers evaporative cooling is harder, bees beard outside, and they\'re more exposed to mosquito-spray drift at night. Afternoon shade from a tree line is a common compromise.' + s('site', 'shbms') + '</li>' +
        '<li>Screened bottom boards give more airflow, and MSU says Mississippi beekeepers use them year-round without winter changes. Solid floors make bees work harder to cool the hive.' + s('begin') + '</li>' +
        '<li>Put entrance reducers on solid-floor hives only after it cools down. On screened floors they can go on in August.' + s('cal') + '</li></ul>') +
      sec('Small hive beetle (a big one in humid MS)', '<ul>' +
        '<li>Trap during peak beetle season, about <b>April through September</b> in Mississippi. Populations peak in July–August.' + s('shb', 'cal') + '</li>' +
        '<li>Trap types: screened-bottom oil trays (the hive must be level), entrance traps, in-hive reservoir traps between frames, and top traps under the cover. Killing agents: vegetable or mineral oil, diatomaceous earth, soapy water, propylene glycol.' + s('shb', 'shbms') + '</li>' +
        '<li>Keep colonies strong, don\'t give them more boxes than they can patrol, and combine weak colonies. A slimed hive smells like rotten oranges.' + s('minor', 'cal') + '</li>' +
        '<li>Never use fipronil roach baits in or near hives. MSU names a permethrin ground drench as the safest soil treatment for larvae that have left the hive to pupate.' + s('minor') + '</li></ul>') +
      sec('Varroa: monitor and treat on time', '<ul>' +
        '<li>Sample in <b>February</b> (treat if more than 1 mite per 100 bees) and again right after the honey harvest, <b>no later than mid-July</b>. The growing-season threshold is <b>3 mites per 100 bees</b>.' + s('cal') + '</li>' +
        '<li>Get treatments finished before <b>winter bees are raised in September–October</b>. Some strips need about 45 days in the hive, and none can be in during honey production.' + s('cal', 'season') + '</li>' +
        '<li>MS summers are often too hot for formic acid, and some thymol products can\'t be used above 90°F. Oxalic acid works best when the hive is broodless (late fall or winter, or after a queen-caging brood break).' + s('cal') + '</li>' +
        '<li>For first-year colonies, MSU advises an amitraz strip (e.g., Apivar) for 40+ days starting early to mid July. Always follow the label.' + s('begin') + '</li>' +
        '<li>Also see the Honey Bee Health Coalition guide that MSU recommends.' + s('hbhc', 'varroa') + '</li></ul>') +
      sec('Fall feeding & winter prep', '<ul>' +
        '<li>Aim for <b>65–70 lb of stored honey</b> per colony starting at the end of October, with the heaviest combs centered over the cluster.' + s('cal') + '</li>' +
        '<li>If they\'re short, feed heavy syrup (2:1, 16–17 lb sugar per gallon of water) and finish by the end of October. In cold snaps, switch to fondant or dry sugar.' + s('season') + '</li>' +
        '<li>Take off empty boxes after the fall flow. Use entrance reducers or 6-mesh mouse guards. Check queens and requeen any older than 2 years.' + s('cal', 'minor', 'season') + '</li></ul>') +
      sec('Fire ants under the stand', '<ul>' +
        '<li>Red imported fire ants can invade hives and eat brood. Check the site before the hives go in, don\'t leave dead brood or debris lying around, and keep insecticides off the bees (apply late evening or early morning).' + s('tamu') + '</li>' +
        '<li>Barrier ideas: sticky barriers, or stand feet set in shallow containers of oil (MSU, written for ants generally), and keep grass and weeds from touching the stand.' + s('minor', 'tamu') + '</li>' +
        '<li>Stands taller than 18" also keep skunks off the bees.' + s('minor') + '</li></ul>') +
      sec('Registration (MDAC / Bureau of Plant Industry)', '<ul>' +
        '<li>Apiaries <i>may</i> be registered with MDAC\'s Bureau of Plant Industry. MSU notes registration is <b>not required for noncommercial beekeepers</b>, but registered apiaries can get annual inspections. You register by requesting the application from BPI and filing it, and registration doesn\'t expire until you cancel it in writing.' + s('site', 'regs') + '</li>' +
        '<li>BPI Honey Bee Program: P.O. Box 5207, Mississippi State, MS 39762 · (662) 325-8488. Migratory beekeepers, queen breeders and package producers need inspection certificates to ship bees or used equipment.' + s('mdac') + '</li>' +
        '<li>Meet local beekeepers through the Mississippi Beekeepers Association.' + s('mba') + '</li></ul>') +
      '</div>';
  };

  HB.specsHtml = function () {
    var f = HB.f, S = HB.STD;
    function row(a, b, c) { return '<tr><td>' + a + '</td><td>' + b + '</td><td>' + (c || '') + '</td></tr>'; }
    var g10 = HB.geom({ frames: 10, t: .75 }), g8 = HB.geom({ frames: 8, t: .75 });
    return '<div class="pad"><h2>Specs &amp; reference</h2>' +
      sec('Corrections vs. your outline', '<ol class="fix">' +
        '<li><b>Box footprint:</b> the outline\'s 19 7/8" × 19 7/8" outside / 18 × 18 inside is wrong. The verified 10-frame box is <b>19 7/8" × 16 1/4" outside, 18 3/8" × 14 3/4" inside</b>; 8-frame is <b>19 7/8" × 14"</b> outside (some makers use 13 3/4").' + s('bs', 'begin', 'ch8') + '</li>' +
        '<li><b>Frame-rest rabbet:</b> it\'s <b>5/8" down × 3/8" into the board</b>, not 3/8" × 3/8".' + s('bs', 'dum10') + '</li>' +
        '<li><b>Box heights:</b> deep 9 5/8", medium 6 5/8" (both correct), shallow 5 11/16".' + s('dadant') + '</li>' +
        '<li><b>Stock thickness:</b> the published plans and standard commercial boxes use <b>3/4"</b>, and Beesource says don\'t go below 3/4". 7/8" works as a heavier option, but the app keeps the <i>inside</i> at standard size so frames still fit, which makes the outside 1/4" bigger (20 1/8" × 16 1/2"). Build the whole stack to match.' + s('bs') + '</li>' +
        '<li><b>Joints:</b> box (finger) joints or rabbet joints are standard. Pocket holes aren\'t typical for hive bodies.' + s('bs', 'dum10') + '</li>' +
        '<li><b>Entrance:</b> the reversible bottom board gives <b>3/4"</b> (summer) or <b>3/8"</b> (winter).' + s('bs') + '</li>' +
        '<li><b>Lumber:</b> you only need 1x12 for deeps. Mediums and shallows come from 1x8. (1x6 is only 5 1/2" wide, too narrow for a 5 11/16" shallow.) Rough-sawn boards need drying plus jointing/planing to 3/4" first.' + s('bs') + '</li>' +
        '<li><b>Board feet:</b> one 2-deep + 2-medium hive with bottom, covers and reducer works out to about <b>25–30 bd ft</b> of 1x stock with waste in the Cut List, not 80–100.</li>' +
        '<li><b>Frames:</b> top bar 19", end bars 9 1/8" (deep), 6 1/4" (medium), 5 3/8" (shallow), 1 3/8" wide tapering to about 1 1/8" (the 1" in some plans is also within bee space).' + s('dumfr') + '</li>' +
        '<li><b>Bee space:</b> 1/4–3/8" (6–10 mm).' + s('begin') + '</li>' +
        '<li><b>Tallow:</b> Chinese tallow is a major flow from Jackson south, not in DeSoto County. Your main flow is privet + white clover.' + s('cal') + '</li>' +
        '<li><b>Registration:</b> optional for hobbyists in MS, not mandatory.' + s('site') + '</li></ol>', true) +
      sec('Standard dimensions', '<table class="tbl"><tr><th>Item</th><th>Size</th><th></th></tr>' +
        row('10-frame box outside', f(g10.L) + ' × ' + f(g10.W)) + row('10-frame inside', f(g10.inL) + ' × ' + f(g10.inW)) +
        row('8-frame box outside', f(g8.L) + ' × ' + f(g8.W)) + row('8-frame inside', f(g8.inL) + ' × ' + f(g8.inW)) +
        row('Deep / medium / shallow', f(S.height.deep) + ' / ' + f(S.height.medium) + ' / ' + f(S.height.shallow)) +
        row('Frame-rest rabbet', f(S.rabbet.down) + ' down × ' + f(S.rabbet.into) + ' in') +
        row('Frame top bar', f(19) + ' × 1 1/16" × 3/4"') + row('End bar deep/med/shallow', f(9.125) + ' / ' + f(6.25) + ' / ' + f(5.375)) +
        row('Bottom board', '22" × box width × 1 7/8"', '3/4" / 3/8" entrance') + row('Inner cover', 'box size × 5/8", 1 1/4"×3 1/2" hole') +
        row('Telescoping cover (10-fr)', '21 3/4" × 18 1/8" × 2 1/4"', 'inside 20 1/4" × 16 5/8"') + row('Entrance reducer (10-fr)', '3/4" × 3/4" × 14 3/4"', 'notches 3 1/2" & 3/4"') +
        '</table>' + s('bs', 'dadant', 'dumfr', 'red')) +
      sec('Joint methods', '<ul><li><b>Box joint</b>: strongest, standard on commercial boxes. 3/4" fingers, glue + one 6d galvanized nail per finger.</li><li><b>Rabbet joint</b>: simpler. Rabbet the end boards ' + f(.75) + ' × 3/8" and cut the long sides to 19 1/8".</li><li><b>Butt joint</b>: weakest. Glue + screws.</li></ul>' + s('bs', 'dum10')) +
      sec('Finishing & hardware', '<ul><li>Prime + 2 coats exterior paint, <b>outside only</b>. Interiors don\'t need paint. Paint all surfaces of the bottom board.' + s('begin') + '</li><li>Waterproof glue, 6d galvanized nails, optional metal frame rests, galvanized/aluminum sheet on the telescoping cover.' + s('bs') + '</li><li>Pressure-treated wood is for the stand legs only, never for parts bees live in.</li></ul>') +
      sec('Stand & placement', '<ul><li>Stand 18–24" tall: over 18" deters skunks.' + s('minor') + '</li><li>Face entrances south to east, keep off flood-prone ground, don\'t set up in woods.' + s('site') + '</li></ul>') +
      sec('Wood, durability & local lumber', '<ul><li>USDA Forest Products Lab: heartwood of <b>old-growth baldcypress</b>, eastern redcedar and western redcedar is resistant to very resistant to decay. <b>Second-growth cypress is only moderately resistant</b>, and sapwood of any species has little resistance, so buy mostly heartwood and still paint or seal the outside.' + s('fpl') + '</li>' +
        '<li><b>Finding cypress near you:</b> baldcypress is native to Mississippi, and small sawmills sell it rough-sawn by the board foot. Check the Mississippi Forestry Commission\'s Forest Industry Directory for mills within driving distance, and call around about kiln-dried versus air-dried stock and whether they plane to 3/4". No business names or prices here on purpose; prices vary, so put your real price in the Cost tab.' + s('mfc') + '</li>' +
        '<li>Durability (estimate, not a sourced figure): painted pine boxes commonly last many years. Cedar/cypress heartwood should outlast pine, especially on a well-drained stand.</li></ul>') +
      sec('Costs: build vs. buy', '<p>Dadant listed unassembled 10-frame commercial deeps at about $12.95–$20.95 and select grade at $20.95–$26.95 (checked Oct 2026; prices change). Building pays off when you have cheap local cypress or cedar and shop time. The Cost tab totals your own job.' + s('dadant') + '</p>') +
      sec('Timeline (shop estimate)', '<ul><li>Box-joint jig setup and test cuts: ~1–2 hrs, once.</li><li>Per hive (2 deeps + 2 mediums, bottom, covers) after setup: roughly a long shop day of cutting and assembly, plus paint drying (primer + 2 coats).</li><li>5 hives batched: cut all of one part at a time; plan 2–3 weekends plus paint time. These are estimates only.</li></ul>') +
      '</div>';
  };
})();
