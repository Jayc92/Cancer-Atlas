#!/usr/bin/env python3
# citation_paren_ledger.py (2026-09-07) — A PRE-REGISTRATION OF ONE RULE, not a check on the corpus.
#
# THE CLAIM, WRITTEN DOWN SO THE NEXT INSTANCE IS SCORED AGAINST IT INSTEAD OF ABSORBED INTO IT:
#
#     A CLOSED YEAR-BEARING PARENTHETICAL SPENDS THE HEAD.
#
#     When a parenthetical that CARRIES A YEAR opens and closes between an author head and some
#     later year, the head belongs to the citation that parenthetical completed, and the later year
#     has no head of its own. A parenthetical carrying no year (an aside) does not spend anything.
#
# That is closed_year_paren() in extract_citations.py, stated as a prediction rather than as code.
# The prediction is falsifiable in a specific way: a span where the paren carries a year AND the head
# genuinely owns the later year too would break it. "Travis et al., J Thorac Oncol, 2015 (WHO 2015) &
# 2011 (IASLC/ATS/ERS)" is that span, and it is one word away from existing in this corpus.
#
# WHY PRE-REGISTERED RATHER THAN MERELY IMPLEMENTED (user ruling, 2026-09-07): "the corpus is about
# to grow eightfold. At 120 cancers the population of ')'-between-head-and-year spans goes from four
# to some tens, so the rule will be exercised repeatedly and soon. Write the prediction down as a
# falsifiable claim — a closed year-bearing parenthetical spends the head — so the next instance gets
# scored against it instead of absorbed into it. Same discipline as a batch pre-registration, applied
# to a rule."
#
# ABSORBED IS THE PRECISE WORD FOR THE FAILURE. Without this file, a new span of the shape produces
# either a record or an absence, both of which are ordinary output that no instrument distinguishes
# from any other. The rule would then be "supported" by every span it silently processed — a count
# that rises whether the rule is right or wrong, which is the definition of a claim that cannot fail.
#
# HENCE FIT VERSUS TEST, THE ONE FIELD THAT MAKES THIS A PRE-REGISTRATION. The rule was fit to a
# population of four spans, one of them (Travis) the counterexample the "carrying a year" narrowing
# was invented for. Four entries scored CONFIRMS therefore do NOT mean four confirmations: they mean
# the rule reproduces the four spans it was shaped around, which it could hardly fail to do. So every
# entry declares its basis, and only TEST entries are evidence:
#     FIT   the span existed when the rule was written, and informed it. Support value: none.
#     TEST  the span arrived AFTER, and was scored against the claim as written. Support value: all.
# `basis_test` is 0 today and is the only ratcheted metric here — the number that measures this
# rule's actual support starts at zero and is not allowed to fall.
#
# THIS IS THE PROJECT'S OWN LESSON, MECHANISED ONE STEP FURTHER. The note at the rule in
# extract_citations.py already says "the evidence base is 4, one of which is the counterexample the
# rule was shaped around, so it is FIT TO THE CORPUS and the next span of this shape is a test of it,
# not a confirmation". That sentence was true and unenforced: nothing made the next span get treated
# as a test. This file is the enforcement, and the sentence is now that of a declaration whose
# evidence is checkable rather than a judgement to be believed.
#
# WHAT IT CHECKS, EXACTLY ONE THING: has every span in the corpus where a ')' sits between an author
# head and its year been SCORED — assigned a side, a basis and a verdict, with the span quoted? It
# does NOT check whether the rule is right. A human decides that per span; this file only refuses to
# let the decision go unmade, and refuses to let a made decision quietly change.
#
# WHERE THE POPULATION COMES FROM, AND WHY NOT FROM HERE. extract_citations.py evaluates
#     QUOTES .claude/extract_citations.py
#     > is there a ')' between head and year
# at the decision site and writes the answer onto whichever
# artifact the span produces (parenBetweenHeadAndYear, on records and on paren-shadow absences). This
# file reads that flag and never re-derives the geometry: a rule implemented twice drifts, and the
# copy that drifts is the one the corpus is not run through. The single geometric assertion made here
# is the containment CHECK — a paren-shadow absence whose flag is False would be closed_year_paren
# firing on a span with no ')' in it, i.e. the rule leaving its own stated shape.
#
# ITS RELATION TO THE OTHER THREE CITATION INSTRUMENTS, since the family is now four:
#   citation_reach_check   years that produced NO record, by kind. Owns paren-shadow's COUNT.
#   citation_head_check    the author STRING on records, as a closed partition over head shapes.
#   citation_crosscheck    a record against the actual source. The only one that can catch a WRONG
#                          attribution, which is the class none of the other three reach.
#   this file              the DECISIONS of one rule that spans the record/absence boundary — the
#                          only place where a span's presence on one side rather than the other is
#                          itself the thing under examination.
#
# WHY NOT FIXTURES, WHICH ALREADY PIN ALL FOUR SPANS. Because a fixture pins ONE span and cannot
# notice a FIFTH arriving in a file nobody transcribed — the same reason citation_head_check.py
# exists next to the fixtures that pin four of its heads. The fixtures prove the rule still behaves
# on known text; this proves no new instance slipped past unscored. Both, not either.
#
# THE FRICTION COST, STATED PLAINLY: every new corpus sentence that puts a ')' between an author and
# a year fails the battery until someone reads the span and writes an entry. At 120 cancers that will
# happen some tens of times. That is the intended price — it is exactly the "gets scored" the ruling
# asked for, and an unscored span is cheaper to write an entry for than to find later.
#
# CONDITION (7): --selftest proves this can FIRE in every direction it claims — unscored, stale, side
# moved, falsified, and the rule leaving its shape — and that a fully scored population is clean.
# Condition (7-bis): the DONE line prints LAST, after the sidecar and the full per-span listing, so a
# report of zero is shown to have been produced rather than inferred from silence.
#
# AND SHOWN ON REAL OUTPUT, WHICH IS THE STANDARD SYNTHETIC ARMS DO NOT MEET. Re-runnable, so this is
# evidence rather than a claim about evidence:
#
#     mkdir -p /tmp/pl/js/organs && cp js/organs/lungs.js /tmp/pl/js/organs/
#     sed -i '' 's/2015 (WHO) & 2011/2015 (WHO 2015) & 2011/' /tmp/pl/js/organs/lungs.js
#     cd /tmp/pl && python3 <repo>/.claude/citation_paren_ledger.py js/organs/lungs.js
#
# That is the ONE-WORD edit named above as the falsifying shape, applied to real corpus text. The
# result, 2026-09-07: "SIDE MOVED Travis|2011|js/organs/lungs.js:236: scored as KEPT, the rule now
# says SPENT", exit 3. So the scenario in which this rule deletes a TRUE record is not merely
# described in this header — it has been produced, and the instrument named it. (The run also emits
# three STALE problems, because a single-file invocation puts the colon.js and liver.js spans out of
# scope. Expected, and left in the transcript rather than filtered: a demonstration that hides its own
# noise is a demonstration of something else.)
#   THE `:236` IN THAT QUOTED RESULT IS LEFT WRONG ON PURPOSE, because it is not a claim about this
# tree — it is what the run printed on 2026-09-07, and the line it names is the line the span sat on
# that day. Re-running the recipe now prints `:268`: a 21-line comment block went in above the span
# later the same day, and a nine-line one on 2026-09-08, and each moved it. The recipe still
# reproduces, because every step of it matches on TEXT rather than on a line number, which is the
# property that let it survive both moves at all — twice in two days is the rate to expect, so the
# address in a transcript is worth less than the recipe that regenerates it.
# Rewriting a dated transcript to agree with a tree it predates would make it a worse record, not a
# fresher one — so the correction is this sentence and not an edit to the quote.
#
# SEQUENCING (user ruling, 2026-09-07, as corrected the same day): "an audit must not ship in the same
# commit as the change it would have recorded. Sensors, readers, and fixtures travel with it freely."
# This file was BORN in a commit that does not change the corpus, so the four entries below are scored
# against state that already existed and is independently in git.
#   THAT SENTENCE SAID "ships" UNTIL 2026-09-08, WHEN IT STOPPED BEING TRUE OF THE CURRENT COMMIT and
# had to be scoped rather than deleted. A corpus change moved one entry's line, so the re-address has
# to travel WITH that change — leaving it for a later commit would ship a tree whose own ledger reports
# two problems, and gating the tree you commit rather than the tree you work in is the whole point. The
# ruling is not violated by that: what may not ship beside an audit is the audit's SUBJECT, and this
# commit contains no paren span the ledger would newly record. It moved one that was scored at 4263890
# and left its bytes alone. An entry re-addressed by a corpus change is a reader following its subject,
# not an audit witnessing itself.
#
# THIS FILE IS THE CASE THE CORRECTION WAS MADE ON, which is why the earlier wording ("an audit that
# ships alongside its subject cannot witness it") is quoted here and not just replaced: read literally,
# it condemned this very commit, because `parenBetweenHeadAndYear` in extract_citations.py ships right
# here beside the ledger that reads it. But the flag is this audit's SENSOR, not its subject — the
# subject is four spans and a rule already in history at 4263890, with the rule's effect already
# recorded as `-` lines in record_count.json. Contrast 1bda280, which HAD to precede its change,
# because record_keys are the baseline a removal is absent from. Full reasoning in commit_checked.sh's
# header, where a commit boundary actually gets drawn.
#
# Usage: python3 .claude/citation_paren_ledger.py [--selftest] [file ...defaults to js/organs/*.js]
# `glob` is gone from this import on purpose: main()'s default population globbed js/organs/ and now
# comes from corpus_paths(), below.
import json, os, sys
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it produced no DONE line (corpus_paths() returns repo-relative names). Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# extract() fills an absences list as it goes, so one pass yields BOTH sides of the split.
# citation_reach_check.py imports unreached_spans() instead because it wants the absences alone.
# corpus_paths() IS THE SECOND IMPORT FOR A REASON: this file's default population was its own copy of
# `sorted(glob.glob('js/organs/*.js'))`, identical to the extractor's and free to drift from it. It
# reads git's index now — `basis_test` here is RATCHETED, and a ratcheted metric must derive from
# tracked files (user ruling, 2026-09-07) — and importing it rather than re-deriving it means the
# ledger and the extractor cannot disagree about what the corpus is, which is the same defect one
# directory over that made internal_quote_check and battery.py disagree about .claude/.
from extract_citations import extract, corpus_paths

