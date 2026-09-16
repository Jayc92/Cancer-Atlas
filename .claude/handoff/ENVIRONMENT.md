# Environment Dependencies

Everything in this document lives *outside* the repo. `git clone` gives you the code; it does not
give you any of this. If the gate chain fails in a way that looks like missing infrastructure
rather than a real content defect, check here first.

## Headless Chrome, for `regress.js`

`regress.js` (the browser-automation member of the gate chain) needs a real Chrome binary,
resolved in this order: an explicit `PUPPETEER_CORE` env var, then `~/.cache/cancer-atlas/`
(this project's own persistent, machine-local cache — the path is built from the home directory
at runtime, never hard-coded), then an older `/tmp`-based path as a last resort (deliberately
de-prioritized: `/tmp` on this machine has been observed to get wiped between sessions, which is
exactly the failure this project hit once — see `RULINGS.md` for the broader "don't depend on
`/tmp` surviving" lesson). If none of these resolve, the gate is designed to **refuse loudly**
(exit 1, a logged refusal) rather than silently skip the browser checks — if you see it refuse
this way, the fix is:

```bash
cd ~/.cache/cancer-atlas && npm install puppeteer-core
```

(or wherever the cache path currently resolves to — check `regress.js`'s own resolution order if
this exact path has moved).

## Blender, for mesh processing and thumbnail rendering

Every real-mesh organ in this atlas went through a Blender headless pipeline at build time:
`blender --background --python <script>` for import → weld → shade-smooth → recenter → export,
and `.claude/render_thumb.py` for the sidebar thumbnail. **Blender is a build-time dependency
only — the shipped app never runs it and a fresh clone doesn't need it to serve or view the
site.** You only need it to add or re-process an organ's own mesh asset.

**The near-clip trap, worth knowing before it costs you an hour:** the shared 3D viewer's camera
near-plane was fixed at `0.01` (down from an original `0.1`) specifically because any real mesh
smaller than roughly 3cm across frames the camera *inside* its own near plane at default zoom —
the mesh renders as a convincing, plausible-looking sliced-open shell rather than an obviously
broken view, because artist/scan meshes typically ship double-sided. **The tell is that front and
back silhouettes disagree** — an opaque, correctly-centered mesh cannot do that. If a small new
organ (anything under ~5cm) looks subtly wrong from one specific angle, check the camera distance
against the near plane before assuming the mesh itself is broken. The same class of trap exists in
Blender's own thumbnail-rendering script: its default camera near-clip can swallow a small organ
whole (rendering a fully transparent thumbnail, caught only by an opaque-pixel-count check, not by
eye) — `clip_start` needs tightening for real-world-meter-scale small organs there too.

**A second, distinct pipeline bug worth knowing about before re-deriving it:** glTF import in
Blender parents sub-meshes to each other in a hierarchy. If a script recenters an *assembly* of
sub-meshes by subtracting one shared bbox-center vector from every object's own **local**
`.location`, children get double-shifted relative to their already-shifted parents — silently
changing the assembly's overall bounding-box *size*, not just its position, in a way that's easy
to miss unless you specifically check that the pre- and post-recenter bbox *sizes* match (not just
that the center moved toward the origin). Fix: unparent every sub-mesh
(`CLEAR_KEEP_TRANSFORM`) before recentering. Found and fixed for real during the Uterus organ
pass — see that organ's own `js/organs/uterus.js` header comment for the full account.

## `~/cancer-atlas-mesh-sources/`

Outside the repo, this machine only, not backed up by git. Holds raw mesh-source downloads that
were audited and moved out of the working tree rather than deleted (a standing project
convention: never delete an unattributed asset that might still be needed, move it out and record
where). The tracked record of what's there and why is `.claude/mesh_sources_manifest.md`, inside
the repo — read that file, not this folder directly, to find out what a given raw download is,
its license, and whether it's superseded or still a live candidate for an unmodelled organ.
**One file in there is currently the only lead this project has for the Esophagus organ**
(`digestive_system__human_anatomy.glb`) — the manifest flags it explicitly; don't lose track of
it. This session also added a second folder here,
`~/cancer-atlas-mesh-sources/uterus-patch-safety/`, holding a recoverable patch of the Uterus
organ's own uncommitted work — see `STATE.md` for why it exists and what's in it.

## A folder that must never enter this repo

There is a folder, named here deliberately without its contents being described or read as part
of building this package, that holds personal documents that do not belong in a public,
version-controlled tree and were deliberately kept out of it. **`~/Downloads/cancer-atlas-
personal-files/`** is the name to recognize. The standing rule, unconditional: nothing from a path
matching that name, or anything that looks like it serves the same purpose (personal, non-project
files sitting near this repo), gets `git add`ed, referenced, or copied into `cancer-atlas` under
any circumstance. This is also one of the concrete reasons `OPERATING_CONTRACT.md` says never to
run a broad `git add -A` in this repo — a broad add is exactly the kind of operation that could
pull something like this in by accident, without anyone deciding to.

## What this means for a fresh machine

A session starting on a machine that has never run this project before should expect all four of
the above to be *absent* on first contact — that's expected, not broken. Puppeteer needs
installing (one command, above). Blender needs installing if any mesh work is planned (not
needed just to read or extend content). The mesh-sources folder and the personal-files exclusion
are conventions this document now carries forward even if the actual folders don't exist yet on
a given machine — the rule ("don't delete unattributed assets, move them out and record it" /
"never let personal files near this repo") applies regardless of whether either folder has been
created on this particular machine yet.
