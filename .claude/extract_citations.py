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
# DOCUMENTED BLIND SPOT: THE CITATION HEAD MUST BE A BARE SURNAME (2026-09-06). Recorded here
# and not only in the batch log, on the same ruling that put fraction_check's two blind spots in
# its header — a blind spot known only to a log is not known to the next person who trusts a
# clean run. P_ETAL below matches SURNAME + "et al.", so the PubMed-style head "Li Z et al." does
# not match: the initial sits where "et" must be. The citation then yields NO RECORD AT ALL, and
# any PMID/PMC in its clause is dropped with it. FOUND LIVE, not reasoned about: the ARID2
# name-it-or-remove-it remedy added "Li Z et al., Human Mutation, 2026 (PMID 42016321,
# PMC13092802, OA)" to a liver.js comment; the extractor's total rose by exactly one for the
# user-facing note's "Li et al." and citation_crosscheck's identifier-carrying population held at
# 142, so the two identifiers the remedy existed to produce reached no instrument. Dropping the
# initial made the same line yield a record carrying both ids. THE FAILURE IS SILENT IN BOTH
# DIRECTIONS: nothing fires, and the ratchet cannot see it either, because a citation that never
# becomes a record is an absence, not a decrease. Widening SURNAME to swallow initials is
# deliberately NOT done here: it is a change in reach, and per aafbe04's rule a change in reach
# must be declared and measured, not slipped in — and the measurement is not free, since "Li Z"
# and "Li Zhang" are the same shape to a regex that stops caring about token length.
#
# THE ABSENCE SIDE IS NOW COUNTED (2026-09-06, ruling on the blind spot above). The record count
# has a ratchet (.claude/record_count.json) which fails a DECREASE, and that bounds the corpus
# from below — but nothing bounded it from the side where growth silently fails to happen. A
# citation that never becomes a record is an ABSENCE, not a decrease: crosscheck never sees it,
# the ratchet cannot fire on it, and the sync check has nothing to compare. So the loop below now
# classifies every year it SKIPS, at the exact `continue` statements that skip it, and
# unreached_spans() exposes the result. The classification lives here rather than in the checker
# because this module owns the head-matching regexes; a second matcher elsewhere would drift from
# this one, which is the whole reason journal-name screening lives here too.
# .claude/citation_reach_check.py is the gate over the output, on citation_crosscheck's
# declared-and-tolerated pattern: a malformed head must be DECLARED with a reason, and an
# undeclared one fails the battery. A malformed head now reports itself instead of vanishing.
#
# FOURTH HEAD PATTERN: BARE SURNAME + YEAR (2026-09-06). A DECLARED AND MEASURED CHANGE IN REACH,
# in its own commit per aafbe04's rule, discharging the class citation_reach_check had been
# printing every run and holding for ruling. "(Bolton 2022)" matches none of the three patterns
# above — no "et al.", no "&", and P_PAREN1 needs a comma after the surname — so it produced no
# record, and the user-facing OCCC anchors 205/421, 188/421 and 17/102 all hang off heads of
# exactly this shape. It was the largest reach hole in the corpus.
#
# ITS MOST CONSEQUENTIAL RESULT IS A SUBTRACTION, NOT THE ADDITION, WHICH IS WHY IT IS READ FIRST.
# This commit REMOVES TEN PRE-EXISTING FALSE RECORDS while adding 87. Every one of the ten was a
# record the instruments downstream had been treating as a citation. A change in reach was expected
# to ADD; nothing predicted that a MISSING head pattern had been actively corrupting the records the
# extractor did produce. Both figures are a diff of the record set against HEAD fe8d627, and all 87
# additions were audited one by one against the corpus text rather than sampled.
#   FOUR MISATTRIBUTED RECORDS AT THREE SITES, from this pattern winning a nearer head than the old
#     rule could see. The old "nearest head wins" sort could only choose among et-al/&/paren heads,
#     so wherever the true head was a bare name it reached PAST it and took a different claim's
#     author:
#       TCGA|2012       -> Colombino|2012 + Jakob|2012 + Haluska|2006, beside the Curtin|2006 that
#                                        was already right: skin.js:400 lists FOUR bare-name heads
#                                        and the old rule resolved the whole line to one wrong one
#       Epstein|2014 x2 -> ISUP|2014     prostate.js:237 and :253 — the 2014 ISUP consensus is the
#                                        cited authority, and Epstein's own paper is 2016
#       Cichorek|2022   -> Lintzeri|2022 skin.js:250 — adjacent sentences, two different papers
#   SIX COHORT PERIODS read as publication years, all from the year guards below — Zhuang|2010 and
#     Zhuang|2015 (liver.js:177), Oweira|2010 and Oweira|2013 (pancreas.js:199), Lim|1974 and
#     Lim|2013 (thyroid.js:26). Each pairs a real author with the endpoints of a SEER interval
#     printed inside its own citation, and each sat beside that author's genuine record, so a
#     same-surname sanity check saw nothing wrong.
#   THE DIRECTION IS THE POINT, and it outranks the reach expansion that revealed it: a missing head
#   pattern does not merely LOSE citations, it MISATTRIBUTES them, because the fallback is
#   "whichever other author is near enough to match". citation_reach_check counts the first failure
#   mode and is STRUCTURALLY BLIND to the second — an absence is visible as a gap, while a
#   misattribution is a perfectly well-formed record pointing at the wrong paper. NO INSTRUMENT IN
#   THIS CHAIN CAN SEE IT. Reading the removals is what saw it.
#
# A PROPERTY OF THE 87 RECORDS THEMSELVES, NOT A NOTE ABOUT A CHECKER: NEITHER METADATA INSTRUMENT
# CAN REACH THEM, AND THEY ARE NOW THE CORPUS'S LARGEST COHORT OF THAT KIND.
#   citation_crosscheck held at exactly 143 records and the same 3 flags across this commit. That is
#     not a coincidence to be reassured by — it is the DEFINITION of the style. A bare "Surname
#     YEAR" head carries no PMID, no PMC and no doi, so there is nothing for a metadata cross-check
#     to fetch. The 87 are outside its reach BY CONSTRUCTION, and a flat crosscheck total across a
#     reach-widening commit must never be read as "the new records were checked".
#   citation_reach_check cannot see the failure mode these records are MOST prone to. Their heads
#     carry no "et al." anchor, so head-stealing is precisely the class above, and a year that
#     produced the WRONG record is not an absence — it will never appear in an absence count.
#   TOGETHER: the newest and largest single cohort of records in this corpus is unverifiable by both
#     instruments that would normally cover it. 87 of 490 records rest on one hand audit, performed
#     once, by one reader, at one commit. That is the weakest provenance any cohort here has, and it
#     is recorded as a property of the cohort because the next reader will otherwise see only that
#     every gate was green.
#
# STANDING PROCEDURE, ADOPTED ON RULING (2026-09-06): ANY CHANGE TO EXTRACTION REACH MUST DIFF THE
# RECORD SET AND READ EVERY REMOVAL. Not sample the removals — read each one. A removal is either a
# FIX or a LOSS, the two are indistinguishable in a count, and only reading the removed record
# against the corpus text tells them apart. This is the ONLY technique in the chain that catches
# misattribution, it requires no tool, and the four found here are its demonstration on real output.
# It is deliberately NOT mechanised: the judgement it needs is "is this record true", which is the
# one question no instrument in this chain can answer, and a gate that appeared to answer it would
# be worse than the procedure. It is written at the top of the module whose reach it governs so that
# the next person changing a head pattern reads it before measuring anything.
#
# ITS SECOND DEMONSTRATION IMMEDIATELY DID SOMETHING THE FIRST DID NOT: IT DECOMPOSED A DEFECT CLASS
# INSTEAD OF CONFIRMING ONE (2026-09-06, the commit adding P_PAREN_YEAR and PLUS_TAIL). Six removals
# from one candidate rule looked like one defect with one fix. Read individually they had FOUR causes
# — a missing head shape, a missing year guard, three years that are not citation years at all, and
# one true record — and the single rule that could produce all six was destructive because it was
# aimed at a boundary none of them actually crossed. THE LESSON IS NOT "read the removals" AGAIN, it
# is that the removal set of a proposed rule is a DIAGNOSTIC POPULATION, not a verdict on the rule:
# five of these six say nothing about boundaries and everything about what the extractor never asks.
# Powell and Travis are the proof: opposite verdicts, and indistinguishable to the rule that produced
# them both — see the record path, where the argument sits at the line it governs. THIS SENTENCE SAID
# "structurally identical" UNTIL 2026-09-06, when a structural rule separated them; the correction and
# what it does and does not concede are at the paren-shadow block on that same path.
#
# AND MEASURE PER FIX, NOT IN AGGREGATE, which is a corollary strong enough to state on its own. The
# two fixes in that commit were measured on separate throwaway trees before either was written into
# this file: P_PAREN_YEAR alone (490 -> 491, one false record out, two true ones in, one 'prose-year'
# absence correctly discharged) and PLUS_TAIL alone (490 -> 489, one removal, nothing added). TOGETHER
# THEY NET TO 490, so the aggregate diff of the commit that landed both is a corpus of the same size
# with four records changed underneath it. The ratchet holds, no --lower-ratchet was needed, and NO
# INSTRUMENT IN THE CHAIN WOULD HAVE SEEN THE DIFFERENCE HAD THE SUBSTITUTION RUN THE OTHER WAY.
#
# THE PROCEDURE IS ABOUT REMOVALS, NOT ABOUT RECORD SETS (2026-09-08, user ruling). Stated at that
# width it is: PROVE THE INFORMATION SURVIVES ELSEWHERE BEFORE REMOVING IT HERE — and the reason it
# generalises is that its whole content generalises. A removal is a FIX or a LOSS; the two are
# indistinguishable in a count; only reading the removed thing against where it is supposed to already
# live tells them apart. None of that mentions citations.
#   Demonstrated on prose: a 20.2KB index was consolidated to 13.5KB by moving detail into the files it
# pointed at, and every distinctive string slated for cutting was grepped in the file that was supposed
# to hold it ALREADY — before the cut, not after. The check that makes it honest is not the byte drop
# but the ENTRY COUNT, which went UP (20 -> 21). Size falling while entries fall too is the LOSS case
# wearing the fix's clothes, exactly as a corpus shrinking by a "better pattern" is.
#   THE DIRECTION OF THE BORROWING IS THE PART TO GET RIGHT, because the fourth-property note in
# CLAUDE.md forbids the other one: an untracked file cannot be a PRECEDENT for how something inside
# this tree is declared. Here the traffic runs outward — this tracked rule governed a removal
# somewhere else — and nothing outside the tracked set is being cited as authority for anything in it.
# Outward is free; inward needs the index.
#
# THE CLASS SPLIT IN THREE WHEN MEASURED, and only one part is closed here. Of the 80 spans the
# reach check reported at HEAD fe8d627, 69 (51 heads) are "Surname YEAR" with nothing between them
# — that is what this pattern reaches. The residual did NOT split the way this comment first
# predicted, and the correction is worth keeping because it was a prediction about a population made
# before measuring it:
#   'bare-name-comma-year' — "..., HEAD, YEAR". MEASURED, the whole bucket is CONSORTIUM heads:
#     "TCGA, 2017", "KGCA, 2011", "Working Group, 2015". These are real citations with a real head,
#     missed for one character — P_BARE_YEAR requires whitespace between head and year and finds a
#     comma. Not fixed here because permitting the comma re-opens the head test to every
#     comma-preceded capitalised word in every parenthetical, which is a much wider blast radius
#     than this commit's own.
#   'journal-adjacent-year' — the token beside the year is a JOURNAL and the true author sits
#     FURTHER LEFT. bladder.js's "(48,789/53,142, Park, Curr Oncol, 2023, SEER)" is HERE, not in the
#     comma bucket where an earlier draft of this comment put it: the head adjacent to that year is
#     "Curr Oncol", and head_is_journalish refuses it, so the span never reaches the comma branch at
#     all. Reaching Park means relaxing P_PAREN1's left anchor from "\(" to a comma class — a
#     different fix from the one above, for what looked like the same shape.
#   The two are counted separately for the reason the whole class was renamed rather than left
#   inside a shrinking 'bare-name-year': a number that drops to near-zero without its residual being
#   named is a number that hides things, and a residual with two causes named as one is the same
#   defect a level down.
# THE SURVIVING COUNTS ARE NOT RESTATED HERE: citation_reach_check prints every absence kind, with
# its zero if it has one, on every run — and a second copy in a comment is a number that goes stale
# where nothing checks it. The 80/69/51 above are safe to write down only because they are pinned to
# a commit that cannot change; anything describing the CURRENT corpus belongs in the tool's output.
#
# THE GUARDS, EACH FROM A MEASURED FALSE HEAD — this pattern is the weakest head shape in the
# file (a capitalised word adjacent to a year is a very low bar), so the guards it needed are
# collected here. TWO OF THEM TURNED OUT NOT TO BE ABOUT THIS PATTERN AT ALL and now apply to the
# whole matcher; that is stated per guard rather than in one sweeping sentence, because "scoped to
# this pattern" is what the first draft of this comment claimed and it was wrong.
#   JOURNAL WORDS, ANY POSITION. head_is_journalish replaces a first-word-only lexicon test that
#     both "PLoS Comput Biol" and "WHO-2020" walked straight through — the first because the
#     SURNAME match began at "Comput" and never saw "PLoS", the second because "WHO-" carries a
#     trailing hyphen and did not equal "who". Punctuation is stripped and every word is checked.
#     Applied to EVERY head pattern, not just this one, because it is strictly a widening of
#     rejection and MEASURED FREE: at HEAD fe8d627 no record's author contained a journal word
#     under the new test, so no existing acceptance changes.
#   YEAR RANGES, BOTH ENDS. "in a German 2003-2014 registry" and "CBTRUS, US 2018-2022" are
#     data-collection spans, not publication dates, and both would otherwise have produced a
#     record with an adjective for an author. RANGE_START refuses a year that OPENS a range;
#     RANGE_END refuses one that CLOSES one. THE CLOSING END WAS NOT IN THE FIRST DRAFT, and its
#     absence was not hypothetical: breast.js's "24,822 TNBC patients (2010–2015)" is a SEER
#     cohort period whose second year the old code read as a publication year — see the ten
#     removed records above, six of which are exactly this.
#   ISO DATESTAMPS. "PIPELINE CORRECTION 2026-09-03" and "DOWNGRADED 2026-09-06" are this
#     project's own audit stamps, and their year is followed by "-MM-DD". Without this guard the
#     new pattern produced five records authored by shouted verbs.
#   CRSLS. Added to JOURNAL_LEX. It is a journal (SLS case reports), it occurs exactly once in the
#     corpus, and no record is authored by it — the smallest possible lexicon widening for a real
#     journal token, recorded here so it is not mistaken for a general acronym rule.
#   OPEN-ENDED VINTAGES, "2010+" (PLUS_TAIL, added 2026-09-06 in its own commit). The one guard here
#     that DELETES A RECORD rather than relabelling an absence: Park|2010 was a real author and a
#     real registry vintage welded into a citation that never existed. It is also the one that shows
#     the guards were incomplete in a readable way — bladder.js refused "2010-2015" and accepted
#     "2010+" TWO LINES APART, the same fact about the same extraction, because a dash was read and
#     a '+' was not. See disqualified_year, where the not-free-ness is measured.
#
# THE YEAR GUARDS ARE GLOBAL, WHICH MAKES THEM A SECOND CHANGE IN REACH INSIDE THE SAME COMMIT.
# disqualified_year is tested ONCE per year, before any head pattern is considered, rather than per
# candidate: a datestamp is not a publication year no matter which head shape sits beside it, and
# leaving the test per-candidate gave one span two different answers depending on which pattern
# won. So the guards also remove records the three OLD patterns had been producing. That is not a
# side effect to be discovered later — it is measured, and the six records it removed are listed
# above with the four misattributions.
#
# ONE FALSE AUTHOR IS DECLARED, NOT GUARDED. skin.js:306 reads "TCGA 2015 itself MIS-CITES Pollock
# 2003 twice", and Pollock 2003 IS the paper that year belongs to — the year is filed correctly and
# only the author string is polluted, by the shouted "MIS-CITES" riding along into it. The obvious
# fix, trimming a leading all-caps word, would damage genuine corporate heads: "TCGA Research"
# becomes "Research", "WHO Classification" becomes "Classification". So it is pinned by a fixture
# instead and waits for an acronym lexicon that can tell an organisation from a shout.
#
# ONE IMPRECISION IS DECLARED AND KEPT, not fixed: SURNAME admits two capitalised words, so
# colon.js's national-cohort list yields "Sweden Engstrand", "Germany Hackl" and "Burgundy
# Manfredi" — a leading place name absorbed into the author. Narrowing SURNAME to one word is not
# available: "Safaee Ardekani" in the same list, and "Mehrvarz Sarshekeh" and "von der Maase"
# elsewhere, are genuinely multi-word surnames, which is why the two-word form exists. The class is
# also PRE-EXISTING rather than introduced here — HEAD's own records already contain "But Friemel"
# and "Foulkes WD" from the older patterns — so this pattern adds three instances to a defect the
# corpus already had.
#     ("van der Maase" above was "von der Maase" in the corpus all along; corrected in place
#      2026-09-07 when the enumeration below made every such string checkable. A declaration that
#      misquotes its own subject is the rot class this project keeps finding, and it found one here.)
#
# THAT PARAGRAPH WAS THE CLASS'S ONLY HOME UNTIL 2026-09-07, and it named some members while the SET
# was ambient — which is what the ruling that closed it said: "Declare the enumerated list with
# fixtures pinning it, so the set can't grow silently." The enumeration now lives in
# .claude/citation_head_check.py, a closed partition over every record author that is not a single
# run of letters: each is declared IMPRECISE (with the string it should have been) or WELL_FORMED, and
# a head in neither fails the battery. Four members of the class are pinned by fixtures at the bottom
# of this file, and the block there records what pinning them showed — the imprecisions come out
# through THREE different head patterns, so the fault is SURNAME's and not any pattern's, and the
# earlier plan ("a pass over all four patterns with a place lexicon") was aimed one level too low.
# One edit to SURNAME moves every pattern's output at once, which is what makes it a change in reach.
#
# CONDITION (7): selftest() below proves each of these can FIRE and, just as important, that the
# new pattern does NOT STEAL heads — "Smith et al., Nature Genetics, 2019" must still yield Smith,
# because a $-anchored head always wins the nearest-head sort and would otherwise take every
# journal-adjacent year in the corpus. It is invoked by battery.py's preflight, not left to be run
# by hand: this module is a declared NON-instrument, so an uninvoked selftest here would be exactly
# the dead-instrument shape the battery exists to prevent.
#
# Usage: python3 .claude/extract_citations.py <out.json> [file ...defaults to js/organs/*.js]
#        python3 .claude/extract_citations.py --selftest
# `glob` is gone from this import on purpose — see corpus_paths() below, which replaced the default
# glob with a read of git's index. Removed rather than left unused, so the next reader does not reach
# for the thing the ruling took away.
import json, re, sys, os, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from citation_polarity import classify_window, window_for

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORPUS_DIR = 'js/organs'
CORPUS_EXT = 'js'


