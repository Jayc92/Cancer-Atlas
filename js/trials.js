import { state } from './state.js';
import { makeActivatable, updateDisclaimerInert } from './accessibility.js';

// ============================================================
// CLINICAL TRIALS — cancer screen, level 1 (site-map level)
// ============================================================
// A peer VIEW MODE of the site-map layer, entered at level 1 — the opposite level from
// histology.js's toggle, and deliberately so: trials describe the whole cancer entry, not one
// metastatic site. Full design in .claude/phaseD_trials_design.md, ruled 2026-09-11. Runtime,
// bounded-assertion content per the architecture settled in phaseB_design.md §1: no detector is
// added for this, and it is not a .claude/ tool, so it carries no NON_INSTRUMENTS declaration —
// the same category js/histology.js already sits in.

const BASE = 'https://clinicaltrials.gov/api/v2/studies';
const FIELDS = 'NCTId,BriefTitle,OverallStatus,LastUpdatePostDate,Condition';
// An INCLUDE-list (design doc §3), not an exclude-list: fails safe against an overallStatus
// value this document has not enumerated. %7C is the literal pipe ClinicalTrials.gov's v2 API
// expects between alternatives — verified live, not assumed, before this shipped.
const STATUS_FILTER = 'RECRUITING%7CNOT_YET_RECRUITING%7CENROLLING_BY_INVITATION';
const PAGE_SIZE = 10;

