# Citation REACH check (2026-09-06). The eleventh instrument, and the first one that watches for
# something NOT happening.
#
# WHY IT EXISTS. Every other gate in this chain measures what the corpus contains. The record
# ratchet (.claude/record_count.json) fails a DECREASE, which bounds the corpus from below.
# Nothing bounded it from the side where growth silently fails to happen — and that side turned
# out to be real, not theoretical. The ARID2 "name it or remove it" remedy added a source to a
# liver.js comment as "Li Z et al., Human Mutation, 2026 (PMID 42016321, PMC13092802, OA)".
# extract_citations' P_ETAL needs a BARE surname, so the initial sat where "et" must be, the
# citation yielded no record at all, and both identifiers vanished with it — reaching no
# instrument. Nothing fired. The ratchet could not fire either, because a citation that never
# becomes a record is an ABSENCE, not a decrease. Dropping the initial made the same line produce
# a record carrying both ids, and PubMed then corroborated the hand read.
#
# So: "named" is not the same as "reachable", and the general rule is CHECK THE RECORD APPEARED,
# NEVER ASSUME THE TEXT IS THE RECORD. This file is that check, mechanised.
#
# WHAT IT GATES, AND WHAT IT ONLY REPORTS — the split is the load-bearing decision here.
#   GATED: 'etal-malformed-head' and 'etal-out-of-range'. A span containing "et al." is
#     unambiguously a citation; if it produced no record, something is wrong and a human must say
#     what. Each head is DECLARED below with a reason, on citation_crosscheck's declared-and-
#     tolerated pattern; an UNDECLARED head fails. Keys are head TEXT, not locations, because the
#     head SHAPE is the defect and a line number churns on every edit above it.
#   REPORTED ONLY: 'bare-name-year' (measured: 80 spans, 56 distinct heads). This is the
#     "(Bolton 2022)" style — no "et al.", no "&", no "(Surname, Journal," — which matches none of
#     the extractor's three head patterns and dominates ovary.js and colon.js. It is NOT declared
#     span by span and NOT gated, for one reason: I have not classified 56 heads, and declaring
#     them would be fake precision wearing the shape of rigour. Closing that class means adding a
#     fourth head pattern to the extractor, which is a CHANGE IN REACH — per aafbe04's rule it
#     must be declared and measured in its own commit, not slipped in beside a reporting change.
#     Held for ruling; the number is printed on every run so it cannot go quiet in the meantime.
#   NOT REPORTED: 'prose-year' (a year in ordinary prose — a genuine non-citation) and
#     'semicolon-shadow' (by design: the head belongs to a previous citation). Both are counted in
#     the sidecar so the classification's totals add up and nothing hides in a residual bucket.
#
# STANDING CONDITION (7): --selftest proves this checker can FIRE. Arm 3 feeds it an undeclared
# head and requires a non-zero exit; a gate that has only ever been seen to pass is not known to
# work. Condition (7-bis): the DONE line is printed LAST, after the sidecar and every listing, so
# a report of zero is shown to have been produced rather than inferred from silence.
#
# NOT RATCHETED, DELIBERATELY. Every metric here is a DEFECT COUNT. Ratcheting one would fail the
# battery for FIXING a malformed head, which is the exact inversion the sidecar convention's
# `ratchet` array exists to prevent. The array is present and empty on purpose: empty says "the
# producer considered it", absent says nothing.
#
# Usage: python3 .claude/citation_reach_check.py [--selftest] [file ...defaults to js/organs/*.js]
import glob, json, os, sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_citations import unreached_spans

GATED_KINDS = ('etal-malformed-head', 'etal-out-of-range')