SIDES = ('SPENT', 'KEPT')          # the rule fired / the rule declined
BASES = ('FIT', 'TEST')            # informed the rule / arrived after it
SCORINGS = ('CONFIRMS', 'FALSIFIES')

# Keyed '<head>|<year>|<file>:<line>'. Values name the side the span is on, the basis of the entry,
# the verdict, and a reason that QUOTES the span — the cheapest sufficient form of a checkable
# declaration, per citation_reach_check.py's rule: a reader confirms an entry by comparing two
# strings on this page, without taking a measurement or trusting a conclusion.
#
# THE KEY FORMAT IS battery.py's record_key() FORMAT, DUPLICATED KNOWINGLY, so an entry here can be
# grepped straight against .claude/record_count.json's record_keys — which is the composition audit
# and therefore the one place a reader can confirm the KEPT side really is a live record. Importing
# record_key from battery.py would invert the dependency (the runner imports its members, not the
# reverse); the same knowing-duplication note sits on DONE_LINE_RE in commit_checked.sh and
# battery.py, which name each other for the same reason.
#
# On the SPENT side the head shown is the extractor's absence `key`, which is the head text it could
# not attribute — not a corrected author name. 'Fearon' below is the head of "Fearon &amp;
# Vogelstein"; that truncation is P_AMP's business, not this rule's.
PREREGISTERED = {
    'Fearon|1991|js/organs/colon.js:169': {
        'side': 'SPENT',
        'basis': 'FIT',
        'scored': 'CONFIRMS',
        'reason':
            'colon.js:169 reads "Fearon &amp; Vogelstein (Cell, 1990) NEVER NAMES APC — the gene '
            'wasn\'t cloned until 1991". The paren carries 1990, the paper\'s own year, and closes; '
            '1991 is the date APC was CLONED, an event, not a publication by these authors. A record '
            'Fearon|1991 would assert a paper that does not exist. Removed as a false record in '
            '4263890 by this rule, which is the strongest form of its being right here.',
    },
    'Powell|1990|js/organs/colon.js:172': {
        'side': 'SPENT',
        'basis': 'FIT',
        'scored': 'CONFIRMS',
        'reason':
            'colon.js:172 reads "cites Powell et al. (Nature, 1992) for APC-comes-first, and quotes '
            'the 1990 model for what". The paren carries 1992, Powell\'s year, and closes; the 1990 '
            'belongs to the Fearon-Vogelstein model being quoted, whose citation is three lines up. '
            'Also removed in 4263890. This is the span whose pairing with Travis falsified the claim '
            'that the two are structurally identical — a \')\' separates them.',
    },
    'Schulze|2017|js/organs/liver.js:280': {
        'side': 'SPENT',
        'basis': 'FIT',
        'scored': 'CONFIRMS',
        'reason':
            'liver.js:280 reads "other French cohorts (Schulze et al., Nature Genetics, 2015) and a '
            'mixed TCGA cohort (Nature, 2017, 44%)". Schulze\'s paren carries 2015 and closes before '
            'the 2017, which belongs to the TCGA paper — a Consortium publication with no personal '
            'author in the span at all. Removed in 4263890. This is the START=0 case named in '
            'closed_year_paren\'s docstring: the \'(\' opened before the head.',
    },
    # RE-ADDRESSED 236 -> 259 on 2026-09-07 when a 21-line comment block went into lungs.js above it,
    # AND 259 -> 268 on 2026-09-08 when a nine-line one did the same thing.
    # THE SPAN DID NOT CHANGE — it is byte-identical, and that was checked by matching the OLD line's
    # exact content against the working copy and finding ONE occurrence, not by adding an offset. So
    # BASIS STAYS FIT: an address is not an identity, and re-addressing a span is not new evidence.
    # Scoring this as TEST because its line number moved would have manufactured support for the very
    # rule it is here to withhold support from. That one insertion staled this key, the two backfill
    # refs pointing at the same span, and nothing else that is checked — see (2-quater) in js/panel.js.
    #   THE SECOND MOVE IS THE REASON THIS NOTE IS WORTH ITS LENGTH. Both problems the 2026-09-08 run
    # raised on this entry (STALE at the old address, UNSCORED at the new one) describe ONE span that
    # moved, and the instrument's own remediation text — written for the case where a span genuinely
    # arrives — asks for a new entry with basis TEST. Taking that literally would have raised
    # `basis_test` off 0 on a span this rule was FIT to, which is the one number here that is supposed
    # to be hard to move. An instrument cannot tell arrival from relocation, so the human does, and the
    # test is CONTENT: same bytes, one occurrence, re-address. Different bytes would be a real arrival.
    'Travis|2011|js/organs/lungs.js:268': {
        'side': 'KEPT',
        'basis': 'FIT',
        'scored': 'CONFIRMS',
        'reason':
            'lungs.js:268 reads "Travis et al., J Thorac Oncol, 2015 (WHO) & 2011 (IASLC/ATS/ERS)". '
            'A \')\' does sit between head and 2011, so this span is in the population — but "(WHO)" '
            'carries no year, so the rule declines and the record stands. Travis et al. really did '
            'author both classifications. THIS IS THE COUNTEREXAMPLE THE "CARRYING A YEAR" NARROWING '
            'WAS INVENTED FOR, so its basis is FIT and it is worth no support at all: had the corpus '
            'written "(WHO 2015)" the rule would delete a TRUE record, and nothing here prevents '
            'that. It is the span to re-read first when this rule next comes up.',
    },
}


