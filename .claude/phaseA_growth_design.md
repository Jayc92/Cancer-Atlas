# Phase A — the growth axis, on paper before code (design document, 2026-09-09)

STATUS: DESIGN ONLY. Nothing in this document is built. It exists because spec §3 of
`phaseA_mapping.md` said "design before building" and the GBM ruling of 2026-09-09 held a
margin collapse until the growth axis DRAWS the property it was relocated to. Standing
conditions (1)–(8), the category-cited / magnitude-illustrative split, the register rule
(tumour = gross-specimen construct; histologic sources DISCLOSED as R2 is), the collision
rule's three arms, and the reserve rule (the reserved form unreachable from every cited
category) govern here exactly as they govern margin. This document is declared a
NON_INSTRUMENT in `battery.py`: it asserts nothing and ratchets nothing.

## 1. The hypothesis under test (user)

"Growth pattern" is not one visual axis. It is four unrelated kinds of expression sharing a
clinical name:

| pattern | what it actually is, visually |
|---|---|
| multifocal | a COUNT — several masses instead of one |
| infiltrative | an EDGE PROPERTY — falloff at the margin, not geometry |
| exophytic | a PLACEMENT RELATION — a mass protruding from a boundary into a lumen |
| diffuse | an ORGAN PROPERTY — no discrete mass at all; the wall itself changes |

If the decomposition holds, the axis rendered nothing since it was specified because it was
built as one knob for four mechanisms, and only the first is reachable from the existing
machinery. THE TEST: map every cited growth word in the corpus onto the four; if any two
mechanisms collapse into one expression, or a cited word fits none, say so.

## 2. The corpus's growth words, read from the ledger (`_phaseA_citations`, harvest lines)

| entry | cited growth words | source, register | mechanism | note |
|---|---|---|---|---|
| PDAC | "infiltrate a desmoplastic stroma" | R2, PMC8268881, H disclosed | EDGE | cross-register stated; gross corroboration is R1's blurred delineation (a MARGIN word — one phrase, one axis; see §6) |
| PTC | "an invasive neoplasm" | R18, NBK536943, G | EDGE | "invasive" and "poorly defined margins" are two different words in one sentence; §6 |
| GBM | "diffusely infiltrative" (in-atlas); "topographically diffuse, a poorly delineated mass" | brain.js cited; R21 PMC3019011, G | EDGE (+ see §3) | the word "mass" is in the sentence: a discrete mass exists; the diffuseness is its edge's extent |
| TNBC | "syncytial infiltrative growth pattern" | harvest SEED, H (NST page) | EDGE, pending | a seed, not a citation — needs its own identifier and read before wiring (fourth property) |
| CRC | ulcerating 55–60% / polyp-cauliflower 25% / flat 15–20% / diffuse infiltrating 1%; "endophytic ring-shaped" distal | R6, PMC6165083, G, named divergence | WALL (majority); PLACEMENT (25%) | the ulcerating-annular majority is a change in the bowel wall, not a mass on it; R5: its edge IS the margin |
| bladder | ≥75% non-muscle-invasive, Ta = non-invasive papillary | R19 (four sources), named divergence | PLACEMENT (majority); EDGE (invasive minority) | papillary fronds protrude INTO the lumen; precondition §4 |
| stomach (diffuse type) | diffuse infiltration → linitis plastica | PDQ (in-atlas cited, G) | WALL | the spec's "one genuinely new expression" |
| prostate acinar | multifocal | Fontugne 2022 PMC8876549, 139/233 (59.7%); in-atlas | COUNT | REGISTER H: multifocality is mapped on whole-mount sections; disclose as R2 does |
| HCC | single nodular / single nodular with extra-nodular growth / confluent multinodular / infiltrative | R12, PMC11007400, G; predominance from R11's counts | COUNT | the MAJORITY (types I+II, 247/400) is "single" — a cited count equal to the default; §5 |
| HGSOC | "bilateral ovarian involvement"; "large mass with bilateral presentation in two-thirds" | R14, PMC8070731 + PMC3596590, G | COUNT | precondition: the ovary screen models ONE ovary; bilaterality is drawable only where both members are present (the body screen already places two ovary markers) |
| OCCC | "large unilateral masses, cystic, and solid in appearance" | R16, PMC8070731, G | NONE OF THE FOUR | unilateral is count 1; "cystic and solid" is a COMPOSITION property — §3(c) |
| melanoma | radial growth phase (horizontal, in the epidermis) then vertical growth phase ("infiltrates deep into the dermis") | R10, PMC12427887 | PLACEMENT (RGP) + EXTENT breach (VGP) | the VGP is spec §4's breach expression, not a growth mechanism |
| LUAD | none — no gross growth category claimable | R8, negative | — | reserved growth |
| ccRCC | unreached (blocked-to-tooling) | R3/R4 | — | reserved growth |
| seminoma, FTC | not read (the harvest listed them for external reads; none made) | — | — | reserved growth |

