// Phase A — tumour-morphology mapping: DATA AND PURE PREDICATES, deliberately with no `three`
// import, because .claude/reserve_check.js loads this file under node (copied to an .mjs
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
// to a category name, and let reserve_check prove the reserved form is still unreachable.

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
//   0. THE COLLISION RULE HAS THREE ARMS (user, 2026-09-09). (1) reserved-versus-cited: the reserved form
//      yields, never a cited category. (2) deadlock: a non-geometric answer, never a fourth tuning pass —
//      taken, as RESERVED_COLOUR. (3) CITED-VERSUS-CITED: NEITHER MOVES. Both have citations and neither
//      has magnitude to spend without inventing it; if two cited categories do not separate, the citations
//      may describe ONE gross appearance, and two categories rendering identically with the distinction
//      carried in prose is the truthful outcome. Manufacturing a visual difference between them is the
//      invention the split forbids, pointed at a second cited category. Derive each category's ranges from
//      ITS OWN citation's words; where the words carry no difference, share the render BY REFERENCE, declare
//      it (sameAppearanceAs), and let the badge say so. A citation, not a status, is what makes a category
//      wireable: a harvest SEED is not a citation (FTC stood at 'cited' on one for a day).
//   1. add the category's ranges here, inside CITED_FREQ_BAND, and flip its entries' MARGIN_STATUS;
//   2. run .claude/reserve_check.js — that proves PARAMETER DISJOINTNESS, nothing more;
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
// THE INDISTINCT-EDGE FORM, hoisted so that two cited categories whose citations describe ONE appearance
// can share it BY REFERENCE (collision rule, arm 3): many short, broad-based projections over fine granular
// noise, deliberately not fingers. Values first set for PTC; a sibling that shares them declares it.
export const INDISTINCT_EDGE_RANGES = Object.freeze({ amplitude: [0.10, 0.16], freq: [5.0, 7.0], spikeCount: [10, 14], spikeLength: [0.10, 0.18], sharpness: [4, 7] });
export const INDISTINCT_EDGE_RENDER = Object.freeze({ amplitude: 0.13, freq: 6.0, seed: 5.1, spikeCount: 12, spikeLength: 0.14, sharpness: 5.5 });
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
    ranges: INDISTINCT_EDGE_RANGES,
    render: INDISTINCT_EDGE_RENDER,
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
  // FOURTH CATEGORY WIRED (2026-09-09), the first under ARM 3 (cited-versus-cited: neither moves), chosen as the
  // ill-defined family's member nearest PTC. R1, Cancers 2022 (PMC9139767, PMID 35626076): "Furthermore, atrophy
  // of flanking pancreatic parenchyma and fibrosis often blur the macroscopic delineation of the tumour." The
  // words carry ONE property — an indistinct boundary at gross — and nothing about projections, nodularity or
  // lobulation that PTC's citation lacks. Reading "blur" as softer than "poorly defined" would manufacture a
  // difference from synonyms, so the derivation lands on the indistinct-edge region already used for PTC and
  // the render is SHARED BY REFERENCE and DECLARED (sameAppearanceAs) — pre-registered as the expected outcome,
  // confirmed at the parameter level before any capture. The badge says so in words; reserve_check
  // asserts the declaration is true (identical render object, equal ranges), never that the pair differs.
  poorlyDelineated: Object.freeze({
    label: 'poorly delineated',
    ranges: INDISTINCT_EDGE_RANGES,
    render: INDISTINCT_EDGE_RENDER,
    sameAppearanceAs: 'poorlyDefined',
    badgeSource: 'Cancers 2022, PDAC review',
    badgeQuote: 'atrophy of flanking pancreatic parenchyma and fibrosis often blur the macroscopic delineation of the tumour',
  }),
  // FIFTH CATEGORY WIRED (2026-09-09), the ill-defined family's second slot tested against the shared indistinct-edge
  // form, PRE-REGISTERED AS A SEPARATION, NOT A COLLAPSE. R9, Cancers 2025 (PMC12427887, PMID 40941017), superficial
  // spreading melanoma: "The surface of the tumor is either a macule or plaque with an irregular border, which ranges
  // in size up to centimeters." Register ruled earlier: a skin lesion's clinical surface IS its gross appearance.
  // THE DERIVATION: "irregular" is an OUTLINE word (uneven, notched, scalloped); "poorly defined" / "poorly
  // delineated" (PTC, PDAC) are EDGE-DISTINCTNESS words (blurred). A macule with an irregular border can be sharply
  // demarcated, so the words carry a real difference and arm 3 does not bind: separate ranges on the citation's
  // authority. In the knobs an irregular outline is COARSE, SPIKE-FREE undulation — freq at the coarse end of the
  // cited band (never inside the reserved band [1.6, 2.4]), amplitude legible, no projections — disjoint from the
  // indistinct-edge form on spikeCount and from wellCircumscribed on amplitude. Every magnitude is illustrative;
  // the citation gives none. LIMIT DISCLOSED ON THE BADGE: a macule or plaque is flat and the renderer draws a
  // deformed sphere — the category speaks only to the outline. The form-level resemblance to the reserved
  // placeholder (also spike-free undulation) is EXPECTED and acceptable: the colour carries that distinction.
  irregularBorder: Object.freeze({
    label: 'irregular border',
    ranges: Object.freeze({ amplitude: [0.14, 0.22], freq: [3.5, 4.5], spikeCount: [0, 0], spikeLength: [0, 0], sharpness: [0, 0] }),
    render: Object.freeze({ amplitude: 0.18, freq: 3.8, seed: 11.4, spikeCount: 0, spikeLength: 0, sharpness: 0 }),
    badgeSource: 'Cancers 2025, superficial spreading melanoma',
    badgeQuote: 'The surface of the tumor is either a macule or plaque with an irregular border',
    divergence: 'a macule or plaque is flat and that flatness is not modelled — the drawn category speaks only to the outline',
  }),
  // THIRD CATEGORY WIRED (2026-09-09), chosen because it is where the collision rule may DEADLOCK (user):
  // the reserved form's only remaining move away from circumscribed is toward lobulated, and nodular HCC is
  // the closest thing to lobulated in the atlas. R11, Gut 2023 (PMC10579519, PMID 37549980), 400 resected
  // HCCs: "A total of 52 (13.0%) individuals had type IV nodules, while 118 (29.5%), 129 (32.3%) and 101
  // (25.3%) had HCCs belonging to type I, type II and type III nodules, respectively." — a NAMED DIVERGENCE
  // (nodular 348/400 against infiltrative 52/400). One tumour per entry: the nodular MAJORITY is drawn as a
  // mass with a few large, broad, rounded protrusions (LOW sharpness = wide cones = lobules, the opposite
  // corner of the spike axis from PTC's many short sharp bumps); the infiltrative minority is NAMED on the
  // badge and not drawn — drawing it would be an entry split, an explicit decision not taken here.
  nodular: Object.freeze({
    label: 'nodular',
    ranges: Object.freeze({ amplitude: [0.02, 0.06], freq: [3.5, 5.0], spikeCount: [2, 4], spikeLength: [0.25, 0.45], sharpness: [1.5, 3.0] }),
    render: Object.freeze({ amplitude: 0.04, freq: 4.0, seed: 9.2, spikeCount: 3, spikeLength: 0.35, sharpness: 2.2 }),
    badgeSource: 'Gut 2023, 400 resected HCCs',
    badgeQuote: '118 (29.5%), 129 (32.3%) and 101 (25.3%) had HCCs belonging to type I, type II and type III nodules',
    divergence: 'the nodular majority (348 of 400) is drawn; the infiltrative type IV minority (52 of 400) is named here and not drawn',
  }),
});

