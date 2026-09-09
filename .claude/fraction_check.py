# Fraction/percentage agreement check (2026-09-05). Third source-free detector: many
# on-screen strings state the same claim TWICE — a percentage and its underlying fraction
# ("~92% ... (48,789/53,142": 48,789/53,142 = 91.8%). Nothing verified that the two halves
# agree, and THE REMEDIATION HAS BEEN ADDING THEM: the bladder edit introduced
# "48,789/53,142" beside an existing "~92%", the testis edit introduced "22,634/35,066" —
# fresh disagreement opportunities created by the same process that finds the defects, with
# no check behind it. Same shape as the Paly edit spawning a shadowing case: the repair
# introduces the risk. Distinct from share_sum_check (siblings across a family); this
# compares two representations of ONE claim inside ONE string.
#
# DESIGN CARE IS IN THE TOLERANCE (user ruling), the way share-sum's was in the exempt
# labels: "~92%" from 91.8% must pass; a range like "70–79%" needs both endpoints matched
# against their two fractions (Allory's 78/111 = 70.3 and 283/357 = 79.3); a rounded figure
# gets tolerance from its own stated precision, never exact equality. Outside tolerance is
# a free find with zero source access.
#
# WEAKER SIBLING included: strings carrying TWO DISTINCT YEAR RANGES (the anaplastic row's
# 1974–2013 cases / 1994–2013 deaths proved the class) are listed for a human
# confirms-deliberate read — tiny population, no verdict automated.
#
# Condition (7) at birth: fires on a synthetic mismatch, passes the real ~92/91.8 and
# range/endpoint cases. Condition (8): first live run is calibration. The tool FLAGS; the
# human rules.
#
# TWO DOCUMENTED BLIND SPOTS (2026-09-06, user ruling — the first known defect class this
# tool STRUCTURALLY CANNOT SEE, recorded here and not only in the batch log, because a
# blind spot known only to a log is not known to the next person who trusts a clean run).
# Found when the batch-3 read caught `bladder.js` carrying Allory's independent-cohort
# numerator as 282/357 where the source says "283 of 357". Note line 13 above: THIS HEADER
# HAS CARRIED THE CORRECT 283/357 THE WHOLE TIME — the instrument's own documentation held
# the right number while the corpus held the wrong one, and the instrument still could not
# catch it. Both blind spots were proven by running check_string, not reasoned about:
#   (1) ROUNDING COLLISION. 282/357 = 78.99% and 283/357 = 79.27% BOTH round to "79%", so
#       "79% (282/357)" passes on the same tolerance that makes "~92%" for 91.8% legal. A
#       wrong numerator that survives its own rounding is invisible BY CONSTRUCTION — this
#       is the tolerance of line 11 working exactly as ruled, and the cost of that ruling.
#       Tightening the tolerance would not fix it and would break the ~92% case; the honest
#       statement is that percentage/fraction agreement cannot verify a numerator, only
#       detect gross disagreement. 250/357 does fire, so the check is live, not dead.
#   (2) SCAN SURFACE. FIELDS matches quoted field literals only (share|ccf|note|text|...).
#       A fraction inside a `//` comment is never examined, and `bladder.js`'s was a comment
#       — so this instance was not a near-miss on tolerance, it was never a candidate. The
#       corpus's COMMENTS are part of the record (batch 3's finding: hedged user-facing
#       prose stays clean while the provenance comment beneath it drifts), so the scan
#       surface is narrower than the surface that carries defects. Extending FIELDS to
#       comments is deliberately NOT done here: it is a real change in reach, and per
#       aafbe04's rule a change in reach must be declared and measured, not slipped in.
#
# THE CROSS-HALF SURFACE (2026-09-08, user ruling: "A figure appearing in both a record and its
# provenance comment must match"). ORDERED AS A PAIRING CHECK, SHIPPED AS A CLOSURE GUARD, and the
# difference is a measurement rather than a preference. The ruling's property is real and this file
# now enforces it — but not by comparing the two halves, because comparing them is either noise or
# duplication, and which one it is depends on a fact about this corpus's SHAPE that neither the
# ruling nor blind spot (2) above had in view:
#   NO RECORD IN THIS CORPUS HAS A COMMENT OF ITS OWN. Measured, not assumed: 0 of 143 `gene:'`
#   lines is directly preceded by a `//` line. Records sit packed inside their array, so the only
#   block ccf_load.attached() can reach for one is the block above the array's OPENER — which is
#   SHARED with every sibling. "A record and its provenance comment" is therefore one-to-MANY here,
#   and any pairing not anchored by an identical figure fans one comment number out across every
#   record in the array.
#   WHAT THE FAN-OUT COSTS, MEASURED BEFORE BUILDING RATHER THAN AFTER. Two anchors were tried on
#   the live corpus. SHARED DENOMINATOR (same cohort size both halves, numerators differ): 4
#   candidates, 4 FALSE. A denominator names a COHORT, and a cohort is shared by design — the
#   record at thyroid.js:257 carrying 57/168 against its comment's 12/168 and 13/168 is this file's
#   own thyroid.js:247 sibling-bracket fixture one level up. SOLE COMMENT FRACTION against the
#   record's percentage: 13 candidates, 12 FALSE, with the fan-out legible in the arithmetic — 25/84
#   reaches three pancreas records, 63/77 four skin records, 52/402 two thyroid ones, and stomach's
#   "54/32" is not a fraction at all but the Lauren 54/32/15 citation string. Both anchors fail in
#   the exact direction the same ruling forbids: noise proportional to how much provenance an array
#   documents.
#   AND THE ORDERED COMPARISON IS ALREADY ENFORCED, BY COMPOSITION. Where the identical fraction
#   DOES appear in both halves — 8 records, the only attachment-free identity available — the field
#   surface already compares it against the record's percentage and the comment surface against the
#   comment's, so the two percentages agree THROUGH the fraction with no third comparison. Adding
#   one would report a defect neither half's own check recognises, and the only disagreement it
#   could still find is stacked tolerance: a constant tuned until the corpus went quiet, which the
#   paren-scope block below rejects by name.
# SO WHAT SHIPS IS THE PREMISE, NOT THE COMPARISON. That closure holds only where the record half
# actually PAIRS the fraction with a percentage, and the field surface pairs per LITERAL: a fraction
# in `ccf:` and a percentage in `note:` are two strings, never compared, while the comment compares
# its own copy and passes. cross_half() reports that state — a fraction in both halves that no
# single record literal pairs with a percentage, where the comment does. It is the one shape the
# composition argument does not cover, it needs no heuristic (identity is the literal digits, so
# more provenance adds no candidates), and it is where blind spot (2) would recur. Live: 8 shared
# fractions, 0 unpaired — a defect count resting at zero over a non-empty candidate set.
# DECLINED AT THIS LINE, NOT HELD AS A SHAPE (user ruling, same message). The SEMANTIC halves stay
# unbuilt: scope disagreement and hedge disagreement need semantics, and on a corpus where every
# comment exists to discuss its record a heuristic would produce noise proportional to how
# well-documented a record is. "Punishing thoroughness is the wrong failure direction" — and the two
# arithmetic anchors measured above are that same failure arriving through arithmetic instead.
# THIS DOES NOT REACH BLADDER, AND A GREEN RUN IS NOT COVERAGE. bladder.js's defect was a SCOPE
# contradiction — the note argued stage-independence while the comment described a stage-restricted
# cohort — and NO FIGURE DISAGREED, so nothing numeric could have caught it. The numeric half is a
# real but PARTIAL closure of the comment-contradicts-its-record class, said here so that a clean
# run is not read as the class being closed.
# NO VACUITY GUARD ON THIS SURFACE, unlike the two below, and the asymmetry is measured rather than
# stylistic: the field and comment surfaces cannot legitimately reach zero, but 8 shared fractions
# across 5 files can — a re-sourcing that removes one duplicated fraction empties it correctly. The
# candidate count is printed in the DONE line instead, so a zero stays VISIBLE without being fatal.
#
# THE POPULATION IS PARTLY A FUNCTION OF HOW CLAIMS ARE WRITTEN (2026-09-08, user ruling) — the thing
# a reader of this file's reach needs to know that the DONE line's candidate count does not say. The
# count of field strings with fraction+percent is not a property of the corpus's CLAIMS; it is a
# property of their FORM. A bare percentage is invisible to this instrument and to every other guard
# in the chain; a percentage with its fraction beside it is arithmetic that holds itself.
#   THE CASE. thyroid.js's NRAS branch note carried the GENIE metastatic rate as 42.4%, copied
#   FAITHFULLY from its source — and the source was wrong. Hsia et al. (J Pers Med 2025, PMC12843263)
#   print 42.4% in the abstract, "27 NRAS mutations (42.2%) among 64 samples" in the Results and 42.2%
#   in the Discussion; 27/64 = 42.19%, and 42.4% matches no count in the paper. Verbatim verification
#   PASSES on that line, because "42.4% appears in the abstract" is true, so the defect was findable
#   only by checking the paper against itself. A NEW CLASS: the atlas accurate to its source and the
#   source wrong, where every prior class was divergence from a correct source. The method half — the
#   second worked example of a limit on the method, beside the bladder demonstration — is in CLAUDE.md.
#   THE FORM RULE, the remedy generalised (user): WHEREVER THE SOURCE GIVES BOTH A COUNT AND A
#   PERCENTAGE, CARRY BOTH, in the same parenthetical, which is the form this file pairs. No instrument,
#   no declaration, no ratchet — a way of writing that puts existing machinery onto claims it currently
#   cannot see, and it would have caught this one AT AUTHORING TIME, since 27/64 and 42.4% do not agree.
#   The hazard named at this instrument's birth — remediation adding fractions beside percentages with
#   no check behind them — is what this instrument closed; with the check in place, the same act is the
#   mechanism. The fixed line reads "(27/64, 42.2%) than primaries (26/89, 29.2%)" and the candidate
#   count rose by exactly one with it, at 80f74fc.
#   THE INVERSION IS ITS OWN CLASS (user ruling, 2026-09-08): a caution that becomes a recommendation
#   once its guard exists — the sign-flipped twin of a restriction that outlived its cause. Same remedy,
#   check whether the reason still holds; worse failure, because a discouraged good practice is an
#   absence nobody sees. CLAUDE.md records both signs together; the trigger to look for this sign is a
#   guard landing.
#   TWO LIMITS STAY WHAT THEY WERE. Blind spot (1): a fraction still cannot verify its own numerator
#   past rounding. And a source wrong in BOTH its count and its percentage, in agreement with each
#   other, is out of reach of any self-check — that case needs a second source, not a form.
import re, sys, glob, html, json
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it exited 3 over zero counts (loud, at least). Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# IMPORTED, NOT RE-STATED. A second copy of the attachment rule is the hazard that ccf_load's own
# attached() was extracted to prevent, and citation_head_check/citation_reach_check set the
# precedent for importing across .claude/ rather than keeping a byte-identical copy.
from ccf_load import attached, RECORD

