# SEER Stat Facts layout-guarded scraper (built 2026-09-10 during phaseB_design.md's feasibility
# work, RESCUED FROM /tmp AND COMMITTED 2026-09-11, user-directed: "/tmp has already eaten a
# dependency on this project overnight and this is Phase C's statistics path" — see the
# puppeteer-core /tmp-vanishing incident, "FOUR SHORT ITEMS, 2026-09-10" item 2).
#
# STANDING RULE, UNCHANGED BY THIS MOVE: this is a DECLARED NON-INSTRUMENT (see battery.py's
# NON_INSTRUMENTS), not wired into any gate. NO FETCH INTEGRATION OF ANY KIND — no runtime call
# from the app, no build step, no scheduled refresh, no schema field reading its output — until a
# ruling on phaseB_design.md opens that scope. Committing the code is not committing the
# integration; the two are separate decisions and only the first has happened here.
#
# WHAT IT DOES: reproduces every one of the fifteen already-shipped morphology.js/EXTENT_STATUS
# stage-distribution lines from SEER's own public Stat Facts pages (no account, no key), and
# recovers 5-year survival-by-stage — cited nowhere in the app today — as a byproduct of the same
# parse. WHAT IT REFUSES RATHER THAN GUESSES: any page whose structure has drifted from what this
# scraper was built against (renamed/reordered columns, a renamed stage label, shares that don't
# sum to ~100, a duplicated or missing table wrapper) raises LayoutError instead of returning a
# best-effort or partial parse — silent wrong data is the failure mode this project's own
# Convention F (battery.py) exists to keep out of a parser's fixture set. The five negative
# controls below (each a real structural mutation of a genuinely-fetched page, not a synthetic
# string) are what this file itself tests on every run. A SIXTH, more serious construction — a
# duplicate "statWrap survival-factSheet" block with fabricated-but-internally-consistent data
# planted before the real one — was also run during development and is what actually found a real
# gap the five below never covered: re.search's first-match semantics silently binding to an
# earlier duplicate. That construction was not folded back into this file's own mutants dict, only
# its FIX survives here — the `len(all_starts) > 1` refusal a few lines down, which exists because
# of it.
#
# WHAT IS GENUINELY NOT DONE, STATED PLAINLY RATHER THAN IMPLIED BY OMISSION: no cache/refresh
# script, no schema wiring, no staleness check wired to a calendar (the vintage-string-compare
# policy is specified in phaseB_design.md but not coded here). And the disclosed limitation that
# matters most for Phase C specifically: this is validated against the FIFTEEN PAGES THIS ATLAS
# ALREADY CITES. SEER Stat Facts covers roughly sixty cancer sites; a Phase C entry's page could
# carry a layout deviation this scraper has never seen. Refuse-on-mismatch means that fails LOUDLY
# rather than silently — the property asked for — but "loud failure" and "tested on everything
# Phase C will touch" are different claims, and only the first one is true today.
#
# USAGE: run by hand, not via run_checked.sh/battery.py (it makes real network calls to
# seer.cancer.gov and is not part of any commit gate):
#     python3 .claude/seer_statfacts_scraper.py
# Caches fetched pages at /tmp/ca-statfacts-<slug>.html and writes a full result dump to
# /tmp/ca-seer-statfacts-scraper-result.json — both scratch, regenerated on every run, never
# committed. If /tmp is wiped between runs the next run simply re-fetches; nothing here depends on
# the cache surviving, unlike the negative-control block below, which reads the pancreas cache file
# the main loop just populated in the SAME run (a real, accepted ordering dependency, not a bug).

import re, sys, json, urllib.request, datetime

UA = "Mozilla/5.0 (research; cancer-atlas educational project)"

STAGE_VOCAB = {
    'In Situ': 'inSitu', 'Localized': 'localized', 'Regional': 'regional',
    'Distant': 'distant', 'Unknown': 'unknown',
}

class LayoutError(Exception):
    """The page structure did not match what this scraper was built against.
    A LayoutError means REFUSE — never guess, never return a partial/best-effort parse."""

def fetch(url, cache_path=None):
    if cache_path:
        try:
            return open(cache_path, encoding='utf-8', errors='replace').read()
        except FileNotFoundError:
            pass
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        html = r.read().decode('utf-8', errors='replace')
    if cache_path:
        open(cache_path, 'w', encoding='utf-8').write(html)
    return html

