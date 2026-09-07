# Internal quoted-span check (2026-09-07). The INWARD face of the quoted-span shape recorded in
# CLAUDE.md under "THE QUOTED-SPAN CHECK". That one compares code against ARCHIVED SOURCE TEXT; this
# one compares one file in this repo against another file in this repo.
#
# WHY THE INWARD ONE IS THE EASY CASE, and why it got built first even though the outward one was
# recorded first: both sides are in the repo. No fetch, so no network failure mode. No transliteration
# of a source that ships non-ASCII, so no Unicode-normalisation policy — the precondition the outward
# check still needs. No figure-derived numbers, so no declared-marker escape hatch. Everything that
# made the outward one a design problem is absent here, and what is left is a string comparison.
#
# WHY IT EXISTS: THE SAME FAILURE, FOUR TIMES IN ONE DAY (2026-09-07). The ruling that ordered this
# file said the failure had happened twice. A survey found a third before the file was written, and the
# file's own first live run found a fourth — which is the chain's recorded lesson about hand-assembled
# enumerations growing on contact, arriving inside the enumeration of the reason for the instrument.
#   1. battery.py's assertion 2 quoted record_sync_check.py's caveat "verbatim". Editing that
#      sentence over there left the copy here no longer verbatim, and nothing checked it. Repaired by
#      quoting less and exactly. THAT IS THIS FILE'S BIRTH FIXTURE, run against the live target with
#      the historical bytes taken from cc31b3f~1 rather than reconstructed from memory.
#   2. Moving the sidecar convention into battery.py's labelled block left a demonstrative behind:
#      the moved text opened "the wrong way to close those two" while the referent stayed in item 4.
#      NOT REACHABLE FROM HERE, and the reason is worth stating rather than glossing — see
#      WHAT THIS CANNOT DO below. It is why the remedy for demonstratives is deletion, not a checker.
#   3. citation_head_check.py quoted citation_reach_check.py's blind-spot span "verbatim" and the copy
#      substituted single quotes for the source's double quotes around 'every year is filed
#      correctly'. Found by the survey that preceded this file, i.e. by hand, one more time. TWO
#      CHARACTERS, in a span whose own sentence says verbatim — arms 12 and 13, real bytes both sides.
#   4. battery.py's anchor-family entry (2) joined TWO SEPARATE spans of commit_checked.sh with a
#      slash inside one pair of quote marks. The composite existed in no file. Found by THIS FILE, on
#      its first live run, in the file that hosts the family enumeration it was being added to — a
#      compression wearing the clothes of a quotation, which is the defect the OUTWARD check was
#      recorded to catch. The only one of the four not found by a human reading carefully.
#
# TWO SUB-SHAPES, AND (4) IS THE SECOND ONE (user, 2026-09-07, on reading the first live run). This
# file was built for DRIFT: the target moves or is reworded, and a copy that was once exact stops
# being exact. What it found first was FABRICATION: each half verbatim, the whole invented, existing
# in no file AT ANY TIME. The distinction is not academic and it changes the repair.
#   DRIFT HAS A MOMENT WHEN IT WAS TRUE. Its repair is mechanical — re-quote the source, or quote
#   less of it, which is what (1) and (3) got.
#   FABRICATION NEVER DID. Re-quoting cannot repair it, because there is no source span to return to;
#   (4) had to be RESTRUCTURED into two markers, one per real span, and the composite abandoned. A
#   reader who assumes drift will go looking for the version of commit_checked.sh that said it, and
#   there isn't one.
# The check does not distinguish them — both surface as NOT FOUND, 0 occurrences — and it does not
# need to: the flag says the span is not in the target, and which sub-shape it is becomes obvious the
# moment a human looks for the source. Worth naming here so the reader knows both are in range, and
# so nobody narrows the instrument's purpose to "keeping copies in sync with their originals".
#
# AND IT IS THE SAME DEFECT CLASS THE ATLAS'S CITATIONS WERE AUDITED FOR, FOUND IN THE TOOLING PROSE
# (user, 2026-09-07 — the strongest evidence in this arc that the discipline transfers rather than
# being about citations specifically). Three instances in one day of QUOTE MARKS ASSERTING MORE THAN
# THEIR CONTENT SUPPORTS: brain.js quoting Wippold's "garlandlike" as "garland-like"; the prostate
# TCGA span whose framing was wrong while its text was exact; and (4) here. Same failure, same
# technique that found it, one side of the repo apiece. A fourth instance if trailing punctuation
# tucked inside the quote marks counts, which is the same assertion made one character at a time.
#
# THE GAP IT CLOSES, NAMED IN battery.py's OWN HEADER before this existed:
#
#     QUOTES .claude/battery.py
#     > quoted-span check covers code quoting archived sources, and SYNC covers manifest-to-document
#     > pairs, so a quotation from one instrument header into another falls between them.
#
# That sentence was itself an UNMARKED internal quote in this header until the marking pass reached
# it, in the file whose subject is unmarked internal quotes. Recorded, not quietly fixed: it is the
# absence hole under WHAT THIS CANNOT DO, arriving on day one, at the least excusable site available.
#
# ==================================================================================================
# THE CONVENTION. A marked quote is a MARKER LINE naming the target, then a GUTTER RUN holding the
# quoted text:
#
#     QUOTES .claude/record_sync_check.py
#     > an undeclared pair is invisible to this check, and the map is itself a record that
#     > can go stale (noted honestly; the alternative is a convention parser, which would
#     > be a bigger instrument than the failure justifies)
#
# THAT EXAMPLE IS LIVE, NOT ILLUSTRATIVE — it is a real marked quote in a scanned file, and the live
# run resolves it against record_sync_check.py like any other. Deliberate: documentation of a checked
# convention that is not itself checked is the rot this file exists for, and this repo's habit is to
# let the corpus be its own control. Consequence to know before editing it: rewording the example to
# illustrate something else will FIRE, with a message about this file's own header.
#
# The marker line, after its leading whitespace and one comment lead are stripped, must be EXACTLY
# `QUOTES <path>` — one path token, nothing else. The gutter run is the maximal run of IMMEDIATELY
# FOLLOWING lines whose stripped content begins with `>`. The quoted text is those lines joined and
# whitespace-collapsed. It PASSES when that text occurs EXACTLY ONCE in the target.
#
# THIS FILE IS A MEMBER OF THE FAMILY IT GUARDS (user, stating it before it could be discovered): the
# convention is a hand-typed anchor over files that also hold hand prose, which is battery.py's rule
# C exactly. So the two properties rule C demands are both here, and both are decided the way rule C
# says to decide them — by asking WHICH PROPERTY OF THE MATCH IS DECIDABLE, not by anchoring reflexively.
#
#   THE MARKER: POSITION. `QUOTES` must begin the stripped line. This is not precautionary — the
#   corpus already holds two lines with `QUOTES` mid-sentence, both meaning the English verb:
#   citation_head_check.py's "reason below QUOTES the corpus span it is about" and
#   citation_paren_ledger.py's "a reason that QUOTES the span". A substring matcher would read both
#   as markers and derive a path from the next word. Selftest arms 8 and 9 use those two lines
#   verbatim, so the anchor is demonstrated against the strings that would break it and not a fixture.
#   THOSE TWO POINTERS USED TO BE LINE NUMBERS — `citation_head_check.py:88` and
#   `citation_paren_ledger.py:125` — and both were stale by the time this file was committed, because
#   the same commit added a QUOTES block near the top of each target and pushed the lines down. A
#   file:line pointer in prose is the `:<anchor>` field this convention was ruled to DROP, still being
#   typed by hand where no checker reaches it. Naming the span instead costs nothing and cannot drift.
#
#   THE QUOTED SPAN: COUNT. The span must occur EXACTLY ONCE in the target. Zero and many are both
#   defects and they are DIFFERENT defects: zero is drift (the target moved or was reworded), many
#   means the span does not identify a place, so "it is in the target" would be a coincidence.
#
# THE QUOTE IS ITS OWN ANCHOR — AND THAT IS A DEVIATION FROM THE FORM AS SKETCHED, flagged here with
# its reason rather than adopted quietly. The instruction named `QUOTES <file>:<anchor>`, i.e. a
# separate hand-typed anchor string locating the span. Dropped, because the uniqueness rule makes it
# both redundant and harmful: redundant because a span occurring exactly once already resolves to
# exactly one place, and harmful because a second hand-typed string is a second thing that can rot
# with nothing checking IT against the quote. The outcome the instruction asked for — "each anchor
# resolvable to exactly one span" — is delivered, by the span rather than beside it. The location is
# then DERIVED and reported (see the line number in each PASS-side report) instead of being typed.
#
# WHY A `>` GUTTER RATHER THAN QUOTE MARKS, which was the first design and is wrong. Delimiting the
# region with `"` cannot express a quote CONTAINING `"`, and breakage 3 above is exactly that: the
# source says `as "every year is filed correctly"` and the copy had to downgrade the inner quotes to
# fit inside the outer pair. A convention that forces a transformation on the text it calls verbatim
# is self-defeating. The gutter has no nesting problem, needs no closing delimiter to forget, ends
# decidably (the run stops), and in markdown it is already the blockquote character.
#   A THIRD REASON, FOUND WHILE MARKING RATHER THAN WHILE DESIGNING: all three CLAUDE.md quotes the
#   marking pass reached carried a trailing `.` or `,` INSIDE the quote marks that the source does not
#   have — the ordinary typographic habit of tucking punctuation inside quotes, applied to a span
#   called verbatim. Each had to be trimmed to resolve. The gutter deletes the temptation rather than
#   catching it, because there is no closing quote mark to put anything inside of.
#
# NORMALISATION IS LINE-WRAP ONLY, and its one limitation is declared rather than discovered later.
# Per line, one comment lead is stripped (`#`, `//`, `*` followed by space, `>`); then all whitespace
# runs collapse to one space. Both sides get the same treatment, so the two homes may hard-wrap at
# different widths — which they do, and which is why a byte comparison was never an option. THE
# LIMITATION: a difference that is only whitespace is invisible to this check. That is the price of
# tolerating rewrapping, it is paid knowingly, and it is NOT the Unicode-normalisation question the
# outward check still owes — every byte here is this repo's own, written under one convention.
#
# WHAT THIS CANNOT DO, stated at birth because the population is the hole (user, in the same ruling:
# "an unmarked quote is invisible to it and that's the same absence-versus-decrease hole the ratchet
# has"). This check is TOTAL OVER MARKED SPANS and says nothing about the rest. The population "prose
# that is a quote" cannot be enumerated — the same shape as record_sync_check.py's undeclared-pair
# blind spot, and unclosable for the same reason. Two things narrow it, neither closes it:
#   - the marked count is RATCHETED, so deleting a marker to silence a fire fails the battery. The
#     cheap way to make a NOT FOUND go away is therefore blocked; the honest ways (repair the copy,
#     or delete quote and marker together with --lower-ratchet and a reason) both leave a record.
#   - it asks the AUTHOR for something at write time, which nothing else in this chain does. Every
#     other instrument derives its population from what is already written. Worth watching: if a
#     later session adds an internal quote without a marker, no instrument will notice.
# AND IT CANNOT REACH A DEMONSTRATIVE, which is breakage 2 and the reason that remedy is a prose
# sweep. "Those two" is not a quotation: there is no span to resolve and no target to compare, so
# there is nothing for a quoted-span checker to be right or wrong about. The nearest thing this file
# can demonstrate is a marked quote whose target has moved or vanished, which is arms 1 and 4.
# A quote of a file's OWN past state is refused rather than half-supported (arm 5, SELF TARGET):
# battery.py's "the wrong way to close those two" is precisely that, and its target does not
# exist in any present file. (That pointer read `battery.py:151` until the demonstrative sweep read
# it: the span has only ever been at 154 and then 155, so the line number was FABRICATED — never true
# at any commit — rather than merely stale. Breakage 4's sub-shape, in the header of the instrument
# built to catch breakage 4.)
#
# SCOPE. Markers are looked for in .claude/*.{py,sh,js,md} and CLAUDE.md — the .claude/ <-> CLAUDE.md
# boundary in BOTH directions, per the ruling, because dual-home records cross that line by design.
# TARGETS may be any path in the repo. That is a declared decision, not an oversight: refusing a
# target outside the marker scope would block a legitimate marking (a header quoting js/organs/*.js)
# for no gain, since resolving any repo path costs the same. A larger adjacent population exists and
# is deliberately UNMARKED — extract_citations.py's fixtures say "<file>:<line> verbatim" about corpus
# text dozens of times. Same defect class, and now mechanisable; not marked here because that is a
# reach change, and a reach change gets declared and measured on its own commit.
#
# NON-INSTRUMENT SCRATCH PATH: not applicable. Rule B in battery.py's labelled block covers a tool
# that OWNS A FILE; this one writes nothing and owns nothing, so it needs no override and no caller
# has to honour one. Stated rather than left silent, because "no artifact" is the thing a reader
# checking rule B compliance would otherwise have to infer.
#
# Condition (7) at birth: every failure class has an arm, and the four that matter are driven by REAL
# BYTES rather than fixtures, in fire/pass pairs so no arm proves only that the checker can say no —
# arms 1 and 2 on battery.py's historical stale quote of record_sync_check.py, arms 12 and 13 on the
# TWO-CHARACTER drift in citation_head_check.py's copy of citation_reach_check.py. It was also met a
# second way that no arm can preserve: on the FIRST LIVE RUN, after every site was marked exactly as
# it already read, the scan fired on two of eight and passed six, and the two were the two already
# known bad. That is the condition met on the corpus rather than on a fixture, and it is recorded here
# because the repair removed the evidence. Condition (8): a first run is
# calibration; read the second. 7-bis: DONE line last, after the sidecar. Wrapper form:
#   .claude/run_checked.sh "DONE internal_quote_check:" python3 .claude/internal_quote_check.py
import glob, json, os, re, sys

