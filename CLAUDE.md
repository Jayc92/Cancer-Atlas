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
proves out the full navigation pattern end-to-end for **three** organ/cancer pairs,
sharing one organ screen and one cancer screen between them (see the
`ORGAN_DETAILS`/`CANCER_DETAILS` entry in Architecture notes) rather than one
screen pair per organ:

- **Body screen** — a real WebGL body (three.js), the third `makeViewer` instance
  alongside the ovary and tumor-site viewers (see Architecture notes). Male and
  female are two static meshes (`assets/female_body.glb`, `assets/male_body.glb`,
  512KB/1.48MB), loaded via `GLTFLoader` — not built procedurally, and (as of the
  second asset swap) not MakeHuman-derived either; see Architecture notes for the
  full asset history and why. Not legally required to credit CC0 work, but
  credited anyway in `#disclaimer`, consistent with how this project already
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
  Brain/Lungs/Breast/Liver/Kidneys appear on both. **Ovaries, Breast, and Lungs
  are all active now** — Breast routes to a real breast mesh (a capped partial-sphere
  dome with a small nipple-apex bump, not a stretched ellipsoid like the ovary);
  Lungs routes to a `LatheGeometry` profile that pinches to a radius of 0 at both
  poles, so it closes into a solid tapered point at apex/base with no separate cap
  mesh (unlike the body torso, which needs explicit `topCap`/`botCap` discs).
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
  like) is wired, others show "profile coming soon." **Lungs**: `LatheGeometry`
  profile (see above), points are Bronchi / Alveoli / Pleura / Hilum — Alveoli
  is framed the same way as Ovary's Surface epithelium and Breast's Ducts
  ("adenocarcinoma... most commonly arises here — directly paralleling..."),
  only Adenocarcinoma is wired, the other three (Squamous cell carcinoma,
  Large cell carcinoma, Small Cell Lung Cancer — explicitly noted in its own
  `share` text as a separate category from NSCLC entirely) show "profile
  coming soon."
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
  (bone/liver/lung/brain, per Yates et al. 2017); **LUAD**'s are also real
  distant-metastasis sites (bone/brain/liver/adrenal gland, per Riihimäki et
  al. 2014 — bone ~39% for adenocarcinoma specifically, not the higher
  all-NSCLC figure sometimes quoted) — same "sites" concept, three different
  real meanings, hence `legendTitle` is per-cancer, not hardcoded.
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
3. **Organ-specific mutual-exclusivity constraints must be checked and recorded,
   not just mechanistic fit in general.** LUAD's trunk mutation is KRAS (33%,
   not a near-universal founder like TP53 is for HGSOC/TNBC — see rule 7
   below). **Major NSCLC driver oncogenes (KRAS, EGFR, ALK, ROS1, etc.) are
   clinically mutually exclusive within one real tumor** — a tumor has one or
   none of them, essentially never two; TCGA (*Nature*, 2014) states this
   directly for KRAS/EGFR ("mutations in KRAS (33%) were mutually exclusive
   with those in EGFR (14%)"). Because KRAS is this cancer's trunk, **no
   alternative driver oncogene — especially EGFR — may ever be added to
   LUAD's branch or private-pool lists**, in any future pass, no matter how
   real/sourced/well-known that gene's NSCLC frequency is on its own. This is
   the same class of mistake as data rule 1's ESR1/MDM4 case (real gene, real
   frequency, real cancer somewhere, wrong for *this* specific tumor's
   biology) but for a full class of genes at once rather than one gene —
   check every LUAD branch/private candidate against this list specifically
   before adding it, not just against general KRAS-pathway coherence.
   (Current LUAD branch/private genes — STK11, KEAP1, PIK3CA, SMARCA4, MET
   amplification, CDKN2A loss, ARID1A mutation, RB1 loss, TTN — were all
   checked and are KRAS-co-occurring or KRAS-orthogonal, never
   KRAS-competing. Two earlier picks, SMAD4 loss and PTEN loss, were pulled
   in a post-hoc verification pass and replaced with RB1 loss and ARID1A
   mutation respectively, after finding SMAD4's LUAD-specific literature
   support was thin and PTEN's original citation (a Frankell et al. 2023
   subclonal-selection claim) couldn't be confirmed either — independent
   literature actually leans the other way, noting PTEN mutations as *more*
   frequent in squamous (LUSC) than adenocarcinoma — see rule 7 below. Same
   "don't just trust the gene name" standard that caught ESR1/MDM4, applied
   twice more in one pass.)
