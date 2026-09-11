// trials_mapping_check.mjs (2026-09-11, revised 2026-09-11) — reusable verification for
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
// WHAT WOULD ACTUALLY WORK, NOT YET BUILT: a signal needs a SUBTYPE-discriminating check, not an
// organ-level one — e.g. searching the parent set's own conditions for the entry's distinguishing
// histologic term (roughly: "clear cell" for ccrcc/clear, "seminoma" for seminoma, "papillary" for
// ptc) rather than the organ-level filter. Deriving that term per entry correctly, for all sixteen,
// is a real content task with its own failure mode (an over-broad or over-narrow hand-picked term
// makes exactly the mistake this project's seminoma catch already taught: several entries' own
// distinguishing word is the generic "adenocarcinoma" — gdiff, luad, acinar, crc — which is too
// broad within an organ where adenocarcinoma is already the dominant histology, so it would not
// discriminate there either). NOT attempted under time pressure in this pass, deliberately — an
// invented-and-wrong subtype term would be a confident wrong answer, the exact class this project's
// own culture exists to catch before it ships, not after.
//
// THE ONE SIGNAL THAT SURVIVES: THE DROP COUNT (still live, per-fetch, in js/trials.js itself —
// design doc §1d) catches a mapping that is too BROAD, from the entry's own narrow-query sample.
// There is currently NO working over-narrow signal. The exhaustive fetch machinery below is kept —
// the raw counts (narrowTotal/parentTotal/narrowKept/parentKept) are genuinely useful data for
// whoever builds the subtype-discriminating version — but its DERIVED gap must not be read as a
// verdict about any mapping's quality.
//
// Usage: node .claude/trials_mapping_check.mjs [entryId ...]   (defaults to every declared entry)
// Needs each entry to carry a `parent` field (the broad organ-term query) alongside `query` and
// `conditionKeywords` — added to TRIALS_CONDITION_MAP for exactly this tool.

const STATUS = 'RECRUITING%7CNOT_YET_RECRUITING%7CENROLLING_BY_INVITATION';
const FIELDS_SAMPLE = 'NCTId,BriefTitle,Condition';   // the over-broad signal's own 10-study sample, unchanged
const FIELDS_EXHAUSTIVE = 'NCTId,Condition';          // the over-narrow signal's full-corpus pull — no title needed at scale
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

async function main() {
  installDomStub();
  const trialsPath = new URL('../js/trials.js', import.meta.url).href;
  const { TRIALS_CONDITION_MAP, filterByCondition } = await import(trialsPath);

  const requested = process.argv.slice(2);
  const ids = requested.length ? requested : Object.keys(TRIALS_CONDITION_MAP);

  for (const id of ids) {
    const entry = TRIALS_CONDITION_MAP[id];
    if (!entry) { console.log(`SKIP ${id}: no such entry in TRIALS_CONDITION_MAP`); continue; }
    if (!entry.parent) { console.log(`SKIP ${id}: no 'parent' field declared — cannot compute the over-narrow signal`); continue; }

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
    const { kept, dropped } = filterByCondition(studies, entry.conditionKeywords);

    const narrowComplete = narrowAll.studies.length === narrowAll.totalCount;
    const parentComplete = parentAll.studies.length === parentAll.totalCount;
    const narrowKept = filterByCondition(narrowAll.studies, entry.conditionKeywords).kept.length;
    const parentKept = filterByCondition(parentAll.studies, entry.conditionKeywords).kept.length;
    const gap = parentKept - narrowKept;
    const retiredRatio = parentAll.totalCount ? (narrowAll.totalCount / parentAll.totalCount * 100).toFixed(2) + '%' : 'n/a';

    console.log(`\n=== ${id} ===`);
    console.log(`  query: "${entry.query}"  ->  totalCount ${narrowAll.totalCount}`);
    console.log(`  parent: "${entry.parent}"  ->  totalCount ${parentAll.totalCount}`);
    console.log(`  [RETIRED, informational only] query/parent ratio = ${retiredRatio}`);
    console.log(`  OVER-BROAD SIGNAL (sample of ${studies.length}): ${kept.length} kept, ${dropped.length} dropped`);
    dropped.forEach((s) => console.log(`    dropped: ${s.protocolSection.identificationModule.nctId} — "${s.protocolSection.identificationModule.briefTitle}" — conditions: ${JSON.stringify(s.protocolSection.conditionsModule.conditions)}`));
    console.log(`  [ALSO RETIRED — gap tracks the ratio above almost exactly, see this file's header] exhaustive: narrow ${narrowAll.studies.length}/${narrowAll.totalCount}${narrowComplete ? '' : ' — INCOMPLETE'}, parent ${parentAll.studies.length}/${parentAll.totalCount}${parentComplete ? '' : ' — INCOMPLETE'}: narrowKept=${narrowKept}  parentKept=${parentKept}  gap=${gap} (raw counts only — NOT a narrowness verdict; no working over-narrow signal exists)`);
  }
}

main().catch((e) => { console.error('trials_mapping_check crashed:', e); process.exit(1); });
