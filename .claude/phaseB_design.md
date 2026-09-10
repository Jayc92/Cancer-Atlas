# Phase B: reviewed versus unreviewed, and the provenance schema it depends on (opened 2026-09-10, reframed 2026-09-10, user)

Phase A closed with the render side settled: one mechanism built, one ready, one blocked on a
measurement, one empty, one deferred (`phaseA_closeout.md`). Phase B is the one decision that gates
Phase C and D entirely — but the decision is not build-time versus runtime, which was this
document's own first draft and is now corrected in place (§1). **APPROVED IN PRINCIPLE, PREMISE
CORRECTED, ORDER CHANGED (2026-09-10, user).** This document opens the question and states what is
now ruled; §6 records exactly what.

## 1. The decision, reframed: reviewed versus unreviewed, not build-time versus runtime

**The first draft of this section asked "does content get baked at authoring time or fetched at
page load," on the theory that timing was the load-bearing axis.** It isn't. The real axis is
**whether a human reads the specific claim before it ships** — REVIEWED versus UNREVIEWED — and
build-time/runtime is downstream of it, not identical to it: build-time content can still be
unreviewed (a script bakes a live fetch into static JS with nobody reading the result — this is
the CLAUDE.md roadmap's own retracted rationale, which assumed exactly this was safe because "the
copy is removed"), and in principle reviewed content could be fetched at runtime and shown to an
author for approval before it renders (expensive, not proposed, but not a contradiction). Timing
answers "when does the byte arrive." Review answers "did anyone check what the byte means before
a reader sees it," which is the question every defect this project has found actually turned on.

**The project already has one instance of this pattern, handled correctly, without ever naming
it.** The roadmap's own Phase D entry: *"TRIALS carry a different duty of care: eligibility is not
conveyable ... no endorsement, no ranking by apparent promise — neutral order, stated; THE HANDOFF
IS THE POINT (a reader arriving at their oncologist with informed questions, said on the page)."*
Nobody reads each trial listing before it ships — there will be dozens, refreshed on a schedule no
human reviews per-entry — so the design bounded what the UI is allowed to claim about a listing
instead: no ranking, no availability implied, a stated neutral order, and the page's own text
telling the reader what the list is and is not for. That is the general rule, discovered once and
not yet generalised until now:

**UNREVIEWED CONTENT IS PERMITTED; WHAT IT MAY ASSERT IS BOUNDED BY ITS DECLARATION.** A record
nobody reads per-entry cannot be trusted to carry an unbounded claim — but it does not need a human
read if the SHAPE of what it is allowed to say is fixed in advance and enforced structurally, the
way the trials page's neutral-order-no-ranking rule is enforced by never having ranking logic to
begin with, not by someone checking each render. This reframes what §3's schema is FOR: it is not
provenance paperwork alongside a review process, it is the substitute for review on content that
will not get one — which is why §4 below tests it as a substitute, against known defects a human
review already caught, rather than as an add-on.

**Consequence for the roadmap's build-time/runtime hypothesis:** ratified, but on the corrected
axis. Statistics stay build-time in the sense that already matters — a human reads the source once
— and that is REVIEW, not merely early timing; a live-refetched statistic with the same declaration
discipline would be just as safe, and a baked-but-unread one (the roadmap's original proposal) would
not be. Trials stay runtime-shaped (or a periodically-regenerated build-time list — §5 leaves this
open) precisely because they are UNREVIEWED by nature and the existing bounded-assertion design
already covers that case. The asymmetry the first draft named (a SEER percentage versus a
trial-recruitment status) was real; it was just filed under the wrong variable.

## 2. Why the provenance question has to be answered alongside it, not after

`citations.json` records ONE shape today: "this figure came from this paper" — a `backfill` record
(188 of them) keyed by `author`/`year`/`journal`/`refs`/`status`/`userFacing`, most carrying a
`pmid`/`doi` the crosscheck resolves against PubMed. Every detector that reads the corpus is built
against this shape or against the corpus text's own citation-shaped spans (`extract_citations.py`'s
`ALL_KINDS`, which `citation_reach_check`/`citation_head_check`/`citation_paren_ledger` all consume):
a parenthetical, an author+year, a bare year next to a journal name. **A paper doesn't change; an
endpoint's response might** — "this figure came from this paper, verified 2026-09-10" and "this
field came from this endpoint, retrieved 2026-09-10" are different promises. The first survives
forever once checked. The second is a claim about one moment, and needs its own discipline
(re-fetched every build? cached with a refresh interval? treated as a permanent snapshot?) to say
what the "verified" date even means for it.

**Every existing detector's population depends on this distinction existing.** Checked directly:
`citation_crosscheck.py` is the only detector that reads `citations.json`'s records themselves (via
`pmid`); a runtime-pulled field with no `pmid` either needs its own population inside that check or
needs excluding from it explicitly — right now it would silently NOT be checked, which is a
population gap of exactly the kind this session spent its first message fixing (`reach_check`/
`head_check`'s empty-population refusals; `tolerated.py`'s undeclared-count rule). The corpus-text
detectors (`reach`/`head`/`paren_ledger`) work from `extract_citations.py`'s span taxonomy; if a
runtime-pulled value is ever quoted or represented in `js/organs/*.js` prose, it will look
citation-shaped to those detectors (a parenthetical, a bare year) unless a new, EXPLICITLY GATED kind
is added for it — otherwise it either inflates "unreached span" counts as an undeclared new pattern,
or gets silently swallowed into an existing kind it doesn't actually belong to.

