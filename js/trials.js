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
  // prcc/chrcc, 2026-09-13 (ordinary-organ batch): "papillary" is a real, confirmed collision
  // risk across thyroid/ovarian/bladder papillary entities (all in this same atlas), so prcc's
  // requireAlso anchors it to the same organ terms ccRCC's own conditionKeywords already use.
  // "chromophobe" is essentially kidney-specific in ordinary usage — checked live below rather
  // than assumed safe on that reasoning alone, per the standing rule that a trials-mapping
  // keyword list is verified by running it, never by reading it.
  prcc: {
    query: 'papillary renal cell carcinoma', parent: 'kidney cancer',
    conditionKeywords: ['papillary'], requireAlso: ['renal', 'kidney'],
    note: 'LIVE-VERIFIED 2026-09-13 (10 real results sampled, kept and dropped both read): '
      + 'requireAlso correctly dropped every thyroid/ovarian/bladder "papillary" hit that reached '
      + 'the base keyword check; 10/10 kept results are genuine papillary RCC trials.',
  },
  chrcc: {
    query: 'chromophobe renal cell carcinoma', parent: 'kidney cancer',
    conditionKeywords: ['chromophobe'],
    note: 'LIVE-VERIFIED 2026-09-13: "chromophobe" alone returned no cross-disease false '
      + 'positives in a 10-result live sample — checked, not assumed, despite the term reading '
      + 'as low-risk on its face.',
  },
  gdiff: {
    query: 'gastric adenocarcinoma', parent: 'gastric cancer',
    conditionKeywords: ['gastric', 'stomach'],
    note: 'dropped "diffuse" from the query after it collided with an unrelated neuro-oncology '
      + 'basket trial via keyword match; the registry does not tag by Lauren classification at '
      + 'the condition level, so subtype specificity is deliberately not in the keyword set.',
  },
  // gint/gmix, 2026-09-13 (stomach round): LIVE-TESTED before committing to this shape, per the
  // now-required trials-verification rule — a narrower query ("intestinal type gastric
  // adenocarcinoma", "gastric mixed type adenocarcinoma") was tried FIRST and returns almost
  // entirely off-topic basket/screening trials with no meaningful overlap to the real disease,
  // confirming gdiff's own note above rather than being assumed from it: this registry does not
  // tag by Lauren type at all, so a Lauren-specific query degrades rather than sharpens the
  // result set. Both entries therefore reuse gdiff's own query and keyword set VERBATIM — all
  // three Lauren-type entries in this organ necessarily draw from the identical underlying
  // trials corpus, which is a real, disclosed limitation, not an oversight.
  gint: {
    query: 'gastric adenocarcinoma', parent: 'gastric cancer',
    conditionKeywords: ['gastric', 'stomach'],
    note: '8/10 live sample kept, 2 dropped (both generic "Advanced/Metastatic Solid Tumor" '
      + 'basket tags naming no organ — the same policy-consistent drop as gdiff\'s own). Same '
      + 'query and keyword set as gdiff and gmix: this registry does not tag by Lauren '
      + 'classification, so all three entries in this organ draw the same underlying corpus.',
  },
  gmix: {
    query: 'gastric adenocarcinoma', parent: 'gastric cancer',
    conditionKeywords: ['gastric', 'stomach'],
    note: 'Same query and keyword set as gdiff and gint, for the identical reason stated on '
      + 'gint\'s own entry. Below-floor entries still surface a Trials toggle (js/main.js\'s '
      + '`belowFloorTrialsHtml`), so this mapping is required even though the entry itself '
      + 'carries no mutation ledger or site map.',
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
    conditionKeywords: ['lung', 'pulmonary'], excludeIf: ['non-lung'],
    note: '6/10 sample kept, 4 dropped — all four are generic basket-trial tags ("Advanced Solid '
      + 'Tumor", "MTAP-deleted Solid Tumors") naming no organ in their own structured '
      + 'conditions; the same policy-consistent drop as ccrcc\'s "Oncology"-only case (design '
      + 'doc §1b), not a defect in the query. '
      + 'FOUND MECHANICALLY, NOT LIVE (2026-09-13, the negation-collision scan run across every '
      + 'entry after the lung round\'s two live-caught excludeIf bugs — see .claude/'
      + 'trials_mapping_check.mjs): "Small Cell Carcinomas of Non-lung Origin" — real '
      + 'extrapulmonary small cell carcinoma, wrongly kept because "lung" is one of two OR-'
      + 'matched keywords with no requireAlso forcing it. The same string SCLC\'s own excludeIf '
      + 'was extended to cover the same day. Checked before excluding: "non-lung"/"non lung" '
      + 'appears in exactly this one condition string across the full lung-cancer parent corpus.',
  },
  hcc: {
    query: 'hepatocellular carcinoma', parent: 'liver cancer',
    conditionKeywords: ['hepatocellular', 'liver', 'hepatic'],
    note: '10/10 sample kept, 0 dropped. Query/parent ratio 77% (961/1248 total studies, not '
      + 'just the 10-result sample) — expected, since HCC is the large majority of primary '
      + 'liver cancer (this app\'s own liver.js citation).',
  },
  ichol: {
    query: 'intrahepatic cholangiocarcinoma', parent: 'liver cancer',
    conditionKeywords: ['cholangiocarcinoma', 'cholangiocellular', 'bile duct', 'biliary tract', 'biliary'],
    note: '15/15 live sample kept, 0 dropped, 0 false positives (negation-scan clean: the corpus-vocabulary '
      + 'signal surfaced "Intrahepatic Cholangiocellular Carcinoma" as a real missed synonym before the '
      + 'live sample ran — cholangiocellular carcinoma is the same disease under an older name — fixed by '
      + 'adding "cholangiocellular" to conditionKeywords; the other three corpus-vocabulary hits sharing the '
      + '"intrahepatic" token, Progressive Familial Intrahepatic Cholestasis ×2 and Intrahepatic Cholestasis, '
      + 'are unrelated benign bile-flow disorders and correctly stay excluded). Live sample includes one real '
      + 'multi-basket trial (NCT05286814, mCRC/iCCA/adrenocortical carcinoma) where iCCA is a genuinely named '
      + 'condition, not a false collision.',
  },
  gbm: {
    query: 'glioblastoma', parent: 'brain cancer',
    conditionKeywords: ['glioblastoma', 'glioma', 'brain', 'cns', 'central nervous system'],
    note: '9/10 sample kept, 1 dropped (the same generic "MTAP-deleted Solid Tumors" basket seen '
      + 'in luad\'s sample, naming no organ of its own).',
  },
  acinar: {
    query: 'prostate adenocarcinoma', parent: 'prostate cancer',
    conditionKeywords: ['prostate'], excludeIf: ['non-prostate'],
    note: '10/10 sample kept, 0 dropped. '
      + 'FOUND MECHANICALLY, NOT LIVE (2026-09-13, negation-collision scan run across every entry '
      + '— see .claude/trials_mapping_check.mjs): "Non-prostate Extrapulmonary Neuroendocrine '
      + 'Carcinoma" — the negation attaches to the whole word "prostate" itself (this entry\'s own '
      + 'plain conditionKeywords term, not a stem), so it is caught the same way "Non-Squamous" '
      + 'was for lusc. Checked before excluding: "non-prostate"/"non prostate" appears in exactly '
      + 'this one condition string across the full prostate-cancer parent corpus.',
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
    conditionKeywords: ['colorectal', 'colon', 'rectal'], excludeIf: ['non-colorectal'],
    note: '10/10 sample kept, 0 dropped. '
      + 'FOUND MECHANICALLY, NOT LIVE (2026-09-13, negation-collision scan run across every entry '
      + '— see .claude/trials_mapping_check.mjs): "Advanced Non-Colorectal Gastrointestinal '
      + 'Cancer" and a misspelled duplicate ("Gastointestinal") — both real basket-trial tags for '
      + 'GI cancers OTHER than colorectal, wrongly kept via the "colorectal" keyword IF this '
      + 'entry\'s query ever surfaced them. One excludeIf term ("non-colorectal") covers both, '
      + 'since the misspelling is in "Gastro(i)ntestinal", not in the shared "Non-Colorectal" '
      + 'prefix being matched. NOT (YET) A CONFIRMED LIVE EXPOSURE, UNLIKE ITS FOUR SIBLINGS '
      + '(luad/acinar/melanoma/seminoma, same pass): this entry\'s own excludeIf positive control '
      + 'FAILS — both strings were found only in the broader "colorectal cancer" PARENT corpus '
      + '(2,216 studies), neither appears among this entry\'s own 356-study "colorectal '
      + 'adenocarcinoma" NARROW query results (0/1296 distinct narrow-corpus condition strings '
      + 'match). Kept anyway as a zero-cost prophylactic term rather than removed: the string is '
      + 'real, the collision shape is real and already confirmed elsewhere in this same pass, and '
      + 'a narrow query\'s own returned set can shift as the trial registry grows — but this is '
      + 'disclosed as defensive, not as a fix for an observed defect, which the other four are.',
  },
  // CMUC (colon, 2026-09-14): "mucinous" is a confirmed overloaded term across this atlas's own
  // corpus (gastric/appendiceal/ovarian/pancreatic-IPMN entities all carry it — see data rule 32's
  // own discussion) — organ-anchored via requireAlso from the start, per the now-required
  // trials-mapping verification rule (data rule 36), not discovered after a false keep.
  cmuc: {
    query: 'colorectal mucinous adenocarcinoma', parent: 'colorectal cancer',
    conditionKeywords: ['mucinous'], requireAlso: ['colorectal', 'colon', 'rectal'],
    note: 'EMPTY-ANSWERED, LIVE-VERIFIED 2026-09-14, exhaustively: of the 62 studies currently '
      + 'recruiting/not-yet-recruiting/enrolling-by-invitation anywhere with "mucinous" in their '
      + 'own condition field, zero also carry a colorectal/colon/rectal-relevant condition — the '
      + 'overwhelming majority are pancreatic IPMN (a different disease entirely), with the rest '
      + 'ovarian/endometrial/breast/appendiceal. No query rewording changes this: it is a real gap '
      + 'in how trials are TAGGED, not a broken mapping — this registry does not tag colorectal '
      + 'trials by histologic subtype at the condition-field level (the same class of gap gdiff/'
      + 'gint/gmix already document for gastric Lauren type), not a claim that no trial anywhere '
      + 'would accept a mucinous-histology patient. A patient with this diagnosis is very likely '
      + 'still eligible for many of the broader trials this organ\'s own Colorectal adenocarcinoma '
      + 'entry surfaces, which enroll by diagnosis and biomarker rather than histologic subtype.',
  },
  // CLYMPH (colon, 2026-09-14): a hematologic malignancy, not a solid tumor — "diffuse large
  // B-cell lymphoma" trials are organized around molecular subtype and treatment history, not
  // primary anatomic origin (checked live below), a genuinely different registry-tagging
  // behavior from every solid tumor this organ's own two adenocarcinoma entries use.
  clymph: {
    query: 'diffuse large B-cell lymphoma', parent: 'diffuse large B-cell lymphoma',
    // 'lymphoma, large b-cell, diffuse' is a real, live-caught reordering — MeSH/NCI-thesaurus
    // "Type, Descriptor" convention (e.g. "Carcinoma, Non-Small-Cell Lung") — the registry's own
    // "Lymphoma, Large B-Cell, Diffuse" condition tag would otherwise fail the ordinary phrase
    // check entirely, found via a live 10-result sample before shipping, not after.
    conditionKeywords: ['diffuse large b-cell', 'dlbcl', 'lymphoma, large b-cell, diffuse'],
    note: 'LIVE-VERIFIED 2026-09-14: 8/10 sample kept, 2 correctly dropped (both real trials with '
      + 'no "DLBCL"/"diffuse large b-cell" wording anywhere in their own condition list — "Lymphoma, '
      + 'B-Cell" and "Relapsed or Refractory Aggressive B-Cell Non-Hodgkins Lymphoma" — neither '
      + 'confirms DLBCL specifically, so correctly excluded rather than assumed). '
      + 'EMPTY-ANSWERED for a GI/colon-anchored subset, exhaustively: '
      + 'of all 397 currently recruiting/not-yet-recruiting/enrolling-by-invitation DLBCL trials, '
      + 'zero carry a gastrointestinal/colon/colorectal/intestinal/bowel-relevant condition tag '
      + 'alongside DLBCL. Deliberately NOT organ-anchored via requireAlso, unlike this organ\'s own '
      + 'cmuc entry — a genuinely different situation, not the same mechanism applied '
      + 'inconsistently: DLBCL trials are organized by molecular subtype and treatment history, '
      + 'not primary anatomic origin (checked directly against a live 10-result sample of the '
      + 'unfiltered query — every kept result is a real, on-topic DLBCL trial regardless of where '
      + 'in the body the disease arose), so a patient with primary colonic DLBCL is a DLBCL '
      + 'patient first: the UNFILTERED list below is what a reader with this diagnosis actually '
      + 'needs, not a GI-narrowed subset that this registry\'s own tagging practice cannot produce '
      + 'anyway. This is the opposite lesson from cmuc\'s mucinous-adenocarcinoma entry, where '
      + 'other organs\' "mucinous" trials are genuinely NOT relevant to a colorectal patient — '
      + 'here, other primary sites\' DLBCL trials generally ARE.',
  },
  pdac: {
    query: 'pancreatic ductal adenocarcinoma', parent: 'pancreatic cancer',
    conditionKeywords: ['pancreatic', 'pancreas'],
    note: '8/10 sample kept, 2 dropped — both bare "Advanced Solid Tumor(s)" naming no organ, '
      + 'the same policy-consistent shape as luad\'s drops.',
  },
  // pacc/pnet/pcyst, 2026-09-13 (ordinary-organ batch, pancreas close). "Acinar" and
  // "neuroendocrine" are both real, confirmed collision risks across other organs (acinar cell
  // carcinoma of the salivary gland/breast/lung; neuroendocrine tumors of the lung/GI tract/
  // bladder — this same atlas already models a bladder neuroendocrine entity), so both get
  // requireAlso anchored to this organ's own terms. "IPMN"/"intraductal papillary mucinous" is
  // checked live below rather than assumed pancreas-specific by definition.
  pacc: {
    query: 'acinar cell carcinoma pancreas', parent: 'pancreatic cancer',
    conditionKeywords: ['acinar'], requireAlso: ['pancrea'],
    note: 'LIVE-VERIFIED 2026-09-13 (10 real results sampled, kept and dropped both read): '
      + 'requireAlso correctly excludes salivary-gland/breast/lung acinar-cell trials that reach '
      + 'the base "acinar" keyword check; 10/10 kept results are genuine pancreatic acinar cell '
      + 'carcinoma trials.',
  },
  pnet: {
    query: 'pancreatic neuroendocrine tumor', parent: 'neuroendocrine tumor',
    conditionKeywords: ['neuroendocrine', 'net'], requireAlso: ['pancrea', 'pnet', 'panNET'],
    excludeIf: ['extra-pancreatic', 'extrapancreatic'],
    note: 'MECHANICALLY FOUND, THEN LIVE-VERIFIED (2026-09-13, .claude/trials_mapping_check.mjs): '
      + 'the corpus-vocabulary signal found a real gap before any browser session could — the bare '
      + 'abbreviation "NET" (e.g. "Pancreatic NET", "Extra-Pancreatic NET (epNET)") is never '
      + 'covered by the spelled-out "neuroendocrine" keyword, the same bare-acronym shape as the '
      + 'seminoma keyword gap. Adding "net" alone would have wrongly KEPT "Extra-Pancreatic NET '
      + '(epNET)" — a trial explicitly about NON-pancreatic NETs, whose own condition string still '
      + 'contains "pancreatic" as a substring inside "Extra-Pancreatic" — caught before it shipped '
      + 'and closed with excludeIf. A residual, accepted under-inclusion, disclosed rather than '
      + 'chased further: a real trial titled around pancreatic NETs but registered under the bare '
      + 'condition "Neuroendocrine Tumors" (no organ qualifier in that field at all) is correctly '
      + 'excluded by the requireAlso anchor and stays excluded — the same organ-unspecified-basket '
      + 'trade-off this project already accepts elsewhere, not a defect in this mapping.',
  },
  pcyst: {
    query: 'IPMN pancreas', parent: 'pancreatic cancer',
    conditionKeywords: ['ipmn', 'intraductal papillary mucinous', 'papillary and mucinous'],
    note: 'MECHANICALLY FOUND, THEN LIVE-VERIFIED (2026-09-13, .claude/trials_mapping_check.mjs): '
      + 'the corpus-vocabulary signal found two real word-order variants the exact phrase '
      + '"intraductal papillary mucinous" missed — "Papillary and Mucinous Intraductal Tumours of '
      + 'the Pancreas" and "Papillary And Mucinous Intracanal Tumors of the Pancreas" (the second '
      + 'a registry variant spelling, "intracanal" for "intraductal") — both share the substring '
      + '"papillary and mucinous", added as a third keyword and closing both at once. A 10-result '
      + 'live sample kept 9/10, the one drop a genuinely unrelated gadolinium-contrast-media study '
      + 'that reached this query only via ClinicalTrials.gov\'s own broader text search, not via '
      + 'any condition this filter would keep.',
  },
  melanoma: {
    query: 'cutaneous melanoma', parent: 'melanoma',
    conditionKeywords: ['melanoma'], excludeIf: ['non-melanoma'],
    note: '10/10 sample kept, 0 dropped. Query/parent ratio 98% (586/595) — cutaneous melanoma '
      + 'is nearly all of what "melanoma" means in this registry at this scale, so the two '
      + 'queries nearly coincide; not a sign either query is wrong. '
      + 'FOUND MECHANICALLY, NOT LIVE (2026-09-13, negation-collision scan run across every entry '
      + '— see .claude/trials_mapping_check.mjs): five spelling/formatting variants of "Non-'
      + 'Melanoma Skin Cancer (NMSC)" — a real, extremely common oncology term of art naming '
      + 'basal-cell and squamous-cell skin cancer, i.e. everything skin-cancer that is NOT '
      + 'melanoma, the single most direct instance of this collision class the corpus produced. '
      + 'Checked before excluding: "non-melanoma"/"non melanoma" appears in exactly these five '
      + 'strings across the full (595-study) melanoma parent corpus, none of them a real '
      + 'cutaneous-melanoma trial.',
  },
  nsgct: {
    query: 'nonseminomatous germ cell tumor', parent: 'testicular cancer',
    conditionKeywords: ['non-seminomatous', 'nonseminomatous', 'non seminomatous', 'nsgct'],
    note: '10/12 live sample kept, 2 correctly dropped (one bare "Germ Cell Tumor" with no site '
      + 'qualifier, too ambiguous; one real cross-organ false positive caught before it shipped — '
      + 'see below). The first-draft keyword list included "nongerminomatous germ cell", added on '
      + 'the (wrong) assumption it was a testicular synonym; a live sample instead caught it '
      + 'matching NCT04684368, a CNS/pineal-region trial ("Central Nervous System '
      + 'Nongerminomatous Germ Cell Tumor," aka NGGCT, the standard PEDIATRIC-BRAIN-TUMOR term '
      + 'for this shape, not a testicular one) with zero testicular component. Removed the term '
      + 'entirely — every genuine testicular NSGCT trial in the live sample was already caught via '
      + '"non-seminomatous"/"nonseminomatous" anyway, so nothing was lost. Also checked and NOT '
      + 'used: bare "embryonal carcinoma"/"yolk sac"/"choriocarcinoma" — the same live sample '
      + 'showed these occurring as CNS/pineal histologic subtypes in that same trial, unrelated to '
      + 'testis.',
  },
  seminoma: {
    query: 'testicular seminoma', parent: 'testicular cancer',
    conditionKeywords: ['testicular', 'testis', 'germ cell', 'seminoma'],
    excludeIf: ['non-seminoma', 'non seminoma', 'non-seminomatous', 'non seminomatous'],
    note: 'FIRST DRAFT (keywords without "seminoma" itself) dropped 3 of 10 real results tagged '
      + 'bare "Seminoma" — the exact disease name, maximally on-topic — because the keyword '
      + 'list omitted the disease\'s own name. Caught by reading every drop\'s full conditions '
      + 'before trusting the count, not assumed clean; fixed by adding "seminoma", re-verified '
      + '10/10 kept. "germ cell" was checked against its most concerning real case (a 30-'
      + 'condition pediatric basket trial spanning ovarian AND testicular germ cell tumors) and '
      + 'found sound: its full condition list names "Stage I Testicular Seminoma" explicitly, so '
      + 'it is a genuine cross-organ basket inclusion, not a false match — "testicular"/"testis" '
      + 'alone would have kept it regardless of "germ cell". '
      + 'TWO MORE FOUND (2026-09-13, negation-collision scan run across every entry — see '
      + '.claude/trials_mapping_check.mjs): "Non-Seminoma Testicular Cancer", caught mechanically '
      + '(the negation attaches directly to the whole-word "seminoma" keyword). A SECOND, '
      + 'DIFFERENT-SHAPED GAP THE SCAN CANNOT SEE, found by hand while verifying the first: '
      + '"Metastatic Malignant Testicular Non-Seminomatous Germ Cell Tumor" — real, genuinely '
      + 'non-seminomatous, but kept via the "germ cell" keyword, a DIFFERENT keyword than the '
      + 'one the negation "Non-" actually attaches to ("Seminomatous", a morphological variant of '
      + '"seminoma" the scan\'s literal-keyword-adjacency test does not recognize as the same '
      + 'word). Disclosed as a real limitation of the mechanized check\'s own reach, not silently '
      + 'patched over: the scan tests one keyword\'s own exact text against strings that carry a '
      + 'positive match FOR THAT KEYWORD; it cannot yet catch a negation attached to a variant '
      + 'form, nor one attached to a keyword other than the one actually responsible for the '
      + 'keep. Both strings excluded here regardless, since a same-string excludeIf term needs '
      + 'only to match somewhere, not to be the term the scan itself flagged.',
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
  // mtc, 2026-09-13 (thyroid round): a REAL negation collision, live-caught before shipping, the
  // exact "Non-X" shape the lung round's excludeIf mechanism was built for (data rule 33) —
  // "Non-Medullary Thyroid Cancer" is a real, correctly-tagged condition string (naming ptc/ftc/
  // atc's own population, this organ's OTHER three entries), and it contains the word "thyroid"
  // just as validly as "Medullary Thyroid Carcinoma" does, so a bare conditionKeywords:['thyroid']
  // check alone would keep it. Caught on a live 10-result sample, not assumed from the query's
  // name: excludeIf fired on exactly this one string in this sample. "Kidney Medullary
  // Carcinoma"/"Renal Medullary Carcinoma" — a real, different-organ cancer entity sharing the
  // word "medullary" — were also checked directly: both appear ONLY in condition arrays that
  // never mention "thyroid" at all, so conditionKeywords:['thyroid'] alone already excludes them
  // without needing a same-string exclusion of its own.
  mtc: {
    query: 'medullary thyroid carcinoma', parent: 'thyroid cancer',
    conditionKeywords: ['thyroid'], excludeIf: ['non-medullary', 'non medullary'],
    note: '7/10 live sample kept, 3 dropped — 2 genuinely off-topic genitourinary baskets '
      + '("Kidney Medullary Carcinoma", "Renal Medullary Carcinoma", neither mentioning thyroid '
      + 'anywhere in the same study) and 1 real, live-caught collision: "Non-Medullary Thyroid '
      + 'Cancer" contains "thyroid" and would be a false keep without excludeIf — that string '
      + 'names this organ\'s OTHER three entries\' population, explicitly excluding this one.',
  },
  // atc, 2026-09-13: same live-sample discipline as mtc above; no negation-collision string
  // found for "anaplastic"/"thyroid" in this sample or in trials_mapping_check.mjs's own scan —
  // "Non-Melanoma Skin Cancer" appears once, in a basket trial whose SAME condition array also
  // separately lists "Thyroid Carcinoma, Anaplastic", so that study is kept via its own real
  // condition string, not via the unrelated skin-cancer one.
  atc: {
    query: 'anaplastic thyroid carcinoma', parent: 'thyroid cancer',
    conditionKeywords: ['thyroid'],
    note: '8/9 live sample kept, 1 dropped (a generic "Cancer Harboring BRAF Alterations"/glioma '
      + 'basket naming no thyroid condition anywhere). Several kept results are broad "Thyroid '
      + 'Cancer" or rare-cancer basket tags rather than anaplastic-specific ones — the same '
      + '"thyroid" keyword breadth this organ\'s own ptc/ftc entries already accept, not a defect. '
      + 'Corpus-vocabulary signal found one real, disclosed completeness gap and confirmed one '
      + 'near-miss stays safely excluded: the parent corpus contains a registry-side TYPO, '
      + '"Anaplastic Throid Carcinoma" (missing the "y"), which this filter currently drops since '
      + 'it lacks the literal substring "thyroid" — a minor, accepted gap in one mistyped '
      + 'condition string, not chased with a new keyword. "Breast Implant-Associated Anaplastic '
      + 'Large Cell Lymphoma" — a real, unrelated lymphoma sharing only the word "anaplastic" — '
      + 'is correctly excluded already, confirming conditionKeywords:[\'thyroid\'] rather than '
      + '[\'anaplastic\',\'thyroid\'] was the right choice.',
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
  // ---- Lungs, 2026-09-13 ("then Lungs" authoring) — three entries, three different collision
  // shapes, none of them the plain prostat-stem case: lusc needed BOTH a positive organ-anchor
  // (requireAlso) AND a negative same-string exclusion (excludeIf, "non-squamous" is a real,
  // live-caught false keep — "squamous" as a bare keyword matches inside "Non-Squamous" the same
  // way "small cell" matches inside "non-small cell"); sclc needed excludeIf alone, PLUS its own
  // acronym added to conditionKeywords after a live-caught miss ("SCLC, Limited Stage" has no
  // spelled-out "small cell" or "lung" in that string at all — the exact seminoma-bug shape,
  // caught live rather than assumed); lcc needed only a bare organ-anchor, and its own live
  // sample independently corroborates the entity's own instability finding (every single kept
  // result names large cell NEUROENDOCRINE carcinoma of the lung specifically — none is a
  // "classic"/NOS large cell carcinoma trial, consistent with data rule 33's own reclassification
  // finding that the classic entity has become vanishingly rare in modern practice).
  lusc: {
    query: 'lung squamous cell carcinoma', parent: 'lung cancer',
    conditionKeywords: ['squamous'], requireAlso: ['lung', 'pulmonary', 'nsclc', 'non-small cell', 'non small cell'],
    excludeIf: ['non-squamous', 'non squamous'],
    note: 'Checked live 2026-09-13: organ-anchored query returns 10 results, 3/10 kept by '
      + 'requireAlso alone — but ONE of those 3 ("Osimertinib With or Without Bevacizumab…", '
      + 'conditions including "Lung Non-Squamous Non-Small Cell Carcinoma") was a real false '
      + 'keep caught live: the bare keyword "squamous" matches the word "Squamous" inside '
      + '"Non-Squamous" too, the exact same word-boundary shape as sclc\'s own "non-small" '
      + 'problem below, just running the opposite direction (a subtype term matching its own '
      + 'negation rather than a disease name matching its own negation). Fixed with excludeIf '
      + '(same mechanism sclc uses); re-verified live: 2/10 kept, both genuine squamous NSCLC '
      + '("Squamous Non-Small Cell Lung Cancer", "Glypican-3 (GPC3)-Positive Squamous '
      + 'Non-small Cell Lung Cancer").',
  },
  sclc: {
    query: 'small cell lung cancer', parent: 'lung cancer',
    conditionKeywords: ['small cell', 'lung', 'sclc'],
    excludeIf: ['non-small', 'non small', 'non - small', 'non-lung'],
    note: 'Checked live 2026-09-13: the bare string "small cell lung cancer" is a literal '
      + 'substring of "non-small cell lung cancer" — a same-ORGAN collision, not the cross-organ '
      + 'vocabulary-sharing shape every prior requireAlso entry in this file handles. A first '
      + 'live sample confirmed the contamination directly: 7 of 10 results were real NSCLC '
      + 'trials kept by naive word-boundary matching alone. Fixed with excludeIf (["non-small", '
      + '"non small"], keywordRegex-matched, not stemRegex — a complete two-word phrase, not a '
      + 'stem). A SECOND live-caught gap in the same pass: "A Phase II Study of Tislelizumab '
      + 'Plus Anlotinib…" (conditions: ["SCLC, Limited Stage"]) was WRONGLY dropped by the '
      + 'original ["small cell","lung"] keyword list — the disease\'s own bare acronym, with '
      + 'neither "small cell" nor "lung" spelled out in that string at all, the exact seminoma-'
      + 'bug shape (data rule 22). Fixed by adding "sclc" to conditionKeywords. Re-verified live '
      + 'with both fixes together: 4/10 kept, all four genuine ("Small Cell Lung Cancer" x2, '
      + '"Small Cell Lung Cancer Extensive Stage", "SCLC, Limited Stage"). '
      + 'TWO MORE FOUND MECHANICALLY, NOT LIVE (2026-09-13, the negation-collision scan — see '
      + '.claude/trials_mapping_check.mjs): "Non - Small Cell Lung Cancer NSCLC" (a third real '
      + 'spacing variant, space-hyphen-space, that neither prior excludeIf term covered — the '
      + 'exact class the scan exists to close before a human has to find it live) and "Small Cell '
      + 'Carcinomas of Non-lung Origin" (real extrapulmonary small cell carcinoma — arising outside '
      + 'the lung entirely — wrongly kept because "small cell" alone satisfies this entry\'s OR-'
      + 'matched conditionKeywords with no requireAlso anchor forcing "lung" too). Checked before '
      + 'excluding: "non-lung"/"non lung" appears in exactly one condition string across the full '
      + '3,180-study parent corpus, so this exclusion cannot drop a real SCLC trial that merely '
      + 'mentions a non-lung metastatic site in passing.',
  },
  lcc: {
    query: 'large cell lung carcinoma', parent: 'lung cancer',
    conditionKeywords: ['large cell'], requireAlso: ['lung', 'pulmonary', 'nsclc'],
    note: 'Checked live 2026-09-13: 6/10 kept, all six correctly requiring "large cell" and an '
      + 'organ anchor in the same condition string (e.g. "Large Cell Neuroendocrine Carcinoma of '
      + 'the Lung"). A real, independent corroboration of this entry\'s own below-floor blurb '
      + '(data rule 33): every one of the six kept results names large cell NEUROENDOCRINE '
      + 'carcinoma specifically — none is a "classic"/NOS large cell carcinoma trial with no '
      + 'neuroendocrine qualifier — consistent with modern clinical-trial activity having moved '
      + 'to the better-defined LCNEC entity while classic LCC has become vanishingly rare, the '
      + 'same finding Rekhtman et al. 2013 documents in surgical pathology practice. 4/10 '
      + 'dropped, all real unrelated multi-tumour baskets naming "large cell" without an organ '
      + 'anchor in the same string.',
  },
  // ---- Breast, 2026-09-13 ("then breast, histologic axis" authoring, phaseC_design.md §17) —
  // negation scan run FIRST per the standing rule this organ's own lung round wrote: "no special
  // type"/NST turned out NOT to be the collision this pass found (checked directly: no live
  // condition string anywhere in the breast-cancer parent corpus reads "non-special type" or
  // "non-NST" — the scan and a full-text search both came back empty). The real, live-caught
  // collision here is a DIFFERENT, NEW shape neither the negation scan nor any prior organ's own
  // bugs anticipated: idc and ilc are TWO SIBLING ENTRIES OF THE SAME ORGAN, and both entities'
  // own registry names literally contain the word "Breast" — so a bare organ-anchor keyword
  // (['breast'], this file's own established minimal form for a single-cancer organ like tnbc)
  // cannot discriminate BETWEEN the two siblings the way it discriminates between organs. Found
  // by hand, reading all 10 of idc's own live-sampled results: NCT07613151 ("Lobular Breast
  // Carcinoma", the study's ONLY condition string) and NCT05919108 ("Neoadjuvant Neratinib in
  // Stage I-III HER2-Mutated Lobular Breast Cancer") are both real, ILC-EXCLUSIVE trials that a
  // bare ['breast'] keyword would keep for idc, since "Lobular Breast Carcinoma" and "Anatomic
  // Stage I Breast Cancer" both independently contain "breast".
  idc: {
    query: 'invasive ductal carcinoma breast', parent: 'breast cancer',
    conditionKeywords: ['breast'], excludeIf: ['lobular', 'in situ'],
    note: 'Checked live 2026-09-13, all 10 results read by hand. Real, live-caught false keeps '
      + 'fixed by excludeIf: NCT07613151 ("Lobular Breast Carcinoma", its only condition string) '
      + 'and NCT06903468 ("Ductal Carcinoma in Situ" as one of two strings, correctly dropped on '
      + 'that string — the sibling "Breast Cancer" string in the same study still independently '
      + 'keeps it via broadening, matching this file\'s own established bare-organ-tag acceptance '
      + '(tnbc/ccrcc/hgsoc precedent), since the study is a real surgical-technique trial not '
      + 'obviously restricted to non-invasive disease). DISCLOSED, NOT SILENTLY PATCHED — a real '
      + 'gap the excludeIf mechanism structurally cannot close: NCT05919108 is an ILC-EXCLUSIVE '
      + 'trial (title: "...Lobular Breast Cancer") that stays wrongly kept, because its own '
      + 'condition array carries THREE purely generic AJCC-stage strings ("Anatomic Stage I/II/III '
      + 'Breast Cancer") alongside its one lobular-specific tag, and each of those generic strings '
      + 'independently satisfies conditionKeywords with no "lobular" text for excludeIf to catch — '
      + 'filterByCondition tests each condition string independently, by design, so a disqualifying '
      + 'term on one string can never veto a different, independently-passing string in the same '
      + 'study\'s array. Same limitation class as seminoma\'s own disclosed "germ cell" gap: real, '
      + 'found by hand, not fixable by tuning this entry\'s own keyword lists further. Checked and '
      + 'NOT found in the reverse direction (a pure-ductal trial leaking into ilc\'s own results) '
      + 'in this same live sample — see ilc\'s note. '
      + 'CORPUS-VOCABULARY SIGNAL read: "Invasive Mammary Carcinoma" (no "breast" substring) flagged as a '
      + 'rejected name-token hit — checked against both of its real live occurrences in the full parent '
      + 'corpus and found harmless both times, not a miss: each of the two studies carrying that tag '
      + '(NCT05693766, NCT07555210) also carries an independent sibling condition string containing '
      + '"breast" ("Metastatic Breast Cancer", "Breast Cancer (Triple Negative Breast Cancer (TNBC))"), '
      + 'so both are already kept via that string regardless.',
  },
  ilc: {
    query: 'invasive lobular carcinoma', parent: 'breast cancer',
    conditionKeywords: ['breast', 'lobular'], excludeIf: ['in situ'],
    note: 'Checked live 2026-09-13, all 10 results read by hand. "lobular" ADDED to '
      + 'conditionKeywords after a real live-caught miss — the seminoma-bug shape recurring a '
      + 'fourth time (data rules 22/32/33): NCT07229417\'s condition string, "Triple Negative '
      + 'Invasive Lobular Carcinoma", contains no "breast" substring at all and would have been '
      + 'wrongly dropped under a bare ["breast"] keyword list, despite being a real, on-topic ILC '
      + 'trial (and a real instance of this atlas\'s own declared TNBC/histologic non-partition, '
      + 'phaseC_design.md §17 — a tumor can be both). "in situ" added prophylactically (the LCIS '
      + 'analog of idc\'s own "Ductal Carcinoma in Situ" collision) though NOT confirmed live in '
      + 'this sample — no bare LCIS-only condition string was fetched to test against; kept as a '
      + 'same-string guard against the risk rather than left unguarded on the strength of one '
      + 'clean sample. Checked and NOT found: a ductal-exclusive trial leaking into this entry\'s '
      + 'own live sample via a generic breast tag — none of the 10 fetched results was '
      + 'ductal-only, so no excludeIf for "ductal" is added on unconfirmed suspicion alone, per '
      + 'this file\'s own checked-not-assumed standard.',
  },
  // blnec/blscc/bladc, 2026-09-13 (ordinary-organ batch, bladder): all three share the SAME
  // collision shape UC's own "urothelial" keyword never had to guard against — "small cell",
  // "squamous", and "adenocarcinoma" are each real, overloaded terms used across many other
  // organs already active in this atlas. requireAlso:['bladder'] anchors each to the SAME
  // declared condition string, the mechanism already proven for pneuro/pductal/psignet/pmuc.
  blnec: {
    query: 'small cell carcinoma of the bladder', parent: 'bladder cancer',
    conditionKeywords: ['small cell', 'neuroendocrine', 'nec'], requireAlso: ['bladder'],
    note: 'CORPUS-VOCABULARY SIGNAL live-caught a real gap before shipping (2026-09-13): a bare '
      + '["small cell"] keyword missed real, on-topic parent-corpus condition strings that use '
      + 'this entity\'s OWN display name instead — "Bladder Neuroendocrine Carcinoma", '
      + '"Neuroendocrine Carcinoma of the Bladder", "NEC of the Bladder", "Metastatic Bladder '
      + 'Large Cell Neuroendocrine Carcinoma" — the same seminoma/sclc-class miss (data rules '
      + '22/33), caught by the signal rather than a hand read this time. "neuroendocrine" and '
      + 'the bare acronym "nec" both added; requireAlso:[\'bladder\'] is what makes the bare '
      + '3-letter acronym safe (same-string co-occurrence, not a bare substring scan).',
  },
  blscc: {
    query: 'squamous cell carcinoma of the bladder', parent: 'bladder cancer',
    conditionKeywords: ['squamous'], requireAlso: ['bladder'],
    note: 'LIVE-VERIFIED 2026-09-13, exhaustive fetch (28 total) read via the real production '
      + 'filter, not a page-limited approximation: 5/28 genuinely kept, 23/28 correctly dropped '
      + '— every dropped string is a multi-condition basket trial listing "squamous cell '
      + 'carcinoma" (lung/head-neck/cervical/skin/esophageal) and "bladder cancer" as SEPARATE '
      + 'declared conditions, never as one string, so requireAlso correctly excludes them. One '
      + 'kept result independently hand-verified (NCT06041503: "Adenocarcinoma of the Bladder", '
      + '"Squamous Cell Carcinoma of the Bladder", "Testicular Germ Cell Tumors" — a real '
      + 'multi-histology trial genuinely studying both this organ\'s SCC and ADC entries at '
      + 'once); no mixed urothelial-carcinoma-with-squamous-differentiation string reached the '
      + 'kept set (this entity\'s own WHO-pure-SCC criterion holds in the sample read).',
  },
  bladc: {
    query: 'bladder adenocarcinoma', parent: 'bladder cancer',
    conditionKeywords: ['adenocarcinoma'], requireAlso: ['bladder'],
    note: 'LIVE-VERIFIED 2026-09-13, exhaustive fetch (61 total) read via the real production '
      + 'filter. "adenocarcinoma" is this atlas\'s single most overloaded bare keyword (already '
      + 'active for colon/lungs/pancreas/stomach/prostate); requireAlso correctly dropped every '
      + 'unrelated-organ adenocarcinoma hit, including basket-trial condition arrays listing '
      + 'several organs\' own adenocarcinomas as separate strings, and a 42-condition population-'
      + 'screening trial (NCT05334069) whose sheer breadth made it the sharpest test of the '
      + 'same-string requirement in this whole batch. 4/61 genuinely kept; the one independently '
      + 'hand-verified (NCT06041503, shared with blscc above) is not urachal-specific, '
      + 'consistent with this entity modeling non-urachal disease (see the organ file\'s own '
      + 'entity-choice note) — no same-string "urachal" excludeIf was needed since no kept '
      + 'string names urachus at all in this sample.',
  },
  bcc: {
    query: 'basal cell carcinoma', parent: 'skin cancer',
    conditionKeywords: ['basal cell'],
    note: 'LIVE-VERIFIED 2026-09-13 (.claude/trials_mapping_check.mjs bcc): 71 total, 62 kept by '
      + 'the narrow filter, 10-result sample 10/10 kept genuine. Corpus-vocabulary scan found one '
      + 'real near-miss the keyword\'s own specificity already handles correctly: "Risk of Skin '
      + 'Cancers Except Basal-cell Carcinomas" shares the "basal" token but its condition string '
      + 'spells the disease with a hyphen ("Basal-cell"), which the two-word substring "basal '
      + 'cell" does not match — confirmed still in the rejected set, not a live gap. '
      + 'Negation-collision signal: zero matches.',
  },
  scc: {
    query: 'cutaneous squamous cell carcinoma', parent: 'skin cancer',
    conditionKeywords: ['squamous cell'], requireAlso: ['skin', 'cutaneous'],
    note: 'LIVE-VERIFIED 2026-09-14 (.claude/trials_mapping_check.mjs scc): 88 total, requireAlso ' +
      'keeps 71. 10-result sample 8/10 kept, 2 correctly dropped (both real multi-organ basket ' +
      'trials — NCT05059444 lists 17 unrelated conditions including bladder/lung/breast/gastric/ ' +
      'pancreatic/ovarian carcinomas; NCT05136196 pairs melanoma with head-and-neck SCC — neither ' +
      'is cutaneous-SCC-specific, the same named-broadening shape ccrcc\'s own CD70 case already ' +
      'established). Corpus-vocabulary scan surfaced only real, already-excluded near-misses ' +
      '(bare "cutaneous"/"squamous" tokens inside melanoma/lung/head-neck strings that do not ' +
      'contain the literal two-word "squamous cell" substring this filter requires). ' +
      'Negation-collision signal: zero matches.',
  },
  mcc: {
    query: 'Merkel cell carcinoma', parent: 'skin cancer',
    conditionKeywords: ['merkel cell'],
    note: 'LIVE-VERIFIED 2026-09-14 (.claude/trials_mapping_check.mjs mcc): 42 total, 39 kept by the ' +
      'narrow filter. 10-result sample 10/10 kept genuine. "Merkel cell carcinoma" is a ' +
      'disease-specific two-word term with no cross-organ overload risk this atlas has hit ' +
      'elsewhere (unlike "adenocarcinoma"/"squamous cell"/"small cell"/"clear cell") — no ' +
      'requireAlso needed. Corpus-vocabulary signal: 0 of 4,271 rejected strings share the ' +
      '"merkel" name-token. Negation-collision signal: zero matches.',
  },
  astro: {
    query: 'astrocytoma IDH-mutant', parent: 'brain cancer',
    conditionKeywords: ['astrocytoma'], requireAlso: ['idh'],
    note: 'LIVE-VERIFIED 2026-09-14 (.claude/trials_mapping_check.mjs astro): 25 total, 18 kept. ' +
      '10-result sample 8/10 kept, 2 correctly dropped — both real IDH-WILDTYPE glioblastoma ' +
      'trials whose OWN declared condition strings either never mention "astrocytoma" at all ' +
      '(NCT07708961) or, where a separate "Astrocytoma, Grade III" condition string does appear ' +
      'alongside an IDH-wildtype-glioblastoma one in the same trial (NCT05765812), that specific ' +
      'string carries no IDH designation of its own — requireAlso correctly declines to guess ' +
      'which of two SEPARATE declared conditions the astrocytoma one belongs with. Corpus-' +
      'vocabulary scan surfaced two real near-misses ("Glioblastoma, IDH-mutant"/"IDH-mutant ' +
      'Gliomas") already correctly excluded — neither contains the literal word "astrocytoma". ' +
      'Negation-collision signal: zero matches.',
  },
  odg: {
    query: 'oligodendroglioma', parent: 'brain cancer',
    conditionKeywords: ['oligodendroglioma'],
    note: 'LIVE-VERIFIED 2026-09-14 (.claude/trials_mapping_check.mjs odg): 29 total, 24 kept. ' +
      '10-result sample 8/10 kept, 2 correctly dropped — both real trials the search surfaced by ' +
      'free-text relevance despite neither one\'s own DECLARED condition strings containing the ' +
      'word "oligodendroglioma" anywhere (a low-grade-glioma trial and a pediatric cerebellar-' +
      'tumor trial listing "Astrocytoma"/"Astrocytoma, Cerebellar" among many other conditions, ' +
      'never oligodendroglioma) — confirming the filter checks declared conditions specifically, ' +
      'not whatever text the search engine matched elsewhere. Corpus-vocabulary signal: 0 of ' +
      '2,218 rejected strings share the "oligodendroglioma" name-token. Negation-collision ' +
      'signal: zero matches.',
  },
  menin: {
    query: 'meningioma', parent: 'brain cancer',
    conditionKeywords: ['meningioma'],
    note: 'LIVE-VERIFIED 2026-09-14 (.claude/trials_mapping_check.mjs menin): 82 total, 76 kept. ' +
      '10-result sample 9/10 kept, 1 correctly dropped — a Neurofibromatosis Type 2 natural-' +
      'history study (NCT00598351) whose own declared condition is "Neurofibromatosis" alone, ' +
      'not meningioma, even though NF2-syndrome patients commonly develop meningiomas (this ' +
      'entity\'s own real, cited, ~1% germline-NF2-syndrome association — see this entry\'s own ' +
      'trunk note) — the study itself is not evidently about meningioma as a condition. ' +
      '"Meningioma" carries no cross-organ overload risk this atlas has hit elsewhere. ' +
      'Negation-collision signal: zero matches.',
  },
};

// ---- the fetch-time filter (design doc §1b) --------------------------------------------------
// THE QUERY IS NOT THE GUARD — THE RETURNED CONDITIONS ARE. A query can return something
// different tomorrow than it did today: verified live, not assumed — the ccRCC query above
// returned a completely different 8-study set one day after the mapping was first validated,
// zero NCT-id overlap with the set the mapping was checked against. What is checkable on every
// fetch, against a corpus that keeps moving, is what each returned study's OWN declared
// conditions say it is about — never what the query asked for or how the study surfaced.
// Exported (2026-09-13, alongside stemRegex) for the same reason: .claude/trials_mapping_check.mjs
// now validates excludeIf terms too, and excludeIf is matched through THIS function, not
// stemRegex — a checker importing only stemRegex would be testing the wrong construction for an
// excludeIf positive control.
export function keywordRegex(keywords){
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
// `excludeIf` (2026-09-13, SCLC's own mapping) — a DIFFERENT collision shape than requireAlso's,
// not a copy of it. requireAlso is a cross-organ vocabulary problem (a subtype term shared with
// an unrelated disease elsewhere in the body); this is same-organ SUBSTRING CONTAINMENT — the
// literal string "small cell lung cancer" sits inside "non-small cell lung cancer" with every one
// of "small"/"cell"/"lung"/"cancer" still individually whole-word-bounded, so no positive
// organ-anchor can ever separate them (an NSCLC trial names "lung" too). Verified live 2026-09-13:
// a bare 'small cell lung cancer' query returns real NSCLC trials as ~13 of 15 results (e.g.
// "Non-small Cell Lung Cancer", "Non Small Cell Lung Cancer, Brain Metastasis") purely because
// "small cell" and "lung" both survive word-boundary matching inside "non-small cell lung
// cancer". Same-string logic, same as requireAlso, but INVERTED: a condition string that would
// otherwise match `keywords` (+`requireAlso`) is instead REJECTED if that SAME string also
// contains an excludeIf term — "non-small"/"non small" is a complete, well-formed two-word
// phrase (not a stem needing prefix-only matching the way 'prostat' is), so this reuses
// keywordRegex's own whole-word-bounded construction rather than stemRegex's. A study with a
// SEPARATE condition string that matches cleanly (no exclude term in THAT string) is still kept
// via that string — excludeIf disqualifies one condition string's own match, not the whole study.
export function filterByCondition(studies, keywords, requireAlso, excludeIf){
  const re = keywordRegex(keywords);
  const re2 = requireAlso ? stemRegex(requireAlso) : null;
  const re3 = excludeIf ? keywordRegex(excludeIf) : null;
  const kept = [], dropped = [];
  studies.forEach(s=>{
    const conds = studyConditions(s);
    const matches = conds.some(c=>{
      const base = re2 ? (re.test(c) && re2.test(c)) : re.test(c);
      return base && !(re3 && re3.test(c));
    });
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
  const { kept, dropped } = filterByCondition(studies, entry.conditionKeywords, entry.requireAlso, entry.excludeIf);
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