def shape_problem(absence, key):
    """The one geometric assertion this file makes, factored out so the selftest can exercise the
    REAL code path. It cannot reach it through population(), which builds its own absences by calling
    extract(); an arm that re-implemented this test would be proving its own copy works."""
    if absence.get('parenBetweenHeadAndYear'):
        return None
    return (f'RULE LEFT ITS SHAPE at {key}: closed_year_paren() refused this head, but the span has '
            'no \')\' between head and year. The rule is named for a CLOSED parenthetical; firing '
            'without one means it now refuses heads for some other reason, and the claim this file '
            'pre-registers is no longer the claim the code implements.')


def population(paths):
    """Every span where a ')' sits between an author head and its year, from BOTH artifacts.

    Returns (by_key, shape_problems). by_key maps the record key to its side. shape_problems holds
    the one geometric assertion this file makes: the rule cannot fire on a span whose flag is False.

    THE FLAG IS READ, NEVER RECOMPUTED — see the header. A record or absence produced by an older
    extractor that does not write the flag at all would silently have an empty population here, so a
    missing key is treated as a PROBLEM rather than as False."""
    absences = []
    records = extract(paths, absences)
    by_key, problems = {}, []
    for record in records:
        if 'parenBetweenHeadAndYear' not in record:
            problems.append(f'NO FLAG on record {record["author"]}|{record["year"]}|{record["ref"]} — '
                            'extract_citations.py must write parenBetweenHeadAndYear on every record '
                            'it keeps. Without it this ledger has no population and reports zero '
                            'problems over nothing, which reads exactly like a clean corpus.')
            continue
        if record['parenBetweenHeadAndYear']:
            by_key[f'{record["author"]}|{record["year"]}|{record["ref"]}'] = 'KEPT'
    for absence in absences:
        if absence['kind'] != 'paren-shadow':
            continue
        key = f'{absence["key"]}|{absence["year"]}|{absence["file"]}:{absence["line"]}'
        shape = shape_problem(absence, key)
        if shape:
            problems.append(shape)
        by_key[key] = 'SPENT'
    return by_key, problems


