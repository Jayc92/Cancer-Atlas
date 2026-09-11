# Phase D: clinical trials integration — design document before code (opened 2026-09-10, user)

**Why trials, and why now, ahead of the rest of Phase B.** It is the one source confirmed both
available and sufficient (`phaseB_design.md` §13: ClinicalTrials.gov v2, a live 200, clean JSON, no
account, no key) — the SEER statistics path is closed at the account level and priced-but-unbuilt
at the scraper level (`phaseB_design.md` §13, §19), so trials is the only Tier-1-shaped content with nothing left to
check before design starts. It is also runtime, bounded-assertion content by the architecture
already settled (`phaseB_design.md` §1): unreviewed content permitted, bounded by its own
declaration, the same shape the roadmap named years before this session touched it — "TRIALS carry
a different duty of care... THE HANDOFF IS THE POINT... Framing designed BEFORE the integration"
(CLAUDE.md, Phase D roadmap entry). This document is that framing. **No fetch code, no UI
component, and no schema field for trials is touched until this document has a ruling**, per the
standing rule every prior design document in this project has followed.

## 1. The condition-mapping problem, designed first because it is where this breaks

**The risk, stated plainly:** an atlas entry does not share a vocabulary with ClinicalTrials.gov's
own condition tagging. A wrong mapping does not fail loudly — it shows a reader trials for a
different disease, framed with this app's own authority, which is worse than showing none. **Do
not derive the query from the entry's display name by string match** — confirmed necessary by real,
live queries, and the sample was re-drawn a second time (2026-09-11) specifically to answer a
question the first round left ambiguous: the corpus moves, and the second draw proved it rather than
merely asserting it (§1a below).