FIELDS = re.compile(r"(?:share|ccf|note|text|val|sub|intro):'((?:[^'\\]|\\.)*)'")
COMMENT_LINE = re.compile(r'^\s*//\s?(.*)$')
FRac = re.compile(r'(\d{1,3}(?:,\d{3})+|\d+)/(\d{1,3}(?:,\d{3})+|\d+)')
PCT = re.compile(r'([~>]?)\s*(\d+(?:\.\d+)?)\s*(?:[–-]\s*(\d+(?:\.\d+)?))?\s*%')
YEARRANGE = re.compile(r'\b((?:19|20)\d{2})\s*[–-]\s*((?:19|20)\d{2})\b')

def num(s): return float(s.replace(',', ''))

def tolerance(txt, approx):
    if '.' in txt: return 0.15          # stated to a decimal: near-exact
    return 1.0 if approx else 0.6       # "~92" is a soft round; bare "92" tighter

STATED_IDENTITY = re.compile(r'(\d{1,3}(?:,\d{3})+|\d+)/(\d{1,3}(?:,\d{3})+|\d+)\s*=\s*'
                             r'[~>]?\s*\d+(?:\.\d+)?\s*%')

# PARENTHESES SCOPE THE PAIRING (2026-09-06). Three of the four flags that survived the comment
# surface's first calibration had ONE root cause: the pairing rule was purely positional and could
# not see a bracket. Fixing it by moving the +15 penalty would have been a constant tuned until the
# corpus went quiet; this is a structural rule instead, of the same kind as STATED_IDENTITY above —
# the author's own bracketing states which numbers belong together, and no proximity heuristic
# should outvote it. What it does NOT do is exempt anything: it decides which percentage is a
# fraction's partner, and then that pair is checked as strictly as before. Every shape below has a
# FIRING fixture beside its clean one for exactly that reason.
def clauses(t, splitter):
    """Split on clause delimiters at PAREN DEPTH ZERO only. A ';' inside a parenthetical is a list
    separator, not a clause boundary: ovary.js:177 writes "~90-93% ... (Tanaka 2016 48/53; an
    independent 2026 Chinese cohort 95/102)", and splitting on that ';' tore the second fraction
    away from the range it belongs to and left it to pair with the NEXT sentence's "70.5%". The
    split has to be paren-aware before the scope rule below can mean anything, since a fragment
    beginning inside a parenthetical has no coherent bracket structure to reason about."""
    out, buf, depth, i, pat = [], [], 0, 0, re.compile(splitter)
    while i < len(t):
        c = t[i]
        if c == '(': depth += 1
        elif c == ')': depth = max(0, depth - 1)
        if depth == 0:
            m = pat.match(t, i)          # pos-form match: the lookbehind still sees t[:i]
            if m and m.end() > i:
                out.append(''.join(buf)); buf = []; i = m.end(); continue
        buf.append(c); i += 1
    out.append(''.join(buf))
    return out

