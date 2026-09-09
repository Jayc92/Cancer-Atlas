#!/usr/bin/env node
// margin_reserve_check — THE GUARD THAT SHIPS BEFORE ITS POPULATION EXISTS (2026-09-09).
//
// PROPERTY: the Phase A reserved margin form (js/morphology.js RESERVED_MARGIN) must be UNREACHABLE
// from every cited margin category's parameter range (MARGIN_CATEGORIES), on the reserved axis
// (RESERVED_AXIS) and as a whole vector. Ratified rule: .claude/phaseA_mapping.md, "The
// uncharacterised-margin default", part 2 — reserve an AXIS, not a point. A midpoint on the spike
// scale is a value and reads as "intermediate margin"; an orthogonal axis is a MODE, and it is what
// makes this property checkable rather than argued.
//
// READ THIS BEFORE READING THE SELFTEST AS A GAP. Condition (7) says a check that reports zero must
// be shown capable of reporting non-zero before its zero is believed. Every other member of the
// battery earned that on real bytes, because every other member arrived after a defect or alongside
// a repair. THIS ONE SHIPS BEFORE ANYTHING IT GUARDS EXISTS: MARGIN_CATEGORIES is empty at birth by
// the ratified build order (reserved default first, cited categories next), so there is no live
// population that could contain a violation. Condition (7) is therefore satisfied against FIXTURES,
// and here fixture-only is THE CORRECT FORM, NOT THE WEAK ONE — the guard's whole purpose is that
// the population never contains a violation, so a live firing would mean the rule had already been
// broken. Do not go looking for the real demonstration; it should not exist. Recorded as CLAUDE.md
// condition (7-quater), user ruling 2026-09-09.
//
// WHAT THIS CHECK PROVES, AND WHAT IT DOES NOT (user ruling, 2026-09-09 — found by the amplitude
// correction the same day the check shipped, and recorded here before anyone reads its green as
// coverage). It proves PARAMETER DISJOINTNESS. The property that matters is PERCEPTUAL DISTINCTNESS —
// that a reader cannot mistake the reserved form for a cited one — and the first does not imply the
// second. The case: at amplitude 0.10 the reserved form was parametrically unreachable (this check
// passed it — the vector sat outside every cited box) and perceptually CIRCUMSCRIBED in the live
// capture, exactly the misread the rule exists to prevent. So: fixture-only is correct, unreachability
// is verified, and neither means the reserved form cannot be mistaken for a cited one. Only LOOKING
// establishes that, and nothing gates looking. CONSEQUENCE FOR EVERY CATEGORY WIRED: each one narrows
// the perceptual space the reserved form must stay distinct from, and only the parametric half of
// that narrowing is gated here — PTC's poorly-defined margin sits closer to an undulating form than
// seminoma's circumscribed nodule does, and this check cannot ask about PTC specifically. THE VISUAL
// READ HAPPENS PER CATEGORY WIRED — capture the reserved form beside the newly wired category and
// look — not once when all nine are in, or the first look comes after the space has closed around a
// form nobody re-checked. The procedure is written again on the MARGIN_CATEGORIES line in
// js/morphology.js, because that is the line the wirer edits and this header is the one they skip.
// THE RECORDED LOOK IS EVIDENTIARY, NOT A SENTENCE SAYING "CHECKED" (user ruling, same day): the
// capture command and commit (.claude/capture_organs.js regenerates the image), the two forms named,
// and what specifically distinguished them — checkable by opening the image. Recorded there, not here.
//
// SECONDARY ASSERTIONS, structural, on the same module: every active cancer entry carries a margin
// status from the allowed set (the renderer reads it — an entry missing here renders nothing and
// nobody would know); every organ has an origin-hotspot index that points at a hotspot whose text
// (or the organ description) speaks of origin, so a reordered hotspot list fails here instead of
// silently moving the mass.
//
// Usage: node .claude/margin_reserve_check.js          (selftest, then the live check)
//        node .claude/margin_reserve_check.js --selftest
// Exit 0 clean, 1 problems, 2 refused (selftest failed). Prints SIDECAR then DONE, DONE last.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const REPO = path.resolve(__dirname, '..');

