# Battery runner (.claude/battery.py, 2026-09-05) — the guard on the SET, one layer above
# run_checked.sh, and the last unguarded step in the chain.
#
# AN INSTRUMENT THAT ISN'T INVOKED CAN'T FAIL (user ruling, 2026-09-05). run_checked.sh guards
# each INVOCATION: a tool that runs and prints no DONE marker fails the invocation itself, so a
# vacuous run cannot read as a pass. commit_checked.sh guards the COMMIT: the message's numbers
# are copied from the run by machine. deploy_check.js guards the DEPLOY. Nothing guarded the SET.
#
# The proof that this was a real hole and not a tidiness concern: citation_polarity.py had been
# UNRUNNABLE since the v2 extractor landed — it died on KeyError('refs') before printing a single
# line — and it surfaced only because a human happened to run the whole battery by hand on
# 2026-09-05. Ten instruments, and no mechanism could answer "did all ten run?". A dead instrument
# in a battery nobody enumerates is indistinguishable from a clean one.
#
# WHAT THIS ADDS IS ASSERTIONS, NUMBERED BELOW. Everything else here is plumbing. (This line said
# "two" until 2026-09-06 and had been wrong since the third was added the same day it was written —
# a count in prose, drifting, in the header of the tool that ratchets counts. Numbered headings are
# the fix: they cannot disagree with a total that is no longer stated.)
#
#   1. EVERY DECLARED MEMBER OF THE PHASE RAN AND PRINTED ITS OWN MARKER. Not "was attempted" —
#      printed the marker, via run_checked.sh, so the member's own 7-bis obligation is what this
#      runner counts. A member that crashes, is deleted, is renamed, or loses its DONE line takes
#      the whole battery down by name.
#
#   2. EVERY TRACKED FILE IN .claude/ IS DECLARED — as an instrument or explicitly as a
#      non-instrument. This is the assertion that makes the declared list trustworthy, and it
#      exists because record_sync_check.py's map carries this caveat about itself, verbatim:
#
#          QUOTES .claude/record_sync_check.py
#          > an undeclared pair is invisible to this check, and the map is itself a record that
#          > can go stale (noted honestly; the alternative is a convention parser, which would
#          > be a bigger instrument than the failure justifies)
#
#      THIS QUOTE WENT STALE ONCE, on 2026-09-07, and by the mechanism it is quoted to illustrate.
#      It used to open with the DISCIPLINE sentence; editing that sentence over there (adding the
#      marker-uniqueness clause) left the copy here no longer verbatim, and NOTHING CHECKED IT — the
#      quoted-span check covers code quoting archived sources, and SYNC covers manifest-to-document
#      pairs, so a quotation from one instrument header into another falls between them. The repair
#      is to quote LESS and exactly: the span above is the part the argument needs and is the part
#      least likely to be reworded. Recorded rather than silently fixed, because it is the same
#      failure as everything in the anchor family — a copy of prose with no anchor to its original.
#
#      That caveat applies to THIS list with equal force and the same wording: a new instrument
#      that forgets to declare itself is invisible to a declared-list-only runner, which is the
#      hole this whole tool exists to close, reintroduced one level up. Here the closure is cheap
#      because the population is a single directory: the list is CLOSED OVER .claude/, so a new
#      file is a hard failure until someone classifies it. Declaring a file a non-instrument is
#      then a decision on the record rather than an omission — which is the difference between a
#      stale map and a maintained one.
#
#   4. THE CORPUS DID NOT SILENTLY SHRINK — the ratchet (user ruling, 2026-09-05, closing a gap
#      this runner shipped with hours earlier). The first version asserted only that the records
#      artifact was non-empty and printed its count, so a v3 extractor emitting 300 records where
#      408 stood would have passed. That was named as uncovered on the stated grounds that a FLOOR
#      constant goes stale on the next legitimate corpus growth. True of a floor, and the wrong
#      conclusion: a RATCHET does not go stale. Record the previous count, fail on a decrease, and
#      let an increase move it up automatically. Growth never trips it, shrinkage always does, and
#      a real reduction takes an explicit --lower-ratchet with a --lower-reason — a deliberate step
#      over the gap instead of a silent one, which is the kind of step this project tolerates.
#
#      ANY decrease is material, and that is a defined threshold rather than a hedge:
#      extract_citations.py is deterministic over the local corpus, so on an unchanged tree the
#      count cannot move at all. There is no noise band to tolerate, and inventing a tolerance
#      would be a floor with extra steps — the thing the ratchet replaces.
#
#      AND A COUNT IS STILL BLIND TO COMPOSITION, which is the ratchet's own gap and not a
#      criticism of it (user ruling, 2026-09-06, closing it). d54bd1a removed two FALSE records and
#      added two TRUE ones. Net zero. The ratchet held at 490 and printed "490 held" — true, and it
#      told nobody anything: four records changed identity, and the ratchet would have been equally
#      satisfied had the substitution run the other way, two true records out and two false ones in.
#      The movement was visible only because a throwaway git-archive clone was built by hand to diff
#      the record sets, i.e. by a TECHNIQUE somebody remembered, not by a property of the repo.
#
#          "Store the sorted record keys in the state file, not just the count. Then the battery
#           reports the delta — added and removed — on every run... with keys in a committed file,
#           `git diff` on that file IS the composition audit. ... Sorted ordering is load-bearing,
#           or the diff is unreadable."
#
#      So the state file the ratchet already owns gained the SET beside its size (record_keys, see
#      record_key() below). Two things follow, and the second is the better one: the run prints
#      added/removed/moved on every invocation, and the standing procedure — diff the record sets
#      across any reach change and READ EVERY REMOVAL — stops needing a before-image someone
#      remembered to take. Its cost is ~20KB of sorted JSON that most content commits touch, and
#      that churn IS the signal. The count and the set are written by the same writer in the same
#      save, and load_ratchet() refuses the file if they ever disagree.
#
#      State lives in .claude/record_count.json, declared below as a non-instrument (machine-
#      written state, not a tool). Assertion 2 firing on the very next file added to .claude/ is
#      the mechanism working, not a nuisance. The ratchet is KEYED BY METRIC so extending it is a
#      declaration rather than a redesign; which metrics are wired is answered by
#      .claude/record_count.json and by the sidecars a run prints, not by this comment — a list here
#      would be a second source of truth for something the state file already holds.
#      STILL UNRATCHETED, named rather than left implicit: regress.js's own check count, which
#      could shrink under a green DONE line the same way. ITS CURRENT VALUE IS DELIBERATELY NOT
#      WRITTEN HERE: that is precisely the class the drift rule names. Its own DONE line is the
#      source of truth. (This paragraph named two such metrics until 2026-09-06, when the second —
#      citation_crosscheck's identifier-carrying total — became the sidecar convention's first
#      producer and stopped being unratcheted. The prose had to be edited to keep up, which is the
#      restatement hazard demonstrating itself inside the comment warning about it.)
#
#      HOW THAT METRIC GETS RATCHETED IS NOT ANSWERED HERE ANY MORE. The sidecar convention that
#      closes it — and the scratch-path rule that grew up beside it — moved into the labelled block
#      below, READ THIS BEFORE WRITING A NEW INSTRUMENT, OR A NEW MATCHER. Their audience is
#      whoever writes the next tool, not whoever is reading about the ratchet, and that split is
#      the whole reason the block exists.
#
# ==================================================================================================
# READ THIS BEFORE WRITING A NEW INSTRUMENT, OR A NEW MATCHER (user ruling, 2026-09-07 — the
# LOCATION is the ruling, not only the contents).
#
# THREE CONVENTIONS LIVE HERE, and they are here TOGETHER on purpose:
#
#   A. THE SIDECAR CONVENTION — how an instrument reports numbers that a machine will read.
#   B. THE SCRATCH-PATH RULE — what a tool that OWNS A FILE needs on its first commit.
#   C. THE ANCHOR RULE — how a matcher over a file that also holds hand prose must match, with the
#      family of such matchers enumerated and each member's status.
#
# WHY HERE AND NOT IN CLAUDE.md, which is the other obvious home: the test is WHO NEEDS IT AND
# WHEN. CLAUDE.md is read before touching the project at all. A, B and C are needed at a narrower
# moment — while writing an instrument, or a matcher — and that moment already had a designated
# place: this file's header, where the sidecar convention and then the scratch-path rule were
# recorded. The block makes the address explicit instead of leaving it to whoever scrolls.
#
# WHY ONE LABELLED BLOCK RATHER THAN THREE SCATTERED ONES, which is the part this chain learned
# the hard way. Family members (1) and (2) below are the SAME BUG one day apart, and the lesson
# from (2) WAS written down — in commit_checked.sh, at the site, in the file that had just fixed
# it. The refusal log then broke identically the next day, because nobody reads commit_checked.sh's
# header while editing a different file. A second copy in CLAUDE.md would not have fixed that
# either: the failure was not that the lesson was unwritten, it was that the lesson was reachable
# only by scrolling to the place that already knew it. What fixes it is ONE designated location
# that a new instrument's author is TOLD to read, holding all three conventions.
#
# FOR AN INSTRUMENT THE TELLING IS STRUCTURAL, not a note anyone has to remember: assertion 2 fails
# the battery until a new file in .claude/ is declared in INSTRUMENTS or NON_INSTRUMENTS, so writing
# one MEANS editing this file, and this block is in it. FOR A MATCHER IT IS NOT — nothing forces the
# author of a `grep -c` or a `startswith` into this file at all, which is the weaker half and is why
# the label names matchers explicitly rather than trusting the same mechanism to cover both.
#
# AND WHERE THE FIX IS A SPECIFIC LINE, THE NOTE GOES ON THAT LINE (user ruling, 2026-09-07 — the
# refinement that makes the weaker half above workable, and the strongest single lesson in this block
# because it is the one that survives having no checker behind it).
#
# One designated location is NECESSARY AND NOT SUFFICIENT. The pair at (1) and (2) below is the same
# bug one day apart, and the lesson from the earlier one WAS written down, at the site, in the file
# that had just fixed it — and the later one broke identically anyway, because the person editing a
# different file never opened that header. A designated block has the same weakness whenever the edit
# that would break the rule happens somewhere else: the constraint is invisible at the site where it
# binds. A COMMENT ON THE EXACT LINE THAT WOULD HAVE TO CHANGE CANNOT BE MISSED BY THE PERSON CHANGING
# IT — that is its whole advantage, and it is an advantage no amount of good placement in a header buys.
#
# SO THE RULE IS BOTH, WITH DIFFERENT JOBS: the REASONING lives here once, where an author is told to
# read it; the TRIGGER lives on the line, naming the condition under which that line must change and
# pointing back here. Applied at the three still-globbing defect counters in the fourth item of block A,
# whose trigger comments sit on their glob lines rather than only in this file.
#
# THIS MATTERS MOST WHERE A CHECKER WAS DECLINED, and the fourth item of block A is exactly that case:
# with no fifteenth battery member watching for the defect, the comment on the line IS the mechanism at
# authoring time. A note that is merely well filed would leave nothing there at all.
#
# AND ONE HOME, NOT TWO. A copy of this block elsewhere would be a dual-home record, which by
# record_sync_check.py's own discipline wants a SYNC pair and a marker occurring exactly once —
# i.e. it would be governed by rule C, which it contains. A single home sidesteps that recursion
# by construction rather than by argument.
#
# WHAT IS DELIBERATELY NOT HERE: the closures for family members (5) and (6). Those are facts
# about record_sync_check.py and about .gitignore — what each one's rule is and what evidence
# exists for it — so they live in those files' own headers, and only their STATUS is recorded in
# C's enumeration below.
#
# --------------------------------------------------------------------------------------------------
# A. THE SIDECAR CONVENTION
#
#   HOW THIS GENERALISES — THE SIDECAR CONVENTION (user, 2026-09-05, recorded as a SHAPE AND NOT
#   A TASK, so a session that finds this finds a plan rather than a hole). The question it answers:
#   how an UNRATCHETED number gets ratcheted — assertion 4 above names the one still outstanding.
#   (This opened "the wrong way to close those two" until the block was assembled; the referent was
#   left behind in item 4 by the move, which is the hazard of moving prose that points sideways.)
#   The wrong way is to parse the numbers back out of each instrument's DONE line: nine formats to
#   track, and it recreates the prose-restatement problem INSIDE the runner — deriving a machine
#   number from a human-facing string is the same mistake one level in. The right way is for each
#   instrument to emit a machine-readable sidecar ALONGSIDE its human-readable DONE line,
#
#       SIDECAR {"name": "regress", "metrics": {"checks": 167, "failures": 2}}
#
#   so the ratchet reads STRUCTURE and the DONE line stays a sentence for humans. Each is then
#   the authority for its own audience and neither is derived from the other. (The numbers in
#   that example are a FORM, not a reading — whatever the run produced. This header is not their
#   source of truth either, which is the same reason assertion 4 names its unratcheted metric
#   without quoting a value for it.)
#
#   DO NOT SWEEP TEN TOOLS FOR THIS. The convention applies to the NEXT instrument written, and
#   to each existing one WHEN IT IS NEXT TOUCHED FOR ANOTHER REASON. The ratchet generalises for
#   free over time, and nothing is rewritten for a gap that is still theoretical: regress's count
#   dropping would almost certainly follow a deliberate code edit, not the silent producer change
#   the extractor demonstrated.
#
#   THE READER SHIPS WITH THE FIRST PRODUCER, not before it. A consumer with no producer could
#   only ever be demonstrated against a fixture, and the standard here is capability shown on
#   real output — conditions (7) and (8). Whoever writes that instrument wires both ends and gets
#   a live demonstration for free; building the reader today would spend the demonstration.
#
#   IT SHIPPED THAT WAY (2026-09-06, with citation_crosscheck). The trigger was the convention's
#   own: crosscheck had to be touched anyway, because it could file a FAILED id-mapping fetch as
#   an unmappable id and print a smaller total under a clean DONE line — an active hole in a
#   battery member, not a deferred improvement. Sidecar and reader came along free, which is the
#   case the "when it is next touched" clause was written for. Three things only the live wiring
#   could have taught, each recorded at its own site below:
#
#     - A `ratchet` ARRAY is part of the convention, not an extra. crosscheck reports `records`
#       (coverage, must never shrink) beside `flags` (a DEFECT COUNT — ratcheting it would fail
#       the battery for FIXING a flag). Only the producer knows which is which, so the producer
#       declares it and the reader ratchets nothing it was not asked to.
#     - THE PRODUCER-SIDE LOOPHOLE that array opens is closed by vanished_ratchets(): dropping a
#       metric from the array, or the sidecar entirely, would switch a ratchet off silently. It
#       is checked against COMMITTED state rather than a hand-maintained map of who-reports-what,
#       because a map is the staleness this file's assertion 2 exists to refuse.
#     - METRIC KEYS ARE NAMESPACED per producer, and that is the finding, not a style choice. Two
#       different numbers are both called `records` — the extractor's corpus total and
#       crosscheck's identifier-carrying subset. Unnamespaced, this reader's FIRST live run would
#       have compared one against the other and fired RATCHET SHRANK on a corpus that had not
#       moved. A new gate whose first act is a false positive teaches people to pass
#       --lower-ratchet, which is worse than the gap it closed.
#
#   A FOURTH PROPERTY, 2026-09-07, and the only one found by a ratchet MISFIRING rather than by
#   wiring one up:
#
#     - A RATCHETED METRIC MUST DERIVE FROM TRACKED FILES (user ruling). "What ships is what's
#       tracked — a fresh checkout has only tracked files, so any ratcheted metric derived from a
#       filesystem glob records a number a clean checkout cannot reproduce." The incident: while
#       .claude/pointer_check.py was still an untracked draft, internal_quote_check globbed .claude/,
#       counted the draft's marked quotes and moved its ratcheted `marked` floor upward — to a floor
#       no clone can reach, so the clone fails SHRANK with no defect anywhere in it. THIS FILE WAS THE
#       ONE THAT WAS RIGHT: tracked_claude_files() already read git's index, and the two instruments
#       therefore disagreed about what the corpus IS. Fixed at every ratcheted producer by reading the
#       INDEX rather than HEAD, so a newly `git add`ed file counts in the commit that adds it:
#       internal_quote_check and pointer_check over .claude/, and extract_citations over js/organs/,
#       whose corpus_paths() citation_paren_ledger now IMPORTS instead of keeping its own byte-identical
#       copy of the same glob — a second population, free to drift from the first, which is this whole
#       finding one directory over. Measured behaviour-neutral on the day: the glob and the index
#       listed the same corpus and `git status --porcelain --untracked-files=all` was empty, so no
#       record moved and the read-every-removal rule had nothing to read.
#       SCOPE, DECLARED IN BOTH DIRECTIONS. Three instruments still glob js/organs/ —
#       citation_head_check, citation_reach_check, fraction_check — and are LEFT that way. Each
#       declares `'ratchet': []`, and for a pure defect count seeing an untracked draft organ is a
#       FEATURE: it fails loudly on a file that will not ship, where missing a tracked one would be
#       silent. Each carries the trigger as a comment on its own glob line, which is the line that
#       would have to change, rather than only here where nobody adding a ratchet would look.
#       NOT MECHANISED — CONSIDERED AND DECLINED ON EVIDENCE (user ruling, 2026-09-07), WHICH IS A
#       DIFFERENT NOTE FROM A HELD SHAPE AND IS WRITTEN AS ONE ON PURPOSE. A fifteenth member was
#       proposed and is buildable: the property is decidable from SOURCE TEXT — a tracked .claude/*.py
#       that both calls glob.glob and declares a non-empty `ratchet` array — so a checker would have
#       named all four sites by inspection instead of waiting for one to fire.
#       THE REASON IT IS DECLINED IS THAT THE RATCHET ALREADY IS THAT GUARD, and the user's walk-through
#       is the whole argument: "a glob-derived metric counts untracked files, so it records a number
#       higher than the tracked corpus supports. On a clean checkout the count comes back LOWER — and a
#       lower count is exactly what the ratchet fires on. Loudly, with a named metric, one checkout
#       away." So the fifteenth member would catch AT AUTHORING TIME something the existing mechanism
#       already catches AT CHECKOUT TIME. Earlier is nicer; it is not load-bearing.
#       THE OTHER POLARITY WAS CHECKED RATHER THAN ASSUMED, because "the guard already fires" is a claim
#       about both directions. A glob can see FEWER files than the index only when a TRACKED file is
#       missing from the working tree — and then the count drops in the AUTHOR'S OWN tree, so SHRANK
#       fires there rather than one clone later. The index readers that replaced those globs behave the
#       same way for the same input: internal_quote_check and pointer_check skip a missing file via
#       os.path.exists, so its absence LOWERS the count instead of crashing the run, and
#       extract_citations does not guard its read at all, so it raises and the wrapper turns a gate with
#       no DONE line into a refusal. Loud in every one of those shapes, which is what this direction had
#       to be for the decline to hold.
#       THE COST OF DECLINING, DECLARED: detection is later, and the DIAGNOSIS IS INDIRECT — the message
#       says a named metric SHRANK, not "your floor came from an untracked file" — and it lands on
#       whoever clones next, who did nothing wrong. This paragraph is what buys that down: it is the
#       thing to find when SHRANK fires on a fresh clone with a clean tree.
#       AND THE BAR IS REUSABLE, which is why the decline is recorded as reasoning and not as a verdict:
#       "THE EXISTING GUARD ALREADY FIRES ON THIS" is enough to turn down a new instrument. That is the
#       same reasoning that stops this chain at four layers, one level down. Contrast the two genuinely
#       HELD shapes so a later session does not mistake this for one: the sidecar reader above (held
#       until a producer existed, then shipped) and record_sync_check.py's marker token (held, waiting
#       on a change across every declared pair) both read "not yet". This one reads "no".
#
# --------------------------------------------------------------------------------------------------
# B. THE SCRATCH PATH
#
#   AN INSTRUMENT THAT OWNS A FILE NEEDS A SCRATCH PATH FROM BIRTH (user ruling, 2026-09-07 —
#   recorded beside the sidecar convention because it is the same kind of thing: a property the NEXT
#   tool should have on day one rather than acquire by damaging something).
#
#   The general form: ANYTHING THAT MAINTAINS AN ARTIFACT AND MUST EXERCISE ITSELF TO PROVE IT WORKS
#   needs an env override naming where the artifact lives, honoured from the first commit. Otherwise
#   its selftest either skips the write — leaving the only behaviour that matters untested — or
#   performs it, and writes fiction into the one file whose value is being real. Two tools here own
#   files: this one owns .claude/record_count.json, and run_checked.sh owns .claude/refusals.log.
#
#   THE SCAR, AND WHY IT IS A TEMPLATE HAZARD RATHER THAN ONE TOOL'S BUG: run_checked.sh had the
#   override from birth and still got polluted, because the polluter was not the owner. Its SIBLING,
#   commit_checked.sh, drives deliberately-failing runs THROUGH the wrapper — that is how its arms 1
#   and 3 prove a commit gets refused — and on the refusal log's first live run it appended two
#   invented entries to the real archive. So the rule has a second half: THE SCRATCH PATH MUST BE
#   HONOURED BY EVERY CALLER THAT EXERCISES THE WRITER, not only by the writer's own selftest. An
#   owner cannot protect its artifact alone. There are exactly two such callers today (this file's
#   arms are in-process and never reach the wrapper), and a third would silently write fiction.
#
# --------------------------------------------------------------------------------------------------
# C. THE ANCHOR RULE, AND THE FAMILY IT WAS DERIVED FROM
#
# PROSE SHARING A FILE WITH MACHINE-READ STRUCTURE — THE FAMILY, ENUMERATED (user ruling,
# 2026-09-07, after the refusal log held one entry and reported zero: "the cause is structural rather
# than a one-off ... the set is small enough to enumerate ... the remedy should be applied to the
# family rather than to the instance that happened to surface").
#
# TWO QUESTIONS, ASKED IN ORDER: which members are DANGEROUS, and for those, what the remedy is.
# They came a day apart and are separate rules; conflating them is how the second nearly became
# "anchor everything".
#
# THE PREDICATE THE INCIDENT SUGGESTED IS THE WRONG CUT, and deriving the set rather than accepting
# it is what showed that. "Prose beside structure" does not predict danger: the ruling named four
# members and THREE OF THE FOUR FAIL LOUDLY. What predicts danger is one property —
#
#   IS THE ANCHOR A LANGUAGE PARSER, OR A HAND-TYPED CONVENTION?
#
# Where a parser is the anchor (JSON, Python, JS), a prose edit cannot be missed: it is a
# SyntaxError or a refusal. Where the anchor is a convention someone typed (`^==== REFUSAL `,
# `^DONE `, a bare marker, a leading `#`), a prose edit fails SILENTLY, and silence over present
# data is this chain's signature failure. Every silent member below was outside the four named.
#
# AND AN ANCHOR IS NOT ALWAYS A POSITION (user ruling, 2026-09-07, arriving with 5(b) below and the
# reason this block is titled for matchers as well as instruments). Line-start is the right remedy
# where the matcher decides WHETHER A LINE IS THE LINE — a DONE line, a refusal header, a sidecar:
# there the convention genuinely lives at column 0, so position is a property of the artifact. It is
# the WRONG remedy where the marker text is prose that could legitimately begin a line, which is
# exactly the shape of `THE DIRECTION`; anchoring that would have been a rule that looks like the
# others and checks nothing. What is decidable there is COUNT: the marker must occur EXACTLY ONCE in
# its target. Zero is the stale declaration; more than one means the string is not a marker at all,
# and the pair can sit green in both homes by coincidence.
#
# SO THE QUESTION FOR A NEW MATCHER IS NOT "IS IT ANCHORED" but WHICH PROPERTY OF THE MATCH IS
# DECIDABLE FROM THE FILE — position, or arithmetic over occurrences. Both forms clear the same bar,
# which is the bar and not the mechanism: decidable from the artifact alone, with no judgement about
# what anyone intended. Picking the mechanism that fits the artifact is the whole rule.
#
# THE SET, CLOSED, with the evidence for each — the three declaration properties applied to a
# declaration about declarations. Direction first, because it is the whole point:
#
#   SILENT — the anchor is a typed convention. These need the remedy.
#     1. .claude/refusals.log header vs `grep -c '^==== REFUSAL '`. FIXED d01615f; run_checked.sh
#        arm 7 fails without the guard. THE ONLY MEMBER THAT WAS EVER LIVE: 1 entry read as 0.
#     2. commit message body vs commit_checked.sh's DONE_LINE_RE. Already anchored (2026-09-06). Its
#        header names both directions the one matcher had to satisfy at once:
#
#            QUOTES .claude/commit_checked.sh
#            > TOO WIDE — prose got quoted.
#
#            QUOTES .claude/commit_checked.sh
#            > TOO NARROW — a gate went missing.
#
#        THIS ENTRY USED TO JOIN THOSE TWO INSIDE ONE PAIR OF QUOTE MARKS, slash-separated, and that
#        composite existed in no file. internal_quote_check.py fired on it on its FIRST LIVE RUN
#        (2026-09-07) — a compression wearing the clothes of a quotation, which is exactly what the
#        outward quoted-span check was recorded to catch, found here by the inward one, in the file
#        that hosts this enumeration. THE SAME BUG AS (1), ONE DAY EARLIER, IN THE SAME CHAIN, AND
#        NOBODY CONNECTED THEM — which is the argument for enumerating rather than fixing instances.
#     3. instrument stdout vs run_checked.sh's marker test. Was `grep -qF` — a bare substring, so a
#        member printing `ok  fires when DONE x: is absent` and no DONE line was ACCEPTED as
#        reporting. FIXED 2026-09-07; arm 8 fails without the anchor. Measured latent, not live —
#        re-runnable, and stated as the check rather than its output because a count here would
#        drift: in a full pre-commit run every declared marker occurs exactly once and every
#        occurrence is already at column 0, so anchoring breaks nothing that passes today.
#     4. instrument stdout vs this file's marker test, three lines from a printer that already
#        anchored. Was `marker in combined`. FIXED 2026-09-07 (marker_reported); arm 12 fails
#        without it — its refusing assertions flip and its passing one does not, which is what
#        distinguishes an arm that catches the defect from one that restates the fix.
#     5. CLAUDE.md / phaseA_mapping.md vs record_sync_check's `marker in text` + `key in manifest`.
#        TWO silent directions, ruled on separately. (a) CLOSED 2026-09-07: the check fired only on
#        ASYMMETRY, so a pair gone from BOTH homes passed, and its DONE line said `N pairs checked`
#        while counting len(SYNC) — the map's length. A pair the map declares and neither home holds
#        is now a STALE DECLARATION and always a defect, because deliberate retirement has an
#        explicit path (delete the SYNC row, a visible reviewable diff); the count is now pairs FOUND
#        over pairs declared. This is declaration property (3) turned on SYNC itself — a closed
#        enumerated set whose membership was never verified against reality. Arms 4 and 5 there fail
#        against the logic they replaced. (b) CLOSED 2026-09-07 BY UNIQUENESS RATHER THAN POSITION,
#        per the rule above: the marker was an unanchored substring of hand prose, so a generic one
#        ('THE DIRECTION') could read as landed from an unrelated sentence and a pair could be green
#        in both homes by accident. Each marker must now occur EXACTLY ONCE in its target. Arm 6
#        there fails against the `marker in text` boolean it replaced, and the rule FIRED ON THE
#        LIVE CORPUS at birth — five declared markers matched more than once, each lengthened to the
#        unique span at the record's own home; which five, and what each became, is recorded in that
#        file's SYNC map rather than restated here. Condition (7) met by the corpus, not a fixture.
#     6. .gitignore's comment lines vs git's pattern parser, where the anchor is a leading `#`.
#        CLOSED 2026-09-07 as a PROSE-SHAPE RULE rather than a shipping check (user ruling: forbid the
#        prose from being ABLE to become a pattern). A comment line that is a BARE PATH and loses its
#        `#` becomes an ignore pattern and the file silently stops being addable — measured on scratch
#        repos twice: the path vanished from `git add -A --dry-run`, and this file's own `# macOS`
#        minus its hash dropped `?? macOS` out of `git status --porcelain`. Assertion 5 forbids a `#`
#        line whose stripped content holds no whitespace; arm 19 fails both when the predicate is
#        removed and when it is read as "no space character" (a tab-separated comment is prose).
#        WHY THE SHAPE AND NOT THE CONSEQUENCE: undeclared_files() cannot see the consequence, because
#        a should-ship file that was silently ignored is indistinguishable from the untracked scratch
#        tracked_claude_files() excludes ON PURPOSE. Same move as anchoring an append at the writer.
#        It fired on the live file at birth, which is condition (7) met by the corpus, not a fixture.
#
#   LOUD — the anchor is a parser, or the failure is a reported PROBLEM. No remedy needed, and
#   saying so is part of the audit: an enumeration that only lists the dangerous half cannot be
#   checked for completeness.
#     7. instrument stdout vs parse_sidecars' `strip().startswith('SIDECAR ')`. Unanchored w.r.t.
#        indentation, so prose BEGINNING with the token collides — and both collision shapes were
#        driven: each becomes `BAD SIDECAR`, a PROBLEM, and a genuine indented sidecar is still read.
#     8. record_count.json's `_note` vs json.load. A broken prose edit yields RATCHET UNREADABLE and
#        REFUSES to re-initialise; and load_ratchet -> save_ratchet round-trips the file
#        byte-identically, so a machine rewrite cannot silently drop the prose either. Both driven.
#     9. citations.json's `_`-prefixed prose keys vs its json.load readers AND NO WRITER — the
#        largest member by key count, named by nobody. Prose loss is impossible because nothing
#        rewrites it; a broken edit is a parse error at every reader.
#    10. reasons inside declared lists (citation_reach_check's DECLARED_UNREACHED, deploy_check's
#        BENIGN.why, citation_head_check's IMPRECISE/WELL_FORMED, citation_paren_ledger's
#        PREREGISTERED, citation_crosscheck's DECLARED_UNMAPPABLE, this file's NON_INSTRUMENTS).
#        NOT anchor collisions at all: the language parser is the anchor. Their separate hazard is
#        a counter reading prose (the >80-char bar), which is recorded with that bar, not here.
#    11. marked internal quotes vs internal_quote_check.py's `QUOTES <path>` + `>` gutter, ADDED
#        2026-09-07 AS A MEMBER BEFORE IT WAS WRITTEN — the first entry here that is a new matcher
#        rather than an audit of an old one, and the user named it a member of this family in the
#        same ruling that ordered it. LOUD on both of its anchors, and it needs two because it
#        matches two different things: the MARKER is anchored by POSITION (`QUOTES` must begin the
#        stripped line — the corpus already holds two mid-sentence uses of the word, and its arms 8
#        and 9 use those two lines verbatim), and the SPAN is anchored by COUNT (exactly one
#        occurrence in the target). Every failure class is a reported PROBLEM with a non-zero exit,
#        including the one the ruling named specifically: a marked quote whose target file is gone.
#        THE SILENT RESIDUE, which is a population hole and not an anchor collision: an UNMARKED
#        quote reaches no instrument, because "prose that is a quote" cannot be enumerated. Same
#        shape as record_sync_check's undeclared-pair blind spot in (5), unclosable for the same
#        reason, and narrowed only by ratcheting the marked count. Its own header carries the rest.
#    12. hand-typed `<file>:<line>` pointers — in prose and in citations.json's `refs` — vs
#        pointer_check.py's POINTER regex, ADDED 2026-09-07, the second entry that is a new matcher
#        rather than an audit of an old one. LOUD: every failure class is a reported PROBLEM with a
#        non-zero exit, and a prose string that merely LOOKS like a pointer without being one gets
#        flagged rather than ignored, which is visible and arguable. Its anchor is neither position nor
#        count but RESOLUTION — the named file and line either exist or they do not — which is why the
#        loud direction is the cheap one here.
#        THE SHAPE IS NEW TO THIS LIST, and that is the finding: a word-boundaried REGEX OVER PROSE,
#        not `^`, `startswith(`, `index($0,`, `-qF` or `.count(`. Its characteristic failure is not an
#        anchor collision at all but ORACLE LOOSENESS — drop the `\b` and a surname needle of two or
#        three characters matches ordinary English (`Li` in "likely", `Hu` in "human", `Ding` in
#        "finding"), so the check reports a clean corpus while measuring nothing. Paid for with word
#        boundaries plus a second corroborating field, the year. A matcher that scores TOO KINDLY is
#        the silent half of this shape and belongs recorded beside the position/count hazards, because
#        the remedy is different in kind: not an anchor, a corroborator.
#        THE POPULATION HAS NO EXCLUSION LIST, deliberately, and the reason is a scar. The census that
#        ordered the instrument skipped fixture filenames by a hand-maintained list, and that list HID
#        eight dangling pointers inside two selftests. Copying it into the instrument would have made
#        its total a statement about the list — exactly the staleness assertion 2 exists to refuse. The
#        fixtures were changed instead, to compose their refs from parts, so the invariant is absolute
#        and has nothing to keep in step: a fixture may REUSE a real pointer, never INVENT one.
#        THE SILENT RESIDUE, a population hole and not a collision: a pointer written in any other form
#        — "line 141 of kidneys.js", "the KDM5C block", a section name — reaches nothing. Same shape as
#        (11)'s unmarked quote and unclosable for the same reason, narrowed only by ratcheting the
#        pointer TOTAL so that deleting a pointer to silence a fire fails the battery.
#        Condition (7) met by the CORPUS at birth: it fired on a corpus nobody had cleaned, and its
#        output was the worklist the repair worked from. Commit 3fa9e1a's message quotes that run's
#        DONE line verbatim, which is where the figures live — a repaired corpus cannot re-produce it.
#
# THIS ENUMERATION HAS NO CHECKER, said plainly because the chain's own lesson is that a
# hand-assembled enumeration grows on contact — six head-shape artifacts turned out to be eight, and
# this list has grown on every reading since it opened (count the entries above; a total restated
# here would be one more machine-derivable number rotting in prose). What a checker WOULD close over
# is available: the matcher shapes are greppable inside .claude/ (`grep -c '^`, `startswith(`,
# `index($0,`, `-qF`, and `.count(` — the uniqueness form is a matcher too, which is the shape the
# second rule added to the population), so "every matcher site is classified above" is decidable the
# way undeclared_files() is decidable. Entries (11) and (12) are the two tests of that list against
# matchers written AFTER it, AND THEY SPLIT — which settles what the first one left open. Entry (11)
# needed no new shape (internal_quote_check.py's marker is `startswith(`, its span is `.count(`), and
# that was recorded here as weak support, one instance, not a closure. Entry (12) is the second
# instance and it BROKE THE SET: pointer_check.py matches with a regex over prose, which none of the
# five greppable forms describes. So that list is now known to enumerate the shapes used SO FAR rather
# than the shapes possible, and a checker built over it would have gone green while missing the newest
# member entirely — the enumeration-grows-on-contact lesson arriving one level up, at the list of ways
# to grep for members. The honest closure is the OTHER direction, every .claude/ matcher site
# classified here rather than every known shape found, which is undeclared_files() pointed at this
# block. Still not built, because the ruling asked for the remedy applied to the family, not a new
# instrument. The superseded sentence is corrected here rather than reworded away: it was true when
# written and was overturned by a measurement.
# ==================================================================================================
#
# WHY THE CHAIN STOPS AT FOUR (user, 2026-09-05 — recorded so nobody adds a fifth from momentum).
# Set -> invocation -> commit message -> deploy is COMPLETE, not arbitrarily truncated, and the
# property that makes it complete is that this runner is a SINGLE ENTRY POINT: one command covers
# everything downstream of it. A guard above the battery would need its own guard, and that regress
# only ever bottoms out at a human running one thing. Four is where the recursion stops because
# four is where the human is.
#
# PHASES exist because deploy_check.js cannot run pre-commit — there is nothing deployed to check
# until the push has happened, and it correctly reports NOT PUSHED if asked early. So the members
# split into `pre-commit` and `post-push` (deploy_check alone), and a third assertion falls out of
# that: every declared instrument must belong to a declared phase, or a typo in a phase name would
# silently retire an instrument. That is "an instrument that isn't invoked can't fail" sneaking
# back in through the declaration itself, so it gets an arm.
# THIS PARAGRAPH CARRIED THE SPLIT AS TWO NUMBERS IN PROSE ("the ten members split into pre-commit
# (nine) and post-push (one)") and both went stale the moment a member was added, in the header of
# the file whose own line 15 records having done exactly this once already. The counts are gone
# rather than corrected: INSTRUMENTS below is the only place either is true, and the DONE line
# prints both from it.
#
# Usage:
#   python3 .claude/battery.py --selftest
#   python3 .claude/battery.py pre-commit
#   python3 .claude/battery.py post-push
#   python3 .claude/battery.py pre-commit --lower-ratchet=406 --lower-reason="two dropped, unsourced"
#     ^ the only way past assertion 4, and it stays a check: the lowered bar is then compared to
#       the real count like any other, so a lower cannot switch the assertion off.
#   .claude/commit_checked.sh "<subject>" "DONE " python3 .claude/battery.py pre-commit
#     ^ the intended commit form: marker "DONE " quotes EVERY member's DONE line plus the
#       battery's own into the message, so the commit records the whole set's numbers verbatim.
#
# 7-bis applies to this runner too: DONE line last, and its absence must fail the invocation.
#   .claude/run_checked.sh "DONE battery:" python3 .claude/battery.py pre-commit
import json
import os
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK_DIR = os.path.join(tempfile.gettempdir(), 'atlas-battery')
RECORDS_ARTIFACT = os.path.join(WORK_DIR, 'records.json')
POLARITY_ARTIFACT = os.path.join(WORK_DIR, 'polarity_scan.json')
CROSSCHECK_ARTIFACT = os.path.join(WORK_DIR, 'crosscheck_flags.json')
REGRESS_OUT_DIR = os.path.join(WORK_DIR, 'regress')
REGRESS_PORT = '3057'

