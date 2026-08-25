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
JS + three.js (0.185.1, loaded as an ES module via an import map — see Architecture
notes; there is no global-script build anymore), no build step, no backend. It
proves out the full navigation pattern end-to-end for **two** organ/cancer pairs,
sharing one organ screen and one cancer screen between them (see the
`ORGAN_DETAILS`/`CANCER_DETAILS` entry in Architecture notes) rather than one
screen pair per organ:

- **Body screen** — a real WebGL body (three.js), the third `makeViewer` instance
  alongside the ovary and tumor-site viewers (see Architecture notes). Male and
  female are two static, pre-baked meshes (`assets/female_body.glb`,
  `assets/male_body.glb`, ~1.1MB each), loaded via `GLTFLoader` — not built
  procedurally. They're derived from MakeHuman's own base mesh and blend-shape
  targets, licensed CC0 1.0 Universal (verified two ways: MakeHuman's
  `LICENSE.md` names "Targets and modifiers" as its own covered-asset category,
  not just "the base mesh," and every individual `.target` file used carries its
  own per-file CC0 declaration, the same way `base.obj` does — see Architecture
  notes for the bake process itself). Not legally required to credit CC0 work,
  but credited anyway in `#disclaimer`, consistent with how this project already
  treats every other data source. A `#bodyLoading` status text covers the one
  real load-time gap this file has ever had (every other viewer builds its mesh
  synchronously) and is removed from the DOM — not just hidden — once both GLBs
  resolve; the sex toggle starts `disabled` for the same reason. Toggled by a
  segmented control; the camera is framed once against both bodies so switching
  never moves it. Organ hotspots are projected DOM proxies over WebGL marker
  meshes, same pattern as the ovary's investigate points and the tumor-site
  labels — not flat `%`-positioned CSS dots, and no longer placed by an analytic
  torso-profile formula either (see `findBodySurfaceAnchor` in Architecture
  notes). Search bar filters organs by name. Organs without a wired-up screen
  show a "coming soon" toast + marker pulse when clicked, to demonstrate the
  intended pattern without needing content for every organ yet. Sex-specific
  organs (Ovaries — female; Prostate — male) only get hotspots on the
  applicable body;
  Brain/Lungs/Breast/Liver/Kidneys appear on both. **Ovaries and Breast are both
  active now** — Breast routes to a real breast mesh (a capped partial-sphere
  dome with a small nipple-apex bump, not a stretched ellipsoid like the ovary).
- **Organ screen** — one screen, shown for whichever organ is currently
  selected (`renderOrganScreen(organKey)` repaints eyebrow/h1/sub/facts/desc/
  cancer-list from `ORGAN_DETAILS[organKey]` before the screen becomes visible).
  Each organ gets a real WebGL 3D mesh (three.js) via its own `buildMesh()`,
  drag-to-rotate + scroll-to-zoom via three's real `OrbitControls`, wrapped in
  the shared `makeViewer` helper (see Architecture notes). Four clickable
  "investigate" points raycast on click and populate an info card below the
  model. Below that: real anatomical facts, then a list of that organ's real
  cancer subtypes with real prevalence figures. **Ovary**: organic/lumpy
  ellipsoid, points are Surface epithelium / Cortex / Medulla / Hilum, only
  HGSOC wired. **Breast**: capped dome mesh, points are Ducts / Lobules /
  Stromal-fatty tissue / Nipple-areola complex — Ducts is deliberately framed
  in direct parallel to the ovary's Surface epithelium point ("~85% of invasive
  cancers arise here", same pedagogical shape) — only Triple-Negative (basal-
  like) is wired, others show "profile coming soon."
