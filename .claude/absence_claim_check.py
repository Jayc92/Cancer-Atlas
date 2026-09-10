# Absence-claim check (.claude/absence_claim_check.py, 2026-09-05) — the ninth instrument,
# and the second built for a class the EDITING CREATES rather than one found in the corpus
# (the fraction_check reasoning: the remediation itself was adding intra-string fractions, so
# the population grows with every pass; here every new note is an opportunity to write another
# unscoped absence claim, and the corpus is heading from 16 entries to ~120).
#
# THE RULE IN TWO WORDS (user, 2026-09-05): "exists" versus "found".
#
# An UNSCOPED absence claim asserts a fact about the world's literature — "no canonical figure
# EXISTS", "no interaction analysis HAS FLAGGED it", "no functional study HAS ADJUDICATED".
# Its instrument is an unrecorded literature search with no query, no scope and no date, so it
# is a zero-reporting check that cannot be shown capable of non-zero: condition (7) exactly,
# in the form it was extended to cover (an annotation asserting cleanliness is itself a check).
# A SCOPED absence claim asserts a search outcome or a dataset fact — "no clean population-level
# frequency WAS FOUND to cite here", "zero samples IN THE GENIE COHORT". Both are verifiable,
# and the second is a downgrade of the first, which is always available and always preferable.
#
# SIGNATURE: negation + an EXISTENCE verb = defect; negation + a SEARCH verb or an explicit
# DATASET SCOPE = correct. At birth the atlas produced the bad form at a HIGHER rate than the
# good one (4 defective vs 3 correct), which is the argument for mechanizing rather than noting.
#
# THREE DOCUMENTED EXEMPTIONS, all real instances, all legitimate:
#   SOURCE-ATTESTED — a NAMED SOURCE is quoted attesting the absence, so the claim is a cited
#     claim rather than the atlas's own unrecorded search. This is the strongest correct form:
#     pancreas.js:208 declines a peritoneal percentage and quotes the site-frequency source
#     saying the site "is not detailed in the SEER database" (Oweira et al., 2017). Requires a
#     quotation of >=20 chars plus a citation — the length floor is the discriminator, because a
#     source attestation is sentence-length while a term-of-art quotation is a word or two.
#   SELF-EVIDENCING — the claim exhibits its own evidence in the same string. colon.js:210 says
#     "no canonical figure exists" and then prints three divergent sourced figures; the dispersion
#     IS the support. Requires >=2 citations carrying figures in the same string.
#   REASON-GIVING — the claim states WHY the figure is unavailable, which is checkable.
#     stomach.js:231 declines a percentage "because none is citable — the population registry
#     grouped it into 'other' for small numbers".
#
# CONDITION (8), and it EARNED ITS KEEP ON THE FIRST RUN: the calibration scan reported 7 sites
# where hand-reading had found 5. One (thyroid.js:263) was a real defect the coarse pass had let
# a neighbouring clause launder. The other (pancreas.js:208) was CORRECT CONTENT IN AN
# UNRECOGNISED FORM — and reading it is what produced the source-attested class above, which is
# a better rule than the reason connective I would otherwise have widened. A first run is
# calibration in both directions: it finds defects the reader missed AND exemptions the
# instrument missed, and the second kind is the one that teaches you the taxonomy.
#
# The fixtures below are the REAL instances, so a clean live run is weak evidence of
# generality — tuning against known answers is sampling on the dependent variable. This tool's
# actual job is REGRESSION INSURANCE on notes not yet written; read its second run, not its first.
# 7-bis: DONE line last. Wrapper form:
#   .claude/run_checked.sh "DONE absence_claim_check:" python3 .claude/absence_claim_check.py
import re, sys, glob
import os as _os_t; sys.path.insert(0, _os_t.path.dirname(_os_t.path.abspath(__file__)))
from tolerated import resolve
# THE UNIVERSALS 'FLAGGED FOR A READ' ARE A COUNT TOO (2026-09-10; see tolerated.py): four printed on every run with
# no owner and no date. Resolved here — two settled by construction (declared permanently, with the census that
# settles one of them run beside it), two world-scoped anatomical claims dated for a textbook read.
DECLARED = [
    {'key': 'js/organs/brain.js|text|directly paralleling how every other org', 'reason': 'settled by construction: every active organ declares the origin site its cancer arises at, and deploy_check counts those hotspots on the served page; this gene-keyed check cannot read a structural claim', 'until': None},
    {'key': 'js/organs/skin.js|desc|and the only one this atlas shows as a c', 'reason': 'settled by the layerSlab census run beside this declaration: exactly one organ file builds a cut block; if a second appears the census flags it and this declaration is re-read', 'until': None},
    {'key': 'js/organs/stomach.js|desc|Uniquely in the digestive tract', 'reason': 'world-scoped anatomical claim (three muscle layers unique to the stomach wall); textbook read owed — OpenStax Anatomy & Physiology is CC BY and quotable', 'until': '2026-10-01'},
    {'key': 'js/organs/stomach.js|text|and an inner oblique layer found nowhere', 'reason': 'the same anatomical claim as the desc field, stated at the wall site; the same textbook read settles both', 'until': '2026-10-01'},
]
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it passed GREEN over an EMPTY corpus (0 cancers indexed). Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