// PER-ENTRY, EXPLICIT, RECORDED (design doc §1) — never computed from an entry's display name
// at runtime. `parent` is a broad organ-level query, used only by .claude/trials_mapping_check.mjs
// (never fetched at runtime) to compute the over-narrow signal — a mapping whose own query returns
// a handful of studies while its parent returns hundreds is worth rewriting even when every
// returned study is genuinely on topic, since an over-narrow query never fetches what it's
// missing in the first place, so nothing about it looks wrong from the drop count alone.
export const TRIALS_CONDITION_MAP = {
  ccrcc: {
    query: 'clear cell renal cell carcinoma', parent: 'kidney cancer',
    conditionKeywords: ['renal', 'kidney', 'rcc'],
    note: '1/8 broader (kidney cancer generally, a CD70 imaging trial) — a named, reasoned '
      + 'broadening, not a wrong-disease match; accepted at 8/8 on the property that actually '
      + 'matters, zero wrong-disease results.',
  },
  gdiff: {
    query: 'gastric adenocarcinoma', parent: 'gastric cancer',
    conditionKeywords: ['gastric', 'stomach'],
    note: 'dropped "diffuse" from the query after it collided with an unrelated neuro-oncology '
      + 'basket trial via keyword match; the registry does not tag by Lauren classification at '
      + 'the condition level, so subtype specificity is deliberately not in the keyword set.',
  },
  // ---- the remaining fourteen, built 2026-09-11 once the scope was opened. Same method as
  // ccrcc/gdiff: query from organ+histology biology (not the entry's display string), a live
  // sample read back by hand against its own full (never truncated) condition list, keyword set
  // at organ/disease-family level. Every entry checked against BOTH signals before being trusted
  // — the drop count on a live 10-result sample, and the query/parent ratio via
  // .claude/trials_mapping_check.mjs — full per-entry numbers in phaseD_trials_design.md §10.
  hgsoc: {
    query: 'high grade serous ovarian carcinoma', parent: 'ovarian cancer',
    conditionKeywords: ['ovarian', 'ovary', 'fallopian', 'peritoneal', 'peritoneum', 'hgsoc'],
    note: '10/10 sample kept, 0 dropped. Ovary has two wired entries (hgsoc, clear) sharing one '
      + 'organ-level keyword set; unlike gdiff, CT.gov DOES tag ovarian histology directly '
      + '("High Grade Serous Adenocarcinoma of Ovary" vs "Ovarian Clear Cell Carcinoma"), so a '
      + 'genuine cross-entry basket trial (one real sample carried both tags at once, checked in '
      + 'full) is correctly kept for both — the same named-broadening shape as ccrcc\'s CD70 '
      + 'case, occurring twice because this organ has two entries where kidney has one, not a '
      + 'defect. A bare "Ovarian Cancer" tag with no subtype is also kept, matching the same '
      + 'acceptance rule ccrcc\'s bare "Renal Cell Carcinoma" tags already established. '
      + '"fallopian"/"peritoneal"/"peritoneum" ADDED 2026-09-11 (corpus-vocabulary signal, '
      + 'trials_mapping_check.mjs): the tubal-origin model makes fallopian-tube and primary-'
      + 'peritoneal high-grade serous carcinoma the SAME disease under current nomenclature — '
      + 'most HGSOC is now thought to begin in the tubal fimbria — so trials essentially '
      + 'universally enroll all three sites as one eligible population; a bare "Fallopian Tube '
      + 'High Grade Serous Adenocarcinoma" tag with no "ovarian" mention was being silently '
      + 'dropped before this. Both noun and adjective forms of peritoneal are kept as separate '
      + 'keywords — "Clear Cell Adenocarcinoma of Peritoneum" doesn\'t word-match "peritoneal" — '
      + 'the same dual-form shape this list\'s own ovarian/ovary pair already has. '
      + 'Eligibility-text spot-check (not just the tag) confirms real ovarian-patient enrollment '
      + '— see phaseD_trials_design.md §12a. "hgsoc" ALSO added, an unrelated incidental find '
      + 'from the same verification pass, NOT the tubal-origin justification above: the narrow '
      + 'query\'s own 71-study result set includes a real recruiting trial (NCT07366242) tagged '
      + 'with the bare acronym "HGSOC" and no other condition at all — the exact seminoma-bug '
      + 'shape (disease\'s own name/acronym missing from the keyword list) — found by checking '
      + 'the query\'s FULL result set for ovarian-tag coverage as part of verifying this '
      + 'extension, not by the corpus-vocabulary signal itself (which only tokenizes `query`, '
      + 'never an acronym form). Scoped to hgsoc only — "HGSOC" names high-grade serous '
      + 'specifically and must never be added to clear\'s keyword list.',
  },
  clear: {
    query: 'ovarian clear cell carcinoma', parent: 'ovarian cancer',
    conditionKeywords: ['ovarian', 'ovary', 'fallopian', 'peritoneal', 'peritoneum'],
    note: '8/10 sample kept, 2 dropped (one pure-endometrial trial with no ovarian tag anywhere '
      + 'in its full condition list; one bare "Advanced or Metastatic Solid Tumor" with none '
      + 'either) — both genuinely off-topic on inspection, confirming the filter fires on real '
      + 'data rather than only a fixture. See hgsoc\'s note on the shared-organ keyword shape. '
      + '"fallopian"/"peritoneal"/"peritoneum" ADDED 2026-09-11, on DIFFERENT grounds than hgsoc\'s: OCCC '
      + 'arises from endometriosis, not the tube, so this is a trial-ELIGIBILITY convention '
      + '(these trials enroll ovarian/tubal/peritoneal clear-cell as one recruitment population) '
      + 'rather than a shared-origin fact — the registry groups by who may enroll, not by where '
      + 'disease begins, and that distinction is deliberately NOT carried into this organ\'s '
      + 'origin prose (js/organs/ovary.js). See phaseD_trials_design.md §12a.',
  },
  tnbc: {
    query: 'triple negative breast cancer', parent: 'breast cancer',
    conditionKeywords: ['breast'],
    note: '10/10 sample kept, 0 dropped.',
  },
  luad: {
    query: 'lung adenocarcinoma', parent: 'lung cancer',
    conditionKeywords: ['lung', 'pulmonary'],
    note: '6/10 sample kept, 4 dropped — all four are generic basket-trial tags ("Advanced Solid '
      + 'Tumor", "MTAP-deleted Solid Tumors") naming no organ in their own structured '
      + 'conditions; the same policy-consistent drop as ccrcc\'s "Oncology"-only case (design '
      + 'doc §1b), not a defect in the query.',
  },
  hcc: {
    query: 'hepatocellular carcinoma', parent: 'liver cancer',
    conditionKeywords: ['hepatocellular', 'liver', 'hepatic'],
    note: '10/10 sample kept, 0 dropped. Query/parent ratio 77% (961/1248 total studies, not '
      + 'just the 10-result sample) — expected, since HCC is the large majority of primary '
      + 'liver cancer (this app\'s own liver.js citation).',
  },
  gbm: {
    query: 'glioblastoma', parent: 'brain cancer',
    conditionKeywords: ['glioblastoma', 'glioma', 'brain', 'cns', 'central nervous system'],
    note: '9/10 sample kept, 1 dropped (the same generic "MTAP-deleted Solid Tumors" basket seen '
      + 'in luad\'s sample, naming no organ of its own).',
  },
  acinar: {
    query: 'prostate adenocarcinoma', parent: 'prostate cancer',
    conditionKeywords: ['prostate'],
    note: '10/10 sample kept, 0 dropped.',
  },
  pneuro: {
    query: 'neuroendocrine prostate cancer', parent: 'prostate cancer',
    conditionKeywords: ['neuroendocrine', 'small cell'], requireAlso: ['prostat'],
    note: 'RE-VERIFIED LIVE 2026-09-12 against the fixed filterByCondition below (see stemRegex\'s '
      + 'own comment): the prior "10/10 kept" record here was made against a requireAlso that '
      + 'could never actually match — \\bprostat\\b demands "prostat" be a complete word, which it '
      + 'never is inside "Prostate" — so every below-floor/pneuro/pductal mapping using it was '
      + 'silently over-dropping. Corrected result, fetched fresh rather than assumed unchanged '
      + 'from the broken run: 4/10 kept. Kept — each genuinely prostate NEPC, each combining the '
      + 'subtype and the organ in ONE condition string: NCT07639086 ("Sacituzumab Tirumotecan in '
      + 'Pts w/ NEPC After Progression on Prior Chemotherapy"; "Neuroendocrine Prostate Cancer '
      + '(NEPC)"), NCT07006727 and NCT07488923 (both real multi-tumour DLL3-targeting baskets '
      + 'naming "Neuroendocrine Prostate Cancer" as one of their own listed conditions), and '
      + 'NCT03866382 (a rare-genitourinary-tumours basket naming "Metastatic Prostate Small Cell '
      + 'Neuroendocrine Carcinoma" directly). Dropped — 3 with no neuroendocrine/small-cell '
      + 'condition of any kind (prostate mentioned, but for an unrelated reason); 3 are the '
      + 'requireAlso rule working as designed, not a miss: real baskets naming prostate cancer AND '
      + 'a neuroendocrine/small-cell entity as two SEPARATE, unconnected conditions — NCT06242470 '
      + 'lists "Castration Resistant Prostatic Cancer" alongside an unrelated "Small-cell Lung '
      + 'Cancer", NCT07620574 lists "Prostate Cancer" alongside an unrelated "Pancreatic '
      + 'Neuroendocrine Tumors (pNET)", NCT07124000 lists "Prostate Cancer" alongside an unrelated '
      + '"Neuroendocrine, Gastrointestinal Cancer" — independent-array matching would have kept '
      + 'all three as false "prostate NEC" results, the exact NCT03602079 shape pmuc\'s own note '
      + 'documents, now confirmed live a second and third time on this entry\'s own corpus.',
  },
  pductal: {
    query: 'prostatic ductal adenocarcinoma', parent: 'prostate cancer',
    conditionKeywords: ['ductal'], requireAlso: ['prostat'],
    note: 'A THIRD confirmed instance of the exact collision the ruling anticipated, checked '
      + 'live 2026-09-12: the organ-anchored query itself returns 10 results, and WITHOUT '
      + 'requireAlso every single one would be a false keep — the bare word "ductal" is '
      + 'overwhelmingly associated with PANCREATIC ductal adenocarcinoma (PDAC) in this '
      + 'registry, not prostate; several results ALSO separately tag "Prostate Cancer"/'
      + '"Prostatic Neoplasms" alongside "Pancreatic Ductal Adenocarcinoma" as two unrelated '
      + 'basket-trial entries (NCT07623642, NCT06999187, NCT06943521 among them) — the same '
      + 'NCT03602079 shape, confirmed a second time on a different entry. With same-string '
      + 'co-occurrence required: 0/10 kept, all 10 correctly dropped. Real disease rarity '
      + '(~50 US cases/year), not a broken query; expect EMPTY-ANSWERED. RE-VERIFIED LIVE '
      + '2026-09-12 against the requireAlso regex bug fixed on pneuro\'s entry above (stemRegex '
      + 'now used in place of a wrongly-\\b-bounded keywordRegex) — outcome unchanged, 0/10 kept '
      + 'on a fresh fetch: the bug always over-dropped, never over-kept, so this entry\'s already-'
      + 'zero result was never a false negative masking a real match, and is not one now either.',
  },
  crc: {
    query: 'colorectal adenocarcinoma', parent: 'colorectal cancer',
    conditionKeywords: ['colorectal', 'colon', 'rectal'],
    note: '10/10 sample kept, 0 dropped.',
  },
  pdac: {
    query: 'pancreatic ductal adenocarcinoma', parent: 'pancreatic cancer',
    conditionKeywords: ['pancreatic', 'pancreas'],
    note: '8/10 sample kept, 2 dropped — both bare "Advanced Solid Tumor(s)" naming no organ, '
      + 'the same policy-consistent shape as luad\'s drops.',
  },
  melanoma: {
    query: 'cutaneous melanoma', parent: 'melanoma',
    conditionKeywords: ['melanoma'],
    note: '10/10 sample kept, 0 dropped. Query/parent ratio 98% (586/595) — cutaneous melanoma '
      + 'is nearly all of what "melanoma" means in this registry at this scale, so the two '
      + 'queries nearly coincide; not a sign either query is wrong.',
  },
  seminoma: {
    query: 'testicular seminoma', parent: 'testicular cancer',
    conditionKeywords: ['testicular', 'testis', 'germ cell', 'seminoma'],
    note: 'FIRST DRAFT (keywords without "seminoma" itself) dropped 3 of 10 real results tagged '
      + 'bare "Seminoma" — the exact disease name, maximally on-topic — because the keyword '
      + 'list omitted the disease\'s own name. Caught by reading every drop\'s full conditions '
      + 'before trusting the count, not assumed clean; fixed by adding "seminoma", re-verified '
      + '10/10 kept. "germ cell" was checked against its most concerning real case (a 30-'
      + 'condition pediatric basket trial spanning ovarian AND testicular germ cell tumors) and '
      + 'found sound: its full condition list names "Stage I Testicular Seminoma" explicitly, so '
      + 'it is a genuine cross-organ basket inclusion, not a false match — "testicular"/"testis" '
      + 'alone would have kept it regardless of "germ cell".',
  },
  uc: {
    query: 'urothelial carcinoma of the bladder', parent: 'bladder cancer',
    conditionKeywords: ['urothelial', 'bladder'],
    note: '10/10 sample kept, 0 dropped.',
  },
  ptc: {
    query: 'papillary thyroid carcinoma', parent: 'thyroid cancer',
    conditionKeywords: ['thyroid'],
    note: '10/10 sample kept, 0 dropped. Thyroid has two wired entries (ptc, ftc); real samples '
      + 'show trials genuinely studying both differentiated subtypes together (the same '
      + 'shared-organ shape as hgsoc/clear), and the bare word "thyroid" already occurs inside '
      + '"Papillary Thyroid Carcinoma" itself, so no bare-disease-name gap like seminoma\'s '
      + 'exists here.',
  },
  ftc: {
    query: 'follicular thyroid carcinoma', parent: 'thyroid cancer',
    conditionKeywords: ['thyroid'],
    note: '9/9 sample kept, 0 dropped. Query/parent ratio 3% (9/293) — low, but consistent with '
      + 'real disease rarity (follicular is far less common than papillary thyroid carcinoma), '
      + 'not with a broken query — see phaseD_trials_design.md §10 for the full reasoning.',
  },
  // ---- ovary pilot, 2026-09-11 (phaseC_design.md) — endo/lgsc share hgsoc/clear's extended
  // ovarian/fallopian/peritoneal keyword set (real basket trials confirmed for both: NCT07791732
  // tags "Endometrioid Epithelial Ovarian" alongside "Fallopian Tube Cancer"/"Primary Peritoneal
  // Cancer"; NCT04111978 tags "Low-grade Serous Ovarian Carcinoma (LGSOC)" alongside "Fallopian
  // Tube Neoplasms"/"Peritoneal Neoplasms" — checked directly, not assumed from hgsoc's own
  // justification carrying over). muc does NOT: no fallopian/peritoneal-tagged trial was found in
  // its own (small, 7-total) query population, matching its real biology — mucinous carcinoma is
  // not part of the tubal-origin/Müllerian-spectrum grouping the other four ovarian entries share.
  endo: {
    query: 'endometrioid ovarian carcinoma', parent: 'ovarian cancer',
    conditionKeywords: ['ovarian', 'ovary', 'fallopian', 'peritoneal', 'peritoneum'],
    note: '8/10 sample kept, 2 dropped (both pure-endometrial trials with no ovarian tag '
      + 'anywhere in their full condition list) — the same shape as clear\'s own two drops. '
      + 'Corpus-vocabulary signal: 7 hits, all wrong-organ endometrial/endometrioid entities '
      + '(the token "endometrioid" collides with endometrial-CANCER\'s own name, not a mapping '
      + 'defect).',
  },
  muc: {
    query: 'mucinous ovarian carcinoma', parent: 'ovarian cancer',
    conditionKeywords: ['ovarian', 'ovary'],
    note: '4/7 kept, 3 dropped (endometrial mucinous adenocarcinoma, a gastric/pancreatic '
      + 'basket, and a hernia-surgery-methodology study — all genuinely off-topic) — the '
      + 'thinnest trial population in the atlas (7 total recruiting/not-yet trials worldwide '
      + 'for this query), consistent with real disease rarity (~3% of ovarian carcinomas), not '
      + 'a broken query. No fallopian/peritoneal extension: checked directly, not assumed — no '
      + 'trial in this query\'s own result set carries a tubal/peritoneal tag without an '
      + 'ovarian one.',
  },
  lgsc: {
    query: 'low grade serous ovarian carcinoma', parent: 'ovarian cancer',
    conditionKeywords: ['ovarian', 'ovary', 'fallopian', 'peritoneal', 'peritoneum'],
    note: '10/10 sample kept, 0 dropped. Shares hgsoc\'s tubal/peritoneal extension: a real '
      + 'trial (NCT04111978) tags "Low-grade Serous Ovarian Carcinoma (LGSOC)" alongside '
      + '"Fallopian Tube Neoplasms"/"Peritoneal Neoplasms" as one eligible population.',
  },
  // ---- below-floor entries, 2026-09-12 (phaseC_design.md §13) — name/share/citation/blurb
  // only, no mass/histology/extent; trials is the one thing they get beyond that. Both use
  // `requireAlso` (see filterByCondition's own comment for why a bare OR-list is unsafe for
  // these two specifically) and both currently resolve to EMPTY-ANSWERED under the live
  // RECRUITING/etc. filter — checked directly, not assumed: real disease rarity (~3/yr, ~19/yr),
  // not a broken query, matching the honest "no trials found" state the ruling explicitly
  // accepted as useful information rather than a defect to work around.
  psignet: {
    query: 'prostatic signet ring cell adenocarcinoma', parent: 'prostate cancer',
    conditionKeywords: ['signet ring'], requireAlso: ['prostat'],
    note: 'Organ-anchored query returns 0 studies under the RECRUITING/NOT_YET_RECRUITING/'
      + 'ENROLLING_BY_INVITATION filter and, at ANY status, only one unrelated 1990s '
      + 'gene-therapy trial (condition: bare "Cancer") — checked live 2026-09-12. Real disease '
      + 'rarity (~3 US cases/year, Siech et al. 2026), not a broken query; expect '
      + 'EMPTY-ANSWERED. requireAlso is load-bearing here more than for any prior entry: a bare '
      + '"signet ring cell carcinoma" query with NO organ anchor returns 15 real recruiting-or-'
      + 'any-status studies, all gastric or colorectal, zero prostate. RE-VERIFIED LIVE 2026-09-12 '
      + 'against the requireAlso regex bug fixed on pneuro\'s entry above — irrelevant here either '
      + 'way, since the organ-anchored query itself already returns 0 studies before requireAlso '
      + 'ever runs.',
  },
  pmuc: {
    query: 'prostatic mucinous adenocarcinoma', parent: 'prostate cancer',
    conditionKeywords: ['mucinous'], requireAlso: ['prostat'],
    note: 'Organ-anchored query returns 1 study under the RECRUITING/etc. filter, and it is '
      + 'itself a false match on inspection (conditions: "Motor Function", "Cognitive Function", '
      + '"Contrast Media" — a gadolinium-contrast imaging study with no oncology content at all) '
      + '— dropped correctly by the base keyword check alone. Checked live 2026-09-12; expect '
      + 'EMPTY-ANSWERED. requireAlso is load-bearing: a bare "mucinous adenocarcinoma" query '
      + 'with no organ anchor returns 10 real recruiting studies, all endometrial/appendiceal/'
      + 'pancreatic/breast, zero prostate; and a real basket trial in the organ-anchored '
      + 'ANY-status result (NCT03602079) lists "Mucinous Adenocarcinoma Gastric" and "Prostate '
      + 'Cancer" as two separate, unrelated entries among 24+ tumour types — same-string '
      + 'co-occurrence (not independent array matching) is what correctly excludes it. '
      + 'RE-VERIFIED LIVE 2026-09-12 against the requireAlso regex bug fixed on pneuro\'s entry '
      + 'above — irrelevant here either way, since the live sample\'s one fetched study is already '
      + 'dropped by the base "mucinous" keyword check before requireAlso is ever reached.',
  },
};

