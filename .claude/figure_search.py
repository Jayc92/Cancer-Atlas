# Figure-search instrument for claim reads (2026-09-05). Condition (7) surfaced in a READ
# METHOD for the first time: a numeral-only percent grep reported "no percent tokens" in the
# Curtin 2005 abstract — which contains FOUR percentages, spelled NEJM-style ("Eighty-one
# percent"). The zero was a property of the pattern, not the paper.
#
# THE RULE (user): a search returning nothing must be shown capable of returning something in
# that document — before concluding a figure isn't present, confirm the pattern finds SOME
# figure there. Zero quantitative tokens in a quantitative abstract indicts the pattern.
#
# THREE FORMS, because coverage needs all of them:
#   numerals          81%, 20.8%, 17/23, n=590
#   spelled cardinals "Eighty-one percent", "twenty percent" (sentence-initial house styles)
#   worded fractions  "two-thirds", "about half", "a quarter" — the form that persists
#                     longest, since it doesn't look like a number at all.
#
# API: find_figures(text) -> list of (form, match, context). has_any_figure(text) -> bool is
# the capability check: when a SPECIFIC search returns nothing, a False here means the
# document is genuinely non-quantitative; a True means the specific pattern missed — go look.
import re, sys

ONES = ('one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|'
        'fifteen|sixteen|seventeen|eighteen|nineteen')
TENS = 'twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety'
SPELLED = rf'\b(?:(?:{TENS})(?:[-\s](?:{ONES}))?|{ONES})\s+percent\b'
FRACTIONS = (r'\b(?:about |approximately |roughly |nearly )?'
             r'(?:half|one[-\s]third|two[-\s]thirds|one[-\s]quarter|a quarter|a third|'
             r'a half|three[-\s]quarters|one[-\s]fifth|a fifth|two[-\s]fifths)\b(?: of\b)?')
PATTERNS = [
    ('numeral', re.compile(r'\d+(?:\.\d+)?\s*%|\b\d+[,\d]*/\d[,\d]*\b|\bn\s*=\s*\d+', re.I)),
    ('spelled', re.compile(SPELLED, re.I)),
    ('fraction', re.compile(FRACTIONS, re.I)),
]

def find_figures(text, ctx=90):
    out = []
    for form, pat in PATTERNS:
        for m in pat.finditer(text):
            s = max(0, m.start() - ctx)
            out.append((form, m.group(0), text[s:m.end() + ctx]))
    return out

def has_any_figure(text):
    return any(pat.search(text) for _, pat in PATTERNS)

FIXTURES = [
    # the Curtin case: numeral-only search returned zero on this; the instrument must not
    ('Eighty-one percent of melanomas on skin without chronic sun-induced damage had '
     'mutations in BRAF or N-RAS.', True, 'spelled (the Curtin miss)'),
    ('Approximately half of the tumours showed defective homologous recombination.',
     True, 'worded fraction'),
    ('PIK3CA mutations in 91 (15%) of 590 population-based colorectal cancers.',
     True, 'numeral'),
    ('The classification of tumours of the urinary system is described.',
     False, 'genuinely non-quantitative'),
]

def selftest():
    ok = True
    for text, want, label in FIXTURES:
        got = has_any_figure(text)
        good = got == want
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} {label}: has_any_figure={got}")
    print('SELFTEST', 'PASS — all three forms fire; a non-quantitative text reads False'
          if ok else 'FAIL — do not trust figure searches from this build')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    text = open(sys.argv[1], encoding='utf-8').read() if len(sys.argv) > 1 else sys.stdin.read()
    hits = find_figures(text)
    for form, tok, ctx in hits[:40]:
        print(f'  [{form}] {tok!r}: ...{" ".join(ctx.split())[:150]}...')
    # DONE line last (7-bis): absence-of-hits is never a pass without it
    print(f'DONE figure_search: {len(hits)} figure tokens '
          f'({ "quantitative" if hits else "NON-QUANTITATIVE document" })')
