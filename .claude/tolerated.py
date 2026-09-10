"""tolerated.py — ONE mechanism for every instrument that tolerates a non-zero count (2026-09-10, user ruling).

THE RULE: every tolerated non-zero count resolves to FIXED, DECLARED-WITH-REASON, or DATED-FOR-RE-READ. No count persists
as a bare number. WHY (user): an undeclared count is evidence of an UNREAD count — if someone had read it and found it
benign they would have declared it benign — so bare numbers accumulate real defects by construction. Two confirmed
instances made it a mechanism: the regression's "2 known failures" (two live label overlaps, published in every report
and matched by everyone) and the crosscheck's "3 flags" (three real record-format defects, a journal in the author
field). This is the regression's KNOWN_FAILURES shape, ported once rather than reinvented per instrument.

HOW AN INSTRUMENT USES IT: it computes its flags as a dict {key: detail}, keeps a DECLARED list of dicts
{'key': ..., 'reason': ..., 'until': 'YYYY-MM-DD' or None} beside its other declarations, and calls
resolve(name, flags, DECLARED). The call PRINTS the verdict block and RETURNS the list of problems:
  - an UNDECLARED flag is a problem (fatal to the instrument's exit code);
  - an EXPIRED declaration ('until' in the past) is a problem — the re-read is owed, the tolerance is over;
  - a STALE declaration (declared but no longer flagged) is a problem — remove it, the record must match the world;
  - a declaration with no 'until' is PERMANENT and must say why in its reason (a false positive with the mechanism named).
Keys are the instrument's choice but must be stable under line shifts where possible (content, not line numbers).
"""
import datetime


def resolve(name, flags, declared, today=None):
    """Print the verdict block for one instrument's tolerated counts; return the list of problems (empty = clean)."""
    today = today or datetime.date.today().isoformat()
    declared_by_key = {d['key']: d for d in declared}
    problems, tolerated_dated, tolerated_permanent = [], 0, 0
    for key, detail in sorted(flags.items()):
        d = declared_by_key.get(key)
        if d is None:
            problems.append(f'UNDECLARED {name} flag {key!r}: {detail} — fix it, declare it with a reason, or date it for re-read')
        elif d.get('until') and d['until'] < today:
            problems.append(f'EXPIRED declaration for {name} flag {key!r} (until {d["until"]}): re-read owed — {d["reason"]}')
        elif d.get('until'):
            tolerated_dated += 1
        else:
            tolerated_permanent += 1
    for key, d in declared_by_key.items():
        if key not in flags:
            problems.append(f'STALE declaration for {name} flag {key!r}: no longer flagged — remove the declaration')
        if not d.get('reason') or len(d['reason']) < 20:
            problems.append(f'declaration for {name} flag {key!r} carries no real reason')
    print(f'  {name}: {len(flags)} flag(s) — {tolerated_dated} dated for re-read, {tolerated_permanent} permanent with reason, '
          f'{len(problems)} problem(s)')
    for p in problems:
        print(f'  PROBLEM: {p}')
    return problems


def selftest():
    ok = True
    def arm(good, label):
        nonlocal ok; ok &= bool(good); print(f"  {'ok  ' if good else 'FAIL'} {label}")
    arm(resolve('t', {'a': 'x'}, [], today='2026-09-10') and True, 'an undeclared flag is a problem')
    arm(not resolve('t', {'a': 'x'}, [{'key': 'a', 'reason': 'a false positive: the matcher pairs two unrelated figures', 'until': None}], today='2026-09-10'), 'a permanent declaration with a reason is silent')
    arm(resolve('t', {'a': 'x'}, [{'key': 'a', 'reason': 'deliberate different denominators, re-read owed', 'until': '2026-09-01'}], today='2026-09-10'), 'an expired dated declaration is a problem')
    arm(not resolve('t', {'a': 'x'}, [{'key': 'a', 'reason': 'deliberate different denominators, re-read owed', 'until': '2026-10-01'}], today='2026-09-10'), 'an unexpired dated declaration is silent')
    arm(resolve('t', {}, [{'key': 'a', 'reason': 'was a false positive once, now fixed in the corpus', 'until': None}], today='2026-09-10'), 'a stale declaration is a problem')
    arm(resolve('t', {'a': 'x'}, [{'key': 'a', 'reason': 'meh', 'until': None}], today='2026-09-10'), 'a declaration with no real reason is a problem')
    print(f"DONE tolerated_selftest: 6 arms run, {0 if ok else 1} failures")
    return ok


if __name__ == '__main__':
    import sys
    sys.exit(0 if selftest() else 1)