def scrape_stage_table(html, cancer_slug):
    """Returns a dict of the derived declaration, or raises LayoutError, or returns
    {'noTable': True} if the page genuinely carries no stage table (a real negative,
    distinct from a parse failure)."""

    # locate the specific statWrap that holds the stage/survival table -- scoped by CLASS and by
    # INDEX (find the opening tag, then the next sibling-level boundary after it), not by a single
    # regex spanning the whole block, because exact intervening whitespace (tabs vs spaces) is not
    # part of the layout contract and must not be able to trigger a false refusal
    all_starts = list(re.finditer(r'<div class="statWrap survival-factSheet">', html))
    if not all_starts:
        if 'id="scrapeTable_02"' not in html:
            return {'noTable': True}
        raise LayoutError(f"[{cancer_slug}] found scrapeTable_02 elsewhere on the page but no "
                           f"'statWrap survival-factSheet' opening div precedes it -- the wrapper "
                           f"markup has changed shape; refusing rather than guessing which table it is")
    if len(all_starts) > 1:
        raise LayoutError(f"[{cancer_slug}] found {len(all_starts)} 'statWrap survival-factSheet' "
                           f"divs on one page, not one -- refusing rather than silently binding to "
                           f"the first (an earlier duplicate or a spurious block would otherwise win "
                           f"over the real one with no error, no matter how wrong its data is)")
    start_m = all_starts[0]
    end_m = re.search(r'<div class="additional">', html[start_m.end():])
    if not end_m:
        raise LayoutError(f"[{cancer_slug}] found the survival-factSheet div but no following "
                           f"'additional' div to bound it -- refusing rather than scanning an "
                           f"unbounded region")
    block = html[start_m.end():start_m.end() + end_m.start()]

    title_m = re.search(r'<strong class="title">Percent of Cases &amp; 5-Year Relative Survival '
                         r'by Stage at Diagnosis:\s*([^<]+?)\s*</strong>', block)
    if not title_m:
        raise LayoutError(f"[{cancer_slug}] survival-factSheet block found but its own title string "
                           f"does not match the expected 'Percent of Cases & 5-Year Relative Survival "
                           f"by Stage at Diagnosis: <name>' form -- refusing")
    cancer_name = title_m.group(1).strip()

    table_m = re.search(r'<table id="scrapeTable_02">(.*?)</table>', block, re.S)
    if not table_m:
        raise LayoutError(f"[{cancer_slug}] title matched but table id=scrapeTable_02 not found "
                           f"inside the same block -- refusing")
    table = table_m.group(1)

    head_m = re.search(r'<thead>(.*?)</thead>', table, re.S)
    if not head_m:
        raise LayoutError(f"[{cancer_slug}] scrapeTable_02 has no <thead> -- refusing")
    headers = re.findall(r'<th[^>]*>\s*([^<]+?)\s*</th>', head_m.group(1))
    expected_headers = ['Stage', 'Percent of Cases', '5-Year Relative Survival']
    if headers != expected_headers:
        raise LayoutError(f"[{cancer_slug}] thead columns are {headers!r}, expected "
                           f"{expected_headers!r} -- refusing (a column reorder or rename would "
                           f"silently mislabel every value below it)")

    body_m = re.search(r'<tbody>(.*?)</tbody>', table, re.S)
    if not body_m:
        raise LayoutError(f"[{cancer_slug}] scrapeTable_02 has no <tbody> -- refusing")
    rows = re.findall(r'<tr>\s*<th>(.*?)</th>\s*<td>([^<]*)</td>\s*<td>([^<]*)</td>\s*</tr>',
                       body_m.group(1), re.S)
    if len(rows) == 0:
        raise LayoutError(f"[{cancer_slug}] scrapeTable_02's <tbody> matched the outer table but no "
                           f"row matched the expected <th>/<td>/<td> shape -- refusing")

    shares = {}
    survival = {}
    for stage_cell, pct_cell, surv_cell in rows:
        name_m = re.match(r'\s*<strong>([^<]+)</strong>', stage_cell)
        if not name_m:
            raise LayoutError(f"[{cancer_slug}] a stage row's <th> does not open with "
                               f"<strong>StageName</strong> -- got {stage_cell!r} -- refusing")
        stage_name = name_m.group(1).strip()
        if stage_name not in STAGE_VOCAB:
            raise LayoutError(f"[{cancer_slug}] row names stage {stage_name!r}, not in the closed "
                               f"vocabulary {sorted(STAGE_VOCAB)} -- refusing rather than inventing a "
                               f"new share key silently")
        key = STAGE_VOCAB[stage_name]
        pct_m = re.match(r'^(\d+(?:\.\d+)?)%$', pct_cell.strip())
        surv_m = re.match(r'^(\d+(?:\.\d+)?)%$', surv_cell.strip())
        if not pct_m or not surv_m:
            raise LayoutError(f"[{cancer_slug}] stage {stage_name!r} cell did not parse as N% -- "
                               f"pct={pct_cell!r} surv={surv_cell!r} -- refusing")
        shares[key] = float(pct_m.group(1))
        survival[key] = float(surv_m.group(1))

    total = sum(shares.values())
    if not (99.0 <= total <= 101.0):
        raise LayoutError(f"[{cancer_slug}] parsed shares sum to {total}, outside the [99,101] "
                           f"rounding-tolerance band -- refusing rather than shipping shares that "
                           f"don't sum to ~100")

    foot_m = re.search(r'<p class="footnote">([^<]+)</p>\s*</div>\s*\Z', block, re.S)
    basis = foot_m.group(1).strip() if foot_m else None
    if not basis or 'SEER' not in basis:
        raise LayoutError(f"[{cancer_slug}] no SEER-attributed footnote found immediately inside "
                           f"the survival-factSheet block -- refusing rather than shipping an "
                           f"un-sourced basis string")

    return {
        'noTable': False,
        'cancerName': cancer_name,
        'shares': shares,
        'survivalByStage': survival,
        'basis': basis,
    }