// The illustrative colour of a CITED mass — UNSOURCED and disclosed in #disclaimer (a tissue-tan).
export const MASS_COLOUR = 0xa89a8c;
// THE RESERVED COLOUR (user ruling, 2026-09-09, on the HCC deadlock): the reserved form's geometry could
// not clear both ends of the margin axis, so the reserved masses take a NON-GEOMETRIC treatment — a
// colour from OUTSIDE the tissue gamut. Not grey: grey is inside the space of real tissue appearance
// (necrosis is grey, fibrous tissue grey-white), so a grey mass reads as a claim about what the tissue
// is — the amplitude-0.10 midpoint relocated from geometry to colour. Not translucent: cystic,
// mucinous and gelatinous are real gross descriptions, so a see-through mass reads as a material
// property. The marker teal (0x35c9c1) is the app's established "interface, not anatomy" colour and
// no tissue in the corpus is teal; this is that teal desaturated (hue 176°, saturation 0.30,
// lightness 0.55), so it says placeholder in a language the product already speaks. Measured before
// choosing: every tissue albedo in js/organs sits on the warm arc, hue 355°–46°, at least 129° away.
// It is an ALBEDO, not a light — standing condition (5) forbids accents in the ILLUMINATION path, and
// this pipeline has no bounce, so a teal albedo pushes no hue onto any cited albedo.
export const RESERVED_COLOUR = 0x6aafaa;
// THE COLOUR'S MEANING WIDENED (user ruling, 2026-09-09): ONE reserved colour, bound to the OBJECT, not to the margin
// axis. Two reserved colours would collide on a mass uncharacterised on both margin and growth, and one colour or
// a blend would then be a third meaning nobody defined. So this colour means 'at least one property of this mass
// is uncharacterised' and the badge names which — COLOUR FLAGS, TEXT SPECIFIES. Today the only built axis is
// margin, so the colour tracks the margin status; when growth wires in, a mass uncharacterised on growth alone
// also wears it. The cost, accepted: the colour alone no longer says which axis; the badge does.
// THE TESTABLE PROPERTY, the colour twin of the geometry's: the reserved colour must be UNREACHABLE
// from every cited tissue albedo — at least hueMarginDeg of hue from each chromatic albedo, and never
// grey (saturation at or above minSaturation). reserve_check asserts it over js/organs/*.js.
export const RESERVED_COLOUR_RULES = Object.freeze({ hueMarginDeg: 90, minSaturation: 0.2, achromaticBelow: 0.05 });
export function hexToHsl(hex){
  const r = ((hex >> 16) & 255) / 255, g = ((hex >> 8) & 255) / 255, b = (hex & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if(d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if(max === r) h = ((g - b) / d) % 6; else if(max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}
export function hueDistance(a, b){ const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); }
export function colourViolations(reservedHex, tissueHexes, rules){
  const out = [], rc = hexToHsl(reservedHex);
  if(rc.s < rules.minSaturation) out.push(`reserved colour 0x${reservedHex.toString(16)} is grey (saturation ${rc.s.toFixed(2)} below ${rules.minSaturation}) — grey is inside the tissue gamut`);
  for(const hx of tissueHexes){
    const c = hexToHsl(hx);
    if(c.s < rules.achromaticBelow) continue;   // an achromatic albedo has no hue to be near
    const dist = hueDistance(rc.h, c.h);
    if(dist < rules.hueMarginDeg) out.push(`reserved colour sits ${dist.toFixed(0)}° from tissue albedo 0x${hx.toString(16)} (margin ${rules.hueMarginDeg}°)`);
  }
  return out;
}
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
  // TNBC: the harvest backing was Livasy CA et al., Mod Pathol 2006 (PMID 16341146, doi 10.1038/modpathol.3800528),
  // 'pushing margin of invasion' in 14/23 basal-like tumours — a HISTOLOGIC assessment of the invasive front.
  // R23, read 2026-09-09 (pre-registered ladder): no StatPearls TNBC chapter; ~35 OA full texts; the gross-register
  // circumscription sentences belong to special low-grade subtypes (secretory, fibromatosis-like metaplastic),
  // not to the basal-like entry; the general invasive-breast-carcinoma gross vocabulary (ill-demarcated /
  // well-demarcated / mixed, about one-third grossly circumscribed — Standardized Pathology Report, PMC7920867)
  // is not entry-specific. NEGATIVE → not characterised at gross level in the sources read.
  tnbc:     { status: 'uncharacterised', ref: 'R23 — read 2026-09-09: no gross-register TNBC/basal-like margin sentence found; Livasy PMID 16341146 is histologic; IBC vocabulary PMC7920867 is not entry-specific' },
  hcc:      { status: 'cited', category: 'nodular', ref: 'R11 — named divergence with counts (nodular 348/400 vs infiltrative 52/400), RENDERED third, 2026-09-09' },
  // GBM: re-read 2026-09-09 on the user's biology-first distrust (the seed was a growth fact borrowed as a margin).
  // R21, Iacob & Dinca, J Med Life 2009 (PMC3019011, PMID 20108752, CC BY), Pathology: "Grossly, it appears
  // topographically diffuse, a poorly delineated mass with no capsula". RULED (user, 2026-09-09): the margin
  // COLLAPSES onto the shared indistinct-edge form — "poorly delineated" is PTC's word; "topographically diffuse"
  // is the GROWTH property, already cited on that axis, and reading it into margin would double-count one phrase
  // across two properties; "no capsula" distinguishes nothing. HELD, by the ruling's own condition: the collapse
  // lands only once the growth axis DRAWS the diffuseness, and the growth axis is designed, not built
  // (phaseA_mapping.md, section 3 — no growth consequence is rendered anywhere yet). Until then GBM stays cited
  // with no category and draws nothing, rather than relocating a property to an axis that is not showing it.
  gbm:      { status: 'cited', category: 'poorlyDelineated', badgeSource: 'J Med Life 2009 (PMC3019011)', badgeQuote: 'a poorly delineated mass with no capsula', ref: 'R21 PMC3019011 PMID 20108752 — poorly delineated: shares the indistinct-edge form under arm 3 (ruled 2026-09-09); the hold lifted when the growth axis drew the diffuseness (rim-blend, wide extent) — RENDERED; its own citation on the badge, not PDAC\'s' },
  // PROSTATE ACINAR: the seed was Gleason pattern-4/5 infiltrating descriptions — HISTOLOGIC, not a gross margin.
  // R22, read 2026-09-09 (pre-registered ladder): StatPearls Prostate Cancer (NBK470550) describes histology only;
  // no StatPearls pathology chapter exists; ~40 OA full texts across five queries yield no gross-register
  // sentence about the carcinoma's margin or its visibility — only methods sentences that IMPLY frequent gross
  // invisibility ("If there was no grossly visible tumor, a systematic sampling strategy was used", Cancers 2024
  // PMC11048607). NEGATIVE → not characterised at gross level in the sources read. The user's prediction
  // ("grossly inapparent") was NOT FOUND stated, so it is not claimed; the question whether an inapparent tumour
  // should draw no mass at all stays open and conditional on a source saying so.
  acinar:   { status: 'uncharacterised', ref: 'R22 — read 2026-09-09: no gross-register margin or visibility sentence found (NBK470550 histology only; PMC11048607 implies, does not state); was a histologic seed' },
  pdac:     { status: 'cited', category: 'poorlyDelineated', ref: 'R1 — blurred macroscopic delineation, RENDERED fourth (2026-09-09) with the same form as poorlyDefined under arm 3' },
  melanoma: { status: 'cited', category: 'irregularBorder', ref: 'R9 — irregular border (clinical surface = gross for skin; PMC12427887), RENDERED fifth (2026-09-09) as coarse spike-free undulation, separate from the indistinct-edge form on the citation\'s own word' },
  seminoma: { status: 'cited', category: 'wellCircumscribed', ref: 'harvest — well circumscribed (PMC6906820 general statement; PMC13218944 typically; PMC9162935), RENDERED second, 2026-09-09' },
  ptc:      { status: 'cited', category: 'poorlyDefined', ref: 'R17 — poorly defined margins, RENDERED (first category wired, 2026-09-09)' },
  // FTC: stood at 'cited' for a day on a harvest SEED whose sentence was about encapsulated FVPTC, a different
  // entity. READ 2026-09-09 (pre-registered ladder): StatPearls Follicular Thyroid Cancer (NBK539775) has no
  // gross section; the 2022-WHO reclassification cohort (PMC12012812) describes encapsulation per subtype in the
  // HISTOPATHOLOGIC register (minimally invasive and encapsulated angio-invasive encapsulated; widely invasive
  // 'with no or partial encapsulation, often with a multinodular pattern') — a named divergence for Phase B,
  // not a gross citation; thirteen further OA full texts, no gross sentence. NEGATIVE on the register rule,
  // so: not characterised at gross level in the sources read. Draws the reserved placeholder beside PTC.
  ftc:      { status: 'uncharacterised', ref: 'read 2026-09-09 — encapsulation described only in the histopathologic register (PMC12012812), no gross sentence found; was a harvest seed' },
});
export const MARGIN_STATUSES = Object.freeze(['uncharacterised', 'unread', 'cited']);

