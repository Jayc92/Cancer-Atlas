# Hand-typed pointer check (2026-09-07). Every `<file>:<line>` typed by a human in this repo — in
# citations.json's ref arrays and in the prose of CLAUDE.md and .claude/ — resolved, and where an
# oracle exists, checked against what is actually AT that line.
#
# WHY IT EXISTS: THE CONVENTION THIS CHAIN RULED OUT IS STILL BEING TYPED. internal_quote_check.py's
# header names the class in its own words —
#
#     QUOTES .claude/internal_quote_check.py
#     > A file:line pointer in prose is the `:<anchor>` field this convention was ruled to DROP,
#     > still being typed by hand where no checker reaches it.
#
# — and it says that about two pointers of its own that were stale before the file was committed. The
# marked-quote convention escaped the problem by making the SPAN the anchor, so there is nothing to
# rot. It could do that because it was new. The corpus already holds hundreds of pointers written the
# other way, and they are load-bearing prose: a reader who follows one lands somewhere wrong and has
# no way to tell.
#
# THE CENSUS THAT ORDERED THIS FILE, and its shape is the reason the remedy is repair (user ruling,
# 2026-09-07: "count them, don't sweep them ... If most resolve, it's a small cleanup; if most don't,
# hand-typed pointers are a defect class in their own right and the remedy is deletion rather than
# repair — which is a different ruling and wants the number first"). The number came back and it said
# cleanup: EVERY pointer resolved to a tracked file with that line in range, and of the subpopulation
# with an oracle, every failure was a referent sitting ELSEWHERE IN THE SAME FILE. Nothing was
# fabricated. Deletion would have destroyed information that is fully recoverable, so the class gets
# a guard and a repair instead. The counts are deliberately not restated here — this file prints them,
# which makes it their source of truth; a total in this header would be the drift it exists to catch.
#
# AND THE GUARD COMES BEFORE THE REPAIR, WHICH IS AN ORDERING RULING AND NOT A PREFERENCE (user):
# "the guard produces the worklist and then prevents its recurrence, rather than being written
# afterward against a state someone already cleaned by hand." The reason is in the drift's own shape.
# It CLUSTERS BY FILE, because one edit moves every pointer below it at once — so a hand repair buys a
# state that the next content commit partially undoes, silently, with nothing reporting it. A guard
# written after the cleanup would have been demonstrated against a corpus with no defects left in it.
# This one was run first, fired, and its output was the worklist the repair worked from.
#
# ==================================================================================================
# TWO CHECKS, BECAUSE THEY ANSWER DIFFERENT QUESTIONS AND HAVE DIFFERENT POPULATIONS. Keeping them
# separate is what stops a single blended score from hiding which half is weak.
#
#   FLOOR — is there a tracked file with that many lines? TOTAL over every pointer found. Needs no
#           oracle, so nothing is excused from it. A pointer failing this is DANGLING: it names
#           nothing at all, and no amount of reading can repair it.
#   IDENTITY — is the thing named actually AT that line? Decidable ONLY where the pointer carries its
#           own oracle, which in this repo means citations.json's `backfill` refs: each one is
#           accompanied by the `author` and `year` of the citation it points at, so the check is a
#           comparison and not a judgement.
#
# THE BOUNDARY, DECLARED RATHER THAN LEFT TO BE INFERRED: prose pointers and `entries[].code_refs`
# get FLOOR ONLY. `entries` carries a `claim`, a `quote` and a `url`, but the quote is the SOURCE's
# text and appears nowhere in the code line, so there is nothing to compare; prose pointers carry no
# referent at all. Treating a prose pointer's surrounding sentence as an oracle would be exactly the
# judgement-not-evidence failure the declaration rules exist to refuse. So this instrument is TOTAL
# on resolution and PARTIAL on identity, and the DONE line prints both denominators for that reason.
#
# THE SILENT RESIDUE, at birth, because the population is the hole: a pointer written in any other
# form — "line 141 of kidneys.js", "the KDM5C block", a section name — reaches nothing here. That
# cannot be enumerated, the same way internal_quote_check.py cannot enumerate "prose that is a
# quote", and it is narrowed rather than closed by ratcheting the pointer TOTAL: deleting a pointer
# to silence a fire fails the battery, so the cheap way out is blocked while the honest ways (repair
# it, or delete it with --lower-ratchet and a reason) both leave a record.
#
# AND THE POPULATION HAS NO EXCLUSION LIST, WHICH IS THE ONLY REASON ITS TOTAL MEANS ANYTHING. The
# census that ordered this file skipped fixture filenames by a hand-maintained list, and that list HID
# EIGHT DANGLING POINTERS: selftest fixtures in two other instruments that spelled out `file:line` for
# files which do not exist. Copying the list in here would have made this instrument's total a
# statement about the list rather than about the repo — the staleness battery.py's assertion 2 exists
# to refuse. So the fixtures were changed instead. They compose their refs from parts, and the
# invariant became absolute with nothing to keep in step: A FIXTURE MAY REUSE A REAL POINTER; IT MUST
# NEVER INVENT ONE. Reusing is harmless, because the fixture then makes the same true claim the live
# pointer does. Inventing is a false claim that no reader and no tool can tell apart from a live one.
# The total is what it is because that is how many there are.
#
# WHAT THIS DELIBERATELY DOES NOT DO: FIX ANYTHING. Where a referent sits elsewhere in the file the
# report names the nearest occurrence as a REPAIR CANDIDATE, and prefers one carrying the year on the
# same line, because author-and-year-together is the shape of a real citation. That is a candidate and
# not a verdict — an author can legitimately appear several times in one file, and this instrument
# cannot tell which occurrence a human meant. An auto-fixer would silently re-point a pointer at the
# wrong one of nine occurrences and report success, which is worse than the drift.
#
# AND THE FIRST REPAIR MEASURED THAT INSTEAD OF ASSUMING IT: the nearest occurrence was the WRONG
# target in four of the flags. Three were the wrapped-citation case below. The fourth was an author
# whose nearest occurrence is a COMMENT QUOTING THE PAPER, while the referent is a data string much
# further down the file — a candidate indistinguishable from a correct one without reading the line.
# Every candidate was read before it was used. An auto-fixer would have written four wrong numbers and
# reported success, on a run that would have looked like a clean sweep.
#
# NEAREST IS NOT IDENTITY, AND THE BLOCK OFFSET IS THE BETTER EVIDENCE — for a human. Drift arrives in
# BLOCKS: one content edit shifts every pointer below it by the same amount, so flags in a file share
# an offset, and the candidate that disagrees with its neighbours' offset is the suspicious one. That
# is a reading aid and deliberately NOT a rule in here, because a modal offset over a handful of flags
# is a thin vote: on the first repair it returned two confident wrong answers off one vote and two
# votes. A vote whose count nobody reads is not evidence, and reading it is a person's job.
#
# A WRAPPED CITATION IS IMPRECISE FROM BIRTH, NOT DRIFT, and the two take different repairs. Where a
# citation is split across two lines — surname ending one, year and journal beginning the next — a
# pointer at the YEAR line names a real place that never held the whole citation. Drift had a moment
# when it was true, so it is re-pointed FORWARD; this was never exactly true, so it is re-pointed UP,
# to the surname, where the rest of this corpus points. The check accepts that repair BY DESIGN: a
# name-only match on the pointed line counts as on-line (see `on_line` below), because demanding
# author AND year on one line would make the corpus's own wrapping convention unrepresentable.
#
# A POINTER CAN BE RIGHT FOR ONE RECORD AND STALE FOR ANOTHER, so a repair is keyed to (RECORD, REF)
# and never to (FILE, LINE). Two records here cite the same file and line: the line moved out from
# under one of them and still describes the other. A global search-and-replace over that pair would
# have broken the passing one. Worse, within one file the same number appeared as both an OLD line and
# a NEW line, so applying the pairs in sequence would have re-broken a line it had just repaired. This
# instrument reports per record for that reason, and a repair that cannot name its record is not yet
# a repair.
#
# ==================================================================================================
# THE ORACLE IS WORD-BOUNDARED AND WANTS A CORROBORATOR, AND BOTH CLAUSES WERE PAID FOR. A bare
# substring test for the surname scores this corpus far too kindly: dozens of these records have a
# needle of four characters or fewer, and `Li` matches "likely", `Hu` matches "human", `Ding` matches
# "finding", `Min` matches "minimal", `Rep` matches "reported", `Ther` matches "therapy" — every one
# of them a word that occurs constantly in this prose. So a loose oracle can manufacture a match out
# of ordinary English, and a check built on one would report a clean corpus while measuring nothing.
# Boundaries plus the year make that impossible to do by accident. The tightening did NOT move the
# census total, which is the point rather than a disappointment: a number that survives a stricter
# oracle is why it is worth believing.
#
# AND A WINDOW IS AN ORACLE PARAMETER, WHICH IS THE OTHER HALF OF THE SAME LESSON. The census first
# searched a fixed band of lines around each pointer and reported fifteen referents GONE. Searching
# the whole file found every one of them, some more than fifty lines away, in a file where the author
# occurs nine times. A wrong window does not merely mis-measure: it INVENTS A DEFECT CLASS, and the
# invented one here ("some pointers are fabricated") would have argued for deleting the population.
# So this check searches the whole file, and the distance is REPORTED rather than used as a threshold.
# There is no window constant in this file on purpose.
#
# ==================================================================================================
# THE DECLARED EXEMPTION, PRESENT FROM BIRTH AND EMPTY (user ruling, 2026-09-07: "Give it the
# declared-exemption path FROM BIRTH, with the three properties ... Retrofitting that after the first
# false positive is how the other declarations acquired their scars one at a time").
#
# WHY ONE IS NEEDED AT ALL: a pointer may legitimately name a line holding no citation — the head of
# a comment block, an anchor a human chose because it reads better, a line the referent was moved
# away from on purpose. That is a real category, and without a path for it the first instance would
# arrive as a false positive with a red battery and no honest way to proceed.
#
# THE THREE PROPERTIES, from citation_reach_check.py's canonical statement, each satisfied by
# MECHANISM here rather than by good intentions:
#   (3) A CLOSED ENUMERATED SET. DECLARED_OFF_LINE below, keyed by author|year|file:line. The key
#       carries the LINE, so a declaration cannot follow its pointer around: move the pointer and the
#       exemption stops matching and must be re-argued at the new location.
#   (2) A REASON AT ALL. `why`, held to the same >80-character bar as DECLARED_UNREACHED and
#       DECLARED_UNMAPPABLE. That bar measures length and not content, which is known and is why it
#       is the weakest of the three and never the only one.
#   (1) CHECKABLE EVIDENCE, NOT A CONCLUSION. `quote` must be a verbatim substring OF THE EXEMPTED
#       LINE, occurring EXACTLY ONCE in the file. This is the property that makes an exemption ROT
#       LOUDLY instead of silently outliving its reason: edit the line and the quote stops resolving,
#       and the exemption fails rather than continuing to excuse something else. Uniqueness is what
#       stops the letter of the rule being satisfied by quoting a common word — citation_reach_check's
#       header names quote-the-span as the mechanisable form of property (1) and declines to build it
#       there because a one-word quote would pass; requiring the span to identify one place in the
#       file closes exactly that loophole, using this chain's own count-not-position anchor rule.
#
# AND IT IS CHECKED IN BOTH DIRECTIONS, which is the fourth thing a declared list needs and the one
# that is always learned late: an exemption for a pointer that PASSES is a problem (the reason has
# expired and nobody noticed), and an exemption naming a pointer that is not in the population is a
# problem (it was deleted, or the key was mistyped, and either way it excuses nothing). A list that
# only ever widens is deploy_check.js's BENIGN failure mode, and its arms are why that one is safe.
#
# IT SHIPS EMPTY, WHICH IS A CLAIM AND NOT AN OVERSIGHT: no pointer in the corpus needs excusing,
# because every identity failure the census found was repairable drift. So the exemption machinery is
# demonstrated by arms rather than by the corpus, and that is stated plainly here because "the code
# path never ran" is exactly what this chain means by an instrument that cannot fail. The arms drive
# every one of its five refusals and its acceptance.
#
# ==================================================================================================
# MATCHER CLASSIFICATION, per rule C in battery.py's labelled block — this file adds a matcher over
# files that also hold hand prose, so it owes the classification the same way internal_quote_check.py
# did. It is entry (12) in that enumeration, and it is the first entry needing a SHAPE the list did
# not already have: not `^`, `startswith(`, `-qF` or `.count(`, but a REGEX over prose.
#   THE DIRECTION IS LOUD, which is what makes the shape acceptable. A string in prose that merely
#   LOOKS like a pointer becomes a reported PROBLEM, visible and arguable, because it will almost
#   certainly fail to resolve. The dangerous direction would be a matcher that silently drops real
#   pointers, and that is the residue declared above, not an anchor collision.
#   THIS FILE CONTAINS NO HAND-TYPED POINTER, and that is deliberate rather than incidental. Every
#   fixture composes its pointers from constants, so no literal `<file>:<digits>` appears in this
#   source at all — the same technique internal_quote_check.py uses to keep a fixture from becoming a
#   live marker, and here it also means the instrument does not practise the habit it checks. Prose
#   in this repo can always name a thing instead of a line, which costs nothing and cannot drift.
#
# NON-INSTRUMENT SCRATCH PATH: not applicable. Rule B covers a tool that OWNS A FILE; this one writes
# nothing and owns nothing, so there is no override for a caller to honour. Stated rather than left
# silent, because "no artifact" is otherwise something a reader has to infer.
#
# Condition (7) at birth, met TWICE and the second way is the one that matters: every failure class
# has an arm, and the arms for the identity check are driven by REAL BYTES from the corpus in
# fire/pass pairs. And ON ITS FIRST LIVE RUN IT FIRED, on a corpus nobody had cleaned, producing the
# worklist that the repair then worked from — condition (7) met by the corpus rather than a fixture,
# recorded here because the repair removed the evidence. Condition (8): a first run is calibration;
# read the second. 7-bis: DONE line last, after the sidecar. Wrapper form:
#   .claude/run_checked.sh "DONE pointer_check:" python3 .claude/pointer_check.py
# `glob` is gone from this import on purpose: scope() globbed .claude/ and now reads git's index. The
# import is removed rather than left harmlessly unused, because an unused import is the next reader's
# invitation to reach for the thing the ruling took away.
import json, os, re, subprocess, sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join('.claude', 'citations.json')

