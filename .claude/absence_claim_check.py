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
    {'key': 'js/organs/thyroid.js|ccf|the same illustrative convention as ever', 'reason': 'TRUE by this project\'s own standing rule (CLAUDE.md data rule 2: "Site→gene pairing is illustrative for every cancer, stated from the start") — restates an already-established, atlas-wide convention rather than asserting a new fact about the corpus', 'until': None},
    # THE STALE DECLARATION ABOVE THIS BLOCK WAS REMOVED, NOT LEFT (2026-09-13): its key was a
    # 40-char prefix of thyroid.js's own HISTOLOGY_ATC spindle text, and that text was rewritten
    # (this same triage round) to name genGBM's pseudopalisading rim explicitly rather than
    # leaving it implicit — the fix that closed the fourth "claim about the atlas's own state was
    # wrong" instance the user cited when ordering this whole extension. A rewritten claim earns a
    # fresh key below (thyroid.js|text|This is the atlas's first tumor built fr) rather than
    # reusing the old one — reusing it would validate today's text against yesterday's read.
    #
    # THE FULL FIRST TRIAGE ROUND (2026-09-13): every flag the comment-scanning extension surfaced
    # on its first live run, read and resolved in one pass, per the user's own instruction to
    # report existing violations before fixing. Two real, substantive defects were FOUND AND
    # FIXED as part of this triage, not merely declared: (1) the two remaining uncorrected copies
    # of the spindle-cell overclaim (thyroid.js's own file-level and HISTOLOGY-preceding comments
    # — the third and fourth of four total copies, the first two having been caught and fixed
    # earlier in this same round before this mechanism existed); (2) breast.js:41's "unlike the
    # other five real-mesh organs" — true when breast was added, false since Lungs/Colon/Stomach
    # each independently left VHD sourcing. Everything else below was read against CLAUDE.md's
    # own record or the corpus directly and confirmed true.
    {'key': 'js/histology.js|comment|this atlas\'s FIRST tumor built from spin', 'reason': 'TRUE — genATC\'s own header comment, verified directly against every existing generator before this entity was written: genGBM\'s pseudopalisading rim draws elongated tumor-cell NUCLEI (no matching cytoplasm) and genCRC\'s desmoplastic stroma draws true spindle-shaped cell BODIES only as reactive stromal fibroblasts, never as the tumor population itself — the precise distinction this comment states', 'until': None},
    {'key': 'js/histology.js|comment|this atlas\'s first real dispatch of draw', 'reason': 'TRUE, confirmed against CLAUDE.md data rule 33: genProstateNeuro\'s use of drawSmallCellSheet predates genLungsSCLC\'s own reuse of the identical primitive ("genLungsSCLC... dispatches the exact same drawSmallCellSheet... calls genProstateNeuro already uses") — the chronology this comment states is exactly what rule 33 independently records', 'until': None},
    {'key': 'js/organs/bladder.js|comment|the same cross-site safety check this at', 'reason': 'TRUE — this exclusivity-before-inclusion check on every private-pool candidate is a real, repeated, documented atlas convention (CLAUDE.md data rules 4, 6, 12, 13, 15, 16, 21, 22, 24 each independently show it), not a fabricated uniqueness claim', 'until': None},
    {'key': 'js/organs/breast.js|comment|BRANCH PAIR, MUTUALLY EXCLUSIVE (Ciriell', 'reason': 'TRUE — GBM\'s EGFR/PDGFRA split-by-region (data rule 14) and Prostate\'s TMPRSS2-ERG/SPOP split (data rule 16) are both real, already-documented two-sites-each precedents; ILC\'s PIK3CA/PTEN/ERBB2 pair follows the same, not a new, architectural pattern', 'until': None},
    {'key': 'js/organs/breast.js|comment|The source mesh is 52 separate connected', 'reason': 'TRUE — this is a factual description of the asset\'s own topology (52 components, individually-tagged real anatomical sub-structures per the entry\'s own ontology metadata), stated as this organ\'s own finding, not a claim about any other organ', 'until': None},
    {'key': 'js/organs/kidneys.js|comment|\'occc\'/\'ovarian clear cell\' uniquely to ', 'reason': 'TRUE, mechanically checkable and already checked: the app\'s own regression suite asserts search("occc") resolves to Ovaries alone and search("ccrcc") resolves to Kidneys alone', 'until': None},
    {'key': 'js/organs/kidneys.js|comment|It read "unlike every prior organ in thi', 'reason': 'TRUE and safe — this comment is a self-documented correction record (explicitly narrating that a prior false uniqueness claim was found and removed from the served desc field, which now asserts no comparison at all), not a live claim about the corpus', 'until': None},
    {'key': 'js/organs/lungs.js|comment|The desc used to open "Uniquely among or', 'reason': 'TRUE and safe — the same self-documented correction shape as kidneys.js:89: the served desc now correctly says "Like the liver, the lungs have two separate blood supplies" rather than claiming uniqueness; this comment narrates the fix, it does not repeat the defect', 'until': None},
    {'key': 'js/organs/lungs.js|comment|the same standing check every organ in t', 'reason': 'TRUE — restates CLAUDE.md data rule 1\'s own standing practice ("check mechanistic fit with the specific cancer being modeled") verbatim in substance, an established atlas-wide convention rather than a new corpus fact', 'until': None},
    {'key': 'js/organs/ovary.js|comment|\'ccrcc\' and \'renal cell carcinoma\' keep ', 'reason': 'TRUE, the mirror of kidneys.js:6 — the same regression-tested search-alias behavior, checked in the same suite', 'until': None},
    {'key': 'js/organs/ovary.js|comment|KRAS and BRAF are BOTH trunk, explicitly', 'reason': 'TRUE, and now correctly anchored after the clauses() sentence-boundary fix in this same commit — this sentence genuinely contains both "each other" (describing RAS/BRAF\'s own mutual exclusivity) and "this atlas\'s own FTC entry" (a real, correct comparison to data rule 27\'s RAS-vs-PAX8-PPARγ split), coincidentally co-occurring but neither one false', 'until': None},
    {'key': 'js/organs/ovary.js|comment|a first for the atlas.', 'reason': 'TRUE, confirmed against CLAUDE.md data rule 21 verbatim: "TWO passengers, ZERO drivers — the first driverless pool in the atlas"', 'until': None},
    {'key': 'js/organs/ovary.js|comment|the atlas\'s first MRI-derived organ', 'reason': 'TRUE, confirmed against CLAUDE.md data rule 29 and by census: no other organ asset in js/organs/*.js is MRI-derived (the rest are VHD/CT scans, Sketchfab artist scans, a UJAT asset, or procedural)', 'until': None},
    {'key': 'js/organs/pancreas.js|comment|this is the atlas\'s first organ that is ', 'reason': 'TRUE and structurally unique — pancreas is the only organ in the corpus with a genuine dual exocrine/endocrine gland identity; no other organ file describes itself this way', 'until': None},
    {'key': 'js/organs/pancreas.js|comment|HISTOLOGY — organoid architecture (trabe', 'reason': 'TRUE, verified directly at the source for PanNET itself (Monroe & El Naili, Academic Pathology, 2025, PMID 40034114) — the comparative clause states this pass\'s own sourcing discipline (confirmed directly, not extrapolated), not an unscoped claim about every neuroendocrine tumor generator in the file', 'until': None},
    {'key': 'js/histology.js|comment|Reuses drawCell verbatim for the base ce', 'reason': 'TRUE — checked directly against every generator in this file before writing genPACC: no prior generator draws a granule-dot overlay on cytoplasm, confirmed by reading the file rather than assumed', 'until': None},
    {'key': 'js/organs/prostate.js|comment|a genuinely different KIND of truncal ju', 'reason': 'TRUE, confirmed against CLAUDE.md data rule 32 verbatim: pneuro\'s TP53/RB1 double-hit is truncal for a "fourth, transformation-defining reason", distinct from the three data rule 5 had already named', 'until': None},
    {'key': 'js/organs/prostate.js|comment|the same "coauthor named as if first aut', 'reason': 'TRUE, confirmed against CLAUDE.md data rule 12: ccRCC\'s Nickerson-vs-Moore correction is a real, documented first instance of exactly this pattern (a coauthor named as if first author), and this Boutros-vs-Cooper correction is a real second instance', 'until': None},
    {'key': 'js/organs/prostate.js|comment|this atlas\'s first real dispatch of it.', 'reason': 'TRUE, the same chronology as histology.js:1829 and confirmed by CLAUDE.md data rule 33 — genProstateNeuro\'s dispatch of drawSmallCellSheet predates genLungsSCLC\'s later reuse of the same primitive', 'until': None},
    {'key': 'js/organs/skin.js|comment|a second reason it lives in the trunk-no', 'reason': 'benign scope mismatch, not a live claim: "nowhere else" here is scoped to melanoma\'s OWN gene ledger (NF1 is not drawn as a branch/private-pool entry anywhere else in THIS cancer\'s own data), never to the atlas or the world — the WORLD_UNIVERSAL trigger phrase is a false positive on scope, not a false claim on substance', 'until': None},
    {'key': 'js/organs/stomach.js|comment|This was the atlas\'s first non-gland-for', 'reason': 'TRUE and now self-corrected in this same commit: the comment used to claim every other adenocarcinoma panel drew gland-forming architecture, which became false the moment breast\'s ILC entry (added later in this session, and reusing this entry\'s own drawSingleFileCord primitive) shared the identical non-gland-forming, E-cadherin-loss shape — fixed to state the correction explicitly rather than repeat the now-false comparison', 'until': None},
    {'key': 'js/organs/stomach.js|comment|is a mechanism class no other cancer in ', 'reason': 'TRUE, confirmed against CLAUDE.md data rule 19 verbatim: "its driving lesion — E-cadherin/cell-adhesion loss — is a mechanism class no other atlas cancer has"', 'until': None},
    {'key': 'js/organs/testis.js|comment|Because this atlas\'s private pool is dra', 'reason': 'TRUE — a mechanical description of js/panel.js\'s own actual private-pool drawing behavior (draws independently into cells at every site regardless of that site\'s branch gene), independently corroborated by CLAUDE.md data rule 22\'s identical framing of the same mechanism for this same exclusion', 'until': None},
    {'key': 'js/organs/testis.js|comment|This field used to close with "unlike th', 'reason': 'TRUE and safe — explicitly a self-documented "do not re-add" record: commit 6e3c310 already removed this false frequency claim from the served field, and CLAUDE.md\'s own record confirms it ("6e3c310 had already dropped it from the served field, and the phrase survives only in the comment recording that removal")', 'until': None},
    {'key': 'js/organs/testis.js|comment|a deliberately different KIND of genomic', 'reason': 'TRUE, confirmed against CLAUDE.md data rule 22 verbatim: i(12p)/12p gain is "framed explicitly as a different KIND of genomic event — a whole-arm chromosomal gain, not a point mutation"', 'until': None},
    {'key': 'js/organs/testis.js|comment|for every other cancer in this atlas', 'reason': 'TRUE — 88-95% five-year survival for METASTATIC disease is a genuinely exceptional outcome against every other cancer\'s own documented distant/metastatic-stage figures in this atlas (PDAC, HCC, GBM, LUAD and others all report far lower distant-stage survival in their own EXTENT_STATUS/citation records)', 'until': None},
    {'key': 'js/organs/thyroid.js|comment|This is the atlas\'s first tumor built fr', 'reason': 'TRUE — the ATC file-level comment, already corrected in this same round to name genGBM\'s pseudopalisading rim explicitly as the near-miss and distinguish spindle-shaped cell BODIES from spindle-shaped NUCLEI; verified directly against every generator in js/histology.js', 'until': None},
    {'key': 'js/organs/thyroid.js|comment|the atlas\'s first tumor built from spind', 'reason': 'TRUE — the HISTOLOGY_ATC-preceding comment, already corrected in this same round to cross-reference the file-level comment\'s own correction of the genGBM near-miss rather than restating the original overclaim', 'until': None},
    {'key': 'js/organs/thyroid.js|comment|this is the atlas\'s first endocrine-syst', 'reason': 'TRUE, confirmed by census: grep across every js/organs/*.js organEntry shows thyroid is the only one carrying system:\'Endocrine\' — every other organ is Urinary/Reproductive/Nervous/Digestive/Respiratory/Integumentary', 'until': None},
    {'key': 'js/organs/thyroid.js|text|This is the atlas’s first tumor built fr', 'reason': 'TRUE — the served HISTOLOGY_ATC feature text, corrected earlier in this same round (before this mechanism existed) to name genGBM\'s pseudopalisading rim explicitly rather than leaving "the only true spindle-shaped cell body elsewhere" unattributed; this is the fresh key for that same, now-accurate claim, replacing the stale declaration removed above', 'until': None},
    {'key': 'js/organs/prostate.js|comment|unlike every other trunk in this atlas.', 'reason': 'genuinely ambiguous, not a clean read either way: DAC\'s trunk names a real gene (TMPRSS2-ERG) whose reported rate is extremely cohort-variable (3-47%), a different shape from acinar\'s own fact-statement trunk (no gene at all, data rule 15) or FTC\'s competing-status trunk (a clean either/or split, data rule 27) — plausible that this is a genuinely distinct fourth shape, but not confirmable without deeper comparison across every other trunk entry\'s own citation record', 'until': '2026-10-01'},
    {'key': 'js/organs/liver.js|comment|BRANCH — IDH1/2 mutation (the modeled tu', 'reason': 'TRUE — deliberately modeled on an already-established precedent, not an independently-invented pattern: this is the same "taken road / other road, split two sites each" architecture thyroid FTC\'s NRAS/PAX8-PPARγ pair already uses (data rule 27), read directly from thyroid.js before writing this entry', 'until': None},
    {'key': 'js/organs/skin.js|note|This is the founding route for every bra', 'reason': 'TRUE and scoped to "this entry", not the atlas — MCC\'s own trunk note above (lines 596-605 of the comment block) states explicitly that every branch/private-pool gene in this entry is built from the MCPyV-negative lineage\'s biology specifically, and this sentence restates that same, already-declared, entry-scoped fact rather than asserting a new claim about the corpus', 'until': None},
    {'key': 'js/organs/skin.js|comment|TRUNK — a two-entry STATUS trunk, the sa', 'reason': 'TRUE and self-evidencing — names its own precedents by data-rule number (FTC\'s RAS-vs-PAX8 divergence, data rule 27; bladder\'s pathway-divergence status, data rule 24), both real, already-documented status-trunk architectures in this same atlas, not an invented or unscoped claim', 'until': None},
    {'key': 'js/organs/skin.js|note|without the mutation-driven branch/priva', 'reason': 'TRUE, checked against every other trunk/branch/private-pool architecture in this atlas before writing it: every other entity — including the atlas\'s other status-trunk entities (GBM/OCCC/bladder/FTC) and its other quiet-genome entities (seminoma/PTC, data rule 28) — has at least some real, cited branch- or private-pool-tier mutation modeled; MCC\'s MCPyV-positive route is the first trunk route in the atlas with literally none, for the mechanistic reason its own trunk note gives (a viral, not mutational, founding event)', 'until': None},
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
    silently destroys the self-evidencing exemption, which depends on counting them.

    THE CLOSING-QUOTE GAP (2026-09-13, found live against a real corpus defect, not fixture-
    first): '(?<=[.;])\\s+' alone never splits '...ovarian cancer." KRAS and BRAF...' — the
    whitespace is preceded by the closing '"', not by the period one character earlier, so the
    lookbehind never fires and two real sentences merge into one. That merge is exactly how
    ovary.js's LGSC comment produced a false DEFECT: 'first' (inside the quoted source's own
    "first example... in ovarian cancer") and 'this atlas' (in the FOLLOWING sentence's FTC
    comparison) landed in one merged pseudo-sentence, and the unrelated quantifier 'each' (from
    an unrelated parenthetical in between) satisfied QUANTIFIER_FALLBACK against a CORPUS_REF
    that was never in the same real sentence at all. Measured before fixing, not assumed narrow:
    a grep across js/organs/*.js + js/histology.js finds 22 real '<lower>."  <Upper>' boundaries
    this gap has been silently merging since comment-block scanning shipped, not a one-off.
    Fixed by ALSO splitting on whitespace preceded by a sentence-ending mark followed by one
    closing-quote character (straight or curly) — two fixed-width lookbehinds in one
    alternation, since Python's re requires each lookbehind fixed-width, not the pattern as a
    whole."""
    protected = value.replace('et al.', 'et al')
    for sentence in re.split(r'(?<=[.;])\s+|(?<=[.;]["\'\u2019\u201d])\s+', protected):
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
# 'first' ADDED 2026-09-13 (user ruling — self-referential novelty claims are the positive
# mirror of "no other entry" and deserve the same governance). NOT the same widening as the
# already-measured-and-declined WORLD_UNIVERSAL candidate below ("the first" was tested THERE
# unscoped and was ordinal in 6/6 live hits — "the first branch of the external carotid
# artery"). Gated here by the SAME CORPUS_REF co-occurrence every other QUANTIFIER token already
# requires. The literal phrase matters too: the real live claims this token exists to catch read
# "the atlas's first..." / "this atlas's first...", not literally "the first", so the pattern is
# bare \bfirst\b (a first draft used \bthe first\b and its own selftest fixture caught the miss
# — "the atlas's first" does not contain the substring "the first"). MEASURED, not assumed
# clean, at that width: 7 live "first"+"atlas" co-occurrences in one sentence — 5 real
# self-referential atlas claims (the ovary/prostate/thyroid instances this ruling exists for)
# and 2 that read as false positives at first (lungs.js:390, skin.js:401 — "the literature was
# first to describe/characterize X", sharing a SENTENCE with an unrelated "this atlas" mention
# via em-dash, not a claim about the atlas itself). Those two are NOT accepted as a cost: see
# QUANTIFIER_FALLBACK and universal_clause's own comment for the precise, measured fix — 'first'
# is excluded from the whole-sentence fallback the other tokens keep, because every one of the 5
# true positives sits in ONE fine clause with 'first' and the corpus reference adjacent, while
# both false positives only co-occur at the whole-sentence grain.
QUANTIFIER = r"\bevery\b|\ball (?:other )?(?:cancers?|tumors?|tumours?|organs?|sites?)\b|\beach\b|\bthe only\b|\bno other\b|\bany other\b|\bfirst\b"
# The subset that MAY fall back to whole-sentence co-occurrence when no fine clause carries
# both tokens — 'first' deliberately excluded; see universal_clause's own docstring for why.
QUANTIFIER_FALLBACK = r"\bevery\b|\ball (?:other )?(?:cancers?|tumors?|tumours?|organs?|sites?)\b|\beach\b|\bthe only\b|\bno other\b|\bany other\b"
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
    it severs negation from predicate (see GRANULARITIES).

    'first' is EXCLUDED from the whole-sentence fallback (2026-09-13) — measured, not assumed:
    every real self-referential "atlas's first X" claim found live sits in one fine clause with
    no separator between 'first' and the corpus reference, while both measured false positives
    (lungs.js:390, skin.js:401) are a "the literature was first to describe X" clause joined by
    an em-dash to an UNRELATED "this atlas" mention elsewhere in the same sentence — real
    co-occurrence only at the whole-sentence grain, never within one fine clause. Restricting
    'first' to fine-clause-only turns both from a flag into a correct silence, and does not
    touch the other quantifier tokens' own established fallback (independently tested already)."""
    for sentence in clauses(text):
        fine = fine_clauses(sentence)
        for cl in fine:
            if re.search(QUANTIFIER, cl, re.I) and re.search(CORPUS_REF, cl, re.I):
                return ' '.join(cl.split())
        if re.search(QUANTIFIER_FALLBACK, sentence, re.I) and re.search(CORPUS_REF, sentence, re.I):
            return ' '.join(sentence.split())
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

# ---------------------------------------------------------------------------
# SELF-REFERENTIAL CLAIMS GET A SCAN TOO (2026-09-13, user ruling). "Claims about the literature
# get citations.json, crosscheck, reach checks, and a verification pass. Claims about the corpus
# get nothing... 'no other entry does this' is an absence claim, which this file already governs
# when it's scoped to a source, but apparently not when it's scoped to the atlas itself." The
# concrete case: a code comment claimed ATC was "the atlas's first tumor-cell spindle
# architecture" — the SAME claim, near-verbatim, sat in THREE places (js/organs/thyroid.js twice,
# js/histology.js once); the false half was caught and fixed in one copy, and the other two
# shipped uncorrected in the same commit, invisible because this instrument had never read a
# comment in its life — READ_FIELDS covers quoted string literals only.
#
# TWO EXTENSIONS, each closing a specific, measured gap:
#   (1) COMMENTS ARE NOW SCANNED, not just fields — reusing fraction_check.py's own comment_blocks
#       (import, not a second copy — this project's own standing rule after citation_paren_ledger
#       stopped keeping its own copy of citation_reach_check's glob). Both js/organs/*.js AND
#       js/histology.js are scanned this way, since a claim about "every existing generator" is
#       precisely a claim about histology.js's own contents, which the field-only scan could never
#       reach even in principle.
#   (2) A REAL, IF DELIBERATELY BOUNDED, MECHANICAL CROSS-CHECK: "grep for the property being
#       claimed unique" (user's own words), made concrete as significant-word overlap between the
#       flagged clause and every OTHER clause/comment-block in the corpus. THIS IS NOT A GENERAL
#       ABSENCE-CLAIM ADJUDICATOR, and claiming otherwise would repeat this file's own declined
#       "third shape"/"fourth shape" mistake one level up: recognizing that GBM's pseudopalisading
#       rim ("elongated nuclei stacked 2-3 deep") contradicts a claim about "spindle-shaped tumor
#       cells" needs the actual domain link (elongated-nucleus ellipse geometry, rx:ry ratio) that
#       no keyword overlap would find — that comment shares exactly ONE significant word
#       ("elongated") with the claim it falsifies, well under any usable threshold. What this DOES
#       reliably find is the shape that actually caused the bug: THE SAME CLAIM RESTATED IN
#       MULTIPLE PLACES, where fixing one copy and missing the others is the realistic failure
#       mode once a human is no longer reading every file (which is exactly what "batch mode"
#       removes). Measured against the real incident before trusting it: the three "atlas's first
#       tumor-cell spindle architecture" comments share {spindle, architecture, confirmed} — three
#       exact-word overlaps — well above the threshold below.
try:
    from fraction_check import comment_blocks
except ImportError:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from fraction_check import comment_blocks

HISTOLOGY_PATH = 'js/histology.js'

# Excludes the vocabulary this file's OWN quantifier/corpus-ref/negation patterns already use
# (atlas, first, only, every, other, entry...) plus a short list of generic domain words this
# corpus uses constantly (tumor, cancer, organ...) — without this, EVERY flagged claim would
# spuriously "overlap" every other one on vocabulary the whole corpus shares, which would make
# the cross-check noise rather than signal.
STOPWORDS = frozenset((
    'atlas', 'first', 'other', 'others', 'every', 'entry', 'entries', 'model', 'models',
    'modeled', 'modelled', 'elsewhere', 'never', 'which', 'their', 'being', 'genuine',
    'genuinely', 'directly', 'already', 'really', 'actually', 'simply', 'exactly', 'entirely',
    'itself', 'through', 'within', 'without', 'around', 'across', 'under', 'above', 'below',
    'tumor', 'tumour', 'tumors', 'tumours', 'cancer', 'cancers', 'organ', 'organs', 'still',
    'again', 'while', 'since', 'because', 'these', 'those', 'where', 'there', 'before', 'after',
))
WORD = re.compile(r"[a-zA-Z]{5,}")

def significant_words(text):
    """The clause's own distinctive vocabulary — lowercased words of 5+ letters, minus the
    stopword list above. A SET, not a sequence: order doesn't matter for an overlap count."""
    return {w for w in WORD.findall(text.lower()) if w not in STOPWORDS}

def corpus_texts(paths):
    """-> [(loc, text)] for every scannable unit in the corpus: one entry per READ_FIELDS string
    (keyed by its own (path, lineno)) and one per comment block (keyed by the block's first
    line). This is the population phrase_overlap_candidate searches for a match IN — it is
    deliberately not restricted to already-flagged universal claims, because the counterexample
    that falsifies one is usually ordinary descriptive prose, not another universal claim."""
    out = []
    for p in paths:
        src = open(p, encoding='utf-8').read()
        for i, line in enumerate(src.splitlines(), 1):
            if line.lstrip().startswith('//'):
                continue
            for _, val in FIELD.findall(line):
                out.append(((p, i), val))
        for start, block in comment_blocks(src):
            out.append(((p, start), block))
    return out

def phrase_overlap_candidate(clause, self_loc, texts, threshold=3):
    """The best OTHER location sharing >=threshold significant words with `clause`, or None.
    Returns (loc, shared_words) so the report can show a human exactly what matched, rather than
    asserting a verdict — this proposes a place to look, the same discipline pointer_check's own
    'nearest candidate' proposal already holds to (it names a candidate, it never applies one)."""
    target = significant_words(clause)
    if len(target) < threshold:
        return None
    best = None
    for loc, text in texts:
        if loc == self_loc:
            continue
        shared = target & significant_words(text)
        if len(shared) >= threshold and (best is None or len(shared) > len(best[1])):
            best = (loc, shared)
    return best

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
    # condition (7) for the new "the first" quantifier and the phrase-overlap cross-check:
    # prove each fires on a real positive and stays silent on a real negative, on the SAME
    # shape as the live incident (three near-duplicate comments, one already fixed).
    first_positive = ('this is the atlas\'s first tumor-cell spindle architecture', None, 'ZZ',
                       'UNIVERSAL-UNRESOLVED')
    got, why = classify_universal(*first_positive[:3], UNIVERSAL_INDEX)
    good = got == first_positive[3]
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} 'the first' + corpus-ref now flags (was NONE before "
          f"this ruling): {got}")
    first_negative = ('the first branch of the external carotid artery descends here', None,
                       'ZZ', 'NONE')
    got, why = classify_universal(*first_negative[:3], UNIVERSAL_INDEX)
    good = got == first_negative[3]
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} 'the first' with no corpus-ref stays silent (the "
          f"already-measured ordinal exclusion is not reopened): {got}")
    # THE TWO MEASURED FALSE POSITIVES THIS FIX CLOSES (lungs.js:390, skin.js:401, abridged) —
    # pinned so the fix cannot silently regress. Both are real "the literature was first to
    # describe X" claims sharing a SENTENCE with an unrelated "this atlas" mention via em-dash,
    # never a fine clause — QUANTIFIER_FALLBACK excluding 'first' is what turns this correctly
    # silent, and the live run before this fix landed produced exactly this shape as a
    # DEFECT-FALSE-UNIVERSAL on skin.js's own TERT note (the gene symbol happened to be
    # mentioned elsewhere in the same field, escalating a should-be-NONE into a false defect).
    lit_first_fp = ('The same double-hit this atlas already models for X — but here at higher '
                     'frequency, in the disease this mechanism was first characterized in.',
                     None, 'ZZ', 'NONE')
    got, why = classify_universal(*lit_first_fp[:3], UNIVERSAL_INDEX)
    good = got == lit_first_fp[3]
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} literature-first (not atlas-first) sharing a "
          f"sentence with an unrelated atlas mention now correctly stays silent: {got}")
    # THE CLOSING-QUOTE SENTENCE-BOUNDARY FIX (2026-09-13, ovary.js:444 live incident, abridged
    # to its essential shape) — pinned so clauses()'s new alternation cannot silently regress.
    # 'here."  This' has NO comma/colon/semicolon/em-dash anywhere near the boundary, so if
    # clauses() failed to split it, "first" and "this atlas" would land in ONE fine clause (no
    # separator to sever them) and match directly — not merely via the fallback the lit_first_fp
    # fixture above guards. A correct split leaves 'first' in a sentence with no corpus reference
    # and 'this atlas' in a sentence with no quantifier at all, so neither half can match alone.
    quote_boundary_fp = ('Confirmed directly: "the first tumor of its kind here." This atlas '
                         'separately documents Y elsewhere in its own way.', None, 'ZZ', 'NONE')
    got, why = classify_universal(*quote_boundary_fp[:3], UNIVERSAL_INDEX)
    good = got == quote_boundary_fp[3]
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a quantifier before a closing-quote sentence boundary "
          f"no longer merges with a corpus reference in the sentence after it: {got}")
    texts = [
        (('a.js', 10), "this is the atlas's first tumor-cell spindle architecture, confirmed"),
        (('b.js', 20), "the atlas's first tumor-cell spindle/fascicular architecture, confirmed"),
        (('c.js', 30), "an entirely unrelated sentence about calcitonin and amyloid deposits"),
    ]
    hit = phrase_overlap_candidate(texts[0][1], texts[0][0], texts)
    ok &= hit is not None and hit[0] == ('b.js', 20)
    print(f"  {'ok  ' if hit and hit[0] == ('b.js', 20) else 'FAIL'} phrase overlap FINDS the "
          f"near-duplicate comment (the real 3-copy incident, abridged to 2): {hit}")
    miss = phrase_overlap_candidate(texts[2][1], texts[2][0], texts)
    ok &= miss is None
    print(f"  {'ok  ' if miss is None else 'FAIL'} and STAYS SILENT on unrelated prose "
          f"sharing no distinctive vocabulary: {miss}")
    # the honest negative this mechanism does NOT claim to solve: a real counterexample using
    # different vocabulary entirely (the actual GBM-pseudopalisading case) shares only one word
    # ("elongated") with the claim it falsifies — below threshold, correctly returns None, and
    # this is recorded as the mechanism's own documented limit, not a bug to chase.
    gbm_case = phrase_overlap_candidate(
        "none represents an elongated tumor-cell population arranged in organized fascicles",
        ('x.js', 1),
        [(('y.js', 2), "pseudopalisading rim: elongated nuclei stacked 2-3 deep, oriented across the border")])
    ok &= gbm_case is None
    print(f"  {'ok  ' if gbm_case is None else 'FAIL'} honest limit: a same-domain but "
          f"differently-worded counterexample (the real GBM case) is NOT found by keyword "
          f"overlap — this mechanism finds restated duplicates, not domain reasoning: {gbm_case}")
    print('SELFTEST', 'PASS — fires on the existence form, passes the search/scoped forms, '
          'honours all three exemptions, is not laundered by a short quotation, resolves a '
          'corpus universal against a synthetic index in all three directions, flags a '
          'world-scoped exclusivity claim without letting tier one double-count it, flags '
          "'the first' only when corpus-scoped, and finds a near-duplicate comment while "
          'honestly missing a differently-worded one'
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
    # Comment scan runs over paths PLUS histology.js — a claim about "every existing generator"
    # is a claim about histology.js's own contents, which the field-only scan (js/organs/*.js's
    # REGIONS/TRUNK/PRIVATE_POOL string literals) could never reach even in principle.
    comment_paths = paths + ([HISTOLOGY_PATH] if os.path.exists(HISTOLOGY_PATH) else [])
    texts = corpus_texts(comment_paths)
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
    # COMMENT SCAN (2026-09-13 widening): the same universal/world detection, applied to
    # contiguous `//` blocks rather than quoted field strings, over comment_paths (which
    # includes histology.js). No gene-symbol resolution is attempted here — a comment is prose
    # ABOUT the code, not a REGIONS/TRUNK/PRIVATE_POOL record, so `symbol=None` always, and every
    # comment-sourced universal correctly lands in UNRESOLVED rather than being force-resolved
    # against the wrong subject.
    for f in comment_paths:
        for start, block in comment_blocks(open(f, encoding='utf-8').read()):
            uverdict, uwhy = classify_universal(block, None, None, presence)
            if uverdict == 'NONE':
                continue
            counts[uverdict] = counts.get(uverdict, 0) + 1
            span = universal_clause(block) or world_clause(block) or ''
            if uverdict == 'UNIVERSAL-UNRESOLVED':
                unresolved.append((f, start, 'comment', span, uwhy))
            elif uverdict == 'UNIVERSAL-WORLD-SCOPED':
                world.append((f, start, 'comment', span, uwhy))
            # DEFECT-FALSE-UNIVERSAL cannot fire here (symbol is always None), by construction.
    for f, i, fld, cl, why in defects:
        print(f'  UNSCOPED ABSENCE CLAIM: {f}:{i} [{fld}] — {why}')
        print(f'      {cl[:220]}')
    for f, i, fld, cl, why in universals:
        print(f'  FALSE CORPUS UNIVERSAL: {f}:{i} [{fld}] — {why}')
        print(f'      {cl[:220]}')
    # Printed, not failed, under the declared two-tier boundary above. Each now also carries a
    # phrase-overlap candidate when one exists — "grep for the property being claimed unique"
    # (user, 2026-09-13), a proposal for where to look next, never an auto-verdict.
    for f, i, fld, cl, why in unresolved:
        cand = phrase_overlap_candidate(cl, (f, i), texts)
        hint = f' — possible restatement at {cand[0][0]}:{cand[0][1]} (shares {sorted(cand[1])})' if cand else ''
        print(f'  universal needs a read: {f}:{i} [{fld}] — {why}{hint}')
        print(f'      {cl[:160]}')
    # Same tier, wider population: exclusivity over the body rather than over the corpus. Separate
    # label because the READ is different — this one is answered from a textbook, not from the atlas.
    for f, i, fld, cl, why in world:
        cand = phrase_overlap_candidate(cl, (f, i), texts)
        hint = f' — possible restatement at {cand[0][0]}:{cand[0][1]} (shares {sorted(cand[1])})' if cand else ''
        print(f'  world-scoped universal needs a read: {f}:{i} [{fld}] — {why}{hint}')
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
