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
# WHAT IT GATES, AND WHAT IT ONLY REPORTS — the split is the load-bearing decision here. There are
# TWO categories, not three. An earlier draft of this header described a third, "NOT REPORTED",
# covering prose-year and semicolon-shadow — and the code never had it: main() has always printed
# every kind the classifier produced. A header category with no implementation is worse than an
# undocumented one, because a reader checks the header and stops.
#   GATED: 'etal-malformed-head' and 'etal-out-of-range'. A span containing "et al." is
#     unambiguously a citation; if it produced no record, something is wrong and a human must say
#     what. Each head is DECLARED below with a reason, on citation_crosscheck's declared-and-
#     tolerated pattern; an UNDECLARED head fails. Keys are head TEXT, not locations, because the
#     head SHAPE is the defect and a line number churns on every edit above it.
#   REPORTED: every other kind, printed with its count on every run. Reported does not mean
#     harmless — it means the population is not yet classified well enough for a human declaration
#     to be anything but fake precision.
#
# 'bare-name-year' IS DISCHARGED (2026-09-06). It was the held item this header used to describe at
# length: the "(Bolton 2022)" style, 80 spans and 56 distinct heads at HEAD fe8d627, matching none
# of the extractor's three head patterns, and supplying user-facing OCCC anchors. The extractor now
# carries a fourth head pattern, declared and measured in its own commit per aafbe04's rule. What
# the discharge actually taught is recorded in extract_citations' header and is NOT the reach
# expansion: closing the class removed ten pre-existing FALSE records, four of them
# misattributions where the old nearest-head rule reached past a bare-name head and filed a year
# under a different paper's author. THIS CHECK IS BLIND TO THAT FAILURE MODE BY CONSTRUCTION. It
# counts years that produced NO record; a year that produced the WRONG record is not an absence and
# will never appear here. Do not read a clean run as "every year is filed correctly".
#   ONE BITE OF THAT BLIND SPOT IS COVERED SINCE 2026-09-07, and only one: citation_head_check.py
#   partitions every record author that is not a single run of letters into declared-imprecise and
#   declared-well-formed, and fails on a head in neither. It answers "is this author STRING what the
#   corpus text says", which is decidable per span without a heuristic. It does NOT answer "does this
#   head own this year" — the misattribution class above is still uncovered by both of us, and the
#   only instrument pointed at it is citation_crosscheck, per record, against sources.
#
# WHY EVERY KIND IS LISTED IN ALL_KINDS BELOW RATHER THAN TAKEN FROM THE COUNTER. A Counter omits
# what has count zero, so a kind derived from it VANISHES the moment its count reaches zero — and a
# metric that disappears on reaching zero cannot be told apart from a metric nobody computed. That
# is the same absence-versus-decrease confusion this whole instrument exists for, reappearing one
# level up in its own reporting. Every known kind is therefore enumerated and its zero PRINTED as a
# zero; a kind the classifier emits that is NOT enumerated is a PROBLEM, because an unlisted kind
# is a residual bucket that arrived without anyone deciding whether it should be gated.
#
# THE "NOTHING HIDES IN A RESIDUAL BUCKET" PROMISE WAS UNCHECKED, AND BROKE THE FIRST TIME THE
# CLASSIFICATION CHANGED. This header claimed the sidecar's counts add up, and the metrics were a
# hand-written list that happened to be complete — at HEAD fe8d627 the five kind metrics did sum to
# unreached_total, so every run looked like evidence for the promise. Then the fourth head pattern
# added three kinds, no hand-written key existed for any of them, and the per-kind numbers stopped
# summing while nothing said so. The lesson is not "the list was wrong"; it is that a coincidence
# and a guarantee are indistinguishable from the outside. sidecar_metrics() is now derived from
# ALL_KINDS and a selftest arm asserts the sum, so the claim fails loudly instead of quietly ageing.
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
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it reported 5 problems over 0 spans. Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_citations import unreached_spans, extract

