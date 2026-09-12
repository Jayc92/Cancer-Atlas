// trials_mapping_check.mjs (2026-09-11, revised 2026-09-11 twice) — reusable verification for
// TRIALS_CONDITION_MAP entries.
// NON_INSTRUMENT: evidence for whether a mapping needs rewriting, not a gate — runtime content
// stays outside the battery by the architecture phaseB_design.md §1 already settled, and this
// tool makes live network calls, which a battery member never does. Run by hand when building or
// auditing a mapping; not part of any commit gate.
//
// THE QUERY/PARENT-TOTAL RATIO IS RETIRED (user-directed, 2026-09-11), NOT DELETED — recorded
// here as a failed instrument so the reasoning survives rather than needing to be re-derived: it
// was meant to catch an over-narrow mapping (a query pulling in too FEW studies relative to its
// organ), but a calibration case broke it outright. HGSOC — ovary's DOMINANT subtype at ~70% of
// incidence, and the one already validated as a clean 8/8 mapping — measured a 6.87% trial ratio,
// WORSE than clear-cell's 3.00% (a genuinely rare subtype at ~10%). The likely mechanism: a
// dominant subtype's own trials often register under the generic parent-organ condition name
// rather than the specific subtype term the query matches on, while a distinct rare subtype's
// trials are more likely to name it specifically — a registration-naming confound with no
// principled way to net out, since it moves the ratio in a direction that mimics the very defect
// the signal exists to catch. The ratio is still printed below (RETIRED, informational only) so a
// mapping's history stays visible; nothing downstream may read it as a verdict.
//
// ITS ATTEMPTED REPLACEMENT ALSO FAILED, MEASURED RATHER THAN ASSUMED (2026-09-11, same day) — run
// the entry's OWN filterByCondition against the FULL, EXHAUSTIVELY-PAGINATED parent-organ corpus,
// comparing kept-from-parent against kept-from-narrow. The idea: if the parent set contains
// genuinely on-topic studies the narrow query never fetched, that should measure over-narrowness
// without the naming-convention confound. IT DOES NOT, and the reason is structural, not a bug in
// this tool: `conditionKeywords` is deliberately ORGAN-LEVEL (design doc §1b — "organ-based
// keywords, not histology-name matching", so a wrong-organ study never slips past on a shared
// histology word). Applying an organ-level filter to an organ-level parent query mostly just
// re-discovers how big the organ's own trial pool is — a study "about kidney cancer" almost always
// mentions "kidney"/"renal" regardless of which RCC subtype it studies. Checked directly rather
// than assumed: `gap` (parentKept − narrowKept) tracks the RETIRED ratio almost exactly —
// gap ≈ parentKept × (1 − ratio) held to within ~1 of the measured value on every one of the 16
// live entries (clear: predicted 884.6, measured 883; the same held across the full run). This is
// the same confound wearing different arithmetic, not an independent signal, and it is RETIRED for
// the identical reason the ratio was: it would score HGSOC-scale dominant-subtype mappings as
// "worse" than genuinely narrow ones, for a reason that has nothing to do with query quality.
//
// THE ALGEBRAIC ROOT OF BOTH RETIREMENTS, STATED PLAINLY (user, 2026-09-11) — worth carrying
// forward because it also explains why the replacement below is shaped the way it is: THE FILTER
// CANNOT AUDIT THE KEYWORD LIST, BECAUSE THE FILTER *IS* THE KEYWORD LIST. Both retired signals ran
// `filterByCondition(_, entry.conditionKeywords)` against a population and compared the result to
// another run of THE SAME FUNCTION WITH THE SAME KEYWORDS against a different population. An
// over-narrow keyword list makes the query AND the filter miss the same studies, so any measurement
// built from both inherits the identical blind spot — comparing them can only ever report that they
// agree with themselves. No amount of re-deriving the ratio or the gap escapes this; the defect is
// in what is being COMPARED, not in the arithmetic.
//
// THE WORKING REPLACEMENT — THE CORPUS'S OWN VOCABULARY, NOT THE AUTHOR'S KEYWORDS (user-directed,
// 2026-09-11). "No working over-narrow signal exists" was one step too strong: no signal DERIVED
// FROM THE ENTRY'S OWN KEYWORD LIST can work, for the algebraic reason above, but a signal drawn
// from a population the keyword list never touched can. `corpusVocabularySignal()` below enumerates
// every DISTINCT condition string across the entry's full parent-organ corpus (a population the
// keyword list has no hand in generating — it comes straight from the registry), then reports every
// one the entry's CURRENT filter REJECTS that still contains one of the entry's own distinguishing
// name-tokens (drawn from `query`, the entry's own disease-name string, minus a small disclosed
// stopword list of organ-agnostic cancer vocabulary — see NAME_STOPWORDS). This is the project's own
// "read the drops before trusting the count" discipline moved up one level: instead of reading every
// dropped study in a 10-result NARROW-query sample (which can only ever show what the narrow query
// already fetched), this reads every rejected DISTINCT CONDITION STRING in the full PARENT corpus —
// so it can see terms the narrow query never returned in the first place. The seminoma catch
// (js/trials.js's own note: a bare "Seminoma" tag, dropped because the keyword list omitted the
// disease's own name, found by reading drops before this signal existed) is the worked example this
// signal would have surfaced mechanically, on the parent population, before a human had to notice it
// in a 10-result sample by hand.
//
// A hit is NOT a verdict — it is a candidate worth a human read, the same status a drop-count flag
// has always had. A condition string can share a word with an entry's disease name for reasons that
// aren't a mapping defect (a different disease that happens to use the same adjective; a token that
// is specific-sounding but still broader than intended). Report every hit; fix nothing here.
//
// THE ONE SIGNAL THAT SURVIVES FROM THE OLDER PAIR: THE DROP COUNT (still live, per-fetch, in
// js/trials.js itself — design doc §1d) catches a mapping that is too BROAD, from the entry's own
// narrow-query sample. Between it and the corpus-vocabulary signal, both directions (too broad, too
// narrow) now have a live, non-self-referential check.
//
// Usage: node .claude/trials_mapping_check.mjs [entryId ...]   (defaults to every declared entry)
// Needs each entry to carry a `parent` field (the broad organ-term query) alongside `query` and
// `conditionKeywords` — added to TRIALS_CONDITION_MAP for exactly this tool.
//
// THIS FILE ITSELF CARRIED THE SAME OMISSION IT WAS BUILT TO CATCH (found 2026-09-13, fixing
// item 1 below): all three of its own filterByCondition calls passed only entry.conditionKeywords,
// never entry.requireAlso — so every signal above was computed WITHOUT the requireAlso gate for
// pneuro/pductal/psignet/pmuc, the whole time. That is the opposite-direction defect from the one
// that shipped in production (over-KEEPING here vs. over-DROPPING there), and the two compounded:
// this tool would have reported a falsely reassuring high kept-count for exactly the entries whose
// real, requireAlso-gated production code was silently returning zero — plausibly how the design
// doc's own wrong "10/10 kept" record for pneuro was arrived at and went unnoticed until the app
// was driven live in a browser. Fixed at all three call sites in main(); corpusVocabularySignal
// deliberately still omits it, with its own comment explaining why (requireAlso's same-string
// contract doesn't survive that function's single-condition decomposition).
//
// TWO ADDITIONS (2026-09-13, user ruling, "positive control for requireAlso, plus zero-trial
// reporting"): requireAlsoPositiveControl() validates the KEYWORD itself — does entry.requireAlso,
// run through the real imported stemRegex, match anything at all in its own parent corpus? — fully
// decoupled from whatever the entry's current kept-count happens to be, which is exactly the
// distinction the shipped bug erased (a broken term and a genuinely trial-less rare cancer produce
// the identical zero downstream). Demonstrated capable of failing before being trusted to pass: the
// pre-fix regex construction (\\bprostat\\b, reconstructed by hand against real fetched condition
// strings) matches 0 of 3 real "Prostate Cancer"-shaped strings where the fixed stemRegex matches
// all 3 — condition (7), run against real corpus text, not a synthetic fixture. DECLARED_ZERO below
// is the census half: every entry currently at zero kept trials is printed either DECLARED (read,
// dated, with a stated reason) or UNDECLARED (a finding requiring a read before the next commit
// trusts it) — a human makes the rarity-vs-broken-query call once per entry and the declaration
// carries that call forward, matching this project's own tolerated.py convention applied to runtime
// content for the first time.

