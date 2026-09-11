// trials_mapping_check.mjs (2026-09-11) — reusable verification for TRIALS_CONDITION_MAP entries.
// NON_INSTRUMENT: evidence for whether a mapping needs rewriting, not a gate — runtime content
// stays outside the battery by the architecture phaseB_design.md §1 already settled, and this
// tool makes live network calls, which a battery member never does. Run by hand when building or
// auditing a mapping; not part of any commit gate.
//
// TWO SIGNALS, BECAUSE THE FETCH-TIME FILTER ONLY BRACKETS ONE SIDE (user ruling, 2026-09-11):
//   - THE DROP COUNT catches a mapping that is too BROAD — a query pulling in studies the filter
//     then has to reject. Already live, per-fetch, in js/trials.js itself (design doc §1d).
//   - THE QUERY-TOTAL-OVER-PARENT-TOTAL RATIO catches a mapping that is too NARROW — the failure
//     the drop count is structurally blind to, because an over-narrow query never fetches the
//     trials it's missing in the first place, so nothing gets dropped and nothing looks wrong. If
//     a subtype's own query returns a handful of studies while its parent organ term returns
//     hundreds, that is a signal worth reading even when every returned study is genuinely on
//     topic — self-calibrating, no external data needed, because the parent term is just the same
//     kind of query one step broader.
//
// Usage: node .claude/trials_mapping_check.mjs [entryId ...]   (defaults to every declared entry)
// Needs each entry to carry a `parent` field (the broad organ-term query) alongside `query` and
// `conditionKeywords` — added to TRIALS_CONDITION_MAP for exactly this tool.

const STATUS = 'RECRUITING%7CNOT_YET_RECRUITING%7CENROLLING_BY_INVITATION';
const FIELDS = 'NCTId,BriefTitle,Condition';

function studyUrl(cond, pageSize) {
  return `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(cond)}`
    + `&filter.overallStatus=${STATUS}&fields=${FIELDS}&sort=LastUpdatePostDate:desc&pageSize=${pageSize}&countTotal=true`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
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
    if (!entry.parent) { console.log(`SKIP ${id}: no 'parent' field declared — cannot compute the over-narrow ratio`); continue; }

    const [sample, parentTotals] = await Promise.all([
      fetchJson(studyUrl(entry.query, 10)),
      fetchJson(studyUrl(entry.parent, 1)),
    ]);
    const queryTotal = sample.totalCount;
    const parentTotal = parentTotals.totalCount;
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
    const ratio = parentTotal ? (queryTotal / parentTotal * 100).toFixed(2) + '%' : 'n/a (parent total 0)';

    console.log(`\n=== ${id} ===`);
    console.log(`  query: "${entry.query}"  ->  totalCount ${queryTotal}`);
    console.log(`  parent: "${entry.parent}"  ->  totalCount ${parentTotal}`);
    console.log(`  OVER-NARROW SIGNAL: query/parent = ${queryTotal}/${parentTotal} = ${ratio}`);
    console.log(`  OVER-BROAD SIGNAL (sample of ${studies.length}): ${kept.length} kept, ${dropped.length} dropped`);
    dropped.forEach((s) => console.log(`    dropped: ${s.protocolSection.identificationModule.nctId} — "${s.protocolSection.identificationModule.briefTitle}" — conditions: ${JSON.stringify(s.protocolSection.conditionsModule.conditions)}`));
  }
}

main().catch((e) => { console.error('trials_mapping_check crashed:', e); process.exit(1); });