FIELD = re.compile(r"(\w+):'((?:[^'\\]|\\.)*)'")
READ_FIELDS = ('note', 'ccf', 'desc', 'text', 'detail', 'label')

NEGATION = r"(?:\bno\b|\bnone\b|\bnever\b|\bnot\b|\bnothing\b|\bzero\b|\bun(?:adjudicated|documented|reported|studied|examined)\b)"

# EXISTENCE verbs: the claim is about the literature's contents. Includes the PARTICIPLE-
# ADJECTIVE form ("no documented conflict"), which the first selftest run caught me missing —
# it reads as a description but asserts the same unbounded search, and it was one of the four
# real defects, so the miss would have been a false clean on live content.
EXISTENCE = (r"\bexists?\b|\bexisted\b|\bhas (?:flagged|adjudicated|documented|reported|studied|"
             r"examined|addressed|established|investigated)\b|\bhave (?:flagged|adjudicated|"
             r"documented|reported|studied|examined|addressed|established|investigated)\b|"
             r"\b(?:is|are|was|were) documented\b|\bun(?:adjudicated|documented)\b|"
             r"\bno (?:documented|published|known|reported|recorded|existing)\b|\bcitable\b")
# SEARCH verbs: the claim is about a search that was run.
SEARCH = (r"\b(?:was|were) found\b|\bfound to cite\b|\bfound here\b|\bnone (?:was|were) found\b|"
          r"\bcould not (?:be )?(?:locate|find)\b|\b(?:no source|none) located\b|\bfound for\b|"
          r"\bnot (?:located|retrieved|reachable)\b|\bsearch(?:ed)?\b")
# DATASET SCOPE: the absence is bounded to a named body of data.
SCOPE = (r"\bin (?:the |this )?(?:GENIE|TCGA|SEER|PDQ)\b|\bin (?:the|this) (?:cohort|registry|"
         r"dataset|series|analysis|study|paper|table|sample)\b|\bin the cited\b|"
         r"\b(?:GENIE|TCGA|SEER) cohort\b|\bsamples in\b")
# REASON must be an explicit causal connective. An earlier draft accepted a bare em-dash-plus-
# "the", which appears in ordinary atlas prose constantly and would have exempted real defects —
# a loose exemption is worse than no exemption, because it fails silently in the passing direction.
REASON = r"\bbecause\b|\bsince\b|\bas the (?:registry|population|source|paper|series)\b"
CITATION = re.compile(r"\b(?:et al\.|[A-Z][a-z]+ et al)\b|\((?:[A-Z][A-Za-z]*[^)]*,\s*\d{4})\)")
FIGURE = re.compile(r"\d+(?:\.\d+)?\s*%|\b\d+\s*/\s*\d+\b")
# A source attestation is sentence-length. The 20-char floor is what stops a quoted term of art
# ("hotspot", "other") from laundering an unscoped claim standing beside it.
QUOTED = re.compile(r'"[^"]{20,}"')

def clauses(value):
    """Sentence split, protecting 'et al.' — an unprotected split fragments every citation and
    silently destroys the self-evidencing exemption, which depends on counting them."""
    protected = value.replace('et al.', 'et al')
    for sentence in re.split(r'(?<=[.;])\s+', protected):
        yield sentence.replace('et al', 'et al.')

def fine_clauses(sentence):
    """The clause-unit rule applied to this instrument. Found by the calibration run:
    thyroid.js:263 pairs a registry-SCOPED recurrence claim with an UNSCOPED "unadjudicated"
    claim in the same sentence, and testing scope across the whole sentence let the first
    LAUNDER the second. A qualifier scopes the clause it attaches to, nothing further."""
    return [c for c in re.split(r'[,:;—]', sentence) if c.strip()]

# NEITHER GRANULARITY IS SAFE ALONE, and finding out cost a second calibration read.
# Fine clauses fix LAUNDERING (a scoped clause shielding an unscoped one). But English spells
# a list comma and a clause comma with the same character, so splitting on commas SEVERS the
# negation from its predicate across a list: "No conflict with CDH1, RHOA, or the fusion IS
# DOCUMENTED." is a textbook unscoped claim, and the fine split reports NONE on it — a false
# clean, the direction that matters. Whole sentences catch that and miss the laundering.
# So: run BOTH and take the WORSE verdict. The cost is over-flagging when an unrelated negation
# and existence verb happen to share a sentence; that costs a read, and a read is the cheap
# error. Flag-then-human-read, as with citation_polarity.py.
GRANULARITIES = (fine_clauses, lambda s: [s])