const STATUS = 'RECRUITING%7CNOT_YET_RECRUITING%7CENROLLING_BY_INVITATION';
const FIELDS_SAMPLE = 'NCTId,BriefTitle,Condition';   // the over-broad signal's own 10-study sample, unchanged
const FIELDS_EXHAUSTIVE = 'NCTId,Condition';          // the exhaustive full-corpus pull — no title needed at scale
const MAX_PAGE = 1000;   // confirmed live 2026-09-11: the v2 API silently caps pageSize at 1000 (1001 also returns 1000)

function studyUrl(cond, pageSize) {
  return `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(cond)}`
    + `&filter.overallStatus=${STATUS}&fields=${FIELDS_SAMPLE}&sort=LastUpdatePostDate:desc&pageSize=${pageSize}&countTotal=true`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// Exhaustive pull for one query: pages via nextPageToken until exhausted. Returns {studies,
// totalCount} where studies.length === totalCount when the loop completes normally (asserted by
// the caller, not silently trusted) — a partial result from a mid-loop failure must never be
// mistaken for the whole corpus.
async function fetchAllConditions(cond) {
  let studies = [];
  let totalCount = null;
  let pageToken = null;
  do {
    const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(cond)}`
      + `&filter.overallStatus=${STATUS}&fields=${FIELDS_EXHAUSTIVE}&pageSize=${MAX_PAGE}&countTotal=true`
      + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
    const data = await fetchJson(url);
    if (totalCount === null) totalCount = data.totalCount;
    studies.push(...(data.studies || []).map((s) => ({
      protocolSection: { conditionsModule: { conditions: s.protocolSection?.conditionsModule?.conditions || [] } },
    })));
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return { studies, totalCount };
}

// A minimal DOM stub, exactly what js/trials.js's module-top-level `document.getElementById` calls
// need to resolve without throwing — nothing about the stub's behavior is exercised by
// filterByCondition itself, which is a pure function over plain objects.
function installDomStub() {
  const stubEl = () => ({
    addEventListener() {}, classList: { toggle() {}, contains() { return false; } },
    toggleAttribute() {}, setAttribute() {}, focus() {}, hidden: false,
    set textContent(v) {}, set innerHTML(v) {},
  });
  globalThis.document = { getElementById: () => stubEl() };
}

// One token, word-boundaried and case-insensitive — the same discipline js/trials.js's own
// keywordRegex uses (and the reason it needs it: pointer_check.py's oracle scar, an unboundaried
// short needle matching ordinary English inside a longer word). Not exported from trials.js
// because this tool needs it over a single hand-derived token, not the entry's own keyword list;
// duplicating six lines here is cheaper than widening that module's export surface for a
// diagnostic script.
function tokenRegex(token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i');
}

// Cancer-vocabulary words too generic to carry disease identity on their own — present in nearly
// every oncology condition string regardless of which disease it names. This is the exact class
// the retired replacement's own header already flagged by hand ("several entries' own
// distinguishing word is the generic 'adenocarcinoma' — gdiff, luad, acinar, crc"): if left in,
// every organ's parent corpus would report a flood of "hits" that share nothing but a suffix,
// burying any real find. Disclosed here rather than silently tuned, per this project's own
// no-shopping-for-a-clean-result standard — this is the entire adjustment made to the raw token
// list, and it is the same adjustment every prior pass would have had to make by hand.
const NAME_STOPWORDS = new Set([
  'carcinoma', 'adenocarcinoma', 'cancer', 'tumor', 'tumour', 'cell', 'cells',
  'of', 'the', 'and', 'a', 'an', 'in',
]);

// The entry's own distinguishing name-tokens, drawn from `query` — the disease-name string each
// mapping already carries for its narrow fetch, not a term hand-picked for this check. A token
// that the entry's OWN conditionKeywords already recognizes can never appear in a filter-REJECTED
// string by construction (any string containing it would be KEPT), so leaving such tokens in is
// harmless — they simply produce zero hits — and excluding them here would only hide that the
// keyword list already covers them, which is itself worth seeing in a quiet run.
function distinguishingTokens(query) {
  return [...new Set(query.toLowerCase().split(/\s+/).filter((w) => w && !NAME_STOPWORDS.has(w)))];
}

// THE CORPUS-VOCABULARY SIGNAL — see this file's header for the full reasoning. Takes the entry's
// already-fetched exhaustive PARENT corpus (shared with the retired-signal computation below so
// this never doubles the live fetch load) and reduces it to its DISTINCT condition strings before
// running the entry's real, current filterByCondition against them — deduplicating first because
// the parent corpus can hold the same condition tag on hundreds of studies, and re-testing it that
// many times would report a "hit count" that is really a study count wearing a finding's clothes.
// Deliberately called WITHOUT entry.requireAlso OR entry.excludeIf, unlike the three call sites
// in main() below — this decomposes the parent corpus into single-condition wrappers, one string
// at a time, and BOTH mechanisms' contracts are about a single declared condition string (design
// doc §1b for requireAlso; SCLC's own note in js/trials.js for excludeIf), just in opposite
// directions. requireAlso: a basket trial's unrelated "Small Cell Lung Cancer" tag, tested alone,
// would fail a requireAlso:['prostat'] gate trivially even though it is correctly excluded for
// being a different disease entirely, not because this entry's own conditionKeywords are too
// narrow — which is the one question this signal exists to answer. excludeIf: SCLC's own
// "Non-Small Cell Lung Cancer" tag, tested alone WITH excludeIf applied, would be correctly
// DROPPED by production rules (it names a different disease) and would then register as a false
// "rejected-but-relevant HIT" here, since "small"/"lung" are real SCLC name-tokens it happens to
// share — the exact opposite direction of the requireAlso case, but the identical root cause: a
// mechanism whose whole point is same-string disambiguation cannot be evaluated correctly by
// decomposing the string it disambiguates within. Both omissions considered and declined
// together, not an oversight matching the three threading-fixes above.
function corpusVocabularySignal(entry, parentAll, filterByCondition) {
  const tokens = distinguishingTokens(entry.query);
  const distinct = new Map(); // condition string -> a one-condition study wrapper filterByCondition can test
  parentAll.studies.forEach((s) => {
    s.protocolSection.conditionsModule.conditions.forEach((c) => {
      if (!distinct.has(c)) {
        distinct.set(c, { protocolSection: { conditionsModule: { conditions: [c] } } });
      }
    });
  });
  const { dropped } = filterByCondition([...distinct.values()], entry.conditionKeywords);
  const hits = [];
  dropped.forEach((s) => {
    const cond = s.protocolSection.conditionsModule.conditions[0];
    const matched = tokens.filter((t) => tokenRegex(t).test(cond));
    if (matched.length) hits.push({ condition: cond, matchedTokens: matched });
  });
  return { tokens, distinctConditions: distinct.size, rejectedDistinct: dropped.length, hits };
}

// THE POSITIVE CONTROL (2026-09-13, user ruling) — a stem that matches nothing produces zero
// kept trials, which is INDISTINGUISHABLE from a genuinely trial-less rare cancer at the output
// this file already prints. That is exactly how `requireAlso: ['prostat']` shipped broken and
// rendered silently: `\bprostat\b` (the pre-fix regex) can never match "Prostate" at all, on any
// corpus, so every mapping using it was structurally guaranteed to over-drop — and nothing here
// checked the TERM, only ever the RESULT. This validates the keyword, not the result: does
// `entry.requireAlso`, run through the real, imported `stemRegex` production uses, match ANY
// distinct condition string in the entry's own parent-organ corpus at all? The parent corpus is
// the right population — for a prostate-anchored requireAlso, "Prostate" (in some inflection)
// should appear constantly in a prostate-cancer trial corpus; if it appears NOWHERE, the term
// itself is broken, independent of whatever the entry's current kept-count happens to be.
// A miss here is never tolerable the way a below-floor entry's zero-kept can be — there is no
// legitimate reason an organ-anchor stem should fail to match its own organ's corpus at all — so
// this prints a hard FAIL line rather than participating in the declared-zero census below.
function requireAlsoPositiveControl(entry, parentAll, stemRegexFn) {
  if (!entry.requireAlso) return null;
  const re = stemRegexFn(entry.requireAlso);
  const distinct = new Set();
  parentAll.studies.forEach((s) => s.protocolSection.conditionsModule.conditions.forEach((c) => distinct.add(c)));
  const matches = [...distinct].filter((c) => re.test(c));
  return {
    term: entry.requireAlso, distinctConditions: distinct.size,
    matchCount: matches.length, examples: matches.slice(0, 3),
  };
}

// EXCLUDE-IF POSITIVE CONTROL (2026-09-13, SCLC's own mapping) — the mirror-image check for the
// mirror-image mechanism. requireAlso's failure mode was a term matching NOTHING when it should
// match plenty; excludeIf's analogous failure mode is a typo'd or mis-escaped term that ALSO
// matches nothing, in which case the exclusion silently does nothing and every contaminating
// study (e.g. "Non-Small Cell Lung Cancer" for SCLC) sails through uncaught — functionally
// identical to never having written excludeIf at all, and just as invisible from the entry's own
// kept-count alone. Tested against the NARROW query's own corpus (not the parent's) — unlike
// requireAlso's organ-anchor, which should be abundant in the whole organ, an excludeIf term is
// expected to appear only within the entry's OWN near-miss population (a substring-contamination
// term has no reason to show up broadly across the parent organ's unrelated studies).
function excludeIfPositiveControl(entry, narrowAll, keywordRegexFn) {
  if (!entry.excludeIf) return null;
  const re = keywordRegexFn(entry.excludeIf);
  const distinct = new Set();
  narrowAll.studies.forEach((s) => s.protocolSection.conditionsModule.conditions.forEach((c) => distinct.add(c)));
  const matches = [...distinct].filter((c) => re.test(c));
  return {
    term: entry.excludeIf, distinctConditions: distinct.size,
    matchCount: matches.length, examples: matches.slice(0, 3),
  };
}

// THE ZERO-KEPT CENSUS (2026-09-13, user ruling) — "zero is legitimate at 0.01% share and it's
// also what a broken query looks like; a human makes that call once per entry rather than never."
// Declared here, not inside js/trials.js: this file's own architecture note already establishes
// that runtime content stays outside the battery, so this is read by hand, not gated — but a
// human reading it needs to be TOLD which zeros have already been read, matching this project's
// own tolerated.py convention (an undeclared count is evidence of an unread count) applied to
// runtime content for the first time. `checked` is the date this file last confirmed the
// declaration's reasoning still held against a LIVE fetch — not the date the entry was written.
// An entry that goes to zero with no line here prints UNDECLARED and needs a read before being
// trusted as "just a rare cancer" rather than a broken mapping.
const DECLARED_ZERO = {
  psignet: { reason: 'real disease rarity, ~3 US cases/year (Siech et al. 2026) — the organ-anchored query itself returns 0 studies under the live filter', checked: '2026-09-12' },
  pmuc: { reason: 'real disease rarity, ~19 US cases/year (Siech et al. 2026) — the query\'s one live result is an unrelated imaging study, dropped by the base keyword check before requireAlso is even reached', checked: '2026-09-12' },
  pductal: { reason: 'real disease rarity (~50 US cases/year) — no live trial currently ties "ductal" to "prostat" in one condition string; the corpus is dominated by pancreatic ductal adenocarcinoma trials instead', checked: '2026-09-12' },
};

async function main() {
  installDomStub();
  const trialsPath = new URL('../js/trials.js', import.meta.url).href;
  const { TRIALS_CONDITION_MAP, filterByCondition: importedFilter, stemRegex: importedStemRegex, keywordRegex: importedKeywordRegex } = await import(trialsPath);

  const requested = process.argv.slice(2);
  const ids = requested.length ? requested : Object.keys(TRIALS_CONDITION_MAP);
  const summary = []; // {id, controlFail, zeroKept, undeclared} — one unmissable block at the end,
  // per-entry output above is easy to lose in a 20-entry run's scrollback.

  for (const id of ids) {
    const entry = TRIALS_CONDITION_MAP[id];
    if (!entry) { console.log(`SKIP ${id}: no such entry in TRIALS_CONDITION_MAP`); continue; }
    if (!entry.parent) { console.log(`SKIP ${id}: no 'parent' field declared — cannot compute the parent-corpus signals`); continue; }

    const [sample, narrowAll, parentAll] = await Promise.all([
      fetchJson(studyUrl(entry.query, 10)),
      fetchAllConditions(entry.query),
      fetchAllConditions(entry.parent),
    ]);
    const studies = (sample.studies || []).map((s) => ({
      protocolSection: {
        identificationModule: {
          nctId: s.protocolSection?.identificationModule?.nctId,
          briefTitle: s.protocolSection?.identificationModule?.briefTitle,
        },
        conditionsModule: { conditions: s.protocolSection?.conditionsModule?.conditions || [] },
      },
    }));
    // requireAlso MUST be threaded through every one of these three calls (2026-09-13 fix — found
    // while wiring the positive control below): all three previously called importedFilter with
    // only entry.conditionKeywords, silently never applying requireAlso at all for the four
    // entries that carry one. That is not a narrower miss than production's own regex bug, it is
    // the OPPOSITE direction — omitting requireAlso entirely means this tool over-KEEPS (no
    // co-occurrence gate at all) exactly where production was over-DROPPING (a requireAlso that
    // could never match). The two defects compounded: this checker would have reported a falsely
    // reassuring "10/10 kept" for pneuro (matching the wrong number recorded in the design doc)
    // while the real, regex-bugged production code showed 0/10 live — which is consistent with
    // how that wrong number got written down and went unnoticed until the app itself was driven
    // end to end in a browser. Fixed at all three call sites.
    const { kept, dropped } = importedFilter(studies, entry.conditionKeywords, entry.requireAlso, entry.excludeIf);

    const narrowComplete = narrowAll.studies.length === narrowAll.totalCount;
    const parentComplete = parentAll.studies.length === parentAll.totalCount;
    const narrowKept = importedFilter(narrowAll.studies, entry.conditionKeywords, entry.requireAlso, entry.excludeIf).kept.length;
    const parentKept = importedFilter(parentAll.studies, entry.conditionKeywords, entry.requireAlso, entry.excludeIf).kept.length;
    const gap = parentKept - narrowKept;
    const retiredRatio = parentAll.totalCount ? (narrowAll.totalCount / parentAll.totalCount * 100).toFixed(2) + '%' : 'n/a';
    const vocab = corpusVocabularySignal(entry, parentAll, importedFilter);
    const control = requireAlsoPositiveControl(entry, parentAll, importedStemRegex);
    const excludeControl = excludeIfPositiveControl(entry, narrowAll, importedKeywordRegex);

    console.log(`\n=== ${id} ===`);
    console.log(`  query: "${entry.query}"  ->  totalCount ${narrowAll.totalCount}`);
    console.log(`  parent: "${entry.parent}"  ->  totalCount ${parentAll.totalCount}`);
    if (control) {
      const pass = control.matchCount > 0;
      console.log(`  REQUIREALSO POSITIVE CONTROL: term ${JSON.stringify(entry.requireAlso)} matches `
        + `${control.matchCount}/${control.distinctConditions} distinct parent-corpus condition strings`
        + ` — ${pass ? 'PASS' : 'FAIL — this term matches NOTHING in its own parent corpus; it is structurally broken, independent of the entry\'s current kept count'}`);
      if (pass) console.log(`    example matches: ${JSON.stringify(control.examples)}`);
    }
    if (excludeControl) {
      const pass = excludeControl.matchCount > 0;
      console.log(`  EXCLUDEIF POSITIVE CONTROL: term ${JSON.stringify(entry.excludeIf)} matches `
        + `${excludeControl.matchCount}/${excludeControl.distinctConditions} distinct narrow-query condition strings`
        + ` — ${pass ? 'PASS (real contamination it must exclude)' : 'FAIL — this term matches NOTHING in the narrow-query corpus; the exclusion may be silently doing nothing'}`);
      if (pass) console.log(`    example excluded strings: ${JSON.stringify(excludeControl.examples)}`);
    }
    console.log(`  ZERO-KEPT CENSUS: exhaustive narrowKept=${narrowKept}${narrowComplete ? '' : ' (INCOMPLETE PAGE)'}`
      + (narrowKept === 0
        ? (DECLARED_ZERO[id]
          ? ` — DECLARED (checked ${DECLARED_ZERO[id].checked}): ${DECLARED_ZERO[id].reason}`
          : ' — UNDECLARED ZERO: read before trusting as real rarity rather than a broken mapping')
        : ' — not zero, no declaration needed'));
    console.log(`  [RETIRED, informational only] query/parent ratio = ${retiredRatio}`);
    console.log(`  OVER-BROAD SIGNAL (sample of ${studies.length}): ${kept.length} kept, ${dropped.length} dropped`);
    dropped.forEach((s) => console.log(`    dropped: ${s.protocolSection.identificationModule.nctId} — "${s.protocolSection.identificationModule.briefTitle}" — conditions: ${JSON.stringify(s.protocolSection.conditionsModule.conditions)}`));
    console.log(`  [RETIRED — gap tracks the ratio above almost exactly, see this file's header] exhaustive: narrow ${narrowAll.studies.length}/${narrowAll.totalCount}${narrowComplete ? '' : ' — INCOMPLETE'}, parent ${parentAll.studies.length}/${parentAll.totalCount}${parentComplete ? '' : ' — INCOMPLETE'}: narrowKept=${narrowKept}  parentKept=${parentKept}  gap=${gap} (raw counts only — NOT a narrowness verdict)`);
    console.log(`  CORPUS-VOCABULARY SIGNAL: name-tokens ${JSON.stringify(vocab.tokens)}, ${vocab.distinctConditions} distinct condition strings in the parent corpus, ${vocab.rejectedDistinct} rejected by the current filter, ${vocab.hits.length} of those share a name-token`);
    vocab.hits.forEach((h) => console.log(`    HIT: "${h.condition}" — matched token(s): ${JSON.stringify(h.matchedTokens)}`));

    summary.push({
      id,
      controlFail: control && control.matchCount === 0,
      excludeControlFail: excludeControl && excludeControl.matchCount === 0,
      zeroKept: narrowKept === 0,
      undeclared: narrowKept === 0 && !DECLARED_ZERO[id],
    });
  }

  console.log('\n=== SUMMARY (read this block; per-entry detail above is easy to lose in scrollback) ===');
  const controlFails = summary.filter((s) => s.controlFail);
  const excludeControlFails = summary.filter((s) => s.excludeControlFail);
  const undeclaredZeros = summary.filter((s) => s.undeclared);
  const declaredZeros = summary.filter((s) => s.zeroKept && !s.undeclared);
  console.log(`  requireAlso positive control: ${controlFails.length ? 'FAIL — ' + JSON.stringify(controlFails.map((s) => s.id)) : 'no failures'}`);
  console.log(`  excludeIf positive control: ${excludeControlFails.length ? 'FAIL — ' + JSON.stringify(excludeControlFails.map((s) => s.id)) : 'no failures'}`);
  console.log(`  zero-kept, UNDECLARED (read these): ${undeclaredZeros.length ? JSON.stringify(undeclaredZeros.map((s) => s.id)) : 'none'}`);
  console.log(`  zero-kept, declared and re-checked this run: ${declaredZeros.length ? JSON.stringify(declaredZeros.map((s) => s.id)) : 'none'}`);
}

main().catch((e) => { console.error('trials_mapping_check crashed:', e); process.exit(1); });
