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
# AN AUDIT THAT SHIPS ALONGSIDE ITS SUBJECT CANNOT WITNESS IT (user ruling, 2026-09-07 — a general
# sequencing rule, recorded here because this script is where a commit boundary gets drawn).
#
# When a change and the instrument that would have caught it land in the same commit, the instrument's
# green run proves nothing about the change: it ran on a tree the change was already in, and its
# report is indistinguishable from one produced on the state that existed before. The instrument has
# to run on a tree it did not arrive with. So SPLIT: the audit first, green on state that is already
# in git and independently readable, then the change it is meant to police. 4263890's report was
# accepted for doing this, and it is the reason the split is worth mechanising in a habit rather than
# rediscovering per commit.
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

  cd "$DIR" || exit 2
  rm -rf "$scratch"
  if [ $ok -eq 1 ]; then
    echo "SELFTEST PASS — refuses on no-marker, non-zero exit and prose-only output; quotes both "\
"DONE forms verbatim and no prose"
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
