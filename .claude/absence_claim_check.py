# Absence-claim check (.claude/absence_claim_check.py, 2026-09-05) — the ninth instrument,
# and the second built for a class the EDITING CREATES rather than one found in the corpus
# (the fraction_check reasoning: the remediation itself was adding intra-string fractions, so
# the population grows with every pass; here every new note is an opportunity to write another
# unscoped absence claim, and the corpus is heading from 16 entries to ~120).
#
# THE RULE IN TWO WORDS (user, 2026-09-05): "exists" versus "found".
#
# An UNSCOPED absence claim asserts a fact about the world's literature — "no canonical figure
# EXISTS", "no interaction analysis HAS FLAGGED it", "no functional study HAS ADJUDICATED".
# Its instrument is an unrecorded literature search with no query, no scope and no date, so it
# is a zero-reporting check that cannot be shown capable of non-zero: condition (7) exactly,
# in the form it was extended to cover (an annotation asserting cleanliness is itself a check).
# A SCOPED absence claim asserts a search outcome or a dataset fact — "no clean population-level
# frequency WAS FOUND to cite here", "zero samples IN THE GENIE COHORT". Both are verifiable,
# and the second is a downgrade of the first, which is always available and always preferable.
#
# SIGNATURE: negation + an EXISTENCE verb = defect; negation + a SEARCH verb or an explicit
# DATASET SCOPE = correct. At birth the atlas produced the bad form at a HIGHER rate than the
# good one (4 defective vs 3 correct), which is the argument for mechanizing rather than noting.
#
# THREE DOCUMENTED EXEMPTIONS, all real instances, all legitimate:
#   SOURCE-ATTESTED — a NAMED SOURCE is quoted attesting the absence, so the claim is a cited
#     claim rather than the atlas's own unrecorded search. This is the strongest correct form:
#     pancreas.js:208 declines a peritoneal percentage and quotes the site-frequency source
#     saying the site "is not detailed in the SEER database" (Oweira et al., 2017). Requires a
#     quotation of >=20 chars plus a citation — the length floor is the discriminator, because a
#     source attestation is sentence-length while a term-of-art quotation is a word or two.
#   SELF-EVIDENCING — the claim exhibits its own evidence in the same string. colon.js:210 says
#     "no canonical figure exists" and then prints three divergent sourced figures; the dispersion
#     IS the support. Requires >=2 citations carrying figures in the same string.
#   REASON-GIVING — the claim states WHY the figure is unavailable, which is checkable.
#     stomach.js:231 declines a percentage "because none is citable — the population registry
#     grouped it into 'other' for small numbers".
#
# CONDITION (8), and it EARNED ITS KEEP ON THE FIRST RUN: the calibration scan reported 7 sites
# where hand-reading had found 5. One (thyroid.js:263) was a real defect the coarse pass had let
# a neighbouring clause launder. The other (pancreas.js:208) was CORRECT CONTENT IN AN
# UNRECOGNISED FORM — and reading it is what produced the source-attested class above, which is
# a better rule than the reason connective I would otherwise have widened. A first run is
# calibration in both directions: it finds defects the reader missed AND exemptions the
# instrument missed, and the second kind is the one that teaches you the taxonomy.
#
# The fixtures below are the REAL instances, so a clean live run is weak evidence of
# generality — tuning against known answers is sampling on the dependent variable. This tool's
# actual job is REGRESSION INSURANCE on notes not yet written; read its second run, not its first.
# 7-bis: DONE line last. Wrapper form:
#   .claude/run_checked.sh "DONE absence_claim_check:" python3 .claude/absence_claim_check.py
import re, sys, glob

FIELD = re.compile(r"(\w+):'((?:[^'\\]|\\.)*)'")
READ_FIELDS = ('note', 'ccf', 'desc', 'text', 'detail', 'label')

NEGATION = r"(?:\bno\b|\bnone\b|\bnever\b|\bnot\b|\bnothing\b|\bzero\b|\bun(?:adjudicated|documented|reported|studied|examined)\b)"

# EXISTENCE verbs: the claim is about the literature's contents. Includes the PARTICIPLE-
# ADJECTIVE form ("no documented conflict"), which the first selftest run caught me missing —
# it reads as a description but asserts the same unbounded search, and it was one of the four
# real defects, so the miss would have been a false clean on live content.
EXISTENCE = (r"\bexists?\b|\bexisted\b|\bhas (?:flagged|adjudicated|documented|reported|studied|"
             r"examined|addressed|established|investigated)\b|\bhave (?:flagged|adjudicated|"
             r"documented|reported|studied|examined|addressed|established|investigated)\b|"
             r"\b(?:is|are|was|were) documented\b|\bun(?:adjudicated|documented)\b|"
             r"\bno (?:documented|published|known|reported|recorded|existing)\b|\bcitable\b")