def paren_scopes(clause):
    """Index -> position of the innermost still-open '(' at that index, or -1 at top level."""
    out, stack = [], []
    for i, c in enumerate(clause):
        if c == '(':
            out.append(stack[-1] if stack else -1); stack.append(i)
        elif c == ')':
            out.append(stack[-1] if stack else -1)
            if stack: stack.pop()
        else:
            out.append(stack[-1] if stack else -1)
    return out

def scope_rank(scope, fpos, ppos):
    """How visible is the percentage at ppos to the fraction at fpos? 0 = same parenthetical, n =
    n levels further out, None = not a candidate at all. Two exclusions, both measured:
      SIBLING/NESTED. A percentage inside a parenthetical the fraction is outside of is invisible.
        ovary.js:220's "2/39 deep-infiltrating lesions (one at 8% allele fraction)" is not a
        79%-vs-8% disagreement — the 8% is a VARIANT ALLELE FRACTION of one lesion, a different
        quantity that merely shares the '%' sign. thyroid.js:247's "ATM (13/168, 7.7%) and KMT2D
        (12/168, 7.1%)" is two correct pairs that the old rule cross-paired.
      TRAILING. A percentage in an enclosing scope counts only if it appears BEFORE the fraction's
        parenthetical opens, because a parenthetical attaches to the text preceding it. That is
        this corpus's canonical form ("~92% of the four commonest types (48,789/53,142)"), and it
        is what makes ovary.js:177 clean: the range sits before the bracket, "70.5% bilateral"
        after it, describing a different histotype entirely."""
    sp, chain = scope[ppos], []
    s = scope[fpos]
    while True:
        chain.append(s)
        if s == -1: break
        s = scope[s]
    if sp not in chain: return None                  # sibling or nested: not a candidate
    k = chain.index(sp)
    if k and ppos > chain[k - 1]: return None        # enclosing, but after the bracket opened
    return k