GATED_KINDS = ('etal-malformed-head', 'etal-out-of-range')

# Every kind classify_absence can return. Enumerated, not derived from the run's own Counter — see
# the header: a derived key vanishes when its count hits zero, which is the one thing this
# instrument exists to notice. GATED_KINDS must be a subset (asserted in the selftest), and a kind
# arriving from the extractor that is missing here fails the battery rather than being counted
# silently.
ALL_KINDS = (
    'etal-malformed-head',     # GATED    "et al." present, head unmatchable (initial, non-ASCII)
    'etal-out-of-range',       # GATED    head sits beyond the 130-char lookback. Its key was
                               #          unreliable by construction until the boundary test; now
                               #          TESTED, not proven — see the note in classify_absence
    'etal-shadow',             # reported the nearest "et al." was consumed by a COMPLETED citation
                               #          (a year sits between it and this one), so this year has no
                               #          head of its own. semicolon-shadow's analogue; no key, on
                               #          purpose — naming the neighbour's author is the defect
    'bare-name-year',          # reported "Surname 2022" — discharged by the fourth head pattern,
                               #          kept because a missing space ("Smith2022") still lands here
    'bare-name-comma-year',    # reported "..., Surname, 2023" — true author sits further left
    'journal-adjacent-year',   # reported a journal word abuts the year; evidence of a citation
    'data-span-year',          # reported cohort period, ISO datestamp, or open-ended vintage
                               #          ("2010+") — EXPLAINED, not a citation. The '+' arrived
                               #          2026-09-06 and moved one span out of prose-year, the least
                               #          informative bucket, into this one, which says WHY
    'prose-year',              # reported a year in ordinary prose, no citation-shaped evidence
    'semicolon-shadow',        # reported by design: the head belongs to a previous citation
    'paren-shadow',            # reported by design, semicolon-shadow's second delimiter (added
                               #          2026-09-06): a parenthetical CARRYING A YEAR closed between
                               #          the head and this year, so the head is spent. Not gated —
                               #          same standing as semicolon-shadow, because a shadowed year
                               #          is a year the corpus does not attribute, not one this tool
                               #          failed to reach. Its count is printed below like every
                               #          other kind's; the population it is fit to, and how narrow
                               #          that is, are measured at the rule in extract_citations.py
)