# The ratchet's state, and the only file in .claude/ that a tool writes rather than a human. It is
# COMMITTED on purpose: an uncommitted ratchet would reset on every fresh clone, which is a floor
# of zero wearing a ratchet's clothes.
RATCHET_FILE = os.path.join(REPO_ROOT, '.claude', 'record_count.json')
RECORDS_METRIC = 'records'
# The record SET, stored beside its size in the same file. Named as a constant because three
# functions read it and a typo in one of them would look exactly like a first run.
RECORD_KEYS = 'record_keys'

PHASES = ('pre-commit', 'post-push')

# THE DECLARED INSTRUMENT LIST — count it from the rows below, which is the only place it is true.
# It used to say "Ten members" here; that is a machine-derivable number restated in prose, and it
# went stale the first time a member was added (this comment's own recorded failure mode: delete
# the duplicate, else point at the source of truth, else quote the line). Adding an instrument
# means adding a row here in the same commit; assertion 2 makes that mechanical, not remembered.
INSTRUMENTS = [
    # (name,                     phase,        done marker,                    argv)
    ('syntax_check', 'pre-commit', 'DONE syntax_check:',
     ['sh', '.claude/syntax_check.sh']),
    ('absence_claim_check', 'pre-commit', 'DONE absence_claim_check:',
     ['python3', '.claude/absence_claim_check.py']),
    ('fraction_check', 'pre-commit', 'DONE fraction_check:',
     ['python3', '.claude/fraction_check.py']),
    ('share_sum_check', 'pre-commit', 'DONE share_sum_check:',
     ['python3', '.claude/share_sum_check.py']),
    ('duplicate_figure_check', 'pre-commit', 'DONE duplicate_figure_check:',
     ['python3', '.claude/duplicate_figure_check.py']),
    ('record_sync_check', 'pre-commit', 'DONE record_sync_check:',
     ['python3', '.claude/record_sync_check.py']),
    # declared next to record_sync_check because they are the same idea pointed two ways:
    # record_sync_check holds a DECLARED MAP of dual-home pairs and checks each marker resolves once;
    # internal_quote_check takes the case where the copy IS the anchor, so there is nothing to declare
    # but the direction. It is
    # also the only member whose subject is this chain's own prose rather than the atlas, and the only
    # one that needs the author to mark something at write time — see its header for why an unmarked
    # quote is invisible to it, and why the marked count is the ratcheted metric.
    ('internal_quote_check', 'pre-commit', 'DONE internal_quote_check:',
     ['python3', '.claude/internal_quote_check.py']),
    # declared next to internal_quote_check because they are the SAME HAZARD ON THE OTHER FIELD. That
    # one checks a quoted SPAN against the file it claims to quote; this one checks a hand-typed
    # `<file>:<line>` against the thing it claims to point at. internal_quote_check's header names the
    # class in one sentence — a file:line pointer in prose is the `:<anchor>` field the marked-quote
    # convention was ruled to DROP — and it says that about two stale pointers of its own. The
    # convention could escape the problem by making the span the anchor because it was NEW; the corpus
    # already held hundreds of pointers written the other way, load-bearing and reaching no checker.
    # It arrived AFTER a census rather than instead of one (user ruling: count them, don't sweep them),
    # and the count is what chose repair over deletion — every pointer named a real place, so nothing
    # was fabricated and every defect was recoverable. Its own header carries the two-population split
    # (a TOTAL floor, a PARTIAL identity check) and why it proposes repairs and never applies them.
    ('pointer_check', 'pre-commit', 'DONE pointer_check:',
     ['python3', '.claude/pointer_check.py']),
    ('citation_polarity', 'pre-commit', 'DONE citation_polarity:',
     ['python3', '.claude/citation_polarity.py', RECORDS_ARTIFACT, POLARITY_ARTIFACT]),
    ('citation_crosscheck', 'pre-commit', 'DONE citation_crosscheck:',
     ['python3', '.claude/citation_crosscheck.py', RECORDS_ARTIFACT, CROSSCHECK_ARTIFACT]),
    # the only member that watches for something NOT happening — see its own header for why the
    # ratchet could never cover this direction
    ('citation_reach_check', 'pre-commit', 'DONE citation_reach_check:',
     ['python3', '.claude/citation_reach_check.py']),
    # its opposite face, and declared next to it on purpose: reach_check counts years that produced
    # NO record and says in its own header that a year producing the WRONG record will never appear
    # there. citation_head_check takes the part of that blind spot which is decidable without a
    # heuristic — the author STRING against the corpus text — by enumeration rather than by rule.
    ('citation_head_check', 'pre-commit', 'DONE citation_head_check:',
     ['python3', '.claude/citation_head_check.py']),
    # THE ONLY MEMBER WHOSE SUBJECT IS A RULE RATHER THAN THE CORPUS, and the only one that reads
    # records and absences together — because the thing it examines is which of the two a span landed
    # on. It holds a pre-registered claim about closed_year_paren(),
    #     QUOTES .claude/citation_paren_ledger.py
    #     > a closed year-bearing parenthetical spends the head
    # and refuses any span of that shape that nobody has scored
    # against it. Distinct from every other member's failure mode: the rest catch a corpus defect,
    # citation_paren_ledger catches a rule accumulating unexamined support.
    ('citation_paren_ledger', 'pre-commit', 'DONE citation_paren_ledger:',
     ['python3', '.claude/citation_paren_ledger.py']),
    ('regress', 'pre-commit', '==== DONE:',
     ['node', '.claude/regress.js', REGRESS_OUT_DIR, REGRESS_PORT]),
    ('deploy_check', 'post-push', 'DONE deploy_check:',
     ['node', '.claude/deploy_check.js']),
]