# The marker token is held in a NAME so no FIXTURE can become a marker: every fixture below composes
# its marker lines from this constant, and none writes one at line start. The header's worked example
# is the one literal marker in this file, and it is meant to be found. A fixture that leaked would
# name a path that does not exist and fire BAD PATH — loudly, which is the failure to prefer.
MARK = 'QUOTES'
SIGIL = '>'

# TWO LEADS, AND THE SPLIT IS LOAD-BEARING — arm 10 failed on the first version, which used one.
# CODE_LEAD is for FINDING a marker or a gutter line: it strips a comment opener only, so the `>`
# sigil survives to be seen. LEAD is for COMPARING text: it also strips `>`, because a target line in
# CLAUDE.md may be a markdown blockquote and the quote of it will not be. A single regex cannot do
# both — with `>` in it the sigil is eaten before detection (which is what broke), and without it a
# blockquoted target never matches. `*` requires a following space so markdown's `**bold**` survives;
# `-` and `+` are deliberately NOT stripped, so a quote spanning a markdown bullet must include the
# bullet. Conservative on purpose: stripping a leading hyphen would eat prose, and nothing needs it.
CODE_LEAD = re.compile(r'^[ \t]*(?:\#+|//+|\*(?=[ \t]))[ \t]?')
LEAD = re.compile(r'^[ \t]*(?:\#+|//+|\*(?=[ \t])|>)[ \t]?')

