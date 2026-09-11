# Phase B: reviewed versus unreviewed, and the provenance schema it depends on (opened 2026-09-10, reframed 2026-09-10, sharpened 2026-09-10, feasibility-tested 2026-09-10, user)

Phase A closed with the render side settled: one mechanism built, one ready, one blocked on a
measurement, one empty, one deferred (`phaseA_closeout.md`). The architecture question is now
SETTLED (§11): reviewed versus unreviewed (§1), a two-tier render model (§7) with its own
verification gap corrected before being trusted (§4), and a feasibility check run with real
requests, not assumed (§5). **What remains open is feasibility, not architecture** — and §5 answers
most of it already, mixed: one source confirmed usable, one confirmed blocked, one not found.

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
begin with, not by someone checking each render. **§4 sharpens this rule: the shape being fixed in
advance is not enough if the CONTENT poured into that shape is still a free-typed assertion nobody
checks. §11 is where the sharpening lands as a ruling.**

**Consequence for the roadmap's build-time/runtime hypothesis:** ratified, but on the corrected
axis. Statistics stay build-time in the sense that already matters — a human reads the source once
— and that is REVIEW, not merely early timing; a live-refetched statistic with the same declaration
discipline would be just as safe, and a baked-but-unread one (the roadmap's original proposal) would
not be. Trials stay runtime-shaped precisely because they are UNREVIEWED by nature and the existing
bounded-assertion design already covers that case.

## 2. Why the provenance question has to be answered alongside it, not after

`citations.json` records ONE shape today: "this figure came from this paper" — a `backfill` record
(188 of them) keyed by `author`/`year`/`journal`/`refs`/`status`/`userFacing`, most carrying a
`pmid`/`doi` the crosscheck resolves against PubMed. **A paper doesn't change; an endpoint's
response might** — "this figure came from this paper, verified 2026-09-10" and "this field came
from this endpoint, retrieved 2026-09-10" are different promises. The first survives forever once
checked. The second is a claim about one moment, and needs its own discipline to say what
"verified" even means for it.

**Every existing detector's population depends on this distinction existing.** `citation_crosscheck.py`
is the only detector that reads `citations.json`'s records themselves; a runtime-pulled field with
no `pmid` either needs its own population inside that check or needs excluding from it explicitly.
The corpus-text detectors (`reach`/`head`/`paren_ledger`) work from `extract_citations.py`'s span
taxonomy; a runtime-pulled value quoted in `js/organs/*.js` prose will look citation-shaped to them
unless a new, explicitly gated kind is added for it.

## 3. A candidate schema, amended before design rather than after (2026-09-10, user)

Read against this project's own defect history: scope drift, denominator transplants, certainty
drift, the gross-versus-histologic register mismatch, stage-at-diagnosis read as growth behaviour,
and a SEER entity broader than its entry. **Every one of these is an error of MEANING, not of
retrieval.** Parallel to `backfill`, a new top-level population — call it `pulled` — with retrieval
provenance AND a meaning-level declaration:

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

**§4 withdraws the claim that each meaning field "blocks" its named defect on its own. It does
not, unless something checks what was filled in against anything external.**

## 4. The declaration-verification gap — why a forced field is not a catch (2026-09-10, user)

**An unverified declaration is a laundered claim, the same shape as a tolerated count.** Someone
writes `population: 'US adults, SEER 22'` at the exact moment they are least positioned to notice a
mismatch, and it freezes into something that READS as provenance while being only an assertion.
§1's whole premise is that the reader is being removed; a field that "forces someone to write down
the answer" is worth close to nothing once there is no one left to be prompted.

**The move that converts a declaration into a checked claim: derive it, don't type it.** If the
source returns the value in machine-readable form — a real API's own data-year or query-population
fields, not prose on a page a person summarised — declared-versus-returned divergence becomes
mechanically detectable, the same shape `citation_crosscheck.py` already uses for `backfill`
records. A hand-typed declaration is permitted only where no machine-readable equivalent exists.

**Re-scoring the schema's five fields against derive-versus-type:**

| field | derivable from a real structured source? | who decides it, and how often |
|---|---|---|
| `endpoint`, `retrievedDate` | ALWAYS — mechanical facts about the fetch, never typed | machine, every record |
| `vintage` | LIKELY, if the integration uses a real versioned API response rather than a scraped page — **§5 tests this per source, not assumed** | machine, every record, if available |
| `measures` | DERIVABLE AT THE ENDPOINT LEVEL — which statistic an API series returns is structural, not a per-record judgment | human, once per endpoint, reused by code every time |
| `population` | CONDITIONALLY DERIVABLE — a real API's own query parameters ARE the population framing; UNRECOVERABLE if the integration scrapes a human-facing page instead, which is what this session's SEER reads did | machine if a real API is used; human, per record, if pages are scraped |
| `register`, `licensedAssertions` | NEVER — no cancer-statistics source publishes these; this project's own invented axes | human, once per axis, not once per entry |

**Re-reading the seven-defect table under this standard: 1 of 7 solidly caught (a check against
rendered TEXT, not a typed field — the detection-framing wording ban); 1 caught only if scoped once
per axis (register vs. required register); 1 already caught by an unrelated existing mechanism
(Wang/Park's attribution error, governed by `backfill`/crosscheck); 4 not caught by anything
proposed unless the fetcher queries a real structured API rather than a scraped page.** That fourth
number is now the load-bearing one, and §5 tests it directly rather than leaving it a hope.

## 5. Feed feasibility, tested with real requests (2026-09-10, user: "verify the structured feed actually exists ... before designing around it")

**The rule: a real request, a real response, recorded — not a documentation skim.** Every source the
roadmap or this document names, checked directly:

**ClinicalTrials.gov v2 API — CONFIRMED AVAILABLE AND SUFFICIENT.** A real, unauthenticated GET to
`clinicaltrials.gov/api/v2/studies` returned `HTTP 200`, clean JSON, with the exact structured
fields Tier 1 needs already broken into named modules — `identificationModule`, `statusModule`,
`conditionsModule`, `eligibilityModule` — no account, no key. This is the one source among the
three that needs nothing further before an integration could be designed against it. It backs
trials specifically, which §1 already scoped as the unreviewed, bounded-assertion case — the
architecture and the feasibility agree here.

**SEER — CONFIRMED BLOCKED under this project's own standing rule.** `api.seer.cancer.gov`'s real
REST endpoint returned `HTTP 401`, JSON body `{"message": "You must supply an API key"}` — the API
is genuinely structured (its own error response is JSON, matching a real REST service, not a
marketing page), but it requires registration. The standing rule against creating accounts or
signing up anywhere makes this endpoint unreachable regardless of what fields it would return.
**This is the single most consequential finding in this document.** SEER is the source behind every
statistic this session actually used — the fifteen live extent lines, mutation-frequency figures,
staging thresholds — and its only confirmed structured path is closed to this tooling. Not
"unchecked": tested directly, with a real request, and the answer is no.

**PDQ — NOT FOUND after a real search, distinct from "confirmed unavailable."** NCI publishes
several genuine structured web APIs (`webapis.cancer.gov`: glossary, drug dictionary, clinical
trials search, site search) — confirmed live and enumerable from the site's own configuration JSON
— but none of them serves PDQ disease/treatment content, the population this project actually
cites ("PDQ Gastric Cancer Treatment," etc.). Guessed syndication/XML endpoints 404'd. No dedicated
PDQ content API was located. This is a good-faith negative result, not an exhaustive one: a
licensed syndication feed for approved health-content partners may exist, and licensing is itself
an account-shaped barrier this project would not cross regardless.

**WHO classification and PathologyOutlines — both already known, confirmed consistent.** WHO Blue
Books are published documents with no API of any kind. PathologyOutlines is closed to this client
(three rate-limit windows, recorded earlier this session) independent of anything Phase B changes.

**Scored against §4's four-defect gap directly: of the sources actually available to fill it, one
(trials) closes it completely; the other two (SEER, PDQ) do not close it at all under this
project's standing constraints, at least not today.** The four defects §4 found uncaught by a typed
field stay uncaught for statistics content specifically — not because the architecture is wrong,
but because the feed the architecture needs does not exist reachably.

**The retroactive edge, answered rather than assumed:** the fifteen live extent lines were sourced
from SEER Cancer Stat Facts HTML pages, hand-read, because that is the only SEER access this
project has ever had. §4's re-pull suggestion — promote them to Tier 1 by pulling from a structured
feed — is **not currently achievable**, because the structured feed it would pull from is the one
just confirmed blocked. These fifteen lines are not grandfathered by oversight; they are Tier 2 by
necessity, and stay that way until either the API becomes reachable without an account (unlikely
for a standard keyed REST service) or a person — not this session — decides to register for a key
themselves and hands the access to a future integration. Recorded here so a later session does not
re-propose the re-pull without re-checking this finding first.

## 6. The certainty-drift census, with its denominator (2026-09-10, user: "an unquantified zero is the laundering pattern in a new dress")

**The correction: "nothing further found" was reported as a zero with no stated coverage, which is
exactly the pattern this document spent §4 retiring in a different field.** Restated at the width
the method actually supports.

**Three methods, escalating, each checked before being trusted, not merely run:**
1. A proximity sweep (strong verb, no self-hedge, but a hedge word within ~400 characters) —
   PROVEN capable of missing a known positive: run against this repo's own pre-fix `kidneys.js`, it
   caught one of the two live hedge-flattening records and missed the other, because the window did
   not span two sibling entries in the same array. Run corpus-wide anyway: 6 candidates, all 6 false
   positives on a hand read.
2. An identity-grouped consistency check (group every citation by `(author, year)`, flag
   inconsistent hedging across repeated mentions of the SAME source — search by identity, not by
   character distance) — proven to catch the known positive the proximity method missed.
3. A direct model-system disclosure check (every mouse/cell-line/xenograft mention, checked for
   same-sentence disclosure) — 2 in the whole corpus (ovary.js:211, skin.js:393), both already
   disclosing the model system in the same sentence.

**The denominator, computed two ways, not assumed:** the citation ledger (`citations.json`'s
`backfill`) holds 188 records, 180 distinct identities. A wide, permissive extraction pass over
every user-facing field in the corpus (`note`/`ccf`/`text`/`desc`/`share`) finds roughly 139 distinct
(name, year) candidates by pattern alone (an over-count — it includes non-citation false matches).
**Method 2's own citation-extraction regex — the one doing the actual checking — recognises 23 of
those** on its widened pass (6 on its first, narrower pass). Of those 23, only 6 are cited two or
more times within a note/ccf/text/desc/share field — **the only population method 2 can ever check
at all**, since a citation used exactly once has no sibling mention to compare against.

**Restated as a fraction, not a bare zero: method 2 covers roughly 6–23 of ~139–180 distinct
citations (3%–15%, depending on which extraction pass), and within that covered slice, checked
against the wider (23-identity) extraction, 2 of 6 repeated citations showed an apparent
inconsistency — both cleared on a hand read** (Gerlinger 2012's flag was the already-fixed defect
correctly showing a *different*, correctly-unhedged claim — VHL's regional ubiquity — from the same
paper, not a residual problem; the TCGA/RCC 2013 flag was the hedge-detector false-firing on
"subtype-associated" as a descriptive adjective, not an epistemic hedge). **Net: zero live
instances within the 3%–15% of the corpus this method can see. The other 85%–97% — citations
mentioned exactly once — is not claimed covered by this census and is not measurable by it; catching
drift there requires re-reading the original source, which is Tier 2 work, not a corpus-internal
sweep.** At the low end of that range, this result means what the user predicted it would: the
multiply-cited subset is clean, and no more than that.

## 7. The two-tier model (2026-09-10, user)

**§4's table and §5's feasibility check are the same finding twice: some properties need a reader,
and no gate substitutes, and for statistics specifically the machine path is not currently
reachable at all.** The architecture is two tiers:

**TIER 1 — machine-safe.** A figure reproduced VERBATIM with every qualifier its source attached —
rate, population, data year, stage basis — rendered together, asserting nothing the source didn't.
Precedent already running in this codebase: `extentSentence` (`js/morphology.js`) concatenates
`site`/`siteNote`/`shares`/`basis`/`source`/`ref` unconditionally — no code path can render a share
without its qualifiers. **§5 narrows what can actually populate this tier today: trials, confirmed;
statistics, not yet, pending an API key someone registers for by hand.**

**TIER 2 — reader-required.** Anything interpreted: summarising, comparing across entries, dropping
a qualifier, stating what a number MEANS. Every defect this session found lives here, including the
extent lines §5 just confirmed cannot currently leave it. Stays hand-read, stays small.

**The boundary is checkable:** a rendered figure that has SHED a qualifier its own source record
carried has crossed from Tier 1 into Tier 2 without anyone deciding it should — a check comparing a
`pulled` record's own fields against its rendered sentence's substring content, the same shape
`reserve_check.js` already uses for the extent axis.

**What this implies for the original goal, updated by §5's result:** breadth in Tier 1 was supposed
to mean breadth in statistics. §5 shows the one confirmed-reachable structured feed is trials, not
statistics — so today, Tier 1's breadth applies to trials, and cancer statistics stay Tier 2,
hand-read, small, exactly like everything else this session verified by hand. That is a materially
smaller promise than "authoritative data on a hundred and twenty cancers," and it is the honest one
given what actually answered when asked.

## 8. The sixth field, rescoped to Tier 2 (2026-09-10, user)

`certainty` addresses hedge strength — how definitely a source states an interpretive claim
(`'definitive' | 'suggestive' | 'associative'`). Tier 1 content carries no interpretive claim to
hedge; a statistic is a number. The certainty-drift class — confirmed by §6's census — lives
entirely in Tier 2: hand-authored mechanism prose about what a paper concluded. So `certainty`
belongs on `backfill` records, not `pulled`, checked the way `citation_polarity.py` already
classifies a window's corrective/caveated/clean shape, extended to flag a `backfill` record whose
note states a claim more definitely than its own classified window. Lowest priority of the ordered
steps in §11.

## 9. The epi-pass re-scope, re-read (2026-09-10, user)

**The question: the 2026-09-05 re-scope stopped verifying figures destined to migrate, on the
premise that migration would retire the whole clause. The two-tier model shows that premise is only
half true — the NUMBER retires under a real pull; the SENTENCE around it does not, and the
sentence is where scope drift actually lived.** Read against the manifest's own record
(`_phase2_rescope`, `_uncited_migrating_watchlist`), not re-derived: **report the count, per
instruction — no clause below is read or fixed here.**

**MIGRATING = 55 share clauses total.** ~36 were already verified by 2026-09-05 and are fine —
Tier 2 quality work, unaffected by anything in this document. **~19 were retired unread**,
enumerated by the re-scope note itself: breast ×4, liver-iCCA ×1, ovary ×4, stomach's `gmix` clause
B ×1, "skin's five-clause share," and an unspecified number of "StatPearls rows."

**Of those ~19, 10 already have an owner and a date** — breast ×4, ovary ×4, liver-iCCA, gmix
clause B, the exact ten items on `_uncited_migrating_watchlist`, expiring 2026-10-17. Confirmed
directly against the shipped files: all ten are still bare, uncited, exactly as described six days
ago. **That date's own CONDITION is now stale, not just its content**: it reverts the list to
"source-or-remove" if "Phase B has not landed" by the expiry — but §11 has just settled Phase B's
architecture without landing an integration, and §5 shows the one source most of these ten would
plausibly draw from (SEER, if any are stage/incidence shares) has no confirmed reachable path at
all. "Landed" needs a sharper definition before 2026-10-17 or the expiry will fire on a document
that has genuinely made progress without shipping a byte of integration — flagged, not resolved,
here.

**The remaining ~9 have no date, no watchlist entry, and no declared reason beyond the retired
premise — this is the genuinely unowned population the question was asking about.** One discrepancy
surfaced checking this, reported rather than fixed: "skin's five-clause share" is named in the
re-scope note as retired-unread, but skin.js's shipped melanoma share field currently carries a
citation (NCI) and a subtype breakdown matching the Bradford-2009-derived computation from the skin
pass, which predates the re-scope by more than a week. Either the re-scope note was imprecise about
which skin clauses it meant, or a narrower sub-claim within that share is still unowned — not
determined here. The "StatPearls rows" sub-population has no enumerated list found in the manifest
or this file; its exact count is unknown without reading, which this task explicitly does not do.

## 10. What this document does not decide

- Which specific endpoint(s) statistics would use if SEER access were ever obtained by a person
  registering for a key — not this document's decision, and not attempted here.
- Whether `pulled` is the right name or shape for Tier 1 — proposed, amended twice, still unbuilt,
  and now confirmed to have exactly one reachable use case (trials) rather than the broad statistics
  use case originally assumed.
- The ~9 unowned re-scoped clauses' actual current correctness (§9) — counted, not read.
- Skin's share discrepancy (§9) — surfaced, not resolved.

## 11. Ruling received: architecture settled, feasibility mostly answered (2026-09-10, user)

**The architecture question is CLOSED and should not be relitigated by a future session without new
evidence.** Reviewed versus unreviewed (§1) is the axis. Tier 1 (verbatim + qualifiers, mechanically
bounded) carries whatever content has a reachable structured feed; Tier 2 (interpreted, hand-read)
carries everything else and stays small by design; the shed-qualifier boundary (§7) is the
mechanical check that keeps the two from blurring. This is not provisional.

**The feasibility question, mostly answered rather than left open (§5):** trials — yes, confirmed,
nothing further needed before design. Statistics (SEER) — no, confirmed blocked by this project's
own standing rule, not by a technical gap. PDQ — not found, a softer no. **Consequence stated
plainly: Tier 1's breadth applies to trials today. Cancer statistics stay Tier 2 until a person
obtains SEER API access by hand, which is a decision for Joe, not a task for this session.**

**What follows, in order:**
1. Trials integration is the one candidate with nothing left to check architecturally or
   feasibility-wise — the smallest, safest first Phase B build, whenever building starts.
2. The ~9 unowned re-scoped clauses (§9) get a decision — read, date, or declare — before they age
   further; the discrepancy in skin's share gets a read to resolve which it is.
3. The ten-item watchlist's expiry condition (§9) gets re-worded against what "Phase B has landed"
   now actually means, before 2026-10-17.
4. The sixth field (§8) stays last, lowest priority, scoped to `backfill`/Tier 2.

No detector, no schema file, and no runtime fetch code is touched until 1–3 above have a ruling of
their own.
