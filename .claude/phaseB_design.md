# Phase B: reviewed versus unreviewed, and the provenance schema it depends on (opened 2026-09-10, reframed 2026-09-10, sharpened 2026-09-10, feasibility-tested 2026-09-10, 401-corrected 2026-09-10, user)

Phase A closed with the render side settled: one mechanism built, one ready, one blocked on a
measurement, one empty, one deferred (`phaseA_closeout.md`). The architecture question is
SETTLED (§11): reviewed versus unreviewed (§1), a two-tier render model (§7) with its own
verification gap corrected before being trusted (§4), and a feasibility check run with real
requests, not assumed (§5) — then corrected again when the request itself was found to be weaker
evidence than it was reported as (§12). **Feasibility is now mostly closed rather than open**:
trials, confirmed usable; SEER's coding API, confirmed to serve the wrong content at any account
tier, not merely confirmed blocked; the scraper path SEER's public Stat Facts pages actually
support, priced and proven working (§13); the watchlist, re-derived and made unconditional (§14).

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

## 11. Ruling received: architecture settled, feasibility mostly answered (2026-09-10, user) — SUPERSEDED IN PART BY §12–§17, SAME DAY

**The architecture question is CLOSED and should not be relitigated by a future session without new
evidence.** Reviewed versus unreviewed (§1) is the axis. Tier 1 (verbatim + qualifiers, mechanically
bounded) carries whatever content has a reachable structured feed; Tier 2 (interpreted, hand-read)
carries everything else and stays small by design; the shed-qualifier boundary (§7) is the
mechanical check that keeps the two from blurring. This is not provisional, and nothing in §12–§17
touches it.

**The feasibility question, as it stood at first ruling — corrected the same day, not relitigated,
in §12–§14:** trials — yes, confirmed, nothing further needed before design (unchanged). Statistics
(SEER) — the 401 was read as "confirmed blocked"; §12 shows the API would not have served this
content at any account tier, which is a stronger and different finding. PDQ — not found, unchanged.
**What replaces the original consequence: Tier 1's breadth applies to trials AND, pending a build
decision, to a layout-guarded scrape of SEER's own public Stat Facts pages (§13) — no account
needed for either. Cancer statistics no longer wait on a person registering for SEER API access,
because §12 shows that access would not have helped.**

**What follows, in order, updated from the original four:**
1. Trials integration is still the one candidate with nothing left to check architecturally or
   feasibility-wise — the smallest, safest first Phase B build, whenever building starts.
2. **DONE (§14):** the re-scoped clauses got a decision, not just a date — the ~9 unowned population
   was found to be 2 concretely, the rest not locatable in the corpus; skin's discrepancy is
   resolved (never genuinely unowned); the merged twelve-item watchlist expires unconditionally on
   2026-10-17, cite-or-remove, no downstream trigger.
3. **NEW, from §13's result:** a build decision on the scraper path — whether to wire it into a
   tracked instrument and a real `pulled` fetch, now that it is priced and proven rather than
   hypothetical — is Joe's call, not resolved here (§10's "no fetch code until a ruling" still
   binds).
4. The sixth field (§8) stays last, lowest priority, scoped to `backfill`/Tier 2.
5. **NEW, from §17:** the battery's gate-timing scaling risk is now measured, not just named in
   CLAUDE.md's own invariants section — sizing it precisely and deciding whether the three-run-per-
   commit pattern needs to shrink is Phase C content-model work.

No detector, no schema file, and no runtime fetch code is touched until 3 above has a ruling of its
own.

## 12. The 401 was the wrong evidence for the right question (2026-09-10, user: "a rejected request proves auth, not sufficiency")

**§5's SEER finding was overclaimed.** A 401 proves the endpoint requires an account; it says
nothing about whether the content behind that account is the content this project needs. Checked
directly against SEER's own registrar-facing documentation (`seer.cancer.gov/registrars/api`,
fetched live 2026-09-10) rather than inferred from the 401 body's JSON shape:

> "The SEER API ... is available to developers who wish to incorporate SEER resources into their
> own systems. These resources include databases and tools developed to enhance registry
> operations and quality improvement ... Some of the databases and tools supported by the SEER API
> include: Collaborative Staging; Hematopoietic and Lymphoid Neoplasm Database; NAACCR
> documentation; SEER*Rx — Antineoplastic Drugs Database; SEER Incidence Site Recode."

**Every one of those is registrar coding-reference data** — staging schemas, a disease dictionary,
a drug-code dictionary, a data-standard reference, a site-recode lookup table. **None of it is
stage-at-diagnosis distributions or survival by site.** The usage page's own worked examples
confirm the shape: `rest/staging/cs/.../schemas`, `rest/disease/latest?...`, `rest/ndc/code/...` —
coding lookups, not population statistics. This is decisive independent of the 401: even a
registered, keyed account would not unlock the content Tier 1 needs, because that content is not
served by this API at any tier.

**The real statistics surface is a third, separate thing, and it is heavier than "an account,"
not lighter.** `seer.cancer.gov/data/access.html` (fetched live) describes SEER Research
(Plus) Data — the case-level microdata stage/survival figures are computed from: access requires
either an eRA Commons or HHS account linked to Login.gov, or a lighter individual "Research Data"
registration (still an application, an email-verification step, and signed data-use agreements —
not the "click Login.gov, get a key" framing the API's own usage page implies for its own,
different resource). **And once granted, the data is delivered only through SEER*Stat — "a
Microsoft Windows application," verbatim on the page — not a REST/JSON endpoint of any kind.**
A human runs SEER*Stat, exports a result, and would still have to transcribe it — Tier 2 work
regardless of which door is opened.

**Consequence: the 401 was pointing at a locked door to the wrong room.** The account-cost
objection (real identity verification, a secret to manage, a battery assertion to keep it out of
the tree) never had to be weighed against this API, because paying it would not have bought
stage-at-diagnosis or survival content either way. Confirmed by reading, not by another request —
no second live probe was needed once the documentation named what each surface actually serves.

**Cancer Stat Facts — the surface already in use — is a fourth, distinct thing from all three
above,** and is the only one of the four that is public, unauthenticated, and currently reachable:
a pre-computed summary-statistics publication, not an API and not the restricted microdata. §13
prices whether it can be treated as Tier 1's structured source in place of an account it turns out
would not have helped anyway.

## 13. The scraper path, priced and proven (2026-09-10, user: "I'd try that before the key")

**Built and run against all fifteen already-cited SEER Stat Facts pages** (`/tmp/ca-seer-statfacts-
scraper.py`, scratch, not committed — pricing exercise, per §10's standing "no fetch code until a
ruling" rule) plus the one uncharacterised page (testis, which the corpus already records as
carrying no distribution).

**The page template is stable and was designed to be scraped — literally.** Every page carries
`<table id="scrapeTable_02">` inside a `<div class="statWrap survival-factSheet">` block, headed
`<strong class="title">Percent of Cases &amp; 5-Year Relative Survival by Stage at Diagnosis:
<name></strong>`, three columns (`Stage`, `Percent of Cases`, `5-Year Relative Survival`), one row
per stage drawn from a closed five-word vocabulary (`In Situ`/`Localized`/`Regional`/`Distant`/
`Unknown`), followed by a `<p class="footnote">` naming the SEER basis string. The table's own `id`
prefix ("scrapeTable") is the page author's, not this project's.

**The layout assertion refuses rather than guesses, at eight distinct points**: the wrapper div
missing, the title string not matching the expected form, the table id absent from the located
block, the header row not matching the exact three expected column names, a stage row not opening
with the closed vocabulary, a percent/survival cell not parsing as `N%`, the parsed shares not
summing to 99–101, and no SEER-attributed footnote inside the block. **Demonstrated on five
constructed negative controls, not asserted**: a renamed column, a reordered pair of columns, a
renamed stage label, shares no longer summing to 100, and the table's own `id` changed — all five
raised the refusal, none produced a silent wrong parse.

