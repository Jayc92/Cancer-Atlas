# Extent stage-applicability check — the THIRD failure mode, previously unguarded (2026-09-12,
# user-directed, found by GBM's own degenerate survival table: Regional 5-year survival 20.1% <
# Distant 28.0%, an inversion no share-bound or missing-data check could ever catch, because the
# aggregate's NUMBERS parsed cleanly — the axis just doesn't carry meaning for that site).
#
# THE THREE FAILURE MODES, AND WHICH ONE THIS COVERS: (1) a subtype diverges from its organ
# aggregate — covered by the share-arithmetic bound (phaseC_design.md §6b); (2) no per-subtype
# data exists — covered by `uncharacterised`; (3) stage-at-diagnosis is not a meaningful axis for
# the SITE AT ALL, regardless of subtype or share — covered by NOTHING before this file. Mode 3 is
# mechanically checkable: real cancer at a real stage should show WORSE survival at a MORE ADVANCED
# stage. Localized should survive at least as well as Regional; Regional at least as well as
# Distant. An inversion is not a rounding artifact at the % precision these pages publish — it is a
# structural signal that the registry's stage categories aren't tracking anatomic extent for this
# disease the way they do for an ordinary epithelial cancer, exactly as CBTRUS's and NCI PDQ's own
# text state directly for brain/CNS tumors (js/morphology.js's EXTENT_STATUS.gbm.uncharacterisedReason).
#
# THIS IS A DECLARED NON-INSTRUMENT (see battery.py's NON_INSTRUMENTS), same standing as
# seer_statfacts_scraper.py: it makes real network calls to seer.cancer.gov and is not part of any
# commit gate. Run by hand:
#     python3 .claude/extent_monotonicity_check.py
#
# REUSES THE EXISTING SCRAPER RATHER THAN DUPLICATING IT: `fetch`, `scrape_stage_table`, and
# `ENTRIES` are imported directly from seer_statfacts_scraper.py, which already parses
# `survivalByStage` as a byproduct of its own stage-share parse (its own header names this
# explicitly: "recovers 5-year survival-by-stage ... as a byproduct of the same parse"). This file
# adds exactly one thing on top: the monotonicity assertion. Fetching, caching, and layout-refusal
# discipline are inherited whole, not reimplemented — the same "don't duplicate a population"
# rule pointer_check.py and citation_paren_ledger.py already follow for their own shared globs.

import sys, os, datetime, json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seer_statfacts_scraper import fetch, scrape_stage_table, ENTRIES, LayoutError  # noqa: E402

ORDER = ['localized', 'regional', 'distant']  # the chain the user named; 'in situ'/'unknown' don't
                                                # fit this strict worsening order the same way and
                                                # are deliberately excluded from the check itself


def check_monotonic(survival):
    """survival: dict with at least the keys present on the page (a subset of ORDER is fine — a
    page missing 'distant' entirely, e.g. because no cases in that bucket, is not a violation of
    THIS check; scrape_stage_table's own [99,101] sum-refusal is what would catch that elsewhere).
    Returns (True, None) if every present pair in ORDER is non-increasing; (False, description) on
    the first inversion found, naming the two stages and their survival percentages."""
    present = [k for k in ORDER if k in survival]
    for i in range(len(present) - 1):
        a, b = present[i], present[i + 1]
        if survival[a] < survival[b]:
            return False, (f"{a} 5-yr survival {survival[a]}% < {b} 5-yr survival {survival[b]}% "
                            f"— a MORE advanced stage surviving BETTER than a less advanced one")
    return True, None


FIXTURES = [
    # (label, survival dict, want_pass) — the GBM fixture is the real numbers, not a synthetic
    # stand-in, because this check exists specifically because that real table was found by a
    # human reading it; condition (7) requires this exact shape to fire before any live page is
    # trusted to report cleanly.
    ('GBM real numbers (known positive — must fire)',
     {'localized': 35.3, 'regional': 20.1, 'distant': 28.0}, False),
    ('ordinary monotonic decrease (known negative — must stay silent)',
     {'localized': 90.0, 'regional': 60.0, 'distant': 20.0}, True),
    ('exact ties allowed (not a violation)',
     {'localized': 50.0, 'regional': 50.0, 'distant': 50.0}, True),
    ('missing distant entirely (not a violation of THIS check)',
     {'localized': 80.0, 'regional': 40.0}, True),
    ('inversion at the regional/distant boundary only',
     {'localized': 90.0, 'regional': 10.0, 'distant': 15.0}, False),
    ('inversion at the localized/regional boundary only',
     {'localized': 10.0, 'regional': 50.0, 'distant': 5.0}, False),
]


def selftest():
    ok = True
    for label, survival, want_pass in FIXTURES:
        got_pass, detail = check_monotonic(survival)
        good = got_pass == want_pass
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {'monotonic' if got_pass else detail}")
    print('SELFTEST', 'PASS — fires on the real GBM inversion, silent on monotonic/tied/partial cases'
          if ok else 'FAIL — do not trust this check')
    return ok


def main():
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    print()

    # one fetch per DISTINCT page, not per cancer id — several ids (hgsoc/clear; ptc/ftc) share
    # one SEER page, and the monotonicity property belongs to the PAGE, not to the id
    seen_slugs = {}
    violations = []
    refusals = []
    checked = 0
    for cancer_id, slug, url in ENTRIES:
        if slug in seen_slugs:
            continue
        seen_slugs[slug] = True
        cache = f'/tmp/ca-statfacts-{slug}.html'
        try:
            html = fetch(url, cache_path=cache)
            parsed = scrape_stage_table(html, cancer_id)
        except LayoutError as e:
            refusals.append((slug, str(e)))
            print(f"  REFUSED  {slug:10s} {e}")
            continue
        except Exception as e:
            refusals.append((slug, f'fetch failed: {e}'))
            print(f"  REFUSED  {slug:10s} fetch failed: {e}")
            continue
        if parsed['noTable']:
            print(f"  N/A      {slug:10s} page carries no stage/survival table at all")
            continue
        checked += 1
        is_monotonic, detail = check_monotonic(parsed['survivalByStage'])
        if is_monotonic:
            print(f"  ok       {slug:10s} {parsed['cancerName']!r} survival={parsed['survivalByStage']} — monotonic")
        else:
            violations.append((slug, parsed['cancerName'], detail))
            print(f"  INVERTED {slug:10s} {parsed['cancerName']!r} survival={parsed['survivalByStage']} — {detail}")

    print(f"\n{checked} distinct pages checked, {len(violations)} inversions, {len(refusals)} layout/fetch refusals")
    if violations:
        print("\nPAGES WHOSE STAGE AXIS DOES NOT CARRY THE USUAL MEANING (candidates for "
              "'uncharacterised' regardless of any entry's own share):")
        for slug, name, detail in violations:
            print(f"  {slug}: {name} — {detail}")

    out = {'checked': checked, 'violations': violations, 'refusals': refusals,
           'ranAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    json.dump(out, open('/tmp/ca-extent-monotonicity-result.json', 'w'), indent=1, default=str)

    print(f"\nDONE extent_monotonicity_check: {checked} pages checked, {len(violations)} inversions "
          f"found ({', '.join(s for s, _, _ in violations) if violations else 'none'}), "
          f"{len(refusals)} refusals")


if __name__ == '__main__':
    main()
