# Phase B: build-time or runtime, and the provenance schema it depends on (opened 2026-09-10, user)

Phase A closed with the render side settled: one mechanism built, one ready, one blocked on a
measurement, one empty, one deferred (`phaseA_closeout.md`). Phase B is the one decision that gates
Phase C and D entirely: does new content get authored once and shipped as static bytes, or fetched
live by the deployed page? This document opens the question; it does not rule on it.

## 1. The decision, stated

**Build-time**: content is fetched, read, and hand-verified during an authoring session (the way
every citation in this repo has been produced so far — SEER Stat Facts pages, PubMed records,
StatPearls chapters), then baked into static JS shipped with the rest of the app. No new runtime
capability; no change to the "no build step" architecture, because "build-time" here means
authoring-time, not a compiler/bundler step. This project has never had one and this decision does
not introduce one.

**Runtime**: the deployed page itself fetches from a live endpoint — at load, on demand, or on a
schedule — and renders whatever comes back. This IS a new capability: CORS from a static GitHub
Pages origin, no server-side proxy, no error budget for a flaky third-party API on a page a stranger
loaded, and the standing rule against creating accounts or API keys narrows which endpoints are even
reachable without one.

**The roadmap's expected answer, stated as a hypothesis to ratify, not a decision already taken:**
build-time for statistics (stable, periodically-revised reference figures — SEER shares, mutation
frequencies, staging thresholds: exactly Phase A's citation shape), runtime for trials (a
currently-recruiting clinical-trials listing is stale the moment it's baked, by the nature of the
thing). The asymmetry is real — a SEER percentage and a trial-recruitment-status answer different
questions about how often the underlying fact changes — but it has not been checked against every
candidate Phase C/D content type, only asserted for the two named.

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

## 3. A candidate schema, proposed for ratification, not built

Parallel to `backfill`, a new top-level population — call it `pulled` — with a shape that answers
the four questions a paper citation doesn't need to:

```
{ endpoint: <url>, field: <what value this backs>, retrievedDate: 'YYYY-MM-DD',
  discipline: 'refetch-each-session' | 'cached-until:<date>' | 'permanent-snapshot',
  refs: [...], status: 'pulled', userFacing: true }
```

`discipline` is the new property a paper citation has no analogue for: it states what the retrieval
date is a PROMISE about. A `permanent-snapshot` record makes the same promise a `backfill` record
does (this was true when read, treat it as stable prose). A `refetch-each-session` or
`cached-until` record makes a WEAKER promise (this was true as of the date; re-check before relying
on it past the discipline's own horizon) — closer in shape to `tolerated.py`'s `until` field than to
a citation's `verified` date, and reusing that mechanism rather than inventing a third is the
cheaper move if the discipline turns out to need enforcement (an "overdue re-fetch" check is
`reserve_check.js`'s overdue-`unread`-row arm with a different noun).

The fourth property (a cited status carries a resolvable identifier) extends cleanly: an `endpoint`
URL plus a `retrievedDate` is structurally the same shape `citedBackingViolations` already accepts
for a bare URL with `verified YYYY-MM-DD` — the only addition is requiring `discipline` to be
present and one of the enumerated values, which is a one-line arm, not a redesign.

This is a proposal to react to, not a spec to build against. It has not been checked against a real
runtime candidate (no Phase C/D content type has been named yet that would use it), so its shape may
be wrong in ways only a real case would show.

## 4. What this document does not decide

- Whether ANY Phase C/D content should be runtime at all, versus everything staying build-time and
  "trials" being reconsidered as a periodically-re-authored build-time list instead (cheaper, no new
  capability, staler by construction — a real trade, not a strawman).
- Which specific endpoints (if any) would be used, and whether they are reachable without an account
  or API key under the standing rule.
- Whether `pulled` is the right name or shape — proposed, not ratified.

## 5. Ruling requested

1. Build-time/runtime split: ratify the roadmap's hypothesis (statistics build-time, trials runtime),
   amend it, or defer runtime entirely and keep Phase C/D build-time-only for now.
2. If any runtime content is approved: ratify, amend, or reject the `pulled` schema candidate in §3
   before any detector is touched to accommodate it.
3. If runtime is approved: which endpoint(s), and confirm none requires an account or API key under
   the standing rule — a question this document raises and does not answer.

No detector, no schema file, and no runtime fetch code is touched until this is ruled on.
