# Current State

**Written 2026-09-15, most of it before the commit described below landed (HEAD was `3f841cd` at
the start of writing) and revised in place as the plan changed mid-write** — see the next section
for exactly what changed and why. This file changes on every commit (see `OPERATING_CONTRACT.md`'s
enforcement note) — if you're reading this and it looks stale relative to `git log`, trust
`git log`, not this file, and update this file before you do anything else.

## A real leak, a scrub, and a force-push — read this section before trusting anything else here

**This package's first attempt at landing had a real personal-data leak in it, caught by the user
after it had already been pushed to `origin/main` once.** `.claude/handoff/MEMORY_history-archive.md`
— the 675KB verbatim narrative archive — contained a full, un-redacted account of an earlier
incident in this project's own history: personal medical documents belonging to a family member of
the repo's owner, found untracked in the working tree at the time. The account named the family
member, quoted the literal filenames of the documents (including their subject matter), and
reproduced the ruling's own prose verbatim. None of that is new information about the *underlying
incident* — this project's own `CLAUDE.md`-adjacent conventions had already handled the incident
correctly the first time (move, never delete; flag, don't act unasked) — the defect was narrating
that incident, in full identifying detail, inside a document meant for a public repository.

**Why the existing machine-path guard didn't catch it:** `battery.py`'s assertion 6 matches
absolute-path shapes (`/Users/<name>/...`, `~<name>`) — it has no concept of a bare filename or a
person's first name with no path component attached, and the leaked content had neither. The path
in that section was itself always tilde-*relative* (`~/Downloads/cancer-atlas-personal-files/`),
which the existing guard explicitly treats as safe. A different class of check was needed, and
didn't exist. **It exists now** — see "The denylist check" below.

**The remedy, exactly as authorized and executed:**
1. `git reset --soft 3f841cd` — HEAD moved back to the last commit before this package existed;
   every file and the full index stayed exactly as they were, so nothing already written was lost.
2. The leaking section was replaced with a version naming the ruling and its lessons without any
   identifying detail, and stating explicitly that the omission is intentional (so a future session
   doesn't "helpfully" restore what was removed). See that section's own text in
   `MEMORY_history-archive.md` for the replacement, written to the letter the user specified.
3. **A full sweep of every handoff file and both memory files** for anything else in the same
   danger class — any other person's name, any email address, any home-relative path, anything
   traceable to the other, unrelated projects that happen to share this machine. Result: one more
   real (much lower-severity) finding — five places where other, unrelated personal projects were
   named by name (as context for otherwise-legitimate technical points: a `launch.json` example, a
   local-directory-layout note, a cross-session compaction credit) — generalized to remove the
   project names while keeping the technical point each one was making. No emails anywhere. No other
   person's name anywhere, with one exception assessed and deliberately left alone: the repo owner's
   own first name appears several times in plain prose as ordinary self-referential attribution —
   judged *lower* risk than what's already permanently public in this repo's own git history, since
   every commit's author field has always carried the repo owner's full legal name and a work email
   address, unaffected by anything this package can fix (it predates `3f841cd`, and this remedy is
   explicitly scoped to not touch history at or before that commit). That comparison is deliberately
   made without repeating the name-plus-email pair itself here — this document is exactly the kind
   of place a search would look first, and the point survives being made in the abstract.
4. **The denylist check.** `.claude/handoff_denylist_check.py` — a new, dedicated instrument scoped
   specifically to `.claude/handoff/*.md`, checking for the family surname, the specific document
   titles from the redacted incident, and a generic email-address pattern. Wired into `battery.py`
   with the same refusal behavior as every other content check: any hit is a hard failure, no
   tolerated-count mechanism, because there is no legitimate reason for any of these strings to
   reappear in this package. Read its own header before assuming it covers more than it does — it
   is a targeted denylist for a known incident, not a general PII scanner, and the broader sweep
   above was a one-time human read, not something this check reproduces automatically.
5. Two other outstanding items folded into the same rebuild rather than stacked in a separate commit
   that would need rebasing anyway once this happened — see "What actually blocked Uterus" below for
   the untracked-corpus-file guard (now built, not just documented) and the `WORK_DIR` worktree-scope
   fix (now applied, not just hypothesized). A new rule, "a newly built guard gets exercised against
   itself before it's trusted," is recorded in `RULINGS.md` §9 with its three instances.
6. Full gate chain re-run on the rebuilt commit(s), then `git push --force-with-lease origin main`
   (lease, not a bare `--force` — an equivalent, slightly safer form of the same authorized
   operation: it still replaces the two leaking commits, and additionally refuses if the remote had
   moved since last checked, rather than overwriting blind). **Scoped to `3f841cd..HEAD` only —
   nothing at or before `3f841cd` was rewritten, touched, or force-pushed.**

**What this remedy does and does not accomplish — say this honestly, every time, to anyone who
asks "is it fixed now":** it changes what any *new* clone, fork, or view of this repository sees,
starting now. **It does not prove nothing was already fetched, cached, or indexed** during the
window the first, leaking push was live on `origin/main` (this session, on the order of minutes).
GitHub's own infrastructure can serve orphaned commit objects by their exact SHA for a period after
a force-push, independent of what the branch tip points to. The only mechanism that actually closes
that residual exposure is asking GitHub Support to garbage-collect the now-unreferenced objects and
purge any cached views — **that request has NOT been filed as of this commit landing.** Whoever
reads this next: check whether it has been filed since, and if not, that is real, disclosed,
outstanding work, not a background nice-to-have.

## This handoff package's own first commit — and why it carries the Uterus organ too

This package, three gate-instrument fixes (`commit_checked.sh`'s new
`.claude/handoff/STATE.md`-staged enforcement, `battery.py`'s new `VERDICT:` line,
`absence_claim_check.py`'s exit-code/printed-count fix), and the complete Uterus organ all landed
in **one** `commit_checked.sh --worktree` commit — check `git log -1` for the real SHA; this file
cannot name it in advance of its own commit. Named files only, never a broad `git add`.

**Why Uterus rode along, when the original plan was to build this package specifically because
Uterus might NOT land cleanly:** two things changed between when that plan was made and when this
commit actually happened, both discovered while building this package, not assumed.

1. **A freshly re-run, correctly-measured, non-truncated `battery.py pre-commit` against the full
   tree — Uterus included — passed clean: exit 0, `VERDICT: PASS (0 problems)`, both previously-
   blocking instruments (`citation_crosscheck`, `citation_paren_ledger`) individually confirmed
   clean inside that same run.** The full account, including the earlier failed diagnosis and the
   `\| tail` exit-code mistake this session caught in itself along the way, is preserved below
   under "What actually blocked Uterus, and what un-blocked it" — read it before assuming this
   project's gate chain is more fragile than it is; the two failures that looked like real content
   defects were not reproducible once measured properly.
2. **Trying to commit the handoff-and-gate-fixes as a narrower slice, deliberately excluding
   Uterus, ran directly into a real entanglement**: `.claude/absence_claim_check.py`'s current
   on-disk `DECLARED` list carries exemption entries for universal claims inside `js/organs/
   uterus.js`'s own prose, added during this session's own citation-verification pass. A worktree
   commit naming only the handoff files plus that one gate file — without `uterus.js` itself —
   left those declarations pointing at content that doesn't exist in that narrower commit's own
   tree, which `absence_claim_check.py`'s own STALE-declaration check correctly flagged as a real
   problem (not a bug in the checker: a declaration with nothing left to declare against genuinely
   is stale). Once measurement (1) above had already shown the full tree was clean, unwinding that
   entanglement to force a narrower commit would have cost more than it bought.

**This is also the first real (non-`--selftest`) commit to pass through the new STATE.md-staged
check** — the mechanism enforcing that this file stays current enforced itself, for real, on the
commit that introduced it.

**The real diagnosis, once it was actually read rather than assumed:** the first worktree attempt
for Uterus alone had ALSO refused (before the two above landed together), on `citation_crosscheck`
and `citation_paren_ledger` — and the cause was neither a race nor a transient. `js/organs/
uterus.js` was **untracked** the entire time it sat in the working tree; both instruments derive
their corpus from `git ls-files` (per this project's own "a ratchet derives from tracked files"
rule), so every prior "clean" standalone verification this session ran directly against the main
tree was silently **never examining Uterus's own citations at all** — `git ls-files` simply
doesn't see an untracked file. The `git add` inside `commit_checked.sh --worktree` was the first
thing that ever actually staged `uterus.js`, and doing so surfaced two real, previously-invisible
issues: a genuinely new, unread parenthetical-citation pattern at `uterus.js:44` (a SEER date
range, "1973–2013," misread as two extra citation years attached to "Matsuo" — read, confirmed
benign, and scored in `citation_paren_ledger.py`'s own `PREREGISTERED` list) and three real
author-metadata mismatches in `citation_crosscheck` (a TCGA/PanCancer consortium-name convention,
a compound-surname truncation, a journal-name-read-as-author artifact — each matching an
already-established benign category elsewhere in the same file's `DECLARED` list, added there
rather than "fixed" in `uterus.js`, since `uterus.js`'s own citations were correct as written).
**The generalizable lesson, worth remembering before trusting any "clean gate" claim about
untracked content again: a verification run against the working tree only ever examines what
`git` can see — stage the file first, or the check is running against less than you think.**

**A separate, smaller bug found and fixed immediately after this commit landed, in its own
follow-up commit:** the handoff-bypass logging this same commit's own `commit_checked.sh` change
introduced had a real path bug — it wrote to the *script-load-time* repo path rather than the
current one, so every `--selftest` scratch-repo arm (none of which ever has a handoff package)
silently appended a "bypassed" entry into the *real* repo's own tracked `refusals.log`, and the
message it wrote was false for that case anyway (no flag was ever passed; the branch fired because
no handoff package exists there). Fixed to a relative path, and to treat "no handoff package in
this tree" as a silent no-op distinct from a genuine, loggable bypass. Check `git log` for whether
this landed as its own commit on top of the one described above.

## The Uterus organ — CLOSED, committed (this commit — check `git log` for the SHA)

Four histologic cancer entities (Endometrioid `uendo`, Serous `usero`, Clear cell `uclear`,
Carcinosarcoma `ucs`), TCGA/ProMisE four-molecular-group classification embedded as trunk-note
prose per an explicit design ruling (not separate cancer entries — matches the GBM/IDH-wildtype-
status precedent for representing a classifier rather than a single gene). Content synthesized
from four parallel background research agents, each independently verified.

**Mesh:** a real HRA asset (`3DPX-020996`, "Uterus, Female"), 10 named sub-meshes, fully
integrated at `assets/uterus.glb` with a thumbnail at `assets/thumbs/uterus.png`. A real Blender
pipeline bug was found and fixed along the way: the glTF import parents sub-meshes to each other,
so naively subtracting a shared bbox center from every object's own *local* `.location` double-
shifts children relative to already-shifted parents, silently changing the union bbox's *size*,
not just its position. Fixed by unparenting every sub-mesh before recentering.

**Wired into every consumer file:** `js/organs/index.js`, `js/morphology.js` (ORIGIN_HOTSPOT,
MARGIN_STATUS/GROWTH_STATUS honestly marked `uncharacterised — not yet searched`, EXTENT_STATUS
marked `uncharacterised` for a *different*, actually-checked reason — the real SEER aggregate was
fetched live but fails the share-bound rule for all four entities), `js/histology.js` (three
entities reuse existing Ovary generators on real, sourced architectural-similarity grounds; the
fourth, Carcinosarcoma, got a genuinely new generator, `genCarcinosarcoma`, combining an existing
gland primitive with an existing spindle-cell-fascicle technique for a real biphasic slide),
`js/trials.js` (all four entities mapped and live-verified — **two real keyword bugs caught and
fixed** before shipping, see `RULINGS.md` §7 and `CLAUDE.md` for the specifics).

**Seven real defects found and fixed by the required independent citation-verification pass**
across the four entities: a fabricated fraction that didn't even arithmetically match its own
attached percentage, a fabricated "TCGA Table 3" citation for a table that paper doesn't contain,
a real misquote (one word changed inside quotation marks), a wrong cohort size cited for the same
paper in two different places in the same file, two scope-drift conflations (a review's own
background-citation quote presented as if it were that review's own synthesized finding), and one
overclaimed source attribution. All fixed at the source; see the file's own inline comments at
each fix site for the full citation trail.

**Two real bugs fixed in the verification tooling itself, both now committed as part of this
project's own permanent infrastructure:**
1. `absence_claim_check.py`'s own exit code could disagree with its own printed "problems" count
   — a real misread trap, now fixed (its printed total and its exit condition are the same
   variable). See `OPERATING_CONTRACT.md`.
2. `battery.py` now prints an explicit final `VERDICT: PASS/FAIL (N problems)` line, so this
   class of misread can't recur project-wide.

### What actually blocked Uterus, and what un-blocked it — kept for the diagnostic method, not because it's still open

Earlier the same day, a worktree-isolated commit attempt for Uterus alone **refused** — the new
`VERDICT:` line caught it immediately, reporting 2 problems inside that fresh worktree's own gate
run: `citation_crosscheck` (exit 1) and `citation_paren_ledger` (exit 3). Both were investigated
before either was fixed (guard/report before repair):

- `citation_paren_ledger`'s 18 "STALE SCORING" problems all referenced spans in organ files this
  Uterus pass never touched (ovary, colon, marrow, skin, lymphnodes, thyroid, liver, lungs) —
  consistent with pre-existing staleness, not a Uterus-caused defect.
- `citation_crosscheck`'s exit 1 could not be reproduced by running the instrument directly
  against the main tree (a clean standalone run showed 681 records, 64 flags, 0 problems, exit 0).
  The leading hypothesis at the time: `battery.py`'s `WORK_DIR` was a *fixed, machine-global* temp
  path, not scoped to the invoking worktree — a concurrent `battery.py`/`extract_citations.py`
  invocation touching that same shared path while a worktree commit's own internal gate run used
  it could race.

**ROOT CAUSE ACTUALLY FOUND, on the real rebuild attempt, not the `WORK_DIR` race after all.**
`js/organs/uterus.js` was **untracked** in the working tree the entire time this session's own
standalone verification runs judged the corpus "clean" — both instruments derive their corpus from
`git ls-files`, which cannot see a file git doesn't know about yet, so every one of those runs was
silently examining a corpus that never included Uterus's own citations at all. The `git add` inside
`commit_checked.sh --worktree` was the first thing that ever actually staged the file, and doing so
surfaced two real, previously-invisible, genuinely-new problems — not a race, not a transient: a
real gap in what every standalone run before it had actually looked at. See RULINGS.md and
CLAUDE.md's own dated entry for exactly what those two problems were and how they were resolved.
**`untracked_corpus_check.py` now exists specifically so this fails loudly at the next organ's own
first citation-check run, instead of a clean report that proves nothing.**

**The `WORK_DIR` race was never confirmed as a real cause of anything — it turned out not to be
the explanation for this specific incident — but it was a real, independent hazard regardless, and
it has been fixed anyway rather than left as a documented-but-unbuilt hypothesis:** `battery.py`'s
`WORK_DIR` is no longer a bare `tempfile.gettempdir()` join shared by every invocation on the
machine; it's now scoped by a hash of `REPO_ROOT`, so a `--worktree` commit's own internal gate run
and any other concurrent invocation (standalone, or from a second worktree) never touch the same
artifact path. Worktree isolation exists to answer exactly this class of problem, and a shared
`WORK_DIR` left it only partial regardless of whether it ever actually caused a failure.

**The Uterus work's own patch-safety copy is now historical, not a live safety net** — since the
content landed for real in this same commit, `~/cancer-atlas-mesh-sources/uterus-patch-safety/`
(outside the repo; see `ENVIRONMENT.md`) is a snapshot of the pre-commit state, not a substitute
for `git log`. Safe to clear out once this commit is confirmed pushed and deploy-verified; not
cleared automatically by anything in this commit.

## Everything else — closed and committed

- **Uterus organ**: closed, committed in this same commit (check `git log -1` for the SHA) — see
  above for the full content/mesh/citation-verification account. **Not yet pushed or
  deploy-verified as of this file's own writing** — if you're reading this after a push happened,
  check whether `deploy_check.js` (the post-push layer) actually ran and passed; if you're reading
  it before a push, that's the very next step.
- **Marrow organ**: closed, committed, pushed, deploy-verified at `126d132`. Ten blood-cancer
  entities on a developmental-origin (non-spatial) trunk axis.
- **`citation_crosscheck`'s 67 flags**: fully resolved under the tolerated-count rule at `5dddb9f`
  (3 real defects fixed, 59 declared-with-reason) — this is also where the fabrication-as-a-
  constant finding (§1 of `RULINGS.md`) was first formally recorded.
- **The 7-stray-file audit**: done at `3f841cd` — moved to `~/cancer-atlas-mesh-sources/`,
  manifest tracked at `.claude/mesh_sources_manifest.md`. `digestive_system__human_anatomy.glb` is
  explicitly flagged there as the current Esophagus candidate (see below).
- **The 26-site mesh-availability survey**: done, reported, nothing yet authored from it beyond
  Uterus itself (see "Open items" below for the reachable list).

## Open items — real, sized, not yet actioned

### The mesh-availability survey's own reachable list (16 sites with a real, ready or near-ready asset)

From the 26-site NCI A-Z survey (see `CLAUDE.md`'s dated entry for the full per-site breakdown):

- **Strong CC-BY, ready to author directly:** Larynx, Oral cavity (unusually rich named
  segmentation), Paranasal sinuses, Thymus, Small intestine, Gallbladder, Bile duct, Cervix
  (same HRA asset family as Uterus — likely the natural next pick), Fallopian tube (L+R, 5 named
  parts each — **note:** authoring this would let Ovary's own existing HGSOC tubal-origin note
  point at a real tube instead of defaulting to the ovary's own surface, a cross-reference this
  session's Uterus pass flagged but deliberately did not action), Vagina, Vulva (the asset for
  this one — `pelvic_organs_from_mri.glb` — is *already sitting untracked at the repo root*, from
  the same audit that resolved the Uterus mesh's own source family), Bone, Eye.
- **CC-BY exists but needs isolating from a larger scene first:** Pituitary gland, Urethra.
- **Confirmed empty after a real search, not under-searched:** Pharynx, Salivary glands, Adrenal
  glands, Parathyroid glands, **Esophagus** (confirmed absent from HRA's own official structure
  inventory — the one candidate asset is `digestive_system__human_anatomy.glb`, sitting at
  `~/cancer-atlas-mesh-sources/` per the stray-file manifest, flagged there explicitly as
  **"DO NOT MOVE, DELETE, OR OTHERWISE LOSE TRACK OF THIS FILE"** — it is the only lead this
  project has for this organ and it has not been evaluated for real usability yet, only
  identified as a candidate), Anus/anal canal, Pleura, Peritoneum, Penis (the deepest search of
  the whole survey — 9 real candidates checked, all wrong-licensed).
- **Not a scan candidate at all:** Soft tissue (sarcomas arise diffusely; recommend Skin's own
  procedural/schematic treatment instead of continuing to search for a mesh).

### Below-floor / not-yet-decided entities

Check `CLAUDE.md`'s own below-floor precedent (data rule 31's worked examples, and the `pmuc`/
`psignet`/`bcc`-class blurb-only schema) before adding a new below-floor entity to any organ —
the schema (name/share/one sourced sentence/trials mapping, nothing else) is established and
should not be re-invented per-organ.

### Genuinely unresolved, worth flagging explicitly for whoever picks this up

- **Push and deploy-verify this commit** — the immediate next action once this file itself is
  read, not a background item. See `OPERATING_CONTRACT.md` on the four-layer gate chain's fourth
  layer (`deploy_check.js`) for why a green commit is not the same claim as a correctly-deployed
  site.
- **File the GitHub Support request to garbage-collect the orphaned objects from the first,
  leaking push and purge any cached views.** This is the one piece of the security remedy that is
  *not* self-contained to this repo and its tooling — someone has to actually go do it. Check
  whether it's been done before assuming the residual exposure window is closed; see the top
  section of this file for exactly what it does and doesn't cover.
- `handoff_denylist_check.py` is a targeted denylist for one known incident's specific strings, not
  a general PII scanner — say so plainly if anyone asks whether the handoff package is now "safe
  by construction." It is safe against a *repeat* of this exact leak; a *different* kind of leak
  still needs a human sweep the way this one got one.
- The blood-cancer / no-organ-to-click navigation question (leukemia, nodal lymphoma) is still
  open — `CLAUDE.md`'s own Phase C roadmap section names this explicitly as a real design
  decision not yet taken, and it is *not* resolved by primary colonic/gastric lymphoma's own
  organ-localized authoring (a corrected note in `CLAUDE.md` explicitly warns against citing that
  as having settled this).
- The `SMALL-POPULATION INVARIANTS` audit (`RULINGS.md` §3) sized several real hazards against a
  ~120-entity target. The corpus is now large enough (organ count and per-organ entity count both
  well past where that audit was written) that re-running its own enumeration against the current
  actual counts is worth doing before the next several organs are added, not after.
