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
- **DESIGN DOCUMENT (2026-09-09): `.claude/phaseA_growth_design.md`** — the four-mechanism
  decomposition (count / edge falloff / placement / wall) tested against every cited growth word
  in the ledger; survives with two amendments (parenchymal diffuseness is edge extent; a fifth
  kind, composition, exists); per-mechanism category/magnitude/reserved design; build order;
  four rulings requested before code. Nothing below this line is superseded; the document
  refines the consequence mapping rather than replacing it.
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
- **DESIGN DOCUMENT (2026-09-10): `.claude/phaseA_extent_design.md`** — two constraints pre-committed by
  the user before any entry source is read (SEER Summary Stage, never AJCC; breach is MODAL and the render
  must not make it factual), the second-structure problem designed first, the corpus inventory, the
  modality analysis, a pre-committed decision criterion, and the predicted outcome: fifteen entries to
  TEXT via the generalised understated-extent form fed from SEER Stat Facts distributions, melanoma the
  one geometric candidate (the skin block models the layers). Three rulings requested before code.
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
(main.js's own comment: "four abstract blobs POSITIONED TO ENCODE A SPREAD PATTERN, not
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
  (CITED, PMC6906820, testis.js:239). No external read needed. **ATTRIBUTION CORRECTED IN PLACE
  (2026-09-09, on re-reading the source line before wiring): that span is PMC13218944's (a Front
  Oncol 2026 case report, in its introduction, with the qualifier — "It typically affects young men
  and presents as a well-circumscribed solid intratesticular nodule with fibrous septa and
  lymphocytic infiltrates"); PMC6906820 carries its OWN general statement, in its literature
  review: "Macroscopically, seminomas are well circumscribed, tan to pale yellow lesions with
  necrotic or hemorrhagic foci." The verdict stands; the span was filed under the wrong id.**
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

## The uncharacterised-margin default (RATIFIED 2026-09-09, with one substantive change)
User, on the reads report: "A negative on margin needs a rendering answer, not only a record."
Proposed the same day and ratified with one change — the one that decides whether the rest works.
- **THE PROBLEM.** Margin drives `sharpness` and `spikeCount`, the most visually distinctive
  knobs in the mapping, and after the reads five entries (four if ccRCC resolves) carry NO
  cited margin category. A renderer must still draw something, and every shape a mesh can
  take reads as an assertion about margin: a smooth default says "circumscribed", a spiky one
  says "infiltrative". If those entries render whatever the seed produces, the geometry makes
  exactly the characterisation the negative declined to make.
- **THE RULE, in five parts:**
  1. **ONE SHARED DEFAULT.** Every entry whose margin half is a recorded negative renders the
     SAME reserved form — same parameters AND seed — so the placeholder is recognisable by
     recurrence to anyone who sees two uncharacterised entries.
  2. **RESERVE AN AXIS, NOT A POINT** (the user's change). The proposal placed the default
     between cited circumscribed and cited infiltrative; that puts it ON the spike scale, and a
     midpoint on a scale is a value — it reads as "intermediate margin", a claim the negative
     declined to make, the whole proposal's failure one level in. The reserved form is
     ORTHOGONAL: a treatment the cited categories never use — for instance a gentle uniform
     undulation at a frequency outside the cited range — not smooth, not spiculated, and not on
     the line between them. A MODE rather than a value, so a reader sees "this is doing
     something different" instead of "this is a bit spiky". **TESTABLE PROPERTY, which the
     reserved values otherwise lack: the reserved form must be UNREACHABLE from any cited
     category's parameter range.** Checkable rather than judged; the orthogonal axis satisfies
     it for free where a midpoint never can. The check ships WITH the build, before the first
     cited category is wired (guard before repair) — A FIRST FOR THIS PROJECT: every guard so
     far arrived after a defect or alongside a repair; this one ships before anything it guards
     exists. DECIDED UP FRONT (user, 2026-09-09): condition (7) is therefore satisfied against a
     FIXTURE, and that is the CORRECT form here, not the weak one — the guard's purpose is that
     the population never contains a violation, so a live firing would mean the rule had already
     been broken. THE CHECK'S OWN HEADER MUST STATE THIS, so no later reader takes "fixture-only"
     for a gap and goes looking for a real demonstration that should not exist. General form in
     CLAUDE.md's condition (7-quater).
  3. **THE LABEL AND A BADGE CARRY THE HONESTY, ON SCREEN — BADGE NON-OPTIONAL.** The
     tumour's in-product text and aria state it (draft wording: "Margin: not characterised at
     gross level in the cited sources; drawn as the atlas's generic mass."), and a DOM BADGE
     marks the record. Weight these ABOVE the recurrence argument: recurrence signals only to
     someone browsing two uncharacterised entries, and most visitors arrive at one cancer from
     a search and leave — for them label plus badge are the entire honesty mechanism. Data
     rule 2 applied to a shape: geometry cannot say "uncharacterised", prose can.
     **DASHED SILHOUETTE: NO.** A dashed outline modifies the mass, so it is another shape
     that reads as a claim about the tumour — poorly demarcated, which is precisely a margin
     assertion. A badge is unambiguously metadata about the RECORD. Same division the marker
     system already runs on: the DOM carries what geometry cannot say, and geometry stops
     trying.
  4. **GROWTH GOVERNS WHERE GROWTH IS CITED.** Where the growth half is cited and dictates the
     mass form — CRC's ulcerated form, OCCC's cystic-and-solid mass, bladder's papillary
     fronds — the growth expression governs the silhouette and the margin treatment stays the
     reserved form. A margin negative never overrides a cited growth form, and a cited growth
     form is never read back as a margin category.
  5. **NO SILENT UPGRADE — the part that will be tested first.** The negative stands until a
     source supplies the category. A reserved form that happens to look right for some entry
     is the exact moment someone reaches for a quiet promotion; the pre-registered outcome
     changes only by a read, recorded in the ledger.
- **STILL OPEN AT BUILD TIME, INSIDE THE RULE:** the final label wording (the draft above
  stands until then) and the reserved values themselves — magnitude, illustrative by the
  split, chosen for legibility, DISCLOSED, and subject to the unreachability check.
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
- 2026-09-09: **THE DEFAULT RATIFIED** (user), with one substantive change folded into the section
  above: reserve an AXIS, not a point on the shared spike scale (a midpoint is a value and reads
  as "intermediate margin"); the reserved form is orthogonal and must be UNREACHABLE from any
  cited category's parameter range — a testable property, checked by a guard that ships with
  the build. Badge yes, non-optional (metadata about the record); dashed silhouette no (a shape,
  hence a margin claim). Label weighted above recurrence, because most visitors see one cancer.
  One shared default, growth governs where cited, and no silent upgrade stand as written.
- 2026-09-09 (user): **THE BUILD IS NOT BLOCKED ON ccRCC.** The two unreached items resolve either to
  cited categories or to the reserved default, and the default is ratified, so the renderer handles
  both outcomes today. Fold ccRCC in when PathologyOutlines' window passes; "the ccRCC pair, then the
  build" read as sequential and is not.
- 2026-09-09 (user): **THE UNREACHABILITY CHECK IS THE PROJECT'S FIRST GUARD TO SHIP BEFORE ITS
  POPULATION EXISTS**, and condition (7) is satisfied against a fixture BY DESIGN — folded into part 2
  of the default and recorded as CLAUDE.md's condition (7-quater), with the requirement that the
  check's own header says so.
- 2026-09-09: **BUILD STEP 1 SHIPPED — THE CHECK AND THE RESERVED DEFAULT, ONE UNIT.** Re-
  parameterisation, not a new renderer: `organicSpiculate` and `IcosahedronGeometry` unchanged.
  - `js/morphology.js` (new, no `three` import so node can load it): `RESERVED_AXIS` = the
    undulation frequency band [1.6, 2.4]; `CITED_FREQ_BAND` = [3.5, 9.0] (existing cited-side
    geometry undulates at 4.2 and 6.5, inside it); `RESERVED_MARGIN` = amplitude 0.18 (0.10 was tried first and read as a smooth sphere in the live
    capture — the circumscribed misread — so it was raised for legibility), freq 2.0,
    seed 3.7, spikeCount 0 — one shared form and seed; `MARGIN_CATEGORIES` EMPTY AT BIRTH by the
    build order; `MARGIN_STATUS` for all 16 active entries from the ledger (4 uncharacterised —
    HGSOC, OCCC, LUAD, CRC; 3 unread — ccRCC, diffuse gastric, urothelial; 9 cited, not yet
    rendered); `ORIGIN_HOTSPOT` per organ (the cited "arises here" structure); `MASS_COLOUR`
    0xa89a8c and `MASS_RADIUS_FRACTION` 0.16 — MAGNITUDES, illustrative by the split, disclosed
    in #disclaimer; `marginBadge()` = the two label texts; `reservedViolations()` = the predicate.
  - `.claude/margin_reserve_check.js` (new, SIXTEENTH battery member): asserts the reserved form
    is unreachable from every cited category (axis band disjoint, box excludes the vector, no
    knob unbounded), every active entry carries a status, every organ anchors its mass at a
    hotspot whose text or organ description speaks of origin. Condition (7) FIXTURE-FORM BY
    DESIGN — eight arms, including the rejected midpoint proposal, which FIRES — and the header
    says why (condition (7-quater)). Sidecar ratchets `categories` (coverage: grows as cited
    categories are wired). First live run: 0 categories, 16/16 statuses, 14/14 organs, 0 problems.
  - `js/main.js`: `addOriginMasses()` after the hotspot loop; the anchor arithmetic factored into
    `hotspotPosition()` so the markers and the masses cannot drift; badges projected in
    `organTick`, removed in `disposeOrganViewer`. WHAT RENDERS TODAY: 7 masses on 6 organs —
    ovary ×2 (HGSOC, OCCC side by side), lungs, colon, kidneys, stomach, bladder. The 9 cited
    entries draw NOTHING until their category is wired: no placeholder ever stands in for a
    cited shape, which is the build order's point. The mass straddles the surface at the origin
    hotspot (the cheap extent read); a second entry sits beside the first along a tangent.
  - BADGE, NON-OPTIONAL: a `.tumour-badge` DOM chip per mass ("generic mass · margin not
    characterised" / "generic mass · margin source not yet read"), a real button whose accessible
    name is the full sentence; activating it writes the sentence into the investigate card. It is
    metadata about the record — pointer-events none, no geometry touched, no dashed silhouette.
  - #disclaimer opens with the disclosure: placeholder masses, one reserved form, unsourced colour,
    status on the badge, morphology illustrative of cited behaviour.
  - NEXT: wire the first cited category (candidates with clean citations: PTC poorly-defined,
    seminoma well-circumscribed, TNBC pushing) into `MARGIN_CATEGORIES` with ranges inside the
    cited band, flip its status, and let the check prove the reserved form stays unreachable.
- 2026-09-09 (user, on the build report): **THE AMPLITUDE CORRECTION FOUND A LIMIT IN THE CHECK,
  RECORDED IN ITS HEADER BEFORE ITS GREEN IS READ AS COVERAGE.** At amplitude 0.10 the reserved
  form was parametrically UNREACHABLE — the check passed it — and perceptually CIRCUMSCRIBED, the
  misread the rule exists to prevent. The check proves PARAMETER DISJOINTNESS; the property that
  matters is PERCEPTUAL DISTINCTNESS, and the first does not imply the second. Fixture-only is
  correct, unreachability is verified, and neither means the reserved form cannot be mistaken for
  a cited one; only looking establishes that, and nothing gates looking.
- 2026-09-09 (user): **THE VISUAL READ HAPPENS PER CATEGORY WIRED**, not once when all nine are in.
  Every cited category narrows the perceptual space the reserved form must stay distinct from,
  and only the parametric half of that narrowing is gated — PTC's poorly-defined margin sits
  closer to an undulating form than seminoma's circumscribed nodule, and the check cannot ask
  about PTC specifically. Procedure, written on the `MARGIN_CATEGORIES` line in `js/morphology.js`
  where the wirer edits: add ranges, run the check, then CAPTURE AND LOOK at the new category
  beside the reserved form, and record the look with the wiring commit.
- 2026-09-09 (user): the main.js pointer staleness in build step 1 is the same file doing the same
  thing twice (the first at 893b3c8, in a settle run); this time caught PRE-COMMIT because the
  pointed lines were read from the tree instead of the draft message being trusted. That class is
  graduating the way the ratchet class did — from found-by-looking toward caught-by-procedure —
  though here the procedure is still a person reading, not a guard.
- 2026-09-09 (user): **WHAT THE RECORDED LOOK CONSISTS OF — EVIDENTIARY, NOT "VERIFIED DISTINCT".** A
  recorded look that is a sentence saying "checked, distinct" is the shape of the annotations that
  spent three days over-claiming: true about what someone did, silent about what they compared. So
  each per-category look records (a) the capture, (b) the two forms named, (c) what specifically
  distinguished them — "PTC's spiculation reads as directional; the reserved undulation reads as
  uniform" is checkable by opening the image; "verified distinct" is not, and is what a tired reader
  writes at the end of a wiring commit. Cheaper to fix in the procedure than after nine exist.
  THE CAPTURE PATH, MADE DURABLE: a /tmp path is the scratch pointer this repo stopped writing, so
  "the capture" is the command `node .claude/capture_organs.js <outDir> <Organ>...` plus the commit
  it ran at — `.claude/capture_organs.js` is now tracked and declared a NON-instrument (evidence, not
  a gate: it asserts nothing, prints facts, writes PNGs outside the tree), promoted from the scratch
  shooter that verified build step 1; the PNG stays out of the tree and is regenerable. Written into
  step 4 of the wiring procedure on the `MARGIN_CATEGORIES` line and referenced from the check's
  header. Demonstrated on Kidneys + Liver at `f845157` (facts.json: one badge on the kidney, none on
  the liver, four markers each, the benign favicon 404 the only console error).
- 2026-09-09 (user, on the pointer record's closing line): "two catches by the same method isn't a
  mechanism" — the honest note that the catch is still a person reading was the right thing to write,
  and calling it a graduation outright would have overclaimed what changed. Left as written.
- 2026-09-09 (BEFORE LOOKING — written before the first capture of the wired form): **PTC WIRED
  FIRST, THE HARDEST PERCEPTUAL CASE** (user): its cited category, "poorly defined margins" (R17,
  StatPearls NBK536943), sits closest to the reserved undulation, so it is the binding constraint on
  whether the reserved form works at all — better discovered with one category wired than eight.
  **PRE-REGISTERED: PTC MAY NOT BE PERCEPTUALLY DISTINCT FROM THE RESERVED FORM.** That is a finding,
  not a failure, and the outcome the build order exists to surface early. The specific expectation:
  at the default framing each mass is a few dozen pixels across, and at that size PTC's many short,
  broad-based projections over fine granular noise may blur into a "rough sphere" while the reserved
  form's two broad swells read as a "lumpy sphere" — a collision at roughly even odds. **THE
  COLLISION RULE** (user): if they collide, THE RESERVED FORM MOVES, never PTC. Pushing PTC's
  sharpness up until the two separate would be inventing magnitude in the direction that flatters
  the render — the cited-category / illustrative-magnitude split abused rather than applied. The
  reserved form's values are illustrative by design and have no citation to violate; it yields.
  PTC's category as wired (category cited; every number illustrative): ranges amplitude [0.10,
  0.16], freq [5.0, 7.0] (inside the cited band), spikeCount [10, 14], spikeLength [0.10, 0.18],
  sharpness [4, 7] — many SHORT, BROAD-BASED projections and fine granularity, i.e. an indistinct
  edge, deliberately not the long fingers that would be a spiculated category; render values
  amplitude 0.13, freq 6.0, seed 5.1, spikeCount 12, spikeLength 0.14, sharpness 5.5.
- 2026-09-09: **THE RECORDED LOOK — PTC (poorly defined) BESIDE THE RESERVED FORM.**
  (a) THE CAPTURE: `node .claude/capture_organs.js <outDir> Thyroid Kidneys Lungs`, default pose,
  run twice on the working tree of the wiring commit (the commit that carries this entry; parent
  `4ec6c06`): FIRST with the reserved form at amplitude 0.18, mass radius 0.16 × organ radius,
  outward offset 0.35 × mass radius; SECOND, the look that stands, at amplitude 0.24, radius 0.22,
  offset 0.6 — the reserved form and two presentation knobs shared by every mass moved; PTC's
  category values (amplitude 0.13, freq 6.0, spikeCount 12, spikeLength 0.14, sharpness 5.5) did
  not, per the collision rule. Re-running the command at this commit regenerates both images.
  (b) THE TWO FORMS: PTC's poorly-defined category on Papillary carcinoma, anchored at the thyroid's
  right-lobe hotspot; the reserved form on Clear cell renal cell carcinoma (kidneys, unread) and on
  Adenocarcinoma (lungs, uncharacterised).
  (c) WHAT DISTINGUISHED THEM, checkable by opening the images: THE SCALE OF THE SURFACE FEATURE.
  PTC's edge is finely knobbed — bumps a small fraction of the mass radius, a crenellated silhouette
  with no clean boundary line; the reserved form's edge is smooth at fine scale and carries one or
  two BROAD swells, a large fraction of the radius, so the mass reads as an uneven egg rather than
  a sphere. In the first capture that distinction did NOT hold: at 0.18 and a few dozen pixels the
  reserved masses read as smooth spheres — i.e. as circumscribed, the misread the rule forbids —
  and PTC's mass sat mostly behind its gland, so the edge under judgement was hidden. So the
  pre-registered collision partly fired, and not where predicted: PTC was distinguishable from the
  reserved form even then (knobby against smooth), but the reserved form collided with the
  circumscribed reading of ITSELF. The second capture separates PTC and reserved on feature scale
  and takes the reserved form off "sphere". RESIDUAL, stated rather than smoothed over: the reserved
  mass still has a continuous, well-defined edge — a reader could call it smooth-bordered — and no
  gentle uniform undulation can avoid that, because a solid placeholder has an edge. That is why the
  label was weighted above recurrence at ratification; geometry carries "not PTC", the badge carries
  "not a claim". Also seen: at the default framing the badge chip overlaps the upper part of the PTC
  mass (its anchor sits near the frame's top, where the clamp pulls the chip down) — a layout
  nuisance, not a claim, noted for the next presentation pass.
  PRE-REGISTRATION SCORED: "PTC may not be perceptually distinct from the reserved form" — did not
  fire as stated; the collision that appeared was the reserved form's own legibility, and it was
  resolved by moving the reserved form, never PTC. Check after the move: unreachable from 1 cited
  category, PTC's render inside its declared ranges, 0 problems.
- 2026-09-09: **THE THREE POINTERS INTO main.js MOVED A THIRD TIME AND WERE CONVERTED TO SPAN FORM.**
  Wiring PTC added lines inside addOriginMasses, above the site-map code, the same shape as build
  step 1 and 893b3c8; caught pre-commit by re-reading the pointed lines. Re-pointing a third time
  would have been the same non-mechanism, so the pointer ruling's remedy was applied instead: this
  document's idiom-collision paragraph and the manifest's copy now cite main.js by the comment they
  quote, and CLAUDE.md's roadmap names the site-map call by the constants on its next line.
  pointer_check's floor lowered by exactly three on the record.
- 2026-09-09 (BEFORE LOOKING — written before the first capture of the wired form): **SEMINOMA
  SECOND, NOT TNBC** (user): the PTC look inverted the ordering logic — PTC separated cleanly even
  at the first capture, and the reserved form's stated residual runs toward CIRCUMSCRIBED (a
  defined edge a reader could call smooth-bordered), so the binding constraint is seminoma's
  well-circumscribed nodule. Same hardest-first reasoning, now pointed at the right target.
  **PRE-REGISTERED: seminoma and the reserved form may not separate.** Specific expectation: seminoma
  renders as a near-sphere (amplitude ≤0.05, no spikes) and the reserved form as an uneven egg with
  broad swells at 0.24; at the default framing I expect them to separate on SPHERICITY — round or
  ovoid against visibly uneven — perhaps seven times in ten; the failure mode is that the reserved
  form's smooth continuous edge makes a reader call BOTH circumscribed, the swells reading as mere
  ovoid asymmetry. **THE COLLISION RULE, PRE-REGISTERED AGAIN** (user): if they do not separate, the
  reserved form moves; seminoma's "well-circumscribed" is cited and has nothing to give. **AND THE
  POSSIBILITY NAMED BEFORE THE CAPTURE** (user): the reserved form may have NOWHERE LEFT TO GO — it has
  been moved twice, and every move away from circumscribed is a move toward one of the other cited
  categories. If seminoma forces a third move, the honest conclusion may be that a single shared
  reserved form cannot sit clear of both ends of the margin axis; the answer would then be the
  badge carrying more weight, or a non-geometric treatment — not a fourth tuning pass.
  Seminoma's category as wired (category cited; every number illustrative): ranges amplitude
  [0.0, 0.05], freq [3.5, 5.5] (inside the cited band), spikeCount [0, 0], spikeLength [0, 0],
  sharpness [0, 0]; render amplitude 0.03, freq 4.5, seed 7.3, spikeCount 0, spikeLength 0,
  sharpness 0 — a smooth, sharply bounded nodule, nothing more, because the citation says nothing
  more. Sources: PMC6906820 ("Macroscopically, seminomas are well circumscribed, tan to pale yellow
  lesions with necrotic or hemorrhagic foci."), PMC13218944 ("typically ... presents as a
  well-circumscribed solid intratesticular nodule"), PMC9162935 (Acad Pathol educational case:
  "This lesion is grossly characterized as well-circumscribed, tan-white, and homogeneous").
- 2026-09-09: **THE RECORDED LOOK — SEMINOMA (well circumscribed) BESIDE THE RESERVED FORM.**
  (a) THE CAPTURE: `node .claude/capture_organs.js <outDir> Testis Kidneys Lungs Thyroid`, default
  pose, run once on the working tree of the wiring commit (the commit that carries this entry;
  parent `c76a14c`); nothing moved after it — no second capture was needed. Re-running the command
  at this commit regenerates the images.
  (b) THE TWO FORMS: seminoma's well-circumscribed category on Seminoma, anchored at the testis's
  seminiferous-tubule hotspot (render amplitude 0.03, freq 4.5, no spikes); the reserved form,
  unchanged from the PTC look (amplitude 0.24, freq 2.0), on Clear cell renal cell carcinoma
  (kidneys, unread) and Adenocarcinoma (lungs, uncharacterised). PTC's thyroid capture rode along
  as the third point of reference.
  (c) WHAT DISTINGUISHED THEM, checkable by opening the images: UNIFORMITY OF CURVATURE, not edge
  sharpness. Seminoma's nodule is a circle of near-constant radius — a round ball with one smooth
  highlight gradient and a crisp rim. The reserved masses are not circles: the lungs mass is an egg
  with a distinct bulge at its lower right, the kidneys mass an oblong with one flattened side; both
  deviate from a sphere visibly, the lungs one strongly, the kidneys one modestly. WHAT THEY SHARE,
  stated: a crisp, continuous boundary with no fuzz. "Well-defined edge" is true of both, and it is
  exactly what a "circumscribed" reading keys on — so the geometric separation rests on a reader
  noticing unevenness, and on the kidney it is a modest unevenness. The badge does the rest, as
  ratification weighted it: geometry says "not a sphere", the badge says "not a claim".
  PRE-REGISTRATION SCORED: separation on sphericity was expected roughly seven times in ten; it
  held, on the predicted discriminator, in both reserved captures. The pre-registered failure mode
  (both read as circumscribed on edge sharpness) is REAL AS A RESIDUAL and not decisive, because the
  shapes differ. THE COLLISION RULE WAS NOT TRIGGERED: the reserved form did not move; seminoma's
  values, which had nothing to give, were never in question.
  THE NOWHERE-LEFT-TO-GO POSSIBILITY, SCORED AS A BOUNDARY REACHED, NOT A FAILURE: the reserved form
  now sits between the two ends of the margin axis sharing one property with each — a smooth edge
  with seminoma, unevenness with PTC's irregularity — and the only further separation from
  circumscribed available to a gentle uniform undulation is more amplitude, which walks toward a
  LOBULATED reading (discrete bulges with clefts), a category the atlas will likely cite for another
  entry. So the geometry has used its room. The rule as ratified already answers this: a fourth
  tuning pass is not the remedy; the badge and label carry the "not a claim" half, and they are
  non-optional for exactly this reason. No third move made; none proposed.
  ALSO SEEN: the badge chip overlaps the top of the seminoma nodule at the default framing, the same
  layout nuisance as PTC's; still a presentation-pass item, not a claim.
- 2026-09-09 (BEFORE LOOKING — written before the first capture of the wired form): **HCC THIRD, NOT
  TNBC** (user), and the reason is in the seminoma look's own scoring of the boundary: the reserved
  form's only remaining separation from circumscribed is more amplitude, which walks toward a
  LOBULATED reading — and HCC's named divergence is nodular against infiltrative, with the nodular
  majority characteristically multinodular in gross appearance (Gut 2023: types II and III, single
  nodular with extranodular growth and confluent multinodular, 230/400 between them; single smooth
  nodular type I 118/400; infiltrative type IV 52/400). Nodular HCC is the closest thing to
  lobulated among the remaining seven. **PRE-REGISTERED: A DEADLOCK IS THE EXPECTED OUTCOME.** If
  the nodular form and the reserved form do not separate, the collision rule says the reserved form
  yields — and it has nowhere to yield to: less amplitude walks into seminoma's sphere, more into
  HCC's lobules. Specific expectation: both render as "a blob with a few broad bulges"; the
  discriminator, if any, is that HCC's nodules are DISCRETE rounded lobules with clefts between
  them while the reserved swells are a CONTINUOUS undulation with no clefts — a distinction I expect
  to be legible at the default framing perhaps four times in ten. **WHAT HAPPENS ON DEADLOCK, DECIDED
  NOW** (user): a fourth tuning pass is the thing NOT to reach for. The answer stops being geometric:
  the badge carries more weight, or the reserved form takes a NON-GEOMETRIC treatment — and which,
  is a ruling for the user, not a build-time choice. Candidates to lay out if it comes to that, none
  taken here: a distinct placeholder colour (colour is already illustrative and disclosed for every
  mass, and a placeholder-grey against a tissue-tan is metadata a badge-blind visitor still sees),
  or a translucent placeholder (opacity, not transmission — the transmission investigation was a
  null result in this pipeline). Both leave the geometry as it is. Better to reach this at category
  three than at seven with four more looks recorded against a boxed-in form.
  HCC's category as wired (category cited; the divergence NAMED on the badge; every number
  illustrative): render the nodular MAJORITY as a mass with a few large, broad, rounded protrusions —
  ranges amplitude [0.02, 0.06], freq [3.5, 5.0] (inside the cited band), spikeCount [2, 4],
  spikeLength [0.25, 0.45], sharpness [1.5, 3.0] (LOW sharpness = wide cones = lobules, deliberately
  the opposite corner of the spike axis from PTC's many short sharp bumps); render amplitude 0.04,
  freq 4.0, seed 9.2, spikeCount 3, spikeLength 0.35, sharpness 2.2. The infiltrative minority (52 of
  400) is NAMED on the badge and not drawn — one tumour per entry, per the unit decision; drawing
  the infiltrative form would be a split, which is an explicit decision this step does not take.
- 2026-09-09 (user): **THE LEDGER ATTRIBUTION ERROR DESERVES ITS LINE.** A span filed under the wrong
  PMC id, inside the Phase A record, written days ago under this discipline: the class does not
  exempt the records built to avoid it. Catching it BEFORE wiring rather than after is guard-before-
  repair applied to citation data instead of code — the first time that ordering has been tested on
  something other than a defect in the corpus. Recorded in CLAUDE.md beside the guard-before-repair
  ruling.
- 2026-09-09: **THE RECORDED LOOK — HCC (nodular) BESIDE THE RESERVED FORM: THE DEADLOCK FIRED.**
  (a) THE CAPTURE: `node .claude/capture_organs.js <outDir> Liver Kidneys Lungs Testis`, default
  pose, run once on the working tree of the wiring commit (the commit that carries this entry;
  parent `d24513d`). Nothing was moved after it, by rule. Re-running the command at this commit
  regenerates the images.
  (b) THE TWO FORMS: HCC's nodular category on Hepatocellular carcinoma, anchored at the liver's
  hepatocyte hotspot (render amplitude 0.04, freq 4.0, three broad lobules of length 0.35 at
  sharpness 2.2); the reserved form, unchanged since the PTC look (amplitude 0.24, freq 2.0), on
  Clear cell renal cell carcinoma (kidneys) and Adenocarcinoma (lungs); seminoma's sphere on the
  testis rode along as the circumscribed reference.
  (c) WHAT WAS SEEN, checkable by opening the images: NO FEATURE SEPARATES THEM AT THE DEFAULT
  FRAMING. HCC's mass reads as a rounded pale lump with one broad bulge and a faint notch on its
  left side — the lobules are there in the geometry but at a few dozen pixels they read as
  unevenness, not as discrete nodules with clefts. The reserved masses read, as before, as an egg
  with a bulge (lungs) and an oblong with a flattened side (kidneys). "A blob with a few broad
  bulges" describes all three. The pre-registered discriminator — discrete lobules with clefts
  against a continuous undulation — is not legible at this size; I could not write a sentence about
  the liver image that a reader could not also write about the lungs image. Seminoma's sphere, by
  contrast, is still distinct from all of them (uniform curvature, crisp rim).
  PRE-REGISTRATION SCORED: the deadlock was named as the expected outcome and it occurred. The
  collision rule says the reserved form yields; it has nowhere to yield to — less amplitude walks
  into seminoma's sphere (the seminoma look put the reserved form's residual there already), more
  walks further into HCC's lobules. THE RESERVED FORM WAS NOT MOVED, HCC's VALUES WERE NOT TOUCHED,
  and a fourth tuning pass was not reached for, per the decision made before the capture.
  WHAT THIS ESTABLISHES: a single shared reserved form on the undulation axis cannot sit clear of
  BOTH ends of the margin axis once a lobulated-family category is wired. The geometry has used its
  room, as the seminoma look scored; the answer is no longer geometric. TWO THINGS STAND AS THEY ARE
  TODAY: the badges already separate the two on screen ("margin: nodular · cited" against "generic
  mass · margin not characterised / source not yet read"), and every reserved mass carries its
  label; what is missing is a distinction a badge-blind visitor sees. FOR THE USER'S RULING, laid
  out and not taken: (1) badge weight only — accept geometric non-separation and rely on the
  non-optional label; (2) a distinct PLACEHOLDER COLOUR for reserved masses (colour is illustrative
  and disclosed for every mass; a placeholder-grey against tissue-tan is metadata a badge-blind
  visitor still sees, and it modifies no shape, so it makes no margin claim); (3) a TRANSLUCENT
  placeholder (material opacity, not transmission), reading as "not asserted". Each leaves the
  geometry as it is; none is a tuning pass.
  ONE MORE THING SEEN, kept apart from the deadlock: HCC's lobulation is FAINT at the default
  framing — the render sits mid-range in its declared ranges, and whether "multinodular" is
  under-drawn is a question about fidelity to the CITATION (discrete nodules), which is the only
  ground on which HCC's values may ever move. It must not be moved for separation. Not moved here.
- 2026-09-09 (RULING on the HCC deadlock, user): **OPTION 2, WITH ONE CHANGE — NOT GREY.** Grey is
  inside the space of real tissue appearance (necrosis is grey, fibrous tissue grey-white), so a
  grey mass can be read as a claim about what the tissue is: the amplitude-0.10 midpoint relocated
  from geometry to colour, a value chosen inside the space of things the render could be asserting.
  The colour comes from OUTSIDE the tissue gamut, and the atlas already has the vocabulary: the
  marker teal is the app's established "this is interface, not anatomy" colour, no tissue in the
  corpus is teal, and a desaturated version says placeholder in a language the product already
  speaks. THE TESTABLE PROPERTY, the colour twin of the geometry's: the reserved colour must be
  unreachable from every cited tissue albedo — checkable by extending `margin_reserve_check` one
  field, not by building anything. OPTION 3 REJECTED: translucency is inside the space of real
  appearances too (cystic, mucinous, gelatinous are gross descriptions), so a see-through mass reads
  as a material property — one misread swapped for another. OPTION 1 REJECTED: it relocates the
  misread from "reads as circumscribed" to "reads as nodular", and the badge-blind visitor is
  precisely the reader the ratification identified as carrying the whole honesty burden. THE
  IMPLEMENTATION NOTE THAT WOULD OTHERWISE BITE (user): exclude the reserved masses from the
  cited-albedo fidelity measurement — they have no citation to deviate from and would register as
  an enormous hue and saturation error against a value never claimed. And the HCC-lobulation
  sentence stays exactly as written: fidelity to the citation is the only ground its values may
  ever move on, never separation — the thing that stops the next tuning pass arriving dressed as
  accuracy.
- 2026-09-09 (BUILT, before looking): `RESERVED_COLOUR` 0x6aafaa — the marker teal 0x35c9c1 desaturated
  to hue 176°, saturation 0.30, lightness 0.55; MEASURED FIRST: every hex albedo in js/organs sits on
  the warm arc, hue 355°–46°, the nearest 129° away. `RESERVED_COLOUR_RULES` = at least 90° of hue
  from every chromatic tissue albedo, saturation at least 0.20 (never grey). `colourViolations()` in
  the module; the check's colour field asserts it over every hex in js/organs plus the cited-mass
  tan, with three fixture arms (a grey reserved colour fires; a reserved colour inside the tissue
  arc fires; the live teal is silent). It is an ALBEDO, not a light — standing condition (5) is about
  the illumination path, and this pipeline has no bounce. Cited masses keep the tissue-tan
  `MASS_COLOUR`. Every mass is now NAMED `phaseA-mass` with `userData.phaseA.reserved`, so the
  lit-face fidelity measurement excludes reserved masses BY IDENTITY (condition (3): read identity,
  never infer it) — recorded beside condition (3) in CLAUDE.md. #disclaimer says which masses wear
  which colour and why. PRE-REGISTERED FOR THE COLOUR LOOK: the muted teal is expected to read as
  interface/placeholder against every organ colour; the risk to watch is the deep-red kidney, where
  the complementary contrast may make the placeholder pop like a marker rather than sit like a mass.
- 2026-09-09 (THE COLOUR LOOK, recorded in evidentiary form): (a) `node .claude/capture_organs.js
  /tmp/atlas-verify/colour1 Kidneys Lungs Ovary Liver Thyroid --port 3064` then `... Ovaries --port
  3065` (the sidebar label is "Ovaries"; the first run recorded "no sidebar row matched" for "Ovary" —
  a wrong label, not a missing organ), served from the working tree of THIS commit (the tool stamps
  HEAD, f63aa37, whose morphology.js has no RESERVED_COLOUR — the bytes it served are the ones this
  commit records). (b) Two treatments compared: the RESERVED masses (kidneys, lungs, both ovary
  masses) against the CITED masses (liver HCC, thyroid PTC) and every organ body in frame.
  (c) WHAT DISTINGUISHED THEM, measured in the PNGs (mean of a rectangle inside each mass, pure-PNG
  decode, HLS): kidneys reserved mass #688a7e hue 159°; lungs reserved mass #5c746e hue 164°; liver
  cited mass #a18e7a hue 30°; thyroid cited mass #72665e hue 26°; organ bodies kidneys #70291e 8°,
  lungs #9f655e 7°, liver #5c2d22 11°. The reserved colour renders on the cool side (159–164°) and
  everything cited in frame on the warm arc (7–30°): about 130° apart in the RENDERED image, not just
  in the albedo. Honest limit: under the warm key light and AgX the rendered saturation of the reserved
  mass falls to 0.12–0.14 (the albedo's is 0.30) — it reads as sea-glass, a pale matte green-grey, not
  as a vivid teal; its HUE is unambiguous, its vividness is not, so anyone re-checking should compare
  hue, not "how teal it looks". THE PRE-REGISTERED RISK DID NOT FIRE: on the deep-red kidney the mass
  sits as a matte pale lump while the markers stay small saturated glowing dots; nothing pops like a
  marker. Ovaries: two stacked reserved masses, both sea-glass, badge chips stacked above. Checkable
  by opening kidneys.png beside liver.png: one mass is green-grey, the other tan — no organ on any
  screen is in the green-grey family.
- 2026-09-09 (THE COLLISION RULE'S THIRD ARM, user — recorded BEFORE the next capture): the colour
  removed the constraint that drove the ordering, so the binding constraint moved somewhere the two
  existing arms do not reach. Arm 1, reserved-versus-cited: the reserved form yields — now largely
  moot, the colour carries the placeholder reading. Arm 2, deadlock: non-geometric answer — taken.
  **ARM 3, CITED-VERSUS-CITED: NEITHER MOVES.** Two cited categories that do not separate is WORSE
  than either failing to separate from the placeholder: both are claims, both are tissue-coloured,
  and no badge says they are different. But both have citations and neither has magnitude to spend
  without inventing it. So if two cited categories do not separate, the conclusion is not a tuning
  problem — the citations may describe ONE gross appearance, which the literature would likely
  agree with; two categories rendering identically with the distinction carried in prose is the
  truthful outcome. Manufacturing a visual difference between them would be exactly the invention
  the split forbids, pointed at a second cited category instead of at the placeholder. So the
  capture is informative either way: SEPARATION means the axis has room; COLLAPSE means the
  citations describe one appearance and the atlas should SAY SO (on the badge, in words).
- 2026-09-09 (ORDERING, fourth application of hardest-first, user): the six unwired cited categories
  fall into two families each holding one wired member — CIRCUMSCRIBED: seminoma (wired), TNBC
  pushing, FTC encapsulated; ILL-DEFINED: PTC (wired), PDAC poorly delineated, melanoma irregular
  border. Wire the closest pair next, aimed at the pairs most likely to collapse: FTC (nearest to
  seminoma) and PDAC (nearest to PTC).
- 2026-09-09 (FOUND BEFORE WIRING, read from the tree): `MARGIN_STATUS.ftc` has stood at `cited` since
  build step 1 on the strength of `ref: 'harvest — seeded (encapsulated), not yet rendered'`. The seed
  is the thyroid.js comment at its line 270 — "invasive encapsulated FVPTC with the RAS-like
  malignancies alongside FTC" — a sentence about ENCAPSULATED FVPTC (follicular variant of
  papillary carcinoma), not about follicular carcinoma's gross margin, and the harvest ledger above
  already called it "FVPTC-adjacent context". A seed is not a citation, and `cited` was an
  over-statement of my own making: the status census counts DECLARATIONS and cannot tell a seed
  from a read (limit now stated in the check's header). So FTC gets its own read before any wiring,
  and the status is corrected whatever the read returns: cited (with the real source) if a gross
  sentence about FTC exists; otherwise `unread`, and the census count moves 9→8.
- 2026-09-09 (PRE-REGISTERED BEFORE THE FTC READ): ladder (1) the StatPearls Follicular Thyroid
  Cancer/Carcinoma chapter via PubMed `statpearls[book]` → NBK → Bookshelf HTML (per-chapter lesson:
  StatPearls' Gross/Histopathology content varies chapter to chapter); (2) Europe PMC OA full text,
  "follicular thyroid carcinoma" with "encapsulated" in a GROSS description. PREDICTION: FTC's gross
  margin is ENCAPSULATED with a NAMED DIVERGENCE — minimally invasive FTC is an encapsulated nodule,
  widely invasive FTC is not — because the standard framing of FTC is by capsular and vascular
  invasion. THE RISK: that framing is HISTOLOGIC (capsular invasion seen on section), so the
  sentence found may be in the wrong register; a histologic-only sentence scores NEGATIVE on the
  register rule (gross-specimen construct), not positive. Scoring: POSITIVE = a sentence describing
  FTC's gross appearance as encapsulated/well-circumscribed; DIVERGENCE = the source splits
  minimally from widely invasive; NEGATIVE = invasion language only, or nothing gross.
- 2026-09-09 (PRE-REGISTERED FOR THE PAIR, per axis on the grid pairs × outcome): the five knobs are
  amplitude, freq, spikeCount, spikeLength, sharpness. Each new category's ranges are derived from
  ITS OWN citation's words and nothing else; arm 3 forbids adding any difference the words do not
  carry. (a) FTC–SEMINOMA: "encapsulated" and "well circumscribed" both describe a smooth, sharply
  bounded nodule; the capsule itself is a feature none of the five knobs can express, and a new
  renderer (a rim) is outside the ratified build (re-parameterisation, not a new renderer).
  PREDICTED: COLLAPSE AT THE PARAMETER LEVEL — the derived region is wellCircumscribed's, so the
  render is identical by construction, shared by reference and declared (`sameAppearanceAs`), and
  the badge says so in words. (b) PDAC–PTC: R1 "atrophy of flanking pancreatic parenchyma and
  fibrosis often blur the macroscopic delineation of the tumour" against R17 "invasive neoplasm
  with poorly defined margins". PTC's idiom is the INDISTINCT EDGE (many short broad-based
  projections over granular noise, explicitly not fingers), justified from "poorly defined";
  "blurred delineation" is the same property in a synonym. Reading "blur" as softer than "poorly
  defined" (lower sharpness, fewer projections) would manufacture a difference from synonyms.
  PREDICTED: COLLAPSE AT THE PARAMETER LEVEL, same treatment. WHAT THIS MOVES: if both derivations
  collapse, the informative step is the derivation, not the capture — the capture then checks the
  thing the axis exists for, that two cited masses on ONE organ (PTC and FTC on the thyroid) separate
  ACROSS families, and that every badge says what it must. The direction that would surprise: an FTC
  or PDAC sentence carrying a gross feature the knobs CAN express (lobulation, nodularity) that the
  wired sibling's citation lacks — then the ranges differ on the citation's authority and the axis
  has room. Colour is not available as a cited difference: cited masses wear one unsourced tan.
- 2026-09-09 (THE FTC READ — R20 — scored against the pre-registration): NEGATIVE ON THE REGISTER RULE;
  the divergence structure is real but lives in the histopathologic register. Rung 1: StatPearls
  "Follicular Thyroid Cancer" (NBK539775, PMID 30969597; identity from the page's own title tag) has
  NO Gross or Histopathology section — its only capsule-adjacent sentences are treatment/survival
  lines and a reference title (per-chapter lesson, third instance). Rung 2, Europe PMC OA: J Clin
  Endocrinol Metab 2025, "Impact of Reclassification of Oncocytic and Follicular Thyroid Carcinoma
  by the 2022 WHO Classification" (PMC12012812): "The 2022 WHO Classification categorizes oncocytic
  (OTC) and follicular thyroid carcinoma (FTC), based on the degree of capsular and vascular
  invasion, into minimally invasive (MI), encapsulated angio-invasive (EA), and widely invasive
  tumors (WI)." and "Encapsulated lesions with VI and with or without CI were classified as EAFTC or
  EAOTC (see Fig. 1B), and WI tumors showed extensive growth into the thyroid or adjacent thyroid
  tissue, with no or partial encapsulation, often with a multinodular pattern (see Fig. 1C)." and,
  with the counts carried: "gross extra-thyroidal extension (OTC: n = 4 [12.5%], and FTC: n = 7
  [30.4%]) and multinodular growth (OTC: n = 21 [67.7%], and FTC: n = 12 [52.2%]) were only observed
  in the WI subtypes" (FTC cohort MI 32 / EA 34 / WI 23). That is the predicted divergence
  (encapsulated MI/EA versus non-encapsulated, multinodular WI) — stated as a histology-based
  classification, never as a gross description; the pre-registration scored exactly this case
  NEGATIVE, and it stays negative rather than being re-read as gross because the features happen to
  be macroscopic in scale. Endocr Pathol 2025 (PMC12641037) speaks of FA and FT-UMP, not FTC's
  margin. Two further targeted queries ("grossly"/"macroscopically" with "encapsulated") over twelve
  OA full texts, then a loose re-scan of the on-point review "Encapsulated neoplasms of the thyroid
  gland" (Virchows Arch 2026, PMC12876452, CC BY): classification-register statements only ("Low-risk
  encapsulated follicular-patterned thyroid tumors include ... minimally invasive, follicular and
  oncocytic carcinomas"), no gross sentence. OUTCOME: `MARGIN_STATUS.ftc` → `uncharacterised` (not
  characterised at gross level in the sources read), drawing the reserved placeholder beside PTC's
  cited mass; the histopathologic divergence is recorded here for Phase B (histology shares), where
  the register is right for it. Census: cited 9→8, uncharacterised 4→5. THE OVER-STATEMENT LASTED
  ONE DAY and was found by reading the status's own `ref` before wiring on it — the ordering (read
  the record, then act) working on a status I had written myself.
- 2026-09-09 (PAIR GRID, OUTCOMES): cell (a) FTC–seminoma NOT REACHED — FTC fell at the read, so the
  collapse prediction for that cell stands untested; the circumscribed family's next candidate is
  TNBC pushing. Cell (b) PDAC–PTC: COLLAPSE AT THE PARAMETER LEVEL, AS PREDICTED. Derived from R1's
  words alone ("blur the macroscopic delineation"): one property, an indistinct gross boundary,
  nothing about projections, nodularity or lobulation that R17 lacks — so the derivation lands on
  the indistinct-edge region already used for PTC. Under ARM 3 the render is SHARED BY REFERENCE
  (`INDISTINCT_EDGE_RANGES` / `INDISTINCT_EDGE_RENDER`, hoisted; PTC's values unchanged) and DECLARED
  (`sameAppearanceAs: 'poorlyDefined'`); the badge sentence says so in words ("Drawn with the same
  form as the poorly defined category: the two citations describe one gross appearance, so the
  distinction is carried here in words, not in shape"); `sameAppearanceViolations` asserts only that
  the declaration is TRUE (same render object, equal ranges, referent wired and not chained) — never
  that the pair differs, which would force the invention arm 3 forbids. Categories 3→4 (ratchet).
  The informative step was the derivation, not the capture; what the capture now checks is the
  thing the axis exists for — PTC (cited) and FTC (placeholder) on ONE organ, and PDAC against PTC
  across screens, identical by construction.
- 2026-09-09 (THE PAIR LOOK, recorded in evidentiary form): (a) `node .claude/capture_organs.js
  /tmp/atlas-verify/pair1 Thyroid Pancreas Testis --port 3066`, served from the working tree of THIS
  commit (the tool stamps HEAD, fd250f2, whose morphology.js has neither `poorlyDelineated` nor FTC
  at `uncharacterised`; the bytes served are the ones this commit records). (b) Three things
  compared: on the THYROID, PTC's cited mass beside FTC's placeholder — the first organ carrying a
  cited mass and a reserved mass together; PDAC on the PANCREAS against PTC across screens; seminoma
  on the TESTIS unchanged as the circumscribed reference. (c) WHAT WAS SEEN, checkable by opening the
  PNGs: thyroid.png — two masses at the upper-left lobe, the PTC mass tan and finely knobbed, the FTC
  mass sea-glass green-grey and smooth, with the two chips stacked above ("margin: poorly defined ·
  cited" over "generic mass · margin not characterised"); the pair separates on colour family at a
  glance and on surface texture on inspection — the cited-versus-placeholder distinction holds on one
  organ, which is what the colour ruling was for. pancreas.png — one tan knobbed mass at the head of
  the gland with "margin: poorly delineated · cited"; its form is PTC's by construction (same render
  object, asserted by the check), so the image differs from thyroid.png's PTC mass only in placement
  and lighting; the badge's aria text carries the shared-form sentence verbatim (read from the DOM by
  the capture tool's facts.json). testis.png — seminoma's smooth tan sphere, unchanged. PRESENTATION
  LIMIT, recorded not acted on: the pancreas's own albedo is a tan (0xd8b98e), so the cited-mass tan
  (0xa89a8c) has low contrast there — the mass reads as a slightly greyer lump at the head, and the
  badge carries the identification. Cited-mass colour is illustrative and unsourced; changing it is
  a presentation decision, not a fidelity one, and is not taken here.
- 2026-09-09 (THE FOURTH PROPERTY OF A DECLARATION, user — acting on the FTC finding beyond the entry):
  a `cited` status rested on a harvest seed for four build commits and nothing could see it, because
  the status census counts declarations and cannot tell one backed by a citation from one backed by a
  seed. Closable with the discipline already in place: **a `cited` status must carry a resolvable
  identifier in its ledger record.** A seed has none, so the check fires at build step 1 rather than
  at wiring time — an extension to `margin_reserve_check`, which already reads the module, not a new
  member. It is the fourth property of a declaration, after evidence-not-conclusion, reason-required
  and closed-enumerated-set: **a status claim carries its backing.** The other three govern what a
  declaration says; this one governs whether it is entitled to say it. GUARD BEFORE REPAIR: the check
  is written and run first; its output is the worklist recorded below.
- 2026-09-09 (ORDER, user): TNBC next — cell (a)'s collapse prediction transfers cleanly and it is the
  circumscribed family's remaining member. Then melanoma, testing the ill-defined family's second slot
  against the now-shared PTC/PDAC form — the more interesting of the two, because a third collapse
  onto the same form would say the ill-defined family has one appearance and three names. BUT GBM AND
  PROSTATE GET THEIR STATUS RE-READ BEFORE EITHER IS WIRED, separately from the queue, for reasons
  drawn from what the citations are likely to say rather than what the ledger claims: GBM is
  characteristically DIFFUSELY INFILTRATIVE WITH NO DISCRETE MARGIN — possibly a fourth position on
  the axis rather than a variant of ill-defined, the one entry where "no margin" is the finding rather
  than the absence of one; prostate acinar carcinoma is characteristically GROSSLY INAPPARENT,
  frequently invisible on cut section — if that is what its source says, its honest status is
  uncharacterised for the same reason FTC's is, and wiring it would repeat the error just caught. FTC
  demonstrated the status field can be wrong; the cheapest response is to distrust it for the two
  entries where the biology predicts trouble, before the identifier check exists to distrust it
  systematically.
- 2026-09-09 (PRE-REGISTERED BEFORE THE TWO RE-READS AND THE TNBC BACKING LOOKUP). GBM — ladder: (1)
  StatPearls Glioblastoma via PubMed `statpearls[book]` → NBK → Bookshelf (per-chapter: a Gross or
  Histopathology section may or may not exist); (2) Europe PMC OA full text, "glioblastoma" with
  "grossly"/"macroscopically" and a margin word (demarcat|delineat|ill-defined|poorly defined|
  infiltrat|discrete|border). PREDICTION (the user's): a gross sentence exists and says the tumour is
  poorly demarcated / infiltrates beyond any visible edge — the finding is "no discrete margin".
  SCORING: FOURTH-POSITION = the source says the tumour has no discernible/discrete boundary or
  infiltrates far beyond the apparent mass (a new axis position, DESIGNED later, not wired today);
  ILL-DEFINED = the source gives poorly demarcated/ill-defined and nothing more (a candidate for the
  shared indistinct-edge form under arm 3 — decided at wiring, not today); NEGATIVE = no gross
  sentence → `uncharacterised`. Either positive keeps `cited` and REPLACES the seed ref with the
  identified source. PROSTATE ACINAR — ladder: (1) StatPearls Prostate Cancer / Prostatic
  Adenocarcinoma chapters via `statpearls[book]`; (2) Europe PMC OA, "prostatic adenocarcinoma" or
  "prostate cancer" with "grossly"/"gross examination"/"cut surface" and (not (grossly )?visible|
  inapparent|difficult to identify|ill-defined|yellow|firm). PREDICTION (the user's): a sentence
  says carcinoma is frequently NOT identifiable grossly. SCORING: INAPPARENT = such a sentence →
  `uncharacterised` (the FTC reason: not characterised as a gross margin), and a QUESTION for the user
  recorded, not decided — whether "grossly inapparent" deserves a status of its own that draws no
  mass, since drawing even the placeholder asserts a visible mass the source says is usually absent;
  MARGIN = the source gives a gross margin character when the tumour IS visible (e.g. ill-defined firm
  yellow-white nodules) → `cited` with the identified source, wired later on its own pre-registration;
  NEGATIVE = nothing gross → `uncharacterised`. TNBC BACKING — not a content read: the harvest ref
  names Livasy 2006 (Mod Pathol) without an identifier; look the identifier up from a bibliographic
  record (Europe PMC search on the title), verify the title matches breast.js's citation line, and
  record it. Register note for the wiring step to pre-register: Livasy's "pushing margin of invasion"
  is a HISTOLOGIC assessment of the invasive front (14/23), so TNBC's gross-register margin source is
  NOT YET READ — the truthful interim status is `unread`, not `cited`, until the wiring step's ladder
  runs; if that ladder finds a gross-register sentence TNBC is wired, if not it goes `uncharacterised`
  as FTC did. THE WORKLIST the guard produced is recorded in the next entry, before any repair.
- 2026-09-09 (THE GUARD'S WORKLIST, recorded before repair): `citedBackingViolations` shipped with five
  fixture arms (seed fires; unresolvable R-number fires; R-number to an unidentified record fires;
  R-number to an identified record silent; own PMCID silent and non-cited statuses untested) and ran
  live RED on exactly three entries — `tnbc` ("harvest — pushing margin (Livasy)"), `gbm` ("harvest —
  diffusely infiltrative"), `acinar` ("harvest — seeded (infiltrating patterns)") — 5/8 cited statuses
  backed against 22 ledger records. The three are the two the user named from the biology, plus TNBC,
  whose backing exists but was never written down as an identifier. LIVASY RESOLVED (bibliographic
  lookup, title and first author matched against breast.js's own citation line): Livasy CA et al.,
  Mod Pathol 2006, PMID 16341146, doi 10.1038/modpathol.3800528 — "pushing margin of invasion" 14/23,
  a HISTOLOGIC assessment. TNBC's status becomes `unread` (its gross-register source not yet read) with
  the identifier in the ref; the wiring step's ladder decides between wired and uncharacterised.
- 2026-09-09 (R21 — THE GBM RE-READ, scored against the pre-registration): rung 1, StatPearls Glioblastoma
  Multiforme (NBK558954, PMID 32644380): Histopathology is microscopic only (pleomorphic cells,
  microvascular proliferation, pseudopalisading necrosis), no gross sentence. Rung 2, Europe PMC OA,
  title-restricted: Iacob G, Dinca EB, "Current data and strategy in glioblastoma multiforme", J Med
  Life 2009 (PMC3019011, PMID 20108752, CC BY), Pathology section, antecedent confirmed from the
  paragraph ("Most GBMs are intraparenchymal ... Grossly, it appears ..."): "Grossly, it appears
  topographically diffuse, a poorly delineated mass with no capsula, with prominent areas of old and
  recent hemorrhage (extensive areas of yellowish–brown to red discoloration) and necrosis (as much as
  80% of the total tumor mass), cystic areas sometimes alternating with firm tissue." Same paragraph,
  not gross-register: "It usually presents as an irregular mass in the white matter, infiltrating the
  surrounding parenchyma by coursing along white matter tracts" and "tumor cells are considered to be
  already disseminated at time of diagnosis far in the surrounding parenchyma". Corroboration at a
  broader entity (gliomas, not the citation): Cancer Biol Ther 2026 (PMC12758302, PMID 41439468, CC
  BY): "Macroscopically, gliomas appear as poorly defined masses with grayish peripheries and
  yellowish necrotic centers." A paediatric-GBM xenograft description (PLoS One 2015, PMC4527837) is
  animal tissue and not used. SCORED: ILL-DEFINED WITH A DIFFUSE QUALIFIER. The gross sentence's own
  category word is "poorly delineated" — the same word as PDAC's R1 — and it still calls the tumour "a
  mass"; the fourth-position reading ("no discrete margin" as the finding) is carried by
  "topographically diffuse" and "no capsula" in that sentence and by the dissemination sentence,
  which is not gross-register. So the user's hypothesis is SUPPORTED BUT NOT STATED by the source. GBM
  stays `cited`, the seed ref replaced by the identified source; WHETHER the diffuse qualifier is a
  fourth axis position or a third member of the shared indistinct-edge form under arm 3 is a wiring
  decision with its own pre-registration, not made today. VERIFIED-QUOTED.
- 2026-09-09 (R22 — THE PROSTATE ACINAR RE-READ, scored against the pre-registration): NEGATIVE. Rung
  1: StatPearls Prostate Cancer (NBK470550, PMID 29261872) — Histopathology is the Gleason system,
  microscopic only; the PubMed `statpearls[book]` search finds no prostate pathology/adenocarcinoma
  chapter at all. Rung 2: five Europe PMC OA queries (grossly/gross examination/cut surface with
  visibility and margin words; title-restricted to prostat*), about forty full texts fetched — no
  sentence characterises the carcinoma's gross margin, and no sentence STATES that it is frequently
  invisible on cut section. The nearest are methods sentences that IMPLY it: Cancers 2024
  (PMC11048607): "In cases where larger glands were partially sampled, we followed the protocol by
  submitting the entire tumor if grossly visible ... If there was no grossly visible tumor, a
  systematic sampling strategy was used." and a regional finding about the transition zone (World J
  Urol 2025, PMC12698729: "Macroscopically visible tumor infiltration was rare in this region
  (affecting less than 1% of prostates)"), which is about a region, not the entity. OUTCOME: `acinar`
  → `uncharacterised` (not characterised at gross level in the sources read) — the status the user
  predicted, reached on DIFFERENT GROUNDS: the "grossly inapparent" statement was not found, so it is
  not claimed. THE USER'S QUESTION STAYS OPEN AND CONDITIONAL: if a source is found that states the
  carcinoma is usually not grossly visible, drawing even the placeholder asserts a visible mass the
  source says is usually absent, and a status that draws no mass would need designing; until such a
  source exists the placeholder with its "not characterised" badge is the truthful rendering. The seed
  ("infiltrating patterns", prostate.js Gleason pattern-4/5 text) was HISTOLOGIC — the FTC shape again.
- 2026-09-09 (CENSUS AFTER THE THREE REPAIRS): cited 6 (hcc, gbm, pdac, melanoma, seminoma, ptc — 6/6
  carrying a resolvable identifier), uncharacterised 6 (hgsoc, clear, luad, crc, ftc, acinar), unread 4
  (ccrcc, gdiff, uc, tnbc); 4 categories rendered. Two placeholders newly drawn: TNBC on the breast,
  acinar on the prostate (both previously drew nothing as cited-without-category). Look recorded next.
- 2026-09-09 (THE STATUS-REPAIR LOOK, evidentiary): (a) `node .claude/capture_organs.js
  /tmp/atlas-verify/status1 Breast Prostate Brain --port 3067`, served from the working tree of THIS
  commit (tool stamps HEAD 7d748cd, whose status table still says cited for all three). (b) Compared:
  the two NEW placeholders (TNBC on the breast, acinar on the prostate) against the cited-without-
  category case (GBM on the brain, which draws nothing). (c) Seen, checkable in the PNGs: breast.png —
  one sea-glass green-grey mass at the upper-left of the tan gland with the chip "generic mass ·
  margin source not yet read" (the `unread` wording, correct for TNBC's state); prostate.png — one
  sea-glass mass below the gland with "generic mass · margin not characterised" (the `uncharacterised`
  wording, correct for acinar); brain.png — no mass and no chip (facts.json badges: []), the
  cited-without-category behaviour unchanged. Both placeholders read as interface-coloured, not
  tissue. TWO PRESENTATION NOTES, recorded not acted on: the prostate placeholder is LARGE relative to
  the gland (`MASS_RADIUS_FRACTION` 0.22 of a small elongated mesh's bounding radius), and it is
  prominent on precisely the organ whose carcinoma the user expects to be grossly inapparent — which
  sharpens the open question above (a status that draws no mass) without deciding it, since no source
  yet states the inapparency.
- 2026-09-09 (TNBC — PRE-REGISTERED BEFORE THE READ; the circumscribed family's remaining member, cell
  (a)'s prediction transferred). LADDER: (1) StatPearls Triple-Negative Breast Cancer via PubMed
  `statpearls[book]` → NBK → Bookshelf, Gross/Histopathology (per-chapter lesson); (2) Europe PMC OA
  full text, "triple-negative" or "basal-like" breast carcinoma with grossly/macroscopically and a
  margin word (circumscri|pushing|well-defined|lobulat|ill-defined|infiltrat|border|margin). REGISTER
  RISKS, two of them: the pushing border is Livasy's HISTOLOGIC invasive-front finding (14/23), and the
  circumscribed appearance of TNBC is most often described in the IMAGING register ("circumscribed
  margins on mammography/ultrasound, mimicking benign masses") — neither is gross; a sentence in
  either register alone scores NEGATIVE, as FTC's did. PREDICTION: a gross-register sentence exists
  and says TNBC/basal-like carcinomas are (often) well circumscribed or pushing-bordered grossly, with
  a qualifier to carry (often/frequently); the derived region is wellCircumscribed's, so under ARM 3
  the render is shared BY REFERENCE with a new category key carrying TNBC's own badge source, declared
  `sameAppearanceAs: 'wellCircumscribed'` — COLLAPSE AT THE PARAMETER LEVEL, the badge saying so.
  SCORING: POSITIVE = a gross/macroscopic sentence about TNBC or basal-like carcinoma's margin;
  DIVERGENCE = the source splits (e.g. circumscribed in most, infiltrative in some) — carried as a named
  divergence with counts if given; NEGATIVE = histologic or imaging register only → `uncharacterised`.
  The direction that would surprise: a gross sentence carrying a feature the knobs express that
  seminoma's citation lacks (lobulation, nodularity) — then the ranges differ on the citation's
  authority. Skipped on purpose: the in-atlas breast.js histology block already cited (Livasy) — it is
  the histologic register and cannot be re-read as gross.
- 2026-09-09 (R23 — THE TNBC READ, scored against the pre-registration): NEGATIVE ON THE REGISTER RULE,
  the third harvest-backed status in a row to fall there (FTC, acinar, TNBC — all three seeds were
  histologic). Rung 1: PubMed `statpearls[book]` has NO triple-negative chapter. Rung 2, five Europe PMC
  OA queries, about thirty-five full texts. What exists in the gross register is about OTHER entities:
  secretory carcinoma (Cancers 2021, PMC8616217, CC BY, section 7.1: "Grossly, the typical appearance is
  that of a rounded, circumscribed, greyish-white mass, sometimes with tan to yellow discolouration"),
  fibromatosis-like metaplastic carcinoma (Cancers 2025, PMC12651393, CC BY, section 3.3.6: "The tumors
  are typically well-circumscribed grossly but show microscopic infiltrative borders"),
  adenomyoepithelioma (Virchows Arch 2022, PMC8983547) and secretory carcinoma again (J Pathol Clin Res
  2025, PMC12590242: "Grossly, 25 tumours appeared as well-circumscribed, round to oval nodules, whereas
  4 were ill-defined and stellate") — the favourable-prognosis special subtypes, a minority of TNBC,
  not the basal-like carcinoma the entry describes; by the FVPTC lesson a sentence about an adjacent
  entity does not cite this one. The one GENERAL gross vocabulary found is about invasive breast
  carcinoma as a whole, not TNBC: the Korean Standardized Pathology Report for Breast Cancer (J Breast
  Cancer 2021, PMC7920867; J Pathol Transl Med 2021, PMC7829577; CC BY-NC): "The tumor margins of IBC can
  be grossly described as ill-demarcated, well-demarcated (circumscribed), or mixed" and "Approximately
  one-third of tumors have grossly circumscribed margins" (no count given; the fraction is carried as
  the source states it). It is the gross-register VOCABULARY for the breast margin axis and is recorded
  for that reason — it does not characterise TNBC. Basal-like-specific gross sentences: none in the
  twelve basal-like-titled OA papers (all molecular/model work). OUTCOME: `tnbc` → `uncharacterised`
  (not characterised at gross level in the sources read), ref carrying Livasy's histologic finding and
  the IBC vocabulary source. Cell (a) is now NOT REACHED TWICE (FTC and TNBC both fell at the read); the
  circumscribed family keeps seminoma alone. A PATTERN WORTH THE USER'S EYE: gross descriptions of the
  common carcinomas live in textbooks and in PathologyOutlines' "Gross description" sections, which
  is precisely the gated source (429, window ≈ 2026-09-10T01:38Z); when the window opens, one probe
  each for TNBC, FTC, prostate acinar and ccRCC is the cheapest route from `uncharacterised` back to
  `cited` — recorded as the path, not taken tonight.
- 2026-09-09 (TNBC LOOK): `node .claude/capture_organs.js /tmp/atlas-verify/tnbc1 Breast --port 3068`
  from the working tree of this commit (HEAD-stamped 4323525, whose table says `unread`). Form and colour
  unchanged from the status-repair look above (the same reserved sea-glass mass at the upper-left of the
  gland); the only change is the chip, read from the DOM by the tool: "generic mass · margin not
  characterised" replaces "generic mass · margin source not yet read" — checkable in facts.json without
  opening the image, which is why no new image reading is claimed here.
- 2026-09-09 (MELANOMA — PRE-REGISTERED BEFORE THE DERIVATION; the ill-defined family's second slot,
  tested against the now-shared PTC/PDAC indistinct-edge form). R9 (Cancers 2025, PMC12427887, PMID
  40941017), SSM section: "The surface of the tumor is either a macule or plaque with an irregular
  border, which ranges in size up to centimeters." Register already ruled: a skin lesion's clinical
  surface IS its gross appearance, and this is not the ABCD dermoscopic vocabulary. THE DERIVATION
  QUESTION: is "irregular border" the same property as "poorly defined" / "poorly delineated"? The
  user's framing for this slot: a third collapse onto the shared form would say the ill-defined family
  has one appearance and three names. PREDICTION: NO COLLAPSE — SEPARATION ON A DIFFERENT PROPERTY.
  "Irregular" describes the border's OUTLINE (uneven, notched, scalloped — a shape word); "poorly
  defined/delineated" describes the border's DISTINCTNESS (blurred, indistinct — an edge-sharpness
  word). A macule with an irregular border can be sharply demarcated. In the five knobs: an irregular
  outline is coarse undulation with NO projections — amplitude legible, freq at the coarse end of the
  cited band [3.5, 9.0] (it may not enter the reserved band [1.6, 2.4], by the ratified rule),
  spikeCount 0, spikeLength 0, sharpness 0; the indistinct edge is many short broad projections over
  fine noise (spikeCount 10–14). Disjoint on spikeCount, so parametrically separate by construction;
  the interesting question is perceptual, at the default framing, against BOTH the shared indistinct
  form and the reserved placeholder (which is also spike-free undulation — the colour now carries that
  distinction, by the ruling, so a form-level resemblance to the placeholder is acceptable and is
  pre-registered as EXPECTED). SCORING: SEPARATION = at the default framing the skin mass reads as a
  smooth-surfaced blob with an uneven outline while PTC/PDAC read as finely knobbed — the ill-defined
  family keeps two names on one appearance and gains no third; COLLAPSE = the two are not
  distinguishable at the framing → arm 3 applies, melanoma shares the indistinct form by reference and
  the badge says so (NOT tuned apart). LIMITS DISCLOSED IN ADVANCE: the renderer draws a deformed
  sphere; a macule/plaque is flat, and its flatness is not modelled — the category speaks only to the
  outline; every magnitude is illustrative (the citation gives none). WIRING FORM if separation holds:
  a new category `irregularBorder` with its own ranges and render, badge from R9; `melanoma` status
  stays `cited`, category set; the check's arm-1 property (reserved form unreachable) is re-proven by
  the disjoint freq band; categories 4→5.
- 2026-09-09 (MELANOMA — THE DERIVATION AND THE LOOK, scored against the pre-registration): SEPARATION, as
  predicted. DERIVED from R9's word alone: `irregularBorder` = amplitude [0.14, 0.22], freq [3.5, 4.5]
  (the coarse end of the cited band, outside the reserved band), spikeCount [0, 0], spikeLength [0, 0],
  sharpness [0, 0]; render 0.18 / 3.8 / seed 11.4 / 0 / 0 / 0. Disjoint from the indistinct-edge form
  on spikeCount and from wellCircumscribed on amplitude — the axis has room, and arm 3 does not bind
  because the citations' words differ (outline versus edge-distinctness). Categories 4→5 (ratchet
  raised on record); the reserved form re-proven unreachable from all five; 6/6 cited statuses backed.
  THE LOOK, evidentiary: (a) `node .claude/capture_organs.js /tmp/atlas-verify/mel1 Skin Thyroid
  Kidneys --port 3069`, served from the working tree of THIS commit (tool stamps HEAD 2cc0ce8, whose
  table has no `irregularBorder`). (b) Compared: melanoma (skin) against PTC's indistinct-edge form
  (thyroid, the shared PTC/PDAC form) and against the reserved placeholder (kidneys). (c) Seen, checkable
  in the PNGs: skin.png — one tan mass on the right face of the skin block, SMOOTH-SURFACED with a
  coarse, uneven, lumpy OUTLINE (a few large swells, no fine projections), chip "margin: irregular
  border · cited", the badge's aria text carrying the flatness limit verbatim (facts.json);
  thyroid.png — PTC's mass finely knobbed all over (many small projections over granular noise): the
  two differ on FEATURE SCALE AND COUNT — few large swells against many small knobs — legible at the
  default framing; kidneys.png — the placeholder is a spike-free undulating blob too, with broader,
  fewer swells, and sea-glass rather than tan: the pre-registered form-level resemblance is present and
  the colour separates them at a glance, as the ruling intended. VERDICT: the ill-defined family keeps
  TWO names on ONE appearance (PTC, PDAC) and does not gain a third; "irregular border" is a distinct
  appearance — an outline category, not an edge-distinctness one — so the taxonomy that placed melanoma
  in the ill-defined family was a hypothesis the derivation refined, not confirmed. PRESENTATION NOTE,
  recorded not acted on: the mass anchors at the skin block's origin hotspot on its right face rather
  than on the epidermal top surface; where a melanoma sits on the block is a hotspot-placement matter
  outside this pass. Renderer limit stands as disclosed: the macule's flatness is not modelled.
- 2026-09-09 (RULING ON GBM, user): **GBM COLLAPSES ONTO THE SHARED INDISTINCT-EDGE FORM.** The margin
  word in R21 is "poorly delineated" — PTC's words, exactly what collapsed PDAC. What remained as a
  candidate for a fourth position is the diffuseness, and diffuseness is the GROWTH property, already
  cited for GBM and accounted for on that axis; reading it into margin double-counts one source phrase
  across two properties and creates an axis position on the strength of a word that belongs elsewhere.
  "No capsula" distinguishes nothing: it is the absence of a feature PTC's citation also never claims.
  **ONE CHECK BEFORE THE COLLAPSE LANDS (user):** the ruling rests on the diffuseness living on the
  growth axis, and that is only honest if the growth axis is DRAWING it — confirm GBM's growth category
  is wired and rendering diffusely-infiltrative before collapsing the margin; otherwise the property is
  relocated to an axis that is not showing it and ends up drawn nowhere, which is worse than the fourth
  position being declined.
- 2026-09-09 (THE CHECK, read from the tree — THE CONDITION FAILS; THE COLLAPSE IS HELD): the growth axis
  is DESIGNED, NOT BUILT. `grep -n -i growth js/morphology.js js/main.js` finds two comments and no
  code; spec section 3 above maps "infiltrative → indistinct boundary — soft falloff at the tumour
  margin" and "diffuse → thickened, rigid ORGAN WALL ... design before building", and none of the four
  consequences is rendered anywhere (the stomach's linitis plastica is histology-panel text; no organ
  file or module draws a wall change or a falloff). What GBM has today: the Explore-screen tumour map's
  "Infiltrative margin" region — one of four colour-labelled ZONES of one mass with genes assigned to
  it (brain.js), a schematic position with a label, not a rendering of diffuse growth — and the
  histology panel's "the diffusely infiltrative background this tumor grows as", which is prose. So the
  diffuseness is drawn nowhere as a growth property, and the ruling's own condition says the margin
  collapse waits. HELD: `MARGIN_STATUS.gbm` stays `cited` with no category (draws nothing, as every
  cited-without-category entry does); the ref now says so. WHAT LANDS THE COLLAPSE: the growth axis
  drawing GBM's diffuseness — which is the growth BUILD, a design step by the spec's own words, and a
  scope decision for the user, not a wiring. DESIGN TENSION TO CARRY INTO THAT STEP, flagged not
  decided: the spec's INFILTRATIVE consequence ("soft falloff at the tumour margin") and the margin
  axis's INDISTINCT-EDGE idiom would draw the same visual property from two axes; GBM's growth is the
  DIFFUSE consequence (no discrete boundary; brain-tissue involvement), which the spec reserves for
  "design before building" — the two consequences must be kept apart on paper before either is drawn,
  or the double-count the ruling just refused on the margin side reappears on the growth side.
- 2026-09-09 (THE VOCABULARY FINDING, recorded as a POSITIVE result, user): once GBM lands, the
  ill-defined family has THREE NAMES ON ONE APPEARANCE (poorly defined / poorly delineated / poorly
  delineated-and-diffuse) — a finding about the literature's vocabulary, not a failure of the axis. It
  pairs with melanoma the same day: the family gained no third APPEARANCE and does gain a third NAME.
  Stated here so that three collapses in a row are not read as the axis running out of room: the axis
  separated melanoma on a different property in the same session, which is what "room" means. Today's
  count: two names on one appearance (PTC, PDAC), the third held on the growth condition above.
- 2026-09-09 (THE REGISTER PATTERN, re-described, user): the harvest found histology because the atlas's
  own richest prose IS histologic — a selection effect in the instrument, not a property of the
  entries. The harvest has good RECALL and poor REGISTER PRECISION, and the fourth property (a status
  claim carries its backing) now catches exactly that failure at build time. So the harvest stays
  useful, GATED by the new property rather than distrusted; the three register falls (FTC, acinar,
  TNBC) are the gate working on the harvest's known weakness, not a reason to stop harvesting.
- 2026-09-09 (BLOCKED-TO-TOOLING, first time with no alternative, user): the four-probe PathologyOutlines
  run when the 429 window opens (≈ 2026-09-10T01:38Z; TNBC, FTC, prostate acinar, ccRCC) is the right
  route back to `cited`, and it is the first time the gated source is the ONLY one that would answer:
  every earlier "blocked to tooling" (R3/R4 ccRCC) had an alternative rung that could in principle
  supply the sentence; for the gross register of common carcinomas the OA corpus has now been shown
  thin four times over, and the textbook-style gross description lives behind the gate. Recorded so
  the next reader does not spend another evening on rung 2 for these four.
- 2026-09-09 (RENAME, with the ruling that caused it): `margin_reserve_check.js` → `reserve_check.js`. One
  reserved colour, bound to the OBJECT: the colour means "at least one property of this mass is
  uncharacterised" and the badge names which; the check's obligation is therefore every axis, and the
  growth reserve hooks (RESERVED_GROWTH, GROWTH_CATEGORIES empty at birth, growthReservedViolations)
  live in it in fixture form. Earlier entries above keep the old name because it was the name then.
  The ratchet key moved by hand (`reserve_check.categories`, count unchanged, disclosed in the commit).
- 2026-09-09 (GROWTH AXIS: INFILTRATIVE WIRED; design document §9–§11): rim-blend won the bake-off against
  the pre-registered criterion (opacity failed as predicted; the organ-side family retired STRUCTURALLY on
  the 22%-radius reason); the reserved apex floor was measured on a fixture and encoded (RESERVED_APEX,
  cap 1.0 for margin-reserved masses); GROWTH_STATUS gives every entry a status with backing (11 cited /
  1 uncharacterised / 4 unread; the stomach's PDQ page backs its status by a live-verified URL);
  infiltrative (PDAC R2 H-disclosed, PTC R18) and diffuselyInfiltrative (GBM R21) are drawn. THE GBM HOLD
  IS LIFTED: margin poorlyDelineated under arm 3, growth drawn at the wide extent, the badge stating the
  drawing is KNOWN TO UNDERSTATE the cited extent. Class found in the first capture and fixed before
  shipping: a shared margin category's citation belongs to the ENTRY (GBM had quoted PDAC's source).
- 2026-09-10 (EXTENT TO TEXT — EXT2, the per-site read; design document `.claude/phaseA_extent_design.md` §8): SEER
  Cancer Stat Facts, 'Percent of Cases by Stage at Diagnosis', public domain, one page per site, fourteen pages for
  sixteen entries (ovary covers HGSOC and OCCC; thyroid covers PTC and FTC). Recorded per entry in morphology.js
  `EXTENT_STATUS` with the SEER entity named where it is broader than the entry, the registry set and diagnosis
  years as the vintage, and the date the page was followed; carried on every mass badge as a PRIMARY, DETECTION-
  FRAMED extent line ('found at diagnosis', never 'spreads'). The testis page publishes no distribution → extent
  uncharacterised for seminoma. VERIFIED-QUOTED shares:
    pancreas: localized 15%, regional 28%, distant 51%, unknown 5% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/pancreas.html verified 2026-09-10
    melanoma of the skin: localized 77%, regional 10%, distant 5%, unknown 9% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/melan.html verified 2026-09-10
    brain and other nervous system: localized 77%, regional 14%, distant 2%, unknown 7% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/brain.html verified 2026-09-10
    female breast: localized 64%, regional 27%, distant 6%, unknown 2% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/breast.html verified 2026-09-10
    colon and rectum: localized 34%, regional 37%, distant 23%, unknown 6% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/colorect.html verified 2026-09-10
    kidney and renal pelvis: localized 66%, regional 17%, distant 15%, unknown 3% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/kidrp.html verified 2026-09-10
    liver and intrahepatic bile duct: localized 45%, regional 23%, distant 21%, unknown 10% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/livibd.html verified 2026-09-10
    lung and bronchus: localized 24%, regional 21%, distant 51%, unknown 4% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/lungb.html verified 2026-09-10
    ovary: localized 22%, regional 18%, distant 54%, unknown 6% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/ovary.html verified 2026-09-10
    prostate: localized 69%, regional 14%, distant 9%, unknown 8% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/prost.html verified 2026-09-10
    stomach: localized 32%, regional 23%, distant 35%, unknown 9% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/stomach.html verified 2026-09-10
    testis: no stage-at-diagnosis distribution on the page (https://seer.cancer.gov/statfacts/html/testis.html, checked 2026-09-10)
    thyroid: localized 63%, regional 31%, distant 3%, unknown 3% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/thyro.html verified 2026-09-10
    urinary bladder: in situ 50%, localized 34%, regional 7%, distant 6%, unknown 3% — SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage; submission not stated on the page; https://seer.cancer.gov/statfacts/html/urinb.html verified 2026-09-10

2026-09-10 — tolerated-count sweep resolved (user: an undeclared count is evidence of an unread count). One mechanism,
    `.claude/tolerated.py`, ported from regress.js's KNOWN_FAILURES into absence/fraction/share_sum/duplicate; regress
    declares its favicon-404 page errors benign; the reach check's 150 unreached spans became a content-keyed tracked set
    (`.claude/reach_unreached.json`, 95 keys); unread status rows carry `until` dates and reserve_check reports overdue
    reads (three negative controls run). The 151st unreached span was this author's own prostate.js:13 note ("(user,
    2026-09-09)" read as a data-span year) — date spelled out, census back to 150. Crosscheck's three flags were three
    record defects, fixed: PNAS and Neuro-Oncology sat in author fields; the Nunes 2024 record carried two journals in
    one field because extraction assumed one paper per author-year — split into Nature (PMID 39112715, resolved by hand
    from the candidate list) and Molecular Cancer (PMID 39587554). Bladder: in situ 50% reported as its own category
    with in-situ-modal framing. Depth (Breslow) measured per-layer in the skin block — see phaseA_extent_design.md §9.
- 2026-09-10 (ITEM 5 READS, 16:38Z): **PATHOLOGYOUTLINES IS CLOSED TO THIS CLIENT.** Probe #1 of the four-probe plan
    (kidneytumormalignantrccclear.html, one request, honest UA naming this project, headers recorded) → HTTP 429,
    `retry-after: 86400`, `server: Sucuri/Cloudproxy`, `x-sucuri-id: 14017`, no CAPTCHA. THIRD consecutive window
    (2026-09-06; 2026-09-09T01:38Z; 2026-09-10T16:38Z), each entered after the previous Retry-After had elapsed: the cap
    is not daily, it is persistent for this client. Per the plan no second probe inside a window — TNBC, FTC, prostate
    acinar NOT probed; the rows keep their `until` dates but the PathologyOutlines route back to `cited` is CLOSED for
    this tooling, and it was the only route (2026-09-09 entry above). Recorded as GATED, not bypassed. TNBC GROSS-REGISTER
    READ (OA rung): PMC esearch ×3 (gross/circumscribed/pushing terms, open access) → congress abstracts and case reports
    plus PMC7550871 (Front Oncol 2020, Pathology of Hereditary Breast and Ovarian Cancer), read in full: pushing borders,
    necrosis, sheet-like growth, medullary pattern — all HISTOLOGIC register; its only gross/macroscopic sentences are
    tubo-ovarian protocol text. Fifth thin result for the OA gross corpus. TNBC growth row unread → UNCHARACTERISED
    (R24; the read happened and found nothing in the register — a downgrade, not a dated promise a closed source cannot
    keep). COMPOSITION RE-COUNT (growth design §10 C method, ledger + harvest spans): 4, UNCHANGED — OCCC, ccRCC, GBM,
    seminoma; the same two exclusions (TNBC "mixed" is a margin word; "mucinous" is a subtype share); the probes returned
    nothing, so nothing rose. Composition stays a candidate sibling axis.
- 2026-09-10 (SELF-TEST COUPLING AUDIT + two verifications, user's five-item follow-up): crosscheck's
    live known-positive assertion required two real defects to exist — CHECK-VALIDATED-BY-DEFECT, the
    fourth accidental invariant (see CLAUDE.md). Audited all 19 instruments with a selftest/live-check;
    zero other instances (five apparent hits were one function-boundary regex bug, re-verified clean).
    BLADDER CAPTION re-verified: the flagged sentence is gated on `modal`, bladder's `modal` is
    `'in situ'`, no live defect; all 16 EXTENT_STATUS entries' `modal` fields independently recomputed
    against their own shares — 16/16 match; guard added to reserve_check.js (modal must equal argmax of
    shares), proven with a negative control, no repair needed. REGISTER FINDING: FTC/acinar/TNBC's four
    negative reads (R20, R22, R23, R24) are 4/4 the same signature (histologic register, not gross) with
    a diagnostic reason each; recorded as a principled partial limit on the margin axis, a Phase C
    budgeting ceiling, not a backlog; ccRCC (R3/R4, literature silence) explicitly NOT folded in — a
    different, still-open failure mode. Eight untracked root .glb/.webp files inventoried (report only,
    nothing moved): six are raw Sketchfab downloads already processed into currently-shipped, tracked,
    documented assets (lungs, stomach, thyroid, ovary's pelvic-organs source, colon's intestine source);
    two (colon.glb/iqcenter, digestive_system__human_anatomy.glb/adimed) have no CLAUDE.md trail at all
    — Joe's call, not touched. Gate-script audit: run_checked.sh/commit_checked.sh already capture `$?`
    or use `grep -q` inside a conditional everywhere; the grep-as-last-command false alarm was this
    session's own ad hoc verification command, not a repo defect.
