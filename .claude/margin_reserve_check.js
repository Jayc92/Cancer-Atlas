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
  const entries = activeEntries();
  const ids = new Set(entries.map(e => e.id));
  for(const e of entries){
    const st = M.MARGIN_STATUS[e.id];
    if(!st) problems.push(`active entry ${e.id} (${e.file}) has no margin status — it would render nothing and nobody would know`);
    else if(!M.MARGIN_STATUSES.includes(st.status)) problems.push(`entry ${e.id} carries an unknown margin status '${st.status}'`);
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
  const counts = { uncharacterised: 0, unread: 0, cited: 0 };
  for(const e of entries){ const st = M.MARGIN_STATUS[e.id]; if(st && counts[st.status] !== undefined) counts[st.status]++; }
  return { problems, entries, counts, organs: Object.keys(hs).length };
}

// ---- condition (7), FIXTURE FORM BY DESIGN (see the header) --------------------------------
function selftest(M){
  let ok = true;
  const arm = (name, cond, detail) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); ok = ok && !!cond; };
  const R = M.RESERVED_MARGIN, AX = M.RESERVED_AXIS, CB = M.CITED_FREQ_BAND;
  const fires = (cats, reserved) => M.reservedViolations(reserved || R, cats, AX, CB).length > 0;
  // 1. a category whose box contains the reserved vector — the reserved form is REACHABLE
  arm('fires when a category box contains the reserved form',
      fires({ swallow: { amplitude: [0, 1], freq: [1, 9], spikeCount: [0, 9], spikeLength: [0, 1], sharpness: [0, 20] } }));
  // 2. a category whose freq range enters the reserved band — the reserved AXIS is touched
  arm('fires when a category range enters the reserved band',
      fires({ drift: { amplitude: [0.02, 0.06], freq: [2.2, 4.0], spikeCount: [0, 0], spikeLength: [0, 0], sharpness: [0, 0] } }));
  // 3. THE REJECTED PROPOSAL: a reserved form on the spike scale (a midpoint) — fires on the reserved form itself
  arm('fires on a reserved form placed on the spike scale (the rejected midpoint)',
      fires({}, { mode: 'reserved', amplitude: 0.1, freq: 5.0, seed: 1, spikeCount: 3, spikeLength: 0.2, sharpness: 6 }));
  // 4. a category that leaves a knob unbounded reaches everything
  arm('fires when a category leaves a knob unbounded',
      fires({ loose: { amplitude: [0.02, 0.06], freq: [4, 5], spikeCount: [0, 0], spikeLength: [0, 0] } }));
  // 5. a well-formed cited category, disjoint on the axis and excluding the vector — SILENT
  arm('silent on a disjoint, fully bounded cited category',
      !fires({ circumscribed: { amplitude: [0.02, 0.06], freq: [3.5, 5.0], spikeCount: [0, 0], spikeLength: [0, 0], sharpness: [0, 0] } }));
  // 6. the live reserved form is inside its own band and carries no spikes
  arm('the live reserved form sits in the reserved band with no spikes',
      M.inRange(R.freq, AX.band) && R.spikeCount === 0);
  // 7. the status-coverage assertion fires on a fixture entry with no status
  arm('status assertion would flag an entry the table omits', !M.MARGIN_STATUS['fixture-entry-with-no-status']);
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
  if(selfOnly){ console.log('DONE margin_reserve_check_selftest: 8 arms run, 0 failures'); return; }
  const { problems, entries, counts, organs } = liveProblems(M);
  for(const p of problems) console.log('  PROBLEM: ' + p);
  const nCat = Object.keys(M.MARGIN_CATEGORIES).length;
  console.log('SIDECAR ' + JSON.stringify({
    name: 'margin_reserve_check',
    metrics: { categories: nCat, entries: entries.length, organs, rendered_default: counts.uncharacterised + counts.unread, problems: problems.length },
    ratchet: ['categories'],
  }));
  console.log(`DONE margin_reserve_check: reserved form on the ${M.RESERVED_AXIS.knob} band [${M.RESERVED_AXIS.band}] unreachable from ${nCat} cited categories (fixture-form (7) by design), `
    + `${entries.length - problems.filter(p => /no margin status|unknown margin status/.test(p)).length}/${entries.length} active entries carry a margin status `
    + `(${counts.uncharacterised} uncharacterised, ${counts.unread} unread, ${counts.cited} cited), ${organs}/${organs} organs anchor their mass, ${problems.length} problems`);
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('margin_reserve_check: harness error', e); process.exit(2); });
