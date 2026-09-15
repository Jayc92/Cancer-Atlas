# Identifier↔metadata cross-check (2026-09-04). The Rachakonda find, generalised: for every
# identifier-carrying record, check the RECORDED journal / first author / year against what
# the identifier itself resolves to (PubMed esummary, bulk). One API pass, no papers read.
# Two jobs at once:
#   - ATTRIBUTION-ERROR DETECTION: a source line whose recorded journal disagrees with its
#     own identifier's journal is the taxonomy's fixable defect class (bladder.js:174 says
#     "PLoS ONE"; PMC3808633 resolves to PNAS).
#   - BACKFILL VALIDATION BY CONSTRUCTION: a backfilled identifier whose metadata disagrees
#     with its source line is a wrong backfill. Run retrospectively, this check would have
#     flagged Zhu, Arends, Wilentz and Oweira automatically — four finds that cost 29
#     hand-read titles now cost one API pass, on every future backfill too.
#
# CONTRACT: this tool FLAGS, it never rules. Every flag gets a human mention-level read
# (abbreviation quirks, epub-vs-print years, corrigendum merges, and record-key artifacts
# like the 'Neuro-Oncology'/'PNAS' fragment keys are expected flag classes) — same
# flag-then-human-read shape as the polarity guard.
#
# STANDING CONDITION (7), BOTH DIRECTIONS: --selftest proves the checker can FIRE (journal /
# author / year mismatch fixtures) and can PASS (an agreeing fixture) on canned esummary-
# shaped data before any live scan is trusted; the live run additionally asserts its known
# positives fire (the fragment record keys guarantee author-mismatch flags exist), so an
# all-clean live scan is impossible unless the tool is broken — and then it says so.
#
# IT REFUSES WITHOUT ITS INPUT, and that is a 2026-09-05 correction to a worse bug than the one
# citation_polarity.py died of (user ruling, recorded in CLAUDE.md):
#
#     QUOTES CLAUDE.md
#     > A dead instrument announces itself. A degraded one produces a plausible number.
#
# The v2 records artifact used to be OPTIONAL — `if len(sys.argv) > 1
# else []` — so invoking this tool with no argument silently dropped the entire entry-time-
# identifier population and checked 110 records instead of 142, under a DONE line whose shape was
# indistinguishable from a full scan. Polarity died loudly (KeyError, no DONE line, wrapper exit
# non-zero, caught the same day). This one would have kept reporting "110 records checked, 3
# flags" forever. So the artifact is now REQUIRED and its absence is a refusal, not a default:
# 32 unexamined records is a finding, and a finding must never be spelled as a smaller total.
# battery.py regenerates the artifact before invoking this tool, so the refusal never fires in
# normal use — it fires exactly when someone runs the scan by hand without one.
#
# THE SAME BUG, ONE LEVEL IN (2026-09-06). The refusal above closed the case where the artifact is
# ABSENT. It did not close the case where an id-mapping FETCH FAILS: `except Exception: pmid = None`
# put a transient network failure and a genuinely unmappable id into one `unexamined` bucket, so a
# blip subtracted a record from `len(uniq)` and the DONE line reported the smaller total as normal.
# RECORDED INSTANCE, not a reproducible demonstration: on 2026-09-06 a battery run printed "141
# records checked" against the committed 142, `0 problems`, green. Three standalone re-runs on the
# same artifact gave 142, which is how the transient cause was identified — a network failure cannot
# be summoned on demand, so this comment is the evidence, and it is better evidence than a fixture
# because the shrink actually happened. battery.py's own header had named this metric as still
# unratcheted and able to shrink under a green DONE line; it did, one day later, unprompted.
#
# THE SPLIT, and it is the whole fix: UNREACHED (a fetch that did not happen) is FATAL, because the
# population is unknown and any total printed would be the exact defect being closed. UNMAPPABLE (a
# fetch that succeeded and found no unique PMID) is a stable property of the record, so it is
# DECLARED AND TOLERATED by exact id, on the deploy gate's honesty-surface shape. A NEW unmappable
# id therefore fails too — correctly: it is an undeclared change in what this scan can reach.
# Without the split, exiting on anything unexamined would make the instrument permanently red on
# the one record that can never be mapped, which is a gate nobody can keep green and everybody
# learns to ignore.
#
# THEN IT FIRED FOR REAL, ON ITS FIRST OPPORTUNITY, ON THE SAME FAILURE IT WAS BUILT FOR — and this
# is the live demonstration, recorded on the user's ruling (2026-09-06) as the best evidence in the
# whole arc:
#
#     "A live DNS failure then hit mid-run and the instrument refused to print a total rather than
#      reporting a smaller one — unprompted, on its first opportunity, a day after it was written
#      for a failure recorded from the past. That's better evidence than the fixture and better than
#      the recording... the one case in this whole arc where a guard was built for a specific past
#      failure and then caught the same failure again in the wild."
#
# WHAT IS CHECKABLE, and it is the interval rather than the output: the split shipped in aafbe04
# (2026-09-05 22:57 -0400, `git log -1 aafbe04`). Its first live exercise was the full battery run
# on the way to d54bd1a (2026-09-06 22:14 -0400) — 23 hours later, and the FIRST run since aafbe04
# in which the network happened to break. Every id-mapping fetch failed with urllib's
# `nodename nor servname provided, or not known`, so every record took the UNREACHED branch below,
# this tool exited non-zero WITHOUT a total, and battery.py reported 1 problem and 9/10 members
# rather than a green line over a smaller number. The transient was then confirmed independently
# (ping, and a curl to the same host returning HTTP 200) and the immediate re-run printed
# "143 records checked, 3 flags, 1 declared-unmappable" with 10/10 and 0 problems — which is the
# same artifact reaching the same total, i.e. the corpus never moved and the earlier run's silence
# was correct.
#
# WHAT IS NOT CHECKABLE, said plainly because the rule above demands it: THE REFUSING RUN'S OUTPUT
# WAS NOT KEPT. The paragraph above it records a shrink from a run that was also not kept, and this
# one was nearly lost the same way. That is not incidental — it is an asymmetry in the chain worth
# naming and NOT worth a fifth layer: commit_checked.sh quotes every DONE line into the commit
# message, so the chain archives its PASSES in git permanently and forgets its REFUSALS entirely,
# because a refusing run never reaches a commit. The best evidence this project has produced about
# its own instruments is the class of evidence it stores least well.
import json, os, re, sys, tempfile, time, unicodedata, urllib.parse, urllib.request
import os as _os_t; sys.path.insert(0, _os_t.path.dirname(_os_t.path.abspath(__file__)))
from tolerated import resolve
# EXPLICIT FORM OVER AMBIENT STATE (2026-09-09): this tool roots ITSELF at the repo it lives in. The battery
# always ran it with cwd=REPO_ROOT, which hid a bare-cwd dependence for the tool's whole life — the sweep of
# 2026-09-09 ran it from /tmp and it produced no DONE line (citations.json is opened repo-relative). Relative paths stay the record identities; their resolution no
# longer belongs to the caller. Proven by the battery, which now runs every member from a bare directory.
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# DECLARED UNMAPPABLE, exhaustively and by exact id — deploy_check.js's BENIGN list, same shape and
# same reason: every entry is a thing this gate has been told not to see, so the list stays short and
# each entry carries WHY. An id here is a COVERAGE LIMIT of this instrument, which is a narrower
# statement than "unchecked", and conflating the two is how a coverage hole starts reading as a pass.
# A DECLARATION NAMES CHECKABLE EVIDENCE, NOT A JUDGEMENT — the rule binding every declaration list
# in this chain, stated in full (with the audit that found this entry passing it) at
# citation_reach_check.DECLARED_UNREACHED. The esearch hit counts below are why: they can be re-run.
DECLARED_UNMAPPABLE = {
    'doi:10.1002/prm2.12107':
        'Gao et al., Precision Medical Sciences (Wiley), 2023 — js/organs/breast.js:168. The journal '
        'is not PubMed-indexed: esearch [doi] returns 0 hits (the unqualified search returns 6 '
        'unrelated tokenised hits, which is why the mapper requires exactly one), and Europe PMC has '
        'no record either, so NO PMID EXISTS for the metadata cross-check to run against. The CLAIM '
        'is not unchecked — ccf batch 1 (2026-09-06) read the paper at the publisher and verified '
        'its figures verbatim. THIS INSTRUMENT cannot reach it. Those are different statements and '
        'keeping them apart is why this list stores a reason rather than just an id.',
}

