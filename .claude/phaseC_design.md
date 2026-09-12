# Phase C: breadth to ~120 — content-model decisions before the first entry is authored

**Why this document exists.** The crowding decision and its reasoning lived only in a chat
message and, after the ruling, in one dense code comment (`main.js`, the "PHASE B — THE CROWDING
FIX" block). Decide-before-authoring only works if the decision is readable by someone who wasn't
in the conversation — this is that record, for the crowding choice and for the origin-siting cost
the same investigation surfaced. Both are settled before any of the 35 already-staged entries
(§3) get authored.

## 1. The crowding decision — mechanism, three options, the ruling

**The mechanism, before the options make sense against it.** The old code (superseded, see §1a)
gave one organ ONE hotspot (`ORIGIN_HOTSPOT[organKey]`, `js/morphology.js`), then looped every
active cancer of that organ and gave each its own mass: the first sat at the anchor, every
subsequent one pushed along a shared tangent by a constant `massR*2.2` per step. `massR` is
`MASS_RADIUS_FRACTION` (0.22) times the organ's radius. For N entries on one organ, the last mass
ended up `(N-1)*0.484` organ-radii from the first — at six entries, ~2.4 radii of lateral spread,
past most of these meshes' own visible extent. Each mass also carries its own floating DOM badge
that tracks its mass's projected screen position, so the badges crowded exactly the way the
masses did.

**The trigger was a live defect, not only a projected risk.** Reading `addOriginMasses()` to cost
the three options below found ovary's own hotspot text saying clear-cell carcinoma does *not*
arise at the surface epithelium — "clear-cell and endometrioid carcinomas are the exception —
they begin in endometriosis... rather than in this layer" (`js/organs/ovary.js`) — while
`ORIGIN_HOTSPOT.ovary = 0` pointed exactly at that surface-epithelium hotspot, and both `hgsoc`
and `clear` rendered there. Shipped, not hypothetical, at N=2. Thyroid's shared origin, by
contrast, was and is *correct*: PTC and FTC really do both arise from follicular cells, and the
organ's own text says so — one shared origin isn't a defect everywhere, only where an organ's
biology doesn't actually agree with itself. This asymmetry is why the crowding fix and the origin
question are related but not the same problem — see §2.

### The three options, as costed before the ruling

| | **A — shrink the mass** | **B — one mass at a time** | **C — origin per entry** |
|---|---|---|---|
| **Mechanism** | Lower `MASS_RADIUS_FRACTION` below 0.22 | Organ screen shows markers only; cancer-list selection swaps in the one selected mass | `ORIGIN_HOTSPOT` keyed per entry, not per organ; new anchor research where an organ's existing hotspots don't cover the right site |
| **What it costs** | Cheap in code (one constant), but invalidates two already-measured floors — the reserved-apex dissolve cap and the rim-blend visibility sweep were both derived *at today's size*; shrinking means re-deriving both, and pushing too far risks making spikes/undulation sub-pixel, erasing the margin-character axis Phase A exists to render | Moderate interaction-code cost (selection state, mass swap on list-row hover/focus) instead of content cost; loses the at-a-glance "compare every cancer's margin on one screen" affordance — a real UX change users notice | Highest cost by far, and the only one that's per-entry research rather than a code change: every entry needs a source-verified answer to "where does this specific subtype arise," at the rigor this project already holds organ-level hotspots to. Works cleanly where an organ has real distinguishable sub-sites; may not exist meaningfully for others |
| **What it forecloses** | Doesn't fix origin-collapse at all (still one shared anchor); doesn't fix badge crowding on its own; only raises the entry-count ceiling before crowding returns | Doesn't fix origin-collapse either (masses still share the one anchor when they do render) | Doesn't cap total mass count or prevent two entries' *real* nearby anatomical origins from crowding anyway; cost scales with entry count and doesn't automate |
| **Reserved-density interaction** | Neutral to slightly bad — smaller reserved masses are still visually present, and a shrink doesn't reduce how many entries land on the shared teal, so the "same-looking blobs read as a category" risk is unchanged by size alone | **Structurally the strongest fit** — reserved and cited masses never appear side-by-side, so multiple teal masses can never visually cluster into an apparent category; the organ-level "how many of this organ's cancers are characterized" overview moves to the cancer-list rows themselves | Helps some — scattered real anatomical origins reduce the odds of teal masses clustering into an obvious train, since they're no longer forced onto one line — but the reserved-density risk doesn't go away, it spreads out rather than resolves |

A is the cheapest but the weakest — it buys headroom, not a fix, and Phase C's projected entry
counts (four to six per organ) will plausibly outrun whatever headroom a defensible shrink
provides. C is the most correct answer to the *named* problem (biological site accuracy) and the
only one that also fixes the ovary defect, but its cost doesn't bound with entry count the way A
and B's do. B is the one that caps the crowding hazard structurally (mass count per organ view is
always 1, independent of entry count) and best survives the reserved-density fact — at the cost of
an interaction-model change and zero improvement to origin accuracy on its own. **B and C are not
mutually exclusive** — B ships now to solve crowding structurally, with C's per-entry siting
research layered in gradually wherever an organ's biology actually calls for it.

