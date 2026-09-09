# Record-sync check (2026-09-05). Born from the split commit: the assertion-index
# requirement landed in the manifest while its CLAUDE.md half missed on a marker mismatch,
# and the commit went out with half the record — caught by a human noticing, not by
# anything checking. "Record in both homes" is a two-step operation with no atomicity;
# this check gives it verification. It cannot verify the CONTENT matches — it catches a
# HALF-LANDED record, which is the failure that happened; a STALE DECLARATION, which is the
# failure it was silently passing; and a MARKER THAT IS NOT A MARKER, i.e. one matching more
# than one place, under which a pair can be green by coincidence (both 2026-09-07, see
# check()'s docstring).
#
# THE SYNC MAP: each load-bearing dual-home record declares (manifest key, target file,
# marker that must appear there EXACTLY ONCE). DISCIPLINE: when a new dual-home record is
# created, add its pair here in the same commit, and pick a marker specific enough to match
# one place — an undeclared pair is invisible to this check, and the map is itself a record
# that can go stale (noted honestly; the alternative is a convention parser, which would be
# a bigger instrument than the failure justifies).
#
# HALF OF THAT HONEST NOTE IS NOW CLOSED, and the split is the point. "The map can go stale"
# covered two different things under one phrase. A pair NOBODY EVER ADDED is still invisible
# and still unclosable, because its population is "load-bearing records", which cannot be
# enumerated. A pair the map DOES declare and that exists in neither home is a different
# animal: its population is SYNC, which is enumerated, so it was always closable and was
# merely unclosed. An honestly-noted gap is not thereby a permanent one — the note said the
# map can go stale and then nothing checked whether it had.
#
# THAT CAVEAT IS QUOTED VERBATIM in .claude/battery.py, which hit the identical problem one
# level up — a declared instrument list can omit a member the same way this map can omit a
# pair — and could close it, because ITS population is one directory and can be enumerated.
# This map's population is "load-bearing records", which cannot be, so the caveat stands here.
#
# DECOUPLE THE MARKER FROM THE HEADING (user ruling, 2026-09-07 — recorded as a SHAPE AND NOT A TASK,
# the same treatment the sidecar reader got before a producer existed, so a session that finds this
# finds a plan rather than a hole).
#
# WHAT HAPPENED — AND IT IS THE GUARD WORKING, NOT TWO CONVENTIONS FAILING. A new CLAUDE.md passage
# cited another section BY ITS EXACT TITLE, deliberately, because the alternative was a positional
# reference ("the section below") and the anchor rule in battery.py's rule C exists to stop those. That
# title is a declared marker here. Its occurrence count went one -> two, this check fired NOT A MARKER,
# the battery refused the commit, and run_checked.sh logged the refusal. The uniqueness rule caught a
# LIVE attempt to create a duplicate, in prose, on its first real opportunity — the strongest evidence
# a rule can offer for itself. The refusal is the third entry in .claude/refusals.log and was explained
# in the commit message rather than tidied away, which is the archive being used as designed.
#
# WHY IT WILL RECUR: two rules pull in opposite directions and NEITHER IS WRONG. The sweep's rule tells
# an author to NAME a referent rather than point at a position; the uniqueness rule makes some names
# UNQUOTABLE. And there is no way to tell which headings are markers without opening this file — the
# constraint is invisible at the site where it binds, which is the property that makes recurrence a
# matter of time rather than of care.
#
# THE SHAPE OF THE FIX: a DEDICATED TOKEN that this checker looks for — a tag placed once at the
# record's home — leaving HEADINGS AS FREE PROSE that any passage may quote. The marker column then
# holds something nobody writes by accident, and citing a title costs nothing.
# WHY IT IS NOT DONE HERE: it is a change across EVERY declared pair below, in every target file — each
# token sited, agreed and verified, with this map rewritten in the same commit — and none of that is
# what the commit carrying this record is about. Done badly it leaves pairs green by coincidence, which
# is the exact failure the uniqueness rule closed.
# THE WORKAROUND UNTIL THEN, which is what the incident settled on: name the rule and its date, or
# quote a DIFFERENT span of the title. Both are cheap; both keep the referent named.
#
# Condition (7) at birth: the self-test proves it FIRES on a synthetic half-landed pair
# and PASSES a present one. Extended 2026-09-07 with three arms that fail against the logic
# they replaced — a pair absent from both homes must fire, the DONE line's count must be
# pairs FOUND rather than len(SYNC), and a marker matching twice must fire rather than read
# as landed. 7-bis: DONE line last. Wrapper form:
#   .claude/run_checked.sh "DONE record_sync_check:" python3 .claude/record_sync_check.py
import json, sys
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it produced no DONE line at all. Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SYNC = [
    # (manifest key,                    target file,                 marker in target)
    #
    # A MARKER MUST OCCUR EXACTLY ONCE IN ITS TARGET (user ruling, 2026-09-07 — see check()). Five of
    # these were substrings that matched more than one place when the rule arrived, and each was
    # lengthened to the unique span AT THE RECORD'S OWN HOME rather than to any unique string:
    #   '(7-bis)'           x2 -> the operational corollary's own heading, not its later mention
    #   'THE DIRECTION'     x2 -> the CONCLUSION, which is what _direction_conclusion records, not
    #                             the earlier ruling that shares the phrase
    #   'GROSS-SPECIMEN'    x2 -> the register decision itself, not the status-log entry recording it
    #   'CERTAINTY-DRIFT'   x6 -> the addendum's own heading. The state name was defined inside the
    #                             addendum and then used across three ccf batch records, so it read as
    #                             landed from any of them; this is the one whose marker CHANGED SITE
    #                             rather than lengthening at one.
    #   'QUOTED-SPAN CHECK' x2 -> the heading, not the batch note that cites it
    ('_assertion_index_requirement',    'CLAUDE.md',                 'ASSERTION INDEX'),
    ('_phaseA_epistemic_split',         'CLAUDE.md',                 'THE CATEGORY IS CITED; THE MAGNITUDE IS NOT'),
    ('_uncited_migrating_watchlist',    'CLAUDE.md',                 '2026-10-17'),
    ('_qualifier_placement',            'CLAUDE.md',                 'QUALIFIER-PLACEMENT PRINCIPLE'),
    ('_classification_fact_exception',  'CLAUDE.md',                 'CLASSIFICATION-FACT EXCEPTION'),
    ('_done_line_sweep',                'CLAUDE.md',                 '(7-bis) OPERATIONAL COROLLARY'),
    ('_direction_conclusion',           'CLAUDE.md',                 'THE DIRECTION, AS A CONCLUSION'),
    ('_phaseA_citations',               '.claude/phaseA_mapping.md', 'tumour is a GROSS-SPECIMEN construct'),
    ('_phase2_rescope',                 'CLAUDE.md',                 'EPI-PASS RE-SCOPE'),
    ('_ccf_read_addendum',             'CLAUDE.md',                 'ccf-READ CONTRACT ADDENDUM'),
    ('_parse_gate',                     'CLAUDE.md',                 'PARSE GATE'),
    ('_absence_claim_check',            'CLAUDE.md',                 'ABSENCE-CLAIM instrument'),
    ('_deploy_gate',                    'CLAUDE.md',                 'DEPLOY GATE'),
    ('_battery_runner',                 'CLAUDE.md',                 'BATTERY RUNNER'),
    ('_polarity_mention_reads',         'CLAUDE.md',                 'POLARITY MENTION READS'),
    ('_number_restatement_rule',        'CLAUDE.md',                 'RESTATED IN PROSE WILL DRIFT'),
    ('_quoted_span_check',              'CLAUDE.md',                 'THE QUOTED-SPAN CHECK'),
    ('_coverage_split',                  'CLAUDE.md',                 'DECLARED-AND-TOLERATED'),
    ('_done_line_form',                  'CLAUDE.md',                 'WHAT COUNTS AS A DONE LINE'),
]