- **Cancer screen** — likewise one screen for whichever cancer is currently
  selected (`enterCancerScreen(cancerId)` calls `initSiteViewer(cancerId)`,
  which rebuilds the canvas/blobs/legend from `CANCER_DETAILS[cancerId]` if a
  *different* cancer than what's currently loaded was requested, and reuses the
  existing one otherwise). Four spiculated, mottled tumor-mass meshes per
  cancer, one per real site (see Data rules below), same `makeViewer` pattern,
  click a blob → drills into that site's ~22 sampled cells (flat 2D scatter,
  intentionally *not* 3D — this level represents a pathology-slide view, not a
  spatial location). Click a cell → side panel with a full mutation ledger.
  **HGSOC**'s sites are the real intraperitoneal spread pattern (ovary → omentum
  → peritoneum → bowel serosa); **TNBC**'s are real distant-metastasis sites
  (bone/liver/lung/brain, per Yates et al. 2017) — same "sites" concept, two
  different real meanings, hence `legendTitle` is per-cancer, not hardcoded.
- **Breadcrumb** at the top reflects the full chain (Body › organ › cancer ›
  [site] › [cell]) and is clickable at every level.
- **Keyboard accessibility is wired end-to-end** (commit `c5acece`) and must be
  preserved when adding organs: inactive screens/layers get `inert` (screens are
  hidden via `opacity`/`pointer-events`, never `display:none`), every clickable
  div goes through `makeActivatable` for button semantics, and 3D hotspots that
  have no DOM node of their own get projected DOM proxies repositioned each
  frame from the camera (`.hotspot` / `.organ-point` / `.site-label` — the label
  divs *are* the focusable buttons; the mouse path stays the WebGL raycast,
  except `.hotspot`'s mouse-hover reveal, which is its own raycast in
  `initBodyViewer()` since the div itself is `pointer-events:none`). Container
  roles matter: keep `role="group"` on viewer wrappers (canvas takes
  `role="img"`), or the projected buttons vanish from the accessibility tree.

## Data rules (do not relax these)
1. **Every organ/cancer pair needs its own real-data pass.** Genes, mutation
   frequencies, and any "spread pattern" or clonal architecture claims must come
   from actual published sources (TCGA, named peer-reviewed studies, etc.), not
   invented for flavor. It's fine to *simplify* granularity (e.g. simulating
   per-cell assignment when true single-cell spatial data isn't public) but it
   is not fine to invent gene names, frequencies, or studies.
   **"Real gene, real frequency, real cancer somewhere" is not sufficient on
   its own — check mechanistic fit with the specific cancer being modeled.**
   Receptor status and co-occurring driver context matter. TNBC's branch
   mutations originally included ESR1 activating mutation and MDM4
   amplification: both real, sourced, correctly labeled site-illustrative — and
   both still wrong, because ESR1's mechanism needs ER expression a TNBC tumor
   doesn't have by definition, and MDM4's mechanism (degrading wild-type p53)
   is moot once the trunk TP53 mutation has already disabled that pathway.
   Fixed by swapping to EGFR amplification and RB1 loss (TCGA, Nature, 2012),
   both receptor-status-agnostic and, for RB1, directly cooperative with the
   trunk TP53 mutation rather than competing with it.
