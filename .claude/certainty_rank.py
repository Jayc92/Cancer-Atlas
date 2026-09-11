# Certainty-drift ranking (2026-09-10, user: "rank every clause ... read the top of that list
# first"). Evidence for a human read, not a gate — declared NON_INSTRUMENT in battery.py for the
# same reason ccf_load.py is: it has a real corpus-wide population, but it asserts nothing about
# it, ratchets nothing, and emits no sidecar. Its job is ORDERING a fixed, already-written corpus
# for a bounded read, not covering it.
#
# WHAT IT SCORES: every note/ccf/text/desc/share field in js/organs/*.js carrying at least one
# unhedged strong/mechanistic verb (found/shows/demonstrates/confirms/establishes/causes/drives/
# leads-to/proves) and zero matches against a hedge-word list (suggests/proposes/may/might/
# possibly/potential/putative/implicat-/associat-/consistent-with/read-as/appears-to/likely).
# Ranked by count of distinct strong-verb families present, ties broken by file order — hedge
# absence against strength of mechanistic claim, exactly as specified.
#
# DO NOT TIGHTEN THE HEDGE-WORD LIST AFTER FINDING A FALSE POSITIVE. This is the one rule that
# matters more than any other in this file, so it is stated before the code rather than after it.
# Read this file's own first live run (2026-09-10): thyroid.js's ATM and KMT2D notes both scored at
# the TOP of the ranking, and both are already self-hedging in language this word list does not
# match — "the GENIE registry establishes that ATM mutations recur in this cancer, not that they
# drive it" and "no functional study of a driver role found here" are hedges in substance (a
# negation, an explicit absence statement) that no fixed word list can catch by pattern alone.
# THE ECONOMICS ARE INVERTED FROM A GATE (user): a gate's false positive costs a wasted commit and
# its false negative risks shipping a real defect, so a gate should be tightened toward precision.
# THIS instrument feeds a bounded human read: a false positive here costs exactly one read, already
# paid for by the time it is identified as one. A false negative is a PERMANENT, SILENT miss — the
# clause never gets flagged, never gets read, and nothing downstream will ever notice. Tightening
# the word list to eliminate a known false positive can only ever narrow recall, trading away real
# true positives at some unmeasured rate to remove one confirmed non-finding. Read past a false
# positive and record why (as this file's own header now does); do not patch the pattern that
# caught it. A future maintainer who narrows this regex to make the ranking quieter is making it
# worse at its actual job, not better — this paragraph is here so they read it first.
#
# THE STOPPING RULE, DEFINED BEFORE READING, NOT DECIDED BY JUDGMENT PARTWAY THROUGH (user: "define
# the stopping rule before reading ... an open-ended queue with no stopping rule is the liver share
# gap"). Read the ranked list in STRICT rank order, contiguous, never cherry-picked by which clause
# looks most checkable. Stop after 10 consecutive clean clauses, counted from the last defect (or
# from rank 1, if none has been found yet). Report the depth actually reached and the yield curve
# (clean/defect per rank), not just a final count — a stated depth without the curve invites the
# same "read roughly the top two-fifths" imprecision this file's own first round was corrected out
# of (24 claimed, 18 distinct ranks actually read, not contiguous).
#
# FIRST LIVE RUN (2026-09-10, this session, done by hand before this file existed — recorded here
# because the run cannot be replayed against a corpus that has since been edited by the very defect
# this ranking found): 58 clauses matched the population. Read in strict rank order, ranks 1-14:
# rank 4 (liver.js's TERT note) was a real, live certainty-drift instance — Nault et al.'s own
# "identified ... so far" had quietly become "the earliest known genetic event" — found and fixed
# in the same commit that added this file. Ranks 1-3 and 5-14 were clean (rank 2 the thyroid false
# positive named above). Ten consecutive clean since rank 4: the stopping rule is satisfied exactly
# at rank 14. Eight further ranks (16, 20, 21, 32, 33, 36, 43, 55) were spot-checked before this
# rule existed and also came back clean — reported as supplementary, not part of the rule-governed
# depth, since they were not contiguous and do not extend the streak.

import glob, os, re

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STRONG = re.compile(r'\b(found|shows?|demonstrat\w*|confirm\w*|establish\w*|caus\w*|drives?|'
                     r'driving|leads? to|proves?|prove[ds]?)\b', re.I)