4. **Mutation model vocabulary** (established and should stay consistent):
   - **Trunk** — present in ~all tumor cells; the founding/earliest driver event.
   - **Branch** — arose within one anatomical site/subclone, not all of them.
   - **Private** — unique to one sampled cell; illustrates ongoing heterogeneity.
   - **Driver** vs **Passenger** badge on every mutation.
   - Each mutation entry needs: gene/event name, class (driver/passenger),
     a frequency or CCF figure where one exists, and a one-line plain-language
     "why this matters" note (no jargon dump).
5. Ovary/HGSOC reference sources already used, for continuity:
   - TCGA, *Nature*, 2011 (integrated genomic analysis of ovarian carcinoma —
     TP53 ~96%, recurrent CDK12/NF1/RB1 alterations, CCNE1 amplification).
   - McPherson et al., *Nature Genetics*, 2016 (multi-site whole-genome
     sequencing of HGSOC — ovary → omentum → peritoneum → bowel spread pattern,
     BRCA1/2 pathway loss and HR-deficiency framing).
   - Real ovarian carcinoma subtype shares: HGSOC ~70%, endometrioid ~10%,
     clear-cell ~10%, mucinous ~3%, low-grade serous <5%.
6. Breast/TNBC reference sources, for continuity:
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
7. Lung/LUAD reference sources, for continuity:
   - **TCGA (Cancer Genome Atlas Research Network), *Nature*, 2014**
     ("Comprehensive molecular profiling of lung adenocarcinoma"; PMID
     25079552, PMCID PMC4231481, open access). **Primary trunk-mutation
     source, added in a post-hoc verification pass to replace an
     unverifiable Steeghs et al. citation (see correction note below).**
     Confirmed directly from the open-access full text: 18 significantly
     mutated LUAD genes with exact frequencies, including KRAS 33%, EGFR
     14% (explicitly stated as mutually exclusive with KRAS — "Mutations in
     KRAS (33%) were mutually exclusive with those in EGFR (14%)"), TP53
     46%, STK11 17%, KEAP1 17%, PIK3CA 7%, SMARCA4 6%, RB1 4%, CDKN2A 4%,
     ARID1A 7%, SETD2 9%, NF1 11%, RBM10 8%, U2AF1 3%, MGA 8%, BRAF 10%, MET
     7%, RIT1 2%. This is now the source for LUAD's trunk KRAS figure (33%,
     not the earlier "~30–37%" range) and for the RB1 loss (~4%) and ARID1A
     mutation (~7%) private-pool entries.
   - Frankell et al., *Nature*, 2023 (TRACERx — the evolutionary history of
     NSCLC; PMID 37046096, PMCID PMC10115649, open access). Names KRAS,
     TP53, and STK11 together as under significant *subclonal* (not purely
     truncal) selection in LUAD; the LUAD-specific SWI-SNF/chromatin-
     remodeling subclonal finding is SMARCA4/ARID1B/SMARCB1 — **not** SETD2
     (a LUSC/squamous finding in this same paper, not LUAD; note this is
     independent of SETD2's 9%-of-LUAD *mutation frequency* in TCGA 2014
     above — significantly-mutated and significantly-subclonally-selected
     are different statistical questions in two different papers, both can
     be true at once). Still cited for STK11/KEAP1's subclonal-selection
     framing and for the "KRAS itself is often further subclonally selected"
     point in the trunk note.
   - Jamal-Hanjani et al., *NEJM*, 2017 (TRACERx's original design paper —
     tracking NSCLC evolution through multi-region sequencing; the
     methodological basis Frankell et al. 2023 builds on).
   - Riihimäki et al., *Lung Cancer*, 2014 (PMID 25130083 — population-based
     metastatic-pattern study; source for LUAD's four real distant-metastasis
     sites). Re-confirmed directly (Europe PMC full-text extraction, not
     recall) at commit time of this correction pass: real paper, correct
     authors/journal/year/PMID, reports **bone metastases: 39%** for
     adenocarcinoma specifically — the exact figure used in-product — plus a
     separate small-cell-lung-cancer breakdown (liver 35%, nervous system
     47%) not used here. No adrenal-gland-specific percentage is reported in
     the abstract, so none is claimed in-product either. Confirmed solid;
     no changes made.
   - **Correction record (post-hoc verification pass, same day as initial
     LUAD build):** the original pass cited "Steeghs et al., *Lung Cancer*,
     2022, N=5,038 NSCLC patients" for the KRAS ~30–37% trunk figure. Direct
     verification found the real Steeghs et al. paper at that PMID (35461050,
     "Mutation-tailored treatment selection in non-small cell lung cancer
     patients in daily clinical practice," *Lung Cancer*, 2022) **is** a real
     Dutch nationwide NSCLC cohort (Dutch Pathology Registry + Netherlands
     Cancer Registry) — but its actual cohort is **1,193** stage IV patients
     (Q4 2017), not 5,038, and its abstract reports only a combined
     "molecular driver alteration" rate (61.1% of adenocarcinomas carried
     *any* of 8 driver genes, KRAS among them) — not an isolated KRAS
     percentage. The paper is paywalled (subscription-required DOI, not
     open access), so the specific KRAS-only figure could not be confirmed
     even from the full text. Both the fabricated N and the unverifiable
     specific-percentage claim were removed; TCGA 2014 (above) — open
     access, exact 33% figure, directly confirmed — replaced it as the
     trunk-mutation source. Same standard as the ESR1/MDM4 correction in
     data rule 1: don't keep a real-paper citation whose specific claim
     can't actually be confirmed from the source. Two private-pool genes
     were corrected in the same pass: **SMAD4 loss**, originally attributed
     to "Frankell et al. 2023 found under significant subclonal selection
     in LUAD" — that specific claim couldn't be re-confirmed from the full
     text, and an independent literature search found SMAD4 studied in LUAD
     mainly for expression/splicing/prognosis, not as a recurrent genomic
     driver event the way it is in pancreatic/colorectal cancer — replaced
     with **RB1 loss** (TCGA 2014, ~4%, directly confirmed). **PTEN loss**,
     also originally attributed to the same Frankell 2023 claim, had the
     same problem — and TCGA 2014's own list of 18 significantly mutated
     LUAD genes above does not include PTEN at all, while an independent
     search found a paper stating PTEN mutations are *more* frequent in
     LUSC (squamous) than LUAD — replaced with **ARID1A mutation** (TCGA
     2014, ~7%, directly confirmed, same SWI/SNF-chromatin mechanistic
     category as SMARCA4).
   - Real NSCLC subtype shares: Adenocarcinoma ~40%, Squamous cell carcinoma
     ~25–30%, Large cell carcinoma ~10%; Small Cell Lung Cancer ~15% of all
     lung cancers but is its own separate category from NSCLC entirely, not an
     NSCLC subtype — stated as such in its `share` text in-product, not just
     in this file.
   - **Standing rule for this organ specifically — see data rule 3 above:**
     KRAS/EGFR/ALK/ROS1 mutual exclusivity in NSCLC means EGFR (or any other
     alternative NSCLC driver oncogene) must never be added to LUAD's
     branch/private-pool lists, no matter how well-sourced its own frequency
     is, because KRAS is already this cancer's trunk mutation.

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
- **Body mesh source — full history, honestly, because it took three tries
  (2026-08-24/25):** `assets/female_body.glb` / `assets/male_body.glb` come
  from **Blender's "Human Base Meshes" bundle** now, not MakeHuman.
  1. **First: a MakeHuman bake. Abandoned — a source-topology defect, not a
     pipeline bug.** MakeHuman's base mesh plus its `macrodetails` blend-shape
     `.target` files (both CC0, verified via `LICENSE.md` and per-file
     headers) were blended with a one-off Python script reproducing
     MakeHuman's own Gender-slider math, since MakeHuman has no headless
     export path at all — its "Scripting"/"Socket" plugins are Qt `TaskView`s
     that only run inside the already-launched desktop GUI. The bake
     succeeded, but a wireframe/connected-component check (the same technique
     used on every candidate since) found MakeHuman's own `base.obj` has a
     low-poly "cap" fusing the inner thighs into one skirt-like cone, plus an
     unrelated stray debug cube — both present in the pristine, unmodified
     mesh before any blend touched it. Not fixable in this pipeline without
     real mesh surgery, so abandoned rather than patched.
  2. **Second: DNC44's CC-BY pair on Sketchfab. Blocked, not disqualified.**
     License and rough specs checked out from the research pass, but
     confirming the actual glTF/GLB format list and inspecting real topology
     both require an authenticated Sketchfab download, and creating that
     account isn't something an agent does unprompted. Still sitting there as
     an option if someone with a Sketchfab login wants to pick it up by hand.
  3. **Third, current: Blender's "Human Base Meshes" bundle.** Free CC0 asset
     pack on blender.org's own Demo Files page (`blender.org/download/demo-
     files/`), *not* bundled in the Blender installer and *not* gated behind
     Blender Studio's paid subscription (`studio.blender.org` — checked
     directly; its Characters page is mostly €11.50/mo content and has
     nothing by this name). License quoted directly from a README text block
     *inside* the downloaded `.blend` file: "Human Base Meshes: Asset Bundle -
     Version 1.4 / All provided assets are public domain under the CC0
     license." A *different*, stale text block in the same file is literally
     named "LICENSE" and describes an unrelated asset ("Rain Rig," CC-BY) —
     the on-point statement is the version-numbered README, not the one
     labeled LICENSE; don't grep for the wrong one a second time. Topology
     confirmed clean via Blender's headless Python API (`blender --background
     --python` — a real first-class interface, unlike MakeHuman): both
     `GEO-body_male_realistic` and `GEO-body_female_realistic` are exactly one
     connected component (no stray geometry), genuinely distinct sculpts
     (mean per-vertex difference ~4.8cm, not zero), with a real gap between
     the legs at every height band from ankle to mid-thigh and a correct
     single-surface merge only at the hip. Each sex is its own static mesh —
     no macro-slider/blend-shape math to reproduce, a real simplification.
  - **Blender is now a build-time tool this project depends on**, installed
    via `brew install --cask blender`, used only via its headless CLI. It is
    **not** a runtime dependency — the shipped app still just fetches two
    static GLBs, same as every version before this one.
  - **Export gotchas, both hit for real, both worth not re-discovering:**
    (1) the bundle's bodies carry a Multires modifier at level 3 in the
    source file (677K verts / 1.35M triangles each) — far too heavy for a
    browser GLB. Exported at **level 0** (10,582 verts / 21,160 triangles
    each, topology-identical to level 3 — checked at both levels, not
    assumed). Force `modifier.levels`, `sculpt_levels`, and `render_levels`
    all to `0` before `export_scene.gltf(..., export_apply=True)`, or the
    export silently regresses to the 677K-vertex resolution.
    (2) The bundle arranges its many body variants side-by-side in the
    source file's own 3D viewport for asset-browser thumbnailing (each at a
    different, arbitrary X offset so they don't overlap) — `export_apply`
    bakes that scene-layout position straight into the GLB. The first export
    attempt shipped both bodies several units off-center on X; every hotspot
    raycast that depends on the body being centered at the origin missed the
    mesh entirely as a result. Fixed with `bpy.ops.object.origin_set(type=
    'ORIGIN_GEOMETRY', center='BOUNDS')` followed by zeroing `obj.location`,
    *before* export — re-verify a mesh's exported bounding box is centered on
    (0, *, 0) in X/Z if this is ever redone, don't assume `use_selection` on
    its own gives you a centered result.
  - Real-world scale now (meters, ~1.7 tall for either sex) instead of the
    abandoned MakeHuman bake's arbitrary ~17-unit body — `makeViewer` opts,
    the marker sphere radius, and the raycast padding/nudge distances in
    `findBodySurfaceAnchor` are all scaled to match; don't reuse the old
    numbers if another mesh swap ever happens.
- **Body hotspot placement:** no analytic torso-profile formula exists for a
  real mesh, so `findBodySurfaceAnchor(group, bbox, heightFrac, angleDeg)`
  raycasts inward from outside the mesh — at a given fraction of its own
  standing height and an angle around the vertical axis (0° = straight ahead)
  — and lands wherever the surface actually is, nudged out along the hit
  normal so the marker doesn't clip in. `ORGAN_MARKER_SPECS` holds the
  height-fraction/angle pairs, one spec working for both sexes despite their
  different proportions since the raycast always finds THAT body's own
  surface. Angles were re-derived from scratch for the current mesh, not
  carried over from the abandoned MakeHuman spec — its rest pose is arms
  angled down-and-out from the shoulder rather than a flat horizontal T-pose,
  and the safe angular window against the arm is wider as a result (roughly
  55-70° before the arm intrudes through the chest/waist band, vs.
  MakeHuman's ~55° ceiling). Checked per height band with the same
  angle-vs-radius sampling technique each mesh swap has used, not by
  eyeballing the render, and re-verified per sex after integration with a
  specific screen-space check (kidney marker position against the arm's
  actual screen position at the same height, confirming a flank-of-torso
  read). A raycast miss is logged to the console rather than failing
  silently — none has fired for the current spec set, and a systematic
  all-miss result during this integration (see export gotcha #2 above) is
  exactly how the off-center export bug was caught. Not medically precise,
  same simplification every hotspot system this app has had has used, going
  back to the original flat SVG dots.
- Renderers are sized off `container.clientWidth/clientHeight`; screens use
  `opacity`/`pointer-events` toggling rather than `display:none`, so containers
  have valid dimensions even while "hidden" — call `.resize()` on screen
  transitions defensively anyway (see `setScreen()`).

## Known limitations / tech debt
- The male/female bodies are real static meshes now (Blender's "Human Base
  Meshes" bundle, CC0 — see Architecture notes for why this is the third
  asset source, not the first), not stylized primitives — a real visual
  upgrade — but they're still generic/average bodies, not medical models, and
  organ hotspots are still placed by height-fraction + angle via raycasting,
  not real anatomical landmarks. Fine for proving navigation, not for a
  polished v1. The GLBs are also this app's first network-fetched asset
  (512KB/1.48MB, uncompressed — no Draco/meshopt) and its first non-CC0-by-
  construction, license-verified-after-the-fact dependency; worth remembering
  if either assumption ("everything here is generated in-browser," "everything
  here is provably CC0 by the code itself") gets baked into future tooling.
  Blender itself is now a real build-time dependency (not a runtime one — see
  Architecture notes) for regenerating these two files; nobody should need it
  just to run the app.
- Tumor-site blob positions are schematic, not anatomically precise. **Check
  `pos3d` spacing against the default camera framing, not just against other
  sites' blob-mesh overlap** — TNBC's Brain/Lung site labels (and meshes)
  sit stacked directly on top of each other at the default site-map rotation
  (verified while adding LUAD, not fixed, since it predates this pass and
  isn't a regression to fix silently). LUAD reused TNBC's exact Brain
  `pos3d` for its own Brain site at first and inherited the identical
  overlap with Adrenal gland — caught via screenshot, fixed by respacing
  LUAD's four `pos3d` values further apart (HGSOC's original 4-way spread
  was the model to follow, not TNBC's). Worth a real fix — e.g. a shared
  minimum-angular-separation pass over each cancer's `REGIONS_*` — before
  adding a 4th cancer with 4+ sites of its own.
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
3. Ovary/HGSOC, Breast/TNBC, and Lungs/LUAD are all done. Pick organ/cancer
   pair #4 and repeat the real-data-sourcing process documented above before
   writing any code for it — the screens themselves are ready (see the
   `ORGAN_DETAILS`/`CANCER_DETAILS` note in Architecture notes); it should mean
   a data entry and a `buildMesh()`, not new markup. Remember to check any
   organ-specific mutual-exclusivity constraints for the new cancer's driver
   genes (data rule 3) the same way LUAD's KRAS/EGFR/ALK/ROS1 constraint was
   checked — not every cancer will have one, but check before assuming.
4. Done: the body screen now loads real static meshes (Blender's "Human Base
   Meshes" bundle, `assets/*.glb`) instead of procedural primitives — the
   third asset source tried, after MakeHuman (abandoned, source-topology
   defect) and DNC44 on Sketchfab (blocked, account-gated download). Remaining
   follow-up, not started: compress the GLBs (Draco/meshopt) if load time ever
   becomes a real complaint rather than a theoretical one, and reconsider
   whether organ hotspots should eventually anchor to real anatomical
   landmarks on the mesh rather than height-fraction + angle.

## Source file
The current working prototype is `cancer-atlas.html` — read it in full before
making changes; it's the single source of truth for what's built so far.