MALFORMED = 'marker line is not exactly "%s <path>"' % MARK
NO_QUOTE = 'marker with no gutter line after it'
EMPTY = 'gutter present but the quoted text is empty'
BAD_PATH = 'target file does not exist'
SELF_TARGET = 'target is the file the marker is in'
NOT_FOUND = 'quoted span is not in the target'
NOT_UNIQUE = 'quoted span occurs more than once in the target'

LABEL = {MALFORMED: 'MALFORMED MARKER', NO_QUOTE: 'NOTHING MARKED', EMPTY: 'EMPTY QUOTE',
         BAD_PATH: 'BAD TARGET', SELF_TARGET: 'SELF TARGET', NOT_FOUND: 'DRIFTED',
         NOT_UNIQUE: 'NOT AN ANCHOR'}


def stripped(line):
    """The line's content with indentation and ONE comment lead removed. Marker and gutter detection
    both work on this, so a marker reads the same in a .py comment, a .sh comment and markdown. Uses
    CODE_LEAD, not LEAD: the `>` sigil must still be there to be recognised."""
    return CODE_LEAD.sub('', line).strip()


def norm(text):
    """Comparison form: one comment lead off each line, then all whitespace runs collapsed. Applied
    to BOTH sides, which is what lets the two homes wrap at different widths."""
    return re.sub(r'\s+', ' ', ' '.join(LEAD.sub('', line) for line in text.split('\n'))).strip()


