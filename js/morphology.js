// Phase A — tumour-morphology mapping: DATA AND PURE PREDICATES, deliberately with no `three`
// import, because .claude/margin_reserve_check.js loads this file under node (copied to an .mjs
// so node parses it as ESM, the same trick syntax_check.sh uses) and asserts its one property.
//
// THE RULE THIS MODULE IMPLEMENTS is the uncharacterised-margin default, ratified 2026-09-09 in
// .claude/phaseA_mapping.md (read part 2 there; do not re-derive it here). In one paragraph: an
// entry whose gross MARGIN category is a recorded negative, or whose source is not yet read,
// renders ONE SHARED RESERVED FORM — the same parameters and the same seed on every such entry —
// on an axis the cited categories never use, plus a non-optional DOM badge and label. The form
// is a MODE, not a value: cited categories live on the spike scale (spikeCount ≥ 1, sharpness,
// spikeLength) and, where they undulate, inside CITED_FREQ_BAND; the reserved form has no
// spikes at all and undulates inside RESERVED_AXIS.band, which no cited category may enter. A
// midpoint on the spike scale was the proposal and was rejected at ratification: a midpoint is a
// value and reads as "intermediate margin", a claim the negative declined to make.
//
// THE TESTABLE PROPERTY: the reserved form must be UNREACHABLE from any cited category's
// parameter range. `reservedViolations` below is that predicate; the battery member runs it.
// The orthogonal axis satisfies it for free where a midpoint never can — which is why the
// axis is reserved, not a point.
//
// MAGNITUDES ARE ILLUSTRATIVE BY THE EPISTEMIC SPLIT (the category is cited; the magnitude is
// not): every number in RESERVED_MARGIN and MASS_RADIUS_FRACTION is a design value chosen for
// legibility and disclosed in #disclaimer. Nothing here is measured from a patient.
//
// BUILD ORDER (user ruling, 2026-09-09): the reserved default renders BEFORE any cited category
// is wired, so it fixes the axis the cited categories must then avoid. MARGIN_CATEGORIES is
// therefore EMPTY at birth, on purpose. When a cited category is wired: add it there with ranges
// inside CITED_FREQ_BAND, flip its entry's status below from 'cited' (recorded, not yet rendered)
// to a category name, and let margin_reserve_check prove the reserved form is still unreachable.

// The knobs organicSpiculate takes (js/viewer.js). Listed so a category can be checked for a
// knob it forgot to bound: an unbounded knob is a range of everything, and everything reaches.
export const MARGIN_KNOBS = Object.freeze(['amplitude', 'freq', 'spikeCount', 'spikeLength', 'sharpness']);

// THE RESERVED AXIS: gentle uniform undulation at a frequency no cited category uses. Existing
// cited-side geometry undulates at 4.2 (site blobs) and 6.5 (the procedural ovary), both inside
// CITED_FREQ_BAND; the reserved band sits well below with a gap, so a range that drifts toward
// the band fails the check before it touches it.
export const RESERVED_AXIS = Object.freeze({ knob: 'freq', band: Object.freeze([1.6, 2.4]) });
export const CITED_FREQ_BAND = Object.freeze([3.5, 9.0]);

// THE RESERVED FORM — one shared parameter set AND seed, so recurrence is recognisable.
// spikeCount 0 means organicSpiculate contributes no fingers at all: the form is undulation only.
export const RESERVED_MARGIN = Object.freeze({
  // amplitude 0.24, the third value. 0.10 read as a smooth sphere in the first live capture; 0.18 read
  // smooth again at the default framing when set beside the first wired category (PTC, 2026-09-09) —
  // and smooth is "circumscribed", the very misread the rule exists to prevent. THE COLLISION RULE moved
  // THIS form, not PTC's: these values are illustrative and have no citation to violate. Legibility is
  // what the magnitude is chosen for; the undulation stays uniform and inside the reserved band.
  mode: 'reserved', amplitude: 0.24, freq: 2.0, seed: 3.7, spikeCount: 0, spikeLength: 0, sharpness: 0,
});