// THE GROWTH AXIS, AT BIRTH (2026-09-09; design: .claude/phaseA_growth_design.md). Four knobs, one per mechanism:
// count (multifocal), falloff (infiltrative — a MATERIAL transition at the mass–organ junction, never geometry, which
// is the margin axis's channel), protrusion (exophytic — the mass on the luminal side of the wall), wall (hollow-organ
// diffuse/annular — the organ mesh itself deforms). The RESERVED growth vector is the ABSENCE of an expression: one
// mass, hard junction, on the surface, no wall change — it asserts nothing, so it needs no colour of its own beyond
// the object-bound reserved colour above. GROWTH_CATEGORIES was EMPTY at birth (fixture-form (7-quater)); the first
// two categories, both infiltrative, were wired on 2026-09-09 after rim-blend won the bake-off (design document §9)
// and the reserved apex floor was measured (§10). A cited category names ONE knob and a RANGE on it that excludes
// the reserved value; reserve_check asserts the reserved vector unreachable from every one of them.
export const GROWTH_KNOBS = Object.freeze(['count', 'falloff', 'protrusion', 'wall']);
export const RESERVED_GROWTH = Object.freeze({ count: 1, falloff: 0, protrusion: 0, wall: 0 });
// THE FIRST GROWTH CATEGORIES WIRED (2026-09-09, after the bake-off and the apex-floor ruling): both on the falloff knob,
// both drawn by rim-blend — the mass's boundary dissolves into the organ's own albedo, its depth (extent, in mass radii
// of band height) illustrative by the split. Two categories, not one, because the cited WORDS differ and carry a
// difference in extent: "infiltrative"/"invasive" (PDAC R2, PTC R18) against "topographically diffuse" (GBM R21) — arm 3
// forbids only manufactured difference. Ranges exclude the reserved falloff of 0 (reserve_check asserts it) and the
// render sits inside its range (growthRenderViolations). The citation lives on the STATUS (per entry), not here: two
// entries share a category on different sources.
// WHY EXTENT IS KEYED TO THE CATEGORY, AND WHAT WOULD BREAK IT (user, 2026-09-10). GBM at 2.5 against PDAC at 1.0 is an
// ORDINAL claim, and no source ranks those two cancers against each other. It survives because the claim is about the
// TERMS — 'diffusely infiltrating' orders above 'infiltrative'/'poorly delineated' in pathology usage — not about the
// diseases; extent is a property of the category, which is what keeps it inside the illustrative disclosure. If extent
// ever varies PER ENTRY within a category, it becomes a claim about the cancers and needs more than the illustrative
// disclosure carries: a re-ruling, with a source that makes the comparison.
export const GROWTH_CATEGORIES = Object.freeze({
  infiltrative:          Object.freeze({ label: 'infiltrative',           knob: 'falloff', range: Object.freeze([0.6, 1.4]), render: Object.freeze({ extent: 1.0 }) }),
  diffuselyInfiltrative: Object.freeze({ label: 'diffusely infiltrative', knob: 'falloff', range: Object.freeze([2.0, 3.0]), render: Object.freeze({ extent: 2.5 }) }),
});
export function growthRenderViolations(categories){
  const out = [];
  for(const [name, cat] of Object.entries(categories)){
    const v = cat.render && cat.render[cat.knob === 'falloff' ? 'extent' : cat.knob];
    if(v === undefined) out.push(`growth category ${name} has no render value for its knob '${cat.knob}'`);
    else if(!(v >= cat.range[0] && v <= cat.range[1])) out.push(`growth category ${name} renders ${v} outside its declared range [${cat.range[0]}, ${cat.range[1]}]`);
  }
  return out;
}
// THE INFILTRATIVE FALLOFF — BAKE-OFF STATE (2026-09-09; design document §E). The EDGE mechanism is a MATERIAL
// transition at the mass–organ junction, and WHICH material channel carries it is decided by a bake-off against a
// pre-registered criterion, not by a guess: it must read as 'boundary not determinable' (not 'soft boundary'), must
// not read as 'organ diseased throughout', must survive the baked-AO vertex-colour composition and AgX, and must
// not bleed the reserved colour into the organ on an uncharacterised-margin mass. The candidates are implemented in
// main.js (applyGrowthFalloff) and selected here; 'none' is the committed state until the ruling — the channels
// are DORMANT in production and were exercised by captures made from a temporary working-tree wiring of
// GROWTH_RENDER, recorded in the design document. Magnitude (extent, in mass radii) is illustrative by the split.
// The losing channels (opacity; organ-side albedoBleed, roughAlbedo, darken) were removed from main.js with the wiring; their
// record — measurements, looks, and the structural retirement of the organ-side family — is design document §9–§10.
// BAKE-OFF RUN 2026-09-09 (design document §9): rimBlend is the one channel that met the criterion — it dissolves the
// boundary while the mass stays opaque, touches no organ pixel, survives AO and AgX by construction, and bleeds nothing
// into the organ. opacity failed (ghost tissue, 86% teal contamination on the reserved cross-product); the organ-side
// channels failed for want of a legible middle (a mass is 22% of the organ radius, so rings in mass radii are organ-
// scale and imperceptible per pixel). Recorded here as the decision; PRODUCTION IS UNCHANGED while GROWTH_RENDER is
// empty — wiring waits on two rulings (§9 (a) placeholder base colour, (b) GBM's labelled extent).
export const FALLOFF_CHANNEL = 'rimBlend';