# The pointer form. Extensions are enumerated rather than left open (`\w+`) so a version string or a
# sentence ending in a period cannot become a path. `#` is accepted beside `:` because both spellings
# occur. Note this pattern cannot match itself: the class holding the extensions is followed by a
# separator class and a digit class, never by a literal digit.
POINTER = re.compile(r'\b((?:[\w.\-/]+/)?[\w.\-]+\.(?:js|py|sh|md|json|html|css))[:#](\d+)\b')

NO_FILE = 'named file is not tracked in this repo'
OUT_OF_RANGE = 'line number is past the end of the file'
OFF_LINE = 'the referent is in the file but not at this line'
NOT_IN_FILE = 'the referent is nowhere in the named file'
EXEMPT_NO_REASON = 'declared exemption carries no reason'
EXEMPT_BAD_QUOTE = 'declared exemption quotes text that is not on the line it exempts'
EXEMPT_NOT_UNIQUE = 'declared exemption quotes text occurring more than once in the file'
EXEMPT_STALE = 'declared exemption for a pointer that passes'
EXEMPT_UNKNOWN = 'declared exemption names a pointer that is not in the population'

LABEL = {NO_FILE: 'DANGLING', OUT_OF_RANGE: 'DANGLING', OFF_LINE: 'OFF LINE',
         NOT_IN_FILE: 'ABSENT', EXEMPT_NO_REASON: 'THIN EXEMPTION',
         EXEMPT_BAD_QUOTE: 'ROTTED EXEMPTION', EXEMPT_NOT_UNIQUE: 'EXEMPTION IS NOT AN ANCHOR',
         EXEMPT_STALE: 'EXPIRED EXEMPTION', EXEMPT_UNKNOWN: 'ORPHAN EXEMPTION'}