2. **Say what's real and what's illustrative, explicitly, in-product.** The
   existing disclaimer pattern (small text, bottom-right, cites the actual
   studies by name/year) should be replicated for every new organ/cancer added.
   **Site→gene pairing is illustrative for every cancer, stated from the start
   for each one — not a fix retrofitted after the fact.** HGSOC's
   omentum/CCNE1-style pairings needed a bug-fix pass to add that caveat after
   shipping without it; TNBC's branch mutations (one gene per site — EGFR
   amplification, RB1 loss, FGFR1 amplification, JAK2/STAT-pathway
   inactivation) got the "(site assignment illustrative)" panel heading and
   the generic disclaimer wording from the first commit that added them,
   because none of these genes are reported by their source studies as
   specific to the site they're shown at here — FGFR1 and JAK2/STAT are
   pan-breast-cancer metastatic-acquisition events (Yates et al., 2017), EGFR
   and RB1 are basal-like-subtype findings, not per-metastatic-site ones
   (TCGA, Nature, 2012). Do not "clean up" a future cancer's branch-mutation
   wording to look more site-specific than the source actually supports —
   that's the mistake this note exists to prevent repeating a third time. (Do
   also check *mechanistic* fit, not just site-specificity — see rule 1;
   EGFR/RB1 replaced an earlier ESR1/MDM4 pick that had the site-pairing
   caveat right but the gene itself wrong for this receptor-negative,
   TP53-mutant tumor.)
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
5. Breast/TNBC reference sources, for continuity:
   - TCGA, *Nature*, 2012 (comprehensive molecular portraits of human breast
     tumors — basal-like/TNBC TP53 ~80%, PIK3CA ~9% in basal-like vs ~39%
     across breast cancer overall, EGFR amplification ~23% of basal-like
     tumors, RB1 loss as a basal-like driving event the paper explicitly
     reports as shared with high-grade serous ovarian carcinoma).
   - Yates et al., *Cancer Cell*, 2017 (genomic evolution of breast cancer
     metastasis and relapse — recurrent metastatic-acquisition alterations
     including FGFR1 amplification and JAK2/STAT-pathway inactivation,
     reported across the metastatic cohort generally, not as site-specific or
     basal-like-specific findings). ESR1 activating mutation and MDM4
     amplification were sourced from here too, originally — both real and
     correctly cited, but mechanistically wrong for a receptor-negative,
     TP53-mutant tumor (see data rule 1) — replaced with the TCGA 2012 pair
     above.
   - Real breast carcinoma subtype shares: Luminal A ~50–60%, Luminal B
     ~15–20%, HER2-enriched ~10–15%, basal-like/triple-negative ~10–20%.

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
- **One organ screen, one cancer screen — data-driven, not one pair per
  organ.** Adding Breast/TNBC was the first real test of whether a second
  organ means a second `#screenOrgan`/`#screenCancer` (copy-pasted markup +
  JS, doubling the maintenance surface every organ after) or a data entry into
  the existing ones. It's the latter: `ORGAN_DETAILS[organKey]` (eyebrow/
  title/sub/facts/desc/hotspots/buildMesh/viewer opts) drives
  `renderOrganScreen()`/`initOrganViewer()`, and `CANCER_DETAILS[cancerId]`
  (title/screenLabel/legendTitle/regions/trunk/privatePool) drives
  `enterCancerScreen()`/`initSiteViewer()`. `currentOrganKey`/`currentCancerId`
  track which one is loaded; `initOrganViewer`/`initSiteViewer` no-op if asked
  to rebuild the one already showing, and dispose-and-rebuild (canvas +
  renderer + DOM proxies) if asked for a different one — only one organ's and
  one cancer's WebGL viewer exist in the DOM at a time. **Adding organ #3
  should mean adding an `ORGAN_DETAILS`/`CANCER_DETAILS` entry and a
  `buildMesh()`, not a new screen.** One real ordering bug surfaced while
  building this: `enterCancerScreen` must call `initSiteViewer(cancerId)` (which
  sets `currentCancerId`) **before** `setScreen('cancer')` (which calls
  `renderCrumbs()`, which reads `CANCER_DETAILS[currentCancerId]`) — the other
  order throws on the very first visit to a given cancer, since
  `currentCancerId` is still whatever it was before (`null`, or the previous
  cancer). Region ids (`REGIONS_*[i].id`) must stay unique across every
  cancer's regions, not just within one cancer's own list — `regionCellCache`
  is keyed by region id and shared across all cancers.
- **three.js loading (migrated 2026-08-23; r128 global script → 0.185.1 ESM):**
  three ships ESM-only now, loaded via an import map with two entries — `three`
  and `three/addons/`. **The addons entry is mandatory, not decorative:**
  `examples/jsm/controls/OrbitControls.js` imports bare `'three'` internally, so
  removing it breaks every addon import. Module scripts are CORS-fetched, which
  means `file://` no longer works at all — serve over HTTP.
- **Rendering defaults were neutralized, not adopted.** Four r128→r185 default
  changes would silently alter the hand-tuned look, and each is pinned back in
  code: `THREE.ColorManagement.enabled = false`; explicit
  `renderer.outputColorSpace = LinearSRGBColorSpace`; explicit `decay: 1` on
  point/spot lights (default flipped to 2 in r146); and every light intensity
  multiplied by `LEGACY_LIGHT_SCALE = Math.PI` (r155 deleted `useLegacyLights`,
  which costs a factor of π). Do not "clean up" these opt-outs in passing —
  adopting the color-correct pipeline and re-tuning all five lights to match is
  an **open, deliberately deferred design decision**, not an oversight.