### The ruling

Put to `AskUserQuestion` with B recommended; the user selected **B — one mass at a time**, alone
(multiSelect was offered; C was not additionally selected at ruling time — see §2 for why the
ovary instance of C shipped anyway, ahead of and independent of the ruling).

### §1a — B, as built and live

`js/main.js`'s `previewMass(entryId)` (superseding the old `addOriginMasses()` loop) renders
**at most one mass per organ**, chosen by hovering or focusing a row in `renderCancerList` — the
organ screen otherwise shows markers only. This structurally caps the per-view mass count at 1
regardless of how many entries an organ eventually carries, which is why it survived Phase C's
projected four-to-six-per-organ counts where the tangent-walk never would have. The code comment
at the mechanism's own definition (`main.js`, "PHASE B — THE CROWDING FIX") is the authoritative
implementation record; this document is the decision record the comment itself points a reader
back to. **What B does not do, restated plainly:** it does not fix per-entry origin accuracy in
general. A viewer who hovers `clear` after B shipped, before the ovary fix, would still have seen
the mass sitting at HGSOC's surface-epithelium anchor — B changes how many masses render, never
which anchor a given entry resolves to.

## 2. Per-entry origin siting — a Phase C line item, not a closed exemption

**The ovary fix (separate commit, ahead of B) closed one instance, not the general question.**
`ORIGIN_HOTSPOT_ENTRY` (`js/morphology.js`) lets a cancer id override its organ's shared
`ORIGIN_HOTSPOT`, keyed by cancer id, falling back to the organ default when absent. `clear` is
the only entry in it today. This is option C's mechanism, applied to exactly the one case that was
already a live, shipped contradiction — it was not, and is not, a decision to build out C
generally at Phase C scale. The registry-derived proof used to answer "sweep the other thirteen
organs" was: **only ovary and thyroid have 2+ active entries today, so only those two can even
exhibit the origin-collapse shape** — the other twelve are exempt because they have no sibling
entry to collapse with, not because their single entry's origin was individually re-verified
against a competing sibling.

**That exemption is time-bound, and the bound is Phase C itself.** The moment any of the 35
staged entries in §3 activate, its organ gains a second (or third, fourth...) active entry, and
the origin-collapse shape becomes possible on that organ for the first time — the same way it
became possible on ovary the day `clear` was wired. An organ that is exempt today because it
carries one entry is not exempt once it carries two. This is not a defect in the twelve-organ
proof; the proof was correct for the population it was measured against, and that population is
about to change by construction.

**The consequence: per-entry origin siting is a counted first-wave cost, not a maybe.** Each of
the 35 entries in §3 needs the same question asked and source-verified that the ovary fix asked
of `clear`: where does this specific subtype actually arise, checked against its own organ's
existing hotspot prose (not assumed to match the organ's already-active sibling just because they
share a mesh). Concretely, per entry:

1. Read the organ's existing hotspot list and its current `ORIGIN_HOTSPOT[organKey]` default.
2. Find a source (the same standard organ-level hotspots are already held to) stating where this
   specific subtype's own histogenesis actually begins.
3. If it matches the organ default, no override is needed — same as thyroid's PTC/FTC today.
4. If it doesn't, add an `ORIGIN_HOTSPOT_ENTRY` override citing that source, and verify
   `reserve_check.js`'s existing `originHotspotEntryViolations` guard accepts it (the override's
   own hotspot text must speak of origin directly — the guard that would have caught the ovary
   contradiction had it existed at the time).

**This is thirty-five research passes, not thirty-five code edits.** Most will resolve like
thyroid — the organ's existing default already describes where the new subtype arises, because
subtypes of one organ frequently do share a real cell of origin (follicular-cell thyroid cancers,
adenocarcinoma-spectrum lung cancers). Some will resolve like ovary's `clear` — a real,
sourceable, different site. None should be assumed either way without the read: assuming "shares
the organ default" without checking is exactly the shortcut that shipped the ovary contradiction
in the first place. Budget this alongside whatever statistics/citation work each of the 35 already
needs — it is an additional, distinct question from "what is this subtype's share/mutation
profile," not a sub-item of it.

## 3. Phase C first wave — measured, not estimated

Fourteen organs, each checked for already-staged `active:false` siblings — entries that already
carry a real `id`, `name`, and cited `share` text, just not yet built out or flipped on:

| organ | staged (`active:false`) | which |
|---|---|---|
| prostate | 4 | ductal, mucinous, signet ring cell, neuroendocrine (Siech et al., 2026 — same source as the wired entry) |
| bladder, breast, brain, lungs, ovary, pancreas, skin | 3 each (21 total) | bladder: neuroendocrine/squamous/adenocarcinoma · breast: Luminal A/B, HER2-enriched · brain: astrocytoma/oligodendroglioma/meningioma · lungs: SCC/large cell/SCLC · ovary: endometrioid/mucinous/low-grade serous · pancreas: acinar cell/cystadenocarcinoma/PanNET · skin: BCC/SCC/Merkel cell |
| colon, kidneys, stomach, thyroid | 2 each (8 total) | colon: neuroendocrine/lymphoma · kidneys: papillary/chromophobe · stomach: intestinal-type/mixed-type (Lauren) · thyroid: medullary/anaplastic |
| liver, testis | 1 each (2 total) | liver: intrahepatic cholangiocarcinoma · testis: NSGCT (modeled as one combined entity, not split) |

**35 total**, from the tracked files, zero speculation — 16 → 51 if all thirty-five ship. Most are
now *complete* relative to what the atlas's own prior research already established: prostate's
four plus acinar sum to 100% of Siech's cohort exactly; bladder's three plus UC do the same against
Wang et al.; stomach's two plus gdiff cover all three Lauren categories; thyroid's two plus PTC/FTC
match Lim et al.'s full four-way split. Each organ's own earlier authoring pass already did this
research; thirty-five of it is sitting there.

**One real gap, found rather than assumed:** colon stages only the two catch-all minorities
(neuroendocrine, lymphoma) — mucinous adenocarcinoma (~10–15% of CRC, MSI-high-associated) isn't
staged at all, and would need fresh research like anything beyond the 35. Keep it out of the 35
and report it separately so the measured number stays measured (the standing instruction this
count was built under). A few similar candidates exist elsewhere (breast's invasive lobular
carcinoma as a histologic-axis addition; NSGCT's own named components if more granularity is
wanted later) but none is pre-staged, so none is folded into the 35.

That puts the first-wave ceiling closer to **~51–55 reachable on already-modelled organs**, not
sixty to eighty. If the higher figure is wanted, it means fresh per-organ research beyond the
already-staged set, the way colon's mucinous gap would need — not an undercount of what's already
there.

## 4. What has to happen before the first of the 35 is authored

Both gates below are now closed by this document and by what shipped alongside it — recorded so a
later reader can see the ordering was followed, not skipped:

1. **The crowding decision** — ruled and built (§1, §1a). Live in `main.js`.
2. **Per-entry origin siting counted as a cost** — this document (§2), so the 35's estimate
   includes it rather than discovering it at entry twelve the way the ovary contradiction was
   discovered rather than budgeted for.

Authoring can start on the 35.

## 5. The ovary pilot — cost report (2026-09-11)

Three entries authored end to end (endometrioid, mucinous, low-grade serous carcinoma), on one
already-modelled organ. What follows is what it actually cost, broken down so the other thirteen
organs are plannable rather than discovered the same way this one was.

**Literature: fewer sources than entries, and that was not guaranteed going in.** Five primary
papers covered all three entries' mutations, sites, and histology: Diagnostics 2021 (De Leo et
al., PMC8070731 — a WHO-2020-based review that happened to cover endometrioid, mucinous, AND
low-grade serous morphology and mutation frequencies in one paper, the same paper already backing
this organ's HGSOC and OCCC entries), Hollis et al. 2020 (endometrioid trunk/branch), Gorringe &
Bowtell 2020 (mucinous trunk/branch), Etemadmoghadam et al. 2017 (LGSC mechanism), and Pearce et
al. 2012 (the same pooled endometriosis-risk analysis already cited for `clear`, re-read for its
own endometrioid and LGSC numbers). **The comprehensive review paper is the reason this ran
cheap** — a single modern review covering an organ's full histotype range is not something to
assume exists for every organ; when it does, budget accordingly, and when a first search doesn't
turn one up, budget for the higher, per-entry-paper cost instead rather than assuming this pilot's
ratio generalizes.

