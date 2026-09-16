# Ruling Ledger

This is not a duplicate of `CLAUDE.md`'s own data rules — those are about *content*: which gene,
which citation, which site model. This is about *method*: the recurring structural findings this
project has made about how to build and trust its own verification machinery, the specific
incidents that produced each one, and — deliberately — the wrong calls alongside the right ones.
A session that doesn't know which instincts have already failed here will spend time re-failing
them. Every finding below is cross-referenced to its fuller record in `CLAUDE.md` (search for the
quoted phrase) for the complete incident, sources, and numbers.

## 1. Fabrication is a defect class distinct from drift, and nothing mechanical reaches it

**The finding.** Every other citation defect this project has found — misquoting, scope drift,
denominator transplants, certainty drift — shares one shape: a real number or claim, used wrong,
with a true value sitting *nearby* (in the same source, an adjacent sentence, the paper's abstract
vs. its Results). Every mechanical check this project has ever built works by comparing a claim
against that neighborhood. **Fabrication has no neighborhood.** A fabricated claim is generated
because it sounds right for the argument being made, not transcribed-then-altered from something
real — which means there is no true value nearby for any check to compare against.

**Why it's dangerous specifically:** a fabricated figure lands in the *correct neighborhood* for
a real phenomenon, which is exactly why every mechanical check passes it. Ph-positive B-ALL
genuinely runs ~25% of adult disease, so a fabricated "31%" reads as entirely plausible and
triggers nothing. Only reading the source's own actual sentences, with no stake in the number
already being right, catches it.

**The record, now at four confirmed instances, one per organ pass checked:** IPMN (pancreas),
Lymph Nodes (a misattributed Burkitt/Schmitz quote), Marrow (an ALL/BCR-ABL1 figure attributed to
a paper that never states it), and Uterus (a fabricated fraction "26/75" that doesn't even
arithmetically match its own attached percentage, plus a fabricated "TCGA Table 3" citation for a
table that paper doesn't contain — see `CLAUDE.md`'s own dated entries and this package's
`STATE.md` for the Uterus specifics). **Treat this as a structural fact to budget for, not a
current observation that might improve**: every future organ pass should assume the required
independent citation-verification pass (see `OPERATING_CONTRACT.md`) WILL find at least one.

Search `CLAUDE.md` for "FABRICATION IS A DEFECT CLASS DISTINCT FROM DRIFT" for the full mechanism
write-up and every instance's specifics.

## 2. Count vs. identity — a population number is not the same claim as a per-item check

**The finding.** Verifying that a population has the *right size* (N markers exist, N checks ran,
N records extracted) is a completely different claim from verifying each *item* in that
population is *correct*. A system can pass every count check while every individual item is wrong
in a way the count could never see.

**The sharpest instance:** a body-marker regression asserted 15/16 markers were visible and their
pairwise minimum distances matched expectations — and it was green while one marker sat on the
wrong body part entirely (Testis, rendered on a thigh instead of the pelvis), because the body
mesh is a *closed* surface, so an inward raycast always hits *something* and the miss-logging
never fires. The check was verifying markers *resolve*, never that they resolve *correctly* — a
range-check standing in for an identity-check. On a medical atlas, an organ marker on the wrong
body part is the same severity class as a wrong figure: something a reader carries away as fact.

**The fix pattern, generalized:** whenever a check counts or ranges something, ask separately
whether anything checks that each individual item is the *right* item, not just that the *right
number* of items exist. This session's own instance of applying this discipline: verifying the
Uterus organ's hotspot picks weren't just "4 real vertices exist" but that each specific vertex
sat on the *correct* named sub-mesh at the *correct* anatomical location — caught two real
misplacements (Myometrium landing next to Cornua, Cervix landing at the isthmus boundary instead
of the visible cervical bulb) that a bare "4 hotspots present" check would have missed entirely.

Search `CLAUDE.md` for "BODY MARKERS RESOLVED, BUT NOT CORRECTLY" for the full incident.

