# Fraction/percentage agreement check (2026-09-05). Third source-free detector: many
# on-screen strings state the same claim TWICE — a percentage and its underlying fraction
# ("~92% ... (48,789/53,142": 48,789/53,142 = 91.8%). Nothing verified that the two halves
# agree, and THE REMEDIATION HAS BEEN ADDING THEM: the bladder edit introduced
# "48,789/53,142" beside an existing "~92%", the testis edit introduced "22,634/35,066" —
# fresh disagreement opportunities created by the same process that finds the defects, with
# no check behind it. Same shape as the Paly edit spawning a shadowing case: the repair
# introduces the risk. Distinct from share_sum_check (siblings across a family); this
# compares two representations of ONE claim inside ONE string.
#
# DESIGN CARE IS IN THE TOLERANCE (user ruling), the way share-sum's was in the exempt
# labels: "~92%" from 91.8% must pass; a range like "70–79%" needs both endpoints matched
# against their two fractions (Allory's 78/111 = 70.3 and 283/357 = 79.3); a rounded figure
# gets tolerance from its own stated precision, never exact equality. Outside tolerance is
# a free find with zero source access.
#
# WEAKER SIBLING included: strings carrying TWO DISTINCT YEAR RANGES (the anaplastic row's
# 1974–2013 cases / 1994–2013 deaths proved the class) are listed for a human
# confirms-deliberate read — tiny population, no verdict automated.
#
# Condition (7) at birth: fires on a synthetic mismatch, passes the real ~92/91.8 and
# range/endpoint cases. Condition (8): first live run is calibration. The tool FLAGS; the
# human rules.
import re, sys, glob, html

FIELDS = re.compile(r"(?:share|ccf|note|text|val|sub|intro):'((?:[^'\\]|\\.)*)'")
FRac = re.compile(r'(\d{1,3}(?:,\d{3})+|\d+)/(\d{1,3}(?:,\d{3})+|\d+)')
PCT = re.compile(r'([~>]?)\s*(\d+(?:\.\d+)?)\s*(?:[–-]\s*(\d+(?:\.\d+)?))?\s*%')
YEARRANGE = re.compile(r'\b((?:19|20)\d{2})\s*[–-]\s*((?:19|20)\d{2})\b')

def num(s): return float(s.replace(',', ''))

def tolerance(txt, approx):
    if '.' in txt: return 0.15          # stated to a decimal: near-exact
    return 1.0 if approx else 0.6       # "~92" is a soft round; bare "92" tighter

def check_string(t):
    t = html.unescape(t.replace('&ndash;', '–').replace('&mdash;', '—'))
    flags = []
    for clause in re.split(r';|—', t):
        fracs = [(m.start(), num(m.group(1)) / num(m.group(2)) * 100,
                  f'{m.group(1)}/{m.group(2)}')
                 for m in FRac.finditer(clause) if num(m.group(2)) >= 20]
        pcts = [(m.start(), m.group(1) == '~', num(m.group(2)),
                 num(m.group(3)) if m.group(3) else None, m.group(0).strip(),
                 m.group(2) + (m.group(3) or ''))
                for m in PCT.finditer(clause) if '>' not in m.group(1)]
        if not fracs or not pcts: continue
        for fpos, fval, ftxt in fracs:
            # nearest percent token (prefer the closest preceding one)
            best = min(pcts, key=lambda p: (abs(p[0] - fpos) + (0 if p[0] < fpos else 15)))
            _, approx, lo, hi, ptxt, digits = best
            tol = tolerance(digits, approx)
            if hi is not None:      # range: fraction must sit near either endpoint
                ok = min(abs(fval - lo), abs(fval - hi)) <= tol or lo - tol <= fval <= hi + tol
            else:
                ok = abs(fval - lo) <= tol
            if not ok:
                flags.append((ptxt, ftxt, round(fval, 2)))
    return flags

FIXTURES = [
    ('~92% of the four commonest types (48,789/53,142, Park)', [], 'real bladder pair'),
    ('~64.5% of tumors (22,634/35,066 in a registry)', [], 'real testis pair'),
    ('~65–79% across cohorts (65.4%, 214/327; 70–79% in two cohorts)', [], 'range forms'),
    ('~20% of deaths (471/2,371, 1994–2013)', [], 'real anaplastic pair'),
    ('~92% of the four commonest types (40,000/53,142, Park)', ['fire'], 'synthetic drift'),
]

def selftest():
    ok = True
    for t, want, label in FIXTURES:
        got = check_string(t)
        good = bool(got) == bool(want)
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {got or 'clean'}")
    print('SELFTEST', 'PASS — fires on drift, passes real pairs within tolerance'
          if ok else 'FAIL — do not trust the scan')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    print()
    checked = flagged = 0
    tworange = []
    for f in sorted(glob.glob('js/organs/*.js')):
        src = open(f, encoding='utf-8').read()
        for m in FIELDS.finditer(src):
            t = m.group(1)
            ln = src[:m.start()].count('\n') + 1
            if FRac.search(t) and '%' in t:
                checked += 1
                for ptxt, ftxt, fval in check_string(t):
                    flagged += 1
                    print(f'  MISMATCH? {f.split("/")[-1][:-3]}:{ln}  stated {ptxt} vs '
                          f'{ftxt} = {fval}%')
            yrs = {(a, b) for a, b in YEARRANGE.findall(html.unescape(t))}
            if len(yrs) >= 2:
                tworange.append((f.split('/')[-1][:-3], ln, sorted(yrs)))
    print(f'TWO-YEAR-RANGE strings (human confirms-deliberate): {len(tworange)}')
    for f, l, y in tworange: print(f'   {f}:{l}  {y}')
    # DONE line last (2026-09-05 sweep): absence-of-flags is never a pass.
    print(f'DONE fraction_check: {checked} strings with fraction+percent, '
          f'{flagged} mismatch flags')