def classify(text):
    """-> (verdict, reason). verdict in DEFECT / OK-SEARCH / OK-SCOPED / EXEMPT-* / NONE.

    TWO SCOPES, deliberately different: DEFECT detection runs at BOTH granularities and takes
    the worse verdict (see GRANULARITIES). The exemptions are SENTENCE-level, because exhibited
    evidence really does support a claim made beside it (colon.js:210 prints its three divergent
    figures after the colon; stomach.js:231 gives its reason in the same breath)."""
    exempt = None
    if QUOTED.search(text) and CITATION.search(text):
        exempt = ('EXEMPT-SOURCE-ATTESTED', 'quotes a named source attesting the absence')
    elif len(CITATION.findall(text)) >= 2 and len(FIGURE.findall(text)) >= 2:
        exempt = ('EXEMPT-SELF-EVIDENCING', 'exhibits >=2 sourced figures in the same sentence')
    elif re.search(REASON, text) and not re.search(r'\bhas (?:flagged|adjudicated)\b', text, re.I):
        exempt = ('EXEMPT-REASON-GIVEN', 'states why the figure is unavailable')
    best = ('NONE', '')
    for split in GRANULARITIES:
        for cl in split(text):
            if not re.search(NEGATION, cl, re.I):
                continue
            has_search = re.search(SEARCH, cl, re.I)
            has_scope = re.search(SCOPE, cl, re.I)
            has_exist = re.search(EXISTENCE, cl, re.I)
            if has_search:
                if best[0] == 'NONE':
                    best = ('OK-SEARCH', f'search verb: {has_search.group(0)!r}')
            elif has_scope:
                if best[0] == 'NONE':
                    best = ('OK-SCOPED', f'dataset scope: {has_scope.group(0)!r}')
            elif has_exist:
                return exempt or ('DEFECT', f'existence verb {has_exist.group(0)!r} '
                                            'with no search scope or dataset bound')
    return best