HEDGE = re.compile(r'\b(suggest\w*|propos\w*|may\b|might\b|possibly|potential\w*|putative|'
                    r'implicat\w*|associat\w*|consistent with|read as|appear\w* to|likely)\b', re.I)
FIELD = re.compile(r"(?:note|ccf|text|desc|share):'((?:[^'\\]|\\.)*)'")


def rank(root=None):
    """Every strong-and-unhedged clause in js/organs/*.js, ranked by distinct strong-verb-family
    count descending, ties broken by (file, line). Returns a list of dicts; pure, so a fixture can
    drive it without a repo."""
    root = root or REPO_ROOT
    rows = []
    for f in sorted(glob.glob(os.path.join(root, 'js/organs/*.js'))):
        rel = os.path.relpath(f, root)
        src = open(f, encoding='utf-8').read()
        for m in FIELD.finditer(src):
            field = m.group(1)
            ln = src[:m.start()].count('\n') + 1
            strong_hits = STRONG.findall(field)
            hedge_hits = HEDGE.findall(field)
            if strong_hits and not hedge_hits:
                rows.append({
                    'file': rel, 'line': ln,
                    'strength': len(set(t.lower() for t in strong_hits)),
                    'strong_terms': sorted(set(t.lower() for t in strong_hits)),
                    'field': field,
                })
    rows.sort(key=lambda r: (-r['strength'], r['file'], r['line']))
    return rows


def selftest():
    ok = True

    def arm(good, label):
        nonlocal ok
        ok &= bool(good)
        print(f"  {'ok  ' if good else 'FAIL'} {label}")

    fixture_dir = '/tmp/ca-certainty-rank-selftest-fixture'
    os.makedirs(os.path.join(fixture_dir, 'js', 'organs'), exist_ok=True)
    open(os.path.join(fixture_dir, 'js', 'organs', 'a.js'), 'w', encoding='utf-8').write(
        "const X = [\n"
        "  { note:'This confirmed and demonstrated a real driving mechanism (Smith, 2020).' },\n"
        "  { note:'This suggests a possible mechanism, though it may not drive anything.' },\n"
        "  { ccf:'A found figure with no hedge at all here.' },\n"
        "]\n"
    )
    rows = rank(fixture_dir)
    arm(len(rows) == 2,
        'the hedged clause (line 3) is excluded even though it contains a strong verb ("drive") '
        '-- hedge presence is a hard gate, not a tiebreaker')
    arm(rows[0]['strength'] == 3 and rows[0]['line'] == 2,
        'the three-strong-verb clause ("confirmed", "demonstrated", "driving") ranks first, strength 3')
    arm(rows[1]['strength'] == 1 and rows[1]['line'] == 4,
        'the one-strong-verb clause ("found") ranks second, strength 1')
    arm(rows[0]['strong_terms'] == ['confirmed', 'demonstrated', 'driving'],
        'distinct strong-verb families are captured and de-duplicated by lowercase form')

    open(os.path.join(fixture_dir, 'js', 'organs', 'a.js'), 'w', encoding='utf-8').write(
        "const X = [{ note:'Nothing strong or hedged here at all.' }]\n"
    )
    arm(rank(fixture_dir) == [], 'a field with neither a strong verb nor a hedge word ranks '
                                 'nowhere -- absence of a strong verb excludes it too, not just '
                                 'the presence of a hedge')

    import shutil
    shutil.rmtree(fixture_dir, ignore_errors=True)

    print('SELFTEST', 'PASS — hedge presence gates a clause out even with a strong verb present; '
          'strength counts distinct verb families, not raw hits; an unhedged, non-strong clause '
          'ranks nowhere'
          if ok else 'FAIL — do not trust the ranking')
    return ok


if __name__ == '__main__':
    import sys
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    rows = rank()
    print(f"{len(rows)} strong-and-unhedged clauses ranked by distinct strong-verb-family count "
          f"(hedge absence x mechanistic-claim strength) -- read in STRICT rank order, stop after "
          f"10 consecutive clean since the last defect (see this file's own header for why)\n")
    for i, r in enumerate(rows, 1):
        print(f"{i:2d}. [{r['strength']}] {r['file']}:{r['line']}  terms={r['strong_terms']}")
        print(f"    {r['field'][:230]}")
    print(f"\nDONE certainty_rank: {len(rows)} ranked, evidence for a human read, not a gate")