def check_string(t, sentence_split=False):
    t = html.unescape(t.replace('&ndash;', '–').replace('&mdash;', '—'))
    flags = []
    # A FRACTION THE TEXT ITSELF EQUATES TO A PERCENTAGE is paired with THAT percentage, whatever
    # the distance heuristic would have preferred. Found in calibration: thyroid.js:26 writes
    # "anaplastic is 1.3% of cases but 471/2,371 = 19.9% of ... deaths" — two percentages that are
    # SUPPOSED to differ, in one sentence, and the nearest-preceding rule chose 1.3% over the 19.9%
    # sitting on the far side of the equals sign. An explicit "=" is the author stating the pairing;
    # no proximity heuristic should outvote it.
    for m in STATED_IDENTITY.finditer(t):
        stated = re.search(r'([~>]?)\s*(\d+(?:\.\d+)?)\s*%', m.group(0)[m.group(0).index('='):])
        fval = num(m.group(1)) / num(m.group(2)) * 100
        digits = stated.group(2)
        if abs(fval - num(digits)) > tolerance(digits, stated.group(1) == '~'):
            flags.append((stated.group(0).strip(), f'{m.group(1)}/{m.group(2)}', round(fval, 2)))
    t = STATED_IDENTITY.sub(' ', t)
    # A JOINED COMMENT RUN IS MANY CLAIMS; A FIELD LITERAL IS ONE. Splitting comments on sentence
    # boundaries as well is what keeps the nearest-percent rule inside one citation — calibration
    # produced five flags that all paired a fraction from one cited study with a percentage from a
    # different one in the same comment block. The field surface is NOT split this way: its
    # literals are single claims already, they were calibrated and adjudicated as such, and
    # loosening them would silence the one field flag the corpus has deliberately kept.
    splitter = r';|—|(?<=[a-z0-9)])\.\s' if sentence_split else r';|—'
    for clause in clauses(t, splitter):
        if not clause: continue
        scope = paren_scopes(clause)
        fracs = [(m.start(), num(m.group(1)) / num(m.group(2)) * 100,
                  f'{m.group(1)}/{m.group(2)}')
                 for m in FRac.finditer(clause) if num(m.group(2)) >= 20]
        pcts = [(m.start(), m.group(1) == '~', num(m.group(2)),
                 num(m.group(3)) if m.group(3) else None, m.group(0).strip(),
                 m.group(2) + (m.group(3) or ''))
                for m in PCT.finditer(clause) if '>' not in m.group(1)]
        if not fracs or not pcts: continue
        for fpos, fval, ftxt in fracs:
            # SCOPE EXCLUDES; DISTANCE STILL DECIDES. Preferring the innermost shared bracket
            # instead was tried and is wrong: pancreas.js:215 writes "93% of PDAC (140/150, TCGA
            # ...; "90% to 95%" across cohorts, Wood ...)", so ANOTHER study's range shares the
            # bracket with the fraction while the fraction's own percentage sits just outside it —
            # ranking by bracket paired 140/150 with Wood's 90% and flagged a correct string. The
            # narrower change is also the safer one: the distance heuristic that the field surface
            # was calibrated and adjudicated against is left exactly as it was.
            visible = [p for p in pcts if scope_rank(scope, fpos, p[0]) is not None]
            if not visible: continue
            best = min(visible, key=lambda p: abs(p[0] - fpos) + (0 if p[0] < fpos else 15))
            _, approx, lo, hi, ptxt, digits = best
            tol = tolerance(digits, approx)
            if hi is not None:      # range: fraction must sit near either endpoint
                ok = min(abs(fval - lo), abs(fval - hi)) <= tol or lo - tol <= fval <= hi + tol
            else:
                ok = abs(fval - lo) <= tol
            if not ok:
                flags.append((ptxt, ftxt, round(fval, 2)))
    return flags

