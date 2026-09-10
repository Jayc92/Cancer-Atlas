# Duplicate-figure consistency check (2026-09-04). Companion to share_sum_check.py in the
# source-free detector family: the census found the atlas DOES duplicate figures — 15 genuine
# same-claim pairs (same figure, same claim, two on-screen locations; e.g. "part of 57.4% of
# GBM with an EGFR alteration" verbatim at brain:200 and brain:202) — and every copy agrees
# today. Transcription drift between copies is exactly the defect that survives every other
# check (each copy individually cites correctly; only their DISAGREEMENT is detectable, and
# it is detectable with no source access at all).
#
# DESIGN NOTE, load-bearing: a drifted pair cannot be found by matching figures (the numbers
# differ by definition). So the tool keys on CONTEXT: for every pair of figure-bearing
# on-screen strings in the same organ file, find their longest shared word-window (numbers
# masked); if a shared window of >= WINDOW words exists, the numeric tokens inside the two
# windows must agree. Same contract as every detector here: the tool FLAGS, the human rules.
#
# CONDITION (7) AT BIRTH: fixtures prove it FIRES on a synthetic drifted pair (the EGFR
# window with 57.4% vs 55%) and PASSES a real agreeing pair captured from the census.
# Condition (8): first live run is calibration.
import re, sys, glob, html
import os as _os_t; sys.path.insert(0, _os_t.path.dirname(_os_t.path.abspath(__file__)))
from tolerated import resolve
# THE FOUR DRIFT FLAGS, READ (2026-09-10; see tolerated.py). They printed as '4 drift flags' on every run and were the
# KNOWN RESIDUAL FP CLASS named at calibration below ('the human read rules these out') — an instruction with no record
# of the read. The read: every pair is two DIFFERENT quantities on one shared template, not one quantity drifted.
# Keys carry the paired figures, so a figure that changes makes a NEW, undeclared key and gets read again.
DECLARED = [
    {'key': 'pancreas|CDKN2A (p16) loss|1997|1998', 'reason': 'false positive: the years of two different papers on one journal template — Schutte et al., Cancer Res, 1997 (pathway-level loss) and Wilentz et al., Cancer Res, 1998 (PanIN-1A p16 loss); the matcher reads a year as a figure', 'until': None},
    {'key': 'skin|CDKN2A loss|49%, 44%|29%, 27%', 'reason': 'false positive: per-site involvement figures on the shared Riihimaki 2018 template — brain 49%/44% (men/women) at one site, liver 29%/27% at the other; the subject is the site, not the gene', 'until': None},
    {'key': 'stomach|RHOA mutation|0.3|0.4', 'reason': 'false positive: per-site odds ratios from one study (Riihimaki 2016) — signet-ring under-use of the liver (OR 0.3) at one site and of the lungs (OR 0.4) at the other', 'until': None},
    {'key': 'stomach|CLDN18–ARHGAP fusion|32%|12%', 'reason': 'false positive: per-site involvement shares on the template "of metastatic gastric-cancer patients" — peritoneum 32% at one site, bone 12% at the other', 'until': None},
]
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it passed GREEN over an EMPTY corpus (0 pairs compared). Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from itertools import combinations

WINDOW = 5
NUM = re.compile(r'\d+(?:[.,]\d+)*%?')
FIELDS = re.compile(r"(?:share|ccf|note|text|val|sub|intro):'((?:[^'\\]|\\.)*)'")

def tokens(t):
    t = html.unescape(t.replace('&ndash;', '–').replace('&mdash;', '—'))
    return re.findall(r"[A-Za-z][A-Za-z'’/-]*|\d+(?:[.,]\d+)*%?", t)

def masked(toks):
    return ['#' if NUM.fullmatch(w) else w.lower() for w in toks]

def shared_windows(a, b):
    """Yield (i, j, length) of maximal shared masked-word windows >= WINDOW."""
    ma, mb = masked(a), masked(b)
    hits = []
    for i in range(len(ma)):
        for j in range(len(mb)):
            if ma[i] != mb[j]: continue
            k = 0
            while i + k < len(ma) and j + k < len(mb) and ma[i + k] == mb[j + k]:
                k += 1
            if k >= WINDOW and any(w == '#' for w in ma[i:i + k]):
                hits.append((i, j, k))
    # keep maximal, non-contained windows
    out = []
    for h in sorted(hits, key=lambda x: -x[2]):
        if not any(o[0] <= h[0] and h[0] + h[2] <= o[0] + o[2] for o in out):
            out.append(h)
    return out

def check_pair(a, b):
    """Return list of (windowText, numsA, numsB) where shared windows disagree on numbers."""
    ta, tb = tokens(a), tokens(b)
    flags = []
    for i, j, k in shared_windows(ta, tb):
        na = [w for w in ta[i:i + k] if NUM.fullmatch(w)]
        nb = [w for w in tb[j:j + k] if NUM.fullmatch(w)]
        if na != nb:
            flags.append((' '.join(ta[i:i + k])[:90], na, nb))
    return flags

