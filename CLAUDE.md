# Cancer Atlas — Project Brief

## Vision
An interactive patient-education / research tool: a body → organ → cancer → mutation
drill-down, inspired by 3D anatomy explorers (e.g. a rotatable/zoomable heart model
with clickable "investigate" points). The person should be able to search or click
into a generic body, land on an organ, see what cancers affect it, pick one, and
drill all the way down to individual sampled cells and their mutation profiles.

**Audience:** patient education + research/teaching. Not a clinical or diagnostic tool.
**Non-goal:** this is not, and should never become, personalized medical advice or a
tool that implies it's showing one real patient's data.

## Current state (as of this handoff)
A single-file HTML prototype (`cancer-atlas.html`) built in Claude.ai using vanilla
JS + three.js (r128, via cdnjs), no build step, no backend. It proves out the full
navigation pattern end-to-end for **one** organ/cancer pair:

- **Body screen** — stylized SVG female silhouette (not a real mesh), draggable/
  zoomable via CSS 3D transforms, with hotspot markers on ~6 organs. Search bar
  filters organs by name. Only **Ovaries** is wired; other organs show a "coming
  soon" toast + marker pulse when clicked, to demonstrate the intended pattern
  without needing content for every organ yet.
- **Organ screen (Ovary)** — a real WebGL 3D mesh (three.js), organic/lumpy
  ellipsoid built via deterministic vertex displacement (no external noise lib),
  drag-to-rotate + scroll-to-zoom via a hand-rolled orbit rig (no OrbitControls
  import needed — r128 doesn't ship it as an easy CDN include). Four clickable
  "investigate" points (Surface epithelium, Cortex, Medulla, Hilum) raycast on
  click and populate an info card below the model. Below that: real anatomical
  facts, then a list of the 5 real ovarian carcinoma subtypes with real
  prevalence figures — only HGSOC is wired, others show "profile coming soon."
- **Cancer screen (HGSOC)** — three.js scene: four organic blob meshes, one per
  real anatomical spread site (see Data rules below), same orbit-rig pattern,
  click a blob → drills into that site's ~22 sampled cells (flat 2D scatter,
  intentionally *not* 3D — this level represents a pathology-slide view, not a
  spatial location). Click a cell → side panel with a full mutation ledger.
- **Breadcrumb** at the top reflects the full chain (Body › Ovary › HGSOC ›
  [site] › [cell]) and is clickable at every level.

## Data rules (do not relax these)
1. **Every organ/cancer pair needs its own real-data pass.** Genes, mutation
   frequencies, and any "spread pattern" or clonal architecture claims must come
   from actual published sources (TCGA, named peer-reviewed studies, etc.), not
   invented for flavor. It's fine to *simplify* granularity (e.g. simulating
   per-cell assignment when true single-cell spatial data isn't public) but it
   is not fine to invent gene names, frequencies, or studies.
2. **Say what's real and what's illustrative, explicitly, in-product.** The
   existing disclaimer pattern (small text, bottom-right, cites the actual
   studies by name/year) should be replicated for every new organ/cancer added.
3. **Mutation model vocabulary** (established and should stay consistent):
   - **Trunk** — present in ~all tumor cells; the founding/earliest driver event.
   - **Branch** — arose within one anatomical site/subclone, not all of them.
   - **Private** — unique to one sampled cell; illustrates ongoing heterogeneity.
   - **Driver** vs **Passenger** badge on every mutation.
   - Each mutation entry needs: gene/event name, class (driver/passenger),
     a frequency or CCF figure where one exists, and a one-line plain-language
     "why this matters" note (no jargon dump).
4. Ovary/HGSOC reference sources already used, for continuity:
   - TCGA, *Nature*, 2011 (integrated genomic analysis of ovarian carcinoma —
     TP53 ~96%, recurrent CDK12/NF1/RB1 alterations, CCNE1 amplification).
   - McPherson et al., *Nature Genetics*, 2016 (multi-site whole-genome
     sequencing of HGSOC — ovary → omentum → peritoneum → bowel spread pattern,
     BRCA1/2 pathway loss and HR-deficiency framing).
   - Real ovarian carcinoma subtype shares: HGSOC ~70%, endometrioid ~10%,
     clear-cell ~10%, mucinous ~3%, low-grade serous <5%.

