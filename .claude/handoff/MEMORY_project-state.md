---
name: cancer-atlas-project-state
description: "Cancer Atlas project state — repo location, live gate chain, Uterus organ mid-authoring (mesh done, gate running)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0882706c-1510-44e1-b2b3-2abd83f9f5d9
  modified: 2026-09-15T19:52:05.798Z
---

Repo: `~/app/cancer-atlas` (vanilla JS + three.js ESM, no build step, GitHub Pages at
jayc92.github.io/Cancer-Atlas/cancer-atlas.html). Full architecture, data-sourcing rules, and
citation history live in the repo's own `CLAUDE.md` — that file is the real source of truth for
this project, not this memory. Re-read it fresh each session; it is large and changes often.

**As of 2026-09-15: Marrow organ CLOSED, committed, PUSHED, deploy-verified** at `126d132`. Ten
blood-cancer entities, ~90 entries total against the ~120 target. `citation_crosscheck`'s 67 flags
were fully resolved under the tolerated-count rule (3 real defects fixed, 59 declared-with-reason).
**Fabrication is a CONFIRMED CONSTANT: 3 organs checked under the required independent
citation-verification pass (data rule 37), 3 fabrications found, one each** (IPMN, Lymph Nodes,
Marrow) — budget every future organ pass on the assumption this pass WILL find one, not on the hope
it won't. Full detail on all of the above is in CLAUDE.md itself now, not repeated here.

**CURRENT WORK: Uterus organ, mid-authoring, NOT YET COMMITTED.** Four histologic cancer entities
(Endometrioid `uendo`, Serous `usero`, Clear cell `uclear`, Carcinosarcoma `ucs`), TCGA/ProMisE
four-molecular-group classification embedded as trunk-note prose per the user's own explicit design
call (not separate entries), matching the §9/GBM-classifier precedent. Content synthesized from 4
parallel background research agents (endometrioid, serous, clear-cell+carcinosarcoma,
TCGA/ProMisE+site-model) — all 4 completed and their reports fully used.

**Mesh: real HRA asset, fully integrated.** Same source family as the mesh-availability survey
below identified (3DPX-020996-class female pelvic-organ scan), 10 named sub-meshes (uterus/
abdominal-ostium-of-uterine-tube/body/fundus/cornua/lower-uterine-segment/posterior-wall/
anterior-wall/cervix/internal+external-cervical-os). **Real bug found and fixed in the Blender
pipeline: the glTF import parents sub-meshes to each other, so naively subtracting the bbox center
from every object's own LOCAL `.location` double-shifted children relative to already-shifted
parents — silently changing the union bbox SIZE, not just its position.** Fixed by unparenting
every sub-mesh (`CLEAR_KEEP_TRANSFORM`) before recentering; verified post-fix bbox size matches
pre-recenter size to float precision. Compressed via gltfpack `-kn -cc` (864KB→158KB, all 10 names
verified present post-compression). Anterior/posterior-wall sub-meshes carry a distinct
segmentation-LABEL material (grey, not tissue color) — same labeling-convention finding as this
atlas's own Ovary GLB, confirmed by direct material inspection, not a defect. Shipped at
`assets/uterus.glb`; thumbnail rendered via `.claude/render_thumb.py` to `assets/thumbs/uterus.png`.
Four hotspots (Endometrium/Myometrium/Cervix/Cornua) picked from real named-submesh vertices,
visually verified via marker-sphere renders before finalizing coordinates (one round of refinement
needed — Myometrium initially landed too close to Cornua, Cervix initially landed at the isthmus
boundary rather than the visible bulb; both corrected and re-verified).

