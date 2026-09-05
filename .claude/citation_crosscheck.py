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
#
# IT REFUSES WITHOUT ITS INPUT, and that is a 2026-09-05 correction to a worse bug than the one
# citation_polarity.py died of (user ruling): "A dead instrument announces itself. A degraded one
# produces a plausible number." The v2 records artifact used to be OPTIONAL — `if len(sys.argv) > 1
# else []` — so invoking this tool with no argument silently dropped the entire entry-time-
# identifier population and checked 110 records instead of 142, under a DONE line whose shape was
# indistinguishable from a full scan. Polarity died loudly (KeyError, no DONE line, wrapper exit
# non-zero, caught the same day). This one would have kept reporting "110 records checked, 3
# flags" forever. So the artifact is now REQUIRED and its absence is a refusal, not a default:
# 32 unexamined records is a finding, and a finding must never be spelled as a smaller total.
# battery.py regenerates the artifact before invoking this tool, so the refusal never fires in
# normal use — it fires exactly when someone runs the scan by hand without one.
import json, os, re, sys, tempfile, time, unicodedata, urllib.parse, urllib.request

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
    # THE REFUSAL IS ITSELF A CAPABILITY THAT HAS TO BE DEMONSTRATED (commit_checked.sh's rule:
    # a tool whose job is refusing has to be shown refusing). Both directions, because a refusal
    # that fires on a legitimate invocation is as bad as one that never fires: it would make the
    # battery unable to run this instrument at all, and an instrument that can't be invoked is
    # the exact hole battery.py was built to close.
    try:
        records_path(['citation_crosscheck.py'], quiet=True)
        refused = False
    except SystemExit as e:
        refused = e.code == 2
    ok &= refused
    print(f"  {'ok  ' if refused else 'FAIL'} refuses with no records artifact "
          f"(exit 2, no DONE line) rather than scanning a smaller population")
    accepted = records_path(['citation_crosscheck.py', '--selftest', 'recs.json']) == 'recs.json'
    ok &= accepted
    print(f"  {'ok  ' if accepted else 'FAIL'} accepts the artifact alongside flag-shaped args")
    print('SELFTEST', 'PASS — can fire on all three fields, can pass, and refuses without input'
          if ok else 'FAIL — do not trust any scan')
    return ok

def records_path(argv, quiet=False):
    """The v2 records artifact, REQUIRED. Flag-shaped args are ignored so --selftest still works.

    Refusing here rather than defaulting to [] is the whole fix: a missing artifact used to
    subtract 32 records from the scan and say nothing. Exits 2 WITHOUT printing a DONE line, so
    run_checked.sh fails the invocation too — a refusal that a wrapper reads as success would be
    the same hole one layer out."""
    positional = [a for a in argv[1:] if not a.startswith('-')]
    if not positional:
        if quiet:      # the selftest exercises the refusal; it does not need the advice text
            sys.exit(2)
        print('citation_crosscheck: REFUSING TO SCAN — no v2 records artifact given.\n'
              '  Without it the entry-time-identifier population is invisible and the scan\n'
              '  silently shrinks (110 records instead of 142) under a normal-looking DONE line.\n'
              '  Regenerate and pass it:\n'
              '    python3 .claude/extract_citations.py /tmp/atlas-battery/records.json\n'
              '    python3 .claude/citation_crosscheck.py /tmp/atlas-battery/records.json\n'
              '  Or run the whole battery, which regenerates it first:\n'
              '    python3 .claude/battery.py pre-commit', file=sys.stderr)
        sys.exit(2)
    return positional[0]


def main():
    M = json.load(open('.claude/citations.json'))
    v2 = json.load(open(records_path(sys.argv)))
    work = []   # (pmid, rec_author, rec_year, rec_journal, ref, origin)
    for e in M['backfill']:
        if e.get('pmid') and e['status'] in ('backfilled', 'entry-time-identifier'):
            jr = e.get('journalOnLine') or e.get('journal')
            if jr in ('?',): jr = e.get('journal')
            work.append((e['pmid'], e['author'], e['year'], jr, e['refs'][0], e['status']))
    tomap = []   # (raw id, author, year, journal, ref) — PMC/doi ids needing a PMID mapping
    for r in v2:
        ids = r.get('entryTimeIds', [])
        pm = [i for i in ids if i.startswith('PMID:')]
        for i in pm:
            work.append((i[5:], r['author'], r['year'], r['journal'], r['ref'],
                         'entry-time(v2-source)'))
        if not pm:
            for i in ids:
                tomap.append((i, r['author'], r['year'], r['journal'], r['ref']))
    for e in M['backfill']:
        if e['status'] == 'backfilled' and not e.get('pmid') and e.get('doi'):
            tomap.append(('doi:' + e['doi'], e['author'], e['year'],
                          e.get('journalOnLine') or e.get('journal'), e['refs'][0]))
    # map PMC ids via elink (dbfrom=pmc) and dois via esearch [doi]; unmapped ids are
    # REPORTED, never silently skipped — Rachakonda's find lived in exactly this class
    unexamined = []
    for raw, a, y, j, ref in tomap:
        pmid = None
        try:
            if raw.startswith('PMC'):
                u = ('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pmc'
                     f'&db=pubmed&id={raw[3:]}&retmode=json')
                js = json.load(urllib.request.urlopen(u, timeout=25))
                ls = js.get('linksets', [{}])[0].get('linksetdbs', [{}])
                ids = ls[0].get('links', []) if ls else []
                pmid = str(ids[0]) if len(ids) == 1 else None
            elif raw.startswith('doi:'):
                u = ('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed'
                     f'&retmode=json&term={urllib.parse.quote(raw[4:])}%5Bdoi%5D')
                js = json.load(urllib.request.urlopen(u, timeout=25))
                ids = js['esearchresult'].get('idlist', [])
                pmid = ids[0] if len(ids) == 1 else None
            time.sleep(0.4)
        except Exception:
            pmid = None
        if pmid:
            kind = 'doi' if raw.startswith('doi:') else 'pmc'
            work.append((pmid, a, y, j, ref, f'{kind}-mapped'))
        else:
            unexamined.append((raw, ref))
    seen, uniq = set(), []
    for w in work:
        k = (w[0], w[4])
        if k in seen: continue
        seen.add(k); uniq.append(w)
    pmids = sorted({w[0] for w in uniq})
    print(f'{len(uniq)} identifier-carrying records ({len(pmids)} unique pmids)')
    if unexamined:
        print(f'UNEXAMINED (unmappable ids — not silent, listed): {len(unexamined)}')
        for raw, ref in unexamined: print(f'    {raw} {ref}')
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
    # The flags artefact went to a hardcoded scratch dir that no longer exists — the second way
    # this tool could die after doing all its work, and the same one polarity had. Overridable,
    # and it creates its own directory: a refusal that only moves the crash is not a fix.
    dest = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('-') else os.path.join(
        tempfile.gettempdir(), 'atlas-verify', 'cite', 'crosscheck_flags.json')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    json.dump([{'pmid': p, 'author': a, 'year': y, 'ref': r, 'origin': o, 'flags': fl}
               for p, a, y, r, o, fl in flagged],
              open(dest, 'w'), indent=1)
    print(f'  flags written: {dest}')
    # DONE line last, after every write (2026-09-05 sweep): the report of zero must be
    # shown to have been produced at all — absence-of-flags is never a pass.
    print(f'DONE citation_crosscheck: {len(uniq)} records checked, {len(flagged)} flags')

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
