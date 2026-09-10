# Phase A — stage-extent and breach, on paper before code (design document, 2026-09-10)

STATUS: DESIGN ONLY. Spec §4 of `phaseA_mapping.md` fixed the property (EXTENT, not size) and the
category source (SEER Summary Stage, public domain) on 2026-09-05. Two constraints were PRE-COMMITTED
by the user on 2026-09-10 before any entry source is read, and this document is written under them.
Standing conditions (1)–(8), the category-cited / magnitude-illustrative split, the fourth property
of a declaration, the collision rule's three arms, the reserve rule and the reserved-signal principle
all govern here. Declared a NON_INSTRUMENT in `battery.py`: asserts nothing, ratchets nothing.

## 1. The two pre-committed constraints (user), and a third the user named beside them

**A. SOURCE VOCABULARY: SEER Summary Stage, not AJCC.** Breach's natural source is staging language,
and AJCC's T-category definitions are licensed text this project cannot reproduce. SEER Summary
Stage 2018 covers the same ground — localized, regional by direct extension or to regional nodes,
distant — and is public domain. Fixed here, before entries are written, because it is expensive to
unwind afterwards. The ledger's EXT record already quotes the NCI staging page for the five
categories (in situ / localized / regional / distant / unknown) and names the SSM 2018 manual.

**B. REGISTER: breach is MODAL, and the render must not make it factual.** A cancer *can* breach at
advanced stage; it does not always. Rendering breach as a fixed attribute asserts something stronger
than the source — the certainty-drift class, the dropped "may". How a modal property is expressed is
decided HERE, before building; if geometry cannot express modality honestly, that is a legitimate
finding and the property belongs in text with the others (the understated-extent label, growth on a
placeholder).

**C. THE SECOND STRUCTURE.** Breach involves something to breach INTO, and most adjacent structures
are not modelled. The nothing-to-breach-into case is designed first, before the case where there is.

## 2. What the corpus holds, read from the tree and the ledger

| entry / fact | source | what it is | second structure modelled? |
|---|---|---|---|
| all sixteen: SEER Summary Stage categories | EXT record: NCI Cancer Staging page (cancer.gov, reviewed 2022-10-14); SSM 2018 manual named | the CATEGORY vocabulary, cited once for all | — |
| per-site stage at diagnosis | SEER Cancer Stat Facts pages, "Percent of Cases by Stage at Diagnosis", basis "SEER 21 (Excluding IL) 2016–2022"; public domain; verified 2026-09-10 for pancreas (Localized 15%, Regional 28%, Distant 51%, Unknown 5%) and melanoma (Localized 77%, Regional 10%, Distant 5%, Unknown 9%) | a DISTRIBUTION per cancer — the modal expression of extent as a population fact | — |
| melanoma: radial then vertical growth phase, "infiltrates deep into the dermis" | R10 PMC12427887 | a breach of the dermo-epidermal junction | YES — the skin block models epidermis, basal band, dermis and hypodermis as slabs (skin.js) |
| HCC: satellite nodules "separated from the primary tumor by non-cancerous tissue with a distance ≤2 cm" | R12 PMC11007400 | regional extent within the SAME organ as COUNT with a distance rule; a definition, no frequency | not needed (same organ) — but no share is cited, so drawing one asserts typicality |
| bladder: ~75% non-muscle-invasive against ~25% muscle-invasive | R19 (four sources) | a breach INTO the muscle layer of the wall | NO — the bladder GLB has no wall layers |
| GBM: "topographically diffuse" | R21 PMC3019011 | extent beyond any drawn boundary | NO — labelled (§10 of the growth document) |
| PDAC: perineural invasion | pancreas.js histology hotspot, cited | extent along nerves, histologic register | NO — and its gross-register extent needs its own read |
| CRC: "endophytic ring-shaped" distal growth | R6 PMC6165083 | the WALL mechanism of the growth axis, not breach | — |

## 3. The modality analysis — how far geometry can honestly go

(a) SEER stage at diagnosis is a per-case fact and the atlas draws ONE illustrative mass. Any single
drawn extent therefore asserts one stage for a disease that presents at several. Pancreatic cancer
presents distant in 51% of cases and localized in 15%; melanoma presents localized in 77%. A confined
mass drawn for both says the same thing about two opposite distributions.