# DECLARED — the tolerated.py mechanism, applied to check_one()'s own author/year/journal flags for
# the first time (2026-09-15, user ruling on a 67-flag count cleared as "expected/non-blocking" —
# exactly the shape that laundered two label overlaps and three record defects earlier in this
# project's history). Every one of the 67 flags live at ruling time was read against its own source
# line before being sorted here. THREE were real defects, fixed at the source, not declared: a
# one-digit PMID typo (breast.js's Moll 1993 citation pointed at an unrelated 1993 RAGE-receptor
# paper — PMID 8256857 vs the real 8256859, "Differential loss of E-cadherin expression in
# infiltrating ductal and lobular breast carcinomas," confirmed by name, journal AND year once the
# right id was found); a real-vs-similarly-named journal swap (pancreas.js's Abraham et al. 2002 is
# Am J Pathol, not "Am J Surg Pathol" — two real, different journals); and a genuine author
# misattribution (marrow.js's own testicular-ALL citation named "Sandlund et al." for a paper whose
# actual, full five-author byline is Nguyen HTK, Terao MA, Green DM, Pui CH, Inaba H — Sandlund is
# not on it at all, though the PMID, journal, year and every specific figure/quote attached to it
# are all correct, confirmed by an earlier, independent content-verification pass that checked the
# CLAIM against the source but never cross-checked the BYLINE against the id — precisely the gap
# this mechanical check exists to close). The remaining 64 flag INSTANCES (59 distinct
# pmid|author|year keys once true duplicates collapse) sort into six classes, none a content error:
#
#   MULTI-CITATION LIST-ATTRIBUTION ARTIFACT (largest class, ~33 instances) — two or more real
#   citations sit close together in one dense ccf/note/comment field, each correctly paired with its
#   own id IN THE PROSE, and this tool's own record-building (which reads one author/year head per
#   PMID from the surrounding text) grabs a DIFFERENT, nearby-but-wrong head instead of the one the
#   PMID actually sits beside — the exact, previously-documented "pairs a PMID with the FIRST author/
#   year on the line rather than the one it actually sits beside" shape. Every instance below was
#   confirmed by reading the source line directly and finding the PMID correctly attached to its own,
#   different, real citation elsewhere in the same field.
#   JOURNAL-NAME-PARSED-AS-AUTHOR ARTIFACT (~8 instances) — this tool's own author-field extraction
#   grabbed the JOURNAL NAME (e.g. "Radiographics", "Haematologica", "Leukemia", "Pancreatology",
#   "JCEM") rather than the real author, when the real author's name sits elsewhere in the comment's
#   own punctuation structure; the id's own first-author always matches the paper's real, correctly-
#   named author in the prose.
#   TCGA/CONSORTIUM-NAME CONVENTION (~6 instances) — this atlas correctly cites a real, named lead
#   investigator (Linehan, Ley, TCGA-as-shorthand) for a consortium paper; PubMed's own first-author
#   metadata field for that same paper is the consortium name itself ("Cancer Genome Atlas Research
#   Network"). Same paper, same id, a naming-convention difference only.
#   MULTI-AUTHOR HEAD, NON-FIRST NAME (~2 instances) — the source correctly credits two or three real
#   co-authors together ("Cowan, Springer et al.", "Pérez-Galán, Dreyling & Wiestner"); this tool's
#   own extraction picked a non-first name from the list rather than the id's own first author.
#   JOURNAL ABBREVIATION / TRANSLATION (~9 instances) — the same real journal under two different
#   string forms (JAAD = J Am Acad Dermatol; JCEM = J Clin Endocrinol Metab; JNCI = J Natl Cancer
#   Inst; Chin J Exp Hematol = the English translation of the pinyin-transliterated Zhongguo Shi Yan
#   Xue Ye Xue Za Zhi; JCO Precis Oncol already confirmed elsewhere in this project's own history as
#   PubMed's own ISO abbreviation), none reachable by widening check_one()'s single-word-keyed
#   ABBREV dict without risking a false negative on a real journal mismatch that happens to share a
#   first word (JCO Precision Oncology vs Journal of Clinical Oncology are two different real
#   journals) — declared individually rather than risking that.
#   COMPOUND-SURNAME TRUNCATION (~2 instances) — this tool's own author extraction truncated a real
#   hyphenated compound surname ("Godínez-Chaparro", "Jiménez-Segura") to its second component alone;
#   the id's own first-author confirms the full compound name is correct in the prose.
#   EPUB-VS-PRINT PUBDATE (~2 instances) — a one-year difference between the atlas's cited year and
#   PubMed's own indexed pubdate, the ordinary epub-ahead-of-print-vs-print-issue lag.
DECLARED = [
    # --- multi-citation list-attribution artifact ---
    {'key': '9010109|Akbulut|2024', 'reason': 'bladder.js:355-356: PMID 9010109 is the unnamed "cytology cohort, Cancer, 1997" citation immediately after Akbulut et al. in the same sentence, not Akbulut\'s own (38523484); the file\'s own citation field at :360 already writes both correctly.', 'until': None},
    {'key': '40469347|Abu Jarir|2025', 'reason': 'brain.js:309-310: PMID 40469347 is Ninomiya et al., Surgical Neurology International, 2025, the second of two case-report citations in one sentence; Abu Jarir\'s own PMID is 40034891.', 'until': None},
    {'key': '22072542|TCGA|2015', 'reason': 'brain.js:383-385: PMID 22072542 is Yip et al., J Pathol, 2012, one of two corroborating citations after the quoted TCGA 2015 finding in the same sentence.', 'until': None},
    {'key': '37291277|TCGA|2015', 'reason': 'brain.js:383-385: PMID 37291277 is Darabi et al., Med Oncol, 2023, the second corroborating citation in the same dense sentence as the TCGA 2015 quote.', 'until': None},
    {'key': '37291277|Yip|2012', 'reason': 'brain.js:385: same PMID as the TCGA-2015 mispairing above, same underlying cause — 37291277 is Darabi et al. 2023, correctly written immediately after Yip 2012 (PMID 22072542) in the same sentence.', 'until': None},
    {'key': '36332363|TCGA|2012', 'reason': 'breast.js:326-330: PMID 36332363 is Davis et al., EBioMedicine, 2022, the third of four citations in one dense sentence spanning 2012-2025; the atlas\'s own TCGA-2012 PMID is 23000897.', 'until': None},
    {'key': '40810627|TCGA|2012', 'reason': 'breast.js:326-330: PMID 40810627 is Davis et al., Clin Cancer Res, 2025, the fourth citation in the same dense sentence.', 'until': None},
    {'key': '36332363|Desmedt|2016', 'reason': 'breast.js:328: same PMID as the TCGA-2012 mispairing above (Davis et al., EBioMedicine, 2022) — Desmedt et al., 2016 is mentioned earlier in the same sentence with no PMID of its own given in this clause.', 'until': None},
    {'key': '40810627|Desmedt|2016', 'reason': 'breast.js:328: same cause — PMID 40810627 is Davis et al., Clin Cancer Res, 2025, mispaired with the earlier-mentioned Desmedt 2016.', 'until': None},
    {'key': '23143595|Schmitz|2012', 'reason': 'lymphnodes.js:262: PMID 23143595 is Richter et al., Nat Genet, 2012, the second of three ID3-frequency citations in one sentence; Schmitz et al., Nature, 2012 is mentioned first with no PMID given in this clause.', 'until': None},
    {'key': '23143597|Schmitz|2012', 'reason': 'lymphnodes.js:262: same sentence, same cause — PMID 23143597 is Love et al., Nat Genet, 2012, the third citation, mispaired with the first-mentioned Schmitz.', 'until': None},
    {'key': '33686198|Leukemia|2021', 'reason': 'lymphnodes.js:293 and :310 (same key, two locations): PMID 33686198 correctly belongs to Weniger & Küppers, Leukemia, 2021, per the file\'s own citation field at :329; this tool\'s own record-building read the journal name "Leukemia" as the author where no author name sat immediately adjacent in that specific clause.', 'until': None},
    {'key': '30087457|de Kanter|2024', 'reason': 'lymphnodes.js:298-300: PMID 30087457 is Juskevicius et al., Lab Invest, 2018, the third of three citations converging on one figure; de Kanter et al., HemaSphere, 2024 has its own, different PMID (39233904) two clauses earlier in the same sentence.', 'until': None},
    {'key': '23023715|Kanzler|1996', 'reason': 'lymphnodes.js:301-302: PMID 23023715 is Küppers, Engert & Hansmann, J Clin Invest, 2012, mispaired with Kanzler et al., 1996 (PMID 8879220, its own real, different id, mentioned immediately before it in the same sentence).', 'until': None},
    {'key': '23023715|Engert|2012', 'reason': 'lymphnodes.js:302 and :329 (same key, two locations): the id\'s own first author is Küppers R, not Engert (the middle name of a three-author "Küppers, Engert & Hansmann" byline this tool\'s own extraction picked instead) — the file\'s own citation field at :329 already writes the full, correct byline.', 'until': None},
    {'key': '32064593|de Leval|2007', 'reason': 'lymphnodes.js:342-344: PMID 32064593 is Timmins et al., Br J Haematol, 2020, independently corroborating de Leval et al., Blood, 2007 (its own PMID, 17284527, given immediately before in the same sentence).', 'until': None},
    {'key': '24345752|Lemonnier|2012', 'reason': 'lymphnodes.js:355: PMID 24345752 is Odejide et al., Blood, 2014, the second of two cohort citations; Lemonnier et al., Blood, 2012 has its own, different PMID (22760778) given first in the same clause.', 'until': None},
    {'key': '23634996|Ley|2013', 'reason': 'marrow.js:171 and :185 (same key, two locations): the id is TCGA\'s own AML paper, whose real first author is the "Cancer Genome Atlas Research Network" consortium name — Ley DC is the paper\'s actual named lead author, the same naming-convention difference as the Linehan/TCGA class below.', 'until': None},
    {'key': '23299311|Agarwal|2019', 'reason': 'marrow.js:345: PMID 23299311 is Zhang et al., Blood, 2013, the second of two niche-mechanism citations in one sentence; Agarwal et al., Cell Stem Cell, 2019 has its own, different PMID (30905620) given immediately before it.', 'until': None},
    {'key': '21995386|Malcovati|2011', 'reason': 'marrow.js:377: PMID 21995386 is Papaemmanuil et al., NEJM, 2011, the second of two SF3B1-frequency citations; Malcovati et al., Blood, 2011 has its own, different PMID (21998214) given first in the same clause.', 'until': None},
    {'key': '16155016|Fonseca|2009', 'reason': 'marrow.js:447: PMID 16155016 is Bergsagel & Kuehl, J Clin Oncol, 2005, the second of three hyperdiploidy-frequency citations; Fonseca et al., 2009 is mentioned first with no PMID given in this specific clause.', 'until': None},
    {'key': '27002115|Fonseca|2009', 'reason': 'marrow.js:447: same sentence, same cause — PMID 27002115 is Sonneveld et al., IMWG, Blood, 2016, the third citation, mispaired with the first-mentioned Fonseca.', 'until': None},
    {'key': '40489728|Bergsagel|2005', 'reason': 'marrow.js:455: PMID 40489728 is Avet-Loiseau et al.\'s 2025 IMWG consensus paper, the third citation in a sentence spanning 2005-2025; Bergsagel & Kuehl, 2005 is mentioned first with no PMID given in this clause.', 'until': None},
    {'key': '23032723|Boyd|2012', 'reason': 'marrow.js:460: PMID 23032723 is Avet-Loiseau et al., Leukemia, 2013, the second of two del(17p)-frequency citations; Boyd et al., Leukemia, 2012 has its own, different PMID (21836613) given first in the same clause.', 'until': None},
    {'key': '35560063|Rajkumar|2014', 'reason': 'marrow.js:465: PMID 35560063 correctly belongs to Rajkumar\'s own 2022 Am J Hematol paper, which the sentence explicitly says "reproduces" the 2014 IMWG Lancet Oncol criteria (no PMID given for the 2014 paper in this clause) — the year mismatch is the same nearby-citation artifact, not a wrong id.', 'until': None},
    {'key': '28665419|Iacobucci|2017', 'reason': 'marrow.js:81 and :485 (same key): PMID 28665419 is Terwilliger & Abdul-Hay, Blood Cancer J, 2017, corroborating Iacobucci & Mullighan, J Clin Oncol, 2017 (its own, different PMID, 28297628, given first in the same clause) — the same Iacobucci/Terwilliger pairing already documented as an extractor artifact elsewhere in this project\'s history.', 'until': None},
    {'key': '42512378|Calimano-Ramirez|2022', 'reason': 'pancreas.js:403: PMID 42512378 is Farhoud et al., Cancers, 2026, the second of two lung-metastasis citations; Calimano-Ramirez et al., 2022 has its own, different PMID (36353206) given first.', 'until': None},
    {'key': '25058881|Bergmann|2014', 'reason': 'pancreas.js:422: PMID 25058881 is Liu et al., Pancreas, 2014, the second of three MSI-frequency citations; Bergmann et al., 2014 is mentioned first with no PMID given in this clause.', 'until': None},
    {'key': '26137463|Farhoud|2026', 'reason': 'pancreas.js:429-430: PMID 26137463 is La Rosa et al., Front Med, 2015, mispaired with Farhoud et al., 2026 (whose own, different PMID, 42512378, sits immediately before it in the same comment) — the file\'s own citation field at :449 already writes both correctly.', 'until': None},
    {'key': '33847621|Yao|2021', 'reason': 'prostate.js:300-301: PMID 33847621 is Zhu et al., 2021, the second of three SEER-cohort citations; Yao et al., 2021 has its own, different PMID (34956090) given first in the same sentence.', 'until': None},
    {'key': '28506524|Yao|2021', 'reason': 'prostate.js:300-301: same sentence, same cause — PMID 28506524 is Zaffuto et al., 2017, the third citation, mispaired with the first-mentioned Yao.', 'until': None},
    {'key': '29985747|Beltran|2016', 'reason': 'prostate.js:323: PMID 29985747 is Aggarwal et al., J Clin Oncol, 2018, corroborating Beltran et al., 2016 (mentioned first with no PMID given in this clause) — the same Beltran/Aggarwal/Conteduca/Rauf class already documented elsewhere in this project\'s history.', 'until': None},
    {'key': '32582431|Conteduca|2019', 'reason': 'prostate.js:323: same sentence, same documented class — PMID 32582431 is Rauf et al., 2020, a case report independently noting low-PSA presentation, mispaired with the earlier-mentioned Conteduca 2019 (whose own, different PMID, 31525487, is given first).', 'until': None},
    {'key': '27590416|Choi|2020', 'reason': 'stomach.js:54: PMID 27590416 is Pyo et al., J Gastroenterol, 2017, corroborating Choi et al., J Gastroenterol Hepatol, 2020 (its own, different PMID, 31445508, given first in the same clause).', 'until': None},
    # --- journal-name-parsed-as-author artifact ---
    {'key': '34388049|Radiographics|2021', 'reason': 'kidneys.js:362: the id\'s own first author is Marko J, matching the file\'s own "Marko et al." text; this tool\'s own extraction read the journal name "Radiographics" as the author where the byline and journal sat close together in the comment.', 'until': None},
    {'key': '32855278|Haematologica|2021', 'reason': 'lymphnodes.js:151-152: the id\'s own first author is Vogelsberg A, matching this file\'s own "Vogelsberg et al." text elsewhere (e.g. :405); same journal-as-author extraction artifact as the kidneys.js Radiographics entry.', 'until': None},
    {'key': '23813646|Haematologica|2013', 'reason': 'lymphnodes.js:437-465: the id\'s own first author is van den Brand M, matching the file\'s own "van den Brand & van Krieken" byline and its citation field at :465; same journal-as-author extraction artifact.', 'until': None},
    {'key': '35701318|Pancreatology|2022', 'reason': 'pancreas.js:506: the id\'s own first author is Capretti G, matching the file\'s own "Capretti et al." text; same journal-as-author extraction artifact.', 'until': None},
    {'key': '22865907|JCEM|2012', 'reason': 'thyroid.js:344-354: the id\'s own first author is Boichard A, matching the file\'s own "Boichard et al." text; same journal-as-author extraction artifact.', 'until': None},
    {'key': '21325462|JCEM|2011', 'reason': 'thyroid.js:345-354: the id\'s own first author is Moura MM, matching the file\'s own "Moura et al." text; same journal-as-author extraction artifact.', 'until': None},
    # --- TCGA/consortium-name convention ---
    {'key': '26536169|Linehan|2016', 'reason': 'kidneys.js:248: the id is TCGA\'s own papillary RCC paper (explicitly named as such in the same comment); PubMed\'s own first-author field for TCGA consortium papers is the consortium name itself, while the atlas correctly names the paper\'s real, named lead investigator.', 'until': None},
    {'key': '22960745|TCGA|2012', 'reason': 'lungs.js:302-358: TCGA\'s own squamous-cell-lung-carcinoma paper; same consortium-name-vs-named-investigator convention as the kidneys.js Linehan entry.', 'until': None},
    {'key': '23000897|TCGA|2012', 'reason': 'breast.js:326: TCGA\'s own 2012 breast-cancer paper, correctly the FIRST of four citations in this dense sentence (unlike its two neighbouring PMIDs above, this one genuinely is the record it claims to be) — same consortium-name convention.', 'until': None},
    {'key': '25079317|TCGA|2014', 'reason': 'stomach.js:315: TCGA\'s own 2014 gastric-cancer paper; same consortium-name convention.', 'until': None},
    # --- multi-author head, non-first name ---
    {'key': '26965579|Springer|2016', 'reason': 'bladder.js:391: the source correctly credits two real co-authors together, "Cowan, Springer et al." — this tool\'s own extraction picked the second name; the id\'s own first author, Cowan M, confirms the same paper.', 'until': None},
    {'key': '20940415|Dreyling|2011', 'reason': 'lymphnodes.js:219: the source correctly credits three real co-authors, "Pérez-Galán, Dreyling & Wiestner" — this tool\'s own extraction picked the middle name; the id\'s own first author, Perez-Galan P, confirms the same paper.', 'until': None},
    # --- journal abbreviation / translation ---
    {'key': '39151108|Cigliola|2024', 'reason': 'bladder.js:461: "JCO Precis Oncol" is PubMed\'s own standard ISO abbreviation for the journal its esummary record prints unabbreviated as "JCO precision oncology" — a real, distinct journal from "Journal of Clinical Oncology," which is why check_one()\'s existing single-word-keyed ABBREV entry for "jco" does not (and should not) cover it.', 'until': None},
    {'key': '26668184|Sahm|2016', 'reason': 'brain.js:498: "JNCI" is the standard abbreviation for "J Natl Cancer Inst" / "Journal of the National Cancer Institute" — one journal, three string forms.', 'until': None},
    {'key': '42544655|Kou|2026', 'reason': 'lymphnodes.js:389-390: "Chin J Exp Hematol" is the atlas\'s own English translation of the same journal PubMed indexes by its pinyin-transliterated title, "Zhongguo Shi Yan Xue Ye Xue Za Zhi" — literally "Chinese Journal of Experimental Hematology."', 'until': None},
    {'key': '26980727|Swerdlow|2016', 'reason': 'lymphnodes.js:231: "(WHO)" is a real parenthetical aside naming the classification body, not a second reference — already read and CONFIRMED KEPT by citation_paren_ledger.py\'s own PREREGISTERED entry for this exact span, the Travis/De Leo/Park aside shape.', 'until': None},
    {'key': '6736323|von Domarus|1984', 'reason': 'skin.js:403-404: "JAAD" is the standard abbreviation for "J Am Acad Dermatol" / "Journal of the American Academy of Dermatology."', 'until': None},
    {'key': '23375456|Karia|2013', 'reason': 'skin.js:455 and :480 (same key, two locations): same "JAAD" abbreviation as the von Domarus entry above.', 'until': None},
    {'key': '18073307|Elisei|2008', 'reason': 'thyroid.js:323: "JCEM" is the standard abbreviation for "J Clin Endocrinol Metab" / "The Journal of Clinical Endocrinology and Metabolism."', 'until': None},
    {'key': '31123724|Schweizer|2019', 'reason': 'prostate.js:387: the same "JCO Precis Oncol" / "JCO precision oncology" abbreviation already documented elsewhere in this project\'s own history as benign — PubMed\'s own ISO abbreviation for the journal its metadata prints unabbreviated.', 'until': None},
    # --- compound-surname truncation ---
    {'key': '34571521|Chaparro|2021', 'reason': 'marrow.js:176: the source correctly writes the full compound surname "Godínez-Chaparro" (matching the id\'s own first author, Godinez-Chaparro JA); this tool\'s own extraction truncated it to the second component.', 'until': None},
    {'key': '36114167|Segura|2022', 'reason': 'marrow.js:451: the source correctly writes the full compound surname "Jiménez-Segura" (matching the id\'s own first author, Jimenez-Segura R); same truncation artifact as the marrow.js Chaparro entry.', 'until': None},
    # --- epub-vs-print pubdate ---
    {'key': '22088332|Ehdaie|2011', 'reason': 'bladder.js:374: a one-year epub-ahead-of-print-vs-indexed-pubdate lag (recorded 2011, id-pubdate 2012) — author and journal both match cleanly.', 'until': None},
    {'key': '28064239|Krysiak|2016', 'reason': 'lymphnodes.js:159: same epub-vs-print lag as the bladder.js Ehdaie entry (recorded 2016, id-pubdate 2017) — author and journal both match cleanly.', 'until': None},
    # --- multi-field mismatch from the SAME dense sentence as the Elisei/JCEM entry above ---
    {'key': '37204852|Elisei|2008', 'reason': 'thyroid.js:323 and :333 (same key, two locations): PMID 37204852 is Gild et al., Endocr Rev, 2023, corroborating Elisei et al., JCEM, 2008 (its own, different PMID, 18073307, given first in the same clause) — the same list-attribution artifact class as the marrow.js/breast.js/lymphnodes.js entries above, recurring in a citation that ALSO happens to carry the separate JCEM-abbreviation issue for its own correctly-paired PMID.', 'until': None},
]

