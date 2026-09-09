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
# citation_polarity.py died of (user ruling, recorded in CLAUDE.md):
#
#     QUOTES CLAUDE.md
#     > A dead instrument announces itself. A degraded one produces a plausible number.
#
# The v2 records artifact used to be OPTIONAL — `if len(sys.argv) > 1
# else []` — so invoking this tool with no argument silently dropped the entire entry-time-
# identifier population and checked 110 records instead of 142, under a DONE line whose shape was
# indistinguishable from a full scan. Polarity died loudly (KeyError, no DONE line, wrapper exit
# non-zero, caught the same day). This one would have kept reporting "110 records checked, 3
# flags" forever. So the artifact is now REQUIRED and its absence is a refusal, not a default:
# 32 unexamined records is a finding, and a finding must never be spelled as a smaller total.
# battery.py regenerates the artifact before invoking this tool, so the refusal never fires in
# normal use — it fires exactly when someone runs the scan by hand without one.
#
# THE SAME BUG, ONE LEVEL IN (2026-09-06). The refusal above closed the case where the artifact is
# ABSENT. It did not close the case where an id-mapping FETCH FAILS: `except Exception: pmid = None`
# put a transient network failure and a genuinely unmappable id into one `unexamined` bucket, so a
# blip subtracted a record from `len(uniq)` and the DONE line reported the smaller total as normal.
# RECORDED INSTANCE, not a reproducible demonstration: on 2026-09-06 a battery run printed "141
# records checked" against the committed 142, `0 problems`, green. Three standalone re-runs on the
# same artifact gave 142, which is how the transient cause was identified — a network failure cannot
# be summoned on demand, so this comment is the evidence, and it is better evidence than a fixture
# because the shrink actually happened. battery.py's own header had named this metric as still
# unratcheted and able to shrink under a green DONE line; it did, one day later, unprompted.
#
# THE SPLIT, and it is the whole fix: UNREACHED (a fetch that did not happen) is FATAL, because the
# population is unknown and any total printed would be the exact defect being closed. UNMAPPABLE (a
# fetch that succeeded and found no unique PMID) is a stable property of the record, so it is
# DECLARED AND TOLERATED by exact id, on the deploy gate's honesty-surface shape. A NEW unmappable
# id therefore fails too — correctly: it is an undeclared change in what this scan can reach.
# Without the split, exiting on anything unexamined would make the instrument permanently red on
# the one record that can never be mapped, which is a gate nobody can keep green and everybody
# learns to ignore.
#
# THEN IT FIRED FOR REAL, ON ITS FIRST OPPORTUNITY, ON THE SAME FAILURE IT WAS BUILT FOR — and this
# is the live demonstration, recorded on the user's ruling (2026-09-06) as the best evidence in the
# whole arc:
#
#     "A live DNS failure then hit mid-run and the instrument refused to print a total rather than
#      reporting a smaller one — unprompted, on its first opportunity, a day after it was written
#      for a failure recorded from the past. That's better evidence than the fixture and better than
#      the recording... the one case in this whole arc where a guard was built for a specific past
#      failure and then caught the same failure again in the wild."
#
# WHAT IS CHECKABLE, and it is the interval rather than the output: the split shipped in aafbe04
# (2026-09-05 22:57 -0400, `git log -1 aafbe04`). Its first live exercise was the full battery run
# on the way to d54bd1a (2026-09-06 22:14 -0400) — 23 hours later, and the FIRST run since aafbe04
# in which the network happened to break. Every id-mapping fetch failed with urllib's
# `nodename nor servname provided, or not known`, so every record took the UNREACHED branch below,
# this tool exited non-zero WITHOUT a total, and battery.py reported 1 problem and 9/10 members
# rather than a green line over a smaller number. The transient was then confirmed independently
# (ping, and a curl to the same host returning HTTP 200) and the immediate re-run printed
# "143 records checked, 3 flags, 1 declared-unmappable" with 10/10 and 0 problems — which is the
# same artifact reaching the same total, i.e. the corpus never moved and the earlier run's silence
# was correct.
#
# WHAT IS NOT CHECKABLE, said plainly because the rule above demands it: THE REFUSING RUN'S OUTPUT
# WAS NOT KEPT. The paragraph above it records a shrink from a run that was also not kept, and this
# one was nearly lost the same way. That is not incidental — it is an asymmetry in the chain worth
# naming and NOT worth a fifth layer: commit_checked.sh quotes every DONE line into the commit
# message, so the chain archives its PASSES in git permanently and forgets its REFUSALS entirely,
# because a refusing run never reaches a commit. The best evidence this project has produced about
# its own instruments is the class of evidence it stores least well.
import json, os, re, sys, tempfile, time, unicodedata, urllib.parse, urllib.request
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it produced no DONE line (citations.json is opened repo-relative). Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# DECLARED UNMAPPABLE, exhaustively and by exact id — deploy_check.js's BENIGN list, same shape and
# same reason: every entry is a thing this gate has been told not to see, so the list stays short and
# each entry carries WHY. An id here is a COVERAGE LIMIT of this instrument, which is a narrower
# statement than "unchecked", and conflating the two is how a coverage hole starts reading as a pass.
# A DECLARATION NAMES CHECKABLE EVIDENCE, NOT A JUDGEMENT — the rule binding every declaration list
# in this chain, stated in full (with the audit that found this entry passing it) at
# citation_reach_check.DECLARED_UNREACHED. The esearch hit counts below are why: they can be re-run.
DECLARED_UNMAPPABLE = {
    'doi:10.1002/prm2.12107':
        'Gao et al., Precision Medical Sciences (Wiley), 2023 — js/organs/breast.js:147. The journal '
        'is not PubMed-indexed: esearch [doi] returns 0 hits (the unqualified search returns 6 '
        'unrelated tokenised hits, which is why the mapper requires exactly one), and Europe PMC has '
        'no record either, so NO PMID EXISTS for the metadata cross-check to run against. The CLAIM '
        'is not unchecked — ccf batch 1 (2026-09-06) read the paper at the publisher and verified '
        'its figures verbatim. THIS INSTRUMENT cannot reach it. Those are different statements and '
        'keeping them apart is why this list stores a reason rather than just an id.',
}

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