# THE NON-INSTRUMENTS, declared with a reason each, because assertion 2 is only as good as the
# honesty of this half. A gate hidden in here would be a gate nobody runs.
NON_INSTRUMENTS = {
    'battery.py': 'this runner',
    'run_checked.sh': 'wrapper — guards one invocation; has its own --selftest',
    'commit_checked.sh': 'wrapper — guards the commit message; has its own --selftest',
    'extract_citations.py': 'artifact producer, run as this runner preflight, not a gate',
    'figure_search.py': 'read helper — searches ONE fetched document during a claim read; '
                        'has a DONE line but no corpus-wide population to scan',
    'bake_ao.py': 'offline asset tool (Blender), part of the a131649 reproducible chain',
    'mesh_hygiene.py': 'offline asset tool (Blender), part of the a131649 reproducible chain',
    'render_thumb.py': 'offline asset tool (Blender)',
    'nocache_server.py': 'local dev server; started by this runner for the regression',
    'citations.json': 'the manifest — data, not a tool',
    'record_count.json': 'the ratchet — machine-written state, not a tool; this runner is the '
                         'only writer, and it is committed so a fresh clone inherits the floor',
    'refusals.log': 'the refusal log — machine-written state, not a tool; run_checked.sh is the '
                    'only writer, appending the runs that FAILED, which are the ones this chain '
                    'used to discard. It checks nothing and changes no exit code; it is where the '
                    'evidence of a check firing survives, one commit later than the pass it '
                    'would have been',
    'launch.json': 'preview config — data, not a tool',
    'phaseA_mapping.md': 'a record — data, not a tool',
}