// ---- the fetch-time filter (design doc §1b) --------------------------------------------------
// THE QUERY IS NOT THE GUARD — THE RETURNED CONDITIONS ARE. A query can return something
// different tomorrow than it did today: verified live, not assumed — the ccRCC query above
// returned a completely different 8-study set one day after the mapping was first validated,
// zero NCT-id overlap with the set the mapping was checked against. What is checkable on every
// fetch, against a corpus that keeps moving, is what each returned study's OWN declared
// conditions say it is about — never what the query asked for or how the study surfaced.
function keywordRegex(keywords){
  // Word-boundaried, case-insensitive: the pointer_check.py scar applies here too — an
  // unboundaried short needle collides with ordinary English. These are real multi-character
  // medical terms, boundaried the same way regardless of length.
  const escaped = keywords.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('\\b(?:' + escaped.join('|') + ')\\b', 'i');
}

// requireAlso stems (e.g. 'prostat') are deliberately NOT whole words — they exist to match
// every inflected form sharing the stem (Prostate, Prostatic, Prostatectomy) in one regex rather
// than enumerating each. A trailing \b breaks that on contact: \bprostat\b demands "prostat" be a
// complete word, and it never is — the letter immediately after the stem's own final 't' in
// "Prostate" is 'e', a word character, so \b finds no boundary there and the pattern can never
// match. Found live 2026-09-12, after phaseC_design.md §13/14 shipped: every requireAlso-gated
// entry (pneuro/pductal/psignet/pmuc) was silently dropping every real match, including ten
// genuine prostate-NEPC trials for pneuro that should have been kept — the design doc's own
// "verified live, 10/10 kept" record was made against a check that didn't exercise this exact
// function (a parallel Python/manual read, not this regex), so the shipped defect went unseen
// until the live app itself was driven end to end. keywordRegex above stays whole-word-bounded on
// both ends — its own keywords (conditionKeywords, titleRe) are real complete words/phrases,
// where the same pointer_check.py-style collision risk this function's sibling comment names is
// real and the trailing boundary is exactly what prevents it.
//
// Exported (2026-09-13, the positive-control ruling) so .claude/trials_mapping_check.mjs can
// validate a requireAlso TERM directly — the same construction production filters with — rather
// than reimplementing it and risking the exact class of drift this file's own header warns about
// elsewhere (a copy that "corrects" the bug while the real one ships, or the reverse). A checker
// that reasons about its own local regex is not a control on this function; one that imports it is.
export function stemRegex(stems){
  const escaped = stems.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('\\b(?:' + escaped.join('|') + ')', 'i');
}

