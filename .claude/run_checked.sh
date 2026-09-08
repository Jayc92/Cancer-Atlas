#!/bin/sh
# run_checked.sh (2026-09-05) — condition (7-bis) as a MECHANISM, not a habit.
#
# The original failure: grep for FAIL, get nothing, read it as a pass. The habit fix (grep
# for DONE and require it) carries the identical lapse one string over if the grep is
# manual. This wrapper makes the check unskippable: it runs the tool, requires the tool's
# DONE marker in the output, and EXITS NON-ZERO if the marker is absent — a vacuous run
# fails the invocation itself instead of silently succeeding.
#
# THE EXIT CODE IS THE VERDICT; THE OUTPUT IS COMMENTARY (2026-09-07, user ruling). That is the whole
# point of this wrapper and it is stated here because the failure above KEEPS RECURRING AT THE CALLER.
# Everything this file does — refuse a vacuous run, propagate a non-zero exit, reject a misinvocation —
# it delivers as a NUMBER. A caller that captures the number needs no pattern, and no pattern a caller
# invents can be more authoritative than the number the tool already returned. Read `$?`. Grep the
# output only to explain a verdict you have already read, never to establish one.
#
# TWO MISSES IN ONE SESSION IS THE PATTERN, NOT THE INCIDENT (user), and both were in callers that
# parsed prose anyway:
#   1. A BACKGROUNDED GATE RUN THAT PRODUCED A DONE LINE AND NO VERDICT — same shape as the outage.
#   2. `commit_checked.sh` EXITED NON-ZERO AND THE COMMIT DID NOT HAPPEN, while a grep for the verdict
#      matched selftest arm descriptions instead of the verdict line and was truncated before reaching
#      it. The tool had already said everything necessary in one integer.
#
# THE MECHANISM THAT DESTROYS THE SIGNAL IS WORTH NAMING, because it looks like capturing the code:
# trailing a run with `; echo "exit $?"` makes the SHELL's status the echo's — always 0 — so any
# harness reporting the command's exit sees success while the real code is buried in the text. Either
# let the invocation be the last statement, or capture with `rc=$?; …; exit $rc`. The `$?` was printed
# in miss 2 and still went unread for exactly this reason: the surrounding report said exit 0.
#
# TREE AND LOG ARE CORROBORATION, NOT THE PRIMARY CHECK. For an action with a durable consequence,
# `git status --porcelain` and `git log --oneline` independently confirm a commit happened — but that
# reads the CONSEQUENCE, so it does not generalise to an instrument whose result is not a git object,
# which is most of them. Verdict first, corroboration second.
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
    # THE ARCHIVED TAIL IS SCRUBBED OF MACHINE-SPECIFIC ROOTS, and $HOME was added for a sharper
    # reason than $TMPDIR (2026-09-08, with battery.py's assertion 6). This log is TRACKED and
    # MACHINE-WRITTEN, which makes it the one file in the index that can acquire an absolute home
    # path with NO HUMAN IN THE LOOP — one failing gate whose last lines carry a traceback is
    # enough. Assertion 6 would then fire on every following run, and the only remedy would be
    # EDITING AN APPEND-ONLY EVIDENCE ARCHIVE, which this file's own header forbids: a red chain
    # with no sanctioned way out. Prevention at the writer is what keeps that state unreachable,
    # the same move as the newline guard above — fix the class at the writer, not the instance.
    # TMPDIR IS SUBSTITUTED FIRST ON PURPOSE: a TMPDIR nested inside HOME should read as $TMPDIR,
    # the more specific and more useful of the two. Each root is used as a BRE, so a dot inside it
    # matches any character — over-matching, which is the harmless direction for a scrubber.
    scrub='s/^/  | /'
    home_root="${HOME:-}"; home_root="${home_root%/}"
    [ -n "$home_root" ] && scrub="s|$home_root|\$HOME|g;$scrub"
    tmp_root="${TMPDIR:-}"; tmp_root="${tmp_root%/}"
    [ -n "$tmp_root" ] && scrub="s|$tmp_root|\$TMPDIR|g;$scrub"
    tail -n "$REFUSAL_TAIL" "$tmp" | sed "$scrub"
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
  # arm 8: THE MARKER IS MATCHED AT LINE START. Written to FAIL against the `grep -qF "$marker"`
  # this replaced: a run that only MENTIONS its marker inside prose, and prints no DONE line, is
  # vacuous and must be refused. The unanchored matcher accepted it, so the wrapper's own headline
  # guarantee — "a vacuous run fails the invocation itself" — had a hole the width of one sentence.
  if "$self" "DONE test:" sh -c 'echo "  ok   fires when DONE test: is absent"' >/dev/null 2>&1; then
    echo "  FAIL a prose mention of the marker was accepted as a DONE line"; ok=0
  else
    echo "  ok   a marker mentioned only in prose is still a vacuous run"
  fi
  # and the passing direction, so the anchor is shown not to have simply broken the check
  if "$self" "DONE test:" sh -c 'echo "  ok   mentions DONE test: in prose"; echo "DONE test: 1"' \
       >/dev/null 2>&1; then
    echo "  ok   the same output WITH a real DONE line is still accepted"
  else
    echo "  FAIL anchoring the marker rejected a run that does print its DONE line"; ok=0
  fi
  # arm 10: THE MISINVOCATION, on the exact argument list that really happened. Written to FAIL
  # without the marker contract: `$# -lt 2` sees three arguments and passes them through, so without
  # the guard this call RUNS something — and then logs an entry whose fields name a real marker and a
  # real tool that are neither, which is the defect. The arm therefore separates the two things that
  # used to be conflated: REFUSED BEFORE RUNNING (no output block from a command, exit 2) and RECORDED
  # WITH HONEST FIELDS (`reason=MISINVOKED`, and both labels `n/a` rather than lies).
  #
  # THIS ARM USED TO ASSERT THE LOG STAYS EMPTY, and the reversal is the user's ruling. What survives
  # from that version is its lesson, which the new form no longer needs: "the log is empty" is an
  # ABSENCE, and absences have false-pass modes — while building the old arm, a negative-control copy
  # written without an execute bit could not exec at all, so every self-invocation died at 126, the log
  # stayed empty, and THE ARM REPORTED OK WHILE MEASURING NOTHING. Asserting a PRESENT entry with named
  # fields cannot false-pass that way: a call that never ran writes no entry to find. The guard's own
  # message is still required, because it is what distinguishes "refused by the guard" from "never
  # ran", and the exit code cannot — both are non-zero.
  #
  # BOTH HALVES SHOWN ABLE TO FIRE, SEPARATELY, BY MUTATION (condition 7). Deleting the log_refusal
  # call fails on the count and nothing else. Deriving the fields the old way instead —
  # `tool="$(basename -- "${2:-$1}")"` with the real marker left in place — REPRODUCES THE ORIGINAL
  # DEFECT BYTE FOR BYTE, `marker="python3" tool=battery.py`, and fails on honesty and nothing else.
  # The second is the one worth having: the arm is not merely checking that something was written, it
  # catches the exact entry this guard was written because of.
  rm -f "$RUN_CHECKED_REFUSAL_LOG"
  mis="$("$self" python3 .claude/battery.py --phase=pre-commit 2>&1)" && mis_rc=0 || mis_rc=1
  mis_entries="$(grep -c '^==== REFUSAL ' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null || echo 0)"
  if [ $mis_rc -eq 0 ]; then
    echo "  FAIL a call with the marker omitted was accepted"; ok=0
  elif [ "$mis_entries" != "1" ]; then
    echo "  FAIL the misinvocation left $mis_entries entries — a refusal must leave exactly one"; ok=0
  elif ! grep -q '^==== REFUSAL .* reason=MISINVOKED marker="n/a" tool=n/a$' \
         "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null; then
    echo "  FAIL the entry did not name the refusal honestly (reason=MISINVOKED, both labels n/a)"
    ok=0
  elif ! grep -q 'is not a DONE marker' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null; then
    echo "  FAIL the entry did not carry the guard's message, so the bad argument is unrecorded"; ok=0
  elif ! printf '%s' "$mis" | grep -q 'MISINVOKED'; then
    echo "  FAIL refused without the guard's message — it did not run, but for the wrong reason"; ok=0
  else
    echo "  ok   a call with the marker omitted is refused BEFORE running and recorded with honest "\