def declared_instrument_files():
    """The .claude/ filenames the instrument list claims. Derived from argv, not hand-listed —
    a second hand-maintained list would be a third thing to forget."""
    claimed = set()
    for _name, _phase, _marker, argv in INSTRUMENTS:
        for token in argv:
            if token.startswith('.claude/'):
                claimed.add(os.path.basename(token))
    return claimed


def tracked_claude_files():
    """Tracked (index-visible) files directly in .claude/. `git ls-files` reads the INDEX, so a
    newly `git add`ed instrument is already visible here — which is what makes the same-commit
    discipline enforceable rather than advisory. Untracked scratch and __pycache__ are excluded
    by construction, since they are not part of what ships."""
    out = subprocess.run(['git', '-C', REPO_ROOT, 'ls-files', '.claude'],
                         capture_output=True, text=True, check=True).stdout
    names = set()
    for path in out.split('\n'):
        path = path.strip()
        if not path:
            continue
        relative = path[len('.claude/'):]
        if '/' in relative:      # nested dirs are not instruments; nothing nests today
            continue
        names.add(relative)
    return names


def present_claude_files():
    """What is actually in .claude/ on disk, tracked or not. Only used to tell a stale declaration
    apart from an untracked file, which are different problems with different fixes."""
    return {name for name in os.listdir(os.path.join(REPO_ROOT, '.claude'))
            if os.path.isfile(os.path.join(REPO_ROOT, '.claude', name))}


# ---- the assertions, as pure functions so the selftest can drive them ------------------------
# Numbered in their own docstrings, and NOT counted here: this header said "the three assertions"
# while the file already held four, which is the number-restatement rule biting the label on the
# section that holds the checks. The count is derivable by grep; a copy of it is just a copy.

def undeclared_files(tracked, instrument_files, non_instruments, present_on_disk=None):
    """Assertion 2. Any tracked .claude/ file that is neither an instrument nor a declared
    non-instrument, and any declaration naming a file that is not tracked.

    The second half splits in two, and the split is worth the parameter: a declaration whose file
    is GONE is a stale declaration, but a declaration whose file exists on disk and is merely
    UNTRACKED is a file that would not ship — the same-commit discipline caught mid-violation.
    This runner's own first selftest run fired exactly that arm on itself, before it was added to
    the index, which is the case a generic "stale" message would have misdiagnosed."""
    on_disk = present_on_disk if present_on_disk is not None else tracked
    problems = []
    for name in sorted(tracked - instrument_files - set(non_instruments)):
        problems.append(f'UNDECLARED: .claude/{name} — declare it in battery.py as an '
                        'instrument (INSTRUMENTS) or as a non-instrument tool (NON_INSTRUMENTS)')
    for name in sorted((instrument_files | set(non_instruments)) - tracked):
        if name in on_disk:
            problems.append(f'NOT TRACKED: .claude/{name} — declared and present on disk but not '
                            'in the git index, so it would not ship; git add it in this commit')
        else:
            problems.append(f'DECLARED BUT ABSENT: .claude/{name} — the declaration is stale')
    return problems


def unphased_instruments(instruments, phases):
    """Assertion 3. An instrument whose phase is not a real phase would never be invoked."""
    return [f'BAD PHASE: {name} declares phase {phase!r}, not one of {list(phases)} — '
            'it would never be invoked'
            for name, phase, _marker, _argv in instruments if phase not in phases]


def gitignore_comments(text):
    """Every comment line in .gitignore as (line number, content after the hash). Shared by the
    assertion below and by the DONE line's count, so the number reported and the number checked
    come from one parse rather than two that can disagree.

    NEITHER STRIP IS A GUARD, and that is measured rather than assumed — the first version of this
    docstring claimed the trailing one was load-bearing and a mutation probe falsified it. The
    predicate downstream is `len(content.split()) == 1`, and str.split() with no argument already
    collapses every run of whitespace and drops empties, so a padded body and a bare one are the same
    token list and an empty comment is the empty list. Removing the .strip() changed no arm. It stays
    because the PROBLEM message quotes the content back and padding in a quoted string reads as a
    typo, not because anything depends on it.

    WHAT THE MEASUREMENT DID ESTABLISH, on a scratch repo, is the shape of the hazard the predicate
    has to cover. Git ignores trailing whitespace in a pattern, so `# padded   ` minus its hash really
    does ignore `padded` — `?? padded` vanished from `git status --porcelain`. And git reads a comment
    only when the `#` is at column 0, while an indented comment's body keeps its leading spaces as
    literal pattern text, so `  # indented` minus the hash ignores nothing (`indented` stayed
    untracked). The .lstrip() therefore counts indented comments that could not become live patterns:
    deliberately broader than the hazard, which is the safe direction for a check whose failure mode
    is under-firing, and the live file has no indented comment anyway."""
    out = []
    for number, line in enumerate(text.split('\n'), 1):
        stripped = line.lstrip()
        if stripped.startswith('#'):
            out.append((number, stripped[1:].strip()))
    return out


def gitignore_bare_path_comments(comments):
    """Assertion 5. NO COMMENT IN .gitignore MAY BE A BARE PATH (user ruling, 2026-09-07).

    .gitignore is a member of the prose-beside-structure family enumerated in this file's header,
    and its anchor is the weakest kind: a single leading `#`. A comment line that is a BARE PATH and
    loses its hash becomes an ignore PATTERN, and the file it names silently stops being addable —
    driven on a scratch repo, where the path vanished from `git add -A --dry-run` with no error at
    all, and again on this file's own line 20: `macOS` without its hash ignores a file called macOS
    and drops it out of `git status --porcelain` without a word. Two things bound the damage and
    neither is a guard: git ignores only UNTRACKED paths, so files already in the index are immune;
    and no comment here is a bare path today, which is a property of the prose style rather than of
    anything checking.

    THE RULE GUARDS THE SHAPE, NOT THE CONSEQUENCE, and that choice is the whole design. The
    consequence — "a file that should ship silently does not" — cannot be checked here without
    reopening tracked_claude_files()'s deliberate exclusion of untracked scratch, because a
    should-ship file that was silently ignored and a scratch file nobody meant to add are the same
    observation. Forbidding the prose from being ABLE to become a pattern needs neither: it is
    decidable from .gitignore alone. Same move as anchoring an append at the writer rather than
    repairing the file it damaged.

    DELIBERATELY BROADER THAN THE HAZARD. "Contains no whitespace" flags any single-token comment,
    including ones that are plainly not paths. That is the trade taken on purpose: the broad form is
    EXACT and needs no judgement, where "looks like a path" would be a heuristic, and this chain
    prefers a structural check to a heuristic every time. It fired on a real line at birth —
    `# macOS`, harmless in itself — which is condition (7) satisfied by the corpus rather than by a
    fixture, and the fix was to make the comment prose."""
    return [f'BARE-PATH COMMENT: .gitignore:{number} is `# {content}` — a single token with no '
            'whitespace, so dropping the `#` turns it into an ignore pattern and whatever it names '
            'silently stops being addable. Make the comment prose (two words or more).'
            for number, content in comments if len(content.split()) == 1]


def ratchet_verdict(metric, previous, current, lower_to=None, lower_reason=None):
    """Assertion 4. Returns (problems, new_stored_value, notes).

    The whole mechanism: growth raises the stored value, equality holds it, ANY shrink is a problem,
    and a deliberate lower is applied FIRST and then subjected to the same comparison — so lowering
    to 380 on a corpus that actually holds 300 still fails. That composition is why there is no
    special case for "lower": it moves the bar, it does not switch the check off."""
    problems, notes = [], []
    if lower_to is not None:
        if not lower_reason:
            problems.append(
                f'LOWER REFUSED: --lower-ratchet={lower_to} given for {metric} with no '
                '--lower-reason — an explicit lower is a decision on the record, and a reasonless '
                'one is just a floor being quietly moved')
            return problems, previous, notes
        notes.append(f'RATCHET LOWERED: {metric} {previous} -> {lower_to} — {lower_reason}')
        previous = lower_to
    if previous is None:
        notes.append(f'RATCHET INITIALISED: {metric} at {current} — condition (8) applies, a first '
                     'run is calibration; the SECOND run is the check. git add '
                     '.claude/record_count.json, or every fresh clone re-calibrates from nothing')
        return problems, current, notes
    if current < previous:
        problems.append(
            f'RATCHET: {metric} SHRANK {previous} -> {current} ({previous - current} fewer). '
            'Either the producer silently lost records, or a real removal has not been declared. '
            'If the reduction is intended, step over the gap deliberately:\n'
            f'      python3 .claude/battery.py pre-commit --lower-ratchet={current} '
            '--lower-reason="<why>"')
        return problems, previous, notes
    if current > previous:
        notes.append(f'RATCHET RAISED: {metric} {previous} -> {current} — growth moves it up with '
                     'no ceremony; git add .claude/record_count.json in this commit')
        return problems, current, notes
    return problems, previous, notes


# ---- the record SET, not just its size ---------------------------------------------------------
# Why this exists at all is the composition paragraph in assertion 4 above. What follows is the
# part that had to be got exactly right: what a record's identity IS, and how to report a change in
# a set of 490 of them without flooding the one list the standing procedure says to read.

def record_key(record):
    """One record's identity, AS THE EXTRACTOR ALREADY DEFINES IT: (author, year, ref).

    NOT ONE FIELD NARROWER, and that was measured rather than assumed. extract_citations.py dedupes
    on exactly this triple, so it is the finest distinction the producer draws and the coarsest key
    whose set size can equal the count it explains. Drop the ref and `TCGA|2015` is ONE string
    naming 22 records — including both records d54bd1a added, which is the very movement this was
    built to show. A colliding key would put two different totals in one file and call them both
    `records`, and the delta report would go quiet on the exact case that motivated it."""
    return f"{record['author']}|{record['year']}|{record['ref']}"


def coarse_key(key):
    """A record's identity WITHOUT its line, used for one purpose: telling a MOVE from a removal.

    The line number is in the key because it is in the producer's dedupe key, and the cost of that
    is real — inserting a single line at the top of colon.js re-keys every record below it, so a
    formatting commit can present forty removals and forty additions. Left unclassified that floods
    the list the standing procedure says to read line by line, which is how a discipline dies of
    noise rather than of disagreement.
    SAYING "MOVED" IS A LABEL, NOT A FILTER: moves are counted, and printed with both refs, so a
    reader sees everything either way. IT CAN MISLABEL ONE THING, named here because the pairing is
    arithmetic and cannot know better — a real removal plus an unrelated real addition that happen
    to share author, year and file will pair as a move. Both refs still print, so no evidence is
    lost; only the label is wrong, and a wrong label on printed evidence is recoverable. A SILENT
    omission would not be, which is why nothing here drops anything."""
    return key.rsplit(':', 1)[0]


