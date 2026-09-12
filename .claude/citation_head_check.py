# Citation HEAD-SHAPE check (2026-09-07). The first instrument that looks at the records themselves
# rather than at what is missing from them.
#
# WHY IT EXISTS. citation_reach_check.py declares its own blind spot in its header, verbatim:
#
#     QUOTES .claude/citation_reach_check.py
#     > THIS CHECK IS BLIND TO THAT FAILURE MODE BY CONSTRUCTION. It counts years that produced NO
#     > record; a year that produced the WRONG record is not an absence and will never appear here.
#     > Do not read a clean run as "every year is filed correctly".
#
# This file takes one bite out of that blind spot — the one bite that can be taken without a
# heuristic. It does NOT check that a head owns its year (that is citation_crosscheck's business,
# per record, against sources) and it does NOT check that a head names the real author (an external
# fact this chain cannot derive from the corpus). It checks ONE thing: for every record whose author
# string is not a single run of letters, is that string what the CORPUS TEXT presents as the author,
# or did the extractor swallow something adjacent?
#
# That question has a decidable answer per span and no answer at all in general, which is why this
# is an ENUMERATION and not a rule. SURNAME admits an optional second capitalised word (needed:
# "Safaee Ardekani", "Mehrvarz Sarshekeh", "von der Maase" are genuinely multi-word) and admits an
# apostrophe (needed prospectively: "O'Brien"). Both admissions are load-bearing and both leak. The
# leaks were AMBIENT until this file: named in prose in three different places, pinned by fixtures in
# two, and enumerated nowhere, so the set could grow without anyone noticing.
#
#     "Declare the enumerated list with fixtures pinning it, so the set can't grow silently. And
#      note the declaration passes your own new test: the evidence is the list itself, not a
#      judgement about it."   — user, 2026-09-06
#
# THE RULING NAMED SIX HEADS AND THE CLASS HAS MORE, which is a finding rather than a scope change.
# 'Sweden Engstrand' is declared in extract_citations.py's own header and 'MIS-CITES Pollock' is
# pinned by a fixture there; both are the same defect. An enumeration that omitted them would not be
# closed — 'Sweden Engstrand' would have fired as an undeclared head on this file's first run. So the
# two lists below are total over the population, and what the ruling named is a subset of IMPRECISE.
#
# WHAT IT GATES. Every head in the population must appear in exactly one of two lists, and a head in
# neither is a PROBLEM. There is no third state and no default:
#   IMPRECISE      the head carries text the corpus did not offer as an author name. A DEFECT,
#                  tolerated, each entry carrying a reason and the string the head SHOULD have been.
#                  The corrected form is not decoration: it is the expected output of whatever fix
#                  eventually lands, written down while the span is in front of a human.
#   WELL_FORMED    the head is exactly what the corpus wrote. A TUPLE, not a dict, and that shape is
#                  the argument: there is nothing to justify. Every entry's evidence is its own refs,
#                  printed beside it on every run, so a reader checks an entry by opening a file
#                  rather than by believing a sentence.
# The asymmetry mirrors reach_check's GATED/REPORTED split for the same reason: a defect needs a
# reason, a non-defect needs only to be on the list so the list is total.
#
# THE COST IS REAL AND IS NOT HIDDEN. The corpus is about to grow eightfold, and every new
# multi-token surname will fail this gate until someone adds one line to WELL_FORMED. That friction
# IS the check — the line gets added by a human who has just looked at the head and decided the
# display string is right — but it is friction, it will be felt on most content commits that add a
# paper, and pretending otherwise would be the kind of claim this project keeps catching itself in.
#
# WHY THE POPULATION IS `not author.isalpha()` AND NOT A CHARACTER LIST. Both were computed over the
# live corpus before choosing, and they agreed exactly (see population_arms in selftest, which pins
# the predicate on four shapes). The negative form wins anyway, because it is TOTAL: a hand-listed
# " '-" misses the next character SURNAME starts admitting, and a population that silently narrows is
# how a partition stops being closed while still looking closed. Non-ASCII single-token surnames stay
# OUT of the population by construction (isalpha() is true for 'Riihimäki'), which is correct — there
# is nothing to partition in a single token — and is worth stating because the held SURNAME widening
# would otherwise look like it belonged here.
#
# NO RATCHET, AND FOR TWO DIFFERENT REASONS — the array is empty, but not for reach_check's single
# reason. `imprecise` is a DEFECT COUNT, so ratcheting it would fail the battery for fixing an
# imprecision. `well_formed` and `heads_total` are corpus-composition numbers already covered, better,
# by record_count.json's key set. AND THE SHRINK DIRECTION IS ALREADY GUARDED HERE, which is the
# non-obvious part: if SURNAME ever stopped admitting two words, every multi-token head would leave
# the population at once and every declaration would go STALE — this file would fail with one problem
# per entry, loudly, before any count had a chance to be quietly smaller.
#
# CONDITION (7): --selftest proves this can FIRE in each direction it claims to cover — undeclared,
# stale, and declared-in-both-lists — and that a fully declared population is clean, because a gate
# that flags everything is as useless as one that flags nothing. Condition (7-bis): the DONE line
# prints LAST, after the sidecar and the full per-head listing, so a report of zero is shown to have
# been produced rather than inferred from silence.
#
# Usage: python3 .claude/citation_head_check.py [--selftest] [file ...defaults to js/organs/*.js]
import glob, json, os, sys
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it reported 23 problems over 0 records. Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_citations import extract