FIX_AGREE_A = "part of 57.4% of GBM with an EGFR alteration overall — mutation and/or amplification combined"
FIX_AGREE_B = "part of 57.4% of GBM with an EGFR alteration overall (the same denominator as the enhancing core)"
FIX_DRIFT_B = "part of 55% of GBM with an EGFR alteration overall (the same denominator as the enhancing core)"

def selftest():
    ok = True
    fired = check_pair(FIX_AGREE_A, FIX_DRIFT_B)
    good = bool(fired); ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} fires on synthetic drift: {fired[:1]}")
    quiet = check_pair(FIX_AGREE_A, FIX_AGREE_B)
    good = not quiet; ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} silent on agreeing pair: {quiet[:1] or 'clean'}")
    print('SELFTEST', 'PASS — fires on drift, silent on agreement' if ok
          else 'FAIL — do not trust the scan')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    # SUBJECT-AWARENESS (condition-(8) calibration fix, first live run): the raw scan
    # produced 166 flags, dominated by TEMPLATE COLLISIONS — thyroid's GENIE rows share
    # "X% of follicular carcinomas (N/168, GENIE)" across DIFFERENT genes, and the
    # discriminating token (the gene name) lives in the gene:' field outside the compared
    # string. Two strings are same-claim candidates only if (a) their gene labels match,
    # (b) the shared window itself contains a gene-like token, or (c) for label-less
    # strings, the window contains a rare word (file-wide frequency <= 4) — which keeps
    # true duplicates like liver's hepatocyte-mass pair while killing template reuse.
    GENEISH = re.compile(r'\b[A-Z][A-Z0-9]{2,7}\b')
    SRC_STOP = {'TCGA', 'GENIE', 'SEER', 'WHO', 'PMID', 'PMC', 'KGCA', 'NCI', 'PDQ'}
    print()
    total_pairs = flagged = 0
    drift_flags = {}   # organ|gene|figures A|figures B (content, not line numbers) → detail; resolved against DECLARED
    corpus = sorted(glob.glob('js/organs/*.js'))
    if not corpus:   # a glob that resolved to nothing is a VACUOUS PASS — the dangerous form (sweep, 2026-09-09)
        print('duplicate_figure_check: REFUSING TO REPORT — the corpus glob resolved to nothing'); sys.exit(3)
    for f in corpus:
        src = open(f, encoding='utf-8').read()
        strings = []
        for m in FIELDS.finditer(src):
            t = m.group(1)
            if not (NUM.search(t) and '%' in t): continue
            head = src[max(0, m.start() - 300):m.start()]
            gm = None
            # subject = the row's gene OR name label, whichever is nearest (share rows are
            # discriminated by name:, tumor-map rows by gene: — the thyroid share family's
            # sibling rows became template-identical once the SEER-9 qualifier was added,
            # so label-blind comparison flags a family against itself)
            for gg in re.finditer(r"(?:gene|name):'((?:[^'\\]|\\.)*)'", head): gm = gg
            gene = gm.group(1)[:40] if gm else None
            strings.append((src[:m.start()].count('\n') + 1, t, gene))
        freq = {}
        for _, t, _ in strings:
            for w in set(masked(tokens(t))):
                freq[w] = freq.get(w, 0) + 1
        for (l1, s1, g1), (l2, s2, g2) in combinations(strings, 2):
            total_pairs += 1
            for win, na, nb in check_pair(s1, s2):
                wtok = win.split()
                subject_in_window = any(GENEISH.fullmatch(w) and w not in SRC_STOP
                                        for w in wtok)
                rare_in_window = any(freq.get(w.lower(), 99) <= 4 for w in wtok
                                     if not NUM.fullmatch(w))
                same_gene = g1 is not None and g1 == g2
                diff_label = g1 is not None and g2 is not None and g1 != g2
                # different labels = different subjects, unconditionally: family denominators
                # ("the BRAF subtype") are shared templates, not shared claims. KNOWN RESIDUAL
                # FP CLASS (calibration, 2026-09-04): same-gene rows at different SITES carry
                # per-site involvement figures on a shared template ("X% of metastatic
                # gastric-cancer patients") — the figure's subject is the site, not the gene;
                # the human read rules these out. Zero real drift found at calibration.
                if diff_label:
                    continue
                if not (same_gene or subject_in_window
                        or (g1 is None and g2 is None and rare_in_window)):
                    continue
                flagged += 1
                print(f'  DRIFT? {f.split("/")[-1][:-3]}:{l1} vs :{l2}  (gene A={g1!r} B={g2!r})')
                drift_flags[f'{f.split("/")[-1][:-3]}|{g1}|{", ".join(na)}|{", ".join(nb)}'] = f'{f.split("/")[-1][:-3]}:{l1} vs :{l2} A={na} B={nb}'
                print(f'     window: {win}')
                print(f'     A={na}  B={nb}')
    problems = resolve('duplicate_figure_check', drift_flags, DECLARED)
    print(f'\nDONE duplicate_figure_check: {total_pairs} same-file string pairs compared, '
          f'{flagged} drift flags, {len(problems)} tolerated-count problems')
    if problems:
        sys.exit(1)
