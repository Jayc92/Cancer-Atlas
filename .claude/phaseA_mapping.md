# Phase A — tumour-visual parameter mapping (working document, opened 2026-09-05)

The mapping between cited tumour behaviour and renderer parameters. Governed by the
epistemic split (roadmap / manifest `_phaseA_epistemic_split`): **the category is cited;
the magnitude is not.** Each property below records its two halves separately. Conditions
(1)–(8) binding; the citation half runs under the six-state contract with the
classification-fact exception (hand-cited now, permanent, no Phase-B dependency); the
magnitude half is illustrative by declaration, same discipline as the colour downgrades.

## The assignment unit (decided 2026-09-05, before the reads)
**Morphology attaches to the ACTIVE CANCER-LIST ENTRY — the atlas's existing rendering
unit — which is already subtype-level wherever morphology diverges** (the 16 active
entries are TNBC, diffuse-type gastric, ccRCC, seminoma, HGSOC and OCCC separately,
PTC and FTC separately, etc.). This is the hybrid resolution with the split rule
anchored to existing structure rather than case-by-case taste:
1. **Unit:** the active entry. Population stays 4 × 16 = 64; the renderer draws one
   tumour per entry (no renderer change). Per-subtype rendering happens only if an
   entry is split — an explicit decision, never an accumulation.
2. **Mandatory qualifier:** every category claim carries "characteristically /
   predominantly" WITH a source that says so. An unqualified predominant-as-THE-pattern
   is the generalisation drift that accounts for eleven of twelve defects — building it
   into the schema is prohibited.
3. **Divergence threshold (stated):** if a within-entry subtype holding ≥10% share (by
   the atlas's own cited figures) carries a CATEGORICALLY OPPOSED morphology (inversion
   — circumscribed vs spiculated — not gradation), the entry cannot carry one
   unqualified category: the claim names the divergence explicitly, or the
   pre-registered negative fires (generic mass, honest label). Likely test case:
   colorectal "adenocarcinoma" (a >90% entry spanning NST / mucinous / signet-ring).
   **PREMISE DEPENDENCY (2026-09-05):** the threshold is keyed to the atlas's own cited
   subtype shares, which are MIGRATING figures under Phase B — if SEER's mucinous share
   differs and crosses the line, the colorectal split decision flips: a structural rule
   depending on an input scheduled to change source, the watchlist shape. RULE: record
   the share value AND its source alongside each threshold determination, so the
   boundary entries can be re-tested when the pull lands rather than silently
   inheriting a stale evaluation. On current evidence the boundary set is colorectal
   and possibly one or two others.
4. **Immediate correction this forces:** the calibration batch's breast case was
   mis-unit'ed — "IDC-NST spiculated-margin classic" is NOT a rendered entry. The
   rendered entry is TNBC/basal-like, whose gross margin is characteristically PUSHING
   — and its category citation already exists in-atlas, verified: Livasy's "pushing
   margin of invasion (14/23)" (verified-quoted at abstract, 2026-09-05). The
   spiculated NST classic stays in the record as the counter-example documenting why
   the unit decision matters.

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

## The three expressions — three problems, not three variations (2026-09-05)
Decomposed by what each needs to know about the organ:
1. **Infiltrative falloff — TUMOUR-LOCAL.** The mass's own margin softens; the organ
   is uninvolved. Cheapest, independent, BUILD FIRST.
2. **Diffuse wall — ORGAN-LOCAL.** There is no mass; the expression IS the organ wall.
   Nothing about the tumour renderer applies. PROVENANCE RULE (full weight — checked:
   assets/stomach.glb is a cited real asset, "Realistic Stomach" by Brain Diagno,
   Sketchfab): the organ meshes are provenance-tracked cited assets with landmark-
   fidelity requirements, and deforming one raises whether the shipped organ is still
   the cited asset. Render the wall effect as a MATERIAL TREATMENT or a SEPARATE SHELL
   GEOMETRY over the unmodified mesh — the same discipline as declining to merge
   pancreas's nodes to fix its seam: the cited asset stays untouched, the effect lives
   on top.
