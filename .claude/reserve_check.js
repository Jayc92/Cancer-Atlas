#!/usr/bin/env node
// reserve_check (until 2026-09-09: reserve_check (née margin_reserve_check)) — THE GUARD THAT SHIPS BEFORE ITS POPULATION EXISTS.
//
// RENAMED WITH THE RULING THAT WIDENED ITS OBLIGATION (user, 2026-09-09): ONE RESERVED COLOUR, BOUND TO THE
// OBJECT, NOT THE AXIS. Two reserved colours would collide on a tumour uncharacterised on both margin and growth,
// and the resolution — one colour, or a blend — would be a third meaning nobody defined. So the colour means
// 'at least one property of this mass is uncharacterised' and the badge text names which: COLOUR FLAGS, TEXT
// SPECIFIES. The obligation follows the meaning: the reserved form must be unreachable from every cited category
// on EVERY axis — margin today, growth from the moment its first category is wired — which is why the file is
// no longer named for one axis. The ratchet key moved with the name (record_count.json, by hand, count unchanged,
// disclosed in the renaming commit); history in CLAUDE.md and the mapping document keeps the old name where it
// was the name at the time.
//
// GROWTH, AT BIRTH (2026-09-09): js/morphology.js RESERVED_GROWTH is the reserved growth vector — one mass, a hard
// junction, on the surface, no wall change — and GROWTH_CATEGORIES is EMPTY, by the growth design document's build
// order (.claude/phaseA_growth_design.md: the reserve check first, then infiltrative falloff). Same fixture-form
// condition (7-quater) as margin had at its birth: growthReservedViolations is proven on fixtures here and has no
// live population to fire on until the first growth category is wired.
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
// Usage: node .claude/reserve_check (née margin_reserve_check).js          (selftest, then the live check)
//        node .claude/reserve_check (née margin_reserve_check).js --selftest
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
// A resolvable identifier: PMCID, PMID, NBK, DOI — or a URL (2026-09-09: the stomach's growth citation is an NCI PDQ page
// with no other identifier; a URL resolves by definition and was re-verified live before it backed a status).
const IDENTIFIER = /\b(PMC\d{5,}|PMID:?\s?\d{6,}|NBK\d{4,}|doi:?\s?10\.\d{4,}\/\S+|10\.\d{4,}\/[^\s,;)]+)|https?:\/\/\S+/i;
// A 'cited' status is entitled to its claim only if its backing resolves: an identifier in the ref itself, or
// an R-number in the ref that resolves to a ledger record carrying one. Statuses other than 'cited' make no
// category claim and are not tested here (their refs record reads or blocks, and may carry identifiers too).
function citedBackingViolations(statuses, records){
  const out = [];
  for(const [id, st] of Object.entries(statuses)){
    if(st.status !== 'cited') continue;
    const ref = String(st.ref || '');
    // A URL is resolvable only in principle; the check does no network, so a URL identifier must carry the date it
    // was last verified live ('verified YYYY-MM-DD' or 're-verified …'), else it is a link nobody has followed.
    if(/https?:\/\//i.test(ref) && !/verified \d{4}-\d{2}-\d{2}/i.test(ref)){ out.push(`entry ${id} is 'cited' on a URL with no 'verified YYYY-MM-DD' — a link nobody has followed is not a resolved identifier`); continue; }
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

// PER-ENTRY ORIGIN OVERRIDE (2026-09-11, user-directed): checked STRICTER than the per-organ loop
// in liveProblems() — the entry's OWN hotspot text must speak of origin directly, with no fallback
// to the organ description. The organ description is generic across every entry the organ carries,
// and a generic-desc fallback is exactly what let the original contradiction (ovary's clear-cell
// mass anchored at Surface epithelium, the shared organ default, while ovary's own desc and Surface
// epithelium's own text both already said clear-cell arises elsewhere) pass the per-organ check
// silently — desc already contains an ORIGIN_WORDS hit ("ovarian cancers begin") regardless of
// which hotspot a mis-sited entry actually used. Extracted as its own function (the citedBackingViolations
// pattern) so it can be demonstrated capable of firing before its zero on the live tree is trusted.
function originHotspotEntryViolations(originHotspotEntry, hs, entries){
  const problems = [];
  for(const [entryId, idx] of Object.entries(originHotspotEntry)){
    const entry = entries.find(e => e.id === entryId);
    if(!entry){ problems.push(`origin-hotspot-entry names '${entryId}', which is not an active entry`); continue; }
    const h = hs[entry.organKey];
    if(!h){ problems.push(`origin-hotspot-entry '${entryId}' names organ '${entry.organKey}', which has no organ file`); continue; }
    if(!(idx >= 0 && idx < h.labels.length)){ problems.push(`origin-hotspot-entry '${entryId}': index ${idx} is out of range (${h.labels.length} hotspots)`); continue; }
    if(!ORIGIN_WORDS.test(h.texts[idx] || '')) problems.push(`origin-hotspot-entry '${entryId}': hotspot '${h.labels[idx]}' does not itself speak of origin — a per-entry override must not rely on the organ description`);
  }
  return problems;
}

// ---- the check proper ----------------------------------------------------------------------
function liveProblems(M){
  const problems = [];
  problems.push(...M.reservedViolations(M.RESERVED_MARGIN, M.MARGIN_CATEGORIES, M.RESERVED_AXIS, M.CITED_FREQ_BAND));
  for(const [name, cat] of Object.entries(M.MARGIN_CATEGORIES)) problems.push(...M.categoryRenderViolations(name, cat));
  // THE COLOUR FIELD (user ruling on the HCC deadlock, 2026-09-09): the reserved colour must be unreachable
  // from every cited tissue albedo — the colour twin of the geometry's unreachability, and not grey.
  problems.push(...M.sameAppearanceViolations(M.MARGIN_CATEGORIES));   // arm 3: declarations of one appearance must be true
  problems.push(...M.growthReservedViolations(M.RESERVED_GROWTH, M.GROWTH_CATEGORIES));   // growth axis: reserved vector unreachable (fixture-form at birth)
  problems.push(...M.reservedApexViolations(M.RESERVED_APEX));   // the reserved apex floor: the band cap for reserved-margin masses sits at a MEASURED extent that meets the floor
  const records = ledgerRecords();
  problems.push(...citedBackingViolations(M.MARGIN_STATUS, records));   // the fourth property: a status claim carries its backing
  problems.push(...citedBackingViolations(M.GROWTH_STATUS, records).map(p => 'growth: ' + p));   // the fourth property, growth axis
  problems.push(...citedBackingViolations(M.EXTENT_STATUS, records).map(p => 'extent: ' + p));   // the fourth property, extent axis (URL + verified date)
  problems.push(...M.growthRenderViolations(M.GROWTH_CATEGORIES));   // every wired growth category renders inside its range
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
    const gs = M.GROWTH_STATUS[e.id];
    const xs = M.EXTENT_STATUS[e.id];
    if(!xs) problems.push(`active entry ${e.id} has no extent status`);
    else if(!M.EXTENT_STATUSES.includes(xs.status)) problems.push(`entry ${e.id} carries an unknown extent status '${xs.status}'`);
    if(xs && xs.status === 'cited'){
      const sum = (xs.shares.inSitu || 0) + xs.shares.localized + xs.shares.regional + xs.shares.distant + xs.shares.unknown;   // in situ where SEER reports it (bladder)
      if(!(sum >= 98 && sum <= 102)) problems.push(`entry ${e.id} extent shares sum to ${sum}, not ~100`);
      if(!/\d{4}[–-]\d{4}/.test(xs.basis || '')) problems.push(`entry ${e.id} extent basis carries no diagnosis-year range — a share without its vintage can be re-checked but not re-verified`);
      if(!/\bspread/i.test('') && /spreads?\b/i.test(M.extentSentence(e.id, xs))) problems.push(`entry ${e.id} extent sentence says 'spread' — extent wording must stay detection-framed ('found at')`);
      // MODAL MUST BE THE ENTRY'S OWN TRUE ARGMAX (2026-09-10, user: the bladder caption was a templated claim that
      // could go stale exactly like this — a share can be corrected without anyone re-checking whether `modal` still
      // names the largest one, and `extentSentence`'s three-way framing trusts `modal` without recomputing it). This
      // is a GUARD, not a repair: every entry read clean when checked by hand (2026-09-10), so the arm has never yet
      // fired on a live defect — it exists to catch the NEXT edit that moves a share without moving `modal` with it.
      const shareEntries = Object.entries(xs.shares);
      const trueModalKey = shareEntries.reduce((best, cur) => cur[1] > best[1] ? cur : best)[0];
      const trueModal = trueModalKey === 'inSitu' ? 'in situ' : trueModalKey;
      if(xs.modal !== trueModal) problems.push(`entry ${e.id} extent modal is '${xs.modal}' but its own shares (${JSON.stringify(xs.shares)}) make '${trueModal}' the largest — the framing sentence would assert a false majority`);
      // THE OTHER TWO BRANCHES ASSERT THEIR OWN CLAUSE, NOT JUST 'MODAL IS SELF-CONSISTENT' (2026-09-10, user: the
      // guard above proves modal matches the data; it doesn't prove each branch's SENTENCE is true for its branch —
      // the same shape one level up). The in-situ branch hardcodes 'the next largest share localized'; true only for
      // today's one in-situ entry (bladder) because its own second-largest share happens to be localized. The 'other'
      // branch (regional/distant) says 'least extensive; found already beyond it', which regional and distant satisfy
      // but 'unknown' does not — unknown means undetermined, not beyond.
      if(xs.modal === 'in situ'){
        const second = shareEntries.filter(([k]) => k !== 'inSitu').reduce((best, cur) => cur[1] > best[1] ? cur : best)[0];
        if(second !== 'localized') problems.push(`entry ${e.id} modal is 'in situ' but its second-largest share is '${second}', not 'localized' — the hardcoded in-situ sentence clause 'the next largest share localized' would be false for this entry`);
      }
      if(xs.modal === 'unknown') problems.push(`entry ${e.id} modal is 'unknown' — no current framing branch can honestly render this ('most are found already beyond it' does not describe an undetermined stage); needs its own sentence before this entry ships cited`);
    }
    if(!gs) problems.push(`active entry ${e.id} has no growth status`);
    else if(!M.GROWTH_STATUSES.includes(gs.status)) problems.push(`entry ${e.id} carries an unknown growth status '${gs.status}'`);
    if(gs && gs.category && !M.GROWTH_CATEGORIES[gs.category]) problems.push(`entry ${e.id} names growth category '${gs.category}', which is not wired`);
    if(gs && gs.category && gs.status !== 'cited') problems.push(`entry ${e.id} carries a growth category but its status is '${gs.status}'`);
  }
  for(const id of Object.keys(M.MARGIN_STATUS)) if(!ids.has(id)) problems.push(`margin status names '${id}', which is not an active entry`);
  // STATUS TABLES CARRY DATES (2026-09-10, user: 'status tables get dates'; mechanism in .claude/tolerated.py). An 'unread'
  // row is a tolerated non-zero count — a read owed — and must say by when; past that date it is OVERDUE and this check is
  // red until the row is read (status changes) or re-dated with a reason on the line. An 'uncharacterised' row is a read
  // that found nothing and must say what was read (its ref), or it is indistinguishable from unread.
  const today = new Date().toISOString().slice(0, 10);
  for(const [axis, table] of [['margin', M.MARGIN_STATUS], ['growth', M.GROWTH_STATUS], ['extent', M.EXTENT_STATUS]]){
    for(const [id, row] of Object.entries(table)){
      if(row.status === 'unread'){
        if(!/^\d{4}-\d{2}-\d{2}$/.test(row.until || '')) problems.push(`${axis} status ${id} is 'unread' with no until date — a read owed with no date is a bare count`);
        else if(row.until < today) problems.push(`${axis} status ${id} is 'unread' past its until date ${row.until} — the read is overdue: read it, or re-date it with the reason on the line`);
      }
      if(row.status === 'uncharacterised' && !(row.ref && row.ref.length >= 20)) problems.push(`${axis} status ${id} is 'uncharacterised' without saying what was read`);
      if(row.status === 'cited' && row.until) problems.push(`${axis} status ${id} is 'cited' but carries an until date — a cited row owes no read`);
    }
  }
  const hs = organHotspots();
  for(const key of Object.keys(hs)){
    const idx = M.ORIGIN_HOTSPOT[key];
    if(idx === undefined) { problems.push(`organ ${key} has no origin-hotspot index`); continue; }
    const h = hs[key];
    if(!(idx >= 0 && idx < h.labels.length)) { problems.push(`organ ${key}: origin-hotspot index ${idx} is out of range (${h.labels.length} hotspots)`); continue; }
    if(!(ORIGIN_WORDS.test(h.texts[idx] || '') || ORIGIN_WORDS.test(h.desc))) problems.push(`organ ${key}: neither hotspot '${h.labels[idx]}' nor the organ description speaks of origin — the mass would be anchored to an unsupported structure`);
  }
  for(const key of Object.keys(M.ORIGIN_HOTSPOT)) if(!hs[key]) problems.push(`origin-hotspot names organ '${key}', which has no organ file`);
  problems.push(...originHotspotEntryViolations(M.ORIGIN_HOTSPOT_ENTRY, hs, entries));
  const counts = { uncharacterised: 0, unread: 0, cited: 0, rendered: 0 };
  for(const e of entries){ const st = M.MARGIN_STATUS[e.id]; if(st && counts[st.status] !== undefined) counts[st.status]++; if(st && st.category && M.MARGIN_CATEGORIES[st.category]) counts.rendered++; }
  let nearest = 360;
  for(const hx of albedos){ const c = M.hexToHsl(hx); if(c.s >= M.RESERVED_COLOUR_RULES.achromaticBelow) nearest = Math.min(nearest, M.hueDistance(M.hexToHsl(M.RESERVED_COLOUR).h, c.h)); }
  const shared = Object.values(M.MARGIN_CATEGORIES).filter(c => c.sameAppearanceAs).length;
  const growthCats = Object.keys(M.GROWTH_CATEGORIES).length;
  const growth = { cited: 0, drawn: 0, uncharacterised: 0, unread: 0 };
  for(const e of entries){ const gs = M.GROWTH_STATUS[e.id]; if(gs && growth[gs.status] !== undefined) growth[gs.status]++; if(gs && gs.category && M.GROWTH_CATEGORIES[gs.category]) growth.drawn++; }
  // RENDER COVERAGE (user, 2026-09-10): two mechanisms now push cited properties out of the render and into text — the
  // understated-extent label, and growth on a margin-reserved mass. Each was forced by a measurement and each is right;
  // the AGGREGATE is what nobody would notice. Counted per entry: a cited property is RENDERED when its category is
  // wired and drawn (growth additionally requires a cited margin, since a placeholder suppresses the dissolve), else
  // TEXT-ONLY. Reported, not ratcheted — a ratio to watch, so drift is visible if it happens.
  const coverage = { cited: 0, rendered: 0, textOnly: 0, textByDesign: 0, perEntry: [] };
  for(const e of entries){
    const ms = M.MARGIN_STATUS[e.id], gs = M.GROWTH_STATUS[e.id]; let cited = 0, rendered = 0;
    if(ms && ms.status === 'cited'){ cited++; if(ms.category && M.MARGIN_CATEGORIES[ms.category]) rendered++; }
    if(gs && gs.status === 'cited'){ cited++; if(gs.category && M.GROWTH_CATEGORIES[gs.category] && ms && ms.status === 'cited') rendered++; }
    const xs2 = M.EXTENT_STATUS[e.id]; if(xs2 && xs2.status === 'cited') coverage.textByDesign++;   // extent: text by ruling (a distribution cannot be one drawn state)
    coverage.cited += cited; coverage.rendered += rendered; coverage.textOnly += cited - rendered;
    coverage.perEntry.push(`${e.id}:${rendered}/${cited}`);
  }
  console.log('  render coverage (rendered/cited per entry): ' + coverage.perEntry.join(' '));
  const citedIds = entries.filter(e => M.MARGIN_STATUS[e.id] && M.MARGIN_STATUS[e.id].status === 'cited').map(e => e.id);
  const backed = citedIds.filter(id => citedBackingViolations({ [id]: M.MARGIN_STATUS[id] }, records).length === 0).length;
  return { problems, entries, counts, organs: Object.keys(hs).length, albedos: albedos.length, nearest, shared, citedTotal: citedIds.length, backed, ledger: records.length, growthCats, growth, coverage };
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
  arm('fires on a cited status backed by a URL with no verification date', citedBackingViolations({ x: { status: 'cited', ref: 'https://example.org/page — not followed' } }, ledgerFx).length === 1);
  arm('silent on a cited status backed by a URL with a verification date', citedBackingViolations({ x: { status: 'cited', ref: 'https://example.org/page — verified 2026-09-10' } }, ledgerFx).length === 0);
  arm('silent on a cited ref carrying its own PMCID, and not testing non-cited statuses', citedBackingViolations({ x: { status: 'cited', ref: 'harvest — (PMC6906820)' }, y: { status: 'unread', ref: 'second tier' } }, ledgerFx).length === 0);
  // 8r–8s. GROWTH RENDER: a category rendering outside its range fires; the live table is silent.
  arm('growth: fires when a category renders outside its range', M.growthRenderViolations({ fx: { knob: 'falloff', range: [0.6, 1.4], render: { extent: 2.0 } } }).length > 0);
  arm('growth: silent on the live categories', M.growthRenderViolations(M.GROWTH_CATEGORIES).length === 0);
  // 8o–8q. THE RESERVED APEX FLOOR: a cap with no fixture measurement fires; a cap whose measurement is below the
  // floor fires; the live declaration is silent.
  arm('apex: fires when a nonzero cap has no measurement', M.reservedApexViolations({ floor: 0.3, measured: [[1.0, { defaultPose: 0.34 }]], capForReservedMargin: 2.5, minOrgansForACap: 2 }).length > 0);
  arm('apex: fires when a nonzero cap is backed only by a default-pose number', M.reservedApexViolations({ floor: 0.3, measured: [[1.0, { defaultPose: 0.34 }]], capForReservedMargin: 1.0, minOrgansForACap: 2 }).length > 0);
  arm('apex: fires when the sweep minimum on any organ is below the floor', M.reservedApexViolations({ floor: 0.3, measured: [[1.0, { sweepMin: { lungs: 0.20, kidneys: 0.03 } }]], capForReservedMargin: 1.0, minOrgansForACap: 2 }).length > 0);
  arm('apex: fires when the sweep covers too few organs', M.reservedApexViolations({ floor: 0.3, measured: [[0.5, { sweepMin: { lungs: 0.31 } }]], capForReservedMargin: 0.5, minOrgansForACap: 2 }).length > 0);
  arm('apex: silent when a nonzero cap is backed by a two-organ sweep at or above the floor', M.reservedApexViolations({ floor: 0.3, measured: [[0.5, { sweepMin: { lungs: 0.31, kidneys: 0.30 } }]], capForReservedMargin: 0.5, minOrgansForACap: 2 }).length === 0);
  arm('apex: silent on the live declaration (cap 0: no dissolve on a placeholder)', M.reservedApexViolations(M.RESERVED_APEX).length === 0);
  // 8l–8n. GROWTH RESERVE: a cited growth category whose range reaches the reserved value on its knob fires; one
  // that starts above it is silent; a category on an unknown knob fires (the knob set is closed).
  arm('growth: fires when a cited count range reaches the reserved count of 1', M.growthReservedViolations(M.RESERVED_GROWTH, { fx: { label: 'fx', knob: 'count', range: [1, 3] } }).length > 0);
  arm('growth: silent when a cited count range starts above the reserved count', M.growthReservedViolations(M.RESERVED_GROWTH, { fx: { label: 'fx', knob: 'count', range: [2, 4] } }).length === 0);
  arm('growth: fires on a knob the reserved vector does not carry', M.growthReservedViolations(M.RESERVED_GROWTH, { fx: { label: 'fx', knob: 'glow', range: [1, 2] } }).length > 0);
  // 8e–8f. ARM 3: a same-appearance declaration backed by a COPY of the render fires; the live table is silent.
  const root = { label: 'root', ranges: { amplitude: [0, 1] }, render: { amplitude: 0.5 } };
  arm('fires when a same-appearance declaration is backed by a copy, not the shared object',
      M.sameAppearanceViolations({ root, twin: { label: 'twin', ranges: { amplitude: [0, 1] }, render: { amplitude: 0.5 }, sameAppearanceAs: 'root' } }).length > 0);
  arm('silent when the declaration is true by reference', M.sameAppearanceViolations({ root, twin: { label: 'twin', ranges: root.ranges, render: root.render, sameAppearanceAs: 'root' } }).length === 0);
  // 8. the origin-word test accepts the phrasing the corpus uses and rejects a bland label
  arm('origin-word test fires/passes as intended', ORIGIN_WORDS.test('adenocarcinoma most commonly arises here') && !ORIGIN_WORDS.test('a smooth capsule'));
  // 9a–9e. PER-ENTRY ORIGIN OVERRIDE (2026-09-11): fixtures first, proving the check can fire
  // before its zero on the live tree is trusted (condition (7)) — the exact bug shape this exists
  // to catch is arm 9c, where the hotspot text itself is bland and only the organ description
  // (not passed to this function at all) speaks of origin.
  const fxHs = { ovary: { labels: ['Surface epithelium', 'Cortex'], texts: ['Most ovarian cancers arise here.', 'Packed with follicles.'], desc: 'Not modelled.' } };
  const fxEntries = [{ id: 'clear', organKey: 'ovary' }];
  arm('fires on an entry id that names no active entry', originHotspotEntryViolations({ ghost: 0 }, fxHs, fxEntries).length > 0);
  arm('fires on an out-of-range index', originHotspotEntryViolations({ clear: 9 }, fxHs, fxEntries).length > 0);
  arm('fires when the entry\'s own hotspot text is bland, even though the organ description is not', originHotspotEntryViolations({ clear: 1 }, fxHs, fxEntries).length > 0);
  arm('silent when the entry\'s own hotspot text speaks of origin directly', originHotspotEntryViolations({ clear: 0 }, fxHs, fxEntries).length === 0);
  arm('silent on the live ORIGIN_HOTSPOT_ENTRY against the live corpus', originHotspotEntryViolations(M.ORIGIN_HOTSPOT_ENTRY, organHotspots(), activeEntries()).length === 0);
  console.log(ok ? 'SELFTEST PASS — fixture-form by design: no live population can carry a violation while the rule holds (condition (7-quater))'
                 : 'SELFTEST FAIL');
  return ok;
}

(async () => {
  const M = await loadMorphology();
  const selfOnly = process.argv.includes('--selftest');
  if(!selftest(M)){ console.log('reserve_check (née margin_reserve_check): REFUSING to check — selftest failed'); process.exit(2); }
  if(selfOnly){ console.log('DONE reserve_check_selftest: 33 arms run, 0 failures'); return; }
  const { problems, entries, counts, organs, albedos, nearest, shared, citedTotal, backed, ledger, growthCats, growth, coverage } = liveProblems(M);
  for(const p of problems) console.log('  PROBLEM: ' + p);
  const nCat = Object.keys(M.MARGIN_CATEGORIES).length;
  console.log('SIDECAR ' + JSON.stringify({
    name: 'reserve_check',
    metrics: { categories: nCat, entries: entries.length, organs, rendered_default: counts.uncharacterised + counts.unread, rendered_cited: counts.rendered, tissue_albedos: albedos, nearest_hue_deg: Math.round(nearest), same_appearance: shared, cited_backed: backed, cited_total: citedTotal, ledger_records: ledger, growth_categories: growthCats, growth_cited: growth.cited, growth_drawn: growth.drawn, render_cited: coverage.cited, render_rendered: coverage.rendered, render_text_only: coverage.textOnly, render_text_by_design: coverage.textByDesign, problems: problems.length },
    ratchet: ['categories', 'growth_categories'],
  }));
  console.log(`DONE reserve_check: reserved form on the ${M.RESERVED_AXIS.knob} band [${M.RESERVED_AXIS.band}] unreachable from ${nCat} cited categories (fixture-form (7) by design), `
    + `${entries.length - problems.filter(p => /no margin status|unknown margin status/.test(p)).length}/${entries.length} active entries carry a margin status `
    + `(${counts.uncharacterised} uncharacterised, ${counts.unread} unread, ${counts.cited} cited of which ${counts.rendered} rendered inside their ranges), ${organs}/${organs} organs anchor their mass, reserved colour ${Math.round(nearest)}° of hue from the nearest of ${albedos} tissue albedos (margin ${M.RESERVED_COLOUR_RULES.hueMarginDeg}°), ${shared} cited categor${shared === 1 ? 'y' : 'ies'} declared the same appearance as a sibling under arm 3 (declarations true), ${backed}/${citedTotal} cited statuses carry a resolvable identifier against ${ledger} ledger records, reserved growth vector unreachable from ${growthCats} cited growth categor${growthCats === 1 ? 'y' : 'ies'} (growth census: ${growth.cited} cited of which ${growth.drawn} drawn, ${growth.uncharacterised} uncharacterised, ${growth.unread} unread), reserved-margin dissolve cap ${M.RESERVED_APEX.capForReservedMargin} (${M.RESERVED_APEX.capForReservedMargin === 0 ? 'no dissolve on a placeholder; floor ' + M.RESERVED_APEX.floor + ' holds by construction' : 'sweep-backed against the ' + M.RESERVED_APEX.floor + ' floor'}), render coverage ${coverage.rendered}/${coverage.cited} cited margin/growth properties rendered (${coverage.textOnly} text-only pending a mechanism) plus ${coverage.textByDesign} cited extent distributions text by design, ${problems.length} problems`);
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('reserve_check (née margin_reserve_check): harness error', e); process.exit(2); });
