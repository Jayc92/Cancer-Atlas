#!/bin/sh
# syntax_check.sh (2026-09-05) — a sub-second PARSE gate over every shipped JS module.
#
# BORN FROM: commit 4b2c8c5 shipped a SyntaxError to the live site. Two prose edits wrote
# ASCII "atlas's" / "TCGA's" inside SINGLE-QUOTED note strings, in files whose house style is
# the typographic apostrophe (the same lines already read "TCGA’s own table", "genome’s",
# "p53’s" — the curly form is inert inside 'quotes', the ASCII one terminates the string).
# One character each; the whole app failed to initialise (femaleBodyGroup null, 0 hotspots).
#
# WHY THIS INSTRUMENT AND NOT THE REGRESSION: the browser regression DOES catch it, but it
# costs ~15 minutes AND it dies as a HARNESS ERROR at regress.js:80 rather than as a check
# failure — no report.json, no DONE line, a crash whose message names puppeteer internals
# rather than the file at fault. This gate names the file, the line and the column in under a
# second, which is the difference between a gate you run before every commit and one you skip.
# The regression is not replaced; it is no longer the FIRST thing to learn a file won't parse.
#
# THE CLASS, stated so it generalises: every citation edit in this project writes English
# prose into single-quoted JS string literals. Possessives, contractions and quoted source
# titles are therefore a standing hazard on the edit path itself, not an occasional typo —
# and the defect is invisible to every citation instrument here, all of which read the
# manifest or the file as TEXT and never as CODE.
#
# Condition (7) at birth: --selftest proves the gate FIRES on the exact defect shape (an
# ASCII possessive inside a single-quoted string) and PASSES the curly-apostrophe form that
# is correct. A parse gate reporting "0 broken" has to be shown able to report non-zero.
# 7-bis: DONE line last. Wrapper form:
#   .claude/run_checked.sh "DONE syntax_check:" sh .claude/syntax_check.sh
set -u

TMP="${TMPDIR:-/tmp}/syntax_check.$$.mjs"
trap 'rm -f "$TMP"' EXIT

# ESM is parsed as ESM only under an .mjs extension, hence the copy — `node --check` on a .js
# file parses it as CommonJS and rejects every `import` in the tree.
parses() {
  cp "$1" "$TMP" && node --check "$TMP" >/dev/null 2>&1
}

if [ "${1:-}" = "--selftest" ]; then
  ok=1
  bad="${TMPDIR:-/tmp}/syn_bad.$$.js"
  good="${TMPDIR:-/tmp}/syn_good.$$.js"
  # The defect, verbatim in shape: ASCII possessive inside a single-quoted string.
  printf "export const A = [\n  { note:'this atlas's reading of two cited facts' },\n];\n" > "$bad"
  # The correct form: typographic apostrophe, inert inside single quotes.
  printf "export const A = [\n  { note:'this atlas\xe2\x80\x99s reading of two cited facts' },\n];\n" > "$good"
  if parses "$bad"; then
    echo "  FAIL did not fire on an ASCII possessive in a single-quoted string"; ok=0
  else
    echo "  ok   fires on the 4b2c8c5 defect shape (ASCII possessive breaks the literal)"
  fi
  if parses "$good"; then
    echo "  ok   passes the typographic-apostrophe form (the correct house style)"
  else
    echo "  FAIL rejected the curly-apostrophe form, which is valid"; ok=0
  fi
  rm -f "$bad" "$good"
  if [ $ok -eq 1 ]; then
    echo "SELFTEST PASS — the gate fires on the real defect and passes the real fix"
    exit 0
  fi
  echo "SELFTEST FAIL — do not trust a clean parse report from this build"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 2

n=0
broken=0
for f in $(find js -name '*.js' | sort) ; do
  n=$((n + 1))
  if ! parses "$f"; then
    broken=$((broken + 1))
    echo "  PARSE ERROR: $f"
    # Report the parse error against the copy but name the real file above it.
    cp "$f" "$TMP"
    node --check "$TMP" 2>&1 | sed -n '2,5p' | sed "s|$TMP|$f|"
  fi
done

# DONE line last (7-bis): a clean parse report is never a pass without it.
echo "DONE syntax_check: $n modules parsed as ESM, $broken with parse errors"
[ $broken -eq 0 ] || exit 1