def scan(text):
    """Find marked quotes in one file's text.

    Returns (quotes, malformed):
      quotes    — [(line, path, span, gutter_lines)] for each well-formed marker
      malformed — [(line, content)] for each MARKER ATTEMPT that is not the strict form

    A marker attempt is a line whose stripped content is `QUOTES` alone or begins `QUOTES `. The
    POSITION ANCHOR lives here: prose using the word mid-sentence is not an attempt and is not
    reported, which is the only reason the two live mid-line mentions do not become fires. The
    distinction between "attempt" and "not a marker" is what lets a typo'd marker be loud without
    making English a defect."""
    lines = text.split('\n')
    quotes, malformed = [], []
    i = 0
    while i < len(lines):
        content = stripped(lines[i])
        if content != MARK and not content.startswith(MARK + ' '):
            i += 1
            continue
        parts = content[len(MARK):].split()
        if len(parts) != 1:
            malformed.append((i + 1, content))
            i += 1
            continue
        gutter = []
        j = i + 1
        while j < len(lines):
            c = stripped(lines[j])
            if c != SIGIL and not c.startswith(SIGIL + ' '):
                break
            gutter.append(c[1:])
            j += 1
        quotes.append((i + 1, parts[0], re.sub(r'\s+', ' ', ' '.join(gutter)).strip(), len(gutter)))
        i = j if j > i + 1 else i + 1
    return quotes, malformed


