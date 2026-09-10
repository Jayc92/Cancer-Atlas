#!/bin/sh
# commit_checked.sh (2026-09-05) — the DONE-quote practice as a MECHANISM, not a habit.
#
# THE FAILURE IT CLOSES: run_checked.sh guards the RUN — a gate that prints no DONE marker
# exits non-zero and cannot pass silently. Nothing guarded the COMMIT. On 4b2c8c5 the wrapped
# regression crashed (HARNESS ERROR, no DONE line, wrapper exit 3, exactly as designed), the
# shell variable holding its output was EMPTY, and the commit was made and pushed anyway with
# an empty gate quote in its message — shipping a SyntaxError to the live site. The wrapper
# did its job; the step AFTER the wrapper had no mechanism at all.
#
# The standing rule was: paste the gate's DONE line verbatim into the commit message, never
# restate its numbers, because a quote cannot drift. That rule was enforced by remembering it.
# Here it is enforced by construction: THIS SCRIPT RUNS THE GATE AND WRITES THE QUOTE ITSELF.
# The message's numbers are copied from the run by machine, so they can neither drift from it
# nor be silently absent — the two ways the practice has failed, once each.
#
# THE GENERALISATION, WHICH REACHES PAST COMMIT MESSAGES (user ruling, 2026-09-08). Quoting the
# machine instead of restating it is the special case of a rule about any verification claim:
# NAME THE POPULATION MEASURED, NOT THE CONCLUSION DRAWN. This script makes cheating impossible
# for the numbers it writes, because they are copied. A report written by hand can still cheat,
# and did.
#
#   THE FAILURE THAT NAMES IT, and it is a different failure from 4b2c8c5 above: personal files
#   were to be moved out of this repo's work tree. The report said EIGHT ITEMS OUT OF TREE. The
#   measurement was EIGHT FILES ABSENT FROM THEIR OLD PATHS — a relative mv had put them INSIDE
#   the tree, so every individual step was true, the conclusion was false, and it stood for three
#   days on a safety-relevant action. Written under this rule the report would have had to say
#   the second sentence, and the second sentence VISIBLY DOES NOT ESTABLISH THE FIRST. That is
#   the whole value: the gap becomes readable without anyone needing to be suspicious of it.
#   (eff40fa's message records the incident; nothing is restated from it here.)
#
#   THE TELL, since nothing can force a sentence to be as narrow as its evidence: THE CONCLUSION
#   IS THE ONE YOU WANTED. A check that confirms an expectation gets read as confirming the
#   claim, and the gap is invisible precisely because nobody is looking for it. So an expected
#   answer on a sensitive action earns MORE interrogation than a surprising one, not less — and
#   the question to ask a report is not "did it work" but what was run, over what population,
#   and what it would have printed if the thing were still broken.
#
#   WHY IT LIVES HERE and not in battery.py's placement block, which is where it was first
#   proposed and the user moved it: that block answers WHERE A LESSON LIVES, this answers WHAT A
#   CLAIM MUST CARRY. Different questions, and that block has been extended twice already. The
#   parent is the paragraph directly above — this is that rule generalised from gates to reports.
#
# Usage:
#   .claude/commit_checked.sh "<subject line>" "<done-marker>" <gate command...>
# e.g.
#   .claude/commit_checked.sh "Fix the parse error" "DONE syntax_check:" sh .claude/syntax_check.sh
#
# It refuses to commit unless the gate exits zero AND prints its marker. On success the
# message is the subject, a blank line, then the gate's DONE line(s) VERBATIM.
#
# HISTORY IS APPEND-ONLY HERE, ALWAYS: this script only ever creates a new commit. No amend,
# no rebase, no force — the archive-immutability rule (git at and before a131649 is the raw
# asset archive) is not this tool's to bend, and it does not have the flags to try.
#
# AN AUDIT MUST NOT SHIP IN THE SAME COMMIT AS THE CHANGE IT WOULD HAVE RECORDED (user ruling,
# 2026-09-07, corrected the same day — a general sequencing rule, recorded here because this script is
# where a commit boundary gets drawn).
#
# When a change and the instrument that would have caught it land in the same commit, the instrument's
# green run proves nothing about the change: it ran on a tree the change was already in, and its
# report is indistinguishable from one produced on the state that existed before. The instrument has
# to run on a tree it did not arrive with. So SPLIT: the audit first, green on state that is already
# in git and independently readable, then the change it is meant to police. 4263890's report was
# accepted for doing this, and it is the reason the split is worth mechanising in a habit rather than
# rediscovering per commit.
#
# THE FIRST WORDING WAS "ALONGSIDE ITS SUBJECT", AND IT OVER-FIRED — corrected in place rather than
# reworded quietly, so a reader can see which claim moved. "Subject" reads as everything the audit
# touches, which would forbid every audit that ships with any code at all, including its own sensor.
# THE RULE IS ABOUT RECORDS AND THEIR SUBJECTS, NOT TOOLS AND THEIR INPUTS. What must precede is THE
# BASELINE THE AUDIT COMPARES AGAINST:
#   1bda280 HAD TO GO FIRST because record_keys ARE the baseline. Without them a removal has nothing
#     to be absent FROM, so the audit's first act would erase its own finding: the three false records
#     would never appear as `-` lines anywhere in git, in the commit claiming to make composition
#     visible.
#   69ba723 NEEDED NO PRIOR BASELINE. citation_paren_ledger's subject is four spans and a rule already
#     in history at 4263890, whose effect is already recorded as `-` lines in record_count.json. The
#     `parenBetweenHeadAndYear` flag it ships with is the ledger's SENSOR, and a sensor is part of the
#     audit.
# SO: SENSORS, READERS AND FIXTURES TRAVEL WITH THE AUDIT FREELY. Only the recorded change waits.
#
# THE CONVERSE IS NOT TRUE AND MUST NOT BE INFERRED: an instrument that ships with a FIX to the very
# thing it detects is fine, and is in fact this chain's own convention — citation_reach_check.py's
# STALE DECLARATION problem exists to force exactly that pairing ("if it was fixed, delete the
# declaration in the same commit"). The rule is about an audit shipping with its SUBJECT, not with its
# subject's REPAIR. What it forbids is a commit where the only evidence the instrument works is a run
# over output the same commit produced.
#
# NOT MECHANISED, DELIBERATELY, and the reason is the same one that stops the chain at four layers: a
# check for it would have to decide which files in a diff are "the audit" and which are "the subject",
# which is a judgement, and a wrong judgement here refuses legitimate commits. It is a rule for the
# person drawing the boundary, which is why it is written where they will be standing.
#
# GATE THE TREE YOU'RE COMMITTING, NOT THE TREE YOU'RE WORKING IN (user ruling, 2026-09-07 — recorded
# beside the sequencing rule because it is the same family, one layer down). That rule decides WHICH
# COMMIT a thing lands in; this one decides WHICH TREE the gate ran over. The two trees diverge the
# moment an untracked file exists, and a working tree with a draft in it is not the tree a reviewer, a
# clone or the deploy will see — so a green run over it can certify bytes that are going nowhere and,
# worse, BANK NUMBERS DERIVED FROM THEM.
# THE INCIDENT IS WHY THIS IS A RULE AND NOT AN AESTHETIC: an untracked draft in .claude/ raised
# internal_quote_check's ratcheted floor to a value no fresh checkout could reproduce, and it was
# caught by moving the draft aside and re-running — by gating the committed tree rather than the
# working one, and by nothing else. The PRODUCER side of that is now fixed and mechanised (a ratcheted
# metric derives from tracked files; battery.py's sidecar-convention block holds the rule). This side
# is not mechanisable, for the same shape of reason as the rule above: no gate can know whether an
# untracked file is a draft to exclude or a file you forgot to stage.
# WHAT IT COSTS TO OBEY: one `git status --porcelain --untracked-files=all` before the gate run, and if
# it is not empty, either stage the file or move it out of the tree and run again.
#
# THE OTHER HALF OF THE SAME PRINCIPLE IS NOT A JUDGEMENT CALL, AND IS MECHANISED (2026-09-10, user:
# "the gate reads the working tree, not the index" — the fourth accidental invariant again, a property
# holding by habit rather than enforcement). An UNTRACKED file is ambiguous (draft, or forgotten?), which is
# why the paragraph above stops at a human pre-check. A TRACKED file with unstaged changes has no such
# ambiguity: there is no legitimate reason a real edit to a file already in the index should silently not
# count, and every prior commit here only avoided this because staging happened to be complete, not because
# anything enforced it. INCIDENT: db195f0 staged 2 of 7 changed files; the gate read the working tree (all 7
# edits applied on disk) and passed; the commit captured the other 5 files' PREVIOUS content. Checked out
# clean, db195f0 alone fails its own battery. Fixed forward as b9e1c60, disclosed in its message.
# THE TELL WAS PRINTED AND MISREAD, the third time in this project information failed to be read because it
# did not change a verdict (two label overlaps inside a check count; three record defects inside a flag
# count; five unstaged files inside a `git status --porcelain` line read as noise). A line that reports
# state without gating it stops being read. So this does not print and wait for a human to notice — it
# refuses, before the gate even runs, so a five-minute battery is never wasted on a tree that cannot be
# committed as intended anyway. `.claude/refusals.log` is exempt: this script itself leaves it tracked-but-
# unstaged between a refusal and the next successful commit BY DESIGN (see "THE REFUSAL LOG RIDES ALONG"
# below) — refusing on its own designed staleness would make a repo that has ever refused once unable to
# ever commit again.
#
# Condition (7) at birth: --selftest builds a scratch git repo in TMPDIR and proves both arms
# against real commits — a gate printing no marker leaves the repo with ZERO new commits, and
# a gate printing one produces a message containing that line verbatim. A tool whose job is
# refusing has to be shown refusing.
# WHAT COUNTS AS A DONE LINE (2026-09-06, user ruling). The quote was a SUBSTRING match on the
# hand-passed marker, which failed in both directions at once and neither announced itself:
#
#   TOO WIDE — prose got quoted. Any line containing the literal "DONE " was copied into the
#   message, so selftest arm DESCRIPTIONS mentioning "DONE line" landed in the permanent record
#   beside real gate output (58748d3, a3e5015, aafbe04). A reader cannot tell which lines are a
#   gate's own words, in the one artefact whose whole purpose is being a gate's own words.
#
#   TOO NARROW — a gate went missing. regress.js's marker is "==== DONE: ..." and does NOT contain
#   "DONE " (the character after DONE is a colon), so the DOCUMENTED aggregate invocation
#   `commit_checked.sh "<subject>" "DONE " python3 .claude/battery.py pre-commit` SILENTLY DROPPED
#   the 167-check regression from the message. That is not hypothetical: aafbe04 has no regress
#   line, where a3e5015 and 58748d3 do, because those were run with the marker "DONE" (no trailing
#   space) and this one used the documented form. The most important gate in the chain came and
#   went from the record depending on one invisible character in an argument typed by hand.
#
# So QUOTING IS BY FORM, NOT BY THE PASSED MARKER, and the forms are named explicitly rather than
# guessed at: a naive "^DONE " anchor fixes the prose and keeps the regress hole, which would be a
# gate getting quieter without saying so — the exact failure class this chain exists for.
#
# THE PASSED MARKER STILL GOVERNS REFUSAL: the caller declares which gate they are gating on, and
# it must appear among the CAPTURED lines. Prose can no longer satisfy that, because prose is no
# longer captured.
#
# DUPLICATED, KNOWINGLY: .claude/battery.py's run_member() uses the same two forms to decide which
# member lines to leave unindented, and a shared definition across a .sh and a .py would be a
# bigger mechanism than the duplication risks. Both sites say so and name each other.
DONE_LINE_RE='^DONE |^==== DONE'

