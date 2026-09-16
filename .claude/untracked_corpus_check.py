#!/usr/bin/env python3
"""untracked_corpus_check.py (2026-09-15) — refuses when a file on disk matches the citation
corpus's own pattern (js/organs/*.js) but git does not track it.

THE INCIDENT THIS CLOSES: js/organs/uterus.js sat untracked in the working tree for this entire
organ's authoring pass. Every citation instrument in this project (extract_citations.py, and by
extension citation_crosscheck.py, citation_paren_ledger.py, citation_reach_check.py,
citation_head_check.py, fraction_check.py, duplicate_figure_check.py) derives its own corpus from
`git ls-files` rather than a filesystem glob — a DELIBERATE choice (see extract_citations.py's own
corpus_paths(), "a ratcheted metric must derive from tracked files") that closes one real hole (an
untracked scratch file inflating a ratchet no fresh checkout can reproduce) while opening another:
`git ls-files` cannot see a file git doesn't know about, so EVERY standalone run of every one of
those instruments against this session's own working tree was silently examining a corpus that did
not include the file actually under test at all — a "clean" result that proved nothing. Found only
by accident, when `commit_checked.sh --worktree`'s own `git add` finally staged the file and two
real, previously-invisible problems surfaced in the very same commit that landed it (see
RULINGS.md and CLAUDE.md's dated entry for the specifics).

THE FIX IS NOT "widen the glob" — extract_citations.py's own tracked-files discipline is correct
and stays exactly as it is. The fix is a SEPARATE, standing check whose only job is to notice the
gap and refuse loudly, the same way this project's other instruments refuse rather than silently
degrade: any file on disk matching the corpus's own directory+extension pattern that git does not
track is a problem, unconditionally — there is no legitimate reason for such a file to exist
un-flagged. If it's meant to ship, stage it. If it's a scratch draft, it does not belong under
js/organs/ at all.

Deliberately narrow in scope: this checks ONLY the citation corpus's own population
(js/organs/*.js, non-recursive) — imported from extract_citations.py's own corpus_paths()/
CORPUS_DIR/CORPUS_EXT rather than re-deriving the pattern, so the two populations can never drift
apart, the same "import, don't keep a byte-identical copy of the same glob" discipline
citation_paren_ledger.py already uses. A general untracked-file sweep across the whole repo is a
judgement call for a human (see commit_checked.sh's own "GATE THE TREE YOU'RE COMMITTING" note on
why an untracked file is ambiguous there — draft, or forgotten?); this is not that. It is scoped to
the one population several OTHER instruments already silently assume is complete, where "assumed
complete" turned out, once, to be false for an entire organ's worth of citations.
"""
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_citations import REPO_ROOT, CORPUS_DIR, CORPUS_EXT, corpus_paths  # noqa: E402


def tracked_corpus():
    return set(corpus_paths())


def filesystem_corpus():
    pattern = os.path.join(REPO_ROOT, CORPUS_DIR, '*.' + CORPUS_EXT)
    found = []
    for p in glob.glob(pattern):
        rel = os.path.relpath(p, REPO_ROOT)
        found.append(rel.replace(os.sep, '/'))
    return set(found)


def untracked(fs=None, tracked=None):
    fs = filesystem_corpus() if fs is None else fs
    tracked = tracked_corpus() if tracked is None else tracked
    return sorted(fs - tracked)


def selftest():
    ok = True
    # condition (7): shown capable of firing, not just passing on the current clean tree.
    got = untracked({'js/organs/uterus.js', 'js/organs/ovary.js'}, {'js/organs/ovary.js'})
    if got == ['js/organs/uterus.js']:
        print("  ok   fires when a filesystem file matching the corpus pattern is not tracked")
    else:
        print(f"  FAIL did not fire on an untracked corpus file, got {got}")
        ok = False
    # and must NOT fire on a fully-tracked population — otherwise every clean run would refuse.
    got2 = untracked({'js/organs/ovary.js', 'js/organs/colon.js'},
                      {'js/organs/ovary.js', 'js/organs/colon.js'})
    if got2 == []:
        print("  ok   silent when every filesystem file matching the pattern is tracked")
    else:
        print(f"  FAIL fired on a fully-tracked population, got {got2}")
        ok = False
    # a tracked file that no longer exists on disk (deleted, staged for removal) must not confuse
    # the comparison — it's absent from BOTH sets, not present in `tracked` alone.
    got3 = untracked({'js/organs/ovary.js'}, {'js/organs/ovary.js', 'js/organs/removed.js'})
    if got3 == []:
        print("  ok   a tracked-but-deleted file (staged removal) does not fire")
    else:
        print(f"  FAIL a staged removal produced a false positive, got {got3}")
        ok = False
    print(f"DONE untracked_corpus_check_selftest: 3 arms run, {0 if ok else '1+'} failures")
    return ok


def main():
    if not selftest():
        print("SELFTEST FAIL — do not trust this instrument's own refusal", file=sys.stderr)
        sys.exit(1)
    problems = untracked()
    for f in problems:
        print(f"PROBLEM: UNTRACKED CORPUS FILE {f} — every citation instrument in this project "
              f"derives its corpus from `git ls-files`, which cannot see this file. Standalone "
              f"verification against it will silently examine less than the working tree actually "
              f"holds. Stage it if it's meant to ship, or move it out of js/organs/ if it is not.")
    print(f"DONE untracked_corpus_check: {len(tracked_corpus())} tracked corpus file(s), "
          f"{len(problems)} untracked file(s) matching the corpus pattern, "
          f"{len(problems)} problems")
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