# Keyed '<kind>:<head text>'. Every reason must survive being read by someone who did not write
# it, so the selftest holds each to >80 chars — the same bar citation_crosscheck's
# DECLARED_UNMAPPABLE reasons are held to, for the same reason: a one-word reason is a shrug.
#
# WHAT A DECLARATION NEEDS: THREE PROPERTIES, RECORDED TOGETHER (user ruling, 2026-09-07). They were
# acquired one incident at a time, which is the problem — each arrived as the fix to a specific failure
# and so the NEXT declaration only inherited the ones already learned. Stated as a set here, in the
# canonical home the other three declaration lists already point at, so a new declaration can satisfy
# all three AT BIRTH instead of collecting them by failing:
#
#   1. IT NAMES CHECKABLE EVIDENCE, NOT A CONCLUSION. Re-runnable, not merely re-readable. Learned
#      from the three etal-out-of-range keys deleted from this very dict — detailed immediately below,
#      because this is where it was paid for.
#   2. IT CARRIES A REASON AT ALL, not just an identifier. The scar is absence_claim_check.py's
#      unscoped-claim class: "no canonical figure exists" is a declaration of absence whose instrument
#      is an unrecorded search, i.e. an entry with no reason attached, asserted as fact. Its exemplar,
#      in the same commit (03ef214, the deploy gate), is deploy_check.js's BENIGN — which has carried
#      a per-entry `why` AND a prose reason since birth, verified by `git log -S"why: 'no favicon"`.
#      NOTE, since correcting in place beats rewording quietly: the ruling attributed this property to
#      the benign list as its FAILURE. It checks out as the opposite — the benign list is the one place
#      that had the property from the start; the failure of the same shape happened to absence claims.
#      Property unchanged; its scar reassigned to the list that actually lacked a reason.
#   3. IT IS A CLOSED ENUMERATED SET, NOT SCATTERED PROSE. Learned 2026-09-07 from the head-shape
#      artifacts: a ruling named six, and citation_head_check.py's enumeration held EIGHT. Both extras
#      (`Sweden Engstrand`, `MIS-CITES Pollock`) were ALREADY DECLARED — one in extract_citations.py's
#      header, one pinned by a fixture there — so they were declared but not ENUMERATED. Prose cannot
#      notice a sibling arriving; a closed set makes a member in neither list a PROBLEM.
#
# The three are independent and a declaration can hold any two: a closed set of reasonless ids has
# (3) without (2); a well-argued paragraph of prose has (1) and (2) without (3), which is exactly the
# eight-not-six case.
#
# A DECLARATION NAMES CHECKABLE EVIDENCE, NOT A JUDGEMENT — property (1) in full (rule adopted
# 2026-09-06, on ruling, after three declarations in this very dict rotted). The >80-char bar was the
# only test a reason had to pass, and it measures LENGTH, not content: all three wrong entries cleared
# it comfortably while being wrong about their own subject. The distinction that separates a reason
# which decays from one which does not is whether it can be RE-RUN or only RE-READ. Compare, in this
# chain:
#   RE-RUNNABLE  citation_crosscheck's 'esearch [doi] returns 0 hits (the unqualified search returns
#                6 unrelated tokenised hits)'. Anyone can issue that query and compare.
#   RE-READABLE  this dict's former 'kept as its own entry ... so that the count is of real
#                citations'. There is nothing to check. It asserts a conclusion and the reader's only
#                option is to believe it — which is what six months of nobody noticing looks like.
# AND A NUMBER IS NOT AUTOMATICALLY EVIDENCE, which is the trap that actually caught me. The deleted
# entries said 'the author sits 131 characters before its year and the extractor looks back 130'.
# That is a measurement, it is arithmetically CORRECT, and it is worthless: it measured the distance
# to a head that does not own the year. A figure only counts as evidence when a reader can regenerate
# it AND the thing it measures is the thing in dispute.
#
# THE CHEAPEST SUFFICIENT FORM IS TO QUOTE THE SPAN. Observed across all six entries here, n=6 so
# this is a pattern and not a law: the two that quote their source text verbatim (Riihimäki, Gundem
# G) are the two that survive audit most cleanly, and NONE of the three that were wrong quoted
# anything at all. Had the deleted Gao entry quoted its span — "24,822 TNBC patients (2010–2015)" —
# the error would have been legible on the page without measuring anything. This is also the
# MECHANISABLE form of the rule (assert the reason contains a verbatim substring of the span it
# declares) and it is deliberately NOT built: it would add a new substring matcher to a chain whose
# last one is already flagged, and it is satisfiable by quoting a single word, so it would enforce
# the letter of the rule and not the rule. Held, and named so it is not re-invented from scratch.
#
# AUDIT OF ALL THREE DECLARATION LISTS AGAINST THAT TEST, 2026-09-06 — recorded because an audited
# entry and an unexamined one look identical, the same reason panel.js's exclusivity sweep records
# its cleared pairs. (The order to audit said "the fifteen etal-malformed-head keys"; there are
# fifteen SPANS over FIVE keys, eleven of the spans being Riihimäki alone.)
#   FIVE etal-malformed-head KEYS, 15 spans — PASS. Each names a file:line, the paper, and a corpus
#     count. Every count RE-MEASURED against the current 490-record set today and every one still
#     exact: Riihimäki 0 records non-ASCII / 5 ASCII, Conejero Merchán 0, eleven other-Li records,
#     exactly one same-surname Wang record at colon.js:210, five Cooper records in prostate.js.
#   citation_crosscheck.DECLARED_UNMAPPABLE, one id — PASS, and it is the entry this rule was
#     derived from. It also does the harder thing: it separates "the claim is unchecked" from "this
#     instrument cannot reach it". One clause in it is NOT re-runnable — that ccf batch 1 read the
#     paper at the publisher — and that is the CORRECT residual, not a lapse: a human read can only
#     ever be dated and attributed. Saying which part of a reason is re-runnable and which is a
#     dated human act is itself part of the evidence.
#   deploy_check.js BENIGN, one entry — PASS. "no favicon in the repo (pre-existing, known)" is a
#     statement about the tree, and it was checked, not assumed: `git ls-files | grep -i favicon`
#     returns nothing. Its arm 2 already pins the list against widening in both directions.
# THE COUNTS ABOVE ARE MACHINE-DERIVABLE NUMBERS RESTATED IN PROSE, which this project's own rule
# says will drift. They are kept because they ARE the evidence, so the predicate that regenerates
# them is named instead of hidden: run extract_citations.extract() over js/organs/*.js and count
# records by the 'author' field. A drifted number is then self-correcting rather than merely stale.
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
        'would have looked satisfied — and two of the eleven are Li|2021 (pancreas.js:230 and '
        ':245, a different paper), so a same-surname-AND-YEAR check would have looked satisfied '
        'too. Fixable at the site by dropping the initial, as liver.js '
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
    # 'etal-out-of-range:Louis' WAS DELETED HERE, in the boundary-test commit that made its span
    # stop being gated (2026-09-06). Recorded as a comment for one commit because the deletion is
    # the mechanism working end to end, and the entry is the only one in this dict's history to have
    # been rewritten to tell the truth and then removed by the fix it described: it began as
    # 'WELL-FORMED HEAD, MERELY DISTANT ... One character', which was arithmetic about a head that
    # did not own the year; it was rewritten to say it tolerated a MISCLASSIFICATION; and the
    # boundary test then reclassified its span as 'etal-shadow', which is reported and not gated, so
    # stale_declarations() would have failed the battery if this line had been left in place.
    # THE ORDER MATTERS AND IS THE POINT: the tolerance was made honest BEFORE it was made
    # unnecessary. Had it been deleted while still claiming a distant head, the record would say a
    # citation was recovered when what actually happened is that a prose year stopped pretending.
    # Its full text is in the previous commit, c50842a, which is where a deleted declaration's
    # reasoning belongs — copying it here would leave a tolerance-shaped block of prose in a dict
    # whose entries are load-bearing, and the next reader cannot tell an archived reason from a live
    # one at a glance. git show c50842a:.claude/citation_reach_check.py has it.
}


