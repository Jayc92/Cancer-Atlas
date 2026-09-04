# Citation polarity guard (2026-09-04). Born from the Boutros failure class: the sweep-1
# resolver attached a PMID to a comment stating the citation DOES NOT EXIST. A token-matching
# pass has no notion of a claim's polarity — an authorship-correction note, a "checked and NOT
# confirmed" caveat, and a straight assertion all carry the same author-plus-year tokens and
# get decorated identically. The epi pass reads the same lines, so it gets the same guard:
# any citation-shaped string inside a corrective window is flagged for a HUMAN mention-level
# read before automated action (verify / resolve / "fix"). The guard classifies WINDOWS, not
# mentions — window-level regexes cannot tell the negated mention (Colombino) from the
# correction target (Jakob) two tokens later, and pretending otherwise would be a confident
# wrong answer of exactly the kind this project retracts. Flag → human reads → then act.
#
# STANDING CONDITION (7) APPLIED AT BIRTH — "a check that reports zero must be demonstrated
# capable of reporting non-zero before its zero is believed": --selftest runs the guard over
# embedded fixtures (real lines captured from this repo on 2026-09-04, four known-corrective,
# three known-clean) and FAILS unless it both fires and stays silent where it should. The scan
# refuses to run if the self-test fails, so a silent regression in the marker set cannot
# produce a trusted all-clean scan.
#
# Usage:
#   python3 .claude/citation_polarity.py --selftest
#   python3 .claude/citation_polarity.py <records.json>   # prints per-record window verdicts
import json, re, sys

MARKERS = {
    'negated': [
        r'wrong\s+source', r'does\s+not\s+exist', r'not\s+found\s+citable',
        r'was\s+not\s+found\s+in', r'mis-?citation', r'misattribut', r'wrongly\s+attributed',
        r'authorship\s+correction', r'\bretracted\b', r'originally\s+attributed',
        r'attributed\s+to\s+[^.]{0,50}\bwrong\b',
    ],
    'caveated': [
        r'could\s+not\s+be\s+verified', r'not\s+confirmed', r'\bunverified\b',
        r'checked\s+and\s+not', r'\brefuted\b', r'\bdisputed\b', r'\bpaywall',
        r'the\s+claim\s+is\s+not\s+used',
    ],
}
COMPILED = {k: [re.compile(p, re.I) for p in v] for k, v in MARKERS.items()}

def classify_window(text):
    hits = {k: [p.pattern for p in ps if p.search(text)] for k, ps in COMPILED.items()}
    hits = {k: v for k, v in hits.items() if v}
    if 'negated' in hits: return 'corrective-window', hits
    if 'caveated' in hits: return 'caveated-window', hits
    return 'clean', {}

def window_for(path, line_no, radius=3):
    lines = open(path, encoding='utf-8').read().splitlines()
    lo, hi = max(0, line_no - 1 - radius), min(len(lines), line_no + radius)
    return ' '.join(re.sub(r'^\s*//\s?', '', x) for x in lines[lo:hi])

# --- condition (7) fixtures: captured verbatim from this repo, 2026-09-04 --------------------
FIXTURES_MUST_FIRE = [
    # prostate.js:139 — the Boutros anti-citation (the class-defining case)
    ('AUTHORSHIP CORRECTION — the task\'s suggested source, "Boutros et al., Nature Genetics, '
     '2015," does not exist as a first-author paper.', 'negated'),
    # skin.js:296 — negated mention (Colombino) beside its correction target (Jakob)
    ('The brief\'s "0.6% of 677" BRAF+NRAS figure was attributed to Colombino 2012 — WRONG '
     'SOURCE: traced through the citing review\'s reference list to Jakob et al., Cancer, 2012',
     'negated'),
    # stomach.js:144 — folkloric figure rejected. First self-test run expected 'caveated' and
    # the guard returned 'corrective-window' via the negated marker "not found citable" — the
    # guard was right and the fixture label was wrong: this window CONTAINS a rejected claim,
    # and negated>caveated precedence is the conservative direction for a flag whose only
    # contract is "human reads before automated action".
    ('figures: the folkloric "~50 mL empty" was checked and NOT found citable; the measured '
     'MRI values (25 ± 18 mL, Grimm et al., 2018; 35 ± 7 mL, Mudie et al., 2014) are used',
     'negated'),
    # skin.js:300-301 — verification failure documented
    ('Curtin et al., NEJM, 2005\'s circulating four-way BRAF site split (59/11/23/11%) could '
     'NOT be verified (paywalled, no open-access restatement', 'caveated'),
]
FIXTURES_MUST_NOT_FIRE = [
    # breast.js:191-193 — plain assertion with verification note
    ('the morphology-defining study for the basal-like subtype (Livasy et al., Mod Pathol, '
     '2006, PMID 16341146) reports "markedly elevated mitotic count,"'),
    # ovary.js:257-258 — plain assertion
    ('an ARID1A-deficient cell REQUIRES a working ARID1B to survive (Helming, Nat Med, 2014), '
     'so drawing its loss into these cells would depict cells that cannot live.'),
    # pancreas.js:205-206 — plain assertion
    ('the dominant mechanism (25/84 tumors, Hahn et al., Science, 1996), is counted'),
]

def selftest():
    ok = True
    for text, want in FIXTURES_MUST_FIRE:
        got, hits = classify_window(text)
        want_status = 'corrective-window' if want == 'negated' else 'caveated-window'
        good = got == want_status
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} fires [{want}]: {text[:60]}... -> {got}")
    for text in FIXTURES_MUST_NOT_FIRE:
        got, hits = classify_window(text)
        good = got == 'clean'
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} silent: {text[:60]}... -> {got}")
    print('SELFTEST', 'PASS — the guard can fire and can stay silent; its zeros are meaningful'
          if ok else 'FAIL — do not trust any scan from this build')
    return ok

if __name__ == '__main__':
    if '--selftest' in sys.argv:
        sys.exit(0 if selftest() else 1)
    if not selftest():
        print('refusing to scan with a failing self-test (condition 7)'); sys.exit(1)
    recs = json.load(open(sys.argv[1]))
    from collections import Counter
    out = []
    for r in recs:
        f, ln = r['refs'][0].rsplit(':', 1)
        status, hits = classify_window(window_for(f, int(ln)))
        out.append({'author': r['author'], 'year': r['year'], 'ref': r['refs'][0],
                    'window': status, 'markers': hits})
        if status != 'clean':
            print(f"  {status:18} {r['author']:<14} {r['year']} {r['refs'][0]} "
                  f"{sorted(set(sum(hits.values(), [])))[:2]}")
    print('SCAN:', dict(Counter(x['window'] for x in out)))
    json.dump(out, open('/tmp/atlas-verify/cite/polarity_scan.json', 'w'), indent=1)
