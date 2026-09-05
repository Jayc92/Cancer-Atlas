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
set -u

if [ "${1:-}" = "--selftest" ]; then
  self="$0"
  ok=1
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
  if [ $ok -eq 1 ]; then
    echo "SELFTEST PASS — the wrapper fails vacuous runs, passes real ones, propagates errors"
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
tmp="$(mktemp)"
"$@" >"$tmp" 2>&1
rc=$?
cat "$tmp"
if [ $rc -ne 0 ]; then
  echo "RUN_CHECKED: command exited $rc — failure" >&2
  rm -f "$tmp"; exit $rc
fi
if grep -qF "$marker" "$tmp"; then
  rm -f "$tmp"; exit 0
fi
echo "RUN_CHECKED: marker '$marker' ABSENT — vacuous run, treated as failure" >&2
rm -f "$tmp"; exit 3