def deaccent(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s or '')
                   if not unicodedata.combining(c))

ABBREV = {'nejm': 'new england', 'jco': 'journal of clinical oncology',
          'pnas': 'national academy of sciences', 'jama': 'jama',
          'apmis': 'acta pathologica'}

def check_one(rec_author, rec_year, rec_journal, es):
    """Compare recorded fields against one esummary dict. Returns list of flag strings."""
    flags = []
    auths = es.get('authors') or []
    first = deaccent(auths[0]['name']) if auths else ''
    rec_author = deaccent(rec_author)
    fam = ' '.join(first.split()[:-1]) if len(first.split()) > 1 else first
    ra = (rec_author or '').lower()
    if ra and fam:
        toks = set(re.findall(r"[a-z'’-]+", fam.lower())) | {fam.lower()}
        if ra not in toks and not any(t in ra.split() for t in toks) \
           and ra.replace(' ', '') != fam.lower().replace(' ', ''):
            flags.append(f'author: recorded {rec_author!r} vs id-first-author {first!r}')
    yr = (es.get('pubdate', '') or '')[:4]
    if rec_year and yr and rec_year != yr:
        flags.append(f'year: recorded {rec_year} vs id-pubdate {yr}')
    if rec_journal:
        jfull = ((es.get('fulljournalname', '') or '') + ' ' + (es.get('source', '') or '')).lower()
        words = rec_journal.lower().split()[:3]
        exp = ABBREV.get(words[0])
        ok = (exp in jfull) if exp else all(w in jfull for w in words)
        if not ok:
            flags.append(f'journal: recorded {rec_journal!r} vs id-journal '
                         f'{es.get("source", "")!r} ({es.get("fulljournalname", "")[:40]!r})')
    return flags

