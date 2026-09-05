# Citation extractor v2 (2026-09-04). v1 was the least-validated component in the pipeline —
# every downstream number inherited its unmeasured error rate. The n=30 hand audit measured
# it: author 24/30 (journal-name fragments + an author-order error), journal recall 44%,
# topics polluted by neighbouring entries, ref line systematically +1, identifiers on
# continuation lines never attached. v2 fixes each, by construction:
#
#   REF LINE     — records the line of the AUTHOR token (matches run over joined text with a
#                  char→line map; no window-end attribution).
#   JOURNAL      — the segment between the author block and the year is parsed as a journal
#                  candidate and validated structurally (capitalised words, no digits, ≤7
#                  words); multi-line journal names survive because matching runs on joined
#                  text.
#   AUTHOR ORDER — "Li, Kang & Tang, ..." yields Li (the list's FIRST surname), never the
#                  surname adjacent to the year.
#   FRAGMENTS    — "(J Gastroenterol, 2025" and friends are classified as journal-only
#                  mentions (authorless), not authors; a journal-word lexicon plus structure
#                  ("J "-prefix, "of"-containing titles) does the screening.
#   TOPICS       — harvested from the citation's OWN clause (its parenthetical, else the
#                  ±sentence), never a ±3-line window: gene-like tokens plus a curated
#                  oncology vocabulary. Consumers must match topics at WORD BOUNDARIES
#                  ('colon' must never match 'colonization' — the Arends retraction).
#   IDENTIFIERS  — PMID/PMC/doi inside the citation's clause attach to the record as
#                  entryTimeIds (the five continuation-line extraction misses).
#   POLARITY     — every record carries its citation_polarity window verdict, so no consumer
#                  can treat a citation-shaped string in a corrective window as a plain
#                  citation without seeing the flag.
#
# Usage: python3 .claude/extract_citations.py <out.json> [file ...defaults to js/organs/*.js]
import json, re, sys, glob, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from citation_polarity import classify_window, window_for

YEAR = r'(?:19|20)\d{2}'
# lowercase particles ride along ("von der Maase"); two-cap compounds too ("Mehrvarz Sarshekeh")
SURNAME = r"(?:(?:van|von|de|der|den|del|di|da)\s+)*[A-Z][A-Za-z'’’-]+(?:\s+[A-Z][A-Za-z'’’-]+)?"
JOURNAL_LEX = {'j','am','int','proc','natl','acad','sci','eur','engl','med','nat','ann','arch',
 'clin','oncol','pathol','urol','dermatol','gastroenterol','hepatol','endocrinol','radiol',
 'epidemiol','biol','chem','genet','res','rep','rev','dis','ther','invest','surg','cancer',
 'cancers','oncology','nature','science','cell','lancet','nejm','jama','bmj','plos','pnas',
 'jco','cureus','biomedicines','neoplasia','histopathology','gut','blood','virchows','acta',
 'world','journal','of','the','communications','insight','statpearls','seer','who',
 'oncotarget','front','frontiers','expert','seminars','current','trends','jci','radiother','radiotherapy'}

def looks_like_journal(seg):
    seg = seg.strip(' ,;:')
    if not seg or any(c.isdigit() for c in seg): return None
    words = seg.replace('&amp;', '&').split()
    if not (1 <= len(words) <= 7): return None
    lower_ok = {'of', 'the', 'in', 'and', '&', 'for'}
    caps = sum(1 for w in words if w[0].isupper() or w.lower() in lower_ok)
    if caps < len(words): return None
    if not (words[0][0].isupper() or words[0] == 'the'): return None
    return seg

def clause_of(text, pos):
    # innermost parenthetical containing pos, else the sentence around it
    depth = 0
    for i in range(pos, max(0, pos - 400), -1):
        if text[i] == ')': depth += 1
        elif text[i] == '(':
            if depth == 0:
                j = text.find(')', pos)
                return text[i + 1: j if 0 < j < pos + 400 else pos + 200]
            depth -= 1
    lo = max(text.rfind('. ', 0, pos), text.rfind('; ', 0, pos), 0)
    hi = text.find('. ', pos)
    return text[lo + 1: hi if 0 < hi < pos + 300 else pos + 200]

VOCAB = re.compile(r'\b(carcinom\w+|adenocarcinom\w+|melanom\w+|sarcom\w+|gliom\w+|glioblastom\w+'
 r'|lymphom\w+|leukem\w+|seminom\w+|metasta\w+|mutation\w*|amplificat\w+|fusion|deletion'
 r'|promoter|autopsy|cohort|incidence|prevalence|survival|prognos\w+|staging|grading|budding'
 r'|histolog\w+|pathol\w+|epitheli\w+|melanocyt\w+|panin|dysplasia|neoplasi\w+|polyp\w*'
 r'|prostat\w+|pancrea\w+|colorect\w+|colon(?:ic)?|gastric|hepat\w+|renal|bladder|breast'
 r'|thyroid|ovar\w+|testi\w+|lung|brain|skin|stomach|liver|kidney\w*)\b', re.I)
GENE = re.compile(r'\b[A-Z][A-Z0-9]{2,7}\b')
GENE_STOP = {'PMID', 'PMC', 'DOI', 'WHO', 'SEER', 'TCGA', 'NEJM', 'JCO', 'PNAS', 'MRI', 'III',
             'TNM', 'AJCC', 'IASLC', 'ATS', 'ERS', 'GEJ', 'HCC', 'CRC', 'PDAC', 'GBM', 'NOS',
             'DOM', 'CSS', 'RGB', 'GLB'}

def topics_of(clause):
    t = {m.group(0).lower() for m in VOCAB.finditer(clause)}
    t |= {g.lower() for g in GENE.findall(clause) if g not in GENE_STOP}
    return sorted(t)[:8]