- **3D viewer helper:** `makeViewer(container, opts)` wraps three's real
  `OrbitControls` (drag-to-rotate, wheel-to-zoom, idle auto-rotate) plus the
  scene/renderer/framing plumbing. The body viewer, every organ viewer, and the
  tumor site-map viewer are all built on it — **reuse this** for new organs.
- **Click-vs-drag disambiguation stays app-side, by necessity.** `OrbitControls`
  has no built-in "was this a click or a drag" concept, and its `change` event
  cannot substitute: `update()` fires `change` on every auto-rotate frame
  regardless of user input. The 6px pointer-movement threshold lives in
  `makeMoveTracker` (shared with the body screen, so the threshold is defined
  once) — don't go looking for an OrbitControls replacement; it was confirmed
  not to exist.
- **Zoom-speed calibration must anchor to the camera's actual framed distance,
  not a nominal radius.** `applyFraming()` slides the camera out to fit the
  meshes — for the site map that lands near 2× the configured radius — so
  `calibrateZoomSpeed(radius)` is re-run at the end of `applyFraming()` with
  the real distance. Anchoring to `opts.radius` was a real shipped bug (site
  viewer zoomed 1.8× too fast while the ovary viewer, whose framed distance
  happens to sit near its nominal, masked it). Any new viewer gets this for
  free through `makeViewer`; don't bypass it.
- **Organic mesh look:** `organicDisplace(geometry, amplitude, freq, seed)` —
  deterministic sine-based vertex displacement, no noise library dependency.
  Reuse for any new organ/tumor mesh; vary `seed`/`freq`/`amplitude` per organ
  for visual variety. A smoothly-varying amplitude only ever makes a shape
  lumpier, never spiky — `organicSpiculate(geometry, opts)` is the variant for
  masses that need to read as invasive: it layers the same base wobble with a
  sparse set of narrow, angularly-confined finger projections (`pow(dot(direction,
  spikeDir), sharpness)` falloff). The tumor site blobs use it; organs stay on
  plain `organicDisplace`. Pairs with `applyMottleVertexColors(geometry, colorHex,
  seed)` for necrotic-looking surface variation — baked as per-vertex color
  (`material.vertexColors = true`), not a texture, since a subdivided
  Icosahedron has no UVs worth building a texture against. Capped at 0.4–0.55
  blend toward the necrotic tone so the site's own color stays dominant, and the
  emissive glow is set from the **pure**, unmottled region color for the same
  reason — the glow is what has to stay instantly identifiable at a glance.
- **Body mesh source and bake process (2026-08-24):** `assets/female_body.glb` /
  `assets/male_body.glb` were baked outside this file, once, from MakeHuman's
  base mesh (`base.obj`) plus its `macrodetails` blend-shape `.target` files —
  reproducing exactly what setting MakeHuman's Gender macro slider to 0.0/1.0
  does (linear blend of ⅓ caucasian + ⅓ asian + ⅓ african of the
  male-young/female-young target, MakeHuman's own default ethnicity mix, with
  age/muscle/weight left at their neutral defaults, which contribute zero at
  that setting). MakeHuman has no headless export path worth using — its
  "Scripting" and "Socket" plugins are Qt `TaskView`s that only run inside the
  already-launched desktop GUI, not standalone — so this was done by reading
  the actual blend formula out of `human.py`/`humanmodifier.py` and applying it
  directly to the raw `.target` files with a one-off Python script (not part of
  this repo; there is no build step here to regenerate the GLBs). **If this
  ever needs redoing:** MakeHuman's own asset-downloader
  (`download_assets_git.py`) points at
  `github.com/makehumancommunity/makehuman-assets`, which no longer exists
  (`git ls-remote` → "Repository not found" — confirmed dead, not transient).
  Get the `.target` files from the main `makehuman` repo directly; `mpfb2`
  (MakeHuman-for-Blender, actively maintained) bundles the same files
  self-contained and is a useful cross-check.
