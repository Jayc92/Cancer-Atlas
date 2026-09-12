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
# THE BOUNDARY, DECLARED RATHER THAN LEFT TO BE INFERRED: prose pointers get FLOOR ONLY — they carry
# no referent at all, and treating a prose pointer's surrounding sentence as an oracle would be
# exactly the judgement-not-evidence failure the declaration rules exist to refuse. So this
# instrument is TOTAL on resolution and PARTIAL on identity, and the DONE line prints both
# denominators for that reason.
#
# `entries[].code_refs` WAS FLOOR ONLY TOO, UNTIL THE GAP COST A REAL, SILENT MISS (user-directed,
# 2026-09-11). The original reasoning still holds for MOST of the population — `entries` carries a
# `claim`, a `quote` and a `url`, and for the `licence`/`colour`/`anatomical-source` classes the quote
# is source text (a license string, a tissue-colour description) that appears nowhere in the code
# line, so there is genuinely nothing to compare. But the `epidemiological` class is different: its
# `id` already names an author and year (`epi-<surname>-<year>`), the code near its own code_refs
# line routinely restates that same author+year in prose (`Peres et al., JNCI, 2019`), and this is
# the EXACT oracle shape `backfill` already has. An eleventh stale pointer — `epi-peres-2019`'s own
# `code_refs` entry, staled by the same ovary.js insertion that staled ten `backfill` refs the same
# day — passed this check silently for exactly as long as this boundary excluded it, because FLOOR
# ONLY cannot see a referent that moved to a different in-range line. `entry_identity()` below
# supplies (author, year) for epidemiological entries[] items the same way backfill's own fields do,
# so `check()` — already built to take an oracle from anywhere — applies unmodified. Two of the
# seven needed a human decision rather than a mechanical derivation, and are recorded at
# `entry_identity()` itself: one is exempted, one uses a hand-verified override. This instrument is
# still PARTIAL on identity, but the partial boundary now runs along "does this citation's own id
# encode a checkable author+year", not along "which JSON array is it stored in".
#
# WHAT THE PARTIAL HALF COSTS, MEASURED (2026-09-08). The floor-only residue is not a theoretical
# gap: a hand audit of every prose pointer touched in that batch found fraction_check.py citing
# line 226 of thyroid.js (a `// =====` separator) for the "ATM (13/168, 7.7%) and KMT2D (12/168,
# 7.1%)" pair, which lives at thyroid.js:247. That pointer was committed, floor-only, in range, and
# WRONG, and this instrument reported 0 flags on it every run because it has no oracle to be wrong
# against. It was corrected by reading the line.
#   THE FULL MEASURED COST OF RANGE-CHECKING-ONLY, since a number beats an estimate: that audit found
# TWO pre-existing defects across FIVE sites — the separator citation above, plus a superseded address
# for one span written at four sites in extract_citations.py, in comparison tables and in the selftest
# arm that quotes that span verbatim. Both were committed, both in range, both oracle-less, and both
# reported green on every run from the day they were written. Neither was found by an instrument. That
# is what the partial half costs, and it is the floor of the cost rather than the whole of it, because
# the audit covered the pointers this batch TOUCHED and not the population.
# THE WRONG NUMBER IS DELIBERATELY NOT IN POINTER FORM ABOVE, and that is the same lesson one turn
# later: the first draft of this paragraph wrote that number in pointer form, which re-created the
# exact defect it describes — a new, committed, in-range, oracle-less pointer at a separator line,
# counted in the TOTAL and checked by nothing. A historical wrong value is a fact about the past, not
# a reference a reader should follow, so it goes in the residue form named below, where the population
# does not reach it. Only the CORRECTED pointer is written as one, because that one should be checked.
# It took two passes because the SECOND draft then quoted the bad form inside backticks to show what
# not to do, which is still a pointer — a demonstration of a bad reference cannot be written literally
# without becoming one, so this paragraph describes the form and never exhibits it.
#
# DESCRIBE THE SHAPE, DO NOT INSTANTIATE IT (user ruling, 2026-09-08, on the third incident). This is a
# PATTERN in this repo, not a quirk of pointers: documenting a defect class has now produced an instance
# of that class three times, in three different instruments, each found by a different means.
#   1. record_sync_check.py's header. Naming a record's heading in prose took that heading's occurrence
#      count 1 -> 2, the check fired NOT A MARKER, and the battery refused the commit. Caught by a
#      GATE, on its first real opportunity.
#   2. internal_quote_check.py's breakage (4). An entry meant to enumerate anchor families joined two
#      separate spans of commit_checked.sh inside one pair of quote marks, and the composite existed in
#      no file at any time. Caught by THAT INSTRUMENT on its first live run, in the very file hosting
#      the enumeration it was being added to.
#   3. This paragraph, twice over. Caught by a HAND AUDIT, because nothing resolves a prose pointer.
#   THE COMMON MECHANISM IS THAT A MATCHER HAS NO NOTION OF CONTEXT. `organ.js:NNN` is a pointer
# wherever it appears; a heading's text is an occurrence wherever it appears; a quoted span is a claim
# of verbatim identity wherever it appears. None of them reads the sentence around it, so "as a bad
# example", "formerly", "do not write", and backticks change nothing about what is counted. Prose can
# frame an example for a human and cannot frame it for a scanner.
#   SO THE REMEDY IS GENERAL: describe the shape in words that cannot match. "A pointer naming a line
# that has since moved" is safe; the literal address is not, no matter what surrounds it. Name the form,
# quote nothing, and put only the CORRECT instance in matchable form.
#   WHY IT KEEPS HAPPENING, WHICH IS THE PART WORTH WRITING DOWN: the instinct that produces it — be
# concrete, show the reader the actual thing rather than a description of it — is normally correct, and
# is the instinct this file's whole header is written on. It is wrong in exactly one place: when the
# thing being shown is the thing being counted. That is a narrow exception to a good habit, which is
# why care does not prevent it and a stated rule might.
# AND THE SAME BATCH MANUFACTURED FOUR MORE OF ITS OWN, WHICH IS THE ARGUMENT FOR AUDITING BY HAND
# AFTER ANY INSERTION. Three organ files gained comment blocks above cited lines (kidneys +6, lungs
# +9, brain +8), which moved 28 backfill refs — all caught HERE, because those carry oracles — and
# also silently invalidated the batch's own new prose pointers, which do not. The failure mode is the
# mirror of the documented one: a pointer breaks not when its target moves but when anything ABOVE
# its target moves, and the write and the break can be minutes apart in one working tree.
# THE CHEAP CHECK THAT FINDS IT: diff the tree, extract every `organ.js:NNN` on an ADDED line, print
# what is now at that line, and read the list. That is a hand audit and it stays one — the oracle
# problem is unchanged, and inventing one for prose is the judgement-not-evidence refusal above.
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
def pointer_key(author, year, path, line):
    """The exemption key. Built here rather than typed at each site so the declaration and the check
    cannot disagree about the format — and so no literal pointer appears in this file's source.
    Defined ahead of DECLARED_OFF_LINE (moved up from its original position below) because that
    dict now calls this function to build its own keys at module-load time, not just at check-time."""
    return '%s|%s|%s:%d' % (author, year, path, line)