def classify_unmapped(entries, declared=None):
    """Pure, so condition (7) can prove every direction without a network.

    entries: (raw_id, ref, failure) — failure is a string when the FETCH itself failed, None when
    the fetch succeeded and simply found no unique PMID. Returns (tolerated, problems)."""
    declared = DECLARED_UNMAPPABLE if declared is None else declared
    tolerated, problems = [], []
    for raw, ref, failure in entries:
        if failure:
            problems.append(
                f'UNREACHED: {raw} ({ref}) — the id-mapping fetch FAILED [{failure}], so this '
                'record was never examined and the population is unknown. This is NOT an unmappable '
                'id: refusing to print a total, because a smaller total is exactly the defect.')
        elif raw in declared:
            tolerated.append((raw, ref, declared[raw]))
        else:
            problems.append(
                f'UNMAPPABLE, UNDECLARED: {raw} ({ref}) — the fetch succeeded and found no unique '
                'PMID. That may be permanent and fine, but it is an undeclared change in what this '
                'scan can reach. Verify it is genuinely unmappable, then add it to '
                'DECLARED_UNMAPPABLE with the reason, so the list stays the honesty surface.')
    return tolerated, problems


FIXTURES = [
    # (recorded author, year, journal, esummary-shaped dict, must_flag_substring or None)
    ('Rachakonda', '2013', 'PLoS ONE',
     {'authors': [{'name': 'Rachakonda PS'}], 'pubdate': '2013 Oct',
      'fulljournalname': 'Proceedings of the National Academy of Sciences of the United '
      'States of America', 'source': 'Proc Natl Acad Sci U S A'}, 'journal:'),
    ('Zhu', '2003', None,
     {'authors': [{'name': 'Sung JM'}], 'pubdate': '2003',
      'fulljournalname': 'Theoretical and applied genetics', 'source': 'Theor Appl Genet'},
     'author:'),
    ('Arends', '2026', 'Histopathology',
     {'authors': [{'name': 'Arends DW'}], 'pubdate': '2025 Dec',
      'fulljournalname': 'The ISME journal', 'source': 'ISME J'}, 'year:'),
    ('Cooper', '2015', 'Nature Genetics',
     {'authors': [{'name': 'Cooper CS'}], 'pubdate': '2015 Apr',
      'fulljournalname': 'Nature genetics', 'source': 'Nat Genet'}, None),
    ('Wiegand', '2010', 'NEJM',
     {'authors': [{'name': 'Wiegand KC'}], 'pubdate': '2010 Oct',
      'fulljournalname': 'The New England journal of medicine', 'source': 'N Engl J Med'},
     None),   # abbreviation map must prevent a false journal flag
]