## 3. Accidental invariants — properties that held by population-size accident, not by design

**The finding, as a named family with (as of this project's own count) four confirmed members:**
a property can hold in every case seen so far, get silently relied on, and stay invisible until a
case violates it — not because anyone verified it holds, but because the population was small
enough, or shaped a particular way, that it never got tested.

The four: **(1) cwd-always-pinned** — every gate instrument ran from the repo root for so long
that nothing noticed every instrument used relative paths, until a run from elsewhere produced
false failures and false-green vacuous passes. **(2) closed-mesh-always-resolves** — see finding
2 above. **(3) one-paper-per-author-year** — a citation extractor assumed one author+year string
names one paper, until a record was found silently carrying two different journals in one field
because the underlying prose cited two different papers by the same author in the same year. **(4)
check-validated-by-defect** — a self-test's own positive control was a real defect already
sitting in the corpus rather than a synthetic fixture, which meant the check's validity was
*coupled* to the corpus staying broken — it would have gone silently quiet, not loudly failing,
the moment the project got healthier and the defect got fixed.

**The generalizable question, worth asking about any check inherited from an earlier pass:** what
population size or shape is this check *implicitly* assuming, and what happens the first time
that assumption breaks? A batch audit specifically for this family ("SMALL-POPULATION
INVARIANTS") is in `CLAUDE.md` and is worth rereading before this project's organ count grows much
further past its current size — several enumerated risks there (one-shared-origin-hotspot-per-
organ, one-shared-margin-category-badge-per-category, mass-stacking-by-count) were sized as real
hazards at a target of ~120 entries and should be re-checked against the actual current count.

Search `CLAUDE.md` for "CHECK-VALIDATED-BY-DEFECT" and "SMALL-POPULATION INVARIANTS."

## 4. Tolerated-count laundering — a stable non-zero number reads as health, and that's backwards

**The finding.** A regression suite that has said "2 known failures" on every single run for
weeks reads, to any human skimming it, as a *stable, understood, accepted* state — indistinguishable
from actual health. But a bare number that nobody has *individually read and classified* is
exactly the shape a real defect hides inside: if someone had actually read it and found it benign,
they would have *declared* it as such with a reason. An undeclared count is evidence of an
*unread* count, not a checked-and-accepted one.

**The fix, now load-bearing across most of this project's own instruments:** every tolerated
non-zero count resolves to exactly one of three states — fixed, declared-with-reason (naming the
real mechanism), or dated-for-re-read (an actual date by which someone re-checks). The shared
mechanism is `.claude/tolerated.py`'s `resolve(name, flags, declared)`. **This was directly
confirmed as a real, not theoretical, risk twice in this project's own history**: a stable "2
known label-overlap failures" and a stable "3 citation-crosscheck flags" both turned out, on an
actual individual read, to contain real, previously-uncaught defects that had been sitting there
under a green gate for days.

Search `CLAUDE.md` for "A TOLERATED COUNT LAUNDERS A DEFECT INTO A CONSTANT" and "AN UNDECLARED
COUNT IS EVIDENCE OF AN UNREAD COUNT."

## 5. Guard-before-repair — write the checker first, let its output be the worklist

**The finding.** Building a checker *after* a hand-cleanup pass means the checker can only ever
be demonstrated against a corpus someone has already made clean — which proves nothing about
whether the checker actually works, since a corpus with zero real defects left in it can't
distinguish a working checker from a checker that fires on nothing. The right order: **write the
guard first, run it against the live, uncleaned corpus, and let its raw output become the
worklist** — the repair pass then has something real to fix, and the guard is proven capable of
finding something before anyone starts trusting its silence.

**Concrete instance in this project's history:** a census of hand-typed `file:line` pointers into
citation records found ~580 of them, most stale (pointing at the wrong line after a later edit
moved the referenced content). The temptation was to fix them by hand immediately. The actual
ruling: build the pointer-staleness *checker* first, run it against the corpus exactly as it
stood (stale pointers and all), and only then repair — because repairing by hand first would have
produced a "clean" state the checker's own first real demonstration would then have nothing to
prove itself against.

Search `CLAUDE.md` for "THE GUARD CAME BEFORE THE REPAIR" for the full pointer-census incident.

## 6. Derive every population from what's actually tracked, never from a filesystem glob

**The finding.** A ratcheted count (one that's allowed to grow but never silently shrink) is only
meaningful if it's derived from the same population that actually ships — and `git`'s own index
is the one source of truth for that population, not a directory listing. A `glob.glob()` over a
directory sees every file physically present on disk, including untracked drafts, personal
scratch files, or anything else that happens to be sitting in the working tree at that moment —
none of which will exist in a fresh clone.

**The concrete incident:** while a checker script was still an untracked draft sitting in
`.claude/`, a *different*, glob-based instrument counted it as part of the live corpus and moved
its own ratcheted floor up to a value a fresh checkout could never reach — meaning the very next
person to clone the repo would see a spurious ratchet failure with no real defect behind it,
through no fault of their own. The fix, applied everywhere a ratchet depends on a corpus size:
derive the corpus from `git`'s own tracked-file listing (the index), not a directory glob.

Search `CLAUDE.md` for "A RATCHET DERIVES FROM TRACKED FILES" for the fuller record and the
declared exceptions (a few instruments deliberately keep glob-based population counts, for
reasons stated explicitly at each site — check before "fixing" one that isn't actually broken).

## 7. This session's own real misreads, recorded because they're the freshest and most instructive

**The exit-code misread that produced the `VERDICT:` line fix.** `absence_claim_check.py`'s own
DONE line ended with "...0 tolerated-count problems" while the process's real exit code was 1,
because a *different* defect class in the same instrument (an unscoped absence claim, a genuinely
new fabrication-adjacent finding in the Uterus content) drove the exit and was never folded into
that trailing number. The number that looked like "the" verdict, positioned exactly where every
other instrument's real total sits, was only part of one. Fixed two ways: `battery.py` now prints
an explicit, final `VERDICT: PASS/FAIL (N problems)` line as the literal last thing it emits, and
`absence_claim_check.py`'s own summary was rewritten so its printed number and its exit condition
are the same variable, not two numbers a reader has to reconcile. See `OPERATING_CONTRACT.md`'s
own section on this — it is the single most recent instance of finding 4 above (accidental
invariants), just inside one script's own I/O contract rather than across a project-wide corpus.

**The battery-run timing trap.** Editing content files while a long-running battery pass is still
executing produces results that test a mid-edit, inconsistent snapshot of the tree — a battery run
started, then interrupted by further edits mid-flight, reported a stale "1 problem" that had
already been fixed by the time the run's own slow instruments (regress.js's browser pass takes
15-20 minutes) got around to checking it. The fix is procedural, not code: once a full gate run is
started, stop editing until it reports, or accept that its result describes a tree that no longer
exists by the time you read it.

**The double-backgrounding mistake** (from earlier in this project's history, recorded here
because a fresh session will make it again otherwise): running a shell command with both a
trailing `&` *and* the harness's own `run_in_background: true` causes the harness to track only
the trivial wrapper process while the real work detaches, unmonitored, with no way to learn when
it actually finishes. Use one or the other, never both — a `while kill -0 <pid>; do sleep N; done`
wait-loop with `run_in_background: true` alone is the reliable pattern.

**A near-miss, caught before it became a mistake:** mid-task, a stray untracked file
(`pelvic_organs_from_mri.glb`) was moved out of the repo root along with several genuinely stray
files — but that specific file had *already* been identified, in an earlier pass, as the resolved
asset for a different, not-yet-authored organ (Vulva). Re-reading the user's own prior wording
("seven remaining stray files," and this one had already been called out as resolved) caught the
mistake before committing it, and the file was moved back. The general lesson: before acting on a
"clean up N stray things" instruction, check whether any of the N have already been individually
resolved by an earlier finding in the same project — a bulk action can silently undo a specific
one.

## 8. Predictions that were pre-registered and then falsified — kept because the falsification
taught something real

This project's citation-verification work has repeatedly pre-registered a specific, falsifiable
prediction *before* running the check that would confirm or refute it — and several of the most
useful findings came specifically from being *wrong*, in a stated direction, about the result.

- **Predicted:** hedged prose (writing that already carries a caveat like "suggests" or "in this
  cohort") should show *less* certainty-drift than unhedged prose, because a hedge marks epistemic
  caution already applied at write time. **Result:** a matched-batch comparison found the
  hedge/no-hedge distinction didn't predict where the defect lived at all — what predicted it was
  a *different* variable entirely (whether the defect sat in the citation's own record vs. in its
  surrounding provenance comment), discovered only because the pre-registered hypothesis failed
  cleanly enough to force asking what the *real* variable was.
- **Predicted, before a gltfpack compression pass:** file size or triangle count would be a
  sufficient proxy for "did this compression setting preserve visual quality." **Result:** false —
  a setting that passed on both proxies produced visible normal-map banding on a real,
  raw-vs-compressed image comparison at the viewer's actual zoom level. The generalized rule this
  produced ("the gate is the rule, the value is not") is now load-bearing for every later organ's
  own compression pass.
- **Predicted, repeatedly, across several asset-hunting passes:** a specific mechanism would be
  the cause of a rendering artifact (a suspected lighting bug, a suspected UV-mapping issue).
  **Result, more than once:** the prediction was wrong about *where*, even when right that
  *something* real was there — a "possible hole" in a mesh turned out to be a segmentation-label
  material coincidence (Uterus, this session); a suspected shading bug turned out to be stale
  browser-cached JavaScript, not the code at all (an earlier organ pass). The generalizable
  takeaway recorded across these: predicting wrong about *where* a real thing lives is common
  enough that the check should always confirm the *specific* mechanism, not just that a plausible-
  sounding one exists.

The pattern across all three: **a wrong prediction, made on the record before the test ran, is
worth more than a vague "let's see" — it forces the actual variable to surface once the prediction
fails**, and it's a large part of why this ledger exists at all rather than just a list of correct
calls.

## 9. A newly built guard gets exercised against itself before it's trusted

**The finding, stated as a rule after its third confirmed instance (2026-09-15).** A check's own
failure mode is not "it correctly finds nothing" — it's firing wrongly, or writing somewhere it
shouldn't, and both of those are invisible exactly as long as nobody looks for them on purpose. A
guard built to enforce discipline is not exempt from needing the same discipline applied to it; if
anything it needs it more, because a broken guard is *trusted* the moment it ships, which is
precisely the state a broken check is most dangerous in.

**Three instances, same shape, three different mechanisms:**

1. **The coupling audit's own positive control.** An audit built to find self-tests whose only
   "known positive" was a live defect already sitting in the corpus (rather than a synthetic
   fixture) — the exact coupling this project calls out under "CHECK-VALIDATED-BY-DEFECT" — was
   itself, on its first version, checked only by phrase-matching inside `selftest()` function
   bodies. A disguised fixture (a live-corpus-coupled `sys.exit` outside any `selftest()`, with no
   suspicious phrasing) was planted specifically to test the audit's own reach, and the ORIGINAL
   narrow method missed it — exactly as predicted before the test ran. Broadened to a one-hop
   data-flow detector, re-run, and only then trusted.
2. **The regress navigation guard.** A newly built check inside this project's own browser-based
   regression suite had the same shape: a guard meant to verify something real about navigation
   was not itself exercised against a case designed to break it before being relied on, and the
   gap was found the same way the other two were — by someone deliberately trying to make the new
   guard fail, rather than by trusting its first clean run.
3. **The handoff-bypass log, this session.** `commit_checked.sh`'s own new STATE.md-staged
   enforcement shipped with a bypass-logging path that silently wrote into the *real* repo's
   tracked `refusals.log` on every single `--selftest` scratch-repo arm — a guard built specifically
   to keep this project's own discipline enforced, polluting the one file that exists to be an
   honest, append-only record, on its very first day. Found only because the working tree was
   diffed against a commit made right after a `--selftest` run, not because the mechanism was
   deliberately tested against its own selftest context before being trusted.

**The generalizable form, applied going forward:** before treating a newly built guard's first
clean run as evidence it works, ask what it would take to make it fire wrongly, or write somewhere
it shouldn't — and then actually try that, the same way condition (7) already requires every
zero-reporting check to be shown capable of reporting non-zero. A guard's own `--selftest` (if it
has one) is not automatically this: as instance 3 shows, a selftest can run a mechanism cleanly on
its own terms while that same mechanism corrupts state *outside* what the selftest itself checks.
The question is not "does the guard's own test suite pass" but "what does this guard touch that
its own test suite doesn't look at."

## 10. A descriptive name is not an origin claim — caught by checking before building, by the
## reviewer this time, not the implementer (2026-09-16)

**The error.** Mid-way through authoring Cervix, a message asserted that usual-type (HPV-
associated) endocervical adenocarcinoma originates further up the endocervical canal — from
endocervical glandular epithelium specifically — rather than sharing the transformation zone with
squamous cell carcinoma. The reasoning read the entity's own descriptive name, "endocervical
adenocarcinoma," as if it were an origin claim: *endocervical* names WHERE THE TUMOR IS FOUND and
WHAT IT RESEMBLES (glandular, columnar architecture, consistent with the endocervix's own lining),
which is a real and correct thing for a histologic name to encode — it is a different claim from
WHERE THE FOUNDING TRANSFORMATION EVENT ACTUALLY OCCURRED, which is what this atlas's own
`ORIGIN_HOTSPOT` mechanism exists to anchor. The two can point at different places for a real
tumor (a cancer's cells can migrate, differentiate, and come to occupy tissue some distance from
where the first oncogenic event actually happened), so the substitution is never automatically
safe, and here it was checked and found wrong: Herfs et al. (*PNAS*, 2012, PMID 22689991) directly
immunostains both squamous cell carcinoma AND adenocarcinoma (in situ and invasive) for the same
squamocolumnar-junction marker signature, 100% positive in both — independently corroborated by
three older reserve-cell papers, including Christopherson et al.'s own 1979 verbatim finding that
squamous, glandular, and mixed cervical carcinoma all share one cell of origin. The two entities'
real, checked origin IS the same site. The suggested split was never implemented.

**The class this belongs to.** This is the SAME location-versus-origin register conflation this
project has already caught repeatedly in other directions — the gross-versus-histologic register
mismatch (data rule 20 and elsewhere), detection-framing versus biological behavior (the extent
axis's own "found at diagnosis" discipline), enrollment criteria versus true origin (Phase D's
trials duty-of-care). All of those were caught in claims ABOUT to be written into content. This one
is the same conflation arriving as a proposed EDIT to a claim already correctly made — a subtler
presentation, because the existing content (`cscc`/`cadeno` sharing one origin hotspot) was already
right, and the failure mode was almost overwriting a correct answer with a plausible-sounding wrong
one, not authoring a wrong one from scratch.

**Why this entry exists in THIS file and not just in a session record: the direction the catch ran.**
Every other instance in this project's history of "a suggestion sounded right and turned out not to
survive a primary-source check" has the person building the content catching their OWN assumption
before it shipped. Here the roles were reversed: the REVIEWER proposed the change, and the
IMPLEMENTER checked it against Herfs et al. and three corroborating sources before touching any
code, then reported back that the literature didn't support it rather than making the edit. The
two-role structure of this project — one party proposing or reviewing, another building — is almost
always described running the other direction (an implementer's shortcut caught by a reviewer's
read). It runs both ways. **Treat a plausible-sounding correction with the same discipline as a
plausible-sounding first draft: check it against the primary source before implementing it, from
whichever direction it arrives.**