#
# NO LONGER EMPTY (2026-09-11) — the first three real firings, from wiring entries[] identity above.
# All three share one shape, distinct from the wrapped-citation case this file already documents:
# entries[].code_refs on a MULTI-line entry does not repeat the citation's author+year at every
# line — each line supports a DIFFERENT CLAUSE of that entry's own `claim`, and the citation's
# surname can legitimately sit one or more lines away from the specific figure a given code_ref
# was chosen to point at. Read directly before declaring (nearest is not identity): both
# epi-dicarlo-2022 refs point at the line carrying "N=1,578,482" — the exact figure in this
# entry's claim — one line below where "Di Carlo... 2025"/"...2022" is itself written, because
# the comment wraps there both times (same offset, both places, because the wrap convention is
# the same, not because one edit moved them). epi-park-2023's second ref points at the line
# clarifying that "53,142... [is] this atlas's computed sum... not a figure the paper prints" —
# a different clause of the same entry's claim than its first ref (the raw counts, which do sit
# beside "Park... 2023").
DECLARED_OFF_LINE = {
    pointer_key('Di Carlo', '2022', 'js/organs/skin.js', 16): {
        'quote': '59 countries; corroborated in plain language by NCI PDQ',
        'why': 'this code_ref points at the line carrying the entry\'s own claimed figure '
               '("1,578,482 adults, 59 countries"), one line below where the Di Carlo/2025 '
               'citation itself is written because the comment wraps there — not drift, the '
               'same wrap offset recurs at this entry\'s other ref below',
    },
    pointer_key('Di Carlo', '2022', 'js/organs/skin.js', 48): {
        'quote': 'N=1,578,482). Shares shown are COMPUTED from Bradford',
        'why': 'the same wrap-offset shape as this entry\'s other declared ref above: the figure '
               '"N=1,578,482" this entry\'s claim names sits one line below the Di Carlo/2022 '
               'citation, which wraps onto the line before it — not drift, a repeated convention',
    },
    pointer_key('park', '2023', 'js/organs/bladder.js', 36): {
        'quote': "53,142 is this atlas's computed sum of the four counts",
        'why': 'this entry\'s claim has two clauses — the four raw counts (its other ref, beside '
               'the Park/2023 citation itself) and the caveat that 53,142 is the atlas\'s own sum '
               'rather than a number the paper prints — and this ref points at the second clause, '
               'not at a drifted copy of the first',
    },
}


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