# A FIXTURE MAY REUSE A REAL POINTER; IT MUST NEVER INVENT ONE. pointer_check.py asserts that every
# hand-typed <file>:<line> in this repo names a real place, so an invented one is a false claim that
# cannot be told apart from a live pointer — and it fired here, on three of these. Reusing a real
# pointer is harmless (a fixture makes the same true claim the live pointer does); inventing one is
# the defect. So the refs below are COMPOSED, and no literal pointer appears in this file's fixtures.
# internal_quote_check.py holds its marker token in a name for exactly this reason.
FIXTURE_REF_A = '%s:%d' % ('a.js', 1)
FIXTURE_REF_B = '%s:%d' % ('b.js', 2)
FIXTURE_REF_C = '%s:%d' % ('c.js', 3)

def selftest():
    ok = True
    for a, y, j, es, want in FIXTURES:
        flags = check_one(a, y, j, es)
        good = (any(want in f for f in flags)) if want else (not flags)
        ok &= good
        label = f'fires[{want.rstrip(":")}]' if want else 'passes'
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {a} {y} -> {flags or 'clean'}")
    # THE REFUSAL IS ITSELF A CAPABILITY THAT HAS TO BE DEMONSTRATED (commit_checked.sh's rule:
    # a tool whose job is refusing has to be shown refusing). Both directions, because a refusal
    # that fires on a legitimate invocation is as bad as one that never fires: it would make the
    # battery unable to run this instrument at all, and an instrument that can't be invoked is
    # the exact hole battery.py was built to close.
    try:
        records_path(['citation_crosscheck.py'], quiet=True)
        refused = False
    except SystemExit as e:
        refused = e.code == 2
    ok &= refused
    print(f"  {'ok  ' if refused else 'FAIL'} refuses with no records artifact "
          f"(exit 2, no DONE line) rather than scanning a smaller population")
    accepted = records_path(['citation_crosscheck.py', '--selftest', 'recs.json']) == 'recs.json'
    ok &= accepted
    print(f"  {'ok  ' if accepted else 'FAIL'} accepts the artifact alongside flag-shaped args")
    # THE 2026-09-06 SPLIT, all four directions. The load-bearing arm is the first: a fetch failure
    # must be fatal, because that is the shrink that actually happened and printed a green line.
    fake = {'doi:declared': 'declared for the selftest'}
    _t, probs = classify_unmapped([('PMC123', FIXTURE_REF_A, 'URLError: timed out')], fake)
    good = any('UNREACHED' in p for p in probs)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a FAILED fetch is fatal (the 142->141 shrink), not "
          f"filed as an unmappable id")
    _t, probs = classify_unmapped([('doi:brand-new', FIXTURE_REF_B, None)], fake)
    good = any('UNDECLARED' in p for p in probs)
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a NEW unmappable id fails (undeclared change in reach)")
    tol, probs = classify_unmapped([('doi:declared', FIXTURE_REF_C, None)], fake)
    good = not probs and len(tol) == 1
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a DECLARED unmappable id is tolerated, so the gate is "
          f"not permanently red on the one record that can never map")
    good = all(isinstance(v, str) and len(v) > 80 for v in DECLARED_UNMAPPABLE.values())
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} every declared entry carries a reason "
          f"({len(DECLARED_UNMAPPABLE)} declared) — a bare id list would hide a coverage hole")
    print('SELFTEST', 'PASS — can fire on all three fields, can pass, refuses without input, and '
          'separates an unreached fetch from an unmappable id'
          if ok else 'FAIL — do not trust any scan')
    return ok