MANIFEST_ONLY = 'manifest-only (half-landed)'
TARGET_ONLY = 'target-only (half-landed)'
ABSENT_BOTH = 'absent from both homes (stale declaration)'
NOT_UNIQUE = 'marker matches more than one place (not a marker)'


def check(manifest, files):
    """Returns (fires, found) — found being pairs present in BOTH homes UNDER A UNIQUE MARKER, which
    is the only number the DONE line may report as checked.

    THE MARKER MUST OCCUR EXACTLY ONCE (user ruling, 2026-09-07, closing the second silent direction
    here). The count is what is decidable from the artifact, and POSITION IS NOT: anchoring the marker
    to line start does not help when the marker text is prose that could legitimately begin a line —
    'THE DIRECTION' is exactly that shape. So the rule is arithmetic. ZERO is the stale-declaration or
    half-landed case below. MORE THAN ONE means the string is not a marker at all: it could read as
    landed from a sentence that has nothing to do with the record, so a pair could sit green in both
    homes BY COINCIDENCE. Exactly one is the only count under which "present in both homes" means what
    it says, which is the same bar as the other two rules — decidable from the file, no judgement
    about what anyone intended.

    THE THIRD CLASS, AND WHY IT IS A DEFECT (user ruling, 2026-09-07). This used to fire only on
    ASYMMETRY: a pair in the manifest but not the target, or the reverse. A pair present in NEITHER
    home tripped neither arm and passed silently — in the instrument built to catch a record that
    half-landed. The ruling is that such a pair is a STALE DECLARATION, which is declaration
    property (3) turned on SYNC itself: a closed enumerated set whose membership is not verified
    against reality. Deliberate retirement already has an explicit path — DELETE THE SYNC ENTRY,
    which is a visible reviewable diff — so a pair declared here and absent from both homes is
    always a defect: either a retirement that did not finish, or a loss.

    DISTINCT FROM THE UNDECLARED-PAIR BLIND SPOT in this file's header, and the two are easy to
    conflate. That one is a pair nobody ever added to SYNC, and it is unclosable here because its
    population is "load-bearing records". This one is a pair SYNC does claim, so its population is
    SYNC, which is enumerated — closable, and now closed.

    The kinds are compared by EQUALITY against these constants rather than by substring, because a
    counter that classifies its own findings by searching prose is the exact defect the family
    enumeration in battery.py was written for.

    ONE KIND PER ROW, and where two could apply the HALF-LANDED half wins: a key missing from the
    manifest while its marker matches twice is reported as target-only, because the missing half is
    the actionable fact and the marker's ambiguity is moot until the pair exists."""
    fires, found = [], 0
    for key, target, marker in SYNC:
        in_manifest = key in manifest
        hits = files.get(target, '').count(marker)
        if in_manifest and hits == 1:
            found += 1
        elif in_manifest and hits > 1:
            fires.append((key, target, marker, hits, NOT_UNIQUE))
        elif in_manifest:
            fires.append((key, target, marker, hits, MANIFEST_ONLY))
        elif hits:
            fires.append((key, target, marker, hits, TARGET_ONLY))
        else:
            fires.append((key, target, marker, hits, ABSENT_BOTH))
    return fires, found