def evaluate(by_key):
    """Returns problems. Four directions, each a different way the pre-registration can rot.

    UNSCORED is the growth the ruling asked to stop, and the only one that will fire routinely.
    STALE is its reverse — an entry for a span that is gone, which is how a scoring outlives its
    subject. SIDE MOVED is the interesting one: the span is still there and the rule now decides it
    differently, so either the rule or the corpus text changed under a recorded verdict. FALSIFIED is
    the claim actually failing; it is a problem so that a known-wrong deletion cannot sit in the
    corpus behind a green battery.

    A SOUND CHECK CAN CARRY STALE ADVICE, AND THAT IS A DISTINCT FAILURE CLASS (user ruling,
    2026-09-08). Twice now, a relocated span has produced UNSCORED here and the remediation text has
    told the reader to add a basis-TEST entry — which would lift the one ratcheted number measuring
    this rule's real evidence off zero on the strength of a line-number change. The DETECTION was right
    both times: the key really was absent, and saying so is a measurement. The INSTRUCTION was wrong
    both times, because it assumed arrival, which is the one thing the check cannot see. So the two
    halves of a problem string have different standing — the finding is evidence, the fix is a
    SUGGESTION written by whoever last thought about the failure, and nothing in the output marks which
    is which.
      WHY THIS IS HARDER TO CATCH THAN A WRONG CHECK: every gate in this chain trains the reflex to do
    what the output says, and a green-when-obeyed instrument giving confident wrong instructions never
    looks like it is failing. A red check invites suspicion; correct-detection-plus-stale-advice does
    not. The defence is not to distrust instruments generally — it is to notice that a remediation
    sentence is an argument, and to check its premise. Here the premise was "this span arrived", and
    one look at the accompanying STALE problem refuted it.
      THE ADVICE ITSELF IS NOW FIXED rather than only annotated, because a note in a docstring does not
    reach the person reading a failure at the terminal: UNSCORED's text now says to rule out relocation
    first, and how."""
    problems = []
    for key in sorted(by_key):
        if key not in PREREGISTERED:
            problems.append(
                f'UNSCORED PAREN SPAN {key} (rule says {by_key[key]}). A \')\' sits between this head '
                'and its year, so the pre-registered claim — a closed year-bearing parenthetical '
                'spends the head — was exercised on it. Read the span, decide whether the rule got it '
                'right, and add an entry to PREREGISTERED with side, basis TEST, a verdict of '
                'CONFIRMS or FALSIFIES, and the span quoted. Basis is TEST, not FIT: the rule was '
                'already written when this span arrived, so this is evidence and the four FIT entries '
                'are not. FIRST CHECK WHETHER IT ARRIVED AT ALL: if a STALE SCORING problem names the '
                'same head and year, this is probably ONE existing span whose line moved, and the two '
                'problems are its removal and its arrival. Take the OLD entry\'s line text, find its '
                'one occurrence in the new file, and if the bytes are identical RE-ADDRESS the existing '
                'entry and keep its basis. Scoring a relocation as TEST would manufacture evidence for '
                'this rule out of a line-number change, and TEST is the only number here that counts.')
    for key, entry in sorted(PREREGISTERED.items()):
        if key not in by_key:
            problems.append(
                f'STALE SCORING {key}: scored {entry["scored"]} on the {entry["side"]} side, but no '
                'such span is in the population any more. If the sentence was rewritten or the record '
                'removed, delete the entry in the same commit — and if its basis was TEST, say so in '
                'the message, because deleting a TEST is deleting this rule\'s only real evidence.')
            continue
        if by_key[key] != entry['side']:
            problems.append(
                f'SIDE MOVED {key}: scored as {entry["side"]}, the rule now says {by_key[key]}. The '
                'span is still in the population, so this is not an edit that removed it — either the '
                'corpus text changed inside the parenthetical or closed_year_paren() changed. Re-read '
                'the span and re-score it deliberately; a verdict recorded against the other side is '
                'worse than no verdict, because it looks examined.')
        if entry['scored'] == 'FALSIFIES':
            problems.append(
                f'FALSIFIED at {key}: this entry records the pre-registered claim FAILING on a real '
                f'span — a closed year-bearing parenthetical that does NOT spend its head. The rule '
                f'is therefore wrong here and its decision ({entry["side"]}) is wrong with it. Fix '
                f'the rule, or narrow it further as "carrying a year" already narrowed it, or restore '
                f'the record by hand; a FALSIFIES entry is not a disposition the battery will carry.')
    return problems