def check(files, targets):
    """files: {path: text} to scan for markers. targets: {path: text} for resolution — a path absent
    from this map is treated as a missing file, which is how BAD PATH is driven in-process.

    Returns (fires, verified). `verified` counts quotes resolving to EXACTLY ONE span, and is the
    only number the DONE line may report as checked — the found-over-declared rule, which this chain
    learned by printing len(SYNC) and calling it pairs checked.

    ONE KIND PER QUOTE, tested in the order a reader would want them: a structural problem with the
    marking outranks a problem with the target, because until the marker is well-formed there is no
    claim to evaluate."""
    fires, verified = [], 0
    for path in sorted(files):
        quotes, malformed = scan(files[path])
        for line, content in malformed:
            fires.append((path, line, content, MALFORMED, 0))
        for line, target, span, gutter_lines in quotes:
            if not gutter_lines:
                fires.append((path, line, target, NO_QUOTE, 0))
            elif not span:
                fires.append((path, line, target, EMPTY, 0))
            elif target == path:
                fires.append((path, line, target, SELF_TARGET, 0))
            elif target not in targets:
                fires.append((path, line, target, BAD_PATH, 0))
            else:
                hits = norm(targets[target]).count(span)
                if hits == 1:
                    verified += 1
                else:
                    fires.append((path, line, target, NOT_UNIQUE if hits else NOT_FOUND, hits))
    return fires, verified


# --- condition (7) fixtures: real bytes, not invented ones ----------------------------------------
# The stale copy as it stood in battery.py at cc31b3f~1, pulled from git rather than reconstructed.
# Its target sentence gained the clause "and pick a marker specific enough to match one place" on
# 2026-09-07, which is what made this copy fiction while it still claimed to be verbatim.
STALE_1 = ('DISCIPLINE: when a new dual-home record is created, add its pair here in the same '
           'commit — an undeclared pair is invisible to this check, and the map is itself a '
           'record that can go stale (noted honestly; the alternative is a convention parser, '
           'which would be a bigger instrument than the failure justifies).')