def corpus_paths(tracked=None):
    """THE CORPUS: every TRACKED js/organs/*.js, in sorted order. The default population for this
    module and — by import — for citation_paren_ledger.py, which used to keep its own identical glob.

    FROM GIT, NOT FROM A GLOB. This module's record count is battery.py's ratcheted `records` metric
    and citation_crosscheck's ratcheted `records`, and a glob sees files git does not have, so an
    untracked scratch organ would raise a floor A FRESH CHECKOUT CANNOT REPRODUCE — the clone then
    fails SHRANK with no defect anywhere in it. User ruling, 2026-09-07: "what ships is what's
    tracked — a fresh checkout has only tracked files", therefore "A RATCHETED METRIC MUST DERIVE FROM
    TRACKED FILES." The confirmed instance was one directory over: an untracked draft in .claude/
    moved internal_quote_check's ratcheted marked count by one.
    THE INDEX, NOT HEAD, so a newly `git add`ed organ counts in the commit that adds it; the same
    choice battery.py makes for the same reason. Filtering rather than a `js/organs/*.js` pathspec
    because git's wildcards cross directory separators and a future subdirectory would be swept in
    silently. Explicit `[file ...]` arguments still win — the arms and one-off runs need them.
    `tracked` is injectable so the arms can drive the filter without depending on what is on disk."""
    if tracked is None:
        out = subprocess.run(['git', 'ls-files'], cwd=REPO_ROOT, capture_output=True, text=True,
                             check=True).stdout
        tracked = [line for line in out.split('\n') if line]
    found = []
    for path in tracked:
        if not path.startswith(CORPUS_DIR + '/'):
            continue
        relative = path[len(CORPUS_DIR) + 1:]
        if '/' in relative:            # a future subdirectory is not the corpus until someone says so
            continue
        if relative.rsplit('.', 1)[-1] == CORPUS_EXT:
            found.append(path)
    return sorted(found)

