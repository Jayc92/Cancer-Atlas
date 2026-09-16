# Operating Contract

The rules in this document are not suggestions. They were each earned by a real incident — most
are documented at greater length in `CLAUDE.md` itself (search for the bolded phrase quoted
alongside each rule below) or in `RULINGS.md`. This document exists so a fresh session can act on
them immediately without first re-deriving why they matter.

## The four-layer gate chain, and what each layer proves

Four layers, each answering a question the others cannot:

1. **`run_checked.sh`** wraps a single instrument invocation. It requires the tool's own `DONE`
   marker to appear (matched by form — `^DONE ` or `^==== DONE`, never by a hand-passed string),
   and fails the invocation if it's absent even when the exit code is 0. This is the layer that
   catches a *vacuous* run — a tool that exits clean because it never actually asserted anything.
2. **`battery.py <phase>`** runs every declared instrument for a phase (`pre-commit` or
   `post-push`), asserts every one of them ran and reported, and separately asserts that every
   tracked file under `.claude/` is declared as either an instrument or an explicit
   non-instrument with a reason. Its own final line is now an explicit, unambiguous verdict —
   see "Read the VERDICT line, not a per-instrument zero" below.
3. **`commit_checked.sh`** wraps the commit itself. It runs the gate, and only writes the commit
   message from the gate's own real output (the quoted `DONE`/`==== DONE` lines), so a commit
   message's numbers can never drift from what actually ran. It also refuses if the working tree
   has any tracked-but-unstaged change outside a small set of known machine-written files
   (`record_count.json`, `reach_unreached.json`, `refusals.log`) — the discipline of gating the
   tree you are about to commit, not the tree you happened to have on disk a few minutes earlier.
4. **`deploy_check.js`** runs *after* push, against the live, deployed GitHub Pages site — not the
   repo, not HEAD, the actual bytes a real visitor's browser would fetch. This is the only layer
   that can catch "pushed but not published," a stale CDN cache, or a build that parses locally
   but throws on load in production. It found exactly this once (commit `4b2c8c5`): the other
   three layers were green while the live site served a syntax-error page.

**The chain stops at four layers deliberately.** Adding a fifth would need its own guard, and the
recursion only ever bottoms out at a human running one command. See `CLAUDE.md`, "WHY THE CHAIN
STOPS AT FOUR."

### Read the VERDICT line, not a per-instrument zero

`battery.py`'s own DONE line ends with a real, reliable `N problems` count — but a per-instrument
member can *also* print its own "0 problems" for a narrower, internal sub-metric while a
different mechanism in that same member is what's actually driving its exit code. This happened
for real in this session: `absence_claim_check.py` printed "...0 tolerated-count problems" while
exiting 1, because a separate defect class (an unscoped absence claim) drove the exit and wasn't
folded into that trailing number. **`battery.py` now prints a final, separate, unambiguous
line as the literal last thing it prints:**

```
VERDICT: PASS (0 problems)
```
or
```
VERDICT: FAIL (1 problem)
```