// Cited margin categories → parameter RANGES. EMPTY AT BIRTH (see BUILD ORDER above). Shape:
//   circumscribed: { amplitude:[0.02,0.06], freq:[3.5,5.0], spikeCount:[0,0], spikeLength:[0,0], sharpness:[0,0] }
// Every range must lie inside CITED_FREQ_BAND on freq and must exclude the reserved form.
// WIRING PROCEDURE, PER CATEGORY (user ruling, 2026-09-09) — you are on the line it applies to:
//   1. add the category's ranges here, inside CITED_FREQ_BAND, and flip its entries' MARGIN_STATUS;
//   2. run .claude/margin_reserve_check.js — that proves PARAMETER DISJOINTNESS, nothing more;
//   3. CAPTURE AND LOOK, this category beside the reserved form. Parameter disjointness does not
//      imply PERCEPTUAL DISTINCTNESS: at amplitude 0.10 the reserved form passed the check and read as
//      circumscribed. Each category wired narrows the perceptual space the reserved form must stay
//      distinct from, and only the parametric half is gated — so the look happens here, per category,
//      not once when all nine are in. Nothing gates looking; that is why this is written on the line.
//   4. RECORD THE LOOK IN EVIDENTIARY FORM (user ruling, 2026-09-09), in the wiring commit's message
//      and the mapping document's status log: (a) the capture — the exact command
//      `node .claude/capture_organs.js <outDir> <Organ>...` and the commit it ran at, which together
//      regenerate the image (never a /tmp path: a scratch location cannot keep the retrievability a
//      path promises); (b) the TWO FORMS NAMED — this category on its entry, the reserved form on an
//      uncharacterised entry; (c) WHAT SPECIFICALLY DISTINGUISHED THEM, checkable by opening the
//      image — "PTC's spiculation reads as directional; the reserved undulation reads as uniform" is
//      checkable, "verified distinct" is not and is what a tired reader writes at the end of a wiring
//      commit. A look recorded as a sentence about what someone DID, silent about what they COMPARED,
//      is the annotation shape that spent three days over-claiming in this repo.
export const MARGIN_CATEGORIES = Object.freeze({
  // FIRST CATEGORY WIRED (2026-09-09), chosen as the HARDEST perceptual case on the user's ruling: it sits
  // closest to the reserved undulation. Category cited (R17, the in-atlas StatPearls Papillary Thyroid
  // Carcinoma chapter, NBK536943, Gross Findings: "Grossly, PTC typically presents as an invasive neoplasm
  // with poorly defined margins, a firm consistency, and a granular white-cut surface."); every number
  // below is illustrative magnitude. "Poorly defined" is rendered as an INDISTINCT EDGE — many short,
  // broad-based projections over fine granular noise — and deliberately NOT as long fingers, which would
  // be a spiculated category the citation does not support. THE COLLISION RULE (user, 2026-09-09): if this
  // form and the reserved form collide perceptually, the RESERVED form moves; these values are never pushed
  // sharper to flatter the render, because that would invent magnitude the citation does not carry.
  poorlyDefined: Object.freeze({
    label: 'poorly defined',
    ranges: Object.freeze({ amplitude: [0.10, 0.16], freq: [5.0, 7.0], spikeCount: [10, 14], spikeLength: [0.10, 0.18], sharpness: [4, 7] }),
    render: Object.freeze({ amplitude: 0.13, freq: 6.0, seed: 5.1, spikeCount: 12, spikeLength: 0.14, sharpness: 5.5 }),
    badgeSource: 'StatPearls, Papillary Thyroid Carcinoma',
    badgeQuote: 'typically presents as an invasive neoplasm with poorly defined margins',
  }),
  // SECOND CATEGORY WIRED (2026-09-09), on the user's re-aimed hardest-first: the reserved form's residual
  // runs toward CIRCUMSCRIBED, so the binding constraint is seminoma's well-circumscribed nodule. Category
  // cited three ways, all read at source: Case Rep Urol 2019 (PMC6906820, PMID 31871817, literature review):
  // "Macroscopically, seminomas are well circumscribed, tan to pale yellow lesions with necrotic or
  // hemorrhagic foci."; Front Oncol 2026 (PMC13218944, introduction): "typically ... presents as a
  // well-circumscribed solid intratesticular nodule"; Acad Pathol 2022 (PMC9162935): "grossly characterized
  // as well-circumscribed, tan-white, and homogeneous". Rendered as a SMOOTH, SHARPLY BOUNDED NODULE and
  // nothing more, because the citation says nothing more. THE COLLISION RULE applies here in full: this
  // category has nothing to give; if it and the reserved form do not separate, the reserved form moves —
  // or, if the reserved form has nowhere left to go, the badge carries more weight (mapping document).
  wellCircumscribed: Object.freeze({
    label: 'well circumscribed',
    ranges: Object.freeze({ amplitude: [0.0, 0.05], freq: [3.5, 5.5], spikeCount: [0, 0], spikeLength: [0, 0], sharpness: [0, 0] }),
    render: Object.freeze({ amplitude: 0.03, freq: 4.5, seed: 7.3, spikeCount: 0, spikeLength: 0, sharpness: 0 }),
    badgeSource: 'Case Reports in Urology 2019, literature review',
    badgeQuote: 'Macroscopically, seminomas are well circumscribed',
  }),
});