def record_delta(previous, current):
    """(added, removed, moved) over the record set — pure, so the selftest can point it at the
    d54bd1a shape (a flat count with four records changing identity) and watch it fire.

    `previous` is None on the first run after this shipped: there is no baseline, every key would
    read as added, and calling that a delta would be the loudest possible way of saying nothing.
    Condition (8) once more — a first run is calibration, the SECOND run is the check."""
    if previous is None:
        return [], [], []
    out_by_coarse, in_by_coarse = {}, {}
    for key in sorted(set(previous) - set(current)):
        out_by_coarse.setdefault(coarse_key(key), []).append(key)
    for key in sorted(set(current) - set(previous)):
        in_by_coarse.setdefault(coarse_key(key), []).append(key)
    added, removed, moved = [], [], []
    for coarse, went in out_by_coarse.items():
        came = in_by_coarse.get(coarse, [])
        pairs = min(len(went), len(came))
        moved += list(zip(went[:pairs], came[:pairs]))
        removed += went[pairs:]
    for coarse, came in in_by_coarse.items():
        pairs = min(len(out_by_coarse.get(coarse, [])), len(came))
        added += came[pairs:]
    return sorted(added), sorted(removed), sorted(moved)


# Truncation limits for the PRINTED report only. The file holds the whole set unconditionally, so
# these cost a scroll, never evidence. REMOVALS HAVE NO LIMIT and that asymmetry is the point: a
# removal is either a fix or a loss and no count can tell them apart, so every one has to be
# readable in the run that made it. A wrong ADDITION is a false record, and false records already
# have citation_crosscheck pointed straight at them.
MOVED_SHOWN = 8
ADDED_SHOWN = 20


def record_delta_report(previous, current):
    """Returns (lines to print, the DONE line's clause). The clause is machine-derived for the
    reason every clause here is: a restated one drifts, and this one goes into commit messages."""
    added, removed, moved = record_delta(previous, current)
    if previous is None:
        return ([f'RECORD KEYS INITIALISED: {len(current)} stored — condition (8), a first run is '
                 'calibration and there is nothing to compare against yet; the SECOND run is the '
                 f'first real composition check. git add .claude/{os.path.basename(RATCHET_FILE)}'],
                f'{len(current)} keys initialised (calibration)')
    if not (added or removed or moved):
        return [], 'set unchanged'
    lines = [f'RECORD SET MOVED: {len(added)} added, {len(removed)} removed, {len(moved)} moved '
             f'(line shifts) — the count alone cannot see this, which is why it is printed']
    for key in removed:
        lines.append(f'  - {key}')
    for key in added[:ADDED_SHOWN]:
        lines.append(f'  + {key}')
    if len(added) > ADDED_SHOWN:
        lines.append(f'  + ... {len(added) - ADDED_SHOWN} more additions; '
                     f'git diff .claude/{os.path.basename(RATCHET_FILE)} for the whole set')
    for went, came in moved[:MOVED_SHOWN]:
        lines.append(f'  ~ {went} -> :{came.rsplit(":", 1)[1]}')
    if len(moved) > MOVED_SHOWN:
        lines.append(f'  ~ ... {len(moved) - MOVED_SHOWN} more line shifts')
    parts = []
    if added:
        parts.append(f'{len(added)} added')
    if removed:
        parts.append(f'{len(removed)} removed')
    if moved:
        parts.append(f'{len(moved)} moved')
    return lines, ', '.join(parts)


def load_ratchet(path=None):
    """A MISSING file is a first run. A file that EXISTS AND DOES NOT PARSE is a problem, never a
    silent re-initialisation: resetting the ratchet to nothing would discard the whole protection
    while printing a calibration note, which is precisely the degradation class the crosscheck
    refusal was written to kill. Returns (state or None, problems)."""
    path = path or RATCHET_FILE
    if not os.path.exists(path):
        return {'counts': {}, 'lowers': []}, []
    try:
        state = json.load(open(path, encoding='utf-8'))
        if not isinstance(state.get('counts'), dict):
            raise ValueError("no 'counts' object")
        keys = state.get(RECORD_KEYS)
        if keys is not None and not (isinstance(keys, list)
                                     and all(isinstance(key, str) for key in keys)):
            raise ValueError(f"'{RECORD_KEYS}' is present but is not a list of strings")
    except (OSError, ValueError) as exc:
        return None, [f'RATCHET UNREADABLE: {path} exists but does not parse — {exc}. Refusing to '
                      're-initialise, which would silently discard the ratchet.']
    # THE COUNT AND THE SET IT EXPLAINS ARE WRITTEN TOGETHER BY ONE WRITER, so they can only
    # disagree if the file was hand-edited or a run half-wrote it. Either way the file then holds
    # two different corpora under one name, and the ratchet would be comparing against one while the
    # delta compared against the other. Refuse, same as an unparseable file: absent keys are a first
    # run, but INCOHERENT keys are not a state this tool could have produced.
    keys, stored = state.get(RECORD_KEYS), state['counts'].get(RECORDS_METRIC)
    if keys is not None and stored is not None and len(keys) != stored:
        return None, [f'RATCHET INCOHERENT: {path} stores {stored} for {RECORDS_METRIC} but '
                      f'{len(keys)} record keys. One writer owns both and saves them together, so '
                      'they cannot legitimately disagree.']
    # Sorted ordering is load-bearing (user, 2026-09-06): "or the diff is unreadable", and an
    # unreadable diff is not an audit. The only writer sorts, so an unsorted file is a hand-edit.
    if keys is not None and keys != sorted(keys):
        return None, [f'RATCHET INCOHERENT: {path} stores {RECORD_KEYS} out of sorted order, which '
                      'this tool never writes. Sorted is what makes `git diff` on this file the '
                      'composition audit; unsorted, every commit rewrites every line of it.']
    state.setdefault('lowers', [])
    return state, []


def save_ratchet(state, path=None):
    path = path or RATCHET_FILE
    with open(path, 'w', encoding='utf-8') as handle:
        json.dump(state, handle, indent=1)
        handle.write('\n')


def ratchet_phrase(previous, current, new_value, problems):
    """The DONE line's ratchet clause. Machine-derived, because a restated one would drift."""
    if problems:
        return f'{previous} BREACHED by {current}'
    if previous is None:
        return f'{new_value} initialised (calibration)'
    if new_value > previous:
        return f'{previous}->{new_value} raised'
    if new_value < previous:
        return f'{previous}->{new_value} LOWERED deliberately'
    return f'{new_value} held'


def parse_lower(argv):
    """--lower-ratchet=N --lower-reason="why". Flag-shaped, so the phase parse ignores them.

    Returns (lowers, reason, problems) where `lowers` maps metric key -> value. A BARE `=N` still
    means the extractor's records metric, because that is what every existing invocation and the
    usage block above mean by it; a sidecar metric is addressed as `=<producer>.<metric>:<N>`.
    Keeping the bare form working matters more than uniformity here: the alternative is a flag that
    silently changes meaning for anyone who learned it before the sidecars existed."""
    lowers, reason, problems = {}, None, []
    for arg in argv[1:]:
        if arg.startswith('--lower-ratchet='):
            raw = arg.split('=', 1)[1]
            metric, _, value = raw.rpartition(':')
            metric = metric or RECORDS_METRIC
            try:
                lowers[metric] = int(value)
            except ValueError:
                problems.append(f'BAD FLAG: --lower-ratchet={raw!r} — takes an integer count, '
                                'optionally prefixed <producer>.<metric>: to name a sidecar metric')
        elif arg.startswith('--lower-reason='):
            reason = arg.split('=', 1)[1].strip() or None
    return lowers, reason, problems


# ---- the sidecar reader ------------------------------------------------------------------------
# Ships with its first producer (citation_crosscheck, 2026-09-06), per the convention above: a
# consumer with no producer could only be demonstrated against a fixture, and the standard is
# capability shown on real output.

SIDECAR_PREFIX = 'SIDECAR '


def parse_sidecars(text):
    """Every `SIDECAR {...}` line in one member's output. Returns (sidecars, problems).

    A MALFORMED sidecar is a PROBLEM, never skipped. Skipping is how a producer stops being
    ratcheted by accident: the line is still printed, the run is still green, and nothing is
    watching the number any more. That is the whole failure class this reader was built for, so it
    cannot be the reader's own error path."""
    sidecars, problems = {}, []
    for line in text.split('\n'):
        stripped = line.strip()
        if not stripped.startswith(SIDECAR_PREFIX):
            continue
        raw = stripped[len(SIDECAR_PREFIX):]
        try:
            payload = json.loads(raw)
        except ValueError as exc:
            problems.append(f'BAD SIDECAR: {raw[:80]!r} does not parse — {exc}. A sidecar that '
                            'cannot be read is an unratcheted metric wearing a ratchet.')
            continue
        name = payload.get('name')
        metrics = payload.get('metrics')
        if not isinstance(name, str) or not name:
            problems.append(f'BAD SIDECAR: {raw[:80]!r} has no "name" — the ratchet keys on the '
                            'producer, so an anonymous sidecar cannot be stored')
            continue
        if not isinstance(metrics, dict) or not metrics:
            problems.append(f'BAD SIDECAR: {name} carries no "metrics" object')
            continue
        bad_values = [k for k, v in metrics.items()
                      if not isinstance(v, int) or isinstance(v, bool)]
        if bad_values:
            problems.append(f'BAD SIDECAR: {name} metrics {sorted(bad_values)} are not integers — '
                            'the ratchet compares magnitudes and has nothing to compare')
            continue
        ratchet = payload.get('ratchet', [])
        if not isinstance(ratchet, list) or any(not isinstance(m, str) for m in ratchet):
            problems.append(f'BAD SIDECAR: {name} "ratchet" must be a list of metric names')
            continue
        undeclared = [m for m in ratchet if m not in metrics]
        if undeclared:
            problems.append(f'BAD SIDECAR: {name} asks to ratchet {sorted(undeclared)}, which it '
                            'does not report — a ratchet on an absent metric never fires')
            continue
        sidecars[name] = {'metrics': metrics, 'ratchet': ratchet}
    return sidecars, problems


def sidecar_metric_key(producer, metric):
    """NAMESPACED, and this is load-bearing rather than tidy. citation_crosscheck's sidecar reports
    a metric it calls `records` — its identifier-carrying total — and the extractor's long-standing
    ratchet key is also `records`, holding a much larger number. Unnamespaced, the first live run
    of this reader would have read one producer's metric against the other's stored value and fired
    RATCHET SHRANK on a corpus that had not moved at all. A reader whose first act is a false
    positive teaches people to pass --lower-ratchet, which is the opposite of the point."""
    return f'{producer}.{metric}'


def vanished_ratchets(counts, sidecars, ran):
    """A metric that was ratcheted before and is not declared now. The producer-side loophole in
    the convention: any instrument could stop asking to be ratcheted — drop the entry from its
    `ratchet` array, or stop printing the sidecar entirely — and every later run would pass while
    watching one metric fewer. Same shape as assertion 1 one level in, and closed the same way,
    against COMMITTED state rather than a hand-maintained map of who-reports-what.

    SCOPED TO THE MEMBERS THAT RAN, which is what makes it correct across phases: deploy_check's
    metrics live in the same state file and are legitimately absent from a pre-commit run."""
    problems = []
    for key in sorted(counts):
        producer, sep, metric = key.partition('.')
        if not sep or producer not in ran:
            continue
        declared = sidecars.get(producer, {}).get('ratchet', [])
        if metric in declared:
            continue
        if producer not in sidecars:
            problems.append(
                f'RATCHET ABANDONED: {producer} ran and printed no sidecar, but {key} is '
                'ratcheted in committed state. Either restore the sidecar or remove the stored '
                'metric deliberately — a producer silently dropping its own ratchet is exactly '
                'the hole the sidecar convention was written to close.')
        else:
            problems.append(
                f'RATCHET ABANDONED: {producer} no longer lists {metric!r} in its sidecar '
                f'"ratchet" array, but {key} is ratcheted in committed state. Dropping a metric '
                'from the array turns the ratchet off while the run stays green.')
    return problems


def missing_from_run(expected, results):
    """Assertion 1. `expected` is the phase's declared member names; `results` maps name ->
    (exit_code, marker_seen). A member absent from `results` was never attempted; a member with
    marker_seen False ran without printing its DONE line; a non-zero exit is its own failure."""
    problems = []
    for name in expected:
        if name not in results:
            problems.append(f'NEVER RAN: {name} — declared for this phase and not invoked')
            continue
        code, marker_seen = results[name]
        if not marker_seen:
            problems.append(f'NO DONE LINE: {name} — ran without printing its marker '
                            '(vacuous run; the 7-bis failure)')
        elif code != 0:
            problems.append(f'FAILED: {name} — exit {code}')
    return problems


# ---- preflight -------------------------------------------------------------------------------

