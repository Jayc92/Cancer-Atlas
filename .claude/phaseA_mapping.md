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