**THE 8TH ccRCC RESULT, NAMED (answering the question left open, not left inferable): "CD70-targeted
immunoPET Imaging of Kidney Cancer," conditions `['Urologic Neoplasms', 'Urogenital Neoplasms',
'Kidney Neoplasms', 'Neoplasms']`.** These four conditions are hierarchical umbrella terms for the
SAME kidney/urologic disease family — not a basket trial listing several different specific cancer
types the way the gdiff false match (below) does. It is a same-organ, same-disease-family
broadening (kidney cancer in general, not clear-cell RCC specifically), never a cross-domain
wrong-disease match.

**7/8 IS THE RAW READ-BACK COUNT OF PRECISELY ON-SUBTYPE RESULTS; IT IS NOT THE ACCEPTED RATE, AND
THE TWO MUST NOT BE CONFLATED.** Seven of the eight name "Clear Cell Renal Cell Carcinoma" precisely
or tag the broader-but-correct "Renal Cell Carcinoma"/"Renal Cancer" (correct since ccRCC is
~75–80% of RCC per this app's own kidneys.js citation). The eighth is the CD70 trial above — broader
still, but never a different disease. Under this document's own acceptance rule (step 5, unchanged
below): a mapping is accepted when the sample is clean OR the only drift is a named, reasoned
broadening. The CD70 case is exactly that shape, so **the accepted rate is 8 of 8 on the property
that actually matters — zero wrong-disease matches — with 1 of 8 disclosed as a modest, same-family
broadening, not a defect requiring a narrower query.** Reporting "7/8" without this distinction would
read as a failure rate; it is a precision figure inside an otherwise fully-accepted mapping.

**A basket trial that genuinely includes the target disease among several conditions is a different
thing from a wrong-disease match — confirmed on a THIRD live case, today, not just asserted.** The
2026-09-11 re-draw of the ccRCC query (§1a) turned up NCT05856981, "Phase 1 Study Evaluating the
Safety and PK of ADU-1805 in Advanced Solid Tumors," a multi-condition basket trial whose own
`conditionsModule.conditions` list — alongside colorectal, NSCLC, and endometrial cancer — names
"RCC, Clear Cell Adenocarcinoma" explicitly. This is not a drift and not a collision: the study's own
structured data says it treats clear-cell RCC. A basket trial genuinely listing the target disease
passes; a trial that matches only via an unrelated keyword collision, with no genuine target-disease
tag anywhere in its own conditions, does not. §1b below is what tells the two apart mechanically.

**§1a. THE CORPUS MOVES — MEASURED, NOT ASSUMED, BY RE-DRAWING THE SAME QUERY A DAY LATER.** The
2026-09-11 re-draw of `query.cond=clear cell renal cell carcinoma` returned an EIGHT-STUDY SET WITH
ZERO NCT-ID OVERLAP against the 2026-09-10 set recorded above — not a reordering, a different corpus
slice entirely (no CD70 trial in today's draw at all; today's eighth-ranked concern is a different
shape, covered in §1b). This is the direct, first-hand confirmation of the architectural point raised
about this section: a one-time verification of query quality checks today's corpus and says nothing
about tomorrow's. The fix is not a better one-time check — it is moving the guard to where it can run
on every fetch, forever, against whatever the corpus looks like on the day. That is §1b.

**§1b. THE QUERY IS NOT THE GUARD — THE RETURNED CONDITIONS ARE.** A query string, however carefully
chosen, only ever describes what was ASKED FOR; a collision (the gdiff "diffuse" case below) or a
registry re-tagging can make it return something else, on any given day, for reasons that have
nothing to do with query wording. What is checkable, on every fetch, against a moving corpus, is what
each RETURNED STUDY'S OWN `conditionsModule.conditions` actually says. The architecture changes from
"verify the query once, trust every future result" to a **standing fetch-time filter**: for every
study a query returns, check whether at least one of that study's own declared conditions names the
entry's disease family; keep it if so, drop and count it if not. This is a structural check that
survives however far the corpus moves, because it never trusts the query — it re-derives relevance
from the one field CT.gov itself uses to say what a study is about, on every single fetch.

- **The filter is a small, per-entry keyword set, not a re-derivation of the query.** `ccrcc:
  ['renal', 'kidney', 'rcc']`; `gdiff: ['gastric', 'stomach']` — organ/disease-family terms, matched
  case-insensitively at a WORD BOUNDARY (the `pointer_check.py` scar applies here too: an unboundaried
  2-3-character needle collides with ordinary English; these are real multi-character medical terms,
  boundaried the same way regardless of length). A study passes if ANY of its own conditions contains
  ANY keyword; it is dropped and counted otherwise.
- **Subtype specificity is deliberately NOT in the keyword set**, for the same reason it was dropped
  from the query below: the registry does not tag by clear-cell-vs-other RCC or by Lauren
  classification at the condition level, so requiring it would under-match everything, not just the
  bad cases.
- **The trade this makes is disclosed, not hidden: a real trial with an uninformative condition tag
  gets dropped too, and that is the correct default, not an unhandled edge case.** Today's 2026-09-11
  ccRCC draw contains NCT07680556, "Promoting Response to IMmunotherapy by Exercise in Patients With
  Advanced Renal Cell Carcinoma" — unambiguously on-topic by title — tagged with the single condition
  `['Oncology']`, which the keyword filter does not match. The filter drops it. This is a FALSE
  NEGATIVE on a real, live case, not a wrong-disease catch, and it is named as exactly that rather
  than folded into a success count. The asymmetry is deliberate: this project has repeatedly chosen
  the failure direction that cannot silently show something wrong over the one that occasionally
  omits something right (the status include-list in §3 makes the identical choice for the identical
  reason) — a dropped real trial costs a reader nothing they would have known to look for; a shown
  wrong-disease trial costs them trust in every trial the page ever shows. **This is also why the
  drop count is reported, not silently absorbed** (§1c): a filter that drops real trials needs its
  drops visible so a maintainer can tell "the mapping is noisy" from "the mapping is broken."
- **Condition (7), both directions, demonstrated rather than assumed working:** the 2026-09-11 ccRCC
  live draw provides the real, non-fixture drop above (NCT07680556 — a false negative, not a
  wrong-disease catch, honestly labeled as such). Neither live sample drawn today happens to contain a
  genuine wrong-disease study once condition CONTENT is checked instead of query mechanism (§1c
  reconsiders the gdiff case on exactly this point and finds it, too, passes on content grounds) — so
  the TRUE-POSITIVE catch (a study with no genuine target-disease tag anywhere in its conditions) is
  demonstrated on a planted synthetic fixture instead, verified against the real filter function
  before it shipped: a fabricated study object carrying only `['Diffuse Astrocytoma, IDH-Mutant',
  'Glioblastoma, IDH-wildtype', 'Brain Metastases, Adult']` — no gastric/stomach keyword anywhere — is
  correctly dropped by the gdiff filter, while the same fixture with `'Gastric Cancer'` appended is
  correctly kept. Both directions checked on the same fixture pair, the way this project's own
  Convention F requires: a plausible-but-wrong input, not only a broken one.

**§1c. THE GDIFF "FALSE MATCH" IS PARTIALLY RETRACTED — re-examined under the sharper standard §1
now states for ccRCC, and the retraction is recorded because it changes what the fetch-time filter is
credited with catching.** NEO212's own `conditionsModule.conditions` — re-fetched live, 2026-09-11 —
reads: `['Diffuse Astrocytoma, IDH-Mutant', 'Glioblastoma, IDH-wildtype', 'Brain Metastases, Adult',
'Cervical Cancer', 'Colorectal Cancer', 'Esophageal Cancer', ..., 'Gastric Cancer',
'Gastroesophageal Junction Adenocarcinoma', ..., 'Renal Cell Carcinoma', ...]`. **"Gastric Cancer" is
genuinely, structurally present in this study's own declared conditions** — the identical tag form
("Gastric Cancer") the six "clean" gdiff results below are credited as on-topic for, since the
registry does not tag by Lauren subtype at the condition level for ANY of them. There is no
principled basis for treating "Gastric Cancer" as real evidence of relevance in six studies and as
noise in a seventh; the tag is the tag. **Under a fetch-time filter that checks conditions rather
than distrusting the query mechanism, NEO212 is KEPT, not dropped** — it is a basket trial that
genuinely lists the target disease among many, structurally identical in kind to the ccRCC ADU-1805
case in §1 above, not a wrong-disease match.
**What was really wrong, restated precisely:** not that NEO212 fails to treat gastric cancer (it
doesn't fail — it's declared), but that the ORIGINAL verification trusted the QUERY MATCH MECHANISM
("this surfaced because of the word 'diffuse'") rather than checking the RETURNED CONDITION DATA
directly. In this specific instance content-checking and query-mechanism-suspicion happen to reach
different verdicts, which is exactly the case for building the filter on content rather than
mechanism — a fetch-time filter does not need to know or care why a study was returned, only what it
declares itself to be about. **One live design refinement this correction motivates, not a rejection
of NEO212's inclusion:** a basket trial whose own `briefTitle` does not mention the reader's condition
(NEO212's does not say "stomach" or "gastric" anywhere in its title) can read as confusing on a
listing card even when its inclusion is correct — addressed as a display concern in §4/§9, not as a
reason to drop it.
**The 2026-09-11 re-draw of the corrected query (`gastric adenocarcinoma`, no "diffuse") returned
studies whose conditions are unchanged in kind from the 2026-09-10 read** — NCT07714538 lists
`'Gastric Adenocarcinoma'` directly, and every other result in the fresh draw ties to a
gastric/esophagogastric tag — so the corrected query's own on-topic finding stands; only the
characterization of the ORIGINAL query's one flagged result changes.

**The design, following from all of this:** the mapping is **per-entry, explicit, and recorded** —
not computed from `name` or `share.site` at runtime, and now carries the fetch-time filter's own
keyword set alongside the query. Candidate shape, revised:

```
TRIALS_CONDITION_MAP = {
  ccrcc: { query: 'clear cell renal cell carcinoma', conditionKeywords: ['renal', 'kidney', 'rcc'],
           verifiedDate: '2026-09-11', sampleSize: 8, onTopic: 7,
           note: '1/8 broader (kidney cancer generally, CD70 imaging trial), a named reasoned '
                 + 'broadening, not a wrong-disease match; accepted at 8/8 on zero-wrong-disease' },
  gdiff: { query: 'gastric adenocarcinoma', conditionKeywords: ['gastric', 'stomach'],
           verifiedDate: '2026-09-11', sampleSize: 6, onTopic: 6,
           note: 'dropped "diffuse" after it collided with an unrelated neuro-oncology basket '
                 + 'trial\'s condition tag via query keyword match; re-examined under the '
                 + 'fetch-time filter and found the same trial passes on condition CONTENT (it '
                 + 'genuinely lists Gastric Cancer) — the registry does not tag by Lauren '
                 + 'classification at the condition level' },
  ...
}
```

**The verification method, reported before being built into anything, per instruction — and
already demonstrated live, repeatedly, above, not just described:**

1. Build the candidate query from the entry's actual disease biology (organ + histology), not its
   display string.
2. Fetch a real sample against ClinicalTrials.gov v2 (`query.cond`, `filter.overallStatus`,
   a fixed page size — 6–10 is enough to catch a collision without over-reading; every test above
   used exactly this size).
3. Read every returned study's own `conditionsModule.conditions` list and `identificationModule.
   briefTitle` back against the atlas entry — by a human, not by a second keyword match (a second
   regex would share the first one's blind spot) — to choose the entry's `conditionKeywords` set.
4. Record: entry id, query string, keyword set, sample size, on-topic count, and — critically —
   **name every off-topic or borderline hit and why**, not just a pass/fail ratio (the ccRCC drift
   and the gdiff collision are different in KIND, and collapsing them to a ratio would have hidden
   which one was the dangerous shape).
5. A mapping is accepted when the sample is clean or the only drift is a named, reasoned
   broadening (ccRCC's shape); a cross-domain false match (a study with no genuine target-disease
   tag anywhere in its own conditions) means narrow or change the query and re-verify, not accept
   with a caveat.
6. **The keyword set, once chosen, becomes a STANDING fetch-time filter (§1b) — re-verification is
   no longer a cadence-dependent human re-read of a sample, it is a mechanical check that runs on
   every fetch, forever, against whatever the corpus looks like that day.** This replaces, rather
   than supplements, the original "re-verify on a cadence" plan: a human sampling pass could always
   miss the one result that matters on a day nobody re-checked; a standing filter cannot, because it
   checks all of them, every time.

**§1d. The drop count is the mapping's own quality signal, reported per entry, not silently
absorbed.** Every fetch logs and displays how many returned studies were dropped for lacking a
matching condition keyword, alongside how many were kept. A mapping producing many drops relative to
its total is a mapping whose query or keyword set needs rewriting — the count is diagnostic evidence
about the MAPPING, generated by ordinary use, not a number a maintainer has to go looking for.

**Sixteen entries is enough to prove the pattern (per the user's own framing); the remaining
fourteen mappings are NOT built here** — two were run live to validate the method itself, which is
what this section owed before anything is built. Building the other fourteen, and deciding what
"verified" means at Phase C's ~120-entry scale, is implementation work for whenever a ruling opens it.

## 2. The three duty-of-care constraints, pre-committed as design, not as a detector

**Runtime content cannot be gated by any detector after the fact** — a fetched trial listing is
never battery-checked the way a `share`/`ccf` string is, so the bounding has to be structural,
decided now, not policed later.

- **Eligibility is not conveyable.** The UI shows study title, phase, recruitment status, and a
  direct link to the study's own ClinicalTrials.gov page — never a summarized or reproduced
  eligibility criterion. Eligibility text on the real API (`eligibilityModule.eligibilityCriteria`)
  routinely runs to full paragraphs of inclusion/exclusion logic; summarizing it risks implying a
  simplicity that isn't there, which is exactly what "the UI must not imply a listed trial is
  available to the reader" forbids. Fixed copy near the list, not just in a tooltip: *"Eligibility
  criteria are specific and detailed — read the full listing before assuming you qualify."*
- **No ranking by apparent promise.** Sort key is **`lastUpdatePostDate` descending** (most recently
  updated first) — a real, available field (`statusModule.lastUpdatePostDateStruct.date`, confirmed
  in the live response above), neutral with respect to phase, sponsor, or apparent efficacy, and
  meaningfully informative on its own (a trial nobody has touched in years reads differently from
  one updated last month, without the app asserting anything about WHICH is more promising). Stated
  on the page, not left implicit: *"Listed by most recently updated, not by relevance or likelihood
  of benefit."* No phase-based grouping, no "featured" trial, no sponsor-name styling that reads as
  endorsement.
- **The handoff is the point.** Page framing addresses the reader's next action directly:
  *"Bring this list to your oncologist — they can help you understand whether any of these might be
  relevant to your specific situation."* Not "apply here," not "you may be eligible," not a call to
  action toward the trial itself. The design goal is a reader arriving at a real conversation with
  informed questions, stated on the page in those terms.

## 3. Status and staleness are correctness, not polish

**Filter AND display — never one alone.** Query with `filter.overallStatus` restricted to an
INCLUDE-list of the open-shaped values — `RECRUITING`, `NOT_YET_RECRUITING`,
`ENROLLING_BY_INVITATION` — never an exclude-list against `COMPLETED`/`TERMINATED`/`WITHDRAWN`/
`SUSPENDED`/etc., because an include-list fails safe against an enum this document has not fully
enumerated (a live sample of 100 real studies this session found `ACTIVE_NOT_RECRUITING`,
`APPROVED_FOR_MARKETING`, `COMPLETED`, `NOT_YET_RECRUITING`, `NO_LONGER_AVAILABLE`, `RECRUITING`,
`TERMINATED`, `UNKNOWN`, `WITHDRAWN` — nine distinct values in one sample, and an unlisted tenth
value defaults to EXCLUDED under an include-list, INCLUDED under an exclude-list; the include-list
is the direction that cannot silently show a closed trial as open). **The filter is not trusted
alone**: every listing also displays its own `overallStatus` text, because the fetch happens at a
moment the filter cannot re-verify later — a page left open, or a cached response, could show a
status that has since changed. Filter narrows what's fetched; display is what keeps a reader from
trusting a fetch that's already gone stale by the time they read it.

**The fetch timestamp is shown on every listing set**, not buried: *"Trials shown as of [date/time
of fetch]."* This is the same discipline `phaseB_design.md` §19 specifies for statistics (a visible staleness
indicator, not a silent one), applied to content that goes stale far faster — a trial's recruitment
status can change week to week, not year to year.

## 4. The failure mode, specified before the success path

**"No trials found" and "we couldn't ask" must be visually distinct, decided now, because bolting
this on later means it was never distinct.** Four states, not two:

- **LOADING** — a fetch is in flight; no claim yet.
- **RESULTS** — one or more trials returned; the ordinary case.
- **EMPTY, ANSWERED** — the fetch succeeded and returned zero open trials for this condition. A
  real, meaningful answer: *"No open trials are currently listed for this condition."* This is
  information, not a failure.
- **EMPTY, UNANSWERED** — the fetch failed, timed out, or the API is unreachable. *"We couldn't
  reach ClinicalTrials.gov just now — try again, or search directly at clinicaltrials.gov."* A
  direct link out, since the reader's actual need (find a trial) doesn't stop just because this
  app's fetch did.

**These two empty states get different visual treatment** (a distinct icon or tone, not merely
different copy in the same box), because a reader skimming should register "nothing exists" and
"something's broken" as different situations without reading closely — exactly the same shape as
this project's own standing rule, already written down once and now applied a second time:
**measured catastrophe versus failed-to-measure** (CLAUDE.md: `deploy_check.js`'s own probe-failure
distinction — "the app did not initialise in the harness... not a finding about the app" — is the
precedent this UI state design borrows directly. A trials fetch that fails is a probe failure, not
a finding about the disease; conflating them here would repeat the exact mistake that rule was
written to retire there.

## 5. Location handling, decided and recorded rather than left implicit

**Decision: IGNORE geographic filtering and geographic display, for this build.** Reasoning, not
just the verdict:

- **Scale makes per-trial display impractical, confirmed with a real number, not assumed.** One
  real study sampled this session (`NCT07227415`) carries **128 site locations** in its own
  `contactsLocationsModule.locations` array. Displaying even a truncated location list per trial
  adds real UI weight to every listing for a benefit ("is there a site near me") the reader can get
  faster by opening the trial's own ClinicalTrials.gov page, which already has a proper location
  finder.
- **This app has no existing permission-request pattern to extend.** No feature anywhere in this
  static, backend-free, account-free app asks for a browser permission; geolocation would be the
  first, and it would be introduced for a feature whose own "handoff is the point" framing (§2)
  already sends the reader to a human conversation before location would matter enough to filter on.
- **Consequence for what the interface still needs to convey**: this decision means location is a
  property of the DESTINATION (the trial's own listing page), not of this app's UI — the trials
  page can be honest about that ("this list doesn't filter by location — open a listing to see its
  sites") rather than silently omitting something a reader might expect to see filtered.
- **Revisit trigger, stated so it isn't re-litigated from scratch**: reconsider only if a future
  pass adds ANY other browser-permission-gated feature to this app, at which point geolocation for
  trials stops being the first exception and the calculus changes.

## 6. What this document does not decide

- The other fourteen entries' condition mappings — two were run live to validate the method; twelve
  remain to be built and verified the same way, whenever building starts.
- The exact component/rendering approach for the four UI states in §4 — specified as states, not as
  markup.
- Whether trials integration is CLIENT-SIDE fetch (this API sends no CORS headers were never
  checked for this specific endpoint — unlike SEER Stat Facts in `phaseB_design.md` §13, this has not been tested) or
  requires the same build-time-only treatment statistics needed. **Open, and load-bearing**: if
  ClinicalTrials.gov also lacks permissive CORS, trials cannot be a live runtime fetch from the
  deployed GitHub Pages app either, and the "runtime, bounded-assertion" framing throughout this
  document would need to mean "re-fetched at build time on a short cadence" rather than "fetched
  live in the reader's browser" — checked below, before this document closes, precisely because it
  changes what "runtime" has meant everywhere else in this document.

## 7. The CORS check §6 flagged, run before closing this document

**Checked live, not left as an open question the way §6 first drafted it.** Same method as
`phaseB_design.md` §13 used for SEER: a real request carrying an `Origin` header naming this app's
deployed domain, read for `Access-Control-Allow-Origin` in the response.

`curl -sS -D - -o /dev/null -H "Origin: https://jayc92.github.io" "https://clinicaltrials.gov/api/v2/studies?query.cond=cancer&pageSize=1"`
returns `access-control-allow-origin: *` — **permissive, unlike SEER.** ClinicalTrials.gov's v2 API
sends a wildcard CORS header, confirmed on a live response, not assumed from the API being public.

**Consequence: trials CAN be a genuine client-side runtime fetch from the deployed app**, which is
what "runtime, bounded-assertion content" meant everywhere above and is now confirmed rather than
assumed. This is the one place this document's own architecture depends on a fact that could have
gone the other way — recorded here rather than left for whoever builds this to discover by a failed
fetch in production.

## 8. Ordered next steps

**RULED 2026-09-11 (user): build, with §1 amended first** — the condition-mapping method, the three
constraints, status/staleness handling, the failure-mode states, and the location decision are
approved as designed above, with two changes settled before code: the ccRCC/gdiff read-back is
corrected and sharpened (§1), and the guard moves from one-time query verification to a standing
fetch-time filter on returned conditions (§1b), reported per-entry by its drop count (§1d).

1. **DONE (this ruling):** the §1 amendment — the 8th ccRCC result named and the raw/accepted
   distinction settled; the gdiff NEO212 characterization corrected under the sharper standard; the
   fetch-time filter designed, keyworded, and demonstrated (a real drop, a synthetic wrong-disease
   catch); the `TRIALS_CONDITION_MAP` shape revised to carry `conditionKeywords`.
2. Build: fetch code + fetch-time filter + the four §4 states + the §2/§3 duty-of-care copy and
   status/staleness display + §6's location-ignore framing, for the two validated entries (ccrcc,
   gdiff) — proving the pattern end to end, not just the mapping in isolation.
3. **NOT built in this pass, still deferred:** the remaining fourteen entries' condition mappings —
   two were run live to validate the method itself (now including the fetch-time filter), which is
   what §1 owed before anything is built. Building the other fourteen, and deciding what "verified"
   means at Phase C's ~120-entry scale, is implementation work for whenever a ruling opens it.
4. **A small display refinement §1c motivates, folded into the build rather than left as a design
   gap:** when a kept basket-trial result's own `briefTitle` does not mention the reader's condition
   in any recognizable form, the listing says so explicitly (e.g. naming it as a multi-condition
   trial) rather than presenting a title about an apparently unrelated disease with no explanation —
   a display concern the fetch-time filter's correct inclusion decision does not resolve on its own.
5. No detector is added for any of this: runtime content stays outside the battery by the
   architecture already settled (`phaseB_design.md` §1, §7) — the bounding in §1b/§2 is what stands
   in for a gate, per the roadmap's own original framing. The fetch-time filter is app logic
   (`js/trials.js`), not a `.claude/` tool, so it is not a candidate for `NON_INSTRUMENTS` either —
   the same category `js/histology.js` already sits in.

## 9. THE BUILD — done, verified live, not just claimed (2026-09-11)

**Implementation:** `js/trials.js` (new module — fetch, the fetch-time filter, the four §4
states, the render layer, the register-once toggle wiring, the same shape `js/histology.js`
already established for a peer view-mode) + `#txTrialsLayer`/`#txTrialsToggle` markup and CSS
in `cancer-atlas.html` + four wiring points in `js/main.js` (`txEnterRegion` hides the toggle,
`txGoLevel(1)` shows it, `enterCancerScreen` resets any open panel defensively before a screen
swap, the bootstrap calls `initTrials()`). No organ file (`kidneys.js`/`stomach.js`) was
touched — `TRIALS_CONDITION_MAP` lives centrally in `trials.js`, keyed by cancer id, the same
way `MARGIN_STATUS`/`GROWTH_STATUS` live centrally in `morphology.js` rather than scattered into
organ files; this is operational fetch configuration, not a citation, so it does not belong in
the citation-verification discipline those files carry.

