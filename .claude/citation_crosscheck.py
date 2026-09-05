# Identifier↔metadata cross-check (2026-09-04). The Rachakonda find, generalised: for every
# identifier-carrying record, check the RECORDED journal / first author / year against what
# the identifier itself resolves to (PubMed esummary, bulk). One API pass, no papers read.
# Two jobs at once:
#   - ATTRIBUTION-ERROR DETECTION: a source line whose recorded journal disagrees with its
#     own identifier's journal is the taxonomy's fixable defect class (bladder.js:174 says
#     "PLoS ONE"; PMC3808633 resolves to PNAS).
#   - BACKFILL VALIDATION BY CONSTRUCTION: a backfilled identifier whose metadata disagrees
#     with its source line is a wrong backfill. Run retrospectively, this check would have
#     flagged Zhu, Arends, Wilentz and Oweira automatically — four finds that cost 29
#     hand-read titles now cost one API pass, on every future backfill too.
#
# CONTRACT: this tool FLAGS, it never rules. Every flag gets a human mention-level read
# (abbreviation quirks, epub-vs-print years, corrigendum merges, and record-key artifacts
# like the 'Neuro-Oncology'/'PNAS' fragment keys are expected flag classes) — same
# flag-then-human-read shape as the polarity guard.
#
# STANDING CONDITION (7), BOTH DIRECTIONS: --selftest proves the checker can FIRE (journal /
# author / year mismatch fixtures) and can PASS (an agreeing fixture) on canned esummary-
# shaped data before any live scan is trusted; the live run additionally asserts its known
# positives fire (the fragment record keys guarantee author-mismatch flags exist), so an
# all-clean live scan is impossible unless the tool is broken — and then it says so.
import json, re, sys, time, unicodedata, urllib.request

def deaccent(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s or '')
                   if not unicodedata.combining(c))

ABBREV = {'nejm': 'new england', 'jco': 'journal of clinical oncology',
          'pnas': 'national academy of sciences', 'jama': 'jama',
          'apmis': 'acta pathologica'}

def check_one(rec_author, rec_year, rec_journal, es):
    """Compare recorded fields against one esummary dict. Returns list of flag strings."""
    flags = []
    auths = es.get('authors') or []
    first = deaccent(auths[0]['name']) if auths else ''
    rec_author = deaccent(rec_author)
    fam = ' '.join(first.split()[:-1]) if len(first.split()) > 1 else first
    ra = (rec_author or '').lower()
    if ra and fam:
        toks = set(re.findall(r"[a-z'’-]+", fam.lower())) | {fam.lower()}
        if ra not in toks and not any(t in ra.split() for t in toks) \
           and ra.replace(' ', '') != fam.lower().replace(' ', ''):
            flags.append(f'author: recorded {rec_author!r} vs id-first-author {first!r}')
    yr = (es.get('pubdate', '') or '')[:4]
    if rec_year and yr and rec_year != yr:
        flags.append(f'year: recorded {rec_year} vs id-pubdate {yr}')
    if rec_journal:
        jfull = ((es.get('fulljournalname', '') or '') + ' ' + (es.get('source', '') or '')).lower()
        words = rec_journal.lower().split()[:3]
        exp = ABBREV.get(words[0])
        ok = (exp in jfull) if exp else all(w in jfull for w in words)
        if not ok:
            flags.append(f'journal: recorded {rec_journal!r} vs id-journal '
                         f'{es.get("source", "")!r} ({es.get("fulljournalname", "")[:40]!r})')
    return flags