REASON_BAR = 80

# THE DECLARED EXEMPTIONS. Empty, and see the header for why that is a claim rather than a stub:
# every identity failure in the corpus is repairable drift, so nothing needs excusing. The shape,
# should one ever be needed:
#   'Surname|YEAR|path/to/file.ext:NNN': {
#       'quote': '<verbatim text from that line, occurring exactly once in the file>',
#       'why': '<why the pointer legitimately names a line that does not hold its referent, in '
#              'enough words to be arguable>'}
DECLARED_OFF_LINE = {}


def tracked_files():
    """The repo's tracked paths. Tracked and not merely present, because an untracked scratch file is
    not something prose may point at — it will not exist for the next reader."""
    out = subprocess.run(['git', 'ls-files'], cwd=REPO_ROOT, capture_output=True, text=True,
                         check=True).stdout
    return {line for line in out.split('\n') if line}


def resolve(raw, tracked):
    """A pointer is written repo-relative or bare; both spellings occur. A bare name resolves only if
    exactly one tracked file ends with it — an ambiguous basename resolves to nothing rather than to a
    guess, because guessing here would mean checking identity against the wrong file."""
    if raw in tracked:
        return raw
    hits = [t for t in tracked if t.endswith('/' + raw)]
    return hits[0] if len(hits) == 1 else None