**Result: 15 of 15 real-distribution pages reproduce `morphology.js`'s hand-transcribed `shares`
exactly**, to the percentage point, across every stage category including bladder's five-row
in-situ case — this is a live cross-validation of the fifteen already-shipped extent lines, not a
new unverified pull. The sixteenth (testis) correctly reports no table present, matching the
existing `status:'uncharacterised'` entry. **A capability this project has never modeled came out
for free**: the same table carries 5-year relative survival by stage, on the same public page, no
account, no additional request.

**No CORS header on any Stat Facts page** (checked live with an `Origin` header set) —
confirmed this can only ever be a build-time mechanism (a script run by a human, output committed),
never a client-side fetch from the deployed GitHub Pages app. This matches, rather than changes,
the architecture already settled in §7/§11: statistics were always going to be build-time.

**Cost, stated against the API path it replaces:** the scraper (design, build, five negative
controls, a full run against all fifteen pages) cost roughly an hour of this session, needs no
account, no Login.gov identity verification, no secret to keep out of the tree, and no battery
assertion built to guard that secret. The API path — even setting aside §12's finding that it
would not have served this content at all — additionally required a human to create a Login.gov
identity, manage a bearer credential, and accept a permanent addition to the battery's threat
surface. **On both fronts — feasibility and cost — the scraper wins outright, and the API
comparison is now moot rather than merely expensive**, per §12.

**Real, disclosed limitation:** the scraper is validated only against the fifteen pages this
project already cites; a sixteenth cancer's Stat Facts page could carry a real layout deviation
this design has not seen (Stat Facts covers roughly sixty sites total, most unused by this atlas
today). The refusal-on-mismatch design means a future deviation fails loudly rather than silently —
exactly the property §2's original ask required — but "loud failure" is not the same claim as
"tested on every page it would ever touch."

**Not built in this pass, on the standing rule:** a tracked `.claude/` instrument, a cache/refresh
cadence, a `pulled`-schema wiring, or any commit-time or runtime fetch. This is feasibility
evidence for a ruling, not an integration.

## 14. The watchlist rewritten: merged, corrected, and made unconditional (2026-09-10, user)

**The expiry's condition depended on "Phase B has not landed," which was always the wrong trigger**
— §9 already found it stale; this round replaces it rather than re-wording it. Struck outright,
for two independent reasons, not one: the two-tier model means a structured pull was never going to
retire the sentence around these figures even if SEER became reachable (§7); and §12 now shows the
one plausible structured source for subtype/share content isn't behind the SEER API at any account
tier regardless. **Rule now: on 2026-10-17 (date unchanged — only the condition attached to it was
wrong), every listed item is cited from a real source or removed from the served page,
unconditionally.** No downstream trigger, nothing to re-read for ambiguity next time.

**Re-deriving the list's membership, not just its rule, because the count needed checking too.**
The 2026-09-05 note's "~19 unread clauses" named six groups; ten of them (breast×4, ovary×4,
liver-iCCA, stomach's `gmix` second clause) are the existing watchlist and were re-confirmed still
bare against the live files just now. The other two named groups do not hold up as named:

- **"Skin's five-clause share" is not an orphan and was never genuinely one.** Read directly:
  `skin.js`'s melanoma `share` field is extensively and specifically cited — NCI, Bradford et al.
  (2009, SEER-17-derived), CONCORD-3, and StatPearls with a named chapter — matching CLAUDE.md's
  own data rule 20 verbatim. That citation pass predates the 2026-09-05 re-scope note by more than
  a week. **This is the discrepancy the prior message surfaced and left open; resolved here: the
  re-scope note was wrong when it was written, not stale afterward** — a bookkeeping miss at
  authoring time, the same shape as this session's own "~19" tildes doing real work.