"fields (reason=MISINVOKED, marker and tool n/a, the bad argument quoted in the entry's output)"
  fi
  # and the passing direction, so the contract is shown not to have simply broken the wrapper
  if "$self" "==== DONE:" sh -c 'echo "==== DONE: 1 thing"' >/dev/null 2>&1; then
    echo "  ok   the ==== DONE: marker form is still accepted (regress.js's form)"
  else
    echo "  FAIL the marker contract rejected regress.js's legitimate marker"; ok=0
  fi
  # arm 11: THE TOOL FIELD NAMES A TOOL, NOT AN OPTION. Written to FAIL against `basename -- ${2:-$1}`,
  # under which `sh -c '...'` archived tool=-c. Not a misinvocation — a field that lied about a
  # legitimate call, which is the same defect as arm 10's labels one degree quieter.
  rm -f "$RUN_CHECKED_REFUSAL_LOG"
  "$self" "DONE test:" sh -c 'echo "DONE test: 1 thing"; exit 4' >/dev/null 2>&1
  if grep -q '^==== REFUSAL .* tool=sh$' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null; then
    echo "  ok   an option word is skipped when naming the tool (sh -c archives tool=sh, not tool=-c)"
  else
    echo "  FAIL the tool field named an option instead of the tool"; ok=0
  fi
  # arm 12: $HOME IS SCRUBBED OUT OF THE ARCHIVED TAIL. Condition (7) on the writer, and the arm
  # asserts BOTH directions because only one of them can fail honestly: the literal token must be
  # present AND the expanded path must be absent. Checking only for the token would pass vacuously
  # against output that never carried a home path at all — the same vacuous-green shape as the
  # blown-white checks that passed on zero mesh pixels. Deleting the substitution from log_refusal
  # fails the second half.
  rm -f "$RUN_CHECKED_REFUSAL_LOG"
  "$self" "DONE test:" sh -c 'echo "DONE test: 1 thing"; echo "at $HOME/app/x.py"; exit 6' \
    >/dev/null 2>&1
  if grep -q '\$HOME/app/x\.py' "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null \
     && ! grep -qF "$HOME/app/x.py" "$RUN_CHECKED_REFUSAL_LOG" 2>/dev/null; then
    echo "  ok   a home path in a refusing run's output is archived symbolically, not expanded"
  else
    echo "  FAIL the refusal log archived a machine-specific home path"; ok=0
  fi
  rm -f "$RUN_CHECKED_REFUSAL_LOG"
  if [ $ok -eq 1 ]; then
    echo "SELFTEST PASS — the wrapper fails vacuous runs, passes real ones, propagates errors, and "\