# Keyed '<kind>:<head text>'. Every reason must survive being read by someone who did not write
# it, so the selftest holds each to >80 chars — the same bar citation_crosscheck's
# DECLARED_UNMAPPABLE reasons are held to, for the same reason: a one-word reason is a shrug.
DECLARED_UNREACHED = {
    'etal-malformed-head:Riihimäki':
        'NON-ASCII SURNAME, and the corpus is right while the extractor is wrong — the fix is not '
        'here. SURNAME\'s character class is [A-Za-z\'-], so the ä stops the match dead: eleven '
        'spans across colon.js, lungs.js and stomach.js produce NO record, and Riihimäki has ZERO '
        'records corpus-wide. These are the Swedish national-registry metastatic-pattern papers '
        'that supply the SITE FREQUENCY figures for three organs, so this is the largest single '
        'loss the reach check found. THE CORPUS IS ITS OWN CONTROL AGAIN: skin.js:369 spells the '
        'same author "Riihimaki" (ASCII) for Cancer Med 2018 and says in its own words that it is '
        '"the same Swedish national-registry group ... as the atlas\'s existing colon and stomach '
        'site sources" — and that ASCII spelling has five records. So the corpus holds both the '
        'correct spelling (invisible to every instrument) and a transliteration of it (fully '
        'indexed), and only the wrong one is machine-visible. Renaming the correct spellings to '
        'match the wrong one would be a misspelling introduced to satisfy a regex; widening '
        'SURNAME to accept non-ASCII letters is the real fix and is a CHANGE IN REACH, declared '
        'and measured in its own commit. Held for ruling, not forgotten.',
    'etal-malformed-head:Conejero Merchán':
        'NON-ASCII SURNAME, same cause as Riihimäki above and same held fix (widen SURNAME). One '
        'span, brain.js:128, an independent confirmation of a glioma epidemiology figure in Open '
        'Respiratory Archives; zero records corpus-wide, so the corroborating source the comment '
        'exists to name reaches no instrument. Counted separately from Riihimäki rather than '
        'folded into it because the two are different papers and a merged count would hide one.',
    'etal-malformed-head:Li D':
        'INITIAL IN HEAD, PubMed style — the exact shape that started this whole check ("Li Z et '
        'al." in liver.js). One span, colon.js:225, Front Oncol 2021; zero records for that '
        'paper, and eleven records exist for OTHER Li papers, so a same-surname sanity check '
        'would have looked satisfied. Fixable at the site by dropping the initial, as liver.js '
        'was, and that is the right fix here because nothing in this comment depends on the '
        'initial being present. Not done in this commit: this commit builds the detector, and '
        'acting on its findings in the same breath would leave the detector unproven on the '
        'corpus it was built to measure.',
    'etal-malformed-head:Wang K':
        'INITIAL IN HEAD, same shape as Li D above. One span, stomach.js:206, Nat Genet 2011. The '
        'only same-surname record in the corpus is a different paper entirely (colon.js:210, '
        'Cancers 2022), which is worth stating because it is the case where "the surname has '
        'records" is actively misleading rather than merely uninformative. Same disposition: '
        'fixable at the site, held so the detector is measured before it is acted on.',
    'etal-malformed-head:Gundem G':
        'INITIAL IN HEAD, AND THE ONE CASE THAT MUST NOT BE "FIXED" — which is why "drop the '
        'initial" is not a general remedy. prostate.js:141 is a deliberate AUTHORSHIP CORRECTION '
        'comment that quotes PubMed\'s author list verbatim ("Cooper CS, Eeles R, Wedge DC, Van '
        'Loo P, Gundem G, et al.") precisely BECAUSE the surname the atlas had been citing is not '
        'the first author. Stripping the initials would damage the correction to please the '
        'extractor. The paper itself is not lost: Cooper has five records elsewhere in the same '
        'file. TOLERATED PERMANENTLY, not held — this span should never produce a record.',
    'etal-out-of-range:Louis':
        'WELL-FORMED HEAD, MERELY DISTANT: the author sits 131 characters before its year and the '
        'extractor looks back 130. One character. brain.js:209, the WHO CNS classification '
        'reference. Recorded rather than fixed because moving the lookback is a change in reach '
        'like any other, and a 130-char window is what makes the "nearest head wins" rule safe '
        'against swallowing a neighbouring citation\'s author — lengthening it trades one silent '
        'failure for another and needs measuring, not guessing.',
    'etal-out-of-range:Gao':
        'WELL-FORMED HEAD, MERELY DISTANT: 132 characters back, breast.js:148. Same cause and '
        'same held fix as Louis above. Kept as its own entry rather than merged into a single '
        '"out of range" tolerance so that the count is of real citations and a new one shows up '
        'as a new line rather than incrementing a number nobody reads.',
    'etal-out-of-range:Curtin':
        'WELL-FORMED HEAD, MERELY DISTANT: 134 characters back, skin.js:306. Same cause and held '
        'fix as Louis and Gao. This one is the least costly of the three — Curtin has eight '
        'records elsewhere in skin.js, so the paper is well represented even though this '
        'particular mention is not indexed.',
}


def selftest():
    ok = True

    def arm(label, cond, detail=''):
        nonlocal ok
        if not cond:
            ok = False
            print(f'SELFTEST FAIL: {label} {detail}')
        return cond

    # arm 1: every declared reason is a real explanation, not a shrug
    short = {k: len(v) for k, v in DECLARED_UNREACHED.items() if not isinstance(v, str) or len(v) <= 80}
    arm('every DECLARED_UNREACHED reason exceeds 80 chars', not short, str(short))

    # arm 2: every declared key names a kind this checker actually gates. A declaration for an
    # ungated kind would be a tolerance that tolerates nothing — it would sit here looking like
    # protection while the span it names was never checked.
    bad_kind = [k for k in DECLARED_UNREACHED if k.split(':', 1)[0] not in GATED_KINDS]
    arm('every declared key names a GATED kind', not bad_kind, str(bad_kind))

    # arm 3: THE CHECKER CAN FIRE (condition 7). An undeclared head must be a problem, and a
    # declared one must not be — both directions, because a check that flags everything is as
    # useless as one that flags nothing.
    fake_undeclared = [{'file': 'x.js', 'line': 1, 'year': '2020',
                        'kind': 'etal-malformed-head', 'key': 'Nobody Z'}]
    fired, _, _ = evaluate(fake_undeclared)
    arm('an UNDECLARED head is a problem', len(fired) == 1, str(fired))
    fake_declared = [{'file': 'x.js', 'line': 1, 'year': '2020',
                      'kind': 'etal-malformed-head', 'key': 'Gundem G'}]
    quiet, _, _ = evaluate(fake_declared)
    arm('a DECLARED head is not a problem', not quiet, str(quiet))

    # arm 4: an ungated kind never becomes a problem, however many there are — this is the
    # reported-not-gated split, asserted rather than trusted to the prose above.
    bulk = [{'file': 'x.js', 'line': i, 'year': '2020', 'kind': 'bare-name-year', 'key': f'H{i}'}
            for i in range(50)]
    none_fired, _, _ = evaluate(bulk)
    arm('bare-name-year is reported, never gated', not none_fired, str(none_fired[:3]))

    # arm 5: the STALE direction fires too, and only on the missing key. A tolerance list that
    # cannot go stale grows monotonically until it tolerates the whole corpus.
    all_but_one = {k: [] for k in DECLARED_UNREACHED if k != 'etal-out-of-range:Gao'}
    stale = stale_declarations(all_but_one)
    arm('a declaration with no remaining span is STALE', len(stale) == 1 and 'Gao' in stale[0],
        str(stale))
    arm('a fully-populated declaration set is not stale',
        not stale_declarations({k: [] for k in DECLARED_UNREACHED}))

    return ok