YEAR = r'(?:19|20)\d{2}'
# lowercase particles ride along ("von der Maase"); two-cap compounds too ("Mehrvarz Sarshekeh")
SURNAME = r"(?:(?:van|von|de|der|den|del|di|da)\s+)*[A-Z][A-Za-z'’’-]+(?:\s+[A-Z][A-Za-z'’’-]+)?"
JOURNAL_LEX = {'j','am','int','proc','natl','acad','sci','eur','engl','med','nat','ann','arch',
 'clin','oncol','pathol','urol','dermatol','gastroenterol','hepatol','endocrinol','radiol',
 'epidemiol','biol','chem','genet','res','rep','rev','dis','ther','invest','surg','cancer',
 'cancers','oncology','nature','science','cell','lancet','nejm','jama','bmj','plos','pnas',
 'jco','cureus','biomedicines','neoplasia','histopathology','gut','blood','virchows','acta',
 'world','journal','of','the','communications','insight','statpearls','seer','who',
 'oncotarget','front','frontiers','expert','seminars','current','trends','jci','radiother','radiotherapy',
 'crsls'}   # crsls: a real journal (SLS case reports), one corpus mention, no record authored by it

def head_is_journalish(head):
    """True if ANY word of a candidate head is a journal word. The predicate is shared by the
    matcher and classify_absence so the two cannot drift — the same reason journal screening
    lives in this module at all rather than in the checker.

    THREE THINGS IT FIXES over the first-word-only test it replaces, each measured, not supposed:
      ANY POSITION — "PLoS Comput Biol" was accepted because SURNAME began its match at "Comput",
        so the first word the test saw was already past the journal token that would have caught it.
      PUNCTUATION — "WHO-2020-based" yielded the head "WHO-", and 'who' has been in JOURNAL_LEX all
        along; the trailing hyphen alone defeated the equality test.
      NO SPLIT ON EMPTY — a head is never empty here, but stripping to '' must not index [0].
    MEASURED FREE on the existing corpus: at HEAD fe8d627, no record's author contained a journal
    word under this test, so widening rejection changes no existing acceptance. The record COUNT
    that measurement ran over is deliberately not written down — .claude/record_count.json owns it,
    and a copy here would be a second source of truth that nothing checks."""
    return any(re.sub(r"[^A-Za-z]", '', w).lower() in JOURNAL_LEX for w in head.split())

# A year that OPENS a range is a data-collection span, not a publication date: "a German
# 2003-2014 registry", "CBTRUS, US 2018-2022". Both would otherwise yield a record with an
# adjective for an author.
RANGE_START = re.compile(r'\s*[–—-]\s*(?:19|20)\d{2}\b')
# ...and a year that CLOSES one is the same span seen from the other end. Added because guarding
# only the opening year was half a rule and a fixture caught it: in "(CBTRUS, US 2018-2022)" the
# 2018 was refused while the 2022 next to it took P_PAREN1's head and became a record, so one
# range produced one rejection and one false citation. Matched against the text BEFORE the year,
# which is why it is a separate pattern rather than a branch of the one above.
RANGE_END = re.compile(r'(?:19|20)\d{2}\s*[–—-]\s*$')
# A year carrying an ISO day/month tail is a DATESTAMP — this corpus's own editorial markers,
# "PIPELINE CORRECTION 2026-09-03", "DOWNGRADED 2026-09-06". FOUND BY AUDITING THE RECORDS THIS
# COMMIT ADDS, not by reasoning: five of the first ninety-two were the atlas's own comment
# vocabulary cited as an author, because an ISO date reads to a regex exactly like a year beside a
# capitalised word. The full day form is required rather than a bare "-NN", which would also
# swallow the two-digit range style ("1990-95") that RANGE_START deliberately does not cover.
ISO_TAIL = re.compile(r'-\d{2}-\d{2}\b')
# ...and a year with a trailing '+' is an OPEN-ENDED VINTAGE — a range whose right end is "now"
# rather than a fourth digit. "SEER 2010+", "a SEER 17-registry extraction, 2010+". Found because
# RANGE_START reads a dash and nothing read a '+', so the same fact about the same registry
# extraction was refused when written "2010-2015" and accepted as a publication year when written
# "2010+", TWO LINES APART in bladder.js. That produced Park|2010 beside the real Park|2023: the
# right author, the wrong year, and a record that looked perfectly well-formed.
# THE '+' IS REQUIRED TO BE ADJACENT, no whitespace allowed, because a '+' one space out is
# arithmetic or a list join ("2015 + 2019 cohorts pooled") and the digits there ARE years.
PLUS_TAIL = re.compile(r'\+')


def disqualified_year(text, yend):
    """True if the four digits ending at `yend` are not a publication year at all. `yend` is the
    year's end, so the range-END test looks back across the year itself (yend - 4).

    DECIDED ABOUT THE YEAR, NOT ABOUT THE HEAD, and that is why it is a function rather than two
    checks inside the candidate loop. The first draft scoped the range test to the new bare-name
    pattern, on the reasoning that a narrow guard claims no more than the measurement covers. A
    selftest fixture then showed what the narrow scope leaves behind: "(CBTRUS, US 2018-2022)"
    hands P_PAREN1 a head, so the range-opening year was refused for one head shape and accepted
    for another — the same span, two answers, decided by which pattern happened to match. A fact
    about the year has to be settled before any head is considered. MEASURED FREE at the point it
    was widened: no record the corpus reaches has a year of either shape.

    THE '+' ADDITION WAS NOT FREE, AND THAT IS THE DIFFERENCE WORTH READING. Every earlier guard
    here was measured to remove nothing, so each was pure classification. PLUS_TAIL removes exactly
    one record — Park|2010, bladder.js:27 — which is the point of adding it: the year was never a
    publication date. A guard that deletes a record is a stronger claim than one that only relabels
    an absence, so it was measured ALONE, not in aggregate with the head pattern landing beside it
    (490 -> 489, one removal, zero additions), and the removal was read against its own line."""
    return bool(RANGE_START.match(text, yend) or ISO_TAIL.match(text, yend)
                or PLUS_TAIL.match(text, yend)
                or RANGE_END.search(text, max(0, yend - 44), yend - 4))

def closed_year_paren(seg):
    """True if a parenthetical CARRYING A YEAR closed inside `seg` — a completed citation.

    THIS IS THE ';' RULE WITH A SECOND DELIMITER, and reading it that way is the whole
    justification. The record path already refuses a head when a ';' sits between it and the year,
    on the grounds that the ';' proves the head belongs to a PREVIOUS citation. A parenthetical that
    carried a year and then closed proves the same thing about the same span with different
    punctuation: "Powell et al. (Nature, 1992) for APC-comes-first, and quotes the 1990 model" ends
    its citation at the ')' exactly as "Ziol et al., Hepatology, 2018; Acad Pathol, 2024" ends its
    at the ';'. Neither is a boundary test on the YEAR; both are positive evidence a citation ENDED.

    "CARRYING A YEAR" IS THE ENTIRE LOAD-BEARING NARROWING, and the objection it answers was already
    written in this file — classify_absence's etal-shadow note rejected a closing paren for the
    absence path in these words: "a ')' also closes ordinary parenthetical asides mid-citation
    ('Nature Genetics (impact factor aside), 2019'), so it would buy nothing today at the cost of a
    false positive later." Correct, and requiring a YEAR inside the paren removes the cost: an aside
    carries no year, so it cannot fire. That is also precisely what separates the two spans below,
    and it is why the absence path keeps the bare-year test while this path takes the narrow form —
    an absence has no record to lose, this path deletes one.

    START = 0 WHEN THE STACK IS EMPTY, which is not a fallback but the Schulze case: the '(' opened
    BEFORE the head, so the span from the head to the ')' is that parenthetical's tail, and the year
    it carries is inside it. "(Schulze et al., Nature Genetics, 2015) and a mixed TCGA cohort
    (Nature, 2017" reaches the ')' with nothing on the stack, and the 2015 behind it is the point."""
    stack = []
    for i, ch in enumerate(seg):
        if ch == '(':
            stack.append(i)
        elif ch == ')':
            start = stack.pop() if stack else 0
            if re.search(YEAR, seg[start:i]):
                return True
    return False

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
# The fourth head (see header): "(Bolton 2022)" — surname, whitespace, year, nothing between.
# $-ANCHORED ON THE LOOKBACK, which is the whole design and also the whole hazard. `back` ends
# exactly where the year begins, so this matches only a head ADJACENT to the year, and its end()
# is therefore always len(back) — it always sorts first under "nearest head wins", correctly,
# since nothing can be nearer. That is why it must be able to LOSE: a journal word anywhere in it
# sends the loop on to the next-nearest candidate, so "Smith et al., Nature Genetics 2019" still
# yields Smith rather than the journal that happens to sit closer. \s+ not \s*: "Bolton2022" is
# not a citation. The whitespace is deliberately unbounded because matching runs on JOINED text,
# so a surname at one line's end and its year at the next line's start arrive several spaces apart.
# EVERY RECORD THIS PATTERN MINTS IS UNVERIFIABLE BY BOTH METADATA INSTRUMENTS, which is a property
# of the pattern and not only of the 87 records it added on the day it landed — so it is stated here,
# at the line that decides, and not only in the header. A bare "Surname YEAR" head carries no PMID,
# PMC or doi, so citation_crosscheck has nothing to fetch and cannot reach it; and the failure mode
# it is most prone to is head-stealing, which citation_reach_check cannot see because a year that
# produced the WRONG record is not an absence. A record from here rests on a HAND READ or on nothing.
# Growth in this pattern's share of the corpus is growth in the unverifiable share. See the header.
P_BARE_YEAR = re.compile(r'(' + SURNAME + r')\s+$')
# The fifth head: "TCGA (2015)" — surname, then an OPEN PAREN the year sits just inside. Found not
# by looking for missing shapes but by auditing a FALSE RECORD: prostate.js:204-205 reads "Fontugne
# et al. (2022) and TCGA (2015) both frame SPINK1...", and with no pattern able to see "TCGA (",
# the 2015 fell back to the nearest reachable head and became Fontugne|2015. The shape sat in the
# gap between two patterns that each miss it by one character — P_BARE_YEAR requires the year to
# follow WHITESPACE, P_PAREN1 requires the surname to sit INSIDE the paren with a comma after it.
# A MISSING HEAD PATTERN IS A MISATTRIBUTION ENGINE, and this is the second demonstration in two
# commits: the fix REMOVES a false record and ADDS the true owner, in the same span.
# \s* NOT \s+, deliberately differing from P_BARE_YEAR one line up. There the whitespace carries the
# whole separation, so "Bolton2022" must not parse; here the paren is the separator and "TCGA(2015)"
# is still citation-shaped. The two patterns disagree because their separators differ, not by slip.
# $-ANCHORED like P_BARE_YEAR, so it always sorts first under "nearest head wins" and DEPENDS on the
# journalish fallback to lose: "(Nature (2017), 44%)" must not hand the year to Nature.
# It inherits P_BARE_YEAR's unverifiability in full — no id, no journal, invisible to both metadata
# instruments. Its first two records are hand-read (prostate.js:205 and :231, both the TCGA 2015
# prostate paper the file cites with metadata elsewhere) and that is all they rest on.
P_PAREN_YEAR = re.compile(r'(' + SURNAME + r')\s*\(\s*$')