function studyConditions(study){
  const cm = study.protocolSection && study.protocolSection.conditionsModule;
  return (cm && cm.conditions) || [];
}

// Exported so it can be driven directly against a fixture: a fetch-time filter must be shown
// capable of dropping a genuine wrong-disease study before its zero is trusted on real traffic
// (Convention F — a plausible-but-wrong input, not only a broken one). Verified against two
// fixtures before this shipped: a study whose conditions carry no gdiff keyword at all (dropped)
// and the same study with 'Gastric Cancer' appended (kept) — see design doc §1b.
//
// `requireAlso` (2026-09-12, phaseC_design.md §13's below-floor trials ruling): psignet's
// "signet ring" and pmuc's "mucinous" are overloaded ACROSS ORGANS far more than any prior
// entry's own term — a bare, organ-anchor-free 'signet ring cell carcinoma' query returns 15
// real recruiting-or-any-status studies with ZERO prostate primaries (all gastric/colorectal,
// checked live 2026-09-12); a bare 'mucinous adenocarcinoma' query returns 10 real recruiting
// studies, again zero prostate (endometrial/appendiceal/pancreatic/breast). When given,
// `requireAlso` demands BOTH keyword lists match WITHIN THE SAME declared condition string, not
// merely somewhere in the study's own conditions array — a real basket trial (NCT03602079,
// checked live 2026-09-12) lists "Mucinous Adenocarcinoma Gastric" and "Prostate Cancer" as two
// SEPARATE, unrelated entries among 24+ tumour types in one eligibility list; matching each
// keyword list independently against the array would have kept it as a false "prostatic
// mucinous" result. The registry's own tagging convention for a real combined entity IS one
// string ("Colon Mucinous Adenocarcinoma", "Rectal Signet Ring Cell Adenocarcinoma" — both seen
// live in the same pass), so same-string co-occurrence is the stricter AND the anatomically
// correct test, not merely a defensive tightening.
export function filterByCondition(studies, keywords, requireAlso){
  const re = keywordRegex(keywords);
  const re2 = requireAlso ? stemRegex(requireAlso) : null;
  const kept = [], dropped = [];
  studies.forEach(s=>{
    const conds = studyConditions(s);
    const matches = re2 ? conds.some(c=>re.test(c) && re2.test(c)) : conds.some(c=>re.test(c));
    (matches ? kept : dropped).push(s);
  });
  return { kept, dropped };
}