async function loadMorphology(){
  // node parses a .js file as CommonJS unless a package.json says otherwise; the module is ESM, so
  // it is copied to a temporary .mjs — the same move syntax_check.sh makes to parse the app as ESM.
  const src = path.join(REPO, 'js', 'morphology.js');
  const tmp = path.join(os.tmpdir(), `morphology.${process.pid}.mjs`);
  fs.copyFileSync(src, tmp);
  try { return await import('file://' + tmp); } finally { fs.unlinkSync(tmp); }
}

// ---- corpus readers (text scans, the same register the other members use) ------------------
function organFiles(){
  return fs.readdirSync(path.join(REPO, 'js', 'organs')).filter(f => f.endsWith('.js') && f !== 'index.js').sort();
}
// Every hex albedo in the organ files — the cited tissue colours (and the skin block's layer colours).
// viewer.js and main.js are NOT scanned: they hold the marker accent and the light colours, which are
// interface and illumination, not tissue, and the reserved colour is derived from the marker on purpose.
// THE FOURTH PROPERTY OF A DECLARATION — A STATUS CLAIM CARRIES ITS BACKING (user, 2026-09-09). The other
// three (evidence not conclusion; reason required; closed enumerated set) govern what a declaration SAYS;
// this one governs whether it is ENTITLED to say it. A 'cited' margin status must carry a resolvable
// identifier — PMCID, PMID, NBK, DOI — either in its own ref or in the ledger record (_phaseA_citations)
// that an R-number in its ref resolves to. A harvest seed has none, so this fires at build time instead of
// at wiring time: FTC's 'cited' rested on a seed about a different entity for four build commits and
// nothing could see it. citedBackingViolations below; the ledger is read from .claude/citations.json.
//
// ONE THING THIS CHECK STILL CANNOT SEE, stated so nobody reads green as more than it is: (a) the backing
// test proves an identifier EXISTS, not that the identified source speaks of the entry's margin at GROSS
// register — that is the read's job and the register rule's (FTC's identified source was histologic); (b) two CITED
// categories whose ranges overlap or coincide are NOT a violation — by the collision rule's third arm
// (cited-versus-cited: neither moves) that is the truthful rendering of two citations describing one
// appearance, and asserting cited-vs-cited disjointness here would FORCE the invention the rule forbids.
// What IS asserted for such a pair is that its declaration is true: sameAppearanceViolations below.
function tissueAlbedos(){
  const out = new Set();
  for(const f of organFiles()){
    const s = fs.readFileSync(path.join(REPO, 'js', 'organs', f), 'utf8');
    for(const m of s.matchAll(/0x([0-9a-fA-F]{6})\b/g)) out.add(parseInt(m[1], 16));
  }
  return [...out];
}
// The Phase A ledger: _phaseA_citations in citations.json, split into its records (R-numbered reads and
// '||'-separated notes). Read from the tree, never from a summary.
function ledgerRecords(){
  const j = JSON.parse(fs.readFileSync(path.join(REPO, '.claude', 'citations.json'), 'utf8'));
  return String(j._phaseA_citations || '').split(/(?<=\.)\s(?=R\d+\s)|\s\|\|\s/);
}
const IDENTIFIER = /\b(PMC\d{5,}|PMID:?\s?\d{6,}|NBK\d{4,}|doi:?\s?10\.\d{4,}\/\S+|10\.\d{4,}\/[^\s,;)]+)/i;
// A 'cited' status is entitled to its claim only if its backing resolves: an identifier in the ref itself, or
// an R-number in the ref that resolves to a ledger record carrying one. Statuses other than 'cited' make no
// category claim and are not tested here (their refs record reads or blocks, and may carry identifiers too).
function citedBackingViolations(statuses, records){
  const out = [];
  for(const [id, st] of Object.entries(statuses)){
    if(st.status !== 'cited') continue;
    const ref = String(st.ref || '');
    if(IDENTIFIER.test(ref)) continue;
    const rs = [...ref.matchAll(/\bR(\d+)\b/g)].map(m => 'R' + m[1]);
    if(rs.length === 0){ out.push(`entry ${id} is 'cited' but its ref carries no identifier and names no ledger record — a seed, not a citation: "${ref.slice(0, 80)}"`); continue; }
    for(const r of rs){
      const rec = records.find(x => new RegExp('^' + r + '\\b').test(x.trim()));
      if(!rec) out.push(`entry ${id} is 'cited' on ${r}, which resolves to no ledger record`);
      else if(!IDENTIFIER.test(rec)) out.push(`entry ${id} is 'cited' on ${r}, whose ledger record carries no resolvable identifier`);
    }
  }
  return out;
}
function activeEntries(){
  const out = [];
  for(const f of organFiles()){
    const s = fs.readFileSync(path.join(REPO, 'js', 'organs', f), 'utf8');
    const re = /\{\s*id:'([a-z0-9_-]+)',\s*name:'(?:[^'\\]|\\.)*'[^}]*?active:(true|false)[^}]*?organKey:'([a-z]+)'/g;
    let m; while((m = re.exec(s))){ if(m[2] === 'true') out.push({ id: m[1], organKey: m[3], file: f }); }
  }
  return out;
}
function organHotspots(){
  const out = {};
  for(const f of organFiles()){
    const s = fs.readFileSync(path.join(REPO, 'js', 'organs', f), 'utf8');
    const key = (s.match(/organEntry\s*=\s*\{\s*key:'([a-z]+)'/) || [])[1];
    if(!key) continue;
    const i = s.indexOf('hotspots:');
    const seg = i >= 0 ? s.slice(i, i + 12000) : '';
    const labels = [...seg.matchAll(/label:\s*'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]).slice(0, 4);
    const texts = [...seg.matchAll(/text:\s*'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]).slice(0, 4);
    const desc = (s.match(/desc:\s*'((?:[^'\\]|\\.)*)'/) || [])[1] || '';
    out[key] = { labels, texts, desc };
  }
  return out;
}
const ORIGIN_WORDS = /\b(aris(e|es|ing)|origin(ates?|ating)?|begins?|starts?)\b/i;

// ---- the check proper ----------------------------------------------------------------------
function liveProblems(M){
  const problems = [];
  problems.push(...M.reservedViolations(M.RESERVED_MARGIN, M.MARGIN_CATEGORIES, M.RESERVED_AXIS, M.CITED_FREQ_BAND));
  for(const [name, cat] of Object.entries(M.MARGIN_CATEGORIES)) problems.push(...M.categoryRenderViolations(name, cat));
  // THE COLOUR FIELD (user ruling on the HCC deadlock, 2026-09-09): the reserved colour must be unreachable
  // from every cited tissue albedo — the colour twin of the geometry's unreachability, and not grey.
  problems.push(...M.sameAppearanceViolations(M.MARGIN_CATEGORIES));   // arm 3: declarations of one appearance must be true
  const records = ledgerRecords();
  problems.push(...citedBackingViolations(M.MARGIN_STATUS, records));   // the fourth property: a status claim carries its backing
  const albedos = tissueAlbedos().concat([M.MASS_COLOUR]);   // the cited-mass tan is a tissue-side colour too
  problems.push(...M.colourViolations(M.RESERVED_COLOUR, albedos, M.RESERVED_COLOUR_RULES));
  const entries = activeEntries();
  const ids = new Set(entries.map(e => e.id));
  for(const e of entries){
    const st = M.MARGIN_STATUS[e.id];
    if(!st) problems.push(`active entry ${e.id} (${e.file}) has no margin status — it would render nothing and nobody would know`);
    else if(!M.MARGIN_STATUSES.includes(st.status)) problems.push(`entry ${e.id} carries an unknown margin status '${st.status}'`);
    if(st && st.category && !M.MARGIN_CATEGORIES[st.category]) problems.push(`entry ${e.id} names category '${st.category}', which is not wired`);
    if(st && st.category && st.status !== 'cited') problems.push(`entry ${e.id} carries a category but its status is '${st.status}' — only a cited entry renders a category`);
  }
  for(const id of Object.keys(M.MARGIN_STATUS)) if(!ids.has(id)) problems.push(`margin status names '${id}', which is not an active entry`);
  const hs = organHotspots();
  for(const key of Object.keys(hs)){
    const idx = M.ORIGIN_HOTSPOT[key];
    if(idx === undefined) { problems.push(`organ ${key} has no origin-hotspot index`); continue; }
    const h = hs[key];
    if(!(idx >= 0 && idx < h.labels.length)) { problems.push(`organ ${key}: origin-hotspot index ${idx} is out of range (${h.labels.length} hotspots)`); continue; }
    if(!(ORIGIN_WORDS.test(h.texts[idx] || '') || ORIGIN_WORDS.test(h.desc))) problems.push(`organ ${key}: neither hotspot '${h.labels[idx]}' nor the organ description speaks of origin — the mass would be anchored to an unsupported structure`);
  }
  for(const key of Object.keys(M.ORIGIN_HOTSPOT)) if(!hs[key]) problems.push(`origin-hotspot names organ '${key}', which has no organ file`);
  const counts = { uncharacterised: 0, unread: 0, cited: 0, rendered: 0 };
  for(const e of entries){ const st = M.MARGIN_STATUS[e.id]; if(st && counts[st.status] !== undefined) counts[st.status]++; if(st && st.category && M.MARGIN_CATEGORIES[st.category]) counts.rendered++; }
  let nearest = 360;
  for(const hx of albedos){ const c = M.hexToHsl(hx); if(c.s >= M.RESERVED_COLOUR_RULES.achromaticBelow) nearest = Math.min(nearest, M.hueDistance(M.hexToHsl(M.RESERVED_COLOUR).h, c.h)); }
  const shared = Object.values(M.MARGIN_CATEGORIES).filter(c => c.sameAppearanceAs).length;
  const citedIds = entries.filter(e => M.MARGIN_STATUS[e.id] && M.MARGIN_STATUS[e.id].status === 'cited').map(e => e.id);
  const backed = citedIds.filter(id => citedBackingViolations({ [id]: M.MARGIN_STATUS[id] }, records).length === 0).length;
  return { problems, entries, counts, organs: Object.keys(hs).length, albedos: albedos.length, nearest, shared, citedTotal: citedIds.length, backed, ledger: records.length };
}

// ---- condition (7), FIXTURE FORM BY DESIGN (see the header) --------------------------------
function selftest(M){
  let ok = true;
  const arm = (name, cond, detail) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); ok = ok && !!cond; };
  const R = M.RESERVED_MARGIN, AX = M.RESERVED_AXIS, CB = M.CITED_FREQ_BAND;
  const fires = (cats, reserved) => M.reservedViolations(reserved || R, cats, AX, CB).length > 0;
  const cat = (ranges) => ({ ranges });
  // 1. a category whose box contains the reserved vector — the reserved form is REACHABLE
  arm('fires when a category box contains the reserved form',
      fires({ swallow: cat({ amplitude: [0, 1], freq: [1, 9], spikeCount: [0, 9], spikeLength: [0, 1], sharpness: [0, 20] }) }));
  // 2. a category whose freq range enters the reserved band — the reserved AXIS is touched
  arm('fires when a category range enters the reserved band',
      fires({ drift: cat({ amplitude: [0.02, 0.06], freq: [2.2, 4.0], spikeCount: [0, 0], spikeLength: [0, 0], sharpness: [0, 0] }) }));
  // 3. THE REJECTED PROPOSAL: a reserved form on the spike scale (a midpoint) — fires on the reserved form itself
  arm('fires on a reserved form placed on the spike scale (the rejected midpoint)',
      fires({}, { mode: 'reserved', amplitude: 0.1, freq: 5.0, seed: 1, spikeCount: 3, spikeLength: 0.2, sharpness: 6 }));
  // 4. a category that leaves a knob unbounded reaches everything
  arm('fires when a category leaves a knob unbounded',
      fires({ loose: cat({ amplitude: [0.02, 0.06], freq: [4, 5], spikeCount: [0, 0], spikeLength: [0, 0] }) }));
  // 5. a well-formed cited category, disjoint on the axis and excluding the vector — SILENT
  arm('silent on a disjoint, fully bounded cited category',
      !fires({ circumscribed: cat({ amplitude: [0.02, 0.06], freq: [3.5, 5.0], spikeCount: [0, 0], spikeLength: [0, 0], sharpness: [0, 0] }) }));
  // 5b. a category whose RENDER values escape its own ranges — the ranges would be decorative
  arm('fires when a category renders outside its own ranges',
      M.categoryRenderViolations('escape', { ranges: { amplitude: [0.10, 0.16], freq: [5, 7], spikeCount: [10, 14], spikeLength: [0.10, 0.18], sharpness: [4, 7] },
                                             render: { amplitude: 0.13, freq: 6, seed: 1, spikeCount: 12, spikeLength: 0.14, sharpness: 9 } }).length > 0);
  arm('silent when a category renders inside its own ranges',
      M.categoryRenderViolations('inside', { ranges: { amplitude: [0.10, 0.16], freq: [5, 7], spikeCount: [10, 14], spikeLength: [0.10, 0.18], sharpness: [4, 7] },
                                             render: { amplitude: 0.13, freq: 6, seed: 1, spikeCount: 12, spikeLength: 0.14, sharpness: 5.5 } }).length === 0);
  // 6. the live reserved form is inside its own band and carries no spikes
  arm('the live reserved form sits in the reserved band with no spikes',
      M.inRange(R.freq, AX.band) && R.spikeCount === 0);
  // 7. the status-coverage assertion fires on a fixture entry with no status
  arm('status assertion would flag an entry the table omits', !M.MARGIN_STATUS['fixture-entry-with-no-status']);
  // 8b–8d. THE COLOUR FIELD: a grey reserved colour fires (grey is inside the tissue gamut), a reserved
  // colour inside the tissue hue arc fires, and the live teal is silent against warm tissue albedos.
  const rules = M.RESERVED_COLOUR_RULES;
  arm('fires on a grey reserved colour', M.colourViolations(0x9a9a9a, [0xc17055], rules).length > 0);
  arm('fires on a reserved colour inside the tissue hue arc', M.colourViolations(0xb97c68, [0xc17055, 0x8c3a30], rules).length > 0);
  arm('silent on the live reserved colour against warm tissue albedos', M.colourViolations(M.RESERVED_COLOUR, [0xc17055, 0xd6b98f, 0xffffff], rules).length === 0);
  // 8g–8k. THE FOURTH PROPERTY: a 'cited' status on a seed fires; on an unresolvable R-number fires; on an R-number
  // whose record has no identifier fires; on an R-number whose record carries a PMCID is silent; on a ref that
  // carries its own PMCID is silent; a non-cited status with a bare ref is not tested.
  const ledgerFx = ['R1 PDAC MARGIN (PMC9139767, PMID 35626076)', 'R5 CRC MARGIN = NEGATIVE: no source gives a margin descriptor.'];
  arm('fires on a cited status backed by a harvest seed', citedBackingViolations({ x: { status: 'cited', ref: 'harvest — seeded (encapsulated), not yet rendered' } }, ledgerFx).length === 1);
  arm('fires on a cited status naming an R-number with no record', citedBackingViolations({ x: { status: 'cited', ref: 'R99 — something' } }, ledgerFx).length === 1);
  arm('fires on a cited status whose record carries no identifier', citedBackingViolations({ x: { status: 'cited', ref: 'R5 — margin' } }, ledgerFx).length === 1);
  arm('silent on a cited status resolving to an identified record', citedBackingViolations({ x: { status: 'cited', ref: 'R1 — poorly delineated' } }, ledgerFx).length === 0);
  arm('silent on a cited ref carrying its own PMCID, and not testing non-cited statuses', citedBackingViolations({ x: { status: 'cited', ref: 'harvest — (PMC6906820)' }, y: { status: 'unread', ref: 'second tier' } }, ledgerFx).length === 0);
  // 8e–8f. ARM 3: a same-appearance declaration backed by a COPY of the render fires; the live table is silent.
  const root = { label: 'root', ranges: { amplitude: [0, 1] }, render: { amplitude: 0.5 } };
  arm('fires when a same-appearance declaration is backed by a copy, not the shared object',
      M.sameAppearanceViolations({ root, twin: { label: 'twin', ranges: { amplitude: [0, 1] }, render: { amplitude: 0.5 }, sameAppearanceAs: 'root' } }).length > 0);
  arm('silent when the declaration is true by reference', M.sameAppearanceViolations({ root, twin: { label: 'twin', ranges: root.ranges, render: root.render, sameAppearanceAs: 'root' } }).length === 0);
  // 8. the origin-word test accepts the phrasing the corpus uses and rejects a bland label
  arm('origin-word test fires/passes as intended', ORIGIN_WORDS.test('adenocarcinoma most commonly arises here') && !ORIGIN_WORDS.test('a smooth capsule'));
  console.log(ok ? 'SELFTEST PASS — fixture-form by design: no live population can carry a violation while the rule holds (condition (7-quater))'
                 : 'SELFTEST FAIL');
  return ok;
}

(async () => {
  const M = await loadMorphology();
  const selfOnly = process.argv.includes('--selftest');
  if(!selftest(M)){ console.log('margin_reserve_check: REFUSING to check — selftest failed'); process.exit(2); }
  if(selfOnly){ console.log('DONE margin_reserve_check_selftest: 20 arms run, 0 failures'); return; }
  const { problems, entries, counts, organs, albedos, nearest, shared, citedTotal, backed, ledger } = liveProblems(M);
  for(const p of problems) console.log('  PROBLEM: ' + p);
  const nCat = Object.keys(M.MARGIN_CATEGORIES).length;
  console.log('SIDECAR ' + JSON.stringify({
    name: 'margin_reserve_check',
    metrics: { categories: nCat, entries: entries.length, organs, rendered_default: counts.uncharacterised + counts.unread, rendered_cited: counts.rendered, tissue_albedos: albedos, nearest_hue_deg: Math.round(nearest), same_appearance: shared, cited_backed: backed, cited_total: citedTotal, ledger_records: ledger, problems: problems.length },
    ratchet: ['categories'],
  }));
  console.log(`DONE margin_reserve_check: reserved form on the ${M.RESERVED_AXIS.knob} band [${M.RESERVED_AXIS.band}] unreachable from ${nCat} cited categories (fixture-form (7) by design), `
    + `${entries.length - problems.filter(p => /no margin status|unknown margin status/.test(p)).length}/${entries.length} active entries carry a margin status `
    + `(${counts.uncharacterised} uncharacterised, ${counts.unread} unread, ${counts.cited} cited of which ${counts.rendered} rendered inside their ranges), ${organs}/${organs} organs anchor their mass, reserved colour ${Math.round(nearest)}° of hue from the nearest of ${albedos} tissue albedos (margin ${M.RESERVED_COLOUR_RULES.hueMarginDeg}°), ${shared} cited categor${shared === 1 ? 'y' : 'ies'} declared the same appearance as a sibling under arm 3 (declarations true), ${backed}/${citedTotal} cited statuses carry a resolvable identifier against ${ledger} ledger records, ${problems.length} problems`);
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('margin_reserve_check: harness error', e); process.exit(2); });
