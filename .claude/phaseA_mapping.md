# Phase A — tumour-visual parameter mapping (working document, opened 2026-09-05)

The mapping between cited tumour behaviour and renderer parameters. Governed by the
epistemic split (roadmap / manifest `_phaseA_epistemic_split`): **the category is cited;
the magnitude is not.** Each property below records its two halves separately. Conditions
(1)–(8) binding; the citation half runs under the six-state contract with the
classification-fact exception (hand-cited now, permanent, no Phase-B dependency); the
magnitude half is illustrative by declaration, same discipline as the colour downgrades.

## The four properties

### 1. Site — where in the organ this cancer arises
- **CATEGORY (cited):** the region of origin (e.g., pancreatic head; gastric antrum vs
  diffuse; renal cortex). Largely already modelled and cited via the tumour-map `pos3d`
  regions and their existing citations.
- **MAGNITUDE (illustrative):** exact `pos3d` coordinates within the region. Placement
  precision is design, not measurement.
- **Renderer knob:** `pos3d` (exists).

### 2. Margin character — spiculated / circumscribed / lobulated / ill-defined
- **REGISTER DECISION (2026-09-05, settled before citations accumulate):** the atlas's
  tumour is a GROSS-SPECIMEN construct — the scene reads as the organ as a physical
  object, so the vocabulary of record is GROSS PATHOLOGY (WHO, PathologyOutlines gross
  descriptions). BI-RADS and other radiologic lexicons describe imaging appearance — a
  related, non-interchangeable vocabulary; using one for the other is a category
  substitution (the TNBC-for-basal-like shape). Radiologic descriptors are admissible
  only as DISCLOSED cross-register items, register named, imaging↔gross correlate
  stated.
- **CATEGORY (cited):** the gross margin/surface descriptor for the modelled cancer's
  typical presentation (e.g., stellate, ill-defined, circumscribed/pseudocapsule).
- **MAGNITUDE (illustrative):** `sharpness`, `spikeCount`, `spikeLength` values. No
  source maps a descriptor to a number; values are chosen for legibility and disclosed.
- **Renderer knobs:** `organicSpiculate` `sharpness` / `spikeCount` / `spikeLength`
  (exist; viewer.js:223).

### 3. Growth pattern — the CONSEQUENCE is rendered, not the pattern (ruling 2026-09-05)
- **CATEGORY (cited):** exophytic / infiltrative / diffuse / multifocal, from PDQ
  pathology sections and WHO classification.
- **Consequence mapping (design, per ruling):**
  - exophytic → mass protruding into a lumen — placement + orientation (knobs exist)
  - infiltrative → indistinct boundary — soft falloff at the tumour margin (material
    can express; magnitude illustrative)
  - diffuse (linitis plastica) → thickened, rigid ORGAN WALL, not a blob — **the one
    genuinely new expression; design before building**
  - multifocal → several small masses — already how the site maps work
- **MAGNITUDE (illustrative):** falloff width, wall-thickening factor, mass count/size
  distribution.

