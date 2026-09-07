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
# FOUR GUARDS, EACH FROM A MEASURED FALSE HEAD — this pattern is the weakest head shape in the
# file (a capitalised word adjacent to a year is a very low bar), so the guards it needed are
# collected here. TWO OF THEM TURNED OUT NOT TO BE ABOUT THIS PATTERN AT ALL and now apply to the
# whole matcher; that is stated per guard rather than in one sweeping sentence, because "scoped to
# this pattern" is what the first draft of this comment claimed and it was wrong.
#   JOURNAL WORDS, ANY POSITION. head_is_journalish replaces a first-word-only lexicon test that
#     both "PLoS Comput Biol" and "WHO-2020" walked straight through — the first because the
#     SURNAME match began at "Comput" and never saw "PLoS", the second because "WHO-" carries a
#     trailing hyphen and did not equal "who". Punctuation is stripped and every word is checked.
#     Applied to ALL FOUR patterns, not just this one, because it is strictly a widening of
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
#
# THE YEAR GUARDS ARE GLOBAL, WHICH MAKES THEM A SECOND CHANGE IN REACH INSIDE THIS ONE.
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
# available: "Safaee Ardekani" in the same list, and "Mehrvarz Sarshekeh" and "van der Maase"
# elsewhere, are genuinely multi-word surnames, which is why the two-word form exists. The class is
# also PRE-EXISTING rather than introduced here — HEAD's own records already contain "But Friemel"
# and "Foulkes WD" from the older patterns — so this pattern adds three instances to a defect the
# corpus already had, and fixing it belongs to a pass over all four patterns with a place lexicon.
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
    was widened: no record the corpus reaches has a year of either shape."""
    return bool(RANGE_START.match(text, yend) or ISO_TAIL.match(text, yend)
                or RANGE_END.search(text, max(0, yend - 44), yend - 4))

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

# --- absence classification (see the header block) -------------------------------------------
# A year that produced no record falls into exactly one of these. Only the 'etal-' kinds are
# citation-shaped enough to gate on, because only they carry an unambiguous "et al." marker; the
# rest are reported and not gated (see citation_reach_check.py, which enumerates every kind so a
# kind at zero still prints its zero). 'prose-year' is a genuine non-citation.
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
        # anchor on the "et al." NEAREST the year — the extractor's own "nearest head wins"
        # semantics. Widening the lookback instead finds a NEIGHBOURING citation's head and
        # misclassifies a malformed head as merely distant (measured: it mislabelled 6 of 18).
        pre = back[:etals[-1].start()]
        head_was_cut = (wstart > 0 and pre and pre[0] not in ' \t'
                        and text[wstart - 1] not in ' \t(,;"')
        if head_was_cut:
            # 'etal-out-of-range' HAS AN UNRELIABLE KEY BY CONSTRUCTION, AND IT IS THE ONE KIND
            # HERE THAT DOES (2026-09-06, measured, held for its own commit). This branch reaches
            # 40 chars PAST the lookback to complete a surname that was cut in half — but nothing
            # tests whether the "et al." it anchored on belongs to THIS year, and across a window
            # that long it frequently does not. The record-producing path already has the rule
            # this branch is missing: a ';' between head and year means the head belongs to a
            # PREVIOUS citation (see the semicolon-shadow continue above). A YEAR between them
            # means the same thing, and is not tested.
            #
            # ALL THREE INSTANCES AT HEAD fe8d627 WERE WRONG, EACH IN A DIFFERENT WAY, and each had
            # a confident hand-written tolerance in citation_reach_check explaining a pairing that
            # was never checked:
            #   Gao, breast.js  the "year" was the closing end of a SEER cohort period, so not a
            #                   citation at all; RANGE_END now refuses it.
            #   Curtin, skin.js the year belonged to TCGA 2015, four words away; the fourth head
            #                   pattern now reaches its true owner and the span is gone.
            #   Louis, brain.js STILL LIVE, and a prose year: brain.js:209 carries three 2021s, and
            #                   the real "(Louis et al., Neuro-Oncology, 2021)" is reached at 24
            #                   chars. The gated one is "the 2021 WHO update" in the note prose,
            #                   whose lookback grazes that citation's "et al." at 125 chars.
            # SCOPE, MEASURED SO THE FIX IS NOT GUESSWORK: of the 16 gated spans, Louis is the ONLY
            # one where a year or a closing paren sits between the anchoring "et al." and the year.
            # All 15 'etal-malformed-head' spans are clean — nothing but "et al."'s own period and
            # the journal name — so those five declarations name true owners and are verified
            # rather than assumed. A boundary test would therefore empty this bucket and touch
            # nothing else, but it needs a new absence kind to fall into (falling through to
            # 'etal-malformed-head' would key a fresh undeclared head off garbage and fail the
            # battery), and a new kind is the checker's business as much as this module's.
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
                                  (P_BARE_YEAR, 'bare-year')):
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
            if ';' in back[head_end:]:
                if absences is not None:
                    absences.append({'file': path, 'line': line_at(ypos), 'year': year,
                                     'kind': 'semicolon-shadow', 'key': m.group(1)})
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

# --- condition (7) fixtures for the fourth head pattern ---------------------------------------
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
    if ok:
        print(f'selftest: {len(FIXTURES)}/{len(FIXTURES)} head-pattern arms passed')
    return ok


def main():
    outp = sys.argv[1]
    paths = sys.argv[2:] or sorted(glob.glob('js/organs/*.js'))
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