def comment_blocks(src):
    """Contiguous `//` runs, joined into one string each, with the run's FIRST line number.
    Joined rather than scanned line by line because this corpus hard-wraps its comments at about
    100 columns, so a fraction and the percentage it contradicts routinely sit on different lines —
    scanning per line would have reported a change in reach while seeing almost none of it. The
    clause split inside check_string (on ';' and '—') is what keeps a joined run from pairing
    numbers across unrelated sentences."""
    blocks, buf, start = [], [], None
    for n, line in enumerate(src.splitlines(), 1):
        m = COMMENT_LINE.match(line)
        if m:
            if start is None: start = n
            buf.append(m.group(1))
        elif buf:
            blocks.append((start, ' '.join(buf))); buf, start = [], None
    if buf: blocks.append((start, ' '.join(buf)))
    return blocks

def fkeys(text):
    """Fractions in text as (numerator, denominator) digit-string pairs, commas stripped so that
    "13,898/17,837" and "13898/17837" are ONE identity rather than two. Same >= 20 denominator floor
    as check_string, for the same reason: below it these are counts, not proportions."""
    return {(m.group(1).replace(',', ''), m.group(2).replace(',', ''))
            for m in FRac.finditer(text) if num(m.group(2)) >= 20}

def attached_text(lines, idx):
    """The record at line index idx joined with its comment half, using ccf_load's attachment rule."""
    out = []
    for a, b in attached(lines, idx):
        for i in range(a, b):
            m = COMMENT_LINE.match(lines[i])
            if m: out.append(m.group(1))
    return html.unescape(' '.join(out))