ENTRIES = [
    ('pdac', 'pancreas', 'https://seer.cancer.gov/statfacts/html/pancreas.html'),
    ('melanoma', 'melan', 'https://seer.cancer.gov/statfacts/html/melan.html'),
    ('gbm', 'brain', 'https://seer.cancer.gov/statfacts/html/brain.html'),
    ('tnbc', 'breast', 'https://seer.cancer.gov/statfacts/html/breast.html'),
    ('crc', 'colorect', 'https://seer.cancer.gov/statfacts/html/colorect.html'),
    ('ccrcc', 'kidrp', 'https://seer.cancer.gov/statfacts/html/kidrp.html'),
    ('hcc', 'livibd', 'https://seer.cancer.gov/statfacts/html/livibd.html'),
    ('luad', 'lungb', 'https://seer.cancer.gov/statfacts/html/lungb.html'),
    ('hgsoc', 'ovary', 'https://seer.cancer.gov/statfacts/html/ovary.html'),
    ('clear', 'ovary', 'https://seer.cancer.gov/statfacts/html/ovary.html'),
    ('acinar', 'prost', 'https://seer.cancer.gov/statfacts/html/prost.html'),
    ('gdiff', 'stomach', 'https://seer.cancer.gov/statfacts/html/stomach.html'),
    ('seminoma', 'testis', 'https://seer.cancer.gov/statfacts/html/testis.html'),
    ('ptc', 'thyro', 'https://seer.cancer.gov/statfacts/html/thyro.html'),
    ('ftc', 'thyro', 'https://seer.cancer.gov/statfacts/html/thyro.html'),
    ('uc', 'urinb', 'https://seer.cancer.gov/statfacts/html/urinb.html'),
]

EXISTING = {
    'pdac': {'localized': 15, 'regional': 28, 'distant': 51, 'unknown': 5},
    'melanoma': {'localized': 77, 'regional': 10, 'distant': 5, 'unknown': 9},
    'gbm': {'localized': 77, 'regional': 14, 'distant': 2, 'unknown': 7},
    'tnbc': {'localized': 64, 'regional': 27, 'distant': 6, 'unknown': 2},
    'crc': {'localized': 34, 'regional': 37, 'distant': 23, 'unknown': 6},
    'ccrcc': {'localized': 66, 'regional': 17, 'distant': 15, 'unknown': 3},
    'hcc': {'localized': 45, 'regional': 23, 'distant': 21, 'unknown': 10},
    'luad': {'localized': 24, 'regional': 21, 'distant': 51, 'unknown': 4},
    'hgsoc': {'localized': 22, 'regional': 18, 'distant': 54, 'unknown': 6},
    'clear': {'localized': 22, 'regional': 18, 'distant': 54, 'unknown': 6},
    'acinar': {'localized': 69, 'regional': 14, 'distant': 9, 'unknown': 8},
    'gdiff': {'localized': 32, 'regional': 23, 'distant': 35, 'unknown': 9},
    'seminoma': None,  # existing status: uncharacterised, page has no distribution
    'ptc': {'localized': 63, 'regional': 31, 'distant': 3, 'unknown': 3},
    'ftc': {'localized': 63, 'regional': 31, 'distant': 3, 'unknown': 3},
    'uc': {'inSitu': 50, 'localized': 34, 'regional': 7, 'distant': 6, 'unknown': 3},
}