// The illustrative mass colour — UNSOURCED and disclosed in #disclaimer. One colour for every
// reserved mass, for the same reason as one form: sameness is what a placeholder looks like.
export const MASS_COLOUR = 0xa89a8c;
// Mass radius as a fraction of the organ's bounding radius (magnitude, illustrative). 0.22, from 0.16:
// at 0.16 a mass was a few dozen pixels at the default framing and neither form's edge was legible —
// a presentation knob shared by EVERY mass, so raising it changes no category's form.
export const MASS_RADIUS_FRACTION = 0.22;

// Per active entry: the MARGIN half's status in the Phase A ledger (.claude/phaseA_mapping.md
// status log and the manifest's `_phaseA_citations`, items R1–R19 and the in-atlas harvest).
//   'uncharacterised' — a recorded NEGATIVE: renders the reserved form + the honest label.
//   'unread'          — source not yet read (gated or second-tier): renders the reserved form +
//                       a label saying so; resolves to a category or to 'uncharacterised' later.
//   'cited'           — a category is recorded (or seeded in-atlas) but NOT YET RENDERED: draws
//                       nothing until the category is wired, so no placeholder ever stands in for
//                       a cited shape (build order: reserved default first, cited categories next).
export const MARGIN_STATUS = Object.freeze({
  hgsoc:    { status: 'uncharacterised', ref: 'R13 — the source itself says the surface is variable' },
  clear:    { status: 'uncharacterised', ref: 'R15 — no margin-character category in the source' },
  luad:     { status: 'uncharacterised', ref: 'R7 — pre-registered negative, fired' },
  crc:      { status: 'uncharacterised', ref: 'R5 — margin subsumed by the cited growth form' },
  ccrcc:    { status: 'unread',          ref: 'R3 — blocked-to-tooling (PathologyOutlines gated)' },
  gdiff:    { status: 'unread',          ref: 'second tier — stomach margin not yet read' },
  uc:       { status: 'unread',          ref: 'second tier — bladder margin not yet read' },
  tnbc:     { status: 'cited',           ref: 'harvest — pushing margin (Livasy), not yet rendered' },
  hcc:      { status: 'cited',           ref: 'R11 — named divergence with counts, not yet rendered' },
  gbm:      { status: 'cited',           ref: 'harvest — diffusely infiltrative, not yet rendered' },
  acinar:   { status: 'cited',           ref: 'harvest — seeded (infiltrating patterns), not yet rendered' },
  pdac:     { status: 'cited',           ref: 'R1 — poorly delineated, not yet rendered' },
  melanoma: { status: 'cited',           ref: 'R9 — irregular border (clinical surface), not yet rendered' },
  seminoma: { status: 'cited', category: 'wellCircumscribed', ref: 'harvest — well circumscribed (PMC6906820 general statement; PMC13218944 typically; PMC9162935), RENDERED second, 2026-09-09' },
  ptc:      { status: 'cited', category: 'poorlyDefined', ref: 'R17 — poorly defined margins, RENDERED (first category wired, 2026-09-09)' },
  ftc:      { status: 'cited',           ref: 'harvest — seeded (encapsulated), not yet rendered' },
});
export const MARGIN_STATUSES = Object.freeze(['uncharacterised', 'unread', 'cited']);

// Which hotspot anchors the mass: the organ's own cited "arises here" structure, by index into
// ORGAN_DETAILS[key].hotspots. The label in each comment is what the index must keep pointing at;
// margin_reserve_check verifies the chosen hotspot's text (or the organ description) speaks of
// origin, so a reordered hotspot list fails loudly rather than moving the mass.
export const ORIGIN_HOTSPOT = Object.freeze({
  ovary: 0,    // Surface epithelium
  brain: 0,    // White matter
  lungs: 1,    // Alveoli
  breast: 0,   // Ducts
  liver: 0,    // Hepatocytes
  kidneys: 0,  // Cortex
  prostate: 0, // Peripheral zone
  colon: 0,    // Mucosa & glandular epithelium
  pancreas: 0, // Main pancreatic duct
  stomach: 0,  // Gastric pits & glands
  skin: 1,     // Melanocytes & the basal layer
  testis: 0,   // Seminiferous tubules
  bladder: 0,  // Bladder wall (dome) — its text carries the lateral-wall origin fact
  thyroid: 1,  // Right lobe — its text carries the follicular-cell origin
});