# ---------------------------------------------------------------------------
# THE CORPUS-UNIVERSAL WIDENING (2026-09-08, user ruling) — the SAME OBJECT, mirrored.
#
# THE ARGUMENT FOR PUTTING IT HERE RATHER THAN IN A SIXTEENTH INSTRUMENT (user): "A universal
# claim is the POSITIVE MIRROR of an absence claim — 'in every other cancer modeled in this atlas'
# and 'no functional study has adjudicated' are the same object: an unscoped quantification over a
# population, checkable against that population." This file already owns the scoped-vs-unscoped
# vocabulary, clause-level detection and the exemption machinery, so the widening is natural.
#
# AND THE MIRROR IS EXACT IN THE ONE WAY THAT MATTERS: an unscoped ABSENCE claim quantifies over
# the world's literature, which this instrument CANNOT resolve — so it can only flag. An unscoped
# UNIVERSAL claim quantifies over THE ATLAS, which is sitting right here on disk. So this half
# does not flag, it RESOLVES, and it names the counterexamples. That is why the class was worth a
# widening and not just a note: it is the first defect class here with a real oracle.
#
# WHY THE CLASS EXISTS AT ALL (batch 4, 2026-09-08): 2 of that batch's 4 defects were false claims
# about the atlas's OWN contents, needing no fetch and no source. brain.js:215 asserted TTN was
# background noise "same as in every other cancer modeled in this atlas" while ovary.js:266
# CONTRADICTS it with a citation, and breast/thyroid carry no TTN record at all.
#
# GRANULARITY IS PER-CANCER, NOT PER-FILE, and the difference is a false clean rather than a nicety.
# ovary.js holds HGSOC and OCCC; HGSOC:149 carries TTN and OCCC deliberately does not. A file-level
# index would report ovary.js as HAVING TTN and pass the claim — the dangerous direction. The
# `const (REGIONS|TRUNK|PRIVATE_POOL)_<CANCER>` partition is what makes per-cancer resolution
# possible, so the presence index is keyed by that suffix.
#
# TWO TIERS, AND THE SECOND ONE DOES NOT FAIL THE BATTERY. Resolution needs a SUBJECT to quantify
# over, and the only subject this instrument can compute is the record's own gene symbol. A
# universal over a gene RESOLVES. A universal over anything else — kidneys.js:99's "unlike every
# other organ modeled in this atlas so far" quantifies over retroperitoneal POSITION — is reported
# as UNIVERSAL-UNRESOLVED and read by a human, because computing that property is out of scope and
# failing on it would force a hand-declared exemption for every legitimate self-reference.
# THIS IS THE LINE THAT HAS TO CHANGE to make the second tier fail: give it a property oracle, or
# declare each instance, and only then move it into the exit-status set.
#
# THE AGING SUB-SHAPE, WHICH IS THE ARGUMENT FOR KEEPING THIS TIER AFTER ITS WORKLIST IS CLEARED
# (user ruling, 2026-09-08, recorded at the guard rather than in the batch log for exactly that
# reason). kidneys.js:99's "so far" was TRUE WHEN IT WAS WRITTEN and is false now — so that claim did
# not DRIFT, it AGED. That is measured rather than charitable: the kidneys are ORGAN_MODULES[5] and
# the pancreas is [8], its own comment enumerated the three organs that existed then (ovary, breast,
# lungs), and pancreas.js:114 arrived three organs later with "behind the peritoneum". That is distinct from every defect class this project has
# recorded: nothing changed about the claim and nothing changed about its source, THE CORPUS GREW
# AROUND IT. A wrong figure is wrong the day it is typed, and a stale line pointer breaks when its
# own target moves; an atlas-universal is falsified by an edit somewhere else entirely, in a file its
# author never opened.
# WHICH MAKES THIS TIER WORTH MORE THAN ITS TEN REPAIRS SUGGEST. On the trajectory this file's
# opening paragraph already states, EVERY "unlike any other in this atlas" claim is a hostage to that
# growth: each new organ silently falsifies an unknown number of existing universals, and nobody
# adding one is re-reading every other organ file for the claims their edit just broke. This tier is
# the only thing that will notice. Its value is therefore not the current flag list, which gets
# cleared once — it is that the population it guards GROWS with the atlas while the hand-attention
# available to check it does not.
#
# A THIRD SHAPE IS DECLINED OUTRIGHT, AND THE DECISION IS RECORDED HERE BECAUSE THIS IS WHERE THE
# TIER WOULD BE ADDED. prostate.js:231 cited "the same honesty precedent this atlas's LUAD adrenal
# gland and ccRCC liver/brain sites already use" — a SPECIFIC POINTER into the corpus rather than a
# universal over it. Two of the three named sites really do decline a frequency; the ccRCC LIVER
# site (kidneys.js:143) carries "~15% of clear cell RCC", the exact opposite of the precedent being
# invoked, so the claim was two-thirds true and mis-addressed on the third. REPAIRED BY HAND, not
# mechanized: resolving it requires modelling what "this precedent" IS and then testing a named
# site for it, and a matcher loose enough to find the reference would flag every cross-reference in
# the atlas — the population is ~52 self-references in record fields, mostly legitimate. The cost
# of declining is real and worth stating: this pointer names sites by DESCRIPTION, and kidneys.js:145
# (the surviving ccRCC referent) has an open item on its own ccf wording, so a repair there silently
# breaks this pointer with nothing reporting it. That is the staleness-at-birth mechanism already on
# record for line pointers, arriving in prose form. IF A THIRD TIER IS EVER BUILT, IT GOES HERE.
#
# A FOURTH SHAPE IS DECLINED FOR A BETTER REASON THAN THE THIRD: THE FLAG TIER ALREADY IS THE
# MECHANISM. Two records that CONTRADICT EACH OTHER is a real class with real instances, both found
# in the 2026-09-08 pass:
#   liver.js:118 claimed the liver's dual blood supply was unlike every other organ in this atlas
#     while lungs.js:132 claimed the lungs' was unique among organs — each was the other's
#     counterexample, and both are now repaired.
#   liver.js:280 called TERT truncal "for a temporal reason, not a spatial one like every other
#     trunk mutation in this atlas" while colon.js:215 reasons about APC identically and closes
#     "the same reasoning that made TERT the liver's trunk" — the contradicting record cites the
#     record it contradicts.
# AND NEITHER WAS FOUND BY LOOKING FOR CONTRADICTIONS (user ruling, 2026-09-08). Both fell out of
# ADJUDICATING A FLAGGED UNIVERSAL, which is not a coincidence but what adjudicating a universal
# MEANS: to decide "unlike every other organ here" you go looking for the counterexample, and if one
# exists you have found the contradiction. So the class is real, mechanizing it needs exactly the
# semantics declined above, and the flag tier already produces its candidates. Building a second
# instrument to find what the first already surfaces is the cost being avoided here.
# THE ADJACENT SHAPE IS NOT THIS ONE AND IS NOT DECLINED: a COMMENT that contradicts its own record
# stays on the open list (batch 5's surviving grep), and this pass added its strongest instance —
# brain.js:124's text asserted the cortex was "unlike this atlas's other organs" in being a
# deliberate non-"arises here" point, while prostate.js:115's comment describes the same technique as
# "same technique Liver's Bile ducts point and Brain's Cerebral cortex point already use", naming the
# contradicted record as its precedent. Repaired by hand; the grep is still unbuilt.
#
# TWO WIDENINGS OF THIS INSTRUMENT'S OWN POPULATION WERE MEASURED AND DECLINED, both because the
# measurement came back small or dirty rather than because widening felt risky:
#   READ_FIELDS += 'val'. kidneys.js:85 carried the retroperitoneal universal in a facts-grid value,
#     invisible here, and was repaired by hand. Scanning all 51 val: fields through both tiers finds
#     that ONE site and nothing else, and it is a flag rather than a defect. One hit in 51, already
#     repaired, against a permanent population change on a GATING instrument: not worth it. THIS IS
#     THE LINE TO CHANGE if a second val: instance ever appears.
#   QUANTIFIER += bare plurals ("this atlas's other organs"). brain.js:124 slipped tier one because
#     "other organs" carries no quantifier token, so the widening looks free. Measured: 4 candidates,
#     and 2 of them (bladder.js:250 "several other cancers (ARID1A in Liver and Ovary...)",
#     breast.js:175 "the other cancer modeled in this atlas") are SPECIFIC POINTERS into the corpus,
#     which is precisely the class declined three paragraphs above. The discriminator between a
#     universal and a pointer is the determiner, not the noun, so a bare-plural pattern cannot see
#     it. The remaining real one, testis.js:256 ("unlike the marked pleomorphism this atlas's other
#     tumors often show"), is on the open list as a hand read.
#
# NO SIDECAR, DELIBERATELY. The defect count already drives exit status, which is how this
# instrument has always worked, and a sidecar would move battery.py's "N reporting members emitted
# a sidecar / M sidecar metrics ratcheted" pair and give the widening a second thing to keep in
# step for no detection gain. The consequence accepted: the UNRESOLVED count is printed every run
# but is not ratcheted, so it can grow silently. THIS is the line to change if it does.
POOL_DECL = re.compile(r"^const (REGIONS|TRUNK|PRIVATE_POOL|EXCLUSIVE_PAIRS)_([A-Z0-9]+)\s*=")
PRESENCE_POOLS = ('REGIONS', 'TRUNK', 'PRIVATE_POOL')
GENE_FIELD = re.compile(r"gene:'((?:[^'\\]|\\.)*)'")
# Gene-symbol shape, deliberately strict: a leading ALL-CAPS token. 'Clock-like background
# variants' and '1p/19q co-deletion' correctly fail it and fall through to UNRESOLVED rather than
# being resolved against a symbol that is not one.
SYMBOL = re.compile(r"^([A-Z][A-Z0-9]+(?:-[A-Z0-9]+)?)\b")
# A universal needs BOTH a quantifier and a reference to the corpus. 'every'/'all'/'only' are
# common words and 'this atlas' is not, so the corpus reference carries the precision here.
QUANTIFIER = r"\bevery\b|\ball (?:other )?(?:cancers?|tumors?|tumours?|organs?|sites?)\b|\beach\b|\bthe only\b|\bno other\b|\bany other\b"
CORPUS_REF = r"\bthis atlas\b|\bthe atlas\b|\bmodel(?:l)?ed in this\b|\bmodel(?:l)?ed here\b|\belsewhere in this\b"
# A COMPARATIVE or SUPERLATIVE quantification over the corpus is NOT a presence claim, and
# resolving gene presence against it would answer a question it never asked. FOUND BY THE FIRST
# LIVE RUN, which is this file's documented pattern arriving a second time: skin.js:408 says TTN
# "earns its place in THIS cancer's pool more than any other" and that "melanoma's per-cell
# mutation load is the heaviest in this atlas". Both are real corpus claims that deserve a read —
# the second is an unexamined superlative over the atlas's own figures — but TTN's presence in the
# other fifteen cancers is irrelevant to either, so the honest verdict is UNRESOLVED, not DEFECT.
# A hand enumeration had scored this record CLEAN because it lacks the boilerplate clause; the
# guard found it for a reason the hand pass had no way to see, which is the argument for the guard.
COMPARATIVE = (r"\bmore than\b|\bless than\b|\bfewer than\b|\bbetter than\b|\bworse than\b|"
               r"\bheaviest\b|\blightest\b|\bhighest\b|\blowest\b|\bmost\b|\bleast\b|"
               r"\bthe only\b|\b\w+er than\b")