Read that line. Do not infer the verdict from scrolling past a member's own internal counts —
even a genuinely well-intentioned member can have a real gap between what it prints and what it
exits on, and finding that gap by reading code is slower than trusting the one line built to be
unambiguous. If you ever find another instrument with this same shape (a printed count that
doesn't equal what its own `sys.exit()` actually checks), fix it the same way: make the printed
number and the exit condition the same variable, not two numbers a reader has to reconcile.

## Worktree-isolated commits, and why

`commit_checked.sh --worktree` creates a real, separate `git worktree` (its own index, its own
checked-out files), copies the caller-named files' *current on-disk content* into it, runs the
entire gate-and-commit machinery there, then lands the result on the real branch via
`git reset --mixed <new-sha>` — never `git merge --ff-only`, which was tried and measured to fail
for a structural reason (merge's safety check refuses whenever the main tree has any local
modification to a file the incoming commit touches, even when that modification is
byte-identical, because the files came from the same working tree in the first place).

Why isolate at all: a concurrent session's own gate run can `git stash` the shared working
directory mid-task, or stage unrelated content into the shared index, while your own uncommitted
work sits in the same tree. This actually happened in this session (see `RULINGS.md`). The
worktree path is the fix — it commits exactly the named files' current bytes, nothing a
concurrent process staged, and nothing implicit.

**Invocation:** `commit_checked.sh --worktree "<subject>" "<marker>" "<space-separated files>"
<gate command...>`

## One-use push grants

Pushing to `origin/main` is not standing authorization from one approval. Each push needs its own
explicit go-ahead in the conversation. A user approving one push does not mean every subsequent
push in the same or a later session is pre-approved — ask again, every time, even if the last
five pushes all went fine.

## The two required verification practices

Both of these are **REQUIRED, not practiced** — meaning: not something to reach for when a
citation or a trials mapping *feels* uncertain. Every organ pass that has skipped either one has
shipped a real defect that only that specific pass would have caught.

### 1. Live-run every trials mapping before considering it done

A `TRIALS_CONDITION_MAP` entry is verified by *running* it against the real ClinicalTrials.gov
API, never by reading the keyword list and judging it correct by eye. **Four real keyword bugs
found across this project's history, all four found by running the live query and reading its
real results, zero found by reading the list.** Before any entry is done:

1. Run `.claude/trials_mapping_check.mjs <id>` — its `requireAlso`/`excludeIf` positive controls,
   corpus-vocabulary signal, and negation-collision signal all make real, live network calls.
2. Separately, live-sample at least 10 real results in the browser (the app's own trials toggle)
   and read every kept and dropped condition string by hand.

The mechanized check does not replace the browser sample — they answer different questions (does
this mechanism's contract hold, vs. does the real end-to-end pipeline a reader will actually see
produce the right list). See `CLAUDE.md`'s data rule 36 for the full record, and `RULINGS.md` for
the two bugs this exact discipline caught in the Uterus organ pass.

### 2. Independent citation-verification pass before every commit

**Fabrication is a confirmed constant in this project, not a rate that might improve: every
organ pass this required pass has been run on has found at least one real, previously-unnoticed
defect** — and the failure mode is specifically the one no mechanical check can reach. A
fabricated or drifted claim lands in the *right neighborhood* for a real phenomenon — a plausible
number, a real paper on the right topic, a citation that resolves cleanly — which is exactly why
`fraction_check`, `citation_crosscheck`, `duplicate_figure_check`, and every other mechanical
check pass it. Only independently opening the real source and checking whether it actually
supports the *specific* claim attributed to it catches this class.

**Why this is the primary defence, not a final check:** every other layer in the gate chain
verifies internal consistency (does a claim agree with itself, with its own metadata, with an
adjacent record). None of them can tell you whether the source actually says what the atlas
claims it says. For that one question, this pass is the *only* layer that exists. Treat it as
required infrastructure for every commit that adds or changes a citation, not as an extra step to
skip under time pressure — the Uterus organ pass found and fixed seven real defects this way
(a fabricated fraction, a fabricated table citation, a real misquote, a wrong cohort size, two
scope-drift conflations, one overclaimed absence) across four cancer entities, in one pass. See
`RULINGS.md` for the specifics.

## The tolerated-count rule

Every non-zero count an instrument reports resolves to exactly one of three states — never a bare
number left standing:

- **Fixed** — the underlying content was wrong; corrected at the source.
- **Declared-with-reason** — the flag is a real false positive (two different real figures
  sharing a template, an extractor artifact, a genuine intentional duplication), recorded in that
  instrument's own `DECLARED` list with a reason naming the mechanism.
- **Dated-for-re-read** — a real open question, recorded with an `until` date by which someone
  re-checks it.

`"Expected and non-blocking" is a judgment, not a state.` A count that nobody has individually
read and classified is not safe just because it's been the same number for a while — see
`RULINGS.md`'s entry on tolerated-count laundering, where a stable "2 known failures" and a
stable "3 flags" both turned out, on an actual read, to contain real defects that had been
sitting there the whole time a green gate ran on top of them. The mechanism for this is
`.claude/tolerated.py`'s `resolve(name, flags, declared)` — shared by every instrument that needs
it; read that file before adding a new tolerated count anywhere.

## Report-before-fixing

When a background research or verification pass reports a finding, the finding gets read and the
report written *before* any fix is applied, and the report states clearly which findings are real
defects vs. which are false positives needing only a declaration. Do not silently fix-and-move-on
without a record of what was found and why the fix is the right one — a future session (or the
reviewer role) needs to be able to check that reasoning, not just the diff.

## Never `git add -A` in this repo

Stage files by name. This project has hit real incidents where a broad `git add` would have
picked up untracked debris, personal files sitting near the repo, or machine-written state files
that should be reviewed individually before staging (see `ENVIRONMENT.md` for the standing
personal-files exclusion). Review `git status` after any staging operation before committing.

## History before `a131649` is immutable

That commit and everything before it is the raw-asset archive for every real-mesh organ in this
atlas — `git show a131649:assets/<organ>.glb` reproduces any uncompressed master byte-exactly, and
no second copy is kept anywhere because a second copy drifts. A squash, rebase, force-push, or
large-blob history purge would destroy those masters with no error and no visible loss. **Do none
of those operations on this repository, ever, regardless of how routine they seem.**
