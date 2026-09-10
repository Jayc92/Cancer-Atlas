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
like the margin half of `reserve_check`) asserts that the reserved growth vector is unreachable from
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

## 8. Rulings received (2026-09-09), and what each changed

**B. GBM → the EDGE tier. Amendment (b) accepted.** The user's wall mechanism had been derived
from linitis plastica, a hollow organ where the wall IS the structure, then applied to a brain
that has none; and R21's "a poorly delineated mass" asserts a mass, so a no-mass rendering would
exceed the source rather than honour it. THE GENERAL RULE, recorded here as the more valuable
half: **tier is set by organ architecture, not by the clinical word.** "Diffuse" in a hollow
organ and "diffuse" in parenchyma are different mechanisms sharing a label, so the mechanism
table carries a HOLLOW / PARENCHYMAL dimension and the same cited word routes differently
across it:

| cited word | hollow organ (stomach, colon, bladder) | parenchymal organ (brain, liver, pancreas, kidney, thyroid) |
|---|---|---|
| infiltrative | EDGE falloff at the junction | EDGE falloff at the junction |
| diffuse | WALL — the organ wall itself thickens (linitis plastica; segmental = annular) | EDGE at larger extent — the same falloff channel, wider (GBM) |
| exophytic / papillary | PLACEMENT into the lumen | — (no lumen; not applicable) |
| multifocal / bilateral | COUNT | COUNT |

PRE-REGISTERED FALSIFIER, to be tested in the infiltrative bake-off before the tier is closed:
GBM cells are found centimetres past any imaging margin, sometimes across the midline. If an
HONEST falloff extent shades so much of the brain that the render reads as *the whole organ is
tumour*, the edge tier cannot carry GBM and the honest expression is a LABELLED extent rather
than a purely visual one — the lesion-versus-shadow inversion in a new place. The test:
capture GBM at the falloff extent the words license and read it against that criterion;
failure sends GBM to a labelled-extent expression, not to a wider falloff.