**Condition (7), on the real shipped filter, not a re-implementation.** `filterByCondition` was
imported directly (a minimal `document.getElementById` stub satisfies the module's top-level DOM
reads, nothing else is mocked) and driven against nine assertions: both keyword sets read back
exactly as designed; the gdiff synthetic wrong-disease fixture (no gastric/stomach tag anywhere)
is dropped; the same fixture with `'Gastric Cancer'` appended is kept; a plain clean match is
kept; the real, live "Oncology"-only ccRCC case is dropped (the honest false-negative, reproduced
verbatim); the CD70 same-family broadening is kept; the ADU-1805 basket trial is kept via its
bare `"RCC"` abbreviation specifically, not just the spelled-out form. All nine passed.

**A real accessibility gap was found and fixed WHILE writing the mode-swap, before it ever
shipped, not after.** The first draft of `applyMode` hid `#txSiteViewer` by toggling its
existing `.hidden` class alone (opacity:0 + pointer-events:none) — which leaves every site-label
button inside it still in the tab order and keyboard-activatable, the exact trap `#txCellLayer`'s
own markup comment already documents in this file. Fixed by also toggling `inert` on
`#txSiteViewer`, matching every other layer swap on this screen. Verified directly against the
live DOM (not assumed from reading the CSS): with the trials panel open,
`txSiteViewer.matches(':disabled, [inert], [inert] *')` on a site-label button reads `true` —
genuinely inert, not merely visually hidden.