# THE WORLD-SCOPED WIDENING (2026-09-08, user ruling), WHICH IS THE FLAG TIER ONLY. Requiring a
# corpus reference alongside the quantifier meant this instrument saw the WEAKER claim and missed the
# bolder one. liver.js:118 says the liver's dual blood supply is unlike any other organ IN THIS ATLAS
# and was flagged; lungs.js:132 says "Uniquely among organs, the lungs have two separate blood
# supplies" and was invisible. Both are false, and the unscoped one is false about ANATOMY rather
# than about this corpus — a claim without "in this atlas" is strictly stronger and strictly less
# visible, so the guard was systematically blind in the direction where being wrong costs more.
# THE PRECISION HAS TO COME FROM THE PHRASE, NOT FROM QUANTIFIER. Dropping CORPUS_REF and keeping
# QUANTIFIER would match every "each", "every" and "the only" in ordinary prose, which is unreadable
# noise on a tier a human is expected to actually read. So this is a separate, tighter vocabulary of
# exclusivity phrasings, and it was chosen by measuring ten candidates over the live corpus rather
# than by picking a wording and tuning it. Counts are from that measurement (2026-09-08) and are a
# record of the decision, not a live metric:
#   IN   uniquely among/in/to     2 hits, both real claims about the whole body
#   IN   nowhere else             1 hit, real (stomach.js:177)
#   IN   the one place in the body 1 hit, real (lungs.js:132, its SECOND claim)
#   IN   unlike any               0 hits, kept — same shape as the two above, named in the ruling
#   OUT  the first                6 hits, ORDINAL every time ("the first branch of the external
#                                 carotid", "the first hit is inherited") — 6/6 false, so it stays out
#   OUT  the only                 1 hit outside a corpus reference, and that one (lungs.js:248) sits
#                                 INSIDE A QUOTED SOURCE STATEMENT — the atlas is not the one making
#                                 the claim. The corpus-scoped tier still catches skin.js:257's
#                                 "the only one this atlas shows".
#   OUT  no other / any other     already carried into tier one by QUANTIFIER
# "the one place in the body" is deliberately that long: pancreas.js:208's "the one site here" leaks
# past CORPUS_REF because bare "here" is not in it, and a short "the one place" pattern would drag
# that in as a second false positive on a tier whose whole value is a low false rate.
# NEVER A DEFECT, BY CONSTRUCTION. Nothing in this corpus can settle whether a claim about the whole
# human body is true — that is a textbook question, not a grep — so this tier prints for a human read
# and does not touch exit status, for the same reason as UNRESOLVED above and on a strictly stronger
# class of claim. THIS IS THE LINE THAT WOULD HAVE TO CHANGE to make it gate, and it should not: a
# tier that failed on claims it cannot adjudicate forces a rewording to go green.
WORLD_UNIVERSAL = (r"\buniquely (?:among|in|to)\b|\bunlike any\b|\bnowhere else\b|"
                   r"\bthe one place in the body\b")