**Wired into every consumer file:** `js/organs/index.js` (registry), `js/morphology.js`
(`ORIGIN_HOTSPOT.uterus = 0`, no per-entry override needed since all 4 entities — including
carcinosarcoma's carcinoma-first origin per Zhao 2016 — arise from the endometrium; MARGIN_STATUS/
GROWTH_STATUS honestly marked 'uncharacterised, not yet searched' for all 4, since the 4 research
agents were scoped to genes/molecular-classification/site-model/histology, not gross pathology;
EXTENT_STATUS marked 'uncharacterised' too, but for a DIFFERENT, actually-checked reason — SEER's
real "Uterine Cancer" Stat Facts page was fetched live [67/18/11/4% localized/regional/distant/
unknown, SEER 21 Excluding IL 2016–2022], but it's an organ aggregate and fails the share-bound
rule for all 4 entities, none of which clears the ~90% threshold even at Endometrioid's own ~78-80%
share), `js/histology.js` (uendo/uclear reuse Ovary's genEndometrioid/genOCCC directly — real,
sourced architectural-similarity justification, not mere convenience; usero reuses genHGSOC on
PathologyOutlines' own "similar to tubo-ovarian high grade serous carcinoma" statement; ucs got a
genuinely NEW generator, `genCarcinosarcoma`, combining drawGlandRing + genATC's own spindle-
fascicle technique for a real biphasic carcinoma/sarcoma slide — verified rendering correctly
live in-browser on the first attempt), `js/trials.js` (all 4 entities mapped and LIVE-VERIFIED via
`.claude/trials_mapping_check.mjs` — **two real bugs caught and fixed before shipping**: (1) uendo's
first attempt used `requireAlso:['endometrial','uterine','uterus']`, which wrongly dropped a real
trial whose only condition string was the bare MeSH term "Carcinoma, Endometrioid" with no organ
co-occurrence — switched to `excludeIf:['ovarian','ovary','fallopian','peritoneal']` instead, since
every real ovarian-endometrioid trial in the corpus explicitly says "Ovarian"/"Fallopian Tube"; (2)
ucs's keyword `'malignant mixed mullerian'` never matched real data — the actual corpus string is
"Malignant Mixed **Mesodermal** (Mullerian) Tumor", fixed to `'malignant mixed mesodermal'`. Both
fixes confirmed by re-running the check; also end-to-end browser-verified for uendo and ucs
specifically (real fetch → filter → render, correct RECRUITING trials shown, correct omitted-count
reported) — the shared code path gives high confidence for usero/uclear too but they were only
check-script-verified, not separately browser-clicked).

**IN PROGRESS, NOT YET RETURNED as of this memory write:**
1. `python3 .claude/battery.py pre-commit` — launched, exceeded the 600s foreground timeout, moved
   to a tracked background bash job. **Read its actual result before trusting anything about gate
   status** — do not assume clean.
2. An independent citation-verification agent (data rule 37, REQUIRED) — dispatched in the
   background to check every citation/claim in `js/organs/uterus.js` against real primary sources.
   Given the 3-for-3 fabrication record above, **expect it to find at least one real problem — read
   its full report and fix whatever it flags before committing**, per this project's own standing
   rule that this pass is the ONLY layer that can catch fabrication (no mechanical check reaches
   it).

**NOT YET DONE once both come back clean:** worktree-isolated commit (`commit_checked.sh
--worktree`), push, deploy-verify — matching the pattern every prior organ this session used. Do
not commit until both the gate and the citation pass have been read and acted on.

**Other things touched this session, already resolved, only noted so they aren't re-investigated:**
the mesh-availability survey (26 unmodelled NCI sites, 14 strong-CC-BY) and the 7-stray-file audit
(moved to `~/cancer-atlas-mesh-sources/`, manifest at `.claude/mesh_sources_manifest.md`,
`digestive_system__human_anatomy.glb` flagged as the Esophagus candidate) are BOTH DONE and
committed in an earlier part of this same session — Uterus was authored FROM that survey's own
"Cervix + Uterus, same HRA asset" finding. The fallopian-tube/HGSOC-tubal-origin question was
investigated and reported (real fix is a future standalone Fallopian Tube organ, not a mesh change
to the already-shipped Ovary viewer) — not actioned, per explicit user instruction not to author it
yet; Uterus's own Cornua hotspot text references this directly.

Re-verify live repo state (HEAD, working tree, the two background task results) before continuing —
this file is a snapshot from mid-task, not a substitute for checking.
