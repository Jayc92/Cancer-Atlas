# Current State

**Written 2026-09-15/16, after the Cervix organ landed.** This file changes on every commit (see
`OPERATING_CONTRACT.md`'s enforcement note) — if you're reading this and it looks stale relative to
`git log`, trust `git log`, not this file, and update this file before you do anything else.

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

## Genuinely unresolved, worth flagging explicitly for whoever picks this up

- **Push and deploy-verify this commit** — the immediate next action once this file itself is
  read, not a background item.
- **Margin/growth/extent for all five Cervix entities are honestly `uncharacterised`/`not yet
  searched`, not `checked and not found`.** This organ's own background research was scoped to
  epidemiology, viral/mutational mechanism, genomics, site model, histology, and prevention — a
  dedicated gross-pathology margin/growth search and a dedicated per-histology SEER Cancer Stat
  Facts extent search were never run. SEER does publish a dedicated "Cervix Uteri" Cancer Stat
  Facts page, but the share-bound rule would forbid using its organ-wide aggregate directly for
  either `cscc` (~69.4% share) or `cadeno` (~26.1% share) regardless, so a dedicated per-histology
  source would be needed either way — a real, open task for whoever picks this up next, not a
  quick aggregate-borrow.
- **File the GitHub Support request to garbage-collect the orphaned objects from the earlier
  security incident's first, leaking push, and purge any cached views.** Still not filed as of
  this commit, per the last several handoffs' own record — check whether it's been done since.
- **Fallopian tube is next, per the user's own explicit sequencing** — and it needs its own
  structural decision BEFORE building it: full entry, below-floor blurb, or a hotspot on an
  existing screen (Ovary's own HGSOC entry already describes tubal origin with no tube to point
  at). Do not start authoring content for it until that decision is made.
- **Oral cavity is explicitly deferred**, not ready to build: its highest-incidence story
  (HPV-positive disease) is actually *oropharyngeal*, and this project's own mesh-availability
  survey found nothing usable for pharynx specifically. Understood and disclosed, not forgotten.
- The blood-cancer / no-organ-to-click navigation question (leukemia, nodal lymphoma) is still
  open — see `CLAUDE.md`'s own Phase C roadmap section.
- The `SMALL-POPULATION INVARIANTS` audit (`RULINGS.md` §3) is worth re-running its own
  enumeration against the current actual organ/entity counts, which have grown substantially since
  it was written.