def universal_clause(text):
    """The narrowest clause carrying both a quantifier and a corpus reference, or None.
    Fine clauses are tried FIRST so the reported span is the claim and not its whole sentence;
    the sentence is the fallback because a list comma severs quantifier from referent exactly as
    it severs negation from predicate (see GRANULARITIES)."""
    for sentence in clauses(text):
        for cl in fine_clauses(sentence) + [sentence]:
            if re.search(QUANTIFIER, cl, re.I) and re.search(CORPUS_REF, cl, re.I):
                return ' '.join(cl.split())
    return None

def world_clause(text):
    """The narrowest clause asserting exclusivity over the WORLD rather than over the atlas, or None.
    The corpus-reference EXCLUSION is what keeps the two tiers disjoint: a clause that names the atlas
    belongs to universal_clause, and reporting it in both places would double-count one claim.

    THE RETURNED SPAN IS AN ANCHOR, NOT AN INVENTORY. One field can carry several of these and
    lungs.js:132 measurably does — "Uniquely among organs..." and "the one place in the body where
    'artery' means deoxygenated" are one desc — so the report points a human at the field and the
    human reads the field. Enumerating them would only restate what reading it already shows."""
    for sentence in clauses(text):
        for cl in fine_clauses(sentence) + [sentence]:
            if re.search(WORLD_UNIVERSAL, cl, re.I) and not re.search(CORPUS_REF, cl, re.I):
                return ' '.join(cl.split())
    return None

def gene_symbol(raw):
    m = SYMBOL.match(raw.strip())
    return m.group(1) if m else None

def classify_universal(text, symbol, cancer, presence):
    """-> (verdict, reason). DEFECT-FALSE-UNIVERSAL / OK-UNIVERSAL-VERIFIED /
    UNIVERSAL-UNRESOLVED / UNIVERSAL-WORLD-SCOPED / NONE. `presence` maps CANCER -> gene symbols."""
    cl = universal_clause(text)
    if cl is None:
        # TIER ONE FIRST, AND ONE VERDICT PER FIELD. A field carrying both an atlas-scoped and a
        # world-scoped claim reports the atlas-scoped one, because that is the tier that can be
        # adjudicated mechanically — and the human it sends to the field sees both anyway.
        if world_clause(text):
            return ('UNIVERSAL-WORLD-SCOPED', 'asserts exclusivity over the whole body, not over '
                                              'the atlas — no corpus scan can settle it')
        return ('NONE', '')
    if re.search(COMPARATIVE, cl, re.I):
        return ('UNIVERSAL-UNRESOLVED', 'comparative/superlative over the corpus, not a presence '
                                        'claim — gene presence cannot settle it')
    if symbol is None:
        return ('UNIVERSAL-UNRESOLVED', 'quantifies over the atlas; record names no gene symbol')
    # The claim must actually be ABOUT the record's gene, else the symbol is the wrong subject to
    # resolve against — 'a first for the atlas' on a gene record is not a claim about that gene.
    if not re.search(r'\bthis gene\b|\b%s\b' % re.escape(symbol), text, re.I):
        return ('UNIVERSAL-UNRESOLVED', f'quantifies over the atlas but not about {symbol}')
    others = sorted(k for k in presence if k != cancer)
    missing = [k for k in others if symbol not in presence[k]]
    if missing:
        return ('DEFECT-FALSE-UNIVERSAL',
                f'{symbol} is absent from {len(missing)} of {len(others)} other cancers '
                f'({", ".join(missing)})')
    return ('OK-UNIVERSAL-VERIFIED', f'{symbol} is present in all {len(others)} other cancers')

def corpus_scan(paths):
    """-> (presence, owner): CANCER -> set of gene symbols, and (path, lineno) -> CANCER.
    EXCLUSIVE_PAIRS is tracked as a boundary but excluded from PRESENCE — a gene named only in an
    exclusivity pair is not a modeled record, and counting it would manufacture support."""
    presence, owner = {}, {}
    for p in paths:
        cancer = None
        for i, line in enumerate(open(p, encoding='utf-8'), 1):
            m = POOL_DECL.match(line)
            if m:
                if m.group(1) in PRESENCE_POOLS:
                    cancer = m.group(2)
                    presence.setdefault(cancer, set())
                else:
                    cancer = None
                continue
            if line.startswith('];'):
                cancer = None
                continue
            if cancer is None or line.lstrip().startswith('//'):
                continue
            owner[(p, i)] = cancer
            for raw in GENE_FIELD.findall(line):
                s = gene_symbol(raw)
                if s:
                    presence[cancer].add(s)
    return presence, owner

