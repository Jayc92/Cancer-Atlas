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
# Condition (7) at birth: --selftest builds a scratch git repo in TMPDIR and proves both arms
# against real commits — a gate printing no marker leaves the repo with ZERO new commits, and
# a gate printing one produces a message containing that line verbatim. A tool whose job is
# refusing has to be shown refusing.
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
  done_lines="$(grep -F "$marker" "$out")"
  if [ -z "$done_lines" ]; then
    echo "COMMIT_CHECKED: no DONE line to quote — REFUSING TO COMMIT" >&2
    rm -f "$out"; return 3
  fi
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

  cd "$DIR" || exit 2
  rm -rf "$scratch"
  if [ $ok -eq 1 ]; then
    echo "SELFTEST PASS — refuses on no-marker and on non-zero exit, quotes the line when it commits"
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
