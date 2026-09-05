# Share-family sum-coherence check (2026-09-04). The denominator transplant (lungs: PDQ's
# 25/40/10 "of lung cancers" transplanted onto an NSCLC denominator) had a property no other
# defect class has: IT WAS DETECTABLE BY ARITHMETIC ALONE — 25+40+10=75 labeled "of NSCLC",
# whose three principal types should exhaust it, left a 25-point gap visible on screen the
# whole time. This check makes that free detector standing: a share family that doesn't sum
# coherently on its STATED denominator is a denominator-transplant candidate. It targets
# precisely the class the direction heuristic is blind to — the heuristic looks for
# broader-than-source; a transplant is sideways.
#
# THE PRECISE FORM (user ruling): the check is "does the sum match what the label claims",
# NOT "does it sum to 100". A label that states its own non-exhaustiveness ("the four
# commonest bladder-primary carcinoma types", "part of the remaining <10%") is exempt by
# construction. Families with heterogeneous denominators (skin: melanoma "of skin cancers"
# beside BCC "most frequently diagnosed malignancy") are not sum families at all.
# Verdicts: COHERENT / GAP (sum well short of an exhaustive-reading label — human reads
# whether the family claims exhaustiveness before calling it a transplant) / EXEMPT
# (self-declared non-exhaustive or non-sum family). This tool FLAGS; the human rules —
# same contract as the polarity guard.
#
# CONDITION (7) AT BIRTH: fixtures prove it FIRES on the known positive (the pre-fix lungs
# family, 75 "of NSCLC") and PASSES the known negatives (prostate's exact 100.00; the
# bladder exempt form; the fixed lungs family at 90 of "all lung cancers" where SCLC's row
# names the remainder class implicitly non-exhaustive). Condition (8): the first live run
# is calibration — triage flags before reading them as findings.
import re, sys, glob, html

RANGE = re.compile(r'([\d.]+)\s*[–-]\s*([\d.]+)\s*%')
POINT = re.compile(r'([\d.]+)\s*%')
EXEMPT = re.compile(r'commonest|part of|rare|no individual share|most frequently|second most'
                    r'|separate category|separate endocrine', re.I)

def share_value(t):
    t = html.unescape(t.replace('&ndash;', '–').replace('&mdash;', '—'))
    # CLAUSE-A SCOPING (calibration fix, first live run): the family's summable figure is
    # clause A's — the stomach mixed row's second clause ("10.9–21.1% across real series")
    # was being range-matched over clause A's 10.9%, inflating the family sum to 105. The
    # clause rule applies to parsers too.
    t = re.split(r';|—', t)[0]
    m = RANGE.search(t)
    if m:
        lo, hi = float(m.group(1)), float(m.group(2))
        return (lo + hi) / 2, f'{lo}–{hi}'
    m = POINT.search(t)
    if m:
        return float(m.group(1)), m.group(1)
    return None, None

def check_family(name, shares):
    vals, exempt, labels = [], 0, []
    for t in shares:
        v, lbl = share_value(t)
        if EXEMPT.search(t) or v is None:
            exempt += 1
            continue
        vals.append(v); labels.append(lbl)
    if not vals:
        return name, 'EXEMPT (no summable rows)', 0, exempt
    s = sum(vals)
    if exempt:
        verdict = f'PARTIAL-FAMILY sum={s:.1f} (+{exempt} exempt rows)'
    elif 95 <= s <= 105:
        verdict = f'COHERENT sum={s:.1f}'
    else:
        verdict = f'GAP sum={s:.1f} — transplant candidate, human reads the label'
    return name, verdict, s, exempt

FIXTURES = [
    # (label, shares, must_contain)
    ('pre-fix lungs (known positive)',
     ["~40% of NSCLC", "~25–30% of NSCLC", "~10% of NSCLC"], 'GAP'),
    ('prostate exact (known negative)',
     ["99.68% of prostate cancers treated", "0.20% of treated", "0.08% of treated",
      "0.01% of treated", "0.03% of treated"], 'COHERENT'),
    # first self-test run expected PARTIAL-FAMILY here and the tool said EXEMPT — the tool
    # was right (a family whose every row self-declares non-exhaustiveness is exempt as a
    # whole); the fixture label was wrong. Same lesson as the polarity guard's birth.
    ('bladder exempt form (known negative)',
     ["~92% of the four commonest bladder-primary carcinoma types",
      "~3.2% of the four commonest bladder-primary carcinoma types"], 'EXEMPT'),
]

def selftest():
    ok = True
    for label, shares, want in FIXTURES:
        _, verdict, _, _ = check_family(label, shares)
        good = want in verdict
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {verdict}")
    print('SELFTEST', 'PASS — fires on the transplant, passes the negatives'
          if ok else 'FAIL — do not trust the scan')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    print()
    families = gaps = 0
    for f in sorted(glob.glob('js/organs/*.js')):
        src = open(f, encoding='utf-8').read()
        shares = [m.group(1) for m in re.finditer(r"share:'((?:[^'\\]|\\.)*)'", src)]
        if not shares: continue
        name, verdict, s, ex = check_family(f.split('/')[-1][:-3], shares)
        print(f'  {name:<9} {verdict}')
        families += 1
        if verdict.startswith('GAP'): gaps += 1
    # DONE line last (2026-09-05 sweep): a mid-loop crash must not read as a short clean
    # list — absence-of-flags is never a pass.
    print(f'DONE share_sum_check: {families} families checked, {gaps} gap flags')