## 3. A candidate schema, amended before design rather than after (2026-09-10, user)

**The first draft of this section recorded provenance of RETRIEVAL only — endpoint, date,
discipline — and that is the wrong half to get right first.** Read against this project's own
defect history, not hypothetically: scope drift (a shared category's citation quoted the wrong
entry — GBM's badge briefly carried PDAC's source, "the citation belongs to the entry" once a
category is shared), denominator transplants (pancreas SMAD4's "~50%" and "25/84" answer different
questions — a pathway-level share and a deletion-mechanism's share within it — and the matcher
paired them as one), certainty drift (the whole reason `citation_polarity.py` exists — a source's
hedge restated as a fact, or the reverse), the gross-versus-histologic register mismatch (this
session's own register-limit finding, three entities deep), stage-at-diagnosis read as growth
behaviour (the extent axis's Ruling 1: "found at diagnosis" is a fact about detection, not about
how a cancer spreads, and the render must not let the two collapse), and a SEER entity broader
than the entry it's attached to (every `EXTENT_STATUS` row's `siteNote`, disclosed on purpose,
fifteen of sixteen times). **Every one of these is an error of MEANING, not of retrieval.** A
schema that records where a number came from and when, without recording what it means, would
rebuild this entire defect class at Phase C/D's scale and speed — faster, because a runtime pull
skips the hand-read that caught every one of the above.

Parallel to `backfill`, a new top-level population — call it `pulled` — with retrieval provenance
AND a meaning-level declaration, both required, neither sufficient alone:

```
{ endpoint: <url>, field: <what value this backs>, retrievedDate: 'YYYY-MM-DD',
  discipline: 'refetch-each-session' | 'cached-until:<date>' | 'permanent-snapshot',

  measures: <the literal quantity/concept this is — "share of cases by stage at diagnosis",
            never left to be inferred from the field name it backs>,
  register: 'gross' | 'histologic' | 'molecular' | 'clinical' | 'radiologic' | ...,
  population: <the actual cohort/entity this figure covers, stated explicitly — "pancreatic
              cancer as a whole", checked against the entry's own scope, not assumed to match it>,
  vintage: <the DATA's own effective period or edition — distinct from retrievedDate, which is
           only when the fetch happened, not what period the number describes>,
  licensedAssertions: [<the sentence shapes the atlas may build from this — e.g.
                       'detection-framed-stage-share'>],   // absence of a shape is a refusal to license it

  refs: [...], status: 'pulled', userFacing: true }
```

Each meaning field answers one named defect directly: `measures` blocks stage-read-as-growth (a
record for a stage share cannot silently back a growth sentence, because what it measures is
written down, not inferred at the point of use); `register` blocks the gross/histologic mismatch
structurally, the way `reserve_check.js` could check it rather than a human re-deriving it per
entity; `population` blocks both denominator transplants (two records with different `population`
values cannot be treated as the same question) and the SEER-broader-than-entry case (the mismatch
between a record's `population` and its entry becomes a structural check, not a disclosure someone
has to remember to write); `vintage` blocks silent staleness (a `retrievedDate` of today says
nothing about whether the underlying data is from a 2016–2022 vintage or a 2024 revision);
`licensedAssertions` blocks certainty drift by construction — a sentence shape not in the list is
not available to build, so drift has to be an explicit schema change, not a wording choice made
once and never revisited. **§4 tests whether that last claim actually holds, and finds it does
not, cleanly, for one specific shape of drift — see the `certainty` field proposed there.**