- **"StatPearls rows" resolves to exactly two, not nine.** A corpus-wide search for every `share`
  field mentioning StatPearls at all (five hits total) found three already fully cited with a named
  chapter or an explicit no-figure-claimed disclaimer (`colon.js:28`, `pancreas.js:29-30`) and
  **two genuine bare citations with no resolvable identifier** — `skin.js:59` (SCC) and `skin.js:60`
  (MCC), each tagged only `(StatPearls)` with no chapter title, PMID, or NBK number. No other
  bare-StatPearls share row exists anywhere in `js/organs/*.js`.

**The corrected list is twelve items, not nineteen, and the gap is reported rather than forced to
match the old estimate**: the original "~19" cannot be reconciled to a locatable population beyond
these twelve. Most likely the 2026-09-05 count was itself a wideband guess — consistent with this
project's own repeated finding that a predicted count is usually wrong about magnitude even when
the underlying judgment is sound. **`.claude/citations.json`'s `_uncited_migrating_watchlist` is
rewritten in place** with the merged twelve, the correction narrative, and the unconditional rule;
`_phase2_rescope`'s own pointer to it is updated to match. The record-sync pair guarding this
watchlist (`record_sync_check.py`, keyed on the literal string `'2026-10-17'` occurring exactly
once in CLAUDE.md) is unaffected — the date did not change, only the manifest's prose around it.

## 15. Certainty drift, ranked rather than sampled (2026-09-10, user: "rank every clause ... read the top of that list first")

**Population: every `note`/`ccf`/`text`/`desc`/`share` field in `js/organs/*.js` carrying at least
one unhedged strong/mechanistic verb (found/shows/demonstrates/confirms/establishes/causes/
drives/leads-to/proves) and zero matches against a hedge-word list (suggests/proposes/may/might/
possibly/potential/putative/implicat-/associat-/consistent-with/read-as/appears-to/likely) — 58 of
428 total fields.** Ranked by count of distinct strong-verb families present, ties broken by file
order. This is a prioritization, not a coverage claim: it orders a fixed, already-written corpus
for a human read, and says nothing about the far larger population of hedged or citation-free
prose (out of scope for this method by construction).

**Read down to roughly the top two-fifths of the ranked list (all of strength ≥2, plus about
seventeen of the strength-1 tier — the ones each carrying a real external citation, since drift
needs a source to drift from) — 24 of 58, an explicitly bounded read, not the full list.**

**Yield: one real, live drift instance, found and fixed.** `liver.js:280`'s TERT note said the
mutation was "the earliest known genetic event in this disease's progression" — Nault et al.
(Nature Communications, 2013) says "the earliest recurrent genetic event identified in cirrhotic
preneoplastic lesions **so far**." The atlas's paraphrase quietly dropped "so far," turning the
source's own dataset-scoped, provisional superlative into a flatter, permanent-sounding one — a
real instance of the addendum's own named form ("established" for "identified... so far"). Fixed
in place, restoring the qualifier in the source's own sense, and it is the only defect this read
found in an otherwise unusually careful paragraph (the same note explicitly states a 39–61%
cross-cohort range and computes its HCV/HBV split directly from raw counts rather than trusting a
secondhand percentage).

**Two of the ranking's own top hits are false positives, and that is itself a usable finding about
the instrument.** `thyroid.js:261` (ATM) and `thyroid.js:263` (KMT2D) both scored at the top of the
list — and both already carry their own explicit hedge, in-field, in language my word list does
not match: *"the GENIE registry establishes that ATM mutations recur in this cancer, not that they
drive it — no functional study of their role in FTC was found here."* A negation ("not that they
drive it") and an explicit absence statement ("no functional study... was found") are hedges in
substance that no fixed word list can catch by pattern alone — the same shape as this project's
own polarity guard's stated limit on negated mentions. Recorded as a calibration finding about the
ranking, not corrected away: a future re-run of this method should expect this exact false-positive
shape at its top and read past it, not tune the word list to chase two instances.

**Everything else read (22 of the 24) was faithful** — several were direct quotations (faithful by
construction), several matched already-verified language recorded in CLAUDE.md's own data rules,
and two were sites of certainty-drift defects already found and fixed in earlier ccf batches this
project ran (`ovary.js:269`'s Chao 2024 wording, `prostate.js:230`'s Taylor/TCGA attribution),
confirmed still correct post-repair rather than re-broken.