def selftest():
    ok, ran = True, 0

    def arm(label, cond, detail=''):
        nonlocal ok, ran
        ran += 1
        if not cond:
            ok = False
            print(f'SELFTEST FAIL: {label} {detail}', file=sys.stderr)
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

    # arm 4: EVERY ungated kind never becomes a problem, however many there are — the
    # reported-not-gated split, asserted rather than trusted to the prose above. Iterating
    # ALL_KINDS rather than naming one kind means a kind added later is covered without anyone
    # remembering to extend this arm.
    for kind in ALL_KINDS:
        if kind in GATED_KINDS:
            continue
        bulk = [{'file': 'x.js', 'line': i, 'year': '2020', 'kind': kind, 'key': f'H{i}'}
                for i in range(50)]
        none_fired, _, _ = evaluate(bulk)
        arm(f'{kind} is reported, never gated', not none_fired, str(none_fired[:3]))

    # arm 5: the STALE direction fires too, and only on the missing key. A tolerance list that
    # cannot go stale grows monotonically until it tolerates the whole corpus. The victim is chosen
    # programmatically: this arm used to name a key by hand, and that key was deleted the first
    # time a declaration actually went stale — leaving the arm testing nothing it was written for.
    victim = sorted(DECLARED_UNREACHED)[0]
    stale = stale_declarations({k: [] for k in DECLARED_UNREACHED if k != victim})
    arm('a declaration with no remaining span is STALE',
        len(stale) == 1 and victim in stale[0], f'victim={victim} got={stale}')
    arm('a fully-populated declaration set is not stale',
        not stale_declarations({k: [] for k in DECLARED_UNREACHED}))

    # arm 6: GATED_KINDS is a subset of ALL_KINDS. A gated kind missing from the enumeration would
    # be gated but never printed and never counted — protected and invisible at the same time.
    arm('GATED_KINDS is a subset of ALL_KINDS',
        not [k for k in GATED_KINDS if k not in ALL_KINDS],
        str([k for k in GATED_KINDS if k not in ALL_KINDS]))

    # arm 7: THE PER-KIND METRICS SUM TO THE TOTAL. This is the header's "nothing hides in a
    # residual bucket" claim, which was prose and was false. Distinct counts per kind so a
    # transposition cannot pass by coincidence.
    spans = [{'file': 'x.js', 'line': 1, 'year': '2020', 'kind': k, 'key': 'H'}
             for i, k in enumerate(ALL_KINDS) for _ in range(i + 1)]
    counts = Counter(s['kind'] for s in spans)
    metrics = sidecar_metrics(spans, counts, [])
    per_kind = sum(v for k, v in metrics.items() if k.startswith('kind_'))
    arm('per-kind metrics sum to unreached_total', per_kind == metrics['unreached_total'],
        f'{per_kind} != {metrics["unreached_total"]}')
    arm('no unlisted spans when every kind is known', metrics['kind_unlisted'] == 0,
        str(metrics['kind_unlisted']))
    arm('every ALL_KINDS member has its own metric',
        all('kind_' + k.replace('-', '_') in metrics for k in ALL_KINDS))

    # arm 8: an UNKNOWN kind is a problem AND is carried in kind_unlisted, so the sum invariant
    # holds even while the enumeration is incomplete. Both directions matter: a bucket that keeps
    # the arithmetic honest but stays silent would let an unclassified kind live here forever.
    rogue = spans + [{'file': 'x.js', 'line': 9, 'year': '2020', 'kind': 'brand-new-kind',
                      'key': 'H'}] * 3
    rcounts = Counter(s['kind'] for s in rogue)
    rmetrics = sidecar_metrics(rogue, rcounts, [])
    arm('an unknown kind is a PROBLEM', len(unknown_kinds(rcounts)) == 1, str(unknown_kinds(rcounts)))
    arm('an unknown kind lands in kind_unlisted', rmetrics['kind_unlisted'] == 3,
        str(rmetrics['kind_unlisted']))
    rper = sum(v for k, v in rmetrics.items() if k.startswith('kind_'))
    arm('the sum invariant survives an unknown kind', rper == rmetrics['unreached_total'],
        f'{rper} != {rmetrics["unreached_total"]}')

    # The COUNT is printed, not just the verdict (condition 7-bis): a pass line saying only "ok"
    # cannot tell a full run from a run whose arms were deleted, and this selftest used to print
    # nothing at all on success — silence standing in for a report of zero failures.
    if ok:
        print(f'selftest: {ran}/{ran} reach-check arms passed')
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


