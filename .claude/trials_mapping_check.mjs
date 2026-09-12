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

async function main() {
  installDomStub();
  const trialsPath = new URL('../js/trials.js', import.meta.url).href;
  const { TRIALS_CONDITION_MAP, filterByCondition: importedFilter } = await import(trialsPath);

  const requested = process.argv.slice(2);
  const ids = requested.length ? requested : Object.keys(TRIALS_CONDITION_MAP);

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
    const { kept, dropped } = importedFilter(studies, entry.conditionKeywords);

    const narrowComplete = narrowAll.studies.length === narrowAll.totalCount;
    const parentComplete = parentAll.studies.length === parentAll.totalCount;
    const narrowKept = importedFilter(narrowAll.studies, entry.conditionKeywords).kept.length;
    const parentKept = importedFilter(parentAll.studies, entry.conditionKeywords).kept.length;
    const gap = parentKept - narrowKept;
    const retiredRatio = parentAll.totalCount ? (narrowAll.totalCount / parentAll.totalCount * 100).toFixed(2) + '%' : 'n/a';
    const vocab = corpusVocabularySignal(entry, parentAll, importedFilter);

    console.log(`\n=== ${id} ===`);
    console.log(`  query: "${entry.query}"  ->  totalCount ${narrowAll.totalCount}`);
    console.log(`  parent: "${entry.parent}"  ->  totalCount ${parentAll.totalCount}`);
    console.log(`  [RETIRED, informational only] query/parent ratio = ${retiredRatio}`);
    console.log(`  OVER-BROAD SIGNAL (sample of ${studies.length}): ${kept.length} kept, ${dropped.length} dropped`);
    dropped.forEach((s) => console.log(`    dropped: ${s.protocolSection.identificationModule.nctId} — "${s.protocolSection.identificationModule.briefTitle}" — conditions: ${JSON.stringify(s.protocolSection.conditionsModule.conditions)}`));
    console.log(`  [RETIRED — gap tracks the ratio above almost exactly, see this file's header] exhaustive: narrow ${narrowAll.studies.length}/${narrowAll.totalCount}${narrowComplete ? '' : ' — INCOMPLETE'}, parent ${parentAll.studies.length}/${parentAll.totalCount}${parentComplete ? '' : ' — INCOMPLETE'}: narrowKept=${narrowKept}  parentKept=${parentKept}  gap=${gap} (raw counts only — NOT a narrowness verdict)`);
    console.log(`  CORPUS-VOCABULARY SIGNAL: name-tokens ${JSON.stringify(vocab.tokens)}, ${vocab.distinctConditions} distinct condition strings in the parent corpus, ${vocab.rejectedDistinct} rejected by the current filter, ${vocab.hits.length} of those share a name-token`);
    vocab.hits.forEach((h) => console.log(`    HIT: "${h.condition}" — matched token(s): ${JSON.stringify(h.matchedTokens)}`));
  }
}

main().catch((e) => { console.error('trials_mapping_check crashed:', e); process.exit(1); });