// GROWTH STATUS PER ENTRY — the second axis's census, the same three statuses as margin, the same fourth property (a
// 'cited' status carries a resolvable identifier in its ref; reserve_check asserts it), the citation on the entry.
// `register` discloses H where the cited description is histologic (R2's form). A cited category with no wired
// mechanism (count, wall, placement) is 'cited' with no `category`: drawn as nothing extra, said so on the badge.
export const GROWTH_STATUSES = Object.freeze(['uncharacterised', 'unread', 'cited']);
export const GROWTH_STATUS = Object.freeze({
  hgsoc:    { status: 'cited', label: 'bilateral', register: 'G', badgeSource: 'Diagnostics 2021 (PMC8070731)', ref: 'R14 PMC8070731 — bilateral: a COUNT category with a model precondition (one ovary modelled); not drawn' },
  clear:    { status: 'cited', label: 'unilateral, cystic and solid', register: 'G', badgeSource: 'Diagnostics 2021 (PMC8070731)', ref: 'R16 PMC8070731 — count 1 equals the default; composition unexpressed (design §10); not drawn' },
  luad:     { status: 'uncharacterised', ref: 'R8 — no gross growth category claimable' },
  crc:      { status: 'cited', label: 'ulcerating-annular (majority), polypoid (a quarter)', register: 'G', badgeSource: 'Int J Mol Sci 2018 (PMC6165083)', ref: 'R6 PMC6165083 — WALL (majority) and PLACEMENT (25%), a named divergence; not drawn' },
  ccrcc:    { status: 'unread', ref: 'R3/R4 — blocked-to-tooling (PathologyOutlines gated)' },
  gdiff:    { status: 'cited', label: 'diffuse (linitis plastica)', register: 'G', badgeSource: 'NCI PDQ, Gastric Cancer Treatment (HP), updated February 21, 2025', ref: 'https://www.cancer.gov/types/stomach/hp/stomach-treatment-pdq — WALL; not drawn (page re-verified 2026-09-09: title, the ledger sentence and the update date match)' },
  uc:       { status: 'cited', label: 'papillary, exophytic (majority)', register: 'G', badgeSource: 'Future Sci OA 2026 (PMC12893692); J Clin Invest 2026 (PMC12948436)', ref: 'R19 PMC12893692 — PLACEMENT (~75% non-muscle-invasive), invasive minority named; not drawn' },
  tnbc:     { status: 'unread', ref: 'harvest seed only (NST page, syncytial infiltrative — H); the gross-register growth source is not yet read' },
  hcc:      { status: 'cited', label: 'single nodular (majority)', register: 'G', badgeSource: 'J Hepatocell Carcinoma 2024 (PMC11007400); Gut 2023 (PMC10579519)', ref: 'R12 PMC11007400 — COUNT: the majority (types I+II, 247/400 by R11) is single, which is the default; confluent multinodular minority named; not drawn' },
  gbm:      { status: 'cited', category: 'diffuselyInfiltrative', register: 'G', badgeSource: 'J Med Life 2009 (PMC3019011)', badgeQuote: 'Grossly, it appears topographically diffuse, a poorly delineated mass with no capsula', ref: 'R21 PMC3019011 PMID 20108752 — EDGE at the wide extent (design §3(b), ruled 2026-09-09); RENDERED' },
  acinar:   { status: 'cited', label: 'multifocal', register: 'H', badgeSource: 'Fontugne et al., JCI Insight 2022 (PMC8876549)', ref: 'PMC8876549 PMID 35050902 — COUNT from whole-mount histology (H disclosed); not renderable at gross register; not drawn' },
  pdac:     { status: 'cited', category: 'infiltrative', register: 'H', badgeSource: 'Int J Mol Sci 2021 (PMC8268881)', badgeQuote: 'neoplastic cells arranged in small tubular glands that infiltrate a desmoplastic stroma', ref: 'R2 PMC8268881 PMID 34201897 — EDGE, histologic (H disclosed), corroborated at gross by R1; RENDERED' },
  melanoma: { status: 'cited', label: 'radial then vertical growth phase', register: 'G', badgeSource: 'Cancers 2025 (PMC12427887)', ref: 'R10 PMC12427887 — PLACEMENT (radial phase) and EXTENT breach (vertical phase); not drawn' },
  seminoma: { status: 'unread', ref: 'growth source not read (listed for an external read; none made)' },
  ptc:      { status: 'cited', category: 'infiltrative', register: 'G', badgeSource: 'StatPearls, Papillary Thyroid Carcinoma (NBK536943)', badgeQuote: 'typically presents as an invasive neoplasm', ref: 'R18 NBK536943 PMID 30725628 — EDGE ("an invasive neoplasm"); the margin half of the same sentence is R17 — two words, two axes, declared; RENDERED' },
  ftc:      { status: 'unread', ref: 'growth source not read' },
});