# --- absence classification (see the header block) -------------------------------------------
# A year that produced no record falls into exactly one of the kinds classify_absence returns
# (enumerated in citation_reach_check.py's ALL_KINDS, which is the gate over them). Only the 'etal-'
# kinds are citation-shaped enough to gate on, because only they carry an unambiguous "et al."; the
# rest are reported and not gated (ALL_KINDS enumerates every kind, so a kind at zero still prints
# its zero). 'prose-year' is a genuine non-citation.
SUR_AT_END = re.compile(SURNAME + r'\s*$')
TRAILING_TOKENS = re.compile(r'([^\s,;:()\[\]"]+(?:\s+[^\s,;:()\[\]"]+)?)\s*$')

def classify_absence(text, wstart, ypos, back):
    """Why did this year yield nothing? Returns (kind, key) — key is the head TEXT, not a
    location, because the head SHAPE is the defect and a line number churns on every edit."""
    # FIRST, BEFORE ANYTHING ABOUT HEADS, and the reason is a defect this ordering caused. The
    # year guards correctly stopped six pre-existing false records — "Zhuang et al. ... SEER,
    # N=2,197, 2010–2015" was yielding Zhuang|2010 and Zhuang|2015 alongside the real Zhuang|2025,
    # because a cohort period reads to a regex exactly like a publication year. But with this test
    # placed lower down, each of those years then fell into the branch below, found the span's
    # genuine "et al.", and was reported as a GATED unreached citation head: the checker would have
    # demanded a human declare why "Zhuang" is unreachable when Zhuang is perfectly well reached.
    # A correction upstream turned into five new false defects downstream, and both directions came
    # from the same mistake — asking about the head before settling what the year is.
    #
    # ITS OWN KIND, not prose-year: these absences are EXPLAINED — the year is a cohort period or a
    # datestamp and was never a citation — whereas prose-year means "no citation-shaped evidence
    # here at all". Folding them together would grow the least informative bucket by the exact
    # amount the guards understood.
    if disqualified_year(text, ypos + 4):
        return 'data-span-year', None
    etals = [mm for mm in re.finditer(r'et\s+al', back)]
    if etals:
        # THE BOUNDARY TEST COMES BEFORE ANY QUESTION ABOUT THE HEAD'S SHAPE, and the placement is
        # the whole correction (2026-09-06). An intervening YEAR means a COMPLETE CITATION already
        # consumed this "et al.", so the year now being classified has no head of its own — exactly
        # what a ';' means in the record path's semicolon-shadow rule, which this branch was missing.
        # Asking about the head's shape first is the SAME MISTAKE ONE LEVEL DOWN as asking about the
        # head before settling what the year is, which is recorded at the top of this function
        # because it already happened once here. So the test guards the whole `if etals:` block, not
        # just the out-of-range branch inside it: whether the head was cut in half is irrelevant if
        # the head is not ours.
        #
        # NO KEY, DELIBERATELY. semicolon-shadow names the head it shadows, but here the finding is
        # precisely that the nearest "et al." does NOT belong to this year, so naming its surname
        # would attach a real, well-reached author to somebody else's absence — the very
        # misattribution this test exists to stop, re-created in the report.
        #
        # A YEAR AND NOT A CLOSING PAREN, though both were considered and BOTH GIVE THE SAME ANSWER
        # ON THE CORPUS TODAY (measured: one span, the Louis case, is caught by either). The year is
        # the principled test — it is positive evidence that a citation ENDED — whereas a ')' also
        # closes ordinary parenthetical asides mid-citation ("Nature Genetics (impact factor aside),
        # 2019"), so it would buy nothing today at the cost of a false positive later. The choice is
        # not load-bearing at this commit and is recorded because it becomes load-bearing at the next
        # span that hits it.
        #
        # AND THAT OBJECTION WAS LATER ANSWERED ON THE OTHER PATH RATHER THAN HERE (2026-09-06):
        # closed_year_paren requires the paren to CARRY A YEAR, which an aside does not, and the
        # sentence above is the fixture that pins it. The reasoning survives unchanged FOR THIS PATH —
        # a bare closing paren really is unusable, this path really does gain nothing from the
        # narrowed form today, and a year is still the principled test where a year suffices. What the
        # record path needed was a test the year could not give it, since a year between head and
        # target is exactly what Travis|2011 legitimately has.
        if re.search(YEAR, back[etals[-1].end():]):
            return 'etal-shadow', None
        # anchor on the "et al." NEAREST the year — the extractor's own "nearest head wins"
        # semantics. Widening the lookback instead finds a NEIGHBOURING citation's head and
        # misclassifies a malformed head as merely distant (measured: it mislabelled 6 of 18).
        pre = back[:etals[-1].start()]
        head_was_cut = (wstart > 0 and pre and pre[0] not in ' \t'
                        and text[wstart - 1] not in ' \t(,;"')
        if head_was_cut:
            # 'etal-out-of-range' HAD AN UNRELIABLE KEY BY CONSTRUCTION, AND IT WAS THE ONE KIND
            # HERE THAT DID (2026-09-06; found by measurement, fixed by the boundary test above in
            # its own commit). This branch reaches 40 chars PAST the lookback to complete a surname
            # that was cut in half, and NOTHING tested whether the "et al." it anchored on belonged
            # to THIS year — across a window that long it frequently did not. The record-producing
            # path already had the rule this branch lacked: a ';' between head and year means the
            # head belongs to a PREVIOUS citation (see the semicolon-shadow continue below). A YEAR
            # between them means the same thing, and was not tested. Now it is.
            #
            # THE KEY IS NOW TESTED, NOT PROVEN, and the difference is worth keeping: the boundary
            # test only refuses an "et al." that a COMPLETED citation demonstrably consumed. An
            # "et al." that is not ours with no intervening year would still be anchored on and
            # still be keyed wrong. What can be said is that the bucket is empty and every way it
            # was observed to go wrong is closed — which is a weaker claim than correctness, and
            # this branch's whole history is a lesson in not upgrading the one to the other.
            #
            # ALL THREE INSTANCES AT HEAD fe8d627 WERE WRONG, EACH IN A DIFFERENT WAY, and each had
            # a confident hand-written tolerance in citation_reach_check explaining a pairing that
            # was never checked:
            #   Gao, breast.js  the "year" was the closing end of a SEER cohort period, so not a
            #                   citation at all; RANGE_END now refuses it.
            #   Curtin, skin.js the year belonged to TCGA 2015, four words away; the fourth head
            #                   pattern now reaches its true owner and the span is gone.
            #   Louis, brain.js a prose year, and the one the boundary test above now catches:
            #                   brain.js:209 carries three 2021s, and the real "(Louis et al.,
            #                   Neuro-Oncology, 2021)" is reached at 24 chars and has a record. The
            #                   gated one was "the 2021 WHO update" in the note prose, whose lookback
            #                   grazed that citation's "et al." at 125 chars — with that citation's
            #                   OWN year sitting between the two, which is what the test reads.
            # SCOPE, MEASURED BEFORE THE FIX WAS WRITTEN so it was not guesswork: of the 16 gated
            # spans, Louis was the ONLY one where a year or a closing paren sat between the anchoring
            # "et al." and the year. All 15 'etal-malformed-head' spans are clean — nothing but "et
            # al."'s own period and the journal name — so those five declarations name true owners,
            # verified rather than assumed. The prediction was that a boundary test would empty this
            # bucket and touch nothing else; the commit that added it measured exactly that, and the
            # prediction is left in place so the two can be read against each other.
            completed = text[max(0, wstart - 40):wstart] + pre
            m = SUR_AT_END.search(completed.rstrip())
            if m:
                # a well-formed surname sitting further back than the 130-char lookback
                return 'etal-out-of-range', m.group(0).strip()
        m = TRAILING_TOKENS.search(pre.rstrip(' ,;'))
        return 'etal-malformed-head', (m.group(1).strip() if m else '<empty>')
    open_paren = text.rfind('(', max(0, ypos - 240), ypos)
    if open_paren != -1 and open_paren > text.rfind(')', max(0, ypos - 240), ypos):
        # THE COMMA DECIDES WHICH CLASS, and it is read BEFORE the rstrip that would destroy it.
        # "(Bolton 2022)" is shape A, reachable by P_BARE_YEAR and therefore expected to be near-
        # empty from now on. "(48,789/53,142, Park, Curr Oncol, 2023)" is shape B, where the token
        # adjacent to the year is the JOURNAL and the author sits further left — a different fix
        # (relaxing P_PAREN1's left anchor) with a much wider blast radius. Naming it separately is
        # the point: an 80 that becomes an 11 without the residual being named is a number that
        # hides things.
        comma_before_year = back.rstrip().endswith(',')
        m = SUR_AT_END.search(back.rstrip(' ,'))
        # the year itself was settled at the top of this function, so all that is left here is
        # which head shape sits beside it
        if m:
            head = m.group(0).strip()
            # A JOURNAL WORD ADJACENT TO THE YEAR IS EVIDENCE OF A CITATION, NOT EVIDENCE OF
            # PROSE — so it gets a kind of its own instead of falling into prose-year. This is a
            # DELIBERATE DEPARTURE from the matcher, which rejects the same head: the matcher is
            # deciding whether to name an author (and must not name a journal), while this
            # function is deciding whether a citation went unreached (and a journal name means one
            # probably did). Sharing the predicate but not the disposition is the point.
            #
            # WITHOUT THIS BRANCH THE CHANGE WOULD HAVE LOST VISIBILITY. bladder.js:44's
            # "(48,789/53,142, Park, Curr Oncol, 2023, SEER)" is a real citation with a real
            # author that produces no record; at HEAD it was reported, because the first-word
            # lexicon test happened not to contain 'curr'. Strengthening that test to all words
            # would have moved it into prose-year — "a genuine non-citation" — and a strictly
            # better journal test would have made a real loss invisible. The old line was an
            # artifact anyway: whether an unreached journal-headed span was reported depended on
            # whether the journal's FIRST word was in the lexicon ('J Gastroenterol' hidden,
            # 'Curr Oncol' reported), which is not a distinction anyone chose.
            #
            # THE POPULATION IS MIXED AND UNMEASURED, stated here rather than discovered later:
            # some of these are authorless-by-design journal-only mentions that the extractor
            # intends to skip and are NOT defects ("(J Gastroenterol, 2025)"), and some are
            # shape-B citations whose author sits further left than any pattern in this file
            # reaches and ARE real losses (the Park span). Telling them apart means looking left
            # past the journal for a surname, which is the relaxed-P_PAREN1 change scoped out of
            # this commit. So it is REPORTED, never gated, and the split belongs to that work.
            if head_is_journalish(head):
                return 'journal-adjacent-year', head
            return ('bare-name-comma-year' if comma_before_year else 'bare-name-year'), head
    return 'prose-year', None