def main():
    results = {}
    for cancer_id, slug, url in ENTRIES:
        cache = f'/tmp/ca-statfacts-{slug}.html'
        try:
            html = fetch(url, cache_path=cache)
        except Exception as e:
            results[cancer_id] = {'error': f'fetch failed: {e}'}
            continue
        try:
            parsed = scrape_stage_table(html, cancer_id)
        except LayoutError as e:
            results[cancer_id] = {'error': f'LAYOUT REFUSAL: {e}'}
            continue
        results[cancer_id] = parsed

    print(f"{len(ENTRIES)} entries attempted, {len(set(s for _, s, _ in ENTRIES))} distinct pages fetched\n")
    matches, mismatches, refusals, correctly_no_table = 0, 0, 0, 0
    for cancer_id, slug, url in ENTRIES:
        r = results[cancer_id]
        expected = EXISTING[cancer_id]
        if 'error' in r:
            refusals += 1
            print(f"  REFUSED  {cancer_id:10s} {r['error']}")
            continue
        if r['noTable']:
            if expected is None:
                correctly_no_table += 1
                print(f"  OK       {cancer_id:10s} no table on page, matches existing status=uncharacterised")
            else:
                mismatches += 1
                print(f"  MISMATCH {cancer_id:10s} scraper found NO table but morphology.js has shares {expected}")
            continue
        got = r['shares']
        if got == {k: float(v) for k, v in expected.items()}:
            matches += 1
            print(f"  MATCH    {cancer_id:10s} {r['cancerName']!r} shares={got} survival={r['survivalByStage']}")
        else:
            mismatches += 1
            print(f"  MISMATCH {cancer_id:10s} scraped={got} vs morphology.js={expected}")

    print(f"\n{matches} exact matches, {mismatches} mismatches, {refusals} layout refusals, "
          f"{correctly_no_table} correctly-detected no-table pages, out of {len(ENTRIES)} entries "
          f"over {len(set(s for _, s, _ in ENTRIES))} distinct pages")

    # negative control: prove the layout assertion actually refuses on a real structural change,
    # not just on inputs it happened to be built from
    pancreas_html = open('/tmp/ca-statfacts-pancreas.html', encoding='utf-8').read()
    mutants = {
        'renamed column': pancreas_html.replace('<th scope="col">Percent of Cases</th>',
                                                  '<th scope="col">Share of Cases</th>'),
        'reordered columns': pancreas_html.replace(
            '<th scope="col">Stage</th>\n\t\t\t\t\t\t\t\t\t<th scope="col">Percent of Cases</th>',
            '<th scope="col">Percent of Cases</th>\n\t\t\t\t\t\t\t\t\t<th scope="col">Stage</th>'),
        'renamed stage label': pancreas_html.replace('<strong>Localized</strong>', '<strong>Local</strong>'),
        'shares no longer sum to 100': pancreas_html.replace('<td>15%</td>', '<td>1%</td>'),
        'table id changed': pancreas_html.replace('id="scrapeTable_02"', 'id="scrapeTable_03"'),
    }
    print("\nnegative controls (each must be a LAYOUT REFUSAL, never a silent wrong parse):")
    all_refused = True
    for name, mutant_html in mutants.items():
        try:
            scrape_stage_table(mutant_html, f'mutant:{name}')
            print(f"  FAIL     {name:32s} did NOT refuse -- parsed a corrupted structure silently")
            all_refused = False
        except LayoutError as e:
            print(f"  ok       {name:32s} refused: {str(e)[:90]}...")

    print(f"\nDONE seer_statfacts_scraper: {matches}/{len(ENTRIES)} exact matches, {mismatches} mismatches, "
          f"{refusals} refusals, {len(mutants)} negative controls all correctly refused = {all_refused}")

    out = {'results': results, 'matches': matches, 'mismatches': mismatches, 'refusals': refusals,
           'correctly_no_table': correctly_no_table, 'negative_controls_all_refused': all_refused,
           'ranAt': datetime.datetime.utcnow().isoformat() + 'Z'}
    json.dump(out, open('/tmp/ca-seer-statfacts-scraper-result.json', 'w'), indent=1, default=str)

if __name__ == '__main__':
    main()