- **Body hotspot placement:** no analytic torso-profile formula exists for a
  real mesh, so `findBodySurfaceAnchor(group, bbox, heightFrac, angleDeg)`
  raycasts inward from outside the mesh — at a given fraction of its own
  standing height and an angle around the vertical axis (0° = straight ahead)
  — and lands wherever the surface actually is, nudged out along the hit
  normal so the marker doesn't clip in. `ORGAN_MARKER_SPECS` holds the
  height-fraction/angle pairs, one spec working for both sexes despite their
  different proportions since the raycast always finds THAT body's own
  surface. Angles are kept modest (roughly ±40° through the waist, up to ±55°
  only at the lower hip/kidney band) because the source mesh's T-pose rest
  arms extend horizontally from about 0.56 to 0.78 of standing height — a
  wider angle in that band hits the arm instead of the torso. This was checked
  by sampling the actual bake's vertex cloud per height band before picking
  the numbers, not by eyeballing the render, and re-verified visually and
  numerically (screen-space offsets small relative to true arm span) for both
  sexes after integration. A raycast miss is logged to the console rather than
  failing silently — none has fired for the current spec set. Not medically
  precise, same simplification the old flat SVG hotspots, and then the old
  procedural-body hotspots, both used.
- Renderers are sized off `container.clientWidth/clientHeight`; screens use
  `opacity`/`pointer-events` toggling rather than `display:none`, so containers
  have valid dimensions even while "hidden" — call `.resize()` on screen
  transitions defensively anyway (see `setScreen()`).

## Known limitations / tech debt
- The male/female bodies are real baked meshes now (MakeHuman-derived, see
  Architecture notes), not stylized primitives — a real visual upgrade — but
  they're still generic/average bodies, not medical models, and organ
  hotspots are still placed by height-fraction + angle via raycasting, not
  real anatomical landmarks. Fine for proving navigation, not for a polished
  v1. The GLBs are also this app's first network-fetched asset (~1.1MB each,
  uncompressed — no Draco/meshopt) and its first non-CC0-by-construction,
  license-verified-after-the-fact dependency; worth remembering if either
  assumption ("everything here is generated in-browser," "everything here is
  provably CC0 by the code itself") gets baked into future tooling.
- Tumor-site blob positions are schematic, not anatomically precise.
- Single HTML file with vanilla JS closures — the organ/cancer *screens* are
  now generalized (see Architecture notes), but there's still no build step
  and no per-organ/per-cancer file split, so the file itself keeps growing
  linearly with content. Needs modularizing (one data module per organ/cancer,
  some kind of build step) before adding much more content.
- No backend/data layer yet — everything is a hardcoded JS object per organ.
  Worth deciding early whether additional organs stay static JSON/JS or move
  to something queryable, especially if this grows past ~5-6 organs.

## Suggested next steps (priority order)
1. Decide on and set up real project structure (framework choice, file
   layout, whether to keep the no-build-step constraint or introduce one).
2. Extract the reusable pieces (`makeViewer`, `organicDisplace`, mutation
   panel component, breadcrumb component) into shared modules.
3. Ovary/HGSOC and Breast/TNBC are both done. Pick organ/cancer pair #3 and
   repeat the real-data-sourcing process documented above before writing any
   code for it — the screens themselves are ready (see the `ORGAN_DETAILS`/
   `CANCER_DETAILS` note in Architecture notes); it should mean a data entry
   and a `buildMesh()`, not new markup.
4. Done: the body screen now loads real baked meshes (MakeHuman-derived,
   `assets/*.glb`) instead of procedural primitives. Remaining follow-up, not
   started: compress the GLBs (Draco/meshopt) if load time ever becomes a
   real complaint rather than a theoretical one, and reconsider whether organ
   hotspots should eventually anchor to real anatomical landmarks on the mesh
   rather than height-fraction + angle.

## Source file
The current working prototype is `cancer-atlas.html` — read it in full before
making changes; it's the single source of truth for what's built so far.