# Keyed by the head EXACTLY as the extractor emits it, including the run of spaces a line join
# leaves behind — 'Burgundy   Manfredi' really does carry three, and writing one here would make the
# entry undeclared while looking correct. Value is (corrected_author, reason).
#
# A DECLARATION NAMES CHECKABLE EVIDENCE, NOT A JUDGEMENT (the rule adopted 2026-09-06 in
# citation_reach_check.py, after three declarations there rotted while clearing an 80-char bar). Every
# reason below QUOTES the corpus span it is about, which that file identified as the cheapest
# sufficient form: a reader confirms an entry by comparing two strings on this page, and does not have
# to take a measurement or trust a conclusion. Mechanising "the reason quotes the span" is
# deliberately NOT done, for the reason recorded there — it would add a substring matcher to a chain
# whose last one is already flagged, and it is satisfiable by quoting a single word.
IMPRECISE = {
    'Sweden Engstrand': ('Engstrand',
        'PLACE PREFIX absorbed by SURNAME\'s second-word clause. colon.js:164 writes the national '
        'cohort list as "...; Sweden Engstrand 2018 [16.2%]; Germany Hackl 2014 [17.7%]; ..." — the '
        'country labels the list itself, and the author is Engstrand. Declared in prose in '
        'extract_citations.py\'s header before this list existed, and pinned there by the '
        'colon.js:164-165 fixture; enumerated here so the class has one home.'),
    'Germany Hackl': ('Hackl',
        'PLACE PREFIX, same span and same cause as Sweden Engstrand above: colon.js:164 reads '
        '"Germany Hackl 2014 [17.7%]". Listed separately rather than folded in because they are '
        'different papers and a merged entry would hide one — the same reason '
        'citation_reach_check.py keeps Conejero Merchán apart from Riihimäki.'),
    'Burgundy   Manfredi': ('Manfredi',
        'PLACE PREFIX ACROSS A LINE JOIN, which is why the key carries three spaces: colon.js:164 '
        'ends "...; Burgundy" and :165 begins "  Manfredi 2006 [14.5%])", and matching runs on '
        'joined text. THE KEY IS THE EVIDENCE HERE — a single-space key would sit in this dict '
        'looking right and declaring nothing, and the extractor fixture for these two lines records '
        'the three spaces for the same reason.'),
    'But Friemel': ('Friemel',
        'SENTENCE WORD absorbed: liver.js:208 reads "... (TP53 33.0%, CTNNB1 34.0%, N=291). But '
        'Friemel et al. (2016) is itself a case report of the documented exception". "But" opens the '
        'sentence and the second-word clause takes it. Named in extract_citations.py\'s header as '
        'evidence the class PRE-DATES the fourth head pattern; this is the P_ETAL path, so the '
        'defect is SURNAME\'s, not any one pattern\'s.'),
    'Foulkes WD': ('Foulkes',
        'TRAILING INITIALS, PubMed style: breast.js:142 reads "the real paper (Foulkes WD, Smith IE, '
        'Reis-Filho JS, \\"Triple-Negative Breast Cancer,\\" NEJM 2010, PMID 21067385) exists". THE '
        'SAME CORPUS SHAPE THAT PRODUCES AN ABSENCE ELSEWHERE: citation_reach_check declares "Li D" '
        'and "Wang K" as etal-malformed-head, where the initial BREAKS the match because P_ETAL '
        'needs a bare surname before "et al.". This span has no "et al." — it matched P_PAREN1 — so '
        'the initial is swallowed instead of blocking. One cause, two outcomes, in two instruments.'),
    "Cunningham's": ('Cunningham',
        'POSSESSIVE absorbed by SURNAME\'s character class, not by its second-word clause: '
        'stomach.js:86 reads "anchored to 10.4 cm — Cunningham\'s 1905 mid-range (\\"not more than 4 '
        'to 4.5 inches". The apostrophe is admitted so a real "O\'Brien" can be a head, and the '
        'trailing "\'s" rides along with it.'),
    "Gray's": ('Gray',
        'POSSESSIVE, same cause as Cunningham\'s above: stomach.js:102 reads "no fetchable source '
        'states a color for the normal gastric SEROSA in words (Gray\'s 1918 colors the INSIDE '
        'mucosa only)". A CANDIDATE FIX EXISTS AND IS HELD, named so it is not re-invented from '
        'scratch: strip a trailing "\'s". Its hazard is a surname that genuinely ends that way, and '
        'the hazard is PROSPECTIVE rather than present — these two heads are the only apostrophe-'
        'bearing authors in the corpus today, re-measurable by filtering record authors on "\'". '
        'It is also a CHANGE IN REACH under the standing procedure (two keys out, two in, at a flat '
        'count — the d54bd1a shape record_count.json\'s key set exists to show), so it needs its own '
        'commit and its own measurement, and the ruling that produced this file said declare, not '
        'fix.'),
    'MIS-CITES Pollock': ('Pollock',
        'ALL-CAPS EMPHASIS absorbed: skin.js:306 reads "// - TCGA 2015 itself MIS-CITES Pollock 2003 '
        'twice (for BRAF/NRAS anti-correlation and for". The year is filed correctly and only the '
        'author string is polluted. Already pinned by a fixture in extract_citations.py, whose own '
        'comment records why the obvious fix is unavailable — trimming a shouted first word turns the '
        'genuine corporate heads "TCGA Research" and "WHO Classification" into "Research" and '
        '"Classification" — so it waits for an acronym lexicon that can tell an organisation from a '
        'shout. Enumerated here because a fixture pins ONE span and this list bounds the SET.'),
}