def unknown_kinds(counts):
    """A kind the extractor emits that ALL_KINDS does not list. Its own PROBLEM rather than a
    silent count: an unlisted kind is a residual bucket that arrived without anyone deciding
    whether it should be gated, and it would disappear from the sidecar the moment its count
    reached zero with nothing left to show it had ever been there."""
    return [f'UNKNOWN absence kind {k!r} ({counts[k]} spans): the extractor classified spans into a '
            f'kind this checker does not list, so nobody has decided whether it should be GATED. '
            f'Add it to ALL_KINDS with a one-line description of what the shape is.'
            for k in sorted(counts) if k not in ALL_KINDS]


def sidecar_metrics(spans, counts, problems):
    """Per-kind counts taken from ALL_KINDS, never from the Counter's own keys, plus the totals.
    A selftest arm asserts the per-kind values sum to unreached_total — the claim this file's
    header used to make in prose and not check, while three kinds had no metric at all."""
    metrics = {'kind_' + k.replace('-', '_'): counts.get(k, 0) for k in ALL_KINDS}
    # keeps sum(kind_*) == unreached_total UNCONDITIONALLY. Without it, a kind ALL_KINDS does not
    # list would quietly make the totals stop adding up — the exact failure the sum arm exists to
    # catch, hiding inside the sum arm's own blind spot. It is a PROBLEM as well (unknown_kinds),
    # so it cannot sit here being nonzero and merely informative.
    metrics['kind_unlisted'] = len(spans) - sum(metrics.values())
    metrics['unreached_total'] = len(spans)
    metrics['gated_total'] = sum(counts.get(k, 0) for k in GATED_KINDS)
    metrics['declared'] = len(DECLARED_UNREACHED)
    metrics['problems'] = len(problems)
    return metrics