(b) THE DEFAULT ALREADY MAKES A CLAIM. Today's mass sits within its organ — it READS as localized. For
a cancer usually found beyond localized (pancreas: 79% regional or distant at diagnosis) the default
render understates the typical extent in a known direction. That is the understated-extent form of
§10 of the growth document, GENERALISED: not a GBM special case but a per-entry statement sourced
from the SEER distribution — "drawn confined; at diagnosis X% are already regional and Y% distant
(SEER 21, 2016–2022)". Text carries the modality exactly (a distribution IS a modal statement), the
direction of error is stated, and nothing is asserted about a single patient.

(c) WHERE A SECOND STRUCTURE EXISTS, geometry can be honest: the skin block models the layers, and
melanoma's cited phases (radial, in the epidermis; vertical, into the dermis) are a breach of a
modelled boundary. SEER's "localized" for melanoma includes dermal invasion (the disease is still
confined to the skin), so a drawn dermal plug does not contradict the 77% localized share; the badge
carries both phases and the distribution. This is the ONE geometric candidate in the corpus.

(d) WHERE NOTHING IS MODELLED TO BREACH INTO — every organ but the skin — a mass drawn crossing its
organ's surface into empty space reads as PROTRUSION, which is the PLACEMENT mechanism (exophytic),
a different cited property. A geometric breach without a neighbour therefore collapses onto a claim
the source did not make. Pre-registered as the failure any organ-side breach render would meet; no
build is attempted against it.

(e) SATELLITES are count with a distance rule and need no second structure, but R12 gives a
definition and no frequency; drawing one asserts typicality. Not drawn until a share is cited.

## 4. The decision criterion, pre-committed

Geometry may express extent for an entry only when ALL of: (1) a modelled second structure exists
for the breach; (2) the drawn state is consistent with the entry's modal SEER stage at diagnosis, or
the badge states explicitly that the drawing is the understated case and by how much; (3) the badge
carries the distribution and its source. Otherwise extent is TEXT: the generalised understated-extent
statement, sourced per entry from its SEER Cancer Stat Facts page, with the page URL and the date it
was followed as the identifier (the fourth property; the URL-date rule of `reserve_check`).

PREDICTED OUTCOME, written before the reads: fifteen of sixteen entries go to text; melanoma is the
one geometric candidate. The bladder's muscle-invasive quarter would need wall layers the GLB does
not have; GBM stays labelled; HCC's satellites wait for a share.

## 5. What this finds, in the user's terms

Geometry cannot express a modal property honestly for a single illustrative mass, EXCEPT where a
modelled boundary lets the drawn state agree with the modal stage (melanoma). For everything else the
property belongs in text — the legitimate finding constraint B anticipated — and the text form is
already built: `EXTENT_UNDERSTATED` becomes an entry-keyed table fed from the SEER distributions
rather than a GBM string. Render coverage (§13 of the growth document) will record extent as
text-only for fifteen entries by construction; that is the honest count, not a drift.

## 6. Build order

1. THE READ, one public-domain page per site (14 pages for 16 entries; ovary covers HGSOC and OCCC,
   thyroid covers PTC and FTC): the four stage shares and the SEER basis, each URL followed and
   dated. `EXTENT_STATUS` per entry with the distribution; the understated statement generated from
   it for entries whose modal stage is beyond localized; the badge extended; the fourth property
   asserted on the new statuses.
2. MELANOMA'S PLUG in the skin block — a look-and-decide against a pre-registered criterion: the
   plug must read as the vertical phase entering the dermis and not as a second lesion; the radial
   plaque stays the placement expression; the badge carries both phases and the 77/10/5/9.
3. Nothing else geometric until a second structure is modelled for an organ; the wall mechanism
   (growth axis) is the next build after extent, and CRC's annular form belongs there, not here.

## 7. Rulings requested before code

(i) Confirm the TEXT default for extent — the generalised understated-extent statement from the
SEER distribution — as the honest expression of a modal property for fifteen entries. (ii) Confirm
melanoma's dermal plug as the one geometric breach. (iii) Confirm the SEER Cancer Stat Facts pages
as the per-site source (public domain, "SEER 21 (Excluding IL) 2016–2022"), identified by URL and
verification date.