# Heads where the extractor reproduced exactly what the corpus wrote. No reasons: the claim is that
# these strings are what the page says, and the run prints each one's refs so the claim is checked by
# looking rather than by reading an argument. Grouped by the SURNAME clause that admits each, because
# that is the only structure here a reader needs.
WELL_FORMED = (
    # hyphenated single-token surnames — the character class, working as intended
    'Barnholtz-Sloan',
    'Cittolin-Santos',
    'Iacobuzio-Donahue',
    'Jamal-Hanjani',
    'Laurent-Puig',
    'Parra-Herran',
    'Perez-Sanchez',
    'Segura-Moreno',
    # lowercase particles — SURNAME's leading (van|von|de|der|...) clause
    'de Kouchkovsky',
    'van Beek',
    'van der Kaaij',
    'von der Maase',
    # genuinely two-word surnames — the second-word clause doing the job it exists for, and the
    # reason it cannot be removed to fix the eight entries above
    'De Leo',
    'Di Carlo',
    'Mehrvarz Sarshekeh',
    'Myo Min',
    'Safaee Ardekani',
    # NOT A PAPER: breast.js:25 quotes a CC BY 4.0 attribution string verbatim ("Heidi Schlehlein
    # 2022. 3D Reference Organ for Breast (mammary gland), Female left, v1.0"), where the full
    # personal name IS the required attribution. Well-formed for what it is; flagged here because a
    # reader scanning for surnames would otherwise stop on it.
    'Heidi Schlehlein',
    # NOT A PAPER, SAME TREATMENT: lungs.js:20 reads "~25% of all lung cancers, confirmed current
    # (NCI PDQ, 2026; StatPearls' independent ~30% of NSCLC nets to the same figure)". "NCI PDQ" is
    # this atlas's genuine, correct short name for the National Cancer Institute's Physician Data
    # Query — an organizational source, not a personal surname, and inherently two tokens (an
    # acronym pair) the same way "Heidi Schlehlein" is inherently two words. The "2026" the
    # extractor reads as a year is this atlas's own page-access year for that PDQ page, not a
    # publication year of a paper called "NCI PDQ" — well-formed for what it names, not a paper.
    'NCI PDQ',
)