def sidecar_metrics(by_key, problems):
    """Derived from the measured population and the dict, never asserted alongside them. The two
    basis counts are over SCORED spans only, so basis_fit + basis_test == population - unscored, and
    a selftest arm holds that identity — the header's claim that basis_test measures this rule's
    support is only true if nothing else can land in it."""
    scored = [PREREGISTERED[key] for key in by_key if key in PREREGISTERED]
    return {
        'population': len(by_key),
        'spent': sum(1 for side in by_key.values() if side == 'SPENT'),
        'kept': sum(1 for side in by_key.values() if side == 'KEPT'),
        'preregistered': len(PREREGISTERED),
        'basis_fit': sum(1 for entry in scored if entry['basis'] == 'FIT'),
        'basis_test': sum(1 for entry in scored if entry['basis'] == 'TEST'),
        'scored_confirms': sum(1 for entry in scored if entry['scored'] == 'CONFIRMS'),
        'scored_falsifies': sum(1 for entry in scored if entry['scored'] == 'FALSIFIES'),
        'problems': len(problems),
    }


def selftest():
    # Declared up front because arm 7 rebinds it: Python forbids the declaration appearing after any
    # use of the name in the same function, and arms 1-4 read it long before arm 7 needs it. The same
    # note sits on citation_head_check.py's selftest, where the ordering was found the hard way.
    global PREREGISTERED
    ok, ran, failures = True, 0, 0

    def arm(label, cond, detail=''):
        nonlocal ok, ran, failures
        ran += 1
        if cond:
            print(f'  ok   {label} {detail}'.rstrip())
        else:
            print(f'  FAIL {label} {detail}'.rstrip())
            ok = False
            failures += 1

    # arm 1: the enumerations are respected by every live entry. A verdict misspelt 'FALSIFES' would
    # otherwise read as "not FALSIFIES" and pass as a confirmation — a typo inverting a finding.
    bad = [key for key, entry in PREREGISTERED.items()
           if entry['side'] not in SIDES or entry['basis'] not in BASES
           or entry['scored'] not in SCORINGS]
    arm('every entry uses a declared side, basis and verdict', not bad, str(bad))

    # arm 2: the >80-char reason bar, the same one citation_reach_check.py holds its declarations to.
    # It measures LENGTH and not content — that limitation is recorded there, along with why the
    # quotes-the-span form is required by rule and not by machine.
    short = [key for key, entry in PREREGISTERED.items() if len(entry['reason']) <= 80]
    arm('every reason clears the 80-char floor', not short, str(short))

    # arm 3: FIT is a claim about history and must not be usable for new spans. Nothing can enforce
    # that from inside the file, so what is checked is the honest surrogate: FIT entries are exactly
    # the four the rule was written on, listed here so a fifth FIT entry has to edit this arm and say
    # why in a commit message.
    fit_at_birth = {
        'Fearon|1991|js/organs/colon.js:169',
        'Powell|1990|js/organs/colon.js:172',
        'Schulze|2017|js/organs/liver.js:280',
        # Re-addressed 236 -> 259 -> 268, same span, byte-identical each time (see the entry's own
        # note). "At birth" names the set of SPANS, not the set of addresses; if this arm were left
        # pinned to a stale address it would fail for the one reason that says nothing about the rule's
        # shape. Two re-addresses in two days: the arm's cost is one line per insertion above the span,
        # and that is the price of pinning identity to something a comment block can move.
        'Travis|2011|js/organs/lungs.js:268',
    }
    fit_now = {key for key, entry in PREREGISTERED.items() if entry['basis'] == 'FIT'}
    arm('FIT is still exactly the four spans the rule was fit to', fit_now == fit_at_birth,
        f'extra {sorted(fit_now - fit_at_birth)}' if fit_now - fit_at_birth else '')

    # arm 4: UNSCORED fires, and fires ALONE on an otherwise fully scored population. Built by
    # scoring every live entry and adding ONE intruder — the shape citation_head_check.py's arm 2 was
    # corrected into after a two-element population staled every declaration and drowned the finding.
    scored_clean = {key: entry['side'] for key, entry in PREREGISTERED.items()}
    intruder = dict(scored_clean)
    intruder['Newcomer|2027|js/organs/thyroid.js:99'] = 'SPENT'
    grew = evaluate(intruder)
    arm('UNSCORED fires on a new span, alone on a scored population',
        len(grew) == 1 and grew[0].startswith('UNSCORED PAREN SPAN Newcomer|2027'),
        str(grew[:2])[:90])

    # arm 5: STALE fires when a scored span leaves the population.
    dropped = dict(scored_clean)
    dropped.pop('Travis|2011|js/organs/lungs.js:268')
    stale = [p for p in evaluate(dropped) if p.startswith('STALE SCORING')]
    arm('STALE fires when a scored span is gone', len(stale) == 1, str(stale[:1])[:90])

    # arm 6: SIDE MOVED fires. This is the arm with no analogue in the other instruments: it is the
    # rule CHANGING ITS MIND about a span already ruled on, which produces no count change anywhere
    # else in the chain — the population, the record total and the paren-shadow count are all
    # invariant under a KEPT/SPENT swap, so without this arm the event is completely silent.
    flipped = dict(scored_clean)
    flipped['Travis|2011|js/organs/lungs.js:268'] = 'SPENT'
    moved = [p for p in evaluate(flipped) if p.startswith('SIDE MOVED')]
    arm('SIDE MOVED fires when the rule re-decides a scored span', len(moved) == 1,
        str(moved[:1])[:90])

    # arm 7: FALSIFIED fires. Condition (7) on the one branch that reports the claim FAILING — a
    # detector for an event that has never happened is exactly the kind this project has twice found
    # to be incapable of firing at all. The live dict is restored immediately after.
    saved = PREREGISTERED
    PREREGISTERED = dict(saved)
    PREREGISTERED['Bad|2028|js/organs/thyroid.js:1'] = {
        'side': 'SPENT', 'basis': 'TEST', 'scored': 'FALSIFIES',
        'reason': 'selftest fixture only, never present in a live run. Written to the same 80-char '
                  'floor arm 2 holds live entries to, though arm 2 has already run by here.',
    }
    falsified = [p for p in evaluate({'Bad|2028|js/organs/thyroid.js:1': 'SPENT'})
                 if p.startswith('FALSIFIED at')]
    arm('FALSIFIED fires on an entry recording the claim failing',
        len(falsified) == 1 and 'decision (SPENT) is wrong' in falsified[0], str(falsified[:1])[:90])
    PREREGISTERED = saved

    # arm 8: the passing direction. A gate that flags everything is as useless as one that flags
    # nothing, so the fully scored live population must be clean.
    clean = evaluate(scored_clean)
    arm('a fully scored population is clean', not clean, str(clean[:1])[:90])

    # arm 9: RULE LEFT ITS SHAPE fires, through shape_problem() itself rather than through a copy of
    # its test — which is the whole reason that check is a function and not four inline lines.
    ghost = {'kind': 'paren-shadow', 'key': 'Ghost', 'year': '2029',
             'file': 'js/organs/thyroid.js', 'line': 7, 'parenBetweenHeadAndYear': False}
    fired = shape_problem(ghost, 'Ghost|2029|js/organs/thyroid.js:7')
    held = shape_problem(dict(ghost, parenBetweenHeadAndYear=True), 'Ghost|2029|x:7')
    arm('RULE LEFT ITS SHAPE fires on a flag-False paren-shadow and not on a flag-True one',
        fired is not None and 'RULE LEFT ITS SHAPE at Ghost|2029' in fired and held is None,
        str(fired)[:70])

    # arm 10: the sidecar identity the header's support claim rests on. If anything but a scored
    # entry could land in basis_fit or basis_test, basis_test would stop being "spans that tested the
    # claim" and the ratchet would be guarding a different number than the one advertised.
    metrics = sidecar_metrics(scored_clean, [])
    arm('basis_fit + basis_test == scored spans, and scored == population when clean',
        metrics['basis_fit'] + metrics['basis_test'] == metrics['population']
        and metrics['spent'] + metrics['kept'] == metrics['population'],
        json.dumps(metrics, sort_keys=True))

    print(f'DONE citation_paren_ledger_selftest: {ran} arms run, {failures} failures')
    return ok


