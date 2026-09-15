# Mesh sources manifest (2026-09-15)

**Why this file exists.** Seven raw mesh-source downloads sat untracked at the repo root for
roughly a week, surfacing in `git status` every session as unexplained noise — one was even
misread once as evidence of a second writer touching the tree. They were never a second writer's
work; they are this project's own earlier research downloads, left unexamined. This manifest is
the fix: name every file, its real identity, and its audit verdict, then move the bytes out of the
working tree entirely (not gitignored, not deleted — the same handling this repo already uses for
unrelated personal files that don't belong in a public tree). **Deleting nothing** is deliberate:
a Sketchfab listing can disappear, and "superseded, can re-download" silently assumes the upstream
source still exists.

**Where the bytes live now:** `~/cancer-atlas-mesh-sources/` (outside this repo, this machine
only — not portable, not backed up by git). This file is the tracked record of what's there; if
that folder is ever lost, re-acquiring any SUPERSEDED entry below means re-downloading from its
own source URL (verify the license again at that time — this manifest records what was true on
2026-09-15, not a standing guarantee).

**Audited (2026-09-15) by direct GLB-metadata inspection (`asset.extras.author`/`.license`/
`.source` read from each file's own JSON chunk) plus one Blender headless render where metadata
alone was ambiguous — full method and reasoning in the session transcript, summarized per file
below.**

---

## `realistic_human_lungs.glb` (17,147,352 bytes)
- **Identity:** "Realistic Human Lungs" by Sketchfab artist neshallads. CC BY 4.0 (confirmed via
  embedded `asset.extras.license`).
- **Verdict: SUPERSEDED.** This is the raw, pre-Blender-processing download from the 2026-09-01
  lungs mesh swap (see CLAUDE.md's dated lungs-swap entry). The processed, shipped result is
  `assets/lungs.glb` (8,683,136 bytes) — already live, already deploy-verified.
- **Re-acquire if ever needed:** sketchfab.com, search "Realistic Human Lungs" by neshallads.

## `realistic_stomach.glb` (31,042,172 bytes)
- **Identity:** "Realistic Stomach" by Sketchfab artist Brain Diagno. CC BY 4.0.
- **Verdict: SUPERSEDED.** Raw download from the 2026-09-03 stomach mesh swap (CLAUDE.md data rule
  30). Shipped result is `assets/stomach.glb` (2,129,308 bytes).
- **Re-acquire if ever needed:** sketchfab.com, search "Realistic Stomach" by Brain Diagno.

## `tiroides_andrea__dacs_ujat.glb` (4,325,336 bytes)
- **Identity:** the thyroid Sketchfab asset (andycopo55/UJAT, scene titled "TIROIDES ANDREA DACS
  UJAT" per its own embedded name), CC BY 4.0. Referenced in CLAUDE.md data rule 27.
- **Verdict: SUPERSEDED.** Raw download predating Blender processing + the Tier-2 texture
  re-encode. Shipped result is `assets/thyroid.glb` (1,578,240 bytes).
- **Re-acquire if ever needed:** sketchfab.com, search by the andycopo55 UJAT thyroid scene name
  above.

## `stomach-3d-model.webp` (88,636 bytes)
- **Identity:** a preview **image** (WEBP), not a 3D mesh at all — no GLB structure to inspect.
- **Verdict: NOT A CANDIDATE FOR ANYTHING.** Almost certainly a saved thumbnail from stomach-asset
  research (timing matches the 2026-09-02/03 stomach pass). Carries no license/attribution
  obligation of its own since nothing in this atlas derives from it.

## `colon.glb` (73,688,972 bytes)
- **Identity:** "Colon" by Sketchfab artist iqcenter. CC BY 4.0 (confirmed via embedded
  `asset.extras`). **This is a DIFFERENT asset from the one actually shipped** — node names
  (`Capsule_3Shape_2_0`, `CubeShape_11_0`, `Colon_SubsectionShape_14_0`, `Volume_MesherShape`)
  read as an algorithmically-generated/procedural mesh built from primitive shapes, not a direct
  anatomical scan.
- **Verdict: REJECTED CANDIDATE, superseded by a different, chosen asset.** The shipped
  `assets/colon.glb` (3,582,304 bytes) comes from antonia.sundberg's "Small and large intestine"
  (CLAUDE.md's colon-swap entry, data rule 26) — chosen over this one, though the direct comparison
  reasoning wasn't recorded at the time. Kept rather than discarded per this manifest's own
  no-deletion policy, but there is no known reason to prefer it over the shipped asset.
- **Re-acquire if ever needed:** sketchfab.com, search "Colon" by iqcenter (source URL preserved
  in the file's own `asset.extras.source` field, readable by re-parsing the GLB's JSON chunk).

## `small_and_large_intestine.glb` (15,629,192 bytes)
- **Identity:** antonia.sundberg's "Small and large intestine" — CONFIRMED as the actual source of
  the shipped colon asset (data rule 26). CC BY 4.0. Contains TWO real, separately-named nodes:
  `Tjocktarm` (large intestine — the part that WAS used) and `Tunntarm` (small intestine — data
  rule 26 explicitly records this part was found but "dropped").
- **Verdict: SUPERSEDED for Colon (already shipped) — BUT its `Tunntarm` node is a real, already-
  CC-BY-verified ALTERNATIVE CANDIDATE for the still-unmodeled Small Intestine organ.** The
  2026-09-15 mesh-availability survey found a different candidate for Small Intestine (NIH 3D/HRA,
  3DPX-020987/-021017) — likely the stronger pick given this project's own established preference
  for HRA's proven pipeline — but if that HRA asset doesn't pan out at build time, this `Tunntarm`
  node is a real fallback already sitting in a license-verified file.
- **Re-acquire if ever needed:** sketchfab.com, search "Small and large intestine" by
  antonia.sundberg.

## `digestive_system__human_anatomy.glb` (23,430,176 bytes)
- **Identity:** "Digestive System | Human Anatomy" by Sketchfab artist adimed. CC BY 4.0. One
  fused mesh (no separately-named sub-parts) — confirmed by direct Blender headless render
  (2026-09-15) to depict a real, connected, correctly-proportioned whole-GI-tract shape: an open
  pharyngeal top, **a real esophagus tube**, stomach pouch, coiled small/large intestine below.
  Modest polygon budget (12,771 vertices for the entire tract) — real anatomy, not scan-grade
  detail.
- **Verdict: THE ONE FILE IN THIS AUDIT THAT COVERS AN UNMODELED SITE THE FRESH SURVEY REPORTED AS
  EMPTY.** The 2026-09-15 mesh-availability survey found NOTHING usable for Esophagus (every
  Sketchfab candidate it checked was either a game-asset placeholder or a flattened illustration
  poster). This file's esophagus tube is real anatomy under a clean CC BY 4.0 license — a genuine,
  if modest-quality, candidate. **DO NOT MOVE, DELETE, OR OTHERWISE LOSE TRACK OF THIS FILE** until
  Esophagus is either authored from it or a better candidate is found; Esophagus is the
  highest-incidence unmodeled site with no other known asset. Isolating just the esophagus tube at
  build time will need a manual topological cut (the tube is fused directly into the stomach in
  one continuous surface, not a separate connected component the way Prostate's duct appendages
  were) — a real but bounded build cost, not a blocker.
- **Re-acquire if ever needed:** sketchfab.com, search "Digestive System | Human Anatomy" by
  adimed.

---

**Standing instruction for whoever next touches Esophagus or Colon:** read this file before
re-running a mesh search from scratch — two of the seven answers above are already known.