def multi_token(author):
    """The population: any author string that is not a single run of letters. TOTAL by construction —
    see the header on why this beats a hand-listed character set even though the two agree today."""
    return not author.isalpha()


def evaluate(heads):
    """`heads` maps author -> [refs]. Returns problems.

    Three failure directions, and all three are needed. UNDECLARED is the growth the ruling asked to
    stop. STALE is the reverse: a declaration whose head is gone, which is how a FIXED imprecision
    goes on looking tolerated — and here it doubles as the guard against SURNAME narrowing, since
    that would empty the population and stale every entry at once. BOTH-LISTS is the incoherent
    middle: a head on both lists would be a defect parked on the innocent list, where nothing about
    it would ever be read again."""
    problems = []
    for head in sorted(set(IMPRECISE) & set(WELL_FORMED)):
        problems.append(f'DECLARED TWICE: {head!r} is in IMPRECISE and in WELL_FORMED. One head, one '
                        'verdict — on both lists it counts as declared while nobody has decided '
                        'whether it is a defect.')
    for head in sorted(heads):
        if head in IMPRECISE or head in WELL_FORMED:
            continue
        problems.append(
            f'UNDECLARED HEAD SHAPE {head!r} at {", ".join(heads[head][:6])} '
            f'({len(heads[head])} record{"s" if len(heads[head]) != 1 else ""}). This author string '
            'is not a single run of letters, so either the corpus really writes it that way — add it '
            'to WELL_FORMED — or the extractor swallowed adjacent text, in which case add it to '
            'IMPRECISE with the corrected string and the span quoted. Do not widen or narrow '
            'SURNAME to make this go away: that is a change in reach and needs its own commit and '
            'its own measurement.')
    for head in sorted(set(IMPRECISE) | set(WELL_FORMED)):
        if head not in heads:
            problems.append(
                f'STALE DECLARATION {head!r}: declared, but no record carries that author any more. '
                'If it was fixed or the span was edited, delete the declaration in the same commit — '
                'a declaration for a head that is gone hides the next one.')
    return problems


def sidecar_metrics(heads, problems):
    return {
        'heads_total': len(heads),
        'records': sum(len(refs) for refs in heads.values()),
        'imprecise': sum(1 for head in heads if head in IMPRECISE),
        'well_formed': sum(1 for head in heads if head in WELL_FORMED),
        'declared': len(IMPRECISE) + len(WELL_FORMED),
        'problems': len(problems),
    }


# A FIXTURE MAY REUSE A REAL POINTER; IT MUST NEVER INVENT ONE. pointer_check.py asserts that every
# hand-typed <file>:<line> in this repo names a real place, so an invented one is a false claim that
# cannot be told apart from a live pointer — and it fired here, on five uses of this one value.
# Reusing a real pointer is harmless (a fixture makes the same true claim the live pointer does);
# inventing one is the defect. So the ref is COMPOSED, and no literal pointer appears in this file's
# fixtures. internal_quote_check.py holds its marker token in a name for exactly this reason.
FIXTURE_REF = '%s:%d' % ('x.js', 1)


