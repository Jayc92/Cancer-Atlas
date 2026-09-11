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
not derive the query from the entry's display name by string match** — confirmed necessary by two
real, live queries run this session, not assumed:

- **`ccrcc` (clear cell renal cell carcinoma), query `"clear cell renal cell carcinoma"`, 8 studies
  sampled, RECRUITING only:** 7 of 8 read back as genuinely on-topic (one names "Clear Cell Renal
  Cell Carcinoma" precisely; the rest tag broader "Renal Cell Carcinoma"/"Renal Cancer," which is
  correct since ccRCC is ~75–80% of RCC per this app's own kidneys.js citation). **1 of 8** — "CD70-
  targeted immunoPET Imaging of Kidney Cancer," conditions `['Urologic Neoplasms', 'Urogenital
  Neoplasms', 'Kidney Neoplasms', 'Neoplasms']` — is broader than the entry (kidney cancer in
  general, not RCC), a real but modest drift.
- **`gdiff` (diffuse-type gastric adenocarcinoma), query `"diffuse gastric adenocarcinoma"`, 3
  studies:** **1 of 3 is a genuine false match, not a modest drift** — "Safety and Efficacy of
  NEO212 in Patients With Astrocytoma IDH-mutant..." is a multi-basket BRAIN TUMOR trial whose
  condition list includes "Diffuse Astrocytoma, IDH-Mutant" alongside a dozen unrelated cancer
  types (one of which happens to be gastric cancer, on a completely different basis). The query
  matched on the word "diffuse" colliding across two unrelated conditions in the same study record —
  a reader looking at the stomach entry would have been shown a brain-tumor trial. **Re-run without
  "diffuse" — query `"gastric adenocarcinoma"`, 6 studies — 6 of 6 genuinely on-topic, zero
  cross-domain collisions.** The registry does not tag trials by Lauren classification (diffuse vs.
  intestinal) at the condition level; forcing subtype specificity into the query terms did not
  narrow the results toward the subtype, it introduced a false positive from an unrelated domain.

**The finding this pair of tests actually supports:** the failure mode is not "the mapping is
usually wrong" (ccRCC's was fine) — it is that **a query built from the entry's own subtype-specific
name can silently import an unrelated disease's trial via keyword collision, and this cannot be
predicted from the entry name alone.** It has to be tested per entry, because reading the atlas's
own name never surfaces "diffuse" is also a term in unrelated neuro-oncology condition tags — the
same shape as every mechanistic-fit mistake this project's own data rules have caught before (rule
1's ESR1/MDM4, rule 3's SMAD4/PTEN), transplanted from citation text to a live API query.

**The design, following from both tests:** the mapping is **per-entry, explicit, and recorded** —
not computed from `name` or `share.site` at runtime. A candidate shape:

```
TRIALS_CONDITION_MAP = {
  ccrcc: { query: 'clear cell renal cell carcinoma', verifiedDate: '2026-09-10',
           sampleSize: 8, onTopic: 7, note: '1/8 broader (kidney cancer generally), not a false match' },
  gdiff: { query: 'gastric adenocarcinoma', verifiedDate: '2026-09-10',
           sampleSize: 6, onTopic: 6, note: 'dropped "diffuse" after it produced a false match on an unrelated neuro-oncology basket trial; the registry does not tag by Lauren classification' },
  ...
}
```

**The verification method, reported before being built into anything, per instruction — and
already demonstrated live, twice, above, not just described:**

1. Build the candidate query from the entry's actual disease biology (organ + histology), not its
   display string.
2. Fetch a real sample against ClinicalTrials.gov v2 (`query.cond`, `filter.overallStatus=RECRUITING`,
   a fixed page size — 6–10 is enough to catch a collision without over-reading; both tests above
   used exactly this size).
3. Read every returned study's own `conditionsModule.conditions` list and `identificationModule.
   briefTitle` back against the atlas entry — by a human, not by a second keyword match (a second
   regex would share the first one's blind spot).
4. Record: entry id, query string, sample size, on-topic count, and — critically — **name every
   off-topic or borderline hit and why**, not just a pass/fail ratio (the ccRCC drift and the gdiff
   collision are different in KIND, and collapsing them to "7/8 vs 6/6 passed" would have hidden
   that the second one was the dangerous shape).
5. A mapping is accepted when the sample is clean or the only drift is a named, reasoned
   broadening (ccRCC's shape); a cross-domain false match (gdiff's first shape) means narrow or
   change the query and re-verify, not accept with a caveat.
6. **Re-verify on a cadence, not once** — a registry's own tagging conventions and content change
   over time; this is the same staleness argument `phaseB_design.md` §19 makes for statistics, applied to a query
   whose correctness depends on what's currently indexed rather than on a citation that doesn't move.

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

1. A ruling on this document — condition-mapping method, the three constraints, status/staleness
   handling, the failure-mode states, and the location decision — before any fetch code, component,
   or schema field is written.
2. If ruled: the remaining fourteen entries' condition mappings, built and verified by the §1 method,
   with every off-topic or borderline hit named the way the two demonstration cases were here.
3. Component design for the four §4 states and the §2/§3 page copy, as a follow-on design pass or
   folded into the build — not decided here.
4. No detector is added for any of this: runtime content stays outside the battery by the
   architecture already settled (`phaseB_design.md` §1, §7) — the bounding in §2 is what stands in
   for a gate, per the roadmap's own original framing.
