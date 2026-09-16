# Cancer Atlas — Handoff Package

**Read this page first. It tells you what to read next, and in what order.**

This package exists because most of this project's operating knowledge has lived outside the
repo — in a Claude session's own memory files, in the reasoning behind rulings that never made
it into a code comment, in a human reviewer's standing judgment calls. That access ends. This
folder is the attempt to make the repo self-sufficient: everything a fresh Claude session needs
to keep working on this project competently, with nothing assumed to exist outside `git clone`.

Written 2026-09-15, at HEAD (see `STATE.md` for the exact commit this package describes).

## Read in this order

1. **This file** — orientation, 2 minutes.
2. **[STATE.md](STATE.md)** — where the project actually is right now: what's shipped, what's
   mid-flight, what's genuinely open. Read this before touching anything; it is the only document
   in this package that changes on every commit (see the enforcement note below).
3. **[OPERATING_CONTRACT.md](OPERATING_CONTRACT.md)** — the rules that are not optional. The gate
   chain, worktree-isolated commits, the two required verification passes, the tolerated-count
   rule, what "never `git add -A`" protects against, and why history before `a131649` is
   immutable. If you only read one more document after STATE.md, read this one.
4. **[ROLES.md](ROLES.md)** — this project has run as two roles, an implementer and a reviewer,
   and the reviewer's judgment is most of why the gate chain and the citation discipline exist at
   all. A single session has to play both parts deliberately, on purpose, not by accident. This
   document says what the reviewer actually did, with real examples, so you can recognize when
   you're supposed to be doing it.
5. **[RULINGS.md](RULINGS.md)** — the ledger. Not a restatement of `CLAUDE.md`'s own data rules
   (those are about *content* — which gene, which citation, which site model) — this is about
   *method*: the recurring structural findings (count-vs-identity, accidental invariants,
   fabrication as its own defect class, tolerated-count laundering, guard-before-repair,
   derive-populations-from-source) and the specific instances, right and wrong, that produced
   each one. Read this before you trust an instinct about how to build the next check — there is a
   real chance this ledger already contains the mistake you're about to make.
6. **[MEMORY.md](MEMORY.md)** — the two files that used to live only in a Claude session's own
   memory system (`~/.claude/projects/.../memory/`), moved in verbatim and indexed. If you are a
   fresh session with no memory of this project, this is the closest thing to it.
7. **[ENVIRONMENT.md](ENVIRONMENT.md)** — what this repo depends on that `git clone` doesn't give
   you: a headless Chrome binary, Blender, a folder of raw mesh downloads that live outside the
   repo on purpose, and one folder you must never write into. Read this before running the gate
   chain for the first time on a machine you haven't used before.

Then go to `CLAUDE.md` at the repo root — the organ-by-organ data rules, the full citation
history, the architecture notes. That file is the project's real, long-running memory and stays
the primary source of truth for *content*. This package is the layer above it: the parts that
were never written down anywhere durable at all.

## What this package does not replace

- `CLAUDE.md` — still the source of truth for data rules, architecture, and per-organ citation
  history. This package cross-references it constantly rather than duplicating it.
- The `.claude/*.py` / `.claude/*.js` / `.claude/*.mjs` instruments themselves — their own file
  headers carry their own design history in detail. `OPERATING_CONTRACT.md` explains what the
  chain proves as a whole; it doesn't re-explain each instrument's own internals.
- The `.claude/phase{A,B,C,D}_*.md` design documents — still live, still the record of design
  decisions made along the way (extent-axis design, trials-mapping design, growth-axis design).
  `STATE.md` says which ones are closed and which still have open questions.

## The two enforcement mechanisms in this package

`commit_checked.sh` refuses a commit unless `.claude/handoff/STATE.md` is staged in it — see
`OPERATING_CONTRACT.md`'s own section on this. The reasoning, stated once here because it's worth
knowing before you hit the refusal: this project has repeatedly found that a rule which depends on
a human or a future session *remembering* to do something gets skipped, eventually, without anyone
deciding to skip it. Updating this package is now structural, not a courtesy.

`handoff_denylist_check.py` (wired into `battery.py`, same refusal behavior as everything else in
the chain) refuses a commit if `.claude/handoff/*.md` contains one of a small set of denylisted
strings, added after a real personal-data leak reached this package once — see `STATE.md`'s own
top section for the full incident and its remedy before assuming this package has always been
this careful about what it contains.