def regenerate_records():
    """The v2 records artifact, which citation_polarity and citation_crosscheck both consume.

    It is generated on demand and never committed, so the runner rebuilds it rather than trusting
    whatever is left in TMPDIR from an earlier session — a stale artifact would make both scans
    describe a corpus that no longer exists. citation_crosscheck.py now REFUSES without it
    (2026-09-05: it used to default to an empty list and quietly check 110 records instead of
    142), and regenerating here is what keeps that refusal from ever firing in normal use.

    RETURNS THE SORTED KEY SET, not a count: the count is len() of it. That is deliberate — two
    values derived from one artifact by two expressions is how the count and the set it explains
    come to disagree, and load_ratchet() refuses a file where they do. Here they cannot."""
    os.makedirs(WORK_DIR, exist_ok=True)
    print('--- preflight: regenerating the v2 records artifact')
    proc = subprocess.run(['python3', '.claude/extract_citations.py', RECORDS_ARTIFACT],
                          cwd=REPO_ROOT, capture_output=True, text=True)
    sys.stdout.write(''.join(f'    {line}\n' for line in proc.stdout.split('\n') if line.strip()))
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        return None, [f'PREFLIGHT FAILED: extract_citations.py exit {proc.returncode}']
    try:
        records = json.load(open(RECORDS_ARTIFACT, encoding='utf-8'))
    except Exception as exc:
        return None, [f'PREFLIGHT FAILED: records artifact unreadable — {exc}']
    if not records:
        return None, ['PREFLIGHT FAILED: records artifact is empty — every citation scan '
                      'downstream would be vacuously clean']
    try:
        keys = sorted(record_key(record) for record in records)
    except (KeyError, TypeError) as exc:
        return None, [f'PREFLIGHT FAILED: records artifact has an unexpected shape — {exc}. The '
                      'ratchet keys on (author, year, ref) and cannot key on a record missing one.']
    # THE UNIQUENESS ASSERTION IS ALSO A CHECK ON THE PRODUCER'S DEDUPE, which is the only reason it
    # can fail: this key IS extract_citations.py's dedupe key, so duplicates here mean the extractor
    # narrowed its own notion of a distinct record. That is precisely the silent producer change the
    # ratchet exists for, arriving at the one place where it makes the count and the set disagree.
    if len(set(keys)) != len(keys):
        dupes = sorted({key for key in keys if keys.count(key) > 1})
        return None, [f'PREFLIGHT FAILED: {len(keys) - len(set(keys))} duplicate record keys — the '
                      'extractor dedupes on (author, year, ref), so this means its dedupe key '
                      f'narrowed. First: {dupes[:3]}']
    return keys, []


WRAPPER_SELFTESTS = ('run_checked.sh', 'commit_checked.sh')


def wrapper_selftest_verdict(name, returncode, output):
    """A wrapper selftest passes only if it EXITS ZERO **AND SAYS SO**. Pure, so the arms below can
    drive it without running a wrapper.

    THE MARKER REQUIREMENT IS NOT BELT-AND-BRACES. A wrapper whose `--selftest` branch is deleted, or
    whose `[ "${1:-}" = "--selftest" ]` guard stops matching after an argument-handling edit, falls
    through to its normal path and can exit ZERO having asserted nothing. That is the vacuous-pass
    shape this entire chain is built around, arriving in the two files that have no DONE line of their
    own to check. And it cannot be delegated: run_checked.sh is what refuses a vacuous run everywhere
    else, so it cannot be the thing that certifies itself."""
    if returncode != 0:
        return [f'PREFLIGHT FAILED: {name} --selftest exit {returncode} — the wrapper that guards '
                'every other invocation in this chain is itself broken, so no DONE line below is '
                'worth reading yet']
    if 'SELFTEST PASS' not in output:
        return [f'PREFLIGHT FAILED: {name} --selftest exited 0 but printed no SELFTEST PASS — a '
                'wrapper selftest that asserts nothing passes vacuously, which is the one failure '
                'this preflight exists to refuse']
    return []


#   Vars that REDIRECT git at a repository. Scrubbed from the selftests' environment because
#   commit_checked.sh's selftest runs `git init`, `git add f.txt` and `git commit -qm seed` inside a
#   scratch TMPDIR repo with no git-env isolation of its own (commit_checked.sh:164-166), and a git
#   hook EXPORTS these to everything it runs. Nothing invokes this battery from a hook today — the
#   repo has no hooks installed, only .sample files — so scrubbing them changes nothing measurable
#   now. It is here because THIS PREFLIGHT IS WHAT MAKES THAT SCRATCH COMMIT REACHABLE ON EVERY RUN,
#   `pre-commit` included; the day someone installs the hook the phase name already anticipates,
#   `git add`/`git commit` in the scratch dir would resolve against the REAL index instead. The fix
#   belongs at the new call site rather than in the wrapper: the exposure is a property of who calls
#   it, and the wrapper's own arms are what this preflight is here to run unmodified.
GIT_REDIRECTION_VARS = ('GIT_DIR', 'GIT_INDEX_FILE', 'GIT_WORK_TREE', 'GIT_COMMON_DIR',
                        'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES')


def run_wrapper_selftest(name):
    env = {k: v for k, v in os.environ.items() if k not in GIT_REDIRECTION_VARS}
    proc = subprocess.run(['sh', os.path.join('.claude', name), '--selftest'],
                          cwd=REPO_ROOT, capture_output=True, text=True, env=env)
    return proc.returncode, proc.stdout + proc.stderr


def preflight_wrapper_selftests(wrappers=WRAPPER_SELFTESTS, runner=run_wrapper_selftest,
                                report=print):
    """PRECONDITION, NOT MEMBERSHIP (user ruling, 2026-09-07).

    THE TWO WRAPPERS WERE THE ONLY SELFTESTS NOTHING RAN. Measured before this was written: a
    repo-wide search for either wrapper invoked with `--selftest` returned ZERO matches, while
    eleven instrument selftests execute inside every battery run. Their fifteen arms only ever ran
    when a human typed them, in the two files where being wrong is most expensive — run_checked.sh
    DECIDES VACUITY, and commit_checked.sh WRITES THE PERMANENT RECORD.

    AND THE ARGUMENT IS NOT THE GENERAL PRINCIPLE, IT IS THE DEFECT HISTORY (user): every real defect
    this chain has had lived in one of these two files — `basename` eating `-c`, the `$# -lt 2` gap
    that archived a lie, the sibling polluting the real refusals.log. Nothing that has ever actually
    broken here was caught by an instrument; the wrappers were where it broke.

    WHY A PREFLIGHT RATHER THAN A MEMBER, which was the objection to wiring these in at all: a
    preflight is not declared membership, so INSTRUMENTS is untouched, assertion 2's declared-file
    accounting is untouched, and the DONE line's instrument counts do not move. It is also where a
    precondition belongs — before anything else runs, not alongside it. The extractor preflight
    already established the shape: run it, fail the battery on a bad exit, print under `---`.

    ISOLATION IS THE WRAPPERS' OWN, AND IT IS LOAD-BEARING NOW THAT THIS RUNS EVERY TIME.
    commit_checked.sh's selftest redirects RUN_CHECKED_REFUSAL_LOG and builds a scratch git repo in
    TMPDIR precisely because arms 1 and 3 drive genuine refusals; its header records that it appended
    two invented entries to the real log on the log's first live run. Verified against the real files
    before wiring: both exit 0 in ~2s combined, and the real refusals.log sha, HEAD and dirty-file
    count are unchanged across a run of both.

    REPORT IS INJECTED FOR THE SAME REASON RUNNER IS: arm 20 drives this function with fabricated
    verdicts, and a bare print() there would emit a second `--- preflight:` header into the selftest's
    own output, where a reader scanning a failing run could not tell the fabricated one from the real
    one that runs a few lines into main(). Captured instead, and then asserted on."""
    problems = []
    report('--- preflight: the two wrappers self-test (precondition, not membership)')
    for name in wrappers:
        returncode, output = runner(name)
        fires = wrapper_selftest_verdict(name, returncode, output)
        problems += fires
        if fires:
            # THE WRAPPER'S OWN OUTPUT, not just the verdict: its arms name what they checked, and on
            # a break that text is the only diagnosis available — no instrument downstream reads it.
            for line in output.split('\n'):
                if line.strip():
                    report(f'    {name}: {line}')
        else:
            # BARE next() ON PURPOSE — reaching here means the verdict found the marker, so a
            # StopIteration is a broken verdict, not a wrapper problem. The mutation that proves the
            # marker clause is load-bearing raises exactly this, which is the useful direction: the
            # `next(..., None)` form would have printed `    commit_checked.sh: None` and carried on.
            summary = next(line for line in output.split('\n') if 'SELFTEST PASS' in line)
            report(f'    {name}: {summary}')
    return problems


def start_dev_server():
    """regress.js expects a server already listening; it does not start one. Starting it here is
    what makes a full battery run a single command. If it fails to come up, regress cannot reach
    the page, prints no DONE line, and assertion 1 fails the battery by name — fail-closed
    without any extra check, which is the right amount of machinery for this."""
    proc = subprocess.Popen(['python3', '.claude/nocache_server.py', REGRESS_PORT],
                            cwd=REPO_ROOT, stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL, start_new_session=True)
    url = f'http://127.0.0.1:{REGRESS_PORT}/cancer-atlas.html'
    for _attempt in range(40):
        try:
            urllib.request.urlopen(url, timeout=1).read(1)
            return proc
        except (urllib.error.URLError, OSError):
            time.sleep(0.25)
    return proc      # never came up; regress will fail and say so


def stop_dev_server(proc):
    if proc is None:
        return
    try:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except (ProcessLookupError, PermissionError):
        proc.terminate()


# ---- running ---------------------------------------------------------------------------------

def marker_reported(marker, text):
    """Did the member actually PRINT its DONE line, as opposed to merely mentioning it?

    ANCHORED AT LINE START, and the anchoring is the whole point. This used to be `marker in
    combined` — a bare substring over output that also carries PROSE: selftest arm descriptions,
    PROBLEM messages, and anything the member echoes. A member whose arm reads
    `ok   fires when DONE battery: is absent` would satisfy an unanchored test while printing no
    DONE line at all, which is the vacuous run this whole wrapper chain exists to refuse — reachable
    through the matcher that decides whether a run was vacuous.

    Three lines above, the PRINTER already anchors (`line.startswith('DONE ')`), and it was anchored
    deliberately in 2026-09-06 for the identical reason. The two disagreed: the printer knew a DONE
    line is a line, the reporter thought it was a string anywhere. Same file, same variable, three
    lines apart. Anchoring here is safe on measurement rather than on argument: across a full
    pre-commit run all 13 markers occur exactly once each and every occurrence is already at column
    0, so nothing that passes today stops passing."""
    return any(line.startswith(marker) for line in text.split('\n'))


def run_member(name, marker, argv):
    """One instrument, through run_checked.sh — the member's own DONE-marker obligation is
    enforced by the existing wrapper rather than re-implemented here. Output is streamed with the
    member's name prefixed so a long battery log stays readable, and DONE lines are passed through
    UNCHANGED so `commit_checked.sh "<subject>" "DONE "` can quote every one of them verbatim."""
    print(f'--- {name}')
    proc = subprocess.run(['sh', '.claude/run_checked.sh', marker] + argv,
                          cwd=REPO_ROOT, capture_output=True, text=True)
    combined = proc.stdout + proc.stderr
    for line in combined.split('\n'):
        if not line.strip():
            continue
        # DONE lines unindented and unmodified: they are quoted into commit messages by grep.
        # BY FORM, not by this member's declared marker (2026-09-06). Indenting is what decides
        # whether commit_checked.sh's anchored matcher can see a line, so the two have to agree on
        # what a DONE line IS or the printer silently hides output from the record. Marker-based
        # indenting already had a latent instance: a member whose selftest prints
        # `DONE <name>_selftest:` does not contain its own marker `DONE <name>:`, so it was indented
        # and would be dropped — deploy_check's is exactly that shape. Same two forms as
        # .claude/commit_checked.sh's DONE_LINE_RE, duplicated knowingly and named there too.
        is_done = line.startswith('DONE ') or line.startswith('==== DONE')
        print(line if is_done else f'    {line}')
    # The output is returned so the sidecar reader can parse STRUCTURE out of it. Note what is
    # NOT returned to that reader's caller: any interpretation of the human DONE line. The
    # sidecar is a separate channel on purpose.
    return proc.returncode, marker_reported(marker, combined), combined


# ---- selftest --------------------------------------------------------------------------------