## 8. Rulings received (2026-09-10), and the melanoma question settled before building

**RULING 1 — text default ACCEPTED, with two additions.** (a) An independent argument that lands the
same way and is about who reads this: the render must not depict a stage the reader might not have.
A person with localized pancreatic disease seeing it drawn invasive is a worse failure than the
reverse — text can correct a conservative picture upward but cannot unsee a frightening one. (b) A
CONSTRAINT: stage at diagnosis is a fact about DETECTION, not about growth. Pancreatic cancer is 79%
regional-or-distant at diagnosis largely because there is no screening and symptoms come late;
melanoma is 77% localized largely because it is visible on skin. Under a growth heading, "usually
regional or distant" reads as a claim about how the tumour behaves, which is not what SEER measured.
THE WORDING STAYS DETECTION-FRAMED — "found at" — and that phrasing is protected, because it is
exactly the qualifier that gets trimmed for space in a badge ("usually spreads beyond the organ" is
the trimmed version that will suggest itself, and it is false to the source). (c) Fifteen instances
change the form: the understated-extent badge was designed as an exception annotation for one entry;
at fifteen it becomes the PRIMARY carrier of extent information and is designed as one — an EXTENT
line on every mass badge, not an exception marker on nearly every entry.

**RULING 2 — NOT as stated; the melanoma question answered first (user).** Is the dermal plug a
breach into a second structure, or invasion DEPTH within one? READ FROM THE TREE: the skin block's
slabs (skin.js) are the layers of ONE organ — epidermis from the surface to the dermal-epidermal
junction, a 0.7 mm pigmented basal band, dermis down to the dermis/hypodermis boundary, hypodermis
below — and a plug from the epidermis into the dermis occupies the skin's own thickness. THAT IS
DEPTH, NOT BREACH. Depth of invasion in melanoma is Breslow thickness, a millimetre measurement
cited per tumour (and distributed at population level), which would make it the FIRST CITED
MAGNITUDE in this atlas — outside the category-cited / magnitude-illustrative split that has governed
every geometric parameter so far, and therefore a claim to its own axis and its own ruling, not a
slot in extent breach. ONE FACT THAT RULING MUST CARRY: the block is not to scale. Its section is
16 mm of design units with an epidermis ~2.2 mm deep and a dermis ~8 mm (rendered at ×5), against
real skin's ~0.1 mm epidermis and 1–4 mm dermis; a Breslow depth drawn true-to-millimetre would sit
inside the model's epidermis, and one drawn to the model's layer proportions would not be the
measurement. Either the layer scale is declared and the plug drawn against it with the true
millimetres on the badge, or depth stays in text. Melanoma therefore leaves this document's
geometric column: extent on THIS axis is text for melanoma too, and the depth axis is a separate
proposal. PREDICTION ACCOUNTING: the pre-registered "fifteen to text, melanoma geometric" comes out
as SIXTEEN to text on the extent axis — the sixteenth not refuted but reassigned to an axis that did
not exist when the prediction was written.

**RULING 3 — Stat Facts pages ACCEPTED, with the data vintage.** SEER Cancer Stat Facts are living
documents revised each submission; "79%" is a figure with a vintage. Every extent status records the
registry set and diagnosis-year range ("SEER 21 (Excluding IL) 2016–2022") and the data submission
where the page states it, alongside the retrieval date — the difference between a citation someone
can re-verify and one they can only re-check against whatever the page says later.

## 9. The depth question, measured (2026-09-10) — Breslow as the first cited magnitude

**The question the user set:** is the skin block's layer exaggeration uniform or per-layer? If
uniform, a depth could be drawn at a true relative position against a declared scale; if per-layer,
a plug placed at a real millimetre lands in the wrong layer and depth goes to text unless the block
is re-proportioned. One measurement, then the ruling.

**The measurement, read from `js/organs/skin.js` (design units are metres; the block renders at
`SCALE = 5`).** The block is parametric: five layer constants (`Y_TOP`, `DEJ_BASE`, `BAND`,
`DH_BASE`, `Y_BOT`) plus surface/junction undulation amplitudes and two follicles anchored at a
bulb height. Layer thicknesses and the real figures the file itself records beside them:

| layer | block (design mm) | share of the 16 mm section | real figure the file cites | exaggeration |
|---|---|---|---|---|
| epidermis | 2.2 (basal band 0.7 inside it) | 14% | 31.2–596.6 µm measured across 37 sites (Lintzeri 2022); ~0.1 mm typical | 3.7× the measured MAXIMUM; ~22× typical |
| dermis | 8.0 | 49% | 1.5–4 mm (SEER) | 2–5.3× |
| hypodermis | 5.8, truncated by the block floor | 37% | millimetres to centimetres, site-dependent | ~1×, and cut off |

**Finding: PER-LAYER.** The factors differ by an order of magnitude between the epidermis and the
hypodermis, and the file says as much ("a legibility scale, not an anatomical one"). Consequence for
a Breslow depth: a 1.0 mm thickness — a thin melanoma that in life has crossed the junction and sits
in the papillary dermis — placed at 1.0 mm below this block's surface would sit INSIDE the 2.2 mm
epidermis. The drawing would show a confined lesion for a number that means invasion. That is the
extent-axis failure of §3 in a different coat: geometry making a register claim the source did not.
So under the criterion of §4, depth is TEXT unless the block is re-proportioned.

**Pricing re-proportioning (the block is parametric, so it can be priced).**
- *True scale (×1):* epidermis 0.1 mm design → 0.5 mm rendered at SCALE 5 — a hairline; the basal
  band, the junction undulation and the "this is skin" follicle emergence all vanish. **REJECTED**, as
  the user pre-registered ("reject it if true scale makes the epidermis a hairline").
- *Uniform ×8:* epidermis 0.8 mm design (4 mm rendered), dermis 16 mm, hypodermis truncated at the
  floor; section grows from 16 to ~20 mm or the dermis share is cut. Feasible: six constants change,
  but the junction undulation (0.55 mm amplitude) must shrink below the new epidermis, the basal band
  (0.7 mm) becomes ~0.25 mm and may not read, the bulb (0.75 mm radius) and follicle depth
  (−1.2 mm) re-derive, the description's "~14%/49%/37% of a 16 mm section" and the REAL FIGURES
  comment rewrite, and the skin capture is re-read for whether it still reads as skin at a glance.
  Estimate: about half a day including the visual re-verification. What it buys is ONE drawable
  magnitude (a depth plug at a true relative position with "×8" on the badge). Not recommended now:
  the render currently carries two cited melanoma properties (irregular border; growth) that a
  re-proportioned block would have to re-verify, for an axis whose first member can be carried in
  text at zero cost.

**The axis, designed generically: CITED MAGNITUDE.** A per-entry table in `js/morphology.js`
(`MAGNITUDE_STATUS`, statuses `uncharacterised | cited`), each cited row carrying `{quantity,
value, unit, framing, basis, source, ref}` with the fourth property (a resolvable identifier and a
verified date) and a text sentence on the badge by default. A magnitude is drawn only when its
carrier is uniformly scaled and the badge states the scale — the §4 criterion, unchanged. Breslow
first: the quantity is thickness in millimetres from the granular layer, the source must be a
non-AJCC one (Breslow 1970 for the measurement; a SEER or PMC source for any distribution), and the
staging cut-points are never reproduced (constraint C). Phase C members waiting on the same axis:
tumour size thresholds and nodal counts — same shape, same text-first default. **RULED 2026-09-10 (user): TEXT, and the re-proportion is DECLINED.** Per-layer was the
pre-committed criterion, and it measured per-layer, so the ruling follows without a further build
step. On the uniform-×8 option specifically: it buys exactly one rendered property today (a Breslow
plug on melanoma), and at ×8 the epidermis is 0.8 mm against a dermis of 8 mm — the epidermis stays a
sliver relative to the dermis either way, so the re-proportion likely would not even restore reliable
in-situ-vs-invasive visibility, the property a depth plug would exist to show. Half a day for a
marginal epidermis and one entry is the wrong trade. The axis stays written as CITED MAGNITUDE,
generic, Breslow first, text by default — that part cost nothing to design and Phase C's size
thresholds and nodal counts will use the same shape.