3. **Extent breach — the only genuinely RELATIONAL one** (needs the organ boundary in
   order to cross it). CHEAP VERSION FIRST (premise checked: organ materials ship
   opaque, no transparent:true anywhere — the transmission investigation's null
   result): place the mass straddling the organ surface and let the DEPTH BUFFER do
   the work — the inside portion occludes, the outside portion shows. Free, and the
   read you want. The expensive version (visible deformation of the organ surface
   where the tumour pushes through) is real geometry work AND would collide with the
   provenance rule above — deferred until the cheap one has been looked at.

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

## In-atlas harvest (2026-09-05 — run while PathologyOutlines cools; the Livasy pattern
generalised as predicted)
Grep of the atlas's own cited prose against the margin/growth vocabulary. Per-entry
ledger (CITED = category-grade material with citation in the existing verified content):
- **testis/seminoma — margin DONE:** "well-circumscribed solid intratesticular nodule"
  (CITED, PMC6906820, testis.js:239). No external read needed.
- **prostate/acinar — growth (multifocal) DONE:** the best-cited morphology fact in the
  atlas (Fontugne 59.7% of 233, Mehra 21/30, Cooper; prostate.js:155–219). Margin
  seeded (pattern-4/5 infiltrating descriptions, cited, :244).
- **stomach/diffuse — growth + wall DONE in-atlas** (diffuse infiltration → "leather
  bottle" linitis plastica, CITED at :234/:258) — the PDQ read now corroborates rather
  than sources.
- **breast/TNBC — margin DONE** (:204, "Margins are often pushing and circumscribed
  rather than infiltrative", cited histology block = the Livasy find); growth seeded
  (":197 syncytial infiltrative growth pattern", quoted from the NST page).
- **brain/GBM — growth DONE** (diffusely infiltrative, cited; the Infiltrative margin
  is a cited tumour-map region), margin arguably the same fact (ill-defined).
- **bladder/urothelial — growth seeded** (invasive nests/tongues infiltrate, cited
  :266/:274); the exophytic/papillary half needs an external read.
- **thyroid/FTC — margin seeded** (encapsulated, cited FVPTC-adjacent context :270).
- **Thin or absent in-atlas:** pancreas, kidneys, colon, lungs (architecture cited but
  not gross margin), skin (register caution: ABCD border vocabulary is
  clinical-dermoscopic, not gross), liver, ovary ×2, PTC.
Net: the external-read population drops from ~32 margin/growth items to roughly the
low twenties, and four entries are wholly or half retired before any fetch.

## Source hierarchy for morphology categories (re-designated 2026-09-05)
"Gross-pathology tertiary of record" was a REACHABILITY ARTIFACT — PathologyOutlines
got the title because it's what the fetcher could reach after PDQ and StatPearls came
back management-shaped. The AUTHORITY for gross morphology is the WHO Classification
of Tumours; PathologyOutlines is a practitioner reference summarising it. The
GLOBOCAN distinction applies: "best available source" and "source our fetcher can
reach" are different claims. HIERARCHY: (1) in-atlas already-verified quotes (primary
literature); (2) WHO Classification — the authority; not freely machine-readable, so
via human-route reads or reachable sources stating the fact, with WHO named; (3)
PathologyOutlines — the reachable practitioner tertiary, no-discretion Phase-3,
recorded as summary-of-authority, not authority.

## Rate-limit measurement plan (before queueing external reads)
No probing inside the Retry-After window (impolite and uninformative). At the retry
window (after 2026-09-06): one fetch, observe headers, a second after a modest
interval — measure whether the limit is per-burst (pacing works) or a daily cap
(62-from-one-source was a quarter of elapsed time and forces re-sourcing). The
harvest already shrank the measured need to the low twenties, which changes the
arithmetic either way.

## The uncharacterised-margin default (PROPOSED 2026-09-09 — settle before the build)
User, on the reads report: "A negative on margin needs a rendering answer, not only a record."
- **THE PROBLEM.** Margin drives `sharpness` and `spikeCount`, the most visually distinctive
  knobs in the mapping, and after the reads five entries (four if ccRCC resolves) carry NO
  cited margin category. A renderer must still draw something, and every shape a mesh can
  take reads as an assertion about margin: a smooth default says "circumscribed", a spiky one
  says "infiltrative". If those entries render whatever the seed produces, the geometry makes
  exactly the characterisation the negative declined to make.
- **THE RULE PROPOSED, in five parts:**
  1. **ONE SHARED DEFAULT.** Every entry whose margin half is a recorded negative renders the
     SAME margin parameter set — same `sharpness`, `spikeCount`, `spikeLength` AND seed — so the
     placeholder is recognisable by recurrence: a reader who sees two uncharacterised entries
     sees the same mass twice, which is what a default looks like and a measurement never does.
  2. **RESERVED, NOT NEUTRAL.** The default set is declared in the mapping table as RESERVED:
     no cited category maps to it and it maps to no cited category — cited circumscribed sits
     below it and cited infiltrative above it on the spike axis — so a cited entry never
     renders like the placeholder and the placeholder never renders like a cited entry.
     "Neutral" is not a category the literature has; "reserved" is a property of the mapping
     the atlas controls.
  3. **THE LABEL CARRIES THE HONESTY, ON SCREEN.** The tumour's in-product text and aria state
     it — wording to ratify: "Margin: not characterised at gross level in the cited sources;
     drawn as the atlas's generic mass." Data rule 2 applied to a shape: geometry cannot say
     "uncharacterised", prose can, and the manifest alone is not user-facing.
  4. **GROWTH GOVERNS WHERE GROWTH IS CITED.** Where the growth half is cited and dictates the
     mass form — CRC's ulcerated form, OCCC's cystic-and-solid mass, bladder's papillary
     fronds — the growth expression governs the silhouette and the margin knobs stay at the
     reserved default. A margin negative never overrides a cited growth form, and a cited
     growth form is never read back as a margin category.
  5. **NO SILENT UPGRADE.** The negative stands until a source supplies the category. A default
     that happens to look right for an entry is not evidence; the pre-registered outcome
     changes only by a read, recorded in the ledger.
- **NOT SETTLED HERE, FOR RATIFICATION:** the label wording; whether the placeholder also
  carries a DOM-register cue (a dashed silhouette or legend badge — permitted, since it is unlit
  and outside the illumination path per condition (5)) or whether recurrence plus label is
  enough; and the reserved values themselves, which are magnitude — illustrative by the split,
  chosen for legibility at build time and disclosed.
- **WHERE THE CONSTRAINT BINDS:** the knob line in `main.js` carries the trigger comment,
  appended to the line so no tracked pointer into that file moved; that is the line the build
  will edit, and the person editing it may never open this document.

## Status log
- 2026-09-05: document opened; knobs verified in source; consequence mapping and
  epistemic split recorded; calibration batch defined.
- 2026-09-05 (register + mitigations): tumour = GROSS-SPECIMEN construct decided
  (vocabulary of record = gross pathology; radiologic = disclosed cross-register only);
  PathologyOutlines adopted with NO-DISCRETION Phase-3 (the never-at-source-quote
  class); PDQ purpose-shaped-coverage lesson logged against Phase B's backbone
  assumption too. Breast calibration read re-pointed: gross pathology first, BI-RADS
  disclosed fallback.
- 2026-09-05 (unit decision + reads 3–4 attempted): threshold-premise dependency
  recorded (share value + source logged per determination; boundary set re-tests when
  the pull lands). BREAST read complete via the unit decision — the rendered entry is
  TNBC/basal-like, margin characteristically PUSHING, citation already verified
  in-atlas (Livasy, "pushing margin of invasion (14/23)", abstract). PANCREAS + KIDNEY
  gross reads BLOCKED-TO-TOOLING TODAY: PathologyOutlines rate-limits (429,
  Retry-After 86400 — retry after 2026-09-06); archive route unreachable from this
  tooling. Lesson #1 EXTENDED: StatPearls' clinical chapters (pancreatic, RCC) carry
  no gross-appearance descriptions either — the reachable clinical tertiaries are
  consistently thin on gross pathology, making PathologyOutlines the gross-pathology
  tertiary of record (no-discretion Phase-3 when it answers).
- 2026-09-05 (calibration reads 1–2 of 4): STOMACH diffuse → wall category CITED
  verbatim (PDQ Gastric HP, 2025-02-21: "…infiltration of the gastric wall (i.e.,
  linitis plastica)") — the new rendering expression has its citation. PANCREAS
  surfaced calibration lesson #1: PDQ TREATMENT pages carry no gross-pathology
  descriptors; growth-pattern/margin categories live in pathology tertiaries
  (PathologyOutlines, WHO) and radiology vocabularies (BI-RADS) — per-property source
  classes corrected in `_phaseA_citations`. Pancreas/breast/kidney reads queued under
  the corrected classes.
- 2026-09-08 (reads opened, 2026-09-09T01:38Z): **RATE-LIMIT MEASUREMENT RESULT — RE-SOURCE.** The
  first fetch of the plan (pancreasductal.html, one request, headers recorded) returned HTTP 429,
  `retry-after: 86400`, `server: Sucuri/Cloudproxy`, body a "Too Many Requests" page with no
  CAPTCHA. The limit had NOT cleared for this client despite the 2026-09-06 window. Per the plan
  no second probe inside a Retry-After window; whether the cap is daily or persistent is
  indistinguishable from one fetch and irrelevant to today's work, so the verdict is the plan's
  re-source branch. Recorded as GATED, not bypassed. PathologyOutlines is "unreachable today" and
  the hierarchy's rung (2) carries the reads: WHO-named statements in reachable open-access
  sources (WHO-classification summary papers, PMC reviews and series with gross descriptions),
  StatPearls chapters that carry a gross section, PDQ pathology text where it exists; teaching-
  atlas captions or Libre Pathology only as disclosed tertiaries of last resort, Phase-3 form,
  text only and never images.
- 2026-09-08 (before any read): **THE EXTERNAL QUEUE, ENUMERATED — 19 items.** The thin-in-atlas
  set × {margin, growth}: pancreas/PDAC, kidneys/ccRCC, colon/CRC, lungs/LUAD (gross), skin/
  melanoma (register caution), liver/HCC, ovary/HGSOC, ovary/OCCC, thyroid/PTC = 18; plus the
  bladder/UC exophytic-papillary growth half = 19. Second tier, not in this queue: stomach margin,
  testis growth, bladder margin, FTC growth, GBM margin (the same fact as its growth), prostate
  margin and TNBC growth (both seeded). Extent is ONE read for all sixteen (SEER Summary Stage
  extent categories), not a per-entry read; site stays retired to the existing pos3d citations.
- 2026-09-08 (before any read — the only fetch so far returned a block page carrying no content):
  **PRE-REGISTRATION: 3 of the 19 are expected to land in the pre-registered negative (range 2–4)**,
  named so a low number afterwards is a result and not a relief. LUAD gross margin — a peripheral
  grey-white mass whose margin the literature describes as variable, so a generic mass with an
  honest label; PTC margin — infiltrative and encapsulated variants straddle the divergence
  threshold, expected to resolve as a NAMED divergence or the negative; skin/melanoma margin — the
  gross register may not carry the category at all (ABCD border vocabulary is clinical-
  dermoscopic), a SOURCE-LANDSCAPE negative rather than a biological one. Fourth candidate: colon
  margin, likely subsumed by the ulcerated/annular growth category. Everything else is expected to
  carry a distinctive gross category: PDAC infiltrative and ill-defined; ccRCC circumscribed with a
  pseudocapsule; CRC exophytic/ulcerated/annular; HCC nodular with pseudocapsule and satellite
  nodules in a cirrhotic liver; HGSOC papillary excrescences on a solid-cystic mass; OCCC a mural
  nodule in a cyst; bladder papillary fronds; melanoma radial-then-vertical growth. Also pre-
  registered: at least one register-substitution temptation (skin), to be DISCLOSED if used, never
  silently taken. Sourcing work pulls toward finding something citable for every entry; "no
  distinctive morphology" is the outcome that pull suppresses, which is why the count is written
  down first.
- 2026-09-08: **FOUR RULES POSTDATE THIS DOCUMENT AND BIND EVERY READ** (user): (a) CARRY THE COUNT
  WITH THE PERCENTAGE — wherever a source gives both, both go in the same parenthetical (a bare
  percentage is invisible to `fraction_check`); (b) CHECK THE SOURCE AGAINST ITSELF — abstract,
  Results and Discussion read for internal agreement before any figure is quoted (thyroid's 42.4%
  was faithfully copied from an abstract that disagreed with its own Results, and verbatim
  verification passes on that class); (c) A DEFECT FOUND BY CONTRAST HAS SIBLINGS WITHOUT ONE —
  when a read finds a defect by comparing two records, sweep the whole block for the shape (the
  EGFR qualifier gap surfaced only because its sibling carried the clause; PDGFRA had the identical
  gap and no comparator); (d) `absence_claim_check`'s flag tier catches world-scoped universals —
  morphology categories are comparative by nature, so no "uniquely", "the only" or "unlike any
  other" enters a category claim.
- 2026-09-09: **THE 19 READ — LEDGER** (full records with verbatim quotes and identifiers in the
  manifest's `_phaseA_citations`, items R1–R19 + EXT; every source retrieved 2026-09-09; hierarchy
  rung (2) throughout because PathologyOutlines stayed gated). CITED 12: PDAC margin (poorly
  delineated, G) and growth (infiltrative, H disclosed); CRC growth (named divergence: ulcerating
  55–60% / polypoid 25% / flat 15–20% / diffuse 1%, review ranges without counts); melanoma margin
  (irregular border, C disclosed) and growth (radial then vertical); HCC margin (named divergence
  with counts: nodular types I–III 348/400 against infiltrative 52/400, smooth against extranodular
  inside the nodular majority) and growth (LCSGJ nodular classification; satellites ≤2 cm); HGSOC
  growth (bilateral large masses, rung 1 + corroboration); OCCC growth (cystic-and-solid unilateral
  mass, rung 1); PTC margin (poorly defined, rung 1) and growth (invasive); bladder exophytic-
  papillary growth (named divergence: ~75% NMIBC whose Ta component is non-invasive papillary
  carcinoma, against ~25% MIBC). NEGATIVE 5: CRC margin (subsumed by growth form), LUAD margin,
  LUAD growth, HGSOC margin (the source itself says the surface is variable), OCCC margin (no
  category in the source). UNREACHED 2: ccRCC margin and growth — blocked-to-tooling, not
  negative; retry PathologyOutlines after the window; a near-miss is recorded there (a papillary-
  RCC table row's pseudocapsule sentence, checked by position and not taken for ccRCC). EXTENT:
  one read for all sixteen — NCI's public-domain staging page carries the five Summary Stage
  categories verbatim (in situ / localized / regional / distant / unknown); the SEER 2018 manual
  is named, its PDF not fetched.
- 2026-09-09: **PRE-REGISTRATION SCORED.** Expected 3 negatives (range 2–4); measured 5 — OVER BY
  ONE, reported as measured. Named candidates: LUAD margin FIRED, CRC margin FIRED, PTC margin DID
  NOT (StatPearls' Gross Findings carries "typically presents as an invasive neoplasm with poorly
  defined margins"), skin margin DID NOT (a skin lesion's clinical surface is its gross appearance,
  and the source's sentence is not the ABCD dermoscopic vocabulary). Unnamed negatives: LUAD growth,
  HGSOC margin, OCCC margin. THE FINDING THE SCORE CARRIES: negatives are 4 of 9 MARGIN halves
  against 1 of 10 GROWTH halves — the gross literature carries growth FORM as a category far more
  often than margin CHARACTER, above all for cystic or variable tumours (both ovarian entries),
  and the pre-registration undercounted because it reasoned per ENTRY rather than per PROPERTY.
  The pull toward finding something citable was real and was resisted where it mattered: HGSOC's
  expected "papillary excrescences" gave way to the source's own "may be smooth, coarse or
  sometimes entirely exophytic", and the negative was taken.
- 2026-09-09: **THE FOUR RULES, APPLIED.** (a) counts carried where the source gives them (HCC
  118/129/101/52 of 400; the CRC and bladder sources give percentages only, said so); (b) every
  quoted figure checked against its own document (Gut 2023's counts sum to 400 and its
  percentages recompute; the NMIBC review's over / more than / the majority (75%) agree, and the
  cross-source "almost 75%" is carried as ~75%); (c) no defect was found by contrast, so no sibling
  sweep was triggered; (d) no "uniquely", "the only" or "unlike any other" entered a category claim.
- 2026-09-09: **SOURCE-LANDSCAPE LESSONS FOR THE REMAINING READS.** WHO-classification summary papers
  (digestive PMC7003895, female genital PMC8494521) carry no gross sentences and the lung,
  urogenital, skin and endocrine summaries are not open access; StatPearls chapters carry no
  gross text for colon, lung, liver, ovary or pancreas — the PTC chapter's Gross Findings
  subsection is the exception to lesson #1; the gross classifications WITH COUNTS live in
  pathology cohort papers and macroscopic-characterization reviews, reachable by Europe PMC BODY:
  phrase search over the open-access subset (which does search full text — measured, not assumed).
- 2026-09-09 (user, on the reads report): **THE MARGIN/GROWTH ASYMMETRY HAS A BUILD CONSEQUENCE
  THE CITATION RECORD DOES NOT COVER** — recorded as the uncharacterised-margin default above,
  PROPOSED and awaiting ratification before any build touches the knobs.
- 2026-09-09: **THE PRE-REGISTRATION LESSON, RESTATED IN THE USER'S FORM.** "You reasoned about
  which cancers would fail when the structure was which property fails — per cell rather than
  per axis. When a population is a grid, register per axis: the row and column effects are
  usually larger than the cell ones, and they're what a per-cell prediction can't see." Adopted
  as the form for every future pre-registration over a grid (entries × properties): state the
  expected row and column totals, then the cells.
- 2026-09-09: **CALIBRATION LESSON #1 SCOPED DOWN** (user): StatPearls being thin on gross pathology
  is PER-CHAPTER, not per-source — the PTC chapter carries a Gross Findings subsection — so a
  chapter is checked for one before it is ruled out, never assumed thin from its siblings. For
  the ccRCC retry the scoping changes nothing (NBK470336, NBK557644 and NBK563230 were scanned
  whole and carry none), but the next chapter is read before it is dismissed.
- 2026-09-09: **THE NEAR-MISS, NAMED** (user): the position check doing its job — a pseudocapsule
  sentence in a papillary-RCC table row would have been a clean, verbatim, entirely wrong
  citation. Third instance of verbatim-correct, subject-wrong (bladder's scope, thyroid's
  abstract, this table row); carried to the ccRCC retry as its first check: which row, which
  subtype, before which words.