def records_path(argv, quiet=False):
    """The v2 records artifact, REQUIRED. Flag-shaped args are ignored so --selftest still works.

    Refusing here rather than defaulting to [] is the whole fix: a missing artifact used to
    subtract 32 records from the scan and say nothing. Exits 2 WITHOUT printing a DONE line, so
    run_checked.sh fails the invocation too — a refusal that a wrapper reads as success would be
    the same hole one layer out."""
    positional = [a for a in argv[1:] if not a.startswith('-')]
    if not positional:
        if quiet:      # the selftest exercises the refusal; it does not need the advice text
            sys.exit(2)
        print('citation_crosscheck: REFUSING TO SCAN — no v2 records artifact given.\n'
              '  Without it the entry-time-identifier population is invisible and the scan\n'
              '  silently shrinks (110 records instead of 142) under a normal-looking DONE line.\n'
              '  Regenerate and pass it:\n'
              '    python3 .claude/extract_citations.py /tmp/atlas-battery/records.json\n'
              '    python3 .claude/citation_crosscheck.py /tmp/atlas-battery/records.json\n'
              '  Or run the whole battery, which regenerates it first:\n'
              '    python3 .claude/battery.py pre-commit', file=sys.stderr)
        sys.exit(2)
    return positional[0]


def main():
    M = json.load(open('.claude/citations.json'))
    v2 = json.load(open(records_path(sys.argv)))
    work = []   # (pmid, rec_author, rec_year, rec_journal, ref, origin)
    for e in M['backfill']:
        if e.get('pmid') and e['status'] in ('backfilled', 'entry-time-identifier'):
            jr = e.get('journalOnLine') or e.get('journal')
            if jr in ('?',): jr = e.get('journal')
            work.append((e['pmid'], e['author'], e['year'], jr, e['refs'][0], e['status']))
    tomap = []   # (raw id, author, year, journal, ref) — PMC/doi ids needing a PMID mapping
    for r in v2:
        ids = r.get('entryTimeIds', [])
        pm = [i for i in ids if i.startswith('PMID:')]
        for i in pm:
            work.append((i[5:], r['author'], r['year'], r['journal'], r['ref'],
                         'entry-time(v2-source)'))
        if not pm:
            for i in ids:
                tomap.append((i, r['author'], r['year'], r['journal'], r['ref']))
    for e in M['backfill']:
        if e['status'] == 'backfilled' and not e.get('pmid') and e.get('doi'):
            tomap.append(('doi:' + e['doi'], e['author'], e['year'],
                          e.get('journalOnLine') or e.get('journal'), e['refs'][0]))
    # map PMC ids via elink (dbfrom=pmc) and dois via esearch [doi]; unmapped ids are
    # REPORTED, never silently skipped — Rachakonda's find lived in exactly this class
    unmapped = []   # (raw, ref, failure or None) — the failure field is the 2026-09-06 split
    for raw, a, y, j, ref in tomap:
        pmid, failure = None, None
        try:
            if raw.startswith('PMC'):
                u = ('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pmc'
                     f'&db=pubmed&id={raw[3:]}&retmode=json')
                js = json.load(urllib.request.urlopen(u, timeout=25))
                ls = js.get('linksets', [{}])[0].get('linksetdbs', [{}])
                ids = ls[0].get('links', []) if ls else []
                pmid = str(ids[0]) if len(ids) == 1 else None
            elif raw.startswith('doi:'):
                u = ('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed'
                     f'&retmode=json&term={urllib.parse.quote(raw[4:])}%5Bdoi%5D')
                js = json.load(urllib.request.urlopen(u, timeout=25))
                ids = js['esearchresult'].get('idlist', [])
                pmid = ids[0] if len(ids) == 1 else None
            time.sleep(0.4)
        except Exception as exc:
            # The old code wrote `pmid = None` here and lost the distinction. A fetch that did not
            # happen tells you nothing about the record; recording WHY is what makes it separable.
            pmid, failure = None, f'{type(exc).__name__}: {exc}'
        if pmid:
            kind = 'doi' if raw.startswith('doi:') else 'pmc'
            work.append((pmid, a, y, j, ref, f'{kind}-mapped'))
        else:
            unmapped.append((raw, ref, failure))
    tolerated, reach_problems = classify_unmapped(unmapped)
    for raw, ref, why in tolerated:
        print(f'DECLARED-UNMAPPABLE (tolerated, coverage limit): {raw} {ref}\n    {why}')
    if reach_problems:
        # ABORT BEFORE THE esummary PASS AND BEFORE ANY DONE LINE, the refusal's shape one level in:
        # len(uniq) is not the population, so there is no number here worth printing. Uniform across
        # both problem classes on purpose — "the total is untrustworthy" is one fact, and a rule with
        # two branches is a rule that gets the branches wrong.
        for problem in reach_problems:
            print(f'  {problem}', file=sys.stderr)
        print('citation_crosscheck: REFUSING TO REPORT — the identifier population was not fully '
              f'reached ({len(reach_problems)} problem(s) above). No DONE line, exit 4, so '
              'run_checked.sh fails the invocation and the battery fails with it. Re-run: a '
              'transient failure passes on the next attempt, and a real one keeps failing.',
              file=sys.stderr)
        sys.exit(4)
    seen, uniq = set(), []
    for w in work:
        k = (w[0], w[4])
        if k in seen: continue
        seen.add(k); uniq.append(w)
    pmids = sorted({w[0] for w in uniq})
    print(f'{len(uniq)} identifier-carrying records ({len(pmids)} unique pmids), '
          f'{len(tolerated)} declared-unmappable')
    es = {}
    for i in range(0, len(pmids), 150):
        chunk = pmids[i:i + 150]
        u = ('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed'
             f'&retmode=json&id={",".join(chunk)}')
        js = json.load(urllib.request.urlopen(u, timeout=40))
        es.update(js.get('result', {}))
        time.sleep(0.4)
    flagged = []
    for pmid, a, y, j, ref, origin in uniq:
        d = es.get(pmid)
        if not isinstance(d, dict) or not d.get('title'):
            flagged.append((pmid, a, y, ref, origin, ['id: pmid not resolvable']))
            continue
        flags = check_one(a, y, j, d)
        if flags:
            flagged.append((pmid, a, y, ref, origin, flags))
    print(f'\nFLAGS: {len(flagged)} of {len(uniq)}')
    for pmid, a, y, ref, origin, flags in flagged:
        print(f'  {pmid} {a} {y} [{origin}] {ref}')
        for f in flags: print(f'      {f}')
    # THE TOLERATED-COUNT MECHANISM (2026-09-15), applied to `flagged` for the first time — see the
    # DECLARED list's own header for the full account of what 67 flags resolved to (3 fixed at the
    # source, 59 distinct keys declared with reason, 0 dated for re-read). Keyed by pmid|author|year
    # rather than by ref: content, not line — a flag re-addressed to a new line by an unrelated edit
    # must not read as a new, undeclared defect, and two instances of the SAME mispairing at two
    # different refs collapse to one declaration rather than needing one each.
    flags_by_key = {}
    for pmid, a, y, ref, origin, flags in flagged:
        flags_by_key[f'{pmid}|{a}|{y}'] = f'[{origin}] {ref}: ' + '; '.join(flags)
    problems = resolve('citation_crosscheck', flags_by_key, DECLARED)
    # condition (7) live assertion, REWRITTEN 2026-09-10: it used to assert that author flags EXIST in the real run, which
    # was only ever true because two real record defects (a journal in the author field) sat in the corpus — the check
    # could not be green on a clean corpus, so its known positive was a defect it thereby preserved (the tolerated-count
    # laundering shape, from the inside). Now the live control is SYNTHETIC on REAL fetched data: one resolved esummary
    # record is checked against an author no paper has; if that does not raise an author flag, the checker is not firing.
    live = next((d for d in es.values() if isinstance(d, dict) and d.get('title')), None)
    assert live is not None, 'live known-positive impossible — no esummary record resolved at all'
    assert any('author:' in f for f in check_one('Zzyzx-Not-An-Author', '1900', None, live)), \
        'live known-positive absent — a synthetic wrong author raised no author flag; the checker cannot be firing correctly'
    print('\nlive known-positive assertion: PASS (a synthetic wrong author flags against real fetched data)')
    # The flags artefact went to a hardcoded scratch dir that no longer exists — the second way
    # this tool could die after doing all its work, and the same one polarity had. Overridable,
    # and it creates its own directory: a refusal that only moves the crash is not a fix.
    dest = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('-') else os.path.join(
        tempfile.gettempdir(), 'atlas-verify', 'cite', 'crosscheck_flags.json')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    json.dump([{'pmid': p, 'author': a, 'year': y, 'ref': r, 'origin': o, 'flags': fl}
               for p, a, y, r, o, fl in flagged],
              open(dest, 'w'), indent=1)
    print(f'  flags written: {dest}')
    # THE SIDECAR (2026-09-06) — the convention's FIRST PRODUCER, so this is where it got finalised.
    # Machine-readable metrics beside the human DONE line, so the ratchet reads STRUCTURE instead of
    # parsing a sentence. One addition to the recorded shape, forced by this instrument's own
    # metrics: `ratchet` names WHICH metrics may only grow. `records` is COVERAGE and must never
    # shrink; `flags` is a DEFECT COUNT and ratcheting it would fail the battery for fixing a flag,
    # turning a quality gate into a reason not to fix things. Only the producer knows which of its
    # numbers is which, so the producer declares it — and battery.py closes the obvious loophole by
    # refusing to let a metric that has ALREADY been ratcheted quietly disappear from this list.
    # Printed BEFORE the DONE line: "DONE last" stays literal, and SIDECAR carries no "DONE" so
    # commit_checked.sh's grep keeps commit messages human-readable.
    print('SIDECAR ' + json.dumps({
        'name': 'citation_crosscheck',
        'metrics': {'records': len(uniq), 'flags': len(flagged),
                    'declared_unmappable': len(tolerated)},
        'ratchet': ['records'],
    }, sort_keys=True))
    # DONE line last, after every write (2026-09-05 sweep): the report of zero must be
    # shown to have been produced at all — absence-of-flags is never a pass.
    print(f'DONE citation_crosscheck: {len(uniq)} records checked, {len(flagged)} flags, '
          f'{len(tolerated)} declared-unmappable, {len(problems)} tolerated-count problems')
    if problems:
        sys.exit(1)

if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' not in sys.argv:
        main()
