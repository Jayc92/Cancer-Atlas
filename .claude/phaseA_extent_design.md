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