## 3. What the mapping says about the decomposition — the falsification results

(a) NO TWO OF THE FOUR COLLAPSE FOR HOLLOW ORGANS. Count, edge falloff, protrusion into a
lumen and wall change are four different visual channels: number of masses, the material
transition at the mass–organ junction, which side of the surface the mass sits on, and the
organ mesh itself. The decomposition holds there.

(b) FOR PARENCHYMAL ORGANS, "DIFFUSE" COLLAPSES ONTO "INFILTRATIVE". The brain has no wall.
What GBM's "topographically diffuse" adds to "infiltrative" is EXTENT: a wider, more
gradual falloff of the mass into the parenchyma, not a different kind of expression. R21's
own sentence says "a poorly delineated MASS" — a discrete mass exists — so "no discrete mass
at all" is not what the citation describes for GBM. CONSEQUENCE, stated for ruling rather
than decided: the ORGAN-PROPERTY mechanism is really a HOLLOW-ORGAN WALL mechanism (stomach,
CRC's annular majority), and GBM belongs to the EDGE tier at a larger illustrative falloff —
cheaper than the user's placement of it at the expensive end. If the user holds instead that
GBM's diffuseness needs a parenchyma treatment distinct from falloff, it stays at the wall
tier. The two words "diffuse" and "infiltrative" carry a difference in extent, so a wider
falloff for GBM than for PDAC is licensed by the words (arm 3 forbids only manufactured
difference); the ratio is illustrative and goes on the magnitude half.

(c) ONE CITED WORD FITS NONE OF THE FOUR: OCCC's "cystic and solid". Composition of the
mass — fluid-filled against solid — is a fifth kind of expression. It is a CLAIM when cited
(unlike the placeholder case, where translucency was rejected because it would read as a
claim the render was not entitled to make). Deferred, recorded, ruling requested.

(d) COUNT HAS A MODEL PRECONDITION AND A REGISTER CAVEAT. Bilaterality (HGSOC) is drawable
only where the organ model shows both members of the pair — the ovary screen shows one, the
body screen shows two. Prostate multifocality is a whole-mount histologic finding: cited,
but H, and disclosed as such.

(e) WITHIN THE WALL MECHANISM, "DIFFUSE" AND "ANNULAR" ARE ONE MECHANISM AT TWO EXTENTS.
Linitis plastica thickens the whole stomach; CRC's ulcerating-annular majority thickens a
segment with a crater. Same expression (the wall deforms), different extent — a magnitude,
not a new mechanism.

VERDICT ON THE HYPOTHESIS: it survives with two amendments — the fourth mechanism is the
hollow-organ WALL, not "diffuse" in general (parenchymal diffuseness is edge extent), and a
fifth kind, COMPOSITION, exists and is unbuilt.

## 4. Per-mechanism design — category half, magnitude half, reserved state, reachability

Each mechanism is ONE knob on the mass (or the organ), with the category CITED and the
magnitude ILLUSTRATIVE, recorded separately per property in `_phaseA_citations` exactly as
margin's are. A `growth_reserve_check` (to be written FIRST, before any category is wired,
like `margin_reserve_check`) asserts that the reserved growth vector is unreachable from
every cited category's range on its knob, and that every cited-equal-to-default declaration
is true (the `sameAppearanceViolations` form).

COUNT. Knob: number of masses (and an illustrative size distribution). Cited categories:
multifocal (prostate, H), bilateral (HGSOC, precondition), confluent multinodular (HCC type
III, a named minority). Reserved: exactly one mass. Reachability: multifocal ranges start at
2. THE COLLAPSE TO HANDLE: HCC's cited majority is "single" — a cited count of 1, identical
to the reserved count. It is declared `sameAsDefault` and carried in prose on the badge;
the check asserts the declaration, never a difference. Growth's reserved state needs no
colour signal (§5). Cost: nearly free — the mass code already places two masses per organ.