function buildUrl(query){
  return BASE + '?query.cond=' + encodeURIComponent(query) + '&filter.overallStatus=' + STATUS_FILTER
    + '&fields=' + FIELDS + '&sort=LastUpdatePostDate:desc&pageSize=' + PAGE_SIZE;
}

// Four states (design doc §4). LOADING has no return value here — the caller shows its own copy
// while this promise is in flight. EMPTY-UNANSWERED is a probe failure (network/HTTP), never
// dressed as a finding about the disease — the measured-catastrophe-vs-failed-to-measure
// distinction this project's own deploy_check.js established, applied here to runtime content.
export async function fetchTrialsForEntry(cancerId){
  const entry = TRIALS_CONDITION_MAP[cancerId];
  if(!entry) return null;
  const fetchedAt = new Date();
  let studies;
  try{
    const res = await fetch(buildUrl(entry.query));
    if(!res.ok) return { state:'empty-unanswered', fetchedAt };
    const data = await res.json();
    studies = data.studies || [];
  }catch(err){
    return { state:'empty-unanswered', fetchedAt };
  }
  const { kept, dropped } = filterByCondition(studies, entry.conditionKeywords, entry.requireAlso);
  // Defensive client-side sort even though the request already asks the API to sort
  // server-side (sort=LastUpdatePostDate:desc, verified live) — a guarantee this code owns
  // rather than trusts silently to an upstream default that could change.
  kept.sort((a, b)=>lastUpdateDate(b).localeCompare(lastUpdateDate(a)));
  // THE DROP COUNT IS THE MAPPING'S OWN QUALITY SIGNAL (design doc §1d) — reported on every
  // fetch, not silently absorbed, so a mapping that starts producing many drops is visible
  // without anyone having to go looking for it.
  console.log('[trials] ' + cancerId + ': ' + studies.length + ' fetched, ' + dropped.length
    + ' dropped (condition mismatch), ' + kept.length + ' shown');
  const base = { fetchedAt, totalFetched: studies.length, dropCount: dropped.length };
  if(kept.length === 0) return { ...base, state:'empty-answered' };
  return { ...base, state:'results', studies:kept };
}

