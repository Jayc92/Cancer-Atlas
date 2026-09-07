#!/bin/sh
# run_checked.sh (2026-09-05) — condition (7-bis) as a MECHANISM, not a habit.
#
# The original failure: grep for FAIL, get nothing, read it as a pass. The habit fix (grep
# for DONE and require it) carries the identical lapse one string over if the grep is
# manual. This wrapper makes the check unskippable: it runs the tool, requires the tool's
# DONE marker in the output, and EXITS NON-ZERO if the marker is absent — a vacuous run
# fails the invocation itself instead of silently succeeding.
#
# IT GUARDS ONE INVOCATION, NOT THE SET. This header used to enumerate its call sites, which
# made it a second hand-maintained instrument list going stale beside the real one — it said
# "six call sites" while ten instruments existed. The enumeration now lives in exactly one
# place, .claude/battery.py's INSTRUMENTS, which is closed over .claude/ so it cannot quietly
# omit a member. Run the battery; call this wrapper directly only for a one-off:
#
#   python3 .claude/battery.py pre-commit          # every declared member, marker-checked
#   .claude/run_checked.sh "DONE fraction_check:" python3 .claude/fraction_check.py
#
# Condition (7) at birth: --selftest proves all three arms — FAILS on the exact original
# failure shape (command exits 0 with no marker: the vacuous run), PASSES a marker-printing
# command, and PROPAGATES a non-zero exit. The project's own preference applied to its
# newest rule: structural checks rather than standing notes.
#
# THE REFUSAL LOG (2026-09-07, user ruling: "it's a log rather than a layer").
#
# THE ASYMMETRY IT CLOSES: this chain archives its PASSES into git forever and forgets its REFUSALS
# entirely. A passing run reaches a commit, where commit_checked.sh writes its DONE line into a
# message that cannot be edited later. A refusing run reaches no commit — that is what refusing
# means — so its output lives in one terminal scrollback and is gone. The consequence is precise and
# backwards: this project's evidentiary standard is CAPABILITY SHOWN ON REAL OUTPUT, and the runs
# that show capability are exactly the ones it discarded. citation_crosscheck has refused on the
# live corpus; that refusal exists only in a chat transcript, and its own output is already gone.
#
# SO: a refusing run appends to .claude/refusals.log, which is TRACKED. The refusal is not in the
# commit that would have carried it (there is no such commit), so it lands in the diff of the NEXT
# successful commit — refusals archive ONE COMMIT LATE. That is fine and is the design, not a
# shortfall: the point is that the evidence survives at all, in the same artifact store as the
# passes, where `git log -p .claude/refusals.log` is the history of this chain refusing.
# commit_checked.sh stages the file itself, so "the next commit picks it up" is true by construction
# rather than by anyone remembering.
#
# NOT A FIFTH LAYER, AND THE DISTINCTION IS LOAD-BEARING. Nothing here checks anything: no exit code
# changes, no new refusal condition, no guard over the guard. It is append-only evidence written by a
# layer that already exists. The chain stops at four on purpose (a guard above the single entry point
# would need its own guard, and that regress bottoms out at a human) and this does not add to it.
#
# WHAT AN ENTRY DELIBERATELY OMITS, since a log that quietly drops things is worse than a short one:
#   THE ARGUMENT LIST. The command's args are artifact paths under the machine's temp directory. They
#   differ per clone, carry a per-user token, and say nothing about capability. The marker already
#   names the instrument uniquely, which is the identification that matters.
#   ALL BUT THE LAST FEW OUTPUT LINES, with the full line count printed so the log never pretends to
#   be complete. Every instrument here prints its PROBLEMs immediately before its DONE line
#   (condition 7-bis) and then exits, so the tail is where a refusal's own words are. This is the one
#   judgement in the file, and it is the alternative to a hand-maintained list of interesting
#   patterns — which would go stale exactly like the call-site enumeration this header already lost.
#   THE TEMP DIRECTORY, rewritten to the literal $TMPDIR, because this repository is public.
#
# SHOWN ON REAL OUTPUT, not only in the arms below — the standard this file's own header sets. A real
# instrument, refusing for a real reason, with its own words in the entry. Re-runnable:
#
#   mkdir -p /tmp/pl/js/organs && cp js/organs/lungs.js /tmp/pl/js/organs/
#   sed -i '' 's/2015 (WHO) & 2011/2015 (WHO 2015) & 2011/' /tmp/pl/js/organs/lungs.js
#   cd /tmp/pl && RUN_CHECKED_REFUSAL_LOG=/tmp/pl/scratch.log sh <repo>/.claude/run_checked.sh \
#       "DONE citation_paren_ledger:" python3 <repo>/.claude/citation_paren_ledger.py js/organs/lungs.js
#
# 2026-09-07: wrapper exit 3, and the entry holds `reason=exit=3`,
# `marker="DONE citation_paren_ledger:"`, `tool=citation_paren_ledger.py`, `output 19 lines, last 12
# below`, and in the tail the instrument's own `PROBLEM: SIDE MOVED Travis|2011|js/organs/lungs.js:236:
# scored as KEPT, the rule now says SPENT`. Written to a SCRATCH log on purpose: the refusal is real
# but its cause is a throwaway edit, and an entry in the committed archive pointing at corpus text
# that was never committed would be a false lead in the one artifact that has to be trustworthy.
set -u