**Mechanistic-fit reasoning, not literature-finding, was where the real time went.** Two entries
(endometrioid, mucinous) had their branch genes essentially handed over by their own source
papers' own top-frequency lists, cross-checked once each for exclusivity against the trunk. The
third (low-grade serous) needed real back-and-forth: KRAS, BRAF, and NRAS are mutually exclusive
with each other in this cancer specifically, which ruled out the first, more obvious branch-gene
design (NRAS + its cooperating partner EIF1AX, drawn onto a tumor whose trunk is KRAS-or-BRAF) as
internally inconsistent, and the real, documented EIF1AX–NRAS finding ended up stated in prose
rather than drawn into the cell ledger at all. **Budget one entry per organ, not evenly
distributed, to need this kind of real reconsideration** — it is not predictable in advance which
one, only that a real organ's biology will occasionally not fit the template cleanly, and forcing
a fit rather than reasoning through it is exactly the failure mode this project's culture exists
to catch.

**The extent/staging axis was free, and this generalizes.** SEER Stat Facts is organ-level, not
histotype-level, for every cancer site — the same live scraper run that reproduced this organ's
already-hand-verified 22/18/54/6 shares served all three new entries at zero incremental cost,
because they share the SAME page hgsoc/clear already cite. **Every future Phase C entry on an
already-modelled organ gets its extent axis for free this same way** — this is the strongest,
most transferable finding in this report, because it holds regardless of which organ.

