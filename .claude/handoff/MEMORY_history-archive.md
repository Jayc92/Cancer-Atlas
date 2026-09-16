---
name: cancer-atlas-history-archive
description: "Verbatim archive of the Cancer Atlas project-state memory as it stood at 2026-09-14T00:26 (end of the five-organ liver/testis/kidneys/bladder/pancreas batch), preserved before that file was compacted into a concise current-state summary the same day"
metadata:
  type: project
  archived: 2026-09-14
  supersededBy: cancer-atlas-project-state
---

**This is a frozen, verbatim archive, not the live project-state file.** See
[[cancer-atlas-project-state]] for the current, up-to-date summary. This file was
recovered byte-for-byte from the session transcript's own diff record after the live
file was rewritten down to a ~40-line summary on 2026-09-14 (the rewrite happened
mid-session, without first preserving this content anywhere) — the rewrite lost real
reasoning a pure current-state summary can't carry: why opacity was rejected as a
tumor-margin falloff channel, why organ-side growth-falloff channels are structurally
dead (a mass is ~22% of organ radius), the specific count and direction of wrong
predictions made along the way, and the full research/build narrative for the
liver/testis/kidneys/bladder/pancreas batch and everything before it. Treat every
fact below as frozen at 2026-09-14 — re-verify against the live repo (`git log`,
`CLAUDE.md`) before trusting anything here as current state; CLAUDE.md itself is
the durable source of truth for this project, not this archive.

Cancer Atlas is an interactive body → organ → cancer → mutation drill-down (patient
education + teaching; explicitly not clinical/diagnostic, never personalized advice).

**Where it lives:** git repo at **`~/app/cancer-atlas/`** (RELOCATED 2026-09-08 from
`~/Downloads/cancer-atlas`; see the relocation section below for why and for what was
verified), branch `main`, first commit
`ca3b627` (2026-08-20). `cancer-atlas.html` is a single-file vanilla-JS + three.js
prototype, no build step, no backend. **three.js is now 0.185.1, loaded ESM-only via an
import map** (r128 global-script pattern retired; the `three/addons/` map entry is
mandatory because `OrbitControls.js` imports bare `'three'`). Because module scripts are
CORS-fetched, `file://` no longer works at all — it must be served over HTTP. A
byte-identical duplicate download, `cancer-atlas_1.html`, is not a variant and is no longer
beside the repo: it was one of the personal files moved out, so its location is whatever
that section says rather than what is restated here.

`~/app` is an unrelated Next.js project and is **NOT a git repo** (verified 2026-09-08),
which is why nesting a repo inside it pollutes nothing; other unrelated, personal repos are
already nested there the same way (named in the original note; generalized here on a
2026-09-15 sweep — this project's own record has no reason to name someone's other
projects). The repo previously sat in
`~/Downloads` — do NOT `git init` there: it holds ~645 entries, 16 GB, and other unrelated
repos.

**Local preview:** `.claude/launch.json` IS committed in this repo, and since `eff40fa` its
`runtimeArgs` are RELATIVE (`.claude/nocache_server.py`, port, `.`) — **do not reintroduce an
absolute path there; the repo is public and that is a PII leak, not a style point.** Open
`http://localhost:3055/cancer-atlas.html`. **BUT the Browser pane cannot currently reach this
repo:** it resolves `~/app/.claude/launch.json`, whose seven entries (verified 2026-09-08)
include no `cancer-atlas` — so `preview_start` fails here and no visual check should be
claimed from it. The name `cancer-atlas` and port 3055 are both free there if an entry is
ever wanted. The evidence to use instead is `regress.js`'s headless checks plus
`deploy_check`'s live hotspot verification, which the user ruled is stronger than a
screenshot — say so rather than hedging. The preview pane also renders files outside the
project folder as static snapshots only, so the file must be served over HTTP for its
JavaScript to run at all.

**Browser-verification gotchas learned the hard way:**
- All app code is inside an IIFE, so internal functions (`txEnterRegion`, `setScreen`)
  are NOT reachable from `javascript_exec`. Drive navigation with real `computer` clicks.
- `#screenOrgan` is the scroll container, not the document — wheel events over a 3D
  viewer zoom the rig instead of scrolling the page. Set `screenOrgan.scrollTop` directly.
- **CSS transitions never advance while the Browser pane is hidden.** A `CSSTransition`
  sits at `playState: "running"`, offset 0, forever, so `getComputedStyle` returns the
  *pre*-transition value no matter how long you wait. To measure a transitioned property,
  set `el.style.transition='none'` and `el.getAnimations().forEach(a=>a.cancel())` first.
  This produced a false "fix didn't work" reading twice.
- Fitting a perspective camera to a bounding box requires a real aspect ratio; doing it
  before layout exists yields a nonsense radius that silently empties the scene with no
  console error. Defer and retry from `resize()`.
- Pass `Enter`, not `Return`, to the browser tool's `key` action. `Return` yields a keydown
  with `key: ""`, `code: ""`, `keyCode: 0` (yet `isTrusted: true`), so any correct
  `e.key === 'Enter'` handler no-ops. This cost a false bug report. Treat `keyCode: 0` as
  "the harness rejected the key name," not as an app defect.
- **Keyboard events reach the page only after one real `left_click` somewhere in it.** With
  focus set solely by JS `focus()`, `Tab` does nothing — no keydown fires at all, because the
  pane lacks OS window focus. Click a neutral bit of chrome first, then keys work.
- **Space cannot be delivered.** `key:"space"`/`"Space"` arrive as `key:""`; `type " "` uses
  text insertion and fires no key event; `key:" "` is rejected. Test Space by dispatching a
  synthetic `KeyboardEvent('keydown',{key:' ',code:'Space',cancelable:true})` and asserting
  `defaultPrevented`.
- **Native `<button>` Enter activation cannot be tested.** Even `key:"Enter"` arrives with
  `code:""`, `keyCode:0`, so Chrome won't synthesise the click. Proved it's the harness, not
  the app, by appending a bare `<button>` with a click counter — the harness's Enter left it
  at 0. Handlers that test `e.key` are unaffected; native activation is what breaks. Verify
  such buttons with a mouse click and rely on the spec for the key path.
- **`:focus-visible` won't match a programmatic `focus()`** until keyboard modality is
  established. Send one real `Tab` before probing computed outline, or you'll read
  `outline: none` and conclude the CSS is broken.
- `document.body.focus()` does NOT move focus (body isn't focusable), so a probe helper that
  "restores" focus that way silently leaves it on the last probed element. Use `.blur()`.
- **Shift+Tab: the `modifiers:"shift"` param is silently IGNORED** (focus moves forward, and
  a keydown logger shows `shiftKey:false`). Put it in the key name instead —
  `key` action with `text:"shift+Tab"` arrives as `key:"Tab", shiftKey:true` and works.
- Best way to measure a whole tab order: install a capturing `focusin` listener that pushes
  `{tag,id,class,aria-label}` into an array, send `key Tab` with `repeat:N`, then read the
  array. One round-trip instead of N probe calls.
- **The Browser pane serves stale JS from cache after an edit, with no visible sign.** Two
  verification rounds returned byte-identical numbers to the pre-fix run. Detect it by
  comparing `fetch(location.href,{cache:'no-store'})` text against
  `[...document.scripts].map(s=>s.textContent)`; avoid it by navigating with a `?v=N`
  cache-buster and asserting the new code is live before every measurement.
- **rAF is on-demand here (~1 frame per 2 s idle; one screenshot forces ~4 frames)**, so any
  `.style.left` written in a tick loop is stale until frames are forced. Corollary worth
  exploiting: rotation advances per *rendered frame*, so frame index is a deterministic
  proxy for rotation phase — two fresh loads driven through the same number of frames sit at
  the same theta, which is the only sound way to A/B camera geometry across builds.
  Shimming `requestAnimationFrame` with `setTimeout` does **not** rescue a stalled page: the
  tick loop's already-queued real-rAF callback never fires, so the loop stays dead.
- A tab can stop compositing permanently ("Browser pane is not displayed") while other tabs
  are fine. Don't fight it — open a new tab and re-drive.
- Probes that read projected label positions must **gate on validity** (`left > 1`), not just
  wait N frames: entering a screen renders a few frames while `container.clientWidth` is
  still 0, which silently yields `left: 0px` for every label and a garbage measurement.
- Never A/B a spread/centroid metric with single readings — it is theta-dependent (site-map
  spread swings 103→120 with rotation phase). Use same-run ratios with invertible in/out
  steps, or frame-index-matched fresh loads.
- Don't fit camera distance from a multi-step zoom with the small-step linear approximation;
  it produced a phantom 15% discrepancy. Solve the exact closed form per rig (`D/(D−nΔ)` for
  a fixed step, `(D/(D−Δ))^n` for a proportional one) — both then agreed on D to 0.03%.

**Non-negotiable data rule to re-read before touching content:** every organ/cancer pair
needs its own real-sourced pass (TCGA, named studies), and the product must state
in-product what is real vs illustrative. Simplifying granularity is allowed (the brief
explicitly permits simulating per-cell assignment); inventing genes, frequencies, or
studies is not. The gene→site pairing question is now RESOLVED in-product: the panel
heading reads "Branch mutation (site assignment illustrative)" and the disclaimer states
that McPherson (2016) supplies the spread pattern and TCGA (2011) the cohort-level
frequencies, not the pairing.

**Bug-fix pass completed 2026-08-20** (7 fixes: data honesty labelling, disclaimer/panel
overlap, search aliases, shared drag guard, bounding-box camera fit, coral private-mutation
ring, seeded PRNG for cell generation). Accessibility (focusable elements, `inert`, ARIA)
was explicitly scoped OUT of that pass and handled separately (below).

**Accessibility pass completed 2026-08-20, committed as `c5acece`** (6 steps: `inert` on inactive
screens plus the three intra-screen layers that leaked focus the same way, `makeActivatable`
button semantics on ~41 clickable divs, teal `:focus-visible` ring, `landFocus()` on every
navigation, live regions on toast + panel body, labels on the close button / both WebGL
viewers / search input). Two structural facts worth keeping:
- The four tumour sites had **no** DOM node except the projected `.site-label`, so that label
  carries the button semantics while keeping `pointer-events:none` — the mouse path stays the
  WebGL raycast, so there is no double activation.
- `#txSiteViewer` must stay `role="group"`, never `role="img"`, or those labels vanish from
  the accessibility tree. Its canvas carries `role="img"` instead.

**A11y follow-up pass completed 2026-08-20, also in `c5acece`** — closed all three gaps left
open above:
- Ovary investigate points now have `.organ-point` DOM proxies created in `initOvaryViewer`
  and positioned each frame in `ovaryTick` via `ovaryRig.project()`, same as `.site-label`.
  `pointer-events:none` keeps the mouse on the raycast. **`#ovaryViewerWrap` had to change
  from `role="img"` to `role="group"`** (canvas took the `img` role) or the new buttons would
  have been invisible to AT — same trap as `#txSiteViewer`. Deliberately no occlusion culling:
  the existing raycast never tests the ovary body, so culling would make keyboard stricter
  than pointer.
- `#header` (not `#crumbs` — `#crumbs` is a flex child, `#header` is the `position:absolute`
  `z-index:50` element) moved to be the LAST child of `#app`. Zero CSS change, rects verified
  byte-identical before/after. Breadcrumbs are now forward-Tab reachable on every screen, but
  **after** the screen's content, not before: `landFocus()` targets the `.screen` region and
  sequential focus visits an element's descendants before its following siblings, so a single
  shared crumb node cannot sit between the landing point and the content. Closing that would
  need per-screen duplicated crumbs or giving up the per-screen region announcement.
- `dismissMutationPanel()` extracted (close button + stage click + Escape share it); document
  -level Escape listener guarded on `#txPanel.open`. Focus restore follows `txPanelOpener`,
  so Escape from anywhere returns to the originating cell dot.

Verified end to end keyboard-only: Body 9 hotspots + search; Ovary 4 points + 5 cancer rows
+ crumb (10 stops); HGSOC 4 site labels + 2 crumbs; cell scatter 22 dots + 3 crumbs; panel
close button + 4 crumbs (the ring's wrap target is a cell dot — expected, pre-existing, and
not a regression; the earlier count here omitted it and briefly looked like one).
No console errors.

**three.js r128 → 0.185.1 + real OrbitControls migration, committed as `7ee267a`
(2026-08-23)** — `cancer-atlas.html` +274/−66 plus a CLAUDE.md rewrite of the
architecture notes (import-map requirement, neutralized rendering defaults, app-side
click-vs-drag, framed-distance zoom anchoring, and the previously undocumented a11y
structure).

**3D body viewer (male+female) + spiculated/mottled tumor masses, committed as
`c0a1bc4` (2026-08-24)** — third `makeViewer` instance replaces the CSS/SVG body
silhouette: Lathe torso + Sphere head + Capsule limbs per sex, real shoulder-to-hip
ratio difference (female ~0.76, male ~1.23), Female/Male toggle framed once against
both bodies so it never moves the camera, hotspots migrated to the projected-DOM-
proxy-over-raycast-marker pattern, Prostate placeholder added (male-only). Tumor
blobs gained `organicSpiculate` (angular finger-projection variant of
`organicDisplace`) and `applyMottleVertexColors` (per-vertex necrotic patches capped
at 0.4–0.55, emissive glow left pure so site color ID stays instant). Full keyboard
+ mouse regression re-verified across all three screens, zero console errors.
Flagged (not fixed) a pre-existing, unrelated bug via `spawn_task`: stale tumor-site
caption text isn't cleared on step-back from cell scatter to site map. `makeOrbitRig`'s spherical camera math and
pointer/wheel listeners are gone; `makeViewer` now wraps `OrbitControls`. Facts worth
keeping:
- Four r128→r185 changes altered appearance and had to be neutralised to preserve the
  hand-tuned look: `ColorManagement.enabled` now defaults true (r152), `outputEncoding` →
  `outputColorSpace` (r152), point/spot light `decay` 1 → 2 (r146), and r155 **deleting
  `useLegacyLights`**, which costs a factor of **π** on every light intensity. Held with
  `ColorManagement.enabled = false`, `LinearSRGBColorSpace`, and `LEGACY_LIGHT_SCALE = π` on
  all five lights. Adopting colour-correct rendering instead is a live design decision.
- OrbitControls has **no** click-vs-drag / "has moved" concept, and its `change` event can't
  substitute because `update()` fires it on every autoRotate step. The 6 px threshold stays
  app-side by necessity.
- `autoRotate` self-pauses during drag (gated on `state === NONE`), so the tick loops no
  longer need a `!dragging` test. But `autoRotateSpeed` must be **negated** (its
  `_rotateLeft(+angle)` does `theta -= angle`), and speeds are frame-count based, not
  time-based — which makes frame index a usable clock.
- **Each wheel notch calls `update()` internally**, so a scroll advances the idle spin by one
  extra step (~0.09°/notch). Real, measured, imperceptible.
- Calibration constants that reproduce the old feel: `rotateSpeed = 0.008 · clientHeight/2π`
  (recomputed per resize, since OrbitControls normalises drags by `clientHeight`);
  `zoomSpeed = ln(1 − 0.3/r)/ln(0.95)` — note `1 −`, not `1 +`; the sign error was a real
  7.8% bug — anchored to the **actual post-`applyFraming()` distance**, not `opts.radius`
  (anchoring to the nominal made the site map's zoom 1.8× too fast, and the ovary happened to
  match, hiding it). `applyFraming()` must raise `maxDistance` *before* moving the camera
  because `update()` clamps.
- Proving the click-vs-drag guard needs a stationary camera: pin phi at `maxPolarAngle`
  (2.7), after which further vertical drags produce zero camera motion, and release an
  over-threshold drag exactly on a marker.

**Organ #3 (Lungs → Lung Adenocarcinoma) added, committed as `0d7f0b2` (2026-08-25).**
Same data-driven pattern (new `ORGAN_DETAILS.lungs`/`CANCER_DETAILS.luad` entries +
`buildLungsMesh()` using a `LatheGeometry` profile pinched to 0 at both poles, no new
screens). KRAS trunk (33%, not near-universal like TP53), four real metastatic sites
(Bone/Brain/Liver/Adrenal gland), KRAS/EGFR/ALK/ROS1 mutual-exclusivity enforced across
branch/private pools and recorded as a standing data rule. Found + fixed a real
site-label-overlap bug in the new content: `pos3d` for Brain/Adrenal gland had been
copied verbatim from TNBC's Brain/Lung coordinates and inherited the exact same
overlap — confirmed TNBC still has this unfixed (not a regression, tracked as tech
debt), respaced only the new LUAD coordinates.

**Pre-commit citation-verification pass caught real errors a first pass missed** — worth
repeating as a habit before committing any sourced-data claim, not just once at intake:
Steeghs et al. 2022 (originally cited for the KRAS trunk %) turned out to misstate its
own cohort size (claimed N=5,038; actual paper is 1,193 stage IV patients) and never
isolates a KRAS-specific percentage in its abstract — replaced with TCGA (*Nature*,
2014, PMID 25079552, PMCID PMC4231481, open access), whose full text was pulled
directly and confirms "Mutations in KRAS (33%) were mutually exclusive with those in
EGFR (14%)." Two private-pool genes (SMAD4 loss, PTEN loss) had also been attributed to
a Frankell et al. 2023 claim that couldn't be re-confirmed from the paper's full text —
independent search found SMAD4 is mainly LUAD-relevant for expression/splicing, not as
a recurrent driver event (better established in pancreatic/colorectal), and PTEN
mutations are reported as *more* frequent in squamous (LUSC) than adenocarcinoma, and
absent from TCGA 2014's own list of 18 significantly-mutated LUAD genes. Both swapped
for genes verified directly against that same TCGA 2014 list: RB1 loss (~4%) and
ARID1A mutation (~7%). Lesson for future organ passes: a full-text-search `hitCount>0`
against a PMCID only proves the gene name string appears *somewhere* in the paper
(often a supplementary table) — it is not evidence the paper supports the *specific
claim* being cited to it. Get the actual sentence/statistic, not just a hit count.

**Organ #4 (Kidneys → Clear Cell Renal Cell Carcinoma) added, committed as `5da9d32`
(2026-08-25, combined with the TNBC fix below — see why).** Same data-driven pattern,
applying the LUAD lesson up front this time —
every citation verified at the source *before* writing it in, not after. VHL trunk
(86.6%, real paper is Moore et al., *PLOS Genetics*, 2011 — user said "Nickerson et
al.," a real coauthor but not first author, corrected in CLAUDE.md). Gerlinger et al.
(*NEJM*, 2012) directly confirmed both requested claims: VHL "mutated ubiquitously in
all analyzed regions" (architecturally truncal, not just frequent), and convergent
evolution in **three** genes, not the two originally suggested — SETD2, KDM5C, *and*
PTEN. TCGA (*Nature*, 2013) confirmed the "cooperating, not competing" framing directly
(chr3p loss in 91% of tumors "encompassing... VHL, PBRM1, BAP1 and SETD2") — the
opposite mutation model from Lung's mutual-exclusivity rule, now recorded as its own
standing data rule (4) so neither pattern gets assumed to generalize. Checked KDM5C
individually rather than assuming it shared the other three's chr3p co-deletion
mechanism just because it's another "cooperating" branch gene — it's on Xp11.22, not
3p, confirmed via NCBI Gene ID 8242. The user's suggested metastatic-site percentages
(Lung ~45%/Bone ~30%/Liver ~20%/Brain ~8%) didn't hold up under verification; real
population-based numbers found instead (Dabestani et al. 2016, Swedish registry: Lung
54%/Bone 20%) and used in place of the suggested figures — Liver/Brain kept as real
sites via a second paper (Bianchi et al. 2012) that explicitly studies those four sites
but doesn't give a clean overall percentage, so none is claimed for those two (same
honesty precedent as LUAD's adrenal gland). Designed fresh `pos3d` coordinates from
scratch for the four ccRCC sites rather than reusing any prior cancer's (the mistake
that caused LUAD's label-overlap bug) — screenshot-confirmed no overlap this time.
Full keyboard + mouse (incl. click-vs-drag guard) regression pass clean; HGSOC/TNBC/
LUAD all confirmed unaffected.

**TNBC site-frequency rigor-gap fix, same commit `5da9d32`.** TNBC's four metastatic
sites had real branch genes but zero cited site-frequency data — unlike LUAD/ccRCC,
which had verified figures recorded (though, caught while checking: *not actually
rendered anywhere in the UI* — no cancer shows a per-site % badge; verified numbers
live only in code comments + CLAUDE.md, a false premise in how the task was scoped,
flagged back to the user rather than silently building new UI to match a "display
pattern" that doesn't exist). Foulkes et al. (*NEJM*, 2010) — the secondhand-cited
source for lung 40%/brain 30%/liver 20%/bone 10% — checked directly and rejected: real
paper, but its abstract is scope-only with zero percentages, full text paywalled with
no PMC mirror. Replaced with Gao et al. (*Precision Medical Sciences*, 2023, SEER,
1,026 DM patients) — directly confirmed bone 24.46%, lung 23.78%, brain 3.61%; liver
deliberately left unclaimed since it's never given an overall % in that source — and
Kennecke et al. (*JCO*, 2010) for the real organotropism-differs-by-subtype finding,
preserving its basal-like-vs-TNBC-nonbasal caveat rather than flattening it.

**Both passes committed together as one commit (`5da9d32`), not two.** The user asked
for them split, but `git diff` showed the two passes' edits genuinely intermingled at
the line level — e.g. the `#disclaimer` div is one line in the HTML, and it went
straight from the pre-ccRCC version to the post-TNBC-fix version in one continuous
edit, never passing through a real saved intermediate state. Splitting would have
meant hand-fabricating a synthetic "TNBC-only" version of shared lines that never
actually existed — flagged this directly instead of attempting it, and the user chose
to commit both together as the real, actual working-tree state rather than risk a
synthetic split. Worth remembering: check `git diff` for this kind of interleaving
*before* offering to split a commit, not after promising it's possible.

**Organ #5 (Liver → Hepatocellular Carcinoma) added, committed as `7af716c`
(2026-08-25).** Same data-driven pattern, citations verified up front. Two genuinely
new mutation-architecture models, both now standing CLAUDE.md data rules: TERT
promoter mutation is trunk for a *temporal* reason (earliest event in time — found in
premalignant cirrhotic macronodules — not present-in-every-region like every prior
trunk gene), confirmed via Nault et al. 2013 + Schulze et al. 2015's direct temporal-
ordering statement; TP53/CTNNB1 is a "general rule + documented exception" pair —
"largely" mutually exclusive (Laurent-Puig 2001, Friemel 2016), but Friemel 2016 is
itself a case report of both mutations coexisting in one heterogeneous tumor, wired
into the actual panel text (not just a code comment) since the task explicitly wanted
the heterogeneity theme user-facing. AXIN1 was in the task's own suggested gene list
but got caught and dropped after verification found it's mutually exclusive with
CTNNB1 (same Wnt pathway) — a subtler mechanistic-fit miss than ESR1/MDM4 or
SMAD4/PTEN, since it was the right cancer and right pathway family, just competing
with a gene already used as a branch driver.

**Post-commit-request cross-check pass (same day)** on two anchor figures, requested
explicitly by the user rather than self-initiated: TERT's 59% (Nault 2013) held up as
a real number but is cohort-specific (French, alcohol/HCV-skewed, surgical) — checked
against 3 more cohorts (Schulze ~60%, TCGA 44%, Aizimuaji 2025 HBV-dominant ~39-45%),
spread of ~39-61% traced to Nault's own HCV-vs-HBV split rather than left as an
unexplained discrepancy; kept 59% as headline but added the range explicitly to
in-app text (same treatment as LUAD's KRAS, ccRCC's VHL). Could not locate the user's
referenced ~49%/>4,000-case meta-analysis after 8 searches (Europe PMC, Crossref,
Semantic Scholar rate-limited) — reported that honestly rather than fabricating a
citation. Katyal et al. 2000's site frequencies (lung 55%/bone 28%/lymph nodes 41%,
single-institution CT-imaging, ~1990s) cross-checked against Zhuang et al. 2025 (SEER,
N=2,197): lung corroborated closely (51%), bone diverged notably (43% vs 28%, likely a
denominator difference — Zhuang restricts to single-metastatic-site patients), lymph
nodes has no modern corroboration at all (Zhuang doesn't study it) — all three
outcomes stated explicitly in-product rather than picking a winner or smoothing over
the gap. One real bug caught during initial verification: dev-comment language ("see
the comment above this block") had leaked into user-facing trunk-mutation text —
fixed and re-verified before the cross-check pass even started.

**Organ #6 (Brain → Glioblastoma) added, committed as `b395dd2` (2026-08-25) — the
first genuine structural departure, not just a data-sourcing pass.** GBM's
extracranial metastasis rate confirmed under 1-2% from two independent sources (Majd
et al. 2024 "<1%", Conejero Merchán et al. 2026 "<2%") *before* any other work
started — this organ's "sites" screen represents four real intratumor regions
(enhancing core, necrotic core, infiltrative margin, peritumoral edema — matching the
Ivy Glioblastoma Atlas Project's own zonation) instead of distant organs.
`pos3d` values deliberately clustered tight (the opposite of every other organ's
"spread apart" rule) so the four blobs visually merge into one mass — a new
optional `regionWord` field on `CANCER_DETAILS` (default `'site'`, GBM sets
`'region'`) swaps the label terminology with zero effect on the other five organs.
Trunk is a two-entry array for the first time (IDH-wildtype status — the actual 2021
WHO reclassification criterion, "eliminates the term 'Glioblastoma, IDH-mutant'" —
plus TERT promoter mutation at 83%) — the shared rendering already `.forEach`s over
`trunk`, so this needed zero new code, just two data entries. EGFR/PDGFRA
amplification assigned per-region specifically because Snuderl et al. 2011 and
Sottoriva et al. 2013 both confirm this heterogeneity is *spatial* (different regions
of one tumor), not *population-level* the way LUAD's KRAS/EGFR exclusivity is.

**Three mechanistic-fit catches in one organ, the same class of check that caught
HCC's AXIN1 — applied before shipping, not after:** ATRX loss (real, common in
glioma generally, but a defining IDH-*mutant* astrocytoma marker — wrong molecular
subtype for this IDH-wildtype-specific organ, not merely "wrong pathway"); NF1 loss
(confirmed mutually exclusive with EGFR, already a branch gene); RB1 loss (confirmed
mutually exclusive with CDKN2A/B deletion, already a private-pool gene) — both
excluded and documented in-code. MGMT promoter methylation — clinically the single
biggest predictor of temozolomide response — was explicitly decided, not silently
dropped: it's epigenetic, not a mutation, the driver/passenger badge CSS has no third
category, so it's explained in prose inside the IDH-wildtype trunk note instead of
forced into the ledger. One more dev-comment leak ("see the comment above this
block," verbatim the same bug class as the HCC pass) caught and fixed during
verification, this time before shipping rather than after. Full keyboard + mouse
regression (click-vs-drag guard specifically re-tested against the new
tightly-clustered blobs, since three.js raycasting still had to resolve overlapping
geometry correctly) confirmed all five prior organs unaffected.

**Organ #7 (Prostate → Acinar Adenocarcinoma), commit `43717a9`** — the last of the
original five-organ list, expanding to seven with GBM and Prostate as two distinct
structural departures beyond the real-anatomical-metastasis model. Male-only body
scoping (`sexes:['male']`) and marker position (`heightFrac:0.46`) were already
correct in pre-existing placeholder code — verified via `inertAncestor:true` +
zeroed bounding rect on the Female body, not rebuilt. **Third distinct site-model**:
independently-arising multifocal tumor foci within one gland (`regionWord:'focus'`),
joining real-anatomical-spread (five organs) and intratumor-regions (GBM) as three
site-model families — new standing rule (CLAUDE.md data rule 15). This departure is
for a different reason than GBM's: prostate adenocarcinoma DOES metastasize
(bone-dominant, 90% of hematogenous mets, Bubendorf et al. 2000, N=1,589 autopsy —
acknowledged in trunk-note prose, deliberately not built into a fourth drill-down
level), the departure is genuine multifocality with independent clonal origins
(Fontugne et al. 2022: 76.5% of specimens have ≥2 foci). TMPRSS2-ERG fusion and SPOP
mutation are the two confirmed mutually-exclusive branch genes, split two-foci-each
(HCC/GBM precedent). PTEN loss and CHD1 deletion included in the shared private pool
with a *new* mechanistic-fit category — soft, one-sided cooperating enrichment (not
hard exclusivity) is safe for a pool drawn regardless of branch, same as HCC's
ARID1A/ARID2/NFE2L2 precedent, distinct from the AXIN1/NF1/RB1/PIK3CA hard-exclusion
class. SPINK1 was checked and excluded (confirmed mutually exclusive with ERG,
competes with a branch gene already in use) — same class as AXIN1/NF1/RB1/PIK3CA.
Real subtype list (Siech et al. 2026, SEER N=427,055) is deliberately asymmetric —
acinar 99.68%, four other subtypes each <0.2% — presented honestly rather than
forced into false balance with prior organs' lists. **Two corrections to the
research brief:** "MYCL amplification with TP53 loss" dropped outright (TCGA 2015
explicit null finding, direct contradiction not just thin evidence); a specific
ERG+/SPOP-adjacent-foci anecdote (misattributed to "Boutros et al. 2015," actually
Cooper et al. 2015, PMID 25730763) replaced with corroborated population-level
discordance data (Fontugne 2022 59.7%, Mehra 2007 70% ERG-specific, Cyrta 2022,
Segura-Moreno 2023) — Cooper et al. 2015 itself documents the *opposite* finding,
convergent ERG evolution across independent clones. One bug caught during in-browser
verification: region names like "Focus 1" collided with the new `regionWord:'focus'`
suffix, rendering "Focus 1 (peripheral zone) focus" — fixed by renaming to
zone-based names ("Peripheral zone A/B/C", "Transition zone") that omit the word
"focus" themselves, letting `regionWord` supply it cleanly wherever appended.
Verified live in-browser (not just read back): a private-pool CHD1 deletion landed
on an ERG-branch cell and a PTEN loss landed on a SPOP-branch cell — both real
random placements that confirmed the soft-enrichment wording holds up honestly even
when it happens, unlike a hard-exclusivity claim would. Full keyboard + mouse
regression confirmed all seven organ/cancer pairs unaffected by each other, zero
console errors throughout.

**Tech-debt fix + mesh detail pass, commit `4673538`.** Two parts, both verified in
browser before committing. **Part 1**: inventoried tech debt straight from CLAUDE.md's
"Known limitations," not a stale summary. The LUAD-pass note claiming a site-label
overlap bug was "confirmed pre-existing in both HGSOC and TNBC" didn't fully hold up —
direct re-check (pairwise `pos3d` distances + screenshot) found HGSOC already clean
(min distance ~1.6, no overlap) and left it untouched; only TNBC's Lung/Brain pair
(distance 0.91) was real, fixed by respacing (`{1.6,1.4,0.6}`/`{-1.0,1.3,-0.3}`, two
iterations — first attempt cleared Lung/Brain but drifted Lung into Liver, caught by
re-screenshotting rather than declaring done after one edit; also hit a stale
ES-module cache masking whether the fix had landed at all, resolved by fetching the
raw served file directly rather than assuming the edit was wrong). Color-management
pipeline (parked since the r128→0.185.1 migration) evaluated and reconfirmed parked,
not re-tuned — backed by the file's own existing measurements (39% luminance drop,
light-scale validated against a π target), reported as a recommendation and held for
explicit go-ahead before touching anything with app-wide visual impact. **Part 2**:
found all seven cancers' tumor site/region/focus meshes share one
`IcosahedronGeometry(0.6, 3)` call site — one fix, not seven. Root cause was vertex
density (normals were already recomputed correctly after displacement), most visible
on tumor-blob spike tips (`organicSpiculate`'s `sharpness:11`) and Brain's high-freq
organ wobble. This environment's `requestAnimationFrame` loop is unmeasurable
(`document.hidden` stays true even with the tab fronted, so rAF never fires between
tool calls) — built an independent synthetic `THREE.WebGLRenderer` benchmark instead
(same displacement code, isolated from the app) timing raw `render()` calls; every
tested level (organ spheres 48→192 segments, Icosahedron detail 3→9) stayed under
0.08ms/frame, noise-dominated. Chose a modest step up (organs 48→80 segments, tumor
Icosahedron detail 3→5) rather than the ceiling the benchmark allowed, deliberately.
Verified after: raycasting/click-to-navigate, the click-vs-drag guard specifically
re-tested against GBM's overlapping clustered blobs, the full keyboard chain
(dispatched as real `KeyboardEvent`s since synthetic OS-level keys don't reliably
reach a backgrounded tab either), and visual distinctiveness preserved across organ
types (Kidney vs. Brain still read as different shapes) — all confirmed via
before/after screenshots and a full seven-organ regression sweep, zero console
errors. User explicitly praised the environment-constraint disclosure (built a real
substitute benchmark and said plainly the real fps couldn't be measured, rather than
skipping the check or asserting an unverified "runs smoothly"), the shared-call-site
discovery turning seven fixes into one, and the restraint of not maxing out detail
just because headroom allowed it.

**ES-modules refactor, commit `0598173`.** Split the single ~2,816-line `cancer-atlas.html`
into ES modules — no build step, no bundler, still `python3 -m http.server` — the
"needs modularizing" item Known Limitations had flagged since the three.js migration.
`cancer-atlas.html` is now a ~367-line shell (markup+CSS+import map) loading `js/main.js`.
Module map: `js/viewer.js` (makeViewer/organicDisplace/organicSpiculate/
applyMottleVertexColors/makeMoveTracker — pure, zero redesign needed), `js/rng.js`
(seeded PRNG, shared by viewer.js and panel.js), `js/accessibility.js`
(makeActivatable/landFocus), `js/organs/{ovary,breast,lungs,kidneys,liver,brain,
prostate}.js` + `js/organs/index.js` registry (one file per organ — this is the piece
that actually kills the "file keeps growing" debt; organ #8 = one new file + one
registry line), `js/state.js` (shared mutable-state object — ~15 vars that used to be
bare `let`s in one closure, e.g. `screen`/`currentOrganKey`/viewer instances — plus
`siteBlobs`/`siteLabelEls` as `export let` + setter pair since those get reassigned
wholesale on dispose, not just mutated in place), `js/breadcrumb.js`/`js/panel.js`/
`js/search.js`/`js/body.js` (the four shared-UI-module splits — three of these are
one-directional leaves; breadcrumb.js needed a register-once callback pattern
(`initBreadcrumb({setScreen,txGoLevel})`) instead of a circular import back into
main.js, since crumb clicks trigger screen-level navigation), `js/main.js` (entry
point: screen 1→2→3 orchestration + bootstrap). Verification method for the
zero-transcription-error requirement: programmatic diff (not manual re-reading) of
every text/citation/gene field (366) and every numeric/geometry field (97) between
the pre-refactor commit and the split files — caught one real gap on the first pass
(4 alias-collision-check comments dropped from lungs/breast/liver/kidneys during the
split), restored before considering it done. Full regression: all seven organ/cancer
pairs × all three site-model families, full keyboard+mouse incl. click-vs-drag guard
re-check on GBM's clustered blobs, search/alias collision checks, male/female body
toggle sex-scoping — all unaffected, zero console errors, confirmed via network-tab
inspection that all 17 modules load 200 OK with correct `text/javascript` MIME type
and correct dependency order. `.claude/launch.json` needed no changes (serves the
whole directory root already). `CLAUDE.md` Architecture Notes got a full new
"File layout / module map" section.

0d437ef (2026-08-27): real anatomical models for Lungs/Kidneys/Liver/Brain/Prostate,
replacing their procedural meshes — NIH 3D Print Exchange's Human Reference Atlas
(CC BY 4.0; Visible Human Dataset for all five, Allen Human Brain Atlas additionally
for Brain), STL→GLB via Blender headless (vertex-weld via smooth shading alone cut
file sizes 66-78% before any decimation; only Brain+Lung needed further, conservative
decimation on top). Hotspots re-anchored to literal raycasted points on the real
geometry (replacing the old dir-vector-times-ellipsoid math, which had no equivalent
against irregular real anatomy). Prostate mesh deliberately reduced to gland-only
(dropped probable ejaculatory-duct/vas-deferens appendages from the source scan for
visual consistency with the other four organs) — flagged in CLAUDE.md as a possible
future refinement, not silently decided. Ovary/Breast deliberately untouched, still
procedural, pending a separate future decision. Two bugs caught mid-pass, both
corrected and documented in CLAUDE.md as their own entries (not folded silently into
the organ-mesh work): (1) topology-check methodology — an absolute degenerate-face
area threshold falsely flagged Prostate at 39% degenerate before being corrected to
a scale-relative threshold; (2) **the dev server (`python3 -m http.server`, this
project's whole local-preview setup) sent no `Cache-Control` header at all**, so the
browser silently served ~90-minute-stale JS under RFC 7234 heuristic freshness across
reloads, tab closes, and even full server-process restarts — invalidated an entire
verification pass, which had to be discarded and re-run in full once caught. Fixed
durably via `.claude/nocache_server.py` (subclasses `SimpleHTTPRequestHandler` to add
`Cache-Control: no-store`) + updated `.claude/launch.json` — **this fix is real on
disk but a given already-running Claude Code session's own `preview_start` may have
cached the old launch.json at session start and keep launching the bare `http.server`
regardless; only a fresh session reliably picks up the corrected config.** Default
per-organ camera framing (`theta`/`phi`) was checked rather than assumed to carry
over from the procedural defaults: Lungs' original framing was confirmed correct as
shipped (no change needed — it only ever looked broken because of the caching bug);
Kidneys' showed zero visible hotspot markers by default (all four clustered on the
medial/hilum side, all on the far side of the camera) and was corrected to aim at the
hotspot cluster's own average direction. Full mouse+keyboard regression re-verified
against confirmed-fresh code (live vertex-count/bounding-box introspection per organ,
not just visual impression) across all five changed organs plus both full cancer
chains (HGSOC, TNBC) end-to-end through site→cell→panel→Escape.

0d71fa7 (2026-08-27): real Breast mesh integrated (NIH 3D 3DPX-020977, CC BY 4.0 —
custom hand-sculpted, expert-reviewed, NOT a Visible Human trace; 52 disconnected
components confirmed via the entry page's own ontology tags to all be real anatomy,
opposite conclusion from Prostate's 54 by the same investigate-first method); Ovary
research conclusively negative a third time (NIH 3D's "real" ovary entry = 424
triangles, worse than the procedural mesh), fallback = StatPearls-verified 3.5:2:1
proportions on the existing procedural mesh.

1162e51 (2026-08-27): verified real-tissue material colors on all seven organs (each
cited to a real gross-anatomy source, checked numerically via Blender+PIL pixel
sampling — the app's own rAF loop is unmeasurable headless) + opt-in `warmLighting`
in makeViewer, scoped to organ viewers only (body/tumor-site viewers untouched;
color-management pipeline decision still parked). A Prostate "two-material" defect
turned out to be shadow-casting in the verification renderer itself — the live app
has no shadow mapping anywhere — fixed in the tool, zero app changes needed.

3f367fc (2026-08-27): persistent collapsible organ-library sidebar across all three
screens (new `js/sidebar.js`, register-once `initSidebar(selectOrgan, onLayoutChange)`
same pattern as search/body). Static thumbnails `assets/thumbs/<key>.png` rendered
offline via Blender from real shipped meshes+materials+warmLighting (live WebGL
thumbnails rejected: 7 contexts + ~28MB GLB fetches for 44px images); Ovary thumb =
exact Python port of organicDisplace's sine math. Desktop: open rail shifts .screen/
#header left, toggle pushes .resize() to all live viewers (no ResizeObserver exists);
mobile ≤640px: collapsed slide-over drawer, auto-close on successful navigation only.
aria-current highlight persists organ→cancer screen; toggle tab mid-left avoids
breadcrumb/legend/disclaimer corners; sidebar DOM-placed after screens, before
#header (content→chrome tab order). Same commit fixed a significant LATENT bug found
in screenshot review: #disclaimer had no max-height ever — 1,597px tall on a 900px
viewport, overlapping every viewer, proven pre-existing via git-worktree measurement
of the pre-sidebar commit (user's sidebar-regression guess checked and disproven with
evidence, which they explicitly praised). Fix: max-height:38vh + overflow-y:auto +
pointer-events:auto (needed for scroll; panel-open now also sets pointer-events:none
to avoid an invisible dead zone) + role/aria-label/tabindex + moved to last child of
#app (same Shift+Tab-only problem #header's comment documents). Prostate thumbnail
initially rendered fully transparent — ~5cm mesh inside Blender's default 0.1m camera
near-clip — caught by opaque-pixel-count check, fixed with clip_start=0.001. CSS
transitions freeze in the headless pane (document.hidden stays true, same constraint
as rAF) — verify toggled layout with transitions disabled or in headless Chrome.
Screenshot delivery channel that works: save real PNGs to ~/Downloads/<dir>/, user
attaches them via claude.ai upload themselves — no Claude Code tool can transmit
images into the user's chat.

73294d6 (2026-08-28): clip-fix — blown-white concave patches on organ screens (up to
26% of lungs' pixels) root-caused to per-marker teal glow PointLights: real-mesh
markers sit AT the raycast surface (distance-zero light, unbounded grazing specular,
teal G+B stacking on warm-lit R past hard clip); concavity correlation was
proximity-to-marker (kidneys' 4 markers cluster in the notch), NOT concavity; latent
since 1162e51, proven-not-regression via worktree measurement; approval-time
invisibility = Blender review renders modeled ambient+key only (no marker lights) —
new standing rule: organ-look approval screenshots must come from the LIVE pipeline
(puppeteer renders rAF/WebGL headless fine; the in-app pane doesn't). Fix: glow
lights removed for real-mesh organs only (ovary's procedural floating-marker glow
untouched, never broken), warm lights 0.42/0.65 (diffuse-clip-safe), all 7 materials
MeshStandardMaterial→MeshPhysicalMaterial + specularIntensity 0.15 (the approved
Blender model's missing half; colors/roughness untouched). All 6 real-mesh organs
0.0% blown pixels, hue ratios in-family. Also backfilled 1162e51's missing CLAUDE.md
history entry (had only existed in code comments + commit message).

fdf66e4 (2026-08-28): procedural Microscopic View (stylized H&E histology) for all
7 cancers — new js/histology.js (seeded SVG generators keyed by cancer id:
hgsoc/tnbc/luad/ccrcc/hcc/gbm/acinar, 800×500 viewBox) + `histology` data block per
cancer in js/organs/*.js (intro/ariaSummary/citation/features). View MODE of
cell-scatter level 2 (toggle w/ aria-pressed, cell↔hist layer swap, breadcrumb
unchanged, panel dismissed on toggle w/ focus pinned to toggle);
#screenCancer.hist-open hides legend/caption/disclaimer (card carries own citation +
fixed not-a-real-micrograph line). Verification OVERTURNED two research-brief claims
(recorded in organ-file comments): HGSOC "fibrovascular cores" = low-grade/endometrial
serous phrase, excluded; HCC 70/20/10/1% not citable + ordering contradicted
(real: trabecular > pseudoglandular > solid > macrotrabecular, 50% mixed, MTM-HCC 12%
Ziol 2018). GBM necrosis/MVP = literal WHO 2021 five-OR diagnostic criteria (Louis,
verbatim); prostate 3→4→5 labeled "schematic composite of the grading spectrum" (real
tumors mix patterns; no ordered-gradient source), score wording avoids
"second-most-prevalent" universality (needle biopsy grades worst-as-secondary). Bugs
self-caught: labels covering their own structures (GBM tuft, prostate cribriform
lumens — near-solid mass was accidentally pattern-5 density in the pattern-4 slot);
3 mobile layout collisions. Harness gotcha for future passes: puppeteer setViewport
isMobile flip RELOADS the page mid-session (guarded null-cancer path in
enterHistology; unreachable by real users).

COMMITTED as 3c78c88 on main (2026-08-28): user approved the full batch after one
revision round — the two round-1 items, both fixed before commit: (1) stomach silhouette read as a
blob: root cause was cone-shaped single-pole-fan end caps, replaced with real
hemisphere caps + steeper antral taper (0.052→0.038→0.026→0.017m) + tighter J-hook,
axis now ~29cm (inside Cunningham's 26–34cm authorities range, past his 25–27.5cm
headline — stated as such), pylorus ends ~8.5cm above the J's low point; delta
re-verify: 4/4 hotspots visible, blown-white 0.00%, zero errors; screenshots 05+17
re-taken, README updated; (2) serosal-color inference caveat made USER-FACING:
disclaimer sentence confirmed live + new closing note in the Stomach organ desc —
Prompt 1 of a two-prompt sequence): organs #8-10 in one pass — Colon→Colorectal adenocarcinoma,
Pancreas→PDAC, Stomach→diffuse-type gastric adenocarcinoma. Review package at
~/Downloads/cancer-atlas-three-organs-review/ (17 numbered PNGs + README). Prompt 2
(Skin→Melanoma, a 4th structural departure needing a representation decision FIRST,
stop-and-report if involved) is explicitly deferred until this lands. Key state:
- NEW MESH PIPELINE: colon.glb/pancreas.glb are ORIGINAL HRA-authored GLBs via
  3d.nih.gov/api/files/<inputFileId> (no STL/Blender), byte-identical to upstream
  (sha256 84a66fb4…/edb41456…), preserving NAMED sub-meshes (colon 10, pancreas 5);
  hotspot pos derived from sub-mesh vertices in code, no hand picker. HRA GLBs are
  body-space — buildMesh recenters gltf.scene by bbox center at load (applyFraming
  orbits the origin). MALE colon deliberately (female model self-documents as "not
  based on direct imaging data"; male is colonoscopy-derived — provenance beat the
  female convention, kidneys'-left-only precedent).
- STOMACH: procedural (HRA has NO stomach, confirmed 4 ways; NIH 3DPX-021124 has
  fabricated attributions; BodyParts3D license self-contradiction; Z-Anatomy CC BY-SA).
  Best rejected candidate kept on file for the user: Open Anatomy SPL Model_41_Stomach
  .vtk, CT-derived 35,088 pts, 3D Slicer BSD license requiring full-license-text
  reproduction. Swept-tube J to Gray's-1918/Cunningham-1905 verified dims. Two real
  geometry bugs caught by measurement: inverted winding (raycast hit far wall), and
  radius profile indexed by control-point number while curve samples by ARC LENGTH
  (thin fundus/fat pylorus). pos-anchored hotspots on a procedural mesh work — the
  isRealMesh branch keys on pos-vs-dir, not provenance (no glow lights, correct).
  Gastric SEROSAL color = flagged inference (no source states it; mucosal quotes only).
- BIGGEST BRIEF CORRECTIONS (all verified at source): CRC liver-met figures were
  swapped/inflated (real: ~15% synchronous across 5 national registries, ~20-27%
  5-yr; ~50% rejected in print by Engstrand 2018); Fearon & Vogelstein 1990 never
  names APC (Powell 1992 is the APC-first cite); PDAC cascade is NOT 4 ordered steps
  (Notta 2016 states the classical model verbatim then refutes it — punctuated
  equilibrium; ship 3 tiers + caveat; KRAS FLAT ~92-95% from PanIN-1A, rising
  gradient was assay artifact); 2 wrong PMIDs in brief (Wilms'/CMAJ papers); Lauren
  54/32/15 is a MIS-CITATION of a 41-pt esophageal study with diffuse/mixed
  transposed (real: KGCA N=14,658 50.0/39.0/10.9); "diffuse more common in women"
  false (sex-equal M/F 1.07).
- NEW STANDING NOTES in CLAUDE.md (rules 17-19 + rule 5 amendment): KRAS×TP53 anti-
  correlation in colon = 4th mutation-framing model (OR 0.69 p=0.02 n=638 — modest,
  NOT exclusivity, ~1 in 6 carry both; KRAS+TP53 at different sites, neither in
  private pool, BRAF banned outright OR 0.02, PIK3CA safe OR 4.0 co-occurrence);
  PDAC = 3rd temporal trunk (KRAS 93%, TCGA 30,000x). Gastric: CDH1 trunk (37% GS /
  56.3% sporadic diffuse + methylation second hit), RHOA×CLDN18-ARHGAP fusion strict
  TCGA exclusivity split 2 sites each (GBM EGFR/PDGFRA architecture); ARID1A excluded
  (MSI/EBV-enriched + negatively associated w/ TP53); wired the DIFFUSE type
  deliberately (unique adhesion-loss mechanism; intestinal 50% listed inactive).
- CRC private pool: FBXW7 11%/TCF7L2 12%/AMER1 7% (published APC co-occurrence,
  Cornish Nature 2024 + Li 2025); SOX9 excluded on an UNPUBLISHED but 3-cohort-
  replicated Bonferroni-surviving TP53 anti-correlation (computed, recorded as such);
  ARID1A excluded; Nunes-2024 timing honesty note (these genes are early/clonal —
  private tier = per-cell illustration, stated in-product).
- pos3d DESIGN METHOD UPGRADED (Known Limitations): raw 3D min-distance is
  insufficient — CRC's first spread (3D min 2.09) still merged blobs on screen;
  correct metric = PROJECTED pairwise distance at the site viewer's default camera
  (theta 0.6, phi 1.15; screen-up/world-Y is rotation-invariant); optimized spreads
  (projected minima CRC 1.75/PDAC 1.68/GDIFF 1.97), verified via camera-reset
  screenshots at exact default rotation, not timing races vs autoRotate.
- BODY-MARKER RAYCAST TRAP: heightFrac <~0.46 at moderate angles slips the inward ray
  through the thigh gap onto the far buttock (wrong side, sex-dependent) — found by
  grid-probing both meshes; colon marker = 0.48/-50, stomach 0.585/-32, pancreas
  0.58/0. App's marker-side convention is MIRROR-view (liver +40 renders image-right).
- Histology: 3 new generators (crc/pdac/gdiff) — gdiff is the atlas's first
  non-gland-forming slide (signet rings); WHO 6th ed 2026 changed CRC grading
  (one-HPF rule; cribriform = differentiation NOT grade; budding reported
  separately); PDAC PNI honest range 80-90% (brief's 70-100% floor unsupported).
- Field-rendering trap learned: sub/desc/hotspot label+text/region name/histology
  strings are textContent (NO HTML entities); facts val + cancer share are innerHTML
  (entities required). Region names also flow through legend innerHTML — keep plain.
- Thumbnails: rewritten Blender script (Cycles, sun 3.5/ambient 1.2/pad 0.74)
  calibrated against approved liver.png; shipped thumbs predate clip-fix so slight
  G/B difference is expected+accepted. Blender OBJ-import axis options are NOT
  trustworthy — stomach OBJ ships 180°-about-Z pre-compensated, verified via
  marker-sphere renders at known coordinates (glTF import path has no such quirk).
- Verification: 91-check live-pipeline harness (/private/tmp/atlas-verify/regress.js,
  reusable) — all 10 organs 4-hotspots-visible, 10 cancers sites/cells/panel/
  histology, search+aliases, keyboard chain, blown-white 0.00% on new organs (ovary
  control 0.38% designed halo); only "failures" = GBM/Prostate label proximity
  (deliberately clustered designs, untouched). Disclaimer updated ("For all ten
  cancers" + attributions + 3 cancers' citations); CLAUDE.md now 2,599 lines.

PROMPT 2 (Skin→Cutaneous melanoma, organ #11) — BUILT, UNCOMMITTED, awaiting screenshot
approval (packet at ~/Downloads/cancer-atlas-skin-melanoma-review/, 12 PNGs + README).
User pre-approved all four design decisions at the checkpoint: cross-section block,
taxonomy-as-organ-representation-departure (NOT a 4th site-model family — cancer screen
uses ordinary distant-met model), sex-differentiated markers with FRONT-visible male
chest (user resolution), verified layer colors (WHITE dermis — diagram pink unverifiable
— yellow fat, mid-brown surface + equity note). Also user-directed: nodular 15-20%-of-
primaries/40%-of-deaths asymmetry surfaced in the visible cancer list.
Key state:
- js/organs/skin.js: layerSlab builder from shared interface fns (surfY/dejY/dhY);
  hotspot pos COMPUTED from the same fns at module load (can't drift). SCALE=5
  presentation scale — NEAR-PLANE TRAP, live-viewer first: makeViewer camera near=0.1m;
  a true-3cm block frames the camera ~7cm out → mesh renders as clipped floating
  fragments. Any future sub-~8cm organ refires this (Prostate frames at ~21cm, safe).
- body.js: markerSpec points[] now take optional per-point sexes filter (1-line,
  backward-compat). Female leg marker 0.17/+75 — side-on angle is GEOMETRIC NECESSITY
  (marker ray passes through the central axis; front-on rays thread the leg gap at calf
  height — thigh-gap trap in pure form). Male chest 0.78/+33. CONCORD-3 N=1.58M basis.
- Melanoma data: trunk BRAF V600E (52% TCGA, honest 43-70% range in ccf; V600E ~72% of
  BRAF, Jakob) + TERT promoter (75% of BRAF subtype; 2nd TERT-trunk organ, 4th temporal
  instance; HCC thread = same 2013 Huang screen, in product text). NRAS = hard exclusion
  (0.6%/677 — JAKOB 2012 not Colombino, brief premise corrected; class-3 exception
  correctly scoped as prose: V600E is class 1 RAS-independent per Yao Table 1; Nazarian
  treatment-pressure route also prose). Branch CDKN2A loss + PTEN loss cooperating
  (Dankort 100%-penetrance mouse; computed OR 3.39 validated pipeline). Pool: PPP6C
  R264C (co-occurrence as documented REQUIREMENT), ARID2, IDH1 R132, TP53 (TCGA's own
  "wild-type in ~90% of BRAF subtype" caveat printed), TTN+Alexandrov burden framing.
  MAP2K1 excluded on REDUNDANCY not exclusivity (stats lean co-occurrence OR 1.59 —
  first such exclusion); RAC1 excluded on rank (2x depleted in BRAF-mut, early-event).
- Sites: Riihimäki 2018 Cancer Med capstone (NO melanoma-specific Riihimäki paper
  exists — checked author's full record), N=4,923, extranodal by design; NS 49/44,
  Lung 41/39, Liver 29/27, distant Skin 18/22 (sex-split verbatim); maps to AJCC-8
  M1d/M1b/M1c/M1a; bone 18/16 = stated omission; distant nodes = no citable number
  anywhere. Brain framing: 28.2% among-metastatic-at-diagnosis (Cagney, PMID 28444227 —
  brief's 28666227 was a chromatography paper), NOT per-incident-case (lung wins);
  "75% autopsy" carried only as review estimate. pos3d projected-min 2.15 (best yet;
  first spread 1.43 merged NS/Liver — method caught it).
- Histology genMelanoma: SSM field, Breslow ruler annotation to explicit deepest cell,
  pagetoid + irregular nests labels; NO solar elastosis (LMM finding, SSM is low-CSD);
  "THE most important prognostic factor" (SINGLE unsupported); Gershenwald contains
  NEITHER Breslow definition NOR superlative (full-text verified) — staging mechanics
  only. Melanin brown = assembled 2-source inference, recorded.
- New rejection class #3: STRUCTURALLY UNSUITABLE REAL ASSET (HRA whole-body skin shell
  3DPX-020986/021016 downloaded+parsed: 1 mesh, 191,322 verts, zero layers, 12.2MB) —
  vs "none exists" (Ovary/Stomach) and "license regime" (Open Anatomy).
- Citation-trail defect recorded: TCGA 2015 itself mis-cites Pollock 2003 twice (nevi
  paper ≠ either claim); claims sound, cite TCGA's own data. Pollock says V599E, 82%.
- Thumbnail: first multi-material (render_thumb_multi.py, manifest of per-part OBJs,
  same calibration, stomach v -x z y axis convention). Installed assets/thumbs/skin.png.
- Verification: battery now 99 checks (auto-enumerates ORGANS) — 97 pass, 2 = the
  documented GBM/Prostate clustering flags; skin blown-white 0.00% via PIL (in-page
  canvas readback reports meshPx 0 for this organ — non-preserved-buffer artifact,
  known); aliases skin/melanoma/mole/cutaneous/epidermis/derm unique; dermis 0xf2eee6
  renders (213,189,158) on cut face ≈ whitest the warm legacy pipeline shows (pure-white
  albedo bound R/G ~1.06-1.10, ours 1.13). CLAUDE.md: data rule 20 + architecture entry
  + rule-3-of-next-steps updated; disclaimer "For all eleven cancers" + skin block
  provenance + full source list. NOTHING COMMITTED until user approves the packet.

ORGAN #11 COMMITTED as cd250a9 on main (2026-08-28): user approved the full packet on
sight; the one review flag — the not-to-scale wording narrowly implied only layer-RATIO
exaggeration while the block is also 5x overall — was broadened in both user-facing
places (organ desc: "neither its overall size nor its layer proportions are to scale";
disclaimer: "illustrative in both overall size and layer proportions — nothing about it
is to scale") + CLAUDE.md architecture entry updated, re-verified live (both strings
render, no entity leaks, zero page errors) before commit. 7 files, 906 insertions.
User specifically praised: the histology Breslow ruler as "the standout of this whole
pass" (a genuinely different visual device doing real teaching work), the block
legibility (stomach-J-hook lesson applied), the ivory-not-pink dermis discipline, and
the BRAF note's earned density. Next organ = pair #12, undecided.

STANDING DESIGN PATTERN (user-articulated at the organ-#11 close-out, to carry into any
future organ pass): when a cancer's defining prognostic fact is a MEASUREMENT rather
than an architectural pattern, the histology slide can depict the measurement itself —
the melanoma Breslow-depth ruler (a gauge from the granular layer to the explicit
deepest invasive cell) is the precedent. Candidates where this could recur: any cancer
staged primarily by a depth/size/count read off the slide rather than by pattern
recognition. Atlas state at close-out: 23 commits, 11 organs/cancers, 4 site-model
families, HEAD = cd250a9.

ORGAN/CANCER PAIR #12 — OVARY/CLEAR-CELL (OCCC), COMMITTED d74095b on main (2026-08-30),
approved on sight across every screenshot, zero revision rounds. Second wired cancer under one organ (HGSOC untouched;
architecture needed only data — renderCancerList/initSiteViewer already generic).
Review packet: ~/Downloads/cancer-atlas-occc-review/ (10 PNGs + README). 7 files
modified: js/organs/ovary.js (aliases, clear active w/ "~10% — ~27% in Japan" share,
qualified surface-epithelium desc+hotspot, REGIONS/TRUNK/PRIVATE_POOL/HISTOLOGY_OCCC,
cancerDetails.clear), js/histology.js (genOCCC + registry 'clear'), js/search.js
(Enter now auto-navigates ONLY on unique match — fixed a live pre-existing
silent-first-match bug), js/organs/index.js + kidneys.js (false "collision-free"
comments corrected), cancer-atlas.html (OCCC source clause + eleven→twelve),
CLAUDE.md (data rule 21 after rule 20; eleven→twelve x2).
- Site model RESOLVED (the user's gating question): same routes as HGSOC (Kondo 2020
  "No CCC-specific recurrence site"; Rose 1989 autopsy "nearly identical"), so family 1,
  NO new family — difference is timing/extent, in the legend line "same routes as
  serous — usually caught earlier". 72.4% localized+regional vs 22.1% HGSOC (Peres
  2019 n=28,118, USE COUNTS not printed 78.9%); ~90-93% unilateral. Sites CY/PV/PT/RP
  (globally unique ids): endometriotic-cyst primary / pelvis / peritoneum (54.2% top
  recurrence site) / retroperitoneal nodes (NOT higher than serous, note says so).
  pos3d optimized: projected sep 2.02 units (2nd best; melanoma 2.15), live 210px.
- Trunk: two-entry (GBM classifier precedent) — ARID1A loss 49% (205/421 Bolton
  2022; range 40-65%; temporal: Ayhan 2012 31/31 contiguous-endometriosis, 0/76 in
  HGSOC) + "TP53 — usually wild-type here" status (~15% vs 96%; OR 0.21 vs multi-hit
  ARID1A; platinum nuance: deficit is in platinum-SENSITIVE relapse 51.3% vs 76.0%
  Watanabe 2026, resistant setting indistinguishable — blanket "platinum-resistant"
  NOT claimed). Branches: PIK3CA 45% on primary (Chandler 2015 mouse: ARID1A-only 0
  tumors/yr, PIK3CA-only 80% hyperplasia 0 tumors, double 77% @ 7.5wk, IL-6), KRAS
  ~17% (never cite Mayr 2006 for OCCC KRAS), ZNF217 amp 31-36% (assoc WITH ARID1A
  loss P=0.028), PPP2R1A R183W (KRAS+PPP2R1A kept in different regions on purpose).
- Private pool = STRUCTURAL FIRST: 2 passengers, 0 drivers (quiet-genome story:
  median 46 non-silent, SBS1/SBS5; OBSCN R3140Q labeled single-tumor observation;
  TTN absent — 0 mentions across 634 OCCC tumors). Exclusions: PTEN (redundancy +
  mouse histotype divergence), CTNNB1 (endometrioid entity), TERT promoter
  (strongest exclusion in atlas: p=4.4e-9 vs ARID1A AND p=0.0019 vs PIK3CA, late
  event), ARID1B = NEW REJECTION CLASS #4 synthetic-lethal dependency (Helming 2014).
- Histology: PathologyOutlines UNREACHABLE this pass (HTTP 429 x4 over 2 days) —
  load rests on Diagnostics 2021 WHO review (OCCC+HGSOC same paper: <5 vs >12
  mitoses same-source) + DeLair 2011 + Uekuri 2013 (glycogen hedged "attributed
  to"). Drawn: small round non-branching hyaline-core papillae, hobnail, mixed
  clear+pink, uniform nuclei, ONE mitosis, hyaline bodies; NOT drawn: psammoma,
  pattern %-split (none exists), chicken-wire (ccRCC's), uniform clear field.
  ccRCC echo narrowed: glycogen vs glycogen+lipid/VHL — overlapping not identical.
- Brief corrections (all at source): ARID1A "43-78%" wrong both ends (78% = Bennett
  precursor freq, no primary); "IHC>sequencing" BACKWARDS (Wiegand itself 42 vs 46);
  PIK3CA "30-46%" wrong both ends (28.5-54; Bolton abstract 49% contradicts own
  Results 45%); mouse glosses "IL-6 only when both" and "ARID1A unleashes PI3K"
  both false at source. Endometriosis OR 3.05 verified (Pearce PMC3664011 — NOT
  PMC3352233), HGSOC null 1.13 p=0.13.
- Search: "clear cell" = deliberate 2-organ disambiguation (Kidneys+Ovaries);
  occc/ovarian clear cell unique to Ovaries; battery gained 4 search checks.
- Battery: 108 checks / 106 pass (only the documented GBM+Prostate cluster flags),
  page errors = favicon 404 only. Probes live in /private/tmp/atlas-verify
  (site_sep.js, regress.js updated, occc_packet.js).

PAIR #12 CLOSE-OUT (user's review notes, 2026-08-30): approved without changes. User
specifically praised: the quantified site-model gate (GBM's <1-2% bar vs OCCC's 35.5%
distant recurrence — "principled reasoning against an actual precedent, not a judgment
call"); turning citation discipline on the user's OWN suggested hook (the ccRCC echo
correction); the asymmetric mouse-model correction + catching the source paper's own
section heading overstating its IL-6 data; the driverless-pool restraint ("would have
been easy to relax the fit-check bar... not doing that is the right call"); the
Enter-key fix as a valuable side effect ("a real, pre-existing usability issue that
just happened to be invisible until 'clear cell' gave it something to collide on");
the organ screen's origin sentence called "the single best sentence in this whole
pass". STANDING ADDITION the user asked to carry forward: rejection class #4,
synthetic-lethal dependency (ARID1B precedent — a gene essential BECAUSE of the trunk
mutation rather than independent of it, so its loss cannot be drawn into those cells)
is now a named category in the mechanistic-fit framework alongside competing,
cooperating, and wrong-entity — check for it whenever a future private-pool candidate
interacts with that cancer's trunk. Atlas state: 24 commits, 12 organ/cancer pairs
(11 organs), 4 site-model families unchanged (OCCC = family 1), HEAD = d74095b.
Pushed at user's request same day: origin/main = d74095b, local and remote identical.

## State as of 2026-09-02 (supersedes commit-state claims above)

**HEAD = `78ecc42` on `main`, tree clean; local is 4 commits AHEAD of origin (last pushed:
`d74095b`).** The four unpushed commits, in order:
- `d6e3ada` — organs #13/#14: Testis/Seminoma + Bladder/Urothelial carcinoma (14 organ/cancer
  pairs total). CLAUDE.md data rules 22 (Testis), 23 (stratification/Simpson's-paradox standing
  check — verify any correlation within strata before building a two-entry model on it), 24
  (Bladder, incl. the CDKN2A 22%-vs-32% two-definitions reconciliation and the bladder GLB
  sub-mesh-centroid hotspot method + its two caught bugs: glTF accessor byteOffset is ADDITIVE
  to bufferView's, and nudge factors must be verified per-sub-mesh).
- `99b9a3e` — material/lighting realism pass, 8 real-scan organs (roughness x0.82,
  specularIntensity 0.15->0.25, new `applyTissueMottleVertexColors` in viewer.js — a <=1 gray
  MULTIPLIER, never a color lerp, because vertex colors multiply material.color in the shader)
  + Bladder mottle freq 13->4 tune (sparse mesh under-sampled the shared frequency).
  Transmission/SSS tested and rejected (no environment map; pixel-identical).
- `f358c0a` — Lungs mesh swap: "Realistic Human Lungs" by neshallads (Sketchfab, CC BY 4.0)
  replaces the fissure-less HRA asset (HRA confirmed exhausted: all versions = internal
  airway-segment model). Native baked textures kept; sRGB tag gamma-crushes under the app's
  no-reencode pipeline -> fix is `map.colorSpace = THREE.NoColorSpace`. Includes post-review
  2048->1024px normal-map downscale (surgical byte-replacement, A/B'd via request
  interception, mean deltas 0.19-0.59/255): asset 14.9MB -> 9.4MB. CLAUDE.md data rule 25:
  lungs texture tone is artist-authored, NOT color-verified.
- `78ecc42` — Colon mesh swap: "Small and large intestine" by antonia.sundberg (Sketchfab,
  CC BY 4.0, double-verified: embedded asset.extras + live page) replaces the HRA colon after
  a landmark-fidelity audit found haustra FAINT / taeniae ABSENT (HRA exhausted: v1.3
  position-data hash-identical to v1.2). Only the two Tjocktarm meshes (weld to ONE component;
  Tunntarm dropped). Taenia proven 3 ways (flat-shade two-light, pure vertex-data
  cross-sections at 3 heights showing a fixed-angle shoulder = continuous longitudinal ridge,
  texture band). Native textures kept (real 2048px normal map on UV set 2, live A/B beat the
  recipe). Asset 687KB -> 9.17MB. CLAUDE.md rule 26 = colon tone artist-authored (2nd rule-25
  instance; consolidate if a 3rd lands).

**Landmark-fidelity audit (read-only, packet in ~/Downloads/cancer-atlas-landmark-audit/):**
Brain/Kidneys/Liver/Pancreas PASS their identifying-landmark checks; Colon was the sole
failure (since fixed by 78ecc42). Prostate confirmed unchanged since 0d437ef.

**Standing build/verification lessons (all bitten at least once this pass):**
- FBX-derived GLBs: ancestor empty-node scales are NOT baked by transform_apply — unparent +
  delete empties before export, else world size is silently wrong (colon first export: 1.7mm).
- GLB verification must walk the exported node hierarchy; accessor min/max alone is
  vertex-space, not world-space.
- Blender `Object.bound_box` does NOT refresh after direct `mesh.vertices[i].co` edits —
  measure via numpy over foreach_get instead.
- Deterministic live-app camera control: `state.organViewer` is importable from page context
  (`import('./js/state.js')`) — freeze `autoRotate`, set camera via spherical coords,
  `controls.update()`. Marker dots are BOTH DOM overlays AND scene meshes; for clean
  silhouettes hide via `organMarkers.forEach(m=>m.mesh.visible=false)` + CSS. readPixels needs
  a `preserveDrawingBuffer:true` getContext shim (evaluateOnNewDocument) or returns zeros.
- Regression harness: `/tmp/atlas-verify/regress.js` (rebuild if /tmp wiped — pattern
  documented in CLAUDE.md-adjacent packets). Baseline: **146 checks, 2 failures** (documented
  GBM + Prostate label overlaps only). Blown-white bar <1.0%/organ; Testis has a known
  pre-existing angle-dependent blip to ~1.2% at some angles (out-of-scope procedural organ).
- Default colon camera angle clusters the sigmoid+descending marker pair (~30px) — rotate or
  zoom before using a frame as marker-visibility evidence.
- Review-packet convention: evidence claims must be inspectable in the delivered files;
  binary silhouette masks (app's own bg test r<40,g<45,b<60) and pure vertex-data
  cross-sections beat annotated renders when challenged.

**Review packets this arc (all in ~/Downloads/):** cancer-atlas-testis-bladder-review,
cancer-atlas-material-pass-review, cancer-atlas-bladder-mottle-tune,
cancer-atlas-lungs-realism-diagnostic, cancer-atlas-lungs-checkpoint-diagnostic,
cancer-atlas-lungs-source-search, cancer-atlas-lungs-integration-review,
cancer-atlas-landmark-audit, cancer-atlas-colon-swap-review.

## Organ #15 (Thyroid) in progress, as of 2026-09-02
Phase 0: free neshallads thyroid component FAILED (w/h 0.71 vs anatomical ~1.2-1.7; isthmus
~79% of lobe height vs real ~25%) — packet ~/Downloads/cancer-atlas-thyroid-phase0/. Phase 1
source hunt DONE — packet ~/Downloads/cancer-atlas-thyroid-source-hunt/: lead candidate
"TIROIDES ANDREA DACS UJAT" by andycopo55 (Sketchfab, CC Attribution verbatim, 9.9k tris,
textbook butterfly + narrow isthmus); backup "Thyroid" by ShapeShiftingBlob (CC-BY, assembly);
HRA + NIH 3D = zero thyroid gland models (definitive). AWAITING: user's Sketchfab download of
the lead + approval of the Phase-2 gate recommendation (TWO active entries — papillary
[BRAF-like: TCGA THCA, BRAF 61.7%, RET fusions 6.8%, RAS/BRAF virtually mutually exclusive
p=1.1e-5] vs follicular [RAS-like: GENIE n=168, NRAS 33.9%, TERT 22.6%, DICER1 15.5%];
WHO 2022 verbatim anchors the classification to the BRAF-like/RAS-like axis; NIFTP/oncocytic
complications for shares; invasive encapsulated FVPTC straddles naming — must be in-product).
Phase 2 research COMPLETE (2026-09-02), gate approved by user = TWO active entries. Key anchors,
all verified verbatim at source: shares Lim 2017 SEER-9 n=77,276 (PTC 83.6%, FTC 10.8%, medullary
2.2%, anaplastic 1.3% of cases but 19.9% of deaths); PTC = TCGA THCA PMC4243044 (BRAF 61.7%, RET
fus 6.8%, RAS/BRAF/RET virtually mutually exclusive p=1.1e-5, "more than one mutation confers no
clonal advantage", TERT promoter 9.4% NOT associated w/ BRAF + aggressive p=7e-8, 1q-amp class
14.8% BRAF/TCV-enriched, PPM1D/CHEK2 SMGs concomitant-with-MAPK, EIF1AX 1.5% EXCLUSIVE w/
RAS/BRAF -> rejected, 0.41 mut/Mb = THIRD quiet genome -> standing pattern now justified,
SCNA-quiet 72.9%); FTC = Nikiforova 2003 PMID 12727991 (RAS 49% / PAX8-PPARG 36% / both 3% —
"virtually nonoverlapping pathways" -> status-trunk + split branches, Prostate pattern) + GENIE
2025 PMC12843263 n=168 (NRAS 33.9, TERT 22.6, DICER1 15.5 w/ pediatric 44.4 vs 4.6 adult, HRAS
11.9, PTEN 10.7); route contrast PMC10135557 table (LN mets FTC <10% vs PTC 20-90%; hematogenous
FTC 29% vs PTC 9%; FTC-LN-mets -> re-review slides); FVPTC straddle: PMID 12866375 (FV RAS 43%
retPTC 3% vs non-FV retPTC 28% RAS 0%); histology PTC NBK536943 (Orphan Annie/grooves/
pseudoinclusions/psammoma verbatim, lateral nodes 27% at presentation), FTC = invasion-defined
(capsular/vascular, FNA cannot diagnose, mi- vs wi-FTC); anatomy NBK470452 (isthmus 2nd-3rd
tracheal rings, ~25g, pyramidal lobe 28-55%, sup thyroid a. = 1st br ext carotid) + NBK551659
(follicles/colloid=thyroglobulin/C-cells neural crest). BUILD AWAITS: user's UJAT mesh download.
Verification lesson (user-flagged as standing, 2026-09-02): when a reviewer cannot reproduce a
cited figure by searching, check whether it lives mid-paragraph in a results section — abstract
and table numbers surface in search; mid-paragraph results-text numbers (e.g. TCGA THCA's
"The 248 (61.7%) BRAF mutations...") do not. Quote such figures with their exact sentence and
section location, not just the paper.

**THYROID COMMITTED as `2b231a7` (2026-09-02) after user reviewed + approved the packet
(~/Downloads/cancer-atlas-thyroid-review/, 23 PNGs + PACKET.md); harness fix committed
separately as `f6e0a64` (user-designed two-commit split; viewer.js near-plane fix rides in
2b231a7 per 73294d6 precedent — thyroid can't render without it). HEAD = f6e0a64, tree
clean, PUSHED 2026-09-02: origin/main = f6e0a64 (d74095b..f6e0a64, github.com/Jayc92/Cancer-Atlas), local == remote. Two factual errors in the user's drafted
commit-1 message were corrected pre-commit with disclosure: "9,918 tris, no isolation
needed" → shipped GLB is 3,200 tris/1,709 welded verts isolated from the ~9.9k-tri neck
assembly; PTC sites "lung, bone" → PTC has no Bone region (primary/central/lateral
nodes/lungs). Harness now repo-tracked at .claude/regress.js — usage
`node .claude/regress.js [outDir] [port]`, ATLAS_PORT/PUPPETEER_CORE/CHROME_PATH env
overrides; verified from repo location against port 3056 → 161/3.**

**TESTIS BLOWN-WHITE CHARACTERIZED (2026-09-02, diagnostic only, packet
~/Downloads/cancer-atlas-testis-blownwhite-diagnostic/, driver /tmp/atlas-verify/testis_sweep.js):
84-sample deterministic sweep (24 yaw @ default pitch + 5-pitch grid, harness-verbatim
measurement) → 6/84 fail ≥1.0%, ALL inside θ15-45°×φ55-85°, worst 1.20% @ θ30/φ55; far side
0.00%. Window = camera aligned w/ key-light axis ((3,4,5) → θ31.0/φ55.5) and CONTAINS THE
DEFAULT VIEW (θ28.6/φ68.8 → 1.16-1.17%, matching suite's 1.19% — deterministic, not unlucky
sampling). Mechanism PROVEN by isolation: glow lights off → 0.00%, key off → 0.03%, specular
0.15→0 → 1.17% (irrelevant, spec's candidate eliminated); marker spheres hidden → 2.32%
(spheres occlude hottest halo core → blown ring is ON the organ surface around markers).
= Ovary's designed glow halo (0.34% same suite) on the palest procedural albedo (0xd6b98f,
R 0.839 × 1.07 warm peak ≈ 0.90 + teal glow → clips all 3 channels). Visually reads as
intended bloom, not damage. DISPOSITION DECIDED by user 2026-09-02: ACCEPTED as baseline
flag #3 (GBM/Prostate-overlap shape) — user's reasoning: reads as intentional glow affordance
("backlit indicator lights"), marker-associated light not tissue-color so no
anatomical-fidelity claim touched, scoped tweak = testing-tidiness for a non-problem.
Documented in CLAUDE.md harness entry w/ re-run trigger (any change to procedural marker
glow / organ lighting / testis material → re-run sweep first); committed e18d3cc, PUSHED
(origin/main = e18d3cc). Regression baseline = 161/3 all documented-accepted. Diagnostic
thread CLOSED.**

**OVARY MESH-REPLACEMENT PASS (user spec 2026-09-02, upgrade-not-landmark-fix): Phase 1
source hunt DONE, packet ~/Downloads/cancer-atlas-ovary-source-hunt/ (5 images + README).
LEAD: "Pelvic Organs from MRI" by audreybyrd (Sketchfab 2610b30793ed47a5baa18b2994bdee6b),
CC BY 4.0 double-verified pre-download (page verbatim + API "Author must be credited.
Commercial use is allowed."), REAL high-res MRI of 25yo woman, OSU Biomedical Imaging Lab
Spring 2022, Avizo+Blender, 387,942 tris 8-organ assembly, ovaries annotation-confirmed
(stop 3). Honest risks pre-registered: MRI-smooth (no corpus-luteum nodularity — no binary
landmark unlike lungs/colon), ovary sub-mesh resolution unknowable pre-download,
untextured flat segmentation colors (Material B likely wins A/B → geometry-only upgrade),
"KEEP PROCEDURAL" pre-registered as legitimate Phase-2 outcome. Whole field: 10
downloadable candidates, 4 queries + API sweep; rejects incl. CC BY-NC corpus-luteum
(first NC reject; also FVET veterinary), patient_8 = tumor specimen, 2 student sculpts,
Period App stylized. CODE FACTS pinned: organ hotspots organ-level only (HGSOC/OCCC screens
= procedural site viewer, NO mesh dependency); real-mesh adoption flips isRealMesh →
REMOVES ovary glow halo → Testis flag's 0.34%-precedent citation must be rewritten at
integration; true-scale ovary frames ~8cm = would've hit old 0.1 near plane (thyroid fix
load-bearing). User downloaded ~/Downloads/pelvic_organs_from_mri.glb + self-verified license/counts/nodes;
approved Phase 2 w/ 2 flags (glow-retirement = same-commit Testis-flag rewrite + check its
standalone reasoning; weld-check ovaries_2 don't trust named node). PHASE 2 DONE, packet
~/Downloads/cancer-atlas-ovary-phase2/ (5 images + README), RECOMMENDATION = ADOPT:
ovaries_2 = 3 arbitrary 65k-index chunks (44cm 'sliver' = chunk holding both ovaries' leftover
tris, dissolves on weld) → welded 22,132 verts / 5 components: LEFT shell 22,038 tris vol
1030.4u, RIGHT 17,606 tris vol 699.9u (L/R ratio 1.47), + 3 INTERNAL follicle/CL shells proven
inside by ray-parity (21/25, 19/25, 21/25) → ship outer shells only. Flat-shade proven real
relief (dihedral mean ~3.2° p95 ~10°, folds >20° at 0.6-0.9%, max 78°/53°) — soft MRI
lumpiness, beats procedural almond clearly (ovary_compare.png), rejection trigger does NOT
fire. Proportions plump: L 1:0.98:0.74, R 1:1:0.62 vs StatPearls almond 1:0.57:0.29 →
disclaimer sentence REWRITE (thyroid-style disclosure). Scale = volume-anchor 7.7mL (L→2.77
×2.71×2.05cm; length-anchor rejected, implies 15.5/12.7mL); 7.7mL = PROPOSED Kelsey 2013
age-matched peak — MUST verify at source in Phase 3 (blocking). Display rec = LEFT ovary
(more character). asset.extras license verified (3rd channel). User APPROVED adopt + LEFT;
Kelsey verified BY USER (7.7mL 95%CI 6.5-9.2 = PEAK AT AGE 20 — phrase as nearest-landmark,
not an age-25 match) + in-situ-variation proportion framing specified. PHASE 3 BUILT,
UNCOMMITTED — packet ~/Downloads/cancer-atlas-ovary-swap-review/: assets/ovary.glb 398KB
authored (LEFT shell 11,021v/22,038t/1 comp, long-axis-Y, mesovarian crease field fronts +Z,
vol EXACTLY 7.700mL, anchors on-surface ≤0.006mm, 22038/22038 normal agreement, provenance in
asset.extras); ovary.js GLTFLoader + MATERIAL B SHIPS (first B verdict in atlas — native =
flat segmentation red = labeling convention; B = verified 0xc9ac9e + mottle 2.6 + spec 0.25),
hotspots dir→pos (hilum anchor = assembly-derived uterus-centroid medial direction, lands ON
crease field = mesovarian border; cortex/medulla = disclosed representative surface points),
hotspotScale removed, viewer 0.12/0.03/0.3, Size fact → Kelsey 7.7mL; disclaimer rewritten
(live-verified, no entity leaks); CLAUDE.md rule 29 + Testis flag rewritten (historical note;
reasoning stands alone); thumb re-rendered from GLB. VERIFIED: glowLights=0 live, 72-angle
retirement sweep max 0.000%, A/B captured, regression 161/3 = exact documented baseline
(ovary now real 0.00%, its 0.34% halo visibly gone from the suite), HGSOC+OCCC fully green,
frames ~8.7cm vs near 0.01. User reviewed packet (A/B grid, anchors, dots) + APPROVED;
COMMITTED as a97cf61 "Replace Ovary mesh with real MRI-derived asset — the atlas's first"
(5 files, 136+/65−, Testis-flag rewrite included per instruction). PUSHED: HEAD = origin/main = a97cf61 (user line-by-line reviewed the commit message incl. independent re-check of the 15.5mL length-anchor math + 72-angle sweep JSON before authorizing). Ovary swap CLOSED; atlas = 16 pairs / 14 organs, 12 real meshes counting this one... CORRECTED at stomach gate: see rule-30 erratum — 14 organs registry-verified; ovary swap made 11 real, regression baseline 161/3.** UJAT mesh isolated from
neck assembly (texture-color classification + measured trim planes), uniform-scaled to
verified 8.26 mL (Lin 2023; per-lobe width 1.34 vs 1.31 cm exact; lobe length 2.77 cm =
~55% of textbook ~5 cm, depth 1.77x — squat gland DISCLOSED in disclaimer, anisotropic fix
rejected as unverifiable; StatPearls size sentence internally inconsistent 3.6x, "5x3x2cm
per lobe" = 28.7 mL = goitre, both refuted in-product). Shipped GLB 1.67MB (texture
2048→1024 under lungs protocol, live deltas mean 0.15-0.34/255 in-band), 1709 welded verts /
3200 tris / ONE component, isthmus = real geometry (bridging band Y −0.26..+0.80 cm),
no pyramidal lobe → 4th hotspot Superior pole; 4 anchors = measured coords 0.01mm on-surface.
Material A ships (native texture + NoColorSpace; A/B rendered same-camera: recipe B flattens
follicular mottling + posterior tracheal tint; B-verbatim also holes at ~50 flipped posterior
faces that doubleSided A tolerates). Body marker 0.850 (0.862 anchored at the CHIN — female
front-z jumps 6.9→10.3 cm; 0.850 = throat-column base both sexes, measured not eyeballed).
Content: PTC+FTC active (MTC/ATC gated w/ shares + ATC death asymmetry), CLAUDE.md rules
27-28, genPTC/genFTC histology (stalked papillae = deliberate HGSOC inverse; FTC capsule
criterion w/ mushroom breach + vessel plug). Blown-white 0.000% all views both materials.
**REGRESSION HARNESS FIXED CENTRALLY (reviewer-requested, 2026-09-02): the blown-white
vacuity (meshPx-0 cleared-buffer artifact, documented in CLAUDE.md's Lungs entry but never
fixed in the suite — shim lived only in scratch scripts bladder_tune.js/thy_shots.js) is
now repaired in /tmp/atlas-verify/regress.js: preserveDrawingBuffer shim + meshPx>0 guard
(zeroed buffer now FAILS loudly). Fixed suite cross-validates the Lungs-era one-off (lungs
2,452 px vs 2,447; ovary halo 0.34% vs 0.36%; testis 1.19% vs 1.20%). HONEST BASELINE NOW
161 checks / 3 failures = GBM + acinar label overlaps + testis blown-white 1.19% (the
documented pre-existing angle-dependent blip, surfaced now that the check measures; testis
disposition = open user decision, out of thyroid scope). Historical Lungs/Colon blown-white
claims unaffected (both had dedicated real-pixel measurements outside the suite). Harness is
/tmp-ephemeral, no git history — any rebuild must carry shim + guard forward.**
**APP-WIDE LATENT BUG FOUND+FIXED this pass: viewer camera near plane 0.1m vs
frameContents() distance = pure bounding-radius formula with no floor — any real mesh under
~3cm bounding radius frames the camera INSIDE the near plane (thyroid framed to 9.6cm;
prostate escapes at ~12.5cm). doubleSided artist meshes render the failure as a convincing
sliced-open shell — my first "isthmus proven in-app" capture was the anterior wall's
INTERIOR seen from behind; caught because front/back silhouettes disagreed, impossible for
an opaque closed mesh. Fix: near 0.1→0.01 in makeViewer (js/viewer.js), full regression
green. Standing lesson: single-angle "correct-looking" renders prove nothing — check
opposite views agree; check camera distance > near whenever an organ is smaller than any
shipped before.** Headless-capture gotchas this pass: page.screenshot clip coords can
mismatch getBoundingClientRect (compositor/transition artifact; canvas-element screenshots
+ window.scrollTo(0,0) are the reliable path); dot overlays occlude correctly from behind
(anterior anchors invisible in back view = correct 3D occlusion, not a bug). This session's
dev server = port 3056 (3055 belongs to another session; regress.js hardcodes 3055 — use
sed-copy regress_3056.js).

**STOMACH MESH-REPLACEMENT PASS (user spec 2026-09-02, Ovary-class realism upgrade, keep-procedural
pre-registered): Phase 1 hunt DONE, packet ~/Downloads/cancer-atlas-stomach-source-hunt/ (3 images +
README). LEAD: "Realistic Stomach" by Brain_Diagno (Sketchfab 07859d72489d4f818e508b3738ab7449),
CC BY double-verified pre-download (page + API), 64,960 tris/32,480 verts, baked serosal-vessel
texture; live-viewer confirms ALL spec landmarks (J asymmetry, fundus-above-cardia, antral taper to
pylorus, esoph+duodenal stubs) — clearly beats procedural (weak asymmetry, no fundus/antral
character). PRE-REGISTERED RISKS: weakest provenance yet (medical-viz artist, template-spam desc, no
institutional supervision — must stand on measured fidelity), dims unverified til download,
LENGTH-anchor policy chosen over volume (stomach volume state-dependent 25mL→4L, opposite of Ovary
reasoning), vessel tracery may be texture-only (nothing load-bearing rides on it). FIELD REJECTS:
neshallads "Realistic Human Stomach" CC BY-NC (SAME ARTIST as our Lungs!); adimed "Digestive System"
= LICENSE-LAUNDERING (new rejection subtype: reupload self-admits NC original in own description —
identical 23,240 face count; CC BY label on reupload cannot override NC); Dundee CAHID 5.2M = Artec
scan OF A PLASTIC MANNEQUIN (opened torso, stomach occluded); Splanchnology CC BY-SA; "Stomach -
Organ" Sketchfab-Standard; pathology/cutaway/smooth-sculpt rejects. Spec 3.5 answered from code:
stomach already pos-anchored → isRealMesh already true → NO glow, no borrowed precedent, nothing
retires. Current hotspots (pits/rugae/muscularis/pylorus) carry conceptually, re-anchor at Phase 3.
User approved lead into Phase 2 + specified THREE-WAY material test (A native / B recipe /
B-prime gloss-boosted, genuinely open — A has real vessel tracery unlike Ovary's flat red);
calibrations accepted: reference webp = CUTAWAY INTERIOR (wrong layer for exterior-organ bar),
wet-sheen has hard pipeline ceiling (no envmap, SSS/transmission tested-dead, only
roughness/spec levers w/ clip guardrails). LICENSE-LAUNDERING NEAR-MISS: user's first download
was adimed's digestive_system__human_anatomy.glb — embedded extras verified it as the laundered
reupload (author adimed, 23,240 tris = neshallads NC exactly); REFUSED, embedded CC-BY label
echoes uploader's selection and cannot cure provenance; correct file then downloaded.
PHASE 2 DONE (packet ~/Downloads/cancer-atlas-stomach-phase2/, 3 images + README),
RECOMMENDATION = ADOPT: identity verified (extras = Brain_Diagno + exact lead URL, author's own
label), cleanest topology of ANY pass — 1 component, 0 boundary edges, 0 non-manifold, welded
32,480v/64,960t, watertight +1.795u3, tube mouths = modeled rims (two 96-vert >40-degree rim
rings, auto-identified, used as measurement endpoints); landmarks GEOMETRIC via flat-shade
(greater/lesser+incisura/fundus/antral taper; stippling+vessels TEXTURE-ONLY, dihedral mean
2.63 p95 7.9 — disclosed, nothing load-bearing); dims: diameter-anchor 2.106u->10.4cm
(Cunningham mid-range, same as procedural) -> overall 25.4x17.6x7.8cm (25.4 at Cunningham
headline incl. stubs), AP-flattened 0.75 ratio, ENCLOSED VOLUME 216mL sanity-pass (moderate
distension; volume-anchor pre-rejected for state-dependence); arc ratio 1.45 stub-diluted NOT
comparable to Gray 4-5x (stated, not claimed); duodenum LONG/loopy -> keep-w/-disclosure
recommended (trim = re-opening watertight mesh); textures 3x4096sq = 28.6MB of 31MB -> 1024sq
downscale A/B at Phase 3. User ADOPTED (inspected flat-shade grid + measure figure). PHASE 3 BUILT, UNCOMMITTED —
packet ~/Downloads/cancer-atlas-stomach-swap-review/ (8 files + README): assets/stomach.glb
4.24MB (transform baked, duodenum image-right per mirror convention, diameter-anchor 10.4cm
exact → 25.36×17.63×7.77cm / 216.2mL, watertight 1-comp, anchors ≤0.001mm on-surface, textures
1024²×3 after in-band downscale A/B mean 0.15-0.40/255 from 4096²×3, 31.04→4.24MB); stomach.js
procedural build (~140 lines) → GLTFLoader, hotspots re-anchored measured (PYLORUS SNAPPED TO
ANTRAL NECK — first 2.8cm-from-mouth pick landed mid-duodenum, C-loop long: anatomy beats fixed
offsets; muscle moved off esoph-mouth overlap to fundus shoulder), viewerAria + desc rewritten
(procedural note → artist-authored + texture-tone-not-color-verified); disclaimer rewritten
(serosal-inference note RETIRED with procedural mesh); CLAUDE.md rule 30 (license-laundering
subtype + same-artist≠same-license + recipe-scale lesson); thumb re-rendered (c08a7c).
MATERIAL A SHIPS — three-way test A/B/B′ (B′ rough 0.36/spec 0.6): recipe mottle = artificial
leopard spots on large smooth form (RECIPE-SCALE LESSON: mottle freq organ-scale-sensitive),
B′ gloss doesn't rescue; A = vessel speckle + normal map reads as tissue; worst blown-white
0.025% (A front). VERIFIED: 72-angle sweep worst 0.025% zero ≥1%, regression 161/3 EXACT
baseline (stomach rows green, gdiff screen fully green = mesh-independent), 4 dots visible at
initial framing. User reviewed packet (material grid + anchor render inspected directly) + APPROVED;
COMMITTED as 0c07cf4, then AMENDED to 6659ada "Replace Stomach mesh with real artist-authored asset — 12th real mesh" after the user caught an ORGAN-COUNT ERROR at the line-by-line gate: title said "organ #13 real"/rule 30 said "13th real mesh" — registry-verified truth is 14 ORGANS / 12 REAL (drift traced to pushed history: Testis/Bladder title "organs #13-14" were PAIR numbers, Thyroid "(#15)" inherited +1 — thyroid is the 14th organ, pairs #15-16; living correction = rule 30 NUMBERING ERRATUM + standing rule: count from js/organs/index.js ORGAN_MODULES, never from prior labels). PUSHED 2026-09-03: HEAD = origin/main = 6659ada. Stomach swap CLOSED. Atlas = 16 pairs / 14 organs / 12 real meshes (Skin schematic + Testis procedural remain), regression baseline 161/3.**

**TESTIS MESH-REPLACEMENT PASS (user spec 2026-09-03, last procedural organ): Phase 1 hunt
NEGATIVE — KEEP PROCEDURAL, the pre-registered outcome fired for the first time. Packet
~/Downloads/cancer-atlas-testis-source-hunt/ (3 images + README). Field exhausted (6 queries
incl. epididymis, API + page): only anatomically-real candidates license-locked ("Anatomy of
Human Testis" CC BY-NC-SA — the sole model w/ real testis+epididymis anatomy; dog testis NC);
all CC BY candidates wrong-object (TrentPierce "Testicles" = external SCROTUM, live-confirmed)
or stylized (ahmed17 "male genital system" 3.96M tri = diagram w/ featureless sphere testes,
live-confirmed WORSE than procedural; prabhat/9e2b280a cutaway assemblies); rule-30 laundering
tell fired: edu360-2021 vs xpdemy-2023 identical 44,916 tri/22,497 verts twin pair, documented;
Splanchnology CC BY-SA again. CONSEQUENCES ALL NO-OPS: no glow retirement (testis stays LAST
glow organ), flag #3 + 161/3 baseline unchanged, body markers untouched (±65°/0.40 collision
fix confirmed organ-mesh-independent from code pre-hunt), no code/assets/commit. User APPROVED the note + validated the methodology point (keep-procedural firing proves
pre-registration has teeth); noted they could not independently pin the NC-SA license from tag
search alone but accepted it under the lower negative-result bar. COMMITTED 6f51dd2 "Record
negative Sketchfab hunt for Testis — keep procedural" (2 files, 11+/2−: disclaimer one clause
+ testis.js reusable specifics incl. NC-SA near-miss, scrotum wrong-object, sphere-diagram,
laundering twins; disclaimer render live-verified no entity leaks). PUSHED 2026-09-03: HEAD = origin/main = 6f51dd2. Atlas: 16 pairs / 14 organs / 12 real meshes — every organ real or
negative-hunt-verified (Skin schematic-by-design, Testis procedural-by-evidence).**

**NEXT-SESSION PROMPT SUITE (user-authored, Revision 2, 2026-09-03): five prompts — 1 body
Multires re-export / 2 color-management unpark / 3 envmap+ground / 4A meshopt compression +
4B baked AO / 5 visual audit. Fork SETTLED collaboratively: unpark ruling stands with MY two
corrections (flat-lit identity is STRUCTURAL — existing color verifications remain valid for
what they measured; tone-mapping operator = measured decision ACES vs Neutral vs AgX, NOT
hardcoded ACES) + user's three refinements ((a)+(b) inseparable per viewer.js "lopsided"
comment — two stopping points not three; Neutral-vs-ACES may have NO single winner — palette
fidelity vs clip compression are opposed curve objectives; NoColorSpace→SRGBColorSpace
migration for lungs/colon/thyroid/stomach is a LABELED HARD REQUIREMENT). All quoted claims
repo-verified; Pages deployment confirmed live (HTTP 200). Prompt run order 1 → 2 → 3, 4A
anytime, 4B after 3, 5 last.**

**PROMPT 1 EXECUTED (2026-09-03), REPORT DELIVERED, NOTHING COMMITTED — packet
~/Downloads/cancer-atlas-body-multires-report/ (8 strips + README), assets/ RESTORED to
shipped L0: bundle re-downloaded (download.blender.org v1.4.1 zip 48.3MB; README inside still
says 1.4, Rain-Rig LICENSE quirk confirmed), export pipeline REPRODUCED to 0.00007mm mean vs
shipped (missing step rediscovered: original exports were bbox-centered to world origin — node
translation, not just local), L0/L1/L2 exported both sexes (pair totals 1.99/9.56/36.75MB,
21,160/84,680/338,720 tris). VISUAL: L0 fails everywhere; L1 ~80% fixed but residual banding
female shoulder/thigh + forearms at legal minRadius-0.9 zoom; L2 fully resolves (fingernails/
knuckles emerge). Strict "lowest that resolves" = L2 but doubles assets 44→79MB.
RECOMMENDATION = ship L1 now + re-evaluate L2 after 4A meshopt (bodies are pure geometry =
best-case meshopt). VERIFIED both levels: regression 161/3 exact baseline, markers 15/16,
zero raycast-miss firings, toggle camera bit-identical. INCIDENTAL for 4A: Blender 5.2 glTF
reports bundled MeshOptimizer bridge — "Blender can't read meshopt" claim may be stale on 5.2.
User verdict: NEITHER YET — price L2 post-compression NOW (decision rule: cc-pair ≤~10MB +
zones hold → L2; else L1 + CLAUDE.md residual disclosure); bbox-centering doc → body.js
regardless; Blender-5.2 meshopt finding folded into their 4A. EXECUTED: gltfpack -cc = 4.03MB
BUT quantization gate CAUGHT female-shoulder normal banding (10.77/255 vs raw; -vn 8 default
octahedral normals, silhouette fine) → -vn 12 fixed (0.049/255, hand 0.074, knee 1.43 = raw
L2's own quad-flow striping present in BOTH, noted for Prompt-5 audit) at 4.64MB pair — rule
satisfied, L2 SHIPPED: COMMITTED d59bb1a "Upgrade body meshes to Multires L2,
meshopt-compressed — faceting fixed" (4 files, 52+/2−: cc12 pair, body.js MeshoptDecoder
registration + centering gotcha docs, CLAUDE.md supersession entry w/ -vn 12 standing lesson +
zone-capture recompression gate + raw-parser-can't-read-bodies toolchain note). Regression on
shipped bytes 161/3 exact baseline, markers 15/16, tris 338,720 both. PUSHED: origin/main = d59bb1a. Prompt 1 CLOSED (hunt superseded). User's close-out
refinements: (1) lesson reframed — GATE is the rule, -vn 12 is a geometry fact (organ meshes
derive their own precision; folded into their 4A doc + CLAUDE.md reworded); (2) regress.js
GUARD GAP closed — accidental L0 re-export would pass 161/3 silently (markers re-derive by
raycast; meshopt hides counts from raw parsers) → two new checks assert 338,720 tris per body
via live app; NEGATIVE-TESTED (L0 swapped in → both FAIL "21160 tris", 163/5; restored → PASS)
— **REGRESSION BASELINE NOW 163/3** (was 161/3); COMMITTED 6cb4eaf, 1 ahead of origin d59bb1a,
NOT pushed; (3) thigh-striping scoped into their Prompt 5 (bodies added to audit). Their doc
Rev2 final: 4A scopes 12 organs (bodies exempt+done), carries -vn warning + Blender-5.2
meshopt re-test. Next: push 6cb4eaf on their word → Prompt 2 (color unpark — expect
recommendation-shaped output needing their ruling, per their fair warning).**

**PROMPT 2 EXECUTED (2026-09-03), MEASUREMENT REPORT DELIVERED, NOTHING COMMITTED — tree
verified back to shipped; packet ~/Downloads/cancer-atlas-p2-pipeline-report/ (3 three-way
sheets BODY+14 organs, spotcheck, 10 metrics JSONs, README). PRE-FLIGHT: harness has exactly
ONE pixel-assertion family (14 blown-white checks), no hardcoded RGBs; GBM/acinar overlaps
colour-blind HOLD; testis blown-white predicted-to-resolve — MEASURED: nearly resolves at
{(a)+(b)} ALONE (2.38%→0.08% sweep max; linear decode drops working values under ceiling; my
persists-at-(a)+(b) guess wrong in the good direction, recorded) → HARNESS GOES 163/3 → 163/2
AT EITHER STOPPING POINT. METHOD BUG caught: zsh word-split swallowed script args → first
operator runs all silently ran no-op; caught by implausibility (4 operators byte-identical),
confirmed by direct-debug readback, rerun explicit. RESULTS: flat-lit identity STRUCTURAL
(lit-face hue/sat legacy 4.9°/0.378 vs (a)+(b) 4.8°/0.397 — palette unmoved); fidelity-vs-clip
split NEVER MATERIALISES (all 3 operators = ZERO blown px at lights ×1.35 across 14 organs ×
12 yaw; legacy_raised 1,662px); OPERATOR UPSET: Neutral (pre-favoured) WORST sat dev 0.594,
ACES rotates dark-red hues (kidneys/liver sign-flips), AgX BEST (sat 0.174 < legacy's own
0.378, hue 5.3°, value ×0.85-0.95 pale organs); exposure 1.0 — continuity-vs-legacy is the
WRONG frame (per-organ ratios ×0.85-1.76; redistribution IS the correction, legacy crushed
dark albedos per viewer.js's own r128 note; liver near-silhouette mud → legible red-brown);
NoColorSpace→SRGBColorSpace migration verified live ×4 textured organs; mottle survives.
RECOMMENDATION AWAITING RULING: adopt {(a)+(b)} + AgX @ exposure 1.0 (fold π into literals
0.42π→1.319/0.65π→2.042, delete constant, rewrite r128 parking comment; 4 organ colorSpace
flips + rule-trail updates; baseline → 163/2 testis flag historical; glow-restore + light
re-derivation = separate follow-ups w/ proven headroom; Prompt 3 unblocks). Conservative
alternative {(a)+(b)}-only stated (palette unmoved, 927→31px, but ceiling stays, glow
foreclosed). Accept-cost stated: dark organs brighten (correction-not-drift but IS a look
change on signed-off palette).**

**PROMPT 2 RULED + LANDED (2026-09-03): user adopted {(a)+(b)} + AgX @ exposure 1.0 — their
sharpening: sat dev 0.174 vs legacy's own 0.378 means the corrected pipeline is MORE faithful
to the cited albedos than the signed-off state ever was (settles it for a citation-fidelity
project); their Neutral-was-wrong diagnosis: PBR-Neutral guards against DESATURATION, wrong
guarantee for a warm rig pushing albedos ABOVE cited sat. CONDITIONS: (1) pale-organ scrutiny
before landing — DONE (breast slightly softer no-regression; testis actively improved, glow
blooms→soft accents, body closer to cited tan); (2) re-measure operator after Prompt-3 envmap
(recorded in their doc + CLAUDE.md + viewer.js comment); (3) glow restoration = separate pass
w/ own gate; (4) PROCESS RULE from the zsh incident: measurement scripts must echo parsed
config + assert vs request — "a run that can't state what it measured shouldn't produce a
number" (recorded in CLAUDE.md standing conditions). LANDED as a131649 "Correct the rendering
pipeline: colour management + sRGB + AgX @ 1.0" (7 files, 130+/65−): viewer.js CM
on/SRGBColorSpace/AgX@1.0 + big comment block rewritten as measurement contract +
LEGACY_LIGHT_SCALE RETIRED (π folded full-precision literals incl. main.js glow 0.5π,
numerically identical) + warm-lighting comment codas; 4 organ NoColorSpace→SRGBColorSpace
flips + module codas; CLAUDE.md architecture entry + rules 25/26 notes + BASELINE NOW
163/2 (testis flag #3 fully HISTORICAL — resolved for pre-flight-predicted reason, verified
0.00% on 9,860 real px on landed bytes; only GBM+acinar overlaps remain). a131649 later pushed
(origin/main = a131649, verified 2026-09-03). Light intensities deliberately unchanged.**

**PROMPT 3 EXECUTED + APPROVED + COMMITTED as 4e9e69f "Add design-token environment map +
ground staging; AgX re-confirmed" (2026-09-03; 4 files, 326+/8−; 1 ahead of origin/main =
a131649, NOT pushed — user said commit, not push). Substance: scene.environment = 256×128
linear-float equirect gradient from design tokens via cssVar() (floor --bg / horizon --panel
/ sky --text; accents excluded), environmentIntensity 0.25 (minimax of pale/dark |dSat|
split, ALSO dominates 0.20 on hue 4.40-vs-4.47 + value −0.052-vs−0.054 for 0.001 sat — "wins
on three axes" per user's ruling); single GLOBAL level, per-class envMapIntensity refused
("fudge knob wearing a physical costume" — user's phrase); lights unchanged (dVal<0
everywhere, blown 0). FINDING OF THE PASS (user: "earns the pass alone"): PMREM resolution
cliff — PMREMGenerator cube face = equirectWidth/4, blur chain floor LOD_MIN=4 (16-texel
face); W<64 → roughness mips never written → diffuse IBL EXACTLY ZERO, silently (probe 0.0 @
W=32/48, 120.75 @ W=64). RETROACTIVELY CORRECTS the reference-app premise: thebuggeddev/
anatomy ships 16-wide (cube face 4, below floor) so ITS env map lights nothing — "they have
IBL, we don't" was wrong on both halves; user owns this as their bug (they handed over the
16×32 spec). Operator re-measured AT SHIPPED env 0.25: AgX 0.043 / ACES 0.079 / control
0.107 / Neutral 0.207, blown 0 all four → AgX stands; MECHANISM FLIP recorded (P2: AgX won
offsetting over-saturating rig; now UNDERSHOOTS cited sat 6/9, worst testis −0.087) — P2
rationale dead as rule of thumb, any rig change re-measures (viewer.js condition block +
CLAUDE.md condition (1) marked DISCHARGED). Staging: --line plinth (r = 0.5·hypot(x,z)·1.10)
+ baked radial contact shadow; body YES / organ 13-of-14 YES (all discs in-frame, addGround
provably never moves camera) / site map NO (heights encode spread); TESTIS EXCLUDED at
main.js call site on geometric impossibility (height-dominated box 2.20 over 1.38×1.38
footprint → organ bottom @ px~300/318 while footprint needs r=1.07; near-rim drop ≈0.65·r
consistent across 14 → fitting disc needs r≤0.21, 5× too small; full disc = silhouette cut 3
sides, shadow-only entirely out of frame) with REVISIT TRIGGER: Prompt-5 framing change →
re-test plinth. Staging identified by FACT: group named groundStaging (groundPlinth/
groundContactShadow), viewer.ground() accessor returns null where staging deliberately
absent. NEW STANDING CONDITION (3) in CLAUDE.md, user-generalised from 3 self-caught bugs of
one shape (zsh word-split, Float32-on-HalfFloat readback, geometry-type staging heuristic
that mislabelled skin hair shafts + misread testis): "measurement scripts READ identity, not
infer it." Regression 163/2 = baseline exactly (GBM+acinar only). Evidence /tmp/atlas-verify/
p3/ (metrics incl. envop25_*, ground_fit/ground_why.json, renders + final sheets).
FRAMING-LATCH BLOCKER RESOLVED pre-push at user's direction (commit 8865e92 "Resolve the
framing-latch blocker: measured, bounded, organ viewer immune"; scripts sidebar_latch.js +
body_latch.js in /tmp/atlas-verify/p3/): applyFraming() fit is purely ANGULAR (no pixel
term) → latch admits stale framing ONLY on container ASPECT change after framing. Organ
viewer STRUCTURALLY IMMUNE (#organViewerWrap CSS aspect-ratio:1/1; measured: 318×318 +
byte-identical margins both toggle directions on pancreas/prostate/breast, camera
untouched). Body viewer REACHABLE (inset:0, aspect 1.5306→1.2776 with camera provably
unmoved = resize-without-reframe live) but HARMLESS on desktop (limiting angle vertical,
sidebar 248px can't push aspect <1; margins 567→443). Site viewer same inset:0 class.
RESIDUAL for P5: (a) landscape→portrait window reshape on body/site can clip — fix is
DESIGN work not a patch (latch is load-bearing: re-frame-on-resize snaps user zoom;
correct fix re-fits only when content would clip / before user zoom — user pre-sized it
as P5 scope); (b) headless off-centre organ captures = capture-rig artefact, BOUNDED (not
latch, not projection/DPR, identical before/after env pass) but cause unidentified — find
before trusting absolute composition from headless sheets. Latch site in viewer.js now
carries the full bound. BOTH COMMITS PUSHED: origin/main = 8865e92 (a131649..8865e92),
Pages deploy verified serving groundStaging + discharged-condition marker (HTTP 200).
Prompt 3's comparative metrics stay valid regardless (same rig, cross-validated 0.06 lum
vs P2 record) — it's ABSOLUTE deviation-from-cited claims that carry bias (testis −0.087
softer evidence than AgX-beats-Neutral-5×). Also carried to P5: testis framing (organ at
edges, marker half-cut) and female-thigh quad-flow striping.
4A TRAP (user, 2026-09-03): use -cc ONLY, do NOT add texture-compression flags — gltfpack
-tc/basis/KTX2 needs a KTX2Loader wired into GLTFLoader which this project does NOT have,
and the four textured organs (lungs/colon/thyroid/stomach) just had NoColorSpace→
SRGBColorSpace land, untested against any repack: verify those four render IDENTICALLY
after compression rather than assuming geometry-only flags left maps alone.
CAPTURE ARTEFACT RESOLVED pre-4A per user sequencing ruling (commits f9e8e93 precision
notes + 8834371 resolution, both pushed; origin/main = 8834371): the photograph lied, not
the renderer — puppeteer element/clip screenshots (25.9.0 + Chrome 152, dpr-INDEPENDENT)
apply a transient device-metrics override at ~1405/~1313 wide, app relayouts (margin:auto
shifts wrap by (1500−W)/2, fingerprinted to 0.09px via width sweep), capture rasterises
the transient layout at pre-capture clip coords, recovers <400ms. Plain full-viewport
page.screenshot() immune ⇒ regress.js never affected. FIX = captureBeyondViewport:false
on every element/clip shot (verified: no move, correct capture). GATE 14/14: PNG content
box vs drawing-buffer box ≤1 device px every edge, full organ in frame all organs (testis
top margin 8px = its known framing, P5 item); render.js patched, review renders
regenerated clean. Gotcha: wrap's 18px border-radius arc defeats straight-inset border
exclusion in content scans — mask corner squares. Scripts: capture_probe/drift_probe/
which_call/fingerprint/verify_capture.js + gate_check.py in /tmp/atlas-verify/p3/.
4A PRE-DECISIONS MEASURED (2026-09-03, /tmp/atlas-verify/p4/): (1) Blender premise STALE —
Blender 5.2.0 LTS imports EXT_meshopt_compression natively: bladder -cc tris EXACT
10,073=10,073, verts 5,515→5,499 (standard weld), bbox Δ~1e-4 ⇒ render_thumb.py keeps
working, NO decompress workaround needed (verify one real thumb during 4A);
(2) NEW FINDING: gltfpack -cc DEFAULTS MERGE NAMED NODES (bladder's 6 VH_M_* ontology-
named sub-meshes → one Mesh_0). Runtime-safe (no getObjectByName in js/organs/; anchors
baked as literal pos coords derived offline from named centroids) but destroys the
PROVENANCE structure packets re-verify against ⇒ use -kn (keep named nodes);
(3) accessor-parsing raw-GLB verification scripts still defeated by compression
regardless — masters decision: git history IS the archive (git show a131649:assets/X.glb)
+ document that as the canonical raw source. bladder -cc: 199,044→44,328 B (4.5×).
4A IMPLEMENTED (2026-09-03), UNCOMMITTED working tree awaiting user review (user
green-lit implementation + 3 amendments: re-measure preview w/ shipped flags; git-history
immutability = standing condition (4) — NO squash/rebase/force-push/blob-purge ever, git
show a131649:assets/X.glb = raw masters; accessor scripts must check extensionsUsed for
EXT_meshopt_compression and REFUSE — appended to condition (3); counts ruling =
AS-SOURCED w/ weld-delta table). RESULTS: 12 GLBs gltfpack 1.2 -kn -cc, 43.72→19.52MB
(2.24×; mesh-only 4.19–6.09×, textured four image-dominated 1.06–2.56×; -kn cost +0.01MB
vs plain -cc; 4.5× preview superseded); -kn REQUIRED (plain -cc merged bladder's 6 named
nodes; -kn preserves all 12 name-sets); -vn 8 defaults SUFFICE — zone gate 12/12
(8 poses/organ @ minDistance closest zoom, 636² buffers, 16×16 zones, gate worstZone<3.0
+ global<1.0 vs body banding ref 10.77; worst liver 2.64 = whisper smooth-shading shift
max Δ6 confirmed visually, lungs 315px>8 = silhouette re-index jitter; -vn 12 = +0.75MB
waste); textured four image bytes sha1-IDENTICAL; MeshoptDecoder wired all 12 loaders
(body.js pattern, harmless vs raw); Blender premise STALE (5.2.0 imports meshopt
natively, render_thumb.py rendered compressed bladder unmodified — workaround DROPPED);
parse 252→238ms total (decode cheaper than big raw parse), fetch −24.2MB; regress on
compressed = 163/2 baseline exact. bladder.js:43 byte-citation annotated as-sourced.
Evidence /tmp/atlas-verify/p4/ (compress_matrix.json, zones/, worst strips, parse_time,
import_test). 4A COMMITTED ac77719 (user approved; NOT pushed) + user riders recorded (texture-dominated
signpost — future budget lever = texture dims/encoding NOT gltfpack; threshold one-sided —
2–3 band always gets amplified visual check; weld deltas ≠ topology health — all-attribute
welding can't see divergent-normal seam splits, P5 carry-forward).
4B IMPLEMENTED (2026-09-03) UNCOMMITTED awaiting review: composition BY MECHANISM =
same-attribute multiply (GLB ships raw AO as COLOR_0; helper stashes 'aoBaked' once =
idempotent; final = m×(1−k(1−ao)), clip-safe by construction; k in JS, k=0 = pre-4B exact;
replacement + second-attribute rejected w/ reasons). Bake = .claude/bake_ao.py (Blender
5.2 Cycles CPU 128smp seed 0, ray cap 0.5×diag, POINT colour attr, sub-meshes co-occlude)
from a131649 masters. VERDICT 7/8 SHIPPED: brain = biggest win (sulci deep, crowns
bright — mean 0.050 misleading, visibility filters to bright mode), kidneys hilum,
prostate fold, pancreas lobules, ovary dimples, breast subtle, bladder underside; LIVER
EXCLUDED measured negative — visible near-black blotches read as HEPATIC LESIONS
(interpenetrating twin-surface mm-range occlusion; no ray cap fixes it; exclusion comment
at liver.js call site; revisit = clean manifold rebuild). Pre-registered banding NEVER
observed (bladder 5.5K verts smooth); real failure mode = interpenetrating segmentation
shells. Palette holds at k=1.0: |dSat| Δ≤0.012 all baked (brain improves 0.063→0.053),
p3measure tag ao_k10. +287KB total (~19.81MB); COLOR_0 survives -kn -cc 8-bit (mean
identical 3dp, names same). regress 163/2 exact. OPEN AT REVIEW: k default (shipped 1.0,
k=0.5 side-by-sides in /tmp/atlas-verify/p4b/shots/). Evidence /tmp/atlas-verify/p4b/.
4B RULED + SHIPPED: user's binary decision rule = lesion-vs-shadow (liver proved bakes
carry a non-anatomical component k scales identically, so the question is "does any dark
region read as a discrete edged focal object on normal tissue"); applied over aoOnly
isolations front+reveal poses: 7/7 PASS → k=1.0 GLOBAL, no per-organ deviations (hold one
number until an organ forces it); prostate's 2 dark pits near base present IDENTICALLY at
k=0 = pre-existing mesh geometry, P5 note. COMMITTED c6e5ab8 + PUSHED with ac77719
(origin/main = c6e5ab8); Pages verified serving compressed+baked assets (brain 1,547,568B
= baked+cc, liver 348,480B = 4A no-AO). P5 carry-forwards recorded in CLAUDE.md 4B entry:
liver reads flatter DELIBERATELY (fix = remeshed manifold, never lower k), prostate pits,
weld≠topology, narrow-window+sidebar aspect-flip, testis framing+plinth retest, female
thigh striping, zoom-clamp question. Record note: 3 passes running, pre-registered
negative landed but never where predicted (Neutral→worst not viable; bladder banding→
liver twin shells; -kn cost→texture domination) — wrong about WHERE, right about THAT;
keep pre-registering.
PROMPT 6 COMMITTED 5db3d4b + PUSHED (= origin/main): DO NOT RESTORE — measured, zero
functional changes. User rulings folded in: (a) STANDING CONDITION (5) generalised from
P3+P6 ("nothing tinted with an accent colour may enter the illumination path" — the rule,
not two cases; cite it at the next hover-highlight/selection-glow/tumour-map-indicator
ask); (b) main.js glow comment completed ("do not read as a constraint AgX lifted" — old
diagnosis correct about what it saw, incomplete about why the feature can't work); (c)
lungs caveat DIAGNOSED pre-filing: naive cluster-direction pose dropped camera BELOW the
plinth (y −0.496 vs −0.192), disc occluded organ; staging-hidden multiplied subject px
14.8× (7,841→116,309, prediction pre-stated) ⇒ P5 RIG REQUIREMENTS recorded: close-zoom
poses keep camera above plinth plane or hide staging via ground(); every capture carries
minimum-subject-coverage guard that FAILS LOUDLY (under-sampled frame must not produce a
verdict). Mechanism = FOURTH consecutive
negative-lands-elsewhere: expected soft bloom, actual = HUE contamination — teal-dominant
px 1-2% → 50-75% of organ under glow at ANY offset (kidneys 4,185→127,875, prostate
1,634→176,710, breast 4,791→106,024), blown counter 0 in EVERY condition (old detector
formally dead under AgX, as prompt predicted); normal-offset fix is BACKWARDS for this
failure (cures distance-zero geometry, increases contamination monotonically — off10
worst; washes out 4B's concave AO). Env-map accent-exclusion argument now measured fact.
Renders: kidney hilum mint-flooded, prostate plinth = cyan lightbox. Caveat: lungs zone
pose misframed (7.8K px), verdict rests on other 3, each independently disqualifying.
Evidence /tmp/atlas-verify/p6/ (32 shots + telemetry.json; eval = in-page light injection
via glow_eval.js, normals from nearest surface vertex).
PROMPT 5 AUDIT RUN (2026-09-03), REPORT DELIVERED, NOTHING COMMITTED (audit-only gate).
Rig: 48 captures (14 organs × default/close/floor + 2 bodies × default/torso/leg) w/
plinth-plane check + coverage guard 48/48 (DISCLOSED: guard counted staging px — floor
shots weak for low-floating bladder; cold pass not literally cold, auditor authored docket
— verdicts written from images first). PHASE 1 RANKING best→worst: lungs, stomach, colon,
body_male, body_female, brain, kidneys, prostate, skin, pancreas, liver, breast, bladder,
ovaries, thyroid, testis. Verdicts: PASS×10, MARGINAL bladder/breast/liver/ovaries, FAIL-
adjacent thyroid (superior-pole shard/flap debris + UV smear VISIBLE AT DEFAULT) + testis
(featureless ellipsoid + overfilled framing, marker half-cut). NEW cold findings: ovary
rectangular shading patches at close zoom (attributed via 3-state isolation: in BOTH
mottle-only AND ao-only at same spots ⇒ MESH normal/tessellation steps, pre-existing, AO
accentuates, mottle formula can't make corners); pancreas soft vertical sub-mesh seam;
brain gyri facet at floor zoom; kidneys/breast/liver = blank colour walls at floor zoom;
marker DOM discs don't scale w/ zoom (occlude anatomy close-up); bladder floats high off
plinth. PHASE 2 docket: aspect-flip RETIRED w/ mechanism (at 1200/1150-wide the aspect
crosses 1.0 after toggle 1.22→0.97 and body STILL fits margins ≥281px — sphere fit sized
by tall axis ⇒ flip only bites content w/ screen ratio ~1; body ~0.38; unreachable at
usable widths); testis framing CAUGHT cold (=docket); thigh striping REPRODUCED only under
grazing light yaw~2.1 from behind (faint vertical quad-flow bands, invisible in normal
viewing — recommend clears bar, asset-level if ever fixed); liver flatness CAUGHT cold
(waxy/sheen, ranked 11; per docket path = remeshed manifold, never lower k); prostate pits
seen faintly, tolerable; weld≠topology CONFIRMED (brain floor-zoom faceting, weld −895
predicted nothing); zoom-clamp: floor-only failures (brain facets, kidneys/breast/liver
blank walls, bladder plinth-fill) ARE clamp-fixable (~2× current minDistance), but
thyroid/testis/ovaries fail at default/close = NOT clamp-fixable. USER PREDICTION
CONFIRMED w/ gradation: textured four took ranks 1-3 (skin schematic aside); all 8
untextured read monochrome; AO organs (brain/kidneys/prostate/pancreas) escape at default
via shading but NONE survives close zoom with surface interest; flat/monochrome is the
dominant characterisation of the entire bottom half. Evidence /tmp/atlas-verify/p5/
(shots/, sheets/, guard.json, phase2_checks, ovary_attr).
AUDIT RULED + RECORD COMMITTED 2a14020 PUSHED (= origin/main; 7 commits live, all 6
prompts closed). Guard v1 defect FIXED per user (subject-only count via ground(); re-run
47/48 — bladder/default honestly under floor 18,963/20k = app fact confirming float
finding; surface verdict rests on close shot). USER RULINGS: ZOOM CLAMP NO ("the clamp is
the reference app's EVASION"; re-ask after albedo); TIER 1 = marker-disc scaling by camera
distance (best value in queue) + testis framing (w/ plinth re-test trigger); TIER 2 = ONE
asset-hygiene pass, thyroid leads severity (+ ovary tessellation, pancreas seam, brain
floor faceting — the deferred merge-and-recompute-normals items); TIER 3 = albedo work
stream, design question OPEN (no usable UVs on scan meshes) — user explicitly wants to
design it collaboratively, NOT hand a cold session a guessed prompt. Accepted: thigh
striping clears, prostate pits tolerable, liver → remesh-if-pursued, aspect-flip retired.
Key lessons recorded: albedo necessary-NOT-sufficient (thyroid has texture, ranked 15th —
visible defect trumps present strength); "shading carries untextured organs until close
zoom, then nothing does" = albedo value concentrated exactly at the failures.
TIER 1+2 PROMPTS DELIVERED by user (2026-09-04; run Tier 1 first — Tier 2 verification
depends on close-zoom captures Tier 1 unoccludes). TIER 1 IMPLEMENTED, UNCOMMITTED awaiting
review: (1a) measured truth SHARPER than prompt's framing — DOM proxy is the COMPLIANT
element (24px keyboard floor, pointer-events:none); the world-sized SPHERE is both the
pointer target (canvas raycast) AND the occluder: projected 6-12px at DEFAULT (under WCAG
2.5.8 24px floor at the view every user starts from — pre-existing a11y defect surfaced by
measurement) and 30-118px at zoom floor (the audit occlusion). FIX = constant-projected-
size law: sphere held at 11px (median of approved defaults — look unchanged ~±1.4px) scaled
per-frame in organTick/bodyTick; pointer = 24px-diameter SCREEN-SPACE hit test (12px
radius, nearest-within) replacing raycast in organ onClick + body onClick + body hover;
far-side click-through semantics preserved (documented intentional). Body constant 23px;
site map NO CONFLICT (blobs organ-scale targets, labels non-interactive). Deviation from
prompt's literal "scale the DOM proxy" sentence justified by measurement + disclosed.
VERIFIED 14/14: 11px at default AND floor every organ, floor occlusion ≤0.26% of subject,
click/miss-reject/keyboard all pass (harness lesson: app click = pointerdown container +
pointerup window via tracker.isClick(); bare 'click' event invisible), body hover finds
24px target + clears on miss; regress 163/2 exact. (1b) testis mechanism CONFIRMED (never
framed — procedural, no h.pos); NARROW fix radius 3.6→4.4 = frameContents' own math by
hand (1.1×1.3/sin19° = 4.39; skin untouched, passes rank 9); verified live camDist 4.4,
occupancy 89%→72% height, margins 171/172/106/73, top marker no longer cut. PLINTH RE-TEST
RUN per trigger: STILL impossible — footprint disc r=1.07 at base plane projects bottom
margin −23px (vs 5× too small before); RECOMMEND exclusion stands (4.4 already = real-mesh
convention; stretching further trades composition for staging). Evidence /tmp/atlas-verify/
t1/ (markers.json, verify_t1, testis_after.png).
TIER 1 APPROVED w/ 2 checks + SHIPPED 1d93f1a PUSHED (spacing: 12-yaw sweep, 12/14 organs
have pairs under 24px at some angle, worst breast 2.2px → compliance QUALIFIED w/
equivalent-control argument + old-raycast-was-worse + depth-priority; depth tie-break
implemented all 3 paths, verified on real crowded pair — near marker wins; bladder "miss
fail" was the naive test probe landing in another marker's valid target; standing
condition (6) = a11y audits measure the PROJECTED HIT TARGET not the DOM; testis
sub-footprint disc considered-and-rejected at call site).
TIER 2 IMPLEMENTED (2026-09-04) UNCOMMITTED awaiting review; .claude/mesh_hygiene.py =
recorded transform. Diagnosis redistributed tickets: BRAIN 78% verts = exact dup positions
w/ divergent normals → weld 1e-6 + all-smooth (201,588→95,924 verts, faces exact,
silhouette identical, −572KB, floor faceting GONE); OVARY = perfectly clean manifold
(0 nonmanifold, 0 dups, 0.5mm edges) → rectangles = colour interpolation on coarse
tessellation → ESCALATED untouched (subdivision = fidelity decision); PANCREAS seam
SURVIVED normals weld — isolation proved it: AO-only seamless, mottle-only carries line →
mottle recipe normalises per-mesh bbox → phase jump at boundaries → FIX = opts.frame
(WORLD union box + matrixWorld, world-space because gltfpack wrapper nodes carry dequant
transforms) in applyTissueMottleVertexColors + pancreas.js passes union frame; seam GONE;
288 boundary normals also welded, nodes untouched; bladder same mechanism latent, no
visible seam at freq 4, left alone deliberately; THYROID = 373 disconnected open
fragments (not "some shards"; 316 confetti 1-4 faces) — 15 floating proud components (23
faces) deleted; ceiling 25→100 deleted the SAME 15 ⇒ remaining flaps ROOTED in anatomy-
carrying fragments → ESCALATED (accept / scripted face-list cuts / re-unwrap+rebake
invalidates texture / re-source); UV smear inherent. Position identity verified: brain+
pancreas 0 new/0 removed unique positions vs master; thyroid exactly −10 debris verts =
landmarks safe numerically. Pipeline re-run: AO re-baked (means ≈4B), -kn -cc, COLOR_0+
names verified, zone gate 3/3 @ -vn 8 (smooth brain worst zone 0.830), thyroid texture
re-encoded by Blender round-trip (−452B, visually verified; 4A byte-identity can't survive
a mesh edit). regress 163/2. Evidence /tmp/atlas-verify/t2/.
TIER 2 APPROVED + SHIPPED: d332a9c (Tier 2) + follow-up bladder-note commit, BOTH PUSHED (= origin/main). USER RULINGS folded in: THYROID = accept reduced
state; explicit cuts REJECTED (pyramidal lobe lives at superior pole/isthmus in ~half of
people — variant-vs-artefact = anatomist's call, failure mode = deleting real anatomy);
re-unwrap ELIMINATED on provenance (Sketchfab artist's painted atlas = ONLY colour source,
thyroid.js records the isolation; re-unwrap re-projects smear w/o information); PATH =
RE-SOURCE HUNT, tracked, full license playbook, pre-registered negative (Ovary/Stomach/
Testis standard); Tier-3 note: thyroid = COUNTEREXAMPLE (textured, rank 15, geometry
problem) not albedo evidence. OVARY = closed as TIER-3 EVIDENCE: calibrated threshold
MEASURED = 5.9px mean projected edge @ close pose (0.45×d0, 318px canvas) = where
per-vertex colour visibly quantises; SCREEN of 8 mottle organs: bladder 6.4/brain 6.2/
kidneys 6.0 FAIL (coarser than calibrated failure), prostate 5.2/pancreas 5.0/liver 4.1
MARGINAL, breast 1.6 pass ⇒ OPTION 1 (per-vertex albedo) SCREENED OUT as general Tier-3
mechanism before any bake code. Bladder latent seam note at helper (retune freq → seam
surfaces, fix = same opts.frame). Brain user reflection recorded: first-message guess
("unmerged vertices, two-line fix") was correct but unfindable as stated — nine passes of
instrumentation converted guess into evidence; weld≠topology caveat paid exactly (−895
reported vs 156,631 actual).
TIER 3 DESIGN SESSION OPENED (2026-09-04): user REFRAMED the space as DELIVERY × SOURCE
(options 2/3 bundled them; option 1 died on delivery). SOURCE SETTLED by user ruling:
procedural VARIANCE AROUND A CITED MEAN — mean stays cited, variance computed, honesty
constraint = variance bounded by the cited source's own measured range ("sampling within
a cited distribution"); escalation acknowledged (mottle = value claim, hue/sat = colour
claim); photographic source rejected (chimera argument — one specimen's coloration on
another's geometry; disclosed procedural > undisclosed hybrid). Delivery leaning SHADER/
TRIPLANAR (no UVs → dodges unwrap quality + asset size); named risks: onBeforeCompile
fragility (bounded by import-map version pin + migration discipline) and the AgX
cited-albedo gate now measuring hue/sat the shader deliberately varies — "may be where
this dies". USER IS WRITING Tier 3 as a design-and-measure prompt WITH GATES (not an
implementation spec); one phase targets a constraint I called non-negotiable that they
think is STALE — candidates: (a) lit-face-measurement-must-hold (stale as stated: with
by-design variance it must split into mean-fidelity [existing instrument] + variance-
boundedness [new instrument + NEW per-organ cited RANGES — hidden citation cost]);
(b) m≤1 clip-safe-by-construction (stale basis: it was load-bearing under the HARD-CLIP
pipeline; AgX has measured rolloff headroom — P2: blown=0 at lights ×1.35 ×14 organs ×12
angles; hue variance with all-factors-≤1 necessarily DARKENS the mean, so mean-
preservation and m≤1 are in tension — relaxation shape = factors in [1−a,1+a] verified
against measured AgX headroom). Also separate track: thyroid re-source hunt (license
playbook, pre-registered negative).
TIER 3 PROMPT DELIVERED (user; 6 phases w/ gates, no skipping): P1 derive variance bounds
(CAN END PASS), P2 restate BOTH stale constraints (m≤1 sweep on breast + lit-face two-part
+ GEOMETRIC selector replacing top-luminance-quartile — user's correction: photometric
selector biases toward high-multiplier tail under multiplicative variance, selector must
be independent of measurand, re-validate at a=0 vs P2/P3), P3 composition ruling (replace
mottle → ovary rects resolve free = confirmation test), P4 delivery bake-off (triplanar
w/ version assertion + object-vs-world frame trap vs baked texture w/ no KTX2Loader),
P5 two-part metric (mean + spread percentiles), P6 judgement (lesion test on variance-only
isolation = MOST IMPORTANT GATE, close pose, a=0 discriminator).
PHASE 1 RUN (2026-09-04): sources re-consulted (PathologyOutlines 429s WebFetch but
Browser pane works; LMU re-verified verbatim). RESULT — 4 INCLUDED / 4 EXCLUDED:
brain INCLUDED (LMU Pressbooks 6.3 RE-VERIFIED AT SOURCE today: "Gray matter is not
necessarily gray. It can be pinkish because of blood content, or even slightly tan,
depending on how long the tissue has been preserved" — hue range pink↔tan);
kidneys INCLUDED-QUALIFIED (verification-time record: cortex lighter red-brown vs darker
medulla = value range; Monash epath NOT re-locatable today, exact phrase unindexed);
breast INCLUDED-QUALIFIED (MGH record: adipose yellow ↔ white fibrous two-component
range; not re-attempted, time-boxed); prostate CONDITIONAL (recorded "Tan to pink" quote
NOT RELOCATABLE on PathologyOutlines today — grossing + histology pages carry NO colour
text; substitute named source REQUIRED before implementation); bladder EXCLUDED (its own
comment: colour = placeholder, NO source — mean itself uncited); pancreas EXCLUDED
(DANGLING CITATION since first commit 3c78c88: "citation in CLAUDE.md's organ entry" but
hex/prose appear NOWHERE in CLAUDE.md, source unnamed — records correction needed);
liver EXCLUDED ("dark reddish-brown" = point, no variation language); ovary EXCLUDED
("grayish-pink" compound point; PathologyOutlines ovary URLs 404).
COVERAGE FINDING: the included set {brain 6th, kidneys 7th, prostate 8th, breast 12th}
misses the audit's worst untextured offenders — bladder (13th) and ovary (14th) are both
EXCLUDED. The pass survives Phase 1 but at HALF coverage, aimed at mid-ranking organs.
RULING: TIER 3 HELD — user opened the CITATION-DURABILITY PASS instead (the incidental
finding outranks the pass: 1-in-8 colour citations verifiable; bladder uncited, pancreas
dangling, prostate unverifiable = shipped provenance defects). Two pre-committed rulings:
(1) DOWNGRADE > substitution (citation-shopping produces looks-more-verified-but-is-less);
(2) quote text, never mirror images (public repo). Standing exception: geometric selector
proceeds now.
DURABILITY PASS RUN (2026-09-04), UNCOMMITTED (citations.json + regress.js in tree):
CENSUS 719 citation-carrying lines: epi 372 (126 distinct sources) / licence 152 (5
families) / anatomical 126 / colour 69. VERIFICATION RATES: epi sample 8 → 6 verified
(Waddell 100-genomes verbatim; Oweira N=13233 verbatim; Peres n=28118 verbatim; Di Carlo
CONCORD-3 melanoma BOTH figures in the paper TITLE; Johannsen JAMA NetwOpen 2025; KGCA
series partial) + 1 NOT RELOCATED (Wang Front Oncol 2023 48,789/53,142 — bladder's
headline 92% share, 3 searches failed, HIGH STAKES flag, do-not-substitute) ≈ 75-81% vs
colour 12.5% ⇒ USER PREDICTION CONFIRMED (DOI-durable vs teaching-page-fragile; policy:
permanently-addressed sources for must-stay-verifiable claims). LICENCES: artist pages
4/4 verified (lungs; stomach page+extras; ovary GOLD page+quote+extras; colon+thyroid
pages verified w/ URLs RECOVERED — were never recorded) + bodies CC0 verified; BUT
(a) colon+thyroid embedded-extras legs UNREPRODUCIBLE (Blender re-export dropped extras;
ovary pipeline preserved them = the model; remediation: re-embed attribution in derived
GLBs) and (b) HRA FAMILY (7 of 12 organ GLBs: kidneys liver brain prostate pancreas
bladder breast) = quote-absent — entry pages verify identity but render NO licence text
even after expanding Attribution Instructions ⇒ ESCALATED per pre-registration.
PROSTATE DETERMINATION: BAD ATTRIBUTION, evidenced 3 ways (today's pages carry no colour
text; Wayback 2025-08-20 snapshot PRE-DATING the material pass carries none; site-wide
exact-phrase search = zero) ⇒ downgrade per Ruling 1. PHASE-4 RESOLUTIONS (reported, NOT
edited): bladder downgrade+disclose beyond code comment; pancreas downgrade+fix dangling
pointer; prostate downgrade. MANIFEST: .claude/citations.json, 23 entries (13 verified /
4 not-relocated / 3 downgraded / 2 partial / 1 quote-absent), quotes+dates+hashes, text
only. STRUCTURAL CHECKS: 4 added to regress.js (manifest parses; every entry→real file;
every mottle colour has entry; every shipped GLB has licence entry), all pass, NO live
link-checking (deterministic by design); BASELINE 163/2 → 167/2 (the one legitimate
move). GEOMETRIC SELECTOR: implemented (MeshNormalMaterial pass, view-space n·L>0.6,
tone-map off for normals, staging/markers hidden by identity, config-echo+fingerprint);
a=0 vs ao_k10: hue tracks ≤1.1° all 9; saturation moves TOWARD cited on exactly brain
(.053→.021)/kidneys(.038→.009)/testis(.087→.043) = the AO/glow organs — the old
photometric selector's bias made visible (it over-sampled desaturated highlights).
NOT declared validated at the 0.02 tolerance; recommendation = adopt WITH re-baselined
a=0 reference, not silent swap; user ruling pending. TIER-3 SCOPE UPDATE: prostate falls
OUT (downgraded) ⇒ includable range set shrinks to brain + kidneys/breast(qualified);
Tier 3 stays held pending Phase-6-informed scope decision + possible colour-source hunts.
DURABILITY PASS APPROVED + SHIPPED: 8edfed5 (manifest + Phase-4 downgrades incl.
user-facing #disclaimer colour sentence + structural checks, baseline 167/2 + manifest
_limits "durable-not-true" + _ruling_statistics "re-source or remove, no middle") and
5c33565 (queue outcomes), BOTH PUSHED = origin/main. Six user rulings executed:
(1) prostate = bad-citation-at-entry, manifest limit recorded (initial verification =
single point of failure, demonstrably failed once; care at entry is the only defence);
(2) statistics can't downgrade — Wang = re-source or remove; (3) HRA top of queue →
RESOLVED: project-level licence at humanatlas.io/3d-reference-library verbatim ("All HRA
3D reference objects are released under Attribution 4.0 International (CC BY 4.0)") +
Browne et al. HuBMAP CCF citation — per-model NIH 3D pages were the wrong surface;
(4) extras-preservation ASSERTED in mesh_hygiene.py + bake_ao.py (capture source
asset.extras → re-inject post-export → verify, fail loudly); (5) selector adopted w/
rebaseline (geo_a0 = new reference); (6) four-operator re-run on geometric instrument:
WARNING CONFIRMED NOT RETRACTED — AgX undershoot survives exactly 6/9 same 3/6 split,
smaller magnitudes (worst −0.043 vs −0.087, old selector exaggerated not created), AgX
win WIDENS (0.029 vs aces 0.090 / none 0.114 / neutral 0.220); viewer.js coda added.
WANG EXHAUSTED: 6 strategies, 3 engines, full-text number search — zero. Blast radius =
all 4 bladder subtype shares + metastatic-site figures. Re-source candidates identified
(Halaseh 2022 Cureus PMID 36042998 et al.); USER RULING PENDING on re-source-vs-remove +
the replacement content edit (user-facing, held for review).
WANG RESOLVED AS PARK (commit pushed): "hunt exhausted" verdict was WRONG — the code
comment carried PMC10605465 which six metadata searches never used; resolved first try.
Paper real: Hyung Kyu Park, Curr Oncol 2023, doi:10.3390/curroncol30100656; recorded
"Wang et al., Front Oncol" had BOTH author+journal wrong ("Wang J." = an entry in the
paper's own reference list — transcription slip at entry). All figures verbatim (4 counts
in one sentence; bone 38.3% UC; SEER 17 registries 2010+ = REGISTRY data, answering the
category question; 53,142 = atlas-computed sum, never printed → why number search failed).
bladder.js corrected. THIRD entry-time citation error (prostate quote, pancreas pointer,
Park attribution) — entry-time error rate is the real epi risk, unbounded at n≈12. POLICY:
record PMID/PMCID/DOI in the citation itself, always (the identifier-carrying one was
recoverable; page-name-only ones were not).
TIER 3 CLOSED (user ruling, 2026-09-04): close-zoom monochrome accepted on a documented
citation limit — range set fell to 3 mid-ranking organs; bladder+ovary unrecoverable (no
source / point descriptor); bake-off on unrepresentative geometry = the held reason, now
permanent. Recorded plainly: the citation discipline forecloses the most-wanted visual
improvement — the discipline working, and being expensive. Reopen conditions: citable
colour range for bladder/ovary surfacing, or user policy change on illustrative variation.
POST-PARK REVIEW SHIPPED 989893a (pushed): (a) IDENTIFIER RULE PROMOTED TO PRIMARY,
subsuming source-class preference ("record PMID/PMCID/DOI in the citation itself" works
regardless of source quality; weak-source-with-DOI recoverable, excellent-source-as-page-
title not); (b) user's category-diagnosis CORRECTION recorded at their request (N=53,142
was the atlas's computed sum not a cohort N; source already SEER registry; category error
never existed — right outcome, incorrect route); (c) THREE ENTRY-TIME DEFECT SHAPES
taxonomy — attribution error (Park, recoverable from identifier) / dangling pointer
(pancreas, detect+downgrade only) / content error (prostate, detect+downgrade only) —
epi pass's realistic output = fix attribution errors, downgrade the rest, never hunt for
sources that were never there; (d) IDENTIFIER HARVEST RUN (harvest-first sequencing):
~211 paper-type epi source keys, 41 identifier-carrying, ~170 NOT → coverage ≈19%, four
of five epi sources UNRECOVERABLE-IF-WRONG (partition in /tmp/atlas-verify/cite/
identifier_harvest.json = the epi pass's scope statement). USER CALIBRATION NOTE
(2026-09-04, weight accordingly): their PROCESS instructions (gates, pre-registrations,
measure-don't-infer, instrument-validity checks) have held up consistently; their
MECHANISTIC predictions have been wrong more often than right (-kn cost, glow failure
mode, Neutral-over-AgX, env-map provenance, Wang category error) — "the measurement
discipline has been doing the load-bearing work"; weight their process pushes heavily,
verify their mechanism predictions like any other hypothesis.
(A note about an unrelated project's own gate state, briefly touched in this same session,
sat here in the original archive — removed on a 2026-09-15 sweep as out-of-scope
cross-contamination with no lesson relevant to Cancer Atlas; nothing about that other
project's own state is repeated here.)
OPEN THREADS: fuller EPI verification pass (scope = the ~170 unrecoverable + on-screen
figures first; realistic outputs per taxonomy); thyroid re-source hunt (license playbook,
pre-registered negative); kidneys/breast/MGH colour re-access (time-boxed out).
Draft bounds (word→hex endpoints = disclosed illustrative step, means inside all bounds):
brain H[5°,30°] S[0.35,0.60] V[0.68,0.80]; kidneys H[4°,12°] S[0.58,0.70] V[0.44,0.63];
breast S[0.06,0.38] V[0.85,0.95] H[40°,55°] where S>0.15; prostate H[6°,28°] S[0.35,0.50]
V[0.68,0.78]. Candidate Tier-3 option space to
bring: (a) per-vertex albedo baked offline (extends the proven 4B COLOR_0 pipeline —
no UVs needed; resolution = vertex density, ovary rects show the limit), (b) xatlas/
Blender smart-UV unwrap + baked albedo textures (real textures, needs unwrap quality
gate on marching-cubes topology), (c) 3D procedural albedo in-shader via onBeforeCompile
(no assets, but shader patching in no-build app + accent-illumination-adjacent risks).
Each must preserve cited-albedo fidelity (lit-face measurement discipline) + m≤1 family
clip-safety.
(phase 1 COLD: capture+judge 14 organs + 2 bodies with NO docket in hand, pass/fail/
marginal w/ evidence; phase 2: open docket as SCORING KEY — sidebar+narrow-window
aspect-flip, testis framing+plinth retest, female thigh striping, liver flatter BY DESIGN
(fix=remesh never lower k), prostate 2 pits pre-4B, weld≠topology, zoom-clamp question) → 4B (baked AO, mottle-recipe organs only, m≤1
preserved, composition decided-and-reported before implementing, bladder banding
pre-registered negative) → Prompt 6 fenced glow-restore (negative favoured; gate = raw
visual at 4 concave zones, NOT pixel counts) → Prompt 5 visual audit LAST (audit only).**

## Identifier backfill (2026-09-04, SHIPPED e3d8f4f + c9e8c00, both = origin/main)
The cheap pass between harvest and verify, run to the user's spec: PubMed eutils
with a MULTI-FIELD AGREEMENT GATE (first-author surname + year + journal-when-
recorded + topic-consistency; EXACTLY ONE candidate may pass; refusals never
guesses — automated title-match writing a confident wrong identifier =
citation-shopping with better throughput), method + resolution date stamped per
entry so backfilled ≠ entry-time. Sweep: 188 records, 3.5 min, 0 API errors →
46 backfilled / 13 no-match / 11 ambiguous / 97 no-field-match / 21 parse-noise.
FLAG-PILE TRIAGE EMPTIED THE NO-MATCH PILE: all 13 were extractor artefacts
(10 journal-fragments-as-authors → reclassified parse-noise w/ reason; 3 mangled
author tokens — compound surname "Mehrvarz Sarshekeh", "(PNAS," and
", Neuro-Oncology" patterns — all 3 re-resolved uniquely under the SAME gate w/
corrected tokens: 28267766, 23412337, 34185076; Louis proved the retrieval-miss
mechanism live — bare surname+year hit retmax truncation, needed the source
line's journal constraint). ZERO new entry-time errors: Wang/Park class does
not recur in the auto-detectable band; triage is MANDATORY before reading a
no-match count as a defect count (the pipeline's own parser was the dominant
defect source in its own flag pile). Coverage 41 → 90 identifier-carrying
sources. Semantics recorded in manifest `_backfill_method` + `_backfill_triage`
+ per-record `backfill` block: a backfilled identifier asserts unique
resolution of recorded metadata, NOT claim verification. no-field-match (97) is
"not auto-resolvable", NOT a defect list. 11 ambiguous = correct refusals
(Shain 2015 / Gershenwald 2017 / Pollock 2003 are two REAL same-author-year
papers each — need the claim to disambiguate = epi-pass work; Park 2023 already
identifier-carrying from durability pass). Regression 167/2 baseline exact.
Epi-pass order now: 11 ambiguous → user-facing no-field-match, on-screen first.

## Gate-strength audit + sweep 2 (2026-09-04, SHIPPED d8f2f18 = origin/main)
User pushed twice before accepting the residue; both pushes changed it. AUDIT:
sweep-1 effective strength = 24 A+Y+J+T / 13 A+Y+J / 6 A+Y+T / 3 A+Y-ONLY; zero
journal-mismatches is STRUCTURAL (journal enforced in-query via [ta] ⇒ mismatch
presents as zero hits). A+Y-only tested vs ground truth: FAILED 2/3 (Zhu 2003 →
plant-genetics paper while true PMID 12866375 sat on next source line; Boutros
2015 = NEGATED mention in an authorship-correction comment decorated with an
unrelated paper) — both retracted. Testable-vs-entry-time scoreboard: ≥3-field
4/4 correct (Jakob/Livasy/Luvhengo sweep-1, Wippold sweep-2), A+Y-only 2/2
wrong. RULE ADOPTED: automated backfill needs ≥3 agreeing fields; every
backfilled entry carries fieldsChecked (strength ACTUALLY applied). NEW
extractor defect class: multi-line citation parentheticals — 5 records (Zhu,
Luvhengo, Jakob, Livasy, Wippold) had identifiers ON the citation's
continuation line, harvested as identifier-less → reclassified entry-time
(3 double as resolver validation). Corollary: never harvest negated mentions
in correction comments. SWEEP 2 on the 97 (Louis proved retrieval leaky):
retmax 8→100 + count recorded, topic-in-query (instrument recorded
topic:title/topic:query), Crossref second engine, identity-deduped union
exactly-one. 37 resolved (~38% of "not-auto-resolvable" was query artefact;
incl. Wippold validation + Curtin 2005 → 16291983, claim stays paywall-
unverified per semantics). Residue characterised: 39 ambiguous-2 (genuine
collisions, 0 dedupe suspects), 11 saturated (count>100), 10 zero-pass.
COVERAGE 126/~211 ≈ 60% (19% at harvest). 11 sweep-1 ambiguous stay refused
(user: two-real-papers = only the claim settles it, epi-pass by construction).
Sweep-2 harness /tmp/atlas-verify/cite/sweep2.py + fold_sweep2.py; results
sweep2_results.jsonl. User's detector-prediction self-correction recorded: a
detector whose dominant signal is its own upstream noise is a flag pile, not a
detector — mandatory-triage is the generalisation.

## Extractor audit + polarity guard + condition (7) (2026-09-04, SHIPPED 05367a0 = origin/main)
User's three extractions from the ground-truth ruling, executed same day.
AUDIT (seed=42, n=30/188, hand-compared): author 24/30 (5 journal-fragments
screened + 1 LIVE author-order "Li, Kang & Tang"→Tang refused only by luck);
year 30/30; JOURNAL RECALL 44% (11/25 with journal ON the line) — the
"when-recorded" qualifier concealed a harvest failure; 6 sampled residue
records have unharvested journals in plain sight ⇒ re-extraction converts
residue to resolvable; topics defective ~11/30; REF LINE systematic +1 in
~29/30 (one window-indexing bug, also explains identifier-on-next-line
misses; refs NOT blanket-mutated). Downstream damage MEASURED: sampled
backfills title-verified 11/12 — ARENDS RETRACTED (Histopathology colorectal
citation backfilled to S. pneumoniae ISME J paper: extractor journal miss +
'colon'⊂'colonization' SUBSTRING topic match ⇒ word-boundary matching required
in future sweeps). Coverage 46 entry-time + 79 backfilled = 125/~211.
POLARITY GUARD .claude/citation_polarity.py (Boutros = failure class: token-
matchers have no claim polarity; epi pass reads the same lines): classifies
WINDOWS corrective/caveated/clean, contract = flag-then-human-read, never
auto-acts (regex can't tell negated Colombino from correction-target Jakob).
Scan 152/9/27 across 188; flags in manifest (window+windowMarkers); mention-
level reads: ALL KEEP (Hu 2012 = cited AS the mis-citer, identifier correct
but epi pass must not verify the transposed 54/32/15 against it as asserted).
Colombino never harvested (lucky, not safe). CONDITION (7) STANDING: a check
that reports zero must be demonstrated capable of reporting non-zero before
its zero is believed (4 instances: blown-pixel gate, coverage guard,
photometric selector, zero journal-mismatches). Applied at birth: guard
self-test proves fire+silence, scan refuses on failing self-test; first run
caught a mislabelled FIXTURE (guard right, my label wrong). NEXT CHEAP PASS
OPENED (user-gated): extraction v2 (+1 offset, journal recall, author-order,
topic pollution, substring) → re-run 60-record residue with recovered
journals. Manifest keys: _extractor_audit, _polarity_guard, _gate_audit.

## Class audit, epi contract, extraction v2, residue re-run (2026-09-04, SHIPPED 790d3b7 + 6fd0d86 = origin/main)
User pushed on the substring bug's target class + fieldsChecked conflation +
Hu-generalisation; extraction v2 approved. EXHAUSTIVE NO-JOURNAL-CLASS AUDIT
(790d3b7): all 29 no-journal backfills title-read by hand — 24 verified (19
journals hand-recovered into fieldsChecked as journal:line-read; journalOnLine
disambiguates not-present vs not-harvested), TWO more wrong backfills found
exactly as predicted (Wilentz 2000 → wrong same-author paper, journal Cancer
Res was ON the line; Oweira 2017 → HCC paper for a pancreatic SEER claim; both
re-resolved w/ word-boundary + hand titles — Oweira: 1 of 15 candidates passed
word-boundary where substring passed several); PNAS/Sottoriva → entry-time
(PMID on line); Nunes 2024 multi-mention flagged. Wrong-backfill census: 4
total (Zhu, Arends, Wilentz, Oweira) — ALL in the no-journal class, 0 in
journal-checked. EPI-PASS CONTRACT recorded (_epi_pass_contract): THREE verdict
states — verified / failed / NOT-A-SOURCE-CLAIM (Hu 2012: binary would report
a defect against a line that already says the figures are wrong).
RETRACTION (6fd0d86): my audit's "systematic +1 ref-line offset" was FALSE —
the audit's own context printer had off-by-one label arithmetic; grep -n
re-check: v1 refs were EXACT; v2's refline "failures" were the truth table
inheriting the printer bug. Condition-(2)/(3) inside the audit itself. All
other audit rates re-checked vs raw grep/sed and stand. Zhu claim corrected:
PMID on ref+1 (continuation-miss mechanism stands).
EXTRACTION V2 (.claude/extract_citations.py, repo tool): author-line refs,
structural journal parse, first-surname-of-list, nearest-head-to-year priority
(Skok/Santucci case), surname particles, clause topics, entryTimeIds, polarity
per record. VALIDATED 28/28/28 (author/journal/refline) vs grep truth; 372
records, 73% journal (v1 35%), 41 entry-time ids. RESIDUE RE-RUN (60 recs, v2
fields, word-boundary, min-3-fields, [ta] retmax=100 + Crossref): 26 resolved,
ALL titles hand-read — Cooper 2015 → 25730763 = entry-time id in the
correction comment (convergence); Siech → entry-time (pmid on line); 5 author-
corrections worked; dedupe groups corrigenda w/ originals, pmid = original
(Mariette 30167905). Residue: 15 still-ambiguous / 8 still-saturated / 10
still-zero-pass / 1 no-v2-match + 11 sweep-1 refusals = 45 characterised.
SOURCE DEFECT recorded not fixed (_source_defect_candidates): bladder.js:174
says "PLoS ONE" but PMC3808633 = 24101484 = PNAS (attribution error, fixable
class); Fontugne prostate.js:132 entry-time id converges w/ backfill.
COVERAGE 48 entry-time + 103 backfilled = 151/~211 ≈ 72% (19% at harvest).
Next: epi pass (3-state contract, polarity flags, on-screen first; residue
worklist 45), thyroid re-source, kidneys/breast colour re-access.

## Crosscheck + journal-required + condition (7) bidirectional (2026-09-04, SHIPPED b72f019 = origin/main)
CONDITION (7) EXTENDED both directions: zero-reporting AND clean-pattern-
reporting checks need an independent instrument before belief (the +1 offset
was persuasive BECAUSE tidy — an off-by-one in a display function presents as
a discovered law); catch mechanism recorded: follow the disagreement, don't
fix the failing thing. JOURNAL REQUIRED replaces minimum-three (census
categorical: 4/4 wrong backfills no-journal, 0 journal-checked; field entropy
not field count; ~14% no-journal error 4/29; v2 73% recall affordable);
no-journal → human title-read only. CROSSCHECK TOOL
.claude/citation_crosscheck.py (Rachakonda generalised): every id-carrying
record's recorded journal/author/year vs esummary metadata, one bulk pass —
attribution detection + backfill validation by construction (retrospectively
would have caught Zhu/Arends/Wilentz/Oweira); condition-(7) selftest both
directions + live known-positive assertion (all-clean scan impossible unless
broken). RUN 130 records → 7 flags all classified: 3 artifacts + FOUR NEW
attribution errors (id right, journal wrong): Beyer testis:34 Ann Oncol→JCO
33729863, Paly testis:149 J Urol→Radiother Oncol 23321493, Zeng testis:154
Front Oncol→J Urol 39977396, Wood testis:157 J Urol→Clin Radiol 8617040. With
Rachakonda = FIVE, 4/5 in testis.js (journals shuffled among neighbouring
cites, one session's systematic slip). RECORDED NOT FIXED — one-word fixes
awaiting the go (_source_defect_candidates). Crosscheck↔v2 hardening loop:
id over-reach across citation boundaries (paren-scoped attachment), head-
fallback shadowing (JCI Insight vs Fontugne), head-ownership ';' guard
(Ziol|2024) — instruments check each other. LIMITATION: PMC/doi ids unmapped
(Rachakonda came via manual idconv). DAY LINE (user's number for the record):
19% → 72% identifier coverage in a day, precision attached rather than
assumed. Next: apply the 5 one-word attribution fixes on user go; epi pass
(3-state, polarity flags, 45-record residue); thyroid re-source;
kidneys/breast re-access.

## Attribution ruling + condition (8) (2026-09-04, SHIPPED e4f6421 = origin/main)
RACHAKONDA FIXED in source (bladder.js:174 PLoS ONE→PNAS; isolated no-cluster;
validated by the detector — post-fix crosscheck passes; wrong pair kept as
permanent self-test fixture). TESTIS FOUR HELD deliberately (user ruling): the
crosscheck validates id↔metadata, so an ENTIRE citation block migrated onto
the wrong claim is internally consistent and structurally invisible — a
journal shuffle that moves journals can move identifiers; a one-word fix would
convert a visible defect into an invisible one. The four flags = evidence of a
DISTURBANCE IN THE FILE, not four typos. testis.js → FRONT of epi-pass
claim-level queue, EVERY citation in the file (shuffle doesn't respect the
detector's boundary). CONDITION (8) STANDING: a new detector's first run is
instrument calibration, not findings (3 instances: no-match pile, coverage
guard v1, crosscheck first runs) — run, triage, fix pipeline, re-run, read
the SECOND run as evidence. CROSSCHECK EXTENDED: PMC via elink + doi via
esearch[doi], 141 records examined (was 130), 1 unmappable id LISTED never
silent (doi:10.1002/prm2.12107 breast.js:147); extension's first run treated
as calibration (stale v2 input echoed fixed Rachakonda + tag artifact),
second run = evidence: 7 flags of 141 = exactly expected (3 artifacts + 4
held). Epi-pass queue now: (1) testis.js all citations claim-level, (2) 45-
record residue + polarity-flagged windows w/ 3-state verdicts, on-screen
first.

## Epi pass OPENED: contract + shuffle test + calibration batch (2026-09-04, SHIPPED fa7b398 + 1dd4639 = origin/main)
FROZEN CONTRACT recorded (user-authored, manifest _epi_pass_contract; outcome
vocabulary + milestones + testis entry FROZEN, rest iterates): pass is NOT
partially done — 72% id coverage = 72% CAN be claim-checked, ~8/211 actually
claim-checked. FIVE STATES: verified-quoted / verified-derived (record
arithmetic; Wang/Park's 53,142 was atlas's own sum) / failed (attribution→fix;
content→statistics ruling: ON-SCREEN figures re-source or remove) /
not-a-source-claim (Hu 2012; 36 polarity windows = candidates, human
mention-read each) / unverifiable-by-access (Curtin; claim STANDS, expect
common). MILESTONES: M1 on-screen figures (share values, ORGAN_DETAILS,
hotspot text) → M2 testis.js full → long tail (checked vs checkable per
entry; may never complete, acceptable). SHUFFLE TEST DISCONFIRMED decisively
(grep: the 4 flagged lines are the ONLY occurrences of those journal names;
recorded set ≠ permutation of true set; lone Paly→Zeng adjacency orphaned =
coincidence; condition (7): verified vs raw lines + 17-record ordered map) →
contract fork: 4 independent wrong labels, ORDINARY fixable class, urgency
DROPS, M1 leads, testis = normal read. CALIBRATION BATCH (condition (8), the
4 held flags = first claim reads, efetch abstracts): Beyer VERIFIED-QUOTED
(2,451 / 95% / 88% verbatim), Zeng VERIFIED-QUOTED verbatim (laterality +
6-11.1%), Wood VERIFIED-QUOTED quote word-for-word, Paly VERIFIED-QUOTED all
figures (90/145/84-9-7%/99% 2.5cm T12-L1) w/ ONE caveat: atlas "isolated
nodal relapse" vs paper "infradiaphragmatic adenopathy" (descriptor
over-spec, not figure error). ALL FOUR identifiers belong to their claims;
4 journal labels = ordinary attribution errors; signal fully consumed;
one-word fixes SIGNAL-FREE, AWAITING GO (hold explicit). NEXT: user go on 4
label fixes → M1 on-screen figures (first batch = calibration per (8)).

## Five fixes applied + hold discharged + SIXTH STATE (2026-09-04, SHIPPED 73a3857 = origin/main)
ALL FIVE attribution errors FIXED (testis four: Beyer→J Clin Oncol, Paly→
Radiother Oncol, Zeng→J Urol, Wood→Clin Radiol; + Rachakonda earlier), every
fix detector-validated: post-fix crosscheck = exactly the 3 known artifacts,
ZERO genuine flags (3/141). HOLD DISCHARGED, recorded as such: it existed to
stop a one-word fix erasing the identifier-belongs-to-claim question; reading
all four claims answered it. USER SELF-CORRECTION named: displacement read =
SAMPLING ON THE DEPENDENT VARIABLE (mechanism inferred from flagged records —
precisely the records surfaced because something was wrong; non-random sample
patterns don't generalise; the full ordered map was right BECAUSE it included
unflagged records; same family as +1 offset — tidy pattern from partial data,
dissolved by widening the aperture). SIXTH OUTCOME STATE by user amendment:
VERIFIED-FIGURE-SCOPE-DRIFT — figures verbatim, citation sound, claim attaches
them to a narrower/different population than measured; consequence = NO
citation action, COPY EDIT to surrounding text. Born from Paly ("isolated
nodal relapse" vs paper's "infradiaphragmatic adenopathy"; survived a
"SOURCES, verified directly" header). A state not a footnote: invisible to
find-the-figure verification (calibration batch 4/4 on figures, 1/4 had this
defect = 25% miss for number-matching readers) + likely-common class (UI-copy
compression pressure peaks on-screen → M1 most frequent). Paly copy edit
APPLIED (state's first discharge, paper's own descriptor). CALIBRATION LESSON
standing: verify population/scope descriptor ALONGSIDE the figure. NO PRIOR
into M1 (4/4 = biased sample, says labels were isolated, doesn't predict M1
rate). One v2 lexicon hardening in passing ('radiother' — my own edit created
a shadowing case, caught by the detector same-run). NEXT = M1 on-screen
figures (share values, ORGAN_DETAILS, hotspot text; first batch =
calibration per (8); six-state vocabulary; scope descriptors checked).

## M1 opened: annotation census + calibration batch (2026-09-04, SHIPPED 5a57ce9 = origin/main)
CONDITION (7) EXTENDED PAST INSTRUMENTS (user): human annotations asserting
cleanliness = zero-reporting checks; "verified directly" w/ no record of what
was compared is unfalsifiable by construction; verified-marked lines NOT
deprioritised (defined population, known defect rate 1/1). CENSUS: 18
"verified directly" sites = mostly BLOCK-LEVEL claims (4 organs "EVERY
citation verified": colon/stomach/pancreas/skin; 11 HISTOLOGY sections) =
bounded high-yield sub-batch (each finding also retires a false coverage
claim). M1 SURFACE: ~336 on-screen items (51 share + 51 facts + 116 ccf + 118
features), >> contract's "few dozen" guess. CALIBRATION BATCH (12 claims,
cross-type, no prior): 7 VERIFIED-QUOTED (kidneys VHL 86.6% verbatim incl.
mechanism phrase, low-severity note: "sporadic" dropped; bladder Rachakonda
65.4%+even-distribution verbatim, 214/327 reverse-derived; Allory 70%/79%
verbatim; Katyal 55%; Hahn 25/84; Rosty 105/757=14%; Livasy 4 phrases
verbatim), 2 VERIFIED-DERIVED w/ arithmetic (testis 64.5%=22,634/35,066;
pancreas ~50% classic from Hahn 25/84+6/27), 1 CLEAR SCOPE-DRIFT (testis share
generalises GERMANY 2003-2014 registry — Brandt Andrology 2019 31310057 —
qualifier silently dropped; copy-edit STAGED not applied, calibration verdicts
expected revised), 7 sub-figures PENDING-FULL-TEXT (Fontugne 251/328
PMC8876549, Waddell 31% PMC4523082, Livasy fractions no-PMC, Brenner
PMC2671032, Cichorek 1:10 PMC3834696, Zhuang 51%, Guichard 20.8% PMC3819251),
0 failed. METHOD CORRECTED AT CALIBRATION (condition (8) working): first
instinct = stamp body-bound figures state-5 — WRONG per contract (state 5 =
UNREACHABLE; 6/7 have OA full text) → honest verdict = pending-full-text;
structural lesson: ~37% of figures live in paper bodies ⇒ M1 method REQUIRES
PMC full-text fetch as standard equipment. OLD-PASS EVIDENCE: Livasy under
"verified directly" header = phrases verbatim in abstract, fractions
body-bound ⇒ consistent w/ quote-checking without figure-checking. NEXT:
batch 2 (evidence batch per (8)) w/ PMC full-text equipment — resolve the 7
pending + testis scope copy-edit on batch review; then the verified-annotation
sub-batch; then remaining ~324 surface items batched.

## M1 split + batch 2 + hypothesis inversion (2026-09-04, SHIPPED c872276 = origin/main)
M1 SPLIT (user): M1a = 51 shares + 51 facts (102, the real milestone); M1b
CENSUS = populations OPPOSITE: ccf strings ARE statistics (105/116 cited, 1
plain = honest no-figure disclaimer) → join claim-read queue; feature labels
descriptive (107/118 plain, under block HISTOLOGY citations) → annotation
sub-batch vocabulary; ~11 cited features join queue. Statistical surface ≈229.
BATCH 2 (evidence, PMC full-text equipment): 4/7 pending → VERIFIED-QUOTED at
full text (Fontugne 251/328=76.5% multifocal RPs; Waddell SMAD4 31% = 9 SV+22
mut; Cichorek 1:10 basal; Zhuang 1,116/2,197=51% lung); Brenner+Guichard
OA-RESTRICTED in PMC + Livasy no-PMC = 3 legitimate provisional state-5
(PMC exhausted, publisher routes unattempted, claims stand). SCOPE RE-CHECKS
(rule: batch-1 abstract-found FIGURES stand; SCOPES provisional by
construction — populations live in methods): Moore full text CONFIRMS
sporadic → kidneys copy-edit APPLIED ("sporadic clear cell RCC"); Rosty +
Rachakonda scope-ok; Katyal/Hahn/Allory provisional (no OA). Staged testis
edit APPLIED w/ batch-2 confirmation ("22,634/35,066 in a German 2003–2014
registry"). RULE: verified-quoted carries sectionsConsulted (real strength
not specified, like fieldsChecked). HYPOTHESIS SAMPLE INVERTS THE PLAN:
reachable figures under "verified directly" headers 4/4 CORRECT (Cichorek,
Waddell, Hahn, Rosty); quotes verbatim everywhere tested; only known
population defect = SCOPE descriptor (Paly) ⇒ "quote-checked not
figure-checked" NOT supported by figure failures; demonstrated gap class =
scope descriptors ⇒ REVISED sub-batch instruction: SCOPE-FIRST w/ figure
spot-checks (was: figures-first skip quotes). Sample small (4) — second
sample before generalising per (8). Regression 167/2. NEXT: M1a batches
(shares+facts, scope-first habit, sectionsConsulted recorded), annotation
sub-batch scope-first second sample, ~116 ccf queue behind M1a.

## Scope-first M1-wide + secondary rule + uncited queue-jump (2026-09-04, SHIPPED bcdcbb4 = origin/main)
SCOPE-FIRST = M1-WIDE DEFAULT (user: every defect so far is scope drift — Paly
+ kidneys sporadic + testis registry = 3/3 — vs ~17 figures 0 errors; numbers
copy atomically, descriptors get paraphrased; also cheaper). ADAPTIVE GATE:
figure spot-check rate tied to running figure-error count, raised on first
error. SECONDARY-SOURCE RULE: review-quoted figure ≠ verification (verifies
someone else's reading; same chain refused under license-laundering rules);
secondary-only ⇒ state 5 + corroboration noted, NEVER substituted
verified-quoted; Brenner/Guichard/Livasy stay provisional until publisher
routes tried. UNCITED-CCF QUEUE-JUMP (10 items): 6 cited-nearby (prostate ERG
×2 comment trail; testis KIT cited-sibling; thyroid RET/RAS 'verbatim from
TCGA Cell 2014 PMC4243044'; thyroid GENIE ×2 database named — GENIE portal
query = new read type queued); 4 GENUINE ORPHANS resolved vs TCGA full texts:
ovary HRD ~50% VERIFIED + RE-SOURCED on-screen (TCGA Nature 2011 'about
half'); 3 ADJUST CANDIDATES reported not edited (need go): ovary CCNE1
15-20% vs TCGA '>20%'; breast BRCA1 15-20% TNBC vs TCGA ~20% BRCA1-OR-BRCA2
combined; breast PIK3CA '39% overall' = TCGA's HER2E subtype rate (9%
basal-like half verbatim-verified ✓). No-shopping guard: TCGA-on-all-four
would have made 3 confident wrong attributions. Regression 167/2. NEXT: go on
3 adjust candidates → M1a batches (scope-first, adaptive gate,
sectionsConsulted) → annotation sub-batch 2nd sample → ccf queue → GENIE
portal reads.

## Three TCGA forms adopted + THE DIRECTION (2026-09-04, SHIPPED e92fd4f = origin/main)
ALL THREE APPLIED on the go: ovary CCNE1 → "amplified in >20% of HGSOC tumors
(TCGA, Nature, 2011)" (RULE: when an uncited figure disagrees with the
canonical source, THE FIGURE MOVES — source-hunting to endorse a written
number = citation-shopping in reverse); breast → "BRCA1/2 alteration ... ~20%
of basal-like tumors (TCGA, Nature, 2012)" (the serious one: TNBC ≠ basal-like
— IHC vs gene-expression instruments — so it was a CATEGORY SUBSTITUTION not
a rounding; note's TNBC mention corrected too); breast PIK3CA → "~9% of
basal-like, against 39% in HER2-enriched (TCGA, Nature, 2012)" (re-label makes
the sentence BETTER — both sides now say what the source measured). THE
DIRECTION recorded as the M1a instrument: SEVEN FOR SEVEN defects drift toward
the general (15-20 for >20; TNBC for basal-like; BRCA1 for BRCA1/2 = gene as
family; overall for HER2E; Paly cohort; kidneys sporadic; testis registry) —
paraphrase toward the general, compression drops qualifiers. Scope question =
"IS THIS STATED MORE BROADLY THAN WHAT WAS MEASURED" (subtype→overall,
cohort→population, gene→family, registry→world). COROLLARY: narrower-than-
source is SURPRISING → second look, not a pass. All 10 uncited-figure items
resolved (6 cited-nearby / 1 re-sourced / 3 adjusted-to-verified). Regression
167/2. NEXT: M1a batches (scope-first + direction instrument + adaptive
figure gate + sectionsConsulted), annotation sub-batch 2nd sample, ccf queue,
GENIE portal reads, thyroid re-source, kidneys/breast colour re-access.

## M1a batch 1 + guardrails (2026-09-04, SHIPPED 2742e63 = origin/main)
GUARDRAILS RECORDED FIRST (user): (1) QUOTE REQUIREMENT — scope-drift verdicts
must quote the source's restricting language verbatim; no quotable restriction
⇒ VERIFIED not drift; (2) PRE-REGISTERED RATE ~23% (7/30) — departures either
way get investigated. BATCH 1 (20 share claims, 5 organs): FIGURES 0/14 errors
— KGCA Lauren 50.0/39.0/10.9 verbatim; Lim thyroid TABLE fully verbatim incl.
471/2,371 (FIRST CLEAN ANNOTATION SPOT-CHECK — in-comment 'verified from the
paper's own table' checks out); Siech 5 counts verbatim; Park 4 counts = the
53,142; CBTRUS 13.7/52.2/42.6 verbatim + 22.2 confirms derived 8.5%. SCOPE: 4
new drift-causes, ALL quotable, ALL broader-than-measured (direction 11/11):
PROSTATE med ('of prostate cancers' vs 'patients treated with RP or RT' SEER
2004-2020); BLADDER med ('~92% of bladder-primary carcinomas' on a FOUR-TYPE
denominator 'conventional UC, NEC, SCC, and ADC' — scope-first caught what
figure-verification passed); BRAIN low (US 2018-2022); THYROID low (SEER-9
1974-2013). 4 causes touch 17 sibling strings; EDITS AWAIT GO (qualifier
placement per string family = one design decision; testis precedent inline).
Stomach = exemplar (restriction on-screen). RATE 4/20 = 20% ≈ 23%
pre-registered — no departure. UNRESOLVED: ovary canonical Peres JNCI
OA-RESTRICTED (4 sibling shares orphaned pending alternative canonical;
clear-cell comment-verified pending spot-check); breast×4/kidneys×3/liver×2
orphan queue; lungs/colon/pancreas/skin = web-source read type queued. NEXT:
go on 4 qualifier-edit families → M1a batch 2 (orphan queue sourcing +
web-source reads + ovary alternative canonical) → facts (51) → annotation 2nd
sample → ccf queue → GENIE.

## Placement principle + 14 edits + demonstration + conclusion (2026-09-04, SHIPPED ce0b0c4 + f893df8 = origin/main)
QUALIFIER-PLACEMENT PRINCIPLE (user, covers remaining ~80 M1 items): BIAS
(changes how the number reads) → inline with the number (one row/screenshot
must not deliver conditioned as unconditioned); PROVENANCE (where/when, no
implied difference) → once per family. PREFER STATING THE DENOMINATOR TO
HEDGING (PIK3CA move; stomach exemplar). THYROID SECOND LOOK → reclassified
BIAS (SEER-9 1974-2013 spans the papillary overdiagnosis wave; Lim's headline
IS the papillary-driven tripling in that window; pooled share mixes eras) +
bonus catch: deaths window DIFFERS (2,371 deaths 1994-2013) → anaplastic row
now carries two windows one per clause. ALL 14 APPLIED: bladder ×4 '~92% of
the four commonest bladder-primary carcinoma types'; prostate ×5 'treated
with surgery or radiotherapy' (SEER 2004-2020 anchor); brain ×1 anchor
'(CBTRUS, US 2018–2022)'; thyroid ×4 '(SEER-9, 1974–2013 pooled)' + deaths
split. Medium/low grading mapped onto bias-vs-provenance exactly. BLADDER
DEMONSTRATION recorded as THE answer to 'why not just verify the figures':
counts verbatim twice (durability + M1a), scope-first caught the four-type
denominator — demonstration not argument. DIRECTION AS CONCLUSION: ~50 claims
read, ZERO narrower-than-source; compression toward the general, qualifiers
dropped never added = durable authorship property; narrower-than-source =
anomalous, investigate. Regression 167/2. NEXT: M1a batch 2 — orphan queue
(breast×4/kidneys×3/liver×2 sourcing), ovary alternative canonical (Peres
paywalled), web-source reads (lungs NCI PDQ, colon StatPearls, pancreas NCI
PDQ, skin NCI/StatPearls); then facts (51), annotation 2nd sample, ccf queue,
GENIE.

## Clause rule + batch-2 web tranche (2026-09-04, SHIPPED 8d947cc + a8953a7 = origin/main)
CLAUSE RULE (user): verification unit = the CLAUSE not the string (2-for-2:
anaplastic two windows, PIK3CA two populations — second clause carried the
defect both times; silent failure: verify A, mark string verified, B never
read). CENSUS: 41/146 figure-carrying strings multi-clause (28%), up to 6
clauses; M1 queue = 201 CLAUSE-verdicts. OVERSTATEMENT CORRECTED: 4 strings
demoted to partially-verified (stomach ×3 — Dutch van der Kaaij clause never
read, paywalled; colon PIK3CA — Nosho 91/590 ambiguous-unresolved). WEB
DISCIPLINE: tertiary ≠ secondary-trap (atlas cites them AS themselves) but
living documents → Phase-3: verify + retrieval date + quote archived in
manifest + durability class (_web_source_archive). TRANCHE RESULTS
(retrieved 2026-09-04): colon StatPearls '>90%' VERBATIM (page 2025-02-27);
pancreas PDQ 'Duct cell carcinoma (90% of all cases).' VERBATIM (2025-02-12);
LUNGS DENOMINATOR TRANSPLANT — PDQ says 25/40/10 'of lung cancers', atlas had
them 'of NSCLC' with numbers kept ⇒ each claim UNDERSTATED (40% lung ≈ 47%
NSCLC): the direction corollary FIRED (not-broader = anomalous → investigate)
and found a NEW mechanism (figure kept, denominator swapped — sideways, not
toward-the-general); squamous '~25–30%' → 25 per figure-moves. ALL FOUR lungs
rows re-labeled to ONE denominator (40+25+10+15 coherent) + SCLC 15% verified
('bronchogenic carcinomas' term note). Regression 167/2. NEXT: skin share #39
(FIVE clauses, own read) + skin rows, PathologyOutlines-cited quotes (the
never-at-source class), 9 orphans (breast/kidneys/liver — source or remove),
ovary alt canonical, Nosho + van der Kaaij clauses, facts (51), annotation
2nd sample, ccf queue (201-clause accounting), GENIE.

## Sum detector + hypothesis v2 + clause-basis ledger (2026-09-04, SHIPPED c3827ba = origin/main)
SUM-COHERENCE DETECTOR .claude/share_sum_check.py (user-specified: transplants
detectable by arithmetic alone — the class the direction heuristic is blind
to; form = 'does the sum match what the LABEL claims', self-declared
non-exhaustive exempt by construction). Condition (7): fires on pre-fix lungs
75-of-NSCLC, passes prostate 100.00; first self-test caught a wrong FIXTURE
again (all-exempt families = EXEMPT, tool right). Condition (8) calibration
caught a PARSER artifact (stomach 2nd clause range-matched over clause A →
105; fixed clause-A scoping — THE CLAUSE RULE APPLIES TO PARSERS TOO).
Evidence run 14 families: 8 COHERENT / 5 partial-exempt / 1 GAP (liver 92.5)
HUMAN-READ PASS (two-row family, no exhaustiveness claim, real ~7% remainder
— recorded as the GAP worked example). ZERO live transplants. ANNOTATION
HYPOTHESIS v2 (before 2nd sample): 'checked something, recorded as checked
everything' — 3 instances (Paly under verified-directly; stomach EVERY-block
vs its own paywall admission; 18 wholesale claims); PREDICTION: 2nd sample
finds UNREAD items (clauses/siblings/second sources inside wholesale blocks),
not wrong ones — different search than sample 1. DIRECTION LEDGER clause-basis:
~60 clauses read, 11 broader causes + 1 sideways transplant, ZERO
narrower-by-compression; rate ~20% ≈ pre-reg 23%. Regression 167/2. NEXT: skin
5-clause share + StatPearls rows + PathologyOutlines quotes; 9 orphans
(source-or-remove); ovary alt canonical; Nosho + van der Kaaij demoted
clauses; annotation 2nd sample (unread-coverage search); facts; ccf 201-clause
queue; GENIE.

## Duplicate detector + closed questions + retrospective framing (2026-09-04, SHIPPED ecdfdbd = origin/main)
TRANSPLANTS = CLOSED QUESTION (user: negative carried as explicitly as finds):
zero live across 14 families, lungs ISOLATED. DUPLICATE-FIGURE DETECTOR
.claude/duplicate_figure_check.py (2nd source-free class): census = atlas DOES
duplicate (15 same-claim pairs, all verbatim reuses); drifted pairs can't be
found by figure-matching (numbers differ by definition) → tool matches masked
word-windows, compares numbers inside. Condition (7) at birth; (8) calibration
3 rounds: 166 (template collisions — discriminator in gene: field OUTSIDE the
string) → 115 (my thyroid qualifier made siblings template-identical; subject
= gene OR name) → 62 (family denominators = templates; diff-label skips
unconditionally) → 4. EVIDENCE RUN: 1,645 pairs, 4 flags ALL triaged FP in 2
documented residual classes: SITE-TEMPLATE (per-site involvement figures on
shared-driver rows — stomach 32/15/12, skin CNS-49/44 vs liver-29/27, all
Riihimäki; subject = the SITE) + CITATION-BOILERPLATE (Schutte-1997 vs
Wilentz-1998 one row). ZERO REAL DRIFT — every duplicated figure agrees today;
2nd class closed, detector standing. RETROSPECTIVE FRAMING recorded
(_retrospective_framing): every detector built AFTER a human read found its
class — regression insurance NOT discovery; 141 unread clauses surface new
shapes at human-read pace; read budget = binding constraint; claiming
otherwise = the annotation over-claim itself. Regression 167/2. NEXT
(unchanged queue): skin 5-clause + StatPearls rows + PathologyOutlines
quotes; 9 orphans source-or-remove; ovary alt canonical; Nosho + van der
Kaaij clauses; annotation 2nd sample (unread-coverage search); facts; ccf
201-clause queue; GENIE.

## Fraction detector + well-dry + a gate slip (2026-09-05, SHIPPED 5034b85 = origin/main)
THIRD SOURCE-FREE DETECTOR .claude/fraction_check.py (fraction vs percentage
inside ONE string — the class THE REMEDIATION WAS CREATING: bladder/testis
edits added the pairs with no check behind them, repair-introduces-risk =
Paly-shadowing shape). Tolerance = the design care: ~92 from 91.8 passes
(tol 1.0), decimals 0.15, ranges match both endpoints vs their fractions
(Allory 78/111 + 283/357 vs 70–79%). Condition (7): fires synthetic, passes
all 4 remediation-created real pairs. EVIDENCE: 44 strings, 1 flag = pancreas
SMAD4 '~50% vs 25/84=29.8' HUMAN-READ PASS (fraction = deliberate DELETION
COMPONENT of the derived ~50%, prose says so) → COMPONENT-FRACTION residual
FP class. ZERO real mismatches incl. every pair this pass's edits created.
Two-year-range sibling census: exactly 1 = thyroid anaplastic (the deliberate
case) ✓. WELL DRY (user): last source-free class; battery = share_sum +
duplicate_figure + fraction_check, all (7)-self-testing, run-after-edit;
read budget = only lever. GATE SLIP CAUGHT + HABIT FIXED: /tmp purged
node_modules overnight → regress CRASHED in the commit chain and my
grep-for-FAIL read the empty output as pass — a zero that couldn't fire,
condition-(7) shape in my own gate. Commit retroactively validated green
(167/2 after reinstall). STANDING HABIT: regression gates check for the DONE
line present, never absence-of-FAIL; missing DONE = failure. Scratch
/tmp/atlas-verify data survived; puppeteer-core reinstalled.

## DONE-line sweep + condition (7-bis) (2026-09-05, SHIPPED a887c93 = origin/main)
Gate failure recorded as QUALITATIVELY DIFFERENT (the gate itself, not a
domain check). RECOVERABILITY PROPERTY written down: a vacuous gate on an
intermediate commit is harmless if HEAD verifies green under a trustworthy
run — only HEAD ships, one green run = whole remedy, no archaeology.
CONDITION (7-bis) OPERATIONAL COROLLARY: the REPORT of zero must be shown to
have been produced at all — every tool ends with a mandatory DONE line, LAST,
AFTER every write; consumers require it; absence-of-FAIL never a pass. SWEEP
across all 6 tools: regress.js already had '==== DONE:'; the 5 detectors
didn't all (share_sum had NONE — mid-loop crash = short clean list;
crosscheck + polarity printed summaries BEFORE their json writes). All 5 now
DONE-terminated w/ counts. Verification = full-battery re-run, all consistent:
share_sum 14/1, duplicate 1645/4, fraction 44/1, polarity 188, crosscheck
141/3. IRONY recorded: a battery of self-testing instruments that could all
have been reporting nothing while appearing clean. FRACTION NEGATIVE closed:
zero real mismatches = the remediation introduced none (the prompting risk),
guarded forward. READ QUEUE = ONLY LEVER (user, standing): skin 5-clause +
StatPearls rows, PathologyOutlines quotes, 9 orphans source-or-remove, ovary
alt canonical, Nosho + van der Kaaij clauses, annotation 2nd sample
(unread-coverage search), facts (51), ccf 201-clause queue, GENIE portal,
thyroid re-source, kidneys/breast colour re-access.

## (7-bis) mechanized (2026-09-05, SHIPPED acd8bd1 = origin/main)
User: the consumption rule was a HABIT not a MECHANISM — a rule that depends
on remembering to apply it is what failed the first time. .claude/
run_checked.sh: runs tool, REQUIRES its DONE marker, exits non-zero if absent
(vacuous run fails the invocation itself). Six call sites, one wrapper,
invocation forms in its header. Condition-(7) 3-arm selftest at birth:
rejects exit-0-without-marker (verified live: exit 3), accepts
marker-printing, propagates non-zero (verified live: crashed regress → exit 1
through wrapper). Full battery + regression wrapped-green; original failure
replayed through the mechanism now FAILS the invocation. Structural check not
standing note — the project's own preference applied to its newest rule.
STANDING INVOCATION FORM from now on: all six tools via run_checked.sh.
READ QUEUE = the only lever (user, final): skin 5-clause + StatPearls rows,
PathologyOutlines quotes, 9 orphans, ovary alt canonical, Nosho + van der
Kaaij clauses, annotation 2nd sample (unread-coverage search), facts (51),
ccf 201-clause queue, GENIE, thyroid re-source, kidneys/breast colour
re-access.

## Final queue order + M1a batch 2 (2026-09-05, SHIPPED 30f1035 = origin/main)
USER FINAL RULING (handoff: 'from here the finds come from reading, which is
yours'): (1) nine orphan shares FIRST (same class as ccf ten, cheapest triage
— exists-decision costs nothing), (2) annotation 2nd sample SECOND on info
value (if v2 confirms, EVERY-block reads change method), (3) rest long-tail.
BATCH 2 RESULTS: ORPHANS — all 9 pass exists-decision; KIDNEYS RESOLVED (Li &
Kaelin, Hematol Oncol Clin N Am 2011, PMC3161447: '~75%/15%/5% + oncocytomas
5%' ONE sentence one denominator; figures moved 75-80→75; family COHERENT
95.0); LIVER pending-reachable (75-85/10-15 = GLOBOCAN phrasing, CA Cancer J
Clin unreachable ALL routes — no PMC, Wiley 403, not EPMC; McGlynn 2021
PMC7577946 verified partial '~75% of the total' HCC-only); BREAST pending-
reachable (no in-budget source states the 4 intrinsic ranges; StatPearls RCC
+ PDQ renal both lacked kidney figures too — living tertiaries thin on
proportions). DEMOTED CLAUSES BOTH RESOLVED (double-duty as annotation
sample): Nosho → 18516290 abstract VERBATIM incl. scope descriptor ('91 (15%)
of 590 population-based') — colon PIK3CA string FULL + ambiguous record
backfilled; van der Kaaij → 32277764 Eur J Cancer 2020 abstract VERBATIM
('55% intestinal and 44% diffuse') — stomach gint+gdiff FULL (gmix clause B
cross-series ranges still open); Dutch clause was abstract-verifiable all
along despite paywall note. ANNOTATION SAMPLE 2 (n=2, the unread-coverage
search): both CLEAN → v2 structural claim stands (unread items existed) but
content keeps verifying — cumulative 6/6 figures + 2/2 unread clauses clean
under headers, only confirmed defect = Paly scope; method unchanged pending
larger n (scope-first everywhere; annotations trusted for nothing, feared for
nothing). Battery wrapped-green post-edit; regress 167/2 wrapped exit 0.
NEXT READS: liver+breast reachable-canonical retry, skin 5-clause,
PathologyOutlines quotes, ovary alt canonical (Peres paywalled), gmix clause
B, facts (51), ccf 201-clause queue, GENIE, thyroid re-source, kidneys/breast
colour re-access.

## Access-note sweep + liver split (2026-09-05, SHIPPED 0a502a8 = origin/main)
PATTERN COMPLETED (user): process annotations wrong in BOTH directions —
over-claiming coverage (EVERY-blocks) AND over-claiming inaccessibility (van
der Kaaij: true-of-full-text 'paywalled' note suppressed an abstract-
verifiable clause for the project's life); same mechanism = scope-imprecise
summary of what was done; the direction conclusion governs annotations too.
SWEEP (5 access notes): 1 confirmed suppression (vdK, resolved); 2 EXEMPLARS
spot-checked VERIFIED — Foulkes = the class-preventing form (states what was
checked/contained/blocked; confirmed zero percents in abstract) + Curtin 81%
present as 'Eighty-one percent' (verbatim-normalised; READ-METHOD CAVEAT:
numeral-only percent grep misses NEJM spelled-out percentages); 1 colour-
class; 1 false hit. Verdict 1/3 figure-bearing notes = genuine suppression.
LIVER SPLIT (user: one-source rule protects a coherence claim liver doesn't
make — GAP human-passed as non-exhaustive): HCC row → '~75% of primary liver
cancers (McGlynn et al., Hepatology, 2021)' full-text-verified; iCCA stays
orphaned-pending; GAP example synced 92.5→87.5 same verdict. LIVER BLOCKAGE
RESTATED: GLOBOCAN = BLOCKED TO TOOLING, HUMAN BROWSER ROUTE UNATTEMPTED
(Wiley 403 ≠ paywall; free at publisher; don't harden tooling limits into
source properties — the starting error class). Battery wrapped-green; regress
167/2 wrapped. ORPHAN LEDGER: kidneys ✓ + liver-HCC ✓ = 4 of 9 sourced;
pending = liver-iCCA + breast×4 (+ ovary×4 sibling class). NEXT READS: skin
5-clause, PathologyOutlines quotes, breast/iCCA/ovary canonical retries
(human-route candidates flagged), gmix clause B, facts, ccf queue, GENIE.

## figure_search + Livasy recovery (2026-09-05, SHIPPED 7cff86c = origin/main)
CONDITION (7) → READ METHODS (Curtin = first non-tool instance: numeral-only
grep reported zero on an abstract with FOUR spelled percentages). RULE: a
search returning nothing must be shown capable of returning something in that
document — zero quantitative tokens in a quantitative abstract indicts the
PATTERN. INSTRUMENT .claude/figure_search.py: three forms (numerals, spelled
cardinals, worded fractions — the last persists longest) + has_any_figure
capability check; (7) selftest + 7-bis DONE. RE-CHECK of possibly-blind
pendings (before the long tail, per ruling): LIVASY RECOVERED — fractions
WERE in the abstract ('geographic necrosis (17/23), a pushing border of
invasion (14/23), stromal lymphocytic response (13/23)'); earlier body-bound
claim = read-method error (keyword windows used atlas phrase forms, sampled
past the sentence) — the van der Kaaij shape caught before hardening; now
VERIFIED-QUOTED AT ABSTRACT in full; wording note flagged (atlas 'pushing
margin' vs abstract 'pushing border' — full-text presumably; flagged not
failed). Brenner + Guichard = genuinely non-quantitative abstracts
(capability False) — pendings stand on instrument-backed bases; Peres shares
body-bound confirmed. Katyal/Hahn/Allory = scope-class pendings (not
figure-blind). NET: 1 recovery, 3 assumed→instrument-verified, 0 verdicts on
numeral-only zeros. Regress 167/2 wrapped. NEXT: skin 5-clause,
PathologyOutlines quotes, breast/iCCA/ovary canonical retries (human-route
flagged), gmix clause B, facts, ccf queue, GENIE.

## PHASE 2 ROADMAP + re-scope + phrase-hole closed (2026-09-05, SHIPPED cc0ac26 = origin/main)
ROADMAP (user-authored, DECISIONS TAKEN): breadth → ~120 cancers (NCI A–Z);
content PULLED (NCI PDQ / SEER / ClinicalTrials.gov v2 API — /api/v2/studies,
free / WHO taxonomy hand-mapped) NOT hand-transcribed — every defect class
found was a COPY error, remove the copy remove the class; tumour visual pass
FIRST. Atlas's voice = the hand-written mechanism prose ("what makes it
tick") — no API supplies it; verification discipline CONCENTRATES there.
SEQUENCING: re-scope (DONE) → A → B → C∥D.
- RE-SCOPE EXECUTED SAME DAY: MIGRATING = 55 share clauses (~19 unread
  RETIRED incl. ALL remaining orphan hunts: breast×4, iCCA, ovary×4, gmix-B,
  skin 5-clause + rows); NOT-MIGRATING = 156 ccf clauses + histology +
  anatomy + mechanism prose (~127 unread = concentrated budget; six-state +
  scope-first + number-anchored searches); KNOWN-DEFECTIVE = fix immediately
  regardless (bucket EMPTY today); uncited-unrefuted migrating figures ride.
- PHASE A (first): BEHAVIOURALLY correct not anatomically (no canonical
  tumour shapes); 4 cited properties: site (pos3d ✓), margin (sharpness/
  spikeCount), growth pattern (exophytic/infiltrative/diffuse — needs NEW
  expression; diffuse = organ-wall property not blob, DESIGN FIRST),
  stage-size (radius ← SEER Summary Stage). PREMISE VERIFIED:
  organicSpiculate(geo,{amplitude,freq,seed,spikeCount,spikeLength,
  sharpness}) viewer.js:223, seed-driven main.js:497 — re-point knobs, not
  new renderer. Gates: lesion-vs-shadow INVERTED, regress, P3 framing.
  PRE-REGISTERED NEGATIVE: no distinctive behaviour → generic mass + honest
  label. New small citation class (4 props × cancers) sourced under NEW model.
- PHASE B: build-time (statistics — frozen/auditable/detector-checkable) vs
  runtime (trials — weekly churn); provenance schema redesign (field ←
  endpoint ← retrieval date ← discipline); conditions (1)-(8) + run_checked
  govern integrations from birth.
- PHASE C: each new organ = licence-playbook asset hunt (expensive; expect
  documented negatives); BLOOD CANCERS (~10% incidence) break organ-click
  navigation — second navigation model = design decision BEFORE it forces.
- PHASE D: SEER Summary Stage NOT AJCC (copyrighted — describe+link, never
  reproduce); TRIALS duty of care: eligibility not conveyable, no
  endorsement/promise-ranking (neutral stated order), THE HANDOFF IS THE
  POINT (reader → oncologist w/ informed questions, said on page); framing
  designed BEFORE integration.
- DETECTOR SURVIVAL: fraction/share_sum/duplicate = rendered-output, persist
  + matter MORE under pulls; crosscheck/polarity shrink to hand-written
  residue.
PHRASE-HOLE CLOSED: Livasy mechanism SEPARATED (phrase-form blindness — atlas
wording ≠ source wording; figure_search closed number-form, a different
hole). METHOD INVERSION adopted: ANCHOR ON THE NUMBER (tiny form space),
find-figure-first-read-sentence; capability port: phrase-zero → test
distinctive terms (none=wrong doc, some=wrong phrase→read). BOUND: false
negatives only ⇒ verified-quoted safe; negatives re-passed (Foulkes full-
instrument confirmed non-quantitative) ⇒ ZERO verdicts on phrase-form
assumptions. NEXT = PHASE A design (growth-pattern expression + parameter
mapping + citation class), with the ~127-clause ccf read continuing at
reading pace alongside.

## Watchlist + growth-pattern narrowing (2026-09-05, SHIPPED be917e0 = origin/main)
UNCITED-MIGRATING WATCHLIST (user: ride-until-pull had no expiry; conditional
status w/o review trigger silently becomes unconditional = the annotation
failure shape): TEN no-source on-screen figures (breast ×4 subtype shares,
ovary ×4 shares, liver-iCCA, gmix clause B) → manifest
_uncited_migrating_watchlist, EXPIRY 2026-10-17; if Phase B not landed by
then, each REVERTS to source-or-remove on its own merits; early exits =
sourced/removed/replaced-by-pull. GROWTH PATTERNS NARROWED (user: render the
CONSEQUENCE not the pattern): diffuse → thickened rigid organ WALL (the one
new expression); exophytic → placement/orientation into lumen (have it);
infiltrative → soft margin falloff (material can); multifocal → several small
masses (site maps already). 3/4 fall out of existing machinery; per-cancer
question = WHICH consequence; pre-registered negative covers non-mappers.
NEXT: Phase A design = parameter mapping doc + the wall-property expression
for diffuse + the 4-property citation class (sourced under NEW model);
ccf 127-clause read alongside. WATCH THE DATE: 2026-10-17 watchlist expiry.

## Classification-fact exception (2026-09-05, SHIPPED b6abb19 = origin/main)
Resolves Phase A's Phase-B dependency (user, 'the last structural thing'):
the 4 tumour-behaviour properties are CLASSIFICATION FACTS not statistics
(WHO/PDQ pathology; not revised like incidence — infiltrative reads the same
in 2030) → PERMANENT exception to the content-model shift, NOT migration
debt. Phase A HAND-CITES NOW at the existing standard (~64 items = 4 props ×
16 cancers), nothing to migrate. REFINED CONTENT RULE: PULL statistics (the
revisable numbers); HAND-CITE stable classification facts + mechanism prose;
living tertiaries still Phase-3-treated. BOARD: clean; date on calendar
(watchlist 2026-10-17); queue = two tracks — Phase A design (mapping doc +
diffuse wall property + the now-unblocked 64-item citation class) and the
ccf 127-clause read.

## Session close (2026-09-05, user's own arc summary — preserved verbatim in spirit)
Opened on a screenshot ('look more like this'); closed the visual roadmap
entirely; then found — by accident, inside its last item — that the central
claim rested on a mostly-unverifiable citation record. That reshaped
everything: 7 attribution errors, 3 read-method defects, 6 self-testing
instruments, and a content model that removes the copy-error class rather
than catching instances. THE THROUGH-LINE (user): every real find came from
an instrument being made capable of DISAGREEING WITH ITS AUTHOR — the wrong
fixture on the polarity guard's first run, the wrong truth table that killed
the +1 offset, the capability check that recovered Livasy, the wrapper that
fails an invocation rather than trusting a silence. Same move at four scales.
Session ended clean: Phase A self-contained, ccf read owns the verification
budget, watchlist 2026-10-17 = the one undeferrable date.

## PHASE A OPENED (2026-09-05, SHIPPED 24a3ade = origin/main)
EPISTEMIC SPLIT recorded (user, the roadmap's one gap): THE CATEGORY IS
CITED; THE MAGNITUDE IS NOT — 'spiculated margin' is citable, sharpness:11 is
design; two halves per property, magnitudes disclosed illustrative (Tier-3
amplitude-vs-structure applied to geometry; failing it = scope drift in
mesh); UI provenance will say morphology is illustrative of cited behaviour.
COLD-SESSION ENTRY POINTER: 'read CLAUDE.md, then Phase A of the roadmap;
conditions (1)–(8) are binding' — the whole prompt. MAPPING DOC
.claude/phaseA_mapping.md: 4 properties two-halved, consequence mapping,
knobs verified (organicSpiculate viewer.js:223, radius main.js:497), inverted
lesion-vs-shadow gate, pre-registered negative, 4-cancer calibration batch
(stomach-diffuse / pancreas-infiltrative / breast-spiculated / kidney-
circumscribed). CALIBRATION 2/4 READ: STOMACH diffuse→wall category CITED
VERBATIM (PDQ Gastric HP 2025-02-21: 'infiltration of the gastric wall (i.e.,
linitis plastica)') — the one new rendering expression has its citation
first; PANCREAS = CALIBRATION LESSON #1: PDQ TREATMENT pages carry no
gross-pathology descriptors — growth-pattern/margin categories live in
PathologyOutlines/WHO + radiology vocabularies (BI-RADS); per-property source
classes corrected in _phaseA_citations. NEXT: pancreas/breast/kidney reads
under corrected classes → remaining 12 cancers → magnitude design + diffuse
wall-property build; ccf 127-clause read continues alongside; WATCHLIST
2026-10-17.

## Register decision + source mitigations (2026-09-05, SHIPPED 5b20378 = origin/main)
REGISTER DECIDED (before the 64 citations accumulate; user posed, I ruled w/
recorded reasoning): THE ATLAS'S TUMOUR = GROSS-SPECIMEN CONSTRUCT (the scene
reads as organ-as-physical-object: scan meshes in gross register, gross-cited
colours, masses in 3D, no imaging framing) → vocabulary of record = GROSS
PATHOLOGY (WHO / PathologyOutlines gross: firm, gritty, stellate); RADIOLOGIC
lexicons (BI-RADS spiculated etc.) = related NOT interchangeable (imaging
spiculation ≠ stellate cut surface; substitution = the TNBC-for-basal-like
shape) → admissible ONLY as DISCLOSED cross-register items (register named,
imaging↔gross correlate stated). Mesh/colour straddle REGULARISED as a
disclosed decision. Breast calibration read re-pointed: gross first, BI-RADS
disclosed fallback. PATHOLOGYOUTLINES = NO-DISCRETION Phase-3 at adoption
(the never-at-source-quote class: prostate 'Tan to pink'): verbatim quote +
exact page + retrieval date + archived text, always. PDQ LESSON LOGGED
AGAINST PHASE B: purpose-shaped coverage (treatment summaries — rich
management, thin gross pathology); 'the backbone' is PARTIAL — verify
per-field coverage at integration design. NEXT: calibration reads 3-4
(pancreas via PathologyOutlines, breast gross-first, kidney pseudocapsule) →
12 more cancers → magnitude design + diffuse wall build; ccf 127-clause read
alongside; WATCHLIST 2026-10-17.

## Stage-extent split + idiom rule (2026-09-05, SHIPPED 0275c77 = origin/main)
PROPERTY #4 SPLIT (user): stage-size conflated EXTENT (SEER Summary Stage —
in situ/localised/regional/distant, public domain, NO size) with SIZE
(T-category = AJCC licensed compilation; individual thresholds citable where
free sources state them, compilation not renderable). EXTENT ADOPTED (the
consequence-reframe again; routes around the set's one licensing question):
containment / capsule breach / satellite deposits teach what stage MEANS;
radius keeps only extent-correlated ORDERING, no cited cm anywhere. Division
of labour: Explore tumour = LOCAL extent; DISTANT = the site map's screen.
IDIOM-COLLISION RULE (checked vs code, not assumed): site map = separate
organ-less accent-schematic screen by its own declaration (main.js:536 'four
abstract blobs POSITIONED TO ENCODE A SPREAD PATTERN, not objects') →
multifocal primary foci ONLY gross-tissue register on the organ; site blobs
ONLY accent-schematic organ-less; captions name the concept ('independent
primary foci' vs 'sites of involvement'); future single-screen convergence =
explicit design decision. Property set now: site / margin (gross register) /
growth-pattern consequence / stage-extent — all four freely sourceable, all
two-halved (category cited, magnitude illustrative). NEXT: calibration 3-4
reads → 12 cancers → magnitude design + wall/breach/falloff expressions
(shared design space); ccf 127-clause read; WATCHLIST 2026-10-17.

## Expression decomposition (2026-09-05, SHIPPED 24fa70d = origin/main)
THREE PROBLEMS NOT ONE DESIGN SPACE (user, decomposed by what each needs to
know about the organ): (1) INFILTRATIVE FALLOFF = tumour-local (mass's own
margin; organ uninvolved) — cheapest, BUILD FIRST; (2) DIFFUSE WALL =
organ-local (NO mass; the expression IS the wall) — PROVENANCE RULE at full
weight (verified: stomach.glb = cited Sketchfab asset 'Realistic Stomach' by
Brain Diagno): NEVER deform a provenance-tracked organ mesh — material
treatment or separate shell over the unmodified asset (pancreas -kn
discipline applied to rendering); (3) EXTENT BREACH = the only RELATIONAL one
— CHEAP VERSION FIRST (premise verified: organs opaque, no transparent:true
— transmission null result): straddle placement + depth-buffer occlusion
(inside occluded, outside visible = the read, free); expensive surface-
deformation version deferred (also collides w/ provenance rule). BUILD ORDER:
falloff → breach-cheap → wall-shell. NEXT: calibration 3-4 reads → 12 cancers
→ magnitude design + the three expressions in order; ccf 127-clause read;
WATCHLIST 2026-10-17.

## Assignment unit decided (2026-09-05, SHIPPED 342a88a = origin/main)
USER POSED per-cancer vs per-subtype; RULED (choice was mine): HYBRID anchored
to the atlas's EXISTING unit — morphology attaches to the ACTIVE CANCER-LIST
ENTRY (16 entries, already subtype-level where morphology diverges: TNBC,
diffuse-type gastric, ccRCC, seminoma, HGSOC+OCCC, PTC+FTC). Population stays
4×16=64; ONE tumour per entry (no renderer change); per-subtype rendering
only via explicit entry split. MANDATORY QUALIFIER on every category claim
('characteristically/predominantly' + a source that SAYS so — unqualified
predominant-as-THE-pattern = the 11/12 generalisation drift built into
schema, prohibited). DIVERGENCE THRESHOLD (stated, not taste): within-entry
subtype ≥10% share (atlas's own cited figures) w/ categorically OPPOSED
morphology ⇒ named divergence or the pre-registered negative; test case =
colorectal 'adenocarcinoma' (>90% entry spanning NST/mucinous/signet).
IMMEDIATE YIELD: breast calibration case was MIS-UNIT'ED — rendered entry =
TNBC/basal-like, margin = characteristically PUSHING, citation ALREADY
VERIFIED in-atlas (Livasy 14/23); spiculated NST = not rendered by any active
entry, kept as the counter-example. NEXT: calibration 3-4 (pancreas
PathologyOutlines; kidney pseudocapsule; breast now = Livasy-backed pushing,
effectively done) → 12 entries → falloff→breach→wall-shell build; ccf
127-clause read; WATCHLIST 2026-10-17.

## Threshold dependency + calibration close (2026-09-05, SHIPPED 43ad69b = origin/main)
THRESHOLD-PREMISE DEPENDENCY recorded (user): the ≥10% split threshold keys
to the atlas's cited subtype shares = MIGRATING figures — record share value
+ source per determination; boundary entries (colorectal; mucinous ~10-15%
source-dependent) RE-TEST when the pull lands (watchlist shape, closed at
rule-creation). CALIBRATION AT CLOSE: 2/4 landed — stomach diffuse→wall (PDQ
verbatim) + BREAST completed BY the unit decision (TNBC pushing margin,
Livasy 14/23 already verified in-atlas, no new read). PANCREAS + KIDNEY gross
reads BLOCKED-TO-TOOLING: PathologyOutlines 429 Retry-After 86400 → RETRY
AFTER 2026-09-06; archive route unreachable from this tooling (precise
status, not 'unavailable'). LESSON #1 EXTENDED: StatPearls clinical chapters
also carry NO gross descriptions — reachable clinical tertiaries are
management-shaped; PathologyOutlines = THE gross-pathology tertiary of record
(no-discretion Phase-3 when it answers). USER RULE-OF-THUMB recorded:
corrections/rulings on live work go as plain text; prompts only for COLD
sessions — Phase A's cold entry = mapping doc + CLAUDE.md. NEXT: pancreas +
kidney PathologyOutlines reads AFTER 2026-09-06 → 12 entries → falloff→
breach→wall-shell build; ccf 127-clause read; WATCHLIST 2026-10-17.

## In-atlas harvest + hierarchy re-designation (2026-09-05, SHIPPED e45e8ee = origin/main)
HARVEST (user: check how many of the 64 already exist in-atlas — Livasy
unlikely unique; ran while PathologyOutlines cools): TESTIS margin DONE
('well-circumscribed solid intratesticular nodule' PMC6906820 cited in-atlas);
PROSTATE multifocal DONE (Fontugne 59.7% + Mehra 21/30 + Cooper — best-cited
morphology fact in the atlas); STOMACH diffuse-wall DONE in-atlas (:234/:258
cited — the PDQ read corroborates not sources); BREAST margin DONE (:204
'pushing and circumscribed rather than infiltrative', cited); GBM growth DONE
(diffusely infiltrative + cited Infiltrative-margin region). Bladder growth +
thyroid-FTC margin SEEDED. External margin/growth population: ~32 → LOW
TWENTIES; 4 entries wholly/half retired pre-fetch. HIERARCHY RE-DESIGNATED
(user, the GLOBOCAN distinction): 'gross tertiary of record' was a
REACHABILITY ARTIFACT — AUTHORITY = WHO Classification of Tumours;
PathologyOutlines = reachable practitioner SUMMARY-OF-AUTHORITY
(no-discretion Phase-3). Hierarchy: in-atlas verified quotes > WHO
(human-route or stated-by-reachable-source w/ WHO named) > PathologyOutlines.
RATE-LIMIT MEASUREMENT PLAN: no probing in Retry-After window; at window
(after 2026-09-06): 1 fetch + headers + 1 paced second → per-burst (pace) vs
daily-cap (re-source). NEXT: measure limit after 09-06 → pancreas/kidney +
low-twenties external reads under hierarchy → 12-entry completion →
falloff→breach→wall-shell build; ccf 127-clause read; WATCHLIST 2026-10-17.

## Assertion-index requirement (2026-09-05, SHIPPED 80e4e03 + 1e97ec5 = origin/main)
TWICE-EARNED IN ONE DAY (user): the manifest indexes citations by SOURCE not
by what they ESTABLISH — coverage questions run as greps and get rediscovered
(van der Kaaij's clause; the harvest's 5 fully-cited morphology categories, 1
w/ PMC id). PHASE-B PROVENANCE REDESIGN now requires the ASSERTION INDEX:
record what each citation asserts — SUBJECT, PROPERTY, CLAIM — alongside
where it came from; future passes QUERY instead of sweep, answers complete
rather than as-good-as-the-grep. Payoff demonstrated pre-build: harvest
retired a third of margin/growth + shrank the rate-limit question 62→low-20s
before the constraint was measured. (Recorded in both manifest
_assertion_index_requirement and the Phase-B roadmap bullet.)

## record_sync_check (2026-09-05, SHIPPED d9fad37 = origin/main — session close)
Born from the split commit (assertion-index landed manifest-only; caught by
noticing, not checking). 'Record in both homes' = two-step w/o atomicity →
.claude/record_sync_check.py verifies it: 9 declared dual-home pairs
(manifest key ↔ target file ↔ marker), fires on HALF-LANDED in either
direction, cannot verify content (stated). DISCIPLINE: new dual-home record
adds its pair in the same commit (undeclared = invisible; map staleness noted
honestly). Condition (7) 3-arm selftest + 7-bis DONE + non-zero exit on fire
(wrapper-gated commits). Birth run: 9 pairs, 0 half-landed. STANDING BATTERY
NOW: regress, crosscheck, polarity, share_sum, duplicate_figure, fraction,
figure_search, record_sync — all (7)-self-testing, all DONE-terminated, all
run via run_checked.sh. Session closed by user: 'Nothing is waiting on me.'
NEXT SESSION ENTRY: read CLAUDE.md then Phase A of the roadmap; conditions
(1)–(8) binding. Immediate work: measure PathologyOutlines limit (after
2026-09-06) → low-20s external morphology reads under the WHO-first
hierarchy → 12-entry completion → falloff→breach→wall-shell build; ccf
127-clause read owns the verification budget; WATCHLIST 2026-10-17.

## ccf-read addendum recorded (2026-09-05, SHIPPED c88e809 + 7e96fa2 = origin/main)
USER-AUTHORED ADDENDUM (sent as-is; manifest _ccf_read_addendum + CLAUDE.md,
sync pair added): the ~127 clauses = mechanism prose, no number to anchor on.
ANCHOR = NAMED ENTITY (PIK3CA as unparaphrasable as 17/23): extract entities
→ find in source → read the RELATIONSHIP; capability check ports unmodified
(entity absent = wrong doc; entity present + relationship absent = THE
FINDING). Drift direction holds, qualifier class = EPISTEMIC (how confidently
shown): associated-with→causes; hedges; suggests→shows; in-vitro/mouse→∅ (THE
ONE TO WATCH HARDEST — a patient assumes human evidence); cohort→∅;
proposed→established. NEW STATE: VERIFIED-CLAIM, CERTAINTY-DRIFT (mechanism
real+cited, assertion stronger than source; copy edit restores the qualifier
in the source's own wording). verified-derived N/A. RATE deliberately NOT
pre-registered (numeric 20-23% has nothing behind it for prose; plausibly
higher — hedge-dropping doesn't feel like an error); batch 1 establishes,
pre-registers before batch 2. GATES unchanged + review-based mechanism claims
recorded as such (secondary-source rule governs). SYNC-CHECK STALENESS CAVEAT
FIRED DAY ONE: c88e809's pair edit failed on whitespace, commit shipped
claiming 10 pairs while the tool printed 9 — an undeclared pair is invisible
by design; caught by reading output vs claim; corrected 7e96fa2 (10 pairs
green). NEXT: ccf batch 1 (entity-anchored, no prior, establish the rate).

## ccf batch 1a (2026-09-05, SHIPPED f5bfd91 = origin/main)
FIRST ENTITY-ANCHORED READS (5 notes ≈ 9 sub-claims, no prior): THE ADDENDUM'S
HARDEST-WATCH CLASS FIRED ON READ #1 — skin TERT 'reactivates telomerase' vs
Huang abstract 'in reporter assays, the mutations increased transcriptional
activity' (in-vitro dropped + strength upgraded) = VERIFIED-CLAIM,
CERTAINTY-DRIFT; quote req satisfied; COPY EDIT APPLIED ('shown in reporter
assays to increase TERT promoter activity (Huang et al., 2013)').
VERIFIED-CLAIM ×3: ETS-motif relationship (verbatim-equivalent); RHOA subtype
linkage; RHOA↔CLDN18-ARHGAP mutual exclusivity RESOLVED AT FULL TEXT
(PMC4170219 OA: 'mutually exclusive... 62%, P=10⁻³', scope carried).
PENDING-FULL-TEXT ×3: Gerlinger every-region-VHL (entity ABSENT from
abstract; cohort qualifier honestly present in-atlas); Huang C228T/C250T
exclusivity; UV dipyrimidine quote. RESTS-ON-REVIEW/TEXTBOOK ×3 (provenance
class not defects): RHOA-GTPase background; PIK3CA-activates-PI3K;
TMPRSS2-ERG fusion mechanism UNCITED-FOUNDATIONAL (cheap add: Tomlins 2005).
METHOD OBS: mechanism relationships live in FULL TEXT >> abstracts (OA fetch
= standard equipment); rests-on class common (3/5 notes); observed drift 1/~9
— too small to pre-register, completed batch 1 establishes the rate. Battery
+ regress green wrapped. NEXT: complete batch 1 (~15-20 more sub-claims) →
establish + pre-register rate → batch 2; PathologyOutlines limit after
09-06; WATCHLIST 2026-10-17.

## Rests-on census + DONE-quote practice (2026-09-05, SHIPPED 4d19052 = origin/main)
CENSUS (user-directed, before further reading): 98 mechanism sentences in
notes — 43 CITED / 55 UNCITED; 22-sample read: ~75% FOUNDATIONAL (one
canonical apiece — PTEN/PI3K, APC/β-catenin, RHOA GTPase, SPOP, TGFBR2,
SWI/SNF), ~20% ATLAS-VOICE (no citation needed; thyroid:261 GENIE honesty
note = exemplary), ~5% synthesis. GOOD OUTCOME: remedy = BULK CITATION-ADD
(~40 sentences → ~15-25 canonicals w/ pathway-level sharing); foundational
mechanisms = classification-stable ⇒ the exception applies (hand-cite-and-
done, never migration). READ BUDGET SPLITS 3 WAYS: drift reads → the 43
CITED sentences (+ ccf claims); bulk add → foundational set (verification AT
sourcing); atlas-voice → neither. Serious alternative did NOT materialise.
DONE-QUOTE PRACTICE (user, the 9-vs-10 sub-shape: paraphrase of tool output
undiffed against output): commit messages PASTE the DONE line verbatim — a
quote can't drift; the quote requirement turned inward; practiced in 4d19052
itself. NEXT: complete ccf batch 1 on the CITED-sentence population →
pre-register rate → batch 2; bulk citation-add as its own pass
(exception-class, schedulable); PathologyOutlines limit after 09-06;
WATCHLIST 2026-10-17.

## Outage + three-layer gate chain + ninth instrument (2026-09-05, SHIPPED 03ef214 + 3a74d1e = origin/main 3a74d1e)
PRODUCTION OUTAGE (closed): 4b2c8c5 shipped a SyntaxError live — three ASCII
apostrophes inside single-quoted note strings ("atlas's", "TCGA's") terminated
the literals; whole app failed to initialise (femaleBodyGroup null, 0 hotspots).
Root cause of ESCAPE, not of the typo: run_checked.sh correctly returned exit 3,
but the shell variable holding the regression output was empty and I committed
and pushed anyway. THE MISSING HALF: "A VACUOUS GATE AT HEAD IS NOT HARMLESS,
BECAUSE HEAD IS WHAT SHIPS" (the _done_line_sweep recoverability property only
covered INTERMEDIATE commits). Fixed in 0a88296, recorded as a class in 3a65075.
THE CLASS (permanent while the content model keeps prose in code): every citation
edit writes English into single-quoted JS literals, so possessives, contractions
and quoted titles are a hazard ON THE EDIT PATH — and it was invisible to all
eight prior instruments because every one reads the file as TEXT, never as CODE.
THREE-LAYER CHAIN, all now mechanized: local green (run_checked.sh) → HEAD green
(commit_checked.sh, writes the DONE quote ITSELF so it can neither drift nor be
absent) → DEPLOYED green (deploy_check.js, NEW). Conditions now (1)-(8) + (7-bis)
+ (7-ter) THE COMMIT IS ALSO A GATE.
DEPLOY GATE (.claude/deploy_check.js, user-directed): PUBLISHED (hash-compare 27
text assets vs HEAD BLOBS not the working tree; catches pushed-but-not-published,
stale cache, propagation lag; names NOT PUSHED separately) + INITIALISES
(bodyGroups present, hotspots>0) + CLEAN (zero page errors beyond ONE declared
benign entry, the favicon 404). POST-PUSH by design. THE ECHO CORRELATION: Chrome
reports a failed request twice, and the console echo carries NO URL, so pattern-
matching it would swallow every 404 incl. a missing JS module — benign IFF every
HTTP>=400 response was itself declared benign. 9 arms; two exist because earlier
ones PASSED FOR THE WRONG REASON (blank-page arm exits at unreachable-module and
never touches the MISSING branches) → "AN ARM THAT FAILS FOR THE WRONG REASON IS
NOT A CAPABILITY CHECK FOR THE RIGHT ONE." Demonstrated live BOTH ways: unpushed
HEAD → NOT PUSHED + 4 NOT PUBLISHED with byte counts naming exactly the 4 edited
files; post-push → 27/27 byte-matched, 31 hotspots, 0 problems.
ABSENCE-CLAIM INSTRUMENT (.claude/absence_claim_check.py, ninth; user-directed):
THE RULE IN TWO WORDS = "exists" vs "found". Negation + EXISTENCE verb asserts a
fact about the world's literature on the strength of an unrecorded search =
condition (7) violation; negation + SEARCH verb or DATASET SCOPE is verifiable.
Mechanized because the atlas produced the bad form at a HIGHER rate than the good
(4 vs 3) and the corpus goes 16 → ~120 entries — fraction_check reasoning, the
population is CREATED BY THE EDITING. 6 sites remediated (ovary:213,
stomach:238 note, stomach:238+239 ccf, thyroid:261+263). THREE exemptions:
SOURCE-ATTESTED (quotation >=20 chars + citation; pancreas:208), SELF-EVIDENCING
(colon:210), REASON-GIVING (stomach:231).
TWO LESSONS WORTH MORE THAN THE TOOL: (a) condition (8) earned its keep on the
FIRST run IN BOTH DIRECTIONS — 7 sites where hand-reading found 5; one was a real
laundered defect, the other was CORRECT CONTENT IN AN UNRECOGNISED FORM, and
reading it produced the source-attested class. A first run finds defects the
reader missed AND exemptions the instrument missed; the second kind teaches the
taxonomy. (b) NEITHER GRANULARITY IS SAFE ALONE: fine clauses stop laundering,
but English spells a list comma and a clause comma alike, so a comma split SEVERS
negation from predicate ("No conflict with CDH1, RHOA, or the fusion IS
DOCUMENTED." → NONE, a false clean) and MY OWN REMEDIATION WALKED INTO IT ⇒ run
both granularities, take the WORSE verdict; over-flagging costs a read, and a
read is the cheap error.
liver:243 deliberately NOT in its output (that sentence IS scoped; its defect was
FACTUAL — Zhuang 2025 EXCLUDES lymph-node-metastasis patients by design). User:
"the third time a drift fix produced better copy than it replaced."
BATTERY INTEGRITY FINDING: citation_polarity.py had been UNRUNNABLE since
extraction v2 landed (expected r['refs'] list, v2 emits r['ref'] string; plus a
hardcoded /tmp scratch output dir). Same half-landed-change shape record_sync_
check.py exists for, one layer down. IT SURFACED ONLY BECAUSE run_checked.sh
REQUIRES THE DONE LINE — a dead instrument can't be mistaken for a clean one.
Fixed tolerantly (both schemas); now 408 records: 349 clean / 49 caveated-window
/ 10 corrective-window — 59 flags AWAITING A READING RULING, not defects.
Also untracked two stale committed .pyc files + gitignored __pycache__ (a
permanently dirty tree masks real changes in the `git status` several gates read).
crosscheck at full fidelity = 142 records / 3 flags on BOTH HEAD and tree (the
recorded "141" predates an extractor revision; no regression).
VERIFIED: regression baseline HELD at "==== DONE: 167 checks, 2 failures, 2 page
errors ====" wrapper exit 0 (2 failures = known gbm/acinar label-overlap pair;
2 page errors = pre-existing favicon 404). Battery = 10 instruments.
PROCESS NOTE ON MYSELF: I first read a backgrounded regression's DONE line found
by grep, with no wrapper exit code captured — the same shape as the outage. Caught
it, re-ran synchronously, captured exit 0. run_checked.sh prints its verdict to
STDERR AND ONLY ON FAILURE, so silence means success — which is exactly why the
exit code, not the log text, is the thing to capture.
NEXT: ruling on the 59 polarity flags; complete ccf batch 1 on the cited-mechanism
population → pre-register drift rate → batch 2; bulk citation-add ~38 foundational
mechanism sentences (~15-25 canonicals, classification-fact exception);
PathologyOutlines rate limit after 2026-09-06 then low-twenties WHO-first
morphology reads; Phase A category citations → falloff → breach → wall-shell;
GENIE portal reads; thyroid re-source; kidneys/breast colour re-access;
Tomlins 2005 for TMPRSS2-ERG; WATCHLIST 2026-10-17.

## 2026-09-05 (fifth segment) — the battery runner, crosscheck's refusal, and the 10 corrective-window reads

SHIPPED 58748d3 (main = origin/main; parent 3a74d1e). Three layers green in
order: local `DONE battery: phase pre-commit — 9/9 declared instruments ran and
reported (marker printed, exit 0), 10 declared in total, 22 .claude/ files all
declared, 408 citation records extracted, 0 problems`; commit made by
`commit_checked.sh` quoting ELEVEN DONE lines verbatim by machine; deployed
`DONE deploy_check: 27/27 assets byte-matched to HEAD 58748d3, 31 hotspots live,
0 unexplained page errors (2 declared-benign), 0 problems`.

USER RULING, four parts, all executed:

1. AN INSTRUMENT THAT ISN'T INVOKED CAN'T FAIL → `.claude/battery.py`, the fourth
guard layer. The chain is now battery (the SET) → run_checked.sh (each
INVOCATION) → commit_checked.sh (the COMMIT MESSAGE) → deploy_check.js (the
DEPLOY). Two assertions: every declared member of the phase RAN AND PRINTED ITS
OWN MARKER (delegated to run_checked.sh, so "was attempted" can't pass for
"reported"), and EVERY TRACKED FILE IN .claude/ IS DECLARED — as an instrument or
explicitly as a non-instrument WITH A REASON. The second assertion exists because
record_sync_check.py's caveat about its own map ("an undeclared pair is invisible
to this check, and the map is itself a record that can go stale") is quoted
verbatim there and applies to a declared instrument list with equal force: this
tool's own failure mode, one level up. It could be CLOSED here and not there
because the population is one directory and can be enumerated; sync's population
is "load-bearing records" and cannot be. Cross-reference added in both files.
Phases exist because deploy_check can't run pre-commit; a third assertion falls
out (an instrument in a typo'd phase would be silently retired). Preflight
regenerates the never-committed records artifact and starts nocache_server.py for
regress.js. 13 selftest arms.

2. DEGRADATION IS WORSE THAN DEATH — "A dead instrument announces itself. A
degraded one produces a plausible number." citation_crosscheck's `if len(sys.argv)
> 1 else []` silently dropped 32 records (110 not 142) under a normal-looking DONE
line. It now REFUSES: exit 2, no DONE line, so the wrapper fails the invocation
too. Flags artefact overridable and self-creating (polarity's second death shape).
BOTH refusal directions have selftest arms, because a refusal firing on a
legitimate invocation would make the instrument un-runnable — the exact hole the
battery closes.

3. THE 10 CORRECTIVE WINDOWS, read as a standalone batch. Result: 2 anti-citations
(Boutros 2015 prostate.js:139, real source Cooper CS 2015 PMID 25730763; Hu 2012
stomach.js:24, the class-defining case), 8 REAL SOURCE CLAIMS sitting beside a
rejection. THE INVERSE TRAP IS THE LARGER ONE and only reading found it: the
predicted hazard (a verifier scoring an anti-citation as a defect) is 2 of 10, but
a reader who TRUSTED the window verdict would skip 8 real source claims — Polkowski
1999 (provenance-load-bearing: its figures ARE the evidence for the rejection),
Derakhshan 2009 (refutation-load-bearing: M/F 1.07 vs 2.65 retires the folk claim),
Grimm 2018 + Mudie 2014 (25±18 mL, 35±7 mL, on screen and in use; the rejection is
of the folkloric "~50 mL"), Kim 2025 + Machlowska 2020 (cited AS papers attributing
the ≥50% signet-ring threshold to WHO), Jakob 2012 (the correction target itself,
already verified verbatim), Lauren 1965 (window bleed from two lines below). All 8
sit within ±3 lines of genuinely corrective text, so every WINDOW verdict is
correct AS A WINDOW VERDICT — the flag-then-read contract working as designed, not
a defect in it. Negated mentions are invisible to the extractor, CHECKED not
assumed (Colombino 2012 yields no record). NO CONTENT EDITS: all ten lines correct
as written; the verdict table is the output so the epi pass doesn't re-litigate.

4. THE 49 CAVEATED WINDOWS BECOME THE ccf READ ORDER, not a separate pass — the
guard has already spotted a hedge in the vicinity and the addendum's thesis is that
hedges are where certainty drift lives. 22 DISTINCT SITES, not 49 reads; four carry
26 (skin.js:400 ×10, colon.js:212 ×6, colon.js:210 ×5, prostate.js:219 ×5). No
snapshot committed, deliberately — regenerated by the battery, because a committed
list would rot the way the "36" and the "141" did. THE RATE MEASURED HERE IS NOT THE
CORPUS RATE: this is deliberate sampling on the dependent variable (the
displacement-read shape again), so the PRE-REGISTERED DRIFT RATE FOR BATCH 2 MUST BE
MEASURED ON AN UNORDERED SAMPLE.

CONDITION (7) ON REAL STATE, NOT FIXTURES: the pre-03ef214 citation_polarity.py was
restored into the tree and the battery reported `NO DONE LINE: citation_polarity —
ran without printing its marker (vacuous run; the 7-bis failure)` with 8/9; the
fixed file was then restored and verified byte-identical to HEAD in a SEPARATE tool
call. Assertion 2 also fired unprompted on its FIRST run, on battery.py itself
(declared, not yet staged) — the assertion was right and the DIAGNOSIS was wrong,
which is why the message now distinguishes NOT TRACKED (exists, unstaged, would not
ship) from DECLARED BUT ABSENT (stale declaration), with its own arm.

TWO SELF-CAUGHT DONE-LINE ERRORS OF THE SAME CLASS AS THE DEPLOY GATE'S: the
battery first said "ran and reported CLEAN", which is false on every green run
because regress.js exits 0 carrying two KNOWN label-overlap failures — now
"reported (marker printed, exit 0)". run_checked.sh's header enumerated "six call
sites" while ten instruments existed: a second hand-maintained instrument list
going stale beside the real one, deleted in favour of pointing at INSTRUMENTS.
NAMED UNCOVERED HOLE, left uncovered on purpose: a SILENTLY SHRINKING extractor —
a v3 emitting 300 records instead of 408 would pass, and a floor constant would go
stale on the next legitimate corpus growth. Visible in the DONE line, named in both
homes.

STALE NUMBERS CORRECTED IN PLACE: "36 polarity-flagged windows" → 59 live (10 + 49)
over 408 records; "3 of 141" → 3 of 142 on the re-run, the extra record an extractor
revision not a regression.

DUAL-HOME: `_battery_runner` and `_polarity_mention_reads` in citations.json (54
keys), their pairs in record_sync_check.py SYNC (13 → 15) in the SAME COMMIT, as
that map's own discipline requires. `DONE record_sync_check: 15 pairs checked, 0
half-landed`.

NEXT: ccf batch 1 over the cited-mechanism population IN CAVEATED-WINDOW-FIRST
ORDER (22 sites), drift rate for batch 2 pre-registered on an UNORDERED sample;
bulk citation-add ~38 foundational mechanism sentences (~15-25 canonicals,
classification-fact exception); PathologyOutlines rate limit after 2026-09-06 then
low-twenties WHO-first morphology reads (pancreas infiltrative, kidney
pseudocapsule); Phase A category citations → falloff → breach → wall-shell; GENIE
portal reads; thyroid re-source; kidneys/breast colour re-access; Tomlins 2005 for
TMPRSS2-ERG; WATCHLIST 2026-10-17.

## 2026-09-05 (sixth segment) — the ratchet, why the chain stops at four, and the number-drift rule

SHIPPED f8f98aa (main = origin/main; parent 58748d3). `DONE battery: phase
pre-commit — 9/9 declared instruments ran and reported (marker printed, exit 0),
10 declared in total, 23 .claude/ files all declared, 408 citation records
extracted (ratchet 408 held), 0 problems`; deployed `DONE deploy_check: 27/27
assets byte-matched to HEAD f8f98aa, 31 hotspots live, 0 unexplained page errors
(2 declared-benign), 0 problems`.

THE USER INVERTED THEIR OWN PREDICTION, and that is the durable part. The 10
corrective windows were ordered first on the grounds that each unread one was a
trap for the epi pass — which implies the hazard was READING THEM AS SOURCES. The
composition says the opposite: 2 anti-citations vs 8 real source claims, several
with figures live on screen, so the dominant risk was a reader TRUSTING THE WINDOW
VERDICT and skipping eight legitimate citations. The ruling was right and its
stated reason was inverted; the ordering earned its keep for a reason nobody
predicted. Generalisation worth carrying: READ THE BATCHES WHOSE HAZARD YOU THINK
YOU ALREADY KNOW. And the flag-then-human-read contract earned its design — the
error in EITHER direction would have come entirely from treating a window verdict
as a mention verdict, the distinction the guard PRESERVES RATHER THAN RESOLVES; a
guard that resolved it on regex evidence would have produced 8 wrong rulings while
looking more decisive.

ASSERTION 4, THE RATCHET (`.claude/battery.py`, state in
`.claude/record_count.json`). A FLOOR goes stale on legitimate growth; A RATCHET
DOES NOT — that was the whole error in leaving the gap open. Record the previous
count, fail on ANY decrease, let increases raise it automatically; a real reduction
takes `--lower-ratchet=N --lower-reason="…"`. A LOWER MOVES THE BAR, IT DOES NOT
SWITCH THE CHECK OFF: the lowered value is compared like any other, so lowering to
380 on a corpus of 300 still fires — no special case, so no escape hatch. ANY
decrease is material as a DEFINED threshold, not a hedge: extract_citations.py is
deterministic over the local corpus, so on an unchanged tree the count cannot move
at all; a tolerance would be a floor with extra steps.

- COMMITTED state, because an uncommitted ratchet resets on every fresh clone —
  a floor of zero wearing a ratchet's clothes.
- THE BOOTSTRAP IS EVIDENCE: assertion 2 fired `DECLARED BUT ABSENT` on
  record_count.json before it existed, and the battery refuses to run while its own
  selftest fails, so the tool could not create the file it writes. Seeded empty by
  hand once (recorded in the file's own note), counts absent so run 1 INITIALISED at
  408 and said it was calibration; run 2 held. Condition (8) satisfied by
  construction rather than by remembering.
- A CORRUPT state file is a problem, not a reset — re-initialising from an
  unparseable file would discard the floor while printing a calibration note.
- LIVE DEMONSTRATION, not fixtures: stored count tampered to 500 →
  `RATCHET: records SHRANK 500 -> 408 (92 fewer)`, exit 1, and THE FILE STAYED AT
  500 (a breach does not write itself down). All 9 instruments still reported, so
  the failure was attributable to the ratchet alone. The lower-with-reason path was
  left to its selftest arm rather than demonstrated live, so no fabricated reason
  would sit in the permanent `lowers` record. 23 arms, 0 failures.
- KEYED BY METRIC; one wired (`records`). STILL UNRATCHETED, named: regress's 167
  check count and crosscheck's 142 identifier total.

WHY THE CHAIN STOPS AT FOUR (user, recorded so nobody adds a fifth from momentum):
set → invocation → commit message → deploy is COMPLETE, not truncated, because the
battery is a SINGLE ENTRY POINT — one command covers everything downstream. A guard
above it would need its own guard, and that regress only bottoms out at a human
running one thing. FOUR IS WHERE THE RECURSION STOPS BECAUSE FOUR IS WHERE THE
HUMAN IS.

NEW STANDING RULE — ANY MACHINE-DERIVABLE NUMBER RESTATED IN PROSE WILL DRIFT.
Three for three in one session: run_checked.sh's "six call sites" (ten existed),
"36 polarity-flagged windows" (59), "3 of 141" (142). THREE REMEDIES IN ORDER OF
PREFERENCE, one applied to each: (1) DELETE THE DUPLICATE — a number that exists
once cannot disagree with itself; (2) POINT AT THE SOURCE OF TRUTH — the 49-window
read order is regenerated, never snapshotted; (3) QUOTE THE LINE —
commit_checked.sh copies DONE lines by machine. The ratchet is the one deliberately
stored number, safe because no human writes it and it only moves up. NO DETECTOR,
deliberately: a general one needs a declared (prose location, live value) map — a
FOURTH hand-maintained list carrying record_sync_check's own staleness caveat, so by
its own logic the next thing to drift. Dividing line: build the check where it is
cheap and TOTAL over its population (battery's list is closed over .claude/); use
remedy 1 where it would be another hand-maintained list.

DUAL-HOME: `_number_restatement_rule` added, `_battery_runner` and
`_polarity_mention_reads` rewritten (the "named uncovered hole" paragraph was
DELETED, not appended to — leaving it would have made it the fourth stale
restatement in the same session). 55 manifest keys, SYNC 15 → 16, `DONE
record_sync_check: 16 pairs checked, 0 half-landed`.

NEXT: unchanged from the fifth segment — ccf batch 1 in caveated-window-first order
(22 sites), drift rate for batch 2 pre-registered on an UNORDERED sample; bulk
citation-add ~38 foundational mechanism sentences; PathologyOutlines rate limit
after 2026-09-06 then WHO-first morphology reads; Phase A category citations →
falloff → breach → wall-shell; GENIE; thyroid re-source; kidneys/breast colour
re-access; Tomlins 2005; WATCHLIST 2026-10-17.

## 2026-09-05 (seventh segment) — the sidecar convention, recorded as a shape

`dc12997`, deployed green. NO CODE WAS WRITTEN FOR THIS ENTRY, on purpose. It closes
the instrumentation arc by recording a PLAN where a HOLE was, which is the whole
point of it: a later session reading either home finds "here is how this
generalises," not "here is a gap."

THE SIDECAR CONVENTION (user's ruling, and the reasoning is the useful part). Two
metrics stay unratcheted — regress's check count and crosscheck's identifier total.
The wrong fix is to parse them back out of each instrument's DONE line: nine formats
to track, and it recreates the prose-restatement problem INSIDE the runner, since
deriving a machine number from a human-facing string is the same mistake one level
in. The convention instead: each instrument emits `SIDECAR {"name": …, "metrics":
{…}}` ALONGSIDE its human DONE line, so the ratchet reads STRUCTURE and the DONE
line stays a sentence for humans — each the authority for its own audience, neither
derived from the other.

DELIBERATELY NOT DONE, and this is the part a future session should not "fix": NO
SWEEP of the ten existing tools, and NO READER BUILT. The convention applies to the
NEXT instrument written and to each existing one WHEN NEXT TOUCHED FOR ANOTHER
REASON — the gap is still theoretical, and the two named metrics are the two least
likely to shrink invisibly (regress's count dropping would follow a deliberate code
edit, not the silent producer change the extractor actually showed). THE READER SHIPS
WITH THE FIRST PRODUCER, not before it: a consumer with no producer could only ever
be demonstrated against a FIXTURE, and this project's standard is capability shown on
REAL output — conditions (7) and (8). Whoever writes that instrument wires both ends
and gets the live demonstration for free; building the reader today would spend it.

THE NEW RULE PAID OFF IMMEDIATELY, a fifth time. Writing the sidecar block surfaced
that the ratchet record in both homes said "regress.js's check count (167) and
citation_crosscheck's identifier total (142)" — two live values restated in prose,
two sections above the rule saying they will drift, and 142 is LITERALLY one of the
three numbers that had already drifted that day (from 141). Remedy 1: both
parentheticals DELETED, metrics still named, values now pointed at each instrument's
own DONE line. The `SIDECAR {…"checks": 167…}` example keeps its numbers but is
labelled a FORM, NOT A READING — an integer inside a format example is a syntax
demonstration, and scrubbing every historical number (e.g. crosscheck's past-tense
"checked 110 instead of 142") would make the records unreadable. THE TEST that
separates them: does a stale copy read as an authoritative claim about CURRENT state?
Present-tense inventory yes, format example no, correctly-tensed history no.

DUAL-HOME: `_battery_runner` rewritten again (7556 → 9289 chars) — the stale
sentence "wiring them means parsing each instrument's DONE line … a brittler job"
was REPLACED, not supplemented, since the project's own remedy 1 is what makes
leaving it a defect. No new SYNC pair (content sits under the existing `BATTERY
RUNNER` marker), so 55 keys / 16 pairs unchanged. `DONE battery: … 23 .claude/ files
all declared, 408 citation records extracted (ratchet 408 held), 0 problems`.

NEXT: unchanged. Instrumentation is CLOSED — four layers, ten instruments, one
ratchet, and the two remaining gaps carrying a recorded plan rather than an open
question. Everything from here is the reading.

## 2026-09-06 (eighth segment) — ccf batch 1 read, and the read order measured against itself

**SHIPPED a3e5015 = origin/main, deployed (27/27 byte-matched, 31 hotspots live).** The
batch the user opened with "Instrumentation's closed. Go read."

**THE READING: 11 records, 5 sites, boundary declared before reading. CERTAINTY-DRIFT 0 of
11.** Ten verified (nine verified-quoted, exact to numerator and denominator wherever
numeric) and one confirmed anti-citation (Foulkes 2010 NEJM carries no percentages, exactly
as recorded). Sources reached via a `/tmp/epmc.py` harness — eutils efetch for abstracts,
Europe PMC `fullTextXML` for oa=Y, the PMC site with a browser UA for oa=N/inEPMC=Y, the
in-app Browser for publisher cookie walls.

**FOUR COPY-EDITS SHIPPED** (user: "Go on all four"): Segelman's verb and denominator,
Fleming's dropped "sporadic", Wippold's misquoted hyphen, Wippold's unrecorded review status.
One left OPEN, not resolved either way: whether Yaeger 2018's MSS set excludes its 123
early-stage tumours.

**THE TWO MEASUREMENTS THAT MATTER MORE THAN THE TALLY — read the CLAUDE.md record before
planning batch 2:**

- **(a) The read order did not select what it was believed to select.** Measured at dc12997:
  22 caveated sites from only 12 distinct hedge locations, and **39 of 49 flagged records sit
  on a line carrying no hedge at all** — neighbours of one. `REGIONS_*` entries are
  ~1,000-character single-line literals, so a ±3-line radius is a ~3,000-character aperture.
  Correct as a WINDOW verdict, nearly uninformative as a RECORD verdict.
- **(b) The batch tested the prediction on the wrong substrate.** 7 of 11 were numeric claims
  with explicit denominators; only 2 were mechanism prose. Hedges cluster in numeric-provenance
  comments, so caveated-first order surfaces EPIDEMIOLOGY. **The zero is not evidence against
  certainty drift — it is evidence the ordering cannot sample for it.**

**THE ACCIDENT THAT HELPED (user's reframing, and it is the load-bearing one):** because 80%
of flagged records sit on unhedged lines, batch 1 was retrospectively **not a hedged sample at
all — it was an unordered sample of numeric claims.** That makes batch 1 vs batch 2 a clean
**substrate** comparison with no hedging confound. A failed ordering produced a better
experiment than the intended one.

- **PRE-REGISTERED, BATCH 2 (substrate, not inversion):** mechanism prose drifts more than
  numeric claims, because a number either matches or it doesn't while a hedge can evaporate.
  n=15 unordered from mechanism `note` prose, polarity flags ignored, **1–3 instances, strictly
  more than zero**, in-vitro/mouse omission the likeliest form.
- **BATCH 3, QUARANTINED ON PURPOSE:** the inversion hypothesis (hedged prose drifts LESS
  because a hedge marks work already done) is **untested** and needs its own cell — hedged
  mechanism prose drawn from the **12 real hedge locations**, not the 49-record window
  expansion. Run THIRD. Folding it into batch 2 reintroduces the confound.

**FIRST NARROW-DIRECTION COUNTEREXAMPLE, recorded beside the claim it qualifies** (user ruling
— it was going to be filed as wording drift, and that would have been wrong). colon.js:210
carried Segelman 2012's 8.3% as "8.3% of all patients" in a COLON ledger; the source's
denominator is all 11,124 **colorectal** patients in Stockholm County. **Narrower than its
source** — the anomalous direction THE DIRECTION pre-registered as deserving a second look, and
the corollary caught it, not number-matching: every digit was exact and the POPULATION moved.
For once the bias runs safe (Segelman makes colonic origin an independent predictor of
metachronous PC, HR 1.77, so a colorectal denominator understates the colon rate). Tally at the
moment of discovery: thirteen defects, twelve broad, one narrow. One counterexample does not
overturn the conclusion; an unexamined one would quietly weaken it.

**THE QUOTED-SPAN CHECK — recorded as a shape, on the sidecar's terms** (`_quoted_span_check`,
new manifest key, SYNC pair 17 added the same commit). **A misquoted quotation is worse than a
loose paraphrase**, because quote marks assert exactness. Wippold's "garlandlike" was quoted
"garland-like" — the one defect of the batch no number-matching could ever catch, there being
no number in it. Mechanizable and **total over the subset where a record has both archived
source text and a quoted span**, which is the test the drift rule sets. Scope discipline it must
encode: **only spans inside quote marks**; brain.js keeps `garland-like` hyphenated twice as
paraphrase deliberately. Build it when something touches citation fidelity anyway.

**OPEN FINDING, NOT YET FIXED — crosscheck's population silently shrinks on a network blip.**
The first battery run of the session reported `DONE citation_crosscheck: 141 records checked`
against the committed 142, under a green DONE line and `0 problems`. Diagnosed rather than
accepted: three standalone re-runs on the same artifact gave 142, so it is neither the edit nor
the content. Mechanism is `citation_crosscheck.py:187` — `except Exception: pmid = None` puts a
**transient fetch failure** and a **genuinely unmappable id** in the same `unexamined` bucket,
so a blip becomes indistinguishable from a corpus property and `len(uniq)` drops. This is
exactly the class `battery.py`'s own header names as *still unratcheted, able to shrink under a
green DONE line* — **the prediction fired on itself, unprompted, one day after being written
down.** Proposed: split transient from stable and exit non-zero when the population was not
fully reached; and since crosscheck would then be *touched for another reason*, it is the
natural first sidecar producer, which is what the reader was waiting for. **Held for a ruling.**

**Method note worth keeping: four zeros in this batch were artefacts, not findings** — two
publisher cookie walls (PubMed, Wiley), one truncated PMC page, and one paper reporting the
finding in different words ("No significant difference … was observed" for a no-enrichment
claim, zero hits for "enrich"). **Absence of the search term is not absence of the finding**,
and a zero from a source read is a hypothesis about the fetch before it is a fact about the
paper.

**Refinement to the number-drift rule, found while writing this record:** binding a measured
number to the commit it was measured at ("measured at dc12997: 22 sites from 12 hedge
locations") converts a drifting present-tense inventory into non-drifting history. A claim about
a named commit cannot go stale.

## Ninth segment — the coverage split and the sidecar reader (2026-09-06, shipped aafbe04)

**RULING: "Crosscheck first — but for the convention's reason rather than the demonstration's."**
The user accepted the fix and reframed why it goes first. The sidecar rule says *retrofit when a
tool is touched anyway*, and crosscheck **had** to be touched for an independent and sufficient
reason: it can silently under-report, and it is a battery member, so every run until fixed could
absorb a blip and present a smaller corpus as clean. **An active hole in the chain, not a deferred
improvement.** The sidecar and reader came along free — precisely the trigger the convention was
written for. Deferring meant touching crosscheck twice, or building the reader with no producer.

**Two corrections that changed the work, both worth carrying forward:**

1. **The 142->141 shrink is HISTORICAL, not a demonstration.** "A transient network failure isn't
   reproducible on demand, so what you have is a recorded instance and a diagnosed mechanism, not
   a live shrink waiting to be caught. That's still better evidence than a fixture, and worth
   citing as the reason the reader exists. It just shouldn't be described as a demonstration the
   reader will perform." I had framed it as a live demo; the corrected framing is encoded verbatim
   in the crosscheck header.
2. **"One precision on the fix, or it makes the instrument permanently red."** My proposal — exit
   non-zero whenever anything is unexamined — would fail forever on the one *stable* unmappable id.
   The split needs **the deploy gate's shape**: stable-unmappable is **declared and tolerated**
   (like the favicon 404), transient-unreached is **fatal**, and **a new unmappable id also fails**,
   correctly, since that is an undeclared change in what the scan can reach. A permanently-red gate
   gets ignored — the failure it was built to prevent, wearing a different hat.

**TIMEBOX, stated as a standing observation about the session:** "This is the last instrumentation
before the reading, and the session has a strong pull toward building over reading — every one
justified, and that's exactly why it's worth naming before the next one." Fallback given: if the
fix or the reader grew past scope, ship the fix and defer the reader. **Neither grew; both shipped.**

**WHAT LANDED (aafbe04, pushed, deploy verified byte-matched at that HEAD):**

- **`DECLARED_UNMAPPABLE`** in `citation_crosscheck.py`, an id -> **reason** dict mirroring
  `deploy_check.js`'s `BENIGN` as *the gate's honesty surface*. One entry:
  `doi:10.1002/prm2.12107` (Gao, *Precision Medical Sciences* 2023, breast.js:147), **verified
  genuinely unmappable rather than declared on faith** — esearch `[doi]` returns 0, the unqualified
  search returns 6 unrelated tokenised hits, Europe PMC has no record. A reason and not a bare id,
  with a selftest arm requiring one, because the entry's job is keeping two statements apart:
  *the claim is unchecked* (false — read at the publisher in ccf batch 1) vs *this instrument
  cannot reach it* (true).
- **A fatal, total-refusing abort** on a failed fetch, before the metadata pass and before any DONE
  line. A smaller total *is* the defect, so printing one with a flag attached would be publishing
  the wrong number with an apology.
- **`classify_unmapped()` is pure** over `(raw_id, ref, failure)` triples, so condition (7) is
  proven in all four directions with no network.
- **THE SIDECAR READER in `battery.py`**, shipped with its first producer per the convention.

**FOUR THINGS ONLY THE LIVE WIRING COULD HAVE TAUGHT** — each would have been guessed wrong on a
fixture, which is the case for the "reader ships with the first producer" rule:

- **A `ratchet` array is part of the convention.** crosscheck reports `records` (**coverage**, must
  never shrink) beside `flags` (a **defect count** — ratcheting it would fail the battery for
  *fixing a flag*). Only the producer knows which is which. A reader that ratcheted every metric it
  saw would have punished every repair.
- **That array's producer-side loophole**, closed in the same commit by `vanished_ratchets()`: an
  instrument could stop being watched by dropping a metric from its array or ceasing to print the
  sidecar. Checked against **committed state**, never a hand-maintained map of who-reports-what.
  **Scoped to members that ran, reported and exited zero** — a failing member's absent sidecar is a
  *consequence*, so an unscoped reader would have printed "you dropped your ratchet" on top of
  crosscheck's own abort and pointed at the wrong thing. Opens nothing: a producer that quietly
  stops ratcheting still exits zero. **Confirmed live, unplanned:** the post-push run printed
  `0 sidecar metrics ratcheted` and did *not* fire on crosscheck's stored metric, because
  crosscheck does not run in that phase.
- **METRIC KEYS ARE NAMESPACED `<producer>.<metric>` — a finding, not a style choice.** Two
  different numbers are both called `records`: the extractor's corpus total and crosscheck's much
  smaller identifier-carrying subset. **Unnamespaced, the reader's first live run would have
  compared one against the other and fired `RATCHET SHRANK` on a corpus that had not moved.** A new
  gate whose first act is a false positive teaches people to reach for `--lower-ratchet`, which is
  worse than the gap it closed. The extractor's bare `records` key is untouched, so nothing migrates.
- **`--lower-ratchet` keeps its bare form.** `=N` still addresses the extractor's metric because
  that is what the documented flag has always meant; sidecar metrics are `=<producer>.<metric>:N`.
  Repurposing a documented flag for uniformity would break the ratchet's only escape hatch, for style.

**Demonstrated live in all three directions (conditions 7 and 8), not on fixtures:** run one
**initialised** and said it was calibration; run two **held**; a deliberate probe lowering the bar
*above* the real value fired `RATCHET: citation_crosscheck.records SHRANK 150 -> 142 (8 fewer)`,
exited 1, and left the state file **byte-identical** — a breach still does not write itself down.
The battery DONE line now carries the count of metrics actually ratcheted, so a reader that
silently read nothing would say `0` rather than looking like a quiet pass.

**THE DRIFT RULE CAUGHT TWO MORE, both in the header of the tool that ratchets counts** — where it
is least excusable, and found anyway. `battery.py` said *"today exactly one metric is wired"* and
*"WHAT THIS ADDS IS TWO ASSERTIONS"* (wrong since the third was added the same day it was written).
CLAUDE.md's matching bullet named **two** unratcheted metrics, one of which had just become the
first producer. **All replaced by pointers rather than by new numbers** — remedy 2, not remedy 3.
This is the second time in this file that a passage warning about restatement had to be
hand-corrected for restatement. A third instance, one level down: appending this very segment
failed its own tail-anchor assertion because I reconstructed a **line wrap** from memory — the same
error class as the earlier CLAUDE.md Edit failure. The assertion existed, so it cost nothing.

**OPEN, REPORTED, NOT RULED ON: `commit_checked.sh` quotes prose into the permanent record.** The
marker is a **substring** match, so any line containing the literal `DONE ` is copied into the
commit message alongside genuine gate output. `aafbe04` carries three such lines — selftest arm
*descriptions* that happen to mention "DONE line". **Pre-existing** (a3e5015 and 58748d3 each carry
two), and my new sidecar arm added the third. Not a correctness failure — every real DONE line is
still quoted verbatim — but it mildly degrades the record the tool exists to protect, since a
reader cannot tell gate output from prose. Cheapest fix is rewording the arm descriptions to avoid
the literal string; a line-anchored marker would be stronger and a bigger change.

**STILL UNRATCHETED, and now only one:** `regress.js`'s check count. Its value is deliberately not
recorded here or in either header.

---

## Tenth segment (2026-09-06) — the matcher, anchored by FORM: `b0f7330`

**The open item above is CLOSED, and the ruling turned it into something bigger than the cleanup
I proposed.** I offered the cheap fix (reword the arm descriptions). Rejected: *"That changes the
data to fit the matcher, which hides the constraint rather than removing it: the next person who
writes 'DONE line' in a description reintroduces the pollution, and nothing will tell them why they
shouldn't."* Then my own alternative — a line-anchored marker — was corrected for a trap I had not
seen: *"`^DONE ` alone would silently drop `regress.js`. Its marker is `==== DONE: ...` — that line
doesn't start with `DONE`, it starts with `====`. A naive anchor would quietly stop quoting the
single most important gate in the chain from every future commit message, and nothing would report
the loss. A gate that gets quieter without announcing it is the failure class this whole arc exists
for."*

**FOLLOWING THAT CORRECTION FOUND THAT THE SILENT LOSS HAD ALREADY HAPPENED.** `grep -F "DONE "`
— the **documented** aggregate marker — does not match `==== DONE:`, because the character after
DONE is a colon. So `aafbe04`, made an hour before the ruling, **has no regress line in its commit
message**, while `a3e5015` and `58748d3` do — those runs were given the marker `DONE` without the
trailing space. The hazard the user named as a property of a *naive future anchor* was already
live in the *existing* matcher, reachable by typing the documented invocation. One invisible
character in a hand-passed argument decided whether the 167-check regression appeared in the
permanent record.

**The fix: quote by FORM, not by the passed marker, with both forms named.**
`DONE_LINE_RE='^DONE |^==== DONE'` in `commit_checked.sh`, and the identical two forms in
`battery.py`'s `run_member()` to decide what to leave unindented — **duplicated across a `.sh` and
a `.py` knowingly**, with both sites saying so and naming each other, because indentation is what
decides whether the anchored matcher can *see* a line, so printer and matcher must agree on what a
DONE line IS. Marker-based indenting already had a latent instance of its own: a member whose
selftest prints `DONE <name>_selftest:` does not contain its own declared marker `DONE <name>:`, so
it was indented and would have been dropped — **`deploy_check`'s is exactly that shape.**

**The passed marker still governs REFUSAL.** I wrote a second, stricter marker check and **removed
it the same hour**, recording why in place: with quoting anchored, the empty-capture test already
refuses a prose-only run and `run_checked.sh` already fails a marker typo, so a third check adds
only a way to refuse a **legitimate** invocation — the aggregate marker `DONE ` does not appear in
regress's line, so gating a regress-only run with it would refuse for no reason. **Redundant checks
are not free when one of them can fire wrongly.** Same shape as the ruling that stopped the chain
at four.

**CONDITION (7) APPLIED TO A MATCHER** — the user's framing, and the harder half: *"show it still
finds what it used to find, not just that it drops what you wanted dropped."* Verified in both
directions, twice over:
- **Against real gate output** (a full captured `battery.py pre-commit` run): old `grep -F "DONE "`
  captured 13 lines, old `grep -F "DONE"` 14, the new anchored matcher 11. It drops exactly the
  prose lines (indent 2 and 6), **restores** regress's line, and the set of genuine DONE lines it
  misses is **empty** — all genuine DONE lines sit at indent 0.
- **Against all three historical commit messages**, which are the old matcher's own captures:
  13 -> 11, 13 -> 11, and `aafbe04` 13 -> **10**. Lines dropped that begin `DONE` or `====`: **zero**
  in all three. **`aafbe04` keeping one fewer than the other two is the silent loss showing up in
  the arithmetic** — the verification the user demanded is also what quantified the damage.

**Three selftest arms added** (now six), including the regress form under the documented aggregate
marker — **the arm that would have caught `aafbe04`.** The other two prove prose is excluded while
the real line survives, and that prose-only output is refused outright.

**THE POLLUTED COMMITS ARE LEFT ALONE, by ruling:** *"The record is append-only by construction,
history immutability is a standing condition, and it's what makes `git show a131649:assets/*.glb`
the masters archive. Cosmetic cleanup of a commit message is nowhere near worth touching that —
note the pollution in the record with its date range and move on."* Range recorded in both homes:
**`58748d3` .. `aafbe04`, 2026-09-05 to 2026-09-06**, two prose lines each in the first two, three
in the last. `b0f7330` is the first commit in the repo's history whose message carries the regress
line **and** no prose.

**Shipped `b0f7330`** — pushed, deploy byte-verified
(`DONE deploy_check: 27/27 assets byte-matched to HEAD b0f7330, 31 hotspots live, 0 unexplained
page errors (2 declared-benign), 0 problems`). Record in both homes: a new `CLAUDE.md` section
**WHAT COUNTS AS A DONE LINE**, manifest key `_done_line_form`, and a nineteenth `record_sync_check`
SYNC pair.

**A FOURTH RESTATEMENT INSTANCE, in the prose describing the fix.** `CLAUDE.md`'s commit-gate
paragraph said *"Three-arm self-test"* — accurate when written, stale the moment a fourth arm
landed. Fixed by removing the count rather than updating it: the paragraph now describes what the
arms *prove* and points at the file's own list, and **says out loud that it said "three-arm" for a
day after there were six**, so the next reader sees the failure mode rather than just its repair.
Any machine-derivable number restated in prose will drift; the count of selftest arms is
machine-derivable.

**ADJACENT, STILL UNFIXED and now the last substring matcher in the chain:** `run_checked.sh`'s
presence check is `grep -qF "$marker"` — the same weakness one layer down. It is *less* dangerous
there (it gates the RUN, and a false pass needs the marker to appear in prose, which fails closed
in the other direction), but it is the same shape and it is recorded here as an open case, not a
closed one.


## Eleventh segment (2026-09-06) — ccf batch 2: the substrate result, over range, and its two axes: `ab3ed93`

**SHIPPED `ab3ed93`** (pushed, deploy byte-verified: `27/27 assets byte-matched to HEAD ab3ed93,
31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`). Second commit in the
repo's history to carry the regress line in its message — the anchored matcher from `b0f7330`
working on a real commit rather than a selftest.

**THE RESULT: CERTAINTY-DRIFT 4 of 15, against a pre-registered 1–3.** Frame n=48 mechanism-`note`
sentences, seed `int('b0f7330',16)`, draw fixed before reading. The stake was right in DIRECTION
(batch 1: 0 of 11 numeric claims) and wrong in MAGNITUDE. Recorded as measured, not trimmed to fit.

**THE USER RULED TWO MORE ITEMS IN — total defects 6 of 15** — from what I had filed as "open scope
notes" rather than findings. Both were established classes I failed to recognise as such:
`colon.js:275` dropped Li's population (**SCOPE DRIFT**, Paly/kidneys/testis shape) and
`colon.js:210` cited Fang for SMAD4 *loss* where the meta-analysis excluded 63 protein-expression
studies and measures *mutation* (**CATEGORY SUBSTITUTION**, TNBC-for-basal-like shape). The lesson
is transferable: **"open, needs more reading" was the wrong bucket for a defect whose class already
has a name and a fix.** When a finding matches an existing class, file it and count it.

**AND ONE RECATEGORISED, NOT FOLDED IN:** `prostate.js:222` "TCGA (2015) found" → **ATTRIBUTION
ERROR** (Beyer/Paly/Zeng/Wood class, own category, own count), not a copy-edit. I had reasoned by
analogy with Wippold's unrecorded review status; the ruling separates them because Wippold was a
missing annotation on an accurate claim while this asserts the wrong author. **Recategorising
preserves batch comparability AND files it correctly** — the reason not to just add it to the drift
count.

**THE TWO RATES ARE ON DIFFERENT AXES AND MUST NOT BE MERGED.** 4/15 is the certainty-drift rate and
is batch 3's comparison base, because batch 3's hypothesis is about hedges and a hedge is a
certainty marker — no hedge would have protected against a dropped cohort or a substituted category.
6/15 is the total-defect rate, which is what the remediation-load estimate uses. Both are recorded
in `CLAUDE.md` and `.claude/citations.json:_ccf_read_addendum` **with their axes named**, precisely
because unnamed a later reader would "update" one to the other and silently change batch 3's base.

**THE LI QUALIFIER TURNED OUT LOAD-BEARING**, which is the strongest argument yet for the
scope-drift class not being pedantry: Li's own discussion reports APC mutated in *"62.8% in our MSS
samples and 77.9% in the MSK MSS samples"*, so the cohort cited for an **APC** co-occurrence has a
materially different APC base rate than the Western cohorts nearly every other frequency in the
corpus comes from. Dropping "Chinese" dropped the one caveat bearing on the claim. Also found: the
quoted sentence is scoped *"In the MSS group"* — 6,056 of the 6,530 the note printed as its
denominator.

**THE CORPUS AS ITS OWN CONTROL — now three instances (Segelman, then two here), and a SOURCE-FREE
signal.** `colon.js:222` tracks "the only pairwise signal that survived Bonferroni" and
`colon.js:275`'s very next clause tracks an anti-correlation that "did not survive multiple-testing
correction" — the file already knew the distinction its own note dropped. Same record: the comments
at `:222` and `:258` carry Li's MSS scope the user-facing note omitted. **A defect detectable
without opening a single source.** Worth naming as a shape even though nothing was built on it.

**`prostate.js:222` PAIRS WITH THE BLADDER DEMONSTRATION** as the second defect class invisible to
number-matching: number and quoted span both verbatim correct, and only the sentence AROUND the
quote betrays it (`"The former" included … (Taylor et al., 2010)`). Two in two batches is a pattern.

**A STRONGER RESULT DECLINED ON CONVENTION GROUNDS** — worth remembering as a judgement call, not a
rule: `colon.js:222` records that AMER1×APC co-occurrence survived Bonferroni in this project's OWN
three-cohort computation, which would have supported "confirmed" better than Cornish does. It stayed
out of the user-facing note, because own computation governs inclusion/exclusion decisions in the
record and is not cited to the reader as a finding. The downgrade was still the right edit.

**MODELLING VOCABULARY, NOW STATED ONCE** (user ruling): "cooperating" appears 30× in
`js/organs/*.js` and only 10 carry the contrastive frame, so the convention was not self-evident
from the pattern. One sentence closes the `cancer-atlas.html` provenance copy, modelled on the
site→gene teaching-device sentence, and it covers the consequence-language labels too (`PTEN loss`
×8, `CDKN2A loss` ×5, `SMAD4 loss` ×3, …) — the root the Fang substitution grew from. **Labels were
NOT renamed**: corpus-wide convention, defensible; the defect was the clause attributing a mutation
finding to "loss".

**QUOTED-SPAN CHECK — two design inputs, both preconditions rather than refinements.** (a) Li's
quote differs from source by one character: `co‐occurrence` U+2010 vs ASCII. In an
`ensure_ascii=True` corpus, a byte-comparing checker fires on every legitimate transliteration.
(b) Cornish's `+0.066`/`+0.086` have zero hits in the article text — read off an Extended Data
figure, so a span check finds no span; figure-derived numbers need a declared marker.

**UNVERIFIED, KEPT:** Gerlinger's full text is unreachable (epmc-xml 404, pmc-www 167-char throttle,
epmc-www 1,514 chars) so the three SETD2 specifics are UNVERIFIED-BY-FETCH — not deleted, because an
unreachable fetch is not a refutation. Cooper 2015 has a Corrigendum (PMID 26018901) still unchecked.

**BATCH 3 IS DIRECTIONAL, NOT A RATE (user ruling):** 12 hedge locations will not yield 15 claims and
a rate from ten records is noise. Binary question — near zero and the hedge marks epistemic work
already done; near the certainty-drift rate and hedging is irrelevant, which **kills** the ordering
idea outright rather than leaving it mis-specified.

**PLANNING CONSEQUENCE (user):** the remaining ccf queue is *all* mechanism prose, so at this
substrate's rate remediation load is materially higher than the old mixed-content figure implied —
and value per read is correspondingly higher.

## ccf batch 3 CLOSED + pool-member exclusivity swept (2026-09-06, SHIPPED 2f35ac8 = origin/main)

Deploy byte-verified at 2f35ac8 (27/27 assets, 31 hotspots, 0 unexplained page errors). Battery
green twice in a row before commit (condition (8): the second run is the one to read). Every flag
set was confirmed **byte-identical to HEAD** before committing — the pancreas `~50%` vs `25/84`
fraction flag, liver's share-sum gap, the four duplicate-figure DRIFT pairs and crosscheck's three
metadata flags are all the known, already-ruled false positives. The only numbers that moved were
two record counts, both growth, both ratchets raised automatically.

**BATCH 3 CANNOT ANSWER ITS OWN QUESTION, AND THAT IS THE RESULT.** The hedge frame yielded n=8; four
were contaminated (already read in batches 1–2, or the hedge was one I had written) and excluded,
leaving n=4 independent. CERTAINTY-DRIFT 0 of 4; total defects 1 of 4. **At batch 2's 26.7% drift
rate, P(0 of 4) = 0.733⁴ ≈ 29%** — a perfectly ordinary outcome under the null. **Do not cite batch 3
as evidence that hedging works.** What it does license is a matched comparison that needs no rate at
all: in the one defective record the hedged user-facing line was clean and the defect sat in the
provenance comment *beneath* it.

**THE UNIT WAS WRONG (user ruling, and it re-prices the remaining work).** If hedging predicts a
clean user-facing line while the comment underneath carries the defects, **batch 2's 6/15 was
measured on the wrong unit too**, and the ~127-clause queue counts clauses, not the comments under
them. The read unit is to be **re-specified as record-plus-comment BEFORE the next batch, not after**
— the remediation load is larger than the clause count implies. Combined with the earlier ruling that
the remaining queue is *all* mechanism prose, the old mixed-content estimate is obsolete twice over.

**A DEFECT CLASS THAT GENERATES RATHER THAN DESCRIBES — the highest-ranked find of the arc.** Every
other defect here is a *description* that overstates. `PRIVATE_POOL_HCC` holds both ARID1A and ARID2
while Guichard, the corpus's own cited source, reports ARID2 mutations "less frequent but exclusive
from ARID1A mutations" — and `js/panel.js:48` makes **every unordered pool pair producible in ~12.6%
of cells** (p=0.42 a cell has private mutations × p=0.3 that it draws two distinct members). A user
can rotate a liver tumour carrying a genotype the citation says does not exist.

**ROOT CAUSE: A HAND-CHOSEN PARTNER LIST.** Exclusivity was tested pool-member against TRUNK and
BRANCH genes (CTNNB1, TP53, TERT) and **never pool-member against pool-member**. `liver.js` states
the check explicitly and the inference does not follow — premise on one axis, conclusion on another.
The flawed justification had also **propagated**: `prostate.js:183` cites HCC's pool decision as
precedent. User ruling: **do not fix the pair in isolation** — fixing it closes the instance and
leaves the mechanism, the same reason the testis four were held.

**THE SWEEP (user-specified, cheap, source-free): the corpus already knows every exclusivity its
sources state; it was never wired to the generator.** All 16 cancers' TRUNK/REGIONS/PRIVATE_POOL
arrays → a 71-symbol modeled-gene universe; every "exclusiv"/⊥ span in the organ files, `CLAUDE.md`
and `cancer-atlas.html` cross-referenced against producible co-occurrence. 87 spans name ≥1 modeled
gene, 40 name ≥2. **Cross-organ matches are noise** (a melanoma exclusivity says nothing about
ccRCC's pool) and were discarded by hand — my first triage over-reported by not doing that.

**SECOND INSTANCE, NEW AND WORSE: ccRCC MTOR ⊥ PTEN.** `kidneys.js:157` prints in a **user-facing
ccf** that PI3K/Akt/mTOR "alterations across pathway components [are] mutually exclusive with each
other"; `:158` puts PTEN in "the same" pattern; both sit in `PRIVATE_POOL_CCRCC`. Where ARID1A/ARID2's
exclusivity lives only in a source, **this one is printed in the product**, in adjacent lines of one
array — a viewer can read the exclusivity in one panel and see both alterations in one cell.
**Fix direction is undetermined and the deciding read is blocked**: if TCGA states component-level
exclusivity the pool must not co-draw the pair; if not, the ccf overstates and the pool is fine. The
TCGA ccRCC 2013 abstract says only "The PI(3)K/AKT pathway was recurrently mutated" — no exclusivity,
no 28% — and the full text is unreachable (PMC www served reCAPTCHA, EPMC `fullTextXML` 404s despite
`OA:Y`). **Either way it is a defect; which one needs that read.** Both fixes are HELD.

**THE SWEEP'S OWN BLIND SPOT, MEASURED — AND IT IS WHY THE ccRCC HIT WAS LUCK.** A gene-PAIR matcher
cannot see exclusivity asserted over a **pathway or module**, because those spans name no partner
gene: 13 such spans exist. `kidneys.js:157` is one of them, and the pair-sweep surfaced it ONLY
because `VHL` happened to sit in the same span, which misfiled it as pool×trunk. **So the sweep bounds
the pair-named class and does NOT bound the pathway-asserted class** — a third instance would also be
found by accident. A real detector must resolve a named pathway to member genes, which is not a
source-free operation. Listed-not-filed: TNBC's pool holds PIK3CA and PTEN, and a PI3K/PTEN
exclusivity was used to EXCLUDE PIK3CA from GBM's pool (Brennan 2013) — GBM-specific, so a question.

**"NAME IT OR REMOVE IT" — NOT "DOWNGRADE" (user ruling).** The unnamed "multiomics analyses" source
was doing load-bearing work *against* a named one. **A source that can't be named cannot outweigh one
that can.** It turned out to exist: **Li Z et al., *Human Mutation*, 2026, PMID 42016321, PMC13092802,
OA** — "Low-risk patients were characterized by frequent CTNNB1-ARID2 comutations," verbatim. Reading
it **narrowed what it can carry, three ways**: FIGURE-DERIVED (Fig 7c,d heatmaps; no OR or p for the
pair, only the panel's Fisher p<0.05 threshold); SCOPED to the low-risk stratum of the paper's own
WGCNA/ML risk model, not HCC at large; and **NOT INDEPENDENT** — it reanalyses TCGA + GSE54236, so the
old word "independent" credited a reanalysis with a separate cohort, the **prostate TCGA/Taylor-2010
attribution-error class** again. It is also **silent on ARID1A-vs-ARID2**, the pair the pool turns on.
So it cannot license the pooling at all. Third design input for the **quoted-span check**:
figure-derived *claims without numbers* need a declared marker too, not just figure-derived numbers.

**"NAMED" IS NOT "REACHABLE" — A THIRD BLIND SPOT, IN THE EXTRACTOR, AND THE MOST TRANSFERABLE THING
HERE.** The remedy wrote `Li Z et al., … (PMID 42016321, PMC13092802, OA)` in PubMed's own author
style. `extract_citations.py`'s `P_ETAL` matches a **bare surname** before "et al.", so the initial
broke the head, **the citation yielded no record, and both identifiers were dropped with it** —
`citation_crosscheck`'s identifier-carrying population did not move, and the two ids the ruling
existed to produce reached no instrument. **The failure is silent in both directions: nothing fires,
and the ratchet cannot see it either, because a citation that never becomes a record is an ABSENCE,
not a decrease — and the ratchet only guards decrease.** Dropping the initial made the same line yield
a record carrying both ids; the PMID then entered the crosscheck, where **PubMed's metadata
corroborated the hand read** (author, journal, year all clean). Recorded in that tool's header on the
same ruling that put `fraction_check`'s blind spots in its own. Widening the surname pattern is NOT
done: a change in reach must be declared and measured (aafbe04), and `"Li Z"` and `"Li Zhang"` are the
same shape to a regex that stops caring about token length. **The rule: a citation is produced only
when the corpus's own extractor can see it. Check the record appeared; do not assume the text is the
record.**

**`fraction_check`'s TWO BLIND SPOTS, IN ITS OWN HEADER (user ruling — "not just the batch log").**
First known defect class an instrument **structurally cannot see**. (1) ROUNDING COLLISION: 282/357 =
78.99% and 283/357 = 79.27% **both print as "79%"**, so a wrong numerator survives on the same
tolerance that legitimately passes "~92%" for 91.8%. Tightening would not fix it and would break the
~92% case; the honest statement is that percentage/fraction agreement **cannot verify a numerator**,
only detect gross disagreement. 250/357 does fire, so the check is live. (2) SCAN SURFACE: `FIELDS`
matches quoted field literals only, and the defect was in a `//` comment — **never a candidate, not a
near-miss**. Extending to comments is deliberately not done (declared change in reach). Both proven
by running `check_string`, not argued. **And the tool's own header at line 13 has carried the correct
283/357 the whole time** — the instrument's documentation held the right number while the corpus held
the wrong one. That is **THE CORPUS AS ITS OWN CONTROL, fifth instance**, now including an instrument.

**THE DIRECTION — TALLY FOURTEEN DEFECTS, TWELVE BROAD, TWO NARROW, AND THE SUB-SHAPE IS NAMED**
(user ruling): **a broader anatomic or histologic category rendered under a narrower organ heading**.
Three instances: Segelman, Li, and bladder's urothelial-presented-as-bladder. "A real metastatic
cohort" for Alessandrino's 103-patient MIBC cohort is the **second narrow-direction instance** — the
edit now names the cohort and its design. The Radiology-2020 paywall is UNRESOLVED; the edit was
written to be true either way.

**METHOD NOTE, worth remembering because it nearly produced a false alarm:** the Bash tool's working
directory **persists across calls**, and this workflow keeps `git archive HEAD` snapshots of the same
tree under `/tmp`. After a `cd /tmp/headsnap`, a `grep` and a `sed` on `js/organs/liver.js` read the
HEAD snapshot while I believed they were the live worktree — the edits looked reverted and I was one
step from reporting that another session had overwritten them. `git status` and mtimes settled it.
**In any workflow that snapshots the repo, use absolute paths for verification reads.** Same session,
a related one-liner: `python3 .claude/extract_citations.py --json` treats its first argument as the
OUTPUT PATH, so it silently created a file literally named `--json` in the repo root.

**GATE-CHAIN NOTE:** 2f35ac8 is the first commit where b0f7330's quote-by-FORM fix is demonstrated on
real output — all eleven DONE lines were captured **including regress's `==== DONE:`**, which the old
substring match on the documented marker `"DONE "` had silently dropped from aafbe04.

## Reach check + pool-member sweep + comment surface (2026-09-06, SHIPPED fe8d627 = origin/main)

**Deploy byte-verified:** `DONE deploy_check: 27/27 assets byte-matched to HEAD fe8d627, 31 hotspots
live, 0 unexplained page errors (2 declared-benign), 0 problems`. Battery green at commit time —
`==== DONE: 169 checks, 2 failures, 2 page errors ====` (the two failures are the long-known
`gbm`/`acinar` label-overlap pair; the two page errors are the declared favicon 404), `413 citation
records extracted (ratchet 413 held)`, `24 .claude/ files all declared`.

**ELEVEN FILES, NOT THE TEN THE RULING NAMED — and the eleventh is worth remembering.**
`.claude/record_count.json` was modified because the battery is its own writer and had raised the
ratchet 411 -> 413: my new prose comments contain year mentions, so the extractor produced two more
records. **A commit that adds citation-shaped prose moves the machine-written ratchet, and leaving it
unstaged would have committed a floor one step behind the corpus it guards.** Not an eleventh edit —
a consequence of the ten. Check the ratchet file's diff before staging; do not assume "ten files
changed" means ten files to commit.

**THE BATTERY'S OWN ARM CAUGHT AN UNSTAGED INSTRUMENT, on its first live opportunity:**
`FAIL the live .claude/ directory is fully declared (23 tracked files) — ['NOT TRACKED:
.claude/citation_reach_check.py — declared and present on disk but not in the git index, so it would
not ship']`. The eleventh instrument was **declared, invoked, green, and absent from the commit**.
**The declaration surface and the git index are DIFFERENT SURFACES**, and an instrument can be
perfect on the first while invisible on the second — the same shape as "an instrument that isn't
invoked can't fail", one layer further out. Fixed with `git add` inside the same commit.

**RULING 5 CLOSED WITH A CLEAN NEGATIVE RESULT.** `fraction_check` extended from field literals to
the 23 `//` comment blocks (blind spot (2), declared and measured per aafbe04). Flag trajectory
6 -> 4 -> 2 -> **1**, and the single survivor `pancreas:149` is the long-adjudicated Hahn 25/84 false
positive — **the same claim as the pre-existing field flag `pancreas:206`, now visible on both
surfaces**. So enlarging the aperture onto the comment surface found **zero new numeric defects**.
That is the result, not a failure to find things. **Field-surface reach was PROVEN unchanged, not
asserted:** both checkers run over an identical HEAD corpus in `/tmp/fcprobe` gave the same field line
and the same count over the same 44 strings; `share_sum_check` and `duplicate_figure_check` verified
identical on that corpus too, so no corpus edit of mine moved them. (`duplicate_figure`'s pair count
1680 -> 1663 is expected from the kidneys.js ccf rewrite; the FLAG count is what matters.)

**CONDITION (8) APPLIES TO A REPAIR, NOT ONLY TO A NEW DETECTOR — this is the transferable one.**
Three of the four surviving flags had ONE root cause: the pairing rule was positional and could not
see a bracket. My first fix ranked candidates by innermost shared parenthesis, and **it flagged a
CORRECT string**: `pancreas.js:215` puts another study's range inside the fraction's bracket while
the fraction's own percentage sits just outside, so ranking by bracket paired `140/150` with Wood's
90%. Fixed by making scope a **FILTER ONLY** — it decides which percentages are candidates, and the
calibrated distance heuristic still decides among them, so the field surface's adjudicated behaviour
is untouched. Structural rule (like `STATED_IDENTITY`), not a tuned constant. **A second-order catch:
one fixture went VACUOUS after that change** — written to fire under the rank model, it passed
legitimately under distance-only, so it no longer tested its stated intent; re-pointed at `~15%` so
it does. **A fixture's intent can die silently when the code it was written against changes.** Every
new shape has a FIRING counterpart beside its clean one, for exactly that reason.

**RULING 4's HAND AUDIT (pool-member against pool-member) — and its best finding is a negative.**
A pathway-resolving detector was explicitly NOT built (the candidate set is a few dozen pairs across
16 pools: an enumerable list, not a population). **`brain.js` had applied the correct test all along**,
excluding PIK3CA and RB1 from the GBM pool by testing candidates against EXISTING POOL MEMBERS —
precisely what `liver.js` and `kidneys.js` omitted. **SEVENTH "corpus is its own control" instance and
the FIRST where the control is a METHOD rather than a fact.** `liver.js`'s over-claim ("a defect class
the rest of this corpus does not have") is corrected to "of its own" and records that the audit
falsified it in both directions. `prostate.js`'s justification was stale for the opposite reason — it
cited HCC's pre-fix check as precedent, so **HCC is now the example of the failure, not of the
standard** — while its CONCLUSION survives the corrected test (PTEN ERG-enriched + CHD1
SPOP-associated + ERG-perp-SPOP is a transitive chain, and **two enrichments plus one exclusivity is
not an exclusivity**; promoting it would invent a claim TCGA 2015 declines to make). **The cross-file
pass is what surfaced all three new hits** — a pair pooled in one organ and discussed in another file
is invisible to a per-file search, and is exactly what a hand audit finds and a detector would not.

**THE USER'S THREE-WAY RULING, and the distinction my own filing got wrong.** I filed three
cross-organ hits as ONE shape, conflating two different kinds of statement:
- **EMPIRICAL EXCLUSIVITY** ("in this cohort these two were mutually exclusive") is a fact about a
  tumour type and **does NOT transfer**. Importing it is the ESR1/MDM4 class: real gene, real
  frequency, wrong tumour.
- **MECHANISTIC REDUNDANCY** ("both alterations remove the same checkpoint") is a claim about biology,
  and where the corpus asserts it **in its own voice** it needs no import.
Treating one-hit-per-pathway-node as tumour-agnostic would smuggle the first in wearing the clothes of
the second. Dispositions: **lungs/LUAD is OPEN and was MISFILED by me** — not a cross-import question
at all. Its `CDKN2A loss` entry carries **no ccf and no source**, which is the **bladder-colour class:
uncited content driving generated output, governed by source-or-remove**; and the redundancy point
needs no import because the corpus's OWN TWO NOTES both say the alteration "Removes a cell-cycle
checkpoint" in near-identical words in the same pool, so it is **internal consistency, not
provenance** (skin.js reached the same conclusion inside its own organ on pathway-redundancy grounds).
**breast/TNBC and stomach/GDIFF: EXAMINED AND CLEARED, with reasons recorded** — TNBC because
importing Brennan's GBM PI3K-perp-PTEN finding would be the named error and is probably wrong on the
facts in breast; GDIFF because a module-level finding **hedged even in its own organ** does not survive
transfer to another. Recorded rather than merely dropped **because a cleared pair looks identical to an
unexamined one** — the user's application of my own line, and the reason the audit was worth running.
All of it lives in `js/panel.js` immediately above the admissible-member draw, not in a log, because
that draw is the line that decides whether an audited pair can appear.

**NEXT, and it is the user's stated priority: `bare-name-year`.** The `(Bolton 2022)` / `(Chao 2024)`
style is **80 spans across 56 distinct heads, dominating `ovary.js` and `colon.js`, and it supplies the
OCCC anchors `205/421`, `188/421`, `17/102`** — user-facing numbers hanging off a citation style that
is **invisible to every instrument**, roughly three-quarters of it. Larger hole than anything in the
three-way ruling. A **fourth head pattern in `extract_citations.py` is a declared change in reach** and
gets its own measured commit (aafbe04's rule). LUAD's source-or-remove sits behind it.

## Fourth head pattern + boundary test (2026-09-06, SHIPPED c50842a then 69ab346)

Both committed through `commit_checked.sh`; tree clean at `69ab346`. **Not yet pushed or
deploy-verified** at the time this was written — `deploy_check.js` still owes its run.

**THE MOST CONSEQUENTIAL RESULT OF A REACH EXPANSION WAS A SUBTRACTION.** `c50842a` added the
`P_BARE_YEAR` head pattern (`(Bolton 2022)` style) and **added 87 records — but also REMOVED TEN
pre-existing false ones, four of them genuine misattributions.** Nothing predicted that; a change in
reach was expected to add. **A missing head pattern does not merely LOSE citations, it MISATTRIBUTES
them**, because the fallback is whichever author happens to be near enough. Worst case
`skin.js:400`, where four bare-name heads on one line all resolved to a single wrong one
(`TCGA|2012` -> Colombino|2012 + Jakob|2012 + Haluska|2006). **No instrument in the chain can see
this class** — a year producing the WRONG record is not an absence, so the reach check is blind to
it, and a false record is still a record, so the ratchet is satisfied.

**THE 87 NEW RECORDS ARE UNVERIFIABLE BY BOTH METADATA INSTRUMENTS, AND THAT IS A PROPERTY OF THE
COHORT, NOT A NOTE IN A CHECKER'S HEADER** (user's ruling, and the framing is the point).
`citation_crosscheck` held at exactly the same record count and the same flags across the commit —
**that flatness is not reassurance, it is the DEFINITION of the bare-name style**, which carries no
DOI/PMID/journal to check. So **a flat crosscheck total across a reach-widening commit must never be
read as "the new records were checked".** Meanwhile the reach check cannot see head-stealing without
an `et al.` anchor. Result: the corpus's newest and largest single cohort rests on **one hand audit,
performed once, by one reader, at one commit** — the weakest provenance any cohort here has. Every
future record this pattern mints inherits that property.

**STANDING PROCEDURE, ADOPTED ON RULING: ANY CHANGE TO EXTRACTION REACH MUST DIFF THE RECORD SET AND
READ EVERY REMOVAL.** Not sample them — read each one. **A removal is either a FIX or a LOSS and the
two are indistinguishable in a count.** This is the only technique in the chain that catches
misattribution, it needs no tool, and it is deliberately NOT mechanised because the judgement it
needs is "is this record true" — the one question no instrument here can answer.

**A DECLARATION NAMES CHECKABLE EVIDENCE, NOT A JUDGEMENT** (adopted on ruling, after three
declarations in `DECLARED_UNREACHED` rotted — the user recommended the declared-and-tolerated pattern
and asked for the precision). The >80-char bar measures LENGTH, not content. The real test is
**whether the reason can be RE-RUN or only RE-READ**: crosscheck's "esearch `[doi]` returns 0 hits,
unqualified returns 6 unrelated tokenised hits" can be re-run; "so that the count is of real
citations" can only be re-read, which is what six months of nobody noticing looks like. **A NUMBER IS
NOT AUTOMATICALLY EVIDENCE** — "the author sits 131 characters before its year" was arithmetically
correct and worthless, because it measured the distance to a head that does not own the year.
**Cheapest sufficient form: QUOTE THE SPAN.** Observed n=6: the two entries that quote source text
verbatim survive audit most cleanly, and none of the three that were wrong quoted anything.
Audit of all three declaration lists (reach check's five `etal-malformed-head` keys over 15 spans,
crosscheck's one `DECLARED_UNMAPPABLE` id, `deploy_check.js`'s one `BENIGN` entry): **all pass.**
Mechanising it (assert the reason contains a verbatim substring of the span) is specified and NOT
built.

**`69ab346` — THE BOUNDARY TEST, and the ordering lesson.** For an absence, the test for "is the
nearest `et al.` even ours" now runs **BEFORE** any question about the head's shape: **whether a head
was cut in half is irrelevant if the head is not ours.** Asking about shape first is the same mistake
one level down as asking about the head before settling what the year is. New reported-not-gated kind
`etal-shadow`, **deliberately keyless** — naming the shadowing surname would attach a real,
well-reached author to somebody else's absence. Pure reclassification: `etal-out-of-range` 1 -> 0,
unreached total unchanged, **zero record movement**, gated/declared 16/6 -> 15/5. The
`etal-out-of-range:Louis` declaration was DELETED, not amended; its archived text is at
`git show c50842a:.claude/citation_reach_check.py`. **The bucket is empty and every way it was
observed to go wrong is closed — which is a WEAKER claim than correctness**, and this branch's whole
history is a lesson in not upgrading the one to the other.

**MY OWN BAD EDIT, worth remembering as a shape:** intending to delete that declaration I wrote
`'etal-out-of-range:__deleted__' if False else 'etal-out-of-range:Louis':` — a **conditional dict key
that evaluates to the live key**, so the declaration stayed fully active while looking deleted. Caught
in the same turn. A deletion that is expressed as a conditional is not a deletion.

**A FIXTURE'S GEOMETRY CAN BE LOAD-BEARING.** The first `etal-shadow` fixture failed emitting NO
absence: the two years sat close enough that `P_ETAL` matched and the duplicate record was absorbed by
the `(author, year, ref)` dedupe. Swept the padding to find the real window — **17-18 words only**
(<=16 -> dedupe swallows it, >=19 -> `prose-year`) — and added a companion arm pinning the far edge so
the spacing cannot be silently "tidied" into the dedupe window by a later reader.

**RULED ON AND NOW CLOSED AS A QUESTION — see the next section. The boundary rule was ruled OUT, not
deferred.** The finding as reported was: **the RECORD path has no year boundary test at all.** The record path's only boundary test is `';' in back[head_end:]`; there is no
year analogue, and **the same test that is safe on the absence path is DESTRUCTIVE here — an absence
has no record to lose, this path deletes one.** Simulated on a throwaway copy: 490 -> 484, six
removed, zero added. **Reading them is what mattered: five are false records, the sixth is a LOSS** —
`Travis|2011` at `lungs.js:236`, one head deliberately carrying two years ("Travis et al., J Thorac
Oncol, 2015 (WHO) & 2011 (IASLC/ATS/ERS)"). A count of "six removed" would have read as a clean win.
So **the rule must be narrower than "a year intervenes": refuse a year owned by a DIFFERENT head
while permitting one more year under the SAME head.** Two sub-findings fell out of the same audit: a
**FIFTH head shape, `Surname (YEAR)`, that no pattern reaches** (`TCGA (2015)` at `prostate.js:204`),
and a **year-guard gap for a trailing `+`** (`SEER 2010+` is a data vintage, and the guards read a
dash but not a `+`). Fixing this makes the record count **DROP**, so it needs an explicit
`--lower-ratchet` with a reason — the ratchet is built to refuse exactly that.

## Decomposition ruling + two targeted fixes (2026-09-06, SHIPPED d54bd1a = origin/main, all four layers)

`c50842a` + `69ab346` + `d54bd1a` all pushed and deploy-verified:
`DONE deploy_check: 27/27 assets byte-matched to HEAD d54bd1a, 31 hotspots live, 0 unexplained page
errors (2 declared-benign), 0 problems`.

**THE USER'S RULING IS THE VALUABLE PART, AND IT OVERTURNED MY RECOMMENDATION: do NOT build the
narrower boundary rule.** I proposed narrowing "a year intervenes" to "refuse a year owned by a
DIFFERENT head, permit one more year under the SAME head". **The user decomposed the six removals
instead and found four distinct causes, only one of which is a boundary problem** — which is *why*
the only version I could measure was destructive:
- **REACH** `Fontugne|2015` — the year belongs to `TCGA (2015)`, the unreached fifth head shape.
- **GUARD** `Park|2010` — `SEER 2010+`, the `+` gap in the year guards.
- **CLASSIFICATION** `Fearon|1991`, `Powell|1990` (prose years) and `Schulze|2017` (journal-adjacent)
  — the record path performs **none** of the discrimination `classify_absence` already performs.
- **TRUE** `Travis|2011` — must survive.

**THE KILLER ARGUMENT, and it is structural, not a measurement: POWELL AND TRAVIS ARE STRUCTURALLY
IDENTICAL WITH OPPOSITE VERDICTS.** In both, an intervening year sits between head and target with no
competing head. `Travis ... 2015 (WHO) & 2011 (IASLC/ATS/ERS)` is TRUE; `Powell ... 1992 ... quotes
the 1990 model` is FALSE. **The difference is semantic** — two publication years of one document set
versus a publication year and a referenced model's date — so **any rule reading structure returns one
answer for both, and my proposed narrowing keeps BOTH.** It was not under-specified; it was
unspecifiable at that level. **Transferable lesson: the removal set of a proposed rule is a DIAGNOSTIC
POPULATION, not a verdict on the rule.**

**MEASURED PER FIX, NOT IN AGGREGATE** (the user's instruction, applying my own new standing
procedure), on separate throwaway trees before either fix was written into the file:
- `P_PAREN_YEAR` alone: **490 -> 491.** One false record out (`Fontugne|2015`), **two TRUE records in**
  (`TCGA|2015` at prostate.js:205 and :231), one `prose-year` absence correctly discharged — a year
  the corpus had filed as "not a citation at all" turned out to be one. Zero absences created.
- `PLUS_TAIL` alone: **490 -> 489.** One removal (`Park|2010`), zero additions. Also moved
  bladder.js:35's `2010+` from `prose-year` into `data-span-year`, i.e. from the least informative
  bucket into the one that says *why*.
- Together: **490 -> 490.** `Travis|2011` untouched; `Fearon`/`Powell`/`Schulze` deliberately still
  false at this commit.

**THE RATCHET DID NOT FIRE, AND THAT IS A NEW BLIND-SPOT INSTANCE, NOT A BLESSING.** The user had
supplied a `--lower-ratchet` reason string expecting a decrease; **none was needed, because the reach
fix adds two true records and the net is exactly zero.** Four records changed identity under a flat
count, and **the ratchet would have been equally satisfied had the substitution run the other way.**
Same shape as the flat-crosscheck lesson one level over: crosscheck also held at 143/3 flags across
this commit, because the new records carry no ids. **Measuring per fix is the only reason either
movement was visible at all.** Recorded at the record path in the code, not just here.

**Also fixed as byproducts:** `disqualified_year`'s docstring claimed every guard was "MEASURED FREE"
— true of the earlier ones, false of `PLUS_TAIL`, which deletes a record on purpose; the difference is
now stated there. Three prose counts of head patterns ("FOUR GUARDS", "ALL FOUR patterns", "fixtures
for the fourth head pattern") were **deleted rather than incremented**, per the machine-numbers-drift
rule — a count of things in the file is a number that will rot on the next addition.

**A TRANSIENT DNS FAILURE MADE A GREEN-CAPABLE RUN REPORT 1 PROBLEM, and the instrument was right.**
`citation_crosscheck` hit `URLError: nodename nor servname provided` on every id and **refused to
print a total** ("a smaller total is exactly the defect"), so the battery reported 9/10 members and
1 problem. Re-ran with the network up: 10/10, 0 problems. **A fetch-dependent instrument failing
closed looks exactly like a code defect in the summary line** — check reachability before debugging
the change.

### 2026-09-06/07 — `1bda280` then `4263890`, both battery-green, **PUSHED and deploy-verified** (user ruling: "Push both, and accept the rule")

Three ordered items, delivered as two commits. **The split was deliberate and is the point:** landing
the composition audit first meant the very next content commit's `git diff` on
`.claude/record_count.json` was the audit, showing exactly three `-` lines and nothing else. Landing
them together would have shown 487 added lines and no removals — the three false records would never
appear as `-` lines anywhere in git history, in the commit that claims to make composition visible.

**`1bda280` — the record SET is ratcheted beside its count.** `record_count.json` now holds
`record_keys`: sorted `author|year|file:line` identities, one per line. `battery.py` prints
added/removed/moved on every run and **refuses the file if the count and the set disagree, or if the
keys are out of sorted order** (sorted is what makes the diff readable). Same commit carries the
crosscheck's **live** DNS-refusal demonstration, with the interval pinned by `git log` (split shipped
`aafbe04` 2026-09-05 22:57 -0400; first live exercise on the way to `d54bd1a` 2026-09-06 22:14 -0400,
23h17m) **and the admission that the refusing run's own output was not kept** — which surfaced a real
asymmetry: `commit_checked.sh` archives every PASS into git forever and forgets every REFUSAL, because
a refusing run never reaches a commit. **The best evidence this project produces about its own
instruments is the class it stores least well.** Not worth a fifth layer; worth knowing.

**`4263890` — `paren-shadow`, and it did NOT use the mechanism the ruling named.** The ordered change
was "give the record path the absence path's classification logic". Both readings of that were
measured on throwaway trees **before either was written into the file**, and both are destructive:
prose-adjacency (a lowercase word between head and year) is 490 → 484, **3 fixes against 3 losses** —
it deletes `Di Carlo|2022 skin.js:47`, `Di Carlo|2025 skin.js:15` and `Rose|1989 ovary.js:184`,
because those citations carry lowercase words **inside their own descriptive labels** ("CONCORD-3
morphology study", "'s 428-case autopsy series"); and the absence path's literal `open_paren` test
kills `Travis|2011` while KEEPING `Schulze`, i.e. strictly worse. What shipped instead is
`closed_year_paren`: **a parenthetical CARRYING A YEAR that closed between head and year spends the
head**, exactly as a `;` already does. 490 → 487, exactly the three targets, zero additions, absences
144 → 147, `Travis|2011` intact, fixtures pinning all four real shapes plus the year-free aside.

**IT REVISES A PREMISE OF THE RULING THAT AUTHORISED IT, and that is the transferable lesson.** The
ruling argued "a structural rule can't separate Powell from Travis: they're structurally identical."
True of the rule then on the table (permit one more year under the same head) and **false in general**:
Powell's intervening year sits inside a parenthetical that CLOSED, Travis's is bare and his only
closing paren, `(WHO)`, carries no year. **The narrow claim — no YEAR-COUNTING rule can work — still
stands and is kept in the code; the generalisation to "no structural rule" was a jump from two
examples.** Three sites that repeated the stronger claim were corrected in place, not reworded
quietly, so a reader can see which claim moved.

**Its evidence base is four records and saying so is the honest half.** Exactly 4 records in the whole
corpus have any `)` between head and year; the rule splits them 3/1 along the true/false line. Blast
radius 4 means it cannot silently damage anything else — and fit-to-4, with one of them the
counterexample it was designed around, means **the next span of this shape is a test of it, not a
confirmation.**

**Standing procedure earned its keep twice more:** both rejected candidates were caught by diffing the
record set and reading every removal. A count of "six removed" and a count of "three removed" look
identical in kind; only reading them separates 3 fixes from 3 fixes-and-3-losses.

**Newly VISIBLE (not new) once the keys were listed:** pre-existing head-shape artifacts the corpus
always had and nothing ever enumerated — `Burgundy   Manfredi|2006`, `But Friemel|2016`,
`Cunningham's|1905`, `Foulkes WD|2010`, `Germany Hackl|2014`, `Gray's|1918`. Unruled at `4263890`;
**declared as a closed partition at `8200923`, where the enumeration turned out to hold EIGHT.**

`regress.js` reports `169 checks, 2 failures, 2 page errors` at both commits — **byte-identical to
`d54bd1a` and `69ab346`, so pre-existing and flat, not introduced here.**

### 2026-09-07 — the four ruling items: `8200923`, `69ba723`, `7455aaf` (battery-green, **NOT pushed, NOT deploy-verified**)

Four ordered items, three commits, **split so each audit ran on a tree it did not arrive with** — which
is itself one of the four items ("an audit that ships alongside its subject cannot witness it", now
written into `commit_checked.sh`'s header where a commit boundary gets drawn, with the converse marked
NOT inferable: an instrument shipping with a FIX to what it detects is fine and is this chain's own
convention, per `citation_reach_check`'s STALE problem).

**`8200923` — `citation_head_check.py`, the 12th instrument: the head-shape artifacts as a CLOSED
PARTITION.** 8 `IMPRECISE` + 15 `WELL_FORMED` over the enumerated population of multi-token heads; a
member in neither list is a PROBLEM, zero heuristic. Per the ruling, the surname patterns were NOT
widened — this declares, it does not fix. **THE RULING NAMED SIX AND THE POPULATION HELD EIGHT.**
`Sweden Engstrand` and `MIS-CITES Pollock` are the same class and were already described in
`extract_citations.py`'s header and pinned by a fixture there — i.e. **already declared in prose, and
prose is exactly where a declaration cannot notice a sibling arriving.** Omitting either would have
left the partition non-closed, and `Sweden Engstrand` would have fired as undeclared on the very first
run. **A hand-assembled list of six became a machine-checked list of eight on contact with the
corpus — the case for enumerating in a checkable form, made by the enumeration itself.**

**`69ba723` — `citation_paren_ledger.py`, the 13th instrument: the paren rule PRE-REGISTERED as a
falsifiable claim, scored per span.** Claim in the header, in the ruling's words: A CLOSED YEAR-BEARING
PARENTHETICAL SPENDS THE HEAD. **The pattern worth reusing is FIT vs TEST.** Every span the rule
decides is scored `SPENT`/`KEPT` × `CONFIRMS`/`FALSIFIES` **and** tagged `FIT` (it informed the rule) or
`TEST` (it arrived after). **FIT entries are recorded as worth no support value**, so the DONE line
reads `4 scored (0 as TEST, 4 as FIT and worth no support)` — the ledger currently carries ZERO
evidence and says so, which is the whole point of pre-registering before the corpus grows eightfold.
`basis_test` is the ratcheted metric: accumulated evidence cannot be deleted or quietly downgraded, and
`vanished_ratchets()` blocks dropping the key. Problem kinds: `UNSCORED` (a span the rule decided that
nobody examined), `STALE SCORING`, `SIDE MOVED`, `FALSIFIED`.

- **The population predicate is evaluated at the rule's DECISION SITE and travels on the artifact**
  (`parenBetweenHeadAndYear`), never re-derived in the checker. A rule implemented twice drifts, and
  the copy that drifts is the one the corpus is not run through.
- **The flag is deliberately NOT wired into the `if`.** Had it been, "fired implies examined" would be
  true by construction and unobservable. Left separate, it can be caught failing.
- Condition (7) on REAL output: `(WHO)` → `(WHO 2015)` on a throwaway `lungs.js` yields
  `PROBLEM: SIDE MOVED Travis|2011|js/organs/lungs.js:236: scored as KEPT, the rule now says SPENT`,
  exit 3. **The scenario in which this rule deletes a TRUE record has been produced, not described.**

**`7455aaf` — `.claude/refusals.log`: the refusal asymmetry closed as a LOG, NOT A LAYER** (the ruling
said so explicitly; nothing checks anything, no exit code changes, the chain still stops at four).
`run_checked.sh` appends a refusing run — UTC stamp, reason (`exit=N` / `marker-absent`), the DONE
marker, the tool, and the tail of the run's own output with the full line count so the excerpt never
pretends to be complete. It omits the argument list on purpose (temp paths, per-user token, no
evidentiary value, **public repo**) and rewrites `$TMPDIR`. `commit_checked.sh` stages the file itself
and stages **nothing else** — so "refusals archive one commit late" is true by construction, not by
anyone remembering. **The log ships with ZERO entries and its own header says the first will be a real
refusal**; the live crosscheck refusal that motivated it CANNOT be retro-filled and is named in the
header as the loss.

**Three defects that only a first live run could produce (condition (8) again, three more times):**
1. **A SIBLING SELFTEST POLLUTED THE REAL ARCHIVE.** `commit_checked.sh --selftest` drives genuine
   refusals through the wrapper — that is how it proves the commit is refused — so on the log's first
   live run it appended two synthetic entries to the real file. `run_checked.sh`'s own selftest had had
   the override from the start; the sibling did not. **An instrument that must pollute the artifact it
   maintains in order to test itself is untestable in the only state that matters.** Both now export a
   scratch path, the rule is written in `run_checked.sh`'s header where it was learned, and the two
   callers were enumerated by grep (battery's arms are in-process and never reach the wrapper).
2. **`basename` ate `-c`.** `tool=` came out EMPTY for `sh -c '...'` because `basename "-c"` reads it as
   an option. Fixed to `basename -- "$..."`.
3. **`.gitignore`'s `*.log` was silently keeping the archive UNTRACKED** — and the entire design is that
   the file is tracked. Fixed with an explicit `!.claude/refusals.log` negation plus the reason, placed
   where the general rule lives, **rather than renaming the file to dodge the pattern** (a rename hides
   the coupling; the negation documents it).

**`27 .claude/ files all declared`** at `7455aaf` (25 → 26 → 27 across the three commits, visible in the
commit messages themselves). `regress.js` still `169 checks, 2 failures, 2 page errors` — flat.

**PUSHED + DEPLOY-VERIFIED 2026-09-07 on ruling ("Push all three, then run the deploy check").**
`DONE deploy_check: 27/27 assets byte-matched to HEAD 7455aaf, 31 hotspots live, 0 unexplained page
errors (2 declared-benign), 0 problems`. The ruling's reason is worth keeping: **confirming no
regression on a `.claude/`-only change is exactly the boring pass the fourth layer should produce, and
skipping it because "nothing rendered changed" is the inference the layer exists to replace.**

### 2026-09-07 — the sequencing correction, the three declaration properties, and the log's first entry: `8140a15` + `d01615f` (**NOT pushed**)

**THE SEQUENCING RULE WAS CORRECTED THE DAY IT WAS GIVEN, and the corrected form is the one to use:**
**an audit must not ship in the same commit as the change it would have RECORDED. Sensors, readers and
fixtures travel with it freely.** The first wording — "an audit that ships alongside its subject cannot
witness it" — over-fires: read literally it forbids every audit that ships with any code, including its
own sensor. **The rule is about records and their subjects, not tools and their inputs.** What must
precede is **the baseline the audit compares against**:
- `1bda280` HAD to go first, because `record_keys` ARE the baseline — without them a removal has nothing
  to be absent FROM, and the audit's first act would erase its own finding.
- `69ba723` needed no prior baseline: its subject is four spans and a rule already in history at
  `4263890`, whose effect is already `-` lines in `record_count.json`. The `parenBetweenHeadAndYear`
  flag shipping beside it is the ledger's **sensor**, and a sensor is part of the audit.

Corrected **in place** at both sites (`commit_checked.sh`'s header, `citation_paren_ledger.py`'s header),
with the superseded wording quoted rather than deleted, so a reader can see which claim moved.

**THE THREE PROPERTIES A DECLARATION NEEDS, now recorded as a SET** in `citation_reach_check.py`'s
`DECLARED_UNREACHED` block — the canonical home the other three declaration lists already point at. The
point of grouping them: they were acquired one incident at a time, so each new declaration only
inherited the ones already learned. A new declaration should satisfy all three **at birth**.
1. **Names checkable evidence, not a conclusion** — re-runnable, not merely re-readable. Scar: the three
   `etal-out-of-range` keys deleted from that dict.
2. **Carries a reason at all**, not just an identifier. Scar: `absence_claim_check`'s unscoped-claim
   class ("no canonical figure exists" is a declaration whose instrument is an unrecorded search).
3. **Is a closed enumerated set, not scattered prose.** Scar: six named, eight found.
They are independent and a declaration can hold any two — a closed set of reasonless ids has (3) without
(2); a well-argued paragraph of prose has (1) and (2) without (3), which is the eight-not-six case
exactly.
**ATTRIBUTION CORRECTED UNDER CHECKING:** the ruling assigned (2)'s scar to `deploy_check.js`'s `BENIGN`
list. `git log -S"why: 'no favicon"` puts the per-entry `why` in that list's BIRTH commit `03ef214` — so
the benign list is (2)'s **exemplar**, the one place that had the property from the start, and the
failure of that shape happened to absence claims instead. Property unchanged, scar reassigned, noted in
the code beside it.

**AN INSTRUMENT THAT OWNS A FILE NEEDS A SCRATCH PATH FROM BIRTH** — generalised from the selftest
pollution and recorded in `battery.py` beside the sidecar convention, because it is the same kind of
thing: a property the next tool should have on day one rather than acquire by damaging something.
Anything that maintains an artifact and must exercise itself to prove it works needs an env override
naming where the artifact lives. **And the rule has a second half that the scar actually taught:
`run_checked.sh` HAD the override from birth and still got polluted, because the polluter was not the
owner — its sibling `commit_checked.sh` drives failing runs THROUGH it. So the scratch path must be
honoured by every caller that exercises the writer, not only by the writer's own selftest. An owner
cannot protect its artifact alone.** Two file-owning tools today (`record_count.json`, `refusals.log`);
exactly two callers that drive the wrapper.

**THE REFUSAL LOG TOOK ITS FIRST REAL ENTRY AND THE ENTRY BROKE THE FILE.** `deploy_check` refused at
`8140a15` because HEAD was one commit ahead of `origin/main` (`NOT PUSHED: HEAD 8140a15 != origin/main
7455aaf — nothing below can be a check on HEAD`), exit 1, and the entry was appended — **onto the
header's last sentence**, because the hand-seeded header ended without a trailing newline. So
`grep -c '^==== REFUSAL '` — the only thing that counts entries, and what the selftest arms are built on
— matched nothing. **THE LOG HELD ONE REFUSAL AND REPORTED ZERO.** A zero-report over present data, the
exact class this whole chain exists to refuse, produced by its own newest artifact on its first real
use. My own verification printed that `0` and I read it as "clean".
- Fixed at the **writer** (`log_refusal` anchors any append when the file's last byte is not a newline),
  not only in the file, because the header is hand-maintained prose and the next edit could drop the
  terminator again. **Arm 7 fails without the guard** — demonstrated by deleting the guard on a
  throwaway copy — so it is a capability check and not a restatement of the fix.
- The entry was re-seated on its own line; its bytes were not touched. The header now records the break
  rather than reading as a clean start, and names the division: header is hand-maintained, entries are
  not.
- **The one-commit lag proved itself on real output:** the refusal happened at `8140a15`, its entry
  landed in `d01615f`. Exactly as designed, and now demonstrated rather than described.

**THE FOURTH LAYER REFUSES ON ANY HEAD/origin DIVERGENCE, including a `.claude/`-only commit** — it
reports `NOT PUSHED` and stops, because nothing it measures can be a check on an undeployed HEAD. So an
unpushed commit of any kind leaves layer four red, which is the operational corollary of the ruling
against skipping the deploy check when nothing rendered changed.

## Anchor family closed + one home for the conventions (2026-09-07, SHIPPED cc31b3f = origin/main, all four layers)

`8140a15` + `d01615f` + `cc31b3f` all pushed and deploy-verified:
`DONE deploy_check: 27/27 assets byte-matched to HEAD cc31b3f, 31 hotspots live, 0 unexplained page
errors (2 declared-benign), 0 problems`. Pre-commit at those bytes, run twice (condition 8, identical
but for four `meshPx` values ±5, all `ok`): `DONE battery: phase pre-commit — 12/12 declared
instruments ran and reported (marker printed, exit 0), 13 declared in total, 27 .claude/ files all
declared, 23/23 .gitignore comments are prose not bare paths, 487 citation records extracted (ratchet
487 held; set unchanged), 5/12 reporting members emitted a sidecar, 2 sidecar metrics ratcheted, 0
problems`. Refusal log unchanged at 1 entry — nothing refused this round.

**AN ANCHOR IS NOT ALWAYS A POSITION (user ruling, closing family member 5(b)).** I had anchored
three matchers to line start and proposed the same for `record_sync_check`'s markers. The user refused
the mechanism and kept the goal: *anchoring the marker to line start doesn't help when the marker text
is prose that could begin a line — `THE DIRECTION` is exactly that shape.* What is decidable from the
artifact there is **COUNT: each marker must occur EXACTLY ONCE in its target.** Zero is the stale
declaration (5(a), closed hours earlier); more than one means the string is not a marker at all and
the pair can sit green in both homes **by coincidence**. So the question for a new matcher is not "is
it anchored" but **WHICH PROPERTY OF THE MATCH IS DECIDABLE — position, or arithmetic over
occurrences**; both clear the same bar, which is the bar and not the mechanism.
- Condition (7) **on the live corpus, not a fixture**: the new rule fired at birth on five declared
  markers that matched more than once (`(7-bis)`, `THE DIRECTION`, `GROSS-SPECIMEN`, `CERTAINTY-DRIFT`
  ×6, `QUOTED-SPAN CHECK`), each then lengthened to the unique span **at the record's own home** rather
  than to any unique string — `CERTAINTY-DRIFT` is the one whose marker had to change SITE.
- `DONE record_sync_check: 19/19 declared pairs present in both homes under a unique marker, 0
  half-landed, 0 stale declarations, 0 non-unique markers`.

**THE LOCATION WAS THE RULING, NOT ONLY THE CONTENT (user ruling).** I asked where to record the
family enumeration and offered `CLAUDE.md`. The user's test is **who needs it and when**: `CLAUDE.md`
is read before touching the project; this is needed at a narrower moment — while writing an instrument
or a matcher. And the argument against "record it at the site" is family members (1) and (2)
themselves: **the lesson from (2) WAS written down, in `commit_checked.sh`, and the refusal log broke
identically the next day**, because nobody reads that header while editing a different file. A second
copy in `CLAUDE.md` would not have fixed it either. *What fixes it is one designated location that a
new instrument's author is told to read, holding all three conventions, rather than three blocks
reachable only by scrolling to them.*
- So `battery.py`'s header now has **one labelled block, `READ THIS BEFORE WRITING A NEW INSTRUMENT,
  OR A NEW MATCHER`**, holding A (the sidecar convention), B (the scratch-path rule) and C (the anchor
  rule + the family enumeration). A and B were lifted out of numbered assertion 4, where they had been
  nested; the moved text is byte-identical apart from a uniform 3-space dedent.
- **The telling is structural for an instrument and not for a matcher, and the block says so:**
  assertion 2 fails the battery until a new `.claude/` file is declared, so writing an instrument
  *means* editing this file — but nothing forces the author of a `grep -c` or a `.count(` into it. That
  asymmetry is why the label names matchers explicitly.
- **The (5) and (6) closures stayed in their own headers** (`record_sync_check.py`, `.gitignore`),
  because they are facts about those instruments; only their STATUS is in C's enumeration. Per the
  user, that *avoids the dual-home recursion cleanly rather than by argument* — a copy of the block
  elsewhere would be a dual-home record wanting a SYNC pair and a unique marker, i.e. governed by rule
  C, which it contains.

**MOVING PROSE BREAKS SIDEWAYS REFERENCES, and this is the second instance in one day.** The sidecar
block opened "the wrong way to close **those two**" — a referent that lived in assertion 4 and was
left behind by the move; the pointer left in assertion 4 said "those two" as well, and by then only
one unratcheted metric remained. Repaired in place at both sites with the breakage recorded, the same
way the earlier one was: editing `record_sync_check.py`'s DISCIPLINE sentence had left `battery.py`'s
**verbatim quote** of it no longer verbatim, and **nothing checks that class of copy** (the quoted-span
check covers code quoting archived sources; SYNC covers manifest-to-document pairs; a quotation from
one instrument header into another falls between them). That quote is now narrowed to the span the
argument needs.

**A MEMORY HOOK WENT STALE WITHIN THE SESSION IT DESCRIBED.** The hook said `8140a15` and `d01615f`
were local-only; `git ls-remote` showed `origin/main` already at `d01615f`, pushed 07:44 today, hours
before this commit. The user's ruling — *commit and push all three; layer four red across three
commits is past where the gate's value holds, its whole point is proximity to the change* — was
carried out by pushing `cc31b3f`, which put all three on the remote. **Re-verify HEAD, `origin/main`
and the remote itself before acting on a recorded git state.**

## Internal quotes, misinvocation guard, demonstrative sweep (2026-09-07 — ALL THREE PUSHED, `cc31b3f..2590b57`, deploy-verified)

`3a6f26f` -> `ae56833` -> `2590b57`, none pushed; `origin/main` verified live at `cc31b3f`. **No push
authorization is held.** The user's words were *"Push authorization when you want all of it live"* —
an invitation to ask, not a grant, and per the standing rule a push authorization is one-use and does
not extend to a later commit. Layers 1-3 green on all three; layer four cannot be anything but red
until a push, because `deploy_check` reports `NOT PUSHED` and stops.

**`3a6f26f` — internal quoted-span check.** A new instrument for the gap between the archived-source
quote check (code vs source text) and SYNC (manifest-to-document pairs): a quotation from one
instrument's header into another's. Marks internal quotes with `QUOTES <path>` + a `> span` gutter and
resolves each. Four live breakages repaired. **The `:<anchor>` field was ruled OUT of the marking
convention** — *"a redundant hand-typed field is a liability that nothing checks… the span delivers
uniqueness and the line number derives."*

**`ae56833` — `run_checked.sh` refuses a misinvocation before running anything.** Motivated by a real
incident, not a hypothetical: at 14:36:54Z a shifted-argument invocation put `python3` in the marker
slot, so the wrapper tried to exec `battery.py` directly and died `exit=126 Permission denied`. That
refusal is refusal 2 in `.claude/refusals.log`, **archived by `3a6f26f` at 11:12 EDT** — 36 minutes
after the refusal and 15 minutes *before* the guard existed. (I first assumed `ae56833` carried it and
was wrong; `git log -- .claude/refusals.log` is the answer, not the commit order.) Replayed against
the real bytes this session: the guard now exits 2 with `MISINVOKED — first argument "python3" is not
a DONE marker`, before running anything.

**A GUARD THAT REFUSES EARLIER CAN MAKE THE ARCHIVE BLINDER — open, unruled.** `ae56833` writes **no
refusal-log entry**: a misinvocation never ran a tool, so there is no run to archive. Defensible, but
it means the same human error that produced refusal 2 yesterday now produces **no record at all**. The
newest guard in the chain made the refusal archive strictly blinder to that error class than it was
before. Verified with `RUN_CHECKED_REFUSAL_LOG` pointed at scratch: exit 2, scratch log 0 entries,
real log still 2, tree clean. **Not fixed — this is a ruling the user owes, since "log every refusal"
and "a misinvocation is not a run" both have a case.**

**`2590b57` — the demonstrative sweep.** The user's ruling, executed as given: *"apply the deletion
remedy for demonstratives, since there's no cheap mechanism for those: no cross-block demonstrative
anywhere in `.claude/` or `CLAUDE.md` — name the referent. 'Those two' is unanchorable by
construction; a named target survives a move. That's a prose sweep, not a checker."* Four patterns
(`bare-with-count`, `bare-pronoun`, `ordinal-reference`, `positional`), regexes in ONE home —
CLAUDE.md's section `NO CROSS-BLOCK DEMONSTRATIVE — THE DELETION REMEDY, SWEPT`. 113 candidate lines
/ 25 files -> 98; the cross-block subset the ruling governs 25 -> 18, every survivor on a declared
keep list. The scanner was deliberately **scratch, in `/tmp`, not committed** — the ruling said prose
sweep, not checker.

- **A DATED MEASUREMENT IS NOT A RESTATED MACHINE NUMBER**, and that is the distinction the
  number-restatement rule turns on. *"On 2026-09-07 the sweep found 113"* stays true forever; *"there
  are 113"* rots. This is the first time the rule has been written down with the permitted form beside
  the forbidden one, and it is why 113/98 was allowed into both CLAUDE.md and a commit message.
- **THE DIFF IS THE ENUMERATION** — no hand-counted total of fixes appears anywhere. I first wrote
  *"twenty of the 113 were fixed"*, a number nothing backed, caught it, and replaced it with a claim
  re-derivable forever against an immutable commit: re-run the patterns over `git show`'s removed
  lines, 21 carry one, four of those edited for a different reason with the demonstrative legitimately
  kept. **Re-measured after later edits grew the hunk, and it still held at 21/4** — a diff-bound
  number must be re-measured at commit time, not at the time it was written.
- **A HAND-TYPED `file:line` POINTER IN PROSE IS THE `:<anchor>` FIELD THE CONVENTION DROPPED**,
  surviving where no checker reaches it. This was the sweep's sharpest find and it is not a
  demonstrative at all. Four such pointers in `internal_quote_check.py`'s own prose, **all four
  wrong** — of the 5 pointers in the whole repo aiming into a `.claude/` instrument. Two were DRIFT
  (true at `cc31b3f`, broken by `3a6f26f`'s own `QUOTES` additions pushing the target lines down —
  **the mechanism is writing a pointer while reading the pre-edit file**). Two were FABRICATION:
  `battery.py:151`, where that span has only ever been at 154 then 155, verified across all 13 commits
  touching the file — **never true at any commit**, which is breakage 4's own sub-shape appearing in
  the header of the instrument built to catch breakage 4. Own section in CLAUDE.md. **The 186 corpus
  pointers were NOT swept** — that is a reach change owing its own declared, measured commit.
- **READING THE MATCHED TEXT IS WHAT REVEALED THE OVER-MATCH.** `positional` fired **31 times and
  found zero real hits** — every one is the English verb *"say"*. Three more were line-wrap artifacts
  where a determiner phrase splits across lines. **34 of 113 hits were noise, and that is recorded so
  a later reader does not mistake volume for signal.** A pattern's hit count is not evidence until
  someone reads the hits.
- **THE WHOLE POPULATION WAS EXAMINED, NOT THE CROSS-BLOCK SUBSET.** The block-triage heuristic
  ("hit before the block's first sentence ends") only means *"the referent is not in a prior sentence
  of this block"* — a third-sentence hit pointing at another block is misfiled as within-block. So all
  82 non-`positional` hits were read by hand with real context. **A triage heuristic's failure mode
  decides whether you may trust its buckets.**
- **DECLARED EXTENSION, FLAGGED NOT SLIPPED:** `the former`/`the latter` were fixed regardless of
  block, because position-within-an-enumeration is unanchorable even inside one sentence — a reorder
  inverts the meaning with nothing having moved.
- **A SWEEP IS A MOMENT, NOT A GUARD**, stated in the commit and in CLAUDE.md rather than left
  implied. Nothing added checks for a new cross-block demonstrative tomorrow.
- Pre-edit safety was **mechanised, not assumed**: verified 0 SYNC markers land on a CLAUDE.md edit
  line, that the only CLAUDE.md-targeting internal quote was untouched, and that the edited heading
  `## Data rules (do not relax these)` was not a declared marker anywhere.

**NOTHING IN THE CHAIN INVOKES `run_checked.sh --selftest` OR `commit_checked.sh --selftest` — open,
unruled.** Measured, not read off the source: repo-wide grep for either wrapper invoked with the flag
returns **0 matches**, and the two are declared in `battery.py`'s `NON_INSTRUMENTS` as *"wrapper — …
has its own `--selftest`"*. Eleven instrument selftests do execute inside a battery run (evidence:
`SELFTEST PASS` lines in the captured output), because those instruments run their selftest
unconditionally — several via the inverted `if '--selftest' not in sys.argv:` form, which means "run
the selftest always; the flag only makes it exit before doing real work". **The two wrappers' ~15 arms
run only when a human types them.** Deliberately not wired in: that changes the battery's declared
membership and its DONE line, i.e. a reach change owing its own declared, measured commit.

**METHOD NOTE — a `tail` on a captured gate run is not the run.** Battery run 1 was captured through
`tail -32`, which discarded every per-instrument DONE line and left only the aggregate. The aggregate
asserts `13/13 … (marker printed, exit 0)`, so the gate held, **but I could not read the one line I
most needed** — `internal_quote_check`'s, since the sweep edited three of its target files. Re-ran
capturing all 556 lines. Same lesson as *never assume the text is the record*, one level out: **do not
let the capture be narrower than the claim you intend to make about it.**

## Wrapper-selftest preflight + misinvocation logging (2026-09-07 — PUSHED, layer four green)

`4e922f2` then `988affb`, both gated green (`0 problems`), and **both pushed** on a second, separate
one-use authorization the user gave in those words: *"Push: authorized. Two commits, layer four red. Go."*
The earlier "Push all three" grant had been consumed by `cc31b3f..2590b57` — **a push authorization is
one-use and does not extend to a later commit**, which is why a second one had to be asked for and is why
the section heading once said NO PUSH AUTHORIZATION HELD. Re-verify `git rev-parse origin/main` before
believing any of this; commits landed after these two are recorded further down.

- **`4e922f2` — the two wrapper selftests now run as a battery PREFLIGHT, not as members.** User's ruling:
  a preflight "isn't declared membership, so the DONE line and the instrument count don't move," and it is
  "where a precondition belongs — before anything else, not alongside it." Verified: the `DONE battery:` line
  is BYTE-IDENTICAL to `2590b57`'s, which is the drift-proof way to state that (diff the two commit messages,
  do not trust a restated total). Runs before `regenerate_records()`. Adds ~2s to a ~3min run.
- **Two failure modes, and the second is the point:** non-zero exit fails, AND exit 0 without a
  `SELFTEST PASS` marker fails. A `--selftest` branch whose `[ "${1:-}" = "--selftest" ]` guard stops matching
  falls through to the wrapper's normal path and exits 0 having asserted nothing — vacuous pass, in the two
  files with no DONE line of their own. `run_checked.sh` cannot guard these two because it IS one of them.
- **A HAZARD THE PREFLIGHT CREATED AND CONTAINS, worth remembering as a class:** `commit_checked.sh`'s
  selftest runs `git init`/`git add`/`git commit` in a scratch TMPDIR repo with **no git-env isolation**
  (`commit_checked.sh:164-166`). Harmless while nothing invoked the battery automatically; the preflight makes
  it reachable on EVERY run including `pre-commit`, and a git hook EXPORTS `GIT_DIR`/`GIT_INDEX_FILE`/
  `GIT_WORK_TREE` to its children — so the scratch `git commit` would hit the REAL index. `GIT_REDIRECTION_VARS`
  is scrubbed at the new call site. **No hooks are installed today (only `.sample` files), so this changed
  nothing measurable — it is a prospective fix, declared as one.** Generalisable: *making an existing selftest
  run automatically can convert a dormant hazard into a live one, and the fix belongs at the new caller.*
- **`988affb` — a misinvocation is now LOGGED**, `reason=MISINVOKED marker="n/a" tool=n/a`, reversing
  `ae56833`'s refuse-silently behaviour. **A GUARD THAT REFUSES EARLIER MADE THE ARCHIVE BLINDER** — moving a
  refusal earlier is normally strictly better, and is worse when the later stage was the only thing writing
  anything down. The user's decisive argument: refusal 2's whole value is that it motivated `ae56833`, and
  under the new behaviour that incident would leave no trace in the archive built for exactly that class.
- **The bad argument MOVES rather than being lost** — the guard's message quotes `"python3"`, and the message
  is what the entry's output block carries, so it is recorded as *the word that was passed* rather than as a
  field *claiming to be a marker*. That answers the original objection instead of overriding it.
- **ONE WRITER:** the guard sets the two fields and calls `log_refusal`, which holds the line-start guard a
  real defect bought. An inline append could drop the terminator again.
- **Arm 10 inverted:** it asserted the log stays EMPTY, now asserts a PRESENT entry with named fields. The old
  form was caught false-passing once (negative control with no execute bit → died at exec → log empty for the
  wrong reason → arm green while measuring nothing). **A present entry with named fields has no false-pass
  mode of that shape, because a call that never ran writes no entry to find.**
- **Both halves fired separately by mutation:** deleting `log_refusal` fails on the count alone; deriving the
  fields the old way **reproduces the original defect byte for byte** (`marker="python3" tool=battery.py`) and
  fails on honesty alone. The second is the one worth having.
- **NO synthetic entry was manufactured in the real `.claude/refusals.log`** to demonstrate the new form — it
  is still last touched by `3a6f26f`, still 2 entries. A demonstration entry would be the "reads as fact"
  problem from the other direction. Proof lives on a scratch log + the selftest arm.
- CLAUDE.md corrected in place at BOTH sites that recorded the superseded behaviour (the condition-(7) bullet
  and the absence-assertion bullet), each marked as what it was, plus a new `###` section for the ruling.

## THE POINTER CENSUS — REPAIR, NOT DELETION (2026-09-07, answers the user's "count them, don't sweep them")

**SUPERSEDED AS A LIVE MEASUREMENT — the census became `.claude/pointer_check.py`, a committed battery
member. Run that, don't trust the numbers below.** This section is kept as the record of how the
repair-versus-deletion question was decided and what the oracle bugs were; its figures were true at
`988affb` and the guard's DONE line is the source of truth now. The scratch script it started as
(`/tmp/atlas-guard/pointers.py`) is gone with `/tmp` and no longer matters.

- **Population 529** hand-typed `file:line` pointers (287 structured in `citations.json`'s `entries.code_refs`
  + `backfill.refs`, 242 in prose across `CLAUDE.md` and `.claude/`), after excluding machine-written record
  keys and the selftest fixtures (`a.js`, `b.js`, `c.js`, `x.js`, `deleted_instrument.py`).
- **FLOOR: 529/529 resolve** — every pointer names a tracked file with that many lines. **Zero dangling.**
- **IDENTITY, on the 266 `backfill` refs (the only subpopulation with a decidable oracle, since each carries
  `author`+`year`): 217 EXACT (216 of them with the year on the same line), 49 DRIFTED, ZERO absent.**
- **THE DECISIVE NUMBER IS THE ZERO.** No pointer's referent is missing from its file, so **nothing here is
  fabricated and every defect is mechanically repairable** — the user's "small cleanup" branch, not the
  deletion branch. Deletion would destroy fully recoverable information.
- **Drift clusters by file, which is why repair without a guard is a treadmill:** `colon.js` 11 drifted with
  offsets only {1,2,3}; `prostate.js` 11 with {-7,1,8}; `liver.js` 19 with 9 distinct offsets out to 53. One
  edit moves many pointers at once.
- **TWO ORACLE BUGS FOUND BY DISTRUSTING MY OWN FIRST ANSWER, both worth remembering:**
  (1) a bare-substring author match is unsafe here — 33 records have a needle ≤4 chars, and `Li` matches
  "likely", `Hu` matches "human", `Ding` matches "finding", `Min` matches "minimal", `Ther` matches "therapy".
  Word-boundary + year required. (It happened to give the same 217, because "human" does not sit beside
  "2012" by accident — **the number surviving a stricter oracle is why it is worth believing.**)
  (2) **a ±25-line window turned FAR DRIFT into "GONE"** — 13 `liver.js` refs were reported absent while
  `Katyal` occurs NINE times in that file, the pointers sitting in a comment block ~32 lines above the
  citation text. Searching the whole file collapsed "GONE 15" to "absent 0". **A window is an oracle
  parameter, and a wrong one manufactures a defect class that does not exist.**
- **Superseded:** an earlier unsaved pass in this same session reported 173 EXACT / 45 DRIFTED / 48 GONE.
  Those figures were the weak oracle plus the window bug and should not be quoted. This is the second time in
  two days that *my own measurement* was the broken thing rather than the corpus.
- The `.claude/`-instrument pointer class was already repaired in `2590b57` (4 of 5 wrong: 2 drift, 2
  fabrication; `fraction_check.py:13` verified correct).

## GUARD BEFORE REPAIR — `pointer_check.py` + the 49 re-pointed refs (2026-09-07, user ruling)

Two commits, in this order and **not** the other: **`3fa9e1a`** carries the repairs (49 ref line numbers in
`citations.json`, plus 8 fixture refs composed from parts), **then `838746e`** lands the guard on the tree
those repairs left behind (`pointer_check.py`, its `battery.py` declaration, rule-C family entry 12, and the
`CLAUDE.md` record). Both gated green, 14/14 instruments, `0 problems`. **Both are now PUSHED** (third one-use
grant, *"Push authorized."*), and the grant is spent — re-verify `git rev-parse HEAD` and `git rev-parse
origin/main` rather than trusting this line.

- **THE ORDER WAS THE RULING, and the reason was the drift's shape** (user): *"Drift clusters by file because
  **one edit moves many pointers at once** — eleven in `prostate.js`, nineteen in `liver.js` — so repairing 49
  today buys a state that the next content commit partially undoes, silently, with nothing reporting it."*
  Sequence: *"build it, run it, watch it fire on the 49, repair against its output, watch it go green."*
  **A guard written after a hand cleanup can only ever be demonstrated against a corpus with no defects left
  in it** — condition (7) unmeetable by the corpus. This one fired on the live corpus and its output was the
  worklist.
- **THE GUARD LANDS SECOND FOR A DIFFERENT REASON, and the two are easy to confuse.** Not "an audit must not
  ship with the change it records" — the refined form of that rule is what `commit_checked.sh` already carries:
  *an audit must not ship with its SUBJECT, but shipping with its subject's REPAIR is fine.* The reason to
  split is that the guard's own commit must not be the commit that turns it green, or the only evidence it
  works is a run over output that same commit produced.
- **THE FLOOR, NOT THE EXACT-MATCH RATE, IS THE DECISIVE NUMBER** (user: *"529/529 resolving at the floor is
  the decisive number, not the 217. Nothing is fabricated; every defect is recoverable. That's what makes this
  repair rather than deletion, and it's worth stating in those terms in the record."*). Stated in those terms
  in `CLAUDE.md` under **"THE GUARD CAME BEFORE THE REPAIR, AND THE FLOOR WAS THE DECISIVE NUMBER"**.
- **FOUR THINGS THE REPAIR TAUGHT THAT THE CENSUS COULD NOT:**
  1. **NEAREST IS NOT IDENTITY.** The guard's repair candidate was the wrong line in **4 of the flags** —
     three wrapped citations plus an author whose nearest hit is a comment *quoting* the paper while the
     referent is a data string far below. **An auto-fixer would have written four wrong numbers and reported
     success.** Which is why it proposes and never applies.
  2. **A WRAPPED CITATION IS IMPRECISE FROM BIRTH, NOT DRIFT** (surname ending one line, year+journal
     beginning the next; a pointer at the year line was never exactly true). Drift re-points **forward**, this
     re-points **up** to the surname. The check accepts a name-only match on the pointed line for exactly this
     reason — demanding author AND year on one line would make the corpus's own wrapping unrepresentable.
  3. **A POINTER CAN BE RIGHT FOR ONE RECORD AND STALE FOR ANOTHER**, so repairs key to **(record, ref)**,
     never (file, line). `brain.js:234` is stale for one record and correct for another. And within one file
     the same number was both an *old* and a *new* line, so a sequential replace would have re-broken what it
     just fixed.
  4. **A MODAL OFFSET IS A VOTE, AND A VOTE NOBODY COUNTS IS NOT EVIDENCE.** Block offsets are the best signal
     (one edit moved a whole block) but produced **two confident wrong answers off 1 vote and 2 votes**. Kept
     as a reading aid, deliberately not a rule.
- **A FIXTURE MAY REUSE A REAL POINTER; IT MUST NEVER INVENT ONE.** The census's population rested on a
  hand-maintained list of fixture filenames to skip, and **that list hid 8 dangling pointers** in two
  selftests. Copying it into the instrument would have made the total a statement about the list — the
  staleness `battery.py`'s assertion 2 exists to refuse. Fixed by composing the fixture refs from parts, so
  the invariant is absolute with nothing to keep in step. **Reusing is harmless (the fixture makes the same
  true claim the live pointer does); inventing is a false claim no reader and no tool can distinguish from a
  live pointer.**
- **THE DECLARED-EXEMPTION PATH SHIPPED FROM BIRTH AND EMPTY**, per the user's *"Give it the declared-exemption
  path FROM BIRTH, with the three properties… Retrofitting that after the first false positive is how the
  other declarations acquired their scars one at a time."* Its property-(1) evidence is **a verbatim quote of
  the exempted line that must occur exactly once in the file** — `citation_reach_check.py`'s quote-the-span
  idea finally mechanised, with the one-common-word loophole closed by the count-not-position anchor rule.
  Checked in both directions. **Empty is a claim, demonstrated by five refusal arms rather than a live entry —
  the state a declaration list should ship in.**
- **RULE-C ENTRY (12) BROKE THE FAMILY'S GREPPABLE SHAPE LIST, which is the more useful finding.** The
  five shapes (`^`, `startswith(`, `index($0,`, `-qF`, `.count(`) were offered as how a checker might one day
  verify "every matcher site is classified". Entry (11) needed no new shape; **entry (12) needed one — a
  word-boundaried regex over prose** — so the list enumerates shapes *used so far*, not shapes possible, and a
  checker over it would have gone green while missing the newest member. Corrected in place in `battery.py`.
  This shape's characteristic failure is **not an anchor collision but ORACLE LOOSENESS**, whose remedy is a
  corroborator rather than an anchor.
- **A DECLARED UNIQUE MARKER MAKES ITS OWN HEADING UNQUOTABLE — the gate caught me mid-commit.** Writing the
  `CLAUDE.md` entry I cited a sibling section **by its exact title**, precisely to avoid a positional
  reference like "the section below" — and that title's distinctive span is one of `record_sync_check`'s
  dual-home markers, required to occur EXACTLY ONCE in that file. `NOT A MARKER … 2 occurrences in the
  target`, battery refused, refusal appended (**so `.claude/refusals.log` is 3 entries now, not 2**).
  **Two conventions in this repo collide head-on:** name a section by title rather than position, and reserve
  a unique span as a marker. Resolution: cite a DIFFERENT span of the title than the declaration reserved, or
  name the rule and its date. The error message does not suggest the fix.
- **RULED AND FIXED (see the next section): `internal_quote_check.py` GLOBBED `.claude/` WHILE `battery.py`
  DECLARES FROM GIT.** So an untracked draft in that directory counted for one member and not the other.
  `pointer_check.py`, sitting untracked with a marked quote in its header, **silently moved the ratcheted
  marked-quote metric**; committing that `record_count.json` would have recorded a number the committed tree
  could not support and a fresh checkout would have failed the coverage floor. Caught by
  `git checkout -- .claude/record_count.json` and moving the draft aside so the gate validated exactly the
  tree being committed. **A ratchet is only as trustworthy as the agreement between its producers about what
  they are counting.**

## A RATCHETED METRIC MUST DERIVE FROM TRACKED FILES (2026-09-07, user ruling; `74277c5` PUSHED, layer four green)

The ruling on the finding above, in the user's words: *"`battery.py` is right and `internal_quote_check` is
wrong. What ships is what's tracked — a fresh checkout has only tracked files, so **any ratcheted metric
derived from a filesystem glob records a number a clean checkout cannot reproduce.**"* Plus the general form,
which the user stated explicitly as being worth recording because it is not specific to that instrument, and
the note that **anything emitting a ratcheted sidecar while globbing has the same defect latent — checkable
by inspection rather than by waiting for it to fire.**

- **FIXED AT EVERY RATCHETED PRODUCER, READING THE INDEX NOT `HEAD`** so a newly `git add`ed file counts in
  the commit that adds it (battery.py's existing choice): `internal_quote_check` + `pointer_check` over
  `.claude/`, and `extract_citations` over `js/organs/` via a new **`corpus_paths()`** that
  **`citation_paren_ledger` IMPORTS** rather than keeping its own byte-identical copy of the same glob. That
  copy was the finding one level down — a second population free to drift, in a file whose `basis_test` is
  ratcheted.
- **`glob` removed from all three imports**, not left unused (an unused import invites the next reader back to
  it), and each docstring **corrected in place** — they previously DEFENDED globbing on anti-hand-list
  grounds, an argument right about hand lists and irrelevant to git.
- **Filtering, not a `git ls-files js/organs/*.js` pathspec:** git's wildcards cross directory separators, so
  a pathspec would silently sweep in a future subdirectory.
- **BEHAVIOUR-NEUTRAL, MEASURED:** glob and index listed the same corpus, `git status --porcelain
  --untracked-files=all` empty, `record_count.json` byte-unchanged across both gate runs — which is how the
  read-every-removal rule is satisfied with nothing to read. **The arms, not the run, are what prove the
  filter works:** six new arms across the three instruments, and the second of each pair is the incident in
  miniature — a path that certainly EXISTS ON DISK is absent from a synthetic tracked list, and **absence from
  the list is what decides.**
- **SCOPE DECLARED IN BOTH DIRECTIONS:** `citation_head_check`, `citation_reach_check`, `fraction_check` still
  glob and are LEFT that way — each declares `'ratchet': []`, and for a pure defect count seeing an untracked
  draft organ is a **feature** (loud failure on a file that will not ship, vs a silent miss of a tracked one).
  Each carries **the trigger as a comment on its own glob line** — the line that would have to change — not
  only in a header nobody adding a ratchet reads.
- **NOT MECHANISED — CONSIDERED AND DECLINED ON EVIDENCE, WHICH IS NOT THE SAME NOTE AS A HELD SHAPE** (user
  ruling, second turn: *"Don't build the checker — and the reason is that the ratchet already is that guard…
  Record the decline with that reasoning, though, not just the shape. The idea is good enough that someone will
  have it again, and a held shape reads as 'not yet' where this is 'considered and declined on evidence.' Those
  want different notes."*). The checker is buildable — the property is decidable from source text (a tracked
  `.claude/*.py` that both calls `glob.glob` and declares a non-empty `ratchet`) and would have named all four
  sites by inspection. **The mechanism that makes it unnecessary:** a glob-derived floor counts untracked files,
  so it records a number higher than the tracked corpus supports; **on a clean checkout the count comes back
  LOWER, and a lower count is exactly what the ratchet fires on — loudly, with a named metric, one checkout
  away.** So a fifteenth member catches at AUTHORING time what the chain already catches at CHECKOUT time:
  **earlier is nicer, and nicer is not load-bearing.** The other polarity was checked rather than assumed — the
  only way a glob sees FEWER files than the index is a *tracked* file deleted from the working tree, and then
  `SHRANK` fires in the author's own tree (`internal_quote_check` and `pointer_check` skip a missing file via
  `os.path.exists` and still reach the count; `extract_citations` raises, and a gate with no DONE line is a
  refusal). **Declared cost:** later detection, an indirect diagnosis (`SHRANK`, not "your floor came from an
  untracked file"), landing on whoever clones next. **The reusable bar: "the existing guard already fires on
  this" is enough to decline a new instrument** — the same reasoning that stops the chain at four layers, one
  level down. Recorded in `battery.py`'s sidecar block and CLAUDE.md, both explicitly contrasted with the two
  genuinely HELD shapes (the sidecar reader; the marker token) so a later session does not read "no" as "not yet".
- **AND WHERE THE FIX IS A SPECIFIC LINE, THE NOTE GOES ON THAT LINE** (user ruling, same turn: *"putting the
  trigger comment on the glob line itself rather than only in a header is the part that will actually work…
  a comment on the exact line that has to change can't be missed by the person changing it"*). Recorded in
  `battery.py`'s labelled block, where an instrument or matcher author is told to read, as the refinement to
  "one designated location": **necessary and not sufficient**, because the family enumeration's own same-bug
  pair broke twice one day apart with the lesson already written at the site that fixed it — the person editing
  a *different* file never opened that header. **With the checker declined, the comment on the line IS the
  mechanism**, which is why each of the three still-globbing counters now says so at its glob line.
- **THE PROCEDURAL HALF, in `commit_checked.sh` beside the sequencing rule** (the user: *"the same family, one
  layer down"*): **GATE THE TREE YOU'RE COMMITTING, NOT THE TREE YOU'RE WORKING IN.** The sequencing rule
  decides which COMMIT a thing lands in; this decides which TREE the gate ran over, and they diverge the moment
  an untracked file exists. The bad floor was caught by moving the draft aside and re-running, **and by nothing
  else.** Not mechanisable: no gate can tell a draft-to-exclude from a file you forgot to stage. Cost of
  obeying: one `git status --porcelain --untracked-files=all` before the gate.
- **DECOUPLE THE MARKER FROM THE HEADING — RECORDED AS A SHAPE, NOT DONE** (`record_sync_check.py` header), on
  the user's ruling that it is *"a change across nineteen pairs, so record it as a shape rather than doing it —
  same treatment as the sidecar reader before it had a producer."* A dedicated token the checker looks for
  would leave headings as free prose. **Why it recurs by design:** the sweep's rule says name the referent, the
  uniqueness rule makes some names unquotable, and **nothing at the site tells an author which headings are
  markers.**
- **THE USER'S REFRAMING OF YESTERDAY'S REFUSAL, which is the more accurate reading:** *"the uniqueness rule
  fired on a live attempt to create a duplicate, in prose, on its first real opportunity. That's the guard
  working, not two conventions failing. And the third refusal entry being yours, logged and explained in the
  commit rather than tidied away, is the archive being used exactly as designed."*
- **THE DECLINE AND THE ON-THE-LINE RULE ARE COMMITTED AS `8d070c7`** (prose and comments only — the three
  glob lines still glob, `record_count.json` untouched, both pre-commit runs byte-identical and the commit
  gate green at `0 problems`). **`8d070c7` IS NOT PUSHED and no push authorization is held**, so layer four
  is red again by the same rule as always. It carries the 4th refusal-log entry, which is legitimate and
  explained in its message.
- **STATE:** layers 1-3 green (both gate runs `0 problems`, 14/14 instruments, all DONE lines and sidecars
  byte-identical between runs). **`74277c5` IS PUSHED** on a fourth one-use grant (*"Push authorized for
  `74277c5`."*) and **all four layers are green** — `deploy_check` matched every asset to `74277c5` and reported
  `0 problems`. That grant is now spent like the three before it. A 4th refusal-log entry exists and is
  legitimate: my own deliberate pre-push `deploy_check` run, logged as `NOT PUSHED: HEAD 74277c5 != origin/main
  838746e`, which rides into the next successful commit because `commit_checked.sh` stages the log.

## LUAD CLOSED AND THE ccf UNIT RE-SPECIFIED (2026-09-07, on *"Go when you're ready — LUAD, then the ccf unit"*)

**THREE COMMITS, ALL LOCAL-ONLY — `origin/main` IS STILL `8d070c7`, SO LAYER FOUR IS RED AND EVERY PUSH GRANT SO FAR
IS SPENT.** `37aa47a` (LUAD) → `1145d01` (ccf unit) → `7de8f07` (ratchet raise). Battery green at `0 problems` on
each; worktree clean at `7de8f07`.

> **SUPERSEDED, and annotated rather than rewritten (2026-09-07, later the same day).** All three DID reach
> `origin/main`, which is now `7de8f07` — verified live, not inferred. The paragraph above stays as written
> because it was true when written and the sentence *"every push grant so far is spent"* is the durable half;
> only the two commit ids rotted. Two NEWER commits are now local-only — see the next-but-one section. **Read
> `git rev-parse origin/main` before believing any id in this file, including this annotation's.**

- **`37aa47a` — LUAD `CDKN2A loss` SOURCED BY DOWNGRADE.** No percentage in TCGA 2014 measures the event, so the
  entry carries a verbatim superlative plus its counting rule instead of a substituted number — *re-source or
  remove* resolved by downgrade, not by citation-shopping. The fix **propagated one line down**: `RB1 loss`'s ccf
  was corrected in place to name its figure as a mutation frequency, because a counting rule cannot ship beside a
  figure that contradicts it. Record set verified `+1 added, 0 removed`.
- **`1145d01` — THE ccf READ UNIT IS NOW RECORD-PLUS-PROVENANCE-COMMENT**, in both bound homes (`CLAUDE.md` and
  `citations.json:_ccf_read_addendum`). Attachment is **mechanical, and BOTH kinds**: the contiguous `//` block
  above the record's own line, PLUS the block above its container's `const NAME = [` declaration — because the
  bladder defect was in the *second* kind, so an inline-only rule would have reproduced the exact miss that forced
  the re-spec. **The load is clauses PLUS blocks, not clauses TIMES lines** (984 lines read once each, not 117×17).
- **THE FINDING, AND WHY IT WAS DEMOTED: two of batch 3's three `file:line` pointers WERE ALREADY WRONG IN THE
  COMMIT THAT WROTE THEM (`2f35ac8`).** Verified from git, not reasoned about: at `2f35ac8^` the referents sat
  exactly at `bladder.js:232` and `liver.js:251` (the tree the reader read — both right at read time); the *same*
  commit's repair inserted lines above each (+10/−3, +25/−5) and pushed both down; all three pointer strings
  entered `CLAUDE.md` in that one commit; `pancreas.js:206` survived only because pancreas.js is **absent from that
  commit's diff entirely**. Staleness at birth, not drift. **NOT A NEW CLASS** — `internal_quote_check.py` already
  names the identical mechanism about two pointers of its own. New only in POPULATION (prose pointers into
  `js/organs/*.js`, which `pointer_check.py` gives FLOOR ONLY under a declared boundary, so its `530/530` green was
  the boundary behaving as declared).
- **NO NEW INSTRUMENT, ON PURPOSE.** The remedy already exists and is already checked: `internal_quote_check.py`
  takes any repo path as a target and requires the quoted span to occur EXACTLY ONCE, so batch 4 names its unit by
  **SPAN, not line**. Feasibility measured rather than assumed: **116 of 144** records are unique by bare
  `gene:'…'`; 28 need a longer span. No fifth layer.
- **A CURRENT LINE NUMBER WAS DELIBERATELY WITHHELD FROM THE PROSE.** `liver.js:251` drifted a *second* time at
  `fe8d627` (251→271→283). Writing `283` into the very bullet whose conclusion is *name units by span, not by
  line* would violate its own ruling, so the drift is reported to the user and not recorded as repo prose.
- **NEW SCAR — A GREEN GATE CAN RAISE A RATCHET THE COMMIT DOES NOT CARRY.** `1145d01` left
  `.claude/record_count.json` dirty: the battery raised `internal_quote.marked` 14→15 and
  `pointer.pointers` 530→534, and I staged neither. Amend is forbidden, so it went forward as `7de8f07`. Both
  raises were **traced before being committed**, not waved through: +1 marked = the one new QUOTES block; +4
  pointers = the *same two* strings counted as OCCURRENCES in BOTH homes (2 in `CLAUDE.md` + 2 in the mirrored
  addendum), because `pointer_check` counts occurrences, matches `file:N` *and* `file#N`, and scans the manifest's
  `_`-prefixed prose keys too. **`set unchanged` does not mean no sidecar moved** — that inference is what caused
  the miss.
- **`Supplementary Fig. 10` IS UNREACHABLE BY FETCH** (three PMC URL forms + Europe PMC `supplementaryFiles`; HEAD
  requests only, nothing downloaded). Recorded as unreachable, **not as a refutation** — the consequence is that
  panel.js question (2) cannot be settled on LUAD's own evidence.
- **BOTH RULINGS ARRIVED AND ARE CLOSED — see "THE TWO RULINGS EXECUTED" below.** (a) RB1 REMOVED, on the
  reasoning that *"the mechanistic claim isn't being imported — the atlas already makes it in LUAD's own
  voice."* (b) The load instrument DECLINED, with the measurement saved as a declared non-instrument script.
  The bullet below is the state of the question at the time it was put, kept because it records what was
  *known* before the answer — not an open item.
- **AWAITING RULINGS (not taken unilaterally):** (a) panel.js question (2) — whether `RB1 loss` leaves LUAD's
  private pool as duplicating CDKN2A's pathway. **`skin.js:353` is a direct in-corpus precedent for the same gene
  pair**, excluding RB1 because *"it duplicates the CDKN2A branch gene's own pathway"* as a **SOFT exclusion,
  mechanistic-fit class, explicitly NOT exclusivity**, with the non-significant OR recorded — and mechanistic
  redundancy needs no import, unlike empirical exclusivity. But the phrase *"TCGA scores them jointly as
  RB1/CDKN2A cell-cycle"* is the *melanoma* paper's convention: the pathway biology transfers, that source wording
  must not be re-cited for LUAD. Removing the gene changes generated output and lowers the citation ratchet, which
  must then be lowered deliberately with removed records READ, not counted. (b) whether to build an instrument
  that prints the ccf load, moving it from commit-bound prose (4th-best allowed form) to a quoted DONE line
  (best), at the cost of `.claude/` 29→30 files and 15→16 declared instruments — a **member of layer one, not a
  fifth layer**, so it does not breach the four-layers rule.

## THE TWO RULINGS EXECUTED — `ad134b3` + `d35464a` (2026-09-07, **PUSHED + DEPLOY-VERIFIED, ALL FOUR LAYERS GREEN**)

**PUSHED on a fresh one-use grant ("Push authorized.") and layer four verified at `d35464a`:** `DONE
deploy_check: 27/27 assets byte-matched to HEAD d35464a, 31 hotspots live, 0 unexplained page errors (2
declared-benign), 0 problems`. **THE GRANT WAS SPENT ON EXACTLY THE TWO COMMITS THE USER HAD IN VIEW** — the
same message asked for new recording work, and rather than let a third commit ride along on an authorization
given before it existed, the recording went in afterwards as `bd40665` and waits for its own grant. A per-action
grant covers the state at the time it was given.
- **Pages needs a rebuild window.** The first `deploy_check` run right after the push reported **2 problems**,
  both `NOT PUBLISHED: bytes differ` on the two files the commits changed (`lungs.js`, `panel.js`) — that is
  the gate working, not a fault. Green ~150s later. Do not read the first post-push run as a failure.

`origin/main` was `7de8f07` before the push. Battery `0 problems` on each commit, worktree clean at both.

- **`ad134b3` — RB1 OUT OF LUAD'S PRIVATE POOL, matching `skin.js:353`'s FORM exactly**: a SOFT exclusion on
  mechanistic-fit grounds, recorded as explicitly NOT an exclusivity claim, with TCGA 2014's silence recorded
  **as silence rather than as support**, and citing **the p16–CDK4/6–RB axis** rather than the melanoma paper's
  joint-scoring wording — the pathway biology transfers, that source's phrasing does not. Pool now 4 members;
  `RB1` occurs once in `lungs.js`, in the exclusion comment. The removal set was **read individually before
  the ratchet was touched** on the user's rule *"a removal is a fix or a loss and only reading distinguishes
  them"* — and reading showed **no lower was needed**: 11 keys out / 11 in, **10 pure moves**, one genuine
  swap (`−TCGA|2014|lungs.js:218` / `+Serrano|1993|lungs.js:226`), total held at 488.
- **ONE +21-LINE INSERTION BROKE THREE LINE-KEYED IDENTITIES AT ONCE, AND THE THREE CONSUMERS DISAGREED ABOUT
  IT.** `record_keys` saw MOVED and said nothing; `pointer_check` reported 5 refs OFF LINE; the paren ledger
  turned **ONE unmoved span into TWO problems** (STALE at `:236` + UNSCORED at `:259`). Repaired **by content,
  not by arithmetic** — and that mattered: `pointer_check`'s "nearest candidate" hint was **wrong on one of
  the five** (it named Yoshizawa|2011 at `253`, offset +17, because that name+year occurs twice; the answer
  was `259`). **BASIS STAYED FIT** through the re-addressing: *an address is not an identity*, and scoring a
  span as TEST because its line number moved would manufacture support for the very rule it withholds support
  from. `battery.py`'s like-named fixture strings were **deliberately left alone** — *an address is
  load-bearing only where something resolves it.*
- **A DATED TRANSCRIPT WAS LEFT WRONG ON PURPOSE.** The quoted run output at `citation_paren_ledger.py:93`
  still says `:236`; it is annotated, not corrected, because it is what the run printed and the recipe still
  reproduces (every step matches on TEXT). *Rewriting a dated transcript to agree with a tree it predates
  would make it a worse record, not a fresher one.*
- **`d35464a` — THE LOAD INSTRUMENT DECLINED, THE MEASUREMENT SAVED**: `.claude/ccf_load.py`, a **declared
  non-instrument** (asserts nothing, ratchets nothing, no sidecar, no failing exit). The user's bar: *"the
  existing remedy already prevents the failure mode… what an instrument would add is freshness, which is
  nicer and not load-bearing."* Recorded as CONSIDERED AND DECLINED — **not as a held shape** — with the
  reasoning, the cost (a 16th instrument + another sidecar), and the trigger comment on the two lines that
  would have to change, with `CLAUDE.md`'s commit-binding clause **quoted verbatim** there rather than
  pointed at by position. NON_INSTRUMENTS 14→15, `.claude/` 29→30, instrument count unchanged.
- **THE SAVED SCRIPT EARNED ITSELF IMMEDIATELY, IN THE DIRECTION THAT ARGUES FOR SAVING IT.** Its first draft
  disagreed with all four load figures and **was about to report the RECORD as wrong**. Attacking the script
  instead: array-opener variants all measured identically, so the discriminator was the **POPULATION** —
  the draft scored the 117 ccf-carrying records where the record had scored all 144 `gene:` records. The prose
  said *"they"* with two candidate antecedents, **and that one word was the entire disagreement.** The record
  reproduced exactly. `--verify` now re-measures `37aa47a` against 7 transcribed figures and refuses to agree
  quietly: `DONE ccf_load --verify: 7/7 figures reproduce the record bound to 37aa47a, 0 mismatched`.
- **THE PRECEDENT NAMED IN THE RULING IS NOT CITABLE FROM HERE — which is NOT the same as not existing, and
  I first reported it the wrong way.** The user cited *"the `pointers.py` precedent — a script whose output is
  evidence rather than a gate."* I reported that no such file exists. **It does**: `/tmp/atlas-guard/pointers.py`,
  8981 bytes, saved during the pointer census, on this disk right now. The defect was calling it a **precedent**
  — in the user's correction, *"a file outside the repo can't be a precedent for how to declare something inside
  it. That's the tracked-set rule applied to my own reasoning — untracked things aren't part of the corpus,
  including the corpus of conventions."* **THE FILE'S PRESENCE IS WHAT MAKES THE POINT**: presence on one
  machine is not the test, being in the index is, because a precedent must be findable by a fresh clone for the
  same reason a ratchet floor must be reproducible by one. The real exemplars are **`figure_search.py` and
  `extract_citations.py`** (and note the trap: `pointer_check.py` IS tracked and IS an INSTRUMENT, so citing
  it would import the opposite standing). **Recorded now in `CLAUDE.md` as an extension of the fourth
  declaration property.** Lesson about my own reporting: **name which half of a ruling an error touches** —
  "your precedent doesn't exist" invites re-litigating the decision; "your precedent isn't citable from here"
  asks for a fixed citation. The verdict was never in question.
- **BROWSER VERIFICATION IS NOT AVAILABLE FOR THIS REPO IN THIS SESSION, and the substitute is real.** The
  Browser pane resolves `launch.json` from `~/app`, so `preview_start {name: "cancer-atlas"}` fails with a
  server list from a different project; the repo's own `.claude/launch.json` (port 3055, deliberately ≠ the
  battery's 3057) is invisible to it. Starting a server by hand is out. **The regression is the substitute:**
  it loads the real page headlessly, asserts `hasTrunk && !hasUndefined` for all 16 cancers, and **writes a
  screenshot per panel** — read directly from `$TMPDIR/atlas-battery/regress/04_cancer_luad_panel.png`, the
  LUAD panel renders trunk KRAS / branch STK11 / private section now leading with CDKN2A loss, no `undefined`.
  **`$TMPDIR` on macOS is NOT `/tmp`** — `/tmp/atlas-battery` holds a stale Sep-5 copy, and reading that
  would have "verified" a two-day-old tree.
- **THE FIFTH RATCHET PROPERTY IS NOW WRITTEN IN `CLAUDE.md`**, in the form the user ruled it in: **`set
  unchanged` reports the record SET, not the sidecar METRICS.** They move independently, and reading one as
  covering the other is what left `record_count.json` dirty at `1145d01`. The user chose this over the vaguer
  *"check the tree after the gate"* precisely because it is checkable. **The remedy already existed in the
  tool's output** — the battery had printed the metric and the exact `git add` — so this was an unread line,
  **not a missing layer, and no layer was added.**
- **CONSIDERED AND REJECTED: restoring `record_count.json` to force a fresh delta into the DONE line.**
  `commit_checked.sh` stages only `.claude/refusals.log`, so the battery's rewrite would have landed
  **unstaged — reproducing the `1145d01` bug exactly.**

## THE EXIT-CODE RULE — `873baec` (2026-09-07. **The parenthetical here read LOCAL-ONLY, LAYER FOUR RED, NEEDS A FRESH GRANT until 2026-09-08, when the grant arrived: PUSHED and layer four green,** `DONE deploy_check: 27/27 assets byte-matched to HEAD 873baec, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems` — **first run, no Pages wait, and that was PREDICTED rather than observed**: the changed set was two `.claude/` scripts and the served-asset filter matched neither, so the intersection was empty. See the sharpened trap note recorded under `65a7a36`.)

Two sites, each the line that would have to change; 38 lines added / 0 removed; battery `0 problems`, no
ratchet, tree clean. **The rhythm is now established and worth naming: each turn authorizes a push for the
commit then in view, and the same turn's new recording work becomes the next commit awaiting the next grant.**
Deliberate — a per-action grant covers the state at the time it was given, so a commit created afterwards
does not ride along on it.

- **`run_checked.sh` header gets the primary rule** — *the exit code is the verdict; the output is
  commentary* — placed there because the header's opening failure (*grep for FAIL, get nothing, read it as a
  pass*) **keeps recurring one level up at the CALLER**, where the wrapper cannot reach it. Includes the
  `; echo "exit $?"` mechanism and the demotion of tree-and-log to corroboration.
- **`deploy_check.js` gets the Pages trap at the `NOT PUBLISHED` line**, with the measured ~150s, the user's
  framing of *why* it is the dangerous moment, and **a written discriminator instead of judgement**: a rebuild
  delay can only affect assets the push CHANGED.
- **THE RULE PROVED ITSELF ON ITS OWN COMMIT.** That commit's gate ran as the last statement of the
  background command, so the harness notification carried `exit code 0` as `commit_checked.sh`'s real verdict —
  where the previous attempt's `; echo` had reported 0 for a run that failed.

## THE RECORDING COMMIT — `bd40665` (2026-09-07 — **PUSHED, layer four green:** `27/27 assets byte-matched to HEAD bd40665 … 0 problems`, first try and no Pages wait, because none of its three files is a served asset)

Prose and comments only, 107 lines added / 0 removed across `CLAUDE.md`, `.claude/battery.py`,
`.claude/ccf_load.py`. Battery `0 problems`, no ratchet raised, tree clean. Four things the user asked to have
recorded, each put where it binds rather than in a changelog:

- **The three-consumers finding is now PROCEDURE in `CLAUDE.md`**, its own section (*"no single instrument's
  output is the worklist for a line-shift repair"*) with the consumer/question/answer table, the union rule,
  **problem count ≠ site count**, and the not-repaired classes.
- **`ccf_load.py`'s justification replaced with the one that survives re-examination**, and the freshness
  argument **kept where it was made with a forward pointer** so a reader cannot stop at the weaker reason.
- **The `pointers.py` correction as an extension of the FOURTH declaration property**, not a new one — the
  tracked-set rule applied to reasoning.
- **The `$TMPDIR` near-miss on the line that defines the path** (`battery.py`'s `WORK_DIR`), plus a note on
  `REGRESS_OUT_DIR` saying it is this repo's visual-evidence path and why (the Browser pane can't reach here).

- **NEW SCAR, AND IT IS A REPORTING ONE: `commit_checked.sh` STAGES NOTHING BUT `refusals.log`, SO AN UNSTAGED
  TREE MAKES `git commit` FAIL — AND I NEARLY REPORTED THE FAILURE AS A SUCCESS.** The first attempt ran the
  full 4-minute gate green and then printed `COMMIT_CHECKED: git commit failed (exit 1)`; nothing was in the
  index because I had not run `git add`. **My grep for the verdict matched selftest arm descriptions
  containing "refus" and was truncated by `head -5`, so it never showed the real line** — the
  *capture-narrower-than-the-claim* lesson firing again, on the very session that wrote a section about
  reading instrument output correctly. **`git status --porcelain` and `git log --oneline` are what caught it.**
  THIS SENTENCE CALLED THAT "the general rule" UNTIL 2026-09-07, when the user demoted it: tree-and-log reads
  the CONSEQUENCE, so it cannot generalise to an instrument whose result is not a git object. **The general
  rule is that the exit code is the verdict and the output is commentary** — recorded at `run_checked.sh` under
  `873baec`; tree and log are independent corroboration, which is exactly what they were doing here.
  Cost: one extra full gate run. **Stage first, then invoke the gate** — the tool not deciding what belongs in
  a commit is the design, not a bug.

## THE SERVED-ASSET SHARPENING AND THE REMOVAL RULE AT ITS REAL WIDTH — `65a7a36` (2026-09-08. **This parenthetical read LOCAL-ONLY, LAYER FOUR RED, NEEDS A FRESH GRANT; the grant arrived and `65a7a36` is now `origin/main`.** Corrected in place, per the same precedent the `873baec` entry above sets — a state line left standing after the state moved is the drift this file exists to prevent.)

Comments only, 31 lines added / 0 removed across `.claude/deploy_check.js` (15) and
`.claude/extract_citations.py` (16). Gate: `DONE battery: phase pre-commit — … 488 citation records extracted
(ratchet 488 held; set unchanged), … 0 problems`. No ratchet raised, tree clean, exit 0 read as the verdict.

- **THE PAGES TRAP GETS ITS DECIDABLE FORM, AND THE USER'S RULING IS THAT THIS IS THE VERSION TO KEEP.** The
  note written the day before said a rebuild delay can only affect assets the push CHANGED — true, and still a
  timing heuristic, because **it only ever tells you to WAIT**. The sharp form: *the wait is not a property of
  pushing, it is a property of pushing a SERVED asset.* The set that can legitimately appear is
  `changed ∩ headTextAssets()` — the filter the gate already applies four lines above — so it is computable:
  `git diff --name-only <old origin/main> HEAD | grep -E '^cancer-atlas\.html$|^js/.*\.js$|\.css$'`.
  **IF THAT SET IS EMPTY, EVERY FINDING IS REAL.**
- **THE REASON IT IS BETTER IS THE DIRECTION IT FAILS IN** (user): the weak form sends someone to re-run 150s
  later into exactly the same red on a `.claude/`-only commit, **and the waiting LOOKS like diligence**. The
  sharp form tells you *when waiting is wrong*. Kept BELOW the weaker paragraph rather than replacing it,
  because the weak form is the reasoning a reader arrives with — better visible and superseded than absent.
- **IT MADE A PREDICTION AND WAS RIGHT WITHIN THE HOUR.** `873baec`'s push touched two `.claude/` scripts,
  intersection empty, and layer four came back 27/27 on the FIRST run with no wait. Recorded at the line as
  *what an empty intersection predicts, not luck, and not a reason to relax*.
- **THE READ-EVERY-REMOVAL PROCEDURE IS ABOUT REMOVALS, NOT ABOUT RECORD SETS** (user ruling), so it is
  restated at `extract_citations.py` at its real width: **prove the information survives elsewhere before
  removing it here.** Every part of the argument already generalised — a removal is a FIX or a LOSS, a count
  cannot tell them apart, only reading the removed thing against where it is supposed to already live can —
  and none of it mentions citations. See [[feedback-prove-it-survives-before-removing]].
- **Its prose demonstration, and the check that made it honest.** The `MEMORY.md` compaction (20.2KB → 13.5KB)
  grepped every distinctive string in the topic file supposed to already hold it **before** the cut. The
  honest check was **not the byte drop but the ENTRY COUNT, which went UP (20 → 21)**; size falling while
  entries fall too is the loss case wearing the fix's clothes.
- **THE DIRECTION OF THE BORROWING IS WRITTEN DOWN**, because it otherwise reads as a fourth-property
  violation later: that note forbids the INWARD direction (an untracked file as precedent for an in-repo
  declaration), and this is a tracked rule governing a removal elsewhere. **Outward is free; inward needs the
  index.**
- Flow note: cwd drifted to `~/app` mid-verification for the second time this session and `git log` died with
  `not a git repository`. Harmless because it fails loudly — but it is why every command here is `cd`-prefixed.

## PERSONAL MEDICAL DOCUMENTS FOUND UNTRACKED — MOVED OUT OF THE REPO, ON THE USER'S RULING (2026-09-07/08 —
redacted 2026-09-15, see below)

Personal medical documents belonging to a family member were found untracked in the repository working
tree. Ruling: move them out of the tree entirely — do not gitignore, do not delete, as they may be sole
copies. Verified by content hash across all refs that none was ever committed. Filenames and the quoted
discussion are deliberately omitted from this record.

**This redaction is intentional, not an omission to fix.** An earlier version of this section named the
family member, quoted the exact filenames, and reproduced the ruling's own prose verbatim — all of it
still true and still worth the lesson, none of it safe in a file meant for a public repository. Found and
scrubbed on 2026-09-15, before this package's own first commit reached `origin/main` for good (a first,
short-lived push had already carried it; see `STATE.md` for the remedy and what a force-push does and does
not undo). If you are a future session reading this and thinking the omitted detail would make the lesson
clearer: it would not change the ruling, and restoring it would recreate the exact leak this note exists
to prevent. Leave it out.

**The lessons this incident produced, kept in full because none of them depend on the identifying detail:**
- **The original verification measured the wrong population, and that is the lesson, not the underlying
  typo.** A check confirmed the files had left their OLD PATHS and was reported as confirming they had left
  the TREE — a weaker claim that was true while the conclusion drawn from it was false, and the conclusion
  was the *wanted* one. The ruling this produced: **for anything safety-relevant, ask what was measured
  rather than what was concluded.** The tree-scoped check that actually settles it:
  `git status --porcelain --untracked-files=all` plus a `find` for the relevant extensions inside the repo,
  both empty. See [[feedback-verify-state-not-assumed-truth]].
- **A history re-check over filenames must be null-delimited.** A first content-hash pass over history split
  space-containing filenames into nonexistent paths and would have reported the most sensitive files in the
  set clean by accident. Redone null-delimited, every file resolved to zero commits, never committed. Any
  per-file loop over a population like this must be `-print0`/`-z`; a whitespace-split loop reports the worst
  cases as fine.
- **`.gitignore` was rejected as the fix, and the reason generalises past git.** The ruling: `.gitignore` is
  a git-level guard on a directory whose entire purpose is publication. The files would still sit inside the
  working tree, readable by every tool, script, and agent operating there — including this one. The fix
  isn't to make git ignore them; it's for them not to be in a repo at all. **A repo directory is an
  agent-readable surface, not just a publication surface** — an ignore rule addresses only the second.
- **Don't delete anything that may be a sole copy.** Move, never delete.
- **Flagging rather than acting was explicitly endorsed.** Moving someone's personal documents unasked isn't
  an agent's decision to make alone. The hazard was real and the remedy still needed a human's word.
- **The original hazard, kept because it is the thing to avoid re-creating:** any `git add -A` or `git add .`
  in a working tree holding personal files would publish them to a public GitHub repo. `commit_checked.sh`
  stages only named files (plus its own tracked, declared machine-state set), so the gated path could never
  have captured them — a hand-typed `git add -A` would have.

## BATCH 4 RAN AND THE RE-SPECIFICATION CAME BACK NEGATIVE (2026-09-08 — **this parenthetical read `4349613` + `a3088be` + `1f93b9b` ALL LOCAL-ONLY, `origin/main` = `65a7a36`, LAYER FOUR RED, EVERY PUSH GRANT SPENT, write-up NOT yet written and awaiting a ruling. THE RULING ARRIVED: all three are pushed, the write-up is written and committed, and the whole arc closed at `a44ebc1` with all four layers green** — see the section below. Corrected in place, the same precedent the `873baec` and `65a7a36` entries above set.)

Three commits landed the machinery and the pre-registration; **no repair and no write-up is in them.**
`4349613` fourth property + single-writer practice. `a3088be` batch 2's sample is unreplayable, so
`--frame`/`--draw`/`--touched-by` go into `ccf_load.py` (no 31st `.claude/` file, no 16th instrument).
`1f93b9b` the pre-registration itself. All three gates exit 0 first try. Served-asset discriminator
computed BEFORE any push and EMPTY across all three (`.claude/` + `CLAUDE.md` only) — so **any
`deploy_check` finding on these would be real, not Pages lag.**

**THE DRAW, run verbatim at the registered seed after the pre-registration was committed:** frame
`a3088be`, seed `int('a3088be',16)` = 170952894, 6 of 86 eligible in the comments stratum, 6 of 48 in
the none stratum, 9 excluded as already read.

**THE RESULT IS A NEGATIVE ONE, AND IT IS THE POINT OF THE BATCH: 2/6 defects in each stratum, and ALL
FOUR SIT ON THE RECORD LINE. Zero defects in a provenance comment.** The comment half of the
re-specified unit — the whole reason batch 4 existed — contributed nothing on this sample, while costing
real reading effort.

- **comments stratum** (unit = record + its comment blocks): `brain.js:202` ccf qualifier,
  `ovary.js:269` "dominated by" denominator conflation. Both on the record line, both comment halves clean.
- **none stratum** (the CONTROL — new unit ≡ old unit): `brain.js:215` and `prostate.js:231` defective;
  `ovary.js:137`, `ovary.js:147`, `skin.js:406` clean; `skin.js:400` **no defect found AT PARTIAL DEPTH** —
  4 of ~12 citation clusters verified (TCGA, Pollock 2003, Nazarian 2010 quoted verbatim, internal
  arithmetic), the other ~8 unverified. Recorded as partial rather than clean on purpose.

**PRE-REGISTERED PREDICTIONS, SCORED:** (1) comments ≥ none — 2/6 vs 2/6, satisfied trivially by a TIE
and **reported UNINFORMATIVE, as the pre-registration's own inadequate-power declaration requires**;
(2) ≥half of comments-stratum defects in the COMMENT — **0 of 2, FALSIFIED**; (3) the negative was armed
for none coming out HIGHER, and it came out EQUAL, so it did not formally trigger — **but its substance
landed anyway in weaker form, which is why (3) was worth writing.**

**THE UNPRE-REGISTERED HEADLINE, AND THE MOST USEFUL THING THE BATCH PRODUCED: 2 OF THE 4 DEFECTS NEED
NO EXTERNAL SOURCE AT ALL.** They are false claims about the atlas's OWN contents, decidable by `grep`:
- `brain.js:215` — TTN "same as in every other cancer modeled in this atlas" is FALSE. `breast.js` and
  `thyroid.js` carry no TTN record at all, and **`ovary.js:266` explicitly contradicts it with a source**
  ("TTN deliberately absent: zero TTN mentions across four OCCC cohorts totalling 634 tumors").
  9 of 12 TTN records carry the clause; 3 (`ovary.js:149`, `skin.js:408`, `testis.js:231`) are tailored
  without it — a copy-paste artifact, not a reasoned claim.
- `prostate.js:231` — CHD1's ccf cites "the same honesty precedent this atlas's LUAD adrenal gland and
  ccRCC liver/brain sites already use". LUAD adrenal (`lungs.js:203`) ✓ and ccRCC brain (`kidneys.js:145`) ✓,
  but **ccRCC liver (`kidneys.js:143`) carries `~15% of clear cell RCC` — a clean population-wide frequency,
  the exact opposite of the precedent invoked.** A MIS-ADDRESSED pointer, not an invented one: 19 of 116
  ccf fields decline a numeric frequency, and ccRCC has genuine instances at `kidneys.js:184-185`
  (MTOR/PTEN) — just not at the liver site. Chen et al. verifies VERBATIM (Nature Cancer 2025;6(5):854-873,
  PMID 40360905, sentence 2 of the abstract), resolved via E-utilities rather than guessed.

**NEITHER `internal_quote_check.py` NOR `pointer_check.py` NOR THE SOURCE-FETCH WORKFLOW IS BUILT TO CATCH
THAT CLASS**, and it is now the plurality class in the batch. **GUARD BEFORE REPAIR APPLIES:** at least 11
lines are in the repair population (9 TTN + `kidneys.js:186` + `prostate.js:231`) and the guard should
enumerate them, not my hand count. **Fold it into an existing instrument** — a 16th declared instrument is
the cost `a3088be` deliberately refused to pay, and **this is NOT a fifth gate layer either way.**

**OUT-OF-BATCH INCIDENTAL, SAME CLASS, WORSE: `kidneys.js:186`** CDKN2A "the same cell-cycle-checkpoint role
this gene plays in every other cancer modeled in this atlas" — **only 6 of 14 organ files carry a CDKN2A
record; 8 have none.**

**TWO DESIGN FINDINGS AGAINST THE PRE-REGISTRATION ITSELF, both disclosed rather than buried:**
- **UNIT SIZE MEASURES COMMENT ATTACHMENT, NOT READING LOAD.** `skin.js:400` is unit=1 yet carries ~12
  citation clusters, so "the none stratum is cheap" was wrong and **the strata are not effort-matched** —
  an unnamed confound, and equal effort per record buys UNEQUAL verification depth.
- **STRATUM SEPARATION CANNOT BE ENFORCED AT READ-WINDOW LEVEL.** `brain.js:215` (none stratum) was visible
  while reading `brain.js:124-218` for a comments-stratum unit. Contamination disclosed, not denied.

**STILL OPEN FROM THE BATCH:** `brain.js:202` and `ovary.js:269` (both need SOURCE re-reading, not a corpus
grep, and both are still open at `a44ebc1`); resolving `Chao 2024` → `BMC Cancer 2024;24(1):1403, PMID
39543535 / PMC11566382`; `thyroid.js:257`'s 42.4% vs source 42.2%; `brain.js:200/204/206` EGFR/PDGFRA
qualifiers. `brain.js:215`, `prostate.js:231`, `kidneys.js:186` and the 9 TTN copies are REPAIRED at
`d17a15f`.

## THE REVERSION RULING EXECUTED — `d17a15f` + `a44ebc1` (2026-09-08, **BOTH PUSHED, ALL FOUR LAYERS GREEN:** `DONE deploy_check: 27/27 assets byte-matched to HEAD a44ebc1, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`)

**THE USER OVERTURNED THEIR OWN RE-SPECIFICATION on batch 4's evidence, so RECORD-ONLY IS THE DEFAULT ccf
UNIT FROM BATCH 5.** Their reasoning, worth keeping because it is a rule about pre-registration and not
just about this unit: the bladder case that motivated the re-specification "was real, but it was n=1, and
one instance is what a pre-registration exists to keep from becoming a rule."

**WHAT SURVIVED IS NARROWER AND IS A GREP, NOT A READ UNIT:** a comment block that CONTRADICTS its own
record — the internal-inconsistency shape, **five instances as of `a44ebc1`**, the fifth being
`fraction_check.py` holding the correct `283/357` in its own header while structurally unable to catch the
wrong one. User's words: "Reading the comment half found nothing; comparing the two halves mechanically
would have found bladder." **NOT YET BUILT — this is the next instrument-shaped item.**

**NONE OF THE ATTACHMENT MACHINERY WAS REMOVED, and `ccf_load.py` names the single line (`stratify()`'s
`len(r['unit']) > 1`) that would have to change if record-only ever became a REMOVAL instead of a default.**
Three live reasons it stays: `--stratum` is batch 4's REPLAY (re-run at the registered seed and it
reproduces the twelve units exactly); the load figure is comment-inclusive by construction with `--verify`
binding it to `37aa47a`; and the surviving contradiction class needs both halves present at once.

**THE SOURCE-FREE CLASS IS GUARDED, AND THE INSTRUMENT COUNT HELD AT FIFTEEN.** `absence_claim_check`
ABSORBED it on the user's positive-mirror argument (a universal claim and an absence claim are the same
object — an unscoped quantification over a population). Two tiers: DEFECT-FALSE-UNIVERSAL fails, and
UNIVERSAL-UNRESOLVED prints without failing, deliberately, because a tier that failed on claims it cannot
adjudicate would force a rewording to go green — citation-shopping wearing a gate's clothes.

**GUARD-BEFORE-REPAIR RAN PROPERLY AND THE ORACLE WAS ATTACKED FIRST.** Built → fired on 11 → attacked the
measuring script → found it over-firing on `skin.js:408` (a COMPARATIVE/superlative corpus claim, where
resolving gene presence answers a question the claim never asked) → added `COMPARATIVE` → settled at 10 →
repaired → green. **The guard's list was not merely different from the hand list of 11, it was BETTER**, and
the two were DIFFERENT tens. Repairs landed in `d17a15f` and the guard in `a44ebc1`, per `pointer_check`'s
ordering: a guard whose own commit turns it green has no evidence beyond a run over output that commit made.

### FLOW LESSONS THIS ARC PAID FOR

- **THE RATCHET MUST BE SETTLED BEFORE STAGING, NOT AFTER.** `commit_checked.sh` stages only
  `refusals.log`, so a metric the gate's OWN run raises lands outside the commit that raised it. It bit
  `d17a15f`: those repairs added no pointers, yet the pointer floor moved anyway **because the UNSTAGED
  guard's header did** — `pointer_check` takes its FILE LIST from git but its CONTENT from disk. Fix, used
  for `a44ebc1` and it worked: run a standalone `battery.py --phase pre-commit` FIRST, `git add
  .claude/record_count.json` with the files that moved it, then `commit_checked.sh` finds the floor held.
  Costs two ~4.5-min battery runs; amend is forbidden, so the alternative costs a whole forward commit.
- **A CHEAP PRE-FLIGHT BEATS A 4.5-MINUTE GATE.** Running `ccf_load.py --verify` and `pointer_check.py`
  standalone (seconds each) caught nothing this time but would have caught a novel prose-pointer form
  before the gate did. NOTE: `.py:LINE` is NOT an established pointer form anywhere in this repo — write
  "`fraction_check.py`'s own header", not `fraction_check.py:13`, or invent a form the guard may reject.
- **A DETAIL LOST TO COMPACTION IS RECOVERABLE TWO WAYS:** the pre-registered draw is DETERMINISTIC, so
  re-running the two `--stratum` commands returns the exact sample; and the session transcript JSONL under
  `~/.claude/projects/…/<id>.jsonl` can be mined with a small Python filter. Prefer both over inventing.
  `grep -oE` with a large `{0,N}` window blows up ugrep's complexity limit — parse the JSON instead.

## THE FALSE-UNIVERSAL RULING SET EXECUTED — `5cef237` + `e770a94` (2026-09-08, **BOTH PUSHED, ALL FOUR LAYERS GREEN:** `DONE deploy_check: 27/27 assets byte-matched to HEAD e770a94, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`)

Range pushed `a44ebc1..e770a94`; that one-use grant is **SPENT**. Repairs first (`5cef237`),
instruments second (`e770a94`) — the same split as `d17a15f`/`a44ebc1`, so the fire and the green sit in
different commits. The reasoning for every decision now lives in the two commit messages and at the
lines themselves; what follows is only what a future session cannot re-derive from the repo.

- **A CORPUS INSERTION BREAKS THREE LINE-KEYED STORES, NOT TWO, AND ONLY ONE HAS AN ORACLE.** Adding a
  comment block above a cited line moves (1) `citations.json`'s backfill refs — caught by
  `pointer_check`, because those carry author+year; (2) the batch's own prose pointers — caught by
  nothing, floor-only; and (3) **`citation_paren_ledger.py`'s `PREREGISTERED` keys**, which is the one
  that had been forgotten. It fires TWO problems for ONE unmoved span (STALE at the old address,
  UNSCORED at the new), and this has now happened on two consecutive days to the same Travis span
  (`lungs.js` `236 → 259 → 268`). **Its remediation text tells you to add an entry with basis TEST —
  DO NOT.** `basis_test` is the ratcheted number that measures the rule's only real evidence and it is
  0; scoring a relocation would lift it off 0 on a line-number change. An instrument cannot tell
  arrival from relocation, so the human does, and **the test is the bytes**: same text, one occurrence,
  re-address and keep basis FIT. Also re-address the two selftest pins that name the span.
- **AFTER ANY INSERTION, RUN THE HAND AUDIT BEFORE THE GATE.** Diff the tree, pull every bare
  `organ.js:NNN` off ADDED lines, print what is now at each line, read the list. The bare-form regex is
  `(?<![/\w])([a-z_]+\.js):(\d+)\b` — an audit requiring the `js/organs/` prefix finds none of them,
  because the repo's prose form is bare. This is also how the two PRE-EXISTING wrong pointers surfaced:
  `fraction_check.py` cited a `// =====` separator in `thyroid.js`, and `extract_citations.py` named the
  Travis span's 2026-09-07 address at **four** sites. Both were committed, in range, oracle-less, and
  green on every run since.
- **A DEMONSTRATION OF A BAD REFERENCE BECOMES ONE IF WRITTEN LITERALLY.** Documenting the wrong pointer
  took three passes: the first wrote it in pointer form (re-creating the defect), the second quoted it
  in backticks (still a pointer, still counted, still at a separator line). Write the historical wrong
  value in the residue form — "line 226 of thyroid.js" — which the population deliberately cannot reach,
  and put ONLY the corrected address in pointer form.
- **`git worktree` RESETS THE SHELL CWD** to `~/app`, which is why every command here must be
  `cd`-prefixed or absolute. A throwaway detached worktree at HEAD is still the right way to measure a
  baseline: it proved all 29 pointer flags were mine (HEAD alone was 266/266, 0 flags), which inference
  had wrongly attributed to pre-existing noise.
- **DO NOT REMAP FROM `pointer_check`'s REPORTED LINE.** It names the NEAREST occurrence carrying the
  name and year; for a multi-occurrence citation that is the wrong one. Content-anchor instead (HEAD's
  line text → its unique match in the working file); it self-validates by yielding one uniform delta
  per file.
- **A `; echo "rc=$?"` AFTER A PIPE READS THE PIPE'S LAST STAGE.** `python3 gate.py | tail -4; echo $?`
  reports `tail`'s status. Use `set -o pipefail` and let the tool report the real verdict.
- The 170s wait after pushing served assets was sufficient — layer four came back PUBLISHED first try,
  no NOT PUBLISHED cycle.

Still open after this batch: `testis.js`'s pleomorphism comparison (invisible to the guard, needs a hand
read); `skin.js` and `prostate.js` each have one flagged universal that was outside this batch's scope
and is unadjudicated; the **comment-contradicts-record grep** remains UNBUILT and now has four instances;
then the fetch pair (`brain.js`'s ccf qualifier, `ovary.js`'s "dominated by" denominator conflation).

## STANDING CONSTRAINTS (2026-09-06 — consolidated here so the index can be a hook, not a copy)

Written down because the index line had grown to hold the arc narrative AND these rules, and
compacting it would have deleted them. These are the user's standing rules, restated across many
sessions; they bind until the user changes them.

**Access and identity — verbatim in force:** do NOT create accounts, sign up, register, or
authenticate anywhere; do NOT enter email, password, or personal information into any form. **If a
source is gated behind login, STOP and report exactly what is gated** — no disposable emails, no
bypasses. **Do not bypass or complete CAPTCHAs.** (Applied and recorded: PMC3771322's reCAPTCHA is
logged as gated and was never attempted, which is why the TCGA ccRCC 2013 full-text read stayed
blocked and the ccRCC MTOR/PTEN claim was downgraded instead.)

**Rights:** **quote text; never mirror images** — the repo is public and archiving a pathology plate
is a rights problem, not a style choice. **AJCC staging tables are copyrighted and must never be
reproduced**; use SEER Summary Stage (US-government public domain) instead.

**Sourcing:** **downgrading a claim is always available and always preferable to a weak
substitution** — no citation-shopping. For statistics there is **no illustrative home: re-source or
remove, no middle**. Trials carry a different duty of care: eligibility is not conveyable, and no
endorsement or promise-ranking.

**Git:** **history at and before `a131649` is IMMUTABLE** — it is the raw-asset archive. No squash,
no rebase, no force-push, no blob purge, ever. `commit_checked.sh` is built to lack the flags to try.

**Process:** report findings and evidence **before** committing; the user gives explicit go/hold
rulings. **Quote the gate's DONE line verbatim in commit messages; never restate its numbers** (now
mechanised by `commit_checked.sh`, which writes the quote itself). **Never mutate after a heredoc** —
a command after `EOF` runs unconditionally, so verify and mutate in SEPARATE tool calls. **FORM RULE, NOT VIGILANCE (user ruling 2026-09-08,
after the cd-prefix rule was written and still bit): any command whose output becomes a claim about
the repo uses `git -C <absolute>` or an absolute script path, never relative-plus-ambient-cwd** — see
[[feedback-explicit-form-over-ambient-state]]; the working directory persists between calls and has
drifted into a sibling project directory under the same home directory (a different project that
also happens to have a `.claude` directory) and
into `/tmp` scratch clones more than once, and this workflow keeps `git archive HEAD` snapshots of the same tree
under `/tmp`, so a relative read can silently answer from the wrong copy.

## ACCUMULATED LESSONS — ONE LINE EACH (2026-09-07 — consolidated here for the same reason as the section above)

The MEMORY.md index line had grown to ~6.4KB because it was carrying this whole list, and the auto-memory
index has a size budget. Compacting the index by DELETING these would have lost them, and a few were
recorded nowhere else — so they are written here first and the index is a hook again. Each line is the
lesson; the sections above hold the incident it came from.

**About measurement, and this is the densest cluster because my own instruments were the broken thing twice:**

- **DISTRUST YOUR OWN ORACLE BEFORE REPORTING A DEFECT CLASS.** A loose matcher hides defects; a wrong
  window manufactures them. Separate FLOOR (does it resolve) from IDENTITY (is it the right line).
- **AN UNSAVED MEASUREMENT IS NOT A MEASUREMENT — SAVE THE SCRIPT.** The census's first pass lived in a
  `/tmp` scratch file that is gone, so its 173/45/48 figures cannot be re-derived, audited or corrected;
  they can only be disbelieved. The replacement is a committed battery member.
- **A DATED MEASUREMENT IS NOT A RESTATED MACHINE NUMBER.** "On 2026-09-07 the sweep found 113" stays true
  forever; "there are 113" rots. When a number must appear in prose, bind it to the commit or the date it
  was measured at.
- **A PATTERN'S HIT COUNT IS NOT EVIDENCE UNTIL SOMEONE READS THE HITS.** The `positional` sweep pattern
  fired 31 times and every one was a false positive; the count read like a finding and was noise.
- **DO NOT LET THE CAPTURE BE NARROWER THAN THE CLAIM.** A `tail -32` on a gate run discarded the one DONE
  line the report was about. If the claim is about a specific line, capture in a way that must include it.
  **Fired a second time (`bd40665`) and nearly turned a FAILED COMMIT into a reported success**: a grep whose
  pattern matched selftest chatter, cut off by `head -5`, hid `COMMIT_CHECKED: git commit failed (exit 1)`.
  **THE PRIMARY RULE IS NOT ABOUT GREPPING AT ALL — see the exit-code lesson below**; tree-and-log is
  corroboration, and my first version of this note had the ordering wrong.
- **CORPUS IS ITS OWN CONTROL.** Condition (7) is best met by a check firing on a corpus nobody cleaned,
  not on a fixture — and a guard written after a hand cleanup can never be shown firing at all.
- **A SAVED MEASUREMENT IS A GUARD ON THE SENTENCE, NOT ON CURRENCY — and that is the justification that
  survives re-examination** (user ruling, revising their own freshness argument). Commit-binding says WHEN a
  figure was true; it can never say WHAT WAS COUNTED, because the thing naming the population is prose and
  **prose is checked by nothing**. A re-derivable measurement is the only artefact that can contradict its own
  record. So the instrument was rightly declined (staleness was already closed) *and* the script was rightly
  saved (ambiguity was closed by nothing) — the two remedies are not on the same axis.
- **UNTRACKED THINGS ARE NOT PART OF THE CORPUS OF CONVENTIONS EITHER**, not just of the corpus of files. A
  scratch script that exists on this disk still cannot be a precedent for how to declare something in the
  repo, because a precedent must be findable by a fresh clone for the same reason a ratchet floor must be
  reproducible by one. **And when correcting a cited exemplar, name which half of the ruling the error touched.**
- **WHEN YOUR SCRIPT DISAGREES WITH THE RECORD, THE SCRIPT IS THE SUSPECT — and the usual culprit is the
  POPULATION, not the matcher.** Four figures were about to be "corrected" in `CLAUDE.md`; the record was
  right and the script was scoring 117 records where the record scored 144. **An ambiguous "they" in prose
  can be the entire disagreement**, so a saved script must name its population and carry a known-answer
  `--verify` against a real commit. An oracle with no known-answer case is one nobody has attacked.
- **`$TMPDIR` ON macOS IS NOT `/tmp`.** `tempfile.gettempdir()` gives the per-user folder, so the battery's
  artifacts land there — and a same-named stale directory under `/tmp` will happily let you "verify" a
  two-day-old tree. Check the mtime of any artifact you are about to treat as this run's evidence.

**About reading a gate's answer — the one that recurred twice in a single session:**

- **THE EXIT CODE IS THE VERDICT; THE OUTPUT IS COMMENTARY** (user ruling, 2026-09-07, sharpening a weaker
  rule of mine). Every refusal in this chain is delivered as a NUMBER, and **no pattern a caller invents can
  be more authoritative than the number the tool already returned.** Read `$?`; grep only to EXPLAIN a
  verdict already read, never to establish one. **Two misses in one session makes it the pattern rather
  than the incident** — a backgrounded gate run with a DONE line and no verdict, and `commit_checked.sh`
  exiting non-zero while a truncated grep matched selftest prose. Both were in callers that parsed prose
  when `run_checked.sh` exists precisely so they don't have to.
- **`; echo "exit $?"` DESTROYS THE VERDICT WHILE LOOKING LIKE IT CAPTURES IT.** The shell's status becomes
  the echo's — always 0 — so a harness reporting the command's exit sees SUCCESS with the real code buried in
  text. That is exactly how miss 2 went unread: `$?` was printed and the surrounding report said exit 0.
  **Let the invocation be the last statement, or use `rc=$?; …; exit $rc`.**
- **TREE AND LOG ARE CORROBORATION, NOT THE PRIMARY CHECK.** `git status --porcelain` + `git log` do confirm a
  commit independently, but they read the CONSEQUENCE — which does not generalise to instruments whose result
  is not a git object, i.e. most of them. Verdict first, corroboration second.
- **THE FIRST GATE RUN AFTER A PUSH IS THE MOST DANGEROUS MOMENT IN THE CHAIN**, because the benign
  explanation is sitting right there and is usually true (Pages has not rebuilt; the changed assets serve old
  bytes; green ~150s later). In the user's words it is *"the single most likely moment for someone to wave a
  real failure through."* **The discriminator, now written into `deploy_check.js`:** a rebuild delay can only
  affect assets the push CHANGED — anything else stale is real, and so is the same commit still stale on a
  second run. Wait and re-run ONCE; never explain it away twice. (It only bites when a *served asset* moved:
  `bd40665` touched only `CLAUDE.md` and two `.claude/` scripts and went green first try.)

**About guards and instruments:**

- **BUILD THE GUARD BEFORE THE REPAIR — its output is the worklist.** Repair-then-guard buys a state the
  next content commit silently partially undoes.
- **AN INSTRUMENT NOT INVOKED CANNOT FAIL**, which is why the battery declares its own membership from git
  and why every declared instrument must be shown able to FIRE.
- **A RATCHET CANNOT SEE AN ABSENCE**; coverage floors, not defect counts, are what get ratcheted.
- **DEGRADATION IS WORSE THAN DEATH**: a tool that quietly measures less is more dangerous than one that
  crashes, so every new quiet path gets a loud one.
- **NEAREST IS NOT IDENTITY** — an auto-fixer's best candidate was wrong 4 times, so the guard proposes and
  never applies; and a modal offset is a vote, which gave 2 confident wrong answers off 1–2 votes.
- **A FIXTURE MAY REUSE A REAL POINTER BUT MUST NEVER INVENT ONE** — a hand-maintained exclusion list hid 8
  dangling fixture pointers, and composing the refs from parts closed the class with nothing to keep in step.
- **A POINTER CAN BE RIGHT FOR ONE RECORD AND STALE FOR ANOTHER**, so repairs key to (record, ref), never
  (file, line).
- **AN ADDRESS IS LOAD-BEARING ONLY WHERE SOMETHING RESOLVES IT** — one insertion staled three line-keyed
  identities and left a dozen like-named fixture strings and quoted transcripts correctly untouched. Classify
  the sites before repairing them, and **re-address by CONTENT, never by offset**: the nearest-candidate hint
  is wrong exactly when the name+year occurs twice. **Re-addressing a span is not new evidence** — a moved
  line number must not flip a FIT basis to TEST, or the move manufactures the support the rule withholds.
- **NO SINGLE INSTRUMENT'S OUTPUT IS THE WORKLIST FOR A LINE-SHIFT REPAIR** (user ruling — the strongest
  technical result of the segment, now recorded in `CLAUDE.md` as PROCEDURE, not as narrative). Three
  consumers answered three different questions about one 21-line insertion and **none was wrong**:
  `record_keys` silent (`moved` by design), `pointer_check` 5 OFF LINE, the paren ledger 2 problems from ONE
  span. Take the UNION as the worklist, resolve by content, and remember **problem count ≠ site count**. The
  cost of trusting one output is measured: the hint was wrong on 1 of 5, and both candidate offsets (+17, +23)
  were plausible for a +21 insertion, so arithmetic cannot break that tie and content can.
- **MAKING AN EXISTING SELFTEST RUN AUTOMATICALLY CAN CONVERT A DORMANT HAZARD INTO A LIVE ONE.**
  `commit_checked.sh`'s scratch `git init` had no git-env isolation and was harmless while nobody called it;
  a hook that exports `GIT_DIR` made it dangerous the moment a new caller ran it. Scrubbed at the new caller.
- **A REFUSAL IS A LOG, NOT A LAYER** (`7455aaf`) — the archive of refusals is evidence, and a guard that
  refuses EARLIER made the archive blinder until misinvocation was logged too.
- **THE THREE PROPERTIES OF A DECLARATION**: (1) evidence at the site, (2) a visible retirement path,
  (3) membership verified against reality — property (3) is what makes a stale declaration a defect.
- **THE GATE CHAIN IS FOUR LAYERS ON PURPOSE** (battery -> `run_checked.sh` -> `commit_checked.sh` ->
  `deploy_check.js` = the SET, each INVOCATION, the COMMIT MESSAGE, the DEPLOY). **Do not add a fifth**, and
  **"the existing guard already fires on this" is enough to decline a new instrument.**

**About records and prose:**

- **DECLARE, MEASURE AND DIFF EVERY REMOVAL — and READ every removal.** Any change to extraction reach diffs
  the record set line by line.
- **A MACHINE-DERIVABLE NUMBER RESTATED IN PROSE WILL DRIFT.** Delete the duplicate, else point at the source
  of truth, else quote the producing line verbatim, else date it.
- **A DECLARED UNIQUE MARKER MAKES ITS OWN HEADING UNQUOTABLE** — cite a different span of the title, or name
  the rule and its date. The structural fix (a dedicated token) is recorded as a shape, not done.
- **WHERE THE FIX IS A SPECIFIC LINE, THE NOTE GOES ON THAT LINE.** One designated block is necessary and not
  sufficient: the same-bug pair broke twice one day apart with the lesson already written at the site that
  fixed it, because the person editing a different file never opened that header.
- **THE `READ THIS BEFORE WRITING A NEW INSTRUMENT, OR A NEW MATCHER` BLOCK in `.claude/battery.py` is the
  designated home** for the sidecar convention, the scratch-path rule and the anchor rule. Read it before
  writing either.

## INDEX-LINE STATE AS OF 2026-09-08, PRESERVED VERBATIM BEFORE COMPACTING MEMORY.md

The index entry for this project had grown into a paragraph and was trimmed to a hook to keep
MEMORY.md under its read limit. Nothing was summarised away — this is the entry as it read,
copied here first so the trim could not lose anything. Later sections above may supersede it.

repo ~/Downloads/cancer-atlas, 16 cancers / 14 organs, GitHub Pages. **READ THE TOPIC FILE BEFORE ACTING**: it holds the four-layer gate chain (battery → run_checked.sh → commit_checked.sh → deploy_check.js — four ON PURPOSE, do not add a fifth), the full changelog, the STANDING CONSTRAINTS section (no accounts/logins, no CAPTCHAs, quote text never mirror images, AJCC never reproduced, re-source-or-remove, history at/before a131649 immutable, quote DONE lines verbatim, never mutate after a heredoc, absolute paths only) and ACCUMULATED LESSONS — one line each. **Re-verify HEAD and origin/main live before any claim about push state; a hook goes stale mid-session.** As of 2026-09-08 origin/main = HEAD = **e770a94, ALL FOUR LAYERS GREEN, tree clean** — the false-universal ruling set is CLOSED (`5cef237` repairs, `e770a94` widened guard; range `a44ebc1..e770a94` pushed, grant SPENT). **A comment insertion above a cited line breaks THREE line-keyed stores and `citation_paren_ledger`'s is the forgotten one — its own remediation text tells you to score the relocation as basis TEST, which would manufacture the rule's only evidence; re-address by BYTES and keep FIT.** Before that: the batch-4 arc closed at a44ebc1. `d17a15f` repaired ten false universals about the atlas's own contents plus one mis-addressed pointer; `a44ebc1` landed the widened guard, the ccf-unit reversion and the write-up. **RECORD-ONLY IS THE ccf UNIT FROM BATCH 5** — the user overturned their OWN record-plus-comment re-specification on the evidence (2/6 defects in EACH stratum, all four on the record line, zero in a comment, prediction (2) FALSIFIED 0 of 2), and the superseded claim is corrected in place at all three sites that repeated it. What survived is narrower and **NOT YET BUILT: a grep for a comment block that CONTRADICTS its own record** (five instances so far). The source-free class — false claims about the atlas's OWN contents, decidable by grep — was ABSORBED into absence_claim_check on the user's positive-mirror argument, so the instrument count still holds at fifteen, with a second tier that PRINTS without failing on purpose. **PUSH IS ONE-USE AND EVERY GRANT IS SPENT** — an unpushed commit of ANY kind (even .claude/-only) leaves layer four red, because deploy_check reports NOT PUSHED and stops. Flow rules that cost a full 4.5-minute gate run each when missed: **stage your files BEFORE invoking commit_checked.sh** (it stages only refusals.log); **[the exit code is the verdict, the output is commentary](feedback-exit-code-is-the-verdict.md)**, with tree and log as corroboration only; **`set unchanged` reports the record SET, not the sidecar METRICS**, and a metric the gate's OWN run raises lands OUTSIDE the commit that raised it, so **settle the ratchet with a standalone `battery.py --phase pre-commit` FIRST, then stage `record_count.json` alongside the files that moved it** (amend is forbidden, so a miss costs a whole forward commit; and `pointer_check` takes its file LIST from git but its CONTENT from disk, which is how an UNSTAGED file moved the floor during `d17a15f`); and **when a script disagrees with the record, suspect the script's POPULATION first**. The first deploy_check after a push often reports NOT PUBLISHED on the files that push changed — Pages needs ~150s and that is the gate working — but **the wait is a property of pushing a SERVED asset, not of pushing**: intersect the changed files with `cancer-atlas.html` + `js/*.js` + `*.css`, and if that set is EMPTY every finding is real and waiting is *wrong* (a `.claude/`-only commit goes green immediately — verified on 873baec). OPEN: ccf mechanism-citation pass; watchlist expiry 2026-10-17. NOTE: the Browser pane reads ~/app's launch.json, so it cannot reach this repo — the battery's own regression screenshots (under **$TMPDIR**, not /tmp) are the visual evidence

## TWO FAILURE CLASSES RECORDED — `457ce7d`, 2026-09-08, ALL FOUR LAYERS GREEN

origin/main = HEAD = **457ce7d**, tree clean, `deploy_check` green immediately (a `.claude/`-only
commit changes no served asset, so the ~150s Pages wait does not apply — second confirmation of that
rule after `873baec`). Range `e770a94..457ce7d` pushed; **that grant is SPENT**.

- **DESCRIBE THE SHAPE, DO NOT INSTANTIATE IT** (`pointer_check.py` header). Documenting a defect
  class has produced an instance of that class THREE times, each caught differently: a heading named
  in prose took its own occurrence count 1→2 → `record_sync_check` reported a non-unique marker → the
  battery refused the commit (caught by a GATE, third entry in `refusals.log`); `internal_quote_check`
  breakage (4)'s composite of two separate spans inside one pair of quote marks, which existed in no
  file at any time (caught by THAT INSTRUMENT on its first live run, in the file hosting the
  enumeration); and `pointer_check`'s own paragraph about wrong pointers, twice — pointer form, then
  the same address inside backticks (caught by a HAND AUDIT, because nothing resolves a prose
  pointer). **THE MECHANISM: a matcher has no notion of context.** "as a bad example", "formerly",
  "do not write" and backticks change nothing about what is counted. Name the form in words that
  cannot match; put only the CORRECT instance in matchable form. **Why it recurs despite care: the
  be-concrete instinct is normally right and is wrong in exactly one place — when the thing being
  shown is the thing being counted.**
- **A SOUND CHECK CAN CARRY STALE ADVICE** (`citation_paren_ledger.py`, `evaluate()` docstring +
  the `UNSCORED` string itself). A check's DETECTION is a measurement; its REMEDIATION is an argument
  written by whoever last thought about the failure, and **nothing in the output marks which is
  which**. Harder to distrust than a red check, because every gate here trains the reflex to obey the
  output and a green-when-obeyed instrument never looks like it is failing. **The fix went in the
  OUTPUT, not only the docstring** — different readers, and only the one at the red terminal is in
  trouble. `UNSCORED` now says to rule out relocation first (a `STALE SCORING` problem naming the same
  head and year means ONE span whose line moved), and to re-address by BYTES keeping the basis.
- **THE SELF-TEST IS THE ONLY NON-CIRCULAR TEST A PROSE RULE HAS** — condition (7) transposed from
  checks to prose. Describing all three incidents left all three of their instruments green and the
  hand audit found 0 pointers on added lines. A rule about how to write is tested by writing under it.
- **THE MEASURED COST OF RANGE-CHECK-ONLY POINTERS: two pre-existing defects across five sites**, all
  committed, in range, oracle-less, green from the day they were written, none found by an instrument.
  That is the FLOOR, not the whole — the audit covered one batch's pointers, not the population.
- **THE PLACEMENT RULE ALREADY HAS A HOME AND DOES NOT NEED A NEW ONE.** Before proposing to write
  "a lesson recorded where the reader is not standing is a lesson not recorded", CHECK `battery.py`'s
  `READ THIS BEFORE WRITING A NEW INSTRUMENT, OR A NEW MATCHER` block — it already says the REASONING
  lives there once and the TRIGGER lives on the line, with "AND ONE HOME, NOT TWO" forbidding a second
  copy. What it does NOT cover is the reader who never opens the source: it is written in terms of
  the line an EDITOR must change, and the fourth application was an instrument's runtime OUTPUT.
  The generalisation is the READER's location, of which the edited line is one case.

## THREE COMMITS AND THE RELOCATION — 2026-09-08, `eff40fa`, ALL FOUR LAYERS GREEN FROM THE NEW PATH

The user's ordering ruling, and the reasoning is the reusable part: **testis → `launch.json` → relocate.**
*"Testis is finished work sitting unpushed. `launch.json` must be fixed BEFORE relocation or the move breaks
the tool. And relocation is disruptive enough that it should happen against a clean, fully-pushed state rather
than on top of pending commits."* Each of the three got its own one-use push grant and **all are SPENT.**

- **`5ce7819`** — extends the placement rule in `battery.py`'s designated block into **THE THREE-POSITION
  CHECKLIST**: AUTHORING → a trigger comment on the line that would have to change; FAILURE → the problem
  string itself; REVIEW → the machine-quoted DONE line. Position three had been **operating correctly and
  unnamed since `commit_checked.sh` was written**, which is why each new case kept arriving as novel and
  getting argued from analogy. Also lands **THE SPELLING COROLLARY**: where the instance IS the evidence, spell
  the address (file name, the word "line", the number) rather than deleting it — identical to a human, invisible
  to a matcher. Deleting would satisfy the counter by destroying the record the counter protects.
- **`6e3c310`** — drops the corpus comparison from seminoma's cytology field in `js/organs/testis.js`. The
  cytology stays; the comparative half goes. A **frequency-claim detector was CONSIDERED AND DECLINED** at the
  line with its cost, because the population it would have to separate is claims about THIS REPO from claims
  about the world — the same semantics problem keeping the comment-contradicts-record grep unbuilt.
- **`eff40fa`** — stops `launch.json` naming a machine. **The user ruled this stands on its own merits:** *"A
  tracked file in a public repo hard-coding this machine's absolute home-directory path twice is a mild PII
  leak that has nothing to do with relocation — the fix is worth making even if the repo never moves. Worth
  saying so in the commit, so it isn't recorded as merely relocation prep."*

**THREE THINGS FROM `eff40fa` THAT GENERALISE:**

- **The population was MEASURED, not inferred from the grep that surfaced it.** A case-insensitive scan of
  every tracked file for the account name and for absolute POSIX paths returns exactly one file, two lines;
  the other absolute-looking hits are prose in `CLAUDE.md` and an aria attribute, neither a path. After the fix
  the scan is empty. **What it does NOT fix: the path is in the initial commit `ca3b627` and doubled at
  `0d437ef`, so it is inside immutable history — THE HISTORICAL BLOBS REMAIN PUBLICLY READABLE and no purge is
  available or wanted.** State residual exposure; do not imply a scrub.
- **POSITION ONE CAN HAVE NO HOME, and the substitute is the CONSUMER.** JSON permits no comments, so the
  trigger went on the code that consumes those two arguments (`nocache_server.py`'s argv block) — a reader
  changing an invocation reads what it invokes. **First case where an enumerated position had no home, and
  choosing a substitute was only possible because the positions were enumerated rather than left as instinct.**
- **AND A SHARPER SUB-CASE OF THE COROLLARY: where instantiating the bad form IS the defect, describe it,
  never write it.** Elsewhere writing a defective form merely gets it counted; here the instance *is* the leak,
  so writing the example would reintroduce what was removed. Git history holds the evidence anyway.
  (The same corollary caught a draft of the testis comment that quoted the rejected negative formulation
  verbatim — instantiating an absence-claim shape in a file the claim checker reads. **Twice in two commits,
  writing under the rule is what tested it.**)

**A CANDIDATE CHECK, RECORDED AND NOT BUILT:** a tracked-file scan for the home path — cheap, decidable,
measured false-positive rate zero on this corpus. Recorded in `nocache_server.py`'s comment. It owes
**condition (7)** (demonstrated capable of non-zero) and a declaration. It would be a member of an existing
layer; **it is NOT a fifth layer.**

**THE RELOCATION.** `~/Downloads/cancer-atlas` → **`~/app/cancer-atlas`**, on the user's ruling that it
*"matches five existing projects and sits outside whatever receives files"* — the second clause is the safety
argument: `~/Downloads` is a drop target, and a repo living in a drop target is how personal documents landed
in a public work tree in the first place. Executed at `eff40fa` with HEAD == `origin/main`, tree clean.
Same device, so `mv` was an atomic `rename(2)` — no partial state, and processes holding the cwd follow the
inode. Verified field-by-field against a snapshot captured BEFORE the move (HEAD, `origin/main`, branch,
remote URL, tracked-file count, porcelain count, total file count, size, `fsck`), old path gone, `git
rev-parse --show-toplevel` = the new path. **Then the gate chain was re-run from the new location to prove the
tooling survived: `DONE battery: phase pre-commit — 14/14 declared instruments ran and reported (marker
printed, exit 0), 15 declared in total, 30 .claude/ files all declared, 23/23 .gitignore comments are prose
not bare paths, 488 citation records extracted (ratchet 488 held; set unchanged), 7/14 reporting members
emitted a sidecar, 5 sidecar metrics ratcheted, 0 problems` and `DONE deploy_check: 27/27 assets byte-matched
to HEAD eff40fa, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`.**

- **THE SERVED-ASSET DISCRIMINATOR IS NOW CONFIRMED FOUR TIMES.** `.claude/`-only and `CLAUDE.md` commits go
  green on `deploy_check` immediately (`5ce7819`, `eff40fa`); a `js/*.js` commit needs the ~150 s Pages wait
  (`6e3c310`). Intersect the changed files with `cancer-atlas.html` + `js/*.js` + `*.css` before deciding
  whether to wait — if that set is empty, waiting is *wrong* and every finding is real.
- **Stale scratch references: the user's ruling is DESCRIBE AS EPHEMERAL, DON'T CHASE.** *"Chasing a path that
  moves by design guarantees the same drift next time."* `CLAUDE.md` still names two
  `~/Downloads/cancer-atlas-*` scratch paths that are now gone; the fix is to mark the class ephemeral once,
  not to update the paths. **This memory file has ~16 more of the same** (review packets under
  `~/Downloads/cancer-atlas-*`) and they get the same treatment — deliberately not chased.
- **Two orphaned `nocache_server.py` processes** (PIDs 15050 on 3056 and 19719 on 3061, both re-parented to
  `init`, started Sep 2 and Sep 3) have been serving this repo the whole time, invoked as
  `.claude/nocache_server.py <port>`. **Be precise about what that proves:** a relative SCRIPT path resolves and
  the DEFAULT root `.` works — it does *not* exercise an explicit relative root argument, which is the third arg
  `eff40fa` added. The independent evidence for that third arg is other unrelated projects' own
  entries in `~/app/.claude/launch.json`, which pass relative `--directory` values and work.
- **THE ORPHANS ALSO CONFIRMED THE ATOMICITY CLAIM DIRECTLY, which is better than the reasoning about
  `rename(2)`:** after the move, `lsof -d cwd` on both shows cwd = the new, post-move repo path,
  and `curl`ing 3056 returns a `cancer-atlas.html` whose sha256 matches the working-tree file. The processes
  followed the inode with no restart and no reconfiguration. **Side effect worth knowing: there IS a live server
  for this repo on 3056** even though the Browser pane's own `launch.json` lookup cannot start one.
- **`citation_reach_check` moved 148 → 149 and it was RUN DOWN, not shrugged at.** The delta is entirely in
  kind `data-span-year`, whose declared coverage at `citation_reach_check.py` line 103 names the ISO datestamp
  explicitly; the dated comment added in `6e3c310` is that kind by design, three other corpus files already
  carry the pattern, zero problems, no ratcheted metric moved. **A counter that moves for a documented reason
  still has to be diffed to its sidecar before that reason is asserted.**

## INDEX NOTE (2026-09-08 22:50 local): MEMORY.md's Cancer Atlas line was CONSOLIDATED BY ANOTHER WRITER at 22:47:48
(other topic files changed in the same minutes) into a hook-only form that no longer carries the HEAD hash. That is fine and
is NOT to be "repaired": the hash and the layer-four verdicts live HERE. The second-writer lesson applies to this directory
too — read MEMORY.md immediately before editing it, and prefer appending to this file. USER (2026-09-09): this note is a
COURTESY, not a guard — the other writer can rewrite this file too; THE TOPIC FILE IS THE RECORD, THE INDEX IS A HINT.
Latest state is in the Phase A section below (re-verify HEAD and origin/main live).

## PHASE A CITATION READS OPENED — 2026-09-08 late (user prompt pasted; spec = `.claude/phaseA_mapping.md`, READ IT, don't re-derive)

**CURRENT HEAD (re-verify live): `7aeaec2` == origin/main (pushed 2026-09-11 under a one-use grant, SPENT; docs/design-
document-only commit, no served asset touched — layer four's last real check still stands at HEAD 985fac4's own verified
deploy_check: 28/28 assets byte-matched, 31 hotspots live, 0 unexplained page errors, 2 declared-benign, 0 problems).
c440900 = TOLERATED COUNTS RESOLVED (user ruling: an undeclared count is evidence of an unread count; every tolerated non-zero count is
fixed / declared-with-reason / dated-for-re-read). ONE mechanism `.claude/tolerated.py::resolve` (regress's KNOWN_FAILURES shape ported;
content keys, never line numbers; UNDECLARED/EXPIRED/STALE/REASONLESS all fatal; selftest is battery instrument `tolerated_selftest`) wired
into absence (2 permanent + 2 dated 2026-10-01 stomach anatomy reads; layerSlab census beside the skin declaration), fraction (2 permanent,
pancreas ~50% vs 25/84 = pathway share vs deletion-mechanism share), share_sum (liver gap dated 2026-10-01), duplicate (4 permanent — READ:
each pair is two different quantities on one template, the calibration's residual FP class). regress: favicon 404 + its console echo declared
in `BENIGN_PAGE_ERRORS` (console errors now carry their URL); undeclared page errors exit 1. reach: 150 unreached spans = content-keyed
tracked multiset `.claude/reach_unreached.json` (95 keys; ADDED/REMOVED printed; staged diff is the acceptance; second run 0/0 byte-identical);
the 151st span was my own prostate.js:13 note's digit year. Status tables: every `unread` margin/growth row carries `until` (2026-09-17 ccrcc
margin+growth and tnbc growth; 2026-10-01 gdiff, uc, seminoma, ftc); reserve_check reports undated/overdue/unexplained-uncharacterised/dated-
cited rows (3 negative controls run). Crosscheck: 3 flags were 3 record defects FIXED (PNAS→Sottoriva, Neuro-Oncology→Louis; Nunes 2024 split
into Nature PMID 39112715 (resolved by hand from the candidate list) + Mol Cancer 39587554 — one-paper-per-author-year invariant); 0/146; its
live known-positive assertion had REQUIRED real author defects to exist → rewritten as a synthetic wrong author against real fetched data.
Also: reach/head refuse an unmeasurable population (exit 3); bladder in situ 50% is its own extent category with in-situ-modal framing; DEPTH
MEASURED — skin block exaggeration is PER-LAYER (epidermis ≥3.7× measured max, dermis 2–5×, hypodermis ~1× truncated) → Breslow to TEXT
unless re-proportioned; true scale REJECTED (hairline); uniform ×8 priced ~half a day, NOT recommended; axis designed CITED MAGNITUDE generic,
Breslow first — `phaseA_extent_design.md` §9; NO BUILD WITHOUT RULING. Ratchets raised (real growth): crosscheck.records 145→146, pointers
577→579. Eight untracked .glb/.webp files at the repo ROOT dated 2026-09-01/02 are NOT mine and were never staged — surface, don't touch.
ITEM 5 READS — DONE, PUSHED, DEPLOY-VERIFIED (commit `1ee8e61`, deploy_check 28/28 byte-matched, 31 hotspots live). PathologyOutlines probe #1 (ccRCC page, 16:38Z, honest UA naming the project, one request, headers recorded) → HTTP 429 retry-after 86400 Sucuri/Cloudproxy — THIRD consecutive window (2026-09-06, 2026-09-09T01:38Z, 2026-09-10T16:38Z), each entered after the prior Retry-After elapsed → RULED PERSISTENT for this client, not daily; **PathologyOutlines is now recorded CLOSED to this tooling** (CLAUDE.md section); no second probe inside a window; TNBC/FTC/acinar rows NOT themselves probed, they keep their `until` dates but the gross-register route back to `cited` via this source is closed — the way back is a human read of the gated pages, the user's call, not assumed. TNBC growth read via the OA rung instead (PMC esearch ×3, then PMC7550871 Front Oncol 2020 read in full) → histologic register only (pushing borders/necrosis/sheet-like growth under the microscope; its only gross sentences describe an unrelated organ's protocol) → growth status unread→UNCHARACTERISED (ledger R24; a downgrade the fourth property is designed to produce, not a failure). Composition re-count by the §10 C ledger method = 4, UNCHANGED (OCCC, ccRCC, GBM, seminoma; same two exclusions). **This closes every item from the 2026-09-10 five-item message** (tolerated-count sweep, reach/head refusals, bladder in situ, Breslow measurement+ruling, the three reads) — nothing outstanding from it.**

**FOLLOW-UP FIVE-ITEM MESSAGE — ALSO DONE, PUSHED (commit `4de9f67`, no served asset changed so no deploy step needed).** 1. SELF-TEST COUPLING AUDIT: named CHECK-VALIDATED-BY-DEFECT as the 4th accidental invariant (with cwd-always-pinned, closed-mesh-always-resolves, one-paper-per-author-year). Audited all 19 instruments with a selftest/live-check — **exactly one instance, the crosscheck one already fixed; zero others** (5 apparent hits were one regex bug in the audit itself, re-verified clean). 2. BLADDER CAPTION: re-verified — the flagged sentence is gated on `modal`, bladder's `modal` is `'in situ'`, no live defect; independently recomputed true argmax for all 16 EXTENT_STATUS entries against their own shares — **16/16 match**, pancreatic correctly `'distant'` (the predicted 2nd casualty did NOT occur); added a structural guard to `reserve_check.js` (modal must equal argmax) anyway, proven with a negative control. 3. REGISTER FINDING: FTC/acinar/TNBC's four reads (R20/R22/R23/R24) are **4/4 the same signature** — real literature found, but at histologic register not gross — each with its own diagnostic reason (capsular/vascular invasion; grossly inapparent; receptor-defined). Recorded as a **principled, partial limit on the margin axis** and a Phase C budgeting ceiling, NOT a search backlog; ccRCC (R3/R4, literature silence) is a different failure mode, explicitly NOT folded in, stays open. 4. EIGHT ROOT FILES INVENTORIED (report only, nothing moved/touched): all glTF-binary GLBs except one WebP; embedded Sketchfab `asset.extras` (author/license/source/title) read directly from each GLB's JSON chunk without loading the binary payload. **SIX are raw downloads already processed into currently-shipped, tracked, CLAUDE.md-documented assets** — realistic_human_lungs.glb (neshallads) → assets/lungs.glb; realistic_stomach.glb (Brain_Diagno) → assets/stomach.glb; tiroides_andrea__dacs_ujat.glb (andycopo55) → assets/thyroid.glb; pelvic_organs_from_mri.glb (audreybyrd) → assets/ovary.glb (the MRI ovary swap); small_and_large_intestine.glb (antonia.sundberg) → assets/colon.glb (Blender-extracted large-intestine meshes only). **TWO have zero CLAUDE.md trail** — colon.glb (iqcenter; node names suggest a medical-imaging/volume-mesher export, different from the sundberg source actually used) and digestive_system__human_anatomy.glb (adimed; a whole-body multi-organ reference scene). All eight confirmed NOT gitignored (plain untracked); sha256 recorded for all eight in this session's tool output if ever needed again. **Awaiting Joe's call on the two undocumented files — nothing to do until he says what they were for.** 5. GREP-AS-LAST-COMMAND: audited run_checked.sh/commit_checked.sh — both already capture `$?` or use `grep -q` inside a conditional everywhere; the false "failed" notification earlier this session was this agent's own ad hoc verification one-liner, not a repo defect. No repo fix needed; personal habit note only [[feedback-exit-code-is-the-verdict]].**

**SECOND FOLLOW-UP MESSAGE (2026-09-10) — ALSO DONE, PUSHED (`db195f0` + `b9e1c60`; no served asset in either, no
deploy step needed).** 1. COUPLING AUDIT GIVEN ITS OWN POSITIVE CONTROL: planted a disguised synthetic fixture
(live-corpus-coupled sys.exit outside any selftest(), no suspicious phrasing) — the ORIGINAL narrow method MISSED
it, exactly as the user predicted; broadened to a one-hop data-flow detector, which catches it, then re-run
against the real 17 raised 10 candidates, all triaged by hand: 8 are the empty-population-refusal pattern or a
tool's own normal result-reporting exit (unrelated, deliberate); 2 are the crosscheck's OWN already-fixed
synthetic control, which a structural heuristic CANNOT distinguish from the bug (both touch live data; the
difference is semantic — the synthetic probe value guarantees the assert, not a corpus property). Net: still
zero new instances, now behind a fixture-verified detector. A permanent battery instrument for this considered
and declined (every hit needed a human read). 2. BLADDER CAPTION FOLLOW-UP: the modal-argmax guard proves data
consistency, not branch-sentence truth — two more reserve_check.js arms added (in-situ's hardcoded "next largest
share localized" must hold; modal='unknown' flagged outright), both proven with negative controls. 3. REGISTER
LIMIT SIZED from the live table: 6 cited / 3 register-limited (tnbc/acinar/ftc) / 4 other-reason / 3 unread of
16; 3/9 = 33% among decided entries, 3/16 = 19% overall — both project to **roughly 20-25 of Phase C's ~120**;
intersected with the 8-9-masses-per-organ hazard: **roughly 1.5-3 of every crowded organ's masses would be
permanently teal**. 4. colon.glb CLEARED: 51 named nodes dug, zero identifiers of any kind; its public Sketchfab
listing read directly — a typo-laden 2020 artist upload, generic histology-teaching tags, 1000+ downloads — not
scan-derived personal data; reported to Joe, nothing moved. digestive_system__human_anatomy.glb still undocumented,
still Joe's call. 5. GREP-AS-LAST-COMMAND: user's own diagnosis was wrong (no repo pattern); confirmed, recorded.
BRESLOW RULED: text, uniform-x8 re-proportion DECLINED (one property, half a day, 0.8mm epidermis probably doesn't
restore in-situ visibility anyway). **PHASE A CLOSED** (`.claude/phaseA_closeout.md`) and **PHASE B OPENED**
(`.claude/phaseB_design.md`: build-time/runtime decision + the `pulled`-schema provenance question, ruling
requested, nothing built).

**A REAL PROCESS ERROR, CAUGHT AND FIXED FORWARD, NOT AMENDED:** `db195f0` was committed with only 2 of 7 changed
files staged (the gate run read the working tree, which had everything; the commit captured only what was
`git add`ed). Checked clean in a throwaway worktree, `db195f0` ALONE fails its own "`.claude/` fully declared"
arm. Caught by re-reading my own pre-commit diagnostic output correctly (it had printed the five unstaged files
plainly; I misread ` M path`, unstaged, as `M  path`, staged, the first time). Fixed forward with `b9e1c60`
(the missing five files, disclosed in its own message); the two-commit sequence verified green in a clean
detached `git worktree` checkout BEFORE requesting the push grant — the check that should have run before
db195f0 and did not. Two new personal memories written: [[feedback-verify-what-git-will-commit-not-disk]] and
the self-test one above.

**THIRD FOLLOW-UP MESSAGE (2026-09-10) — DONE, PUSHED (`de47c61`; no served asset, no deploy step
needed). User rejected the "personal mistake" framing and named it structural: the gate always read
the working tree, never the index, and every prior commit passed only because staging happened to be
complete — the fourth accidental invariant again.** 1. GATE MECHANIZED: `commit_checked.sh` now runs
`git diff --name-only` and REFUSES before the gate even starts if any tracked file has unstaged
changes (`.claude/refusals.log` exempted — it's left tracked-but-unstaged BY DESIGN between a refusal
and the next commit); 2 new selftest arms + a LIVE negative control on this repo that caught my own
mid-session unstaged edit to the script itself. Audited run_checked.sh and battery.py's orchestration
for the same "printed, not gated, stopped being read" pattern (3rd instance after 2 label overlaps /
3 crosscheck flags) — both clean, gap was isolated to commit_checked.sh. 2. COUPLING AUDIT GIVEN A
TRIGGER, not left on a list: battery.py's instrument-authoring block gained convention E —
write/edit a selftest, run the method, pointer to CLAUDE.md not a duplicate. 3. RESERVED-DENSITY
recorded SIZED AND DEFERRED to Phase C: ~2 permanently-teal masses per crowded organ risks reading as
its own tumour category (semantic drift from frequency); rendering nothing instead collapses
uncharacterised into unremarkable — not resolved, just sized. 4. PHASE B WRINKLE STATED IN CHAT (not
here — retrieval provenance alone would rebuild this project's whole defect history at scale).
5. SCHEMA AMENDED BEFORE DESIGN: `pulled` candidate gained 5 meaning fields (measures/register/
population/vintage/licensedAssertions), each traced to a specific already-found defect (scope drift,
denominator transplants, certainty drift, gross/histologic register, stage-read-as-growth,
SEER-entity-broader-than-entry). No detector/schema/fetch code touched; phaseB_design.md ruling still
requested. **Every future commit here: the script itself now refuses on unstaged tracked files, but
a battery run against disk still isn't proof of what's staged if this script is ever bypassed.**

**FOURTH FOLLOW-UP MESSAGE (2026-09-10) — DONE, PUSHED (`c77960b`), deploy-verified (28/28 byte-matched,
31 hotspots live). User rejected the schema-fix framing entirely: the ROADMAP's own justification for
pulling from maintained sources ("removes the copy error class") was wrong and load-bearing, and had
to be corrected at its source, not patched around downstream.** 1. ROADMAP RATIONALE CORRECTED IN
PLACE (CLAUDE.md): every defect this session found was semantic, not transcriptional; automation
removes the READER who caught each one, not the error class. 2. PHASE B REFRAMED as reviewed-vs-
unreviewed (phaseB_design.md §1 rewritten) — build-time/runtime is downstream of it; the project's
existing TRIALS design (bounded assertions, no ranking, the handoff is the point) is named as the
first, previously-unnamed instance of the general rule: unreviewed content is permitted, bounded by
its declaration. 3. SCHEMA VALIDATED AGAINST THE DEFECT LOG (new §4, a 7-row table): **2/7
mechanically caught** (detection-framed wording — precedent already running; register mismatch — the
field the schema is named for), **3/7 authoring-caught only** (German-registry scope, bladder entity
breadth, pancreas denominator transplant — real risk reduction, not a correctness guarantee), **1/7
out of scope** (Wang/Park attribution belongs to the existing backfill/crosscheck mechanism), **1/7
MISSED** (certainty drift — no field addresses hedge strength; a 6th field `certainty` proposed,
unbuilt). INCIDENTAL LIVE DEFECT found and fixed while building the table: kidneys.js's KDM5C/PTEN
notes still said Gerlinger "found convergent evolution" unhedged — the identical defect already
fixed once on the sibling SETD2 record in the same file, never propagated to its two siblings. Fixed
to match SETD2's own wording. 4. RULING RECORDED: approved in principle — declaration layer first
(add `certainty`, close the one missed row), fetcher second; no endpoint, no fetch code, no detector
touched until then. **User's closing status read, worth carrying forward: verification machinery is
in good shape; content is at 16 of a ~120 target — Phase C is where "the thing Joe actually asked
for" arrives, and it's two phases out. Keep that ratio visible.**

**FIFTH FOLLOW-UP MESSAGE (2026-09-10) — DONE, PUSHED (`c798e79`), no served asset (census found
nothing new beyond the kidneys.js fix already shipped, so no deploy step needed). User rejected
scoring "the schema forces you to write it down" as a catch at all: an unverified declaration is a
laundered claim, same shape as a tolerated count, and under Phase B's own reviewed-vs-unreviewed
premise there's no reader left to be prompted.** Re-scored all 7 defects on DERIVE-VS-TYPE: only
1/7 solidly caught (a check against RENDERED TEXT, not a typed field — detection-framed wording);
1/7 sound only if scoped once-per-axis not once-per-record (register); 1/7 already caught by an
UNRELATED existing mechanism (Wang/Park → backfill/crosscheck); 4/7 not caught at all unless the
fetcher queries a REAL STRUCTURED API (not a scraped page) — named as a concrete architectural
constraint. **Consequence: TWO-TIER MODEL, not one schema.** Tier 1 = verbatim + every source
qualifier, rendered together, mechanically checkable, scales to ~120 (precedent already running:
`extentSentence`'s mandatory-field concatenation). Tier 2 = anything interpreted — every defect this
session found lives here — stays hand-read, stays small. Boundary is itself checkable: a render that
sheds a qualifier its own record declared has crossed tiers. **CERTAINTY-DRIFT CENSUS run before the
sixth field, properly cross-validated this time**: a naive proximity sweep was PROVEN to miss one of
the two known kidneys defects (tested directly against this repo's own pre-fix git history — a
400-char window didn't span sibling records in the same array) before being trusted; rebuilt as an
identity-grouped method (group by citation, not by character distance — this project's own
"search by identity" principle), which DOES catch the known positive and finds zero other repeated
citations with inconsistent hedging across 259 fields corpus-wide. Result stated at its true, narrow
width: clean for the repeated-citation slice only; the far larger single-mention slice (most of
~372 epi sources) remains unmeasured without re-fetching originals, explicitly not claimed covered.
Sixth field (`certainty`) rescoped to `backfill`/Tier 2 (statistics don't hedge, mechanism prose
does), lowest priority of four ordered steps. **No detector, schema, or fetch code touched across
either of the last two messages — still zero lines of integration code, by design.**

**SIXTH FOLLOW-UP MESSAGE (2026-09-10) — DONE, PUSHED (`3394fdc`), no served asset changed (no deploy
step needed). User named the four now-uncaught defects as consequential — "a soft schema hope
converted into a hard architectural constraint" — and demanded it be TESTED, not assumed: verify the
structured feed actually exists per source before designing around it.** 1. FEED FEASIBILITY, real
requests only: ClinicalTrials.gov v2 CONFIRMED (`api/v2/studies` returned a live HTTP 200, clean
JSON, fields already broken into named modules — identificationModule etc. — no account); SEER
CONFIRMED BLOCKED (`api.seer.cancer.gov`'s real endpoint returned a live HTTP 401, `{"message":
"You must supply an API key"}` — genuinely structured, closed by this project's own standing
no-account rule, not a technical gap — the single most consequential finding, since SEER backs
every statistic this session actually used including the fifteen live extent lines); PDQ NOT FOUND
(NCI's real structured web APIs — glossary/drug-dictionary/trials-search/site-search — enumerated
live, none serves PDQ disease/treatment content; a good-faith negative, not exhaustive — a licensed
partner feed may exist and would be account-shaped anyway). The fifteen live extent lines are Tier 2
BY NECESSITY now (the structured feed the re-pull idea assumed turned out unreachable), not
grandfathered by oversight. 2. CENSUS GIVEN ITS DENOMINATOR: the prior "zero further instances" was
an unquantified zero — restated as a fraction. The identity-grouped method's own regex recognises
6–23 of ~139–180 distinct corpus citations (3%–15%, the only population it can ever check, since a
once-cited source has no sibling to compare hedging against); zero live defects within that covered
slice (two apparent flags both cleared as a different citation from the same paper, and a
hedge-detector false-positive on a descriptive adjective); the other 85%–97% explicitly NOT claimed
covered. 3. EPI-PASS RE-SCOPE RE-READ (counted, not fixed, per instruction): of 55 total migrating
share clauses, ~36 already verified/unaffected; of the ~19 retired unread on 2026-09-05, 10 already
carry an owner and a date (the `_uncited_migrating_watchlist`, expiry 2026-10-17 — confirmed still
bare against the shipped files) but that expiry's own CONDITION is now stale (it reverts on "Phase B
has not landed," and Phase B just settled its architecture without landing an integration — flagged,
not resolved); ~9 have no date and no declared reason — the genuinely unowned population. One
discrepancy surfaced, left unresolved per instruction: skin.js's melanoma share is named
retired-unread in the re-scope note but currently ships cited, predating the re-scope by over a
week — not determined which record is imprecise. 4. ARCHITECTURE RECORDED SETTLED
(`phaseB_design.md` §11): reviewed-vs-unreviewed is the axis; two-tier render model is the
structure; shed-qualifier boundary is the mechanical check between them; Tier 1's breadth applies to
trials only today, statistics stay Tier 2 until a person registers a SEER key by hand — a decision
for Joe, not a task for any session. Ordered next steps recorded so a future session doesn't
relitigate: trials integration first, then the ~9 unowned clauses + skin's discrepancy, then the
watchlist's stale expiry wording, then the sixth field last. **PROCESS NOTE FROM THIS ROUND: the
rewrite of phaseB_design.md's census section transiently dropped two pointers (ovary.js:211,
skin.js:393) mid-edit — caught by a standalone pre-commit settle reporting `pointer_check.pointer.
pointers SHRANK 581 -> 579`, diagnosed by diffing against the checker's own regex (not guessed at),
and fixed by restoring the pointers into the text rather than lowering the ratchet.** Verified in a
clean detached worktree before the push grant, per standing practice.

**SEVENTH FOLLOW-UP — TWO COMMITS, ONE PUSH GRANT (2026-09-10). User corrected the SEER-401 finding
as overclaimed ("a rejected request proves auth, not sufficiency") and issued a consolidated
five-item order; both landed together, PUSHED (`42fa716` then `985fac4`), deploy-verified
(`deploy_check: 28/28 assets byte-matched to HEAD 985fac4, 31 hotspots live, 0 unexplained page
errors, 0 problems`) since `42fa716` touched `js/organs/liver.js`.**

**`42fa716` — SEER re-diagnosed, scraper priced, watchlist merged (no served asset).** 1. SEER'S
401 RE-READ FROM ITS OWN DOCS, not the rejected response: `seer.cancer.gov/registrars/api` states
the API serves registrar coding data (Collaborative Staging, Hematopoietic/Lymphoid DB, NAACCR
docs, SEER*Rx, Site Recode) — never stage/survival statistics, at any account tier; the real
statistics path (SEER Research Data) is delivered only through SEER*Stat, a Windows desktop app,
not a REST API at all. A key would not have helped. 2. A LAYOUT-GUARDED SCRAPER against all 15
already-cited SEER Stat Facts pages: 15/15 exact matches to the hand-transcribed shares, the 16th
(testis) correctly reports no table, 5/5 constructed negative controls correctly refused, no CORS
(build-time-only confirmed), plus a free capability recovered (5-year survival-by-stage, unused
anywhere in the app). Not committed — priced for a build decision. 3. WATCHLIST RE-DERIVED: the
2026-09-05 note's "~19 unread clauses" resolves to twelve concrete items after finding skin's
melanoma share was a bookkeeping miss (already cited a week before the note was written) and
"StatPearls rows" resolves to exactly two bare citations (skin.js SCC/MCC) — `citations.json`'s
watchlist merged and its expiry rule struck of the "Phase B has not landed" trigger, now
unconditional cite-or-remove on the unchanged date. 4. Census restated at 3–15% coverage (unchanged
finding, re-confirmed). Pointer ratchet SHRINK from the prior round's own rewrite (§ census section
dropping two pointers) diagnosed and repaired before this commit, not lowered.

**`985fac4` — the five-item consolidated follow-up (no served asset).** 1. THE SEER FINDING MADE
EXPLICIT rather than left inferable: a SECOND, independent SEER page (`api.seer.cancer.gov`'s own
root/docs) corroborates with zero vocabulary overlap into statistics; the record-sync gap traced to
its exact mechanism (the one declared pair guards a date STRING's uniqueness in CLAUDE.md, nothing
about the watchlist's membership against reality — a real, named gap, left unbuilt on purpose).
2. THE SCRAPER'S LAYOUT ASSERTION GIVEN REAL POSITIVE CONTROLS: three structural mutants (move a
section, rename a header, reorder) — two correctly refuse, the third correctly does NOT (verified
byte-correct against baseline) — plus a fourth, harder construction (a duplicate spurious block with
fabricated sum-passing data) found a REAL gap none of the original eight assertions covered:
first-match semantics silently bound to an earlier duplicate with wrong data, no error. Fixed with a
ninth assertion (exactly one such block per page, or refuse); re-verified against all 15 real pages
+ all 5 original + all 4 new structural tests. 3. BUILD-TIME STALENESS POLICY SPECIFIED: a
vintage-string compare (SEER's own basis footnote) as the primary signal, a quarterly calendar floor
under it, a `stale` state (current/check-due/stale) added to the `pulled` schema candidate; recorded
the independent gate-chain argument for build-time (committed output passes every check every other
figure does; a runtime fetch never would) beside the CORS-forced one. 4. CERTAINTY-DRIFT READ
CORRECTED: re-checking the prior round's own claimed depth ("24 of 58") against the actual ranked
order found a real miscount — 18 distinct, non-contiguous ranks were read, not 24, with ranks 6/10/
11/12 skipped entirely. Redone in strict order under a rule stated FIRST (stop after 10 consecutive
clean since the last defect); all four skipped ranks read fresh, confirmed clean; rule satisfied
exactly at rank 14 — the corrected depth, reported beside the wrong one rather than replacing it
silently. Committed as `.claude/certainty_rank.py` (declared NON_INSTRUMENT), header stating
explicitly why the hedge-word list must never be tightened after a false positive (inverted
economics from a gate — a false negative here is permanent and silent). 5. POINTER RATCHET SPLIT BY
POPULATION: `pointer_check.py`'s single `pointer.pointers` retired for `pointer.pointers_code`
(manifest structured refs + `.claude/*.py`/`.sh` comments, floored) and `pointer.pointers_prose`
(CLAUDE.md + `.claude/*.md` + the manifest's narrative keys, reported every run, NOT floored) — the
579 shrink was the population's real failure mode, not a one-off. Seven new selftest arms
(`classify()` on all four real origin shapes + a mixed-population fixture proving a real partition).
Stale combined key deliberately removed from `record_count.json`'s stored counts in the same
commit, disclosed, so `vanished_ratchets()` had nothing orphaned to flag; live split 452 code + 143
prose = 595, code metric held exactly across the settle-then-commit-then-worktree-verify sequence.

**A real, harmless cwd-reset bit again mid-round**: the first `commit_checked.sh` invocation for
`985fac4` failed exit 127 ("No such file or directory") because a background call's shell cwd had
drifted from the repo root — caught immediately (no commit made, no partial state), retried with
the same command and it succeeded. Same class as the earlier documented cwd-drift scars; worth
re-noting because it recurred with backgrounded battery/commit invocations specifically, not just
with `cd`-then-scratch-directory sequences.

**EIGHTH FOLLOW-UP — CONVENTION F, THE RECORD-SYNC CLASS, THE RANKER REFRAME, THE CWD RULE
WIDENED, PHASE D DESIGNED (2026-09-11). PUSHED (`7aeaec2`), no served asset — docs/design-document
only, no deploy_check needed.** User closed out SEER, then gave six items: two corrections to the
prior round's own framing, one convention to record, one minor scar, and Phase D as a full design
task.

**1. SEER acknowledged closed** — no account ever needed, since statistics live behind SEER*Stat
(a desktop app), not the API. **2. CONVENTION F added to `battery.py`'s standing-conventions
block**: a parser's/extractor's own condition-(7) fixture set needs a PLAUSIBLE-BUT-WRONG member,
not only broken ones — named directly from the scraper's duplicate-block gap (eight assertions,
eight broken-shape fixtures, all passed; only a well-formed fabricated SECOND block found the real
failure — confident wrong data, not a refusal). **3. THE RECORD-SYNC GAP RE-SCOPED FROM ONE
INSTANCE TO ITS CLASS** (`phaseB_design.md` §16 rewritten) — "the watchlist is resolved" answered
skin.js and nothing past it; verified two MORE live members (`MARGIN_STATUS`/`GROWTH_STATUS`'s
per-entry status claims in `js/morphology.js`; the hand-swept "composition four" — OCCC/ccRCC/GBM/
seminoma — in `phaseA_growth_design.md` §10.C) and split the class into two sub-shapes: claims
about text ALREADY in the repo (cheaply automatable, left unbuilt on frequency grounds so far, not
a structural limit) vs. claims about LITERATURE outside it (not automatable without a live fetch,
the same limit external quote-verification has always had). **4. THE CERTAINTY-DRIFT RESULT
RE-FRAMED**: 44 of 58 ranked clauses are UNREAD, not clean — the stopping rule certifies the
pre-registered low-yield assumption was never contradicted, not that the tail was checked.
Recorded SEPARATELY as a validated property worth keeping: the one defect landed at rank 4, ten
clean reads followed — real evidence the ranking orders well on its first live use, not a lucky
run. **5. THE CWD-RESET RULE WIDENED PAST "A CLAIM"** — the third live instance this session (the
`985fac4` exit-127) was a MUTATION, not a read, that failed safely only by luck; `run_checked.sh`'s
header and personal cross-session memory (`feedback-explicit-form-over-ambient-state`) both updated
to cover every background-issued command, not only claim-producing ones. **6. PHASE D DESIGNED**
as its own document (`.claude/phaseD_trials_design.md`), taken ahead of the rest of Phase B since
ClinicalTrials.gov v2 is the one source confirmed both available AND sufficient — and, checked live
this round, CORS-permissive (unlike SEER), confirming trials can be a genuine client-side runtime
fetch. **The condition-mapping method was DEMONSTRATED on two real live queries, not just
specified**: ccRCC read back 7/8 on-topic (one named broadening); diffuse-type gastric
adenocarcinoma caught a GENUINE cross-domain false match — a multi-basket BRAIN TUMOR trial pulled
in because "diffuse" collided across two unrelated condition tags in one study record — corrected
by dropping the colliding term, re-verified clean at 6/6. The three duty-of-care constraints given
concrete UI form (fixed non-conveyance copy; neutral `lastUpdatePostDate`-descending sort, stated
on the page; handoff-framed language); status/staleness designed around a live-sampled 9-value
`overallStatus` enum filtered by a fail-safe INCLUDE-list, paired with a visible fetch timestamp; a
four-state failure mode specified by direct analogy to `deploy_check.js`'s own
measured-catastrophe-vs-failed-to-measure precedent; location handling decided (ignore, for this
build) backed by a real number (one sampled trial carries 128 site locations) with a revisit
trigger. No fetch code, no component, no schema field touched — the document awaits a ruling.

**One correction of my own, disclosed rather than silently followed**: the user's closing line
assumed this round "touches served assets" (carried over from the prior round's liver.js fix);
checked directly against the actual diff — `js/organs/*.js` and `cancer-atlas.html` are untouched,
this round is docs/design-document only, so no Pages wait or `deploy_check` applied. Flagged in the
commit's own PRE-FLIGHT rather than followed blindly.

**PREVIOUS HEAD (superseded 2026-09-10 by c440900 above): `bcb625a` == origin/main (pushed 2026-09-10 under a one-use grant, SPENT; layer four GREEN: `DONE
deploy_check: 28/28 assets byte-matched to HEAD bcb625a, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live
morphology.js de7860e8…, main.js 9be92e53…, cancer-atlas.html 71956a38… == HEAD's). bcb625a = EXTENT TO TEXT (rulings 1+3 built):
morphology.js `EXTENT_STATUSES`/`EXTENT_STATUS` (16 entries from 14 SEER Cancer Stat Facts pages, 'Percent of Cases by Stage at Diagnosis',
SEER 21 (Excluding IL) 2016–2022, SEER Combined Summary Stage, submission NOT stated on the pages (recorded as such), each URL 'verified
2026-09-10'; SEER entity named where broader than the entry; TESTIS page has NO distribution → seminoma extent uncharacterised; BLADDER has
in situ 50% — the check caught the shares summing to 50 before shipping), `extentSentence` = PRIMARY extent line on EVERY mass badge,
DETECTION-FRAMED ('Found at diagnosis — <site>: …', 'The drawing shows the localized case — the least extensive; most are found already
beyond it' / '…which is how most are found'), never 'spreads' (reserve_check REFUSES an extent sentence containing 'spread'); guards: extent
census, shares sum ~100 incl. in situ, basis must carry a diagnosis-year range, fourth property (URL + verified date). Render coverage now
'9/17 margin/growth rendered (8 text-only pending a mechanism) plus 15 cited extent distributions text BY DESIGN'. Disclaimer: every mass
drawn confined = the localized case; never a stage the reader may not have. Ledger EXT2 in mapping doc + _phaseA_citations. PREDICTION
ACCOUNTING (extent design): 'fifteen to text, melanoma geometric' → SIXTEEN to text on this axis; melanoma's plug = DEPTH (Breslow, first
cited magnitude) → its own axis, ruling pending. OPEN: composition re-count; TNBC gross reads; PathologyOutlines four-probe at the window;
the tolerated-count list's candidate defects (3 crosscheck record-format flags; 4 drift flags to re-read; liver share gap) await the user's
fix decision; reach/head empty-artifact wording (open item); Breslow depth axis ruling. Before it, `f860398` (pushed 2026-09-10 under a one-use grant, SPENT; layer four GREEN: `DONE
deploy_check: 28/28 assets byte-matched to HEAD f860398, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`).
f860398 = THREE REPORTS + ONE GUARD: (1) TOLERATED-COUNT SWEEP (user's reframe: '2 known failures' LAUNDERED a defect into a constant
everyone matched; the bare-cwd 'same counts' discriminator is structurally blind to it) — CLAUDE.md section classifies every accepted non-
zero count: LISTS with reasons (BENIGN, DECLARED_UNMAPPABLE, DECLARED_UNREACHED, absence EXEMPTs, paren ledger, KNOWN_FAILURES) and ONE
with expiry (the migrating watchlist — its date is that pair's record_sync MARKER: never quote it elsewhere in CLAUDE.md; I did and the
check refused 18/19, fixed); NUMBERS people match: crosscheck '3 flags' (3 REAL record-format defects: journals in the author field —
Nunes 2024 colon.js:277, 'PNAS' 2013 brain.js:160, 'Neuro-Oncology' 2021 brain.js:217), duplicate '4 drift' (skin CDKN2A 49/44 vs 29/27
etc. — re-read owed), fraction '1+1' (pancreas 206/149 = FALSE POSITIVE), share_sum '1 gap' (liver 87.5), absence '2+2 universals' (kidneys,
bladder, lungs, stomach — pending reads, no expiry), reach '151 unreached', regress '2 page errors' (favicon), status tables without expiry.
REPORT ONLY — fixes are the user's decision. (2) STANDING RULE: an instrument that can emit a catastrophic verdict must distinguish
MEASURED-catastrophe from FAILED-TO-MEASURE; the second may never wear the first's words (deploy_check's detached frame = 3rd of the
family after /tmp false failures and the oracle's wrong point). AUDIT: regress.js now has an INITIALISATION PRECONDITION (PROBE FAILURE,
no checks run, exit 1 — proven against an empty server root); citation_reach/head over an empty artifact still phrase the unmeasurable as
declaration defects (open item). (3) MELANOMA = DEPTH NOT BREACH: the skin block's slabs are one organ's layers; a dermal plug = Breslow
depth (cited mm — the FIRST CITED MAGNITUDE, outside the category/magnitude split → its own axis + ruling); block NOT to scale (16 mm
section, ~2.2 mm epidermis ×5 vs ~0.1 mm real) → declare the layer scale or keep depth in text. PREDICTION ACCOUNTING: 'fifteen to text,
melanoma geometric' → SIXTEEN to text on the extent axis, the 16th reassigned not refuted. Rulings 1 (text default + reader-side argument +
DETECTION-FRAMED wording 'found at' never 'spreads' + primary element at 16 instances) and 3 (SEER vintage: registry set + diagnosis years +
submission where stated + retrieval date) recorded. IN PROGRESS (uncommitted): COMMIT B = extent to text — EXTENT_STATUS for 16 entries
from 14 SEER Stat Facts pages (SEER 21 excl. IL 2016–2022; testis page has NO distribution → uncharacterised; SEER entity broader than the
entry on most sites — named on the badge), `extentSentence` primary line on every badge, reserve_check extent census + vintage rule + 'spread'
word guard + coverage bucket text_by_design, disclaimer, EXT2 ledger. Before it, `71d618d` (pushed 2026-09-10 under a one-use grant, SPENT; layer four GREEN: `DONE
deploy_check: 28/28 assets byte-matched to HEAD 71d618d, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`).
71d618d = THE EXTENT-BREACH DESIGN DOCUMENT `.claude/phaseA_extent_design.md` (NON_INSTRUMENT, 34th .claude file): constraints A (SEER
Summary Stage, NEVER AJCC), B (breach is MODAL — the render must not make it factual), C (second structure first); inventory; modality
analysis (a single illustrative mass asserts one stage; the default confined mass already READS localized → understates typical extent
for cancers found beyond it — the understated-extent form GENERALISED, fed per entry from SEER Cancer Stat Facts 'Percent of Cases by
Stage at Diagnosis', 'SEER 21 (Excluding IL) 2016–2022', public domain: pancreas L15/R28/D51/U5, melanoma L77/R10/D5/U9, verified
2026-09-10); without a modelled neighbour a breach reads as PROTRUSION = placement (pre-registered collapse); melanoma's dermal plug in
the skin block's slabs is the ONE geometric candidate; PREDICTED 15/16 → TEXT; decision criterion pre-committed; build order (the Stat
Facts read for 14 sites → EXTENT_STATUS + generalised badge; melanoma plug look-and-decide). THREE RULINGS REQUESTED: text default,
melanoma plug, Stat Facts pages as per-site source (URL + verified date). ALSO: deploy_check names a PROBE FAILURE as its own (retry once;
'hotspots UNMEASURED (probe failure)' instead of 0) after the detached-frame flake on 8c51c96's first run. Before it, `8c51c96` (pushed 2026-09-10 under a one-use grant, SPENT). LAYER FOUR: first run RED
(`0 hotspots live, 1 problems` — 'NOT INITIALISED: state module unreachable: Attempted to use detached Frame'), re-run on the SAME bytes
GREEN (`DONE deploy_check: 28/28 assets byte-matched to HEAD 8c51c96, 31 hotspots live, 0 unexplained page errors (2 declared-benign),
0 problems`; live main.js 59f566df… == HEAD's). The red was a PROBE failure (the checker's frame detached mid-evaluate), reported by the
checker as an APP failure — a measurement error dressed as a finding; the refusal it logged stays in refusals.log; deploy_check is being
taught to say PROBE FAILURE. FOUR SHORT ITEMS in 8c51c96: (1) LABEL OVERLAPS = a RED CHECK INSIDE A GREEN GATE — regress.js printed its
failure count and exited 0 regardless (reporting-only for its whole life); chips intersected by a few px, text legible; FIXED both: a per-
frame collision resolver in siteTick (labels pushed down by overlap+4px; box from CSS anchor translate(-50%,-160%)) and regression failures
are now FATAL unless declared by name with a reason (`KNOWN_FAILURES` = [] ; stale declarations reported) → regress 173/0 exit 0.
(2) puppeteer-core moved to ~/.cache/cancer-atlas/node_modules (path built via os.homedir() at runtime — no literal; /tmp is LAST) in
regress/capture_organs/deploy_check; SIMULATED the vanished case with RUN_CHECKED_REFUSAL_LOG redirected: wrapped regress exits 1 + refusal
→ the gate REFUSES (convention D holds). (3) identity pattern SCOPED: identity for discrete enumerable populations, COUNT for sampled ones
two correct runs can differ on (pose jitter: 759 px >6/255 between correct runs; count 1878/1880 true). (4) RENDER COVERAGE in reserve_check:
cited-and-rendered vs text-only per entry — 9/17 today (8 text-only = unbuilt growth mechanisms); TRIGGER: first live reserved-margin +
cited-growth entry → reopen whether the reserved signal belongs on the mass surface. Enumeration corrected: overlaps present-tense (fixed);
8–9 masses/organ at 22% costed as STRUCTURAL (shrink / one-at-a-time / per-entry origins — reshapes Phase C's content model); URL identifier
= a check that didn't check → now requires 'verified YYYY-MM-DD' in the ref (reserve_check, 33 arms). IN PROGRESS (uncommitted): the
EXTENT-BREACH DESIGN DOC `.claude/phaseA_extent_design.md` (constraints A SEER-not-AJCC, B breach is MODAL, C second structure first;
predicted 15/16 → TEXT via the generalised understated-extent form fed from SEER Cancer Stat Facts stage-at-diagnosis distributions —
pancreas L15/R28/D51/U5, melanoma L77/R10/D5/U9, 'SEER 21 (Excluding IL) 2016–2022', public domain, verified 2026-09-10; melanoma the one
geometric candidate via the skin block's layers; three rulings requested) + deploy_check PROBE-FAILURE wording. Before it, `1d85b83` (pushed 2026-09-10 under a one-use grant, SPENT; layer four GREEN: `DONE
deploy_check: 28/28 assets byte-matched to HEAD 1d85b83, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live
main.js e4de6c5d… and morphology.js 44cf1d89… == HEAD's) — THE APEX FLOOR RE-DERIVED ACROSS THE ORBIT. The user named the gap: the check verified the cap matched a
measurement, not that the measurement generalised (one pose, one organ, auto-rotating viewer) — resolve-vs-resolve-correctly one level up.
LIVE OVERLAP (read from the module): NONE — the 3 drawn-growth entries (PDAC, PTC, GBM) all have cited margins → exposure prospective.
SWEEP (scratch /tmp/ca-yaw-sweep.js: 24 yaws at default pitch/radius, frozen, baseline vs temporarily wired luad+ccrcc → infiltrative):
cap 1.0 → lungs MIN 0.20 (8/22 visible yaws < 0.30; default pose 0.34 was FAVOURABLE), kidneys MIN 0.03 (yaw 6; 5 yaws below);
cap 0.5 → lungs 0.31 / kidneys 0.06; cap 0.3 → lungs 0.35 / kidneys 0.08 (yaws 4–6) — NO nonzero cap survives the kidney geometry
(base-on yaws show only the band). DECISION by the standing principle: `RESERVED_APEX.capForReservedMargin = 0` — a placeholder draws NO
dissolve; growth carried on the badge ('Not drawn on this placeholder mass…'); main.js applyRimBlend returns {suppressed:true} by identity;
RULE ENFORCED: a nonzero cap needs a SWEEP MINIMUM over ≥2 organs all ≥ floor (default-pose numbers back nothing) — reserve_check 31 arms.
Fixture-verified: suppressed:true in facts.json, badge disclosure, mass keeps 1878/1880 baseline teal px (618 when dissolved) — BY COUNT,
not pixel identity (separate runs carry sub-pixel pose jitter: 759 px >6/255 across the organ — never claim identity across runs).
ZONE FORMULA = ORDERING-ONLY (over-predicts 70%/4×, unsafe as pre-filter). ITEM 2: SMALL-POPULATION INVARIANTS enumerated in CLAUDE.md
(own section; family: cwd-pinned / closed-mesh / one-entry-per-category): category-keyed margin citation default; ONE origin hotspot per
organ; tangent mass march + chip stack; MASS_RADIUS_FRACTION 0.22 at 8–9 entries/organ; n≈1 uniqueness (bare-basename pointers, quote
spans, record_sync marker, one benign 404, one unmappable id, one material per GLB); trivial assertions (basis_test ratchet 0, 1 same-
appearance, 2 growth cats, hard counts 4 hotspots/4 sites/≥20 cells/≥3 feats/≥9 markers, IDENTIFIER accepts any URL unresolved); noise-
sized ratchets; layouts at 16 (2 label overlaps already, pelvic cluster, chip width, regress runtime per cancer). FIXES = separate decision.
ITEM 3: extent-by-category rationale beside GROWTH_CATEGORIES (ordinal claim about TERMS not cancers; per-entry variation needs re-ruling).
TOOLING: /tmp/atlas-verify/node_modules VANISHED overnight (puppeteer-core) — cure `cd /tmp/atlas-verify && npm install puppeteer-core`
(recorded in CLAUDE.md). NEXT: extent breach build (design first); PathologyOutlines four-probe at the window; TNBC gross growth read;
composition re-count. Before it, `7b8cf88` — two commits after f872940, both pushed under one-use grants (SPENT); layer
four GREEN for 7b8cf88: `DONE deploy_check: 28/28 assets byte-matched to HEAD 7b8cf88, 31 hotspots live, 0 unexplained page errors (2
declared-benign), 0 problems`; live main.js 56aa7408…, morphology.js 418cb44c…, cancer-atlas.html f7ee6dee… == HEAD's.
`fae364a` THE RESERVED APEX FLOOR: measured on the lungs fixture (reserved mass + rim-blend, frozen: extent 1.0 → 0.34 of the mass still teal,
reads; 2.5 → 0.10, a sliver, does not; the analytic zone fraction 0.58/0.41 over-predicts — pixels are the oracle) → morphology.js
`RESERVED_APEX` {floor 0.30, measured table, capForReservedMargin 1.0} + ONE shared band formula `rimBlendWeight`/`RIM_BAND`; the cap
applied BY IDENTITY (userData.phaseA.reserved) and disclosed on the badge; reserve_check asserts the cap sits at a measured extent ≥ floor
(26 arms). PRINCIPLE (user, standing): A RESERVED SIGNAL OUTRANKS AN ILLUSTRATIVE MAGNITUDE (provenance truth-claim > invented-and-
disclosed). ORGAN-SIDE FALLOFF RETIRED STRUCTURALLY (22% radius ratio → rings in mass radii are organ-scale; failed both criteria in
opposite directions) — never re-open in Phase C. HOUSE PATTERN (CLAUDE.md section): READ COVERAGE BY IDENTITY INTO THE FACTS FILE (twice
turned a suspicion into a number). COMPOSITION re-tested as mischaracterised-vs-unexpressed → all four UNEXPRESSED → deferral stands.
Pointers: closed (~6 h, workaround wins). `7b8cf88` INFILTRATIVE WIRED: `GROWTH_STATUS` for all 16 (11 cited / 1 uncharacterised / 4
unread; identifiers on every cited; stomach's PDQ page backs by URL — IDENTIFIER regex admits https URLs; page re-verified live),
`GROWTH_CATEGORIES` infiltrative ([0.6,1.4], extent 1.0: PDAC R2 H, PTC R18) + diffuselyInfiltrative ([2.0,3.0], 2.5: GBM R21) —
two categories because the WORDS differ (arm 3); rim-blend the SOLE channel (losers removed); `massBadge` = one chip both axes, text
names sources/register/cap; `EXTENT_UNDERSTATED` generic form (GBM first: KNOWN TO UNDERSTATE — drawn mass smaller than the cited
extent; PDAC perineural next); THE GBM HOLD LIFTED (margin poorlyDelineated arm 3 + growth drawn). DEFECT CAUGHT IN THE FIRST CAPTURE:
GBM's badge quoted PDAC's margin source (shared category, one citation) → CLASS: WHEN A CATEGORY IS SHARED THE CITATION BELONGS TO THE
ENTRY → marginBadge takes a per-entry override; GBM carries R21's words; re-captured OK. Ratchet growth_categories 0→2. Disclaimer
extended. NEXT on growth: extent breach, then wall; multifocal when it has a renderable member; TNBC growth read; PathologyOutlines
four-probe (window ≈ 2026-09-10T01:38Z); composition re-count after those. Before it, `f872940` (pushed under a one-use grant, SPENT; layer four GREEN: `DONE deploy_check: 28/28
assets byte-matched to HEAD f872940, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live main.js 4a74f902… and
morphology.js b2092744… == HEAD's) — THE INFILTRATIVE FALLOFF BAKE-OFF. Five channels DORMANT in main.js `applyGrowthFalloff` (opacity; organ-side
albedoBleed/roughAlbedo/darken; mass-side rimBlend), selected by morphology.js `FALLOFF_CHANNEL` (now 'rimBlend' = the recorded decision)
with `GROWTH_RENDER` EMPTY → production renders UNCHANGED until two rulings. Captures came from a TEMPORARY working-tree wiring (GROWTH_RENDER
pdac/ptc 1.0, gbm 2.5, luad 1.0 + gbm margin poorlyDelineated) that is restored after every run — grep 'BAKE-OFF TEMPORARY' must be 0.
VERDICT (design doc §9, like-for-like table): opacity FAILS (ghost tissue; 86% of changed pixels teal on the reserved cross-product);
organ-side channels FAIL — NO LEGIBLE MIDDLE: a mass is 22% of the organ radius so rings in mass radii are ORGAN-SCALE (pancreas head
7609/7609 vertices; brain 111,411/113,252 at GBM's 2.5 — 26% of brain pixels moved by ~0.5° hue, invisible) while small rings are a few
px; albedoBleed also blind on tan-on-tan. rimBlend PASSES all four criteria (dissolves the boundary, mass stays opaque, touches no organ
pixel, AO/AgX-independent, bleeds nothing into the organ). TWO RULINGS REQUESTED: (a) may a PLACEHOLDER mass wear the organ albedo at its
base when growth is cited infiltrative (the reverse cross-product; no live entry yet — TNBC growth is a seed); (b) GBM: rimBlend carries
diffuseness as DEGREE not EXTENT → the falsifier resolves as a LABELLED extent on the badge. HARNESS LESSONS: capture_organs.js `--freeze`
(stop autoRotate the instant the viewer exists; `controls.reset()` was WRONG — construction pose, masses left frame); facts.json carries
growthFalloff coverage by identity; meshopt GLBs are quantised to integer local units (~1e-5 scale) — the frame conversion was right, the
coverage was real. NEXT (after the rulings): wire infiltrative — GROWTH_STATUS table + fourth-property backing for growth + badge names
growth status + GROWTH_CATEGORIES.infiltrative {knob 'falloff', range excl. 0} + GROWTH_RENDER for pdac/ptc/gbm → lands the GBM collapse
(margin poorlyDelineated, arm 3 sameAppearanceAs) with its labelled extent; then remove the losing channels. Before it, `8c61b79` — two more commits after 8d06fa9, both pushed under one-use grants (SPENT),
layer four GREEN (`DONE deploy_check: 28/28 assets byte-matched to HEAD 8c61b79, 31 hotspots live, 0 unexplained page errors (2 declared-
benign), 0 problems`). `a99d4f4` BODY PICKER REPAIRED (user AUTHORIZED, from measured-not-repaired): DEPTH IS A VISIBILITY GATE, NEAREST
CENTRE IS THE CHOOSER, one exported `pickBodyMarker` for click+hover; far-side click-through GONE on purpose. GATE MECHANISM MEASURED:
facing test (normal·toCam) FAILS — no threshold separates visible/occluded across 24 yaws (visible down to −0.93, occluded up to +0.80);
exact raycast = 24 ms/call on the 339K-tri body (oracle only); CHOSEN = DEPTH-BUFFER TEST: on-demand MeshDepthMaterial(RGBADepthPacking)
pass to an offscreen RT with marker spheres on BODY_MARKER_LAYER (1) excluded, candidate centre depth vs body depth at its pixel, 1 cm tol.
TWO LESSONS: three 0.185 packs the depth MSB in RED (first unpack read alpha → everything 'occluded'; raw bytes settled it — re-measure if
three is re-pinned); THE ORACLE MUST MEASURE WHAT THE GATE MEASURES (ray through the sampled pixel centre, not the exact point — 3 silhouette
disagreements vanished). regress 'body marker picking <sex>': every eligible marker's own centre selects it + gate≡raycast at default and
across an 8-yaw sweep — 15/15 + 16/16, 0/248; regress 173 checks / 2 known. `8c61b79` RULINGS B–E: GBM → EDGE tier (TIER FOLLOWS ORGAN
ARCHITECTURE, hollow/parenchymal dimension in the mechanism table; PRE-REGISTERED FALSIFIER: a falloff extent reading as whole-organ tumour
→ labelled extent instead); COMPOSITION COUNTED = 4 entries (OCCC, ccRCC, GBM, seminoma; TNBC 'mixed' = margin word, 'mucinous' = subtype
share, excluded) → between thresholds → CANDIDATE SIBLING AXIS (not growth), deferred, re-count after the PathologyOutlines probes; ONE
RESERVED COLOUR BOUND TO THE OBJECT (colour flags, badge text specifies) → `margin_reserve_check.js` RENAMED `reserve_check.js` (git mv),
INSTRUMENTS/marker/sidecar renamed, RATCHET KEY MOVED BY HAND (`reserve_check.categories` 5, disclosed), growth hooks born in fixture form
(morphology.js GROWTH_KNOBS/RESERVED_GROWTH {count 1, falloff 0, protrusion 0, wall 0}/GROWTH_CATEGORIES {} / growthReservedViolations; 23
arms; new ratchet `reserve_check.growth_categories` 0); E = FALLOFF BAKE-OFF CRITERION PRE-REGISTERED (boundary-not-determinable not
soft-boundary; not organ-diseased-throughout; survive vertex-colour AO on the 7 AO organs + AgX; CROSS-PRODUCT with the reserved colour —
teal bleed; user's guess: opacity fails, roughness+albedo blend likelier — to be falsified). BUILD ORDER FLIPPED: INFILTRATIVE FIRST;
multifocal has ZERO renderable members (prostate whole-mount H; HGSOC needs 2 ovaries on a 1-ovary GLB; HCC majority single 247/400).
POINTER COST ESTIMATED NOT PAID: 581 pointers, 281 targets/20 files, 572/581 whole-line-unique, 9 structural → ≈6 h ≈ a day → WORKAROUND
WINS (notes on the existing line or in CLAUDE.md). NEXT: the infiltrative falloff BAKE-OFF (channels dormant in code, GROWTH_CATEGORIES
stays empty until the ruling; captures on PDAC/PTC + an AO organ + the reserved-colour cross-product; GBM's falsifier test). Then wire
infiltrative (PDAC, PTC, GBM) → discharges the GBM hold. PathologyOutlines four-probe opportunistic (window ≈ 2026-09-10T01:38Z).
Before it, `8d06fa9` — THREE ITEMS SHIPPED (cheap→expensive): `98406b5` THE BARE-CWD RULE,
`8d06fa9` GROWTH-AXIS DESIGN DOC + pelvic measurement + records. Both pushed under one-use grants (SPENT); layer four GREEN on each
(`DONE deploy_check: 28/28 assets byte-matched to HEAD 8d06fa9, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`;
live prostate.js d3a02bac… == HEAD's). ITEM 1 (98406b5): 'a wrapper that reliably supplies a condition hides every dependency on it' —
SWEEP BEFORE FIX: every pre-commit member run from /tmp with absolute paths, DONE-line integers + sidecars compared to the wrapped run →
4/15 independent (syntax_check, pointer_check, margin_reserve_check, regress), 8 LOUD (fraction_check exit 3; record_sync, internal_quote,
citation_polarity/crosscheck/paren_ledger no DONE; reach 5 problems/0 spans; head 23 problems/0 records), 3 VACUOUS GREEN over an empty
corpus (absence_claim_check, share_sum_check, duplicate_figure_check) — the dangerous class. RULE = convention D in battery.py's READ THIS
block: an instrument may not depend on anything the wrapper supplies beyond what it declares (marker, argv); BARE-CWD EXECUTION IS THE
PROOF — run_member() + extractor preflight now run from BARE_CWD (empty dir under WORK_DIR) with absolute paths; the 11 + extract_citations
self-root via os.chdir(parent-of-parent); the 3 vacuous ones now REFUSE an empty corpus (exit 3, fixture-proven); sweep re-run 15/15
identical. ORACLE SLIP (recorded): my scratch sweep fed two members the STALE /tmp/atlas-battery/records.json (Sep 5, 408 records) —
WORK_DIR resolves under $TMPDIR (/var/folders/…/T/atlas-battery), the battery header's own warning; against the real artifact both match.
ITEM 2 (8d06fa9, measured NOT repaired): pelvic hit test, male, default framing, click each centre under the app's rule (12px radius,
DEPTH wins): prostate→BLADDER, testis(L)→BLADDER, testis(R)→itself, bladder→itself; nearest-centre matches 4/4; midpoints disagree 6/6;
depths differ ~1.5% (same surface) → depth is the wrong discriminator there; one pose (auto-rotation changes depth order); NO CHANGE.
ITEM 3 (8d06fa9): `.claude/phaseA_growth_design.md` (NON_INSTRUMENT, 33rd .claude file) — the four-mechanism hypothesis (count / edge
falloff / placement-into-lumen / organ property) tested against every cited growth word (R2,R6,R8,R10,R12,R14,R16,R18,R19 + harvest):
SURVIVES WITH TWO AMENDMENTS — (b) parenchymal 'diffuse' collapses onto 'infiltrative' as edge EXTENT (R21 says 'a poorly delineated
MASS') → GBM may land at tier 2 not 4 (FOR RULING); (c) OCCC 'cystic and solid' fits none → fifth kind COMPOSITION, unbuilt; (d) COUNT
precondition (HGSOC bilateral needs both ovaries in the model; ovary screen shows one) + register caveat (prostate multifocality = whole-
mount H, disclose like R2); (e) wall mechanism: linitis plastica vs CRC annular = one expression, two extents. Per-mechanism design
(category/magnitude/reserved/reachability/cost); growth_reserve_check to be written FIRST; double-draw resolved as two channels (margin =
silhouette shape, growth-edge = junction MATERIAL); ONE PHRASE, ONE AXIS (PTC's two-word sentence = declared boundary case); colour stays
with margin (growth's reserved state is an absence). BUILD ORDER (user): count → edge falloff → extent breach → wall. FOUR RULINGS
REQUESTED: GBM tier; composition as fifth mechanism; colour policy; EDGE material channel (look-and-decide). RECORDS: prostate margin
0.005 (~8.5 mm) ON THE SPEC LINE (a 7-line note above it moved 14 pointers → refused, logged; same class as the testis comment — INSERTING
ABOVE POINTED LINES IN ORGAN FILES ALWAYS TRIPS pointer_check; put notes on the existing line or in CLAUDE.md); L2 retirement = INFERENCE
not measurement; 'specify the measurement, don't predict the count'; half-separation rule mis-specified (user's own). PathologyOutlines
four-probe (TNBC/FTC/acinar/ccRCC) opportunistic when the window opens (≈2026-09-10T01:38Z). Before it, `924c3f2` — BODY MARKER SIZE 23→11px, sized against measured separations; regress.js
reads rooted at the repo. Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD
924c3f2, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live body.js 71f95283… == HEAD's. THE
CONFLATION (user): 23px was kept for 'spheres dipped under the floor' after Tier 1 had already split visible size from the 24px hit
test (BODY_MARKER_HIT_RADIUS_PX 12 + 24×24 DOM proxies hold the floor). MEASUREMENT at the default framing (regress body_markers_<sex>.json):
female 105 pairs — 4.1px Ovaries~Bladder, 13.4 Ovaries pair, 14.1 Pancreas~Stomach; male 120 pairs — 4.0 Prostate~Testis, 7.2
Testis~Bladder, 10.0 Prostate~Bladder, 11.7 Pancreas~Stomach, 14.4 Testis pair. The 'below half the minimum' rule is unmeetable by a
legible dot (2px; 5.8px even excluding the pelvic set, against an adjacent pair) → the pelvic pairs REPORTED AS THE ANATOMICAL FLOOR;
11px chosen = the organ screen's value (one law product-wide); at 11px only the pelvic set overlaps (was 9/10 pairs at 23px); constant-
screen-size behaviour kept; hit test untouched. VERIFIED: regression on the size tree — placement green, minDist pairs IDENTICAL (F 4px
Ovaries~Bladder, M 4px Prostate~Testis), centres unmoved but 1px on two male markers (auto-rotation timing). HARNESS HAZARD FIXED:
regress.js read 'assets' + code_refs relative to cwd (battery pins cwd, so invisible to it); a standalone run from /tmp gave two false
FAILs and my scratch nocache server started from /tmp served a 404 page (0 markers, 'three' unresolvable) — SAME AMBIENT-CWD CLASS TWICE
IN ONE PASS; now `REPO = path.resolve(__dirname,'..')` roots every repo read, proven from /tmp (171 checks / 2 known). LESSON FOR SCRATCH
RUNS: start nocache_server.py with cwd = repo (`(cd $R && python3 $R/.claude/nocache_server.py PORT &)`) and run regress from anywhere.
Both body-screen items from the user's paste are DONE (placement c6b1b69, size 924c3f2). Before it, `c6b1b69` — BODY SCREEN: TESTIS MARKERS WERE ON THE THIGHS; PLACEMENT CHECK ADDED.
Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD c6b1b69, 31 hotspots live,
0 unexplained page errors (2 declared-benign), 0 problems`; live body.js 3712ded5… and testis.js 05529a83… == HEAD's. THE BUG: testis spec
0.40/±65 sat BELOW the male crotch (perineum 0.453 of height; female 0.464 — measured by a ray up the central axis) → the inward ray
entered the inter-leg gap, hits[0] = thigh, 17 cm off-axis vs a 4 cm trunk exit; the spec had been tuned for pixel SEPARATION (the
'~55px' was two thighs). THE FINDING (user): regress.js verified markers RESOLVE, not that they resolve CORRECTLY — closed mesh → always
a hit → miss-logging never fires; floor-vs-identity in the body screen; wrong body part = wrong-figure severity → own commit at once.
THE CHECK (guard before repair): regress 'body marker placement <sex>' — BELOW-CROTCH + BEYOND-TRUNK (double-sided probe ray from the
axis, >3 cm beyond the trunk exit = limb); identity READ from body.js's new `mesh.userData.marker` {organ, sex, heightFrac, angle, site};
`site:'limb'` declared on skin's female lower-leg point (exempt); per-anchor JSON body_marker_anchors_<sex>.json. WORKLIST: exactly the
two testis anchors; everything else on both bodies clean; margin: prostate 0.458 clears the male crotch by 0.005. L2 export NOT the
cause (9 cm gap vs mm subdivision moves — reasoned, not re-measured on the cage). FIX: 0.457/±30 (grid-probed: 0.455 still under the
crotch; 0.457 = lowest trunk-column height; 16px pair separation; ~4px from Prostate = anatomy = the crowding FLOOR). BASELINE MOVED:
male minDist 10px (Prostate~Bladder) → 4px (Prostate~Testis); female 4px unchanged; regress 169→171 checks, 2 known failures. ONE
REFUSAL LOGGED: an 18-line testis.js comment moved six prose pointers (pointer_check 6 flags) → comment restored to 9 lines, record in
CLAUDE.md ('BODY MARKERS RESOLVED, BUT NOT CORRECTLY' section), battery's record_count rewrite reverted not staged. NEXT = the SIZE
pass (item 2): BODY_MARKER_PROJECTED_PX 23→11 sized against measured pairwise separations (female min 4.1px Ovaries~Bladder, then
13.4/14.1px; male min 4.0px Prostate~Testis, 7.2, 10.0, 11.7px) — the pelvic pairs are the anatomical floor; hit test (24px) untouched;
centres must not move. Before it, `2b732ac` — GBM RULED ONTO THE SHARED INDISTINCT-EDGE FORM AND HELD on the ruling's
own condition. Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD 2b732ac,
31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live morphology.js sha256 3c5124c0… == HEAD's. RULING
(user): 'poorly delineated' is PTC's word → collapse under arm 3; 'topographically diffuse' is the GROWTH property (already cited on
that axis — reading it into margin double-counts one phrase across two properties); 'no capsula' distinguishes nothing. CONDITION:
the collapse lands only if the growth axis is DRAWING the diffuseness. READ FROM THE TREE: the growth axis is DESIGNED, NOT BUILT —
no code in morphology.js/main.js renders any growth consequence; spec §3's four consequences (exophytic/infiltrative/diffuse/multifocal)
are unrendered everywhere (stomach linitis plastica = histology text; GBM's 'Infiltrative margin' = a labelled tumour-map ZONE, not a
growth rendering) → HELD: gbm stays cited, no category, draws nothing; ref says ruled-and-held. WHAT LANDS IT = the GROWTH BUILD
(spec: 'design before building'; a scope decision for the user). DESIGN TENSION flagged for that step: spec's INFILTRATIVE
consequence ('soft falloff at the tumour margin') vs the margin axis's indistinct-edge idiom would draw one visual property from two
axes; GBM's growth is the DIFFUSE consequence — keep the two apart on paper first. RECORDED (user): three collapses = a VOCABULARY
finding (names on one appearance), not the axis running out of room — melanoma separated the same day; the harvest has good recall /
poor register precision (selection effect: the atlas's richest prose is histologic) → stays useful, GATED by the fourth property, not
distrusted; the PathologyOutlines four-probe (TNBC/FTC/acinar/ccRCC, window ≈ 2026-09-10T01:38Z) is the first blocked-to-tooling case
with NO alternative rung. CENSUS unchanged: cited 6 (6/6 backed; 5 rendered, GBM held), uncharacterised 7, unread 3; categories 5.
NEXT is the user's call: the growth-axis design/build (which lands GBM), or the four-probe when the window opens. Before it,
`a69c004` — MELANOMA WIRED AS 'irregular border', A SEPARATION (the user's queue
is exhausted). Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD a69c004,
31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live morphology.js sha256 28fb3d28… == HEAD's.
`irregularBorder` derived from R9's word alone: coarse SPIKE-FREE undulation — amplitude [0.14,0.22], freq [3.5,4.5] (coarse end of the
cited band, outside the reserved band), spikes 0; render 0.18/3.8/seed 11.4; disjoint from the indistinct-edge form on spikeCount and
from wellCircumscribed on amplitude; arm 3 does NOT bind because the citations' words differ (outline vs edge-distinctness). LOOK:
skin.png smooth-surfaced tan mass with a coarse lumpy OUTLINE (few large swells) vs thyroid.png PTC finely knobbed (many small knobs)
— separation on feature scale/count; kidneys.png placeholder is spike-free undulation too (broader swells, sea-glass) — the
pre-registered resemblance present, colour separates. VERDICT: the ill-defined family keeps TWO names on ONE appearance (PTC, PDAC),
no third; 'irregular border' is an OUTLINE category — the taxonomy that filed melanoma under ill-defined was refined. Badge carries
the flatness limit (macule/plaque not modelled). Presentation note: the skin mass anchors on the block's side-face hotspot, not the
epidermal top (not acted on). Categories ratchet 4→5. CENSUS: cited 6 (hcc, gbm, pdac, melanoma, seminoma, ptc; 6/6 backed; 5
rendered — GBM is the only cited-unwired), uncharacterised 7 (hgsoc, clear, luad, crc, ftc, acinar, tnbc), unread 3 (ccrcc, gdiff,
uc). OPEN FOR THE USER: (1) GBM wiring needs a ruling — R21's 'topographically diffuse, a poorly delineated mass with no capsula' is
ill-defined vocabulary with a diffuse qualifier; fourth axis position ('no discrete margin' as the finding, a designed rendering) vs
third member of the shared indistinct-edge form under arm 3; (2) the prostate no-mass-status question, CONDITIONAL on a source
stating gross inapparency (none found); (3) PathologyOutlines window ≈ 2026-09-10T01:38Z → one probe each TNBC/FTC/acinar/ccRCC.
Before it, `2cc0ce8` — TNBC READ (R23) NEGATIVE ON THE REGISTER RULE → uncharacterised;
melanoma PRE-REGISTERED as a separation. Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets
byte-matched to HEAD 2cc0ce8, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live morphology.js
sha256 1db0913d… == HEAD's. R23: no StatPearls TNBC chapter; ~35 OA texts; gross circumscription sentences belong to SPECIAL
LOW-GRADE SUBTYPES (secretory PMC8616217; fibromatosis-like metaplastic PMC12651393) — adjacent entities (FVPTC lesson); the
only general gross vocabulary is for invasive breast carcinoma as a whole (Korean Standardized Pathology Report PMC7920867 /
PMC7829577: 'ill-demarcated, well-demarcated (circumscribed), or mixed'; 'Approximately one-third of tumors have grossly
circumscribed margins') — recorded as the breast axis's gross vocabulary, not TNBC's characterisation. Three harvest-backed
statuses in a row fell on the register rule (FTC, acinar, TNBC — all histologic seeds). THE GAP NAMED: gross descriptions of
common carcinomas live in textbooks + PathologyOutlines 'Gross description' (gated, 429 window ≈ 2026-09-10T01:38Z) — one
probe each for TNBC/FTC/acinar/ccRCC when it opens is the cheapest route back to cited (path recorded, not taken). Pair-grid
cell (a) NOT REACHED TWICE; circumscribed family = seminoma alone. CENSUS: cited 6 (6/6 backed), uncharacterised 7, unread 3
(ccrcc, gdiff, uc); categories 4. MELANOMA PRE-REGISTERED (in the mapping doc, committed before the derivation): 'irregular
border' (R9, outline word) ≠ 'poorly defined/delineated' (edge-distinctness words) → PREDICTED SEPARATION, not a third collapse:
coarse spike-free undulation inside the cited freq band vs the shared indistinct-edge form; disjoint on spikeCount by
construction; perceptual read decides; resemblance to the spike-free placeholder EXPECTED (colour carries that distinction);
limit disclosed: a macule's flatness is not modelled. NEXT = melanoma derivation + capture (Skin) + look → commit. Before it,
`4323525` — THE FOURTH PROPERTY OF A DECLARATION AS A CHECK FIELD + THREE
SEEDED STATUSES REPAIRED. Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to
HEAD 4323525, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live morphology.js sha256 72c0b311… == HEAD's.
THE PROPERTY (user): a `cited` status must carry a resolvable identifier (PMCID/PMID/NBK/DOI) in its own ref or in the R-record it
names — `citedBackingViolations` in margin_reserve_check (five fixture arms, selftest 20), the fourth property after evidence-not-
conclusion / reason-required / closed-enumerated-set: 'the other three govern what a declaration says; this one governs whether it is
entitled to say it'. Its limit (identifier ≠ gross register) is in the check header. Own CLAUDE.md section before THE COVERAGE SPLIT.
GUARD BEFORE REPAIR: ran RED on exactly tnbc/gbm/acinar (all harvest seeds); worklist recorded before repair. REPAIRS: TNBC → `unread`
with Livasy CA et al. Mod Pathol 2006 PMID 16341146 doi 10.1038/modpathol.3800528 resolved bibliographically (HISTOLOGIC 'pushing
margin of invasion' 14/23 — gross-register source not yet read); GBM re-read (R21): Iacob & Dinca, J Med Life 2009, PMC3019011, PMID
20108752, CC BY, Pathology: 'Grossly, it appears topographically diffuse, a poorly delineated mass with no capsula…' → stays cited on
the identified source; scored ILL-DEFINED WITH A DIFFUSE QUALIFIER — the user's fourth-axis-position hypothesis ('no discrete margin'
as the finding) SUPPORTED BUT NOT STATED; fourth-position vs shared indistinct-edge form is a WIRING decision with its own
pre-registration; prostate acinar re-read (R22): NEGATIVE — StatPearls NBK470550 Gleason-only, no StatPearls pathology chapter, ~40 OA
texts/5 queries no gross margin or visibility sentence (PMC11048607 implies, doesn't state) → `uncharacterised`, the user's predicted
status on DIFFERENT grounds ('grossly inapparent' NOT FOUND stated, not claimed); the no-mass-status question stays OPEN and
CONDITIONAL on a source stating inapparency (the prostate placeholder is large + prominent on exactly that organ — noted). CENSUS:
cited 6 (hcc, gbm, pdac, melanoma, seminoma, ptc; 6/6 backed), uncharacterised 6, unread 4 (ccrcc, gdiff, uc, tnbc); categories 4.
ORDER (user): TNBC next (cell (a) transfers), then melanoma vs the shared PTC/PDAC form (a third collapse = 'one appearance, three
names'); GBM/prostate were re-read first, separately from the queue — DONE. Before it, `7d748cd` — THE COLLISION RULE'S THIRD ARM + PDAC WIRED UNDER IT + FTC
READ AND DOWNGRADED. Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD
7d748cd, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live morphology.js sha256 e4a85e45… == HEAD's.
ARM 3 (user): CITED-VERSUS-CITED, NEITHER MOVES — two cited categories that don't separate is worse than either failing against
the placeholder (both claims, both tissue-coloured, no badge says they differ), but both have citations and neither has magnitude
to spend without inventing it; the citations may describe ONE gross appearance, and identical render + distinction in prose is the
truthful outcome; manufacturing a difference is the invention the split forbids. Recorded in four homes (morphology.js wiring
procedure step 0, check header as a deliberate NON-check — cited-vs-cited overlap is never a violation — CLAUDE.md roadmap line,
mapping doc). ORDERING (fourth hardest-first): families circumscribed {seminoma wired; TNBC, FTC} / ill-defined {PTC wired; PDAC,
melanoma}; wire the nearest pair FTC + PDAC. FOUND BEFORE WIRING: `MARGIN_STATUS.ftc` was 'cited' on a harvest SEED about
encapsulated FVPTC (thyroid.js comment), not FTC — a seed is not a citation; the status census counts declarations and cannot see
this (limit now in the check header). R20 FTC READ (pre-registered ladder + scoring first): NEGATIVE ON THE REGISTER RULE —
StatPearls Follicular Thyroid Cancer NBK539775 has NO gross section; PMC12012812 (JCEM 2025, 2022-WHO reclassification cohort)
gives the predicted divergence (MI/EA encapsulated; WI 'no or partial encapsulation, often with a multinodular pattern';
multinodular FTC 12/23 = 52.2% only in WI) in the HISTOPATHOLOGIC register → recorded for Phase B, not a gross citation;
PMC12876452 'Encapsulated neoplasms of the thyroid gland' (Virchows Arch 2026, CC BY) + 13 OA texts: classification statements
only. FTC → 'uncharacterised' (draws the teal placeholder BESIDE PTC's cited mass — first organ with both). Census 8 cited /
5 uncharacterised / 3 unread. PDAC WIRED on R1 ('blur the macroscopic delineation') — derivation lands on PTC's indistinct-edge
region (reading 'blur' as softer than 'poorly defined' = manufacturing from synonyms): form HOISTED (`INDISTINCT_EDGE_RANGES` /
`INDISTINCT_EDGE_RENDER`, PTC values unchanged), shared BY REFERENCE, declared `sameAppearanceAs:'poorlyDefined'`; badge sentence
says 'Drawn with the same form as the poorly defined category: the two citations describe one gross appearance, so the distinction
is carried here in words, not in shape'; `sameAppearanceViolations` asserts the declaration is TRUE (same render object, equal
ranges, referent wired, no chain) — NEVER that a pair differs; 15 selftest arms; categories ratchet 3→4 (staged on record).
PAIR GRID: (a) FTC–seminoma NOT REACHED (fell at the read; TNBC pushing is the circumscribed family's next); (b) PDAC–PTC
COLLAPSED at the parameter level as predicted — the informative step was the derivation, the capture then checked cited-vs-
placeholder on ONE organ (thyroid.png: PTC tan+knobbed beside FTC sea-glass+smooth, separates on colour family at a glance).
Presentation limit recorded, not acted on: pancreas albedo is tan, so the cited tan mass has low contrast there. REMAINING
cited-unwired: TNBC pushing, GBM, prostate acinar, melanoma irregular border (4). Before it, `fd250f2` — THE HCC DEADLOCK
RESOLVED BY COLOUR (user ruling 2026-09-09:
option 2, NOT GREY). Pushed under a one-use grant (SPENT); layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD
fd250f2, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live morphology.js sha256 1dc3f43d… == HEAD's.
THE RULING, in substance: grey is inside the tissue gamut (necrosis, fibrous tissue) — a grey placeholder is the amplitude-0.10
midpoint relocated from geometry to colour; the colour comes from OUTSIDE the tissue gamut in the product's own vocabulary — the
marker teal is the app's 'interface, not anatomy' colour and no tissue in the corpus is teal. Option 3 (translucency) REJECTED:
cystic/mucinous/gelatinous are real gross descriptions. Option 1 (badge weight) REJECTED: relocates the misread onto the badge-blind
reader. Implementation note that would otherwise bite: EXCLUDE reserved masses from the cited-albedo fidelity measurement (no
citation to deviate from → enormous hue error against a value never claimed). HCC-lobulation sentence left EXACTLY as written.
BUILT: `RESERVED_COLOUR` 0x6aafaa (marker 0x35c9c1 desaturated: hue 176°, sat 0.30, light 0.55) — MEASURED FIRST: every hex in
js/organs sits on the warm arc 355°–46°, nearest 129° away; `RESERVED_COLOUR_RULES` ≥90° hue from every chromatic tissue albedo +
saturation ≥0.20 (never grey); `colourViolations()`; margin_reserve_check gained ONE FIELD (the colour twin of the geometry's
unreachability; 13 selftest arms incl. grey fires / tissue-arc fires / live silent; sidecar tissue_albedos=26, nearest_hue_deg=129,
NOT ratcheted; DONE line ends `reserved colour 129° of hue from the nearest of 26 tissue albedos (margin 90°), 0 problems`).
Cited masses keep the tissue-tan MASS_COLOUR 0xa89a8c. Every mass is NAMED `phaseA-mass` with `userData.phaseA.reserved` so the
lit-face fidelity measurement excludes reserved masses BY IDENTITY (recorded as condition (3)'s corollary in CLAUDE.md). It is an
ALBEDO not a light — condition (5) untouched, no bounce in the pipeline. #disclaimer says which masses wear which colour and why.
THE LOOK (evidentiary, in the mapping doc): `capture_organs.js` Kidneys Lungs Ovaries Liver Thyroid (label is 'Ovaries', not
'Ovary'); rendered hue MEASURED in the PNGs: reserved masses 159–164°, cited masses 26–30°, organ bodies 7–11° (~130° apart in the
RENDER, not just the albedo); honest limit: rendered saturation falls to 0.12–0.14 under the warm key + AgX — reads as sea-glass, so
compare HUE not vividness; the pre-registered kidney risk (pops like a marker) did NOT fire. No ratchet move (categories stays 3).
REMAINING cited-unwired: TNBC pushing, GBM, prostate acinar, PDAC poorly delineated, melanoma irregular border, FTC encapsulated (6)
— each with its own pre-registration + evidentiary look; the collision rule still binds (reserved form moves, never a cited
category) but the colour now carries the placeholder reading, so a geometric collision no longer forces a move. ccRCC pair folds
in when PathologyOutlines' window opens (~2026-09-10T01:38Z). Presentation item still open: badge chip overlaps the mass near the
frame top. Before it, `f63aa37` — THE THIRD CITED MARGIN CATEGORY WIRED: HCC 'nodular' (R11 named
divergence, nodular 348/400 drawn, infiltrative 52/400 NAMED on the badge not drawn) — AND THE PRE-REGISTERED DEADLOCK FIRED
(pushed; layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD f63aa37, 31 hotspots live, 0 unexplained page
errors (2 declared-benign), 0 problems`; live morphology.js byte-identical to HEAD's). USER chose HCC third because the seminoma look scored
the reserved form's only remaining move (more amplitude) as walking toward LOBULATED, and nodular HCC is the closest thing to
lobulated. Category: amplitude [0.02,0.06], freq [3.5,5.0], spikeCount [2,4], spikeLength [0.25,0.45], sharpness [1.5,3.0] (low
sharpness = wide cones = lobules); render 0.04/4.0/seed 9.2/3/0.35/2.2. THE LOOK (`node .claude/capture_organs.js <outDir> Liver
Kidneys Lungs Testis`, once, wiring tree, parent d24513d): NO FEATURE SEPARATES HCC from the reserved form at the default framing
— 'a blob with a few broad bulges' describes both; the pre-registered discriminator (discrete lobules with clefts vs continuous
undulation) is not legible at a few dozen px; seminoma's sphere stays distinct from all. BY THE DECISION MADE BEFORE THE CAPTURE:
NOTHING MOVED (reserved form unchanged since PTC; HCC values untouched), NO FOURTH TUNING PASS. ESTABLISHED: one shared reserved
form on the undulation axis cannot clear BOTH ends of the margin axis once a lobulated-family category is wired; the answer is no
longer geometric. Three options were laid out, none taken — RULED at `fd250f2` (above): option 2, not grey. Also flagged apart from the deadlock: HCC's lobulation is FAINT at
default framing — any change to HCC's values must be argued from the citation ('multinodular' = discrete nodules), NEVER for
separation. CLAUDE.md gained the ledger-attribution line beside guard-before-repair (the class doesn't exempt the records built
to avoid it; caught before wiring = the ordering tested on citation data for the first time). Categories ratchet 2→3. Remaining
cited-unwired: TNBC pushing, GBM, prostate acinar, PDAC poorly delineated, melanoma irregular border, FTC encapsulated (6). Before
it, `d24513d` — THE SECOND CITED MARGIN CATEGORY WIRED: SEMINOMA 'well circumscribed'
(pushed; layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD d24513d, 31 hotspots live, 0 unexplained page
errors (2 declared-benign), 0 problems`; live morphology.js byte-identical to HEAD's). USER RE-AIMED hardest-first: the PTC look showed the
reserved form's residual runs toward CIRCUMSCRIBED, so seminoma (not TNBC) was the binding constraint. ATTRIBUTION CORRECTED IN
PLACE before wiring: the harvest ledger filed "well-circumscribed solid intratesticular nodule" under PMC6906820; that span is
PMC13218944's (Front Oncol 2026 case report intro, qualifier 'typically'); PMC6906820 (Case Rep Urol 2019, PMID 31871817) has its
OWN general statement "Macroscopically, seminomas are well circumscribed, tan to pale yellow lesions with necrotic or hemorrhagic
foci."; PMC9162935 (Acad Pathol educational case) corroborates. Category: amplitude [0,0.05], freq [3.5,5.5], no spikes; render
0.03/4.5/seed 7.3. PRE-REGISTERED before looking: separation on SPHERICITY ~7/10; collision rule (reserved moves, seminoma has
nothing to give); the NOWHERE-LEFT-TO-GO possibility (a third move ⇒ one shared form can't clear both ends; then badge/non-
geometric, not a fourth pass). THE LOOK (`node .claude/capture_organs.js <outDir> Testis Kidneys Lungs Thyroid`, once, on the
wiring tree, parent c76a14c): seminoma = circle of near-constant radius, crisp rim, one smooth highlight; reserved = lungs an egg
with a distinct lower-right bulge, kidneys an oblong with one flattened side — discriminator UNIFORMITY OF CURVATURE, not edge
sharpness; SHARED: crisp continuous boundary (what 'circumscribed' keys on) — the badge does the rest. Collision rule NOT
triggered; reserved form NOT moved. Nowhere-left-to-go scored as a BOUNDARY REACHED: more amplitude walks toward LOBULATED; the
geometry has used its room; no third move made or proposed. Categories ratchet 1→2. Remaining cited-unwired: TNBC pushing, HCC
named divergence, GBM, prostate acinar, PDAC poorly delineated, melanoma irregular border, FTC encapsulated (7). Before it,
`c76a14c` — THE FIRST CITED MARGIN CATEGORY WIRED: PTC 'poorly defined' (R17)
(pushed; layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD c76a14c, 31 hotspots live, 0 unexplained page
errors (2 declared-benign), 0 problems`; live morphology.js byte-identical to HEAD's). What happened: (1) PTC chosen FIRST as the hardest
perceptual case (user); ranges amplitude [0.10,0.16], freq [5,7], spikeCount [10,14], spikeLength [0.10,0.18], sharpness [4,7];
render 0.13/6.0/seed 5.1/12/0.14/5.5 — an indistinct edge, NOT long fingers. (2) The check now also asserts RENDER INSIDE RANGES
(+2 arms, 10 total) and counts rendered categories; categories ratchet 0→1. (3) PRE-REGISTERED before looking: PTC may not be
distinct — collision at even odds; COLLISION RULE: the reserved form moves, never PTC. (4) THE RECORDED LOOK (evidentiary form,
in the mapping doc + commit message): capture `node .claude/capture_organs.js <outDir> Thyroid Kidneys Lungs` run twice on the
wiring commit's tree (parent 4ec6c06): FIRST (reserved amplitude 0.18, radius 0.16, offset 0.35) FAILED THE RESERVED FORM —
it read as a smooth sphere = circumscribed — and PTC sat mostly behind its gland; SECOND (0.24, 0.22, 0.6 — reserved form +
two SHARED presentation knobs moved, PTC untouched) stands: PTC's edge FINELY KNOBBED (bumps a small fraction of the radius,
crenellated silhouette) vs the reserved form's edge SMOOTH AT FINE SCALE with 1–2 BROAD swells (uneven egg) — the SCALE OF THE
SURFACE FEATURE is the discriminator. RESIDUAL stated: the reserved mass still has a defined edge (a reader could call it
smooth-bordered) — the badge carries 'not a claim'; the badge chip overlaps the PTC mass at the default framing (layout nuisance).
(5) THE THREE main.js POINTERS MOVED A THIRD TIME (edits inside addOriginMasses, above the site-map code) — re-pointed by
content, then CONVERTED TO SPAN FORM (roadmap names the call by `amplitude:0.14, freq:4.2` on its next line; idiom-collision
records quote the spread-pattern comment); pointer_check floor LOWERED 580→577 ON THE RECORD (`--lower-ratchet=
pointer_check.pointer.pointers:577 --lower-reason=...`; the six-spelled-pointers precedent). No `main.js:<line>` pointer remains.
NEXT: the second category (seminoma well-circumscribed or TNBC pushing), same four steps, its own recorded look; ccRCC folds
in after PathologyOutlines' window (~2026-09-10T01:38Z). Before it, `4ec6c06` (the evidentiary-look commit: capture_organs.js tracked + declared,
step 4 on the wiring line — pushed; layer four GREEN: `DONE deploy_check: 28/28 assets byte-matched to HEAD 4ec6c06, 31 hotspots
live, 0 unexplained page errors (2 declared-benign), 0 problems`; the live morphology.js carries the evidentiary step).
Before it, `f845157` (the limit-record commit — pushed; layer four GREEN: `DONE deploy_check:
28/28 assets byte-matched to HEAD f845157, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; the live
morphology.js carries the per-category wiring procedure). Before it, `78dc7eb` = PHASE A BUILD STEP 1 (pushed; layer four GREEN: `DONE deploy_check:
28/28 assets byte-matched to HEAD 78dc7eb, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems` — the
asset count rose 27→28 with js/morphology.js, and the live module is byte-identical to HEAD's). WHAT SHIPPED: `.claude/margin_reserve_check.js` = the SIXTEENTH battery member (node; loads
js/morphology.js via a tmp .mjs; asserts the reserved margin form UNREACHABLE from every cited category — axis band [1.6,2.4]
disjoint, box excludes the vector, no knob unbounded — plus statuses for all 16 entries and origin hotspots for all 14 organs;
condition (7) FIXTURE-FORM BY DESIGN, 8 arms incl. the rejected midpoint which FIRES; sidecar ratchets `categories` (0 at
birth, INITIALISED then HELD)); `js/morphology.js` (no three import) = RESERVED_AXIS freq band [1.6,2.4], CITED_FREQ_BAND
[3.5,9.0], RESERVED_MARGIN amplitude 0.18 (0.10 read as a smooth sphere = the circumscribed misread, raised for legibility),
freq 2.0, seed 3.7, spikeCount 0; MARGIN_CATEGORIES EMPTY at birth; MARGIN_STATUS (4 uncharacterised HGSOC/OCCC/LUAD/CRC, 3
unread ccRCC/gdiff/uc, 9 cited-not-yet-rendered); ORIGIN_HOTSPOT per organ; MASS_COLOUR 0xa89a8c illustrative; marginBadge();
`js/main.js` addOriginMasses() + hotspotPosition() shared with the marker loop + badge projection (clamped, staggered) +
dispose; 7 masses render on 6 organs (ovary ×2, lungs, colon, kidneys, stomach, bladder); CITED entries draw NOTHING until
wired; `.tumour-badge` non-optional DOM chip (button, full sentence as aria, activation writes it to the investigate card);
#disclaimer opens with the disclosure. LESSONS: the insertion ABOVE the site-map code moved every later main.js line — the
three tracked pointers (497→567 organicSpiculate site-map call; 536→606 spread-pattern comment) were RE-POINTED BY CONTENT,
after my draft message falsely said the insertions sat below them (caught by reading the pointed lines, not the diff).
Verified in headless Chrome via /tmp/ca-shots/shoot.js (scratch): badges + aria correct, 4 .organ-point per organ, keyboard
activation works, only the benign favicon 404. USER RULINGS ON THE BUILD REPORT (2026-09-09): (1) the amplitude correction found a LIMIT IN THE CHECK — it proves PARAMETER
DISJOINTNESS, the property that matters is PERCEPTUAL DISTINCTNESS, and the first doesn't imply the second (0.10 passed the
check and read as circumscribed); recorded in the check's header beside the fixture-form note. (2) THE VISUAL READ HAPPENS PER
CATEGORY WIRED — capture the new category beside the reserved form and LOOK, record the look with the wiring commit; written on
the MARGIN_CATEGORIES line in morphology.js. (3) the pointer staleness = same file twice, caught pre-commit by reading the tree
— the class graduating toward caught (user: "two catches by the same method isn't a mechanism"; the honest note stands).
(4) THE RECORDED LOOK IS EVIDENTIARY (user): capture command + commit (`.claude/capture_organs.js`, now TRACKED as a declared
NON-instrument — never a /tmp path), the TWO FORMS NAMED, WHAT SPECIFICALLY DISTINGUISHED THEM (checkable by opening the image);
"verified distinct" is the over-claiming annotation shape. Step 4 of the wiring procedure on the MARGIN_CATEGORIES line.
NEXT: wire the first cited margin category (PTC poorly-defined / seminoma
well-circumscribed / TNBC pushing are the cleanest) into MARGIN_CATEGORIES with ranges inside the cited band, flip its status,
let margin_reserve_check prove unreachability; ccRCC folds in when PathologyOutlines' window passes (~2026-09-10T01:38Z).**

`e382d08` → `3f0fc92` → `a34155c` → `82fc5fe` → `f970d38` ((7-quater) + build-not-blocked; pushed, layer four GREEN: `DONE deploy_check: 27/27 assets byte-matched to HEAD f970d38, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`) (the RATIFICATION at 82fc5fe; pushed, layer four GREEN: `DONE deploy_check: 27/27 assets byte-matched to HEAD 82fc5fe, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; live main.js carries the ratified knob-line note) (all pushed; e382d08 layer four green: `DONE deploy_check: 27/27 assets byte-matched to HEAD e382d08, 31 hotspots live, 0
unexplained page errors (2 declared-benign), 0 problems`) recorded, BEFORE ANY SOURCE WAS READ: the rate-limit result
(PathologyOutlines first fetch 2026-09-09T01:38Z → HTTP 429, Retry-After 86400, Sucuri, no CAPTCHA — NOT cleared for this
client; verdict RE-SOURCE; no second probe inside the window; PathologyOutlines is unreachable-today, hierarchy rung (2)
carries the reads); the 19-ITEM EXTERNAL QUEUE (thin set × {margin, growth}: PDAC, ccRCC, CRC, LUAD-gross, melanoma,
HCC, HGSOC, OCCC, PTC = 18, + bladder exophytic-papillary growth half); the PRE-REGISTRATION — **3 of 19 expected negatives
(range 2–4): LUAD margin, PTC margin (divergence threshold), skin margin (register), colon margin fourth** — and the
user's FOUR BINDING RULES (carry the count; check the source against itself; sweep siblings of a contrast-found defect;
no new world-scoped universal in a category claim). The user said the pre-registration line is the one to keep if
anything is cut: sourcing pulls toward finding something citable for every entry and "no distinctive morphology" is the
outcome that pull suppresses. Source landscape as measured 2026-09-09: WHO summary papers (digestive PMC7003895, female
genital PMC8494521) carry NO gross sentences; lung/urogenital/skin/endocrine WHO summaries are not OA; StatPearls chapters
located via `statpearls[book]` PubMed search (Colon NBK470380, LUAD NBK519578, HCC NBK559177, Epithelial ovarian NBK567760,
PTC NBK536943, Bladder NBK536923, Pancreatic NBK518996, Cutaneous melanoma NBK572149); HCC macroscopic review PMC11007400
(LCSGJ/KLCA gross types, satellite ≤2 cm definition); melanoma review PMC12427887 (radial→vertical growth; SSM "macule or
plaque with an irregular border"). Records go into citations.json `_phaseA_citations` (a prose string; the file
round-trips byte-identically with json.dumps indent=1, ensure_ascii=True, separators=(',', ': '), no trailing newline)
and the mapping doc's status log. **THE 19 READS LANDED at `3f0fc92` (pushed; layer four GREEN: `DONE deploy_check: 27/27 assets byte-matched to HEAD 3f0fc92, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`):
CITED 12 (PDAC margin+growth; CRC growth as a NAMED DIVERGENCE ulcerating 55–60%/polypoid 25%/flat 15–20%/diffuse 1%;
melanoma margin (irregular border, clinical-surface register DISCLOSED) + growth (radial→vertical); HCC margin+growth as a
NAMED DIVERGENCE WITH COUNTS (Gut 2023 PMC10579519: types I–III 348/400 vs infiltrative 52/400; MMC smooth/extranodular/
infiltrative; LCSGJ classification + satellite ≤2 cm from PMC11007400); HGSOC growth (bilateral, rung 1 PMC8070731); OCCC
growth (cystic-and-solid unilateral, rung 1); PTC margin+growth (StatPearls NBK536943 Gross Findings 'typically presents as an
invasive neoplasm with poorly defined margins'); bladder exophytic-papillary as a NAMED DIVERGENCE ~75% NMIBC vs ~25% MIBC).
NEGATIVE 5 (CRC margin subsumed; LUAD margin; LUAD growth; HGSOC margin — source says surface variable; OCCC margin).
UNREACHED 2 (ccRCC margin+growth — blocked-to-tooling, NOT negative; NEAR-MISS: a Cureus Table-5 pseudocapsule sentence
belonged to the PAPILLARY RCC row, checked by position, not taken). EXTENT one read (NCI staging page, five Summary Stage
categories verbatim). PRE-REGISTRATION SCORED: expected 3 (2–4), measured 5 — OVER BY ONE; named candidates LUAD margin +
CRC margin FIRED, PTC margin + skin margin DID NOT; unnamed LUAD growth/HGSOC margin/OCCC margin fired. PROPERTY-LEVEL FINDING:
negatives are 4/9 MARGIN halves vs 1/10 GROWTH halves — the gross literature carries growth FORM far more than margin
CHARACTER; the pre-registration reasoned per ENTRY not per PROPERTY. Europe PMC `BODY:` phrase search DOES search OA full
text (measured). **`a34155c` (pushed; layer four GREEN: `DONE deploy_check: 27/27 assets byte-matched to HEAD a34155c, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`; the live main.js fetched from Pages carries the knob-line note) RECORDS THE FOLLOWING.** **USER, ON THE REPORT (2026-09-09): the margin/growth asymmetry has a BUILD consequence — margin drives sharpness/spikeCount,
so an entry with a NEGATIVE margin still renders a shape, and every shape reads as a margin claim; a negative on margin needs a
RENDERING ANSWER, settled before the build. RATIFIED 2026-09-09 (mapping doc section 'The uncharacterised-margin default') WITH ONE CHANGE — RESERVE AN AXIS, NOT A
POINT: the reserved form is ORTHOGONAL (a treatment cited categories never use, e.g. gentle uniform undulation at a frequency
outside the cited range), NOT a midpoint on the spike scale (a midpoint is a value = 'intermediate margin' claim); TESTABLE:
the reserved form must be UNREACHABLE from any cited category's parameter range — the check ships WITH the build. BADGE YES,
NON-OPTIONAL (DOM metadata about the record); DASHED SILHOUETTE NO (a shape = a margin claim); label weighted above recurrence
(most visitors see one cancer). One shared default (same values + seed); growth governs where growth is cited; no silent
upgrade (the part tested first — a reserved form that happens to look right is the moment someone reaches for a quiet promotion); trigger comment appended ON main.js's knob line
(no line moved — three tracked pointers name main.js:497/536). Also ruled: lesson #1 (StatPearls thin on gross) is PER-CHAPTER;
the Cureus near-miss = the position check doing its job (3rd verbatim-correct/subject-wrong instance).** **USER (2026-09-09): THE BUILD IS NOT BLOCKED ON ccRCC — the two items resolve to a cited category or to the ratified reserved
default either way; fold them in when the window passes (~2026-09-10T01:38Z), never sequence the build behind them. THE
UNREACHABILITY CHECK is the project's FIRST guard shipping before its population exists: condition (7) satisfied against a
FIXTURE BY DESIGN (a live firing = the rule already broken) — the check's header must say so; recorded as CLAUDE.md (7-quater).**
Remaining for Phase A citations: ccRCC ×2 after PathologyOutlines' window (fold in, not a gate); second-tier items (stomach
margin, testis growth, bladder margin, FTC growth, GBM margin, prostate margin, TNBC growth) not in this queue.**

## ELEVEN MORE COMMITS — 2026-09-08, `387dd21` → `893b3c8` → `12abb27` → `3bcfc2b` → `746093d` → `7d6c221` → `80f74fc` → `0b2d5c2` → `c7f2e2e` → `f26bf63` → `78a9574`, ALL FOUR LAYERS GREEN, ALL ELEVEN GRANTS SPENT

Six one-use push grants, each asked for with the evidence in the question and each SPENT: `387dd21` (the
scratch-reference fix), `893b3c8` (the generalisation + the pointer repair it forced), `12abb27` (assertion 6 +
the writer scrub), `3bcfc2b` (the two rulings below recorded as prose only), `746093d` (the two-readers clause
at the FAILURE position), `7d6c221` (the queue: three flagged universals read, fetch pair repaired), `80f74fc`
(the thyroid 42.4→42.2 served-figure fix the user pulled forward), `0b2d5c2` (the new defect class + the
carry-both form rule, prose only), `c7f2e2e` (the stale-constraint class recorded with BOTH signs), `f26bf63`
(the queue closed: Chao identifiers, the testis item found already closed, the contradiction grep measured),
`78a9574` (the arm DECLINED at this size with a trigger; the read-from-the-tree class named). HEAD ==
`origin/main` == `78a9574`, tree clean apart from the 8 untracked model assets, layer four green for `78a9574`
(DONE line in its bullet below). **THE SESSION CLOSED HERE
ON THE USER'S WORD ("Queue's closed. Good place to stop.") — NO OPEN QUEUE ITEM REMAINS.** Re-verify HEAD and
origin/main live before acting.

- **`387dd21`** — `CLAUDE.md`'s two dead `~/Downloads/cancer-atlas-*` scratch references DESCRIBED AS
  EPHEMERAL, not chased (the user's ruling). Measured, not inferred: exactly two tilde-Downloads hits, both in
  `CLAUDE.md`, both targets absent; the wider `/tmp` class in the same file is larger and every target present,
  so live rather than stale and deliberately out of scope. Testis's substance survives as prose in the same
  entry; lungs' screenshots survive nowhere, but `assets/lungs.glb` is tracked (swapped in at `f358c0a`), so the
  fissure claim is RE-CHECKABLE — recorded as a loss made re-derivable, not a restoration. A path-resolution
  check was CONSIDERED AND DECLINED at the line: it would read this machine's `/tmp` and home, so it could never
  be green on a fresh clone. Not a PII fix — tilde-relative spans name no account — so distinct from `eff40fa`.
- **`893b3c8`** — the DONE-quote rule GENERALISED in `commit_checked.sh`'s header, at its parent paragraph, on
  the user's ruling that the placement checklist answers WHERE A LESSON LIVES while this answers WHAT A CLAIM
  MUST CARRY: **NAME THE POPULATION MEASURED, NOT THE CONCLUSION DRAWN.** The worked example is the failure
  itself ("eight items out of tree" vs "eight files absent from their old paths" — the second visibly does not
  establish the first), plus THE TELL: the conclusion is the one you wanted, so an expected answer on a
  sensitive action earns MORE interrogation. Publishes nothing new — `eff40fa`'s message already describes the
  incident at the same abstraction. **The insertion staled `battery.py`'s pointer to this script's scratch-repo
  fixture (the three git commands, lines 207-209 of `commit_checked.sh` at `893b3c8`), caught by running
  position one as a PRE-FLIGHT — which reader arrives at a line BEFORE inserting above it — the first time the
  checklist prevented a defect instead of explaining one. TWO DRIFTS OF ONE REFERENCE, `pointer_check` GREEN
  THROUGH BOTH:** a stale line number still exists in a file that only grows and this ref has no author+year
  oracle, so range-checking cannot see it — the measured cost of range-checking-only, instantiated a second
  time. Deleting the number (what the drift rule prescribes) would lower the ratcheted floor by one; brought to
  the user and **HELD — the number stays, updated, and the note at the line says held rather than settled.**
- **`12abb27`** — **ASSERTION 6: NO TRACKED FILE MAY CONTAIN A MACHINE-SPECIFIC ABSOLUTE PATH**, as a
  tracked-set assertion in `battery.py` beside the gitignore prose rule at the same tier. The user's ruling
  verbatim: *"Don't build a member for it. `battery.py` already asserts properties of the tracked set — all
  `.claude/` files declared, all `.gitignore` comments prose — and 'no tracked file contains a machine-specific
  path' is exactly that kind of claim. Put it there, alongside the gitignore prose rule, at the same tier. No
  sixteenth member, no sidecar, no ratchet. Population is currently zero, so it ships green and condition (7)
  needs a synthetic fixture."* `eff40fa` had recorded it as a candidate MEMBER; the ruling placed it differently
  and the declared count holds. **REDUCTION, NOT REMOVAL**: `ca3b627` and `0d437ef` still carry the path,
  history at and before `a131649` is immutable — stated in the docstring on the user's instruction.
  - **SHIPPED WITH THE WRITER-SIDE `$HOME` sed in `run_checked.sh`'s `log_refusal`, same commit
    (AskUserQuestion ruling).** Found before shipping: `log_refusal` sanitised `$TMPDIR` but not `$HOME`, so a
    failing gate could machine-write a home path into TRACKED `refusals.log`; the assertion would then fire
    forever and the only remedy — editing an append-only evidence archive — is forbidden by that file's own
    header. **The assertion would have wedged the chain.** The sed mirrors the TMPDIR sanitiser (a composed
    `scrub` script; TMPDIR first, reason in the function's comment); `run_checked.sh` selftest arm 12 asserts
    BOTH directions (symbolic `$HOME` present, expanded form absent); a mutant with exactly that one line removed
    fails exactly that arm and no other.
    **RULED A CLASS after the report (user, 2026-09-08): A GUARD THAT WRITES ITS FINDINGS MUST NOT BE ABLE TO
    WRITE A FINDING THAT FAILS ITSELF — the first guard failure in this arc ANTICIPATED rather than discovered
    (the coverage guard counting staging, deploy_check's total over stale bytes, the refusal log's zero over one
    entry were all found AFTER firing). Recorded in the repo at the FAILURE position of `battery.py`'s checklist,
    in `log_refusal`'s comment, and as its own `CLAUDE.md` section; the same commit puts the cwd FORM RULE beside
    the exit-code rule in `run_checked.sh`'s header. SHIPPED AS `3bcfc2b` (prose only, no behaviour change; gate
    14/14, 0 problems, ratchet held, set unchanged; record_sync_check 0 non-unique markers, internal_quote and
    pointer counts unmoved) — `DONE deploy_check: 27/27 assets byte-matched to HEAD 3bcfc2b, 31 hotspots live,
    0 unexplained page errors (2 declared-benign), 0 problems`, green at once. Every command of that commit was
    run by absolute path from a fixed cwd — the form rule obeyed before it was recorded.**
- **`746093d`** — **THE TWO-READERS CLAUSE** (user: "the part worth keeping"): the checklist's FAILURE position
  put its reader at a red terminal; the problem string has a SECOND reader, the archive (`log_refusal` copies a
  refusing run's tail into tracked, append-only `refusals.log`), so a leaking problem string costs twice — once
  ephemerally, once durably in a machine-written file nobody may hand-edit — and the durable cost is the
  expensive one the phrasing never suggested. Now stated in the position's own definition; the class paragraph
  beneath it de-duplicated to build on it; one sentence of the asymmetry in the `CLAUDE.md` class section.
  Prose only. `DONE deploy_check: 27/27 assets byte-matched to HEAD 746093d, 31 hotspots live, 0 unexplained
  page errors (2 declared-benign), 0 problems`.
- **`7d6c221`** — **THE QUEUE, handed over autonomously** (user: "Queue's yours from here: the two flagged
  universals, then the fetch pair"). Three universals adjudicated BY CENSUS, not by grep: `brain.js`'s White
  matter hotspot TRUE (all thirteen other organ files name where their wired cancer arises), `skin.js`'s
  "only cut block" TRUE, `prostate.js`'s "every other trunk entry represents a founding event" FALSE (the
  status-shaped trunk entries — GBM IDH-wildtype, OCCC TP53 status, bladder pathway-divergence, FTC RAS-vs-PAX8
  — represent none) → reworded to "the way a shared trunk mutation does", no corpus quantifier. `testis.js`'s
  bare-plural histology comparison stays OPEN (needs a slide read). Fetch pair: Brennan 2013 (NCBI efetch —
  Europe PMC fullTextXML returned 0 bytes for PMC3910500 AGAIN) gives 57.4%/13.1% as ALTERATION figures
  (amplification and/or mutation) → qualifier added to the second EGFR and PDGFRA records; Chao 2024
  (PMC11566382) separates 46 non-silent from a median 143 SBS per tumor, SBS1/SBS5 in 92.2%/84.3% with
  medians 25/89 → ovary note states the two bases apart, "non-silent" not "protein-altering", "dominated"
  dropped; rule 21 restated to match. **THE FIRST SETTLE RUN CAUGHT ME: the CLAUDE.md bullet's four
  `file:line` pointers RAISED pointer_check's ratchet 580→584** — the drift-prone form the pointer ruling
  retired. Pointers replaced by file + quoted span, `record_count.json` restored to HEAD by `git checkout`
  (discarding an uncommitted machine write is not a hand edit), second settle run held every ratchet; the
  bullet records the catch in its own opening sentence. Guard's universals-flagged-for-a-read 3→2. Gate:
  battery 14/14, 0 problems, 488 held, set unchanged, regress 169/2/2; four files (CLAUDE.md, brain.js,
  ovary.js, prostate.js). Pushed under its own grant. `DONE deploy_check: 27/27 assets byte-matched to HEAD
  7d6c221, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`.
  **USER, ON REVIEW: the ratchet catch is "a graduation worth noting"** — every prior write-a-defect-while-
  documenting-one instance was found by hand audit or an instrument's first run; this one was caught by a
  ROUTINE run of an EXISTING guard on a population change that WAS the defect: "the class moving from 'found
  by looking' to 'caught by the chain'", and it is the mechanism the glob-checker decline leaned on ("the
  ratchet fires on the population, and the population is what a bad pointer changes"). Recorded in 80f74fc at
  BOTH homes of the decline record (CLAUDE.md bullet + battery.py block A fourth item).
- **`80f74fc`** — **THE THYROID 42.4→42.2 FIX, PULLED FORWARD BY THE USER** ("a known-wrong figure on a served
  page, a one-character fix, deferred twice for being out of a batch's scope — batch scope is a reading
  convenience"; saved as [feedback-known-wrong-served-figure-never-waits]). Source read at full text (Hsia et
  al., J Pers Med 2025, PMC12843263 / PMID 41590496, Europe PMC fullTextXML 112,213 bytes): THE PAPER IS
  INTERNALLY INCONSISTENT — abstract 42.4%, Results "27 NRAS mutations (42.2%) among 64 samples" (27/64 =
  42.19%), Discussion 42.2%; 42.4% matches no count in the paper. Served note now "(27/64, 42.2%) than
  primaries (26/89, 29.2%)" — counts in the SAME parenthetical so fraction_check pairs them (field-string
  count 44→45, the one mismatch flag still the pre-existing pancreas 25/84 one). Rule 27 restated with the
  abstract discrepancy recorded (cite the Results — the Bolton rule). Gate 14/14, 0 problems, 488 held,
  regress 169/2/2, pointer 580 held; three files (thyroid.js, CLAUDE.md, battery.py — five comment lines, and
  the tracked set holds NO colon pointer into battery.py, checked before inserting). Pushed under its own
  grant. `DONE deploy_check: 27/27 assets byte-matched to HEAD 80f74fc, 31 hotspots live, 0 unexplained page
  errors (2 declared-benign), 0 problems`; the live file fetched from Pages reads "(27/64, 42.2%) than
  primaries (26/89, 29.2%)" with zero occurrences of 42.4.
- **`0b2d5c2`** — **A NEW DEFECT CLASS, RULED BY THE USER ON REVIEWING 80f74fc: THE ATLAS WAS ACCURATE TO ITS
  SOURCE AND THE SOURCE WAS WRONG.** Every prior class was divergence from a correct source; this is faithful
  copying of an incorrect one, and VERBATIM VERIFICATION PASSES ON IT ("42.4% appears in the abstract" is
  true; the epi contract's verified-quoted is silent by construction) — findable only by checking the paper
  against itself. Recorded beside THE BLADDER DEMONSTRATION in CLAUDE.md as the SECOND worked example of a
  limit on the method: bladder = figure-checking misses scope drift; thyroid = verbatim-checking misses
  source error. **AND THE FORM RULE (user): WHEREVER THE SOURCE GIVES BOTH A COUNT AND A PERCENTAGE, CARRY
  BOTH, in the same parenthetical** — no instrument, no declaration, no ratchet; it puts fraction_check onto
  claims it cannot currently see (a bare percentage is invisible to every guard; a percentage with its
  fraction is arithmetic that holds itself; 27/64 vs 42.4% would have fired at authoring time). Recorded at
  fraction_check.py's header BELOW line 13 (two tracked colon pointers name line 13 — checked before
  inserting, re-read after), with the two limits that stay: rounding collision, and a source wrong in both
  halves in agreement (needs a second source, no self-check reaches it). Prose only, two files. Gate 14/14,
  0 problems, 488 held, regress 169/2/2. Pushed under its own grant. `DONE deploy_check: 27/27 assets
  byte-matched to HEAD 0b2d5c2, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`.
  **APPLY THE FORM RULE GOING FORWARD: any new or edited figure whose source gives a count gets the
  count in the same parenthetical as the percentage.**
- **`c7f2e2e`** — **THE STALE-CONSTRAINT CLASS RECORDED AS A CLASS, WITH BOTH SIGNS (user ruling on
  reviewing 0b2d5c2).** THERE WAS NO PRIOR RECORD of the class in the repo — verified by grepping the tracked
  set for its vocabulary and listing every CLAUDE.md heading; its three instances (`m ≤ 1` clip-safe comment
  in viewer.js whose hard-clip cause AgX removed — found stale by the Tier 3 albedo prompt, never relaxed
  because that pass closed at Phase 1; main.js's glow note "DO NOT READ THE ABOVE AS A CONSTRAINT AGX
  LIFTED" — reason replaced, verdict kept; the ccf read-unit sentence "bound to a commit because no
  instrument prints it" made false by ccf_load.py and corrected in place) lived only at their sites. New
  CLAUDE.md section "A CONSTRAINT THAT OUTLIVES ITS CAUSE HAS TWO SIGNS" (before the demonstrative-sweep
  section): sign 1 = a RESTRICTION that outlived its cause (wastes effort, visible); sign 2 = a CAUTION that
  becomes a RECOMMENDATION once its guard exists (fraction_check: built because remediation was adding
  fraction/percentage pairs with no check behind them; the carry-both rule now says add them — same action,
  opposite verdict, only the guard changed). User: the second sign is the expensive one — an obsolete
  caution leaves a good practice discouraged and NOBODY NOTICES THE ABSENCE OF SOMETHING NEVER DONE. One
  remedy (check whether the reason still holds); the second sign's TRIGGER is a guard landing: ask what
  practice the guard was built against and whether that practice is now the mechanism. fraction_check's
  header names the inversion and points at the section. Prose only; gate 14/14, 0 problems, 488 held,
  regress 169/2/2. Pushed under its own grant. `DONE deploy_check: 27/27 assets byte-matched to HEAD c7f2e2e,
  31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`.
- **`f26bf63`** — **THE QUEUE CLOSED** (user: "Queue's yours: the testis histology read, Chao's identifiers,
  and the grep that's still waiting on its semantics problem"). (1) CHAO 2024 IDENTIFIERS: PubMed esummary
  read first (Chao A, BMC Cancer, 2024 Nov, PMID 39543535, PMC11566382, doi 10.1186/s12885-024-13125-5);
  written into the ovary.js provenance comment above PRIVATE_POOL_OCCC as "Chao et al., BMC Cancer, 2024,
  PMID 39543535, PMC11566382" — comment home (the corpus keeps identifiers in comments: 61 comment lines vs 4
  on-screen fields), single line so NO ovary.js line moved (record_count.json keys records by file:line —
  a shift would have re-keyed the set), head form without an initial (the Li Z lesson); rule 21's first Chao
  mention carries the same ids. Crosscheck ratchet RAISED 144→145 as predicted and staged; its metadata check
  passed the new id (same 3 known flags). MY SET PREDICTION WAS WRONG: I said one-out-one-in, the set stayed
  UNCHANGED — recorded as measured. (2) THE TESTIS ITEM WAS ALREADY CLOSED: the flagged phrase lives only in a
  testis.js comment recording that `6e3c310` removed it from the served field — which is why the guard never
  listed testis.js in this arc. My 7d6c221 bullet said it "stays on the open list": a FALSE claim about the
  repo's own contents, carried from the compaction summary instead of read from the tree — corrected in place
  with the mechanism named. LESSON: an open-items list inherited from a summary is a CLAIM about the tree,
  verify each item against the tree before repeating it. (3) THE CONTRADICTION GREP, MEASURED NOT BUILT: a
  lexicon-decidable sub-shape — record claims INDEPENDENCE over an axis (stage/grade/subtype/age/sex) while
  its attached comment (ccf_load.attached()) names a RESTRICTED LEVEL of that axis — FIRES on the pre-repair
  bladder.js at `2f35ac8^` ("primary NMIBC" vs "evenly distributed across stage and grade"); on the tree at
  f26bf63: 3 independence claims among 143 records, 1 candidate = the same bladder record firing on the
  repaired comment's NEGATED mention (polarity false positive); pancreas grade + skin subtype read clean.
  Recorded at the batch-4 "WHAT SURVIVES IS NARROWER" paragraph bound to the commit; whether it becomes a
  read-flag arm in absence_claim_check is a REACH decision left OPEN for the user; the probe script was
  scratch (/tmp, volatile) and deliberately NOT added to the tracked set — the lexicon in the CLAUDE.md
  paragraph is the shape to rebuild it from. Pushed under its own grant. `DONE deploy_check: 27/27 assets
  byte-matched to HEAD f26bf63, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`.
- **`78a9574`** — **TWO CLOSING RULINGS.** (1) THE AXIS-INDEPENDENCE ARM: "Don't build it" — 3 claims / 143
  records, the one flag a false positive from the REPAIR TEXT (bladder's fixed comment names the descriptor it
  removed; a lexicon matcher can't see the negation), so today 0 signal / 1 noise, and clearing the noise
  means a permanent declaration or a dependency on citation_polarity — real machinery for three items.
  DECLINED AT THIS SIZE WITH A TRIGGER, not an open deferral: **revisit when the axis-independence claim count
  crosses roughly fifteen** (re-run the lexicon recorded in CLAUDE.md's batch-4 paragraph). The false-positive
  mechanism is recorded beside it as the design constraint: REMEDIATION PROSE TRIPS LEXICON MATCHERS BY NAMING
  WHAT IT REPAIRED — fourth instance of the negated-mention family (Colombino, Boutros, the spelled pointer
  addresses, bladder); the negated mention IS the evidence of the repair, so it stays, spelled rather than
  removed. (2) THE READ-FROM-THE-TREE CLASS, named at its THIRD instance: a claim about the repo's contents
  carried from a session summary rather than read from the tree — the user's pointers.py precedent, the
  user's accepted "moved out of tree" report, and MY testis-open bullet. Remedy = the form rule one level up:
  **A CLAIM ABOUT THE TREE GETS READ FROM THE TREE** — not from a prior report, a summary, or memory of having
  done it (also in [feedback-verify-state-not-assumed-truth]). CLAUDE.md only; gate 14/14, 0 problems, 488
  held, regress 169/2/2. Pushed under its own grant. `DONE deploy_check: 27/27 assets byte-matched to HEAD
  78a9574, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`.
  - **THE ACCOUNT NAME IS NEVER SPELLED IN THE REPO**: needle from `os.path.expanduser('~')` at ONE call site
    (`main()`); two prongs (own home; `HOME_ROOT` = a `Users`/`home` root segment + name, catching someone
    else's account); the pattern deliberately does not match its own source (trigger comment on the pattern
    line; the live arm over the real index is the actual guard against a self-matching reformat); selftest
    fixtures COMPOSE paths from segments (`seg(b'Users', b'alice', ...)`) because `battery.py` is in its own
    population; the problem string names file + line (or byte offset) and NEVER the path — position two of the
    checklist under a new constraint: must be the reader's home AND must not carry the evidence. Bytes not
    text — binaries scanned, no exclusion list (each `.glb` measured: a `generator`, no `uri`). `tracked_paths()`
    is `git ls-files -z`, NUL-delimited. Reach DECLARED: POSIX-rooted (Windows spelling outside), and an
    unresolved `expanduser` ('~' returned unchanged) is dropped rather than used as a one-char needle.
  - **NOT A MEMBER OF THE ANCHOR FAMILY — CLASSIFIED OUT at the enumeration's tail** with reasoning and cost
    (the family is matchers deciding WHICH LINE IS THE STRUCTURE among prose; a leak scan has no boundary to
    collide at, so neither remedy — position, count — attaches, and entry 12's corroborator shape doesn't apply
    because the match IS the finding). The closure the block calls honest is "every matcher site in `.claude/`
    classified here", so out-of-family is written down, not omitted.
  - **CONDITION (7) MET TWO WAYS.** Fixtures: arm 21, ten sub-arms (prong one alone under a root prong two
    can't see — the arm that keeps prong one from being padding; prong two on both roots naming someone else's
    account; both prongs collapsing to one problem at the hit line; problem text free of the path; binary →
    byte offset; tilde-relative + bare root + neither-root all pass; a '~' home is no needle; an unreadable
    tracked file is a loud UNREADABLE problem; the live index clean). **AND ON THE LIVE PATH: a scratch clone
    under /tmp with a byte-identical `battery.py` was planted twice (a composed `/Users/<invented>` file; a
    `$HOME/...` file), `git add`ed, and `--selftest` exited 1 both times naming the planted file and line with
    the planted string appearing ZERO times in either output; the unplanted control exited 0.** That is the real
    `tracked_paths` / `read_tracked_bytes` / `expanduser` chain firing on a real index — no in-memory fixture
    can show it. Scratch clone and mutant copy removed afterwards.
  - The DONE line gained a clean-over-total clause naming its denominator; `__main__`'s git guard now says
    assertions 2 AND 6 read the index; the `SELFTEST PASS` sentence was extended.

**PRE-FLIGHT, THE HABIT `893b3c8` MADE MANDATORY:** before editing, grep the tracked set for colon-delimited
pointers INTO the files about to grow — zero existed into `battery.py` or `run_checked.sh`, so no counted pointer
could stale; the two spelled `battery.py` "line 151" records and the `refusals.log` shell-error transcript
(`run_checked.sh: line 216`, a real run's own words) are evidence and were left alone.

**THE GATE'S OWN LINES AT `12abb27` (verbatim):** `DONE battery: phase pre-commit — 14/14 declared instruments
ran and reported (marker printed, exit 0), 15 declared in total, 30 .claude/ files all declared, 23/23
.gitignore comments are prose not bare paths, 87/87 tracked files hold no machine-specific path, 488 citation
records extracted (ratchet 488 held; set unchanged), 7/14 reporting members emitted a sidecar, 5 sidecar metrics
ratcheted, 0 problems` — `DONE battery_selftest: 73 arms run, 0 failures` (63 at `893b3c8`; the ten are arm 21)
— `pointer_check` 580/580 and 266/266 unmoved — `==== DONE: 169 checks, 2 failures, 2 page errors ====` identical
to `893b3c8`'s line — and layer four: **`DONE deploy_check: 27/27 assets byte-matched to HEAD 12abb27, 31
hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`**, green at once — `387dd21`, `893b3c8`
and `12abb27` are all `.claude/`- or `CLAUDE.md`-only, and every one went green on `deploy_check` immediately,
the served-asset discriminator confirmed again. `record_count.json` and `refusals.log` untouched across all
three commits.

**SCARS THIS SEGMENT, EACH CAUGHT BEFORE IT SHIPPED:**
- **cwd DRIFT, AGAIN**: after a `cd /tmp/ca-plant` in one Bash call, two later "real repo" checks ran inside the
  scratch clone — one reported the planted file as if the repo had a leak. The FAIL line's filename was the tell.
  Both redone with `cd` prefixes. **Every Bash command here is absolute-path or `cd`-prefixed; a passing check in
  the wrong directory is worse than a failing one.**
- **A gate piped through `tail`** destroyed its exit code — same defect class as `; echo "exit $?"`; rerun to a
  file, read separately. The form that keeps the verdict AND prints it: `cmd > out 2>&1; rc=$?; echo rc=$rc;
  exit $rc`.
- **A corpus-scoped claim nearly entered `CLAUDE.md` prose** ("later entries do this") — the class `6e3c310`
  dropped; reworded to an instruction with the reason inline before any gate ran.
- **Nearly hard-coded the account name into a fixture / nearly excluded binaries without measuring** — the
  compose-from-segments and scan-everything decisions both came from catching those.
- **`tracked_paths()`'s docstring at first asserted WHICH names had split on whitespace** — an unverifiable
  specific about personal files; reworded to the mechanism only (name the population measured).

**STILL OPEN (unchanged queue):** the two unadjudicated flagged universals in `skin.js` / `prostate.js`; the
fetch pair (`brain.js:202` EGFR ccf qualifier, `ovary.js:269` "dominated by"); comment-contradicts-record grep
UNBUILT; whether `citation_head_check.py` line 88 / `citation_paren_ledger.py` line 125 were repaired; the
longer-standing items (Chao 2024 PMID, thyroid 42.4 vs 42.2, `kidneys.js` KDM5C "8 most" vs 19, Cooper
corrigendum, watchlist expiry 2026-10-17, POOL-MEMBER EXCLUSIVITY held). **Optional:** a `cancer-atlas` entry
in `~/app/.claude/launch.json` with a RELATIVE root (port 3055 free) so the Browser pane can start a preview.


## INDEX-LINE STATE AS OF 2026-09-08, PRESERVED VERBATIM BEFORE COMPACTING MEMORY.md (second compaction; a session working on a different, unrelated project performed it because the index approached its read limit — nothing summarised away; later sections may supersede it)

- [Cancer Atlas project state](cancer-atlas-project-state.md) — repo at **~/app/cancer-atlas** (RELOCATED 2026-09-08 from ~/Downloads — a drop target is how personal documents got into a public work tree); 16 cancers / 14 organs, GitHub Pages. **READ THE TOPIC FILE BEFORE ACTING** — it holds the four-layer gate chain (four ON PURPOSE, never add a fifth), the STANDING CONSTRAINTS, the flow rules that each cost a ~4.5-min gate run when missed, and the accumulated lessons. As of 2026-09-08 origin/main = HEAD = **80f74fc**, all four layers green, tree clean apart from 8 deliberately-untracked model assets. Latest arc, each commit on its own SPENT one-use push grant: dead scratch references described as ephemeral, not chased (387dd21); the DONE-quote rule generalised in commit_checked.sh to NAME THE POPULATION MEASURED, NOT THE CONCLUSION DRAWN (893b3c8 — its insertion staled a battery.py pointer that pointer_check reported GREEN through two drifts, the measured cost of range-checking-only; repaired in the same commit, the number HELD on the user's ruling); **battery.py ASSERTION 6 — no tracked file carries a machine-specific path — a tracked-set assertion beside the gitignore rule, NOT a sixteenth member, shipped WITH run_checked.sh's $HOME scrub because a firing assertion would otherwise machine-write the leak into tracked refusals.log and wedge the chain (12abb27); the account name is never spelled in the repo (needle from expanduser at one call site, fixtures compose paths from segments, problem strings name file+line and never the path); exposure in history (ca3b627, 0d437ef) is reduced, not scrubbed.** The 2026-09-07 "personal files moved out" report was **FALSE for three days** (relative `mv`; the check proved OLD PATHS, was reported as TREE) — hence [ask what was measured, not what was concluded](feedback-verify-state-not-assumed-truth.md), and per-file loops over sensitive populations are null-delimited. **An unpushed commit of ANY kind leaves layer four red.** **cwd DRIFT BIT AGAIN 2026-09-08** (two checks ran inside a /tmp scratch clone; one reported the planted file) — now a FORM rule, `git -C <absolute>` / absolute script paths for anything whose output becomes a claim. **RULED A CLASS: a guard that writes its findings must not be able to write a finding that fails itself** — the log_refusal scrub is the first guard failure in the arc anticipated rather than discovered; recorded in battery.py's FAILURE position, log_refusal, and a CLAUDE.md section (shipped 3bcfc2b, layer four green); the FAILURE position now states the problem string's TWO READERS — terminal and archive — and the asymmetric cost (746093d). **The queue shipped 7d6c221: three flagged universals adjudicated by census (prostate's was FALSE and reworded), Brennan/Chao fetch pair repaired at full text, testis bare-plural still OPEN; its first settle run caught four `file:line` pointers raising the pointer ratchet — span names instead, record_count.json restored to HEAD, never stage a ratchet raise your own draft caused.** Then **80f74fc: thyroid NRAS metastatic 42.4→42.2 fixed on the served page with counts (27/64 vs 26/89) — the paper's own abstract is wrong, its Results are right; the user pulled it forward as a known-wrong served figure that batch scope must never defer.** Still open: testis bare-plural histology read, Chao identifiers in ovary.js, the comment-contradicts-record grep. The Browser pane can't reach this repo (no cancer-atlas entry in ~/app/.claude/launch.json) — use the gates' evidence, don't claim a screenshot. Re-verify HEAD and origin/main live — a hook goes stale mid-session.


## INDEX-LINE STATE AS OF 2026-09-09, PRESERVED VERBATIM BEFORE COMPACTING MEMORY.md (a session working on a different, unrelated project performed the compaction because the index approached its read limit — nothing summarised away; later sections may supersede it)

- [Cancer Atlas project state](cancer-atlas-project-state.md) — repo at **~/app/cancer-atlas** (RELOCATED 2026-09-08), 16 cancers / 14 organs, GitHub Pages. **READ THE TOPIC FILE BEFORE ACTING** — it holds the four-layer gate chain (four ON PURPOSE, never add a fifth), the STANDING CONSTRAINTS and flow rules, the machine-path ASSERTION-6 regime, and every accumulated lesson (incl. this line's verbatim pre-compaction text, preserved 2026-09-08). **PHASE A CITATION READS LANDED at 3f0fc92 (spec `.claude/phaseA_mapping.md`, ledger in its status log + manifest `_phaseA_citations` R1–R19): 12 cited, 5 negative, 2 unreached (ccRCC, PathologyOutlines gated); pre-registration 3 → measured 5, negatives cluster in MARGIN halves (4/9 vs 1/10 growth).** **The uncharacterised-margin default is RATIFIED (2026-09-09): reserve an ORTHOGONAL AXIS not a point on the spike scale, reserved form UNREACHABLE from any cited category's range (check ships with the build), NON-OPTIONAL DOM badge + label, no dashed silhouette, no silent upgrade — the build may proceed under it.** As of 2026-09-09 origin/main = HEAD = **82fc5fe** (the ratification commit; layer four verdict in the topic file — re-run deploy_check if absent), tree clean apart from 8 deliberately-untracked model assets; **every push grant is one-use and SPENT; an unpushed commit of ANY kind leaves layer four red**; `git -C <absolute>` is a FORM rule; never stage a ratchet raise your own draft caused; a known-wrong served figure is fixed immediately, never batched. **0b2d5c2 records the NEW CLASS 80f74fc exposed — atlas accurate to its source, source wrong; verbatim-checking passes on it — beside the bladder demonstration, and the FORM RULE: wherever the source gives both a count and a percentage, CARRY BOTH in the same parenthetical (fraction_check then holds the arithmetic; no instrument, no declaration, no ratchet) — apply it to every figure edited from now on.** **c7f2e2e records the STALE-CONSTRAINT CLASS with both signs (new CLAUDE.md section): a restriction that outlived its cause, and a CAUTION THAT BECOMES A RECOMMENDATION ONCE ITS GUARD EXISTS — when a guard lands, ask what practice it was built against and whether that practice is now the mechanism.** **f26bf63 CLOSED THE QUEUE: Chao identifiers recorded (crosscheck ratchet 144→145); the testis item was ALREADY closed at 6e3c310 and my 7d6c221 bullet falsely called it open — corrected; the contradiction grep is MEASURED on one lexicon-decidable axis (fires on the pre-repair bladder fixture; 3 claims / 1 negated-mention false positive on the live tree) and the arm is DECLINED AT THIS SIZE (78a9574) with a TRIGGER — revisit when the axis-independence claim count crosses ~15; its one flag is remediation prose tripping a lexicon matcher by naming what it repaired.** **SESSION CLOSED on the user's word; no open queue item remains.** The Browser pane can't reach this repo — use the gates' evidence. Re-verify HEAD and origin/main live.

## NINTH FOLLOW-UP (2026-09-11): Phase D trials RULED AND BUILT — fetch-time filter replaces one-time query check

**Two corrections settled before code, both forced by re-examining the prior round's own read rather than trusting it.** The ccRCC 8th result (a CD70 kidney-imaging trial, broader-but-same-family) was distinguished plainly from a wrong-disease match, and 7/8 was named as the RAW on-subtype count, not the accepted rate — accepted is 8/8 on the property that matters, zero wrong-disease. Re-drawing the SAME ccRCC query a day later returned a COMPLETELY DIFFERENT 8-study set (zero NCT-id overlap) — live proof the corpus moves, not an assumption. That moved the architecture: from a one-time query-quality verification to a STANDING FETCH-TIME FILTER — every returned study's own declared `conditionsModule.conditions` checked against a small per-entry keyword set (word-boundaried, case-insensitive: `renal/kidney/rcc`, `gastric/stomach`), dropped and counted on mismatch rather than trusted because the query surfaced it. **The prior round's gdiff "genuine false match" (the NEO212 brain-tumor basket trial) was PARTIALLY RETRACTED**: its own conditions genuinely list "Gastric Cancer" — the same tag form the six "clean" results are credited for — so under the sharper standard it is a basket trial that genuinely includes the target disease, not a wrong-disease match, structurally identical to a live ccRCC basket trial (ADU-1805) found in the same day's re-draw.

**Built:** `js/trials.js` (new — fetch, the fetch-time filter, four states LOADING/RESULTS/EMPTY-ANSWERED/EMPTY-UNANSWERED, the duty-of-care copy, status+staleness display, drop-count reporting per entry), wired at the cancer screen's SITE-MAP level (level 1 — the opposite level from the histology toggle, since trials describe the whole entry, not one site) via `#txTrialsToggle`/`#txTrialsLayer` in `cancer-atlas.html` and four wiring points in `js/main.js`. No organ file touched — `TRIALS_CONDITION_MAP` lives centrally in trials.js, same pattern as `MARGIN_STATUS` living in morphology.js rather than scattered into organ files.

**Condition (7) on the real shipped filter** (imported directly with a minimal DOM stub, not a re-implementation): 9/9 assertions passed, including the planted gdiff wrong-disease fixture (dropped) vs. the same fixture with "Gastric Cancer" appended (kept), and the real live "Oncology"-only ccRCC false-negative reproduced verbatim and honestly labeled as a false-negative, not a catch. **A real accessibility gap was found and fixed while building, not after**: the first draft hid `#txSiteViewer` via its existing `.hidden` CSS class alone, which left every site-label button keyboard-reachable underneath the trials panel (the same trap `#txCellLayer`'s own comment documents) — fixed by also toggling `inert`, verified directly against the live DOM (`el.matches(':disabled, [inert], [inert] *')` reads `true`).

**Live-verified in the browser**, both entries, real fetches (own dev server on 3055, since another chat's server was already noted running against this folder): ccRCC 10 fetched/1 dropped/9 shown, gdiff 2 dropped, correct sort, the multi-condition note firing correctly on titles that don't name the reader's condition, toggle on/off restoring the site map cleanly, level-1/level-2 mutual exclusivity confirmed (histology toggle correctly swaps in at level 2), mobile layout (375×812, fresh load) clean, zero console errors.

**Gate chain, twice, both instances hitting the standing ambient-cwd scar (now a FOURTH live instance of that class) — see [feedback-explicit-form-over-ambient-state](feedback-explicit-form-over-ambient-state.md) for the mechanism the harness itself confirmed this round.** First `commit_checked.sh` attempt failed exit 127 (relative path, drifted background cwd) — no damage, no commit created, matching the established safe-failure precedent; the retry (this time following a foreground `cd`, though without the `&&`-prefix I intended) succeeded and committed **67b21d2** — full battery 16/16, regress 173/0, both page errors declared-benign, clean-worktree-verified. Pushed under a one-use grant; `deploy_check.js` correctly reported NOT PUBLISHED (Pages hadn't finished building) on the first wrapped attempt, logging a genuine refusal to the tracked `refusals.log`; an unwrapped bounded retry loop (8×25s, backgrounded) confirmed 29/29 byte-matched on its very first attempt. That refusal-log entry then needed its OWN commit (**62f016d**, bookkeeping only, no served asset — no Pages wait) — full chain again, clean-worktree-verified, pushed under a second one-use grant.

**CURRENT HEAD = origin/main = `62f016d`**, tree clean apart from the same 8 pre-existing untracked model assets. Both push grants spent. The remaining fourteen entries' condition mappings are still NOT built — deferred to whenever a ruling opens that scope. Full record in `.claude/phaseD_trials_design.md` §§1a–1d, §9.

## TENTH FOLLOW-UP (2026-09-11): determinism confirmed, four harness fixes, all sixteen trials mappings built — Phase D CLOSED

**Determinism challenge, resolved before trusting the "corpus moves" narrative.** Three identical ccRCC curl fetches within ~1 second returned byte-identical ordered NCT-ID sequences — `sort=LastUpdatePostDate:desc` is deterministic within a tight window, so the shipped "Listed by most recently updated" copy is not a false claim on served content. The day-over-day volatility finding stands but its cause was OVERCLAIMED at first ("new registrations") — corrected in `.claude/phaseD_trials_design.md` §1a to the precise claim: `LastUpdatePostDate` is a signal many *pre-existing* trials' metadata touches routinely (status updates, amendments), which makes a narrow `pageSize=10` recency-sorted window volatile without any new registration ever occurring.

**Four harness fixes, all generalizing past Phase D, shipped in `4c53968` (already pushed+deploy-verified before this segment began):** (1) a sibling of the trials.js `#txSiteViewer` inert gap found by sweeping — `#disclaimer` (a real focusable region) was hidden via CSS under three conditions with no JS ever managing its `inert` state; fixed with one shared `updateDisclaimerInert()` (OR of all three, recomputed every call) rather than three independent toggles. (2) `run_checked.sh` had its OWN self-rooting gap distinct from `commit_checked.sh` (which already `cd`'d to repo root) — fixed by adding the missing `cd "$DIR" || exit 2`; explicitly does NOT fix the irreducible outermost layer (a bad relative path to the wrapper script itself, before any code inside it runs). (3) `regress.js` now early-exits on non-served-asset commits via a new shared `.claude/served_assets.js` (`isServedAssetPath`/`changedServedAssets`, the same discriminator `deploy_check.js`'s PUBLISHED layer already used) — prints a real `==== DONE: SKIPPED — 0 served-asset paths changed...` marker and exits 0, satisfying battery.py's assertion 1 without paying the ~15-minute browser-suite cost on tooling-only commits. Verified on real repo history both directions after a testing-methodology mistake (checked out an OLD regress.js into historical worktrees the first time) was caught and corrected. (4) `deploy_check.js`'s propagation-delay handling — previously a hand-applied comment-block procedure — is now mechanized: `pushChangedPaths`/`explainableByPropagation` decide whether a NOT PUBLISHED finding is explainable (every stale file is inside the push's own changed set), and on a positive decision the check waits 30s and retries once internally, reporting a clean DONE line flagged `(publish check retried once)` — and critically NEVER logs that as a refusal, unlike the probe's own retry (a resolved propagation delay describes nothing true about the current site, so there is nothing left to refuse by the time it resolves).

**All fourteen remaining condition mappings built and shipped in `e1efb6c`, closing Phase D's trials integration for all sixteen atlas entries.** Per the batch's own explicit economics: since the fetch-time filter (built in the ninth follow-up) already degrades a bad mapping into missing content with a counted drop rather than displaying wrong content, all fourteen shipped without hand-verifying each result set first — gated instead by two signals, both newly instrumented: (a) the existing drop-count-on-a-live-sample check (catches over-broad queries), and (b) a NEW query-total/parent-total ratio via `countTotal=true` (catches over-narrow queries, which drop count is structurally blind to — the query simply never fetches what it's missing). New checked-in tool `.claude/trials_mapping_check.mjs` runs both signals against the real `TRIALS_CONDITION_MAP` and the real shipped `filterByCondition`; full 16-row results table in `.claude/phaseD_trials_design.md` §10. **One real bug caught before shipping, not a testing artifact:** seminoma's first-draft keywords (`testicular/testis/germ cell`) dropped 3 real trials tagged bare `"Seminoma"` — the exact disease name — because none of the keywords is a substring of it; caught by reading every drop's full (untruncated) conditions rather than trusting the count, fixed by adding `'seminoma'` itself. **Two sibling-organ risk checks (ovary hgsoc/clear; thyroid ptc/ftc — two wired entries sharing one organ-level keyword set) both resolved with real data, no architecture change needed:** genuine basket trials spanning both subtypes are correctly relevant to both, the same named-broadening shape as ccRCC's CD70 case, occurring twice per organ rather than once because these organs have two entries where kidney has one.

**Gate chain this round hit the ambient-cwd scar a FIFTH time, with a new trigger** — see [feedback-explicit-form-over-ambient-state](feedback-explicit-form-over-ambient-state.md) for the mechanism: this instance was a TURN-BOUNDARY reset (cwd reverted to the primary working directory `~/app` after a background-task completion notification, not merely a backgrounded command's own cd failing to propagate) — caught when a bare `git worktree remove` failed "not a git repository"; fixed for good by switching every git/verification command in this chain to `git -C /abs/path` regardless of cause. `e1efb6c` verified clean pre-commit (173 checks/0 failures, battery 16/16/0 problems) and again in an isolated detached worktree; pushed under its own one-use grant. **`deploy_check.js`'s brand-new internal 30s retry fired for real on this push and was NOT enough** — `js/trials.js` still read NOT PUBLISHED after the internal retry (HEAD 18784B vs served 12184B), correctly refusing rather than retrying a second time internally (refusal logged to `.claude/refusals.log`, 2026-09-11T16:11:31Z). A single human-level wait (75s more) and one manual re-run resolved it clean: 29/29 byte-matched, 0 problems. That refusal then got its own bookkeeping commit (`83da6a2`, matching the `62f016d` precedent exactly — no served asset touched, no Pages wait, regress correctly SKIPPED per fix #3 above), clean-worktree-verified, pushed under a second one-use grant.

**CURRENT HEAD = origin/main = `83da6a2`**, tree clean apart from the same pre-existing untracked model-asset files at the repo root (`colon.glb`, `digestive_system__human_anatomy.glb`, `pelvic_organs_from_mri.glb`, `realistic_human_lungs.glb`, `realistic_stomach.glb`, `small_and_large_intestine.glb`, `stomach-3d-model.webp`, `tiroides_andrea__dacs_ujat.glb` — untouched, not investigated or cleaned this round, presumably scratch downloads from the asset-hunt passes CLAUDE.md documents). Both push grants spent. **Phase D — trials integration — is now COMPLETE for all sixteen active entries**, no deferred scope remains; the next open item is whichever the user opens next (Phase B statistics integration, Phase C breadth to ~120, or the wall/multifocal growth-mechanism items phaseA_closeout.md lists as unbuilt). Full record in `.claude/phaseD_trials_design.md` §§1a–1d, §9, §10.

## ELEVENTH FOLLOW-UP (2026-09-11): crowding ruled (option B built), a live origin-collapse contradiction fixed, the over-narrow signal retired a SECOND time on direct measurement, the SEER scraper rescued, a single cwd-proof wrapper built — four commits, all live

**Investigation-only phase (no code) delivered a report covering all three follow-ups plus the crowding-options analysis plus a Phase C count — this is the report the NEXT user message responds to, and it is worth recording because it never rendered in a later turn's visible context (a session-internal display gap, not a compaction): drop lists read fresh (zero seminoma-class misses across the corpus's 12 real drops), `clear`/`ftc` checked against the atlas's own cited incidence shares (both ~3.0% trial-share against ~10% incidence — HGSOC used as calibration, at an even LOWER 6.87% ratio despite being the dominant subtype, arguing registration-naming variance rather than a broken query), the SEER scraper's real state audited (13.5KB at `/tmp/ca-seer-statfacts-scraper.py`, 15-for-15 reproduction, 9 refusal assertions, validated only against the 15 pages already cited), three crowding options laid out with cost/foreclosure/reserved-density-interaction (A-shrink, B-one-mass-at-a-time, C-per-entry-origin), and 35 already-staged `active:false` entries counted directly from the tracked files for Phase C's first wave. That report also found, while reading `addOriginMasses()` to write the options table, a LIVE defect at N=2: ovary's `ORIGIN_HOTSPOT` (one shared anchor per organ) pointed both `hgsoc` and `clear` at the Surface-epithelium hotspot, even though that same hotspot's own text says clear-cell arises in endometriosis instead — shipped, not hypothetical. B was ruled via `AskUserQuestion` (not a plain chat reply, which is why it didn't show as user text on a later re-derivation) and built as `7372797`.**

**The ovary contradiction, fixed ahead of everything else per explicit instruction, sourced to the same standard as every other hotspot in this atlas.** Real verification (PubMed esearch/efetch, not assumed): ovarian endometriomas form by CORTICAL INVAGINATION — Gordts et al., *Best Pract Res Clin Obstet Gynaecol*, 2003 (PMID 12758100): "the invagination of the cortex results in the formation of an endometriotic pseudocyst," with "primordial follicles present at the base" (the SAME structure ovary.js's own Cortex hotspot text already names); corroborated by Scurry et al., *Int J Gynecol Pathol*, 2001 (PMID 11293160). Ovary's Cortex hotspot text gained a sourced second sentence; `js/morphology.js` gained a new `ORIGIN_HOTSPOT_ENTRY` (per-CANCER-ID override, `clear: 1`, falling back to the organ default when absent); `js/main.js`'s `previewMass` now resolves the override before the organ default. **`.claude/reserve_check.js`'s existing per-organ origin guard had a blind spot that let the original contradiction ship**: it accepts an organ-level `desc` fallback, and ovary's own desc already says "ovarian cancers begin [at the surface]" regardless of which hotspot a mis-sited entry actually used — so a NEW, STRICTER function (`originHotspotEntryViolations`) was added requiring a per-entry override's OWN hotspot text to speak of origin directly, no desc fallback, with condition-7 fixture arms proving it fires on the exact bug shape before trusting its zero on the live tree. **`.claude/regress.js` gained a live-position check** (`organ ovary origin anchor resolves to the override, not the organ default, for clear`) reading the real mesh's world position from `state.organViewer.scene` by name identity and comparing it against both candidate hotspot anchors — proving the mass resolves CORRECTLY, not just that it resolves (the exact resolve-vs-resolve-correctly gap the body-marker placement bug already taught this project to check for). **Verified live in this session's own Browser-pane tab that the Cortex info-card text updated correctly; the mass-position swap itself could not be verified there** (that tab's `document.hidden` stays true, so the app's own rAF-driven screen-projection never ticks — a known, already-documented limitation of that specific tool for this specific app) — **verified instead via the real regress.js check under real headless Chrome**, which passed cleanly: `distHoveredToOverrideHotspot≈0.0029` (Cortex) vs `distHoveredToDefaultHotspot≈0.026` (Surface epithelium) when `clear` is hovered, and the reverse when `hgsoc` is default. **The "sweep the other thirteen organs" instruction was answered more precisely than a manual per-organ read could:** the exact defect shape (2+ active entries sharing one origin anchor where their real biology disagrees) is structurally IMPOSSIBLE on 12 of the 14 organs, confirmed directly against the real registry (each has exactly one active entry, so no sibling to collapse with) — only ovary and thyroid have 2+ active entries, thyroid was independently re-confirmed correct (its Right-lobe hotspot text contrasts follicular-cell PTC/FTC against C-cell medullary, correctly implying both real entries share one true origin).

**My own ovary.js edit staled 11 hand-typed `file:line` pointers into `.claude/citations.json`** (a 9-line sourced comment inserted above the Cortex hotspot pushed everything below it down by +9, matching the exact "one edit moves many pointers at once" class this project has hit repeatedly) — 10 were caught by `pointer_check`'s own identity oracle (author+year), ONE MORE was found only by reading (`.claude/citations.json`'s `entries[].code_refs` population isn't identity-checked against an oracle the way `backfill` refs are, so a duplicate, unflagged stale Peres-2019 `code_refs` pointer at the same old line sat there silently). All 10 automated suggestions were verified by direct content inspection before being applied (per "nearest is not identity") — all 10 checked out, including one genuine wrapped-citation case (`Malpica et al., Am J Surg Pathol,\nPathol, 2004` splitting across a line wrap, so the extractor recorded the fragment "Pathol" as an author). **First attempt at the fix used a Python `json.dump` rewrite and reformatted 154 lines for 10 intended value changes (whitespace/key-order drift from a different serialization convention) — caught before committing, reverted, redone as 11 surgical string-level edits, final diff exactly 22 lines (11 changed values).** Landed together with the ovary fix as `24f4466` (on top of `7372797`), both verified clean pre-commit and in an isolated worktree (190 checks, 0 failures, battery 16/16, 0 problems), pushed together under one grant. `deploy_check.js`'s internal 30s retry fired on both this push and the prior one and was insufficient both times; one human-level wait-and-retry each resolved cleanly (29/29 byte-matched), each followed by its own bookkeeping commit (`83da6a2` for the e1efb6c-push refusal — already recorded above — and `a1167e8` for the 24f4466-push refusal, four served files this time since two commits pushed together).

**The over-narrow trials-mapping signal was retired a SECOND time, on direct measurement, not a hunch.** The user's proposed replacement — run the parent query and pass every result through the entry's own `filterByCondition`, comparing kept-from-parent against kept-from-narrow — was built with real exhaustive pagination (confirmed live: ClinicalTrials.gov v2 silently caps `pageSize` at 1000, `nextPageToken` continues) and run against all 16 real entries. Before trusting the result, the numbers were checked against the retired ratio signal directly: `gap ≈ parentKept × (1 − ratio)` held to within ~1 on every entry (clear: predicted 884.6, measured 883) — mathematically the SAME organ-share confound in different arithmetic, not an independent signal, because `conditionKeywords` is deliberately organ-level (by design, to avoid wrong-organ false negatives) and an organ-level filter applied to an organ-level parent query mostly just re-discovers the size of the organ's own pool. **There is currently no working over-narrow signal.** `.claude/trials_mapping_check.mjs`'s header and printed output were rewritten to say so plainly (both the ratio and the gap now print `[RETIRED]`); `.claude/phaseD_trials_design.md` gained a new §11 recording the finding, the mechanism, and what a CORRECT signal would need (a genuine subtype-discriminating term per entry — deliberately NOT attempted under time pressure, since several entries' own distinguishing word is the generic "adenocarcinoma" (gdiff/luad/acinar/crc), which wouldn't discriminate within an organ where adenocarcinoma is already dominant — the exact class of mistake the seminoma keyword bug already taught this project to avoid rather than invent under pressure).

**The SEER scraper was rescued from `/tmp` verbatim** (byte-identical logic, header rewritten to state its declared-non-instrument status, what it does/refuses/doesn't do, and its usage) as `.claude/seer_statfacts_scraper.py`, declared in `battery.py`'s `NON_INSTRUMENTS`. **A single cwd-proof entry point was built** — `.claude/at_root.sh` (`cd` to its own resolved parent directory, then `exec "$@"`) — closing the sixth live instance of the ambient-cwd scar this session (this one caught mid-turn: a bare `.claude/commit_checked.sh` invocation failed exit 127, safe by luck, no damage) by collapsing every command's own cwd-correctness down to getting ONE absolute path right (the wrapper's own) rather than one per command; proven live from `/tmp` (a deliberately wrong starting directory) running both `pwd` and a relative-path-containing wrapped command correctly. Both landed together as `5dcbc1d` (no served assets, regress skipped), verified clean pre-commit and in an isolated worktree, pushed under its own grant — no deploy_check needed.

**Two more self-caught process mistakes worth recording as scars, not just outcomes.** (a) A DOUBLE-BACKGROUNDING mistake — setting the tool's own `run_in_background: true` AND ALSO appending a manual shell `&` — orphaned a real `commit_checked.sh` invocation from the harness's own tracking for several minutes (discovered via `ps aux`, waited out safely rather than killed; no damage, no commit had landed yet). Lesson: pick ONE backgrounding mechanism, never both. (b) `commit_checked.sh` refuses to run while ANY tracked file (not just the ones staged for THIS commit) has unstaged changes on disk — the same "gate the tree you're committing" discipline this project has stated before, now hit from a NEW angle (wanting two logically-separate commits from one working session while unrelated edits for the SECOND commit already sit on disk). Fixed by `git stash push -- <paths>` (pathspec-limited, fully reversible) to hold the second batch aside, landing the first commit clean, then `git stash pop` to resume — safer than staging everything into one commit or than any destructive alternative.

**CURRENT HEAD = origin/main = `5dcbc1d`**, tree clean apart from the same 8 pre-existing untracked model-asset files at the repo root. All four of this round's push grants spent. **Standing open items, reported rather than resolved:** (1) a genuine subtype-discriminating over-narrow trials signal is still unbuilt — the exhaustive-fetch machinery survives for whoever derives the per-entry terms correctly; (2) the SEER scraper's own disclosed limitation stands (validated against the 15 pages this atlas already cites, not the ~45 more a Phase C entry could add); (3) Phase C's first-wave ceiling is measured at 35 already-staged entries (16→51), with colon's mucinous-adenocarcinoma gap named as a real, separate, not-yet-staged addition; (4) the three crowding options' full cost/foreclosure table lives only in this round's own report text, not yet copied into a tracked design document — if Phase C authoring begins, that table should be transcribed into a `.claude/phaseC_*.md` before the first of the 35 entries is written, matching this project's own "decide the crowding option before authoring, not after" instruction.

## TWELFTH FOLLOW-UP (2026-09-11): the retirement's own algebra generalized into a working signal, a real coverage gap found (HGSOC/clear miss their own disease under tubal/peritoneal naming), the code_refs identity gap closed, and both open crowding items landed in a tracked design doc — one commit, `bedc658`

**The user corrected my own over-claim before I could ship it as settled.** I had told them "no working over-narrow signal exists." They named the precise algebraic reason both attempts failed — **"the filter cannot audit the keyword list, because the filter *is* the keyword list"** — and then drew the correct, narrower conclusion I'd missed: not "no signal exists" but "no signal DERIVED FROM THE ENTRY'S OWN KEYWORDS can work." The fix is a signal drawn from a population the keywords never touched: the parent corpus's own vocabulary. They also named the worked example in advance — seminoma's already-fixed bare-tag miss — as proof the shape works, and instructed running it live across all sixteen and reporting before fixing anything.

**Built exactly that, in `.claude/trials_mapping_check.mjs`: `corpusVocabularySignal()`.** For each entry, enumerates every DISTINCT condition string across the entry's already-fetched parent-organ corpus, then reports every one the entry's REAL, LIVE `filterByCondition` rejects that still contains one of the entry's own distinguishing name-tokens (derived from `query`, minus a small disclosed stopword list — `carcinoma`/`adenocarcinoma`/`cancer`/`tumor(-our)`/`cell(s)`/connectors — the exact class the prior retirement had already flagged as too generic to discriminate). Ran live across all 16 real entries (real ClinicalTrials.gov fetches, not fixtures). **Read every hit by hand before reporting anything** — this is where the real value showed up: 10 of 16 entries produced at least one hit, and the overwhelming majority is exactly the expected noise floor for a shared histologic adjective (`"clear"` colliding with endometrial/renal/vulvar/bladder clear-cell entities and even `"Clear Cell Sarcoma"` — wrong histology class entirely; `"cutaneous"` colliding with SCC/Merkel-cell/benign nevi; `"negative"` colliding with any biomarker-status tag). **But one finding is real and substantive: `hgsoc` and `clear` both miss their own disease when it's tagged under fallopian-tube or primary-peritoneal nomenclature** — 8 distinct `[modifier] (Fallopian Tube|Primary Peritoneal) High Grade Serous Adenocarcinoma` condition strings plus 2 bare `High(-grade) Serous Carcinoma` tags, none containing "ovarian"/"ovary," for hgsoc; a parallel clear-cell family for `clear`. This is clinically real — HGSOC's tubal-origin model means ovarian/tubal/peritoneal high-grade serous carcinoma is one disease commonly trial-tagged at all three sites — and the current shared `['ovarian','ovary']` keyword set would silently drop a trial tagged only under the tubal/peritoneal name. **Reported as a candidate fix (add `'fallopian'`/`'peritoneal'` to the shared keyword set) — NOT applied**, exactly as instructed. Also surfaced, for completeness, a pure ClinicalTrials.gov data-entry typo (`"Pancratic Ductal Adenocarcinoma"` — missing the 'e') with no recommended fix (unbounded to chase registry typos), and several genuinely ambiguous bare organ-unspecified tags (`"Clear Cell Carcinoma"`, `"Carcinoma, Papillary"`) this signal cannot resolve on its own. Full findings in `.claude/phaseD_trials_design.md` §12. Seminoma's own tokens produced zero hits, confirming the worked-example bug stays closed.

**The `code_refs` identity gap — closed for exactly the class where the real defect occurred, not overreached to the whole population.** `pointer_check.py` had always treated `entries[].code_refs` as FLOOR ONLY (file tracked + line in range), explicitly because most of the class (`licence`/`colour`/`anatomical-source`) has no author+year to compare against. But `epidemiological`-class entries (7 of 23) DO have a checkable oracle: their own `id` follows `epi-<surname>-<year>`, and the code near their `code_refs` line routinely restates that same author+year in prose — the exact shape `backfill`'s oracle already exploits, and exactly the population the eleventh stale pointer (from the ovary-fix round) lived in. Built `entry_identity()` deriving (author, year) from `id` for this class, with two real, hand-verified exceptions found by directly reading each referenced line before trusting the derivation (not assumed clean): `epi-kgca-2009` is EXEMPTED (an organizational name — Korean Gastric Cancer Association — cited under two different year-labels elsewhere in the same file, a real accepted convention, not a defect; a naive derivation would have fired a false OFF-LINE); `epi-dicarlo-2022` uses an OVERRIDE (`'Di Carlo'` — the corpus always writes it as two words, where the id concatenates them to `'dicarlo'`, matching nothing literally). First live run fired 3 real flags (both `dicarlo` refs, one `park` ref) — read each one directly rather than auto-repaired: all three are a legitimate, CONSISTENT convention (a multi-line entry's `code_refs` pointing at the line carrying a specific FIGURE the claim names, one line below where the wrapped citation itself sits, or at a different clause of a multi-part claim) — not drift. Declared as three `DECLARED_OFF_LINE` exemptions (quote + reason, the existing three-property mechanism), each quote verified unique in its file before being written. Second run: 0 flags, 3 declared-exempt, identity_oracle 266→272 (ratchet raised, expected growth).

**Phase C's two open items landed in a new tracked design doc, `.claude/phaseC_design.md`** — recovered the ORIGINAL three-option crowding table (mechanism/cost/forecloses/reserved-density-interaction for A-shrink/B-one-mass-at-a-time/C-origin-per-entry) plus the exact `AskUserQuestion` ruling (B selected, recommended) by reading the raw session transcript directly rather than reconstructing from memory — confirmed B is ALREADY LIVE in `main.js` (`previewMass`/"PHASE B — THE CROWDING FIX," one mass per organ, chosen by cancer-list row hover/focus). Added the sharper point the user made explicit: **the twelve-organ origin-collapse exemption is time-bound, not closed** — it holds only because those organs have exactly one active entry each *today*; the moment any of the 35 staged entries (§3 of the same doc, the measured first-wave count carried forward unchanged) activates, its organ gains a sibling and the exact ovary-shaped defect becomes possible there for the first time. Per-entry origin siting is now written into the doc as a **counted Phase C line item** — 35 source-verified siting checks against each organ's own hotspot prose, budgeted alongside (not as a sub-item of) each entry's statistics/citation work — rather than something to discover again at entry twelve.

**One commit, `bedc658`** (battery.py + phaseC_design.md [new] + phaseD_trials_design.md + pointer_check.py + trials_mapping_check.mjs + record_count.json), verified clean pre-commit (0 problems) and again in an isolated detached worktree, pushed under its own one-use grant. `regress` correctly SKIPPED — 0 served-asset paths changed, confirming the served-asset scoping from the eleventh follow-up's "FOUR THINGS CAUGHT" item 3 works exactly as documented — so no `deploy_check` was needed.

## THIRTEENTH FOLLOW-UP (2026-09-11): the fallopian/peritoneal extension shipped with two DIFFERENT justifications, and ovary became the Phase C pilot — endometrioid + mucinous + low-grade serous carcinoma authored end to end, browser-verified, a real citation-attribution error caught by the crosscheck gate and fixed — `0401fb4` + `e5cf25c`

**Item 1 — the trials extension, on two named grounds, verified against real eligibility text.** Extended `hgsoc` and `clear`'s `conditionKeywords` with `fallopian`/`peritoneal`/`peritoneum` (js/trials.js) — for `hgsoc` because the tubal-origin model makes fallopian/peritoneal/ovarian HGSOC the same disease under current nomenclature; for `clear` because OCCC is endometriosis-derived, not tubal, and the grouping is a trial-*eligibility* convention, not a shared-origin claim — the two reasons recorded separately in each entry's own `note`, never merged. Caught and fixed the noun/adjective gap live (`"Clear Cell Adenocarcinoma of Peritoneum"` didn't word-match `peritoneal`; added `peritoneum` as its own keyword, matching the existing `ovarian`/`ovary` dual-form). **Verified against real eligibility text, not the tag**: pulled two real trials with a fallopian/peritoneal tag and zero ovarian tag from the live parent corpus, fetched their actual `eligibilityModule` text via the CT.gov API, and confirmed both genuinely enroll ovarian patients (NCT05538091's inclusion criteria say so verbatim). Also found and fixed, as an explicitly-flagged **incidental, unrelated discovery** from the same verification pass: a real recruiting trial (NCT07366242) tagged with the bare acronym `"HGSOC"` alone — the exact seminoma-bug shape — invisible to the corpus-vocabulary signal itself (which tokenizes `query`'s full phrase, never an acronym). Added `'hgsoc'` to `hgsoc`'s own keywords only, verified it must never reach `clear`'s.

**Item 2 — ovary as the Phase C pilot: `endo`/`muc`/`lgsc` flipped active, authored end to end.** Per-organ origin siting resolved BEFORE any content was written, avoiding the exact contradiction just fixed: `endo` (endometrioid) got a Cortex `ORIGIN_HOTSPOT_ENTRY` override — the SAME two-source standard as `clear`'s own fix (Diagnostics 2021/PMC8070731's "frequently associated with endometriosis" + Pearce 2012's own endometrioid-specific OR, 2.04, freshly pulled from the same pooled analysis already backing `clear`'s 3.05) — while `muc` and `lgsc` were deliberately left on the organ default: `muc` because the WHO-2020 review states its origin is genuinely *unknown* (stated honestly in its own text rather than forced into a confident anchor), `lgsc` because its real precursor lineage (serous borderline tumors) already matches the organ default, with a REAL, separate finding — Pearce 2012 also gives LGSC its own significant endometriosis OR (2.11, comparable to endometrioid's) — recorded as an epidemiological risk-factor fact, explicitly not conflated with origin. Mutations/sites/histology built from two primary sources (Hollis et al. 2020 Nat Commun for endometrioid — exact counts, 42.9% CTNNB1/PIK3CA, mutual exclusivity with TP53 at P<0.001 with the 0.9% documented exception; Gorringe & Bowtell 2020 Gynecol Oncol for mucinous — KRAS 64%/TP53 48.9%/CDKN2A 44.6%/HER2 26.7%, plus a real BRAF-cooperates-with-KRAS finding contrasting directly with LGSC's own strict exclusivity; Etemadmoghadam et al. 2017 Cancer Res for LGSC — KRAS/BRAF/NRAS mutually exclusive with each other, EIF1AX+NRAS a documented cooperating pair NOT drawn into the ledger since NRAS can't coexist with the modeled KRAS/BRAF trunk). Twelve new globally-unique region ids (EO/EL/EI/ER, MC/MP/MT/MR, SO/SP/ST/SN) checked against every existing 2-letter id in the codebase before use. Extent wired for all three by actually RUNNING `.claude/seer_statfacts_scraper.py`'s real `fetch()`/`scrape_stage_table()` against the live SEER ovary page (item 3) — exact match to the already-hand-verified 22/18/54/6 shares, the first live end-to-end proof of that scraper's integration path, per the pilot-scoped ruling. Three new SVG histology generators written from scratch in `js/histology.js` (`genEndometrioid`/`genMucinous`/`genLGSC`) — discovered mid-build that the `HISTOLOGY_*` data blocks alone don't render anything; each cancer id needs its own hand-written procedural SVG generator in the `GENERATORS` dispatch, a piece the task hadn't accounted for until `regress.js` caught `cancer {endo,muc,lgsc} histology []` (zero rendered features) on the first full battery run.

**Browser-verified live, not just gate-verified**: started a scratch dev server, navigated all three new entries end to end — organ screen (5 cancers listed correctly), site maps (4 real sites each, correctly labeled/colored), mutation cell panel (endometrioid's Pelvis cell showing real trunk/branch mutations with correct citations, zero "undefined"), histology view (all three SVGs render with correct labels/intro text), and Clinical Trials (endometrioid's toggle fetched real live CT.gov data, 2 correctly dropped, matching the pre-verified numbers exactly).

**The gate chain caught a real, non-obvious defect the second time it ran, not a false alarm**: `citation_crosscheck` flagged 5 (later reasoned to be the same root cause across all new mentions) instances where the citation text "Diagnostics (Basel), 2021" — the SAME phrasing already used, unflagged, in this file's pre-existing HGSOC/OCCC blocks — was being parsed by the extractor as author="Diagnostics" (the journal name) instead of the real first author. Verified directly via PubMed esummary: PMID 33919741's real first author is **De Leo A**. Fixed by adding "De Leo et al." to all 11 of the new "Diagnostics 2021" mentions (leaving OCCC's own pre-existing, unflagged instance untouched — out of scope, not broken by this pass). That fix immediately surfaced TWO more, smaller citation-hygiene issues on the very next run — "De Leo" needed declaring as a genuine two-word surname in `citation_head_check.py`'s `WELL_FORMED` list (matching "Di Carlo"/"van Beek"), and the SAME "WHO-2020-based" bare-digit ambiguity from earlier in this exact round recurred inside the new citation strings themselves (fixed the same way, "WHO-classification"), which in turn surfaced a THIRD, correctly-resolved shape — three new "De Leo|2021" spans with a `)` between head and year from "(Basel)", the exact Travis/"(WHO)" no-year-parenthetical precedent already in `citation_paren_ledger.py` — registered as three new `PREREGISTERED` entries (`basis: 'TEST'`, `scored: 'CONFIRMS'`) rather than reworded away, since the shape is correct and worth keeping as evidence. Also updated `cancer-atlas.html`'s disclaimer citation-summary paragraph (a separate, hand-maintained population from the code comments) to name all three new sources, and corrected its stale "sixteen cancers" to "nineteen".

## FOURTEENTH FOLLOW-UP (2026-09-11): item 4 — the ovary pilot's own cost report — written, self-caught out of order, corrected, and shipped — `43da93c` — closing the user's four-item work order in full

**Item 4 (the pilot's per-organ cost, in time/decisions/what-the-scraper-handled/what-needed-a-human-read) drafted as a new `## 5` section of `.claude/phaseC_design.md`, following `## 1`–`## 4` (crowding decision, per-entry origin-siting cost, the measured 35-entry first wave, the pre-authoring gate close) already landed at `bedc658`.** Own self-caught mistake, corrected before it shipped: the first insertion attempt placed the new section BEFORE `## 4` instead of after it — caught by `grep -n "^## "` showing `## 3` at line 118, the misplaced `## 5` at line 150, `## 4` at line 220, i.e. out of sequence — fixed by removing the misplaced block and re-inserting it correctly at the true end of the file, immediately after "Authoring can start on the 35." Verified both on disk and, after committing, in a fresh isolated detached worktree at the committed SHA: `grep -n "^## "` reads `## 1` (10) → `## 2` (72) → `## 3` (118) → `## 4` (150) → `## 5` (162), in order, at the committed bytes — not just on the working copy that could still drift before commit.

**The report's own substantive findings, since the user's work order asked for the number itself, not just that a report exists.** Five primary papers (De Leo et al. 2021/PMC8070731 shared across all five ovary entries including the two already-wired ones; Hollis 2020; Gorringe & Bowtell 2020; Etemadmoghadam 2017; Pearce 2012 re-read for its own endometrioid/LGSC numbers) covered three new entries' mutations/sites/histology — cheap only because a comprehensive review paper happened to exist for this organ, explicitly flagged as not something to assume generalizes to the other thirteen. Literature-finding was NOT where the real time went — mechanistic-fit reasoning was: LGSC's KRAS/BRAF/NRAS mutual exclusivity ruled out the first, more obvious branch-gene design (NRAS+EIF1AX on a KRAS/BRAF trunk) as internally inconsistent, resolved by moving the real EIF1AX–NRAS cooperation finding into prose only. The extent/staging axis was FREE for all three — SEER Stat Facts is organ-level, not histotype-level, so the same live scraper run that reproduced the organ's already-verified shares served all three new entries at zero incremental cost, flagged as the single most transferable finding since it holds regardless of which organ comes next. Citation hygiene was the real, recurring tax and cost more than the content work's own error rate suggested: seven distinct gate-driven fixes across two commits (the "Diagnostics"-parsed-as-author defect and its two cascading smaller fixes, two absence-claim rewrites, one arithmetic slip, the recurring "WHO-2020-based" bare-digit paren-shadow ambiguity hit twice), none false alarms. The one cost the pass did not anticipate going in: the histology view needs CODE, not just data — each cancer id needs its own hand-written SVG generator in `js/histology.js`'s `GENERATORS` dispatch, discovered only when `regress.js` reported zero histology features on the first full battery run, flagged as real recurring per-entry work to budget explicitly for the remaining thirteen organs.

**Gate chain, one commit, first try clean on every layer — no scars this round.** Staged, then `.claude/at_root.sh .claude/commit_checked.sh "Add ovary pilot cost report to Phase C design document" "DONE " python3 .claude/battery.py pre-commit` — battery 16/16 declared instruments, 0 problems, `regress` correctly SKIPPED (0 served-asset paths changed — a `.claude/*.md` doc is not a served asset), citation records held at 527 unchanged (a `.md` file, not `js/organs/*.js`, so the corpus itself didn't move). Committed as `43da93c` (70 insertions, `.claude/phaseC_design.md` only). Verified clean in an isolated detached worktree at `43da93c` (see the section-ordering check above). Pushed under a fresh one-use `AskUserQuestion` grant. `deploy_check.js` ran clean on the FIRST try this time, no propagation-delay retry needed (unlike every prior push in this arc): `29/29 assets byte-matched to HEAD 43da93c, 31 hotspots live, 0 unexplained page errors (2 declared-benign), 0 problems`.

**CURRENT HEAD = origin/main = `43da93c`**, tree clean apart from the same 8 pre-existing untracked model-asset scratch files at the repo root (unchanged, still untouched, still not this session's concern). The one push grant this round is spent. **This closes the user's exact four-item work order in full**: item 1 (trials extension, `0401fb4`), item 2 (ovary pilot — endo/muc/lgsc authored end to end, browser-verified, `0401fb4`+`e5cf25c`), item 3 (scraper wired and proven live for the ovary pilot only, per the standing no-integration-elsewhere rule, built as part of item 2), item 4 (this cost report, `43da93c`). **Standing open items, reported rather than resolved:** 32 of the measured 35 staged Phase C entries remain unauthored; the remaining thirteen organs' per-entry origin siting, trials mappings, and (per this report's own flagged finding) histology SVG generators are none of them built yet; no push grant remains open.

**Two commits, both verified clean pre-commit and again in an isolated detached worktree, both pushed under their own one-use grants**: `0401fb4` (the pilot itself) and `e5cf25c` (the citation-attribution fix, landed as a separate forward commit — never amended — once the crosscheck gate's real finding was understood). `deploy_check.js` hit the standing propagation-delay shape on first check (5 files NOT PUBLISHED, all inside the push's own changed set) and resolved cleanly on the single established human-level retry — 29/29 byte-matched, 0 problems, no refusal logged since this run bypassed `run_checked.sh` directly (nothing to bookkeep). **CURRENT HEAD = origin/main = `e5cf25c`**, tree clean apart from the same 8 pre-existing untracked scratch files. **Standing open items: (1)** whether/how to extend the remaining 32 of the 35 staged Phase C entries beyond ovary's pilot three — not started, deliberately scoped to ovary only per the pilot ruling; **(2)** the per-pilot cost report (item 4 of the work order) — not yet written up as its own artifact; **(3)** the SEER scraper's disclosed 15-pages-validated limitation, unchanged, though the pilot added a 16th successfully-reproduced page (ovary).

## FIFTEENTH FOLLOW-UP (2026-09-11→12): the user reframed the pilot's own endometrioid figure as a wrong served figure, ordered a four-item work order, then a second message escalated one finding (GBM's degenerate survival table) into a whole new guarded failure mode — divergence sweep, the arithmetic share-bound rule, GBM reclassified, the third extent-instrument built and run live, TNBC rebuilt as four unmerged strata, the incidence floor revised to absolute incidence — `caf8e40` then `07fa926`+`999d52d` then `38f4aac`

**Message 1 reframed the pilot's own "endometrioid ~10%" aggregate as a wrong served figure, not a stylistic gap**: three of five real per-subtype endometrioid stage distributions later found to diverge from the ovary organ aggregate meant the aggregate "wasn't approximately right, it was categorically wrong" — and overriding the user's own earlier suggested remedy (mark it uncharacterised) with the real Peres 2019 subtype data was affirmed as correct. Landed as `caf8e40`. Ordered, in this order: (1) an extent-divergence sweep on the ten then-unchecked entries, screened by incidence share ascending (a high-share entry is mathematically constrained to track its organ aggregate; a low-share entry isn't); (2) build the neuroendocrine/small-cell histology family, proven on a real generator before shipping ahead of its data (matching the pilot's own prostate-ductal/frond-family precedent); (3) record that origin isn't always spatial (prostate's treatment-emergent NEPC as the worked example); (4) propose an incidence floor for build-out and report the resulting count.

**The sweep executed via 8 parallel research agents, plus a structural miss caught by re-deriving the entry list from the code rather than trusting an earlier by-memory enumeration**: the original "ten unchecked" list silently omitted `gbm` and `crc` — `gbm` (52.2% share, the LOWEST in the atlas) turned out to be the single worst case in the whole file, not because its aggregate diverged from a subtype (it has none) but because SEER staging doesn't apply to it AT ALL (below). Real divergences found and fixed with new citations: `ftc`/`gdiff`/`luad`/`hcc`/`ccrcc` (5 organs) plus the pilot's own `endo` (6 total, on top of the pilot's original 4) — 10 of 15 checked entries diverged, not the ~9 the user's own framing had approximated; stated as a correction rather than silently adopted. `ptc`/`pdac`/`uc`/`acinar` confirmed clean.

**The arithmetic share-bound rule, derived and proven, RETIRES the "aggregate-with-scope-note" pattern entirely**: for an organ aggregate = a share-weighted average of its subtypes, `aggregate = s·x + (1−s)·y`, so `|aggregate − x| ≤ (1−s)×100` percentage points — provable, not empirical. Threshold set at `s ≥ 90%` (bound ≤10 points) as the line for showing the aggregate directly WITH the bound stated; below that, real per-subtype data or `uncharacterised` is required. Applied retroactively to re-examine `ptc` (migrated fully onto Aschebrook-Kilfoy), `pdac`/`crc`/`acinar`/`uc` (bound now stated explicitly in each entry).

**The neuroendocrine histology family and the origin-axis write-up were both done, then deliberately withheld** — same discipline as every prior histology-family pass: a new `drawSmallCellSheet` primitive (densely-packed "naked nuclei," a real per-cell nuclear-molding computation) proven on a temporary `genLungsSCLC` demo (Ng & Li 2024, PMID 39342665), live-browser-verified, then REMOVED since SCLC isn't a real active entry yet. Origin-is-not-always-spatial written into `.claude/phaseC_design.md` §9 using prostate's treatment-emergent NEPC (de Kouchkovsky et al. 2024, PMID 38173302), amending the origin-siting checklist with a new "step 0" and a registry table for future non-spatial-origin entries — not revisited or challenged in the user's later message, so treated as settled.

**Message 2 escalated the sweep's own best find — GBM's degenerate SEER survival-by-stage table (Regional 20.1% < Distant 28.0%; Unknown/Unstaged 32.2% survives nearly as well as Localized 35.3%) — into a THIRD, newly-named extent-axis failure mode, distinct from (1) subtype-diverges-from-aggregate and (2) no-subtype-data-exists: (3) stage-at-diagnosis isn't a meaningful axis for the SITE at all, independent of share.** Ordered it built into a mechanical, reusable instrument rather than left as an anecdote, the blood-cancer staging risk recorded before it recurs, and gave explicit corrective rulings on the still-open TNBC draft and the floor proposal (both below).

**Built `.claude/extent_monotonicity_check.py`** — imports `fetch`/`scrape_stage_table`/`ENTRIES`/`LayoutError` directly from the pre-existing `.claude/seer_statfacts_scraper.py` (reuse, not a second population); asserts 5-yr relative survival is non-increasing Localized ≥ Regional ≥ Distant; six self-test arms including the REAL GBM numbers as the must-fire known positive (condition 7). Run live against all 14 distinct SEER pages this atlas cites (deduplicating shared pages, e.g. `ptc`/`ftc`): 13 have a survival-by-stage table (testis correctly has none), exactly **1 inversion — GBM, and only GBM**, confirming it as this atlas's sole current instance of the third failure mode. Blood-cancer risk recorded in §11: lymphoma uses Ann Arbor staging (nodal regions, not anatomic extent), leukemia has no comparable extent-staging concept at all — a separate extent model or an explicit "does not apply" decision is owed before the first blood-cancer entry is authored, not decided here. GBM's `EXTENT_STATUS` entry reclassified `cited`→`uncharacterised`, and `extentSentence()` in `js/morphology.js` gained an `uncharacterisedReason` override field so GBM's rendered sentence states the TRUE reason (a distribution is published but doesn't apply — CBTRUS/NCI PDQ/the table's own internal inconsistency, three sources) rather than the old hardcoded "publishes no distribution," which would have been false for GBM specifically.

**TNBC rebuilt exactly per the user's explicit ruling — four strata unmerged, no causal clause, verified-derived basis, real em-dashes confirmed via direct Node ESM execution**: `EXTENT_STATUS.tnbc` restructured from one blended national percentage to a `strata:[{label,shares}]` array (non-Hispanic White 63/30/7/0, non-Hispanic Black 55/36/9/0, non-Hispanic Asian/Pacific Islander 63/30/7/0, Hispanic 57/35/7/0 — Kohler et al. 2015, JNCI, PMID 25825511), one shared `modal:'localized'` (independently verified as every stratum's own true argmax). `extentSentence()` gained a `strata` render branch listing each group's numbers plainly with NO assertion of *why* they differ (causation is actively researched, not settled — the user's exact instruction); `.claude/reserve_check.js` gained a matching guard validating each stratum's own argmax against the entry's shared modal (condition-7 verified via a deliberate planted-and-reverted mutation). A supporting `reserve_check.js` regex widened (`/\d{4}[–-]\d{4}/` → `/\d{4}[–-]\d{4}|\b\d{4}\b/`) to accept Kohler's single-year (2011) vintage — verified non-weakening since every existing range-form entry still matches.

**The floor revised exactly per the user's amendments — absolute annual incidence, not share; "named not built" stated not hidden; clinical distinctiveness, not literature strength, as the exception test.** Absolute incidence computed for the five original share-based candidates (all from Siech et al.'s 855/324/130/54 prostate-subtype counts over its confirmed SEER cohort, plus Merkel cell's already-cited rate × US population): psignet ~3/yr, pneuro ~8/yr, pmuc ~19/yr, pductal ~50/yr, **mcc ~2,345/yr** — two orders of magnitude larger than the other four despite a similarly tiny organ-relative *share*, which is exactly why absolute incidence and not share had to be the unit. `<1,000/year` proposed; resulting count revised from the original "5 of 35" to **"4 of 35," with `mcc` explicitly REMOVED** on this evidence. The below-floor state redefined as a deliberate, dignified permanent one — name + share + citation + one-line `blurb`, explicitly no mass/histology/trials/extent — schema DESIGNED in `phaseC_design.md` §12, not yet implemented in code or populated for any entry. `pductal`'s exception re-grounded on real clinical-distinctiveness evidence (Au et al. 2019's cribriform-architecture prognosis finding; Seipel et al. 2013's "more aggressive than average"; Seipel et al. 2016's distinct metastatic pattern) rather than literature-strength; `psignet`/`pneuro`/`pmuc` explicitly flagged as NOT yet individually re-examined under this new criterion.

**A pre-existing string-literal quirk in `js/morphology.js` caused several Edit-tool exact-match failures this round, resolved by verification not by touching the underlying code**: some prior code embeds the literal 6-character text `—` (backslash-u-2-0-1-4, valid JS unicode-escape syntax) inside single-quoted strings instead of a real em-dash glyph — functionally identical at runtime (confirmed via a live Node ESM import rendering it correctly) but visually indistinguishable from a real em-dash in the Read tool's own rendering, which is what caused the match failures. No correction needed to the pre-existing code; new edits were written to avoid ambiguous spans.

**Gate chain, one combined commit, first try clean, then verified twice more.** `.claude/at_root.sh .claude/commit_checked.sh "Add the third extent instrument (stage-applicability monotonicity check); revise TNBC to four unmerged race strata with no causal clause; revise the incidence floor to absolute annual cases" "DONE " python3 .claude/battery.py pre-commit` — battery 16/16, regress 208/0 (2 declared-benign page errors), 0 problems anywhere, committed as **`38f4aac`** (6 files: `.claude/battery.py`, `.claude/extent_monotonicity_check.py` [new], `.claude/phaseC_design.md`, `.claude/reserve_check.js`, `cancer-atlas.html`, `js/morphology.js`). Re-verified independently in a fresh isolated detached worktree (`git show --stat` confirmed exactly the intended 6 files; `syntax_check.sh` clean; the new instrument's own selftest re-run clean; `extentSentence()` re-executed live for both `tnbc` and `gbm` confirming correct strata rendering and the correct GBM override reason; `reserve_check.js` re-run clean including the new strata guard) rather than trusting the gate's own single pass. Pushed under a one-use grant; `deploy_check.js` reported `29/29 assets byte-matched to HEAD 38f4aac, 31 hotspots live, 0 problems` after one standard 30s propagation-delay retry.

**CURRENT HEAD as of this sub-entry = `38f4aac`**, tree presumed clean apart from the same pre-existing untracked scratch model-asset files at the repo root (not re-verified this round — re-check `git status` live). **This closes the exact scope of both of the user's messages this segment**: message 1's items 1–4 (sweep, histology-family proof-and-withhold, origin-axis write-up, floor proposal) and message 2's items 1–3 (monotonicity instrument, TNBC final wording, floor amendments) are all shipped. **Standing open items, awaiting the user's ruling, none resolved by assumption:** (1) whether `<1,000/year` is the right absolute threshold; (2) whether the `blurb`-field schema design is right before any content is written for it; (3) whether `psignet`/`pneuro`/`pmuc` need their own clinical-distinctiveness reads before Phase C authoring resumes, matching what was just done for `pductal`; (4) confirmation of the origin-axis write-up (§9) as accepted — implied by "then the origin-axis write-up and prostate" in message 2 but never explicitly re-confirmed on its own; (5) **"then prostate" — full authoring of prostate's staged entries (ductal/mucinous/signet-ring/neuroendocrine) has NOT been started in code** (only origin-siting research and a withheld demo generator exist for `ductal` specifically) and remains explicitly deferred behind items 1–3 above. **All five resolved in the SIXTEENTH FOLLOW-UP below — read that before assuming any of these five are still open.**

## SIXTEENTH FOLLOW-UP (2026-09-12): the five rulings answered — `pneuro` clears the clinical-distinctiveness exception, `psignet`/`pmuc` do not, `pductal`'s own incidence figure gets a definitional caveat — `d112344`

**All five rulings from the prior message answered in one pass, four research agents run in parallel for the literature work.** (1) **Threshold accepted, recorded as GAP-DRIVEN not calibrated** — the four prostate entries (3–50/yr) sit an order of magnitude below `mcc` (~2,345/yr), so any cut between ~100 and ~2,000 partitions identically; a future entry landing near the threshold gets a fresh look, not automatic exclusion by an uncalibrated number. **`pductal`'s own count needed a real caveat, not a formality**: fetched Siech et al. 2026 (PMID 41718902, PMCID PMC13179204) directly and found its own Limitations section states "we could not distinguish between pure versus mixed rare histological subtypes of PCa... histological subtypes are coded only if they account for at least 50% of the tumor" — so the 855-count/~50-per-year figure is *predominantly*-ductal (SEER-coded, ICD-O-3 list), not verified pure, and a real any-component figure runs far higher: Seipel et al. 2013 (PMID 23443941, systematic re-review of 1,051 prostatectomies) found ductal histology admixed with acinar in ~8.2% of cases (13–40× Siech's rate); Amin & Epstein 2011 (PMID 21383610) found a smaller but still real ~2.5× gap in routine (non-re-reviewed) reporting. The atlas must label the figure "predominantly-ductal, SEER-coded," never "pure ductal incidence" — this doesn't touch `pductal`'s own exception grant (that rests on behavior/management evidence, not the count), but the number itself needs the caveat wherever shown.

**(3) The clinical-distinctiveness read run on all three remaining entries, to the same standard as `pductal`, three independent literature passes (primary sources read directly, disagreement reported rather than smoothed).** **`pneuro` (neuroendocrine) CLEARS THE BAR CLEARLY, exception granted, joins `pductal` for full authoring** — convergent evidence from three separate groups: Wang et al. 2019 (PMID 31376193, SEER, 352 pure NEPC) found visceral-dominant metastatic pattern (vs. bone-dominant acinar) and median survival "10 months" vs. "not reached"; Aparicio et al. 2013 (PMID 23649003, 120-pt phase II) confirmed the chemo-not-ADT treatment divergence (platinum-based regimens, "similar to SCPC") that §9's own origin-axis write-up had already flagged as this entity's defining mechanism; Conteduca et al. 2019 (PMID 31525487, PMC6803064) plus Wang 2019 both confirmed a genuine PSA diagnostic pitfall (median PSA 1.20 ng/mL despite bone/visceral metastatic disease). One honest caveat preserved: literature often pools de novo with treatment-emergent NEPC, but Wang 2019's SEER analysis is de-novo-specific and independently reproduces the same divergence, so the claim holds even restricted to de novo disease. **`psignet` (signet ring) and `pmuc` (mucinous) DO NOT CLEAR THE BAR — both stay below-floor, named-and-described, no exception; a real, well-powered "no" rather than a forced yes.** Both reads found the same shape: real historical claims of aggressiveness (case-report literature, publication-biased) contradicted by the largest, most recent, best stage/grade-controlled studies. For BOTH jointly: Siech et al. 2025 (PMID 38987307, PMC12399420 — a different, more targeted Siech-group paper than the subtype-counts one, competing-risk regression on 95 SEER cases each) found "CSM rates of mucinous and signet ring cell adenocarcinoma do not differ from those of acinar adenocarcinoma" at any stage (all HRs non-significant). For `pmuc` specifically, independently: Osunkoya et al. 2008 (PMID 18300802, n=47), Samaratunga et al. 2017 (PMID 28590015, n=143, the largest single series), and Zhao et al. 2020 (PMID 31998638, SEER propensity-matched) all converge on "not more aggressive, possibly even less" — directly contradicting the entity's own 1985 defining paper (Epstein, PMID 2409826), which is exactly the kind of "atlas accurate to an outdated source" risk this project has hit before (thyroid's NRAS-42.4%-vs-42.2% case) and is why the newer, larger, controlled studies were weighted over the older, smaller, uncontrolled one.

**(4) Confirmed by direct re-reading, not assumed: §9 answers the design question (what the origin axis DOES when the honest answer isn't a location — its 3-step procedure: no forced spatial override, state the real kind of claim in prose, keep a running registry), not merely records that the problem exists. Accepted as written.**

**(2) The `blurb` schema accepted with both additions — trials, and a resolvable citation identifier — but the trials half is a PROPOSAL, not yet built.** Checked the real code first (`renderCancerList()` in `js/main.js`): an inactive row today is one `makeActivatable` div whose activation just shows a toast — there is no cancer screen, no site map, so the existing site-map-level `#txTrialsToggle`/`#txTrialsLayer` mechanism (built for all sixteen active entries) has nowhere to attach for `psignet`/`pmuc`. **Proposed:** each below-floor row gets its own inline trials toggle within the organ-screen list itself, reusing `trials.js`'s fetch-time-filter function directly rather than duplicating it — recorded as a real UI decision awaiting its own ruling before being built, matching how the original Phase D trials mechanism itself was designed and ruled on before any fetch code existed. **A real collision risk flagged before any keyword mapping is written**: "signet ring" is the textbook gastric-carcinoma association and "mucinous" is extremely common in colorectal/ovarian/appendiceal disease — more overloaded than the "adenocarcinoma" collision problem already flagged for `gdiff`/`luad`/`acinar`/`crc` — so any `TRIALS_CONDITION_MAP` entry for these two MUST be conjunctive (subtype term AND "prostat"), never the bare subtype term. Resolvable citations: every source surfaced this round already carries a PMID/PMCID, satisfying the requirement directly.

**Resulting authoring scope for "then prostate," revised from "build all four below-floor entries" to a split**: `pductal` and `pneuro` get full content (mutations/sites/histology/extent); `psignet` and `pmuc` get the below-floor treatment (name/share/citation/`blurb`, plus trials pending the structural-design ruling) and nothing more. Written into `.claude/phaseC_design.md` §13.

**Gate chain, one commit, clean on the first try — `regress` correctly SKIPPED (0 served-asset paths changed, a `.claude/*.md` design doc is not a served asset), so no `deploy_check` was needed** (matching the `bedc658`/`5dcbc1d` precedent). Verified clean pre-commit (16/16 battery members, 0 problems) and again in a fresh isolated detached worktree (`git show --stat` confirmed exactly the one intended file, 160 insertions). Pushed under a one-use grant.

**CURRENT HEAD = origin/main = `d112344`**, tree presumed clean apart from the same pre-existing untracked scratch model-asset files at the repo root. **Standing open items:** (1) the inline-trials structural design for below-floor rows needs its own ruling before being built; (2) `blurb` field content for `psignet`/`pmuc` and the `TRIALS_CONDITION_MAP` entries for both (once the structural ruling lands) are not yet written; (3) **full authoring of `pductal` and `pneuro` (mutations/trunk/branch, region ids, extent, histology, trials wiring) has NOT been started in code** — this is the actual, narrowed scope of "then prostate," still ahead.

## SEVENTEENTH FOLLOW-UP (2026-09-12): "then prostate" executed in full — `pductal`/`pneuro` authored end to end, `psignet`/`pmuc` shipped below-floor with a working inline trials toggle, the share-predominance rule recorded once, and a real live `requireAlso` regex bug caught and fixed during verification — `df7b01c` + `ac525ef`

**Everything the sixteenth follow-up left open is now built.** `share` = predominance-not-presence recorded once as CLAUDE.md data rule 31 (ductal as the worked example, Siech 2026's own Limitations section quoted verbatim) rather than per-entry. `pductal` authored in full: `REGIONS_PDUCTAL` (Bone/Lung/Liver/Adrenal gland, reusing acinar's own Bubendorf 2000 percentages since no dedicated DAC site study exists), `TRUNK_PDUCTAL` (a fact-statement — no single founder, shares acinar's ERG/SPOP backbone at documented variable rates), CTNNB1/PTEN as the mutually-exclusive branch pair (Gillard 2019/Lindh 2022), a private pool (DDR alteration/FOXA1/TTN, with CDH1/MYC/PIK3R1 honestly checked-and-absent), `genProstateDuctal` histology reinstated verbatim from the withheld design-doc generator, and the periurethral-origin hotspot rewrite (69.8%/26.7%, Seipel 2013 — verified independently since the design doc's own summary had misattributed it to two other papers). `pneuro` authored in full: `REGIONS_PNEURO` (Bone/Liver/Lung/Brain, Wang 2019's own real NEPC site distribution), `TRUNK_PNEURO` (TP53+RB1 concurrent loss — a fourth, "transformation-defining" kind of truncal justification alongside spatial/temporal/diagnostic-classifier; AR pathway attenuation, carrying both facts the ruling required — PSA can read normal/low, treatment is chemo not ADT), AURKA/MYCN as a cooperating branch pair (Beltran 2011), `genProstateNeuro` histology (reusing `drawSmallCellSheet`/`necrosisBlob`). `psignet`/`pmuc` shipped as below-floor `blurb` rows (name/share/citation/one negative-finding sentence, Siech 2025's null cancer-specific-mortality finding) plus a real inline trials toggle built in `js/main.js`'s `renderCancerList()` — a `<button>` + panel per row, reusing `trials.js`'s `fetchTrialsForEntry`/`describeTrialsResult` directly (the latter newly extracted so the screen-level panel and the inline row share one rendering function, zero duplication), cached per-session, with the stale-response guard every async loader in this app already uses.

**A real, live bug was found and fixed during verification, not assumed away.** All four new `TRIALS_CONDITION_MAP` entries use `requireAlso: ['prostat']` (an organ-anchor STEM, not a whole word) — but `filterByCondition` ran it through the same word-boundaried `keywordRegex` every whole-word `conditionKeywords` list uses, and `\bprostat\b` can never match inside "Prostate" (the letter right after the stem is a word character, so `\b` finds no boundary). Every `requireAlso`-gated entry was silently over-dropping from the moment the mechanism shipped — caught live in the browser when `pneuro`'s own trials toggle showed zero results despite the design doc's own "verified live, 10/10 kept" record (that record was checked by a Python/manual read, not this exact JS regex, so the defect went unseen until the real app was driven end to end). Fixed with a dedicated `stemRegex` (leading `\b` only). Re-verified live against the corrected code: `pneuro` 4/10 kept (real corpus drift too — not simply "10/10 minus the bug"), `pductal`/`psignet`/`pmuc` unchanged (0 kept in all three, and for the latter two the bug was never even reachable, confirmed by reading the fetch logic).

**The gate chain caught six more real, worth-reading things before it went clean, all resolved rather than bypassed:** two false-positive drift flags in `duplicate_figure_check` (Bubendorf's own per-site metastatic percentages reused across `pductal`'s Liver/Adrenal branches, plus five citation-boilerplate collisions from dense multi-citation fields — all declared permanent with reasons); a `fraction_check` false positive (49%/25/51 vs. two sub-breakdown percentages nearer the fraction textually — same "nearest percent paired with nearest fraction" shape as the pre-existing pancreas declaration); a `citation_head_check` gap (`de Kouchkovsky` needed declaring as a lowercase-particle surname, matching `van der Kaaij`/`von der Maase`); an `absence_claim_check` DEFECT (an unscoped "unlike every other cell field this atlas draws" universal, rewritten to a scoped comparison against acinar specifically) and a second one one level stricter (a "no documented conflict... consulted" existence-verb phrase with no search/scope verb, rewritten to "no conflict was found... in the three cited cohorts," verified against the tool's own `classify()` function directly before shipping); thirteen genuinely stale `citations.json` backfill pointers into `js/organs/prostate.js` (my own insertions shifted every line below them — each remapped by reading the OLD committed content at the OLD line number and finding the identical text at its new location, not by trusting the tool's own "nearest candidate" hint blindly, though every hint here did turn out correct on verification). A `citation_crosscheck` read (5 new flags, all confirmed extractor list-attribution artifacts — a PMID paired with the FIRST author/year in a semicolon-separated list rather than the one it actually sits beside, the same class as the historical testis.js journal-shuffle — plus one benign "JCO Precis Oncol" abbreviation mismatch) was recorded in its own small follow-up commit rather than left as an unread number, per this project's own "an undeclared count is evidence of an unread count" rule.

**Live-verified in the browser at every stage, not just gate-verified**: the Prostatic urethra hotspot text, `pductal`'s full site map/cell mutation panel (TMPRSS2-ERG trunk, PTEN branch at Bone)/histology (papillary+cribriform+admixed-acinar zones)/trials (10 fetched, 0 kept, matching the documented finding), `pneuro`'s full site map/cell mutation panel (TP53+RB1 trunk with the PSA note, MYCN branch)/histology (nuclear-molding/naked-nuclei/necrosis zones)/trials (4/10 kept post-fix, with each kept trial's real title and the correct "omitted" count shown), and both below-floor rows' inline trials toggles (`pmuc`: 1 fetched/0 kept, real gadolinium-imaging false match; `psignet`: 0 fetched — both matching their own documented expectations), plus a direct re-check of the two content edits made after the main verification pass (the reworded histology line, the reworded private-pool note) via both module inspection and the live DOM. Zero console errors throughout.

**Gate chain, two commits, both clean, both verified in a fresh isolated detached worktree, both pushed under their own one-use grants.** `df7b01c` (the full authoring pass + the trials bug fix + the six gate-driven corrections, battery 16/16 declared instruments, `regress` 222 checks/0 failures, 0 problems) and `ac525ef` (the crosscheck read, `regress` correctly SKIPPED — CLAUDE.md-only). Both re-verified in a clean detached worktree (`syntax_check` + full `battery.py pre-commit` re-run clean; `node .claude/regress.js` run directly and unconditionally against the cumulative diff since it isn't diff-scoped the way the battery's own skip-heuristic is). `deploy_check.js` hit the standing propagation-delay shape on the first check (6 files NOT PUBLISHED, all inside the pushed changed-set) and resolved clean on one human-timed retry (~90s): `29/29 assets byte-matched to HEAD ac525ef, 31 hotspots live, 0 problems`.

**CURRENT HEAD = origin/main = `ac525ef`**, tree clean apart from the same 8 pre-existing untracked model-asset scratch files at the repo root (unchanged, still untouched, still not this session's concern — re-verify live rather than trusting this list). **This closes the exact scope of the sixteenth follow-up's ruling 5 ("then prostate") in full.** **Standing open items, none started this round:** (1) the remaining 32 of the measured 35 staged Phase C entries beyond prostate's five — not touched; (2) whichever organs beyond the ovary pilot still need per-entry origin-siting/trials-mapping/histology-generator work, per the fourteenth follow-up's own flagged finding that a histology generator is real per-entry code, not just data; (3) the SEER scraper's disclosed page-validation count, unchanged this round (prostate's own extent axis stayed `uncharacterised` for both new entries — the share-bound rule forbids the organ aggregate at these shares, and no per-subtype SEER Stat Facts page exists).

## EIGHTEENTH FOLLOW-UP (2026-09-13): the four-item work order closed — `requireAlso` positive control + design-docs-are-notes rule + pointer re-cost (already `a898020`, prior session) then Lungs authored in full (`lusc`/`sclc`, `lcc` below-floor-for-instability, the new `excludeIf` mechanism) — `175c104` + `625fa99`

**Items 1–3 of the user's four-item order were already closed in the immediately-preceding session as `a898020`** (positive control + zero-kept census for `requireAlso`, which also surfaced a second compounding bug — the mapping checker itself never threaded `requireAlso` through its own filter calls; the new CLAUDE.md rule that a design document is a note, never a source, verified at the point of use — motivated by the periurethral-figure misattribution; pricing-and-declining a `citation_crosscheck` extension to design-doc PMIDs, since `extract_citations.py` has no reusable prose-citation front end; and re-costing content-anchored pointers against three now-observed rounds, 49/11/13, splitting the hygiene tax into authoring-errors-vs-edit-mechanics). **This round did item 4: Lungs**, taking the organ from one active entry (LUAD) to three, plus a fourth kept honestly inactive.

**`lusc` (squamous) and `sclc` (small cell) authored in full — driver landscape, sites, private pool, histology, share, predominance note; `lcc` (large cell) shipped below-floor for a NEW reason.** LUSC: TP53 trunk (81→90% on re-review, TCGA 2012) with KRAS/EGFR confirmed absent (1/178, 0/178); CDKN2A/PI3K-pathway/NFE2L2-KEAP1-CUL3/SOX2-FGFR1 branch genes; a real-but-honestly-partial site model (Bone has its own squamous-specific figure, Xie 2024; Brain/Liver/Adrenal carry Riihimäki's organ-level figures since no squamous-specific number exists); a genuinely new drawn histology (`drawKeratinPearl` + intercellular-bridge tick marks); confirmed-stable ~25% share with a cited historical-decline trend; the adenosquamous-carcinoma predominance note. SCLC: TP53+RB1 concurrent loss trunk (100%/93%, George 2015, cross-checked against Rudin 2021's lower, likely-underestimated 64%); MYCL/MYC/NOTCH-family/PTEN branch genes split by real molecular subtype; its OWN dedicated site distribution (mediastinal lymph nodes 75.3% — the first Lungs entry whose top site is neither bone nor a distant organ — Cittolin-Santos 2024, with a genuinely disagreeing second cohort, Nakazawa 2012, noted rather than resolved); histology that is **the neuroendocrine histology family's first HOME-ORGAN consumer and its second zero-new-drawing-code proof** (`genLungsSCLC` is a structural copy of prostate's own `genProstateNeuro` — two `drawSmallCellSheet` zones + one `necrosisBlob` — confirming the family's reuse leverage a second time, after `pductal`'s own different-family cribriform/frond reuse). **Answering the user's own question directly: yes, it lands with zero bespoke drawing code, exactly like `pductal` did on cribriform — the five-entries-across-four-organs projection holds.** LCC: kept `active:false` with a below-floor `blurb`+trials row, generalizing the mechanism (built for `psignet`/`pmuc`'s incidence-floor rarity) to a **categorically different reason — definitional/diagnostic instability**, triangulated three independent ways (Rekhtman 2013's IHC-reclassification finding calling classic LCC an "endangered species"; direct re-confirmation that Brainson 2021's own 5-histotype SEER schema carries no LCC category at all; a live ClinicalTrials.gov check where all 6 kept results for "large cell lung carcinoma" were specifically LCNEC, none classic/NOS).

**A new trials-filtering primitive, `excludeIf`, built after live testing — not reasoning about the regex — caught two real same-string negation bugs before they shipped.** LUSC's `requireAlso: ['prostat']`-style organ-anchor sufficed for the positive match, but a live 10-result sample caught "squamous" matching its own negation inside "Non-Squamous NSCLC" — fixed with `excludeIf: ['non-squamous','non square']`. SCLC's collision was a different shape entirely (not cross-organ vocabulary sharing): "small cell lung cancer" is a literal substring of "non-small cell lung cancer," with every component word still individually whole-word-bounded — no positive anchor can ever separate them — fixed the same way. A third, unrelated live-caught gap: a real SCLC trial named only by the bare acronym "SCLC" (no spelled-out "small cell"/"lung") was being wrongly dropped — the exact seminoma-bug shape recurring, fixed by adding `'sclc'` to `conditionKeywords`. `filterByCondition` in `js/trials.js` gained a 4th parameter; `.claude/trials_mapping_check.mjs` gained `excludeIfPositiveControl` (tested against the entry's own narrow-query corpus, mirroring `requireAlsoPositiveControl`'s parent-corpus test). All three fixes re-verified live in the browser post-fix, not just in the checker.

**The extent-monotonicity check (`.claude/extent_monotonicity_check.py`) needed no new work for lusc/sclc, and this was confirmed by running it live rather than assumed.** It validates a different statistic than `EXTENT_STATUS.shares` (5-yr SURVIVAL-by-stage from a live SEER page, not the Brainson-2021-sourced stage-AT-DIAGNOSIS distribution already wired) and operates per-PAGE, not per-histology: `luad`'s existing `ENTRIES` row already points at SEER's combined `lungb` page (there is no subtype-specific SEER Stat Facts page for lung histologies), and the checker's own de-dup means a new `lusc`/`sclc` row would test nothing new. Run live: `lungb` reports monotonic (65.5%/38.2%/10.5%), the only inversion anywhere in the 13-page corpus being the already-known GBM one — confirming the extent axis carries real meaning for this site.

**The gate chain found five more real, worth-reading things, all resolved rather than bypassed or silently declared away.** (1) A new `duplicate_figure_check` flag — SCLC's own nuclear-molding (95%, 35/37) and naked-nuclei (89%, 33/37) figures share a template from one cohort (Ng & Li 2024, n=37) — read and declared permanent, the same "two different quantities on one shared template" class as ten prior flags. (2) **Nine genuinely stale `citations.json` backfill pointers into `js/organs/lungs.js`**, from my own insertions shifting every line below them — each remapped by diffing the actual hunk boundaries and confirming by exact content match against both the old (HEAD) and new file text, NOT by trusting the tool's own nearest-candidate hint blindly (one hint, for a Frankell-2023 ref, was concretely wrong — it suggested the same line for two different stale refs that actually belonged 8 lines apart). (3) `citation_head_check` needed two new `WELL_FORMED` declarations: `Cittolin-Santos` (a real hyphenated surname) and `NCI PDQ` (a real organizational source name, not a personal author, matching the `Heidi Schlehlein` "not a paper" precedent). (4) **`citation_paren_ledger` produced its first-ever real FALSIFIES verdict, and it taught a load-bearing lesson about the tool's own semantics**: a stray "2015" in a Bronchi-hotspot-adjacent comment (`the WHO 2015 classification...`) sat close enough after `Sabbula et al., StatPearls, NBK564510` with no intervening citation head that the extractor misattributed the year to Sabbula (whose real citation has none). Scoring this as a permanent, declared FALSIFIES entry turned out to be the WRONG remedy — reading the tool's own `evaluate()` code showed a `scored=='FALSIFIES'` entry is "not a disposition the battery will carry": it reports as a standing, un-silenceable problem on every future run until the rule is fixed, narrowed, or the record is restored by hand. Restored by hand instead — one word removed from the comment (the year is still correctly stated two lines later, attached to Travis et al.) — which is the cheaper and more honest fix once the mechanism was actually understood rather than assumed from its own header prose. (5) Removing that record shrank the citation ratchet by exactly one (614→613, and `pointer_check.pointer.pointers_code` by one to match) — a real, deliberate, justified lower, applied via `--lower-ratchet` with a full reason, not a silent edit.

**A NEW use of the `regress.js` `KNOWN_FAILURES` declaration mechanism — the first one ever, in a project where that list had been empty since it was built.** LUSC's histology draws exactly 2 features (Keratin pearl, Intercellular bridges), one short of the `>=3` floor `regress.js` checks for every cancer. Checked directly against the primary source (StatPearls NBK564510) before declaring rather than assumed: its own Pathophysiology section names exactly these two features as what defines a transformed squamous cell, and the WHO's third variant (basaloid) is defined by an ABSENCE of squamous differentiation — a plain sheet with no positive, separately-drawable architecture, which is why it's named but not drawn (matching LUAD's own precedent for its two undrawn growth patterns). Declared with a full reason rather than forcing a fabricated third feature just to clear the count — the SMALL-POPULATION INVARIANTS note in CLAUDE.md had already flagged this exact floor as "shaped to today's authoring, not a rule."

**A repeat instance of a known failure class, caught and fixed same-session rather than left standing.** The gate ran `--lower-ratchet` mid-run, which writes the LOWERED state to `record_count.json` on disk — but that write happens AFTER `commit_checked.sh`'s own pre-run "nothing tracked is unstaged" check, and nothing re-stages the file before `git commit` fires. The main content commit (`175c104`) landed with the STALE, pre-lower `record_count.json` (614, Sabbula still listed) even though its own quoted DONE line correctly said "614->613 LOWERED." Caught by directly diffing `git show HEAD:...` against the working tree rather than trusting the commit succeeded cleanly just because it exited 0 — this is the same "gate the tree you're committing, not the tree you're working in" class CLAUDE.md already documents an instance of (the `internal_quote_check` untracked-draft incident) and the same "two halves can disagree" class from the fifth-property incident (`1145d01`/`7de8f07`) — a third live instance of a documented recurring failure shape. Fixed forward with a same-session follow-up commit (`625fa99`, since amend is forbidden here) that stages only the corrected `record_count.json` and re-runs the gate to confirm 613 now holds steady with zero further drift.

**Live-verified in the browser at every stage, not just gate-verified**: the Bronchi hotspot text extension (now naming both squamous and small-cell origin); the Lungs cancer list (LUAD/LUSC active with explore links, SCLC active, LCC below-floor with a working live Trials toggle showing real LCNEC-focused ClinicalTrials.gov results); LUSC's full site map (Bone/Brain/Liver/Adrenal gland)/cell mutation panel (TP53 trunk, CDKN2A branch at Bone)/histology (keratin pearls + intercellular bridges, correctly rendered)/site-level trials toggle (excludeIf correctly dropping 8 non-squamous results live); SCLC's full site map (Mediastinal lymph nodes leading, matching its own real distribution)/cell mutation panel (TP53+RB1 trunk, MYCL branch)/histology (nuclear molding + naked nuclei + necrosis, confirming the zero-new-code reuse visually). Zero console errors throughout.

**Gate chain, two commits, both clean, both verified in a fresh isolated detached worktree, both pushed under one one-use grant.** `175c104` (the full Lungs authoring pass + the `excludeIf` mechanism + all five gate-driven corrections above, battery 16/16 declared instruments, `regress` 236 checks/1 declared failure/0 undeclared, 0 problems) and `625fa99` (the record_count.json sync fix, `regress` correctly SKIPPED — no served-asset bytes touched). Verified independently: the sync-commit worktree confirmed the ratchet holds at 613 with 0 problems; a SECOND worktree checked out directly at `175c104` (needed specifically because `regress.js`'s skip-heuristic only diffs `HEAD~1`, and the sync commit's own diff touches no served assets) ran the real ~15-minute browser suite end to end against a locally-started static server, confirming the one declared failure and nothing undeclared. `deploy_check.js` hit the standing propagation-delay shape on the first check (5 files NOT PUBLISHED, all inside the pushed changed-set) and resolved clean on one ~90s wait: `29/29 assets byte-matched to HEAD 625fa99, 31 hotspots live, 0 problems`.

**CURRENT HEAD = origin/main = `625fa99`**, tree clean apart from the same pre-existing untracked model-asset scratch files at the repo root (unchanged, still not this session's concern — re-verify live). **This closes the user's full four-item work order.** **Standing open items, none started this round:** (1) the remaining 32 of the measured 35 staged Phase C entries beyond prostate's five and Lungs's three — not touched; (2) blood cancers' navigation-model decision (organ-centric browsing cannot reach leukemia) — still undecided; (3) LCC's below-floor state is final, not pending — no further research is expected to change the definitional-instability finding.

## NINETEENTH FOLLOW-UP (2026-09-13): the user's four-item review of Lungs closed (negation class mechanized, `belowFloorReason` field, `commit_checked.sh`'s guard hole diagnosed and fixed); breast ruled histologic-axis; IDC-NST and ILC authored end to end — `630e8dd`

**Phase B — the review's four items, all closed before any breast work started.** (1) `negationCollisionSignal()` built in `.claude/trials_mapping_check.mjs`: scans every entry's own parent corpus for a distinct condition string where "non-"/"no " sits literally, immediately adjacent to that entry's own `conditionKeywords` (word-boundaried on the SPECIFIC keyword text, not "contains non- anywhere" — a flawed first draft produced 22 false positives on lusc, all the "Squamous Non-Small Cell..." shape, before being tightened). Run across all 26 wired entries, it found the SAME live bug shape in five more already-shipped entries nobody had re-sampled since authoring: `luad`/`acinar`/`crc`/`melanoma`/`seminoma`, each fixed with a new `excludeIf` term. **A real, disclosed limitation found by hand the same day, on seminoma**: the scan missed "Metastatic Malignant Testicular Non-Seminomatous Germ Cell Tumor" because the negation attaches to "Seminomatous" (a morphological variant of the keyword "seminoma," not its exact text) and because the keyword actually responsible for the keep is "germ cell," a different keyword than the one the negation touches — the scan tests one keyword's own exact text against strings that positively match THAT keyword, so it can't yet see a negation attached to a variant or to a sibling keyword. Written into CLAUDE.md as a standing, REQUIRED (not practiced) rule: live-run the checker AND live-sample ≥10 real results by hand, every time, because all four negation bugs found this session were authored, read back, and judged correct by a human before shipping — reading the list has a perfect failure record; only running the query catches these. (2) `belowFloorReason` (`'rarity'` | `'definitional-instability'`) added as a new entry field, rendered as a `.cr-floor-reason` chip in `renderCancerList()` above the share line, two fixed accuracy-over-drama labels — `pmuc`/`psignet` get `'rarity'`, `lcc` gets `'definitional-instability'` — flagged as certain to recur (2021 WHO CNS reclassification, MDS/MPN boundary named as the next likely instances). (3) **`commit_checked.sh`'s "gate the tree you're committing" guard hole precisely diagnosed, per the user's own explicit item-4 question**: the unstaged-tracked-files check ran exactly ONCE, before the gate, so a gate that legitimately mutates a tracked file mid-run (`battery.py --lower-ratchet` writing `.claude/record_count.json`) escaped detection entirely — the exact mechanism the user predicted. Fixed with a `KNOWN_MACHINE_STATE` re-staging loop (record_count.json/reach_unreached.json/refusals.log, generalizing the pre-existing refusals.log-only special case) plus a backstop refusal for anything mutated OUTSIDE that known set. **Self-caught while building the regression test for this fix**: the first draft of the new selftest arm used a RELATIVE path inside a wrapped gate command, and because `run_checked.sh`'s own `cd "$DIR"` resolves to the REAL repo (not a selftest's scratch repo), it ACTUALLY CLOBBERED the real repo's own `.claude/record_count.json` with test data — caught via `git status`/`git diff`, restored immediately via `git checkout`, then every affected selftest arm (including one pre-existing, previously-benign instance) rewritten to use absolute `$scratch`-based paths.

**Phase C — breast ruled histologic-axis (the user's own "Option 1," with reasoning supplied): a molecular/receptor-defined category earns a top-level entry only when it carries a distinctive, schema-renderable morphologic phenotype — never merely by organ-list convention.** Luminal A, Luminal B, and HER2-enriched retired from the staged list (never to be authored as rows) and folded into TRUNK_IDC's own trunk-mutation note as named prose — "breast cancer's four intrinsic molecular subtypes — Luminal A, Luminal B, HER2-enriched, and Basal-like... none carries a distinctive H&E architecture... so they live here... rather than as drawn entries of their own" — the same treatment thyroid's BRAF-like/RAS-like framing already established (data rule 27), not a new pattern. TNBC is grandfathered on the criterion, not despite it: its own drawn histology (solid sheets/necrosis/TILs) and cited branch mutations are real morphologic/genomic facts, not an IHC readout restated as a row. **Invasive breast carcinoma of no special type (IDC) staged and authored in full — corrected mid-session on an explicit naming instruction**: first shipped as "Invasive ductal carcinoma (no special type)," then renamed everywhere reader-facing (cancerEntries.name, cancerDetails title/screenLabel, the histology intro) to lead with the WHO-current term with IDC as the familiar parenthetical alias, per the user's own explicit correction — "name IDC by its current term... use that with IDC as the familiar alias, not the reverse." Mutation ledger: TP53 trunk (~44%, Ciriello 2015 — "most common of several," LUAD-KRAS-shaped, not a near-universal founder), PIK3CA/GATA3 branch pair, HER2/ERBB2 amplification in the private pool (the organ's "usual" HER2 mechanism — gene-dosage amplification, the deliberate opposite of ILC's own HER2 mechanism below). Histology (`genIDC`): irregular glands + trabecular cords + nuclear pleomorphism, deliberately drawn at the OPPOSITE, moderate-grade end of the same real spectrum from TNBC's own high-grade slide.

**ILC authored in full, and its histology family-fit question — required to be answered BEFORE drawing anything, per the user's own instruction — resolved as PARTIAL reuse, confirmed live.** `drawSingleFileCord` extracted from `genGDiffuse`'s pre-existing inline "indian-file" loop (gastric diffuse-type's own CDH1-loss single-file architecture) into a shared primitive in `js/histology.js` — zero-new-drawing-code reuse for the cord itself, the SAME mechanism drawn a second time in a second organ, confirming this atlas's histology-family reuse discipline for the second time (after `pductal`'s own cribriform/frond reuse). ILC's own "targetoid" composition (single-file cords radiating concentrically around a residual duct) is genuinely NEW — built from existing primitives (`drawGlandRing` + the new shared cord function), not zero-new-code, and reported to the user as exactly that split rather than rounded to either extreme. Mutation ledger, every gene checked for mechanistic fit and direction before use, not just frequency: CDH1/E-cadherin loss trunk (~90–95% by any mechanism vs ~63–65% by DNA mutation specifically — a real, disclosed counting-rule split, Ciriello 2015 vs Desmedt 2016, with a genuine cross-paper disagreement on CDH1 promoter hypermethylation stated rather than smoothed over); PIK3CA/ERBB2-kinase-domain-mutation as a MUTUALLY EXCLUSIVE branch pair (Ciriello 2015's own MEMo pathway analysis — both converge on Akt signaling), the same GBM/prostate-style two-sites-each split, not independent co-occurring genes; TBX3/FOXA1 private pool. **Three real "checked and not found/wrong-direction" catches, each recorded rather than silently guessed around**: GATA3 is real and ILC-adjacent in casual reading but is actually IDC-ENRICHED (13% IDC vs 5% ILC, the opposite direction a naive read would assume) — excluded from ILC's pool, modeled at IDC's Liver/Brain sites instead; ESR1 activating mutation could not be pinned to a clean, ILC-specific, primary-source figure — not used, rather than guessed; Mathew et al. 2017's own bone-metastasis elevation for ILC does NOT survive hormone-receptor-status adjustment (an ER+-disease artifact, not truly lobular-specific) — ILC's site model uses the four sites that DO survive adjustment (Liver/Lung/Ovary/GI tract), explicitly excluding bone despite it being ILC's single most common RAW site. `ORIGIN_HOTSPOT_ENTRY.ilc = 1` (Lobules) added as a new per-entry override (IDC needs none, matching the organ default of Ducts).

**A background citation-verification agent, run specifically because two of the share/origin citations were provisional (a lost earlier research report, not independently checked), caught two real mis-citations before they shipped.** Both "Probert et al., 2025" (IDC's ~73% share) and "Giaquinto et al., 2025" (the 4% mixed-ductal-lobular note) turned out to be real, findable papers — but ILC's own "10.6%" share had been wrongly attributed to Probert (whose own ILC figure is 10.7%, not 10.6% — the 10.6% belongs to Giaquinto's own separate paper), and the TDLU-common-origin claim (both ductal and lobular carcinoma arise from the same terminal duct-lobular unit) had been attributed to a real paper ("Unuofin et al., 2026") that does NOT actually make that specific comparative claim — the agent found the correct source (PathologyOutlines, Rakha & Tozbikian) stating it near-verbatim. Both fixed: IDC's share now cites both Probert (73.3%) AND Giaquinto (78.0%) as a real, disclosed cross-cohort range rather than picking one; ILC's share does the same (10.6%/10.7%); the Ducts hotspot's TDLU sentence now cites Rakha & Tozbikian directly, quoting "does not reflect the histogenesis of these tumor types" verbatim.

**Breast's declared share-sum non-partition — the user's own explicit item-2 instruction — was written, then REMOVED as stale once real numbers landed, and this is a correct application of the ratchet discipline, not a reversal of the ruling.** The user's instruction (before real figures existed) predicted the check would flag a gap and need an explicit exemption; once TNBC (~10–20%) + IDC (~73–78%) + ILC (~10.6–10.7%) were actually written in, `share_sum_check.py`'s own arithmetic landed COHERENT at ~101.2 by pure numeric coincidence — the family still doesn't structurally partition (TNBC and IDC-NST genuinely overlap), but the check no longer flags it, and `tolerated.py`'s own STALE-declaration rule (a declared exemption for a flag that no longer fires is itself a problem, not a safety margin) required removing the declaration rather than keeping it "just in case." The underlying structural fact is preserved in three places instead: the retirement comment above `cancerEntries`, `phaseC_design.md` §17, and — genuinely new this round, since it had been documented as intended but never actually written — a real sentence in the organ's own reader-facing `organDetail.desc` ("triple-negative is defined by receptor status, while invasive ductal and invasive lobular carcinoma are defined by histologic architecture, and a real tumor can be both").

**Five more real, gate-caught findings, all fixed rather than declared around, plus one investigated-and-stepped-over ratchet blip.** (1) `absence_claim_check` flagged TWO unscoped claims in the new content — TBX3's "no documented conflict with this cancer's own trunk or branch genes" (an unscoped existence-verb claim never actually researched; the honest fix was deleting the unsupported claim entirely, not adding a fake scope) and CDH1's "every other breast-cancer histologic pattern" (a universal quantifier over the whole atlas; rescoped to name the two specific sibling entries this organ actually has). **A real process near-miss caught only by checking `$?` directly rather than trusting a "0 problems" printed line**: this checker's exit code is `1 if (bad or problems_t) else 0` — raw DEFECT counts are unconditionally fatal with NO declare-your-way-out mechanism, separate from the tolerated-count problems the printed summary foregrounds, so a first pass that only fixed one of the two DEFECTs still exited 1 while printing "0 tolerated-count problems," which reads as clean if you don't check the actual exit code. (2) `duplicate_figure_check` flagged IDC-NST's PIK3CA rate (33%, 164/490) against ILC's PIK3CA rate (48%, 61/127) as probable drift — both real, both from Ciriello 2015's own two separate histologic-subgroup analyses, the deliberate cross-entity contrast the branch-gene design depends on — declared permanent with reason. (3) `pointer_check` found real, run-of-the-mill line drift across THREE files (breast.js from the giant new-content insertion, plus lungs.js and prostate.js from the EARLIER `belowFloorReason` one-line insertions, never previously re-verified against citations.json) — all traced by direct byte-identical content matching against HEAD, not the tool's own nearest-candidate hints (which were right most of the time but wrong at least once, exactly matching this project's own standing "NEAREST IS NOT IDENTITY" caution). **One of these was a LIVE, FUNCTIONAL dict key inside `citation_paren_ledger.py`** (`'Travis|2011|js/organs/lungs.js:276'`, already re-addressed three times across two prior sessions) — re-addressed a fourth time to `:277`, confirmed byte-identical, basis kept as FIT (re-addressing is not new evidence, per that file's own standing rule). (4) A citation_crosscheck-adjacent stale hand-typed line number inside `citation_crosscheck.py`'s own `DECLARED_UNMAPPABLE` reason string (the Gao/breast.js citation) was ALSO found and fixed to match, twice, as breast.js kept shifting under later edits — not caught by any instrument, found by direct verification while chasing the pointer-drift class more broadly. (5) **A `citation_crosscheck.records` ratchet shrink (246→245) was investigated exhaustively rather than either dismissed or blindly stepped over**: every breast.js content edit made after the 246 measurement was reverted byte-for-byte in a scratch copy and re-measured (still 245); a full-corpus (pmid,ref) key-set diff between that reconstructed 246-state and the current tree came back EMPTY (169/169 identical) across every file, not just breast.js; four consecutive live re-runs on the current tree all reported 245 stably. Conclusion: the corpus has 41 PMC/DOI identifiers needing live NCBI network resolution per run, and this matches the tool's own already-documented transient-network-resolution failure class (its own header's 141/142/143 episode) — one extra id resolved successfully on the FIRST run only, not reproducible since. Stepped over via `--lower-ratchet=citation_crosscheck.records:245` with the full investigation quoted as the reason, per the tool's own instructed remedy for a genuinely transient (not content-driven) decrease.

**A real, live-caught HTML-escaping bug found during browser verification, not by any gate instrument.** The Ducts hotspot's rewritten text used `&amp;` (correct for the HTML-file disclaimer, which renders via `innerHTML`) inside a `js/organs/breast.js` `text:` field that `showOrganInfo()` actually renders via plain `.textContent` — so it displayed literally as `&amp;` on screen instead of `&`. Found by reading the live rendered page, not by inspecting source; fixed to a literal `&` character, matching the one other pre-existing ampersand in this same file (the facts-panel `val:` field, which DOES render via `.innerHTML` and correctly needs the entity form) — confirming the two rendering paths in this file genuinely need opposite escaping conventions and that distinction is easy to get backwards without live-checking.

**Live-verified in the browser at every stage, not just gate-verified**: the Breast organ screen (Ducts/Lobules hotspot text after the TDLU/E-cadherin rewrite, the three-row cancer list with correct share text, the per-row mass-preview badge swap on hover distinguishing tnbc's `'uncharacterised'` from idc/ilc's `'unread'` margin status); IDC's full site map (Bone/Lung/Liver/Brain)/cell mutation panel (TP53 trunk, GATA3 branch)/histology (irregular glands/trabecular cords/nuclear pleomorphism, correctly rendered with the WHO 6th ed./Elston & Ellis citation footer)/trials (a real, disclosed, LIVE-CONFIRMED false-positive — an ILC-exclusive trial with only generic AJCC-stage tags alongside its lobular-specific one, exactly matching the documented same-string-exclusion limitation); ILC's full site map (Liver/Lung/Ovary/GI tract, correctly labeled "hormone-receptor-adjusted")/cell mutation panel (CDH1 trunk, ERBB2-kinase-domain branch at Ovary)/histology (targetoid pattern + single-file cords + discohesive cells, correctly rendered with the StatPearls/PathologyOutlines/Iorfida citation footer)/trials (correctly keeping the same trial ILC's own live sample legitimately wants). Zero console errors throughout; one real network-request artifact (`assets/breast.glb` showing `net::ERR_ABORTED`) traced to my own repeated force-reloads interrupting an in-flight fetch during testing, confirmed harmless via one clean, uninterrupted navigation.

**Gate chain, one commit, three full passes before it went clean, verified in a fresh isolated detached worktree, pushed under a one-use grant.** `630e8dd` (battery 16/16 declared instruments, `regress` 249 checks/1 known-declared failure [the pre-existing lusc-histology exception]/0 undeclared, 0 problems). Re-verified independently in a clean detached worktree at `630e8dd`: `syntax_check` clean, and `node .claude/regress.js` run directly and unconditionally (not the diff-scoped skip-heuristic) against a freshly-started isolated server on a scratch port, confirming exit 0 with only the same one declared failure. `deploy_check.js` needed one standard ~30s propagation-delay retry: `29/29 assets byte-matched to HEAD 630e8dd, 31 hotspots live, 0 problems`.

## TWENTIETH FOLLOW-UP (2026-09-13): the review of the nineteenth closed the citation-verification rule and the trials-mapping rule as REQUIRED (not practiced); stomach's `gint`/`gmix` and thyroid's `mtc`/`atc` authored end to end in one round, explicitly run as a test of whether the machinery needs new mechanism — `9c0d41b`

**The user's review of the nineteenth follow-up made two standing practices REQUIRED rather than practiced, both now written into CLAUDE.md as their own sections**: (1) live-running every `TRIALS_CONDITION_MAP` mapping (`.claude/trials_mapping_check.mjs` plus a hand-read ≥10-result sample) before any entry ships — the seminoma bug, the `\bprostat\b` dead-stem bug, LUSC's "Non-Squamous" bug, and SCLC's substring-negation bug are FOUR found-by-running, ZERO found-by-reading; (2) an independent citation-verification pass (re-derive every genuinely new citation from its primary source, not just confirm the paper exists) before any new content ships — the breast round's own verification agent had just caught a real share misattribution and a real wrong-source TDLU claim on its first outing. The user then also flagged that a SECOND unexplained `citation_crosscheck.records` movement must be treated as an instrument defect, not stepped over again — did not recur this round (see the ratchet incident below, which is a DIFFERENT metric, fully explained, not stepped over blind).

**The work order, and the explicit test framing**: "Stomach and thyroid next, in one round, and the round is a test... report one additional thing at the end: did this round require a new mechanism or a new ruling?" Four entries: `gint` (intestinal-type Lauren), `gmix` (mixed-type Lauren), `mtc` (medullary), `atc` (anaplastic) — plus an explicit check that the Lauren three-way share-sum holds exactly, an origin-axis test for `mtc` (does it need only an override, or nothing at all), and a histology-family-fit report for `atc` (partial reuse like ILC's targetoid pattern, or genuinely bespoke).

**THE DIRECT ANSWER TO THE TEST: one small, real, but MINIMAL ruling was required — a third `belowFloorReason` value, `'compositional'`, extending an existing mechanism via one new label rather than building new machinery.** `gmix` (10.9% of gastric cancers — not rare, not a dissolving diagnosis) fails to clear full authoring for a genuinely different reason than the mechanism's first two (`'rarity'` for psignet/pmuc, `'definitional-instability'` for LCC): its own defining fact is being a hybrid of the other two Lauren types, so no single molecular/histologic profile exists FOR IT as its own category — the closest real characterization is describing how its two components diverge, which a dedicated multi-region-sampling study (Drebin et al., 2025) directly demonstrated. `js/main.js`'s `BELOW_FLOOR_REASON_LABEL` gained one entry; `gmix`'s `cancerEntries` row gained `belowFloorReason:'compositional'` and a `blurb` built from three independently-verified findings (Drebin 2025's real component-heterogeneity finding; Moore 2022's survival-resembles-intestinal finding; Choi 2020's early-stage LNM/LVI-exceeds-both-pure-types finding, with the genuine tension between the latter two explained by different populations/endpoints rather than flattened). Everything else — REGIONS/TRUNK/PRIVATE_POOL/HISTOLOGY structures, the branch-pair architecture, the site model, the MARGIN/GROWTH/EXTENT axes, the trials-mapping method — reused already-established patterns with zero new mechanism. **This is the reassuring shape the test was designed to surface: the machinery keeps absorbing new real shapes by adding a REASON LABEL, not new plumbing.**

**`gint` (intestinal-type, active:true):** dual-trunk CIN-status (~50% of TCGA's cohort) + TP53 (71% within CIN) — reused already-verified content from `gdiff`'s own file, with the Lauren-association framed as an inference from the ALREADY-cited diffuse-side fact (GS subtype enriched for diffuse, 73%) rather than a separately-quoted TCGA sentence about the intestinal side (independently verified: no such direct sentence exists in TCGA 2014's text). Branch: HER2 (ERBB2) positivity at 2 sites (He et al. 2013 — real, Lauren-tied: 28.57% intestinal vs 13.43% diffuse/mixed, P=0.0103) + CCNE1 amplification at 2 sites, modeled as COOPERATING not competing (independently computed on TCGA's own deposited dataset: Log2 OR 2.22, q<0.001 — validated by first reproducing TCGA's own printed 17% ERBB2-amplification figure exactly). Sites reuse `gdiff`'s own Riihimäki 2016 overall rates (Liver 48%/Peritoneum 32%/Lung 15%/Bone 12%), disclosed as a proxy since the source never stratifies by Lauren type, with Liver/Peritoneum additionally carrying the paper's own "other adenocarcinoma" (non-signet-ring) comparator rate as closer, still-imperfect corroboration. Histology: gland-forming architecture reusing `drawGlandRing` (genCRC's own primitive) at FULL REUSE, plus one genuinely new decoration (a small polarized-cap goblet cell, distinct from the diffuse-type generator's whole-cell signet-ring vacuole) — a real third-tier partial-reuse case. **Real defects the required citation-verification pass caught before shipping**: CDK6's originally-reported ~1% amplification figure was off by roughly eightfold (real rate ~7-9%, independently re-derived); CCND1 and CDK6 were both originally going to be modeled as cooperating with ERBB2 alongside CCNE1, but only CCNE1 has statistically significant co-occurrence (CDK6 trends positive but n.s., q=0.785; CCND1 trends toward EXCLUSIVITY, q=1.00 — the wrong direction entirely) — both dropped from the ledger on this finding, not shipped with an invented relationship. HER2's own wording was corrected from "amplification" to "positivity (IHC3+ or FISH)" per the source's own definition.

**`gmix` (mixed-type, below-floor):** see the ruling above. `TRIALS_CONDITION_MAP` reuses `gdiff`'s own broad query verbatim (live-tested first: a narrower "gastric mixed type adenocarcinoma" query returns almost entirely off-topic basket trials, confirming the registry's own Lauren-blindness rather than assuming it).

**`mtc` (medullary, active:true) — the origin-axis test answered directly: NOTHING was needed, not even an override.** Thyroid's existing default `ORIGIN_HOTSPOT` anchor (index 1, "Right lobe") already has text stating MTC's real C-cell origin directly ("medullary carcinoma arises from C cells, which is why it behaves nothing like the follicular-cell cancers this atlas maps") — independently re-verified verbatim against StatPearls NBK459354. No `ORIGIN_HOTSPOT_ENTRY.mtc` was added; the organ's own default already fully serves this cancer, which is the origin axis doing exactly what it was designed for. Trunk: RET alteration by two real, distinct routes in one hedged entry (germline ~100% of the ~25% hereditary subset by definition; somatic 43-60% of the ~75% sporadic subset across independent cohorts). Branch: RET (somatic-recurrence framing) at 2 sites + RAS (the real, mutually-exclusive RET-negative alternative, genuinely disputed 17.6-81.25% range across three cohorts) at 2 sites. Sites: a dedicated MTC-specific cohort (Park et al. 2021, N=46) — Lung/Bone/Mediastinal-nodes/Liver — carrying a real, disclosed, UNRESOLVED prognosis disagreement at the Bone site (Park's own cohort: bone = worse prognosis, HR 5.42; a larger pooled SEER cross-subtype study: bone = favorable for MTC/FTC, p<0.001 — stated as a real disagreement between a dedicated cohort and a pooled one, not resolved either way). Histology: nested/organoid clusters of polygonal cells with amyloid-filled septae — a genuine third-tier PARTIAL reuse (no shared "nested" primitive existed yet; built directly from the same blobPath/cell vocabulary; the amyloid fill reuses `drawFrond`'s own existing hyaline-pink color pairing for a different amorphous eosinophilic deposit — a real, justified reuse, not arbitrary). Calcitonin/CEA are stated in the trunk note's own prose, never a ledger row (no genetic mutation — same treatment as GBM's MGMT). MARGIN/GROWTH/EXTENT axes ALL landed `cited` on real, directly-relevant sources that fell out of the same research pass (StatPearls' own "well-circumscribed... unifocal (sporadic); bilateral and multifocal (hereditary)" sentence, and — checked directly rather than assumed absent — Aschebrook-Kilfoy et al. 2011's own Table 3, already cited for `ptc`/`ftc`'s EXTENT axis, turns out to ALSO carry medullary and anaplastic rows).

**`atc` (anaplastic, active:true) — the histology-family-fit test answered directly: genuinely BESPOKE, the third tier, confirmed both by code-level analysis and by live visual inspection.** Checked directly against every existing generator in `js/histology.js` before writing: every prior "spindle" shape in the file (`genCRC`'s desmoplastic stroma) is a reactive stromal FIBROBLAST in the background, never the tumor population itself, and — a real, more precise finding caught by the now-required citation-verification/absence-claim discipline — `genGBM`'s own pseudopalisading rim ALREADY draws elongated, genuinely spindle-shaped tumor-cell NUCLEI (rx:5.4/ry:2 ellipses), just with no matching spindle-shaped CYTOPLASM/cell body around them. The precise, correct claim is about spindle-shaped CELL BODIES, not nuclei — this atlas's first tumor built from them. New primitive: interweaving spindle-cell fascicles (some crossing near right angles, one storiform whorl), admixed multinucleated giant cells, and a small admixed (never pure) squamoid/epithelioid nest — matching Suster et al. 2026's own 144-case finding that WHO's three patterns "occur alone or, far more often, admixed." Dual-trunk TP53 (73%, real 27-73% cross-cohort range explained directly by the source paper's own purity/depth argument) + TERT promoter (73%, a fourth distinct temporal-trunk sub-shape: rare and SUBCLONAL in antecedent PTC, CLONAL and near-universal only upon transformation — acquired during, not inherited before, the transformation step). Branch: BRAF V600E vs RAS, mutually exclusive, split 2 sites each — WITHOUT the tempting-but-unsupported "BRAF means PTC-lineage, RAS means FTC-lineage" precursor claim, since Landa et al. 2016's own larger finding is that this correlation is "largely lost" by full anaplastic transformation (independently re-verified verbatim). A real, checked-and-excluded finding stated rather than omitted: RET fusions and PAX8-PPARγ (this organ's own PTC/FTC founding events) do NOT carry forward into ATC at all. Sites: a dedicated autopsy series (Besic & Gazic 2013, N=45) — Lung/Liver/Brain/Bone — with the autopsy-bias caveat stated directly ("two or more metastatic sites... in 84% of cases"). EXTENT axis reused the same Aschebrook-Kilfoy 2011 Table 3 finding as `mtc` (localized 7%/regional 42%/distant 43%/unknown 8% — this entity is overwhelmingly found beyond confinement, matching its own real aggressiveness).

**Verification agents, three separate ones, matching the newly-required rule exactly — every single one found something real:** (1) gint's molecular claims — corrected the CDK6 figure (~8x wrong), corrected the CCND1/CDK6 cooperation claim (statistically unsupported for both), corrected HER2's wording ("positivity" not "amplification"), confirmed CIN/intestinal is an inference not a direct TCGA quote. (2) gmix's characterization claims — confirmed the core heterogeneity finding verbatim, caught that the SMAD4-enrichment finding (real, but for a DIFFERENT subgroup — Drebin's own "proximal-intestinal," not mixed-type at all) would have been a genuine misattribution if used, corrected the Choi citation to the right paper (PMID 31445508, not an initial guess), and found an unprompted independent corroborating source (Pyo et al. 2017) for the LNM/LVI finding. (3) thyroid's spot-check — 4 of 5 sources fully verified with no corrections; one wording softened (Quiros 2005 shows histologic co-occurrence of a BRAF-mutant PTC component, not independently-sequenced proof of the identical mutation in that component).

**Two real, live-caught trials-mapping collisions, exactly the shape the newly-required rule exists for — found by running, not reading, per `.claude/trials_mapping_check.mjs` plus a live 10-result browser sample each:** `mtc`'s bare `conditionKeywords:['thyroid']` would have falsely kept "Non-Medullary Thyroid Cancer" (a real trial naming this organ's OTHER three entries' population, explicitly EXCLUDING medullary) — fixed with `excludeIf:['non-medullary','non medullary']`, and the fix's own positive control fired on exactly that live string. A second, disclosed-but-not-chased gap: the live corpus contains a registry-side TYPO, "Anaplastic Throid Carcinoma" (missing the "y"), which the filter still misses — recorded as a minor, accepted completeness gap rather than a keyword hunt for a misspelling. `gint`/`gmix` reuse `gdiff`'s own query+keywords verbatim, live-tested first (a narrower Lauren-specific query returns garbage, confirming rather than assuming the registry's own Lauren-blindness).

**A real, fully-investigated ratchet shrinkage, NOT stepped over blind — the standing "second unexplained movement is an instrument defect" warning was about `citation_crosscheck.records` specifically; this is the separate, plain `records` extractor metric, and it got the full investigation this project's own discipline requires before any `--lower-ratchet` is used.** Fixing a real `citation_head_check` extraction artifact ("But Landa" — the word "But" swallowed into the author field from my own prose) by rewording the sentence dropped the raw record count from 715 to 714. Investigated directly rather than assumed benign: both `But Landa|2016|thyroid.js:434` (the malformed key) AND `Landa|2016|thyroid.js:434` (a well-formed key, from that SAME line's separate `ccf` field independently citing the same paper) already coexisted in the prior 715-key stored set — the wording fix made both fields key identically, and `extract_citations.py`'s own dedupe (which operates on exactly this author+year+ref triple) correctly collapsed two artificially-distinct records into the one real citation they always were. Confirmed the citation itself was NOT lost (still present in the post-fix 714-key set) before applying `--lower-ratchet=714` with the full mechanism quoted in the reason string.

**Other real gate findings, all fixed, none stepped over:** three genuine `duplicate_figure_check` false positives declared (gint's HER2 entry legitimately carries two different real p-values from two different comparisons in the same source paper; MTC's and ATC's own branch genes legitimately carry different real per-site metastasis rates on one shared citation template — the same, by-now well-established "real per-site figures on one template" class, not a drifted duplicate). Three genuine `fraction_check` false positives declared (MTC's trunk/branch text packs three distinct real numbers from two papers into one dense field, and the nearest-percent-to-nearest-fraction matcher paired the wrong ones — same established class). Twenty `pointer_check` OFF-LINE flags, all in `.claude/citations.json`'s own backfill pointers into `stomach.js` (one edit — the `cancerEntries`/comment insertion — moved every line below it), re-pointed by re-deriving each target's real new line via the tool's own content-based name+year search (one outlier, `Oncotarget|2016`, had a genuinely different offset from a nearby different occurrence — manually verified by reading the actual line before trusting the tool's own candidate). Two genuine `absence_claim_check` universals resolved: one confirmed true by restating an already-established atlas-wide convention (data rule 2's site-pairing-is-illustrative rule); one corrected in BOTH the user-facing text and the code comment after the GBM-pseudopalisading-nuclei finding above. One `citation_head_check` real compound surname ("Lott Limbach") added to WELL_FORMED after confirming it's the author's real name. One `citation_paren_ledger` new span (`Park|2021`, "Cancers (Basel)" — the journal's own real parenthetical disambiguator, not a shadowed second reference) scored CONFIRMS against the pre-registered rule, matching the Travis|2011 counterexample shape exactly.

**Gate chain: two full passes before clean (5 problems found and fixed in the first full run: duplicate_figure_check ×3, then absence_claim_check/fraction_check/pointer_check/citation_head_check/citation_paren_ledger ×5 more surfaced once those were fixed, then the ratchet shrinkage), verified in a fresh isolated detached worktree (own dev server on a scratch port, `node .claude/regress.js` run directly: 268 checks, 1 known-declared failure, exit 0), pushed under a one-use grant.** `9c0d41b` (battery 16/16 declared instruments, 0 problems). `deploy_check.js` needed one standard ~30s propagation-delay retry: `29/29 assets byte-matched to HEAD 9c0d41b, 31 hotspots live, 0 problems`.

**Standing open items, none started this round:** (1) the remaining ~28 of the measured ~35 staged Phase C entries beyond prostate's five, Lungs's three, breast's two, and this round's four — not touched; (2) blood cancers' navigation-model decision — still undecided; (3) the ATC registry typo ("Anaplastic Throid Carcinoma") — a disclosed, deliberately-not-chased trials-mapping completeness gap, not a defect requiring a fix; (4) per the user's own framing, since this round required only a minimal, existing-mechanism-extending ruling (one new `belowFloorReason` label) rather than new machinery, the remaining organs are now schedulable as a batch rather than negotiated one at a time — awaiting the user's own decision on how to sequence that.

**CURRENT HEAD = origin/main = `630e8dd`**, tree clean apart from the same pre-existing untracked model-asset scratch files at the repo root (unchanged this round — re-verify live before trusting this list). **This closes the user's full Phase B review AND the Phase C breast-axis ruling and IDC/ILC authoring in one round.** **Standing open items, none started this round:** (1) the remaining ~30 of the measured ~35 staged Phase C entries beyond prostate's five, Lungs's three, and breast's two — not touched; (2) `negationCollisionSignal()`'s own disclosed limitation (morphological variants; negation on a sibling keyword) is unfixed by design — any future organ's trials mapping still needs the live 10-sample read, the mechanized scan alone does not discharge the standing CLAUDE.md rule; (3) blood cancers' navigation-model decision — still undecided.

## TWENTY-FIRST FOLLOW-UP (2026-09-13): the five-organ "ordinary-organ batch" — liver, testis, kidneys, bladder, pancreas — closed end to end in one autonomous run, no user present; `9c0d41b` → `38a53ba`

**The instruction, from before this session's own context was compacted:** author five "ordinary" organs (liver/ichol, testis/nsgct, kidneys/prcc+chrcc, bladder/blnec+blscc+bladc, pancreas/pacc+pnet+pcyst) back to back, report per organ without waiting, make my own rulings on any genuine research ambiguity since no user was present to ask, and keep going regardless — brain/skin/colon (each carrying its own named non-ordinary complication, not reconstructed here) come after, not before, the batch closes. All five closed; commits `9afe00e`(liver, pre-dates this segment) → `2884cb4`(testis) → `86359ac`(kidneys, prcc+chrcc) → `8df61c2`(bladder, blnec+blscc+bladc) → `38a53ba`(pancreas, pacc+pnet+pcyst).

**The two rules TWENTIETH made REQUIRED were exercised for real, at full scale, across three more organs — and found something every single time, at a rate that itself is now the headline finding.** Independent citation-verification agents (no memory of authoring, dispatched cold): kidneys found 6 real defects (a mispaired SETD2-PBRM1 quote, a wrong "four" vs three Type-2 subgroups count, an unscoped superlative, a caveat needing a register fix, two absence-claim scope gaps). Bladder found 13 across three entities (a misquoted Ehdaie/WHO attribution, Hurst's copy-number cohort mislabeled as its WES cohort, Ramchurren's 67% EGFR figure being 100% bilharzial-cohort data used unqualified in the Western-form entity, Rose et al.'s PMID pointing at an unrelated butterfly-ecology paper, Akbulut's ASCL1/NEUROD1/POU2F3 percentages computed on the wrong pooled denominator, Shen's misquoted-and-overstated lineage-switching claim, Collazo-Lorduy's non-verbatim quote from an entirely-urachal cohort misapplied to the non-urachal entity, and — the most severe — Gopalan's own histology figures being 100% urachal data used to characterize the non-urachal entity's defining architecture, the exact urachal/non-urachal conflation the entity's own design rationale existed to avoid). Pancreas found 10 more across pacc/pnet/pcyst (Abraham 2002 never actually tests KRAS — its "wild-type" sentence cites *other* papers' prior literature, not its own 21 tumors; Al-Hader's "78 pooled cases" silently double-counts two cohorts already cited separately elsewhere in the same paragraph; a margin quote wrongly attributed to Al-Hader when "encapsulated" in the source paper actually describes a DIFFERENT tumor entity, pancreatoblastoma, in a differential table; a growth-axis quote also wrongly attributed to Al-Hader when it's verbatim La Rosa 2015 — already cited elsewhere in the same entity; chymotrypsin bundled into trypsin's ~95% positivity figure when the one source that quantifies chymotrypsin separately gives 38%; a Peritoneum citation naming a paper that never mentions peritoneum anywhere; a **fabricated quote** in pcyst's EXTENT_STATUS — Ziogas et al. never uses the word "localized," and the claimed >90% figure fails the paper's own arithmetic by a wide margin (max possible ≤84.3% from the paper's own M1/N1 marginals); a GNAS range typo (38% matching neither cited endpoint, should be 48%); a BRAF "cooperating... except two" clause that actually describes two OTHER genes' exceptions, not BRAF's own — BRAF's real rate is a clean 3/3 with zero exceptions; and a tubular-histology quote positioned to look like it came from the wrong one of two adjacent citations). **29 real, independently-caught defects across three organs, all fixed, zero declared-around or skipped.** This is not noise the rule tolerates — it is the rule doing exactly the job it was made required for, and the rate has not dropped as the discipline has scaled from one organ to three.

**Two more standing-rule-shaped things surfaced this round, both already written into CLAUDE.md as data rules 34/35 (see the file directly — not re-derived here):** a same-session shared-browser-tab hazard (a background verification sub-agent with unrestricted tool access silently navigated the interactive Browser pane tab away mid-verification, since sub-agents and the parent apparently share one Browser pane instance in this environment — worked around by re-navigating, not by anything structural; worth remembering the NEXT time live browser verification runs concurrently with browser-capable sub-agents) and a second, real region-ID collision caught by the standing global-uniqueness grep BEFORE it shipped (my own first pick for pcyst's four region IDs, FA/FB/FC/FD, collided with colon.js's existing IDs — caught by re-running the grep after writing the IDs rather than trusting the first pass, fixed to FE/FG/FH/FI).

**Every one of the five organs got the full, identical discipline, not a lighter version for the later ones:** research dispatched fresh per organ (kidneys/bladder/pancreas needed re-research since the original research from earlier in this same session didn't survive an intermediate context compaction — re-gathered rather than reconstructed from memory); histology.js generators checked for reuse-tier fit before any new drawing code (kidneys: `genPRCC`/`genCHRCC`, one new foamy-macrophage primitive; bladder: `genBlNEC`/`genBlSCC`/`genBlADC`, full reuse of existing sheet/pearl/gland primitives; pancreas: `genPACC`/`genPNET`/`genPCYST`, one new granule-dot overlay for PACC, a genuine recomposition of MTC's own nest/chromatin technique into trabecular ribbons for PNET, and a scaled-up recomposition of bladder's own minor mucin-pool technique into PCYST's dominant colloid-pool architecture); morphology.js's three status axes populated honestly per cancer, with real margin/growth/extent findings landing 'cited' where a clean register-matched primary source existed and 'uncharacterised' (with the real finding preserved in prose, not discarded) where the axis genuinely didn't fit the available evidence — PACC's capsular-breach finding and PNET's germline-vs-sporadic population mismatch are both named, sourced, and correctly held out of the formal ledger rather than forced in; trials.js mappings for every new entity, each with a mandatory negation-scan AND a live ≥10-result sample (pnet's own scan caught a real gap — "NET" as a bare abbreviation never matched by the spelled-out "neuroendocrine" keyword, then caught a REAL negation-collision risk in the very same fix — "Extra-Pancreatic NET" would have been wrongly kept by naively adding "net" without an excludeIf, closed before it ever reached a live sample; pcyst's own scan caught two real word-order/spelling variants of "intraductal papillary mucinous" the exact-phrase keyword missed). Every organ's disclaimer clause added to `cancer-atlas.html` at commit time (matching the kidneys precedent), not deferred.

**Every organ's own genuine research ambiguity got a real ruling, not a punt, since no user was present to ask:** kidneys' Type-1/Type-2 papillary RCC molecular-subgroup count corrected from the source's own text once verification caught the discrepancy. Bladder's blscc trunk modeled as a genuine three-way fact-statement ambiguity (TP53/FAT1/TERT, none dominant) rather than forcing a pick. Pancreas needed the most rulings of the batch: pcyst modeled as IPMN-with-associated-invasive-carcinoma specifically (not MCN, not serous cystadenocarcinoma) with a GNAS+KRAS co-trunk (real, documented, NOT mutually exclusive — the atlas's fourth co-trunk architecture after GBM/bladder/thyroid's own precedents); BRAF ruled IN for pcyst's private pool despite being explicitly excluded from this same organ's own PDAC entry — checked individually rather than assumed to transfer, since PDAC excludes it as a KRAS-competing alternative driver and pcyst has no KRAS-only trunk for it to compete against, while CTNNB1 was ruled OUT of the same pool despite real IPMN-specific findings, because it is the near-universal DEFINING driver of a different, unmodeled pancreatic cystic neoplasm (SPN) — the GBM/ATRX-class borrowed-defining-marker risk, judged not worth the modest benefit given real alternatives existed. PACC's trunk modeled as a fact-statement "no single founder" built around a verified ABSENCE (KRAS) rather than forcing a weak single-gene pick among three real but minority alternatives.

**Live browser verification, every organ, every new entity — site maps, mutation panels, histology views, trials toggles, zero console errors — confirmed directly against the rendered app, not assumed from the gate chain alone.** One recurring, now-familiar interaction hazard reconfirmed rather than newly discovered: the 3D viewer's own auto-rotation means a screenshot's coordinates go stale by the time a click lands; resolved every time by re-`find`-ing a live DOM ref (the projected hotspot/cell button) rather than trusting a remembered pixel coordinate — never worth fighting, always worth just re-finding.

**Gate chain: every organ needed at least one real fix-and-rerun cycle before landing clean — none shipped on the first pass.** Recurring, already-cataloged false-positive classes (same-citation-template per-site figures, source-internal rounding mismatches, hyphenated/compound author surnames needing a WELL_FORMED declaration) hit again on kidneys/bladder/pancreas exactly as they hit on every prior organ — declared with the same discipline, not re-litigated. Two genuinely new mechanical traps, both fixed by RESTRUCTURING PROSE rather than declaring an exception: a journal name's own embedded parenthetical ("Medicine (Baltimore)") sitting between an author head and its year, tripping `citation_paren_ledger` the same way a prior session's Jaime-Casas mispairing did — fixed by reordering the citation so the year lands immediately after the author list; and `absence_claim_check`'s own pattern-matcher being tripped by a disclaimer clause I added to try to explicitly rule OUT atlas-wide scope ("not a claim about this atlas's own modeled cancers") — the disclaimer's own words were the trigger, fixed by removing the disclaimer and restating the same fact without any universal-quantifier shape at all. `citation_crosscheck.records` ratchet moved twice, both fully explained and stepped over deliberately (a genuine citation removal for bladder's Collazo-Lorduy fix; a pure reformatting with zero information loss for pancreas's Wang-citation paren fix) — never blind, always with the mechanism quoted in the `--lower-reason`.

**CURRENT HEAD = `38a53ba`, NOT YET PUSHED — re-verify live before trusting this.** Tree otherwise clean apart from the same pre-existing untracked model-asset scratch files at the repo root (colon.glb, digestive_system__human_anatomy.glb, pelvic_organs_from_mri.glb, realistic_human_lungs.glb, realistic_stomach.glb, small_and_large_intestine.glb, stomach-3d-model.webp, tiroides_andrea__dacs_ujat.glb — untouched this round, left alone rather than investigated, matching the standing "don't clean up unfamiliar state unprompted" discipline). **The whether-to-push question was never re-raised this round and remains genuinely open — no new information changes it.** **The 5-organ batch this entry documents is now FULLY CLOSED.** Next, per the batch's own governing instruction: brain, skin, and colon, one at a time, each flagged as carrying its own named non-ordinary complication — but note CLAUDE.md's own data rules already show brain/GBM (rule 7/14) and skin/melanoma (rule 20) and colon/CRC (rule 17) as long-since-active, fully-authored organs in this atlas; whatever the "non-ordinary complication" instruction meant, it most plausibly refers to ADDING NEW MINOR-SUBTYPE ENTITIES to these three already-active organs (the same shape as this batch's own kidneys/bladder/pancreas rounds), not authoring the organs from scratch — but the SPECIFIC complications named for each were in the original governing message, which did not survive this session's own context compaction, and are not reconstructed here. Read CLAUDE.md's own data rules 7/14/17/20 first if resuming this thread cold.