DIR="$(cd "$(dirname "$0")/.." && pwd)"
# Overridable so --selftest can prove the appends happen without writing to the real log. An
# instrument that has to pollute the artifact it maintains in order to test itself is untestable in
# the only state that matters.
#
# ANY HARNESS THAT DRIVES A DELIBERATELY FAILING RUN THROUGH THIS WRAPPER MUST SET THIS, and the rule
# is written here because it was learned here: the log's first live run put two synthetic entries into
# the real archive, appended not by this file's selftest — which had the override from the start — but
# by commit_checked.sh's, whose arms 1 and 3 drive genuine refusals through the wrapper to prove the
# commit is refused. Both selftests now export a scratch path. There are exactly two such callers
# today (battery.py's arms are in-process and never reach here), and a third would silently write
# fiction into the one artifact whose value is being real.
REFUSAL_LOG="${RUN_CHECKED_REFUSAL_LOG:-$DIR/.claude/refusals.log}"
REFUSAL_TAIL=12

log_refusal() {
  # $1 reason. Uses $tmp, $marker and $tool from the caller's scope.
  #
  # AN APPEND MUST BEGIN AT LINE START, and this guard is here because the first REAL entry this file
  # ever wrote did not. The seeded header ended without a trailing newline, so the entry ran onto the
  # header's last sentence — and `grep -c '^==== REFUSAL '`, the only thing that counts entries and the
  # assertion arms 4-6 below are built on, MATCHED NOTHING. The log held one refusal and reported zero:
  # a zero-report over present data, which is the failure class this whole chain exists to refuse.
  # Fixed at the WRITER rather than only in the file, because the header is hand-maintained prose and
  # any future edit could drop the terminator again; the seed is one instance, this is the class.
  if [ -s "$REFUSAL_LOG" ] && [ -n "$(tail -c 1 "$REFUSAL_LOG")" ]; then
    printf '\n' >> "$REFUSAL_LOG"
  fi
  total="$(wc -l < "$tmp" | tr -d ' ')"
  {
    printf '==== REFUSAL %s reason=%s marker="%s" tool=%s\n' \
      "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$marker" "$tool"
    printf '     output %s lines, last %s below\n' "$total" "$REFUSAL_TAIL"
    if [ -n "${TMPDIR:-}" ]; then
      tail -n "$REFUSAL_TAIL" "$tmp" | sed "s|${TMPDIR%/}|\$TMPDIR|g" | sed 's/^/  | /'
    else
      tail -n "$REFUSAL_TAIL" "$tmp" | sed 's/^/  | /'
    fi
    printf '==== END REFUSAL\n'
  } >> "$REFUSAL_LOG"
  echo "RUN_CHECKED: refusal appended to $REFUSAL_LOG" >&2
}

