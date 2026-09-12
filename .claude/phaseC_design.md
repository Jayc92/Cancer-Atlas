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