**C. Composition — counted before deciding, sibling not member.** The ledger swept for
cystic / solid / mixed / necrotic / haemorrhagic / mucinous: FOUR entries carry a composition
word about the mass — OCCC ("cystic, and solid", R16), ccRCC ("either solid or cystic", the
incidental quote in the unreached R3 record), GBM (R21: "prominent areas of old and recent
hemorrhage", "necrosis (as much as 80% of the total tumor mass), cystic areas sometimes
alternating with firm tissue"), seminoma (harvest span: "tan to pale yellow lesions with
necrotic or hemorrhagic foci"; "solid intratesticular nodule"). Two hits excluded on reading:
TNBC's "mixed" is a MARGIN word ("ill-demarcated, well-demarcated, or mixed"), and "mucinous"
appears only as a colorectal subtype share, not a mass description. Adjacent texture words
(firm, granular, fibrous) occur for PTC, GBM, melanoma and are texture, not composition. FOUR
sits between the two thresholds the ruling named (one → prose; five or more → a real axis).
Position taken: composition is a CANDIDATE SIBLING AXIS, not scheduled; OCCC stays
uncharacterised on growth with its composition in prose; the count is re-taken after the four
PathologyOutlines probes, since gross descriptions routinely carry these words and the count
is likelier to rise than fall. Whatever the count, **composition is not growth**: it describes
what the mass is made of, not how it spreads — a sibling of growth, never a fifth member.

**D. One reserved colour, bound to the object.** Two would collide on a mass uncharacterised
on both axes; the colour means *at least one property here is uncharacterised* and the badge
names which. Colour flags, text specifies. The check's obligation widened to every axis and
the instrument was renamed to match: `margin_reserve_check.js` → `reserve_check.js`, ratchet
key moved by hand with the count unchanged, growth hooks present in fixture form from birth.

**E. The falloff channel — a bake-off with a PRE-REGISTERED CRITERION, not a winner.** What the
falloff must achieve: (1) read as *boundary not determinable*, not *boundary is here and
soft*; (2) NOT read as *this organ is diseased throughout* (the lesion-versus-shadow
inversion); (3) survive the vertex-colour AO composition on the seven AO organs and the AgX
tonemap — a channel that works in isolation and washes out downstream repeats the env-map
lesson exactly; (4) THE CROSS-PRODUCT WITH THE RESERVED COLOUR: each candidate is also
captured on an uncharacterised-margin mass with infiltrative growth — a falloff that dissolves
the mass edge into the host albedo would bleed the reserved teal into the organ, a combination
neither check catches alone. The user's guess, recorded to be falsified rather than planned
around: opacity is the obvious candidate and is expected to FAIL, because a translucent mass
over coloured tissue reads as *lighter tissue* rather than *indeterminate edge* — the
hue-contamination class that killed the glow; a roughness-plus-albedo blend that keeps the
mass opaque while dissolving only its boundary is the likelier winner. The bake-off decides.

**BUILD ORDER FLIPPED: infiltrative falloff FIRST.** Multifocal is cheap to render and its
RENDERABLE membership was counted before scheduling: prostate multifocality is whole-mount
histology, which at gross register means depicting something invisible at that scale — not
renderable; HGSOC bilaterality needs two ovaries and `assets/ovary.glb` is one excised ovary —
not renderable on the organ screen; HCC's cited majority is single (types I+II, 247 of 400)
and the confluent-multinodular minority (101 of 400) is named, not drawn. **Renderable
multifocal members today: ZERO.** Its cheapness is irrelevant; it is not scheduled.
Infiltrative discharges the GBM hold, the only correctness hold in Phase A. Order now:
(1) infiltrative falloff (bake-off per E, then PDAC, PTC, GBM subject to its falsifier);
(2) extent breach; (3) wall (stomach, then CRC's annular majority); multifocal when it has a
renderable member.

STATUS OF THE FOUR REQUESTS: (i) GBM tier — settled to EDGE pending its falsifier; (ii)
composition — counted at four, sibling axis, deferred; (iii) colour — ruled, one colour bound
to the object; (iv) falloff channel — criterion pre-registered, bake-off next.

## 9. The falloff bake-off — run 2026-09-09, verdict by the pre-registered criterion

FIVE CHANNELS BUILT (main.js `applyGrowthFalloff`, dormant behind `FALLOFF_CHANNEL`/`GROWTH_RENDER`):
`opacity` (the mass turns translucent), three ORGAN-SIDE channels that alter the organ's vertex
colours in a ring beyond the mass silhouette — `albedoBleed` (toward the mass colour),
`roughAlbedo` (weaker blend plus a per-vertex roughness rise through a shader injection),
`darken` (hue-neutral) — and one MASS-SIDE channel, `rimBlend` (the mass stays opaque; its own
vertex colours take the organ's albedo where it meets the organ and keep the mass colour at the
apex). Captured on Pancreas (PDAC, AO organ), Brain (GBM at the wide 'diffuse' extent, AO organ,
with the ruled margin collapse applied TEMPORARILY so a mass existed), Thyroid (PTC, textured, no
AO) and Lungs (the CROSS-PRODUCT: LUAD's uncharacterised-margin reserved-teal mass given
infiltrative growth for the capture), from a temporary working-tree wiring never committed.

THREE HARNESS LESSONS PAID FOR BEFORE THE NUMBERS COULD BE TRUSTED. (1) Auto-rotation advances
between captures, so pixel comparisons across runs were polluted by pose drift; `capture_organs.js`
gained `--freeze`. (2) `controls.reset()` was the wrong freeze — it restores the CONSTRUCTION pose,
not the framed default, and three of four masses left the frame (opacity and rimBlend measured
zero changed pixels: identical to baseline because invisible); the freeze now stops rotation the
instant the viewer exists. (3) The organ-side channels' COVERAGE, read by identity from
`userData.growthFalloff` (now in facts.json): at extent 1.0 the ring covered the pancreas head
entirely (7609/7609 vertices) and at GBM's 2.5 covered 111,411 of the brain's 113,252 — because
a mass is 22% of the organ's bounding radius, so any ring measured in mass radii is organ-scale.
The first probe misread this as a frame-conversion bug; the numbers said otherwise (the meshopt
GLBs are quantised to integer local units with a ~1e-5 scale, and the conversion was right).

LIKE-FOR-LIKE MEASUREMENT (frozen pose, changed = pixel differs from baseline by >6/255 in any
channel, over the organ's own pixels; hue shift and lightening over changed pixels; teal% = share
of changed pixels landing in the reserved hue band):

| organ | channel | changed px | of organ | hue shift | teal% | lighter% | spread r90 |
|---|---|---|---|---|---|---|---|
| pancreas | opacity | 2049 | 6.0% | 14.7° | 0 | 8 | 27 px |
| pancreas | albedoBleed | 1131 | 3.3% | 1.6° | 0 | 0 | 28 px |
| pancreas | darken | 1048 | 3.1% | 0.6° | 0 | 0 | 26 px |
| pancreas | rimBlend | 1316 | 3.9% | 3.7° | 0 | 85 | 23 px |
| brain (GBM 2.5) | opacity | 2121 | 6.8% | 16.2° | 0 | 0 | 26 px |
| brain (GBM 2.5) | albedoBleed | 7993 | 25.7% | 0.9° | 0 | 9 | 67 px |
| brain (GBM 2.5) | darken | 8147 | 26.2% | 0.5° | 0 | 0 | 65 px |
| brain (GBM 2.5) | rimBlend | 2208 | 7.1% | 9.3° | 0 | 6 | 62 px |
| lungs (teal ×-product) | opacity | 1890 | 8.5% | 33.1° | 86 | 0 | 24 px |
| lungs (teal ×-product) | albedoBleed | 841 | 3.8% | 4.1° | 0 | 0 | 32 px |
| lungs (teal ×-product) | darken | 756 | 3.4% | 0.7° | 0 | 0 | 33 px |
| lungs (teal ×-product) | rimBlend | 1346 | 6.0% | 110.2° | 1 | 62 | 23 px |

THE LOOKS (side-by-side 3× crops, baseline left, channel right; /tmp/atlas-verify/bake4/pair_*,
ephemeral; `node .claude/capture_organs.js <out> Pancreas Brain Lungs --port 3079 --freeze` with
the temporary wiring): OPACITY — the mass becomes a ghost through which the organ and even a
marker dot show; on the teal mass 86% of changed pixels land in the reserved hue band — the
hue-contamination class that killed the glow, as predicted. ORGAN-SIDE (albedoBleed, darken) —
nothing visible at the crop scale on any organ although a quarter of the brain's pixels moved:
per-pixel shifts of 0.5–1.6° spread over organ-scale rings; a channel that changes 26% of an
organ without a reader seeing anything fails (1) and (2) at once, and albedo blend is blind on
tan-on-tan (pancreas) while bleeding hue where there is contrast. RIMBLEND — pancreas: the mass
base takes the pancreas tan and the knobbed lump reads as growing out of the gland, subtle
because the two tans nearly coincide; brain: the lower half of the mass takes the brain's
red-brown and the apex stays tan — plainly 'merging into the brain'; lungs: the reserved teal
mass's base takes the lung's pink while its apex stays teal — no teal enters the organ (1%), but
the organ's colour enters the placeholder.

VERDICT BY THE CRITERION. `opacity` FAILS (translucency reads as lighter tissue; contamination).
The organ-side channels FAIL: no legible middle exists at the atlas's framing — rings measured
in mass radii are organ-scale and imperceptible per pixel; rings small enough to be rings are a
few pixels. `rimBlend` PASSES: (1) the boundary dissolves while the mass stays opaque; (2) no
organ pixel changes, so 'diseased throughout' is impossible by construction; (3) it lives on the
mass, so the baked-AO composition on the seven AO organs cannot wash it out, and AgX acts on both
blended colours alike; (4) the cross-product bleeds nothing INTO the organ. It is the user's
guessed direction — an albedo blend that keeps the mass opaque and dissolves only its boundary —
on the mass side rather than the organ side.

TWO QUESTIONS THE BAKE-OFF RAISED, FOR RULING BEFORE WIRING. (a) THE REVERSE CROSS-PRODUCT: may
a placeholder (uncharacterised-margin) mass wear the ORGAN's albedo at its base when its growth
is cited infiltrative? The reserved-colour flag survives at the apex and the badge still names
the uncharacterised property, but the colour's reading weakens; today no live entry has this
combination (TNBC's growth is a harvest seed), so the question is real but not yet load-bearing.
(b) GBM: rimBlend carries diffuseness as a DEGREE (a taller dissolved band), not as spatial
EXTENT — the centimetres-beyond-any-margin fact is not drawn. The pre-registered falsifier
therefore resolves in its second form: the edge tier carries GBM's boundary character, and the
extent is a LABELLED statement on the badge, not a visual one. GBM at tier 2 stands with that
qualification; nothing on the organ is shaded.

WHAT IS COMMITTED: the five channels dormant in main.js (the losers kept until the ruling so the
captures can be regenerated, then removed), `FALLOFF_CHANNEL = 'rimBlend'` as the recorded
decision with `GROWTH_RENDER` still EMPTY (no production render changes until the ruling on (a)
and (b) and the growth-status wiring), and `--freeze` in the capture tool.

## 8-old. Rulings requested before code (as first written)

(i) §3(b): is parenchymal diffuseness edge extent (GBM at tier 2) or a distinct treatment
(GBM at tier 4)? (ii) §3(c): does COMPOSITION become a fifth mechanism, and when? (iii) §5:
colour stays with margin; growth status on the badge only. (iv) The material channel for
EDGE (colour blend vs alpha ramp) — a look-and-decide, like the reserved colour was.