# SEARCH verbs: the claim is about a search that was run.
SEARCH = (r"\b(?:was|were) found\b|\bfound to cite\b|\bfound here\b|\bnone (?:was|were) found\b|"
          r"\bcould not (?:be )?(?:locate|find)\b|\b(?:no source|none) located\b|\bfound for\b|"
          r"\bnot (?:located|retrieved|reachable)\b|\bsearch(?:ed)?\b")
# DATASET SCOPE: the absence is bounded to a named body of data.
SCOPE = (r"\bin (?:the |this )?(?:GENIE|TCGA|SEER|PDQ)\b|\bin (?:the|this) (?:cohort|registry|"
         r"dataset|series|analysis|study|paper|table|sample)\b|\bin the cited\b|"
         r"\b(?:GENIE|TCGA|SEER) cohort\b|\bsamples in\b")
# REASON must be an explicit causal connective. An earlier draft accepted a bare em-dash-plus-
# "the", which appears in ordinary atlas prose constantly and would have exempted real defects —
# a loose exemption is worse than no exemption, because it fails silently in the passing direction.
REASON = r"\bbecause\b|\bsince\b|\bas the (?:registry|population|source|paper|series)\b"
CITATION = re.compile(r"\b(?:et al\.|[A-Z][a-z]+ et al)\b|\((?:[A-Z][A-Za-z]*[^)]*,\s*\d{4})\)")
FIGURE = re.compile(r"\d+(?:\.\d+)?\s*%|\b\d+\s*/\s*\d+\b")
# A source attestation is sentence-length. The 20-char floor is what stops a quoted term of art
# ("hotspot", "other") from laundering an unscoped claim standing beside it.
QUOTED = re.compile(r'"[^"]{20,}"')

def clauses(value):
    """Sentence split, protecting 'et al.' — an unprotected split fragments every citation and
    silently destroys the self-evidencing exemption, which depends on counting them."""
    protected = value.replace('et al.', 'et al')
    for sentence in re.split(r'(?<=[.;])\s+', protected):
        yield sentence.replace('et al', 'et al.')

def fine_clauses(sentence):
    """The clause-unit rule applied to this instrument. Found by the calibration run:
    thyroid.js:263 pairs a registry-SCOPED recurrence claim with an UNSCOPED "unadjudicated"
    claim in the same sentence, and testing scope across the whole sentence let the first
    LAUNDER the second. A qualifier scopes the clause it attaches to, nothing further."""
    return [c for c in re.split(r'[,:;—]', sentence) if c.strip()]

# NEITHER GRANULARITY IS SAFE ALONE, and finding out cost a second calibration read.
# Fine clauses fix LAUNDERING (a scoped clause shielding an unscoped one). But English spells
# a list comma and a clause comma with the same character, so splitting on commas SEVERS the
# negation from its predicate across a list: "No conflict with CDH1, RHOA, or the fusion IS
# DOCUMENTED." is a textbook unscoped claim, and the fine split reports NONE on it — a false
# clean, the direction that matters. Whole sentences catch that and miss the laundering.
# So: run BOTH and take the WORSE verdict. The cost is over-flagging when an unrelated negation
# and existence verb happen to share a sentence; that costs a read, and a read is the cheap
# error. Flag-then-human-read, as with citation_polarity.py.
GRANULARITIES = (fine_clauses, lambda s: [s])

def classify(text):
    """-> (verdict, reason). verdict in DEFECT / OK-SEARCH / OK-SCOPED / EXEMPT-* / NONE.

    TWO SCOPES, deliberately different: DEFECT detection runs at BOTH granularities and takes
    the worse verdict (see GRANULARITIES). The exemptions are SENTENCE-level, because exhibited
    evidence really does support a claim made beside it (colon.js:210 prints its three divergent
    figures after the colon; stomach.js:231 gives its reason in the same breath)."""
    exempt = None
    if QUOTED.search(text) and CITATION.search(text):
        exempt = ('EXEMPT-SOURCE-ATTESTED', 'quotes a named source attesting the absence')
    elif len(CITATION.findall(text)) >= 2 and len(FIGURE.findall(text)) >= 2:
        exempt = ('EXEMPT-SELF-EVIDENCING', 'exhibits >=2 sourced figures in the same sentence')
    elif re.search(REASON, text) and not re.search(r'\bhas (?:flagged|adjudicated)\b', text, re.I):
        exempt = ('EXEMPT-REASON-GIVEN', 'states why the figure is unavailable')
    best = ('NONE', '')
    for split in GRANULARITIES:
        for cl in split(text):
            if not re.search(NEGATION, cl, re.I):
                continue
            has_search = re.search(SEARCH, cl, re.I)
            has_scope = re.search(SCOPE, cl, re.I)
            has_exist = re.search(EXISTENCE, cl, re.I)
            if has_search:
                if best[0] == 'NONE':
                    best = ('OK-SEARCH', f'search verb: {has_search.group(0)!r}')
            elif has_scope:
                if best[0] == 'NONE':
                    best = ('OK-SCOPED', f'dataset scope: {has_scope.group(0)!r}')
            elif has_exist:
                return exempt or ('DEFECT', f'existence verb {has_exist.group(0)!r} '
                                            'with no search scope or dataset bound')
    return best