def unreached_spans(paths):
    """Citation-shaped spans that produced NO record, grouped by (kind, head text)."""
    absences = []
    extract(paths, absences)
    return absences

def extract(paths, absences=None):
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
            wstart = max(0, ypos - 130)
            back = text[wstart:ypos]
            # collect the LAST match of every head pattern; the head NEAREST the year wins
            # (an "et al." farther back must not shadow a nearer "&"-list — the Skok/Santucci
            # validation failure)
            cands = []
            # settled before any head is considered: a datestamp or a range start is not a
            # publication year, so no head shape can turn it into a citation (see
            # disqualified_year — leaving this per-candidate gave one span two different answers)
            if not disqualified_year(text, ym.end()):
                for pat, kind in ((P_ETAL, 'etal'), (P_AMP, 'amp-list'), (P_PAREN1, 'single-paren'),
                                  (P_BARE_YEAR, 'bare-year'), (P_PAREN_YEAR, 'paren-year')):
                    m = None
                    for mm in pat.finditer(back): m = mm
                    if m: cands.append((m, kind))
            cands.sort(key=lambda c: -c[0].end())
            # nearest head to the year wins, but a lexicon-rejected head FALLS BACK to the
            # next-nearest instead of skipping the citation — "(JCI Insight, 2022" must not
            # shadow the true "Fontugne et al." head just because it sits closer to the year.
            # THE FALLBACK IS WHAT MAKES THE $-ANCHORED FOURTH PATTERN SAFE: it always sorts
            # first, so without a way to lose it would take the head of every journal-adjacent
            # year in the corpus.
            m = conf = None
            for cm, kind in cands:
                if head_is_journalish(cm.group(1)): continue
                m, conf = cm, kind; break
            if not m:
                if absences is not None:
                    absence_kind, absence_key = classify_absence(text, wstart, ypos, back)
                    absences.append({'file': path, 'line': line_at(ypos), 'year': year,
                                     'kind': absence_kind, 'key': absence_key})
                continue
            author, head_end = m.group(1), m.end()
            # THERE IS NO YEAR-COUNTING ANALOGUE OF THE ';' RULE BELOW ON THIS PATH, AND THERE MUST
            # NOT BE ONE (2026-09-06, measured twice, then RULED OUT on the evidence — a closed
            # question, not a deferred one). A DELIMITER analogue is a different thing and one now
            # exists: the ';' rule immediately below, and the second delimiter under it. What is ruled
            # out here is any rule whose input is HOW MANY YEARS INTERVENED. classify_absence refuses
            # an "et al." that a COMPLETED citation consumed, on the grounds that an intervening year
            # proves the citation ended. The symmetry is inviting and it is wrong here: an absence has
            # no record to lose, while this path deletes one.
            #
            # WHY NO YEAR-COUNTING RULE CAN WORK, WHICH IS SHARPER THAN "the measurement came out
            # badly": POWELL AND TRAVIS ARE INDISTINGUISHABLE TO IT AND HAVE OPPOSITE VERDICTS.
            #   colon.js:172   "Powell et al. ... Nature, 1992 ... quotes the 1990 model"  FALSE
            #   lungs.js:236   "Travis et al., J Thorac Oncol, 2015 (WHO) & 2011 (IASLC/ATS/ERS)" TRUE
            # In both, an intervening year sits between the head and the target year, with no
            # competing head anywhere between them. A rule that knows only how many years intervened
            # sees one shape and must return one answer. The difference is SEMANTIC — two publication
            # years of one document set, versus a publication year and a referenced model's date — and
            # "permit one more year under the same head", the narrowing this comment previously
            # proposed, keeps BOTH. So that narrowing was not merely under-specified; it was
            # unspecifiable at this level.
            #
            # THIS PARAGRAPH USED TO CLAIM MORE THAN THAT, AND THE EXCESS WAS WRONG — corrected in
            # place 2026-09-06 rather than quietly reworded, because the ruling that closed the
            # boundary question rested on the stronger version. It read "POWELL AND TRAVIS ARE
            # STRUCTURALLY IDENTICAL" and "any rule reading STRUCTURE sees one shape". They are not
            # structurally identical: Powell's intervening year sits inside a parenthetical that
            # CLOSED, Travis's is bare and the one paren closing between his head and his year carries
            # no year at all. The step from "the rule on the table cannot see the difference" to "no
            # structural rule can" was a generalisation from two examples, was never measured, and is
            # what the rule below falsifies. THE NARROWER CLAIM SURVIVES UNTOUCHED and still closes
            # the year-counting question, which is why that argument is kept above rather than deleted
            # along with the overreach.
            #
            # THE SIX REMOVALS THE NAIVE TEST PRODUCED HAD FOUR DIFFERENT CAUSES, and only one of them
            # was a boundary problem, which is exactly why the one measurable version was destructive.
            # Decomposed (the user's ruling, and the reason this path is now left alone):
            #   REACH   Fontugne|2015  prostate.js:204 — the 2015 belongs to "TCGA (2015)", the fifth
            #                          head shape. FIXED by P_PAREN_YEAR: TCGA claims its own year.
            #   GUARD   Park|2010      bladder.js:27 — "SEER 2010+" is an open-ended data vintage.
            #                          FIXED by PLUS_TAIL: it is not a publication year at all.
            #   CLASS   Fearon|1991    colon.js:169 — "the year APC was cloned". Prose.
            #           Powell|1990    colon.js:172 — "quotes the 1990 model". Prose.
            #           Schulze|2017   liver.js:280 — journal-adjacent ("a mixed TCGA cohort (Nature,
            #                          2017, 44%)"), real head Schulze (Nat Genet, 2015).
            #                          FIXED in the next commit by closed_year_paren below, and NOT
            #                          by the mechanism this line originally predicted — see the
            #                          block under the ';' rule, which records what the port of
            #                          classify_absence's discrimination actually measured.
            #   TRUE    Travis|2011    lungs.js:236 — must survive, and does.
            # A count of "six removed" would have read as a clean win. Only reading each one separates
            # five fixes from one loss, and only DECOMPOSING them shows that no single rule was ever
            # the answer.
            #
            # THE RATCHET DID NOT FIRE ON THE TWO FIXES, AND THAT IS ITS BLIND SPOT, NOT ITS BLESSING.
            # Removing two false records and adding two true ones nets to zero, so record_count.json
            # held and no --lower-ratchet was needed. FOUR RECORDS CHANGED IDENTITY UNDER A FLAT
            # COUNT — and the ratchet would have been equally satisfied had the substitution run the
            # other way, two true records out and two false ones in. The reason each fix was measured
            # SEPARATELY is that in aggregate this commit is invisible to every instrument in the
            # chain except the fixtures below. THE GAP IS CLOSED SINCE, by the record key set in
            # record_count.json — battery.py's assertion 4 carries the ruling and the mechanism.
            if ';' in back[head_end:]:
                if absences is not None:
                    absences.append({'file': path, 'line': line_at(ypos), 'year': year,
                                     'kind': 'semicolon-shadow', 'key': m.group(1)})
                # a ';' between head and year means the head belongs to a PREVIOUS citation
                # and this year's own mention is authorless (journal-only): "Ziol et al.,
                # Hepatology, 2018; Acad Pathol, 2024 (PMID x)" must not yield Ziol|2024
                continue
            # THE SAME RULE, SECOND DELIMITER (2026-09-06). A completed parenthetical citation between
            # the head and this year says what the ';' says. Justification and the narrowing that
            # makes it safe are at closed_year_paren; what belongs HERE is what was measured, because
            # the ordered instruction this discharges named a DIFFERENT mechanism and that mechanism
            # was destructive.
            #
            # THE PORT WAS TRIED FIRST, EXACTLY AS RULED, AND MEASURED 3 FIXES AGAINST 3 LOSSES.
            # The instruction was that Fearon, Powell and Schulze "want the record path to gain the
            # absence path's classification logic... it's already written once on the other path".
            # Two readings of that exist and both were measured on isolated trees before either was
            # written into this file:
            #   (i)  PROSE-ADJACENCY — an ordinary lowercase word between head and year, which is
            #        what prose-year's evidence amounts to. 490 -> 484. It removed the three targets
            #        and THREE TRUE RECORDS with them, and reading each removal is the only thing
            #        that separated them: skin.js:47 and skin.js:15 are "(Di Carlo et al., CONCORD-3
            #        morphology study, Br J Cancer, 2022)" — the lowercase words are the CITATION'S
            #        OWN descriptive label — and ovary.js:184 is "Rose et al.'s 428-case autopsy
            #        series (Cancer, 1989)", where they are the sentence carrying the citation.
            #   (ii) THE ABSENCE PATH'S OWN open_paren TEST, ported literally: it requires a citation
            #        year to sit inside an unclosed paren. It kills Travis|2011 (", 2015 (WHO) & 2011"
            #        is a '&'-list, not a parenthetical) and KEEPS Schulze. Strictly worse than (i).
            # So the named mechanism does not transfer. Its 1:1 fix-to-loss ratio is the same shape as
            # the boundary test the previous ruling rejected, found the same way, by the same
            # procedure — which is the procedure earning its keep a second time rather than a new
            # lesson.
            #
            # AND IT REVISES A PREMISE OF THAT RULING, which is the part worth reading twice. The
            # ruling held that "a structural rule can't separate Powell from Travis: they're
            # structurally identical... an intervening year sits between the head and the target with
            # no competing head." True of the rule then on the table — "permit one more year under the
            # same head" — and NOT true of every structural rule, because the two intervening years
            # are not alike:
            #   colon.js:172  "Powell et al. (Nature, 1992) for APC-comes-first, and quotes the 1990"
            #                 the intervening year is INSIDE A PARENTHETICAL THAT CLOSED.
            #   lungs.js:236  "Travis et al., J Thorac Oncol, 2015 (WHO) & 2011 (IASLC/ATS/ERS)"
            #                 the intervening year is BARE, in the same unparenthesised clause, and
            #                 the one paren that closes between head and target, "(WHO)", carries no
            #                 year at all.
            # The semantic difference the ruling identified — two publication years of one document
            # set, versus a publication year and a referenced model's date — turns out to have a
            # punctuation shadow in this corpus. That is a narrower claim than "the semantics are
            # recoverable structurally", and it is the only claim being made.
            #
            # ITS POPULATION IS SMALL AND SAYING SO IS THE HONEST PART; THE SIZE IS NOT RESTATED HERE.
            # It was, as two numbers taken at d54bd1a, and both were already drifting when
            # .claude/citation_paren_ledger.py was written — that file MEASURES the population and the
            # split on every run and prints them in its DONE line, which is where to read them. What
            # belongs here is the part a measurement cannot supply: the rule was FIT TO THIS CORPUS,
            # on a handful of spans one of which (Travis) is the counterexample the "carrying a year"
            # narrowing was invented for, so the next span of this shape is a TEST of the rule and not
            # a confirmation of it. The ledger enforces exactly that distinction, per span, and it is
            # where a new instance gets scored; the fixtures below pin the four known shapes plus the
            # year-free aside, so a span that breaks the rule breaks an arm rather than a record.
            #
            # THE RULE'S OWN ANSWER TRAVELS ON ITS OUTPUT (2026-09-07). The pre-registration that
            # scores this rule (.claude/citation_paren_ledger.py) needs BOTH sides of the split, and
            # the one thing it must not do is re-derive this geometry for itself: a rule implemented
            # twice drifts, and the copy that drifts is the one the corpus is not run through. So the
            # predicate defining the POPULATION — is there a ')' between head and year at all — is
            # evaluated here, once, beside the decision, and written onto whichever artifact this
            # span produces. Note it is deliberately NOT wired into the `if` below: fired-implies-
            # examined then holds by construction and could never be observed failing, where a ledger
            # that finds a paren-shadow absence with the flag False has caught closed_year_paren
            # firing on a span with no ')' in it, which is the rule leaving its own stated shape.
            paren_between_head_and_year = ')' in back[head_end:]
            if closed_year_paren(back[head_end:]):
                if absences is not None:
                    absences.append({'file': path, 'line': line_at(ypos), 'year': year,
                                     'kind': 'paren-shadow', 'key': m.group(1),
                                     'parenBetweenHeadAndYear': paren_between_head_and_year})
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
                            'window': win_status,
                            # the KEPT side of the paren rule — see the note at the decision above
                            'parenBetweenHeadAndYear': paren_between_head_and_year})
    # dedupe identical (author, year, ref)
    seen, out = set(), []
    for r in records:
        k = (r['author'], r['year'], r['ref'])
        if k in seen: continue
        seen.add(k); out.append(r)
    return out