`discipline` is still the one retrieval property a paper citation has no analogue for: it states
what the retrieval date is a PROMISE about. A `permanent-snapshot` record makes the same promise a
`backfill` record does; `refetch-each-session`/`cached-until` make a weaker one, closer to
`tolerated.py`'s `until` field than to a citation's `verified` date — reusing that mechanism rather
than inventing a third is the cheaper move if the discipline needs enforcement later (an "overdue
re-fetch" check is `reserve_check.js`'s overdue-`unread`-row arm with a different noun).

The fourth property (a cited status carries a resolvable identifier) extends to the retrieval half
cleanly, as before. It does NOT extend to the meaning half — `citedBackingViolations` can check that
an identifier exists; it cannot check that `measures`/`register`/`population` are TRUE of the
source, only that they are PRESENT and internally consistent (e.g. `population` matching the
entry's own scope). That gap is read at authoring time, the way every citation in this repo has
been read so far — the schema makes the gap visible and checkable, it does not close it. **This is
precisely why §1's reframing matters: on UNREVIEWED content, "read at authoring time" does not
happen, so the gap this paragraph describes is exactly the gap §1's rule — bounded assertions
enforced structurally — has to close without a human in the loop. §4 checks how much of it the
current five fields actually close.**

## 4. The schema's positive control — validated against the project's own defect log (2026-09-10, user)

**The method, named directly: this is the same discipline as the coupling audit's synthetic
control, ported to a schema instead of a detector — don't trust an instrument (or a schema) that
has never caught a known defect.** Unlike the coupling audit, this one costs nothing but the read:
every defect below is already labelled with its correct verdict, from this project's own history.
The question for each: if this record had been authored as a `pulled` record under §3's schema
instead of hand-written prose, would the schema's REQUIRED fields have made the defect visible —
either because a check would fire, or because the field cannot be filled in without the author
confronting the exact distinction that was missed?

| defect (site) | what went wrong | would §3's schema catch it? |
|---|---|---|
| **Testis share, German-registry scope** (testis.js) | a share (64.5%, 22,634/35,066) was read as if it described testicular cancer everywhere; the source is one national registry, 2003–2014 | **AUTHORING-CAUGHT, not machine-caught.** `population` is REQUIRED and must name the actual cohort ("German testicular cancer registry, 2003–2014") — filling it in forces the distinction into view, the way the shipped fix now reads "in a German 2003–2014 registry" inline. Nothing checks that the filled-in value is TRUE or specific enough; a lazy `population: 'testicular cancer patients'` would pass the schema and reintroduce the drift. |
| **Bladder entity breadth** (bladder.js) | ~92% urothelial was one edit away from reading as "92% of bladder cancer is urothelial" rather than "92% of the four commonest bladder-primary types are" | **AUTHORING-CAUGHT.** `measures` is REQUIRED to state the literal quantity — "share of the four commonest bladder-primary carcinoma types that are urothelial" forces the superset to be named. Same limit as above: nothing verifies the four types are actually exhaustive of what a reader would call "bladder cancer" without a source read. |
| **Detection read as growth behaviour** (extent axis, all 16 entries) | "found at diagnosis" risks being read as "how the cancer spreads" | **MACHINE-CAUGHT, with a working precedent.** `measures: 'share of cases by stage at diagnosis'` plus `licensedAssertions` naming only detection-framed sentence shapes, checked the way `reserve_check.js` already bans the word "spread" in extent sentences today. This is the schema's strongest case — it generalises a mechanism already built and running. |
| **Register mismatch** (FTC / prostate acinar / TNBC margin) | histologic-register literature backed a claim the axis requires at gross register | **MACHINE-CAUGHT.** `register` names the distinction directly; a check comparing `record.register` against the axis's required register is the same shape as the extent-sentence ban above, not yet built but structurally trivial once the field exists. This is the field the whole `pulled` proposal is named for, and it is the one with the cleanest catch. |
| **Denominator transplant** (pancreas SMAD4, ~50% vs 25/84) | a pathway-level share and a deletion-mechanism's share within it were nearly paired as one fact | **AUTHORING-CAUGHT, partially.** Two records with `measures: 'pathway-level SMAD4 loss, any mechanism'` and `measures: 'SMAD4 homozygous deletion specifically'` are visibly different questions once written down — but nothing today would REFUSE an attempt to merge or compare them; that check does not exist and would need building (compare `measures` strings before allowing two records to corroborate one sentence). |
| **Wang/Park attribution error** (bladder citation) | a real paper's identifier was recorded under the wrong journal/author | **OUT OF SCOPE for `pulled`.** This is a `backfill`-shaped defect (a paper citation, not a live-endpoint field) and is already governed by the fourth property plus `citation_crosscheck`'s identifier-vs-metadata comparison — the mechanism that caught the PNAS/Neuro-Oncology author-field defects earlier this session. Testing `pulled`'s meaning fields against it is a category mismatch; it validates that the EXISTING retrieval-identity mechanism generalises, not that the new fields do. |
| **Certainty drift** (kidneys.js, Gerlinger "found convergent evolution" for a hedge the source states as "suggesting … phenotypic evolution") | a source's hedge was restated as an established finding | **MISSED. A real gap, found by running this table, not asserted from confidence.** None of the five fields addresses hedge strength. `licensedAssertions` bounds which SENTENCE SHAPES are allowed, not how DEFINITELY a shape may be stated. **Incidental finding while building this table: the identical defect was already fixed once, on the SETD2 record in the same file, and its two siblings — KDM5C and PTEN — still said "found convergent evolution" unhedged, the small-population "second entry inherits the first's citation silently" class recurring one axis over. Fixed in this commit (both now read "which the authors read as suggesting convergent phenotypic evolution," matching SETD2's own already-corrected wording) — a live defect does not wait for the schema conversation to finish.**|

**Score: 2 of 7 mechanically caught, 3 of 7 caught only by forcing the question at authoring time
(real risk reduction, not a substitute for a correct answer), 1 of 7 out of scope for this schema
specifically, 1 of 7 missed outright.** Read plainly: the schema is READY to structurally enforce
the register/detection-framing axis it was built for — that is 2 of 7 with a working precedent
already running. It is NOT ready to stand in for a human on scope, denominator, or entity-breadth
questions; it only makes the omission harder to make by accident, which is worth having but is not
the same claim §3 was making. And it has a clean, nameable hole on certainty.

**Consequence: a sixth field, proposed to close the found gap before this schema governs anything
unreviewed.** `certainty: 'definitive' | 'suggestive' | 'associative'` — the source's OWN hedge
strength, required wherever the source states one, checked the same way `citation_polarity.py`
already classifies a window as corrective/caveated/clean: a record whose source text carries a
hedge marker ("suggest", "propose", "may", "associated with") but declares `certainty:
'definitive'` is a detectable mismatch, the same shape as `register` mismatching its axis. Not
built; proposed for the same reason `register` and `measures` were proposed — read against a
defect this project actually found, not invented in the abstract.

## 5. What this document does not decide

- Whether ANY Phase C/D content should be runtime at all, versus everything staying build-time and
  "trials" being reconsidered as a periodically-re-authored build-time list instead (cheaper, no new
  capability, staler by construction — a real trade, not a strawman). Reframed by §1: this is now a
  question about review CADENCE, not about a capability gate.
- Which specific endpoints (if any) would be used, and whether they are reachable without an account
  or API key under the standing rule.
- Whether `pulled` is the right name or shape — proposed, amended once already (§3), amended again
  by §4's `certainty` field, still not ratified.

## 6. Ruling received, and what follows from it (2026-09-10, user)

**Approved in principle, premise corrected, order changed.** The build-time/runtime framing is
retired in favour of §1's reviewed/unreviewed axis, ratified as stated there. The roadmap's own
"pulling removes the copy error class" rationale is corrected in place at its source (CLAUDE.md)
rather than only here, since it was the thing about to justify a design on a false premise.

**THE ORDER: DECLARATION LAYER FIRST, FETCHER SECOND. No integration work — no endpoint chosen, no
fetch code written, no detector touched to accommodate a live record — until §4's table is closed
rather than merely reported.** Concretely, before any fetcher:
1. Add the `certainty` field §4 proposed and re-run the table's one missed row to confirm it now
   catches the certainty-drift shape (Gerlinger-style hedge restated as fact) the way `register`
   already catches its own axis.
2. Decide whether the three AUTHORING-CAUGHT-ONLY rows (scope, entity breadth, denominator) need a
   machine check before Phase C/D, or whether "the schema forces the question, a human still answers
   it" is an accepted, bounded risk for a FIRST unreviewed content type — this is a ruling still
   owed, not decided by this document.
3. Only then: name a first candidate endpoint (§5, still open) and build the fetcher against a
   schema that has already been shown catching most of what it was built to catch.

No detector, no schema file, and no runtime fetch code is touched until 1 and 2 above are resolved.