function lastUpdateDate(study){
  const sm = study.protocolSection && study.protocolSection.statusModule;
  return (sm && sm.lastUpdatePostDateStruct && sm.lastUpdatePostDateStruct.date) || '';
}
function studyStatus(study){
  const sm = study.protocolSection && study.protocolSection.statusModule;
  return (sm && sm.overallStatus) || '';
}
function studyTitle(study){
  const im = study.protocolSection && study.protocolSection.identificationModule;
  return (im && im.briefTitle) || '';
}
function studyId(study){
  const im = study.protocolSection && study.protocolSection.identificationModule;
  return (im && im.nctId) || '';
}

// ------------------------------------------------------------
// Layer wiring — same register-once shape as js/histology.js's toggle.
// ------------------------------------------------------------
const layerEl = document.getElementById('txTrialsLayer');
const toggleBtn = document.getElementById('txTrialsToggle');
const listEl = document.getElementById('trialsList');
const statusLineEl = document.getElementById('trialsStatusLine');

let trialsOn = false;
let loadedForCancerId = null;

const DATE_FMT = new Intl.DateTimeFormat('en-US', { dateStyle:'medium', timeStyle:'short' });

function renderLoading(){
  statusLineEl.textContent = 'Fetching trials from ClinicalTrials.gov…';
  listEl.innerHTML = '';
}