def selftest():
    ok = True
    arms = 0
    failures = 0

    def say(good, message):
        nonlocal ok, arms, failures
        ok = ok and good
        arms += 1
        if not good:
            failures += 1
        print(f"  {'ok  ' if good else 'FAIL'} {message}")

    # arm 1: THE FAILURE THIS TOOL EXISTS FOR — a declared member absent from the run.
    say(any('NEVER RAN' in p for p in missing_from_run(
        ['a', 'b'], {'a': (0, True)})),
        'fires when a declared member never ran (the polarity shape: dead instrument, '
        'battery still green)')
    # arm 2: a member that ran and printed no marker — the 7-bis failure, distinct from arm 1
    # because "attempted" and "reported" are different claims and only the second is a check.
    say(any('NO DONE LINE' in p for p in missing_from_run(['a'], {'a': (0, False)})),
        'fires when a member runs without printing its DONE line')
    # arm 3: a member that reported and failed must still fail the battery
    say(any('FAILED' in p for p in missing_from_run(['a'], {'a': (1, True)})),
        'fires when a member reports and exits non-zero')
    # arm 4: the passing direction — a complete phase must be silent, or the battery is stuck
    # failing and nobody would keep running it.
    say(not missing_from_run(['a', 'b'], {'a': (0, True), 'b': (0, True)}),
        'passes when every declared member ran, reported, and exited zero')

    # arm 5: assertion 2 fires on an undeclared file — the staleness hole record_sync_check.py
    # admits to in its own map, closed here by making the list total over the directory.
    say(any('UNDECLARED' in p for p in undeclared_files(
        {'known.py', 'brand_new_check.py'}, {'known.py'}, {})),
        'fires on a tracked .claude/ file that is neither instrument nor declared tool')
    # arm 6: and on the reverse half — a declaration pointing at a file that is gone
    say(any('DECLARED BUT ABSENT' in p for p in undeclared_files(
        {'known.py'}, {'known.py', 'deleted_check.py'}, {}, present_on_disk={'known.py'})),
        'fires on a declaration whose file no longer exists (stale in the other direction)')
    # arm 6b: the same half, but the file EXISTS and is merely unstaged — a different problem, and
    # the one this runner hit on itself the first time it ran.
    say(any('NOT TRACKED' in p for p in undeclared_files(
        {'known.py'}, {'known.py', 'new_check.py'}, {},
        present_on_disk={'known.py', 'new_check.py'})),
        'distinguishes a declared-but-unstaged file from a stale declaration')
    say(not undeclared_files({'a.py', 'b.json'}, {'a.py'}, {'b.json': 'data'}),
        'passes a fully declared directory')

    # arm 7: assertion 3 — a typo in a phase name silently retires an instrument, which is the
    # tool's own failure mode reintroduced through its own declaration.
    say(unphased_instruments([('x', 'pre_commit', 'DONE x:', [])], PHASES),
        'fires on an instrument declared with a phase that does not exist')
    say(not unphased_instruments(INSTRUMENTS, PHASES),
        'the live instrument list has no unphased member')

    # arm 8: the live declarations must actually be total over the live directory. This is the
    # one arm that reads real state, and it is the arm that will fail on the day someone adds an
    # instrument without declaring it — which is the point.
    live = undeclared_files(tracked_claude_files(), declared_instrument_files(), NON_INSTRUMENTS,
                            present_on_disk=present_claude_files())
    say(not live, f'the live .claude/ directory is fully declared '
                  f'({len(tracked_claude_files())} tracked files)'
                  + ('' if not live else f' — {live}'))
    # arm 9: every phase has at least one member, so `battery.py <phase>` can never be a no-op
    # run that exits zero having checked nothing.
    for phase in PHASES:
        members = [n for n, p, _m, _a in INSTRUMENTS if p == phase]
        say(bool(members), f'phase {phase!r} has declared members ({len(members)})')

    # arm 10: assertion 4, the ratchet, in every direction. The load-bearing arm is the SHRINK BY
    # ONE: "material" is defined as any decrease, so a check that only fired on a large drop would
    # be a tolerance band nobody declared.
    say(any('SHRANK' in p for p in ratchet_verdict('records', 408, 407)[0]),
        'fires on a shrink of ONE (any decrease is material — the extractor is deterministic, '
        'so there is no noise band)')
    say(any('SHRANK' in p for p in ratchet_verdict('records', 408, 300)[0]),
        'fires on the named hole exactly: 300 records where 408 stood')
    grow_problems, grow_value, grow_notes = ratchet_verdict('records', 408, 450)
    say(not grow_problems and grow_value == 450 and any('RAISED' in n for n in grow_notes),
        'growth never trips it and moves the stored value up automatically (408 -> 450)')
    hold_problems, hold_value, _hold_notes = ratchet_verdict('records', 408, 408)
    say(not hold_problems and hold_value == 408, 'an unchanged count holds, silently')
    # the deliberate step over the gap: allowed, but only with a reason, and still checked
    low_problems, low_value, low_notes = ratchet_verdict('records', 408, 380, lower_to=380,
                                                        lower_reason='two removed under '
                                                                     'source-or-remove')
    say(not low_problems and low_value == 380 and any('LOWERED' in n for n in low_notes),
        'accepts an explicit lower WITH a reason and records it')
    say(any('LOWER REFUSED' in p for p in ratchet_verdict('records', 408, 380, lower_to=380)[0]),
        'refuses a lower with no reason (a reasonless lower is a floor being moved quietly)')
    say(any('SHRANK' in p for p in ratchet_verdict('records', 408, 300, lower_to=380,
                                                   lower_reason='declared')[0]),
        'a lower still gets checked: lowering to 380 on a corpus of 300 fires anyway')
    first_problems, first_value, first_notes = ratchet_verdict('records', None, 408)
    say(not first_problems and first_value == 408 and any('INITIALISED' in n for n in first_notes),
        'a first run initialises without failing, and says it is calibration (condition (8))')
    # arm 11: a present-but-corrupt state file must be a PROBLEM, not a silent re-initialisation.
    corrupt = os.path.join(tempfile.mkdtemp(), 'record_count.json')
    open(corrupt, 'w').write('{ not json')
    corrupt_state, corrupt_problems = load_ratchet(corrupt)
    say(corrupt_state is None and any('UNREADABLE' in p for p in corrupt_problems),
        'a corrupt ratchet file is a problem, not a reset (discarding the floor silently is the '
        'degradation class, not a recovery)')
    missing_state, missing_problems = load_ratchet(os.path.join(os.path.dirname(corrupt), 'nope.json'))
    say(missing_state == {'counts': {}, 'lowers': []} and not missing_problems,
        'an absent ratchet file is a first run, not a failure')

    # arm 12: THE MARKER TEST IS ANCHORED. Written to FAIL against the `marker in combined` this
    # replaced, which is what earns it a place instead of restating the fix. The refusing direction
    # is a member that MENTIONS its marker in prose and prints no DONE line — a vacuous run wearing
    # the marker, which the unanchored test accepted.
    prose_only = ('  ok   fires when DONE battery: is absent\n'
                  '  ok   a PROBLEM naming DONE battery: is still not a DONE line')
    say(not marker_reported('DONE battery:', prose_only),
        'a member that only MENTIONS its marker in prose is not counted as having reported')
    say(marker_reported('DONE battery:', prose_only + '\nDONE battery: phase x — 1/1'),
        'the same output WITH a real DONE line does report (the anchor did not just break it)')
    say(marker_reported('==== DONE:', 'noise\n==== DONE: 169 checks, 2 failures ====')
        and not marker_reported('==== DONE:', 'see ==== DONE: below'),
        "regress's marker form anchors the same way (it is not a DONE-prefixed line)")

    # arm 13: the SIDECAR READER. The passing direction first, on a line in the shape its first
    # producer actually prints, so this arm fails if that format ever drifts.
    good_line = ('DONE citation_crosscheck: 1 records checked, 0 flags\n'
                 'SIDECAR {"metrics": {"flags": 0, "records": 1}, '
                 '"name": "citation_crosscheck", "ratchet": ["records"]}')
    parsed, parse_problems = parse_sidecars(good_line)
    say(not parse_problems and parsed.get('citation_crosscheck', {}).get('ratchet') == ['records']
        and parsed['citation_crosscheck']['metrics']['flags'] == 0,
        'reads a well-formed sidecar and leaves the human DONE line alone')
    say(parse_sidecars('DONE something: 3 things, 0 problems') == ({}, []),
        'output with no sidecar is not a problem (nine instruments have not been retrofitted, '
        'and the convention says do not sweep them)')
    # every malformed direction is a PROBLEM rather than a skip: a skipped sidecar is a metric that
    # silently stops being watched, which is the failure this reader exists to prevent.
    for label, line in [
            ('unparseable JSON', 'SIDECAR {not json'),
            ('no name', 'SIDECAR {"metrics": {"a": 1}}'),
            ('no metrics', 'SIDECAR {"name": "x"}'),
            ('a non-integer metric', 'SIDECAR {"name": "x", "metrics": {"a": "many"}}'),
            ('a boolean posing as a count', 'SIDECAR {"name": "x", "metrics": {"a": true}}'),
            ('a ratchet on an unreported metric',
             'SIDECAR {"name": "x", "metrics": {"a": 1}, "ratchet": ["b"]}')]:
        found, found_problems = parse_sidecars(line)
        say(bool(found_problems) and not found, f'refuses a sidecar with {label}')

    # arm 14: the namespacing, which is the collision this reader would have shipped with. The two
    # metrics are both called "records" and hold different numbers.
    say(sidecar_metric_key('citation_crosscheck', 'records') != RECORDS_METRIC,
        "a producer's `records` metric cannot collide with the extractor's `records` ratchet "
        '(unnamespaced, the reader\'s first live run would have fired SHRANK on a corpus that '
        'had not moved)')

    # arm 15: the producer-side loophole — a metric that was ratcheted and is not declared now.
    say(any('RATCHET ABANDONED' in p for p in vanished_ratchets(
        {'citation_crosscheck.records': 142},
        {'citation_crosscheck': {'metrics': {'records': 142}, 'ratchet': []}},
        {'citation_crosscheck'})),
        'fires when a producer drops a metric from its own "ratchet" array (turning the ratchet '
        'off while the run stays green)')
    say(any('printed no sidecar' in p for p in vanished_ratchets(
        {'citation_crosscheck.records': 142}, {}, {'citation_crosscheck'})),
        'fires when a producer with a ratcheted metric stops printing its sidecar entirely')
    say(not vanished_ratchets(
        {'citation_crosscheck.records': 142},
        {'citation_crosscheck': {'metrics': {'records': 142}, 'ratchet': ['records']}},
        {'citation_crosscheck'}),
        'passes while the metric is still declared')
    say(not vanished_ratchets({'deploy_check.assets': 27}, {}, {'citation_crosscheck'}),
        "does NOT fire on another phase's stored metrics (deploy_check is post-push and is "
        'legitimately absent from a pre-commit run)')
    say(not vanished_ratchets({RECORDS_METRIC: 408}, {}, {'citation_crosscheck'}),
        "does NOT fire on the extractor's un-namespaced metric, which has no producer to run")

    # arm 16: the lower flag, both address forms. The bare form is load-bearing: it is what the
    # usage block documents and what every existing invocation means, so a reader that quietly
    # repurposed it would break a documented flag to gain uniformity.
    bare_lowers, bare_reason, bare_problems = parse_lower(
        ['battery.py', 'pre-commit', '--lower-ratchet=406', '--lower-reason=two dropped'])
    say(bare_lowers == {RECORDS_METRIC: 406} and bare_reason == 'two dropped' and not bare_problems,
        "a bare --lower-ratchet=N still addresses the extractor's records metric")
    keyed_lowers, _keyed_reason, keyed_problems = parse_lower(
        ['battery.py', 'pre-commit', '--lower-ratchet=citation_crosscheck.records:140'])
    say(keyed_lowers == {'citation_crosscheck.records': 140} and not keyed_problems,
        '--lower-ratchet=<producer>.<metric>:N addresses one sidecar metric')
    say(any('BAD FLAG' in p for p in parse_lower(['battery.py', '--lower-ratchet=lots'])[2]),
        'refuses a non-integer lower rather than ignoring the flag')

    # arm 17: THE COMPOSITION DELTA, and its load-bearing arm is the FLAT COUNT — condition (7)
    # applied to the one failure this was built for. The keys below are the REAL ones from d54bd1a,
    # transcribed, so an arm failing points at a commit that happened rather than at a hypothesis.
    d54_before = ['Fontugne|2015|js/organs/prostate.js:204', 'Park|2010|js/organs/bladder.js:27',
                  'Travis|2011|js/organs/lungs.js:236']
    d54_after = ['TCGA|2015|js/organs/prostate.js:205', 'TCGA|2015|js/organs/prostate.js:231',
                 'Travis|2011|js/organs/lungs.js:236']
    flat_added, flat_removed, flat_moved = record_delta(d54_before, d54_after)
    say(len(flat_added) == 2 and len(flat_removed) == 2 and not flat_moved
        and len(d54_before) == len(d54_after),
        'reports 2 added and 2 removed on the d54bd1a shape — a count that did not move at all '
        '(the blind spot this closes)')
    flat_lines, flat_clause = record_delta_report(d54_before, d54_after)
    say('2 added' in flat_clause and '2 removed' in flat_clause,
        f'and the DONE line carries it into the commit message ({flat_clause!r})')
    say(all(any(key in line for line in flat_lines) for key in flat_removed),
        'every removal is printed individually — the standing procedure is to read each one')
    say(record_delta(d54_after, d54_after) == ([], [], [])
        and record_delta_report(d54_after, d54_after)[1] == 'set unchanged',
        'an unchanged set is silent and says so (the gate is not stuck reporting movement)')
    say(record_delta(None, d54_after) == ([], [], [])
        and 'calibration' in record_delta_report(None, d54_after)[1],
        'a first run is calibration, not one spurious addition per record (condition (8))')
    # A LINE SHIFT MUST NOT PRESENT AS A REMOVAL, or one formatting commit floods the removal list
    # and the discipline of reading it dies of noise.
    shifted = record_delta(['Travis|2011|js/organs/lungs.js:236'],
                           ['Travis|2011|js/organs/lungs.js:239'])
    say(shifted == ([], [], [('Travis|2011|js/organs/lungs.js:236',
                              'Travis|2011|js/organs/lungs.js:239')]),
        'a same-file line shift is reported as MOVED, not as a removal plus an addition')
    # ...and the pairing must not let a move swallow a real removal in the same file.
    both = record_delta(['Travis|2011|js/organs/lungs.js:236', 'Travis|2011|js/organs/lungs.js:225'],
                        ['Travis|2011|js/organs/lungs.js:239'])
    say(len(both[1]) == 1 and len(both[2]) == 1 and not both[0],
        'a move does not swallow a real removal under the same author, year and file')
    say(record_key({'author': 'TCGA', 'year': '2015', 'ref': 'js/organs/prostate.js:205'})
        != record_key({'author': 'TCGA', 'year': '2015', 'ref': 'js/organs/prostate.js:231'}),
        "the key is the extractor's dedupe key: two records differing only in ref stay distinct "
        '(one field narrower and both records d54bd1a added collapse into one)')
    # arm 18: the state file's own coherence, both refusals, shown able to FIRE.
    incoherent = os.path.join(tempfile.mkdtemp(), 'record_count.json')
    open(incoherent, 'w').write('{"counts": {"records": 3}, "record_keys": ["a|1|f:1"]}')
    inc_state, inc_problems = load_ratchet(incoherent)
    say(inc_state is None and any('INCOHERENT' in p for p in inc_problems),
        'refuses a file whose count and key set disagree (two corpora under one name)')
    open(incoherent, 'w').write('{"counts": {"records": 2}, "record_keys": ["b|1|f:1", "a|1|f:1"]}')
    unsorted_state, unsorted_problems = load_ratchet(incoherent)
    say(unsorted_state is None and any('INCOHERENT' in p for p in unsorted_problems),
        'refuses UNSORTED keys — sorted ordering is what makes the diff the audit')
    open(incoherent, 'w').write('{"counts": {"records": 2}, "record_keys": ["a|1|f:1", "b|1|f:1"]}')
    coherent_state, coherent_problems = load_ratchet(incoherent)
    say(coherent_state is not None and not coherent_problems
        and coherent_state[RECORD_KEYS] == ['a|1|f:1', 'b|1|f:1'],
        'and loads a coherent one clean (the refusals are not unconditional)')

    # arm 19: ASSERTION 5, the .gitignore prose shape, in both directions and on the parse the DONE
    # line's count is taken from. Two sub-arms are load-bearing and both were checked by mutation
    # rather than assumed. Deleting the predicate makes the FIRE sub-arm fail, which is what earns
    # this arm a place. And the TAB case separates `len(split()) == 1` from the naive `no space
    # anywhere` reading of the ruling's words: a tab-separated comment contains whitespace, so it is
    # prose and must not fire — the space-only test would flag it. (The .strip() in the parse is NOT
    # one of them: split() normalises whitespace itself, and removing the strip changed no arm.)
    parsed_ignore = gitignore_comments('# .claude/refusals.log\n'
                                       '# EXCEPT ONE, and it is an evidence archive\n'
                                       '*.log\n'
                                       '#  .DS_Store  \n'
                                       '# macOS\tdroppings\n')
    say([n for n, _c in parsed_ignore] == [1, 2, 4, 5],
        'every comment line is parsed with its own line number, and pattern lines are not comments '
        '(a count over patterns would not mean what it says)')
    ignore_fires = gitignore_bare_path_comments(parsed_ignore)
    say(len(ignore_fires) == 2
        and any('.claude/refusals.log' in p for p in ignore_fires)
        and any('.DS_Store' in p for p in ignore_fires),
        'fires on a bare-path comment and on a whitespace-padded one (git strips trailing '
        'whitespace, so the padded body is a pattern too), and not on the prose beside them')
    say(not any('macOS' in p for p in ignore_fires),
        'a comment whose words are separated by a TAB is prose, not a bare path (whitespace, not '
        'the space character)')
    say(not gitignore_bare_path_comments(gitignore_comments('#\n#   \n')),
        'a hash with nothing after it is not a bare path (an empty comment names no file)')

    # arm 20: THE WRAPPER-SELFTEST PREFLIGHT. The load-bearing sub-arm is the VACUOUS one — exit 0
    # with no SELFTEST PASS — and it is load-bearing for the usual reason: deleting the marker clause
    # from wrapper_selftest_verdict leaves the exit-code sub-arm green, so without this the preflight
    # would accept a wrapper whose --selftest branch had stopped matching. Driven through the injected
    # runner rather than by running the real wrappers, because an arm that shells out twice would make
    # the battery's own selftest depend on the thing it is checking; the real invocation is the
    # preflight's job, and it happens a few lines into main() on every run.
    say(wrapper_selftest_verdict('w.sh', 0, 'arm 1 ok\nSELFTEST PASS — refuses a vacuous run') == [],
        'a wrapper that exits zero AND says SELFTEST PASS is a clean precondition')
    say(len(wrapper_selftest_verdict('w.sh', 2, 'SELFTEST PASS')) == 1,
        'a non-zero exit fires even when the marker is present (the wrapper that guards every other '
        'invocation is itself broken)')
    vacuous = wrapper_selftest_verdict('w.sh', 0, 'usage: w.sh <marker> <command...>\n')
    say(len(vacuous) == 1 and 'no SELFTEST PASS' in vacuous[0],
        'AN EXIT OF ZERO WITH NO MARKER FIRES — a --selftest branch that stopped matching falls '
        'through to the normal path and asserts nothing, which is a vacuous pass in the two files '
        'that have no DONE line of their own')
    fake = {'run_checked.sh': (0, 'arm 1 ok\nSELFTEST PASS — refuses a vacuous run'),
            'commit_checked.sh': (0, 'usage: commit_checked.sh <subject> <marker> <gate...>')}
    said = []
    fake_fires = preflight_wrapper_selftests(tuple(fake), lambda n: fake[n], said.append)
    say(len(fake_fires) == 1 and 'commit_checked.sh' in fake_fires[0],
        'the preflight runs BOTH wrappers and returns the problems of either, so one clean wrapper '
        'cannot cover for its sibling')
    say(any('SELFTEST PASS — refuses a vacuous run' in line for line in said)
        and any('usage: commit_checked.sh' in line for line in said),
        "the report carries each wrapper's own words — the passing one's marker line, and on a break "
        'its whole output, which is the only diagnosis anything downstream will get')

    print('SELFTEST', 'PASS — fires on a missing member, a vacuous member, a failing member, '
          'an undeclared file, a stale declaration, a bad phase, a shrinking corpus, a corpus that '
          'changed composition under a flat count, a malformed sidecar, an abandoned ratchet, a '
          'prose mention posing as a DONE line, a bare-path comment in .gitignore and a wrapper '
          'selftest that exits zero without asserting anything; '
          'passes complete sets'
          if ok else 'FAIL — do not trust a green battery from this build')
    # 7-bis applies to the selftest as well (deploy_check.js's precedent): a selftest that never
    # executed must not be indistinguishable from one that passed.
    print(f'DONE battery_selftest: {arms} arms run, {failures} failures')
    return ok