def classify_unmapped(entries, declared=None):
    """Pure, so condition (7) can prove every direction without a network.

    entries: (raw_id, ref, failure) — failure is a string when the FETCH itself failed, None when
    the fetch succeeded and simply found no unique PMID. Returns (tolerated, problems)."""
    declared = DECLARED_UNMAPPABLE if declared is None else declared
    tolerated, problems = [], []
    for raw, ref, failure in entries:
        if failure:
            problems.append(
                f'UNREACHED: {raw} ({ref}) — the id-mapping fetch FAILED [{failure}], so this '
                'record was never examined and the population is unknown. This is NOT an unmappable '
                'id: refusing to print a total, because a smaller total is exactly the defect.')
        elif raw in declared:
            tolerated.append((raw, ref, declared[raw]))
        else:
            problems.append(
                f'UNMAPPABLE, UNDECLARED: {raw} ({ref}) — the fetch succeeded and found no unique '
                'PMID. That may be permanent and fine, but it is an undeclared change in what this '
                'scan can reach. Verify it is genuinely unmappable, then add it to '
                'DECLARED_UNMAPPABLE with the reason, so the list stays the honesty surface.')
    return tolerated, problems


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

# A FIXTURE MAY REUSE A REAL POINTER; IT MUST NEVER INVENT ONE. pointer_check.py asserts that every
# hand-typed <file>:<line> in this repo names a real place, so an invented one is a false claim that
# cannot be told apart from a live pointer — and it fired here, on three of these. Reusing a real
# pointer is harmless (a fixture makes the same true claim the live pointer does); inventing one is
# the defect. So the refs below are COMPOSED, and no literal pointer appears in this file's fixtures.
# internal_quote_check.py holds its marker token in a name for exactly this reason.
FIXTURE_REF_A = '%s:%d' % ('a.js', 1)
FIXTURE_REF_B = '%s:%d' % ('b.js', 2)
FIXTURE_REF_C = '%s:%d' % ('c.js', 3)

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
    # THE 2026-09-06 SPLIT, all four directions. The load-bearing arm is the first: a fetch failure
    # must be fatal, because that is the shrink that actually happened and printed a green line.
    fake = {'doi:declared': 'declared for the selftest'}
    _t, probs = classify_unmapped([('PMC123', FIXTURE_REF_A, 'URLError: timed out')], fake)
    good = any('UNREACHED' in p for p in probs)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a FAILED fetch is fatal (the 142->141 shrink), not "
          f"filed as an unmappable id")
    _t, probs = classify_unmapped([('doi:brand-new', FIXTURE_REF_B, None)], fake)
    good = any('UNDECLARED' in p for p in probs)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a NEW unmappable id fails (undeclared change in reach)")
    tol, probs = classify_unmapped([('doi:declared', FIXTURE_REF_C, None)], fake)
    good = not probs and len(tol) == 1
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a DECLARED unmappable id is tolerated, so the gate is "
          f"not permanently red on the one record that can never map")
    good = all(isinstance(v, str) and len(v) > 80 for v in DECLARED_UNMAPPABLE.values())
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} every declared entry carries a reason "
          f"({len(DECLARED_UNMAPPABLE)} declared) — a bare id list would hide a coverage hole")
    print('SELFTEST', 'PASS — can fire on all three fields, can pass, refuses without input, and '
          'separates an unreached fetch from an unmappable id'
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
    unmapped = []   # (raw, ref, failure or None) — the failure field is the 2026-09-06 split
    for raw, a, y, j, ref in tomap:
        pmid, failure = None, None
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
        except Exception as exc:
            # The old code wrote `pmid = None` here and lost the distinction. A fetch that did not
            # happen tells you nothing about the record; recording WHY is what makes it separable.
            pmid, failure = None, f'{type(exc).__name__}: {exc}'
        if pmid:
            kind = 'doi' if raw.startswith('doi:') else 'pmc'
            work.append((pmid, a, y, j, ref, f'{kind}-mapped'))
        else:
            unmapped.append((raw, ref, failure))
    tolerated, reach_problems = classify_unmapped(unmapped)
    for raw, ref, why in tolerated:
        print(f'DECLARED-UNMAPPABLE (tolerated, coverage limit): {raw} {ref}\n    {why}')
    if reach_problems:
        # ABORT BEFORE THE esummary PASS AND BEFORE ANY DONE LINE, the refusal's shape one level in:
        # len(uniq) is not the population, so there is no number here worth printing. Uniform across
        # both problem classes on purpose — "the total is untrustworthy" is one fact, and a rule with
        # two branches is a rule that gets the branches wrong.
        for problem in reach_problems:
            print(f'  {problem}', file=sys.stderr)
        print('citation_crosscheck: REFUSING TO REPORT — the identifier population was not fully '
              f'reached ({len(reach_problems)} problem(s) above). No DONE line, exit 4, so '
              'run_checked.sh fails the invocation and the battery fails with it. Re-run: a '
              'transient failure passes on the next attempt, and a real one keeps failing.',
              file=sys.stderr)
        sys.exit(4)
    seen, uniq = set(), []
    for w in work:
        k = (w[0], w[4])
        if k in seen: continue
        seen.add(k); uniq.append(w)
    pmids = sorted({w[0] for w in uniq})
    print(f'{len(uniq)} identifier-carrying records ({len(pmids)} unique pmids), '
          f'{len(tolerated)} declared-unmappable')
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
    # THE SIDECAR (2026-09-06) — the convention's FIRST PRODUCER, so this is where it got finalised.
    # Machine-readable metrics beside the human DONE line, so the ratchet reads STRUCTURE instead of
    # parsing a sentence. One addition to the recorded shape, forced by this instrument's own
    # metrics: `ratchet` names WHICH metrics may only grow. `records` is COVERAGE and must never
    # shrink; `flags` is a DEFECT COUNT and ratcheting it would fail the battery for fixing a flag,
    # turning a quality gate into a reason not to fix things. Only the producer knows which of its
    # numbers is which, so the producer declares it — and battery.py closes the obvious loophole by
    # refusing to let a metric that has ALREADY been ratcheted quietly disappear from this list.
    # Printed BEFORE the DONE line: "DONE last" stays literal, and SIDECAR carries no "DONE" so
    # commit_checked.sh's grep keeps commit messages human-readable.
    print('SIDECAR ' + json.dumps({
        'name': 'citation_crosscheck',
        'metrics': {'records': len(uniq), 'flags': len(flagged),
                    'declared_unmappable': len(tolerated)},
        'ratchet': ['records'],
    }, sort_keys=True))
    # DONE line last, after every write (2026-09-05 sweep): the report of zero must be
    # shown to have been produced at all — absence-of-flags is never a pass.
    print(f'DONE citation_crosscheck: {len(uniq)} records checked, {len(flagged)} flags, '
          f'{len(tolerated)} declared-unmappable')

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