# The repaired copy now in battery.py: shorter, and cut to the part the argument needs.
REPAIRED_1 = ('an undeclared pair is invisible to this check, and the map is itself a record that '
              'can go stale (noted honestly; the alternative is a convention parser, which would '
              'be a bigger instrument than the failure justifies)')
# THE SECOND BIRTH FIXTURE, and the more useful one. citation_head_check.py's header quoted
# citation_reach_check.py's blind-spot declaration and called it "verbatim" — and the copy at HEAD
# substituted SINGLE quotes for the source's DOUBLE ones inside the span. Found by this instrument's
# first live run, 2026-09-07, and repaired in the same commit that introduced it. Kept because arm 1's
# drift is a whole rewritten sentence, which any comparison catches; this one is TWO CHARACTERS, in a
# span whose own sentence claims to be verbatim, which is the smallest drift the check must catch and
# the size a human reading both files side by side reliably misses. Real bytes from HEAD, both sides.
STALE_3 = ('THIS CHECK IS BLIND TO THAT FAILURE MODE BY CONSTRUCTION. It counts years that produced '
           "NO record; a year that produced the WRONG record is not an absence and will never appear "
           "here. Do not read a clean run as 'every year is filed correctly'.")
REPAIRED_3 = STALE_3.replace("'every year is filed correctly'", '"every year is filed correctly"')
# The two live mid-line uses of the word. Verbatim from the corpus; if either file is reworded these
# stop being the real thing, which is the same rot this instrument checks for and cannot check here.
PROSE_USES = [
    '# reason below QUOTES the corpus span it is about, which that file identified as the cheapest',
    '# the verdict, and a reason that QUOTES the span — the cheapest sufficient form of a checkable',
]


def marked(target, *body, lead='#   '):
    """Build a marked quote as file text. Never a literal marker line in this file's source."""
    return '\n'.join([f'{lead}{MARK} {target}'] + [f'{lead}{SIGIL} {b}' for b in body])