set -u

DIR="$(cd "$(dirname "$0")/.." && pwd)"
WRAPPER="$(cd "$(dirname "$0")" && pwd)/run_checked.sh"

do_commit() {
  # $1 subject, $2 marker, rest: gate command
  subject="$1"; marker="$2"; shift 2
  # GATE THE TREE YOU'RE COMMITTING, TRACKED HALF (2026-09-10): refuse before running the gate at
  # all if any TRACKED file has unstaged changes — the gate is about to certify disk, and disk is
  # not what `git commit` is about to capture unless every such file is staged first.
  unstaged="$(git diff --name-only -- . ':!.claude/refusals.log')"
  if [ -n "$unstaged" ]; then
    echo "COMMIT_CHECKED: tracked file(s) have unstaged changes — the gate would verify disk, not" >&2
    echo "what this commit would capture. Stage them or revert them, then retry. REFUSING TO COMMIT:" >&2
    echo "$unstaged" | sed 's/^/    /' >&2
    return 3
  fi
  out="$(mktemp)"
  if ! sh "$WRAPPER" "$marker" "$@" >"$out" 2>&1; then
    cat "$out"
    echo "COMMIT_CHECKED: gate failed or printed no '$marker' — REFUSING TO COMMIT" >&2
    rm -f "$out"; return 3
  fi
  cat "$out"
  done_lines="$(grep -E "$DONE_LINE_RE" "$out")"
  if [ -z "$done_lines" ]; then
    echo "COMMIT_CHECKED: no DONE line to quote — REFUSING TO COMMIT" >&2
    rm -f "$out"; return 3
  fi
  # NO SEPARATE MARKER CHECK HERE, deliberately. It was written and removed the same hour: with
  # quoting anchored, the empty-capture test above already refuses a prose-only run (prose no longer
  # captures), and run_checked.sh already fails a marker typo by not finding it at all. A third
  # check would have added only one thing — a way to refuse a LEGITIMATE invocation, since the
  # aggregate marker "DONE " does not appear in regress's "==== DONE:" line, so gating a
  # regress-only run with it would refuse for no reason. Redundant checks are not free when one of
  # them can fire wrongly.
  # THE REFUSAL LOG RIDES ALONG (2026-09-07). run_checked.sh appends a refusing run to
  # .claude/refusals.log, and a refusing run makes no commit — so the entry can only reach git in the
  # diff of the next SUCCESSFUL commit. Staging it here is what makes "the next commit picks it up"
  # true by construction instead of by anyone remembering; an unstaged refusal is one `git checkout`
  # away from being the thing the log exists to prevent. Guarded on existence because the selftest
  # commits inside a scratch repo that has no .claude/ at all.
  #
  # THE ONLY FILE THIS SCRIPT STAGES, and it stages nothing else on purpose: a commit tool that
  # decides what belongs in a commit is a different and much worse tool. This one file is
  # machine-written, declared in battery.py's NON_INSTRUMENTS, and exists solely to be archived.
  [ -f .claude/refusals.log ] && git add .claude/refusals.log
  msg="$(mktemp)"
  printf '%s\n\n%s\n' "$subject" "$done_lines" > "$msg"
  git commit -F "$msg" >/dev/null 2>&1
  rc=$?
  if [ $rc -eq 0 ]; then
    echo "COMMIT_CHECKED: committed with the gate's own DONE line quoted verbatim:"
    echo "$done_lines" | sed 's/^/    /'
  else
    echo "COMMIT_CHECKED: git commit failed (exit $rc)" >&2
  fi
  rm -f "$out" "$msg"
  return $rc
}