EDGE (infiltrative falloff). Knob: falloff width at the mass–organ junction, expressed as a
MATERIAL transition (a blend of mass colour into organ colour along the surface, or an
alpha ramp), never as geometry — the geometry of the edge is the MARGIN axis's channel.
Cited: infiltrative (PDAC H, PTC G, GBM G wide, TNBC pending, bladder's invasive minority
named, CRC's 1% named not drawn). Reserved: width 0 (a hard junction). Reachability: cited
ranges have width > 0. THE DOUBLE-DRAW RESOLUTION (the tension flagged when GBM was held):
margin = the silhouette's edge SHAPE; growth-edge = the junction's material transition. Two
channels, both allowed on one mass (PTC: knobbed AND infiltrating). What is forbidden is
one PHRASE feeding both halves (§6). Cost: moderate — a material/shader gradient on the
organ near the mass, or vertex colours; the standing condition (5) rule on illumination is
untouched (this is albedo/alpha, not light).

PLACEMENT (exophytic). Knob: protrusion — the mass anchored on the LUMINAL side of the wall,
protruding into the cavity. Cited: bladder papillary (majority), CRC polyp-cauliflower
(minority, named), melanoma RGP (a plaque lying within the epidermal layer of the skin
block — placement along a layer). Reserved: the mass on the outer surface (today's outward
offset). Reachability: a different anchor side is a discrete, testable difference.
PRECONDITION to measure before building: the organ model must have a reachable luminal
surface (bladder, colon are real scans; the stomach has open-lumen stubs) — measured with
the ray-parity containment test ovary.js already uses, not assumed. Cost: moderate.

WALL (hollow-organ). Knob: wall thickening factor and extent (segment or whole organ), with
the annular form's crater as its cited feature. Cited: stomach diffuse-type (whole), CRC
ulcerating-annular (segmental, majority). Reserved: no deformation. Reachability: factor > 0
or extent > 0. Expression: the organ mesh itself deforms — the spec's genuinely new
expression, on scanned meshes with their UV and normal caveats. Cost: expensive.

COMPOSITION (fifth kind, unbuilt). OCCC cystic-and-solid. Options for a ruling: a material
property on part of the mass, or a two-part mass. Not designed further here.

EXTENT breach (spec §4, third in the build order). Not a growth mechanism, but it shares
machinery: satellites (HCC, ≤2 cm) are COUNT with a distance rule; a breach through a
boundary (melanoma VGP into the dermis; SEER regional extent) is PLACEMENT across a layer.

## 5. Two rules the growth axis inherits, and one it does not

RESERVED-UNREACHABLE: as above, on every knob that has room. CITED-EQUAL-TO-DEFAULT
(single, unilateral): declared, asserted true, carried in prose — arm 3's form.

COLOUR: NOT INHERITED. Margin's reserved form necessarily has SOME shape, which is why a
placeholder shape needed a placeholder colour to avoid reading as a claim. Growth's reserved
state is the ABSENCE of an expression — one mass, hard junction, on the surface, no wall
change — which asserts nothing about growth. So the mass colour stays tied to the margin
axis, and growth's status is carried on the badge ("growth: not characterised" / "growth:
multifocal · cited"). Recommendation, for ruling.

## 6. Citation hygiene specific to two axes on one mass

ONE PHRASE, ONE AXIS (the GBM ruling): a source phrase is cited for margin OR for growth,
never both — "topographically diffuse" is growth, "poorly delineated" is margin. TWO WORDS
IN ONE SENTENCE MAY FEED TWO AXES when they are different words naming different properties:
PTC's "an invasive neoplasm with poorly defined margins" gives "invasive" to growth (R18)
and "poorly defined margins" to margin (R17) — the boundary case, declared here so it is
not mistaken for the forbidden form. REGISTER: gross where the property is gross; histologic
sources disclosed as H (R2, prostate multifocality, TNBC's pending read). A harvest seed is
not a citation and wires nothing (fourth property).

## 7. Build order (user), with what this document changes

1. COUNT — nearly free; validates the reserve check and the cited-equal-to-default form on
   HCC and prostate (H disclosed); HGSOC waits on the paired-model precondition.
2. EDGE falloff — PDAC, PTC, and GBM IF §3(b) is accepted (GBM lands here, not at 4);
   the material channel is the design decision to make first.
3. EXTENT breach — melanoma VGP, HCC satellites, SEER categories.
4. WALL — stomach, then CRC's annular majority; the expensive member, built last, after
   the cheaper three have tested the decomposition with something cheap to unwind.

## 8. Rulings requested before code

(i) §3(b): is parenchymal diffuseness edge extent (GBM at tier 2) or a distinct treatment
(GBM at tier 4)? (ii) §3(c): does COMPOSITION become a fifth mechanism, and when? (iii) §5:
colour stays with margin; growth status on the badge only. (iv) The material channel for
EDGE (colour blend vs alpha ramp) — a look-and-decide, like the reserved colour was.