EPI_ID_RE = re.compile(r'^epi-([a-z]+)-(\d{4})$')

# HAND-VERIFIED, NOT DERIVED, for the two entries[] ids the plain `epi-<surname>-<year>` split gets
# wrong — read at the entry's own code_refs line before writing this table, same standard `backfill`
# author/year fields are held to.
#   epi-dicarlo-2022: every code comment near this entry's own refs writes the surname as two words,
#     "Di Carlo" — `id` concatenates them to "dicarlo", which appears nowhere in the corpus as one
#     token. check()'s own author.split()[-1] already reduces a multi-word author to its last token,
#     so "Di Carlo" and "Carlo" resolve identically here; recorded as the full name anyway so the
#     table reads like a citation, not an oracle hack.
ENTRY_IDENTITY_OVERRIDE = {
    'epi-dicarlo-2022': ('Di Carlo', '2022'),
}
# epi-kgca-2009 is exempted rather than derived: "KGCA" is an organisational name (Korean Gastric
# Cancer Association), not a personal surname, and this exact corpus cites it under TWO different
# year labels for the SAME source — "the Korean Gastric Cancer Association 2009 nationwide survey"
# at this entry's own code_refs line (stomach.js:28, the survey year) versus "KGCA, 2011" forty lines
# away (the publication year, js/organs/stomach.js:44) — a real, accepted convention in this specific
# file, not a defect. A single-word, year-strict oracle built from "kgca"+"2009" would find "KGCA" at
# line 44 with the WRONG year and report this entry OFF LINE, which would be a confident wrong
# answer about a citation that is not broken. Declared rather than silently mis-derived.
ENTRY_IDENTITY_EXEMPT = {'epi-kgca-2009'}


def entry_identity(entry_id):
    """(author, year) for an entries[] item, or (None, None) if it carries no checkable oracle.
    Checked in the order: explicit exemption, explicit override, then the plain `epi-<name>-<year>`
    derivation every other epidemiological id already satisfies (waddell/oweira/peres/johannsen/
    park, verified against their own code_refs lines before this shipped). Non-epidemiological
    classes (licence/colour/anatomical-source) fall through to (None, None) by construction — their
    ids don't carry the `epi-` prefix, so the regex never matches, same FLOOR-ONLY treatment as
    before for exactly the reason the header still gives: no author+year to compare against."""
    if entry_id in ENTRY_IDENTITY_EXEMPT:
        return None, None
    if entry_id in ENTRY_IDENTITY_OVERRIDE:
        return ENTRY_IDENTITY_OVERRIDE[entry_id]
    m = EPI_ID_RE.match(entry_id)
    return (m.group(1), m.group(2)) if m else (None, None)


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


def classify(origin):
    """CODE-AND-INSTRUMENT versus PROSE, by origin string alone -- no change to collect()'s tuple
    shape or check()'s signature, so every existing selftest arm that hand-builds a pointer list
    keeps working unmodified. (user ruling, 2026-09-10): the manifest's STRUCTURED refs
    (code_refs/backfill) feed other instruments' identity checks and do not shrink by editorial
    condensation the way narrative does, so they stay CODE; the manifest's own `_`-prefixed
    narrative keys are prose wearing a JSON extension, so they join PROSE with every scanned .md
    file. Scanned .py/.sh files are CODE (a fixture, a selftest arm, a comment tied to a specific
    line for the instrument's OWN maintenance); scanned .md files (CLAUDE.md included) are PROSE
    (a human-facing narrative, edited and condensed over time). 'js' files, if any ever carry a
    pointer, fall to PROSE too -- nothing in this project hand-types a maintenance pointer inside
    committed application code, and the closed SCANNED_EXTS list has no fifth case to misclassify."""
    if origin.startswith(MANIFEST + ':code_refs') or origin.startswith(MANIFEST + ':backfill'):
        return 'code'
    if origin.startswith(MANIFEST + ':'):
        return 'prose'
    path = origin.split(' line ')[0]
    return 'code' if path.rsplit('.', 1)[-1] in ('py', 'sh') else 'prose'