if [ "${1:-}" = "--selftest" ]; then
  self="$0"
  ok=1
  # EVERY ARM BELOW WRITES TO A SCRATCH LOG, exported so the child invocations inherit it. Without
  # this the selftest would append six entries to the real .claude/refusals.log on every battery run,
  # and the artifact whose purpose is holding real refusals would be mostly synthetic ones.
  RUN_CHECKED_REFUSAL_LOG="${TMPDIR:-/tmp}/run_checked_selftest.$$.log"
  export RUN_CHECKED_REFUSAL_LOG
  rm -f "$RUN_CHECKED_REFUSAL_LOG"
  # arm 1: vacuous run (exit 0, no marker) must FAIL — the original failure, mechanized
  if "$self" "DONE test:" true >/dev/null 2>&1; then
    echo "  FAIL vacuous run was accepted"; ok=0
  else
    echo "  ok   vacuous run rejected (exit-0-without-marker fails)"
  fi
  # arm 2: marker present must PASS
  if "$self" "DONE test:" sh -c 'echo "DONE test: 3 things"' >/dev/null 2>&1; then
    echo "  ok   marker-printing run accepted"
  else
    echo "  FAIL marker-printing run rejected"; ok=0
  fi
  # arm 3: non-zero exit must propagate even if the marker printed
  if "$self" "DONE test:" sh -c 'echo "DONE test: 3 things"; exit 7' >/dev/null 2>&1; then
    echo "  FAIL non-zero exit was swallowed"; ok=0
  else
    echo "  ok   non-zero exit propagates"
  fi
  # arms 4-6: THE REFUSAL LOG ITSELF, in all three directions. Arms 1-3 above have already run one
  # vacuous refusal, one pass and one non-zero exit against the scratch log, so these read what those
  # produced rather than re-running them — the log's contents ARE the output of the arms above, which
  # is the closest a selftest gets to evidence from a real run.
  entries="$(grep -c '^==== REFUSAL ' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null || echo 0)"
  if [ "$entries" = "2" ]; then
    echo "  ok   the refusal log holds exactly the two refusals and not the pass"
  else
    echo "  FAIL refusal log holds $entries entries, expected 2 (vacuous + non-zero, not the pass)"
    ok=0
  fi
  if grep -q '^==== REFUSAL .* reason=marker-absent ' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null; then
    echo "  ok   a vacuous run is logged with its reason"
  else
    echo "  FAIL the vacuous run left no marker-absent entry"; ok=0
  fi
  if grep -q '^==== REFUSAL .* reason=exit=7 ' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null \
     && grep -q '^  | DONE test: 3 things$' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null; then
    echo "  ok   a non-zero exit is logged with its code and the refusing run's own output"
  else
    echo "  FAIL the non-zero exit entry is missing its code or its output tail"; ok=0
  fi
  # arm 7: THE RUN-ON, on the exact shape that really happened. A log whose last byte is not a newline
  # must still receive an entry that starts at line start — otherwise `^==== REFUSAL ` misses it and the
  # count reads zero over present data. Condition (7): the arm is written to FAIL without the guard in
  # log_refusal, which is how it earns its place rather than confirming the fix by restating it.
  printf 'header prose with no trailing newline.' > "$RUN_CHECKED_REFUSAL_LOG"
  "$self" "DONE test:" sh -c 'echo "DONE test: 1 thing"; exit 5' >/dev/null 2>&1
  if [ "$(grep -c '^==== REFUSAL ' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null)" = "1" ] \
     && grep -q '^header prose with no trailing newline\.$' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null; then
    echo "  ok   an entry appended to a file lacking its final newline still starts at line start"
  else
    echo "  FAIL the entry ran onto the previous line — the anchored count would read zero"; ok=0
  fi
  rm -f "$RUN_CHECKED_REFUSAL_LOG"
  if [ $ok -eq 1 ]; then
    echo "SELFTEST PASS — the wrapper fails vacuous runs, passes real ones, propagates errors, and "\
"logs exactly the refusals with their own output, anchored even onto an unterminated file"
    exit 0
  else
    echo "SELFTEST FAIL — do not trust wrapped invocations"
    exit 1
  fi
fi

if [ $# -lt 2 ]; then
  echo "usage: run_checked.sh <done-marker> <command> [args...]" >&2
  exit 2
fi

marker="$1"; shift
# `--` matters: the second word of `sh -c '...'` is `-c`, and basename without it reads that as an
# option and returns nothing. Found on the log's first live run, where an entry came out `tool=`.
tool="$(basename -- "${2:-$1}")"
tmp="$(mktemp)"
"$@" >"$tmp" 2>&1
rc=$?
cat "$tmp"
if [ $rc -ne 0 ]; then
  echo "RUN_CHECKED: command exited $rc — failure" >&2
  log_refusal "exit=$rc"
  rm -f "$tmp"; exit $rc
fi
if grep -qF "$marker" "$tmp"; then
  rm -f "$tmp"; exit 0
fi
echo "RUN_CHECKED: marker '$marker' ABSENT — vacuous run, treated as failure" >&2
log_refusal "marker-absent"
rm -f "$tmp"; exit 3