## Design system
- **Palette:** deep navy background (`#0b0f1a`, radial gradient toward
  `#101a30`), panels `#121a2b` / `#0e1524`, hairline borders `#24314a`.
  Accent teal `#35c9c1` (structural/UI accent, investigate-point glow). Clone/
  site colors: coral `#ff6b5e`, azure `#4f8dfd`, amber `#f2b642`, violet
  `#a78bfa`. Driver = coral, passenger = muted slate `#6b7c99`.
- **Type:** Space Grotesk (display/headings), IBM Plex Sans (body), IBM Plex
  Mono (data, badges, breadcrumb separators, mutation gene names). Loaded via
  Google Fonts.
- **Tone:** clinical-but-warm "specimen viewer" aesthetic — glowing points,
  soft depth, restrained motion. Avoid generic dark-mode-neon or cream/serif
  clichés.
- **Interaction pattern, keep consistent across every new organ/cancer:**
  drag = rotate, scroll/wheel = zoom, click a glowing/colored point = drill in
  or open an info card, breadcrumb always reflects current depth and is always
  clickable back up the chain.

## Architecture notes
- **Screen state machine:** top-level `screen` = `body | organ | cancer`.
  Within `cancer`, `txLevel` = `1` (site map) `| 2` (cell scatter) `| 3` (panel
  open). `renderCrumbs()` derives the full breadcrumb from both.
- **3D viewer helper:** `makeOrbitRig(container, opts)` is a reusable
  spherical-coordinate camera rig (theta/phi/radius) with drag-to-rotate,
  wheel-to-zoom, and click-vs-drag disambiguation (tracks total pointer
  movement; a click only fires if movement stayed under a small threshold).
  Both the ovary viewer and the tumor site-map viewer are built on it — **reuse
  this rather than hand-rolling camera math again** for new organs.
- **Organic mesh look:** `organicDisplace(geometry, amplitude, freq, seed)` —
  deterministic sine-based vertex displacement, no noise library dependency.
  Reuse for any new organ/tumor mesh; vary `seed`/`freq`/`amplitude` per organ
  for visual variety.
- Renderers are sized off `container.clientWidth/clientHeight`; screens use
  `opacity`/`pointer-events` toggling rather than `display:none`, so containers
  have valid dimensions even while "hidden" — call `.resize()` on screen
  transitions defensively anyway (see `setScreen()`).

## Known limitations / tech debt
- Body silhouette is a stylized SVG mannequin, not a real 3D mesh or medical
  model — fine for proving navigation, not for a polished v1.
- Tumor-site blob positions are schematic, not anatomically precise.
- Single HTML file with vanilla JS closures — will not scale cleanly past a
  handful of organs. Needs modularizing (one data module per organ/cancer,
  a shared viewer component, some kind of build step) before adding much more
  content.
- No backend/data layer yet — everything is a hardcoded JS object per organ.
  Worth deciding early whether additional organs stay static JSON/JS or move
  to something queryable, especially if this grows past ~5-6 organs.

## Suggested next steps (priority order)
1. Decide on and set up real project structure (framework choice, file
   layout, whether to keep the no-build-step constraint or introduce one).
2. Extract the reusable pieces (`makeOrbitRig`, `organicDisplace`, mutation
   panel component, breadcrumb component) into shared modules.
3. Pick the next organ/cancer pair and repeat the real-data-sourcing process
   documented above before writing any code for it.
4. Revisit the body screen — decide if a stylized silhouette is the permanent
   direction or a placeholder for a proper 3D body mesh later.

## Source file
The current working prototype is `cancer-atlas.html` — read it in full before
making changes; it's the single source of truth for what's built so far.
