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
import os as _os_t; sys.path.insert(0, _os_t.path.dirname(_os_t.path.abspath(__file__)))
from tolerated import resolve
# THE LIVER GAP, OWNED AND DATED (2026-09-10; see tolerated.py). 'Human reads the label' was an instruction with no
# owner and no date, so it was coverage the check was not providing (user). The family's stated shares leave ~12.5%
# unaccounted; whether that remainder is the rarer primaries the family does not list or a transplanted denominator
# is the re-read owed by the date below — after it, the declaration expires and the gate goes red.
DECLARED = [
    {'key': 'liver', 'reason': 'sum 87.5: the listed primaries leave ~12.5% of the family unaccounted; re-read the cited liver-cancer epidemiology source for the remainder, then either add the missing row or scope the label to the primaries listed', 'until': '2026-10-01'},
    # KIDNEYS, PERMANENT WITH REASON (2026-09-13, ordinary-organ batch, papillary/chromophobe RCC
    # going active): the three modeled entries (clear cell ~75%, papillary ~9-13%, chromophobe
    # ~2-4%) are the field's own "big three" convention, not a claimed partition of every RCC —
    # WHO 2016+ recognizes real, rarer RCC entities beyond them (unclassified RCC, collecting duct
    # carcinoma, renal medullary carcinoma, MiT family translocation RCC, SDH-deficient RCC, and
    # others), several confirmed as real, currently-trialed entities via this same commit's own
    # live ClinicalTrials.gov sample (e.g. "Translocation Renal Cell Carcinoma," "Renal Medullary
    # Carcinoma," "Succinate Dehydrogenase-Deficient Renal Cell Carcinoma" all appeared as real hits
    # in the parent kidney-cancer corpus). The ~11-point gap is that real remainder, not a coverage
    # hole in these three entries' own cited figures — no re-read is owed unless a fourth RCC
    # subtype is ever added to this organ.
    {'key': 'kidneys', 'reason': 'sum 89.0: clear cell + papillary + chromophobe are the field\'s "big three" RCC subtypes, not every RCC subtype WHO recognizes; the ~11-point remainder is real rarer entities (unclassified RCC, collecting duct carcinoma, renal medullary carcinoma, MiT family translocation RCC, SDH-deficient RCC) this organ does not model, not a gap in the three modeled entries\' own figures'},
    # breast is DELIBERATELY ABSENT here, on the STALE-declaration rule (tolerated.py; CLAUDE.md's
    # "AN UNDECLARED COUNT IS EVIDENCE OF AN UNREAD COUNT"): a declaration was written for breast at
    # authoring time (2026-09-13, phaseC_design.md §17) on the correct structural grounds — TNBC (a
    # receptor-defined entry) and the organ's histologic entries (IDC-NST, ILC) OVERLAP rather than
    # partition, so no coherent sum was ever guaranteed — but the check's own arithmetic (10-20% +
    # 73-78% + 10.6-10.7%) lands COHERENT at ~101.2 by coincidence, not by any actual partition. The
    # declaration was REMOVED because it no longer matches a live flag, per tolerated.py's own rule
    # that a stale declaration must be removed, not kept "just in case" — but the structural fact it
    # recorded is still true and still stated elsewhere: phaseC_design.md §17, the retirement
    # comment above breast.js's own `cancerEntries`, and the organ's reader-facing description.
]
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it passed GREEN over an EMPTY corpus (0 families checked). Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
    gap_flags = {}   # family → verdict; resolved against DECLARED
    corpus = sorted(glob.glob('js/organs/*.js'))
    if not corpus:   # a glob that resolved to nothing is a VACUOUS PASS — the dangerous form (sweep, 2026-09-09)
        print('share_sum_check: REFUSING TO REPORT — the corpus glob resolved to nothing'); sys.exit(3)
    for f in corpus:
        src = open(f, encoding='utf-8').read()
        shares = [m.group(1) for m in re.finditer(r"share:'((?:[^'\\]|\\.)*)'", src)]
        if not shares: continue
        name, verdict, s, ex = check_family(f.split('/')[-1][:-3], shares)
        print(f'  {name:<9} {verdict}')
        families += 1
        if verdict.startswith('GAP'): gaps += 1; gap_flags[name] = verdict
    # DONE line last (2026-09-05 sweep): a mid-loop crash must not read as a short clean
    # list — absence-of-flags is never a pass.
    problems = resolve('share_sum_check', gap_flags, DECLARED)
    print(f'DONE share_sum_check: {families} families checked, {gaps} gap flags, {len(problems)} tolerated-count problems')
    if problems:
        sys.exit(1)