# ---- main ------------------------------------------------------------------------------------

def main(argv):
    if not selftest():
        return 1
    if '--selftest' in argv:
        return 0
    phase = next((a for a in argv[1:] if not a.startswith('-')), None)
    if phase not in PHASES:
        print(f'usage: battery.py [{" | ".join(PHASES)}] [--selftest]', file=sys.stderr)
        return 2

    problems = []
    # FIRST, BEFORE ANY MEMBER OR THE OTHER PREFLIGHT (user ruling: a precondition belongs before
    # everything else, not alongside it). Unconditional across every phase, because the two wrappers
    # guard every phase.
    problems += preflight_wrapper_selftests()
    problems += undeclared_files(tracked_claude_files(), declared_instrument_files(),
                                 NON_INSTRUMENTS, present_on_disk=present_claude_files())
    problems += unphased_instruments(INSTRUMENTS, PHASES)
    # UNGUARDED open() ON PURPOSE. If .gitignore ever goes missing this raises and the battery prints
    # no DONE line at all, which run_checked.sh already treats as a refusal. The alternative — treat an
    # absent file as zero comments — would print "0/0 are prose" and pass, i.e. a green report over a
    # file nobody read. Loud is the acceptable direction here; silent is the one this chain refuses.
    with open(os.path.join(REPO_ROOT, '.gitignore'), encoding='utf-8') as handle:
        gitignore_comment_lines = gitignore_comments(handle.read())
    # The fires are kept, not just added to problems, because the DONE line has to report PROSE OVER
    # TOTAL. Printing "none a bare path" from the count alone would be a verdict the clause never
    # conditioned on: this line still prints on a failing run, so it would state "none" while a
    # BARE-PATH COMMENT problem sat three lines above it.
    gitignore_fires = gitignore_bare_path_comments(gitignore_comment_lines)
    problems += gitignore_fires

    members = [(n, m, a) for n, p, m, a in INSTRUMENTS if p == phase]
    needs_records = any(RECORDS_ARTIFACT in a for _n, _m, a in members)
    needs_server = any('.claude/regress.js' in a for _n, _m, a in members)

    lowers, lower_reason, flag_problems = parse_lower(argv)
    problems += flag_problems

    # ONE state object for both ratchet paths — the extractor's metric and every sidecar metric —
    # and one save at the end, so a run cannot half-write the file.
    state, load_problems = load_ratchet()
    problems += load_problems
    ratchet_dirty = False

    record_count = None
    ratchet_clause = 'n/a'
    delta_clause = 'n/a'
    if needs_records:
        current_keys, preflight_problems = regenerate_records()
        problems += preflight_problems
        record_count = None if current_keys is None else len(current_keys)
        if preflight_problems:
            # Downstream citation scans would be vacuously clean; do not run them at all rather
            # than print two green DONE lines over an empty corpus.
            members = [(n, m, a) for n, m, a in members if RECORDS_ARTIFACT not in a]
        elif state is None:
            ratchet_clause = delta_clause = 'UNREADABLE'
        else:
            previous = state['counts'].get(RECORDS_METRIC)
            ratchet_problems, new_value, notes = ratchet_verdict(
                RECORDS_METRIC, previous, record_count, lowers.get(RECORDS_METRIC), lower_reason)
            problems += ratchet_problems
            for note in notes:
                print(f'    {note}')
            ratchet_clause = ratchet_phrase(previous, record_count, new_value, ratchet_problems)
            if not ratchet_problems and new_value != previous:
                if RECORDS_METRIC in lowers:
                    state['lowers'].append({'metric': RECORDS_METRIC, 'from': previous,
                                            'to': lowers[RECORDS_METRIC], 'count': record_count,
                                            'reason': lower_reason})
                state['counts'][RECORDS_METRIC] = new_value
                ratchet_dirty = True
            # THE COMPOSITION DELTA. Reported whatever the count did — that is the entire point, and
            # the flat-count case is the one it was built for.
            delta_lines, delta_clause = record_delta_report(state.get(RECORD_KEYS), current_keys)
            for line in delta_lines:
                print(f'    {line}')
            # A HOLD DOES NOT MOVE THE COUNT AND SO USED NOT TO WRITE THE FILE AT ALL, which is
            # exactly the case the keys exist for: d54bd1a held at 490 and moved four records. So the
            # key set is its own dirty trigger. GATED ON THE RATCHET NOT FIRING for the same reason
            # the count is: a run whose corpus shrank without a declared reason must not quietly
            # advance the baseline, or the next run reports no delta for a shrink nobody accepted.
            if not ratchet_problems and state.get(RECORD_KEYS) != current_keys:
                state[RECORD_KEYS] = current_keys
                ratchet_dirty = True

    server = start_dev_server() if needs_server else None
    results, outputs = {}, {}
    try:
        for name, marker, argv_member in members:
            code, marker_seen, text = run_member(name, marker, argv_member)
            results[name] = (code, marker_seen)
            outputs[name] = text
    finally:
        stop_dev_server(server)

    problems += missing_from_run([n for n, _m, _a in members], results)

    # ---- sidecars ------------------------------------------------------------------------------
    # Read only from members that RAN, REPORTED AND EXITED ZERO. That scoping is deliberate in both
    # directions. A failing member is already failing by name, and its absent sidecar is a
    # CONSEQUENCE of that failure, not an independent finding — citation_crosscheck's own new abort
    # path exits before printing one, so an unscoped reader would add "you dropped your ratchet" on
    # top of the real diagnosis and point at the wrong thing. And it opens no loophole: a producer
    # that quietly stops ratcheting a metric still reports and still exits zero, so it is still in
    # scope and still caught below.
    reported_clean = {name for name, (code, seen) in results.items() if seen and code == 0}
    sidecars = {}
    for name in sorted(reported_clean):
        parsed, parse_problems = parse_sidecars(outputs[name])
        problems += parse_problems
        for producer, payload in parsed.items():
            if producer != name:
                problems.append(
                    f'SIDECAR MISATTRIBUTED: {name} printed a sidecar naming {producer!r}. The '
                    'ratchet keys on the producer, so a member writing under another name would '
                    "compare its own numbers against a different instrument's stored value.")
                continue
            sidecars[producer] = payload

    problems += vanished_ratchets(state['counts'] if state else {}, sidecars, reported_clean)

    ratcheted_metrics = 0
    if state is not None:
        for producer in sorted(sidecars):
            payload = sidecars[producer]
            for metric in payload['ratchet']:
                key = sidecar_metric_key(producer, metric)
                previous = state['counts'].get(key)
                current = payload['metrics'][metric]
                metric_problems, new_value, notes = ratchet_verdict(
                    key, previous, current, lowers.get(key), lower_reason)
                problems += metric_problems
                for note in notes:
                    print(f'    {note}')
                ratcheted_metrics += 1
                if not metric_problems and new_value != previous:
                    if key in lowers:
                        state['lowers'].append({'metric': key, 'from': previous,
                                                'to': lowers[key], 'count': current,
                                                'reason': lower_reason})
                    state['counts'][key] = new_value
                    ratchet_dirty = True

    if state is not None and ratchet_dirty:
        save_ratchet(state)

    print()
    for problem in problems:
        print(f'  {problem}')
    declared_for_phase = sum(1 for _n, p, _m, _a in INSTRUMENTS if p == phase)
    reported = sum(1 for code, seen in results.values() if seen and code == 0)
    # DONE line last (7-bis). REPORTED-over-DECLARED, not a bare total — deploy_check.js printed
    # "27 assets byte-matched" on a run where four demonstrably had not, in the one instrument
    # whose whole purpose was refusing a green-looking summary. The lesson generalises: a count
    # in a DONE line must name its denominator.
    # "reported", NOT "reported clean": regress.js exits 0 carrying two KNOWN label-overlap
    # failures, so a battery line claiming clean would be false on every green run. The runner
    # counts marker-printed-and-exit-zero and says exactly that; each member's own DONE line
    # carries its own findings, quoted verbatim, which is where the numbers belong.
    print(f'DONE battery: phase {phase} — {reported}/{declared_for_phase} declared instruments '
          f'ran and reported (marker printed, exit 0), {len(INSTRUMENTS)} declared in total, '
          f'{len(tracked_claude_files())} .claude/ files all declared, '
          f'{len(gitignore_comment_lines) - len(gitignore_fires)}/'
          f'{len(gitignore_comment_lines)} .gitignore comments are prose not bare paths, '
          f'{record_count if record_count is not None else "n/a"} citation records extracted '
          f'(ratchet {ratchet_clause}; {delta_clause}), '
          f'{len(sidecars)}/{len(reported_clean)} reporting members '
          f'emitted a sidecar, {ratcheted_metrics} sidecar metrics ratcheted, '
          f'{len(problems)} problems')
    return 1 if problems else 0


if __name__ == '__main__':
    if shutil.which('git') is None:
        print('battery: git is required (assertion 2 reads the index)', file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv))