def cross_half(src):
    """Fractions appearing in BOTH a record and its comment half, with whether each half PAIRS that
    fraction with a percentage. Yields (line, 'n/d', paired_in_one_literal, comment_states_percent).

    The record half is judged PER LITERAL and then aggregated with `or`, because that is how the
    field surface actually scans: a fraction sitting in `ccf:` with no percentage is still guarded if
    the same fraction appears in a `note:` that has one, since that literal's own check makes the
    comparison. Unaggregated, every multi-literal record would report itself."""
    lines = src.splitlines()
    for idx, line in enumerate(lines):
        if not RECORD.search(line): continue
        ctxt = attached_text(lines, idx)
        cf = fkeys(ctxt)
        if not cf: continue
        comment_pct = '%' in ctxt
        paired = {}
        for lit in (html.unescape(g) for g in FIELDS.findall(line)):
            for k in fkeys(lit) & cf:
                paired[k] = paired.get(k, False) or ('%' in lit)
        for k in sorted(paired):
            yield idx + 1, f'{k[0]}/{k[1]}', paired[k], comment_pct


FIXTURES = [
    ('~92% of the four commonest types (48,789/53,142, Park)', [], 'real bladder pair'),
    ('~64.5% of tumors (22,634/35,066 in a registry)', [], 'real testis pair'),
    ('~65–79% across cohorts (65.4%, 214/327; 70–79% in two cohorts)', [], 'range forms'),
    ('~20% of deaths (471/2,371, 1994–2013)', [], 'real anaplastic pair'),
    ('~92% of the four commonest types (40,000/53,142, Park)', ['fire'], 'synthetic drift'),
    # the two shapes the comment-surface calibration produced, as fixtures so neither can regress
    ('anaplastic is 1.3% of cases but 471/2,371 = 19.9% of the deaths', [],
     'stated identity outranks the nearer percentage (thyroid:26)'),
    ('lymph-node metastasis "Common (20–90%)" in PTC. Lateral-neck disease at 12.9% (12/61)',
     ['fire'], 'cross-sentence pairing still fires WITHOUT sentence_split'),
    ('anaplastic is 1.3% of cases but 471/2,371 = 12.0% of the deaths', ['fire'],
     'a stated identity that is WRONG still fires'),
    # the three paren-scope shapes, each with the firing counterpart that proves the scope rule
    # narrowed the PAIRING and not the checking
    ('~90–93% is confined to ONE ovary (Tanaka 2016 48/53; an independent cohort 95/102) '
     'where serous is 70.5% bilateral', [], 'a percent after the bracket closes is out of scope, '
     'and ";" inside it does not split (ovary:177)'),
    ('~90–93% is confined to ONE ovary (Tanaka 2016 48/53; an independent cohort 40/102) '
     'where serous is 70.5% bilateral', ['fire'],
     'both members of a bracketed list are still checked against the range'),
    ('Anglesio found it in only 2/39 lesions (one at 8% allele fraction)', [],
     'a percent nested inside a bracket is invisible to a fraction outside it (ovary:220)'),
    ('~15% of lesions carried it (2/39 cases, one at 8% allele fraction)', ['fire'],
     'the same nested 8% does not shield a fraction whose OWN percent disagrees'),
    ('93% of PDAC (140/150, TCGA 2017; "90% to 95%" across cohorts, Wood 2022)', [],
     'a neighbouring study\'s range sharing the bracket does not outvote the fraction\'s own '
     'percentage just outside it (pancreas:215)'),
    ('ATM (13/168, 7.7%) and KMT2D (12/168, 7.1%)', [],
     'sibling brackets do not cross-pair (thyroid:226)'),
    ('ATM (13/168, 7.7%) and KMT2D (99/168, 7.1%)', ['fire'],
     'drift inside its own bracket is still caught'),
]