"logs exactly the refusals with their own output, anchored even onto an unterminated file, "\
"matches the marker at line start so a prose mention cannot pass for a DONE line, refuses a "\
"misinvocation before running anything AND records it with both labels n/a, names a tool "\
"rather than an option in the entry, and scrubs the machine's home path out of what it archives"
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

marker="$1"
# THE MISINVOCATION GUARD (2026-09-07, user ruling, after this wrapper archived a misinvocation as
# fact). `$# -lt 2` CANNOT SEE A THREE-ARGUMENT CALL WITH THE WRONG THREE ARGUMENTS. Omitting the
# marker and calling `run_checked.sh python3 .claude/battery.py --phase=pre-commit` satisfied it, ran
# .claude/battery.py as a bare executable (exit 126, permission denied), and appended an entry saying
# marker="python3" tool=--phase=pre-commit. Both fields named things that are not what they claim, in
# the file whose whole purpose is append-only evidence — a refusal correctly recorded under two false
# labels, which is worse than a missing entry because it reads as fact.
#
# THE RULED MECHANISM WAS "REJECT A MARKER OR TOOL ARGUMENT BEGINNING WITH `-`", AND THE TOOL HALF IS
# DESTRUCTIVE — measured on a throwaway copy before being written here, per the standing rule. The
# legitimate `sh -c '...'` form puts `-c` in exactly the position that rule refuses, and five of this
# file's own selftest arms use it, so the literal rule fails the wrapper's own selftest. Worse, the
# obvious repair defeats the catch: deriving the tool by SKIPPING option words turns the real
# misinvocation's argv into tool=battery.py, which the `-` rule then passes. The tool position is
# simply not where that call is decidable.
#
# SO THE OUTCOME IS DELIVERED AT THE MARKER, AS A POSITIVE CONTRACT, which strictly contains the
# ruled rule (nothing beginning with `-` begins with DONE or ====) and reaches the real case, which
# the ruled rule at the tool position does not. A marker must begin with `DONE` or `====`. That is
# not a new convention invented here: every marker declared in battery.py's INSTRUMENTS is one of
# `DONE` or `====`, and commit_checked.sh's DONE_LINE_RE already defines a DONE line as exactly those
# two forms. (The count was written out here as "all 14 markers" for a day. This header is the one
# that already lost a count that way — it said "six call sites" while ten instruments existed — so a
# restated total is the last thing it should carry. The claim is stronger without it: EVERY marker.)
#
# AND IT IS LOGGED (2026-09-07, user ruling, reversing this guard's first behaviour). The guard as
# first written refused and wrote NOTHING, on the reasoning that an entry for a call that ran nothing
# would archive two false labels as fact. The user's correction: "The guard's job was to fix the
# LABELS; removing the ENTRY is a second change nobody asked for, and it's the wrong direction. A
# refusal that produces no record is an absence, and absences are exactly what this chain has spent
# two days learning it cannot see — same shape as the ratchet's absence-versus-decrease hole."
#
# THE DECISIVE ARGUMENT IS REFUSAL 2 ITSELF (user): "its entire value today is that it's the incident
# that motivated `ae56833`. Under the new behaviour that incident leaves no trace, which means the
# guard's own motivating evidence would be missing from the archive built to hold precisely that class
# of evidence." A guard that refuses earlier made the archive BLINDER to the error class that
# motivated it.
#
# SO THE FIELDS SAY `n/a` — "more honest than the old lying labels and more useful than silence"
# (user). There is no marker and no tool here: that is what the refusal IS. And the bad argument is
# not lost, it MOVES: the guard's message quotes it, and the message is what the entry's output block
# carries, so the raw word is recorded as the word that was passed rather than as a field claiming to
# be a marker. (The quotes around `marker="n/a"` come from log_refusal's format string, not from here.
# ONE WRITER on purpose — log_refusal holds the line-start guard that a real defect bought, and a
# second append written inline could drop the terminator again the way the seeded header did.)
case "$marker" in
  DONE*|'===='*) ;;
  *) tmp="$(mktemp)"
     {
       echo "run_checked.sh: MISINVOKED — first argument \"$marker\" is not a DONE marker."
       echo "  A marker begins with DONE or ==== . Arguments look shifted by one."
       echo "usage: run_checked.sh <done-marker> <command> [args...]"
     } > "$tmp"
     cat "$tmp" >&2
     marker="n/a"
     tool="n/a"
     log_refusal "MISINVOKED"
     rm -f "$tmp"; exit 2 ;;