def selftest():
    # Declared up front because arm 4 rebinds it; Python requires the declaration before any use of
    # the name in this function, and the arm that needs it is a long way below.
    global WELL_FORMED
    ok, ran, failures = True, 0, 0

    def arm(label, cond, detail=''):
        nonlocal ok, ran, failures
        ran += 1
        if not cond:
            ok = False
            failures += 1
            print(f'SELFTEST FAIL: {label} {detail}', file=sys.stderr)
        return cond

    # arm 1: THE PREDICATE, pinned on four shapes. It decides the whole population, so a silent
    # change to it would silently change what this gate covers.
    arm('a plain single-token surname is OUT of the population', not multi_token('Smith'))
    arm('a particle surname is IN', multi_token('van Beek'))
    arm('a possessive is IN', multi_token("Gray's"))
    arm('a hyphenated surname is IN', multi_token('Barnholtz-Sloan'))
    arm('a non-ASCII single token is OUT (nothing to partition in one token)',
        not multi_token('Riihimäki'))

    # arm 2: IT CAN FIRE on growth — the failure the ruling asked for. An undeclared multi-token head
    # is a problem even though nothing about it looks broken. The population is the full declared set
    # PLUS one intruder, so the arm proves the problem fires ALONE against an otherwise-clean run;
    # my first version passed a two-head map and drowned in twenty-odd stale declarations, which is
    # the check working and the arm miscalibrated.
    declared_clean = {head: [FIXTURE_REF] for head in list(IMPRECISE) + list(WELL_FORMED)}
    grew = evaluate({**declared_clean, 'Brand New': [FIXTURE_REF]})
    arm('an UNDECLARED head is a problem, and is the only one on an otherwise clean population',
        len(grew) == 1 and 'Brand New' in grew[0], str(grew))

    # arm 3: and on the STALE direction, which is also the guard against SURNAME narrowing.
    stale = evaluate({head: [FIXTURE_REF] for head in list(IMPRECISE) + list(WELL_FORMED)[1:]})
    arm('a declaration with no record is STALE',
        len(stale) == 1 and 'STALE' in stale[0] and WELL_FORMED[0] in stale[0], str(stale))
    arm('narrowing SURNAME would stale EVERY declaration at once, not shrink a count quietly',
        len(evaluate({})) == len(IMPRECISE) + len(WELL_FORMED))

    # arm 4: the incoherent middle. Driven through a temporary overlap rather than asserted about the
    # live lists, so the arm tests the check and not today's data.
    saved = WELL_FORMED
    try:
        WELL_FORMED = saved + ("Gray's",)
        both = evaluate(declared_clean)
        arm('a head on BOTH lists is a problem, alone on an otherwise clean population',
            len(both) == 1 and 'DECLARED TWICE' in both[0], str(both))
    finally:
        WELL_FORMED = saved

    # arm 5: THE PASSING DIRECTION. A gate that flags everything is as useless as one that flags
    # nothing, and this file's population is large enough that a broken predicate would be noisy
    # rather than obviously wrong.
    arm('a fully declared population is clean',
        not evaluate({head: [FIXTURE_REF] for head in list(IMPRECISE) + list(WELL_FORMED)}))

    # arm 6: every IMPRECISE entry carries a corrected form that differs from the head. The corrected
    # string is the expected output of the held fix, so an entry that merely repeats the head would
    # be recording that there is nothing wrong — while sitting on the defect list.
    bad = {head: fixed for head, (fixed, _why) in IMPRECISE.items()
           if not fixed or fixed == head or not fixed.strip()}
    arm('every IMPRECISE entry names a corrected author, different from the head', not bad, str(bad))
    # and the same 80-char bar the other two declaration lists are held to. It measures LENGTH and
    # not content — citation_reach_check.py records at length how three of its reasons cleared this
    # bar while being wrong — so it is a floor, not a test, and it is kept for the floor.
    short = {head: len(why) for head, (_fixed, why) in IMPRECISE.items() if len(why) <= 80}
    arm('every IMPRECISE reason exceeds 80 chars', not short, str(short))

    # arm 7: the sidecar's arithmetic. imprecise + well_formed must exhaust the population whenever
    # there are no problems, or a head would be counted in the total and in neither half — the
    # residual-bucket failure citation_reach_check.py had to fix in its own sidecar.
    live = {head: [FIXTURE_REF] for head in list(IMPRECISE) + list(WELL_FORMED)}
    metrics = sidecar_metrics(live, [])
    arm('imprecise + well_formed == heads_total on a clean population',
        metrics['imprecise'] + metrics['well_formed'] == metrics['heads_total'],
        str(metrics))

    # The COUNT, not just the verdict (7-bis): a pass line saying only "ok" cannot tell a full run
    # from a run whose arms were deleted.
    print(f'DONE citation_head_check_selftest: {ran} arms run, {failures} failures')
    return ok