# CROSS-HALF FIXTURES — whole miniature sources, because this surface reads the corpus's GEOMETRY
# (shared block above an array opener, records packed beneath) and a bare string cannot express it.
# The last fixture is a DECLINE pinned as a test: the shared-denominator anchor measured 4-for-4
# false, and a fixture asserting it stays silent is what stops it being re-added as an improvement.
CROSS_FIXTURES = [
    ("// TCGA: BRAF V600E in 248/402 papillary carcinomas (61.7%).\nconst A = [\n"
     "  { gene:'BRAF V600E', note:'61.7% of papillary carcinomas (248/402, TCGA)' },\n];\n",
     [], 'one literal pairs the fraction with its percentage: the composition argument holds'),
    ("// TCGA: BRAF V600E in 248/402 papillary carcinomas (61.7%).\nconst A = [\n"
     "  { gene:'BRAF V600E', ccf:'248/402 sequenced tumors', note:'61.7% of papillary carcinomas' },\n];\n",
     ['fire'], 'fraction and percentage in DIFFERENT literals: the comment compares its own copy '
     'and passes, the record compares nothing'),
    ("// TCGA sequenced 248/402 papillary carcinomas in the discovery set.\nconst A = [\n"
     "  { gene:'BRAF V600E', ccf:'248/402 sequenced tumors' },\n];\n",
     [], 'the comment states no percentage for it, so there is no second figure to disagree'),
    ("// TCGA: 300/402 tumors were BRAF-like (74.6%).\nconst A = [\n"
     "  { gene:'BRAF V600E', note:'61.7% of papillary carcinomas (248/402, TCGA)' },\n];\n",
     [], 'a shared DENOMINATOR is not a shared figure — the declined anchor, pinned silent'),
]