esac
shift
# `--` matters: the second word of `sh -c '...'` is `-c`, and basename without it reads that as an
# option and returns nothing. Found on the log's first live run, where an entry came out `tool=`.
# AND AN OPTION WORD IS SKIPPED, so `sh -c '...'` archives tool=sh rather than tool=-c. This is the
# other half of the same defect — not a misinvocation, just a field that named an option instead of a
# tool — and it is fixed here rather than guarded, because with the marker contract in place an
# option can no longer REACH this position by an argument shift.
case "${2:-}" in
  ''|-*) tool="$(basename -- "$1")" ;;
  *)     tool="$(basename -- "$2")" ;;
esac
tmp="$(mktemp)"
"$@" >"$tmp" 2>&1
rc=$?
cat "$tmp"
if [ $rc -ne 0 ]; then
  echo "RUN_CHECKED: command exited $rc — failure" >&2
  log_refusal "exit=$rc"
  rm -f "$tmp"; exit $rc
fi
# THE MARKER MUST BE AT LINE START. This was `grep -qF "$marker"` — a bare substring over output
# that also carries PROSE (selftest arm descriptions, PROBLEM messages, anything the tool echoes),
# which means a run printing `ok   fires when DONE battery: is absent` and no DONE line at all would
# be ACCEPTED here. That is the vacuous run this wrapper exists to refuse, reachable through the one
# matcher that decides whether a run was vacuous. `awk index($0,m)==1` rather than an anchored grep
# because the marker is a literal, not a pattern: `==== DONE:` would need escaping to survive a
# regex, and an escape function is a second thing to get wrong. Safe on MEASUREMENT, not argument —
# across a full pre-commit run all 13 markers occur exactly once each, every one already at column 0.
if awk -v m="$marker" 'index($0, m) == 1 { found = 1 } END { exit !found }' "$tmp"; then
  rm -f "$tmp"; exit 0
fi
echo "RUN_CHECKED: marker '$marker' ABSENT — vacuous run, treated as failure" >&2
log_refusal "marker-absent"
rm -f "$tmp"; exit 3
