#!/usr/bin/env python3
"""handoff_denylist_check.py (2026-09-15) — a small, mechanical denylist over .claude/handoff/*.md,
built the same day a real leak reached it.

THE INCIDENT: MEMORY_history-archive.md (this package's own copied-in, verbatim project-memory
archive) contained a full, identifying account of an earlier incident — personal medical documents
belonging to a family member of this repo's owner, found untracked in the working tree at the time.
The account named the family member and quoted the literal filenames of the documents. It reached
`origin/main` once before being caught, scrubbed, and force-pushed over (see STATE.md's own account
of the remedy and its real limits). `battery.py`'s existing machine-path guard (assertion 6) could
not have caught it: that guard matches absolute-path SHAPES, and this leak had no path component at
all — a bare filename and a first name are invisible to a check built to find `/Users/<name>/...`.

THIS IS NOT A GENERAL PII SCANNER. It is a targeted denylist for the specific strings this one
incident is known to have contained, scoped specifically to the one directory this project ships to
a public reader as its own operating record. Finding a fifth string that also shouldn't be here is
a job for a human doing another full sweep (see STATE.md's own account of the one this incident
triggered) — this check exists so the four strings that already leaked once can never leak again
silently, not so nobody ever has to look again.

DENYLIST, kept short and named rather than generated, on purpose — a check whose own list is opaque
is a check nobody can audit at a glance:
  - the family surname from the redacted incident
  - the three document titles the redacted incident quoted verbatim
  - any email address (a generic pattern, not a specific string — the one class in this list that
    is genuinely general-purpose, because a repo's own operating record has no legitimate reason to
    carry anyone's email address at all, and "declare the ones that are fine" would be exactly the
    kind of ad hoc exception list this project's own tolerated-count rule warns against building for
    a check that should just always be zero)

Refuses the same way every other content check in this chain does: any hit is a hard failure, no
DECLARED/tolerated-with-reason mechanism, because there is no legitimate reason for any of these
four shapes to appear in this package — unlike, say, a citation attribution artifact, where a real
false positive can exist and deserves a recorded reason, nothing here has a benign form.
"""
import glob
import os
import re
import sys

HANDOFF_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                            '.claude', 'handoff')

# Kept as plain strings, not further obfuscated — obfuscating the denylist itself would make this
# file the one place a future reader could NOT grep to find out what it's protecting against.
DENYLIST = [
    'carfagno',
    'medical recap',
    'findings via claude',
    'tissue exam',
]
EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
# noreply@anthropic.com is this project's own commit co-author trailer convention, appearing in
# quoted commit-message examples inside this package's own prose (e.g. OPERATING_CONTRACT.md's
# discussion of commit form) — declared benign by name rather than silently excluded, so a reader
# of this file can see the one address this check will not flag and why.
EMAIL_BENIGN = {'noreply@anthropic.com'}


def scan_text(text):
    hits = []
    lowered = text.lower()
    for term in DENYLIST:
        if term in lowered:
            hits.append(('denylist', term))
    for m in EMAIL_RE.finditer(text):
        addr = m.group(0)
        if addr.lower() not in EMAIL_BENIGN:
            hits.append(('email', addr))
    return hits


def scan_files():
    problems = []
    paths = sorted(glob.glob(os.path.join(HANDOFF_DIR, '*.md')))
    for path in paths:
        with open(path, encoding='utf-8', errors='replace') as f:
            text = f.read()
        for kind, needle in scan_text(text):
            rel = os.path.relpath(path, os.path.dirname(os.path.dirname(HANDOFF_DIR)))
            problems.append((rel, kind, needle))
    return problems


def selftest():
    ok = True
    # condition (7): shown capable of firing on each denylist class, not just passing on the
    # current clean package.
    for term in DENYLIST:
        hits = scan_text(f'some prose mentioning {term} in passing')
        if any(h[1] == term for h in hits):
            print(f"  ok   fires on denylist term '{term}'")
        else:
            print(f"  FAIL did not fire on denylist term '{term}'")
            ok = False
    email_hits = scan_text('contact jane.doe@example.com for more')
    if any(k == 'email' for k, _ in email_hits):
        print("  ok   fires on a generic email address")
    else:
        print("  FAIL did not fire on a generic email address")
        ok = False
    benign_hits = scan_text('Co-Authored-By: Claude <noreply@anthropic.com>')
    if benign_hits == []:
        print("  ok   the declared-benign address does not fire")
    else:
        print(f"  FAIL the declared-benign address fired: {benign_hits}")
        ok = False
    clean_hits = scan_text('this sentence has nothing in the denylist and no email address at all')
    if clean_hits == []:
        print("  ok   clean prose produces zero hits")
    else:
        print(f"  FAIL clean prose produced hits: {clean_hits}")
        ok = False
    print(f"DONE handoff_denylist_check_selftest: {len(DENYLIST) + 3} arms run, "
          f"{0 if ok else '1+'} failures")
    return ok


def main():
    if not selftest():
        print("SELFTEST FAIL — do not trust this instrument's own refusal", file=sys.stderr)
        sys.exit(1)
    problems = scan_files()
    for rel, kind, needle in problems:
        label = 'email address' if kind == 'email' else 'denylisted term'
        print(f"PROBLEM: {rel} contains a {label}. The specific text is not printed here on "
              f"purpose (this message can be archived into the tracked refusal log, which would "
              f"move the leak into the index) — open the file and search for it directly.")
    print(f"DONE handoff_denylist_check: {len(glob.glob(os.path.join(HANDOFF_DIR, '*.md')))} "
          f"handoff files scanned, {len(problems)} problems")
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