# --- condition (7) fixtures for the bare-year and paren-year head patterns --------------------
# Each is (label, source lines, expected (author, year, conf) records, expected (kind, key)
# absences), and BOTH sides are asserted exactly. Only checking the records would let a fixture
# pass while its year was quietly reclassified into a bucket nobody reads — the absence side is
# half of what this pattern changed.
#
# The sources are the real corpus shapes, not invented ones: the PLoS and CBTRUS and Park spans
# are transcribed from the measurement that motivated each guard, so an arm failing points at a
# span that actually exists rather than at a hypothetical.
FIXTURES = [
    ('the fourth pattern FIRES, and the year is no longer an absence at all — this arm is the '
     'whole point of the change',
     ['Ovarian clear cell carcinoma (Bolton 2022) shows a distinct mutational profile.'],
     [('Bolton', '2022', 'bare-year')], []),

    ('a two-word surname survives intact — the reason SURNAME cannot be narrowed to one word to '
     'fix the "Sweden Engstrand" imprecision',
     ['Nodal involvement was reported at 12% (Safaee Ardekani 2012).'],
     [('Safaee Ardekani', '2012', 'bare-year')], []),

    ('NO HEAD STEALING: the $-anchored pattern sorts first, matches the journal, is rejected for '
     'it, and FALLS BACK to the real "et al." head',
     ['Recurrent fusions were described in Smith et al., Nature Genetics 2019 across two cohorts.'],
     [('Smith', '2019', 'etal')], []),

    ('a comma before the year keeps P_PAREN1 winning, so the simple shape-B form is unaffected',
     ['Registry incidence rose over the decade (Park, Curr Oncol, 2023).'],
     [('Park', '2023', 'single-paren')], []),

    ('JOURNAL WORDS IN ANY POSITION: the SURNAME match begins at "Comput", so a first-word-only '
     'lexicon test never saw "PLoS" — the case that motivated head_is_journalish',
     ['Network topology was modelled computationally (PLoS Comput Biol 2025).'],
     [], [('journal-adjacent-year', 'Comput Biol')]),

    ('YEAR RANGES, en dash: a data-collection span is not a publication date, and "US" would '
     'otherwise have become an author. brain.js:24 verbatim — MY FIRST VERSION OF THIS FIXTURE '
     'WROTE "(CBTRUS," WITH THE PAREN ADJACENT, which handed P_PAREN1 a head the real span does '
     'not have and tested the wrong path entirely',
     ['share:\'13.7% of all primary brain/CNS tumors (52.2% of malignant ones; CBTRUS, US 2018–2022)\','],
     [], [('data-span-year', None), ('data-span-year', None)]),

    ('YEAR RANGES, hyphen: the same guard on the other separator the corpus uses',
     ['Cases were drawn from a German 2003-2014 registry (n=1,204).'],
     [], [('data-span-year', None), ('data-span-year', None)]),

    ('ISO DATESTAMPS: colon.js:86 verbatim. The atlas\'s own editorial marker was being cited as '
     'an author of a 2026 paper — five such records among the first ninety-two this pattern '
     'added, found by auditing them one by one rather than by reasoning about the regex',
     ['  // PIPELINE CORRECTION 2026-09-03: was NoColorSpace (the legacy double-decode fix, see this'],
     [], [('data-span-year', None)]),

    ('THE GUARD IS ABOUT THE YEAR, NOT THE HEAD: with a P_PAREN1 head available, a range-opening '
     'year must still be refused. This arm is the one that moved the range test out of the '
     'candidate loop — kind-scoped, it answered the same span two different ways',
     ['Incidence was pooled nationally (CBTRUS, US 2018–2022) across registries.'],
     [], [('data-span-year', None), ('data-span-year', None)]),

    ('A DECLARED IMPRECISION, PINNED NOT FIXED: skin.js:306 verbatim. The two-word SURNAME '
     'absorbs the corpus\'s ALL-CAPS emphasis, so the author reads "MIS-CITES Pollock" instead '
     'of "Pollock". Trimming a shouted first word is NOT safe in general — it would turn the '
     'genuine corporate heads "TCGA Research" and "WHO Classification" into "Research" and '
     '"Classification" — so the instance is recorded here and the fix waits for the acronym '
     'lexicon that can tell an emphasis word from an author',
     ['// - TCGA 2015 itself MIS-CITES Pollock 2003 twice (for BRAF/NRAS anti-correlation and for'],
     [('TCGA', '2015', 'bare-year'), ('MIS-CITES Pollock', '2003', 'bare-year')], []),

    ('shape B is RENAMED, not absorbed: a non-journal token after a comma stays visible as its '
     'own kind instead of vanishing into prose-year',
     ['Mutation frequencies were pooled across cohorts (whole-exome, TCGA, 2014).'],
     [], [('bare-name-comma-year', 'TCGA')]),

    ('a journal token after a comma is REPORTED, not silently reclassified — bladder.js:44 '
     'verbatim, a real citation with a real author (Park) that no pattern in this file reaches, '
     'and the span that would have gone invisible if the stronger journal test had simply been '
     'applied to the classifier as well',
     ['share:\'~92% of the four commonest bladder-primary carcinoma types '
      '(48,789/53,142, Park, Curr Oncol, 2023, SEER)\','],
     [], [('journal-adjacent-year', 'Curr Oncol')]),

    ('the head and its year may sit on DIFFERENT LINES: matching runs on joined text, which is '
     'why the whitespace in P_BARE_YEAR is unbounded rather than a single space. colon.js:164-165 '
     'verbatim, so this arm ALSO pins the declared two-word imprecision — the joined head really '
     'is "Burgundy   Manfredi" with three spaces, and the fixture records that rather than '
     'pretending the pattern gets it right',
     ['  rebuts higher figures]; Sweden Engstrand 2018 [16.2%]; Germany Hackl 2014 [17.7%]; Burgundy',
      '  Manfredi 2006 [14.5%]) — and the ~50% lifetime figure is rejected IN PRINT'],
     [('Sweden Engstrand', '2018', 'bare-year'), ('Germany Hackl', '2014', 'bare-year'),
      ('Burgundy   Manfredi', '2006', 'bare-year')], []),

    ('THE CITATION-BOUNDARY TEST FIRES: brain.js:209 reduced to its shape. A complete citation '
     'ends, and a LATER prose year then finds that citation\'s "et al." still inside its lookback. '
     'The head is not available to be stolen — a year sits between — so the prose year is '
     '\'etal-shadow\' and NOT a gated unreachable head. The real citation still yields its record, '
     'which is the half of this arm that matters: emptying a defect bucket by losing a citation '
     'would look identical in the count',
     ['Grading follows the CNS5 scheme (Louis et al., Neuro-Oncology, 2021), and the grading '
      'rules that follow from it are what this panel reflects across all four of the 2021 WHO '
      'update is what it shows.'],
     [('Louis', '2021', 'etal')], [('etal-shadow', None)]),

    ('THE PADDING IN THE ARM ABOVE IS LOAD-BEARING AND MUST NOT BE TIDIED, which is why this arm '
     'sits next to it holding the other side of the window. The geometry it reproduces is narrow: '
     'the "et al." must fall INSIDE the 130-char lookback while its surname falls OUTSIDE, so that '
     'no head pattern matches and classify_absence is reached at all. Measured by sweep — at 16 '
     'words of padding or fewer, P_ETAL matches, a duplicate Louis|2021 is produced and then '
     'silently removed by the (author, year, ref) dedupe, so the arm passes its record side and '
     'sees NO absence; at 19 words or more the "et al." leaves the lookback entirely and the span '
     'is plain \'prose-year\'. Only 17-18 words land on etal-shadow. Shortening that prose would '
     'move the arm into the dedupe window, where it would go green while testing nothing — this '
     'arm makes the far edge explicit so at least one side fails loudly if the window moves',
     ['Grading follows the CNS5 scheme (Louis et al., Neuro-Oncology, 2021), and the rules that '
      'follow from it are what this whole panel reflects across every one of the four sampled '
      'sites shown here, so the 2021 WHO update is what it shows.'],
     [('Louis', '2021', 'etal')], [('prose-year', None)]),

    ('AND IT DOES NOT OVER-FIRE, the direction that would silently empty the GATED bucket: a '
     'malformed head with NO intervening year must still be gated. "Wang K et al." reaches no '
     'record, no year sits between its "et al." and its own year, so it stays '
     '\'etal-malformed-head\' — the 15 declared spans depend on this arm, since a boundary test '
     'that swallowed them would turn five real tolerances into a green run',
     ['Diffuse-type frequencies were re-derived (Wang K et al., Nat Genet, 2011).'],
     [], [('etal-malformed-head', 'Wang K')]),

    ('THE FIFTH PATTERN FIRES, AND THE ARM IS THE MISATTRIBUTION ITSELF, NOT THE SHAPE IN THE '
     'ABSTRACT: prostate.js:204-205 reduced to its two heads. Before P_PAREN_YEAR the second year '
     'could see no head at "TCGA (" and fell back to the nearest reachable one, minting '
     'Fontugne|2015 — right author, wrong paper. BOTH sides are asserted, because a pattern that '
     'reached TCGA while stealing Fontugne\'s own 2022 would be a new misattribution wearing the '
     'clothes of a fix',
     ['SPINK1 was checked and excluded: Fontugne et al. (2022) and TCGA (2015) both frame it as an '
      'ERG-negative subtype.'],
     [('Fontugne', '2022', 'etal'), ('TCGA', '2015', 'paren-year')], []),

    ('AND THE FIFTH PATTERN LOSES WHEN IT MUST, which matters more than that it fires: it is '
     '$-anchored, so it sorts FIRST on every year preceded by "Word (" and would take the head of '
     'all of them if it could not be rejected. A journal inside the paren must send the loop on to '
     'the true author further left. This is the same dependency P_BARE_YEAR has on the journalish '
     'fallback, and the liver.js:280 shape is where the corpus actually exercises it',
     ['Recurrence was re-derived from a mixed cohort (Schulze et al., Nature (2017), 44%).'],
     [('Schulze', '2017', 'etal')], []),

    ('THE \'+\' GUARD FIRES: an open-ended vintage is not a publication year. bladder.js:28 '
     'reduced to its shape — a real author, a real journal, a real year, and then a registry '
     'vintage that the extractor read as a SECOND publication year by the same author. The arm '
     'asserts the true record SURVIVES beside the refusal, since a guard that removed both would '
     'shrink the defect count and the corpus together',
     ['Denominators come from (Park, Curr Oncol, 2023, SEER 2010+: 48,789 conventional urothelial '
      'carcinoma).'],
     [('Park', '2023', 'single-paren')], [('data-span-year', None)]),

    ('AND THE \'+\' GUARD DOES NOT OVER-FIRE ON A DETACHED PLUS, the case the adjacency '
     'requirement exists for: "2015 + 2019" is a list join and both digits ARE publication years. '
     'Written as its own arm because \\+ with \\s* in front of it would pass every other arm here '
     'while quietly deleting real records anywhere the corpus adds two cohorts together. TWO '
     'prose-year absences on purpose, one per joined year: what the arm pins is that NEITHER became '
     '\'data-span-year\', so the count is the assertion',
     ['Pooled estimates come from the 2015 + 2019 cohorts (Bolton 2019).'],
     [('Bolton', '2019', 'bare-year')], [('prose-year', None), ('prose-year', None)]),

    # --- the paren-shadow rule. FOUR REAL SPANS ARE ITS WHOLE POPULATION, so all four are here, ---
    # plus the two shapes the two rejected mechanisms destroyed and the aside the objection named.
    # Every fires-arm also asserts the SAME HEAD'S TRUE RECORD SURVIVES in the same span, because
    # that is the failure mode with no other detector: colon.js:172 must keep Powell|1992 while
    # losing Powell|1990, and a rule that took both would shrink the defect and the corpus together
    # while every count in the chain still moved in the direction a fix moves it.

    ('PAREN-SHADOW FIRES, AND THE SPAN IS THE ONE THAT DEFINED THE RULE: colon.js:172 verbatim in '
     'shape. A completed parenthetical citation, "(Nature, 1992)", stands between the head and a '
     'later prose year, so the head is spent — the 1990 is the date of a MODEL BEING DISCUSSED, not '
     'a paper Powell wrote. Powell|1992 survives, which is the half that matters',
     ['cites Powell et al. (Nature, 1992) for APC-comes-first, and quotes the 1990 model for what'],
     [('Powell', '1992', 'etal')], [('paren-shadow', 'Powell')]),

    ('IT FIRES ACROSS AN &-JOINED HEAD TOO, so the rule is not quietly specific to "et al.". '
     'colon.js:169 verbatim: the atlas is saying the 1990 paper NEVER NAMES APC because the gene '
     'was cloned in 1991, and that 1991 was becoming a Fearon publication. The real Fearon|1990 '
     'sits inside the parenthetical and is untouched',
     ['- Fearon &amp; Vogelstein (Cell, 1990) NEVER NAMES APC — the gene wasn\'t cloned until 1991; the'],
     [('Fearon', '1990', 'amp-list')], [('paren-shadow', 'Fearon')]),

    ('THE STACK-EMPTY BRANCH IS REACHED BY A REAL SPAN, not by a defensive default: liver.js:280 '
     'reduced. The head sits INSIDE a parenthetical that opened before the lookback window, so the '
     'first ")" this rule sees has no "(" on its own stack — treating the segment start as the '
     'opener is what makes the 2015 visible as the year that closed. Without that branch the '
     'journal-adjacent 2017 of "a mixed TCGA cohort (Nature, 2017, 44%)" keeps Schulze as its '
     'author, which is the misattribution this arm exists to pin',
     ['other French cohorts (Schulze et al., Nature Genetics, 2015) and a mixed TCGA cohort '
      '(Nature, 2017, 44%) span the range in between.'],
     [('Schulze', '2015', 'etal')], [('paren-shadow', 'Schulze')]),

    ('AND IT MUST NOT FIRE HERE, WHICH IS THE ARM THE RULE WAS SHAPED AROUND AND THE ONE MOST '
     'WORTH DISTRUSTING: lungs.js:236 verbatim. Travis et al. published the 2015 WHO classification '
     'AND the 2011 IASLC/ATS/ERS one, so BOTH years are theirs. A ")" does close between the head '
     'and the 2011 — "(WHO)" — and it carries no year, which is the entire narrowing. Delete '
     '"carrying a year" from closed_year_paren and this arm is what fails; the corpus record it '
     'protects would otherwise vanish with no count moving except downward, i.e. looking like a fix',
     ['citation: \'Travis et al., J Thorac Oncol, 2015 (WHO) & 2011 (IASLC/ATS/ERS)\','],
     [('Travis', '2015', 'etal'), ('Travis', '2011', 'etal')], []),

    ('THE OBJECTION ANSWERED ON ITS OWN TERMS. classify_absence\'s etal-shadow note warned that '
     '"a \')\' also closes ordinary parenthetical asides mid-citation (\'Nature Genetics (impact '
     'factor aside), 2019\')" — written there as the reason a paren test looked unusable. That exact '
     'string is this arm, and the year requirement disposes of it: an aside carries no year, so the '
     'citation is unaffected. The warning was correct about bare paren-closing and is preserved '
     'there; this arm is why it does not extend to the rule as narrowed',
     ['Recurrent fusions were described in Smith et al., Nature Genetics (impact factor aside), 2019.'],
     [('Smith', '2019', 'etal')], []),

    ('A TRUE RECORD THE REJECTED PROSE-ADJACENCY MECHANISM DELETED, kept as an arm so the rejected '
     'reading cannot be reintroduced silently: skin.js:47-48 verbatim. "CONCORD-3 morphology study" '
     'is the CITATION\'S OWN descriptive label, so lowercase words between head and year prove '
     'nothing — while no paren closes between them at all, and paren-shadow never looks at it',
     ['registrations worldwide SSM is 36% (Di Carlo et al., CONCORD-3 morphology study, Br J',
      'Dermatol, 2022, N=1,578,482). Shares shown are COMPUTED from Bradford\'s SEER-17 incidence'],
     [('Di Carlo', '2022', 'etal')], []),

    ('THE SECOND SUCH RECORD, AND A DIFFERENT REASON IT SURVIVES: ovary.js:184 verbatim. Here the '
     'year sits INSIDE the parenthetical — "(Cancer, 1989)" opens between head and year and closes '
     'after it — so the rule sees an unclosed "(" and no ")" at all. The lowercase words that '
     'condemned it under prose-adjacency are the sentence carrying the citation, not part of it',
     ['Rose et al.\'s 428-case autopsy series (Cancer, 1989) found metastatic sites "nearly'],
     [('Rose', '1989', 'etal')], []),

    # --- THE HEAD-SHAPE IMPRECISIONS, PINNED (2026-09-07) ------------------------------------------
    # The four arms below pin the members of the declared imprecision class that no fixture reached.
    # The other four are already pinned above: the colon.js:164-165 arm holds "Sweden Engstrand",
    # "Germany Hackl" and "Burgundy   Manfredi", and its own arm holds "MIS-CITES Pollock".
    #
    # WHAT PINNING THESE MADE VISIBLE, and it is not what the header's declaration paragraph implies.
    # That paragraph reads as though the two-word clause of one pattern were at fault; these four
    # arms come out through THREE DIFFERENT PATTERNS — P_ETAL, P_BARE_YEAR and P_PAREN1 — because the
    # defect is in SURNAME, which all of them are built from. So there is no pattern to fix, and any
    # fix is a change to SURNAME itself: one edit, every pattern's output moves, and the standing
    # procedure applies in full.
    #
    # THE ENUMERATION LIVES ELSEWHERE, ON PURPOSE. A fixture pins ONE span; it cannot notice a NINTH
    # imprecision appearing in a file nobody transcribed. .claude/citation_head_check.py holds the
    # closed partition over every multi-token head in the corpus and fails on an undeclared one.
    # These arms are the unit-level half: they say what the extractor DOES with each span, so a
    # change to SURNAME fails here with the old and new strings side by side instead of only
    # presenting as a set of removals and additions in record_count.json.
    ('DECLARED IMPRECISION, P_ETAL path: liver.js:208-209 verbatim. A SENTENCE WORD is absorbed — '
     '"...N=291). But Friemel et al." — because SURNAME\'s optional second capitalised word takes '
     '"But" as the first. Named in this file\'s header as evidence the class pre-dates the fourth '
     'head pattern, and now pinned: the header named it, nothing tested it',
     ['mutually exclusive mutation" directly (TP53 33.0%, CTNNB1 34.0%, N=291). But Friemel et al.',
      '(2016) is itself a case report of the documented exception, confirmed directly rather than'],
     [('But Friemel', '2016', 'etal')], []),

    ('DECLARED IMPRECISION, P_PAREN1 path: breast.js:142 verbatim. TRAILING INITIALS are absorbed, '
     'PubMed style. THE SAME CORPUS SHAPE PRODUCES AN ABSENCE ON THE OTHER PATH: '
     'citation_reach_check declares "Li D" and "Wang K" as etal-malformed-head, where the initial '
     'BREAKS the match because P_ETAL needs a bare surname before "et al." — here there is no "et '
     'al.", P_PAREN1 matches, and the initial rides along instead. One cause, two outcomes, and the '
     'pair is why "swallow initials" was rejected as a remedy for the absence class',
     ['paper (Foulkes WD, Smith IE, Reis-Filho JS, "Triple-Negative Breast Cancer," NEJM 2010, PMID'],
     [('Foulkes WD', '2010', 'single-paren')], []),

    ('DECLARED IMPRECISION, AND NOT THE TWO-WORD CLAUSE AT ALL: stomach.js:86 verbatim. A POSSESSIVE '
     'is absorbed by SURNAME\'s CHARACTER CLASS, which admits an apostrophe so a real "O\'Brien" can '
     'be a head. Distinct cause from the six place/sentence/initial cases, which is why both '
     'possessives get their own arms rather than one standing for the class',
     ['is anchored to 10.4 cm — Cunningham\'s 1905 mid-range ("not more than 4 to 4.5 inches'],
     [("Cunningham's", '1905', 'bare-year')], []),

    ('THE SECOND POSSESSIVE, P_BARE_YEAR again: stomach.js:102 verbatim. Both are pinned because the '
     'candidate fix — strip a trailing "\'s" — would move BOTH keys at a flat record count, the '
     'd54bd1a shape that record_count.json\'s key set exists to make visible, and an arm holding only '
     'one of them would let half the change pass. The fix is HELD, not adopted: its hazard is a '
     'surname genuinely ending that way, and these two are the only apostrophe-bearing authors in '
     'the corpus today, so the hazard is prospective and the corpus is about to grow eightfold',
     ['in words (Gray\'s 1918 colors the INSIDE mucosa only); 0xc08a7c was a flagged INFERENCE from'],
     [("Gray's", '1918', 'bare-year')], []),
]