**Stated as instructed, not smoothed over: this prioritizes, it does not cover.** One live defect
in 24 read, against a corpus of 428 fields, is not a corpus-wide drift rate — it is the yield of
reading the 24 clauses this method judged most likely to carry one, and 34 more of the ranked 58
were not read this round.

## 16. Why no record-sync check caught the skin.js discrepancy (2026-09-10, user)

**Checked directly against `record_sync_check.py`'s own declared-pairs list, not inferred from what
the tool is named.** Exactly one declared pair touches this watchlist at all:
`('_uncited_migrating_watchlist', 'CLAUDE.md', '2026-10-17')`. Its mechanism is narrow and
specific: it asserts the literal string `'2026-10-17'` occurs **exactly once** in `CLAUDE.md` — a
guard against the date being restated and drifting from itself, the same "machine-derivable-number"
discipline this project applies everywhere else. **It does not read, parse, or check anything about
which items are on the list, whether they are still uncited, or whether the list's claims match any
organ file's actual content.** No other instrument in the battery does either — `citation_crosscheck`
checks a citation record's own metadata against its resolved identifier; `duplicate_figure_check`
compares same-file string pairs; `absence_claim_check` scopes unscoped-absence language; none of
them is built to check a free-text manifest note's enumerated claims about the corpus against the
corpus itself.

**The honest answer is a gap, not a bug**: this class of check — "does a natural-language claim
about which items still lack a citation match reality" — has no instrument anywhere in this
project, and building one generally would mean parsing free prose into a checkable claim, which is
a much larger undertaking than this task's scope. **Considered and left undone, not merely
deferred without a reason**: the specific instance is resolved directly in §14 (the watchlist is
re-read and corrected, not guarded), and the watchlist itself — the one place this exact defect
could recur — now expires unconditionally on 2026-10-17, which bounds how long a second instance of
the same mistake could stand before the mechanism's own expiry forces a re-read regardless.

## 17. Gate timing, sized against Phase C before it arrives as a surprise (2026-09-10, user)

**Measured, not estimated**, on this repo's own instrumentation: a single `regress.js` run under
`.claude/battery.py` currently accounts for the large majority of a ~13–15 minute battery pass — the
other fifteen instruments are static-analysis scripts over text files and complete in seconds.
This round alone ran the battery three times (a standalone settle, the gated commit's own re-run,
and the clean-worktree verification before the push grant) for a combined round-trip near the
~30-minute figure named in the standing-gates message.

**`regress.js` loops per organ and per cancer** (hotspot/marker checks per organ, site/label/cell/
histology checks per cancer, exactly as CLAUDE.md's own SMALL-POPULATION INVARIANTS section already
flagged: "the regression loops per cancer, so the five-minute gate scales with the corpus"). Today's
loop covers 14 organs and 16 cancers; Phase C's target is roughly 120 cancer entries and however
many additional organs that requires — **a roughly seven-fold increase in the looped population**,
against a fixed per-instance cost (browser launch, page navigation, per-site rendering) that does
not currently amortize.

**A literal linear extrapolation is not the right number to report, and is not reported as one**:
some of `regress.js`'s cost is fixed overhead (one browser launch, one page load) rather than
per-cancer, so the true scaling is sub-linear in the loop but still grows with the corpus, and this
session has no measurement isolating the fixed cost from the per-cancer cost to extrapolate
precisely. **What is measured and stated plainly: the current three-runs-per-commit pattern this
session has used throughout already costs ~30–45 minutes at 16 cancers, and Phase C's own breadth
target is the thing that would make that number substantially worse, arriving exactly where
CLAUDE.md's own invariants section predicted it would** — this is that hazard's first real
measurement, not a new finding. Sizing the fixed-vs-per-cancer split precisely, and deciding
whether the three-runs-per-commit pattern itself needs to shrink (e.g., skipping the standalone
settle when the gated commit's own run already proves the same tree), is Phase C content-model
work, not resolved here.