def occurrences(lines, surname, year):
    """Every 1-based line where the surname appears as a WHOLE WORD, split by whether the year is on
    that line too. Both lists, not a merged best guess: the caller reports which kind of corroboration
    a repair candidate has, and a candidate carrying the year is worth more than one without it."""
    needle = re.compile(r'\b' + re.escape(surname) + r'\b', re.I)
    with_year, name_only = [], []
    for i, text in enumerate(lines, 1):
        if needle.search(text):
            (with_year if year and year in text else name_only).append(i)
    return with_year, name_only


def pointer_key(author, year, path, line):
    """The exemption key. Built here rather than typed at each site so the declaration and the check
    cannot disagree about the format — and so no literal pointer appears in this file's source."""
    return '%s|%s|%s:%d' % (author, year, path, line)


def check(pointers, files, tracked, declared):
    """The whole verdict, pure so the arms can drive it without a repo.

    pointers — [(origin, raw, line, author, year)]. author/year None means FLOOR ONLY: no oracle, so
               identity is not merely unchecked but undecidable, and the two must not be conflated.
    files    — {path: [lines]}. A path absent here is treated as untracked, which is how DANGLING is
               driven in-process.
    tracked  — set of paths that exist as far as this run is concerned.
    declared — the exemption dict.

    Returns (fires, resolved, identity_checked, exempted). `identity_checked` counts pointers whose
    referent was FOUND ON THE LINE — reported-over-declared, which is the rule this chain learned by
    printing the size of a declaration and calling it work done."""
    fires, resolved, identity_checked, exempted = [], 0, 0, 0
    seen_keys = set()
    for origin, raw, line, author, year in pointers:
        path = resolve(raw, tracked)
        lines = files.get(path) if path else None
        if lines is None:
            fires.append((origin, raw, line, NO_FILE, ''))
            continue
        if line < 1 or line > len(lines):
            fires.append((origin, raw, line, OUT_OF_RANGE, 'file has %d lines' % len(lines)))
            continue
        resolved += 1
        if not author:
            continue
        surname = author.split()[-1]
        with_year, name_only = occurrences(lines, surname, year)
        on_line = line in with_year or line in name_only
        key = pointer_key(author, year, path, line)
        seen_keys.add(key)
        if key in declared:
            entry = declared[key]
            note = 'exempt: %s' % entry.get('why', '')[:60]
            if on_line:
                fires.append((origin, raw, line, EXEMPT_STALE, 'the referent IS on this line'))
            elif len(entry.get('why', '')) < REASON_BAR:
                fires.append((origin, raw, line, EXEMPT_NO_REASON,
                              'reason is %d chars, bar is %d' % (len(entry.get('why', '')),
                                                                 REASON_BAR)))
            elif entry.get('quote', '') not in lines[line - 1]:
                fires.append((origin, raw, line, EXEMPT_BAD_QUOTE, note))
            elif sum(entry['quote'] in text for text in lines) != 1:
                fires.append((origin, raw, line, EXEMPT_NOT_UNIQUE, note))
            else:
                exempted += 1
            continue
        if on_line:
            identity_checked += 1
        elif with_year or name_only:
            best = min(with_year or name_only, key=lambda j: abs(j - line))
            fires.append((origin, raw, line, OFF_LINE,
                          '%s|%s is at %d (offset %+d, %s), %d occurrences in the file'
                          % (surname, year, best, best - line,
                             'name+year' if with_year else 'NAME ONLY — weaker candidate',
                             len(with_year) + len(name_only))))
        else:
            fires.append((origin, raw, line, NOT_IN_FILE, '%s|%s' % (surname, year)))
    for key in sorted(declared):
        if key not in seen_keys:
            fires.append(('DECLARED_OFF_LINE', key, 0, EXEMPT_UNKNOWN, ''))
    return fires, resolved, identity_checked, exempted