# A synthetic index, so the resolver is tested on known answers rather than on the live corpus it
# is meant to judge. TTN present in two of three cancers is the brain.js:215 shape exactly.
UNIVERSAL_INDEX = {'GBM': {'TTN', 'EGFR'}, 'HGSOC': {'TTN'}, 'OCCC': {'OBSCN'}}
UNIVERSAL_FIXTURES = [
    # the two real defects, abridged — a false universal must name its counterexample
    ("background mutational noise, common simply because TTN is one of the largest genes in the "
     "genome, same as in every other cancer modeled in this atlas.",
     'TTN', 'GBM', 'DEFECT-FALSE-UNIVERSAL'),
    ("the same cell-cycle-checkpoint role this gene plays in every other cancer modeled in this "
     "atlas.", 'EGFR', 'GBM', 'DEFECT-FALSE-UNIVERSAL'),
    # the TRUE universal must pass, or the check is just a pattern ban
    ("noise, common because TTN is huge, same as in every other cancer modeled in this atlas.",
     'TTN', 'OCCC', 'OK-UNIVERSAL-VERIFIED'),
    # no gene subject -> unresolved, NOT a defect and NOT a clean
    ("The kidneys sit retroperitoneally, unlike every other organ modeled in this atlas so far.",
     None, 'GBM', 'UNIVERSAL-UNRESOLVED'),
    # a corpus universal on a gene record that is NOT about that gene: wrong subject, unresolved
    ("the pool ships two verified passenger entries and zero drivers, a first for every cancer in "
     "this atlas", 'OBSCN', 'OCCC', 'UNIVERSAL-UNRESOLVED'),
    # skin.js:408's real shape, abridged: the gene IS named and the corpus IS quantified over, but
    # the claim is comparative. Resolving TTN presence here would report a defect that is not one —
    # this fixture is the one that would regress if COMPARATIVE were dropped.
    ("It earns its place in THIS cancer's pool more than any other: melanoma's per-cell mutation "
     "load is the heaviest in this atlas, and almost all of it is passengers like this one.",
     'TTN', 'GBM', 'UNIVERSAL-UNRESOLVED'),
    # ordinary prose and a bare atlas self-reference with no quantifier must not fire
    ("the atlas does not carry a passenger over from other cancers and relabel it", 'TTN', 'GBM',
     'NONE'),
    ("Margins are often pushing and circumscribed rather than infiltrative", 'TTN', 'GBM', 'NONE'),
    # THE WORLD-SCOPED TIER. lungs.js:132's real shape, abridged — the claim this guard could not see
    # before the widening, and the one that is false about anatomy rather than about the corpus.
    ("Uniquely among organs, the lungs have two separate blood supplies.", None, 'LUAD',
     'UNIVERSAL-WORLD-SCOPED'),
    # a world-scoped claim that is TRUE still flags, and that is the tier working rather than failing:
    # stomach.js:177's oblique layer really is unique in the GI tract. A tier that only fired on false
    # claims would be an adjudicator, which is exactly what this cannot be.
    ("an inner oblique layer found nowhere else in the GI tract", None, 'STAD',
     'UNIVERSAL-WORLD-SCOPED'),
    # PRECEDENCE, which is the fixture that would catch double-counting: this clause carries a world
    # phrase AND a corpus reference, so tier one owns it and the world tier must not also claim it.
    ("its wall is unlike any other wall modeled in this atlas", None, 'STAD',
     'UNIVERSAL-UNRESOLVED'),
    # THE TWO MEASURED EXCLUSIONS, pinned so neither is re-added as an improvement. 'the first' was
    # ordinal in 6 of 6 live hits:
    ("supplied by the first branch of the external carotid artery", None, 'STAD', 'NONE'),
    # and 'the only' outside a corpus reference occurred once, inside a QUOTED source statement, where
    # the atlas is reporting a claim rather than making one:
    ('the authors call it "the only setting in which this pattern is seen" (Awad et al., 2016)',
     None, 'LUAD', 'NONE'),
]

FIXTURES = [
    # the four real defects at birth
    ("no interaction analysis has flagged it against either", 'DEFECT'),
    ("No documented conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion.", 'DEFECT'),
    ("no clean subtype-specific percentage exists to cite, so none is shown", 'DEFECT'),
    ("no functional study has adjudicated their role in FTC specifically", 'DEFECT'),
    # the shielding case: a registry-scoped clause must NOT launder an unscoped one beside it
    ("Same honesty note as ATM: recurrent in the registry, driver role in this cancer "
     "unadjudicated.", 'DEFECT'),
    # adversarial: a SHORT quotation is a term of art, not an attestation, and must not exempt.
    # This is the fixture that tests the 20-char floor rather than the exemption it guards.
    ('no functional study has adjudicated this, though the registry calls it a "hotspot" '
     '(Smith et al., 2024)', 'DEFECT'),
    # the SEVERED-NEGATION case, found when the fix for shielding produced a false clean on it:
    # a list comma puts "No" and "is documented" in different fine clauses. Must still fire.
    ("No conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion is documented.", 'DEFECT'),
    # and its remediated form, which the same union must read as correct rather than as absent
    ("No conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion was found in the cited TCGA "
     "analysis.", 'OK-SEARCH'),
    # the three real correct forms
    ("no clean population-level frequency was found to cite here", 'OK-SEARCH'),
    ("DICER1 never co-occurs with NRAS (zero samples in the GENIE cohort)", 'OK-SCOPED'),
    ("~10–15% of CRC — no canonical figure exists: 8.6% by full sequencing (64/744, Fleming "
     "et al., Cancer Res, 2013) to 12% by hotspot panel (90/734, Mehrvarz Sarshekeh et al., "
     "PLoS One, 2017)", 'EXEMPT-SELF-EVIDENCING'),
    ("No percentage is claimed for the ovary because none is citable — the population registry "
     "grouped it into \"other\" for small numbers", 'EXEMPT-REASON-GIVEN'),
    # the source-attested form, found BY the first run (pancreas.js:208, abridged)
    ('this is the one site here with NO citable percentage, and the honest reason is structural: '
     'the site-frequency source itself says so ("an important site of metastasis from pancreatic '
     'cancer is not detailed in the SEER database", Oweira et al., 2017)',
     'EXEMPT-SOURCE-ATTESTED'),
    # ordinary prose that must not fire
    ("Margins are often pushing and circumscribed rather than infiltrative", 'NONE'),
    ("computed OR 0.67, p=0.39, not significant", 'NONE'),
]