def scope(tracked=None):
    """Files scanned for PROSE pointers: the TRACKED sources directly in .claude/, plus CLAUDE.md.

    FROM GIT, NOT FROM A GLOB, and this file shipped one commit earlier with the glob — so the
    correction belongs here rather than being quietly absent. `pointer.pointers_code` is RATCHETED,
    and a
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

    STRUCTURED — the manifest's ref arrays. `backfill` refs always carry author+year; `entries`
    code_refs carry one too where `entry_identity()` can derive it (epidemiological ids), floor only
    otherwise.
    PROSE — the manifest's own `_`-prefixed narrative keys, plus each scanned file's text.

    Occurrences, not distinct pointers: every hand-typed instance is its own liability, and two
    sentences naming the same line can rot independently."""
    pointers = []
    for entry in manifest.get('entries', []):
        author, year = entry_identity(entry.get('id'))
        for ref in entry.get('code_refs', []):
            for m in POINTER.finditer(ref):
                pointers.append(('%s:code_refs[%s]' % (MANIFEST, entry.get('id')),
                                 m.group(1), int(m.group(2)), author, year))
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

    # entry_identity() arms (2026-09-11): the three real cases this repo's own entries[] population
    # actually needs, each checked against real ids rather than invented ones, per condition (7).
    arm(entry_identity('epi-peres-2019') == ('peres', '2019'),
        "entry_identity(): plain epi-<surname>-<year> derivation for a real, clean id")
    arm(entry_identity('epi-kgca-2009') == (None, None),
        "entry_identity(): the declared exemption returns no oracle at all, rather than a "
        "wrong one derived from an organisational name")
    arm(entry_identity('epi-dicarlo-2022') == ('Di Carlo', '2022'),
        "entry_identity(): the declared override, for the one id whose plain derivation ('dicarlo') "
        "matches nothing — the corpus always writes this surname as two words")
    arm(entry_identity('lic-lungs') == (None, None),
        "entry_identity(): a non-epidemiological id (no 'epi-' prefix) derives no oracle, the same "
        "FLOOR-ONLY treatment this class always had")
    # AND THE DERIVED ORACLE MUST ACTUALLY CATCH A REAL DRIFT, condition (7) on the shape that
    # motivated this — an entries[] pointer whose line moved, exactly like the eleventh stale
    # pointer this closes. Built from real corpus bytes (js/organs/liver.js, already used above as
    # the far-away-referent fixture) rather than a synthetic file, so the demonstration is on the
    # same kind of population this check now actually scans.
    if os.path.exists(os.path.join(REPO_ROOT, DRIFT_FILE)):
        real = open(os.path.join(REPO_ROOT, DRIFT_FILE), encoding='utf-8').read().split('\n')
        hits = [i for i, t in enumerate(real, 1) if re.search(r'\bKatyal\b', t)]
        far = 1 if not hits else max(1, min(hits) // 2)
        fires, _r, ident, _e = check(
            [('%s:code_refs[epi-katyal-2000]' % MANIFEST, DRIFT_FILE, far, 'katyal', '2000')],
            {DRIFT_FILE: real}, {DRIFT_FILE}, {})
        arm(ident == 0 and len(fires) == 1 and fires[0][3] == OFF_LINE,
            'an entries[]-shaped pointer with a derived oracle FIRES OFF LINE on a real drifted '
            'line, the same way a backfill pointer always could — the gap this closes')
    else:
        arm(False, 'entries[] identity drift arm could not read its corpus file')

    # classify() arms (user ruling, 2026-09-10): the split is by ORIGIN STRING alone, so every one
    # of collect()'s four real shapes is exercised directly — a fixture here IS a positive control
    # for the split, the same discipline the SEER scraper's own layout assertion was just held to.
    arm(classify('%s:code_refs[hcc]' % MANIFEST) == 'code',
        "classify(): a manifest code_refs origin is CODE — structured, does not shrink by "
        "condensation")
    arm(classify('%s:backfill' % MANIFEST) == 'code',
        "classify(): a manifest backfill origin is CODE — the only population carrying an "
        "author+year oracle")
    arm(classify('%s:_uncited_migrating_watchlist' % MANIFEST) == 'prose',
        "classify(): a manifest `_`-prefixed narrative key is PROSE — free text wearing a JSON "
        "extension, condensed the same way CLAUDE.md prose is")
    arm(classify('.claude/battery.py line 42') == 'code',
        "classify(): a pointer inside a scanned .py file is CODE")
    arm(classify('.claude/run_checked.sh line 7') == 'code',
        "classify(): a pointer inside a scanned .sh file is CODE")
    arm(classify('.claude/phaseB_design.md line 187') == 'prose',
        "classify(): a pointer inside a scanned .claude/*.md file is PROSE")
    arm(classify('CLAUDE.md line 5567') == 'prose',
        "classify(): a pointer inside CLAUDE.md is PROSE, same as every other .md file")
    # THE POSITIVE CONTROL THE SPLIT EXISTS FOR: a prose-only shrink must not look like a code
    # shrink, and a code shrink must still look like one. Built from real-shaped origins, not just
    # classify() in isolation, because the failure this closes was in the AGGREGATE COUNT.
    mixed = [('%s:backfill' % MANIFEST, 'x', 1, 'A', '2000'),
             ('%s:backfill' % MANIFEST, 'x', 2, 'B', '2001'),
             ('.claude/phaseB_design.md line 10', 'x', 3, None, None),
             ('.claude/phaseB_design.md line 20', 'x', 4, None, None),
             ('.claude/phaseB_design.md line 30', 'x', 5, None, None)]
    code_n = len([p for p in mixed if classify(p[0]) == 'code'])
    prose_n = len([p for p in mixed if classify(p[0]) == 'prose'])
    arm(code_n == 2 and prose_n == 3,
        'the code/prose split of a synthetic 2-code/3-prose pointer list is 2/3, not a blend — '
        'removing one of the three prose entries would drop prose_n to 2 and leave code_n at 2 '
        'unchanged, which is the whole point: a documentation condensation cannot touch the '
        'floored metric')

    print('SELFTEST', 'PASS — fires on both dangling shapes, on a referent off its line, on one '
          'absent from the file, and on all five ways an exemption can be wrong; keeps floor-only '
          'pointers out of the identity count; refuses a substring match for a short surname and '
          'accepts a non-ASCII one; finds a far-away referent in real corpus bytes; classifies all '
          'four real origin shapes into CODE-OR-PROSE correctly, with a mixed-population fixture '
          'proving the split is real and not a blend; and takes its '
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
    code_pointers = [p for p in pointers if classify(p[0]) == 'code']
    prose_pointers = [p for p in pointers if classify(p[0]) == 'prose']
    # SPLIT BY POPULATION (user ruling, 2026-09-10). `pointer.pointers` used to ratchet the raw
    # collected TOTAL, which meant a legitimate documentation condensation removing prose pointers
    # (the 579 shrink, diagnosed and repaired rather than lowered) fired the same alarm as losing
    # real checkable coverage. CODE-AND-INSTRUMENT pointers (manifest structured refs, .py/.sh
    # comments) stay floored: they do not shrink from editorial condensation, only from a genuine
    # loss of coverage. PROSE pointers (CLAUDE.md, .claude/*.md, the manifest's own narrative
    # `_`-keys) are REPORTED, not floored — condensing documentation may remove them freely, and the
    # number stays visible in every run rather than becoming pressure to lower a floor that exists
    # to protect a different population. `pointer.identity_oracle` is unsplit on purpose: only
    # manifest `backfill` refs ever carry an author+year oracle, so it is already scoped to CODE by
    # construction — see classify()'s own docstring for why code_refs/backfill count as CODE.
    print('SIDECAR ' + json.dumps({
        'name': 'pointer_check',
        'metrics': {'pointer.pointers_code': len(code_pointers),
                    'pointer.pointers_prose': len(prose_pointers),
                    'pointer.identity_oracle': identity_total,
                    'pointer.on_line': identity_checked,
                    'pointer.exempt': exempted,
                    'pointer.flags': len(fires)},
        'ratchet': ['pointer.pointers_code', 'pointer.identity_oracle'],
    }, sort_keys=True))
    print('DONE pointer_check: %d/%d hand-typed pointers resolve (file tracked, line in range), '
          '%d code-and-instrument (floored) + %d prose (reported, not floored) = %d total, '
          '%d/%d with an author+year oracle land on their referent\'s line, %d declared off-line, '
          '%d flags, %d files scanned for prose pointers'
          % (resolved, len(pointers), len(code_pointers), len(prose_pointers), len(pointers),
             identity_checked, identity_total, exempted, len(fires), len(prose)))
    sys.exit(1 if fires else 0)