TRACKED_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reach_unreached.json')
TRACKED_SHOWN = 20


def span_key(s):
    """Content key: file|kind|head|year. No line number — a line number churns under every edit above the span."""
    return f"{os.path.basename(s['file'])}|{s['kind']}|{s.get('key') or ''}|{s['year']}"


def track_unreached(spans):
    """Compare this run's unreached multiset with the tracked file, print ADDED/REMOVED, rewrite the file. Returns (added, removed)."""
    from collections import Counter
    now = Counter(span_key(s) for s in spans)
    before = Counter()
    existed = os.path.exists(TRACKED_FILE)
    if existed:
        with open(TRACKED_FILE, encoding='utf-8') as fh:
            before = Counter({k: n for k, n in json.load(fh)['spans']})
    added = sorted((now - before).elements())
    removed = sorted((before - now).elements())
    if not existed:
        print(f'  TRACKED SET INITIALISED: {sum(now.values())} unreached spans written to .claude/reach_unreached.json — git add it in this commit')
    for k in added[:TRACKED_SHOWN]:
        print(f'  + unreached span ADDED (read it: fix, or accept by staging the tracked file): {k}')
    for k in removed[:TRACKED_SHOWN]:
        print(f'  - unreached span REMOVED: {k}')
    if len(added) > TRACKED_SHOWN or len(removed) > TRACKED_SHOWN:
        print(f'  ... {max(0, len(added) - TRACKED_SHOWN)} more additions, {max(0, len(removed) - TRACKED_SHOWN)} more removals')
    if added or removed or not existed:
        with open(TRACKED_FILE, 'w', encoding='utf-8') as fh:
            json.dump({'_note': 'MACHINE-WRITTEN by citation_reach_check.py: the sorted multiset of citation-shaped spans the extractor '
                                'produced no record for, keyed file|kind|head|year (content, never line numbers). The check prints '
                                'ADDED/REMOVED against this file on every whole-corpus run and rewrites it; staging the diff is the '
                                'acceptance, so a new unreached span is read at the commit that adds it instead of vanishing into a count.',
                       'spans': sorted(now.items())}, fh, indent=1, ensure_ascii=True)
            fh.write('\n')
        if existed:
            print('  tracked set rewritten — git add .claude/reach_unreached.json in this commit')
    return len(added), len(removed)