def main():
    paths = [a for a in sys.argv[1:] if not a.startswith('--')] or corpus_paths()
    by_key, problems = population(paths)
    problems = problems + evaluate(by_key)

    print(f'citation_paren_ledger: {len(paths)} files, {len(by_key)} spans with a \')\' between head '
          f'and year')
    # Every span printed with its scoring, on every run. A pre-registration nobody reads is a
    # pre-registration nobody is held to, and the FIT/TEST column is the whole point of the file.
    for key in sorted(by_key):
        entry = PREREGISTERED.get(key)
        if entry is None:
            print(f'  UNSCORED  {by_key[key]:<5}  {key}')
            continue
        print(f'  {entry["scored"]:<9} {by_key[key]:<5}  basis {entry["basis"]:<4}  {key}')
    for p in problems:
        print(f'  PROBLEM: {p}')

    print('SIDECAR ' + json.dumps({
        'name': 'citation_paren_ledger',
        'metrics': sidecar_metrics(by_key, problems),
        # basis_test ONLY, and the reasoning is in the header: it is the count of spans that actually
        # tested the claim, it starts at 0, and its decrease means scored evidence was deleted or
        # downgraded to FIT. The other metrics are either defect counts (problems) or facts about the
        # corpus that may legitimately fall. A legitimate decrease has --lower-ratchet, which leaves
        # a diff in record_count.json; dropping this key instead is caught by vanished_ratchets().
        'ratchet': ['basis_test'],
    }, sort_keys=True))
    # DONE last (condition 7-bis), after the sidecar and the full listing. The denominator is named
    # because a count in a DONE line without one is the drift class this chain keeps finding.
    metrics = sidecar_metrics(by_key, problems)
    print(f'DONE citation_paren_ledger: {len(by_key)} paren spans '
          f'({metrics["spent"]} spent, {metrics["kept"]} kept), '
          f'{metrics["preregistered"]} scored ({metrics["basis_test"]} as TEST, '
          f'{metrics["basis_fit"]} as FIT and worth no support), '
          f'{metrics["scored_falsifies"]} falsifying, {len(problems)} problems')
    if problems:
        sys.exit(3)


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