**Live browser verification, both wired entries, real network fetches against the deployed API
shape (not a mock):**
- **ccRCC**, live at time of test: 10 studies fetched, 1 dropped (condition mismatch — the console
  line reports it, and the UI's own status line reports the same count: "1 result omitted
  (didn't match this condition)"), 9 shown, correctly sorted by `lastUpdatePostDate` descending.
  One shown result ("Testing the Effectiveness of Two Immunotherapy Drugs... for Rare
  Genitourinary Tumors") correctly carries the "Multi-condition trial" note, since its own title
  names none of `renal`/`kidney`/`rcc`.
- **gdiff**, live at time of test: 2 dropped, results shown correctly sorted, the same
  multi-condition note firing correctly on a title that doesn't mention gastric/stomach.
- **Toggle mechanics**: opening and closing the panel correctly restores the site map (verified by
  screenshot both ways); the toggle is shown at level 1 and hidden at level 2 (confirmed by
  entering a metastatic site, where the button correctly swaps to "Microscopic view" instead);
  `enterCancerScreen`'s defensive reset was exercised by navigating cancer → organ → a different
  organ → trials again, with no stale state carried over.
- **Mobile** (375×812, fresh load — not a desktop session resized down, which was checked
  separately and found to be a testing-tool artifact unrelated to this feature): the panel, intro
  copy, status line, and cards all render correctly within the narrower layout; the toggle
  remains reachable and correctly reflects `aria-pressed`.
- **Console**: zero errors across the whole sequence. **Network**: real 200 responses from
  `clinicaltrials.gov/api/v2/studies`, not stubbed.

**What this does not cover, stated rather than left implicit:** EMPTY-ANSWERED and
EMPTY-UNANSWERED were verified by reading the render function's own logic and by the design's
`ccrcc`/`gdiff` live queries never actually returning zero kept studies during this test session
— neither state was forced live (e.g. by breaking connectivity mid-session) before this commit.
Both are simple, static-copy branches with no fetch logic of their own once `fetchTrialsForEntry`
has already resolved, so the risk this leaves open is small, and it is named rather than silently
assumed covered by the RESULTS-state testing above.