ID_RE = re.compile(r'PMID[:\s]*(\d{7,8})|PMC(\d{6,8})|doi[:\s]*(10\.\d{4,}/[^\s,)\]\']+)', re.I)

# citation heads, tried in order; each yields (author|None, confidence, head_end_pos)
P_ETAL = re.compile(r'(' + SURNAME + r')\s+et\s+al\.?,?\s*', )
P_AMP = re.compile(r'(' + SURNAME + r')((?:,\s*' + SURNAME + r')*)\s*&(?:amp;)?\s*' + SURNAME + r'\s*(?:\(|,)\s*')
P_PAREN1 = re.compile(r'\((' + SURNAME + r'),\s+')

def extract(paths):
    records = []
    for path in paths:
        raw = open(path, encoding='utf-8').read().splitlines()
        # joined text with char->line map; strip comment prefixes so patterns span lines
        pieces, linemap, off = [], [], 0
        for n, line in enumerate(raw, 1):
            s = re.sub(r'^\s*//\s?', '', line) + ' '
            pieces.append(s); linemap.append((off, n)); off += len(s)
        text = ''.join(pieces)
        def line_at(p):
            lo = 0
            for start, n in linemap:
                if start > p: break
                lo = n
            return lo
        for ym in re.finditer(r'\b(' + YEAR + r')\b', text):
            year, ypos = ym.group(1), ym.start()
            back = text[max(0, ypos - 130):ypos]
            # collect the LAST match of every head pattern; the head NEAREST the year wins
            # (an "et al." farther back must not shadow a nearer "&"-list — the Skok/Santucci
            # validation failure)
            cands = []
            for pat, kind in ((P_ETAL, 'etal'), (P_AMP, 'amp-list'), (P_PAREN1, 'single-paren')):
                m = None
                for mm in pat.finditer(back): m = mm
                if m: cands.append((m, kind))
            cands.sort(key=lambda c: -c[0].end())
            # nearest head to the year wins, but a lexicon-rejected head FALLS BACK to the
            # next-nearest instead of skipping the citation — "(JCI Insight, 2022" must not
            # shadow the true "Fontugne et al." head just because it sits closer to the year
            m = conf = None
            for cm, kind in cands:
                if cm.group(1).split()[0].lower() in JOURNAL_LEX: continue
                m, conf = cm, kind; break
            if not m:
                continue
            author, head_end = m.group(1), m.end()
            if ';' in back[head_end:]:
                # a ';' between head and year means the head belongs to a PREVIOUS citation
                # and this year's own mention is authorless (journal-only): "Ziol et al.,
                # Hepatology, 2018; Acad Pathol, 2024 (PMID x)" must not yield Ziol|2024
                continue
            between = back[head_end:].strip()
            # trim a leading "(" and trailing separators before the year
            between = between.strip('(').strip()
            journal = looks_like_journal(between.rstrip(' ,')) if between else None
            apos = max(0, ypos - 130) + (m.start(1) if m else 0)
            clause = clause_of(text, ypos)
            # ids must sit within 80 chars AFTER the citation's own year: every entry-time id
            # in this codebase follows its year immediately ("2003 (PMID x)", "2021 update,
            # PMID x, PMC y"), while a neighbouring mention's id sits 90+ chars out — the
            # Ziol/Cyrta/Fichtner/Shen over-reach flags were all foreign ids captured across
            # citation boundaries (';', '. NextAuthor et al.')
            # an id belongs to this citation only if it sits in the SAME parenthetical as the
            # year, or in one opening immediately after the year ("2003 (PMID x)") — foreign
            # ids from adjacent mentions live outside that paren (Segura/Mehra at 35 chars)
            nxt_close = text.find(')', ypos); nxt_open = text.find('(', ypos)
            if nxt_close != -1 and (nxt_open == -1 or nxt_close < nxt_open):
                idseg = text[ypos:nxt_close]                       # year inside a paren
            elif nxt_open != -1 and nxt_open <= ypos + 6:
                c2 = text.find(')', nxt_open)
                idseg = text[nxt_open:c2 if c2 != -1 else nxt_open + 60]   # "year (PMID x)"
            else:
                idseg = text[ypos:ypos + 60].split(';')[0].split('(')[0]
            ids = ['PMID:' + a if a else ('PMC' + b if b else 'doi:' + c)
                   for a, b, c in ID_RE.findall(idseg)]
            ln = line_at(apos)
            win_status, win_hits = classify_window(window_for(path, ln))
            records.append({'file': path, 'line': ln, 'ref': f'{path}:{ln}',
                            'author': author, 'authorConfidence': conf, 'year': year,
                            'journal': journal, 'topics': topics_of(clause),
                            'clause': clause.strip()[:140], 'entryTimeIds': ids,
                            'window': win_status})
    # dedupe identical (author, year, ref)
    seen, out = set(), []
    for r in records:
        k = (r['author'], r['year'], r['ref'])
        if k in seen: continue
        seen.add(k); out.append(r)
    return out

if __name__ == '__main__':
    outp = sys.argv[1]
    paths = sys.argv[2:] or sorted(glob.glob('js/organs/*.js'))
    recs = extract(paths)
    json.dump(recs, open(outp, 'w'), indent=1)
    from collections import Counter
    print(f'v2: {len(recs)} records from {len(paths)} files')
    print('  authorConfidence:', dict(Counter(r["authorConfidence"] for r in recs)))
    print('  journal present: ', sum(1 for r in recs if r['journal']))
    print('  entry-time ids:  ', sum(1 for r in recs if r['entryTimeIds']))
    print('  flagged windows: ', sum(1 for r in recs if r['window'] != 'clean'))