**Citation hygiene was the real, recurring tax, and it was larger than the content work's own
error rate would suggest.** Zero of the actual scientific claims were wrong — every mutation
frequency, mechanism, and citation resolved correctly on the first literature read. What cost
real, repeated cycles was the corpus's own tooling catching FORM problems in how that correct
content was phrased: an apostrophe inside a single-quoted JS string (the exact scar this project's
CLAUDE.md already names as a standing hazard), two unscoped-absence-claim rewrites, one arithmetic
slip in a fraction (82/185 for 82/184), and — the largest single cluster — a citation
("Diagnostics (Basel), 2021") whose bare journal-name phrasing let the extractor mistake the
journal for the author, which cost a real PubMed lookup (De Leo A is the true first author) and
cascaded into two further, smaller fixes (a new multi-word-surname declaration, a repeat of this
same round's own "WHO-2020-based" bare-digit ambiguity). **Seven distinct gate-driven fixes across
two commits, on three entries.** None were false alarms — every one caught something real, even
if minor — but this is the cost line most likely to recur at roughly this rate on the next thirteen
organs, and it is the one this report most wants to flag: budget real time for it, not zero.

**The one cost this pass did not anticipate going in: the histology view needs code, not just
data.** `HISTOLOGY_ENDO`/`HISTOLOGY_MUC`/`HISTOLOGY_LGSC`'s `intro`/`features` text alone renders
nothing — each cancer id needs its own hand-written procedural SVG generator function in
`js/histology.js`'s `GENERATORS` dispatch, discovered only when `regress.js` reported
`cancer {endo,muc,lgsc} histology []` (zero features) on the first full battery run. This is real,
recurring, per-entry work — budget it explicitly for the next thirteen organs rather than assuming
the data block is the whole cost, the same mistake this pass itself made.

**Net reading for planning:** on an already-modelled organ with a strong review paper available,
one entry costs roughly one paper (sometimes shared across several entries) plus one real
mechanistic-fit check plus one histology generator plus a real, non-zero chance of one or two
citation-hygiene round-trips — and the extent axis is free. The literature-finding cost this pass
measured is an optimistic case (a comprehensive review existed); the mechanistic-fit and
citation-hygiene costs are closer to a realistic baseline for what any of the remaining
thirty-two entries should expect.

## 6. "Extent is free" was wrong — an organ-aggregate shown on a subtype entry can be a divergence,
## not just a scope note (2026-09-11, user-directed correction, ovary's five checked and fixed)

Item 5's own headline finding — that the extent/staging axis is free on any already-modelled
organ because SEER Stat Facts is organ-level, not histotype-level — was **correct about the
mechanism and wrong about the consequence.** All five ovary entries displayed the identical
organ-wide SEER distribution (localized 22% / regional 18% / distant 54% / unknown 6%), each with
a `siteNote` disclosing "not the X subtype alone." That note discloses **breadth** — it says
nothing about **divergence**. Showing the same number on five different subtype entries tells a
reader those five subtypes present alike, and four of the five do not.

**Checked against Peres et al. (JNCI, 2019, PMID 29718305, PMCID PMC6335112) Table 2** — a paper
already cited elsewhere in `ovary.js` and the disclaimer for OCCC's own stage/timing story, and
which turns out to report stage at diagnosis BY HISTOTYPE from the same underlying SEER registry
(SEER 18, 2004–2014, n=28,118 invasive EOC, 2014 WHO histotypes). Fetched live; every histotype's
three counts sum exactly to its own N, so the underlying counts carry no typo (only the paper's own
printed HGSOC-distant percentage does, already flagged elsewhere in this file's citation trail).
Real per-histotype localized/regional/distant split, computed directly from the counts:

| histotype | localized | regional | distant | old aggregate's modal | real modal |
|---|---|---|---|---|---|
| high-grade serous | 5% (882/17,837) | 17% (3,057) | **78%** (13,898) | distant | **distant (unchanged)** |
| low-grade serous | 20% (144/708) | 26% (186) | 53% (378) | distant | **distant (unchanged)** |
| endometrioid | **46%** (1,275/2,782) | 42% (1,177) | 12% (330) | distant | **localized (flipped)** |
| clear-cell | 34% (929/2,695) | **38%** (1,021) | 28% (745) | distant | **regional (flipped)** |
| mucinous | **48%** (1,274/2,641) | 25% (661) | 27% (706) | distant | **localized (flipped)** |

Four of five diverge materially from the shared aggregate; three of five diverge enough to flip
which stage is actually most common. Only low-grade serous is close to the aggregate it was
sharing (53% distant vs. the aggregate's 54%) — and even that one gained real precision from the
switch (its own regional share, 26%, differs from the aggregate's 18% by eight points).

**The fix is NOT "mark uncharacterised."** `extentSentence()`'s uncharacterised branch renders a
specific, hardcoded sentence: "the SEER page for {site} publishes no stage-at-diagnosis
distribution, so extent is not characterised" — which would be **false** for every one of these
five: a distribution exists, it's just organ-level. Marking a subtype uncharacterised when
organ-level data exists but subtype-level data doesn't would trade one misleading state for
another factually-wrong one. Since Peres 2019 supplies genuine, verified, subtype-specific data
for all five ovary histotypes at once, all five were switched from the organ-aggregate SEER Stat
Facts citation to Peres's own histotype-specific numbers — including low-grade serous, which
didn't diverge enough to require the fix but gains real precision from it and avoids leaving one
of five ovary entries on a different sourcing convention than its siblings. `js/morphology.js`'s
`EXTENT_STATUS` and `cancer-atlas.html`'s disclaimer were both updated; `reserve_check.js`'s
modal-matches-argmax guard was re-verified against the new numbers before shipping (three modals
changed, the guard would have caught a mismatch).

**The generalizable rule, for the remaining thirty-two entries and for every entry already
shipped:** an organ-level SEER Stat Facts distribution is only safe to show on a subtype entry
when that subtype's own real-world presentation tracks the aggregate. Before citing the organ
aggregate on ANY subtype entry, check whether a histotype-stratified source exists (a
population-based paper reporting stage/grade by subtype, the way Peres 2019 does for ovary) and
prefer it if found — it is very often the SAME underlying registry, just read at the right
granularity, not a harder-to-find source. Where no subtype-specific source can be found AND the
aggregate is suspected or shown to diverge materially, the honest state is `uncharacterised` (and
`extentSentence()`'s hardcoded sentence for that branch would need rewording to distinguish "no
distribution published at all" from "published only at the wrong granularity" — not yet needed,
since no entry has hit that exact case, but the wording gap is real and should be closed before
one does).

**This same organ-aggregate-as-subtype pattern is not unique to ovary — it is the standing
convention for every cited `EXTENT_STATUS` entry in the atlas, and none of the other ten have been
checked for divergence.** `pdac`, `tnbc`, `luad`, `hcc`, `ccrcc`, `acinar`, `gdiff`, `ptc`+`ftc`,
and `uc` all cite their organ's own SEER Stat Facts page with a `siteNote` disclosing "not the X
subtype/entry alone" — the identical shape ovary's five just failed on. `ptc`/`ftc` (papillary vs.
follicular thyroid carcinoma) is the most obviously worth checking first: two DIFFERENT entries
sharing one organ, exactly ovary's own shape, and the two histotypes are clinically understood to
behave differently. This is reported as an open risk, not fixed here — checking ten more organs
against their own literature is real, uncounted work, and is not part of this ovary-scoped
correction.

## 7. Item 2 — histology generators DO factor into families, proven by building a fourth
## (2026-09-11, user-directed test)

**The question:** the cost report flagged a hand-written SVG generator per entry as the largest
unbudgeted line item. Before writing thirty-two more, test whether they factor into a small,
parameterized set of architectural families instead.

**Method: read all nineteen existing generators, not just the three from the pilot.** The three
ovary generators alone are too small a sample to answer a question about thirty-two more entries
across thirteen more organs — the other sixteen (hgsoc, tnbc, luad, ccrcc, hcc, gbm, prostate
acinar, crc, pdac, gdiff, melanoma, occc, seminoma, bladder uc, ptc, ftc) are real, independent
evidence for whatever pattern actually recurs. Two shapes were ALREADY independently invented
more than once before this test started: a papillary frond (stroma body + optional core + a rim
of nuclei) appears, with different parameters, in hgsoc, ptc, lgsc, and bladder uc; a punched
cribriform mass (a blob + rejection-sampled non-overlapping lumens + cells filling the rest)
appears, nearly verbatim, in both prostate acinar's pattern-4 zone and crc's cribriform gland.
Extracted as two new shared functions in `js/histology.js` — `drawFrond` and
`drawCribriformMass` — plus one trivial one, `drawPsammomaBody` (duplicated verbatim between
hgsoc and ptc). **None of the five generators that already contained these patterns were
touched** — the extraction adds functions, it does not retrofit already-shipped, gate-verified
code, matching this pilot's own standing discipline about not editing frozen/verified work
without a reason tied to it.

**A third candidate family — solid sheets (a bounded blob + a grid of `drawCell` calls) —
appears in five generators (tnbc, luad's zone 3, prostate acinar's pattern 5, occc's zone 3,
endometrioid's grade corner) but was NOT extracted.** It is already this simple: a shape plus a
loop. A dedicated helper would save a few lines per caller and add one more name to remember —
not worth it at this size. This is itself a finding: not every recurring shape is worth
factoring, only the ones complex enough that re-deriving them by hand is real cost.

**Proof: a fourth generator, for a real Phase C entry, built from parameters alone.**
Prostatic ductal adenocarcinoma (one of prostate's four staged entries — item 4) is real-cited as
exactly this test needs: "composed of tall, columnar, pseudostratified epithelium with a
papillary, cribriform, glandular or solid architecture... papillary architecture being the most
helpful diagnostic feature" (Seipel et al., *Pathology*, 2016, PMID 27321992); "papillary and
cribriform being the most common" pattern, with "the vast majority of PDA contain[ing] admixed
acinar carcinoma, with a median percentage of the ductal component of 50%" (Au et al., *Ann Diagn
Pathol*, 2019, PMID 30772651). Built as two papillary fronds (`drawFrond`, with a new `nucStyle:
'columnar'` + `radialJitter` option added to depict pseudostratification — a real, distinct look
none of the four existing frond generators needed) + one cribriform mass (`drawCribriformMass`) +
five ordinary acinar glands (reusing the pre-existing, unmodified `drawGlandRing`) — a genuine
three-family composite, matching the honest multi-pattern precedent luad/prostate-acinar/occc
already set for their own real multi-pattern disease. **Zero bespoke per-cell drawing code was
written for this entry — every pixel came from parameters passed to existing or newly-shared
functions.** Live-verified in the browser (dynamically imported, rendered against a detached SVG
element, screenshotted): three legible, architecturally distinct zones — elongated nuclei
strung along a red vascular core, a sieve-like punched sheet, and small separate rings — reading
correctly as papillary-with-cribriform-and-admixed-acinar, not as a recolored copy of any
existing slide.

**The generator was then deliberately NOT kept in the shipped file.** `ductal` is not yet a real
`cancerEntries` stub in `prostate.js` — no mutations, no origin siting, no extent, no trials —
and a histology generator with no entry to serve is dead code by this project's own standard
(never mind that it renders correctly). The code is preserved here, verbatim, for when `ductal`
becomes real:

```js
function genProstateDuctal(g, rnd){
  // Prostatic ductal adenocarcinoma — papillary architecture is "the most helpful diagnostic
  // feature" (Seipel et al., Pathology, 2016, PMID 27321992), built from tall, columnar,
  // PSEUDOSTRATIFIED epithelium — nuclei at staggered heights within one true layer, not the
  // disordered multi-layer pile-up bladderUC's own frond draws. Cribriform is the second most
  // common pattern (Au et al., Ann Diagn Pathol, 2019, PMID 30772651). Real tumors are admixed:
  // "the vast majority of PDA contained admixed acinar carcinoma, with a median percentage of
  // the ductal component of 50%" (Au 2019) — drawn as a genuine third zone of ordinary discrete
  // acinar glands, the same multi-pattern honesty framing LUAD/prostate-acinar/OCCC already use.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  g.appendChild(el('path', {d:blobPath(400, 250, 420, 275, 0.06, 14, rnd, 0), fill:HE.stroma, opacity:0.3}));
  const fronds = [
    {cx:190, cy:130, rx:150, ry:44, rot:-0.2},
    {cx:150, cy:340, rx:135, ry:40, rot: 0.28},
  ];
  fronds.forEach(f=>drawFrond(g, rnd, f, {
    core:{type:'fibrovascular', length:0.72},
    rimSpacing:9, radialJitter:0.16, nucStyle:'columnar', nucSize:()=>5+rnd()*2,
  }));
  const crib = drawCribriformMass(g, rnd, 460, 180, 110, 92, {lumenCount:11, lumenRMin:10, lumenRMax:16});
  const acinarSpots = [
    {x:660, y:110, r:20}, {x:600, y:190, r:16}, {x:665, y:260, r:22},
    {x:590, y:340, r:17}, {x:670, y:410, r:19},
  ];
  acinarSpots.forEach(s=>drawGlandRing(g, s.x, s.y, s.r, rnd, {nucMin:3, nucMax:4.2}));
  return [
    {key:'papillary',  x:190, y:130},
    {key:'cribriform', x:crib.cx, y:crib.cy+crib.ry+18},
    {key:'admixture',  x:660, y:110},
  ];
}
```

**Coverage across the remaining thirty-two — an ESTIMATE from standard pathology knowledge, not
a citation-verified commitment; every entry still needs its own real source read at authoring
time, the same as every entry so far.** Organized by finding rather than by organ, because the
findings are what generalize:

- **The papillary/frond family serves at least one more entry directly**: kidneys' staged
  papillary RCC (needs one new accessory — foamy macrophage clusters in the papillary cores —
  the same size of addition `radialJitter` was for ductal).
- **A neuroendocrine/small-cell family would serve FIVE staged entries at once, across FOUR
  different organs**: prostate neuroendocrine, bladder neuroendocrine, lungs' SCLC, skin's
  Merkel cell carcinoma, and colon neuroendocrine — small-cell/neuroendocrine morphology
  (nuclear molding, high nuclear:cytoplasmic ratio, "salt and pepper" chromatin) is substantially
  organ-agnostic in real pathology, and this atlas has not yet built it once. This is the single
  best-leveraged NEW family to build, if one more is built before the next batch of entries.
  Thyroid medullary (also neuroendocrine-derived, C-cell) and pancreas' PanNET are RELATED but
  need checking as their own variant — well-differentiated NETs classically show a more nested/
  organoid pattern than small-cell carcinoma's sheet-like one; folding them into the same family
  without checking would repeat this pilot's own "assumes-the-organ-default" mistake at the
  family level instead of the origin-siting level.
- **A squamous family would serve THREE staged entries**: bladder squamous, lungs' SCC, skin's
  SCC — keratinization and intercellular bridges, also not yet built once.
- **A signet-ring family already exists in one generator (gdiff) and would gain a second real
  consumer**: prostate's staged mucinous/signet-ring entry. Worth extracting into a shared
  primitive once this second consumer is real, on the same "don't extract until something needs
  it twice" discipline this pass already followed for frond/cribriform.
- **One cross-organ reuse was NOT anticipated going in, is UNVERIFIED (a pattern-matched
  hypothesis, not a checked equivalence), and is worth flagging as exactly that**: GBM's
  pseudopalisading-rim technique (nuclei stacked radially at a border) draws a shape — a radial
  rim of elongated nuclei against a boundary — that sounds close to skin's staged basal cell
  carcinoma's own textbook "peripheral palisading" description. Whether BCC's real, citable
  palisading is drawn the same way (same radial elongation, same boundary type, same absence of
  the necrotic corridor GBM's rim exists to line) needs a real source read at authoring time, not
  an assumption from the two words sounding alike — the exact discipline the ovary contradiction
  itself was a failure to apply. Recorded here as a candidate worth checking first, not as a
  confirmed reuse. What IS already checked, separately: this atlas's own CLAUDE.md (data rule 19)
  states that
  intestinal-type gastric adenocarcinoma is "similar to intestinal adenocarcinoma... a colon-
  slide repeat" — confirming, from a design decision made before this test existed, that the
  glandular/CRC-style family was already known to transplant across organs.
- **Liver's staged intrahepatic cholangiocarcinoma is a strong PDAC reuse**: both are
  desmoplastic-stroma-dominant ductal adenocarcinomas: PDAC's own haphazard-small-glands-in-
  dominant-stroma technique likely needs only new siting, not new drawing code.
- **A genuinely bespoke minority remains, and one of the six architectural words in the original
  instruction — spindle — has ZERO existing representation in this atlas.** Thyroid's staged
  anaplastic carcinoma is the first candidate: highly pleomorphic, often sarcomatoid/spindle-cell,
  extensively necrotic — closer to GBM's own necrotic/high-grade character than to any glandular
  or papillary family, but needs a genuinely new spindle-cell treatment neither GBM nor any other
  existing generator provides. Testis's staged NSGCT (modeled as one combined entity) is the
  second: a real mix of embryonal carcinoma, yolk sac tumor, and choriocarcinoma components,
  needing its own multi-zone composite in the luad/prostate-acinar/occc tradition — though its
  choriocarcinoma component reuses seminoma's own syncytiotrophoblast accessory directly, already
  built. Breast's three staged molecular subtypes (Luminal A/B, HER2-enriched) raise a DESIGN
  QUESTION rather than a drawing-cost one: these differ from TNBC and each other primarily by
  receptor/IHC status, not necessarily by a distinctly different H&E architecture — the honest
  slide for one or more of them may be "the diagnosis is immunohistochemistry, not morphology,"
  the same register-mismatch shape FTC's own slide is already built around, rather than three
  more visually-distinct family instances forced into existing where the truth is convergence.

**Net answer: yes, and by more than expected.** Two families factor cleanly and generalized to a
real new organ on the first try with zero bespoke drawing code; a third recurring shape (solid
sheets) is too simple to be worth factoring; a fourth (signet-ring) already exists once and will
factor the moment it is needed twice. At least one new family (neuroendocrine/small-cell) is
worth building purely on leverage — it would serve five staged entries across four organs at
once, more than any single family serves today. The bespoke residue is real but small: one
genuinely new architectural mode (spindle/anaplastic) and one genuinely composite entity
(NSGCT) — plus, separately, a real possibility that two or three of breast's staged entries
should be drawn as deliberately similar to TNBC rather than forced into artificial distinctness.
The histology cost report's own worst-case framing ("budget one generator per entry") should be
revised: budget one PER FAMILY the first time a family is needed, and near-zero for every
subsequent entry that family already serves.

## 8. Item 3 — pre-authoring checklist, derived from the pilot's seven hygiene fixes
## (2026-09-11, user-directed)

The pilot's seven citation-hygiene fixes were all real and all caught by the gate chain, which
is the system working — but every one of them is an AUTHORING-CONVENTION error, not a discovery
about the literature, and every one is checkable BEFORE writing rather than only after. Run
through this before writing a new citation, comment, or ccf string into any organ file — the
goal is fewer gate round-trips per entry, not a new gate (none of this is mechanized; it is a
list for the person about to type).

1. **No apostrophe inside a single-quoted string.** Every citation edit writes English prose into
   single-quoted JS literals — possessives, contractions ("it's," "author's"), and quoted titles
   containing an apostrophe will terminate the string early. Reword around it, or use a
   double-quoted string for that one line. A standing, named hazard (CLAUDE.md's own record of a
   real production incident, 4b2c8c5) — this pilot hit it once more anyway.
2. **No bare digit-shaped year inside a descriptive compound term, if a citation earlier in the
   same string already closed with a `)`.** "WHO-2020-based," "post-2015 cohort" — a backward
   paren-shadow scan can mistake the bare year for a second citation's own year once an earlier
   head has already been spent. Reword to drop the embedded year ("WHO-classification" instead of
   "WHO-2020-based") — the exact fix this pilot needed TWICE on the same phrase, once in a `ccf`
   string and again after a later fix reintroduced it into three more.
3. **Name the real first author before writing a bare `"Journal, Year"` citation.** A citation with
   no author token (e.g. "Diagnostics (Basel), 2021") gets its journal name parsed as the author
   surname. Look up the real first author (a PubMed esummary check costs one fetch) before writing
   the citation the first time, not after the crosscheck gate flags it eleven mentions later.
4. **A no-year parenthetical sitting between a citation's head and its real year needs
   pre-registering in the SAME commit, not a follow-up.** "(Basel)," "(WHO)," a journal-city
   qualifier — any NEW instance of this shape needs a `PREREGISTERED` entry in
   `citation_paren_ledger.py` alongside the citation that introduces it.
5. **State an absence or universal claim scoped to a named source, never as a bare assertion.**
   "No X has been reported" or "unlike every other Y in this atlas" reads as a claim about the
   whole world's literature or the whole corpus; name the specific source that didn't report it, or
   the specific population being compared, in the sentence itself.
6. **Compute every fraction from its own two numbers before writing the percentage beside it, and
   write both.** Wherever a source gives a count and a percentage, carry both in the same
   parenthetical (the standing rule from the thyroid NRAS incident, 80f74fc) — this lets
   `fraction_check` catch an arithmetic slip immediately instead of a reformatted-and-still-wrong
   figure surviving to the next read.
7. **Check `citation_head_check.py`'s `WELL_FORMED` tuple before writing a multi-word surname for
   the first time.** A genuine two-word surname ("De Leo," "van Beek," "Di Carlo") is flagged as an
   undeclared head shape unless already declared — declare it in the SAME commit as its first use.

**What this list is not:** a gate. It is unmechanized on purpose — these are authoring habits, not
checkable invariants, and a checklist that has to be read is cheaper than the seventy-five round
trips thirty-two more entries would cost at this pilot's own measured rate (seven fixes across
three entries) if nobody read it. If a future organ's own hygiene-fix rate turns out to still be
high despite this list, that is the signal to mechanize one of these seven into an actual
pre-commit check rather than to write a longer checklist.