// THE EXTENT AXIS AS TEXT (design: .claude/phaseA_extent_design.md, rulings 1–3 of 2026-09-10). Stage at diagnosis is a
// DISTRIBUTION and the atlas draws one illustrative mass, so geometry shows one state where the source gives several;
// the default confined mass already reads as the localized case. Every mass badge therefore carries a PRIMARY extent
// line (not an exception marker): the SEER Summary Stage shares at diagnosis for the entry's SITE, DETECTION-FRAMED —
// 'found at diagnosis', never 'spreads' (stage at diagnosis measures screening and symptom onset as much as behaviour;
// 'usually spreads beyond the organ' is the trimmed version that will suggest itself and is false to the source) — with
// the SEER entity named where it is broader than the entry, the registry set and diagnosis years (the vintage), the
// submission where the page states it, and the date the page was followed. Source: SEER Cancer Stat Facts, public
// domain; never AJCC (licensed). The reader-side argument (user): the render must not depict a stage the reader might
// not have — text can correct a conservative picture upward, but a frightening one cannot be unseen.
export const EXTENT_STATUSES = Object.freeze(['uncharacterised', 'cited']);
export const EXTENT_STATUS = Object.freeze({
  pdac: { status: 'cited', site: 'pancreas', siteNote: 'the site as a whole (pancreatic cancer), of which ductal adenocarcinoma is the large majority', shares: { localized: 15, regional: 28, distant: 51, unknown: 5 }, modal: 'distant', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Pancreatic Cancer', ref: 'https://seer.cancer.gov/statfacts/html/pancreas.html — verified 2026-09-10' },
  melanoma: { status: 'cited', site: 'melanoma of the skin', siteNote: 'melanoma of the skin — the entry itself', shares: { localized: 77, regional: 10, distant: 5, unknown: 9 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Melanoma of the Skin', ref: 'https://seer.cancer.gov/statfacts/html/melan.html — verified 2026-09-10' },
  gbm: { status: 'cited', site: 'brain and other nervous system', siteNote: 'brain and other nervous system cancers as a whole, not glioblastoma alone', shares: { localized: 77, regional: 14, distant: 2, unknown: 7 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Brain and Other Nervous System Cancer', ref: 'https://seer.cancer.gov/statfacts/html/brain.html — verified 2026-09-10' },
  tnbc: { status: 'cited', site: 'female breast', siteNote: 'female breast cancer as a whole, not the triple-negative subtype', shares: { localized: 64, regional: 27, distant: 6, unknown: 2 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Female Breast Cancer', ref: 'https://seer.cancer.gov/statfacts/html/breast.html — verified 2026-09-10' },
  crc: { status: 'cited', site: 'colon and rectum', siteNote: 'colon and rectum cancers as a whole', shares: { localized: 34, regional: 37, distant: 23, unknown: 6 }, modal: 'regional', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Colorectal Cancer', ref: 'https://seer.cancer.gov/statfacts/html/colorect.html — verified 2026-09-10' },
  ccrcc: { status: 'cited', site: 'kidney and renal pelvis', siteNote: 'kidney and renal pelvis cancers as a whole, not clear-cell carcinoma alone', shares: { localized: 66, regional: 17, distant: 15, unknown: 3 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Kidney and Renal Pelvis Cancer', ref: 'https://seer.cancer.gov/statfacts/html/kidrp.html — verified 2026-09-10' },
  hcc: { status: 'cited', site: 'liver and intrahepatic bile duct', siteNote: 'liver and intrahepatic bile duct cancers as a whole, not hepatocellular carcinoma alone', shares: { localized: 45, regional: 23, distant: 21, unknown: 10 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Liver and Intrahepatic Bile Duct Cancer', ref: 'https://seer.cancer.gov/statfacts/html/livibd.html — verified 2026-09-10' },
  luad: { status: 'cited', site: 'lung and bronchus', siteNote: 'lung and bronchus cancers as a whole, not adenocarcinoma alone', shares: { localized: 24, regional: 21, distant: 51, unknown: 4 }, modal: 'distant', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Lung and Bronchus Cancer', ref: 'https://seer.cancer.gov/statfacts/html/lungb.html — verified 2026-09-10' },
  hgsoc: { status: 'cited', site: 'ovary', siteNote: 'ovarian cancer as a whole, not the high-grade serous subtype alone', shares: { localized: 22, regional: 18, distant: 54, unknown: 6 }, modal: 'distant', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Ovarian Cancer', ref: 'https://seer.cancer.gov/statfacts/html/ovary.html — verified 2026-09-10' },
  clear: { status: 'cited', site: 'ovary', siteNote: 'ovarian cancer as a whole, not clear-cell carcinoma alone', shares: { localized: 22, regional: 18, distant: 54, unknown: 6 }, modal: 'distant', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Ovarian Cancer', ref: 'https://seer.cancer.gov/statfacts/html/ovary.html — verified 2026-09-10' },
  acinar: { status: 'cited', site: 'prostate', siteNote: 'prostate cancer as a whole, of which acinar adenocarcinoma is the large majority', shares: { localized: 69, regional: 14, distant: 9, unknown: 8 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Prostate Cancer', ref: 'https://seer.cancer.gov/statfacts/html/prost.html — verified 2026-09-10' },
  gdiff: { status: 'cited', site: 'stomach', siteNote: 'stomach cancer as a whole, not the diffuse type alone', shares: { localized: 32, regional: 23, distant: 35, unknown: 9 }, modal: 'distant', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Stomach Cancer', ref: 'https://seer.cancer.gov/statfacts/html/stomach.html — verified 2026-09-10' },
  seminoma: { status: 'uncharacterised', site: 'testis', ref: 'https://seer.cancer.gov/statfacts/html/testis.html — the page publishes no stage-at-diagnosis distribution for this site (checked 2026-09-10)' },
  ptc: { status: 'cited', site: 'thyroid', siteNote: 'thyroid cancer as a whole, not papillary carcinoma alone', shares: { localized: 63, regional: 31, distant: 3, unknown: 3 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Thyroid Cancer', ref: 'https://seer.cancer.gov/statfacts/html/thyro.html — verified 2026-09-10' },
  ftc: { status: 'cited', site: 'thyroid', siteNote: 'thyroid cancer as a whole, not follicular carcinoma alone', shares: { localized: 63, regional: 31, distant: 3, unknown: 3 }, modal: 'localized', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Thyroid Cancer', ref: 'https://seer.cancer.gov/statfacts/html/thyro.html — verified 2026-09-10' },
  uc: { status: 'cited', site: 'urinary bladder', siteNote: 'bladder cancer as a whole', shares: { inSitu: 50, localized: 34, regional: 7, distant: 6, unknown: 3 }, modal: 'in situ', basis: 'SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage', submission: 'not stated on the page', source: 'SEER Cancer Stat Facts: Bladder Cancer', ref: 'https://seer.cancer.gov/statfacts/html/urinb.html — verified 2026-09-10' },
});
export function extentSentence(entryName, ext){
  if(!ext) return '';
  if(ext.status !== 'cited') return ' Extent: drawn confined; ' + (ext.site ? 'the SEER page for ' + ext.site : 'the source') + ' publishes no stage-at-diagnosis distribution, so extent is not characterised.';
  const s = ext.shares;
  const framing = (ext.modal === 'localized' || ext.modal === 'in situ')
    ? 'The drawing shows the localized case, which is how most are found.'
    : 'The drawing shows the localized case \u2014 the least extensive; most are found already beyond it.';
  const inSitu = s.inSitu !== undefined ? s.inSitu + '% in situ, ' : '';   // SEER reports an in situ share for some sites (bladder: half of cases)
  return ' Extent: drawn confined. Found at diagnosis — ' + ext.site + (ext.siteNote && !/the entry itself/.test(ext.siteNote) ? ' (SEER reports ' + ext.siteNote + ')' : '')
    + ': ' + inSitu + s.localized + '% localized, ' + s.regional + '% regional, ' + s.distant + '% distant, ' + s.unknown + '% unknown'
    + ' (' + ext.source + '; ' + ext.basis + '; ' + ext.ref.replace(/^https?:\/\/\S+ — /, '') + '). ' + framing;
}

// KNOWN TO UNDERSTATE — the generic form (user ruling 2, 2026-09-09). A badge that merely adds a fact next to a drawn
// boundary loses to the boundary: vision beats text. So where a cited EXTENT exceeds what gross-register rendering can
// show, the badge states that the drawing is known to understate it AND in which direction — 'illustrative' alone
// implies an unknown error direction, and here it is one-way and known. Keyed by entry, reusable: GBM is the first
// instance (its diffuseness is drawn as a degree of dissolve, not as spatial extent); perineural spread in PDAC is the
// next claimant once its extent is read at a citable register.
export const EXTENT_UNDERSTATED = Object.freeze({
  gbm: Object.freeze({
    direction: 'the drawn mass is smaller than the cited extent',
    statement: 'the source describes the tumour as topographically diffuse, with no capsule — its extent exceeds any boundary this mass shows, and the dissolve at its base depicts that only as a degree',
    source: 'J Med Life 2009 (PMC3019011)',
    quote: 'Grossly, it appears topographically diffuse, a poorly delineated mass with no capsula',
  }),
});
// THE RIM-BLEND BAND, shared by the renderer (main.js) and the check so both read one formula: weight 1 at and below
// the contact plane (−0.2·R along the outward axis), falling by smoothstep to 0 at height 0.35·extent·R.
export const RIM_BAND = Object.freeze({ contact: -0.2, heightPerExtent: 0.35 });
export function rimBlendWeight(hgt, massR, extent){
  const h0 = RIM_BAND.contact * massR, height = RIM_BAND.heightPerExtent * (extent || 1.0) * massR;
  if(hgt <= h0) return 1;
  const t = Math.min(1, Math.max(0, (hgt - h0) / (height - h0)));
  return 1 - t * t * (3 - 2 * t);
}
// THE RESERVED APEX FLOOR — SECOND DERIVATION (2026-09-10; the first, one pose on one organ, was the resolve-versus-
// resolve-correctly gap one level up: the check verified that the cap matched a measurement, not that the measurement
// generalised). The exposure: when a margin-reserved (teal) mass carries cited infiltrative growth, rim-blend dresses
// its base in the organ's albedo and the reserved signal survives only at the apex — and the apex is what the camera
// sees LEAST from base-facing yaws. Production auto-rotates, so the default pose is one sample of a distribution.
// MEASURED ACROSS THE ORBIT (fixture: the lungs' and the kidneys' reserved masses given infiltrative growth in a
// temporary working-tree wiring; 24 yaws at the default pitch and radius, frozen, baseline against wired, teal pixels of
// the mass still teal; scratch harness /tmp/ca-yaw-sweep.js, evidence /tmp/atlas-verify/sweep-*, ephemeral):
//   cap 1.0 → lungs min 0.20 (below the 0.30 floor at 8 of 22 visible yaws; the default pose's 0.34 was a FAVOURABLE pose),
//             kidneys min 0.03 at yaw 6 (below the floor at 5 yaws; the mass is base-on to the camera there);
//   cap 0.5 → lungs min 0.31, kidneys min 0.06 (yaws 4–6);   cap 0.3 → lungs min 0.35, kidneys min 0.08 (yaws 4–6).
// No nonzero cap survives the kidney geometry: from base-facing yaws the visible mass IS the band, whatever its height.
// THE DECISION, by the standing principle (a reserved signal outranks an illustrative magnitude — provenance
// truth-claim over invented-and-disclosed magnitude): capForReservedMargin = 0. A margin-reserved mass draws NO
// dissolve; its cited growth is carried on the badge in words ('not drawn on a placeholder mass'), its reserved colour
// keeps every pixel, and the floor holds at 1.0 by construction. The cost is nil today (no live entry combines the two)
// and disclosed when one does. THE RULE THE CHECK NOW ENFORCES: a nonzero cap must be backed by a SWEEP MINIMUM over at
// least two organs, every one at or above the floor — a default-pose number backs nothing. Raising the cap without
// that measurement fires reserve_check.
// THE ZONE FORMULA IS ORDERING-ONLY (user): it predicted 0.58 and 0.41 against measured 0.34 and 0.10 — off by 70% and
// 4×, and in a CONSISTENT direction (it over-predicts reserved area), so as a pre-filter it would pass masses that fail.
// Two ordered points are monotone by construction; it agreed on ordering and on nothing else. Keep it out of any
// legibility claim; it is not a sanity check.
export const RESERVED_APEX = Object.freeze({
  floor: 0.30,
  // [band extent, { defaultPose: teal fraction at the framed default pose (lungs), sweepMin: per-organ minimum over 24 yaws }]
  measured: Object.freeze([
    [2.5, Object.freeze({ defaultPose: 0.10 })],
    [1.0, Object.freeze({ defaultPose: 0.34, sweepMin: Object.freeze({ lungs: 0.20, kidneys: 0.03 }) })],
    [0.5, Object.freeze({ sweepMin: Object.freeze({ lungs: 0.31, kidneys: 0.06 }) })],
    [0.3, Object.freeze({ sweepMin: Object.freeze({ lungs: 0.35, kidneys: 0.08 }) })],
  ]),
  capForReservedMargin: 0,
  minOrgansForACap: 2,
});
export function reservedApexViolations(apex){
  const out = [];
  if(apex.capForReservedMargin === 0) return out;   // no dissolve on a reserved mass: the floor holds at 1.0 by construction
  const at = apex.measured.find(([e]) => e === apex.capForReservedMargin);
  if(!at){ out.push(`the reserved-margin band cap ${apex.capForReservedMargin} has no measurement — sweep before raising`); return out; }
  const sweep = at[1].sweepMin;
  if(!sweep){ out.push(`the reserved-margin band cap ${apex.capForReservedMargin} is backed only by a default-pose number — a sweep minimum over ${apex.minOrgansForACap}+ organs is required`); return out; }
  const organs = Object.keys(sweep);
  if(organs.length < apex.minOrgansForACap) out.push(`the cap's sweep covers ${organs.length} organ(s); ${apex.minOrgansForACap} are required`);
  for(const o of organs) if(sweep[o] < apex.floor) out.push(`the cap ${apex.capForReservedMargin} keeps only ${sweep[o]} of the reserved mass on ${o} at its worst yaw, below the floor ${apex.floor}`);
  return out;
}
export function growthReservedViolations(reserved, categories){
  const out = [];
  for(const [name, cat] of Object.entries(categories)){
    if(!GROWTH_KNOBS.includes(cat.knob)){ out.push(`growth category ${name} names knob '${cat.knob}', which the reserved vector does not carry`); continue; }
    const [lo, hi] = cat.range, rv = reserved[cat.knob];
    if(rv >= lo && rv <= hi) out.push(`growth category ${name} reaches the reserved ${cat.knob} value ${rv} (range [${lo}, ${hi}]) — the reserved form must be unreachable from every cited category`);
  }
  return out;
}

// Which hotspot anchors the mass: the organ's own cited "arises here" structure, by index into
// ORGAN_DETAILS[key].hotspots. The label in each comment is what the index must keep pointing at;
// reserve_check verifies the chosen hotspot's text (or the organ description) speaks of
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
// THE MASS BADGE — margin and growth on one chip, the text naming which property is which and, where applicable,
// that the drawing is KNOWN TO UNDERSTATE (colour flags, text specifies — ruling D).
export function massBadge(entryName, marginSt, marginCat, growthSt, growthCat, falloff, understated, extent){
  const base = marginBadge(entryName, marginSt.status, marginCat, marginSt);
  if(!base) return null;
  let chip = base.chip, sentence = base.sentence;
  if(growthSt && growthSt.status === 'cited' && growthCat){
    chip += ' \u00b7 growth: ' + growthCat.label + ' \u00b7 cited';
    sentence += ' Growth: ' + growthCat.label + ', the pattern its cited source describes (' + growthSt.badgeSource + ': "' + growthSt.badgeQuote + '")'
      + (growthSt.register === 'H' ? ' \u2014 a histologic description, disclosed as such' : '')
      + (falloff && falloff.suppressed ? '.' : '; drawn as the mass\'s boundary dissolving into the organ\'s own colour, its depth illustrative, not measured.');
    if(falloff && falloff.suppressed) sentence += ' Not drawn on this placeholder mass: its reserved colour outranks the illustrative dissolve (measured across the orbit, no dissolve depth kept the placeholder legible from every angle).';
    else if(falloff && falloff.capped) sentence += ' The dissolve is capped on this placeholder mass so its reserved colour stays legible: a reserved signal outranks an illustrative magnitude.';
  } else if(growthSt && growthSt.status === 'cited'){
    sentence += ' Growth: ' + (growthSt.label || 'a cited pattern') + ' is cited (' + growthSt.badgeSource + ') and not drawn \u2014 the growth axis expresses only infiltration so far.';
  } else if(growthSt && growthSt.status === 'uncharacterised'){
    sentence += ' Growth: not characterised at gross level in the cited sources.';
  } else if(growthSt && growthSt.status === 'unread'){
    sentence += ' Growth: the gross-pathology source is not yet read.';
  }
  sentence += extentSentence(entryName, extent);
  if(understated) sentence += ' KNOWN TO UNDERSTATE \u2014 ' + understated.direction + ': ' + understated.statement + ' (' + understated.source + ': "' + understated.quote + '").';
  return { chip, sentence };
}
// THE CITATION BELONGS TO THE ENTRY when a category is shared (found 2026-09-09 in the first wired capture: GBM's badge
// quoted PDAC's source because both wear `poorlyDelineated`). A status may carry its own badgeSource/badgeQuote, which
// override the category's; the category's pair remains the default for the entry it was first written for.
export function marginBadge(entryName, status, category, own){
  const src = own && own.badgeSource ? own : category;
  if(category) return {
    chip: 'margin: ' + category.label + ' \u00b7 cited',
    sentence: entryName + ' \u2014 margin: ' + category.label + ', the gross category its cited source describes (' + src.badgeSource
      + ': "' + src.badgeQuote + '")' + (category.divergence ? '; ' + category.divergence : '')
      + '; the drawn magnitude is illustrative, not measured.'
      + (category.sameAppearanceAs ? ' Drawn with the same form as the ' + MARGIN_CATEGORIES[category.sameAppearanceAs].label
         + ' category: the two citations describe one gross appearance, so the distinction is carried here in words, not in shape.' : ''),
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

// ARM 3's one assertion: a category that DECLARES the same appearance as a sibling must actually share its
// render object (identity, not a copy that can drift) and its ranges; the referent must exist and must not
// itself point onward. Nothing here asserts that two cited categories DIFFER — that would force invention.
export function sameAppearanceViolations(categories){
  const out = [];
  for(const [name, cat] of Object.entries(categories)){
    if(!cat.sameAppearanceAs) continue;
    const ref = categories[cat.sameAppearanceAs];
    if(!ref){ out.push(`${name} declares the same appearance as '${cat.sameAppearanceAs}', which is not wired`); continue; }
    if(ref.sameAppearanceAs) out.push(`${name} points at ${cat.sameAppearanceAs}, which itself points onward — declare the root`);
    if(cat.render !== ref.render) out.push(`${name} declares the same appearance as ${cat.sameAppearanceAs} but does not share its render object — a copy can drift`);
    if(JSON.stringify(cat.ranges) !== JSON.stringify(ref.ranges)) out.push(`${name} declares the same appearance as ${cat.sameAppearanceAs} but its ranges differ`);
  }
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
