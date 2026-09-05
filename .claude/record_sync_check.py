# Record-sync check (2026-09-05). Born from the split commit: the assertion-index
# requirement landed in the manifest while its CLAUDE.md half missed on a marker mismatch,
# and the commit went out with half the record — caught by a human noticing, not by
# anything checking. "Record in both homes" is a two-step operation with no atomicity;
# this check gives it verification. It cannot verify the CONTENT matches — it catches a
# HALF-LANDED record, which is the failure that happened.
#
# THE SYNC MAP: each load-bearing dual-home record declares (manifest key, target file,
# marker that must appear there). DISCIPLINE: when a new dual-home record is created, add
# its pair here in the same commit — an undeclared pair is invisible to this check, and
# the map is itself a record that can go stale (noted honestly; the alternative is a
# convention parser, which would be a bigger instrument than the failure justifies).
#
# Condition (7) at birth: the self-test proves it FIRES on a synthetic half-landed pair
# and PASSES a present one. 7-bis: DONE line last. Wrapper form:
#   .claude/run_checked.sh "DONE record_sync_check:" python3 .claude/record_sync_check.py
import json, sys

SYNC = [
    # (manifest key,                    target file,                 marker in target)
    ('_assertion_index_requirement',    'CLAUDE.md',                 'ASSERTION INDEX'),
    ('_phaseA_epistemic_split',         'CLAUDE.md',                 'THE CATEGORY IS CITED; THE MAGNITUDE IS NOT'),
    ('_uncited_migrating_watchlist',    'CLAUDE.md',                 '2026-10-17'),
    ('_qualifier_placement',            'CLAUDE.md',                 'QUALIFIER-PLACEMENT PRINCIPLE'),
    ('_classification_fact_exception',  'CLAUDE.md',                 'CLASSIFICATION-FACT EXCEPTION'),
    ('_done_line_sweep',                'CLAUDE.md',                 '(7-bis)'),
    ('_direction_conclusion',           'CLAUDE.md',                 'THE DIRECTION'),
    ('_phaseA_citations',               '.claude/phaseA_mapping.md', 'GROSS-SPECIMEN'),
    ('_phase2_rescope',                 'CLAUDE.md',                 'EPI-PASS RE-SCOPE'),
    ('_ccf_read_addendum',             'CLAUDE.md',                 'CERTAINTY-DRIFT'),
]

def check(manifest, files):
    fires = []
    for key, target, marker in SYNC:
        in_manifest = key in manifest
        in_target = marker in files.get(target, '')
        if in_manifest and not in_target:
            fires.append((key, target, marker, 'manifest-only (half-landed)'))
        if in_target and not in_manifest:
            fires.append((key, target, marker, 'target-only (half-landed)'))
    return fires

def selftest():
    ok = True
    # arm 1: a half-landed pair must FIRE
    fires = check({'_x': 'present'},
                  {'CLAUDE.md': 'no marker here'}) if False else check(
        {'_assertion_index_requirement': 1}, {'CLAUDE.md': 'text without the marker'})
    good = any(k == '_assertion_index_requirement' for k, *_ in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} fires on half-landed (manifest-only)")
    # arm 2: target-only must FIRE too (the reverse half)
    fires = check({}, {'CLAUDE.md': 'contains ASSERTION INDEX marker'})
    good = any(k == '_assertion_index_requirement' for k, *_ in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} fires on half-landed (target-only)")
    # arm 3: a fully-landed pair must PASS
    fires = check({'_assertion_index_requirement': 1},
                  {'CLAUDE.md': 'contains ASSERTION INDEX marker',
                   '.claude/phaseA_mapping.md': ''})
    good = not any(k == '_assertion_index_requirement' for k, *_ in fires)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} passes a fully-landed pair")
    print('SELFTEST', 'PASS — fires on either half missing, passes landed records'
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
    fires = check(manifest, files)
    for key, target, marker, kind in fires:
        print(f'  HALF-LANDED: {key} <-> {target} [{marker!r}] — {kind}')
    print(f'DONE record_sync_check: {len(SYNC)} pairs checked, {len(fires)} half-landed')
    sys.exit(1 if fires else 0)