def selftest():
    ok = True

    def arm(good, label):
        nonlocal ok
        ok &= bool(good)
        print(f"  {'ok  ' if good else 'FAIL'} {label}")

    live_sync = open('.claude/record_sync_check.py', encoding='utf-8').read()
    targets = {'.claude/record_sync_check.py': live_sync}

    # arm 1: THE BIRTH FIXTURE. battery.py's historical stale quote, against the LIVE target file.
    # This is condition (7) on the real corpus: the bytes on both sides are real, the defect is the
    # one that happened, and the arm fails against the state of the world before this file existed —
    # which was that nothing looked at this pair at all.
    fires, verified = check({'.claude/battery.py': marked('.claude/record_sync_check.py', STALE_1)},
                            targets)
    arm(verified == 0 and any(k == NOT_FOUND for *_r, k, _h in fires),
        'FIRES on battery.py\'s historical stale quote of record_sync_check.py (real bytes)')

    # arm 2: the same pair AFTER the repair must PASS, against the same live file. Without this arm
    # arm 1 proves only that the checker can say no.
    fires, verified = check({'.claude/battery.py': marked('.claude/record_sync_check.py',
                                                          REPAIRED_1)}, targets)
    arm(verified == 1 and not fires,
        'PASSES the repaired quote of the same span in the same file')

    # arm 3: the span must be UNIQUE. A target holding it twice fires, and is not counted verified.
    # Fails against a `span in text` boolean, under which two occurrences read exactly like one.
    twice = {'.claude/record_sync_check.py': live_sync + '\n# ' + REPAIRED_1}
    fires, verified = check({'.claude/battery.py': marked('.claude/record_sync_check.py',
                                                          REPAIRED_1)}, twice)
    arm(verified == 0 and any(k == NOT_UNIQUE and h == 2 for *_r, k, h in fires),
        'FIRES when the span occurs twice in the target, and does not count it verified')

    # arm 4: A MARKED QUOTE WHOSE TARGET IS MISSING MUST FAIL LOUDLY (user, naming this one
    # explicitly). The silent-pass version of this instrument is the dangerous one: an unresolvable
    # target that reported nothing would leave a "verbatim" claim looking checked.
    fires, verified = check({'.claude/battery.py': marked('.claude/deleted_instrument.py', 'text')},
                            targets)
    arm(verified == 0 and any(k == BAD_PATH for *_r, k, _h in fires),
        'FIRES on a marked quote whose target file does not exist')

    # arm 5: SELF TARGET. A file quoting itself proves nothing — the span is trivially present, so a
    # naive check would report it verified. This is also how a quote of a file's OWN PAST STATE gets
    # refused rather than half-supported (battery.py's "those two" is exactly that shape).
    fires, verified = check({'.claude/battery.py': marked('.claude/battery.py', 'anything')},
                            {'.claude/battery.py': 'anything'})
    arm(verified == 0 and any(k == SELF_TARGET for *_r, k, _h in fires),
        'FIRES on a marker pointing at its own file')

    # arm 6: a marker with NO gutter line, and a marker whose gutter is empty. Both are a claim with
    # nothing behind it, and both would otherwise pass as "no span, no problem".
    fires, verified = check({'.claude/battery.py': marked('.claude/record_sync_check.py')}, targets)
    empty, _v = check({'.claude/battery.py': f'#   {MARK} .claude/record_sync_check.py\n#   {SIGIL}'},
                      targets)
    arm(verified == 0 and any(k == NO_QUOTE for *_r, k, _h in fires)
        and any(k == EMPTY for *_r, k, _h in empty),
        'FIRES on a marker with nothing marked, and on a gutter that is empty')

    # arm 7: MALFORMED. A marker with two tokens, and a bare marker with no path. Loud, because the
    # alternative is a typo that silently marks nothing.
    bad = f'#   {MARK} .claude/a.py .claude/b.py\n#   {MARK}\n'
    fires, _v = check({'.claude/battery.py': bad}, targets)
    arm(sum(1 for *_r, k, _h in fires if k == MALFORMED) == 2,
        'FIRES on a marker with two paths and on a marker with none')

    # arms 8 and 9: THE POSITION ANCHOR, driven by the two lines in the live corpus that use the word
    # as English. Arm 8 fails against a substring matcher — `MARK in content` reports both as markers
    # and takes "the" and "the" as paths. Arm 9 shows the anchor did not simply switch the check off.
    fires, verified = check({'.claude/battery.py': '\n'.join(PROSE_USES)}, targets)
    arm(not fires and verified == 0,
        'IGNORES the two live mid-line uses of the word (position anchor, not a substring)')
    mixed = '\n'.join(PROSE_USES + [marked('.claude/record_sync_check.py', REPAIRED_1)])
    fires, verified = check({'.claude/battery.py': mixed}, targets)
    arm(verified == 1 and not fires,
        'and still finds a real marker in the same file as those two lines')

    # arm 10: LINE-WRAP TOLERANCE, which is the whole reason for the normaliser. The same span
    # wrapped across three gutter lines at a width the target does not use must still resolve, and
    # in a target whose lines carry a DIFFERENT comment lead.
    # It also covers the markdown side of the scope: the marker carries NO comment lead at all, which
    # is how it will be written in CLAUDE.md, and that is the case the first version of CODE_LEAD got
    # wrong — this arm is the reason the two leads are separate.
    js_target = {'js/x.js': '// a rule implemented twice\n//  drifts, and    the\n'}
    fires, verified = check(
        {'CLAUDE.md': marked('js/x.js', 'a rule implemented', 'twice drifts,', 'and the', lead='')},
        js_target)
    arm(verified == 1 and not fires,
        'resolves a span rewrapped differently on each side, across two comment styles')
    # arm 11: the same span in a markdown BLOCKQUOTE target still resolves — LEAD's `>` doing the job
    # CODE_LEAD must not do. Without it, quoting a blockquoted ruling out of CLAUDE.md never matches.
    fires, verified = check(
        {'.claude/battery.py': marked('CLAUDE.md', 'a rule implemented twice drifts, and the')},
        {'CLAUDE.md': '> a rule implemented twice\n> drifts, and the\n'})
    arm(verified == 1 and not fires,
        'resolves a span whose target is a markdown blockquote')

    # arms 12 and 13: THE TWO-CHARACTER DRIFT, against the LIVE citation_reach_check.py. This is the
    # arm that would have caught breakage 3, and it is the reason the comparison normalises WHITESPACE
    # ONLY — a normaliser that folded quote characters together, which is a tempting thing to add the
    # first time a copy differs only by punctuation, would pass arm 12 and make this instrument blind
    # to the exact defect that motivated it. Arm 13 is the pair, so 12 is not just proof of a refusal.
    reach = {'.claude/citation_reach_check.py':
             open('.claude/citation_reach_check.py', encoding='utf-8').read()}
    fires, verified = check(
        {'.claude/citation_head_check.py': marked('.claude/citation_reach_check.py', STALE_3)}, reach)
    arm(verified == 0 and any(k == NOT_FOUND for *_r, k, _h in fires),
        'FIRES on a copy differing from its target by TWO characters (real bytes, found live)')
    fires, verified = check(
        {'.claude/citation_head_check.py': marked('.claude/citation_reach_check.py', REPAIRED_3)},
        reach)
    arm(verified == 1 and not fires,
        'and passes that same span once the two characters are corrected')

    print('SELFTEST', 'PASS — fires on a drifted quote (real bytes), a two-character drift (real '
          'bytes), a non-unique span, a missing target, a self-target, an unmarked marker, an empty '
          'gutter and a malformed marker; ignores the word used as English; passes repaired and '
          'rewrapped quotes'
          if ok else 'FAIL — do not trust the scan')
    return ok


