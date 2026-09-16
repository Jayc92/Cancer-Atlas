# Memory Index

Two files, brought into the repo verbatim from Claude Code's own per-project memory directory
(under `~/.claude/projects/`, named from this repo's own absolute path with slashes turned to
dashes — not reproduced literally here, since that encoding embeds the account name the same way
an absolute `/Users/<name>/...` path would) — the persistent, cross-session memory a Claude Code
session builds up outside the repo, which disappears the moment access to that memory system ends. **`CLAUDE.md` remains the living,
current source of truth for this project's content and data rules** — nothing here supersedes it.
What these two files preserve is different: the *narrative and reasoning* that fed into
`CLAUDE.md`'s own entries but was never written there in prose form, and the moment-to-moment
project state a fresh session used to re-orient with before reading `CLAUDE.md` in full.

## [MEMORY_project-state.md](MEMORY_project-state.md)

The live project-state summary as it stood at the end of the session that produced this handoff
package — repo location, the gate chain's current health, what's committed, what's mid-flight.
Short (~8KB), meant to be read in full. Treat it the same way `STATE.md` in this same folder is
meant to be treated: a snapshot, not a substitute for `git log` and a fresh gate run.

## [MEMORY_history-archive.md](MEMORY_history-archive.md)

**A large (675KB), frozen, verbatim narrative archive, recovered once already from a session
transcript after an earlier compaction lost it — this is the second time this content has been
saved from disappearing, and there won't be a third.** Its own header states plainly what it is:
a byte-for-byte capture of the project-state memory as it stood at the end of a specific batch of
organs (liver/testis/kidneys/bladder/pancreas), preserved specifically because a same-day
compaction into a short summary would otherwise have destroyed real reasoning no current-state
summary can carry — why a specific technical option was rejected, the exact count and direction
of predictions that turned out wrong, the full research-and-build narrative for that batch and
everything before it.

**Not quite byte-for-byte, disclosed rather than left silent: one line was redacted before this
package's first commit.** The project's own machine-path guard (part of `battery.py`'s selftest
suite) caught a single sentence naming this machine's real, absolute home-directory path —
including the account name — in a cwd-drift anecdote. Since this repo is public, that path would
have named a real person's account to everyone who clones it. Fixed by generalizing that one
sentence (the specific path wasn't load-bearing to the lesson it was illustrating) and leaving
every other byte of the file untouched. If this file is ever regenerated from a fresher session
transcript, re-run the same guard before committing it again — this is exactly the kind of thing a
"verbatim capture" convention will keep re-introducing unless something checks for it every time.

**How to use a 675KB prose file without reading all of it:** it is not internally indexed with a
table of contents, so the practical approach is the same one this project's own `CLAUDE.md` uses
for cross-referencing its own history — **search for a distinctive phrase, not a line number.**
A few orienting anchors, each a real, searchable phrase from inside the file:

- `**Where it lives:**` — near the very top; the repo's own relocation history
  (`~/Downloads/cancer-atlas` → `~/app/cancer-atlas`) and why.
- `Browser-verification gotchas learned the hard way` — the specific, hard-won quirks of
  verifying this app in-browser (IIFE scoping, `preview_start` not resolving this repo at the
  time, why headless-check evidence was ruled stronger than a screenshot).
- Organ names in headings or bold (`liver`, `testis`, `kidneys`, `bladder`, `pancreas`, and every
  organ built before this archive's own 2026-09-14 freeze date) — each organ's own build
  narrative, asset-sourcing story, and the specific defects found and fixed along the way, in more
  narrative detail than `CLAUDE.md`'s own more clipped data-rule form.
- Any phrase you find *already quoted* in `CLAUDE.md` itself with no further explanation — this
  archive is very likely where the fuller story behind that quote lives, if it predates
  2026-09-14.

**Everything in this file is frozen at 2026-09-14.** It predates the thyroid, lymphnodes, marrow,
skin BCC/SCC/MCC, and Uterus organ passes entirely — those are recorded in `CLAUDE.md` directly
(they were written after this archive's own freeze date, and `CLAUDE.md`'s own discipline of
recording new findings as they happen was already well-established by then). **Re-verify anything
here against the live repo before trusting it as current** — the archive's own header says this
about itself, and it's worth repeating: this is a record of what was true and what was reasoned
at a point in the past, not a live view.

## If this ever needs compacting again

Don't let it happen the way it happened the first time — mid-session, without a save. If a future
session needs to shrink either of these files for space or clarity, **copy the full content
somewhere durable first** (a dated archive file, exactly like `MEMORY_history-archive.md` itself
already is), and only then write the shorter replacement. The failure mode this guards against
already happened once to this exact content.