def selftest():
    ok = True
    for t, want, label in FIXTURES:
        got = check_string(t)
        good = bool(got) == bool(want)
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {got or 'clean'}")
    for src, want, label in CROSS_FIXTURES:
        got = [(ln, fr) for ln, fr, paired, cpct in cross_half(src) if not paired and cpct]
        good = bool(got) == bool(want)
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} cross-half: {label}: {got or 'clean'}")
    print('SELFTEST', 'PASS — fires on drift, passes real pairs within tolerance, and reports a '
          'cross-half fraction no literal pairs' if ok else 'FAIL — do not trust the scan')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    print()
    checked = flagged = 0
    comments_checked = comments_flagged = 0
    cross_pairs = cross_flags = 0
    tworange = []
    # STILL A GLOB, AND DECLARED AS SUCH. The tracked-set rule binds a producer whose metric is
    # RATCHETED; this sidecar's ratchet array is empty (every metric it prints is a defect count).
    # Reasoning and the general rule: battery.py's sidecar-convention block. THE TRIGGER, here because
    # this is the line that would have to change: adding anything to that array means switching this
    # loop to extract_citations.corpus_paths() in the same edit.
    # AND NOTHING CHECKS THAT FOR YOU. A battery member for it was proposed and DECLINED on evidence
    # (2026-09-07, same item) because the ratchet itself fires one checkout later. So this comment is
    # the mechanism at authoring time, not a reminder that one exists.
    for f in sorted(glob.glob('js/organs/*.js')):
        src = open(f, encoding='utf-8').read()
        short = f.split('/')[-1][:-3]
        for m in FIELDS.finditer(src):
            t = m.group(1)
            ln = src[:m.start()].count('\n') + 1
            if FRac.search(t) and '%' in t:
                checked += 1
                for ptxt, ftxt, fval in check_string(t):
                    flagged += 1
                    print(f'  MISMATCH? {short}:{ln}  stated {ptxt} vs {ftxt} = {fval}%')
            yrs = {(a, b) for a, b in YEARRANGE.findall(html.unescape(t))}
            if len(yrs) >= 2:
                tworange.append((short, ln, sorted(yrs)))
        # THE COMMENT SURFACE (2026-09-06) — blind spot (2) above, now closed and MEASURED.
        # Reported on its own lines and counted separately from the field surface, so the
        # calibration batch this enlargement produces stays distinguishable from the field
        # flags that were already adjudicated. Per condition (8) a first run teaches the
        # taxonomy before it counts as a defect list.
        for ln, t in comment_blocks(src):
            if FRac.search(t) and '%' in t:
                comments_checked += 1
                for ptxt, ftxt, fval in check_string(t, sentence_split=True):
                    comments_flagged += 1
                    print(f'  COMMENT MISMATCH? {short}:{ln}  stated {ptxt} vs {ftxt} = {fval}%')
        # THE CROSS-HALF SURFACE (2026-09-08) — the closure PREMISE, per the header block. Counted
        # apart from the other two for the same reason the comment surface was: a new reach has to
        # stay distinguishable from flags already adjudicated.
        for ln, frac, paired, comment_pct in cross_half(src):
            cross_pairs += 1
            if not paired and comment_pct:
                cross_flags += 1
                print(f'  CROSS-HALF? {short}:{ln}  {frac} appears in this record and in its '
                      f'comment, which states a percentage for it, but no single record literal '
                      f'pairs the two — so nothing checks the record\'s own figure against it')
    print(f'TWO-YEAR-RANGE strings (human confirms-deliberate): {len(tworange)}')
    for f, l, y in tworange: print(f'   {f}:{l}  {y}')
    # A SCAN THAT EXAMINED NOTHING IS NOT A PASS (condition 7 applied locally rather than argued
    # about). "0 flags" is only meaningful beside a non-zero number of things looked at; this
    # corpus cannot legitimately reach zero on either surface, so zero means the scan broke.
    vacuous = [name for name, n in (('field', checked), ('comment', comments_checked)) if n == 0]
    for name in vacuous:
        print(f'  PROBLEM: the {name} surface examined ZERO strings — a report of no mismatches '
              f'over nothing scanned is not a pass, it is a broken scan.')
    print('SIDECAR ' + json.dumps({
        'name': 'fraction_check',
        'metrics': {'field_strings': checked, 'field_flags': flagged,
                    'comment_blocks': comments_checked, 'comment_flags': comments_flagged,
                    'cross_half_pairs': cross_pairs, 'cross_half_flags': cross_flags,
                    'two_year_range': len(tworange)},
        # empty on purpose: the flag counts are DEFECT counts, and the two "examined" counts drop
        # legitimately whenever an unsourced statistic is REMOVED rather than re-sourced — which is
        # the remedy this project prefers. Ratcheting either would punish the correct fix.
        # cross_half_pairs is the same kind of number and stays out for the same reason — a
        # re-sourcing that stops repeating a fraction in both halves lowers it CORRECTLY. So this
        # array is still empty and the glob above is still legal; the trigger there is untripped.
        'ratchet': [],
    }, sort_keys=True))
    # DONE line last (2026-09-05 sweep): absence-of-flags is never a pass.
    print(f'DONE fraction_check: {checked} field strings with fraction+percent, {flagged} mismatch '
          f'flags; {comments_checked} comment blocks, {comments_flagged} comment flags; '
          f'{cross_pairs} cross-half shared fractions, {cross_flags} unpaired')
    if vacuous:
        sys.exit(3)
