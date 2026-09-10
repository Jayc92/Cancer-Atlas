# Phase A closeout (2026-09-10, user: "close A explicitly rather than letting it trail")

Phase A asked whether sixteen cancer entries could each carry a cited, gross-register visual
property — margin, growth, extent, a magnitude — reserving an honest default where the source
would not support one. This closes it: what is built and renders, what resolved to text and the
measurement that forced each, what is bounded and why, what remains.

## What is built and renders geometrically

- **Margin** (`js/morphology.js` `MARGIN_CATEGORIES`/`MARGIN_STATUS`): 5 categories wired
  (poorlyDefined, wellCircumscribed, nodular, poorlyDelineated, irregularBorder — the last four of
  five, one shared appearance declared under the collision rule's third arm). 6 of 16 entries cited
  and rendered inside their category's range (hcc, gbm, pdac, melanoma, seminoma, ptc).
- **Growth, edge/falloff mechanism** (`GROWTH_CATEGORIES`, rim-blend): 2 categories wired
  (infiltrative, diffuselyInfiltrative). 3 of 16 entries drawn (pdac, ptc, gbm) — the only growth
  mechanism actually reaching geometry; 8 more are cited but sit as text because no mechanism for
  their claim type (count, wall, placement) is built yet.
- **One reserved colour**, unreachable from every cited category on every wired axis (margin,
  growth), proven by `reserve_check.js`'s fixture-form arms.
- **Render coverage today**: 9/17 cited margin+growth positions render geometrically; 8 sit as
  text-only citations; a further 15 positions are text BY DESIGN (extent's primary line, the
  understated-extent disclosure) rather than pending a mechanism.

## What resolved to text, and the measurement that forced each

Four separate axes landed on text, each for a reason a measurement produced, not a default:

- **Extent** (stage at diagnosis) is text BY DESIGN from the start (§4 of
  `phaseA_extent_design.md`): SEER Summary Stage is source vocabulary, not a renderable geometry
  the sources support without inventing one.
- **Breach** (whether a mass crosses a bounding structure) resolved to text because rendering it
  geometrically would make a MODAL fact (breach is common, not universal) read as factual for every
  cited entry — the render would claim more than the source does.
- **Depth** (Breslow thickness) resolved to text because the skin block's own layer proportions are
  exaggerated PER-LAYER (epidermis ≥3.7× the measured maximum, dermis 2–5×, hypodermis ~1× and
  truncated) — a depth placed at a true relative position lands in the wrong tissue layer. Priced a
  re-proportion (uniform ×8); declined (2026-09-10) — one rendered property for half a day, and 0.8mm
  of design-unit epidermis against an 8mm dermis likely would not even restore the in-situ-vs-invasive
  visibility a depth plug exists to show.
- **Growth-on-reserved-masses** (a margin-reserved mass with a cited growth extent) resolved to a
  disclosure sentence on the badge ("KNOWN TO UNDERSTATE") rather than a geometric dissolve, because
  the reserved apex floor measured across an orbit sweep found no nonzero cap survives on a
  margin-reserved mass — cap 0, no dissolve, the badge says so.

Each of these is a FORCED result: the render doesn't say more than the citation does, in every case
because a measurement showed what saying more would cost.

## What is bounded, and why — the margin register limit

Not every remaining `uncharacterised` entry is pending more search. Of 16, 3 (tnbc, acinar, ftc)
hit a register mismatch on margin specifically: real literature exists, but at histologic
(microscopic) register, for a diagnosable reason each (invasion-graded, often grossly inapparent, or
receptor-defined rather than morphology-defined). Sized: 3/16 directly, or 3/9 among entries where
the question was actually decided — both routes land near 20–33%, projecting to roughly 20–25 of
Phase C's ~120. This intersects the already-flagged 8–9-masses-per-organ crowding hazard: on a
crowded organ, 1.5–3 of its masses would be permanently, indistinguishably teal — a Phase C design
input, not a Phase A problem to solve here.

ccRCC (2 entries, margin+growth) stays open and separate from this finding: its problem is that
NOTHING was found in either register, not that the wrong register was found. A genuinely different,
still-open failure mode.

## What remains — the geometric surface, and it is small

Of the four growth mechanisms named in `phaseA_growth_design.md` §1:
- **Edge/falloff** — BUILT (rim-blend), the only one reaching geometry.
- **Wall** (hollow-organ deformation) — the one UNBUILT mechanism with real, unblocked, gross-register
  members ready today: stomach diffuse-type (whole-organ, PDQ-cited) and CRC's ulcerating-annular
  majority (segmental, PMC6165083-cited). Reachability is simple (factor/extent > 0); no measured
  precondition stands between design and build the way placement has one.
- **Placement** (protrusion relative to a luminal surface) — has real members (bladder papillary
  majority, CRC's polypoid minority, melanoma's radial growth phase) but a PRECONDITION is still
  open: which organ meshes have a reachable luminal surface, unmeasured as of this closeout.
- **Count** (multifocality) — checked directly, not assumed, and it resolves to no unblocked member
  today: acinar's citation is register H (histologic — the same register limit disqualifying its
  margin), HGSOC's bilaterality is register G but blocked by the one-ovary-modelled precondition, and
  HCC's cited majority (single nodular) EQUALS the reserved default (count 1) — cited but unexpressed,
  nothing to render differently. Zero live candidates, for three distinct reasons, not one.
- **Composition** (a fifth kind identified in §3, cystic/solid/necrotic/haemorrhagic) — deferred at 4
  members (OCCC, ccRCC, GBM, seminoma), re-taken once after the PathologyOutlines probe run and
  unchanged; below the axis-vs-prose threshold named at the ruling.

**Stated plainly: wall is the last geometric mechanism with real, unblocked members. Placement is one
measurement away. Count has none, for reasons now checked rather than assumed. Composition stays
prose.** The remaining geometric surface for Phase A is small and shrinking, not open-ended.

## Close

Phase A is closed as of this document. What follows on the render side is: build wall if the user
wants stomach/CRC's citations to reach geometry, measure placement's luminal-reachability
precondition if placement follows it, and nothing else on this list is a build candidate today.
Everything else that remains — the register limit's Phase C sizing, the masses-per-organ
intersection, ccRCC's open read — is a Phase C design input, recorded above and in CLAUDE.md, not a
Phase A task.