def main():
    # STILL A GLOB, AND DECLARED AS SUCH. The tracked-set rule binds a producer whose metric is
    # RATCHETED; this sidecar's ratchet array is empty, for the two reasons given beside it below.
    # Reasoning and the general rule: battery.py's sidecar-convention block. THE TRIGGER, here because
    # this is the line that would have to change: adding anything to that array means switching this
    # default to extract_citations.corpus_paths() in the same edit.
    # AND NOTHING CHECKS THAT FOR YOU. A battery member for it was proposed and DECLINED on evidence
    # (2026-09-07, same item) because the ratchet itself fires one checkout later. So this comment is
    # the mechanism at authoring time, not a reminder that one exists.
    paths = [a for a in sys.argv[1:] if not a.startswith('--')] or sorted(glob.glob('js/organs/*.js'))
    if not paths:
        print('citation_head_check: REFUSING TO REPORT — the corpus glob resolved to nothing (population unmeasured; not a finding)'); sys.exit(3)
    records = extract(paths)
    if not records:
        # FAILED-TO-MEASURE IS NOT A FINDING (standing rule, 2026-09-10): this check once reported '23 problems' about
        # declared heads over an EMPTY record set — the unmeasurable phrased as defects.
        print('citation_head_check: REFUSING TO REPORT — the extractor produced 0 records over %d corpus files (population unmeasured; not a finding)' % len(paths)); sys.exit(3)
    heads = {}
    for record in records:
        if multi_token(record['author']):
            heads.setdefault(record['author'], []).append(record['ref'])
    for refs in heads.values():
        refs.sort()
    problems = evaluate(heads)

    print(f'citation_head_check: {len(paths)} files, {len(records)} records, '
          f'{len(heads)} head strings that are not a single run of letters')
    # EVERY head printed with its refs on EVERY run, both lists, because that listing IS the
    # declaration's evidence (user, 2026-09-06: "the evidence is the list itself, not a judgement
    # about it"). A summary count here would be a judgement about the list.
    for head in sorted(heads):
        if head in IMPRECISE:
            mark, note = 'IMPRECISE  ', f' -> should read {IMPRECISE[head][0]!r}'
        elif head in WELL_FORMED:
            mark, note = 'well-formed', ''
        else:
            mark, note = 'UNDECLARED ', ''
        print(f'  {mark} {head!r:<26}{note}'.rstrip())
        print(f'              {", ".join(heads[head])}')
    for p in problems:
        print(f'  PROBLEM: {p}')

    print('SIDECAR ' + json.dumps({
        'name': 'citation_head_check',
        'metrics': sidecar_metrics(heads, problems),
        # Empty for TWO different reasons, not reach_check's one: `imprecise` is a defect count, and
        # the composition metrics are already covered better by record_count.json's key set. The
        # shrink direction is guarded here by STALE, not by a ratchet — see the header.
        'ratchet': [],
    }, sort_keys=True))
    # DONE last (7-bis), after the sidecar and the full listing above. The head count NAMES ITS
    # DENOMINATOR, per battery.py's rule — "23 heads over 487 records" would read as if the heads
    # spanned the whole corpus, when the population is the handful of records that carry one.
    print(f'DONE citation_head_check: {len(heads)} multi-token heads on '
          f'{sum(len(refs) for refs in heads.values())}/{len(records)} records, '
          f'{sum(1 for h in heads if h in IMPRECISE)} declared imprecise, '
          f'{sum(1 for h in heads if h in WELL_FORMED)} declared well-formed, '
          f'{len(problems)} problems')
    if problems:
        sys.exit(3)


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