def selftest():
    """Condition (7): every guard above is shown to FIRE, and the new pattern is shown to LOSE.

    NEEDS NO NEW CALL SITE, deliberately. This module is a declared NON-instrument, so a selftest
    behind its own flag would be exactly the dead-instrument shape the battery exists to prevent.
    Instead it runs on EVERY invocation, and battery.py's regenerate_records() preflight already
    (a) indents this stdout into the battery's own output on every run, which is condition (7-bis)
    for the pass line, and (b) fails the whole battery on a non-zero exit. Failures print to
    STDERR because that is the stream the preflight surfaces when the exit code is non-zero."""
    import tempfile
    ok = True
    for label, lines, want_recs, want_abs in FIXTURES:
        # ONE FIXTURE PER FILE, not one file of fixtures. extract() joins a file's lines into a
        # single string, so two fixtures sharing a file would sit inside each other's 130-char
        # lookback and the arm that failed would be the one measuring its neighbour.
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
            fh.write(''.join('// ' + ln + '\n' for ln in lines))
            path = fh.name
        try:
            absences = []
            recs = extract([path], absences)
        finally:
            os.unlink(path)
        got_recs = sorted((r['author'], r['year'], r['authorConfidence']) for r in recs)
        got_abs = sorted((a['kind'], a['key'] or '') for a in absences)
        want_r = sorted(want_recs)
        want_a = sorted((k, v or '') for k, v in want_abs)
        if got_recs != want_r or got_abs != want_a:
            ok = False
            sys.stderr.write(f'SELFTEST FAIL: {label}\n'
                             f'  source   {lines}\n'
                             f'  records  want {want_r} got {got_recs}\n'
                             f'  absences want {want_a} got {got_abs}\n')
    # THE POPULATION ARMS. Not head patterns — the corpus this module reads when nobody names files,
    # which is every battery run. The second arm is the incident in miniature: a path that certainly
    # exists on disk is absent from the tracked list, and absence from the list is what decides.
    synthetic = ['js/organs/a.js', 'js/organs/b.js', 'js/organs/notes.md',
                 'js/organs/sub/c.js', 'js/scene.js', 'CLAUDE.md']
    if corpus_paths(synthetic) != ['js/organs/a.js', 'js/organs/b.js']:
        ok = False
        sys.stderr.write('SELFTEST FAIL: corpus_paths() filter — got %r\n'
                         % (corpus_paths(synthetic),))
    on_disk = os.path.join(REPO_ROOT, 'js', 'organs', 'liver.js')
    if os.path.exists(on_disk) and 'js/organs/liver.js' in corpus_paths(['js/organs/a.js']):
        ok = False
        sys.stderr.write('SELFTEST FAIL: corpus_paths() took a file that EXISTS ON DISK but is not '
                         'in the tracked list — the glob this replaced did exactly that, which is '
                         'how an untracked draft can move a ratcheted floor\n')
    if ok:
        print(f'selftest: {len(FIXTURES)}/{len(FIXTURES)} head-pattern arms passed, and the default '
              f'corpus comes from git rather than from the filesystem')
    return ok


def main():
    outp = sys.argv[1]
    paths = sys.argv[2:] or corpus_paths()
    absences = []
    recs = extract(paths, absences)
    json.dump(recs, open(outp, 'w'), indent=1)
    from collections import Counter
    print(f'v2: {len(recs)} records from {len(paths)} files')
    # the absence side, printed next to the record count so growth that silently failed to
    # happen is visible in the same glance as growth that happened (gate: citation_reach_check)
    print('  unreached spans: ', dict(Counter(a['kind'] for a in absences)))
    print('  authorConfidence:', dict(Counter(r["authorConfidence"] for r in recs)))
    print('  journal present: ', sum(1 for r in recs if r['journal']))
    print('  entry-time ids:  ', sum(1 for r in recs if r['entryTimeIds']))
    print('  flagged windows: ', sum(1 for r in recs if r['window'] != 'clean'))


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