// Exported so the below-floor inline trials toggle (js/main.js's renderCancerList, phaseC_design.md
// §13/§14) can reuse the exact same four-state rendering this screen-level panel uses, rather than
// duplicating it — the ruling's "reuse trials.js's fetch-filter directly" approval covers this
// rendering logic too, not just fetchTrialsForEntry itself. renderResult below is now a thin DOM
// wrapper around this pure function.
export function describeTrialsResult(cancerId, result){
  const entry = TRIALS_CONDITION_MAP[cancerId];
  const stamp = 'Trials shown as of ' + DATE_FMT.format(result.fetchedAt) + ' · fetched from ClinicalTrials.gov';
  if(result.state === 'empty-unanswered'){
    return {
      statusLine: stamp.replace('Trials shown as of', 'Last attempted'),
      bodyHtml: '<div class="trials-error">We couldn\'t reach ClinicalTrials.gov just now — '
        + 'try again, or search directly at <a href="https://clinicaltrials.gov/" target="_blank" '
        + 'rel="noopener">clinicaltrials.gov</a>.</div>',
    };
  }
  if(result.state === 'empty-answered'){
    return {
      statusLine: stamp,
      bodyHtml: '<div class="trials-empty">No open trials are currently listed for this condition.</div>',
    };
  }
  // RESULTS. dropCount is reported here too (design doc §1d) — not just to the console — since
  // it is honest information about why a raw fetch count and a shown count can differ.
  const statusLine = stamp + (result.dropCount > 0
    ? ' · ' + result.dropCount + ' result' + (result.dropCount === 1 ? '' : 's') + ' omitted (didn\'t match this condition)'
    : '');
  const titleRe = keywordRegex(entry.conditionKeywords);
  const bodyHtml = result.studies.map(s=>{
    const nctId = studyId(s), title = studyTitle(s), status = studyStatus(s), updated = lastUpdateDate(s);
    const multiCondition = title && !titleRe.test(title);
    return '<div class="trial-card">'
      + '<a href="https://clinicaltrials.gov/study/' + encodeURIComponent(nctId) + '" target="_blank" rel="noopener">' + title + '</a>'
      + '<div class="trial-meta"><span class="trial-status">' + status + '</span>'
      + (updated ? '<span>Updated ' + updated + '</span>' : '') + '</div>'
      + (multiCondition ? '<div class="trial-multinote">Multi-condition trial — lists this condition among several others it studies.</div>' : '')
      + '</div>';
  }).join('');
  return { statusLine, bodyHtml };
}

