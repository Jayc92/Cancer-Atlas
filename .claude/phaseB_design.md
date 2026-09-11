# Phase B: reviewed versus unreviewed, and the provenance schema it depends on (opened 2026-09-10, reframed 2026-09-10, sharpened 2026-09-10, user)

Phase A closed with the render side settled: one mechanism built, one ready, one blocked on a
measurement, one empty, one deferred (`phaseA_closeout.md`). Phase B is the one decision that gates
Phase C and D entirely. The decision is not build-time versus runtime (§1's retired first draft);
it is reviewed versus unreviewed. **§4 corrects this document's own prior scoring of itself: a declaration nobody
verifies is not a catch, it is an assertion wearing provenance — the same shape as a tolerated
count. §9 records what was actually ruled and the order that follows from it.**

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
begin with, not by someone checking each render. **§4 sharpens this rule immediately: the shape
being fixed in advance is not enough on its own if the CONTENT poured into that shape is still a
free-typed assertion nobody checks. §9 is where that sharpening lands as a ruling.**

**Consequence for the roadmap's build-time/runtime hypothesis:** ratified, but on the corrected
axis. Statistics stay build-time in the sense that already matters — a human reads the source once
— and that is REVIEW, not merely early timing; a live-refetched statistic with the same declaration
discipline would be just as safe, and a baked-but-unread one (the roadmap's original proposal) would
not be. Trials stay runtime-shaped (or a periodically-regenerated build-time list — §8 leaves this
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
AND a meaning-level declaration:

```
{ endpoint: <url>, field: <what value this backs>, retrievedDate: 'YYYY-MM-DD',
  discipline: 'refetch-each-session' | 'cached-until:<date>' | 'permanent-snapshot',

  measures: <the literal quantity/concept this is — "share of cases by stage at diagnosis">,
  register: 'gross' | 'histologic' | 'molecular' | 'clinical' | 'radiologic' | ...,
  population: <the actual cohort/entity this figure covers, stated explicitly>,
  vintage: <the DATA's own effective period or edition, distinct from retrievedDate>,
  licensedAssertions: [<the sentence shapes the atlas may build from this>],

  refs: [...], status: 'pulled', userFacing: true }
```

**§4 withdraws the claim that follows in the original draft of this section — that each meaning
field "blocks" its named defect. It does not, on its own. A field that must be filled in blocks
nothing if nothing checks what was filled in against anything external.** What each field DOES do,
honestly, is in §4's table.

`discipline` is still the one retrieval property a paper citation has no analogue for: it states
what the retrieval date is a PROMISE about. A `permanent-snapshot` record makes the same promise a
`backfill` record does; `refetch-each-session`/`cached-until` make a weaker one, closer to
`tolerated.py`'s `until` field than to a citation's `verified` date.

The fourth property (a cited status carries a resolvable identifier) extends to the retrieval half
cleanly. It does NOT extend to the meaning half — `citedBackingViolations` can check that an
identifier exists; it cannot check that `measures`/`register`/`population` are TRUE of the source,
only that they are PRESENT. **§4 is the section that stops treating "present" as good enough.**

## 4. The declaration-verification gap — why a forced field is not a catch (2026-09-10, user)

**The correction, stated as bluntly as it was given: an unverified declaration is a laundered
claim, the same shape as a tolerated count.** Someone writes `population: 'US adults, SEER 22'` at
the exact moment they are least positioned to notice a mismatch — mid-integration, trusting the
endpoint, under no pressure to doubt it — and it freezes into something that READS as provenance
while being only an assertion. §1's whole premise is that the reader is being removed. A field that
"forces someone to write down the answer" is worth close to nothing once there is no one left to be
prompted by the requirement. The three rows below marked AUTHORING-CAUGHT-ONLY in the table this
document previously scored as partial credit are corrected here: **they do not count as catches.**

**The move that converts a declaration from an assertion into a checked claim: derive it, don't
type it.** If the source itself returns the value in machine-readable form — SEER's own data year,
registry set, or query population as structured response fields, not prose on a page a person
summarised — then the declaration is a COPY of the response, and declared-versus-returned
divergence becomes mechanically detectable, exactly the shape `citation_crosscheck.py` already uses
for `backfill` records (compare a recorded field against what the identifier's own metadata says).
A hand-typed declaration is permitted only where no machine-readable equivalent exists — and how
often that is true is the number that matters, because it is the size of the surface nothing but a
human ever checks again.

**Re-scoring the schema's five fields against derive-versus-type, not against "did filling it in
force a question":**

| field | derivable from a real structured source? | who decides it, and how often |
|---|---|---|
| `endpoint`, `retrievedDate` | ALWAYS — mechanical facts about the fetch itself, never typed | machine, every record |
| `vintage` | LIKELY, if the integration uses a real versioned API response (SEER's own data-year/submission metadata) rather than a scraped Stat Facts page — an architectural requirement, not a given | machine, every record, PROVIDED the endpoint choice makes it available |
| `measures` | DERIVABLE AT THE ENDPOINT LEVEL — which statistic an API series returns (incidence vs. survival vs. stage distribution) is a structural fact about which series was queried, not a per-record judgment | human, ONCE PER ENDPOINT, reused by code for every record that endpoint ever returns |
| `population` | CONDITIONALLY DERIVABLE — a real API's own query parameters (registry set, age range, sex, race) ARE the population framing if the integration queries a real API; UNRECOVERABLE if the integration instead scrapes a human-facing summary page, which is what this session's own SEER Stat Facts reads did | machine if a real API is used; human, per record, if pages are scraped — **this is the one field where the SOURCE ARCHITECTURE decides the answer, not the schema** |
| `register`, `licensedAssertions` | NEVER — no cancer-statistics source publishes "gross versus histologic register" or "which sentence shapes are licensed"; these are this project's own invented axes with no external analogue | human, but ONCE PER AXIS/ENDPOINT (register is a property of what kind of source an axis accepts at all; licensedAssertions is a property of the axis, not the record) — decided a handful of times total, not once per entry |

**The headline number, made visible rather than left a footnote: the permanently hand-written
surface is bounded by the number of ENDPOINTS and AXES integrated, not by the number of ENTRIES.**
`measures`, `register`, and `licensedAssertions` are each a per-endpoint or per-axis decision, made
once and reused by code across every record that endpoint or axis ever produces — the same shape
this project's own citation ledger already uses (one record, many refs) rather than the danger case
(one hand-typed judgement per entry, ~120 times over). `population` is the one field whose
derivability is an architecture choice: querying a real SEER API with structured parameters makes
it machine-checked; scraping Stat Facts pages (this session's own method) makes it exactly the
free-typed liability described above, on every single entry. **This is now the concrete design
constraint the fetcher has to satisfy, not a preference: Phase C/D's statistics integration must
use a queryable API with structured response metadata, not a page scrape, or `population` reverts
to an unguarded per-entry assertion for the entire tier.**

**Re-reading the seven-defect table under this corrected standard:**

| defect | original scoring | corrected scoring |
|---|---|---|
| Testis German-registry scope drift | "authoring-caught" | **NOT CAUGHT.** `population` typed by hand, unverified, is the exact shape of the defect it claims to prevent — a plausible-looking cohort string nobody checks again. Caught only if the integration derives it from a real API. |
| Bladder entity breadth | "authoring-caught" | **NOT CAUGHT**, same reason. `measures` typed once per record (rather than once per endpoint and reused) carries the identical risk. |
| Denominator transplant (pancreas SMAD4) | "authoring-caught, partially" | **NOT CAUGHT** as a per-record field; PARTIALLY MITIGATED if `measures` is fixed per endpoint, since two different endpoints (pathway-level vs. mechanism-level assays) would carry two different, code-enforced `measures` strings that can never silently merge. |
| Detection read as growth behaviour | "mechanically caught" | **STILL CAUGHT** — this check runs against the RENDERED SENTENCE (a banned-word check on output text), not against a hand-typed declaration; it does not depend on trusting anyone's `measures` field being honest. |
| Register mismatch (FTC/acinar/TNBC) | "mechanically caught" | **PARTIALLY CAUGHT.** A check comparing `record.register` against an axis's required register catches a record ASSIGNED to the wrong axis; it cannot catch a `register` value that is simply wrong about the source, since nothing external confirms it. Sound IF `register` is decided once per axis by a human who reads carefully, weak if typed per record. |
| Wang/Park attribution error | "out of scope" | **UNCHANGED — out of scope**, still governed by the existing `backfill`/crosscheck mechanism, which DOES derive-and-compare (declared author/journal versus the identifier's own PubMed metadata) — the one mechanism in this whole document that was already doing this correctly before Phase B was ever opened. |
| Certainty drift | "missed" | **UNCHANGED — missed**, and see §5's census before treating a sixth field as the fix. |

**Net: of seven, one is solidly caught (a rendered-text check independent of any typed
declaration), one is soundly caught only if scoped per-axis rather than per-record, one is already
caught by an unrelated existing mechanism, and four are not caught by anything this schema proposes
unless the fetcher is built against a real structured API rather than a scraped page.** That is the
honest number, and it is the same conclusion the coupling audit reached in its own domain: some
properties need a reader, and no gate substitutes. §6 draws the architectural consequence.

## 5. The certainty-drift census, run before the sixth field (2026-09-10, user)

**The ask, precisely: two live hedge-flattening records were found by accident, in one file, where
an identical third record had already been fixed. That is an unmeasured rate in served content, and
a sixth field protecting future unreviewed content while the live corpus carries the same defect
class unguarded gets the priority backwards.** Three methods run, corpus-wide, over every
`note`/`ccf`/`text`/`desc` field in `js/organs/*.js`:

1. **Proximity sweep** (a strong/definitive verb — found, shows, causes, confirms — with no hedge
   word inside the same field, but a hedge word or model-system term sitting within ~400 characters
   in the same file). **Proven capable of missing a known positive before being trusted**: run
   against the pre-fix `kidneys.js` from this repo's own history, it caught the PTEN record but
   MISSED the KDM5C record — the SETD2 record whose hedge would have cleared it sat outside the
   400-character window, a real, demonstrated method gap, not a hypothetical one. Run corpus-wide
   anyway, as a first pass: 6 candidates, **all 6 false positives on a hand read** — three were
   negated mentions ("no interaction analysis... was found", the exact citation_polarity.py class
   this project already named and mechanised for a different population), two were a `found`
   inside a verbatim quotation of the source's own words (correct citation practice, not
   overclaiming), and one was a mouse-model finding that already discloses "In mice" in the same
   sentence.
2. **Identity-grouped consistency check**, built after the proximity method's proven blind spot,
   matching this project's own "search by identity, not by instance" principle rather than a
   character-radius guess: every `(author, year)` citation extracted from every note/ccf field,
   grouped by identity, checked for hedge-consistency ACROSS every mention of the same source.
   259 fields scanned corpus-wide; 6 distinct citations are ever mentioned 2+ times within a
   note/ccf field; exactly ONE shows inconsistent hedging — **Gerlinger et al. (NEJM, 2012), the
   already-found, already-fixed kidneys defect, and no other repeated citation in the corpus shows
   the same pattern.**
3. **Direct model-system disclosure check**: every field mentioning mouse/murine/cell-line/
   xenograft work at all (2 in the whole corpus — ovary.js:211, skin.js:393) already discloses the
   model system in the same sentence. No omission found.

**The honest result, stated at the width the methods actually support, not wider: no NEW live
certainty-drift instance found by any of the three methods, and the identity-grouped method (the
one proven not to have the proximity method's blind spot) is the one that matters most — it is
zero-for-the-corpus on the exact shape it was built to catch.** The bound that must be stated
alongside this, because a clean sweep is not the same claim as a clean corpus: **all three methods
can only catch drift that leaves a trace INSIDE this corpus** — a contradicting sibling mention, or
a nearby hedge word. A citation used EXACTLY ONCE that quietly overclaims relative to a source
nobody in this session re-fetched is invisible to all three, by construction, and catching that
requires re-reading the original source — which is precisely the Tier 2, hand-read, stays-small
work §6 names, not a corpus-internal sweep. Of the 372 epidemiological source keys this project's
own identifier-harvest already counted, the overwhelming majority are cited exactly once; this
census bounds the REPEATED-citation slice of certainty drift at zero currently-live instances, and
says nothing about the much larger single-mention slice, which was never this census's target and
is not claimed to be covered by it.

## 6. The two-tier model (2026-09-10, user)

**§4's table result — one solid catch, everything else conditional on a reader or an architecture
choice this document does not control — is the same finding the coupling audit reached in its own
domain: some properties need a reader, and no gate substitutes.** If most meaning errors are like
that, the architecture is two tiers, not one:

**TIER 1 — machine-safe.** A figure reproduced VERBATIM with every qualifier its source attached —
rate, population, data year, stage basis — rendered together, asserting nothing the source didn't.
The atlas adds no interpretation: no summarising, no comparison across entries, no dropped
qualifier for space. This is checkable mechanically and it is the tier that scales to Phase C's
~120 entries. It already has a working precedent in this codebase: `extentSentence`
(`js/morphology.js`) concatenates `site`/`siteNote`/`shares`/`basis`/`source`/`ref` into one
sentence unconditionally, by construction — no code path can render a share without its basis or
its site qualifier, because the function has no branch that omits them. Any new Tier 1 axis follows
the identical discipline: mandatory-field concatenation, never a free-text summary that could
silently drop one.

**TIER 2 — reader-required.** Anything interpreted: summarising, comparing across entries, dropping
a qualifier for space, stating what a number MEANS rather than what it says. Every defect this
session found lives here, including the two rows §4 still credits as sound (detection-framed
wording, register-vs-axis) — both require a human to have gotten the underlying judgement right
once; they differ from the rest only in HOW CHEAPLY a subsequent check can catch a later
inconsistency, not in whether a reader was needed at all. This tier stays hand-read and therefore
stays deliberately small — it cannot be the tier that carries Phase C's breadth.

**The boundary is itself checkable, and building the check is part of adopting this model, not a
separate task:** a rendered figure that has SHED a qualifier its own source record carried has
crossed from Tier 1 into Tier 2 without anyone deciding it should. For any `pulled` record with a
Tier 1 declaration (`population`, `vintage`, `basis`, etc. all present), a check comparing the
record's own fields against the substring content of its rendered sentence — the same shape
`reserve_check.js` already uses for the extent axis's basis-regex and shares-sum arms — flags any
render that omits a field the record declares. This does not verify the DECLARATION is true (§4's
unclosed half); it verifies the RENDER has not silently thrown away a declaration that was checked
in, which is a real, mechanically enforceable, and previously entirely unguarded failure mode of
its own.

**What this implies for the original goal, stated plainly rather than left implicit:** Joe's
"one-stop-shop" gets BREADTH in Tier 1 statistics — verbatim, qualified, scalable to ~120 — and
DEPTH only where Tier 2 work has actually been done, which stays proportional to how much hand
reading this project or a future session actually completes. That is an honest answer, probably the
true one, and a smaller promise than "authoritative data on a hundred and twenty cancers" reads as
on first hearing. Recorded here so the gap between those two framings is a design decision made
once, not a surprise found later.

## 7. The sixth field, rescoped to Tier 2 (2026-09-10, user)

**Priority corrected: the census (§5) matters more than this field, and the field's own scope
shrinks once Tier 1/Tier 2 is drawn.** `certainty` addresses hedge strength — how definitely a
source states an interpretive claim (`'definitive' | 'suggestive' | 'associative'`). Tier 1 content
(a rate, a count, a stage share) carries no interpretive claim to hedge; a statistic is a number, not
an inference. The certainty-drift defect class — confirmed by every example this session
found, including the census in §5 — lives entirely in Tier 2: hand-authored mechanism prose
describing what a paper concluded, not a pulled statistic. So `certainty` is not a `pulled`-schema
field at all; it belongs on `backfill` records, the population Tier 2 content actually comes from,
checked the way `citation_polarity.py` already classifies a window as corrective/caveated/clean —
extending that existing classifier to flag a `backfill` record whose note text states a claim more
definitely than its own classified window, rather than adding a new field to a schema built for
statistics that will rarely if ever need it.

## 8. What this document does not decide

- Whether ANY Phase C/D content should be runtime at all, versus everything staying build-time and
  "trials" being reconsidered as a periodically-re-authored build-time list instead. Reframed by
  §1: a question about review CADENCE, not a capability gate.
- Which specific endpoints (if any) would be used — now sharpened by §4 into a real constraint: any
  statistics endpoint must return structured, queryable population/vintage metadata, or `population`
  reverts to an unguarded per-entry assertion for its entire tier. Whether ClinicalTrials.gov's v2
  API and a real SEER API (not Stat Facts pages) satisfy this is unchecked.
- Whether `pulled` is the right name or shape for Tier 1 specifically — proposed, amended twice
  (§3, this rewrite), still not built.
- Where, precisely, the Tier 1/Tier 2 line falls for content types not yet named (mutation
  frequencies, staging thresholds) — §6 states the test (has a qualifier been dropped), not a
  per-content-type ruling.

## 9. Ruling received, and what follows from it (2026-09-10, user)

**Approved in principle, premise corrected, order changed, twice now.** First: build-time/runtime
retired for reviewed/unreviewed (§1). Second: "the schema forces the question" retired as a form of
catching anything — an unverified declaration is a laundered claim, and the architecture is now two
tiers, not one flat schema with five fields of mixed reliability (§4, §6).

**THE ORDER, restated against the corrected model. No integration work — no endpoint chosen, no
fetch code written, no detector touched to accommodate a live record — until:**
1. **Census, done (§5).** No new live certainty-drift instance found by either method proven capable
   of finding one; the single-mention blind spot is named, not claimed closed.
2. **The three previously-"authoring-caught" rows are recorded as NOT caught (§4)**, and the
   per-endpoint/per-axis scoping that reduces (without eliminating) the hand-written surface is the
   design constraint carried forward, not the field-per-record shape originally proposed.
3. **The two-tier model is ratified as this document's architecture (§6).** Tier 1 (verbatim +
   qualifiers, mechanically bounded, scales) is where Phase C/D breadth lives; Tier 2 (interpreted,
   hand-read, stays small) is where every defect this session found actually lives, and it does not
   get to grow just because Tier 1 exists alongside it. The shed-qualifier boundary check (§6) is
   part of adopting the model, not a follow-up.
4. **The sixth field moves to `backfill`/Tier 2, last, lowest priority of the four** (§7) — it
   protects hand-authored mechanism prose from a defect class the census just measured at a
   confirmed-zero rate for its detectable slice, which is real but not urgent relative to 1–3.
5. Only then: name a first candidate endpoint, confirm it returns structured population/vintage
   metadata (§4's architectural constraint), and confirm it needs no account or API key under the
   standing rule.

No detector, no schema file, and no runtime fetch code is touched until 1–3 above are closed, not
merely reported.