SCANNED_EXTS = ('py', 'sh', 'js', 'md')


def scope(tracked=None):
    """Files scanned for PROSE pointers: the TRACKED sources directly in .claude/, plus CLAUDE.md.

    FROM GIT, NOT FROM A GLOB, and this file shipped one commit earlier with the glob — so the
    correction belongs here rather than being quietly absent. `pointer.pointers` is RATCHETED, and a
    glob sees untracked scratch, so an untracked draft in .claude/ could raise the floor to a number A
    FRESH CHECKOUT CANNOT REPRODUCE, failing a clean clone with no defect anywhere. The confirmed case
    was the sibling metric: THIS FILE, while untracked, moved internal_quote_check's ratcheted marked
    count by one. User ruling, 2026-09-07: "what ships is what's tracked — a fresh checkout has only
    tracked files", therefore "A RATCHETED METRIC MUST DERIVE FROM TRACKED FILES", and anything
    emitting a ratcheted sidecar while globbing has the same defect latent.
    NOT A HAND LIST, which is what the replaced docstring was defending against: git is the authority,
    so there is nothing to keep in step. Consistent with resolve() one screen up, which already
    required a pointer's TARGET to be tracked — the population and the referent now answer to the same
    authority, and it was incoherent for them not to. `tracked` is injectable so the arms can drive
    the filter without depending on what is on disk."""
    if tracked is None:
        tracked = tracked_files()
    found = []
    for path in sorted(tracked):
        if not path.startswith('.claude/'):
            continue
        relative = path[len('.claude/'):]
        if '/' in relative:          # nested dirs hold no prose today; same rule battery.py applies
            continue
        if relative.rsplit('.', 1)[-1] in SCANNED_EXTS:
            found.append(path)
    return found + ['CLAUDE.md']