def evaluate(spans):
    """Returns (problems, gated_by_key, counts_by_kind)."""
    counts = Counter(s['kind'] for s in spans)
    gated = {}
    for s in spans:
        if s['kind'] not in GATED_KINDS:
            continue
        gated.setdefault(f"{s['kind']}:{s['key']}", []).append(f"{os.path.basename(s['file'])}:{s['line']}")
    problems = []
    for key, locs in sorted(gated.items()):
        if key not in DECLARED_UNREACHED:
            problems.append(f'UNDECLARED unreached citation head {key!r} at {", ".join(locs[:6])} '
                            f'({len(locs)} span{"s" if len(locs) != 1 else ""}). This span contains '
                            f'"et al." and produced NO record, so its identifiers reach no '
                            f'instrument. Either make it extractable, or declare it in '
                            f'DECLARED_UNREACHED with a reason saying why it stays unreachable.')
    return problems, gated, counts


def stale_declarations(gated):
    """The reverse direction: a declaration whose head no longer occurs anywhere. A stale
    tolerance is how a FIXED defect goes on looking like a tolerated one, so it is a problem in
    its own right. Deliberately NOT part of evaluate(): it is only meaningful against a full-corpus
    scan, and folding it in made evaluate() unusable on the synthetic span lists the selftest feeds
    it — which is how this split was found, by the selftest failing on its own subject."""
    return [f'STALE DECLARATION {key!r}: declared unreachable, but no such span exists any more. '
            f'If it was fixed, delete the declaration in the same commit — a tolerance for a defect '
            f'that is gone hides the next one.'
            for key in sorted(DECLARED_UNREACHED) if key not in gated]


def main():
    paths = [a for a in sys.argv[1:] if not a.startswith('--')] or sorted(glob.glob('js/organs/*.js'))
    spans = unreached_spans(paths)
    problems, gated, counts = evaluate(spans)
    problems += stale_declarations(gated)

    print(f'citation_reach_check: {len(paths)} files, {len(spans)} years produced no record')
    for kind in sorted(counts):
        mark = 'GATED   ' if kind in GATED_KINDS else 'reported'
        print(f'  {mark} {kind:<22} {counts[kind]:>4} spans')
    for key, locs in sorted(gated.items()):
        print(f'    declared {key!r} x{len(locs)}: {", ".join(locs[:8])}')
    bare = [s for s in spans if s['kind'] == 'bare-name-year']
    bare_heads = sorted({s['key'] for s in bare})
    print(f'  bare-name-year heads ({len(bare_heads)} distinct, NOT gated — held for ruling): '
          f'{", ".join(bare_heads[:12])}{" ..." if len(bare_heads) > 12 else ""}')
    for p in problems:
        print(f'  PROBLEM: {p}')

    print('SIDECAR ' + json.dumps({
        'name': 'citation_reach_check',
        'metrics': {'unreached_total': len(spans),
                    'etal_malformed': counts.get('etal-malformed-head', 0),
                    'etal_out_of_range': counts.get('etal-out-of-range', 0),
                    'bare_name_year': counts.get('bare-name-year', 0),
                    'bare_name_year_heads': len(bare_heads),
                    'semicolon_shadow': counts.get('semicolon-shadow', 0),
                    'prose_year': counts.get('prose-year', 0),
                    'declared': len(DECLARED_UNREACHED),
                    'problems': len(problems)},
        # empty ON PURPOSE: every metric above is a defect count, and ratcheting a defect count
        # would fail the battery for fixing a defect. Empty says the producer considered it.
        'ratchet': [],
    }, sort_keys=True))
    # DONE last (condition 7-bis), after the sidecar and every listing above
    print(f'DONE citation_reach_check: {len(spans)} unreached spans, '
          f'{counts.get("etal-malformed-head", 0) + counts.get("etal-out-of-range", 0)} gated '
          f'({len(DECLARED_UNREACHED)} declared), {len(problems)} problems')
    if problems:
        sys.exit(3)


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