def selftest():
    ok = True
    for text, want in FIXTURES:
        got, why = classify(text)
        good = got == want
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} want {want:24s} got {got:24s} {text[:58]!r}")
    for text, sym, cancer, want in UNIVERSAL_FIXTURES:
        got, why = classify_universal(text, sym, cancer, UNIVERSAL_INDEX)
        good = got == want
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} want {want:24s} got {got:24s} {text[:58]!r}")
    print('SELFTEST', 'PASS — fires on the existence form, passes the search/scoped forms, '
          'honours all three exemptions, is not laundered by a short quotation, and resolves a '
          'corpus universal against a synthetic index in all three directions, and flags a '
          'world-scoped exclusivity claim without letting tier one double-count it'
          if ok else 'FAIL — do not trust this scan')
    return ok

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    paths = sorted(glob.glob('js/organs/*.js'))
    if not paths:   # a glob that resolved to nothing is a VACUOUS PASS — the dangerous form (sweep, 2026-09-09)
        print('absence_claim_check: REFUSING TO REPORT — the corpus glob resolved to nothing'); sys.exit(3)
    presence, owner = corpus_scan(paths)
    counts = {}
    defects = []
    universals = []
    unresolved = []
    world = []
    for f in paths:
        for i, line in enumerate(open(f, encoding='utf-8'), 1):
            if line.lstrip().startswith('//'):
                continue
            fields = FIELD.findall(line)
            gene = next((gene_symbol(v) for k, v in fields if k == 'gene'), None)
            for fld, val in fields:
                if fld not in READ_FIELDS:
                    continue
                for cl in clauses(val):
                    verdict, why = classify(cl)
                    if verdict != 'NONE':
                        counts[verdict] = counts.get(verdict, 0) + 1
                        if verdict == 'DEFECT':
                            defects.append((f, i, fld, ' '.join(cl.split()), why))
                # The universal runs on the WHOLE field value, not per sentence: the quantifier and
                # the gene it is about are routinely in different sentences of one note.
                uverdict, uwhy = classify_universal(val, gene, owner.get((f, i)), presence)
                if uverdict != 'NONE':
                    counts[uverdict] = counts.get(uverdict, 0) + 1
                    span = universal_clause(val) or world_clause(val) or ''
                    if uverdict == 'DEFECT-FALSE-UNIVERSAL':
                        universals.append((f, i, fld, span, uwhy))
                    elif uverdict == 'UNIVERSAL-UNRESOLVED':
                        unresolved.append((f, i, fld, span, uwhy))
                    elif uverdict == 'UNIVERSAL-WORLD-SCOPED':
                        world.append((f, i, fld, span, uwhy))
    for f, i, fld, cl, why in defects:
        print(f'  UNSCOPED ABSENCE CLAIM: {f}:{i} [{fld}] — {why}')
        print(f'      {cl[:220]}')
    for f, i, fld, cl, why in universals:
        print(f'  FALSE CORPUS UNIVERSAL: {f}:{i} [{fld}] — {why}')
        print(f'      {cl[:220]}')
    # Printed, not failed, under the declared two-tier boundary above.
    for f, i, fld, cl, why in unresolved:
        print(f'  universal needs a read: {f}:{i} [{fld}] — {why}')
        print(f'      {cl[:160]}')
    # Same tier, wider population: exclusivity over the body rather than over the corpus. Separate
    # label because the READ is different — this one is answered from a textbook, not from the atlas.
    for f, i, fld, cl, why in world:
        print(f'  world-scoped universal needs a read: {f}:{i} [{fld}] — {why}')
        print(f'      {cl[:160]}')
    # Tolerated-count resolution (2026-09-10): every 'needs a read' universal is a flag keyed by file|field|span head
    # (content, not line numbers); undeclared, expired or stale → problem → exit 1.
    universal_flags = {f'{f}|{fld}|{cl[:40]}': f'{f}:{i} [{fld}] {why}' for f, i, fld, cl, why in unresolved + world}
    blocks = [f for f in paths if 'layerSlab(' in open(f, encoding='utf-8').read()]   # the census that settles skin.js's 'only cut block'
    if len(blocks) != 1:
        universal_flags['layerSlab-census'] = f'{len(blocks)} organ files build a cut block ({blocks}); the skin.js "only one" claim needs a re-read'
    problems_t = resolve('absence_claim_check', universal_flags, DECLARED)
    tally = ', '.join(f'{k} {v}' for k, v in sorted(counts.items()))
    bad = len(defects) + len(universals)
    # DONE line last (7-bis): a clean scan is never a pass without it.
    print(f'DONE absence_claim_check: {bad} unscoped claims '
          f'({len(defects)} absence, {len(universals)} false corpus universal), '
          f'{len(unresolved)} universals flagged for a read, '
          f'{len(world)} world-scoped, '
          f'{len(presence)} cancers indexed ({tally or "no claims found"}), {len(problems_t)} tolerated-count problems')
    sys.exit(1 if (bad or problems_t) else 0)