function renderResult(cancerId, result){
  const { statusLine, bodyHtml } = describeTrialsResult(cancerId, result);
  statusLineEl.textContent = statusLine;
  listEl.innerHTML = bodyHtml;
}

function loadTrials(cancerId){
  renderLoading();
  fetchTrialsForEntry(cancerId).then(result=>{
    // The user may have left this cancer's screen, or the toggle may have been closed, while
    // the fetch was in flight — same stale-response guard every async loader in this app uses
    // (initOrganViewer's GLB load is the precedent). Comparing both the still-current cancer id
    // and that the layer is still the active one avoids writing a finished fetch's markup into
    // a panel nobody is looking at.
    if(state.currentCancerId !== cancerId || !trialsOn) return;
    renderResult(cancerId, result);
  });
}

function applyMode(on){
  trialsOn = on;
  layerEl.classList.toggle('active', on);
  layerEl.toggleAttribute('inert', !on);
  document.getElementById('screenCancer').classList.toggle('trials-open', on);
  updateDisclaimerInert();
  const siteViewerEl = document.getElementById('txSiteViewer');
  siteViewerEl.classList.toggle('hidden', on);
  // .hidden alone (opacity:0 + pointer-events:none) leaves the site-label buttons inside it
  // focusable and keyboard-activatable — the same trap #txCellLayer's own markup comment
  // documents. inert removes the whole subtree from the accessibility tree, matching every
  // other layer swap on this screen.
  siteViewerEl.toggleAttribute('inert', on);
  if(state.siteViewer) state.siteViewer.autoRotate = !on;
  toggleBtn.setAttribute('aria-pressed', String(on));
}

function enterTrials(){
  const cancerId = state.currentCancerId;
  if(!cancerId || !TRIALS_CONDITION_MAP[cancerId]) return; // belt-and-braces, same as histology's guard
  applyMode(true);
  if(loadedForCancerId !== cancerId){
    loadedForCancerId = cancerId;
    loadTrials(cancerId);
  }
  toggleBtn.focus({ preventScroll:true });
}

export function resetTrialsMode(){
  if(!trialsOn){
    toggleBtn.setAttribute('aria-pressed', 'false');
    return;
  }
  applyMode(false);
}

export function showTrialsToggle(){
  toggleBtn.hidden = !TRIALS_CONDITION_MAP[state.currentCancerId];
}

export function hideTrialsToggle(){
  toggleBtn.hidden = true;
}

export function initTrials(){
  toggleBtn.addEventListener('click', ()=>{
    if(trialsOn) resetTrialsMode();
    else enterTrials();
  });
}