FIXTURES = [
    # the four real defects at birth
    ("no interaction analysis has flagged it against either", 'DEFECT'),
    ("No documented conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion.", 'DEFECT'),
    ("no clean subtype-specific percentage exists to cite, so none is shown", 'DEFECT'),
    ("no functional study has adjudicated their role in FTC specifically", 'DEFECT'),
    # the shielding case: a registry-scoped clause must NOT launder an unscoped one beside it
    ("Same honesty note as ATM: recurrent in the registry, driver role in this cancer "
     "unadjudicated.", 'DEFECT'),
    # adversarial: a SHORT quotation is a term of art, not an attestation, and must not exempt.
    # This is the fixture that tests the 20-char floor rather than the exemption it guards.
    ('no functional study has adjudicated this, though the registry calls it a "hotspot" '
     '(Smith et al., 2024)', 'DEFECT'),
    # the SEVERED-NEGATION case, found when the fix for shielding produced a false clean on it:
    # a list comma puts "No" and "is documented" in different fine clauses. Must still fire.
    ("No conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion is documented.", 'DEFECT'),
    # and its remediated form, which the same union must read as correct rather than as absent
    ("No conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion was found in the cited TCGA "
     "analysis.", 'OK-SEARCH'),
    # the three real correct forms
    ("no clean population-level frequency was found to cite here", 'OK-SEARCH'),
    ("DICER1 never co-occurs with NRAS (zero samples in the GENIE cohort)", 'OK-SCOPED'),
    ("~10–15% of CRC — no canonical figure exists: 8.6% by full sequencing (64/744, Fleming "
     "et al., Cancer Res, 2013) to 12% by hotspot panel (90/734, Mehrvarz Sarshekeh et al., "
     "PLoS One, 2017)", 'EXEMPT-SELF-EVIDENCING'),
    ("No percentage is claimed for the ovary because none is citable — the population registry "
     "grouped it into \"other\" for small numbers", 'EXEMPT-REASON-GIVEN'),
    # the source-attested form, found BY the first run (pancreas.js:208, abridged)
    ('this is the one site here with NO citable percentage, and the honest reason is structural: '
     'the site-frequency source itself says so ("an important site of metastasis from pancreatic '
     'cancer is not detailed in the SEER database", Oweira et al., 2017)',
     'EXEMPT-SOURCE-ATTESTED'),
    # ordinary prose that must not fire
    ("Margins are often pushing and circumscribed rather than infiltrative", 'NONE'),
    ("computed OR 0.67, p=0.39, not significant", 'NONE'),
]

def selftest():
    ok = True
    for text, want in FIXTURES:
        got, why = classify(text)
        good = got == want
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} want {want:24s} got {got:24s} {text[:58]!r}")
    print('SELFTEST', 'PASS — fires on the existence form, passes the search/scoped forms, '
          'honours all three exemptions, and is not laundered by a short quotation'
          if ok else 'FAIL — do not trust this scan')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    counts = {}
    defects = []
    for f in sorted(glob.glob('js/organs/*.js')):
        for i, line in enumerate(open(f, encoding='utf-8'), 1):
            if line.lstrip().startswith('//'):
                continue
            for fld, val in FIELD.findall(line):
                if fld not in READ_FIELDS:
                    continue
                for cl in clauses(val):
                    verdict, why = classify(cl)
                    if verdict == 'NONE':
                        continue
                    counts[verdict] = counts.get(verdict, 0) + 1
                    if verdict == 'DEFECT':
                        defects.append((f, i, fld, ' '.join(cl.split()), why))
    for f, i, fld, cl, why in defects:
        print(f'  UNSCOPED ABSENCE CLAIM: {f}:{i} [{fld}] — {why}')
        print(f'      {cl[:220]}')
    tally = ', '.join(f'{k} {v}' for k, v in sorted(counts.items()))
    # DONE line last (7-bis): a clean scan is never a pass without it.
    print(f'DONE absence_claim_check: {len(defects)} unscoped absence claims '
          f'({tally or "no absence claims found"})')
    sys.exit(1 if defects else 0)
