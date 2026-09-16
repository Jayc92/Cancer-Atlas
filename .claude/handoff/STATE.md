# Current State

**Written 2026-09-15/16, after the Cervix organ landed; revised 2026-09-16 in a second, docs-only
commit that captured three things which existed only in conversation and would otherwise have been
lost — see "Docs-only follow-up" below.** This file changes on every commit (see
`OPERATING_CONTRACT.md`'s enforcement note) — if you're reading this and it looks stale relative to
`git log`, trust `git log`, not this file, and update this file before you do anything else. **One
honest caveat about this mechanism, stated because it is easy to over-trust: the gate proves this
file was TOUCHED on every commit, not that what it says is ACCURATE — read it, don't just note that
it changed.**

## The Cervix organ — CLOSED, committed (this commit — check `git log -1` for the SHA)

Five cancer entities on Cervix: Squamous Cell Carcinoma (`cscc`, 69.4%), Adenocarcinoma/usual-type
(`cadeno`, 26.1%), Gastric-Type Adenocarcinoma (`cgas`, ~10% of endocervical adenocarcinoma),
Clear Cell Carcinoma (`cclear`, ~3%), Mesonephric Carcinoma (`cmeso`, under 1%, the rarest entity
on this page, admitted on real clinical distinctiveness per data rule 15's precedent, not incidence).

**A genuinely new kind of trunk-justification, the fifth after CLAUDE.md data rule 5's existing
four (spatial-ubiquity/temporal-earliest/diagnostic-classifier/transformation-defining):** HPV
E6/E7 viral-oncoprotein activity is truncal for `cscc`/`cadeno` because the founding event is not a
human-genome mutation at all — a virus's own oncoproteins directly degrade p53 (E6) and inactivate
Rb (E7). Recorded in CLAUDE.md's own data rule 5 and in a new data rule 38 with the full citation
trail. `cmeso` gets its own `ORIGIN_HOTSPOT_ENTRY` override (Lateral wall — mesonephric duct
remnants, a real, distinct, non-mucosal origin); `cscc`/`cadeno` correctly SHARE one origin hotspot
(transformation zone) — checked directly against the foundational literature (Herfs et al., PNAS,
2012, PMID 22689991, which immunostains BOTH entities for the same squamocolumnar-junction marker
signature at 100% positive) after a live question from the user proposed splitting them, which
turned out NOT to be what the literature supports — see the "A real disconfirmation" section below.

**Mesh:** extracted from the already-integrated `assets/uterus.glb` (three real, individually-named
sub-meshes — `VH_F_cervix`, `VH_F_internal_cervical_os`, `VH_F_external_cervical_os` — survive
Blender extraction with real anatomical names intact), not a new download; no dedicated Cervix 3D
asset exists anywhere in the HRA library or HuBMAP's ASCT+B table (confirmed by direct search, not
assumed). `.claude/citations.json` carries a new `lic-cervix` entry recording this as a derivative
of the already-licensed Uterus asset. Thumbnail rendered via `.claude/render_thumb.py`.

**Wired into every consumer file:** `js/organs/index.js`, `js/morphology.js` (`ORIGIN_HOTSPOT`,
`ORIGIN_HOTSPOT_ENTRY`, and MARGIN_STATUS/GROWTH_STATUS/EXTENT_STATUS honestly marked
`uncharacterised`/`not yet searched` for all five entities — this organ's own background research
was scoped to epidemiology/mechanism/genomics/site model/histology/prevention, not gross pathology
or SEER extent data; **this is the one genuinely open follow-up item for this organ**, flagged
below, not silently deferred), `js/histology.js` (three genuinely new generators —
`genCervixAdeno`, `genGastricType`, `genMesonephric` — plus two real, checked-not-assumed reuses:
`genBlSCC` for `cscc`, `genOCCC` for `cclear`), `js/trials.js` (all five entities mapped and
live-verified against real ClinicalTrials.gov data per the now-required standing rule — a real
cross-entity leak, "Clear Cell Adenocarcinoma of Cervix" wrongly matching `cadeno`'s own filter,
was caught and fixed with an `excludeIf` before shipping).

**Six real citation defects found by the required independent citation-verification pass (data
rule 37), all fixed at the source before this commit — the fourth organ in a row with at least
one, further confirming this is a structural constant of this defect class, not a run of bad
luck:** a pooled vs. entity-specific HPV-positivity figure conflated (Rodríguez-Carunchio et al.);
a paper's own background-literature citation presented as its cohort's result (Kulhan et al.); a
blended-paraphrase quote inside quotation marks that wasn't verbatim anywhere in the source (Dyson
et al.); a real quote misattributed to the wrong paper, traced through the real citation chain to
its correct source (Kojima et al. 2007 → the ISGyP's actual grading guidelines, Talia et al. 2021,
with the real Karamurzin et al. 2015 outcome data behind it); a paper mischaracterized as a
"review" and credited with a gene list its own abstract doesn't contain (Jenkins et al. 2020); an
architectural-pattern list and a histochemistry claim overclaiming primary-source confirmation
beyond what a paywalled paper's own accessible abstract supports (Clement et al. 1995). One
additional item (Lu et al. 2021's STK11-prognosis p-value) could not be independently re-confirmed
because the paper is fully paywalled with no OA copy anywhere — left as-is, since unreachable is
not the same claim as wrong (this project's own established "unverifiable-by-access" outcome
state), disclosed rather than silently assumed sound. Full trail in `js/organs/cervix.js`'s own
inline `CORRECTED 2026-09-15` comments and in CLAUDE.md's new data rule 38.

**A real disconfirmation worth recording, not just the fix:** partway through this pass, a message
proposed that usual-type adenocarcinoma (`cadeno`) should get its own distinct origin site
("further up the canal from endocervical glandular epithelium") rather than sharing the
transformation zone with `cscc`. A dedicated research check into the foundational literature
(Herfs et al., PNAS, 2012, PMID 22689991 — the paper Yang et al. 2015's own SCJ-cell-population
finding builds on) found the opposite: direct immunostaining of both adenocarcinoma in situ and
invasive adenocarcinoma for the same squamocolumnar-junction marker signature used for SCC came
back 100% positive in both, independently corroborated by three older reserve-cell papers
(Christopherson 1979's own verbatim title-level claim: "squamous cell carcinoma, adenocarcinoma,
and mixed adenosquamous cell carcinoma of the uterine cervix all have a common cell of origin, the
subcolumnar reserve cell"). The proposed change was NOT implemented — the existing shared-origin
wiring was correct — and this was reported back rather than silently actioned, matching this
project's own standing discipline that a plausible-sounding suggestion still gets checked against
primary sources before being implemented, from either direction.

**Battery.py gained a `--fast` mode** (user-requested, mid-pass, after three full ~15-30-minute
battery runs in one authoring round): skips only `regress` (the browser suite), for the
fix-iterate loop specifically. Safe by construction, not convention — `commit_checked.sh` hardcodes
`python3 .claude/battery.py pre-commit` with no flag, so a fast run can never be mistaken for or
substitute the real commit gate. Loud, not silent: prints a banner and folds "(FAST MODE)" into its
own DONE line so a fast run's smaller "N/M ran" count is never mistaken for a partial failure.
Measured live: a real `--fast` run against this organ's own final citation-fix round completed in
49.9 seconds against the full run's 15-30 minutes. Documented in CLAUDE.md's own BATTERY RUNNER
section.

**Full gate chain, run for real, multiple times across this pass's own iterate-and-fix cycles —
final full run (regress included) came back `VERDICT: PASS (0 problems)`.** Live-verified end to
end in the browser afterward, not just gated: organ screen (mesh, hotspots, facts, the prevention
narrative), all five cancer entities' site maps and cell-level mutation panels (confirming the
corrected citations actually render), the histology view for `cscc`, and a live ClinicalTrials.gov
fetch for `cscc` returning real, correctly-filtered results.

## Docs-only follow-up (2026-09-16, same day, second commit — check `git log -2` for both SHAs)

Three things surfaced in conversation after the Cervix commit above landed, none of which had
reached any file yet. Captured here rather than left to erode with the session that produced them:

1. **Fallopian Tube ruled: full organ screen — not below-floor, not a hotspot bolted onto an
   existing screen.** Recorded in full, with the reasoning (NOT tubal carcinoma's own incidence —
   the real basis is that Ovary's own HGSOC entry cites a tubal origin with nowhere to point it),
   in `.claude/phaseC_design.md` §18. STIC is ruled OUT as its own cancer entity — this atlas's own
   `EXTENT_STATUS`/`GROWTH_STATUS`/site-model/trials axes all presuppose invasive disease, and an
   intraepithelial lesion forced into them would leave every axis empty or invented; STIC becomes
   organ-level prose on a fimbria hotspot instead. Opportunistic salpingectomy is a real, scoped
   prevention-content requirement for the eventual authoring pass, held to Cervix's own standard —
   not yet sourced or drafted. `phaseC_design.md` §9 gained a THIRD registry kind, cross-organ
   origin (after spatial-within-organ and developmental/non-spatial): Ovary's HGSOC is the worked
   example, and the fix needs bidirectional linkage (Fallopian Tube's own fimbria hotspot naming
   `hgsoc` by id; Ovary's own existing tubal-origin note revisited to point back once the tube
   exists) — checked directly against the schema before assuming a new mechanism was needed; none
   was. **Still not built** — this is the structural decision, not the organ. Do not start
   authoring Fallopian Tube's actual content without reading `phaseC_design.md` §18 first.
2. **The cervix origin error, recorded in `RULINGS.md`'s own new section.** Mid-Cervix-pass, a
   message asserted usual-type adenocarcinoma originates further up the endocervical canal than
   SCC, treating the *descriptive* name "endocervical adenocarcinoma" (location and resemblance) as
   an *origin* claim. Checked against primary literature before implementing — Herfs et al. 2012
   immunostains both entities positive for the same SCJ signature, corroborated by three older
   sources on the shared subcolumnar reserve cell — and the suggested change was never made. Filed
   under the same location-vs-origin register conflation this project already catches elsewhere,
   and named explicitly as a *reviewer* error caught by the implementer — the two-role structure
   most often described running the other direction.
3. **The Cervix margin/growth/extent debt is now DATED, not left as a bare "not yet searched."**
   All five entities across all three axes converted from `status: 'uncharacterised'` (this file's
   own convention for a CHECKED negative that says what was read — which "not yet searched" is
   not) to `status: 'unread'` with `until: '2026-10-01'`. `EXTENT_STATUSES` was widened to admit
   `'unread'` for the first time, since it previously only had `['uncharacterised', 'cited']` —
   `reserve_check.js`'s own generic date-audit loop already iterated over the extent axis looking
   for exactly this, so the fix is catching the schema up to a check that was already running, not
   building a new one. Per `CLAUDE.md`'s own "THE REGISTER FINDING," expect roughly a third of
   these fifteen rows to resolve to "searched and unavailable" by the due date — a real, legitimate
   end state, not a failure to close the debt.

## Genuinely unresolved, worth flagging explicitly for whoever picks this up

- **Push and deploy-verify this docs-only commit** too — the immediate next action once this file
  itself is read, not a background item.
- **Fifteen Cervix margin/growth/extent reads are owed by 2026-10-01** (see above) — check
  `js/morphology.js`'s own `MARGIN_STATUS`/`GROWTH_STATUS`/`EXTENT_STATUS` tables for the exact
  `cscc`/`cadeno`/`cgas`/`cclear`/`cmeso` rows before that date passes; `reserve_check.js` will mark
  them overdue on its own, but this is disclosed here so nobody has to wait for the gate to notice.
- **Fallopian Tube's structural decision is now settled (see above) — the next action is authoring
  it**, starting from `phaseC_design.md` §18's own scope (mesh sourcing, the fimbria hotspot and
  its bidirectional link back to Ovary's HGSOC entry, the opportunistic-salpingectomy prevention
  citations, and the STIC-as-prose treatment), not re-litigating the shape.
- **File the GitHub Support request to garbage-collect the orphaned objects from the earlier
  security incident's first, leaking push, and purge any cached views.** Still not filed as of
  this commit, per the last several handoffs' own record — check whether it's been done since.
- **Oral cavity is explicitly deferred**, not ready to build: its highest-incidence story
  (HPV-positive disease) is actually *oropharyngeal*, and this project's own mesh-availability
  survey found nothing usable for pharynx specifically. Understood and disclosed, not forgotten.
- The blood-cancer / no-organ-to-click navigation question (leukemia, nodal lymphoma) is still
  open — see `CLAUDE.md`'s own Phase C roadmap section.
- The `SMALL-POPULATION INVARIANTS` audit (`RULINGS.md` §3) is worth re-running its own
  enumeration against the current actual organ/entity counts, which have grown substantially since
  it was written.