// THE LABEL AND BADGE — the entire honesty mechanism for a visitor who sees one cancer and never
// a second uncharacterised entry (user ruling). Non-optional. Chip = the short on-model badge;
// sentence = the accessible name and the info-card text.
export function marginBadge(entryName, status, category){
  if(category) return {
    chip: 'margin: ' + category.label + ' \u00b7 cited',
    sentence: entryName + ' \u2014 margin: ' + category.label + ', the gross category its cited source describes (' + category.badgeSource
      + ': "' + category.badgeQuote + '"); the drawn magnitude is illustrative, not measured.',
  };
  if(status === 'uncharacterised') return {
    chip: 'generic mass · margin not characterised',
    sentence: entryName + ' — margin: not characterised at gross level in the cited sources; drawn as the atlas\'s generic mass.',
  };
  if(status === 'unread') return {
    chip: 'generic mass · margin source not yet read',
    sentence: entryName + ' — margin: the gross-pathology source is not yet read; drawn as the atlas\'s generic mass until it is.',
  };
  return null; // 'cited' entries with no wired category render nothing — nothing stands in for a cited shape
}

// ---- pure predicates, shared with the battery member --------------------------------------
export function inRange(v, range){ return v >= range[0] && v <= range[1]; }
export function bandsOverlap(a, b){ return a[0] <= b[1] && b[0] <= a[1]; }
export function boxContains(ranges, vec){
  return MARGIN_KNOBS.every(k => Array.isArray(ranges[k]) && inRange(vec[k], ranges[k]));
}
// Every way a cited category could REACH the reserved form, as a list of problem strings (empty
// = unreachable). Three tests, all needed: a category whose box contains the reserved vector;
// a category whose range on the reserved axis touches the reserved band; and a category that
// leaves a knob unbounded (an unbounded knob reaches everything).
// A wired category's RENDER values must sit inside its own declared RANGES — otherwise the ranges the
// check reasons about are decorative and the drawn form is unconstrained by the citation's category.
export function categoryRenderViolations(name, category){
  const out = [];
  if(!category || !category.ranges || !category.render){ out.push(`category ${name} lacks ranges or render values`); return out; }
  for(const k of MARGIN_KNOBS){
    const r = category.ranges[k];
    if(!Array.isArray(r) || r.length !== 2){ out.push(`category ${name} leaves ${k} unbounded`); continue; }
    if(typeof category.render[k] !== 'number' || !inRange(category.render[k], r)) out.push(`category ${name} renders ${k}=${category.render[k]} outside its own range [${r}]`);
  }
  if(!Number.isInteger(category.render.spikeCount)) out.push(`category ${name} renders a non-integer spikeCount`);
  return out;
}

export function reservedViolations(reserved, categories, axis, citedBand){
  const out = [];
  if(!inRange(reserved[axis.knob], axis.band)) out.push(`reserved form's ${axis.knob} ${reserved[axis.knob]} is outside the reserved band [${axis.band}]`);
  if(reserved.spikeCount !== 0) out.push(`reserved form carries spikes (spikeCount ${reserved.spikeCount}) — that is the cited categories' axis`);
  if(bandsOverlap(axis.band, citedBand)) out.push(`reserved band [${axis.band}] overlaps the cited band [${citedBand}]`);
  for(const [name, category] of Object.entries(categories)){
    const ranges = (category && category.ranges) || {};
    for(const k of MARGIN_KNOBS){
      if(!Array.isArray(ranges[k]) || ranges[k].length !== 2) out.push(`category ${name} leaves ${k} unbounded — an unbounded knob reaches everything`);
    }
    if(Array.isArray(ranges[axis.knob]) && bandsOverlap(ranges[axis.knob], axis.band)) out.push(`category ${name}'s ${axis.knob} range [${ranges[axis.knob]}] enters the reserved band [${axis.band}]`);
    if(Array.isArray(ranges.freq) && !(ranges.freq[0] >= citedBand[0] && ranges.freq[1] <= citedBand[1])) out.push(`category ${name}'s freq range [${ranges.freq}] lies outside the cited band [${citedBand}]`);
    if(boxContains(ranges, reserved)) out.push(`category ${name}'s ranges contain the reserved form — it is reachable`);
  }
  return out;
}