if [ "${1:-}" = "--selftest" ]; then
  ok=1
  # ARMS 1 AND 3 DRIVE GENUINE REFUSALS THROUGH run_checked.sh — that is how they prove the commit is
  # refused — so the wrapper's refusal log has to be redirected or this selftest appends two invented
  # entries to the real .claude/refusals.log on every battery run. It did exactly that on the log's
  # first live run. Distinct from arm 7's scratch .claude/refusals.log, which is a file to be STAGED,
  # not the wrapper's write target.
  RUN_CHECKED_REFUSAL_LOG="${TMPDIR:-/tmp}/commit_checked_selftest.$$.refusals.log"
  export RUN_CHECKED_REFUSAL_LOG
  scratch="${TMPDIR:-/tmp}/commit_checked_selftest.$$"
  mkdir -p "$scratch" && cd "$scratch" || exit 2
  git init -q . 2>/dev/null
  git config user.email selftest@local; git config user.name selftest
  echo seed > f.txt; git add f.txt; git commit -qm seed
  base="$(git rev-list --count HEAD)"

  # arm 1: a gate that prints NO marker must leave the repo with no new commit — the 4b2c8c5
  # shape, where the gate produced nothing and the commit happened regardless.
  echo change1 >> f.txt; git add f.txt
  do_commit "should not land" "DONE test:" true >/dev/null 2>&1
  after="$(git rev-list --count HEAD)"
  if [ "$after" = "$base" ]; then
    echo "  ok   refuses to commit when the gate prints no DONE line (repo unchanged)"
  else
    echo "  FAIL committed despite a gate that printed no DONE line"; ok=0
  fi

  # arm 2: a gate that DOES print the marker must commit, and the message must contain the
  # gate's line verbatim — not a restatement of its numbers.
  do_commit "should land" "DONE test:" sh -c 'echo "DONE test: 7 things checked, 0 broken"' >/dev/null 2>&1
  after="$(git rev-list --count HEAD)"
  body="$(git log -1 --pretty=%B 2>/dev/null)"
  if [ "$after" != "$base" ] && printf '%s' "$body" | grep -qF "DONE test: 7 things checked, 0 broken"; then
    echo "  ok   commits with the DONE line quoted verbatim in the message"
  else
    echo "  FAIL marker run did not produce a commit quoting its DONE line"; ok=0
  fi

  # arm 3: a gate that exits non-zero must refuse even though the marker printed — the
  # regression's real shape is a crash, and a crash that happens to emit text is still a crash.
  base2="$(git rev-list --count HEAD)"
  echo change3 >> f.txt; git add f.txt
  do_commit "should not land either" "DONE test:" sh -c 'echo "DONE test: 1 checked, 0 broken"; exit 4' >/dev/null 2>&1
  after="$(git rev-list --count HEAD)"
  if [ "$after" = "$base2" ]; then
    echo "  ok   refuses when the gate exits non-zero even though it printed a DONE line"
  else
    echo "  FAIL committed on a non-zero gate exit"; ok=0
  fi

  # arm 4: THE REGRESS FORM, under the documented aggregate marker. This is the arm that would
  # have caught aafbe04: "==== DONE:" does not contain "DONE ", so the old substring quote dropped
  # the 167-check regression from the message and said nothing.
  base4="$(git rev-list --count HEAD)"
  echo change4 >> f.txt; git add f.txt
  do_commit "regress form" "DONE " sh -c \
    'echo "==== DONE: 167 checks, 2 failures, 2 page errors ===="; echo "DONE battery: 9/9 ran"' \
    >/dev/null 2>&1
  body4="$(git log -1 --pretty=%B 2>/dev/null)"
  if [ "$(git rev-list --count HEAD)" != "$base4" ] \
     && printf '%s' "$body4" | grep -qF "==== DONE: 167 checks, 2 failures, 2 page errors ====" \
     && printf '%s' "$body4" | grep -qF "DONE battery: 9/9 ran"; then
    echo "  ok   quotes BOTH marker forms — regress's '==== DONE:' line is no longer dropped"
  else
    echo "  FAIL the '==== DONE:' form was not quoted (the aafbe04 loss)"; ok=0
  fi

  # arm 5: prose is NOT quoted, and the real line still is. The data is left exactly as it appears
  # in a live run — arm descriptions that mention "DONE line" are legitimate output and rewording
  # them would hide the constraint instead of removing it.
  base5="$(git rev-list --count HEAD)"
  echo change5 >> f.txt; git add f.txt
  do_commit "prose excluded" "DONE " sh -c \
    'echo "  ok   fires when a member runs without printing its DONE line"; echo "DONE x: 1 checked"' \
    >/dev/null 2>&1
  body5="$(git log -1 --pretty=%B 2>/dev/null)"
  if [ "$(git rev-list --count HEAD)" != "$base5" ] \
     && printf '%s' "$body5" | grep -qF "DONE x: 1 checked" \
     && ! printf '%s' "$body5" | grep -q "ok   fires when a member"; then
    echo "  ok   indented prose containing 'DONE line' is not quoted, the real line is"
  else
    echo "  FAIL prose leaked into the message, or the real DONE line was lost"; ok=0
  fi

  # arm 6: a run that prints ONLY prose is now a vacuous run at the quoting layer too — the
  # anchored capture is empty, so there is nothing to quote and nothing to commit.
  base6="$(git rev-list --count HEAD)"
  echo change6 >> f.txt; git add f.txt
  do_commit "prose only" "DONE " sh -c \
    'echo "  ok   refuses with no records artifact (exit 2, no DONE line)"' >/dev/null 2>&1
  if [ "$(git rev-list --count HEAD)" = "$base6" ]; then
    echo "  ok   refuses a run whose only 'DONE' text is prose (nothing anchored to quote)"
  else
    echo "  FAIL committed on prose alone"; ok=0
  fi

  # arm 7: the refusal log is carried into the commit even though nothing staged it. This is the arm
  # that makes "refusals archive one commit late" a property of the tool rather than of a habit — an
  # entry written by a run that could not commit has no other route into git.
  mkdir -p .claude && echo "==== REFUSAL 2026-01-01T00:00:00Z reason=exit=3 marker=\"DONE x:\" tool=y" \
    > .claude/refusals.log
  do_commit "carries the refusal log" "DONE test:" sh -c 'echo "DONE test: 1 checked"' >/dev/null 2>&1
  if git show --stat --pretty=format:"" HEAD 2>/dev/null | grep -q 'refusals.log'; then
    echo "  ok   stages .claude/refusals.log so an unstaged refusal still reaches git"
  else
    echo "  FAIL the refusal log was not carried into the commit"; ok=0
  fi

  # arm 8: a tracked file with unstaged changes refuses BEFORE the gate even runs — proven by a
  # sentinel the gate command would create, absent after the refusal, not just by the commit count.
  base8="$(git rev-list --count HEAD)"
  echo change8 >> f.txt   # tracked (seeded at repo init), left unstaged on purpose
  rm -f gate_ran.marker
  do_commit "should not land, unstaged tracked file" "DONE test:" \
    sh -c 'touch gate_ran.marker; echo "DONE test: 1 checked"' >/dev/null 2>&1
  if [ "$(git rev-list --count HEAD)" = "$base8" ] && [ ! -f gate_ran.marker ]; then
    echo "  ok   refuses on an unstaged tracked file, before running the gate (no commit, gate never ran)"
  else
    echo "  FAIL committed with an unstaged tracked file present, or ran the gate anyway"; ok=0
  fi
  git checkout -q -- f.txt   # discard arm 8's unstaged edit so later arms see a clean f.txt

  # arm 9: the refusals.log EXEMPTION survives once the log is tracked, not just the first time it's
  # created (arm 7 already committed it, tracking it); leave it unstaged-modified the way a real second
  # refusal would, then confirm a real, fully-staged change still commits — the exemption must not
  # regress into "a repo that has ever refused once can never commit again".
  echo "==== REFUSAL 2026-01-02T00:00:00Z reason=exit=3 marker=\"DONE y:\" tool=z" >> .claude/refusals.log
  base9="$(git rev-list --count HEAD)"
  echo change9 >> f.txt; git add f.txt
  do_commit "should land despite tracked-but-unstaged refusals.log" "DONE test:" \
    sh -c 'echo "DONE test: 1 checked"' >/dev/null 2>&1
  if [ "$(git rev-list --count HEAD)" != "$base9" ]; then
    echo "  ok   a tracked-but-unstaged refusals.log does not block a real commit (exemption survives past its first write)"
  else
    echo "  FAIL the refusals.log exemption regressed — a legitimate commit was blocked"; ok=0
  fi

  cd "$DIR" || exit 2
  rm -rf "$scratch" "$RUN_CHECKED_REFUSAL_LOG"
  if [ $ok -eq 1 ]; then
    echo "SELFTEST PASS — refuses on no-marker, non-zero exit and prose-only output; quotes both "\
"DONE forms verbatim and no prose; carries the refusal log; refuses an unstaged tracked file before "\
"the gate runs, exempting refusals.log's own designed staleness"
    exit 0
  fi
  echo "SELFTEST FAIL — do not trust commits made through this script"
  exit 1
fi

if [ $# -lt 3 ]; then
  echo "usage: commit_checked.sh <subject> <done-marker> <gate command...>" >&2
  exit 2
fi
cd "$DIR" || exit 2
do_commit "$@"