FIXTURES = [
    # (recorded author, year, journal, esummary-shaped dict, must_flag_substring or None)
    ('Rachakonda', '2013', 'PLoS ONE',
     {'authors': [{'name': 'Rachakonda PS'}], 'pubdate': '2013 Oct',
      'fulljournalname': 'Proceedings of the National Academy of Sciences of the United '
      'States of America', 'source': 'Proc Natl Acad Sci U S A'}, 'journal:'),
    ('Zhu', '2003', None,
     {'authors': [{'name': 'Sung JM'}], 'pubdate': '2003',
      'fulljournalname': 'Theoretical and applied genetics', 'source': 'Theor Appl Genet'},
     'author:'),
    ('Arends', '2026', 'Histopathology',
     {'authors': [{'name': 'Arends DW'}], 'pubdate': '2025 Dec',
      'fulljournalname': 'The ISME journal', 'source': 'ISME J'}, 'year:'),
    ('Cooper', '2015', 'Nature Genetics',
     {'authors': [{'name': 'Cooper CS'}], 'pubdate': '2015 Apr',
      'fulljournalname': 'Nature genetics', 'source': 'Nat Genet'}, None),
    ('Wiegand', '2010', 'NEJM',
     {'authors': [{'name': 'Wiegand KC'}], 'pubdate': '2010 Oct',
      'fulljournalname': 'The New England journal of medicine', 'source': 'N Engl J Med'},
     None),   # abbreviation map must prevent a false journal flag
]

def selftest():
    ok = True
    for a, y, j, es, want in FIXTURES:
        flags = check_one(a, y, j, es)
        good = (any(want in f for f in flags)) if want else (not flags)
        ok &= good
        label = f'fires[{want.rstrip(":")}]' if want else 'passes'
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {a} {y} -> {flags or 'clean'}")
    print('SELFTEST', 'PASS — can fire on all three fields and can pass; zeros meaningful'
          if ok else 'FAIL — do not trust any scan')
    return ok

def main():
    M = json.load(open('.claude/citations.json'))
    v2 = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else []
    work = []   # (pmid, rec_author, rec_year, rec_journal, ref, origin)
    for e in M['backfill']:
        if e.get('pmid') and e['status'] in ('backfilled', 'entry-time-identifier'):
            jr = e.get('journalOnLine') or e.get('journal')
            if jr in ('?',): jr = e.get('journal')
            work.append((e['pmid'], e['author'], e['year'], jr, e['refs'][0], e['status']))
    doi_only = sum(1 for e in M['backfill']
                   if e['status'] == 'backfilled' and not e.get('pmid') and e.get('doi'))
    for r in v2:
        for i in r.get('entryTimeIds', []):
            if i.startswith('PMID:'):
                work.append((i[5:], r['author'], r['year'], r['journal'], r['ref'],
                             'entry-time(v2-source)'))
    seen, uniq = set(), []
    for w in work:
        k = (w[0], w[4])
        if k in seen: continue
        seen.add(k); uniq.append(w)
    pmids = sorted({w[0] for w in uniq})
    print(f'{len(uniq)} identifier-carrying records ({len(pmids)} unique pmids; '
          f'{doi_only} doi-only skipped this pass)')
    es = {}
    for i in range(0, len(pmids), 150):
        chunk = pmids[i:i + 150]
        u = ('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed'
             f'&retmode=json&id={",".join(chunk)}')
        js = json.load(urllib.request.urlopen(u, timeout=40))
        es.update(js.get('result', {}))
        time.sleep(0.4)
    flagged = []
    for pmid, a, y, j, ref, origin in uniq:
        d = es.get(pmid)
        if not isinstance(d, dict) or not d.get('title'):
            flagged.append((pmid, a, y, ref, origin, ['id: pmid not resolvable']))
            continue
        flags = check_one(a, y, j, d)
        if flags:
            flagged.append((pmid, a, y, ref, origin, flags))
    print(f'\nFLAGS: {len(flagged)} of {len(uniq)}')
    for pmid, a, y, ref, origin, flags in flagged:
        print(f'  {pmid} {a} {y} [{origin}] {ref}')
        for f in flags: print(f'      {f}')
    # condition (7) live assertion: the fragment record keys guarantee author flags exist
    assert any('author:' in f for _, _, _, _, _, fl in flagged for f in fl), \
        'live known-positives absent — the checker cannot be firing correctly'
    print('\nlive known-positive assertion: PASS (author flags present as expected)')
    json.dump([{'pmid': p, 'author': a, 'year': y, 'ref': r, 'origin': o, 'flags': fl}
               for p, a, y, r, o, fl in flagged],
              open('/tmp/atlas-verify/cite/crosscheck_flags.json', 'w'), indent=1)

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