def selftest():
    ok = True
    # arm 1: a half-landed pair must FIRE
    fires, _found = check({'_assertion_index_requirement': 1},
                          {'CLAUDE.md': 'text without the marker'})
    good = any(k == '_assertion_index_requirement' and kind == MANIFEST_ONLY
               for k, *_r, kind in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} fires on half-landed (manifest-only)")
    # arm 2: target-only must FIRE too (the reverse half)
    fires, _found = check({}, {'CLAUDE.md': 'contains ASSERTION INDEX marker'})
    good = any(k == '_assertion_index_requirement' and kind == TARGET_ONLY
               for k, *_r, kind in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} fires on half-landed (target-only)")
    # arm 3: a fully-landed pair must PASS
    fires, found = check({'_assertion_index_requirement': 1},
                         {'CLAUDE.md': 'contains ASSERTION INDEX marker',
                          '.claude/phaseA_mapping.md': ''})
    good = not any(k == '_assertion_index_requirement' for k, *_r in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} passes a fully-landed pair")
    # arm 4: THE STALE DECLARATION. A pair SYNC claims that is in NEITHER home must FIRE. Written to
    # fail against the two asymmetry arms this replaced, which both read False here and reported
    # nothing — the silent pass. Both homes are supplied EMPTY, so every declared pair is absent.
    fires, found = check({}, {t: '' for _k, t, _m in SYNC})
    stale = [k for k, *_r, kind in fires if kind == ABSENT_BOTH]
    good = len(stale) == len(SYNC) and found == 0
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} fires on a pair absent from BOTH homes "
          f"(stale declaration, not a silent pass)")
    # arm 5: THE COUNT NAMES WHAT IT COUNTED. `found` must be pairs present in both homes, never
    # len(SYNC) — a machine-derivable number that did not mean what it said, in the counter of the
    # instrument built to catch half-landed records. One pair landed, the rest absent.
    one = SYNC[0]
    fires, found = check({one[0]: 1}, {t: (one[2] if t == one[1] else '') for _k, t, _m in SYNC})
    good = found == 1 and len(fires) == len(SYNC) - 1
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} counts pairs FOUND, not pairs declared")
    # arm 6: THE MARKER IS UNIQUE. A pair whose marker matches TWICE must fire and must not be
    # counted as found. Written to FAIL against the `marker in text` this replaced, which was a
    # boolean: two matches read exactly like one, so a pair could be green by coincidence. The same
    # pair with ONE match passes, so the arm shows the rule did not simply break the check.
    twice = {t: ((one[2] + ' ... ' + one[2]) if t == one[1] else '') for _k, t, _m in SYNC}
    fires, found = check({one[0]: 1}, twice)
    good = found == 0 and any(k == one[0] and kind == NOT_UNIQUE and hits == 2
                              for k, _t, _m, hits, kind in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} fires when the marker matches more than once, and does "
          f"not count it as found")
    once = {t: (one[2] if t == one[1] else '') for _k, t, _m in SYNC}
    fires, found = check({one[0]: 1}, once)
    good = found == 1 and not any(kind == NOT_UNIQUE for *_r, kind in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} and a single match is still a landed pair")
    print('SELFTEST', 'PASS — fires on either half missing, on a pair present in neither home and on '
          'a marker that matches more than once, passes landed records, and counts what it found'
          if ok else 'FAIL — do not trust the scan')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    manifest = json.load(open('.claude/citations.json'))
    files = {}
    for _, target, _m in SYNC:
        if target not in files:
            files[target] = open(target, encoding='utf-8').read()
    fires, found = check(manifest, files)
    labels = {ABSENT_BOTH: 'STALE DECLARATION', NOT_UNIQUE: 'NOT A MARKER'}
    for key, target, marker, hits, kind in fires:
        print(f'  {labels.get(kind, "HALF-LANDED")}: {key} <-> {target} [{marker!r}] — {kind}, '
              f'{hits} occurrences in the target')
    stale = sum(1 for *_r, kind in fires if kind == ABSENT_BOTH)
    ambiguous = sum(1 for *_r, kind in fires if kind == NOT_UNIQUE)
    # FOUND OVER DECLARED, because a count in a DONE line must name its denominator — and because
    # the number this used to print was len(SYNC), which said "pairs checked" while counting the
    # map's length. A pair absent from both homes was covered by that number rather than reported.
    print(f'DONE record_sync_check: {found}/{len(SYNC)} declared pairs present in both homes under a '
          f'unique marker, {len(fires) - stale - ambiguous} half-landed, {stale} stale declarations, '
          f'{ambiguous} non-unique markers')
    sys.exit(1 if fires else 0)