def collect(manifest, prose):
    """Every hand-typed pointer, from the two closed populations.

    STRUCTURED — the manifest's ref arrays. `backfill` refs carry author+year, so they are the only
    ones with an oracle; `entries` code_refs get floor only.
    PROSE — the manifest's own `_`-prefixed narrative keys, plus each scanned file's text.

    Occurrences, not distinct pointers: every hand-typed instance is its own liability, and two
    sentences naming the same line can rot independently."""
    pointers = []
    for entry in manifest.get('entries', []):
        for ref in entry.get('code_refs', []):
            for m in POINTER.finditer(ref):
                pointers.append(('%s:code_refs[%s]' % (MANIFEST, entry.get('id')),
                                 m.group(1), int(m.group(2)), None, None))
    for item in manifest.get('backfill', []):
        for ref in item.get('refs', []):
            for m in POINTER.finditer(ref):
                pointers.append(('%s:backfill' % MANIFEST, m.group(1), int(m.group(2)),
                                 item.get('author'), item.get('year')))
    for key, value in manifest.items():
        if key.startswith('_') and isinstance(value, str):
            for m in POINTER.finditer(value):
                pointers.append(('%s:%s' % (MANIFEST, key), m.group(1), int(m.group(2)), None, None))
    for path, text in sorted(prose.items()):
        for i, line in enumerate(text.split('\n'), 1):
            for m in POINTER.finditer(line):
                pointers.append(('%s line %d' % (path, i), m.group(1), int(m.group(2)), None, None))
    return pointers


# --- condition (7) fixtures: real corpus bytes, and pointers composed rather than typed ------------
# A file whose author appears many times, far from where the manifest points: the shape that the
# census's first window mislabelled as GONE. Named by constant so no pointer literal enters this file.
DRIFT_FILE = 'js/organs/liver.js'
FIX_FILE = 'js/x.js'