def main():
    # STILL A GLOB, AND DECLARED AS SUCH. The tracked-set rule binds a producer whose metric is
    # RATCHETED; this sidecar's ratchet array is empty, for the reason given beside it below.
    # Reasoning and the general rule: battery.py's sidecar-convention block. THE TRIGGER, here because
    # this is the line that would have to change: adding anything to that array means switching this
    # default to extract_citations.corpus_paths() in the same edit.
    # AND NOTHING CHECKS THAT FOR YOU. A battery member for it was proposed and DECLINED on evidence
    # (2026-09-07, same item) because the ratchet itself fires one checkout later. So this comment is
    # the mechanism at authoring time, not a reminder that one exists.
    paths = [a for a in sys.argv[1:] if not a.startswith('--')] or sorted(glob.glob('js/organs/*.js'))
    # FAILED-TO-MEASURE IS NOT A FINDING (standing rule, 2026-09-10): an empty corpus or an extractor that produced no
    # records is an unmeasurable population, and this check once phrased that as '5 problems' about declarations.
    if not paths:
        print('citation_reach_check: REFUSING TO REPORT — the corpus glob resolved to nothing (population unmeasured; not a finding)'); sys.exit(3)
    if not extract(paths):
        print('citation_reach_check: REFUSING TO REPORT — the extractor produced 0 records over %d corpus files (population unmeasured; not a finding)' % len(paths)); sys.exit(3)
    spans = unreached_spans(paths)
    # THE UNREACHED COUNT IS A TRACKED SET, NOT A NUMBER (2026-09-10, user: 'an undeclared count is evidence of an unread
    # count' — the 151st span was only read because someone asked, and it turned out to be a note's digit year). Every
    # span is keyed by CONTENT (file|kind|head|year, never a line number, so an edit above it does not churn the set) and
    # the sorted multiset lives in .claude/reach_unreached.json, machine-written by this check alone. ADDED/REMOVED
    # against the tracked file is printed on every run; the acceptance is the staged diff — read it at commit time.
    # Only the default whole-corpus run compares (an explicit subset is a different population).
    tracked_delta = track_unreached(spans) if all(a.startswith('--') for a in sys.argv[1:]) else None
    problems, gated, counts = evaluate(spans)
    problems += stale_declarations(gated)
    problems += unknown_kinds(counts)

    print(f'citation_reach_check: {len(paths)} files, {len(spans)} years produced no record')
    # ALL_KINDS, not sorted(counts): a kind at zero must PRINT its zero. Iterating the Counter
    # would drop it from the report entirely, which reads identically to never having checked.
    for kind in ALL_KINDS:
        mark = 'GATED   ' if kind in GATED_KINDS else 'reported'
        print(f'  {mark} {kind:<22} {counts.get(kind, 0):>4} spans')
    for key, locs in sorted(gated.items()):
        print(f'    declared {key!r} x{len(locs)}: {", ".join(locs[:8])}')
    # The shapes still held for their own commit, printed with distinct head counts on every run
    # for the reason the discharged bare-name-year line was: a held item that stops being printed
    # is a held item that stops being remembered.
    for kind in ('bare-name-comma-year', 'journal-adjacent-year'):
        heads = sorted({s['key'] for s in spans if s['kind'] == kind and s['key']})
        print(f'  {kind} heads ({len(heads)} distinct, NOT gated — held): '
              f'{", ".join(heads[:12])}{" ..." if len(heads) > 12 else ""}')
    for p in problems:
        print(f'  PROBLEM: {p}')

    print('SIDECAR ' + json.dumps({
        'name': 'citation_reach_check',
        'metrics': sidecar_metrics(spans, counts, problems),
        # empty ON PURPOSE: every metric above is a defect count, and ratcheting a defect count
        # would fail the battery for fixing a defect. Empty says the producer considered it.
        'ratchet': [],
    }, sort_keys=True))
    # DONE last (condition 7-bis), after the sidecar and every listing above
    delta_txt = '' if tracked_delta is None else f' ({tracked_delta[0]} added, {tracked_delta[1]} removed vs the tracked set)'
    print(f'DONE citation_reach_check: {len(spans)} unreached spans{delta_txt}, '
          f'{sum(counts.get(k, 0) for k in GATED_KINDS)} gated '
          f'({len(DECLARED_UNREACHED)} declared), {len(problems)} problems')
    if problems:
        sys.exit(3)


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
