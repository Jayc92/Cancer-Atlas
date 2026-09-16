# The Two-Role Structure

This project has never run as one continuous, undifferentiated stream of "do the task." It has
run as two roles — an **implementer** (writes code, authors content, runs gates, fixes what the
gates find) and a **reviewer** (rules on design questions, demands measurement before accepting a
repair, and catches claims the implementer makes about the project's own state that turn out to
be false). The reviewer's rulings are most of what `CLAUDE.md`'s own history actually records —
not the code changes themselves, but the judgment calls layered on top of them.

**A single future session has to play both parts, deliberately, in sequence — not blend them into
one undifferentiated pass.** This document exists because that distinction is easy to lose the
moment there's no second party actually asking the harder question, and losing it is exactly how
several of the incidents in `RULINGS.md` happened in the first place.

## What the reviewer role actually does

Not "double-check the work." Specifically:

### 1. Refuses to accept a fix until it's measured, not just plausible

When a defect is found, the reviewer's default question is "how do you know the fix is right,"
not "does the fix look reasonable." Concrete example from this project's own history: when a
compression pipeline needed a precision setting, the instinct was to pick a value that "should be
fine." The reviewer's ruling was to gate every compression decision on a raw-vs-compressed visual
diff at the actual viewer's real zoom level, every time — not a file-size or triangle-count proxy,
which both pass on a mesh with visible banding. That single ruling ("the gate is the rule, the
value is not") is why every later organ's own compression pass includes a real before/after visual
check instead of trusting a number that sounds reasonable.

### 2. Asks "checked, or assumed?" before letting a claim stand

The recurring failure mode this project has hit, over and over, across completely different
domains: a claim about the corpus, the tree, or a citation gets stated with confidence that turns
out to be unearned. The reviewer's job is to interrupt exactly there. Concrete examples:
- An earlier session reported "personal files moved out" as done; the reviewer's insistence on
  re-checking against the *live* tree (not the report) found it was false — the files were still
  there, under old paths, for three days.
- A citation crosscheck's own five-day-old "3 flags, fine" got challenged specifically because
  nobody had individually read what those three flags actually were. Reading them found three
  real defects that had been sitting in a green gate the whole time.
- This session's own Uterus pass: a research agent's summary said a mesh sub-mesh's own material
  looked like "possible holes" from one camera angle. Rather than accepting that read, the
  implementer rendered a uniform-material version specifically to distinguish a real geometric
  hole from a segmentation-label material coincidence — the reviewer discipline applied by the
  implementer *without a separate reviewer present*, which is the harder, more valuable case.

### 3. Pre-registers a prediction before running the test that would confirm or refute it

Several of this project's most useful findings came from stating, in advance, what result would
confirm a hypothesis and what would refute it — then being *wrong* about the direction, in a way
that taught something real. Example: a batch of citation reads was pre-registered as "hedged
prose should drift less than unhedged prose, because a hedge marks epistemic caution already
applied." The actual result: zero drift found either way at the sample size available, and the
batch that *did* find drift found it in the same unit the hedge was supposed to protect —
revealing that the unit of analysis (a bare citation line vs. the citation plus its whole
surrounding provenance comment) was wrong, not the hedge hypothesis itself. The lesson generalized
past the specific finding: **predicting wrong, with the prediction on record, taught something a
vague "let's see" would not have.**

### 4. Demands a measurement of the check itself before trusting its silence

"A check that reports zero must be demonstrated capable of reporting non-zero before its zero is
believed" is a reviewer-originated standing rule, not an implementer instinct — it exists because
four separate real instruments in this project's history reported a clean "zero problems" while
being structurally unable to report anything else (a blown-pixel gate sampling the wrong pixels, a
coverage guard counting the staging it was supposed to exclude, a photometric selector sampling
the exact quantity it measured, a "zero mismatches" search whose own query filtered out every
possible mismatch before counting). The reviewer's own contribution wasn't finding these four
directly — it was generalizing from the first one into a standing requirement applied to every
later instrument.

### 5. Sets the priority when work and infrastructure compete

The reviewer decides what actually matters right now, and reverses the implementer's own default
ordering when warranted. This session's own clearest example: with a battery gate mid-run and an
uncommitted organ pass, the reviewer's instruction was explicit — "don't let uterus block the
handoff... a handoff package that exists at ninety percent is worth far more than a green commit
with nothing to hand off to." That is a priority call an implementer executing a checklist would
not make on its own; it required someone stepping back from the task in front of them to ask what
actually protects the project if this session ends right now.

## What the implementer role does that the reviewer doesn't

Writes the code, authors the content, runs the gates, reads what they find, fixes real defects,
declares real false positives with a reason, and — critically — **reports back honestly enough
that the reviewer's questions in section 1-5 above can actually be asked.** An implementer that
narrates "looks good, all checks pass" without surfacing what was actually found, read, and
decided gives the reviewer nothing to review. Several entries in `RULINGS.md` are about exactly
this: an implementer's own summary claiming a state that direct inspection of the tree
contradicted.

## Playing both roles in one session

You cannot literally be two people. What you can do, and what this project's history shows
actually works:

1. **Before accepting your own fix, ask the reviewer's question out loud** (in your own visible
   reasoning, or in a note to the user): "How do I know this is right, not just plausible?" If the
   honest answer is "I didn't check," that's the signal to check before moving on, not after.
2. **Before reporting a claim about the project's own state, read the tree, not your own memory
   of it** — including memory from earlier in the *same* session. A claim about what's committed,
   what a check found, or what a file currently says gets re-read at the moment you state it, not
   carried forward from three tool calls ago.
3. **When a check reports clean, ask what would have made it report otherwise** — if you can't
   answer that, the "clean" result hasn't earned trust yet.
4. **When you're under time pressure and tempted to skip a required practice** (the two in
   `OPERATING_CONTRACT.md`), that is precisely the reviewer's moment to intervene — and if no
   separate reviewer is present, that intervention has to come from you, deliberately, as a
   distinct step rather than an afterthought.

The two-role structure is why this project's gate chain, citation discipline, and tolerated-count
rule all exist in the form they do. Losing the distinction doesn't make the project fail
immediately — it makes it fail the way every incident in `RULINGS.md` failed: quietly, for a
while, until someone reads carefully enough to notice.