### 4. Stage-EXTENT — how far the mass has gone (split 2026-09-05; SIZE demoted)
- **THE SPLIT:** stage-size conflated two things and only one is freely sourceable.
  SEER Summary Stage categorises EXTENT (in situ / localised / regional / distant) and
  gives no tumour size; size-in-cm is T-category territory, and the T thresholds live
  in AJCC — a licensed compilation whose tables cannot be reproduced (individual
  thresholds are citable facts where a free source states them, but the compilation
  isn't ours to render — and under this split we need neither).
- **EXTENT IS THE PROPERTY** (the growth-pattern reframe again — render the
  consequence, not the label; it also routes around the property set's one licensing
  question): a mass confined within the organ, one breaching the capsule, one with
  satellite deposits teaches what stage MEANS; "2cm vs 4cm" teaches a number.
- **CATEGORY (cited):** SEER Summary Stage extent categories (US-government public
  domain). Division of labour with the existing screens: the Explore tumour renders
  LOCAL extent (in situ → localised → regional: containment / boundary breach /
  satellite deposits); DISTANT spread stays the site map's job on its own screen.
- **MAGNITUDE (illustrative):** radius, breach depth, satellite count/placement.
  Radius keeps only extent-correlated ORDERING (in situ < localised < regional
  footprint) — no cited centimetres anywhere.
- **Renderer knobs:** geometry radius (exists); containment/breach relative to the
  organ mesh (new expression, shares design space with infiltrative falloff and the
  diffuse wall property).

## Provenance & disclosure
- Citation records for the CATEGORY halves join `.claude/citations.json` as a Phase-A
  block (living tertiaries get Phase-3 treatment: retrieval date, archived quote,
  durability class).
- The UI-facing disclaimer gains, when Phase A ships visuals: tumour morphology is
  ILLUSTRATIVE OF CITED BEHAVIOUR, not measured from patients.
- The lesion-vs-shadow gate INVERTS for this pass: the tumour is supposed to read as a
  lesion; the check becomes whether NORMAL tissue reads as diseased.

## Idiom-collision rule (checked against code 2026-09-05)
Multifocal (several independent PRIMARY foci) and the tumour site map (several blobs =
SITES OF INVOLVEMENT) are different concepts that could share a visual idiom. Code
check: the site map is a SEPARATE screen with its own viewer (`state.siteViewer`,
`screenCancer`), organ-less, accent-coloured, and schematic by its own declaration
(main.js:536: "four abstract blobs POSITIONED TO ENCODE A SPREAD PATTERN, not
objects"; the aria-label says "coloured cell clusters"). RULE so the registers never
converge: multifocal foci render ONLY in the gross-tissue register, attached to the
organ mesh, tissue-coloured; site-map blobs render ONLY in the accent-schematic
register, organ-less. Captions/aria must name the concept: "independent primary foci"
vs "sites of involvement". If a future change puts both idioms on one screen, that is
a design decision to take explicitly, not an accumulation.

## Pre-registered negative
Some cancers may have no distinctive visual behaviour worth modelling. A generic mass
with an honest label beats an invented characterisation. Expected to fire for at least
some of the sixteen.

## Calibration batch (condition (8): first batch calibrates the method)
First four cancers, chosen to span the property space:
- **stomach / diffuse-type** — the linitis plastica case (diffuse → wall property)
- **pancreas / PDAC** — the classic infiltrative case
- **breast / IDC-NST-and-basal** — the spiculated-margin classic (radiology-vocabulary
  source-landscape test)
- **kidney / ccRCC** — commonly circumscribed ("pseudocapsule") — the contrast case
Verdicts per the six-state contract; the batch's job is to discover the real source
landscape per property before the remaining twelve are read.

## Status log
- 2026-09-05: document opened; knobs verified in source; consequence mapping and
  epistemic split recorded; calibration batch defined.
- 2026-09-05 (register + mitigations): tumour = GROSS-SPECIMEN construct decided
  (vocabulary of record = gross pathology; radiologic = disclosed cross-register only);
  PathologyOutlines adopted with NO-DISCRETION Phase-3 (the never-at-source-quote
  class); PDQ purpose-shaped-coverage lesson logged against Phase B's backbone
  assumption too. Breast calibration read re-pointed: gross pathology first, BI-RADS
  disclosed fallback.
- 2026-09-05 (calibration reads 1–2 of 4): STOMACH diffuse → wall category CITED
  verbatim (PDQ Gastric HP, 2025-02-21: "…infiltration of the gastric wall (i.e.,
  linitis plastica)") — the new rendering expression has its citation. PANCREAS
  surfaced calibration lesson #1: PDQ TREATMENT pages carry no gross-pathology
  descriptors; growth-pattern/margin categories live in pathology tertiaries
  (PathologyOutlines, WHO) and radiology vocabularies (BI-RADS) — per-property source
  classes corrected in `_phaseA_citations`. Pancreas/breast/kidney reads queued under
  the corrected classes.