def selftest():
    ok = True

    def arm(good, label):
        nonlocal ok
        ok &= bool(good)
        print(f"  {'ok  ' if good else 'FAIL'} {label}")

    # A synthetic three-line file is enough for the structural arms and keeps them readable; the
    # identity arms below use real corpus bytes, which is where a fixture would be too kind.
    lines = ['// Katyal 2000 CT of the liver', '// unrelated prose', '// Katyal again, no year']
    files = {FIX_FILE: lines}
    tracked = {FIX_FILE}
    ptr = lambda line, author='Katyal', year='2000': [('fixture', FIX_FILE, line, author, year)]

    # arm 1: the pointer lands on its referent. The pass side first, so no later arm proves only that
    # the checker can say no.
    fires, resolved, ident, exempt = check(ptr(1), files, tracked, {})
    arm(not fires and resolved == 1 and ident == 1, 'PASSES a pointer whose referent is on the line')

    # arm 2: OFF LINE, with the repair candidate and its corroboration reported. Fails against a
    # check that merely asked whether the name is in the file anywhere.
    fires, _r, ident, _e = check(ptr(2), files, tracked, {})
    arm(ident == 0 and len(fires) == 1 and fires[0][3] == OFF_LINE and '(offset -1, name+year)'
        in fires[0][4], 'FIRES OFF LINE and names the nearest candidate carrying the year')

    # arm 3: a candidate WITHOUT the year is reported as weaker rather than silently equal. The year
    # is the corroborator that makes the oracle safe, so its absence has to reach the reader.
    fires, _r, _i, _e = check([('fixture', FIX_FILE, 2, 'Katyal', '1999')], files, tracked, {})
    arm(len(fires) == 1 and 'NAME ONLY' in fires[0][4],
        'marks a candidate found without its year as the weaker kind')

    # arm 4: ABSENT is a different fire from OFF LINE, because the repairs differ — one re-points, the
    # other has nothing to aim at and is the class the deletion remedy would have been for.
    fires, _r, _i, _e = check([('fixture', FIX_FILE, 1, 'Nobody', '2000')], files, tracked, {})
    arm(len(fires) == 1 and fires[0][3] == NOT_IN_FILE,
        'FIRES ABSENT, distinctly, when the referent is nowhere in the file')

    # arm 5: both DANGLING shapes. An untracked path and a line past the end. These need no oracle,
    # so they are the half of the check that is total over the population.
    fires, resolved, _i, _e = check([('fixture', 'js/gone.js', 1, None, None)] + ptr(99),
                                    files, tracked, {})
    arm(resolved == 0 and {f[3] for f in fires} == {NO_FILE, OUT_OF_RANGE},
        'FIRES DANGLING on an untracked file and on a line past the end')

    # arm 6: FLOOR ONLY is not silently counted as identity-checked. A pointer with no oracle must
    # raise the resolved count and NOT the identity count — conflating them is how a partial check
    # reports itself as total.
    fires, resolved, ident, _e = check([('fixture', FIX_FILE, 2, None, None)], files, tracked, {})
    arm(not fires and resolved == 1 and ident == 0,
        'counts an oracle-less pointer as resolved but NOT as identity-checked')

    # arms 7-11: THE EXEMPTION PATH, every refusal driven. It ships empty, so these arms are the only
    # thing that exercises it at all — an unexercised escape hatch is an instrument that cannot fail.
    good_key = pointer_key('Katyal', '2000', FIX_FILE, 2)
    why = ('the pointer names the head of the comment block on purpose, and the citation it refers '
           'to sits three lines below where the prose would read worse; kept as a deliberate anchor')
    fires, _r, _i, exempt = check(ptr(2), files, tracked,
                                  {good_key: {'quote': 'unrelated prose', 'why': why}})
    arm(not fires and exempt == 1,
        'ACCEPTS an exemption quoting its line uniquely, with a reason over the bar')

    fires, _r, _i, exempt = check(ptr(2), files, tracked,
                                  {good_key: {'quote': 'unrelated prose', 'why': 'because'}})
    arm(exempt == 0 and fires[0][3] == EXEMPT_NO_REASON, 'REFUSES an exemption with a thin reason')

    fires, _r, _i, exempt = check(ptr(2), files, tracked,
                                  {good_key: {'quote': 'not on that line', 'why': why}})
    arm(exempt == 0 and fires[0][3] == EXEMPT_BAD_QUOTE,
        'REFUSES an exemption whose quote is not on the line it exempts (rots loudly)')

    fires, _r, _i, exempt = check(ptr(2), files, tracked,
                                  {good_key: {'quote': '//', 'why': why}})
    arm(exempt == 0 and fires[0][3] == EXEMPT_NOT_UNIQUE,
        'REFUSES an exemption whose quote occurs more than once (a common word is not evidence)')

    stale = {pointer_key('Katyal', '2000', FIX_FILE, 1): {'quote': 'CT of the liver', 'why': why}}
    fires, _r, _i, exempt = check(ptr(1), files, tracked, stale)
    orphan, _r, _i, _e = check(ptr(1), files, tracked,
                               {pointer_key('Katyal', '2000', FIX_FILE, 3):
                                {'quote': 'again', 'why': why}})
    arm(exempt == 0 and fires[0][3] == EXEMPT_STALE
        and any(f[3] == EXEMPT_UNKNOWN for f in orphan),
        'REFUSES an exemption for a passing pointer, and one naming a pointer not in the population')

    # arm 12: THE ORACLE'S WORD BOUNDARY, on the real string that breaks a substring test. `Li` is a
    # live surname in this corpus and `likely` is a word this prose uses constantly. Without the
    # boundary this line reads as a match and the pointer passes while naming nothing.
    loose = {FIX_FILE: ['// this is likely a minimal finding, reported in human tissue']}
    fires, _r, ident, _e = check([('fixture', FIX_FILE, 1, 'Li', '2020')], loose, tracked, {})
    arm(ident == 0 and fires and fires[0][3] == NOT_IN_FILE,
        'the oracle does NOT match "Li" inside "likely" (fails against a substring test)')
    boundaried = {FIX_FILE: ['// Li 2020 reported a minimal finding']}
    fires, _r, ident, _e = check([('fixture', FIX_FILE, 1, 'Li', '2020')], boundaried, tracked, {})
    arm(not fires and ident == 1, 'and DOES match the same surname as a whole word')

    # arm 13: A NON-ASCII SURNAME MUST NOT SILENTLY MISS, because the corpus holds two and the
    # extractor's own SURNAME class is why they were invisible to every other instrument. If this
    # oracle repeated that character-class mistake, every Riihimäki pointer would read as ABSENT and
    # a repair pass would go looking for drift that is not there.
    accented = {FIX_FILE: ['// Riihimäki 2018 Swedish national registry']}
    fires, _r, ident, _e = check([('fixture', FIX_FILE, 1, 'Riihimäki', '2018')], accented,
                                 tracked, {})
    arm(not fires and ident == 1, 'matches a non-ASCII surname as a whole word')

    # arm 14: REAL BYTES. The census's window bug in one arm: a live corpus file, a real manifest
    # author, a pointer deliberately placed far from every occurrence. The referent must be found and
    # reported as drift rather than as absent, however far away it is — this is the arm that fails
    # against any windowed search, which is the version that argued for deleting the population.
    if os.path.exists(os.path.join(REPO_ROOT, DRIFT_FILE)):
        real = open(os.path.join(REPO_ROOT, DRIFT_FILE), encoding='utf-8').read().split('\n')
        hits = [i for i, t in enumerate(real, 1) if re.search(r'\bKatyal\b', t)]
        far = 1 if not hits else max(1, min(hits) // 2)
        fires, _r, _i, _e = check([('fixture', DRIFT_FILE, far, 'Katyal', '2000')],
                                  {DRIFT_FILE: real}, {DRIFT_FILE}, {})
        arm(len(hits) > 1 and len(fires) == 1 and fires[0][3] == OFF_LINE
            and 'occurrences in the file' in fires[0][4],
            'FIRES OFF LINE (not ABSENT) for a referent far away in a real corpus file, %d '
            'occurrences' % len(hits))
    else:
        arm(False, 'real-bytes arm could not read its corpus file')

    # arms 15-16: THE POPULATION COMES FROM GIT. Both ratcheted metrics here are counts over scope(),
    # so a scope that can see an untracked file can move a floor a clean checkout cannot reach. The
    # second arm is the confirmed incident in miniature, with the roles reversed: this very file, while
    # untracked, is what raised internal_quote_check's ratcheted count. It reads a path that certainly
    # exists on disk (its own) and proves the absence of that path from the tracked list is decisive.
    synthetic = ['.claude/a.py', '.claude/b.sh', '.claude/c.js', '.claude/d.md',
                 '.claude/e.json', '.claude/nested/f.py', 'js/organs/g.js', 'CLAUDE.md']
    arm(scope(synthetic) == ['.claude/a.py', '.claude/b.sh', '.claude/c.js', '.claude/d.md',
                             'CLAUDE.md'],
        'scope() takes .claude/ prose sources from the TRACKED list, skipping other extensions, '
        'nested paths and corpus files')
    arm(os.path.exists(os.path.join(REPO_ROOT, '.claude', 'pointer_check.py'))
        and '.claude/pointer_check.py' not in scope(['.claude/battery.py']),
        'and THIS FILE, which exists on disk, stays out of a tracked list that omits it — the glob '
        'this replaced would have taken it in, which is how an untracked draft moved a ratchet')

    print('SELFTEST', 'PASS — fires on both dangling shapes, on a referent off its line, on one '
          'absent from the file, and on all five ways an exemption can be wrong; keeps floor-only '
          'pointers out of the identity count; refuses a substring match for a short surname and '
          'accepts a non-ASCII one; finds a far-away referent in real corpus bytes; and takes its '
          'population from git rather than from the filesystem'
          if ok else 'FAIL — do not trust the scan')
    return ok


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    os.chdir(REPO_ROOT)
    manifest = json.load(open(MANIFEST, encoding='utf-8'))
    # One read of the index, feeding both the population and the referent test, so the two cannot
    # answer to different authorities the way the glob and resolve() did.
    tracked = tracked_files()
    prose = {p: open(p, encoding='utf-8').read() for p in scope(tracked) if os.path.exists(p)}
    pointers = collect(manifest, prose)
    files = {}
    for _o, raw, _l, _a, _y in pointers:
        path = resolve(raw, tracked)
        if path and path not in files:
            try:
                files[path] = open(os.path.join(REPO_ROOT, path), encoding='utf-8').read().split('\n')
            except OSError:
                pass
    fires, resolved, identity_checked, exempted = check(pointers, files, tracked, DECLARED_OFF_LINE)
    for origin, raw, line, kind, note in fires:
        where = '%s:%d' % (raw, line) if line else raw
        print('  %s: %s -> %s%s' % (LABEL[kind], origin, where, ' — ' + note if note else ''))
    # The per-file offset summary, because the CLUSTERING is the actionable part: a shared offset
    # means one edit moved many pointers, so the repair is one decision and not many. Printed only
    # when something fired, so a green run stays one line plus its sidecar.
    off_line = [(raw, note) for _o, raw, _l, kind, note in fires if kind == OFF_LINE]
    if off_line:
        by_file = {}
        for raw, note in off_line:
            m = re.search(r'offset ([-+]\d+)', note)
            by_file.setdefault(raw, []).append(int(m.group(1)) if m else 0)
        print('  OFFSETS BY FILE (a shared offset means ONE edit moved many pointers):')
        for raw in sorted(by_file, key=lambda r: -len(by_file[r])):
            offs = by_file[raw]
            shape = 'SAME OFFSET' if len(set(offs)) == 1 else '%d distinct' % len(set(offs))
            print('    %s: %d off line, %s %s' % (raw, len(offs), shape, sorted(set(offs))))
    identity_total = sum(1 for _o, _r, _l, author, _y in pointers if author)
    # `pointers` and `identity_oracle` are COVERAGE and are ratcheted: deleting a pointer, or an
    # oracle field that makes one checkable, is the cheap way to silence a fire and this is what
    # makes it not cheap. `flags` is a DEFECT COUNT and is NOT ratcheted — ratcheting it would fail
    # the battery for repairing a pointer. Keys namespaced per producer, per the sidecar convention.
    print('SIDECAR ' + json.dumps({
        'name': 'pointer_check',
        'metrics': {'pointer.pointers': len(pointers),
                    'pointer.identity_oracle': identity_total,
                    'pointer.on_line': identity_checked,
                    'pointer.exempt': exempted,
                    'pointer.flags': len(fires)},
        'ratchet': ['pointer.pointers', 'pointer.identity_oracle'],
    }, sort_keys=True))
    print('DONE pointer_check: %d/%d hand-typed pointers resolve (file tracked, line in range), '
          '%d/%d with an author+year oracle land on their referent\'s line, %d declared off-line, '
          '%d flags, %d files scanned for prose pointers'
          % (resolved, len(pointers), identity_checked, identity_total, exempted, len(fires),
             len(prose)))
    sys.exit(1 if fires else 0)