def scope():
    """Files scanned for markers: .claude/ sources plus CLAUDE.md. Globbed rather than hand-listed —
    a hand list here would be the staleness battery.py's assertion 2 refuses one level up."""
    found = []
    for pattern in ('.claude/*.py', '.claude/*.sh', '.claude/*.js', '.claude/*.md'):
        found += glob.glob(pattern)
    return sorted(found) + ['CLAUDE.md']


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    files = {p: open(p, encoding='utf-8').read() for p in scope() if os.path.exists(p)}
    quoted = {}
    for path, text in files.items():
        for _line, target, _span, _n in scan(text)[0]:
            if target not in quoted and os.path.exists(target):
                quoted[target] = open(target, encoding='utf-8').read()
    fires, verified = check(files, quoted)
    for path, line, target, kind, hits in fires:
        where = f', {hits} occurrences in the target' if kind in (NOT_FOUND, NOT_UNIQUE) else ''
        print(f'  {LABEL[kind]}: {path}:{line} -> {target} — {kind}{where}')
    marked_total = verified + len(fires)
    # `marked` is COVERAGE and is ratcheted: deleting a marker is the cheap way to silence a fire,
    # and this is what makes it not cheap. `flags` is a DEFECT COUNT and is NOT ratcheted — ratcheting
    # it would fail the battery for repairing a quote. Keys namespaced per producer, per the
    # convention, because two instruments both reporting `flags` is how a reader compares the wrong
    # pair of numbers and fires on a corpus that did not move.
    print('SIDECAR ' + json.dumps({
        'name': 'internal_quote_check',
        'metrics': {'internal_quote.marked': marked_total,
                    'internal_quote.verified': verified,
                    'internal_quote.flags': len(fires)},
        'ratchet': ['internal_quote.marked'],
    }, sort_keys=True))
    print(f'DONE internal_quote_check: {verified}/{marked_total} marked internal quotes match their '
          f'target under a span occurring exactly once, {len(fires)} flags, '
          f'{len(files)} files scanned for markers')
    sys.exit(1 if fires else 0)
